module.exports.middlewareGlobal = (req, res, next) => {
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    res.locals.pageCSS = null;
    res.locals.user = req.session.user;
    next();
};

module.exports.checkCsrfError = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).send('CSRF inválido');
    }

    next(err);
};


exports.csrfMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};



exports.loginRequired = (req, res, next) => {
    if (!req.session.user) {
        req.flash('Você precisa fazer login.');

        req.session.save(() => {
            res.redirect('/');
        });
        
        return;
    }

    next();
}

