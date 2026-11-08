const fs = require('fs');

const files = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'contact-enquiry/ContactEnquiry.html',
  'admin-dashboard/AdminDashboard.html'
];

async function checkAllImages() {
  const allImages = new Set();
  
  files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let match;
    console.log(`\n=== File: ${f} ===`);
    while ((match = regex.exec(c)) !== null) {
      const src = match[1];
      allImages.add(src);
      console.log(`Tag src: ${src.slice(0, 90)}...`);
    }
  });

  console.log(`\nTesting HTTP responses for ${allImages.size} unique image URLs...`);
  for (const url of allImages) {
    if (url.startsWith('http')) {
      try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log(`[${res.status}] ${url.slice(0, 90)}...`);
      } catch (err) {
        console.log(`[FAILED: ${err.message}] ${url.slice(0, 90)}...`);
      }
    } else {
      console.log(`[LOCAL] ${url}`);
    }
  }
}

checkAllImages();

