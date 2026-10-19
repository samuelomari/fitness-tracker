"""Workout CRUD + badge auto-award on create."""


def _payload(**over):
    d = {"exercise_name": "Bench Press", "sets": 4, "reps": 10,
         "weight_kg": 60, "duration_min": 45, "calories": 250}
    d.update(over)
    return d


def test_create_requires_name(client, user_headers):
    r = client.post("/api/workouts", headers=user_headers, json={})
    assert r.status_code == 400


def test_crud(client, user_headers):
    r = client.post("/api/workouts", headers=user_headers, json=_payload())
    assert r.status_code == 201
    wid = r.get_json()["id"]
    # first workout awards a badge
    assert r.get_json().get("new_badges")

    lst = client.get("/api/workouts", headers=user_headers).get_json()
    assert any(w["id"] == wid for w in lst)

    upd = client.put(f"/api/workouts/{wid}", headers=user_headers,
                     json={"reps": 12}).get_json()
    assert upd["reps"] == 12

    assert client.delete(f"/api/workouts/{wid}",
                         headers=user_headers).status_code == 200
    assert client.get("/api/workouts",
                      headers=user_headers).get_json() == []


def test_isolation_between_users(client, user_headers, admin_headers):
    client.post("/api/workouts", headers=user_headers, json=_payload())
    assert client.get("/api/workouts",
                      headers=admin_headers).get_json() == []


def test_404(client, user_headers):
    assert client.put("/api/workouts/9999", headers=user_headers,
                      json={"reps": 1}).status_code == 404
    assert client.delete("/api/workouts/9999",
                         headers=user_headers).status_code == 404
