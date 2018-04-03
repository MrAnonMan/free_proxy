'use strict';
$(function() {
    if (document.location.href.split('/').pop().split('.')[0] !== 'page_proxylist') return;
    if (!options.type) return;
    var translationCache = {},
        edit_column = true;

    var $emptylistbox = $('#emptylistbox'),
        $tablebox = $('#tablebox'),
        $proxy_nav = $('#proxy_nav'),
        $emptysearchbox = $('#emptysearchbox'),
        $translations = $('#translations'),
        $searchform = $('#searchform'),
        $searchform_input = $searchform.find('input[type=search]'),
        $proxyToogle = $('.toogle-proxy');

    var grid_options = {
        enableCellNavigation: false,
        enableColumnReorder: false
    };

    var dataView = new Slick.Data.DataView();

    var grid = new Slick.Grid($tablebox, dataView, getColumns([]), grid_options);

    function getTranslation(org) {
        if (translationCache[org]) {
            return translationCache[org];
        }
        var trans = $translations.find('[data-l10n-id=' + org + ']').text();
        if (!trans || trans === '') {
            trans = org;
        }
        translationCache[org] = trans;
        return trans;
    }

    grid.onClick.subscribe(function(e, args) {
        var $target = $(e.target);
        if ($target.parents('a').length) return;
        if ($target.hasClass('actions') || $target.parents('.actions').length) return;
        var proxy = dataView.getItem(args.row);
        getCurrentProxy().then(function(current_proxy) {
            if (proxy.id === current_proxy.id) {
                disableCurrentProxy();
            } else {
                setCurrentProxy(proxy.id);
            }
        });
    });

    $tablebox.on('click', 'a.delete', function() {
        var $this = $(this);
        var id = $this.data('id');
        deleteProxy($this.data('proxyId'));
        return false;
    });

    function proxyMatches(q, proxy) {
        return (!q || q === '' ||
            proxy.id === parseInt(q, 10) ||
            proxy.id && stripos(proxy.id, q) !== false ||
            proxy.countrycode && stripos(proxy.countrycode, q) !== false ||
            proxy.countrycode && countryList[proxy.countrycode] && stripos(countryList[proxy.countrycode], q) !== false ||
            proxy.ip && strpos(proxy.ip, q) !== false ||
            proxy.label && stripos(proxy.label, q) !== false ||
            proxy.userpackage_name && stripos(proxy.userpackage_name, q) !== false
        );
    }

    function updateSearchQuery() {
        dataView.setFilterArgs({
            q: $searchform_input.val()
        });
        dataView.refresh();
        return false;
    }
    updateSearchQuery();

    dataView.setFilter(function(proxy, args) {
        return proxyMatches(args.q, proxy);
    });

    function getCellNodeWidth(row, cell) {
        var nodebox = grid.getCellNodeBox(row, cell);
        if (nodebox.width) {
            return nodebox.width;
        } else {
            return nodebox.right - nodebox.left;
        }
    }

    function getColumns(proxies) {
        var cols = [],
            viewport_width = $('html')[0].clientWidth;
        var columnum = edit_column ? 7 : 6;
        var widths = {
            id: 10 + (proxies.length ? (proxies[proxies.length - 1].id + '').length : 0) * 9,
            countrycode: 200,
            proxylabel: 160,
            proxy_ip: 118,
            edit_action: edit_column ? 56 : 0,
            delete_action: 62,
            sum: function() {
                var out = 0,
                    this2 = this;
                ['id', 'countrycode', 'proxylabel', 'proxy_ip', 'edit_action', 'delete_action'].forEach(function(field) {
                    if (this2[field]) {
                        out += this2[field];
                    }
                });
                return out + 17;
            }
        };
        if (proxies.length) {
            var amount = viewport_width - widths.sum();
            while (amount < 0) {
                if (widths.delete_action > 28 || widths.edit_action > 28) {
                    if (widths.delete_action > 28) {
                        widths.delete_action = 28;
                    }
                    if (widths.edit_action > 28) {
                        widths.edit_action = 28;
                    }
                } else if (widths.countrycode > 28) {
                    widths.countrycode = 28;
                } else if (widths.proxylabel > 80) {
                    widths.proxylabel = 80;
                } else if (widths.id > 0) {
                    widths.id = 0;
                } else if (widths.proxylabel > 30) {
                    widths.proxylabel--;
                } else if (widths.proxylabel > 0) {
                    widths.proxylabel = 0;
                } else if (widths.countrycode > 0) {
                    widths.countrycode = 0;
                } else if (widths.edit_action > 0) {
                    widths.edit_action = 0;
                } else if (widths.delete_action > 0) {
                    widths.delete_action = 0;
                } else if (widths.proxy_ip > 0) {
                    widths.proxy_ip--;
                } else {
                    amount = viewport_width - widths.sum();
                    console.error('amounterror', amount);
                    break;
                }
                amount = viewport_width - widths.sum();
            }
            if (amount > 0) {
                var colnum = 0;
                if (widths.proxylabel) {
                    colnum++;
                    if (amount <= 100) {
                        widths.proxylabel += amount;
                    } else {
                        widths.proxylabel += 100;
                        amount -= 100;
                    }
                }
                if (widths.countrycode) {
                    colnum++;
                }
                var bonus = Math.floor(amount / colnum);
                if (widths.countrycode) {
                    widths.countrycode += bonus;
                    amount -= bonus;
                }
                if (widths.proxylabel) {
                    widths.proxylabel += bonus;
                    amount -= bonus;
                }
                if (widths.proxylabel) {
                    widths.proxylabel += amount;
                } else if (widths.countrycode) {
                    widths.countrycode += amount;
                } else if (widths.proxy_ip) {
                    widths.proxy_ip += amount;
                }
            }
        }
        if (widths.id) {
            cols.push({
                id: 'id',
                name: 'ID',
                field: 'id',
                cssClass: 'idx',
                sortable: true,
                maxWidth: widths.id
            });
        }
        if (widths.countrycode) {
            cols.push({
                id: 'country',
                name: getTranslation('country'),
                field: 'countrycode',
                cssClass: 'countrycode',
                sortable: true,
                minWidth: 28,
                maxWidth: Math.max(200, widths.countrycode),
                width: widths.countrycode,
                formatter: function(row, cell, value, columnDef, proxy) {
                    var out = '',
                        countryname;
                    if (value && (countryname = countryList[value])) {
                        out += '<img class="flag" src="/img/flags/' + value.toLowerCase() + '.png" title="' + countryname + '">';
                        if (getCellNodeWidth(row, cell) > 60) {
                            out += '<span class="countryname">' + countryList[value] + '</span>';
                        }
                    } else {
                        out += '<img class="flag" src="/img/flags/unknown.png">';
                        if (getCellNodeWidth(row, cell) > 60) {
                            out += '<span class="countryname">' + getTranslation('unknown') + '</span>';
                        }
                    }
                    return out;
                },
                rerenderOnResize: true
            });
        }
        if (widths.proxylabel) {
            cols.push({
                id: 'proxylabel',
                name: getTranslation('proxylabel'),
                field: 'label',
                cssClass: 'proxylabel',
                sortable: true,
                width: widths.proxylabel
            });
        }

        cols.push({
            id: 'proxy_ip',
            name: getTranslation('proxy_ip'),
            field: 'ip',
            cssClass: 'ip',
            sortable: true,
            minWidth: Math.min(118, widths.proxy_ip),
            maxWidth: Math.max(118, widths.proxy_ip),
            width: widths.proxy_ip
        });
        if (edit_column && widths.edit_action) {
            cols.push({
                cssClass: 'actions',
                formatter: function(row, cell, value, columnDef, proxy) {
                    var out = '';
                    if (!proxy.freeproxy) {
                        out += '<a class="btn btn-default btn-small edit_proxy" href="/html/page_edit_proxy.html?id=' + proxy.id + '">';
                        if (getCellNodeWidth(row, cell) >= 52) {
                            out += '<span data-l10n-id="edit">' + getTranslation('edit') + '</span>';
                        } else {
                            out += '<span class="glyphicon glyphicon-edit" aria-hidden="true"></span>';
                        }
                        out += '</a>';
                    }
                    return out;
                },
                rerenderOnResize: true,
                minWidth: 32,
                maxWidth: 56,
                width: widths.edit_action
            });
        }
        if (widths.delete_action) {
            cols.push({
                cssClass: 'actions',
                formatter: function(row, cell, value, columnDef, proxy) {
                    var out = '';
                    out += '<a class="btn btn-default btn-small delete" data-proxy-id="' + proxy.id + '" href="#">';
                    if (getCellNodeWidth(row, cell) >= 58) {
                        out += '<span data-l10n-id="remove">' + getTranslation('remove') + '</span>';
                    } else {
                        out += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>';
                    }
                    out += '</a>';
                    return out;
                },
                rerenderOnResize: true,
                minWidth: 32,
                maxWidth: 62,
                width: widths.delete_action
            });
        }
        return cols;
    }

    function updateCurrentProxy() {
        return getCurrentProxy().then(function(current_proxy) {
            dataView.getItemMetadata = function(row) {
                var proxy = this.getItem(row);
                return {
                    'cssClasses': current_proxy.id && proxy.id === current_proxy.id ? 'tr selected' : 'tr'
                };
            };
            if (current_proxy.ip) {
                $proxy_nav.addClass('proxyEnabled').removeClass('proxyDisabled');
                $proxyToogle.addClass('btn-danger').removeClass('btn-success');
            } else {
                $proxy_nav.addClass('proxyDisabled').removeClass('proxyEnabled');
                $proxyToogle.addClass('btn-success').removeClass('btn-danger');
            }
            return current_proxy;
        });
    }

    function refreshProxylist() {
        return getProxylist().then(function(proxies) {
            grid.setColumns(getColumns(proxies));
            setTimeout(function() {
                var viewport = $('.slick-viewport')[0];
                if (viewport.scrollWidth != viewport.clientWidth) {
                    grid.setColumns(getColumns(proxies));
                }
            }, 10);
            grid.autosizeColumns();
        });
    }

    function loadProxylist() {
        return Promise.all([getProxylist(), updateCurrentProxy()]).then(function(results) {
            var proxies = results[0],
                current_proxy = results[1];
            edit_column = false;
            for (var i = proxies.length - 1; i >= 0; i--) {
                if (!proxies[i].freeproxy) {
                    edit_column = true;
                    break;
                }
            }
            dataView.setItems(proxies);
            if (proxies.length) {
                $tablebox.show();
                $emptylistbox.hide();
                $proxy_nav.show();
            } else {
                $tablebox.hide();
                $emptylistbox.show();
                $proxy_nav.hide();
            }
        });
    }

    function scrollToCurrentProxy() {
        return updateCurrentProxy().then(function(current_proxy) {
            if (current_proxy.id) {
                grid.scrollRowIntoView(current_proxy.id);
            }
        });
    }

    function reloadProxylist() {
        return loadProxylist().then(refreshProxylist).then(scrollToCurrentProxy);
    }

    $searchform_input.on('input', updateSearchQuery);
    $searchform_input.change(updateSearchQuery);
    $searchform.submit(updateSearchQuery);

    $('.prev-proxy').click(function() {
        prevProxy();
        return false;
    });

    $('.next-proxy').click(function() {
        nextProxy();
        return false;
    });

    $proxyToogle.click(function() {
        toogleLastProxy();
        return false;
    });

    dataView.onRowCountChanged.subscribe(function(e, args) {
        grid.updateRowCount();
        getProxylist().then(function(proxies) {
            if (proxies.length) {
                $emptylistbox.hide();
                if (args.current > 0) {
                    $tablebox.show();
                    $emptysearchbox.hide();
                } else {
                    $tablebox.hide();
                    $emptysearchbox.show();
                }
                if (args.current === proxies.length) {
                    $proxy_nav.show();
                } else {
                    $proxy_nav.hide();
                }
            } else {
                $tablebox.hide();
                $emptysearchbox.hide();
                $emptylistbox.show();
                $proxy_nav.hide();
            }
        });
    });

    dataView.onRowsChanged.subscribe(function(e, args) {
        grid.invalidateRows(args.rows);
        refreshProxylist();
    });

    events.on('current_proxy_changed', function() {
        updateCurrentProxy().then(refreshProxylist).then(scrollToCurrentProxy);
    });

    events.on('proxylist_changed', reloadProxylist);

    $(window).resize(refreshProxylist);

    updateCurrentProxy().then(reloadProxylist);
});