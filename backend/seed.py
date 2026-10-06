"""Seed demo data: admin + user with workouts/goals/logs."""
from datetime import date, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Workout, Goal, WeightLog

app = create_app()
with app.app_context():
    db.drop_all()
    db.create_all()
    admin = User(name="Admin", email="admin@fittrack.dev", age=30,
                 height_cm=175, weight_kg=75, gender="male",
                 fitness_level="advanced", is_admin=True)
    admin.set_password("admin123")
    u = User(name="Demo User", email="demo@fittrack.dev", age=28,
             height_cm=170, weight_kg=72, gender="male", fitness_level="intermediate")
    u.set_password("demo1234")
    db.session.add_all([admin, u])
    db.session.commit()
    today = date.today()
    for i in range(10):
        db.session.add(Workout(
            user_id=u.id, exercise_name=["Bench Press", "Squat", "Deadlift", "Run"][i % 4],
            sets=4, reps=10, weight_kg=60 if i % 4 != 3 else 0,
            duration_min=45, calories=250 + i * 10, date=today - timedelta(days=i * 2)))
    db.session.add(Goal(user_id=u.id, title="Lose 5kg", goal_type="weight_loss",
                        target=5, current_progress=2.0))
    db.session.add(Goal(user_id=u.id, title="Run 100km", goal_type="distance",
                        target=100, current_progress=32))
    for i in range(8):
        db.session.add(WeightLog(user_id=u.id, weight_kg=75 - i * 0.4,
                                 date=today - timedelta(days=(7 - i) * 4)))
    db.session.commit()
    print("Seeded: admin@fittrack.dev/admin123, demo@fittrack.dev/demo1234")
