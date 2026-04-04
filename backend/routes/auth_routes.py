from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth_bp', __name__)

# -------------------------------------------------------------------
# Simple in-memory user store for hackathon demo.
# In production, replace this with a real database (MongoDB, etc.)
# -------------------------------------------------------------------
_users = [
    {"email": "student@campus.edu", "password": "student123", "role": "student", "name": "Demo Student"},
    {"email": "faculty@campus.edu", "password": "faculty123", "role": "faculty", "name": "Demo Faculty"},
    {"email": "admin@campus.edu",   "password": "admin123",   "role": "admin",   "name": "Admin"},
]

def find_user(email):
    return next((u for u in _users if u["email"].lower() == email.lower()), None)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint.
    Expects: { "email": str, "password": str }
    Returns: { "message": str, "role": str, "name": str }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = find_user(email)

    if not user or user["password"] != password:
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "message": "Login successful",
        "role": user["role"],
        "name": user["name"]
    }), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register endpoint.
    Expects: { "name": str, "email": str, "password": str, "role": str }
    Returns: { "message": str }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip()
    password = data.get("password", "").strip()
    role     = data.get("role", "student").strip().lower()

    if not all([name, email, password]):
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role not in ("student", "faculty", "admin"):
        return jsonify({"error": "Invalid role. Must be student, faculty, or admin"}), 400

    if find_user(email):
        return jsonify({"error": "User with this email already exists"}), 409

    _users.append({"email": email, "password": password, "role": role, "name": name})

    return jsonify({"message": f"Account created successfully. Welcome, {name}!"}), 201
