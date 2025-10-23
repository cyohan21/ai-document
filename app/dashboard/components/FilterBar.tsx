import { styles } from '../styles/dashboard.styles';

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
    <div style={styles.filterSection}>
      <button
        onClick={() => setActiveTab("completed")}
        style={styles.filterButton}
        className={
          activeTab === "completed"
            ? "bg-green-50 text-green-600"
            : "text-gray-600 hover:bg-gray-100"
        }
      >
        <svg style={styles.filterIcon} fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
        Completed
        <span className="text-sm">{completedCount}</span>
      </button>
      <button
        onClick={() => setActiveTab("draft")}
        style={styles.filterButton}
        className={
          activeTab === "draft"
            ? "bg-yellow-50 text-yellow-600"
            : "text-gray-600 hover:bg-gray-100"
        }
      >
        <svg style={styles.filterIcon} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
        </svg>
        Draft
        <span className="text-sm">{draftCount}</span>
      </button>
      <button
        onClick={() => setActiveTab("all")}
        style={styles.filterButton}
        className={
          activeTab === "all"
            ? "bg-purple-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }
      >
        All
      </button>
      <div style={styles.filterControls}>
        <select style={styles.select} className="focus:outline-none focus:border-gray-300">
          <option>Sender: All</option>
        </select>
        <select style={styles.select} className="focus:outline-none focus:border-gray-300">
          <option>All Time</option>
        </select>
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          className="focus:outline-none focus:border-gray-300"
        />
      </div>
    </div>
  );
}
