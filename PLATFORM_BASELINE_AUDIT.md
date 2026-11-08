# STP CHICKENS by Thangam Farms — Master Platform Baseline Audit

**Date:** 2026-11-04  
**Audit Scope:** Full-Stack Architecture, Public Experience, CRM Engine, AI Assistant, Voice Messaging, and Database Resiliency  
**Public Brand:** STP CHICKENS by Thangam Farms  
**Facility Address:** 152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103  
**Status:** **OPERATIONAL & STABILIZED (PUBLIC DEPLOYMENT HELD)**

---

## 1. Project Directory & Component Inventory

- **Frontend Root (`./`):**
  - `index.html` — Public Homepage with cinematic video hero, gold/ivory contrast typography, and operational metrics.
  - `about-us/AboutUs.html` — B2B operational narrative focusing on bio-security and cold-chain dispatch.
  - `products/Products.html` — Product catalogue for Fresh Whole Chicken, Skinless, Specialized Cuts, and Bulk Crates.
  - `quality-hygiene/QualityHygiene.html` — Rigorous handling protocols, temperature standards, and inspection workflows.
  - `contact-enquiry/ContactEnquiry.html` — Lead capture form with live route navigation to Kannampalayam.
  - `admin-dashboard/AdminDashboard.html` — Enterprise CRM and enquiry management portal.
- **Client Components (`client/src/`):**
  - `components/routeMap.js` — Leaflet + OpenStreetMap + OSRM route navigation to coordinates `11.0050, 77.1013`.
  - `components/stpAssistant.js` — Bilingual AI assistant (Tamil, Tanglish, English) with voice recording and WhatsApp/Call quick-actions.
  - `services/api.js` — Centralized client API service with cookie credentials.
- **Backend API (`server/src/`):**
  - Node.js & Express API with Helmet, CORS, Cookie-Parser, and rate limiters.
  - Modular storage abstraction supporting MongoDB Atlas with graceful fallback to persistent local storage.

---

## 2. Issues Diagnosed and Resolved

1. **Admin Portal `ERR_CONNECTION_REFUSED`**:
   - **Root Cause:** Background tasks were cleared during a server restart, leaving ports 3000 and 5000 inactive.
   - **Fix:** Created unified startup script `scripts/startAll.js` and updated root `package.json` with `npm start`, `npm run start:frontend`, and `npm run start:backend`.

2. **Mongoose `admins.findOne()` Buffer Timeout (10000ms)**:
   - **Root Cause:** Mongoose defaulted to `bufferCommands: true`. When MongoDB Atlas connection was pending IP whitelisting, queries blocked for 10 seconds before failing.
   - **Fix:** Set `bufferCommands: false` in database config and schemas, enabling immediate fallback to local JSON storage for zero-downtime operation.

3. **B2B CRM Data Management**:
   - Built server-side CSV export endpoint (`GET /api/admin/export-csv`) with role-based JWT authentication and sanitized escaping.
   - Added direct customer **Call** and **WhatsApp** action buttons into the admin detail inspection drawer.

4. **Voice Recording Workflow**:
   - Integrated duration timer, stop/cancel controls, and pre-submission editable transcript directly into the chat input.

