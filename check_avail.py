import asyncio
import sys
from pathlib import Path
from sqlalchemy import select

backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.db.session import async_session_maker
from app.models.property import Property
from app.models.tour import PropertyTour

async def chk():
    async with async_session_maker() as db:
        res = await db.execute(select(Property).where(Property.title == "Luxury Penthouse"))
        props = res.scalars().all()
        for p in props:
            print(f"Prop ID={p.id} slug={p.slug} price={p.price} desc={p.description[:30]} agent_id={p.agent_id}")
            t_res = await db.execute(select(PropertyTour).where(PropertyTour.property_id == p.id))
            tours = t_res.scalars().all()
            print(f"  Tours on this prop: {len(tours)}")
            for t in tours:
                print(f"    Tour {t.id} {t.scheduled_start} -> {t.scheduled_end} status={t.status}")

if __name__ == '__main__':
    asyncio.run(chk())
