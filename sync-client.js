/**
 * sync-client.js — 跨设备数据同步层
 * 透明拦截 localStorage 读写，自动与服务端同步
 * 不对原有业务逻辑做任何侵入性修改
 */
(function() {
    // ===== 需要同步的 localStorage key =====
    const SYNC_KEYS = ['chess_room_data', 'printerSettings', 'feishu_sync_config'];

    // ===== 1. 预填充：将服务端数据写入 localStorage（在主应用读取前执行） =====
    if (window.__SERVER_DATA__) {
        const serverData = window.__SERVER_DATA__;
        for (const key of Object.keys(serverData)) {
            if (SYNC_KEYS.includes(key)) {
                try {
                    localStorage.setItem(key, JSON.stringify(serverData[key]));
                } catch (e) { /* localStorage 满时静默失败 */ }
            }
        }
    }

    // ===== 2. 拦截 localStorage.setItem，同步变更到服务端 =====
    const origSetItem = localStorage.setItem.bind(localStorage);
    let syncTimer = null;

    function debouncedSync() {
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(function() {
            var payload = {};
            for (var i = 0; i < SYNC_KEYS.length; i++) {
                var key = SYNC_KEYS[i];
                try {
                    var val = localStorage.getItem(key);
                    if (val) payload[key] = JSON.parse(val);
                } catch (e) { /* 解析失败跳过 */ }
            }
            if (Object.keys(payload).length > 0) {
                fetch('/api/sync/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).catch(function() {});
            }
        }, 600);
    }

    localStorage.setItem = function(key, value) {
        origSetItem(key, value);
        if (SYNC_KEYS.indexOf(key) !== -1) {
            debouncedSync();
        }
    };
})();
