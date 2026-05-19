import { coresPorTipo } from './graficos';

// Recife centro (Marco Zero) — usado quando não há pontos para enquadrar.
const RECIFE_CENTER = [-8.0631, -34.8711];
const DEFAULT_ZOOM  = 12;

let miniMap;
let markersLayer;

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function buildIcon(color) {
    // Marker custom: bolinha colorida com halo branco — combina com os
    // dots do feed e com as fatias do donut.
    return L.divIcon({
        className: 'mini-map-marker',
        html: `<span class="mini-map-marker-dot" style="background:${color}"></span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -8]
    });
}

function ensureMap() {
    if (miniMap) return miniMap;

    const el = document.getElementById('dashboardMiniMap');
    if (!el || typeof L === 'undefined') return null;

    miniMap = L.map(el, {
        center: RECIFE_CENTER,
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: false,           // não sequestra o scroll da página
        zoomControl: true,
        attributionControl: true,
        tap: false                        // evita conflito de eventos no mobile
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(miniMap);

    markersLayer = L.layerGroup().addTo(miniMap);

    return miniMap;
}

export function renderMiniMap(items) {
    const map = ensureMap();
    if (!map) return;

    const emptyEl   = document.getElementById('mapEmptyState');
    const summaryEl = document.getElementById('resumoMapa');

    markersLayer.clearLayers();

    const valid = (items || []).filter(
        i => Number.isFinite(i.latitude) && Number.isFinite(i.longitude)
    );

    if (valid.length === 0) {
        if (emptyEl)   emptyEl.hidden = false;
        if (summaryEl) summaryEl.textContent = 'Sem ocorrências geolocalizadas.';
        map.setView(RECIFE_CENTER, DEFAULT_ZOOM);
        return;
    }

    if (emptyEl) emptyEl.hidden = true;

    valid.forEach(item => {
        const color = coresPorTipo[item.type] || '#94a3b8';
        const marker = L.marker([item.latitude, item.longitude], {
            icon: buildIcon(color),
            riseOnHover: true
        });

        marker.bindPopup(`
            <div class="mini-map-popup">
              <strong>${escapeHtml(item.type)}</strong>
              <span>${escapeHtml(item.street)}</span>
              <span class="mini-map-popup-meta">${escapeHtml(item.district)}</span>
              <a href="/ocorrencias/${item.id}">Ver detalhe →</a>
            </div>
        `);

        markersLayer.addLayer(marker);
    });

    // Enquadra os marcadores
    const bounds = L.latLngBounds(valid.map(i => [i.latitude, i.longitude]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });

    if (summaryEl) {
        const n = valid.length;
        summaryEl.innerHTML =
            `<strong>${n}</strong> ${n === 1 ? 'ocorrência recente plotada' : 'ocorrências recentes plotadas'}`;
    }

    // Conserta dimensão quando o card aparece via animação ou layout shift.
    setTimeout(() => map.invalidateSize(), 100);
}
