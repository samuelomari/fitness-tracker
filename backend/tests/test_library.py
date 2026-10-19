"""Exercise library: filters + admin-only writes."""


def test_list_and_filter(client, user_headers):
    all_rows = client.get("/api/library",
                          headers=user_headers).get_json()
    assert any(e["name"] == "Bench Press" for e in all_rows)
    chest = client.get("/api/library?muscle_group=chest",
                       headers=user_headers).get_json()
    assert chest and all(e["muscle_group"] == "chest" for e in chest)
    q = client.get("/api/library?q=bench",
                   headers=user_headers).get_json()
    assert any("Bench" in e["name"] for e in q)


def test_user_cannot_create(client, user_headers):
    r = client.post("/api/library", headers=user_headers,
                    json={"name": "X", "muscle_group": "chest"})
    assert r.status_code == 403


def test_admin_crud(client, admin_headers):
    r = client.post("/api/library", headers=admin_headers, json={
        "name": "Test Curl", "muscle_group": "arms"})
    assert r.status_code == 201
    eid = r.get_json()["id"]
    upd = client.put(f"/api/library/{eid}", headers=admin_headers,
                     json={"difficulty": "advanced"}).get_json()
    assert upd["difficulty"] == "advanced"
    assert client.delete(f"/api/library/{eid}",
                         headers=admin_headers).status_code == 200
