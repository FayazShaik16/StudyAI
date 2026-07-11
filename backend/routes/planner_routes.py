from flask import Blueprint, request, g
from middleware.auth_middleware import require_auth
from services.planner_service import planner_service
from utils.response import success_response, error_response

planner_bp = Blueprint('planner', __name__)

@planner_bp.route('/generate', methods=['POST'])
@require_auth
def generate_plan():
    try:
        data = request.get_json() or {}
        material_id = data.get('materialId')
        result = planner_service.generate_study_plan(g.user['uid'], material_id)
        return success_response(result)
    except RuntimeError as e:
        return error_response('AI_SERVICE_ERROR', str(e), 503)
    except Exception as e:
        return error_response('SERVER_ERROR', "Plan generation failed: " + str(e), 500)

@planner_bp.route('/tasks', methods=['GET', 'POST'])
@require_auth
def manage_tasks():
    try:
        if request.method == 'GET':
            tasks = planner_service.get_tasks(g.user['uid'])
            return success_response({"tasks": tasks})
        else:
            data = request.get_json() or {}
            task = planner_service.create_task(g.user['uid'], data)
            return success_response({"task": task})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/tasks/<task_id>/status', methods=['PUT'])
@require_auth
def update_task_status(task_id):
    try:
        data = request.get_json() or {}
        status = data.get('status')
        if not status:
            return error_response('BAD_REQUEST', "Missing status", 400)
            
        task = planner_service.update_task_status(task_id, g.user['uid'], status)
        return success_response({"task": task})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/tasks/<task_id>', methods=['PUT'])
@require_auth
def update_task(task_id):
    try:
        data = request.get_json() or {}
        task = planner_service.update_task(task_id, g.user['uid'], data)
        if not task:
            return error_response('NOT_FOUND', "Task not found", 404)
        return success_response({"task": task})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/appointments', methods=['GET', 'POST'])
@require_auth
def manage_appointments():
    try:
        if request.method == 'GET':
            apps = planner_service.get_appointments(g.user['uid'])
            return success_response({"appointments": apps})
        else:
            data = request.get_json() or {}
            app = planner_service.create_appointment(g.user['uid'], data)
            return success_response({"appointment": app})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/appointments/<appointment_id>', methods=['DELETE'])
@require_auth
def delete_appointment(appointment_id):
    try:
        planner_service.delete_appointment(appointment_id, g.user['uid'])
        return success_response({"message": "Appointment deleted"})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/tasks/clear', methods=['DELETE'])
@require_auth
def clear_all_tasks():
    try:
        from services.db_service import db_service
        count = db_service.delete_all_tasks(g.user['uid'])
        return success_response({"message": f"Cleared {count} tasks"})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@planner_bp.route('/appointments/clear', methods=['DELETE'])
@require_auth
def clear_all_appointments():
    try:
        from services.db_service import db_service
        count = db_service.delete_all_appointments(g.user['uid'])
        return success_response({"message": f"Cleared {count} appointments"})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)
