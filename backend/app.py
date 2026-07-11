from flask import Flask, jsonify
from flask_cors import CORS
from config.settings import load_config
from middleware.error_handler import register_error_handlers
from routes import register_blueprints
import logging

def create_app():
    # Initialize app
    app = Flask(__name__)
    
    # Load configuration
    load_config(app)
    
    # Setup CORS
    CORS(app)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO, 
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)
    logger.info("Starting StudyAI Backend...")
    
    # Register blueprints
    register_blueprints(app)
    
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response
    
    # Register error handlers
    register_error_handlers(app)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "service": "StudyAI Backend"}), 200
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=app.config.get('PORT', 5000), debug=app.config.get('DEBUG', True))
