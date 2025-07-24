import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  Award,
  Shield,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Eye,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';

const StaffManagement: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Mock staff data (in a real app, this would come from context/API)
  const mockStaff: User[] = [
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
      phoneNumber: '555-0001',
      department: 'Administration',
      emergencyContact: {
        name: 'Jane Administrator',
        relationship: 'Spouse',
        phoneNumber: '555-0002'
      }
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
      phoneNumber: '555-0101',
      emergencyContact: {
        name: 'Mary Smith',
        relationship: 'Spouse',
        phoneNumber: '555-0102'
      }
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
      phoneNumber: '555-0201',
      emergencyContact: {
        name: 'Robert Johnson',
        relationship: 'Father',
        phoneNumber: '555-0202'
      }
    },
    {
      id: '4',
      username: 'produce_mgr',
      email: 'produce@supermarket.com',
      firstName: 'Mike',
      lastName: 'Green',
      role: 'department_manager',
      department: 'Produce',
      permissions: ['pos_operate', 'inventory_view', 'inventory_edit', 'customer_view', 'reports_view'],
      isActive: true,
      lastLogin: new Date(Date.now() - 86400000), // Yesterday
      createdAt: new Date('2023-01-20'),
      phoneNumber: '555-0301',
      emergencyContact: {
        name: 'Lisa Green',
        relationship: 'Spouse',
        phoneNumber: '555-0302'
      }
    },
    {
      id: '5',
      username: 'security1',
      email: 'security@supermarket.com',
      firstName: 'David',
      lastName: 'Guard',
      role: 'security',
      department: 'Loss Prevention',
      permissions: ['pos_operate', 'customer_view', 'reports_view'],
      isActive: false,
      lastLogin: new Date(Date.now() - 604800000), // Week ago
      createdAt: new Date('2023-03-01'),
      phoneNumber: '555-0401',
      emergencyContact: {
        name: 'Susan Guard',
        relationship: 'Spouse',
        phoneNumber: '555-0402'
      }
    }
  ];

  // Filter and sort staff
  const filteredStaff = useMemo(() => {
    let filtered = mockStaff.filter(employee => {
      const matchesSearch = employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           employee.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (employee.phoneNumber && employee.phoneNumber.includes(searchQuery));
      
      const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && employee.isActive) ||
                           (statusFilter === 'inactive' && !employee.isActive);
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });

    // Sort staff
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        case 'lastLogin':
          return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockStaff, searchQuery, roleFilter, departmentFilter, statusFilter, sortBy]);

  // Staff statistics
  const staffStats = useMemo(() => {
    const totalStaff = mockStaff.length;
    const activeStaff = mockStaff.filter(s => s.isActive).length;
    const inactiveStaff = totalStaff - activeStaff;
    const managers = mockStaff.filter(s => s.role.includes('manager') || s.role === 'admin').length;
    const recentLogins = mockStaff.filter(s => {
      const daysSinceLogin = (Date.now() - new Date(s.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLogin <= 7;
    }).length;
    
    return { totalStaff, activeStaff, inactiveStaff, managers, recentLogins };
  }, [mockStaff]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'store_manager':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'assistant_manager':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'department_manager':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'supervisor':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'cashier':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'security':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (!hasPermission('staff_view')) {
    return (
      <div className="p-6 text-center">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Access Denied</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You don't have permission to view staff information.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee information, roles, and permissions
          </p>
        </div>
        {hasPermission('staff_edit') && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Staff"
          value={staffStats.totalStaff.toString()}
          icon={Users}
          color="bg-blue-600"
          trend="All employees"
        />
        <StatCard
          title="Active Staff"
          value={staffStats.activeStaff.toString()}
          icon={UserCheck}
          color="bg-green-600"
          trend="Currently employed"
        />
        <StatCard
          title="Inactive Staff"
          value={staffStats.inactiveStaff.toString()}
          icon={AlertTriangle}
          color="bg-red-600"
          trend="Terminated/suspended"
        />
        <StatCard
          title="Management"
          value={staffStats.managers.toString()}
          icon={Award}
          color="bg-purple-600"
          trend="Managers & admins"
        />
        <StatCard
          title="Recent Logins"
          value={staffStats.recentLogins.toString()}
          icon={Clock}
          color="bg-orange-600"
          trend="Last 7 days"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                placeholder="Search by name, email, username, or phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="store_manager">Store Manager</option>
              <option value="assistant_manager">Assistant Manager</option>
              <option value="department_manager">Department Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="cashier">Cashier</option>
              <option value="stock_clerk">Stock Clerk</option>
              <option value="customer_service">Customer Service</option>
              <option value="security">Security</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="Administration">Administration</option>
              <option value="General">General</option>
              <option value="Front End">Front End</option>
              <option value="Produce">Produce</option>
              <option value="Deli">Deli</option>
              <option value="Bakery">Bakery</option>
              <option value="Meat">Meat</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Loss Prevention">Loss Prevention</option>
              <option value="Maintenance">Maintenance</option>
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
      </div>

      {/* Staff List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Staff Members ({filteredStaff.length})
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredStaff.length} of {mockStaff.length} employees
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStaff.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{employee.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                          {formatRole(employee.role)}
                        </span>
                        {employee.department && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.department}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {employee.email}
                      </div>
                      {employee.phoneNumber && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {employee.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.isActive 
                          ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                          : 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(employee.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setShowEmployeeModal(true);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {hasPermission('staff_edit') && (
                          <>
                            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No staff found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-lg bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Employee Profile
              </h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                      <p className="text-sm text-gray-900 dark:text-white">@{selectedEmployee.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.department || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee Since</label>
                      <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedEmployee.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {selectedEmployee.emergencyContact && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Emergency Contact</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.emergencyContact.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.emergencyContact.relationship}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedEmployee.emergencyContact.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Permissions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEmployee.permissions.map((permission, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded-full">
                        {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                  <h4 className="text-lg font-semibold mb-4">Role & Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Role:</span>
                      <span className="font-semibold">{formatRole(selectedEmployee.role)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <span className={`font-semibold ${selectedEmployee.isActive ? 'text-green-200' : 'text-red-200'}`}>
                        {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Login:</span>
                      <span className="text-sm">{new Date(selectedEmployee.lastLogin).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Permissions:</span>
                      <span className="text-sm">{selectedEmployee.permissions.length} granted</span>
                    </div>
                  </div>
                </div>

                {selectedEmployee.certifications && selectedEmployee.certifications.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certifications</h4>
                    <div className="space-y-3">
                      {selectedEmployee.certifications.map((cert, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">{cert.name}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              cert.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : cert.status === 'expired'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            }`}>
                              {cert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Issued by {cert.issuer}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
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

export default StaffManagement;