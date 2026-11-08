const fs = require('fs');

const schemaJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WholesaleStore',
  'name': 'STP CHICKENS by Thangam Farms',
  'alternateName': ['STP Chickens', 'Thangam Farms 2.0'],
  'description': 'B2B Wholesale Fresh Chicken Supplier & Commercial Processing Facility in Kannampalayam, Coimbatore. Serving hotels, restaurants, caterers, and institutional buyers.',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': '152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam',
    'addressLocality': 'Coimbatore',
    'postalCode': '641103',
    'addressRegion': 'Tamil Nadu',
    'addressCountry': 'IN'
  },
  'geo': {
    '@type': 'GeoCoordinates',
    'latitude': 11.0050,
    'longitude': 77.1013
  },
  'telephone': '+919965160358',
  'url': 'https://thangamfarms.in',
  'openingHoursSpecification': [
    {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      'opens': '04:00',
      'closes': '18:00'
    }
  ],
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': 'Wholesale Poultry Supplies',
    'itemListElement': [
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Product',
          'name': 'Fresh Whole Dressed Chicken (1.6kg - 2.2kg)'
        }
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Product',
          'name': 'Skinless Dressed Chicken'
        }
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Product',
          'name': 'Specialized Commercial Chicken Cuts (Biryani Cut, Curry Cut, Boneless Breast)'
        }
      },
      {
        '@type': 'Offer',
        'itemOffered': {
          '@type': 'Product',
          'name': 'Bulk Poultry Supply Crates (50kg - 2000kg+)'
        }
      }
    ]
  }
}, null, 2);

let indexHtml = fs.readFileSync('index.html', 'utf8');

const oldTitle = '<title>Thangam Farms — Wholesale Fresh Chicken Supplier | STP Chickens</title>';
const newHeadTags = `<title>STP CHICKENS by Thangam Farms — Wholesale Fresh Chicken Supplier Coimbatore</title>
  <meta name="description" content="STP CHICKENS by Thangam Farms: B2B wholesale fresh chicken supply in Coimbatore. 50 kg min order, 04:00 AM–06:30 AM dawn dispatch, custom cuts, 2-hour callback.">
  <link rel="canonical" href="https://thangamfarms.in/">
  <!-- Open Graph / Social Meta -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="STP CHICKENS by Thangam Farms — Wholesale Fresh Chicken Supplier">
  <meta property="og:description" content="Wholesale fresh dressed chicken supply for commercial kitchens, hotels, caterers, and restaurants across Coimbatore. 50 kg min order, dawn cold-chain fleet.">
  <meta property="og:image" content="https://thangamfarms.in/images/hero_fresh_poultry.jpg">
  <meta property="og:url" content="https://thangamfarms.in/">
  <!-- Verified LocalBusiness Schema -->
  <script type="application/ld+json">
${schemaJson}
  </script>`;

if (indexHtml.includes(oldTitle)) {
  indexHtml = indexHtml.replace(oldTitle, newHeadTags);
  fs.writeFileSync('index.html', indexHtml, 'utf8');
  console.log('Successfully injected SEO, Open Graph & LocalBusiness Schema into index.html');
} else {
  console.log('Could not find old title in index.html');
}

