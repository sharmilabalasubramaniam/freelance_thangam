# STP Smart AI Assistant — Setup & Deployment Guide

This guide explains how to configure, test, and deploy the **STP Smart AI Assistant** for local development and cloud production.

---

## 1. Prerequisites

- **Node.js:** v18.0.0 or higher (v24.17.0 tested)
- **Active Backend:** Node Express API server running on port `5000`
- **Active Static Frontend:** Static HTML/JS files served on port `3000`
- **Database:** MongoDB Atlas cluster (`thangam_farms`) configured in `server/.env`

---

## 2. Environment Configuration

Inspect `server/.env.example` and ensure the following keys are populated in your local or production environment:

```env
# Storage & Database
STORAGE_MODE=mongodb
MONGO_URI=mongodb+srv://<username>:<password>@thangamfarms.dc5qinr.mongodb.net/thangam_farms?retryWrites=true&w=majority
MONGO_DB_NAME=thangam_farms

# Optional: Cloud AI Neural Model Keys (For future expansion)
GEMINI_API_KEY=
OPENAI_API_KEY=
ASSISTANT_MODEL=gemini-1.5-flash
```

> **Note on AI Keys:** The assistant is pre-configured with a self-contained, deterministic business knowledge engine in [`server/src/services/assistantKnowledge.js`](file:///C:/Users/sharm/OneDrive/Desktop/thangamfarms/server/src/services/assistantKnowledge.js). It functions reliably with zero cloud API keys. Adding `GEMINI_API_KEY` enables generative expansion for out-of-domain conversational queries.

---

## 3. Running Locally

### Step 1: Start Backend
```bash
cd "C:\Users\sharm\OneDrive\Desktop\thangamfarms\server"
node src/server.js
```
Expected output:
```text
[Thangam Farms API] Primary database: MongoDB Atlas
[Thangam Farms API] Server running in development mode on port 5000
```

### Step 2: Start Frontend
```bash
cd "C:\Users\sharm\OneDrive\Desktop\thangamfarms"
npx serve . -p 3000
```

### Step 3: Access Assistant
Open your browser at `http://localhost:3000/`.  
The floating **"STP Smart Assistant"** pill will appear in the bottom-right corner.

---

## 4. Testing Audio & Voice Features

1. Click the **Microphone** icon inside the chat panel.
2. Grant microphone access when prompted by the browser.
3. Speak in **Tamil** (e.g., *"குறைந்தபட்ச ஆர்டர் அளவு என்ன?"*) or **English** (e.g., *"What is your minimum order?"*).
4. The transcript will be inserted into the message field and submitted.
5. The assistant will answer via text bubble and read the response aloud via speech synthesis.
6. Click the **Volume** icon in the header to mute speech synthesis if desired.

