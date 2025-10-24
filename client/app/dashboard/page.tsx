"use client";

import { useState, useEffect } from 'react';
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

  // Check for API key on mount
  useEffect(() => {
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      // No API key found, redirect to API key page
      router.push('/api-key');
    }
  }, [router]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChatMode, setSelectedChatMode] = useState<'text' | 'voice' | null>(null);

  const {
    filteredDocuments,
    documents,
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

  const handleRowClick = (doc: Document) => {
    setSelectedDocument(doc);
    setSelectedChatMode(null);
    setShowChatModal(true);
  };

  const navigateToChat = () => {
    if (!selectedDocument || !selectedChatMode) return;

    setShowChatModal(false);

    // Store full extracted text for AI to access
    if (selectedDocument.extractedText) {
      localStorage.setItem('currentDocumentText', selectedDocument.extractedText);
    }

    const params = new URLSearchParams({
      documentName: selectedDocument.title
    });

    // ai-chat = text chat (ChatGPT), ai-voice = voice chat
    router.push(`/${selectedChatMode === 'text' ? 'ai-chat' : 'ai-voice'}?${params.toString()}`);
  };

  return (
    <div style={styles.container}>
      <Navigation />

      <div style={styles.mainContent}>
        {/* AI Chat Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-100 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">Chat with AI Assistant</h3>
            <p className="text-sm text-gray-600">Ask questions about your documents</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Document Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Document</label>
              <select
                value={selectedDocument?.id || ''}
                onChange={(e) => {
                  const doc = documents.find(d => d.id === e.target.value);
                  setSelectedDocument(doc || null);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">Choose a document...</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sm:items-end">
              <button
                onClick={() => {
                  if (!selectedDocument) return;
                  setSelectedChatMode('text');
                  navigateToChat();
                }}
                disabled={!selectedDocument}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Text Chat
              </button>
              <button
                onClick={() => {
                  if (!selectedDocument) return;
                  setSelectedChatMode('voice');
                  navigateToChat();
                }}
                disabled={!selectedDocument}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Chat
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 style={styles.documentsTitle}>Documents</h2>
            <UploadButton onFileUpload={handleFileUpload} />
          </div>

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
            onRowClick={handleRowClick}
          />

          <Pagination totalResults={filteredDocuments.length} />
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedDocument && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setShowChatModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full mx-4"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              backdropFilter: 'blur(10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-normal text-gray-900">
                Chat with AI about "{selectedDocument.title}"
              </h2>
            </div>

            {/* Options */}
            <div className="px-5 pb-2">
              {/* Text Chat Option */}
              <div className="pb-3 border-b border-gray-200">
                <button
                  onClick={() => setSelectedChatMode('text')}
                  className={`w-full text-left group py-1 rounded-lg transition-colors ${
                    selectedChatMode === 'text' ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 px-2 py-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedChatMode === 'text' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-3.5 h-3.5 ${
                          selectedChatMode === 'text' ? 'text-purple-600' : 'text-gray-700'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm mb-0.5 group-hover:text-gray-700">
                        Text Chat
                      </div>
                      <div className="text-xs text-gray-600 leading-normal">
                        Have a conversation via text messages with the AI assistant.
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Voice Chat Option */}
              <div className="pt-3 pb-3 border-b border-gray-200">
                <button
                  onClick={() => setSelectedChatMode('voice')}
                  className={`w-full text-left group py-1 rounded-lg transition-colors ${
                    selectedChatMode === 'voice' ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3 px-2 py-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedChatMode === 'voice' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <svg className={`w-3.5 h-3.5 ${
                          selectedChatMode === 'voice' ? 'text-blue-600' : 'text-gray-700'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm mb-0.5 group-hover:text-gray-700">
                        Voice Chat
                      </div>
                      <div className="text-xs text-gray-600 leading-normal">
                        Speak naturally with real-time audio conversation.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-4 flex justify-end gap-2">
              <button
                onClick={() => setShowChatModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Not now
              </button>
              <button
                onClick={navigateToChat}
                disabled={!selectedChatMode}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedChatMode
                    ? 'text-white bg-black hover:bg-gray-800'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
