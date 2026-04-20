exports.index = (req, res) => {
    res.render('index', { pageCSS: '/frontend/assets/css/home.css' });
};