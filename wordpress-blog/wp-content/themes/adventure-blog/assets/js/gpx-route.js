(() => {
  const mapEl = document.getElementById('route-map');
  const chartEl = document.getElementById('route-elevation-chart');

  if (!mapEl || !window.L || !window.Chart) {
    return;
  }

  const gpxUrl = mapEl.dataset.gpxUrl || (window.adventureGpx && window.adventureGpx.gpxUrl);
  if (!gpxUrl) {
    return;
  }

  const map = L.map(mapEl, {
    zoomControl: true,
    scrollWheelZoom: true,
  });

  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap',
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  let routeLine = null;
  let chart = null;
  let trackPoints = [];

  const haversine = (a, b) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  const parseGpx = (xmlText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    const pointNodes = [
      ...doc.querySelectorAll('trkpt'),
      ...doc.querySelectorAll('rtept'),
    ];

    const points = [];
    let cumulative = 0;

    pointNodes.forEach((node, index) => {
      const lat = parseFloat(node.getAttribute('lat'));
      const lon = parseFloat(node.getAttribute('lon'));
      const eleNode = node.querySelector('ele');
      const ele = eleNode ? parseFloat(eleNode.textContent) : null;

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return;
      }

      if (index > 0) {
        cumulative += haversine(
          { lat: points[index - 1].lat, lon: points[index - 1].lon },
          { lat, lon }
        );
      }

      points.push({ lat, lon, ele, distance: cumulative / 1000 });
    });

    return points;
  };

  const setActivePoint = (index) => {
    if (!trackPoints[index]) {
      return;
    }

    markerLayer.clearLayers();
    const point = trackPoints[index];
    L.circleMarker([point.lat, point.lon], {
      radius: 7,
      color: '#373d2e',
      fillColor: '#d1d2d3',
      fillOpacity: 1,
      weight: 2,
    }).addTo(markerLayer);
  };

  const renderChart = () => {
    const labels = trackPoints.map((p) => p.distance.toFixed(1));
    const elevations = trackPoints.map((p) => (p.ele ?? null));

    chart = new Chart(chartEl, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Wysokość (m n.p.m.)',
            data: elevations,
            borderColor: '#373d2e',
            backgroundColor: 'rgba(55, 61, 46, 0.15)',
            fill: true,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: { display: true, text: 'Dystans (km)' },
            ticks: { maxTicksLimit: 8 },
          },
          y: {
            title: { display: true, text: 'm n.p.m.' },
          },
        },
        onHover: (_event, elements) => {
          if (elements.length) {
            setActivePoint(elements[0].index);
          }
        },
      },
    });
  };

  fetch(gpxUrl)
    .then((response) => response.text())
    .then((text) => {
      trackPoints = parseGpx(text);
      if (!trackPoints.length) {
        return;
      }

      const latLngs = trackPoints.map((p) => [p.lat, p.lon]);
      routeLine = L.polyline(latLngs, {
        color: '#373d2e',
        weight: 4,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [24, 24] });

      L.marker(latLngs[0], { title: 'Start' }).addTo(map);
      L.marker(latLngs[latLngs.length - 1], { title: 'Meta' }).addTo(map);

      if (chartEl) {
        renderChart();
      }
    })
    .catch(() => {
      mapEl.innerHTML = '<p style="padding:1rem;">Nie udało się wczytać pliku GPX.</p>';
    });

  if (window.Swiper && document.querySelector('.route-gallery__swiper')) {
    new Swiper('.route-gallery__swiper', {
      loop: true,
      slidesPerView: 1,
      spaceBetween: 16,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
})();
