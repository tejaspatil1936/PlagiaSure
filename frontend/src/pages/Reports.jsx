import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Download,
  ArrowLeft
} from 'lucide-react';
import { formatDate, getScoreColor, getScoreBgColor, cn } from '../lib/utils';

const Reports = () => {
  const { id } = useParams();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadSingleReport(id);
    } else {
      loadReports();
    }
  }, [id]);

  const loadReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadSingleReport = async (reportId) => {
    try {
      const response = await reportsAPI.getById(reportId);
      setSelectedReport(response.data.report);
    } catch (error) {
      console.error('Failed to load report:', error);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  // Single report view
  if (selectedReport) {
    return <ReportDetail report={selectedReport} />;
  }

  // Reports list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View plagiarism and AI detection analysis results
        </p>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload assignments to generate analysis reports.
          </p>
          <div className="mt-6">
            <Link
              to="/assignments"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload Assignment
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ report }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              {report.assignments?.assignment_title || 'Assignment'}
            </h3>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            <p>Student: {report.assignments?.student_name}</p>
            <p>Course: {report.assignments?.course_name}</p>
            <p>Generated: {formatDate(report.created_at)}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          {getStatusIcon(report.status)}
          <span className="ml-2 text-sm text-gray-500 capitalize">
            {report.status}
          </span>
        </div>
      </div>

      {report.status === 'completed' && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">AI Detection</span>
              <span className={cn("text-lg font-bold", getScoreColor(report.ai_probability))}>
                {(report.ai_probability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Plagiarism</span>
              <span className={cn("text-lg font-bold", getScoreColor(report.plagiarism_score))}>
                {(report.plagiarism_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          
          {report.verdict && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Verdict:</p>
              <p className="text-sm text-gray-600">{report.verdict}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Link
              to={`/reports/${report.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {report.status === 'failed' && report.error_message && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{report.error_message}</p>
        </div>
      )}
    </div>
  );
};

const ReportDetail = ({ report }) => {
  const aiHighlights = report.ai_highlight || [];
  const plagiarismHighlights = report.plagiarism_highlight || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/reports"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {report.assignments?.assignment_title || 'Report Details'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Student: {report.assignments?.student_name} • Course: {report.assignments?.course_name}
            </p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={cn("p-2 rounded-lg", getScoreBgColor(report.ai_probability))}>
              <BarChart3 className={cn("h-6 w-6", getScoreColor(report.ai_probability))} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">AI Detection</p>
              <p className={cn("text-2xl font-bold", getScoreColor(report.ai_probability))}>
                {(report.ai_probability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={cn("p-2 rounded-lg", getScoreBgColor(report.plagiarism_score))}>
              <FileText className={cn("h-6 w-6", getScoreColor(report.plagiarism_score))} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Plagiarism</p>
              <p className={cn("text-2xl font-bold", getScoreColor(report.plagiarism_score))}>
                {(report.plagiarism_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{report.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict */}
      {report.verdict && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Analysis Verdict</h2>
          <p className="text-gray-700">{report.verdict}</p>
        </div>
      )}

      {/* AI Content Highlights */}
      {aiHighlights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">AI Content Detection</h2>
          <div className="space-y-3">
            {aiHighlights.map((highlight, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border-l-4",
                  highlight.ai 
                    ? "bg-red-50 border-red-400" 
                    : "bg-green-50 border-green-400"
                )}
              >
                <p className="text-sm text-gray-700">{highlight.text}</p>
                <p className={cn(
                  "text-xs mt-1 font-medium",
                  highlight.ai ? "text-red-600" : "text-green-600"
                )}>
                  {highlight.ai ? "Likely AI-generated" : "Appears human-written"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plagiarism Highlights */}
      {plagiarismHighlights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Plagiarism Detection</h2>
          <div className="space-y-4">
            {plagiarismHighlights.map((highlight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">{highlight.text}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className={cn("font-medium", getScoreColor(highlight.score))}>
                      {(highlight.score * 100).toFixed(1)}% match
                    </span>
                    {highlight.source && (
                      <a
                        href={highlight.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center text-indigo-600 hover:text-indigo-500"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Source
                      </a>
                    )}
                  </div>
                </div>
                {highlight.title && (
                  <p className="text-xs text-gray-500 mt-1">
                    Source: {highlight.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Metadata */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Report Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Generated</dt>
            <dd className="text-sm text-gray-900">{formatDate(report.created_at)}</dd>
          </div>
          {report.completed_at && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Completed</dt>
              <dd className="text-sm text-gray-900">{formatDate(report.completed_at)}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="text-sm text-gray-900">{report.assignments?.file_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Report ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{report.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Reports;