'use strict';
$(function() {
    if (document.location.href.split('/').pop().split('.')[0] != 'page_edit_proxy') return;
    if (!options.type) return;

    function setEditFormValues(proxy) {
        if (proxy.countrycode) $('#form_country').val(proxy.countrycode || '').change();
        $('#form_label').val(proxy.label || '').change();
        $('#form_ip').val(proxy.ip || '').change();
        $('#form_http_port').val(proxy.httpport || '').change();
        $('#form_socks_port').val(proxy.socksport || '').change();
        $('#form_username').val(proxy.username || '').change();
        $('#form_password').val(proxy.password || '').change();
    }

    function getEditFormValues() {
        return {
            id: getQueryVariable('id'),
            countrycode: String($('#form_country').val()),
            label: String($('#form_label').val()),
            ip: String($('#form_ip').val()),
            httpport: parseInt($('#form_http_port').val(), 10),
            socksport: parseInt($('#form_socks_port').val(), 10),
            username: String($('#form_username').val()),
            password: String($('#form_password').val())
        };
    }
    getProxy(getQueryVariable('id')).then(setEditFormValues);

    $('#edit_proxy').submit(function() {
        saveProxy(getEditFormValues());
    });

    function country_select_format(item) {
        var value = item.element[0].value.toLowerCase();
        value = value === '' ? value = 'unknown' : value.toLowerCase();
        return '<img  src="/img/flags/' + value + '.png"/> ' + $(item.element[0]).text();
    }

    $('#form_country').select2({
        formatResult: country_select_format,
        formatSelection: country_select_format,
        escapeMarkup: function(m) {
            return m;
        }
    });
});