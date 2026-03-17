exports.showMap = (req, res, next) => {
    res.render('mapa', { pageCSS: '/assets/css/mapa.css' });
};