export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30"></div>
          </div>
          <span className="text-lg sm:text-xl font-bold text-gray-900">Document AI</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-gray-900">John Doe</div>
            <div className="text-xs text-gray-500">Personal Account</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
