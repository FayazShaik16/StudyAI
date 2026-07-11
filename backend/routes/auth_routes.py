from flask import Blueprint, request, g
from services.auth_service import auth_service
from middleware.auth_middleware import require_auth
from utils.response import success_response, error_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return error_response('BAD_REQUEST', 'Email and password are required')
        
    try:
        token, user = auth_service.signup(name, email, password)
        return success_response({"token": token, "user": user})
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e))

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return error_response('BAD_REQUEST', 'Email and password are required')
        
    try:
        token, user = auth_service.login(email, password)
        return success_response({"token": token, "user": user})
    except ValueError as e:
        return error_response('UNAUTHORIZED', str(e), 401)

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    return success_response({"message": "Logged out successfully"})

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    return success_response({"user": g.user})
