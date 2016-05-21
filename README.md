# alarisprime.com

[![Build Status](https://travis-ci.org/alarisprime/alarisprime.com.svg?branch=master)](https://travis-ci.org/alarisprime/alarisprime.com) [![Dependency Status](https://gemnasium.com/badges/github.com/alarisprime/alarisprime.com.svg)](https://gemnasium.com/github.com/alarisprime/alarisprime.com)


## Development

`npm i` to install npm packages.

### File structure

	|-- root - Keep all static files — robots.txt, favicon.ico,… – which needs to be copied to the root of the website
	|-- images 
	|-- pages - pages to be rendered
	|-- layout - Nunjucks templates, which can be used for pages
	|-- includes - Nunjucks include files
	|-- scss 
	+-- scripts

### Develoment server

Run `gulp serve` to run the development build, watch for changes and serve locally.

### Build

`gulp` to build the website for production.

### Deploy

`npm run deploy`
