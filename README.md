# Discrete Math Calculator (DMC)

Comprehensive web application for solving discrete mathematics problems.

## 🚀 Quick Start

```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
# Edit .env file with your OPENROUTER_API_KEY

# 4. Run the application
python web_app.py
```

Open http://127.0.0.1:5000/ in your browser.

## 📁 Project Structure

```
dmc/
├── core/          # Mathematical logic (combinatorics, automata, graph theory, etc.)
├── api/           # REST API endpoints
├── web/           # Frontend (templates + static files)
├── ai/            # AI integration (chatbot)
├── db/            # Database models (ready for future use)
├── utils/         # Utility functions
├── scripts/       # Helper scripts
└── docs/          # Documentation
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - How to set up and run
- **[Architecture](docs/ARCHITECTURE.md)** - Project architecture overview
- **[Refactoring Summary](docs/REFACTORING_SUMMARY.md)** - Recent refactoring changes

## 🛠️ Development

### Scripts

- `scripts/check_api_key.py` - Test OpenRouter API key
- `scripts/migrate_core.py` - Migration helper (already done)
- `scripts/update_imports.py` - Update imports helper (already done)

### Adding New Features

**New mathematical module:**
```
core/new_module/
  ├── __init__.py
  └── calculations.py
```

**New API endpoint:**
```
api/routes/my_feature.py
```

**New AI function:**
```
ai/my_service.py
```

## 📝 Requirements

See `requirements.txt` for all dependencies.

## 🔑 Environment Variables

Create `.env` file:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=google/gemma-3-12b-it:free
FLASK_SECRET_KEY=your-secret-key-here
```

## 📄 License

[Your License Here]
