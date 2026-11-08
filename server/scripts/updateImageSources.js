const fs = require('fs');

const replacements = [
  {
    find: 'data-stitch-original-src="7841a3a9968fe569===../../images/hero_fresh_poultry.jpg"',
    srcReplacement: '/images/hero_fresh_poultry.svg'
  },
  {
    find: 'data-stitch-original-src="75e26a941df9e1cf===../../images/facility_kannampalayam.jpg"',
    srcReplacement: '/images/facility_kannampalayam.svg'
  },
  {
    find: 'data-stitch-original-src="e8f899e149d0c979===../../images/product_whole_chicken.jpg"',
    srcReplacement: '/images/product_whole_chicken.svg'
  },
  {
    find: 'data-stitch-original-src="96569ef91b824858===../../images/product_skinless_chicken.jpg"',
    srcReplacement: '/images/product_skinless_chicken.svg'
  },
  {
    find: 'data-stitch-original-src="20a0ee27881ec487===../../images/product_chicken_cuts.jpg"',
    srcReplacement: '/images/product_chicken_cuts.svg'
  },
  {
    find: 'data-stitch-original-src="cb651a20c917a5c3===../../images/product_bulk_supply.jpg"',
    srcReplacement: '/images/product_bulk_supply.svg'
  },
  {
    find: 'data-stitch-original-src="14e5a0c9241981aa===../../images/quality_hygiene_process.jpg"',
    srcReplacement: '/images/quality_hygiene_process.svg'
  },
  {
    find: 'data-stitch-original-src="8de10ee2f6d2df27===../../images/about_poultry_facility.jpg"',
    srcReplacement: '/images/about_poultry_facility.svg'
  }
];

const targetFiles = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'contact-enquiry/ContactEnquiry.html',
  'homepage/Homepage.html'
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let count = 0;

  replacements.forEach(r => {
    // Regex to match <img ... src="..." ... r.find ...> or similar
    // Match the entire img tag that contains r.find
    const regex = new RegExp('<img[^>]+' + r.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^>]*>', 'g');
    content = content.replace(regex, (match) => {
      count++;
      // replace src="https://lh3..." with src="/images/..."
      return match.replace(/src="https:\/\/lh3\.googleusercontent\.com\/[^"]+"/i, `src="${r.srcReplacement}"`);
    });
  });

  if (count > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}: replaced ${count} broken image URLs.`);
  }
});

