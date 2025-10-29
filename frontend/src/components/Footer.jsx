import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-accent border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/plagiasure.png" 
              alt="PlagiaSure Logo" 
              className="h-6 w-6"
            />
            <div>
              <p className="text-sm font-medium text-white">PlagiaSure</p>
              <p className="text-xs text-white/80">Advanced AI & Plagiarism Detection</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-white/80">
            <span>© 2024 PlagiaSure. All rights reserved.</span>
            <div className="flex space-x-4">
              <Link to="/privacy" className="hover:text-white">Privacy</Link>
              <Link to="/terms" className="hover:text-white">Terms</Link>
              <Link to="/support" className="hover:text-white">Support</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center space-x-4">
              <span>🆓 Free APIs: DuckDuckGo, Semantic Scholar, CrossRef, arXiv</span>
              <span>🤖 AI Detection: Hugging Face</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Powered by</span>
              <span className="font-medium">React + Supabase + Node.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;