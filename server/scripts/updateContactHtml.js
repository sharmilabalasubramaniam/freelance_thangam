const fs = require('fs');

let content = fs.readFileSync('contact-enquiry/ContactEnquiry.html', 'utf8');

const target = `<span class="font-bold text-charcoal block">Commercial Procurement Desk</span>\r
                    <span class="text-light-outline">Official B2B Phone Lines (Trade Enquiries)</span>\r
                  </div>\r
                </div>\r
\r
                <div class="flex items-start gap-3 p-3 bg-light-background rounded-DEFAULT border border-light-outline-variant">\r
                  <span class="material-symbols-outlined text-forest-green text-xl flex-shrink-0">mail</span>\r
                  <div>\r
                    <span class="font-bold text-charcoal block">Commercial Inquiries Desk</span>\r
                    <span class="text-light-outline">Official Wholesale Correspondence</span>`;

const replacement = `<span class="font-bold text-charcoal block">Commercial Procurement Desk</span>\r
                    <span class="text-light-on-surface-variant text-[11px] block mb-1">Direct Wholesale &amp; Daily Logistics Coordination</span>\r
                    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-forest-green text-[10px] font-semibold border border-emerald-200">\r
                      <span class="w-1.5 h-1.5 rounded-full bg-forest-green animate-pulse"></span>\r
                      <span>Trade Inquiries: Priority Dispatch Callback</span>\r
                    </div>\r
                  </div>\r
                </div>\r
\r
                <div class="flex items-start gap-3 p-3 bg-light-background rounded-DEFAULT border border-light-outline-variant">\r
                  <span class="material-symbols-outlined text-forest-green text-xl flex-shrink-0">mail</span>\r
                  <div>\r
                    <span class="font-bold text-charcoal block">Commercial Inquiries Desk</span>\r
                    <span class="text-light-on-surface-variant text-[11px] block mb-1">Official Institutional Contracts &amp; Billing</span>\r
                    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">\r
                      <span>Enquiries Reviewed Within 2 Hours</span>\r
                    </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('contact-enquiry/ContactEnquiry.html', content, 'utf8');
  console.log('Successfully updated contact-enquiry/ContactEnquiry.html desk info.');
} else {
  // Try with LF line endings just in case
  const targetLF = target.replace(/\r\n/g, '\n');
  const replacementLF = replacement.replace(/\r\n/g, '\n');
  if (content.includes(targetLF)) {
    content = content.replace(targetLF, replacementLF);
    fs.writeFileSync('contact-enquiry/ContactEnquiry.html', content, 'utf8');
    console.log('Successfully updated contact-enquiry/ContactEnquiry.html (LF).');
  } else {
    console.log('Target not found!');
  }
}

