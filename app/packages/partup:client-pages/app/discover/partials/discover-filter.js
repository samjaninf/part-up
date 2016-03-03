/**
 * If you want to prefill values:
 * Use Partup.client.discover.setPrefill(key, value); before changing route
 * to Discover
 */

Template.app_discover_filter.onCreated(function() {
    var template = this;

    Partup.client.discover.prefillQuery();
    var customPrefill = Partup.client.discover.getCustomPrefill();

    var prefilledNetworkId = Partup.client.discover.query.get('networkId');
    template.selectedNetworkLabel = new ReactiveVar(
        prefilledNetworkId ? Networks.findOne(prefilledNetworkId) : undefined
    );
    template.networkBox = {
        state: new ReactiveVar(false),
        data: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(network) {
                    template.networkBox.state.set(false);

                    // Once the box is closed, set the value
                    Meteor.setTimeout(function() {
                        template.queryForm[0].elements.networkId.value = network._id;
                        template.queryForm.submit();
                        template.selectedNetworkLabel.set(network.name);
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    var prefilledLocationId = Partup.client.discover.query.get('locationId');
    template.selectedLocationLabel = new ReactiveVar(
        prefilledLocationId ? customPrefill.locationLabel : undefined
    );
    template.locationBox = {
        state: new ReactiveVar(false, function(a, isOpen) {
            if (!isOpen) return;

            // Focus the text box
            Meteor.defer(function() {
                var searchfield = template.find('form#locationSelector').elements.search;
                if (searchfield) searchfield.focus();
            });
        }),
        data: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(location) {
                    template.locationBox.state.set(false);

                    // Once the box is closed, set the value
                    Meteor.setTimeout(function() {
                        template.queryForm[0].elements.locationId.value = location.id;
                        template.queryForm.submit();
                        template.selectedLocationLabel.set(location.city);
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    var sortOptions = [
        
        {
            value: 'popular',
            label: function() {
                return TAPi18n.__('pages-app-discover-filter-sorting-type-popular');
            }
        },
        {
            value: 'new',
            label: function() {
                return TAPi18n.__('pages-app-discover-filter-sorting-type-newest');
            }
        },
        {
            value: 'recommended',
            label: function() {
                return 'Recommended'; // TODO: i18n this string
            }
        }
    ];
    var prefilledSortValue = Partup.client.discover.query.get('sort');
    var sortOption = lodash.find(sortOptions, {
        value: prefilledSortValue
    });
    template.selectedSortLabel = new ReactiveVar(sortOption.label());
    template.sortBox = {
        state: new ReactiveVar(false),
        data: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                options: sortOptions,
                default: sortOption,
                onSelect: function(sort) {
                    template.sortBox.state.set(false);

                    // Once the box is closed, set the value
                    Meteor.setTimeout(function() {
                        template.queryForm[0].elements.sort.value = sort.value;
                        template.queryForm.submit();
                        template.selectedSortLabel.set(sort.label());
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };

    var prefilledLanguage = Partup.client.discover.query.get('language');
    template.selectedLanguageLabel = new ReactiveVar(
        prefilledLanguage ? customPrefill.languageLabel : undefined
    );
    template.languageBox = {
        state: new ReactiveVar(false),
        data: function() {
            var DROPDOWN_ANIMATION_DURATION = 200;

            return {
                onSelect: function(language) {
                    template.languageBox.state.set(false);

                    // Once the box is closed, set the value
                    Meteor.setTimeout(function() {
                        template.queryForm[0].elements.language.value = language._id;
                        template.queryForm.submit();
                        template.selectedLanguageLabel.set(language.native_name);
                    }, DROPDOWN_ANIMATION_DURATION);
                }
            };
        }
    };
});

Template.app_discover_filter.onRendered(function() {
    var template = this;

    template.queryForm = template.$('form#discoverQueryForm');

    var dropdown_element = template.find('[data-filterbar]');
    template.handler = Partup.client.elements.onClickOutside([dropdown_element], function() {
        template.networkBox.state.set(false);
    });
});

Template.app_discover_filter.onDestroyed(function() {
    var template = this;

    Partup.client.discover.resetQuery();
    Partup.client.elements.offClickOutside(template.handler);
});

Template.app_discover_filter.helpers({
    query: function(key) {
        return Partup.client.discover.query.get(key);
    },

    // Network
    selectedNetworkLabel: function() {
        return Template.instance().selectedNetworkLabel.get();
    },
    networkBox: function() {
        return Template.instance().networkBox;
    },

    // Location
    selectedLocationLabel: function() {
        return Template.instance().selectedLocationLabel.get();
    },
    locationBox: function() {
        return Template.instance().locationBox;
    },

    // Sort
    selectedSortLabel: function() {
        return Template.instance().selectedSortLabel.get();
    },
    sortBox: function() {
        return Template.instance().sortBox;
    },

    // Language
    selectedLanguageLabel: function() {
        return Template.instance().selectedLanguageLabel.get();
    },
    languageBox: function() {
        return Template.instance().languageBox;
    }
});

Template.app_discover_filter.events({
    'submit form#discoverQueryForm': function(event, template) {
        event.preventDefault();

        var form = event.currentTarget;

        $(form).find('input').blur();

        for (key in Partup.client.discover.DEFAULT_QUERY) {
            if (!form.elements[key]) {
                continue;
            }

            var fieldValue = form.elements[key].value;
            var defaultFieldValue = Partup.client.discover.DEFAULT_QUERY[key];

            Partup.client.discover.query.set(key, fieldValue || defaultFieldValue);
        }

        window.scrollTo(0, 0);
    },

    // Textsearch field
    'click [data-reset-textsearch]': function(event, template) {
        event.preventDefault();
        template.queryForm[0].elements.textSearch.value = '';
        template.queryForm.submit();
    },

    // Network field
    'click [data-open-networkbox]': function(event, template) {
        event.preventDefault();
        template.networkBox.state.set(true);
    },
    'click [data-reset-networkid]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        template.networkBox.state.set(false);
        template.selectedNetworkLabel.set();
        template.queryForm[0].elements.networkId.value = '';
        template.queryForm.submit();
    },

    // Location field
    'click [data-open-locationbox]': function(event, template) {
        event.preventDefault();
        template.locationBox.state.set(true);
    },
    'click [data-reset-locationid]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        template.locationBox.state.set(false);
        template.selectedLocationLabel.set();
        template.queryForm[0].elements.locationId.value = '';
        template.queryForm.submit();
    },

    // Sort field
    'click [data-open-sortbox]': function(event, template) {
        event.preventDefault();
        template.sortBox.state.set(true);
    },

    // Language field
    'click [data-open-languagebox]': function(event, template) {
        event.preventDefault();
        template.languageBox.state.set(true);
    },
    'click [data-reset-language]': function(event, template) {
        event.preventDefault();
        event.stopPropagation();
        template.languageBox.state.set(false);
        template.selectedLanguageLabel.set();
        template.queryForm[0].elements.language.value = '';
        template.queryForm.submit();
    }
});
