import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PropertyAgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    email: str
    phone_number: Optional[str] = None


class PropertyBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    property_type: str = Field(default="condo", max_length=50)
    status: str = Field(default="published", max_length=20)
    bedrooms: int = Field(default=1, ge=0)
    bathrooms: int = Field(default=1, ge=0)
    area_sqft: Optional[Decimal] = None
    address: str = Field(..., max_length=255)
    city: str = Field(..., max_length=100)
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_virtual_showroom: bool = False
    featured_image_url: Optional[str] = None


class PropertyCreate(PropertyBase):
    slug: Optional[str] = None
    agent_id: Optional[uuid.UUID] = None


class PropertyUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, gt=0)
    property_type: Optional[str] = None
    status: Optional[str] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqft: Optional[Decimal] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_virtual_showroom: Optional[bool] = None
    featured_image_url: Optional[str] = None


class PropertyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_id: uuid.UUID
    title: str
    slug: str
    description: Optional[str] = None
    price: float
    property_type: str
    status: str
    bedrooms: int
    bathrooms: int
    area_sqft: Optional[float] = None
    address: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    has_virtual_showroom: bool
    featured_image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    distance_km: Optional[float] = None
    agent: Optional[PropertyAgentResponse] = None


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    limit: int
    offset: int
