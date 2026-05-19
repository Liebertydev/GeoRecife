import { coresPorTipo } from './graficos';

// ── Helpers ────────────────────────────────────────────

function animateCounter(el, target) {
    const from = parseInt(el.textContent, 10) || 0;
    if (from === target) {
        el.textContent = target;
        return;
    }

    const duration = 700;
    const start = performance.now();

    function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);            // easeOutCubic
        el.textContent = Math.round(from + (target - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

function formatPct(n, total) {
    if (!total) return '0%';
    return `${Math.round((n / total) * 100)}%`;
}

function topItem(arr, key) {
    if (!arr || arr.length === 0) return null;
    return [...arr].sort(
        (a, b) => (b._count[key] ?? 0) - (a._count[key] ?? 0)
    )[0];
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function timeAgo(iso) {
    const now  = Date.now();
    const then = new Date(iso).getTime();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));

    if (diffSec < 60)        return 'agora';
    const m = Math.floor(diffSec / 60);
    if (m < 60)              return `há ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24)              return `há ${h} h`;
    const d = Math.floor(h / 24);
    if (d < 7)               return `há ${d} d`;

    return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short'
    });
}

// ── Trend ──────────────────────────────────────────────
// Para ocorrências, "subir" = mais incidentes = ruim (vermelho);
// "cair" = menos incidentes = bom (verde).

function renderTrend(el, current, previous, copy) {
    if (!el) return;

    function set(modifier, icon, text) {
        const parts = ['kpi-trend'];
        if (copy.variant) parts.push(copy.variant);
        if (modifier)     parts.push(modifier);
        el.className = parts.join(' ');
        el.innerHTML = `<i class="bi ${icon}"></i> ${text}`;
        el.hidden = false;
    }

    if (previous === 0 && current === 0) {
        set(null, 'bi-dash', copy.zero);
        return;
    }
    if (previous === 0) {
        set('kpi-trend--up', 'bi-arrow-up-right', copy.fromZero(current));
        return;
    }

    const pct = Math.round(((current - previous) / previous) * 100);
    if (pct === 0)   return set(null, 'bi-dash', copy.same(current));
    if (pct > 0)     return set('kpi-trend--up',   'bi-arrow-up-right',   `+${pct}% ${copy.suffix}`);
    return                set('kpi-trend--down', 'bi-arrow-down-right', `${pct}% ${copy.suffix}`);
}

const COPY_DAILY = {
    zero:     'Sem registros hoje',
    fromZero: (n) => `${n} ${n === 1 ? 'nova' : 'novas'} hoje`,
    same:     (n) => `Igual a ontem (${n} hoje)`,
    suffix:   'vs ontem'
};

const COPY_WEEKLY = {
    variant:  'kpi-trend--week',
    zero:     'Sem registros nos últimos 14 dias',
    fromZero: (n) => `${n} nos últimos 7 dias`,
    same:     (n) => `Igual à semana anterior (${n})`,
    suffix:   'vs semana anterior'
};

// ── Feed de ocorrências recentes ───────────────────────

function renderRecent(list, summaryEl, items) {
    if (!list) return;

    if (!items || items.length === 0) {
        list.innerHTML = `
            <li class="recent-feed-empty">
                <i class="bi bi-inbox" aria-hidden="true"></i>
                Nenhuma ocorrência registrada ainda.
            </li>
        `;
        if (summaryEl) summaryEl.textContent = 'Sem atividade recente.';
        return;
    }

    if (summaryEl) {
        const newestAt = items[0].createdAt;
        summaryEl.innerHTML =
            `Últimas <strong>${items.length}</strong> ocorrências · mais recente ${timeAgo(newestAt)}`;
    }

    list.innerHTML = items.map(item => {
        const color = coresPorTipo[item.type] || '#94a3b8';
        const type     = escapeHtml(item.type);
        const street   = escapeHtml(item.street);
        const district = escapeHtml(item.district);
        const ago      = escapeHtml(timeAgo(item.createdAt));

        return `
            <li class="recent-feed-item">
                <a href="/ocorrencias/${item.id}" class="recent-feed-row">
                    <span class="recent-feed-dot" style="background:${color}" aria-hidden="true"></span>
                    <span class="recent-feed-type">${type}</span>
                    <span class="recent-feed-loc">
                        <strong>${street}</strong>
                        <span class="recent-feed-district">${district}</span>
                    </span>
                    <time class="recent-feed-time" datetime="${item.createdAt}">${ago}</time>
                </a>
            </li>
        `;
    }).join('');
}

// ── Entry point ────────────────────────────────────────

export function updateUI(data) {
    const totalEl      = document.getElementById('totalOcorrencias');
    const tipoEl       = document.getElementById('topTipo');
    const bairroEl     = document.getElementById('topBairro');
    const trendEl      = document.getElementById('totalTrend');
    const trendWeekEl  = document.getElementById('totalTrendWeek');
    const resumoTipo   = document.getElementById('resumoTipo');
    const resumoBairro = document.getElementById('resumoBairro');
    const resumoRecent = document.getElementById('resumoRecent');
    const recentList   = document.getElementById('recentList');

    // Estado de erro / sem dados
    if (!data) {
        if (totalEl)      totalEl.textContent = '0';
        if (tipoEl)       tipoEl.textContent = 'Sem dados';
        if (bairroEl)     bairroEl.textContent = 'Sem dados';
        if (resumoTipo)   resumoTipo.textContent = 'Não foi possível carregar os dados.';
        if (resumoBairro) resumoBairro.textContent = 'Não foi possível carregar os dados.';
        if (resumoRecent) resumoRecent.textContent = 'Não foi possível carregar a atividade recente.';
        if (recentList)   recentList.innerHTML = '';
        if (trendEl)      trendEl.hidden = true;
        if (trendWeekEl)  trendWeekEl.hidden = true;
        return;
    }

    const total = data.total ?? 0;
    const trend = data.trend || {};

    // ── KPI: total + tendências (diária + semanal) ─────
    if (totalEl) animateCounter(totalEl, total);
    if (trendEl) {
        renderTrend(trendEl, trend.today ?? 0, trend.yesterday ?? 0, COPY_DAILY);
    }
    if (trendWeekEl) {
        renderTrend(trendWeekEl, trend.thisWeek ?? 0, trend.lastWeek ?? 0, COPY_WEEKLY);
    }

    // ── KPI: tipo / bairro ─────────────────────────────
    if (tipoEl)   tipoEl.textContent   = data.tipoMaisComum?.type   || '—';
    if (bairroEl) bairroEl.textContent = data.bairroDestaque?.district || '—';

    // ── Resumos abaixo do título de cada gráfico ───────
    if (resumoTipo) {
        const top = topItem(data.porTipo, 'type');
        if (!top || total === 0) {
            resumoTipo.textContent = 'Nenhuma ocorrência registrada ainda.';
        } else {
            const pct = formatPct(top._count.type, total);
            resumoTipo.innerHTML =
                `Maior categoria: <strong>${escapeHtml(top.type)}</strong> (${pct})`;
        }
    }

    if (resumoBairro) {
        const top = topItem(data.porBairro, 'district');
        if (!top) {
            resumoBairro.textContent = 'Nenhum bairro com registros para o filtro atual.';
        } else {
            const n = top._count.district;
            const totalBairros = data.porBairro.length;
            const exibidos = Math.min(totalBairros, 10);
            const sufixo = totalBairros > 10
                ? ` · exibindo top ${exibidos} de ${totalBairros}`
                : '';
            resumoBairro.innerHTML =
                `Bairro com mais registros: <strong>${escapeHtml(top.district)}</strong> (${n})${sufixo}`;
        }
    }

    // ── Feed de recentes ───────────────────────────────
    renderRecent(recentList, resumoRecent, data.recent);
}
