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
- `openai` - OpenAI SDK for Realtime API
- `ws` - WebSocket library
- `dotenv` - Environment variable management
- `typescript` - TypeScript support

### Environment Variables

Create a `.env` file in the server directory:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-your-api-key-here
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview-2024-10-01
OPENAI_CHAT_MODEL=gpt-4o-mini

# Server Configuration
PORT=5000
```

**Important:** Add your OpenAI API key to use the Realtime API features.

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

The server will run on `http://localhost:5001` (or the port specified in `.env`)

### Accessing from Mobile Devices

When accessing the application from a mobile device on the same WiFi network:

1. The server automatically listens on all network interfaces (`0.0.0.0`)
2. Find your computer's local IP address:
   - **Mac/Linux**: Run `ifconfig | grep "inet "` in terminal
   - **Windows**: Run `ipconfig` in command prompt
3. Use your computer's IP address instead of `localhost`
   - Example: `http://192.168.1.100:5001`

**Client Configuration:**

When you run the Next.js client in development mode (`npm run dev` in the client directory), it will display the network URL:

```
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000
```

Use the **Network** URL from your phone to access the application. The client is configured to automatically connect to the correct server IP when accessed this way.

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

## AI / Realtime API Endpoints

### 5. Test Realtime API Connection
**GET** `/api/ai/realtime-test`

Test the OpenAI Realtime API connection.

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to OpenAI Realtime API",
  "model": "gpt-4o-realtime-preview-2024-10-01"
}
```

### 6. Realtime API WebSocket
**WebSocket** `ws://localhost:5000/api/ai/realtime`

Connect to the OpenAI Realtime API with document context.

**Query Parameters:**
- `textFileName` - Text file to load as context (e.g., "document-1234567890.txt")
- `documentName` - Display name for the document

**Connection Flow:**
1. Client connects to WebSocket with query parameters
2. Server loads document context from storage
3. Server establishes connection to OpenAI Realtime API
4. Server configures session with document context in system prompt
5. Messages are proxied bidirectionally between client and OpenAI

**Example (JavaScript):**
```javascript
const ws = new WebSocket(
  'ws://localhost:5000/api/ai/realtime?textFileName=doc-123.txt&documentName=MyDoc.pdf'
);

ws.onopen = () => {
  console.log('Connected to Realtime API');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send message to OpenAI
ws.send(JSON.stringify({
  type: 'conversation.item.create',
  item: {
    type: 'message',
    role: 'user',
    content: [{ type: 'input_text', text: 'What is this document about?' }]
  }
}));

// Request response
ws.send(JSON.stringify({ type: 'response.create' }));
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
