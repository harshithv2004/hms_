import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw, Activity, ArrowRight } from 'lucide-react';
import StatCards from '../components/StatCards';
import SearchAndFilters from '../components/SearchAndFilters';
import PatientTable from '../components/PatientTable';
import DeleteModal from '../components/DeleteModal';
import {
  getPatients,
  getOptions,
  dischargePatient,
  deletePatient,
} from '../services/api';
import { DEFAULT_OPTIONS } from '../utils/validation';

export default function DashboardPage() {
  const navigate = useNavigate();

  // State
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, admitted: 0, discharged: 0 });
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    ward: '',
    department: '',
    doctor: '',
    status: '',
  });

  // Action states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dischargingId, setDischargingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Load dropdown options once
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const opts = await getOptions();
        setOptions(opts);
      } catch (err) {
        console.error('Failed to load options:', err);
      }
    };
    fetchDropdownOptions();
  }, []);

  // Fetch patients whenever search or filters change
  const fetchPatientList = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPatients({
        search,
        ward: filters.ward,
        department: filters.department,
        doctor: filters.doctor,
        status: filters.status,
      });
      setPatients(data.patients || []);
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve patient admissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatientList();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, filters]);

  // Handle Mark as Discharged
  const handleDischarge = async (id) => {
    setDischargingId(id);
    try {
      const res = await dischargePatient(id);
      showNotification('success', res.message || 'Patient marked as discharged.');
      // Refresh list and stats
      fetchPatientList();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to discharge patient.');
    } finally {
      setDischargingId(null);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deletePatient(deleteTarget.id);
      showNotification('success', res.message || 'Patient record deleted.');
      setDeleteTarget(null);
      fetchPatientList();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to delete patient.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ ward: '', department: '', doctor: '', status: '' });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 border ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Patient Admission Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time patient census, ward allocations, and status tracking
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPatientList()}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/patients/new"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Patient</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Search and Filters */}
      <SearchAndFilters
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        options={options}
        onReset={handleResetFilters}
      />

      {/* Patient Listing Table */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-bold text-slate-800">Admitted & Discharged Patients</h2>
          <span className="text-xs text-slate-400">Click actions to manage records</span>
        </div>

        <PatientTable
          patients={patients}
          loading={loading}
          error={error}
          onEdit={(patient) => navigate(`/patients/${patient.id}/edit`)}
          onDelete={(patient) => setDeleteTarget(patient)}
          onDischarge={handleDischarge}
          dischargingId={dischargingId}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        patient={deleteTarget}
        deleting={isDeleting}
      />
    </div>
  );
}
