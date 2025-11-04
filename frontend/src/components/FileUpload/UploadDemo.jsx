import React, { useState } from 'react';
import { FileUploadModal, DropZone, CloudIntegration } from './index';
import { Upload, Eye, Code } from 'lucide-react';

const UploadDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (formData) => {
    setUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setUploading(false);
    setShowModal(false);
    console.log('Upload completed:', formData);
  };

  const handleFileSelect = (files) => {
    setSelectedFiles(Array.isArray(files) ? files : [files]);
  };

  const handleCloudSelect = (provider) => {
    console.log('Cloud provider selected:', provider);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient-primary mb-4">
            File Upload Components
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern, beautiful file upload components with drag-and-drop functionality, 
            cloud integration, and seamless user experience.
          </p>
        </div>

        {/* Demo Sections */}
        <div className="space-y-12">
          {/* Full Upload Modal Demo */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-[#3282B8] bg-opacity-10 rounded-lg">
                <Upload className="h-6 w-6 text-[#3282B8]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Complete Upload Modal</h2>
                <p className="text-gray-600">Full-featured modal with form fields and file upload</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>Open Upload Modal</span>
            </button>
          </section>

          {/* Standalone DropZone Demo */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-[#52DE97] bg-opacity-10 rounded-lg">
                <Eye className="h-6 w-6 text-[#52DE97]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Standalone Drop Zone</h2>
                <p className="text-gray-600">Reusable drag-and-drop component</p>
              </div>
            </div>
            
            <DropZone
              onFileSelect={handleFileSelect}
              acceptedTypes={['.pdf', '.docx', '.doc', '.txt']}
              maxSize={10 * 1024 * 1024}
              multiple={true}
            />
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Selected {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </section>

          {/* Cloud Integration Demo */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-[#2D4B7C] bg-opacity-10 rounded-lg">
                <Code className="h-6 w-6 text-[#2D4B7C]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cloud Integration</h2>
                <p className="text-gray-600">Future cloud storage integration options</p>
              </div>
            </div>
            
            <CloudIntegration onCloudSelect={handleCloudSelect} />
          </section>

          {/* Features List */}
          <section className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">User Experience</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Drag and drop file upload</li>
                  <li>• Visual feedback for all interactions</li>
                  <li>• Smooth animations and transitions</li>
                  <li>• Mobile-friendly responsive design</li>
                  <li>• Accessibility support</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Technical Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• File type validation</li>
                  <li>• File size limits (10MB)</li>
                  <li>• Multiple file support</li>
                  <li>• Error handling</li>
                  <li>• Loading states</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </div>
  );
};

export default UploadDemo;