# AI Document Analyzer

A full-stack application for uploading, analyzing, and extracting content from PDF documents using AI.

## Project Structure

```
ai-document/
├── client/          # Next.js frontend application
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   └── lib/         # Client utilities
├── server/          # Express backend server
│   ├── src/         # Server source code
│   └── storage/     # Uploaded PDFs and extracted texts
└── README.md        # This file
```

## Features

- 📄 **PDF Upload** - Upload PDF documents through an intuitive interface
- 🔍 **Text Extraction** - Automatically extract text content from PDFs
- 👁️ **PDF Viewing** - View original PDFs directly in the browser
- 📊 **Document Preview** - See extracted text with word count and page count
- 📁 **Document Management** - Dashboard to manage all uploaded documents
- 💾 **Persistent Storage** - All PDFs and extracted text stored on the server

## Tech Stack

### Frontend (Client)
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React 19** - UI components

### Backend (Server)
- **Express** - Node.js web framework
- **TypeScript** - Type-safe server development
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-document
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

### Running the Application

You need to run both the client and server:

1. **Start the server** (Terminal 1)
   ```bash
   cd server
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

2. **Start the client** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```
   Client runs on: `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### Upload a Document
1. Go to `/upload` or click "Upload Document" on the dashboard
2. Select a PDF file
3. Wait for extraction to complete
4. You'll be redirected to the preview page

### View Document
- **Preview Page**: See extracted text with metadata (pages, words)
- **View PDF**: Click "View PDF" to open the original in a new tab
- **Dashboard**: See all uploaded documents with preview option

### Dashboard
- View all uploaded documents
- Click "Preview" to see extracted content
- Delete documents you no longer need

## API Endpoints

See [server/README.md](server/README.md) for detailed API documentation.

### Quick Reference
- `POST /api/pdf/upload` - Upload and extract PDF
- `GET /api/pdf/view/:filename` - View PDF file
- `GET /api/pdf/text/:filename` - Get extracted text
- `GET /api/pdf/list` - List all PDFs

## Environment Variables

Create `.env.local` in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This environment variable tells the Next.js client where to find the backend server.

## Project Details

### Client Structure
```
client/
├── app/
│   ├── api/              # API route proxies
│   ├── dashboard/        # Dashboard page
│   ├── preview/          # Document preview page
│   ├── upload/           # Upload page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
└── lib/                  # Utilities
```

### Server Structure
```
server/
├── src/
│   ├── routes/
│   │   └── pdf.routes.ts    # PDF API endpoints
│   ├── utils/
│   │   └── pdf-extractor.ts # PDF extraction logic
│   └── index.ts             # Main server file
└── storage/                 # Auto-created on first upload
    ├── pdfs/               # Uploaded PDF files
    └── texts/              # Extracted text files
```

## Storage

All files are stored in `server/storage/`:
- **PDFs**: `server/storage/pdfs/{filename}-{timestamp}.pdf`
- **Text**: `server/storage/texts/{filename}-{timestamp}.txt`

## Development

### Client Development
```bash
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

### Server Development
```bash
cd server
npm run dev      # Start dev server with hot reload
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Future Enhancements

- [ ] AI-powered question answering about documents
- [ ] Multi-language support for PDFs
- [ ] OCR for scanned PDFs
- [ ] Document search and filtering
- [ ] User authentication
- [ ] Document sharing
- [ ] Export options (Markdown, JSON)
