'use strict';
define(['exports', '/core/libs/sprintf.js'], function(exports) {
    exports._ = window._ = function(id, replacement, extra_args) {
        if (!id || id == '') {
            console.error('Invalid i18n call: ' + id);
            return replacement || false;
        }
        var translated = browser.i18n.getMessage(id);
        if (!translated) {
            console.error('Invalid i18n call: ' + id);
            return replacement || false;
        }
        if (translated === '') {
            console.error('Invalid i18n: ' + id);
            return replacement || 'Invalid i18n: ' + id;
        }
        if (translated === id) {
            console.error('Invalid i18n: ' + id);
            translated = replacement;
        }
        if (!extra_args) {
            return translated;
        }
        var args = Array.prototype.slice.call(arguments);
        args.shift();
        args[0] = translated;
        return sprintf.apply(exports, args);
    };

    exports.__ = window.__ = function(id, extra_args) {
        if (!id || id == '') {
            console.error('Invalid i18n call: ' + id);
            return replacement || false;
        }
        var translated = browser.i18n.getMessage(id);
        if (!translated) {
            console.error('Invalid i18n call');
            return false;
        }
        if (translated === '') {
            console.error('Invalid i18n: ' + id);
            return false;
        }
        if (!extra_args) {
            return translated;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = translated;
        return sprintf.apply(exports, args);
    };
});