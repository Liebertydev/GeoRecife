document.addEventListener('DOMContentLoaded', function () {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // 1. Limites da Região Metropolitana do Recife (RMR)
  // [Sudoeste, Nordeste] - Abrange de Ipojuca até Itamaracá
  const rmrBounds = [
    [-8.55, -35.20],
    [-7.50, -34.70]
  ];

  const map = L.map('map', {
    maxBounds: rmrBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 10,
    maxZoom: 18
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      map.setView([lat, lon], 17, {
        animate: true,
        duration: 1.5
      });

      const userIcon = L.icon({
        iconUrl: '/assets/img/Localization (2).png', // tu troca depois
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      L.marker([lat, lon], { icon: userIcon })
        .addTo(map)
        .bindPopup("Você está aqui");
    },
    () => {
      // fallback (se usuário negar localização)
      map.setView([-8.0631, -34.8710], 16);
    }
  );


  let marcacaoAtual = null;


  document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    const viewbox = `-35.20,-7.50,-34.70,-8.55`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&accept-language=pt-BR&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const results = await response.json();

      if (results.length > 0) {
        const res = results[0];
        const addr = res.address;

        const localOuRua = addr.information || addr.amenity || "";
        const bairro = addr.suburb || "";
        const cidade = addr.city || "";
        const cep = addr.postcode || "";

        const enderecoLimpo = [localOuRua, bairro, cidade, cep]
          .filter(item => item !== "")
          .join(', ');

        if (marcacaoAtual) map.removeLayer(marcacaoAtual);

        marcacaoAtual = L.marker([parseFloat(res.lat), parseFloat(res.lon)])
          .addTo(map)
          .bindPopup(`<strong>${enderecoLimpo}</strong>`)
          .openPopup();

        map.setView([res.lat, res.lon], 16);
      } else {
        alert('Local não encontrado na Região Metropolitana do Recife.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao processar a busca.');
    }
  });

  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  const input = document.getElementById("searchInput");
  const suggestions = document.getElementById("suggestions");

  let debounceTimer;

  input.addEventListener("input", function () {

    clearTimeout(debounceTimer);

    const query = this.value.trim();

    if (query.length < 3) {
      suggestions.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {

      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=4&bbox=-35.20,-8.55,-34.70,-7.50`;

      const res = await fetch(url);
      const data = await res.json();

      suggestions.innerHTML = "";

      data.features.forEach(place => {

        console.log(data);
        const p = place.properties;

        const localOuRua =
          p.name ||
          p.street ||
          "";

        const bairro =
          p.district ||
          p.suburb ||
          "";

        const cidade =
          p.city ||
          "";

        const cep =
          p.postcode ||
          "";

        const enderecoLimpo = [localOuRua, bairro, cidade, cep]
          .filter(x => x !== "")
          .join(", ");

        const item = document.createElement("button");

        item.className = "list-group-item list-group-item-action";
        item.textContent = enderecoLimpo;

        item.onclick = () => {

          suggestions.innerHTML = "";
          input.value = enderecoLimpo;

          const lat = place.geometry.coordinates[1];
          const lon = place.geometry.coordinates[0];

          if (marcacaoAtual) map.removeLayer(marcacaoAtual);

          marcacaoAtual = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<strong>${enderecoLimpo}</strong>`)
            .openPopup();

          map.setView([lat, lon], 16);

        };

        suggestions.appendChild(item);

      });

    }, 300);

  });


});