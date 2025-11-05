# AI Document Analyzer

A full-stack application for uploading, analyzing, and extracting content from PDF documents and YouTube videos using AI.

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

- 📄 **PDF Upload** - Upload PDF documents through an intuitive interface (max 25MB)
- 🎥 **YouTube Integration** - Extract transcripts from YouTube videos for analysis
- 🔍 **Text Extraction** - Automatically extract text content from PDFs and YouTube transcripts
- 👁️ **PDF Viewing** - View original PDFs directly in the browser
- 📊 **Document Preview** - See extracted text with word count, page count, and video metadata
- 📁 **Document Management** - Unified dashboard to manage PDFs and YouTube videos
- 💾 **Persistent Storage** - Documents stored locally in browser (localStorage)
- 🤖 **AI Chat** - Ask questions about your documents using OpenAI (text and voice modes)
- 💬 **Contextual AI** - AI automatically understands whether you're analyzing a PDF or YouTube video
- 🔒 **Secure API Keys** - Ephemeral API key storage in browser session only
- ✅ **API Key Validation** - Real-time validation of OpenAI API keys before use
- ⚙️ **Environment Configuration** - Built-in checks for proper server URL configuration
- 📱 **Responsive Design** - Optimized for desktop and mobile devices

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
- **youtube-transcript** - YouTube transcript extraction
- **WebSocket (ws)** - Real-time AI communication
- **OpenAI Realtime API** - GPT-4o powered chat (text and voice)
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
   - The application validates your key with OpenAI to ensure it's valid before proceeding
   - The key is stored temporarily in your browser's session storage (ephemeral)
   - Your API key is only sent to the server for validation and is never persisted permanently
   - You'll need to re-enter the key if you close your browser session
   - If validation fails, you'll see a specific error message (invalid key, rate limit, etc.)

### Using the Application on Mobile Devices

To access the application from your phone or tablet on the same WiFi network:

1. **Find your computer's IP address**:
   - **Windows**: Run `ipconfig` in terminal, look for "IPv4 Address" (e.g., `192.168.1.100`)
   - **Mac/Linux**: Run `ipconfig getifaddr en0` to get your local IP address

2. **Configure the client** by creating `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR-COMPUTER-IP:5000
   ```
   Example:
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:5000
   ```

   Optional - Enable debug info on the API key page:
   ```env
   NEXT_PUBLIC_SHOW_DEBUG_INFO=true
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

### Common Troubleshooting for Mobile Access

If you can't access the application from your mobile device:

1. **Using `localhost` on mobile** - This won't work! `localhost` refers to the mobile device itself, not your computer. You must use your computer's actual IP address (e.g., `192.168.1.100:3000`).

2. **Wrong IP address in `.env.local`** - Make sure the `NEXT_PUBLIC_API_URL` in `client/.env.local` matches your computer's IP address. Double-check by running `ipconfig getifaddr en0` (Mac/Linux) or `ipconfig` (Windows).

3. **Forgot to restart the dev server** - Environment variable changes require a restart of the Next.js dev server to take effect.

4. **Different WiFi networks** - Ensure both your computer and mobile device are connected to the same WiFi network.

5. **Firewall blocking connections** - On Windows, make sure you've configured the firewall to allow connections on port 5000.

**Tip**: Set `NEXT_PUBLIC_SHOW_DEBUG_INFO=true` in your `.env.local` file to see connection details on the API key page, which helps diagnose configuration issues.

## Usage

### Add Content

The application supports two types of content:

#### Upload a PDF Document
1. Click "Add Content" on the dashboard
2. Select "Upload PDF" option
3. Choose a PDF file from your device (max 25MB)
4. Wait for extraction to complete
5. You'll be redirected to the preview page

#### Add a YouTube Video
1. Click "Add Content" on the dashboard
2. Select "Add YouTube Video" option
3. Paste a YouTube URL
4. Click "Add YouTube Video" or press Enter
5. Wait for transcript extraction (max 3-hour videos)
6. You'll be redirected to the preview page

### View Content
- **Preview Page**: See extracted text with metadata
  - For PDFs: page count, word count, extracted text
  - For YouTube: video duration, channel name, transcript
- **Chat with AI**: Red button to start AI conversation about the content
- **View Original**: Open PDF in new tab or watch YouTube video
- **Dashboard**: Navigate back to see all your content

### AI Chat Features
- **Text Chat**: Ask questions and get concise answers (3-4 sentences)
- **Voice Chat**: Speak naturally and hear AI responses (mobile warning displayed)
- **Context-Aware**: AI knows if you're analyzing a PDF or YouTube video
- **Document Grounding**: Answers are based strictly on your document content
- **Smart Truncation**: Long document titles are shortened with word boundaries

### Dashboard
- View all uploaded PDFs and YouTube videos in one place
- Visual indicators: Purple icon for PDFs, Red YouTube icon for videos
- Click "Preview" to see content and start chatting with AI
- Delete documents you no longer need
- Persistent storage across browser sessions

## API Endpoints

See [server/README.md](server/README.md) for detailed API documentation.

### Quick Reference

**PDF Endpoints:**
- `POST /api/pdf/upload` - Upload and extract PDF (max 25MB)
- `GET /api/pdf/view/:filename` - View PDF file
- `GET /api/pdf/text/:filename` - Get extracted text
- `GET /api/pdf/list` - List all PDFs

**YouTube Endpoints:**
- `POST /api/youtube/process` - Extract transcript from YouTube URL (max 3 hours)

**AI Endpoints:**
- `POST /api/ai/validate-key` - Validate OpenAI API key
- `WS /api/ai/text` - WebSocket for text chat (with document context)
- `WS /api/ai/voice` - WebSocket for voice chat (with document context)

## Project Details

### Client Structure
```
client/
├── app/
│   ├── ai-chat/          # Text chat page
│   ├── ai-voice/         # Voice chat page
│   ├── api-key/          # API key setup page
│   ├── dashboard/        # Dashboard with documents
│   ├── preview/          # Content preview page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/           # Reusable components
└── lib/                  # Utilities
```

### Server Structure
```
server/
├── src/
│   ├── routes/
│   │   ├── pdf.routes.ts      # PDF upload & extraction
│   │   ├── youtube.routes.ts  # YouTube transcript extraction
│   │   └── ai.routes.ts       # AI chat endpoints (WebSocket)
│   ├── utils/
│   │   ├── pdf-extractor.ts      # PDF text extraction
│   │   └── youtube-extractor.ts  # YouTube transcript extraction
│   └── index.ts               # Main server file
└── storage/                   # Auto-created on first upload
    ├── pdfs/                 # Uploaded PDF files
    └── texts/                # Extracted text files
```

## Storage

All document data is stored client-side in the browser's localStorage:

### Client Storage (localStorage)
- **documents**: Array of all PDFs and YouTube videos with complete metadata
  - For PDFs: Base64-encoded PDF data, extracted text, page count, word count
  - For YouTube: Video URL, transcript, duration, channel name, upload date
- **currentDocumentId**: ID of the currently selected document
- **currentDocumentText**: Full extracted text/transcript for AI context
- **textChatMessages**: Chat history for text conversations
- **voiceChatMessages**: Chat history for voice conversations

### Session Storage
- **openai_api_key**: User's OpenAI API key (ephemeral, cleared on browser close)

**Note**: PDFs are temporarily uploaded to the server for text extraction at `server/storage/pdfs/`, but the extracted content and metadata are stored in the browser's localStorage. The server does not maintain a persistent database of user documents.

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
- Document title and full content (PDF or YouTube transcript)
- Content type awareness (PDF document vs. YouTube video)
- Modality-specific configurations (text vs. voice)
- User query context from previous interactions

**Content Type Handling:**
- PDFs are referred to as "PDF document" with "content"
- YouTube videos are referred to as "YouTube video transcript" with "transcript"
- The AI adapts its language based on the content type for more natural responses

See [server/src/routes/ai.routes.ts](server/src/routes/ai.routes.ts) (lines 204-253) for the complete implementation.

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

## License

MIT
