Template.app_network.onCreated(function() {
    var template = this;
    var networkSlug = template.data.networkSlug;
    template.networkSlug = new ReactiveVar(networkSlug);
    template.networkLoaded = new ReactiveVar(false);
    template.autorun(function() {
        var data = Template.currentData();
        var slug = data.networkSlug;

        template.networkSlug.set(slug);
        if (template.networkSubscription) template.networkSubscription.stop();
        template.networkLoaded.set(false);
        template.networkSubscription = template.subscribe('networks.one', slug, {
            onReady: function() {
                var network = Networks.findOne({slug: slug});
                if (!network) Router.pageNotFound('network');
                template.networkLoaded.set(true);
            }
        });

    });
});

/*************************************************************/
/* Page helpers */
/*************************************************************/
Template.app_network.helpers({
    data: function() {
        var template = Template.instance();

        var networkSlug = template.networkSlug.get();
        if (!networkSlug) return false;

        var network = Networks.findOne({slug: networkSlug});
        if (!network) return false;

        return {
            network: function() {
                return network;
            },
            unreadChatMessages: function() {
                if (!network.chat_id) return false;
                var chat = Chats.findOne({_id: network.chat_id});
                if (!chat) return false;
                return chat.hasUnreadMessages();
            },
            isInvitePending: function() {
                var user = Meteor.user();
                if (!user || !user.pending_networks) return false;
                return mout.array.contains(user.pending_networks, network._id);
            },
            accessToken: function() {
                return data.accessToken;
            },
            networkSlug: function() {
                return template.networkSlug.get();
            }
        };
    },

    state: function() {
        var template = Template.instance();
        return {
            shrinkHeader: function() {
                return Partup.client.scroll.pos.get() > 100;
            },
            currentPageIsChat: function() {
                return Router.current().route.getName() === 'network-chat';
            }
        };
    }
});

/*************************************************************/
/* Page events */
/*************************************************************/
Template.app_network.events({
    'click [data-open-networksettings]': function(event, template) {
        event.preventDefault();
        var networkSlug = template.networkSlug.get();
        Intent.go({
            route: 'network-settings',
            params: {
                slug: networkSlug
            }
        });
    },
    'click [data-location]': function(event, template) {
        event.preventDefault();
        var networkSlug = template.networkSlug.get();
        var location = Networks.findOne({slug: networkSlug}).location;
        Partup.client.discover.setPrefill('locationId', location.place_id);
        Partup.client.discover.setCustomPrefill('locationLabel', location.city);
        Router.go('discover');
    },
    'click [data-blank]': function(event, template) {
        event.preventDefault();
    }
});
