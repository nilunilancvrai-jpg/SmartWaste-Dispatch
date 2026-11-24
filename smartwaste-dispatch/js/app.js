window.SmartWaste = window.SmartWaste || {};
(() => {
  const app = window.SmartWaste;
  const $ = id => document.getElementById(id);
  const mapEl = $('map');
  if (!mapEl) return;

  let map = null, userMarker = null, routeControl = null;
  let bins = [], currentLocation = null, markers = [], mappedBins = [], mappedMarkers = [];
  let isAuthorized = false, selectedWasteSize = null, dashboardStarted = false, bookingLocation = null;

  const setMessage = (text, error = false) => {
    const el = $('message');
    if (!el) return;
    el.textContent = text;
    el.style.display = text ? 'block' : 'none';
    el.dataset.state = error ? 'error' : 'info';
  };
  const formatDistance = km => km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

  function initMap() {
    if (!window.L) {
      setMessage('The map library did not load. Check your internet connection and refresh.', true);
      return false;
    }
    if (map) return true;
    map = L.map('map', { zoomControl: true, preferCanvas: true }).setView([12.956, 77.716], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).on('tileerror', () => setMessage('Map tiles are unavailable. Check your internet connection.', true)).addTo(map);
    setTimeout(() => map.invalidateSize(true), 120);
    return true;
  }

  function markerColor(bin) {
    if (bin.status !== 'available') return '#8a8174';
    if (bin.fill >= 95) return '#d46a52';
    if (bin.fill >= 80) return '#c99a57';
    return '#35c98a';
  }

  function renderMarkers() {
    if (!map) return;
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    const nearest = currentLocation ? (suitableBins()[0] || null) : null;
    bins.forEach(bin => {
      if (!Number.isFinite(bin.lat) || !Number.isFinite(bin.lng)) return;
      const isNearest = Boolean(nearest && nearest.id === bin.id);
      const icon = app.mapMarkers.binIcon(bin.fill, bin.status, isNearest);
      const marker = L.marker([bin.lat, bin.lng], {
        icon,
        keyboard: true,
        title: `${bin.name || 'Waste bin'} · ${bin.fill}% full`,
        zIndexOffset: isNearest ? 1200 : Math.max(0, 100 - Number(bin.fill || 0))
      }).addTo(map);

      const popup = document.createElement('div');
      popup.className = 'bin-map-popup';
      const title = document.createElement('strong');
      title.textContent = bin.name || 'Waste bin';
      const address = document.createElement('div');
      address.textContent = bin.address || 'Address unavailable';
      const fill = document.createElement('div');
      fill.textContent = `Fill level: ${bin.fill}%`;
      const stateLabel = document.createElement('div');
      stateLabel.textContent = bin.status !== 'available' ? 'Out of service' :
        bin.fill < 80 ? (isNearest ? 'Nearest suitable bin' : 'Suitable · under 80%') :
        bin.fill < 95 ? 'Near capacity' : 'Critical capacity';
      popup.append(title, address, fill, stateLabel);
      marker.bindPopup(popup);
      marker.on('click', () => {
        if (isNearest) showRecommendation(nearest);
      });
      markers.push(marker);
    });
  }

  function suitableBins() {
    if (!currentLocation) return [];
    return bins
      .filter(bin => bin.status === 'available' && Number.isFinite(bin.fill) &&
        bin.fill >= 0 && bin.fill < 80 && Number.isFinite(bin.lat) && Number.isFinite(bin.lng))
      .map(bin => ({ ...bin, distanceKm: app.calculateDistance(currentLocation, { lat: bin.lat, lng: bin.lng }) }))
      .filter(bin => bin.distanceKm <= (app.SEARCH_RADIUS_KM || 2.5))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  function showRecommendation(bin) {
    const card = $('binCard');
    if (!card) return;
    card.replaceChildren();
    if (!bin) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      const icon = document.createElement('span');
      icon.className = 'empty-symbol';
      icon.innerHTML = '<i class="ti ti-map-pin-off" aria-hidden="true"></i>';
      const title = document.createElement('strong');
      title.textContent = 'No suitable bin found';
      const desc = document.createElement('p');
      desc.textContent = 'No live-capacity bin was found within 5 km. Nearby mapped public locations are checked separately, but their fill levels are not verified.';
      const retry = document.createElement('button');
      retry.className = 'button button-primary';
      retry.textContent = 'Refresh bins';
      retry.type = 'button';
      retry.addEventListener('click', refreshBins);
      empty.append(icon, title, desc, retry);
      card.appendChild(empty);
      return;
    }

    const top = document.createElement('div');
    top.className = 'bin-top';
    const identity = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'bin-name';
    name.textContent = bin.name || 'Available waste bin';
    const address = document.createElement('div');
    address.className = 'bin-address';
    address.textContent = bin.address || 'Address unavailable';
    identity.append(name, address);
    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = 'Available';
    top.append(identity, status);

    const stats = document.createElement('div');
    stats.className = 'bin-stats';
    [['Fill level', `${bin.fill}%`], ['Distance', formatDistance(bin.distanceKm)]].forEach(([label, value]) => {
      const box = document.createElement('div');
      box.className = 'bin-stat';
      const l = document.createElement('div');
      l.className = 'stat-label';
      l.textContent = label;
      const v = document.createElement('div');
      v.className = 'stat-value';
      v.textContent = value;
      box.append(l, v);
      stats.appendChild(box);
    });

    const progress = document.createElement('div');
    progress.className = 'progress';
    const bar = document.createElement('div');
    bar.className = 'progress-bar';
    bar.style.width = `${Math.max(0, Math.min(100, bin.fill))}%`;
    progress.appendChild(bar);

    const updated = document.createElement('p');
    updated.className = 'bin-address';
    updated.style.marginTop = '10px';
    updated.textContent = bin.updatedAt ? `Last updated ${new Date(bin.updatedAt).toLocaleString()}` : 'Latest database reading';

    const directions = document.createElement('button');
    directions.className = 'directions-btn';
    directions.type = 'button';
    directions.innerHTML = '<i class="ti ti-route"></i> Get walking directions';
    directions.addEventListener('click', () => drawRoute(bin));

    card.append(top, stats, progress, updated, directions);
    const marker = markers.find(m => {
      const point = m.getLatLng();
      return point.lat === bin.lat && point.lng === bin.lng;
    });
    if (marker) marker.openPopup();
  }

  function showMappedBinFallback() {
    const card = $('binCard');
    if (!card) return;
    card.replaceChildren();
    if (!mappedBins.length) {
      showRecommendation(null);
      const desc = card.querySelector('.empty-state p');
      if (desc) desc.textContent = bins.length
        ? 'No database bin below 80% was found nearby. OpenStreetMap has no mapped public waste bins for this area right now.'
        : 'No bin records are connected in Supabase yet, and no mapped public waste bins were returned for this area.';
      return;
    }
    const nearest = mappedBins[0];
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const icon = document.createElement('span');
    icon.className = 'empty-symbol';
    icon.innerHTML = '<i class="ti ti-map-pin-question" aria-hidden="true"></i>';
    const title = document.createElement('strong');
    title.textContent = 'Nearby mapped waste locations';
    const desc = document.createElement('p');
    desc.textContent = `${mappedBins.length} OpenStreetMap location(s) found. Their bin capacity and current availability are not verified, so they are not marked as suitable.`;
    const name = document.createElement('p');
    name.className = 'bin-address';
    name.textContent = `${nearest.name} · ${formatDistance(nearest.distanceKm)} · capacity unknown`;
    const directions = document.createElement('button');
    directions.className = 'button button-primary';
    directions.type = 'button';
    directions.textContent = 'Get directions to nearest mapped location';
    directions.addEventListener('click', () => drawRoute(nearest));
    empty.append(icon,title,desc,name,directions);
    card.appendChild(empty);
  }

  async function fetchNearbyMappedBins() {
    if (!currentLocation) return [];
    const radius = 5000;
    const { lat, lng } = currentLocation;
    const query = `[out:json][timeout:18];(node["amenity"~"^(waste_basket|waste_disposal)$"](around:${radius},${lat},${lng});way["amenity"~"^(waste_basket|waste_disposal)$"](around:${radius},${lat},${lng});relation["amenity"~"^(waste_basket|waste_disposal)$"](around:${radius},${lat},${lng}););out center tags;`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`Nearby map search returned ${response.status}.`);
      const payload = await response.json();
      const unique = new Map();
      (payload.elements || []).forEach((item, index) => {
        const pointLat = item.lat ?? item.center?.lat;
        const pointLng = item.lon ?? item.center?.lon;
        if (!Number.isFinite(pointLat) || !Number.isFinite(pointLng)) return;
        const tags = item.tags || {};
        const name = tags.name || tags['name:en'] ||
          (tags.amenity === 'waste_basket' ? 'Mapped public waste basket' : 'Mapped waste disposal point');
        const id = `osm-${item.type}-${item.id}`;
        unique.set(id, {
          id, name, address: tags['addr:street'] || tags['addr:suburb'] || 'Address not provided in OpenStreetMap',
          lat: pointLat, lng: pointLng, distanceKm: app.calculateDistance(currentLocation,{lat:pointLat,lng:pointLng}),
          source: 'OpenStreetMap'
        });
      });
      mappedBins = [...unique.values()].filter(item => item.distanceKm <= radius / 1000)
        .sort((a,b) => a.distanceKm - b.distanceKm);
      mappedMarkers.forEach(marker => map.removeLayer(marker));
      mappedMarkers = [];
      mappedBins.forEach(item => {
        const marker = L.marker([item.lat,item.lng], {
          icon: app.mapMarkers.binIcon(0,'unknown',false,true),
          title: `${item.name} · capacity not verified`
        }).addTo(map);
        const popup = document.createElement('div');
        popup.className = 'bin-map-popup';
        const title = document.createElement('strong'); title.textContent = item.name;
        const distance = document.createElement('div'); distance.textContent = `${formatDistance(item.distanceKm)} away · capacity unknown`;
        const note = document.createElement('div'); note.textContent = 'Mapped in OpenStreetMap; check the location before disposal.';
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'directions-btn'; button.textContent = 'Get walking directions';
        button.addEventListener('click', () => drawRoute(item));
        popup.append(title,distance,note,button);
        marker.bindPopup(popup);
        mappedMarkers.push(marker);
      });
      if (!suitableBins().length) showMappedBinFallback();
      return mappedBins;
    } catch (error) {
      console.warn('OpenStreetMap nearby waste lookup failed:', error);
      if (!suitableBins().length) {
        showMappedBinFallback();
        const message = $('message');
        if (message) setMessage('Could not load nearby OpenStreetMap waste locations. Check your internet connection and try again.', true);
      }
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  function drawRoute(bin) {
    if (!currentLocation) {
      setMessage('Find your current location before requesting directions.', true);
      return;
    }
    if (!window.L?.Routing || !app.routing) {
      setMessage('Walking directions are unavailable right now. The bin is still marked on the map.', true);
      return;
    }
    try {
      if (routeControl) map.removeControl(routeControl);
      routeControl = app.routing.showRoute(map, currentLocation, bin);
      setMessage('Walking route requested. Route calculation depends on the routing service.');
    } catch (error) {
      setMessage(error.message || 'Could not calculate a walking route.', true);
    }
  }

  async function refreshBins() {
    const button = $('refreshBtn');
    if (button) button.disabled = true;
    setMessage('Refreshing waste-bin data…');
    try {
      bins = await app.data.getBins();
      renderMarkers();
      if (currentLocation) {
        const match = suitableBins()[0] || null;
        if (match) showRecommendation(match);
        else if (mappedBins.length) showMappedBinFallback();
        else showRecommendation(null);
      }
      setMessage(`Loaded ${bins.length} registered waste-bin records from Supabase.`);
    } catch (error) {
      console.error('Bin refresh failed:', error);
      setMessage('Could not load bins from Supabase. Check the browser console and database access policies.', true);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function locate() {
    const button = $('locateBtn');
    if (button) { button.disabled = true; button.textContent = 'Locating…'; }
    setMessage('Requesting your current location…');
    try {
      currentLocation = await app.getUserLocation();
      const point = [currentLocation.lat, currentLocation.lng];
      const userIcon = app.mapMarkers.personIcon();
      if (userMarker) {
        userMarker.setLatLng(point);
        userMarker.setIcon(userIcon);
      } else {
        userMarker = L.marker(point, { icon: userIcon, zIndexOffset: 2000, title: 'Your current location' })
          .addTo(map).bindPopup('You are here');
      }
      renderMarkers();
      const label = $('locationLabel');
      if (label) label.textContent = 'Your current location is active';
      map.setView(point, 15);
      await fetchNearbyMappedBins();
      const match = suitableBins()[0] || null;
      if (match) {
        showRecommendation(match);
        map.fitBounds(L.latLngBounds([point, [match.lat, match.lng]]), { padding: [75, 75], maxZoom: 15 });
        setMessage('Nearest database bin below 80% found and highlighted on the map.');
      } else if (mappedBins.length) {
        showMappedBinFallback();
        const points = [[point[0],point[1]], ...mappedBins.slice(0,5).map(item=>[item.lat,item.lng])];
        map.fitBounds(L.latLngBounds(points), {padding:[65,65],maxZoom:15});
        setMessage(`No bin has verified live capacity data. Showing ${mappedBins.length} nearby OpenStreetMap locations instead.`);
      } else {
        showMappedBinFallback();
        map.setView(point, 15);
        setMessage('No suitable database bin or mapped public waste location was found nearby.');
      }
    } catch (error) {
      console.error('Location request failed:', error);
      setMessage(error.message || 'Could not access your location. Check browser location permission.', true);
    } finally {
      if (button) { button.disabled = false; button.innerHTML = '<i class="ti ti-current-location"></i> Locate me'; }
    }
  }

  function showAll() {
    const allMarkers = [...markers, ...mappedMarkers];
    if (!allMarkers.length) return setMessage('No bin locations are available yet. Check Supabase and try again.', true);
    map.fitBounds(L.featureGroup(allMarkers).getBounds().pad(.15));
    setMessage(`Showing ${markers.length} Supabase bins and ${mappedMarkers.length} mapped public locations.`);
  }

  function showMe() {
    if (!currentLocation) return locate();
    map.setView([currentLocation.lat, currentLocation.lng], 16);
    if (userMarker) userMarker.openPopup();
  }

  function showDashboard() {
    $('waste-intake')?.setAttribute('hidden', '');
    $('waste-actions')?.setAttribute('hidden', '');
    $('dashboardContent')?.removeAttribute('hidden');
    $('dashboardFooter')?.removeAttribute('hidden');
    document.body.dataset.wasteSize = selectedWasteSize || '';
    const label = { small: 'Small waste', medium: 'Medium waste', large: 'Large / bulky waste' }[selectedWasteSize];
    const subtitle = document.querySelector('.public-intro p');
    if (subtitle) subtitle.textContent = `${label} selected · Find a suitable nearby waste station.`;
    dashboardStarted = true;
    initMap();
    requestAnimationFrame(() => {
      map?.invalidateSize(true);
      refreshBins().then(() => locate());
      setTimeout(() => map?.invalidateSize(true), 300);
    });
  }

  function renderActionChoices() {
    const panel = $('waste-actions');
    const choices = $('actionChoices');
    const title = $('actionTitle');
    const description = $('actionDescription');
    if (!panel || !choices) return;
    choices.replaceChildren();

    const addChoice = ({ icon, heading, detail, action, style = '' }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `action-choice ${style}`.trim();
      button.innerHTML = `<span class="action-icon"><i class="ti ${icon}" aria-hidden="true"></i></span><span class="action-copy"><strong>${heading}</strong><small>${detail}</small></span><span class="option-arrow"><i class="ti ti-arrow-up-right"></i></span>`;
      button.addEventListener('click', action);
      choices.appendChild(button);
    };

    if (selectedWasteSize === 'small') {
      title.textContent = 'Find a nearby bin';
      description.textContent = 'Small waste can go to a public bin with enough free capacity.';
      addChoice({
        icon: 'ti-route', heading: 'Get directions',
        detail: 'See the nearest suitable bin and walking route.',
        action: showDashboard, style: 'action-primary'
      });
    } else if (selectedWasteSize === 'medium') {
      title.textContent = 'Choose how to handle your waste';
      description.textContent = 'Find a nearby bin or request a collection.';
      addChoice({
        icon: 'ti-route', heading: 'Get directions',
        detail: 'Find a nearby bin with available capacity.',
        action: showDashboard, style: 'action-primary'
      });
      addChoice({
        icon: 'ti-calendar-check', heading: 'Book waste collection',
        detail: 'Request a pickup for your medium-sized waste.',
        action: () => showBookingNotice('Medium waste collection')
      });
    } else {
      title.textContent = 'Find a suitable disposal location';
      description.textContent = 'For large or bulky waste, check nearby mapped disposal locations and available public bins. Driver and pickup booking are not offered in this version.';
      addChoice({
        icon: 'ti-map-pin',
        heading: 'Find nearby locations',
        detail: 'View nearby mapped waste points and available bin locations.',
        action: showDashboard,
        style: 'action-primary'
      });
    }
    panel.hidden = false;
    $('waste-intake')?.setAttribute('hidden', '');
  }

  function showBookingNotice(service) {
    let dialog = $('bookingDialog');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'bookingDialog';
      dialog.className = 'booking-dialog';
      dialog.innerHTML = `
        <form id="bookingForm" class="booking-form">
          <button type="button" class="dialog-close" id="closeBooking" aria-label="Close"><i class="ti ti-x"></i></button>
          <div class="eyebrow"><i></i> COLLECTION REQUEST</div>
          <h2 id="bookingHeading">Book a collection</h2>
          <p class="booking-description">Share the pickup details. Your request will be sent to the SmartWaste team.</p>
          <label>Pickup address <span>*</span><textarea id="pickupAddress" required rows="2" placeholder="House / street / area / landmark"></textarea></label>
          <button type="button" class="use-location-btn" id="useBookingLocation"><i class="ti ti-current-location"></i> Use my current location</button>
          <p id="bookingLocationStatus" class="booking-location-status">GPS location not attached yet.</p>
          <label>Additional details <small>(optional)</small><textarea id="pickupNotes" rows="3" placeholder="Waste type, approximate quantity, access instructions…"></textarea></label>
          <div id="bookingError" class="booking-error" role="alert"></div>
          <button class="button button-primary booking-submit" id="submitBooking" type="submit">Send collection request</button>
        </form>`;
      document.body.appendChild(dialog);
      $('closeBooking').addEventListener('click', () => dialog.close());
      $('useBookingLocation').addEventListener('click', useBookingCurrentLocation);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
      });
      $('bookingForm').addEventListener('submit', submitBooking);
    }
    dialog.dataset.service = service;
    $('bookingHeading').textContent = service;
    $('bookingError').textContent = '';
    $('pickupAddress').value = '';
    $('pickupNotes').value = '';
    bookingLocation = null;
    $('bookingLocationStatus').textContent = 'GPS location not attached yet.';
    $('bookingLocationStatus').dataset.state = 'idle';
    dialog.showModal();
  }

  async function useBookingCurrentLocation() {
    const button = $('useBookingLocation');
    const status = $('bookingLocationStatus');
    button.disabled = true;
    button.innerHTML = '<i class="ti ti-loader-2"></i> Getting location…';
    status.textContent = 'Waiting for browser location permission…';
    try {
      const position = await app.getUserLocation();
      bookingLocation = {
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy ?? null
      };
      // Store the explicit pickup GPS fix for the request and keep the map in sync when it exists.
      currentLocation = bookingLocation;
      if (map) {
        const point = [position.lat, position.lng];
        if (userMarker) userMarker.setLatLng(point);
        map.setView(point, 15);
        renderMarkers();
      }
      const coords = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      if (!$('pickupAddress').value.trim()) {
        $('pickupAddress').value = `GPS pickup location (${coords})`;
      }
      status.textContent = `Pickup GPS attached · ${coords} · accuracy ±${Math.round(position.accuracy || 0)} m`;
      status.dataset.state = 'success';
    } catch (error) {
      bookingLocation = null;
      status.textContent = error.message || 'Could not get your location. You can still enter the pickup address manually.';
      status.dataset.state = 'error';
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="ti ti-current-location"></i> Use my current location';
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    const dialog = $('bookingDialog');
    const submit = $('submitBooking');
    const errorBox = $('bookingError');
    const address = $('pickupAddress').value.trim();
    const notes = $('pickupNotes').value.trim();
    if (!address) {
      errorBox.textContent = 'Please enter the pickup address.';
      return;
    }
    submit.disabled = true;
    submit.textContent = 'Sending request…';
    errorBox.textContent = '';
    try {
      const supabase = window.smartWasteSupabase;
      if (!supabase || !app.currentUser) throw new Error('Your signed-in account could not be verified. Please sign in again.');
      const service = dialog.dataset.service;
      const size = selectedWasteSize;
      const lat = bookingLocation?.lat ?? null;
      const lng = bookingLocation?.lng ?? null;
      const gpsAccuracy = bookingLocation?.accuracy ?? null;
      const mapsUrl = bookingLocation ? `https://www.google.com/maps?q=${lat},${lng}` : null;
      const { data, error } = await supabase.from('waste_requests').insert({
        requester_id: app.currentUser.id,
        waste_size: size,
        service_type: service,
        pickup_address: address,
        notes: notes || null,
        latitude: lat,
        longitude: lng,
        gps_accuracy_m: gpsAccuracy,
        maps_url: mapsUrl
      }).select('id,status,created_at').single();
      if (error) throw error;
      dialog.close();
      setMessage(`Collection request ${data.id} submitted and saved successfully.`);
      $('message')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      console.error('Waste request submission failed:', error);
      errorBox.textContent = error.message || 'Could not submit your request.';
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send collection request';
    }
  }

  document.querySelectorAll('[data-waste-size]').forEach(button => {
    button.addEventListener('click', () => {
      selectedWasteSize = button.dataset.wasteSize;
      document.querySelectorAll('[data-waste-size]').forEach(option => option.classList.toggle('is-selected', option === button));
      renderActionChoices();
    });
  });

  $('backToWaste')?.addEventListener('click', () => {
    $('waste-actions')?.setAttribute('hidden', '');
    $('waste-intake')?.removeAttribute('hidden');
  });
  $('locateBtn')?.addEventListener('click', locate);
  $('emptyLocateBtn')?.addEventListener('click', locate);
  $('refreshBtn')?.addEventListener('click', refreshBins);
  $('allBinsBtn')?.addEventListener('click', showAll);
  $('locationNavBtn')?.addEventListener('click', showMe);

  function hasGoogleIdentity(user) {
    return user?.app_metadata?.provider === 'google' ||
      (Array.isArray(user?.identities) && user.identities.some(identity => identity.provider === 'google'));
  }

  async function loadOptionalPublicProfile() {
    const supabase = window.smartWasteSupabase;
    if (!supabase) return;
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const session = sessionData?.session;
      if (!session) return;
      const { data: profile, error } = await supabase.from('profiles')
        .select('id,email,full_name,role').eq('id', session.user.id).maybeSingle();
      if (error) throw error;
      if (profile?.role === 'public' && hasGoogleIdentity(session.user)) {
        app.currentUser = session.user;
        app.currentProfile = profile;
      }
    } catch (error) {
      // Public map browsing must continue even if optional profile lookup is unavailable.
      console.warn('Optional public profile lookup failed:', error);
    }
  }

  function resumePendingBooking() {
    const pending = sessionStorage.getItem('smartwaste_pending_booking');
    if (!pending || !app.currentUser || app.currentProfile?.role !== 'public') return;
    try {
      const request = JSON.parse(pending);
      if (request?.service === 'Medium waste collection' && request?.size === 'medium') {
        selectedWasteSize = 'medium';
        document.querySelectorAll('[data-waste-size]').forEach(option => option.classList.toggle('is-selected', option.dataset.wasteSize === 'medium'));
        sessionStorage.removeItem('smartwaste_pending_booking');
        showBookingNotice(request.service);
      }
    } catch (error) {
      console.warn('Could not restore pending booking:', error);
      sessionStorage.removeItem('smartwaste_pending_booking');
    }
  }

  async function startPublicMap() {
    $('dashboardContent')?.removeAttribute('hidden');
    $('dashboardFooter')?.removeAttribute('hidden');
    initMap();
    requestAnimationFrame(async () => {
      map?.invalidateSize(true);
      await refreshBins();
      setTimeout(() => map?.invalidateSize(true), 250);
      // Profile verification is optional for map browsing; it never blocks map startup.
      await loadOptionalPublicProfile();
      resumePendingBooking();
    });
  }

  $('profileBtn')?.addEventListener('click', async () => {
    await loadOptionalPublicProfile();
    if (app.currentUser && app.currentProfile?.role === 'public') {
      location.href = 'profile.html';
      return;
    }
    sessionStorage.setItem('smartwaste_selected_login_role', 'public');
    sessionStorage.setItem('smartwaste_post_login_destination', 'profile.html');
    sessionStorage.setItem('smartwaste_require_google', 'true');
    location.href = 'login.html';
  });

  // A booking is a personal action: require a verified public account first.
  const originalShowBookingNotice = showBookingNotice;
  showBookingNotice = function(service) {
    if (!app.currentUser || app.currentProfile?.role !== 'public') {
      sessionStorage.setItem('smartwaste_pending_booking', JSON.stringify({ service, size: selectedWasteSize }));
      sessionStorage.setItem('smartwaste_selected_login_role', 'public');
      sessionStorage.setItem('smartwaste_post_login_destination', 'index.html');
      sessionStorage.setItem('smartwaste_require_google', 'true');
      location.href = 'login.html';
      return;
    }
    originalShowBookingNotice(service);
  };

  document.querySelectorAll('[data-waste-size]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-waste-size]').forEach(option => option.classList.toggle('is-selected', option === button));
    });
  });

  startPublicMap();
})();
