# 🚨 Backend Fix Required - Hospital Dashboard Issues

## ปัญหาที่เกิดขึ้น

เมื่อ Login ด้วย User `Hospitals2@gmail.com` (Role: HOSPITAL) แล้วเข้า Hospital Dashboard เกิด Error ดังนี้:

### 1. ⚠️ User ไม่มี organizationId
```
No organizationId/hospitalId found in user data
```

**User Profile ปัจจุบัน (จาก `/auth/me`):**
```json
{
  "message": "User profile retrieved",
  "user": {
    "id": "37bd085d-248b-463c-b35d-b61b18ba8271",
    "email": "Hospitals2@gmail.com",
    "firstName": "Kanisorn",
    "lastName": "Toponwised",
    "role": "HOSPITAL",
    "status": "ACTIVE"
    // ❌ ไม่มี organizationId
    // ❌ ไม่มี organization object
  }
}
```

### 2. ❌ API Errors
- `GET /sos/dashboard/active-emergencies` → **500 Internal Server Error**
- `GET /rescue-teams` → **403 Forbidden**
- `GET /hospitals/:id` → **500 Internal Server Error** (เพราะส่ง `undefined` เป็น ID)

---

## 🔧 วิธีแก้ไข (Backend)

### **Step 1: Update User Record ใน Database**

ผูก User `Hospitals2@gmail.com` เข้ากับ Hospital Organization:

```sql
-- 1. หา Hospital ID ที่มีอยู่แล้ว (หรือสร้างใหม่)
SELECT id, name FROM "Organization" WHERE type = 'HOSPITAL' LIMIT 1;

-- 2. Update User ให้มี organizationId
UPDATE "User" 
SET "organizationId" = '<hospital-organization-id-from-step-1>'
WHERE email = 'Hospitals2@gmail.com';
```

**หรือถ้าต้องการสร้าง Hospital ใหม่:**
```sql
-- สร้าง Hospital Organization ใหม่
INSERT INTO "Organization" (id, name, type, status)
VALUES (
  gen_random_uuid(),
  'โรงพยาบาลทดสอบ',
  'HOSPITAL',
  'ACTIVE'
)
RETURNING id;

-- แล้วนำ ID ที่ได้ไป Update User
UPDATE "User" 
SET "organizationId" = '<id-from-insert-above>'
WHERE email = 'Hospitals2@gmail.com';
```

---

### **Step 2: แก้ไข `/auth/me` Endpoint**

ให้ return `organizationId` และ `organization` object:

**ไฟล์:** `src/auth/auth.service.ts` (หรือที่เกี่ยวข้อง)

```typescript
async getProfile(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,  // ← เพิ่ม include organization
    },
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    organizationId: user.organizationId,  // ← เพิ่ม field นี้
    organization: user.organization,      // ← เพิ่ม field นี้
  };
}
```

**Response ที่ถูกต้องควรเป็น:**
```json
{
  "id": "37bd085d-248b-463c-b35d-b61b18ba8271",
  "email": "Hospitals2@gmail.com",
  "firstName": "Kanisorn",
  "lastName": "Toponwised",
  "role": "HOSPITAL",
  "status": "ACTIVE",
  "organizationId": "hospital-uuid-here",
  "organization": {
    "id": "hospital-uuid-here",
    "name": "โรงพยาบาลแม่ฟ้าหลวง",
    "type": "HOSPITAL",
    "status": "ACTIVE"
  }
}
```

---

### **Step 3: แก้ไข Permission สำหรับ `/rescue-teams`**

Role `HOSPITAL` ต้องสามารถเข้าถึง `/rescue-teams` ได้:

**ไฟล์:** `src/rescue-team/rescue-team.controller.ts` (หรือที่เกี่ยวข้อง)

```typescript
@Get()
@Roles('HOSPITAL', 'EMERGENCY_CENTER', 'ADMIN')  // ← เพิ่ม 'HOSPITAL'
async getRescueTeams() {
  return this.rescueTeamService.findAll();
}
```

---

### **Step 4: แก้ไข `/sos/dashboard/active-emergencies`**

ตรวจสอบว่า endpoint นี้รองรับกรณีที่ User มี `organizationId` แล้ว:

**ไฟล์:** `src/sos/sos.controller.ts` หรือ `src/dashboard/dashboard.controller.ts`

```typescript
@Get('dashboard/active-emergencies')
@Roles('HOSPITAL', 'EMERGENCY_CENTER', 'ADMIN')
async getActiveEmergencies(@Request() req) {
  const user = req.user;
  
  // ถ้าเป็น HOSPITAL ให้ filter เฉพาะ cases ที่เกี่ยวข้องกับ hospital นั้น
  if (user.role === 'HOSPITAL' && user.organizationId) {
    return this.sosService.findActiveEmergenciesByHospital(user.organizationId);
  }
  
  // ถ้าเป็น role อื่นให้ return ทั้งหมด
  return this.sosService.findActiveEmergencies();
}
```

---

## ✅ วิธีทดสอบหลังแก้ไข

1. **Restart Backend Server**
2. **Login ใหม่** ด้วย `Hospitals2@gmail.com`
3. **ตรวจสอบ `/auth/me` response** ว่ามี `organizationId` แล้ว
4. **เข้า Hospital Dashboard** ควรจะไม่มี error และแสดงข้อมูลได้ถูกต้อง

---

## 📊 ข้อมูลที่ Frontend ต้องการ

Frontend ต้องการข้อมูลจาก Backend ดังนี้:

### 1. **User Profile** (`GET /auth/me`)
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "HOSPITAL",
  "status": "ACTIVE",
  "organizationId": "uuid",  // ← สำคัญมาก!
  "organization": {
    "id": "uuid",
    "name": "string",
    "type": "HOSPITAL"
  }
}
```

### 2. **Hospital Details** (`GET /hospitals/:id`)
```json
{
  "id": "uuid",
  "name": "string",
  "medicalInfo": {
    "capacity": {
      "totalBeds": 100,
      "availableBeds": 50,
      "icuBeds": 20,
      "availableIcuBeds": 10
    }
  }
}
```

### 3. **Active Emergencies** (`GET /sos/dashboard/active-emergencies`)
```json
[
  {
    "id": "uuid",
    "description": "string",
    "status": "assigned" | "in-progress" | "completed",
    "severity": 1 | 2 | 3 | 4,
    "emergencyType": "string",
    "patientName": "string"
  }
]
```

### 4. **Rescue Teams** (`GET /rescue-teams`)
```json
[
  {
    "id": "uuid",
    "name": "string",
    "status": "available" | "busy" | "off_duty",
    "vehicleTypes": ["AMBULANCE", "HELICOPTER"]
  }
]
```

---

## 🎯 Priority

1. **HIGH:** Update User record ให้มี `organizationId`
2. **HIGH:** แก้ไข `/auth/me` ให้ return `organizationId`
3. **MEDIUM:** แก้ไข Permission `/rescue-teams`
4. **MEDIUM:** แก้ไข `/sos/dashboard/active-emergencies` ให้รองรับ HOSPITAL role

---

## 📝 หมายเหตุ

- Frontend ได้ทำการ handle error case แล้ว (แสดง Alert เตือนผู้ใช้)
- แต่ปัญหาหลักยังคงอยู่ที่ Backend ต้องแก้ไข
- หลังจากแก้ไขแล้ว ระบบจะทำงานได้ปกติทันที

---

**สร้างโดย:** Frontend Developer  
**วันที่:** 2025-11-23  
**สถานะ:** รอ Backend แก้ไข
