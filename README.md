# 📄 ProfResumeBuilder

A professional full-stack Resume Builder with **MongoDB Atlas**, **Spring Boot**, **React**, and a **single Docker container**.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB Atlas connection string

### 1. Set up environment
```bash
cp .env.example .env
# Edit .env and add your MongoDB connection string
```

### 2. Start the Backend
```bash
cd backend
MONGODB_URI="your-connection-string" mvn spring-boot:run
```
Or on Windows:
```powershell
$env:MONGODB_URI="your-connection-string"; mvn spring-boot:run
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open → **http://localhost:3000**

---

## 🐳 Docker (Single Container)

```bash
# Build the image
docker build -t prof-resume-builder .

# Run with your MongoDB URI
docker run -p 8080:8080 \
  -e MONGODB_URI="mongodb+srv://..." \
  prof-resume-builder
```
Open → **http://localhost:8080**

---

## 📁 Project Structure
```
prof-resume-builder/
├── .env                    ← secrets (gitignored)
├── .env.example            ← template for .env
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile          ← single container (React + Spring Boot)
│   ├── mvnw                ← Maven wrapper
│   ├── pom.xml
│   └── src/main/java/com/profresumebuilder/
│       ├── config/         → MongoDB, CORS, Web configs
│       ├── controller/     → REST endpoints + React router
│       ├── exception/      → Global error handling
│       ├── model/          → MongoDB documents
│       ├── repository/     → Spring Data MongoDB
│       └── service/        → Business logic + PDF generation
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        └── App.jsx         ← Obsidian Studio UI
```

---

## 🌐 API Endpoints
```
POST   /api/resumes                    Create resume
GET    /api/resumes                    Get all (or ?search=keyword)
GET    /api/resumes/{id}               Get one
PUT    /api/resumes/{id}               Save full resume
DELETE /api/resumes/{id}               Delete

PUT    /api/resumes/{id}/personal-info  Save personal info
PUT    /api/resumes/{id}/experiences    Save all experiences
PUT    /api/resumes/{id}/educations     Save all educations
PUT    /api/resumes/{id}/skills         Save all skills
PUT    /api/resumes/{id}/signature      Save signature
GET    /api/resumes/{id}/pdf            Download PDF
```

---

## ⚠️ Important — Never Commit Secrets
The `.env` file is listed in `.gitignore` and will never be committed.
Use `.env.example` as a template and keep your credentials safe.
