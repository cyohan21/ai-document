import fs from 'fs';
import path from 'path';

// Import the lib directly to avoid test code execution in pdf-parse/index.js
const pdf = require('pdf-parse/lib/pdf-parse.js');

export interface PDFExtractionResult {
  text: string;
  numPages: number;
  info?: any;
  metadata?: any;
}

/**
 * Extract text content from a PDF file
 * @param pdfBuffer - Buffer containing the PDF file data
 * @returns Extracted text and metadata
 */
export async function extractPDFText(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const data = await pdf(pdfBuffer);

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF and save to a .txt file
 * @param pdfBuffer - Buffer containing the PDF file data
 * @param outputPath - Path where the .txt file should be saved
 * @returns Path to the saved .txt file and extraction result
 */
export async function extractPDFToTextFile(
  pdfBuffer: Buffer,
  outputPath: string
): Promise<{ filePath: string; result: PDFExtractionResult }> {
  try {
    // Extract text from PDF
    const result = await extractPDFText(pdfBuffer);

    // Ensure the output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the extracted text to a .txt file
    fs.writeFileSync(outputPath, result.text, 'utf-8');

    return {
      filePath: outputPath,
      result,
    };
  } catch (error) {
    throw new Error(`Failed to save PDF content to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF file path and save to a .txt file
 * @param pdfPath - Path to the PDF file
 * @param outputPath - Path where the .txt file should be saved
 * @returns Path to the saved .txt file and extraction result
 */
export async function extractPDFFileToTextFile(
  pdfPath: string,
  outputPath: string
): Promise<{ filePath: string; result: PDFExtractionResult }> {
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Extract and save
    return await extractPDFToTextFile(pdfBuffer, outputPath);
  } catch (error) {
    throw new Error(`Failed to read PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
