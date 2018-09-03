import userAgentInfo from './useragent-info';
import endianness from './endianness';

var vsyncChecked = true;

function padLengthLeft(s, len, ch) {
  if (ch === undefined) ch = ' ';
  while(s.length < len) s = ch + s;
  return s;
}

// Performs the browser feature test. Immediately returns a JS object that contains the results of all synchronously computable fields, and launches asynchronous
// tasks that perform the remaining tests. Once the async tasks have finished, the given successCallback function is called, with the full browser feature test
// results object as the first parameter.
export default function browserFeatureTest(successCallback) {
  var apis = {};
  function setApiSupport(apiname, cmp) {
    if (cmp) apis[apiname] = true;
    else apis[apiname] = false;
  }

  setApiSupport('Math.imul()', typeof Math.imul !== 'undefined');
  setApiSupport('Math.fround()', typeof Math.fround !== 'undefined');
  setApiSupport('ArrayBuffer.transfer()', typeof ArrayBuffer.transfer !== 'undefined');
  setApiSupport('Web Audio', typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined');
  setApiSupport('Pointer Lock', document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock);
  setApiSupport('Fullscreen API', document.body.requestFullscreen || document.body.msRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen);
  var hasBlobConstructor = false;
  try { new Blob(); hasBlobConstructor = true; } catch(e) { }
  setApiSupport('Blob', hasBlobConstructor);
  if (!hasBlobConstructor) setApiSupport('BlobBuilder', typeof BlobBuilder !== 'undefined' || typeof MozBlobBuilder !== 'undefined' || typeof WebKitBlobBuilder !== 'undefined');
  setApiSupport('SharedArrayBuffer', typeof SharedArrayBuffer !== 'undefined');
  setApiSupport('navigator.hardwareConcurrency', typeof navigator.hardwareConcurrency !== 'undefined');
  setApiSupport('SIMD.js', typeof SIMD !== 'undefined');
  setApiSupport('Web Workers', typeof Worker !== 'undefined');
  setApiSupport('WebAssembly', typeof WebAssembly !== 'undefined');
  setApiSupport('Gamepad API', navigator.getGamepads || navigator.webkitGetGamepads);
  var hasIndexedDB = false;
  try { hasIndexedDB = typeof indexedDB !== 'undefined'; } catch (e) {}
  setApiSupport('IndexedDB', hasIndexedDB);
  setApiSupport('Visibility API', typeof document.visibilityState !== 'undefined' || typeof document.hidden !== 'undefined');
  setApiSupport('requestAnimationFrame()', typeof requestAnimationFrame !== 'undefined');
  setApiSupport('performance.now()', typeof performance !== 'undefined' && performance.now);
  setApiSupport('WebSockets', typeof WebSocket !== 'undefined');
  setApiSupport('WebRTC', typeof RTCPeerConnection !== 'undefined' || typeof mozRTCPeerConnection !== 'undefined' || typeof webkitRTCPeerConnection !== 'undefined' || typeof msRTCPeerConnection !== 'undefined');
  setApiSupport('Vibration API', navigator.vibrate);
  setApiSupport('Screen Orientation API', window.screen && (window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation));
  setApiSupport('Geolocation API', navigator.geolocation);
  setApiSupport('Battery Status API', navigator.getBattery);
  setApiSupport('WebAssembly', typeof WebAssembly !== 'undefined');
  setApiSupport('WebVR', typeof navigator.getVRDisplays !== 'undefined');
  setApiSupport('WebXR', typeof navigator.xr !== 'undefined');
  setApiSupport('OffscreenCanvas', typeof OffscreenCanvas !== 'undefined');

  //-------------------------------------------
  //-------------------------------------------
  //-------------------------------------------
  //-------------------------------------------
  //-------------------------------------------
  var webGLSupport = {};
  var bestGLContext = null; // The GL contexts are tested from best to worst (newest to oldest), and the most desirable
                            // context is stored here for later use.
  function testWebGLSupport(contextName, failIfMajorPerformanceCaveat) {
    var canvas = document.createElement('canvas');
    var errorReason = '';
    canvas.addEventListener("webglcontextcreationerror", function(e) { errorReason = e.statusMessage; }, false);
    var context = canvas.getContext(contextName, failIfMajorPerformanceCaveat ? { failIfMajorPerformanceCaveat: true } : {});
    if (context && !errorReason) {
      if (!bestGLContext) bestGLContext = context;
      var results = { supported: true, performanceCaveat: !failIfMajorPerformanceCaveat };
      if (contextName == 'experimental-webgl') results['experimental-webgl'] = true;
      return results;
    }
    else return { supported: false, errorReason: errorReason };
  }

  webGLSupport['webgl2'] = testWebGLSupport('webgl2', true);
  if (!webGLSupport['webgl2'].supported) {
    var softwareWebGL2 = testWebGLSupport('webgl2', false);
    if (softwareWebGL2.supported) {
      softwareWebGL2.hardwareErrorReason = webGLSupport['webgl2'].errorReason; // Capture the reason why hardware WebGL 2 context did not succeed.
      webGLSupport['webgl2'] = softwareWebGL2;
    }
  }

  webGLSupport['webgl1'] = testWebGLSupport('webgl', true);
  if (!webGLSupport['webgl1'].supported) {
    var experimentalWebGL = testWebGLSupport('experimental-webgl', true);
    if (experimentalWebGL.supported || (experimentalWebGL.errorReason && !webGLSupport['webgl1'].errorReason)) {
      webGLSupport['webgl1'] = experimentalWebGL;
    }
  }

  if (!webGLSupport['webgl1'].supported) {
    var softwareWebGL1 = testWebGLSupport('webgl', false);
    if (!softwareWebGL1.supported) {
      var experimentalWebGL = testWebGLSupport('experimental-webgl', false);
      if (experimentalWebGL.supported || (experimentalWebGL.errorReason && !softwareWebGL1.errorReason)) {
        softwareWebGL1 = experimentalWebGL;
      }
    }

    if (softwareWebGL1.supported) {
      softwareWebGL1.hardwareErrorReason = webGLSupport['webgl1'].errorReason; // Capture the reason why hardware WebGL 1 context did not succeed.
      webGLSupport['webgl1'] = softwareWebGL1;
    }
  }

  setApiSupport('WebGL1', webGLSupport['webgl1'].supported);
  setApiSupport('WebGL2', webGLSupport['webgl2'].supported);
  //-------------------------------------------
  //-------------------------------------------
  //-------------------------------------------

  var results = {
    userAgent: userAgentInfo(navigator.userAgent),
    navigator: {
      buildID: navigator.buildID,
      appVersion: navigator.appVersion,
      oscpu: navigator.oscpu,
      platform: navigator.platform  
    },
    // displayRefreshRate: displayRefreshRate, // Will be asynchronously filled in on first run, directly filled in later.
    display: {
      windowDevicePixelRatio: window.devicePixelRatio,
      screenWidth: screen.width,
      screenHeight: screen.height,
      physicalScreenWidth: screen.width * window.devicePixelRatio,
      physicalScreenHeight: screen.height * window.devicePixelRatio,  
    },
    hardwareConcurrency: navigator.hardwareConcurrency, // If browser does not support this, will be asynchronously filled in by core estimator.
    apiSupport: apis,
    typedArrayEndianness: endianness()
  };

  // Some fields exist don't always exist
  var optionalFields = ['vendor', 'vendorSub', 'product', 'productSub', 'language', 'appCodeName', 'appName', 'maxTouchPoints', 'pointerEnabled', 'cpuClass'];
  for(var i in optionalFields) {
    var f = optionalFields[i];
    if (navigator[f]) { results.navigator[f] = navigator[f]; }
  }
/*
  if (bestGLContext) {
    results.GL_VENDOR = bestGLContext.getParameter(bestGLContext.VENDOR);
    results.GL_RENDERER = bestGLContext.getParameter(bestGLContext.RENDERER);
    results.GL_VERSION = bestGLContext.getParameter(bestGLContext.VERSION);
    results.GL_SHADING_LANGUAGE_VERSION = bestGLContext.getParameter(bestGLContext.SHADING_LANGUAGE_VERSION);
    results.GL_MAX_TEXTURE_IMAGE_UNITS = bestGLContext.getParameter(bestGLContext.MAX_TEXTURE_IMAGE_UNITS);

    var WEBGL_debug_renderer_info = bestGLContext.getExtension('WEBGL_debug_renderer_info');
    if (WEBGL_debug_renderer_info) {
      results.GL_UNMASKED_VENDOR_WEBGL = bestGLContext.getParameter(WEBGL_debug_renderer_info.UNMASKED_VENDOR_WEBGL);
      results.GL_UNMASKED_RENDERER_WEBGL = bestGLContext.getParameter(WEBGL_debug_renderer_info.UNMASKED_RENDERER_WEBGL);
    }
    results.supportedWebGLExtensions = bestGLContext.getSupportedExtensions();
  }
*/

  // Spin off the asynchronous tasks.

  var numCoresChecked = navigator.hardwareConcurrency > 0;

  // On first run, estimate the number of cores if needed.
  if (!numCoresChecked) {
    if (navigator.getHardwareConcurrency) {
      navigator.getHardwareConcurrency(function(cores) {
        results.hardwareConcurrency = cores;
        numCoresChecked = true;

        // If this was the last async task, fire success callback.
        if (numCoresChecked && successCallback) successCallback(results);
      });
    } else {
      // navigator.hardwareConcurrency is not supported, and no core estimator available either.
      // Report number of cores as 0.
      results.hardwareConcurrency = 0;
      numCoresChecked = true;

      if (numCoresChecked && successCallback) successCallback(results);
    }
  }

  // If none of the async tasks were needed to be executed, queue success callback.
  if (numCoresChecked && successCallback) setTimeout(function() { successCallback(results); }, 1);

  // If caller is not interested in asynchronously fillable data, also return the results object immediately for the synchronous bits.
  return results;
}
