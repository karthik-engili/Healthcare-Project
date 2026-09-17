import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import FloatingVoiceAssistant from '../components/common/FloatingVoiceAssistant';
import HealthcarePageBackground from '../components/common/HealthcarePageBackground';

const DashboardLayout = () => {
  const location = useLocation();

  // Determine variant based on route
  const getPageVariant = () => {
    const path = location.pathname;
    if (path.includes('upload') || path.includes('documents') || path.includes('reports')) return 'records';
    if (path.includes('reminders')) return 'dailycare';
    if (path.includes('ai-assistant') || path.includes('recommendations')) return 'ai';
    if (path.includes('emergency')) return 'emergency';
    return 'dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60 dark:bg-[#0B1220] transition-colors duration-200">
      <Navbar />
      <HealthcarePageBackground variant={getPageVariant()} className="flex-1 flex flex-col">
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <main className="w-full">
            <Outlet />
          </main>
        </div>
      </HealthcarePageBackground>
      <FloatingVoiceAssistant />
    </div>
  );
};

export default DashboardLayout;
