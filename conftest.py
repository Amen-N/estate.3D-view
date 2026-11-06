import asyncio
import uuid
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from sqlalchemy import text

from app.main import app
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide an isolated database session for tests using NullPool to prevent loop collisions."""
    engine = create_async_engine(settings.DATABASE_URL, echo=False, poolclass=NullPool)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_maker() as session:
        yield session
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Provide an asynchronous HTTP client with overridden get_db dependency."""
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_buyer_token(db_session: AsyncSession) -> str:
    """Create and return a valid JWT access token for a test buyer."""
    from sqlalchemy import select
    email = "test_fixture_buyer@example.com"
    user = await db_session.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("Password123!"),
            full_name="Fixture Buyer",
            role="buyer",
            is_active=True,
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

    return create_access_token(subject=str(user.id), role=user.role)


@pytest_asyncio.fixture(scope="function")
async def test_admin_token(db_session: AsyncSession) -> str:
    """Create and return a valid JWT access token for a test admin."""
    from sqlalchemy import select
    email = "test_fixture_admin@example.com"
    user = await db_session.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("AdminSecret123!"),
            full_name="Fixture Admin",
            role="admin",
            is_active=True,
            is_verified=True
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

    return create_access_token(subject=str(user.id), role=user.role)


@pytest_asyncio.fixture(scope="function")
async def admin_token(test_admin_token: str) -> str:
    return test_admin_token


@pytest_asyncio.fixture(scope="function")
async def buyer_token(test_buyer_token: str) -> str:
    return test_buyer_token


@pytest_asyncio.fixture(scope="function")
async def second_buyer_token(db_session: AsyncSession) -> str:
    """Create and return a valid JWT access token for a second distinct test buyer."""
    from sqlalchemy import select
    email = "test_fixture_buyer2@example.com"
    user = await db_session.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            email=email,
            hashed_password=get_password_hash("Password123!"),
            full_name="Second Fixture Buyer",
            role="buyer",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

    return create_access_token(subject=str(user.id), role=user.role)


@pytest_asyncio.fixture(scope="function")
async def sample_property_id(db_session: AsyncSession, admin_token: str) -> str:
    """Ensure a sample property exists and return its UUID string."""
    from sqlalchemy import select
    from app.models.property import Property
    from geoalchemy2.elements import WKTElement

    # Check for existing sample property
    existing = await db_session.scalar(select(Property).limit(1))
    if existing:
        return str(existing.id)

    # Otherwise fetch admin user to be the agent
    admin_user = await db_session.scalar(select(User).where(User.role == "admin").limit(1))
    prop = Property(
        agent_id=admin_user.id,
        title="Sample Test Villa",
        slug=f"sample-test-villa-{uuid.uuid4().hex[:6]}",
        description="Luxury test villa for tour scheduling",
        price=750000.00,
        property_type="villa",
        bedrooms=4,
        bathrooms=3,
        address="123 Test St",
        city="Addis Ababa",
        location=WKTElement("POINT(38.7400 9.0300)", srid=4326),
        has_virtual_showroom=True,
    )
    db_session.add(prop)
    await db_session.commit()
    await db_session.refresh(prop)
    return str(prop.id)


@pytest_asyncio.fixture(scope="function")
async def sample_scene_id(db_session: AsyncSession, sample_property_id: str) -> str:
    """Ensure a sample showroom scene exists and return its UUID string."""
    from sqlalchemy import select
    from app.models.showroom import Showroom, ShowroomScene
    from decimal import Decimal

    # Check for existing scene
    scene = await db_session.scalar(select(ShowroomScene).limit(1))
    if scene:
        return str(scene.id)

    # Find or create showroom
    sr = await db_session.scalar(
        select(Showroom).where(Showroom.property_id == uuid.UUID(sample_property_id))
    )
    if not sr:
        sr = Showroom(
            property_id=uuid.UUID(sample_property_id),
            showroom_mode="both",
        )
        db_session.add(sr)
        await db_session.commit()
        await db_session.refresh(sr)

    new_scene = ShowroomScene(
        showroom_id=sr.id,
        room_name="Grand Living Room",
        panorama_url="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=80",
        default_pitch=Decimal("0.0"),
        default_yaw=Decimal("0.0"),
        sort_order=0,
        is_initial_scene=True,
    )
    db_session.add(new_scene)
    await db_session.commit()
    await db_session.refresh(new_scene)
    return str(new_scene.id)
