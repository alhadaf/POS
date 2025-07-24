import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  AlertTriangle,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { transactions, products, customers, currentStore } = useApp();
  const { user } = useAuth();

  // Calculate today's metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTransactions = transactions.filter(t => t.timestamp >= today);
  
  const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const todayTransactionCount = todayTransactions.length;
  const averageOrderValue = todayTransactionCount > 0 ? todaySales / todayTransactionCount : 0;

  // Low stock products
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.reorderPoint);
  const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

  // Top selling products (mock data for demo)
  const topProducts = products.slice(0, 5);

  const StatCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
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
              changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
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

  const QuickAction: React.FC<{
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    onClick: () => void;
  }> = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
               hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentStore?.name} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Sales"
          value={`$${todaySales.toFixed(2)}`}
          change="+12.5% from yesterday"
          changeType="increase"
          icon={DollarSign}
          color="bg-green-600"
        />
        <StatCard
          title="Transactions"
          value={todayTransactionCount.toString()}
          change="+8 from yesterday"
          changeType="increase"
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <StatCard
          title="Average Order"
          value={`$${averageOrderValue.toFixed(2)}`}
          change="+3.2% from yesterday"
          changeType="increase"
          icon={TrendingUp}
          color="bg-purple-600"
        />
        <StatCard
          title="Active Customers"
          value={customers.length.toString()}
          change="2 new today"
          changeType="increase"
          icon={Users}
          color="bg-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & Notifications */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Alerts
            </h2>
            <div className="space-y-3">
              {outOfStockProducts.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    {outOfStockProducts.length} products out of stock
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    Immediate attention required
                  </p>
                </div>
              )}
              {lowStockProducts.length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    {lowStockProducts.length} products low in stock
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                    Consider reordering soon
                  </p>
                </div>
              )}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                  System backup completed
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  All data secured at 2:00 AM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              Top Products
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/40x40'}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${product.unitPrice.toFixed(2)} • {product.stockQuantity} in stock
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor(Math.random() * 50) + 10} sold
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      today
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="New Sale"
            description="Start a new transaction"
            icon={ShoppingCart}
            color="bg-blue-600"
            onClick={() => {}}
          />
          <QuickAction
            title="Add Product"
            description="Add new inventory item"
            icon={Package}
            color="bg-green-600"
          />
          <QuickAction
            title="Customer Lookup"
            description="Find customer information"
            icon={Users}
            color="bg-purple-600"
            onClick={() => {}}
          />
          <QuickAction
            title="Daily Report"
            description="Generate sales report"
            icon={TrendingUp}
            color="bg-orange-600"
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;