import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class AdminAnalyticsOverview(BaseModel):
    total_properties: int
    active_tours: int
    total_users: int
    conversion_rate: float
    total_showrooms: int
    total_scenes: int
    total_hotspots: int


class AuditLogItem(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditLogListResponse(BaseModel):
    items: List[AuditLogItem]
    total: int
    page: int = 1
    page_size: int = 20


class AdminSceneCreateRequest(BaseModel):
    room_name: Optional[str] = None
    title: Optional[str] = None
    panorama_url: str
    thumbnail_url: Optional[str] = None
    default_pitch: float = 0.0
    default_yaw: float = 0.0
    sort_order: int = 0
    is_initial_scene: bool = False


class AdminHotspotCreateRequest(BaseModel):
    title: Optional[str] = None
    hotspot_type: str  # 'navigation', 'info', 'upgrade'
    pitch: float
    yaw: float
    target_scene_id: Optional[uuid.UUID] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
