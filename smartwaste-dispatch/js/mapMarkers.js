window.SmartWaste = window.SmartWaste || {};
window.SmartWaste.mapMarkers = (() => {
  function binIcon(fill, status, highlighted = false, unknownCapacity = false) {
    const state = unknownCapacity ? 'unknown' : status !== 'available' ? 'offline' :
      Number(fill) >= 95 ? 'critical' : Number(fill) >= 80 ? 'near' : 'available';
    return L.divIcon({
      className: `sw-bin-marker-host ${highlighted ? 'is-highlighted' : ''}`,
      html: `<span class="sw-bin-marker ${state} ${highlighted ? 'is-highlighted' : ''}">
        <span class="sw-bin-marker-halo"></span>
        <span class="sw-bin-marker-body"><i class="ti ti-trash" aria-hidden="true"></i></span>
        <span class="sw-bin-marker-shadow"></span>
      </span>`,
      iconSize: [46, 54],
      iconAnchor: [23, 48],
      popupAnchor: [0, -44]
    });
  }

  function personIcon() {
    return L.divIcon({
      className: 'sw-person-marker-host',
      html: `<span class="sw-person-marker">
        <span class="sw-person-pulse"></span>
        <span class="sw-person-body"><i class="ti ti-user-filled" aria-hidden="true"></i></span>
      </span>`,
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });
  }

  return { binIcon, personIcon };
})();
