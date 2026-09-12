// ==========================================================================
// 2. EVENT HANDLERS & USER INTERACTIONS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Alusta näkymä ja lataa tilaukset tietokannasta
    loadSubscriptions();

    // DOM Elementit
    const addModal = document.getElementById('addModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addSubForm = document.getElementById('addSubForm');
    const saveSubBtn = document.getElementById('saveSubBtn');
    const searchInput = document.getElementById('searchInput');
    const filterTabs = document.querySelectorAll('#filterTabs .tab-btn');

    // Avaa Lisää-modaali
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            document.getElementById('modalTitle').innerText = 'Lisää uusi tilaus';
            document.getElementById('editSubId').value = '';
            if (saveSubBtn) saveSubBtn.innerText = 'Tallenna tilaus';
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

    // Tallenna lomake (Lisää tai Muokkaa tietokantaan)
    if (addSubForm) {
        addSubForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const editId = document.getElementById('editSubId').value;
            const subData = {
                palvelun_nimi: document.getElementById('formName').value.trim(),
                hinta: parseFloat(document.getElementById('formPrice').value) || 0,
                laskutusjakso: document.getElementById('formCycle').value,
                seuraava_era: document.getElementById('formDate').value,
                maksutapa: document.getElementById('formPayment').value.trim() || 'Maksukortti',
                kategoria: document.getElementById('formCategory').value,
                tila: document.getElementById('formStatus').value
            };

            const endpoint = editId ? 'handlers/update_subscription.php' : 'handlers/add_subscription.php';
            if (editId) {
                subData.id = parseInt(editId, 10);
            }

            if (saveSubBtn) {
                saveSubBtn.disabled = true;
                saveSubBtn.innerText = 'Tallennetaan...';
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subData)
                });
                const result = await response.json();

                if (result.success) {
                    await loadSubscriptions();
                    closeModal();
                } else {
                    alert('Virhe tallennuksessa: ' + (result.message || 'Tuntematon virhe'));
                }
            } catch (err) {
                console.error('Verkkovirhe tallennuksessa:', err);
                alert('Yhteysvirhe palvelimeen tallennettaessa.');
            } finally {
                if (saveSubBtn) {
                    saveSubBtn.disabled = false;
                    saveSubBtn.innerText = editId ? 'Päivitä tilaus' : 'Tallenna tilaus';
                }
            }
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

    // Event Delegation: Tilaustoiminnot (Tauota/Aktivoi, Muokkaa, Poista)
    const subscriptionsContainer = document.getElementById('subscriptionsContainer');
    if (subscriptionsContainer) {
        subscriptionsContainer.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.btn-toggle-pause');
            if (toggleBtn) {
                const id = toggleBtn.getAttribute('data-id');
                window.togglePause(id);
                return;
            }

            const editBtn = e.target.closest('.btn-edit-sub');
            if (editBtn) {
                const id = editBtn.getAttribute('data-id');
                window.openEditModal(id);
                return;
            }

            const deleteBtn = e.target.closest('.btn-delete-sub');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                window.deleteSub(id);
                return;
            }
        });
    }
});

// Globaalit toiminnot (API-kutsut tietokantaan)
window.togglePause = async function(id) {
    try {
        const response = await fetch('handlers/toggle_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(id, 10) })
        });
        const result = await response.json();

        if (result.success) {
            subscriptions = subscriptions.map(s => {
                if (String(s.id) === String(id)) {
                    return { ...s, tila: result.new_status };
                }
                return s;
            });
            renderSubscriptions();
        } else {
            alert('Tilan vaihto epäonnistui: ' + (result.message || 'Tuntematon virhe'));
        }
    } catch (err) {
        console.error('Verkkovirhe tilan vaihdossa:', err);
        alert('Yhteysvirhe palvelimeen tilan vaihdossa.');
    }
};

window.deleteSub = async function(id) {
    if (!confirm('Haluatko varmasti poistaa tämän tilauksen?')) {
        return;
    }

    try {
        const response = await fetch('handlers/delete_subscription.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: parseInt(id, 10) })
        });
        const result = await response.json();

        if (result.success) {
            subscriptions = subscriptions.filter(s => String(s.id) !== String(id));
            renderSubscriptions();
        } else {
            alert('Poisto epäonnistui: ' + (result.message || 'Tuntematon virhe'));
        }
    } catch (err) {
        console.error('Verkkovirhe poistettaessa:', err);
        alert('Yhteysvirhe palvelimeen poistettaessa.');
    }
};

window.openEditModal = function(id) {
    const sub = subscriptions.find(s => String(s.id) === String(id));
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

    const saveSubBtn = document.getElementById('saveSubBtn');
    if (saveSubBtn) saveSubBtn.innerText = 'Päivitä tilaus';

    const addModal = document.getElementById('addModal');
    if (addModal) addModal.classList.add('active');
};
