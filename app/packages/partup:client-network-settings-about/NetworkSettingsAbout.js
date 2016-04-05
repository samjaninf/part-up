/**
 * Invite multiple uppers to a network at once, using a CSV file
 *
 * @module client-network-settings-bulkinvite
 * @param {Number} networkSlug    the slug of the network
 */

 Template.NetworkSettingsAbout.onCreated(function() {

 });

 Template.NetworkSettingsAbout.onRendered(function() {
 	this.$('#summernote-intro').summernote({
 		placeholder: 'Give a short introduction about your page',
 		minHeight: 150,
 		toolbar: [
 		  ['style', ['bold', 'underline']],
 		  ['link', ['link']]
 		]
 	});

 	this.$('#summernote-p').summernote({
 		minHeight: 150,
 		toolbar: [
 		  ['style', ['bold', 'underline']],
 		  ['para', ['ul']],
 		  ['link', ['link']],
 		]
 	});
 });

Template.NetworkSettingsAbout.helpers({

});

Template.NetworkSettingsAbout.events({

});
