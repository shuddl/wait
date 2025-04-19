#!/bin/bash

# Secure File Access Portal - Deployment Script
# This script automates the deployment of the web application
# on port 8080 using available web servers on your system

echo "======================================================"
echo "       Secure File Access Portal - Deployment"
echo "======================================================"

PORT=8080
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Deploying from: $SCRIPT_DIR"
echo "Target port: $PORT"
echo ""

# Change to the project directory
cd "$SCRIPT_DIR" || {
  echo "Error: Could not navigate to script directory"
  exit 1
}

# Function to check if a command is available
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for available server options
if command_exists python3; then
  echo "✅ Detected Python 3"
  echo "Starting server..."
  echo "Access your application at: http://localhost:$PORT"
  echo "Press Ctrl+C to stop the server"
  echo "------------------------------------------------------"
  python3 -m http.server "$PORT"
  
elif command_exists python; then
  # Check Python version
  if python -c "import sys; exit(0 if sys.version_info >= (3, 0) else 1)" 2>/dev/null; then
    echo "✅ Detected Python 3"
    echo "Starting server..."
    echo "Access your application at: http://localhost:$PORT"
    echo "Press Ctrl+C to stop the server"
    echo "------------------------------------------------------"
    python -m http.server "$PORT"
  else
    echo "✅ Detected Python 2"
    echo "Starting server..."
    echo "Access your application at: http://localhost:$PORT"
    echo "Press Ctrl+C to stop the server"
    echo "------------------------------------------------------"
    python -m SimpleHTTPServer "$PORT"
  fi
  
elif command_exists php; then
  echo "✅ Detected PHP"
  echo "Starting server..."
  echo "Access your application at: http://localhost:$PORT"
  echo "Press Ctrl+C to stop the server"
  echo "------------------------------------------------------"
  php -S "localhost:$PORT"
  
elif command_exists npx; then
  echo "✅ Detected Node.js with npx"
  echo "Starting server using http-server..."
  echo "Access your application at: http://localhost:$PORT"
  echo "Press Ctrl+C to stop the server"
  echo "------------------------------------------------------"
  npx http-server -p "$PORT"
  
elif command_exists http-server; then
  echo "✅ Detected http-server"
  echo "Starting server..."
  echo "Access your application at: http://localhost:$PORT"
  echo "Press Ctrl+C to stop the server"
  echo "------------------------------------------------------"
  http-server -p "$PORT"
  
else
  echo "❌ No suitable server found!"
  echo ""
  echo "Please install one of the following to serve the application:"
  echo "- Python 3 (recommended): https://www.python.org/downloads/"
  echo "- PHP: https://www.php.net/downloads"
  echo "- Node.js with http-server: npm install -g http-server"
  echo ""
  echo "After installing, run this script again."
  exit 1
fi
