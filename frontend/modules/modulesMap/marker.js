import { dentroDosBounds } from './bounds.js';

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


export function criarMarcadorOcc(map, lat, lon, popupText) {
  return L.marker([lat, lon])
    .addTo(map)
    .bindPopup(popupStrong(popupText))
    .bindTooltip(tooltipText(popupText), {
      permanent: true,
      direction: 'top',
      offset: [0, -10]
    });
}