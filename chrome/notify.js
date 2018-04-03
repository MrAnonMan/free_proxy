'use strict';
define(['exports', './i18n.js'], function(exports, i18n) {
    var addon_name = i18n.__('addon_name', 'FREE proxy');
    exports.notify = function(text, calbackFun, callbackObj) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        var notification = new Notification(addon_name, {
            icon: '/img/128.png',
            body: text
        });

        setTimeout(function() {
            notification.close();
        }, 3000);

        notification.onclick = function() {
            if (calbackFun) {
                calbackFun(callbackObj);
            }
        };
    };

    exports.toast = function(text) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        var notification = new Notification(addon_name, {
            icon: '/img/128.png',
            body: text
        });

        setTimeout(function() {
            notification.close();
        }, 1500);
    };
});