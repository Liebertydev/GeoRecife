const rateLimit = require('express-rate-limit');

// Limita tentativas por IP. Conta todas as requisições (sucesso ou falha)
// porque o controller responde com redirect 302 em ambos os casos, então
// `skipSuccessfulRequests` não conseguiria distinguir.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('errors', ['Muitas tentativas de login. Tente novamente em alguns minutos.']);
        req.session.save(() => res.redirect('/login'));
    },
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('errors', ['Muitas tentativas de cadastro. Tente novamente em uma hora.']);
        req.session.save(() => res.redirect('/register'));
    },
});

module.exports = { loginLimiter, registerLimiter };
