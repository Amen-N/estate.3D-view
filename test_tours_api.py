import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_tour_double_booking_prevention(
    client: AsyncClient,
    buyer_token: str,
    second_buyer_token: str,
    sample_property_id: str,
):
    """Quality Gate: Prevents simultaneous double-booking of the same agent slot via GIST constraint."""
    booking_payload = {
        "scheduled_start": "2026-10-15T14:00:00Z",
        "scheduled_end": "2026-10-15T14:45:00Z",
        "buyer_notes": "First buyer booking slot.",
    }

    # 1. First booking succeeds
    res1 = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json=booking_payload,
    )
    assert res1.status_code == 201
    assert res1.json()["status"] == "confirmed"
    tour_id = res1.json()["id"]

    # 2. Second booking for the exact same slot must fail with 409 Conflict
    res2 = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        headers={"Authorization": f"Bearer {second_buyer_token}"},
        json=booking_payload,
    )
    assert res2.status_code == 409
    assert "already booked" in res2.json()["detail"].lower()

    # 3. Clean up / Cancel first tour
    cancel_res = await client.patch(
        f"/api/v1/tours/{tour_id}/cancel",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"cancellation_reason": "Rescheduling conflict test"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"


@pytest.mark.asyncio
async def test_unauthenticated_booking_fails(
    client: AsyncClient, sample_property_id: str
):
    """Unauthenticated users attempting to book must receive 401 Unauthorized."""
    res = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        json={
            "scheduled_start": "2026-10-16T10:00:00Z",
            "scheduled_end": "2026-10-16T10:45:00Z",
        },
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_tour_availability_endpoint(
    client: AsyncClient, buyer_token: str, sample_property_id: str
):
    """Test availability endpoint returns intervals and marks booked slots as unavailable."""
    target_date = "2026-10-20"
    avail_res = await client.get(
        f"/api/v1/properties/{sample_property_id}/availability",
        params={"date": target_date},
    )
    assert avail_res.status_code == 200
    data = avail_res.json()
    assert "slots" in data
    assert len(data["slots"]) > 0

    first_slot = data["slots"][0]
    slot_start = first_slot["start_time"]
    slot_end = first_slot["end_time"]

    # Book the first available slot
    book_res = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "scheduled_start": slot_start,
            "scheduled_end": slot_end,
            "buyer_notes": "Availability check booking",
        },
    )
    assert book_res.status_code == 201
    tour_id = book_res.json()["id"]

    # Re-fetch availability: the slot must now be marked is_available = False
    avail_after = await client.get(
        f"/api/v1/properties/{sample_property_id}/availability",
        params={"date": target_date},
    )
    assert avail_after.status_code == 200
    updated_slots = avail_after.json()["slots"]
    matched_slot = next(
        (s for s in updated_slots if s["start_time"] == slot_start), None
    )
    assert matched_slot is not None
    assert matched_slot["is_available"] is False

    # Clean up
    await client.patch(
        f"/api/v1/tours/{tour_id}/cancel",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"cancellation_reason": "Clean up availability test"},
    )


@pytest.mark.asyncio
async def test_buyer_my_tours(
    client: AsyncClient, buyer_token: str, sample_property_id: str
):
    """Test buyer can retrieve their tour history."""
    # Book a tour
    book_res = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "scheduled_start": "2026-10-25T11:00:00Z",
            "scheduled_end": "2026-10-25T11:45:00Z",
            "buyer_notes": "My tours history test",
        },
    )
    assert book_res.status_code == 201
    tour_id = book_res.json()["id"]

    my_tours_res = await client.get(
        "/api/v1/buyer/my-tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert my_tours_res.status_code == 200
    tours_list = my_tours_res.json()["items"]
    assert any(t["id"] == tour_id for t in tours_list)

    # Clean up
    await client.patch(
        f"/api/v1/tours/{tour_id}/cancel",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"cancellation_reason": "Clean up my tours test"},
    )


@pytest.mark.asyncio
async def test_calendar_ics_download(
    client: AsyncClient, buyer_token: str, sample_property_id: str
):
    """Test calendar invitation RFC 5545 download endpoint."""
    book_res = await client.post(
        f"/api/v1/properties/{sample_property_id}/tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "scheduled_start": "2026-10-28T15:00:00Z",
            "scheduled_end": "2026-10-28T15:45:00Z",
            "buyer_notes": "ICS download test",
        },
    )
    assert book_res.status_code == 201
    tour_id = book_res.json()["id"]

    ics_res = await client.get(f"/api/v1/tours/{tour_id}/calendar.ics")
    assert ics_res.status_code == 200
    assert "text/calendar" in ics_res.headers.get("content-type", "")
    content = ics_res.text
    assert "BEGIN:VCALENDAR" in content
    assert "BEGIN:VEVENT" in content
    assert f"UID:{tour_id}@estateview.com" in content
    assert "END:VCALENDAR" in content

    # Clean up
    await client.patch(
        f"/api/v1/tours/{tour_id}/cancel",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"cancellation_reason": "Clean up ics test"},
    )
