const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
//importar controllers


//Rotas da home

route.get('/', homeController.index);

//Rota de login
// route.get('/login/index');
// route.get('/register/index');
// route.get('/mapa');

// route.post('/login/login');
// route.post('/register/register');

//Rotas de ocorrencias



module.exports = route;