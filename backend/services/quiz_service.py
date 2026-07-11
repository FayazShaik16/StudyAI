import uuid
import json
from datetime import datetime, timezone
from services.extraction_service import extraction_service
from services.ai_service import ai_service
from services.prompt_service import prompt_service
from services.materials_service import materials_service
from services.db_service import db_service

class QuizService:
    def generate_quiz(self, material_id, user_id, force_regenerate=False, types=None):
        if types is None:
            types = ['Multiple Choice', 'True/False', 'Short Answer']
        existing_quiz = db_service.get_quiz_by_material(material_id)
        if existing_quiz and not force_regenerate:
            return existing_quiz

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

        system_prompt = prompt_service.get_quiz_system_prompt(types)
        user_prompt = prompt_service.get_quiz_user_prompt(main_chunk)
        
        json_output = ai_service.generate_completion(system_prompt, user_prompt)
        
        try:
            clean_json = json_output.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            
            questions_array = json.loads(clean_json.strip())
            
            if not isinstance(questions_array, list):
                raise ValueError("Expected a JSON array")
                
            for q in questions_array:
                if not q.get("id"):
                    q["id"] = str(uuid.uuid4())
                
        except json.JSONDecodeError as e:
            raise RuntimeError(f"AI returned malformed JSON: {str(e)} \n\n Output was: {json_output}")

        quiz_id = str(uuid.uuid4())
        version = 1
        
        if force_regenerate and existing_quiz:
            quiz_id = existing_quiz['quizId']
            version = existing_quiz.get('version', 1) + 1
            
        now = datetime.now(timezone.utc).isoformat()
        
        quiz_data = {
            "quizId": quiz_id,
            "materialId": material_id,
            "userId": user_id,
            "questions": questions_array,
            "version": version,
            "modelUsed": ai_service.model,
            "createdAt": existing_quiz['createdAt'] if existing_quiz else now,
            "updatedAt": now
        }
        
        db_service.save_quiz(quiz_id, quiz_data)
        return quiz_data
        
    def get_quiz_for_material(self, material_id, user_id):
        materials_service.get_material(material_id, user_id)
        return db_service.get_quiz_by_material(material_id)

    def submit_quiz_attempt(self, quiz_id, user_id, answers, time_taken):
        quiz = db_service.get_quiz(quiz_id)
        if not quiz or quiz['userId'] != user_id:
            raise ValueError("Quiz not found or unauthorized")
            
        questions = quiz.get("questions", [])
        total_questions = len(questions)
        correct_count = 0
        
        # Grading logic
        results = []
        for q in questions:
            user_answer = answers.get(q['id'])
            is_correct = False
            if user_answer and str(user_answer).strip().lower() == str(q['correctAnswer']).strip().lower():
                is_correct = True
                correct_count += 1
                
            results.append({
                "questionId": q['id'],
                "userAnswer": user_answer,
                "isCorrect": is_correct
            })
            
        score = correct_count
        percentage = round((score / total_questions) * 100) if total_questions > 0 else 0
        
        attempt_id = str(uuid.uuid4())
        attempt_data = {
            "attemptId": attempt_id,
            "quizId": quiz_id,
            "userId": user_id,
            "score": score,
            "totalQuestions": total_questions,
            "percentage": percentage,
            "timeTaken": time_taken,
            "results": results,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        
        db_service.save_quiz_attempt(attempt_id, attempt_data)
        return attempt_data
        
    def get_quiz_attempts(self, quiz_id, user_id):
        return db_service.get_quiz_attempts_by_quiz(quiz_id, user_id)

quiz_service = QuizService()
