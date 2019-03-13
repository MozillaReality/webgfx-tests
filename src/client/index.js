import FakeTimers from 'fake-timers';
import CanvasHook from 'canvas-hook';
import PerfStats from 'performance-stats';
import seedrandom from 'seedrandom';
import queryString from 'query-string';
import {InputRecorder, InputReplayer} from 'input-events-recorder';
import EventListenerManager from './event-listeners';
import InputHelpers from './input-helpers';
import {resizeImageData} from './image-utils';
import pixelmatch from 'pixelmatch';
import WebGLStats from 'webgl-stats';

const parameters = queryString.parse(location.search);

var old

function FakeGL( gl ) {

  this.gl = gl;

  for ( var key in gl ) {

    if ( typeof gl[ key ] !== 'function' ) {

      if (key === 'getShaderPrecisionFormat') {
        return this.gl.getParameter.apply( this.gl, arguments );
      }
      this[ key ] = gl[ key ];

    }

  }

}


function onReady(callback) {
  if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}


// Hacks to fix some Unity demos
console.logError = (msg) => console.error(msg);

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

  numFramesToRender: typeof parameters['num-frames'] === 'undefined' ? 1200 : parseInt(parameters['num-frames']),

  // Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
  referenceTestPreTickCalledCount: 0,

  // Canvas used by the test to render
  canvas: null,

  inputRecorder: null,

  // Wallclock time for when we started CPU execution of the current frame.
  // var referenceTestT0 = -1;

  postTick: function () {
    WebGLStats.frameEnd();
    //console.log('>>', JSON.stringify(WebGLStats.getCurrentData()));
  },

  preTick: function() {
    WebGLStats.frameStart();

    if (++this.referenceTestPreTickCalledCount == 1) {
      this.stats.frameStart();

      if (!this.canvas) {
        // We assume the last webgl context being initialized is the one used to rendering
        // If that's different, the test should have a custom code to return that canvas
        if (CanvasHook.webglContexts.length > 0) {
          var context = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1];
          this.canvas = context.canvas;

          // Prevent events not defined as event-listeners
          this.canvas.onmousedown = this.canvas.onmouseup = this.canvas.onmousemove = () => {};

          // To prevent width & height 100%
          function addStyleString(str) {
            var node = document.createElement('style');
            node.innerHTML = str;
            document.body.appendChild(node);
          }

          addStyleString(`.gfxtests-canvas {width: ${this.windowSize.width}px !important; height: ${this.windowSize.height}px !important;}`);
          this.canvas.classList.add('gfxtests-canvas');
          this.canvas.width = this.windowSize.width;
          this.canvas.height = this.windowSize.height;

          WebGLStats.setupExtensions(context);

          if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
            this.inputRecorder = new InputRecorder(this.canvas);
            this.inputRecorder.enable();
          }
        }
        //@fixme else for canvas 2d without webgl
      }

      if (this.referenceTestFrameNumber === 0) {
        if ('autoenter-xr' in parameters) {
          this.injectAutoEnterXR(this.canvas);
        }
      }

      if (typeof parameters['replay'] !== 'undefined' && !this.inputReplayer) {
        if (GFXTESTS_CONFIG.input) {
          // @fixme Prevent multiple fetch while waiting
          fetch('/tests/' + GFXTESTS_CONFIG.input).then(response => {
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

    this.eventListener.ensureNoClientHandlers();

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
    if (this.frameProgressBar) {
      var perc = parseInt(100 * this.referenceTestFrameNumber / this.numFramesToRender);
      this.frameProgressBar.style.width = perc + "%";
    }

    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.

    if (this.referenceTestFrameNumber === 1) {
      this.firstFrameTime = performance.realNow();
      console.log('First frame submitted at (ms):', this.firstFrameTime - pageInitTime);
    }

    if (this.referenceTestFrameNumber === this.numFramesToRender) {
      // TESTER.doImageReferenceCheck();
    }

    // We will assume that after the reftest tick, the application is running idle to wait for next event.
    this.previousEventHandlerExitedTime = performance.realNow();

  },

  createDownloadImageLink: function(data, filename, description) {
    var a = document.createElement('a');
    a.setAttribute('download', filename + '.png');
    a.setAttribute('href', data);
    a.style.cssText = 'color: #FFF; display: inline-grid; text-decoration: none; margin: 2px; font-size: 14px;';

    var img = new Image();
    img.id = filename;
    img.src = data;
    a.appendChild(img);

    var label = document.createElement('label');
    label.className = 'button';
    label.innerHTML = description || filename;

    a.appendChild(label);

    document.getElementById('test_images').appendChild(a);
  },

  // XHRs in the expected render output image, always 'reference.png' in the root directory of the test.
  loadReferenceImage: function() {
    return new Promise ((resolve, reject) => {
      var img = new Image();
      var referenceImageName = parameters['reference-image'] || GFXTESTS_CONFIG.id;
        
      img.src = '/' + GFXTESTS_REFERENCEIMAGE_BASEURL + '/' + referenceImageName + '.png';
      img.onabort = img.onerror = reject;
      
      // reference.png might come from a different domain than the canvas, so don't let it taint ctx.getImageData().
      // See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
      img.crossOrigin = 'Anonymous'; 
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
  
        ctx.drawImage(img, 0, 0);
        this.referenceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
        var data = canvas.toDataURL('image/png');
        this.createDownloadImageLink(data, 'reference-image', 'Reference image');
  
        resolve(this.referenceImageData);
      }
      this.referenceImage = img;  
    });
  },

  getCurrentImage: function(callback) {
    // Grab rendered WebGL front buffer image to a JS-side image object.
    var actualImage = new Image();

    try {
      const init = performance.realNow();
      actualImage.src = this.canvas.toDataURL("image/png");
      actualImage.onload = callback;
      TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
    } catch(e) {
      console.error("Can't generate image");
    }
  },

  doImageReferenceCheck: function() {
    var actualImage = new Image();
    var self = this;

    return new Promise ((resolve, reject) => {
      function reftest (evt) {
        var img = actualImage;
        var canvasCurrent = document.createElement('canvas');
        var context = canvasCurrent.getContext('2d');

        canvasCurrent.width = img.width;
        canvasCurrent.height = img.height;
        context.drawImage(img, 0, 0);

        var currentImageData = context.getImageData(0, 0, img.width, img.height);
        
        const init = performance.realNow();
        TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
        self.loadReferenceImage().then(refImageData => {
          var width = refImageData.width;
          var height = refImageData.height;
          var canvasDiff = document.createElement('canvas');
          var diffCtx = canvasDiff.getContext('2d');
          canvasDiff.width = width;
          canvasDiff.height = height;  
          var diff = diffCtx.createImageData(width, height);
          
          var newImageData = diffCtx.createImageData(width, height);
          resizeImageData(currentImageData, newImageData);

          var expected = refImageData.data;
          var actual = newImageData.data;
          
          var threshold = typeof GFXTESTS_CONFIG.referenceCompareThreshold === 'undefined' ? 0.2 : GFXTESTS_CONFIG.referenceCompareThreshold;
          var numDiffPixels = pixelmatch(expected, actual, diff.data, width, height, {threshold: threshold});
          var diffPerc = numDiffPixels / (width * height) * 100;
          
          var fail = diffPerc > 0.2; // diff perc 0 - 100%
          var result = {result: 'pass'};

          if (fail) {
            var divError = document.getElementById('reference-images-error');
            divError.querySelector('h3').innerHTML = `ERROR: Reference image mismatch (${diffPerc.toFixed(2)}% different pixels)`;
            divError.style.display = 'block';
            result = {
              result: 'fail',
              diffPerc: diffPerc,
              numDiffPixels: numDiffPixels,
              failReason: 'Reference image mismatch'
            };
              
            var benchmarkDiv = document.getElementById('test_finished');
            benchmarkDiv.className = 'fail';
            benchmarkDiv.querySelector('h1').innerText = 'Test failed!';

            diffCtx.putImageData(diff, 0, 0);

            var data = canvasDiff.toDataURL('image/png');
            self.createDownloadImageLink(data, 'canvas-diff', 'Difference');
            reject(result);
          } else {
            resolve(result);
          }
        }).catch(() => {
          var benchmarkDiv = document.getElementById('test_finished');
          benchmarkDiv.className = 'fail';
          benchmarkDiv.querySelector('h1').innerText = 'Test failed!';

          var divError = document.getElementById('reference-images-error');
          divError.querySelector('h3').innerHTML = `ERROR: Failed to load reference image`;
          divError.style.display = 'block';

          reject({
            result: 'fail',
            failReason: 'Error loading reference image'
          });
        });
      }

      try {
        const init = performance.realNow();
        actualImage.src = this.canvas.toDataURL("image/png");
        actualImage.onload = reftest;
        TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
      } catch(e) {
        reject();
      }
    });
  },

  initServer: function () {
    var serverUrl = 'http://' + GFXTESTS_CONFIG.serverIP + ':8888';

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

    this.socket.emit('test_started', {id: GFXTESTS_CONFIG.id});

    this.socket.on('next_benchmark', (data) => {
      console.log('next_benchmark', data);
      window.location.replace(data.url);
    });    
  },
  
  addInputDownloadButton: function () {
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
      link.onclick = () => saveString(json, GFXTESTS_CONFIG.id + '.json', 'application/json');
      link.appendChild(document.createTextNode(`Download input JSON`)); // (${this.inputRecorder.events.length} events recorded)
      document.getElementById('test_finished').appendChild(link);
  },

  generateBenchmarkResult: function () {
    var timeEnd = performance.realNow();
    var totalTime = timeEnd - pageInitTime; // Total time, including everything.

    return new Promise (resolve => {
      var totalRenderTime = timeEnd - this.firstFrameTime;
      var cpuIdle = this.accumulatedCpuIdleTime * 100.0 / totalRenderTime;
      var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
  
      var result = {
        test_id: GFXTESTS_CONFIG.id,
        stats: {
          perf: this.stats.getStatsSummary(),
          webgl: WebGLStats.getSummary()
        },
        numFrames: this.numFramesToRender,
        totalTime: totalTime,
        timeToFirstFrame: this.firstFrameTime - pageInitTime,
        avgFps: fps,
        numStutterEvents: this.numStutterEvents,
        totalTime: totalTime,
        totalRenderTime: totalRenderTime,
        cpuTime: this.stats.totalTimeInMainLoop,
        cpuIdleTime: this.stats.totalTimeOutsideMainLoop,
        cpuIdlePerc: this.stats.totalTimeOutsideMainLoop * 100 / totalRenderTime,
        pageLoadTime: this.pageLoadTime,
        result: 'pass',
        logs: this.logs
      };

      // @todo Indicate somehow that no reference test has been performed
      if (typeof parameters['skip-reference-image-test'] !== 'undefined') {
        resolve(result);
      } else {
        this.doImageReferenceCheck().then(refResult => {
          Object.assign(result, refResult);
          resolve(result);  
        }).catch(refResult => {
          Object.assign(result, refResult);
          resolve(result);
        });
      }
    });
  },

  benchmarkFinished: function () {

    var style = document.createElement('style');
    style.innerHTML = `
      #test_finished {
        align-items: center;
        background-color: #ddd;
        bottom: 0;
        color: #000;
        display: flex;
        font-family: sans-serif;
        font-weight: normal;
        font-size: 20px;
        justify-content: center;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 99999;
        flex-direction: column;
      }
      
      #test_finished.pass {
        background-color: #9f9;
      }

      #test_finished.fail {
        background-color: #f99;
      }

      #test_images {
        margin-bottom: 20px;
      }

      #test_images img {
        width: 300px;
        border: 1px solid #007095;
      }

      /*
      #test_images img:hover {
        top: 0px; 
        left: 0px;
        height: 80%; 
        width: 80%; 
        position: fixed;
      }
      */

      #test_finished .button {
        background-color: #007095;
        border-color: #007095;
        margin-bottom: 10px;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif !important;
        font-size: 14px;
        font-weight: normal;
        line-height: normal;
        width: 300px;
        padding: 10px 1px;
        text-align: center;
        text-decoration: none;
        transition: background-color 300ms ease-out;
      }

      #test_finished .button:hover {
        background-color: #0078a0;
      }
    `;
    document.body.appendChild(style);

    var div = document.createElement('div');
    div.innerHTML = `<h1>Test finished!</h1>`;
    div.id = 'test_finished';
    div.style.visibility = 'hidden';
    
    var divReferenceError = document.createElement('div');
    divReferenceError.id = 'reference-images-error';
    divReferenceError.style.cssText = 'text-align:center; color: #f00;'
    divReferenceError.innerHTML = '<h3></h3>';
    divReferenceError.style.display = 'none';

    div.appendChild(divReferenceError);
    var divImg = document.createElement('div');
    divImg.id = 'test_images';
    divReferenceError.appendChild(divImg);

    document.body.appendChild(div);

    if (this.inputRecorder) {
      this.addInputDownloadButton();
    }

    try {
      var data = this.canvas.toDataURL("image/png");
      var description = this.inputRecorder ? 'Download reference image' : 'Actual render';
      this.createDownloadImageLink(data, GFXTESTS_CONFIG.id, description);
    } catch(e) {
      console.error("Can't generate image");
    }

    if (this.inputRecorder) {
      document.getElementById('test_finished').style.visibility = 'visible';
      document.getElementById('reference-images-error').style.display = 'block';
    } else {
      this.generateBenchmarkResult().then(result => {
        if (this.socket) {
          if (parameters['test-uuid']) {
            result.testUUID = parameters['test-uuid'];
          }
          this.socket.emit('test_finish', result);
          this.socket.disconnect();
        }
    
        var benchmarkDiv = document.getElementById('test_finished');
        benchmarkDiv.className = result.result;
        if (result.result === 'pass') {
          benchmarkDiv.querySelector('h1').innerText = 'Test passed!';
        }

        benchmarkDiv.style.visibility = 'visible';
      
        console.log('Finished!', result);
        if (typeof window !== 'undefined' && window.close && typeof parameters['no-close-on-fail'] === 'undefined') {
          window.close();
        }
      });  
    }
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

          if (GFXTESTS_CONFIG.sendLog)
            TESTER.socket.emit('log', args);

          return fn.apply(null, args);
        }
      }
    });
  },

  addInfoOverlay: function() {
    onReady(() => {
      if (typeof parameters['info-overlay'] === 'undefined') {
        return;
      }

      var divOverlay = document.createElement('div');
      divOverlay.style.cssText = `
        position: absolute;
        top: 0;
        font-family: Monospace;
        color: #fff;
        font-size: 12px;
        text-align: center;
        font-weight: normal;
        background-color: rgb(95, 40, 136);
        width: 100%;
        padding: 5px`;
      document.body.appendChild(divOverlay);
      divOverlay.innerText = parameters['info-overlay'];
    })
  },

  addProgressBar: function() {
    onReady(() => {
      var divProgressBars = document.createElement('div');
      divProgressBars.style.cssText = 'position: absolute; left: 0; bottom: 0; background-color: #333; width: 200px; padding: 5px 5px 0px 5px;';
      document.body.appendChild(divProgressBars);

      var orderGlobal = parameters['order-global'];
      var totalGlobal = parameters['total-global'];
      var percGlobal = Math.round(orderGlobal/totalGlobal * 100);
      var orderTest = parameters['order-test'];
      var totalTest = parameters['total-test'];
      var percTest = Math.round(orderTest/totalTest * 100);

      function addProgressBarSection(text, color, perc, id) {
        var div = document.createElement('div');
        div.style.cssText='width: 100%; height: 20px; margin-bottom: 5px; overflow: hidden; background-color: #f5f5f5;';
        divProgressBars.appendChild(div);

        var divProgress = document.createElement('div');
        div.appendChild(divProgress);
        if (id) {
          divProgress.id = id;
        }
        divProgress.style.cssText=`
          width: ${perc}%;background-color: ${color} float: left;
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

      if (typeof parameters['order-global'] !== 'undefined') {
        addProgressBarSection(`${orderTest}/${totalTest} ${percTest}%`, '#5bc0de', percTest);
        addProgressBarSection(`${orderGlobal}/${totalGlobal} ${percGlobal}%`, '#337ab7', percGlobal);
      }

      addProgressBarSection('', '#337ab7', 0, 'numframes');
      this.frameProgressBar = document.getElementById('numframes');

    });
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
          if (GFXTESTS_CONFIG.preMainLoop) { 
            GFXTESTS_CONFIG.preMainLoop(); 
          }
          this.preTick();
    
          callback(performance.now());
          this.tick();
          this.stats.frameEnd();

          this.postTick();
          
          if (this.referenceTestFrameNumber === this.numFramesToRender) {
            this.benchmarkFinished();
            return;
          }

          if (GFXTESTS_CONFIG.postMainLoop) {
            GFXTESTS_CONFIG.postMainLoop();
          }
        }
        return window.realRequestAnimationFrame(hookedCallback);
      }
    }
  },

  init: function () {

    if (!GFXTESTS_CONFIG.providesRafIntegration) {
      this.hookRAF();
    }

    this.addProgressBar();
    this.addInfoOverlay();

    console.log('Frames to render:', this.numFramesToRender);

    if (!GFXTESTS_CONFIG.dontOverrideTime) {
      FakeTimers.enable();
    }

    Math.random = seedrandom(this.randomSeed);

    this.handleSize();
    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, this.windowSize));
    this.hookModals();

    this.initServer();

    this.stats = new PerfStats();

    this.logs = {
      errors: [],
      warnings: [],
      catchErrors: []
    };
    // this.wrapErrors();

    this.eventListener = new EventListenerManager();

    //if (typeof parameters['recording'] !== 'undefined') {
    if (typeof parameters['recording'] === 'undefined') {
      this.eventListener.enable();
    }

    this.referenceTestFrameNumber = 0;
    this.timeStart = performance.realNow();
  },

  injectAutoEnterXR: function(canvas) {
    if (navigator.getVRDisplays) {
      setTimeout(() => {
        navigator.getVRDisplays().then(displays => {
          var device = displays[0];
          //if (device.isPresenting) device.exitPresent();
          device.requestPresent( [ { source: canvas } ] );
        }), 2000}); // @fix to make it work on FxR
    }
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
