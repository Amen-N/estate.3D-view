import asyncio
import uuid
from decimal import Decimal
from sqlalchemy import select
from geoalchemy2.elements import WKTElement
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.db.session import async_session_maker
from app.models.user import User
from app.models.property import Property


SAMPLE_PROPERTIES = [
    {
        "title": "Luxury Penthouse",
        "slug": "luxury-penthouse",
        "description": "Prestigious penthouse featuring full glass panoramas, private elevator access, marble bathrooms, and smart home automation.",
        "price": Decimal("650000.00"),
        "property_type": "penthouse",
        "status": "published",
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": Decimal("3200.00"),
        "address": "Bole Subcity Luxury Tower, 18th Floor",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 9.0300,
        "longitude": 38.7400,
        "has_virtual_showroom": True,
        "featured_image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Skyline Luxury Penthouse",
        "slug": "skyline-luxury-penthouse",
        "description": "Breathtaking panoramic city views, floor-to-ceiling glass, private elevator access, and ultra-premium modern finishes.",
        "price": Decimal("650000.00"),
        "property_type": "penthouse",
        "status": "published",
        "bedrooms": 3,
        "bathrooms": 3,
        "area_sqft": Decimal("3200.00"),
        "address": "Bole Atlas Tower, 18th Floor",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 9.0105,
        "longitude": 38.7892,
        "has_virtual_showroom": True,
        "featured_image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Hilltop Contemporary Villa",
        "slug": "hilltop-contemporary-villa",
        "description": "Exclusive private gated residence with infinity edge pool, lush landscaped garden, smart automation, and 4-car garage.",
        "price": Decimal("980000.00"),
        "property_type": "villa",
        "status": "published",
        "bedrooms": 5,
        "bathrooms": 5,
        "area_sqft": Decimal("5400.00"),
        "address": "Old Airport Diplomatic Zone",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 8.9892,
        "longitude": 38.7351,
        "has_virtual_showroom": True,
        "featured_image_url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Metropolitan Executive Condo",
        "slug": "metropolitan-executive-condo",
        "description": "Sun-drenched corner unit in the financial district. Open concept layout, quartz kitchen island, and concierge service.",
        "price": Decimal("320000.00"),
        "property_type": "condo",
        "status": "published",
        "bedrooms": 2,
        "bathrooms": 2,
        "area_sqft": Decimal("1450.00"),
        "address": "Kazanchis Financial District",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 9.0180,
        "longitude": 38.7660,
        "has_virtual_showroom": True,
        "featured_image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Garden View Townhouse",
        "slug": "garden-view-townhouse",
        "description": "Peaceful multi-level modern townhome with private terrace, rooftop barbecue deck, and custom Italian cabinetry.",
        "price": Decimal("285000.00"),
        "property_type": "townhouse",
        "status": "published",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": Decimal("1850.00"),
        "address": "CMC Residential Quarter",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 9.0250,
        "longitude": 38.8350,
        "has_virtual_showroom": False,
        "featured_image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Sunset Modern Loft",
        "slug": "sunset-modern-loft",
        "description": "Artisan loft featuring 14ft industrial timber ceilings, exposed brick walls, steel frame windows, and chef kitchen.",
        "price": Decimal("195000.00"),
        "property_type": "condo",
        "status": "published",
        "bedrooms": 1,
        "bathrooms": 1,
        "area_sqft": Decimal("980.00"),
        "address": "Sarbet Heritage Quarter",
        "city": "Addis Ababa",
        "state": "Addis Ababa",
        "zip_code": "1000",
        "latitude": 9.0010,
        "longitude": 38.7420,
        "has_virtual_showroom": True,
        "featured_image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    },
]


async def seed():
    async with async_session_maker() as session:
        # Find admin or agent user
        agent = await session.scalar(select(User).where(User.role.in_(["admin", "agent"])))
        if not agent:
            print("No admin/agent user found, please run seed_test_users.py first.")
            return

        for p_data in SAMPLE_PROPERTIES:
            existing = await session.scalar(select(Property).where(Property.slug == p_data["slug"]))
            if existing:
                print(f"Property '{p_data['title']}' already exists, skipping.")
                continue

            loc = WKTElement(f"POINT({p_data['longitude']} {p_data['latitude']})", srid=4326)
            prop = Property(
                agent_id=agent.id,
                title=p_data["title"],
                slug=p_data["slug"],
                description=p_data["description"],
                price=p_data["price"],
                property_type=p_data["property_type"],
                status=p_data["status"],
                bedrooms=p_data["bedrooms"],
                bathrooms=p_data["bathrooms"],
                area_sqft=p_data["area_sqft"],
                address=p_data["address"],
                city=p_data["city"],
                state=p_data["state"],
                zip_code=p_data["zip_code"],
                location=loc,
                has_virtual_showroom=p_data["has_virtual_showroom"],
                featured_image_url=p_data["featured_image_url"],
            )
            session.add(prop)
            print(f"Added property: {p_data['title']}")

        await session.commit()
        print("Properties seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
