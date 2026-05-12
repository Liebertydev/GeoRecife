import { fetchDashboard } from "./apiDashboard";
import { renderCharts } from "./graficos";
import { updateUI } from "./ui";

export function initEvents() {
    const select = document.getElementById('filtroTipo');

    if(!select) return;

    select.addEventListener('change', async (e) => {
        const tipo = e.target.value;

        const data = await fetchDashboard(tipo);
        
        updateUI(data);
        renderCharts(data);
    });
}