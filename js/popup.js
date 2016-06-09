chrome.storage.sync.get(null, function(response) {
    var tbody = hx.select('tbody');
    tbody.clear()

    for (url in response) {
        if (response.hasOwnProperty(url)) {
            var tr = tbody.append('tr')
            tr.append('td').append('a').attr('href', url).text(url).on('click', function() {
                chrome.tabs.create({ url: url });
            });
            tr.append('td').text(response[url].firingAlarms)
            tr.append('td').text(response[url].pendingAlarms)
        }
    }
});
