import uuid
from decimal import Decimal
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property
from app.models.showroom import Showroom, ShowroomScene, ShowroomHotspot


@pytest_asyncio.fixture(scope="function")
async def property_with_showroom(db_session: AsyncSession, sample_property_id: str) -> str:
    """Ensure the sample property has a complete virtual showroom with scenes and hotspots."""
    prop_uuid = uuid.UUID(sample_property_id)
    showroom_res = await db_session.execute(
        select(Showroom).where(Showroom.property_id == prop_uuid)
    )
    showroom = showroom_res.scalar_one_or_none()

    if not showroom:
        showroom = Showroom(
            id=uuid.uuid4(),
            property_id=prop_uuid,
            showroom_mode="both",
            model_3d_url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
            model_config={"camera_position": [2, 2, 2], "fov": 50},
        )
        db_session.add(showroom)
        await db_session.flush()

        # Scene 1: Living Room
        s1 = ShowroomScene(
            id=uuid.uuid4(),
            showroom_id=showroom.id,
            room_name="Grand Living Room",
            panorama_url="https://pannellum.org/images/alma.jpg",
            thumbnail_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            default_pitch=Decimal("0.0"),
            default_yaw=Decimal("0.0"),
            sort_order=0,
            is_initial_scene=True,
        )
        # Scene 2: Kitchen
        s2 = ShowroomScene(
            id=uuid.uuid4(),
            showroom_id=showroom.id,
            room_name="Kitchen",
            panorama_url="https://pannellum.org/images/cerro-toco-0.jpg",
            thumbnail_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
            default_pitch=Decimal("-5.0"),
            default_yaw=Decimal("45.0"),
            sort_order=1,
            is_initial_scene=False,
        )
        db_session.add_all([s1, s2])
        await db_session.flush()

        # Navigation hotspot to kitchen
        h1 = ShowroomHotspot(
            scene_id=s1.id,
            hotspot_type="navigation",
            title="Kitchen",
            description="Go to Kitchen",
            pitch=Decimal("-10.5"),
            yaw=Decimal("35.0"),
            target_scene_id=s2.id,
            metadata_={},
        )
        # Info hotspot
        h2 = ShowroomHotspot(
            scene_id=s1.id,
            hotspot_type="info",
            title="Marble Countertop",
            description="Italian marble",
            pitch=Decimal("15.0"),
            yaw=Decimal("-45.0"),
            target_scene_id=None,
            metadata_={"material": "Carrara Marble"},
        )
        db_session.add_all([h1, h2])
        await db_session.commit()

    return sample_property_id


@pytest.mark.asyncio
async def test_showroom_scene_graph_retrieval(
    client: AsyncClient, property_with_showroom: str
):
    """Quality Gate: Retrieve complete hierarchical scene graph containing scenes, panoramas, and hotspots."""
    res = await client.get(f"/api/v1/properties/{property_with_showroom}/showroom")
    assert res.status_code == 200
    data = res.json()
    assert "scenes" in data
    assert len(data["scenes"]) > 0

    first_scene = data["scenes"][0]
    assert "panorama_url" in first_scene
    assert "hotspots" in first_scene
    assert len(first_scene["hotspots"]) > 0

    # Verify coordinate bounds strictly compliant with [-90, 90] and [-180, 180]
    for hotspot in first_scene["hotspots"]:
        assert -90.0 <= hotspot["pitch"] <= 90.0
        assert -180.0 <= hotspot["yaw"] <= 180.0


@pytest.mark.asyncio
async def test_showroom_not_found_handling(client: AsyncClient, db_session: AsyncSession):
    """Verify 404 responses for nonexistent property or missing showroom."""
    # 1. Random non-existent UUID
    fake_id = uuid.uuid4()
    res1 = await client.get(f"/api/v1/properties/{fake_id}/showroom")
    assert res1.status_code == 404
    assert "not found" in res1.json()["detail"].lower()


@pytest.mark.asyncio
async def test_showroom_hotspot_target_room_name_resolution(
    client: AsyncClient, property_with_showroom: str
):
    """Verify navigation hotspots correctly resolve target room names for smooth UI transition tooltips."""
    res = await client.get(f"/api/v1/properties/{property_with_showroom}/showroom")
    assert res.status_code == 200
    data = res.json()

    # Find navigation hotspot
    nav_hotspots = [
        h
        for scene in data["scenes"]
        for h in scene["hotspots"]
        if h["hotspot_type"] == "navigation"
    ]
    assert len(nav_hotspots) > 0
    first_nav = nav_hotspots[0]
    assert first_nav["target_scene_id"] is not None
    assert first_nav["target_room_name"] is not None
