Template.modal_network_invite.onCreated(function() {
    var template = this;
    var userId = Meteor.userId();
    var networkSlug = template.data.networkSlug;
    var currentQuery = '';
    template.userIds = new ReactiveVar([]);
    template.loading = new ReactiveVar(true);

    template.states = {
        loading_infinite_scroll: false,
        paging_end_reached: new ReactiveVar(false)
    };

    var PAGING_INCREMENT = 10;
    template.searchQuery = new ReactiveVar(undefined, function(prevQuery, query) {
        currentQuery = query;
        if (prevQuery !== query) {
            template.userIds.set([]);
            template.states.paging_end_reached.set(false);
            template.states.loading_infinite_scroll = false;
            _.defer(function() { template.page.set(0); });
        }
    });

    template.subscribe('networks.one', networkSlug, function() {
        var network = Networks.findOne({slug: networkSlug});
        if (!network || network.isClosedForUpper(userId)) {
            Router.pageNotFound();
        }
    });

    // Submit filter form
    template.submitFilterForm = function() {
        Meteor.defer(function() {
            var form = template.find('form#suggestionsQuery');
            $(form).submit();
        });
    };

    template.page = new ReactiveVar(false, function(previousPage, page) {
        var query = template.searchQuery.get() || '';
        var options = {
            query: query,
            limit: PAGING_INCREMENT,
            skip: page * PAGING_INCREMENT
        };
        template.loading.set(true);
        // this meteor call still needs to be created
        Meteor.call('networks.user_suggestions', networkSlug, options, function(error, userIds) {
            if (query !== currentQuery) return;
            template.loading.set(false);
            if (error) {
                return Partup.client.notify.error(TAPi18n.__('base-errors-' + error.reason));
            }
            if (!userIds || userIds.length === 0) {
                template.states.loading_infinite_scroll = false;
                template.states.paging_end_reached.set(true);
                return;
            }

            template.states.paging_end_reached.set(userIds.length < PAGING_INCREMENT);

            var existingUserIds = template.userIds.get();
            var newUserIds = existingUserIds.concat(userIds);
            template.userIds.set(newUserIds);

            template.states.loading_infinite_scroll = false;
        });
    });
    template.page.set(0);
});

Template.modal_invite_to_partup.onRendered(function() {
    var template = this;
    Partup.client.scroll.infinite({
        template: template,
        element: template.find('[data-infinitescroll-container]'),
        offset: 800
    }, function() {
        if (template.states.loading_infinite_scroll || template.states.paging_end_reached.curValue) { return; }
        template.page.set(template.page.get() + 1);
    });
});

Template.modal_network_invite.helpers({
    data: function() {
        var template = Template.instance();
        return {
            suggestionIds: function() {
                return template.userIds.get();
            },
            textsearch: function() {
                return template.searchQuery.get() || '';
            },
            networkSlug: function() {
                return template.data.networkSlug;
            },
            network: function() {
                return Networks.findOne({slug: template.data.networkSlug});
            }
        };
    },
    state: function() {
        var template = Template.instance();
        return {
            loading: function() {
                return template.loading.get();
            }
        };
    }
});

Template.modal_network_invite.events({
    'click [data-closepage]': function(event, template) {
        event.preventDefault();

        var network = Networks.findOne({slug: template.data.networkSlug});

        Intent.return('network', {
            fallback_route: {
                name: 'network',
                params: {
                    slug: network.slug
                }
            }
        });
    },

    'submit form#suggestionsQuery': function(event, template) {
        event.preventDefault();
        var form = event.currentTarget;
        template.searchQuery.set(form.elements.search_query.value);
    },
    'click [data-reset-search-query-input]': function(event, template) {
        event.preventDefault();
        $('[data-search-query-input]').val('');
        template.submitFilterForm();
    },
    'keyup [data-search-query-input]': function(e, template) {
        template.submitFilterForm();
    }
});
