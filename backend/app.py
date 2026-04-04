import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables before importing routes (routes need GEMINI_API_KEY)
load_dotenv()

from routes.chat_routes import chat_bp
from routes.auth_routes import auth_bp
from routes.admin import admin_bp

app = Flask(__name__)

# Allow all origins for hackathon dev (tighten in production)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Register Blueprints ---
app.register_blueprint(chat_bp,  url_prefix='/api')       # POST /api/chat
app.register_blueprint(auth_bp,  url_prefix='/api/auth')  # POST /api/auth/login, /api/auth/register
app.register_blueprint(admin_bp, url_prefix='/api/admin') # POST /api/admin/update-data

# --- Health Check ---
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "CampusCopilot Flask API is running.",
        "endpoints": {
            "chat":     "POST /api/chat",
            "login":    "POST /api/auth/login",
            "register": "POST /api/auth/register",
            "admin":    "POST /api/admin/update-data"
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
