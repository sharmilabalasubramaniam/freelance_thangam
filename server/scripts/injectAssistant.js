const fs = require('fs');

const pages = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'contact-enquiry/ContactEnquiry.html'
];

pages.forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  if (!c.includes('/client/src/components/stpAssistant.js')) {
    c = c.replace('</body>', '  <script src="/client/src/components/stpAssistant.js"></script>\n</body>');
    fs.writeFileSync(p, c, 'utf8');
    console.log('Injected STP Assistant into:', p);
  } else {
    console.log('Already present in:', p);
  }
});

