/**
 * STP Smart AI Assistant Component
 * Bilingual Voice & Text Assistant (Tamil, Tanglish, English)
 * Integrates with STP Chickens B2B Wholesale backend API & MongoDB Atlas
 */

(function (global) {
  'use strict';

  class StpSmartAssistant {
    constructor(options = {}) {
      this.apiBase = options.apiBase || 'http://localhost:5000/api';
      this.isOpen = false;
      this.isRecording = false;
      this.isMuted = false;
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.recognition = null;
      this.history = [];
      this.currentLanguage = 'en';

      this.init();
    }

    init() {
      this.createWidgetDOM();
      this.attachEvents();
      this.initSpeechRecognition();
    }

    createWidgetDOM() {
      if (document.getElementById('stp-assistant-root')) return;

      const root = document.createElement('div');
      root.id = 'stp-assistant-root';
      root.className = 'fixed bottom-6 right-6 z-[9999] font-sans antialiased flex flex-col items-end gap-3 pointer-events-none';

      root.innerHTML = `
        <!-- Floating Direct WhatsApp & Phone Action Buttons (B2B Wholesale) -->
        <div class="flex items-center gap-2 pointer-events-auto">
          <!-- Direct WhatsApp Wholesale Button -->
          <a href="https://wa.me/919965160358?text=Hello%20STP%20Chickens%2C%20I%20am%20interested%20in%20commercial%20wholesale%20poultry%20supply." 
             target="_blank" 
             rel="noopener noreferrer" 
             title="Direct WhatsApp Wholesale Procurement (+91 99651 60358)"
             class="group flex items-center gap-2 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            <span class="material-symbols-outlined text-lg leading-none">chat</span>
            <span class="text-xs font-bold hidden sm:inline">WhatsApp</span>
          </a>

          <!-- Direct Phone Call Button -->
          <a href="tel:+919965160358" 
             title="Call Kannampalayam Dispatch Desk (+91 99651 60358)"
             class="group flex items-center gap-2 px-3.5 py-2.5 bg-forest-green hover:bg-deep-green text-white rounded-full shadow-lg border border-warm-gold/40 transition-all duration-300 hover:scale-105">
            <span class="material-symbols-outlined text-lg leading-none">call</span>
            <span class="text-xs font-bold hidden sm:inline">Call Desk</span>
          </a>
        </div>
        <!-- Floating Trigger Button -->
        <button id="stp-assistant-trigger" 
                class="pointer-events-auto group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-deep-green to-forest-green hover:from-forest-green hover:to-natural-green text-white rounded-full shadow-2xl border-2 border-warm-gold/60 hover:border-warm-gold transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none">
          <div class="relative w-7 h-7 flex items-center justify-center bg-warm-gold rounded-full text-deep-green font-bold text-sm shadow-inner">
            <span class="material-symbols-outlined text-lg">mic</span>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
          <div class="text-left hidden sm:block">
            <div class="text-[10px] uppercase tracking-widest text-warm-gold font-bold">Bilingual AI</div>
            <div class="text-xs font-bold font-headline leading-tight">STP Smart Assistant</div>
          </div>
        </button>

        <!-- Main Chat & Voice Panel -->
        <div id="stp-assistant-panel" 
             class="pointer-events-auto hidden fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-light-outline-variant flex flex-col overflow-hidden transition-all duration-300 transform scale-95 opacity-0">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-deep-green via-forest-green to-natural-green text-white p-4 flex items-center justify-between border-b border-warm-gold/30">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-warm-gold text-deep-green flex items-center justify-center font-bold text-sm shadow">
                STP
              </div>
              <div>
                <h3 class="font-bold text-sm font-headline tracking-wide flex items-center gap-1.5">
                  <span>STP Smart Assistant</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-warm-gold uppercase tracking-wider font-semibold">AI Voice</span>
                </h3>
                <p class="text-[11px] text-white/80">Tamil • Tanglish • English Wholesale Support</p>
              </div>
            </div>

            <div class="flex items-center gap-1">
              <!-- Mute / Unmute TTS Toggle -->
              <button id="stp-mute-toggle" title="Toggle Spoken Responses" class="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
                <span id="stp-mute-icon" class="material-symbols-outlined text-lg">volume_up</span>
              </button>
              <!-- Close Panel -->
              <button id="stp-close-panel" title="Close Assistant" class="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <!-- Quick Notice Banner -->
          <div class="bg-amber-50 px-4 py-2 border-b border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-amber-600 text-sm">verified</span>
              <span>Official B2B Desk • 50 kg Minimum Order</span>
            </div>
            <a href="https://wa.me/919965160358?text=Hello%20STP%20Chickens%2C%20I%20am%20interested%20in%20wholesale%20poultry%20supply." 
               target="_blank" 
               rel="noopener noreferrer" 
               class="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:underline">
              <span>WhatsApp</span>
              <span class="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          </div>

          <!-- Message History Window -->
          <div id="stp-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3.5 bg-light-background/60">
            <!-- Welcome Bot Greeting -->
            <div class="flex items-start gap-2.5">
              <div class="w-7 h-7 rounded-full bg-forest-green text-warm-gold flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                TF
              </div>
              <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-light-outline-variant/80 shadow-sm max-w-[85%] text-xs text-charcoal leading-relaxed">
                <p class="font-semibold text-forest-green mb-1">வணக்கம்! Welcome to STP Chickens.</p>
                <p>I am your B2B Wholesale Assistant. Ask about daily broiler availability, <strong>50 kg minimum orders</strong>, <strong>04:00 AM–06:30 AM dawn dispatch</strong>, custom catering cuts, or register a commercial enquiry.</p>
                <div class="mt-2 text-[10px] text-light-outline">தமிழ் அல்லது ஆங்கிலத்தில் பேசலாம் / எழுதலாம்.</div>
              </div>
            </div>
          </div>

          <!-- Suggested Chips Container -->
          <div id="stp-chips-container" class="px-3 py-2 bg-white border-t border-light-outline-variant/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button class="stp-chip text-[11px] whitespace-nowrap px-3 py-1 bg-light-background hover:bg-forest-green hover:text-white border border-light-outline-variant/80 rounded-full text-charcoal transition-all">
              Minimum Order?
            </button>
            <button class="stp-chip text-[11px] whitespace-nowrap px-3 py-1 bg-light-background hover:bg-forest-green hover:text-white border border-light-outline-variant/80 rounded-full text-charcoal transition-all">
              டெலிவரி நேரம் என்ன?
            </button>
            <button class="stp-chip text-[11px] whitespace-nowrap px-3 py-1 bg-light-background hover:bg-forest-green hover:text-white border border-light-outline-variant/80 rounded-full text-charcoal transition-all">
              What cuts are available?
            </button>
            <button class="stp-chip text-[11px] whitespace-nowrap px-3 py-1 bg-light-background hover:bg-forest-green hover:text-white border border-light-outline-variant/80 rounded-full text-charcoal transition-all">
              Location &amp; Route
            </button>
          </div>

          <!-- Voice Recording Bar (Hidden by default) -->
          <div id="stp-voice-recording-bar" class="hidden p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between">
            <div class="flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <span class="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
              <span>Recording Voice... (Tamil / English / Tanglish)</span>
            </div>
            <div class="flex items-center gap-2">
              <button id="stp-cancel-voice" class="px-3 py-1 text-xs text-charcoal hover:underline">Cancel</button>
              <button id="stp-stop-voice" class="px-3 py-1 bg-rose-600 text-white rounded text-xs font-bold hover:bg-rose-700 shadow-sm">
                Stop &amp; Send
              </button>
            </div>
          </div>

          <!-- Input Footer -->
          <div class="p-3 bg-white border-t border-light-outline-variant flex items-center gap-2">
            <button id="stp-mic-btn" title="Speak (Tamil or English)" class="w-10 h-10 rounded-full bg-light-background hover:bg-forest-green hover:text-white text-forest-green border border-light-outline-variant flex items-center justify-center transition flex-shrink-0">
              <span class="material-symbols-outlined text-xl">mic</span>
            </button>

            <input type="text" 
                   id="stp-chat-input" 
                   placeholder="Type in Tamil, Tanglish or English..." 
                   class="flex-1 text-xs bg-light-background px-3.5 py-2.5 rounded-full border border-light-outline-variant focus:border-forest-green focus:bg-white focus:outline-none transition">

            <button id="stp-send-btn" class="w-10 h-10 rounded-full bg-forest-green hover:bg-deep-green text-white flex items-center justify-center transition flex-shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(root);
    }

    attachEvents() {
      const trigger = document.getElementById('stp-assistant-trigger');
      const closeBtn = document.getElementById('stp-close-panel');
      const sendBtn = document.getElementById('stp-send-btn');
      const input = document.getElementById('stp-chat-input');
      const micBtn = document.getElementById('stp-mic-btn');
      const muteBtn = document.getElementById('stp-mute-toggle');
      const chips = document.querySelectorAll('.stp-chip');

      if (trigger) trigger.addEventListener('click', () => this.togglePanel());
      if (closeBtn) closeBtn.addEventListener('click', () => this.closePanel());

      if (sendBtn) sendBtn.addEventListener('click', () => this.handleSend());
      if (input) {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.handleSend();
        });
      }

      if (micBtn) micBtn.addEventListener('click', () => this.handleVoiceClick());
      if (muteBtn) muteBtn.addEventListener('click', () => this.toggleMute());

      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const text = chip.textContent.trim();
          if (input) input.value = text;
          this.handleSend();
        });
      });
    }

    togglePanel() {
      if (this.isOpen) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      const panel = document.getElementById('stp-assistant-panel');
      if (!panel) return;
      panel.classList.remove('hidden');
      setTimeout(() => {
        panel.classList.remove('scale-95', 'opacity-0');
        panel.classList.add('scale-100', 'opacity-100');
      }, 10);
      this.isOpen = true;
      document.getElementById('stp-chat-input')?.focus();
    }

    closePanel() {
      const panel = document.getElementById('stp-assistant-panel');
      if (!panel) return;
      panel.classList.remove('scale-100', 'opacity-100');
      panel.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        panel.classList.add('hidden');
      }, 300);
      this.isOpen = false;
      this.stopVoiceRecording();
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      const icon = document.getElementById('stp-mute-icon');
      if (icon) {
        icon.textContent = this.isMuted ? 'volume_off' : 'volume_up';
      }
      if (this.isMuted && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        // Tamil and English speech recognition
        this.recognition.lang = 'ta-IN'; // Tamil with fallback
        
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const input = document.getElementById('stp-chat-input');
          if (input) {
            input.value = transcript;
            input.focus();
          }
          this.stopVoiceRecording();
          this.appendMessage('bot', 'Voice message recorded: "' + this.escapeHtml(transcript) + '". You can edit the transcript in the input box or press Send.');
        };

        this.recognition.onerror = (e) => {
          console.warn('[STP Speech] Browser recognition error:', e.error);
          this.stopVoiceRecording();
        };

        this.recognition.onend = () => {
          this.stopVoiceRecording();
        };
      }
    }

    handleVoiceClick() {
      if (this.isRecording) {
        this.stopVoiceRecording();
      } else {
        this.startVoiceRecording();
      }
    }

    startVoiceRecording() {
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
            if (durationEl) durationEl.textContent = `${mins}:${secs}`;
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
    }

    async handleSend() {
      const input = document.getElementById('stp-chat-input');
      if (!input) return;
      const text = input.value.trim();
      if (!text) return;

      input.value = '';

      // 1. Append User Message
      this.appendMessage('user', text);

      // 2. Show Typing Bubble
      const typingId = this.showTypingIndicator();

      try {
        const response = await fetch(`${this.apiBase}/assistant/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: this.history.slice(-8)
          })
        });

        const data = await response.json();
        this.removeTypingIndicator(typingId);

        if (data && data.success && data.data) {
          const reply = data.data.reply;
          this.appendMessage('bot', reply, data.data.suggestedChips);
          this.speakText(reply, data.data.language);

          // Update context
          this.history.push({ role: 'user', content: text });
          this.history.push({ role: 'assistant', content: reply });
        } else {
          this.appendMessage('bot', 'Could not reach assistant services. Please try again or use the Contact page.');
        }
      } catch (err) {
        this.removeTypingIndicator(typingId);
        this.appendMessage('bot', 'Network connection error. You can also call our Kannampalayam desk directly.');
      }
    }

    speakText(text, lang) {
      if (this.isMuted || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
        utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('TTS playback error:', e);
      }
    }

    appendMessage(sender, text, chips = []) {
      const container = document.getElementById('stp-chat-messages');
      if (!container) return;

      const bubble = document.createElement('div');
      bubble.className = `flex items-start gap-2.5 ${sender === 'user' ? 'justify-end' : ''}`;

      if (sender === 'user') {
        bubble.innerHTML = `
          <div class="bg-forest-green text-white p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] text-xs leading-relaxed">
            ${this.escapeHtml(text)}
          </div>
        `;
      } else {
        bubble.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-forest-green text-warm-gold flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            TF
          </div>
          <div class="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-light-outline-variant/80 shadow-sm max-w-[85%] text-xs text-charcoal leading-relaxed">
            <div>${this.formatMarkdown(text)}</div>
            ${chips && chips.length ? `
              <div class="mt-2.5 pt-2 border-t border-light-outline-variant/40 flex flex-wrap gap-1">
                ${chips.map(c => `<button class="stp-inline-chip text-[10px] px-2 py-0.5 bg-light-background hover:bg-forest-green hover:text-white rounded border border-light-outline-variant transition">${this.escapeHtml(c)}</button>`).join('')}
              </div>
            ` : ''}
          </div>
        `;

        // Attach events to newly rendered inline chips
        const newChips = bubble.querySelectorAll('.stp-inline-chip');
        newChips.forEach(nc => {
          nc.addEventListener('click', () => {
            const val = nc.textContent.trim();
            const input = document.getElementById('stp-chat-input');
            if (input) input.value = val;
            this.handleSend();
          });
        });
      }

      container.appendChild(bubble);
      container.scrollTop = container.scrollHeight;
    }

    showTypingIndicator() {
      const container = document.getElementById('stp-chat-messages');
      if (!container) return null;

      const id = 'typing-' + Date.now();
      const typingEl = document.createElement('div');
      typingEl.id = id;
      typingEl.className = 'flex items-center gap-2 text-light-outline text-xs italic p-2';
      typingEl.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-forest-green animate-bounce"></div>
        <div class="w-2 h-2 rounded-full bg-forest-green animate-bounce [animation-delay:0.2s]"></div>
        <div class="w-2 h-2 rounded-full bg-forest-green animate-bounce [animation-delay:0.4s]"></div>
        <span class="text-[11px] ml-1">STP Assistant is thinking...</span>
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
      return id;
    }

    removeTypingIndicator(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    formatMarkdown(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');
    }

    escapeHtml(str) {
      return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag));
    }
  }

  global.StpSmartAssistant = StpSmartAssistant;

  // Auto initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    new StpSmartAssistant();
  });
})(window);

