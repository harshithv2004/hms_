import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import { getOptions, createPatient } from '../services/api';
import { DEFAULT_OPTIONS } from '../utils/validation';

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await getOptions();
        if (opts && opts.genders) {
          setOptions(opts);
        }
      } catch (err) {
        console.warn('API options request failed, using default options:', err);
      }
    };
    fetchOptions();
  }, []);

  const handleCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      await createPatient(formData);
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2">
      <PatientForm
        options={options}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
