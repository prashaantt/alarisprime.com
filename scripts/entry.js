import Turbolinks from 'turbolinks';
import initWebFonts from './webfonts';
import initOverlayContactForm from './overlay-contact-form';

initWebFonts();
Turbolinks.start();
initOverlayContactForm();
