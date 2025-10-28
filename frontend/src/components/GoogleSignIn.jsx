import React, { useEffect, useRef, useState } from 'react';
import { authAPI } from '../services/api';
import SchoolNameModal from './SchoolNameModal';

const GoogleSignIn = ({ onSuccess, onError, schoolName = '' }) => {
  const googleButtonRef = useRef(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Check if Google Client ID is configured
    if (!clientId || clientId === 'your_google_client_id_here') {
      console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = `
          <div class="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-center text-sm text-gray-500">
            Google Sign-In not configured.<br>
            <span class="text-xs">Please set up Google OAuth credentials.</span>
          </div>
        `;
      }
      return;
    }

    if (window.google && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Get the container width to make button responsive
        const containerWidth = googleButtonRef.current.offsetWidth;
        const buttonWidth = Math.min(400, containerWidth - 20); // Max 400px, with 20px margin

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonWidth,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = `
            <div class="w-full p-3 border border-red-300 rounded-md bg-red-50 text-center text-sm text-red-600">
              Google Sign-In initialization failed.<br>
              <span class="text-xs">Check console for details.</span>
            </div>
          `;
        }
      }
    }
  };

  const handleCredentialResponse = async (response) => {
    console.log('🔐 Google credential received, calling backend...');
    try {
      const result = await authAPI.googleAuth({
        credential: response.credential,
        schoolName: '', // Don't pass school name from signup form
      });

      console.log('🎉 Backend response:', result.data);

      if (result.data.token) {
        console.log('💾 Storing token and user data...');
        // Store the token
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        
        console.log('✅ Token stored:', result.data.token.substring(0, 50) + '...');
        console.log('✅ User data stored:', result.data.user.email);
        
        // IMMEDIATELY call onSuccess to update AuthContext
        console.log('🔄 Calling onSuccess to update AuthContext...');
        if (onSuccess) {
          onSuccess(result.data);
        }
        
        // Check if this is a new user and no school name is set
        if (result.data.isNewUser && !result.data.user.school_name) {
          console.log('👤 New user detected, showing school modal');
          // Show school name modal for new Google users
          setPendingUserData(result.data);
          setShowSchoolModal(true);
        } else {
          console.log('👤 Existing user or school name set, proceeding...');
        }
      } else {
        console.error('❌ No token in response:', result.data);
        if (onError) {
          onError('No authentication token received');
        }
      }
    } catch (error) {
      console.error('❌ Google Sign-In API error:', error);
      console.error('❌ Error response:', error.response?.data);
      if (onError) {
        onError(error.response?.data?.error || 'Google Sign-In failed');
      }
    }
  };

  const handleSchoolNameSubmit = async (schoolName) => {
    try {
      if (schoolName) {
        // Update school name
        await authAPI.updateSchool(schoolName);
        
        // Update stored user data
        const updatedUser = { ...pendingUserData.user, school_name: schoolName };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Update pending data
        setPendingUserData({
          ...pendingUserData,
          user: updatedUser
        });
      }
      
      // Close modal and proceed
      setShowSchoolModal(false);
      
      if (onSuccess && pendingUserData) {
        onSuccess(pendingUserData);
      }
      
      // Clear pending data
      setPendingUserData(null);
    } catch (error) {
      console.error('School name update error:', error);
      throw new Error('Failed to update school information');
    }
  };

  const handleModalClose = () => {
    // User closed modal without completing - still proceed
    setShowSchoolModal(false);
    
    if (onSuccess && pendingUserData) {
      onSuccess(pendingUserData);
    }
    
    setPendingUserData(null);
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div ref={googleButtonRef} className="w-full max-w-sm"></div>
      </div>
      
      <SchoolNameModal
        isOpen={showSchoolModal}
        onClose={handleModalClose}
        onSubmit={handleSchoolNameSubmit}
        userEmail={pendingUserData?.user?.email}
      />
    </>
  );
};

export default GoogleSignIn;