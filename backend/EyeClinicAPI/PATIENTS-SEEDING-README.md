# إضافة بيانات المرضى المصريين
# Egyptian Patients Data Seeding

## نظرة عامة | Overview

هذا المجلد يحتوي على ملفات لإضافة بيانات مرضى مصريين حقيقية (25 مريض) إلى قاعدة البيانات:
- **10 مرضى ذكور** (أسماء عربية حقيقية)
- **15 مريضة إناث** (أسماء عربية حقيقية)

This folder contains files to seed Egyptian patient data (25 patients) into the database:
- **10 male patients** (authentic Arabic names)
- **15 female patients** (authentic Arabic names)

---

## الملفات | Files

### 1. `seed-egyptian-patients.sql`
ملف SQL يحتوي على جميع بيانات المرضى المصريين

SQL file containing all Egyptian patients data

### 2. `seed-patients.ps1`
سكريبت PowerShell لتسهيل تنفيذ ملف SQL

PowerShell script to easily execute the SQL file

---

## البيانات المضافة | Added Data

كل مريض يحتوي على:
- ✅ الاسم الأول والأخير (عربي)
- ✅ تاريخ الميلاد (أعمار مختلفة من 30-40 سنة)
- ✅ النوع (ذكر/أنثى)
- ✅ رقم الهاتف المصري
- ✅ البريد الإلكتروني
- ✅ العنوان (عناوين حقيقية في القاهرة والجيزة)
- ✅ الرقم القومي (مطابق لتاريخ الميلاد)
- ✅ شركة التأمين
- ✅ رقم التأمين
- ✅ جهة الاتصال في حالات الطوارئ
- ✅ تاريخ الإضافة (تواريخ متنوعة من يناير 2024 - مارس 2025)

Each patient includes:
- ✅ First & Last name (Arabic)
- ✅ Date of birth (ages 30-40)
- ✅ Gender (Male/Female)
- ✅ Egyptian phone number
- ✅ Email address
- ✅ Address (real locations in Cairo & Giza)
- ✅ National ID (matches DOB)
- ✅ Insurance company
- ✅ Insurance ID
- ✅ Emergency contact
- ✅ Creation date (varied dates from Jan 2024 - Mar 2025)

---

## طريقة التنفيذ | How to Execute

### الطريقة 1: استخدام PowerShell Script (الأسهل)
### Method 1: Using PowerShell Script (Easiest)

```powershell
cd backend\EyeClinicAPI
.\seed-patients.ps1
```

ثم اختر أحد الخيارات:
1. SQL Server (Windows Authentication) - إذا كنت تستخدم LocalDB أو SQL Server Express
2. SQL Server (Username & Password) - إذا كنت تستخدم SQL Server مع كلمة مرور
3. Manual execution instructions

---

### الطريقة 2: استخدام SQL Server Management Studio (SSMS)
### Method 2: Using SQL Server Management Studio (SSMS)

1. افتح **SQL Server Management Studio**
2. اتصل بالسيرفر الخاص بك
3. افتح ملف `seed-egyptian-patients.sql`
4. تأكد من اختيار قاعدة البيانات `EyeClinicDB`
5. اضغط **F5** أو زر **Execute**

---

### الطريقة 3: استخدام Command Line (sqlcmd)
### Method 3: Using Command Line (sqlcmd)

```powershell
# Windows Authentication
sqlcmd -S localhost -E -i seed-egyptian-patients.sql

# SQL Authentication
sqlcmd -S localhost -U sa -P YourPassword -i seed-egyptian-patients.sql
```

---

### الطريقة 4: استخدام Azure Data Studio
### Method 4: Using Azure Data Studio

1. افتح **Azure Data Studio**
2. اتصل بقاعدة البيانات
3. افتح ملف `seed-egyptian-patients.sql`
4. اضغط **Run** أو **F5**

---

## التحقق من البيانات | Verify Data

بعد التنفيذ، يمكنك التحقق من البيانات باستخدام:

After execution, verify the data using:

```sql
USE EyeClinicDB;

-- عرض جميع المرضى
SELECT * FROM Patients ORDER BY CreatedAt DESC;

-- عدد المرضى حسب النوع
SELECT Gender, COUNT(*) as Count FROM Patients GROUP BY Gender;

-- أحدث 10 مرضى
SELECT TOP 10 
    CONCAT(FirstName, ' ', LastName) as FullName,
    Gender,
    Phone,
    Email,
    CreatedAt
FROM Patients 
ORDER BY CreatedAt DESC;
```

---

## أمثلة على البيانات | Sample Data Examples

### مرضى ذكور | Male Patients
- أحمد محمد علي (01012345678)
- محمود حسن إبراهيم (01123456789)
- عمر خالد عبدالله (01234567890)

### مرضى إناث | Female Patients
- فاطمة أحمد محمود (01021098765)
- سارة حسن علي (01109876543)
- ليلى محمد سعيد (01198765432)

---

## ملاحظات مهمة | Important Notes

⚠️ **تحذير:** إذا قمت بحذف البيانات القديمة، قم بإزالة التعليق من هذا السطر في ملف SQL:
```sql
-- DELETE FROM Patients;
```

⚠️ **Warning:** If you want to delete old data first, uncomment this line in the SQL file:
```sql
-- DELETE FROM Patients;
```

✅ **البيانات آمنة:** جميع البيانات هي بيانات وهمية لأغراض الاختبار فقط

✅ **Data is safe:** All data is fictional for testing purposes only

---

## استكشاف الأخطاء | Troubleshooting

### مشكلة: "sqlcmd is not recognized"
**الحل:**
قم بتثبيت SQL Server Command Line Utilities من:
https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility

### مشكلة: "Cannot open database EyeClinicDB"
**الحل:**
تأكد من أن قاعدة البيانات موجودة أو قم بإنشائها أولاً:
```sql
CREATE DATABASE EyeClinicDB;
```

### مشكلة: "Invalid object name 'Patients'"
**الحل:**
تأكد من تشغيل Migrations أولاً:
```powershell
cd backend\EyeClinicAPI\EyeClinicAPI
dotnet ef database update
```

---

## الدعم | Support

إذا واجهت أي مشاكل، تحقق من:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [README.md](./README.md)

If you face any issues, check:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [README.md](./README.md)

---

## الترخيص | License

بيانات وهمية للاختبار فقط - استخدام حر

Fictional data for testing only - Free to use

---

**تم الإنشاء بواسطة:** GitHub Copilot  
**Created by:** GitHub Copilot  
**التاريخ:** 23 يناير 2026  
**Date:** January 23, 2026
