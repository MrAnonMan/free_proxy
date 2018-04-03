'use strict';
if (!window.browser && window.chrome) {
    window.browser = window.chrome;
}
if (window.browser && window.browser.runtime && window.browser.runtime.id) {
    options.type = 'chrome';

    window.sendMessage = function() {
        var args = Array.prototype.slice.call(arguments);
        browser.runtime.sendMessage(args);
    };

    var i18n_get = function(id) {
        if (!id || id == '') {
            console.log('Invalid i18n call: ' + id);
            return false;
        }
        var translated = browser.i18n.getMessage(id);
        if (!translated) {
            console.log('Invalid i18n call: ' + id);
            return id;
        }
        if (translated === '') {
            console.log('Invalid i18n: ' + id);
            return id;
        }
        return translated;
    };


    var translate = function(items) {
        if (!items) {
            items = $('[data-l10n-id]');
        }
        var id, translated, orginal;
        $(items).each(function(idx, el) {
            var $el = $(el);
            if ($el.attr('data-l10n-id')) {
                orginal = $el.text();
                id = $el.attr('data-l10n-id');
                translated = i18n_get(id);
                if (translated && translated !== orginal) {
                    $el.text(translated);
                }
                if (orginal = $el.attr('placeholder')) {
                    translated = i18n_get(id + '__placeholder');
                    if (translated && translated !== orginal) {
                        $el.attr('placeholder', translated);
                    }

                }
            } else {
                var $find = $el.find('[data-l10n-id]');
                if ($find.length) {
                    translate($find);
                }
            }
        });
    };

    translate();


    var $html = $('html');
    $html.addClass('chrome');
    if ($html.width() > 600) {
        $('#open_in_new_window').hide();
    }
}