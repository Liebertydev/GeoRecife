let pizzaChart;
let barraChart;

// Paleta alinhada com os tokens do projeto (variables.css).
// Emerald-600 (#16a34a) é a cor primária; demais cores ficam em tons
// distintos para legibilidade nos gráficos sem brigar com o verde.
const coresPorTipo = {
    'crime':                  '#ef4444',  // red-500 (--red)
    'trânsito':               '#f59e0b',  // amber-500
    'buraco na via':          '#64748b',  // slate-500 (--ink-muted)
    'alagamento':             '#0ea5e9',  // sky-500
    'problema de iluminação': '#8b5cf6',  // violet-500
    'entulho':                '#a16207',  // yellow-700
    'outro':                  '#16a34a'   // emerald-600 (--green)
};

const LEGEND_OPTS = {
    position: 'bottom',
    labels: {
        padding: 14,
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
            size: 11,
            family: "'DM Sans', system-ui, sans-serif",
            weight: '500'
        },
        color: '#475569'                  // slate-600
    }
};

const TOOLTIP_OPTS = {
    backgroundColor: '#0f172a',           // --ink (slate-900)
    titleFont: { size: 12, weight: '600', family: "'DM Sans', sans-serif" },
    bodyFont:  { size: 12,               family: "'DM Sans', sans-serif" },
    padding: 10,
    cornerRadius: 6,
    displayColors: true,
    boxPadding: 4
};

export function renderCharts(data) {
    if (!data) return;

    renderPizza(data.porTipo);
    renderBarra(data.porBairro);
}

function renderPizza(dados) {
    const ctx = document.getElementById('graficoPizza');
    if (!ctx) return;

    const labels  = dados.map(item => item.type);
    const valores = dados.map(item => item._count.type);

    if (pizzaChart) pizzaChart.destroy();

    pizzaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Ocorrências por tipo',
                data: valores,
                backgroundColor: dados.map(item =>
                    coresPorTipo[item.type] || '#94a3b8'
                ),
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',                /* arcos visivelmente grossos */
            animation: { duration: 700, easing: 'easeOutCubic' },
            plugins: {
                legend: LEGEND_OPTS,
                tooltip: TOOLTIP_OPTS
            }
        }
    });
}

function renderBarra(dados) {
    const ctx = document.getElementById('graficoBarra');
    if (!ctx) return;

    const labels  = dados.map(item => item.district);
    const valores = dados.map(item => item._count.district);

    if (barraChart) barraChart.destroy();

    // Escala HSL em torno do verde do projeto — primeiro slice mais intenso,
    // os demais ficam progressivamente mais claros.
    const cores = labels.map((_, i) =>
        `hsl(152, 58%, ${Math.max(30, 60 - i * 5)}%)`
    );

    barraChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Ocorrências por bairro',
                data: valores,
                backgroundColor: cores,
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            animation: { duration: 700, easing: 'easeOutCubic' },
            plugins: {
                legend: LEGEND_OPTS,
                tooltip: TOOLTIP_OPTS
            }
        }
    });
}
