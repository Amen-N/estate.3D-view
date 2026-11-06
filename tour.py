import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class TourCreateRequest(BaseModel):
    scheduled_start: datetime
    scheduled_end: datetime
    buyer_notes: Optional[str] = Field(None, max_length=1000)


class TourCancelRequest(BaseModel):
    cancellation_reason: str = Field(..., min_length=3, max_length=500)


class TourRescheduleRequest(BaseModel):
    scheduled_start: datetime
    scheduled_end: datetime


class AvailabilitySlot(BaseModel):
    start_time: datetime
    end_time: datetime
    is_available: bool


class AvailabilityResponse(BaseModel):
    property_id: uuid.UUID
    agent_id: uuid.UUID
    date: str
    slots: List[AvailabilitySlot]


class TourUserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    full_name: str
    phone_number: Optional[str] = None


class TourPropertySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    slug: str
    address: str
    city: str
    featured_image_url: Optional[str] = None


class TourResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    property_id: uuid.UUID
    buyer_id: uuid.UUID
    agent_id: uuid.UUID
    scheduled_start: datetime
    scheduled_end: datetime
    status: str
    cancellation_reason: Optional[str] = None
    buyer_notes: Optional[str] = None
    agent_feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    property: Optional[TourPropertySummary] = None
    agent: Optional[TourUserSummary] = None
    buyer: Optional[TourUserSummary] = None


class TourListResponse(BaseModel):
    total: int
    items: List[TourResponse]
