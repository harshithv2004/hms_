import os
import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
from app.extensions import db
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend applications
    CORS(app, resources={r"/api/*": {"origins": "*"}}, methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    # Global error handlers
    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"message": "Resource not found", "error": "404 Not Found"}), 404

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return jsonify({"message": "Method not allowed", "error": "405 Method Not Allowed"}), 405

    @app.errorhandler(500)
    def handle_server_error(e):
        err_msg = str(e)
        app.logger.error(f"Internal Server Error: {err_msg}")
        return jsonify({
            "message": "Internal server error occurred while processing request.",
            "error": err_msg
        }), 500

    # Ensure tables are created upon initialization or first request
    @app.before_request
    def ensure_db_tables():
        # Only run table check once per worker context
        if not getattr(app, "_tables_initialized", False):
            try:
                db.create_all()
                app._tables_initialized = True
            except Exception as ex:
                app.logger.warning(f"Deferred table initialization failed: {ex}")

    with app.app_context():
        try:
            db.create_all()
            app._tables_initialized = True
        except Exception as e:
            app.logger.warning(f"Database table creation deferred: {e}")

    return app
