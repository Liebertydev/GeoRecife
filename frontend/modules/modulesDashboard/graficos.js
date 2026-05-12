let pizzaChart;
let barraChart;
const coresPorTipo = {
    'crime': '#dc3545',
    'trânsito': '#ffc107',
    'buraco na via': '#6c757d',
    'alagamento': '#007bff',
    'problema de iluminação': '#6610f2',
    'entulho': '#795548',
    'outro': '#20c997'
};

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
                data: valores
            }]
        },
        options: {
            responsive: true
        }
    });
}