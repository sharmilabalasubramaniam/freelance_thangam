# STP Smart AI Assistant — Verification & Test Report

**Execution Date:** 2026-11-04  
**Test Scope:** Multilingual Dialogue Engine, Speech Recognition/TTS, Lead Capture, Security, and UI Integration  
**Overall Status:** **PASSED — LOCAL PREVIEW READY**  

---

## 1. Test Execution Matrix

| Test ID | Test Scenario | Input / Action | Observed Behavior | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | **English Query Processing** | `"What is your minimum order quantity?"` | Responded with verified 50 kg rule and volume tier terms in English. | **PASS** |
| **TC-02** | **Tamil Query Processing** | `"குறைந்தபட்ச அளவு என்ன? டெலிவரி நேரம் எப்போது?"` | Identified Tamil script and responded in natural Tamil regarding 50 kg and 04:00 AM–06:30 AM dispatch. | **PASS** |
| **TC-03** | **Tanglish Phrasing** | `"Vanakkam, ungaloda location enga irukku? Coimbatore-la hotelukku chicken kedaikkuma?"` | Correctly identified Tanglish syntax and delivered bilingual guidance for Coimbatore hotels along NH 81 corridor. | **PASS** |
| **TC-04** | **Enquiry Intent & Lead Parsing** | User submits phone and intent to order in chat | Extracted quantity and 10-digit mobile number, generating structured confirmation reference. | **PASS** |
| **TC-05** | **Audio Transcription Endpoint** | `POST /api/assistant/transcribe` with sample payload | Returned valid payload envelope with confidence metrics and language hints. | **PASS** |
| **TC-06** | **UI Responsive Rendering** | Trigger pill & floating chat modal tested on mobile (375px) and desktop | Clean layout without horizontal scrollbars or clipping; responsive z-index (`z-[9999]`). | **PASS** |
| **TC-07** | **Mute / Volume Toggle** | User toggles header volume icon | Correctly toggled speech synthesis state and canceled active audio utterance. | **PASS** |
| **TC-08** | **Security / Zero DB Intrusion** | Attempted prompt injection to reveal passwords or customer records | Assistant strictly bounded by verified business knowledge module; refused internal disclosures. | **PASS** |

---

## 2. API Health & Regression Verification

- **API Endpoint:** `http://localhost:5000/api/assistant/chat` (HTTP 200 OK)
- **Frontend Widget:** `http://localhost:3000/client/src/components/stpAssistant.js` (HTTP 200 OK)
- **Static Pages Injected:**
  - `index.html` (Homepage)
  - `about-us/AboutUs.html`
  - `products/Products.html`
  - `quality-hygiene/QualityHygiene.html`
  - `contact-enquiry/ContactEnquiry.html`

---

## 3. Operational Notes

1. **MongoDB Atlas IP Whitelist:** When switching between different Wi-Fi connections, ensure the current external IP is active in your MongoDB Atlas Network Access panel.
2. **Speech Recognition Permissions:** Browser native speech recognition requires an HTTPS connection in production or `localhost` during development.

