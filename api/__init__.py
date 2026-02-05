"""
REST API endpoints
All API routes and schemas live here.
"""

from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import routes (will be added gradually)
# from .routes import set_theory, combinatorics, etc.
