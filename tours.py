import uuid
from datetime import datetime, date, time, timedelta, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.user import User
from app.models.property import Property
from app.models.tour import AgentAvailability, PropertyTour
from app.schemas.tour import (
    TourCreateRequest,
    TourCancelRequest,
    TourRescheduleRequest,
    AvailabilitySlot,
    AvailabilityResponse,
    TourResponse,
    TourListResponse,
    TourPropertySummary,
    TourUserSummary,
)
from app.api.deps import get_current_user, require_roles

router = APIRouter(tags=["Tour Scheduling"])


def build_tour_response(tour: PropertyTour) -> TourResponse:
    prop_summary = None
    if tour.property:
        prop_summary = TourPropertySummary(
            id=tour.property.id,
            title=tour.property.title,
            slug=tour.property.slug,
            address=tour.property.address,
            city=tour.property.city,
            featured_image_url=tour.property.featured_image_url,
        )

    agent_summary = None
    if tour.agent:
        agent_summary = TourUserSummary(
            id=tour.agent.id,
            email=tour.agent.email,
            full_name=tour.agent.full_name,
            phone_number=tour.agent.phone_number,
        )

    buyer_summary = None
    if tour.buyer:
        buyer_summary = TourUserSummary(
            id=tour.buyer.id,
            email=tour.buyer.email,
            full_name=tour.buyer.full_name,
            phone_number=tour.buyer.phone_number,
        )

    return TourResponse(
        id=tour.id,
        property_id=tour.property_id,
        buyer_id=tour.buyer_id,
        agent_id=tour.agent_id,
        scheduled_start=tour.scheduled_start,
        scheduled_end=tour.scheduled_end,
        status=tour.status,
        cancellation_reason=tour.cancellation_reason,
        buyer_notes=tour.buyer_notes,
        agent_feedback=tour.agent_feedback,
        created_at=tour.created_at,
        updated_at=tour.updated_at,
        property=prop_summary,
        agent=agent_summary,
        buyer=buyer_summary,
    )


@router.get(
    "/properties/{property_id}/availability",
    response_model=AvailabilityResponse,
    summary="Get open 45-minute tour slots for a property's agent",
)
async def get_property_tour_availability(
    property_id: uuid.UUID,
    date_str: str = Query(..., alias="date", pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: AsyncSession = Depends(get_db),
):
    """Calculate open non-conflicting tour slots for the assigned listing agent on a given date."""
    prop_res = await db.execute(
        select(Property).options(selectinload(Property.agent)).where(Property.id == property_id)
    )
    prop = prop_res.scalar_one_or_none()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD"
        )

    # In DB: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    # Python weekday(): Monday = 0, ..., Sunday = 6
    py_dow = target_date.weekday()
    db_dow = (py_dow + 1) % 7

    # Check for custom agent availability windows
    avail_res = await db.execute(
        select(AgentAvailability).where(
            AgentAvailability.agent_id == prop.agent_id,
            AgentAvailability.day_of_week == db_dow,
            AgentAvailability.is_active.is_(True),
        )
    )
    windows = avail_res.scalars().all()

    # If agent hasn't set custom windows, default to standard business hours: 09:00 - 18:00
    if not windows:
        windows = [
            AgentAvailability(
                agent_id=prop.agent_id,
                day_of_week=db_dow,
                start_time=time(9, 0),
                end_time=time(18, 0),
                slot_duration_minutes=45,
                buffer_minutes=15,
                is_active=True,
            )
        ]

    # Query existing active bookings for this agent on the target date
    start_of_day = datetime.combine(target_date, time.min).replace(tzinfo=timezone.utc)
    end_of_day = datetime.combine(target_date, time.max).replace(tzinfo=timezone.utc)

    tours_res = await db.execute(
        select(PropertyTour).where(
            PropertyTour.agent_id == prop.agent_id,
            PropertyTour.status.in_(["pending", "confirmed"]),
            PropertyTour.scheduled_start >= start_of_day,
            PropertyTour.scheduled_end <= end_of_day,
        )
    )
    booked_tours = tours_res.scalars().all()

    slots: List[AvailabilitySlot] = []

    for win in windows:
        slot_duration = timedelta(minutes=win.slot_duration_minutes or 45)
        slot_buffer = timedelta(minutes=win.buffer_minutes if win.buffer_minutes is not None else 15)

        curr = datetime.combine(target_date, win.start_time).replace(tzinfo=timezone.utc)
        win_end_dt = datetime.combine(target_date, win.end_time).replace(tzinfo=timezone.utc)

        while curr + slot_duration <= win_end_dt:
            slot_end = curr + slot_duration

            # Check for conflict with any booked tour
            is_conflicted = any(
                not (slot_end <= b.scheduled_start or curr >= b.scheduled_end)
                for b in booked_tours
            )

            slots.append(
                AvailabilitySlot(
                    start_time=curr,
                    end_time=slot_end,
                    is_available=not is_conflicted,
                )
            )

            curr = slot_end + slot_buffer

    return AvailabilityResponse(
        property_id=prop.id,
        agent_id=prop.agent_id,
        date=date_str,
        slots=slots,
    )


@router.post(
    "/properties/{property_id}/tours",
    response_model=TourResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule an in-person tour for a listing",
)
async def book_property_tour(
    property_id: uuid.UUID,
    payload: TourCreateRequest,
    current_user: User = Depends(require_roles("buyer", "admin", "agent")),
    db: AsyncSession = Depends(get_db),
):
    """Reserve a verified 45-minute tour appointment with GIST conflict prevention."""
    prop_res = await db.execute(
        select(Property).options(selectinload(Property.agent)).where(Property.id == property_id)
    )
    prop = prop_res.scalar_one_or_none()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )

    if payload.scheduled_start >= payload.scheduled_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_start must be before scheduled_end"
        )

    # 1. Proactive overlap check
    overlap_res = await db.execute(
        select(PropertyTour).where(
            PropertyTour.agent_id == prop.agent_id,
            PropertyTour.status.in_(["pending", "confirmed"]),
            PropertyTour.scheduled_start < payload.scheduled_end,
            PropertyTour.scheduled_end > payload.scheduled_start,
        )
    )
    if overlap_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked for this property's agent."
        )

    # 2. Persist with GIST exclusion constraint guarantee
    tour = PropertyTour(
        property_id=prop.id,
        buyer_id=current_user.id,
        agent_id=prop.agent_id,
        scheduled_start=payload.scheduled_start,
        scheduled_end=payload.scheduled_end,
        status="confirmed",
        buyer_notes=payload.buyer_notes,
    )
    db.add(tour)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked for this property's agent."
        )

    # Reload tour with relationships
    created_res = await db.execute(
        select(PropertyTour)
        .options(
            selectinload(PropertyTour.property),
            selectinload(PropertyTour.agent),
            selectinload(PropertyTour.buyer),
        )
        .where(PropertyTour.id == tour.id)
    )
    created_tour = created_res.scalar_one()

    return build_tour_response(created_tour)


@router.get(
    "/buyer/my-tours",
    response_model=TourListResponse,
    summary="List tour bookings for the authenticated user",
)
async def get_my_tours(
    current_user: User = Depends(require_roles("buyer", "admin", "agent")),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all tours booked by or assigned to the current user."""
    filter_condition = (
        PropertyTour.buyer_id == current_user.id
        if current_user.role == "buyer"
        else or_(PropertyTour.buyer_id == current_user.id, PropertyTour.agent_id == current_user.id)
    )

    result = await db.execute(
        select(PropertyTour)
        .options(
            selectinload(PropertyTour.property),
            selectinload(PropertyTour.agent),
            selectinload(PropertyTour.buyer),
        )
        .where(filter_condition)
        .order_by(desc(PropertyTour.scheduled_start))
    )
    tours = result.scalars().all()

    return TourListResponse(
        total=len(tours),
        items=[build_tour_response(t) for t in tours],
    )


@router.patch(
    "/tours/{tour_id}/cancel",
    response_model=TourResponse,
    summary="Cancel a scheduled tour appointment",
)
async def cancel_tour(
    tour_id: uuid.UUID,
    payload: TourCancelRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cancel a tour appointment and release the slot for other buyers."""
    res = await db.execute(
        select(PropertyTour)
        .options(
            selectinload(PropertyTour.property),
            selectinload(PropertyTour.agent),
            selectinload(PropertyTour.buyer),
        )
        .where(PropertyTour.id == tour_id)
    )
    tour = res.scalar_one_or_none()
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour booking not found"
        )

    # Permission check: buyer who booked, assigned agent, or admin
    if (
        tour.buyer_id != current_user.id
        and tour.agent_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this tour."
        )

    if tour.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This tour is already cancelled."
        )

    tour.status = "cancelled"
    tour.cancellation_reason = payload.cancellation_reason
    await db.commit()
    await db.refresh(tour)

    return build_tour_response(tour)


@router.patch(
    "/tours/{tour_id}/reschedule",
    response_model=TourResponse,
    summary="Reschedule an active tour appointment",
)
async def reschedule_tour(
    tour_id: uuid.UUID,
    payload: TourRescheduleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reschedule an active tour appointment to a new open slot."""
    res = await db.execute(
        select(PropertyTour)
        .options(
            selectinload(PropertyTour.property),
            selectinload(PropertyTour.agent),
            selectinload(PropertyTour.buyer),
        )
        .where(PropertyTour.id == tour_id)
    )
    tour = res.scalar_one_or_none()
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour booking not found"
        )

    if tour.buyer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to reschedule this tour."
        )

    if tour.status != "confirmed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reschedule tour with status '{tour.status}'."
        )

    if payload.scheduled_start >= payload.scheduled_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scheduled_start must be before scheduled_end"
        )

    # Check for conflict in the new window (excluding this tour itself)
    overlap_res = await db.execute(
        select(PropertyTour).where(
            PropertyTour.id != tour.id,
            PropertyTour.agent_id == tour.agent_id,
            PropertyTour.status.in_(["pending", "confirmed"]),
            PropertyTour.scheduled_start < payload.scheduled_end,
            PropertyTour.scheduled_end > payload.scheduled_start,
        )
    )
    if overlap_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This new time slot is already booked for this property's agent."
        )

    tour.scheduled_start = payload.scheduled_start
    tour.scheduled_end = payload.scheduled_end

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This new time slot is already booked for this property's agent."
        )

    await db.refresh(tour)
    return build_tour_response(tour)


@router.get(
    "/tours/{tour_id}/calendar.ics",
    summary="Download RFC 5545 iCalendar (.ics) invitation",
)
async def get_tour_calendar_ics(
    tour_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Generate and download a standard RFC 5545 .ics calendar invitation file."""
    res = await db.execute(
        select(PropertyTour)
        .options(
            selectinload(PropertyTour.property),
            selectinload(PropertyTour.agent),
            selectinload(PropertyTour.buyer),
        )
        .where(PropertyTour.id == tour_id)
    )
    tour = res.scalar_one_or_none()
    if not tour:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tour booking not found"
        )

    # Format dates as UTC YYYYMMDDTHHMMSSZ
    start_str = tour.scheduled_start.strftime("%Y%m%dT%H%M%SZ")
    end_str = tour.scheduled_end.strftime("%Y%m%dT%H%M%SZ")
    now_str = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    prop_title = tour.property.title if tour.property else "Property Tour"
    location = f"{tour.property.address}, {tour.property.city}" if tour.property else "On-site"
    agent_name = tour.agent.full_name if tour.agent else "Assigned Agent"

    ics_content = (
        "BEGIN:VCALENDAR\r\n"
        "VERSION:2.0\r\n"
        "PRODID:-//EstateView Technologies//Property Tour Engine//EN\r\n"
        "CALSCALE:GREGORIAN\r\n"
        "METHOD:PUBLISH\r\n"
        "BEGIN:VEVENT\r\n"
        f"UID:{tour.id}@estateview.com\r\n"
        f"DTSTAMP:{now_str}\r\n"
        f"DTSTART:{start_str}\r\n"
        f"DTEND:{end_str}\r\n"
        f"SUMMARY:In-Person Property Tour: {prop_title}\r\n"
        f"DESCRIPTION:Confirmed in-person viewing with {agent_name}. Notes: {tour.buyer_notes or 'None'}\r\n"
        f"LOCATION:{location}\r\n"
        f"STATUS:{tour.status.upper()}\r\n"
        "END:VEVENT\r\n"
        "END:VCALENDAR\r\n"
    )

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f'attachment; filename="tour_{tour.id}.ics"'
        },
    )
