/**
 * Helper for discover page
 *
 * @class discover
 * @memberof Partup.client
 */
Partup.client.discover = {

    /**
     * Default query
     *
     * This will be used to set the default query on discover,
     * and to match against when determining whether the current query is empty.
     *
     * @memberof Partup.client.discover
     */
    DEFAULT_QUERY: {
        textSearch: undefined,
        networkId: undefined,
        locationId: undefined,
        sort: 'new'
    },

    /**
     * Cached values
     *
     * @memberof Partup.client.discover
     */
    cache: {
        partup_ids: [],
        rendered: false
    }
};
