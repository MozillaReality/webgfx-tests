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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsidXNlcmFnZW50LWluZm8uanMiLCJlbmRpYW5uZXNzLmpzIiwiYnJvd3NlckZlYXR1cmVzLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4vLyBUcmltcyB3aGl0ZXNwYWNlIGluIGVhY2ggc3RyaW5nIGZyb20gYW4gYXJyYXkgb2Ygc3RyaW5nc1xuZnVuY3Rpb24gdHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoYXJyKSB7XG4gIHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgudHJpbSgpOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhIGNvcHkgb2YgdGhlIGdpdmVuIGFycmF5IHdpdGggZW1wdHkvdW5kZWZpbmVkIHN0cmluZyBlbGVtZW50cyByZW1vdmVkIGluIGJldHdlZW5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RWxlbWVudHMoYXJyKSB7XG4gIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJiYgeC5sZW5ndGggPiAwOyB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgZW5jbG9zZWQgaW4gcGFyZW50aGVzZXMsIGUuZy4gaXMgb2YgZm9ybSBcIihzb21ldGhpbmcpXCJcbmZ1bmN0aW9uIGlzRW5jbG9zZWRJblBhcmVucyhzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PSAnKCcgJiYgc3RyW3N0ci5sZW5ndGgtMV0gPT0gJyknO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN1YnN0cmluZyBpcyBjb250YWluZWQgaW4gdGhlIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWlucyhzdHIsIHN1YnN0cikge1xuICByZXR1cm4gc3RyLmluZGV4T2Yoc3Vic3RyKSA+PSAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGFueSBvZiB0aGUgZ2l2ZW4gc3Vic3RyaW5ncyBpbiB0aGUgbGlzdCBpcyBjb250YWluZWQgaW4gdGhlIGZpcnN0IHBhcmFtZXRlciBzdHJpbmcgKGNhc2Ugc2Vuc2l0aXZlKVxuZnVuY3Rpb24gY29udGFpbnNBbnlPZihzdHIsIHN1YnN0ckxpc3QpIHtcbiAgZm9yKHZhciBpIGluIHN1YnN0ckxpc3QpIGlmIChjb250YWlucyhzdHIsIHN1YnN0ckxpc3RbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8vIFNwbGl0cyBhbiB1c2VyIGFnZW50IHN0cmluZyBsb2dpY2FsbHkgaW50byBhbiBhcnJheSBvZiB0b2tlbnMsIGUuZy5cbi8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuLy8gLT4gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKScsICdBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKScsICdDaHJvbWUvNTEuMC4yNzA0LjgxJywgJ01vYmlsZSBTYWZhcmkvNTM3LjM2J11cbmZ1bmN0aW9uIHNwbGl0VXNlckFnZW50KHN0cikge1xuICBzdHIgPSBzdHIudHJpbSgpO1xuICB2YXIgdWFMaXN0ID0gW107XG4gIHZhciB0b2tlbnMgPSAnJztcbiAgLy8gU3BsaXQgYnkgc3BhY2VzLCB3aGlsZSBrZWVwaW5nIHRvcCBsZXZlbCBwYXJlbnRoZXNlcyBpbnRhY3QsIHNvXG4gIC8vIFwiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xKSBNb2JpbGUgU2FmYXJpLzUzNy4zNlwiIGJlY29tZXNcbiAgLy8gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjEpJywgJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J11cbiAgdmFyIHBhcmVuc05lc3RpbmcgPSAwO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHN0cltpXSA9PSAnICcgJiYgcGFyZW5zTmVzdGluZyA9PSAwKSB7XG4gICAgICBpZiAodG9rZW5zLnRyaW0oKS5sZW5ndGggIT0gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG4gICAgICB0b2tlbnMgPSAnJztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PSAnKCcpICsrcGFyZW5zTmVzdGluZztcbiAgICBlbHNlIGlmIChzdHJbaV0gPT0gJyknKSAtLXBhcmVuc05lc3Rpbmc7XG4gICAgdG9rZW5zID0gdG9rZW5zICsgc3RyW2ldO1xuICB9XG4gIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCA+IDApIHVhTGlzdC5wdXNoKHRva2Vucy50cmltKCkpO1xuXG4gIC8vIFdoYXQgZm9sbG93cyBpcyBhIG51bWJlciBvZiBoZXVyaXN0aWMgYWRhcHRhdGlvbnMgdG8gYWNjb3VudCBmb3IgVUEgc3RyaW5ncyBtZXQgaW4gdGhlIHdpbGQ6XG5cbiAgLy8gRnVzZSBbJ2EvdmVyJywgJyhzb21laW5mbyknXSB0b2dldGhlci4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlICdBcHBsZVdlYktpdC81MzcuMzYnIGFuZCAnKEtIVE1MLCBsaWtlIEdlY2tvKScgdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMTsgaSA8IHVhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBsID0gdWFMaXN0W2ldO1xuICAgIGlmIChpc0VuY2xvc2VkSW5QYXJlbnMobCkgJiYgIWNvbnRhaW5zKGwsICc7JykgJiYgaSA+IDEpIHtcbiAgICAgIHVhTGlzdFtpLTFdID0gdWFMaXN0W2ktMV0gKyAnICcgKyBsO1xuICAgICAgdWFMaXN0W2ldID0gJyc7XG4gICAgfVxuICB9XG4gIHVhTGlzdCA9IHJlbW92ZUVtcHR5RWxlbWVudHModWFMaXN0KTtcblxuICAvLyBGdXNlIFsnZm9vJywgJ2Jhci92ZXInXSB0b2dldGhlciwgaWYgJ2ZvbycgaGFzIG9ubHkgYXNjaWkgY2hhcnMuIEZvciBleGFtcGxlOlxuICAvLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbiAgLy8gLT4gZnVzZSBbJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J10gdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHVhTGlzdC5sZW5ndGgtMTsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgdmFyIG5leHQgPSB1YUxpc3RbaSsxXTtcbiAgICBpZiAoL15bYS16QS1aXSskLy50ZXN0KGwpICYmIGNvbnRhaW5zKG5leHQsICcvJykpIHtcbiAgICAgIHVhTGlzdFtpKzFdID0gbCArICcgJyArIG5leHQ7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuICByZXR1cm4gdWFMaXN0O1xufVxuXG4vLyBGaW5kcyB0aGUgc3BlY2lhbCB0b2tlbiBpbiB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHBsYXRmb3JtIGluZm8uXG4vLyBUaGlzIGlzIHRoZSBmaXJzdCBlbGVtZW50IGNvbnRhaW5lZCBpbiBwYXJlbnRoZXNlcyB0aGF0IGhhcyBzZW1pY29sb24gZGVsaW1pdGVkIGVsZW1lbnRzLlxuLy8gUmV0dXJucyB0aGUgcGxhdGZvcm0gaW5mbyBhcyBhbiBhcnJheSBzcGxpdCBieSB0aGUgc2VtaWNvbG9ucy5cbmZ1bmN0aW9uIHNwbGl0UGxhdGZvcm1JbmZvKHVhTGlzdCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGl0ZW0gPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhpdGVtKSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5RWxlbWVudHModHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGgtMikuc3BsaXQoJzsnKSkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBEZWR1Y2VzIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGZyb20gdGhlIHVzZXIgYWdlbnQgcGxhdGZvcm0gaW5mbyB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gZmluZE9TKHVhUGxhdGZvcm1JbmZvKSB7XG4gIHZhciBvc2VzID0gWydBbmRyb2lkJywgJ0JTRCcsICdMaW51eCcsICdXaW5kb3dzJywgJ2lQaG9uZSBPUycsICdNYWMgT1MnLCAnQlNEJywgJ0NyT1MnLCAnRGFyd2luJywgJ0RyYWdvbmZseScsICdGZWRvcmEnLCAnR2VudG9vJywgJ1VidW50dScsICdkZWJpYW4nLCAnSFAtVVgnLCAnSVJJWCcsICdTdW5PUycsICdNYWNpbnRvc2gnLCAnV2luIDl4JywgJ1dpbjk4JywgJ1dpbjk1JywgJ1dpbk5UJ107XG4gIGZvcih2YXIgb3MgaW4gb3Nlcykge1xuICAgIGZvcih2YXIgaSBpbiB1YVBsYXRmb3JtSW5mbykge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtLCBvc2VzW29zXSkpIHJldHVybiBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gJ090aGVyJztcbn1cblxuLy8gRmlsdGVycyB0aGUgcHJvZHVjdCBjb21wb25lbnRzIChpdGVtcyBvZiBmb3JtYXQgJ2Zvby92ZXJzaW9uJykgZnJvbSB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gcGFyc2VQcm9kdWN0Q29tcG9uZW50cyh1YUxpc3QpIHtcbiAgdWFMaXN0ID0gdWFMaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiBjb250YWlucyh4LCAnLycpICYmICFpc0VuY2xvc2VkSW5QYXJlbnMoeCk7IH0pO1xuICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSB7fTtcbiAgZm9yKHZhciBpIGluIHVhTGlzdCkge1xuICAgIHZhciB4ID0gdWFMaXN0W2ldO1xuICAgIGlmIChjb250YWlucyh4LCAnLycpKSB7XG4gICAgICB4ID0geC5zcGxpdCgnLycpO1xuICAgICAgaWYgKHgubGVuZ3RoICE9IDIpIHRocm93IHVhTGlzdFtpXTtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hbMF0udHJpbSgpXSA9IHhbMV0udHJpbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9kdWN0Q29tcG9uZW50c1t4XSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcm9kdWN0Q29tcG9uZW50cztcbn1cblxuLy8gTWFwcyBXaW5kb3dzIE5UIHZlcnNpb24gdG8gaHVtYW4tcmVhZGFibGUgV2luZG93cyBQcm9kdWN0IHZlcnNpb25cbmZ1bmN0aW9uIHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKHdpbk5UVmVyc2lvbikge1xuICB2YXIgdmVycyA9IHtcbiAgICAnNS4wJzogJzIwMDAnLFxuICAgICc1LjEnOiAnWFAnLFxuICAgICc1LjInOiAnWFAnLFxuICAgICc2LjAnOiAnVmlzdGEnLFxuICAgICc2LjEnOiAnNycsXG4gICAgJzYuMic6ICc4JyxcbiAgICAnNi4zJzogJzguMScsXG4gICAgJzEwLjAnOiAnMTAnXG4gIH1cbiAgaWYgKCF2ZXJzW3dpbk5UVmVyc2lvbl0pIHJldHVybiAnTlQgJyArIHdpbk5UVmVyc2lvbjtcbiAgcmV0dXJuIHZlcnNbd2luTlRWZXJzaW9uXTtcbn1cblxuLy8gVGhlIGZ1bGwgZnVuY3Rpb24gdG8gZGVjb21wb3NlIGEgZ2l2ZW4gdXNlciBhZ2VudCB0byB0aGUgaW50ZXJlc3RpbmcgbG9naWNhbCBpbmZvIGJpdHMuXG4vLyBcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZHVjZVVzZXJBZ2VudCh1c2VyQWdlbnQpIHtcbiAgdXNlckFnZW50ID0gdXNlckFnZW50IHx8IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciB1YSA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudCxcbiAgICBwcm9kdWN0Q29tcG9uZW50czoge30sXG4gICAgcGxhdGZvcm1JbmZvOiBbXVxuICB9O1xuXG4gIHRyeSB7XG4gICAgdmFyIHVhTGlzdCA9IHNwbGl0VXNlckFnZW50KHVzZXJBZ2VudCk7XG4gICAgdmFyIHVhUGxhdGZvcm1JbmZvID0gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KTtcbiAgICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCk7XG4gICAgdWEucHJvZHVjdENvbXBvbmVudHMgPSBwcm9kdWN0Q29tcG9uZW50cztcbiAgICB1YS5wbGF0Zm9ybUluZm8gPSB1YVBsYXRmb3JtSW5mbztcbiAgICB2YXIgdWFsID0gdXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBEZWR1Y2UgYXJjaCBhbmQgYml0bmVzc1xuICAgIHZhciBiMzJPbjY0ID0gWyd3b3c2NCddO1xuICAgIGlmIChjb250YWlucyh1YWwsICd3b3c2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gJzMyLW9uLTY0JztcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ3g4Nl82NCcsICdhbWQ2NCcsICdpYTY0JywgJ3dpbjY0JywgJ3g2NCddKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAncHBjNjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICdQUEMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnc3BhcmM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1NQQVJDJztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ2kzODYnLCAnaTQ4NicsICdpNTg2JywgJ2k2ODYnLCAneDg2J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ3g4Nic7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdhcm03JykgfHwgY29udGFpbnModWFsLCAnYW5kcm9pZCcpIHx8IGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgLy8gSGV1cmlzdGljOiBBc3N1bWUgYWxsIE9TIFggYXJlIDY0LWJpdCwgYWx0aG91Z2ggdGhpcyBpcyBub3QgY2VydGFpbi4gT24gT1MgWCwgNjQtYml0IGJyb3dzZXJzXG4gICAgLy8gZG9uJ3QgYWR2ZXJ0aXNlIGJlaW5nIDY0LWJpdC5cbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2ludGVsIG1hYyBvcycpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2Ugb3BlcmF0aW5nIHN5c3RlbVxuICAgIHZhciBvcyA9IGZpbmRPUyh1YVBsYXRmb3JtSW5mbyk7XG4gICAgdmFyIG0gPSBvcy5tYXRjaCgnKC4qKVxcXFxzK01hYyBPUyBYXFxcXHMrKC4qKScpO1xuICAgIGlmIChtKSB7XG4gICAgICB1YS5wbGF0Zm9ybSA9ICdNYWMnO1xuICAgICAgdWEuYXJjaCA9IG1bMV07XG4gICAgICB1YS5vcyA9ICdNYWMgT1MnO1xuICAgICAgdWEub3NWZXJzaW9uID0gbVsyXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdBbmRyb2lkXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zID0gJ0FuZHJvaWQnO1xuICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBvcy5tYXRjaCgnV2luZG93cyBOVFxcXFxzKyguKiknKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ1BDJztcbiAgICAgICAgdWEub3MgPSAnV2luZG93cyc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKG1bMV0pO1xuICAgICAgICBpZiAoIXVhLmFyY2gpIHVhLmFyY2ggPSAneDg2JztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBpZiAoY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUGhvbmUnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQYWQnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQb2QnKSB8fCBjb250YWlucyhvcywgJ2lQaG9uZScpIHx8IG9zLmluZGV4T2YoJ0NQVSBPUycpID09IDApIHtcbiAgICAgICAgbSA9IG9zLm1hdGNoKCcuKk9TICguKikgbGlrZSBNYWMgT1MgWCcpO1xuICAgICAgICBpZiAobSkge1xuICAgICAgICAgIHVhLnBsYXRmb3JtID0gdWFQbGF0Zm9ybUluZm9bMF07XG4gICAgICAgICAgdWEub3MgPSAnaU9TJztcbiAgICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgICB1YS5iaXRuZXNzID0gcGFyc2VJbnQodWEub3NWZXJzaW9uKSA+PSA3ID8gNjQgOiAzMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gIFxuICAgIGlmICghbSkge1xuICAgICAgbSA9IGNvbnRhaW5zKG9zLCAnQlNEJykgfHwgY29udGFpbnMob3MsICdMaW51eCcpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9IG9zLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIHVhLm9zID0gb3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZFByb2R1Y3QocHJvZHVjdENvbXBvbmVudHMsIHByb2R1Y3QpIHtcbiAgICAgIGZvcih2YXIgaSBpbiBwcm9kdWN0Q29tcG9uZW50cykge1xuICAgICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbaV0gPT0gcHJvZHVjdCkgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGh1bWFuLXJlYWRhYmxlIGJyb3dzZXIgdmVuZG9yLCBwcm9kdWN0IGFuZCB2ZXJzaW9uIG5hbWVzXG4gICAgdmFyIGJyb3dzZXJzID0gW1snU2Ftc3VuZ0Jyb3dzZXInLCAnU2Ftc3VuZyddLCBbJ0VkZ2UnLCAnTWljcm9zb2Z0J10sIFsnT1BSJywgJ09wZXJhJ10sIFsnQ2hyb21lJywgJ0dvb2dsZSddLCBbJ1NhZmFyaScsICdBcHBsZSddLCBbJ0ZpcmVmb3gnLCAnTW96aWxsYSddXTtcbiAgICBmb3IodmFyIGkgaW4gYnJvd3NlcnMpIHtcbiAgICAgIHZhciBiID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbYl0pIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9IGJyb3dzZXJzW2ldWzFdO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9IGJyb3dzZXJzW2ldWzBdO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ09QUicpIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ09wZXJhJztcbiAgICAgICAgaWYgKHVhLmJyb3dzZXJQcm9kdWN0ID09ICdUcmlkZW50JykgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IHByb2R1Y3RDb21wb25lbnRzW2JdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRGV0ZWN0IElFc1xuICAgIGlmICghdWEuYnJvd3NlclByb2R1Y3QpIHtcbiAgICAgIHZhciBtYXRjaElFID0gdXNlckFnZW50Lm1hdGNoKC9NU0lFXFxzKFtcXGQuXSspLyk7XG4gICAgICBpZiAobWF0Y2hJRSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSBtYXRjaElFWzFdO1xuICAgICAgfSBlbHNlIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mbywgJ1RyaWRlbnQvNy4wJykpIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9ICdNaWNyb3NvZnQnO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gIHVzZXJBZ2VudC5tYXRjaCgvcnY6KFtcXGQuXSspLylbMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIG1vYmlsZSBwbGF0Zm9ybSwgaWYgcHJlc2VudFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB1YVBsYXRmb3JtSW5mby5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIHZhciBpdGVtbCA9IGl0ZW0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtbCwgJ25leHVzJykgfHwgY29udGFpbnMoaXRlbWwsICdzYW1zdW5nJykpIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSBpdGVtO1xuICAgICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZHVjZSBmb3JtIGZhY3RvclxuICAgIGlmIChjb250YWlucyh1YWwsICd0YWJsZXQnKSB8fCBjb250YWlucyh1YWwsICdpcGFkJykpIHVhLmZvcm1GYWN0b3IgPSAnVGFibGV0JztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdtb2JpbGUnKSB8fCBjb250YWlucyh1YWwsICdpcGhvbmUnKSB8fCBjb250YWlucyh1YWwsICdpcG9kJykpIHVhLmZvcm1GYWN0b3IgPSAnTW9iaWxlJztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdzbWFydCB0dicpIHx8IGNvbnRhaW5zKHVhbCwgJ3NtYXJ0LXR2JykpIHVhLmZvcm1GYWN0b3IgPSAnVFYnO1xuICAgIGVsc2UgdWEuZm9ybUZhY3RvciA9ICdEZXNrdG9wJztcbiAgfSBjYXRjaChlKSB7XG4gICAgdWEuaW50ZXJuYWxFcnJvciA9ICdGYWlsZWQgdG8gcGFyc2UgdXNlciBhZ2VudCBzdHJpbmc6ICcgKyBlLnRvU3RyaW5nKCk7XG4gIH1cblxuICByZXR1cm4gdWE7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG4gIHZhciBoZWFwID0gbmV3IEFycmF5QnVmZmVyKDB4MTAwMDApO1xuICB2YXIgaTMyID0gbmV3IEludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MzIgPSBuZXcgVWludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MTYgPSBuZXcgVWludDE2QXJyYXkoaGVhcCk7XG4gIHUzMls2NF0gPSAweDdGRkYwMTAwO1xuICB2YXIgdHlwZWRBcnJheUVuZGlhbm5lc3M7XG4gIGlmICh1MTZbMTI4XSA9PT0gMHg3RkZGICYmIHUxNlsxMjldID09PSAweDAxMDApIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2JpZyBlbmRpYW4nO1xuICBlbHNlIGlmICh1MTZbMTI4XSA9PT0gMHgwMTAwICYmIHUxNlsxMjldID09PSAweDdGRkYpIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2xpdHRsZSBlbmRpYW4nO1xuICBlbHNlIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ3Vua25vd24hIChhIGJyb3dzZXIgYnVnPykgKHNob3J0IDE6ICcgKyB1MTZbMTI4XS50b1N0cmluZygxNikgKyAnLCBzaG9ydCAyOiAnICsgdTE2WzEyOV0udG9TdHJpbmcoMTYpICsgJyknO1xuICByZXR1cm4gdHlwZWRBcnJheUVuZGlhbm5lc3M7XG59XG4iLCJpbXBvcnQgdXNlckFnZW50SW5mbyBmcm9tICcuL3VzZXJhZ2VudC1pbmZvJztcbmltcG9ydCBlbmRpYW5uZXNzIGZyb20gJy4vZW5kaWFubmVzcyc7XG5cbnZhciB2c3luY0NoZWNrZWQgPSB0cnVlO1xuXG5mdW5jdGlvbiBwYWRMZW5ndGhMZWZ0KHMsIGxlbiwgY2gpIHtcbiAgaWYgKGNoID09PSB1bmRlZmluZWQpIGNoID0gJyAnO1xuICB3aGlsZShzLmxlbmd0aCA8IGxlbikgcyA9IGNoICsgcztcbiAgcmV0dXJuIHM7XG59XG5cbi8vIFBlcmZvcm1zIHRoZSBicm93c2VyIGZlYXR1cmUgdGVzdC4gSW1tZWRpYXRlbHkgcmV0dXJucyBhIEpTIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXN1bHRzIG9mIGFsbCBzeW5jaHJvbm91c2x5IGNvbXB1dGFibGUgZmllbGRzLCBhbmQgbGF1bmNoZXMgYXN5bmNocm9ub3VzXG4vLyB0YXNrcyB0aGF0IHBlcmZvcm0gdGhlIHJlbWFpbmluZyB0ZXN0cy4gT25jZSB0aGUgYXN5bmMgdGFza3MgaGF2ZSBmaW5pc2hlZCwgdGhlIGdpdmVuIHN1Y2Nlc3NDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQsIHdpdGggdGhlIGZ1bGwgYnJvd3NlciBmZWF0dXJlIHRlc3Rcbi8vIHJlc3VsdHMgb2JqZWN0IGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBicm93c2VyRmVhdHVyZVRlc3Qoc3VjY2Vzc0NhbGxiYWNrKSB7XG4gIHZhciBhcGlzID0ge307XG4gIGZ1bmN0aW9uIHNldEFwaVN1cHBvcnQoYXBpbmFtZSwgY21wKSB7XG4gICAgaWYgKGNtcCkgYXBpc1thcGluYW1lXSA9IHRydWU7XG4gICAgZWxzZSBhcGlzW2FwaW5hbWVdID0gZmFsc2U7XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdNYXRoLmltdWwoKScsIHR5cGVvZiBNYXRoLmltdWwgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnTWF0aC5mcm91bmQoKScsIHR5cGVvZiBNYXRoLmZyb3VuZCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdBcnJheUJ1ZmZlci50cmFuc2ZlcigpJywgdHlwZW9mIEFycmF5QnVmZmVyLnRyYW5zZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYiBBdWRpbycsIHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnUG9pbnRlciBMb2NrJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tc1JlcXVlc3RQb2ludGVyTG9jayk7XG4gIHNldEFwaVN1cHBvcnQoJ0Z1bGxzY3JlZW4gQVBJJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0RnVsbFNjcmVlbiB8fCBkb2N1bWVudC5ib2R5LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKTtcbiAgdmFyIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICB0cnkgeyBuZXcgQmxvYigpOyBoYXNCbG9iQ29uc3RydWN0b3IgPSB0cnVlOyB9IGNhdGNoKGUpIHsgfVxuICBzZXRBcGlTdXBwb3J0KCdCbG9iJywgaGFzQmxvYkNvbnN0cnVjdG9yKTtcbiAgaWYgKCFoYXNCbG9iQ29uc3RydWN0b3IpIHNldEFwaVN1cHBvcnQoJ0Jsb2JCdWlsZGVyJywgdHlwZW9mIEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgTW96QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBXZWJLaXRCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTaGFyZWRBcnJheUJ1ZmZlcicsIHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCduYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeScsIHR5cGVvZiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTSU1ELmpzJywgdHlwZW9mIFNJTUQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViIFdvcmtlcnMnLCB0eXBlb2YgV29ya2VyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ0dhbWVwYWQgQVBJJywgbmF2aWdhdG9yLmdldEdhbWVwYWRzIHx8IG5hdmlnYXRvci53ZWJraXRHZXRHYW1lcGFkcyk7XG4gIHZhciBoYXNJbmRleGVkREIgPSBmYWxzZTtcbiAgdHJ5IHsgaGFzSW5kZXhlZERCID0gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCc7IH0gY2F0Y2ggKGUpIHt9XG4gIHNldEFwaVN1cHBvcnQoJ0luZGV4ZWREQicsIGhhc0luZGV4ZWREQik7XG4gIHNldEFwaVN1cHBvcnQoJ1Zpc2liaWxpdHkgQVBJJywgdHlwZW9mIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKScsIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgncGVyZm9ybWFuY2Uubm93KCknLCB0eXBlb2YgcGVyZm9ybWFuY2UgIT09ICd1bmRlZmluZWQnICYmIHBlcmZvcm1hbmNlLm5vdyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlNvY2tldHMnLCB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlJUQycsIHR5cGVvZiBSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1velJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtc1JUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1ZpYnJhdGlvbiBBUEknLCBuYXZpZ2F0b3IudmlicmF0ZSk7XG4gIHNldEFwaVN1cHBvcnQoJ1NjcmVlbiBPcmllbnRhdGlvbiBBUEknLCB3aW5kb3cuc2NyZWVuICYmICh3aW5kb3cuc2NyZWVuLm9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubW96T3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi53ZWJraXRPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1zT3JpZW50YXRpb24pKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2VvbG9jYXRpb24gQVBJJywgbmF2aWdhdG9yLmdlb2xvY2F0aW9uKTtcbiAgc2V0QXBpU3VwcG9ydCgnQmF0dGVyeSBTdGF0dXMgQVBJJywgbmF2aWdhdG9yLmdldEJhdHRlcnkpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBc3NlbWJseScsIHR5cGVvZiBXZWJBc3NlbWJseSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJWUicsIHR5cGVvZiBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJYUicsIHR5cGVvZiBuYXZpZ2F0b3IueHIgIT09ICd1bmRlZmluZWQnKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhciB3ZWJHTFN1cHBvcnQgPSB7fTtcbiAgdmFyIGJlc3RHTENvbnRleHQgPSBudWxsOyAvLyBUaGUgR0wgY29udGV4dHMgYXJlIHRlc3RlZCBmcm9tIGJlc3QgdG8gd29yc3QgKG5ld2VzdCB0byBvbGRlc3QpLCBhbmQgdGhlIG1vc3QgZGVzaXJhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udGV4dCBpcyBzdG9yZWQgaGVyZSBmb3IgbGF0ZXIgdXNlLlxuICBmdW5jdGlvbiB0ZXN0V2ViR0xTdXBwb3J0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBlcnJvclJlYXNvbiA9ICcnO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvclwiLCBmdW5jdGlvbihlKSB7IGVycm9yUmVhc29uID0gZS5zdGF0dXNNZXNzYWdlOyB9LCBmYWxzZSk7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChjb250ZXh0TmFtZSwgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA/IHsgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdDogdHJ1ZSB9IDoge30pO1xuICAgIGlmIChjb250ZXh0ICYmICFlcnJvclJlYXNvbikge1xuICAgICAgaWYgKCFiZXN0R0xDb250ZXh0KSBiZXN0R0xDb250ZXh0ID0gY29udGV4dDtcbiAgICAgIHZhciByZXN1bHRzID0geyBzdXBwb3J0ZWQ6IHRydWUsIHBlcmZvcm1hbmNlQ2F2ZWF0OiAhZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCB9O1xuICAgICAgaWYgKGNvbnRleHROYW1lID09ICdleHBlcmltZW50YWwtd2ViZ2wnKSByZXN1bHRzWydleHBlcmltZW50YWwtd2ViZ2wnXSA9IHRydWU7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgZWxzZSByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCBlcnJvclJlYXNvbjogZXJyb3JSZWFzb24gfTtcbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbDInLCB0cnVlKTtcbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMiA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIGZhbHNlKTtcbiAgICBpZiAoc29mdHdhcmVXZWJHTDIuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMi5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAyIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHNvZnR3YXJlV2ViR0wyO1xuICAgIH1cbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbCcsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIGV4cGVyaW1lbnRhbFdlYkdMID0gdGVzdFdlYkdMU3VwcG9ydCgnZXhwZXJpbWVudGFsLXdlYmdsJywgdHJ1ZSk7XG4gICAgaWYgKGV4cGVyaW1lbnRhbFdlYkdMLnN1cHBvcnRlZCB8fCAoZXhwZXJpbWVudGFsV2ViR0wuZXJyb3JSZWFzb24gJiYgIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb24pKSB7XG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgZmFsc2UpO1xuICAgIGlmICghc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBmYWxzZSk7XG4gICAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhc29mdHdhcmVXZWJHTDEuZXJyb3JSZWFzb24pKSB7XG4gICAgICAgIHNvZnR3YXJlV2ViR0wxID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNvZnR3YXJlV2ViR0wxLnN1cHBvcnRlZCkge1xuICAgICAgc29mdHdhcmVXZWJHTDEuaGFyZHdhcmVFcnJvclJlYXNvbiA9IHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb247IC8vIENhcHR1cmUgdGhlIHJlYXNvbiB3aHkgaGFyZHdhcmUgV2ViR0wgMSBjb250ZXh0IGRpZCBub3Qgc3VjY2VlZC5cbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBzb2Z0d2FyZVdlYkdMMTtcbiAgICB9XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdXZWJHTDEnLCB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMicsIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKTtcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcmVzdWx0cyA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudEluZm8obmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgbmF2aWdhdG9yOiB7XG4gICAgICBidWlsZElEOiBuYXZpZ2F0b3IuYnVpbGRJRCxcbiAgICAgIGFwcFZlcnNpb246IG5hdmlnYXRvci5hcHBWZXJzaW9uLFxuICAgICAgb3NjcHU6IG5hdmlnYXRvci5vc2NwdSxcbiAgICAgIHBsYXRmb3JtOiBuYXZpZ2F0b3IucGxhdGZvcm0gIFxuICAgIH0sXG4gICAgLy8gZGlzcGxheVJlZnJlc2hSYXRlOiBkaXNwbGF5UmVmcmVzaFJhdGUsIC8vIFdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIG9uIGZpcnN0IHJ1biwgZGlyZWN0bHkgZmlsbGVkIGluIGxhdGVyLlxuICAgIGRpc3BsYXk6IHtcbiAgICAgIHdpbmRvd0RldmljZVBpeGVsUmF0aW86IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCxcbiAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCxcbiAgICAgIHBoeXNpY2FsU2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgcGh5c2ljYWxTY3JlZW5IZWlnaHQ6IHNjcmVlbi5oZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbywgIFxuICAgIH0sXG4gICAgaGFyZHdhcmVDb25jdXJyZW5jeTogbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksIC8vIElmIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGlzLCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGZpbGxlZCBpbiBieSBjb3JlIGVzdGltYXRvci5cbiAgICBhcGlTdXBwb3J0OiBhcGlzLFxuICAgIHR5cGVkQXJyYXlFbmRpYW5uZXNzOiBlbmRpYW5uZXNzKClcbiAgfTtcblxuICAvLyBTb21lIGZpZWxkcyBleGlzdCBkb24ndCBhbHdheXMgZXhpc3RcbiAgdmFyIG9wdGlvbmFsRmllbGRzID0gWyd2ZW5kb3InLCAndmVuZG9yU3ViJywgJ3Byb2R1Y3QnLCAncHJvZHVjdFN1YicsICdsYW5ndWFnZScsICdhcHBDb2RlTmFtZScsICdhcHBOYW1lJywgJ21heFRvdWNoUG9pbnRzJywgJ3BvaW50ZXJFbmFibGVkJywgJ2NwdUNsYXNzJ107XG4gIGZvcih2YXIgaSBpbiBvcHRpb25hbEZpZWxkcykge1xuICAgIHZhciBmID0gb3B0aW9uYWxGaWVsZHNbaV07XG4gICAgaWYgKG5hdmlnYXRvcltmXSkgeyByZXN1bHRzLm5hdmlnYXRvcltmXSA9IG5hdmlnYXRvcltmXTsgfVxuICB9XG4vKlxuICBpZiAoYmVzdEdMQ29udGV4dCkge1xuICAgIHJlc3VsdHMuR0xfVkVORE9SID0gYmVzdEdMQ29udGV4dC5nZXRQYXJhbWV0ZXIoYmVzdEdMQ29udGV4dC5WRU5ET1IpO1xuICAgIHJlc3VsdHMuR0xfUkVOREVSRVIgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlJFTkRFUkVSKTtcbiAgICByZXN1bHRzLkdMX1ZFUlNJT04gPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlZFUlNJT04pO1xuICAgIHJlc3VsdHMuR0xfU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OID0gYmVzdEdMQ29udGV4dC5nZXRQYXJhbWV0ZXIoYmVzdEdMQ29udGV4dC5TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04pO1xuICAgIHJlc3VsdHMuR0xfTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0Lk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTKTtcblxuICAgIHZhciBXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvID0gYmVzdEdMQ29udGV4dC5nZXRFeHRlbnNpb24oJ1dFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8nKTtcbiAgICBpZiAoV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbykge1xuICAgICAgcmVzdWx0cy5HTF9VTk1BU0tFRF9WRU5ET1JfV0VCR0wgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvLlVOTUFTS0VEX1ZFTkRPUl9XRUJHTCk7XG4gICAgICByZXN1bHRzLkdMX1VOTUFTS0VEX1JFTkRFUkVSX1dFQkdMID0gYmVzdEdMQ29udGV4dC5nZXRQYXJhbWV0ZXIoV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mby5VTk1BU0tFRF9SRU5ERVJFUl9XRUJHTCk7XG4gICAgfVxuICAgIHJlc3VsdHMuc3VwcG9ydGVkV2ViR0xFeHRlbnNpb25zID0gYmVzdEdMQ29udGV4dC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKCk7XG4gIH1cbiovXG5cbiAgLy8gU3BpbiBvZmYgdGhlIGFzeW5jaHJvbm91cyB0YXNrcy5cblxuICB2YXIgbnVtQ29yZXNDaGVja2VkID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgPiAwO1xuXG4gIC8vIE9uIGZpcnN0IHJ1biwgZXN0aW1hdGUgdGhlIG51bWJlciBvZiBjb3JlcyBpZiBuZWVkZWQuXG4gIGlmICghbnVtQ29yZXNDaGVja2VkKSB7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0SGFyZHdhcmVDb25jdXJyZW5jeShmdW5jdGlvbihjb3Jlcykge1xuICAgICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSBjb3JlcztcbiAgICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBhc3luYyB0YXNrLCBmaXJlIHN1Y2Nlc3MgY2FsbGJhY2suXG4gICAgICAgIGlmIChudW1Db3Jlc0NoZWNrZWQgJiYgc3VjY2Vzc0NhbGxiYWNrKSBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgaXMgbm90IHN1cHBvcnRlZCwgYW5kIG5vIGNvcmUgZXN0aW1hdG9yIGF2YWlsYWJsZSBlaXRoZXIuXG4gICAgICAvLyBSZXBvcnQgbnVtYmVyIG9mIGNvcmVzIGFzIDAuXG4gICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSAwO1xuICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcblxuICAgICAgaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBhc3luYyB0YXNrcyB3ZXJlIG5lZWRlZCB0byBiZSBleGVjdXRlZCwgcXVldWUgc3VjY2VzcyBjYWxsYmFjay5cbiAgaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTsgfSwgMSk7XG5cbiAgLy8gSWYgY2FsbGVyIGlzIG5vdCBpbnRlcmVzdGVkIGluIGFzeW5jaHJvbm91c2x5IGZpbGxhYmxlIGRhdGEsIGFsc28gcmV0dXJuIHRoZSByZXN1bHRzIG9iamVjdCBpbW1lZGlhdGVseSBmb3IgdGhlIHN5bmNocm9ub3VzIGJpdHMuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiaW1wb3J0IGJyb3dzZXJGZWF0dXJlcyBmcm9tICcuL2Jyb3dzZXJGZWF0dXJlcyc7XG53aW5kb3cub25sb2FkID0gKHgpID0+IHtcbiAgLy9jb25zb2xlLmxvZyhncHVSZXBvcnQoKSk7XG4gIGJyb3dzZXJGZWF0dXJlcyhmZWF0dXJlcyA9PiBkYXRhLmJyb3dzZXJfaW5mbyA9IGZlYXR1cmVzKTtcbn1cblxuY29uc3QgdGVzdHMgPSBbXG4gIC8qXG4gIHtcbiAgICBcImlkXCI6IFwiaW5zdGFuY2luZ1wiLFxuICAgIFwiZW5naW5lXCI6IFwidGhyZWUuanNcIixcbiAgICBcInVybFwiOiBcInRocmVlanMvaW5kZXguaHRtbFwiLFxuICAgIFwibmFtZVwiOiBcImluc3RhbmNlZCBjaXJjbGUgYmlsbGJvYXJkc1wiXG4gIH0sKi9cbiAge1xuICAgIFwiaWRcIjogXCJiaWxsYm9hcmRfcGFydGljbGVzXCIsXG4gICAgXCJlbmdpbmVcIjogXCJ0aHJlZS5qc1wiLFxuICAgIFwidXJsXCI6IFwidGhyZWVqcy9pbmRleDIuaHRtbFwiLFxuICAgIFwibmFtZVwiOiBcImluc3RhbmNpbmcgZGVtbyAoc2luZ2xlIHRyaWFuZ2xlKVwiXG4gIH0sXG4gIHtcbiAgICBcImlkXCI6IFwic2ltcGxlXCIsXG4gICAgXCJlbmdpbmVcIjogXCJiYWJ5bG9uLmpzXCIsXG4gICAgXCJ1cmxcIjogXCJiYWJ5bG9uL3NpbXBsZS5odG1sXCIsXG4gICAgXCJuYW1lXCI6IFwic2ltcGxlIGV4YW1wbGVcIlxuICB9LFxuICB7XG4gICAgXCJpZFwiOiBcInBsYXljYW52YXNcIixcbiAgICBcImVuZ2luZVwiOiBcInBsYXljYW52YXNcIixcbiAgICBcInVybFwiOiBcInBsYXljYW52YXMvYW5pbWF0aW9uLmh0bWxcIixcbiAgICBcIm5hbWVcIjogXCJhbmltYXRpb24gZXhhbXBsZVwiXG4gIH1cbl07XG5cbnZhciBkYXRhID0ge1xuICB0ZXN0czogdGVzdHMsXG4gIHNob3dfanNvbjogZmFsc2UsXG4gIGJyb3dzZXJfaW5mbzogbnVsbCxcbiAgcmVzdWx0czogW11cbn07XG5cbnZhciBhcHAgPSBuZXcgVnVlKHtcbiAgZWw6ICcjYXBwJyxcbiAgZGF0YTogZGF0YSxcbiAgbWV0aG9kczoge1xuICAgIHJ1blRlc3Q6IGZ1bmN0aW9uKHRlc3QsIGludGVyYWN0aXZlKSB7XG4gICAgICBydW5UZXN0KHRlc3QuaWQsIGludGVyYWN0aXZlKTtcbiAgICB9LFxuICAgIGdldEJyb3dzZXJJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZGF0YS5icm93c2VyX2luZm8gPyBKU09OLnN0cmluZ2lmeShkYXRhLmJyb3dzZXJfaW5mbywgbnVsbCwgNCkgOiAnQ2hlY2tpbmcgYnJvd3NlciBmZWF0dXJlcy4uLic7XG4gICAgfVxuICB9XG59KTsgICAgICBcblxudmFyIHRlc3RzUXVldWVkVG9SdW4gPSBbXTtcblxuZnVuY3Rpb24gcnVuU2VsZWN0ZWRUZXN0cygpIHtcbiAgdGVzdHNRdWV1ZWRUb1J1biA9IFsnYmlsbGJvYXJkX3BhcnRpY2xlcycsICdzaW1wbGUnLCAncGxheWNhbnZhcyddO1xuICAvKlxuICB0ZXN0c1F1ZXVlZFRvUnVuID0gZ2V0U2VsZWN0ZWRUZXN0cygpO1xuICB2YXIgbnVtVGltZXNUb1J1bkVhY2hUZXN0ID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bVRpbWVzVG9SdW5FYWNoVGVzdCcpLnZhbHVlKTtcbiAgaWYgKG51bVRpbWVzVG9SdW5FYWNoVGVzdCA+IDEpIHtcbiAgICBpZiAobnVtVGltZXNUb1J1bkVhY2hUZXN0ID4gMTAwMDAwKSBudW1UaW1lc1RvUnVuRWFjaFRlc3QgPSAxMDAwMDA7IC8vIEFyYml0cmFyeSBtYXggY2FwXG5cbiAgICB2YXIgbXVsdGlwbGVzID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRlc3RzUXVldWVkVG9SdW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBudW1UaW1lc1RvUnVuRWFjaFRlc3Q7ICsraikge1xuICAgICAgICBtdWx0aXBsZXMucHVzaCh0ZXN0c1F1ZXVlZFRvUnVuW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGVzdHNRdWV1ZWRUb1J1biA9IG11bHRpcGxlcztcbiAgfVxuICAqL1xuIHJ1bm5pbmdUZXN0c0luUHJvZ3Jlc3MgPSB0cnVlO1xuIHJ1bk5leHRRdWV1ZWRUZXN0KCk7XG59XG5cbmZ1bmN0aW9uIHJ1bk5leHRRdWV1ZWRUZXN0KCkgeyAgXG4gIGlmICh0ZXN0c1F1ZXVlZFRvUnVuLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gIHZhciB0ID0gdGVzdHNRdWV1ZWRUb1J1blsgMCBdO1xuICB0ZXN0c1F1ZXVlZFRvUnVuLnNwbGljZSgwLCAxKTtcbiAgcnVuVGVzdCh0LCBmYWxzZSk7XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBydW5UZXN0KGlkLCBpbnRlcmFjdGl2ZSkge1xuICB2YXIgdGVzdCA9IHRlc3RzLmZpbmQodCA9PiB0LmlkID09PSBpZCk7XG4gIGlmICghdGVzdCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1Rlc3Qgbm90IGZvdW5kLCBpZDonLCBpZCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUubG9nKCdSdW5uaW5nIHRlc3Q6ICcsIHRlc3QubmFtZSk7XG4gIC8qXG4gIGN1cnJlbnRseVJ1bm5pbmdUZXN0ID0gdGVzdDtcbiAgY3VycmVudGx5UnVubmluZ1Rlc3Quc3RhcnRUaW1lID0gbmV3IERhdGUoKTtcbiAgY3VycmVudGx5UnVubmluZ1Rlc3QucnVuVXVpZCA9IGdlbmVyYXRlVVVJRCgpO1xuICBjdXJyZW50bHlSdW5uaW5nTm9Wc3luYyA9IG5vVnN5bmMgJiYgdGVzdC5ub1ZzeW5jO1xuICBjdXJyZW50bHlSdW5uaW5nRmFrZUdMID0gZmFrZUdMO1xuICBjdXJyZW50bHlSdW5uaW5nQ3B1UHJvZmlsZXIgPSBjcHVQcm9maWxlcjtcbiAgKi9cbiAgdmFyIHVybCA9IChpbnRlcmFjdGl2ZSA/ICdzdGF0aWMvJzogJ3Rlc3RzLycpICsgdGVzdC51cmw7XG4gIGNvbnNvbGUubG9nKHVybCk7XG4gIC8qXG4gIGZ1bmN0aW9uIGFkZEdFVCh1cmwsIGdldCkge1xuICAgIGlmICh1cmwuaW5kZXhPZignPycpICE9IC0xKSByZXR1cm4gdXJsICsgJyYnICsgZ2V0O1xuICAgIGVsc2UgcmV0dXJuIHVybCArICc/JyArIGdldDtcbiAgfVxuICBpZiAoIWludGVyYWN0aXZlKSB1cmwgPSBhZGRHRVQodXJsLCAncGxheWJhY2snKTtcbiAgaWYgKG5vVnN5bmMgJiYgdGVzdC5ub1ZzeW5jKSB1cmwgPSBhZGRHRVQodXJsLCAnbm92c3luYycpO1xuICBpZiAoZmFrZUdMKSB1cmwgPSBhZGRHRVQodXJsLCAnZmFrZWdsJyk7XG4gIGlmIChjcHVQcm9maWxlcikgdXJsID0gYWRkR0VUKHVybCwgJ2NwdXByb2ZpbGVyJyk7XG4gIGlmICh0ZXN0Lmxlbmd0aCkgdXJsID0gYWRkR0VUKHVybCwgJ251bWZyYW1lcz0nICsgdGVzdC5sZW5ndGgpO1xuXG4gIHZhciBwYXJhbGxlbFRvcnR1cmVNb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhcmFsbGVsVG9ydHVyZU1vZGUnKS5jaGVja2VkO1xuICB2YXIgbnVtU3Bhd25lZFdpbmRvd3MgPSBwYXJhbGxlbFRvcnR1cmVNb2RlID8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bVBhcmFsbGVsV2luZG93cycpLnZhbHVlIDogMTtcbiAgKi9cbiB2YXIgbnVtU3Bhd25lZFdpbmRvd3MgPSAxO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgbnVtU3Bhd25lZFdpbmRvd3M7ICsraSkge1xuICAgIHdpbmRvdy5vcGVuKHVybCk7XG4gIH1cbiAgLypcbiAgdmFyIGRhdGEgPSB7XG4gICAgJ2Jyb3dzZXJVdWlkJzogYnJvd3NlclV1aWQsXG4gICAgJ2tleSc6IHRlc3Qua2V5LFxuICAgICduYW1lJzogdGVzdC5uYW1lLFxuICAgICdzdGFydFRpbWUnOiBuZXcgRGF0ZSgpLnl5eXltbWRkaGhtbXNzKCksXG4gICAgJ3Jlc3VsdCc6ICd1bmZpbmlzaGVkJyxcbiAgICAnbm9Wc3luYyc6IG5vVnN5bmMsXG4gICAgJ2Zha2VHTCc6IGZha2VHTCxcbiAgICAnY3B1UHJvZmlsZXInOiBjcHVQcm9maWxlcixcbiAgICAncnVuVXVpZCc6IGN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blV1aWQsXG4gICAgJ3J1bk9yZGluYWwnOiBhbGxUZXN0UmVzdWx0c0J5S2V5W3Rlc3Qua2V5XSA/IChhbGxUZXN0UmVzdWx0c0J5S2V5W3Rlc3Qua2V5XS5sZW5ndGggKyAxKSA6IDFcbiAgfTtcbiAgaWYgKGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8gJiYgYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mby51dWlkKSBkYXRhLmhhcmR3YXJlVXVpZCA9IGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8udXVpZDtcbiAgcmVzdWx0c1NlcnZlcl9TdG9yZVRlc3RTdGFydChkYXRhKTtcbiAgLy8gSWYgY2hhaW5pbmcgcGFyYWxsZWwgYW5kIHNlcXVlbnRpYWwgdG9ydHVyZSBtb2RlcywgdW5jaGVjayB0aGUgcGFyYWxsZWwgdG9ydHVyZSBtb2RlIGNoZWNrYm94IGljb24gc28gdGhhdCB0aGUgbmV3IHRlc3RzIGRvbid0IG11bHRpcGx5IHdoZW4gZmluaXNoZWQhXG4gIGlmIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9ydHVyZU1vZGUnKS5jaGVja2VkKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFyYWxsZWxUb3J0dXJlTW9kZScpLmNoZWNrZWQgPSBmYWxzZTtcbiAgdXBkYXRlTnVtUGFyYWxsZWxXaW5kb3dzRW5hYmxlZCgpO1xuICAqL1xufVxuXG52YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCc7XG5cbmZ1bmN0aW9uIGluaXRTb2NrZXQgKCkge1xuICB2YXIgc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuXG4gIHNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHRlc3Rpbmcgc2VydmVyJyk7XG4gIH0pO1xuICBcbiAgc29ja2V0Lm9uKCdiZW5jaG1hcmtfZmluaXNoZWQnLCAocmVzdWx0KSA9PiB7XG4gICAgcmVzdWx0Lmpzb24gPSBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDQpO1xuICAgIGNvbnNvbGUubG9nKHJlc3VsdC5qc29uKTtcbiAgICBkYXRhLnJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgIHJ1bk5leHRRdWV1ZWRUZXN0KCk7XG4gIH0pO1xuICBcbiAgc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgfSk7XG4gIFxuICBzb2NrZXQub24oJ2Nvbm5lY3RfZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gIH0pOyAgXG59XG5cbmluaXRTb2NrZXQoKTsiXSwibmFtZXMiOlsidXNlckFnZW50SW5mbyIsImJyb3dzZXJGZWF0dXJlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQ0E7Q0FDQSxTQUFTLHVCQUF1QixDQUFDLEdBQUcsRUFB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QyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDbkQsTUFBTSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsTUFBTSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDckMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtDQUNsRSxRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDeEIsUUFBUSxNQUFNO0NBQ2QsT0FBTztDQUNQLEtBQUs7O0NBRUw7Q0FDQSxJQUFJLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0NBQ25GLFNBQVMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztDQUNuSCxTQUFTLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0NBQzFGLFNBQVMsRUFBRSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Q0FDbkMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0NBQ2IsSUFBSSxFQUFFLENBQUMsYUFBYSxHQUFHLHFDQUFxQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztDQUM1RSxHQUFHOztDQUVILEVBQUUsT0FBTyxFQUFFLENBQUM7Q0FD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
