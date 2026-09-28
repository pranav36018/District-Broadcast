# Connect Karnataka
### Mass Communication & District Contact Management Platform

Connect Karnataka is an enterprise-grade full-stack platform designed to manage district-wise contact lists, telephonic citizen calling, traffic-light feedback aggregation (Agree / Neutral / Disagree), and mass broadcasts across all **31 administrative districts of Karnataka**.

---

## 🚀 Quick Start (How to Run)

### Option 1: 1-Click Launch (Windows)
Double-click **`Run_Connect_Karnataka.bat`** (or **`Launch_Connect_Karnataka.vbs`**).
- Starts the local server in the background.
- Automatically opens **`http://localhost:5000`** in your default web browser.

### Option 2: Terminal / Command Prompt
1. Open PowerShell or Command Prompt in this folder.
2. If running for the first time on a new system:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Navigate to **`http://localhost:5000`** in your browser.

---

## 🔑 Demo Login Credentials

### 1. State Headquarters Command (Super Admin)
- **Portal:** Select *State Headquarters (Super Admin)*
- **Email:** `admin@connectkarnataka.demo`
- **Password:** `admin123`
- **Access:** State executive oversight, all 31 districts directory, mass broadcast creation, complete audit logs.

### 2. District In-Charge Field Portal
- **Portal:** Select *District In-Charge Portal*
- **Search or Quick-Pick District:**
  - **Bengaluru Urban (Primary Demo):** `incharge@connectkarnataka.demo` / `incharge123`
  - **Mysuru:** `mysuru@connectkarnataka.demo` / `mysuru123`
  - **Belagavi:** `belagavi@connectkarnataka.demo` / `belagavi123`
  - *(All other districts: `[districtname]@connectkarnataka.demo` / `[districtname]123`)*
- **Access:** Local jurisdiction contacts, live phone dialer with timer, traffic-light feedback recording (🟢 Agree / 🟡 Neutral / 🔴 Disagree), and broadcasts.

---

## 📁 Project Architecture
- **`server/`**: Express REST API + Native Node.js v24 SQLite database (`node:sqlite`) with pre-seeded data across all 31 Karnataka districts.
- **`client/`**: React 18 + Tailwind CSS + Lucide Icons. Pre-compiled in `client/dist/` for zero-build instant serving.
- **`Run_Connect_Karnataka.bat`**: Portable 1-click Windows launcher.
- **`Stop_Connect_Karnataka.bat`**: 1-click script to safely terminate the background server.
