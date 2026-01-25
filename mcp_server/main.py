from fastapi import FastAPI, Request
from pydantic import BaseModel
import subprocess
import platform
import sys
import math

app = FastAPI()

class MathRequest(BaseModel):
    expression: str

class CodeFormatRequest(BaseModel):
    code: str

class GreetRequest(BaseModel):
    name: str

@app.post("/math/eval")
def eval_math(req: MathRequest):
    try:
        result = eval(req.expression, {"__builtins__": None, "math": math}, {})
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}

@app.post("/code/format")
def format_code(req: CodeFormatRequest):
    try:
        process = subprocess.run([
            sys.executable, "-m", "black", "-q", "-"],
            input=req.code.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        if process.returncode == 0:
            return {"formatted_code": process.stdout.decode()}
        else:
            return {"error": process.stderr.decode()}
    except Exception as e:
        return {"error": str(e)}

@app.post("/greet")
def greet(req: GreetRequest):
    return {"greeting": f"Hello, {req.name}! Welcome to the advanced MCP server."}

@app.get("/system/info")
def system_info():
    return {
        "platform": platform.system(),
        "platform_release": platform.release(),
        "python_version": platform.python_version(),
        "processor": platform.processor(),
    }

@app.get("/mcp/manifest")
def mcp_manifest():
    return {
        "name": "Advanced MCP Server",
        "description": "Provides math evaluation, code formatting, greeting, and system info tools.",
        "tools": [
            {"name": "eval_math", "endpoint": "/math/eval", "description": "Evaluate math expressions."},
            {"name": "format_code", "endpoint": "/code/format", "description": "Format Python code using black."},
            {"name": "greet", "endpoint": "/greet", "description": "Generate a greeting message."},
            {"name": "system_info", "endpoint": "/system/info", "description": "Get system information."}
        ]
    }