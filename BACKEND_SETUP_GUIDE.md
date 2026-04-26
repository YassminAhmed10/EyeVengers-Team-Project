# دليل الربط بين Frontend و Backend

## 📌 الخطوات

### 1️⃣ تثبيت Backend

```bash
cd radiology-center-backend
npm install
```

### 2️⃣ تشغيل Backend

```bash
# في terminal منفصل
npm run dev
```

يجب أن ترى هذا الـ message:
```
🚀 Radiology Center Backend running on http://localhost:5001
📍 Health check: http://localhost:5001/health
```

### 3️⃣ تشغيل Frontend

```bash
cd radiology-center-frontend
npm run dev
```

### 4️⃣ اختبار الاتصال

افتح `http://localhost:5173` (أو الـ port للـ frontend) وجرب الـ API calls.

---

## ✅ التحقق من الربط

1. افتح DevTools في المتصفح (F12)
2. اذهب إلى Network tab
3. حاول عمل شيء يستدعي الـ API (مثلاً: حجز موعد)
4. تحقق من أن الـ request يذهب إلى `http://localhost:5001/api/...`

---

## 🐛 استكشاف الأخطاء

### الخطأ: "Cannot connect to server"
- تأكد أن Backend يعمل على port 5001
- تحقق من الـ CORS settings في `server.js`

### الخطأ: "Network Error"
- تأكد من تشغيل كلا الـ Frontend و Backend
- تحقق من الـ firewall settings

### الخطأ: "404 Not Found"
- تحقق من الـ endpoint اسمه صحيح (مثلاً: `/api/appointments` وليس `/appointments`)

---

## 📚 مثال API Calls

### من الفرونت إلى الباك

```javascript
// BookingPage.jsx مثلاً
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api'
});

// حجز موعد
const bookAppointment = async (data) => {
  const response = await API.post('/appointments/book', data);
  return response.data;
};

// الفترات المتاحة
const getAvailableSlots = async (date) => {
  const response = await API.get('/appointments/slots', { params: { date } });
  return response.data;
};
```

---

## 🔄 الخطوة التالية: ربط Clinic System

بعدما يعمل الـ Backend بسهولة:

1. أضف endpoints جديدة للربط مع clinic system:
   ```javascript
   // في controllers
   export const syncClinicPatients = async () => {
     // استدعي clinic system API هنا
   };
   ```

2. استخدم `process.env.CLINIC_API_URL` للربط:
   ```javascript
   const clinicAPI = axios.create({
     baseURL: process.env.CLINIC_API_URL
   });
   ```

---

## 📝 ملاحظات

- الـ Database حالياً في-memory (data تختفي بعد إعادة تشغيل الخادم)
- للـ production: استبدله بـ Firebase أو قاعدة بيانات حقيقية
- يمكنك إضافة authentication وvalidation لاحقاً
