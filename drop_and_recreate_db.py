import os
from flask import Flask
from models import db, User, Location, CheckinCheckout, GeoLocation
from werkzeug.security import generate_password_hash

# Create Flask app
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize database
db.init_app(app)

with app.app_context():
    # Drop all tables
    print("Dropping all tables...")
    db.drop_all()
    
    # Create all tables
    print("Creating all tables...")
    db.create_all()
    
    # Add default locations
    print("Adding default locations...")
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
    
    # Add default admin user
    print("Adding default admin user...")
    admin_user = User(
        name="Admin User",
        email="admin@senslyze.com",
        is_admin=True
    )
    admin_user.set_password("admin123")
    db.session.add(admin_user)
    db.session.commit()
    
    print("Database setup complete!")