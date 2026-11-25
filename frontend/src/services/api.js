import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const res = await api.get('/api/health');
  return res.data;
};

export const getOptions = async () => {
  const res = await api.get('/api/options');
  return res.data;
};

export const getPatients = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.ward) query.append('ward', params.ward);
  if (params.department) query.append('department', params.department);
  if (params.doctor) query.append('doctor', params.doctor);
  if (params.status) query.append('status', params.status);

  const res = await api.get(`/api/patients?${query.toString()}`);
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await api.get(`/api/patients/${id}`);
  return res.data;
};

export const createPatient = async (patientData) => {
  const res = await api.post('/api/patients', patientData);
  return res.data;
};

export const updatePatient = async (id, patientData) => {
  const res = await api.put(`/api/patients/${id}`, patientData);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await api.delete(`/api/patients/${id}`);
  return res.data;
};

export const dischargePatient = async (id) => {
  const res = await api.patch(`/api/patients/${id}/discharge`);
  return res.data;
};

export default api;
