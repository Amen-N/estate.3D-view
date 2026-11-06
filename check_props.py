import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.property import Property

async def main():
    async with async_session_maker() as session:
        props = (await session.scalars(select(Property))).all()
        for p in props:
            print(f"ID={p.id} SLUG={p.slug} TITLE={p.title}")

if __name__ == "__main__":
    asyncio.run(main())
