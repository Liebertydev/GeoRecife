import { fetchDashboard } from "./apiDashboard";
import { updateUI } from "./ui";
import { initEvents } from "./event";
import { renderCharts } from "./graficos";
import { renderMiniMap } from "./miniMap";

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchDashboard();

    updateUI(data);
    renderCharts(data);
    if (data) renderMiniMap(data.recent);
    initEvents();
});