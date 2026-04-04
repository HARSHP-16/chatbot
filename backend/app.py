import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables
load_dotenv()

from routes.chat_routes import chat_bp

app = Flask(__name__)
# Enable CORS for the frontend port (e.g. 5500 if using VSCode live server)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(chat_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "CampusCopilot Flask API is running."})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
