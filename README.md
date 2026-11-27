# e-RajPatra: Real-Time Multi-Lingual Government Order Publishing Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online%20on%20Render-brightgreen?style=for-the-badge&logo=render)](https://e-rajpatra-platform.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/Kunal225-tech/react-proj)

> 🌐 **Live Application URL:** [https://e-rajpatra-platform.onrender.com/](https://e-rajpatra-platform.onrender.com/)  
> 🔐 **Admin Access:** [https://e-rajpatra-platform.onrender.com/admin/login](https://e-rajpatra-platform.onrender.com/admin/login) — **Email:** `admin@rajpatra.gov.in` | **Password:** `Admin@12345`

> **Academic Project Showcase**  
> *Demonstrating Full-Stack MERN Architecture, WebSocket Real-Time Broadcasting, Multi-Lingual Data Modeling, and Document Cloud Archival.*  
> ⚠️ **Disclaimer:** This software is an academic demonstration and is **not an official government portal**.

---

## 🏛️ Project Overview

**e-RajPatra** is a centralized web platform designed for state and central administrative bodies to publish authenticated government orders, gazette notifications, circulars, tenders, and public notices. 

Citizens can freely access the portal without login to:
- Browse, search, and filter orders by department, category, keyword, or date range.
- View authentic administrative orders translated across **English**, **Hindi**, and **Punjabi**.
- Download original, authenticated PDF gazette documents.
- Receive **real-time desktop and mobile push notifications via Socket.IO** the instant an authorized administrator publishes a new government order.

Administrators access a secure, role-restricted dashboard to manage the complete lifecycle of government orders (drafting, editing, publishing, unpublishing, and file upload).

---

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (JSX), Tailwind CSS, React Router DOM v6, Axios, Lucide Icons |
| **State Management** | React Context API (`LanguageContext`, `AuthContext`, `SocketContext`) |
| **Backend** | Node.js (v22), Express.js REST API |
| **Real-Time Engine** | Socket.IO (WebSockets with polling fallback) |
| **Database** | MongoDB & Mongoose ODM with Compound Multilingual Text Indexing |
| **Authentication** | JSON Web Tokens (JWT), bcrypt password hashing |
| **Document Storage** | Resilient local storage in `/uploads` with missing file auto-generation |
| **AI Integration** | Google Gemini (`@google/genai`) for 3-bullet plain-language citizen summaries |
| **Deployment Ready** | Single-service unified build for Render, Railway, or VPS |

---

## ✨ Key Features

### 1. Citizen Public Portal (No Registration Required)
- **Instant Multilingual Switching:** Switch seamlessly between English (`en`), Hindi (`hi`), and Punjabi (`pa`). UI elements and official document titles/descriptions translate instantly.
- **Real-Time Notification Banner:** Connected citizens receive instant floating notifications and unread badges whenever an order is published by administrators without needing page reload.
- **Advanced Filtering & Full-Text Search:** Filter by Department, Category, Date From/To, or search titles, keywords, and order numbers across all three languages.
- **Authentic PDF Access:** View and download original PDF gazette documents stored on cloud/server storage.
- **Accessibility Controls:** Font sizing (`A-`, `A`, `A+`), high contrast styling, and responsive layout for mobile, tablet, and desktop viewports.

### 2. Administrative Control Portal (Role-Protected)
- **Secure JWT Authentication:** Protected routes with token-based access and bcrypt password verification.
- **Order Lifecycle Management:** Create, edit, draft, publish, unpublish, and permanently delete orders.
- **Multilingual Input Tabs:** Dedicated input tabs for English, Hindi, and Punjabi titles and descriptions.
- **PDF Upload Engine:** Drag-and-drop PDF upload with type checking (PDF only) and 15MB size limit.
- **Administrative Metrics Dashboard:** Overview of total orders, published records, drafts pending review, and departmental distributions.

---

## 📂 Project Directory Structure

```text
govt-order-platform/
│
├── frontend/                     # React + Vite Frontend
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── admin/                # Admin views (Login, Dashboard, Form, Orders Table)
│   │   ├── assets/               # Branding assets
│   │   ├── components/           # Navbar, Footer, OrderCard, RealtimeToast, ProtectedRoute
│   │   ├── context/              # LanguageContext, AuthContext, SocketContext
│   │   ├── layouts/              # PublicLayout, AdminLayout
│   │   ├── pages/                # HomePage, OrdersListPage, OrderDetailPage
│   │   ├── services/             # Axios API client
│   │   ├── utils/                # Translations dictionary (EN, HI, PA)
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # Application bootstrap
│   │   └── index.css             # Tailwind CSS & custom styling
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                      # Node.js + Express + Socket.IO Backend
│   ├── config/                   # MongoDB connection logic
│   ├── controllers/              # AuthController, OrderController
│   ├── middleware/               # JWT auth middleware, Multer PDF upload, Error handlers
│   ├── models/                   # Admin.js, GovernmentOrder.js (Mongoose Schemas)
│   ├── routes/                   # authRoutes.js, orderRoutes.js, adminRoutes.js
│   ├── services/                 # Cloudinary & Local Resilient Storage Service
│   ├── socket/                   # Socket.IO gateway & event dispatchers
│   ├── utils/                    # Seed script, PDF generator, E2E test suite
│   ├── uploads/                  # Local storage directory for uploaded PDFs
│   ├── server.js                 # HTTP + WebSocket entry point
│   ├── package.json
│   └── .env                      # Backend environment configuration
│
├── PROJECT_ARCHITECTURE.md       # Complete system architecture & data flow diagrams
├── DATABASE_SCHEMA.md            # Detailed MongoDB models and index specifications
├── API_DOCUMENTATION.md          # REST API endpoints & WebSocket events reference
├── DEVELOPMENT_LOG.md            # Step-by-step implementation & verification log
├── VIVA_PREPARATION.md           # College viva guide & technical evaluation Q&A
├── .env.example                  # Template configuration file
└── README.md                     # Main documentation guide
```

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

---

### Step 1: Clone or Navigate to Project Directory
```bash
cd react-proj
```

---

### Step 2: Configure Environment Variables

**Backend Configuration (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/govt_order_portal
CLIENT_URL=http://localhost:3000

JWT_SECRET=supersecret_jwt_key_govt_order_platform_2026_secure
JWT_EXPIRES_IN=7d

ADMIN_INITIAL_EMAIL=admin@rajpatra.gov.in
ADMIN_INITIAL_PASSWORD=Admin@12345
ADMIN_INITIAL_NAME=System Administrator

# Cloudinary Storage (Optional: if blank, system safely uses local /uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend Configuration (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

### Step 3: Seed Database with Initial Admin & Realistic Orders
Run the seeder utility to create the initial admin user and 9 realistic trilingual government orders complete with generated official PDF gazette documents:

```bash
cd backend
npm run seed
```

*Output:*
```text
[Seed] Connecting to MongoDB: mongodb://127.0.0.1:27017/govt_order_portal
[Seed] Creating initial administrator: admin@rajpatra.gov.in
[Seed] Generating official PDF documents and populating multilingual orders...
[Seed] Database successfully seeded with:
   - Total Orders: 9 (8 Published, 1 Draft)
   - Admin Account: admin@rajpatra.gov.in (Password: Admin@12345)
```

---

### Step 4: Run the Application

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm start
# Server listens on http://localhost:5000
```

#### Terminal 2 — Start Frontend Client:
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

Open your browser at **`http://localhost:3000`** to access the public portal!

---

## 🔑 Administrative Login Credentials (Demo / Viva)

For testing and viva demonstrations, use the pre-configured administrator account:

- **Login URL:** `http://localhost:3000/admin/login`
- **Email:** `admin@rajpatra.gov.in`
- **Password:** `Admin@12345`
*(The login page includes an "Auto-fill Demo Credentials" button for instant login during demonstrations).*

---

## 🧪 Running Automated End-to-End Tests

The platform includes an automated test suite verifying health endpoints, search filters, JWT authentication, protected endpoints, and **live Socket.IO real-time event broadcasting**:

```bash
cd backend
node utils/testApi.js
```

*Expected Result:*
```text
====================================================
  STARTING END-TO-END AUTOMATED VERIFICATION SUITE  
====================================================
[PASS] GET /api/health returns online status
[PASS] GET /api/orders returns success
[PASS] Public orders array contains seeded data
[PASS] Search filter locates Scholarship orders
[PASS] Multilingual search matches Hindi keywords ("छात्रवृत्ति")
[PASS] POST /api/orders/summarize handles unconfigured API key with HTTP 503
[PASS] Admin login succeeds with valid JWT token returned
[PASS] GET /api/auth/me authenticates Bearer token
[PASS] GET /api/admin/orders/stats/summary returns aggregate metrics
[PASS] Admin successfully publishes a new government order
[PASS] Socket.IO broadcasts NEW_GOVERNMENT_ORDER to connected citizens in real time
[PASS] Status toggles successfully from published to draft
[PASS] Admin successfully deletes government order record
====================================================
  ALL 13/13 TESTS PASSED SUCCESSFULLY! (100% PASS RATE)
====================================================
```

---

## 🌐 Production Deployment Guide (Single Unified Service)

The project is structured to deploy effortlessly to **Render**, **Railway**, or any Node.js host as a single unified service:

1. **Build Command:**
   ```bash
   npm run build
   ```
   *(Installs backend & frontend packages, compiles the Vite React bundle into `frontend/dist`).*

2. **Start Command:**
   ```bash
   npm start
   ```
   *(Launches Express on port 5000, which serves API routes under `/api`, PDF documents under `/uploads`, real-time Socket.IO, and the built React SPA under `/*`).*

3. **Environment Variables on Render / Railway:**
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A secure 64-character secret
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for citizen plain-language summaries
   - `GEMINI_MODEL`: `gemini-2.5-flash`

---

## 📜 Academic Declaration & Authorship

This project is authored as a College Final Project in Full-Stack Web Engineering. All sample orders, departmental notifications, and simulated gazette records are fictitious and used solely for technological demonstration of real-time multi-lingual document publishing systems.
