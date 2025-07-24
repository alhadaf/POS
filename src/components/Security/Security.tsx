import React, { useState, useMemo } from 'react';
import { 
  Shield,
  Eye,
  AlertTriangle,
  Lock,
  Key,
  Activity,
  Clock,
  User,
  FileText,
  Camera,
  Wifi,
  Database,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const Security: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { transactions } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // Mock security data (in a real app, this would come from a security service)
  const securityData = useMemo(() => {
    // Generate mock security incidents
    const incidents = [
      {
        id: '1',
        type: 'suspicious_transaction',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        description: 'Multiple void transactions by same cashier',
        employee: 'Sarah Johnson',
        amount: 245.67,
        status: 'investigating',
        details: 'Cashier voided 3 transactions within 30 minutes, totaling $245.67'
      },
      {
        id: '2',
        type: 'access_violation',
        severity: 'high',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        description: 'Unauthorized access attempt to admin panel',
        employee: 'Unknown',
        status: 'resolved',
        details: 'Failed login attempts from IP 192.168.1.100'
      },
      {
        id: '3',
        type: 'inventory_discrepancy',
        severity: 'low',
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        description: 'Stock count mismatch detected',
        employee: 'Mike Green',
        amount: 15.99,
        status: 'pending',
        details: 'Physical count differs from system count for Product SKU: PRD-001'
      },
      {
        id: '4',
        type: 'price_override',
        severity: 'medium',
        timestamp: new Date(Date.now() - 21600000), // 6 hours ago
        description: 'Frequent price overrides detected',
        employee: 'John Smith',
        amount: 89.50,
        status: 'resolved',
        details: 'Manager override used 5 times in 2 hours'
      }
    ];

    // System security status
    const systemStatus = {
      firewall: { status: 'active', lastUpdate: new Date(Date.now() - 86400000) },
      antivirus: { status: 'active', lastScan: new Date(Date.now() - 3600000) },
      encryption: { status: 'active', level: 'AES-256' },
      backups: { status: 'active', lastBackup: new Date(Date.now() - 7200000) },
      surveillance: { status: 'active', cameras: 12, recording: true },
      accessControl: { status: 'active', activeUsers: 8 }
    };

    // Audit logs
    const auditLogs = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1800000),
        user: 'John Smith',
        action: 'Price Override',
        resource: 'Product PRD-002',
        details: 'Changed price from $5.99 to $4.99',
        ipAddress: '192.168.1.50'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        user: 'Sarah Johnson',
        action: 'Transaction Void',
        resource: 'Transaction T12345678',
        details: 'Voided transaction worth $45.67',
        ipAddress: '192.168.1.51'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 5400000),
        user: 'System Administrator',
        action: 'User Login',
        resource: 'Admin Panel',
        details: 'Successful login to admin panel',
        ipAddress: '192.168.1.10'
      }
    ];

    return { incidents, systemStatus, auditLogs };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'investigating':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'suspicious_transaction':
        return AlertTriangle;
      case 'access_violation':
        return Lock;
      case 'inventory_discrepancy':
        return FileText;
      case 'price_override':
        return Key;
      default:
        return Shield;
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    status?: 'good' | 'warning' | 'error';
  }> = ({ title, value, icon: Icon, color, status }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {status && (
            <div className="flex items-center mt-2">
              {status === 'good' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />}
              {status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-1" />}
              {status === 'error' && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />}
              <span className={`text-sm ${
                status === 'good' ? 'text-green-600 dark:text-green-400' :
                status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {status === 'good' ? 'Secure' : status === 'warning' ? 'Attention' : 'Critical'}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (!hasPermission('manager_approval')) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to access security features.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security & Loss Prevention</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor security incidents, system status, and audit trails
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-400">System Secure</span>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Incidents"
          value={securityData.incidents.filter(i => i.status !== 'resolved').length.toString()}
          icon={AlertTriangle}
          color="bg-red-600"
          status={securityData.incidents.filter(i => i.status !== 'resolved').length > 0 ? 'warning' : 'good'}
        />
        <StatCard
          title="System Status"
          value="Operational"
          icon={Shield}
          color="bg-green-600"
          status="good"
        />
        <StatCard
          title="Surveillance"
          value={`${securityData.systemStatus.surveillance.cameras} Cameras`}
          icon={Camera}
          color="bg-blue-600"
          status="good"
        />
        <StatCard
          title="Access Control"
          value={`${securityData.systemStatus.accessControl.activeUsers} Active`}
          icon={Lock}
          color="bg-purple-600"
          status="good"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Security Overview', icon: Shield },
              { id: 'incidents', name: 'Security Incidents', icon: AlertTriangle },
              { id: 'system', name: 'System Status', icon: Settings },
              { id: 'audit', name: 'Audit Logs', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
          {/* Security Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Incidents */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
                  <div className="space-y-3">
                    {securityData.incidents.slice(0, 3).map((incident) => {
                      const Icon = getIncidentIcon(incident.type);
                      return (
                        <div key={incident.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{incident.description}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {incident.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Firewall</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Data Encryption</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400">AES-256</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Surveillance</span>
                      </div>
                      <span className="text-sm text-green-600 dark:text-green-400">Recording</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Metrics */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Metrics (Last 30 Days)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">98.5%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Monitoring Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Security Breaches</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Incidents</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {securityData.incidents.length} total incidents
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Incident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {securityData.incidents.map((incident) => {
                      const Icon = getIncidentIcon(incident.type);
                      return (
                        <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {incident.description}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {incident.type.replace('_', ' ').toUpperCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{incident.employee}</div>
                            {incident.amount && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">${incident.amount.toFixed(2)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                              {incident.severity.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                              {incident.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {incident.timestamp.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedIncident(incident);
                                setShowIncidentModal(true);
                              }}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Status Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Security Status</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(securityData.systemStatus).map(([key, status]) => {
                  let icon, title, details;
                  
                  switch (key) {
                    case 'firewall':
                      icon = Shield;
                      title = 'Firewall Protection';
                      details = `Last updated: ${status.lastUpdate.toLocaleString()}`;
                      break;
                    case 'antivirus':
                      icon = Shield;
                      title = 'Antivirus Protection';
                      details = `Last scan: ${status.lastScan.toLocaleString()}`;
                      break;
                    case 'encryption':
                      icon = Lock;
                      title = 'Data Encryption';
                      details = `Encryption level: ${status.level}`;
                      break;
                    case 'backups':
                      icon = Database;
                      title = 'Data Backups';
                      details = `Last backup: ${status.lastBackup.toLocaleString()}`;
                      break;
                    case 'surveillance':
                      icon = Camera;
                      title = 'Video Surveillance';
                      details = `${status.cameras} cameras, ${status.recording ? 'Recording' : 'Not recording'}`;
                      break;
                    case 'accessControl':
                      icon = Key;
                      title = 'Access Control';
                      details = `${status.activeUsers} active users`;
                      break;
                    default:
                      icon = Settings;
                      title = key;
                      details = 'System component';
                  }
                  
                  const Icon = icon;
                  
                  return (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h4>
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          status.status === 'active' 
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                            : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {status.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {securityData.auditLogs.length} recent activities
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {securityData.auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.user}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{log.action}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{log.resource}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {log.details}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{log.ipAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.timestamp.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Incident Detail Modal */}
      {showIncidentModal && selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Incident Details
              </h3>
              <button
                onClick={() => setShowIncidentModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Incident ID</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedIncident.status)}`}>
                    {selectedIncident.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.employee}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timestamp</label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.timestamp.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Details</label>
                <p className="text-sm text-gray-900 dark:text-white">{selectedIncident.details}</p>
              </div>
              
              {selectedIncident.amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Involved</label>
                  <p className="text-sm text-gray-900 dark:text-white">${selectedIncident.amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;