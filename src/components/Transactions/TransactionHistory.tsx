import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Receipt,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  DollarSign,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction, TransactionStatus, PaymentMethod } from '../../types';

const TransactionHistory: React.FC = () => {
  const { transactions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [sortBy, setSortBy] = useState('timestamp');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

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
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return { start, end: now };
  };

  const { start: startDate, end: endDate } = getDateRange(dateRange);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = transaction.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (transaction.customer && 
                            (`${transaction.customer.firstName} ${transaction.customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             transaction.customer.email.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                           transaction.cashier.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           transaction.cashier.lastName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || transaction.paymentMethod === paymentFilter;
      const matchesDate = transaction.timestamp >= startDate && transaction.timestamp <= endDate;
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'amount':
          return b.total - a.total;
        case 'customer':
          const aCustomer = a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : 'Guest';
          const bCustomer = b.customer ? `${b.customer.firstName} ${b.customer.lastName}` : 'Guest';
          return aCustomer.localeCompare(bCustomer);
        case 'cashier':
          return `${a.cashier.firstName} ${a.cashier.lastName}`.localeCompare(`${b.cashier.firstName} ${b.cashier.lastName}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, statusFilter, paymentFilter, startDate, endDate, sortBy]);

  // Transaction statistics
  const transactionStats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const completedTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
    const refundedTransactions = filteredTransactions.filter(t => t.status === 'refunded' || t.status === 'partially_refunded').length;
    const voidedTransactions = filteredTransactions.filter(t => t.status === 'voided').length;
    
    return { 
      totalTransactions, 
      totalRevenue, 
      averageTransaction, 
      completedTransactions, 
      refundedTransactions, 
      voidedTransactions 
    };
  }, [filteredTransactions]);

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'voided':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'refunded':
      case 'partially_refunded':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'voided':
        return XCircle;
      case 'refunded':
      case 'partially_refunded':
        return RefreshCw;
      default:
        return AlertCircle;
    }
  };

  const formatPaymentMethod = (method: PaymentMethod) => {
    switch (method) {
      case 'credit':
        return 'Credit Card';
      case 'debit':
        return 'Debit Card';
      case 'mobile':
        return 'Mobile Pay';
      case 'gift_card':
        return 'Gift Card';
      case 'store_credit':
        return 'Store Credit';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

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

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all store transactions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={transactionStats.totalTransactions.toString()}
          icon={Receipt}
          color="bg-blue-600"
          trend={`${dateRange} period`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${transactionStats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-600"
          trend="Gross sales"
        />
        <StatCard
          title="Average Transaction"
          value={`$${transactionStats.averageTransaction.toFixed(2)}`}
          icon={CreditCard}
          color="bg-purple-600"
          trend="Per transaction"
        />
        <StatCard
          title="Success Rate"
          value={`${transactionStats.totalTransactions > 0 ? ((transactionStats.completedTransactions / transactionStats.totalTransactions) * 100).toFixed(1) : 0}%`}
          icon={CheckCircle}
          color="bg-teal-600"
          trend="Completed transactions"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                placeholder="Search by transaction #, receipt #, customer, or cashier..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="voided">Voided</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="mobile">Mobile Payment</option>
              <option value="gift_card">Gift Card</option>
              <option value="store_credit">Store Credit</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="customer">Sort by Customer</option>
              <option value="cashier">Sort by Cashier</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transactions ({filteredTransactions.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTransactions.length} of {transactions.length} transactions
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cashier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => {
                  const StatusIcon = getStatusIcon(transaction.status);
                  
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            #{transaction.transactionNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Receipt: {transaction.receiptNumber}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.customer ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {transaction.customer.firstName.charAt(0)}{transaction.customer.lastName.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {transaction.customer.firstName} {transaction.customer.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.customer.loyaltyCard.tier.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <User className="h-8 w-8 text-gray-400" />
                            <div className="ml-3">
                              <div className="text-sm text-gray-500 dark:text-gray-400">Guest</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {transaction.cashier.firstName} {transaction.cashier.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.cashier.role.replace('_', ' ').toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatPaymentMethod(transaction.paymentMethod)}
                        </div>
                        {transaction.paymentDetails.cardLast4 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            **** {transaction.paymentDetails.cardLast4}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${transaction.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.items.length} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {transaction.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowTransactionModal(true);
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

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Transaction Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Transaction Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction #</label>
                      <p className="text-sm text-gray-900 dark:text-white">#{selectedTransaction.transactionNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Receipt #</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.receiptNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time</label>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedTransaction.timestamp).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cashier</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedTransaction.cashier.firstName} {selectedTransaction.cashier.lastName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Items Purchased
                  </h4>
                  <div className="space-y-3">
                    {selectedTransaction.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.images[0] || 'https://via.placeholder.com/40x40'}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${item.unitPrice.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ${item.totalPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment & Summary */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <h4 className="text-lg font-semibold mb-4">Payment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedTransaction.discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Discount:</span>
                        <span>-${selectedTransaction.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Tax:</span>
                      <span>${selectedTransaction.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/20 pt-3 font-semibold">
                      <span>Total:</span>
                      <span>${selectedTransaction.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Method:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatPaymentMethod(selectedTransaction.paymentMethod)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">${selectedTransaction.paymentDetails.amount.toFixed(2)}</span>
                    </div>
                    {selectedTransaction.paymentDetails.changeGiven && selectedTransaction.paymentDetails.changeGiven > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Change:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${selectedTransaction.paymentDetails.changeGiven.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedTransaction.paymentDetails.cardLast4 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Card:</span>
                        <span className="font-medium text-gray-900 dark:text-white">**** {selectedTransaction.paymentDetails.cardLast4}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedTransaction.customer && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.customer.firstName} {selectedTransaction.customer.lastName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.customer.loyaltyCard.tier.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Points:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedTransaction.customer.loyaltyCard.points}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;