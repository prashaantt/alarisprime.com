document.addEventListener('turbolinks:load', function () {
	const toggleEl = document.querySelectorAll('.js-nav-dropdown-toggle')[0];
	const menuEl = document.querySelectorAll('.js-nav-dropdown')[0];

	if (toggleEl && menuEl) {
		toggleEl.addEventListener('click', () => {
			menuEl.classList.toggle('main-nav__dropdown--open');
		});
	}
});
