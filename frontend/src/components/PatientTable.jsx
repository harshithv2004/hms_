import React from 'react';
import { Edit2, CheckCircle2, Trash2, Calendar, User, Clock, AlertCircle } from 'lucide-react';

export default function PatientTable({
  patients,
  loading,
  error,
  onEdit,
  onDelete,
  onDischarge,
  dischargingId,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="inline-block w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 mt-3">Loading admission records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h4 className="text-base font-bold text-slate-800">Failed to load patients</h4>
        <p className="text-sm text-slate-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">No Patient Records Found</h4>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or add a new patient.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Patient</th>
              <th className="py-3.5 px-4">Age / Sex</th>
              <th className="py-3.5 px-4">Ward</th>
              <th className="py-3.5 px-4">Department & Doctor</th>
              <th className="py-3.5 px-4">Admission Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {patients.map((patient) => {
              const isAdmitted = patient.status === 'Admitted';
              const isDischarging = dischargingId === patient.id;

              return (
                <tr key={patient.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Name & ID */}
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-slate-900">
                    <div className="font-semibold text-slate-800">{patient.name}</div>
                    <div className="text-xs text-slate-400 font-mono">ID: #{patient.id}</div>
                  </td>

                  {/* Age / Gender */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{patient.age} yrs</div>
                    <div className="text-xs text-slate-400">{patient.gender}</div>
                  </td>

                  {/* Ward */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {patient.ward}
                    </span>
                  </td>

                  {/* Department & Doctor */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-700">{patient.department}</div>
                    <div className="text-xs text-slate-400 line-clamp-1">{patient.doctor}</div>
                  </td>

                  {/* Admission Date */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{patient.admission_date}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isAdmitted
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAdmitted ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      ></span>
                      {patient.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Mark Discharged Action */}
                      {isAdmitted && (
                        <button
                          onClick={() => onDischarge(patient.id)}
                          disabled={isDischarging}
                          title="Mark as Discharged"
                          className="px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Discharge</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(patient)}
                        title="Edit Patient"
                        className="p-1.5 rounded-md text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(patient)}
                        title="Delete Patient"
                        className="p-1.5 rounded-md text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-slate-50/50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {patients.length} records</span>
        <span className="text-[11px] text-slate-400">Total hospital admissions record</span>
      </div>
    </div>
  );
}
