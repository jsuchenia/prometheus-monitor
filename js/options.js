function reloadEntries() {
    hx.select('div.hostlist').clear();
    var hostList = hx.select('div.hostlist');

    chrome.runtime.sendMessage({action: 'getList'}, function(response) {
        for (url in response) {
            if (response.hasOwnProperty(url)) {
                hostList.append('div').text(url);

                //Toggles
                var firingToggle = new hx.Toggle(hostList.append('button').class('hx-btn hx-positive').text('Firing'));
                firingToggle.value(response[url].firing);
                var pendingToggle = new hx.Toggle(hostList.append('button').class('hx-btn hx-positive').text('Pending'));
                pendingToggle.value(response[url].pending);

                function saveCfg() {
                    console.log("Saving url", url);
                    chrome.runtime.sendMessage({action: 'saveCfg', url: url, firing: firingToggle.value(), pending: pendingToggle.value()})
                }
                firingToggle.on('change', saveCfg);
                pendingToggle.on('change', saveCfg);
                //Remove
                var removeBtn = hostList.append('button').class('hx-btn hx-negative');
                removeBtn.text("Remove");
                removeBtn.on('click', function() {
                    chrome.runtime.sendMessage({action: 'deleteCfg', url: url}, function() {
                        reloadEntries();
                    });
                })
            }
        }
    })
}

hx.select("#add").on("click", function() {
    hx.modal.input('Add Prometheus instance', 'Enter URL to Alarm page:', function(val){
        if (hx.isString(val)){
            checkUrl(val, function(response) {
                if (hx.defined(response)) {
                    chrome.runtime.sendMessage({action: 'saveCfg', url: response.url}, reloadEntries)
                } else {
                    hx.notify.negative('Its not a valid Prometheus alert URL');
                }
            })
        }
    });
});

reloadEntries();
