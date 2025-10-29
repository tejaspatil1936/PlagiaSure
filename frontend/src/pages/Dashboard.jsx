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
import { formatDate, getScoreColor } from '../lib/utils';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <img 
          src="/plagiasure.png" 
          alt="PlagiaSure Logo" 
          className="h-12 w-12"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PlagiaSure Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.email} • Advanced AI & Plagiarism Detection
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      {subscription && (
        <div className={`rounded-lg p-4 ${
          subscription.isActive 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            {subscription.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            )}
            <div>
              <p className="font-medium">
                {subscription.isActive ? 'Active Subscription' : 'Subscription Pending'}
              </p>
              <p className="text-sm text-gray-600">
                {subscription.isActive 
                  ? `${subscription.checks_used}/${subscription.checks_limit === -1 ? '∞' : subscription.checks_limit} checks used`
                  : 'Your subscription request is being reviewed by an administrator'
                }
              </p>
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
            <Upload className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Upload Assignment</p>
              <p className="text-sm text-gray-500">Upload a new file for analysis</p>
            </div>
          </Link>
          
          <Link
            to="/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
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
              <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
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
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
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
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;