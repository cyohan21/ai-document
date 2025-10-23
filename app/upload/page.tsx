"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { styles } from './styles/upload.styles';

export default function Upload() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file only");
      return;
    }

    // Clear any previous errors
    setError("");

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError("Failed to upload file");
        return;
      }

      // Store file URL instead of base64
      localStorage.setItem("uploadedPDF", result.fileUrl);
      localStorage.setItem("uploadedPDFName", file.name);

      // Store in documents list for dashboard
      const documentsStr = localStorage.getItem("documents");
      const documents = documentsStr ? JSON.parse(documentsStr) : [];

      const newDocument = {
        id: Date.now().toString(),
        title: file.name,
        sender: "John Doe",
        recipient: "N/A",
        date: new Date().toLocaleDateString(),
        status: "Draft",
        pdfUrl: result.fileUrl,
        signatures: [],
      };

      documents.push(newDocument);
      localStorage.setItem("documents", JSON.stringify(documents));
      localStorage.setItem("currentDocumentId", newDocument.id);

      // Redirect to sign page
      router.push("/sign");
    } catch (error) {
      setError("Failed to upload file");
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <a href="/" style={styles.logo}>
          <div style={styles.logoIcon}>
            <div style={styles.logoIconInner}></div>
          </div>
          <span style={styles.logoText}>Document AI</span>
        </a>
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            <svg style={styles.userIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>John Doe</div>
            <div style={styles.userAccount}>Personal account</div>
          </div>
        </div>
      </nav>

      {/* Upload Section */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>
          Upload your document
        </h1>
        <p style={styles.description}>
          Choose a PDF file to sign and get started
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.uploadContainer}>
          <label style={styles.uploadLabel}>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <div style={styles.dropZone} className="hover:border-purple-500 hover:from-purple-100 hover:to-purple-200 group">
              <div style={styles.dropZoneContent}>
                <div style={styles.uploadIconContainer} className="group-hover:bg-purple-700">
                  <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div style={styles.uploadTextContainer}>
                  <p style={styles.uploadTitle}>Click to upload PDF</p>
                  <p style={styles.uploadSubtitle}>or drag and drop your file here</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </main>
    </div>
  );
}
