// Страница избранного
function renderFavorites() {
    const favorites = getAllFavorites();
    const gallery = document.getElementById('favoritesGallery');
    const empty = document.getElementById('favoritesEmpty');
    const actions = document.getElementById('favoritesActions');
    const countText = document.getElementById('favCountText');
    
    if (!gallery || !empty || !actions || !countText) return;
    
    if (countText) {
        countText.textContent = favorites.length;
    }
    
    if (favorites.length === 0) {
        gallery.style.display = 'none';
        empty.style.display = 'block';
        actions.style.display = 'none';
        return;
    }
    
    gallery.style.display = 'grid';
    empty.style.display = 'none';
    actions.style.display = 'flex';
    
    const favoriteArtworks = artworks.filter(a => favorites.includes(a.id));
    
    gallery.innerHTML = favoriteArtworks.map(artwork => {
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
                        <button class="card__btn card__btn--favorite active" 
                                data-action="favorite" 
                                data-id="${artwork.id}"
                                aria-label="Удалить из избранного">
                            ♥
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Обработчики событий
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
            toggleFavorite(id);
            renderFavorites(); // Обновляем список
        });
    });
}

function addAllToPlan() {
    const favorites = getAllFavorites();
    let added = 0;
    
    favorites.forEach(id => {
        if (!isInPlan(id)) {
            addToPlan(id);
            added++;
        }
    });
    
    if (added > 0) {
        showNotification(`Добавлено ${added} объектов в план!`, 'success');
    } else {
        showNotification('Все объекты уже в плане', 'success');
    }
}

function clearFavoritesConfirm() {
    if (confirm('Вы уверены, что хотите очистить избранное?')) {
        clearFavorites();
        renderFavorites();
        showNotification('Избранное очищено', 'success');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
    
    document.getElementById('addAllToPlan')?.addEventListener('click', addAllToPlan);
    document.getElementById('clearFavorites')?.addEventListener('click', clearFavoritesConfirm);
});
