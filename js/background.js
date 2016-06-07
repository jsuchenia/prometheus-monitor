// Received a message from content script
var pluginCfg = {};

// chrome.browserAction.onClicked.addListener(function(tab) {
//     var url = tab.url;
//     if (!prometheusUrls.hasOwnProperty(url)) {
//         prometheusUrls[url] = {added: true};
//
//         chrome.notifications.create("add-" + url, {
//             type: 'basic',
//             iconUrl: 'images/ico128.png',
//             title: 'Prometheus host added',
//             message: 'Host ' + url + ' has been added to our system'
//         }, function() {})
//     } else {
//         delete prometheusUrls[url];
//         chrome.notifications.create("remove-" + url, {
//             type: 'basic',
//             iconUrl: 'images/ico128.png',
//             title: 'Prometheus host removed',
//             message: 'Host ' + url + ' has been removed from our system'
//         }, function() {})
//     }
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.hasOwnProperty('action')) {
        if (request.action === 'showPrometheusIcon') {
            chrome.browserAction.setIcon({path: "images/settings.png", tabId: sender.tab.id});
            chrome.browserAction.setPopup({popup: "html/currentHost.html", tabId: sender.tab.id});
        } else if (request.action === 'getCfg') {
            if (!pluginCfg.hasOwnProperty(request.url)) {
                pluginCfg[request.url] = {pending: false, firing: false};
            }

            sendResponse(pluginCfg[request.url])
        } else if (request.action === 'getList') {
            sendResponse(pluginCfg)
        } else if (request.action === 'saveCfg') {
            if (!pluginCfg.hasOwnProperty(request.url)) {
                pluginCfg[request.url] = {pending: false, firing: false};
            }

            pluginCfg[request.url].pending = request.pending;
            pluginCfg[request.url].firing = request.firing;

            chrome.storage.sync.set(pluginCfg, function() {
                sendResponse(pluginCfg[request.url])
            });
        } else if (request.action === 'deleteCfg') {
            delete pluginCfg[request.url]
            chrome.storage.sync.set(pluginCfg, function () {
                sendResponse(pluginCfg)
            });
        }
    }
});

chrome.storage.sync.get(null, function(values) {
    pluginCfg = values;
});

function updateBadge() {
    var allAlarms = 0;
    for (url in pluginCfg) {
        if (pluginCfg.hasOwnProperty(url)) {
            if (pluginCfg[url].firing) allAlarms += pluginCfg[url].firingAlarms;
            if (pluginCfg[url].pending) allAlarms += pluginCfg[url].pendingAlarms;
        }
    }

    if (allAlarms > 0) {
        chrome.browserAction.setBadgeText({text: "" + allAlarms})
    } else {
        chrome.browserAction.setBadgeText({text: ""});
    }
}
function checkAll() {
    for (url in pluginCfg) {
        if (pluginCfg.hasOwnProperty(url)) {
            checkUrl(url, function(result) {
                if (result !== undefined) {
                    pluginCfg[url].firingAlarms = result.firing;
                    pluginCfg[url].pendingAlarms = result.pending;
                    updateBadge();
                }
            });
        }
    }
}


setInterval(checkAll, 10000)
