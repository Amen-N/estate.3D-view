import asyncio
import uuid
from decimal import Decimal
from sqlalchemy import select, delete
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.db.session import async_session_maker
from app.models.property import Property
from app.models.showroom import Showroom, ShowroomScene, ShowroomHotspot


async def seed_showrooms():
    async with async_session_maker() as session:
        # Find luxury-penthouse or first property
        prop_res = await session.execute(
            select(Property).where(Property.slug == "luxury-penthouse")
        )
        penthouse = prop_res.scalar_one_or_none()

        if not penthouse:
            # Fallback to first property
            res = await session.execute(select(Property).limit(1))
            penthouse = res.scalar_one_or_none()

        if not penthouse:
            print("No properties found in database! Please seed properties first.")
            return

        print(f"Seeding showroom for property: {penthouse.title} ({penthouse.id})")

        # Clean existing showroom for this property if any
        await session.execute(
            delete(Showroom).where(Showroom.property_id == penthouse.id)
        )
        await session.commit()

        # 1. Create Showroom
        showroom_id = uuid.uuid4()
        showroom = Showroom(
            id=showroom_id,
            property_id=penthouse.id,
            showroom_mode="both",
            model_3d_url="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
            model_config={
                "camera_position": [2.5, 1.8, 3.0],
                "target": [0.0, 0.5, 0.0],
                "fov": 45,
                "environment": "city",
                "ambient_intensity": 0.8,
            },
        )
        session.add(showroom)
        await session.flush()

        # 2. Create Scenes
        # Scene 1: Living Room (initial)
        living_scene_id = uuid.uuid4()
        living_scene = ShowroomScene(
            id=living_scene_id,
            showroom_id=showroom_id,
            room_name="Grand Living Room",
            panorama_url="https://pannellum.org/images/alma.jpg",
            thumbnail_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
            default_pitch=Decimal("0.0"),
            default_yaw=Decimal("10.0"),
            sort_order=0,
            is_initial_scene=True,
        )

        # Scene 2: Kitchen
        kitchen_scene_id = uuid.uuid4()
        kitchen_scene = ShowroomScene(
            id=kitchen_scene_id,
            showroom_id=showroom_id,
            room_name="Gourmet Chef Kitchen",
            panorama_url="https://pannellum.org/images/cerro-toco-0.jpg",
            thumbnail_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
            default_pitch=Decimal("-5.0"),
            default_yaw=Decimal("-45.0"),
            sort_order=1,
            is_initial_scene=False,
        )

        # Scene 3: Master Suite
        master_scene_id = uuid.uuid4()
        master_scene = ShowroomScene(
            id=master_scene_id,
            showroom_id=showroom_id,
            room_name="Master Suite",
            panorama_url="https://pannellum.org/images/bma-0.jpg",
            thumbnail_url="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80",
            default_pitch=Decimal("2.0"),
            default_yaw=Decimal("90.0"),
            sort_order=2,
            is_initial_scene=False,
        )

        session.add_all([living_scene, kitchen_scene, master_scene])
        await session.flush()

        # 3. Create Hotspots
        # Living Room Hotspots:
        # - Nav to Kitchen (crucial for E2E test `hotspot-nav-kitchen`)
        h1 = ShowroomHotspot(
            scene_id=living_scene_id,
            hotspot_type="navigation",
            title="Kitchen",
            description="Proceed into the Gourmet Chef Kitchen",
            pitch=Decimal("-2.5"),
            yaw=Decimal("45.0"),
            target_scene_id=kitchen_scene_id,
            metadata_={"transition_speed_ms": 600},
        )
        # - Nav to Master Suite
        h2 = ShowroomHotspot(
            scene_id=living_scene_id,
            hotspot_type="navigation",
            title="Master Suite",
            description="Enter the luxury bedroom retreat",
            pitch=Decimal("0.0"),
            yaw=Decimal("-80.0"),
            target_scene_id=master_scene_id,
            metadata_={"transition_speed_ms": 600},
        )
        # - Info Hotspot
        h3 = ShowroomHotspot(
            scene_id=living_scene_id,
            hotspot_type="info",
            title="Full-Height Curtain Wall Glass",
            description="Triple-pane acoustic insulated glazing providing 270-degree skyline vistas.",
            pitch=Decimal("15.0"),
            yaw=Decimal("12.0"),
            target_scene_id=None,
            metadata_={"brand": "Schüco Panoramic Design"},
        )
        # - Upgrade Hotspot
        h4 = ShowroomHotspot(
            scene_id=living_scene_id,
            hotspot_type="upgrade",
            title="Custom Hardwood Flooring",
            description="Hand-scraped chevron white oak timber with integrated acoustic underlay.",
            pitch=Decimal("-35.0"),
            yaw=Decimal("-10.0"),
            target_scene_id=None,
            metadata_={"material": "Chevron White Oak", "upgrade_cost": 4800},
        )

        # Kitchen Hotspots:
        # - Nav back to Living Room
        h5 = ShowroomHotspot(
            scene_id=kitchen_scene_id,
            hotspot_type="navigation",
            title="Living Room",
            description="Return to the Grand Living Room",
            pitch=Decimal("0.0"),
            yaw=Decimal("-140.0"),
            target_scene_id=living_scene_id,
            metadata_={"transition_speed_ms": 600},
        )
        # - Upgrade Hotspot
        h6 = ShowroomHotspot(
            scene_id=kitchen_scene_id,
            hotspot_type="upgrade",
            title="Calacatta Marble Waterfall Island",
            description="Polished natural bookmatched marble island with brass hardware and flush induction hob.",
            pitch=Decimal("-20.0"),
            yaw=Decimal("35.0"),
            target_scene_id=None,
            metadata_={"material": "Calacatta Gold Marble", "upgrade_cost": 7500},
        )

        # Master Suite Hotspots:
        # - Nav back to Living Room
        h7 = ShowroomHotspot(
            scene_id=master_scene_id,
            hotspot_type="navigation",
            title="Living Room",
            description="Return to the main living area",
            pitch=Decimal("-5.0"),
            yaw=Decimal("170.0"),
            target_scene_id=living_scene_id,
            metadata_={"transition_speed_ms": 600},
        )

        session.add_all([h1, h2, h3, h4, h5, h6, h7])

        # Also ensure property has_virtual_showroom is True
        penthouse.has_virtual_showroom = True

        await session.commit()
        print("Successfully seeded virtual showroom with 3 scenes and 7 interactive hotspots!")


if __name__ == "__main__":
    asyncio.run(seed_showrooms())
