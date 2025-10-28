import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  ArrowRight
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

const RecentReportsWidget = ({ reports = [], assignments = [] }) => {
  const getRecentReports = () => {
    return reports
      .filter(report => report.status === 'completed')
      .sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))
      .slice(0, 5)
      .map(report => {
        const assignment = assignments.find(a => a.id === report.assignment_id);
        return { ...report, assignment };
      });
  };

  const getRiskLevel = (report) => {
    const aiRisk = report.ai_probability || 0;
    const plagiarismRisk = report.plagiarism_score || 0;
    
    if (aiRisk > 0.7 || plagiarismRisk > 0.5) {
      return { level: 'HIGH', color: 'red', icon: AlertTriangle };
    }
    if (aiRisk > 0.4 || plagiarismRisk > 0.3) {
      return { level: 'MEDIUM', color: 'yellow', icon: Clock };
    }
    return { level: 'LOW', color: 'green', icon: CheckCircle };
  };

  const getOverallStats = () => {
    const completedReports = reports.filter(r => r.status === 'completed');
    const highRisk = completedReports.filter(r => 
      (r.ai_probability || 0) > 0.7 || (r.plagiarism_score || 0) > 0.5
    ).length;
    const mediumRisk = completedReports.filter(r => 
      ((r.ai_probability || 0) > 0.4 && (r.ai_probability || 0) <= 0.7) ||
      ((r.plagiarism_score || 0) > 0.3 && (r.plagiarism_score || 0) <= 0.5)
    ).length;
    const lowRisk = completedReports.length - highRisk - mediumRisk;

    return { total: completedReports.length, highRisk, mediumRisk, lowRisk };
  };

  const recentReports = getRecentReports();
  const stats = getOverallStats();

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Analysis Reports
          </h3>
          <Link 
            to="/reports" 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.highRisk}</div>
            <div className="text-xs text-red-700">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{stats.mediumRisk}</div>
            <div className="text-xs text-yellow-700">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{stats.lowRisk}</div>
            <div className="text-xs text-green-700">Low Risk</div>
          </div>
        </div>
      </div>

      {/* Recent Reports List */}
      <div className="divide-y divide-gray-200">
        {recentReports.length > 0 ? (
          recentReports.map((report) => {
            const risk = getRiskLevel(report);
            const RiskIcon = risk.icon;
            
            return (
              <Link
                key={report.id}
                to={`/reports/${report.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      risk.color === 'red' && "bg-red-100 text-red-600",
                      risk.color === 'yellow' && "bg-yellow-100 text-yellow-600",
                      risk.color === 'green' && "bg-green-100 text-green-600"
                    )}>
                      <RiskIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {report.assignment?.assignment_title || 'Assignment'}
                        </h4>
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0",
                          risk.color === 'red' && "bg-red-100 text-red-700",
                          risk.color === 'yellow' && "bg-yellow-100 text-yellow-700",
                          risk.color === 'green' && "bg-green-100 text-green-700"
                        )}>
                          {risk.level}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{report.assignment?.student_name || 'Unknown Student'}</span>
                        <span>•</span>
                        <span>{formatDate(report.completed_at || report.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 flex-shrink-0">
                    <div className="text-center">
                      <div className="font-medium text-purple-600">
                        {((report.ai_probability || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">AI</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">
                        {((report.plagiarism_score || 0) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Plagiarism</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="px-6 py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">No reports available yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload assignments to generate analysis reports
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {recentReports.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {stats.highRisk > 0 && (
                <span className="text-red-600 font-medium">
                  {stats.highRisk} assignment{stats.highRisk !== 1 ? 's' : ''} need immediate attention
                </span>
              )}
              {stats.highRisk === 0 && stats.mediumRisk > 0 && (
                <span className="text-yellow-600 font-medium">
                  {stats.mediumRisk} assignment{stats.mediumRisk !== 1 ? 's' : ''} need review
                </span>
              )}
              {stats.highRisk === 0 && stats.mediumRisk === 0 && (
                <span className="text-green-600 font-medium">
                  All assignments look good!
                </span>
              )}
            </span>
            <Link 
              to="/reports" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage All →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentReportsWidget;