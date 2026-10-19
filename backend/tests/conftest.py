"""Shared pytest fixtures: isolated in-memory app + clients."""
import pytest
from app import create_app
from app.extensions import db
from app.models import User, Exercise, Challenge


@pytest.fixture()
def app():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret",
        "SECRET_KEY": "test-secret",
    })
    with app.app_context():
        db.create_all()
        admin = User(name="Admin", email="admin@test.dev", is_admin=True)
        admin.set_password("admin123")
        user = User(name="User", email="user@test.dev", age=28,
                    height_cm=170, weight_kg=72, gender="male",
                    fitness_level="intermediate")
        user.set_password("user1234")
        db.session.add_all([admin, user])
        db.session.add(Exercise(name="Bench Press", muscle_group="chest",
                                equipment="barbell", difficulty="intermediate"))
        db.session.add(Challenge(title="Test Challenge", description="d",
                                 challenge_type="workouts", target=5,
                                 duration_days=30))
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def login(client, email, password):
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.get_json()
    return r.get_json()["token"]


@pytest.fixture()
def user_headers(client):
    return {"Authorization": f"Bearer {login(client, 'user@test.dev', 'user1234')}"}


@pytest.fixture()
def admin_headers(client):
    return {"Authorization": f"Bearer {login(client, 'admin@test.dev', 'admin123')}"}
