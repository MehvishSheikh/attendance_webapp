import os
from flask import Flask, send_from_directory, jsonify
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# App configuration 
app.secret_key = os.environ.get("SESSION_SECRET", "senslyze_secret_key")

# Health check endpoint
@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# Locations endpoint
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

# Serve frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('frontend/dist', path)):
        return send_from_directory('frontend/dist', path)
    else:
        return send_from_directory('frontend/dist', 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)