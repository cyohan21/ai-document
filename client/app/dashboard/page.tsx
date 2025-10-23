"use client";

import { styles } from './styles/dashboard.styles';
import { useDocuments } from './hooks/useDocuments';
import Navigation from './components/Navigation';
import UploadButton from './components/UploadButton';
import FilterBar from './components/FilterBar';
import DocumentsTable from './components/DocumentsTable';
import Pagination from './components/Pagination';

export default function Dashboard() {
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
          />

          <Pagination totalResults={filteredDocuments.length} />
        </div>
      </div>
    </div>
  );
}
