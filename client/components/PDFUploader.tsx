'use client';

import { useState } from 'react';

interface ExtractionResult {
  pdfFileName: string;
  textFileName: string;
  numPages: number;
  textPreview: string;
  textLength: number;
  info?: any;
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract PDF');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        PDF Text Extractor
      </h2>

      <div className="space-y-4">
        {/* File Input */}
        <div>
          <label
            htmlFor="pdf-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select PDF File
          </label>
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              cursor-pointer"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg
            hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            font-semibold transition-colors"
        >
          {loading ? 'Extracting...' : 'Extract Text'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Result */}
        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold text-green-900">
              Extraction Successful!
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Pages:</strong> {result.numPages}
              </p>
              <p>
                <strong>Text Length:</strong> {result.textLength.toLocaleString()} characters
              </p>
              <p>
                <strong>PDF File:</strong> {result.pdfFileName}
              </p>
              <p>
                <strong>Text File:</strong> {result.textFileName}
              </p>
              <div className="mt-4">
                <strong className="block mb-2">Preview (first 500 characters):</strong>
                <div className="p-3 bg-white border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {result.textPreview}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
