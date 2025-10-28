import { detectPlagiarismWithFreeAPIs } from "../services/freePlagiarismAPIs.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Test text samples
const testTexts = [
  // Academic text that should be found in Semantic Scholar
  `Machine learning algorithms have revolutionized the field of artificial intelligence by enabling computers to learn patterns from data without explicit programming. Deep neural networks, in particular, have shown remarkable success in tasks such as image recognition, natural language processing, and speech synthesis.`,
  
  // General knowledge text that might be found in DuckDuckGo
  `The theory of relativity, developed by Albert Einstein, fundamentally changed our understanding of space, time, and gravity. This groundbreaking theory consists of two interrelated theories: special relativity and general relativity.`,
  
  // Technical text
  `Blockchain technology is a distributed ledger system that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.`,
  
  // Short original text (should have low scores)
  `This is a completely original sentence that I just wrote for testing purposes and should not be found anywhere else on the internet or in academic literature.`
];

async function testNewAPIs() {
  console.log("🧪 Testing New Plagiarism Detection APIs");
  console.log("=" .repeat(50));
  
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`\n📝 Test ${i + 1}: ${text.substring(0, 80)}...`);
    console.log("-".repeat(40));
    
    try {
      const startTime = Date.now();
      const result = await detectPlagiarismWithFreeAPIs(text);
      const endTime = Date.now();
      
      console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
      console.log(`📊 Overall plagiarism score: ${(result.score * 100).toFixed(1)}%`);
      console.log(`🔍 Total matches found: ${result.highlight.length}`);
      console.log(`📚 Unique sources: ${result.sources.length}`);
      
      if (result.highlight.length > 0) {
        console.log("\n🎯 Top matches:");
        
        // Group by API source
        const bySource = {};
        result.highlight.forEach(match => {
          const source = match.reason || match.source;
          const apiName = source.includes('DuckDuckGo') ? 'DuckDuckGo' :
                         source.includes('academic literature') ? 'Semantic Scholar' :
                         source.includes('CrossRef') ? 'CrossRef' :
                         source.includes('arXiv') ? 'arXiv' :
                         source.includes('Google') ? 'Google' :
                         source.includes('Bing') ? 'Bing' :
                         source.includes('DupliChecker') ? 'DupliChecker' : 'Other';
          
          if (!bySource[apiName]) bySource[apiName] = [];
          bySource[apiName].push(match);
        });
        
        Object.entries(bySource).forEach(([apiName, matches]) => {
          console.log(`\n  🔸 ${apiName} (${matches.length} matches):`);
          matches.slice(0, 2).forEach(match => {
            console.log(`    • ${(match.score * 100).toFixed(1)}% - "${match.text.substring(0, 60)}..."`);
            console.log(`      Source: ${match.title || match.source}`);
            if (match.authors) console.log(`      Authors: ${match.authors}`);
            if (match.year) console.log(`      Year: ${match.year}`);
            if (match.citationCount) console.log(`      Citations: ${match.citationCount}`);
          });
        });
      } else {
        console.log("✅ No plagiarism detected - text appears to be original");
      }
      
    } catch (error) {
      console.error(`❌ Error testing text ${i + 1}:`, error.message);
    }
    
    console.log("\n" + "=".repeat(50));
    
    // Wait between tests to be respectful to APIs
    if (i < testTexts.length - 1) {
      console.log("⏳ Waiting 3 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

async function testIndividualAPIs() {
  console.log("\n🔬 Testing Individual APIs");
  console.log("=" .repeat(50));
  
  const testText = testTexts[1]; // Einstein relativity text
  
  try {
    // Import individual functions for testing
    const { checkWithDuckDuckGo, checkWithSemanticScholar } = await import("../services/freePlagiarismAPIs.js");
    
    console.log("\n🦆 Testing DuckDuckGo API:");
    const duckResult = await checkWithDuckDuckGo(testText);
    console.log(`Score: ${(duckResult.score * 100).toFixed(1)}%`);
    console.log(`Matches: ${duckResult.highlight.length}`);
    
    console.log("\n🎓 Testing Semantic Scholar API:");
    const scholarResult = await checkWithSemanticScholar(testText);
    console.log(`Score: ${(scholarResult.score * 100).toFixed(1)}%`);
    console.log(`Matches: ${scholarResult.highlight.length}`);
    
    if (scholarResult.highlight.length > 0) {
      console.log("Sample academic matches:");
      scholarResult.highlight.slice(0, 2).forEach(match => {
        console.log(`  • "${match.title}" (${match.year}) - ${match.citationCount} citations`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error testing individual APIs:", error.message);
  }
}

async function runTests() {
  console.log("🚀 Starting Plagiarism API Tests");
  console.log(`📅 ${new Date().toLocaleString()}`);
  
  // Check if we have any API keys configured
  console.log("\n🔑 API Configuration Status:");
  console.log(`Google Custom Search: ${process.env.GOOGLE_SEARCH_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Bing Search: ${process.env.BING_SEARCH_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`DupliChecker: ${process.env.DUPLICHECKER_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`DuckDuckGo: ✅ No API key needed (Free)`);
  console.log(`Semantic Scholar: ✅ No API key needed (Free)`);
  
  try {
    await testNewAPIs();
    // await testIndividualAPIs(); // Uncomment to test individual APIs
    
    console.log("\n🎉 All tests completed!");
    console.log("💡 Tip: The new APIs (DuckDuckGo & Semantic Scholar) are completely free!");
    
  } catch (error) {
    console.error("❌ Test suite failed:", error);
  }
}

// Run the tests
runTests().catch(console.error);