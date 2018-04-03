'use strict';
define(['exports', '/chrome/free_proxy.js', './i18n.js', '/chrome/window_tracker.js'], function(exports, free_proxy, i18n, window_tracker) {
    const _ = i18n._;
    const __ = i18n.__;

    function updateProxylist() {
        var proxy, menus = {};
        $.when(free_proxy.getProxylist(), free_proxy.getCurrentProxy()).then(function(proxies, current_proxy) {
            browser.contextMenus.removeAll();
            if (!proxies.length) return;
            browser.contextMenus.create({
                title: __('next_proxy'),
                contexts: ['all'],
                onclick: free_proxy.setNextProxy
            });
            browser.contextMenus.create({
                title: __('previous_proxy'),
                contexts: ['all'],
                onclick: free_proxy.setPrevProxy
            });
            browser.contextMenus.create({
                type: 'separator',
                contexts: ['all']
            });
            for (var i = 0; i < proxies.length; i++) {
                proxy = proxies[i];
                var flag = 'unknown';
                if (proxy.countrycode) {
                    flag = proxy.countrycode.toLowerCase();
                }
                var ucase_label = proxy.label.charAt(0).toUpperCase() + proxy.label.substr(1).toLowerCase();
                var menu_id = browser.contextMenus.create({
                    type: 'radio',
                    title: (proxy.countrycode || '??') + ', ' + (ucase_label || '???') + ' [' + proxy.ip + ']',
                    checked: current_proxy.id === proxy.id,
                    contexts: ['all'],
                    onclick: function(menuItem) {
                        var proxy = menus[menuItem.menuItemId];
                        browser.extension.getBackgroundPage().postMessage('setCurrentProxy', proxy.id);
                    }
                });
                menus[menu_id] = proxy;
            }
        });
    }

    free_proxy.on('current_proxy_changed', updateProxylist);
    free_proxy.on('proxylist_changed', updateProxylist);
    updateProxylist();

    function updateToolbarButton(current_proxy) {
        var label, icon;
        if (current_proxy.ip) {
            label = 'FREE Proxy ' + current_proxy.ip;
            if (current_proxy.label) label += '[' + current_proxy.label + ']';
            if (current_proxy.countrycode) {
                icon = '/img/flags/' + current_proxy.countrycode.toLowerCase() + '.png';
            } else {
                icon = '/img/flags/unknown.png';
            }
        } else {
            label = 'FREE Proxy ';
            icon = '/img/18.png';
        }
        browser.browserAction.setIcon({
            path: icon
        });
        browser.browserAction.setTitle({
            title: label
        });
    }

    free_proxy.on('current_proxy_changed', updateToolbarButton);
    free_proxy.getCurrentProxy().then(updateToolbarButton);

    chrome.commands.onCommand.addListener(function(command) {
        switch (command) {
            case 'next-proxy':
                free_proxy.page_workers.handleMessage('nextProxy');
                break;
            case 'prev-proxy':
                free_proxy.page_workers.handleMessage('prevProxy');
                break;
            case 'toggle-proxy':
                free_proxy.page_workers.handleMessage('toogleLastProxy');
                break;
        }
    });
});