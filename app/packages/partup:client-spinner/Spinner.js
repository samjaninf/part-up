// jscs:disable
/**
 * Renders a spinner (as loading indicator)
 *
 * @module client-spinner
 *
 * @example
    {{> Spinner type='small' }}
    {{> Spinner type='large' color='inverted' }}
 */

Template.Spinner.rendered = function() {
    var options = lodash.cloneDeep(Partup.client.spinner.defaultOptions);

    if (this.data) {
        switch (this.data.type) {
            case 'small':
                options.width = 1;
                options.length = 4;
                options.radius = 4;
                break;
            case 'large':
                options.length = 8;
                options.width = 3;
                options.radius = 12;
                break;
        }

        switch (this.data.color) {
            case 'inverted':
                options.color = '#ffffff';
                break;
            case 'gray':
                options.color = '#ccc';
                break;
        }
    }

    this.spinner = new Spinner(options);
    this.spinner.spin(this.firstNode);
};
