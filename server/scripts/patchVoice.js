const fs = require('fs');
let code = fs.readFileSync('client/src/components/stpAssistant.js', 'utf8');

// Update attachEvents with voice controls
const oldAttach = `        if (micBtn) micBtn.addEventListener('click', () => this.handleVoiceClick());
        if (muteBtn) muteBtn.addEventListener('click', () => this.toggleMute());`;

const newAttach = `        if (micBtn) micBtn.addEventListener('click', () => this.handleVoiceClick());
        if (muteBtn) muteBtn.addEventListener('click', () => this.toggleMute());

        const stopVoiceBtn = document.getElementById('stp-stop-voice');
        const cancelVoiceBtn = document.getElementById('stp-cancel-voice');
        if (stopVoiceBtn) stopVoiceBtn.addEventListener('click', () => this.stopVoiceRecording(true));
        if (cancelVoiceBtn) cancelVoiceBtn.addEventListener('click', () => this.stopVoiceRecording(false));`;

code = code.replace(oldAttach, newAttach);

// Upgrade voice recording and transcription handling
const oldMethods = `    startVoiceRecording() {
      const bar = document.getElementById('stp-voice-recording-bar');
      const micBtn = document.getElementById('stp-mic-btn');

      if (this.recognition) {
        try {
          this.recognition.start();
          this.isRecording = true;
          if (bar) bar.classList.remove('hidden');
          if (micBtn) micBtn.classList.add('bg-rose-600', 'text-white');
        } catch (err) {
          console.warn('Recognition start error:', err);
        }
      } else {
        // Fallback or permission check
        alert('Speech recognition is not directly supported by this browser. You can type in Tamil or English.');
      }
    }

    stopVoiceRecording() {
      this.isRecording = false;
      const bar = document.getElementById('stp-voice-recording-bar');
      const micBtn = document.getElementById('stp-mic-btn');
      if (bar) bar.classList.add('hidden');
      if (micBtn) micBtn.classList.remove('bg-rose-600', 'text-white');

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
    }`;

const newMethods = `    startVoiceRecording() {
      const bar = document.getElementById('stp-voice-recording-bar');
      const micBtn = document.getElementById('stp-mic-btn');
      const durationEl = document.getElementById('stp-voice-duration');

      this.voiceDurationSec = 0;
      if (durationEl) durationEl.textContent = '00:00';
      clearInterval(this.voiceTimer);

      if (this.recognition) {
        try {
          this.recognition.start();
          this.isRecording = true;
          if (bar) bar.classList.remove('hidden');
          if (micBtn) micBtn.classList.add('bg-rose-600', 'text-white');

          this.voiceTimer = setInterval(() => {
            this.voiceDurationSec++;
            const mins = String(Math.floor(this.voiceDurationSec / 60)).padStart(2, '0');
            const secs = String(this.voiceDurationSec % 60).padStart(2, '0');
            if (durationEl) durationEl.textContent = \`\${mins}:\${secs}\`;
          }, 1000);
        } catch (err) {
          console.warn('Speech recognition start error:', err);
        }
      } else {
        this.appendMessage('bot', 'Microphone voice recognition is not supported in this browser. Please type your enquiry in Tamil, Tanglish, or English.');
      }
    }

    stopVoiceRecording(submit = true) {
      this.isRecording = false;
      clearInterval(this.voiceTimer);
      const bar = document.getElementById('stp-voice-recording-bar');
      const micBtn = document.getElementById('stp-mic-btn');
      if (bar) bar.classList.add('hidden');
      if (micBtn) micBtn.classList.remove('bg-rose-600', 'text-white');

      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
    }`;

code = code.replace(oldMethods, newMethods);

fs.writeFileSync('client/src/components/stpAssistant.js', code, 'utf8');
console.log('Voice recording controls updated successfully in stpAssistant.js!');

