# gfx-tests
Performance tests for canvas and webgl

# Install

```
npm install -g gfx-tests
```

# Usage

## Help
```
Usage: gfxtests [options] [command]

Options:
  -V, --version            output the version number
  -h, --help               output usage information

Commands:
  list-tests [options]     Lists tests
  list-devices [options]   Lists ADB devices
  list-browsers [options]  List browsers
  start-server [options]   Start tests server
  run [options] [testIDs]  run tests
```

## List tests
```
Usage: list-tests [options]

Lists tests

Options:
  -c, --configfile <configFile>  Config file (default test.config.json)
  -v, --verbose                  Show all the information available
  -h, --help                     output usage information
```

* `-h, --help`: Show the previous help text.
* `-v, --verbose`: Show all the info about the tests.
* `-c, --configfile <configFile>`: Configuration file for tests. Default: `gfx-tests.config.json`.

Example:
```
$ gfxtests list-tests

Tests list
----------
- misc_fps: fps controls
- webgl_interactive_draggablecubes: interactive draggable cubes
- instancing: instanced circle billboards
- billboard_particles: instancing demo (single triangle)
- simple: simple example
- playcanvas: animation
```

```
$ gfxtests list-tests --verbose

Tests list
----------
[
  {
    "id": "misc_fps",
    "engine": "three.js",
    "url": "threejs/misc_fps.html",
    "name": "fps controls",
    "mobile": true,
    "numframes": 200,
    "interactive": true,
    "input": "input/misc_fps.json"
  },
  {
    "id": "webgl_interactive_draggablecubes",
    "engine": "three.js",
    "url": "threejs/webgl_interactive_draggablecubes.html",
    "name": "interactive draggable cubes",
    "mobile": true,
    "numframes": 200,
    "interactive": true,
    "referenceCompareThreshold": 0.5,
    "referencePercentageFail": 1.5,
    "referenceNumPixelsFail": 100,
    "input": "input/webgl_interactive_draggablecubes.json"
  },
  {
    "id": "instancing",
    "engine": "three.js",
    "url": "threejs/index.html",
    "name": "instanced circle billboards",
    "mobile": true,
    "numframes": 200,
    "interactive": true,
    "skipReferenceImageTest": true
  },
  {
    "id": "billboard_particles",
    "engine": "three.js",
    "url": "threejs/index2.html",
    "name": "instancing demo (single triangle)",
    "mobile": true,
    "windowsize": {
      "width": 500,
      "height": 500
    },
    "interactive": true,
    "skipReferenceImageTest": true
  },
  {
    "id": "simple",
    "engine": "babylon.js",
    "url": "babylon/simple.html",
    "name": "simple example",
    "mobile": true,
    "interactive": true,
    "numframes": 200,
    "skipReferenceImageTest": true
  },
  {
    "id": "playcanvas",
    "engine": "playcanvas",
    "url": "playcanvas/animation.html",
    "name": "animation",
    "mobile": true,
    "interactive": true,
    "skipReferenceImageTest": true
  }
]
```


## List devices
```
Usage: list-devices [options]

Lists ADB devices

Options:
  -v, --verbose  Show all the information available
  -h, --help     output usage information
  ```

* `-h, --help`: Show the previous help text.
* `-v, --verbose`: Show all the info about the devices (local and android).

Example:
```
$ gfxtests --list-devices

Device list
-----------
- Device: Oculus Go (Product: Pacific) (SN: XXXXXXXXXX)
- Device: Mirage Solo (Product: VR_1541F) (SN: XXXXXXXX)
- Device: PC (Product: localdevice) (SN: XXXXXX)
```

## List browsers
```
Usage: list-browsers [options]

List browsers

Options:
  -a, --adb [deviceserial]  Use ADB to connect to an android device
  -v, --verbose             Show all the information available
  -h, --help                output usage information
```

* `-a, --adb [deviceserial]`: Show browsers on ADB devices. If not device serial is provided, it will query all the devices. You can include multiple serials separated by comma (eg: sn1,sn2,sn3)
* `-h, --help`: Show the previous help text.
* `-v, --verbose`: Show all the info about the browsers.

```
$ gfxtests list-browsers

Browsers on device: PC (serial: )
-----------------------------------------------------
chrome
chromecanary
firefox
safari
-----------------------------------------------------
```

```
$ gfxtests list-browsers --adb

Browsers on device: Oculus Go (serial: XXXXXXXXX)
-----------------------------------------------------
fxr
oculus
-----------------------------------------------------

Browsers on device: Mirage Solo (serial: XXXXXXX)
-----------------------------------------------------
fxr
chrome
canary
-----------------------------------------------------
```

```
$ gfxtests list-browsers --verbose

Browsers on device: PC (serial: )
-----------------------------------------------------
[
  {
    "name": "Chrome",
    "code": "chrome",
    "launchCmd": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "versionCode": "",
    "versionName": ""
  },
  {
    "name": "ChromeCanary",
    "code": "chromecanary",
    "launchCmd": "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
    "versionCode": "",
    "versionName": ""
  },
  {
    "name": "Firefox",
    "code": "firefox",
    "launchCmd": "/Applications/Firefox.app/Contents/MacOS/firefox-bin",
    "versionCode": "",
    "versionName": ""
  },
  {
    "name": "Safari",
    "code": "safari",
    "launchCmd": "/Applications/Safari.app/Contents/MacOS/Safari",
    "versionCode": "",
    "versionName": ""
  }
]
-----------------------------------------------------
```

# Web app parameters
- `num-times`: Number of times to run every test.
- `selected`: Comma separated tests IDs to run. (eg: `selected=test1,test2`).
- `fake-webgl`: Hook WebGL calls using NOPs.

# Test parameters
- `num-frames`: Number of frames to render.
- `replay`: Replay mode using recorded input JSON.
- `recording`: Enable recording mode, every input will be recorded and dumped to a JSON.
- `show-keys`: Show pressed keys when replaying.
- `show-mouse`: Show mouse position and clicks when replaying.
- `no-close-on-fail`: Don't close the window if the test fails.
- `fake-webgl`: Hook WebGL calls using NOPs.

# Run tests

## Start web application
```
npm start
```

go to `http://localhost:3000`

## Run from command line (WIP)

### Run tests
```
tests [testIDs] [params]
```

Run all tests:
- Run all tests: `npm run tests [params]`
- Run one test: `npm run tests id1 [params]`
- Run selected tests: `npm run tests id1,id2,id3,id4 [params]`
