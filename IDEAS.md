# gfxtests.js

- Injected by testsuite
- Injected by hand on `<script>`
- Injected by webextension

## Use case
### npm run tests
  - execute from command line reading a .json with the tests or a list of filenames.html?
  - launch the browser locally or using adb
  - optionally send the results to a server or store them locally in json (could compare with previously stored results)

### run server locally
  - execute server and launch frontapp

### run server remotely
  - launch server hosted remotely
  - execute demos on the browser itself

### command line + remote server
  - execute demos from a local server locally or adb and send info to server


* Remote server with gfxtests.js + resultsServer
* `npm run` will read a gfxtests.json with the config and tests url
* It will start an http-server with the urls