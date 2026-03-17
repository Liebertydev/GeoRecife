document.addEventListener('DOMContentLoaded', function () {
  const mapEl = document.getElementById('map');
  if (!mapEl) return; // só executa na página do mapa

  const recifeBounds = [
    [-8.20, -35.05],
    [-7.95, -34.80]
  ];

  const map = L.map('map', {
    maxBounds: recifeBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12,
    maxZoom: 18
  }).setView([-8.0631, -34.8710], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuidores'
  }).addTo(map);

  let marcacaoAtual = null;

  document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=pt-BR&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const results = await response.json();

      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lon = parseFloat(results[0].lon);
        const display_name = results[0].display_name;

        if (marcacaoAtual) map.removeLayer(marcacaoAtual);

        marcacaoAtual = L.marker([lat, lon]).addTo(map)
          .bindPopup(display_name)
          .openPopup();

        map.setView([lat, lon], 16);
      } else {
        alert('Nenhum local encontrado.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao buscar o local.');
    }
  });

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });
});