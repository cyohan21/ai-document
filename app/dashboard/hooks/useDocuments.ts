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
}

export function useDocuments() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState<string | null>(null);

  useEffect(() => {
    const documentsStr = localStorage.getItem("documents");
    if (documentsStr) {
      setDocuments(JSON.parse(documentsStr));
    }
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

      // Extract text from PDF
      const extractResponse = await fetch('/api/extract-pdf', {
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
      localStorage.setItem("extractedTextPath", extractResult.data.textFilePath);
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

  const handleDeleteDocument = (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    const updatedDocuments = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocuments);
    localStorage.setItem("documents", JSON.stringify(updatedDocuments));
    setOpenMenuIndex(null);
  };

  const handleEditDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // Set this document as the current one
    localStorage.setItem("currentDocumentId", doc.id);
    localStorage.setItem("uploadedPDFName", doc.title);

    // Navigate to preview page
    router.push("/preview");
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
