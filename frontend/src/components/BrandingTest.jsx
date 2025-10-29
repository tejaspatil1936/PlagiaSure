import React from 'react';
import BrandedLoading from './BrandedLoading';
import LoadingSpinner from './LoadingSpinner';
import Footer from './Footer';

const BrandingTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">PlagiaSure Branding Test</h1>
        
        {/* Logo Display */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Logo Display</h2>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <img src="/plagiasure.png" alt="PlagiaSure Logo" className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Small (32px)</p>
            </div>
            <div className="text-center">
              <img src="/plagiasure.png" alt="PlagiaSure Logo" className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Medium (48px)</p>
            </div>
            <div className="text-center">
              <img src="/plagiasure.png" alt="PlagiaSure Logo" className="h-16 w-16 mx-auto mb-2" />
              <p className="text-sm">Large (64px)</p>
            </div>
          </div>
        </div>

        {/* Favicon Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Favicon Test</h2>
          <p className="text-gray-600">Check the browser tab for the PlagiaSure favicon (plagiasure.ico)</p>
          <p className="text-sm text-gray-500 mt-2">The page title should show: "PlagiaSure - AI & Plagiarism Detection"</p>
        </div>

        {/* Branded Loading Components */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Loading Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded">
              <h3 className="font-medium mb-4">Branded Loading</h3>
              <BrandedLoading message="Processing analysis..." size="md" />
            </div>
            <div className="text-center p-4 border border-gray-200 rounded">
              <h3 className="font-medium mb-4">Branded Spinner</h3>
              <div className="flex justify-center">
                <LoadingSpinner size="md" branded={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="h-16 w-full bg-indigo-600 rounded mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">indigo-600</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-full bg-indigo-700 rounded mb-2"></div>
              <p className="text-sm font-medium">Primary Dark</p>
              <p className="text-xs text-gray-500">indigo-700</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-full bg-gray-900 rounded mb-2"></div>
              <p className="text-sm font-medium">Text</p>
              <p className="text-xs text-gray-500">gray-900</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-full bg-gray-50 rounded mb-2 border"></div>
              <p className="text-sm font-medium">Background</p>
              <p className="text-xs text-gray-500">gray-50</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Typography</h2>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PlagiaSure</h1>
              <p className="text-gray-600">Main heading (text-3xl font-bold)</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Advanced AI & Plagiarism Detection</h2>
              <p className="text-gray-600">Subheading (text-xl font-semibold)</p>
            </div>
            <div>
              <p className="text-base text-gray-700">Comprehensive academic integrity solution for educational institutions.</p>
              <p className="text-gray-600">Body text (text-base)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Powered by advanced AI and multiple free APIs</p>
              <p className="text-gray-600">Small text (text-sm text-gray-500)</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Test */}
      <Footer />
    </div>
  );
};

export default BrandingTest;