import { NextRequest, NextResponse } from 'next/server';
import { extractPDFToTextFile } from '@/lib/pdf-extractor';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'extracted-texts');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate output filename based on original PDF name
    const originalName = file.name.replace('.pdf', '');
    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `${originalName}-${timestamp}.txt`);

    // Extract PDF content and save to .txt file
    const { filePath, result } = await extractPDFToTextFile(buffer, outputPath);

    return NextResponse.json({
      success: true,
      message: 'PDF extracted successfully',
      data: {
        textFilePath: filePath,
        numPages: result.numPages,
        textPreview: result.text.substring(0, 500), // First 500 characters
        textLength: result.text.length,
        info: result.info,
      },
    });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract PDF content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve extracted text
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    const download = searchParams.get('download');

    if (!fileName) {
      return NextResponse.json(
        { error: 'No file name provided' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'extracted-texts', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // If download=true, return as plain text for viewing in browser
    if (download === 'true') {
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
      });
    }

    // Otherwise return JSON
    return NextResponse.json({
      success: true,
      data: {
        fileName,
        content,
        length: content.length,
      },
    });
  } catch (error) {
    console.error('Error reading extracted text:', error);
    return NextResponse.json(
      {
        error: 'Failed to read extracted text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
