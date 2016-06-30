# alarisprime.com

[![Build Status](https://travis-ci.org/alarisprime/alarisprime.com.svg?branch=master)](https://travis-ci.org/alarisprime/alarisprime.com) [![Dependency Status](https://gemnasium.com/badges/github.com/alarisprime/alarisprime.com.svg)](https://gemnasium.com/github.com/alarisprime/alarisprime.com)


## Development

`npm i` to install npm packages.

### File structure

	|-- root - Keep all static files — robots.txt, favicon.ico,… – which needs to be copied to the root of the website
	|-- images 
	|-- contents - pages to be rendered
			+-- projects - the files from this folder will not be rendered. It is used as collections to populate `projects` page.
	|-- layout - Nunjucks templates, which can be used for pages
	|-- macros - Nunjucks macros files
	|-- includes - Nunjucks include files
	|-- scss 
	+-- scripts

### Adding a new page

[qGen](https://github.com/alarisprime/qgen) generator for new page is in place. To create a new page with slug `hello-page` and title `Hello World`, run:

```bash
npm run qgen -- page ./contents --title "Hello World" --slug hello-world
```

The base file will be generated at `./contents/hello-world.html`.

### Develoment server

Run `gulp serve` to run the development build, watch for changes and serve locally.

### Build

`gulp` to build the website for production.

### Deploy

`npm run deploy`
