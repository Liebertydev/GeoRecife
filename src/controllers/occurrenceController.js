// src/controllers/occurrenceController.js

const prisma = require('../database/prisma');
const OccurrenceService = require('../services/OccurrenceService');

// ====================
// RENDERIZA FORMULÁRIO DE NOVA OCORRÊNCIA
// ====================
exports.renderForm = (req, res) => {
  // res.redirect não funciona aqui pois já ESTAMOS nessa rota.
  // O redirect foi feito no frontend via window.location.href
  // (explicação completa na seção do map.js)
  res.render('form', {
    pageCSS: '/frontend/assets/css/occurrences.css',
    errors: req.flash('errors'),
    success: req.flash('success'),
  });
};

// ====================
// CRIA OCORRÊNCIA
// ====================
exports.create = async (req, res) => {
  try {

    console.log('SESSION:', req.session);
    console.log('USER:', req.session.user);

    const userId = req.session.user ? req.session.user.id : null;
    const service = new OccurrenceService(req.body, userId);
    await service.create();

    if (service.errors.length > 0) {
      req.flash('errors', service.errors);
      req.session.save(() => res.redirect('/ocorrencias/nova'));
      return;
    }

    req.flash('success', 'Ocorrência registrada com sucesso!');
    req.session.save(() => res.redirect('/ocorrencias'));
  } catch (e) {
    console.error(e);
    res.render('404');
  }
};

// ====================
// LISTAGEM
// ====================
exports.list = async (req, res) => {
  try {
    const occurrences = await prisma.occurrence.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true }, // puxa nome do autor junto
    });

    res.render('list', {
      pageCSS: '/assets/css/occurrences.css',
      occurrences,
      currentUserId: req.session.user ? req.session.user.id : null,
      success: req.flash('success'),
    });
  } catch (e) {
    console.error(e);
    res.render('404');
  }
};

// ====================
// DETALHES
// ====================
exports.show = async (req, res) => {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { user: true },
    });

    if (!occurrence) return res.render('404');

    const isAuthor =
      req.session.user && req.session.user.id === occurrence.userId;

    res.render('show', {
      pageCSS: '/assets/css/occurrences.css',
      occurrence,
      isAuthor,
    });
  } catch (e) {
    console.error(e);
    res.render('404');
  }
};

// ====================
// RENDERIZA FORMULÁRIO DE EDIÇÃO
// ====================
exports.renderEdit = async (req, res) => {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!occurrence) return res.render('404');

    // Controle de autoria: só o dono pode editar
    // req.session.user.id é o id salvo na sessão no momento do login
    // occurrence.userId é o id gravado no banco quando a ocorrência foi criada
    // Se forem diferentes, o usuário atual não é o autor — bloqueamos aqui
    if (!req.session.user || req.session.user.id !== occurrence.userId) {
      req.flash('errors', ['Você não tem permissão para editar esta ocorrência.']);
      req.session.save(() => res.redirect('/ocorrencias'));
      return;
    }

    res.render('edit', {
      pageCSS: '/assets/css/occurrences.css',
      occurrence,
      errors: req.flash('errors'),
    });
  } catch (e) {
    console.error(e);
    res.render('404');
  }
};

// ====================
// ATUALIZA
// ====================
exports.update = async (req, res) => {
  try {
    const occurrence = await prisma.occurrence.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!occurrence) return res.render('404');

    // Segunda verificação de autoria no POST
    // Necessário porque alguém poderia fazer uma requisição POST direta
    // sem passar pela página de edição (ex: via curl ou Postman)
    if (!req.session.user || req.session.user.id !== occurrence.userId) {
      req.flash('errors', ['Acesso negado.']);
      req.session.save(() => res.redirect('/ocorrencias'));
      return;
    }

    const service = new OccurrenceService(req.body, req.session.user.id);
    await service.update(req.params.id);

    if (service.errors.length > 0) {
      req.flash('errors', service.errors);
      req.session.save(() => res.redirect(`/ocorrencias/${req.params.id}/editar`));
      return;
    }

    req.flash('success', 'Ocorrência atualizada com sucesso!');
    req.session.save(() => res.redirect(`/ocorrencias/${req.params.id}`));
  } catch (e) {
    console.error(e);
    res.render('404');
  }
};

exports.apiList = async (req, res) => {
  try {
    const ocorrencias = await OccurrenceService.listarTodas();
    res.json(ocorrencias);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar ocorrências" });
  }
}