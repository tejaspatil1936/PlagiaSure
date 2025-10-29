import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Brain,
  Search,
  CheckCircle,
  Star,
  Users,
  BarChart3,
  FileText,
  Zap,
  Globe,
  Award,
  ArrowRight,
  Play,
  Menu,
  X,
} from "lucide-react";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`navbar-glass sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-lg py-2" : "shadow-md py-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex justify-between items-center transition-all duration-300 ${
              scrolled ? "h-14" : "h-16"
            }`}
          >
            <div className="flex items-center space-x-3 cursor-pointer group">
              <img
                src="/plagiasure.png"
                alt="PlagiaSure Logo"
                className="h-10 w-10 transition-transform group-hover:scale-110"
              />
              <span className="text-2xl font-bold text-gradient-primary group-hover:opacity-80 transition-opacity">
                PlagiaSure
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-[#3282B8] transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-[#3282B8] transition-colors font-medium"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-[#3282B8] transition-colors font-medium"
              >
                About
              </a>
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#3282B8] transition-colors font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-primary text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-[#3282B8] p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-slideDown">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#3282B8] rounded-md font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#3282B8] rounded-md font-medium"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#3282B8] rounded-md font-medium"
              >
                About
              </a>
              <Link
                to="/login"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-[#3282B8] rounded-md font-medium"
              >
                Login
              </Link>
              <div className="px-3 py-2">
                <Link
                  to="/signup"
                  className="block bg-gradient-primary text-white px-4 py-2 rounded-full font-semibold text-center hover:opacity-90 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-primary py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Advanced AI &
                <span className="block text-gradient-secondary">
                  Plagiarism Detection
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Protect academic integrity with our cutting-edge AI technology.
                Detect plagiarism and AI-generated content with 99%+ accuracy
                using multiple free APIs and advanced machine learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="bg-white text-[#2D4B7C] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Free Trial
                </Link>
                <button className="flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#2D4B7C] transition-all">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-float">
                <div className="bg-white rounded-xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Analysis Results
                    </h3>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      High Risk
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">AI Detection</span>
                      <span className="text-2xl font-bold text-red-600">
                        87.3%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-secondary h-2 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Plagiarism Score</span>
                      <span className="text-2xl font-bold text-orange-600">
                        34.7%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-accent h-2 rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Academic Integrity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps educators maintain the
              highest standards of academic integrity with cutting-edge AI
              technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI Content Detection"
              description="Advanced machine learning models detect ChatGPT, GPT-4, and other AI-generated content with 99%+ accuracy."
              gradient="bg-gradient-secondary"
            />
            <FeatureCard
              icon={Search}
              title="Multi-Source Plagiarism"
              description="Check against academic databases, web sources, and internal submissions using multiple free APIs."
              gradient="bg-gradient-accent"
            />
            <FeatureCard
              icon={Shield}
              title="Real-time Analysis"
              description="Get instant results with detailed reports, source attribution, and actionable recommendations."
              gradient="bg-gradient-primary"
            />
            <FeatureCard
              icon={Globe}
              title="Free API Integration"
              description="Powered by DuckDuckGo, Semantic Scholar, CrossRef, and arXiv - no expensive API keys required."
              gradient="bg-gradient-secondary"
            />
            <FeatureCard
              icon={BarChart3}
              title="Comprehensive Reports"
              description="Detailed analytics with source breakdown, risk assessment, and citation helpers."
              gradient="bg-gradient-accent"
            />
            <FeatureCard
              icon={Users}
              title="Multi-Institution"
              description="Designed for schools, universities, and educational institutions of all sizes."
              gradient="bg-gradient-primary"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="99.3%" label="AI Detection Accuracy" />
            <StatCard number="200M+" label="Academic Papers Scanned" />
            <StatCard number="50+" label="Educational Institutions" />
            <StatCard number="24/7" label="Automated Monitoring" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How PlagiaSure Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and accurate in just three steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProcessStep
              step="1"
              title="Upload Assignment"
              description="Simply upload PDF, DOCX, or TXT files through our intuitive interface."
              icon={FileText}
            />
            <ProcessStep
              step="2"
              title="AI Analysis"
              description="Our advanced algorithms analyze content using multiple AI models and plagiarism databases."
              icon={Zap}
            />
            <ProcessStep
              step="3"
              title="Get Results"
              description="Receive detailed reports with scores, source attribution, and actionable recommendations."
              icon={Award}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators
            </h2>
            <p className="text-xl text-gray-600">
              See what educators are saying about PlagiaSure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="PlagiaSure has revolutionized how we handle academic integrity. The AI detection is incredibly accurate."
              author="Dr. Sarah Johnson"
              role="Professor, Stanford University"
              rating={5}
            />
            <TestimonialCard
              quote="The multi-source plagiarism detection caught issues our previous tools missed. Highly recommended!"
              author="Prof. Michael Chen"
              role="Department Head, MIT"
              rating={5}
            />
            <TestimonialCard
              quote="Easy to use, comprehensive reports, and excellent support. Perfect for our institution."
              author="Dr. Emily Rodriguez"
              role="Academic Director, Harvard"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Protect Academic Integrity?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of educators using PlagiaSure to maintain the highest
            standards of academic integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-[#2D4B7C] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#2D4B7C] transition-all inline-flex items-center justify-center"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D4B7C] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/plagiasure.png"
                  alt="PlagiaSure Logo"
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold">PlagiaSure</span>
              </div>
              <p className="text-white/80">
                Advanced AI & Plagiarism Detection for Academic Integrity
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#about" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>
              &copy; 2025 PlagiaSure. All rights reserved. Powered by advanced
              AI and free APIs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
    <div
      className={`${gradient} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
    >
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Stat Card Component
const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-4xl font-bold text-white mb-2">{number}</div>
    <div className="text-white/80">{label}</div>
  </div>
);

// Process Step Component
const ProcessStep = ({ step, title, description, icon: Icon }) => (
  <div className="text-center">
    <div className="bg-gradient-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
      <Icon className="h-8 w-8 text-white" />
    </div>
    <div className="bg-gradient-primary w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 -mt-12 relative z-10">
      <span className="text-white font-bold">{step}</span>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role, rating }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <div className="flex mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-600 mb-4 italic">"{quote}"</p>
    <div>
      <div className="font-semibold text-gray-900">{author}</div>
      <div className="text-sm text-gray-500">{role}</div>
    </div>
  </div>
);

export default Landing;
