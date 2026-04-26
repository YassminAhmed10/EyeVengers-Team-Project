#!/bin/bash

# دليل سريع لتشغيل Radiology System

echo "🚀 بدء تشغيل Radiology Center System..."
echo ""

# Check Node.js
echo "✅ التحقق من Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت"
    exit 1
fi

echo "✓ Node.js مثبت"
echo ""

# Install Backend Dependencies
echo "📦 تثبيت Backend Dependencies..."
cd radiology-center-backend
npm install

if [ $? -eq 0 ]; then
    echo "✓ Backend Dependencies مثبت"
else
    echo "❌ خطأ في تثبيت Dependencies"
    exit 1
fi

cd ..
echo ""

# Install Frontend Dependencies
echo "📦 تثبيت Frontend Dependencies..."
cd radiology-center-frontend
npm install

if [ $? -eq 0 ]; then
    echo "✓ Frontend Dependencies مثبت"
else
    echo "❌ خطأ في تثبيت Dependencies"
    exit 1
fi

cd ..
echo ""

echo "✅ تم التثبيت بنجاح!"
echo ""
echo "🎯 الخطوة التالية:"
echo "1️⃣  شغّل Backend: cd radiology-center-backend && npm run dev"
echo "2️⃣  شغّل Frontend: cd radiology-center-frontend && npm run dev"
echo ""
echo "📍 الروابط:"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:5173"
