# 📊 Hospital Reports API Requirements

## Overview
Frontend ได้สร้างระบบ Reports สำหรับ Hospital แล้ว ต้องการ Backend API เพื่อดึงข้อมูลจริง

---

## 🔌 Required APIs

### 1. **GET /hospitals/:hospitalId/reports**
ดึงรายการรีพอร์ตทั้งหมดของโรงพยาบาล

**Query Parameters:**
- `type` (optional): `emergency` | `resources` | `patients` | `performance` | `all`
- `period` (optional): `week` | `month` | `quarter` | `year`
- `limit` (optional): number
- `offset` (optional): number

**Response:**
```json
{
  "reports": [
    {
      "id": "uuid",
      "title": "Emergency Department Performance - November 2025",
      "type": "emergency",
      "period": "November 2025",
      "generatedAt": "2025-11-20T10:30:00Z",
      "status": "completed" | "generating" | "failed",
      "fileUrl": "/api/reports/download/uuid"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

---

### 2. **GET /hospitals/:hospitalId/stats**
ดึงสถิติสำคัญของโรงพยาบาล

**Query Parameters:**
- `period` (optional): `week` | `month` | `quarter` | `year`
- `startDate` (optional): ISO 8601 date
- `endDate` (optional): ISO 8601 date

**Response:**
```json
{
  "avgWaitTime": 22,           // นาที
  "bedOccupancy": 85,           // %
  "satisfaction": 94,           // %
  "staffUtilization": 92,       // %
  "totalPatients": 1250,        // จำนวนคน
  "emergencyCases": 340,        // จำนวนเคส
  "avgResponseTime": 8,         // นาที
  "period": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-30T23:59:59Z"
  }
}
```

---

### 3. **GET /hospitals/:hospitalId/metrics**
ดึงข้อมูลสำหรับกราฟ (time series data)

**Query Parameters:**
- `metric`: `emergencyCases` | `bedOccupancy` | `waitTime` | `satisfaction`
- `period`: `week` | `month` | `quarter` | `year`
- `granularity`: `hour` | `day` | `week` | `month`

**Response:**
```json
{
  "metric": "emergencyCases",
  "period": "week",
  "granularity": "day",
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "values": [45, 52, 38, 65, 48, 42, 55]
  }
}
```

---

### 4. **POST /hospitals/:hospitalId/reports/generate**
สร้างรีพอร์ตใหม่

**Request Body:**
```json
{
  "type": "emergency" | "resources" | "patients" | "performance",
  "period": "week" | "month" | "quarter" | "year",
  "startDate": "2025-11-01T00:00:00Z",  // optional
  "endDate": "2025-11-30T23:59:59Z",    // optional
  "format": "pdf" | "excel" | "csv"     // optional, default: pdf
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Emergency Department Performance - November 2025",
  "type": "emergency",
  "status": "generating",
  "estimatedCompletionTime": "2025-11-23T14:30:00Z"
}
```

---

### 5. **GET /reports/:reportId/download**
ดาวน์โหลดไฟล์รีพอร์ต

**Response:**
- Content-Type: `application/pdf` | `application/vnd.ms-excel` | `text/csv`
- Content-Disposition: `attachment; filename="report-{id}.pdf"`
- Binary file data

---

### 6. **GET /reports/:reportId/status**
เช็คสถานะการสร้างรีพอร์ต (สำหรับ polling)

**Response:**
```json
{
  "id": "uuid",
  "status": "completed" | "generating" | "failed",
  "progress": 75,  // % (0-100)
  "fileUrl": "/api/reports/download/uuid",  // เมื่อ status = completed
  "error": "Error message"  // เมื่อ status = failed
}
```

---

## 📊 Data Requirements

### **Emergency Cases Data**
ต้องการข้อมูล:
- จำนวนเคสฉุกเฉินต่อวัน/สัปดาห์/เดือน
- Severity distribution (1-4)
- Average response time
- Case status distribution

### **Bed Occupancy Data**
ต้องการข้อมูล:
- Total beds vs occupied beds
- ICU beds vs occupied ICU beds
- Occupancy rate over time
- Average length of stay

### **Patient Satisfaction Data**
ต้องการข้อมูล:
- Overall satisfaction score
- Satisfaction by department
- Satisfaction trends over time
- Number of surveys completed

### **Staff Utilization Data**
ต้องการข้อมูล:
- Total staff vs available staff
- Staff by department
- Overtime hours
- Staff-to-patient ratio

---

## 🔐 Authorization

ทุก API ต้อง:
1. ตรวจสอบ JWT token
2. ตรวจสอบว่า User มี Role = `HOSPITAL`
3. ตรวจสอบว่า User มี `organizationId` ตรงกับ `:hospitalId` ที่ request

---

## 📝 Database Schema Suggestions

### **Report Table**
```sql
CREATE TABLE "Report" (
  id UUID PRIMARY KEY,
  hospitalId UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  period VARCHAR(100),
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  status VARCHAR(20) NOT NULL,
  fileUrl VARCHAR(500),
  generatedAt TIMESTAMP NOT NULL,
  generatedBy UUID,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (hospitalId) REFERENCES "Organization"(id),
  FOREIGN KEY (generatedBy) REFERENCES "User"(id)
);
```

### **HospitalMetrics Table** (for time-series data)
```sql
CREATE TABLE "HospitalMetrics" (
  id UUID PRIMARY KEY,
  hospitalId UUID NOT NULL,
  metricType VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (hospitalId) REFERENCES "Organization"(id),
  INDEX idx_hospital_metric_time (hospitalId, metricType, timestamp)
);
```

---

## 🎯 Priority

1. **HIGH:** GET `/hospitals/:hospitalId/stats` - สำหรับ Stats Cards
2. **HIGH:** GET `/hospitals/:hospitalId/metrics` - สำหรับ Charts
3. **MEDIUM:** GET `/hospitals/:hospitalId/reports` - สำหรับ Report List
4. **MEDIUM:** POST `/hospitals/:hospitalId/reports/generate` - สำหรับสร้างรีพอร์ต
5. **LOW:** GET `/reports/:reportId/download` - สำหรับดาวน์โหลด

---

## 📤 Testing Data

ขอ Mock Data สำหรับทดสอบ:
- Hospital ID: `e8ebc3a5-3c01-400d-8030-b90e4906e413`
- Period: Last 30 days
- ข้อมูลควรมีความหลากหลายเพื่อทดสอบกราฟและสถิติ

---

**สร้างโดย:** Frontend Developer  
**วันที่:** 2025-11-23  
**สถานะ:** รอ Backend implement APIs
