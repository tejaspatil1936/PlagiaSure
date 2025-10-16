import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export const extractTextFromFile = async (buffer, mimeType) => {
  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractFromPDF(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractFromDOCX(buffer);
      
      case 'text/plain':
        return buffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    // Return empty string instead of throwing to prevent server crashes
    return '';
  }
};

const extractFromPDF = async (buffer) => {
  try {
    console.log('📄 Extracting text from PDF...');
    const data = await pdfParse(buffer);
    const text = cleanText(data.text);
    
    if (!text || text.length < 10) {
      console.warn('⚠️ PDF text extraction returned minimal content');
      return 'PDF file processed but minimal text content was extracted. This may be a scanned document or image-based PDF.';
    }
    
    console.log(`✅ PDF text extracted successfully: ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    return 'PDF file uploaded but text extraction failed. This may be a password-protected, corrupted, or image-based PDF.';
  }
};

const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    .replace(/\s{2,}/g, ' ') // Remove excessive spaces
    .trim();
};

export const splitIntoSentences = (text) => {
  if (!text) return [];
  
  // Simple sentence splitting - can be improved with NLP libraries
  const sentences = text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 10); // Filter out very short fragments
  
  return sentences;
};