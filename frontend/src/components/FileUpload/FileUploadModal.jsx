import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  File,
  FileText,
  FilePlus,
  CheckCircle,
  AlertCircle,
  Cloud,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";

const FileUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  uploading = false,
  error = null,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    studentName: "",
    courseName: "",
    assignmentTitle: "",
  });

  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  }, []);

  // Handle file selection
  const handleFileSelection = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF, DOCX, DOC, or TXT file.");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !selectedFile ||
      !formData.studentName ||
      !formData.courseName ||
      !formData.assignmentTitle
    ) {
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("assignment", selectedFile);
    uploadFormData.append("studentName", formData.studentName);
    uploadFormData.append("courseName", formData.courseName);
    uploadFormData.append("assignmentTitle", formData.assignmentTitle);

    onUpload(uploadFormData);
  };

  // Reset form
  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      studentName: "",
      courseName: "",
      assignmentTitle: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (!file) return FileText;

    const type = file.type;
    if (type === "application/pdf") return File;
    if (type.includes("word")) return FileText;
    if (type === "text/plain") return FileText;
    return FilePlus;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-50 flex items-center justify-center z-50 p-4 animate-slideDown">
      <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="relative p-6 rounded-t-2xl overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D4B7C] via-[#3282B8] to-[#3AB795] opacity-90"></div>

          {/* Floating elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full blur-2xl -translate-y-20 translate-x-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#52DE97] to-transparent opacity-20 rounded-full blur-xl translate-y-16 -translate-x-16 animate-float"></div>
          <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-white opacity-30 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/2 w-4 h-4 bg-[#52DE97] opacity-40 rounded-full animate-bounce"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm border border-white border-opacity-30 shadow-lg">
                  <Cloud className="h-7 w-7 text-white drop-shadow-sm" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#52DE97] rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                  Upload Assignment
                </h2>
                <p className="text-white text-opacity-90 text-sm font-medium">
                  Upload your document for plagiarism analysis
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="group p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm border border-white border-opacity-20"
            >
              <X className="h-5 w-5 text-white group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 bg-gradient-to-b from-white to-gray-50"
        >
          {/* File Upload Area */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Document File
            </label>

            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 group",
                dragActive
                  ? "border-[#3282B8] bg-gradient-to-br from-blue-50 to-blue-100 scale-105 shadow-lg"
                  : selectedFile
                  ? "border-[#52DE97] bg-gradient-to-br from-green-50 to-green-100 shadow-md"
                  : "border-gray-300 hover:border-[#3282B8] hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".pdf,.docx,.doc,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="p-3 bg-[#52DE97] bg-opacity-20 rounded-full">
                      <CheckCircle className="h-8 w-8 text-[#52DE97]" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-[#3282B8] hover:text-[#2D4B7C] font-medium"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <div
                      className={cn(
                        "p-4 rounded-full transition-all duration-300 group-hover:scale-110",
                        dragActive
                          ? "bg-[#3282B8] bg-opacity-20 animate-pulse"
                          : "bg-gray-100 group-hover:bg-[#3282B8] group-hover:bg-opacity-10"
                      )}
                    >
                      <Upload
                        className={cn(
                          "h-10 w-10 transition-all duration-300",
                          dragActive
                            ? "text-[#3282B8] animate-bounce"
                            : "text-gray-400 group-hover:text-[#3282B8]"
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {dragActive
                        ? "Drop your file here"
                        : "Drag & drop your file here"}
                    </p>
                    <p className="text-gray-500 mt-1">
                      or{" "}
                      <span className="text-[#3282B8] font-medium cursor-pointer hover:text-[#2D4B7C]">
                        browse files
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <File className="h-4 w-4" />
                      <span>PDF</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>DOCX</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>DOC</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>TXT</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) =>
                  setFormData({ ...formData, studentName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3282B8] focus:border-transparent transition-all"
                placeholder="Enter student name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                required
                value={formData.courseName}
                onChange={(e) =>
                  setFormData({ ...formData, courseName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3282B8] focus:border-transparent transition-all"
                placeholder="Enter course name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              required
              value={formData.assignmentTitle}
              onChange={(e) =>
                setFormData({ ...formData, assignmentTitle: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3282B8] focus:border-transparent transition-all"
              placeholder="Enter assignment title"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 bg-gray-50 bg-opacity-50 -mx-6 px-6 pb-6 rounded-b-2xl">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                uploading ||
                !selectedFile ||
                !formData.studentName ||
                !formData.courseName ||
                !formData.assignmentTitle
              }
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-secondary hover:opacity-90 hover:scale-105 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;
