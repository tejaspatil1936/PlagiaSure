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
