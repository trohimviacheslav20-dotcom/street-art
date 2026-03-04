// Страница художников
let filteredArtists = [...artists];

function getArtistWorksCount(artistId) {
    return artworks.filter(a => a.artist === artistId).length;
}

function renderArtistsList() {
    const grid = document.getElementById('artistsGrid');
    if (!grid) return;
    
    grid.innerHTML = filteredArtists.map(artist => {
        const worksCount = getArtistWorksCount(artist.id);
        
        return `
            <div class="artist-card" data-id="${artist.id}">
                <img src="assets/images/${artist.avatar || 'placeholder.jpg'}" 
                     alt="${artist.name}" 
                     class="artist-card__avatar"
                     loading="lazy">
                <div class="artist-card__content">
                    <h3 class="artist-card__name">${artist.name}</h3>
                    ${artist.realName ? `<p class="artist-card__real-name">${artist.realName}</p>` : ''}
                    <p class="artist-card__works">Работ: ${worksCount}</p>
                    <p class="artist-card__style">Стиль: ${artist.style}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Обработчики кликов
    grid.querySelectorAll('.artist-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            showArtistProfile(id);
        });
    });
}

function showArtistProfile(artistId) {
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;
    
    const artistsPage = document.getElementById('artistsPage');
    const artistProfile = document.getElementById('artistProfile');
    const profileContent = document.getElementById('artistProfileContent');
    
    if (!artistsPage || !artistProfile || !profileContent) return;
    
    const worksCount = getArtistWorksCount(artist.id);
    const artistWorks = artworks.filter(a => a.artist === artistId);
    const bestWorksIds = artist.bestWorks || [];
    const bestWorks = bestWorksIds.map(id => artworks.find(a => a.id === id)).filter(Boolean).slice(0, 6);
    
    profileContent.innerHTML = `
        <div class="artist-profile__header">
            <img src="assets/images/${artist.avatar || 'placeholder.jpg'}" 
                 alt="${artist.name}" 
                 class="artist-profile__avatar">
            <div class="artist-profile__info">
                <h1 class="artist-profile__name">${artist.name}</h1>
                ${artist.realName ? `<p class="artist-profile__real-name">${artist.realName}</p>` : ''}
                <p class="artist-profile__meta">
                    <span>Работ в базе: ${worksCount}</span>
                    <span>•</span>
                    <span>Работает в городе с ${artist.activeSince} года</span>
                </p>
                <p class="artist-profile__style"><strong>Основной стиль:</strong> ${artist.style}</p>
            </div>
        </div>
        
        <div class="artist-profile__bio">
            <h2>Биография</h2>
            <p>${artist.bio}</p>
        </div>
        
        ${artist.quote ? `
            <div class="artist-profile__quote">
                <blockquote>"${artist.quote}"</blockquote>
            </div>
        ` : ''}
        
        <div class="artist-profile__actions">
            <button class="artist-profile__btn artist-profile__btn_add-all" 
                    data-action="add-all" 
                    data-id="${artist.id}">
                Добавить все работы в план
            </button>
            <button class="artist-profile__btn artist-profile__btn_view-all" 
                    data-action="view-all-works" 
                    data-artist="${artist.id}">
                Смотреть все работы художника
            </button>
        </div>
        
        <div class="artist-profile__works">
            <h2>Лучшие работы</h2>
            <div class="artist-works-grid">
                ${bestWorks.map(work => {
                    const districtClass = getDistrictClass(work.district);
                    return `
                        <div class="artist-work-card" data-id="${work.id}">
                            <img src="assets/images/${work.images[0] || 'placeholder.jpg'}" 
                                 alt="${work.title}" 
                                 class="artist-work-card__image"
                                 loading="lazy">
                            <div class="artist-work-card__info">
                                <h4 class="artist-work-card__title">${work.title}</h4>
                                <p class="artist-work-card__district ${districtClass}">${work.district}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    artistsPage.style.display = 'none';
    artistProfile.style.display = 'block';
    
    // Обработчик кнопки "Добавить все работы в план"
    const addAllBtn = profileContent.querySelector('[data-action="add-all"]');
    if (addAllBtn) {
        addAllBtn.addEventListener('click', () => {
            let added = 0;
            artistWorks.forEach(work => {
                if (!isInPlan(work.id)) {
                    addToPlan(work.id);
                    added++;
                }
            });
            if (added > 0) {
                showNotification(`Добавлено ${added} работ в план!`, 'success');
            } else {
                showNotification('Все работы уже в плане', 'success');
            }
        });
    }
    
    // Обработчик кнопки "Смотреть все работы художника"
    const viewAllBtn = profileContent.querySelector('[data-action="view-all-works"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const artistId = viewAllBtn.dataset.artist;
            window.location.href = `index.html?artist=${artistId}`;
        });
    }
    
    // Обработчики кликов на работы
    profileContent.querySelectorAll('.artist-work-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            window.location.href = `index.html#artwork-${id}`;
        });
    });
}

function filterArtists() {
    const search = document.getElementById('artistSearch')?.value.toLowerCase() || '';
    const styleFilter = document.getElementById('styleFilter')?.value || '';
    
    filteredArtists = artists.filter(artist => {
        const matchSearch = !search || 
            artist.name.toLowerCase().includes(search) || 
            (artist.realName && artist.realName.toLowerCase().includes(search));
        const matchStyle = !styleFilter || artist.style.includes(styleFilter);
        
        return matchSearch && matchStyle;
    });
    
    renderArtistsList();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверка параметра URL для открытия профиля
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('id');
    
    if (artistId) {
        showArtistProfile(artistId);
    } else {
        renderArtistsList();
    }
    
    // Обработчики фильтров
    const searchInput = document.getElementById('artistSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterArtists);
    }
    
    const styleFilter = document.getElementById('styleFilter');
    if (styleFilter) {
        styleFilter.addEventListener('change', filterArtists);
    }
    
    // Кнопка "Назад"
    const backBtn = document.getElementById('backToList');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const artistsPage = document.getElementById('artistsPage');
            const artistProfile = document.getElementById('artistProfile');
            
            if (artistsPage && artistProfile) {
                artistProfile.style.display = 'none';
                artistsPage.style.display = 'block';
                window.history.pushState({}, '', 'artists.html');
            }
        });
    }
});
