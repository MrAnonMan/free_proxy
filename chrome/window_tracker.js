'use strict';
define(['exports', './preferences.js', './proxydb.js'], function(exports, preferences, proxydb) {

    function handleAuthRequest(data, callback) {
        if (data.isProxy && preferences.prefs.autoConfirmProxyAuth) {
            proxydb.find({
                ip: data.challenger.host,
                httpport: data.challenger.port
            }, function(proxy) {
                if (proxy && proxy.username) {
                    callback({
                        authCredentials: {
                            username: proxy.username,
                            password: proxy.password
                        }
                    });
                }
            });
        } else {
            callback();
        }
    }
    browser.webRequest.onAuthRequired.addListener(handleAuthRequest, {
        urls: ['*://*/*', '<all_urls>'],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    }, ["asyncBlocking"]);
});