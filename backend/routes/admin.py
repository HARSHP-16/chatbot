from flask import Blueprint, request, jsonify
from ..utils.data_manager import add_entry

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/update-data', methods=['POST'])
def update_data():
    """
    API Endpoint to add dynamic updates to campus data.
    Input validation, adding entry to JSON, and returning success/error context.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400
            
        success, message = add_entry(data)
        
        if success:
            return jsonify({"message": message}), 201
        else:
            return jsonify({"error": message}), 400
            
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500
