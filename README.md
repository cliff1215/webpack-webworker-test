# webpack Babel test for web worker

Demonstrates how to use webpack with Babel to build web worker.

Installation:

```
cd webpack-webworker-test/
npm install
```

There are three ways in which you can build and run the web app:

* Build once:
    * `npm run build`
    * Open `build/index.html`
* Watch files continuously, rebuild incrementally, whenever one of them changes:
    * `npm run watch`
    * Open `build/index.html`, manually reload page in browser whenever there was a change
* Hot reloading via webpack dev server:
    * `npm run start`
    * Go to `http://localhost:8086/`, page reloads automatically when there are changes
