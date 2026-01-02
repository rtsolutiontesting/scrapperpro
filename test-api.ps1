# API Test Script for University Data Engine

$API_URL = "https://us-central1-uniscrapper-pro.cloudfunctions.net/api"

Write-Host "=== Testing Backend API ===" -ForegroundColor Cyan
Write-Host "API URL: $API_URL`n" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method GET
    Write-Host "✅ Health Check: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"

# Test 2: Create Job
Write-Host "2. Testing Create Job..." -ForegroundColor Green
$jobData = @{
    universityName = "University of Toronto"
    country = "Canada"
    urls = @("https://www.utoronto.ca/admissions")
    autoPublish = $false
    createdBy = "test-user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$API_URL/jobs/create" -Method POST -Body $jobData -ContentType "application/json"
    Write-Host "✅ Job Created: $($response.job.id)" -ForegroundColor Green
    Write-Host "   Status: $($response.job.status)" -ForegroundColor Cyan
    $jobId = $response.job.id
    
    # Test 3: Get Job
    Write-Host "`n3. Testing Get Job..." -ForegroundColor Green
    Start-Sleep -Seconds 2
    $jobResponse = Invoke-RestMethod -Uri "$API_URL/jobs/$jobId" -Method GET
    Write-Host "✅ Job Retrieved: $($jobResponse.job.status)" -ForegroundColor Green
    
    # Test 4: Queue Status
    Write-Host "`n4. Testing Queue Status..." -ForegroundColor Green
    $queueResponse = Invoke-RestMethod -Uri "$API_URL/queue/status" -Method GET
    Write-Host "✅ Queue Status: $($queueResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Create Job Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Response: $($_.Exception.Response)" -ForegroundColor Yellow
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan

