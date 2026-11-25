import re
from datetime import datetime, date

VALID_OPTIONS = {
    "genders": [
        "Male",
        "Female",
        "Other"
    ],
    "wards": [
        "General Ward A",
        "General Ward B",
        "ICU",
        "Pediatrics Ward",
        "Maternity Ward",
        "Orthopedic Ward",
        "Cardiology Ward",
        "Emergency Care"
    ],
    "departments": [
        "General Medicine",
        "Cardiology",
        "Orthopedics",
        "Pediatrics",
        "Neurology",
        "Obstetrics & Gynecology",
        "General Surgery",
        "Dermatology"
    ],
    "doctors": [
        "Dr. Rajesh Sharma (Cardiology)",
        "Dr. Ananya Iyer (General Medicine)",
        "Dr. Priya Mehta (Pediatrics)",
        "Dr. Vikram Patel (Orthopedics)",
        "Dr. Suresh Menon (Neurology)",
        "Dr. Sunita Rao (Obstetrics & Gynecology)",
        "Dr. Arvind Nair (General Surgery)",
        "Dr. Deepa Mukherjee (Dermatology)"
    ],
    "statuses": [
        "Admitted",
        "Discharged"
    ]
}

NAME_REGEX = re.compile(r"^[A-Za-z\s]+$")

def validate_patient_payload(data, is_update=False):
    """
    Validates patient data payload according to strict business logic.
    Returns: (is_valid, cleaned_data_or_error_dict)
    """
    errors = {}
    cleaned = {}

    # Check for empty body
    if not isinstance(data, dict):
        return False, {"error": "Invalid request format: JSON object expected"}

    # 1. Name validation
    if "name" in data or not is_update:
        raw_name = data.get("name")
        if raw_name is None or (isinstance(raw_name, str) and not raw_name.strip()):
            errors["name"] = "Patient name is required."
        elif not isinstance(raw_name, str):
            errors["name"] = "Patient name must be a string."
        else:
            name_val = raw_name.strip()
            if len(name_val) < 2 or len(name_val) > 100:
                errors["name"] = "Patient name must be between 2 and 100 characters."
            elif not NAME_REGEX.match(name_val):
                errors["name"] = "Patient name must contain alphabetic characters and spaces only."
            else:
                cleaned["name"] = name_val

    # 2. Age validation
    if "age" in data or not is_update:
        raw_age = data.get("age")
        if raw_age is None or raw_age == "":
            errors["age"] = "Age is required."
        else:
            # Reject boolean, floats, non-integer types
            if isinstance(raw_age, bool):
                errors["age"] = "Age must be an integer between 0 and 120."
            elif isinstance(raw_age, float):
                errors["age"] = "Age cannot be a decimal value. Please enter a whole integer."
            elif isinstance(raw_age, int):
                if raw_age < 0 or raw_age > 120:
                    errors["age"] = "Age must be an integer between 0 and 120."
                else:
                    cleaned["age"] = raw_age
            elif isinstance(raw_age, str):
                # Check if it looks like a decimal
                trimmed = raw_age.strip()
                if "." in trimmed:
                    errors["age"] = "Age cannot be a decimal value. Please enter a whole integer."
                elif trimmed.isdigit():
                    age_int = int(trimmed)
                    if age_int < 0 or age_int > 120:
                        errors["age"] = "Age must be an integer between 0 and 120."
                    else:
                        cleaned["age"] = age_int
                else:
                    errors["age"] = "Age must be a valid positive integer between 0 and 120."
            else:
                errors["age"] = "Age must be an integer between 0 and 120."

    # 3. Gender validation
    if "gender" in data or not is_update:
        gender = data.get("gender")
        if not gender or (isinstance(gender, str) and not gender.strip()):
            errors["gender"] = "Gender is required."
        elif gender not in VALID_OPTIONS["genders"]:
            errors["gender"] = f"Invalid gender. Allowed options: {', '.join(VALID_OPTIONS['genders'])}."
        else:
            cleaned["gender"] = gender

    # 4. Ward validation
    if "ward" in data or not is_update:
        ward = data.get("ward")
        if not ward or (isinstance(ward, str) and not ward.strip()):
            errors["ward"] = "Ward is required."
        elif ward not in VALID_OPTIONS["wards"]:
            errors["ward"] = f"Invalid ward. Must match an allowed ward option."
        else:
            cleaned["ward"] = ward

    # 5. Department validation
    if "department" in data or not is_update:
        department = data.get("department")
        if not department or (isinstance(department, str) and not department.strip()):
            errors["department"] = "Department is required."
        elif department not in VALID_OPTIONS["departments"]:
            errors["department"] = f"Invalid department. Must match an allowed department option."
        else:
            cleaned["department"] = department

    # 6. Doctor validation
    if "doctor" in data or not is_update:
        doctor = data.get("doctor")
        if not doctor or (isinstance(doctor, str) and not doctor.strip()):
            errors["doctor"] = "Doctor is required."
        elif doctor not in VALID_OPTIONS["doctors"]:
            errors["doctor"] = f"Invalid doctor. Must match an allowed doctor option."
        else:
            cleaned["doctor"] = doctor

    # 7. Admission Date validation
    if "admission_date" in data or not is_update:
        adm_date = data.get("admission_date")
        if not adm_date or (isinstance(adm_date, str) and not adm_date.strip()):
            errors["admission_date"] = "Admission date is required."
        else:
            try:
                if isinstance(adm_date, str):
                    parsed_date = datetime.strptime(adm_date.strip(), "%Y-%m-%d").date()
                elif isinstance(adm_date, date):
                    parsed_date = adm_date
                else:
                    raise ValueError()

                today = date.today()
                if parsed_date > today:
                    errors["admission_date"] = "Admission date cannot be in the future."
                else:
                    cleaned["admission_date"] = parsed_date
            except (ValueError, TypeError):
                errors["admission_date"] = "Admission date must be a valid date in YYYY-MM-DD format."

    # 8. Status validation
    if "status" in data or not is_update:
        status = data.get("status", "Admitted")
        if not status or (isinstance(status, str) and not status.strip()):
            cleaned["status"] = "Admitted"
        elif status not in VALID_OPTIONS["statuses"]:
            errors["status"] = f"Status must be either 'Admitted' or 'Discharged'."
        else:
            cleaned["status"] = status

    if errors:
        return False, {"message": "Validation failed", "errors": errors}

    return True, cleaned
