"""Seed demo data: admin + user with workouts/goals/logs."""
from datetime import date, timedelta
from app import create_app
from app.extensions import db
from app.models import User, Workout, Goal, WeightLog, Exercise, Challenge
from app.badges import ensure_badges

EXERCISES = [
    ("Bench Press", "chest", "barbell", "intermediate", "Compound push for chest/triceps.", "Lie back, lower bar to chest, press up. 4x10."),
    ("Push-Up", "chest", "bodyweight", "beginner", "Bodyweight chest builder.", "Plank, lower chest, push up. 3x15."),
    ("Squat", "legs", "barbell", "intermediate", "King of leg movements.", "Feet shoulder-width, sit back, drive up. 4x8."),
    ("Deadlift", "back", "barbell", "advanced", "Full-body posterior pull.", "Hinge, grip, drive hips forward. 4x6."),
    ("Pull-Up", "back", "bodyweight", "intermediate", "Upper-back width builder.", "Hang, pull chin over bar. 3x8."),
    ("Overhead Press", "shoulders", "dumbbell", "intermediate", "Shoulder strength.", "Press dumbbells overhead. 3x10."),
    ("Bicep Curl", "arms", "dumbbell", "beginner", "Arm isolation.", "Curl to shoulders, slow lower. 3x12."),
    ("Plank", "core", "bodyweight", "beginner", "Core stability.", "Hold rigid plank 60s x3."),
    ("Running", "cardio", "none", "beginner", "Cardio endurance.", "Easy pace 20-30 min."),
    ("Lunges", "legs", "bodyweight", "beginner", "Single-leg strength.", "Step forward, drop knee, drive up. 3x12/leg."),
]

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
    ensure_badges()
    for name, mg, eq, diff, desc, ins in EXERCISES:
        if not Exercise.query.filter_by(name=name).first():
            db.session.add(Exercise(name=name, muscle_group=mg, equipment=eq,
                                    difficulty=diff, description=desc, instructions=ins))
    if not Challenge.query.first():
        db.session.add(Challenge(title="30-Day Push-Up Challenge", description="Log 30 chest workouts in 30 days.",
                                 challenge_type="workouts", target=30, duration_days=30, start_date=today))
        db.session.add(Challenge(title="10K Calorie Burn", description="Burn 10000 kcal.",
                                 challenge_type="calories", target=10000, duration_days=30, start_date=today))
    db.session.commit()
    print("Seeded: admin@fittrack.dev/admin123, demo@fittrack.dev/demo1234")
