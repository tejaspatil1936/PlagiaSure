import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { billingAPI, assignmentsAPI, reportsAPI } from '../services/api';
import { 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Upload,
  TrendingUp,
  Users
} from 'lucide-react';
import { formatDate, getScoreColor, cn } from '../lib/utils';
import BrandedLoading from '../components/BrandedLoading';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalReports: 0,
    pendingReports: 0,
    avgAiScore: 0,
    avgPlagiarismScore: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [subscriptionRes, assignmentsRes, reportsRes] = await Promise.allSettled([
        billingAPI.getStatus(),
        assignmentsAPI.getAll({ limit: 10 }),
        reportsAPI.getAll({ limit: 5 })
      ]);

      if (subscriptionRes.status === 'fulfilled') {
        setSubscription(subscriptionRes.value.data.subscription);
      }

      if (assignmentsRes.status === 'fulfilled') {
        const assignments = assignmentsRes.value.data.assignments;
        setStats(prev => ({
          ...prev,
          totalAssignments: assignments.length
        }));
      }

      if (reportsRes.status === 'fulfilled') {
        const reports = reportsRes.value.data.reports;
        setRecentReports(reports);
        
        const completedReports = reports.filter(r => r.status === 'completed');
        const avgAi = completedReports.reduce((sum, r) => sum + (r.ai_probability || 0), 0) / completedReports.length || 0;
        const avgPlagiarism = completedReports.reduce((sum, r) => sum + (r.plagiarism_score || 0), 0) / completedReports.length || 0;
        
        setStats(prev => ({
          ...prev,
          totalReports: reports.length,
          pendingReports: reports.filter(r => r.status === 'processing').length,
          avgAiScore: avgAi,
          avgPlagiarismScore: avgPlagiarism
        }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.profile?.is_admin || user?.profile?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <BrandedLoading message="Loading your dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] rounded-2xl p-8 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#52DE97] rounded-full blur-2xl translate-y-16 -translate-x-16 animate-float"></div>
          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white opacity-40 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/2 w-4 h-4 bg-[#52DE97] opacity-50 rounded-full animate-bounce"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                <img 
                  src="/plagiasure.png" 
                  alt="PlagiaSure Logo" 
                  className="h-12 w-12 drop-shadow-lg"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#52DE97] rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">Welcome Back!</h1>
              <p className="mt-2 text-white text-opacity-90 text-lg font-medium">
                {user?.email} • Advanced AI & Plagiarism Detection Suite
              </p>
              <div className="mt-3 flex items-center space-x-4 text-sm text-white text-opacity-80">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  <span>Premium Features Active</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right text-white text-opacity-90">
              <p className="text-sm font-medium">Today's Date</p>
              <p className="text-lg font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className={cn(
          "rounded-2xl p-6 shadow-lg border backdrop-blur-sm relative overflow-hidden",
          subscription.isActive 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
        )}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-30 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
          
          <div className="flex items-center relative z-10">
            <div className={cn(
              "p-3 rounded-xl shadow-md",
              subscription.isActive ? 'bg-green-500' : 'bg-yellow-500'
            )}>
              {subscription.isActive ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <Clock className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <p className="text-lg font-bold text-gray-900">
                {subscription.isActive ? 'Premium Subscription Active' : 'Subscription Under Review'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {subscription.isActive 
                  ? `${subscription.checks_used}/${subscription.checks_limit === -1 ? '∞' : subscription.checks_limit} AI checks used this month`
                  : 'Your premium access request is being processed by our team'
                }
              </p>
              {subscription.isActive && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: subscription.checks_limit === -1 ? '100%' : 
                             `${Math.min((subscription.checks_used / subscription.checks_limit) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Reports Generated"
          value={stats.totalReports}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Avg AI Detection"
          value={`${(stats.avgAiScore * 100).toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/assignments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-8 w-8 text-[#3282B8] mr-3" />
            <div>
              <p className="font-medium text-gray-900">Upload Assignment</p>
              <p className="text-sm text-gray-500">Upload a new file for analysis</p>
            </div>
          </Link>
          
          <Link
            to="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-[#52DE97] mr-3" />
            <div>
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500">Check analysis results</p>
            </div>
          </Link>
          
          {!subscription && (
            <Link
              to="/subscription"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="h-8 w-8 text-[#3AB795] mr-3" />
              <div>
                <p className="font-medium text-gray-900">Get Subscription</p>
                <p className="text-sm text-gray-500">Request access to premium features</p>
              </div>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Users className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Admin Panel</p>
                <p className="text-sm text-gray-500">Manage subscriptions</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentReports.map((report) => (
              <div key={report.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {report.assignments?.assignment_title || 'Assignment'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Student: {report.assignments?.student_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {report.status === 'completed' ? (
                      <>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">AI Detection</p>
                          <p className={`font-medium ${getScoreColor(report.ai_probability)}`}>
                            {(report.ai_probability * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Plagiarism</p>
                          <p className={`font-medium ${getScoreColor(report.plagiarism_score)}`}>
                            {(report.plagiarism_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center text-yellow-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">Processing</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-gray-50">
            <Link
              to="/reports"
              className="text-sm font-medium text-[#3282B8] hover:text-[#2D4B7C]"
            >
              View all reports →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: {
      icon: 'text-[#3282B8]',
      bg: 'bg-gradient-to-br from-[#3282B8]/10 to-[#3282B8]/20',
      border: 'border-[#3282B8]/20',
      glow: 'shadow-[#3282B8]/20'
    },
    green: {
      icon: 'text-[#52DE97]',
      bg: 'bg-gradient-to-br from-[#52DE97]/10 to-[#52DE97]/20',
      border: 'border-[#52DE97]/20',
      glow: 'shadow-[#52DE97]/20'
    },
    yellow: {
      icon: 'text-[#3AB795]',
      bg: 'bg-gradient-to-br from-[#3AB795]/10 to-[#3AB795]/20',
      border: 'border-[#3AB795]/20',
      glow: 'shadow-[#3AB795]/20'
    },
    purple: {
      icon: 'text-[#2D4B7C]',
      bg: 'bg-gradient-to-br from-[#2D4B7C]/10 to-[#2D4B7C]/20',
      border: 'border-[#2D4B7C]/20',
      glow: 'shadow-[#2D4B7C]/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full blur-xl -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="flex items-center relative z-10">
        <div className={cn(
          "p-4 rounded-2xl shadow-lg border transition-all duration-300 group-hover:scale-110",
          colors.bg,
          colors.border
        )}>
          <Icon className={cn("h-7 w-7", colors.icon)} />
        </div>
        <div className="ml-6 flex-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
      
      {/* Animated accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 group-hover:h-2",
        color === 'blue' && 'from-[#3282B8] to-[#3AB795]',
        color === 'green' && 'from-[#52DE97] to-[#3AB795]',
        color === 'yellow' && 'from-[#3AB795] to-[#52DE97]',
        color === 'purple' && 'from-[#2D4B7C] to-[#3282B8]'
      )}></div>
    </div>
  );
};

export default Dashboard;