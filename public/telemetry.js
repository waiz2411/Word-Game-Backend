/* ==========================================================================
   WORD CROSS MASTER - TELEMETRY & ANALYTICS MANAGER (LARAVEL INTEGRATED)
   ========================================================================== */

(function() {
    const STORAGE_KEYS = {
        CURRENT_USER: 'wc_telemetry_user',
        ALL_USERS: 'wc_telemetry_all_users',
        EVENTS: 'wc_telemetry_events',
        STATS: 'wc_telemetry_stats',
        OFFLINE_QUEUE: 'wc_telemetry_offline_queue'
    };

    const BASE_URL = window.location.protocol.startsWith('http') 
        ? window.location.origin + '/api' 
        : 'http://localhost:8000/api';

    const COUNTRIES = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'BR'];
    const DEVICES = ['Mobile', 'Desktop', 'Tablet'];
    const USERNAMES = [
        'WordWizard', 'LetterLinker', 'LexiconLover', 'PuzzlePro', 'CrossKing',
        'AlphaBeta', 'VocabVoyager', 'SpellingStar', 'GrammarGuru', 'SearchSleuth',
        'SwipeMaster', 'Puzzler99', 'GamerGrandpa', 'SmartyPants', 'BrainyBee'
    ];

    const Telemetry = {
        init() {
            this.initCurrentUser();
            this.trackEvent('session_start', { detail: 'User session started' });
            this.flushOfflineQueue();
        },

        initCurrentUser() {
            let currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (!currentUser) {
                const userId = 'U-' + Math.floor(100000 + Math.random() * 900000);
                const randomName = 'Guest_' + Math.floor(1000 + Math.random() * 9000);
                const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
                const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
                
                const profile = {
                    userId: userId,
                    username: randomName,
                    joinedAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                    levelReached: 1,
                    adsWatched: 0,
                    coins: 200,
                    device: device,
                    country: country,
                    status: 'Live'
                };
                
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
                this.syncUser(profile);
            } else {
                const profile = JSON.parse(currentUser);
                profile.lastActive = new Date().toISOString();
                profile.status = 'Live';
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
                this.syncUser(profile);
            }
        },

        getCurrentUser() {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || {};
        },

        updateCurrentUser(fields) {
            const profile = this.getCurrentUser();
            Object.assign(profile, fields);
            profile.lastActive = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
            this.syncUser(profile);
        },

        // --- API INTEGRATIONS ---

        async syncUser(profile) {
            try {
                const response = await fetch(`${BASE_URL}/user/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile)
                });
                if (response.ok) {
                    this.flushOfflineQueue();
                } else {
                    this.queueOfflineSync('user_sync', profile);
                }
            } catch (e) {
                this.queueOfflineSync('user_sync', profile);
            }
        },

        trackEvent(type, detailsObj = {}) {
            const user = this.getCurrentUser();
            const newEvent = {
                userId: user.userId,
                type: type,
                details: detailsObj
            };

            // Local fallback logging
            this.logEventLocally(user, type, detailsObj);

            // POST to Laravel API
            fetch(`${BASE_URL}/telemetry/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEvent)
            })
            .then(res => {
                if (res.ok) {
                    this.flushOfflineQueue();
                } else {
                    this.queueOfflineSync('event_log', newEvent);
                }
            })
            .catch(() => {
                this.queueOfflineSync('event_log', newEvent);
            });

            // Dispatch local event for real-time dashboard listeners
            const customEvent = new CustomEvent('wc_telemetry_event_logged', { 
                detail: {
                    timestamp: new Date().toISOString(),
                    userId: user.userId,
                    username: user.username,
                    type: type,
                    details: this.formatEventDetails(type, detailsObj)
                } 
            });
            window.dispatchEvent(customEvent);
        },

        // Offline event buffering system
        queueOfflineSync(actionType, data) {
            let queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
            queue.push({ actionType, data, timestamp: Date.now() });
            localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
        },

        async flushOfflineQueue() {
            let queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
            if (queue.length === 0) return;

            localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([])); // clear buffer before sync

            for (const item of queue) {
                try {
                    let endpoint = item.actionType === 'user_sync' ? '/user/sync' : '/telemetry/event';
                    await fetch(`${BASE_URL}${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item.data)
                    });
                } catch (e) {
                    // Put back to queue if it fails again
                    this.queueOfflineSync(item.actionType, item.data);
                }
            }
        },

        // --- Async Fetchers for Admin Panel ---

        async getStatsAsync() {
            try {
                const res = await fetch(`${BASE_URL}/admin/stats`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return this.getStats(); // local fallback
        },

        async getUsersAsync() {
            try {
                const res = await fetch(`${BASE_URL}/admin/users`);
                if (res.ok) {
                    const users = await res.json();
                    // map to camelCase structure for dashboard compatibility
                    return users.map(u => ({
                        userId: u.id,
                        username: u.username,
                        device: u.device,
                        country: u.country,
                        coins: u.coins,
                        levelReached: u.level_reached,
                        adsWatched: u.ads_watched,
                        smartlinkClicks: u.smartlink_clicks,
                        status: u.status,
                        lastActive: u.updated_at
                    }));
                }
            } catch (e) {}
            return this.getUsers(); // local fallback
        },

        async getEventsAsync(limit = 100) {
            try {
                const res = await fetch(`${BASE_URL}/admin/events`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return this.getEvents(limit); // local fallback
        },

        async getRatesAsync() {
            try {
                const res = await fetch(`${BASE_URL}/admin/rates`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return this.getRates(); // local fallback
        },

        async saveRatesAsync(rates) {
            try {
                const res = await fetch(`${BASE_URL}/admin/rates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rates)
                });
                if (res.ok) return await res.json();
            } catch (e) {}
            return this.saveRates(rates); // local fallback
        },

        async resetDataAsync() {
            try {
                await fetch(`${BASE_URL}/admin/reset`, { method: 'POST' });
            } catch (e) {}
            this.resetData(); // local fallback
        },

        async generateSampleDataAsync() {
            // Simply call backend to generate, or trigger mock traffic syncs
            try {
                // Generate locally and let syncs upload it, or rely on API simulation
                this.generateSampleData();
            } catch (e) {}
        },

        // --- LOCAL FALLBACK METHODS (for offline and cache compatibility) ---

        logEventLocally(user, type, detailsObj) {
            const newEvent = {
                timestamp: new Date().toISOString(),
                userId: user.userId,
                username: user.username,
                type: type,
                details: this.formatEventDetails(type, detailsObj)
            };

            let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
            events.push(newEvent);
            if (events.length > 200) events.shift();
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));

            this.updateUserStatsLocally(user.userId, type, detailsObj);
            this.recalculateStats();
        },

        formatEventDetails(type, obj) {
            switch (type) {
                case 'session_start':
                    return obj.detail || 'Session started';
                case 'level_complete':
                    return `Completed Level ${obj.level} (Earned +${obj.coinsReward} coins)`;
                case 'ad_watch_interstitial':
                    return 'Viewed sponsored interstitial ad';
                case 'ad_watch_banner':
                    return 'Displayed 320x50 banner ad';
                case 'ad_watch_rewarded':
                    return `Viewed rewarded video ad for +${obj.reward} coins`;
                case 'smartlink_click':
                    return `Visited sponsor smartlink (Earned +${obj.reward} coins)`;
                case 'coin_spend':
                    return `Spent ${obj.cost} coins for ${obj.item || 'Hint'}`;
                case 'coin_earn':
                    return `Earned +${obj.amount} coins from ${obj.source || 'gameplay'}`;
                case 'daily_claim':
                    return `Claimed Daily Reward Day ${obj.day} (+${obj.coins} coins)`;
                case 'invite_sent':
                    return `Shared referral link to ${obj.platform || 'Social'}`;
                case 'copy_link':
                    return 'Copied referral invite link';
                default:
                    return JSON.stringify(obj);
            }
        },

        updateUserStatsLocally(userId, type, obj) {
            let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS)) || [];
            const idx = users.findIndex(u => u.userId === userId);
            if (idx === -1) return;

            const user = users[idx];
            user.lastActive = new Date().toISOString();
            user.status = 'Live';

            if (type === 'level_complete') {
                user.levelReached = Math.max(user.levelReached, obj.level + 1);
                user.coins = (user.coins || 0) + obj.coinsReward;
            } else if (type === 'ad_watch_interstitial' || type === 'ad_watch_rewarded') {
                user.adsWatched = (user.adsWatched || 0) + 1;
            } else if (type === 'smartlink_click') {
                user.smartlinkClicks = (user.smartlinkClicks || 0) + 1;
                user.coins = (user.coins || 0) + (obj.reward || 100);
            } else if (type === 'coin_spend') {
                user.coins = Math.max(0, (user.coins || 0) - obj.cost);
            } else if (type === 'coin_earn') {
                user.coins = (user.coins || 0) + obj.amount;
            } else if (type === 'daily_claim') {
                user.coins = (user.coins || 0) + obj.coins;
            }

            users[idx] = user;
            localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));

            const cur = this.getCurrentUser();
            if (cur.userId === userId) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            }
        },

        recalculateStats() {
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS)) || [];
            const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
            
            let totalAds = 0;
            let totalSmartlink = 0;
            let totalCoinsInCirculation = 0;
            let totalLevelsCompleted = 0;
            
            users.forEach(u => {
                totalAds += (u.adsWatched || 0);
                totalSmartlink += (u.smartlinkClicks || 0);
                totalCoinsInCirculation += (u.coins || 0);
                totalLevelsCompleted += Math.max(0, (u.levelReached || 1) - 1);
            });

            const rates = this.getRates();
            const estimatedRevenue = (totalAds * 0.7 * rates.interstitial) + 
                                     (totalAds * 0.3 * rates.rewarded) + 
                                     ((totalUsers = users.length) * 3 * rates.banner) + 
                                     (totalSmartlink * rates.smartlink);

            const stats = {
                totalUsers: users.length,
                newUsersToday: this.countNewUsers(users),
                totalAdsWatched: totalAds,
                totalSmartlinkClicks: totalSmartlink,
                coinsInCirculation: totalCoinsInCirculation,
                levelsCompleted: totalLevelsCompleted,
                estimatedRevenue: parseFloat(estimatedRevenue.toFixed(2)),
                bannersCount: users.length * 3,
                interstitialsCount: Math.round(totalAds * 0.7),
                rewardedCount: Math.round(totalAds * 0.3)
            };

            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        },

        countNewUsers(users) {
            const todayStr = new Date().toDateString();
            return users.filter(u => new Date(u.joinedAt).toDateString() === todayStr).length;
        },

        getRates() {
            const defaultRates = {
                banner: 0.005,
                interstitial: 0.04,
                rewarded: 0.07,
                smartlink: 0.18
            };
            try {
                const stored = localStorage.getItem('wc_telemetry_rates');
                if (stored) {
                    return Object.assign({}, defaultRates, JSON.parse(stored));
                }
            } catch (e) {}
            return defaultRates;
        },

        saveRates(rates) {
            localStorage.setItem('wc_telemetry_rates', JSON.stringify(rates));
            this.recalculateStats();
        },

        getStats() {
            this.recalculateStats();
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {};
        },

        getUsers() {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS)) || [];
        },

        getEvents(limit = 100) {
            const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
            return events.slice().reverse().slice(0, limit);
        },

        generateSampleData() {
            const now = new Date();
            const users = this.getUsers();
            
            const userNamesPool = ['WordGenius', 'Spellbound', 'LetterLegend', 'VocabViking', 'AnagramArtist', 'GridGrabber', 'SwipeSage'];
            
            const userId = 'U-' + Math.floor(100000 + Math.random() * 900000);
            const username = userNamesPool[Math.floor(Math.random() * userNamesPool.length)] + '_' + Math.floor(Math.random() * 100);
            const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
            const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
            
            const newUser = {
                userId,
                username,
                joinedAt: now.toISOString(),
                lastActive: now.toISOString(),
                levelReached: 1,
                adsWatched: 0,
                smartlinkClicks: 0,
                coins: 200,
                device,
                country,
                status: 'Live'
            };
            
            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
            this.syncUser(newUser);

            this.trackEvent('session_start', { detail: 'Session started on ' + device });

            const levelCount = Math.floor(Math.random() * 3) + 1;
            for (let l = 1; l <= levelCount; l++) {
                setTimeout(() => {
                    const uList = this.getUsers();
                    const uIdx = uList.findIndex(u => u.userId === userId);
                    if (uIdx !== -1) {
                        uList[uIdx].levelReached = l + 1;
                        uList[uIdx].coins += 25;
                        uList[uIdx].adsWatched += 1;
                        localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(uList));
                        this.syncUser(uList[uIdx]);
                    }

                    this.trackEvent('level_complete', { level: l, coinsReward: 25 });
                    this.trackEvent('ad_watch_interstitial', {});
                }, l * 200);
            }
        },

        resetData() {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            localStorage.removeItem(STORAGE_KEYS.ALL_USERS);
            localStorage.removeItem(STORAGE_KEYS.EVENTS);
            localStorage.removeItem(STORAGE_KEYS.STATS);
            localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
            this.init();
            window.dispatchEvent(new CustomEvent('wc_telemetry_reset'));
        }
    };

    window.Telemetry = Telemetry;
    Telemetry.init();
})();
