"use client";

import { useState } from 'react';
import { styles } from './styles/dashboard.styles';
import { useDocuments, Document } from './hooks/useDocuments';
import Navigation from './components/Navigation';
import UploadButton from './components/UploadButton';
import FilterBar from './components/FilterBar';
import DocumentsTable from './components/DocumentsTable';
import Pagination from './components/Pagination';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const {
    filteredDocuments,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    openMenuIndex,
    setOpenMenuIndex,
    completedCount,
    draftCount,
    handleFileUpload,
    handleDeleteDocument,
    handleEditDocument,
  } = useDocuments();

  const handleChatWithAI = (doc: Document) => {
    setSelectedDocument(doc);
    setShowChatModal(true);
  };

  const navigateToChat = (mode: 'text' | 'voice') => {
    if (!selectedDocument) return;

    const params = new URLSearchParams({
      documentName: selectedDocument.title,
      textFileName: selectedDocument.textFileName || ''
    });

    router.push(`/test-${mode === 'text' ? 'text' : 'ai'}?${params.toString()}`);
  };

  return (
    <div style={styles.container}>
      <Navigation />

      <div style={styles.mainContent}>
        <div style={styles.headerSection}>
          <UploadButton onFileUpload={handleFileUpload} />
        </div>

        <div>
          <h2 style={styles.documentsTitle}>Documents</h2>

          <FilterBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            completedCount={completedCount}
            draftCount={draftCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <DocumentsTable
            documents={filteredDocuments}
            openMenuIndex={openMenuIndex}
            setOpenMenuIndex={setOpenMenuIndex}
            onDelete={handleDeleteDocument}
            onEdit={handleEditDocument}
            onChatWithAI={handleChatWithAI}
          />

          <Pagination totalResults={filteredDocuments.length} />
        </div>
      </div>

      {/* Chat Mode Selection Modal */}
      {showChatModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Chat with AI about</h2>
            <p className="text-gray-600 mb-6">{selectedDocument.title}</p>

            <p className="text-sm text-gray-500 mb-6">Choose how you'd like to interact:</p>

            <div className="space-y-3">
              <button
                onClick={() => navigateToChat('text')}
                className="w-full flex items-center gap-4 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Text Chat</h3>
                  <p className="text-sm text-gray-500">Type your questions</p>
                </div>
              </button>

              <button
                onClick={() => navigateToChat('voice')}
                className="w-full flex items-center gap-4 p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Voice Chat</h3>
                  <p className="text-sm text-gray-500">Speak naturally with AI</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowChatModal(false)}
              className="mt-6 w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
