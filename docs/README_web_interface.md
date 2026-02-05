# How to Use the Web Interface

## 1. Complete Setup

Before running the web interface, make sure all required files are in place by running the setup script:

```bash
python setup_web.py
```

This will check for all necessary directories and files, and inform you if anything is missing.

## 2. Install Dependencies

First, make sure Flask is installed by running:

```bash
pip install flask flask-cors
```

Or to install all required dependencies:

```bash
cd dicrete_math_calculator
```

```bash
python -m pip install -r requirements.txt
```

If you get an error about missing modules, try installing them individually:

```bash
pip install flask
pip install flask-cors
pip install sympy numpy matplotlib networkx
```

## 3. Start the Flask Web Server

### Method 1: Direct Python Execution
Run the following command in your project directory:

```bash
python web_app.py
```

### Method 2: Using Flask CLI (Alternative)
If you prefer using Flask's built-in development server features:

```bash
# Set environment variables first (Windows)
set FLASK_APP=web_app.py
set FLASK_ENV=development

# Or on macOS/Linux
export FLASK_APP=web_app.py
export FLASK_ENV=development

# Then run
flask run
```

You should see output like:

```
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

## 4. Open the Web Interface

Open your web browser and go to:

```
http://127.0.0.1:5000/
```

You will see the main page of the Discrete Math Calculator web interface.

## 5. Using the Calculator

- Navigate to different pages (e.g., `/set_theory`) for specific calculators.
- Use the web forms to input your data and perform calculations.
- For set operations, POST requests are handled at `/api/set_operations`.

## 6. Stopping the Server

Press `CTRL+C` in the terminal where the server is running to stop it.

## 7. Troubleshooting

If you encounter issues:

- **Port already in use**: Try specifying a different port: `python web_app.py --port 5001`
- **Module not found errors**: Verify all dependencies are installed
- **Templates not found**: Make sure the `templates` directory exists in your project root with required HTML files
- **Static files not loading**: Ensure the `static` directory exists with CSS and JS files
- **Debug mode**: The server runs in debug mode by default, which helps identify issues

## 8. Accessing from Other Devices

To make the server accessible from other devices on your network:

```bash
python web_app.py --host 0.0.0.0
```

Then access using your computer's IP address instead of localhost.

```bash
python -m pip show jsonschema
```

```bash
python -m pip install jsonschema
```

# New Features

- Unified CSS variables for spacing, color, and border radius across all templates and main stylesheet.
- Consistent card/grid layouts for all pages.
- Dark mode toggle is always visible and accessible.
- ARIA labels, aria-live, and roles added to all interactive elements and result containers for accessibility.
- Input validation and error handling using Marshmallow schemas for all API endpoints.
- Structured JSON error responses with clear messages and status codes.
- Interactive graph and automata visualizations using Cytoscape.js and D3.js.
- Math rendering with MathJax for all mathematical formulas.

## Requirements
- marshmallow
- cytoscape
- d3

```bash
python -m pip install --upgrade pip setuptools wheel

pip install numpy

pip install --upgrade --force-reinstall numpy
```
