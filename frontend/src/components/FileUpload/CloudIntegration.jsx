import React from 'react';
import { 
  Cloud, 
  Droplets, 
  HardDrive,
  Folder,
  ExternalLink,
  Zap
} from 'lucide-react';

const CloudIntegration = ({ onCloudSelect, disabled = false }) => {
  const cloudProviders = [
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: Droplets,
      color: 'bg-blue-500',
      description: 'Import from Dropbox',
      comingSoon: true
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: HardDrive,
      color: 'bg-green-500',
      description: 'Import from Google Drive',
      comingSoon: true
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: Cloud,
      color: 'bg-blue-600',
      description: 'Import from OneDrive',
      comingSoon: true
    },
    {
      id: 'icloud',
      name: 'iCloud',
      icon: Cloud,
      color: 'bg-gray-600',
      description: 'Import from iCloud',
      comingSoon: true
    }
  ];

  const handleProviderClick = (provider) => {
    if (disabled || provider.comingSoon) return;
    onCloudSelect?.(provider);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Zap className="h-5 w-5 text-[#3282B8]" />
        <h3 className="text-sm font-semibold text-gray-700">Quick Import</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {cloudProviders.map((provider) => {
          const IconComponent = provider.icon;
          
          return (
            <button
              key={provider.id}
              onClick={() => handleProviderClick(provider)}
              disabled={disabled || provider.comingSoon}
              className={`
                relative p-4 border border-gray-200 rounded-lg text-left transition-all
                ${provider.comingSoon 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-[#3282B8] hover:bg-gray-50 cursor-pointer'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 ${provider.color} bg-opacity-10 rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${provider.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                    {provider.comingSoon && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{provider.description}</p>
                </div>
                {!provider.comingSoon && (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Cloud className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Cloud Integration Coming Soon</p>
            <p className="text-xs text-blue-700 mt-1">
              We're working on seamless integration with popular cloud storage providers. 
              For now, you can download files from your cloud storage and upload them directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudIntegration;