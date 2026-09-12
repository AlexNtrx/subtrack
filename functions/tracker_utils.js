// ==========================================================================
// 1. DATA STATE & UTILITY FUNCTIONS (SubTracker)
// ==========================================================================

// Tilaukset ladataan dynaamisesti tietokannasta (Alussa tyhjä)
let subscriptions = [];
let activeCategoryFilter = 'Kaikki';
let searchQuery = '';

/**
 * Escape HTML special characters to prevent Cross-Site Scripting (XSS)
 */
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Palauttaa kategorian visuaaliset tyylit ja ikonit
 */
function getCategoryStyle(cat) {
    switch(cat) {
        case 'Suoratoisto': 
            return { bg: 'var(--cat-purple)', color: 'var(--cat-purple-text)', iconBg: '#ffe4e6', iconColor: '#e11d48', icon: 'fa-film' };
        case 'Työkalut': 
            return { bg: 'var(--cat-blue)', color: 'var(--cat-blue-text)', iconBg: '#e0f2fe', iconColor: '#0284c7', icon: 'fa-cloud' };
        case 'Vapaa-aika': 
            return { bg: 'var(--cat-orange)', color: 'var(--cat-orange-text)', iconBg: '#ffedd5', iconColor: '#ea580c', icon: 'fa-dumbbell' };
        default: 
            return { bg: '#f1f5f9', color: '#475569', iconBg: '#e2e8f0', iconColor: '#475569', icon: 'fa-layer-group' };
    }
}

/**
 * Laskee ja päivittää tilastokorttien summat ja eräpäivät
 */
function updateSummaryStats() {
    const activeSubs = subscriptions.filter(s => s.tila === 'Aktiivinen');
    
    const monthlyTotal = activeSubs.reduce((acc, curr) => {
        const amount = Number(curr.hinta) || 0;
        return acc + (curr.laskutusjakso === 'Vuosittain' ? amount / 12 : amount);
    }, 0);

    const totalMonthlyEl = document.getElementById('totalMonthly');
    const totalYearlySubEl = document.getElementById('totalYearlySub');
    const totalCountEl = document.getElementById('totalCount');
    const activeVsPausedEl = document.getElementById('activeVsPaused');
    const nextBillingTextEl = document.getElementById('nextBillingText');
    const nextBillingSubEl = document.getElementById('nextBillingSub');

    if (totalMonthlyEl) totalMonthlyEl.innerText = monthlyTotal.toFixed(2) + ' €';
    if (totalYearlySubEl) totalYearlySubEl.innerText = 'Vuodessa ' + (monthlyTotal * 12).toFixed(2) + ' €';

    if (totalCountEl) totalCountEl.innerText = subscriptions.length + ' kpl';
    if (activeVsPausedEl) activeVsPausedEl.innerText = `${activeSubs.length} aktiivista, ${subscriptions.length - activeSubs.length} tauolla`;

    // Laske seuraava uusiutuva tilaus
    if (activeSubs.length > 0) {
        const sorted = [...activeSubs].filter(s => s.seuraava_era).sort((a, b) => new Date(a.seuraava_era) - new Date(b.seuraava_era));
        if (sorted.length > 0) {
            const next = sorted[0];
            if (nextBillingTextEl) nextBillingTextEl.innerText = next.palvelun_nimi;
            if (nextBillingSubEl) nextBillingSubEl.innerText = `${next.seuraava_era} (${Number(next.hinta).toFixed(2)} €)`;
        }
    } else {
        if (nextBillingTextEl) nextBillingTextEl.innerText = '-';
        if (nextBillingSubEl) nextBillingSubEl.innerText = 'Ei erääntyviä';
    }
}

/**
 * Piirtää tilaukset näytölle aktiivisen suodatuksen ja haun mukaan
 */
function renderSubscriptions() {
    const container = document.getElementById('subscriptionsContainer');
    if (!container) return;
    container.innerHTML = '';

    const filtered = subscriptions.filter(sub => {
        const matchesCat = (activeCategoryFilter === 'Kaikki') || (sub.kategoria === activeCategoryFilter);
        const matchesSearch = sub.palvelun_nimi.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: var(--radius-card); border: 1px dashed var(--border-subtle);">
                <i class="fa-regular fa-folder-open" style="font-size: 32px; color: var(--text-muted); margin-bottom: 12px;"></i>
                <p style="color: var(--text-muted); font-weight: 600;">Ei tilauksia saatavilla. Lisää ensimmäinen tilauksesi!</p>
            </div>
        `;
    } else {
        filtered.forEach(sub => {
            const catStyle = getCategoryStyle(sub.kategoria);
            const isActive = sub.tila === 'Aktiivinen';
            const escapedId = escapeHtml(sub.id);
            const escapedName = escapeHtml(sub.palvelun_nimi);
            const escapedCategory = escapeHtml(sub.kategoria);
            const escapedDate = escapeHtml(sub.seuraava_era || 'Ei asetettu');
            const escapedPayment = escapeHtml(sub.maksutapa || 'Kortti');
            const escapedStatus = escapeHtml(sub.tila);
            const price = Number(sub.hinta).toFixed(2);
            
            const card = document.createElement('div');
            card.className = 'sub-card';
            card.setAttribute('data-id', escapedId);

            card.innerHTML = `
                <div>
                    <div class="sub-header">
                        <div class="service-info">
                            <div class="service-logo" style="background: ${catStyle.iconBg}; color: ${catStyle.iconColor};">
                                <i class="fa-solid ${catStyle.icon}"></i>
                            </div>
                            <div class="service-details">
                                <h3>${escapedName}</h3>
                                <span class="badge-cat" style="background: ${catStyle.bg}; color: ${catStyle.color};">${escapedCategory}</span>
                            </div>
                        </div>
                        <span class="status-pill ${isActive ? 'active' : 'paused'}">${escapedStatus}</span>
                    </div>

                    <div class="sub-body">
                        <div class="price-row">
                            <span class="price-amount">${price} €</span>
                            <span class="price-cycle">/ ${sub.laskutusjakso === 'Vuosittain' ? 'vuosi' : 'kk'}</span>
                        </div>
                        <div class="meta-row">
                            <span class="meta-item">
                                <i class="fa-regular fa-calendar-check"></i> Uusiutuu: ${escapedDate}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="sub-footer">
                    <span class="payment-method">
                        <i class="fa-regular fa-credit-card"></i> ${escapedPayment}
                    </span>
                    <div class="card-actions">
                        <button class="action-btn btn-toggle-pause" data-id="${escapedId}" title="${isActive ? 'Tauota' : 'Aktivoi'}">
                            <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                        <button class="action-btn btn-edit-sub" data-id="${escapedId}" title="Muokkaa"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete btn-delete-sub" data-id="${escapedId}" title="Poista"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateSummaryStats();
}
