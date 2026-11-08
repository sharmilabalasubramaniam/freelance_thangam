const fs = require('fs');

const files = [
  'homepage/Homepage.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'contact-enquiry/ContactEnquiry.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('RepeatOrder.html')) {
    // Look for ContactEnquiry.html link inside footer list
    const searchStr = 'AdminDashboard.html';
    const idx = content.indexOf(searchStr);
    if (idx !== -1) {
      // Find the start of the <li> containing AdminDashboard.html
      const liStart = content.lastIndexOf('<li', idx);
      const insertText = '  <li><a href="../repeat-order/RepeatOrder.html" class="hover:text-warm-gold transition-colors">Smart Repeat Order</a></li>\n          ';
      content = content.slice(0, liStart) + insertText + content.slice(liStart);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Successfully updated footer in:', file);
    }
  }
});

