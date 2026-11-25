from datetime import datetime, timezone
from app.extensions import db

class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    ward = db.Column(db.String(50), nullable=False, index=True)
    department = db.Column(db.String(50), nullable=False, index=True)
    doctor = db.Column(db.String(80), nullable=False, index=True)
    admission_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Admitted", index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "ward": self.ward,
            "department": self.department,
            "doctor": self.doctor,
            "admission_date": self.admission_date.strftime("%Y-%m-%d") if self.admission_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
