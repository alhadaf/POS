import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Analytics: React.FC = () => {
  const { transactions, products, customers } = useApp();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('sales');

  // Calculate date range
  const getDateRange = (range: string) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
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
        start.setDate(start.getDate() - 7);
    }
    
    return { start, end: now };
  };

  const { start: startDate, end: endDate } = getDateRange(timeRange);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.timestamp >= startDate && t.timestamp <= endDate
    );
  }, [transactions, startDate, endDate]);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    const totalItems = filteredTransactions.reduce((sum, t) => 
      sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    // Calculate growth compared to previous period
    const previousStart = new Date(startDate);
    const previousEnd = new Date(endDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    previousStart.setTime(previousStart.getTime() - periodLength);
    previousEnd.setTime(previousEnd.getTime() - periodLength);

    const previousTransactions = transactions.filter(t => 
      t.timestamp >= previousStart && t.timestamp < previousEnd
    );
    const previousSales = previousTransactions.reduce((sum, t) => sum + t.total, 0);
    const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales) * 100 : 0;

    // Top products
    const productSales = new Map<string, { product: any, quantity: number, revenue: number }>();
    filteredTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = productSales.get(item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          productSales.set(item.product.id, {
            product: item.product,
            quantity: item.quantity,
            revenue: item.totalPrice
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by hour
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const sales = filteredTransactions
        .filter(t => new Date(t.timestamp).getHours() === hour)
        .reduce((sum, t) => sum + t.total, 0);
      return { hour, sales };
    });

    // Customer analytics
    const uniqueCustomers = new Set(
      filteredTransactions
        .filter(t => t.customer)
        .map(t => t.customer!.id)
    ).size;

    const returningCustomers = filteredTransactions.filter(t => {
      if (!t.customer) return false;
      const customerTransactions = transactions.filter(tr => 
        tr.customer?.id === t.customer!.id && tr.timestamp < t.timestamp
      );
      return customerTransactions.length > 0;
    }).length;

    return {
      totalSales,
      totalTransactions,
      averageOrderValue,
      totalItems,
      salesGrowth,
      topProducts,
      hourlyData,
      uniqueCustomers,
      returningCustomers
    };
  }, [filteredTransactions, transactions, startDate, endDate]);

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: number;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
  }> = ({ title, value, change, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 
              trend === 'down' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive business intelligence and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={`$${analyticsData.totalSales.toLocaleString()}`}
          change={analyticsData.salesGrowth}
          trend={analyticsData.salesGrowth > 0 ? 'up' : analyticsData.salesGrowth < 0 ? 'down' : 'neutral'}
          icon={DollarSign}
          color="bg-green-600"
        />
        <MetricCard
          title="Transactions"
          value={analyticsData.totalTransactions.toLocaleString()}
          icon={ShoppingCart}
          color="bg-blue-600"
        />
        <MetricCard
          title="Average Order Value"
          value={`$${analyticsData.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-purple-600"
        />
        <MetricCard
          title="Items Sold"
          value={analyticsData.totalItems.toLocaleString()}
          icon={Package}
          color="bg-orange-600"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Unique Customers"
          value={analyticsData.uniqueCustomers.toString()}
          icon={Users}
          color="bg-indigo-600"
        />
        <MetricCard
          title="Returning Customers"
          value={analyticsData.returningCustomers.toString()}
          icon={Award}
          color="bg-teal-600"
        />
        <MetricCard
          title="Customer Retention"
          value={`${analyticsData.uniqueCustomers > 0 ? ((analyticsData.returningCustomers / analyticsData.uniqueCustomers) * 100).toFixed(1) : 0}%`}
          icon={Target}
          color="bg-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Chart */}
        <ChartCard title="Sales by Hour">
          <div className="space-y-3">
            {analyticsData.hourlyData.map((data, index) => {
              const maxSales = Math.max(...analyticsData.hourlyData.map(d => d.sales));
              const percentage = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {data.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-sm text-gray-900 dark:text-white text-right">
                    ${data.sales.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top Selling Products">
          <div className="space-y-4">
            {analyticsData.topProducts.slice(0, 8).map((item, index) => (
              <div key={item.product.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <img
                    src={item.product.images[0] || 'https://via.placeholder.com/40x40'}
                    alt={item.product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.quantity} sold • ${item.product.unitPrice.toFixed(2)} each
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${item.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Sales Performance">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">Peak Hour</p>
                  <p className="text-xs text-green-600 dark:text-green-500">
                    {analyticsData.hourlyData.reduce((max, curr) => curr.sales > max.sales ? curr : max).hour}:00
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-800 dark:text-green-400">
                  ${analyticsData.hourlyData.reduce((max, curr) => curr.sales > max.sales ? curr : max).sales.toFixed(0)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Avg Transaction</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">Per customer</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-400">
                  ${analyticsData.averageOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Inventory Insights">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-400">Total Products</p>
                  <p className="text-xs text-purple-600 dark:text-purple-500">In catalog</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-purple-800 dark:text-purple-400">
                  {products.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-400">Low Stock Items</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500">Need attention</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-orange-800 dark:text-orange-400">
                  {products.filter(p => p.stockQuantity <= p.reorderPoint).length}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Customer Insights">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-sm font-medium text-teal-800 dark:text-teal-400">Total Customers</p>
                  <p className="text-xs text-teal-600 dark:text-teal-500">Registered</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-teal-800 dark:text-teal-400">
                  {customers.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                <div>
                  <p className="text-sm font-medium text-pink-800 dark:text-pink-400">Loyalty Members</p>
                  <p className="text-xs text-pink-600 dark:text-pink-500">Active cards</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-pink-800 dark:text-pink-400">
                  {customers.filter(c => c.loyaltyCard.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Business Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Peak Hour Optimization</h4>
            <p className="text-sm text-blue-600 dark:text-blue-500">
              Consider increasing staff during peak hours ({analyticsData.hourlyData.reduce((max, curr) => curr.sales > max.sales ? curr : max).hour}:00) to improve customer service.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Inventory Management</h4>
            <p className="text-sm text-green-600 dark:text-green-500">
              {products.filter(p => p.stockQuantity <= p.reorderPoint).length} products need reordering. Consider automated reorder points.
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">Customer Retention</h4>
            <p className="text-sm text-purple-600 dark:text-purple-500">
              Focus on loyalty programs to increase the {((analyticsData.returningCustomers / analyticsData.uniqueCustomers) * 100).toFixed(1)}% retention rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;