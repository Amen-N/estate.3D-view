import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class HotspotResponse(BaseModel):
    id: uuid.UUID
    scene_id: uuid.UUID
    hotspot_type: str  # 'navigation', 'info', 'upgrade'
    title: Optional[str] = None
    description: Optional[str] = None
    pitch: float
    yaw: float
    target_scene_id: Optional[uuid.UUID] = None
    target_room_name: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SceneResponse(BaseModel):
    id: uuid.UUID
    showroom_id: uuid.UUID
    room_name: str
    panorama_url: str
    thumbnail_url: Optional[str] = None
    default_pitch: float = 0.0
    default_yaw: float = 0.0
    sort_order: int = 0
    is_initial_scene: bool = False
    hotspots: List[HotspotResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ShowroomResponse(BaseModel):
    id: uuid.UUID
    property_id: uuid.UUID
    showroom_mode: str  # 'panorama_360', 'model_3d', 'both'
    model_3d_url: Optional[str] = None
    model_config: Dict[str, Any] = Field(default_factory=dict)
    scenes: List[SceneResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
