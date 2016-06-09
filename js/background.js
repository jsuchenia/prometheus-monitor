// Received a message from content script
var values = {};

function updateCfg(callback) {
    chrome.storage.sync.get(null, callback);
}

function updateBadge() {
    updateCfg(function(response) {
        var allAlarms = 0;
        for (url in response) {
            if (response.hasOwnProperty(url) && (url.startsWith('http://') || url.startsWith('https://'))) {
                if (response[url].firing) allAlarms += response[url].firingAlarms;
                if (response[url].pending) allAlarms += response[url].pendingAlarms;
            }
        }

        if (allAlarms > 0) {
            chrome.browserAction.setBadgeText({text: "" + allAlarms})
        } else {
            chrome.browserAction.setBadgeText({text: ""});
        }
    });
}
function checkAll() {
    updateCfg(function(response) {
        for (url in response) {
            if (response.hasOwnProperty(url) && (url.startsWith('http://') || url.startsWith('https://'))) {
                checkUrl(url, function(result) {
                    if (result !== undefined) {
                        if (response[url].firing  === true && response[url].firingAlarms < result.firing) {
                            notifyError(url, 'firing', result.firing);
                        }
                        if (response[url].pending  === true && response[url].pendingAlarms < result.pending) {
                            notifyError(url, 'pending', result.pending);
                        }

                        var toSave = {}
                        toSave[url] = response[url];
                        toSave[url].firingAlarms = result.firing;
                        toSave[url].pendingAlarms = result.pending;
                        chrome.storage.sync.set(toSave, updateBadge)
                    }
                });
            }
        }
    })
}

function notifyError(url, type, value) {
        chrome.notifications.create("url-" + url + type, {
            type: 'basic',
            iconUrl: 'images/ico128.png',
            title: 'New ' + type + ' alerts',
            message: 'New ' + type + ' alerts on ' + url
        }, function() {})

}

setInterval(checkAll, 10000)
