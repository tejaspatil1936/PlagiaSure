import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  
  let tokenData = null;
  try {
    if (token) {
      tokenData = JSON.parse(atob(token));
    }
  } catch (error) {
    // Token is not base64 encoded custom token
  }

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? '✅' : '❌'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? '✅' : '❌'}</div>
        <div>Token: {token ? '✅' : '❌'}</div>
        <div>User Data: {userData ? '✅' : '❌'}</div>
        {tokenData && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>Token User ID: {tokenData.userId?.substring(0, 8)}...</div>
            <div>Token Email: {tokenData.email}</div>
            <div>Token Expires: {new Date(tokenData.exp).toLocaleTimeString()}</div>
          </div>
        )}
        {user && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>User ID: {user.id?.substring(0, 8)}...</div>
            <div>User Email: {user.email}</div>
            <div>User Role: {user.role}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;