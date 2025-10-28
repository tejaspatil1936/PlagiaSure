import { detectPlagiarism } from "../services/plagiarismDetection.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testIntegration() {
  console.log("🧪 Testing Enhanced Plagiarism Detection Integration");
  console.log("=" .repeat(60));
  
  // Test texts with different characteristics
  const testCases = [
    {
      name: "Academic Content (Einstein)",
      text: `The theory of relativity, developed by Albert Einstein, fundamentally changed our understanding of space, time, and gravity. This groundbreaking theory consists of two interrelated theories: special relativity and general relativity. Special relativity applies to all physical phenomena in the absence of gravity.`,
      expectedAPIs: ['CrossRef', 'arXiv', 'DuckDuckGo']
    },
    {
      name: "Technical Content (Blockchain)",
      text: `Blockchain technology is a distributed ledger system that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.`,
      expectedAPIs: ['Semantic Scholar', 'CrossRef']
    },
    {
      name: "Machine Learning Content",
      text: `Machine learning algorithms have revolutionized the field of artificial intelligence by enabling computers to learn patterns from data without explicit programming. Deep neural networks, in particular, have shown remarkable success in tasks such as image recognition, natural language processing, and speech synthesis.`,
      expectedAPIs: ['Semantic Scholar', 'CrossRef']
    },
    {
      name: "Original Content",
      text: `This is a completely original sentence that I just wrote for testing purposes and should not be found anywhere else on the internet or in academic literature. It contains unique phrases and concepts that are specific to this test.`,
      expectedAPIs: []
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log("-".repeat(50));
    console.log(`Text: ${testCase.text.substring(0, 100)}...`);
    
    try {
      const startTime = Date.now();
      const result = await detectPlagiarism(testCase.text);
      const endTime = Date.now();
      
      console.log(`\n📊 Results:`);
      console.log(`⏱️  Processing time: ${endTime - startTime}ms`);
      console.log(`🎯 Plagiarism score: ${(result.score * 100).toFixed(1)}%`);
      console.log(`🔍 Total matches: ${result.highlight.length}`);
      console.log(`📚 Detection method: ${result.method}`);
      console.log(`📄 Total sentences: ${result.totalSentences || 'N/A'}`);
      console.log(`🚩 Flagged sentences: ${result.flaggedSentences || 'N/A'}`);
      
      // Show API source breakdown if available
      if (result.apiSources) {
        console.log(`\n🔧 API Source Breakdown:`);
        console.log(`  🦆 DuckDuckGo: ${result.apiSources.duckduckgo} matches`);
        console.log(`  🎓 Semantic Scholar: ${result.apiSources.semanticScholar} matches`);
        console.log(`  📚 CrossRef: ${result.apiSources.crossref} matches`);
        console.log(`  🔬 arXiv: ${result.apiSources.arxiv} matches`);
      }
      
      // Show top matches by API
      if (result.highlight.length > 0) {
        console.log(`\n🎯 Top Matches by Source:`);
        
        const byAPI = {};
        result.highlight.forEach(match => {
          let apiName = 'Other';
          
          if (match.reason?.includes('DuckDuckGo')) {
            apiName = '🦆 DuckDuckGo';
          } else if (match.reason?.includes('academic literature')) {
            apiName = '🎓 Semantic Scholar';
          } else if (match.authors && !match.reason?.includes('academic literature')) {
            apiName = '📚 CrossRef';
          } else if (match.source?.includes('arXiv') || match.title?.includes('Scientific')) {
            apiName = '🔬 arXiv';
          }
          
          if (!byAPI[apiName]) byAPI[apiName] = [];
          byAPI[apiName].push(match);
        });
        
        Object.entries(byAPI).forEach(([apiName, matches]) => {
          console.log(`\n  ${apiName} (${matches.length} matches):`);
          matches.slice(0, 2).forEach((match, index) => {
            console.log(`    ${index + 1}. ${(match.score * 100).toFixed(1)}% - "${match.text.substring(0, 60)}..."`);
            console.log(`       Source: ${match.title || match.source}`);
            if (match.authors) console.log(`       Authors: ${match.authors}`);
            if (match.year) console.log(`       Year: ${match.year}`);
            if (match.citationCount) console.log(`       Citations: ${match.citationCount}`);
          });
        });
      }
      
      // Check AI detection if available
      if (result.aiDetection) {
        console.log(`\n🤖 AI Detection:`);
        console.log(`   Probability: ${(result.aiDetection.probability * 100).toFixed(1)}%`);
        console.log(`   AI Highlights: ${result.aiDetection.highlights.length} items`);
      }
      
      // Validation
      const detectedAPIs = [];
      if (result.apiSources) {
        if (result.apiSources.duckduckgo > 0) detectedAPIs.push('DuckDuckGo');
        if (result.apiSources.semanticScholar > 0) detectedAPIs.push('Semantic Scholar');
        if (result.apiSources.crossref > 0) detectedAPIs.push('CrossRef');
        if (result.apiSources.arxiv > 0) detectedAPIs.push('arXiv');
      }
      
      console.log(`\n✅ Integration Status: ${detectedAPIs.length > 0 ? 'SUCCESS' : 'PARTIAL'}`);
      console.log(`   Expected APIs: ${testCase.expectedAPIs.join(', ') || 'None'}`);
      console.log(`   Detected APIs: ${detectedAPIs.join(', ') || 'None'}`);
      
    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error.message);
    }
    
    console.log("\n" + "=".repeat(60));
    
    // Wait between tests to respect API rate limits
    if (i < testCases.length - 1) {
      console.log("⏳ Waiting 5 seconds before next test...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function showIntegrationSummary() {
  console.log("\n🚀 Enhanced Plagiarism Detection Integration Summary");
  console.log("=" .repeat(60));
  
  console.log("✨ New Features Integrated:");
  console.log("1. 🦆 DuckDuckGo Knowledge Base Search");
  console.log("   • FREE, no API key required");
  console.log("   • Detects general knowledge content");
  console.log("   • Wikipedia and definition matching");
  
  console.log("\n2. 🎓 Semantic Scholar Academic Search");
  console.log("   • FREE access to 200M+ academic papers");
  console.log("   • Citation count analysis");
  console.log("   • Author and publication year data");
  
  console.log("\n3. 📚 Enhanced CrossRef Integration");
  console.log("   • Academic citation database");
  console.log("   • DOI and publication metadata");
  
  console.log("\n4. 🔬 arXiv Scientific Papers");
  console.log("   • Scientific literature search");
  console.log("   • STEM content detection");
  
  console.log("\n🔧 Integration Benefits:");
  console.log("• Multi-API plagiarism detection");
  console.log("• Comprehensive source coverage");
  console.log("• Enhanced result categorization");
  console.log("• Better academic content detection");
  console.log("• Detailed API source breakdown");
  console.log("• Improved scoring accuracy");
  
  console.log("\n⚙️  Report Generation Enhancement:");
  console.log("• Automatic API source tracking");
  console.log("• Enhanced logging and debugging");
  console.log("• Better error handling");
  console.log("• Fallback mechanism for reliability");
}

async function runIntegrationTest() {
  console.log("🎯 Enhanced Plagiarism Detection Integration Test");
  console.log(`📅 ${new Date().toLocaleString()}`);
  
  await testIntegration();
  await showIntegrationSummary();
  
  console.log("\n🎉 Integration test completed!");
  console.log("💡 Your report generation now uses enhanced free APIs!");
}

runIntegrationTest().catch(console.error);