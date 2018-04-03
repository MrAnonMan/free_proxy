'use strict';
define(['exports', 'module', './events.js', './preferences.js'], function(exports, module, events, preferences) {
    var proxyCache = {};
    var lastProxy = {};

    function trigger(type, callback) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        events.trigger('current_proxy__' + type, callback)
    }

    exports.getLastEnabledProxy = function() {
        return lastProxy;
    };

    exports.get = function(callback) {
        browser.proxy.settings.get({
            'incognito': false
        }, function(config) {
            if (!config.value || config.value.mode !== 'fixed_servers') {
                callback({});
            } else {
                var out = {};
                if (config.value.rules.proxyForHttp.scheme == 'http') {
                    out = {
                        proxy_http_ip: config.value.rules.proxyForHttp.host,
                        proxy_http_port: config.value.rules.proxyForHttp.port
                    };
                } else if (config.value.rules.proxyForHttp.scheme == 'socks5') {
                    out = {
                        proxy_socks_ip: config.value.rules.proxyForHttp.host,
                        proxy_socks_port: config.value.rules.proxyForHttp.port
                    };
                }
                callback(out);
            }
        });
    };

    exports.disable = function() {
        var config = {
            mode: 'direct'
        };
        if (preferences.prefs.disableWebrtc) {
            if (browser.privacy.network.webRTCIPHandlingPolicy) {
                browser.privacy.network.webRTCIPHandlingPolicy.set({
                    value: 'default_public_interface_only'
                });
            } else if (browser.privacy.network.webRTCMultipleRoutesEnabled) {
                browser.privacy.network.webRTCMultipleRoutesEnabled.set({
                    value: true,
                    scope: 'regular'
                });
            }
        }
        browser.proxy.settings.set({
            value: config,
            scope: 'regular'
        }, function() {
            exports.get(function(current_proxy) {
                proxyCache = current_proxy;
                trigger('disabled');
            });

        });
    };

    function setProxy(proxy) {
        if (!proxy.ip || proxy.ip === '') {
            exports.disable();
            return;
        }

        if (!proxy.httpport && !proxy.socksport) {
            trigger('error', proxy);
            return;
        }

        var config;

        if (parseInt(proxy.httpport, 10)) {
            config = {
                mode: "fixed_servers",
                rules: {
                    proxyForHttp: {
                        scheme: "http",
                        host: proxy.ip,
                        port: parseInt(proxy.httpport, 10)
                    },
                    proxyForHttps: {
                        scheme: "http",
                        host: proxy.ip,
                        port: parseInt(proxy.httpport, 10)
                    }
                }
            };
            if (parseInt(proxy.socksport, 10)) {
                config.rules.fallbackProxy = {
                    scheme: "socks5",
                    host: proxy.ip,
                    port: parseInt(proxy.socksport, 10)
                }
            }
        } else if (parseInt(proxy.socksport, 10)) {
            config = {
                mode: "fixed_servers",
                rules: {
                    proxyForHttp: {
                        scheme: "socks5",
                        host: proxy.ip,
                        port: parseInt(proxy.socksport, 10)
                    },
                    proxyForHttps: {
                        scheme: "socks5",
                        host: proxy.ip,
                        port: parseInt(proxy.socksport, 10)
                    },
                    fallbackProxy: {
                        scheme: "socks5",
                        host: proxy.ip,
                        port: parseInt(proxy.socksport, 10)
                    }
                }
            };
        } else {
            exports.disable();
            return;
        }

        lastProxy = proxy;
        if (preferences.prefs.disableWebrtc) {
            if (browser.privacy.network.webRTCIPHandlingPolicy) {
                browser.privacy.network.webRTCIPHandlingPolicy.set({
                    value: 'disable_non_proxied_udp'
                });

            } else if (browser.privacy.network.webRTCMultipleRoutesEnabled) {
                browser.privacy.network.webRTCMultipleRoutesEnabled.set({
                    value: false,
                    scope: 'regular'
                });
            }
        }
        browser.proxy.settings.set({
            value: config,
            scope: 'regular'
        }, function() {
            exports.get(function(current_proxy) {
                proxyCache = current_proxy;
                trigger('change');
            });
        });
    }

    exports.set = setProxy;

    function proxyMonitor() {
        exports.get(function(proxy_obj) {
            var change = false,
                keys = ['proxy_http_ip', 'proxy_http_port'];
            for (var i = 0; i < 2; i += 1) {
                if (proxy_obj[keys[i]] !== proxyCache[keys[i]]) {
                    change = true;
                    break;
                }
            }
            proxyCache = proxy_obj;
            if (change) {
                trigger('external_change');
            }
        });
    }

    exports.on = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = 'current_proxy__' + type;
        events.on.apply(null, args)
    };

    exports.once = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = 'current_proxy__' + type;
        events.one.apply(null, args)
    };

    proxyMonitor();
    window.setInterval(proxyMonitor, 1000);
});