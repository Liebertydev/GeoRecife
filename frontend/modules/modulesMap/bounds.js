// ====================
// POLÍGONO DA RMR
// ====================
export const RMR_BOUNDS = [
  [-8.55, -35.20],
  [-7.50, -34.70]
];

export const RMR_POLYGON_COORDS = [
  [-8.0500, -35.1500],
  [-7.8000, -35.0000],
  [-7.6000, -34.9000],
  [-7.5500, -34.8000],
  [-7.7000, -34.7500],
  [-7.9000, -34.7500],
  [-8.1000, -34.7800],
  [-8.2500, -34.8500],
  [-8.3500, -34.9000],
  [-8.4000, -35.0000],
  [-8.3500, -35.1000],
  [-8.2000, -35.1800],
  [-8.0500, -35.1500],
];

// ====================
// VALIDAÇÃO DE BOUNDS (POINT-IN-POLYGON)
// ====================
export function dentroDosBounds(lat, lng) {
  const poly = RMR_POLYGON_COORDS;
  let inside = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
