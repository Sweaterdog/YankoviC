# uninstall.ps1 - PowerShell uninstall script for YankoviC

Write-Host "Uninstalling YankoviC CLI..." -ForegroundColor Cyan

# Remove yankovic symlink from a common bin directory if it exists
$symlink = "/usr/local/bin/yankovic"
if (Test-Path $symlink) {
    try {
        Remove-Item $symlink -Force
        Write-Host "Removed symlink: $symlink" -ForegroundColor Yellow
    } catch {
        Write-Host "Failed to remove symlink: $symlink" -ForegroundColor Red
    }
} else {
    Write-Host "No yankovic symlink found at $symlink. Nothing to remove." -ForegroundColor Yellow
}

Write-Host "Uninstall complete!" -ForegroundColor Green
