// Модальные окна
function getDistrictClass(district) {
    const classes = {
        'Центр': 'card__district_center',
        'Набережная': 'card__district_naberezhna',
        'Старый город': 'card__district_old-city',
        'Промзона': 'card__district_promzone',
        'Новый район': 'card__district_new-district'
    };
    return classes[district] || '';
}

function showNotification(message, type = '') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

function openArtworkModal(artworkId) {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork) return;
    
    const modal = document.getElementById('artworkModal');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalBody) return;
    
    const isFav = isFavorite(artwork.id);
    const inPlan = isInPlan(artwork.id);
    const districtClass = getDistrictClass(artwork.district);
    
    modalBody.innerHTML = `
        <div class="modal__gallery">
            ${artwork.images.map(img => `
                <img src="assets/images/${img}" 
                     alt="${artwork.title}" 
                     loading="lazy">
            `).join('')}
        </div>
        <h2 class="modal__title" id="modalTitle">${artwork.title}</h2>
        <p class="modal__year">${artwork.year}</p>
        <div class="modal__info">
            <div class="modal__info-item">
                <strong>Художник:</strong>
                <a href="artists.html?id=${artwork.artist}" class="modal__artist-link" id="artistLink">${artwork.artist}</a>
            </div>
            <div class="modal__info-item">
                <strong>Тип:</strong> ${artwork.type}
            </div>
            <div class="modal__info-item">
                <strong>Стиль:</strong> ${artwork.style}
            </div>
            <div class="modal__info-item">
                <strong>Район:</strong> <span class="card__district ${districtClass}">${artwork.district}</span>
            </div>
            <div class="modal__info-item">
                <strong>Адрес:</strong> ${artwork.address}
            </div>
        </div>
        <div class="modal__description">
            ${artwork.description}
        </div>
        <div class="modal__actions">
            <button class="modal__btn modal__btn_add" data-action="add-plan" data-id="${artwork.id}">
                ${inPlan ? 'Убрать из плана' : 'Добавить в план'}
            </button>
            <button class="modal__btn modal__btn_favorite ${isFav ? 'active' : ''}" 
                    data-action="favorite" 
                    data-id="${artwork.id}">
                ${isFav ? '★ В избранном' : '☆ В избранное'}
            </button>
            <button class="modal__btn modal__btn_artist" 
                    data-action="view-artist-works" 
                    data-artist="${artwork.artist}">
                Все работы художника
            </button>
            <button class="modal__btn modal__btn_share" data-action="share" data-id="${artwork.id}">
                Поделиться
            </button>
        </div>
    `;
    
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Обработчики кнопок в модальном окне
    modalBody.querySelector('[data-action="add-plan"]')?.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (isInPlan(id)) {
            removeFromPlan(id);
            e.target.textContent = 'Добавить в план';
        } else {
            addToPlan(id);
            e.target.textContent = 'Убрать из плана';
        }
    });
    
    modalBody.querySelector('[data-action="favorite"]')?.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        const isFav = toggleFavorite(id);
        e.target.classList.toggle('active', isFav);
        e.target.textContent = isFav ? '★ В избранном' : '☆ В избранное';
    });
    
    modalBody.querySelector('[data-action="share"]')?.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        shareArtwork(id);
    });
    
    // Обработчик ссылки на художника
    modalBody.querySelector('#artistLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        window.location.href = `artists.html?id=${artwork.artist}`;
    });
    
    // Обработчик кнопки "Все работы художника"
    modalBody.querySelector('[data-action="view-artist-works"]')?.addEventListener('click', (e) => {
        const artistId = e.target.dataset.artist;
        closeModal();
        window.location.href = `index.html?artist=${artistId}`;
    });
}

function closeModal() {
    const modal = document.getElementById('artworkModal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function shareArtwork(artworkId) {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork) return;
    
    if (navigator.share) {
        navigator.share({
            title: artwork.title,
            text: artwork.description,
            url: window.location.href
        }).catch(() => {
            copyToClipboard();
        });
    } else {
        copyToClipboard();
    }
}

function copyToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Ссылка скопирована!', 'success');
    });
}

// Обработчики закрытия модального окна
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('artworkModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });
});
