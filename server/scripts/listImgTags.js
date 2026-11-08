const fs = require('fs');

const files = [
  'index.html',
  'about-us/AboutUs.html',
  'products/Products.html',
  'quality-hygiene/QualityHygiene.html'
];

const map = {};

files.forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const imgMatches = c.match(/<img\s+[^>]+>/gi) || [];
  imgMatches.forEach(tag => {
    const srcM = tag.match(/src="([^"]+)"/i);
    const stitchM = tag.match(/data-stitch-original-src="([^"]+)"/i);
    const altM = tag.match(/alt="([^"]+)"/i);
    if (stitchM) {
      const orig = stitchM[1].includes('===') ? stitchM[1].split('===')[1] : stitchM[1];
      map[orig] = {
        alt: altM ? altM[1] : '',
        file: f,
        tag: tag
      };
    }
  });
});

console.log(JSON.stringify(map, null, 2));

