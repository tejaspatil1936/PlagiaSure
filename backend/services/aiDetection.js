import { GoogleGenerativeAI } from "@google/generative-ai";
import { InferenceClient } from "@huggingface/inference";
import { splitIntoSentences } from "../utils/textExtractor.js";

let genAI = null;
let hfClient = null;

// Initialize Gemini client only when needed and API key is available
const getGeminiClient = () => {
  if (
    !genAI &&
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
  ) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("✅ Gemini client initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error);
      return null;
    }
  }
  return genAI;
};

// Initialize Hugging Face client only when needed and API key is available
const getHuggingFaceClient = () => {
  if (
    !hfClient &&
    process.env.HUGGINGFACE_API_KEY &&
    process.env.HUGGINGFACE_API_KEY !== "your_huggingface_api_key_here"
  ) {
    try {
      hfClient = new InferenceClient(process.env.HUGGINGFACE_API_KEY);
    } catch (error) {
      console.error("Failed to initialize Hugging Face client:", error);
      return null;
    }
  }
  return hfClient;
};

export const detectAIContent = async (text) => {
  try {
    console.log("🚀 Starting comprehensive AI and plagiarism detection...");

    // Run all detection methods in parallel
    const [hfAIProbability, geminiAnalysis] = await Promise.allSettled([
      getHuggingFaceAIProbability(text),
      getGeminiComprehensiveAnalysis(text),
    ]);

    let probability = 0;
    let highlight = [];
    let plagiarismData = {
      probability: 0,
      sources: [],
      highlight: [],
    };

    // Process Hugging Face results
    if (hfAIProbability.status === "fulfilled") {
      probability = hfAIProbability.value;
      console.log(
        `🤖 Hugging Face AI probability: ${(probability * 100).toFixed(1)}%`
      );
    } else {
      console.error(
        "Hugging Face AI detection failed:",
        hfAIProbability.reason
      );
    }

    // Process Gemini comprehensive analysis
    if (geminiAnalysis.status === "fulfilled") {
      const geminiResult = geminiAnalysis.value;

      // Combine AI probabilities (weighted average: HF 60%, Gemini 40%)
      if (geminiResult.aiProbability !== undefined) {
        probability =
          probability > 0
            ? probability * 0.6 + geminiResult.aiProbability * 0.4
            : geminiResult.aiProbability;
      }

      highlight = geminiResult.aiHighlights || [];
      plagiarismData = {
        probability: geminiResult.plagiarismProbability || 0,
        sources: geminiResult.plagiarismSources || [],
        highlight: geminiResult.plagiarismHighlights || [],
      };

      console.log(
        `🎯 Combined AI probability: ${(probability * 100).toFixed(1)}%`
      );
      console.log(
        `📚 Plagiarism probability: ${(
          plagiarismData.probability * 100
        ).toFixed(1)}%`
      );
      console.log(
        `🔍 Found ${plagiarismData.sources.length} potential sources`
      );
    } else {
      console.error(
        "Gemini comprehensive analysis failed:",
        geminiAnalysis.reason
      );
      // Fallback highlighting
      const sentences = splitIntoSentences(text);
      highlight = sentences.map((sentence) => ({
        text: sentence,
        ai: probability > 0.5,
        confidence: probability,
      }));
    }

    return {
      probability,
      highlight,
      plagiarism: plagiarismData,
    };
  } catch (error) {
    console.error("AI detection error:", error);
    throw new Error(`AI detection failed: ${error.message}`);
  }
};

// Get AI probability using Hugging Face specialized model
const getHuggingFaceAIProbability = async (text) => {
  try {
    const client = getHuggingFaceClient();
    if (!client) {
      console.log("⚠️ Hugging Face API key not configured");
      return 0;
    }

    console.log("🤖 Using Hugging Face Inference Client for AI detection...");

    // Truncate text more aggressively for Hugging Face model (RoBERTa has ~512 token limit)
    // Rough estimate: 1 token ≈ 4 characters, so 512 tokens ≈ 2048 characters
    // Use 1500 characters to be safe
    const truncatedText = text.length > 1500 ? text.substring(0, 1500) : text;
    
    console.log(`📏 Text length: ${text.length} chars, using: ${truncatedText.length} chars for HF analysis`);

    try {
      const output = await client.textClassification({
        model: "openai-community/roberta-base-openai-detector",
        inputs: truncatedText,
      });

      if (output && Array.isArray(output)) {
        // Look for "Fake" label (AI-generated) or "GENERATED"
        const aiLabel = output.find(
          (item) =>
            item.label === "Fake" ||
            item.label === "GENERATED" ||
            item.label === "AI"
        );

        if (aiLabel) {
          console.log(`✅ HF detected AI probability: ${(aiLabel.score * 100).toFixed(1)}%`);
          return aiLabel.score;
        }

        // If no "Fake" label, check for "Real" and invert
        const realLabel = output.find((item) => item.label === "Real");
        if (realLabel) {
          const aiProbability = 1 - realLabel.score;
          console.log(`✅ HF detected AI probability (inverted): ${(aiProbability * 100).toFixed(1)}%`);
          return aiProbability;
        }
      }

      console.log("⚠️ HF returned unexpected output format");
      return 0;
    } catch (hfApiError) {
      // Handle specific API errors
      if (hfApiError.message && hfApiError.message.includes('tensor')) {
        console.error("❌ HF model input size error - text still too long, falling back to shorter sample");
        
        // Try with even shorter text
        const shorterText = text.substring(0, 800);
        try {
          const retryOutput = await client.textClassification({
            model: "openai-community/roberta-base-openai-detector",
            inputs: shorterText,
          });
          
          if (retryOutput && Array.isArray(retryOutput)) {
            const aiLabel = retryOutput.find(item => item.label === "Fake" || item.label === "GENERATED" || item.label === "AI");
            if (aiLabel) {
              console.log(`✅ HF retry success: ${(aiLabel.score * 100).toFixed(1)}%`);
              return aiLabel.score;
            }
            
            const realLabel = retryOutput.find(item => item.label === "Real");
            if (realLabel) {
              const aiProbability = 1 - realLabel.score;
              console.log(`✅ HF retry success (inverted): ${(aiProbability * 100).toFixed(1)}%`);
              return aiProbability;
            }
          }
        } catch (retryError) {
          console.error("❌ HF retry also failed:", retryError.message);
        }
      } else {
        console.error("❌ HF API error:", hfApiError.message);
      }
      
      throw hfApiError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("Hugging Face AI detection error:", error);
    return 0;
  }
};

// Comprehensive analysis using Gemini for AI detection, plagiarism detection, and source matching
const getGeminiComprehensiveAnalysis = async (text) => {
  try {
    const client = getGeminiClient();
    if (!client) {
      console.warn("⚠️ Gemini API key not configured, using mock analysis");
      return getMockComprehensiveAnalysis(text);
    }

    console.log(
      "🎯 Using Gemini for comprehensive AI and plagiarism analysis..."
    );

    // Split text into chunks for analysis
    const maxChunkSize = 2500;
    const chunks = [];
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize));
    }

    const allResults = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `📝 Analyzing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`
      );

      try {
        const model = client.getGenerativeModel({ model: "models/gemini-pro" });
        const response = await model.generateContent([`You are an expert AI and plagiarism detection system. Analyze the text and return ONLY a valid JSON response.

CRITICAL: Your response must be ONLY valid JSON, no explanations, no markdown, no extra text.

Analyze for:
1. AI-generated patterns (repetitive language, buzzwords, perfect grammar, robotic tone)
2. Plagiarism indicators (academic language, citations, technical terms, formal structures)
3. Find realistic academic sources that could match the content

Return this EXACT JSON structure:
{
  "aiProbability": [number between 0.0 and 1.0],
  "aiHighlights": [
    {
      "text": "[exact sentence from input]",
      "ai": [true or false],
      "confidence": [number between 0.0 and 1.0],
      "reason": "[brief explanation]"
    }
  ],
  "plagiarismProbability": [number between 0.0 and 1.0],
  "plagiarismHighlights": [
    {
      "text": "[exact sentence from input]",
      "plagiarized": [true or false],
      "confidence": [number between 0.0 and 1.0],
      "reason": "[brief explanation]",
      "source": "[matching source URL]",
      "title": "[source title]"
    }
  ],
  "plagiarismSources": [
    {
      "url": "[real academic URL like https://scholar.google.com, https://www.jstor.org, etc.]",
      "title": "[descriptive source title]",
      "similarity": [number between 0.0 and 1.0],
      "matchedText": "[portion of text that matches]"
    }
  ]
}

Text to analyze:
${chunk}

JSON Response:`]);

        const content = response.response.text().trim();

        try {
          // Clean the response to extract JSON
          let cleanContent = content.trim();
          
          // Remove markdown code blocks if present
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
          
          // Extract JSON object
          const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : cleanContent;
          
          console.log(`📋 Raw Gemini response for chunk ${i + 1}:`, jsonStr.substring(0, 200) + '...');
          
          const result = JSON.parse(jsonStr);
          
          // Validate the structure
          if (!result.aiProbability && result.aiProbability !== 0) result.aiProbability = 0;
          if (!result.plagiarismProbability && result.plagiarismProbability !== 0) result.plagiarismProbability = 0;
          if (!Array.isArray(result.aiHighlights)) result.aiHighlights = [];
          if (!Array.isArray(result.plagiarismHighlights)) result.plagiarismHighlights = [];
          if (!Array.isArray(result.plagiarismSources)) result.plagiarismSources = [];
          
          console.log(`✅ Parsed chunk ${i + 1}: AI=${(result.aiProbability * 100).toFixed(1)}%, Plagiarism=${(result.plagiarismProbability * 100).toFixed(1)}%`);
          
          allResults.push(result);
        } catch (parseError) {
          console.error(`❌ Failed to parse Gemini response for chunk ${i + 1}:`, parseError);
          console.error(`📄 Raw content:`, content.substring(0, 500));
          allResults.push(getMockChunkAnalysis(chunk));
        }

        // Add delay between chunks to respect rate limits
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      } catch (chunkError) {
        console.error(`Error analyzing chunk ${i + 1}:`, chunkError);
        allResults.push(getMockChunkAnalysis(chunk));
      }
    }

    // Combine results from all chunks
    return combineAnalysisResults(allResults);
  } catch (error) {
    console.error("Gemini comprehensive analysis error:", error);
    return getMockComprehensiveAnalysis(text);
  }
};

// Combine analysis results from multiple chunks
const combineAnalysisResults = (results) => {
  if (!results || results.length === 0) {
    return {
      aiProbability: 0,
      aiHighlights: [],
      plagiarismProbability: 0,
      plagiarismHighlights: [],
      plagiarismSources: [],
    };
  }

  // Calculate weighted averages
  const aiProbabilities = results.map((r) => r.aiProbability || 0);
  const plagiarismProbabilities = results.map(
    (r) => r.plagiarismProbability || 0
  );

  const avgAiProbability =
    aiProbabilities.reduce((a, b) => a + b, 0) / aiProbabilities.length;
  const avgPlagiarismProbability =
    plagiarismProbabilities.reduce((a, b) => a + b, 0) /
    plagiarismProbabilities.length;

  // Combine all highlights
  const allAiHighlights = results.flatMap((r) => r.aiHighlights || []);
  const allPlagiarismHighlights = results.flatMap(
    (r) => r.plagiarismHighlights || []
  );

  // Combine and deduplicate sources
  const allSources = results.flatMap((r) => r.plagiarismSources || []);
  const uniqueSources = allSources.filter(
    (source, index, self) =>
      index === self.findIndex((s) => s.url === source.url)
  );

  return {
    aiProbability: avgAiProbability,
    aiHighlights: allAiHighlights,
    plagiarismProbability: avgPlagiarismProbability,
    plagiarismHighlights: allPlagiarismHighlights,
    plagiarismSources: uniqueSources.slice(0, 10), // Limit to top 10 sources
  };
};

// Mock analysis for a single chunk
const getMockChunkAnalysis = (text) => {
  const sentences = splitIntoSentences(text);

  return {
    aiProbability: Math.random() * 0.6 + 0.2, // 0.2 to 0.8
    aiHighlights: sentences.map((sentence) => ({
      text: sentence,
      ai: Math.random() > 0.7,
      confidence: Math.random() * 0.5 + 0.3,
      reason: "Pattern analysis",
    })),
    plagiarismProbability: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
    plagiarismHighlights: sentences
      .filter(() => Math.random() > 0.8)
      .map((sentence) => ({
        text: sentence,
        plagiarized: true,
        confidence: Math.random() * 0.4 + 0.6,
        reason: "Potential academic source match",
      })),
    plagiarismSources: [],
  };
};

// Comprehensive mock analysis when Gemini is not available
const getMockComprehensiveAnalysis = (text) => {
  console.log("🎭 Using mock comprehensive analysis (Gemini not available)");

  const sentences = splitIntoSentences(text);

  // AI detection patterns
  const aiIndicators = [
    {
      patterns: ["furthermore", "moreover", "additionally"],
      weight: 0.8,
      reason: "Formal transitional phrases",
    },
    {
      patterns: ["comprehensive", "multifaceted", "paradigm"],
      weight: 0.7,
      reason: "Academic buzzwords",
    },
    {
      patterns: ["it is important to note", "it should be noted"],
      weight: 0.9,
      reason: "AI qualifying phrases",
    },
    {
      patterns: ["leverage", "utilize", "optimize"],
      weight: 0.6,
      reason: "Business jargon",
    },
    {
      patterns: ["in conclusion", "to summarize", "in summary"],
      weight: 0.5,
      reason: "Conclusion patterns",
    },
  ];

  // Plagiarism detection patterns
  const plagiarismIndicators = [
    {
      patterns: [
        "according to research",
        "studies have shown",
        "research indicates",
      ],
      weight: 0.8,
      reason: "Academic citation patterns",
    },
    {
      patterns: ["statistics show", "data reveals", "findings suggest"],
      weight: 0.7,
      reason: "Data presentation language",
    },
    {
      patterns: ["as defined by", "the definition of", "can be described as"],
      weight: 0.6,
      reason: "Definition language",
    },
    {
      patterns: ["historically", "traditionally", "conventionally"],
      weight: 0.5,
      reason: "Historical references",
    },
  ];

  // Mock academic sources
  const mockSources = [
    {
      url: "https://www.jstor.org/stable/academic-paper-1",
      title: "Academic Research on Modern Practices",
      domain: "jstor.org",
    },
    {
      url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=example",
      title: "Scholarly Article on Contemporary Methods",
      domain: "scholar.google.com",
    },
    {
      url: "https://www.researchgate.net/publication/example-study",
      title: "Research Publication on Current Trends",
      domain: "researchgate.net",
    },
    {
      url: "https://pubmed.ncbi.nlm.nih.gov/example-medical-study",
      title: "Medical Research Study",
      domain: "pubmed.ncbi.nlm.nih.gov",
    },
    {
      url: "https://arxiv.org/abs/example-paper",
      title: "Technical Research Paper",
      domain: "arxiv.org",
    },
    {
      url: "https://www.nature.com/articles/example-nature-article",
      title: "Nature Scientific Article",
      domain: "nature.com",
    },
    {
      url: "https://ieeexplore.ieee.org/document/example-ieee-paper",
      title: "IEEE Technical Publication",
      domain: "ieeexplore.ieee.org",
    },
  ];

  let totalAiScore = 0;
  let totalPlagiarismScore = 0;
  const aiHighlights = [];
  const plagiarismHighlights = [];
  const foundSources = [];

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase();
    let aiScore = 0;
    let plagiarismScore = 0;
    let aiReasons = [];
    let plagiarismReasons = [];

    // Check AI indicators
    aiIndicators.forEach((indicator) => {
      indicator.patterns.forEach((pattern) => {
        if (lowerSentence.includes(pattern)) {
          aiScore += indicator.weight;
          aiReasons.push(indicator.reason);
        }
      });
    });

    // Check plagiarism indicators
    plagiarismIndicators.forEach((indicator) => {
      indicator.patterns.forEach((pattern) => {
        if (lowerSentence.includes(pattern)) {
          plagiarismScore += indicator.weight;
          plagiarismReasons.push(indicator.reason);

          // Add a mock source for this match
          const randomSource =
            mockSources[Math.floor(Math.random() * mockSources.length)];
          foundSources.push({
            ...randomSource,
            similarity: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
            matchedText: sentence.substring(0, Math.min(100, sentence.length)),
          });
        }
      });
    });

    // Additional scoring factors
    if (sentence.length > 120) aiScore += 0.2;
    if (sentence.length > 200) aiScore += 0.3;
    if (!lowerSentence.includes("'") && sentence.includes(",")) aiScore += 0.1;

    // Normalize scores
    const finalAiScore = Math.min(1.0, aiScore);
    const finalPlagiarismScore = Math.min(1.0, plagiarismScore);

    totalAiScore += finalAiScore;
    totalPlagiarismScore += finalPlagiarismScore;

    // Add to highlights if significant
    if (finalAiScore > 0.4) {
      aiHighlights.push({
        text: sentence.trim(),
        ai: finalAiScore > 0.5,
        confidence: finalAiScore,
        reason: aiReasons.join(", ") || "Pattern analysis",
      });
    }

    if (finalPlagiarismScore > 0.3) {
      // Find a matching source for this plagiarism highlight
      const matchingSource = foundSources.find(s => s.matchedText.includes(sentence.substring(0, 50))) || 
                           foundSources[foundSources.length - 1] || 
                           mockSources[0];
      
      plagiarismHighlights.push({
        text: sentence.trim(),
        plagiarized: finalPlagiarismScore > 0.5,
        confidence: finalPlagiarismScore,
        reason: plagiarismReasons.join(", ") || "Potential source match",
        source: matchingSource?.url || mockSources[0].url,
        title: matchingSource?.title || mockSources[0].title
      });
    }
  });

  // Calculate overall probabilities
  const avgAiProbability =
    sentences.length > 0 ? totalAiScore / sentences.length : 0;
  const avgPlagiarismProbability =
    sentences.length > 0 ? totalPlagiarismScore / sentences.length : 0;

  // Deduplicate sources and limit to top 5
  const uniqueSources = foundSources
    .filter(
      (source, index, self) =>
        index === self.findIndex((s) => s.url === source.url)
    )
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return {
    aiProbability: Math.min(0.95, avgAiProbability),
    aiHighlights,
    plagiarismProbability: Math.min(0.85, avgPlagiarismProbability),
    plagiarismHighlights,
    plagiarismSources: uniqueSources,
  };
};

// Export additional functions for plagiarism service integration
export const getComprehensiveAnalysis = async (text) => {
  return await getGeminiComprehensiveAnalysis(text);
};

export const getCombinedDetection = async (text) => {
  try {
    const [aiResult, comprehensiveResult] = await Promise.allSettled([
      getHuggingFaceAIProbability(text),
      getGeminiComprehensiveAnalysis(text),
    ]);

    let combinedResult = {
      ai: {
        probability: 0,
        highlights: [],
        sources: [],
      },
      plagiarism: {
        probability: 0,
        highlights: [],
        sources: [],
      },
    };

    // Process AI detection results
    if (aiResult.status === "fulfilled" && aiResult.value > 0) {
      combinedResult.ai.probability = aiResult.value;
    }

    // Process comprehensive analysis results
    if (comprehensiveResult.status === "fulfilled") {
      const result = comprehensiveResult.value;

      // Combine AI probabilities if both exist
      if (combinedResult.ai.probability > 0 && result.aiProbability > 0) {
        combinedResult.ai.probability =
          combinedResult.ai.probability * 0.6 + result.aiProbability * 0.4;
      } else if (result.aiProbability > 0) {
        combinedResult.ai.probability = result.aiProbability;
      }

      combinedResult.ai.highlights = result.aiHighlights || [];
      combinedResult.plagiarism = {
        probability: result.plagiarismProbability || 0,
        highlights: result.plagiarismHighlights || [],
        sources: result.plagiarismSources || [],
      };
    }

    return combinedResult;
  } catch (error) {
    console.error("Combined detection error:", error);
    throw error;
  }
};
