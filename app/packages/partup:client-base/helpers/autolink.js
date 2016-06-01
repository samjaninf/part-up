// full documentation for Autolinker at http://gregjacobs.github.io/Autolinker.js/docs/#!/api/Autolinker
Template.registerHelper('partupAutolink', function(text) {
    var jaja = Autolinker.link(text, {
        twitter: false, // to not parse twitter handles
        hashtag: false, // do not parse hashtags
        phone: false, // i've set this to false, because it does not work with dutch phone-number formatting
        newWindow: true, // target="_blank"
        truncate: 50, // max length displayed
        stripPrefix: true, // strip http:// etc
        className: 'pu-external-url',
        // this replacefunction is for emails only
        // autolinker will put a target="_blank" on all urls
        // if newWindow is true
        replaceFn: function(linker, match) {
            var type = match.getType();
            if (type === 'email') {
                var email = match.getEmail();
                return '<a href="mailto:' + email + '" class="pu-external-url" rel="nofollow">' + email + '</a>';
            }
            var tag = linker.getTagBuilder().build(match);  // returns an Autolinker.HtmlTag instance
            tag.setAttr('rel', 'nofollow');
            return tag;
        }
    });

    return jaja;
});

Template.registerHelper('partupHighlight', function(message) {
    var template = Template.instance();
    var text = template.highlight.get();
    if (!text.length) return message;
    var highlight = Partup.client.sanitize(text);
    var description = message || '';
    var descriptionArray = Partup.client.strings.splitCaseInsensitive(description, highlight);
    if (descriptionArray.length <= 1) return description;
    var outputText = descriptionArray.join('<span>' + highlight + '</span>');
    return outputText;
});
