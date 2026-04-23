// ====================
// PERSISTÊNCIA DE DADOS DA OCORRÊNCIA
// ====================
export function salvarOcorrenciaTemp(dadosMarcador, lat, lng) {
  const dados = {
    latitude: lat,
    longitude: lng,
    street: dadosMarcador.street || '',
    district: dadosMarcador.district || '',
    postcode: dadosMarcador.postcode || '',
    placeName: dadosMarcador.placeName || '',
    city: dadosMarcador.city || 'Recife',
  };

  localStorage.setItem('ocorrenciaTemp', JSON.stringify(dados));
}
