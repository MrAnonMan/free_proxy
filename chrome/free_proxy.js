'use strict';
define(
    [
        'exports',
        'module',
        './preferences.js',
        './proxydb.js',
        './current_proxy.js',
        './notify.js',
        './clipboard.js',
        './i18n.js',
        './page_workers.js',
        './events.js'
    ],
    function(
        exports,
        module,
        preferences,
        proxydb,
        current_proxy,
        notification,
        clipboard,
        i18n,
        page_workers,
        events
    ) {
        const notify = notification.notify;
        const copyToClipboard = clipboard.copyToClipboard;
        const _ = i18n._;
        const __ = i18n.__;

        var current_proxy_cached, proxylist_cached;

        exports.page_workers = page_workers;
        exports.preferences = preferences;


        exports.toast = function(txt) {
            if (preferences.prefs.notifications) {
                notification.toast(txt);
            }
        };

        exports.notify = function(text, calbackFun, callbackObj) {
            if (preferences.prefs.notifications) {
                notify(text, calbackFun, callbackObj);
            }
        };

        exports.notifyError = function(txt) {
            notification.toast(txt);
        };

        exports.refreshAllTabs = function() {
            browser.windows.getAll({}, function(windows) {
                for (var i = windows.length - 1; i >= 0; i -= 1) {
                    var cur_window = windows[i];
                    browser.tabs.getAllInWindow(cur_window.id, function(tabs) {
                        for (var j = tabs.length - 1; j >= 0; j -= 1) {
                            var protocol = tabs[j].url.split(':')[0];
                            if (protocol !== 'http' || protocol !== 'https' || protocol !== 'ftp') continue;
                            browser.tabs.reload(tabs[j].id, {
                                bypassCache: true
                            });
                        }
                    });
                }
            });
        };

        function getPrivateBrowsingState() {
            var dfd = $.Deferred();
            browser.windows.getAll({}, function(windows) {
                var finished = 0,
                    incognito = false;
                for (var i = windows.length - 1; i >= 0; i -= 1) {
                    var cur_window = windows[i];
                    browser.tabs.getAllInWindow(cur_window.id, function(tabs) {
                        if (!incognito) {
                            for (var j = tabs.length - 1; j >= 0; j -= 1) {
                                if (tabs[j].incognito) {
                                    incognito = true;
                                    dfd.resolve(true);
                                    break;
                                }
                            }
                        }
                        finished++;
                        if (finished === windows.length && !incognito) {
                            dfd.resolve(false);
                        }
                    });
                }
            });
            return dfd.promise();
        }

        function trigger(type) {
            if (!type || type === '') {
                console.error('Invalid type', type);
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            page_workers.trigger.apply(null, args);
            args[0] = 'free_proxy__' + type;
            events.trigger.apply(null, args);
        }

        exports.showProxylist = function() {
            browser.tabs.create({
                'url': 'html/page_proxylist.html',
                'active': true
            }, function() {});
        };

        exports.getCurrentProxy = function() {
            var dfd = $.Deferred();
            current_proxy.get(function(proxyObj) {
                var ip = proxyObj.proxy_http_ip || proxyObj.proxy_socks_ip || undefined;
                if (!ip) {
                    dfd.resolve({});
                } else {
                    if (current_proxy_cached && current_proxy_cached.ip === ip) {
                        dfd.resolve(current_proxy_cached);
                    } else {
                        if (proxyObj.proxy_socks_port) {
                            proxydb.find({
                                ip: ip,
                                socksport: proxyObj.proxy_socks_port || undefined
                            }, function(proxy) {
                                current_proxy_cached = proxy;
                                dfd.resolve(proxy);
                            });
                        } else if (proxyObj.proxy_http_port) {
                            proxydb.find({
                                ip: ip,
                                httpport: proxyObj.proxy_http_port || undefined,
                            }, function(proxy) {
                                current_proxy_cached = proxy;
                                dfd.resolve(proxy);
                            });
                        } else {
                            dfd.resolve({});
                        }

                    }
                }
            });
            return dfd.promise();
        };

        exports.getProxylist = function() {
            var dfd = $.Deferred();
            proxydb.getProxies(function(proxies) {
                dfd.resolve(proxies);
            });

            return dfd.promise();
        };

        exports.disableProxy = function() {
            var dfd = $.Deferred();
            current_proxy.disable();
            dfd.resolve();
            return dfd.promise();
        };

        exports.toogleLastProxy = function() {
            current_proxy.get(function(proxyObj) {
                var ip = proxyObj.proxy_http_ip || proxyObj.proxy_socks_ip || undefined;
                if (ip) {
                    exports.disableProxy();
                } else {
                    var lastProxy = current_proxy.getLastEnabledProxy();
                    if (lastProxy.ip) {
                        current_proxy.set(lastProxy);
                    } else {
                        proxydb.getNextPrevProxy(null, function(result) {
                            if (result.nextProxy) {
                                current_proxy.set(result.nextProxy);
                            } else {
                                exports.toast(_('message_proxylist_is_empty', 'Список прокси-серверов пуст. Пожалуйста, добавьте некоторые прокси-серверы.'));
                            }
                        });
                    }
                }
            });
        };

        exports.setPrevProxy = function() {
            exports.getCurrentProxy().then(function(proxy) {
                proxydb.getNextPrevProxy(proxy.id, function(result) {
                    if (result.prevProxy) {
                        current_proxy.set(result.prevProxy);
                    } else {
                        exports.toast(_('message_proxylist_is_empty', 'Список прокси-серверов пуст. Пожалуйста, добавьте некоторые прокси-серверы.'));
                    }
                });
            });

        };

        exports.setNextProxy = function() {
            exports.getCurrentProxy().then(function(proxy) {
                proxydb.getNextPrevProxy(proxy.id, function(result) {
                    if (result.nextProxy) {
                        current_proxy.set(result.nextProxy);

                    } else {
                        exports.toast(_('message_proxylist_is_empty', 'Список прокси-серверов пуст. Пожалуйста, добавьте некоторые прокси-серверы.'));
                    }
                });
            });
        };

        preferences.on('beforeChange', function(key, valueOld, valueNew) {
            if (key === 'apiKey') {
                var auth_token = preferences.prefs.apiKey;
                proxy - manager.ru_api.unauthenticate(auth_token);
            }
        });

        preferences.on('change', function() {
            trigger('preferences_changed', preferences.prefs);
        });

        current_proxy.on('external_change', function() {
            exports.getCurrentProxy().then(function(proxy) {
                exports.notifyError(_('message_external_change_detected', 'Proxy настроен и активирован.'));
                trigger('current_proxy_changed_external', proxy);
                trigger('current_proxy_changed', proxy);
            });
        });

        current_proxy.on('change', function() {
            if (preferences.prefs.autoRefresh) exports.refreshAllTabs();
            exports.getCurrentProxy().then(function(proxy) {
                exports.notify(_('message_changed_proxy_to_xx', 'Успешно подключено', proxy.ip));
                trigger('current_proxy_changed', proxy);
            });
        });

        current_proxy.on('disabled', function() {
            if (preferences.prefs.autoRefresh) exports.refreshAllTabs();
            exports.notify(_('message_proxy_disabled', 'Proxy отключен'));
            trigger('current_proxy_changed', {});
        });

        page_workers.on('getPreferences', function() {
            trigger('current_preferences', preferences.prefs);
        });

        page_workers.on('setPreference', preferences.set);

        page_workers.on('getProxylist', function() {
            proxydb.getProxies(function(proxies) {
                proxylist_cached = proxies;
                trigger('current_proxylist', proxies);
            });
        });

        page_workers.on('getProxy', function(id) {
            proxydb.getProxy(id, function(proxy) {
                trigger('proxy_' + id, proxy);
            });
        });

        page_workers.on('saveProxy', function(proxy) {
            proxydb.saveProxy(proxy, function() {
                proxydb.getProxies(function(proxies) {
                    proxylist_cached = proxies;
                    trigger('proxylist_changed', proxies);
                });
            });
        });

        page_workers.on('saveProxies', function(proxylist) {
            proxydb.importProxylist(proxylist, function(import_result) {
                if (import_result.success) {
                    proxydb.getProxies(function(proxies) {
                        proxylist_cached = proxies;
                        trigger('proxylist_import_finished', {
                            success: true
                        });
                        trigger('proxylist_changed', proxies);
                        exports.notify(_('message_imported_xx_proxies', 'Imported %s proxies', proxies.length));
                    });
                } else {
                    trigger('proxylist_import_finished', {
                        success: false
                    });
                }
            });
        });

        page_workers.on('deleteProxy', function(id) {
            proxydb.deleteProxy(id, function(deleted_proxy) {
                exports.getCurrentProxy().then(function(proxy) {
                    if (deleted_proxy.ip === proxy.ip) {
                        current_proxy.once('disabled', function() {
                            proxydb.getProxies(function(proxies) {
                                proxylist_cached = proxies;
                                trigger('proxylist_changed', proxies);
                            });
                        });
                        current_proxy.disable();
                    } else {
                        proxydb.getProxies(function(proxies) {
                            proxylist_cached = proxies;
                            trigger('proxylist_changed', proxies);
                        });
                    }
                });

            });
        });

        page_workers.on('deleteAllProxies', function() {
            proxydb.deleteAll(function(result) {
                current_proxy.disable();
                proxydb.getProxies(function(proxies) {
                    proxylist_cached = proxies;
                    trigger('proxylist_changed', proxies);
                });
            });
        });

        page_workers.on('importFromproxy-manager.ru', function(auth_token) {
            getPrivateBrowsingState().done(function(private_browsing) {
                if (private_browsing) {
                    exports.toast(_('message_not_available_during_private_browsing', 'Communication with api.proxy-manager.ru.com might expose your identity. In order to help protect your privacy, this feature is not available during the private browsing mode.'));
                    trigger('proxylist_import_finished', {
                        success: false
                    });
                } else {
                    proxy - manager.ru_api.getProxylist(
                        auth_token,
                        function(proxylist) {
                            if (proxylist.length) {
                                proxydb.importProxylist(
                                    proxylist,
                                    function(import_result) {
                                        if (import_result.success) {
                                            proxydb.getProxies(
                                                function(proxies) {
                                                    proxylist_cached = proxies;
                                                    trigger('proxylist_import_finished', {
                                                        success: true
                                                    });
                                                    trigger('proxylist_changed', proxies);
                                                    exports.notify(_('message_imported_xx_proxies', 'Imported %s proxies', proxies.length));
                                                }
                                            );
                                        } else {
                                            trigger('proxylist_import_finished', {
                                                success: false
                                            });
                                        }
                                    }
                                );
                            } else {
                                exports.notify(_('message_userpackage_no_proxies', 'This userpackage has no proxies to import'));
                                trigger('proxylist_import_finished', {
                                    success: false
                                });
                            }
                        },
                        function(progress) {
                            exports.toast(__(progress));
                        },
                        function(error) {
                            exports.notifyError(error);
                            trigger('proxylist_import_finished', {
                                success: false
                            });
                        }
                    );
                }
            });
        });

        page_workers.on('importUserpackage', function(id) {
            getPrivateBrowsingState().done(function(private_browsing) {
                if (private_browsing) {
                    exports.toast(_('message_not_available_during_private_browsing', 'Communication with api.proxy-manager.ru.com might expose your identity. In order to help protect your privacy, this feature is not available during the private browsing mode.'));
                    trigger('proxylist_import_finished', {
                        success: false
                    });
                } else {
                    if (id > 0) {
                        var auth_token = preferences.prefs.apiKey;
                        if (auth_token.match(/[A-Za-z0-9]{50}[!][0-9]+/)) {
                            proxy - manager.ru_api.getUserpackageProxylist(
                                id,
                                auth_token,
                                function(proxylist) {
                                    if (proxylist.length) {
                                        proxydb.deleteProxies({
                                            userpackage_id: id
                                        }, function(deleted_num) {
                                            proxydb.importProxylist(proxylist, function(import_result) {
                                                if (import_result.success) {
                                                    proxydb.getProxies(function(proxies) {
                                                        proxylist_cached = proxies;
                                                        exports.notify(_('message_imported_xx_proxies', 'Imported %s proxies', proxies.length));
                                                        trigger('userpackage_import_finished', true);
                                                        trigger('proxylist_changed', proxies);
                                                    });
                                                } else {
                                                    exports.notify(_('message_another_import_operation', 'Another import operation in progress'));
                                                    trigger('userpackage_import_finished', false);
                                                }
                                            });

                                        });
                                    } else {
                                        exports.notify(_('message_userpackage_no_proxies', 'This userpackage has no proxies to import'));
                                        trigger('proxylist_import_finished', {
                                            success: false
                                        });
                                    }
                                },
                                function(error) {
                                    exports.notifyError(error);
                                    trigger('userpackage_import_finished', false);
                                }
                            );
                        } else {
                            exports.toast(_('message_invalid_api_key', 'Missing or invalid proxy-manager.ru api key'));
                            trigger('userpackage_import_finished', false);
                        }
                    } else {
                        exports.notify(_('message_invalid_userpackage_id', 'Invalid userpackage id'));
                        trigger('userpackage_import_finished', false);
                    }
                }
            });
        });

        page_workers.on('getUserpackages', function() {
            getPrivateBrowsingState().done(function(private_browsing) {
                if (private_browsing) {
                    var msg = _('message_not_available_during_private_browsing', 'успех.');
                    exports.toast(msg);
                    trigger('current_userpackages', false, msg);
                } else {
                    var auth_token = preferences.prefs.apiKey;
                    if (auth_token.match(/[A-Za-z0-9]{50}[!][0-9]+/)) {
                        proxy - manager.ru_api.unauthenticate(auth_token, function() {
                            proxy - manager.ru_api.getUserpackages(
                                auth_token,
                                function(userpackages) {
                                    trigger('current_userpackages', userpackages);
                                },
                                function(error) {
                                    exports.notifyError(error);
                                    trigger('current_userpackages', false, error);
                                }
                            );
                        });
                    } else {
                        exports.toast(_('message_invalid_api_key', 'Missing or invalid proxy-manager.ru api key'));
                        trigger('current_userpackages', false, false);
                    }
                }
            });
        });


        page_workers.on('getCurrentProxy', function() {
            exports.getCurrentProxy().then(function(proxy) {
                trigger('current_proxy', proxy);
            });
        });

        page_workers.on('setCurrentProxy', function(id) {
            if (id) {
                proxydb.getProxy(id, function(proxy) {
                    current_proxy.set(proxy);
                });
            } else {
                current_proxy.disable();
            }
        });

        page_workers.on('toogleLastProxy', exports.toogleLastProxy);

        page_workers.on('prevProxy', exports.setPrevProxy);

        page_workers.on('nextProxy', exports.setNextProxy);

        page_workers.on('notify', exports.notify);

        page_workers.on('toast', exports.toast);

        page_workers.on('notifyError', exports.notifyError);

        page_workers.on('copyCSV', function(csvdata) {
            if (csvdata && csvdata !== '') {
                copyToClipboard(csvdata);
                exports.toast(_('message_copy_csv', 'Your proxy list has been copied to clipboard'));
            } else {
                exports.toast(_('message_copy_csv_empty', 'Cannot copy. Your proxy list is empty.'));
            }
        });

        page_workers.on('proxy-manager.ru_com_current_api_key', function(api_key) {
            if (api_key) {
                if (!preferences.prefs.apiKey || preferences.prefs.apiKey == '') {
                    preferences.set('apiKey', api_key);
                    exports.toast(_('message_import_proxy-manager.ru_com_api_key_done', 'Successfully imported API KEY from proxybonaza.com'));
                } else if (preferences.prefs.apiKey != api_key) {}
            } else {
                exports.toast(_('message_import_proxy-manager.ru_com_api_key_fail', 'Failed to import API KEY from proxybonaza.com'));
            }
        });

        exports.requestApiKeyUpdate = function() {
            exports.toast(_('message_import_proxy-manager.ru_com_api_key', 'Requesting API KEY from proxybonaza.com'));
            page_workers.trigger('get_api_key_from_proxy-manager.ru_com');
        };

        page_workers.one('proxy-manager.ru_com_logged_in', function() {
            if (!preferences.prefs.apiKey || preferences.prefs.apiKey == '') {
                exports.requestApiKeyUpdate();
            }
        });

        exports.on = function(type) {
            if (!type || type === '') {
                console.error('Invalid type', type);
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            args[0] = 'free_proxy__' + type;
            events.on.apply(null, args)
        };
    });