const dashboard = require('../services/DashboardService');

exports.renderDashboard = (req, res) => {
    res.render('dashboard', { pageCSS: '/frontend/assets/css/pages/dashboard.css' });
}


exports.getDashboard = async (req, res) => {
    try {
        const tipo = req.query.tipo || 'todos';

        const [
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroDestaque
        ] = await Promise.all([
            dashboard.getForType(),
            dashboard.getForDistrict(tipo),
            dashboard.getAllOccurrence(),
            dashboard.getCommonType(),
            dashboard.getDistrictTop()
        ]);

        res.json({
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroDestaque
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao carregar o dashboard.' });
    }
}