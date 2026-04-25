import { inicializarMapa, renderizarPoligonoRMR } from './map.js';
import { obterGeolocalizacao } from './geolocation.js';
import { inicializarBusca } from './search.js';
import { inicializarAutocomplete } from './autocomplete.js';
import { salvarOcorrenciaTemp } from './storage.js';
import { carregarOcorrencias } from './occurrences.js';

document.addEventListener('DOMContentLoaded', async function () {

  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  const state = {
    marcacaoAtual: null,
    userLocation: null,
    dadosMarcadorAtual: {},
  };

  const map = inicializarMapa('map');
  renderizarPoligonoRMR(map);

  // 🔥 GEOLOCALIZAÇÃO (AGORA COM ASYNC/AWAIT)
  try {
    const { lat, lon } = await obterGeolocalizacao(map);
    state.userLocation = { lat, lon };
  } catch (e) {
    console.error('Erro ao obter localização:', e);
  }

  carregarOcorrencias(map);
  inicializarBusca(map, state);
  inicializarAutocomplete(map, state);

  const btnRegistrar = document.getElementById('btnRegistrarOcorrencia');
  btnRegistrar.setAttribute('type', 'button');

  btnRegistrar.addEventListener('click', () => {
    if (!state.marcacaoAtual) {
      alert('Busque ou selecione um local antes de registrar ocorrência.');
      return;
    }

    const { lat, lng } = state.marcacaoAtual.getLatLng();
    salvarOcorrenciaTemp(state.dadosMarcadorAtual, lat, lng);
    window.location.href = '/ocorrencias/nova';
  });

});

