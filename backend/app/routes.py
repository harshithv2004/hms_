from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from app.extensions import db
from app.models import Patient
from app.validation import VALID_OPTIONS, validate_patient_payload

api_bp = Blueprint("api", __name__, url_prefix="/api")

@api_bp.route("/health", methods=["GET"])
def health_check():
    """Check backend and database health status."""
    db_status = "healthy"
    try:
        # Simple test query
        db.session.execute(db.select(1))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return jsonify({
        "status": "ok",
        "service": "Patient Admission Management API",
        "database": db_status
    }), 200

@api_bp.route("/options", methods=["GET"])
def get_options():
    """Return valid dropdown options for frontend synchronization."""
    return jsonify({
        "genders": VALID_OPTIONS["genders"],
        "wards": VALID_OPTIONS["wards"],
        "departments": VALID_OPTIONS["departments"],
        "doctors": VALID_OPTIONS["doctors"],
        "statuses": VALID_OPTIONS["statuses"]
    }), 200

@api_bp.route("/patients", methods=["GET"])
def get_patients():
    """
    Retrieve patients with optional:
    - search by name (case-insensitive substring)
    - ward filter
    - department filter
    - doctor filter
    - status filter
    """
    try:
        query = db.select(Patient)

        # Search parameter (case-insensitive partial matching on name)
        search = request.args.get("search", "").strip()
        if search:
            query = query.where(Patient.name.ilike(f"%{search}%"))

        # Ward filter
        ward = request.args.get("ward", "").strip()
        if ward:
            query = query.where(Patient.ward == ward)

        # Department filter
        department = request.args.get("department", "").strip()
        if department:
            query = query.where(Patient.department == department)

        # Doctor filter
        doctor = request.args.get("doctor", "").strip()
        if doctor:
            query = query.where(Patient.doctor == doctor)

        # Status filter (optional helper)
        status = request.args.get("status", "").strip()
        if status:
            query = query.where(Patient.status == status)

        # Order by latest created first
        query = query.order_by(Patient.created_at.desc(), Patient.id.desc())

        patients = db.session.scalars(query).all()
        
        # Calculate summary statistics for the dashboard
        total_count = db.session.scalar(db.select(db.func.count(Patient.id))) or 0
        admitted_count = db.session.scalar(
            db.select(db.func.count(Patient.id)).where(Patient.status == "Admitted")
        ) or 0
        discharged_count = db.session.scalar(
            db.select(db.func.count(Patient.id)).where(Patient.status == "Discharged")
        ) or 0

        return jsonify({
            "patients": [p.to_dict() for p in patients],
            "count": len(patients),
            "stats": {
                "total": total_count,
                "admitted": admitted_count,
                "discharged": discharged_count
            }
        }), 200
    except Exception as e:
        return jsonify({"message": "Error fetching patients", "error": str(e)}), 500

@api_bp.route("/patients/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    """Retrieve details for a single patient."""
    try:
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return jsonify({"message": f"Patient with ID {patient_id} not found."}), 404
        return jsonify(patient.to_dict()), 200
    except Exception as e:
        return jsonify({"message": "Error fetching patient", "error": str(e)}), 500

@api_bp.route("/patients", methods=["POST"])
def create_patient():
    """Create a new patient record."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "Validation failed", "errors": {"body": "Invalid JSON body or empty payload"}}), 400

    is_valid, result = validate_patient_payload(data, is_update=False)
    if not is_valid:
        return jsonify(result), 400

    try:
        new_patient = Patient(
            name=result["name"],
            age=result["age"],
            gender=result["gender"],
            ward=result["ward"],
            department=result["department"],
            doctor=result["doctor"],
            admission_date=result["admission_date"],
            status=result.get("status", "Admitted")
        )
        db.session.add(new_patient)
        db.session.commit()

        return jsonify({
            "message": "Patient admitted successfully",
            "patient": new_patient.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create patient record", "error": str(e)}), 500

@api_bp.route("/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    """Update an existing patient record."""
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"message": f"Patient with ID {patient_id} not found."}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"message": "Validation failed", "errors": {"body": "Invalid JSON body or empty payload"}}), 400

    is_valid, result = validate_patient_payload(data, is_update=True)
    if not is_valid:
        return jsonify(result), 400

    try:
        for field, value in result.items():
            setattr(patient, field, value)

        db.session.commit()
        return jsonify({
            "message": "Patient record updated successfully",
            "patient": patient.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to update patient record", "error": str(e)}), 500

@api_bp.route("/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    """Permanently delete a patient record."""
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"message": f"Patient with ID {patient_id} not found."}), 404

    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({
            "message": f"Patient record #{patient_id} has been permanently deleted."
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete patient record", "error": str(e)}), 500

@api_bp.route("/patients/<int:patient_id>/discharge", methods=["PATCH"])
def discharge_patient(patient_id):
    """Mark a patient as discharged."""
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"message": f"Patient with ID {patient_id} not found."}), 404

    if patient.status == "Discharged":
        return jsonify({
            "message": "Patient is already marked as Discharged.",
            "patient": patient.to_dict()
        }), 400

    try:
        patient.status = "Discharged"
        db.session.commit()
        return jsonify({
            "message": f"Patient #{patient_id} ({patient.name}) successfully discharged.",
            "patient": patient.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to discharge patient", "error": str(e)}), 500
