define(function(require, exports, module) {
    var events = {};
    var eventsOneTime = {};

    exports.on = function(eventname, callback) {
        if (!events.hasOwnProperty(eventname)) {
            events[eventname] = [];
        }
        var idx = events[eventname].push(callback) - 1;
        return {
            remove: function() {
                delete events[eventname][idx];
            }
        };
    };

    exports.one = function(eventname, callback) {
        var handler = exports.on(eventname, function() {
            handler.remove();
            callback.apply(null, Array.prototype.slice.call(arguments));
        })
    };

    exports.trigger = function() {
        var args = Array.prototype.slice.call(arguments);
        var eventname = args.shift();
        console.log('Called event ' + eventname);
        if (events.hasOwnProperty(eventname) && events[eventname].length) {
            events[eventname].forEach(function(callback) {
                callback.apply(null, args);
            });
        }
        if (eventsOneTime.hasOwnProperty(eventname) && eventsOneTime[eventname].length) {
            eventsOneTime[eventname].forEach(function(callback) {
                callback.apply(null, args);
            });
        }
    };
});