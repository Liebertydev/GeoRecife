import { criarMarcadorOcc } from "./marker";

export async function carregarOcorrencias(map) {
    try {
        const res = await fetch('/api/ocorrencias');
        const ocorrencias = await res.json();

        ocorrencias.forEach(occ => {
            const marcador = criarMarcadorOcc(
                map,
                occ.latitude,
                occ.longitude,
                occ.placeName || occ.street
            );

            marcador.on('click', () => {
                window.location.href = `/ocorrencias/${occ.id}`;
            });
        });
    } catch(e) {
        console.error('Erro ao carregar ocorrências:', e)
    }
}