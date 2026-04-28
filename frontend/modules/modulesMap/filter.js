export function inicializarFiltro(map, carregarOcorrencias) {
    const btnFilter = document.getElementById('filtrarOcc');

    btnFilter.addEventListener('click', async () => {
        console.log("clicou no botão");

        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

        const tipos = Array.from(checkboxes).map(cb => cb.value);

        console.log("tipos:", tipos);

        let url = '/api/ocorrencias';

        if (tipos.length > 0) {
            url += `?tipos=${tipos.join(",")}`;
        }

        console.log("url:", url);

        carregarOcorrencias(map, url);
    });
}