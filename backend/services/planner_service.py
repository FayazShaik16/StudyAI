import uuid
import json
from datetime import datetime, timedelta, timezone
from services.ai_service import ai_service
from services.prompt_service import prompt_service
from services.db_service import db_service

class PlannerService:
    def generate_study_plan(self, user_id, material_id=None):
        # Gather Context
        if material_id:
            material = db_service.get_material(material_id, user_id)
            title = material.get('title', 'Unknown Material') if material else 'Unknown Material'
            context_str = f"The user is focusing on studying the material titled '{title}'. They need a balanced 7-day schedule covering reading, flashcards, and quizzes specifically for this material."
        else:
            context_str = "The user is studying various materials. They need a balanced 7-day schedule covering reading, flashcards, and quizzes."
        
        system_prompt = prompt_service.get_planner_system_prompt()
        user_prompt = prompt_service.get_planner_user_prompt(context_str)
        
        json_output = ai_service.generate_completion(system_prompt, user_prompt)
        
        try:
            clean_json = json_output.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            
            tasks_array = json.loads(clean_json.strip())
            
            if not isinstance(tasks_array, list):
                raise ValueError("Expected a JSON array")
                
        except json.JSONDecodeError as e:
            raise RuntimeError(f"AI returned malformed JSON: {str(e)} \n\n Output was: {json_output}")

        now = datetime.now(timezone.utc)
        
        # Create a Plan Record
        plan_id = str(uuid.uuid4())
        plan_data = {
            "planId": plan_id,
            "userId": user_id,
            "createdAt": now.isoformat(),
            "status": "Active"
        }
        db_service.save_study_plan(plan_id, plan_data)
        
        # Create Task Records
        created_tasks = []
        for t in tasks_array:
            task_id = str(uuid.uuid4())
            offset = t.get('dateOffset', 0)
            target_date = now + timedelta(days=offset)
            
            task_data = {
                "taskId": task_id,
                "planId": plan_id,
                "userId": user_id,
                "title": t.get("title", "Study Session"),
                "description": t.get("description", ""),
                "dueDate": target_date.isoformat(),
                "estimatedMinutes": t.get("estimatedMinutes", 30),
                "type": t.get("type", "Read"),
                "priority": t.get("priority", "Medium"),
                "status": "Pending",
                "createdAt": now.isoformat(),
                "materialId": material_id
            }
            db_service.save_study_task(task_id, task_data)
            created_tasks.append(task_data)
            
        return {"plan": plan_data, "tasks": created_tasks}
        
    def get_tasks(self, user_id):
        return db_service.get_study_tasks(user_id)
        
    def update_task_status(self, task_id, user_id, status):
        task = db_service.update_task_status(task_id, user_id, status)
        if not task:
            raise ValueError("Task not found or unauthorized")
        return task

    def update_task(self, task_id, user_id, update_data):
        tasks = db_service._read_study_tasks()
        task = tasks.get(task_id)
        if task and task.get('userId') == user_id:
            # Filter allowed update fields
            allowed = {'title', 'description', 'dueDate', 'estimatedMinutes', 'type', 'priority', 'status'}
            filtered = {k: v for k, v in update_data.items() if k in allowed}
            task.update(filtered)
            db_service._write_study_tasks(tasks)
            return task
        return None

    def get_appointments(self, user_id):
        return db_service.get_appointments(user_id)
        
    def create_appointment(self, user_id, data):
        app_id = str(uuid.uuid4())
        app_data = {
            "appointmentId": app_id,
            "userId": user_id,
            "title": data.get("title", "Meeting"),
            "description": data.get("description", ""),
            "date": data.get("date"),
            "location": data.get("location", ""),
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        return db_service.save_appointment(app_id, app_data)
        
    def delete_appointment(self, appointment_id, user_id):
        if not db_service.delete_appointment(appointment_id, user_id):
            raise ValueError("Appointment not found or unauthorized")
        return True

    def create_task(self, user_id, data):
        task_id = str(uuid.uuid4())
        task_data = {
            "taskId": task_id,
            "userId": user_id,
            "title": data.get("title", "Study Session"),
            "description": data.get("description", ""),
            "dueDate": data.get("dueDate"),
            "estimatedMinutes": int(data.get("estimatedMinutes", 30)),
            "type": data.get("type", "Read"),
            "priority": data.get("priority", "Medium"),
            "status": "Pending",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "materialId": data.get("materialId")
        }
        db_service.save_study_task(task_id, task_data)
        return task_data

planner_service = PlannerService()
