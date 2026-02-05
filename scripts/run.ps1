param(
    [switch]$ServerMode = $false
)

# Set your OpenRouter API key as an environment variable before running
# $env:OPENROUTER_API_KEY = "your-key-here"

Write-Host "===== Discrete Math Calculator =====" -ForegroundColor Cyan

if ($ServerMode) {
    $env:DMC_MODE = "server"
    Write-Host "Starting in SERVER-SIDE mode..." -ForegroundColor Yellow
    Write-Host "API calls will be processed by the server"
} else {
    $env:DMC_MODE = "client"
    Write-Host "Starting in CLIENT-SIDE mode..." -ForegroundColor Green
    Write-Host "All calculations will be performed in the browser"
}

try {
    # Check if Flask is installed
    python -c "import flask" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Flask is not installed. Installing now..." -ForegroundColor Yellow
        pip install flask
    }
    
    # Run Flask app
    python web_app.py
}
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    [void][System.Console]::ReadKey($true)
}
