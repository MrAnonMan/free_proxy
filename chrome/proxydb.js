'use strict';
define(function(f, g, h) {
    var j = 1;
    if (parseInt(localStorage.version, 10) !== j) {
        localStorage.clear();
        localStorage.version = j
    }
    var k = {
        "proxies": [{
            "countrycode": "RU",
            "label": "Russia",
            "ip": "185.233.82.9",
            "httpport": 9266,
            "socksport": null,
            "username": "s3Eat7",
            "password": "v0HgTc",
            "id": 1
        },

            {
                "countrycode": "RU",
                "label": "Russia",
                "ip": "185.233.83.142",
                "httpport": 9019,
                "socksport": null,
                "username": "fZbkwN",
                "password": "42U6LA",
                "id": 2
            },
            {
                "countrycode": "CA",
                "label": "Canada",
                "ip": "138.128.19.63",
                "httpport": 9279,
                "socksport": null,
                "username": "JyczVr",
                "password": "ukBXJs",
                "id": 3
            },
            {
                "countrycode": "SG",
                "label": "Singapore",
                "ip": "167.99.72.119",
                "httpport": 8080,
                "socksport": null,
                "username": "null",
                "password": "null",
                "id": 4
            },
            {
                "countrycode": "US",
                "label": "USA",
                "ip": "167.99.48.250",
                "httpport": 8080,
                "socksport": null,
                "username": "null",
                "password": "null",
                "id": 5
            },
            {
                "countrycode": "FR",
                "label": "France",
                "ip": "147.135.210.114",
                "httpport": 54566,
                "socksport": null,
                "username": "null",
                "password": "null",
                "id": 6
            }
        ]
    };
    if (localStorage.proxydb && typeof localStorage.proxydb === 'string') {
        k = JSON.parse(localStorage.proxydb) || {}
    }

    function open(a) {
        if (!k.proxies) {
            k.proxies = []
        }
        if (a) {
            a()
        }
    }

    function commit() {
        localStorage.proxydb = JSON.stringify(k)
    }

    function reindex(i) {
        var a = k.proxies.length;
        for (i = i || 0; i < a; i++) {
            k.proxies[i].id = 1 + i
        }
        commit()
    }
    g.saveProxy = function(a, b) {
        open(function() {
            if (a.id) {
                var i = a.id - 1;
                k.proxies[i] = a
            } else {
                a.id = k.proxies.length + 1;
                k.proxies.push(a)
            }
            commit();
            if (b) {
                b()
            }
        })
    };
    var l = false;
    g.importProxylist = function(a, b) {
        if (!a.length) {
            if (b) {
                b({
                    success: false
                })
            }
            return
        }
        if (l) {
            if (b) {
                b({
                    success: false
                })
            }
            return
        }
        l = true;
        var i = k.proxies.length;
        k.proxies = k.proxies.concat(a);
        reindex(i);
        l = false;
        commit();
        if (b) {
            b({
                success: true
            })
        }
    };
    g.getProxy = function(a, b) {
        a = parseInt(a, 10);
        var i = a - 1;
        open(function() {
            if (!a) {
                b({})
            } else {
                b(k.proxies[i])
            }
        })
    };
    g.getProxies = function(a) {
        open(function() {
            a(k.proxies)
        })
    };
    g.getNextPrevProxy = function(b, c) {
        b = parseInt(b, 10);
        var i = b - 1;
        open(function() {
            var a = k.proxies.length;
            if (!b) {
                c({
                    prevProxy: k.proxies[a - 1],
                    nextProxy: k.proxies[0]
                })
            } else {
                c({
                    prevProxy: k.proxies[(a + i - 1) % a],
                    nextProxy: k.proxies[(i + 1) % a]
                })
            }
        })
    };
    g.deleteProxy = function(b, c) {
        b = parseInt(b, 10);
        var i = b - 1;
        open(function() {
            var a = {};
            if (b) {
                a = k.proxies[i];
                a.id = undefined;
                k.proxies.splice(i, 1);
                reindex(i)
            }
            if (c) {
                c(a)
            }
        })
    };
    g.deleteProxies = function(c, d) {
        var e = [],
            item_len = k.proxies.length;
        k.proxies.forEach(function(a) {
            for (var b in c) {
                if (c.hasOwnProperty(b)) {
                    if ((c[b] || null) !== (a[b] || null)) {
                        e.push(a);
                        break
                    }
                }
            }
        });
        k.proxies = e;
        reindex();
        if (d) {
            d(item_len - k.proxies.length)
        }
    };
    g.deleteAll = function(a) {
        k.proxies = [];
        commit();
        if (a) {
            a()
        }
    };
    g.find = function(a, b) {
        var c, ok, len = k.proxies.length;
        for (var i = 0; i < len; i++) {
            c = k.proxies[i];
            ok = true;
            for (var d in a) {
                if (a.hasOwnProperty(d)) {
                    if ((a[d] || null) !== (c[d] || null)) {
                        ok = false;
                        break
                    }
                }
            }
            if (ok) {
                return b(c);
            }
        }
        b(a)
    }
});