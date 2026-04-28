import { criarMarcadorOcc } from "./marker";

let marcadores = []; // 👈 guarda todos os markers

export async function carregarOcorrencias(map, url = '/api/ocorrencias') {

    // 🔥 LIMPA os markers antigos
    marcadores.forEach(marker => {
        map.removeLayer(marker);
    });

    marcadores = [];

    try {
        const res = await fetch(url);
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

            marcadores.push(marcador); // 👈 salva
        });

    } catch(e) {
        console.error('Erro ao carregar ocorrências:', e)
    }
}