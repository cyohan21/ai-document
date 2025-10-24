"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Preview() {
  const router = useRouter();
  const [documentData, setDocumentData] = useState<{
    fileName: string;
    extractedText: string;
    fullText: string;
    textFileName: string;
    pdfFileName: string;
    numPages: number;
    textLength: number;
    wordCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTextExpanded, setIsTextExpanded] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      // No API key found, redirect to API key page
      router.push('/api-key');
    }
  }, [router]);

  useEffect(() => {
    const loadDocumentData = async () => {
      // Get the current document from localStorage
      const currentDocumentId = localStorage.getItem("currentDocumentId");

      if (!currentDocumentId) {
        // No document selected, redirect to upload
        router.push("/upload");
        return;
      }

      // Get the document from the documents array
      const documentsStr = localStorage.getItem("documents");
      const documents = documentsStr ? JSON.parse(documentsStr) : [];
      const currentDoc = documents.find((doc: any) => doc.id === currentDocumentId);

      if (!currentDoc) {
        // Document not found, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      // Get full extracted text from the document
      const fullText = currentDoc.extractedText || "";
      const extractedText = fullText.substring(0, 500);

      // Calculate number of pages from PDF base64
      let numPages = 0;
      if (currentDoc.pdfBase64) {
        try {
          // Simple estimation: PDFs typically have ~2000 bytes per page
          const pdfSize = atob(currentDoc.pdfBase64).length;
          numPages = Math.max(1, Math.round(pdfSize / 2000));
        } catch (error) {
          console.error("Failed to estimate page count:", error);
          numPages = 1;
        }
      }

      // Calculate word count from full text
      const wordCount = fullText
        ? fullText.trim().split(/\s+/).filter((word: string) => word.length > 0).length
        : 0;

      setDocumentData({
        fileName: currentDoc.title || "Unknown Document",
        extractedText: extractedText,
        fullText: fullText,
        textFileName: "",
        pdfFileName: currentDoc.pdfBase64 || "",
        numPages: numPages,
        textLength: fullText.length,
        wordCount: wordCount,
      });
      setLoading(false);
    };

    loadDocumentData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between border-b border-gray-200">
        <a href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/30"></div>
          </div>
          <span className="text-lg sm:text-xl font-semibold text-gray-900">Document AI</span>
        </a>
        <div className="hidden sm:flex items-center gap-3">
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4">
            <h1 className="text-2xl sm:text-4xl font-semibold text-gray-900 mb-2 sm:mb-3">
              Document Preview
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">
              Extracted text from your PDF document
            </p>

            {/* Action Buttons - Stack on mobile */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <a
                href="/dashboard"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-center text-sm sm:text-base"
              >
                Go to Dashboard
              </a>
              <button
                onClick={() => {
                  // Open the PDF in a new window from base64
                  if (documentData?.pdfFileName) {
                    const pdfBlob = new Blob(
                      [Uint8Array.from(atob(documentData.pdfFileName), c => c.charCodeAt(0))],
                      { type: 'application/pdf' }
                    );
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    window.open(pdfUrl, '_blank');
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View PDF
              </button>
            </div>
          </div>

          {/* Document Info Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{documentData.fileName}</h2>
                <p className="text-xs sm:text-sm text-gray-600">PDF Document</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-purple-200">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Pages</p>
                <p className="text-lg sm:text-2xl font-semibold text-purple-700">{documentData.numPages}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Words</p>
                <p className="text-lg sm:text-2xl font-semibold text-purple-700">{documentData.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
                <p className="text-lg sm:text-2xl font-semibold text-green-600">✓</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Text Display */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div
            className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setIsTextExpanded(!isTextExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Extracted Text</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {isTextExpanded
                    ? `Full text (${documentData.textLength.toLocaleString()} characters)`
                    : `Tap to expand - Preview`}
                </p>
              </div>
              <div className="shrink-0">
                <svg
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 transition-transform ${isTextExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-8">
            <div className="prose prose-sm sm:prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-sm sm:text-base">
                {isTextExpanded ? documentData.fullText : documentData.extractedText}
              </div>
            </div>
            {!isTextExpanded && (
              <div className="mt-4 sm:mt-6 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTextExpanded(true);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Show More</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
            {isTextExpanded && (
              <div className="mt-4 sm:mt-6 text-center border-t border-gray-200 pt-4 sm:pt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTextExpanded(false);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-sm inline-flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Show Less</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

    </div>
  );
}
