from flask import jsonify

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request_error(error):
        return jsonify({"error": {"code": "BAD_REQUEST", "message": str(error)}}), 400

    @app.errorhandler(401)
    def unauthorized_error(error):
        return jsonify({"error": {"code": "UNAUTHORIZED", "message": "Authentication required."}}), 401

    @app.errorhandler(403)
    def forbidden_error(error):
        return jsonify({"error": {"code": "FORBIDDEN", "message": "Permission denied."}}), 403

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": {"code": "NOT_FOUND", "message": "Resource not found."}}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."}}), 500
