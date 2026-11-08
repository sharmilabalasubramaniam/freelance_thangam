const fs = require('fs');
let code = fs.readFileSync('client/src/components/stpAssistant.js', 'utf8');

// Replace the onresult handler to populate input so user can edit before send
const oldResult = `          this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('stp-chat-input');
            if (input) {
              input.value = transcript;
              this.handleSend();
            }
            this.stopVoiceRecording();
          };`;

const newResult = `          this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('stp-chat-input');
            if (input) {
              input.value = transcript;
              input.focus();
            }
            this.stopVoiceRecording();
            this.appendMessage('bot', 'Voice message transcribed: "' + this.escapeHtml(transcript) + '". You can edit the text in the input box above or tap Send.');
          };`;

if (code.includes(oldResult)) {
  code = code.replace(oldResult, newResult);
  fs.writeFileSync('client/src/components/stpAssistant.js', code, 'utf8');
  console.log('Successfully enabled editable transcript before sending in stpAssistant.js!');
} else {
  console.log('Target oldResult not found');
}

