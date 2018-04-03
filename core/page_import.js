'use strict';
$(function() {
    if (document.location.href.split('/').pop().split('.')[0] != 'page_import') return;

    var $pastebox = $('#pastebox'),
        $import_export_file = $('#import_export_file'),
        $checkboxes = $('input[type="checkbox"]');

    $pastebox.click(function() {
        $(this).select();
    });

    function getCsvFields() {
        var fields = [];
        if ($('#import_export_countrycode').prop('checked')) {
            fields.push('countrycode');
        }
        if ($('#import_export_label').prop('checked')) {
            fields.push('label');
        }
        fields.push('ip');
        if ($('#import_export_http_port').prop('checked')) {
            fields.push('httpport');
        }
        if ($('#import_export_socks_port').prop('checked')) {
            fields.push('socksport');
        }
        if ($('#import_export_username').prop('checked')) {
            fields.push('username');
        }
        if ($('#import_export_password').prop('checked')) {
            fields.push('password');
        }
        return fields;
    }

    function getGlue() {
        var glue = $('#import_export_glue').val();
        if (glue === 'tab') {
            glue = '\t';
        }
        return glue;
    }


    function csvToArray(csv, fields, glue) {
        var fieldnum = fields.length,
            proxies = [];
        csv.split('\n').forEach(function(csvline) {
            var values = csvline.split(glue);
            if (values.length === fieldnum) {
                var proxy_obj = {};
                for (var j = 0; j < fieldnum; j += 1) {
                    proxy_obj[fields[j]] = values[j];
                }
                proxies.push(proxy_obj);
            }
        });
        return proxies;
    }

    function validateProxies(proxies) {
        var validProxies = [];
        proxies.forEach(function(proxy) {
            if (proxy.countrycode && proxy.countrycode !== '' && !countryList[proxy.countrycode]) {
                return false;
            }
            if (!(proxy.ip + '').match(/((^|\.)((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]?\d))){4}$/)) {
                return false;
            }
            if (proxy.httpport && proxy.httpport !== '' && !(proxy.httpport + '').match(/[1-9][0-9]*/)) {
                return false;
            }
            proxy.httpport = parseInt(proxy.httpport, 10) || undefined;
            if (proxy.socksport && proxy.socksport !== '' && !(proxy.socksport + '').match(/[1-9][0-9]*/)) {
                return false;
            }
            proxy.socksport = parseInt(proxy.socksport, 10) || undefined;
            if (!proxy.httpport && !proxy.socksport) {
                return false;
            }
            validProxies.push(proxy);
        });
        return validProxies;
    }

    function parseCSV(csv, fields, glue) {
        var proxies = csvToArray(csv, fields, glue);
        var validProxies = validateProxies(proxies);
        return saveProxies(validProxies);
    }

    $('#import_link').click(function(e) {
        parseCSV($pastebox.val(), getCsvFields(), getGlue());
    });

    function readFile(file) {
        var dfd = $.Deferred();
        var fReader = new FileReader();
        fReader.onload = function(e) {
            dfd.resolve(e.target.result);
        };
        fReader.readAsText(file);
        return dfd.promise();
    }

    function checkboxStateSave() {
        var check_state = {};
        $checkboxes.each(function(idx, input) {
            if (!input.disabled) {
                check_state[input.id] = input.checked;
            }
        });
        localStorage.setItem('importExportCheckboxState', JSON.stringify(check_state));
    }

    function checkboxStateLoad() {
        var check_state = JSON.parse(localStorage.getItem('importExportCheckboxState')) || {};
        $.each(check_state, function(id, checked) {
            $('#' + id).prop('checked', checked);
        });
    }
    checkboxStateLoad();
    $checkboxes.change(checkboxStateSave);
});