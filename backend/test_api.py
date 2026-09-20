from starlette.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["active_fleet_buses"] > 0

def test_bootstrap():
    res = client.get("/api/v1/bootstrap")
    assert res.status_code == 200
    data = res.json()
    assert "counts" in data
    assert "buses" in data
    assert "events" in data
    assert "routes" in data
    assert len(data["buses"]) == 36
    assert len(data["events"]) >= 130
    assert len(data["routes"]) == 8

def test_event_patch_and_audit():
    # Fetch first event
    res = client.get("/api/v1/events")
    assert res.status_code == 200
    events = res.json()
    assert len(events) > 0
    test_id = events[0]["id"]
    
    # Patch event review
    patch_res = client.patch(
        f"/api/v1/events/{test_id}",
        json={"review_status": "VERIFIED", "review_notes": "Ground truth verified by field unit."}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["event"]["review_status"] == "VERIFIED"
    
    # Verify audit log recorded it
    audit_res = client.get("/api/v1/audit-logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any(log["target_id"] == test_id for log in logs)

def test_alert_patch():
    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) > 0
    test_alert = alerts[0]
    
    patch_res = client.patch(
        f"/api/v1/alerts/{test_alert['id']}",
        json={"state": "ASSIGNED", "assigned_to": "Field Patrol 7"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["alert"]["state"] == "ASSIGNED"

def test_reports_export_csv():
    res = client.get("/api/v1/reports/export?format=csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Event ID" in res.text

def test_reports_export_json():
    res = client.get("/api/v1/reports/export?format=json")
    assert res.status_code == 200
    data = res.json()
    assert "records_count" in data
    assert len(data["events"]) > 0

if __name__ == "__main__":
    test_health()
    test_bootstrap()
    test_event_patch_and_audit()
    test_alert_patch()
    test_reports_export_csv()
    test_reports_export_json()
    print("ALL BACKEND API TESTS PASSED SUCCESSFULLY!")
