import re
import uuid
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, cast, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from geoalchemy2.types import Geography
from geoalchemy2.elements import WKTElement

from app.db.session import get_db
from app.models.user import User
from app.models.property import Property
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyListResponse,
    PropertyAgentResponse,
)
from app.api.deps import get_current_user, require_roles

router = APIRouter()


def generate_slug(title: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", title).strip("-").lower()
    suffix = uuid.uuid4().hex[:6]
    return f"{cleaned}-{suffix}" if cleaned else f"prop-{suffix}"


def format_property_response(
    prop: Property,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    dist: Optional[float] = None,
) -> PropertyResponse:
    agent_data = None
    if prop.agent:
        agent_data = PropertyAgentResponse(
            id=prop.agent.id,
            full_name=prop.agent.full_name,
            email=prop.agent.email,
            phone_number=prop.agent.phone_number,
        )

    return PropertyResponse(
        id=prop.id,
        agent_id=prop.agent_id,
        title=prop.title,
        slug=prop.slug,
        description=prop.description,
        price=float(prop.price),
        property_type=prop.property_type,
        status=prop.status,
        bedrooms=prop.bedrooms,
        bathrooms=prop.bathrooms,
        area_sqft=float(prop.area_sqft) if prop.area_sqft else None,
        address=prop.address,
        city=prop.city,
        state=prop.state,
        zip_code=prop.zip_code,
        latitude=lat,
        longitude=lng,
        has_virtual_showroom=prop.has_virtual_showroom,
        featured_image_url=prop.featured_image_url,
        created_at=prop.created_at,
        updated_at=prop.updated_at,
        distance_km=round(float(dist), 2) if dist is not None else None,
        agent=agent_data,
    )


# ---------------------------------------------------------
# Public Property Search & Discovery
# ---------------------------------------------------------

@router.get(
    "/properties",
    response_model=PropertyListResponse,
    tags=["Properties"],
    summary="Search properties with spatial radius and criteria filters",
    description="Retrieve paginated properties with optional PostGIS geospatial distance search and filtering.",
)
async def list_properties(
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    bedrooms: Optional[int] = Query(None, ge=0, description="Minimum bedroom count"),
    bathrooms: Optional[int] = Query(None, ge=0, description="Minimum bathroom count"),
    city: Optional[str] = Query(None, description="City name"),
    property_type: Optional[str] = Query(None, description="Property type (villa, condo, penthouse, townhouse)"),
    has_showroom: Optional[bool] = Query(None, description="Filter properties that have 3D virtual showroom"),
    lat: Optional[float] = Query(None, description="Center latitude for spatial radius query"),
    lng: Optional[float] = Query(None, description="Center longitude for spatial radius query"),
    radius_km: Optional[float] = Query(None, gt=0, description="Spatial search radius in kilometers"),
    search: Optional[str] = Query(None, description="Text search across title, description, and address"),
    limit: int = Query(20, ge=1, le=100, description="Pagination page limit"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: AsyncSession = Depends(get_db),
):
    lat_expr = func.ST_Y(Property.location).label("prop_lat")
    lng_expr = func.ST_X(Property.location).label("prop_lng")

    # Base query
    query = select(Property, lat_expr, lng_expr).options(selectinload(Property.agent))
    count_query = select(func.count(Property.id))

    filters = []

    if min_price is not None:
        filters.append(Property.price >= Decimal(str(min_price)))
    if max_price is not None:
        filters.append(Property.price <= Decimal(str(max_price)))
    if bedrooms is not None:
        filters.append(Property.bedrooms >= bedrooms)
    if bathrooms is not None:
        filters.append(Property.bathrooms >= bathrooms)
    if city:
        filters.append(func.lower(Property.city) == city.strip().lower())
    if property_type:
        filters.append(func.lower(Property.property_type) == property_type.strip().lower())
    if has_showroom is not None:
        filters.append(Property.has_virtual_showroom == has_showroom)
    if search:
        search_pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                Property.title.ilike(search_pattern),
                Property.description.ilike(search_pattern),
                Property.address.ilike(search_pattern),
                Property.city.ilike(search_pattern),
            )
        )

    # Spatial query with ST_DWithin and ST_Distance
    is_spatial = lat is not None and lng is not None and radius_km is not None
    dist_expr = None

    if is_spatial:
        center_geom = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
        center_geog = cast(center_geom, Geography)
        prop_geog = cast(Property.location, Geography)

        radius_meters = radius_km * 1000.0
        spatial_filter = func.ST_DWithin(prop_geog, center_geog, radius_meters)
        filters.append(spatial_filter)

        dist_expr = (func.ST_Distance(prop_geog, center_geog) / 1000.0).label("distance_km")
        query = query.add_columns(dist_expr)

    if filters:
        for f in filters:
            query = query.filter(f)
            count_query = count_query.filter(f)

    # Ordering
    if is_spatial and dist_expr is not None:
        query = query.order_by(dist_expr.asc())
    else:
        query = query.order_by(desc(Property.created_at))

    # Pagination
    query = query.offset(offset).limit(limit)

    total_result = await db.scalar(count_query)
    total = total_result or 0

    results = await db.execute(query)
    rows = results.all()

    items = []
    for row in rows:
        prop = row[0]
        prop_lat = row[1]
        prop_lng = row[2]
        dist = row[3] if is_spatial else None
        items.append(format_property_response(prop, prop_lat, prop_lng, dist))

    return PropertyListResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/properties/{id}",
    response_model=PropertyResponse,
    tags=["Properties"],
    summary="Get detailed property listing",
    description="Retrieve a single property by its UUID with specifications, agent profile, and coordinates.",
)
async def get_property(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    lat_expr = func.ST_Y(Property.location).label("prop_lat")
    lng_expr = func.ST_X(Property.location).label("prop_lng")

    stmt = (
        select(Property, lat_expr, lng_expr)
        .options(selectinload(Property.agent))
        .where(Property.id == id)
    )
    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' was not found.",
        )

    prop, prop_lat, prop_lng = row[0], row[1], row[2]
    return format_property_response(prop, prop_lat, prop_lng)


# ---------------------------------------------------------
# Admin & Agent Property Management
# ---------------------------------------------------------

@router.post(
    "/admin/properties",
    response_model=PropertyResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Management"],
    summary="Create a new property listing",
    description="Authorized administrators and agents can create property listings with PostGIS geometry.",
)
async def create_property(
    payload: PropertyCreate,
    current_user: User = Depends(require_roles("admin", "agent")),
    db: AsyncSession = Depends(get_db),
):
    # Determine agent_id
    assigned_agent_id = payload.agent_id if payload.agent_id else current_user.id

    # Generate unique slug if not provided
    slug = payload.slug or generate_slug(payload.title)

    # Verify slug uniqueness
    existing_slug = await db.scalar(select(Property.id).where(Property.slug == slug))
    if existing_slug:
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    # PostGIS Location
    location_element = None
    if payload.latitude is not None and payload.longitude is not None:
        location_element = WKTElement(
            f"POINT({payload.longitude} {payload.latitude})", srid=4326
        )

    new_prop = Property(
        agent_id=assigned_agent_id,
        title=payload.title,
        slug=slug,
        description=payload.description,
        price=payload.price,
        property_type=payload.property_type,
        status=payload.status or "published",
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        area_sqft=payload.area_sqft,
        address=payload.address,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        location=location_element,
        has_virtual_showroom=payload.has_virtual_showroom,
        featured_image_url=payload.featured_image_url,
    )

    db.add(new_prop)
    await db.commit()
    await db.refresh(new_prop)

    # Load agent relation
    await db.refresh(new_prop, ["agent"])

    return format_property_response(
        new_prop,
        lat=payload.latitude,
        lng=payload.longitude,
    )


@router.put(
    "/admin/properties/{id}",
    response_model=PropertyResponse,
    tags=["Admin Management"],
    summary="Update an existing property listing",
)
async def update_property(
    id: uuid.UUID,
    payload: PropertyUpdate,
    current_user: User = Depends(require_roles("admin", "agent")),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Property)
        .options(selectinload(Property.agent))
        .where(Property.id == id)
    )
    result = await db.execute(stmt)
    prop = result.scalar_one_or_none()

    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' was not found.",
        )

    # Agents can only update their own listings; Admins can update any
    if current_user.role == "agent" and prop.agent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this property listing.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    lat = update_data.pop("latitude", None)
    lng = update_data.pop("longitude", None)

    if lat is not None and lng is not None:
        prop.location = WKTElement(f"POINT({lng} {lat})", srid=4326)

    for field, value in update_data.items():
        setattr(prop, field, value)

    await db.commit()
    await db.refresh(prop)

    lat_val = await db.scalar(select(func.ST_Y(prop.location))) if prop.location is not None else None
    lng_val = await db.scalar(select(func.ST_X(prop.location))) if prop.location is not None else None

    return format_property_response(prop, lat=lat_val, lng=lng_val)


@router.delete(
    "/admin/properties/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Admin Management"],
    summary="Delete a property listing",
)
async def delete_property(
    id: uuid.UUID,
    current_user: User = Depends(require_roles("admin")),
    db: AsyncSession = Depends(get_db),
):
    prop = await db.get(Property, id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID '{id}' was not found.",
        )

    await db.delete(prop)
    await db.commit()
    return None
