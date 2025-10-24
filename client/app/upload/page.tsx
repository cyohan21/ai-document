"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { styles } from './styles/upload.styles';

export default function Upload() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    const apiKey = sessionStorage.getItem('openai_api_key');
    if (!apiKey) {
      // No API key found, redirect to API key page
      router.push('/api-key');
    }
  }, [router]);

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
    setLoading(true);

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      // Extract text from PDF using backend server
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const extractResponse = await fetch(`${API_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      const extractResult = await extractResponse.json();

      if (!extractResult.success) {
        setError("Failed to extract PDF content: " + (extractResult.error || "Unknown error"));
        setLoading(false);
        return;
      }

      console.log("Extract result:", extractResult);

      // Store extracted text info
      localStorage.setItem("extractedText", extractResult.data.textPreview);
      localStorage.setItem("extractedTextFileName", extractResult.data.textFileName);
      localStorage.setItem("uploadedPDFName", file.name);
      localStorage.setItem("uploadedPDFFileName", extractResult.data.pdfFileName);

      // Store in documents list for dashboard
      const documentsStr = localStorage.getItem("documents");
      const documents = documentsStr ? JSON.parse(documentsStr) : [];

      const newDocument = {
        id: Date.now().toString(),
        title: file.name,
        sender: "John Doe",
        recipient: "N/A",
        date: new Date().toLocaleDateString(),
        status: "Extracted",
        textPath: extractResult.data.textFileName,
        pdfFileName: extractResult.data.pdfFileName,
        numPages: extractResult.data.numPages,
        textLength: extractResult.data.textLength,
      };

      documents.push(newDocument);
      localStorage.setItem("documents", JSON.stringify(documents));
      localStorage.setItem("currentDocumentId", newDocument.id);

      // Redirect to preview page
      router.push("/preview");
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file: " + (error instanceof Error ? error.message : "Unknown error"));
      setLoading(false);
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
          Choose a PDF file to analyze and extract content
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#9333ea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>Extracting text from PDF...</p>
          </div>
        )}

        {!loading && (
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
        )}
      </main>
    </div>
  );
}
