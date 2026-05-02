const express = require('express');
const route = express.Router();

const { loginRequired } = require('./src/middlewares/middleware');

// Controllers
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const registerController = require('./src/controllers/registerController');
const mapController = require('./src/controllers/mapController');
const occurrenceController = require('./src/controllers/occurrenceController');
const dashboardController = require('./src/controllers/dashboardController');

// Rotas da Home
route.get('/', homeController.index);

// Rotas de Login/Registro/Logout
route.get('/login', loginController.index);
route.get('/register', registerController.index);
route.post('/login/login', loginController.login);
route.post('/login/register', loginController.register);
route.get('/logout', loginController.logout)

// Rotas do Mapa
route.get('/mapa', mapController.showMap);

// Rotas de Ocorrências

//Renderiza a lista de ocorrências:
route.get('/ocorrencias', occurrenceController.list); 
//Renderiza o formulario de registrar ocorrencias
route.get('/ocorrencias/nova', loginRequired, occurrenceController.renderForm);
//Cria Uma nova ocorrencia
route.post('/ocorrencias/nova', loginRequired, occurrenceController.create);
//Mostra os detalhes de uma ocorrencia
route.get('/ocorrencias/:id', occurrenceController.show);
//Renderiza a pagina de editar a occorrencia
route.get('/ocorrencias/:id/editar', loginRequired, occurrenceController.renderEdit);
//Edita a occorrencia
route.post('/ocorrencias/:id/editar', loginRequired, occurrenceController.update);
//rederiza as occorrencias no mapa
route.get('/api/ocorrencias', occurrenceController.apiList);


//Rotas do dashboard
route.get('/dashboard', dashboardController.renderDashboard);
route.get('api/dashboard', dashboardController.getDashboard);

module.exports = route;