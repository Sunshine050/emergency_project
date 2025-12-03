# Temporary Google OAuth System

ระบบนี้สร้างขึ้นเพื่อทดสอบ Google Login ผ่าน Supabase โดยแยก Backend ออกมาเป็น Service ต่างหาก

## 1. Setup Backend
1. เข้าไปที่โฟลเดอร์ `temp-auth-server`:
   ```bash
   cd temp-auth-server
   ```
2. สร้างไฟล์ `.env` โดยดูตัวอย่างจาก `.env.example`:
   ```bash
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. ติดตั้ง dependencies และรัน server:
   ```bash
   npm install
   node server.js
   ```
   Server จะรันที่ `http://localhost:3001`

## 2. Setup Frontend
1. เปิดไฟล์ `app/temp-login/page.tsx`
2. แก้ไขค่า `YOUR_SUPABASE_URL` ให้เป็น URL ของโปรเจกต์ Supabase ของคุณ (หรือใส่ใน `.env.local` ของ Next.js เป็น `NEXT_PUBLIC_SUPABASE_URL`)

## 3. Setup Supabase Dashboard
1. ไปที่ Authentication -> Providers -> Google
2. เปิดใช้งาน (Enable)
3. ใส่ Client ID และ Secret จาก Google Cloud Console
4. **สำคัญ:** เพิ่ม Redirect URL ใน Supabase:
   `http://localhost:3000/auth/callback`

## 4. Usage
1. รัน Next.js frontend (`npm run dev`)
2. รัน Backend server (`node server.js` ในโฟลเดอร์ `temp-auth-server`)
3. เข้าไปที่ `http://localhost:3000/temp-login`
4. กดปุ่ม Login with Google

---
**Note:** ระบบนี้ใช้สำหรับการทดสอบเท่านั้น ใน Production ควรจัดการ Token ด้วย HTTP-only cookie และมีความปลอดภัยมากกว่านี้
