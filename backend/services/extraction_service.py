import os
import pdfplumber
import docx
import json

class ExtractionService:
    def extract_text(self, filepath, file_type):
        if not os.path.exists(filepath):
            raise FileNotFoundError("File not found.")
            
        if file_type == 'pdf':
            return self._extract_from_pdf(filepath)
        elif file_type == 'docx':
            return self._extract_from_docx(filepath)
        elif file_type == 'txt':
            return self._extract_from_txt(filepath)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    def _extract_from_pdf(self, filepath):
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        if not text.strip():
            raise ValueError("No extractable text found in PDF.")
        return text

    def _extract_from_docx(self, filepath):
        doc = docx.Document(filepath)
        text = "\n".join([para.text for para in doc.paragraphs])
        if not text.strip():
            raise ValueError("No extractable text found in DOCX.")
        return text

    def _extract_from_txt(self, filepath):
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        if not text.strip():
            raise ValueError("No extractable text found in TXT.")
        return text

    def chunk_text(self, text, max_chars=12000):
        """
        Intelligent chunking by paragraphs to maintain context.
        """
        paragraphs = text.split('\n')
        chunks = []
        current_chunk = ""
        
        for p in paragraphs:
            if len(current_chunk) + len(p) < max_chars:
                current_chunk += p + "\n"
            else:
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = p + "\n"
                
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
            
        return chunks

extraction_service = ExtractionService()
