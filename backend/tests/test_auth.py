"""Auth: register, login, me, profile, reset stub."""


def test_health(client):
    assert client.get("/api/health").get_json() == {"status": "ok"}


def test_register_ok(client):
    r = client.post("/api/auth/register", json={
        "name": "New", "email": "new@test.dev", "password": "secret12"})
    assert r.status_code == 201
    body = r.get_json()
    assert body["token"] and body["user"]["email"] == "new@test.dev"


def test_register_validation(client):
    r = client.post("/api/auth/register", json={
        "name": "", "email": "bad", "password": "123"})
    assert r.status_code == 400
    assert set(r.get_json()["errors"]) == {"name", "email", "password"}


def test_register_duplicate(client):
    payload = {"name": "U", "email": "user@test.dev", "password": "secret12"}
    assert client.post("/api/auth/register", json=payload).status_code == 409


def test_login_bad_password(client):
    r = client.post("/api/auth/login",
                    json={"email": "user@test.dev", "password": "nope"})
    assert r.status_code == 401


def test_me_and_profile_bmi(client, user_headers):
    me = client.get("/api/auth/me", headers=user_headers).get_json()
    assert me["email"] == "user@test.dev"
    assert me["bmi"] == round(72 / (1.7 ** 2), 1)
    assert me["daily_calorie_needs"] and me["daily_calorie_needs"] > 1000
    r = client.put("/api/auth/profile", headers=user_headers,
                   json={"weight_kg": 80})
    assert r.status_code == 200
    assert r.get_json()["weight_kg"] == 80


def test_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401


def test_reset_stub(client):
    r = client.post("/api/auth/reset-request",
                    json={"email": "user@test.dev"})
    assert r.status_code == 200
    assert "reset_token" in r.get_json()
    r2 = client.post("/api/auth/reset-request",
                     json={"email": "nobody@test.dev"})
    assert r2.status_code == 200
