"""Nutrition / water / sleep / weight trackers."""


def test_nutrition(client, user_headers):
    bad = client.post("/api/track/nutrition", headers=user_headers,
                      json={"calories": 100})
    assert bad.status_code == 400
    ok = client.post("/api/track/nutrition", headers=user_headers, json={
        "meal_type": "lunch", "food_name": "Rice", "calories": 500,
        "protein": 20, "carbs": 80, "fat": 10})
    assert ok.status_code == 201
    rows = client.get("/api/track/nutrition",
                      headers=user_headers).get_json()
    assert rows and rows[0]["food_name"] == "Rice"


def test_water(client, user_headers):
    r = client.post("/api/track/water", headers=user_headers,
                    json={"amount_ml": 500})
    assert r.status_code == 201
    assert client.get("/api/track/water",
                      headers=user_headers).get_json()[0]["amount_ml"] == 500


def test_sleep_validation_and_ok(client, user_headers):
    bad = client.post("/api/track/sleep", headers=user_headers, json={})
    assert bad.status_code == 400
    ok = client.post("/api/track/sleep", headers=user_headers, json={
        "bedtime": "2026-01-01T22:00:00",
        "wakeup": "2026-01-02T06:00:00"})
    assert ok.status_code == 201
    assert ok.get_json()["duration_hours"] == 8.0


def test_weight(client, user_headers):
    bad = client.post("/api/track/weight", headers=user_headers, json={})
    assert bad.status_code == 400
    ok = client.post("/api/track/weight", headers=user_headers,
                     json={"weight_kg": 71.5})
    assert ok.status_code == 201
    assert client.get("/api/track/weight",
                      headers=user_headers).get_json()[0]["weight_kg"] == 71.5
