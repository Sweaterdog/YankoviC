#!/bin/bash
# install.sh - Install all dependencies for YankoviC project

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
  cd ..
fi

echo "All dependencies installed successfully!"
