var d = Debug('services:scrape');

/**
 @namespace Partup server scrape service
 @name Partup.server.services.scrape
 @memberof Partup.server.services
 */
Partup.server.services.scrape = {
    /**
     * Get scraped data from a URL
     * @param {String} url
     * @return {Object}
     */
    website: function(url) {
        return Scrape.website(url);
    }
};
