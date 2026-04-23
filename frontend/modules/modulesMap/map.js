import { RMR_BOUNDS, RMR_POLYGON_COORDS } from './bounds.js';

// ====================
// INICIALIZAÇÃO DO MAPA
// ====================
export function inicializarMapa(elementId) {
  const map = L.map(elementId, {
    maxBounds: RMR_BOUNDS,
    maxBoundsViscosity: 1.0,
    minZoom: 10,
    maxZoom: 18,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  return map;
}

// ====================
// RENDERIZAÇÃO DO POLÍGONO DA RMR
// ====================
export function renderizarPoligonoRMR(map) {
  L.polygon(RMR_POLYGON_COORDS, {
    color: 'green',
    weight: 2,
    fill: false,
  }).addTo(map);

  L.polygon(
    [
      [[-90, -180], [-90, 180], [90, 180], [90, -180]],
      RMR_POLYGON_COORDS,
    ],
    {
      color: 'transparent',
      fillColor: '#000',
      fillOpacity: 0.25,
      stroke: false,
    }
  ).addTo(map);
}
