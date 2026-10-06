from datetime import datetime, date
from .extensions import db, bcrypt


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    height_cm = db.Column(db.Float, nullable=True)
    weight_kg = db.Column(db.Float, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    fitness_level = db.Column(db.String(30), nullable=True, default="beginner")
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    @property
    def bmi(self):
        if self.height_cm and self.weight_kg and self.height_cm > 0:
            m = self.height_cm / 100
            return round(self.weight_kg / (m * m), 1)
        return None

    def daily_calorie_needs(self):
        if not all([self.weight_kg, self.height_cm, self.age]):
            return None
        if (self.gender or "").lower() == "female":
            bmr = 10 * self.weight_kg + 6.25 * self.height_cm - 5 * self.age - 161
        else:
            bmr = 10 * self.weight_kg + 6.25 * self.height_cm - 5 * self.age + 5
        factor = {"beginner": 1.375, "intermediate": 1.55, "advanced": 1.725}.get(
            (self.fitness_level or "beginner").lower(), 1.375)
        return round(bmr * factor)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "email": self.email,
            "age": self.age, "height_cm": self.height_cm,
            "weight_kg": self.weight_kg, "gender": self.gender,
            "fitness_level": self.fitness_level, "is_admin": self.is_admin,
            "bmi": self.bmi, "daily_calorie_needs": self.daily_calorie_needs(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    exercise_name = db.Column(db.String(120), nullable=False)
    sets = db.Column(db.Integer, default=0)
    reps = db.Column(db.Integer, default=0)
    weight_kg = db.Column(db.Float, default=0)
    duration_min = db.Column(db.Float, default=0)
    calories = db.Column(db.Float, default=0)
    date = db.Column(db.Date, default=date.today, index=True)

    def to_dict(self):
        return {
            "id": self.id, "exercise_name": self.exercise_name,
            "sets": self.sets, "reps": self.reps, "weight_kg": self.weight_kg,
            "duration_min": self.duration_min, "calories": self.calories,
            "date": self.date.isoformat() if self.date else None,
        }


class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    goal_type = db.Column(db.String(50), nullable=False)
    target = db.Column(db.Float, nullable=False)
    current_progress = db.Column(db.Float, default=0)
    deadline = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), default="active")

    @property
    def progress_pct(self):
        if self.target:
            return round(min(100, (self.current_progress / self.target) * 100), 1)
        return 0

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "goal_type": self.goal_type,
            "target": self.target, "current_progress": self.current_progress,
            "progress_pct": self.progress_pct,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "status": self.status,
        }


class WeightLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=date.today, index=True)

    def to_dict(self):
        return {"id": self.id, "weight_kg": self.weight_kg,
                "date": self.date.isoformat()}


class NutritionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fat = db.Column(db.Float, default=0)
    date = db.Column(db.Date, default=date.today, index=True)

    def to_dict(self):
        return {
            "id": self.id, "meal_type": self.meal_type,
            "food_name": self.food_name, "calories": self.calories,
            "protein": self.protein, "carbs": self.carbs, "fat": self.fat,
            "date": self.date.isoformat() if self.date else None,
        }


class WaterLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    amount_ml = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=date.today, index=True)

    def to_dict(self):
        return {"id": self.id, "amount_ml": self.amount_ml,
                "date": self.date.isoformat()}


class SleepLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    bedtime = db.Column(db.DateTime, nullable=False)
    wakeup = db.Column(db.DateTime, nullable=False)
    duration_hours = db.Column(db.Float, nullable=True)
    date = db.Column(db.Date, default=date.today, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "bedtime": self.bedtime.isoformat() if self.bedtime else None,
            "wakeup": self.wakeup.isoformat() if self.wakeup else None,
            "duration_hours": self.duration_hours,
            "date": self.date.isoformat() if self.date else None,
        }


