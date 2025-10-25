import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractPDFToTextFile } from '../utils/pdf-extractor';

const router = express.Router();

// Configure multer for file uploads (store in memory, 25MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB in bytes
  }
});

// Ensure storage directories exist
const STORAGE_DIR = path.join(__dirname, '../../storage');
const PDF_DIR = path.join(STORAGE_DIR, 'pdfs');
const TEXT_DIR = path.join(STORAGE_DIR, 'texts');

[STORAGE_DIR, PDF_DIR, TEXT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * POST /api/pdf/extract
 * Extract text from PDF (doesn't save the PDF, just returns text)
 */
router.post('/extract', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 25MB limit' });
    }

    const buffer = req.file.buffer;

    // Extract text using pdf-parse
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);

    res.json({
      success: true,
      message: 'PDF text extracted successfully',
      data: {
        text: result.text,
        numPages: result.numpages,
        info: result.info,
      },
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);

    // Handle multer file size error
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 25MB limit' });
    }

    res.status(500).json({
      error: 'Failed to extract PDF text',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/pdf/upload
 * Upload and extract PDF
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 25MB limit' });
    }

    const buffer = req.file.buffer;
    const originalName = req.file.originalname.replace('.pdf', '');
    const timestamp = Date.now();

    // Save the PDF file
    const pdfFileName = `${originalName}-${timestamp}.pdf`;
    const pdfFilePath = path.join(PDF_DIR, pdfFileName);
    fs.writeFileSync(pdfFilePath, buffer);

    // Extract text and save to file
    const textFileName = `${originalName}-${timestamp}.txt`;
    const textFilePath = path.join(TEXT_DIR, textFileName);
    const { filePath, result } = await extractPDFToTextFile(buffer, textFilePath);

    res.json({
      success: true,
      message: 'PDF extracted successfully',
      data: {
        pdfFileName,
        textFileName,
        numPages: result.numPages,
        textPreview: result.text.substring(0, 500),
        textLength: result.text.length,
        info: result.info,
      },
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);

    // Handle multer file size error
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 25MB limit' });
    }

    res.status(500).json({
      error: 'Failed to extract PDF content',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pdf/view/:filename
 * View PDF file
 */
router.get('/view/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(PDF_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    const pdfBuffer = fs.readFileSync(filePath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({
      error: 'Failed to serve PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pdf/text/:filename
 * Get extracted text content
 */
router.get('/text/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const download = req.query.download === 'true';
    const filePath = path.join(TEXT_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Text file not found' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // If download=true, return as plain text for viewing in browser
    if (download) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(content);
    }

    // Otherwise return JSON
    res.json({
      success: true,
      data: {
        filename,
        content,
        length: content.length,
      },
    });
  } catch (error) {
    console.error('Error reading extracted text:', error);
    res.status(500).json({
      error: 'Failed to read extracted text',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/pdf/list
 * List all uploaded PDFs
 */
router.get('/list', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(PDF_DIR);
    const pdfFiles = files.filter(file => file.endsWith('.pdf')).map(filename => {
      const filePath = path.join(PDF_DIR, filename);
      const stats = fs.statSync(filePath);

      // Derive text file name from PDF filename
      // Format: "filename-timestamp.pdf" -> "filename-timestamp.txt"
      const textFileName = filename.replace('.pdf', '.txt');
      const textFilePath = path.join(TEXT_DIR, textFileName);
      const hasTextFile = fs.existsSync(textFilePath);

      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        textFile: hasTextFile ? textFileName : null,
      };
    });

    res.json({
      success: true,
      data: pdfFiles,
    });
  } catch (error) {
    console.error('Error listing PDFs:', error);
    res.status(500).json({
      error: 'Failed to list PDFs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
