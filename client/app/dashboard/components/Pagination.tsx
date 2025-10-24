interface PaginationProps {
  totalResults: number;
}

export default function Pagination({ totalResults }: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-3 sm:mt-4">
      <div className="text-xs sm:text-sm text-gray-600">
        Showing {totalResults} results
      </div>
      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Rows per page</span>
          <select className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Page 1 of 1</span>
          <div className="flex gap-0.5 sm:gap-1">
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
