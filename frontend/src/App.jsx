import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import NewPatientPage from './pages/NewPatientPage';
import EditPatientPage from './pages/EditPatientPage';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex">
        {/* Left Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Main Content Area */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0">
          <Header setMobileOpen={setMobileOpen} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/patients" element={<DashboardPage />} />
              <Route path="/patients/new" element={<NewPatientPage />} />
              <Route path="/patients/:id/edit" element={<EditPatientPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
