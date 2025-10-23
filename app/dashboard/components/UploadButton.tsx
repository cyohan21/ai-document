import { styles } from '../styles/dashboard.styles';

interface UploadButtonProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadButton({ onFileUpload }: UploadButtonProps) {
  return (
    <label style={styles.uploadButton} className="hover:bg-purple-700">
      <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      Upload Document
      <input type="file" accept=".pdf" onChange={onFileUpload} className="hidden" />
    </label>
  );
}
