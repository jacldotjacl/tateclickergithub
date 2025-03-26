let crystals = 0;
let crystalsPerClick = 1;
let crystalsPerSecond = 0;

const resourceCount = document.getElementById('resource-count');
const mineBtn = document.getElementById('mine-btn');
const autoMinerBtn = document.getElementById('auto-miner');
const drillBtn = document.getElementById('drill');
const perClickDisplay = document.getElementById('per-click');
const perSecondDisplay = document.getElementById('per-second');

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
});

// Buy auto miner
autoMinerBtn.addEventListener('click', () => {
    if (crystals >= 10) {
        crystals -= 10;
        crystalsPerSecond += 1;
        updateDisplay();
    }
});

// Buy drill
drillBtn.addEventListener('click', () => {
    if (crystals >= 50) {
        crystals -= 50;
        crystalsPerClick += 5;
        updateDisplay();
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
        crystals,
        crystalsPerClick,
        crystalsPerSecond
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
        updateDisplay();
    }
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Load game on start
loadGame();
