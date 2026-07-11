from flask import Blueprint

def register_blueprints(app):
    from routes.auth_routes import auth_bp
    from routes.materials_routes import materials_bp
    from routes.ai_routes import ai_bp
    from routes.planner_routes import planner_bp
    from routes.analytics_routes import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(materials_bp, url_prefix='/api/v1/materials')
    app.register_blueprint(ai_bp, url_prefix='/api/v1/ai')
    app.register_blueprint(planner_bp, url_prefix='/api/v1/planner')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
