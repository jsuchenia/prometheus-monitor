function reloadEntries() {
    hx.select('div.hostlist').clear();
    var hostList = hx.select('div.hostlist');

    chrome.storage.sync.get(null, function(response) {
        for (url in response) {
            if (response.hasOwnProperty(url)) {
                hostList.append('div').text(url);

                //Toggles
                var firingToggle = new hx.Toggle(hostList.append('button').class('hx-btn hx-positive').text('Firing'));
                firingToggle.value(response[url].firing);
                var pendingToggle = new hx.Toggle(hostList.append('button').class('hx-btn hx-positive').text('Pending'));
                pendingToggle.value(response[url].pending);

                function saveCfg() {
                    var toSave = {};
                    toSave[url] = {firing: firingToggle.value(), pending: pendingToggle.value()};
                    console.log("Saving url", url, toSave);
                    chrome.storage.sync.set(toSave, function(response) {console.log('Saved')});
                }
                firingToggle.on('change', saveCfg);
                pendingToggle.on('change', saveCfg);
                //Remove
                var removeBtn = hostList.append('button').class('hx-btn hx-negative');
                removeBtn.text("Remove");
                removeBtn.on('click', function() {
                    chrome.storage.sync.remove(url, function(response) {reloadEntries()});
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
                    var toSave = {};
                    toSave[response.url] = {firing: false, pending: false};
                    console.log("Saving url", response.url, toSave);
                    chrome.storage.sync.set(toSave, reloadEntries);
                } else {
                    hx.notify.negative('Its not a valid Prometheus alert URL');
                }
            })
        }
    });
});

reloadEntries();
