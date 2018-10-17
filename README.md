# gfx-perftests
Performance tests for canvas and webgl

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

Parameters:
- `adb`: Run on an Android device using ADB
- `browser`: Select the browser to run
- `listtests`:
- `listbrowsers`:

### See available tests
```
list-browsers [--adb]

list-tests
```

```
--browser safari
```