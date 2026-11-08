# STP Smart AI Assistant — Architecture Specification

This document details the architecture, data pipeline, and security boundaries for the **STP Smart AI Assistant** built for **Thangam Farms / STP Chickens**.

---

## 1. System Overview

The STP Smart AI Assistant is a hybrid voice and text customer procurement agent designed specifically for B2B commercial poultry buyers across Tamil Nadu.

- **Primary Languages Supported:** Tamil (தமிழ்), English, and natural Tanglish (Tamil phrases written in Latin script).
- **Core Purpose:** Guide hotel, catering, restaurant, and supermarket procurement managers regarding wholesale broiler availability, minimum order quantities (50 kg), dawn dispatch windows (04:00 AM–06:30 AM), custom cuts, and capture structured commercial enquiries into the MongoDB Atlas database.
- **Privacy & Security Guarantee:** Zero background microphone eavesdropping; zero prompt injection exposure to internal admin data; zero fabricated prices or fake certifications.

---

## 2. Component Architecture

```
[Browser Client / Mobile PWA]
       │
       ├── Web Speech API (Native SpeechRecognition & SpeechSynthesis in ta-IN / en-IN)
       ├── STP Smart Assistant Floating Widget (client/src/components/stpAssistant.js)
       └── HTTP REST API Client (client/src/services/api.js)
              │
              ▼
[Express Backend Server (Port 5000)]
       │
       ├── Assistant Controller (/api/assistant/chat, /api/assistant/transcribe)
       ├── Language Detection Engine (Tamil script / Tanglish phonetic patterns / English)
       ├── Verified Business Knowledge Module (server/src/services/assistantKnowledge.js)
       │      │ (Guards: 50kg min, Dawn Dispatch, Custom Cuts, Kannampalayam Hub)
       │
       ├── Conversational Lead Extraction & Validation
       │      │ (Validates 10-digit Indian mobile, quantities, product choices)
       │
       ▼
[Storage Factory & MongoDB Atlas Cluster]
       ├── `enquiries` collection (Persists generated ENQ-XXXXXX commercial leads)
       └── `admins` collection (Protected by requireAdminAuth middleware)
```

---

## 3. Natural Language Processing & Language Routing

1. **Tamil Script Detection:** Evaluates Unicode range `[\u0B80-\u0BFF]`. Responses are generated directly in natural business Tamil.
2. **Tanglish Detection:** Regular expression phonetic lexicon identifying common Tamil conversational terms in English script (`vanakkam`, `enna`, `vilai`, `eppadi`, `kilo`, `theva`, `kudukareengala`, etc.).
3. **English Processing:** Standard technical and commercial wholesale vocabulary.
4. **Fallback Handling:** If a question falls outside verified business parameters (e.g. asking for specific daily feed commodity rates), the assistant explicitly states that the Kannampalayam commercial desk will provide the current daily quote.

---

## 4. Voice Processing Pipeline

1. **User Activation:** Microphone is activated **only** when the user explicitly taps the microphone button.
2. **Speech Recognition:** Uses browser native `webkitSpeechRecognition` or `SpeechRecognition` configured for `ta-IN` with automatic English fallback.
3. **Server-side Audio Fallback (`/api/assistant/transcribe`):** Receives base64 audio streams for processing when browser-level speech recognition is disabled.
4. **Text-to-Speech (TTS):** Responses are vocalized using `SpeechSynthesisUtterance` with language tagging (`ta-IN` / `en-IN`). Users can mute audio feedback at any time via the header volume toggle.

---

## 5. Security & Boundary Defenses

- **Zero Unauthorized DB Reads:** The assistant has read access only to static, owner-verified knowledge objects (`assistantKnowledge.js`). It cannot query past customer records, admin passwords, or internal collection documents.
- **Sanitized Enquiry Ingestion:** When a buyer requests supply, inputs are passed through standard validation before being committed to MongoDB Atlas.
- **WhatsApp Direct Handoff:** Uses official `https://wa.me/` direct messaging links with prefilled text templates, avoiding brittle unverified third-party WhatsApp bots.

