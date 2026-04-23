import { dentroDosBounds } from './bounds.js';
import { formatarEndereco, extrairDadosMarcador } from './utils.js';
import { criarMarcador } from './marker.js';
import { buscaReversa } from './geocoding.js';

// ====================
// BUSCA POR TEXTO (NOMINATIM)
// ====================
export function inicializarBusca(map, state) {
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

        const enderecoLimpo = formatarEndereco(addr, res.display_name);
        const lat = parseFloat(res.lat);
        const lon = parseFloat(res.lon);

        if (!dentroDosBounds(lat, lon)) {
          alert('Local fora da Região Metropolitana do Recife.');
          return;
        }

        state.dadosMarcadorAtual = extrairDadosMarcador(addr);

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
}
