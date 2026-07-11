from flask import jsonify

def success_response(data=None, status_code=200):
    return jsonify(data) if data is not None else jsonify({}), status_code

def error_response(code, message, status_code=400):
    return jsonify({
        "error": {
            "code": code,
            "message": message
        }
    }), status_code
