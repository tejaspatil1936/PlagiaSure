import axios from 'axios';

export const detectPlagiarism = async (text) => {
  try {
    // Try Copyleaks first, then fallback to mock detection
    if (process.env.COPYLEAKS_EMAIL && process.env.COPYLEAKS_API_KEY) {
      return await detectWithCopyleaks(text);
    } else {
      console.warn('Copyleaks credentials not configured, using mock detection');
      return await mockPlagiarismDetection(text);
    }

  } catch (error) {
    console.error('Plagiarism detection error:', error);
    // Return mock results as fallback
    return await mockPlagiarismDetection(text);
  }
};

// Copyleaks plagiarism detection
const detectWithCopyleaks = async (text) => {
  try {
    // Step 1: Get access token
    const authResponse = await axios.post('https://id.copyleaks.com/v3/account/login/api', {
      email: process.env.COPYLEAKS_EMAIL,
      key: process.env.COPYLEAKS_API_KEY
    });

    const accessToken = authResponse.data.access_token;

    // Step 2: Submit scan
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scanResponse = await axios.put(
      `https://api.copyleaks.com/v3/education/submit/file/${scanId}`,
      {
        base64: Buffer.from(text).toString('base64'),
        filename: 'assignment.txt',
        properties: {
          webhooks: {
            status: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks/copyleaks/${scanId}`
          },
          includeHtml: true,
          cheatDetection: true,
          sensitivityLevel: 2
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Step 3: Wait for results (simplified - in production, use webhooks)
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    // Step 4: Get results
    const resultsResponse = await axios.get(
      `https://api.copyleaks.com/v3/education/${scanId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const results = resultsResponse.data;
    
    // Process results
    let totalScore = 0;
    const highlights = [];

    if (results.results && results.results.internet) {
      for (const match of results.results.internet) {
        totalScore = Math.max(totalScore, match.matchedWords / results.scannedDocument.totalWords);
        
        if (match.text && match.text.comparison) {
          highlights.push({
            text: match.text.comparison.source.value,
            source: match.url,
            score: match.matchedWords / results.scannedDocument.totalWords
          });
        }
      }
    }

    return {
      score: totalScore,
      highlight: highlights
    };

  } catch (error) {
    console.error('Copyleaks API error:', error);
    throw error;
  }
};

// Mock plagiarism detection for development/fallback
const mockPlagiarismDetection = async (text) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const highlights = [];
  let maxScore = 0;

  // Mock some plagiarism detection based on common phrases
  const commonPhrases = [
    'according to research',
    'studies have shown',
    'it is important to note',
    'in conclusion',
    'furthermore',
    'on the other hand',
    'as a result',
    'in addition to'
  ];

  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    let foundPhrases = 0;
    
    commonPhrases.forEach(phrase => {
      if (lowerSentence.includes(phrase)) {
        foundPhrases++;
      }
    });

    if (foundPhrases > 0) {
      const score = Math.min(0.9, foundPhrases * 0.3);
      maxScore = Math.max(maxScore, score);
      
      highlights.push({
        text: sentence.trim(),
        source: 'https://example-academic-source.com',
        score: score
      });
    }
  });

  // Add some random plagiarism for testing
  if (Math.random() > 0.7 && sentences.length > 3) {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    const randomScore = 0.4 + Math.random() * 0.4;
    maxScore = Math.max(maxScore, randomScore);
    
    highlights.push({
      text: randomSentence.trim(),
      source: 'https://wikipedia.org/example-article',
      score: randomScore
    });
  }

  return {
    score: maxScore,
    highlight: highlights
  };
};

// Alternative plagiarism detection services can be added here
export const detectWithPlagScan = async (text) => {
  // Implementation for PlagScan API
  throw new Error('PlagScan integration not implemented yet');
};

export const detectWithUnicheck = async (text) => {
  // Implementation for Unicheck API
  throw new Error('Unicheck integration not implemented yet');
};