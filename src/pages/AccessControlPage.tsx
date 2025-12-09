import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, ChevronDown, ChevronUp, Mail, Clock, Download, UserPlus, Shield, FileText, Eye } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { validateRequired, validateEmail } from '../utils/validators';
import api from '../utils/api';

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

interface Invitation {
  id: number;
  email: string;
  name: string;
  role: string;
  invitedBy: string;
  sentDate: string;
  expiresAt: string;
}

interface Role {
  id: number;
  name: string;
  description?: string;
  isDefault?: boolean;
  permissions?: any;
}

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

const AccessControlPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit-logs'>('users');
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending' | 'suspended'>('all');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Set<number>>(new Set());

  // Dialog states
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Invite form
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    moduleAccess: {
      dashboard: { view: true },
      sku: { view: true, create: true, edit: true, delete: true },
      inventory: { view: true, create: true, edit: true, delete: true },
      reports: { view: true },
      accessControl: { view: false },
      productCategory: { view: true, create: true, edit: true, delete: true },
      itemCategory: { view: true, create: true, edit: true, delete: true },
      subCategory: { view: true, create: true, edit: true, delete: true },
    },
    categoryAccess: [] as any[],
  });

  // Role form
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {} as any,
  });

  // Audit log filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Category data for invite form
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [itemCategories, setItemCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [activeTab, activeSubTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'users':
          if (activeSubTab === 'all') {
            const usersRes = await api.get('/users', { params: { role: roleFilter } });
            setUsers(usersRes.data.data || []);
          } else if (activeSubTab === 'pending') {
            const invRes = await api.get('/users/invitations');
            setInvitations(invRes.data.data || []);
          } else {
            const suspendedRes = await api.get('/users', { params: { status: 'suspended' } });
            setUsers(suspendedRes.data.data || []);
          }
          break;
        case 'roles':
          const rolesRes = await api.get('/roles');
          setRoles(rolesRes.data.data || []);
          break;
        case 'audit-logs':
          const auditRes = await api.get('/access-control/audit-logs', {
            params: {
              dateFrom,
              dateTo,
              user: userFilter,
              actionType: actionTypeFilter !== 'all' ? actionTypeFilter : undefined,
              module: moduleFilter !== 'all' ? moduleFilter : undefined,
            },
          });
          setAuditLogs(auditRes.data.data || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load product categories when invite dialog opens
    if (showInviteDialog) {
      api.get('/categories/product').then((res) => {
        setProductCategories(res.data.data || []);
      });
    }
  }, [showInviteDialog]);

  const handleInviteUser = async () => {
    const newErrors: Record<string, string> = {};
    if (!validateEmail(inviteForm.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!validateRequired(inviteForm.firstName)) {
      newErrors.firstName = 'First Name is required';
    }
    if (!validateRequired(inviteForm.lastName)) {
      newErrors.lastName = 'Last Name is required';
    }
    if (!validateRequired(inviteForm.role)) {
      newErrors.role = 'Role is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/invite', inviteForm);
      setShowInviteDialog(false);
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        role: '',
        department: '',
        moduleAccess: {
          dashboard: { view: true },
          sku: { view: true, create: true, edit: true, delete: true },
          inventory: { view: true, create: true, edit: true, delete: true },
          reports: { view: true },
          accessControl: { view: false },
          productCategory: { view: true, create: true, edit: true, delete: true },
          itemCategory: { view: true, create: true, edit: true, delete: true },
          subCategory: { view: true, create: true, edit: true, delete: true },
        },
        categoryAccess: [],
      });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoryAccess = () => {
    setInviteForm({
      ...inviteForm,
      categoryAccess: [
        ...inviteForm.categoryAccess,
        {
          productCategoryId: '',
          itemCategoryIds: [],
          subCategoryIds: [],
          permissions: { view: true, create: false, edit: false, delete: false },
        },
      ],
    });
  };

  const handleRemoveCategoryAccess = (index: number) => {
    setInviteForm({
      ...inviteForm,
      categoryAccess: inviteForm.categoryAccess.filter((_, i) => i !== index),
    });
  };

  const handleSaveRole = async () => {
    try {
      setLoading(true);
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, roleForm);
      } else {
        await api.post('/roles', roleForm);
      }
      setShowRoleDialog(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: {} });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      setLoading(true);
      if (type === 'user') {
        await api.delete(`/users/${id}`);
      } else if (type === 'role') {
        await api.delete(`/roles/${id}`);
      }
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: number) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;
    try {
      setLoading(true);
      await api.put(`/users/${id}/suspend`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to suspend user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', height: '125%' }}>
      <h1 className="text-3xl font-bold text-gray-900">Access Control</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['users', 'roles', 'audit-logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {(['all', 'pending', 'suspended'] as const).map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => setActiveSubTab(subTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeSubTab === subTab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {subTab === 'all' ? 'All Users' : subTab === 'pending' ? 'Pending Invitations' : 'Suspended Users'}
                </button>
              ))}
            </nav>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full sm:w-auto flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {activeSubTab === 'all' && (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="accountant">Accountant</option>
                </select>
              )}
            </div>
            {activeSubTab === 'all' && (
              <button
                onClick={() => setShowInviteDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Invite User
              </button>
            )}
          </div>

          {/* All Users Table */}
          {activeSubTab === 'all' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Login</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No users found</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{user.role}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.department || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Invitations Table */}
          {activeSubTab === 'pending' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Invited By</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sent Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expires In</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : invitations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No pending invitations</td>
                      </tr>
                    ) : (
                      invitations.map((inv) => {
                        const expiresAt = new Date(inv.expiresAt);
                        const now = new Date();
                        const diffMs = expiresAt.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{inv.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 capitalize">{inv.role}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{inv.invitedBy}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDate(inv.sentDate)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {diffDays > 0 ? `${diffDays} days` : 'Expired'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Resend">
                                  <Mail className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Cancel">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suspended Users Table - same as All Users */}
          {activeSubTab === 'suspended' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Last Login</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No suspended users found</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{user.role}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.department || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">
                              Suspended
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3 text-sm">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingRole(null);
                setRoleForm({ name: '', description: '', permissions: {} });
                setShowRoleDialog(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Custom Role
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : roles.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No roles found</p>
            ) : (
              roles.map((role) => (
                <div key={role.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      {role.description && <p className="text-sm text-gray-600 mt-1">{role.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!role.isDefault && (
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setRoleForm({ name: role.name, description: role.description || '', permissions: role.permissions || {} });
                            setShowRoleDialog(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {!role.isDefault && (
                        <button
                          onClick={() => handleDelete('role', role.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedRoles);
                          if (newExpanded.has(role.id)) {
                            newExpanded.delete(role.id);
                          } else {
                            newExpanded.add(role.id);
                          }
                          setExpandedRoles(newExpanded);
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      >
                        {expandedRoles.has(role.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {expandedRoles.has(role.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Module permissions and category access details would be displayed here.</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <input
                  type="text"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  placeholder="Search user"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                <select
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="sku">SKU</option>
                  <option value="inventory">Inventory</option>
                  <option value="users">Users</option>
                  <option value="settings">Settings</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Audit Log
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Module</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No audit logs found</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDate(log.timestamp)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{log.user}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 capitalize">{log.module}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{log.details || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{log.ipAddress || '-'}</td>
                        <td className="px-4 py-3 text-xs text-gray-700">{log.userAgent || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Dialog */}
      {showInviteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
                <button
                  onClick={() => setShowInviteDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={inviteForm.role}
                        onChange={(e) => {
                          const selectedRole = e.target.value;
                          // Auto-set permissions based on role
                          if (selectedRole === 'admin') {
                            // Admin gets full CRUD
                            setInviteForm({
                              ...inviteForm,
                              role: selectedRole,
                              moduleAccess: {
                                dashboard: { view: true },
                                sku: { view: true, create: true, edit: true, delete: true },
                                inventory: { view: true, create: true, edit: true, delete: true },
                                reports: { view: true },
                                accessControl: { view: false },
                                productCategory: { view: true, create: true, edit: true, delete: true },
                                itemCategory: { view: true, create: true, edit: true, delete: true },
                                subCategory: { view: true, create: true, edit: true, delete: true },
                              },
                            });
                          } else if (selectedRole === 'sales') {
                            // Sales gets view only
                            setInviteForm({
                              ...inviteForm,
                              role: selectedRole,
                              moduleAccess: {
                                dashboard: { view: true },
                                sku: { view: true, create: false, edit: false, delete: false },
                                inventory: { view: true, create: false, edit: false, delete: false },
                                reports: { view: true },
                                accessControl: { view: false },
                                productCategory: { view: true, create: false, edit: false, delete: false },
                                itemCategory: { view: true, create: false, edit: false, delete: false },
                                subCategory: { view: true, create: false, edit: false, delete: false },
                              },
                            });
                          } else {
                            setInviteForm({ ...inviteForm, role: selectedRole });
                          }
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.role ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="sales">Sales</option>
                      </select>
                      {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={inviteForm.firstName}
                        onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={inviteForm.lastName}
                        onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={inviteForm.department}
                        onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Module Access */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Access</h3>
                  <div className="space-y-3">
                    {Object.entries(inviteForm.moduleAccess).map(([module, perms]: [string, any]) => {
                      const moduleLabels: Record<string, string> = {
                        sku: 'SKU Management',
                        accessControl: 'Access Control',
                        productCategory: 'Product Category Access',
                        itemCategory: 'Item Category Access',
                        subCategory: 'Sub Category Access',
                      };
                      const moduleLabel = moduleLabels[module] || module.charAt(0).toUpperCase() + module.slice(1);
                      const showCRUD = perms.view && module !== 'dashboard' && module !== 'reports' && module !== 'accessControl';
                      
                      return (
                        <div key={module} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={perms.view}
                              onChange={(e) =>
                                setInviteForm({
                                  ...inviteForm,
                                  moduleAccess: {
                                    ...inviteForm.moduleAccess,
                                    [module]: { ...perms, view: e.target.checked },
                                  },
                                })
                              }
                              className="rounded"
                            />
                            <span className="font-medium">{moduleLabel}</span>
                          </div>
                          {showCRUD && (
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={perms.create}
                                  onChange={(e) =>
                                    setInviteForm({
                                      ...inviteForm,
                                      moduleAccess: {
                                        ...inviteForm.moduleAccess,
                                        [module]: { ...perms, create: e.target.checked },
                                      },
                                    })
                                  }
                                  className="rounded"
                                />
                                <span>Create</span>
                              </label>
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={perms.edit}
                                  onChange={(e) =>
                                    setInviteForm({
                                      ...inviteForm,
                                      moduleAccess: {
                                        ...inviteForm.moduleAccess,
                                        [module]: { ...perms, edit: e.target.checked },
                                      },
                                    })
                                  }
                                  className="rounded"
                                />
                                <span>Edit</span>
                              </label>
                              <label className="flex items-center gap-1 text-sm">
                                <input
                                  type="checkbox"
                                  checked={perms.delete}
                                  onChange={(e) =>
                                    setInviteForm({
                                      ...inviteForm,
                                      moduleAccess: {
                                        ...inviteForm.moduleAccess,
                                        [module]: { ...perms, delete: e.target.checked },
                                      },
                                    })
                                  }
                                  className="rounded"
                                />
                                <span>Delete</span>
                              </label>
                            </div>
                          )}
                          {module === 'accessControl' && perms.view && (
                            <span className="text-xs text-gray-500">(Super Admin Only)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Access */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Category Access</h3>
                    <button
                      onClick={handleAddCategoryAccess}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Category Access
                    </button>
                  </div>
                  <div className="space-y-4">
                    {inviteForm.categoryAccess.map((catAccess, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium text-gray-700">Category Access {index + 1}</span>
                          <button
                            onClick={() => handleRemoveCategoryAccess(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                            <select
                              value={catAccess.productCategoryId}
                              onChange={(e) => {
                                const updated = [...inviteForm.categoryAccess];
                                updated[index].productCategoryId = e.target.value;
                                setInviteForm({ ...inviteForm, categoryAccess: updated });
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Product Category</option>
                              {productCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                            <div className="flex gap-4">
                              {['view', 'create', 'edit', 'delete'].map((perm) => (
                                <label key={perm} className="flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={catAccess.permissions[perm]}
                                    onChange={(e) => {
                                      const updated = [...inviteForm.categoryAccess];
                                      updated[index].permissions[perm] = e.target.checked;
                                      setInviteForm({ ...inviteForm, categoryAccess: updated });
                                    }}
                                    className="rounded"
                                  />
                                  <span className="capitalize">{perm}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {inviteForm.categoryAccess.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No category access added</p>
                    )}
                  </div>
                </div>

                {/* Review Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Review Summary</h3>
                  <p className="text-sm text-blue-800">
                    {inviteForm.firstName} {inviteForm.lastName} ({inviteForm.email}) will be invited as {inviteForm.role}
                    {inviteForm.department && ` in ${inviteForm.department} department`}. Module access and category permissions as configured above.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowInviteDialog(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Dialog */}
      {showRoleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Create Custom Role'}
                </h2>
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Module Permissions</h3>
                  <p className="text-sm text-gray-600">Module permissions matrix would be displayed here.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRole}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControlPage;

