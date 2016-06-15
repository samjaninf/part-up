Template.DropdownMenu.onCreated(function() {
    var template = this;
    template.dropdownOpen = new ReactiveVar(false);
    template.subscribe('chats.for_loggedin_user', {networks: true}, {});
});
Template.DropdownMenu.onRendered(function() {
    var template = this;
    ClientDropdowns.addOutsideDropdownClickHandler(template, '[data-clickoutside-close]', '[data-toggle-menu=menu]');
    Router.onBeforeAction(function(req, res, next) {
        template.dropdownOpen.set(false);
        next();
    });
});

Template.DropdownMenu.onDestroyed(function() {
    var template = this;
    ClientDropdowns.removeOutsideDropdownClickHandler(template);
});

Template.DropdownMenu.events({
    'DOMMouseScroll [data-preventscroll], mousewheel [data-preventscroll]': Partup.client.scroll.preventScrollPropagation,
    'click [data-toggle-menu]': ClientDropdowns.dropdownClickHandler,
    'click [data-feedback]': function(event, template) {
        event.preventDefault();
        var $intercom = $('#intercom-launcher');
        if ($intercom.length > 0) {
            if(Intercom) {
                Intercom('showNewMessage');
            }
        } else {
            window.location.href = 'mailto:' + TAPi18n.__('footer-feedback-button-mailto') + '?subject=' + TAPi18n.__('footer-feedback-button-mailto-subject');
        }
    }
});

Template.DropdownMenu.helpers({
    menuOpen: function() {
        return Template.instance().dropdownOpen.get();
    }
});
