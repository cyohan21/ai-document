import { styles } from '../styles/dashboard.styles';

interface PaginationProps {
  totalResults: number;
}

export default function Pagination({ totalResults }: PaginationProps) {
  return (
    <div style={styles.paginationContainer}>
      <div style={styles.paginationText}>
        Showing {totalResults} results.
      </div>
      <div style={styles.paginationControls}>
        <div className="flex items-center gap-2">
          <span style={styles.paginationText}>Rows per page</span>
          <select style={styles.select}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span style={styles.paginationText}>Page 1 of 1</span>
          <div className="flex gap-1">
            <button style={styles.paginationButton} className="hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button style={styles.paginationButton} className="hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button style={styles.paginationButton} className="hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button style={styles.paginationButton} className="hover:bg-gray-100">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
