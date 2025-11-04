import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  User, 
  Shield,
  Menu,
  X,
  Home,
  Upload,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import Footer from './Footer';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-[#3282B8]' },
    { name: 'Assignments', href: '/assignments', icon: Upload, color: 'text-[#3AB795]' },
    { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-[#52DE97]' },
    { name: 'Subscription', href: '/subscription', icon: CreditCard, color: 'text-[#2D4B7C]' },
  ];

  const adminNavigation = [
    { name: 'Admin Panel', href: '/admin', icon: Shield, color: 'text-red-600' },
  ];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isAdmin = user?.profile?.is_admin || user?.profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navigation={navigation} 
            adminNavigation={isAdmin ? adminNavigation : []}
            location={location}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-30",
        sidebarCollapsed ? "md:w-20" : "md:w-72"
      )}>
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200 shadow-xl">
          <SidebarContent 
            navigation={navigation} 
            adminNavigation={isAdmin ? adminNavigation : []}
            location={location}
            user={user}
            onLogout={handleLogout}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 min-h-screen transition-all duration-300",
        sidebarCollapsed ? "md:pl-20" : "md:pl-72"
      )}>
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, adminNavigation, location, user, onLogout, collapsed, onToggleCollapse }) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between h-20 flex-shrink-0 px-6 bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-16 translate-x-16 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#52DE97] rounded-full blur-2xl translate-y-12 -translate-x-12 animate-float"></div>
        </div>
        
        <div className="flex items-center relative z-10">
          <div className="relative">
            <img 
              src="/plagiasure.png" 
              alt="PlagiaSure Logo" 
              className="h-10 w-10 drop-shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#52DE97] rounded-full animate-pulse"></div>
          </div>
          {!collapsed && (
            <div className="ml-4">
              <h1 className="text-xl font-bold text-white drop-shadow-sm">PlagiaSure</h1>
              <p className="text-xs text-white text-opacity-90 font-medium">AI Detection Suite</p>
            </div>
          )}
        </div>
        
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 relative z-10"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? 'bg-gradient-to-r from-[#3282B8] to-[#3AB795] text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-[#3282B8] hover:shadow-md hover:scale-102'
                )}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-10 animate-pulse"></div>
                )}
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-all duration-200",
                    isActive ? 'text-white drop-shadow-sm' : `${item.color} group-hover:scale-110`,
                    collapsed ? 'mx-auto' : 'mr-4'
                  )}
                />
                {!collapsed && (
                  <span className="relative z-10">{item.name}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            );
          })}
          
          {adminNavigation.length > 0 && (
            <>
              <div className="border-t border-gray-200 mt-6 pt-6">
                {!collapsed && (
                  <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Admin
                  </p>
                )}
              </div>
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-md hover:scale-102'
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "flex-shrink-0 h-5 w-5 transition-all duration-200",
                        isActive ? 'text-white' : `${item.color} group-hover:scale-110`,
                        collapsed ? 'mx-auto' : 'mr-4'
                      )}
                    />
                    {!collapsed && (
                      <span className="relative z-10">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        
        {/* User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className={cn(
            "flex items-center transition-all duration-200",
            collapsed ? "justify-center" : "w-full"
          )}>
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3282B8] to-[#52DE97] flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            {!collapsed && (
              <>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.profile?.school_name || 'Premium User'}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
            {collapsed && (
              <button
                onClick={onLogout}
                className="absolute -top-2 -right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                title="Logout"
              >
                <LogOut className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;