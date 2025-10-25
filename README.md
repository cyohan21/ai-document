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
- 🤖 **AI Chat** - Ask questions about your documents using OpenAI (text and voice)
- 🔒 **Secure API Keys** - Ephemeral API key storage in browser session only

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
   git clone https://github.com/cyohan21/ai-document.git
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

4. **Provide your OpenAI API Key**
   - On first access, you'll be prompted to enter your OpenAI API key
   - The key is stored temporarily in your browser's session storage (ephemeral)
   - Your API key is never sent to our servers or persisted permanently
   - You'll need to re-enter the key if you close your browser session

### Using the Application on Mobile Devices

To access the application from your phone or tablet on the same WiFi network:

1. **Find your computer's IP address**:
   - **Windows**: Run `ipconfig` in terminal, look for "IPv4 Address" (e.g., `192.168.1.100`)
   - **Mac/Linux**: Run `ifconfig` or `ip addr`, look for your local IP

2. **Configure the client** by creating `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR-COMPUTER-IP:5000
   ```
   Example:
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:5000
   ```

3. **Restart the client dev server** after creating the `.env.local` file

4. **Configure Windows Firewall** (Windows only):
   - Open Windows Firewall with Advanced Security (`wfmsc.msc`)
   - Create new Inbound Rule for TCP port 5000
   - Allow the connection for Domain, Private, and Public networks
   - This allows WebSocket connections from your mobile device

5. **Access from your mobile device**:
   - Open browser on your phone
   - Navigate to `http://YOUR-COMPUTER-IP:3000`
   - Example: `http://192.168.1.100:3000`

**Note**: Both devices must be on the same WiFi network.

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

## AI Prompt Engineering

The application implements OpenAI's best practices for prompt engineering, following their official [Realtime API prompting guide](https://platform.openai.com/docs/guides/realtime):

### Prompt Structure

Our system prompts follow a clear, hierarchical structure:

1. **Role & Objective** - Defines the AI's purpose and success criteria
2. **Personality & Tone** - Sets conversational style and voice characteristics
3. **Context** - Provides document content for analysis
4. **Instructions / Rules** - Specific behavioral guidelines and constraints
5. **Conversation Flow** - Expected interaction patterns
6. **Safety & Escalation** - Handling edge cases and boundaries

### Key Features

- **Conciseness Enforcement** - All responses limited to 3-4 sentences maximum for better user experience
- **Document Grounding** - AI strictly bases answers on provided document content
- **Citation Requirements** - Responses reference specific sections from the document
- **Natural Voice** - Designed for realistic, conversational text-to-speech output
- **Clear Boundaries** - Explicitly handles cases where information is not in the document

### Implementation

The prompt dynamically includes:
- Document title and full content
- Modality-specific configurations (text vs. voice)
- User query context from previous interactions

See [server/src/routes/ai.routes.ts](server/src/routes/ai.routes.ts) (lines 144-186) for the complete implementation.

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
