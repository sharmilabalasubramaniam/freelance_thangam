# STP CHICKENS by Thangam Farms — Master Platform Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser)"]
        UI["6 Static HTML Pages\n(Tailwind CSS + Material Symbols)"]
        AssistantUI["Bilingual AI Assistant\n(Tamil, Tanglish, English Voice & Text)"]
        MapUI["Route Map\n(Leaflet + OSRM Engine)"]
        AdminUI["Admin Operations & CRM\n(Dashboard, Filters, Detail Panel)"]
    end

    subgraph Server ["Backend API Layer (Node.js & Express - Port 5000)"]
        AuthMiddleware["JWT Cookie Auth & Rate Limiter"]
        EnquiryRoutes["/api/enquiries\n(Create, Read, Update, Delete)"]
        AdminRoutes["/api/admin\n(Login, Overview, CSV Export)"]
        AssistantRoutes["/api/assistant\n(NLP Intent, Chat, Transcribe)"]
        StorageFactory["Storage Factory & Resiliency Engine\n(bufferCommands: false)"]
    end

    subgraph Data ["Persistence Layer"]
        Atlas["MongoDB Atlas Cluster\n(thangam_farms DB)"]
        JsonStorage["Persistent Local JSON Engine\n(data/enquiries.json, admins.json)"]
    end

    UI --> AssistantUI
    UI --> MapUI
    AdminUI --> AuthMiddleware
    AuthMiddleware --> AdminRoutes
    EnquiryRoutes --> StorageFactory
    AdminRoutes --> StorageFactory
    AssistantRoutes --> StorageFactory
    StorageFactory -->|Primary| Atlas
    StorageFactory -.->|Zero-Downtime Fallback| JsonStorage
```

### Architectural Principles:
1. **Factual Integrity:** Core business facts (50 kg MOQ, 04:00 AM–06:30 AM dispatch, 2-hour callback) are strictly maintained in both frontend copy and backend knowledge bases.
2. **Graceful Degradation:** The backend dynamically checks MongoDB connection state and falls back to disk-persisted local storage without throwing buffering timeouts.
3. **Stateless Authentication:** Admin sessions utilize HTTP-only signed JWT cookies with strict expiration and CSRF/XSS mitigations.

