'use strict';
$(function() {
    if (document.location.href.split('/').pop().split('.')[0] != 'page_export') return;
    var $checkboxes = $('input[type="checkbox"]');

    var $copybox = $('#copybox');

    $copybox.click(function() {
        $(this).select();
    });

    function getCSV() {
        var dfd = $.Deferred();
        getProxylist().then(function(proxies) {
            var csv = [],
                csvrow, glue = $('#import_export_glue').val(),
                proxies_len = proxies.length,
                proxy;
            if (glue === 'tab') {
                glue = '\t';
            }
            for (var i = 0; i < proxies_len; i += 1) {
                csvrow = [];
                proxy = proxies[i];
                if ($('#import_export_countrycode').prop('checked')) {
                    csvrow.push(proxy.countrycode);
                }
                if ($('#import_export_label').prop('checked')) {
                    csvrow.push(proxy.label);
                }
                csvrow.push(proxy.ip);

                if ($('#import_export_http_port').prop('checked')) {
                    csvrow.push(proxy.httpport);
                }
                if ($('#import_export_socks_port').prop('checked')) {
                    csvrow.push(proxy.socksport);
                }
                if ($('#import_export_username').prop('checked')) {
                    csvrow.push(proxy.username);
                }
                if ($('#import_export_password').prop('checked')) {
                    csvrow.push(proxy.password);
                }
                csv.push(csvrow.join(glue));
            }
            dfd.resolve(csv.join('\n'));
        });
        return dfd.promise();
    }

    function updateExportLink(e) {
        getCSV().then(function(csvdata) {
            if (csvdata && csvdata !== '') {
                $('#export_link').attr('href', 'data:text/plain;base64,' + utf8_to_base64(csvdata));
            } else {
                if (e) sendToast('Cannot export. Your proxy list is empty.');
                return false;
            }
        });
    }
    updateExportLink();

    function updateCSV() {
        getCSV().then(function(csvdata) {
            $copybox.text(csvdata);
        });
    }
    updateCSV();

    var $import_export_file = $('#import_export_file');
    $('#clipboard_link').click(function() {
        getCSV().then(function(csvdata) {
            copyCSV(csvdata);
        });
    });
    $('#export_link').click(updateExportLink);
    $('#import_export_proxy').change(updateCSV);

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