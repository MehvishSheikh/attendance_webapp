import os
from datetime import datetime, timedelta
import logging

from flask import Flask, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from sqlalchemy.orm import DeclarativeBase
from backend.extensions import db
# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Setup base SQLAlchemy model
class Base(DeclarativeBase):
    pass

# Initialize extensions

jwt = JWTManager()

# Create the Flask app
app = Flask(__name__)

# Configure the app
app.secret_key = os.environ.get("SESSION_SECRET", "senslyze_secret_key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/senslyze")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "jwt_senslyze_secret_key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_COOKIE_SECURE"] = False  # Set to True in production with HTTPS
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = True

# Initialize extensions with app
db.init_app(app)
jwt.init_app(app)
CORS(app, supports_credentials=True)

# Import and register blueprints
with app.app_context():
    from backend.routes.auth import auth_bp
    from backend.routes.attendance import attendance_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    
    # Serve frontend static files and for SPA routing
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join('frontend/dist', path)):
            return send_from_directory('frontend/dist', path)
        else:
            return send_from_directory('frontend/dist', 'index.html')
    
    # Import models and create tables
    import backend.models
    db.create_all()

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request", "message": str(error)}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized", "message": "Authentication required"}), 401

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found", "message": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Server error", "message": "Internal server error"}), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/api/locations')
def get_locations():
    """Get all available locations"""
    # Sample locations data
    locations = [
        {"id": 1, "pincode": "500001", "name": "Hyderabad Office"},
        {"id": 2, "pincode": "600001", "name": "Chennai Office"},
        {"id": 3, "pincode": "400001", "name": "Mumbai Office"},
        {"id": 4, "pincode": "110001", "name": "Delhi Office"},
        {"id": 5, "pincode": "560001", "name": "Bangalore Office"}
    ]
    return jsonify(locations)
