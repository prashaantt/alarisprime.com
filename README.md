# alarisprime.com

## Development

`npm i` to install npm packages.

### File structure

|-- root - Keep all static files — robots.txt, favicon.ico,… – which needs to be copied to the root of the website
|-- images 
|-- pages - pages to be rendered
|-- layout - Nunjuck templates, which can be used for pages
|-- includes - Nunjuck include files
|-- scss 
+-- scripts

### Develoment server

Run `npm run serve` to run the development build, watch for changes and serve locally.

### Build

`npm run build` to build the website for production.

### Deploy

`npm run deploy`
