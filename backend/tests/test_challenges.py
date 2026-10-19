"""Challenges: join, progress, leaderboard, admin create."""


def test_join_and_progress(client, user_headers):
    challenges = client.get("/api/challenges",
                            headers=user_headers).get_json()
    cid = challenges[0]["id"]
    joined = client.post(f"/api/challenges/{cid}/join",
                         headers=user_headers)
    assert joined.status_code == 200
    client.post("/api/workouts", headers=user_headers,
                json={"exercise_name": "Run", "calories": 100})
    listed = client.get("/api/challenges",
                        headers=user_headers).get_json()
    mine = next(c for c in listed if c["id"] == cid)
    assert mine["user_progress"]["progress"] >= 1

    board = client.get(f"/api/challenges/{cid}/leaderboard",
                       headers=user_headers).get_json()
    assert board and board[0]["progress"] >= 1


def test_admin_create_and_user_forbidden(client, user_headers,
                                         admin_headers):
    bad = client.post("/api/challenges", headers=user_headers,
                      json={"title": "Nope"})
    assert bad.status_code == 403
    ok = client.post("/api/challenges", headers=admin_headers, json={
        "title": "Burner", "challenge_type": "calories", "target": 5000,
        "duration_days": 14})
    assert ok.status_code == 201
