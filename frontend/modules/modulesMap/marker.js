import { dentroDosBounds } from './bounds.js';
import { corDaCategoria } from './categoryColors.js';

function criarIconePorTipo(tipo) {
  const cor = corDaCategoria(tipo);
  const html = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
      <path d="M14 1C6.82 1 1 6.82 1 14c0 9.4 13 21 13 21s13-11.6 13-21C27 6.82 21.18 1 14 1z"
            fill="${cor}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="14" cy="14" r="4.5" fill="#ffffff"/>
    </svg>`;

  return L.divIcon({
    html,
    className: `map-pin map-pin--${tipo || 'outro'}`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -28],
  });
}

function popupStrong(text) {
  const el = document.createElement('strong');
  el.textContent = text == null ? '' : String(text);
  return el;
}

function tooltipText(text) {
  const el = document.createElement('span');
  el.textContent = text == null ? '' : String(text);
  return el;
}

// ====================
// CONTROLE DE DRAG DO MARCADOR
// ====================
export function adicionarDragend(marcador, map, onEnderecoAtualizado) {
  let ultimaPosicaoValida = marcador.getLatLng();

  marcador.on('dragstart', function () {
    ultimaPosicaoValida = marcador.getLatLng();
  });

  marcador.on('dragend', async function () {
    const { lat, lng } = marcador.getLatLng();

    if (!dentroDosBounds(lat, lng)) {
      marcador.setLatLng(ultimaPosicaoValida);
      marcador.bindPopup('Área fora do limite permitido.').openPopup();
      return;
    }

    try {
      marcador.bindPopup('Buscando endereço...').openPopup();
      const { enderecoLimpo, dadosMarcador } = await onEnderecoAtualizado(lat, lng);
      marcador.bindPopup(popupStrong(enderecoLimpo)).openPopup();
      map.setView([lat, lng], map.getZoom());
    } catch (e) {
      console.error(e);
      marcador.bindPopup('Erro ao buscar endereço.').openPopup();
    }
  });
}

// ====================
// CRIAÇÃO DE MARCADOR PADRÃO (ARRASTÁVEL)
// ====================
export function criarMarcador(map, lat, lon, popupText, onEnderecoAtualizado = null) {
  const marcador = L.marker([lat, lon], { draggable: true })
    .addTo(map)
    .bindPopup(popupStrong(popupText))
    .openPopup();

  adicionarDragend(marcador, map, onEnderecoAtualizado);
  return marcador;
}


export function criarMarcadorOcc(map, lat, lon, popupText, tipo) {
  const icon = criarIconePorTipo(tipo);
  return L.marker([lat, lon], { icon })
    .addTo(map)
    .bindPopup(popupStrong(popupText))
    .bindTooltip(tooltipText(popupText), {
      permanent: true,
      direction: 'top',
      offset: [0, 0]
    });
}