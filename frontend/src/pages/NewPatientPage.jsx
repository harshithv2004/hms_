import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import { getOptions, createPatient } from '../services/api';

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await getOptions();
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load options:', err);
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
