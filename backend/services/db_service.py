import json
import os
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

class DBService:
    def __init__(self):
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
        if not os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'w') as f:
                json.dump({}, f)
        self.materials_file = os.path.join(DATA_DIR, 'materials.json')
        if not os.path.exists(self.materials_file):
            with open(self.materials_file, 'w') as f:
                json.dump({}, f)
        self.summaries_file = os.path.join(DATA_DIR, 'summaries.json')
        if not os.path.exists(self.summaries_file):
            with open(self.summaries_file, 'w') as f:
                json.dump({}, f)
        self.flashcards_file = os.path.join(DATA_DIR, 'flashcards.json')
        if not os.path.exists(self.flashcards_file):
            with open(self.flashcards_file, 'w') as f:
                json.dump({}, f)
        self.quizzes_file = os.path.join(DATA_DIR, 'quizzes.json')
        if not os.path.exists(self.quizzes_file):
            with open(self.quizzes_file, 'w') as f:
                json.dump({}, f)
        self.quiz_attempts_file = os.path.join(DATA_DIR, 'quiz_attempts.json')
        if not os.path.exists(self.quiz_attempts_file):
            with open(self.quiz_attempts_file, 'w') as f:
                json.dump({}, f)
                
        self.study_plans_file = os.path.join(DATA_DIR, 'study_plans.json')
        if not os.path.exists(self.study_plans_file):
            with open(self.study_plans_file, 'w') as f:
                json.dump({}, f)
                
        self.study_tasks_file = os.path.join(DATA_DIR, 'study_tasks.json')
        if not os.path.exists(self.study_tasks_file):
            with open(self.study_tasks_file, 'w') as f:
                json.dump({}, f)
                
        self.appointments_file = os.path.join(DATA_DIR, 'appointments.json')
        if not os.path.exists(self.appointments_file):
            with open(self.appointments_file, 'w') as f:
                json.dump({}, f)
                
        self.goals_file = os.path.join(DATA_DIR, 'goals.json')
        if not os.path.exists(self.goals_file):
            with open(self.goals_file, 'w') as f:
                json.dump({}, f)
                
        self.achievements_file = os.path.join(DATA_DIR, 'achievements.json')
        if not os.path.exists(self.achievements_file):
            with open(self.achievements_file, 'w') as f:
                json.dump({}, f)

    def _read_users(self):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)

    def _write_users(self, data):
        with open(USERS_FILE, 'w') as f:
            json.dump(data, f, indent=4)

    def get_user_by_email(self, email):
        users = self._read_users()
        for uid, user in users.items():
            if user.get('email') == email:
                return user
        return None

    def get_user_by_id(self, uid):
        users = self._read_users()
        return users.get(uid)

    def create_user(self, uid, user_data):
        users = self._read_users()
        users[uid] = user_data
        self._write_users(users)
        return user_data

    def update_user(self, uid, user_data):
        users = self._read_users()
        if uid in users:
            users[uid].update(user_data)
            self._write_users(users)
            return users[uid]
        return None

    def _read_materials(self):
        with open(self.materials_file, 'r') as f:
            return json.load(f)

    def _write_materials(self, data):
        with open(self.materials_file, 'w') as f:
            json.dump(data, f, indent=4)

    def create_material(self, material_id, data):
        materials = self._read_materials()
        materials[material_id] = data
        self._write_materials(materials)
        return data

    def get_material(self, material_id):
        materials = self._read_materials()
        return materials.get(material_id)

    def get_user_materials(self, user_id):
        materials = self._read_materials()
        return [m for m in materials.values() if m.get('userId') == user_id]

    def update_material(self, material_id, data):
        materials = self._read_materials()
        if material_id in materials:
            materials[material_id].update(data)
            self._write_materials(materials)
            return materials[material_id]
        return None

    def delete_material(self, material_id):
        materials = self._read_materials()
        if material_id in materials:
            del materials[material_id]
            self._write_materials(materials)
            return True
        return False

    def _read_summaries(self):
        with open(self.summaries_file, 'r') as f:
            return json.load(f)

    def _write_summaries(self, data):
        with open(self.summaries_file, 'w') as f:
            json.dump(data, f, indent=4)

    def save_summary(self, summary_id, data):
        summaries = self._read_summaries()
        summaries[summary_id] = data
        self._write_summaries(summaries)
        return data

    def get_summary_by_material(self, material_id):
        summaries = self._read_summaries()
        for s in summaries.values():
            if s.get('materialId') == material_id:
                return s
        return None

    def get_summary(self, summary_id):
        summaries = self._read_summaries()
        return summaries.get(summary_id)

    def delete_summary(self, summary_id):
        summaries = self._read_summaries()
        if summary_id in summaries:
            del summaries[summary_id]
            self._write_summaries(summaries)
            return True
        return False

    def _read_flashcards(self):
        with open(self.flashcards_file, 'r') as f:
            return json.load(f)

    def _write_flashcards(self, data):
        with open(self.flashcards_file, 'w') as f:
            json.dump(data, f, indent=4)

    def save_flashcard_deck(self, deck_id, data):
        flashcards = self._read_flashcards()
        flashcards[deck_id] = data
        self._write_flashcards(flashcards)
        return data

    def get_flashcard_deck_by_material(self, material_id):
        flashcards = self._read_flashcards()
        for deck in flashcards.values():
            if deck.get('materialId') == material_id:
                return deck
        return None

    def update_flashcard_progress(self, deck_id, card_id, user_id, progress_status):
        flashcards = self._read_flashcards()
        if deck_id not in flashcards:
            return False
        
        deck = flashcards[deck_id]
        if deck.get('userId') != user_id:
            return False
            
        for card in deck.get('cards', []):
            if card.get('id') == card_id:
                card['status'] = progress_status
                self._write_flashcards(flashcards)
                return True
        return False

    def _read_quizzes(self):
        with open(self.quizzes_file, 'r') as f:
            return json.load(f)

    def _write_quizzes(self, data):
        with open(self.quizzes_file, 'w') as f:
            json.dump(data, f, indent=4)

    def save_quiz(self, quiz_id, data):
        quizzes = self._read_quizzes()
        quizzes[quiz_id] = data
        self._write_quizzes(quizzes)
        return data

    def get_quiz_by_material(self, material_id):
        quizzes = self._read_quizzes()
        for quiz in quizzes.values():
            if quiz.get('materialId') == material_id:
                return quiz
        return None

    def get_quiz(self, quiz_id):
        quizzes = self._read_quizzes()
        return quizzes.get(quiz_id)

    def _read_quiz_attempts(self):
        with open(self.quiz_attempts_file, 'r') as f:
            return json.load(f)

    def _write_quiz_attempts(self, data):
        with open(self.quiz_attempts_file, 'w') as f:
            json.dump(data, f, indent=4)

    def save_quiz_attempt(self, attempt_id, data):
        attempts = self._read_quiz_attempts()
        attempts[attempt_id] = data
        self._write_quiz_attempts(attempts)
        return data

    def get_quiz_attempts_by_quiz(self, quiz_id, user_id):
        attempts = self._read_quiz_attempts()
        return [a for a in attempts.values() if a.get('quizId') == quiz_id and a.get('userId') == user_id]

    def _read_study_plans(self):
        with open(self.study_plans_file, 'r') as f:
            return json.load(f)
            
    def _write_study_plans(self, data):
        with open(self.study_plans_file, 'w') as f:
            json.dump(data, f, indent=4)
            
    def get_study_plan(self, user_id):
        plans = self._read_study_plans()
        for plan in plans.values():
            if plan.get('userId') == user_id:
                return plan
        return None
        
    def save_study_plan(self, plan_id, data):
        plans = self._read_study_plans()
        plans[plan_id] = data
        self._write_study_plans(plans)
        return data

    def _read_study_tasks(self):
        with open(self.study_tasks_file, 'r') as f:
            return json.load(f)
            
    def _write_study_tasks(self, data):
        with open(self.study_tasks_file, 'w') as f:
            json.dump(data, f, indent=4)
            
    def get_study_tasks(self, user_id):
        tasks = self._read_study_tasks()
        return [t for t in tasks.values() if t.get('userId') == user_id]
        
    def save_study_task(self, task_id, data):
        tasks = self._read_study_tasks()
        tasks[task_id] = data
        self._write_study_tasks(tasks)
        return data
        
    def update_task_status(self, task_id, user_id, status):
        tasks = self._read_study_tasks()
        task = tasks.get(task_id)
        if task and task.get('userId') == user_id:
            task['status'] = status
            self._write_study_tasks(tasks)
            return task
        return None
        
    def _read_appointments(self):
        with open(self.appointments_file, 'r') as f:
            return json.load(f)
            
    def _write_appointments(self, data):
        with open(self.appointments_file, 'w') as f:
            json.dump(data, f, indent=4)
            
    def get_appointments(self, user_id):
        appointments = self._read_appointments()
        return [a for a in appointments.values() if a.get('userId') == user_id]
        
    def save_appointment(self, appointment_id, data):
        appointments = self._read_appointments()
        appointments[appointment_id] = data
        self._write_appointments(appointments)
        return data
        
    def delete_appointment(self, appointment_id, user_id):
        appointments = self._read_appointments()
        if appointment_id in appointments and appointments[appointment_id].get('userId') == user_id:
            del appointments[appointment_id]
            self._write_appointments(appointments)
            return True
        return False

    def delete_summary_by_material(self, material_id, user_id):
        summaries = self._read_summaries()
        to_delete = [k for k, s in summaries.items() if s.get('materialId') == material_id and s.get('userId') == user_id]
        for k in to_delete:
            del summaries[k]
        self._write_summaries(summaries)
        return len(to_delete) > 0

    def delete_flashcards_by_material(self, material_id, user_id):
        flashcards = self._read_flashcards()
        to_delete = [k for k, d in flashcards.items() if d.get('materialId') == material_id and d.get('userId') == user_id]
        for k in to_delete:
            del flashcards[k]
        self._write_flashcards(flashcards)
        return len(to_delete) > 0

    def delete_quiz_by_material(self, material_id, user_id):
        quizzes = self._read_quizzes()
        deleted_quiz_ids = [k for k, q in quizzes.items() if q.get('materialId') == material_id and q.get('userId') == user_id]
        for k in deleted_quiz_ids:
            del quizzes[k]
        self._write_quizzes(quizzes)
        # Also delete associated attempts
        if deleted_quiz_ids:
            attempts = self._read_quiz_attempts()
            to_delete_attempts = [k for k, a in attempts.items() if a.get('quizId') in deleted_quiz_ids]
            for k in to_delete_attempts:
                del attempts[k]
            self._write_quiz_attempts(attempts)
        return len(deleted_quiz_ids) > 0

    def delete_all_tasks(self, user_id):
        tasks = self._read_study_tasks()
        to_delete = [k for k, t in tasks.items() if t.get('userId') == user_id]
        for k in to_delete:
            del tasks[k]
        self._write_study_tasks(tasks)
        return len(to_delete)

    def delete_all_appointments(self, user_id):
        appointments = self._read_appointments()
        to_delete = [k for k, a in appointments.items() if a.get('userId') == user_id]
        for k in to_delete:
            del appointments[k]
        self._write_appointments(appointments)
        return len(to_delete)

    def _read_goals(self):
        with open(self.goals_file, 'r') as f:
            return json.load(f)
            
    def _write_goals(self, data):
        with open(self.goals_file, 'w') as f:
            json.dump(data, f, indent=4)
            
    def get_goals(self, user_id):
        goals = self._read_goals()
        return [g for g in goals.values() if g.get('userId') == user_id]
        
    def save_goal(self, goal_id, data):
        goals = self._read_goals()
        goals[goal_id] = data
        self._write_goals(goals)
        return data
        
    def _read_achievements(self):
        with open(self.achievements_file, 'r') as f:
            return json.load(f)
            
    def _write_achievements(self, data):
        with open(self.achievements_file, 'w') as f:
            json.dump(data, f, indent=4)
            
    def get_achievements(self, user_id):
        achievements = self._read_achievements()
        return [a for a in achievements.values() if a.get('userId') == user_id]
        
    def save_achievement(self, ach_id, data):
        achievements = self._read_achievements()
        achievements[ach_id] = data
        self._write_achievements(achievements)
        return data

db_service = DBService()
