"use client";

import { useState, useEffect } from 'react';
import { useDocuments, Document } from './hooks/useDocuments';
import Navigation from './components/Navigation';
import UploadButton from './components/UploadButton';
import DocumentsTable from './components/DocumentsTable';
import Pagination from './components/Pagination';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  // Check for API key on mount
  useEffect(() => {
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      // No API key found, redirect to API key page
      router.push('/api-key');
    }
  }, [router]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const {
    documents,
    openMenuIndex,
    setOpenMenuIndex,
    handleFileUpload,
    handleYouTubeUpload,
    handleDeleteDocument,
    handleEditDocument,
  } = useDocuments();

  const handleRowClick = (doc: Document) => {
    setSelectedDocument(doc);
    // Automatically navigate to text chat
    navigateToTextChat(doc);
  };

  const navigateToTextChat = (doc: Document) => {
    // Store full extracted text and document ID for AI to access
    if (doc.extractedText) {
      localStorage.setItem('currentDocumentText', doc.extractedText);
      console.log('[Dashboard] Stored document text for chat:', doc.extractedText.substring(0, 100) + '...');
    } else {
      console.warn('[Dashboard] No extracted text found for document:', doc.title);
    }

    localStorage.setItem('currentDocumentId', doc.id);
    console.log('[Dashboard] Stored document ID:', doc.id);
    console.log('[Dashboard] Document type:', doc.type);
    console.log('[Dashboard] Full document:', JSON.stringify(doc, null, 2).substring(0, 500));

    const params = new URLSearchParams({
      documentName: doc.title
    });

    // Navigate to text chat
    router.push(`/ai-chat?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* AI Chat Section */}
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-100 shadow-sm">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Chat with AI Assistant</h3>
            <p className="text-xs sm:text-sm text-gray-600">Ask questions about your documents</p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Content Selector */}
            <div className="flex-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Select Content</label>
              <select
                value={selectedDocument?.id || ''}
                onChange={(e) => {
                  const doc = documents.find(d => d.id === e.target.value);
                  setSelectedDocument(doc || null);
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">Choose content...</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>

            {/* Action Button */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (!selectedDocument) return;
                  navigateToTextChat(selectedDocument);
                }}
                disabled={!selectedDocument}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                Chat with AI
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Content</h2>
            <UploadButton onFileUpload={handleFileUpload} onYouTubeUpload={handleYouTubeUpload} />
          </div>

          <DocumentsTable
            documents={documents}
            openMenuIndex={openMenuIndex}
            setOpenMenuIndex={setOpenMenuIndex}
            onDelete={handleDeleteDocument}
            onEdit={handleEditDocument}
            onRowClick={handleRowClick}
          />

          <Pagination totalResults={documents.length} />
        </div>
      </div>
    </div>
  );
}
