# Setup Google Application Credentials Script
Write-Host "🔧 Setting up GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n📋 This script will help you set up the GOOGLE_APPLICATION_CREDENTIALS secret" -ForegroundColor Yellow
Write-Host "with your service account JSON content for Google Cloud deployment." -ForegroundColor Yellow

Write-Host "`n🚀 Steps:" -ForegroundColor Cyan

Write-Host "`n1️⃣ Make sure you have your service account JSON file ready" -ForegroundColor Green
Write-Host "   - Download it from Google Cloud Console" -ForegroundColor White
Write-Host "   - Place it in this directory" -ForegroundColor White

Write-Host "`n2️⃣ Run this command to encode and set up the secret:" -ForegroundColor Green
Write-Host "   .\encode-and-setup-credentials.ps1" -ForegroundColor White

Write-Host "`n3️⃣ The script will:" -ForegroundColor Green
Write-Host "   - Find your service account JSON file" -ForegroundColor White
Write-Host "   - Encode it properly for Google Cloud" -ForegroundColor White
Write-Host "   - Provide instructions for updating the secret" -ForegroundColor White

Write-Host "`n💡 For local development:" -ForegroundColor Cyan
Write-Host "   - Use the file path: GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-file.json" -ForegroundColor White

Write-Host "`n💡 For Google Cloud deployment:" -ForegroundColor Cyan
Write-Host "   - Use the JSON content directly in the secret" -ForegroundColor White

Read-Host "`nPress Enter to continue..." 