import debounce from 'debounce';

let navEl;
let linksEls;
const linksElLengths = [];

let visibleContainer;
let dropdownContainer;

const fitMenuItems = () => {
	if (navEl && linksElLengths.length) {
		const navElWidth = navEl.offsetWidth;

		console.log('navElWidth', navElWidth);

		let index = 0;
		let sumofLengths = 0;

		linksElLengths.some((len, i) => {
			sumofLengths += len;

			if (sumofLengths < (navElWidth)) {
				index = i;
			} else {
				return true;
			}

			console.log('sumofLengths', sumofLengths);
			return false;
		});

		if (visibleContainer && dropdownContainer) {
			visibleContainer.innerHTML = '';
			dropdownContainer.innerHTML = '';
		}

		linksEls.forEach((el, i) => {
			if (i <= index) {
				visibleContainer.appendChild(el);
			} else {
				dropdownContainer.appendChild(el);
			}
		});
	}
};

const initializeResponsiveMenu = () => {
	navEl = document.querySelectorAll('.js-main-nav')[0];
	visibleContainer = document.querySelectorAll('.js-nav-visible')[0];
	dropdownContainer = document.querySelectorAll('.js-nav-dropdown')[0];
	linksEls = document.querySelectorAll('.js-main-nav a:not(.js-nav-dropdown-toggle)');

	linksEls.forEach((el, i) => {
		linksElLengths[i] = el.offsetWidth;
	});

	const toggleEl = document.querySelectorAll('.js-nav-dropdown-toggle')[0];
	const menuEl = document.querySelectorAll('.js-nav-dropdown')[0];

	if (toggleEl && menuEl) {
		toggleEl.addEventListener('click', () => {
			menuEl.classList.toggle('main-nav__dropdown--open');
		});
	}

	window.addEventListener('resize', debounce(fitMenuItems, 200));

	fitMenuItems();
};

document.addEventListener('turbolinks:load', function () {
	initializeResponsiveMenu();
});
