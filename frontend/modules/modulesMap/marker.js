import { dentroDosBounds } from './bounds.js';

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
      marcador.bindPopup(`<strong>${enderecoLimpo}</strong>`).openPopup();
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
export function criarMarcador(map, lat, lon, popupText, onEnderecoAtualizado) {
  const marcador = L.marker([lat, lon], { draggable: true })
    .addTo(map)
    .bindPopup(`<strong>${popupText}</strong>`)
    .openPopup();

  adicionarDragend(marcador, map, onEnderecoAtualizado);
  return marcador;
}
