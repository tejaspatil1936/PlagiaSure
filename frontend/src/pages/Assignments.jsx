import React, { useState, useEffect } from "react";
import { assignmentsAPI } from "../services/api";
// Force rebuild to fix Upload import issue
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react";
import { formatDate, formatFileSize, cn } from "../lib/utils";
import FileUploadModal from "../components/FileUpload/FileUploadModal";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    setUploading(true);
    setError("");

    try {
      await assignmentsAPI.upload(formData);

      // Close modal and reload assignments
      setShowUploadModal(false);
      loadAssignments();
    } catch (error) {
      console.error("Upload failed:", error);
      setError(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await assignmentsAPI.delete(id);
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      setError("Failed to delete assignment");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "processing":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        );
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "uploaded":
        return "Uploaded";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
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
    <div className="space-y-8 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#3AB795] via-[#52DE97] to-[#3282B8] rounded-2xl p-8 shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2D4B7C] rounded-full blur-2xl translate-y-16 -translate-x-16 animate-float"></div>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-white bg-opacity-90 rounded-2xl backdrop-blur-sm border border-white border-opacity-50 shadow-lg">
              <Upload className="h-8 w-8 text-[#3AB795] drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                Assignments
              </h1>
              <p className="mt-2 text-white text-opacity-90 text-lg font-medium">
                Upload and manage assignment files for AI & plagiarism detection
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center bg-white bg-opacity-90 hover:bg-opacity-100 backdrop-blur-sm border border-white border-opacity-50 text-[#2D4B7C] hover:text-[#1A365D] font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-3" />
            Upload Assignment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="relative">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#3282B8] to-[#52DE97] rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-bold text-gray-900">
            No assignments yet
          </h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Get started by uploading your first assignment for AI and plagiarism
            analysis.
          </p>
          <div className="mt-8">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center bg-gradient-to-r from-[#3282B8] to-[#52DE97] text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-3" />
              Upload Your First Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="divide-y divide-gray-100">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-br from-[#3282B8] to-[#52DE97] rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <button
                          onClick={() => {
                            const supabaseUrl =
                              import.meta.env.VITE_SUPABASE_URL ||
                              "https://gfvnmrcxnzauxkiqjmbq.supabase.co";
                            const bucketName = "Data";
                            const encodedFilePath = assignment.file_path
                              .split("/")
                              .map(encodeURIComponent)
                              .join("/");
                            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${encodedFilePath}`;
                            window.open(publicUrl, "_blank");
                          }}
                          className="group/link inline-flex items-center text-lg font-bold text-gray-900 hover:text-[#3282B8] transition-colors duration-200"
                          title={`Open ${assignment.file_name}`}
                        >
                          {assignment.assignment_title}
                          <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                        </button>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          <span className="text-[#3282B8]">Student:</span>{" "}
                          {assignment.student_name} •
                          <span className="text-[#3AB795] ml-1">Course:</span>{" "}
                          {assignment.course_name}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            {assignment.file_name}
                          </span>
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {formatFileSize(assignment.file_size)}
                          </span>
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                            {formatDate(assignment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 ml-6">
                    <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2">
                      {getStatusIcon(assignment.status)}
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {getStatusText(assignment.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      {assignment.reports && assignment.reports.length > 0 && (
                        <button
                          onClick={() =>
                            (window.location.href = `/reports/${assignment.reports[0].id}`)
                          }
                          className="p-2 text-[#3282B8] hover:text-white hover:bg-[#3282B8] rounded-xl transition-all duration-200 hover:scale-110"
                          title="View Report"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Delete Assignment"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
        error={error}
      />
    </div>
  );
};

export default Assignments;
