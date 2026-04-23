import { formatarEndereco, extrairDadosMarcador } from './utils.js';

// ====================
// BUSCA REVERSA (LAT/LNG → ENDEREÇO)
// ====================
export async function buscaReversa(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&accept-language=pt-BR&lat=${lat}&lon=${lng}`;

  const response = await fetch(url);
  const data = await response.json();
  const addr = data.address || {};

  const enderecoLimpo = formatarEndereco(addr, data.display_name);
  const dadosMarcador = extrairDadosMarcador(addr);

  return { enderecoLimpo, dadosMarcador };
}
