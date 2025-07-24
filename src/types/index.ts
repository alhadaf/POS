// Core Data Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  photo?: string;
  phoneNumber?: string;
  emergencyContact?: EmergencyContact;
  certifications?: Certification[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'pending';
}

export type UserRole = 
  | 'admin' 
  | 'store_manager' 
  | 'assistant_manager' 
  | 'department_manager' 
  | 'supervisor' 
  | 'cashier' 
  | 'stock_clerk' 
  | 'customer_service' 
  | 'security' 
  | 'maintenance';

export type Permission = 
  | 'pos_operate' 
  | 'pos_void' 
  | 'pos_refund' 
  | 'inventory_view' 
  | 'inventory_edit' 
  | 'customer_view' 
  | 'customer_edit' 
  | 'staff_view' 
  | 'staff_edit' 
  | 'reports_view' 
  | 'reports_generate' 
  | 'settings_view' 
  | 'settings_edit' 
  | 'price_override' 
  | 'manager_approval';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: Category;
  subcategory?: Subcategory;
  brand: string;
  unitPrice: number;
  costPrice: number;
  weight?: number;
  volume?: number;
  dimensions?: Dimensions;
  barcode: string;
  images: string[];
  stockQuantity: number;
  reorderPoint: number;
  maxStock: number;
  supplier: Supplier;
  expiryDate?: Date;
  batchNumber?: string;
  isActive: boolean;
  isWeighted: boolean;
  ageRestricted: boolean;
  minimumAge?: number;
  taxCategory: TaxCategory;
  nutritionalInfo?: NutritionalInfo;
  allergens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  paymentTerms: string;
  rating: number;
  isActive: boolean;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface NutritionalInfo {
  calories: number;
  fat: number;
  saturatedFat: number;
  carbohydrates: number;
  sugars: number;
  protein: number;
  sodium: number;
  fiber: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: Address;
  dateOfBirth?: Date;
  loyaltyCard: LoyaltyCard;
  totalSpent: number;
  averageOrderValue: number;
  lastVisit: Date;
  preferredPaymentMethod?: string;
  dietaryPreferences: string[];
  allergies: string[];
  isActive: boolean;
  createdAt: Date;
  notes?: string;
}

export interface LoyaltyCard {
  id: string;
  number: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';
  joinDate: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
  weight?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  storeId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  customer?: Customer;
  cashier: User;
  timestamp: Date;
  status: TransactionStatus;
  refundAmount?: number;
  voidReason?: string;
  receiptNumber: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'mobile' | 'gift_card' | 'store_credit' | 'layaway';
export type TransactionStatus = 'completed' | 'pending' | 'voided' | 'refunded' | 'partially_refunded';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  changeGiven?: number;
  cardLast4?: string;
  authCode?: string;
  giftCardNumber?: string;
  mobilePaymentType?: 'apple_pay' | 'google_pay' | 'samsung_pay';
}

export interface TaxCategory {
  id: string;
  name: string;
  rate: number;
  description: string;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'bundle';
  value: number;
  minPurchase?: number;
  validFrom: Date;
  validTo: Date;
  applicableProducts: string[];
  applicableCategories: string[];
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'damage' | 'expiry';
  quantity: number;
  reason: string;
  user: User;
  timestamp: Date;
  referenceNumber?: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: Address;
  phoneNumber: string;
  manager: User;
  isActive: boolean;
  operatingHours: OperatingHours;
}

export interface MarketplaceChannel {
  id: string;
  name: string;
  type: 'amazon' | 'ebay' | 'shopify' | 'woocommerce' | 'etsy' | 'facebook' | 'custom';
  apiKey?: string;
  isActive: boolean;
  syncInventory: boolean;
  syncPrices: boolean;
  defaultMarkup: number;
  lastSync: Date;
  totalSales: number;
  totalOrders: number;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  channel: MarketplaceChannel;
  customer: OnlineCustomer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OnlineOrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  shippingMethod: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface OnlineCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  addresses: Address[];
  orderHistory: string[];
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  marketplaceId?: string;
  channel: string;
}

export type OnlineOrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: number;
  cost: number;
  isActive: boolean;
}

export interface ProductListing {
  id: string;
  productId: string;
  channelId: string;
  listingId: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  isActive: boolean;
  lastSynced: Date;
  syncErrors?: string[];
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isClosed: boolean;
}