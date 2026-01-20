// Система избранного
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function updateFavoritesCount() {
    const count = favorites.length;
    const favCountElements = document.querySelectorAll('#favCount');
    favCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        showNotification('Удалено из избранного', 'success');
    } else {
        favorites.push(id);
        showNotification('Добавлено в избранное!', 'success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    return favorites.includes(id);
}

function isFavorite(id) {
    return favorites.includes(id);
}

function getAllFavorites() {
    return favorites;
}

function clearFavorites() {
    favorites = [];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

// Инициализация счетчика при загрузке
updateFavoritesCount();
