from flask import Blueprint, request, g
from middleware.auth_middleware import require_auth
from services.summary_service import summary_service
from services.flashcard_service import flashcard_service
from services.quiz_service import quiz_service
from utils.response import success_response, error_response

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/summary/generate/<material_id>', methods=['POST'])
@require_auth
def generate_summary(material_id):
    try:
        force = request.args.get('force', 'false').lower() == 'true'
        summary = summary_service.generate_summary(material_id, g.user['uid'], force_regenerate=force)
        return success_response({"summary": summary})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e), 400)
    except RuntimeError as e:
        return error_response('AI_SERVICE_ERROR', str(e), 503)
    except Exception as e:
        return error_response('SERVER_ERROR', "Summary generation failed: " + str(e), 500)

@ai_bp.route('/summary/<material_id>', methods=['GET'])
@require_auth
def get_summary(material_id):
    try:
        summary = summary_service.get_summary_for_material(material_id, g.user['uid'])
        if not summary:
            return error_response('NOT_FOUND', "Summary not found", 404)
        return success_response({"summary": summary})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/flashcards/generate/<material_id>', methods=['POST'])
@require_auth
def generate_flashcards(material_id):
    try:
        force = request.args.get('force', 'false').lower() == 'true'
        count = int(request.args.get('count', '10'))
        deck = flashcard_service.generate_flashcards(material_id, g.user['uid'], force_regenerate=force, count=count)
        return success_response({"deck": deck})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e), 400)
    except RuntimeError as e:
        return error_response('AI_SERVICE_ERROR', str(e), 503)
    except Exception as e:
        return error_response('SERVER_ERROR', "Flashcard generation failed: " + str(e), 500)

@ai_bp.route('/flashcards/<material_id>', methods=['GET'])
@require_auth
def get_flashcards(material_id):
    try:
        deck = flashcard_service.get_flashcards_for_material(material_id, g.user['uid'])
        if not deck:
            return error_response('NOT_FOUND', "Flashcards not found", 404)
        return success_response({"deck": deck})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/flashcards/<deck_id>/cards/<card_id>/progress', methods=['PUT'])
@require_auth
def update_flashcard_progress(deck_id, card_id):
    try:
        data = request.get_json() or {}
        status = data.get('status')
        if not status:
            return error_response('BAD_REQUEST', "Missing status field", 400)
            
        flashcard_service.update_card_progress(deck_id, card_id, g.user['uid'], status)
        return success_response({"message": "Progress updated"})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e), 400)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/quiz/generate/<material_id>', methods=['POST'])
@require_auth
def generate_quiz(material_id):
    try:
        force = request.args.get('force', 'false').lower() == 'true'
        quiz = quiz_service.generate_quiz(material_id, g.user['uid'], force_regenerate=force)
        return success_response({"quiz": quiz})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e), 400)
    except RuntimeError as e:
        return error_response('AI_SERVICE_ERROR', str(e), 503)
    except Exception as e:
        return error_response('SERVER_ERROR', "Quiz generation failed: " + str(e), 500)

@ai_bp.route('/quiz/<material_id>', methods=['GET'])
@require_auth
def get_quiz(material_id):
    try:
        quiz = quiz_service.get_quiz_for_material(material_id, g.user['uid'])
        if not quiz:
            return error_response('NOT_FOUND', "Quiz not found", 404)
        return success_response({"quiz": quiz})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/quiz/<quiz_id>/submit', methods=['POST'])
@require_auth
def submit_quiz_attempt(quiz_id):
    try:
        data = request.get_json() or {}
        answers = data.get('answers', {})
        time_taken = data.get('timeTaken', 0)
        
        attempt = quiz_service.submit_quiz_attempt(quiz_id, g.user['uid'], answers, time_taken)
        return success_response({"attempt": attempt})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e), 400)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/quiz/<quiz_id>/attempts', methods=['GET'])
@require_auth
def get_quiz_attempts(quiz_id):
    try:
        attempts = quiz_service.get_quiz_attempts(quiz_id, g.user['uid'])
        return success_response({"attempts": attempts})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/summary/<material_id>', methods=['DELETE'])
@require_auth
def delete_summary(material_id):
    try:
        from services.db_service import db_service
        db_service.delete_summary_by_material(material_id, g.user['uid'])
        return success_response({"message": "Summary cleared"})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/flashcards/<material_id>', methods=['DELETE'])
@require_auth
def delete_flashcards(material_id):
    try:
        from services.db_service import db_service
        db_service.delete_flashcards_by_material(material_id, g.user['uid'])
        return success_response({"message": "Flashcards cleared"})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@ai_bp.route('/quiz/<material_id>/clear', methods=['DELETE'])
@require_auth
def delete_quiz(material_id):
    try:
        from services.db_service import db_service
        db_service.delete_quiz_by_material(material_id, g.user['uid'])
        return success_response({"message": "Quiz and attempts cleared"})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)
