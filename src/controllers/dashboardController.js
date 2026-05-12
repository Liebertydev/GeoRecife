const dashboard = require('../services/DashboardService');

exports.renderDashboard = (req, res) => {
    res.render('dashboard', { pageCSS: '/frontend/assets/css/pages/dashboard.css' });
}


exports.getDashboard = async (req, res) => {
    try {
        const tipo = req.query.tipo;
        if(!tipo) tipo = 'todos';
        
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
        console.log(e);
    }
}