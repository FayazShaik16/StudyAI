import uuid
from datetime import datetime, timezone
from services.extraction_service import extraction_service
from services.ai_service import ai_service
from services.prompt_service import prompt_service
from services.materials_service import materials_service
from services.db_service import db_service

class SummaryService:
    def generate_summary(self, material_id, user_id, force_regenerate=False):
        # 1. Check if summary already exists (and not forcing regeneration)
        existing_summary = db_service.get_summary_by_material(material_id)
        if existing_summary and not force_regenerate:
            return existing_summary

        # 2. Get Material Metadata
        material = materials_service.get_material(material_id, user_id)
        if not material:
            raise ValueError("Material not found")

        # 3. Extract Text
        try:
            text = extraction_service.extract_text(material['storagePath'], material['fileType'])
        except Exception as e:
            raise ValueError(f"Failed to extract text from document: {str(e)}")

        # 4. Chunk text (for extremely large docs)
        # Note: For Phase 4, we assume sending the first large chunk or merging if small enough.
        # Groq Llama 3 70B has a context window of ~8k tokens. 
        # We will use the first chunk for the core summary to keep it simple and robust.
        chunks = extraction_service.chunk_text(text, max_chars=20000) 
        if not chunks:
            raise ValueError("Document appears to be empty after extraction.")
            
        main_chunk = chunks[0] 

        # 5. Call AI
        system_prompt = prompt_service.get_summary_system_prompt()
        user_prompt = prompt_service.get_summary_user_prompt(main_chunk)
        
        markdown_output = ai_service.generate_completion(system_prompt, user_prompt)

        # 6. Save to DB
        summary_id = str(uuid.uuid4())
        versions = []
        
        if existing_summary:
            summary_id = existing_summary['summaryId']
            versions = existing_summary.get('versions', [])
            # Store the current content into history before replacing
            versions.append({
                "content": existing_summary['content'],
                "updatedAt": existing_summary['updatedAt'],
                "modelUsed": existing_summary.get('modelUsed', 'unknown')
            })
            
        now = datetime.now(timezone.utc).isoformat()
        
        summary_data = {
            "summaryId": summary_id,
            "materialId": material_id,
            "userId": user_id,
            "content": markdown_output,
            "modelUsed": ai_service.model,
            "createdAt": existing_summary['createdAt'] if existing_summary else now,
            "updatedAt": now,
            "versions": versions
        }
        
        db_service.save_summary(summary_id, summary_data)
        
        # Update material status
        materials_service.update_material(material_id, user_id, {"aiStatus": "COMPLETED"})
        
        return summary_data
        
    def get_summary_for_material(self, material_id, user_id):
        # Ensure material belongs to user
        materials_service.get_material(material_id, user_id)
        return db_service.get_summary_by_material(material_id)

summary_service = SummaryService()
