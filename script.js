let tatecoins = 0; // Changed from crystals
let tatecoinsPerClick = 1; // Updated
let tatecoinsPerSecond = 0; // Updated

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
    resourceCount.textContent = Math.floor(tatecoins) + ' Tatecoins'; // Updated
    perClickDisplay.textContent = tatecoinsPerClick;
    perSecondDisplay.textContent = tatecoinsPerSecond;
    updateButtons();
}

// Update button states
function updateButtons() {
    autoMinerBtn.disabled = tatecoins < 10; // Updated
    drillBtn.disabled = tatecoins < 50; // Updated
}

// Mine manually
mineBtn.addEventListener('click', () => {
    tatecoins += tatecoinsPerClick; // Updated
    updateDisplay();
    saveGame();
});

// Buy auto miner
autoMinerBtn.addEventListener('click', () => {
    if (tatecoins >= 10) {
        tatecoins -= 10; // Updated
        tatecoinsPerSecond += 1; // Updated
        updateDisplay();
        saveGame();
    }
});

// Buy drill
drillBtn.addEventListener('click', () => {
    if (tatecoins >= 50) {
        tatecoins -= 50; // Updated
        tatecoinsPerClick += 5; // Updated
        updateDisplay();
        saveGame();
    }
});

// Auto mining
setInterval(() => {
    tatecoins += tatecoinsPerSecond / 10; // Updated
    updateDisplay();
}, 100);

// Save game state
function saveGame() {
    const gameState = {
        tatecoins: tatecoins, // Updated
        tatecoinsPerClick: tatecoinsPerClick, // Updated
        tatecoinsPerSecond: tatecoinsPerSecond, // Updated
        lastSaved: Date.now()
    };
    localStorage.setItem('spaceMinerSave', JSON.stringify(gameState));
}

// Load game state
function loadGame() {
    const savedState = localStorage.getItem('spaceMinerSave');
    if (savedState) {
        const gameState = JSON.parse(savedState);
        tatecoins = gameState.tatecoins || 0; // Updated
        tatecoinsPerClick = gameState.tatecoinsPerClick || 1; // Updated
        tatecoinsPerSecond = gameState.tatecoinsPerSecond || 0; // Updated
        
        if (gameState.lastSaved) {
            const timeAway = (Date.now() - gameState.lastSaved) / 1000;
            const offlineGains = timeAway * tatecoinsPerSecond; // Updated
            tatecoins += offlineGains; // Updated
        }
        
        updateDisplay();
    }
}

// Reset game
function resetGame() {
    if (confirm('Are you sure you want to reset all progress?')) {
        tatecoins = 0; // Updated
        tatecoinsPerClick = 1; // Updated
        tatecoinsPerSecond = 0; // Updated
        localStorage.removeItem('spaceMinerSave');
        updateDisplay();
        infoFlyout.classList.remove('active');
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
