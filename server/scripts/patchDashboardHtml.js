const fs = require('fs');
let code = fs.readFileSync('admin-dashboard/AdminDashboard.html', 'utf8');

const target = '<span id="detailPhone" class="font-semibold text-charcoal font-mono">';
const replacement = `<span id="detailPhone" class="font-semibold text-charcoal font-mono">`;

const oldBlock = `<span id="detailPhone" class="font-semibold text-charcoal font-mono">—</span>`;
const newBlock = `<span id="detailPhone" class="font-semibold text-charcoal font-mono">—</span>
                  <div id="customerActionButtons" class="hidden flex items-center gap-1.5 mt-2">
                    <a id="detailCallLink" href="#" class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-forest-green hover:bg-forest-green hover:text-white rounded text-[11px] font-semibold border border-forest-green/20 transition-colors">
                      <span class="material-symbols-outlined text-xs">call</span>
                      <span>Call</span>
                    </a>
                    <a id="detailWaLink" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366] hover:text-white rounded text-[11px] font-semibold border border-emerald-300 transition-colors">
                      <span class="material-symbols-outlined text-xs">chat</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('admin-dashboard/AdminDashboard.html', code, 'utf8');
  console.log('Successfully added Call & WhatsApp buttons into AdminDashboard.html');
} else {
  // Try finding by indexOf
  const idx = code.indexOf('id="detailPhone"');
  if (idx !== -1) {
    const endSpan = code.indexOf('</span>', idx);
    const fullSpan = code.slice(idx - 9, endSpan + 7);
    code = code.replace(fullSpan, fullSpan + `
                  <div id="customerActionButtons" class="hidden flex items-center gap-1.5 mt-2">
                    <a id="detailCallLink" href="#" class="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-forest-green hover:bg-forest-green hover:text-white rounded text-[11px] font-semibold border border-forest-green/20 transition-colors">
                      <span class="material-symbols-outlined text-xs">call</span>
                      <span>Call</span>
                    </a>
                    <a id="detailWaLink" href="#" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/10 text-emerald-800 hover:bg-[#25D366] hover:text-white rounded text-[11px] font-semibold border border-emerald-300 transition-colors">
                      <span class="material-symbols-outlined text-xs">chat</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>`);
    fs.writeFileSync('admin-dashboard/AdminDashboard.html', code, 'utf8');
    console.log('Successfully injected Call & WhatsApp buttons via substring index');
  } else {
    console.log('Could not locate detailPhone in AdminDashboard.html');
  }
}

