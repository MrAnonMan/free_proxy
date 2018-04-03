'use strict';
function utf8_to_base64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function base64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function escapeHtml(unsafe) {
	if(!unsafe) return unsafe;
	return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&quot;').replace(/'/g, '&#039;');
}

function strpos(haystack, needle, offset) {
	var i = (haystack + '').indexOf(needle, (offset || 0));
	return i === -1 ? false : i;
}

function stripos(haystack, needle, offset) {
	return strpos((haystack+'').toLowerCase(), (needle+'').toLowerCase(), offset);
}


function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) === variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	return undefined;
}

function isEquivalent(a, b) {
	var aProps = Object.getOwnPropertyNames(a);
	var bProps = Object.getOwnPropertyNames(b);

	if (aProps.length != bProps.length) {
		return false;
	}

	for (var i = 0; i < aProps.length; i++) {
		var propName = aProps[i];

		if (a[propName] !== b[propName]) {
			return false;
		}
	}
	return true;
}