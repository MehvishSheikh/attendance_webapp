import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.app import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    
    def set_password(self, password):
        self.password = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email
        }

class Location(db.Model):
    __tablename__ = 'location'
    
    id = db.Column(db.Integer, primary_key=True)
    pincode = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'pincode': self.pincode,
            'name': self.name
        }

class CheckinCheckout(db.Model):
    __tablename__ = 'checkin_checkout'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    day = db.Column(db.Date, nullable=False, default=datetime.date.today)
    checkin_time_stamp = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    checkout_time_stamp = db.Column(db.DateTime, nullable=True)
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    task = db.Column(db.Text, nullable=True)
    task_status = db.Column(db.String(20), nullable=True)  # pending, blockage, completed
    project_name = db.Column(db.String(100), nullable=True)
    
    # Define relationships
    user = db.relationship('User', backref=db.backref('checkins', lazy=True))
    location = db.relationship('Location', backref=db.backref('checkins', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'day': self.day.isoformat() if self.day else None,
            'checkin_time_stamp': self.checkin_time_stamp.isoformat() if self.checkin_time_stamp else None,
            'checkout_time_stamp': self.checkout_time_stamp.isoformat() if self.checkout_time_stamp else None,
            'location_id': self.location_id,
            'location_name': self.location.name if self.location else None,
            'task': self.task,
            'task_status': self.task_status,
            'project_name': self.project_name
        }
