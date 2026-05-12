exports.showMap = (req, res, next) => {
    res.render('mapa', { pageCSS: '/frontend/assets/css/pages/mapa.css' });
};