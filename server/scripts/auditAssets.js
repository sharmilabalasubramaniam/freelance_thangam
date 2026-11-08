const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'contact-enquiry/ContactEnquiry.html',
  'admin-dashboard/AdminDashboard.html',
  'homepage/Homepage.html',
  'repeat-order/RepeatOrder.html'
];

let totalIssues = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // Match only actual src="..." and href="..." (exclude data-stitch-original-src)
  const matches = [...content.matchAll(/(?:(?<!data-stitch-original-)src|href)=["']([^"'#?]+)["']/g)];
  matches.forEach(m => {
    const target = m[1];
    if (
      target.startsWith('http') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:') ||
      target.startsWith('javascript:') ||
      target.startsWith('data:')
    ) {
      return;
    }

    let resolved;
    if (target.startsWith('/')) {
      resolved = path.join('.', target);
    } else {
      resolved = path.join(dir, target);
    }

    if (!fs.existsSync(resolved)) {
      console.log(`[REAL BROKEN] in ${file} -> "${target}" (Resolved: ${resolved})`);
      totalIssues++;
    }
  });
});

console.log(`Audit complete. Real broken internal links/scripts/stylesheets: ${totalIssues}`);
