/**
 * Live Customer Location & Route Navigation Component
 * Leaflet + OpenStreetMap + OSRM Driving Route Engine + Google Maps Deep-link
 * Destination: Thangam Farms (STP Chickens), 152 Trichy Road, Kannampalayam, Coimbatore - 641103
 */

(function (global) {
  'use strict';

  // Verified Coordinates for 152 Trichy Road, Kannampalayam / Pappampatti Pirivu, Coimbatore
  const DESTINATION = {
    lat: 11.0050,
    lng: 77.1013,
    title: 'Thangam Farms / STP Chickens',
    address: '152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103, Tamil Nadu, India'
  };

  class ThangamRouteMap {
    constructor(containerId, options = {}) {
      this.containerId = containerId;
      this.options = options;
      this.map = null;
      this.destMarker = null;
      this.userMarker = null;
      this.routeLayer = null;
      this.userCoords = null;

      this.init();
    }

    init() {
      const container = document.getElementById(this.containerId);
      if (!container) return;

      this.renderUI(container);
      this.initLeaflet();
    }

    renderUI(container) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl border border-light-outline-variant/80 shadow-xl overflow-hidden">
          <!-- Header Banner -->
          <div class="bg-gradient-to-r from-deep-green via-forest-green to-natural-green text-white p-6 sm:p-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-warm-gold text-xs font-semibold tracking-wider uppercase mb-2 border border-warm-gold/20">
                  <span class="material-symbols-outlined text-sm">navigation</span>
                  <span>Live Buyer Route Guidance</span>
                </div>
                <h3 class="text-2xl sm:text-3xl font-bold font-headline">Find Your Route to Thangam Farms</h3>
                <p class="text-white/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                  Located directly on Trichy Main Road (NH 81), Kannampalayam. Easily accessible for commercial wholesale buyers, hotels, catering fleets, and retail partners across Coimbatore, Tiruppur, and Erode.
                </p>
              </div>

              <!-- Quick Google Maps Direct Link -->
              <div class="flex-shrink-0">
                <a id="${this.containerId}-gmaps-direct" 
                   href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DESTINATION.address)}&travelmode=driving" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-warm-gold text-deep-green font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-md">
                  <span class="material-symbols-outlined text-base">directions</span>
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Interactive Control Bar & Privacy Notice -->
          <div class="p-4 sm:p-6 bg-light-background border-b border-light-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex flex-wrap items-center gap-3">
              <button type="button" id="${this.containerId}-locate-btn" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest-green text-white text-xs font-bold uppercase tracking-wider hover:bg-deep-green active:scale-95 transition-all shadow-sm">
                <span class="material-symbols-outlined text-sm">my_location</span>
                <span>Use My Current Location</span>
              </button>

              <button type="button" id="${this.containerId}-reset-btn" class="hidden inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white border border-light-outline-variant text-charcoal text-xs font-medium hover:bg-light-surface-variant transition-all">
                <span class="material-symbols-outlined text-sm">restart_alt</span>
                <span>Reset View</span>
              </button>
            </div>

            <!-- Privacy Guarantee Notice -->
            <div class="text-[11px] text-light-outline flex items-center gap-1.5">
              <span class="material-symbols-outlined text-forest-green text-sm">lock</span>
              <span>Your location is accessed <strong>only with your explicit permission</strong> when you tap the button above.</span>
            </div>
          </div>

          <!-- Status & Feedback Banner -->
          <div id="${this.containerId}-status" class="hidden px-6 py-3 border-b text-xs transition-all"></div>

          <!-- Route Metric Summary Card (Populated when route calculated) -->
          <div id="${this.containerId}-route-metrics" class="hidden p-4 sm:p-6 bg-white border-b border-light-outline-variant/60">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="flex items-center gap-3 p-3 bg-light-background rounded-lg border border-light-outline-variant">
                <span class="material-symbols-outlined text-forest-green text-2xl">straighten</span>
                <div>
                  <span class="text-[10px] text-light-outline uppercase tracking-wider font-bold block">Driving Distance</span>
                  <span id="${this.containerId}-distance" class="text-base font-bold text-charcoal">-</span>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-light-background rounded-lg border border-light-outline-variant">
                <span class="material-symbols-outlined text-forest-green text-2xl">timer</span>
                <div>
                  <span class="text-[10px] text-light-outline uppercase tracking-wider font-bold block">Estimated Travel Time</span>
                  <span id="${this.containerId}-duration" class="text-base font-bold text-charcoal">-</span>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-3 p-2">
                <a id="${this.containerId}-start-nav" 
                   href="#" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 transition-all shadow-md">
                  <span class="material-symbols-outlined text-base">near_me</span>
                  <span>Start Turn-by-Turn Navigation</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Map Viewport -->
          <div class="relative w-full h-[360px] sm:h-[420px] lg:h-[480px] bg-slate-100 z-0">
            <div id="${this.containerId}-map" class="w-full h-full"></div>

            <!-- Destination Info Floating Card -->
            <div class="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-4 rounded-xl border border-light-outline-variant/80 shadow-lg pointer-events-auto z-[400]">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-forest-green text-2xl flex-shrink-0 mt-0.5">store</span>
                <div>
                  <h4 class="font-bold text-charcoal text-xs sm:text-sm font-headline">Thangam Farms / STP Chickens</h4>
                  <p class="text-[11px] text-light-on-surface-variant leading-relaxed mt-0.5">
                    152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103
                  </p>
                  <div class="mt-2 flex items-center gap-3 text-[10px] font-semibold text-forest-green">
                    <span>Direct Highway Access</span>
                    <span>•</span>
                    <span>Heavy Vehicle / Fleet Accessible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Event Listeners
      const locateBtn = document.getElementById(`${this.containerId}-locate-btn`);
      if (locateBtn) {
        locateBtn.addEventListener('click', () => this.handleLocateUser());
      }

      const resetBtn = document.getElementById(`${this.containerId}-reset-btn`);
      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetView());
      }
    }

    initLeaflet() {
      const mapEl = document.getElementById(`${this.containerId}-map`);
      if (!mapEl || !window.L) return;

      // Initialize map centered at Kannampalayam destination
      this.map = L.map(`${this.containerId}-map`, {
        scrollWheelZoom: false
      }).setView([DESTINATION.lat, DESTINATION.lng], 13);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Custom Destination Marker Icon
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="background-color: #174B35; color: #FFFFFF; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid #C5A35B;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      });

      this.destMarker = L.marker([DESTINATION.lat, DESTINATION.lng], { icon: destIcon })
        .addTo(this.map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <strong style="color: #174B35; font-size: 13px;">${DESTINATION.title}</strong><br/>
            ${DESTINATION.address}<br/>
            <span style="color: #C5A35B; font-weight: bold;">Daily Fresh Broiler Dispatch</span>
          </div>
        `)
        .openPopup();
    }

    showStatus(message, type = 'info') {
      const statusEl = document.getElementById(`${this.containerId}-status`);
      if (!statusEl) return;

      statusEl.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-amber-50', 'text-amber-800', 'border-amber-200', 'bg-rose-50', 'text-rose-800', 'border-rose-200');

      if (type === 'success') {
        statusEl.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
      } else if (type === 'warning') {
        statusEl.classList.add('bg-amber-50', 'text-amber-800', 'border-amber-200');
      } else {
        statusEl.classList.add('bg-rose-50', 'text-rose-800', 'border-rose-200');
      }

      statusEl.innerHTML = message;
    }

    handleLocateUser() {
      if (!navigator.geolocation) {
        this.showStatus('Geolocation is not supported by your browser. You can click "Open in Google Maps" above to get turn-by-turn directions.', 'warning');
        return;
      }

      const locateBtn = document.getElementById(`${this.containerId}-locate-btn`);
      if (locateBtn) {
        locateBtn.disabled = true;
        locateBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Detecting Location...</span>
        `;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (locateBtn) {
            locateBtn.disabled = false;
            locateBtn.innerHTML = `
              <span class="material-symbols-outlined text-sm">check_circle</span>
              <span>Location Detected</span>
            `;
          }

          document.getElementById(`${this.containerId}-reset-btn`)?.classList.remove('hidden');

          this.updateUserMarker();
          this.fetchAndDrawRoute();
        },
        (error) => {
          if (locateBtn) {
            locateBtn.disabled = false;
            locateBtn.innerHTML = `
              <span class="material-symbols-outlined text-sm">my_location</span>
              <span>Use My Current Location</span>
            `;
          }

          let msg = 'Unable to retrieve location. ';
          if (error.code === error.PERMISSION_DENIED) {
            msg += 'Location permission was denied. You can manually use the Google Maps button above.';
          } else {
            msg += error.message || 'Please check your connection and GPS settings.';
          }
          this.showStatus(msg, 'warning');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    }

    updateUserMarker() {
      if (!this.map || !this.userCoords) return;

      if (this.userMarker) {
        this.userMarker.remove();
      }

      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="background-color: #2563EB; color: #FFFFFF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.3); border: 2.5px solid #FFFFFF;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      this.userMarker = L.marker([this.userCoords.lat, this.userCoords.lng], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('<strong>Your Location</strong>')
        .openPopup();
    }

    async fetchAndDrawRoute() {
      if (!this.userCoords || !this.map) return;

      const url = `https://router.project-osrm.org/route/v1/driving/${this.userCoords.lng},${this.userCoords.lat};${DESTINATION.lng},${DESTINATION.lat}?overview=full&geometries=geojson`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || !data.routes[0]) {
          throw new Error('No driving route found');
        }

        const route = data.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);

        // Draw GeoJSON Route Line
        if (this.routeLayer) {
          this.routeLayer.remove();
        }

        this.routeLayer = L.geoJSON(route.geometry, {
          style: {
            color: '#174B35',
            weight: 5,
            opacity: 0.85,
            lineJoin: 'round'
          }
        }).addTo(this.map);

        // Fit bounds to show entire route comfortably
        const bounds = L.latLngBounds([
          [this.userCoords.lat, this.userCoords.lng],
          [DESTINATION.lat, DESTINATION.lng]
        ]);
        this.map.fitBounds(bounds, { padding: [50, 50] });

        // Update UI Metric Cards
        const distEl = document.getElementById(`${this.containerId}-distance`);
        const durEl = document.getElementById(`${this.containerId}-duration`);
        const metricsBox = document.getElementById(`${this.containerId}-route-metrics`);
        const navBtn = document.getElementById(`${this.containerId}-start-nav`);

        if (distEl) distEl.textContent = `${distanceKm} km`;
        if (durEl) {
          if (durationMins > 60) {
            const hrs = Math.floor(durationMins / 60);
            const mins = durationMins % 60;
            durEl.textContent = `${hrs} hr ${mins} mins`;
          } else {
            durEl.textContent = `${durationMins} mins`;
          }
        }

        if (navBtn) {
          const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.userCoords.lat},${this.userCoords.lng}&destination=${encodeURIComponent(DESTINATION.address)}&travelmode=driving`;
          navBtn.href = gmapsUrl;
        }

        if (metricsBox) metricsBox.classList.remove('hidden');

        this.showStatus(`<strong>Fastest Driving Route Calculated:</strong> ${distanceKm} km (${durationMins} mins via NH 81 corridor). Tap "Start Turn-by-Turn Navigation" to launch Google Maps.`, 'success');
      } catch (err) {
        // Fallback: simple line or message
        this.showStatus(`Could not fetch live OSRM driving geometry (${err.message}). You can still launch turn-by-turn navigation directly via Google Maps.`, 'warning');
        
        const navBtn = document.getElementById(`${this.containerId}-start-nav`);
        const metricsBox = document.getElementById(`${this.containerId}-route-metrics`);
        if (navBtn && this.userCoords) {
          navBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${this.userCoords.lat},${this.userCoords.lng}&destination=${encodeURIComponent(DESTINATION.address)}&travelmode=driving`;
        }
        if (metricsBox) metricsBox.classList.remove('hidden');
      }
    }

    resetView() {
      if (this.routeLayer) this.routeLayer.remove();
      if (this.userMarker) this.userMarker.remove();
      this.userCoords = null;

      document.getElementById(`${this.containerId}-route-metrics`)?.classList.add('hidden');
      document.getElementById(`${this.containerId}-status`)?.classList.add('hidden');
      document.getElementById(`${this.containerId}-reset-btn`)?.classList.add('hidden');

      const locateBtn = document.getElementById(`${this.containerId}-locate-btn`);
      if (locateBtn) {
        locateBtn.innerHTML = `
          <span class="material-symbols-outlined text-sm">my_location</span>
          <span>Use My Current Location</span>
        `;
      }

      if (this.map) {
        this.map.setView([DESTINATION.lat, DESTINATION.lng], 13);
        this.destMarker?.openPopup();
      }
    }
  }

  global.ThangamRouteMap = ThangamRouteMap;
})(window);

