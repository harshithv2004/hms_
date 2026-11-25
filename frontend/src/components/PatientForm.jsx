import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle, CheckCircle, UserPlus, FileEdit } from 'lucide-react';
import { validatePatient } from '../utils/validation';

export default function PatientForm({ initialData = null, options, onSubmit, isSubmitting }) {
  const navigate = useNavigate();
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    ward: '',
    department: '',
    doctor: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Admitted',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        age: initialData.age ?? '',
        gender: initialData.gender || '',
        ward: initialData.ward || '',
        department: initialData.department || '',
        doctor: initialData.doctor || '',
        admission_date: initialData.admission_date || new Date().toISOString().split('T')[0],
        status: initialData.status || 'Admitted',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user begins correcting
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Frontend validation
    const validation = validatePatient(formData, options);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        age: parseInt(formData.age, 10),
      });
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.errors) {
        setErrors(responseData.errors);
      } else if (responseData?.message) {
        setServerError(`${responseData.message}${responseData?.error ? ': ' + responseData.error : ''}`);
      } else {
        setServerError(err.message || 'Operation failed');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            {isEdit ? <FileEdit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEdit ? `Edit Patient Record: #${initialData.id}` : 'New Patient Admission'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update verified admission details below'
                : 'Enter patient information to process hospital admission'}
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            <p className="text-[11px] text-slate-400 mt-1">Letters and spaces only (no numbers or symbols).</p>
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Age (Years) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              min="0"
              max="120"
              placeholder="e.g. 34"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.age
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
            <p className="text-[11px] text-slate-400 mt-1">Integer between 0 and 120 (no decimals).</p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.gender
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              <option value="">Select Gender</option>
              {options?.genders?.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            {errors.gender && <p className="text-xs text-rose-500 mt-1">{errors.gender}</p>}
          </div>

          {/* Ward */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hospital Ward <span className="text-rose-500">*</span>
            </label>
            <select
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.ward
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              <option value="">Select Hospital Ward</option>
              {options?.wards?.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            {errors.ward && <p className="text-xs text-rose-500 mt-1">{errors.ward}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Medical Department <span className="text-rose-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.department
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              <option value="">Select Department</option>
              {options?.departments?.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.department && <p className="text-xs text-rose-500 mt-1">{errors.department}</p>}
          </div>

          {/* Doctor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attending Doctor <span className="text-rose-500">*</span>
            </label>
            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.doctor
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              <option value="">Select Attending Doctor</option>
              {options?.doctors?.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            {errors.doctor && <p className="text-xs text-rose-500 mt-1">{errors.doctor}</p>}
          </div>

          {/* Admission Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admission Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="admission_date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.admission_date}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.admission_date
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            />
            {errors.admission_date && (
              <p className="text-xs text-rose-500 mt-1">{errors.admission_date}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Must be today or a past date.</p>
          </div>

          {/* Admission Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admission Status <span className="text-rose-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.status
                  ? 'border-rose-300 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-500'
              }`}
            >
              <option value="Admitted">Admitted</option>
              <option value="Discharged">Discharged</option>
            </select>
            {errors.status && <p className="text-xs text-rose-500 mt-1">{errors.status}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Record...' : isEdit ? 'Save Changes' : 'Admit Patient'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
