# STP CHICKENS — Admin Portal Setup & Run Guide

## 1. Quick Startup Commands

To start both frontend and backend servers together in one command:

```powershell
node scripts/startAll.js
```
*Or using npm from the project root:*
```powershell
npm start
```

### Starting Services Individually

- **Backend API Server (Port 5000):**
  ```powershell
  cd server
  node src/server.js
  ```
  *(Or `npm run start:backend` from root)*

- **Frontend Static Server (Port 3000):**
  ```powershell
  npx serve . -p 3000
  ```
  *(Or `npm run start:frontend` from root)*

---

## 2. Admin Portal URLs

- **Primary Clean URL:** [http://localhost:3000/admin-dashboard/AdminDashboard](http://localhost:3000/admin-dashboard/AdminDashboard)
- **Direct HTML URL:** [http://localhost:3000/admin-dashboard/AdminDashboard.html](http://localhost:3000/admin-dashboard/AdminDashboard.html)
- **Backend API Base:** `http://localhost:5000/api`
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 3. How to Stop the Servers

- In the terminal running the servers, press `Ctrl + C` and confirm with `Y`.
- If running in background mode, find the process listening on ports 3000 and 5000:
  ```powershell
  netstat -ano | findstr "3000 5000"
  taskkill /PID <PID> /F
  ```

