
// Global state variables
let subscriptions = [];
let activeCategoryFilter = 'Kaikki';
let searchQuery = '';
let currentSort = 'date_asc';

// aloitetaan kun DOM on valmis
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    loadSubscriptions();
});

// haetaan kaikki Subscriptionit ja renderöidään ne
async function loadSubscriptions(showSkeleton = false) {
    if (showSkeleton || subscriptions.length === 0) {
        SubTrackerUI.renderLoading();
    }
    try {
        const result = await SubTrackerAPI.getAll();
        if (result && result.success && Array.isArray(result.data)) {
            subscriptions = result.data;
        } else if (Array.isArray(result)) {
            subscriptions = result;
        }
    } catch (err) {
        console.error('Virhe haettaessa tilauksia:', err);
    }
    SubTrackerUI.renderSubscriptions(subscriptions, activeCategoryFilter, searchQuery, currentSort);
}

// määritellään tapahtumankuuntelijat
function initEventListeners() {
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addSubForm = document.getElementById('addSubForm');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const filterTabs = document.querySelectorAll('#filterTabs .tab-btn');
    const container = document.getElementById('subscriptionsContainer');

    // avataan Modal
    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => SubTrackerUI.openAddModal());
    }

//  suljetaan Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => SubTrackerUI.closeModal());
    }
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', () => SubTrackerUI.closeModal());
    }

    // etsitään Subscriptioneja (Search Input)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            SubTrackerUI.renderSubscriptions(subscriptions, activeCategoryFilter, searchQuery, currentSort);
        });
    }

    // sort
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            SubTrackerUI.renderSubscriptions(subscriptions, activeCategoryFilter, searchQuery, currentSort);
        });
    }

    // suodatin
    filterTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategoryFilter = btn.getAttribute('data-cat') || 'Kaikki';
            SubTrackerUI.renderSubscriptions(subscriptions, activeCategoryFilter, searchQuery, currentSort);
        });
    });

//    submit form
    if (addSubForm) {
        addSubForm.addEventListener('submit', handleFormSubmit);
    }

  // Tapahtumadelegointi korttien toimintapainikkeille (Tauotus, Muokkaus, Poisto)
    if (container) {
        container.addEventListener('click', handleCardActions);
    }
}

    // kättellään kaikki btn
async function handleCardActions(e) {
    const toggleBtn = e.target.closest('.toggle-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (toggleBtn) {
        const id = toggleBtn.getAttribute('data-id');
        toggleBtn.disabled = true;
        await toggleSubscription(id);
        toggleBtn.disabled = false;
    } else if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        openEditSubscription(id);
    } else if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        deleteBtn.disabled = true;
        await deleteSubscription(id);
        deleteBtn.disabled = false;
    }
}

/**
 * avaa Modal muokkamaan
 */
function openEditSubscription(id) {
    const sub = subscriptions.find(s => String(s.id) === String(id));
    if (sub) {
        SubTrackerUI.openEditModal(sub);
    }
}

/**
 * Aktiivinen / Tauolla
 */
async function toggleSubscription(id) {
    try {
        const result = await SubTrackerAPI.toggleStatus(id);
        if (result && result.success) {
            await loadSubscriptions();
            SubTrackerUI.showToast(`Tila päivitetty: ${result.new_status || 'Päivitetty'}`, 'success');
        } else {
            SubTrackerUI.showToast('Tilan vaihtaminen epäonnistui: ' + (result?.message || 'Tuntematon virhe'), 'error');
        }
    } catch (error) {
        console.error('Failed to toggle status:', error);
        SubTrackerUI.showToast('Yhteysvirhe tilaa vaihdettaessa.', 'error');
    }
}

/**
 * poistaa
 */
async function deleteSubscription(id) {
    if (!confirm('Haluatko varmasti poistaa tämän tilauksen?')) return;
    try {
        const result = await SubTrackerAPI.delete(id);
        if (result && result.success) {
            await loadSubscriptions();
            SubTrackerUI.showToast('Tilaus poistettu onnistuneesti!', 'success');
        } else {
            SubTrackerUI.showToast('Poistaminen epäonnistui: ' + (result?.message || 'Tuntematon virhe'), 'error');
        }
    } catch (error) {
        console.error('Failed to delete subscription:', error);
        SubTrackerUI.showToast('Yhteysvirhe tilausta poistettaessa.', 'error');
    }
}

/**
 * Käsitellään Form Submit (Create & Update)
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const saveBtn = document.getElementById('saveSubBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const id = document.getElementById('editSubId').value;

    const formData = {
        palvelun_nimi: document.getElementById('formName').value,
        hinta: parseFloat(document.getElementById('formPrice').value),
        laskutusjakso: document.getElementById('formCycle').value,
        seuraava_era: document.getElementById('formDate').value,
        maksutapa: document.getElementById('formPayment').value,
        kategoria: document.getElementById('formCategory').value,
        tila: document.getElementById('formStatus').value
    };

    // Asetetaan painike lataustilaan
    SubTrackerUI.setButtonLoading(saveBtn, true, id ? 'Päivitetään...' : 'Tallennetaan...');
    if (cancelBtn) cancelBtn.disabled = true;

    try {
        let result;
        if (id) {
            result = await SubTrackerAPI.update(id, formData);
        } else {
            result = await SubTrackerAPI.create(formData);
        }

        if (result && result.success) {
            await loadSubscriptions();
            SubTrackerUI.closeModal();
            SubTrackerUI.showToast(id ? 'Tilaus päivitetty onnistuneesti!' : 'Uusi tilaus lisätty onnistuneesti!', 'success');
        } else {
            SubTrackerUI.showToast('Tallennus epäonnistui: ' + (result?.message || 'Tuntematon virhe'), 'error');
        }
    } catch (error) {
        console.error('Failed to save subscription:', error);
        SubTrackerUI.showToast('Yhteysvirhe tilausta tallennettaessa.', 'error');
    } finally {
        // Palautetaan painikkeen normaali tila
        SubTrackerUI.setButtonLoading(saveBtn, false);
        if (cancelBtn) cancelBtn.disabled = false;
    }
}


