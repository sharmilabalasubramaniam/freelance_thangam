const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldHeroRegex = /<!-- SECTION 1: HERO \(SPLIT LAYOUT\) -->[\s\S]*?<!-- SECTION 2: ABOUT THANGAM FARMS/;

const newCinematicHero = `<!-- SECTION 1: CINEMATIC HERO SECTION (KS BROILERS INSPIRED) -->
    <section class="relative min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-charcoal text-white">
      <!-- Full-bleed Background Visual with Parallax & Subtle Zoom -->
      <div class="absolute inset-0 z-0">
        <img src="/images/hero_fresh_poultry.jpg" 
             alt="Fresh wholesale dressed broiler poultry - STP Chickens" 
             class="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out filter brightness-[0.45] contrast-[1.1]">
        <!-- Multi-layer Gradient Overlays for High Contrast Text Readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-deep-green/90 via-deep-green/75 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-black/40"></div>
      </div>

      <!-- Hero Content Container -->
      <div class="relative z-10 max-w-[1400px] w-full mx-auto px-6 py-20 lg:py-28">
        <div class="max-w-3xl">
          <!-- Premium Gold Pill Badge -->
          <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-warm-gold/40 text-warm-gold text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
            <span class="w-2 h-2 rounded-full bg-warm-gold animate-pulse"></span>
            <span>STP CHICKENS • B2B COMMERCIAL WHOLESALE</span>
          </div>

          <!-- Bold Cinematic Headlines -->
          <h1 class="text-4xl sm:text-6xl lg:text-[68px] font-bold font-headline tracking-tight leading-[1.08] mb-6 text-white drop-shadow-md">
            Fresh Chicken. <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-yellow-200">Trusted Wholesale Supply.</span>
          </h1>

          <!-- Crisp Supporting Copy -->
          <p class="text-base sm:text-xl text-white/90 font-light leading-relaxed mb-10 max-w-2xl drop-shadow">
            Quality poultry supply for businesses across Coimbatore. Sourced with bio-security, precision-dressed, and dispatched daily via dawn cold-chain fleet straight to commercial kitchens, caterers, and food service partners.
          </p>

          <!-- Core Call to Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-14">
            <a href="products/Products.html" 
               class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-warm-gold hover:bg-yellow-400 text-charcoal font-bold text-sm uppercase tracking-wider rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 min-h-[52px]">
              <span class="material-symbols-outlined text-lg">shopping_basket</span>
              <span>Explore Products</span>
            </a>

            <a href="contact-enquiry/ContactEnquiry.html" 
               class="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm uppercase tracking-wider rounded-lg border border-white/30 backdrop-blur-md transition-all duration-300 min-h-[52px]">
              <span class="material-symbols-outlined text-lg">send</span>
              <span>Send an Enquiry</span>
            </a>
          </div>

          <!-- Owner-Confirmed Key Operational Metrics Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/15 text-xs text-white/80">
            <div>
              <div class="font-bold text-warm-gold text-lg font-headline">50 KG</div>
              <div class="text-[11px] text-white/70 uppercase tracking-wide">Min. Wholesale Order</div>
            </div>
            <div>
              <div class="font-bold text-warm-gold text-lg font-headline">04:00 AM</div>
              <div class="text-[11px] text-white/70 uppercase tracking-wide">Dawn Dispatch Window</div>
            </div>
            <div>
              <div class="font-bold text-warm-gold text-lg font-headline">2 HOURS</div>
              <div class="text-[11px] text-white/70 uppercase tracking-wide">Trade Callback SLA</div>
            </div>
            <div>
              <div class="font-bold text-warm-gold text-lg font-headline">100% FRESH</div>
              <div class="text-[11px] text-white/70 uppercase tracking-wide">Moisture Retained</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subtle Animated Scroll Indicator -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none opacity-75">
        <span class="text-[10px] uppercase tracking-widest text-white/60 font-semibold">Scroll to Explore</span>
        <div class="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
          <div class="w-1 h-2 rounded-full bg-warm-gold animate-bounce"></div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: ABOUT THANGAM FARMS`;

if (oldHeroRegex.test(html)) {
  html = html.replace(oldHeroRegex, newCinematicHero);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully upgraded index.html with cinematic hero!');
} else {
  console.log('Old hero section pattern not matched.');
}

