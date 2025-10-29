import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', branded = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (branded) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <img 
          src="/plagiasure.png" 
          alt="PlagiaSure" 
          className={`${sizeClasses[size]} animate-pulse`}
        />
        <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]}`}></div>
      </div>
    );
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

export default LoadingSpinner;