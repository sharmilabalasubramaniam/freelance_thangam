const fs = require('fs');

const updates = [
  {
    targetSrc: '/images/hero_fresh_poultry.svg',
    newSrc: '/images/hero_fresh_poultry.jpg'
  },
  {
    targetSrc: '/images/product_whole_chicken.svg',
    newSrc: '/images/product_whole_chicken.jpg'
  },
  {
    targetSrc: '/images/product_skinless_chicken.svg',
    newSrc: '/images/product_skinless_chicken.jpg'
  },
  {
    targetSrc: '/images/product_chicken_cuts.svg',
    newSrc: '/images/product_chicken_cuts.jpg'
  },
  {
    targetSrc: '/images/product_bulk_supply.svg',
    newSrc: '/images/product_bulk_supply.jpg'
  },
  {
    targetSrc: '/images/facility_kannampalayam.svg',
    newSrc: '/images/facility_kannampalayam.jpg'
  },
  {
    targetSrc: '/images/about_poultry_facility.svg',
    newSrc: '/images/about_poultry_facility.jpg'
  },
  {
    targetSrc: '/images/quality_hygiene_process.svg',
    newSrc: '/images/quality_hygiene_process.jpg'
  }
];

const files = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html',
  'homepage/Homepage.html'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  let count = 0;
  updates.forEach(u => {
    while (content.includes(u.targetSrc)) {
      content = content.replace(u.targetSrc, u.newSrc);
      count++;
    }
  });
  if (count > 0) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated ${f}: switched ${count} images to high-res JPG.`);
  }
});

