import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Warehouse,
  Library,
  FileText,
  Shield,
  Settings,
  User,
  HelpCircle,
  AlertTriangle,
  Cpu,
  LogOut,
  Box,
  X
} from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

// Types
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: MenuItem[];
  badge?: number;
  permission?: string;
  roles?: string[];
  showPlusIcon?: boolean;
}

interface User {
  id?: number;
  companyId?: string;
  companyName?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  permissions?: string[];
}

// Permission checking utilities
const hasPermission = (user: User | null, permission?: string): boolean => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (!permission) return true;
  return user.permissions?.includes(permission) || false;
};


// Menu Item Component
interface MenuItemProps {
  item: MenuItem;
  isActive: boolean;
  user: User | null;
}

const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  isActive,
  user
}) => {
  const isVisible = 
    (!item.permission || hasPermission(user, item.permission)) &&
    (!item.roles || item.roles.includes(user?.role || ''));

  if (!isVisible || !item.path) return null;

  return (
    <Link
      to={item.path}
      className={`
        px-3 py-2 flex items-center gap-3 group
        ${isActive ? 'bg-active-purple' : ''}
        ${isActive ? 'text-white' : 'text-white'}
        hover:bg-opacity-80 transition-colors duration-150
        cursor-pointer rounded-lg
      `}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white'}`} />
      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} truncate leading-tight`}>
        {item.label}
      </span>
    </Link>
  );
};

// Main Sidebar Component
const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, toggleSidebar } = useSidebar();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from storage
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  // Menu configuration organized by sections
  const menuSections = [
    {
      title: 'MAIN',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/app/dashboard',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'sku',
          label: 'SKU Management',
          icon: Cpu,
          path: '/app/sku',
          permission: 'sku.view',
        },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: Warehouse,
          path: '/app/inventory',
          permission: 'inventory.view',
        },
        {
          id: 'library',
          label: 'Library',
          icon: Library,
          path: '/app/library',
          roles: ['admin', 'super_admin'],
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        {
          id: 'reports',
          label: 'Reports',
          icon: FileText,
          path: '/app/reports',
          permission: 'reports.view',
        },
        {
          id: 'rejected-items',
          label: 'Rejected/Short Items',
          icon: AlertTriangle,
          path: '/app/rejected-items',
          permission: 'inventory.view',
        },
      ],
    },
    {
      title: 'ACTIONS',
      items: [
        {
          id: 'access-control',
          label: 'Access Control',
          icon: Shield,
          path: '/app/access-control',
          roles: ['super_admin'],
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          path: '/app/settings',
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/app/profile',
        },
        {
          id: 'help',
          label: 'Help & Support',
          icon: HelpCircle,
          path: '/app/help',
        },
      ],
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`w-60 h-screen bg-sidebar-dark flex flex-col fixed left-0 top-0 overflow-hidden transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo Area */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-6 h-6 text-white" />
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">Nexus</span>
                <span className="text-lg font-bold text-logo-purple">Inv</span>
              </div>
            </div>
            {/* Hamburger/Close Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuSections.map((section) => {
              // Filter visible items for this section
              const visibleItems = section.items.filter((item: MenuItem) => {
                const isVisible = 
                  (!item.permission || hasPermission(user, item.permission)) &&
                  (!item.roles || item.roles.includes(user?.role || ''));
                return isVisible && item.path;
              });

              // Don't render section if no visible items
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {/* Section Items */}
                    {visibleItems.map((item) => (
                      <MenuItemComponent
                        key={item.id}
                        item={item}
                        isActive={location.pathname === item.path}
                        user={user}
                      />
                    ))}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-white hover:opacity-80 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

