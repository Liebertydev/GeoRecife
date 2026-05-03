// ============================================================
// dashboardController.js
// ------------------------------------------------------------
// Este controller cuida das rotas relacionadas ao Dashboard.
// Existem dois endpoints:
//   1) renderDashboard  -> renderiza a página HTML (a "view")
//   2) getDashboard     -> retorna os dados em JSON para o
//                           JS do front-end consumir e desenhar
//                           os gráficos/cards.
//
// Aqui no controller a regra é simples: ele NÃO conversa
// diretamente com o banco. Ele só recebe a requisição,
// pede os dados pro service (DashboardService) e devolve
// a resposta. Quem sabe fazer query é o service.
// ============================================================

// Importamos o service que sabe buscar os dados no banco.
// O nome da variável aqui é livre — o que importa é manter
// consistência ao usá-la abaixo. Vamos chamar de
// `dashboardService` para deixar bem claro o que é.
const dashboardService = require('../services/DashboardService');


// ============================================================
// RENDERIZA A PÁGINA DO DASHBOARD
// ------------------------------------------------------------
// Apenas devolve o HTML. O JS da página é quem vai chamar
// /api/dashboard depois para buscar os números.
// ============================================================
exports.renderDashboard = (req, res) => {
    res.render('dashboard', { pageCSS: '/frontend/assets/css/dashboard.css' });
};


// ============================================================
// API DO DASHBOARD (retorna JSON)
// ------------------------------------------------------------
// Esta função é `async` porque vamos esperar várias consultas
// ao banco terminarem (cada uma é uma Promise). Usar async/await
// deixa o código parecido com código síncrono, mais fácil de ler.
// ============================================================
exports.getDashboard = async (req, res) => {
    try {
        // ----------------------------------------------------
        // 1) Lemos o filtro opcional de tipo da query string.
        //    Ex.: /api/dashboard?tipo=crime
        //    Se o usuário não mandar nada, `tipo` vem undefined,
        //    e o service trata isso como "sem filtro".
        // ----------------------------------------------------
        const tipo = req.query.tipo;

        // ----------------------------------------------------
        // 2) Disparamos TODAS as consultas ao mesmo tempo com
        //    Promise.all. Isso é mais rápido do que chamar uma
        //    de cada vez (em série), porque o banco pode
        //    responder em paralelo.
        //
        //    Atenção a dois detalhes que já causaram bug aqui:
        //      - É `Promise.all` (com UM "s"), não "Promisse".
        //      - Os nomes dos métodos têm que ser EXATAMENTE
        //        os que existem no DashboardService:
        //           getForType, getForDistrict, getAllOccurrence,
        //           getCommonType, getDistrictTop
        //
        //    A ordem dos itens no array é a mesma ordem em que
        //    eles serão devolvidos na desestruturação abaixo.
        // ----------------------------------------------------
        const [
            porTipo,         // contagem agrupada por tipo
            porBairro,       // contagem agrupada por bairro (respeita o filtro `tipo`)
            total,           // total geral de ocorrências
            tipoMaisComum,   // tipo com mais registros
            bairroTop        // bairro com mais registros
        ] = await Promise.all([
            dashboardService.getForType(),
            dashboardService.getForDistrict(tipo),
            dashboardService.getAllOccurrence(),
            dashboardService.getCommonType(),
            dashboardService.getDistrictTop()
        ]);

        // ----------------------------------------------------
        // 3) Devolvemos um JSON. As CHAVES daqui são o
        //    "contrato" com o front-end: o JS do dashboard
        //    espera ler `porTipo`, `porBairro`, `total`,
        //    `tipoMaisComum` e `bairroTop`. Se você renomear
        //    aqui, precisa renomear no front também.
        // ----------------------------------------------------
        return res.json({
            porTipo,
            porBairro,
            total,
            tipoMaisComum,
            bairroTop
        });

    } catch (e) {
        // ----------------------------------------------------
        // 4) Se qualquer uma das Promises der erro, caímos aqui.
        //    Duas coisas importantes:
        //      a) Logar o erro pra gente debugar no servidor.
        //      b) RESPONDER pro cliente. Se a gente esquecer
        //         de responder, o navegador fica esperando
        //         pra sempre — a aba fica "carregando".
        //         Por isso devolvemos um 500 com uma mensagem.
        // ----------------------------------------------------
        console.error('Erro ao montar dashboard:', e);
        return res.status(500).json({ erro: 'Erro ao buscar dados do dashboard' });
    }
};
