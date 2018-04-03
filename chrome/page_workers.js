'use strict';
define(['exports', 'module', './events.js'], function(exports, module, events) {

    exports.trigger = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        var pageWorkers = browser.extension.getViews();
        if (!pageWorkers.length) {
            console.error('Empty pageWorkers');
        }
        for (var i = 0; i < pageWorkers.length; i++) {
            if (pageWorkers[i].handleApiResponse) {
                pageWorkers[i].handleApiResponse(JSON.parse(JSON.stringify(args)), 'page_worker');
            }
        }
        browser.windows.getAll({}, function(windows) {
            for (var i = windows.length - 1; i >= 0; i -= 1) {
                var cur_window = windows[i];
                browser.tabs.getAllInWindow(cur_window.id, function(tabs) {
                    for (var j = tabs.length - 1; j >= 0; j -= 1) {
                        var parser = document.createElement('a'),
                            tab = tabs[j];
                        parser.href = tab.url;
                        if (parser.hostname == '' || parser.hostname == '' || parser.hostname == '') {
                            browser.tabs.sendMessage(tab.id, JSON.parse(JSON.stringify(args)));
                        }
                    }
                });
            }
        });
    };

    exports.handleMessage = window.postMessage = function(type) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        var args = Array.prototype.slice.call(arguments);
        args[0] = 'page_workers__' + type;
        events.trigger.apply(null, args)
    };

    exports.on = function(type, callback) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        events.on('page_workers__' + type, callback)
    };

    exports.one = function(type, callback) {
        if (!type || type === '') {
            console.error('Invalid type', type);
            return;
        }
        events.one('page_workers__' + type, callback)
    };


    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (sender.tab) {
            var parser = document.createElement('a');
            parser.href = sender.tab.url;
            if (parser.hostname == '' || parser.hostname == '' || parser.hostname == '') {
                exports.handleMessage.apply(null, request)
            }
        } else if (sender.id = browser.runtime.id) {
            exports.handleMessage.apply(null, request)
        }
    });
});