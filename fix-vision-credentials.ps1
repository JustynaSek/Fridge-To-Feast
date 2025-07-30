# Fix Vision API Credentials Script
Write-Host "🔧 Fixing Vision API Credentials" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host "`n📋 Current Status:" -ForegroundColor Yellow
Write-Host "✅ Service account exists: fridge-to-feast-vision-api@fridgefeast-466610.iam.gserviceaccount.com" -ForegroundColor Green
Write-Host "❌ Missing Vision API permissions" -ForegroundColor Red
Write-Host "❌ VISION_SERVICE_ACCOUNT_BASE64 secret is empty" -ForegroundColor Red

Write-Host "`n🚀 Steps to fix:" -ForegroundColor Cyan

Write-Host "`n1️⃣ Add Vision API permissions:" -ForegroundColor Green
Write-Host "   - Go to: https://console.cloud.google.com/iam-admin/iam" -ForegroundColor White
Write-Host "   - Find: fridge-to-feast-vision-api@fridgefeast-466610.iam.gserviceaccount.com" -ForegroundColor White
Write-Host "   - Add role: Cloud Vision API User" -ForegroundColor White

Write-Host "`n2️⃣ Create service account key:" -ForegroundColor Green
Write-Host "   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts" -ForegroundColor White
Write-Host "   - Click on: fridge-to-feast-vision-api" -ForegroundColor White
Write-Host "   - Go to 'Keys' tab" -ForegroundColor White
Write-Host "   - Click 'Add Key' > 'Create new key' (JSON)" -ForegroundColor White
Write-Host "   - Download the JSON file" -ForegroundColor White

Write-Host "`n3️⃣ Encode the JSON file:" -ForegroundColor Green
Write-Host "   Place your downloaded JSON file in this directory and run:" -ForegroundColor White
Write-Host "   .\encode-service-account.ps1" -ForegroundColor White

Write-Host "`n4️⃣ Update the secret:" -ForegroundColor Green
Write-Host "   - Go to: https://console.cloud.google.com/security/secret-manager" -ForegroundColor White
Write-Host "   - Click on: VISION_SERVICE_ACCOUNT_BASE64" -ForegroundColor White
Write-Host "   - Click 'Add new version'" -ForegroundColor White
Write-Host "   - Paste the base64 output from step 3" -ForegroundColor White

Write-Host "`n5️⃣ Redeploy your application" -ForegroundColor Green

Read-Host "`nPress Enter to continue..." 