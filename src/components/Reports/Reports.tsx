import React, { useState, useMemo } from 'react';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  DollarSign,
  Package,
  Users,
  Clock,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Reports: React.FC = () => {
  const { transactions, products, customers } = useApp();
  const { hasPermission } = useAuth();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [reportFormat, setReportFormat] = useState('summary');

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

  const { start: startDate, end: endDate } = getDateRange(dateRange);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.timestamp >= startDate && t.timestamp <= endDate
    );
  }, [transactions, startDate, endDate]);

  // Generate report data based on selected report type
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'sales':
        return generateSalesReport();
      case 'inventory':
        return generateInventoryReport();
      case 'customer':
        return generateCustomerReport();
      case 'employee':
        return generateEmployeeReport();
      case 'financial':
        return generateFinancialReport();
      default:
        return generateSalesReport();
    }
  }, [selectedReport, filteredTransactions, products, customers]);

  function generateSalesReport() {
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Sales by day
    const salesByDay = new Map<string, number>();
    filteredTransactions.forEach(t => {
      const day = new Date(t.timestamp).toDateString();
      salesByDay.set(day, (salesByDay.get(day) || 0) + t.total);
    });

    // Top products by revenue
    const productRevenue = new Map<string, { product: any, revenue: number, quantity: number }>();
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        const existing = productRevenue.get(item.product.id);
        if (existing) {
          existing.revenue += item.totalPrice;
          existing.quantity += item.quantity;
        } else {
          productRevenue.set(item.product.id, {
            product: item.product,
            revenue: item.totalPrice,
            quantity: item.quantity
          });
        }
      });
    });

    const topProducts = Array.from(productRevenue.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by payment method
    const paymentMethods = new Map<string, number>();
    filteredTransactions.forEach(t => {
      paymentMethods.set(t.paymentMethod, (paymentMethods.get(t.paymentMethod) || 0) + t.total);
    });

    return {
      title: 'Sales Report',
      summary: {
        totalSales,
        totalTransactions,
        averageTransaction,
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      },
      charts: [
        {
          title: 'Daily Sales Trend',
          type: 'line',
          data: Array.from(salesByDay.entries()).map(([date, sales]) => ({ date, sales }))
        },
        {
          title: 'Top Products by Revenue',
          type: 'bar',
          data: topProducts
        },
        {
          title: 'Sales by Payment Method',
          type: 'pie',
          data: Array.from(paymentMethods.entries()).map(([method, amount]) => ({ method, amount }))
        }
      ]
    };
  }

  function generateInventoryReport() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0);
    const lowStockItems = products.filter(p => p.stockQuantity <= p.reorderPoint);
    const outOfStockItems = products.filter(p => p.stockQuantity === 0);

    // Inventory by category
    const categoryValue = new Map<string, { value: number, quantity: number }>();
    products.forEach(p => {
      const existing = categoryValue.get(p.category.name);
      const value = p.stockQuantity * p.costPrice;
      if (existing) {
        existing.value += value;
        existing.quantity += p.stockQuantity;
      } else {
        categoryValue.set(p.category.name, { value, quantity: p.stockQuantity });
      }
    });

    // Top products by stock quantity
    const topStockProducts = products
      .sort((a, b) => b.stockQuantity - a.stockQuantity)
      .slice(0, 10);

    return {
      title: 'Inventory Report',
      summary: {
        totalProducts,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        period: `As of ${new Date().toLocaleDateString()}`
      },
      charts: [
        {
          title: 'Inventory Value by Category',
          type: 'pie',
          data: Array.from(categoryValue.entries()).map(([category, data]) => ({ category, value: data.value }))
        },
        {
          title: 'Products Requiring Attention',
          type: 'alert',
          data: { lowStock: lowStockItems, outOfStock: outOfStockItems }
        }
      ]
    };
  }

  function generateCustomerReport() {
    const totalCustomers = customers.length;
    const loyaltyMembers = customers.filter(c => c.loyaltyCard.isActive).length;
    const averageSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers;

    // Customer tiers
    const tierDistribution = new Map<string, number>();
    customers.forEach(c => {
      tierDistribution.set(c.loyaltyCard.tier, (tierDistribution.get(c.loyaltyCard.tier) || 0) + 1);
    });

    // Top customers by spending
    const topCustomers = customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return {
      title: 'Customer Report',
      summary: {
        totalCustomers,
        loyaltyMembers,
        averageSpent,
        loyaltyRate: (loyaltyMembers / totalCustomers) * 100,
        period: `As of ${new Date().toLocaleDateString()}`
      },
      charts: [
        {
          title: 'Customer Tier Distribution',
          type: 'pie',
          data: Array.from(tierDistribution.entries()).map(([tier, count]) => ({ tier, count }))
        },
        {
          title: 'Top Customers by Spending',
          type: 'bar',
          data: topCustomers
        }
      ]
    };
  }

  function generateEmployeeReport() {
    // Employee performance based on transactions
    const employeePerformance = new Map<string, { sales: number, transactions: number, employee: any }>();
    filteredTransactions.forEach(t => {
      const existing = employeePerformance.get(t.cashier.id);
      if (existing) {
        existing.sales += t.total;
        existing.transactions += 1;
      } else {
        employeePerformance.set(t.cashier.id, {
          sales: t.total,
          transactions: 1,
          employee: t.cashier
        });
      }
    });

    const topPerformers = Array.from(employeePerformance.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    return {
      title: 'Employee Performance Report',
      summary: {
        totalEmployees: employeePerformance.size,
        totalSales: Array.from(employeePerformance.values()).reduce((sum, emp) => sum + emp.sales, 0),
        averageSalesPerEmployee: Array.from(employeePerformance.values()).reduce((sum, emp) => sum + emp.sales, 0) / employeePerformance.size,
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      },
      charts: [
        {
          title: 'Top Performing Employees',
          type: 'bar',
          data: topPerformers
        }
      ]
    };
  }

  function generateFinancialReport() {
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTax = filteredTransactions.reduce((sum, t) => sum + t.tax, 0);
    const totalDiscounts = filteredTransactions.reduce((sum, t) => sum + t.discount, 0);
    const netRevenue = totalRevenue - totalTax - totalDiscounts;

    // Revenue by payment method
    const revenueByPayment = new Map<string, number>();
    filteredTransactions.forEach(t => {
      revenueByPayment.set(t.paymentMethod, (revenueByPayment.get(t.paymentMethod) || 0) + t.total);
    });

    return {
      title: 'Financial Report',
      summary: {
        totalRevenue,
        totalTax,
        totalDiscounts,
        netRevenue,
        period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      },
      charts: [
        {
          title: 'Revenue Breakdown',
          type: 'pie',
          data: [
            { label: 'Net Revenue', value: netRevenue },
            { label: 'Tax Collected', value: totalTax },
            { label: 'Discounts Given', value: totalDiscounts }
          ]
        },
        {
          title: 'Revenue by Payment Method',
          type: 'bar',
          data: Array.from(revenueByPayment.entries()).map(([method, revenue]) => ({ method, revenue }))
        }
      ]
    };
  }

  const reportTypes = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign, description: 'Revenue, transactions, and sales trends' },
    { id: 'inventory', name: 'Inventory Report', icon: Package, description: 'Stock levels, categories, and reorder alerts' },
    { id: 'customer', name: 'Customer Report', icon: Users, description: 'Customer analytics and loyalty insights' },
    { id: 'employee', name: 'Employee Report', icon: Award, description: 'Staff performance and productivity metrics' },
    { id: 'financial', name: 'Financial Report', icon: BarChart3, description: 'Revenue breakdown and financial analysis' }
  ];

  const ReportCard: React.FC<{
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (!hasPermission('reports_view')) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to view reports.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive business intelligence and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedReport === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`h-6 w-6 ${
                    selectedReport === type.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    selectedReport === type.id ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-white'
                  }`}>
                    {type.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectedReport === 'sales' && (
          <>
            <ReportCard
              title="Total Sales"
              value={`$${reportData.summary.totalSales.toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-600"
              subtitle={reportData.summary.period}
            />
            <ReportCard
              title="Transactions"
              value={reportData.summary.totalTransactions.toString()}
              icon={FileText}
              color="bg-blue-600"
              subtitle="Total completed"
            />
            <ReportCard
              title="Average Order"
              value={`$${reportData.summary.averageTransaction.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-purple-600"
              subtitle="Per transaction"
            />
            <ReportCard
              title="Period"
              value={dateRange.toUpperCase()}
              icon={Calendar}
              color="bg-orange-600"
              subtitle="Report timeframe"
            />
          </>
        )}

        {selectedReport === 'inventory' && (
          <>
            <ReportCard
              title="Total Products"
              value={reportData.summary.totalProducts.toString()}
              icon={Package}
              color="bg-blue-600"
              subtitle="In catalog"
            />
            <ReportCard
              title="Inventory Value"
              value={`$${reportData.summary.totalValue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-600"
              subtitle="Cost basis"
            />
            <ReportCard
              title="Low Stock"
              value={reportData.summary.lowStockCount.toString()}
              icon={AlertTriangle}
              color="bg-yellow-600"
              subtitle="Need reordering"
            />
            <ReportCard
              title="Out of Stock"
              value={reportData.summary.outOfStockCount.toString()}
              icon={AlertTriangle}
              color="bg-red-600"
              subtitle="Immediate attention"
            />
          </>
        )}

        {selectedReport === 'customer' && (
          <>
            <ReportCard
              title="Total Customers"
              value={reportData.summary.totalCustomers.toString()}
              icon={Users}
              color="bg-blue-600"
              subtitle="Registered"
            />
            <ReportCard
              title="Loyalty Members"
              value={reportData.summary.loyaltyMembers.toString()}
              icon={Award}
              color="bg-purple-600"
              subtitle="Active cards"
            />
            <ReportCard
              title="Average Spent"
              value={`$${reportData.summary.averageSpent.toFixed(2)}`}
              icon={DollarSign}
              color="bg-green-600"
              subtitle="Per customer"
            />
            <ReportCard
              title="Loyalty Rate"
              value={`${reportData.summary.loyaltyRate.toFixed(1)}%`}
              icon={Target}
              color="bg-teal-600"
              subtitle="Participation"
            />
          </>
        )}

        {selectedReport === 'employee' && (
          <>
            <ReportCard
              title="Active Employees"
              value={reportData.summary.totalEmployees.toString()}
              icon={Users}
              color="bg-blue-600"
              subtitle="With transactions"
            />
            <ReportCard
              title="Total Sales"
              value={`$${reportData.summary.totalSales.toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-600"
              subtitle={reportData.summary.period}
            />
            <ReportCard
              title="Avg per Employee"
              value={`$${reportData.summary.averageSalesPerEmployee.toFixed(2)}`}
              icon={TrendingUp}
              color="bg-purple-600"
              subtitle="Sales performance"
            />
            <ReportCard
              title="Period"
              value={dateRange.toUpperCase()}
              icon={Calendar}
              color="bg-orange-600"
              subtitle="Report timeframe"
            />
          </>
        )}

        {selectedReport === 'financial' && (
          <>
            <ReportCard
              title="Total Revenue"
              value={`$${reportData.summary.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-green-600"
              subtitle="Gross sales"
            />
            <ReportCard
              title="Net Revenue"
              value={`$${reportData.summary.netRevenue.toLocaleString()}`}
              icon={TrendingUp}
              color="bg-blue-600"
              subtitle="After tax & discounts"
            />
            <ReportCard
              title="Tax Collected"
              value={`$${reportData.summary.totalTax.toLocaleString()}`}
              icon={FileText}
              color="bg-purple-600"
              subtitle="Total tax amount"
            />
            <ReportCard
              title="Discounts Given"
              value={`$${reportData.summary.totalDiscounts.toLocaleString()}`}
              icon={AlertTriangle}
              color="bg-orange-600"
              subtitle="Total discounts"
            />
          </>
        )}
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportData.charts.map((chart, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              {chart.title}
            </h3>
            
            {chart.type === 'alert' && selectedReport === 'inventory' && (
              <div className="space-y-4">
                {chart.data.outOfStock.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Out of Stock ({chart.data.outOfStock.length})</h4>
                    <div className="space-y-2">
                      {chart.data.outOfStock.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between text-sm">
                          <span className="text-red-700 dark:text-red-300">{product.name}</span>
                          <span className="text-red-600 dark:text-red-400">0 units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {chart.data.lowStock.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Low Stock ({chart.data.lowStock.length})</h4>
                    <div className="space-y-2">
                      {chart.data.lowStock.slice(0, 5).map((product: any) => (
                        <div key={product.id} className="flex items-center justify-between text-sm">
                          <span className="text-yellow-700 dark:text-yellow-300">{product.name}</span>
                          <span className="text-yellow-600 dark:text-yellow-400">{product.stockQuantity} units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {chart.type === 'bar' && (
              <div className="space-y-3">
                {chart.data.slice(0, 8).map((item: any, itemIndex: number) => {
                  let label, value;
                  
                  if (selectedReport === 'sales' && chart.title.includes('Products')) {
                    label = item.product.name;
                    value = item.revenue;
                  } else if (selectedReport === 'customer' && chart.title.includes('Customers')) {
                    label = `${item.firstName} ${item.lastName}`;
                    value = item.totalSpent;
                  } else if (selectedReport === 'employee') {
                    label = `${item.employee.firstName} ${item.employee.lastName}`;
                    value = item.sales;
                  } else if (selectedReport === 'financial') {
                    label = item.method;
                    value = item.revenue;
                  }
                  
                  const maxValue = Math.max(...chart.data.slice(0, 8).map((d: any) => 
                    selectedReport === 'sales' && chart.title.includes('Products') ? d.revenue :
                    selectedReport === 'customer' ? d.totalSpent :
                    selectedReport === 'employee' ? d.sales :
                    d.revenue || d.amount || 0
                  ));
                  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  
                  return (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <div className="w-4 text-sm text-gray-600 dark:text-gray-400">
                        {itemIndex + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {label}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${value.toFixed(2)}
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
            )}

            {chart.type === 'pie' && (
              <div className="space-y-3">
                {chart.data.slice(0, 6).map((item: any, itemIndex: number) => {
                  let label, value;
                  
                  if (selectedReport === 'sales' && chart.title.includes('Payment')) {
                    label = item.method;
                    value = item.amount;
                  } else if (selectedReport === 'inventory') {
                    label = item.category;
                    value = item.value;
                  } else if (selectedReport === 'customer') {
                    label = item.tier;
                    value = item.count;
                  } else if (selectedReport === 'financial') {
                    label = item.label;
                    value = item.value;
                  }
                  
                  const total = chart.data.reduce((sum: number, d: any) => 
                    sum + (d.amount || d.value || d.count || 0), 0
                  );
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  
                  return (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: `hsl(${itemIndex * 60}, 70%, 50%)` }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedReport === 'customer' ? value : `$${value.toFixed(2)}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Export as PDF</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Export as Excel</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">Export as CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;