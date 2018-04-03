'use strict';
$(function() {
    if (document.location.href.split('/').pop().split('.')[0] != 'page_proxylist_delete') return;
    if (!options.type) return;

    $('#clearAll').click(deleteAllProxies);
});