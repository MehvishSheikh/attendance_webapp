import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    set_access_cookies, 
    unset_jwt_cookies, 
    jwt_required, 
    get_jwt_identity
)
from backend.app import db
from backend.models import User

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token and set cookie
        access_token = create_access_token(identity=new_user.id)
        response = jsonify(new_user.to_dict())
        set_access_cookies(response, access_token)
        
        return response, 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=data['email']).first()
    
    # Check if user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create access token and set cookie
    access_token = create_access_token(identity=user.id)
    response = jsonify(user.to_dict())
    set_access_cookies(response, access_token)
    
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict())
