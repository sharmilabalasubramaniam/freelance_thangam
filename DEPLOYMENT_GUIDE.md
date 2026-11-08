# Deployment & Rollback Guide — Thangam Farms 2.0 / STP Chickens

This document outlines the standard production deployment, environment provisioning, and disaster recovery procedures for **Thangam Farms 2.0 (STP Chickens)**.

---

## 1. System Architecture Overview

- **Frontend:** Responsive multi-page web application served via static host or CDN (Render, Vercel, Netlify, or Nginx).
- **Backend:** Node.js Express REST API server ([`server/src/server.js`](file:///C:/Users/sharm/OneDrive/Desktop/thangamfarms/server/src/server.js)).
- **Primary Database:** MongoDB Atlas cluster with auto-reconnect, connection pooling, and strict schema validation.
- **Storage Mode:** `STORAGE_MODE=mongodb` (default for live environment).
- **Secondary Backup:** Automated JSON state backups stored in timestamped folders under `backups/`.

---

## 2. Production Environment Variables Checklist

Configure these environment variables in your production environment settings (e.g., Render, Railway, AWS ECS, or Heroku dashboard). **Never commit the `.env` file to Git.**

| Variable Name | Required | Description / Example |
| :--- | :---: | :--- |
| `NODE_ENV` | Yes | Set to `production`. |
| `PORT` | Yes | Port allocated by cloud provider (e.g., `5000` or dynamically injected `PORT`). |
| `CLIENT_ORIGIN` | Yes | Comma-delimited origins of production frontend (e.g., `https://thangamfarms.in,https://www.thangamfarms.in`). |
| `JWT_SECRET` | Yes | Cryptographically secure random string (minimum 32 characters) for signing admin session tokens. |
| `JWT_EXPIRES_IN` | Optional | Duration of admin session (default: `24h`). |
| `COOKIE_NAME` | Optional | Cookie identifier for auth session (default: `thangam_admin_token`). |
| `MONGO_URI` | Yes | Production MongoDB Atlas SRV URI (`mongodb+srv://...`). |
| `MONGO_DB_NAME` | Yes | Database name: `thangam_farms`. |
| `STORAGE_MODE` | Yes | Set to `mongodb`. |
| `DATA_DIR` | Optional | Directory for local JSON snapshots/backups (`./data`). |

---

## 3. Deployment Procedure

### Step 1: Pre-flight Verification
Run local automated regression tests:
```bash
cd server
npm test
```
All tests must pass (`45 passed, 0 failed`) prior to triggering deployment.

### Step 2: Database Connectivity Check
Ensure your production server egress IP is whitelisted in MongoDB Atlas **Network Access** (or configure Private Link / VPC Peering).

### Step 3: Frontend Base URL Configuration
Ensure [`client/src/services/api.js`](file:///C:/Users/sharm/OneDrive/Desktop/thangamfarms/client/src/services/api.js) points to the production API URL:
```javascript
window.API_BASE_URL = 'https://api.thangamfarms.in/api';
```
*(When hosted on the same origin or proxy, `/api` is used directly).*

### Step 4: Backend Process Startup
```bash
cd server
npm install --omit=dev
npm start
```

### Step 5: Post-Deployment Smoke Test
Verify health endpoint:
```bash
curl -f https://<api-domain>/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "System operational and healthy",
  "data": {
    "status": "UP",
    "service": "Thangam Farms 2.0 API",
    "brand": "STP Chickens",
    "storage": {
      "type": "mongodb-atlas",
      "healthy": true,
      "state": "connected",
      "database": "thangam_farms"
    }
  }
}
```

---

## 4. Rollback Procedure

If an issue is detected during or immediately after deployment:

1. **Service Rollback:** In the hosting provider dashboard, instantly redeploy the previous stable build commit.
2. **Database Reversion / Point-in-time Recovery:**
   - MongoDB Atlas provides continuous point-in-time restores directly from the Atlas UI under **Backup > Restore**.
   - If fallback to local JSON is required in an emergency, update backend environment variable:
     ```env
     STORAGE_MODE=json
     ```
     Restart the service. The system will cleanly operate from [`server/data/`](file:///C:/Users/sharm/OneDrive/Desktop/thangamfarms/server/data) without data corruption.
3. **Admin Verification:**
   - Access `/admin-dashboard/AdminDashboard.html` and verify session login.

