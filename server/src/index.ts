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

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
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

app.get("/", (req, res) => res.send("PDF Document Server - API Ready"));

// Setup WebSocket for Realtime API
setupRealtimeWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/api/ai/realtime`);
});