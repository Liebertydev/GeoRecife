(self["webpackChunkGeoRecife"] = self["webpackChunkGeoRecife"] || []).push([["frontend_modules_map_js"],{

/***/ "./frontend/modules/map.js"
/*!*********************************!*\
  !*** ./frontend/modules/map.js ***!
  \*********************************/
() {

document.addEventListener('DOMContentLoaded', function () {
  // ====================
  // VALIDAÇÃO DO ELEMENTO DO MAPA
  // ====================
  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  // ====================
  // DEFINIÇÃO DOS LIMITES (RMR)
  // ====================
  const rmrBounds = [[-8.55, -35.20], [-7.50, -34.70]];

  // ====================
  // INICIALIZAÇÃO DO MAPA
  // ====================
  const map = L.map('map', {
    maxBounds: rmrBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 10,
    maxZoom: 18
  });

  // ====================
  // CAMADA VISUAL DO MAPA (TILES)
  // ====================
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // ====================
  // ESTADO GLOBAL
  // ====================
  let marcacaoAtual = null;
  let userLocation = null;
  let dadosMarcadorAtual = {};

  // ====================
  // BUSCA REVERSA (LAT/LNG → ENDEREÇO)
  // ====================
  async function buscaReversa(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=pt-BR&lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    const addr = data.address || {};

    // Atualiza estado global com dados separados
    dadosMarcadorAtual = {
      street: addr.amenity || addr.road || '',
      district: addr.suburb || addr.neighbourhood || '',
      postcode: addr.postcode || '',
      placeName: addr.amenity || '',
      city: addr.city || addr.town || 'Recife'
    };
    const localOuRua = addr.amenity || addr.road || "";
    const bairro = addr.suburb || addr.neighbourhood || "";
    const cidade = addr.city || addr.town || "";
    const cep = addr.postcode || "";
    return [localOuRua, bairro, cidade, cep].filter(x => x !== "").join(', ') || data.display_name;
  }

  // ====================
  // CONTROLE DE DRAG DO MARCADOR
  // ====================
  function adicionarDragend(marcador) {
    let ultimaPosicaoValida = marcador.getLatLng();
    marcador.on('dragstart', function () {
      ultimaPosicaoValida = marcador.getLatLng();
    });
    marcador.on('dragend', async function () {
      const {
        lat,
        lng
      } = marcador.getLatLng();
      const dentroDosBounds = lat >= -8.55 && lat <= -7.50 && lng >= -35.20 && lng <= -34.70;
      if (!dentroDosBounds) {
        marcador.setLatLng(ultimaPosicaoValida);
        marcador.bindPopup('Área fora do limite permitido.').openPopup();
        return;
      }
      try {
        marcador.bindPopup('Buscando endereço...').openPopup();
        const enderecoLimpo = await buscaReversa(lat, lng);
        // dadosMarcadorAtual já foi atualizado dentro de buscaReversa
        marcador.bindPopup(`<strong>${enderecoLimpo}</strong>`).openPopup();
        map.setView([lat, lng], map.getZoom());
      } catch (e) {
        console.error(e);
        marcador.bindPopup('Erro ao buscar endereço.').openPopup();
      }
    });
  }

  // ====================
  // GEOLOCALIZAÇÃO DO USUÁRIO
  // ====================
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    userLocation = {
      lat,
      lon
    };
    map.setView([lat, lon], 17, {
      animate: true,
      duration: 1.5
    });
    const userIcon = L.icon({
      iconUrl: '/assets/img/Localization (2).png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
    L.marker([lat, lon], {
      icon: userIcon,
      draggable: true
    }).addTo(map).bindPopup("Você está aqui");
  }, () => {
    map.setView([-8.0631, -34.8710], 16);
  });

  // ====================
  // BUSCA POR TEXTO
  // ====================
  document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    try {
      const viewbox = `-35.20,-7.50,-34.70,-8.55`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&accept-language=pt-BR&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const results = await response.json();
      if (results.length > 0) {
        const res = results[0];
        const addr = res.address || {};
        const localOuRua = addr.amenity || addr.road || addr.information || "";
        const bairro = addr.suburb || addr.neighbourhood || "";
        const cidade = addr.city || addr.town || "";
        const cep = addr.postcode || "";
        const enderecoLimpo = [localOuRua, bairro, cidade, cep].filter(item => item !== "").join(', ') || res.display_name;

        // Atualiza estado global com dados separados da busca
        dadosMarcadorAtual = {
          street: addr.amenity || addr.road || '',
          district: addr.suburb || addr.neighbourhood || '',
          postcode: addr.postcode || '',
          placeName: addr.amenity || '',
          city: addr.city || addr.town || 'Recife'
        };
        if (marcacaoAtual) map.removeLayer(marcacaoAtual);
        marcacaoAtual = L.marker([parseFloat(res.lat), parseFloat(res.lon)], {
          draggable: true
        }).addTo(map).bindPopup(`<strong>${enderecoLimpo}</strong>`).openPopup();
        adicionarDragend(marcacaoAtual);
        map.setView([parseFloat(res.lat), parseFloat(res.lon)], 16);
      } else {
        alert('Local não encontrado na Região Metropolitana do Recife.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao processar a busca.');
    }
  });

  // ====================
  // ENTER PARA BUSCAR
  // ====================
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('searchBtn').click();
  });

  // ====================
  // AUTOCOMPLETE (PHOTON API)
  // ====================
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
        const p = place.properties;
        const enderecoLimpo = [p.name || p.street || "", p.district || p.suburb || "", p.city || "", p.postcode || ""].filter(x => x !== "").join(", ");
        const item = document.createElement("button");
        item.className = "list-group-item list-group-item-action";
        item.textContent = enderecoLimpo;
        item.onclick = () => {
          suggestions.innerHTML = "";
          input.value = enderecoLimpo;
          const lat = place.geometry.coordinates[1];
          const lon = place.geometry.coordinates[0];

          // Atualiza estado global com dados do autocomplete
          dadosMarcadorAtual = {
            street: p.street || p.name || '',
            district: p.district || p.suburb || '',
            postcode: p.postcode || '',
            placeName: p.name || '',
            city: p.city || 'Recife'
          };
          if (marcacaoAtual) map.removeLayer(marcacaoAtual);
          marcacaoAtual = L.marker([lat, lon], {
            draggable: true
          }).addTo(map).bindPopup(`<strong>${enderecoLimpo}</strong>`).openPopup();
          adicionarDragend(marcacaoAtual);
          map.setView([lat, lon], 16);
        };
        suggestions.appendChild(item);
      });
    }, 300);
  });

  // ====================
  // POLÍGONO REAL DA RMR
  // ====================
  const rmrPolygonCoords = [[-8.0500, -35.1500], [-7.8000, -35.0000], [-7.6000, -34.9000], [-7.5500, -34.8000], [-7.7000, -34.7500], [-7.9000, -34.7500], [-8.1000, -34.7800], [-8.2500, -34.8500], [-8.3500, -34.9000], [-8.4000, -35.0000], [-8.3500, -35.1000], [-8.2000, -35.1800], [-8.0500, -35.1500]];

  // Apenas borda verde, sem fill
  L.polygon(rmrPolygonCoords, {
    color: 'green',
    weight: 2,
    fill: false
  }).addTo(map);

  // Escurecimento fora da RMR via polígono com "buraco"
  L.polygon([[[-90, -180], [-90, 180], [90, 180], [90, -180]], rmrPolygonCoords], {
    color: 'transparent',
    fillColor: '#000',
    fillOpacity: 0.25,
    stroke: false
  }).addTo(map);

  // ====================
  // BOTÃO "REGISTRAR OCORRÊNCIA"
  // ====================
  document.getElementById('btnRegistrarOcorrencia').addEventListener('click', () => {
    if (!marcacaoAtual) {
      alert('Busque ou selecione um local antes de registrar ocorrência.');
      return;
    }
    const {
      lat,
      lng
    } = marcacaoAtual.getLatLng();
    const dados = {
      latitude: lat,
      longitude: lng,
      street: dadosMarcadorAtual.street || '',
      district: dadosMarcadorAtual.district || '',
      postcode: dadosMarcadorAtual.postcode || '',
      placeName: dadosMarcadorAtual.placeName || '',
      city: dadosMarcadorAtual.city || 'Recife'
    };
    localStorage.setItem('ocorrenciaTemp', JSON.stringify(dados));
    window.location.href = '/ocorrencias/nova';
  });
});

/***/ }

}]);
//# sourceMappingURL=frontend_modules_map_js.bundle.js.map