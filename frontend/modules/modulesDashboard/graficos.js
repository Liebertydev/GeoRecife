let pizzaChart;
let barraChart;

// Paleta alinhada com os tokens do projeto (variables.css).
// As chaves precisam bater com os `value` em src/constants/occurrenceTypes.js
// (sem acentos, formato curto) — qualquer divergência cai no cinza padrão.
export const coresPorTipo = {
    crime:      '#ef4444',  // red-500 (--red)
    transito:   '#f59e0b',  // amber-500
    buraco:     '#64748b',  // slate-500 (--ink-muted)
    alagamento: '#0ea5e9',  // sky-500
    iluminacao: '#8b5cf6',  // violet-500
    entulho:    '#a16207',  // yellow-700
    outro:      '#16a34a'   // emerald-600 (--green)
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

    // Mostra apenas o top 10 — ranking horizontal fica ilegível com 20+ bairros.
    const top = [...dados]
        .sort((a, b) => (b._count.district ?? 0) - (a._count.district ?? 0))
        .slice(0, 10);

    const labels  = top.map(item => item.district);
    const valores = top.map(item => item._count.district);

    if (barraChart) barraChart.destroy();

    barraChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ocorrências',
                data: valores,
                backgroundColor: '#16a34a',           // emerald-600 (--green)
                hoverBackgroundColor: '#15803d',     // emerald-700 (--green-dark)
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.8,
                categoryPercentage: 0.85
            }]
        },
        options: {
            indexAxis: 'y',                          // barras horizontais
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700, easing: 'easeOutCubic' },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9',            // --border-light
                        drawBorder: false
                    },
                    border: { display: false },
                    ticks: {
                        precision: 0,                // sem casas decimais
                        font: {
                            size: 11,
                            family: "'DM Sans', system-ui, sans-serif"
                        },
                        color: '#94a3b8'             // --ink-faint
                    }
                },
                y: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'DM Sans', system-ui, sans-serif",
                            weight: '500'
                        },
                        color: '#334155'             // --ink-mid
                    }
                }
            },
            plugins: {
                legend: { display: false },           // 1 dataset → desnecessário
                tooltip: {
                    ...TOOLTIP_OPTS,
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.x} ocorrência${ctx.parsed.x === 1 ? '' : 's'}`
                    }
                }
            }
        }
    });
}
