"use client";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-10 min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30"></div>
            </div>
            <span className="text-base sm:text-xl font-semibold text-gray-900">Document AI</span>
          </div>
          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-gray-700 text-sm xl:text-base">
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
        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-semibold text-gray-900">John Doe</div>
              <div className="text-xs text-gray-500">Personal account</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20 text-center flex flex-col justify-center min-h-[calc(100vh-80px)]">
        {/* Badge */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-purple-50 border border-purple-200 hover:scale-[1.02] hover:border-purple-500 duration-500 rounded-full">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              <span className="text-purple-700 font-semibold text-xs sm:text-sm">New feature</span>
            </div>
            <span className="text-gray-700 text-xs sm:text-sm hidden xs:inline">Check out the team dashboard</span>
            <span className="text-gray-700 text-xs sm:text-sm xs:hidden">Team dashboard</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="pt-4 sm:pt-10 pb-4 sm:pb-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
          AI for your docs.
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
          AI-powered document analysis at your fingertips.
          <span className="hidden sm:inline"><br /></span>
          <span className="sm:hidden"> </span>
          Upload any document and ask questions to instantly extract insights, summaries, and answers.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col xs:flex-row items-center justify-center gap-2 sm:gap-3">
          <a
            href="/upload"
            className="w-full xs:w-auto px-5 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 duration-600 font-semibold text-sm sm:text-base text-center"
          >
            Continue
          </a>
          <a
            href="/dashboard"
            className="w-full xs:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-white border-2 border-transparent rounded-lg hover:border-gray-300 duration-300 font-semibold text-gray-700 text-sm sm:text-base"
          >
            Dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
