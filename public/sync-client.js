(function() {
    if (window.__SERVER_DATA__) {
        var keys = Object.keys(window.__SERVER_DATA__);
        for (var i = 0; i < keys.length; i++) {
            try { localStorage.setItem(keys[i], JSON.stringify(window.__SERVER_DATA__[keys[i]])); } catch(e) {}
        }
    }
})();
