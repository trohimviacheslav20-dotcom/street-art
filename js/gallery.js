// Галерея с фильтрацией и сортировкой
let filteredArtworks = [...artworks];

function getDistrictClass(district) {
    const classes = {
        'Центр': 'card__district--center',
        'Набережная': 'card__district--naberezhna',
        'Старый город': 'card__district--old-city',
        'Промзона': 'card__district--promzone',
        'Новый район': 'card__district--new-district'
    };
    return classes[district] || '';
}

function renderGallery() {
    const gallery = document.getElementById('gallery');
    const empty = document.getElementById('galleryEmpty');
    
    if (!gallery) return;
    
    if (filteredArtworks.length === 0) {
        gallery.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    gallery.style.display = 'grid';
    if (empty) empty.style.display = 'none';
    
    gallery.innerHTML = filteredArtworks.map(artwork => {
        const districtClass = getDistrictClass(artwork.district);
        const isFav = isFavorite(artwork.id);
        const inPlan = isInPlan(artwork.id);
        
        return `
            <div class="card" data-id="${artwork.id}">
                <img src="assets/images/${artwork.images[0] || 'placeholder.jpg'}" 
                     alt="${artwork.title}" 
                     class="card__image"
                     loading="lazy">
                <div class="card__content">
                    <h3 class="card__title">${artwork.title}</h3>
                    <p class="card__artist">${artwork.artist}</p>
                    <div class="card__info">
                        <span class="card__district ${districtClass}">${artwork.district}</span>
                        <span class="card__type">${artwork.type}</span>
                    </div>
                    <div class="card__actions">
                        <button class="card__btn card__btn--add" 
                                data-action="add-plan" 
                                data-id="${artwork.id}">
                            ${inPlan ? 'В плане' : 'В план'}
                        </button>
                        <button class="card__btn card__btn--favorite ${isFav ? 'active' : ''}" 
                                data-action="favorite" 
                                data-id="${artwork.id}"
                                aria-label="Добавить в избранное">
                            ♥
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Добавляем обработчики событий
    gallery.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card__btn')) {
                const id = parseInt(card.dataset.id);
                openArtworkModal(id);
            }
        });
    });
    
    gallery.querySelectorAll('[data-action="add-plan"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (isInPlan(id)) {
                removeFromPlan(id);
                btn.textContent = 'В план';
            } else {
                addToPlan(id);
                btn.textContent = 'В плане';
            }
        });
    });
    
    gallery.querySelectorAll('[data-action="favorite"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const isFav = toggleFavorite(id);
            btn.classList.toggle('active', isFav);
        });
    });
}

function filterArtworks() {
    const districtFilters = Array.from(document.querySelectorAll('[data-filter="district"]:checked')).map(cb => cb.value);
    const typeFilters = Array.from(document.querySelectorAll('[data-filter="type"]:checked')).map(cb => cb.value);
    const styleFilters = Array.from(document.querySelectorAll('[data-filter="style"]:checked')).map(cb => cb.value);
    const artistFilter = document.getElementById('artistFilter')?.value || '';
    
    filteredArtworks = artworks.filter(artwork => {
        const matchDistrict = districtFilters.length === 0 || districtFilters.includes(artwork.district);
        const matchType = typeFilters.length === 0 || typeFilters.includes(artwork.type);
        const matchStyle = styleFilters.length === 0 || styleFilters.includes(artwork.style);
        const matchArtist = !artistFilter || artwork.artist === artistFilter;
        
        return matchDistrict && matchType && matchStyle && matchArtist;
    });
    
    // Сортировка
    const sortType = document.querySelector('input[name="sort"]:checked')?.value || 'date';
    
    if (sortType === 'alphabet') {
        filteredArtworks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortType === 'random') {
        filteredArtworks = filteredArtworks.sort(() => Math.random() - 0.5);
    } else {
        filteredArtworks.sort((a, b) => b.year - a.year);
    }
    
    renderGallery();
}

// Инициализация фильтров
function initFilters() {
    // Заполняем список художников
    const artistFilter = document.getElementById('artistFilter');
    if (artistFilter) {
        const uniqueArtists = [...new Set(artworks.map(a => a.artist))].sort();
        uniqueArtists.forEach(artist => {
            const option = document.createElement('option');
            option.value = artist;
            option.textContent = artist;
            artistFilter.appendChild(option);
        });
    }
    
    // Добавляем обработчики фильтров
    document.querySelectorAll('[data-filter]').forEach(filter => {
        filter.addEventListener('change', filterArtworks);
    });
    
    document.querySelectorAll('input[name="sort"]').forEach(radio => {
        radio.addEventListener('change', filterArtworks);
    });
    
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.querySelectorAll('[data-filter]').forEach(filter => {
                filter.checked = false;
            });
            document.querySelectorAll('input[name="sort"]').forEach(radio => {
                radio.checked = radio.value === 'date';
            });
            if (artistFilter) artistFilter.value = '';
            filterArtworks();
        });
    }
}

// Инициализация при загрузке
function initGallery() {
    initFilters();
    
    // Проверка URL параметра для фильтрации по художнику
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artist');
    
    if (artistId) {
        const artistFilter = document.getElementById('artistFilter');
        if (artistFilter) {
            artistFilter.value = artistId;
        }
    }
    
    filterArtworks();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGallery);
} else {
    initGallery();
}
