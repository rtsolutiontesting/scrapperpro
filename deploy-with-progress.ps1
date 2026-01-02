# Firebase Functions Deployment with Progress Bar
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   FIREBASE FUNCTIONS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Change to root directory
Set-Location "D:\RTsolution"

# Step 1: Build (if not skipped)
if (-not $SkipBuild) {
    Write-Host "[1/3] Building backend..." -ForegroundColor Yellow
    Set-Location "backend"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build complete`n" -ForegroundColor Green
    Set-Location ".."
}

# Step 2: Deploy with progress monitoring
Write-Host "[2/3] Deploying to Firebase Functions..." -ForegroundColor Yellow
Write-Host "This typically takes 6-11 minutes (first time: 10-15 min)`n" -ForegroundColor Cyan

$startTime = Get-Date
$maxDuration = 900 # 15 minutes max
$checkInterval = 10 # Check every 10 seconds

# Start deployment as a background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    firebase deploy --only functions 2>&1
}

# Show progress bar
$dots = 0
while ($job.State -eq "Running") {
    $elapsed = (Get-Date) - $startTime
    $elapsedSeconds = [math]::Floor($elapsed.TotalSeconds)
    $progressPercent = [math]::Min(($elapsedSeconds / $maxDuration) * 100, 99)
    
    # Simple progress indicator
    $dots = ($dots + 1) % 4
    $progressBar = "=" * [math]::Floor($progressPercent / 2)
    $spaces = " " * (50 - [math]::Floor($progressPercent / 2))
    $dotAnimation = "." * $dots + " " * (3 - $dots)
    
    Write-Host "`r[$progressBar$spaces] $([math]::Floor($progressPercent))% - Elapsed: ${elapsedSeconds}s $dotAnimation" -NoNewline -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2
}

# Get job output
$output = Receive-Job -Job $job
Remove-Job -Job $job

Write-Host "`n" # New line after progress bar

# Display output
Write-Host $output

# Check if deployment succeeded
if ($output -match "Deploy complete!" -or $output -match "Function\(s\) deployed successfully") {
    Write-Host "`n✅ DEPLOYMENT SUCCESSFUL!`n" -ForegroundColor Green
    
    # Extract function URL
    $urlMatch = [regex]::Match($output, "(https://[a-zA-Z0-9-]+-[a-z0-9]+\.cloudfunctions\.net/[a-zA-Z0-9-]+)")
    if ($urlMatch.Success) {
        Write-Host "Function URL: $($urlMatch.Value)" -ForegroundColor Cyan
    }
    
    Write-Host "`nYou can now test the API endpoints!`n" -ForegroundColor Green
} elseif ($output -match "Error" -or $output -match "failed") {
    Write-Host "`n❌ DEPLOYMENT FAILED`n" -ForegroundColor Red
    Write-Host "Check the error messages above.`n" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n⚠️  Deployment status unclear. Check output above.`n" -ForegroundColor Yellow
}

$totalTime = (Get-Date) - $startTime
Write-Host "Total time: $([math]::Floor($totalTime.TotalMinutes)) minutes $([math]::Floor($totalTime.TotalSeconds % 60)) seconds`n" -ForegroundColor Cyan

