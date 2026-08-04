import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { CampusMapPage } from './pages/CampusMapPage';

const AppContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();

  // Render appropriate dashboard depending on role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'student':
      case 'teacher':
      default:
        return <StudentDashboard />;
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'report':
        return <ReportIssuePage />;
      case 'details':
        return <ComplaintDetailsPage />;
      case 'map':
        return <CampusMapPage />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <main className="flex-1 w-full">
        {renderActivePage()}
      </main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
