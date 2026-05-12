export function updateUI(data) {
    if(!data) return;

    document.getElementById('totalOcorrencias').innerText = data.total;

    document.getElementById('topTipo').innerText = data.tipoMaisComum?.type || 'sem dados';

    document.getElementById('topBairro').innerText = data.bairroDestaque?.district || 'sem dados';
}