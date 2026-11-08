const fs = require('fs');
let code = fs.readFileSync('admin-dashboard/dashboard.js', 'utf8');

// Find renderDetail function and attach phone actions
const targetCode = `    if (detailPhone) detailPhone.textContent = \`+91 \${item.phone}\`;`;
const newCode = `    if (detailPhone) detailPhone.textContent = \`+91 \${item.phone}\`;

    const actionBox = document.getElementById('customerActionButtons');
    const callLink = document.getElementById('detailCallLink');
    const waLink = document.getElementById('detailWaLink');
    if (actionBox && callLink && waLink) {
      const cleanPhone = String(item.phone).replace(/\\D/g, '').slice(-10);
      callLink.href = \`tel:+91\${cleanPhone}\`;
      waLink.href = \`https://wa.me/91\${cleanPhone}?text=\${encodeURIComponent('Hello ' + (item.fullName || 'Sir') + ', this is STP Chickens Kannampalayam dispatch desk regarding your wholesale enquiry #' + item.id + '.')}\`;
      actionBox.classList.remove('hidden');
    }`;

const targetEmpty = `    if (detailPhone) detailPhone.textContent = '—';`;
const newEmpty = `    if (detailPhone) detailPhone.textContent = '—';
    const actionBox = document.getElementById('customerActionButtons');
    if (actionBox) actionBox.classList.add('hidden');`;

if (code.includes(targetCode)) {
  code = code.replace(targetCode, newCode);
  code = code.replace(targetEmpty, newEmpty);
  fs.writeFileSync('admin-dashboard/dashboard.js', code, 'utf8');
  console.log('Successfully updated dashboard.js to populate customer Call and WhatsApp links!');
} else {
  console.log('Target code not found in dashboard.js');
}

