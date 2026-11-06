import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_spatial_property_search(client: AsyncClient, admin_token: str):
    # 1. Create property in Addis Ababa coordinates: (9.0300, 38.7400)
    create_res = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Luxury Penthouse",
            "description": "High-end unit",
            "price": 450000.00,
            "property_type": "penthouse",
            "bedrooms": 3,
            "bathrooms": 2,
            "address": "Bole Subcity",
            "city": "Addis Ababa",
            "latitude": 9.0300,
            "longitude": 38.7400,
            "has_virtual_showroom": True,
        },
    )
    assert create_res.status_code == 201
    prop_id = create_res.json()["id"]

    # 2. Query within 5 km radius (Center: 9.0310, 38.7410) -> Must find property
    search_res = await client.get(
        "/api/v1/properties",
        params={
            "lat": 9.0310,
            "lng": 38.7410,
            "radius_km": 5.0,
            "has_showroom": True,
        },
    )
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert any(p["id"] == prop_id for p in items)

    # 3. Query distant location (radius 1 km away) -> Must NOT find property
    search_distant = await client.get(
        "/api/v1/properties",
        params={
            "lat": 10.5000,
            "lng": 39.5000,
            "radius_km": 1.0,
        },
    )
    assert search_distant.status_code == 200
    assert not any(p["id"] == prop_id for p in search_distant.json()["items"])


@pytest.mark.asyncio
async def test_property_filtering(client: AsyncClient, admin_token: str):
    # Create two test properties with different price and bedrooms
    res1 = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Cozy Suburban Villa",
            "description": "Quiet neighborhood",
            "price": 250000.00,
            "property_type": "villa",
            "bedrooms": 4,
            "bathrooms": 3,
            "address": "123 Elm St",
            "city": "Dallas",
            "latitude": 32.7767,
            "longitude": -96.7970,
            "has_virtual_showroom": False,
        },
    )
    assert res1.status_code == 201
    id1 = res1.json()["id"]

    res2 = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Urban Studio Condo",
            "description": "City center",
            "price": 120000.00,
            "property_type": "condo",
            "bedrooms": 1,
            "bathrooms": 1,
            "address": "456 Main St",
            "city": "Austin",
            "latitude": 30.2672,
            "longitude": -97.7431,
            "has_virtual_showroom": True,
        },
    )
    assert res2.status_code == 201
    id2 = res2.json()["id"]

    # Filter by min_price 200000 -> Should find id1, not id2
    price_res = await client.get("/api/v1/properties", params={"min_price": 200000})
    assert price_res.status_code == 200
    price_ids = [p["id"] for p in price_res.json()["items"]]
    assert id1 in price_ids
    assert id2 not in price_ids

    # Filter by bedrooms >= 3 -> Should find id1, not id2
    bed_res = await client.get("/api/v1/properties", params={"bedrooms": 3})
    assert bed_res.status_code == 200
    bed_ids = [p["id"] for p in bed_res.json()["items"]]
    assert id1 in bed_ids
    assert id2 not in bed_ids

    # Filter by has_showroom True -> Should find id2, not id1
    showroom_res = await client.get("/api/v1/properties", params={"has_showroom": True})
    assert showroom_res.status_code == 200
    showroom_ids = [p["id"] for p in showroom_res.json()["items"]]
    assert id2 in showroom_ids
    assert id1 not in showroom_ids


@pytest.mark.asyncio
async def test_property_detail_and_not_found(client: AsyncClient, admin_token: str):
    # Create property
    res = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Modern Loft",
            "description": "High ceilings and exposed brick",
            "price": 310000.00,
            "property_type": "condo",
            "bedrooms": 2,
            "bathrooms": 2,
            "address": "789 Broadway",
            "city": "Seattle",
            "latitude": 47.6062,
            "longitude": -122.3321,
            "has_virtual_showroom": True,
        },
    )
    assert res.status_code == 201
    prop_id = res.json()["id"]

    # Fetch detail
    detail_res = await client.get(f"/api/v1/properties/{prop_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == prop_id
    assert detail["title"] == "Modern Loft"
    assert detail["latitude"] == pytest.approx(47.6062, abs=0.001)
    assert detail["longitude"] == pytest.approx(-122.3321, abs=0.001)
    assert detail["agent"] is not None
    assert "email" in detail["agent"]

    # 404 for nonexistent property
    non_existent = str(uuid.uuid4())
    nf_res = await client.get(f"/api/v1/properties/{non_existent}")
    assert nf_res.status_code == 404


@pytest.mark.asyncio
async def test_rbac_and_property_crud(
    client: AsyncClient, admin_token: str, buyer_token: str
):
    # Buyer cannot create property -> 403 Forbidden
    forbidden_res = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={
            "title": "Unauthorized Listing",
            "price": 100000.00,
            "address": "No Access",
            "city": "Forbidden City",
        },
    )
    assert forbidden_res.status_code == 403

    # Admin creates property
    create_res = await client.post(
        "/api/v1/admin/properties",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Initial Title",
            "price": 200000.00,
            "address": "100 Market St",
            "city": "San Francisco",
        },
    )
    assert create_res.status_code == 201
    prop_id = create_res.json()["id"]

    # Update property
    update_res = await client.put(
        f"/api/v1/admin/properties/{prop_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Updated Title", "price": 220000.00},
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Title"
    assert update_res.json()["price"] == 220000.00

    # Delete property
    delete_res = await client.delete(
        f"/api/v1/admin/properties/{prop_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert delete_res.status_code == 204

    # Verify deleted
    verify_res = await client.get(f"/api/v1/properties/{prop_id}")
    assert verify_res.status_code == 404
