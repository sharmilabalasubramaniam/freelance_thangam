const fs = require('fs');

const pages = [
  {
    path: 'about-us/AboutUs.html',
    oldTitle: '<title>About Us — Thangam Farms | Wholesale Poultry Supply Operations</title>',
    newHead: `<title>About Us — STP CHICKENS by Thangam Farms | Wholesale Poultry Operations</title>
  <meta name="description" content="Learn about STP CHICKENS by Thangam Farms: Commercial wholesale fresh poultry processing and dawn cold-chain supply operations in Kannampalayam, Coimbatore.">
  <link rel="canonical" href="https://thangamfarms.in/about-us/AboutUs.html">
  <meta property="og:title" content="About Us — STP CHICKENS by Thangam Farms">
  <meta property="og:description" content="Commercial poultry wholesale operations in Kannampalayam, Coimbatore. Daily dawn cold-chain supply for hotels, caterers, and food service partners.">
  <meta property="og:url" content="https://thangamfarms.in/about-us/AboutUs.html">`
  },
  {
    path: 'products/Products.html',
    oldTitle: '<title>Product Catalogue — Thangam Farms | Wholesale Poultry Supply</title>',
    newHead: `<title>Products & Specifications — STP CHICKENS by Thangam Farms | Coimbatore</title>
  <meta name="description" content="Wholesale fresh poultry products: Whole fresh chicken (1.6kg-2.2kg), skinless chicken, custom biryani and curry cuts, and bulk food-grade crates (50kg+).">
  <link rel="canonical" href="https://thangamfarms.in/products/Products.html">
  <meta property="og:title" content="Products & Specifications — STP CHICKENS by Thangam Farms">
  <meta property="og:description" content="Wholesale fresh chicken product specifications: whole dressed chicken, skinless, curry/biryani cuts, and bulk supply crates.">
  <meta property="og:url" content="https://thangamfarms.in/products/Products.html">`
  },
  {
    path: 'quality-hygiene/QualityHygiene.html',
    oldTitle: '<title>Quality &amp; Hygiene — Thangam Farms | STP Chickens Wholesale</title>',
    newHead: `<title>Quality & Hygiene Standards — STP CHICKENS by Thangam Farms</title>
  <meta name="description" content="Quality assurance and hygiene protocols at STP CHICKENS: Temperature-controlled dressing, stainless-steel workstations, bio-security, and dawn cold-chain fleet dispatch.">
  <link rel="canonical" href="https://thangamfarms.in/quality-hygiene/QualityHygiene.html">
  <meta property="og:title" content="Quality & Hygiene Standards — STP CHICKENS by Thangam Farms">
  <meta property="og:description" content="Documented commercial handling standards, temperature control, and bio-secure poultry dispatch from Kannampalayam.">
  <meta property="og:url" content="https://thangamfarms.in/quality-hygiene/QualityHygiene.html">`
  },
  {
    path: 'contact-enquiry/ContactEnquiry.html',
    oldTitle: '<title>Commercial Enquiry — Thangam Farms | STP Chickens</title>',
    newHead: `<title>Commercial Enquiry & Contact — STP CHICKENS by Thangam Farms</title>
  <meta name="description" content="Submit a B2B wholesale enquiry to STP CHICKENS by Thangam Farms. 50 kg minimum order, 04:00 AM-06:30 AM dawn dispatch, 2-hour callback commitment.">
  <link rel="canonical" href="https://thangamfarms.in/contact-enquiry/ContactEnquiry.html">
  <meta property="og:title" content="Commercial Enquiry & Contact — STP CHICKENS by Thangam Farms">
  <meta property="og:description" content="Direct commercial procurement desk at Kannampalayam, Coimbatore. Get today's wholesale rate and schedule daily hotel/restaurant deliveries.">
  <meta property="og:url" content="https://thangamfarms.in/contact-enquiry/ContactEnquiry.html">`
  }
];

for (const p of pages) {
  if (!fs.existsSync(p.path)) {
    console.warn(`File not found: ${p.path}`);
    continue;
  }
  let content = fs.readFileSync(p.path, 'utf8');
  if (content.includes(p.oldTitle)) {
    content = content.replace(p.oldTitle, p.newHead);
    fs.writeFileSync(p.path, content, 'utf8');
    console.log(`Updated SEO metadata in ${p.path}`);
  } else {
    console.log(`Title tag already updated or format mismatch in ${p.path}`);
  }
}

