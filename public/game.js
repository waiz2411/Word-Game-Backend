/* ==========================================================================
   WORD CROSS MASTER - CORE GAME ENGINE
   ========================================================================== */

// --- Levels Database ---
const LEVELS = [
    {
        level: 1,
        letters: ['O', 'T', 'W'],
        words: ['TWO', 'TO'],
        gridSize: { rows: 3, cols: 3 },
        layout: [
            { word: 'TWO', row: 0, col: 0, direction: 'H' },
            { word: 'TO', row: 0, col: 0, direction: 'V' }
        ]
    },
    {
        level: 2,
        letters: ['A', 'C', 'T'],
        words: ['CAT', 'ACT', 'AT'],
        gridSize: { rows: 3, cols: 3 },
        layout: [
            { word: 'ACT', row: 0, col: 0, direction: 'V' },
            { word: 'CAT', row: 1, col: 0, direction: 'H' },
            { word: 'AT', row: 0, col: 0, direction: 'H' }
        ]
    },
    {
        level: 3,
        letters: ['D', 'O', 'G'],
        words: ['DOG', 'GOD'],
        gridSize: { rows: 3, cols: 3 },
        layout: [
            { word: 'DOG', row: 0, col: 0, direction: 'H' },
            { word: 'GOD', row: 0, col: 2, direction: 'V' }
        ]
    },
    {
        level: 4,
        letters: ['A', 'P', 'E', 'S'],
        words: ['APES', 'PEAS', 'APE', 'SPA'],
        gridSize: { rows: 4, cols: 4 },
        layout: [
            { word: 'APES', row: 0, col: 0, direction: 'H' },
            { word: 'APE', row: 0, col: 0, direction: 'V' },
            { word: 'PEAS', row: 0, col: 1, direction: 'V' },
            { word: 'SPA', row: 3, col: 1, direction: 'H' }
        ]
    },
    {
        level: 5,
        letters: ['E', 'E', 'D', 'R', 'F'],
        words: ['FEED', 'RED', 'FREE', 'DEER'],
        gridSize: { rows: 5, cols: 4 },
        layout: [
            { word: 'FREE', row: 1, col: 0, direction: 'H' },
            { word: 'FEED', row: 1, col: 0, direction: 'V' },
            { word: 'DEER', row: 4, col: 0, direction: 'H' },
            { word: 'RED', row: 1, col: 1, direction: 'V' }
        ]
    },
    {
        level: 6,
        letters: ['E', 'L', 'L', 'I', 'F'],
        words: ['FILE', 'LIFE', 'FILL'],
        gridSize: { rows: 5, cols: 4 },
        layout: [
            { word: 'FILL', row: 1, col: 0, direction: 'H' },
            { word: 'LIFE', row: 1, col: 2, direction: 'V' },
            { word: 'FILE', row: 1, col: 0, direction: 'V' }
        ]
    },
    {
        level: 7,
        letters: ['R', 'A', 'T', 'S'],
        words: ['STAR', 'RATS', 'ARTS', 'TAR'],
        gridSize: { rows: 5, cols: 7 },
        layout: [
            { word: 'STAR', row: 1, col: 0, direction: 'H' },
            { word: 'RATS', row: 1, col: 3, direction: 'V' },
            { word: 'ARTS', row: 2, col: 3, direction: 'H' },
            { word: 'TAR', row: 1, col: 1, direction: 'V' }
        ]
    },
    {
        level: 8,
        letters: ['O', 'N', 'E', 'Z'],
        words: ['ZONE', 'ONE', 'ZEN', 'EON'],
        gridSize: { rows: 4, cols: 4 },
        layout: [
            { word: 'ZONE', row: 1, col: 0, direction: 'H' },
            { word: 'ONE', row: 1, col: 1, direction: 'V' },
            { word: 'ZEN', row: 1, col: 0, direction: 'V' },
            { word: 'EON', row: 3, col: 1, direction: 'H' }
        ]
    },
    {
        level: 9,
        letters: ['B', 'L', 'U', 'E', 'S'],
        words: ['BLUES', 'BLUE', 'SUB'],
        gridSize: { rows: 4, cols: 5 },
        layout: [
            { word: 'BLUES', row: 0, col: 0, direction: 'H' },
            { word: 'BLUE', row: 0, col: 0, direction: 'V' },
            { word: 'SUB', row: 0, col: 4, direction: 'V' }
        ]
    },
    {
        level: 10,
        letters: ['C', 'A', 'M', 'E', 'R'],
        words: ['CREAM', 'RACE', 'CAR', 'RAM'],
        gridSize: { rows: 5, cols: 5 },
        layout: [
            { word: 'CREAM', row: 1, col: 0, direction: 'H' },
            { word: 'RACE', row: 1, col: 1, direction: 'V' },
            { word: 'CAR', row: 3, col: 1, direction: 'H' },
            { word: 'RAM', row: 0, col: 3, direction: 'V' }
        ]
    }
];

// --- Sound Synthesizer (Web Audio API) ---
class SoundSynth {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = true;
        this.musicInterval = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playNote(freq, type, duration, delay = 0) {
        if (!this.sfxEnabled) return;
        this.init();
        
        setTimeout(() => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.error("Audio error", e);
            }
        }, delay * 1000);
    }

    playLetterSelect(index) {
        // Pentatonic scale starting at C4
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        const freq = scale[Math.min(index, scale.length - 1)];
        this.playNote(freq, 'sine', 0.2);
    }

    playWordSuccess() {
        this.playNote(523.25, 'triangle', 0.1, 0); // C5
        this.playNote(659.25, 'triangle', 0.1, 0.08); // E5
        this.playNote(783.99, 'triangle', 0.15, 0.16); // G5
        this.playNote(1046.50, 'triangle', 0.3, 0.24); // C6
    }

    playWordFail() {
        this.playNote(180, 'sawtooth', 0.3);
        this.playNote(150, 'sawtooth', 0.3, 0.05);
    }

    playLevelComplete() {
        this.playNote(523.25, 'triangle', 0.15, 0);
        this.playNote(659.25, 'triangle', 0.15, 0.1);
        this.playNote(783.99, 'triangle', 0.15, 0.2);
        this.playNote(1046.50, 'triangle', 0.4, 0.3);
        this.playNote(1318.51, 'triangle', 0.6, 0.45);
    }

    playCoinClick() {
        this.playNote(987.77, 'sine', 0.1); // B5
        this.playNote(1318.51, 'sine', 0.2, 0.05); // E6
    }

    startAmbientChimes() {
        if (this.musicInterval) clearInterval(this.musicInterval);
        
        const chimes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        
        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled) return;
            this.init();
            
            // Randomly play a soft chime note
            if (Math.random() > 0.4) {
                const note = chimes[Math.floor(Math.random() * chimes.length)];
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(note, this.ctx.currentTime);
                    
                    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3);
                    
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    
                    osc.start();
                    osc.stop(this.ctx.currentTime + 3);
                } catch (e) {}
            }
        }, 4000);
    }

    stopAmbientChimes() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

const sounds = new SoundSynth();

// --- AdsTerra Integration Manager ---
class AdsTerraManager {
    constructor() {
        // AdsTerra Config Codes
        // In a live environment, the user will put their real script URL or ad codes here.
        this.smartlinkUrl = "https://www.profitablecpmrate.com/your-adsterra-smartlink-id"; 
        
        this.levelsBetweenInterstitials = 2;
        this.levelCounter = 0;
        this.interstitialCallback = null;
    }

    init() {
        console.log("AdsTerra Manager initialized");
        this.loadBannerAd();
    }

    loadBannerAd() {
        // Mock AdsTerra banner injection.
        // To place your real AdsTerra Banner:
        // Paste your banner code snippet inside index.html inside the "adsterra-banner-slot" div.
        const bannerSlot = document.getElementById('adsterra-banner-slot');
        if (bannerSlot) {
            // Under normal production, the script code snippet will run automatically.
            // We just ensure the wrapper stays visible.
            document.getElementById('ad-banner-container').classList.remove('hidden');
            if (window.Telemetry) Telemetry.trackEvent('ad_watch_banner');
        }
    }

    triggerInterstitial(onCloseCallback) {
        this.levelCounter++;
        if (this.levelCounter % this.levelsBetweenInterstitials === 0) {
            this.interstitialCallback = onCloseCallback;
            this.showMockInterstitial();
        } else {
            if (onCloseCallback) onCloseCallback();
        }
    }

    showMockInterstitial() {
        const modal = document.getElementById('modal-interstitial');
        const timerText = document.getElementById('ad-timer');
        const closeBtn = document.getElementById('btn-close-ad-interstitial');
        
        modal.classList.add('active');
        closeBtn.classList.add('hidden');
        
        let timeLeft = 5;
        timerText.textContent = timeLeft;

        if (window.Telemetry) Telemetry.trackEvent('ad_watch_interstitial');
        
        const interval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(interval);
                closeBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    closeInterstitial() {
        document.getElementById('modal-interstitial').classList.remove('active');
        if (this.interstitialCallback) {
            const cb = this.interstitialCallback;
            this.interstitialCallback = null;
            cb();
        }
    }

    clickSmartlink(rewardCoinsCallback, rewardAmt = 100) {
        // Opens the AdsTerra Smartlink in a new tab.
        // Gives reward to the user to retain traffic and encourage repeat clicks.
        window.open(this.smartlinkUrl, '_blank');
        
        if (window.Telemetry) Telemetry.trackEvent('smartlink_click', { reward: rewardAmt });

        // Award the coins!
        if (rewardCoinsCallback) {
            sounds.playCoinClick();
            rewardCoinsCallback();
        }
    }
}

const adsManager = new AdsTerraManager();

// --- Core Game Controller ---
class GameController {
    constructor() {
        this.coins = parseInt(localStorage.getItem('wc_coins')) || 200;
        this.currentLevelIndex = parseInt(localStorage.getItem('wc_level')) || 0;
        this.currentLevel = null;
        
        // Active gameplay states
        this.foundWords = [];
        this.extraWords = [];
        this.gridState = {}; // cell coordinates -> state { letter, solved }
        this.selectedLetters = []; // indices of active letter buttons
        
        // Letter wheel position map
        this.letterNodes = [];
        this.isDragging = false;
        
        // Settings states
        this.sfx = localStorage.getItem('wc_sfx') !== 'false';
        this.music = localStorage.getItem('wc_music') !== 'false';
    }

    init() {
        this.loadCoinsDisplays();
        this.setupSettings();
        this.bindEvents();
        this.loadDailyRewardState();
        
        // Sync telemetry user
        if (window.Telemetry) {
            Telemetry.updateCurrentUser({
                coins: this.coins,
                levelReached: this.currentLevelIndex + 1
            });
        }

        // Show lobby screen initially
        this.showScreen('lobby-screen');
        sounds.sfxEnabled = this.sfx;
        sounds.musicEnabled = this.music;
        if (this.music) sounds.startAmbientChimes();

        adsManager.init();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        
        if (screenId === 'lobby-screen') {
            document.getElementById('lobby-coins-count').textContent = this.coins;
        } else if (screenId === 'game-screen') {
            document.getElementById('game-coins-count').textContent = this.coins;
            this.loadLevel(this.currentLevelIndex);
        }
    }

    loadCoinsDisplays() {
        document.getElementById('lobby-coins-count').textContent = this.coins;
        document.getElementById('game-coins-count').textContent = this.coins;
    }

    addCoins(amount) {
        this.coins += amount;
        localStorage.setItem('wc_coins', this.coins);
        this.loadCoinsDisplays();
        sounds.playCoinClick();
        this.createCoinParticles();
        
        if (window.Telemetry) {
            Telemetry.updateCurrentUser({ coins: this.coins });
            Telemetry.trackEvent('coin_earn', { amount: amount, source: 'gameplay' });
        }
    }

    deductCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            localStorage.setItem('wc_coins', this.coins);
            this.loadCoinsDisplays();

            if (window.Telemetry) {
                Telemetry.updateCurrentUser({ coins: this.coins });
            }
            return true;
        }
        this.showToast("Not enough coins!");
        return false;
    }

    // --- Daily Reward Logic ---
    loadDailyRewardState() {
        const lastClaim = localStorage.getItem('wc_last_claim');
        const streak = parseInt(localStorage.getItem('wc_claim_streak')) || 0;
        const today = new Date().toDateString();
        
        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';
        
        const rewards = [50, 100, 150, 200, 250, 300, 500];
        let nextDayToClaim = streak;
        
        // Check if missed a day
        if (lastClaim) {
            const lastDate = new Date(lastClaim);
            const diffTime = Math.abs(new Date(today) - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
                // Streak broken, reset
                nextDayToClaim = 0;
                localStorage.setItem('wc_claim_streak', 0);
            }
        }
        
        const alreadyClaimedToday = (lastClaim === today);
        
        for (let i = 0; i < 7; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            
            if (i < nextDayToClaim) {
                dayDiv.classList.add('claimed');
            } else if (i === nextDayToClaim && !alreadyClaimedToday) {
                dayDiv.classList.add('active');
            }
            
            dayDiv.innerHTML = `
                <div class="day-label">Day ${i + 1}</div>
                <i class="fa-solid fa-coins"></i>
                <div class="day-coins">+${rewards[i]}</div>
            `;
            
            if (i < nextDayToClaim) {
                dayDiv.innerHTML += `<div class="cal-tick"><i class="fa-solid fa-check"></i></div>`;
            }
            
            calendarGrid.appendChild(dayDiv);
        }
        
        const claimBtn = document.getElementById('btn-claim-daily');
        if (alreadyClaimedToday) {
            claimBtn.textContent = "CLAIMED TODAY";
            claimBtn.classList.add('disabled');
        } else {
            claimBtn.textContent = "CLAIM REWARD";
            claimBtn.classList.remove('disabled');
        }
    }

    claimDailyReward() {
        const lastClaim = localStorage.getItem('wc_last_claim');
        const today = new Date().toDateString();
        if (lastClaim === today) return;
        
        let streak = parseInt(localStorage.getItem('wc_claim_streak')) || 0;
        const rewards = [50, 100, 150, 200, 250, 300, 500];
        const prize = rewards[streak];
        
        this.addCoins(prize);
        
        if (window.Telemetry) {
            Telemetry.trackEvent('daily_claim', { day: streak + 1, coins: prize });
        }

        streak = (streak + 1) % 7;
        localStorage.setItem('wc_claim_streak', streak);
        localStorage.setItem('wc_last_claim', today);
        
        this.loadDailyRewardState();
        this.showToast(`Claimed daily reward! +${prize} coins.`);
        
        setTimeout(() => {
            document.getElementById('modal-daily').classList.remove('active');
        }, 1200);
    }

    // --- Setting Controls ---
    setupSettings() {
        const sfxToggle = document.getElementById('toggle-sfx');
        const musicToggle = document.getElementById('toggle-music');
        
        sfxToggle.checked = this.sfx;
        musicToggle.checked = this.music;
        
        sfxToggle.addEventListener('change', (e) => {
            this.sfx = e.target.checked;
            localStorage.setItem('wc_sfx', this.sfx);
            sounds.sfxEnabled = this.sfx;
        });
        
        musicToggle.addEventListener('change', (e) => {
            this.music = e.target.checked;
            localStorage.setItem('wc_music', this.music);
            sounds.musicEnabled = this.music;
            if (this.music) {
                sounds.startAmbientChimes();
            } else {
                sounds.stopAmbientChimes();
            }
        });

        document.getElementById('btn-reset-game').addEventListener('click', () => {
            if (confirm("Are you sure you want to reset all progress?")) {
                if (window.Telemetry) Telemetry.resetData();
                this.coins = 200;
                this.currentLevelIndex = 0;
                this.init();
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
            }
        });
    }

    // --- Loading & Designing the Crossword ---
    loadLevel(levelIndex) {
        this.currentLevel = LEVELS[levelIndex % LEVELS.length];
        
        // Handle displaying the level title (increment dynamically if user loops levels)
        const actualLevelNum = levelIndex + 1;
        document.getElementById('level-indicator').textContent = `Level ${actualLevelNum}`;
        
        this.foundWords = [];
        this.extraWords = [];
        this.gridState = {};
        
        document.getElementById('extra-words-count').textContent = '0';
        
        this.buildCrosswordGrid();
        this.buildLetterWheel();
    }

    buildCrosswordGrid() {
        const gridContainer = document.getElementById('crossword-grid');
        gridContainer.innerHTML = '';
        
        const numRows = this.currentLevel.gridSize.rows;
        const numCols = this.currentLevel.gridSize.cols;
        
        // Use CSS Grid – compute optimal cell size
        const containerW = gridContainer.parentElement.clientWidth - 16;
        const containerH = gridContainer.parentElement.clientHeight - 16;
        const cellW = Math.floor(containerW / numCols) - 5;
        const cellH = Math.floor(containerH / numRows) - 5;
        const cellSize = Math.min(cellW, cellH, 44);

        gridContainer.style.gridTemplateColumns = `repeat(${numCols}, ${cellSize}px)`;
        gridContainer.style.gridTemplateRows    = `repeat(${numRows}, ${cellSize}px)`;
        gridContainer.style.gap = '5px';
        
        // 1. Initialize grid cells
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                this.gridState[`${r},${c}`] = {
                    hasTile: false, letter: '', solved: false, element: null
                };
            }
        }
        
        // 2. Map crossword words layout
        this.currentLevel.layout.forEach(item => {
            const { word, row, col, direction } = item;
            for (let i = 0; i < word.length; i++) {
                const r = direction === 'V' ? row + i : row;
                const c = direction === 'H' ? col + i : col;
                const key = `${r},${c}`;
                if (this.gridState[key]) {
                    this.gridState[key].hasTile = true;
                    this.gridState[key].letter = word[i];
                }
            }
        });
        
        // 3. Render cells as CSS Grid items
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const key = `${r},${c}`;
                const cellData = this.gridState[key];
                
                const tileDiv = document.createElement('div');
                tileDiv.style.width  = `${cellSize}px`;
                tileDiv.style.height = `${cellSize}px`;

                if (cellData.hasTile) {
                    tileDiv.className = 'grid-tile empty';
                    cellData.element = tileDiv;
                } else {
                    tileDiv.className = 'grid-tile';
                    tileDiv.style.opacity = '0';
                    tileDiv.style.pointerEvents = 'none';
                }
                
                gridContainer.appendChild(tileDiv);
            }
        }
    }

    // --- Build Circular Wheel ---
    buildLetterWheel() {
        const wheel = document.getElementById('letter-wheel');
        
        // Keep the canvas, remove previous letter elements
        const letters = [...this.currentLevel.letters];
        
        // Clean old nodes
        document.querySelectorAll('.wheel-letter').forEach(node => node.remove());
        this.letterNodes = [];
        
        const count = letters.length;
        const radius = 72; // radius in px
        const centerX = 105; // width/2
        const centerY = 105; // height/2
        
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI / count) - Math.PI / 2; // Offset by -90deg to start top-center
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            const btn = document.createElement('div');
            btn.className = 'wheel-letter';
            btn.textContent = letters[i];
            btn.style.left = `${x}px`;
            btn.style.top = `${y}px`;
            btn.dataset.index = i;
            
            wheel.appendChild(btn);
            
            this.letterNodes.push({
                element: btn,
                x: x,
                y: y,
                letter: letters[i],
                index: i
            });
        }
        
        this.resizeWheelCanvas();
    }

    shuffleWheel() {
        // Scramble letters
        const letters = [...this.currentLevel.letters];
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        
        this.currentLevel.letters = letters;
        this.buildLetterWheel();
        sounds.playNote(400, 'sine', 0.1);
    }

    resizeWheelCanvas() {
        const canvas = document.getElementById('wheel-canvas');
        canvas.width = 210;
        canvas.height = 210;
    }

    // --- Letter Connection Draw/Swipe logic ---
    bindEvents() {
        const wheel = document.getElementById('letter-wheel');
        const canvas = document.getElementById('wheel-canvas');
        const ctx = canvas.getContext('2d');
        
        // Dynamic event bindings for touch/mouse
        const startDrag = (e) => {
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (!clientX) return;
            
            this.isDragging = true;
            this.selectedLetters = [];
            this.updatePreviewWord();
            
            this.checkHoverLetter(clientX, clientY);
        };
        
        const moveDrag = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            if (!clientX) return;
            
            this.checkHoverLetter(clientX, clientY);
            this.drawLines(clientX, clientY);
        };
        
        const endDrag = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            // Process spelling guess
            this.processCompiledGuess();
            
            // Clear canvas & resets
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.selectedLetters = [];
            document.querySelectorAll('.wheel-letter').forEach(l => l.classList.remove('selected'));
            this.updatePreviewWord();
        };

        // Event hooks
        wheel.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', endDrag);

        wheel.addEventListener('touchstart', startDrag, { passive: false });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('touchend', endDrag);

        // Resize hook
        window.addEventListener('resize', () => this.resizeWheelCanvas());

        // ── Navigation
        document.getElementById('btn-play-game').addEventListener('click', () => this.showScreen('game-screen'));
        document.getElementById('btn-back-lobby').addEventListener('click', () => this.showScreen('lobby-screen'));

        // ── Wheel controls
        document.getElementById('btn-shuffle').addEventListener('click', () => this.shuffleWheel());
        document.getElementById('btn-hint').addEventListener('click', () => this.revealRandomHint());
        document.getElementById('btn-target-hint').addEventListener('click', () => this.toggleTargetHintMode());

        // ── Daily Rewards
        document.getElementById('btn-daily-rewards').addEventListener('click', () => {
            this.loadDailyRewardState();
            document.getElementById('modal-daily').classList.add('active');
        });
        document.getElementById('btn-claim-daily').addEventListener('click', () => this.claimDailyReward());

        // ── Free Coins / Shop
        document.getElementById('btn-free-coins').addEventListener('click', () => {
            document.getElementById('modal-shop').classList.add('active');
        });

        // ── Settings
        document.getElementById('btn-lobby-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.add('active');
        });
        document.getElementById('btn-game-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.add('active');
        });

        // ── Help
        document.getElementById('btn-lobby-help').addEventListener('click', () => {
            alert('WORD CROSS MASTER\n\n1. Drag between letters to form words.\n2. Fill all crossword slots to complete a level.\n3. Find extra words for bonus coins.\n4. Use the lightbulb or crosshair for hints.');
        });

        // ── Close modals (X button and backdrop)
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.closest('.modal-overlay').classList.remove('active');
                this.isTargetHintMode = false;
            });
        });
        document.querySelectorAll('.modal-overlay:not(.no-backdrop-close)').forEach(overlay => {
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    this.isTargetHintMode = false;
                }
            });
        });

        // ── Level Complete
        document.getElementById('btn-next-level').addEventListener('click', () => {
            document.getElementById('modal-level-completed').classList.remove('active');
            adsManager.triggerInterstitial(() => {
                const oldLevel = this.currentLevelIndex + 1;
                this.currentLevelIndex++;
                localStorage.setItem('wc_level', this.currentLevelIndex);
                
                if (window.Telemetry) {
                    Telemetry.trackEvent('level_complete', { level: oldLevel, coinsReward: 25 });
                    Telemetry.updateCurrentUser({ levelReached: this.currentLevelIndex + 1 });
                }

                this.loadLevel(this.currentLevelIndex);
            });
        });

        // ── Double coins (watch ad)
        document.getElementById('btn-double-coins').addEventListener('click', () => {
            adsManager.triggerInterstitial(() => {
                if (window.Telemetry) Telemetry.trackEvent('ad_watch_rewarded', { reward: 25 });
                this.addCoins(25);
                this.showToast('Doubled! Earned extra +25 coins.');
                document.getElementById('btn-double-coins').classList.add('hidden');
            });
        });

        // ── Invite from completion card
        document.getElementById('btn-complete-invite').addEventListener('click', () => {
            document.getElementById('modal-level-completed').classList.remove('active');
            this.openInviteModal();
        });

        // ── AdsTerra smartlinks (.btn-earn)
        document.querySelectorAll('.btn-earn[data-link="smartlink"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const rewardAmt = parseInt(btn.dataset.reward);
                adsManager.clickSmartlink(() => {
                    this.addCoins(rewardAmt);
                    this.showToast(`Sponsor visit! +${rewardAmt} coins earned.`);
                }, rewardAmt);
            });
        });

        document.getElementById('btn-watch-ad').addEventListener('click', () => {
            adsManager.triggerInterstitial(() => {
                if (window.Telemetry) Telemetry.trackEvent('ad_watch_rewarded', { reward: 200 });
                this.addCoins(200);
                this.showToast('Ad viewed! +200 coins earned.');
            });
        });

        document.getElementById('btn-close-ad-interstitial').addEventListener('click', () => {
            adsManager.closeInterstitial();
        });
        document.getElementById('btn-interstitial-action').addEventListener('click', () => {
            window.open(adsManager.smartlinkUrl, '_blank');
        });

        // ── Banner ad close
        document.getElementById('btn-close-ad-banner').addEventListener('click', () => {
            document.getElementById('ad-banner-container').classList.add('hidden');
            setTimeout(() => adsManager.loadBannerAd(), 30000);
        });

        // ── Dictionary
        document.getElementById('btn-dictionary').addEventListener('click', () => this.showDictionaryDefinitions());

        // ── Extra words
        document.getElementById('extra-words-btn').addEventListener('click', () => this.showExtraWordsList());

        // ── Invite Friends buttons (lobby)
        document.getElementById('btn-lobby-invite').addEventListener('click', () => this.openInviteModal());
        document.getElementById('btn-lobby-invite-2').addEventListener('click', () => this.openInviteModal());

        // ── Invite modal internals
        this.bindInviteEvents();
    }

    // ─── Invite Friends System ────────────────────────────────────────
    openInviteModal() {
        this.updateReferralStats();
        document.getElementById('modal-invite').classList.add('active');
    }

    updateReferralStats() {
        const refCount = parseInt(localStorage.getItem('wc_ref_count')) || 0;
        const refCoins = parseInt(localStorage.getItem('wc_ref_coins')) || 0;
        document.getElementById('ref-count').textContent = refCount;
        document.getElementById('ref-coins').textContent = refCoins;
    }

    getInviteMessage() {
        return `🎮 I'm playing Word Cross Master! Connect letters, solve crosswords & win coins. Come challenge me! 👇\nhttps://wordcrossmaster.app/?ref=player123`;
    }

    getInviteLink() {
        return document.getElementById('invite-link-input').value;
    }

    bindInviteEvents() {
        // Copy link
        document.getElementById('btn-copy-link').addEventListener('click', () => {
            const input = document.getElementById('invite-link-input');
            try {
                navigator.clipboard.writeText(input.value).then(() => {
                    this.showToast('🔗 Invite link copied!');
                    this.rewardReferral();
                    if (window.Telemetry) Telemetry.trackEvent('copy_link');
                });
            } catch {
                input.select();
                document.execCommand('copy');
                this.showToast('🔗 Link copied to clipboard!');
                this.rewardReferral();
                if (window.Telemetry) Telemetry.trackEvent('copy_link');
            }
        });

        // WhatsApp
        document.getElementById('share-whatsapp').addEventListener('click', () => {
            const msg = encodeURIComponent(this.getInviteMessage());
            window.open(`https://wa.me/?text=${msg}`, '_blank');
            this.rewardReferral();
            this.showToast('📤 Shared on WhatsApp! +50 coins');
            if (window.Telemetry) Telemetry.trackEvent('invite_sent', { platform: 'WhatsApp' });
        });

        // Telegram
        document.getElementById('share-telegram').addEventListener('click', () => {
            const msg = encodeURIComponent(this.getInviteMessage());
            window.open(`https://t.me/share/url?url=${encodeURIComponent(this.getInviteLink())}&text=${msg}`, '_blank');
            this.rewardReferral();
            this.showToast('📤 Shared on Telegram! +50 coins');
            if (window.Telemetry) Telemetry.trackEvent('invite_sent', { platform: 'Telegram' });
        });

        // Twitter / X
        document.getElementById('share-twitter').addEventListener('click', () => {
            const msg = encodeURIComponent('🎮 Playing Word Cross Master – the best word puzzle! Join me! ' + this.getInviteLink());
            window.open(`https://x.com/intent/tweet?text=${msg}`, '_blank');
            this.rewardReferral();
            this.showToast('📤 Shared on X! +50 coins');
            if (window.Telemetry) Telemetry.trackEvent('invite_sent', { platform: 'Twitter' });
        });

        // Facebook
        document.getElementById('share-facebook').addEventListener('click', () => {
            const url = encodeURIComponent(this.getInviteLink());
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            this.rewardReferral();
            this.showToast('📤 Shared on Facebook! +50 coins');
            if (window.Telemetry) Telemetry.trackEvent('invite_sent', { platform: 'Facebook' });
        });

        // Native Share API
        document.getElementById('btn-native-share').addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Word Cross Master',
                        text: '🎮 Challenge me in Word Cross Master! The ultimate word puzzle game.',
                        url: this.getInviteLink()
                    });
                    this.rewardReferral();
                    this.showToast('📤 Thanks for sharing! +50 coins');
                    if (window.Telemetry) Telemetry.trackEvent('invite_sent', { platform: 'Native' });
                } catch (err) {
                    // User cancelled – no punishment
                }
            } else {
                this.showToast('Use the buttons above to share!');
            }
        });
    }

    rewardReferral() {
        // One reward per share (simple throttle: once every 30 seconds per share type)
        const lastShare = parseInt(localStorage.getItem('wc_last_share')) || 0;
        const now = Date.now();
        if (now - lastShare < 15000) return; // 15s cooldown between rewards
        localStorage.setItem('wc_last_share', now);

        this.addCoins(50);
        const refCount = (parseInt(localStorage.getItem('wc_ref_count')) || 0) + 1;
        const refCoins = (parseInt(localStorage.getItem('wc_ref_coins')) || 0) + 50;
        localStorage.setItem('wc_ref_count', refCount);
        localStorage.setItem('wc_ref_coins', refCoins);
        this.updateReferralStats();
        this.createCoinParticles();
    }

    checkHoverLetter(clientX, clientY) {
        const wheel = document.getElementById('letter-wheel');
        const wheelRect = wheel.getBoundingClientRect();
        
        // Coordinate conversion relative to center structure of wheel
        const mouseX = clientX - wheelRect.left;
        const mouseY = clientY - wheelRect.top;
        
        // Find if hover is within radius of nodes
        for (let node of this.letterNodes) {
            const dist = Math.hypot(node.x - mouseX, node.y - mouseY);
            if (dist < 26) { // Letter node radius is 26px
                if (!this.selectedLetters.includes(node.index)) {
                    // Node is selected
                    this.selectedLetters.push(node.index);
                    node.element.classList.add('selected');
                    sounds.playLetterSelect(this.selectedLetters.length);
                    this.updatePreviewWord();
                }
                break;
            }
        }
    }

    updatePreviewWord() {
        const preview = document.getElementById('word-preview');
        if (this.selectedLetters.length === 0) {
            preview.classList.add('hidden');
            preview.textContent = '';
        } else {
            preview.classList.remove('hidden');
            const word = this.selectedLetters.map(idx => this.letterNodes[idx].letter).join('');
            preview.textContent = word;
        }
    }

    drawLines(clientX, clientY) {
        const canvas = document.getElementById('wheel-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.selectedLetters.length === 0) return;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw connected paths
        ctx.beginPath();
        for (let i = 0; i < this.selectedLetters.length; i++) {
            const node = this.letterNodes[this.selectedLetters[i]];
            if (i === 0) {
                ctx.moveTo(node.x, node.y);
            } else {
                ctx.lineTo(node.x, node.y);
            }
        }
        
        // Draw style (Glowing golden chimes effect)
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 8;
        ctx.shadowColor = '#d68910';
        ctx.shadowBlur = 12;
        ctx.stroke();
        
        // Draw trailing pointer line
        const wheel = document.getElementById('letter-wheel');
        const wheelRect = wheel.getBoundingClientRect();
        const curX = clientX - wheelRect.left;
        const curY = clientY - wheelRect.top;
        
        const lastNode = this.letterNodes[this.selectedLetters[this.selectedLetters.length - 1]];
        
        ctx.beginPath();
        ctx.moveTo(lastNode.x, lastNode.y);
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.6)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 4;
        ctx.stroke();
    }

    // --- Validate User Spelling Guess ---
    processCompiledGuess() {
        if (this.selectedLetters.length < 2) return;
        
        const word = this.selectedLetters.map(idx => this.letterNodes[idx].letter).join('');
        
        // 1. Is it a target crossword word?
        const matchedLayout = this.currentLevel.layout.find(item => item.word === word);
        
        if (matchedLayout) {
            if (this.foundWords.includes(word)) {
                this.showToast("Word already found!");
                sounds.playWordFail();
            } else {
                this.foundWords.push(word);
                this.revealGridWord(word, matchedLayout);
                sounds.playWordSuccess();
                this.checkLevelCompletion();
            }
            return;
        }
        
        // 2. Is it in the extra valid dictionary words list?
        // We validate if the word can be made from letters, and query dictionary API asynchronously or accept it.
        const canBuildWord = this.validateLetterSubsets(word);
        if (canBuildWord) {
            this.checkExtraWordValidity(word);
        } else {
            this.showToast("Invalid letters!");
            sounds.playWordFail();
        }
    }

    validateLetterSubsets(word) {
        // Ensure word only uses letters on the wheel
        const wheelLetters = [...this.currentLevel.letters];
        for (let char of word) {
            const idx = wheelLetters.indexOf(char);
            if (idx === -1) return false;
            wheelLetters.splice(idx, 1);
        }
        return true;
    }

    async checkExtraWordValidity(word) {
        // Check if word is already found in either grid or extra list
        if (this.foundWords.includes(word) || this.extraWords.includes(word)) {
            this.showToast("Already found!");
            sounds.playWordFail();
            return;
        }

        // Check offline lexicon database first or fallback to online dictionary API
        this.showToast("Validating word...");
        
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (res.ok) {
                // Real word! Add to extra words
                this.extraWords.push(word);
                document.getElementById('extra-words-count').textContent = this.extraWords.length;
                this.showToast(`Extra Word: ${word}! +5 Coins`);
                this.addCoins(5);
                this.createSparkleParticles(document.getElementById('extra-words-btn'));
            } else {
                this.showToast("Word not in dictionary");
                sounds.playWordFail();
            }
        } catch (e) {
            // Offline/Fail safe fallback for minor spelling words (assumed true if length >= 3)
            if (word.length >= 3) {
                this.extraWords.push(word);
                document.getElementById('extra-words-count').textContent = this.extraWords.length;
                this.showToast(`Extra Word: ${word}! +5 Coins`);
                this.addCoins(5);
            } else {
                this.showToast("Not a word!");
                sounds.playWordFail();
            }
        }
    }

    revealGridWord(word, layout) {
        const { row, col, direction } = layout;
        for (let i = 0; i < word.length; i++) {
            const r = direction === 'V' ? row + i : row;
            const c = direction === 'H' ? col + i : col;
            const key = `${r},${c}`;
            const cell = this.gridState[key];
            
            if (cell && !cell.solved) {
                cell.solved = true;
                cell.element.classList.remove('empty');
                cell.element.classList.add('filled');
                cell.element.textContent = cell.letter;
                
                // Flight particle triggers
                this.createSparkleParticles(cell.element);
            }
        }
    }

    checkLevelCompletion() {
        const allSolved = Object.values(this.gridState).every(cell => !cell.hasTile || cell.solved);
        if (allSolved) {
            setTimeout(() => {
                this.triggerLevelCompletedOverlay();
            }, 1000);
        }
    }

    triggerLevelCompletedOverlay() {
        sounds.playLevelComplete();
        this.createCoinParticles();
        
        // Show double rewards button
        document.getElementById('btn-double-coins').classList.remove('hidden');
        
        // Update level metrics
        document.getElementById('modal-level-completed').classList.add('active');
        
        // Award standard completion coins
        this.addCoins(25);
        
        // Extra coins calculation
        const extraBonusCoinsSlot = document.getElementById('extra-bonus-coins');
        const extraRow = document.getElementById('extra-coins-row');
        if (this.extraWords.length > 0) {
            const amt = this.extraWords.length * 5;
            extraBonusCoinsSlot.textContent = `+${amt}`;
            extraRow.classList.remove('hidden');
        } else {
            extraRow.classList.add('hidden');
        }
    }

    // --- Interactive Hints System ---
    revealRandomHint() {
        if (!this.deductCoins(100)) return;
        
        if (window.Telemetry) Telemetry.trackEvent('coin_spend', { cost: 100, item: 'Random Hint' });

        const unsolvedKeys = Object.keys(this.gridState).filter(key => {
            const cell = this.gridState[key];
            return cell.hasTile && !cell.solved;
        });
        
        if (unsolvedKeys.length === 0) return;
        
        // Select random empty crossword slot
        const randomKey = unsolvedKeys[Math.floor(Math.random() * unsolvedKeys.length)];
        const cell = this.gridState[randomKey];
        
        // Find the layout context word matching this coordinate
        const layoutWord = this.currentLevel.layout.find(item => {
            const { word, row, col, direction } = item;
            const [cellR, cellC] = randomKey.split(',').map(Number);
            for (let i = 0; i < word.length; i++) {
                const r = direction === 'V' ? row + i : row;
                const c = direction === 'H' ? col + i : col;
                if (r === cellR && c === cellC) return true;
            }
            return false;
        });

        cell.solved = true;
        cell.element.classList.remove('empty');
        cell.element.classList.add('filled');
        cell.element.textContent = cell.letter;
        
        this.createSparkleParticles(cell.element);
        sounds.playWordSuccess();
        
        // Check if this action completed the entire board
        this.checkLevelCompletion();
    }

    toggleTargetHintMode() {
        if (this.isTargetHintMode) {
            this.isTargetHintMode = false;
            this.showToast("Target hint disabled");
        } else {
            if (this.coins < 150) {
                this.showToast("Need 150 coins!");
                return;
            }
            this.isTargetHintMode = true;
            this.showToast("Tap any empty letter tile to reveal it!");
            this.highlightEmptyTiles(true);
        }
    }

    highlightEmptyTiles(active) {
        Object.values(this.gridState).forEach(cell => {
            if (cell.hasTile && !cell.solved) {
                if (active) {
                    cell.element.classList.add('highlighted');
                    // Add tap event listener for targeted hint placement
                    cell.element.onclick = () => this.applyTargetedHint(cell);
                } else {
                    cell.element.classList.remove('highlighted');
                    cell.element.onclick = null;
                }
            }
        });
    }

    applyTargetedHint(cell) {
        if (!this.isTargetHintMode) return;
        this.highlightEmptyTiles(false);
        this.isTargetHintMode = false;
        
        if (this.deductCoins(150)) {
            if (window.Telemetry) Telemetry.trackEvent('coin_spend', { cost: 150, item: 'Target Hint' });
            cell.solved = true;
            cell.element.classList.remove('empty');
            cell.element.classList.add('filled');
            cell.element.textContent = cell.letter;
            
            this.createSparkleParticles(cell.element);
            sounds.playWordSuccess();
            this.checkLevelCompletion();
        }
    }

    // --- Dictionary definitions popup loader ---
    async showDictionaryDefinitions() {
        const modal = document.getElementById('modal-dictionary');
        const list = document.getElementById('dictionary-definitions-list');
        
        modal.classList.add('active');
        list.innerHTML = '<p class="info-text"><i class="fa-solid fa-spinner fa-spin"></i> Fetching definitions...</p>';
        
        if (this.foundWords.length === 0) {
            list.innerHTML = '<p class="info-text">No words solved in this level yet. Fill slots to reveal meanings!</p>';
            return;
        }

        let html = '';
        for (let word of this.foundWords) {
            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
                if (res.ok) {
                    const data = await res.json();
                    const def = data[0].meanings[0].definitions[0].definition;
                    html += `
                        <div class="definition-item">
                            <div class="definition-word">${word}</div>
                            <div class="definition-desc">"${def}"</div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="definition-item">
                            <div class="definition-word">${word}</div>
                            <div class="definition-desc">Definition offline. Good job finding this puzzle word!</div>
                        </div>
                    `;
                }
            } catch (e) {
                html += `
                    <div class="definition-item">
                        <div class="definition-word">${word}</div>
                        <div class="definition-desc">Definition offline. Word solves the board!</div>
                    </div>
                `;
            }
        }
        list.innerHTML = html;
    }

    // --- Extra words viewer ---
    showExtraWordsList() {
        const modal = document.getElementById('modal-extra-words');
        const list = document.getElementById('extra-words-list');
        
        document.getElementById('extra-current-count').textContent = this.extraWords.length % 5;
        
        list.innerHTML = '';
        if (this.extraWords.length === 0) {
            list.innerHTML = '<p class="info-text">No extra words found. Try building anagrams!</p>';
        } else {
            this.extraWords.forEach(word => {
                const tag = document.createElement('span');
                tag.className = 'found-word-tag';
                tag.textContent = word;
                list.appendChild(tag);
            });
        }
        modal.classList.add('active');
    }

    // --- Sparks / Particles Generators ---
    createSparkleParticles(targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const container = document.getElementById('sparkles-container');
        const containerRect = container.getBoundingClientRect();
        
        const count = 10;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            
            const startX = rect.left - containerRect.left + (rect.width / 2);
            const startY = rect.top - containerRect.top + (rect.height / 2);
            
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            p.style.width = '8px';
            p.style.height = '8px';
            p.style.opacity = '1';
            
            container.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 40;
            const targetX = startX + Math.cos(angle) * dist;
            const targetY = startY + Math.sin(angle) * dist;
            
            // Core flight CSS physics transitions
            p.animate([
                { left: `${startX}px`, top: `${startY}px`, opacity: 1, transform: 'scale(1)' },
                { left: `${targetX}px`, top: `${targetY}px`, opacity: 0, transform: 'scale(0.2)' }
            ], {
                duration: 500 + Math.random() * 300,
                easing: 'ease-out'
            }).onfinish = () => p.remove();
        }
    }

    createCoinParticles() {
        // Rains golden stars
        const container = document.getElementById('sparkles-container');
        const count = 30;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.innerHTML = '<i class="fa-solid fa-star" style="color: #ffd700; font-size:12px;"></i>';
            p.style.background = 'none';
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `-20px`;
            p.style.opacity = '1';
            
            container.appendChild(p);
            
            p.animate([
                { top: '-20px', transform: 'rotate(0deg) scale(1)' },
                { top: '100%', transform: `rotate(${Math.random() * 360}deg) scale(0.5)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1500,
                easing: 'ease-in'
            }).onfinish = () => p.remove();
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2000);
    }
}

// Instantiate game instance on DOM load
window.addEventListener('DOMContentLoaded', () => {
    // ── Generate Floating Lobby Background Tiles
    const bgTilesEl = document.getElementById('lobby-bg-tiles');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 18; i++) {
        const tile = document.createElement('div');
        tile.className = 'bg-tile';
        const size = 36 + Math.random() * 30;
        tile.style.width  = `${size}px`;
        tile.style.height = `${size}px`;
        tile.style.left   = `${Math.random() * 95}%`;
        tile.style.top    = `${90 + Math.random() * 20}%`; // start below viewport
        tile.style.fontSize = `${size * 0.5}px`;
        tile.style.animationDuration = `${8 + Math.random() * 14}s`;
        tile.style.animationDelay    = `${Math.random() * 10}s`;
        tile.style.borderRadius = `${4 + Math.random() * 8}px`;
        tile.textContent = alphabet[Math.floor(Math.random() * alphabet.length)];
        bgTilesEl.appendChild(tile);
    }

    // ── Simulated loading progress
    let progress = 0;
    const progressEl = document.getElementById('load-progress');
    const loadScreen = document.getElementById('loading-screen');

    const game = new GameController();

    const loadTimer = setInterval(() => {
        progress += 8;
        if (progressEl) progressEl.style.width = `${Math.min(progress, 100)}%`;

        if (progress >= 100) {
            clearInterval(loadTimer);
            setTimeout(() => {
                if (loadScreen) loadScreen.classList.remove('active');
                game.init();
            }, 300);
        }
    }, 80);
});
