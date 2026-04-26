# دليل سريع لتشغيل Radiology System (Windows)

Write-Host "🚀 بدء تشغيل Radiology Center System..." -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "✅ التحقق من Node.js..." -ForegroundColor Cyan
try {
    node --version | Out-Null
    Write-Host "✓ Node.js مثبت" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install Backend Dependencies
Write-Host "📦 تثبيت Backend Dependencies..." -ForegroundColor Cyan
Set-Location radiology-center-backend

if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend Dependencies مثبت" -ForegroundColor Green
    } else {
        Write-Host "❌ خطأ في تثبيت Backend Dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ لم يتم العثور على radiology-center-backend" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host ""

# Install Frontend Dependencies
Write-Host "📦 تثبيت Frontend Dependencies..." -ForegroundColor Cyan
Set-Location radiology-center-frontend

if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend Dependencies مثبت" -ForegroundColor Green
    } else {
        Write-Host "❌ خطأ في تثبيت Frontend Dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ لم يتم العثور على radiology-center-frontend" -ForegroundColor Red
    exit 1
}

Set-Location ..
Write-Host ""

Write-Host "✅ تم التثبيت بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 الخطوة التالية:" -ForegroundColor Yellow
Write-Host "1️⃣  شغّل Backend: cd radiology-center-backend && npm run dev" -ForegroundColor Cyan
Write-Host "2️⃣  شغّل Frontend: cd radiology-center-frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 الروابط:" -ForegroundColor Yellow
Write-Host "   Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
