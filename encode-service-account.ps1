# Encode Service Account JSON to Base64
Write-Host "🔧 Encoding Service Account JSON" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

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
    
    $choice = Read-Host "`nSelect file number to encode (1-$($jsonFiles.Count))"
    $selectedFile = $jsonFiles[[int]$choice - 1]
} else {
    $selectedFile = $jsonFiles[0]
}

Write-Host "`n✅ Encoding file: $($selectedFile.Name)" -ForegroundColor Green

try {
    # Read the JSON file
    $jsonContent = Get-Content $selectedFile.FullName -Raw
    
    # Encode to base64
    $base64Content = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jsonContent))
    
    Write-Host "`n✅ Base64 encoded content:" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Gray
    Write-Host $base64Content -ForegroundColor White
    Write-Host "==========================================" -ForegroundColor Gray
    
    Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the base64 content above" -ForegroundColor White
    Write-Host "2. Go to Google Cloud Secret Manager" -ForegroundColor White
    Write-Host "3. Update VISION_SERVICE_ACCOUNT_BASE64 secret" -ForegroundColor White
    Write-Host "4. Redeploy your application" -ForegroundColor White
    
    # Save to file for backup
    $outputFile = "encoded-service-account.txt"
    $base64Content | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "`n💾 Base64 content also saved to: $outputFile" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error encoding file: $($_.Exception.Message)" -ForegroundColor Red
}

Read-Host "`nPress Enter to continue..." 