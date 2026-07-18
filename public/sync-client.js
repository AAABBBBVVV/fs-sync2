/**
 * sync-client.js — 首次加载填充层
 * 仅在页面加载时把服务端数据（window.__SERVER_DATA__）写入 localStorage
 * 实时同步由 app 内 saveDataToCache() / loadFromServer() 处理
 */
(function() {
    if (window.__SERVER_DATA__) {
        var serverData = window.__SERVER_DATA__;
        for (var key in serverData) {
            if (serverData.hasOwnProperty(key)) {
                try {
                    localStorage.setItem(key, JSON.stringify(serverData[key]));
                } catch(e) {}
            }
        }
    }
})();
