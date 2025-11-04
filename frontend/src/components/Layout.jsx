import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Force rebuild to fix Upload import issue
import { useAuth } from "../contexts/AuthContext";
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
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      color: "text-[#3282B8]",
    },
    {
      name: "Assignments",
      href: "/assignments",
      icon: Upload,
      color: "text-[#3AB795]",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      color: "text-[#52DE97]",
    },
    {
      name: "Subscription",
      href: "/subscription",
      icon: CreditCard,
      color: "text-[#2D4B7C]",
    },
  ];

  const adminNavigation = [
    {
      name: "Admin Panel",
      href: "/admin",
      icon: Shield,
      color: "text-red-600",
    },
  ];

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  const isAdmin = user?.profile?.is_admin || user?.profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 flex z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-sm w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-14 pt-4">
            <button
              className="ml-1 flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-30 shadow-lg"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white drop-shadow-sm" />
            </button>
          </div>
          <MobileSidebarContent
            navigation={navigation}
            adminNavigation={isAdmin ? adminNavigation : []}
            location={location}
            user={user}
            onLogout={handleLogout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 z-30",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
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
      <div
        className={cn(
          "flex flex-col flex-1 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        {/* Mobile Header - Always visible on small and medium screens */}
        <div className="sticky top-0 z-20 lg:hidden bg-white shadow-lg border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              className="p-3 rounded-xl bg-[#2D4B7C] hover:bg-[#3282B8] text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-white border-opacity-20"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6 text-white drop-shadow-sm" />
            </button>
            <div className="flex items-center space-x-3">
              <img
                src="/plagiasure.png"
                alt="PlagiaSure Logo"
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold text-gray-900">PlagiaSure</h1>
            </div>
            <div className="w-12"></div> {/* Spacer for centering */}
          </div>
        </div>
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-white to-blue-50">
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

const MobileSidebarContent = ({
  navigation,
  adminNavigation,
  location,
  user,
  onLogout,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center h-20 flex-shrink-0 px-6 bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#52DE97] rounded-full blur-2xl translate-y-12 -translate-x-12 animate-float"></div>
        </div>

        <div className="flex items-center relative z-10">
          <div className="relative">
            <img
              src="/plagiasure.png"
              alt="PlagiaSure Logo"
              className="h-10 w-10 drop-shadow-lg"
            />
          </div>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-white drop-shadow-sm">
              PlagiaSure
            </h1>
            <p className="text-xs text-white text-opacity-90 font-medium">
              AI Detection Suite
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-[#3282B8] to-[#3AB795] text-white shadow-lg"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-[#3282B8] hover:shadow-md"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-10 animate-pulse"></div>
                )}
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-6 w-6 mr-4 transition-all duration-200",
                    isActive
                      ? "text-white drop-shadow-sm"
                      : `${item.color} group-hover:scale-110`
                  )}
                />
                <span className="relative z-10">{item.name}</span>
                {isActive && (
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
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Admin
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "flex-shrink-0 h-6 w-6 mr-4 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : `${item.color} group-hover:scale-110`
                      )}
                    />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Mobile User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0 relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#3282B8] to-[#52DE97] flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.profile?.school_name || "Premium User"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="ml-3 flex-shrink-0 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({
  navigation,
  adminNavigation,
  location,
  user,
  onLogout,
  collapsed,
  onToggleCollapse,
}) => {
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
          </div>
          {!collapsed && (
            <div className="ml-4">
              <h1 className="text-xl font-bold text-white drop-shadow-sm">
                PlagiaSure
              </h1>
              <p className="text-xs text-white text-opacity-90 font-medium">
                AI Detection Suite
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-3 rounded-xl bg-[#2D4B7C] hover:bg-[#1A365D] transition-all duration-200 border-opacity-30 relative z-10 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-white drop-shadow-sm" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-white drop-shadow-sm" />
            )}
          </button>
        )}
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
                    ? "bg-gradient-to-r from-[#3282B8] to-[#3AB795] text-white shadow-lg transform scale-105"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-[#3282B8] hover:shadow-md hover:scale-102"
                )}
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-10 animate-pulse"></div>
                )}
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5 transition-all duration-200",
                    isActive
                      ? "text-white drop-shadow-sm"
                      : `${item.color} group-hover:scale-110`,
                    collapsed ? "mx-auto" : "mr-4"
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
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:shadow-md hover:scale-102"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        "flex-shrink-0 h-5 w-5 transition-all duration-200",
                        isActive
                          ? "text-white"
                          : `${item.color} group-hover:scale-110`,
                        collapsed ? "mx-auto" : "mr-4"
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
          <div
            className={cn(
              "flex items-center transition-all duration-200",
              collapsed ? "justify-center" : "w-full"
            )}
          >
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#3282B8] to-[#52DE97] flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            {!collapsed && (
              <>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.profile?.school_name || "Premium User"}
                  </p>
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
