import React, { useState } from 'react';
import AudioUpload from '../components/AudioUpload';
import EmotionalDashboard from '../components/EmotionalDashboard';
import { FiMenu, FiX } from 'react-icons/fi';

const Home: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navigation */}
      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-bold">🧠</div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Mental Health AI</h1>
                <p className="text-xs md:text-sm text-primary-100">
                  Emotional State Detection System
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('analysis')}
                className="hover:text-primary-200 transition text-sm font-medium"
              >
                Analysis
              </button>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="hover:text-primary-200 transition text-sm font-medium"
              >
                Dashboard
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-primary-700 rounded transition"
            >
              {mobileMenuOpen ? (
                <FiX size={24} />
              ) : (
                <FiMenu size={24} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-primary-500 space-y-3">
              <button
                onClick={() => scrollToSection('analysis')}
                className="w-full text-left px-4 py-2 hover:bg-primary-700 rounded transition"
              >
                Analysis
              </button>
              <button
                onClick={() => {
                  setShowDashboard(!showDashboard);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-primary-700 rounded transition"
              >
                Dashboard
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Understand Your Emotions Through Voice
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Advanced AI-powered system that analyzes your voice to detect emotional states and assess mental health risk.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollToSection('analysis')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </button>
            <button
              onClick={() => setShowDashboard(true)}
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              View Insights
            </button>
          </div>
        </section>

        {/* Analysis Section */}
        <section id="analysis" className="mb-12">
          <div className="flex justify-center">
            <div className="w-full lg:w-1/2">
              <AudioUpload />
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        {showDashboard && (
          <section className="mb-12 animate-slideUp">
            <button
              onClick={() => setShowDashboard(false)}
              className="mb-4 text-secondary-600 hover:text-secondary-700 font-semibold"
            >
              ← Hide Dashboard
            </button>
            <EmotionalDashboard />
          </section>
        )}

        {/* Info Section */}
        <section className="mt-12 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-primary-600 hover:shadow-lg transition">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Voice Analysis
              </h3>
              <p className="text-gray-600">
                Advanced audio processing to detect emotions from voice tone, pitch, and speech patterns.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-purple-600 hover:shadow-lg transition">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Risk Assessment
              </h3>
              <p className="text-gray-600">
                Comprehensive mental health risk scoring to identify when support is needed.
              </p>
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="bg-blue-50 rounded-xl p-8 border-l-4 border-blue-500 mb-12">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            Mental Health Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div>
              <p className="font-semibold mb-2">🆘 Crisis Support</p>
              <ul className="space-y-1 text-sm">
                <li>
                  • National Suicide Prevention Lifeline: <strong>988</strong>
                </li>
                <li>
                  • Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong>
                </li>
                <li>
                  • International Association for Suicide Prevention:{' '}
                  <a
                    href="https://www.iasp.info/resources/Crisis_Centres/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Resources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">🏥 Professional Help</p>
              <ul className="space-y-1 text-sm">
                <li>
                  • Psychology Today:{' '}
                  <a
                    href="https://www.psychologytoday.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Find Therapist
                  </a>
                </li>
                <li>
                  • BetterHelp Online Therapy:{' '}
                  <a
                    href="https://www.betterhelp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Site
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>
            © 2024 Mental Health AI. All rights reserved. Data is processed securely and privately.
          </p>
          <p className="mt-2 text-sm">
            ⚠️ This tool is not a substitute for professional medical advice. If you're in crisis,
            please reach out to a mental health professional or crisis helpline immediately.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
