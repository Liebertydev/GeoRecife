require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');

const helmet = require('helmet');
const csrf = require('csurf');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const pool = require('./src/database/pg');
const flash = require('connect-flash');

const routes = require('./routes');

const prisma = require('./src/database/prisma');

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
      pool: pool,
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

// ====================
// FLASH MESSAGES
// ====================

app.use(flash());

// ====================
// CSRF
// ====================

app.use(csrf());

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
// ERRO GLOBAL
// ====================

// Erro 404
app.use((req, res) => {
    res.status(404).render('404');
});



app.use((err, req, res, next) => {

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Token CSRF inválido');
  }

  console.error(err);

  res.status(500).send('Erro interno do servidor');

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