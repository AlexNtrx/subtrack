<!-- CONTROLS COMPONENT (SEARCH, FILTER TABS & SORTING) -->
<div class="controls-bar">
    <div class="filter-tabs" id="filterTabs">
        <button class="tab-btn active" data-cat="Kaikki">Kaikki</button>
        <button class="tab-btn" data-cat="Suoratoisto">Suoratoisto</button>
        <button class="tab-btn" data-cat="Työkalut">Työkalut</button>
        <button class="tab-btn" data-cat="Vapaa-aika">Vapaa-aika</button>
    </div>
    <div class="controls-right">
        <div class="sort-box">
            <i class="fa-solid fa-arrow-down-short-wide"></i>
            <select id="sortSelect" class="sort-select" title="Järjestä tilaukset">
                <option value="date_asc">Eräpäivä (Lähin ensin)</option>
                <option value="price_desc">Hinta (Kallein ensin)</option>
                <option value="price_asc">Hinta (Edullisin ensin)</option>
                <option value="name_asc">Nimi (A - Z)</option>
            </select>
        </div>
        <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" id="searchInput" class="search-input" placeholder="Hae tilausta...">
        </div>
    </div>
</div>
