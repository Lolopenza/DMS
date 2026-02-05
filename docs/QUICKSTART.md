# Quick Start Guide

## Setup and Run the Application

### Step 1: Create Virtual Environment (if not exists)

```bash
# Navigate to project directory
cd "/Users/anvar/Anvar/Programming/Discrete-math/discrete math calculator 2/dmc"

# Create virtual environment
python3 -m venv venv
```

### Step 2: Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables

Create or edit `.env` file in the project root:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
FLASK_SECRET_KEY=your-secret-key-here
# Optional: Use a free model (default: google/gemma-3-12b-it:free - supports images!)
OPENROUTER_MODEL=google/gemma-3-12b-it:free
```

**💰 About Costs:**
- **FREE models available!** The app uses `google/gemma-3-12b-it:free` by default (no credits needed)
- This model supports **images/vision** - perfect for uploading math problems!
- Get your OpenRouter API key from: https://openrouter.ai/keys (free account, no credit card required for free models)
- Other free models: `meta-llama/Llama-3.2-3B-Instruct:free`, `google/gemini-flash-1.5:free`
- Paid models (if you want): `openai/gpt-4o-mini`, `openai/gpt-4o` (requires credits)

### Step 5: Run the Application

```bash
python web_app.py
```

You should see:
```
===== Discrete Math Calculator =====
Server started at: http://127.0.0.1:5000
Press Ctrl+C to stop the server
```

### Step 6: Open in Browser

Open your browser and go to:
```
http://127.0.0.1:5000/
```

### Step 7: Stop the Server

Press `Ctrl+C` in the terminal.

---

## Troubleshooting

### If venv doesn't activate:
```bash
# Make sure you're in the project directory
pwd

# Try with full path
source /Users/anvar/Anvar/Programming/Discrete-math/discrete\ math\ calculator\ 2/dmc/venv/bin/activate
```

### If dependencies fail to install:
```bash
# Upgrade pip first
pip install --upgrade pip setuptools wheel

# Install one by one if needed
pip install flask flask-cors sympy numpy matplotlib networkx
```

### If port 5000 is already in use:
```bash
# Use a different port
python web_app.py --port 5001
```

Then access at: `http://127.0.0.1:5001/`

---

## Daily Usage

Once everything is set up, you only need:

```bash
# 1. Navigate to project
cd "/Users/anvar/Anvar/Programming/Discrete-math/discrete math calculator 2/dmc"

# 2. Activate venv
source venv/bin/activate

# 3. Run app
python web_app.py
```
