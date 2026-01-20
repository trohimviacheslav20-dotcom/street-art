// Основная логика приложения
document.addEventListener('DOMContentLoaded', () => {
    // Мобильное меню
    const burgerBtn = document.getElementById('burgerBtn');
    const headerNav = document.querySelector('.header__nav');
    
    if (burgerBtn && headerNav) {
        burgerBtn.addEventListener('click', () => {
            headerNav.classList.toggle('active');
        });
        
        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !burgerBtn.contains(e.target)) {
                headerNav.classList.remove('active');
            }
        });
    }
    
    // Обновляем счетчики
    updateFavoritesCount();
    updatePlanCount();
});
