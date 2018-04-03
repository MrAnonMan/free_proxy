'use strict';

var events = (function() {
    var exports = {};
    var events = {};
    var eventsOneTime = {};

    exports.on = function(eventname, callback) {
        if (!events.hasOwnProperty(eventname)) {
            events[eventname] = [];
        }
        var idx = events[eventname].push(callback) - 1;
        return {
            remove: function() {
                delete events[eventname][idx];
            }
        };
    };

    exports.one = function(eventname, callback) {
        var handler = exports.on(eventname, function() {
            handler.remove();
            callback.apply(null, Array.prototype.slice.call(arguments));
        })
    };

    exports.trigger = function(eventname, args) {
        if (events.hasOwnProperty(eventname) && events[eventname].length) {
            events[eventname].forEach(function(callback) {
                callback.apply(null, args);
            });
        }
        if (eventsOneTime.hasOwnProperty(eventname) && eventsOneTime[eventname].length) {
            eventsOneTime[eventname].forEach(function(callback) {
                callback.apply(null, args);
            });
        }
    };

    return exports;
})();

var fcache = {};
var options = {};

var sendMessage = function(type) {
    console.log('sendMessage debug:', Array.prototype.slice.call(arguments));
    alert(type);
};

window.handleApiResponse = function(args, from) {
    var eventname = args.shift();
    switch (eventname) {
        case 'proxylist_changed':
            fcache.proxylist = args[0];
            break;
        case 'current_proxy_changed':
            fcache.current_proxy = args[0];
            break;
        case 'preferences_changed':
            fcache.preferences = args[0];
            break;
    }
    events.trigger(eventname, args);
};

function sendRequest(responceEventName, requestEventName, requestParam) {
    return new Promise(function(resolve) {
        events.one(responceEventName, resolve);
        sendMessage(requestEventName, requestParam);
    });
}

function saveProxy(proxy) {
    return sendRequest('proxylist_changed', 'saveProxy', proxy);
}

function saveProxies(proxies) {
    return sendRequest('proxylist_changed', 'saveProxies', proxies);
}

function deleteProxy(id) {
    if (id > 0) {
        return sendRequest('proxylist_changed', 'deleteProxy', id);
    } else {
        console.error('invalid id: ' + id);
        return Pomise.reject();
    }
}

function deleteAllProxies() {
    return sendRequest('proxylist_changed', 'deleteAllProxies');
}

function prevProxy() {
    return sendRequest('current_proxy_changed', 'prevProxy');
}

function nextProxy() {
    return sendRequest('current_proxy_changed', 'nextProxy');
}

function toogleLastProxy() {
    return sendRequest('current_proxy_changed', 'toogleLastProxy');
}

function getProxy(id) {
    if (id > 0) {
        return sendRequest('proxy_' + id, 'getProxy', id);
    } else {
        return Promise.resolve({
            label: 'Local',
            ip: '127.0.0.1',
            httpport: 8080
        });
    }
}

function getCurrentProxy() {
    if (fcache.current_proxy) {
        return Promise.resolve(fcache.current_proxy);
    } else {
        return sendRequest('current_proxy', 'getCurrentProxy').then(function(result) {
            return fcache.current_proxy = result;
        });
    }
}

function getUserpackages() {
    var promise = new Promise(function(resolve, reject) {
        events.one('current_userpackages', function(userpackages, error_msg) {
            if (userpackages === false) {
                reject(error_msg);
            } else {
                resolve(userpackages);
            }
        });
    });
    sendMessage('getUserpackages');
    return promise;
}

function importUserpackage(id) {
    return sendRequest('userpackage_import_finished', 'importUserpackage', id);
}

function setCurrentProxy(id) {
    return sendRequest('current_proxy_changed', 'setCurrentProxy', id);
}

function disableCurrentProxy() {
    return setCurrentProxy(null);
}

function getProxylist() {

    if (fcache.proxylist) {
        return Promise.resolve(fcache.proxylist);
    } else {
        return sendRequest('current_proxylist', 'getProxylist').then(function(result) {
            return fcache.proxylist = result;
        });
    }
}

function getPreferences() {
    var dfd = $.Deferred();
    if (fcache.preferences) {
        return Promise.resolve(fcache.preferences);
    } else {
        return sendRequest('current_preferences', 'getPreferences').then(function(result) {
            return fcache.preferences = result;
        });
    }
}

function getPreference(name) {
    return getPreferences().then(function(preferences) {
        return preferences[name];
    });
}

function setPreference(name, val) {
    sendMessage('setPreference', name, val);
}

function copyCSV(txt) {
    sendMessage('copyCSV', txt);
}

function showProxylist() {
    sendMessage('showProxylist');
}