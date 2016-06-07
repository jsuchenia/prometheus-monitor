chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
   var url = tabs[0].url;
    document.getElementById("hostName").innerHTML = url;

    chrome.runtime.sendMessage({action: 'getCfg', url: url}, function(response) {
        console.log('Got response', response);

        var pending = new hx.Toggle("#pending").value(response.pending);
        var firing = new hx.Toggle("#firing").value(response.firing);

        var updateCfg =  function() {
            var cfg = {action: 'saveCfg', url: url, pending: pending.value(), firing: firing.value()};
            chrome.runtime.sendMessage(cfg)
        };

        pending.on('change', updateCfg);
        firing.on('change', updateCfg);
    });
});
