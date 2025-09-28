# install.ps1 - PowerShell installation script for YankoviC

Write-Host "Installing YankoviC dependencies..." -ForegroundColor Cyan

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Push-Location backend
npm install
Pop-Location

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
Pop-Location

# Install electron dependencies
Write-Host "Installing electron dependencies..." -ForegroundColor Yellow
Push-Location electron
npm install
Pop-Location

Write-Host "Installation complete!" -ForegroundColor Green
