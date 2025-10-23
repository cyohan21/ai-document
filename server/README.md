# PDF Document Server

This is the backend server for the AI Document application. It handles PDF upload, extraction, storage, and serving.

## Features

- **PDF Upload & Storage**: Accepts PDF files and stores them in `storage/pdfs/`
- **Text Extraction**: Extracts text content from PDFs and saves to `storage/texts/`
- **PDF Viewing**: Serves PDF files for viewing in browser
- **Text Retrieval**: Serves extracted text content

## Setup

### Installation

```bash
npm install
```

This will install the following dependencies:
- `express` - Web framework
- `cors` - CORS middleware
- `multer` - File upload handling
- `pdf-parse` - PDF text extraction
- `typescript` - TypeScript support

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Upload PDF
**POST** `/api/pdf/upload`

Upload a PDF file and extract its text content.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing PDF

**Response:**
```json
{
  "success": true,
  "message": "PDF extracted successfully",
  "data": {
    "pdfFileName": "document-1234567890.pdf",
    "textFileName": "document-1234567890.txt",
    "numPages": 10,
    "textPreview": "First 500 characters...",
    "textLength": 5000,
    "info": { /* PDF metadata */ }
  }
}
```

### 2. View PDF
**GET** `/api/pdf/view/:filename`

View a PDF file in the browser.

**Parameters:**
- `filename` - The PDF filename (e.g., "document-1234567890.pdf")

**Response:**
- Content-Type: `application/pdf`
- Returns the PDF file for inline viewing

### 3. Get Extracted Text
**GET** `/api/pdf/text/:filename`

Get the extracted text content.

**Parameters:**
- `filename` - The text filename (e.g., "document-1234567890.txt")
- `download` (optional) - Set to "true" to view as plain text

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "filename": "document-1234567890.txt",
    "content": "Full extracted text...",
    "length": 5000
  }
}
```

**Response (Plain Text - when download=true):**
- Content-Type: `text/plain; charset=utf-8`
- Returns the raw text content

### 4. List PDFs
**GET** `/api/pdf/list`

Get a list of all uploaded PDFs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "document-1234567890.pdf",
      "size": 1024000,
      "created": "2025-01-15T10:30:00.000Z",
      "modified": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

## Storage Structure

```
server/
├── src/
│   ├── index.ts              # Main server file
│   ├── routes/
│   │   └── pdf.routes.ts     # PDF API routes
│   └── utils/
│       └── pdf-extractor.ts  # PDF extraction utility
└── storage/                  # Created automatically
    ├── pdfs/                 # Uploaded PDF files
    └── texts/                # Extracted text files
```

## Client Integration

The Next.js client proxies requests through its own API routes:

- Client: `/api/extract-pdf` → Server: `/api/pdf/upload`
- Client: `/api/view-pdf` → Server: `/api/pdf/view/:filename`
- Client: `/api/extract-pdf?file=...` → Server: `/api/pdf/text/:filename`

## Environment Variables

Create a `.env` file in the client directory:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

## CORS Configuration

The server accepts requests from `http://localhost:3000` by default. To change this, update the CORS configuration in `src/index.ts`:

```typescript
app.use(cors({ origin: "http://your-client-url", credentials: true }));
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Notes

- PDF files are stored with format: `{original-name}-{timestamp}.pdf`
- Text files are stored with format: `{original-name}-{timestamp}.txt`
- The `storage/` directory is created automatically on first upload
- PDFs are stored permanently; implement cleanup logic as needed
