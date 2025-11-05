import { useRef, useState } from 'react';

interface UploadButtonProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onYouTubeUpload: (url: string) => void;
}

export default function UploadButton({ onFileUpload, onYouTubeUpload }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePDFClick = () => {
    setShowModal(false);
    fileInputRef.current?.click();
  };

  const handleYouTubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }

    setIsProcessing(true);
    try {
      await onYouTubeUpload(youtubeUrl);
      setShowModal(false);
      setYoutubeUrl('');
    } catch (error) {
      console.error('Error processing YouTube URL:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-purple-700 transition-colors"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden xs:inline">Add Content</span>
        <span className="xs:hidden">Add</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={onFileUpload}
        className="hidden"
      />

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Add Content
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Choose how you want to add content
              </p>
            </div>

            {/* Options */}
            <div className="px-4 sm:px-5 pb-2">
              {/* PDF Upload Option */}
              <div className="pb-3 border-b border-gray-200">
                <button
                  onClick={handlePDFClick}
                  className="w-full text-left group py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 px-2 py-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm mb-1">
                        Upload PDF
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        Upload a PDF document from your device
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* YouTube URL Option */}
              <div className="pt-3 pb-3">
                <div className="flex items-start gap-3 px-2 py-1 mb-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm mb-1">
                      Add YouTube Video
                    </div>
                    <div className="text-xs text-gray-600 leading-relaxed mb-2">
                      Paste a YouTube URL to extract the transcript
                    </div>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isProcessing) {
                          handleYouTubeSubmit();
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-4 sm:px-5 py-3 sm:py-4 flex justify-end gap-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setYoutubeUrl('');
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleYouTubeSubmit}
                disabled={!youtubeUrl.trim() || isProcessing}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  youtubeUrl.trim() && !isProcessing
                    ? 'text-white bg-purple-600 hover:bg-purple-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Add YouTube Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
