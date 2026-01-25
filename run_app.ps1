Write-Host "Starting Discrete Math Calculator..."
Write-Host "Ensuring static files are served correctly..."

$env:FLASK_ENV = "development"

python web_app.py
$env:FLASK_ENV = "development"

# Run the Flask app
python web_app.py
