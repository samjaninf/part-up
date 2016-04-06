Template.NetworkSettingsAbout.onCreated(function() {

});

Template.NetworkSettingsAbout.onRendered(function() {
    // this.$('#summernote-intro').summernote();
    // this.$('#summernote-intro').trumbowyg();

    // this.$('#summernote-p').trumbowyg();
});

Template.NetworkSettingsAbout.helpers({
    form: function() {
        var template = Template.instance();
        return {
            introInput: {
                input: 'data-intro',
                className: 'pu-textarea pu-wysiwyg',
                placeholder: 'Schrijf een intro'
            },
            paragraphInput: {
                input: 'data-paragraph',
                className: 'pu-textarea pu-wysiwyg',
                placeholder: 'Paragraaf'
            }
        };
    }
});

Template.NetworkSettingsAbout.events({

});
