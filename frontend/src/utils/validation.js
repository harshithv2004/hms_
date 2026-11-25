export const validatePatient = (formData, validOptions = null) => {
  const errors = {};

  // Name: Required, letters and spaces only, 2-100 chars
  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Patient name is required.';
  } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
    errors.name = 'Patient name must contain alphabetic characters and spaces only.';
  } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
    errors.name = 'Patient name must be between 2 and 100 characters.';
  }

  // Age: Required, integer between 0 and 120
  if (formData.age === '' || formData.age === null || formData.age === undefined) {
    errors.age = 'Age is required.';
  } else {
    const ageStr = String(formData.age).trim();
    if (ageStr.includes('.')) {
      errors.age = 'Age cannot be a decimal value. Please enter a whole integer.';
    } else {
      const ageNum = Number(ageStr);
      if (isNaN(ageNum) || !Number.isInteger(ageNum)) {
        errors.age = 'Age must be a valid integer.';
      } else if (ageNum < 0 || ageNum > 120) {
        errors.age = 'Age must be an integer between 0 and 120.';
      }
    }
  }

  // Gender: Required, match allowed options
  if (!formData.gender) {
    errors.gender = 'Gender is required.';
  } else if (validOptions?.genders && !validOptions.genders.includes(formData.gender)) {
    errors.gender = 'Please select a valid gender from the options.';
  }

  // Ward: Required, match allowed options
  if (!formData.ward) {
    errors.ward = 'Ward is required.';
  } else if (validOptions?.wards && !validOptions.wards.includes(formData.ward)) {
    errors.ward = 'Please select a valid ward.';
  }

  // Department: Required, match allowed options
  if (!formData.department) {
    errors.department = 'Department is required.';
  } else if (validOptions?.departments && !validOptions.departments.includes(formData.department)) {
    errors.department = 'Please select a valid department.';
  }

  // Doctor: Required, match allowed options
  if (!formData.doctor) {
    errors.doctor = 'Doctor is required.';
  } else if (validOptions?.doctors && !validOptions.doctors.includes(formData.doctor)) {
    errors.doctor = 'Please select a valid doctor.';
  }

  // Admission Date: Required, valid date, not future
  if (!formData.admission_date) {
    errors.admission_date = 'Admission date is required.';
  } else {
    const selectedDate = new Date(formData.admission_date);
    const today = new Date();
    // Normalize today to start of day for accurate comparison
    today.setHours(23, 59, 59, 999);

    if (isNaN(selectedDate.getTime())) {
      errors.admission_date = 'Invalid admission date.';
    } else if (selectedDate > today) {
      errors.admission_date = 'Admission date cannot be in the future.';
    }
  }

  // Status: Either Admitted or Discharged
  if (formData.status && !['Admitted', 'Discharged'].includes(formData.status)) {
    errors.status = "Status must be either 'Admitted' or 'Discharged'.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
