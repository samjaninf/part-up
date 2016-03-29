/**
 * Publish multiple partups for discover
 *
 * @param {Object} parameters
 * @param {string} parameters.networkId
 * @param {string} parameters.locationId
 * @param {string} parameters.sort
 * @param {string} parameters.textSearch
 * @param {number} parameters.limit
 * @param {number} parameters.skip
 * @param {string} parameters.language
 */
Meteor.routeComposite('/partups/discover', function(request, parameters) {
    check(parameters.query, {
        networkId: Match.Optional(String),
        locationId: Match.Optional(String),
        sort: Match.Optional(String),
        textSearch: Match.Optional(String),
        limit: Match.Optional(String),
        skip: Match.Optional(String),
        language: Match.Optional(String),
        userId: Match.Optional(String)
    });

    parameters = {
        networkId: parameters.query.networkId,
        locationId: parameters.query.locationId,
        sort: parameters.query.sort,
        textSearch: parameters.query.textSearch,
        limit: parameters.query.limit,
        skip: parameters.query.skip,
        userId: parameters.query.userId,
        language: (parameters.query.language === 'all') ? undefined : parameters.query.language
    };

    // If the sorting is set to recommended
    if (parameters.sort === "recommended"){
        // REST call to api , this should return a list of recommended Partup IDS
        
        // HTTP.call('GET', process.env.API_BASE_URL + '/partups/recommended/for/user/' + parameters.userId, {
        parameters.partupsIds = HTTP.call('GET', 'http://www.mocky.io/v2/56fa712f110000bc28a72181').data.partups
            
    }

    var options = {};

    if (parameters.limit) options.limit = parseInt(parameters.limit);
    if (parameters.skip) options.skip = parseInt(parameters.skip);

    return {
        find: function() {
            return Partups.findForDiscover(this.userId, options, parameters);
        },
        children: [
            {find: Images.findForPartup},
            {find: Meteor.users.findUppersForPartup, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) {
                if (!get(partup, 'featured.active')) return;
                return Meteor.users.findSinglePublicProfile(partup.featured.by_upper._id);
            }, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) { return Networks.findForPartup(partup, this.userId); }, children: [
                {find: Images.findForNetwork}
            ]}
        ]
    };
});

/**
 * Publish multiple partups by ids
 *
 * @param {[String]} partupIds
 */
Meteor.publishComposite('partups.by_ids', function(partupIds) {
    if (_.isString(partupIds)) partupIds = _.uniq(partupIds.split(','));

    check(partupIds, [String]);

    if (this.unblock) this.unblock();

    return {
        find: function() {
            return Partups.guardedFind(this.userId, {_id: {$in: partupIds}});
        },
        children: [
            {find: Images.findForPartup},
            {find: Meteor.users.findUppersForPartup, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) {
                if (!get(partup, 'featured.active')) return;
                return Meteor.users.findSinglePublicProfile(partup.featured.by_upper._id);
            }, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) { return Networks.findForPartup(partup, this.userId); }, children: [
                {find: Images.findForNetwork}
            ]}
        ]
    };
}, {url: 'partups/by_ids/:0'});

/**
 * Publish a list of partups
 */
Meteor.publish('partups.list', function() {
    this.unblock();

    return Partups.guardedFind(this.userId, {}, {_id: 1, name: 1});
});

/**
 * Publish all featured partups (superadmins only)
 */
Meteor.publishComposite('partups.featured_all', function() {
    this.unblock();

    var user = Meteor.users.findOne(this.userId);
    if (!User(user).isAdmin()) return;

    return {
        find: function() {
            return Partups.find({'featured.active': true}, {featured: 1});
        },
        children: [
            {find: function(partup) {
                return Meteor.users.findSinglePublicProfile(partup.featured.by_upper._id);
            }, children: [
                {find: Images.findForUser}
            ]}
        ]
    };
});

/**
 * Publish a random featured partup
 */
Meteor.publishComposite('partups.featured_one_random', function(language) {
    if (this.unblock) this.unblock();

    return {
        find: function() {
            var selector = {'featured.active': true};

            if (language) selector.language = language;

            var count = Partups.guardedFind(this.userId, selector).count();
            var random = Math.floor(Math.random() * count);

            return Partups.guardedFind(this.userId, selector, {limit: 1, skip: random});
        },
        children: [
            {find: Images.findForPartup},
            {find: Meteor.users.findUppersForPartup, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) {
                if (!get(partup, 'featured.active')) return;
                return Meteor.users.findSinglePublicProfile(partup.featured.by_upper._id);
            }, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) { return Networks.findForPartup(partup, this.userId); }, children: [
                {find: Images.findForNetwork}
            ]}
        ]
    };
}, {url: 'partups/featured_one_random/:0'});

/**
 * Publish partups for the homepage
 */
Meteor.publishComposite('partups.home', function(language) {
    if (this.unblock) this.unblock();

    return {
        find: function() {
            return Partups.findForDiscover(this.userId, {limit: 4}, {sort: 'popular'});
        },
        children: [
            {find: Images.findForPartup},
            {find: Meteor.users.findUppersForPartup, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) {
                if (!get(partup, 'featured.active')) return;
                return Meteor.users.findSinglePublicProfile(partup.featured.by_upper._id);
            }, children: [
                {find: Images.findForUser}
            ]},
            {find: function(partup) { return Networks.findForPartup(partup, this.userId); }, children: [
                {find: Images.findForNetwork}
            ]}
        ]
    };
}, {url: 'partups/home/:0'});

/**
 * Publish a single partup
 *
 * @param {String} partupId
 * @param {String} accessToken
 */
Meteor.publishComposite('partups.one', function(partupId, accessToken) {
    check(partupId, String);
    if (accessToken) check(accessToken, String);

    this.unblock();

    return {
        find: function() {
            return Partups.guardedMetaFind({_id: partupId}, {limit: 1});
        },
        children: [
            {
                find: function() {
                    return Partups.guardedFind(this.userId, {_id: partupId}, {limit: 1}, accessToken);
                },
                children: [
                    {find: Images.findForPartup},
                    {find: function(partup) { return Networks.findForPartup(partup, this.userId); }, children: [
                        {find: Images.findForNetwork}
                    ]},
                    {find: Meteor.users.findUppersForPartup, children: [
                        {find: Images.findForUser}
                    ]},
                    {find: Meteor.users.findSupportersForPartup, children: [
                        {find: Images.findForUser}
                    ]}
                ]
            }
        ]
    };
});
