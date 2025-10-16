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
  Play,
  RefreshCw
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
  const [rechecking, setRechecking] = useState(false);

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

  const recheckReport = async (assignmentId) => {
    try {
      setRechecking(true);
      setError('');
      
      // Generate a new report for the same assignment
      const response = await reportsAPI.generate(assignmentId);
      console.log('Recheck started:', response.data);
      
      // Start polling for the new report
      if (response.data.reportId) {
        pollReportStatus(response.data.reportId);
      }
      
    } catch (error) {
      console.error('Failed to recheck report:', error);
      setError(error.response?.data?.error || 'Failed to recheck report');
    }
  };

  const pollReportStatus = async (reportId) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await reportsAPI.getById(reportId);
        const report = response.data.report;

        if (report.status === 'completed') {
          setSelectedReport(report);
          setRechecking(false);
          setError(''); // Clear any previous errors
          // You could add a success notification here if you have a notification system
          return;
        } else if (report.status === 'failed') {
          setError("Recheck failed: " + (report.error_message || "Unknown error"));
          setRechecking(false);
          return;
        } else if (attempts >= maxAttempts) {
          setError("Recheck is taking longer than expected. Please refresh the page.");
          setRechecking(false);
          return;
        }

        // Continue polling
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        console.error("Error polling report status:", error);
        setRechecking(false);
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 2000);
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
          
          {/* Comprehensive Report Details */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedReport.assignments?.assignment_title || 'Report Details'}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Analysis results and detection scores
                  </p>
                  {selectedReport.assignments && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Student: {selectedReport.assignments.student_name}</p>
                      <p>Course: {selectedReport.assignments.course_name}</p>
                      <p>File: {selectedReport.assignments.file_name}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {selectedReport.status === 'completed' && (
                    <button
                      onClick={() => recheckReport(selectedReport.assignment_id)}
                      disabled={rechecking}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md transition-colors",
                        rechecking 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      )}
                      title="Generate a new analysis report"
                    >
                      <RefreshCw className={cn("h-3 w-3 mr-1", rechecking && "animate-spin")} />
                      {rechecking ? 'Rechecking...' : 'Recheck'}
                    </button>
                  )}
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    (selectedReport.ai_probability > 0.7 || selectedReport.plagiarism_score > 0.3) && "bg-red-100 text-red-800",
                    (selectedReport.ai_probability > 0.4 || selectedReport.plagiarism_score > 0.15) && (selectedReport.ai_probability <= 0.7 && selectedReport.plagiarism_score <= 0.3) && "bg-yellow-100 text-yellow-800",
                    (selectedReport.ai_probability <= 0.4 && selectedReport.plagiarism_score <= 0.15) && "bg-green-100 text-green-800"
                  )}>
                    {(selectedReport.ai_probability > 0.7 || selectedReport.plagiarism_score > 0.3) ? 'HIGH RISK' :
                     (selectedReport.ai_probability > 0.4 || selectedReport.plagiarism_score > 0.15) ? 'MEDIUM RISK' : 'LOW RISK'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedReport.completed_at || selectedReport.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status and Progress */}
            {(selectedReport.status === 'processing' || rechecking) && (
              <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-500 animate-spin mr-2" />
                  <span className="text-sm text-blue-700">
                    {rechecking ? 'Rechecking and generating new analysis...' : 
                     (selectedReport.progress_message || 'Generating report...')}
                  </span>
                </div>
              </div>
            )}

            {selectedReport.status === 'failed' && (
              <div className="px-4 py-3 bg-red-50 border-b border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">
                    Report generation failed: {selectedReport.error_message || 'Unknown error'}
                  </span>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {selectedReport.status === 'completed' && (
              <>
                <div className="px-4 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Detection Card */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">AI Content Detection</h4>
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {((selectedReport.ai_probability || 0) * 100).toFixed(1)}%
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            selectedReport.ai_probability > 0.7 && "bg-red-100 text-red-700",
                            (selectedReport.ai_probability > 0.4 && selectedReport.ai_probability <= 0.7) && "bg-yellow-100 text-yellow-700",
                            selectedReport.ai_probability <= 0.4 && "bg-green-100 text-green-700"
                          )}>
                            {selectedReport.ai_probability > 0.7 ? 'High' : 
                             selectedReport.ai_probability > 0.4 ? 'Medium' : 'Low'} confidence
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(selectedReport.ai_probability || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Plagiarism Detection Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Plagiarism Detection</h4>
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {((selectedReport.plagiarism_score || 0) * 100).toFixed(1)}%
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            selectedReport.plagiarism_score > 0.5 && "bg-red-100 text-red-700",
                            (selectedReport.plagiarism_score > 0.2 && selectedReport.plagiarism_score <= 0.5) && "bg-yellow-100 text-yellow-700",
                            selectedReport.plagiarism_score <= 0.2 && "bg-green-100 text-green-700"
                          )}>
                            {selectedReport.plagiarism_score > 0.5 ? 'High' : 
                             selectedReport.plagiarism_score > 0.2 ? 'Medium' : 'Low'} confidence
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(selectedReport.plagiarism_score || 0) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verdict Section */}
                {selectedReport.verdict && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis Verdict</h4>
                    <div className={cn(
                      "p-3 rounded-lg border-l-4",
                      (selectedReport.ai_probability > 0.7 || selectedReport.plagiarism_score > 0.3) && "bg-red-50 border-red-400 text-red-700",
                      (selectedReport.ai_probability > 0.4 || selectedReport.plagiarism_score > 0.15) && (selectedReport.ai_probability <= 0.7 && selectedReport.plagiarism_score <= 0.3) && "bg-yellow-50 border-yellow-400 text-yellow-700",
                      (selectedReport.ai_probability <= 0.4 && selectedReport.plagiarism_score <= 0.15) && "bg-green-50 border-green-400 text-green-700"
                    )}>
                      <p className="font-medium">{selectedReport.verdict}</p>
                      <p className="mt-1 text-sm opacity-90">
                        Analysis of content shows {((selectedReport.ai_probability || 0) * 100).toFixed(1)}% AI probability 
                        and {((selectedReport.plagiarism_score || 0) * 100).toFixed(1)}% plagiarism similarity.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {(selectedReport.ai_probability > 0.7 || selectedReport.plagiarism_score > 0.3) && (
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Immediate manual review required</span>
                      </li>
                    )}
                    {selectedReport.ai_probability > 0.7 && (
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Discuss AI usage policies with student</span>
                      </li>
                    )}
                    {selectedReport.plagiarism_score > 0.3 && (
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Review flagged passages with student</span>
                      </li>
                    )}
                    {(selectedReport.ai_probability <= 0.4 && selectedReport.plagiarism_score <= 0.15) && (
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">No immediate action required - standard grading can proceed</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* AI Highlights */}
                {selectedReport.ai_highlight && selectedReport.ai_highlight.length > 0 && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">AI-Generated Content Highlights</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {selectedReport.ai_highlight.filter(h => h.ai).length} AI-flagged sentences
                      </span>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedReport.ai_highlight.filter(h => h.ai).slice(0, 15).map((highlight, index) => (
                        <div key={index} className="relative p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-lg shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-relaxed mb-2">
                                <span className="font-medium text-purple-800">"{highlight.text}"</span>
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex items-center text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full font-medium">
                                  🤖 AI-Generated Content
                                </span>
                                <span className="text-xs text-gray-500">
                                  Sentence {index + 1}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedReport.ai_highlight.filter(h => h.ai).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                          <p className="text-sm">No AI-generated content detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sources Summary */}
                {selectedReport.plagiarism_highlight && selectedReport.plagiarism_highlight.length > 0 && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sources Found</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {Array.from(new Set(selectedReport.plagiarism_highlight.map(h => h.source)))
                        .slice(0, 6)
                        .map((source, index) => {
                          const matchCount = selectedReport.plagiarism_highlight.filter(h => h.source === source).length;
                          const avgScore = selectedReport.plagiarism_highlight
                            .filter(h => h.source === source)
                            .reduce((sum, h) => sum + (h.score || 0), 0) / matchCount;
                          
                          const isValidUrl = (() => {
                            try {
                              new URL(source);
                              return true;
                            } catch {
                              return false;
                            }
                          })();
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {isValidUrl ? (
                                  <a 
                                    href={source} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 truncate max-w-xs"
                                  >
                                    {new URL(source).hostname}
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-600 truncate max-w-xs" title={source}>
                                    {source.length > 25 ? source.substring(0, 25) + '...' : source}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">{matchCount} matches</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {(avgScore * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Plagiarism Highlights */}
                {selectedReport.plagiarism_highlight && selectedReport.plagiarism_highlight.length > 0 && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Detailed Plagiarism Highlights</h4>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {selectedReport.plagiarism_highlight.length} potential matches found
                      </span>
                    </div>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedReport.plagiarism_highlight.slice(0, 15).map((highlight, index) => (
                        <div key={index} className="relative p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 rounded-lg shadow-sm">
                          <div className="space-y-3">
                            {/* Highlighted Text */}
                            <div>
                              <p className="text-sm text-gray-800 leading-relaxed">
                                <span className="font-medium text-blue-800">"{highlight.text}"</span>
                              </p>
                            </div>
                            
                            {/* Source Information */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {(() => {
                                  try {
                                    const url = new URL(highlight.source);
                                    return (
                                      <a 
                                        href={highlight.source} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        <span className="max-w-xs truncate">
                                          {highlight.title || url.hostname}
                                        </span>
                                      </a>
                                    );
                                  } catch {
                                    return (
                                      <div className="inline-flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        <FileText className="h-3 w-3 mr-1" />
                                        <span className="max-w-xs truncate">
                                          {highlight.title || 'Academic Source'}
                                        </span>
                                      </div>
                                    );
                                  }
                                })()}
                                {highlight.matchedPatterns && highlight.matchedPatterns.length > 0 && (
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    Pattern: {highlight.matchedPatterns[0]}
                                  </span>
                                )}
                              </div>
                              
                              {/* Match Score */}
                              <div className="flex items-center space-x-2">
                                <span className={cn(
                                  "inline-flex items-center text-xs font-medium px-2 py-1 rounded-full",
                                  (highlight.score || 0) > 0.7 && "bg-red-100 text-red-700",
                                  (highlight.score || 0) > 0.4 && (highlight.score || 0) <= 0.7 && "bg-yellow-100 text-yellow-700",
                                  (highlight.score || 0) <= 0.4 && "bg-blue-100 text-blue-700"
                                )}>
                                  📊 {((highlight.score || 0) * 100).toFixed(1)}% similarity
                                </span>
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                            
                            {/* Additional Source Info */}
                            {highlight.authors && (
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Authors:</span> {highlight.authors}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {selectedReport.plagiarism_highlight.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                          <p className="text-sm">No plagiarism detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Overview with Inline Highlighting */}
                {(selectedReport.ai_highlight || selectedReport.plagiarism_highlight) && (
                  <div className="px-4 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Text Analysis Overview</h4>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-200 rounded mr-1"></div>
                          <span>AI Content</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-200 rounded mr-1"></div>
                          <span>Plagiarism</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                          <span>Original</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="text-sm leading-relaxed space-y-2">
                        {selectedReport.ai_highlight && selectedReport.ai_highlight.map((sentence, index) => {
                          // Check if this sentence is also flagged for plagiarism
                          const plagiarismMatch = selectedReport.plagiarism_highlight?.find(p => 
                            p.text.toLowerCase().includes(sentence.text.toLowerCase().substring(0, 50)) ||
                            sentence.text.toLowerCase().includes(p.text.toLowerCase().substring(0, 50))
                          );
                          
                          return (
                            <span
                              key={index}
                              className={cn(
                                "inline-block mr-1 px-1 py-0.5 rounded transition-all duration-200 hover:shadow-sm",
                                sentence.ai && plagiarismMatch && "bg-gradient-to-r from-purple-200 to-blue-200 border border-purple-300",
                                sentence.ai && !plagiarismMatch && "bg-purple-100 border border-purple-200",
                                !sentence.ai && plagiarismMatch && "bg-blue-100 border border-blue-200",
                                !sentence.ai && !plagiarismMatch && "bg-white"
                              )}
                              title={
                                sentence.ai && plagiarismMatch ? "AI-Generated + Plagiarism" :
                                sentence.ai ? "AI-Generated" :
                                plagiarismMatch ? "Potential Plagiarism" : "Original Content"
                              }
                            >
                              {sentence.text}
                              {sentence.ai && plagiarismMatch && (
                                <span className="ml-1 text-xs">🤖📄</span>
                              )}
                              {sentence.ai && !plagiarismMatch && (
                                <span className="ml-1 text-xs">🤖</span>
                              )}
                              {!sentence.ai && plagiarismMatch && (
                                <span className="ml-1 text-xs">📄</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Summary */}
                <div className="px-4 py-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Analysis Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                      <div className="font-bold text-lg text-gray-900">
                        {selectedReport.ai_highlight ? selectedReport.ai_highlight.length : 0}
                      </div>
                      <div className="text-gray-600 text-xs">Sentences Analyzed</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <div className="font-bold text-lg text-purple-700">
                        {selectedReport.ai_highlight ? selectedReport.ai_highlight.filter(h => h.ai).length : 0}
                      </div>
                      <div className="text-purple-600 text-xs">AI-Flagged</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="font-bold text-lg text-blue-700">
                        {selectedReport.plagiarism_highlight ? selectedReport.plagiarism_highlight.length : 0}
                      </div>
                      <div className="text-blue-600 text-xs">Plagiarism Matches</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="font-bold text-lg text-green-700">
                        {selectedReport.ai_highlight ? 
                          selectedReport.ai_highlight.length - selectedReport.ai_highlight.filter(h => h.ai).length : 0}
                      </div>
                      <div className="text-green-600 text-xs">Original Content</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Report completed on {formatDate(selectedReport.completed_at || selectedReport.created_at)}
                    </p>
                  </div>
                </div>
              </>
            )}
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