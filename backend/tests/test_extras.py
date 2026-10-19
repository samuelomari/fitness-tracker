"""Badges listing + check, PDF report, admin endpoints, model math."""


def test_badges_flow(client, user_headers):
    before = client.get("/api/badges", headers=user_headers).get_json()
    assert before["earned"] == [] and len(before["locked"]) >= 7
    client.post("/api/workouts", headers=user_headers,
                json={"exercise_name": "Squat"})
    check = client.post("/api/badges/check",
                        headers=user_headers).get_json()
    assert isinstance(check["newly_awarded"], list)
    after = client.get("/api/badges", headers=user_headers).get_json()
    assert any(b["badge"]["key"] == "first_workout"
               for b in after["earned"])


def test_pdf_report(client, user_headers):
    r = client.get("/api/reports/fitness.pdf", headers=user_headers)
    assert r.status_code == 200
    assert r.content_type == "application/pdf"
    assert r.data[:4] == b"%PDF"


def test_admin_endpoints(client, user_headers, admin_headers):
    assert client.get("/api/admin/users",
                      headers=user_headers).status_code == 403
    users = client.get("/api/admin/users",
                       headers=admin_headers).get_json()
    assert len(users) == 2
    stats = client.get("/api/admin/stats",
                       headers=admin_headers).get_json()
    assert stats["total_users"] == 2
    uid = next(u["id"] for u in users if not u["is_admin"])
    susp = client.put(f"/api/admin/users/{uid}/suspend",
                      headers=admin_headers).get_json()
    assert susp["id"] == uid


def test_model_math(app):
    from app.models import User
    u = User(name="M", email="m@t.dev", age=30, height_cm=180,
             weight_kg=81, gender="female", fitness_level="beginner")
    assert u.bmi == round(81 / (1.8 ** 2), 1)
    assert u.daily_calorie_needs() and u.daily_calorie_needs() > 1000
    u2 = User(name="N", email="n@t.dev")
    u2.set_password("secret12")
    assert u2.check_password("secret12")
    assert not u2.check_password("wrong")
