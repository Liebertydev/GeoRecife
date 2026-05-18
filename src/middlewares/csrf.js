const { doubleCsrf } = require('csrf-csrf');

const isProd = process.env.NODE_ENV === 'production';

const {
    doubleCsrfProtection,
    generateCsrfToken,
    invalidCsrfTokenError,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    getSessionIdentifier: (req) => req.sessionID || '',
    cookieName: isProd ? '__Host-csrf' : 'csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
    },
    size: 64,
    getCsrfTokenFromRequest: (req) =>
        (req.body && req.body._csrf) || req.headers['x-csrf-token'],
});

module.exports = {
    doubleCsrfProtection,
    generateCsrfToken,
    invalidCsrfTokenError,
};
