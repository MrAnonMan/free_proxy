'use strict';
define(['exports', 'module', './events.js', '../core/libs/jquery.min.js'], function(exports, module, events) {

    var defaultValues = {
        autotest: true,
        teststring: 'ok',
        autoConfirmProxyAuth: true,
        apiKey: '',
        autoRefresh: true,
        notifications: true,
        disableWebrtc: true
    };

    if (localStorage.prefs && typeof localStorage.prefs === 'string') {
        exports.prefs = $.extend(defaultValues, JSON.parse(localStorage.prefs));
    } else {
        exports.prefs = defaultValues;
    }

    function trigger(type, callback) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        events.trigger('preferences__' + type, callback)
    }

    exports.set = function(key, val) {
        trigger('beforeChange', {
            key: key,
            valueOld: exports.prefs[key],
            valueNew: val
        });
        exports.prefs[key] = val;
        localStorage.prefs = JSON.stringify(exports.prefs);
        trigger('change', {
            key: key,
            value: val
        });
        trigger(key, val);
    };

    exports.on = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = 'preferences__' + type;
        events.on.apply(null, args)
    };

    exports.one = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = 'preferences__' + type;
        events.one.apply(null, args)
    };
});