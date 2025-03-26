let crystals = 0;
let crystalsPerClick = 1;
let crystalsPerSecond = 0;

const resourceCount = document.getElementById('resource-count');
const mineBtn = document.getElementById('mine-btn');
const autoMinerBtn = document.getElementById('auto-miner');
const drillBtn = document.getElementById('drill');
const perClickDisplay = document.getElementById('per-click');
const perSecondDisplay = document.getElementById('per-second');
const infoBtn = document.getElementById('info-btn');
const infoFlyout = document.getElementById('info-flyout');
const resetBtn = document.getElementById('reset-btn');

// Update display
function updateDisplay() {
    resourceCount.textContent = Math.floor(crystals) + ' Space Crystals';
    perClickDisplay.textContent = crystalsPerClick;
    perSecondDisplay.textContent = crystalsPerSecond;
    updateButtons();
}

// Update button states
function updateButtons() {
    autoMinerBtn.disabled = crystals < 10;
    drillBtn.disabled = crystals < 50;
}

// Mine manually
mineBtn.addEventListener('click', () => {
    crystals += crystalsPerClick;
    updateDisplay();
    saveGame();
});

// Buy auto miner
autoMinerBtn.addEventListener('click', () => {
    if (crystals >= 10) {
        crystals -= 10;
        crystalsPerSecond += 1;
        updateDisplay();
        saveGame();
    }
});

// Buy drill
drillBtn.addEventListener('click', () => {
    if (crystals >= 50) {
        crystals -= 50;
        crystalsPerClick += 5;
        updateDisplay();
        saveGame();
    }
});

// Auto mining
setInterval(() => {
    crystals += crystalsPerSecond / 10;
    updateDisplay();
}, 100);

// Save game state
function saveGame() {
    const gameState = {
        crystals: crystals,
        crystalsPerClick: crystalsPerClick,
        crystalsPerSecond: crystalsPerSecond,
        lastSaved: Date.now()
    };
    localStorage.setItem('spaceMinerSave', JSON.stringify(gameState));
}

// Load game state
function loadGame() {
    const savedState = localStorage.getItem('spaceMinerSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        crystals = gameState.crystals || 0;
        crystalsPerClick = gameState.crystalsPerClick || 1;
        crystalsPerSecond = gameState.crystalsPerSecond || 0;
        
        if (gameState.lastSaved) {
            const timeAway = (Date.now() - gameState.lastSaved) / 1000;
            const offlineGains = timeAway * crystalsPerSecond;
            crystals += offlineGains;
        }
        
        updateDisplay();
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        crystals = 0;
        crystalsPerClick = 1;
        crystalsPerSecond = 0;
        localStorage.removeItem('spaceMinerSave');
        updateDisplay();
        infoFlyout.classList.remove('active'); // Close flyout
    }
}

// Toggle info flyout
infoBtn.addEventListener('click', () => {
    infoFlyout.classList.toggle('active');
});

// Reset button
resetBtn.addEventListener('click', resetGame);

// Save when closing tab/window
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Auto-save every 5 seconds
setInterval(saveGame, 5000);

// Load game on start
loadGame();
