import FakeTimers from 'fake-timers';
import CanvasHook from 'canvas-hook';
import PerfStats from 'performance-stats';
import seedrandom from 'seedrandom';
import queryString from 'query-string';
//-----------------

var randomSeed = 1;
Math.random = seedrandom(randomSeed);

// TICK
// Holds the amount of time in msecs that the previously rendered frame took. Used to estimate when a stutter event occurs (fast frame followed by a slow frame)
var lastFrameDuration = -1;

// Wallclock time for when the previous frame finished.
var lastFrameTick = -1;

var accumulatedCpuIdleTime = 0;

// Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
var numStutterEvents = 0;

var TesterConfig = {
  dontOverrideTime: false
};

// Measure a "time until smooth frame rate" quantity, i.e. the time after which we consider the startup JIT and GC effects to have settled.
// This field tracks how many consecutive frames have run smoothly. This variable is set to -1 when smooth frame rate has been achieved to disable tracking this further.
var numConsecutiveSmoothFrames = 0;

const numFastFramesNeededForSmoothFrameRate = 120; // Require 120 frames i.e. ~2 seconds of consecutive smooth stutter free frames to conclude we have reached a stable animation rate.

const parameters = queryString.parse(location.search);

CanvasHook.enable({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'});

if (!TesterConfig.dontOverrideTime)
{
  FakeTimers.enable();
}

var webglContext = null;





// if (injectingInputStream || recordingInputStream) {

// This is an unattended run, don't allow window.alert()s to intrude.
window.alert = function(msg) { console.error('window.alert(' + msg + ')'); }
window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; }

window.TESTER = {
  // Currently executing frame.
  referenceTestFrameNumber: 0,
  numFramesToRender: typeof parameters['numframes'] === 'undefined' ? 100 : parseInt(parameters['numframes']),

  tick: function () {

    --referenceTestPreTickCalledCount;

    if (referenceTestPreTickCalledCount > 0)
      return; // We are being called recursively, so ignore this call.
/*    
  
    if (!runtimeInitialized) return;
    ensureNoClientHandlers();
*/  
    var timeNow = performance.realNow();


    var frameDuration = timeNow - lastFrameTick;
    lastFrameTick = timeNow;
    if (this.referenceTestFrameNumber > 5 && lastFrameDuration > 0) {
      // This must be fixed depending on the vsync
      if (frameDuration > 20.0 && frameDuration > lastFrameDuration * 1.35) {
        numStutterEvents++;
        if (numConsecutiveSmoothFrames != -1) numConsecutiveSmoothFrames = 0;
      } else {
        if (numConsecutiveSmoothFrames != -1) {
          numConsecutiveSmoothFrames++;
          if (numConsecutiveSmoothFrames >= numFastFramesNeededForSmoothFrameRate) {
            console.log('timeUntilSmoothFramerate', timeNow - firstFrameTime);
            numConsecutiveSmoothFrames = -1;
          }
        }
      }
    }
    lastFrameDuration = frameDuration;
/*
    if (numPreloadXHRsInFlight == 0) { // Important! The frame number advances only for those frames that the game is not waiting for data from the initial network downloads.
      if (numStartupBlockerXHRsPending == 0) ++this.referenceTestFrameNumber; // Actual reftest frame count only increments after game has consumed all the critical XHRs that were to be preloaded.
      ++fakedTime; // But game time advances immediately after the preloadable XHRs are finished.
    }
*/
    this.referenceTestFrameNumber++;
    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.
  
    if (this.referenceTestFrameNumber === 1) {
      firstFrameTime = performance.realNow();
      console.log('First frame submitted at (ms):', firstFrameTime - pageInitTime);
    }

    if (this.referenceTestFrameNumber === this.numFramesToRender) {
      TESTER.doReferenceTest();
    }

    // We will assume that after the reftest tick, the application is running idle to wait for next event.
    previousEventHandlerExitedTime = performance.realNow();

  },
  doReferenceTest: function() {
    var canvas = CanvasHook.webglContext.canvas;
    
    // Grab rendered WebGL front buffer image to a JS-side image object.
    var actualImage = new Image();

    function reftest () {
      const init = performance.realNow();
      //document.body.appendChild(actualImage);
      //actualImage.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:99990;width:100%;height:100%;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
      TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
    }

    try {
      const init = performance.realNow();
      actualImage.src = canvas.toDataURL("image/png");
      actualImage.onload = reftest;
      TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
    } catch(e) {
      //reftest(); // canvas.toDataURL() likely failed, return results immediately.
    }
  
  },

  initServer: function () {
    var serverUrl = 'http://' + GFXPERFTEST_CONFIG.serverIP + ':8888';

    this.socket = io.connect(serverUrl);
    this.stats = new PerfStats();

    this.socket.on('connect', function(data) {
      console.log('Connected to testing server');
    });
    
    this.socket.on('error', (error) => {
      console.log(error);
    });
    
    this.socket.on('connect_error', (error) => {
      console.log(error);
    });
  },
  benchmarkFinished: function () {
    var timeEnd = performance.realNow();
    var totalTime = timeEnd - pageInitTime; // Total time, including everything.

    var div = document.createElement('div');
    var text = document.createTextNode('Test finished!');
    div.appendChild(text);
    div.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:9999;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
    document.body.appendChild(div);
    // console.log('Time spent generating reference images:', TESTER.stats.timeGeneratingReferenceImages);

    var totalRenderTime = timeEnd - firstFrameTime;
    var cpuIdle = accumulatedCpuIdleTime * 100.0 / totalRenderTime;
    var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
    
    var data = {
      test_id: GFXPERFTEST_CONFIG.test_id,
      values: this.stats.getStatsSummary(),
      numFrames: this.numFramesToRender,
      totalTime: totalTime,
      timeToFirstFrame: firstFrameTime - pageInitTime,
      logs: this.logs,
      avgFps: fps,
      numStutterEvents: numStutterEvents,
      result: 'PASS',
      totalTime: totalTime,
      totalRenderTime: totalRenderTime,
      cpuTime: this.stats.totalTimeInMainLoop,
      cpuIdleTime: this.stats.totalTimeOutsideMainLoop,
      cpuIdlePerc: this.stats.totalTimeOutsideMainLoop * 100 / totalRenderTime,
      pageLoadTime: pageLoadTime,
    };

    this.socket.emit('benchmark_finish', data);
    console.log('Finished!', data);
    this.socket.disconnect();
    if (typeof window !== 'undefined' && window.close) window.close();
  },
  wrapErrors: function () {
    window.addEventListener('error', error => evt.logs.catchErrors = {
      message: evt.error.message,
      stack: evt.error.stack,
      lineno: evt.error.lineno,
      filename: evt.error.filename
    });

    var wrapFunctions = ['error','warning','log'];
    wrapFunctions.forEach(key => {
      if (typeof console[key] === 'function') {
        var fn = console[key].bind(console);
        console[key] = (...args) => {
          if (key === 'error') {
            this.logs.errors.push(args);
          } else if (key === 'warning') {
            this.logs.warnings.push(args);
          }

          if (TesterConfig.sendLog)
            TESTER.socket.emit('log', args);

          return fn.apply(null, args);
        }
      }
    });
  },
  init: function () {
    console.log('Frames to render:', this.numFramesToRender);

    this.initServer();

    this.timeStart = performance.realNow();
    window.addEventListener('tester_init', () => {
    });

    this.logs = {
      errors: [],
      warnings: [],
      catchErrors: []
    };
    this.wrapErrors();

    this.socket.emit('benchmark_started', {id: GFXPERFTEST_CONFIG.test_id});

    this.socket.on('next_benchmark', (data) => {
            // window.location.replace('http://threejs.org');
      console.log('next_benchmark', data);
      window.location.replace(data.url);
    });

    this.referenceTestFrameNumber = 0;
  },
};

var firstFrameTime = null;

TESTER.init();

TesterConfig.preMainLoop = () => { TESTER.stats.frameStart(); };
TesterConfig.postMainLoop = () => {TESTER.stats.frameEnd(); };

if (!TesterConfig.providesRafIntegration) {
  if (!window.realRequestAnimationFrame) {
    window.realRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = callback => {
      const hookedCallback = p => {
        if (TesterConfig.preMainLoop) { TesterConfig.preMainLoop(); }
        if (TesterConfig.referenceTestPreTick) { TesterConfig.referenceTestPreTick(); }
  
        if (TESTER.referenceTestFrameNumber === TESTER.numFramesToRender) {
          TESTER.benchmarkFinished();
          return;
        }
  
        callback(performance.now());
        TESTER.tick();
  
        if (TesterConfig.referenceTestTick) { TesterConfig.referenceTestTick(); }
        if (TesterConfig.postMainLoop) { TesterConfig.postMainLoop(); }
  
      }
      return window.realRequestAnimationFrame(hookedCallback);
    }
  }
}


// Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
var referenceTestPreTickCalledCount = 0;

// Wallclock time for when we started CPU execution of the current frame.
var referenceTestT0 = -1;

function referenceTestPreTick() {
  ++referenceTestPreTickCalledCount;
  if (referenceTestPreTickCalledCount == 1) {
    referenceTestT0 = performance.realNow();
    if (pageLoadTime === null) pageLoadTime = performance.realNow() - pageInitTime;

    // We will assume that after the reftest tick, the application is running idle to wait for next event.
    if (previousEventHandlerExitedTime != -1) {
      accumulatedCpuIdleTime += performance.realNow() - previousEventHandlerExitedTime;
      previousEventHandlerExitedTime = -1;
    }
  }
}
TesterConfig.referenceTestPreTick = referenceTestPreTick;

// If -1, we are not running an event. Otherwise represents the wallclock time of when we exited the last event handler.
var previousEventHandlerExitedTime = -1;

var pageInitTime = performance.realNow();

// Wallclock time denoting when the page has finished loading.
var pageLoadTime = null;