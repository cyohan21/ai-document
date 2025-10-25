import { useRef } from 'react';

interface UploadButtonProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadButton({ onFileUpload }: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-3 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold text-sm sm:text-base flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-purple-700 transition-colors"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="hidden xs:inline">Upload Document</span>
        <span className="xs:hidden">Upload</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={onFileUpload}
        className="hidden"
      />
    </>
  );
}
