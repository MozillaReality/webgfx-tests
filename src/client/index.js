import FakeTimers from 'fake-timers';
import CanvasHook from 'canvas-hook';
import PerfStats from 'performance-stats';
import seedrandom from 'seedrandom';
import queryString from 'query-string';
import {InputRecorder, InputReplayer} from 'input-events-recorder';
import EventListenerManager from './event-listeners';
import InputHelpers from './input-helpers';

const parameters = queryString.parse(location.search);

window.TESTER = {
  ready: false,

  // Currently executing frame.
  referenceTestFrameNumber: 0,
  firstFrameTime: null,
  // If -1, we are not running an event. Otherwise represents the wallclock time of when we exited the last event handler.
  previousEventHandlerExitedTime: -1,

  // Wallclock time denoting when the page has finished loading.
  pageLoadTime: null,

  // Holds the amount of time in msecs that the previously rendered frame took. Used to estimate when a stutter event occurs (fast frame followed by a slow frame)
  lastFrameDuration: -1,

  // Wallclock time for when the previous frame finished.
  lastFrameTick: -1,

  accumulatedCpuIdleTime: 0,

  // Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
  numStutterEvents: 0,

  numFastFramesNeededForSmoothFrameRate: 120, // Require 120 frames i.e. ~2 seconds of consecutive smooth stutter free frames to conclude we have reached a stable animation rate

  // Measure a "time until smooth frame rate" quantity, i.e. the time after which we consider the startup JIT and GC effects to have settled.
  // This field tracks how many consecutive frames have run smoothly. This variable is set to -1 when smooth frame rate has been achieved to disable tracking this further.
  numConsecutiveSmoothFrames: 0,

  randomSeed: 1,

  numFramesToRender: typeof parameters['numframes'] === 'undefined' ? 100 : parseInt(parameters['numframes']),

  // Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
  referenceTestPreTickCalledCount: 0,

  // Canvas used by the test to render
  canvas: null,

  inputRecorder: null,

  // Wallclock time for when we started CPU execution of the current frame.
  // var referenceTestT0 = -1;

  preTick: function() {
    if (++this.referenceTestPreTickCalledCount == 1) {
      this.stats.frameStart();

      if (!this.canvas) {
        // We assume the last webgl context being initialized is the one used to rendering
        // If that's different, the test should have a custom code to return that canvas
        this.canvas = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1].canvas;
      }

      if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
        this.inputRecorder = new InputRecorder(this.canvas);
        this.inputRecorder.enable();
      }
      
      if (typeof parameters['replay'] !== 'undefined' && !this.inputReplayer) {
        if (GFXPERFTESTS_CONFIG.input) {
          // @fixme Prevent multiple fetch while waiting
          fetch('/tests/' + GFXPERFTESTS_CONFIG.input).then(response => {
            return response.json();
          })
          .then(json => {
            this.inputReplayer = new InputReplayer(this.canvas, json, this.eventListener.registeredEventListeners);
            //this.inputReplayer = new InputReplayer(this.canvas, json);
            //if (parameters.showMouse || parameters.showKeys)
            this.inputHelpers = new InputHelpers(this.canvas);
            this.ready = true;
          });
        }
      } else {
        this.ready = true;
      }
    
      // referenceTestT0 = performance.realNow();
      if (this.pageLoadTime === null) this.pageLoadTime = performance.realNow() - pageInitTime;

      // We will assume that after the reftest tick, the application is running idle to wait for next event.
      if (this.previousEventHandlerExitedTime != -1) {
        this.accumulatedCpuIdleTime += performance.realNow() - this.previousEventHandlerExitedTime;
        this.previousEventHandlerExitedTime = -1;
      }
    }
  },

  tick: function () {
    if (--this.referenceTestPreTickCalledCount > 0)
      return; // We are being called recursively, so ignore this call.

    if (!this.ready) {return;}

    if (this.inputRecorder) {
      this.inputRecorder.frameNumber = this.referenceTestFrameNumber;
    }

    if (this.inputReplayer) {
      this.inputReplayer.tick(this.referenceTestFrameNumber);
    }

/*    
    ensureNoClientHandlers();
*/  
    var timeNow = performance.realNow();

    var frameDuration = timeNow - this.lastFrameTick;
    this.lastFrameTick = timeNow;
    if (this.referenceTestFrameNumber > 5 && this.lastFrameDuration > 0) {
      // This must be fixed depending on the vsync
      if (frameDuration > 20.0 && frameDuration > this.lastFrameDuration * 1.35) {
        this.numStutterEvents++;
        if (this.numConsecutiveSmoothFrames != -1) this.numConsecutiveSmoothFrames = 0;
      } else {
        if (this.numConsecutiveSmoothFrames != -1) {
          this.numConsecutiveSmoothFrames++;
          if (this.numConsecutiveSmoothFrames >= this.numFastFramesNeededForSmoothFrameRate) {
            console.log('timeUntilSmoothFramerate', timeNow - this.firstFrameTime);
            this.numConsecutiveSmoothFrames = -1;
          }
        }
      }
    }
    this.lastFrameDuration = frameDuration;
/*
    if (numPreloadXHRsInFlight == 0) { // Important! The frame number advances only for those frames that the game is not waiting for data from the initial network downloads.
      if (numStartupBlockerXHRsPending == 0) ++this.referenceTestFrameNumber; // Actual reftest frame count only increments after game has consumed all the critical XHRs that were to be preloaded.
      ++fakedTime; // But game time advances immediately after the preloadable XHRs are finished.
    }
*/
    this.referenceTestFrameNumber++;
    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.
  
    if (this.referenceTestFrameNumber === 1) {
      this.firstFrameTime = performance.realNow();
      console.log('First frame submitted at (ms):', this.firstFrameTime - pageInitTime);
    }

    if (this.referenceTestFrameNumber === this.numFramesToRender) {
      TESTER.doImageReferenceCheck();
    }

    // We will assume that after the reftest tick, the application is running idle to wait for next event.
    this.previousEventHandlerExitedTime = performance.realNow();

  },

  doImageReferenceCheck: function() {
    var canvas = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1].canvas;

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
    var serverUrl = 'http://' + GFXPERFTESTS_CONFIG.serverIP + ':8888';

    this.socket = io.connect(serverUrl);

    this.socket.on('connect', function(data) {
      console.log('Connected to testing server');
    });
    
    this.socket.on('error', (error) => {
      console.log(error);
    });
    
    this.socket.on('connect_error', (error) => {
      console.log(error);
    });

    this.socket.emit('benchmark_started', {id: GFXPERFTESTS_CONFIG.id});

    this.socket.on('next_benchmark', (data) => {
      console.log('next_benchmark', data);
      window.location.replace(data.url);
    });    
  },
  
  benchmarkFinished: function () {

    var style = document.createElement('style');
    style.innerHTML = `
      #benchmark_finished {
        align-items: center;
        background-color: #999;
        bottom: 0;
        color: #fff;
        display: flex;
        font-family: sans-serif;
        font-weight: normal;
        font-size: 40px;
        justify-content: center;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 9999;
        flex-direction: column;
      }
      
      #benchmark_finished .button {
        background-color: #007095;
        border-color: #007095;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif !important;
        font-size: 16px;
        font-weight: normal;
        line-height: normal;
        padding: 15px 20px 15px 20px;
        text-align: center;
        text-decoration: none;
        transition: background-color 300ms ease-out;
      }

      #benchmark_finished .button:hover {
        background-color: #0078a0;
      }
      `;
    document.body.appendChild(style);

    var timeEnd = performance.realNow();
    var totalTime = timeEnd - pageInitTime; // Total time, including everything.

    var div = document.createElement('div');
    div.innerHTML = `
      <h1>Test finished!</h1>
    `;
    //div.appendChild(text);
    div.id = 'benchmark_finished';
    
    document.body.appendChild(div);

    if (this.inputRecorder) {
      // Dump input
      function saveString (text, filename, mimeType) {
        saveBlob(new Blob([ text ], { type: mimeType }), filename);
      }
      
      function saveBlob (blob, filename) {
        var link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'input.json';
        link.click();
        // URL.revokeObjectURL(url); breaks Firefox...
      }

      var json = JSON.stringify(this.inputRecorder.events, null, 2);

      //console.log('Input recorded', json);

      var link = document.createElement('a');
      document.body.appendChild(link);
      link.href = '#';
      link.className = 'button';
      link.onclick = () => saveString(json, GFXPERFTESTS_CONFIG.id + '.json', 'application/json');
      link.appendChild(document.createTextNode(`Download input JSON`)); // (${this.inputRecorder.events.length} events recorded)
      div.appendChild(link);
    }

    var totalRenderTime = timeEnd - this.firstFrameTime;
    var cpuIdle = this.accumulatedCpuIdleTime * 100.0 / totalRenderTime;
    var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
    
    var data = {
      test_id: GFXPERFTESTS_CONFIG.id,
      values: this.stats.getStatsSummary(),
      numFrames: this.numFramesToRender,
      totalTime: totalTime,
      timeToFirstFrame: this.firstFrameTime - pageInitTime,
      logs: this.logs,
      avgFps: fps,
      numStutterEvents: this.numStutterEvents,
      result: 'PASS',
      totalTime: totalTime,
      totalRenderTime: totalRenderTime,
      cpuTime: this.stats.totalTimeInMainLoop,
      cpuIdleTime: this.stats.totalTimeOutsideMainLoop,
      cpuIdlePerc: this.stats.totalTimeOutsideMainLoop * 100 / totalRenderTime,
      pageLoadTime: this.pageLoadTime,
    };

    if (this.socket) {
      this.socket.emit('benchmark_finish', data);
      this.socket.disconnect();
    }

    console.log('Finished!', data);
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

          if (GFXPERFTESTS_CONFIG.sendLog)
            TESTER.socket.emit('log', args);

          return fn.apply(null, args);
        }
      }
    });
  },

  addProgressBar: function() {
    window.onload = () => {
      if (typeof parameters['order-global'] === 'undefined') {
        return;
      }

      var divProgressBars = document.createElement('div');
      divProgressBars.style.cssText = 'position: absolute; bottom: 0; background-color: #333; width: 200px; padding: 10px 10px 0px 10px;';
      document.body.appendChild(divProgressBars);
      
      var orderGlobal = parameters['order-global'];
      var totalGlobal = parameters['total-global'];
      var percGlobal = Math.round(orderGlobal/totalGlobal * 100);
      var orderTest = parameters['order-test'];
      var totalTest = parameters['total-test'];
      var percTest = Math.round(orderTest/totalTest * 100);
      
      function addProgressBarSection(text, color, perc) {
        var div = document.createElement('div');
        div.style.cssText='width: 100%; height: 20px; margin-bottom: 10px; overflow: hidden; background-color: #f5f5f5; border-radius: 4px; -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1); box-shadow: inset 0 1px 2px rgba(0,0,0,.1);';
        divProgressBars.appendChild(div);
        
        var divProgress = document.createElement('div');
        div.appendChild(divProgress);
        divProgress.style.cssText=`width: ${perc}%; background-color: ${color} float: left;
          height: 100%;
          font-family: Monospace;
          font-size: 12px;
          font-weight: normal;
          line-height: 20px;
          color: #fff;
          text-align: center;
          background-color: #337ab7;
          -webkit-box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
          box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
          -webkit-transition: width .6s ease;
          -o-transition: width .6s ease;
          transition: width .6s ease;`;
          divProgress.innerText = text;;
      }

      addProgressBarSection(`${orderTest}/${totalTest} ${percTest}%`, '#5bc0de', percTest);
      addProgressBarSection(`${orderGlobal}/${totalGlobal} ${percGlobal}%`, '#337ab7', percGlobal);
      return;
      /*
		<div class="progress" style="width: 100%">
				<div id="progressbar2" class="progress-bar" role="progressbar" style="width: 50%; background-color: #f0ad4e">
					1/100 10%
				</div>
			</div>	
*/
      var div = document.createElement('div');
      var text = document.createTextNode('Test finished!');
      div.appendChild(text);
      div.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:9999;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
      document.body.appendChild(div);
      // console.log('Time spent generating reference images:', TESTER.stats.timeGeneratingReferenceImages);  
    }
  },

  hookModals: function() {
    // Hook modals: This is an unattended run, don't allow window.alert()s to intrude.
    window.alert = function(msg) { console.error('window.alert(' + msg + ')'); }
    window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; }
  },

  hookRAF: function () {
    if (!window.realRequestAnimationFrame) {
      window.realRequestAnimationFrame = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => {
        const hookedCallback = p => {
          if (GFXPERFTESTS_CONFIG.preMainLoop) { 
            GFXPERFTESTS_CONFIG.preMainLoop(); 
          }
          this.preTick();
    
          if (this.referenceTestFrameNumber === this.numFramesToRender) {
            this.benchmarkFinished();
            return;
          }
    
          callback(performance.now());
          this.tick();
          this.stats.frameEnd();
  
          if (GFXPERFTESTS_CONFIG.postMainLoop) {
            GFXPERFTESTS_CONFIG.postMainLoop();
          }
        }
        return window.realRequestAnimationFrame(hookedCallback);
      }
    }
  },

  init: function () {

    if (!GFXPERFTESTS_CONFIG.providesRafIntegration) {
      this.hookRAF();
    }
    this.addProgressBar();

    console.log('Frames to render:', this.numFramesToRender);

    if (!GFXPERFTESTS_CONFIG.dontOverrideTime) {
      FakeTimers.enable();
    }

    Math.random = seedrandom(this.randomSeed);

    this.handleSize();
    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, this.windowSize));
    this.hookModals();

    // this.initServer();

    this.stats = new PerfStats();

    this.logs = {
      errors: [],
      warnings: [],
      catchErrors: []
    };
    this.wrapErrors();

    this.eventListener = new EventListenerManager();
    if (typeof parameters['replay'] !== 'undefined') {
      this.eventListener.enable();
    }

    this.referenceTestFrameNumber = 0;
    this.timeStart = performance.realNow();
  },

  handleSize: function() {
    const DEFAULT_WIDTH = 800;
    const DEFAULT_HEIGHT = 600;
    this.windowSize = {};
    if (typeof parameters['keep-window-size'] === 'undefined') {
      this.windowSize = {
        width: typeof parameters['width'] === 'undefined' ? DEFAULT_WIDTH : parseInt(parameters['width']),
        height: typeof parameters['height'] === 'undefined' ? DEFAULT_HEIGHT : parseInt(parameters['height'])
      }
      window.innerWidth = this.windowSize.width;
      window.innerHeight = this.windowSize.height;
    }
  }
};

TESTER.init();

var pageInitTime = performance.realNow();
