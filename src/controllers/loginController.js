const prisma = require('../database/prisma');
const Login = require('../services/LoginService');

// src/controllers/homeController.js
exports.index = (req, res) => {
    res.render('login', { pageCSS: '/assets/css/login.css' });
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

        req.flash('sucsess', 'Seu usuário foi criado com sucesso!');
        req.session.save(() => {
            return res.redirect('/');
        });
    } catch (e) {
        console.log(e);
        res.render('404');
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

        req.flash('sucsess', 'Login realizado com sucesso');
        req.session.save(() => {
            return res.redirect('/');
        });
    } catch (e) {
        console.log(e);
        res.render('404');
    }

};