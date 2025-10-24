# Test Fixtures

This directory contains PDF files used for testing the PDF extraction functionality.

## Required Test Files

Create the following PDF files in this directory:

### 1. `sample.pdf`
A normal PDF with readable text content. You can:
- Create a simple PDF with text like "This is a sample PDF for testing"
- Use any existing PDF with text content
- Recommended size: 1-2 pages

### 2. `corrupted.pdf` (Optional)
A corrupted or invalid PDF file. You can:
- Create a text file and rename it to `.pdf`
- Truncate a valid PDF file to corrupt it
- Use a binary file with wrong format

### 3. `empty.pdf` (Optional)
A valid PDF with minimal or no text content. You can:
- Create a PDF with just blank pages
- Create a PDF with only images (no text)

## Creating Test PDFs

### Method 1: Using Google Docs / Microsoft Word
1. Create a document with some text
2. Export/Save as PDF
3. Rename to `sample.pdf`

### Method 2: Using Online Tools
1. Visit any "Create PDF" tool online
2. Add some text content
3. Download as `sample.pdf`

### Method 3: Using Existing PDFs
1. Find any PDF document on your computer
2. Copy it to this directory
3. Rename to `sample.pdf`

## Note

If these fixtures are not present, the tests will skip those specific test cases with a warning message. The tests are designed to be resilient and won't fail if fixtures are missing.
