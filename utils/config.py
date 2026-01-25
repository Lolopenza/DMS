import os

MCP_SERVER_URL = os.getenv('MCP_SERVER_URL', 'http://localhost:5001')
MCP_ENABLED = os.getenv('MCP_ENABLED', 'true').lower() == 'true'