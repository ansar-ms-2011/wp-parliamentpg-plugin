(function( $ ) {
	'use strict';

	/**
	 * All the code for your admin-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practice to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins, and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	document.addEventListener('DOMContentLoaded', function () {
		const form = document.querySelector('form[action="options.php"]');
		console.log(form);
		if (!form) return;

		form.addEventListener('submit', function (e) {
			const checked = form.querySelectorAll('input[name="delete_views[]"]:checked');

			if (checked.length > 0) {
				const message =
					`You are about to permanently delete ${checked.length} endpoint(s).\n\n` +
					`This cannot be undone.\n\nContinue?`;

				if (!window.confirm(message)) {
					e.preventDefault();
				}
			}
		});
	});

})( jQuery );
