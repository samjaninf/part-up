var _now = new ReactiveVar(new Date());
Meteor.setInterval(function() {
    _now.set(new Date());
}, 1000);

/**
 * Current date (reactive)
 *
 * @class reactiveDate
 * @memberof Partup.client
 */
Partup.client.reactiveDate = function() {
    return _now.get();
};
