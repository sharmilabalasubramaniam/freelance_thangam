# STP CHICKENS by Thangam Farms — Production Readiness Checklist

**Review Status:** **PREVIEW READY (PUBLIC DEPLOYMENT HELD)**  
**Version:** 2.0.0  
**Target Environment:** Local Staging / Private Owner Review  

---

## 1. Production Go-Live Readiness Matrix

| Category | Item Description | Readiness | Action Required |
| :--- | :--- | :---: | :--- |
| **Branding & Copy** | Consistent brand "STP CHICKENS by Thangam Farms" | **100% Ready** | None. Aligned across all 6 pages. |
| **Operational Facts** | 50 kg MOQ, 04:00 AM–06:30 AM dispatch, 2-hr SLA | **100% Ready** | None. Factual compliance verified. |
| **Media & Video** | Hero video autoplay, muted, playsinline, static poster | **100% Ready** | High-res local WebM and JPG poster ready. |
| **Wholesale Conversion** | WhatsApp & Call direct buttons + Get Wholesale Rate flow | **100% Ready** | Connected to verified desk contact (+91 99651 60358). |
| **Bilingual AI Assistant** | Tamil/Tanglish/English voice + text assistant | **100% Ready** | Functional in verified offline mode; API key optional for cloud LLM. |
| **Route Map & GPS** | Coordinates 11.0050, 77.1013 on NH 81 corridor | **100% Ready** | Confirmed by owner; Leaflet & Google Maps active. |
| **Admin Operations** | Password hashing, JWT cookie authentication, CRUD | **100% Ready** | Active with zero sensitive credential exposure. |
| **MongoDB Atlas** | Production cluster IP access | **Action Needed** | **Owner Action Required:** Whitelist server IP in MongoDB Atlas Security if connecting to cloud DB. |
| **Domain & DNS** | DNS records, SSL/TLS certificate | **On Hold** | Awaiting owner authorization before publishing. |
| **WhatsApp Business API**| Official WhatsApp Business Platform credentials | **On Hold** | Currently utilizing official click-to-chat `wa.me` links safely. |

---

## 2. Environment Variables Specification

The `.env` file should include the following variables in production:

```ini
# Server Environment
NODE_ENV=production
PORT=5000

# Client Application URL
CLIENT_URL=https://thangamfarms.in

# Storage Mode (mongodb or json)
STORAGE_MODE=mongodb
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/thangam_farms?retryWrites=true&w=majority
MONGO_DB_NAME=thangam_farms

# Security & Authentication
JWT_SECRET=your_super_strong_production_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_strong_cookie_secret_key

# Optional Cloud AI Assistant Providers (Falls back to deterministic rule engine if omitted)
GEMINI_API_KEY=
OPENAI_API_KEY=
```

---

## 3. Deployment Safety Protocol

> [!IMPORTANT]
> Public deployment must remain **ON HOLD** until:
> 1. The business owner conducts the final review on the local preview URLs.
> 2. The owner authorizes production domain DNS pointing and Atlas IP whitelisting.

