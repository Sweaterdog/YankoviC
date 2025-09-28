#!/bin/bash
# install.sh - Install all dependencies for YankoviC project and set up environment

set -e

# Install root dependencies if package.json exists
if [ -f package.json ]; then
  echo "Installing root dependencies..."
  npm install
fi

# Install backend dependencies
if [ -f backend/package.json ]; then
  echo "Installing backend dependencies..."
  cd backend
  npm install
  cd ..
fi

# Install frontend dependencies
if [ -f frontend/package.json ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  echo "Building VITE for CLI frontend..."
  npm run build
  cd ..
fi

# Add YankoviC to PATH for global CLI use
if ! command -v yankovic &> /dev/null; then
  echo "Adding YankoviC to PATH..."
  sudo ln -sf $(pwd)/cli.js /usr/local/bin/yankovic
  sudo chmod +x /usr/local/bin/yankovic
fi

echo "YankoviC installation and setup complete!"
