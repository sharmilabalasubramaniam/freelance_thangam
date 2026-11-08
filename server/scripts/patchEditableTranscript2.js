const fs = require('fs');
let code = fs.readFileSync('client/src/components/stpAssistant.js', 'utf8');

const sIdx = code.indexOf('this.recognition.onresult');
const eIdx = code.indexOf('this.recognition.onerror');

if (sIdx !== -1 && eIdx !== -1) {
  const replacement = `this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const input = document.getElementById('stp-chat-input');
          if (input) {
            input.value = transcript;
            input.focus();
          }
          this.stopVoiceRecording();
          this.appendMessage('bot', 'Voice message recorded: "' + this.escapeHtml(transcript) + '". You can edit the transcript in the input box or press Send.');
        };\n\n        `;
  code = code.slice(0, sIdx) + replacement + code.slice(eIdx);
  fs.writeFileSync('client/src/components/stpAssistant.js', code, 'utf8');
  console.log('Successfully updated stpAssistant.js with editable transcript!');
} else {
  console.log('Indices not found', sIdx, eIdx);
}

