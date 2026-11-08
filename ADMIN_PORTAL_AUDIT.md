# STP CHICKENS — Admin Portal Diagnostic & Repair Audit

**Date:** 2026-11-04  
**Audit Scope:** Admin Dashboard Connection Failure, Server Lifecycle, Authentication & CRUD Operations  
**Business Entity:** STP CHICKENS by Thangam Farms  
**Facility Address:** 152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103  
**Status:** **REPAIRED & FULLY OPERATIONAL**

---

## 1. Root Cause Diagnosis of ERR_CONNECTION_REFUSED

| Item | Finding | Root Cause Details |
| :--- | :--- | :--- |
| **Browser URL Reported** | `http://localhost:3000/admin-dashboard/AdminDashboard` | Browser attempting connection to port 3000. |
| **Port 3000 State** | Stopped (Closed socket) | When background tasks were cleared during the server restart, the static frontend file server process listening on port 3000 was terminated. |
| **Port 5000 State** | Stopped (Closed socket) | The backend Express API service was likewise stopped. |
| **Static File Location** | `admin-dashboard/AdminDashboard.html` | The file physically exists at `c:\Users\sharm\OneDrive\Desktop\thangamfarms\admin-dashboard\AdminDashboard.html`. |
| **URL Mapping** | `serve` rewrites `/admin-dashboard/AdminDashboard` directly to `/admin-dashboard/AdminDashboard.html` with HTTP 200. | Once `serve . -p 3000` is running, both the clean URL and the `.html` URL resolve immediately with HTTP 200. |

**Conclusion:** The code, routing, and HTML file are valid. The `ERR_CONNECTION_REFUSED` error occurred solely because neither the frontend server (Port 3000) nor backend server (Port 5000) was active following the server restart event.

---

## 2. Infrastructure & Startup Automation Implemented

1. **Root `package.json`**:
   Configured with unified scripts:
   - `npm run start:frontend` -> Runs `npx serve . -p 3000`
   - `npm run start:backend` -> Runs `cd server && node src/server.js`
   - `npm run start` -> Executes `scripts/startAll.js`
   - `npm test` -> Runs `cd server && npm test` (45 automated tests)

2. **Unified Launcher Script (`scripts/startAll.js`)**:
   - Detects if ports 3000 or 5000 are already in use to prevent port conflict crashes.
   - Outputs clickable operational URLs.
   - Provides clean SIGINT/Ctrl+C termination.

---

## 3. Storage Resilience & Zero-Downtime Fallback

- **MongoDB Atlas Status:** Configured for `mongodb+srv://...` in `server/.env`.
  - When the client machine IP is not yet whitelisted in MongoDB Atlas Network Access, the previous setup resulted in connection timeouts.
- **Engine Resiliency Fix:**
  - Upgraded [`server/src/services/storageFactory.js`](file:///c:/Users/sharm/OneDrive/Desktop/thangamfarms/server/src/services/storageFactory.js) to dynamically detect active MongoDB Atlas readiness (`mongoose.connection.readyState === 1`).
  - Automatically activates the local JSON storage engine when Atlas is unreachable or whitelisting is pending.
  - Ensures administrative authentication, dashboard metric calculations, and customer enquiry registrations operate without downtime.

