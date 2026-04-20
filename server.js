require('dotenv').config();
console.log('URL:', process.env.DATABASE_URL);

const express = require('express');
const app = express();
const path = require('path');

const helmet = require('helmet');
const csrf = require('csurf');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const pool = require('./src/database/pg');
const { sessionPool } = require('./src/database/pg');
const flash = require('connect-flash');

const routes = require('./routes');

const prisma = require('./src/database/prisma');

const {
  middlewareGlobal,
  checkCsrfError,
  csrfMiddleware
} = require('./src/middlewares/middleware');


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
      secure: false
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

app.use(csrf());
app.use(csrfMiddleware);


// ====================
// CONFIGURAÇÃO DO EJS
// ====================

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);


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
  res.status(404).render('404');
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