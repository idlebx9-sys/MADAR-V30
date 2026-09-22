# دليل نشر وتشغيل منصة مَـدَار (MADAR Deployment Guide)

منصة سحابية متخصصة لمكاتب ووسطاء الزواج الشرعي في العالم العربي.

---

## 🛠️ المتطلبات الأساسية
- Node.js 22+
- MySQL 8.0+ أو خدمة MySQL مدارة (AWS RDS / Cloud SQL / PlanetScale)
- Docker & Docker Compose (اختياري للنشر السريع الحاوي)
- دومين مخصص مزود بشهادة SSL (HTTPS)

---

## ⚙️ إعداد متغيرات البيئة (`.env`)

أنشئ ملف `.env` في جذر المشروع وضع المتغيرات التالية:

```env
NODE_ENV=production
PORT=3000

# الاتصال بقاعدة بيانات MySQL
DATABASE_URL=mysql://madar_user:password@localhost:3306/madar_db

# مفتاح تشفير الجلسات وJWT
JWT_SECRET=your-secure-random-32-character-secret-key

# الدومين الأساسي للمنصة
BASE_DOMAIN=madar.sa
```

---

## 🚀 التشغيل المباشر عبر Node.js

```bash
# 1. تثبيت الحزم
npm install

# 2. بناء واجهة المستخدم (Vite + Tailwind CSS v4)
npm run build

# 3. تشغيل الخادم والـ API
npm run start
```

---

## 🐳 النشر عبر Docker Compose

```bash
docker-compose up -d --build
```

---

## 🛡️ الضوابط الأمنية والنسخ الاحتياطي
- جميع كلمات المرور مشفرة باستخدام خوارزمية `scrypt`.
- الـ Cookies مضبوطة على `HttpOnly` و `SameSite=Lax` مع حماية CSRF.
- قاعدة البيانات محمية بنسخ احتياطي دوري لبيانات وسجلات طالبي الزواج.
