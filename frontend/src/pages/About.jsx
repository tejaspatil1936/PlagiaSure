import React from 'react';
import { Shield, Zap, Users, Award, Target, Heart, CheckCircle, ArrowRight } from 'lucide-react';

const About = () => {
  const stats = [
    { number: '10,000+', label: 'Documents Analyzed' },
    { number: '500+', label: 'Educational Institutions' },
    { number: '99.5%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Support Available' }
  ];

  const team = [
    {
      name: 'Dr. Rajesh Kumar',
      role: 'CEO & Co-Founder',
      image: '👨‍💼',
      bio: 'Former professor with 15+ years in educational technology and AI research.'
    },
    {
      name: 'Priya Sharma',
      role: 'CTO & Co-Founder',
      image: '👩‍💻',
      bio: 'AI/ML expert with experience at top tech companies, specializing in NLP and detection algorithms.'
    },
    {
      name: 'Amit Patel',
      role: 'Head of Product',
      image: '👨‍🎓',
      bio: 'Product strategist focused on creating intuitive solutions for educators and institutions.'
    },
    {
      name: 'Sneha Gupta',
      role: 'Head of Customer Success',
      image: '👩‍🏫',
      bio: 'Dedicated to ensuring our customers achieve their academic integrity goals.'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Academic Integrity',
      description: 'We believe in maintaining the highest standards of academic honesty and helping institutions uphold these values.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously advancing our AI technology to stay ahead of evolving challenges in content detection.'
    },
    {
      icon: Users,
      title: 'Educator-Centric',
      description: 'Every feature is designed with educators in mind, making complex technology simple and accessible.'
    },
    {
      icon: Heart,
      title: 'Ethical AI',
      description: 'Committed to responsible AI development that respects privacy and promotes fair educational practices.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About PlagiaSure
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto">
              Empowering educators worldwide with cutting-edge AI technology to maintain academic integrity and foster genuine learning.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At PlagiaSure, we're on a mission to revolutionize academic integrity through advanced AI technology. 
                We believe that authentic learning and original thinking are the cornerstones of quality education.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our platform combines state-of-the-art plagiarism detection with sophisticated AI content analysis, 
                providing educators with the tools they need to maintain academic standards while fostering a culture of honesty and creativity.
              </p>
              <div className="flex items-center space-x-4">
                <Target className="w-8 h-8 text-[#52DE97]" />
                <span className="text-lg font-semibold text-gray-900">
                  Protecting Academic Integrity Since 2023
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-[#3282B8] to-[#52DE97] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why We Started PlagiaSure</h3>
                <p className="text-blue-100 mb-6">
                  As educators ourselves, we witnessed the growing challenge of AI-generated content and sophisticated plagiarism techniques. 
                  Traditional tools weren't keeping up with the evolving landscape.
                </p>
                <p className="text-blue-100">
                  We founded PlagiaSure to bridge this gap, creating a solution that's not just powerful, 
                  but also intuitive and accessible for educators at all levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Our impact in numbers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#3282B8] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at PlagiaSure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-[#3282B8] to-[#52DE97] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate educators and technologists working together to transform academic integrity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6 text-center">
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-[#3282B8] font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-[#2D4B7C] to-[#3282B8] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Our Technology Stack</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#52DE97]" />
                    <span>Advanced Natural Language Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#52DE97]" />
                    <span>Machine Learning Detection Models</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#52DE97]" />
                    <span>Real-time Content Analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#52DE97]" />
                    <span>Comprehensive Database Matching</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-[#52DE97]" />
                    <span>Cloud-based Scalable Infrastructure</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Cutting-Edge Technology
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                PlagiaSure leverages the latest advances in artificial intelligence and machine learning 
                to provide unparalleled accuracy in detecting both plagiarism and AI-generated content.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our proprietary algorithms are continuously updated to stay ahead of emerging threats 
                to academic integrity, ensuring that educators always have the most effective tools at their disposal.
              </p>
              <div className="flex items-center space-x-4">
                <Award className="w-8 h-8 text-[#52DE97]" />
                <span className="text-lg font-semibold text-gray-900">
                  Industry-Leading 99.5% Accuracy Rate
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-r from-[#2D4B7C] via-[#3282B8] to-[#3AB795] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the growing community of educators who trust PlagiaSure to maintain academic integrity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-[#52DE97] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#3AB795] transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/contact"
              className="bg-white bg-opacity-20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-opacity-30 transition-colors border border-white border-opacity-30"
            >
              Contact Our Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;