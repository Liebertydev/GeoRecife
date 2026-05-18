require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');

const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const { sessionPool } = require('./src/database/pg');
const flash = require('connect-flash');

const routes = require('./routes');

const prisma = require('./src/database/prisma');

const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware
} = require('./src/middlewares/middleware');

const { doubleCsrfProtection } = require('./src/middlewares/csrf');

const isProd = process.env.NODE_ENV === 'production';

// Precisa ser configurado antes do session middleware para que
// express-session detecte HTTPS corretamente atrás de proxy
// (Render, Heroku, nginx) e defina cookies Secure.
app.set('trust proxy', 1);


// ====================
// CONEXÃO COM BANCO
// ====================

async function connectDB() {
  await prisma.$connect();
  console.log('Banco conectado');
}


// ====================
// SEGURANÇA
// ====================

if (process.env.NODE_ENV !== 'development') {
  app.use(helmet());
}


// ====================
// SESSÕES
// ====================

app.use(cookieParser(process.env.SESSION_SECRET));

app.use(
  session({
    store: new pgSession({
      pool: sessionPool, // <-- aqui
      tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd
    }
  })
);


// ====================
// PARSE BODY
// ====================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ====================
// ARQUIVOS ESTÁTICOS
// ====================

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/frontend', express.static(path.resolve(__dirname, 'frontend')));


// ====================
// FLASH MESSAGES
// ====================

app.use(flash());


// ====================
// MIDDLEWARE GLOBAL
// ====================

app.use(middlewareGlobal);


// ====================
// CSRF
// ====================

app.use(doubleCsrfProtection);
app.use(csrfMiddleware);


// ====================
// CONFIGURAÇÃO DO EJS
// ====================

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');


// ====================
// ROTAS
// ====================

app.use(routes);

// ====================
// TRATAR ERRO CSRF
// ====================

app.use(checkCsrfError);


// ====================
// ERRO 404
// ====================

app.use((req, res) => {
  res.status(404).render('404', {
        pageCSS: '/frontend/assets/css/pages/404.css'
      });
});


// ====================
// INICIAR SERVIDOR
// ====================

async function startServer() {
  try {

    await connectDB();

    app.listen(3000, () => {
      console.log('Servidor rodando em http://localhost:3000');
    });

  } catch (error) {

    console.error('Erro ao conectar com o banco:', error);
    process.exit(1);

  }
}

startServer();