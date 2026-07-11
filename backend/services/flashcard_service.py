import uuid
import json
from datetime import datetime, timezone
from services.extraction_service import extraction_service
from services.ai_service import ai_service
from services.prompt_service import prompt_service
from services.materials_service import materials_service
from services.db_service import db_service

class FlashcardService:
    def generate_flashcards(self, material_id, user_id, force_regenerate=False, count=10):
        existing_deck = db_service.get_flashcard_deck_by_material(material_id)
        if existing_deck and not force_regenerate:
            return existing_deck

        material = materials_service.get_material(material_id, user_id)
        if not material:
            raise ValueError("Material not found")

        try:
            text = extraction_service.extract_text(material['storagePath'], material['fileType'])
        except Exception as e:
            raise ValueError(f"Failed to extract text from document: {str(e)}")

        chunks = extraction_service.chunk_text(text, max_chars=20000) 
        if not chunks:
            raise ValueError("Document appears to be empty after extraction.")
            
        main_chunk = chunks[0] 

        system_prompt = prompt_service.get_flashcard_system_prompt()
        user_prompt = f"Please extract exactly {count} high-quality flashcards from the following educational material:\n\n{main_chunk}"
        
        json_output = ai_service.generate_completion(system_prompt, user_prompt)
        
        try:
            # Safely parse JSON. Groq might return ```json ... ``` despite instructions.
            clean_json = json_output.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            
            cards_array = json.loads(clean_json.strip())
            
            if not isinstance(cards_array, list):
                raise ValueError("Expected a JSON array")
                
            # Assign statuses if not present
            for card in cards_array:
                if not card.get("id"):
                    card["id"] = str(uuid.uuid4())
                card["status"] = "Not Reviewed"
                
        except json.JSONDecodeError as e:
            raise RuntimeError(f"AI returned malformed JSON: {str(e)} \n\n Output was: {json_output}")

        deck_id = str(uuid.uuid4())
        version = 1
        
        if force_regenerate and existing_deck:
            deck_id = existing_deck['deckId']
            version = existing_deck.get('version', 1) + 1
            
        now = datetime.now(timezone.utc).isoformat()
        
        deck_data = {
            "deckId": deck_id,
            "materialId": material_id,
            "userId": user_id,
            "cards": cards_array,
            "version": version,
            "modelUsed": ai_service.model,
            "createdAt": existing_deck['createdAt'] if existing_deck else now,
            "updatedAt": now
        }
        
        db_service.save_flashcard_deck(deck_id, deck_data)
        
        return deck_data
        
    def get_flashcards_for_material(self, material_id, user_id):
        materials_service.get_material(material_id, user_id)
        return db_service.get_flashcard_deck_by_material(material_id)

    def update_card_progress(self, deck_id, card_id, user_id, status):
        success = db_service.update_flashcard_progress(deck_id, card_id, user_id, status)
        if not success:
            raise ValueError("Failed to update progress (Card/Deck not found or unauthorized)")
        return True

flashcard_service = FlashcardService()
