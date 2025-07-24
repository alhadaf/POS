import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Settings,
  Store,
  Receipt,
  BarChart3,
  Shield,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeModule, onModuleChange }) => {
  const { user, logout, hasPermission } = useAuth();
  const { isDarkMode, toggleDarkMode, currentStore } = useApp();

  const navigationItems = [
    {
      id: 'pos',
      name: 'Point of Sale',
      icon: ShoppingCart,
      permission: 'pos_operate',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: Package,
      permission: 'inventory_view',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      id: 'customers',
      name: 'Customers',
      icon: Users,
      permission: 'customer_view',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'staff',
      name: 'Staff',
      icon: UserCheck,
      permission: 'staff_view',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      permission: 'reports_view',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: Receipt,
      permission: 'reports_view',
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: BarChart3,
      permission: 'reports_view',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      permission: 'manager_approval',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      permission: 'settings_view',
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
    },
  ];

  const filteredItems = navigationItems.filter(item => hasPermission(item.permission));

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Store Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentStore?.name || 'SuperMarket POS'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.role.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? `${item.bgColor} ${item.color} shadow-md`
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile & Controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="font-medium">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;