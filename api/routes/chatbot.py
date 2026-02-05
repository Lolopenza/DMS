"""
Chatbot API Routes
Example of how API routes will be structured
"""
from flask import Blueprint, request, jsonify
from ai.chatbot import get_chatbot_service

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('/chatbot', methods=['POST'])
def chatbot():
    """
    Handle chatbot requests
    POST /api/chatbot
    Body: {"messages": [{"role": "user", "content": "..."}]}
    """
    try:
        data = request.get_json()
        messages = data.get('messages')
        
        if not messages or not isinstance(messages, list):
            return jsonify({'error': 'Missing or invalid messages'}), 400
        
        chatbot_service = get_chatbot_service()
        result = chatbot_service.chat(messages)
        
        if 'error' in result:
            status_code = 500
            if '401' in result['error']:
                status_code = 401
            elif '402' in result['error']:
                status_code = 402
            return jsonify(result), status_code
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': f'Server Error: {str(e)}'}), 500
