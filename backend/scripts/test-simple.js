import axios from "axios";

// Simple test for DuckDuckGo API
async function testDuckDuckGo() {
  console.log("🦆 Testing DuckDuckGo API...");
  
  try {
    const response = await axios.get("https://api.duckduckgo.com/", {
      params: {
        q: "Albert Einstein theory of relativity",
        format: 'json',
        no_html: '1',
        skip_disambig: '1'
      },
      timeout: 10000,
    });

    console.log("✅ DuckDuckGo API Response:");
    console.log("Abstract:", response.data.Abstract ? "✅ Found" : "❌ Not found");
    console.log("Related Topics:", response.data.RelatedTopics ? `✅ ${response.data.RelatedTopics.length} topics` : "❌ Not found");
    console.log("Definition:", response.data.Definition ? "✅ Found" : "❌ Not found");
    
    if (response.data.Abstract) {
      console.log("Sample Abstract:", response.data.Abstract.substring(0, 100) + "...");
    }
    
  } catch (error) {
    console.error("❌ DuckDuckGo API Error:", error.message);
  }
}

// Simple test for Semantic Scholar API
async function testSemanticScholar() {
  console.log("\n🎓 Testing Semantic Scholar API...");
  
  try {
    const response = await axios.get("https://api.semanticscholar.org/graph/v1/paper/search", {
      params: {
        query: "machine learning",
        limit: 3,
        fields: 'title,authors,year,citationCount'
      },
      headers: {
        'User-Agent': 'PlagiaSure/1.0 (Academic Integrity Tool)'
      },
      timeout: 10000,
    });

    console.log("✅ Semantic Scholar API Response:");
    console.log("Papers found:", response.data.data ? response.data.data.length : 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log("Sample papers:");
      response.data.data.slice(0, 2).forEach((paper, index) => {
        console.log(`  ${index + 1}. "${paper.title}" (${paper.year}) - ${paper.citationCount} citations`);
      });
    }
    
  } catch (error) {
    console.error("❌ Semantic Scholar API Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
  }
}

// Test both APIs
async function runSimpleTests() {
  console.log("🧪 Simple API Tests");
  console.log("=" .repeat(40));
  
  await testDuckDuckGo();
  
  // Wait before testing Semantic Scholar
  console.log("\n⏳ Waiting 3 seconds...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await testSemanticScholar();
  
  console.log("\n🎉 Simple tests completed!");
}

runSimpleTests().catch(console.error);