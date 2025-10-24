import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface Document {
  id: string;
  title: string;
  sender: string;
  recipient: string;
  date: string;
  status: "Draft" | "Completed";
  pdfUrl: string;
  signatures: any[];
  textFileName?: string;
}

export function useDocuments() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null);

  useEffect(() => {
    const loadDocumentsFromServer = async () => {
      try {
        // Fetch available PDFs from server
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/pdf/list`);

        if (!response.ok) {
          console.error('Failed to fetch PDF list from server');
          setDocuments([]);
          return;
        }

        const result = await response.json();
        console.log("Server response:", result);

        // Convert server PDFs to Document format
        const docs: Document[] = result.data.map((pdf: any) => {
          // Extract original name from filename (remove timestamp)
          // Format: "filename-timestamp.pdf"
          const match = pdf.filename.match(/^(.+)-(\d+)\.pdf$/);
          const displayName = match ? match[1] + '.pdf' : pdf.filename;

          return {
            id: pdf.filename, // Use filename as unique ID
            title: displayName,
            sender: "Unknown",
            recipient: "N/A",
            date: new Date(pdf.created).toLocaleDateString(),
            status: "Completed" as const,
            pdfUrl: pdf.filename,
            signatures: [],
            textFileName: pdf.textFile, // Add text file name for AI chat
          };
        });

        console.log("Loaded documents from server:", docs);
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents from server:', error);
        setDocuments([]);
      }
    };

    loadDocumentsFromServer();
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
        alert("Failed to extract PDF content: " + (extractResult.error || "Unknown error"));
        return;
      }

      const documentsStr = localStorage.getItem("documents");
      const existingDocs = documentsStr ? JSON.parse(documentsStr) : [];

      // Get unique file name
      const uniqueFileName = getUniqueFileName(file.name, existingDocs);

      // Store extracted text info
      localStorage.setItem("extractedText", extractResult.data.textPreview);
      localStorage.setItem("extractedTextFileName", extractResult.data.textFileName);
      localStorage.setItem("uploadedPDFName", uniqueFileName);
      localStorage.setItem("uploadedPDFFileName", extractResult.data.pdfFileName);

      const newDocument: Document = {
        id: Date.now().toString(),
        title: uniqueFileName,
        sender: "John Doe",
        recipient: "N/A",
        date: new Date().toLocaleDateString(),
        status: "Extracted",
        pdfUrl: extractResult.data.pdfFileName,
        signatures: [],
      };

      existingDocs.push(newDocument);
      localStorage.setItem("documents", JSON.stringify(existingDocs));
      localStorage.setItem("currentDocumentId", newDocument.id);

      // Redirect to preview page
      router.push("/preview");
    } catch (error) {
      alert("Failed to upload file: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    // TODO: Implement server-side delete endpoint
    // For now, just remove from UI
    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    setOpenMenuIndex(null);

    alert("Note: Server-side delete not yet implemented. Document will reappear on refresh.");
  };

  const handleEditDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Extract the text filename from PDF filename
    // PDF: "filename-timestamp.pdf" -> Text: "filename-timestamp.txt"
    const textFileName = doc.pdfUrl.replace('.pdf', '.txt');

    // Load the text preview from server
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${API_URL}/api/pdf/text/${textFileName}`);
      if (response.ok) {
        const result = await response.json();
        const textPreview = result.data.content.substring(0, 500);

        // Store document info in localStorage for preview page
        localStorage.setItem("extractedText", textPreview);
        localStorage.setItem("extractedTextFileName", textFileName);
        localStorage.setItem("uploadedPDFName", doc.title);
        localStorage.setItem("uploadedPDFFileName", doc.pdfUrl);
        localStorage.setItem("currentDocumentId", doc.id);

        // Navigate to preview page
        router.push("/preview");
      } else {
        alert("Failed to load document text");
      }
    } catch (error) {
      console.error("Error loading document:", error);
      alert("Failed to load document");
    }
  };

  const completedCount = documents.filter(doc => doc.status === "Completed").length;
  const draftCount = documents.filter(doc => doc.status === "Draft").length;

  const filteredDocuments = documents.filter((doc) => {
    let matchesTab = true;
    if (activeTab === "completed") matchesTab = doc.status === "Completed";
    if (activeTab === "draft") matchesTab = doc.status === "Draft";

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        doc.title.toLowerCase().includes(query) ||
        doc.sender.toLowerCase().includes(query) ||
        doc.recipient.toLowerCase().includes(query);
    }

    return matchesTab && matchesSearch;
  });

  return {
    documents,
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
  };
}
