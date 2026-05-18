// Animação suave para o número principal (totalOcorrencias).
// Conta do valor atual exibido até o novo valor em ~700ms.
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
    // Já vem ordenado do backend; mas garantimos só por segurança.
    return [...arr].sort(
        (a, b) => (b._count[key] ?? 0) - (a._count[key] ?? 0)
    )[0];
}

export function updateUI(data) {
    const totalEl     = document.getElementById('totalOcorrencias');
    const tipoEl      = document.getElementById('topTipo');
    const bairroEl    = document.getElementById('topBairro');
    const resumoTipo  = document.getElementById('resumoTipo');
    const resumoBairro = document.getElementById('resumoBairro');

    // Estado de erro / sem dados
    if (!data) {
        if (totalEl)      totalEl.textContent = '0';
        if (tipoEl)       tipoEl.textContent = 'Sem dados';
        if (bairroEl)     bairroEl.textContent = 'Sem dados';
        if (resumoTipo)   resumoTipo.textContent = 'Não foi possível carregar os dados.';
        if (resumoBairro) resumoBairro.textContent = 'Não foi possível carregar os dados.';
        return;
    }

    const total = data.total ?? 0;

    // ── KPI: total ─────────────────────────────────────
    if (totalEl) animateCounter(totalEl, total);

    // ── KPI: tipo / bairro ─────────────────────────────
    if (tipoEl) {
        tipoEl.textContent = data.tipoMaisComum?.type || '—';
    }
    if (bairroEl) {
        bairroEl.textContent = data.bairroDestaque?.district || '—';
    }

    // ── Resumos abaixo do título de cada gráfico ───────
    if (resumoTipo) {
        const top = topItem(data.porTipo, 'type');
        if (!top || total === 0) {
            resumoTipo.textContent = 'Nenhuma ocorrência registrada ainda.';
        } else {
            const pct = formatPct(top._count.type, total);
            resumoTipo.innerHTML =
                `Maior categoria: <strong>${top.type}</strong> (${pct})`;
        }
    }

    if (resumoBairro) {
        const top = topItem(data.porBairro, 'district');
        if (!top) {
            resumoBairro.textContent = 'Nenhum bairro com registros para o filtro atual.';
        } else {
            const n = top._count.district;
            resumoBairro.innerHTML =
                `Bairro com mais registros: <strong>${top.district}</strong> (${n})`;
        }
    }
}
