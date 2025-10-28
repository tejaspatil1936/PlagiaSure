import React, { useState } from 'react';
import { 
  ExternalLink, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Eye,
  BookOpen,
  Globe,
  University
} from 'lucide-react';
import { cn } from '../lib/utils';
import { normalizeScore, formatScoreAsPercentage, cleanPlagiarismHighlights } from '../lib/scoreUtils';

const EnhancedPlagiarismResults = ({ plagiarismHighlight, onIgnoreMatch, onShowCitation }) => {
  const [expandedMatches, setExpandedMatches] = useState(new Set());
  const [copiedText, setCopiedText] = useState('');
  
  // Clean and normalize the plagiarism highlights
  const cleanedHighlights = cleanPlagiarismHighlights(plagiarismHighlight);

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMatches(newExpanded);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getSourceIcon = (source) => {
    if (source.includes('edu') || source.includes('university') || source.includes('academic')) {
      return <University className="h-4 w-4" />;
    }
    if (source.includes('wikipedia') || source.includes('wiki')) {
      return <BookOpen className="h-4 w-4" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const getSourceType = (source) => {
    if (source.includes('edu') || source.includes('university') || source.includes('academic')) {
      return 'Academic Source';
    }
    if (source.includes('wikipedia') || source.includes('wiki')) {
      return 'Wikipedia';
    }
    if (source.includes('researchgate') || source.includes('scholar.google')) {
      return 'Research Database';
    }
    return 'Web Source';
  };

  const getRiskLevel = (score) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore > 0.8) return { level: 'Critical', color: 'red', bgColor: 'red-50' };
    if (normalizedScore > 0.6) return { level: 'High', color: 'orange', bgColor: 'orange-50' };
    if (normalizedScore > 0.4) return { level: 'Medium', color: 'yellow', bgColor: 'yellow-50' };
    return { level: 'Low', color: 'blue', bgColor: 'blue-50' };
  };

  const getRecommendation = (score, sourceType) => {
    const normalizedScore = normalizeScore(score);
    if (normalizedScore > 0.8) {
      return "Immediate attention required. This appears to be direct copying.";
    }
    if (normalizedScore > 0.6) {
      return sourceType === 'Academic Source' 
        ? "Consider proper citation or paraphrasing. May be acceptable with attribution."
        : "Significant similarity detected. Review for proper attribution.";
    }
    if (normalizedScore > 0.4) {
      return "Moderate similarity. Check if this is common knowledge or requires citation.";
    }
    return "Low similarity. Likely acceptable or common phrasing.";
  };

  // Group matches by source using cleaned highlights
  const groupedMatches = cleanedHighlights.reduce((acc, match) => {
    const source = match.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(groupedMatches).length}
            </div>
            <div className="text-sm text-blue-700">Unique Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {cleanedHighlights.filter(h => h.score > 0.6).length}
            </div>
            <div className="text-sm text-orange-700">High Risk Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {cleanedHighlights.filter(h => h.score > 0.4 && h.score <= 0.6).length}
            </div>
            <div className="text-sm text-yellow-700">Medium Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cleanedHighlights.filter(h => h.score <= 0.4).length}
            </div>
            <div className="text-sm text-green-700">Low Risk</div>
          </div>
        </div>
      </div>

      {/* Sources with Matches */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Sources with Content Matches
        </h3>
        
        {Object.entries(groupedMatches)
          .sort(([,a], [,b]) => Math.max(...b.map(m => m.score)) - Math.max(...a.map(m => m.score)))
          .map(([source, matches]) => {
            const maxScore = Math.max(...matches.map(m => m.score));
            const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
            const risk = getRiskLevel(maxScore);
            const sourceType = getSourceType(source);
            
            return (
              <div key={source} className={cn(
                "border rounded-lg overflow-hidden transition-all duration-200",
                `border-${risk.color}-200 bg-${risk.bgColor}`
              )}>
                {/* Source Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        `bg-${risk.color}-100 text-${risk.color}-600`
                      )}>
                        {getSourceIcon(source)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {matches[0].title || sourceType}
                          </h4>
                          <span className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            `bg-${risk.color}-100 text-${risk.color}-700`
                          )}>
                            {risk.level} Risk
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            {getSourceIcon(source)}
                            <span className="ml-1">{sourceType}</span>
                          </span>
                          {(() => {
                            try {
                              const url = new URL(source);
                              return (
                                <a 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {url.hostname}
                                </a>
                              );
                            } catch {
                              return <span className="text-gray-500">{source}</span>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-bold",
                          `text-${risk.color}-600`
                        )}>
                          {formatScoreAsPercentage(maxScore)}
                        </div>
                        <div className="text-xs text-gray-500">Max similarity</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommendation */}
                  <div className={cn(
                    "mt-3 p-3 rounded-lg border-l-4",
                    `border-${risk.color}-400 bg-${risk.color}-50`
                  )}>
                    <div className="flex items-start">
                      <AlertTriangle className={cn("h-4 w-4 mt-0.5 mr-2", `text-${risk.color}-500`)} />
                      <div>
                        <p className={cn("text-sm font-medium", `text-${risk.color}-800`)}>
                          Recommendation
                        </p>
                        <p className={cn("text-sm mt-1", `text-${risk.color}-700`)}>
                          {getRecommendation(maxScore, sourceType)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Matches */}
                <div className="divide-y divide-gray-200">
                  {matches
                    .sort((a, b) => b.score - a.score)
                    .map((match, matchIndex) => {
                      const isExpanded = expandedMatches.has(match.originalIndex);
                      const matchRisk = getRiskLevel(match.score);
                      
                      return (
                        <div key={matchIndex} className="bg-white">
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={cn(
                                    "px-2 py-1 text-xs font-medium rounded",
                                    `bg-${matchRisk.color}-100 text-${matchRisk.color}-700`
                                  )}>
                                    {formatScoreAsPercentage(match.score)} Match
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Match #{matchIndex + 1}
                                  </span>
                                </div>
                                
                                {/* Matched Text Preview */}
                                <div className="relative">
                                  <p className={cn(
                                    "text-sm leading-relaxed p-3 rounded-lg border-l-4",
                                    `border-${matchRisk.color}-400 bg-${matchRisk.color}-50`,
                                    isExpanded ? '' : 'line-clamp-2'
                                  )}>
                                    <span className="font-medium">"{match.text}"</span>
                                  </p>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => toggleExpanded(match.originalIndex)}
                                      className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="h-3 w-3 mr-1" />
                                          Show Less
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-3 w-3 mr-1" />
                                          Show More
                                        </>
                                      )}
                                    </button>
                                    
                                    <button
                                      onClick={() => copyToClipboard(match.text)}
                                      className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      {copiedText === match.text ? 'Copied!' : 'Copy'}
                                    </button>
                                    
                                    {onIgnoreMatch && (
                                      <button
                                        onClick={() => onIgnoreMatch(match.originalIndex)}
                                        className="flex items-center text-xs text-gray-600 hover:text-gray-800"
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Ignore
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => onShowCitation && onShowCitation(match)}
                                      className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      Cite
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-900 mb-2">Analysis Details</h5>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <div>Similarity Score: {formatScoreAsPercentage(match.score, 2)}</div>
                                      <div>Risk Level: {matchRisk.level}</div>
                                      <div>Word Count: {match.text.split(' ').length} words</div>
                                      {match.reason && <div>Detection Reason: {match.reason}</div>}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-900 mb-2">Suggested Actions</h5>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      {match.score > 0.8 && (
                                        <div className="flex items-center text-red-600">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Requires immediate review
                                        </div>
                                      )}
                                      {match.score > 0.6 && (
                                        <div className="flex items-center text-orange-600">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Add proper citation
                                        </div>
                                      )}
                                      {match.score > 0.4 && (
                                        <div className="flex items-center text-yellow-600">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Consider paraphrasing
                                        </div>
                                      )}
                                      <div className="flex items-center text-blue-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verify if common knowledge
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default EnhancedPlagiarismResults;