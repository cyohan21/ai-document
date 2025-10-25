import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import pdfRoutes from "./routes/pdf.routes";
import aiRoutes, { setupRealtimeWebSocket } from "./routes/ai.routes";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Allow both localhost and network IP access
// Dynamically allow any local network IP for development
const allowedOrigins = [
  "http://localhost:3000",
  /^http:\/\/localhost:\d+$/,           // Any localhost port
  /^http:\/\/127\.0\.0\.1:\d+$/,        // 127.0.0.1 with any port
  /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // 192.168.x.x with any port (most common)
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,   // 10.x.x.x with any port
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+:\d+$/  // 172.16.x.x - 172.31.x.x
];

app.use(cors({
  origin: (origin: any, callback: any) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      return allowed.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// PDF routes
app.use('/api/pdf', pdfRoutes);

// AI routes (Realtime API)
app.use('/api/ai', aiRoutes);

// Logging endpoint for frontend debugging
app.post('/api/log', (req, res) => {
  const { message } = req.body;
  console.log(`[FRONTEND] ${message}`);
  res.json({ success: true });
});

app.get("/", (req, res) => res.send("PDF Document Server - API Ready"));

// Setup WebSocket for Realtime API
setupRealtimeWebSocket(httpServer);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Server accessible on network (update with your IP)`);
  console.log(`WebSocket available at ws://localhost:${PORT}/api/ai/realtime`);
});