let tatecoins = 0;
let tatecoinsPerClick = 1;
let tatecoinsPerSecond = 0;
let workers = {};
let upgrades = {};

const resourceCount = document.getElementById('resource-count');
const mineBtn = document.getElementById('mine-btn');
const perClickDisplay = document.getElementById('per-click');
const perSecondDisplay = document.getElementById('per-second');
const infoBtn = document.getElementById('info-btn');
const infoFlyout = document.getElementById('info-flyout');
const resetBtn = document.getElementById('reset-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const snakeBtn = document.getElementById('snake-btn');
const snakeFlyout = document.getElementById('snake-flyout');
const offlineEarningsModal = document.getElementById('offline-earnings-modal');
const offlineEarningsDisplay = document.getElementById('offline-earnings');
const closeModal = document.getElementById('close-modal');
const workersContainer = document.getElementById('workers-container');
const upgradesContainer = document.getElementById('upgrades-container');
const showPurchasedUpgrades = document.getElementById('show-purchased-upgrades');

// Update display
function updateDisplay() {
    resourceCount.textContent = Math.floor(tatecoins) + ' Tatecoins';
    perClickDisplay.textContent = tatecoinsPerClick;
    perSecondDisplay.textContent = tatecoinsPerSecond;
    updateButtons();
    updateWorkerCounters();
    updateWorkerTooltips();
}

// Update button states
function updateButtons() {
    document.querySelectorAll('#workers-container button, #upgrades-container button:not(.purchased)').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        btn.disabled = tatecoins < cost;
    });
}

// Update worker counters and prices
function updateWorkerCounters() {
    document.querySelectorAll('#workers-container button').forEach(btn => {
        const workerId = btn.id;
        const worker = workers[workerId];
        const count = worker?.count || 0;
        const baseCost = parseInt(btn.dataset.baseCost);
        const name = btn.dataset.name;
        const currentCost = Math.round(baseCost * Math.pow(1.15, count));
        
        let counter = btn.querySelector('.worker-counter');
        if (!counter) {
            counter = document.createElement('span');
            counter.classList.add('worker-counter');
            btn.appendChild(counter);
        }
        counter.textContent = count;

        const nameSpan = btn.querySelector('.name-span');
        if (nameSpan) {
            nameSpan.textContent = `${name} (Cost: ${currentCost})`;
        }
        btn.dataset.cost = currentCost;
    });
}

// Update worker tooltips
function updateWorkerTooltips() {
    document.querySelectorAll('#workers-container button').forEach(btn => {
        const workerId = btn.id;
        const worker = workers[workerId];
        if (worker && worker.description) {
            let tooltip = btn.querySelector('.tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                btn.appendChild(tooltip);
            }
            let earnings = worker.baseValue;
            for (const upgrade of Object.values(upgrades)) {
                if (upgrade.effect.type === 'workerMultiplier' && upgrade.effect.workerId === workerId) {
                    earnings *= upgrade.effect.value;
                }
            }
            tooltip.innerHTML = `<p class="earnings">${earnings} Tatecoins/sec</p><p>${worker.description}</p>`;
        }
    });
}

// Calculate total Tatecoins per second
function calculatePerSecond() {
    tatecoinsPerSecond = 0;
    for (const [id, worker] of Object.entries(workers)) {
        let multiplier = 1;
        for (const upgrade of Object.values(upgrades)) {
            if (upgrade.effect.type === 'workerMultiplier' && upgrade.effect.workerId === id) {
                multiplier *= upgrade.effect.value;
            }
        }
        tatecoinsPerSecond += worker.baseValue * worker.count * multiplier;
    }
}

// Mine manually with click text
mineBtn.addEventListener('click', (e) => {
    tatecoins += tatecoinsPerClick;
    updateDisplay();
    saveGame();

    const clickText = document.createElement('div');
    clickText.classList.add('click-text');
    clickText.textContent = 'Click!';
    const clickerArea = mineBtn.parentElement;
    const rect = clickerArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    clickText.style.left = `${x}px`;
    clickText.style.top = `${y}px`;
    clickerArea.appendChild(clickText);
    clickText.addEventListener('animationend', () => clickText.remove());
});

// Auto mining
setInterval(() => {
    tatecoins += tatecoinsPerSecond / 10;
    updateDisplay();
}, 100);

// Save game state
function saveGame() {
    const gameState = {
        tatecoins: tatecoins,
        tatecoinsPerClick: tatecoinsPerClick,
        workers: workers,
        upgrades: upgrades,
        lastSaved: Date.now()
    };
    localStorage.setItem('spaceMinerSave', JSON.stringify(gameState));
}

// Load game state with offline earnings
function loadGame() {
    const savedState = localStorage.getItem('spaceMinerSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        tatecoins = gameState.tatecoins || 0;
        tatecoinsPerClick = gameState.tatecoinsPerClick || 1;
        workers = gameState.workers || {};
        upgrades = gameState.upgrades || {};

        // Calculate tatecoinsPerSecond first
        calculatePerSecond();

        // Then calculate offline earnings
        if (gameState.lastSaved) {
            const timeAway = (Date.now() - gameState.lastSaved) / 1000; // Seconds away
            const offlineGains = Math.floor(timeAway * tatecoinsPerSecond);
            if (offlineGains > 0) {
                tatecoins += offlineGains;
                offlineEarningsDisplay.textContent = offlineGains;
                offlineEarningsModal.style.display = 'block'; // Show modal
            }
        }
        
        updateDisplay();
    }
    loadWorkersAndUpgrades();
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        tatecoins = 0;
        tatecoinsPerClick = 1;
        workers = {};
        upgrades = {};
        calculatePerSecond();
        updateDisplay();
        infoFlyout.classList.remove('active');
        loadWorkersAndUpgrades();
        showPurchasedUpgrades.checked = false;
        document.querySelectorAll('#upgrades-container button.purchased').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

// Load workers and upgrades from JSON files
async function loadWorkersAndUpgrades() {
    try {
        const workersUrl = 'https://raw.githubusercontent.com/jacldotjacl/tateclickerdata/refs/heads/main/workers.json';
        const upgradesUrl = 'https://raw.githubusercontent.com/jacldotjacl/tateclickerdata/refs/heads/main/upgrades.json';

        // Fetch workers
        const workersResponse = await fetch(workersUrl);
        const workerData = await workersResponse.json();
        workersContainer.innerHTML = '';
        workerData.forEach(worker => {
            if (!workers[worker.id]) {
                workers[worker.id] = {
                    count: 0,
                    baseValue: worker.effect.type === 'perSecond' ? worker.effect.value : 0,
                    description: worker.description || '',
                    baseCost: worker.cost,
                    name: worker.name
                };
            }
            const btn = document.createElement('button');
            btn.id = worker.id;
            btn.dataset.baseCost = worker.cost;
            btn.dataset.cost = worker.cost;
            btn.dataset.name = worker.name;

            if (worker.icon) {
                const img = document.createElement('img');
                img.src = worker.icon;
                img.classList.add('worker-icon');
                btn.appendChild(img);
            }

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('name-span');
            nameSpan.textContent = `${worker.name} (Cost: ${worker.cost})`;
            btn.appendChild(nameSpan);

            const counter = document.createElement('span');
            counter.classList.add('worker-counter');
            counter.textContent = workers[worker.id].count;
            btn.appendChild(counter);

            if (worker.description) {
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                let earnings = worker.effect.value;
                tooltip.innerHTML = `<p class="earnings">${earnings} Tatecoins/sec</p><p>${worker.description}</p>`;
                btn.appendChild(tooltip);
            }

            btn.addEventListener('click', () => buyWorker(worker));
            workersContainer.appendChild(btn);
        });

        // Fetch upgrades
        const upgradesResponse = await fetch(upgradesUrl);
        const upgradeData = await upgradesResponse.json();
        upgradesContainer.innerHTML = '';
        upgradeData.forEach(upgrade => {
            const btn = document.createElement('button');
            btn.id = upgrade.id;
            btn.textContent = `${upgrade.name} (Cost: ${upgrade.cost})`;
            btn.dataset.cost = upgrade.cost;
            if (upgrades[upgrade.id]) {
                btn.classList.add('purchased');
                btn.disabled = true;
                btn.style.display = showPurchasedUpgrades.checked ? 'block' : 'none';
            } else {
                btn.addEventListener('click', () => buyUpgrade(upgrade, btn));
            }
            if (upgrade.description) {
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.innerHTML = `<p>${upgrade.description}</p>`;
                btn.appendChild(tooltip);
            }
            upgradesContainer.appendChild(btn);
        });

        calculatePerSecond();
        updateButtons();
    } catch (error) {
        console.error('Error loading workers/upgrades:', error);
    }
}

// Buy worker with price scaling
function buyWorker(worker) {
    const currentCost = Math.round(workers[worker.id].baseCost * Math.pow(1.15, workers[worker.id].count));
    if (tatecoins >= currentCost) {
        tatecoins -= currentCost;
        workers[worker.id].count++;
        calculatePerSecond();
        updateDisplay();
        saveGame();
    }
}

// Buy upgrade
function buyUpgrade(upgrade, button) {
    if (tatecoins >= upgrade.cost && !upgrades[upgrade.id]) {
        tatecoins -= upgrade.cost;
        upgrades[upgrade.id] = upgrade;
        if (upgrade.effect.type === 'perClick') {
            tatecoinsPerClick += upgrade.effect.value;
        } else if (upgrade.effect.type === 'workerMultiplier') {
            calculatePerSecond();
        }
        button.classList.add('purchased');
        button.disabled = true;
        button.style.display = showPurchasedUpgrades.checked ? 'block' : 'none';
        updateDisplay();
        saveGame();
    }
}

// Toggle show purchased upgrades
showPurchasedUpgrades.addEventListener('change', () => {
    document.querySelectorAll('#upgrades-container button.purchased').forEach(btn => {
        btn.style.display = showPurchasedUpgrades.checked ? 'block' : 'none';
    });
});

// Toggle info flyout
infoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    infoFlyout.classList.toggle('active');
    snakeFlyout.classList.remove('active');
});

// Toggle snake flyout
snakeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    snakeFlyout.classList.toggle('active');
    infoFlyout.classList.remove('active');
});

// Close flyouts when clicking outside
document.addEventListener('click', (e) => {
    if (!infoFlyout.contains(e.target) && !infoBtn.contains(e.target) &&
        !snakeFlyout.contains(e.target) && !snakeBtn.contains(e.target)) {
        infoFlyout.classList.remove('active');
        snakeFlyout.classList.remove('active');
    }
});

// Prevent clicks inside flyouts from closing them
infoFlyout.addEventListener('click', (e) => e.stopPropagation());
snakeFlyout.addEventListener('click', (e) => e.stopPropagation());

// Close modal
closeModal.addEventListener('click', () => {
    offlineEarningsModal.style.display = 'none';
});

// Reset button
resetBtn.addEventListener('click', resetGame);

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Save when closing tab/window
window.addEventListener('beforeunload', saveGame);

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Load game on start
loadGame();
