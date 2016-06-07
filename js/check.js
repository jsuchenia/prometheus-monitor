function checkUrl(url, callback) {
    hx.html(url, function(error, response) {
        if (hx.defined(error)) {
            callback(undefined);
        } else {
            var title = response.querySelector('title').textContent;
            var alerts = response.querySelectorAll('tr.alert_header');
            if (title === 'Prometheus Time Series Collection and Processing Server' && alerts.length > 0) {
                var success = response.querySelectorAll('tr.success')
                var firing = response.querySelectorAll('tr.danger');
                callback({url: url, all: alerts.length, firing: firing.length, pending: 0});
            } else {
                callback(undefined);
            }
        }
    });
}
