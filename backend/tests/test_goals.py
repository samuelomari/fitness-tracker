"""Goal CRUD + auto-complete + badge on completion."""


def test_goal_requires_fields(client, user_headers):
    r = client.post("/api/goals", headers=user_headers, json={"title": "x"})
    assert r.status_code == 400


def test_goal_lifecycle_autocomplete(client, user_headers):
    r = client.post("/api/goals", headers=user_headers, json={
        "title": "Lose 5kg", "goal_type": "weight_loss", "target": 5,
        "current_progress": 2})
    assert r.status_code == 201
    gid = r.get_json()["id"]
    assert r.get_json()["progress_pct"] == 40.0

    upd = client.put(f"/api/goals/{gid}", headers=user_headers,
                     json={"current_progress": 5}).get_json()
    assert upd["status"] == "completed"
    assert upd.get("new_badges")  # goal_crusher badge

    assert client.delete(f"/api/goals/{gid}",
                         headers=user_headers).status_code == 200
