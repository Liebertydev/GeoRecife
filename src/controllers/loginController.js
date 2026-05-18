const prisma = require('../database/prisma');
const Login = require('../services/LoginService');

exports.index = (req, res) => {
    res.render('login', { pageCSS: '/frontend/assets/css/pages/auth.css' });
};

exports.register = async (req, res, next) => {
    try {
        const login = new Login(req.body);
        await login.register();
        if (login.errors.length > 0) {
            req.flash('errors', login.errors);
            req.session.save(() => {
                return res.redirect('/');
            });
            return;
        }

        req.flash('success', 'Seu usuário foi criado com sucesso!');
        req.session.save(() => {
            return res.redirect('/');
        });
    } catch (e) {
        console.log(e);
        res.render('404', { pageCSS: '/frontend/assets/css/pages/login.css' });
    }

};


exports.login = async (req, res, next) => {
    try {
        const login = new Login(req.body);
        await login.login();
        if (login.errors.length > 0) {
            req.flash('errors', login.errors);
            req.session.save(() => {
                return res.redirect('/login');
            });
            return;
        }

        const userPayload = {
            id: login.user.id,
            name: login.user.name,
            email: login.user.email
        };

        req.session.regenerate((err) => {
            if (err) return next(err);

            req.session.user = userPayload;
            req.flash('success', 'Login realizado com sucesso');
            req.session.save(() => res.redirect('/'));
        });
    } catch (e) {
        console.log(e);
        res.render('404', { pageCSS: '/frontend/assets/css/pages/login.css' });
    }

};

exports.logout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};