const fs = require('fs');
const path = require('path');

function createSVGPlaceholder({
  width = 800,
  height = 600,
  badgeText = 'B2B WHOLESALE SPECIFICATION',
  title = 'Poultry Product',
  subtitle = 'Thangam Farms • STP Chickens',
  desc = 'Daily Cold-Chain Dispatch from Kannampalayam, Coimbatore',
  icon = 'chicken',
  gradientFrom = '#174B35',
  gradientTo = '#123B2B',
  accent = '#C5A35B'
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientFrom}" />
      <stop offset="100%" stop-color="${gradientTo}" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A35B" />
      <stop offset="100%" stop-color="#E5C77F" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Subtle aesthetic glow rings -->
  <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${width * 0.25}" fill="rgba(197, 163, 91, 0.06)" />
  <circle cx="${width * 0.2}" cy="${height * 0.8}" r="${width * 0.3}" fill="rgba(57, 118, 83, 0.15)" />

  <!-- Center Graphic Card Frame -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="16" fill="rgba(255, 255, 255, 0.03)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />

  <!-- Brand Badge Top Left -->
  <g transform="translate(64, 68)">
    <rect width="260" height="30" rx="15" fill="rgba(197, 163, 91, 0.15)" stroke="url(#goldGrad)" stroke-width="1" />
    <text x="130" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#E5C77F" letter-spacing="1.5" text-anchor="middle">${badgeText}</text>
  </g>

  <!-- Center Icon Representation -->
  <g transform="translate(${width / 2}, ${height * 0.38})">
    <circle r="46" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
    ${
      icon === 'facility'
        ? `<path d="M-22 18 L-22 -8 L-8 -18 L6 -8 L6 18 Z M-8 -18 L-8 18 M-22 6 L6 6 M10 -4 L24 -14 L24 18 L10 18 Z" fill="none" stroke="#E5C77F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
        : icon === 'hygiene'
        ? `<path d="M0 -22 L18 -14 L18 4 C18 16 0 24 0 24 C0 24 -18 16 -18 4 L-18 -14 Z M-6 2 L-1 7 L8 -3" fill="none" stroke="#E5C77F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
        : icon === 'crate'
        ? `<path d="M-20 -12 L20 -12 L24 16 L-24 16 Z M-20 -12 L0 -20 L20 -12 M-24 0 L24 0 M-8 0 L-8 16 M8 0 L8 16" fill="none" stroke="#E5C77F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
        : icon === 'cuts'
        ? `<path d="M-16 -14 C-10 -22 10 -22 16 -14 C22 -6 20 10 12 16 L0 22 L-12 16 C-20 10 -22 -6 -16 -14 Z M-6 -4 L6 6 M6 -4 L-6 6" fill="none" stroke="#E5C77F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
        : `<path d="M-12 12 C-20 6 -20 -10 -8 -16 C0 -20 12 -18 18 -10 C22 -4 20 10 10 16 Z M-4 -12 C-4 -12 2 -14 6 -10 M-8 2 Q0 8 8 2" fill="none" stroke="#E5C77F" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`
    }
  </g>

  <!-- Typography Content -->
  <text x="${width / 2}" y="${height * 0.58}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${title}</text>
  <text x="${width / 2}" y="${height * 0.65}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="600" fill="#E5C77F" text-anchor="middle" letter-spacing="1.2">${subtitle.toUpperCase()}</text>
  <text x="${width / 2}" y="${height * 0.73}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="400" fill="#CBD5E1" text-anchor="middle">${desc}</text>

  <!-- Quality Assurance Seal Bottom Center -->
  <g transform="translate(${width / 2}, ${height - 75})">
    <rect x="-180" y="-14" width="360" height="28" rx="14" fill="rgba(0, 0, 0, 0.25)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
    <circle cx="-160" cy="0" r="4" fill="#34D399" />
    <text x="-148" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="#F1F5F9">Food-Grade Chilled Dispatch • 0°C – 4°C Maintained</text>
  </g>
</svg>`;
}

const imagesToCreate = [
  {
    filename: 'hero_fresh_poultry.svg',
    width: 900,
    height: 675,
    badgeText: 'FARM-DIRECT WHOLESALE DISPATCH',
    title: 'Fresh Commercial Broiler Supply',
    subtitle: 'Thangam Farms • STP Chickens',
    desc: 'Hygienically Dressed • 100% Antibiotic Safe • Daily Coimbatore Delivery',
    icon: 'chicken'
  },
  {
    filename: 'facility_kannampalayam.svg',
    width: 900,
    height: 600,
    badgeText: 'CENTRAL PROCESSING & LOGISTICS HUB',
    title: 'Kannampalayam Processing Facility',
    subtitle: '152 Trichy Road, Coimbatore - 641103',
    desc: 'Daily Bio-Secure Dressed Poultry Operations & Fleet Loading',
    icon: 'facility'
  },
  {
    filename: 'about_poultry_facility.svg',
    width: 900,
    height: 560,
    badgeText: 'FOOD-GRADE INFRASTRUCTURE',
    title: 'Modern Cold-Chain Standards',
    subtitle: 'Built for High-Volume B2B Requirements',
    desc: 'Stainless Steel Processing Units • Controlled Chilled Staging Area',
    icon: 'facility'
  },
  {
    filename: 'product_whole_chicken.svg',
    width: 800,
    height: 600,
    badgeText: 'PREMIUM COMMERCIAL BROILER',
    title: 'Fresh Whole Chicken',
    subtitle: 'Skin-On & Freshly Dressed',
    desc: 'Weight: 1.6 kg – 2.2 kg • Moisture Retained • 0°C – 4°C Freshness',
    icon: 'chicken'
  },
  {
    filename: 'product_skinless_chicken.svg',
    width: 800,
    height: 600,
    badgeText: 'COMMERCIAL KITCHEN GRADE',
    title: 'Fresh Skinless Chicken',
    subtitle: 'Ready-to-Cook Precision Cuts',
    desc: 'Consistent Dressed Broiler • Minimal Trimming Waste • Top Quality',
    icon: 'chicken'
  },
  {
    filename: 'product_chicken_cuts.svg',
    width: 800,
    height: 600,
    badgeText: 'HOTEL & CATERING CUSTOM CUTS',
    title: 'Specialized Chicken Cuts',
    subtitle: 'Curry Cut, Biryani Cut, Breast & Drumsticks',
    desc: 'Uniform Portioning • Standardized Weights for Foodservice Consistency',
    icon: 'cuts'
  },
  {
    filename: 'product_bulk_supply.svg',
    width: 800,
    height: 600,
    badgeText: 'WHOLESALE CRATE SUPPLY',
    title: 'Bulk Institutional Supply',
    subtitle: 'High-Volume Commercial Logistics',
    desc: 'Food-Grade Crates • 50 kg to 2000+ kg Daily Orders • Fleet Delivery',
    icon: 'crate'
  },
  {
    filename: 'quality_hygiene_process.svg',
    width: 900,
    height: 675,
    badgeText: 'STRICT HYGIENE ASSURANCE',
    title: 'Quality & Hygiene Inspection Protocol',
    subtitle: 'Daily Pre-Dispatch Veterinary & Bio-Security Audit',
    desc: 'Multi-Stage Temperature Checks • Sanitized Handling Area',
    icon: 'hygiene'
  }
];

imagesToCreate.forEach(item => {
  const filePath = path.join('images', item.filename);
  const svg = createSVGPlaceholder(item);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated: ${filePath}`);
});

