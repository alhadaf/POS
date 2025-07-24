import React, { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Store,
  Users,
  CreditCard,
  Bell,
  Shield,
  Database,
  Printer,
  Wifi,
  Monitor,
  Globe,
  Clock,
  DollarSign,
  Package,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const Settings: React.FC = () => {
  const { hasPermission } = useAuth();
  const { currentStore, isDarkMode, toggleDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  // Mock settings data (in a real app, this would come from a settings service)
  const [settings, setSettings] = useState({
    general: {
      storeName: currentStore?.name || 'SuperMarket POS',
      storeAddress: '123 Main Street, City, State 12345',
      phoneNumber: '(555) 123-4567',
      email: 'info@supermarket.com',
      website: 'www.supermarket.com',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    },
    pos: {
      autoLogout: 30,
      receiptPrinter: 'Epson TM-T88V',
      barcodeScanner: 'Honeywell Voyager 1200g',
      cashDrawer: 'APG Vasario 1616',
      customerDisplay: 'Enabled',
      soundEffects: true,
      printReceipts: true,
      emailReceipts: false
    },
    inventory: {
      lowStockThreshold: 10,
      autoReorder: false,
      reorderQuantity: 50,
      trackExpiration: true,
      batchTracking: true,
      serialNumbers: false,
      costMethod: 'FIFO'
    },
    payments: {
      acceptCash: true,
      acceptCredit: true,
      acceptDebit: true,
      acceptMobile: true,
      acceptGiftCards: true,
      tipOptions: [15, 18, 20, 25],
      minimumCardAmount: 0,
      cashbackLimit: 100
    },
    security: {
      passwordExpiry: 90,
      sessionTimeout: 60,
      twoFactorAuth: false,
      auditLogging: true,
      encryptData: true,
      backupFrequency: 'daily',
      cameraRecording: true
    },
    notifications: {
      lowStock: true,
      systemAlerts: true,
      salesReports: true,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    },
    taxes: {
      defaultTaxRate: 8.75,
      taxInclusive: false,
      taxExemptItems: ['groceries', 'medicine'],
      taxHolidays: true,
      roundingMethod: 'nearest_cent'
    },
    reports: {
      autoGenerate: true,
      emailReports: true,
      reportFrequency: 'daily',
      retentionPeriod: 365,
      includeGraphs: true
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // In a real app, this would save to a backend service
    console.log('Saving settings:', settings);
    setHasChanges(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setHasChanges(false);
      alert('Settings reset to defaults!');
    }
  };

  const settingsTabs = [
    { id: 'general', name: 'General', icon: Store },
    { id: 'pos', name: 'Point of Sale', icon: Monitor },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'taxes', name: 'Taxes', icon: DollarSign },
    { id: 'reports', name: 'Reports', icon: Database }
  ];

  const SettingGroup: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingItem: React.FC<{
    label: string;
    description?: string;
    children: React.ReactNode;
  }> = ({ label, description, children }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  if (!hasPermission('settings_view')) {
    return (
      <div className="p-6 text-center">
        <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to access settings.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system preferences and operational parameters
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Unsaved changes</span>
          )}
          <button
            onClick={resetSettings}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <SettingGroup title="Store Information">
                <SettingItem label="Store Name">
                  <input
                    type="text"
                    value={settings.general.storeName}
                    onChange={(e) => handleSettingChange('general', 'storeName', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingItem>
                <SettingItem label="Address">
                  <input
                    type="text"
                    value={settings.general.storeAddress}
                    onChange={(e) => handleSettingChange('general', 'storeAddress', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingItem>
                <SettingItem label="Phone Number">
                  <input
                    type="tel"
                    value={settings.general.phoneNumber}
                    onChange={(e) => handleSettingChange('general', 'phoneNumber', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingItem>
                <SettingItem label="Email">
                  <input
                    type="email"
                    value={settings.general.email}
                    onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingItem>
              </SettingGroup>

              <SettingGroup title="Regional Settings">
                <SettingItem label="Timezone">
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </SettingItem>
                <SettingItem label="Currency">
                  <select
                    value={settings.general.currency}
                    onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">US Dollar (USD)</option>
                    <option value="CAD">Canadian Dollar (CAD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </SettingItem>
                <SettingItem label="Language">
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </SettingItem>
              </SettingGroup>

              <SettingGroup title="Display Settings">
                <SettingItem label="Dark Mode" description="Toggle between light and dark themes">
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </SettingItem>
              </SettingGroup>
            </div>
          )}

          {/* POS Settings */}
          {activeTab === 'pos' && (
            <div className="space-y-6">
              <SettingGroup title="Hardware Configuration">
                <SettingItem label="Receipt Printer">
                  <select
                    value={settings.pos.receiptPrinter}
                    onChange={(e) => handleSettingChange('pos', 'receiptPrinter', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Epson TM-T88V">Epson TM-T88V</option>
                    <option value="Star TSP143III">Star TSP143III</option>
                    <option value="Zebra ZD220">Zebra ZD220</option>
                  </select>
                </SettingItem>
                <SettingItem label="Barcode Scanner">
                  <select
                    value={settings.pos.barcodeScanner}
                    onChange={(e) => handleSettingChange('pos', 'barcodeScanner', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Honeywell Voyager 1200g">Honeywell Voyager 1200g</option>
                    <option value="Symbol LS2208">Symbol LS2208</option>
                    <option value="Zebra DS2208">Zebra DS2208</option>
                  </select>
                </SettingItem>
                <SettingItem label="Cash Drawer">
                  <select
                    value={settings.pos.cashDrawer}
                    onChange={(e) => handleSettingChange('pos', 'cashDrawer', e.target.value)}
                    className="w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="APG Vasario 1616">APG Vasario 1616</option>
                    <option value="Star SMD2-1317">Star SMD2-1317</option>
                    <option value="MMF Val-u Line">MMF Val-u Line</option>
                  </select>
                </SettingItem>
              </SettingGroup>

              <SettingGroup title="User Interface">
                <SettingItem label="Auto Logout (minutes)" description="Automatically log out inactive users">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.pos.autoLogout}
                    onChange={(e) => handleSettingChange('pos', 'autoLogout', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </SettingItem>
                <SettingItem label="Sound Effects" description="Play sounds for button presses and alerts">
                  <button
                    onClick={() => handleSettingChange('pos', 'soundEffects', !settings.pos.soundEffects)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pos.soundEffects ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pos.soundEffects ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </SettingItem>
                <SettingItem label="Customer Display" description="Show transaction details to customers">
                  <select
                    value={settings.pos.customerDisplay}
                    onChange={(e) => handleSettingChange('pos', 'customerDisplay', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Enabled">Enabled</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </SettingItem>
              </SettingGroup>

              <SettingGroup title="Receipt Options">
                <SettingItem label="Print Receipts" description="Automatically print receipts for transactions">
                  <button
                    onClick={() => handleSettingChange('pos', 'printReceipts', !settings.pos.printReceipts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pos.printReceipts ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pos.printReceipts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </SettingItem>
                <SettingItem label="Email Receipts" description="Offer to email receipts to customers">
                  <button
                    onClick={() => handleSettingChange('pos', 'emailReceipts', !settings.pos.emailReceipts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.pos.emailReceipts ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.pos.emailReceipts ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </SettingItem>
              </SettingGroup>
            </div>
          )}

          {/* Add other tab content here... */}
          {activeTab !== 'general' && activeTab !== 'pos' && (
            <div className="text-center py-12">
              <SettingsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {settingsTabs.find(tab => tab.id === activeTab)?.name} Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configuration options for this section are coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;