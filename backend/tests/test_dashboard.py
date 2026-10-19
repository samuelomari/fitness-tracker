"""Dashboard summary, activity heatmap/frequency."""
from datetime import date


def test_dashboard_summary_empty(client, user_headers):
    s = client.get("/api/dashboard/summary",
                   headers=user_headers).get_json()
    assert s["total_workouts"] == 0
    assert s["streak_days"] == 0
    assert s["active_goals"] == []


def test_dashboard_summary_with_data(client, user_headers):
    today = date.today().isoformat()
    client.post("/api/workouts", headers=user_headers, json={
        "exercise_name": "Run", "calories": 300, "date": today})
    s = client.get("/api/dashboard/summary",
                   headers=user_headers).get_json()
    assert s["total_workouts"] == 1
    assert s["calories_burned"] == 300
    assert s["streak_days"] == 1
    assert any(d["date"] == today for d in s["calories_by_day"])


def test_heatmap_and_frequency(client, user_headers):
    h = client.get("/api/activity/heatmap?days=14",
                   headers=user_headers).get_json()
    assert len(h["days"]) == 14
    assert all("level" in d and "count" in d for d in h["days"])
    f = client.get("/api/activity/frequency?weeks=4",
                   headers=user_headers).get_json()
    assert isinstance(f, list)
