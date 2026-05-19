// src/controllers/occurrenceController.js

const prisma = require('../database/prisma');
const OccurrenceService = require('../services/OccurrenceService');
const {
  OCCURRENCE_TYPES,
  OCCURRENCE_SEVERITIES,
  severityOf,
  labelOfType,
} = require('../constants/occurrenceTypes');

// ====================
// RENDERIZA FORMULÁRIO DE NOVA OCORRÊNCIA
// ====================
exports.renderForm = (req, res) => {
  // res.redirect não funciona aqui pois já ESTAMOS nessa rota.
  // O redirect foi feito no frontend via window.location.href
  // (explicação completa na seção do map.js)
  res.render('form', {
    pageCSS: '/frontend/assets/css/pages/form_occ.css'
  });
};

// ====================
// CRIA OCORRÊNCIA
// ====================
exports.create = async (req, res) => {
  try {
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
    res.render('404', {
      pageCSS: '/frontend/assets/css/pages/404.css'
    });
  }
};

// ====================
// LISTAGEM
// ====================

exports.list = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);

    const filters = {
      q:        typeof req.query.q === 'string' ? req.query.q : '',
      type:     typeof req.query.type === 'string' ? req.query.type : '',
      severity: typeof req.query.severity === 'string' ? req.query.severity : '',
      sort:     typeof req.query.sort === 'string' ? req.query.sort : 'recent',
    };

    const [{ occurrences, hasMore }, summary] = await Promise.all([
      OccurrenceService.listarPaginado(page, filters),
      OccurrenceService.contarResumo(filters),
    ]);

    res.render('list', {
      pageCSS: '/frontend/assets/css/pages/list_occ.css',
      occurrences,
      hasMore,
      currentUserId: req.session.user ? req.session.user.id : null,
      currentPage: page,
      filters,
      summary,
      occurrenceTypes: OCCURRENCE_TYPES,
      occurrenceSeverities: OCCURRENCE_SEVERITIES,
      severityOf,
      labelOfType,
    });

  } catch (e) {
    console.error(e);

    res.render('404', {
      pageCSS: '/frontend/assets/css/pages/404.css'
    });
  }
};

// ====================
// DETALHES
// ====================
exports.show = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return res.status(404).render('404', { pageCSS: '/frontend/assets/css/pages/404.css' });
    }

    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!occurrence) {
      return res.render('404', { pageCSS: '/frontend/assets/css/pages/login.css' });
    } 

    const isAuthor =
      req.session.user && req.session.user.id === occurrence.userId;

    res.render('show', {
      pageCSS: '/frontend/assets/css/pages/show_occ.css',
      occurrence,
      isAuthor,
    });
  } catch (e) {
    console.error(e);
    res.render('404', {
      pageCSS: '/frontend/assets/css/pages/404.css'
    });
  }
};

// ====================
// RENDERIZA FORMULÁRIO DE EDIÇÃO
// ====================
exports.renderEdit = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return res.status(404).render('404', { pageCSS: '/frontend/assets/css/pages/404.css' });
    }

    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
    });

    if (!occurrence) {
      return res.render('404', { pageCSS: '/frontend/assets/css/pages/login.css' });
    }
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
      pageCSS: '/frontend/assets/css/pages/form_occ.css',
      occurrence,
    });
  } catch (e) {
    console.error(e);
    res.render('404', {
      pageCSS: '/frontend/assets/css/pages/404.css'
    });
  }
};

// ====================
// ATUALIZA
// ====================
exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return res.status(404).render('404', { pageCSS: '/frontend/assets/css/pages/404.css' });
    }

    const occurrence = await prisma.occurrence.findUnique({
      where: { id },
    });

    if (!occurrence) {
      return res.render('404', {
        pageCSS: '/frontend/assets/css/pages/404.css'
      });
    }

    // Segunda verificação de autoria no POST
    // Necessário porque alguém poderia fazer uma requisição POST direta
    // sem passar pela página de edição (ex: via curl ou Postman)
    if (!req.session.user || req.session.user.id !== occurrence.userId) {
      req.flash('errors', ['Acesso negado.']);
      req.session.save(() => res.redirect('/ocorrencias'));
      return;
    }

    const service = new OccurrenceService(req.body, req.session.user.id);
    await service.update(id);

    if (service.errors.length > 0) {
      req.flash('errors', service.errors);
      req.session.save(() => res.redirect(`/ocorrencias/${id}/editar`));
      return;
    }

    req.flash('success', 'Ocorrência atualizada com sucesso!');
    req.session.save(() => res.redirect(`/ocorrencias/${id}`));
  } catch (e) {
    console.error(e);
    res.render('404', {
      pageCSS: '/frontend/assets/css/pages/404.css'
    });
  }
};

exports.apiList = async (req, res) => {
  try {
    const tipos = req.query.tipos;

    const ocorrencias = await OccurrenceService.listarTodas(tipos);

    res.json(ocorrencias);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar ocorrências" });
  }
}