'use strict';
define(['exports', '/core/libs/jquery.min.js'], function(exports) {
    exports.get = function(url, extra_headers, callback) {
        $.ajax({
            url: url,
            dataType: 'json',
            headers: extra_headers || {},
            success: function(json) {
                callback({
                    json: json
                });
            },
            error: function(response) {
                callback({
                    json: response.responseJSON,
                    text: response.status + ' - ' + response.statusText
                });
            }
        });
    };

    exports.basic_auth = function(login, password) {
        if (!login) {
            console.error('Empty login');
        }
        if (!password) {
            console.error('Empty password');
        }
        return 'Basic ' + utf8_to_base64(login + ':' + password);
    };
});