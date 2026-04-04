import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables before importing routes (routes need GEMINI_API_KEY)
# override=True ensures .env always wins over system environment variables
load_dotenv(override=True)

from routes.chat_routes import chat_bp
from routes.auth_routes import auth_bp
from routes.admin import admin_bp

# Serve the frontend folder as static files
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')

# Allow all origins for hackathon dev (tighten in production)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# --- Register Blueprints ---
app.register_blueprint(chat_bp,  url_prefix='/api')       # POST /api/chat
app.register_blueprint(auth_bp,  url_prefix='/api/auth')  # POST /api/auth/login, /api/auth/register
app.register_blueprint(admin_bp, url_prefix='/api/admin') # POST /api/admin/update-data

# --- Serve Frontend ---
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(FRONTEND_DIR, filename)

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
