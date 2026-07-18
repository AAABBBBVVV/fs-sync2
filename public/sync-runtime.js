(function() {
    // 需要同步的 localStorage key
    var SYNC_KEYS = ['chess_room_data', 'printerSettings', 'feishu_sync_config'];

    // 记录上次数据，用于检测变更
    var lastData = {};
    for (var i = 0; i < SYNC_KEYS.length; i++) {
        try { lastData[SYNC_KEYS[i]] = localStorage.getItem(SYNC_KEYS[i]); } catch(e) {}
    }

    function isOnline() {
        return typeof navigator === 'undefined' || navigator.onLine !== false;
    }

    // ===== 推送: 监视 localStorage 变更 → POST 到服务端 =====
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
    }, 500); // 每 500ms 检查一次

    // ===== 拉取: 轮询服务端 → 发现变更则刷新 =====
    setInterval(function() {
        if (!isOnline()) return;

        // 用户打字中不刷新
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
                if (needsReload) location.reload();
            })
            .catch(function() {});
    }, 4000); // 每 4 秒轮询一次
})();
