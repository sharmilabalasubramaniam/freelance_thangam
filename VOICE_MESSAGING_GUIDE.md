# STP CHICKENS — Voice Messaging & Audio Workflow Guide

## 1. Voice Message Architecture

The voice system in STP Smart Assistant provides a secure, explicit consent-driven voice recording and transcription interface:

1. **User Action:** Customer clicks the microphone button inside the assistant widget.
2. **Permission Request:** Browser prompts for microphone access.
3. **Recording State:** 
   - A pulsing recording indicator appears with a live duration timer (`00:00`).
   - The user has direct **Cancel** and **Done** controls.
4. **Transcription:**
   - **Tamil & English Recognition:** Utilizes browser speech recognition configured for `ta-IN` with English fallback.
   - **Editable Transcript:** Upon stopping, the recognized text is placed into the input box so the user can verify or edit words before final submission.
5. **Server-Side Fallback:**
   - Endpoint `POST /api/assistant/transcribe` accepts Base64 audio payloads for server-side processing when external speech providers (e.g., Whisper, Gemini Speech) are configured in `server/.env`.

