// ====================
// FORMATAÇÃO DE ENDEREÇO A PARTIR DE OBJETO ADDRESS
// ====================
export function formatarEndereco(addr, fallback = '') {
  const localOuRua = addr.amenity || addr.road || addr.information || '';
  const bairro = addr.suburb || addr.neighbourhood || '';
  const cidade = addr.city || addr.town || '';
  const cep = addr.postcode || '';

  return [localOuRua, bairro, cidade, cep]
    .filter(x => x !== '')
    .join(', ') || fallback;
}

// ====================
// EXTRAÇÃO DE DADOS DO MARCADOR A PARTIR DE OBJETO ADDRESS
// ====================
export function extrairDadosMarcador(addr) {
  return {
    street: addr.amenity || addr.road || '',
    district: addr.suburb || addr.neighbourhood || '',
    postcode: addr.postcode || '',
    placeName: addr.amenity || '',
    city: addr.city || addr.town || 'Recife',
  };
}
