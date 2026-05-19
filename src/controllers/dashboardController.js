const dashboard = require('../services/DashboardService');

exports.renderDashboard = (req, res) => {
    res.render('dashboard', { pageCSS: '/frontend/assets/css/pages/dashboard.css' });
}

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

exports.getDashboard = async (req, res) => {
    try {
        const tipo = req.query.tipo || 'todos';

        // ── Janelas de tempo ────────────────────────────
        // Diária: hoje (0h) → amanhã (0h)  vs  ontem (0h) → hoje (0h)
        // Semanal: rolling 7 dias  vs  7 dias anteriores
        const now            = new Date();
        const startToday     = startOfToday();
        const startTomorrow  = new Date(startToday);
        startTomorrow.setDate(startTomorrow.getDate() + 1);
        const startYesterday = new Date(startToday);
        startYesterday.setDate(startYesterday.getDate() - 1);

        const startWeek      = new Date(now);
        startWeek.setDate(startWeek.getDate() - 7);
        const startPrevWeek  = new Date(now);
        startPrevWeek.setDate(startPrevWeek.getDate() - 14);

        const [
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroDestaque,
            recent,
            todayCount,
            yesterdayCount,
            weekCount,
            prevWeekCount
        ] = await Promise.all([
            dashboard.getForType(),
            dashboard.getForDistrict(tipo),
            dashboard.getAllOccurrence(),
            dashboard.getCommonType(),
            dashboard.getDistrictTop(),
            dashboard.getRecent(8),
            dashboard.getCountBetween(startToday, startTomorrow),
            dashboard.getCountBetween(startYesterday, startToday),
            dashboard.getCountBetween(startWeek, now),
            dashboard.getCountBetween(startPrevWeek, startWeek)
        ]);

        res.json({
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroDestaque,
            recent,
            trend: {
                today:     todayCount,
                yesterday: yesterdayCount,
                thisWeek:  weekCount,
                lastWeek:  prevWeekCount
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao carregar o dashboard.' });
    }
}
