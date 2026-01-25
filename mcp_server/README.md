# Advanced MCP Server

## Setup

1. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```

2. Run the server:
   ```sh
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Endpoints
- `/math/eval` (POST): Evaluate math expressions
- `/code/format` (POST): Format Python code using black
- `/greet` (POST): Generate a greeting message
- `/system/info` (GET): Get system information
- `/mcp/manifest` (GET): MCP manifest for Cursor

## Cursor Integration

1. Ensure the server is running.
2. Place `.cursor/mcp.json` in your project root (see included example).
3. In Cursor, go to MCP Servers and verify the server appears.

Now you can use the advanced tools from Cursor's agent.