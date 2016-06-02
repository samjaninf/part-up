Template.Header_personal.helpers({
    notificationslabel: function() {
        return TAPi18n.__('header-notifications');
    },
    isHomePage: function() {
        return  Router.isHomePage.get();
    },
    chatlabel: function() {
        return TAPi18n.__('header-chat');
    }
});

Template.Header_personal.events({
    'click [data-login]': function(event) {
        event.preventDefault();
        Intent.go({route: 'login'});
    },
    'click [data-register]': function(event) {
        event.preventDefault();
        Intent.go({route: 'register'});
    }
});
