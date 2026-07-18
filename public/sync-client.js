/**
 * sync-client.js — 跨设备数据同步层
 * 透明拦截 localStorage 读写，自动与服务端同步
 * 定期轮询服务端，有新数据时自动刷新
 */
(function() {
    var SYNC_KEYS = ['chess_room_data', 'printerSettings', 'feishu_sync_config'];
    var POLL_INTERVAL = 4000; // 每4秒检查一次
    var SAVE_DEBOUNCE = 600;

    // ===== 工具：深度比较两个对象 =====
    function areEqual(a, b) {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (typeof a !== typeof b) return false;
        return JSON.stringify(a) === JSON.stringify(b);
    }

    // ===== 1. 预填充：服务端数据写入 localStorage =====
    if (window.__SERVER_DATA__) {
        var serverData = window.__SERVER_DATA__;
        for (var key in serverData) {
            if (serverData.hasOwnProperty(key) && SYNC_KEYS.indexOf(key) !== -1) {
                try { localStorage.setItem(key, JSON.stringify(serverData[key])); } catch(e) {}
            }
        }
    }

    // ===== 2. 拦截 localStorage.setItem → 同步到服务端 =====
    var origSetItem = localStorage.setItem.bind(localStorage);
    var saveTimer = null;
    var skipNextSync = false; // 避免循环（拉下来的数据不再推回去）

    function debouncedSync() {
        if (skipNextSync) return;
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(function() {
            var payload = {};
            for (var i = 0; i < SYNC_KEYS.length; i++) {
                var key = SYNC_KEYS[i];
                try {
                    var val = localStorage.getItem(key);
                    if (val) payload[key] = JSON.parse(val);
                } catch(e) {}
            }
            if (Object.keys(payload).length > 0) {
                fetch('/api/sync/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(function() {});
            }
        }, SAVE_DEBOUNCE);
    }

    localStorage.setItem = function(key, value) {
        origSetItem(key, value);
        if (SYNC_KEYS.indexOf(key) !== -1) {
            debouncedSync();
        }
    };

    // ===== 3. 定期轮询服务端 → 发现新数据则自动刷新 =====
    setInterval(function() {
        // 如果用户在输入框中，暂时不刷新，避免打断输入
        var activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
            return;
        }

        fetch('/api/sync/load')
            .then(function(r) { return r.json(); })
            .then(function(serverData) {
                if (!serverData || Object.keys(serverData).length === 0) return;

                var needsReload = false;
                for (var i = 0; i < SYNC_KEYS.length; i++) {
                    var key = SYNC_KEYS[i];
                    if (serverData[key]) {
                        try {
                            var local = JSON.parse(localStorage.getItem(key) || 'null');
                            if (!areEqual(local, serverData[key])) {
                                needsReload = true;
                                break;
                            }
                        } catch(e) { needsReload = true; break; }
                    }
                }

                if (needsReload) {
                    // 刷新前先把服务端最新数据写入 localStorage
                    skipNextSync = true;
                    for (var i = 0; i < SYNC_KEYS.length; i++) {
                        var key = SYNC_KEYS[i];
                        if (serverData[key] !== undefined) {
                            try { origSetItem(key, JSON.stringify(serverData[key])); } catch(e) {}
                        }
                    }
                    skipNextSync = false;
                    location.reload();
                }
            })
            .catch(function() {});
    }, POLL_INTERVAL);
})();
