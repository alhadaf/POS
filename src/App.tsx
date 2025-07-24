import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/Login';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import BranchManagement from './components/BranchManagement/BranchManagement';
import POSSystem from './components/POS/POSSystem';
import InventoryManagement from './components/Inventory/InventoryManagement';
import CustomerManagement from './components/Customers/CustomerManagement';
import StaffManagement from './components/Staff/StaffManagement';
import Analytics from './components/Analytics/Analytics';
import TransactionHistory from './components/Transactions/TransactionHistory';
import Reports from './components/Reports/Reports';
import Security from './components/Security/Security';
import Settings from './components/Settings/Settings';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'branches':
        return <BranchManagement />;
      case 'pos':
        return <POSSystem />;
      case 'inventory':
        return <InventoryManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'analytics':
        return <Analytics />;
      case 'transactions':
        return <TransactionHistory />;
      case 'reports':
        return <Reports />;
      case 'security':
        return <Security />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-64 flex-shrink-0">
        <Navigation activeModule={activeModule} onModuleChange={setActiveModule} />
      </div>
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;