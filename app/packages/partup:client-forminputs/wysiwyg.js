Template.Wysiwyg.onCreated(function() {
    var template = this;
    template.placeholder = new ReactiveVar('');
    template.className = new ReactiveVar('');
});

Template.Wysiwyg.onRendered(function() {
    var template = this;

    var settings = template.data.inputSettings;
    template.placeholder.set(settings.placeholder);
    template.className.set(settings.className);

    template.editor = template.$('[data-wysiwyg]').trumbowyg({
        btnsDef: {
            formattingCustom: {
                dropdown: ['blockquote', 'p'],
                ico: 'formatting' // Apply formatting icon
            },
        },
        btns: [
            ['bold', 'italic', 'underline', 'strikethrough'],
            ['unorderedList'],
            ['formattingCustom'],
            ['link']
        ],
        fullscreenable: false,
        closable: false,
        autogrow: true,
        resetCss: true,
        prefix: 'pu-wysiwyg-'
    });

    template.outputHandler = function(event) {
        var output = Partup.client.sanitizeOutputHTML(template.editor.trumbowyg('html'));
        $('[' + settings.input + ']').val(output);
    };

    template.editor.on('tbwchange', template.outputHandler);
});

Template.Wysiwyg.onDestroyed(function() {
    var template = this;
    template.editor.off('tbwchange', template.outputHandler);
});

Template.Wysiwyg.events({

});

Template.Wysiwyg.helpers({
    data: function() {
        var template = Template.instance();
        return {
            placeholder: function() {
                return template.placeholder.get();
            },
            className: function() {
                return template.className.get();
            }
        };
    }
});
