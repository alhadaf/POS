import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Customer, Transaction, Category, StoreLocation, BranchAnalytics } from '../types';

interface AppContextType {
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Products & Inventory
  products: Product[];
  categories: Category[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  getCustomer: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  getTransactionsByDateRange: (startDate: Date, endDate: Date) => Transaction[];
  getTransactionsByStore: (storeId: string) => Transaction[];
  
  // Store Locations
  storeLocations: StoreLocation[];
  currentStore: StoreLocation | null;
  setCurrentStore: (store: StoreLocation) => void;
  addStoreLocation: (store: StoreLocation) => void;
  updateStoreLocation: (id: string, updates: Partial<StoreLocation>) => void;
  deleteStoreLocation: (id: string) => void;
  
  // Analytics
  getBranchAnalytics: (storeId: string, startDate: Date, endDate: Date) => BranchAnalytics;
  getAllBranchesAnalytics: (startDate: Date, endDate: Date) => BranchAnalytics[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Produce', description: 'Fresh fruits and vegetables', isActive: true },
  { id: '2', name: 'Dairy', description: 'Milk, cheese, yogurt', isActive: true },
  { id: '3', name: 'Meat & Seafood', description: 'Fresh meat and seafood', isActive: true },
  { id: '4', name: 'Bakery', description: 'Fresh baked goods', isActive: true },
  { id: '5', name: 'Pantry', description: 'Shelf-stable goods', isActive: true },
  { id: '6', name: 'Frozen', description: 'Frozen foods', isActive: true },
  { id: '7', name: 'Beverages', description: 'Drinks and beverages', isActive: true },
  { id: '8', name: 'Health & Beauty', description: 'Personal care items', isActive: true },
];

const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'PRD-001',
    name: 'Bananas',
    description: 'Fresh organic bananas',
    category: mockCategories[0],
    brand: 'Organic Farm',
    unitPrice: 1.29,
    costPrice: 0.65,
    weight: 1,
    barcode: '1234567890123',
    images: ['https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg'],
    stockQuantity: 150,
    reorderPoint: 20,
    maxStock: 200,
    supplier: {
      id: '1',
      name: 'Fresh Produce Co.',
      contactPerson: 'Mike Johnson',
      email: 'mike@freshproduce.com',
      phone: '555-0101',
      address: { street: '123 Farm St', city: 'Farmville', state: 'CA', zipCode: '90210', country: 'USA' },
      paymentTerms: 'Net 30',
      rating: 4.5,
      isActive: true,
    },
    isActive: true,
    isWeighted: true,
    ageRestricted: false,
    taxCategory: { id: '1', name: 'Food', rate: 0.0875, description: 'Standard food tax', isActive: true },
    allergens: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    sku: 'PRD-002',
    name: 'Whole Milk',
    description: '1 Gallon Whole Milk',
    category: mockCategories[1],
    brand: 'Dairy Fresh',
    unitPrice: 3.99,
    costPrice: 2.50,
    barcode: '1234567890124',
    images: ['https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg'],
    stockQuantity: 45,
    reorderPoint: 10,
    maxStock: 60,
    supplier: {
      id: '2',
      name: 'Local Dairy',
      contactPerson: 'Sarah Davis',
      email: 'sarah@localdairy.com',
      phone: '555-0102',
      address: { street: '456 Dairy Rd', city: 'Milktown', state: 'CA', zipCode: '90211', country: 'USA' },
      paymentTerms: 'Net 15',
      rating: 4.8,
      isActive: true,
    },
    expiryDate: new Date('2024-03-15'),
    isActive: true,
    isWeighted: false,
    ageRestricted: false,
    taxCategory: { id: '1', name: 'Food', rate: 0.0875, description: 'Standard food tax', isActive: true },
    allergens: ['milk'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    sku: 'PRD-003',
    name: 'Ground Beef 80/20',
    description: 'Fresh ground beef 80% lean',
    category: mockCategories[2],
    brand: 'Premium Meats',
    unitPrice: 6.99,
    costPrice: 4.20,
    weight: 1,
    barcode: '1234567890125',
    images: ['https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg'],
    stockQuantity: 25,
    reorderPoint: 5,
    maxStock: 40,
    supplier: {
      id: '3',
      name: 'Quality Meats Co.',
      contactPerson: 'Bob Wilson',
      email: 'bob@qualitymeats.com',
      phone: '555-0103',
      address: { street: '789 Meat St', city: 'Beeftown', state: 'TX', zipCode: '75001', country: 'USA' },
      paymentTerms: 'Net 7',
      rating: 4.7,
      isActive: true,
    },
    expiryDate: new Date('2024-02-20'),
    isActive: true,
    isWeighted: true,
    ageRestricted: false,
    taxCategory: { id: '1', name: 'Food', rate: 0.0875, description: 'Standard food tax', isActive: true },
    allergens: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
  },
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice@email.com',
    phoneNumber: '555-1234',
    address: { street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '90210', country: 'USA' },
    loyaltyCard: {
      id: '1',
      number: 'LC001234',
      points: 1250,
      tier: 'gold',
      joinDate: new Date('2023-01-15'),
      lastActivity: new Date(),
      isActive: true,
    },
    totalSpent: 2450.75,
    averageOrderValue: 87.50,
    lastVisit: new Date(),
    dietaryPreferences: ['organic', 'gluten-free'],
    allergies: ['nuts'],
    isActive: true,
    createdAt: new Date('2023-01-15'),
  },
];

const mockStoreLocations: StoreLocation[] = [
  {
    id: '1',
    name: 'Downtown Store',
    address: { street: '100 Main St', city: 'Downtown', state: 'CA', zipCode: '90210', country: 'USA' },
    phoneNumber: '555-0100',
    region: 'West Coast',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    taxRate: 0.0875,
    manager: {
      id: '2',
      username: 'manager1',
      email: 'manager@supermarket.com',
      firstName: 'John',
      lastName: 'Smith',
      role: 'store_manager',
      permissions: [],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    },
    isActive: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
    operatingHours: {
      monday: { open: '06:00', close: '22:00', isClosed: false },
      tuesday: { open: '06:00', close: '22:00', isClosed: false },
      wednesday: { open: '06:00', close: '22:00', isClosed: false },
      thursday: { open: '06:00', close: '22:00', isClosed: false },
      friday: { open: '06:00', close: '22:00', isClosed: false },
      saturday: { open: '07:00', close: '21:00', isClosed: false },
      sunday: { open: '08:00', close: '20:00', isClosed: false },
    },
    settings: {
      allowCashPayments: true,
      allowCardPayments: true,
      allowMobilePayments: true,
      requireCustomerForLoyalty: false,
      autoApplyDiscounts: true,
      printReceiptsByDefault: true,
      emailReceiptsByDefault: false,
      maxDiscountPercent: 20,
      maxRefundDays: 30,
    },
  },
  {
    id: '2',
    name: 'Mall Location',
    address: { street: '200 Shopping Center Dr', city: 'Suburbia', state: 'CA', zipCode: '90211', country: 'USA' },
    phoneNumber: '555-0200',
    region: 'West Coast',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    taxRate: 0.0875,
    manager: {
      id: '4',
      username: 'manager2',
      email: 'manager2@supermarket.com',
      firstName: 'Sarah',
      lastName: 'Davis',
      role: 'store_manager',
      permissions: [],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    },
    isActive: true,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date(),
    operatingHours: {
      monday: { open: '10:00', close: '21:00', isClosed: false },
      tuesday: { open: '10:00', close: '21:00', isClosed: false },
      wednesday: { open: '10:00', close: '21:00', isClosed: false },
      thursday: { open: '10:00', close: '21:00', isClosed: false },
      friday: { open: '10:00', close: '22:00', isClosed: false },
      saturday: { open: '10:00', close: '22:00', isClosed: false },
      sunday: { open: '11:00', close: '20:00', isClosed: false },
    },
    settings: {
      allowCashPayments: true,
      allowCardPayments: true,
      allowMobilePayments: true,
      requireCustomerForLoyalty: false,
      autoApplyDiscounts: true,
      printReceiptsByDefault: true,
      emailReceiptsByDefault: true,
      maxDiscountPercent: 15,
      maxRefundDays: 30,
    },
  },
  {
    id: '3',
    name: 'Airport Branch',
    address: { street: '300 Airport Blvd', city: 'Airport City', state: 'CA', zipCode: '90212', country: 'USA' },
    phoneNumber: '555-0300',
    region: 'West Coast',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    taxRate: 0.0875,
    manager: {
      id: '5',
      username: 'manager3',
      email: 'manager3@supermarket.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'store_manager',
      permissions: [],
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
    },
    isActive: true,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date(),
    operatingHours: {
      monday: { open: '05:00', close: '23:00', isClosed: false },
      tuesday: { open: '05:00', close: '23:00', isClosed: false },
      wednesday: { open: '05:00', close: '23:00', isClosed: false },
      thursday: { open: '05:00', close: '23:00', isClosed: false },
      friday: { open: '05:00', close: '23:00', isClosed: false },
      saturday: { open: '05:00', close: '23:00', isClosed: false },
      sunday: { open: '05:00', close: '23:00', isClosed: false },
    },
    settings: {
      allowCashPayments: true,
      allowCardPayments: true,
      allowMobilePayments: true,
      requireCustomerForLoyalty: false,
      autoApplyDiscounts: false,
      printReceiptsByDefault: false,
      emailReceiptsByDefault: true,
      maxDiscountPercent: 10,
      maxRefundDays: 14,
    },
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(mockCategories);
  const [storeLocations] = useState<StoreLocation[]>(mockStoreLocations);
  const [currentStore, setCurrentStore] = useState<StoreLocation | null>(mockStoreLocations[0]);

  useEffect(() => {
    // Check system preference and stored preference
    const storedTheme = localStorage.getItem('pos_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('pos_theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.sku.toLowerCase().includes(lowercaseQuery) ||
      p.barcode.includes(query) ||
      p.brand.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const getCustomer = (id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  };

  const searchCustomers = (query: string): Customer[] => {
    const lowercaseQuery = query.toLowerCase();
    return customers.filter(c => 
      c.firstName.toLowerCase().includes(lowercaseQuery) ||
      c.lastName.toLowerCase().includes(lowercaseQuery) ||
      c.email.toLowerCase().includes(lowercaseQuery) ||
      c.phoneNumber.includes(query) ||
      c.loyaltyCard.number.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const getTransactionsByDateRange = (startDate: Date, endDate: Date): Transaction[] => {
    return transactions.filter(t => 
      t.timestamp >= startDate && t.timestamp <= endDate
    );
  };

  const getTransactionsByStore = (storeId: string): Transaction[] => {
    return transactions.filter(t => t.storeId === storeId);
  };

  const addStoreLocation = (store: StoreLocation) => {
    setStoreLocations(prev => [...prev, store]);
  };

  const updateStoreLocation = (id: string, updates: Partial<StoreLocation>) => {
    setStoreLocations(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s));
  };

  const deleteStoreLocation = (id: string) => {
    setStoreLocations(prev => prev.filter(s => s.id !== id));
    if (currentStore?.id === id) {
      setCurrentStore(storeLocations.find(s => s.id !== id) || null);
    }
  };

  const getBranchAnalytics = (storeId: string, startDate: Date, endDate: Date): BranchAnalytics => {
    const store = storeLocations.find(s => s.id === storeId);
    const storeTransactions = transactions.filter(t => 
      t.storeId === storeId && 
      t.timestamp >= startDate && 
      t.timestamp <= endDate
    );
    
    const totalRevenue = storeTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = storeTransactions.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    
    // Calculate growth (mock calculation)
    const previousPeriod = new Date(startDate);
    previousPeriod.setDate(previousPeriod.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousTransactions = transactions.filter(t => 
      t.storeId === storeId && 
      t.timestamp >= previousPeriod && 
      t.timestamp < startDate
    );
    const previousRevenue = previousTransactions.reduce((sum, t) => sum + t.total, 0);
    const growth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    
    // Product performance
    const productSales = new Map();
    storeTransactions.forEach(t => {
      t.items.forEach(item => {
        const existing = productSales.get(item.product.id);
        if (existing) {
          existing.quantitySold += item.quantity;
          existing.revenue += item.totalPrice;
          existing.profit += (item.totalPrice - (item.product.costPrice * item.quantity));
        } else {
          productSales.set(item.product.id, {
            productId: item.product.id,
            name: item.product.name,
            category: item.product.category.name,
            quantitySold: item.quantity,
            revenue: item.totalPrice,
            profit: item.totalPrice - (item.product.costPrice * item.quantity)
          });
        }
      });
    });
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Payment method stats
    const paymentStats = new Map();
    storeTransactions.forEach(t => {
      const existing = paymentStats.get(t.paymentMethod);
      if (existing) {
        existing.count += 1;
        existing.totalAmount += t.total;
      } else {
        paymentStats.set(t.paymentMethod, {
          method: t.paymentMethod,
          count: 1,
          totalAmount: t.total,
          percentage: 0
        });
      }
    });
    
    const paymentMethods = Array.from(paymentStats.values()).map(stat => ({
      ...stat,
      percentage: totalTransactions > 0 ? (stat.count / totalTransactions) * 100 : 0
    }));
    
    return {
      storeId,
      storeName: store?.name || 'Unknown Store',
      period: { start: startDate, end: endDate },
      sales: {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        growth
      },
      inventory: {
        totalProducts: products.length,
        lowStockItems: products.filter(p => p.stockQuantity <= p.reorderPoint).length,
        outOfStockItems: products.filter(p => p.stockQuantity === 0).length,
        inventoryValue: products.reduce((sum, p) => sum + (p.stockQuantity * p.costPrice), 0)
      },
      customers: {
        totalCustomers: customers.length,
        newCustomers: customers.filter(c => c.createdAt >= startDate && c.createdAt <= endDate).length,
        returningCustomers: storeTransactions.filter(t => t.customer).length,
        loyaltyMembers: customers.filter(c => c.loyaltyCard.isActive).length
      },
      staff: {
        totalStaff: 5, // Mock data
        activeStaff: 4,
        topPerformers: [] // Would be calculated from actual staff data
      },
      topProducts,
      paymentMethods
    };
  };

  const getAllBranchesAnalytics = (startDate: Date, endDate: Date): BranchAnalytics[] => {
    return storeLocations.map(store => getBranchAnalytics(store.id, startDate, endDate));
  };

  return (
    <AppContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      searchProducts,
      customers,
      addCustomer,
      updateCustomer,
      getCustomer,
      searchCustomers,
      transactions,
      addTransaction,
      getTransactionsByDateRange,
      getTransactionsByStore,
      storeLocations,
      currentStore,
      setCurrentStore,
      addStoreLocation,
      updateStoreLocation,
      deleteStoreLocation,
      getBranchAnalytics,
      getAllBranchesAnalytics,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};