
// tyyli
const SubTrackerUI = {
    getCategoryStyle(cat) {
        switch (cat) {
            case 'Suoratoisto':
                return { bg: 'var(--cat-purple)', color: 'var(--cat-purple-text)', iconBg: '#ffe4e6', iconColor: '#e11d48', icon: 'fa-film' };
            case 'Työkalut':
                return { bg: 'var(--cat-blue)', color: 'var(--cat-blue-text)', iconBg: '#e0f2fe', iconColor: '#0284c7', icon: 'fa-cloud' };
            case 'Vapaa-aika':
                return { bg: 'var(--cat-orange)', color: 'var(--cat-orange-text)', iconBg: '#ffedd5', iconColor: '#ea580c', icon: 'fa-dumbbell' };
            default:
                return { bg: '#f1f5f9', color: '#475569', iconBg: '#e2e8f0', iconColor: '#475569', icon: 'fa-layer-group' };
        }
    },

    // päivitetään

    updateSummaryStats(subscriptions = []) {
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

     
        if (activeSubs.length > 0) {
            const sorted = [...activeSubs]
                .filter(s => s.seuraava_era)
                .sort((a, b) => new Date(a.seuraava_era) - new Date(b.seuraava_era));

            if (sorted.length > 0) {
                const next = sorted[0];
                if (nextBillingTextEl) nextBillingTextEl.innerText = next.palvelun_nimi;
                if (nextBillingSubEl) nextBillingSubEl.innerText = `${next.seuraava_era} (${Number(next.hinta).toFixed(2)} €)`;
            } else {
                if (nextBillingTextEl) nextBillingTextEl.innerText = '-';
                if (nextBillingSubEl) nextBillingSubEl.innerText = 'Ei erääntyviä';
            }
        } else {
            if (nextBillingTextEl) nextBillingTextEl.innerText = '-';
            if (nextBillingSubEl) nextBillingSubEl.innerText = 'Ei erääntyviä';
        }
    },

    // kortit
    renderCard(sub) {
        const catStyle = this.getCategoryStyle(sub.kategoria);
        const isActive = sub.tila === 'Aktiivinen';

        const card = document.createElement('div');
        card.className = 'sub-card';
        card.innerHTML = `
            <div>
                <div class="sub-header">
                    <div class="service-info">
                        <div class="service-logo" style="background: ${catStyle.iconBg}; color: ${catStyle.iconColor};">
                            <i class="fa-solid ${catStyle.icon}"></i>
                        </div>
                        <div class="service-details">
                            <h3>${escapeHtml(sub.palvelun_nimi)}</h3>
                            <span class="badge-cat" style="background: ${catStyle.bg}; color: ${catStyle.color};">${escapeHtml(sub.kategoria)}</span>
                        </div>
                    </div>
                    <span class="status-pill ${isActive ? 'active' : 'paused'}">${escapeHtml(sub.tila)}</span>
                </div>

                <div class="sub-body">
                    <div class="price-row">
                        <span class="price-amount">${Number(sub.hinta).toFixed(2)} €</span>
                        <span class="price-cycle">/ ${sub.laskutusjakso === 'Vuosittain' ? 'vuosi' : 'kk'}</span>
                    </div>
                    <div class="meta-row">
                        <span class="meta-item">
                            <i class="fa-regular fa-calendar-check"></i> Uusiutuu: ${escapeHtml(sub.seuraava_era || 'Ei asetettu')}
                        </span>
                    </div>
                </div>
            </div>

            <div class="sub-footer">
                <span class="payment-method">
                    <i class="fa-regular fa-credit-card"></i> ${escapeHtml(sub.maksutapa || 'Kortti')}
                </span>
                <div class="card-actions">
                    <button class="action-btn toggle-btn" data-id="${sub.id}" title="${isActive ? 'Tauota' : 'Aktivoi'}">
                        <i class="fa-solid ${isActive ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                    <button class="action-btn edit-btn" data-id="${sub.id}" title="Muokkaa">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="action-btn delete delete-btn" data-id="${sub.id}" title="Poista">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        return card;
    },

  
    renderSubscriptions(subscriptions = [], activeCategory = 'Kaikki', searchQuery = '', sortBy = 'date_asc') {
        const container = document.getElementById('subscriptionsContainer');
        if (!container) return;
        container.innerHTML = '';

        const query = (searchQuery || '').trim().toLowerCase();
        let filtered = subscriptions.filter(sub => {
            const matchesCat = (activeCategory === 'Kaikki') || (sub.kategoria === activeCategory);
            const matchesSearch = !query || (sub.palvelun_nimi && sub.palvelun_nimi.toLowerCase().includes(query));
            return matchesCat && matchesSearch;
        });

        // Lajittelu (Sorting)
        filtered.sort((a, b) => {
            if (sortBy === 'price_desc') {
                return (Number(b.hinta) || 0) - (Number(a.hinta) || 0);
            } else if (sortBy === 'price_asc') {
                return (Number(a.hinta) || 0) - (Number(b.hinta) || 0);
            } else if (sortBy === 'name_asc') {
                return (a.palvelun_nimi || '').localeCompare(b.palvelun_nimi || '', 'fi', { sensitivity: 'base' });
            } else {
                // date_asc (Eräpäivä: lähin ensin)
                const dateA = a.seuraava_era ? new Date(a.seuraava_era) : new Date('9999-12-31');
                const dateB = b.seuraava_era ? new Date(b.seuraava_era) : new Date('9999-12-31');
                return dateA - dateB;
            }
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
                container.appendChild(this.renderCard(sub));
            });
        }

        this.updateSummaryStats(subscriptions);
    },

    /**
     * Piirtää latausanimaation (Skeleton Cards) korttiruudukkoon
     */
    renderLoading() {
        const container = document.getElementById('subscriptionsContainer');
        if (!container) return;
        container.innerHTML = `
            <div class="skeleton-card">
                <div class="skeleton-box" style="width: 60%; height: 24px;"></div>
                <div class="skeleton-box" style="width: 100%; height: 60px;"></div>
                <div class="skeleton-box" style="width: 40%; height: 20px;"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-box" style="width: 60%; height: 24px;"></div>
                <div class="skeleton-box" style="width: 100%; height: 60px;"></div>
                <div class="skeleton-box" style="width: 40%; height: 20px;"></div>
            </div>
            <div class="skeleton-card">
                <div class="skeleton-box" style="width: 60%; height: 24px;"></div>
                <div class="skeleton-box" style="width: 100%; height: 60px;"></div>
                <div class="skeleton-box" style="width: 40%; height: 20px;"></div>
            </div>
        `;
    },

    /**
     * Asettaa painikkeen lataustilaan tai palauttaa sen normaaliksi
     */
    setButtonLoading(button, isLoading, loadingText = 'Tallennetaan...') {
        if (!button) return;
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        }
    },

  
    openAddModal() {
        const modal = document.getElementById('addModal');
        const form = document.getElementById('addSubForm');
        if (document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = 'Lisää uusi tilaus';
        if (document.getElementById('editSubId')) document.getElementById('editSubId').value = '';
        if (form) form.reset();
        if (modal) modal.classList.add('active');
    },

    openEditModal(sub) {
        if (!sub) return;
        const modal = document.getElementById('addModal');
        if (document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = 'Muokkaa tilausta';
        if (document.getElementById('editSubId')) document.getElementById('editSubId').value = sub.id;
        if (document.getElementById('formName')) document.getElementById('formName').value = sub.palvelun_nimi || '';
        if (document.getElementById('formPrice')) document.getElementById('formPrice').value = sub.hinta || '';
        if (document.getElementById('formCycle')) document.getElementById('formCycle').value = sub.laskutusjakso || 'Kuukausittain';
        if (document.getElementById('formDate')) document.getElementById('formDate').value = sub.seuraava_era || '';
        if (document.getElementById('formPayment')) document.getElementById('formPayment').value = sub.maksutapa || '';
        if (document.getElementById('formCategory')) document.getElementById('formCategory').value = sub.kategoria || 'Suoratoisto';
        if (document.getElementById('formStatus')) document.getElementById('formStatus').value = sub.tila || 'Aktiivinen';

        if (modal) modal.classList.add('active');
    },

    closeModal() {
        const modal = document.getElementById('addModal');
        if (modal) modal.classList.remove('active');
    },

    /**
     * Näyttää modernin Toast-ilmoitusviestin
     * @param {string} message - Ilmoituksen teksti
     * @param {string} type - 'success' | 'error' | 'info'
     * @param {number} duration - Näyttöaika millisekunteina (oletus 3500ms)
     */
    showToast(message, type = 'success', duration = 3500) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconClass = 'fa-check';
        if (type === 'error') iconClass = 'fa-circle-exclamation';
        if (type === 'info') iconClass = 'fa-circle-info';

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="toast-message">${escapeHtml(message)}</div>
            <button class="toast-close" title="Sulje"><i class="fa-solid fa-xmark"></i></button>
        `;

        container.appendChild(toast);

        // Animaation käynnistys pienen viiveen jälkeen
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Sulkemistoiminto
        const removeToast = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            toast.addEventListener('transitionend', () => {
                if (toast.parentElement) toast.remove();
            }, { once: true });
        };

        toast.querySelector('.toast-close').addEventListener('click', removeToast);

        // Automaattinen poisto
        setTimeout(removeToast, duration);
    }
};


function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
