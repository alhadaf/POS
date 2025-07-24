import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Store,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { storeLocations, getAllBranchesAnalytics, customers, products } = useApp();
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Calculate date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }
    
    return { start, end: now };
  };

  const { start: startDate, end: endDate } = getDateRange(selectedTimeRange);

  // Get analytics for all branches
  const allBranchAnalytics = useMemo(() => {
    return getAllBranchesAnalytics(startDate, endDate);
  }, [getAllBranchesAnalytics, startDate, endDate]);

  // Filter analytics by selected branch
  const filteredAnalytics = useMemo(() => {
    if (selectedBranch === 'all') {
      return allBranchAnalytics;
    }
    return allBranchAnalytics.filter(analytics => analytics.storeId === selectedBranch);
  }, [allBranchAnalytics, selectedBranch]);

  // Aggregate metrics
  const aggregatedMetrics = useMemo(() => {
    const totalRevenue = filteredAnalytics.reduce((sum, a) => sum + a.sales.totalRevenue, 0);
    const totalTransactions = filteredAnalytics.reduce((sum, a) => sum + a.sales.totalTransactions, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalCustomers = filteredAnalytics.reduce((sum, a) => sum + a.customers.totalCustomers, 0);
    const averageGrowth = filteredAnalytics.length > 0 
      ? filteredAnalytics.reduce((sum, a) => sum + a.sales.growth, 0) / filteredAnalytics.length 
      : 0;
    
    // Top performing branch
    const topBranch = filteredAnalytics.reduce((top, current) => 
      current.sales.totalRevenue > top.sales.totalRevenue ? current : top, 
      filteredAnalytics[0] || { sales: { totalRevenue: 0 }, storeName: 'N/A' }
    );

    // Underperforming branches (negative growth)
    const underperformingBranches = filteredAnalytics.filter(a => a.sales.growth < 0);

    return {
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      totalCustomers,
      averageGrowth,
      topBranch,
      underperformingBranches,
      activeBranches: storeLocations.filter(s => s.isActive).length,
      totalBranches: storeLocations.length
    };
  }, [filteredAnalytics, storeLocations]);

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon: React.ElementType;
    color: string;
  }> = ({ title, value, change, changeType, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 
              changeType === 'decrease' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {changeType === 'increase' && <TrendingUp className="h-4 w-4 mr-1" />}
              {changeType === 'decrease' && <TrendingDown className="h-4 w-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const ChartCard: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Multi-branch analytics and performance overview
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {storeLocations.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            
            {/* Time Range Filter */}
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${aggregatedMetrics.totalRevenue.toLocaleString()}`}
          change={`${aggregatedMetrics.averageGrowth > 0 ? '+' : ''}${aggregatedMetrics.averageGrowth.toFixed(1)}% avg growth`}
          changeType={aggregatedMetrics.averageGrowth > 0 ? 'increase' : aggregatedMetrics.averageGrowth < 0 ? 'decrease' : 'neutral'}
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          title="Total Transactions"
          value={aggregatedMetrics.totalTransactions.toLocaleString()}
          change={`${aggregatedMetrics.activeBranches} active branches`}
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <StatCard
          title="Average Order Value"
          value={`$${aggregatedMetrics.averageOrderValue.toFixed(2)}`}
          change="Across all branches"
          icon={TrendingUp}
          color="bg-purple-600"
        />
        <StatCard
          title="Active Branches"
          value={`${aggregatedMetrics.activeBranches}/${aggregatedMetrics.totalBranches}`}
          change="Store locations"
          icon={Store}
          color="bg-orange-600"
        />
      </div>

      {/* Branch Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Branch */}
        <ChartCard title="Top Performing Branch">
          <div className="text-center">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
              <Store className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {aggregatedMetrics.topBranch.storeName}
              </h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                ${aggregatedMetrics.topBranch.sales?.totalRevenue.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {aggregatedMetrics.topBranch.sales?.totalTransactions || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Growth</p>
                <p className={`font-semibold ${
                  (aggregatedMetrics.topBranch.sales?.growth || 0) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {(aggregatedMetrics.topBranch.sales?.growth || 0) >= 0 ? '+' : ''}
                  {(aggregatedMetrics.topBranch.sales?.growth || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Branch Revenue Comparison */}
        <ChartCard title="Branch Revenue Comparison">
          <div className="space-y-3">
            {allBranchAnalytics.slice(0, 5).map((analytics, index) => {
              const maxRevenue = Math.max(...allBranchAnalytics.map(a => a.sales.totalRevenue));
              const percentage = maxRevenue > 0 ? (analytics.sales.totalRevenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={analytics.storeId} className="flex items-center space-x-3">
                  <div className="w-4 text-sm text-gray-600 dark:text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {analytics.storeName}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ${analytics.sales.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
        </ChartCard>

        {/* Alerts & Notifications */}
        <ChartCard title="Alerts & Notifications">
          <div className="space-y-3">
            {aggregatedMetrics.underperformingBranches.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    {aggregatedMetrics.underperformingBranches.length} branches with negative growth
                  </p>
                </div>
                <div className="mt-2 space-y-1">
                  {aggregatedMetrics.underperformingBranches.slice(0, 3).map(branch => (
                    <p key={branch.storeId} className="text-xs text-red-600 dark:text-red-500">
                      • {branch.storeName}: {branch.sales.growth.toFixed(1)}%
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  System Status: All branches operational
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                  Monthly target: 85% achieved
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Performance Table */}
        <ChartCard title="Branch Performance Details">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {allBranchAnalytics.map((analytics) => {
                  const store = storeLocations.find(s => s.id === analytics.storeId);
                  return (
                    <tr key={analytics.storeId}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {analytics.storeName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {store?.address.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${analytics.sales.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {analytics.sales.totalTransactions} txns
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          analytics.sales.growth >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {analytics.sales.growth >= 0 ? '+' : ''}{analytics.sales.growth.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          store?.isActive 
                            ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                            : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {store?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* System Overview */}
        <ChartCard title="System Overview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Store className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{storeLocations.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Branches</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24/7</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitoring</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h5>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors">
                  Add Branch
                </button>
                <button className="p-2 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                  Generate Report
                </button>
                <button className="p-2 text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors">
                  View Analytics
                </button>
                <button className="p-2 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors">
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminDashboard;