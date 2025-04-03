import logging
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.app import db
from backend.models import User, Location, CheckinCheckout

attendance_bp = Blueprint('attendance', __name__)
logger = logging.getLogger(__name__)

@attendance_bp.route('/status', methods=['GET'])
@jwt_required()
def check_status():
    user_id = get_jwt_identity()
    today = datetime.now().date()

    # Get the latest check-in record for today
    record = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today
    ).order_by(CheckinCheckout.checkin_time_stamp.desc()).first()

    if not record:
        return jsonify({
            'isCheckedIn': False
        })

    # User is checked in if there's a check-in time but no check-out time
    is_checked_in = record.checkin_time_stamp is not None and record.checkout_time_stamp is None

    return jsonify({
        'isCheckedIn': is_checked_in,
        'checkInTime': record.checkin_time_stamp.isoformat() if is_checked_in else None,
        'locationId': record.location_id if is_checked_in else None,
        'locationName': record.location.name if is_checked_in and record.location else None
    })

@attendance_bp.route('/checkin', methods=['POST'])
@jwt_required()
def check_in():
    user_id = get_jwt_identity()
    today = datetime.now().date()

    # Check if user has any check-in record for today (checked in or checked out)
    any_record_today = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today
    ).first()

    if any_record_today:
        if any_record_today.checkout_time_stamp:
            return jsonify({'error': 'You have already completed your attendance for today'}), 400
        else:
            return jsonify({'error': 'You are already checked in. Please check out first'}), 400

    now = datetime.now()

    # Get or create location (simplified for demo)
    # In a real-world app, you'd get the actual pincode from a geolocation service
    pincode = "123456"  # Default pincode for demo
    location_name = "Office Location"  # Default location name for demo

    location = Location.query.filter_by(pincode=pincode).first()
    if not location:
        location = Location(pincode=pincode, name=location_name)
        db.session.add(location)
        db.session.flush()  # Get the location ID without committing

    # Create check-in record
    check_in_record = CheckinCheckout(
        user_id=user_id,
        day=today,
        checkin_time_stamp=now,
        location_id=location.id
    )

    try:
        db.session.add(check_in_record)
        db.session.commit()

        return jsonify({
            'message': 'Check-in successful',
            'checkInTime': now.isoformat(),
            'locationName': location.name
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Check-in error: {str(e)}")
        return jsonify({'error': 'Check-in failed', 'message': str(e)}), 500

@attendance_bp.route('/checkout', methods=['POST'])
@jwt_required()
def check_out():
    user_id = get_jwt_identity()
    today = datetime.now().date()
    now = datetime.now()
    data = request.get_json()

    # Check if user has already checked out today
    existing_record = CheckinCheckout.query.filter_by(
        user_id=user_id,
        day=today
    ).first()

    if existing_record and existing_record.checkout_time_stamp:
        return jsonify({'error': 'You have already checked out for today'}), 400
    elif not existing_record:
        return jsonify({'error': 'No check-in found for today. Please check in first'}), 400

    # Validate task data
    if not data.get('task'):
        return jsonify({'error': 'Task details are required for check-out'}), 400
    if not data.get('taskStatus') or data.get('taskStatus') not in ['pending', 'blockage', 'completed']:
        return jsonify({'error': 'Valid task status is required (pending, blockage, completed)'}), 400
    if not data.get('projectName'):
        return jsonify({'error': 'Project name is required'}), 400

    # Update the record with check-out details
    existing_record.checkout_time_stamp = now
    existing_record.task = data.get('task')
    existing_record.task_status = data.get('taskStatus')
    existing_record.project_name = data.get('projectName')

    try:
        db.session.commit()

        return jsonify({
            'message': 'Check-out successful',
            'checkOutTime': now.isoformat(),
            'taskStatus': existing_record.task_status
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Check-out error: {str(e)}")
        return jsonify({'error': 'Check-out failed', 'message': str(e)}), 500

@attendance_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()

    # Get all check-in/check-out records for the user
    records = CheckinCheckout.query.filter_by(user_id=user_id).order_by(CheckinCheckout.day.desc()).all()

    # Format records for response
    history = []
    for record in records:
        history.append({
            'id': record.id,
            'date': record.day.isoformat(),
            'checkInTime': record.checkin_time_stamp.isoformat() if record.checkin_time_stamp else None,
            'checkOutTime': record.checkout_time_stamp.isoformat() if record.checkout_time_stamp else None,
            'location': record.location.name if record.location else None,
            'task': record.task,
            'taskStatus': record.task_status,
            'projectName': record.project_name
        })

    return jsonify(history)