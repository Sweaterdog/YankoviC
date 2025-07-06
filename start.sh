#!/bin/bash

# The Accordion - Full Stack Electron Starter Script

cleanup() {
    echo "Shutting down servers..."
    kill $FRONTEND_PID
    kill $BACKEND_PID
    echo "All done. Have a weird day!"
}

trap cleanup EXIT INT TERM

# --- Start Local File API Backend ---
echo "🎶 Starting Local File API Backend..."
cd backend
npm start &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"
cd ..

# --- Start React Frontend Dev Server ---
echo "🎨 Starting React Frontend (Vite Dev Server)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"
cd ..

# Wait for a few seconds for servers to be ready
echo "Waiting for servers to initialize..."
sleep 5

# --- Launch the Electron App ---
echo "🚀 Launching The Accordion IDE (Electron App)..."
npm start

# The 'trap' will handle cleanup when you close the Electron app or press Ctrl+C