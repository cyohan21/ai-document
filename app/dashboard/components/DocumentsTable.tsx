import { Document } from '../hooks/useDocuments';
import { styles } from '../styles/dashboard.styles';

interface DocumentsTableProps {
  documents: Document[];
  openMenuIndex: string | null;
  setOpenMenuIndex: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function DocumentsTable({
  documents,
  openMenuIndex,
  setOpenMenuIndex,
  onDelete,
  onEdit,
}: DocumentsTableProps) {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead style={styles.tableHead}>
          <tr>
            <th style={styles.tableHeader}>Created</th>
            <th style={styles.tableHeader}>Title</th>
            <th style={styles.tableHeader}>Sender</th>
            <th style={styles.tableHeader}>Recipient</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td style={{ ...styles.tableCell, color: 'rgb(75, 85, 99)' }}>{doc.date}</td>
              <td style={{ ...styles.tableCell, color: 'rgb(17, 24, 39)', fontWeight: 500 }}>{doc.title}</td>
              <td style={{ ...styles.tableCell, color: 'rgb(75, 85, 99)' }}>{doc.sender}</td>
              <td style={{ ...styles.tableCell, color: 'rgb(75, 85, 99)' }}>{doc.recipient}</td>
              <td style={styles.tableCell}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(doc.id)}
                    style={styles.editButton}
                    className="hover:bg-purple-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuIndex(openMenuIndex === doc.id ? null : doc.id)}
                      style={styles.menuButton}
                      className="hover:bg-gray-100"
                    >
                      <svg style={styles.menuIcon} fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="12" cy="19" r="2"/>
                      </svg>
                    </button>
                    {openMenuIndex === doc.id && (
                      <div style={styles.dropdown}>
                        <button style={styles.dropdownButton} className="hover:bg-gray-50 text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button style={{ ...styles.dropdownButton, borderTop: '1px solid rgb(243, 244, 246)' }} className="hover:bg-gray-50 text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send via Email
                        </button>
                        <button
                          onClick={() => onDelete(doc.id)}
                          style={{ ...styles.dropdownButton, borderTop: '1px solid rgb(243, 244, 246)', color: 'rgb(220, 38, 38)' }}
                          className="hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
