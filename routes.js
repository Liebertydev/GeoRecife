const express = require('express');
const route = express.Router();

// Controllers
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const registerController = require('./src/controllers/registerController');
const mapController = require('./src/controllers/mapController');
const occurrenceController = require('./src/controllers/occurrenceController'); // <- corrigido

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
route.get('/ocorrencias', occurrenceController.list);
route.get('/ocorrencias/nova', occurrenceController.renderForm);
route.post('/ocorrencias/nova', occurrenceController.create);
route.get('/ocorrencias/:id', occurrenceController.show);
route.get('/ocorrencias/:id/editar', occurrenceController.renderEdit);
route.post('/ocorrencias/:id/editar', occurrenceController.update);

module.exports = route;