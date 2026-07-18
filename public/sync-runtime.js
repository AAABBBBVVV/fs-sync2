/**
 * sync-runtime.js — 跨设备数据同步运行时
 * 原理：监视 localStorage 变化推送到服务端 + 轮询服务端拉取远程变更后刷新页面
 * 不修改 3.0.0.html 任何代码，通过全局 hook 实现。
 * 有网走服务端，无网用本地缓存兜底。
 */
(function() {
    var PUSH_INTERVAL = 500;   // 每 500ms 检查本地变更并推送
    var PULL_INTERVAL = 4000;  // 每 4 秒拉取远程数据检查变更
    var CACHE_KEY = 'chess_room_data';
    var PUSH_KEY = 'printerSettings';
    var FEISHU_KEY = 'feishu_sync_config';
    var SYNC_KEYS = [CACHE_KEY, PUSH_KEY, FEISHU_KEY];
    var lastCachedData = localStorage.getItem(CACHE_KEY);

    // ===== 判断是否在线 =====
    function isOnline() {
        return typeof navigator === 'undefined' || navigator.onLine !== false;
    }

    // ===== 推送本地变更到服务端 =====
    function pushToServer() {
        if (!isOnline()) return;
        var payload = {};
        for (var i = 0; i < SYNC_KEYS.length; i++) {
            try {
                var val = localStorage.getItem(SYNC_KEYS[i]);
                if (val) payload[SYNC_KEYS[i]] = JSON.parse(val);
            } catch(e) {}
        }
        if (Object.keys(payload).length > 0) {
            fetch('/api/sync/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(function(){});
        }
    }

    // ===== 监视 localStorage 变更，每 500ms 检查一次 =====
    setInterval(function() {
        var current = localStorage.getItem(CACHE_KEY);
        if (current !== lastCachedData) {
            lastCachedData = current;
            pushToServer();
        }
    }, PUSH_INTERVAL);

    // ===== 轮询服务端，发现远程变更时自动刷新 =====
    setInterval(function() {
        if (!isOnline()) return;

        // 用户输入中不刷新，避免打断
        var activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
            return;
        }

        fetch('/api/sync/load')
            .then(function(r) { return r.json(); })
            .then(function(serverData) {
                if (!serverData || !serverData[CACHE_KEY]) return;
                var serverStr = JSON.stringify(serverData);
                var localChess = localStorage.getItem(CACHE_KEY);
                var localPush = localStorage.getItem(PUSH_KEY);
                var localFeishu = localStorage.getItem(FEISHU_KEY);

                // 逐一对比每个 key，只要有一个不同就刷新
                var serverChess = serverData[CACHE_KEY];
                var serverChessStr = JSON.stringify(serverChess);
                var needsReload = false;
                if (serverChessStr !== localChess) needsReload = true;
                if (serverData[PUSH_KEY] && JSON.stringify(serverData[PUSH_KEY]) !== localPush) needsReload = true;
                if (serverData[FEISHU_KEY] && JSON.stringify(serverData[FEISHU_KEY]) !== localFeishu) needsReload = true;

                if (needsReload) {
                    // 把服务端最新数据写入 localStorage 后刷新
                    for (var i = 0; i < SYNC_KEYS.length; i++) {
                        var key = SYNC_KEYS[i];
                        if (serverData[key] !== undefined) {
                            try {
                                localStorage.setItem(key, JSON.stringify(serverData[key]));
                            } catch(e) {}
                        }
                    }
                    lastCachedData = localStorage.getItem(CACHE_KEY);
                    location.reload();
                }
            })
            .catch(function() {});
    }, PULL_INTERVAL);
})();
