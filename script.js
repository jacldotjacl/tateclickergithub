let tatecoins = 0;
let tatecoinsPerClick = 1;
let tatecoinsPerSecond = 0;

const resourceCount = document.getElementById('resource-count');
const mineBtn = document.getElementById('mine-btn');
const autoMinerBtn = document.getElementById('auto-miner');
const drillBtn = document.getElementById('drill');
const perClickDisplay = document.getElementById('per-click');
const perSecondDisplay = document.getElementById('per-second');
const infoBtn = document.getElementById('info-btn');
const infoFlyout = document.getElementById('info-flyout');
const resetBtn = document.getElementById('reset-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const snakeBtn = document.getElementById('snake-btn');
const snakeFlyout = document.getElementById('snake-flyout');

// Update display
function updateDisplay() {
    resourceCount.textContent = Math.floor(tatecoins) + ' Tatecoins';
    perClickDisplay.textContent = tatecoinsPerClick;
    perSecondDisplay.textContent = tatecoinsPerSecond;
    updateButtons();
}

// Update button states
function updateButtons() {
    autoMinerBtn.disabled = tatecoins < 10;
    drillBtn.disabled = tatecoins < 50;
}

// Mine manually
mineBtn.addEventListener('click', () => {
    tatecoins += tatecoinsPerClick;
    updateDisplay();
    saveGame();
});

// Buy auto miner
autoMinerBtn.addEventListener('click', () => {
    if (tatecoins >= 10) {
        tatecoins -= 10;
        tatecoinsPerSecond += 1;
        updateDisplay();
        saveGame();
    }
});

// Buy drill
drillBtn.addEventListener('click', () => {
    if (tatecoins >= 50) {
        tatecoins -= 50;
        tatecoinsPerClick += 5;
        updateDisplay();
        saveGame();
    }
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
        tatecoinsPerSecond: tatecoinsPerSecond,
        lastSaved: Date.now()
    };
    localStorage.setItem('spaceMinerSave', JSON.stringify(gameState));
}

// Load game state
function loadGame() {
    const savedState = localStorage.getItem('spaceMinerSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        tatecoins = gameState.tatecoins || 0;
        tatecoinsPerClick = gameState.tatecoinsPerClick || 1;
        tatecoinsPerSecond = gameState.tatecoinsPerSecond || 0;
        
        if (gameState.lastSaved) {
            const timeAway = (Date.now() - gameState.lastSaved) / 1000;
            const offlineGains = timeAway * tatecoinsPerSecond;
            tatecoins += offlineGains;
        }
        
        updateDisplay();
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        tatecoins = 0;
        tatecoinsPerClick = 1;
        tatecoinsPerSecond = 0;
        localStorage.removeItem('spaceMinerSave');
        updateDisplay();
        infoFlyout.classList.remove('active');
    }
}

// Toggle info flyout
infoBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from closing immediately
    infoFlyout.classList.toggle('active');
    snakeFlyout.classList.remove('active');
});

// Toggle snake flyout
snakeBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent click from closing immediately
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
infoFlyout.addEventListener('click', (e) => {
    e.stopPropagation();
});

snakeFlyout.addEventListener('click', (e) => {
    e.stopPropagation();
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
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Load game on start
loadGame();
