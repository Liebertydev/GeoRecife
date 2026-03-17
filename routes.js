const express = require('express');
const route = express.Router();

// Controllers
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const registerController = require('./src/controllers/registerController');
// Futuramente: const mapController = require('./src/controllers/mapController');
// Futuramente: const occurrenceController = require('./src/controllers/occurrenceController');


// Rotas da Home

route.get('/', homeController.index);


// Rotas de Autenticação (Login / Registro)

// Mostrar páginas
route.get('/login', loginController.index);       // renderiza login
route.get('/register', registerController.index); // renderiza register

// Enviar formulários
route.post('/login/login', loginController.login);         // processa login
route.post('/login/register', loginController.register);   // processa registro


// Rotas do Mapa

// route.get('/mapa', mapController.showMap);

// ========================
// Rotas de Ocorrências
// ========================
// route.get('/ocorrencias', occurrenceController.listOccurrences);
// route.get('/ocorrencia/:id', occurrenceController.showOccurrence);

module.exports = route;