# การ Deploy และเชื่อมต่อระบบกับ Vercel & Neon PostgreSQL

โปรเจกต์นี้ได้รับการคอนฟิกโครงสร้างให้รองรับการ Deploy บน **Vercel** แบบ Full-Stack Serverless ร่วมกับ **Neon PostgreSQL** เรียบร้อยแล้ว

---

## 1. ไฟล์โครงสร้างที่เตรียมไว้สำหรับ Vercel
- **`vercel.json`**: คอนฟิกระบบ Routing, SPA fallback และ Serverless Functions
- **`api/database/status.ts`**: เช็คสถานะการเชื่อมต่อกับ Neon ผ่าน Vercel Serverless Function (`GET /api/database/status`)
- **`api/database/init.ts`**: คำสั่งสร้างตารางใน Neon อัตโนมัติ (`POST /api/database/init`)
- **`api/database/sync.ts`**: ซิงค์ข้อมูลขึ้น Neon บน Vercel (`POST /api/database/sync`)
- **`api/database/pull.ts`**: ดึงข้อมูลลงมาจาก Neon บน Vercel (`GET /api/database/pull`)

---

## 2. ขั้นตอนการตั้งค่าบน Vercel Dashboard

1. นำโค้ดขึ้น GitHub หรือเชื่อมต่อ Git Repository กับ **Vercel**
2. ในหน้าโปรเจกต์บน **Vercel Dashboard** ไปที่:
   **Settings** > **Environment Variables**
3. เพิ่มตัวแปร:
   - **Key**: `DATABASE_URL`
   - **Value**: Connection String จาก Neon เช่น:
     ```
     postgresql://neondb_owner:npg_ODlXJKp2ds3u@ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. กด **Deploy** หรือ **Redeploy**

---

## 3. การสร้างและจัดการตารางใน Neon จาก Vercel
- เมื่อระบบเริ่มทำงาน สามารถเข้าหน้า **ตั้งค่าระบบ (System Settings)** ในแอปพลิเคชัน
- กดปุ่ม **"ซิงค์ข้อมูลไปยัง Neon PostgreSQL"** เพื่อให้ Serverless Function สั่งสร้างตารางและบันทึกข้อมูลตั้งต้นขึ้นสู่ Neon โดยตรง
