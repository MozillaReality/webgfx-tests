(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

	// Trims whitespace in each string from an array of strings
	function trimSpacesInEachElement(arr) {
	  return arr.map(function(x) { return x.trim(); });
	}

	// Returns a copy of the given array with empty/undefined string elements removed in between
	function removeEmptyElements(arr) {
	  return arr.filter(function(x) { return x && x.length > 0; });
	}

	// Returns true if the given string is enclosed in parentheses, e.g. is of form "(something)"
	function isEnclosedInParens(str) {
	  return str[0] == '(' && str[str.length-1] == ')';
	}

	// Returns true if the given substring is contained in the string (case sensitive)
	function contains(str, substr) {
	  return str.indexOf(substr) >= 0;
	}

	// Returns true if the any of the given substrings in the list is contained in the first parameter string (case sensitive)
	function containsAnyOf(str, substrList) {
	  for(var i in substrList) if (contains(str, substrList[i])) return true;
	  return false;
	}


	// Splits an user agent string logically into an array of tokens, e.g.
	// 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
	// -> ['Mozilla/5.0', '(Linux; Android 6.0.1; Nexus 5 Build/MOB30M)', 'AppleWebKit/537.36 (KHTML, like Gecko)', 'Chrome/51.0.2704.81', 'Mobile Safari/537.36']
	function splitUserAgent(str) {
	  str = str.trim();
	  var uaList = [];
	  var tokens = '';
	  // Split by spaces, while keeping top level parentheses intact, so
	  // "Mozilla/5.0 (Linux; Android 6.0.1) Mobile Safari/537.36" becomes
	  // ['Mozilla/5.0', '(Linux; Android 6.0.1)', 'Mobile', 'Safari/537.36']
	  var parensNesting = 0;
	  for(var i = 0; i < str.length; ++i) {
	    if (str[i] == ' ' && parensNesting == 0) {
	      if (tokens.trim().length != 0) uaList.push(tokens.trim());
	      tokens = '';
	    } else if (str[i] == '(') ++parensNesting;
	    else if (str[i] == ')') --parensNesting;
	    tokens = tokens + str[i];
	  }
	  if (tokens.trim().length > 0) uaList.push(tokens.trim());

	  // What follows is a number of heuristic adaptations to account for UA strings met in the wild:

	  // Fuse ['a/ver', '(someinfo)'] together. For example:
	  // 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
	  // -> fuse 'AppleWebKit/537.36' and '(KHTML, like Gecko)' together
	  for(var i = 1; i < uaList.length; ++i) {
	    var l = uaList[i];
	    if (isEnclosedInParens(l) && !contains(l, ';') && i > 1) {
	      uaList[i-1] = uaList[i-1] + ' ' + l;
	      uaList[i] = '';
	    }
	  }
	  uaList = removeEmptyElements(uaList);

	  // Fuse ['foo', 'bar/ver'] together, if 'foo' has only ascii chars. For example:
	  // 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
	  // -> fuse ['Mobile', 'Safari/537.36'] together
	  for(var i = 0; i < uaList.length-1; ++i) {
	    var l = uaList[i];
	    var next = uaList[i+1];
	    if (/^[a-zA-Z]+$/.test(l) && contains(next, '/')) {
	      uaList[i+1] = l + ' ' + next;
	      uaList[i] = '';
	    }
	  }
	  uaList = removeEmptyElements(uaList);
	  return uaList;
	}

	// Finds the special token in the user agent token list that corresponds to the platform info.
	// This is the first element contained in parentheses that has semicolon delimited elements.
	// Returns the platform info as an array split by the semicolons.
	function splitPlatformInfo(uaList) {
	  for(var i = 0; i < uaList.length; ++i) {
	    var item = uaList[i];
	    if (isEnclosedInParens(item)) {
	      return removeEmptyElements(trimSpacesInEachElement(item.substr(1, item.length-2).split(';')));
	    }
	  }
	}

	// Deduces the operating system from the user agent platform info token list.
	function findOS(uaPlatformInfo) {
	  var oses = ['Android', 'BSD', 'Linux', 'Windows', 'iPhone OS', 'Mac OS', 'BSD', 'CrOS', 'Darwin', 'Dragonfly', 'Fedora', 'Gentoo', 'Ubuntu', 'debian', 'HP-UX', 'IRIX', 'SunOS', 'Macintosh', 'Win 9x', 'Win98', 'Win95', 'WinNT'];
	  for(var os in oses) {
	    for(var i in uaPlatformInfo) {
	      var item = uaPlatformInfo[i];
	      if (contains(item, oses[os])) return item;
	    }
	  }
	  return 'Other';
	}

	// Filters the product components (items of format 'foo/version') from the user agent token list.
	function parseProductComponents(uaList) {
	  uaList = uaList.filter(function(x) { return contains(x, '/') && !isEnclosedInParens(x); });
	  var productComponents = {};
	  for(var i in uaList) {
	    var x = uaList[i];
	    if (contains(x, '/')) {
	      x = x.split('/');
	      if (x.length != 2) throw uaList[i];
	      productComponents[x[0].trim()] = x[1].trim();
	    } else {
	      productComponents[x] = true;
	    }
	  }
	  return productComponents;
	}

	// Maps Windows NT version to human-readable Windows Product version
	function windowsDistributionName(winNTVersion) {
	  var vers = {
	    '5.0': '2000',
	    '5.1': 'XP',
	    '5.2': 'XP',
	    '6.0': 'Vista',
	    '6.1': '7',
	    '6.2': '8',
	    '6.3': '8.1',
	    '10.0': '10'
	  };
	  if (!vers[winNTVersion]) return 'NT ' + winNTVersion;
	  return vers[winNTVersion];
	}

	// The full function to decompose a given user agent to the interesting logical info bits.
	// 
	function deduceUserAgent(userAgent) {
	  userAgent = userAgent || navigator.userAgent;
	  var ua = {
	    userAgent: userAgent,
	    productComponents: {},
	    platformInfo: []
	  };

	  try {
	    var uaList = splitUserAgent(userAgent);
	    var uaPlatformInfo = splitPlatformInfo(uaList);
	    var productComponents = parseProductComponents(uaList);
	    ua.productComponents = productComponents;
	    ua.platformInfo = uaPlatformInfo;
	    var ual = userAgent.toLowerCase();
	    if (contains(ual, 'wow64')) {
	      ua.bitness = '32-on-64';
	      ua.arch = 'x86_64';
	    } else if (containsAnyOf(ual, ['x86_64', 'amd64', 'ia64', 'win64', 'x64'])) {
	      ua.bitness = 64;
	      ua.arch = 'x86_64';
	    } else if (contains(ual, 'ppc64')) {
	      ua.bitness = 64;
	      ua.arch = 'PPC';
	    } else if (contains(ual, 'sparc64')) {
	      ua.bitness = 64;
	      ua.arch = 'SPARC';
	    } else if (containsAnyOf(ual, ['i386', 'i486', 'i586', 'i686', 'x86'])) {
	      ua.bitness = 32;
	      ua.arch = 'x86';
	    } else if (contains(ual, 'arm7') || contains(ual, 'android') || contains(ual, 'mobile')) {
	      ua.bitness = 32;
	      ua.arch = 'ARM';
	    // Heuristic: Assume all OS X are 64-bit, although this is not certain. On OS X, 64-bit browsers
	    // don't advertise being 64-bit.
	    } else if (contains(ual, 'intel mac os')) {
	      ua.bitness = 64;
	      ua.arch = 'x86_64';
	    } else {
	      ua.bitness = 32;
	    }

	    // Deduce operating system
	    var os = findOS(uaPlatformInfo);
	    var m = os.match('(.*)\\s+Mac OS X\\s+(.*)');
	    if (m) {
	      ua.platform = 'Mac';
	      ua.arch = m[1];
	      ua.os = 'Mac OS';
	      ua.osVersion = m[2].replace(/_/g, '.');
	    }
	    if (!m) {
	      m = os.match('Android\\s+(.*)');
	      if (m) {
	        ua.platform = 'Android';
	        ua.os = 'Android';
	        ua.osVersion = m[1];
	      }
	    }
	    if (!m) {
	      m = os.match('Windows NT\\s+(.*)');
	      if (m) {
	        ua.platform = 'PC';
	        ua.os = 'Windows';
	        ua.osVersion = windowsDistributionName(m[1]);
	        if (!ua.arch) ua.arch = 'x86';
	      }
	    }
	    if (!m) {
	      if (contains(uaPlatformInfo[0], 'iPhone') || contains(uaPlatformInfo[0], 'iPad') || contains(uaPlatformInfo[0], 'iPod') || contains(os, 'iPhone') || os.indexOf('CPU OS') == 0) {
	        m = os.match('.*OS (.*) like Mac OS X');
	        if (m) {
	          ua.platform = uaPlatformInfo[0];
	          ua.os = 'iOS';
	          ua.osVersion = m[1].replace(/_/g, '.');
	          ua.bitness = parseInt(ua.osVersion) >= 7 ? 64 : 32;
	        }
	      }
	    }  
	    if (!m) {
	      m = contains(os, 'BSD') || contains(os, 'Linux');
	      if (m) {
	        ua.platform = 'PC';
	        ua.os = os.split(' ')[0];
	        if (!ua.arch) ua.arch = 'x86';
	      }
	    }
	    if (!m) {
	      ua.os = os;
	    }

	    // Deduce human-readable browser vendor, product and version names
	    var browsers = [['SamsungBrowser', 'Samsung'], ['Edge', 'Microsoft'], ['OPR', 'Opera'], ['Chrome', 'Google'], ['Safari', 'Apple'], ['Firefox', 'Mozilla']];
	    for(var i in browsers) {
	      var b = browsers[i][0];
	      if (productComponents[b]) {
	        ua.browserVendor = browsers[i][1];
	        ua.browserProduct = browsers[i][0];
	        if (ua.browserProduct == 'OPR') ua.browserProduct = 'Opera';
	        if (ua.browserProduct == 'Trident') ua.browserProduct = 'Internet Explorer';
	        ua.browserVersion = productComponents[b];
	        break;
	      }
	    }
	    // Detect IEs
	    if (!ua.browserProduct) {
	      var matchIE = userAgent.match(/MSIE\s([\d.]+)/);
	      if (matchIE) {
	        ua.browserVendor = 'Microsoft';
	        ua.browserProduct = 'Internet Explorer';
	        ua.browserVersion = matchIE[1];
	      } else if (contains(uaPlatformInfo, 'Trident/7.0')) {
	        ua.browserVendor = 'Microsoft';
	        ua.browserProduct = 'Internet Explorer';
	        ua.browserVersion =  userAgent.match(/rv:([\d.]+)/)[1];
	      }
	    }

	    // Deduce mobile platform, if present
	    for(var i = 0; i < uaPlatformInfo.length; ++i) {
	      var item = uaPlatformInfo[i];
	      var iteml = item.toLowerCase();
	      if (contains(iteml, 'nexus') || contains(iteml, 'samsung')) {
	        ua.platform = item;
	        ua.arch = 'ARM';
	        break;
	      }
	    }

	    // Deduce form factor
	    if (contains(ual, 'tablet') || contains(ual, 'ipad')) ua.formFactor = 'Tablet';
	    else if (contains(ual, 'mobile') || contains(ual, 'iphone') || contains(ual, 'ipod')) ua.formFactor = 'Mobile';
	    else if (contains(ual, 'smart tv') || contains(ual, 'smart-tv')) ua.formFactor = 'TV';
	    else ua.formFactor = 'Desktop';
	  } catch(e) {
	    ua.internalError = 'Failed to parse user agent string: ' + e.toString();
	  }

	  return ua;
	}

	function endianness () {
	  var heap = new ArrayBuffer(0x10000);
	  var u32 = new Uint32Array(heap);
	  var u16 = new Uint16Array(heap);
	  u32[64] = 0x7FFF0100;
	  var typedArrayEndianness;
	  if (u16[128] === 0x7FFF && u16[129] === 0x0100) typedArrayEndianness = 'big endian';
	  else if (u16[128] === 0x0100 && u16[129] === 0x7FFF) typedArrayEndianness = 'little endian';
	  else typedArrayEndianness = 'unknown! (a browser bug?) (short 1: ' + u16[128].toString(16) + ', short 2: ' + u16[129].toString(16) + ')';
	  return typedArrayEndianness;
	}

	// Performs the browser feature test. Immediately returns a JS object that contains the results of all synchronously computable fields, and launches asynchronous
	// tasks that perform the remaining tests. Once the async tasks have finished, the given successCallback function is called, with the full browser feature test
	// results object as the first parameter.
	function browserFeatureTest(successCallback) {
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
	                            // context is stored here for later use.
	  function testWebGLSupport(contextName, failIfMajorPerformanceCaveat) {
	    var canvas = document.createElement('canvas');
	    var errorReason = '';
	    canvas.addEventListener("webglcontextcreationerror", function(e) { errorReason = e.statusMessage; }, false);
	    var context = canvas.getContext(contextName, failIfMajorPerformanceCaveat ? { failIfMajorPerformanceCaveat: true } : {});
	    if (context && !errorReason) {
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
	    userAgent: deduceUserAgent(navigator.userAgent),
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

	window.onload = (x) => {
	  //console.log(gpuReport());
	  browserFeatureTest(features => data.browser_info = features);
	};

	const tests = [
	  /*
	  {
	    "id": "instancing",
	    "engine": "three.js",
	    "url": "threejs/index.html",
	    "name": "instanced circle billboards"
	  },*/
	  {
	    "id": "billboard_particles",
	    "engine": "three.js",
	    "url": "threejs/index2.html",
	    "name": "instancing demo (single triangle)"
	  },
	  {
	    "id": "simple",
	    "engine": "babylon.js",
	    "url": "babylon/simple.html",
	    "name": "simple example"
	  },
	  {
	    "id": "playcanvas",
	    "engine": "playcanvas",
	    "url": "playcanvas/animation.html",
	    "name": "animation example"
	  }
	];

	var data = {
	  tests: tests,
	  show_json: false,
	  browser_info: null,
	  results: []
	};

	var app = new Vue({
	  el: '#app',
	  data: data,
	  methods: {
	    runTest: function(test, interactive) {
	      runTest(test.id, interactive);
	    },
	    getBrowserInfo: function () {
	      return data.browser_info ? JSON.stringify(data.browser_info, null, 4) : 'Checking browser features...';
	    }
	  }
	});      

	var testsQueuedToRun = [];

	function runNextQueuedTest() {  
	  if (testsQueuedToRun.length == 0) return false;
	  var t = testsQueuedToRun[ 0 ];
	  testsQueuedToRun.splice(0, 1);
	  runTest(t, false);
	  return true;
	}

	function runTest(id, interactive) {
	  var test = tests.find(t => t.id === id);
	  if (!test) {
	    console.error('Test not found, id:', id);
	    return;
	  }
	  console.log('Running test: ', test.name);
	  /*
	  currentlyRunningTest = test;
	  currentlyRunningTest.startTime = new Date();
	  currentlyRunningTest.runUuid = generateUUID();
	  currentlyRunningNoVsync = noVsync && test.noVsync;
	  currentlyRunningFakeGL = fakeGL;
	  currentlyRunningCpuProfiler = cpuProfiler;
	  */
	  var url = (interactive ? 'static/': 'tests/') + test.url;
	  console.log(url);
	  /*
	  function addGET(url, get) {
	    if (url.indexOf('?') != -1) return url + '&' + get;
	    else return url + '?' + get;
	  }
	  if (!interactive) url = addGET(url, 'playback');
	  if (noVsync && test.noVsync) url = addGET(url, 'novsync');
	  if (fakeGL) url = addGET(url, 'fakegl');
	  if (cpuProfiler) url = addGET(url, 'cpuprofiler');
	  if (test.length) url = addGET(url, 'numframes=' + test.length);

	  var parallelTortureMode = document.getElementById('parallelTortureMode').checked;
	  var numSpawnedWindows = parallelTortureMode ? document.getElementById('numParallelWindows').value : 1;
	  */
	 var numSpawnedWindows = 1;
	  for(var i = 0; i < numSpawnedWindows; ++i) {
	    window.open(url);
	  }
	  /*
	  var data = {
	    'browserUuid': browserUuid,
	    'key': test.key,
	    'name': test.name,
	    'startTime': new Date().yyyymmddhhmmss(),
	    'result': 'unfinished',
	    'noVsync': noVsync,
	    'fakeGL': fakeGL,
	    'cpuProfiler': cpuProfiler,
	    'runUuid': currentlyRunningTest.runUuid,
	    'runOrdinal': allTestResultsByKey[test.key] ? (allTestResultsByKey[test.key].length + 1) : 1
	  };
	  if (browserInfo.nativeSystemInfo && browserInfo.nativeSystemInfo.uuid) data.hardwareUuid = browserInfo.nativeSystemInfo.uuid;
	  resultsServer_StoreTestStart(data);
	  // If chaining parallel and sequential torture modes, uncheck the parallel torture mode checkbox icon so that the new tests don't multiply when finished!
	  if (document.getElementById('tortureMode').checked) document.getElementById('parallelTortureMode').checked = false;
	  updateNumParallelWindowsEnabled();
	  */
	}

	var serverUrl = 'http://localhost:8888';

	function initSocket () {
	  var socket = io.connect(serverUrl);

	  socket.on('connect', function(data) {
	    console.log('Connected to testing server');
	  });
	  
	  socket.on('benchmark_finished', (result) => {
	    result.json = JSON.stringify(result, null, 4);
	    console.log(result.json);
	    data.results.push(result);
	    runNextQueuedTest();
	  });
	  
	  socket.on('error', (error) => {
	    console.log(error);
	  });
	  
	  socket.on('connect_error', (error) => {
	    console.log(error);
	  });  
	}

	initSocket();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsidXNlcmFnZW50LWluZm8uanMiLCJlbmRpYW5uZXNzLmpzIiwiYnJvd3NlckZlYXR1cmVzLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBUcmltcyB3aGl0ZXNwYWNlIGluIGVhY2ggc3RyaW5nIGZyb20gYW4gYXJyYXkgb2Ygc3RyaW5nc1xuZnVuY3Rpb24gdHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoYXJyKSB7XG4gIHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgudHJpbSgpOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhIGNvcHkgb2YgdGhlIGdpdmVuIGFycmF5IHdpdGggZW1wdHkvdW5kZWZpbmVkIHN0cmluZyBlbGVtZW50cyByZW1vdmVkIGluIGJldHdlZW5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RWxlbWVudHMoYXJyKSB7XG4gIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJiYgeC5sZW5ndGggPiAwOyB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgZW5jbG9zZWQgaW4gcGFyZW50aGVzZXMsIGUuZy4gaXMgb2YgZm9ybSBcIihzb21ldGhpbmcpXCJcbmZ1bmN0aW9uIGlzRW5jbG9zZWRJblBhcmVucyhzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PSAnKCcgJiYgc3RyW3N0ci5sZW5ndGgtMV0gPT0gJyknO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN1YnN0cmluZyBpcyBjb250YWluZWQgaW4gdGhlIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWlucyhzdHIsIHN1YnN0cikge1xuICByZXR1cm4gc3RyLmluZGV4T2Yoc3Vic3RyKSA+PSAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGFueSBvZiB0aGUgZ2l2ZW4gc3Vic3RyaW5ncyBpbiB0aGUgbGlzdCBpcyBjb250YWluZWQgaW4gdGhlIGZpcnN0IHBhcmFtZXRlciBzdHJpbmcgKGNhc2Ugc2Vuc2l0aXZlKVxuZnVuY3Rpb24gY29udGFpbnNBbnlPZihzdHIsIHN1YnN0ckxpc3QpIHtcbiAgZm9yKHZhciBpIGluIHN1YnN0ckxpc3QpIGlmIChjb250YWlucyhzdHIsIHN1YnN0ckxpc3RbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8vIFNwbGl0cyBhbiB1c2VyIGFnZW50IHN0cmluZyBsb2dpY2FsbHkgaW50byBhbiBhcnJheSBvZiB0b2tlbnMsIGUuZy5cbi8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuLy8gLT4gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKScsICdBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKScsICdDaHJvbWUvNTEuMC4yNzA0LjgxJywgJ01vYmlsZSBTYWZhcmkvNTM3LjM2J11cbmZ1bmN0aW9uIHNwbGl0VXNlckFnZW50KHN0cikge1xuICBzdHIgPSBzdHIudHJpbSgpO1xuICB2YXIgdWFMaXN0ID0gW107XG4gIHZhciB0b2tlbnMgPSAnJztcbiAgLy8gU3BsaXQgYnkgc3BhY2VzLCB3aGlsZSBrZWVwaW5nIHRvcCBsZXZlbCBwYXJlbnRoZXNlcyBpbnRhY3QsIHNvXG4gIC8vIFwiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xKSBNb2JpbGUgU2FmYXJpLzUzNy4zNlwiIGJlY29tZXNcbiAgLy8gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjEpJywgJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J11cbiAgdmFyIHBhcmVuc05lc3RpbmcgPSAwO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHN0cltpXSA9PSAnICcgJiYgcGFyZW5zTmVzdGluZyA9PSAwKSB7XG4gICAgICBpZiAodG9rZW5zLnRyaW0oKS5sZW5ndGggIT0gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG4gICAgICB0b2tlbnMgPSAnJztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PSAnKCcpICsrcGFyZW5zTmVzdGluZztcbiAgICBlbHNlIGlmIChzdHJbaV0gPT0gJyknKSAtLXBhcmVuc05lc3Rpbmc7XG4gICAgdG9rZW5zID0gdG9rZW5zICsgc3RyW2ldO1xuICB9XG4gIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCA+IDApIHVhTGlzdC5wdXNoKHRva2Vucy50cmltKCkpO1xuXG4gIC8vIFdoYXQgZm9sbG93cyBpcyBhIG51bWJlciBvZiBoZXVyaXN0aWMgYWRhcHRhdGlvbnMgdG8gYWNjb3VudCBmb3IgVUEgc3RyaW5ncyBtZXQgaW4gdGhlIHdpbGQ6XG5cbiAgLy8gRnVzZSBbJ2EvdmVyJywgJyhzb21laW5mbyknXSB0b2dldGhlci4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlICdBcHBsZVdlYktpdC81MzcuMzYnIGFuZCAnKEtIVE1MLCBsaWtlIEdlY2tvKScgdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMTsgaSA8IHVhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBsID0gdWFMaXN0W2ldO1xuICAgIGlmIChpc0VuY2xvc2VkSW5QYXJlbnMobCkgJiYgIWNvbnRhaW5zKGwsICc7JykgJiYgaSA+IDEpIHtcbiAgICAgIHVhTGlzdFtpLTFdID0gdWFMaXN0W2ktMV0gKyAnICcgKyBsO1xuICAgICAgdWFMaXN0W2ldID0gJyc7XG4gICAgfVxuICB9XG4gIHVhTGlzdCA9IHJlbW92ZUVtcHR5RWxlbWVudHModWFMaXN0KTtcblxuICAvLyBGdXNlIFsnZm9vJywgJ2Jhci92ZXInXSB0b2dldGhlciwgaWYgJ2ZvbycgaGFzIG9ubHkgYXNjaWkgY2hhcnMuIEZvciBleGFtcGxlOlxuICAvLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbiAgLy8gLT4gZnVzZSBbJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J10gdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHVhTGlzdC5sZW5ndGgtMTsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgdmFyIG5leHQgPSB1YUxpc3RbaSsxXTtcbiAgICBpZiAoL15bYS16QS1aXSskLy50ZXN0KGwpICYmIGNvbnRhaW5zKG5leHQsICcvJykpIHtcbiAgICAgIHVhTGlzdFtpKzFdID0gbCArICcgJyArIG5leHQ7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuICByZXR1cm4gdWFMaXN0O1xufVxuXG4vLyBGaW5kcyB0aGUgc3BlY2lhbCB0b2tlbiBpbiB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHBsYXRmb3JtIGluZm8uXG4vLyBUaGlzIGlzIHRoZSBmaXJzdCBlbGVtZW50IGNvbnRhaW5lZCBpbiBwYXJlbnRoZXNlcyB0aGF0IGhhcyBzZW1pY29sb24gZGVsaW1pdGVkIGVsZW1lbnRzLlxuLy8gUmV0dXJucyB0aGUgcGxhdGZvcm0gaW5mbyBhcyBhbiBhcnJheSBzcGxpdCBieSB0aGUgc2VtaWNvbG9ucy5cbmZ1bmN0aW9uIHNwbGl0UGxhdGZvcm1JbmZvKHVhTGlzdCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGl0ZW0gPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhpdGVtKSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5RWxlbWVudHModHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGgtMikuc3BsaXQoJzsnKSkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBEZWR1Y2VzIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGZyb20gdGhlIHVzZXIgYWdlbnQgcGxhdGZvcm0gaW5mbyB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gZmluZE9TKHVhUGxhdGZvcm1JbmZvKSB7XG4gIHZhciBvc2VzID0gWydBbmRyb2lkJywgJ0JTRCcsICdMaW51eCcsICdXaW5kb3dzJywgJ2lQaG9uZSBPUycsICdNYWMgT1MnLCAnQlNEJywgJ0NyT1MnLCAnRGFyd2luJywgJ0RyYWdvbmZseScsICdGZWRvcmEnLCAnR2VudG9vJywgJ1VidW50dScsICdkZWJpYW4nLCAnSFAtVVgnLCAnSVJJWCcsICdTdW5PUycsICdNYWNpbnRvc2gnLCAnV2luIDl4JywgJ1dpbjk4JywgJ1dpbjk1JywgJ1dpbk5UJ107XG4gIGZvcih2YXIgb3MgaW4gb3Nlcykge1xuICAgIGZvcih2YXIgaSBpbiB1YVBsYXRmb3JtSW5mbykge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtLCBvc2VzW29zXSkpIHJldHVybiBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gJ090aGVyJztcbn1cblxuLy8gRmlsdGVycyB0aGUgcHJvZHVjdCBjb21wb25lbnRzIChpdGVtcyBvZiBmb3JtYXQgJ2Zvby92ZXJzaW9uJykgZnJvbSB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gcGFyc2VQcm9kdWN0Q29tcG9uZW50cyh1YUxpc3QpIHtcbiAgdWFMaXN0ID0gdWFMaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiBjb250YWlucyh4LCAnLycpICYmICFpc0VuY2xvc2VkSW5QYXJlbnMoeCk7IH0pO1xuICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSB7fTtcbiAgZm9yKHZhciBpIGluIHVhTGlzdCkge1xuICAgIHZhciB4ID0gdWFMaXN0W2ldO1xuICAgIGlmIChjb250YWlucyh4LCAnLycpKSB7XG4gICAgICB4ID0geC5zcGxpdCgnLycpO1xuICAgICAgaWYgKHgubGVuZ3RoICE9IDIpIHRocm93IHVhTGlzdFtpXTtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hbMF0udHJpbSgpXSA9IHhbMV0udHJpbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9kdWN0Q29tcG9uZW50c1t4XSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcm9kdWN0Q29tcG9uZW50cztcbn1cblxuLy8gTWFwcyBXaW5kb3dzIE5UIHZlcnNpb24gdG8gaHVtYW4tcmVhZGFibGUgV2luZG93cyBQcm9kdWN0IHZlcnNpb25cbmZ1bmN0aW9uIHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKHdpbk5UVmVyc2lvbikge1xuICB2YXIgdmVycyA9IHtcbiAgICAnNS4wJzogJzIwMDAnLFxuICAgICc1LjEnOiAnWFAnLFxuICAgICc1LjInOiAnWFAnLFxuICAgICc2LjAnOiAnVmlzdGEnLFxuICAgICc2LjEnOiAnNycsXG4gICAgJzYuMic6ICc4JyxcbiAgICAnNi4zJzogJzguMScsXG4gICAgJzEwLjAnOiAnMTAnXG4gIH1cbiAgaWYgKCF2ZXJzW3dpbk5UVmVyc2lvbl0pIHJldHVybiAnTlQgJyArIHdpbk5UVmVyc2lvbjtcbiAgcmV0dXJuIHZlcnNbd2luTlRWZXJzaW9uXTtcbn1cblxuLy8gVGhlIGZ1bGwgZnVuY3Rpb24gdG8gZGVjb21wb3NlIGEgZ2l2ZW4gdXNlciBhZ2VudCB0byB0aGUgaW50ZXJlc3RpbmcgbG9naWNhbCBpbmZvIGJpdHMuXG4vLyBcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZHVjZVVzZXJBZ2VudCh1c2VyQWdlbnQpIHtcbiAgdXNlckFnZW50ID0gdXNlckFnZW50IHx8IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciB1YSA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudCxcbiAgICBwcm9kdWN0Q29tcG9uZW50czoge30sXG4gICAgcGxhdGZvcm1JbmZvOiBbXVxuICB9O1xuXG4gIHRyeSB7XG4gICAgdmFyIHVhTGlzdCA9IHNwbGl0VXNlckFnZW50KHVzZXJBZ2VudCk7XG4gICAgdmFyIHVhUGxhdGZvcm1JbmZvID0gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KTtcbiAgICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCk7XG4gICAgdWEucHJvZHVjdENvbXBvbmVudHMgPSBwcm9kdWN0Q29tcG9uZW50cztcbiAgICB1YS5wbGF0Zm9ybUluZm8gPSB1YVBsYXRmb3JtSW5mbztcbiAgICB2YXIgdWFsID0gdXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBEZWR1Y2UgYXJjaCBhbmQgYml0bmVzc1xuICAgIHZhciBiMzJPbjY0ID0gWyd3b3c2NCddO1xuICAgIGlmIChjb250YWlucyh1YWwsICd3b3c2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gJzMyLW9uLTY0JztcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ3g4Nl82NCcsICdhbWQ2NCcsICdpYTY0JywgJ3dpbjY0JywgJ3g2NCddKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAncHBjNjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICdQUEMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnc3BhcmM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1NQQVJDJztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ2kzODYnLCAnaTQ4NicsICdpNTg2JywgJ2k2ODYnLCAneDg2J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ3g4Nic7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdhcm03JykgfHwgY29udGFpbnModWFsLCAnYW5kcm9pZCcpIHx8IGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgLy8gSGV1cmlzdGljOiBBc3N1bWUgYWxsIE9TIFggYXJlIDY0LWJpdCwgYWx0aG91Z2ggdGhpcyBpcyBub3QgY2VydGFpbi4gT24gT1MgWCwgNjQtYml0IGJyb3dzZXJzXG4gICAgLy8gZG9uJ3QgYWR2ZXJ0aXNlIGJlaW5nIDY0LWJpdC5cbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2ludGVsIG1hYyBvcycpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2Ugb3BlcmF0aW5nIHN5c3RlbVxuICAgIHZhciBvcyA9IGZpbmRPUyh1YVBsYXRmb3JtSW5mbyk7XG4gICAgdmFyIG0gPSBvcy5tYXRjaCgnKC4qKVxcXFxzK01hYyBPUyBYXFxcXHMrKC4qKScpO1xuICAgIGlmIChtKSB7XG4gICAgICB1YS5wbGF0Zm9ybSA9ICdNYWMnO1xuICAgICAgdWEuYXJjaCA9IG1bMV07XG4gICAgICB1YS5vcyA9ICdNYWMgT1MnO1xuICAgICAgdWEub3NWZXJzaW9uID0gbVsyXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdBbmRyb2lkXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zID0gJ0FuZHJvaWQnO1xuICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBvcy5tYXRjaCgnV2luZG93cyBOVFxcXFxzKyguKiknKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ1BDJztcbiAgICAgICAgdWEub3MgPSAnV2luZG93cyc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKG1bMV0pO1xuICAgICAgICBpZiAoIXVhLmFyY2gpIHVhLmFyY2ggPSAneDg2JztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBpZiAoY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUGhvbmUnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQYWQnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQb2QnKSB8fCBjb250YWlucyhvcywgJ2lQaG9uZScpIHx8IG9zLmluZGV4T2YoJ0NQVSBPUycpID09IDApIHtcbiAgICAgICAgbSA9IG9zLm1hdGNoKCcuKk9TICguKikgbGlrZSBNYWMgT1MgWCcpO1xuICAgICAgICBpZiAobSkge1xuICAgICAgICAgIHVhLnBsYXRmb3JtID0gdWFQbGF0Zm9ybUluZm9bMF07XG4gICAgICAgICAgdWEub3MgPSAnaU9TJztcbiAgICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgICB1YS5iaXRuZXNzID0gcGFyc2VJbnQodWEub3NWZXJzaW9uKSA+PSA3ID8gNjQgOiAzMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gIFxuICAgIGlmICghbSkge1xuICAgICAgbSA9IGNvbnRhaW5zKG9zLCAnQlNEJykgfHwgY29udGFpbnMob3MsICdMaW51eCcpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9IG9zLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIHVhLm9zID0gb3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZFByb2R1Y3QocHJvZHVjdENvbXBvbmVudHMsIHByb2R1Y3QpIHtcbiAgICAgIGZvcih2YXIgaSBpbiBwcm9kdWN0Q29tcG9uZW50cykge1xuICAgICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbaV0gPT0gcHJvZHVjdCkgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGh1bWFuLXJlYWRhYmxlIGJyb3dzZXIgdmVuZG9yLCBwcm9kdWN0IGFuZCB2ZXJzaW9uIG5hbWVzXG4gICAgdmFyIGJyb3dzZXJzID0gW1snU2Ftc3VuZ0Jyb3dzZXInLCAnU2Ftc3VuZyddLCBbJ0VkZ2UnLCAnTWljcm9zb2Z0J10sIFsnT1BSJywgJ09wZXJhJ10sIFsnQ2hyb21lJywgJ0dvb2dsZSddLCBbJ1NhZmFyaScsICdBcHBsZSddLCBbJ0ZpcmVmb3gnLCAnTW96aWxsYSddXTtcbiAgICBmb3IodmFyIGkgaW4gYnJvd3NlcnMpIHtcbiAgICAgIHZhciBiID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbYl0pIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9IGJyb3dzZXJzW2ldWzFdO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9IGJyb3dzZXJzW2ldWzBdO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ09QUicpIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ09wZXJhJztcbiAgICAgICAgaWYgKHVhLmJyb3dzZXJQcm9kdWN0ID09ICdUcmlkZW50JykgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IHByb2R1Y3RDb21wb25lbnRzW2JdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRGV0ZWN0IElFc1xuICAgIGlmICghdWEuYnJvd3NlclByb2R1Y3QpIHtcbiAgICAgIHZhciBtYXRjaElFID0gdXNlckFnZW50Lm1hdGNoKC9NU0lFXFxzKFtcXGQuXSspLyk7XG4gICAgICBpZiAobWF0Y2hJRSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSBtYXRjaElFWzFdO1xuICAgICAgfSBlbHNlIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mbywgJ1RyaWRlbnQvNy4wJykpIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9ICdNaWNyb3NvZnQnO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gIHVzZXJBZ2VudC5tYXRjaCgvcnY6KFtcXGQuXSspLylbMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIG1vYmlsZSBwbGF0Zm9ybSwgaWYgcHJlc2VudFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB1YVBsYXRmb3JtSW5mby5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIHZhciBpdGVtbCA9IGl0ZW0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtbCwgJ25leHVzJykgfHwgY29udGFpbnMoaXRlbWwsICdzYW1zdW5nJykpIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSBpdGVtO1xuICAgICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZHVjZSBmb3JtIGZhY3RvclxuICAgIGlmIChjb250YWlucyh1YWwsICd0YWJsZXQnKSB8fCBjb250YWlucyh1YWwsICdpcGFkJykpIHVhLmZvcm1GYWN0b3IgPSAnVGFibGV0JztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdtb2JpbGUnKSB8fCBjb250YWlucyh1YWwsICdpcGhvbmUnKSB8fCBjb250YWlucyh1YWwsICdpcG9kJykpIHVhLmZvcm1GYWN0b3IgPSAnTW9iaWxlJztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdzbWFydCB0dicpIHx8IGNvbnRhaW5zKHVhbCwgJ3NtYXJ0LXR2JykpIHVhLmZvcm1GYWN0b3IgPSAnVFYnO1xuICAgIGVsc2UgdWEuZm9ybUZhY3RvciA9ICdEZXNrdG9wJztcbiAgfSBjYXRjaChlKSB7XG4gICAgdWEuaW50ZXJuYWxFcnJvciA9ICdGYWlsZWQgdG8gcGFyc2UgdXNlciBhZ2VudCBzdHJpbmc6ICcgKyBlLnRvU3RyaW5nKCk7XG4gIH1cblxuICByZXR1cm4gdWE7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIHZhciBoZWFwID0gbmV3IEFycmF5QnVmZmVyKDB4MTAwMDApO1xuICB2YXIgaTMyID0gbmV3IEludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MzIgPSBuZXcgVWludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MTYgPSBuZXcgVWludDE2QXJyYXkoaGVhcCk7XG4gIHUzMls2NF0gPSAweDdGRkYwMTAwO1xuICB2YXIgdHlwZWRBcnJheUVuZGlhbm5lc3M7XG4gIGlmICh1MTZbMTI4XSA9PT0gMHg3RkZGICYmIHUxNlsxMjldID09PSAweDAxMDApIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2JpZyBlbmRpYW4nO1xuICBlbHNlIGlmICh1MTZbMTI4XSA9PT0gMHgwMTAwICYmIHUxNlsxMjldID09PSAweDdGRkYpIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2xpdHRsZSBlbmRpYW4nO1xuICBlbHNlIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ3Vua25vd24hIChhIGJyb3dzZXIgYnVnPykgKHNob3J0IDE6ICcgKyB1MTZbMTI4XS50b1N0cmluZygxNikgKyAnLCBzaG9ydCAyOiAnICsgdTE2WzEyOV0udG9TdHJpbmcoMTYpICsgJyknO1xuICByZXR1cm4gdHlwZWRBcnJheUVuZGlhbm5lc3M7XG59XG4iLCJpbXBvcnQgdXNlckFnZW50SW5mbyBmcm9tICcuL3VzZXJhZ2VudC1pbmZvJztcbmltcG9ydCBlbmRpYW5uZXNzIGZyb20gJy4vZW5kaWFubmVzcyc7XG5cbnZhciB2c3luY0NoZWNrZWQgPSB0cnVlO1xuXG5mdW5jdGlvbiBwYWRMZW5ndGhMZWZ0KHMsIGxlbiwgY2gpIHtcbiAgaWYgKGNoID09PSB1bmRlZmluZWQpIGNoID0gJyAnO1xuICB3aGlsZShzLmxlbmd0aCA8IGxlbikgcyA9IGNoICsgcztcbiAgcmV0dXJuIHM7XG59XG5cbi8vIFBlcmZvcm1zIHRoZSBicm93c2VyIGZlYXR1cmUgdGVzdC4gSW1tZWRpYXRlbHkgcmV0dXJucyBhIEpTIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXN1bHRzIG9mIGFsbCBzeW5jaHJvbm91c2x5IGNvbXB1dGFibGUgZmllbGRzLCBhbmQgbGF1bmNoZXMgYXN5bmNocm9ub3VzXG4vLyB0YXNrcyB0aGF0IHBlcmZvcm0gdGhlIHJlbWFpbmluZyB0ZXN0cy4gT25jZSB0aGUgYXN5bmMgdGFza3MgaGF2ZSBmaW5pc2hlZCwgdGhlIGdpdmVuIHN1Y2Nlc3NDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQsIHdpdGggdGhlIGZ1bGwgYnJvd3NlciBmZWF0dXJlIHRlc3Rcbi8vIHJlc3VsdHMgb2JqZWN0IGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBicm93c2VyRmVhdHVyZVRlc3Qoc3VjY2Vzc0NhbGxiYWNrKSB7XG4gIHZhciBhcGlzID0ge307XG4gIGZ1bmN0aW9uIHNldEFwaVN1cHBvcnQoYXBpbmFtZSwgY21wKSB7XG4gICAgaWYgKGNtcCkgYXBpc1thcGluYW1lXSA9IHRydWU7XG4gICAgZWxzZSBhcGlzW2FwaW5hbWVdID0gZmFsc2U7XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdNYXRoLmltdWwoKScsIHR5cGVvZiBNYXRoLmltdWwgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnTWF0aC5mcm91bmQoKScsIHR5cGVvZiBNYXRoLmZyb3VuZCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdBcnJheUJ1ZmZlci50cmFuc2ZlcigpJywgdHlwZW9mIEFycmF5QnVmZmVyLnRyYW5zZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYiBBdWRpbycsIHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnUG9pbnRlciBMb2NrJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tc1JlcXVlc3RQb2ludGVyTG9jayk7XG4gIHNldEFwaVN1cHBvcnQoJ0Z1bGxzY3JlZW4gQVBJJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0RnVsbFNjcmVlbiB8fCBkb2N1bWVudC5ib2R5LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKTtcbiAgdmFyIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICB0cnkgeyBuZXcgQmxvYigpOyBoYXNCbG9iQ29uc3RydWN0b3IgPSB0cnVlOyB9IGNhdGNoKGUpIHsgfVxuICBzZXRBcGlTdXBwb3J0KCdCbG9iJywgaGFzQmxvYkNvbnN0cnVjdG9yKTtcbiAgaWYgKCFoYXNCbG9iQ29uc3RydWN0b3IpIHNldEFwaVN1cHBvcnQoJ0Jsb2JCdWlsZGVyJywgdHlwZW9mIEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgTW96QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBXZWJLaXRCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTaGFyZWRBcnJheUJ1ZmZlcicsIHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCduYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeScsIHR5cGVvZiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTSU1ELmpzJywgdHlwZW9mIFNJTUQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViIFdvcmtlcnMnLCB0eXBlb2YgV29ya2VyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ0dhbWVwYWQgQVBJJywgbmF2aWdhdG9yLmdldEdhbWVwYWRzIHx8IG5hdmlnYXRvci53ZWJraXRHZXRHYW1lcGFkcyk7XG4gIHZhciBoYXNJbmRleGVkREIgPSBmYWxzZTtcbiAgdHJ5IHsgaGFzSW5kZXhlZERCID0gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCc7IH0gY2F0Y2ggKGUpIHt9XG4gIHNldEFwaVN1cHBvcnQoJ0luZGV4ZWREQicsIGhhc0luZGV4ZWREQik7XG4gIHNldEFwaVN1cHBvcnQoJ1Zpc2liaWxpdHkgQVBJJywgdHlwZW9mIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKScsIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgncGVyZm9ybWFuY2Uubm93KCknLCB0eXBlb2YgcGVyZm9ybWFuY2UgIT09ICd1bmRlZmluZWQnICYmIHBlcmZvcm1hbmNlLm5vdyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlNvY2tldHMnLCB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlJUQycsIHR5cGVvZiBSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1velJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtc1JUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1ZpYnJhdGlvbiBBUEknLCBuYXZpZ2F0b3IudmlicmF0ZSk7XG4gIHNldEFwaVN1cHBvcnQoJ1NjcmVlbiBPcmllbnRhdGlvbiBBUEknLCB3aW5kb3cuc2NyZWVuICYmICh3aW5kb3cuc2NyZWVuLm9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubW96T3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi53ZWJraXRPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1zT3JpZW50YXRpb24pKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2VvbG9jYXRpb24gQVBJJywgbmF2aWdhdG9yLmdlb2xvY2F0aW9uKTtcbiAgc2V0QXBpU3VwcG9ydCgnQmF0dGVyeSBTdGF0dXMgQVBJJywgbmF2aWdhdG9yLmdldEJhdHRlcnkpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBc3NlbWJseScsIHR5cGVvZiBXZWJBc3NlbWJseSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJWUicsIHR5cGVvZiBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJYUicsIHR5cGVvZiBuYXZpZ2F0b3IueHIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnT2Zmc2NyZWVuQ2FudmFzJywgdHlwZW9mIE9mZnNjcmVlbkNhbnZhcyAhPT0gJ3VuZGVmaW5lZCcpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyIHdlYkdMU3VwcG9ydCA9IHt9O1xuICB2YXIgYmVzdEdMQ29udGV4dCA9IG51bGw7IC8vIFRoZSBHTCBjb250ZXh0cyBhcmUgdGVzdGVkIGZyb20gYmVzdCB0byB3b3JzdCAobmV3ZXN0IHRvIG9sZGVzdCksIGFuZCB0aGUgbW9zdCBkZXNpcmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0IGlzIHN0b3JlZCBoZXJlIGZvciBsYXRlciB1c2UuXG4gIGZ1bmN0aW9uIHRlc3RXZWJHTFN1cHBvcnQoY29udGV4dE5hbWUsIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGVycm9yUmVhc29uID0gJyc7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yXCIsIGZ1bmN0aW9uKGUpIHsgZXJyb3JSZWFzb24gPSBlLnN0YXR1c01lc3NhZ2U7IH0sIGZhbHNlKTtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID8geyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiB0cnVlIH0gOiB7fSk7XG4gICAgaWYgKGNvbnRleHQgJiYgIWVycm9yUmVhc29uKSB7XG4gICAgICBpZiAoIWJlc3RHTENvbnRleHQpIGJlc3RHTENvbnRleHQgPSBjb250ZXh0O1xuICAgICAgdmFyIHJlc3VsdHMgPSB7IHN1cHBvcnRlZDogdHJ1ZSwgcGVyZm9ybWFuY2VDYXZlYXQ6ICFmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IH07XG4gICAgICBpZiAoY29udGV4dE5hbWUgPT0gJ2V4cGVyaW1lbnRhbC13ZWJnbCcpIHJlc3VsdHNbJ2V4cGVyaW1lbnRhbC13ZWJnbCddID0gdHJ1ZTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICBlbHNlIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIGVycm9yUmVhc29uOiBlcnJvclJlYXNvbiB9O1xuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wyID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wyJywgZmFsc2UpO1xuICAgIGlmIChzb2Z0d2FyZVdlYkdMMi5zdXBwb3J0ZWQpIHtcbiAgICAgIHNvZnR3YXJlV2ViR0wyLmhhcmR3YXJlRXJyb3JSZWFzb24gPSB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLmVycm9yUmVhc29uOyAvLyBDYXB0dXJlIHRoZSByZWFzb24gd2h5IGhhcmR3YXJlIFdlYkdMIDIgY29udGV4dCBkaWQgbm90IHN1Y2NlZWQuXG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddID0gc29mdHdhcmVXZWJHTDI7XG4gICAgfVxuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgdHJ1ZSk7XG4gIGlmICghd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5zdXBwb3J0ZWQpIHtcbiAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCB0cnVlKTtcbiAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbikpIHtcbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICB9XG4gIH1cblxuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wxID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wnLCBmYWxzZSk7XG4gICAgaWYgKCFzb2Z0d2FyZVdlYkdMMS5zdXBwb3J0ZWQpIHtcbiAgICAgIHZhciBleHBlcmltZW50YWxXZWJHTCA9IHRlc3RXZWJHTFN1cHBvcnQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGZhbHNlKTtcbiAgICAgIGlmIChleHBlcmltZW50YWxXZWJHTC5zdXBwb3J0ZWQgfHwgKGV4cGVyaW1lbnRhbFdlYkdMLmVycm9yUmVhc29uICYmICFzb2Z0d2FyZVdlYkdMMS5lcnJvclJlYXNvbikpIHtcbiAgICAgICAgc29mdHdhcmVXZWJHTDEgPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMS5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAxIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHNvZnR3YXJlV2ViR0wxO1xuICAgIH1cbiAgfVxuXG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMScsIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViR0wyJywgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5zdXBwb3J0ZWQpO1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciByZXN1bHRzID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50SW5mbyhuYXZpZ2F0b3IudXNlckFnZW50KSxcbiAgICBuYXZpZ2F0b3I6IHtcbiAgICAgIGJ1aWxkSUQ6IG5hdmlnYXRvci5idWlsZElELFxuICAgICAgYXBwVmVyc2lvbjogbmF2aWdhdG9yLmFwcFZlcnNpb24sXG4gICAgICBvc2NwdTogbmF2aWdhdG9yLm9zY3B1LFxuICAgICAgcGxhdGZvcm06IG5hdmlnYXRvci5wbGF0Zm9ybSAgXG4gICAgfSxcbiAgICAvLyBkaXNwbGF5UmVmcmVzaFJhdGU6IGRpc3BsYXlSZWZyZXNoUmF0ZSwgLy8gV2lsbCBiZSBhc3luY2hyb25vdXNseSBmaWxsZWQgaW4gb24gZmlyc3QgcnVuLCBkaXJlY3RseSBmaWxsZWQgaW4gbGF0ZXIuXG4gICAgZGlzcGxheToge1xuICAgICAgd2luZG93RGV2aWNlUGl4ZWxSYXRpbzogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBzY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoLFxuICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW4uaGVpZ2h0LFxuICAgICAgcGh5c2ljYWxTY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBwaHlzaWNhbFNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLCAgXG4gICAgfSxcbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSwgLy8gSWYgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoaXMsIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIGJ5IGNvcmUgZXN0aW1hdG9yLlxuICAgIGFwaVN1cHBvcnQ6IGFwaXMsXG4gICAgdHlwZWRBcnJheUVuZGlhbm5lc3M6IGVuZGlhbm5lc3MoKVxuICB9O1xuXG4gIC8vIFNvbWUgZmllbGRzIGV4aXN0IGRvbid0IGFsd2F5cyBleGlzdFxuICB2YXIgb3B0aW9uYWxGaWVsZHMgPSBbJ3ZlbmRvcicsICd2ZW5kb3JTdWInLCAncHJvZHVjdCcsICdwcm9kdWN0U3ViJywgJ2xhbmd1YWdlJywgJ2FwcENvZGVOYW1lJywgJ2FwcE5hbWUnLCAnbWF4VG91Y2hQb2ludHMnLCAncG9pbnRlckVuYWJsZWQnLCAnY3B1Q2xhc3MnXTtcbiAgZm9yKHZhciBpIGluIG9wdGlvbmFsRmllbGRzKSB7XG4gICAgdmFyIGYgPSBvcHRpb25hbEZpZWxkc1tpXTtcbiAgICBpZiAobmF2aWdhdG9yW2ZdKSB7IHJlc3VsdHMubmF2aWdhdG9yW2ZdID0gbmF2aWdhdG9yW2ZdOyB9XG4gIH1cbi8qXG4gIGlmIChiZXN0R0xDb250ZXh0KSB7XG4gICAgcmVzdWx0cy5HTF9WRU5ET1IgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlZFTkRPUik7XG4gICAgcmVzdWx0cy5HTF9SRU5ERVJFUiA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuUkVOREVSRVIpO1xuICAgIHJlc3VsdHMuR0xfVkVSU0lPTiA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuVkVSU0lPTik7XG4gICAgcmVzdWx0cy5HTF9TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04gPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlNIQURJTkdfTEFOR1VBR0VfVkVSU0lPTik7XG4gICAgcmVzdWx0cy5HTF9NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuXG4gICAgdmFyIFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8gPSBiZXN0R0xDb250ZXh0LmdldEV4dGVuc2lvbignV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbycpO1xuICAgIGlmIChXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvKSB7XG4gICAgICByZXN1bHRzLkdMX1VOTUFTS0VEX1ZFTkRPUl9XRUJHTCA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8uVU5NQVNLRURfVkVORE9SX1dFQkdMKTtcbiAgICAgIHJlc3VsdHMuR0xfVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvLlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMKTtcbiAgICB9XG4gICAgcmVzdWx0cy5zdXBwb3J0ZWRXZWJHTEV4dGVuc2lvbnMgPSBiZXN0R0xDb250ZXh0LmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKTtcbiAgfVxuKi9cblxuICAvLyBTcGluIG9mZiB0aGUgYXN5bmNocm9ub3VzIHRhc2tzLlxuXG4gIHZhciBudW1Db3Jlc0NoZWNrZWQgPSBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSA+IDA7XG5cbiAgLy8gT24gZmlyc3QgcnVuLCBlc3RpbWF0ZSB0aGUgbnVtYmVyIG9mIGNvcmVzIGlmIG5lZWRlZC5cbiAgaWYgKCFudW1Db3Jlc0NoZWNrZWQpIHtcbiAgICBpZiAobmF2aWdhdG9yLmdldEhhcmR3YXJlQ29uY3VycmVuY3kpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KGZ1bmN0aW9uKGNvcmVzKSB7XG4gICAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IGNvcmVzO1xuICAgICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IGFzeW5jIHRhc2ssIGZpcmUgc3VjY2VzcyBjYWxsYmFjay5cbiAgICAgICAgaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSBpcyBub3Qgc3VwcG9ydGVkLCBhbmQgbm8gY29yZSBlc3RpbWF0b3IgYXZhaWxhYmxlIGVpdGhlci5cbiAgICAgIC8vIFJlcG9ydCBudW1iZXIgb2YgY29yZXMgYXMgMC5cbiAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IDA7XG4gICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGFzeW5jIHRhc2tzIHdlcmUgbmVlZGVkIHRvIGJlIGV4ZWN1dGVkLCBxdWV1ZSBzdWNjZXNzIGNhbGxiYWNrLlxuICBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc2V0VGltZW91dChmdW5jdGlvbigpIHsgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpOyB9LCAxKTtcblxuICAvLyBJZiBjYWxsZXIgaXMgbm90IGludGVyZXN0ZWQgaW4gYXN5bmNocm9ub3VzbHkgZmlsbGFibGUgZGF0YSwgYWxzbyByZXR1cm4gdGhlIHJlc3VsdHMgb2JqZWN0IGltbWVkaWF0ZWx5IGZvciB0aGUgc3luY2hyb25vdXMgYml0cy5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iLCJpbXBvcnQgYnJvd3NlckZlYXR1cmVzIGZyb20gJy4vYnJvd3NlckZlYXR1cmVzJztcbndpbmRvdy5vbmxvYWQgPSAoeCkgPT4ge1xuICAvL2NvbnNvbGUubG9nKGdwdVJlcG9ydCgpKTtcbiAgYnJvd3NlckZlYXR1cmVzKGZlYXR1cmVzID0+IGRhdGEuYnJvd3Nlcl9pbmZvID0gZmVhdHVyZXMpO1xufVxuXG5jb25zdCB0ZXN0cyA9IFtcbiAgLypcbiAge1xuICAgIFwiaWRcIjogXCJpbnN0YW5jaW5nXCIsXG4gICAgXCJlbmdpbmVcIjogXCJ0aHJlZS5qc1wiLFxuICAgIFwidXJsXCI6IFwidGhyZWVqcy9pbmRleC5odG1sXCIsXG4gICAgXCJuYW1lXCI6IFwiaW5zdGFuY2VkIGNpcmNsZSBiaWxsYm9hcmRzXCJcbiAgfSwqL1xuICB7XG4gICAgXCJpZFwiOiBcImJpbGxib2FyZF9wYXJ0aWNsZXNcIixcbiAgICBcImVuZ2luZVwiOiBcInRocmVlLmpzXCIsXG4gICAgXCJ1cmxcIjogXCJ0aHJlZWpzL2luZGV4Mi5odG1sXCIsXG4gICAgXCJuYW1lXCI6IFwiaW5zdGFuY2luZyBkZW1vIChzaW5nbGUgdHJpYW5nbGUpXCJcbiAgfSxcbiAge1xuICAgIFwiaWRcIjogXCJzaW1wbGVcIixcbiAgICBcImVuZ2luZVwiOiBcImJhYnlsb24uanNcIixcbiAgICBcInVybFwiOiBcImJhYnlsb24vc2ltcGxlLmh0bWxcIixcbiAgICBcIm5hbWVcIjogXCJzaW1wbGUgZXhhbXBsZVwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwicGxheWNhbnZhc1wiLFxuICAgIFwiZW5naW5lXCI6IFwicGxheWNhbnZhc1wiLFxuICAgIFwidXJsXCI6IFwicGxheWNhbnZhcy9hbmltYXRpb24uaHRtbFwiLFxuICAgIFwibmFtZVwiOiBcImFuaW1hdGlvbiBleGFtcGxlXCJcbiAgfVxuXTtcblxudmFyIGRhdGEgPSB7XG4gIHRlc3RzOiB0ZXN0cyxcbiAgc2hvd19qc29uOiBmYWxzZSxcbiAgYnJvd3Nlcl9pbmZvOiBudWxsLFxuICByZXN1bHRzOiBbXVxufTtcblxudmFyIGFwcCA9IG5ldyBWdWUoe1xuICBlbDogJyNhcHAnLFxuICBkYXRhOiBkYXRhLFxuICBtZXRob2RzOiB7XG4gICAgcnVuVGVzdDogZnVuY3Rpb24odGVzdCwgaW50ZXJhY3RpdmUpIHtcbiAgICAgIHJ1blRlc3QodGVzdC5pZCwgaW50ZXJhY3RpdmUpO1xuICAgIH0sXG4gICAgZ2V0QnJvd3NlckluZm86IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBkYXRhLmJyb3dzZXJfaW5mbyA/IEpTT04uc3RyaW5naWZ5KGRhdGEuYnJvd3Nlcl9pbmZvLCBudWxsLCA0KSA6ICdDaGVja2luZyBicm93c2VyIGZlYXR1cmVzLi4uJztcbiAgICB9XG4gIH1cbn0pOyAgICAgIFxuXG52YXIgdGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuXG5mdW5jdGlvbiBydW5TZWxlY3RlZFRlc3RzKCkge1xuICB0ZXN0c1F1ZXVlZFRvUnVuID0gWydiaWxsYm9hcmRfcGFydGljbGVzJywgJ3NpbXBsZScsICdwbGF5Y2FudmFzJ107XG4gIC8qXG4gIHRlc3RzUXVldWVkVG9SdW4gPSBnZXRTZWxlY3RlZFRlc3RzKCk7XG4gIHZhciBudW1UaW1lc1RvUnVuRWFjaFRlc3QgPSBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtVGltZXNUb1J1bkVhY2hUZXN0JykudmFsdWUpO1xuICBpZiAobnVtVGltZXNUb1J1bkVhY2hUZXN0ID4gMSkge1xuICAgIGlmIChudW1UaW1lc1RvUnVuRWFjaFRlc3QgPiAxMDAwMDApIG51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IDEwMDAwMDsgLy8gQXJiaXRyYXJ5IG1heCBjYXBcblxuICAgIHZhciBtdWx0aXBsZXMgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGVzdHNRdWV1ZWRUb1J1bi5sZW5ndGg7ICsraSkge1xuICAgICAgZm9yKHZhciBqID0gMDsgaiA8IG51bVRpbWVzVG9SdW5FYWNoVGVzdDsgKytqKSB7XG4gICAgICAgIG11bHRpcGxlcy5wdXNoKHRlc3RzUXVldWVkVG9SdW5baV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0ZXN0c1F1ZXVlZFRvUnVuID0gbXVsdGlwbGVzO1xuICB9XG4gICovXG4gcnVubmluZ1Rlc3RzSW5Qcm9ncmVzcyA9IHRydWU7XG4gcnVuTmV4dFF1ZXVlZFRlc3QoKTtcbn1cblxuZnVuY3Rpb24gcnVuTmV4dFF1ZXVlZFRlc3QoKSB7ICBcbiAgaWYgKHRlc3RzUXVldWVkVG9SdW4ubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgdmFyIHQgPSB0ZXN0c1F1ZXVlZFRvUnVuWyAwIF07XG4gIHRlc3RzUXVldWVkVG9SdW4uc3BsaWNlKDAsIDEpO1xuICBydW5UZXN0KHQsIGZhbHNlKTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHJ1blRlc3QoaWQsIGludGVyYWN0aXZlKSB7XG4gIHZhciB0ZXN0ID0gdGVzdHMuZmluZCh0ID0+IHQuaWQgPT09IGlkKTtcbiAgaWYgKCF0ZXN0KSB7XG4gICAgY29uc29sZS5lcnJvcignVGVzdCBub3QgZm91bmQsIGlkOicsIGlkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5sb2coJ1J1bm5pbmcgdGVzdDogJywgdGVzdC5uYW1lKTtcbiAgLypcbiAgY3VycmVudGx5UnVubmluZ1Rlc3QgPSB0ZXN0O1xuICBjdXJyZW50bHlSdW5uaW5nVGVzdC5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpO1xuICBjdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VdWlkID0gZ2VuZXJhdGVVVUlEKCk7XG4gIGN1cnJlbnRseVJ1bm5pbmdOb1ZzeW5jID0gbm9Wc3luYyAmJiB0ZXN0Lm5vVnN5bmM7XG4gIGN1cnJlbnRseVJ1bm5pbmdGYWtlR0wgPSBmYWtlR0w7XG4gIGN1cnJlbnRseVJ1bm5pbmdDcHVQcm9maWxlciA9IGNwdVByb2ZpbGVyO1xuICAqL1xuICB2YXIgdXJsID0gKGludGVyYWN0aXZlID8gJ3N0YXRpYy8nOiAndGVzdHMvJykgKyB0ZXN0LnVybDtcbiAgY29uc29sZS5sb2codXJsKTtcbiAgLypcbiAgZnVuY3Rpb24gYWRkR0VUKHVybCwgZ2V0KSB7XG4gICAgaWYgKHVybC5pbmRleE9mKCc/JykgIT0gLTEpIHJldHVybiB1cmwgKyAnJicgKyBnZXQ7XG4gICAgZWxzZSByZXR1cm4gdXJsICsgJz8nICsgZ2V0O1xuICB9XG4gIGlmICghaW50ZXJhY3RpdmUpIHVybCA9IGFkZEdFVCh1cmwsICdwbGF5YmFjaycpO1xuICBpZiAobm9Wc3luYyAmJiB0ZXN0Lm5vVnN5bmMpIHVybCA9IGFkZEdFVCh1cmwsICdub3ZzeW5jJyk7XG4gIGlmIChmYWtlR0wpIHVybCA9IGFkZEdFVCh1cmwsICdmYWtlZ2wnKTtcbiAgaWYgKGNwdVByb2ZpbGVyKSB1cmwgPSBhZGRHRVQodXJsLCAnY3B1cHJvZmlsZXInKTtcbiAgaWYgKHRlc3QubGVuZ3RoKSB1cmwgPSBhZGRHRVQodXJsLCAnbnVtZnJhbWVzPScgKyB0ZXN0Lmxlbmd0aCk7XG5cbiAgdmFyIHBhcmFsbGVsVG9ydHVyZU1vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFyYWxsZWxUb3J0dXJlTW9kZScpLmNoZWNrZWQ7XG4gIHZhciBudW1TcGF3bmVkV2luZG93cyA9IHBhcmFsbGVsVG9ydHVyZU1vZGUgPyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtUGFyYWxsZWxXaW5kb3dzJykudmFsdWUgOiAxO1xuICAqL1xuIHZhciBudW1TcGF3bmVkV2luZG93cyA9IDE7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBudW1TcGF3bmVkV2luZG93czsgKytpKSB7XG4gICAgd2luZG93Lm9wZW4odXJsKTtcbiAgfVxuICAvKlxuICB2YXIgZGF0YSA9IHtcbiAgICAnYnJvd3NlclV1aWQnOiBicm93c2VyVXVpZCxcbiAgICAna2V5JzogdGVzdC5rZXksXG4gICAgJ25hbWUnOiB0ZXN0Lm5hbWUsXG4gICAgJ3N0YXJ0VGltZSc6IG5ldyBEYXRlKCkueXl5eW1tZGRoaG1tc3MoKSxcbiAgICAncmVzdWx0JzogJ3VuZmluaXNoZWQnLFxuICAgICdub1ZzeW5jJzogbm9Wc3luYyxcbiAgICAnZmFrZUdMJzogZmFrZUdMLFxuICAgICdjcHVQcm9maWxlcic6IGNwdVByb2ZpbGVyLFxuICAgICdydW5VdWlkJzogY3VycmVudGx5UnVubmluZ1Rlc3QucnVuVXVpZCxcbiAgICAncnVuT3JkaW5hbCc6IGFsbFRlc3RSZXN1bHRzQnlLZXlbdGVzdC5rZXldID8gKGFsbFRlc3RSZXN1bHRzQnlLZXlbdGVzdC5rZXldLmxlbmd0aCArIDEpIDogMVxuICB9O1xuICBpZiAoYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mbyAmJiBicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvLnV1aWQpIGRhdGEuaGFyZHdhcmVVdWlkID0gYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mby51dWlkO1xuICByZXN1bHRzU2VydmVyX1N0b3JlVGVzdFN0YXJ0KGRhdGEpO1xuICAvLyBJZiBjaGFpbmluZyBwYXJhbGxlbCBhbmQgc2VxdWVudGlhbCB0b3J0dXJlIG1vZGVzLCB1bmNoZWNrIHRoZSBwYXJhbGxlbCB0b3J0dXJlIG1vZGUgY2hlY2tib3ggaWNvbiBzbyB0aGF0IHRoZSBuZXcgdGVzdHMgZG9uJ3QgbXVsdGlwbHkgd2hlbiBmaW5pc2hlZCFcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b3J0dXJlTW9kZScpLmNoZWNrZWQpIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXJhbGxlbFRvcnR1cmVNb2RlJykuY2hlY2tlZCA9IGZhbHNlO1xuICB1cGRhdGVOdW1QYXJhbGxlbFdpbmRvd3NFbmFibGVkKCk7XG4gICovXG59XG5cbnZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDo4ODg4JztcblxuZnVuY3Rpb24gaW5pdFNvY2tldCAoKSB7XG4gIHZhciBzb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG5cbiAgc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgfSk7XG4gIFxuICBzb2NrZXQub24oJ2JlbmNobWFya19maW5pc2hlZCcsIChyZXN1bHQpID0+IHtcbiAgICByZXN1bHQuanNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgNCk7XG4gICAgY29uc29sZS5sb2cocmVzdWx0Lmpzb24pO1xuICAgIGRhdGEucmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgcnVuTmV4dFF1ZXVlZFRlc3QoKTtcbiAgfSk7XG4gIFxuICBzb2NrZXQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgY29uc29sZS5sb2coZXJyb3IpO1xuICB9KTtcbiAgXG4gIHNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfSk7ICBcbn1cblxuaW5pdFNvY2tldCgpOyJdLCJuYW1lcyI6WyJ1c2VyQWdlbnRJbmZvIiwiYnJvd3NlckZlYXR1cmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Q0FDQTtDQUNBLFNBQVMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO0NBQ3RDLEVBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDbkQsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFO0NBQ2xDLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDL0QsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO0NBQ2pDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztDQUNuRCxDQUFDOztDQUVEO0NBQ0EsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTtDQUMvQixFQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUU7Q0FDeEMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDekUsRUFBRSxPQUFPLEtBQUssQ0FBQztDQUNmLENBQUM7OztDQUdEO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRTtDQUM3QixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDbkIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEI7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7Q0FDeEIsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN0QyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFhLElBQUksQ0FBQyxFQUFFO0NBQzdDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2hFLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztDQUNsQixLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzlDLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsR0FBRztDQUNILEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztDQUUzRDs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMs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
