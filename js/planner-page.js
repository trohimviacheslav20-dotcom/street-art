// Страница планировщика
function renderPlan() {
    const planList = document.getElementById('planList');
    const planEmpty = document.getElementById('planEmpty');
    const planContent = document.getElementById('planContent');
    const savePlanBtn = document.getElementById('savePlan');
    const clearPlanBtn = document.getElementById('clearPlan');
    const loadPlanBtn = document.getElementById('loadPlan');
    const plan = getPlan();
    
    if (!planList || !planEmpty || !planContent) return;
    
    if (plan.length === 0) {
        planEmpty.style.display = 'block';
        planContent.style.display = 'none';
        // Скрываем кнопки "Сохранить план" и "Очистить план", показываем только "Загрузить готовый план"
        if (savePlanBtn) savePlanBtn.style.display = 'none';
        if (clearPlanBtn) clearPlanBtn.style.display = 'none';
        if (loadPlanBtn) loadPlanBtn.style.display = 'block';
        return;
    }
    
    planEmpty.style.display = 'none';
    planContent.style.display = 'block';
    // Показываем все кнопки когда план не пуст
    if (savePlanBtn) savePlanBtn.style.display = 'block';
    if (clearPlanBtn) clearPlanBtn.style.display = 'block';
    if (loadPlanBtn) loadPlanBtn.style.display = 'block';
    
    planList.innerHTML = plan.map((item, index) => {
        const artwork = artworks.find(a => a.id === item.id);
        const districtClass = getDistrictClass(item.district);
        
        return `
            <div class="plan-item" data-index="${index}">
                <div class="plan-item__number">${index + 1}</div>
                <img src="assets/images/${item.image || 'placeholder.jpg'}" 
                     alt="${item.title}" 
                     class="plan-item__image"
                     loading="lazy">
                <div class="plan-item__info">
                    <h3 class="plan-item__title">${item.title}</h3>
                    <p class="plan-item__artist">${item.artist}</p>
                    <p class="plan-item__address">
                        <span class="plan-item__district ${districtClass}">${item.district}</span>
                        ${item.address}
                    </p>
                </div>
                <div class="plan-item__actions">
                    <button class="plan-item__btn" data-action="up" data-index="${index}">
                        Вверх
                    </button>
                    <button class="plan-item__btn" data-action="down" data-index="${index}">
                        Вниз
                    </button>
                    <button class="plan-item__btn plan-item__btn--remove" data-action="remove" data-index="${index}">
                        Удалить
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Обработчики кнопок
    planList.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            
            if (action === 'up') {
                if (moveUp(index)) {
                    renderPlan();
                    renderPlanStats();
                }
            } else if (action === 'down') {
                if (moveDown(index)) {
                    renderPlan();
                    renderPlanStats();
                }
            } else if (action === 'remove') {
                removeFromPlan(plan[index].id);
                renderPlan();
                renderPlanStats();
            }
        });
    });
    
    renderPlanStats();
}

function renderPlanStats() {
    const planStats = document.getElementById('planStats');
    if (!planStats) return;
    
    const plan = getPlan();
    if (plan.length === 0) {
        planStats.innerHTML = '';
        return;
    }
    
    const stats = calculatePlan();
    const timeFormatted = formatTime(stats.totalTime);
    
    const districtCounts = {};
    plan.forEach(item => {
        districtCounts[item.district] = (districtCounts[item.district] || 0) + 1;
    });
    
    const districtList = Object.entries(districtCounts)
        .map(([district, count]) => `${district} (${count})`)
        .join(', ');
    
    let warning = '';
    if (stats.districts.length > 1) {
        const hasPromzone = stats.districts.includes('Промзона');
        const hasRemote = stats.districts.some(d => d === 'Промзона' || d === 'Новый район');
        if (hasRemote && stats.districts.length > 2) {
            warning = '<div class="planner-page__warning">⚠ Объекты в отдаленных районах - учтите время на переезды</div>';
        } else if (stats.districts.length <= 2) {
            warning = '<div class="planner-page__warning" style="background: rgba(76, 175, 80, 0.1); border-color: #4CAF50;">✓ Объекты расположены компактно</div>';
        }
    }
    
    planStats.innerHTML = `
        <h3>Ваш план: ${plan.length} объектов в ${stats.districtCount} районах</h3>
        <div class="planner-page__stats-item">
            <strong>Районы:</strong> ${districtList}
        </div>
        <div class="planner-page__stats-item">
            <strong>Примерное расстояние:</strong> ${stats.totalDistance} км
        </div>
        <div class="planner-page__stats-item">
            <strong>Примерное время:</strong> ${timeFormatted}
        </div>
        <p style="font-size: 12px; color: var(--color-gray-medium); margin-top: 10px; margin-bottom: 0;">
            Расчет приблизительный, учитывает время на осмотр и переезды между районами
        </p>
        ${warning}
    `;
}

function savePlan() {
    const plan = getPlan();
    if (plan.length === 0) {
        showNotification('План пуст!', 'success');
        return;
    }
    
    const modal = document.getElementById('saveModal');
    const planNameInput = document.getElementById('planName');
    
    if (!modal || !planNameInput) return;
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    planNameInput.value = '';
    planNameInput.focus();
}

function confirmSavePlan() {
    const planNameInput = document.getElementById('planName');
    const modal = document.getElementById('saveModal');
    
    if (!planNameInput || !modal) return;
    
    const name = planNameInput.value.trim();
    if (!name) {
        showNotification('Введите название плана', 'success');
        return;
    }
    
    const plan = getPlan();
    const stats = calculatePlan();
    
    const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
    savedPlans.push({
        id: Date.now().toString(),
        name: name,
        date: new Date().toLocaleDateString('ru-RU'),
        artworks: plan.map(p => p.id),
        distance: stats.totalDistance,
        time: stats.totalTime
    });
    
    localStorage.setItem('savedPlans', JSON.stringify(savedPlans));
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    showNotification('План сохранен!', 'success');
}

function loadPlan() {
    const modal = document.getElementById('loadModal');
    const plansList = document.getElementById('presetPlansList');
    
    if (!modal || !plansList) return;
    
    const savedPlans = JSON.parse(localStorage.getItem('savedPlans') || '[]');
    const allPlans = [...presetPlans, ...savedPlans];
    
    plansList.innerHTML = allPlans.map(plan => {
        const artworksList = plan.artworks.map(id => {
            const artwork = artworks.find(a => a.id === id);
            return artwork ? artwork.title : '';
        }).filter(Boolean).slice(0, 3).join(', ') + (plan.artworks.length > 3 ? '...' : '');
        
        return `
            <div class="preset-plan-card" data-id="${plan.id}">
                <h4 class="preset-plan-card__name">${plan.name}</h4>
                <p class="preset-plan-card__info">
                    Объектов: ${plan.artworks.length} | 
                    Расстояние: ${plan.distance} км | 
                    Время: ${formatTime(plan.time)}
                </p>
                <p class="preset-plan-card__description">${plan.description || artworksList}</p>
            </div>
        `;
    }).join('');
    
    plansList.querySelectorAll('.preset-plan-card').forEach(card => {
        card.addEventListener('click', () => {
            const planId = card.dataset.id;
            const planToLoad = allPlans.find(p => p.id === planId);
            
            if (!planToLoad) return;
            
            if (confirm('Заменить текущий план или добавить к нему?')) {
                // Замена
                clearPlan();
                planToLoad.artworks.forEach(id => {
                    addToPlan(id);
                });
            } else {
                // Добавление
                planToLoad.artworks.forEach(id => {
                    if (!isInPlan(id)) {
                        addToPlan(id);
                    }
                });
            }
            
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            renderPlan();
            renderPlanStats();
        });
    });
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function clearPlanConfirm() {
    if (confirm('Вы уверены, что хотите очистить план?')) {
        clearPlan();
        renderPlan();
        renderPlanStats();
        showNotification('План очищен', 'success');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderPlan();
    renderPlanStats();
    
    document.getElementById('savePlan')?.addEventListener('click', savePlan);
    document.getElementById('loadPlan')?.addEventListener('click', loadPlan);
    document.getElementById('clearPlan')?.addEventListener('click', clearPlanConfirm);
    
    document.getElementById('confirmSave')?.addEventListener('click', confirmSavePlan);
    document.getElementById('cancelSave')?.addEventListener('click', () => {
        document.getElementById('saveModal')?.classList.remove('active');
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('#saveModal .modal__close, #saveModal .modal__overlay').forEach(el => {
        el.addEventListener('click', () => {
            document.getElementById('saveModal')?.classList.remove('active');
        });
    });
    
    document.querySelectorAll('#loadModal .modal__close, #loadModal .modal__overlay').forEach(el => {
        el.addEventListener('click', () => {
            document.getElementById('loadModal')?.classList.remove('active');
        });
    });
});
