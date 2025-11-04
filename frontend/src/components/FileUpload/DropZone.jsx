import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  Image,
  Video,
  Music,
  Archive,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DropZone = ({
  onFileSelect,
  acceptedTypes = ['.pdf', '.docx', '.doc', '.txt'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className = '',
  disabled = false,
  children
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [disabled]);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled]);

  // Handle file selection
  const handleFiles = (fileList) => {
    const files = Array.from(fileList);
    const validFiles = [];
    let errorMessage = '';

    files.forEach(file => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!acceptedTypes.includes(fileExtension)) {
        errorMessage = `File type ${fileExtension} is not supported. Accepted types: ${acceptedTypes.join(', ')}`;
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        errorMessage = `File size must be less than ${formatFileSize(maxSize)}`;
        return;
      }

      validFiles.push(file);
    });

    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError('');
    
    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      onFileSelect?.(validFiles);
    } else {
      setSelectedFiles(validFiles);
      onFileSelect?.(validFiles[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    if (multiple) {
      onFileSelect?.(newFiles);
    } else {
      onFileSelect?.(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (file) => {
    const type = file.type;
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type === 'application/pdf') return File;
    if (type.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return FileText;
    if (type === 'text/plain' || name.endsWith('.txt')) return FileText;
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return Archive;
    
    return FileText;
  };

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
          dragActive 
            ? "border-[#3282B8] bg-blue-50 scale-105" 
            : selectedFiles.length > 0
            ? "border-[#52DE97] bg-green-50"
            : "border-gray-300 hover:border-[#3282B8] hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />
        
        {children || (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                dragActive 
                  ? "bg-[#3282B8] bg-opacity-20" 
                  : selectedFiles.length > 0
                  ? "bg-[#52DE97] bg-opacity-20"
                  : "bg-gray-100"
              )}>
                {selectedFiles.length > 0 ? (
                  <CheckCircle className="h-10 w-10 text-[#52DE97]" />
                ) : (
                  <Upload className={cn(
                    "h-10 w-10 transition-colors",
                    dragActive ? "text-[#3282B8]" : "text-gray-400"
                  )} />
                )}
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive 
                  ? "Drop your files here" 
                  : selectedFiles.length > 0
                  ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
                  : "Drag & drop your files here"
                }
              </p>
              <p className="text-gray-500 mt-1">
                or{" "}
                <span className="text-[#3282B8] font-medium cursor-pointer hover:text-[#2D4B7C]">
                  browse files
                </span>
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              {acceptedTypes.map((type, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{type.replace('.', '').toUpperCase()}</span>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-400">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <FileIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;