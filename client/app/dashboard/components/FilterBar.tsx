interface FilterBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  completedCount: number;
  draftCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function FilterBar({
  activeTab,
  setActiveTab,
  completedCount,
  draftCount,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  return (
    <div className="mb-4 sm:mb-6">
      {/* Filter Buttons - Hidden on mobile */}
      <div className="hidden sm:flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "completed"
              ? "bg-green-50 text-green-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
          </svg>
          Completed
          <span className="text-sm ml-1">({completedCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("draft")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "draft"
              ? "bg-yellow-50 text-yellow-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
          </svg>
          Draft
          <span className="text-sm ml-1">({draftCount})</span>
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "all"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All
        </button>
      </div>

      {/* Filter Controls - Hidden on mobile */}
      <div className="hidden sm:flex gap-3">
        <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
          <option>Sender: All</option>
        </select>
        <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
          <option>All Time</option>
        </select>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
