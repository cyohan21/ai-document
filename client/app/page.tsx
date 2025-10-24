"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to API key page on first visit
    router.push('/api-key');
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/30"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900">Document AI</span>
          </div>
          <div className="flex items-center gap-8 text-gray-700 text-base">
            <button className="flex items-center gap-1 hover:text-gray-900">
              Enterprise
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-900">
              Developers
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <a className="hover:text-gray-900">Pricing</a>
            <button className="flex items-center gap-1 hover:text-gray-900">
              Resources
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <a className="hover:text-gray-900">About</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500">Personal account</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-30 pb-70 text-center flex flex-col justify-center min-h-[calc(100vh-80px)]">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-200 hover:scale-[1.02] hover:border-purple-500 duration-500 rounded-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              <span className="text-purple-700 font-semibold text-sm">New feature</span>
            </div>
            <span className="text-gray-700 text-sm">Check out the team dashboard</span>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <h1 className="pt-10 pb-10 text-7xl font-semibold text-gray-900 mb-6 leading-tight tracking-tight">
          AI for your docs.
        </h1>

        <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
          AI-powered document analysis at your fingertips.<br />
          Upload any document and ask questions to instantly extract insights, summaries, and answers.
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/upload"
            className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 duration-600 font-semibold"
          >
            Continue
          </a>
          <a href="/dashboard" className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-transparent rounded-lg hover:border-gray-300 duration-300 font-semibold text-gray-700">
            Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
