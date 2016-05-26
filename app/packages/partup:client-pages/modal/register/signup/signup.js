var placeholders = {
    'name': function() {
        return TAPi18n.__('pages-modal-register-signup-form-name-placeholder');
    },
    'email': function() {
        return TAPi18n.__('pages-modal-register-signup-form-email-placeholder');
    },
    'password': function() {
        return TAPi18n.__('pages-modal-register-signup-form-password-placeholder');
    },
    'confirmPassword': function() {
        return TAPi18n.__('pages-modal-register-signup-form-confirmPassword-placeholder');
    },
    'network': function() {
        return TAPi18n.__('pages-modal-register-signup-form-network-placeholder');
    }
};

var submitting = new ReactiveVar(false);
var isRegisterEmailBtnClicked = new ReactiveVar(false);
var facebookLoading = new ReactiveVar(false);
var linkedinLoading = new ReactiveVar(false);

Template.modal_register_signup.onCreated(function() {
    var template = this;

    submitting.set(false);
    isRegisterEmailBtnClicked.set(false);
    facebookLoading.set(false);
    linkedinLoading.set(false);

    template.userCount = new ReactiveVar();

    HTTP.get('/users/count', function(error, response) {
        if (error || !response || !mout.lang.isString(response.content)) { return; }

        var content = JSON.parse(response.content);
        template.userCount.set(content.count);
    });
});

/*************************************************************/
/* Widget helpers */
/*************************************************************/
Template.modal_register_signup.helpers({
    formSchema: Partup.schemas.forms.registerRequired,
    placeholders: placeholders,
    totalNumberOfUppers: function() {
        return Template.instance().userCount.get();
    },
    submitting: function() {
        return submitting.get();
    },
    facebookLoading: function() {
        return facebookLoading.get();
    },
    linkedinLoading: function() {
        return linkedinLoading.get();
    },
    actionSet1: function() {
      if (Meteor.Device.isPhone() && !isRegisterEmailBtnClicked.get()) {
        return true;
      }
      return false;
    },
    actionSet2: function() {
      if (Meteor.Device.isPhone()) {
        return false;
      }
      return true;
    },
    actionSet3: function() {
      if (!Meteor.Device.isPhone()) {
        return true;
      }
      if (isRegisterEmailBtnClicked.get()) {
        return true;
      }
      return false;
    }
});

/*************************************************************/
/* Widget events */
/*************************************************************/
Template.modal_register_signup.events({
    'click #registerEmailBtn': function(){
      isRegisterEmailBtnClicked.set(true);
    },
    'click [data-signupfacebook]': function(event) {
        event.preventDefault();

        facebookLoading.set(true);
        Meteor.loginWithFacebook({
            requestPermissions: ['email'],
            loginStyle: navigator.userAgent.match('CriOS') ? 'redirect' : 'popup'
        }, function(error) {
            facebookLoading.set(false);

            if (error) {
                Partup.client.notify.error(TAPi18n.__('pages-modal-register-signup-error_' + Partup.client.strings.slugify(error.reason)));
                return;
            }

            var partupId = Session.get('partup_access_token_for_partup');
            var partupAccessToken = Session.get('partup_access_token');
            if (partupId && partupAccessToken) {
                Meteor.call('partups.convert_access_token_to_invite', partupId, partupAccessToken);
            }

            var networkSlug = Session.get('network_access_token_for_network');
            var networkAccessToken = Session.get('network_access_token');
            if (networkSlug && networkAccessToken) {
                Meteor.call('networks.convert_access_token_to_invite', networkSlug, networkAccessToken);
            }

            analytics.track('User registered', {
                userId: Meteor.user()._id,
                method: 'facebook'
            });

            Router.go('register-details');
        });
    },
    'click [data-signuplinkedin]': function(event) {
        event.preventDefault();

        linkedinLoading.set(true);
        Meteor.loginWithLinkedin({
            requestPermissions: ['r_emailaddress'],
            loginStyle: navigator.userAgent.match('CriOS') ? 'redirect' : 'popup'
        }, function(error) {
            linkedinLoading.set(false);

            if (error) {
                Partup.client.notify.error(TAPi18n.__('pages-modal-register-signup-error_' + Partup.client.strings.slugify(error.reason)));
                return false;
            }

            var partupId = Session.get('partup_access_token_for_partup');
            var partupAccessToken = Session.get('partup_access_token');
            if (partupId && partupAccessToken) {
                Meteor.call('partups.convert_access_token_to_invite', partupId, partupAccessToken);
            }

            var networkSlug = Session.get('network_access_token_for_network');
            var networkAccessToken = Session.get('network_access_token');
            if (networkSlug && networkAccessToken) {
                Meteor.call('networks.convert_access_token_to_invite', networkSlug, networkAccessToken);
            }

            analytics.track('User registered', {
                userId: Meteor.user()._id,
                method: 'linkedin'
            });

            var locale = Partup.helpers.parseLocale(navigator.language || navigator.userLanguage);

            Meteor.call('settings.update', {locale: locale}, function(err) {
                if (err) {
                    Partup.client.notify.error(TAPi18n.__('pages-modal-register-signup-error_' + Partup.client.strings.slugify('failed to update locale')));
                    return false;
                }

                Router.go('register-details');
            });
        });
    }
});

/*************************************************************/
/* Widget form hooks */
/*************************************************************/
AutoForm.hooks({
    'pages-modal-register-signupForm': {
        onSubmit: function(insertDoc, updateDoc, currentDoc) {
            submitting.set(true);
            var self = this;
            var submittedDoc = insertDoc;
            var locale = Partup.helpers.parseLocale(navigator.language || navigator.userLanguage);

            Accounts.createUser({
                email: submittedDoc.email,
                password: submittedDoc.password,
                profile: {
                    name: submittedDoc.name,
                    settings: {
                        locale: locale
                    }
                }
            }, function(error) {
                submitting.set(false);

                // Error cases
                if (error && error.message) {
                    switch (error.message) {
                        case 'Email already exists [403]':
                            Partup.client.forms.addStickyFieldError(self, 'email', 'emailExists');
                            break;
                        default:
                            Partup.client.notify.error(TAPi18n.__('pages-modal-register-signup-error_' + Partup.client.strings.slugify(error.reason)));
                    }
                    AutoForm.validateForm(self.formId);
                    self.done(new Error(error.message));
                    return false;
                }

                // Success
                self.done();

                var partupId = Session.get('partup_access_token_for_partup');
                var partupAccessToken = Session.get('partup_access_token');
                if (partupId && partupAccessToken) {
                    Meteor.call('partups.convert_access_token_to_invite', partupId, partupAccessToken);
                }

                var networkSlug = Session.get('network_access_token_for_network');
                var networkAccessToken = Session.get('network_access_token');
                if (networkSlug && networkAccessToken) {
                    Meteor.call('networks.convert_access_token_to_invite', networkSlug, networkAccessToken);
                }

                analytics.track('User registered', {
                    userId: Meteor.user()._id,
                    method: 'email'
                });

                Router.go('register-details');
            });

            return false;
        }
    }
});
