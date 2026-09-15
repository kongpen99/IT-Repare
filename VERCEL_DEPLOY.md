# การ Deploy บน Vercel (Project: computer-repair -01) & เชื่อมต่อฐานข้อมูล Neon (computer-MG)

โปรเจกต์นี้ได้รับการตั้งค่าและทดสอบให้เชื่อมต่อกับฐานข้อมูล **Neon PostgreSQL** ชื่อฐานข้อมูล **`computer-MG`** สำหรับโปรเจกต์ Vercel ชื่อ **`computer-repair -01`** เรียบร้อยแล้ว

---

## 1. ข้อมูลการเชื่อมต่อฐานข้อมูล Neon (Database: computer-MG)

- **Database Name**: `computer-MG`
- **Host**: `ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech`
- **Vercel Project Name**: `computer-repair -01`
- **Connection String**:
  ```
  postgresql://neondb_owner:npg_ODlXJKp2ds3u@ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech/computer-MG?sslmode=require&channel_binding=require
  ```

> **หมายเหตุพิเศษ**: ระบบได้เพิ่มฟังก์ชัน Auto-Redirect ให้อัตโนมัติ แม้ว่าจะใส่ `DATABASE_URL` ที่ลงท้ายด้วย `/neondb` หรือไม่ระบุ Database Name ระบบจะเปลี่ยนเป้าหมายไปยังฐานข้อมูล `computer-MG` ให้อัตโนมัติ

---

## 2. ขั้นตอนการตั้งค่าบน Vercel Dashboard

1. นำโค้ดขึ้น GitHub และ Import เข้าสู่ Vercel ตั้งชื่อโปรเจกต์ว่า: **`computer-repair -01`** (หรือ `computer-repair-01`)
2. ในหน้าตั้งค่าโปรเจกต์บน **Vercel Dashboard**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. ไปที่แท็บ **Settings** > **Environment Variables** แล้วเพิ่ม:
   - **Key**: `DATABASE_URL`
   - **Value**:
     ```
     postgresql://neondb_owner:npg_ODlXJKp2ds3u@ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech/computer-MG?sslmode=require&channel_binding=require
     ```
   - **Key** (ตัวเลือกเสริม): `NEON_DATABASE`
   - **Value**: `computer-MG`
   - **Key** (ตัวเลือกเสริม): `VERCEL_PROJECT_NAME`
   - **Value**: `computer-repair -01`
4. กด **Deploy** หรือ **Redeploy**

---

## 3. โครงสร้างไฟล์สำหรับ Vercel Serverless
- **`vercel.json`**: คอนฟิกระบบ Routing, SPA fallback และ Vercel Serverless Functions
- **`api/database/status.ts`**: ตรวจสอบสถานะการเชื่อมต่อ และยืนยันชื่อ Database `computer-MG`
- **`api/database/init.ts`**: คำสั่งสร้างตารางอัตโนมัติในฐานข้อมูล `computer-MG`
- **`api/database/sync.ts`**: ซิงค์ข้อมูลทั้งหมด (departments, users, computers, parts, repairs) ลง `computer-MG`
- **`api/database/pull.ts`**: ดึงข้อมูลทั้งหมดจากฐานข้อมูล `computer-MG`

