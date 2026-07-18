(function() {
    var SYNC_KEYS = ['chess_room_data', 'printerSettings', 'feishu_sync_config'];
    var lastData = {};
    for (var i = 0; i < SYNC_KEYS.length; i++) {
        try { lastData[SYNC_KEYS[i]] = localStorage.getItem(SYNC_KEYS[i]); } catch(e) {}
    }

    function isOnline() { return typeof navigator === 'undefined' || navigator.onLine !== false; }

    // ===== 推送: 监视 localStorage → POST 服务端 =====
    setInterval(function() {
        if (!isOnline()) return;
        var payload = {};
        for (var i = 0; i < SYNC_KEYS.length; i++) {
            var key = SYNC_KEYS[i];
            try {
                var val = localStorage.getItem(key);
                if (val !== lastData[key]) {
                    lastData[key] = val;
                    if (val) payload[key] = JSON.parse(val);
                }
            } catch(e) {}
        }
        if (Object.keys(payload).length > 0) {
            fetch('/api/sync/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(function(){});
        }
    }, 500);

    // ===== 静默更新: 替换数组内容（保留引用，App 自动感知）=====
    function replaceArray(arr, newItems) {
        arr.length = 0;
        if (newItems && newItems.length > 0) {
            for (var i = 0; i < newItems.length; i++) arr.push(newItems[i]);
        }
    }

    function applyServerData(d) {
        if (!window.__rooms) return false; // 没有暴露变量，回退刷新
        replaceArray(window.__rooms, d.rooms || []);
        replaceArray(window.__rules, d.rules || []);
        replaceArray(window.__products, d.products || []);
        replaceArray(window.__historyRecords, d.historyRecords || []);
        replaceArray(window.__logs, d.logs || []);
        window.__nextRoomId = d.nextRoomId || 1;
        window.__nextRuleId = d.nextRuleId || 1;
        window.__nextProductId = d.nextProductId || 1;
        window.__nextHistoryId = d.nextHistoryId || 1;
        window.__nextLogId = d.nextLogId || 1;
        window.__saveDataToCache();
        return true;
    }

    function reRenderCurrentView() {
        if (!window.__updateRoomStats) return;
        window.__updateRoomStats();
        var activeView = document.querySelector('.view.active');
        if (!activeView) return;
        var vid = activeView.id;
        if (vid === 'view-dashboard' || vid === 'view-rooms') {
            if (window.__renderDashboardCards) window.__renderDashboardCards();
            if (window.__renderRoomsTable) window.__renderRoomsTable();
        }
        if (vid === 'view-rules' && window.__renderRules) window.__renderRules();
        if (vid === 'view-products' && window.__renderProducts) window.__renderProducts();
        if (vid === 'view-history' && window.__renderHistoryTable) window.__renderHistoryTable();
    }

    // ===== 拉取: 轮询服务端 → 发现变更则静默更新 =====
    setInterval(function() {
        if (!isOnline()) return;
        var el = document.activeElement;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;

        fetch('/api/sync/load')
            .then(function(r) { return r.json(); })
            .then(function(sd) {
                if (!sd || !sd.chess_room_data) return;
                var needsReload = false;
                for (var i = 0; i < SYNC_KEYS.length; i++) {
                    var key = SYNC_KEYS[i];
                    if (sd[key]) {
                        var sStr = JSON.stringify(sd[key]);
                        var lStr = localStorage.getItem(key);
                        if (sStr !== lStr) {
                            needsReload = true;
                            try { localStorage.setItem(key, JSON.stringify(sd[key])); } catch(e) {}
                            lastData[key] = localStorage.getItem(key);
                        }
                    }
                }
                if (needsReload) {
                    if (applyServerData(sd.chess_room_data)) {
                        reRenderCurrentView();
                    } else {
                        location.reload(); // 降级：整页刷新
                    }
                }
            })
            .catch(function() {});
    }, 4000);
})();
