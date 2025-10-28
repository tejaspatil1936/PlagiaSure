import React, { useState } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';

const SchoolNameModal = ({ isOpen, onClose, onSubmit, userEmail }) => {
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!schoolName.trim()) {
      setError('School/Institution name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(schoolName.trim());
    } catch (err) {
      setError(err.message || 'Failed to update school information');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onSubmit(''); // Submit with empty school name
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Complete Your Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Welcome <strong>{userEmail}</strong>! To complete your account setup, 
              please provide your school or institution name.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
              School/Institution Name
            </label>
            <input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => {
                setSchoolName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your school or institution name"
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </div>
              ) : (
                'Continue'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
        </form>

        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500">
            You can update this information later in your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolNameModal;