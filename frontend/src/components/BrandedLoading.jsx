import React from 'react';

const BrandedLoading = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <img 
          src="/plagiasure.png" 
          alt="PlagiaSure Logo" 
          className={`${sizeClasses[size]} animate-pulse`}
        />
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
      </div>
      <div className="text-center">
        <p className={`${textSizeClasses[size]} font-medium text-gray-900`}>
          {message}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          PlagiaSure AI & Plagiarism Detection
        </p>
      </div>
    </div>
  );
};

export default BrandedLoading;