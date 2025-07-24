import React, { useState, useCallback, useMemo } from 'react';
import { Search, ShoppingCart, User, CreditCard, Plus, Minus, X, Scan } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Product, CartItem, Customer, Transaction, PaymentMethod } from '../../types';

const POSSystem: React.FC = () => {
  const { products, customers, searchProducts, searchCustomers, addTransaction } = useApp();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 20);
    return searchProducts(searchQuery);
  }, [searchQuery, searchProducts, products]);

  const customerSearchResults = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers.slice(0, 10);
    return searchCustomers(customerSearchQuery);
  }, [customerSearchQuery, searchCustomers, customers]);

  // Cart calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = cart.reduce((sum, item) => sum + item.discount, 0);
    const tax = (subtotal - discount) * 0.0875; // 8.75% tax rate
    const total = subtotal - discount + tax;
    
    return { subtotal, discount, tax, total };
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }
      
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        product,
        quantity: 1,
        unitPrice: product.unitPrice,
        totalPrice: product.unitPrice,
        discount: 0,
      };
      
      return [...prev, newItem];
    });
  }, []);

  const updateCartItemQuantity = useCallback((itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: newQuantity * item.unitPrice,
            }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setShowPayment(false);
    setCashReceived('');
  }, []);

  const processPayment = useCallback(() => {
    if (!user || !currentStore) return;

    const transaction: Transaction = {
      id: `txn-${Date.now()}`,
      transactionNumber: `T${Date.now().toString().slice(-8)}`,
      storeId: currentStore.id,
      items: cart,
      subtotal: cartTotals.subtotal,
      tax: cartTotals.tax,
      discount: cartTotals.discount,
      total: cartTotals.total,
      paymentMethod,
      paymentDetails: {
        method: paymentMethod,
        amount: cartTotals.total,
        ...(paymentMethod === 'cash' && {
          changeGiven: Math.max(0, parseFloat(cashReceived) - cartTotals.total),
        }),
      },
      customer: selectedCustomer || undefined,
      cashier: user,
      timestamp: new Date(),
      status: 'completed',
      receiptNumber: `R${Date.now().toString().slice(-8)}`,
    };

    addTransaction(transaction);
    clearCart();
    
    // Show success message (in a real app, this might be a toast notification)
    alert(`Transaction completed successfully!\nReceipt: ${transaction.receiptNumber}`);
  }, [user, currentStore, cart, cartTotals, paymentMethod, cashReceived, selectedCustomer, addTransaction, clearCart]);

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Product Search & Selection */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or barcode..."
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Scan className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
                         hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer
                         transition-all duration-200 group"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={product.name}
                    className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    SKU: {product.sku}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${product.unitPrice.toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stockQuantity > product.reorderPoint
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : product.stockQuantity > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {product.stockQuantity} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Shopping Cart */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Cart Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart ({cart.length})
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Customer Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedCustomer.loyaltyCard.tier.toUpperCase()} • {selectedCustomer.loyaltyCard.points} pts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-left
                         text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Customer (Optional)
              </button>
              
              {showCustomerSearch && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <div className="p-3">
                    <input
                      type="text"
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      placeholder="Search by name, phone, or email..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {customerSearchResults.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCustomerSearch(false);
                          setCustomerSearchQuery('');
                        }}
                        className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.phoneNumber} • {customer.email}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm">Cart is empty</p>
                <p className="text-xs">Add products to get started</p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Totals & Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="text-red-600 dark:text-red-400">-${cartTotals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-white">${cartTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-gray-900 dark:text-white">${cartTotals.total.toFixed(2)}</span>
              </div>
            </div>

            {!showPayment ? (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700
                         text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition-colors duration-200"
              >
                <CreditCard className="h-4 w-4" />
                <span>Proceed to Payment</span>
              </button>
            ) : (
              <div className="space-y-4">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="mobile">Mobile Payment</option>
                    <option value="gift_card">Gift Card</option>
                  </select>
                </div>

                {/* Cash Payment Input */}
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cash Received
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {parseFloat(cashReceived) > cartTotals.total && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Change: ${(parseFloat(cashReceived) - cartTotals.total).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg
                             text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                             focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Back
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentMethod === 'cash' && parseFloat(cashReceived) < cartTotals.total}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                             text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500
                             disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default POSSystem;