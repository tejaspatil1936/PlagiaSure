#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupGoogleOAuth() {
  console.log('🚀 Google OAuth Setup for PlagiaSure\n');
  
  console.log('This script will help you configure Google OAuth for your application.');
  console.log('Make sure you have already:');
  console.log('1. Created a Google Cloud Project');
  console.log('2. Enabled Google+ API and Google Identity API');
  console.log('3. Configured OAuth consent screen');
  console.log('4. Created OAuth 2.0 credentials\n');
  
  const proceed = await question('Have you completed the above steps? (y/n): ');
  
  if (proceed.toLowerCase() !== 'y') {
    console.log('\n📖 Please follow the setup guide in GOOGLE_OAUTH_SETUP.md first.');
    rl.close();
    return;
  }

  console.log('\n📝 Please provide your Google OAuth credentials:\n');
  
  const clientId = await question('Google Client ID: ');
  const clientSecret = await question('Google Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Both Client ID and Client Secret are required.');
    rl.close();
    return;
  }

  try {
    // Update backend .env
    const backendEnvPath = path.join(__dirname, 'backend', '.env');
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    backendEnv = backendEnv.replace(
      /GOOGLE_CLIENT_ID=.*/,
      `GOOGLE_CLIENT_ID=${clientId}`
    );
    backendEnv = backendEnv.replace(
      /GOOGLE_CLIENT_SECRET=.*/,
      `GOOGLE_CLIENT_SECRET=${clientSecret}`
    );
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Updated backend/.env');

    // Update frontend .env
    const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    frontendEnv = frontendEnv.replace(
      /VITE_GOOGLE_CLIENT_ID=.*/,
      `VITE_GOOGLE_CLIENT_ID=${clientId}`
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Updated frontend/.env');

    console.log('\n🎉 Google OAuth configuration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development servers');
    console.log('2. Test the Google Sign-In functionality');
    console.log('3. Check the browser console for any errors');
    
    console.log('\n🔧 Development servers:');
    console.log('Backend: cd backend && npm run dev');
    console.log('Frontend: cd frontend && npm run dev');
    
  } catch (error) {
    console.error('❌ Error updating configuration files:', error.message);
  }
  
  rl.close();
}

setupGoogleOAuth().catch(console.error);