<!-- MODAL COMPONENT (LISÄÄ/MUOKKAA TILAUS) -->
<div class="modal-overlay" id="addModal">
    <div class="modal-card">
        <div class="modal-header">
            <h2 id="modalTitle">Lisää uusi tilaus</h2>
            <button class="close-btn" id="closeModalBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <form id="addSubForm">
            <input type="hidden" id="editSubId" value="">
            
            <div class="form-group">
                <label class="form-label">Palvelun nimi</label>
                <input type="text" id="formName" class="form-input" placeholder="Esim. Netflix, Spotify, Kuntosali" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Hinta (€)</label>
                    <input type="number" step="0.01" id="formPrice" class="form-input" placeholder="9.99" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Laskutusjakso</label>
                    <select id="formCycle" class="form-select">
                        <option value="Kuukausittain">Kuukausittain</option>
                        <option value="Vuosittain">Vuosittain</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Seuraava eräpäivä</label>
                    <input type="date" id="formDate" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Maksutapa</label>
                    <input type="text" id="formPayment" class="form-input" placeholder="Esim. Visa ****4321, Apple Pay">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Kategoria</label>
                <select id="formCategory" class="form-select">
                    <option value="Suoratoisto">Suoratoisto</option>
                    <option value="Työkalut">Työkalut & Pilvipalvelut</option>
                    <option value="Vapaa-aika">Vapaa-aika & Terveys</option>
                    <option value="Muut">Muut</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Tila</label>
                <select id="formStatus" class="form-select">
                    <option value="Aktiivinen">Aktiivinen</option>
                    <option value="Tauolla">Tauolla</option>
                </select>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-secondary" id="cancelModalBtn">Peruuta</button>
                <button type="submit" class="btn-submit" id="saveSubBtn">Tallenna tilaus</button>
            </div>
        </form>
    </div>
</div>
