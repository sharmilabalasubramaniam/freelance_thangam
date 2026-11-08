const fs = require('fs');
let code = fs.readFileSync('admin-dashboard/AdminDashboard.html', 'utf8');

const target = `<input type="date" id="tableDateFilter" title="Filter by submission date" class="px-2 py-1 text-xs bg-white border border-light-outline-variant rounded-DEFAULT text-charcoal focus:border-forest-green focus:outline-none">`;

const replacement = `<input type="date" id="tableDateFilter" title="Filter by submission date" class="px-2 py-1 text-xs bg-white border border-light-outline-variant rounded-DEFAULT text-charcoal focus:border-forest-green focus:outline-none">
                <a id="exportCsvBtn" href="http://localhost:5000/api/admin/export-csv" download class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-green hover:bg-deep-green text-white rounded text-xs font-semibold shadow-xs transition-colors" title="Export Enquiries to CSV">
                  <span class="material-symbols-outlined text-sm">download</span>
                  <span>Export CSV</span>
                </a>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('admin-dashboard/AdminDashboard.html', code, 'utf8');
  console.log('Successfully injected Export CSV button into AdminDashboard.html');
} else {
  console.log('Target not found in AdminDashboard.html');
}

