import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  ExternalLink,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { cn } from '../lib/utils';

const CitationHelper = ({ source, title, matchedText }) => {
  const [copiedFormat, setCopiedFormat] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');

  const copyToClipboard = async (text, format) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(''), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const generateCitation = (style) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    try {
      const url = new URL(source);
      const domain = url.hostname.replace('www.', '');
      const siteName = domain.charAt(0).toUpperCase() + domain.slice(1);

      switch (style) {
        case 'APA':
          return `${siteName}. (n.d.). ${title || 'Web page'}. Retrieved ${currentDate}, from ${source}`;
        
        case 'MLA':
          return `"${title || 'Web Page'}." ${siteName}, ${source}. Accessed ${currentDate}.`;
        
        case 'Chicago':
          return `${siteName}. "${title || 'Web Page'}." Accessed ${currentDate}. ${source}.`;
        
        case 'Harvard':
          return `${siteName} (n.d.) ${title || 'Web page'}. Available at: ${source} (Accessed: ${currentDate}).`;
        
        default:
          return source;
      }
    } catch {
      // If not a valid URL, treat as academic source
      switch (style) {
        case 'APA':
          return `Author, A. A. (Year). ${title || 'Title of work'}. Publisher.`;
        
        case 'MLA':
          return `Author, First Name. "${title || 'Title of Work'}." Publication, Date.`;
        
        case 'Chicago':
          return `Author, First Name. "${title || 'Title of Work'}." Publication, Date.`;
        
        case 'Harvard':
          return `Author, A.A. (Year) '${title || 'Title of work'}', Publication.`;
        
        default:
          return source;
      }
    }
  };

  const getQuoteFormat = (style) => {
    const citation = generateCitation(style);
    
    switch (style) {
      case 'APA':
        return `"${matchedText}" (${citation})`;
      
      case 'MLA':
        return `"${matchedText}" (${citation})`;
      
      case 'Chicago':
        return `"${matchedText}"¹\n\n¹ ${citation}`;
      
      case 'Harvard':
        return `"${matchedText}" (${citation})`;
      
      default:
        return `"${matchedText}" - ${citation}`;
    }
  };

  const citationStyles = ['APA', 'MLA', 'Chicago', 'Harvard'];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Citation Helper
        </h4>
        <div className="flex items-center space-x-2">
          {citationStyles.map((style) => (
            <button
              key={style}
              onClick={() => setCitationStyle(style)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded transition-colors",
                citationStyle === style
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Source Information */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="flex items-start space-x-2">
          <Building className="h-4 w-4 text-gray-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {title || 'Source Title'}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {source}
            </div>
          </div>
          {(() => {
            try {
              new URL(source);
              return (
                <a
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              );
            } catch {
              return null;
            }
          })()}
        </div>
      </div>

      {/* Citation Formats */}
      <div className="space-y-3">
        {/* Full Citation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-700">
              Full Citation ({citationStyle})
            </label>
            <button
              onClick={() => copyToClipboard(generateCitation(citationStyle), 'citation')}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              {copiedFormat === 'citation' ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 font-mono">
            {generateCitation(citationStyle)}
          </div>
        </div>

        {/* In-text Citation with Quote */}
        {matchedText && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700">
                Quoted Text with Citation
              </label>
              <button
                onClick={() => copyToClipboard(getQuoteFormat(citationStyle), 'quote')}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                {copiedFormat === 'quote' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 font-mono whitespace-pre-line">
              {getQuoteFormat(citationStyle)}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="text-xs font-medium text-blue-900 mb-1">💡 Citation Tips</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Always verify author and publication details</li>
          <li>• Include page numbers for direct quotes when available</li>
          <li>• Check your institution's preferred citation style</li>
          <li>• Consider paraphrasing instead of direct quotes when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default CitationHelper;