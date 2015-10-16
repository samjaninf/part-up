/**
 * Header of the Discover page
 * This template handles the search, filtering and sorting options for the discover page
 *
 * @param query {ReactiveVar} - The placeholder reactive-var for the query options
 */

/**
 * Discover-header created
 */
Template.app_discover_filter.onCreated(function() {
    var tpl = this;

    // Submit filter form
    tpl.submitFilterForm = function() {
        Meteor.defer(function() {
            var form = tpl.find('form#discoverQuery');
            $(form).submit();
        });
    };

    // Textsearch
    tpl.textsearch = {
        value: new ReactiveVar(Partup.client.discover.DEFAULT_QUERY.textSearch)
    };

    // Network filter datamodel
    tpl.network = {
        value: new ReactiveVar(Partup.client.discover.DEFAULT_QUERY.networkId),
        selectorState: new ReactiveVar(false, function(a, b) {
            if (!b) return;

            // Focus the searchfield
            Meteor.defer(function() {
                var searchfield = tpl.find('form#networkSelector').elements.search;
                if (searchfield) searchfield.focus();
            });
        }),
        selectorData: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(networkId) {
                    tpl.network.selectorState.set(false);

                    Meteor.setTimeout(function() {
                        tpl.network.value.set(networkId);
                        tpl.submitFilterForm();
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    // Location filter datamodel
    tpl.location = {
        value: new ReactiveVar(Partup.client.discover.DEFAULT_QUERY.locationId),
        selectorState: new ReactiveVar(false, function(a, b) {
            if (!b) return;

            // Focus the searchfield
            Meteor.defer(function() {
                var searchfield = tpl.find('form#locationSelector').elements.search;
                if (searchfield) searchfield.focus();
            });
        }),
        selectorData: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(location) {
                    tpl.location.selectorState.set(false);

                    Meteor.setTimeout(function() {
                        tpl.location.value.set(location);
                        tpl.submitFilterForm();
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    // Sorting filter datamodel
    var sortingOptions = [
        {
            value: 'popular',
            label: function() {
                return __('pages-app-discover-filter-sorting-type-popular');
            }
        },
        {
            value: 'new',
            label: function() {
                return __('pages-app-discover-filter-sorting-type-newest');
            }
        }
    ];
    var defaultSortingOption = lodash.find(sortingOptions, {value: Partup.client.discover.DEFAULT_QUERY.sort});
    tpl.sorting = {
        options: sortingOptions,
        value: new ReactiveVar(defaultSortingOption),
        selectorState: new ReactiveVar(false),
        selectorData: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(sorting) {
                    tpl.sorting.selectorState.set(false);

                    Meteor.setTimeout(function() {
                        tpl.sorting.value.set(sorting);
                        tpl.submitFilterForm();
                    }, DROPDOWN_ANIMATION_DURATION);
                },
                options: tpl.sorting.options,
                default: defaultSortingOption.value
            };
        },
    };

    // Sorting filter datamodel
    var languageOptions = [
        {
            value: 'all',
            label: function() {
                return __('pages-app-discover-filter-language-type-all');
            }
        },
        {
            value: 'nl',
            label: function() {
                return __('pages-app-discover-filter-language-type-dutch');
            }
        },
        {
            value: 'en',
            label: function() {
                return __('pages-app-discover-filter-language-type-english');
            }
        }
    ];
    var defaultLanguageOption = lodash.find(languageOptions, {value: Partup.client.discover.DEFAULT_QUERY.language});
    tpl.language = {
        options: languageOptions,
        value: new ReactiveVar(defaultLanguageOption),
        selectorState: new ReactiveVar(false),
        selectorData: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(language) {
                    tpl.language.selectorState.set(false);

                    Meteor.setTimeout(function() {
                        tpl.language.value.set(language);
                        tpl.submitFilterForm();
                    }, DROPDOWN_ANIMATION_DURATION);
                },
                options: tpl.language.options
            };
        },
    };

    tpl.autorun(function(computation) {
        var queryValue = Session.get('discover.query.textsearch');
        if (queryValue) {
            Session.set('discover.query.textsearch', undefined);
            tpl.textsearch.value.set(queryValue);
        }

        var locationValue = Session.get('discover.query.location');
        if (locationValue) {
            Session.set('discover.query.location', undefined);
            if (locationValue.place_id) locationValue.id = locationValue.place_id;
            tpl.location.value.set(locationValue);
        }

        if (!computation.firstRun) {
            tpl.submitFilterForm();
        }
    });
});

/**
 * Discover-header rendered
 */
Template.app_discover_filter.onRendered(function() {
    var tpl = this;

    // Submit filter form once
    tpl.submitFilterForm();

    // Blur all input fields when user is submitting
    tpl.autorun(function() {
        if (tpl.data.getting_data.get()) {
            tpl.$('input').blur();
        }
    });

    var dropdown_element = tpl.find('[data-filterbar]');
    tpl.handler = Partup.client.elements.onClickOutside([dropdown_element], function() {
        // Disable the dropdown
        toggleSelectorState(tpl);
    });
});

Template.app_discover_filter.onDestroyed(function() {
    var tpl = this;
    Partup.client.elements.offClickOutside(tpl.handler);
});
/**
 * Discover-header helpers
 */
Template.app_discover_filter.helpers({
    // Query
    textsearchData: function() {
        return Template.instance().textsearch.value.get() || '';
    },

    // Network
    networkValue: function() {
        return Template.instance().network.value.get();
    },
    networkSelectorState: function() {
        return Template.instance().network.selectorState;
    },
    networkSelectorData: function() {
        return Template.instance().network.selectorData;
    },

    // Location
    locationValue: function() {
        return Template.instance().location.value.get();
    },
    locationSelectorState: function() {
        return Template.instance().location.selectorState;
    },
    locationSelectorData: function() {
        return Template.instance().location.selectorData;
    },

    // Sorting
    sortingValue: function() {
        return Template.instance().sorting.value.get();
    },
    sortingSelectorState: function() {
        return Template.instance().sorting.selectorState;
    },
    sortingSelectorData: function() {
        return Template.instance().sorting.selectorData;
    },

    // Language
    languageValue: function() {
        return Template.instance().language.value.get();
    },
    languageSelectorState: function() {
        return Template.instance().language.selectorState;
    },
    languageSelectorData: function() {
        return Template.instance().language.selectorData;
    },
});
var toggleSelectorState = function(template, selector) {
    if (selector) {
        if (template[selector] !== template.sorting) template.sorting.selectorState.set(false);
        if (template[selector] !== template.language) template.language.selectorState.set(false);
        if (template[selector] !== template.network) template.network.selectorState.set(false);
        if (template[selector] !== template.location) template.location.selectorState.set(false);
        var currentState = template[selector].selectorState.get();
        template[selector].selectorState.set(!currentState);
    } else {
        template.sorting.selectorState.set(false);
        template.language.selectorState.set(false);
        template.network.selectorState.set(false);
        template.location.selectorState.set(false);
    }
};
/**
 * Discover-header events
 */
Template.app_discover_filter.events({
    'submit form#discoverQuery': function(event, template) {
        event.preventDefault();

        if (template.data.getting_data.get()) return;

        var form = event.currentTarget;

        template.data.query.set({
            textSearch: form.elements.textsearch.value || undefined,
            networkId: form.elements.network_id.value || undefined,
            locationId: form.elements.location_id.value || undefined,
            sort: form.elements.sorting.value || undefined,
            language: form.elements.language.value || undefined
        });

        window.scrollTo(0, 0);
    },

    'click [data-reset-textsearch]': function(event, template) {
        event.preventDefault();
        template.textsearch.value.set('');
        template.submitFilterForm();
    },

    'keyup [data-textsearch-input]': function(e, template) {
        e.preventDefault();
        var value = $(e.currentTarget).val();
        template.textsearch.value.set(value);

        if (window.PU_IE_VERSION === -1) return;
        // IE fix (return key submit)
        var pressedKey = e.which ? e.which : e.keyCode;
        if (pressedKey == 13) {
            template.submitFilterForm();
            return false;
        }
    },

    // Network selector events
    'click [data-open-networkselector]': function(event, template) {
        event.preventDefault();
        toggleSelectorState(template, 'network');
    },
    'click [data-reset-selected-network]': function(event, template) {
        event.preventDefault();
        template.network.value.set('');
        template.submitFilterForm();
    },

    // Location selector events
    'click [data-open-locationselector]': function(event, template) {
        event.preventDefault();
        toggleSelectorState(template, 'location');
    },
    'click [data-reset-selected-location]': function(event, template) {
        event.preventDefault();
        template.location.value.set('');
        template.submitFilterForm();
    },

    // Sorting selector events
    'click [data-open-sortingselector]': function(event, template) {
        event.preventDefault();
        toggleSelectorState(template, 'sorting');
    },

    // Language selector events
    'click [data-open-languageselector]': function(event, template) {
        event.preventDefault();
        toggleSelectorState(template, 'language');
    }
});
