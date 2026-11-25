import os
from app import create_app
from app.extensions import db
from app.models import Patient
from datetime import date

app = create_app()

def seed_sample_data():
    """Seed sample data if the table is empty for an immediate demo experience."""
    with app.app_context():
        if db.session.scalar(db.select(db.func.count(Patient.id))) == 0:
            sample_patients = [
                Patient(
                    name="Aarav Sharma",
                    age=34,
                    gender="Male",
                    ward="Cardiology Ward",
                    department="Cardiology",
                    doctor="Dr. Rajesh Sharma (Cardiology)",
                    admission_date=date(2026, 11, 20),
                    status="Admitted"
                ),
                Patient(
                    name="Sneha Patil",
                    age=28,
                    gender="Female",
                    ward="Maternity Ward",
                    department="Obstetrics & Gynecology",
                    doctor="Dr. Sunita Rao (Obstetrics & Gynecology)",
                    admission_date=date(2026, 11, 22),
                    status="Admitted"
                ),
                Patient(
                    name="Rohan Verma",
                    age=45,
                    gender="Male",
                    ward="General Ward A",
                    department="General Medicine",
                    doctor="Dr. Ananya Iyer (General Medicine)",
                    admission_date=date(2026, 11, 15),
                    status="Discharged"
                ),
                Patient(
                    name="Meera Nair",
                    age=9,
                    gender="Female",
                    ward="Pediatrics Ward",
                    department="Pediatrics",
                    doctor="Dr. Priya Mehta (Pediatrics)",
                    admission_date=date(2026, 11, 24),
                    status="Admitted"
                ),
                Patient(
                    name="Kabir Sen",
                    age=62,
                    gender="Male",
                    ward="Orthopedic Ward",
                    department="Orthopedics",
                    doctor="Dr. Vikram Patel (Orthopedics)",
                    admission_date=date(2026, 11, 18),
                    status="Discharged"
                )
            ]
            db.session.add_all(sample_patients)
            db.session.commit()
            print("Successfully seeded initial sample patient data.")

if __name__ == "__main__":
    seed_sample_data()
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Flask Patient Management API on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
