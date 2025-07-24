import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@supermarket.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    permissions: ['pos_operate', 'pos_void', 'pos_refund', 'inventory_view', 'inventory_edit', 'customer_view', 'customer_edit', 'staff_view', 'staff_edit', 'reports_view', 'reports_generate', 'settings_view', 'settings_edit', 'price_override', 'manager_approval'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    username: 'manager1',
    email: 'manager@supermarket.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'store_manager',
    department: 'General',
    permissions: ['pos_operate', 'pos_void', 'pos_refund', 'inventory_view', 'inventory_edit', 'customer_view', 'customer_edit', 'staff_view', 'reports_view', 'reports_generate', 'price_override', 'manager_approval'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '3',
    username: 'cashier1',
    email: 'cashier@supermarket.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'cashier',
    department: 'Front End',
    permissions: ['pos_operate', 'customer_view'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2023-02-01'),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('pos_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in production, this would be a secure API call
    const foundUser = mockUsers.find(u => u.username === username && u.isActive);
    
    if (foundUser && (password === 'password' || password === 'admin123')) {
      const updatedUser = { ...foundUser, lastLogin: new Date() };
      setUser(updatedUser);
      localStorage.setItem('pos_user', JSON.stringify(updatedUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
  };

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasPermission,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};