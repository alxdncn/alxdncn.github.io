/*
	Strata by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function ($) {
	'use strict';

	var mediumScreen = window.matchMedia('(max-width: 980px)');
	var smallScreen = window.matchMedia('(max-width: 736px)');
	var touchDevice = window.matchMedia('(pointer: coarse)').matches;
	var $window = $(window);
	var $body = $('body');
	var $header = $('#header');
	var lightboxSelector = '.work-item a.image[href^="images/"]';

	$body.addClass('is-loading');

	$window.on('load', function () {
		$body.removeClass('is-loading');

		if ($('#two').find(lightboxSelector).length) {
			$('#two').poptrox({
				caption: function ($link) { return $link.next('h3').text(); },
				overlayColor: '#2c2c2c',
				overlayOpacity: 0.85,
				popupCloserText: '',
				popupLoaderText: '',
				selector: lightboxSelector,
				usePopupCaption: true,
				usePopupDefaultStyling: false,
				usePopupEasyClose: false,
				usePopupNav: true,
				windowMargin: smallScreen.matches ? 0 : 50
			});
		}
	});

	if (touchDevice) {
		$body.addClass('is-touch');
	}

	function updateParallax() {
		$window.off('scroll.strata_parallax');

		if (mediumScreen.matches || touchDevice) {
			$header.css('background-position', 'top left, center center');
			return;
		}

		$header.css('background-position', 'left 0px');
		$window.on('scroll.strata_parallax', function () {
			$header.css('background-position', 'left ' + (-$window.scrollTop() / 20) + 'px');
		});
	}

	if (mediumScreen.addEventListener) {
		mediumScreen.addEventListener('change', updateParallax);
	} else {
		mediumScreen.addListener(updateParallax);
	}

	updateParallax();
})(jQuery);
