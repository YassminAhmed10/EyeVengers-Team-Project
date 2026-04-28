# Radiology Center Backend

بسيط backend API للنظام الخاص بـ Radiology Center.

## 📁 الهيكل

```
radiology-center-backend/
├── server.js              # الملف الرئيسي
├── package.json          # المكتبات والـ dependencies
├── .env.example          # متغيرات البيئة
├── controllers/          # معالجات الطلبات
│   ├── appointmentsController.js
│   ├── patientsController.js
│   ├── scanOrdersController.js
│   └── reportsController.js
├── routes/               # مسارات الـ API
│   ├── appointments.js
│   ├── patients.js
│   ├── scanOrders.js
│   └── reports.js
└── models/              # قاعدة البيانات
    └── db.js
```

## 🚀 البدء السريع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. إنشاء ملف .env
انسخ `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

### 3. تشغيل الخادم
```bash
# Development mode (مع auto-reload)
npm run dev

# Production mode
npm start
```

الخادم سيعمل على: `http://localhost:5001`

## 📡 API Endpoints

### الحجوزات (Appointments)
- `GET /api/appointments/slots?date=2024-01-15` - الفترات الزمنية المتاحة
- `POST /api/appointments/book` - حجز موعد
- `GET /api/appointments/patient/:patientId` - مواعيد المريض
- `PATCH /api/appointments/:appointmentId/status` - تحديث الحالة

### المرضى (Patients)
- `GET /api/patients` - كل المرضى
- `GET /api/patients/:patientId` - بيانات المريض
- `POST /api/patients` - إضافة مريض جديد
- `PUT /api/patients/:patientId` - تحديث بيانات المريض

### أوامر الفحوصات (Scan Orders)
- `GET /api/scan-orders/worklist` - قائمة الفحوصات المعلقة
- `GET /api/scan-orders` - كل الفحوصات
- `POST /api/scan-orders` - إضافة فحص جديد
- `GET /api/scan-orders/:scanOrderId` - تفاصيل الفحص
- `GET /api/scan-orders/patient/:patientId` - فحوصات المريض
- `PATCH /api/scan-orders/:scanOrderId/status` - تحديث حالة الفحص

### التقارير (Reports)
- `GET /api/reports` - كل التقارير
- `POST /api/reports/upload` - رفع تقرير جديد
- `GET /api/reports/patient/:patientId` - تقارير المريض
- `GET /api/reports/:reportId` - تفاصيل التقرير
- `PUT /api/reports/:reportId` - تحديث التقرير

## 📝 مثال استخدام API

### حجز موعد
```javascript
const response = await fetch('http://localhost:5001/api/appointments/book', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: "1",
    scanType: "MRI Scan",
    date: "2024-01-15",
    time: "10:00",
    notes: "Check-up"
  })
});
```

### الحصول على الفترات المتاحة
```javascript
const response = await fetch('http://localhost:5001/api/appointments/slots?date=2024-01-15');
```

## ⚙️ التكوين

تعديل `server.js` لإضافة:
- Authentication (Firebase Auth, JWT, إلخ)
- Database حقيقية (Firebase, MongoDB, PostgreSQL)
- Validation middleware
- Error handling محسّن

## 🔗 الربط مع Frontend

في الـ Frontend، عدّل `axiosInstance.js`:
```javascript
baseURL: 'http://localhost:5001/api'
```

## 📚 التطوير المستقبلي

- [ ] استبدال in-memory database بقاعدة بيانات حقيقية
- [ ] إضافة authentication
- [ ] إضافة validation middleware
- [ ] استكمال error handling
- [ ] إضافة unit tests
- [ ] الربط مع clinic system الأساسي
