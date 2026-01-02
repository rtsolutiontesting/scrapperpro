# Simple Firebase Deployment Script
Set-Location "D:\RTsolution"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FIREBASE FUNCTIONS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Build backend
Write-Host "[STEP 1/2] Building backend..." -ForegroundColor Yellow
Set-Location "backend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete`n" -ForegroundColor Green
Set-Location ".."

# Deploy
Write-Host "[STEP 2/2] Deploying to Firebase Functions..." -ForegroundColor Yellow
Write-Host "Estimated time: 6-11 minutes (first time: 10-15 min)`n" -ForegroundColor Cyan
Write-Host "Progress will show below:`n" -ForegroundColor White

# Run deployment and show output in real-time
firebase deploy --only functions

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ DEPLOYMENT SUCCESSFUL!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ DEPLOYMENT FAILED`n" -ForegroundColor Red
}

