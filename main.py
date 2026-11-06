from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.properties import router as properties_router
from app.api.v1.tours import router as tours_router
from app.api.v1.showroom import router as showroom_router
from app.api.v1.admin import router as admin_router


tags_metadata = [
    {
        "name": "Authentication",
        "description": "User registration, authentication, JWT token issuance, and authenticated profile retrieval."
    },
    {
        "name": "Properties",
        "description": "Public property search, geospatial discovery via PostGIS, and detailed specifications."
    },
    {
        "name": "Tour Scheduling",
        "description": "In-person tour booking, calendar availability calculation, and calendar invitation generation."
    },
    {
        "name": "Showroom Public",
        "description": "Interactive 360 panorama scenes, 3D model configurations, and dynamic hotspots."
    },
    {
        "name": "Admin Showroom CMS",
        "description": "Administrative virtual showroom scene builder, coordinate hotspot manager, and 3D asset tuner."
    },
    {
        "name": "Admin Management",
        "description": "Platform analytics KPIs, system audit logs, property management, and user role administration."
    }
]

app = FastAPI(
    title="Real Estate Virtual Showroom & Tour Booking API",
    description="""
# EstateView API Engine

A high-performance real estate platform featuring:
* **Interactive 3D / 360° Showrooms**: Scene graphs, equirectangular panoramas, and dynamic coordinate hotspots.
* **In-Person Tour Booking**: Self-service calendar scheduling with PostgreSQL GIST exclusion double-booking prevention.
* **PostGIS Geospatial Search**: Radius distance queries (`ST_DWithin`) and listing filters.
* **Super-Admin Portal & CMS**: Coordinate hotspot studio and activity audit logging.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(properties_router, prefix=settings.API_V1_STR)
app.include_router(tours_router, prefix=settings.API_V1_STR)
app.include_router(showroom_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)



@app.get("/health", tags=["Health"], summary="System health check")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }


@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {
        "message": "Real Estate Virtual Showroom & Booking API",
        "docs_url": "/docs"
    }
