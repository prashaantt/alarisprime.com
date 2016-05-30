document.addEventListener('turbolinks:load', function () {
	const emptyArray = [];
	const overlayEl = document.querySelectorAll('.overlay');

	const toggleOverlay = function () {
		emptyArray.forEach.call(overlayEl, function (el) {
			el.classList.toggle('overlay--open');
		});
	};

	const triggerElements = document.querySelectorAll('.js-overlay-open, .js-overlay-close');

	emptyArray.forEach.call(triggerElements, function (el) {
		el.addEventListener('mouseup', toggleOverlay, false);
		el.addEventListener('touchend', toggleOverlay, false);
	});
});
