Template.NetworkSettingsAbout.onCreated(function() {

});

Template.NetworkSettingsAbout.onRendered(function() {
    // this.$('#summernote-intro').summernote();
    // this.$('#summernote-intro').trumbowyg();
    this.$('#trumbowyg-demo').trumbowyg({
        btnsDef: {
            // Customizables dropdowns
            formattingCustom: {
                dropdown: ['blockquote', 'p'],
                ico: 'formatting' // Apply formatting icon
            },
            listFormattingCustom: {
                dropdown: ['unorderedList', 'orderedList'],
                ico: 'unorderedList'
            }
        },
        btns: [
            ['bold', 'italic', 'underline', 'strikethrough'],
            ['formattingCustom'],
            ['listFormattingCustom'],
            ['link']
        ],
        fullscreenable: false,
        closable: false,
        autogrow: true,
        resetCss: true
    });
    this.$('#summernote-p').trumbowyg();
});

Template.NetworkSettingsAbout.helpers({

});

Template.NetworkSettingsAbout.events({

});
