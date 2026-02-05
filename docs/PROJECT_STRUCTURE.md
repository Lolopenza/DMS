# 📁 Project Structure

## Root Directory

```
dmc/
├── web_app.py              # Main Flask application (entry point)
├── requirements.txt         # Python dependencies
├── README.md               # Main project documentation
├── .env                    # Environment variables (not in git)
├── .gitignore              # Git ignore rules
└── .flake8                 # Linting configuration
```

## Core Directories

### `/core` - Mathematical Logic
All discrete mathematics modules:
- `combinatorics/` - Permutations, combinations, etc.
- `automata/` - DFA, NFA, PDA, Turing machines
- `graph_theory/` - Graphs, algorithms, visualizations
- `set_theory/` - Set operations, relations
- `logic/` - Propositional and predicate logic
- `number_theory/` - Divisibility, cryptography
- `discrete_probability/` - Probability calculations
- `algebraic_structures/` - Groups, boolean algebra
- `functions_relations/` - Functions and orders
- `visualization/` - Graph visualization utilities

### `/web` - Frontend
- `templates/` - HTML templates (Jinja2)
- `static/` - Static files (CSS, JS, images)

### `/api` - REST API
- `routes/` - API endpoint blueprints
  - `chatbot.py` - Chatbot API route

### `/ai` - AI Integration
- `chatbot.py` - AI chatbot service

### `/db` - Database
Ready for future database models and migrations

### `/utils` - Utilities
Shared utility functions used across the project

### `/docs` - Documentation
All markdown documentation files:
- `QUICKSTART.md` - Setup guide
- `ARCHITECTURE.md` - Architecture overview
- `REFACTORING_SUMMARY.md` - Refactoring notes
- And more...

### `/scripts` - Helper Scripts
Development and maintenance scripts:
- `check_api_key.py` - Test API key
- `check_dependencies.py` - Check dependencies
- `migrate_core.py` - Migration helper (historical)
- `run_app.ps1` - Run script for Windows
- Legacy: `gui.py`, `main.py`

### `/mcp_server` - MCP Server
Model Context Protocol server (separate service)

## File Organization Rules

1. **Core logic** → `/core`
2. **Frontend** → `/web`
3. **API routes** → `/api/routes`
4. **AI services** → `/ai`
5. **Documentation** → `/docs`
6. **Scripts** → `/scripts`
7. **Utilities** → `/utils`

## Adding New Files

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

**New documentation:**
```
docs/MY_FEATURE.md
```

**New script:**
```
scripts/my_script.py
```
