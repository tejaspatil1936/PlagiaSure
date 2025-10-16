import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsAPI, assignmentsAPI } from '../services/api';
import { 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink,
  Download,
  ArrowLeft,
  Play
} from 'lucide-react';
import { formatDate, getScoreColor, getScoreBgColor, cn } from '../lib/utils';

const Reports = () => {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    if (id) {
      loadSingleReport(id);
    } else {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [assignmentsRes, reportsRes] = await Promise.all([
        assignmentsAPI.getAll(),
        reportsAPI.getAll()
      ]);
      
      setAssignments(assignmentsRes.data.assignments || []);
      setReports(reportsRes.data.reports || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (assignmentId) => {
    try {
      setGenerating(prev => ({ ...prev, [assignmentId]: true }));
      await reportsAPI.generate(assignmentId);
      await loadData(); // Reload data after generation
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(prev => ({ ...prev, [assignmentId]: false }));
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

  const getReportForAssignment = (assignmentId) => {
    return reports.find(report => report.assignment_id === assignmentId);
  };

  // If viewing a single report
  if (id && selectedReport) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/reports" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </Link>
          
          {/* Report Details Here */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Report Details</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Analysis results and detection scores
              </p>
            </div>
            {/* Add your existing report details rendering here */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View plagiarism and AI detection analysis results
        </p>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading...</h3>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Assignments List */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {assignments.map((assignment) => {
                const report = getReportForAssignment(assignment.id);
                return (
                  <li key={assignment.id}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {assignment.assignment_title}
                        </h3>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <FileText className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <p>{assignment.file_name}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>Student: {assignment.student_name} | Course: {assignment.course_name}</p>
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        {report ? (
                          <Link
                            to={`/reports/${report.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            View Report
                          </Link>
                        ) : (
                          <button
                            onClick={() => generateReport(assignment.id)}
                            disabled={generating[assignment.id]}
                            className={cn(
                              "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white",
                              generating[assignment.id]
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            )}
                          >
                            {generating[assignment.id] ? (
                              <>
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Generate Report
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
              {assignments.length === 0 && (
                <li className="px-4 py-8">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload assignments to generate reports.</p>
                    <div className="mt-6">
                      <Link
                        to="/assignments/upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Upload Assignment
                      </Link>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;