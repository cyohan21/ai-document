import express from "express";
import cors from "cors";
import pdfRoutes from "./routes/pdf.routes";

const app = express();
const PORT = 5000;

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

app.get("/", (req, res) => res.send("PDF Document Server - API Ready"));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));