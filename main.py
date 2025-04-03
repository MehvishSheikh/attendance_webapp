import os
from flask import Flask, send_from_directory, jsonify, request, session
from flask_cors import CORS
from datetime import datetime, date
import logging
from werkzeug.security import generate_password_hash, check_password_hash
import json

# Import database models
from models import db, User, Location, CheckinCheckout

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# App configuration 
app.secret_key = os.environ.get("SESSION_SECRET", "senslyze_secret_key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

# Enable CORS
CORS(app, supports_credentials=True)

# Create tables if they don't exist
with app.app_context():
    db.create_all()
    
    # Add default locations if not already created
    if not Location.query.first():
        default_locations = [
            {"pincode": "500001", "name": "Hyderabad Office"},
            {"pincode": "600001", "name": "Chennai Office"},
            {"pincode": "400001", "name": "Mumbai Office"},
            {"pincode": "110001", "name": "Delhi Office"},
            {"pincode": "560001", "name": "Bangalore Office"}
        ]
        for loc_data in default_locations:
            location = Location(pincode=loc_data["pincode"], name=loc_data["name"])
            db.session.add(location)
        db.session.commit()

# Auth Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if email already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "Email already registered"}), 400
    
    user = User(
        name=data.get('name'),
        email=data.get('email')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully", "user": user.to_dict()}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({"error": "Invalid email or password"}), 401
    
    session['user_id'] = user.id
    # Log login attempt for debugging
    app.logger.info(f"User logged in: {user.email}")
    
    response = jsonify({"message": "Login successful", "user": user.to_dict()}), 200
    return response

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    user_id = session.get('user_id')
    if user_id:
        app.logger.info(f"User logged out: ID {user_id}")
    
    session.pop('user_id', None)
    response = jsonify({"message": "Logged out successfully"}), 200
    return response

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        response = jsonify({"error": "Not authenticated"}), 401
        return response
    
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        response = jsonify({"error": "User not found"}), 404
        return response
    
    response = jsonify({"user": user.to_dict()}), 200
    return response

# Attendance Routes
@app.route('/api/attendance/status', methods=['GET'])
def check_status():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    today = date.today()
    check_record = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today,
        checkout_time_stamp=None
    ).first()
    
    if check_record:
        location = Location.query.get(check_record.location_id)
        return jsonify({
            "isCheckedIn": True,
            "id": check_record.id,
            "checkInTime": check_record.checkin_time_stamp.isoformat(),
            "location": location.name if location else None
        }), 200
    else:
        return jsonify({"isCheckedIn": False}), 200

@app.route('/api/attendance/checkin', methods=['POST'])
def check_in():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    location_id = data.get('locationId')
    
    # Log received data for debugging
    app.logger.debug(f"Check-in request with location ID: {location_id}")
    
    # Get the selected location
    location = Location.query.get(location_id) if location_id else Location.query.first()
    
    if not location:
        return jsonify({"error": "No valid location found"}), 400
    
    today = date.today()
    existing_record = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today,
        checkout_time_stamp=None
    ).first()
    
    if existing_record:
        return jsonify({"error": "Already checked in today"}), 400
    
    check_record = CheckinCheckout(
        user_id=user_id,
        day=today,
        location_id=location.id,
        checkin_time_stamp=datetime.now()
    )
    
    db.session.add(check_record)
    db.session.commit()
    
    return jsonify({
        "message": "Checked in successfully",
        "id": check_record.id,
        "checkInTime": check_record.checkin_time_stamp.isoformat(),
        "location": location.name
    }), 201

@app.route('/api/attendance/checkout', methods=['POST'])
def check_out():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    app.logger.info(f"Raw checkout data received: {data}")
    
    task = data.get('task')
    task_status = data.get('taskStatus')  # Changed from task_status to match frontend
    project_name = data.get('projectName')  # Changed from project_name to match frontend
    
    # Log received data for debugging
    app.logger.debug(f"Parsed checkout data: task={task}, task_status={task_status}, project_name={project_name}")
    
    if not task or not task_status or not project_name:
        app.logger.error(f"Missing required fields. Received: {data}")
        return jsonify({"error": f"Task, task status, and project name are required. Received: {data}"}), 400
    
    today = date.today()
    check_record = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today,
        checkout_time_stamp=None
    ).first()
    
    if not check_record:
        return jsonify({"error": "No active check-in found"}), 400
    
    check_record.checkout_time_stamp = datetime.now()
    check_record.task = task
    check_record.task_status = task_status
    check_record.project_name = project_name
    
    db.session.commit()
    
    return jsonify({
        "message": "Checked out successfully",
        "id": check_record.id,
        "checkOutTime": check_record.checkout_time_stamp.isoformat()
    }), 200

@app.route('/api/attendance/history', methods=['GET'])
def get_history():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    records = CheckinCheckout.query.filter_by(user_id=user_id).order_by(
        CheckinCheckout.day.desc(), 
        CheckinCheckout.checkin_time_stamp.desc()
    ).all()
    
    history = []
    for record in records:
        history.append({
            'id': record.id,
            'date': record.day.isoformat() if record.day else None,
            'checkInTime': record.checkin_time_stamp.isoformat() if record.checkin_time_stamp else None,
            'checkOutTime': record.checkout_time_stamp.isoformat() if record.checkout_time_stamp else None,
            'location': record.location.name if record.location else None,
            'task': record.task,
            'taskStatus': record.task_status,
            'projectName': record.project_name
        })
    
    return jsonify(history), 200

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Locations endpoint
@app.route('/api/locations')
def get_locations():
    """Get all available locations"""
    locations = Location.query.all()
    return jsonify([location.to_dict() for location in locations])

# Serve frontend static files - but make sure this is AFTER all API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Don't intercept API routes
    if path.startswith('api/'):
        return jsonify({"error": "API route not found"}), 404
    
    if path != "" and os.path.exists(os.path.join('frontend/dist', path)):
        return send_from_directory('frontend/dist', path)
    else:
        return send_from_directory('frontend/dist', 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)