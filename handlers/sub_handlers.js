// ==========================================================================
// 2. EVENT HANDLERS & USER INTERACTIONS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Alusta näkymä
    renderSubscriptions();

    // DOM Elementit
    const addModal = document.getElementById('addModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addSubForm = document.getElementById('addSubForm');
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('#filterTabs .tab-btn');

    // Avaa Lisää-modaali
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').innerText = 'Lisää uusi tilaus';
            document.getElementById('editSubId').value = '';
            addSubForm.reset();
            addModal.classList.add('active');
        });
    }

    // Sulje modaali
    const closeModal = () => {
        if (addModal) addModal.classList.remove('active');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Tallenna lomake (Lisää tai Muokkaa)
    if (addSubForm) {
        addSubForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('editSubId').value;
            const subData = {
                id: editId || String(Date.now()),
                palvelun_nimi: document.getElementById('formName').value,
                hinta: parseFloat(document.getElementById('formPrice').value),
                laskutusjakso: document.getElementById('formCycle').value,
                seuraava_era: document.getElementById('formDate').value,
                maksutapa: document.getElementById('formPayment').value || 'Maksukortti',
                kategoria: document.getElementById('formCategory').value,
                tila: document.getElementById('formStatus').value
            };

            if (editId) {
                subscriptions = subscriptions.map(s => s.id === editId ? subData : s);
            } else {
                subscriptions.push(subData);
            }

            renderSubscriptions();
            closeModal();
        });
    }

    // Haku
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderSubscriptions();
        });
    }

    // Kategoria-suodatus
    filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategoryFilter = btn.getAttribute('data-cat');
            renderSubscriptions();
        });
    });
});

// Globaalit toiminnot (kutsutaan HTML-elementeistä inline onclick -attribuuteilla)
window.togglePause = function(id) {
    subscriptions = subscriptions.map(s => {
        if (s.id === id) {
            return { ...s, tila: s.tila === 'Aktiivinen' ? 'Tauolla' : 'Aktiivinen' };
        }
        return s;
    });
    renderSubscriptions();
};

window.deleteSub = function(id) {
    if (confirm('Haluatko varmasti poistaa tämän tilauksen?')) {
        subscriptions = subscriptions.filter(s => s.id !== id);
        renderSubscriptions();
    }
};

window.openEditModal = function(id) {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;

    document.getElementById('modalTitle').innerText = 'Muokkaa tilausta';
    document.getElementById('editSubId').value = sub.id;
    document.getElementById('formName').value = sub.palvelun_nimi;
    document.getElementById('formPrice').value = sub.hinta;
    document.getElementById('formCycle').value = sub.laskutusjakso;
    document.getElementById('formDate').value = sub.seuraava_era;
    document.getElementById('formPayment').value = sub.maksutapa;
    document.getElementById('formCategory').value = sub.kategoria;
    document.getElementById('formStatus').value = sub.tila;

    const addModal = document.getElementById('addModal');
    if (addModal) addModal.classList.add('active');
};
