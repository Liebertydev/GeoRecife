const dashboard = require('../services/DashboardService');


exports.renderDashboard = (req, res) => {
    res.render('dashboard', { pageCSS: '/frontend/assets/css/dashboard.css' });
}


exports.getDashboard = async (req, res) => {
    try {
        const tipo = req.query.tipo;
        const [
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroDestaque
        ] = await Promisse.all([
            dashboardService.getPorTipo(),
            dashboardService.getPorBairro(tipo),
            dashboardService.getTotal(),
            dashboardService.getTipoMaisComum(),
            dashboardService.getBairroTop()
        ]);

        res.json({
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroTop
        });

    } catch (e) {
        console.log(e);
    }
}