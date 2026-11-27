# 🚀 Complete Deployment Guide: e-RajPatra Platform

This repository is pre-configured with a **unified full-stack architecture**. When deployed, a single service runs the Node.js/Express backend API, serves the optimized React SPA frontend, and broadcasts real-time WebSocket notifications via Socket.IO—**with zero CORS issues**.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Set Up Free MongoDB Atlas Database (3 mins)](#step-1-set-up-free-mongodb-atlas-database-3-mins)
3. [Step 2: Deploy to Render (Recommended - Free Tier)](#step-2-deploy-to-render-recommended---free-tier)
4. [Step 3: Accessing Admin Dashboard & Verification](#step-3-accessing-admin-dashboard--verification)
5. [Optional Integrations (Cloudinary & Google Gemini)](#optional-integrations)
6. [Alternative: Split Deployment (Frontend on Vercel + Backend on Render)](#alternative-split-deployment)

---

## 1. Prerequisites
- A **GitHub account** with this repo pushed ([https://github.com/Kunal225-tech/react-proj](https://github.com/Kunal225-tech/react-proj)).
- A free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
- A free account on [Render.com](https://render.com/).

---

## Step 1: Set Up Free MongoDB Atlas Database (3 mins)

1. **Sign in / Register:** Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Create a Free Cluster:**
   - Click **Create Deployment** -> Choose **M0 Free** (Free forever, 512 MB).
   - Select your nearest cloud provider region (e.g., AWS Mumbai / Frankfurt / Oregon).
   - Click **Create Deployment**.
3. **Set Up Database User:**
   - Under **Security** -> **Database Access** -> Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Set Username (e.g., `rajpatra_user`) and a secure password (e.g., `Govt@Pass2026`). *Save these!*
   - Database User Privileges: **Read and write to any database**.
   - Click **Add User**.
4. **Allow Network Access (Crucial):**
   - Under **Security** -> **Network Access** -> Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm** *(This allows cloud servers on Render to connect).*
5. **Get Connection String:**
   - Under **Database** -> Click **Connect**.
   - Choose **Drivers** -> Select **Node.js**.
   - Copy the connection string format:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/govt_order_portal?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with the credentials created in step 3. Make sure to specify the database name `/govt_order_portal` right before the `?`.

---

## Step 2: Deploy to Render (Recommended - Free Tier)

### Method A: Direct Web Service (Fastest & Simplest)

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** -> Select **Web Service**.
3. Under **Connect a repository**, select `Kunal225-tech/react-proj`.
4. Configure service settings:
   - **Name:** `e-rajpatra-platform` (or any name you like)
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run build
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`
5. Scroll down to **Environment Variables** and add the following:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode & SPA static serving |
   | `MONGODB_URI` | `mongodb+srv://<user>:<pass>@...` | Your MongoDB Atlas connection URI from Step 1 |
   | `JWT_SECRET` | `supersecret_jwt_key_rajpatra_2026` | Any secure random string for JWT auth |
   | `ADMIN_INITIAL_EMAIL` | `admin@rajpatra.gov.in` | Default admin email |
   | `ADMIN_INITIAL_PASSWORD` | `Admin@12345` | Default admin password |
   | `GEMINI_API_KEY` | *(Optional)* | Google Gemini key for plain-language summaries |

6. Click **Deploy Web Service**!

> **✨ Automatic First Boot Bootstrapping:**  
> When your service boots up for the first time, it will automatically:
> 1. Connect to MongoDB Atlas.
> 2. Auto-create the superadmin account (`admin@rajpatra.gov.in`).
> 3. Auto-seed all 9 multilingual government orders (Scholarships, Health, Agriculture, EV, etc.).
> 4. Auto-generate the authentic standalone PDF gazettes on disk.
> 5. Serve the React UI, REST APIs, and WebSocket gateway.

---

## Step 3: Accessing Admin Dashboard & Verification

Once Render finishes deploying (indicated by `Your service is live`):

1. **Visit Public Portal:** Open your Render URL: `https://<your-app-name>.onrender.com`.
   - Test language switching between **English**, **Hindi**, and **Punjabi**.
   - Test search, department filters, and click **Download Gazette PDF**.
2. **Access Admin Portal:** Navigate to `https://<your-app-name>.onrender.com/admin/login`.
   - **Email:** `admin@rajpatra.gov.in`
   - **Password:** `Admin@12345`
3. **Test Real-Time Notifications:**
   - Open the public portal in one browser window/device.
   - In another browser tab/window, publish a new order from the admin dashboard.
   - Watch the floating real-time notification banner immediately broadcast to the public portal without any page reload!

---

## Optional Integrations

### 1. Cloudinary (Permanent Cloud File Archival)
Render's free tier has an ephemeral disk (files saved locally reset if the service spins down). To permanently preserve uploaded PDFs in the cloud:
1. Create a free account at [Cloudinary.com](https://cloudinary.com/).
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from Dashboard.
3. In Render -> **Environment Variables**, add:
   - `CLOUDINARY_CLOUD_NAME=<your_cloud_name>`
   - `CLOUDINARY_API_KEY=<your_api_key>`
   - `CLOUDINARY_API_SECRET=<your_api_secret>`
4. The backend automatically switches from local storage to Cloudinary CDN storage!

### 2. Google Gemini AI (Citizen Plain-Language Summaries)
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. In Render -> **Environment Variables**, add:
   - `GEMINI_API_KEY=<your_gemini_api_key>`
3. Citizens can now click the **AI Plain-Language Summary** button on any order to get an instant 3-bullet breakdown in their chosen language!

---

## Alternative: Split Deployment

If you prefer deploying the frontend on **Vercel** and backend on **Render**:

### Backend on Render:
- Root directory: `./`
- Build Command: `npm install --prefix backend`
- Start Command: `node backend/server.js`
- Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, etc.
- Note your backend URL: `https://my-backend.onrender.com`.

### Frontend on Vercel:
- Import repository into Vercel.
- Framework Preset: `Vite`.
- Root Directory: `frontend`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Environment Variables in Vercel:
  - `VITE_API_URL`: `https://my-backend.onrender.com/api`
  - `VITE_SOCKET_URL`: `https://my-backend.onrender.com`
