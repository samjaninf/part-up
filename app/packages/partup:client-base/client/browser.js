Partup.client.browser = {
    isIE: function() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }

        if (/Edge/.test(navigator.userAgent)) {
            // this is Microsoft Edge
            return true;
        }

        return false;
    },

    isSafari: function() {
        var ua = window.navigator.userAgent;

        var is_chrome = ua.indexOf('Chrome') > -1;
        var is_safari = ua.indexOf('Safari') > -1;

        // Chrome has both "Chrome" and "Safari" in the string.
        // Safari only has "Safari".
        if (is_chrome && is_safari) {
            is_safari = false;
        }

        return is_safari;
    }
};
