import json
import os
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK if service account JSON is set in environment
firestore_db = None
firebase_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')

if firebase_json:
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Check if already initialized to avoid duplicate app errors
        if not firebase_admin._apps:
            cred_dict = json.loads(firebase_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            
        firestore_db = firestore.client()
        logger.info("Firebase Admin initialized successfully in db_service. Using Firestore database.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin: {str(e)}. Falling back to local JSON database.")

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

class DBService:
    def __init__(self):
        if not firestore_db:
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

    # --- HELPER METHODS FOR LOCAL JSON ---
    def _read_users(self):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)

    def _write_users(self, data):
        with open(USERS_FILE, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_materials(self):
        with open(self.materials_file, 'r') as f:
            return json.load(f)

    def _write_materials(self, data):
        with open(self.materials_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_summaries(self):
        with open(self.summaries_file, 'r') as f:
            return json.load(f)

    def _write_summaries(self, data):
        with open(self.summaries_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_flashcards(self):
        with open(self.flashcards_file, 'r') as f:
            return json.load(f)

    def _write_flashcards(self, data):
        with open(self.flashcards_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_quizzes(self):
        with open(self.quizzes_file, 'r') as f:
            return json.load(f)

    def _write_quizzes(self, data):
        with open(self.quizzes_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_quiz_attempts(self):
        with open(self.quiz_attempts_file, 'r') as f:
            return json.load(f)

    def _write_quiz_attempts(self, data):
        with open(self.quiz_attempts_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_study_plans(self):
        with open(self.study_plans_file, 'r') as f:
            return json.load(f)
            
    def _write_study_plans(self, data):
        with open(self.study_plans_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_study_tasks(self):
        with open(self.study_tasks_file, 'r') as f:
            return json.load(f)
            
    def _write_study_tasks(self, data):
        with open(self.study_tasks_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_appointments(self):
        with open(self.appointments_file, 'r') as f:
            return json.load(f)
            
    def _write_appointments(self, data):
        with open(self.appointments_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_goals(self):
        with open(self.goals_file, 'r') as f:
            return json.load(f)
            
    def _write_goals(self, data):
        with open(self.goals_file, 'w') as f:
            json.dump(data, f, indent=4)

    def _read_achievements(self):
        with open(self.achievements_file, 'r') as f:
            return json.load(f)
            
    def _write_achievements(self, data):
        with open(self.achievements_file, 'w') as f:
            json.dump(data, f, indent=4)

    # --- DATABASE OPERATIONS ---

    # USERS
    def get_user_by_email(self, email):
        if firestore_db:
            docs = firestore_db.collection('users').where('email', '==', email).limit(1).get()
            for doc in docs:
                return doc.to_dict()
            return None
        else:
            users = self._read_users()
            for uid, user in users.items():
                if user.get('email') == email:
                    return user
            return None

    def get_user_by_id(self, uid):
        if firestore_db:
            doc_ref = firestore_db.collection('users').document(uid).get()
            if doc_ref.exists:
                return doc_ref.to_dict()
            return None
        else:
            users = self._read_users()
            return users.get(uid)

    def create_user(self, uid, user_data):
        if firestore_db:
            firestore_db.collection('users').document(uid).set(user_data)
            return user_data
        else:
            users = self._read_users()
            users[uid] = user_data
            self._write_users(users)
            return user_data

    def update_user(self, uid, user_data):
        if firestore_db:
            firestore_db.collection('users').document(uid).update(user_data)
            return self.get_user_by_id(uid)
        else:
            users = self._read_users()
            if uid in users:
                users[uid].update(user_data)
                self._write_users(users)
                return users[uid]
            return None

    # MATERIALS
    def create_material(self, material_id, data):
        if firestore_db:
            firestore_db.collection('materials').document(material_id).set(data)
            return data
        else:
            materials = self._read_materials()
            materials[material_id] = data
            self._write_materials(materials)
            return data

    def get_material(self, material_id):
        if firestore_db:
            doc_ref = firestore_db.collection('materials').document(material_id).get()
            if doc_ref.exists:
                return doc_ref.to_dict()
            return None
        else:
            materials = self._read_materials()
            return materials.get(material_id)

    def get_user_materials(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('materials').where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            materials = self._read_materials()
            return [m for m in materials.values() if m.get('userId') == user_id]

    def update_material(self, material_id, data):
        if firestore_db:
            firestore_db.collection('materials').document(material_id).update(data)
            return self.get_material(material_id)
        else:
            materials = self._read_materials()
            if material_id in materials:
                materials[material_id].update(data)
                self._write_materials(materials)
                return materials[material_id]
            return None

    def delete_material(self, material_id):
        if firestore_db:
            firestore_db.collection('materials').document(material_id).delete()
            return True
        else:
            materials = self._read_materials()
            if material_id in materials:
                del materials[material_id]
                self._write_materials(materials)
                return True
            return False

    # SUMMARIES
    def save_summary(self, summary_id, data):
        if firestore_db:
            firestore_db.collection('summaries').document(summary_id).set(data)
            return data
        else:
            summaries = self._read_summaries()
            summaries[summary_id] = data
            self._write_summaries(summaries)
            return data

    def get_summary_by_material(self, material_id):
        if firestore_db:
            docs = firestore_db.collection('summaries').where('materialId', '==', material_id).limit(1).get()
            for doc in docs:
                return doc.to_dict()
            return None
        else:
            summaries = self._read_summaries()
            for s in summaries.values():
                if s.get('materialId') == material_id:
                    return s
            return None

    def get_summary(self, summary_id):
        if firestore_db:
            doc_ref = firestore_db.collection('summaries').document(summary_id).get()
            if doc_ref.exists:
                return doc_ref.to_dict()
            return None
        else:
            summaries = self._read_summaries()
            return summaries.get(summary_id)

    def delete_summary(self, summary_id):
        if firestore_db:
            firestore_db.collection('summaries').document(summary_id).delete()
            return True
        else:
            summaries = self._read_summaries()
            if summary_id in summaries:
                del summaries[summary_id]
                self._write_summaries(summaries)
                return True
            return False

    # FLASHCARDS
    def save_flashcard_deck(self, deck_id, data):
        if firestore_db:
            firestore_db.collection('flashcards').document(deck_id).set(data)
            return data
        else:
            flashcards = self._read_flashcards()
            flashcards[deck_id] = data
            self._write_flashcards(flashcards)
            return data

    def get_flashcard_deck_by_material(self, material_id):
        if firestore_db:
            docs = firestore_db.collection('flashcards').where('materialId', '==', material_id).limit(1).get()
            for doc in docs:
                return doc.to_dict()
            return None
        else:
            flashcards = self._read_flashcards()
            for deck in flashcards.values():
                if deck.get('materialId') == material_id:
                    return deck
            return None

    def update_flashcard_progress(self, deck_id, card_id, user_id, progress_status):
        if firestore_db:
            doc_ref = firestore_db.collection('flashcards').document(deck_id)
            snapshot = doc_ref.get()
            if not snapshot.exists:
                return False
            deck = snapshot.to_dict()
            if deck.get('userId') != user_id:
                return False
            for card in deck.get('cards', []):
                if card.get('id') == card_id:
                    card['status'] = progress_status
                    doc_ref.set(deck)
                    return True
            return False
        else:
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

    # QUIZZES
    def save_quiz(self, quiz_id, data):
        if firestore_db:
            firestore_db.collection('quizzes').document(quiz_id).set(data)
            return data
        else:
            quizzes = self._read_quizzes()
            quizzes[quiz_id] = data
            self._write_quizzes(quizzes)
            return data

    def get_quiz_by_material(self, material_id):
        if firestore_db:
            docs = firestore_db.collection('quizzes').where('materialId', '==', material_id).limit(1).get()
            for doc in docs:
                return doc.to_dict()
            return None
        else:
            quizzes = self._read_quizzes()
            for quiz in quizzes.values():
                if quiz.get('materialId') == material_id:
                    return quiz
            return None

    def get_quiz(self, quiz_id):
        if firestore_db:
            doc_ref = firestore_db.collection('quizzes').document(quiz_id).get()
            if doc_ref.exists:
                return doc_ref.to_dict()
            return None
        else:
            quizzes = self._read_quizzes()
            return quizzes.get(quiz_id)

    # QUIZ ATTEMPTS
    def save_quiz_attempt(self, attempt_id, data):
        if firestore_db:
            firestore_db.collection('quiz_attempts').document(attempt_id).set(data)
            return data
        else:
            attempts = self._read_quiz_attempts()
            attempts[attempt_id] = data
            self._write_quiz_attempts(attempts)
            return data

    def get_quiz_attempts_by_quiz(self, quiz_id, user_id):
        if firestore_db:
            docs = firestore_db.collection('quiz_attempts').where('quizId', '==', quiz_id).where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            attempts = self._read_quiz_attempts()
            return [a for a in attempts.values() if a.get('quizId') == quiz_id and a.get('userId') == user_id]

    # STUDY PLANS
    def get_study_plan(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('study_plans').where('userId', '==', user_id).limit(1).get()
            for doc in docs:
                return doc.to_dict()
            return None
        else:
            plans = self._read_study_plans()
            for plan in plans.values():
                if plan.get('userId') == user_id:
                    return plan
            return None
            
    def save_study_plan(self, plan_id, data):
        if firestore_db:
            firestore_db.collection('study_plans').document(plan_id).set(data)
            return data
        else:
            plans = self._read_study_plans()
            plans[plan_id] = data
            self._write_study_plans(plans)
            return data

    # STUDY TASKS
    def get_study_tasks(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('study_tasks').where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            tasks = self._read_study_tasks()
            return [t for t in tasks.values() if t.get('userId') == user_id]
            
    def save_study_task(self, task_id, data):
        if firestore_db:
            firestore_db.collection('study_tasks').document(task_id).set(data)
            return data
        else:
            tasks = self._read_study_tasks()
            tasks[task_id] = data
            self._write_study_tasks(tasks)
            return data
            
    def update_task_status(self, task_id, user_id, status):
        if firestore_db:
            doc_ref = firestore_db.collection('study_tasks').document(task_id)
            snapshot = doc_ref.get()
            if snapshot.exists:
                task = snapshot.to_dict()
                if task.get('userId') == user_id:
                    task['status'] = status
                    doc_ref.set(task)
                    return task
            return None
        else:
            tasks = self._read_study_tasks()
            task = tasks.get(task_id)
            if task and task.get('userId') == user_id:
                task['status'] = status
                self._write_study_tasks(tasks)
                return task
            return None

    def update_study_task(self, task_id, user_id, update_data):
        if firestore_db:
            doc_ref = firestore_db.collection('study_tasks').document(task_id)
            snapshot = doc_ref.get()
            if snapshot.exists:
                task = snapshot.to_dict()
                if task.get('userId') == user_id:
                    allowed = {'title', 'description', 'dueDate', 'estimatedMinutes', 'type', 'priority', 'status'}
                    filtered = {k: v for k, v in update_data.items() if k in allowed}
                    task.update(filtered)
                    doc_ref.set(task)
                    return task
            return None
        else:
            tasks = self._read_study_tasks()
            task = tasks.get(task_id)
            if task and task.get('userId') == user_id:
                allowed = {'title', 'description', 'dueDate', 'estimatedMinutes', 'type', 'priority', 'status'}
                filtered = {k: v for k, v in update_data.items() if k in allowed}
                task.update(filtered)
                self._write_study_tasks(tasks)
                return task
            return None

    # APPOINTMENTS
    def get_appointments(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('appointments').where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            appointments = self._read_appointments()
            return [a for a in appointments.values() if a.get('userId') == user_id]
        
    def save_appointment(self, appointment_id, data):
        if firestore_db:
            firestore_db.collection('appointments').document(appointment_id).set(data)
            return data
        else:
            appointments = self._read_appointments()
            appointments[appointment_id] = data
            self._write_appointments(appointments)
            return data
            
    def delete_appointment(self, appointment_id, user_id):
        if firestore_db:
            doc_ref = firestore_db.collection('appointments').document(appointment_id)
            snapshot = doc_ref.get()
            if snapshot.exists and snapshot.to_dict().get('userId') == user_id:
                doc_ref.delete()
                return True
            return False
        else:
            appointments = self._read_appointments()
            if appointment_id in appointments and appointments[appointment_id].get('userId') == user_id:
                del appointments[appointment_id]
                self._write_appointments(appointments)
                return True
            return False

    # DELETIONS BY MATERIAL
    def delete_summary_by_material(self, material_id, user_id):
        if firestore_db:
            docs = firestore_db.collection('summaries').where('materialId', '==', material_id).where('userId', '==', user_id).get()
            deleted = False
            for doc in docs:
                doc.reference.delete()
                deleted = True
            return deleted
        else:
            summaries = self._read_summaries()
            to_delete = [k for k, s in summaries.items() if s.get('materialId') == material_id and s.get('userId') == user_id]
            for k in to_delete:
                del summaries[k]
            self._write_summaries(summaries)
            return len(to_delete) > 0

    def delete_flashcards_by_material(self, material_id, user_id):
        if firestore_db:
            docs = firestore_db.collection('flashcards').where('materialId', '==', material_id).where('userId', '==', user_id).get()
            deleted = False
            for doc in docs:
                doc.reference.delete()
                deleted = True
            return deleted
        else:
            flashcards = self._read_flashcards()
            to_delete = [k for k, d in flashcards.items() if d.get('materialId') == material_id and d.get('userId') == user_id]
            for k in to_delete:
                del flashcards[k]
            self._write_flashcards(flashcards)
            return len(to_delete) > 0

    def delete_quiz_by_material(self, material_id, user_id):
        if firestore_db:
            quizzes = firestore_db.collection('quizzes').where('materialId', '==', material_id).where('userId', '==', user_id).get()
            deleted_ids = []
            for q in quizzes:
                deleted_ids.append(q.id)
                q.reference.delete()
            
            for q_id in deleted_ids:
                attempts = firestore_db.collection('quiz_attempts').where('quizId', '==', q_id).get()
                for a in attempts:
                    a.reference.delete()
            return len(deleted_ids) > 0
        else:
            quizzes = self._read_quizzes()
            deleted_quiz_ids = [k for k, q in quizzes.items() if q.get('materialId') == material_id and q.get('userId') == user_id]
            for k in deleted_quiz_ids:
                del quizzes[k]
            self._write_quizzes(quizzes)
            if deleted_quiz_ids:
                attempts = self._read_quiz_attempts()
                to_delete_attempts = [k for k, a in attempts.items() if a.get('quizId') in deleted_quiz_ids]
                for k in to_delete_attempts:
                    del attempts[k]
                self._write_quiz_attempts(attempts)
            return len(deleted_quiz_ids) > 0

    # PURGE ALL DATA (PREFERENCES)
    def delete_all_tasks(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('study_tasks').where('userId', '==', user_id).get()
            count = 0
            for doc in docs:
                doc.reference.delete()
                count += 1
            return count
        else:
            tasks = self._read_study_tasks()
            to_delete = [k for k, t in tasks.items() if t.get('userId') == user_id]
            for k in to_delete:
                del tasks[k]
            self._write_study_tasks(tasks)
            return len(to_delete)

    def delete_all_appointments(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('appointments').where('userId', '==', user_id).get()
            count = 0
            for doc in docs:
                doc.reference.delete()
                count += 1
            return count
        else:
            appointments = self._read_appointments()
            to_delete = [k for k, a in appointments.items() if a.get('userId') == user_id]
            for k in to_delete:
                del appointments[k]
            self._write_appointments(appointments)
            return len(to_delete)

    # GOALS
    def get_goals(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('goals').where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            goals = self._read_goals()
            return [g for g in goals.values() if g.get('userId') == user_id]
        
    def save_goal(self, goal_id, data):
        if firestore_db:
            firestore_db.collection('goals').document(goal_id).set(data)
            return data
        else:
            goals = self._read_goals()
            goals[goal_id] = data
            self._write_goals(goals)
            return data

    # ACHIEVEMENTS
    def get_achievements(self, user_id):
        if firestore_db:
            docs = firestore_db.collection('achievements').where('userId', '==', user_id).get()
            return [doc.to_dict() for doc in docs]
        else:
            achievements = self._read_achievements()
            return [a for a in achievements.values() if a.get('userId') == user_id]
        
    def save_achievement(self, ach_id, data):
        if firestore_db:
            firestore_db.collection('achievements').document(ach_id).set(data)
            return data
        else:
            achievements = self._read_achievements()
            achievements[ach_id] = data
            self._write_achievements(achievements)
            return data

db_service = DBService()
