# Discrete Math Calculator

A comprehensive calculator for discrete mathematics that works both online and offline.

## How to Run

### Option 1: With Flask Server (Recommended)

1. Run the PowerShell script:
   ```
   .\run.ps1
   ```
   This launches the app in client-side mode (calculations in browser)

2. For server-side calculation mode:
   ```
   .\run.ps1 -ServerMode
   ```

3. Visit http://127.0.0.1:5000 in your browser

### Option 2: Completely Offline (No Server)

1. Open `fallback.html` directly in your browser
2. All functionality will work in your browser with no server needed

## Features

- Combinatorics (combinations, permutations, factorial)
- Probability calculations
- Automata simulation
- Number Theory
- Set Theory operations

## Technical Details

- Built with Flask, HTML, CSS, and JavaScript
- Performs calculations either client-side or server-side
- Can run completely offline in standalone mode

## MCP Server

A minimal MCP (Math Control Protocol) server is provided in `mcp_server/server.py`.

- **Run the server:**
  ```bash
  python -m mcp_server.server
  ```
- **Default endpoint:**
  - `GET /status` returns a JSON status message.
- The server listens on port 5050 by default.

Ready for further MCP protocol and API expansion.
