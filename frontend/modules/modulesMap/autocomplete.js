import { dentroDosBounds } from './bounds.js';
import { criarMarcador } from './marker.js';
import { buscaReversa } from './geocoding.js';

// ====================
// AUTOCOMPLETE (PHOTON API)
// ====================
export function inicializarAutocomplete(map, state) {
  const input = document.getElementById('searchInput');
  const suggestions = document.getElementById('suggestions');
  let debounceTimer;

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);

    const query = this.value.trim();

    if (query.length < 3) {
      suggestions.innerHTML = '';
      return;
    }

    debounceTimer = setTimeout(async () => {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=4&bbox=-35.20,-8.55,-34.70,-7.50`;

      const res = await fetch(url);
      const data = await res.json();

      suggestions.innerHTML = '';

      data.features.forEach(place => {
        const p = place.properties;

        const enderecoLimpo = [
          p.name || p.street || '',
          p.district || p.suburb || '',
          p.city || '',
          p.postcode || '',
        ].filter(x => x !== '').join(', ');

        const item = document.createElement('button');
        item.className = 'list-group-item list-group-item-action';
        item.textContent = enderecoLimpo;

        item.onclick = () => {
          suggestions.innerHTML = '';
          input.value = enderecoLimpo;

          const lat = place.geometry.coordinates[1];
          const lon = place.geometry.coordinates[0];

          if (!dentroDosBounds(lat, lon)) {
            alert('Local fora da Região Metropolitana do Recife.');
            return;
          }

          state.dadosMarcadorAtual = {
            street: p.street || p.name || '',
            district: p.district || p.suburb || '',
            postcode: p.postcode || '',
            placeName: p.name || '',
            city: p.city || 'Recife',
          };

          if (state.marcacaoAtual) map.removeLayer(state.marcacaoAtual);

          state.marcacaoAtual = criarMarcador(
            map,
            lat,
            lon,
            enderecoLimpo,
            async (latDrag, lngDrag) => {
              const result = await buscaReversa(latDrag, lngDrag);
              state.dadosMarcadorAtual = result.dadosMarcador;
              return result;
            }
          );

          map.setView([lat, lon], 16);
        };

        suggestions.appendChild(item);
      });
    }, 300);
  });
}
