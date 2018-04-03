'use strict';
define(function(require, exports, module) {
    exports.copyToClipboard = function(text) {
        var copyFrom = document.createElement('textarea');
        copyFrom.textContent = text;
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        body.removeChild(copyFrom);
    }
});