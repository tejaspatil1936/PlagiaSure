import React, { useState } from 'react';
import GoogleSignIn from '../components/GoogleSignIn';

const TestGoogleAuth = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSuccess = (data) => {
    console.log('Google Auth Success:', data);
    setResult(data);
    setError(null);
  };

  const handleError = (error) => {
    console.error('Google Auth Error:', error);
    setError(error);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            Google OAuth Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Configuration Status:</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                     import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' ? '✅' : '❌'}
                  </span>
                  <span>Google Client ID: {
                    import.meta.env.VITE_GOOGLE_CLIENT_ID && 
                    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here' 
                      ? 'Configured' 
                      : 'Not configured'
                  }</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">
                    {import.meta.env.VITE_API_URL ? '✅' : '❌'}
                  </span>
                  <span>API URL: {import.meta.env.VITE_API_URL || 'Not configured'}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Test Google Sign-In:</h2>
              <GoogleSignIn 
                onSuccess={handleSuccess}
                onError={handleError}
                schoolName="Test School"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-red-800 font-semibold">Error:</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-green-800 font-semibold">Success!</h3>
                <div className="text-green-700 text-sm mt-2">
                  <p><strong>User:</strong> {result.user?.name || result.user?.email}</p>
                  <p><strong>Email:</strong> {result.user?.email}</p>
                  <p><strong>School:</strong> {result.user?.school_name}</p>
                  <p><strong>New User:</strong> {result.isNewUser ? 'Yes' : 'No'}</p>
                  {result.user?.picture && (
                    <div className="mt-2">
                      <img 
                        src={result.user.picture} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
              <div className="bg-gray-100 rounded-md p-3 text-xs font-mono">
                <p>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID?.substring(0, 20)}...</p>
                <p>Environment: {import.meta.env.MODE}</p>
                <p>API URL: {import.meta.env.VITE_API_URL}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestGoogleAuth;