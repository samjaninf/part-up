Template.OneOnOneChat.onCreated(function() {
    var template = this;
    template.initialized = new ReactiveVar(false);
    template.activeChat = new ReactiveVar(undefined);

    template.subscribe('chats.for_loggedin_user', {private: true}, {}, {
        onReady: function() {
            template.initialized.set(true);
        }
    });

    var searchUser = function(query) {
        console.log(query);
    };
    template.throttledSearchUser = _.throttle(searchUser, 500, {trailing: true});
});

Template.OneOnOneChat.helpers({
    data: function() {
        var template = Template.instance();
        return {
            activeChat: function() {
                return template.activeChat.get();
            }
        };
    },
    state: function() {
        var template = Template.instance();
        return {
            initialized: function() {
                return template.initialized.get();
            }
        };
    },
    config: function() {
        var template = Template.instance();
        return {
            sideBar: function() {
                return {
                    onSearch: template.throttledSearchUser
                };
            },
            bottomBar: function() {
                return {
                    // chatId: network.chat_id
                };
            }
        };
    }
});
