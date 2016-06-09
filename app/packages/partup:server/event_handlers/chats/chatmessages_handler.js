/**
 * Check for scrapable content
 */
Event.on('chats.messages.inserted', function(userId, chatMessageId, content) {
    if (!userId || !chatMessageId) return;

    // Check if an URL is present
    var regex = new RegExp("(http[s]?:\\/\\/(www\\.)?|(www\\.)?){1}([0-9A-Za-z-\\.@:%_\‌​+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    var url = content.match(regex);
    if (url && url.length > 0) {
        var result = Partup.server.services.scrape.website(url[0]);
        var data = {
            title: result.title,
            description: result.description,
            image: result.image,
            domain: result.domain,
            language: result.lang,
            url: url[0]
        };
        ChatMessages.update(chatMessageId, {$set: {preview_data: data}});
    }
});
