import pytest
import uuid
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_admin_hotspot_creation_and_audit(
    client: AsyncClient, admin_token: str, buyer_token: str, sample_scene_id: str
):
    # 1. Non-admin forbidden
    unauth_res = await client.post(
        f"/api/v1/admin/showroom/scenes/{sample_scene_id}/hotspots",
        headers={"Authorization": f"Bearer {buyer_token}"},
        json={"title": "Balcony Link", "hotspot_type": "navigation", "pitch": 5.2, "yaw": -45.0},
    )
    assert unauth_res.status_code == 403

    # 2. Admin successfully adds hotspot
    auth_res = await client.post(
        f"/api/v1/admin/showroom/scenes/{sample_scene_id}/hotspots",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Kitchen Door",
            "hotspot_type": "navigation",
            "pitch": -2.5,
            "yaw": 110.4,
            "metadata": {"material": "Teak Wood"},
        },
    )
    assert auth_res.status_code == 201
    hotspot_id = auth_res.json()["id"]
    assert hotspot_id is not None
    assert auth_res.json()["title"] == "Kitchen Door"

    # 3. Verify audit log recorded
    audit_res = await client.get(
        "/api/v1/admin/analytics/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert "items" in data
    actions = [log["action"] for log in data["items"]]
    assert "HOTSPOT_CREATE" in actions


@pytest.mark.asyncio
async def test_admin_analytics_overview(
    client: AsyncClient, admin_token: str, buyer_token: str
):
    # 1. Buyer forbidden
    buyer_res = await client.get(
        "/api/v1/admin/analytics/overview",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert buyer_res.status_code == 403

    # 2. Admin access
    admin_res = await client.get(
        "/api/v1/admin/analytics/overview",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_res.status_code == 200
    data = admin_res.json()
    assert "total_properties" in data
    assert "active_tours" in data
    assert "total_users" in data
    assert "conversion_rate" in data
    assert "total_showrooms" in data
    assert "total_scenes" in data
    assert "total_hotspots" in data


@pytest.mark.asyncio
async def test_admin_tours_master_list(
    client: AsyncClient, admin_token: str, buyer_token: str
):
    # 1. Buyer forbidden
    buyer_res = await client.get(
        "/api/v1/admin/tours",
        headers={"Authorization": f"Bearer {buyer_token}"},
    )
    assert buyer_res.status_code == 403

    # 2. Admin access
    admin_res = await client.get(
        "/api/v1/admin/tours",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_res.status_code == 200
    data = admin_res.json()
    assert "items" in data
    assert "total" in data
