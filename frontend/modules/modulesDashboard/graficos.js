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
    'entulho':                '#a16207',  // yellow-700 (entulho marrom)
    'outro':                  '#16a34a'   // emerald-600 (--green)
};

const BAR_COLOR = '#16a34a';        // emerald-600 (--green)
const BAR_COLOR_BORDER = '#15803d'; // emerald-700 (--green-dark)

export function renderCharts(data) {
    if (!data) return;

    renderPizza(data.porTipo);
    renderBarra(data.porBairro);
}

function renderPizza(dados) {
    const ctx = document.getElementById('graficoPizza');
    if (!ctx) return;

    const labels = dados.map(item => item.type);
    const valores = dados.map(item => item._count.type);

    if (pizzaChart) pizzaChart.destroy();

    pizzaChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Ocorrências por Tipo',
                data: valores,
                backgroundColor: dados.map(item =>
                    coresPorTipo[item.type] || '#999999'
                ),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function renderBarra(dados) {
    const ctx = document.getElementById('graficoBarra');
    if (!ctx) return;

    const labels = dados.map(item => item.district);
    const valores = dados.map(item => item._count.district);

    if (barraChart) barraChart.destroy();

    barraChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Ocorrências por Bairro',
                data: valores,
                backgroundColor: labels.map((_, i) =>
                    `hsl(152, 60%, ${Math.max(28, 62 - i * 6)}%)`
                ),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true
        }
    });
}