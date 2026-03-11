// module.exports.middlewareGlobal = (req, res, next) => {
//     res.locals.errors = req.flash('errors');
//     res.locals.success = req.flash('success');
//     res.locals.user = req.session.user;
//     next();
// };

module.exports.checkCsrfError = (err, req, res, next) => {
    if (err /*&& err.code === 'EBADCSRFTOKEN'*/) {
        return res.render('404');
    }

    next(err);
};


exports.csrfMiddleware = (req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
};


// exports.loginRequired = (req, res, next) => {
//     if(!req.session.user) {
//         req.flash('errors', 'Você precisa fazer Login');
//         req.session.save(() => {
//             res.redirect('/');
//         });
//         return;
//     } //se não rodar o if = usuario está logado

//     next();
// };