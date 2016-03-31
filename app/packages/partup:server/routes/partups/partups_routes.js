/*
 * Count route for /partups/discover
 * Required for endless scroll, not for recommended sorting.
 */
Router.route('/partups/discover/count', {where: 'server'}).get(function() {
    var request = this.request;
    var response = this.response;

    // We are going to respond in JSON format
    response.setHeader('Content-Type', 'application/json');

    var parameters = {
        networkId: request.query.networkId,
        locationId: request.query.locationId,
        sort: request.query.sort,
        textSearch: request.query.textSearch,
        limit: request.query.limit,
        skip: request.query.skip,
        language: (request.query.language === 'all') ? undefined : request.query.language,
    };

    console.log(parameters.sort);

    var userId = request.user ? request.user._id : null;
    var partups = Partups.findForDiscover(userId, {}, parameters);

    return response.end(JSON.stringify({error: false, count: partups.count()}));
});
