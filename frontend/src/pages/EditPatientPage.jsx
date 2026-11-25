import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import { getOptions, getPatientById, updatePatient } from '../services/api';
import { AlertCircle } from 'lucide-react';

export default function EditPatientPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [opts, patientData] = await Promise.all([
          getOptions(),
          getPatientById(id),
        ]);
        setOptions(opts);
        setPatient(patientData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient record.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      await updatePatient(id, formData);
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 mt-3">Loading patient details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-rose-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h4 className="text-base font-bold text-slate-800">Error</h4>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-2">
      <PatientForm
        initialData={patient}
        options={options}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
