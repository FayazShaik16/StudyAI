from functools import wraps
from flask import request, jsonify, g
from services.auth_service import auth_service

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": {"code": "UNAUTHORIZED", "message": "Missing or invalid token"}}), 401
            
        token = auth_header.split(' ')[1]
        try:
            user = auth_service.verify_token(token)
            g.user = user
        except ValueError as e:
            return jsonify({"error": {"code": "UNAUTHORIZED", "message": str(e)}}), 401
            
        return f(*args, **kwargs)
    return decorated
