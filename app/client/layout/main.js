/*************************************************************/
/* main rendered */
/*************************************************************/
Template.main.onRendered(function() {
    try {
        
        var mainContainer = this.find('.pu-main');
        if (!mainContainer) throw 'Could not find ".pu-main" element to initialize Bender with.';

        Bender.initialize(mainContainer);
    } catch (e) {
        return e;
    }
});

Template.main.helpers({
    noPopupActive: function() {
        return !Partup.client.popup.current.get();
    }
});

Meteor.startup(function() {
    Partup.client.scroll.init();
    Partup.client.screen.init();
});
