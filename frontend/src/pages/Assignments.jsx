import React, { useState, useEffect } from 'react';
import { assignmentsAPI } from '../services/api';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { formatDate, formatFileSize, cn } from '../lib/utils';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    studentName: '',
    courseName: '',
    assignmentTitle: '',
    file: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, DOCX, DOC, or TXT file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setUploadForm({ ...uploadForm, file });
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('assignment', uploadForm.file);
      formData.append('studentName', uploadForm.studentName);
      formData.append('courseName', uploadForm.courseName);
      formData.append('assignmentTitle', uploadForm.assignmentTitle);

      await assignmentsAPI.upload(formData);
      
      // Reset form and close modal
      setUploadForm({
        studentName: '',
        courseName: '',
        assignmentTitle: '',
        file: null
      });
      setShowUploadModal(false);
      
      // Reload assignments
      loadAssignments();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await assignmentsAPI.delete(id);
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete assignment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage assignment files for plagiarism detection
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Assignment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first assignment.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <li key={assignment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {assignment.assignment_title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Student: {assignment.student_name} • Course: {assignment.course_name}
                          </p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{assignment.file_name}</span>
                            <span className="mx-2">•</span>
                            <span>{formatFileSize(assignment.file_size)}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(assignment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {getStatusIcon(assignment.status)}
                        <span className="ml-2 text-sm text-gray-500">
                          {getStatusText(assignment.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {assignment.reports && assignment.reports.length > 0 && (
                          <button
                            onClick={() => window.location.href = `/reports/${assignment.reports[0].id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Assignment
              </h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Student Name
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.studentName}
                    onChange={(e) => setUploadForm({ ...uploadForm, studentName: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter student name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Course Name
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.courseName}
                    onChange={(e) => setUploadForm({ ...uploadForm, courseName: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter course name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.assignmentTitle}
                    onChange={(e) => setUploadForm({ ...uploadForm, assignmentTitle: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter assignment title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    File
                  </label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOCX, DOC, or TXT files up to 10MB
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;