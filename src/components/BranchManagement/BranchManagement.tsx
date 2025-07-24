import React, { useState, useMemo } from 'react';
import { 
  Store,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Clock,
  Users,
  Settings,
  Eye,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { StoreLocation } from '../../types';

const BranchManagement: React.FC = () => {
  const { storeLocations, addStoreLocation, updateStoreLocation, deleteStoreLocation, getAllBranchesAnalytics } = useApp();
  const { hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState<StoreLocation | null>(null);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Get analytics for all branches
  const branchAnalytics = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    return getAllBranchesAnalytics(startDate, endDate);
  }, [getAllBranchesAnalytics]);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return storeLocations.filter(branch => {
      const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           branch.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           branch.phoneNumber.includes(searchQuery);
      
      const matchesRegion = regionFilter === 'all' || branch.region === regionFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && branch.isActive) ||
                           (statusFilter === 'inactive' && !branch.isActive);
      
      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [storeLocations, searchQuery, regionFilter, statusFilter]);

  // Branch statistics
  const branchStats = useMemo(() => {
    const totalBranches = storeLocations.length;
    const activeBranches = storeLocations.filter(b => b.isActive).length;
    const totalRevenue = branchAnalytics.reduce((sum, analytics) => sum + analytics.sales.totalRevenue, 0);
    const totalTransactions = branchAnalytics.reduce((sum, analytics) => sum + analytics.sales.totalTransactions, 0);
    const averageRevenuePerBranch = activeBranches > 0 ? totalRevenue / activeBranches : 0;
    
    return { totalBranches, activeBranches, totalRevenue, totalTransactions, averageRevenuePerBranch };
  }, [storeLocations, branchAnalytics]);

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    trend?: string;
  }> = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trend}</p>
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
        <Store className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to manage branches.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branch Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage store locations and monitor branch performance
          </p>
        </div>
        <button 
          onClick={() => setShowAddBranch(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Branches"
          value={branchStats.totalBranches.toString()}
          icon={Store}
          color="bg-blue-600"
          trend="All locations"
        />
        <StatCard
          title="Active Branches"
          value={branchStats.activeBranches.toString()}
          icon={BarChart3}
          color="bg-green-600"
          trend="Currently operating"
        />
        <StatCard
          title="Total Revenue"
          value={`$${branchStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-600"
          trend="Last 30 days"
        />
        <StatCard
          title="Total Transactions"
          value={branchStats.totalTransactions.toLocaleString()}
          icon={TrendingUp}
          color="bg-orange-600"
          trend="All branches"
        />
        <StatCard
          title="Avg Revenue/Branch"
          value={`$${branchStats.averageRevenuePerBranch.toLocaleString()}`}
          icon={BarChart3}
          color="bg-teal-600"
          trend="Per active branch"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Branch Overview', icon: Store },
              { id: 'analytics', name: 'Performance Analytics', icon: BarChart3 },
              { id: 'settings', name: 'Branch Settings', icon: Settings }
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
          {/* Branch Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Filters and Search */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, city, or phone..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Region Filter */}
                <div>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Regions</option>
                    <option value="West Coast">West Coast</option>
                    <option value="East Coast">East Coast</option>
                    <option value="Midwest">Midwest</option>
                    <option value="South">South</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Branch Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map((branch) => {
                  const analytics = branchAnalytics.find(a => a.storeId === branch.id);
                  
                  return (
                    <div key={branch.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${branch.isActive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                            <Store className={`h-5 w-5 ${branch.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{branch.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{branch.region}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          branch.isActive 
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                            : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{branch.address.street}, {branch.address.city}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4" />
                          <span>{branch.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4" />
                          <span>Manager: {branch.manager.firstName} {branch.manager.lastName}</span>
                        </div>
                      </div>

                      {analytics && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">30-Day Performance</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                ${analytics.sales.totalRevenue.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Transactions</p>
                              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {analytics.sales.totalTransactions}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order</p>
                              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                ${analytics.sales.averageOrderValue.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                              <p className={`text-lg font-semibold ${
                                analytics.sales.growth >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {analytics.sales.growth >= 0 ? '+' : ''}{analytics.sales.growth.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {branch.operatingHours.monday.open} - {branch.operatingHours.monday.close}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBranch(branch);
                              setShowBranchModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBranches.length === 0 && (
                <div className="text-center py-12">
                  <Store className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No branches found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Performance Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Branch Performance Comparison</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Comparison */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue by Branch</h4>
                  <div className="space-y-4">
                    {branchAnalytics.map((analytics, index) => {
                      const maxRevenue = Math.max(...branchAnalytics.map(a => a.sales.totalRevenue));
                      const percentage = maxRevenue > 0 ? (analytics.sales.totalRevenue / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={analytics.storeId} className="flex items-center space-x-3">
                          <div className="w-4 text-sm text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {analytics.storeName}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ${analytics.sales.totalRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transaction Volume */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction Volume</h4>
                  <div className="space-y-4">
                    {branchAnalytics.map((analytics, index) => {
                      const maxTransactions = Math.max(...branchAnalytics.map(a => a.sales.totalTransactions));
                      const percentage = maxTransactions > 0 ? (analytics.sales.totalTransactions / maxTransactions) * 100 : 0;
                      
                      return (
                        <div key={analytics.storeId} className="flex items-center space-x-3">
                          <div className="w-4 text-sm text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {analytics.storeName}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {analytics.sales.totalTransactions} txns
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Performance Metrics Table */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Performance Metrics</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Transactions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Avg Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Growth
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customers
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {branchAnalytics.map((analytics) => (
                        <tr key={analytics.storeId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {analytics.storeName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              ${analytics.sales.totalRevenue.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {analytics.sales.totalTransactions}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              ${analytics.sales.averageOrderValue.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              analytics.sales.growth >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {analytics.sales.growth >= 0 ? '+' : ''}{analytics.sales.growth.toFixed(1)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {analytics.customers.totalCustomers}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Branch Settings Tab */}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Branch Settings</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configure individual branch settings and preferences
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Branch Detail Modal */}
      {showBranchModal && selectedBranch && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Branch Details - {selectedBranch.name}
              </h3>
              <button
                onClick={() => setShowBranchModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Branch Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBranch.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedBranch.address.street}<br />
                        {selectedBranch.address.city}, {selectedBranch.address.state} {selectedBranch.address.zipCode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBranch.phoneNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedBranch.region}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manager</label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedBranch.manager.firstName} {selectedBranch.manager.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Operating Hours
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedBranch.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {day}:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {hours.isClosed ? 'Closed' : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Data */}
              <div className="space-y-6">
                {(() => {
                  const analytics = branchAnalytics.find(a => a.storeId === selectedBranch.id);
                  if (!analytics) return null;
                  
                  return (
                    <>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                        <h4 className="text-lg font-semibold mb-4">30-Day Performance</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-blue-100">Revenue</p>
                            <p className="text-2xl font-bold">${analytics.sales.totalRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-blue-100">Transactions</p>
                            <p className="text-2xl font-bold">{analytics.sales.totalTransactions}</p>
                          </div>
                          <div>
                            <p className="text-blue-100">Avg Order</p>
                            <p className="text-2xl font-bold">${analytics.sales.averageOrderValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-blue-100">Growth</p>
                            <p className="text-2xl font-bold">
                              {analytics.sales.growth >= 0 ? '+' : ''}{analytics.sales.growth.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Top Products
                        </h4>
                        <div className="space-y-3">
                          {analytics.topProducts.slice(0, 5).map((product, index) => (
                            <div key={product.productId} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {product.quantitySold} sold
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${product.revenue.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;