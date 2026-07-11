import uuid
import json
from datetime import datetime, timezone
from services.ai_service import ai_service
from services.prompt_service import prompt_service
from services.db_service import db_service

class AnalyticsService:
    def get_dashboard_data(self, user_id):
        # 1. Fetch raw data
        all_attempts = []
        for file in db_service._read_quiz_attempts().values():
            if file.get('userId') == user_id:
                all_attempts.append(file)
                
        all_flashcards = []
        for deck in db_service._read_flashcards().values():
            if deck.get('userId') == user_id:
                all_flashcards.extend(deck.get('cards', []))
                
        tasks = db_service.get_study_tasks(user_id)

        # 2. Aggregate metrics
        total_study_time_seconds = sum([a.get('timeTaken', 0) for a in all_attempts])
        # Add estimated minutes from completed tasks
        for t in tasks:
            if t.get('status') == 'Completed':
                total_study_time_seconds += t.get('estimatedMinutes', 0) * 60
                
        total_hours = round(total_study_time_seconds / 3600, 1)

        avg_quiz_score = 0
        if all_attempts:
            avg_quiz_score = sum([a.get('percentage', 0) for a in all_attempts]) / len(all_attempts)

        mastered_cards = len([c for c in all_flashcards if c.get('status') == 'Known'])
        total_cards = len(all_flashcards)
        flashcard_mastery = round((mastered_cards / total_cards * 100) if total_cards > 0 else 0)

        completed_tasks = len([t for t in tasks if t.get('status') == 'Completed'])
        
        # Format history for chart (Last 5 quiz attempts)
        sorted_attempts = sorted(all_attempts, key=lambda x: x['createdAt'])
        chart_data = []
        for i, att in enumerate(sorted_attempts[-5:]):
            chart_data.append({
                "name": f"Attempt {i+1}",
                "score": att.get('percentage', 0)
            })

        # 4. Weak topics and quiz history
        quiz_history = []
        weak_topics_map = {}
        for att in sorted_attempts:
            # Try to get quiz info
            quiz = db_service.get_quiz(att.get('quizId'))
            material_title = "General Study"
            if quiz:
                mat = db_service.get_material(quiz.get('materialId'))
                if mat:
                    material_title = mat.get('title')
            
            quiz_history.append({
                "attemptId": att.get('attemptId'),
                "title": material_title,
                "score": att.get('score'),
                "totalQuestions": att.get('totalQuestions'),
                "percentage": att.get('percentage'),
                "createdAt": att.get('createdAt')
            })
            
            # Map wrong/correct answers to compute weak topics
            for res in att.get('results', []):
                topic = res.get('topic') or 'General'
                if topic not in weak_topics_map:
                    weak_topics_map[topic] = {"total": 0, "incorrect": 0}
                weak_topics_map[topic]["total"] += 1
                if not res.get('isCorrect'):
                    weak_topics_map[topic]["incorrect"] += 1
                    
        # Format weak topics
        weak_topics = []
        for topic, stats in weak_topics_map.items():
            incorrect_ratio = stats["incorrect"] / stats["total"] if stats["total"] > 0 else 0
            if incorrect_ratio > 0.3: # If more than 30% wrong
                weak_topics.append({
                    "topic": topic,
                    "percentage": round(incorrect_ratio * 100)
                })
        # Sort by percentage descending
        weak_topics.sort(key=lambda x: x["percentage"], reverse=True)

        metrics = {
            "totalStudyHours": total_hours,
            "averageQuizScore": round(avg_quiz_score),
            "flashcardMastery": flashcard_mastery,
            "completedTasks": completed_tasks,
            "chartData": chart_data,
            "quizHistory": sorted(quiz_history, key=lambda x: x['createdAt'], reverse=True),
            "weakTopics": weak_topics[:5] # Limit to top 5
        }

        # 3. Generate AI Insight
        system_prompt = prompt_service.get_analytics_system_prompt()
        user_prompt = prompt_service.get_analytics_user_prompt(json.dumps(metrics))
        
        try:
            ai_insight = ai_service.generate_completion(system_prompt, user_prompt).strip()
        except Exception:
            ai_insight = "Keep up the great work! Consistent study sessions yield the best results."
            
        metrics["aiInsight"] = ai_insight
        
        return metrics

    def get_goals(self, user_id):
        return db_service.get_goals(user_id)
        
    def create_goal(self, user_id, data):
        goal_id = str(uuid.uuid4())
        goal_data = {
            "goalId": goal_id,
            "userId": user_id,
            "title": data.get("title", "New Goal"),
            "target": data.get("target", 100),
            "current": data.get("current", 0),
            "type": data.get("type", "Hours"), # Hours, Score, Cards
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        return db_service.save_goal(goal_id, goal_data)

analytics_service = AnalyticsService()
