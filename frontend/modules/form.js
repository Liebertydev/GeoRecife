// frontend/modules/occurrences/form.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formOcorrencia');
  if (!form) return;

  const raw = localStorage.getItem('ocorrenciaTemp');

  if (!raw) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning';
    alertDiv.textContent = 'Erro ao importar localização. Preencha manualmente ou tente novamente.';
    form.prepend(alertDiv);
    return;
  }

  try {
    const dados = JSON.parse(raw);

    document.getElementById('f-latitude').value = dados.latitude || '';
    document.getElementById('f-longitude').value = dados.longitude || '';

    document.getElementById('f-street').value = dados.street || '';
    document.getElementById('f-district').value = dados.district || '';
    document.getElementById('f-postcode').value = dados.postcode || '';
    document.getElementById('f-placeName').value = dados.placeName || '';
    document.getElementById('f-city').value = dados.city || 'Recife';

    document.getElementById('f-lat-display').value = dados.latitude || '';
    document.getElementById('f-lng-display').value = dados.longitude || '';

  } catch (e) {
    console.error('Erro ao ler localStorage:', e);
  }

  form.addEventListener('submit', () => {
    localStorage.removeItem('ocorrenciaTemp');
  });
});