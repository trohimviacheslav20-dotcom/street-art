// Планировщик визита
let plan = JSON.parse(localStorage.getItem('plan') || '[]');

function updatePlanCount() {
    const count = plan.length;
    const planCountElements = document.querySelectorAll('#planCount');
    planCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

function addToPlan(artworkId) {
    const artwork = artworks.find(a => a.id === artworkId);
    if (!artwork) return;
    
    if (plan.find(p => p.id === artworkId)) {
        showNotification('Объект уже в плане', 'success');
        return;
    }
    
    plan.push({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        district: artwork.district,
        address: artwork.address,
        image: artwork.images[0]
    });
    
    localStorage.setItem('plan', JSON.stringify(plan));
    updatePlanCount();
    showNotification(`Добавлено в план! Объектов: ${plan.length}`, 'success');
}

function removeFromPlan(artworkId) {
    plan = plan.filter(p => p.id !== artworkId);
    localStorage.setItem('plan', JSON.stringify(plan));
    updatePlanCount();
}

function isInPlan(artworkId) {
    return plan.some(p => p.id === artworkId);
}

function getPlan() {
    return plan;
}

function clearPlan() {
    plan = [];
    localStorage.setItem('plan', JSON.stringify(plan));
    updatePlanCount();
}

function moveUp(index) {
    if (index > 0) {
        [plan[index], plan[index - 1]] = [plan[index - 1], plan[index]];
        localStorage.setItem('plan', JSON.stringify(plan));
        return true;
    }
    return false;
}

function moveDown(index) {
    if (index < plan.length - 1) {
        [plan[index], plan[index + 1]] = [plan[index + 1], plan[index]];
        localStorage.setItem('plan', JSON.stringify(plan));
        return true;
    }
    return false;
}

function calculatePlan() {
    if (plan.length === 0) {
        return {
            totalDistance: 0,
            totalTime: 0,
            districts: [],
            districtCount: 0
        };
    }
    
    const districts = [...new Set(plan.map(p => p.district))];
    const baseDistance = plan.length * 0.8;
    const districtDistance = districts.length * 1.5;
    const totalDistance = +(baseDistance + districtDistance).toFixed(1);
    
    const walkTime = (totalDistance / 4) * 60;
    const viewTime = plan.length * 15;
    const transferTime = (districts.length - 1) * 20;
    const totalTime = Math.round(walkTime + viewTime + transferTime);
    
    return { totalDistance, totalTime, districts, districtCount: districts.length };
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `около ${hours} часов ${mins} минут`;
    }
    return `около ${mins} минут`;
}

// Инициализация счетчика при загрузке
updatePlanCount();
