# Setup Google Cloud Vision API Script
# This script helps you create and configure Vision API credentials

Write-Host "🔧 Google Cloud Vision API Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

Write-Host "`n📋 To fix the Vision API credentials issue, you need to:" -ForegroundColor Yellow
Write-Host "1. Create a Google Cloud service account with Vision API permissions" -ForegroundColor White
Write-Host "2. Download the service account JSON file" -ForegroundColor White
Write-Host "3. Encode it as base64 and add it to your secrets" -ForegroundColor White

Write-Host "`n🚀 Step-by-step instructions:" -ForegroundColor Cyan

Write-Host "`n1️⃣ Go to Google Cloud Console:" -ForegroundColor Green
Write-Host "   https://console.cloud.google.com/" -ForegroundColor White

Write-Host "`n2️⃣ Navigate to IAM & Admin > Service Accounts:" -ForegroundColor Green
Write-Host "   https://console.cloud.google.com/iam-admin/serviceaccounts" -ForegroundColor White

Write-Host "`n3️⃣ Create a new service account:" -ForegroundColor Green
Write-Host "   - Name: fridge-feast-vision-api" -ForegroundColor White
Write-Host "   - Description: Service account for FridgeToFeast Vision API" -ForegroundColor White

Write-Host "`n4️⃣ Grant these roles:" -ForegroundColor Green
Write-Host "   - Cloud Vision API User" -ForegroundColor White
Write-Host "   - Secret Manager Secret Accessor" -ForegroundColor White

Write-Host "`n5️⃣ Create and download a key (JSON format)" -ForegroundColor Green

Write-Host "`n6️⃣ Once you have the JSON file, run this command:" -ForegroundColor Green
Write-Host "   [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content 'path-to-your-service-account.json' -Raw)))" -ForegroundColor White

Write-Host "`n7️⃣ Copy the base64 output and update your VISION_SERVICE_ACCOUNT_BASE64 secret in Google Cloud Secret Manager" -ForegroundColor Green

Write-Host "`n8️⃣ Redeploy your application" -ForegroundColor Green

Write-Host "`n🔍 Alternative: If you want to skip Vision API for now:" -ForegroundColor Yellow
Write-Host "   You can use text input only and disable image recognition" -ForegroundColor White

Write-Host "`n❓ Need help? Check the GOOGLE_CLOUD_SETUP.md file for detailed instructions" -ForegroundColor Cyan

Read-Host "`nPress Enter to continue..." 