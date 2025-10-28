import axios from "axios";

// Free plagiarism detection using multiple APIs
export const detectPlagiarismWithFreeAPIs = async (text) => {
  try {
    console.log("Starting multi-API plagiarism detection...");

    const results = await Promise.allSettled([
      checkWithDupliChecker(text),
      checkWithGoogleCustomSearch(text),
      checkWithCrossRef(text),
      checkWithArXiv(text),
      checkWithBingSearch(text),
      checkWithDuckDuckGo(text),
      checkWithSemanticScholar(text),
    ]);

    let maxScore = 0;
    let allHighlights = [];
    let sources = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        maxScore = Math.max(maxScore, result.value.score || 0);
        if (result.value.highlight) {
          allHighlights.push(...result.value.highlight);
        }
        if (result.value.sources) {
          sources.push(...result.value.sources);
        }
      }
    });

    // Remove duplicates and sort by score
    const uniqueHighlights = removeDuplicateHighlights(allHighlights);

    return {
      score: maxScore,
      highlight: uniqueHighlights.slice(0, 15),
      sources: [...new Set(sources)],
      method: "Multi-API Free Detection",
    };
  } catch (error) {
    console.error("Multi-API plagiarism detection error:", error);
    return { score: 0, highlight: [], sources: [] };
  }
};

// DupliChecker API (Free tier: 1000 queries/month)
const checkWithDupliChecker = async (text) => {
  try {
    if (!process.env.DUPLICHECKER_API_KEY) {
      console.log("DupliChecker API key not configured");
      return { score: 0, highlight: [] };
    }

    // Split text into chunks (API has text length limits)
    const chunks = splitTextIntoChunks(text, 1000);
    let maxScore = 0;
    let highlights = [];

    for (const chunk of chunks.slice(0, 2)) {
      // Limit to 2 chunks to save API calls
      const response = await axios.post(
        "https://www.duplichecker.com/api/v1/check",
        {
          text: chunk,
          api_key: process.env.DUPLICHECKER_API_KEY,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data && response.data.percentage) {
        const score = response.data.percentage / 100;
        maxScore = Math.max(maxScore, score);

        if (response.data.matches) {
          response.data.matches.forEach((match) => {
            highlights.push({
              text: match.text || chunk.substring(0, 100) + "...",
              source: match.url || "DupliChecker Database",
              score: score,
            });
          });
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("DupliChecker API error:", error);
    return { score: 0, highlight: [] };
  }
};

// Google Custom Search API (Free tier: 100 queries/day)
const checkWithGoogleCustomSearch = async (text) => {
  try {
    if (
      !process.env.GOOGLE_SEARCH_API_KEY ||
      !process.env.GOOGLE_SEARCH_ENGINE_ID
    ) {
      console.log("Google Custom Search API not configured");
      return { score: 0, highlight: [] };
    }

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 30);
    let maxScore = 0;
    let highlights = [];

    // Check top 3 sentences
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const searchQuery = `"${sentence.substring(0, 80)}"`;

      try {
        const response = await axios.get(
          "https://www.googleapis.com/customsearch/v1",
          {
            params: {
              key: process.env.GOOGLE_SEARCH_API_KEY,
              cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
              q: searchQuery,
              num: 5,
            },
            timeout: 8000,
          }
        );

        if (response.data.items && response.data.items.length > 0) {
          const score = Math.min(0.9, response.data.items.length * 0.2);
          maxScore = Math.max(maxScore, score);

          response.data.items.forEach((item) => {
            highlights.push({
              text: sentence,
              source: item.link,
              score: score,
              title: item.title,
            });
          });
        }

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1200));
      } catch (searchError) {
        console.error("Google search error:", searchError);
      }
    }

    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("Google Custom Search error:", error);
    return { score: 0, highlight: [] };
  }
};

// CrossRef API for academic papers (Free, unlimited)
const checkWithCrossRef = async (text) => {
  try {
    const academicPhrases = extractAcademicPhrases(text);
    let maxScore = 0;
    let highlights = [];

    for (const phrase of academicPhrases.slice(0, 3)) {
      try {
        const response = await axios.get("https://api.crossref.org/works", {
          params: {
            query: phrase,
            rows: 5,
          },
          headers: {
            "User-Agent":
              "PlagiarismChecker/1.0 (mailto:your-email@example.com)",
          },
          timeout: 8000,
        });

        if (
          response.data.message.items &&
          response.data.message.items.length > 0
        ) {
          const score = Math.min(
            0.7,
            response.data.message.items.length * 0.15
          );
          maxScore = Math.max(maxScore, score);

          response.data.message.items.forEach((item) => {
            highlights.push({
              text: phrase,
              source: item.URL || `DOI: ${item.DOI}`,
              score: score,
              title: item.title ? item.title[0] : "Academic Paper",
              authors: item.author
                ? item.author.map((a) => `${a.given} ${a.family}`).join(", ")
                : "Unknown",
            });
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (crossrefError) {
        console.error("CrossRef search error:", crossrefError);
      }
    }

    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("CrossRef API error:", error);
    return { score: 0, highlight: [] };
  }
};

// arXiv API for scientific papers (Free, unlimited)
const checkWithArXiv = async (text) => {
  try {
    const scientificTerms = extractScientificTerms(text);
    let maxScore = 0;
    let highlights = [];

    for (const term of scientificTerms.slice(0, 2)) {
      try {
        const response = await axios.get("http://export.arxiv.org/api/query", {
          params: {
            search_query: `all:"${term}"`,
            max_results: 5,
          },
          timeout: 8000,
        });

        // Parse XML response (simplified)
        if (response.data.includes("<entry>")) {
          const score = 0.5;
          maxScore = Math.max(maxScore, score);

          highlights.push({
            text: term,
            source: "arXiv.org Scientific Papers",
            score: score,
            title: "Scientific Literature Match",
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (arxivError) {
        console.error("arXiv search error:", arxivError);
      }
    }

    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("arXiv API error:", error);
    return { score: 0, highlight: [] };
  }
};

// Bing Search API (Free tier: 1000 queries/month)
const checkWithBingSearch = async (text) => {
  try {
    if (!process.env.BING_SEARCH_API_KEY) {
      console.log("Bing Search API key not configured");
      return { score: 0, highlight: [] };
    }

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 25);
    let maxScore = 0;
    let highlights = [];

    // Check top 2 sentences
    for (let i = 0; i < Math.min(2, sentences.length); i++) {
      const sentence = sentences[i].trim();
      const searchQuery = `"${sentence.substring(0, 70)}"`;

      try {
        const response = await axios.get(
          "https://api.bing.microsoft.com/v7.0/search",
          {
            params: {
              q: searchQuery,
              count: 5,
            },
            headers: {
              "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_API_KEY,
            },
            timeout: 8000,
          }
        );

        if (response.data.webPages && response.data.webPages.value.length > 0) {
          const score = Math.min(
            0.8,
            response.data.webPages.value.length * 0.2
          );
          maxScore = Math.max(maxScore, score);

          response.data.webPages.value.forEach((item) => {
            highlights.push({
              text: sentence,
              source: item.url,
              score: score,
              title: item.name,
            });
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (bingError) {
        console.error("Bing search error:", bingError);
      }
    }

    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("Bing Search API error:", error);
    return { score: 0, highlight: [] };
  }
};

// DuckDuckGo Instant Answer API (Free, unlimited, no API key needed)
const checkWithDuckDuckGo = async (text) => {
  try {
    console.log("Checking with DuckDuckGo...");
    
    // Extract key phrases instead of full sentences for better matching
    const keyPhrases = extractKeyPhrases(text);
    let maxScore = 0;
    let highlights = [];

    // Check top 2 key phrases
    for (let i = 0; i < Math.min(2, keyPhrases.length); i++) {
      const phrase = keyPhrases[i];
      
      try {
        // DuckDuckGo Instant Answer API - search for general knowledge
        const response = await axios.get("https://api.duckduckgo.com/", {
          params: {
            q: phrase,
            format: 'json',
            no_html: '1',
            skip_disambig: '1'
          },
          timeout: 8000,
        });

        if (response.data) {
          let hasResults = false;
          let sources = [];

          // Check Abstract (Wikipedia-like results)
          if (response.data.Abstract && response.data.Abstract.trim().length > 0) {
            hasResults = true;
            sources.push({
              url: response.data.AbstractURL || 'https://duckduckgo.com',
              title: response.data.AbstractSource || 'Knowledge Base',
              snippet: response.data.Abstract
            });
          }

          // Check Definition
          if (response.data.Definition && response.data.Definition.trim().length > 0) {
            hasResults = true;
            sources.push({
              url: response.data.DefinitionURL || 'https://duckduckgo.com',
              title: response.data.DefinitionSource || 'Definition',
              snippet: response.data.Definition
            });
          }

          // Check Answer (direct answers)
          if (response.data.Answer && response.data.Answer.trim().length > 0) {
            hasResults = true;
            sources.push({
              url: response.data.AnswerURL || 'https://duckduckgo.com',
              title: response.data.AnswerType || 'Direct Answer',
              snippet: response.data.Answer
            });
          }

          if (hasResults) {
            // Score based on how well the phrase matches known information
            const score = Math.min(0.6, sources.length * 0.3);
            maxScore = Math.max(maxScore, score);

            sources.forEach(source => {
              highlights.push({
                text: phrase,
                source: source.url,
                score: score,
                title: source.title,
                reason: "Found in DuckDuckGo knowledge base",
                snippet: source.snippet.substring(0, 150) + "..."
              });
            });
          }
        }

        // Rate limiting - be respectful
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (searchError) {
        console.error("DuckDuckGo search error:", searchError.message);
      }
    }

    console.log(`DuckDuckGo found ${highlights.length} matches with max score ${maxScore}`);
    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("DuckDuckGo API error:", error);
    return { score: 0, highlight: [] };
  }
};

// Semantic Scholar API (Free, unlimited but rate limited)
const checkWithSemanticScholar = async (text) => {
  try {
    console.log("Checking with Semantic Scholar...");
    
    const academicPhrases = extractAcademicPhrases(text);
    let maxScore = 0;
    let highlights = [];

    // Check only 1 phrase to avoid rate limiting
    for (const phrase of academicPhrases.slice(0, 1)) {
      try {
        const response = await axios.get("https://api.semanticscholar.org/graph/v1/paper/search", {
          params: {
            query: phrase,
            limit: 3, // Reduced limit
            fields: 'title,authors,year,url,citationCount'
          },
          headers: {
            'User-Agent': 'PlagiaSure/1.0 (Academic Integrity Tool)',
            'Accept': 'application/json'
          },
          timeout: 15000,
        });

        if (response.data.data && response.data.data.length > 0) {
          const papers = response.data.data;
          
          // Conservative scoring to avoid false positives
          const baseScore = Math.min(0.7, papers.length * 0.2);
          const citationBonus = papers.some(p => p.citationCount > 50) ? 0.1 : 0;
          const score = Math.min(0.8, baseScore + citationBonus);
          
          maxScore = Math.max(maxScore, score);

          papers.forEach((paper) => {
            highlights.push({
              text: phrase,
              source: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
              score: score,
              title: paper.title || "Academic Paper",
              authors: paper.authors ? paper.authors.map(a => a.name).join(", ") : "Unknown Authors",
              year: paper.year || "Unknown Year",
              citationCount: paper.citationCount || 0,
              reason: `Found in academic literature (${paper.citationCount || 0} citations)`
            });
          });
        }

        // Longer rate limiting to avoid 429 errors
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (searchError) {
        if (searchError.response?.status === 429) {
          console.log("Semantic Scholar rate limit reached, skipping remaining searches");
          break; // Stop searching if rate limited
        }
        console.error("Semantic Scholar search error:", searchError.message);
      }
    }

    console.log(`Semantic Scholar found ${highlights.length} matches with max score ${maxScore}`);
    return { score: maxScore, highlight: highlights };
  } catch (error) {
    console.error("Semantic Scholar API error:", error);
    return { score: 0, highlight: [] };
  }
};

// Helper functions
const splitTextIntoChunks = (text, maxLength) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
};

const extractAcademicPhrases = (text) => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 40);
  return sentences.slice(0, 5).map((s) => s.trim().substring(0, 100));
};

const extractScientificTerms = (text) => {
  const scientificWords =
    text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  return scientificWords.filter((term) => term.length > 10).slice(0, 3);
};

const extractKeyPhrases = (text) => {
  // Extract meaningful phrases for general knowledge search
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const phrases = [];
  
  sentences.forEach(sentence => {
    // Look for proper nouns and important concepts
    const properNouns = sentence.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const importantPhrases = sentence.match(/\b(?:theory|algorithm|method|system|technology|principle|concept|model)\s+\w+/gi) || [];
    
    phrases.push(...properNouns);
    phrases.push(...importantPhrases);
  });
  
  // Remove duplicates and return top phrases
  return [...new Set(phrases)]
    .filter(phrase => phrase.length > 5 && phrase.length < 50)
    .slice(0, 3);
};

const removeDuplicateHighlights = (highlights) => {
  const seen = new Set();
  return highlights
    .filter((highlight) => {
      const key = highlight.text.toLowerCase().trim().substring(0, 50);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
};

export default detectPlagiarismWithFreeAPIs;
