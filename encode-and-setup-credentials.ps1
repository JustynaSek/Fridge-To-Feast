# Encode and Setup Google Application Credentials
Write-Host "🔧 Encoding and Setting up GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Look for service account JSON files
$jsonFiles = Get-ChildItem -Path "." -Filter "*service*account*.json" -Recurse

if ($jsonFiles.Count -eq 0) {
    Write-Host "❌ No service account JSON files found in current directory" -ForegroundColor Red
    Write-Host "`n📋 Please:" -ForegroundColor Yellow
    Write-Host "1. Download your service account JSON file from Google Cloud Console" -ForegroundColor White
    Write-Host "2. Place it in this directory" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host "`n💡 Expected filename pattern: *service*account*.json" -ForegroundColor Cyan
    Read-Host "`nPress Enter to continue..."
    exit
}

if ($jsonFiles.Count -gt 1) {
    Write-Host "📋 Multiple JSON files found:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $jsonFiles.Count; $i++) {
        Write-Host "   $($i + 1). $($jsonFiles[$i].Name)" -ForegroundColor White
    }
    
    $choice = Read-Host "`nSelect file number to use (1-$($jsonFiles.Count))"
    $selectedFile = $jsonFiles[[int]$choice - 1]
} else {
    $selectedFile = $jsonFiles[0]
}

Write-Host "`n✅ Using file: $($selectedFile.Name)" -ForegroundColor Green

try {
    # Read the JSON file
    $jsonContent = Get-Content $selectedFile.FullName -Raw
    
    Write-Host "`n📋 JSON Content (first 200 characters):" -ForegroundColor Yellow
    Write-Host $jsonContent.Substring(0, [Math]::Min(200, $jsonContent.Length)) -ForegroundColor White
    if ($jsonContent.Length -gt 200) {
        Write-Host "..." -ForegroundColor White
    }
    
    Write-Host "`n🚀 Setup Instructions:" -ForegroundColor Cyan
    
    Write-Host "`n1️⃣ For Local Development (.env.local):" -ForegroundColor Green
    Write-Host "   GOOGLE_APPLICATION_CREDENTIALS=$($selectedFile.FullName)" -ForegroundColor White
    
    Write-Host "`n2️⃣ For Google Cloud Secret Manager:" -ForegroundColor Green
    Write-Host "   - Go to: https://console.cloud.google.com/security/secret-manager" -ForegroundColor White
    Write-Host "   - Click on: GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor White
    Write-Host "   - Click 'Add new version'" -ForegroundColor White
    Write-Host "   - Paste the JSON content below:" -ForegroundColor White
    
    Write-Host "`n📄 JSON Content for Secret Manager:" -ForegroundColor Yellow
    Write-Host "==========================================" -ForegroundColor Gray
    Write-Host $jsonContent -ForegroundColor White
    Write-Host "==========================================" -ForegroundColor Gray
    
    # Save to file for backup
    $outputFile = "google-application-credentials-content.txt"
    $jsonContent | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "`n💾 JSON content saved to: $outputFile" -ForegroundColor Cyan
    
    Write-Host "`n3️⃣ After updating the secret, redeploy your application" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "`nPress Enter to continue..." 