import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface Document {
  id: string;
  title: string;
  type: "pdf" | "youtube"; // Content type
  sender: string;
  recipient: string;
  date: string;
  status: "Draft" | "Completed";
  pdfUrl: string; // base64 encoded PDF (only for PDF type)
  pdfBase64: string; // Store base64 for easy access (only for PDF type)
  extractedText: string; // Full extracted text (for both PDF and YouTube)
  signatures: any[];
  textFileName?: string; // For compatibility
  // YouTube-specific fields
  youtubeUrl?: string;
  channelName?: string;
  duration?: number; // in seconds
  uploadDate?: string;
}

export function useDocuments() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null);

  useEffect(() => {
    const loadDocumentsFromLocalStorage = () => {
      try {
        const storedDocs = localStorage.getItem('documents');
        if (storedDocs) {
          const docs: Document[] = JSON.parse(storedDocs);
          console.log("Loaded documents from localStorage:", docs);
          setDocuments(docs);
        } else {
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error loading documents from localStorage:', error);
        setDocuments([]);
      }
    };

    loadDocumentsFromLocalStorage();
  }, []);

  const getUniqueFileName = (fileName: string, existingDocs: Document[]): string => {
    const existingNames = existingDocs.map(doc => doc.title);

    if (!existingNames.includes(fileName)) {
      return fileName;
    }

    // Extract file name and extension
    const lastDotIndex = fileName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';

    let counter = 1;
    let newName = `${baseName} (${counter})${extension}`;

    while (existingNames.includes(newName)) {
      counter++;
      newName = `${baseName} (${counter})${extension}`;
    }

    return newName;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only");
      return;
    }

    try {
      // Read PDF file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Convert to base64 for storage
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Send to backend for text extraction only
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      console.log('Extracting from:', `${API_URL}/api/pdf/extract`);

      const extractResponse = await fetch(`${API_URL}/api/pdf/extract`, {
        method: 'POST',
        body: formData,
      });

      console.log('Extract response status:', extractResponse.status);

      let extractedText = '';

      if (extractResponse.ok) {
        const extractResult = await extractResponse.json();
        if (extractResult.success && extractResult.data.text) {
          extractedText = extractResult.data.text;
        } else {
          extractedText = `[PDF uploaded: ${file.name}]\n\nText extraction failed, but the PDF has been saved and can be viewed.`;
        }
      } else {
        const errorText = await extractResponse.text();
        console.error('Text extraction failed:', errorText);
        extractedText = `[PDF uploaded: ${file.name}]\n\nText extraction is currently unavailable. The PDF has been saved and can be viewed.`;
      }

      const documentsStr = localStorage.getItem("documents");
      const existingDocs = documentsStr ? JSON.parse(documentsStr) : [];

      // Get unique file name
      const uniqueFileName = getUniqueFileName(file.name, existingDocs);

      const newDocument: Document = {
        id: Date.now().toString(),
        title: uniqueFileName,
        type: "pdf",
        sender: "Unknown",
        recipient: "N/A",
        date: new Date().toLocaleDateString(),
        status: "Completed",
        pdfUrl: base64, // Store base64 directly
        pdfBase64: base64,
        extractedText: extractedText,
        signatures: [],
      };

      existingDocs.push(newDocument);
      localStorage.setItem("documents", JSON.stringify(existingDocs));

      // Store for preview page compatibility
      localStorage.setItem("extractedText", extractedText.substring(0, 500));
      localStorage.setItem("uploadedPDFName", uniqueFileName);
      localStorage.setItem("currentDocumentId", newDocument.id);

      // Update state
      setDocuments(existingDocs);

      // Redirect to preview page
      router.push("/preview");
    } catch (error) {
      console.error('Upload error:', error);
      alert("Failed to upload file: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    // Remove from localStorage
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    localStorage.setItem("documents", JSON.stringify(updatedDocuments));
    setDocuments(updatedDocuments);
    setOpenMenuIndex(null);
  };

  const handleEditDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    try {
      // Store document info in localStorage for preview page
      const textPreview = doc.extractedText.substring(0, 500);
      localStorage.setItem("extractedText", textPreview);
      localStorage.setItem("uploadedPDFName", doc.title);
      localStorage.setItem("currentDocumentId", doc.id);

      // Navigate to preview page
      router.push("/preview");
    } catch (error) {
      console.error("Error loading document:", error);
      alert("Failed to load document");
    }
  };

  const handleYouTubeUpload = async (url: string) => {
    if (!url.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      console.log('Processing YouTube URL:', `${API_URL}/api/youtube/process`);

      const response = await fetch(`${API_URL}/api/youtube/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to process YouTube video');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to process YouTube video');
      }

      const documentsStr = localStorage.getItem("documents");
      const existingDocs = documentsStr ? JSON.parse(documentsStr) : [];

      // Get unique file name
      const uniqueTitle = getUniqueFileName(result.data.metadata.title, existingDocs);

      const newDocument: Document = {
        id: Date.now().toString(),
        title: uniqueTitle,
        type: "youtube",
        sender: result.data.metadata.channelName,
        recipient: "N/A",
        date: new Date().toLocaleDateString(),
        status: "Completed",
        pdfUrl: "", // Empty for YouTube
        pdfBase64: "", // Empty for YouTube
        extractedText: result.data.transcript,
        signatures: [],
        youtubeUrl: url,
        channelName: result.data.metadata.channelName,
        duration: result.data.metadata.duration,
        uploadDate: result.data.metadata.uploadDate,
      };

      existingDocs.push(newDocument);
      localStorage.setItem("documents", JSON.stringify(existingDocs));

      // Store for preview page compatibility
      localStorage.setItem("extractedText", result.data.transcript.substring(0, 500));
      localStorage.setItem("uploadedPDFName", uniqueTitle);
      localStorage.setItem("currentDocumentId", newDocument.id);

      // Update state
      setDocuments(existingDocs);

      // Redirect to preview page
      router.push("/preview");
    } catch (error) {
      console.error('YouTube upload error:', error);

      // Provide user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes('duration') || errorMessage.includes('exceeds') || errorMessage.includes('too long')) {
        alert("Video is too long. Videos must be less than 30 minutes.");
      } else if (errorMessage.includes('No transcript')) {
        alert("No transcript available for this video.");
      } else if (errorMessage.includes('Invalid YouTube URL')) {
        alert("Invalid YouTube URL. Please check the URL and try again.");
      } else {
        alert("Failed to process YouTube video. Please try again.");
      }
    }
  };

  return {
    documents,
    openMenuIndex,
    setOpenMenuIndex,
    handleFileUpload,
    handleYouTubeUpload,
    handleDeleteDocument,
    handleEditDocument,
  };
}
