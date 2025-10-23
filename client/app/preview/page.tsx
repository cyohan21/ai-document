"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Preview() {
  const router = useRouter();
  const [documentData, setDocumentData] = useState<{
    fileName: string;
    extractedText: string;
    textFileName: string;
    pdfFileName: string;
    numPages: number;
    textLength: number;
    wordCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocumentData = async () => {
      // Get the document data from localStorage
      const fileName = localStorage.getItem("uploadedPDFName");
      const extractedText = localStorage.getItem("extractedText");
      const textFileName = localStorage.getItem("extractedTextFileName");
      const pdfFileName = localStorage.getItem("uploadedPDFFileName");
      const currentDocumentId = localStorage.getItem("currentDocumentId");

      if (!fileName || !extractedText) {
        // No document data, redirect to upload
        router.push("/upload");
        return;
      }

      // Get additional document info
      const documentsStr = localStorage.getItem("documents");
      const documents = documentsStr ? JSON.parse(documentsStr) : [];
      const currentDoc = documents.find((doc: any) => doc.id === currentDocumentId);

      // Try to load full text from the backend server
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      let fullText = extractedText;
      if (textFileName) {
        try {
          const response = await fetch(`${API_URL}/api/pdf/text/${textFileName}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.content) {
              fullText = result.data.content;
            }
          } else if (response.status === 404) {
            // Text file not found on server - redirect to dashboard
            console.error("Text file not found on server, redirecting to dashboard");
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Failed to load full text:", error);
          // Fall back to preview text
        }
      }

      // Verify PDF exists on server
      if (pdfFileName) {
        try {
          const response = await fetch(`${API_URL}/api/pdf/view/${pdfFileName}`, {
            method: 'HEAD' // Just check if it exists without downloading
          });
          if (!response.ok) {
            console.error("PDF file not found on server, redirecting to dashboard");
            router.push("/dashboard");
            return;
          }
        } catch (error) {
          console.error("Failed to verify PDF exists:", error);
        }
      }

      // Calculate word count from full text
      const wordCount = fullText
        ? fullText.trim().split(/\s+/).filter(word => word.length > 0).length
        : 0;

      setDocumentData({
        fileName: fileName || "Unknown Document",
        extractedText: extractedText || "",
        textFileName: textFileName || "",
        pdfFileName: pdfFileName || currentDoc?.pdfFileName || "",
        numPages: currentDoc?.numPages || 0,
        textLength: currentDoc?.textLength || 0,
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
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/30"></div>
            </div>
            <span className="text-xl font-semibold text-gray-900">Document AI</span>
          </a>
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-semibold text-gray-900 mb-3">
                Document Preview
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Extracted text from your PDF document
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Open the PDF in a new window from backend server
                  if (documentData?.pdfFileName) {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    window.open(`${API_URL}/api/pdf/view/${documentData.pdfFileName}`, '_blank');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View PDF
              </button>
              <button
                onClick={() => router.push("/upload")}
                className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-700 transition-colors font-semibold"
              >
                Upload New
              </button>
            </div>
          </div>

          {/* Document Info Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{documentData.fileName}</h2>
                <p className="text-sm text-gray-600">PDF Document</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pages</p>
                <p className="text-2xl font-semibold text-purple-700">{documentData.numPages}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Words</p>
                <p className="text-2xl font-semibold text-purple-700">{documentData.wordCount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-2xl font-semibold text-green-600">✓ Extracted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Extracted Text Display */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
            <p className="text-sm text-gray-600 mt-1">
              Preview of the first 500 characters - Full text saved as: <code className="text-xs bg-gray-200 px-2 py-1 rounded">{documentData.textFileName}</code>
            </p>
          </div>
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-base">
                {documentData.extractedText}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/dashboard"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-sm"
          >
            Go to Dashboard
          </a>
          <button
            onClick={() => router.push("/upload")}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-700 transition-colors font-semibold"
          >
            Upload Another Document
          </button>
        </div>
      </main>
    </div>
  );
}
