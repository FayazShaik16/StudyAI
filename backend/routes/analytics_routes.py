from flask import Blueprint, request, g
from middleware.auth_middleware import require_auth
from services.analytics_service import analytics_service
from utils.response import success_response, error_response

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@require_auth
def get_dashboard():
    try:
        data = analytics_service.get_dashboard_data(g.user['uid'])
        return success_response(data)
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)

@analytics_bp.route('/goals', methods=['GET', 'POST'])
@require_auth
def manage_goals():
    try:
        if request.method == 'GET':
            goals = analytics_service.get_goals(g.user['uid'])
            return success_response({"goals": goals})
        else:
            data = request.get_json() or {}
            goal = analytics_service.create_goal(g.user['uid'], data)
            return success_response({"goal": goal})
    except Exception as e:
        return error_response('SERVER_ERROR', str(e), 500)
