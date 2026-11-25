import pytest
from datetime import date, timedelta
from app import create_app
from app.extensions import db
from app.models import Patient
from app.config import TestingConfig

@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def sample_patient(app):
    with app.app_context():
        p = Patient(
            name="John Doe",
            age=35,
            gender="Male",
            ward="General Ward A",
            department="General Medicine",
            doctor="Dr. Ananya Iyer (General Medicine)",
            admission_date=date(2026, 11, 20),
            status="Admitted"
        )
        db.session.add(p)
        db.session.commit()
        return p.to_dict()

# 1. Health endpoint test
def test_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "ok"
    assert "healthy" in data["database"]

# Options endpoint test
def test_options_endpoint(client):
    res = client.get("/api/options")
    assert res.status_code == 200
    data = res.get_json()
    assert "Male" in data["genders"]
    assert "ICU" in data["wards"]
    assert "Cardiology" in data["departments"]

# 2. Retrieve all patients test
def test_get_patients(client, sample_patient):
    res = client.get("/api/patients")
    assert res.status_code == 200
    data = res.get_json()
    assert "patients" in data
    assert len(data["patients"]) == 1
    assert data["patients"][0]["name"] == "John Doe"
    assert data["stats"]["total"] == 1
    assert data["stats"]["admitted"] == 1

# 3. Create patient successfully
def test_create_patient_success(client):
    payload = {
        "name": "Jane Smith",
        "age": 29,
        "gender": "Female",
        "ward": "Cardiology Ward",
        "department": "Cardiology",
        "doctor": "Dr. Rajesh Sharma (Cardiology)",
        "admission_date": "2026-11-21",
        "status": "Admitted"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert data["patient"]["name"] == "Jane Smith"
    assert data["patient"]["id"] is not None

# 4. Reject empty patient name
def test_reject_empty_patient_name(client):
    payload = {
        "name": "   ",
        "age": 30,
        "gender": "Male",
        "ward": "ICU",
        "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "name" in data["errors"]

# 5. Reject invalid name with numbers/special chars
def test_reject_invalid_name(client):
    payload = {
        "name": "John Doe 123!",
        "age": 30,
        "gender": "Male",
        "ward": "ICU",
        "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "name" in data["errors"]

# 6. Reject age below 0
def test_reject_age_below_zero(client):
    payload = {
        "name": "Baby Doe",
        "age": -1,
        "gender": "Other",
        "ward": "Pediatrics Ward",
        "department": "Pediatrics",
        "doctor": "Dr. Priya Mehta (Pediatrics)",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "age" in data["errors"]

# 7. Reject age above 120
def test_reject_age_above_120(client):
    payload = {
        "name": "Elder Doe",
        "age": 121,
        "gender": "Female",
        "ward": "General Ward A",
        "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "age" in data["errors"]

# 8. Reject decimal age
def test_reject_decimal_age(client):
    payload = {
        "name": "Test Person",
        "age": 25.5,
        "gender": "Male",
        "ward": "General Ward A",
        "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "age" in data["errors"]

# 9. Reject invalid dropdown values (gender, ward, department, doctor)
def test_reject_invalid_dropdown_values(client):
    payload = {
        "name": "Invalid Choice",
        "age": 40,
        "gender": "NonExistentGender",
        "ward": "Unknown Ward",
        "department": "Astrology",
        "doctor": "Dr. Frankenstein",
        "admission_date": "2026-11-20"
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "gender" in data["errors"]
    assert "ward" in data["errors"]
    assert "department" in data["errors"]
    assert "doctor" in data["errors"]

# 10. Reject future admission date
def test_reject_future_admission_date(client):
    tomorrow = (date.today() + timedelta(days=2)).strftime("%Y-%m-%d")
    payload = {
        "name": "Future Patient",
        "age": 30,
        "gender": "Male",
        "ward": "General Ward A",
        "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)",
        "admission_date": tomorrow
    }
    res = client.post("/api/patients", json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert "admission_date" in data["errors"]

# 11. Update patient
def test_update_patient(client, sample_patient):
    patient_id = sample_patient["id"]
    payload = {
        "name": "John Updated",
        "age": 36,
        "gender": "Male",
        "ward": "ICU",
        "department": "Cardiology",
        "doctor": "Dr. Rajesh Sharma (Cardiology)",
        "admission_date": "2026-11-19",
        "status": "Admitted"
    }
    res = client.put(f"/api/patients/{patient_id}", json=payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data["patient"]["name"] == "John Updated"
    assert data["patient"]["ward"] == "ICU"
    assert data["patient"]["age"] == 36

# 12. Delete patient
def test_delete_patient(client, sample_patient):
    patient_id = sample_patient["id"]
    res = client.delete(f"/api/patients/{patient_id}")
    assert res.status_code == 200

    # Ensure it can no longer be retrieved
    get_res = client.get(f"/api/patients/{patient_id}")
    assert get_res.status_code == 404

# 13. Discharge patient
def test_discharge_patient(client, sample_patient):
    patient_id = sample_patient["id"]
    res = client.patch(f"/api/patients/{patient_id}/discharge")
    assert res.status_code == 200
    data = res.get_json()
    assert data["patient"]["status"] == "Discharged"

    # Repeated discharge should fail
    repeat_res = client.patch(f"/api/patients/{patient_id}/discharge")
    assert repeat_res.status_code == 400

# 14. Search by name (case-insensitive substring)
def test_search_by_name(client):
    # Add two patients
    client.post("/api/patients", json={
        "name": "Robert Downey", "age": 50, "gender": "Male",
        "ward": "Cardiology Ward", "department": "Cardiology",
        "doctor": "Dr. Rajesh Sharma (Cardiology)", "admission_date": "2026-11-20"
    })
    client.post("/api/patients", json={
        "name": "Roberta Flack", "age": 70, "gender": "Female",
        "ward": "General Ward A", "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)", "admission_date": "2026-11-20"
    })
    client.post("/api/patients", json={
        "name": "Chris Evans", "age": 40, "gender": "Male",
        "ward": "Emergency Care", "department": "General Surgery",
        "doctor": "Dr. Arvind Nair (General Surgery)", "admission_date": "2026-11-20"
    })

    res = client.get("/api/patients?search=rober")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["patients"]) == 2

# 15. Filter by ward, department, and doctor
def test_filter_patients(client):
    client.post("/api/patients", json={
        "name": "Patient Alpha", "age": 22, "gender": "Male",
        "ward": "ICU", "department": "Neurology",
        "doctor": "Dr. Suresh Menon (Neurology)", "admission_date": "2026-11-20"
    })
    client.post("/api/patients", json={
        "name": "Patient Beta", "age": 23, "gender": "Female",
        "ward": "Pediatrics Ward", "department": "Pediatrics",
        "doctor": "Dr. Priya Mehta (Pediatrics)", "admission_date": "2026-11-20"
    })

    # Test Ward filter
    res_ward = client.get("/api/patients?ward=ICU")
    assert res_ward.status_code == 200
    assert len(res_ward.get_json()["patients"]) == 1
    assert res_ward.get_json()["patients"][0]["name"] == "Patient Alpha"

    # Test Department filter
    res_dept = client.get("/api/patients?department=Pediatrics")
    assert res_dept.status_code == 200
    assert len(res_dept.get_json()["patients"]) == 1
    assert res_dept.get_json()["patients"][0]["name"] == "Patient Beta"

    # Test Doctor filter
    res_doc = client.get("/api/patients?doctor=Dr.+Suresh+Menon+(Neurology)")
    assert res_doc.status_code == 200
    assert len(res_doc.get_json()["patients"]) == 1

# 16. Combined filtering (search + ward + department + doctor)
def test_combined_filtering(client):
    client.post("/api/patients", json={
        "name": "Sameer Khan", "age": 42, "gender": "Male",
        "ward": "Cardiology Ward", "department": "Cardiology",
        "doctor": "Dr. Rajesh Sharma (Cardiology)", "admission_date": "2026-11-20"
    })
    client.post("/api/patients", json={
        "name": "Sameer Joshi", "age": 55, "gender": "Male",
        "ward": "General Ward A", "department": "General Medicine",
        "doctor": "Dr. Ananya Iyer (General Medicine)", "admission_date": "2026-11-20"
    })

    # Filter with name 'Sameer' AND ward 'Cardiology Ward'
    res = client.get("/api/patients?search=sameer&ward=Cardiology+Ward&department=Cardiology")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["patients"]) == 1
    assert data["patients"][0]["name"] == "Sameer Khan"
