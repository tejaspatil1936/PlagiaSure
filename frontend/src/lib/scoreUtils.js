// Utility functions for handling plagiarism and AI scores

/**
 * Normalizes a score to ensure it's a valid number between 0 and 1
 * @param {number|null|undefined} score - The raw score
 * @returns {number} - Normalized score between 0 and 1
 */
export const normalizeScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return 0;
  }
  
  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, Number(score)));
};

/**
 * Formats a score as a percentage string
 * @param {number|null|undefined} score - The raw score
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatScoreAsPercentage = (score, decimals = 1) => {
  const normalizedScore = normalizeScore(score);
  return `${(normalizedScore * 100).toFixed(decimals)}%`;
};

/**
 * Gets risk level based on score
 * @param {number|null|undefined} score - The raw score
 * @param {string} type - Type of score ('plagiarism' or 'ai')
 * @returns {object} - Risk level object with level, color, and description
 */
export const getRiskLevel = (score, type = 'plagiarism') => {
  const normalizedScore = normalizeScore(score);
  
  if (type === 'ai') {
    if (normalizedScore > 0.7) {
      return { 
        level: 'HIGH', 
        color: 'red', 
        description: 'High probability of AI-generated content' 
      };
    }
    if (normalizedScore > 0.4) {
      return { 
        level: 'MEDIUM', 
        color: 'yellow', 
        description: 'Moderate AI detection signals' 
      };
    }
    return { 
      level: 'LOW', 
      color: 'green', 
      description: 'Low AI probability - likely human-written' 
    };
  }
  
  // Plagiarism risk levels
  if (normalizedScore > 0.5) {
    return { 
      level: 'HIGH', 
      color: 'red', 
      description: 'Significant similarity detected' 
    };
  }
  if (normalizedScore > 0.3) {
    return { 
      level: 'MEDIUM', 
      color: 'yellow', 
      description: 'Moderate similarity - review recommended' 
    };
  }
  return { 
    level: 'LOW', 
    color: 'green', 
    description: 'Low similarity - likely acceptable' 
  };
};

/**
 * Determines overall risk level from AI and plagiarism scores
 * @param {number|null|undefined} aiScore - AI detection score
 * @param {number|null|undefined} plagiarismScore - Plagiarism score
 * @returns {object} - Overall risk assessment
 */
export const getOverallRisk = (aiScore, plagiarismScore) => {
  const normalizedAI = normalizeScore(aiScore);
  const normalizedPlagiarism = normalizeScore(plagiarismScore);
  
  const maxScore = Math.max(normalizedAI, normalizedPlagiarism);
  
  if (normalizedAI > 0.7 || normalizedPlagiarism > 0.5) {
    return {
      level: 'HIGH',
      color: 'red',
      description: 'Immediate review required',
      priority: 'urgent'
    };
  }
  
  if (normalizedAI > 0.4 || normalizedPlagiarism > 0.3) {
    return {
      level: 'MEDIUM',
      color: 'yellow',
      description: 'Manual review recommended',
      priority: 'medium'
    };
  }
  
  return {
    level: 'LOW',
    color: 'green',
    description: 'No immediate concerns',
    priority: 'low'
  };
};

/**
 * Validates and cleans plagiarism highlight data
 * @param {Array} highlights - Array of plagiarism highlights
 * @returns {Array} - Cleaned highlights with normalized scores
 */
export const cleanPlagiarismHighlights = (highlights) => {
  if (!Array.isArray(highlights)) {
    return [];
  }
  
  return highlights.map((highlight, index) => ({
    ...highlight,
    score: normalizeScore(highlight.score),
    text: highlight.text || '',
    source: highlight.source || 'Unknown Source',
    title: highlight.title || 'Untitled',
    originalIndex: highlight.originalIndex !== undefined ? highlight.originalIndex : index
  }));
};

/**
 * Validates and cleans AI highlight data
 * @param {Array} highlights - Array of AI highlights
 * @returns {Array} - Cleaned highlights
 */
export const cleanAIHighlights = (highlights) => {
  if (!Array.isArray(highlights)) {
    return [];
  }
  
  return highlights.map(highlight => ({
    ...highlight,
    text: highlight.text || '',
    ai: Boolean(highlight.ai)
  }));
};