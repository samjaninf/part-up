var _prefill = {};
var _customPrefill = {};

/**
 * Helper for discover page
 *
 * @class discover
 * @memberof Partup.client
 */
Partup.client.discover = {

    DEFAULT_QUERY: {
        textSearch: undefined,
        networkId: undefined,
        locationId: undefined,
        sort: 'popular',
        language: undefined
    },

    /*
     * Current discover query ReactiveVar
     *
     * @memberof Partup.client.discover
     *
     */
    query: new ReactiveDict(),

    /*
     * Compose query object from ReactiveDict (reactive source)
     */
    composeQueryObject: function() {
        var queryObj = {};

        for (key in this.DEFAULT_QUERY) {
            var value = this.query.get(key);
            if (!value) continue;

            queryObj[key] = value;
        }

        return queryObj;
    },

    /*
     * Reset discover query
     *
     * @memberof Partup.client.discover
     *
     */
    resetQuery: function() {
        for (key in this.DEFAULT_QUERY) {
            this.query.set(key, this.DEFAULT_QUERY[key]);
        }
    },

    /*
     * Helper to set prefill value
     */
    setPrefill: function(key, value) {
        if (!Partup.client.discover.DEFAULT_QUERY.hasOwnProperty(key)) {
            throw new Error('Discover query key "' + key + '" is not defined in Partup.client.discover.DEFAULT_QUERY');
        }

        _prefill[key] = value;
    },

    /*
     * Prefill the query with set values
     */
    prefillQuery: function() {
        for (key in this.DEFAULT_QUERY) {
            var value = _prefill[key];
            if (!value) { continue; }
            this.query.set(key, value);
        }
        _.defer(function() {
            _prefill = {};
        });
    },

    /*
     * Set custom prefill data
     */
    setCustomPrefill: function(key, value) {
        _customPrefill[key] = value;
    },

    /*
     * Get and clear custom prefill data
     */
    getCustomPrefill: function() {
        var copy = _customPrefill;
        _customPrefill = {};
        return copy;
    },

};

Partup.client.discover.resetQuery();
