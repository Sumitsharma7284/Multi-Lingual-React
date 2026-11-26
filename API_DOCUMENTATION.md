# REST API & Socket.IO Event Specification

## e-RajPatra: Real-Time Multi-Lingual Government Order Publishing Platform

---

## 1. Overview & Base URLs

- **API Base URL:** `http://localhost:5000/api`
- **Socket.IO Gateway:** `http://localhost:5000`
- **Authentication Scheme:** `Bearer <JWT_TOKEN>` in HTTP Header `Authorization`.
- **Response Format:** All endpoints return standard JSON with `success: true|false`.

---

## 2. Public Citizen Endpoints (No Authentication Required)

### 2.1 System Health
- **Endpoint:** `GET /health`
- **Description:** Verifies service availability.
- **Response `200 OK`:**
  ```json
  {
    "status": "online",
    "service": "Government Order Publishing Platform API",
    "timestamp": "2026-02-26T04:35:00.000Z",
    "environment": "development"
  }
  ```

---

### 2.2 List Published Government Orders
- **Endpoint:** `GET /orders`
- **Query Parameters:**
  - `search` *(string)*: Searches title (EN/HI/PA), description (EN/HI/PA), and orderNumber.
  - `department` *(string)*: Filters by specific department name (e.g., `Higher Education`).
  - `category` *(string)*: Filters by category (e.g., `Scholarship`, `Notification`).
  - `startDate` *(YYYY-MM-DD)*: Orders published on or after this date.
  - `endDate` *(YYYY-MM-DD)*: Orders published on or before this date.
  - `page` *(number, default: 1)*: Pagination page number.
  - `limit` *(number, default: 10)*: Records per page.
  - `sortBy` *(string, default: `publicationDate`)*.
  - `sortOrder` *(string: `asc` | `desc`, default: `desc`)*.
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "count": 8,
    "totalOrders": 8,
    "currentPage": 1,
    "totalPages": 1,
    "orders": [
      {
        "_id": "65b8c9d1e2f3a4b5c6d7e8f9",
        "orderNumber": "GO-2026-ED-101",
        "department": "Higher Education",
        "category": "Scholarship",
        "publicationDate": "2026-02-15T10:00:00.000Z",
        "status": "published",
        "title": {
          "en": "National Merit Scholarship Scheme 2026-27...",
          "hi": "स्नातक छात्रों के लिए राष्ट्रीय मेरिट छात्रवृत्ति योजना...",
          "pa": "ਅੰਡਰਗ੍ਰੈਜੂਏਟ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਰਾਸ਼ਟਰੀ ਮੈਰਿਟ ਸਕਾਲਰਸ਼ਿਪ ਸਕੀਮ..."
        },
        "description": { "en": "...", "hi": "...", "pa": "..." },
        "pdfUrl": "/uploads/order_GO-2026-ED-101.pdf",
        "pdfSize": 1042
      }
    ]
  }
  ```

---

### 2.3 Single Order Details
- **Endpoint:** `GET /orders/:id`
- **Parameters:** `id` (MongoDB ObjectId)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "order": { ... }
  }
  ```
- **Response `404 Not Found`:**
  ```json
  {
    "success": false,
    "message": "Government order not found or not currently published."
  }
  ```

---

### 2.4 Department & Category Metadata
- **Endpoints:**
  - `GET /orders/meta/departments`
  - `GET /orders/meta/categories`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "departments": ["Agriculture & Farmer Welfare", "Higher Education", "Health & Family Welfare", "..."]
  }
  ```

### 2.5 Citizen AI Plain-Language Summary
- **Endpoint:** `POST /orders/summarize`
- **Description:** Generates a 3-bullet plain-language summary of a government order in English, Hindi, or Punjabi using Google Gemini (`gemini-2.5-flash`).
- **Body:**
  ```json
  {
    "title": "National Merit Scholarship Scheme 2026-27",
    "description": "Financial assistance and monthly stipends for undergraduate students...",
    "language": "en"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "bullets": [
      "Provides monthly stipends and financial support to undergraduate students in technical and science fields.",
      "Aims to relieve tuition burdens for high-performing students across accredited institutions.",
      "Mandates quarterly direct bank transfers upon academic verification."
    ],
    "language": "en"
  }
  ```
- **Response `503 Service Unavailable`:** (Returned when `GEMINI_API_KEY` is unconfigured)
  ```json
  {
    "success": false,
    "message": "AI summary is not configured."
  }
  ```

---

## 3. Administrative Authentication Endpoints

### 3.1 Admin Login
- **Endpoint:** `POST /auth/login`
- **Body:**
  ```json
  {
    "email": "admin@rajpatra.gov.in",
    "password": "Admin@12345"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Authentication successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "65b8c9d1e2f3a4b5c6d7e8f1",
      "name": "System Administrator",
      "email": "admin@rajpatra.gov.in",
      "role": "superadmin"
    }
  }
  ```
- **Response `401 Unauthorized`:**
  ```json
  {
    "success": false,
    "message": "Invalid administrative credentials."
  }
  ```

---

### 3.2 Verify Active Admin Session
- **Endpoint:** `GET /auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:** Returns current admin details.

---

## 4. Protected Administration Endpoints (`/api/admin/orders`)

*All endpoints in this section require `Authorization: Bearer <token>`.*

### 4.1 Administrative Orders Overview & Table
- **Endpoint:** `GET /admin/orders`
- **Query Parameters:** `search`, `status` (`all` | `published` | `draft`), `department`, `page`, `limit`.
- **Response `200 OK`:** Returns all orders including drafts.

---

### 4.2 Dashboard Analytics Summary
- **Endpoint:** `GET /admin/orders/stats/summary`
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "stats": {
      "totalOrders": 9,
      "publishedOrders": 8,
      "draftOrders": 1,
      "departmentBreakdown": [
        { "_id": "Higher Education", "count": 2 },
        { "_id": "Health & Family Welfare", "count": 1 }
      ],
      "recentOrders": [ ... ]
    }
  }
  ```

---

### 4.3 Create Government Order (with PDF Upload)
- **Endpoint:** `POST /admin/orders`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `orderNumber`: `"GO-2026-AG-309"`
  - `department`: `"Agriculture & Farmer Welfare"`
  - `category`: `"Policy Order"`
  - `publicationDate`: `"2026-02-26"`
  - `status`: `"published"` or `"draft"`
  - `title`: JSON string `{"en": "...", "hi": "...", "pa": "..."}`
  - `description`: JSON string `{"en": "...", "hi": "...", "pa": "..."}`
  - `pdf`: File binary (`.pdf`, max 15MB)
- **Side Effect:** If `status === 'published'`, triggers Socket.IO event `NEW_GOVERNMENT_ORDER`.
- **Response `201 Created`:** Returns saved order document.

---

### 4.4 Update Government Order
- **Endpoint:** `PUT /admin/orders/:id`
- **Content-Type:** `multipart/form-data`
- **Description:** Updates multilingual text, metadata, or replaces PDF.

---

### 4.5 Quick Status Toggle (Draft ↔ Published)
- **Endpoint:** `PATCH /admin/orders/:id/status`
- **Description:** Flips order between `published` and `draft`. If toggled to `published`, triggers Socket.IO broadcast.

---

### 4.6 Delete Government Order
- **Endpoint:** `DELETE /admin/orders/:id`
- **Side Effect:** Removes order from MongoDB, deletes uploaded PDF, and emits `ORDER_DELETED`.

---

## 5. Socket.IO Real-Time Gateway Events

- **Client Room:** All clients automatically join room `'public_orders'`.

| Event Name | Direction | Payload Structure | Trigger Condition |
|---|---|---|---|
| `NEW_GOVERNMENT_ORDER` | Server → Client | `{ message: string, order: Object, timestamp: string }` | Administrator publishes an order (POST or status toggle to published). |
| `ORDER_UPDATED` | Server → Client | `{ order: Object, timestamp: string }` | Existing published order edited. |
| `ORDER_DELETED` | Server → Client | `{ orderId: string, timestamp: string }` | Order permanently removed. |
