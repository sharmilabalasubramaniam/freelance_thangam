const fs = require('fs');
let code = fs.readFileSync('client/src/components/stpAssistant.js', 'utf8');

const oldDOM = `    createWidgetDOM() {
      if (document.getElementById('stp-assistant-root')) return;

      const root = document.createElement('div');
      root.id = 'stp-assistant-root';
      root.className = 'fixed bottom-6 right-6 z-[9999] font-sans antialiased';`;

const newDOM = `    createWidgetDOM() {
      if (document.getElementById('stp-assistant-root')) return;

      const root = document.createElement('div');
      root.id = 'stp-assistant-root';
      root.className = 'fixed bottom-6 right-6 z-[9999] font-sans antialiased flex flex-col items-end gap-3 pointer-events-none';`;

if (code.includes(oldDOM)) {
  code = code.replace(oldDOM, newDOM);
  // Add direct buttons above assistant trigger
  code = code.replace('root.innerHTML = `', `root.innerHTML = \`
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
        </div>`);

  // Make trigger and panel pointer-events-auto
  code = code.replace('<button id="stp-assistant-trigger" \n                class="group relative', '<button id="stp-assistant-trigger" \n                class="pointer-events-auto group relative');
  code = code.replace('<div id="stp-assistant-panel" \n             class="hidden fixed bottom-20', '<div id="stp-assistant-panel" \n             class="pointer-events-auto hidden fixed bottom-24');

  fs.writeFileSync('client/src/components/stpAssistant.js', code, 'utf8');
  console.log('Successfully updated stpAssistant.js with WhatsApp & Call floating buttons!');
} else {
  console.log('Target oldDOM not found');
}

