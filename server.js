require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const routes = require('./routes');
//falta conectar com a base de dados
//falta middlewares principais
const helmet = require('helmet');
const csrf = require('csurf');

const session = require('express-session');
//faltou como salvar no banco as session
const flash = require('connect-flash');


//configuração das sessions



//conexaão com o banco




//ordem dos middlewares

if (process.env.NODE_ENV !== 'development') {
    app.use(helmet());
}
app.use(); //Aqui o das options
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(csrf());
app.use(express.static(path.resolve(__dirname, 'public')));
app.use(flash());
//Por ultimo os middlewares globais

//configs do express
app.set('view', path.resolve(__dirname, 'src', 'views'));
app.set('view egine', 'ejs');

//rotas
app.use(routes);

//middlewares de erro;


//Iniciar servidor
app.listen();