const fs = require('fs');

let html = fs.readFileSync('contact-enquiry/ContactEnquiry.html', 'utf8');

// 1. Add Leaflet CSS in head
if (!html.includes('leaflet@1.9.4/dist/leaflet.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />\n</head>');
}

// 2. Add Live Navigation Section before footer
const footerTag = '<!-- PROFESSIONAL FOOTER -->';
const mapSection = `<!-- SECTION: LIVE CUSTOMER LOCATION & ROUTE NAVIGATION -->
    <section id="contact-route-navigation" class="py-16 border-t border-light-outline-variant bg-light-background">
      <div class="max-w-[1400px] mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-10">
          <span class="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-forest-green/10 text-forest-green border border-forest-green/20 rounded-full inline-block mb-3">
            Facility Direct Access &amp; Logistics
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal font-headline">
            Find Your Route to Thangam Farms
          </h2>
          <p class="text-light-on-surface-variant text-sm sm:text-base leading-relaxed mt-2">
            Planning a bulk procurement visit or coordinating morning transport? 152, Trichy Road, Kannampalayam, Coimbatore is conveniently accessible directly along the NH 81 artery.
          </p>
        </div>

        <!-- Interactive Map Container -->
        <div id="contact-route-map-container" class="max-w-5xl mx-auto"></div>
      </div>
    </section>

    `;

if (!html.includes('id="contact-route-map-container"')) {
  html = html.replace(footerTag, mapSection + footerTag);
}

// 3. Add Leaflet JS and routeMap.js script before </body>
const scriptIncludes = `  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script src="/client/src/components/routeMap.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      if (window.ThangamRouteMap) {
        new window.ThangamRouteMap('contact-route-map-container');
      }
    });
  </script>
</body>`;

if (!html.includes('/client/src/components/routeMap.js')) {
  html = html.replace('</body>', scriptIncludes);
}

fs.writeFileSync('contact-enquiry/ContactEnquiry.html', html, 'utf8');
console.log('Successfully injected Live Route Navigation into contact-enquiry/ContactEnquiry.html');

