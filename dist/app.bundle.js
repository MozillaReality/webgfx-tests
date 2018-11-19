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

	function estimateVSyncRate() {
	  return new Promise (resolve => {
	    var numFramesToRun = 60;
	    var t0 = performance.now();
	    var deltas = [];
	    function tick() {
	      var t1 = performance.now();
	      deltas.push(t1-t0);
	      t0 = t1;
	      if (--numFramesToRun > 0) {
	        requestAnimationFrame(tick);
	      } else {
	        deltas.sort();
	        deltas = deltas.slice((deltas.length / 3)|0, ((2 * deltas.length + 2) / 3)|0);
	        var sum = 0;
	        for(var i in deltas) sum += deltas[i];
	        resolve(1000.0 / (sum/deltas.length));
	      }
	    }
	    requestAnimationFrame(tick);
	  });
	}

	function endianness() {
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

	  setApiSupport('Math_imul', typeof Math.imul !== 'undefined');
	  setApiSupport('Math_fround', typeof Math.fround !== 'undefined');  
	  setApiSupport('ArrayBuffer_transfer', typeof ArrayBuffer.transfer !== 'undefined');
	  setApiSupport('WebAudio', typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined');
	  setApiSupport('PointerLock', document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock);
	  setApiSupport('FullscreenAPI', document.body.requestFullscreen || document.body.msRequestFullscreen || document.body.mozRequestFullScreen || document.body.webkitRequestFullscreen);
	  var hasBlobConstructor = false;
	  try { new Blob(); hasBlobConstructor = true; } catch(e) { }
	  setApiSupport('Blob', hasBlobConstructor);
	  if (!hasBlobConstructor) setApiSupport('BlobBuilder', typeof BlobBuilder !== 'undefined' || typeof MozBlobBuilder !== 'undefined' || typeof WebKitBlobBuilder !== 'undefined');
	  setApiSupport('SharedArrayBuffer', typeof SharedArrayBuffer !== 'undefined');
	  setApiSupport('hardwareConcurrency', typeof navigator.hardwareConcurrency !== 'undefined');
	  setApiSupport('SIMDjs', typeof SIMD !== 'undefined');
	  setApiSupport('WebWorkers', typeof Worker !== 'undefined');
	  setApiSupport('WebAssembly', typeof WebAssembly !== 'undefined');
	  setApiSupport('GamepadAPI', navigator.getGamepads || navigator.webkitGetGamepads);
	  var hasIndexedDB = false;
	  try { hasIndexedDB = typeof indexedDB !== 'undefined'; } catch (e) {}
	  setApiSupport('IndexedDB', hasIndexedDB);
	  setApiSupport('VisibilityAPI', typeof document.visibilityState !== 'undefined' || typeof document.hidden !== 'undefined');
	  setApiSupport('requestAnimationFrame', typeof requestAnimationFrame !== 'undefined');
	  setApiSupport('performance_now', typeof performance !== 'undefined' && performance.now);
	  setApiSupport('WebSockets', typeof WebSocket !== 'undefined');
	  setApiSupport('WebRTC', typeof RTCPeerConnection !== 'undefined' || typeof mozRTCPeerConnection !== 'undefined' || typeof webkitRTCPeerConnection !== 'undefined' || typeof msRTCPeerConnection !== 'undefined');
	  setApiSupport('VibrationAPI', navigator.vibrate);
	  setApiSupport('ScreenOrientationAPI', window.screen && (window.screen.orientation || window.screen.mozOrientation || window.screen.webkitOrientation || window.screen.msOrientation));
	  setApiSupport('GeolocationAPI', navigator.geolocation);
	  setApiSupport('BatteryStatusAPI', navigator.getBattery);
	  setApiSupport('WebAssembly', typeof WebAssembly !== 'undefined');
	  setApiSupport('WebVR', typeof navigator.getVRDisplays !== 'undefined');
	  setApiSupport('WebXR', typeof navigator.xr !== 'undefined');
	  setApiSupport('OffscreenCanvas', typeof OffscreenCanvas !== 'undefined');
	  setApiSupport('WebComponents', 'registerElement' in document && 'import' in document.createElement('link') && 'content' in document.createElement('template'));

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
	    }
	  }
	*/
	  estimateVSyncRate().then(refreshRate => {
	    results.refreshRate = Math.round(refreshRate);
	    if (successCallback) successCallback(results);
	  });

	  // If none of the async tasks were needed to be executed, queue success callback.
	  // if (numCoresChecked && successCallback) setTimeout(function() { successCallback(results); }, 1);

	  // If caller is not interested in asynchronously fillable data, also return the results object immediately for the synchronous bits.
	  return results;
	}

	function getWebGLInfoByVersion(webglVersion) {
	  var report = {
	    webglVersion: webglVersion
	  };

	if ((webglVersion === 2 && !window.WebGL2RenderingContext) ||
	    (webglVersion === 1 && !window.WebGLRenderingContext)) {
	    // The browser does not support WebGL
	    report.contextName = "webgl not supported";
	    return report;
	}

	var canvas = document.createElement("canvas");
	var gl, contextName;
	var possibleNames = (webglVersion === 2) ? ["webgl2", "experimental-webgl2"] : ["webgl", "experimental-webgl"];
	for (var i=0;i<possibleNames.length;i++) {
	  var name = possibleNames[i];
	  gl = canvas.getContext(name, { stencil: true });
	  if (gl){
	      contextName = name;
	      break;
	  }
	}
	canvas.remove();
	if (!gl) {
	    report.contextName = "webgl supported but failed to initialize";
	    return report;
	}

	return Object.assign(report, {
	    contextName: contextName,
	    glVersion: gl.getParameter(gl.VERSION),
	    vendor: gl.getParameter(gl.VENDOR),
	    renderer: gl.getParameter(gl.RENDERER),
	    unMaskedVendor: getUnmaskedInfo(gl).vendor,
	    unMaskedRenderer: getUnmaskedInfo(gl).renderer,
	    angle: getAngle(gl),
	    antialias:  gl.getContextAttributes().antialias ? "Available" : "Not available",
	    majorPerformanceCaveat: getMajorPerformanceCaveat(contextName),
	    bits: {
	      redBits: gl.getParameter(gl.RED_BITS),
	      greenBits: gl.getParameter(gl.GREEN_BITS),
	      blueBits: gl.getParameter(gl.BLUE_BITS),
	      alphaBits: gl.getParameter(gl.ALPHA_BITS),
	      depthBits: gl.getParameter(gl.DEPTH_BITS),
	      stencilBits: gl.getParameter(gl.STENCIL_BITS)  
	    },
	    maximum: {
	      maxColorBuffers: getMaxColorBuffers(gl),
	      maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
	      maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
	      maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
	      maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
	      maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
	      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
	      maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
	      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
	      maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
	      maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),  
	      maxViewportDimensions: describeRange(gl.getParameter(gl.MAX_VIEWPORT_DIMS)),
	      maxAnisotropy: getMaxAnisotropy(gl),
	    },
	    aliasedLineWidthRange: describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)),
	    aliasedPointSizeRange: describeRange(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)),
	    shaders: {
	      vertexShaderBestPrecision: getBestFloatPrecision(gl.VERTEX_SHADER, gl),
	      fragmentShaderBestPrecision: getBestFloatPrecision(gl.FRAGMENT_SHADER, gl),
	      fragmentShaderFloatIntPrecision: getFloatIntPrecision(gl),
	      shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
	    },
	    extensions: gl.getSupportedExtensions()
	  });
	}

	function describeRange(value) {
	  return [value[0], value[1]];
	}

	function getUnmaskedInfo(gl) {
	  var unMaskedInfo = {
	      renderer: "",
	      vendor: ""
	  };
	  
	  var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
	  if (dbgRenderInfo != null) {
	      unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
	      unMaskedInfo.vendor   = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
	  }
	  
	  return unMaskedInfo;
	}

	function getMaxColorBuffers(gl) {
	  var maxColorBuffers = 1;
	  var ext = gl.getExtension("WEBGL_draw_buffers");
	  if (ext != null) 
	      maxColorBuffers = gl.getParameter(ext.MAX_DRAW_BUFFERS_WEBGL);
	  
	  return maxColorBuffers;
	}

	function getMajorPerformanceCaveat(contextName) {
	  // Does context creation fail to do a major performance caveat?
	  var canvas = document.body.appendChild(document.createElement("canvas"));
	  var gl = canvas.getContext(contextName, { failIfMajorPerformanceCaveat : true });
	  canvas.remove();

	  if (!gl) {
	      // Our original context creation passed.  This did not.
	      return "Yes";
	  }

	  if (typeof gl.getContextAttributes().failIfMajorPerformanceCaveat === "undefined") {
	      // If getContextAttributes() doesn"t include the failIfMajorPerformanceCaveat
	      // property, assume the browser doesn"t implement it yet.
	      return "Not implemented";
	  }
	  return "No";
	}

	function isPowerOfTwo(n) {
	  return (n !== 0) && ((n & (n - 1)) === 0);
	}

	function getAngle(gl) {
	  var lineWidthRange = describeRange(gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE));

	  // Heuristic: ANGLE is only on Windows, not in IE, and does not implement line width greater than one.
	  var angle = ((navigator.platform === "Win32") || (navigator.platform === "Win64")) &&
	      (gl.getParameter(gl.RENDERER) !== "Internet Explorer") &&
	      (lineWidthRange === describeRange([1,1]));

	  if (angle) {
	      // Heuristic: D3D11 backend does not appear to reserve uniforms like the D3D9 backend, e.g.,
	      // D3D11 may have 1024 uniforms per stage, but D3D9 has 254 and 221.
	      //
	      // We could also test for WEBGL_draw_buffers, but many systems do not have it yet
	      // due to driver bugs, etc.
	      if (isPowerOfTwo(gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS)) && isPowerOfTwo(gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS))) {
	          return "Yes, D3D11";
	      } else {
	          return "Yes, D3D9";
	      }
	  }

	  return "No";
	}

	function getMaxAnisotropy(gl) {
	  var e = gl.getExtension("EXT_texture_filter_anisotropic")
	          || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic")
	          || gl.getExtension("MOZ_EXT_texture_filter_anisotropic");

	  if (e) {
	      var max = gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	      // See Canary bug: https://code.google.com/p/chromium/issues/detail?id=117450
	      if (max === 0) {
	          max = 2;
	      }
	      return max;
	  }
	  return "n/a";
	}

	function formatPower(exponent, verbose) {
	  if (verbose) {
	      return "" + Math.pow(2, exponent);
	  } else {
	      return "2^" + exponent + "";
	  }
	}

	function getPrecisionDescription(precision, verbose) {
	  var verbosePart = verbose ? " bit mantissa" : "";
	  return "[-" + formatPower(precision.rangeMin, verbose) + ", " + formatPower(precision.rangeMax, verbose) + "] (" + precision.precision + verbosePart + ")"
	}

	function getBestFloatPrecision(shaderType, gl) {
	  var high = gl.getShaderPrecisionFormat(shaderType, gl.HIGH_FLOAT);
	  var medium = gl.getShaderPrecisionFormat(shaderType, gl.MEDIUM_FLOAT);
	  var low = gl.getShaderPrecisionFormat(shaderType, gl.LOW_FLOAT);

	  var best = high;
	  if (high.precision === 0) {
	      best = medium;
	  }

	  return {
	      high : getPrecisionDescription(high, true),
	      medium : getPrecisionDescription(medium, true),
	      low: getPrecisionDescription(low, true),
	      best: getPrecisionDescription(best, false)
	  }
	}

	function getFloatIntPrecision(gl) {
	  var high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
	  var s = (high.precision !== 0) ? "highp/" : "mediump/";

	  high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_INT);
	  s += (high.rangeMax !== 0) ? "highp" : "lowp";

	  return s;
	}

	var webglInfo = function() {
	  return {
	    webgl1: getWebGLInfoByVersion(1),
	    webgl2: getWebGLInfoByVersion(2)
	  }
	};

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var sha = createCommonjsModule(function (module, exports) {
	(function(Y){function C(c,a,b){var e=0,h=[],n=0,g,l,d,f,m,q,u,r,I=!1,v=[],w=[],t,y=!1,z=!1,x=-1;b=b||{};g=b.encoding||"UTF8";t=b.numRounds||1;if(t!==parseInt(t,10)||1>t)throw Error("numRounds must a integer >= 1");if("SHA-1"===c)m=512,q=K,u=Z,f=160,r=function(a){return a.slice()};else if(0===c.lastIndexOf("SHA-",0))if(q=function(a,b){return L(a,b,c)},u=function(a,b,h,e){var k,f;if("SHA-224"===c||"SHA-256"===c)k=(b+65>>>9<<4)+15,f=16;else if("SHA-384"===c||"SHA-512"===c)k=(b+129>>>10<<
	5)+31,f=32;else throw Error("Unexpected error in SHA-2 implementation");for(;a.length<=k;)a.push(0);a[b>>>5]|=128<<24-b%32;b=b+h;a[k]=b&4294967295;a[k-1]=b/4294967296|0;h=a.length;for(b=0;b<h;b+=f)e=L(a.slice(b,b+f),e,c);if("SHA-224"===c)a=[e[0],e[1],e[2],e[3],e[4],e[5],e[6]];else if("SHA-256"===c)a=e;else if("SHA-384"===c)a=[e[0].a,e[0].b,e[1].a,e[1].b,e[2].a,e[2].b,e[3].a,e[3].b,e[4].a,e[4].b,e[5].a,e[5].b];else if("SHA-512"===c)a=[e[0].a,e[0].b,e[1].a,e[1].b,e[2].a,e[2].b,e[3].a,e[3].b,e[4].a,
	e[4].b,e[5].a,e[5].b,e[6].a,e[6].b,e[7].a,e[7].b];else throw Error("Unexpected error in SHA-2 implementation");return a},r=function(a){return a.slice()},"SHA-224"===c)m=512,f=224;else if("SHA-256"===c)m=512,f=256;else if("SHA-384"===c)m=1024,f=384;else if("SHA-512"===c)m=1024,f=512;else throw Error("Chosen SHA variant is not supported");else if(0===c.lastIndexOf("SHA3-",0)||0===c.lastIndexOf("SHAKE",0)){var F=6;q=D;r=function(a){var c=[],e;for(e=0;5>e;e+=1)c[e]=a[e].slice();return c};x=1;if("SHA3-224"===
	c)m=1152,f=224;else if("SHA3-256"===c)m=1088,f=256;else if("SHA3-384"===c)m=832,f=384;else if("SHA3-512"===c)m=576,f=512;else if("SHAKE128"===c)m=1344,f=-1,F=31,z=!0;else if("SHAKE256"===c)m=1088,f=-1,F=31,z=!0;else throw Error("Chosen SHA variant is not supported");u=function(a,c,e,b,h){e=m;var k=F,f,g=[],n=e>>>5,l=0,d=c>>>5;for(f=0;f<d&&c>=e;f+=n)b=D(a.slice(f,f+n),b),c-=e;a=a.slice(f);for(c%=e;a.length<n;)a.push(0);f=c>>>3;a[f>>2]^=k<<f%4*8;a[n-1]^=2147483648;for(b=D(a,b);32*g.length<h;){a=b[l%
	5][l/5|0];g.push(a.b);if(32*g.length>=h)break;g.push(a.a);l+=1;0===64*l%e&&D(null,b);}return g};}else throw Error("Chosen SHA variant is not supported");d=M(a,g,x);l=A(c);this.setHMACKey=function(a,b,h){var k;if(!0===I)throw Error("HMAC key already set");if(!0===y)throw Error("Cannot set HMAC key after calling update");if(!0===z)throw Error("SHAKE is not supported for HMAC");g=(h||{}).encoding||"UTF8";b=M(b,g,x)(a);a=b.binLen;b=b.value;k=m>>>3;h=k/4-1;if(k<a/8){for(b=u(b,a,0,A(c),f);b.length<=h;)b.push(0);
	b[h]&=4294967040;}else if(k>a/8){for(;b.length<=h;)b.push(0);b[h]&=4294967040;}for(a=0;a<=h;a+=1)v[a]=b[a]^909522486,w[a]=b[a]^1549556828;l=q(v,l);e=m;I=!0;};this.update=function(a){var c,b,k,f=0,g=m>>>5;c=d(a,h,n);a=c.binLen;b=c.value;c=a>>>5;for(k=0;k<c;k+=g)f+m<=a&&(l=q(b.slice(k,k+g),l),f+=m);e+=f;h=b.slice(f>>>5);n=a%m;y=!0;};this.getHash=function(a,b){var k,g,d,m;if(!0===I)throw Error("Cannot call getHash after setting HMAC key");d=N(b);if(!0===z){if(-1===d.shakeLen)throw Error("shakeLen must be specified in options");
	f=d.shakeLen;}switch(a){case "HEX":k=function(a){return O(a,f,x,d)};break;case "B64":k=function(a){return P(a,f,x,d)};break;case "BYTES":k=function(a){return Q(a,f,x)};break;case "ARRAYBUFFER":try{g=new ArrayBuffer(0);}catch(p){throw Error("ARRAYBUFFER not supported by this environment");}k=function(a){return R(a,f,x)};break;default:throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");}m=u(h.slice(),n,e,r(l),f);for(g=1;g<t;g+=1)!0===z&&0!==f%32&&(m[m.length-1]&=16777215>>>24-f%32),m=u(m,f,
	0,A(c),f);return k(m)};this.getHMAC=function(a,b){var k,g,d,p;if(!1===I)throw Error("Cannot call getHMAC without first setting HMAC key");d=N(b);switch(a){case "HEX":k=function(a){return O(a,f,x,d)};break;case "B64":k=function(a){return P(a,f,x,d)};break;case "BYTES":k=function(a){return Q(a,f,x)};break;case "ARRAYBUFFER":try{k=new ArrayBuffer(0);}catch(v){throw Error("ARRAYBUFFER not supported by this environment");}k=function(a){return R(a,f,x)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");
	}g=u(h.slice(),n,e,r(l),f);p=q(w,A(c));p=u(g,f,m,p,f);return k(p)};}function b(c,a){this.a=c;this.b=a;}function O(c,a,b,e){var h="";a/=8;var n,g,d;d=-1===b?3:0;for(n=0;n<a;n+=1)g=c[n>>>2]>>>8*(d+n%4*b),h+="0123456789abcdef".charAt(g>>>4&15)+"0123456789abcdef".charAt(g&15);return e.outputUpper?h.toUpperCase():h}function P(c,a,b,e){var h="",n=a/8,g,d,p,f;f=-1===b?3:0;for(g=0;g<n;g+=3)for(d=g+1<n?c[g+1>>>2]:0,p=g+2<n?c[g+2>>>2]:0,p=(c[g>>>2]>>>8*(f+g%4*b)&255)<<16|(d>>>8*(f+(g+1)%4*b)&255)<<8|p>>>8*(f+
	(g+2)%4*b)&255,d=0;4>d;d+=1)8*g+6*d<=a?h+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(p>>>6*(3-d)&63):h+=e.b64Pad;return h}function Q(c,a,b){var e="";a/=8;var h,d,g;g=-1===b?3:0;for(h=0;h<a;h+=1)d=c[h>>>2]>>>8*(g+h%4*b)&255,e+=String.fromCharCode(d);return e}function R(c,a,b){a/=8;var e,h=new ArrayBuffer(a),d,g;g=new Uint8Array(h);d=-1===b?3:0;for(e=0;e<a;e+=1)g[e]=c[e>>>2]>>>8*(d+e%4*b)&255;return h}function N(c){var a={outputUpper:!1,b64Pad:"=",shakeLen:-1};c=c||{};
	a.outputUpper=c.outputUpper||!1;!0===c.hasOwnProperty("b64Pad")&&(a.b64Pad=c.b64Pad);if(!0===c.hasOwnProperty("shakeLen")){if(0!==c.shakeLen%8)throw Error("shakeLen must be a multiple of 8");a.shakeLen=c.shakeLen;}if("boolean"!==typeof a.outputUpper)throw Error("Invalid outputUpper formatting option");if("string"!==typeof a.b64Pad)throw Error("Invalid b64Pad formatting option");return a}function M(c,a,b){switch(a){case "UTF8":case "UTF16BE":case "UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");
	}switch(c){case "HEX":c=function(a,c,d){var g=a.length,l,p,f,m,q,u;if(0!==g%2)throw Error("String of HEX type must be in byte increments");c=c||[0];d=d||0;q=d>>>3;u=-1===b?3:0;for(l=0;l<g;l+=2){p=parseInt(a.substr(l,2),16);if(isNaN(p))throw Error("String of HEX type contains invalid characters");m=(l>>>1)+q;for(f=m>>>2;c.length<=f;)c.push(0);c[f]|=p<<8*(u+m%4*b);}return {value:c,binLen:4*g+d}};break;case "TEXT":c=function(c,h,d){var g,l,p=0,f,m,q,u,r,t;h=h||[0];d=d||0;q=d>>>3;if("UTF8"===a)for(t=-1===
	b?3:0,f=0;f<c.length;f+=1)for(g=c.charCodeAt(f),l=[],128>g?l.push(g):2048>g?(l.push(192|g>>>6),l.push(128|g&63)):55296>g||57344<=g?l.push(224|g>>>12,128|g>>>6&63,128|g&63):(f+=1,g=65536+((g&1023)<<10|c.charCodeAt(f)&1023),l.push(240|g>>>18,128|g>>>12&63,128|g>>>6&63,128|g&63)),m=0;m<l.length;m+=1){r=p+q;for(u=r>>>2;h.length<=u;)h.push(0);h[u]|=l[m]<<8*(t+r%4*b);p+=1;}else if("UTF16BE"===a||"UTF16LE"===a)for(t=-1===b?2:0,l="UTF16LE"===a&&1!==b||"UTF16LE"!==a&&1===b,f=0;f<c.length;f+=1){g=c.charCodeAt(f);
	!0===l&&(m=g&255,g=m<<8|g>>>8);r=p+q;for(u=r>>>2;h.length<=u;)h.push(0);h[u]|=g<<8*(t+r%4*b);p+=2;}return {value:h,binLen:8*p+d}};break;case "B64":c=function(a,c,d){var g=0,l,p,f,m,q,u,r,t;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");p=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==p&&p<a.length)throw Error("Invalid '=' found in base-64 string");c=c||[0];d=d||0;u=d>>>3;t=-1===b?3:0;for(p=0;p<a.length;p+=4){q=a.substr(p,4);for(f=m=0;f<q.length;f+=1)l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(q[f]),
	m|=l<<18-6*f;for(f=0;f<q.length-1;f+=1){r=g+u;for(l=r>>>2;c.length<=l;)c.push(0);c[l]|=(m>>>16-8*f&255)<<8*(t+r%4*b);g+=1;}}return {value:c,binLen:8*g+d}};break;case "BYTES":c=function(a,c,d){var g,l,p,f,m,q;c=c||[0];d=d||0;p=d>>>3;q=-1===b?3:0;for(l=0;l<a.length;l+=1)g=a.charCodeAt(l),m=l+p,f=m>>>2,c.length<=f&&c.push(0),c[f]|=g<<8*(q+m%4*b);return {value:c,binLen:8*a.length+d}};break;case "ARRAYBUFFER":try{c=new ArrayBuffer(0);}catch(e){throw Error("ARRAYBUFFER not supported by this environment");}c=
	function(a,c,d){var g,l,p,f,m,q;c=c||[0];d=d||0;l=d>>>3;m=-1===b?3:0;q=new Uint8Array(a);for(g=0;g<a.byteLength;g+=1)f=g+l,p=f>>>2,c.length<=p&&c.push(0),c[p]|=q[g]<<8*(m+f%4*b);return {value:c,binLen:8*a.byteLength+d}};break;default:throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");}return c}function y(c,a){return c<<a|c>>>32-a}function S(c,a){return 32<a?(a-=32,new b(c.b<<a|c.a>>>32-a,c.a<<a|c.b>>>32-a)):0!==a?new b(c.a<<a|c.b>>>32-a,c.b<<a|c.a>>>32-a):c}function w(c,a){return c>>>
	a|c<<32-a}function t(c,a){var k=null,k=new b(c.a,c.b);return k=32>=a?new b(k.a>>>a|k.b<<32-a&4294967295,k.b>>>a|k.a<<32-a&4294967295):new b(k.b>>>a-32|k.a<<64-a&4294967295,k.a>>>a-32|k.b<<64-a&4294967295)}function T(c,a){var k=null;return k=32>=a?new b(c.a>>>a,c.b>>>a|c.a<<32-a&4294967295):new b(0,c.a>>>a-32)}function aa(c,a,b){return c&a^~c&b}function ba(c,a,k){return new b(c.a&a.a^~c.a&k.a,c.b&a.b^~c.b&k.b)}function U(c,a,b){return c&a^c&b^a&b}function ca(c,a,k){return new b(c.a&a.a^c.a&k.a^a.a&
	k.a,c.b&a.b^c.b&k.b^a.b&k.b)}function da(c){return w(c,2)^w(c,13)^w(c,22)}function ea(c){var a=t(c,28),k=t(c,34);c=t(c,39);return new b(a.a^k.a^c.a,a.b^k.b^c.b)}function fa(c){return w(c,6)^w(c,11)^w(c,25)}function ga(c){var a=t(c,14),k=t(c,18);c=t(c,41);return new b(a.a^k.a^c.a,a.b^k.b^c.b)}function ha(c){return w(c,7)^w(c,18)^c>>>3}function ia(c){var a=t(c,1),k=t(c,8);c=T(c,7);return new b(a.a^k.a^c.a,a.b^k.b^c.b)}function ja(c){return w(c,17)^w(c,19)^c>>>10}function ka(c){var a=t(c,19),k=t(c,61);
	c=T(c,6);return new b(a.a^k.a^c.a,a.b^k.b^c.b)}function G(c,a){var b=(c&65535)+(a&65535);return ((c>>>16)+(a>>>16)+(b>>>16)&65535)<<16|b&65535}function la(c,a,b,e){var h=(c&65535)+(a&65535)+(b&65535)+(e&65535);return ((c>>>16)+(a>>>16)+(b>>>16)+(e>>>16)+(h>>>16)&65535)<<16|h&65535}function H(c,a,b,e,h){var d=(c&65535)+(a&65535)+(b&65535)+(e&65535)+(h&65535);return ((c>>>16)+(a>>>16)+(b>>>16)+(e>>>16)+(h>>>16)+(d>>>16)&65535)<<16|d&65535}function ma(c,a){var d,e,h;d=(c.b&65535)+(a.b&65535);e=(c.b>>>16)+
	(a.b>>>16)+(d>>>16);h=(e&65535)<<16|d&65535;d=(c.a&65535)+(a.a&65535)+(e>>>16);e=(c.a>>>16)+(a.a>>>16)+(d>>>16);return new b((e&65535)<<16|d&65535,h)}function na(c,a,d,e){var h,n,g;h=(c.b&65535)+(a.b&65535)+(d.b&65535)+(e.b&65535);n=(c.b>>>16)+(a.b>>>16)+(d.b>>>16)+(e.b>>>16)+(h>>>16);g=(n&65535)<<16|h&65535;h=(c.a&65535)+(a.a&65535)+(d.a&65535)+(e.a&65535)+(n>>>16);n=(c.a>>>16)+(a.a>>>16)+(d.a>>>16)+(e.a>>>16)+(h>>>16);return new b((n&65535)<<16|h&65535,g)}function oa(c,a,d,e,h){var n,g,l;n=(c.b&
	65535)+(a.b&65535)+(d.b&65535)+(e.b&65535)+(h.b&65535);g=(c.b>>>16)+(a.b>>>16)+(d.b>>>16)+(e.b>>>16)+(h.b>>>16)+(n>>>16);l=(g&65535)<<16|n&65535;n=(c.a&65535)+(a.a&65535)+(d.a&65535)+(e.a&65535)+(h.a&65535)+(g>>>16);g=(c.a>>>16)+(a.a>>>16)+(d.a>>>16)+(e.a>>>16)+(h.a>>>16)+(n>>>16);return new b((g&65535)<<16|n&65535,l)}function B(c,a){return new b(c.a^a.a,c.b^a.b)}function A(c){var a=[],d;if("SHA-1"===c)a=[1732584193,4023233417,2562383102,271733878,3285377520];else if(0===c.lastIndexOf("SHA-",0))switch(a=
	[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],d=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],c){case "SHA-224":break;case "SHA-256":a=d;break;case "SHA-384":a=[new b(3418070365,a[0]),new b(1654270250,a[1]),new b(2438529370,a[2]),new b(355462360,a[3]),new b(1731405415,a[4]),new b(41048885895,a[5]),new b(3675008525,a[6]),new b(1203062813,a[7])];break;case "SHA-512":a=[new b(d[0],4089235720),new b(d[1],2227873595),
	new b(d[2],4271175723),new b(d[3],1595750129),new b(d[4],2917565137),new b(d[5],725511199),new b(d[6],4215389547),new b(d[7],327033209)];break;default:throw Error("Unknown SHA variant");}else if(0===c.lastIndexOf("SHA3-",0)||0===c.lastIndexOf("SHAKE",0))for(c=0;5>c;c+=1)a[c]=[new b(0,0),new b(0,0),new b(0,0),new b(0,0),new b(0,0)];else throw Error("No SHA variants supported");return a}function K(c,a){var b=[],e,d,n,g,l,p,f;e=a[0];d=a[1];n=a[2];g=a[3];l=a[4];for(f=0;80>f;f+=1)b[f]=16>f?c[f]:y(b[f-
	3]^b[f-8]^b[f-14]^b[f-16],1),p=20>f?H(y(e,5),d&n^~d&g,l,1518500249,b[f]):40>f?H(y(e,5),d^n^g,l,1859775393,b[f]):60>f?H(y(e,5),U(d,n,g),l,2400959708,b[f]):H(y(e,5),d^n^g,l,3395469782,b[f]),l=g,g=n,n=y(d,30),d=e,e=p;a[0]=G(e,a[0]);a[1]=G(d,a[1]);a[2]=G(n,a[2]);a[3]=G(g,a[3]);a[4]=G(l,a[4]);return a}function Z(c,a,b,e){var d;for(d=(a+65>>>9<<4)+15;c.length<=d;)c.push(0);c[a>>>5]|=128<<24-a%32;a+=b;c[d]=a&4294967295;c[d-1]=a/4294967296|0;a=c.length;for(d=0;d<a;d+=16)e=K(c.slice(d,d+16),e);return e}function L(c,
	a,k){var e,h,n,g,l,p,f,m,q,u,r,t,v,w,y,A,z,x,F,B,C,D,E=[],J;if("SHA-224"===k||"SHA-256"===k)u=64,t=1,D=Number,v=G,w=la,y=H,A=ha,z=ja,x=da,F=fa,C=U,B=aa,J=d;else if("SHA-384"===k||"SHA-512"===k)u=80,t=2,D=b,v=ma,w=na,y=oa,A=ia,z=ka,x=ea,F=ga,C=ca,B=ba,J=V;else throw Error("Unexpected error in SHA-2 implementation");k=a[0];e=a[1];h=a[2];n=a[3];g=a[4];l=a[5];p=a[6];f=a[7];for(r=0;r<u;r+=1)16>r?(q=r*t,m=c.length<=q?0:c[q],q=c.length<=q+1?0:c[q+1],E[r]=new D(m,q)):E[r]=w(z(E[r-2]),E[r-7],A(E[r-15]),E[r-
	16]),m=y(f,F(g),B(g,l,p),J[r],E[r]),q=v(x(k),C(k,e,h)),f=p,p=l,l=g,g=v(n,m),n=h,h=e,e=k,k=v(m,q);a[0]=v(k,a[0]);a[1]=v(e,a[1]);a[2]=v(h,a[2]);a[3]=v(n,a[3]);a[4]=v(g,a[4]);a[5]=v(l,a[5]);a[6]=v(p,a[6]);a[7]=v(f,a[7]);return a}function D(c,a){var d,e,h,n,g=[],l=[];if(null!==c)for(e=0;e<c.length;e+=2)a[(e>>>1)%5][(e>>>1)/5|0]=B(a[(e>>>1)%5][(e>>>1)/5|0],new b(c[e+1],c[e]));for(d=0;24>d;d+=1){n=A("SHA3-");for(e=0;5>e;e+=1){h=a[e][0];var p=a[e][1],f=a[e][2],m=a[e][3],q=a[e][4];g[e]=new b(h.a^p.a^f.a^
	m.a^q.a,h.b^p.b^f.b^m.b^q.b);}for(e=0;5>e;e+=1)l[e]=B(g[(e+4)%5],S(g[(e+1)%5],1));for(e=0;5>e;e+=1)for(h=0;5>h;h+=1)a[e][h]=B(a[e][h],l[e]);for(e=0;5>e;e+=1)for(h=0;5>h;h+=1)n[h][(2*e+3*h)%5]=S(a[e][h],W[e][h]);for(e=0;5>e;e+=1)for(h=0;5>h;h+=1)a[e][h]=B(n[e][h],new b(~n[(e+1)%5][h].a&n[(e+2)%5][h].a,~n[(e+1)%5][h].b&n[(e+2)%5][h].b));a[0][0]=B(a[0][0],X[d]);}return a}var d,V,W,X;d=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,
	1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,
	2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];V=[new b(d[0],3609767458),new b(d[1],602891725),new b(d[2],3964484399),new b(d[3],2173295548),new b(d[4],4081628472),new b(d[5],3053834265),new b(d[6],2937671579),new b(d[7],3664609560),new b(d[8],2734883394),new b(d[9],1164996542),new b(d[10],1323610764),new b(d[11],3590304994),new b(d[12],4068182383),new b(d[13],991336113),new b(d[14],633803317),new b(d[15],3479774868),new b(d[16],2666613458),new b(d[17],944711139),new b(d[18],2341262773),
	new b(d[19],2007800933),new b(d[20],1495990901),new b(d[21],1856431235),new b(d[22],3175218132),new b(d[23],2198950837),new b(d[24],3999719339),new b(d[25],766784016),new b(d[26],2566594879),new b(d[27],3203337956),new b(d[28],1034457026),new b(d[29],2466948901),new b(d[30],3758326383),new b(d[31],168717936),new b(d[32],1188179964),new b(d[33],1546045734),new b(d[34],1522805485),new b(d[35],2643833823),new b(d[36],2343527390),new b(d[37],1014477480),new b(d[38],1206759142),new b(d[39],344077627),
	new b(d[40],1290863460),new b(d[41],3158454273),new b(d[42],3505952657),new b(d[43],106217008),new b(d[44],3606008344),new b(d[45],1432725776),new b(d[46],1467031594),new b(d[47],851169720),new b(d[48],3100823752),new b(d[49],1363258195),new b(d[50],3750685593),new b(d[51],3785050280),new b(d[52],3318307427),new b(d[53],3812723403),new b(d[54],2003034995),new b(d[55],3602036899),new b(d[56],1575990012),new b(d[57],1125592928),new b(d[58],2716904306),new b(d[59],442776044),new b(d[60],593698344),new b(d[61],
	3733110249),new b(d[62],2999351573),new b(d[63],3815920427),new b(3391569614,3928383900),new b(3515267271,566280711),new b(3940187606,3454069534),new b(4118630271,4000239992),new b(116418474,1914138554),new b(174292421,2731055270),new b(289380356,3203993006),new b(460393269,320620315),new b(685471733,587496836),new b(852142971,1086792851),new b(1017036298,365543100),new b(1126000580,2618297676),new b(1288033470,3409855158),new b(1501505948,4234509866),new b(1607167915,987167468),new b(1816402316,
	1246189591)];X=[new b(0,1),new b(0,32898),new b(2147483648,32906),new b(2147483648,2147516416),new b(0,32907),new b(0,2147483649),new b(2147483648,2147516545),new b(2147483648,32777),new b(0,138),new b(0,136),new b(0,2147516425),new b(0,2147483658),new b(0,2147516555),new b(2147483648,139),new b(2147483648,32905),new b(2147483648,32771),new b(2147483648,32770),new b(2147483648,128),new b(0,32778),new b(2147483648,2147483658),new b(2147483648,2147516545),new b(2147483648,32896),new b(0,2147483649),
	new b(2147483648,2147516424)];W=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];(module.exports&&(module.exports=C),exports=C);})(commonjsGlobal);
	});

	function generateUUID() {
	  if (window.crypto && window.crypto.getRandomValues) {
	    var buf = new Uint16Array(8);
	    window.crypto.getRandomValues(buf);
	    var S4 = function(num) { var ret = num.toString(16); while(ret.length < 4) ret = '0'+ret; return ret; };
	    return S4(buf[0])+S4(buf[1])+'-'+S4(buf[2])+'-'+S4(buf[3])+'-'+S4(buf[4])+'-'+S4(buf[5])+S4(buf[6])+S4(buf[7]);
	  } else {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	      return v.toString(16);
	    });
	  }
	}

	// Hashes the given text to a UUID string of form 'xxxxxxxx-yyyy-zzzz-wwww-aaaaaaaaaaaa'.
	function hashToUUID(text) {
	  var shaObj = new sha('SHA-256', 'TEXT');
	  shaObj.update(text);
	  var hash = new Uint8Array(shaObj.getHash('ARRAYBUFFER'));
	  
	  var n = '';
	  for(var i = 0; i < hash.byteLength/2; ++i) {
	    var s = (hash[i] ^ hash[i+8]).toString(16);
	    if (s.length == 1) s = '0' + s;
	    n += s;
	  }
	  return n.slice(0, 8) + '-' + n.slice(8, 12) + '-' + n.slice(12, 16) + '-' + n.slice(16, 20) + '-' + n.slice(20);
	}

	var resultsServerUrl = 'http://localhost:3333/';

	class ResultsServer {
	  constructor() {
	  }

	  storeStart(results) {
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", resultsServerUrl + "store_test_start", true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.send(JSON.stringify(results));
	    console.log('ResultsServer: Recorded test start to ' + resultsServerUrl + "store_test_start");
	  }

	  storeSystemInfo(results) {
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", resultsServerUrl + "store_system_info", true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.send(JSON.stringify(results));
	    console.log('ResultsServer: Uploaded system info to ' + resultsServerUrl + "store_system_info");
	  }

	  storeTestResults(results) {
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", resultsServerUrl + "store_test_results", true);
	    xhr.setRequestHeader("Content-Type", "application/json");
	    xhr.send(JSON.stringify(results));
	    console.log('ResultsServer: Recorded test finish to ' + resultsServerUrl + "store_test_results");
	  }  
	}

	var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

	var token = '%[a-f0-9]{2}';
	var singleMatcher = new RegExp(token, 'gi');
	var multiMatcher = new RegExp('(' + token + ')+', 'gi');

	function decodeComponents(components, split) {
		try {
			// Try to decode the entire string first
			return decodeURIComponent(components.join(''));
		} catch (err) {
			// Do nothing
		}

		if (components.length === 1) {
			return components;
		}

		split = split || 1;

		// Split the array in 2 parts
		var left = components.slice(0, split);
		var right = components.slice(split);

		return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
	}

	function decode(input) {
		try {
			return decodeURIComponent(input);
		} catch (err) {
			var tokens = input.match(singleMatcher);

			for (var i = 1; i < tokens.length; i++) {
				input = decodeComponents(tokens, i).join('');

				tokens = input.match(singleMatcher);
			}

			return input;
		}
	}

	function customDecodeURIComponent(input) {
		// Keep track of all the replacements and prefill the map with the `BOM`
		var replaceMap = {
			'%FE%FF': '\uFFFD\uFFFD',
			'%FF%FE': '\uFFFD\uFFFD'
		};

		var match = multiMatcher.exec(input);
		while (match) {
			try {
				// Decode as big chunks as possible
				replaceMap[match[0]] = decodeURIComponent(match[0]);
			} catch (err) {
				var result = decode(match[0]);

				if (result !== match[0]) {
					replaceMap[match[0]] = result;
				}
			}

			match = multiMatcher.exec(input);
		}

		// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
		replaceMap['%C2'] = '\uFFFD';

		var entries = Object.keys(replaceMap);

		for (var i = 0; i < entries.length; i++) {
			// Replace all decoded components
			var key = entries[i];
			input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
		}

		return input;
	}

	var decodeUriComponent = function (encodedURI) {
		if (typeof encodedURI !== 'string') {
			throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
		}

		try {
			encodedURI = encodedURI.replace(/\+/g, ' ');

			// Try the built in decoder first
			return decodeURIComponent(encodedURI);
		} catch (err) {
			// Fallback to a more advanced decoder
			return customDecodeURIComponent(encodedURI);
		}
	};

	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return (key, value, index) => {
					return value === null ? [
						encode(key, options),
						'[',
						index,
						']'
					].join('') : [
						encode(key, options),
						'[',
						encode(index, options),
						']=',
						encode(value, options)
					].join('');
				};
			case 'bracket':
				return (key, value) => {
					return value === null ? [encode(key, options), '[]'].join('') : [
						encode(key, options),
						'[]=',
						encode(value, options)
					].join('');
				};
			default:
				return (key, value) => {
					return value === null ? encode(key, options) : [
						encode(key, options),
						'=',
						encode(value, options)
					].join('');
				};
		}
	}

	function parserForArrayFormat(options) {
		let result;

		switch (options.arrayFormat) {
			case 'index':
				return (key, value, accumulator) => {
					result = /\[(\d*)\]$/.exec(key);

					key = key.replace(/\[\d*\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = {};
					}

					accumulator[key][result[1]] = value;
				};
			case 'bracket':
				return (key, value, accumulator) => {
					result = /(\[\])$/.exec(key);
					key = key.replace(/\[\]$/, '');

					if (!result) {
						accumulator[key] = value;
						return;
					}

					if (accumulator[key] === undefined) {
						accumulator[key] = [value];
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
			default:
				return (key, value, accumulator) => {
					if (accumulator[key] === undefined) {
						accumulator[key] = value;
						return;
					}

					accumulator[key] = [].concat(accumulator[key], value);
				};
		}
	}

	function encode(value, options) {
		if (options.encode) {
			return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
		}

		return value;
	}

	function decode$1(value, options) {
		if (options.decode) {
			return decodeUriComponent(value);
		}

		return value;
	}

	function keysSorter(input) {
		if (Array.isArray(input)) {
			return input.sort();
		}

		if (typeof input === 'object') {
			return keysSorter(Object.keys(input))
				.sort((a, b) => Number(a) - Number(b))
				.map(key => input[key]);
		}

		return input;
	}

	function extract(input) {
		const queryStart = input.indexOf('?');
		if (queryStart === -1) {
			return '';
		}

		return input.slice(queryStart + 1);
	}

	function parse(input, options) {
		options = Object.assign({decode: true, arrayFormat: 'none'}, options);

		const formatter = parserForArrayFormat(options);

		// Create an object with no prototype
		const ret = Object.create(null);

		if (typeof input !== 'string') {
			return ret;
		}

		input = input.trim().replace(/^[?#&]/, '');

		if (!input) {
			return ret;
		}

		for (const param of input.split('&')) {
			let [key, value] = param.replace(/\+/g, ' ').split('=');

			// Missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			value = value === undefined ? null : decode$1(value, options);

			formatter(decode$1(key, options), value, ret);
		}

		return Object.keys(ret).sort().reduce((result, key) => {
			const value = ret[key];
			if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
				// Sort object keys, not values
				result[key] = keysSorter(value);
			} else {
				result[key] = value;
			}

			return result;
		}, Object.create(null));
	}

	var extract_1 = extract;
	var parse_1 = parse;

	var stringify = (obj, options) => {
		if (!obj) {
			return '';
		}

		options = Object.assign({
			encode: true,
			strict: true,
			arrayFormat: 'none'
		}, options);

		const formatter = encoderForArrayFormat(options);
		const keys = Object.keys(obj);

		if (options.sort !== false) {
			keys.sort(options.sort);
		}

		return keys.map(key => {
			const value = obj[key];

			if (value === undefined) {
				return '';
			}

			if (value === null) {
				return encode(key, options);
			}

			if (Array.isArray(value)) {
				const result = [];

				for (const value2 of value.slice()) {
					if (value2 === undefined) {
						continue;
					}

					result.push(formatter(key, value2, result.length));
				}

				return result.join('&');
			}

			return encode(key, options) + '=' + encode(value, options);
		}).filter(x => x.length > 0).join('&');
	};

	var parseUrl = (input, options) => {
		const hashStart = input.indexOf('#');
		if (hashStart !== -1) {
			input = input.slice(0, hashStart);
		}

		return {
			url: input.split('?')[0] || '',
			query: parse(extract(input), options)
		};
	};

	var queryString = {
		extract: extract_1,
		parse: parse_1,
		stringify: stringify,
		parseUrl: parseUrl
	};

	function addGET(url, parameter) {
	  if (url.indexOf('?') != -1) return url + '&' + parameter;
	  else return url + '?' + parameter;
	}

	function yyyymmddhhmmss() {
	  var date = new Date();
	  var yyyy = date.getFullYear();
	  var mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1); // getMonth() is zero-based
	  var dd  = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
	  var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
	  var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
	  var sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
	  return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + sec;
	}

	var utils = {
	  addGET: addGET,
	  yyyymmddhhmmss: yyyymmddhhmmss
	};
	var utils_2 = utils.yyyymmddhhmmss;

	function generateUUID$1() {
	  if (window.crypto && window.crypto.getRandomValues) {
	    var buf = new Uint16Array(8);
	    window.crypto.getRandomValues(buf);
	    var S4 = function(num) { var ret = num.toString(16); while(ret.length < 4) ret = '0'+ret; return ret; };
	    return S4(buf[0])+S4(buf[1])+'-'+S4(buf[2])+'-'+S4(buf[3])+'-'+S4(buf[4])+'-'+S4(buf[5])+S4(buf[6])+S4(buf[7]);
	  } else {
	    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	      return v.toString(16);
	    });
	  }
	}

	const addGET$1 = utils.addGET;

	function buildTestURL(baseURL, test, mode, options, progress) {
	  var url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url;

	  if (mode !== 'interactive') {
	    if (test.numframes) url = addGET$1(url, 'num-frames=' + test.numframes);
	    if (test.windowsize) url = addGET$1(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);  
	    if (options.fakeWebGL) url = addGET$1(url, 'fake-webgl');
	  
	    if (mode === 'record') {
	      url = addGET$1(url, 'recording');
	    } else if (test.input && mode === 'replay') {
	      url = addGET$1(url, 'replay');
	      if (options.showKeys) url = addGET$1(url, 'show-keys');
	      if (options.showMouse) url = addGET$1(url, 'show-mouse');
	    }
	  
	    if (options.noCloseOnFail) url = addGET$1(url, 'no-close-on-fail');
	    if (test.skipReferenceImageTest) url = addGET$1(url, 'skip-reference-image-test');
	    if (test.referenceImage) url = addGET$1(url, 'reference-image');
	  
	    if (progress) {
	      url = addGET$1(url, 'order-test=' + progress.tests[test.id].current + '&total-test=' + progress.tests[test.id].total);
	      url = addGET$1(url, 'order-global=' + progress.currentGlobal + '&total-global=' + progress.totalGlobal);
	    }  
	  }
	  return url;
	}

	var common = {
	  buildTestURL: buildTestURL  
	};
	var common_1 = common.buildTestURL;

	function TestsManagerBrowser(tests, options) {
	  this.tests = tests;
	  this.options = options;
	  this.currentlyRunningTest = {};
	  this.testsQueuedToRun = [];
	  this.progress = null;
	}

	TestsManagerBrowser.prototype = {
	  runFiltered: function(filterFn, generalOptions, testsOptions) {
	    this.options = testsOptions;
	    this.selectedTests = this.tests.filter(filterFn);
	    const numTimesToRunEachTest = Math.min(Math.max(parseInt(generalOptions.numTimesToRunEachTest), 1), 1000); // Clamp
	    this.progress = {
	      totalGlobal: numTimesToRunEachTest * this.selectedTests.length,
	      currentGlobal: 1,
	      tests: {}
	    };
	      
	    this.testsQueuedToRun = [];
	  
	    for(var i = 0; i < this.selectedTests.length; i++) {
	      for(var j = 0; j < numTimesToRunEachTest; j++) {
	        this.testsQueuedToRun.push(this.selectedTests[i]);
	        this.progress.tests[this.selectedTests[i].id] = {
	          current: 1,
	          total: numTimesToRunEachTest
	        };
	      }
	    }
	  
	    this.runningTestsInProgress = true;
	  
	    console.log('Browser tests', this.testsQueuedToRun);
	    this.runNextQueuedTest();
	  },
	  runNextQueuedTest: function() {
	    if (this.testsQueuedToRun.length == 0) {
	      this.progress = null;
	      console.log('Finished!');
	      return false;
	    }
	    var t = this.testsQueuedToRun[ 0 ];
	    this.testsQueuedToRun.splice(0, 1);
	    this.runTest(t.id, 'replay', this.options);
	    return true;
	  },

	  runTest: function(id, mode, options) {
	    var test = this.tests.find(t => t.id === id);
	    if (!test) {
	      console.error('Test not found, id:', id);
	      return;
	    }
	    console.log('Running test:', test.name);

	    const baseURL = 'http://localhost:3000/';
	    const url = common_1(baseURL, test, mode, options, this.progress);
	  
	    this.currentlyRunningTest.test = test;
	    this.currentlyRunningTest.startTime = utils_2();
	    this.currentlyRunningTest.runUUID = generateUUID$1();
	    this.currentlyRunningTest.options = options;
	    
	    if (this.progress) {
	      this.progress.tests[id].current++;
	      this.progress.currentGlobal++;
	    }

	    window.open(url);
	  /*
	    var testData = {
	      'browserUUID': this.browserUUID,
	      'id': test.id,
	      'name': test.name,
	      'startTime': yyyymmddhhmmss(),
	      'result': 'unfinished',
	      //'FakeWebGL': data.options.fakeWebGL,
	      'runUUID': this.currentlyRunningTest.runUUID,
	      //!!!!!!!!!! 'runOrdinal': this.vueApp.resultsById[test.id] ? (this.vueApp.resultsById[test.id].length + 1) : 1
	    };
	  
	    //if (data.nativeSystemInfo && data.nativeSystemInfo.UUID) testData.hardwareUUID = data.nativeSystemInfo.UUID;
	    //this.resultsServer.storeStart(testData);
	  */
	  }
	  

	};

	const parameters = queryString.parse(location.search);

	const VERSION = '1.0';

	class TestApp {
	  parseParameters() {
	    const parameters = queryString.parse(location.search);
	    if (parameters['num-times']) {
	      this.vueApp.options.general.numTimesToRunEachTest = parseInt(parameters['num-times']);
	    }

	    if (typeof parameters['fake-webgl'] !== 'undefined') {
	      this.vueApp.options.tests.fakeWebGL = true;
	    }
	    
	    if (parameters['selected']) {
	      const selected = parameters['selected'].split(',');
	      this.vueApp.tests.forEach(test => test.selected = false);
	      selected.forEach(id => {
	        var test = this.vueApp.tests.find(test => test.id === id);
	        if (test) test.selected = true;
	      });
	    }

	  }

	  constructor(vueApp) {
	    console.log(`Test App v.${VERSION}`);

	    this.vueApp = vueApp;
	    this.tests = [];
	    this.isCurrentlyRunningTest = false;
	    this.browserUUID = null;
	    this.resultsServer = new ResultsServer();
	    this.testsQueuedToRun = [];

	    fetch('tests.json')
	      .then(response => { return response.json(); })
	      .then(json => {
	        json.forEach(test => {
	          test.selected = true;
	        });
	        this.tests = vueApp.tests = json;
	        this.testsManager = new TestsManagerBrowser(this.tests);

	        this.parseParameters();
	        this.autoRun();
	      });

	    this.initWSServer();

	    this.webglInfo = vueApp.webglInfo = webglInfo();
	    browserFeatureTest(features => {
	      this.browserInfo = vueApp.browserInfo = features;
	      this.onBrowserResultsReceived({});
	    });
	  }

	  initWSServer() {
	    var serverUrl = 'http://localhost:8888';

	    this.socket = io.connect(serverUrl);
	  
	    this.socket.on('connect', function(data) {
	      console.log('Connected to testing server');
	    });
	    
	    this.socket.on('benchmark_finished', (result) => {
	      result.json = JSON.stringify(result, null, 4);
	      var options = JSON.parse(JSON.stringify(this.vueApp.options.tests));

	      // To remove options 
	      delete options.fakeWebGL;
	      delete options.showKeys;
	      delete options.showMouse;
	      delete options.noCloseOnFail;

	      result.options = options;

	      var testResults = {
	        result: result
	      };
	      testResults.browserUUID = this.browserUUID;
	      testResults.startTime = this.testsManager.currentlyRunningTest.startTime;
	      testResults.fakeWebGL = this.testsManager.currentlyRunningTest.options.fakeWebGL;
	      //testResults.id = this.testsManager.currentlyRunningTest.id;
	      testResults.finishTime = utils_2();
	      testResults.name = this.testsManager.currentlyRunningTest.name;
	      testResults.runUUID = this.testsManager.currentlyRunningTest.runUUID;
	      //if (browserInfo.nativeSystemInfo && browserInfo.nativeSystemInfo.UUID) testResults.hardwareUUID = browserInfo.nativeSystemInfo.UUID;
	      testResults.runOrdinal = this.vueApp.resultsById[testResults.id] ? (this.vueApp.resultsById[testResults.id].length + 1) : 1;
	      this.resultsServer.storeTestResults(testResults);

	      // Accumulate results in dictionary.
	      //if (testResults.result != 'FAIL') 
	      {
	        if (!this.vueApp.resultsById[result.test_id]) this.vueApp.resultsById[result.test_id] = [];
	        this.vueApp.resultsById[result.test_id].push(testResults);
	      }

	      // Average
	      this.vueApp.resultsAverage = [];
	  
	      Object.keys(this.vueApp.resultsById).forEach(testID => {
	        var results = this.vueApp.resultsById[testID];
	        if (results.length > 1) {
	          var testResultsAverage = {};
	          testResultsAverage.test_id = `${testID} (${results.length} samples)`;
	        
	          function get70PercentAverage(getField) {
	            function get70PercentArray() {
	              function cmp(a, b) {
	                return getField(a) - getField(b);
	              }
	              if (results.length <= 3) return results.slice(0);
	              var frac = Math.round(0.7 * results.length);
	              var resultsC = results.slice(0);
	              resultsC.sort(cmp);
	              var numElementsToRemove = results.length - frac;
	              var numElementsToRemoveFront = Math.floor(numElementsToRemove/2);
	              var numElementsToRemoveBack = numElementsToRemove - numElementsToRemoveFront;
	              return resultsC.slice(numElementsToRemoveFront, resultsC.length - numElementsToRemoveBack);
	            }
	            var arr = get70PercentArray();
	            var total = 0;
	            for(var i = 0; i < arr.length; ++i) total += getField(arr[i]);
	            return total / arr.length;
	          }  
	          testResultsAverage.totalTime = get70PercentAverage(function(p) { return p.result.totalTime; });
	          testResultsAverage.cpuIdlePerc = get70PercentAverage(function(p) { return p.result.cpuIdlePerc; });
	          testResultsAverage.cpuIdleTime = get70PercentAverage(function(p) { return p.result.cpuIdleTime; });
	          testResultsAverage.cpuTime = get70PercentAverage(function(p) { return p.result.cpuTime; });
	          testResultsAverage.pageLoadTime = get70PercentAverage(function(p) { return p.result.pageLoadTime; });
	          testResultsAverage.avgFps = get70PercentAverage(function(p) { return p.result.avgFps; });
	          testResultsAverage.timeToFirstFrame = get70PercentAverage(function(p) { return p.result.timeToFirstFrame; });
	          testResultsAverage.numStutterEvents = get70PercentAverage(function(p) { return p.result.numStutterEvents; });
	          /*totalRenderTime     totalTime*/
	          this.vueApp.resultsAverage.push(testResultsAverage);
	        }
	      });

	      this.vueApp.results.push(result);
	      this.testsManager.runNextQueuedTest();
	    });
	    
	    this.socket.on('error', (error) => {
	      console.log(error);
	    });
	    
	    this.socket.on('connect_error', (error) => {
	      console.log(error);
	    });  
	  }

	  onBrowserResultsReceived() {
	    console.log('Browser UUID:', this.getBrowserUUID());
	    var systemInfo = {
	      browserUUID: this.browserUUID,
	      webglInfo: this.webglInfo,
	      browserInfo: this.browserInfo
	    };

	    this.resultsServer.storeSystemInfo(systemInfo);
	  }

	  runSelectedTests() {
	    this.testsManager.runFiltered(
	      x => x.selected, 
	      this.vueApp.options.general, 
	      this.vueApp.options.tests
	    );
	  }

	  getBrowserUUID() {
	    var hardwareUUID = '';
	    if (this.nativeSystemInfo && this.nativeSystemInfo.UUID) {
	      hardwareUUID = this.nativeSystemInfo.UUID;
	    } else {
	      hardwareUUID = localStorage.getItem('UUID');
	      if (!hardwareUUID) {
	        hardwareUUID = generateUUID();
	        localStorage.setItem('UUID', hardwareUUID);
	      }
	    }
	  
	    // We now have all the info to compute the browser UUID
	    var browserUUIDString = hardwareUUID + (this.browserInfo.userAgent.browserVersion || '') + (this.browserInfo.navigator.buildID || '');
	    this.browserUUID = hashToUUID(browserUUIDString);

	    return this.browserUUID;
	  }

	  autoRun() {
	    if (!this.isCurrentlyRunningTest && location.search.toLowerCase().indexOf('autorun') !== -1) {
	      this.runSelectedTests();
	    }
	  } 
	}

	var data = {
	  tests: [],
	  show_json: false,
	  browserInfo: null,
	  webglInfo: null,
	  nativeSystemInfo: {},
	  options: {
	    general: {
	      numTimesToRunEachTest: 1,
	    },
	    tests: {
	      fakeWebGL: false,
	      showKeys: false,
	      showMouse: false,
	      noCloseOnFail: false
	    }
	  },
	  results: [],
	  resultsAverage: [],
	  resultsById: {}
	};

	var testApp = null;

	window.onload = (x) => {
	  var vueApp = new Vue({
	    el: '#app',
	    data: data,
	    methods: {
	      prettyPrint(value) {
	        return prettyPrintJson.toHtml(value);
	      },
	      formatNumeric(value) {
	        return value.toFixed(2);
	      },
	      runTest: function(test, interactive, recording) {
	        testApp.testsQueuedToRun = [];
	        var mode = interactive ? 'interactive' : (recording ? 'record' : 'replay');
	        testApp.testsManager.runTest(test.id, mode, data.options.tests);
	      },
	      runSelectedTests: function() {
	        testApp.runSelectedTests();
	      },
	      getBrowserInfo: function () {
	        return data.browserInfo ? data.browserInfo : 'Checking browser features...';
	      }
	    }
	  });
	  
	  testApp = new TestApp(vueApp);

	};

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3VzZXJhZ2VudC1pbmZvL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3ZzeW5jLWVzdGltYXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItZmVhdHVyZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViZ2wtaW5mby9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9qc3NoYS9zcmMvc2hhLmpzIiwiLi4vc3JjL2Zyb250YXBwL3V1aWQuanMiLCIuLi9zcmMvZnJvbnRhcHAvcmVzdWx0cy1zZXJ2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vc3JjL2Zyb250YXBwL3V0aWxzLmpzIiwiLi4vc3JjL2Zyb250YXBwL1VVSUQuanMiLCIuLi9zcmMvbWFpbi90ZXN0c21hbmFnZXIvY29tbW9uLmpzIiwiLi4vc3JjL21haW4vdGVzdHNtYW5hZ2VyL2Jyb3dzZXIuanMiLCIuLi9zcmMvZnJvbnRhcHAvYXBwLmpzIiwiLi4vc3JjL2Zyb250YXBwL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRyaW1zIHdoaXRlc3BhY2UgaW4gZWFjaCBzdHJpbmcgZnJvbSBhbiBhcnJheSBvZiBzdHJpbmdzXG5mdW5jdGlvbiB0cmltU3BhY2VzSW5FYWNoRWxlbWVudChhcnIpIHtcbiAgcmV0dXJuIGFyci5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC50cmltKCk7IH0pO1xufVxuXG4vLyBSZXR1cm5zIGEgY29weSBvZiB0aGUgZ2l2ZW4gYXJyYXkgd2l0aCBlbXB0eS91bmRlZmluZWQgc3RyaW5nIGVsZW1lbnRzIHJlbW92ZWQgaW4gYmV0d2VlblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlFbGVtZW50cyhhcnIpIHtcbiAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAmJiB4Lmxlbmd0aCA+IDA7IH0pO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBlbmNsb3NlZCBpbiBwYXJlbnRoZXNlcywgZS5nLiBpcyBvZiBmb3JtIFwiKHNvbWV0aGluZylcIlxuZnVuY3Rpb24gaXNFbmNsb3NlZEluUGFyZW5zKHN0cikge1xuICByZXR1cm4gc3RyWzBdID09ICcoJyAmJiBzdHJbc3RyLmxlbmd0aC0xXSA9PSAnKSc7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3Vic3RyaW5nIGlzIGNvbnRhaW5lZCBpbiB0aGUgc3RyaW5nIChjYXNlIHNlbnNpdGl2ZSlcbmZ1bmN0aW9uIGNvbnRhaW5zKHN0ciwgc3Vic3RyKSB7XG4gIHJldHVybiBzdHIuaW5kZXhPZihzdWJzdHIpID49IDA7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgYW55IG9mIHRoZSBnaXZlbiBzdWJzdHJpbmdzIGluIHRoZSBsaXN0IGlzIGNvbnRhaW5lZCBpbiB0aGUgZmlyc3QgcGFyYW1ldGVyIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWluc0FueU9mKHN0ciwgc3Vic3RyTGlzdCkge1xuICBmb3IodmFyIGkgaW4gc3Vic3RyTGlzdCkgaWYgKGNvbnRhaW5zKHN0ciwgc3Vic3RyTGlzdFtpXSkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLy8gU3BsaXRzIGFuIHVzZXIgYWdlbnQgc3RyaW5nIGxvZ2ljYWxseSBpbnRvIGFuIGFycmF5IG9mIHRva2VucywgZS5nLlxuLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4vLyAtPiBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pJywgJ0FwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pJywgJ0Nocm9tZS81MS4wLjI3MDQuODEnLCAnTW9iaWxlIFNhZmFyaS81MzcuMzYnXVxuZnVuY3Rpb24gc3BsaXRVc2VyQWdlbnQoc3RyKSB7XG4gIHN0ciA9IHN0ci50cmltKCk7XG4gIHZhciB1YUxpc3QgPSBbXTtcbiAgdmFyIHRva2VucyA9ICcnO1xuICAvLyBTcGxpdCBieSBzcGFjZXMsIHdoaWxlIGtlZXBpbmcgdG9wIGxldmVsIHBhcmVudGhlc2VzIGludGFjdCwgc29cbiAgLy8gXCJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjEpIE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIgYmVjb21lc1xuICAvLyBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMSknLCAnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXVxuICB2YXIgcGFyZW5zTmVzdGluZyA9IDA7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoc3RyW2ldID09ICcgJyAmJiBwYXJlbnNOZXN0aW5nID09IDApIHtcbiAgICAgIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCAhPSAwKSB1YUxpc3QucHVzaCh0b2tlbnMudHJpbSgpKTtcbiAgICAgIHRva2VucyA9ICcnO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09ICcoJykgKytwYXJlbnNOZXN0aW5nO1xuICAgIGVsc2UgaWYgKHN0cltpXSA9PSAnKScpIC0tcGFyZW5zTmVzdGluZztcbiAgICB0b2tlbnMgPSB0b2tlbnMgKyBzdHJbaV07XG4gIH1cbiAgaWYgKHRva2Vucy50cmltKCkubGVuZ3RoID4gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG5cbiAgLy8gV2hhdCBmb2xsb3dzIGlzIGEgbnVtYmVyIG9mIGhldXJpc3RpYyBhZGFwdGF0aW9ucyB0byBhY2NvdW50IGZvciBVQSBzdHJpbmdzIG1ldCBpbiB0aGUgd2lsZDpcblxuICAvLyBGdXNlIFsnYS92ZXInLCAnKHNvbWVpbmZvKSddIHRvZ2V0aGVyLiBGb3IgZXhhbXBsZTpcbiAgLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4gIC8vIC0+IGZ1c2UgJ0FwcGxlV2ViS2l0LzUzNy4zNicgYW5kICcoS0hUTUwsIGxpa2UgR2Vja28pJyB0b2dldGhlclxuICBmb3IodmFyIGkgPSAxOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhsKSAmJiAhY29udGFpbnMobCwgJzsnKSAmJiBpID4gMSkge1xuICAgICAgdWFMaXN0W2ktMV0gPSB1YUxpc3RbaS0xXSArICcgJyArIGw7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuXG4gIC8vIEZ1c2UgWydmb28nLCAnYmFyL3ZlciddIHRvZ2V0aGVyLCBpZiAnZm9vJyBoYXMgb25seSBhc2NpaSBjaGFycy4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlIFsnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXSB0b2dldGhlclxuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aC0xOyArK2kpIHtcbiAgICB2YXIgbCA9IHVhTGlzdFtpXTtcbiAgICB2YXIgbmV4dCA9IHVhTGlzdFtpKzFdO1xuICAgIGlmICgvXlthLXpBLVpdKyQvLnRlc3QobCkgJiYgY29udGFpbnMobmV4dCwgJy8nKSkge1xuICAgICAgdWFMaXN0W2krMV0gPSBsICsgJyAnICsgbmV4dDtcbiAgICAgIHVhTGlzdFtpXSA9ICcnO1xuICAgIH1cbiAgfVxuICB1YUxpc3QgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHVhTGlzdCk7XG4gIHJldHVybiB1YUxpc3Q7XG59XG5cbi8vIEZpbmRzIHRoZSBzcGVjaWFsIHRva2VuIGluIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcGxhdGZvcm0gaW5mby5cbi8vIFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgY29udGFpbmVkIGluIHBhcmVudGhlc2VzIHRoYXQgaGFzIHNlbWljb2xvbiBkZWxpbWl0ZWQgZWxlbWVudHMuXG4vLyBSZXR1cm5zIHRoZSBwbGF0Zm9ybSBpbmZvIGFzIGFuIGFycmF5IHNwbGl0IGJ5IHRoZSBzZW1pY29sb25zLlxuZnVuY3Rpb24gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KSB7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCB1YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgaXRlbSA9IHVhTGlzdFtpXTtcbiAgICBpZiAoaXNFbmNsb3NlZEluUGFyZW5zKGl0ZW0pKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlRW1wdHlFbGVtZW50cyh0cmltU3BhY2VzSW5FYWNoRWxlbWVudChpdGVtLnN1YnN0cigxLCBpdGVtLmxlbmd0aC0yKS5zcGxpdCgnOycpKSk7XG4gICAgfVxuICB9XG59XG5cbi8vIERlZHVjZXMgdGhlIG9wZXJhdGluZyBzeXN0ZW0gZnJvbSB0aGUgdXNlciBhZ2VudCBwbGF0Zm9ybSBpbmZvIHRva2VuIGxpc3QuXG5mdW5jdGlvbiBmaW5kT1ModWFQbGF0Zm9ybUluZm8pIHtcbiAgdmFyIG9zZXMgPSBbJ0FuZHJvaWQnLCAnQlNEJywgJ0xpbnV4JywgJ1dpbmRvd3MnLCAnaVBob25lIE9TJywgJ01hYyBPUycsICdCU0QnLCAnQ3JPUycsICdEYXJ3aW4nLCAnRHJhZ29uZmx5JywgJ0ZlZG9yYScsICdHZW50b28nLCAnVWJ1bnR1JywgJ2RlYmlhbicsICdIUC1VWCcsICdJUklYJywgJ1N1bk9TJywgJ01hY2ludG9zaCcsICdXaW4gOXgnLCAnV2luOTgnLCAnV2luOTUnLCAnV2luTlQnXTtcbiAgZm9yKHZhciBvcyBpbiBvc2VzKSB7XG4gICAgZm9yKHZhciBpIGluIHVhUGxhdGZvcm1JbmZvKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW0sIG9zZXNbb3NdKSkgcmV0dXJuIGl0ZW07XG4gICAgfVxuICB9XG4gIHJldHVybiAnT3RoZXInO1xufVxuXG4vLyBGaWx0ZXJzIHRoZSBwcm9kdWN0IGNvbXBvbmVudHMgKGl0ZW1zIG9mIGZvcm1hdCAnZm9vL3ZlcnNpb24nKSBmcm9tIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QuXG5mdW5jdGlvbiBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCkge1xuICB1YUxpc3QgPSB1YUxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGNvbnRhaW5zKHgsICcvJykgJiYgIWlzRW5jbG9zZWRJblBhcmVucyh4KTsgfSk7XG4gIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHt9O1xuICBmb3IodmFyIGkgaW4gdWFMaXN0KSB7XG4gICAgdmFyIHggPSB1YUxpc3RbaV07XG4gICAgaWYgKGNvbnRhaW5zKHgsICcvJykpIHtcbiAgICAgIHggPSB4LnNwbGl0KCcvJyk7XG4gICAgICBpZiAoeC5sZW5ndGggIT0gMikgdGhyb3cgdWFMaXN0W2ldO1xuICAgICAgcHJvZHVjdENvbXBvbmVudHNbeFswXS50cmltKCldID0geFsxXS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hdID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHByb2R1Y3RDb21wb25lbnRzO1xufVxuXG4vLyBNYXBzIFdpbmRvd3MgTlQgdmVyc2lvbiB0byBodW1hbi1yZWFkYWJsZSBXaW5kb3dzIFByb2R1Y3QgdmVyc2lvblxuZnVuY3Rpb24gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUod2luTlRWZXJzaW9uKSB7XG4gIHZhciB2ZXJzID0ge1xuICAgICc1LjAnOiAnMjAwMCcsXG4gICAgJzUuMSc6ICdYUCcsXG4gICAgJzUuMic6ICdYUCcsXG4gICAgJzYuMCc6ICdWaXN0YScsXG4gICAgJzYuMSc6ICc3JyxcbiAgICAnNi4yJzogJzgnLFxuICAgICc2LjMnOiAnOC4xJyxcbiAgICAnMTAuMCc6ICcxMCdcbiAgfVxuICBpZiAoIXZlcnNbd2luTlRWZXJzaW9uXSkgcmV0dXJuICdOVCAnICsgd2luTlRWZXJzaW9uO1xuICByZXR1cm4gdmVyc1t3aW5OVFZlcnNpb25dO1xufVxuXG4vLyBUaGUgZnVsbCBmdW5jdGlvbiB0byBkZWNvbXBvc2UgYSBnaXZlbiB1c2VyIGFnZW50IHRvIHRoZSBpbnRlcmVzdGluZyBsb2dpY2FsIGluZm8gYml0cy5cbi8vIFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVkdWNlVXNlckFnZW50KHVzZXJBZ2VudCkge1xuICB1c2VyQWdlbnQgPSB1c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgdmFyIHVhID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50LFxuICAgIHByb2R1Y3RDb21wb25lbnRzOiB7fSxcbiAgICBwbGF0Zm9ybUluZm86IFtdXG4gIH07XG5cbiAgdHJ5IHtcbiAgICB2YXIgdWFMaXN0ID0gc3BsaXRVc2VyQWdlbnQodXNlckFnZW50KTtcbiAgICB2YXIgdWFQbGF0Zm9ybUluZm8gPSBzcGxpdFBsYXRmb3JtSW5mbyh1YUxpc3QpO1xuICAgIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHBhcnNlUHJvZHVjdENvbXBvbmVudHModWFMaXN0KTtcbiAgICB1YS5wcm9kdWN0Q29tcG9uZW50cyA9IHByb2R1Y3RDb21wb25lbnRzO1xuICAgIHVhLnBsYXRmb3JtSW5mbyA9IHVhUGxhdGZvcm1JbmZvO1xuICAgIHZhciB1YWwgPSB1c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIERlZHVjZSBhcmNoIGFuZCBiaXRuZXNzXG4gICAgdmFyIGIzMk9uNjQgPSBbJ3dvdzY0J107XG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3dvdzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAnMzItb24tNjQnO1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsneDg2XzY0JywgJ2FtZDY0JywgJ2lhNjQnLCAnd2luNjQnLCAneDY0J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdwcGM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1BQQyc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdzcGFyYzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAnU1BBUkMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsnaTM4NicsICdpNDg2JywgJ2k1ODYnLCAnaTY4NicsICd4ODYnXSkpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAneDg2JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2FybTcnKSB8fCBjb250YWlucyh1YWwsICdhbmRyb2lkJykgfHwgY29udGFpbnModWFsLCAnbW9iaWxlJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAvLyBIZXVyaXN0aWM6IEFzc3VtZSBhbGwgT1MgWCBhcmUgNjQtYml0LCBhbHRob3VnaCB0aGlzIGlzIG5vdCBjZXJ0YWluLiBPbiBPUyBYLCA2NC1iaXQgYnJvd3NlcnNcbiAgICAvLyBkb24ndCBhZHZlcnRpc2UgYmVpbmcgNjQtYml0LlxuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnaW50ZWwgbWFjIG9zJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2Uge1xuICAgICAgdWEuYml0bmVzcyA9IDMyO1xuICAgIH1cblxuICAgIC8vIERlZHVjZSBvcGVyYXRpbmcgc3lzdGVtXG4gICAgdmFyIG9zID0gZmluZE9TKHVhUGxhdGZvcm1JbmZvKTtcbiAgICB2YXIgbSA9IG9zLm1hdGNoKCcoLiopXFxcXHMrTWFjIE9TIFhcXFxccysoLiopJyk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHVhLnBsYXRmb3JtID0gJ01hYyc7XG4gICAgICB1YS5hcmNoID0gbVsxXTtcbiAgICAgIHVhLm9zID0gJ01hYyBPUyc7XG4gICAgICB1YS5vc1ZlcnNpb24gPSBtWzJdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gb3MubWF0Y2goJ0FuZHJvaWRcXFxccysoLiopJyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdBbmRyb2lkJztcbiAgICAgICAgdWEub3MgPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdXaW5kb3dzIE5UXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9ICdXaW5kb3dzJztcbiAgICAgICAgdWEub3NWZXJzaW9uID0gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUobVsxXSk7XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQaG9uZScpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBhZCcpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBvZCcpIHx8IGNvbnRhaW5zKG9zLCAnaVBob25lJykgfHwgb3MuaW5kZXhPZignQ1BVIE9TJykgPT0gMCkge1xuICAgICAgICBtID0gb3MubWF0Y2goJy4qT1MgKC4qKSBsaWtlIE1hYyBPUyBYJyk7XG4gICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgdWEucGxhdGZvcm0gPSB1YVBsYXRmb3JtSW5mb1swXTtcbiAgICAgICAgICB1YS5vcyA9ICdpT1MnO1xuICAgICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgICAgICAgIHVhLmJpdG5lc3MgPSBwYXJzZUludCh1YS5vc1ZlcnNpb24pID49IDcgPyA2NCA6IDMyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAgXG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gY29udGFpbnMob3MsICdCU0QnKSB8fCBjb250YWlucyhvcywgJ0xpbnV4Jyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdQQyc7XG4gICAgICAgIHVhLm9zID0gb3Muc3BsaXQoJyAnKVswXTtcbiAgICAgICAgaWYgKCF1YS5hcmNoKSB1YS5hcmNoID0gJ3g4Nic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgdWEub3MgPSBvcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUHJvZHVjdChwcm9kdWN0Q29tcG9uZW50cywgcHJvZHVjdCkge1xuICAgICAgZm9yKHZhciBpIGluIHByb2R1Y3RDb21wb25lbnRzKSB7XG4gICAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tpXSA9PSBwcm9kdWN0KSByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgaHVtYW4tcmVhZGFibGUgYnJvd3NlciB2ZW5kb3IsIHByb2R1Y3QgYW5kIHZlcnNpb24gbmFtZXNcbiAgICB2YXIgYnJvd3NlcnMgPSBbWydTYW1zdW5nQnJvd3NlcicsICdTYW1zdW5nJ10sIFsnRWRnZScsICdNaWNyb3NvZnQnXSwgWydPUFInLCAnT3BlcmEnXSwgWydDaHJvbWUnLCAnR29vZ2xlJ10sIFsnU2FmYXJpJywgJ0FwcGxlJ10sIFsnRmlyZWZveCcsICdNb3ppbGxhJ11dO1xuICAgIGZvcih2YXIgaSBpbiBicm93c2Vycykge1xuICAgICAgdmFyIGIgPSBicm93c2Vyc1tpXVswXTtcbiAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tiXSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gYnJvd3NlcnNbaV1bMV07XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICAgIGlmICh1YS5icm93c2VyUHJvZHVjdCA9PSAnT1BSJykgdWEuYnJvd3NlclByb2R1Y3QgPSAnT3BlcmEnO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ1RyaWRlbnQnKSB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gcHJvZHVjdENvbXBvbmVudHNbYl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBEZXRlY3QgSUVzXG4gICAgaWYgKCF1YS5icm93c2VyUHJvZHVjdCkge1xuICAgICAgdmFyIG1hdGNoSUUgPSB1c2VyQWdlbnQubWF0Y2goL01TSUVcXHMoW1xcZC5dKykvKTtcbiAgICAgIGlmIChtYXRjaElFKSB7XG4gICAgICAgIHVhLmJyb3dzZXJWZW5kb3IgPSAnTWljcm9zb2Z0JztcbiAgICAgICAgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IG1hdGNoSUVbMV07XG4gICAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvLCAnVHJpZGVudC83LjAnKSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSAgdXNlckFnZW50Lm1hdGNoKC9ydjooW1xcZC5dKykvKVsxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgbW9iaWxlIHBsYXRmb3JtLCBpZiBwcmVzZW50XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHVhUGxhdGZvcm1JbmZvLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgdmFyIGl0ZW1sID0gaXRlbS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW1sLCAnbmV4dXMnKSB8fCBjb250YWlucyhpdGVtbCwgJ3NhbXN1bmcnKSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9IGl0ZW07XG4gICAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGZvcm0gZmFjdG9yXG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3RhYmxldCcpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwYWQnKSkgdWEuZm9ybUZhY3RvciA9ICdUYWJsZXQnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwaG9uZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwb2QnKSkgdWEuZm9ybUZhY3RvciA9ICdNb2JpbGUnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ3NtYXJ0IHR2JykgfHwgY29udGFpbnModWFsLCAnc21hcnQtdHYnKSkgdWEuZm9ybUZhY3RvciA9ICdUVic7XG4gICAgZWxzZSB1YS5mb3JtRmFjdG9yID0gJ0Rlc2t0b3AnO1xuICB9IGNhdGNoKGUpIHtcbiAgICB1YS5pbnRlcm5hbEVycm9yID0gJ0ZhaWxlZCB0byBwYXJzZSB1c2VyIGFnZW50IHN0cmluZzogJyArIGUudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHJldHVybiB1YTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVzdGltYXRlVlN5bmNSYXRlKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUgPT4ge1xuICAgIHZhciBudW1GcmFtZXNUb1J1biA9IDYwO1xuICAgIHZhciB0MCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBkZWx0YXMgPSBbXTtcbiAgICBmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgdmFyIHQxID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBkZWx0YXMucHVzaCh0MS10MCk7XG4gICAgICB0MCA9IHQxO1xuICAgICAgaWYgKC0tbnVtRnJhbWVzVG9SdW4gPiAwKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbHRhcy5zb3J0KCk7XG4gICAgICAgIGRlbHRhcyA9IGRlbHRhcy5zbGljZSgoZGVsdGFzLmxlbmd0aCAvIDMpfDAsICgoMiAqIGRlbHRhcy5sZW5ndGggKyAyKSAvIDMpfDApO1xuICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgZm9yKHZhciBpIGluIGRlbHRhcykgc3VtICs9IGRlbHRhc1tpXTtcbiAgICAgICAgcmVzb2x2ZSgxMDAwLjAgLyAoc3VtL2RlbHRhcy5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICB9KTtcbn1cbiIsImltcG9ydCB1c2VyQWdlbnRJbmZvIGZyb20gJ3VzZXJhZ2VudC1pbmZvJztcbmltcG9ydCBlc3RpbWF0ZVZTeW5jUmF0ZSBmcm9tICd2c3luYy1lc3RpbWF0ZSc7XG5cbmZ1bmN0aW9uIGVuZGlhbm5lc3MoKSB7XG4gIHZhciBoZWFwID0gbmV3IEFycmF5QnVmZmVyKDB4MTAwMDApO1xuICB2YXIgaTMyID0gbmV3IEludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MzIgPSBuZXcgVWludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MTYgPSBuZXcgVWludDE2QXJyYXkoaGVhcCk7XG4gIHUzMls2NF0gPSAweDdGRkYwMTAwO1xuICB2YXIgdHlwZWRBcnJheUVuZGlhbm5lc3M7XG4gIGlmICh1MTZbMTI4XSA9PT0gMHg3RkZGICYmIHUxNlsxMjldID09PSAweDAxMDApIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2JpZyBlbmRpYW4nO1xuICBlbHNlIGlmICh1MTZbMTI4XSA9PT0gMHgwMTAwICYmIHUxNlsxMjldID09PSAweDdGRkYpIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2xpdHRsZSBlbmRpYW4nO1xuICBlbHNlIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ3Vua25vd24hIChhIGJyb3dzZXIgYnVnPykgKHNob3J0IDE6ICcgKyB1MTZbMTI4XS50b1N0cmluZygxNikgKyAnLCBzaG9ydCAyOiAnICsgdTE2WzEyOV0udG9TdHJpbmcoMTYpICsgJyknO1xuICByZXR1cm4gdHlwZWRBcnJheUVuZGlhbm5lc3M7ICBcbn1cblxuZnVuY3Rpb24gcGFkTGVuZ3RoTGVmdChzLCBsZW4sIGNoKSB7XG4gIGlmIChjaCA9PT0gdW5kZWZpbmVkKSBjaCA9ICcgJztcbiAgd2hpbGUocy5sZW5ndGggPCBsZW4pIHMgPSBjaCArIHM7XG4gIHJldHVybiBzO1xufVxuXG4vLyBQZXJmb3JtcyB0aGUgYnJvd3NlciBmZWF0dXJlIHRlc3QuIEltbWVkaWF0ZWx5IHJldHVybnMgYSBKUyBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVzdWx0cyBvZiBhbGwgc3luY2hyb25vdXNseSBjb21wdXRhYmxlIGZpZWxkcywgYW5kIGxhdW5jaGVzIGFzeW5jaHJvbm91c1xuLy8gdGFza3MgdGhhdCBwZXJmb3JtIHRoZSByZW1haW5pbmcgdGVzdHMuIE9uY2UgdGhlIGFzeW5jIHRhc2tzIGhhdmUgZmluaXNoZWQsIHRoZSBnaXZlbiBzdWNjZXNzQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkLCB3aXRoIHRoZSBmdWxsIGJyb3dzZXIgZmVhdHVyZSB0ZXN0XG4vLyByZXN1bHRzIG9iamVjdCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnJvd3NlckZlYXR1cmVUZXN0KHN1Y2Nlc3NDYWxsYmFjaykge1xuICB2YXIgYXBpcyA9IHt9O1xuICBmdW5jdGlvbiBzZXRBcGlTdXBwb3J0KGFwaW5hbWUsIGNtcCkge1xuICAgIGlmIChjbXApIGFwaXNbYXBpbmFtZV0gPSB0cnVlO1xuICAgIGVsc2UgYXBpc1thcGluYW1lXSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0QXBpU3VwcG9ydCgnTWF0aF9pbXVsJywgdHlwZW9mIE1hdGguaW11bCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdNYXRoX2Zyb3VuZCcsIHR5cGVvZiBNYXRoLmZyb3VuZCAhPT0gJ3VuZGVmaW5lZCcpOyAgXG4gIHNldEFwaVN1cHBvcnQoJ0FycmF5QnVmZmVyX3RyYW5zZmVyJywgdHlwZW9mIEFycmF5QnVmZmVyLnRyYW5zZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkF1ZGlvJywgdHlwZW9mIEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdlYmtpdEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdQb2ludGVyTG9jaycsIGRvY3VtZW50LmJvZHkucmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkubXNSZXF1ZXN0UG9pbnRlckxvY2spO1xuICBzZXRBcGlTdXBwb3J0KCdGdWxsc2NyZWVuQVBJJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0RnVsbFNjcmVlbiB8fCBkb2N1bWVudC5ib2R5LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKTtcbiAgdmFyIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICB0cnkgeyBuZXcgQmxvYigpOyBoYXNCbG9iQ29uc3RydWN0b3IgPSB0cnVlOyB9IGNhdGNoKGUpIHsgfVxuICBzZXRBcGlTdXBwb3J0KCdCbG9iJywgaGFzQmxvYkNvbnN0cnVjdG9yKTtcbiAgaWYgKCFoYXNCbG9iQ29uc3RydWN0b3IpIHNldEFwaVN1cHBvcnQoJ0Jsb2JCdWlsZGVyJywgdHlwZW9mIEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgTW96QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBXZWJLaXRCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTaGFyZWRBcnJheUJ1ZmZlcicsIHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdoYXJkd2FyZUNvbmN1cnJlbmN5JywgdHlwZW9mIG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1NJTURqcycsIHR5cGVvZiBTSU1EICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYldvcmtlcnMnLCB0eXBlb2YgV29ya2VyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ0dhbWVwYWRBUEknLCBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMgfHwgbmF2aWdhdG9yLndlYmtpdEdldEdhbWVwYWRzKTtcbiAgdmFyIGhhc0luZGV4ZWREQiA9IGZhbHNlO1xuICB0cnkgeyBoYXNJbmRleGVkREIgPSB0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJzsgfSBjYXRjaCAoZSkge31cbiAgc2V0QXBpU3VwcG9ydCgnSW5kZXhlZERCJywgaGFzSW5kZXhlZERCKTtcbiAgc2V0QXBpU3VwcG9ydCgnVmlzaWJpbGl0eUFQSScsIHR5cGVvZiBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgncmVxdWVzdEFuaW1hdGlvbkZyYW1lJywgdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdwZXJmb3JtYW5jZV9ub3cnLCB0eXBlb2YgcGVyZm9ybWFuY2UgIT09ICd1bmRlZmluZWQnICYmIHBlcmZvcm1hbmNlLm5vdyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlNvY2tldHMnLCB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlJUQycsIHR5cGVvZiBSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1velJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtc1JUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1ZpYnJhdGlvbkFQSScsIG5hdmlnYXRvci52aWJyYXRlKTtcbiAgc2V0QXBpU3VwcG9ydCgnU2NyZWVuT3JpZW50YXRpb25BUEknLCB3aW5kb3cuc2NyZWVuICYmICh3aW5kb3cuc2NyZWVuLm9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubW96T3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi53ZWJraXRPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1zT3JpZW50YXRpb24pKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2VvbG9jYXRpb25BUEknLCBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pO1xuICBzZXRBcGlTdXBwb3J0KCdCYXR0ZXJ5U3RhdHVzQVBJJywgbmF2aWdhdG9yLmdldEJhdHRlcnkpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBc3NlbWJseScsIHR5cGVvZiBXZWJBc3NlbWJseSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJWUicsIHR5cGVvZiBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJYUicsIHR5cGVvZiBuYXZpZ2F0b3IueHIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnT2Zmc2NyZWVuQ2FudmFzJywgdHlwZW9mIE9mZnNjcmVlbkNhbnZhcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJDb21wb25lbnRzJywgJ3JlZ2lzdGVyRWxlbWVudCcgaW4gZG9jdW1lbnQgJiYgJ2ltcG9ydCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpICYmICdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhciB3ZWJHTFN1cHBvcnQgPSB7fTtcbiAgdmFyIGJlc3RHTENvbnRleHQgPSBudWxsOyAvLyBUaGUgR0wgY29udGV4dHMgYXJlIHRlc3RlZCBmcm9tIGJlc3QgdG8gd29yc3QgKG5ld2VzdCB0byBvbGRlc3QpLCBhbmQgdGhlIG1vc3QgZGVzaXJhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udGV4dCBpcyBzdG9yZWQgaGVyZSBmb3IgbGF0ZXIgdXNlLlxuICBmdW5jdGlvbiB0ZXN0V2ViR0xTdXBwb3J0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBlcnJvclJlYXNvbiA9ICcnO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvclwiLCBmdW5jdGlvbihlKSB7IGVycm9yUmVhc29uID0gZS5zdGF0dXNNZXNzYWdlOyB9LCBmYWxzZSk7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChjb250ZXh0TmFtZSwgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA/IHsgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdDogdHJ1ZSB9IDoge30pO1xuICAgIGlmIChjb250ZXh0ICYmICFlcnJvclJlYXNvbikge1xuICAgICAgaWYgKCFiZXN0R0xDb250ZXh0KSBiZXN0R0xDb250ZXh0ID0gY29udGV4dDtcbiAgICAgIHZhciByZXN1bHRzID0geyBzdXBwb3J0ZWQ6IHRydWUsIHBlcmZvcm1hbmNlQ2F2ZWF0OiAhZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCB9O1xuICAgICAgaWYgKGNvbnRleHROYW1lID09ICdleHBlcmltZW50YWwtd2ViZ2wnKSByZXN1bHRzWydleHBlcmltZW50YWwtd2ViZ2wnXSA9IHRydWU7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgZWxzZSByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCBlcnJvclJlYXNvbjogZXJyb3JSZWFzb24gfTtcbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbDInLCB0cnVlKTtcbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMiA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIGZhbHNlKTtcbiAgICBpZiAoc29mdHdhcmVXZWJHTDIuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMi5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAyIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHNvZnR3YXJlV2ViR0wyO1xuICAgIH1cbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbCcsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIGV4cGVyaW1lbnRhbFdlYkdMID0gdGVzdFdlYkdMU3VwcG9ydCgnZXhwZXJpbWVudGFsLXdlYmdsJywgdHJ1ZSk7XG4gICAgaWYgKGV4cGVyaW1lbnRhbFdlYkdMLnN1cHBvcnRlZCB8fCAoZXhwZXJpbWVudGFsV2ViR0wuZXJyb3JSZWFzb24gJiYgIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb24pKSB7XG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgZmFsc2UpO1xuICAgIGlmICghc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBmYWxzZSk7XG4gICAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhc29mdHdhcmVXZWJHTDEuZXJyb3JSZWFzb24pKSB7XG4gICAgICAgIHNvZnR3YXJlV2ViR0wxID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNvZnR3YXJlV2ViR0wxLnN1cHBvcnRlZCkge1xuICAgICAgc29mdHdhcmVXZWJHTDEuaGFyZHdhcmVFcnJvclJlYXNvbiA9IHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb247IC8vIENhcHR1cmUgdGhlIHJlYXNvbiB3aHkgaGFyZHdhcmUgV2ViR0wgMSBjb250ZXh0IGRpZCBub3Qgc3VjY2VlZC5cbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBzb2Z0d2FyZVdlYkdMMTtcbiAgICB9XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdXZWJHTDEnLCB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMicsIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKTtcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcmVzdWx0cyA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudEluZm8obmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgbmF2aWdhdG9yOiB7XG4gICAgICBidWlsZElEOiBuYXZpZ2F0b3IuYnVpbGRJRCxcbiAgICAgIGFwcFZlcnNpb246IG5hdmlnYXRvci5hcHBWZXJzaW9uLFxuICAgICAgb3NjcHU6IG5hdmlnYXRvci5vc2NwdSxcbiAgICAgIHBsYXRmb3JtOiBuYXZpZ2F0b3IucGxhdGZvcm0gIFxuICAgIH0sXG4gICAgLy8gZGlzcGxheVJlZnJlc2hSYXRlOiBkaXNwbGF5UmVmcmVzaFJhdGUsIC8vIFdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIG9uIGZpcnN0IHJ1biwgZGlyZWN0bHkgZmlsbGVkIGluIGxhdGVyLlxuICAgIGRpc3BsYXk6IHtcbiAgICAgIHdpbmRvd0RldmljZVBpeGVsUmF0aW86IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCxcbiAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCxcbiAgICAgIHBoeXNpY2FsU2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgcGh5c2ljYWxTY3JlZW5IZWlnaHQ6IHNjcmVlbi5oZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbywgIFxuICAgIH0sXG4gICAgaGFyZHdhcmVDb25jdXJyZW5jeTogbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksIC8vIElmIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGlzLCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGZpbGxlZCBpbiBieSBjb3JlIGVzdGltYXRvci5cbiAgICBhcGlTdXBwb3J0OiBhcGlzLFxuICAgIHR5cGVkQXJyYXlFbmRpYW5uZXNzOiBlbmRpYW5uZXNzKClcbiAgfTtcblxuICAvLyBTb21lIGZpZWxkcyBleGlzdCBkb24ndCBhbHdheXMgZXhpc3RcbiAgdmFyIG9wdGlvbmFsRmllbGRzID0gWyd2ZW5kb3InLCAndmVuZG9yU3ViJywgJ3Byb2R1Y3QnLCAncHJvZHVjdFN1YicsICdsYW5ndWFnZScsICdhcHBDb2RlTmFtZScsICdhcHBOYW1lJywgJ21heFRvdWNoUG9pbnRzJywgJ3BvaW50ZXJFbmFibGVkJywgJ2NwdUNsYXNzJ107XG4gIGZvcih2YXIgaSBpbiBvcHRpb25hbEZpZWxkcykge1xuICAgIHZhciBmID0gb3B0aW9uYWxGaWVsZHNbaV07XG4gICAgaWYgKG5hdmlnYXRvcltmXSkgeyByZXN1bHRzLm5hdmlnYXRvcltmXSA9IG5hdmlnYXRvcltmXTsgfVxuICB9XG4vKlxuICB2YXIgbnVtQ29yZXNDaGVja2VkID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgPiAwO1xuXG4gIC8vIE9uIGZpcnN0IHJ1biwgZXN0aW1hdGUgdGhlIG51bWJlciBvZiBjb3JlcyBpZiBuZWVkZWQuXG4gIGlmICghbnVtQ29yZXNDaGVja2VkKSB7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0SGFyZHdhcmVDb25jdXJyZW5jeShmdW5jdGlvbihjb3Jlcykge1xuICAgICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSBjb3JlcztcbiAgICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBhc3luYyB0YXNrLCBmaXJlIHN1Y2Nlc3MgY2FsbGJhY2suXG4gICAgICAgIGlmIChudW1Db3Jlc0NoZWNrZWQgJiYgc3VjY2Vzc0NhbGxiYWNrKSBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgaXMgbm90IHN1cHBvcnRlZCwgYW5kIG5vIGNvcmUgZXN0aW1hdG9yIGF2YWlsYWJsZSBlaXRoZXIuXG4gICAgICAvLyBSZXBvcnQgbnVtYmVyIG9mIGNvcmVzIGFzIDAuXG4gICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSAwO1xuICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiovXG4gIGVzdGltYXRlVlN5bmNSYXRlKCkudGhlbihyZWZyZXNoUmF0ZSA9PiB7XG4gICAgcmVzdWx0cy5yZWZyZXNoUmF0ZSA9IE1hdGgucm91bmQocmVmcmVzaFJhdGUpO1xuICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgfSk7XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgYXN5bmMgdGFza3Mgd2VyZSBuZWVkZWQgdG8gYmUgZXhlY3V0ZWQsIHF1ZXVlIHN1Y2Nlc3MgY2FsbGJhY2suXG4gIC8vIGlmIChudW1Db3Jlc0NoZWNrZWQgJiYgc3VjY2Vzc0NhbGxiYWNrKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7IH0sIDEpO1xuXG4gIC8vIElmIGNhbGxlciBpcyBub3QgaW50ZXJlc3RlZCBpbiBhc3luY2hyb25vdXNseSBmaWxsYWJsZSBkYXRhLCBhbHNvIHJldHVybiB0aGUgcmVzdWx0cyBvYmplY3QgaW1tZWRpYXRlbHkgZm9yIHRoZSBzeW5jaHJvbm91cyBiaXRzLlxuICByZXR1cm4gcmVzdWx0cztcbn1cbiIsImZ1bmN0aW9uIGdldFdlYkdMSW5mb0J5VmVyc2lvbih3ZWJnbFZlcnNpb24pIHtcbiAgdmFyIHJlcG9ydCA9IHtcbiAgICB3ZWJnbFZlcnNpb246IHdlYmdsVmVyc2lvblxuICB9O1xuXG5pZiAoKHdlYmdsVmVyc2lvbiA9PT0gMiAmJiAhd2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHx8XG4gICAgKHdlYmdsVmVyc2lvbiA9PT0gMSAmJiAhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCkpIHtcbiAgICAvLyBUaGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFdlYkdMXG4gICAgcmVwb3J0LmNvbnRleHROYW1lID0gXCJ3ZWJnbCBub3Qgc3VwcG9ydGVkXCI7XG4gICAgcmV0dXJuIHJlcG9ydDtcbn1cblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG52YXIgZ2wsIGNvbnRleHROYW1lO1xudmFyIHBvc3NpYmxlTmFtZXMgPSAod2ViZ2xWZXJzaW9uID09PSAyKSA/IFtcIndlYmdsMlwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbDJcIl0gOiBbXCJ3ZWJnbFwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiXTtcbmZvciAodmFyIGk9MDtpPHBvc3NpYmxlTmFtZXMubGVuZ3RoO2krKykge1xuICB2YXIgbmFtZSA9IHBvc3NpYmxlTmFtZXNbaV07XG4gIGdsID0gY2FudmFzLmdldENvbnRleHQobmFtZSwgeyBzdGVuY2lsOiB0cnVlIH0pO1xuICBpZiAoZ2wpe1xuICAgICAgY29udGV4dE5hbWUgPSBuYW1lO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cbmNhbnZhcy5yZW1vdmUoKTtcbmlmICghZ2wpIHtcbiAgICByZXBvcnQuY29udGV4dE5hbWUgPSBcIndlYmdsIHN1cHBvcnRlZCBidXQgZmFpbGVkIHRvIGluaXRpYWxpemVcIjtcbiAgICByZXR1cm4gcmVwb3J0O1xufVxuXG5yZXR1cm4gT2JqZWN0LmFzc2lnbihyZXBvcnQsIHtcbiAgICBjb250ZXh0TmFtZTogY29udGV4dE5hbWUsXG4gICAgZ2xWZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuVkVSU0lPTiksXG4gICAgdmVuZG9yOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuVkVORE9SKSxcbiAgICByZW5kZXJlcjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlJFTkRFUkVSKSxcbiAgICB1bk1hc2tlZFZlbmRvcjogZ2V0VW5tYXNrZWRJbmZvKGdsKS52ZW5kb3IsXG4gICAgdW5NYXNrZWRSZW5kZXJlcjogZ2V0VW5tYXNrZWRJbmZvKGdsKS5yZW5kZXJlcixcbiAgICBhbmdsZTogZ2V0QW5nbGUoZ2wpLFxuICAgIGFudGlhbGlhczogIGdsLmdldENvbnRleHRBdHRyaWJ1dGVzKCkuYW50aWFsaWFzID8gXCJBdmFpbGFibGVcIiA6IFwiTm90IGF2YWlsYWJsZVwiLFxuICAgIG1ham9yUGVyZm9ybWFuY2VDYXZlYXQ6IGdldE1ham9yUGVyZm9ybWFuY2VDYXZlYXQoY29udGV4dE5hbWUpLFxuICAgIGJpdHM6IHtcbiAgICAgIHJlZEJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5SRURfQklUUyksXG4gICAgICBncmVlbkJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5HUkVFTl9CSVRTKSxcbiAgICAgIGJsdWVCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuQkxVRV9CSVRTKSxcbiAgICAgIGFscGhhQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMUEhBX0JJVFMpLFxuICAgICAgZGVwdGhCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuREVQVEhfQklUUyksXG4gICAgICBzdGVuY2lsQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLlNURU5DSUxfQklUUykgIFxuICAgIH0sXG4gICAgbWF4aW11bToge1xuICAgICAgbWF4Q29sb3JCdWZmZXJzOiBnZXRNYXhDb2xvckJ1ZmZlcnMoZ2wpLFxuICAgICAgbWF4UmVuZGVyQnVmZmVyU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9SRU5ERVJCVUZGRVJfU0laRSksXG4gICAgICBtYXhDb21iaW5lZFRleHR1cmVJbWFnZVVuaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0NPTUJJTkVEX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgICAgbWF4Q3ViZU1hcFRleHR1cmVTaXplOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0NVQkVfTUFQX1RFWFRVUkVfU0laRSksXG4gICAgICBtYXhGcmFnbWVudFVuaWZvcm1WZWN0b3JzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0ZSQUdNRU5UX1VOSUZPUk1fVkVDVE9SUyksXG4gICAgICBtYXhUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTKSxcbiAgICAgIG1heFRleHR1cmVTaXplOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfU0laRSksXG4gICAgICBtYXhWYXJ5aW5nVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WQVJZSU5HX1ZFQ1RPUlMpLFxuICAgICAgbWF4VmVydGV4QXR0cmlidXRlczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfQVRUUklCUyksXG4gICAgICBtYXhWZXJ0ZXhUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgICBtYXhWZXJ0ZXhVbmlmb3JtVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVU5JRk9STV9WRUNUT1JTKSwgIFxuICAgICAgbWF4Vmlld3BvcnREaW1lbnNpb25zOiBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVklFV1BPUlRfRElNUykpLFxuICAgICAgbWF4QW5pc290cm9weTogZ2V0TWF4QW5pc290cm9weShnbCksXG4gICAgfSxcbiAgICBhbGlhc2VkTGluZVdpZHRoUmFuZ2U6IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfTElORV9XSURUSF9SQU5HRSkpLFxuICAgIGFsaWFzZWRQb2ludFNpemVSYW5nZTogZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuQUxJQVNFRF9QT0lOVF9TSVpFX1JBTkdFKSksXG4gICAgc2hhZGVyczoge1xuICAgICAgdmVydGV4U2hhZGVyQmVzdFByZWNpc2lvbjogZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKGdsLlZFUlRFWF9TSEFERVIsIGdsKSxcbiAgICAgIGZyYWdtZW50U2hhZGVyQmVzdFByZWNpc2lvbjogZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wpLFxuICAgICAgZnJhZ21lbnRTaGFkZXJGbG9hdEludFByZWNpc2lvbjogZ2V0RmxvYXRJbnRQcmVjaXNpb24oZ2wpLFxuICAgICAgc2hhZGluZ0xhbmd1YWdlVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlNIQURJTkdfTEFOR1VBR0VfVkVSU0lPTilcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IGdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZGVzY3JpYmVSYW5nZSh2YWx1ZSkge1xuICByZXR1cm4gW3ZhbHVlWzBdLCB2YWx1ZVsxXV07XG59XG5cbmZ1bmN0aW9uIGdldFVubWFza2VkSW5mbyhnbCkge1xuICB2YXIgdW5NYXNrZWRJbmZvID0ge1xuICAgICAgcmVuZGVyZXI6IFwiXCIsXG4gICAgICB2ZW5kb3I6IFwiXCJcbiAgfTtcbiAgXG4gIHZhciBkYmdSZW5kZXJJbmZvID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mb1wiKTtcbiAgaWYgKGRiZ1JlbmRlckluZm8gIT0gbnVsbCkge1xuICAgICAgdW5NYXNrZWRJbmZvLnJlbmRlcmVyID0gZ2wuZ2V0UGFyYW1ldGVyKGRiZ1JlbmRlckluZm8uVU5NQVNLRURfUkVOREVSRVJfV0VCR0wpO1xuICAgICAgdW5NYXNrZWRJbmZvLnZlbmRvciAgID0gZ2wuZ2V0UGFyYW1ldGVyKGRiZ1JlbmRlckluZm8uVU5NQVNLRURfVkVORE9SX1dFQkdMKTtcbiAgfVxuICBcbiAgcmV0dXJuIHVuTWFza2VkSW5mbztcbn1cblxuZnVuY3Rpb24gZ2V0TWF4Q29sb3JCdWZmZXJzKGdsKSB7XG4gIHZhciBtYXhDb2xvckJ1ZmZlcnMgPSAxO1xuICB2YXIgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiV0VCR0xfZHJhd19idWZmZXJzXCIpO1xuICBpZiAoZXh0ICE9IG51bGwpIFxuICAgICAgbWF4Q29sb3JCdWZmZXJzID0gZ2wuZ2V0UGFyYW1ldGVyKGV4dC5NQVhfRFJBV19CVUZGRVJTX1dFQkdMKTtcbiAgXG4gIHJldHVybiBtYXhDb2xvckJ1ZmZlcnM7XG59XG5cbmZ1bmN0aW9uIGdldE1ham9yUGVyZm9ybWFuY2VDYXZlYXQoY29udGV4dE5hbWUpIHtcbiAgLy8gRG9lcyBjb250ZXh0IGNyZWF0aW9uIGZhaWwgdG8gZG8gYSBtYWpvciBwZXJmb3JtYW5jZSBjYXZlYXQ/XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikpO1xuICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChjb250ZXh0TmFtZSwgeyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IDogdHJ1ZSB9KTtcbiAgY2FudmFzLnJlbW92ZSgpO1xuXG4gIGlmICghZ2wpIHtcbiAgICAgIC8vIE91ciBvcmlnaW5hbCBjb250ZXh0IGNyZWF0aW9uIHBhc3NlZC4gIFRoaXMgZGlkIG5vdC5cbiAgICAgIHJldHVybiBcIlllc1wiO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBnbC5nZXRDb250ZXh0QXR0cmlidXRlcygpLmZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIC8vIElmIGdldENvbnRleHRBdHRyaWJ1dGVzKCkgZG9lc25cInQgaW5jbHVkZSB0aGUgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdFxuICAgICAgLy8gcHJvcGVydHksIGFzc3VtZSB0aGUgYnJvd3NlciBkb2VzblwidCBpbXBsZW1lbnQgaXQgeWV0LlxuICAgICAgcmV0dXJuIFwiTm90IGltcGxlbWVudGVkXCI7XG4gIH1cbiAgcmV0dXJuIFwiTm9cIjtcbn1cblxuZnVuY3Rpb24gaXNQb3dlck9mVHdvKG4pIHtcbiAgcmV0dXJuIChuICE9PSAwKSAmJiAoKG4gJiAobiAtIDEpKSA9PT0gMCk7XG59XG5cbmZ1bmN0aW9uIGdldEFuZ2xlKGdsKSB7XG4gIHZhciBsaW5lV2lkdGhSYW5nZSA9IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfTElORV9XSURUSF9SQU5HRSkpO1xuXG4gIC8vIEhldXJpc3RpYzogQU5HTEUgaXMgb25seSBvbiBXaW5kb3dzLCBub3QgaW4gSUUsIGFuZCBkb2VzIG5vdCBpbXBsZW1lbnQgbGluZSB3aWR0aCBncmVhdGVyIHRoYW4gb25lLlxuICB2YXIgYW5nbGUgPSAoKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gXCJXaW4zMlwiKSB8fCAobmF2aWdhdG9yLnBsYXRmb3JtID09PSBcIldpbjY0XCIpKSAmJlxuICAgICAgKGdsLmdldFBhcmFtZXRlcihnbC5SRU5ERVJFUikgIT09IFwiSW50ZXJuZXQgRXhwbG9yZXJcIikgJiZcbiAgICAgIChsaW5lV2lkdGhSYW5nZSA9PT0gZGVzY3JpYmVSYW5nZShbMSwxXSkpO1xuXG4gIGlmIChhbmdsZSkge1xuICAgICAgLy8gSGV1cmlzdGljOiBEM0QxMSBiYWNrZW5kIGRvZXMgbm90IGFwcGVhciB0byByZXNlcnZlIHVuaWZvcm1zIGxpa2UgdGhlIEQzRDkgYmFja2VuZCwgZS5nLixcbiAgICAgIC8vIEQzRDExIG1heSBoYXZlIDEwMjQgdW5pZm9ybXMgcGVyIHN0YWdlLCBidXQgRDNEOSBoYXMgMjU0IGFuZCAyMjEuXG4gICAgICAvL1xuICAgICAgLy8gV2UgY291bGQgYWxzbyB0ZXN0IGZvciBXRUJHTF9kcmF3X2J1ZmZlcnMsIGJ1dCBtYW55IHN5c3RlbXMgZG8gbm90IGhhdmUgaXQgeWV0XG4gICAgICAvLyBkdWUgdG8gZHJpdmVyIGJ1Z3MsIGV0Yy5cbiAgICAgIGlmIChpc1Bvd2VyT2ZUd28oZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVU5JRk9STV9WRUNUT1JTKSkgJiYgaXNQb3dlck9mVHdvKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfRlJBR01FTlRfVU5JRk9STV9WRUNUT1JTKSkpIHtcbiAgICAgICAgICByZXR1cm4gXCJZZXMsIEQzRDExXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIlllcywgRDNEOVwiO1xuICAgICAgfVxuICB9XG5cbiAgcmV0dXJuIFwiTm9cIjtcbn1cblxuZnVuY3Rpb24gZ2V0TWF4QW5pc290cm9weShnbCkge1xuICB2YXIgZSA9IGdsLmdldEV4dGVuc2lvbihcIkVYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiKVxuICAgICAgICAgIHx8IGdsLmdldEV4dGVuc2lvbihcIldFQktJVF9FWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNcIilcbiAgICAgICAgICB8fCBnbC5nZXRFeHRlbnNpb24oXCJNT1pfRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpO1xuXG4gIGlmIChlKSB7XG4gICAgICB2YXIgbWF4ID0gZ2wuZ2V0UGFyYW1ldGVyKGUuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKTtcbiAgICAgIC8vIFNlZSBDYW5hcnkgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTE3NDUwXG4gICAgICBpZiAobWF4ID09PSAwKSB7XG4gICAgICAgICAgbWF4ID0gMjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXg7XG4gIH1cbiAgcmV0dXJuIFwibi9hXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBvd2VyKGV4cG9uZW50LCB2ZXJib3NlKSB7XG4gIGlmICh2ZXJib3NlKSB7XG4gICAgICByZXR1cm4gXCJcIiArIE1hdGgucG93KDIsIGV4cG9uZW50KTtcbiAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIjJeXCIgKyBleHBvbmVudCArIFwiXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24ocHJlY2lzaW9uLCB2ZXJib3NlKSB7XG4gIHZhciB2ZXJib3NlUGFydCA9IHZlcmJvc2UgPyBcIiBiaXQgbWFudGlzc2FcIiA6IFwiXCI7XG4gIHJldHVybiBcIlstXCIgKyBmb3JtYXRQb3dlcihwcmVjaXNpb24ucmFuZ2VNaW4sIHZlcmJvc2UpICsgXCIsIFwiICsgZm9ybWF0UG93ZXIocHJlY2lzaW9uLnJhbmdlTWF4LCB2ZXJib3NlKSArIFwiXSAoXCIgKyBwcmVjaXNpb24ucHJlY2lzaW9uICsgdmVyYm9zZVBhcnQgKyBcIilcIlxufVxuXG5mdW5jdGlvbiBnZXRCZXN0RmxvYXRQcmVjaXNpb24oc2hhZGVyVHlwZSwgZ2wpIHtcbiAgdmFyIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuSElHSF9GTE9BVCk7XG4gIHZhciBtZWRpdW0gPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuTUVESVVNX0ZMT0FUKTtcbiAgdmFyIGxvdyA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChzaGFkZXJUeXBlLCBnbC5MT1dfRkxPQVQpO1xuXG4gIHZhciBiZXN0ID0gaGlnaDtcbiAgaWYgKGhpZ2gucHJlY2lzaW9uID09PSAwKSB7XG4gICAgICBiZXN0ID0gbWVkaXVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAgIGhpZ2ggOiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihoaWdoLCB0cnVlKSxcbiAgICAgIG1lZGl1bSA6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKG1lZGl1bSwgdHJ1ZSksXG4gICAgICBsb3c6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKGxvdywgdHJ1ZSksXG4gICAgICBiZXN0OiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihiZXN0LCBmYWxzZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGbG9hdEludFByZWNpc2lvbihnbCkge1xuICB2YXIgaGlnaCA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5GUkFHTUVOVF9TSEFERVIsIGdsLkhJR0hfRkxPQVQpO1xuICB2YXIgcyA9IChoaWdoLnByZWNpc2lvbiAhPT0gMCkgPyBcImhpZ2hwL1wiIDogXCJtZWRpdW1wL1wiO1xuXG4gIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0lOVCk7XG4gIHMgKz0gKGhpZ2gucmFuZ2VNYXggIT09IDApID8gXCJoaWdocFwiIDogXCJsb3dwXCI7XG5cbiAgcmV0dXJuIHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgd2ViZ2wxOiBnZXRXZWJHTEluZm9CeVZlcnNpb24oMSksXG4gICAgd2ViZ2wyOiBnZXRXZWJHTEluZm9CeVZlcnNpb24oMilcbiAgfVxufVxuIiwiLypcbiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNIQSBmYW1pbHkgb2YgaGFzaGVzLCBhc1xuIGRlZmluZWQgaW4gRklQUyBQVUIgMTgwLTQgYW5kIEZJUFMgUFVCIDIwMiwgYXMgd2VsbCBhcyB0aGUgY29ycmVzcG9uZGluZ1xuIEhNQUMgaW1wbGVtZW50YXRpb24gYXMgZGVmaW5lZCBpbiBGSVBTIFBVQiAxOThhXG5cbiBDb3B5cmlnaHQgQnJpYW4gVHVyZWsgMjAwOC0yMDE3XG4gRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIEJTRCBMaWNlbnNlXG4gU2VlIGh0dHA6Ly9jYWxpZ2F0aW8uZ2l0aHViLmNvbS9qc1NIQS8gZm9yIG1vcmUgaW5mb3JtYXRpb25cblxuIFNldmVyYWwgZnVuY3Rpb25zIHRha2VuIGZyb20gUGF1bCBKb2huc3RvblxuKi9cbid1c2Ugc3RyaWN0JzsoZnVuY3Rpb24oWSl7ZnVuY3Rpb24gQyhjLGEsYil7dmFyIGU9MCxoPVtdLG49MCxnLGwsZCxmLG0scSx1LHIsST0hMSx2PVtdLHc9W10sdCx5PSExLHo9ITEseD0tMTtiPWJ8fHt9O2c9Yi5lbmNvZGluZ3x8XCJVVEY4XCI7dD1iLm51bVJvdW5kc3x8MTtpZih0IT09cGFyc2VJbnQodCwxMCl8fDE+dCl0aHJvdyBFcnJvcihcIm51bVJvdW5kcyBtdXN0IGEgaW50ZWdlciA+PSAxXCIpO2lmKFwiU0hBLTFcIj09PWMpbT01MTIscT1LLHU9WixmPTE2MCxyPWZ1bmN0aW9uKGEpe3JldHVybiBhLnNsaWNlKCl9O2Vsc2UgaWYoMD09PWMubGFzdEluZGV4T2YoXCJTSEEtXCIsMCkpaWYocT1mdW5jdGlvbihhLGIpe3JldHVybiBMKGEsYixjKX0sdT1mdW5jdGlvbihhLGIsaCxlKXt2YXIgayxmO2lmKFwiU0hBLTIyNFwiPT09Y3x8XCJTSEEtMjU2XCI9PT1jKWs9KGIrNjU+Pj45PDw0KSsxNSxmPTE2O2Vsc2UgaWYoXCJTSEEtMzg0XCI9PT1jfHxcIlNIQS01MTJcIj09PWMpaz0oYisxMjk+Pj4xMDw8XG41KSszMSxmPTMyO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbmV4cGVjdGVkIGVycm9yIGluIFNIQS0yIGltcGxlbWVudGF0aW9uXCIpO2Zvcig7YS5sZW5ndGg8PWs7KWEucHVzaCgwKTthW2I+Pj41XXw9MTI4PDwyNC1iJTMyO2I9YitoO2Fba109YiY0Mjk0OTY3Mjk1O2Fbay0xXT1iLzQyOTQ5NjcyOTZ8MDtoPWEubGVuZ3RoO2ZvcihiPTA7YjxoO2IrPWYpZT1MKGEuc2xpY2UoYixiK2YpLGUsYyk7aWYoXCJTSEEtMjI0XCI9PT1jKWE9W2VbMF0sZVsxXSxlWzJdLGVbM10sZVs0XSxlWzVdLGVbNl1dO2Vsc2UgaWYoXCJTSEEtMjU2XCI9PT1jKWE9ZTtlbHNlIGlmKFwiU0hBLTM4NFwiPT09YylhPVtlWzBdLmEsZVswXS5iLGVbMV0uYSxlWzFdLmIsZVsyXS5hLGVbMl0uYixlWzNdLmEsZVszXS5iLGVbNF0uYSxlWzRdLmIsZVs1XS5hLGVbNV0uYl07ZWxzZSBpZihcIlNIQS01MTJcIj09PWMpYT1bZVswXS5hLGVbMF0uYixlWzFdLmEsZVsxXS5iLGVbMl0uYSxlWzJdLmIsZVszXS5hLGVbM10uYixlWzRdLmEsXG5lWzRdLmIsZVs1XS5hLGVbNV0uYixlWzZdLmEsZVs2XS5iLGVbN10uYSxlWzddLmJdO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbmV4cGVjdGVkIGVycm9yIGluIFNIQS0yIGltcGxlbWVudGF0aW9uXCIpO3JldHVybiBhfSxyPWZ1bmN0aW9uKGEpe3JldHVybiBhLnNsaWNlKCl9LFwiU0hBLTIyNFwiPT09YyltPTUxMixmPTIyNDtlbHNlIGlmKFwiU0hBLTI1NlwiPT09YyltPTUxMixmPTI1NjtlbHNlIGlmKFwiU0hBLTM4NFwiPT09YyltPTEwMjQsZj0zODQ7ZWxzZSBpZihcIlNIQS01MTJcIj09PWMpbT0xMDI0LGY9NTEyO2Vsc2UgdGhyb3cgRXJyb3IoXCJDaG9zZW4gU0hBIHZhcmlhbnQgaXMgbm90IHN1cHBvcnRlZFwiKTtlbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBMy1cIiwwKXx8MD09PWMubGFzdEluZGV4T2YoXCJTSEFLRVwiLDApKXt2YXIgRj02O3E9RDtyPWZ1bmN0aW9uKGEpe3ZhciBjPVtdLGU7Zm9yKGU9MDs1PmU7ZSs9MSljW2VdPWFbZV0uc2xpY2UoKTtyZXR1cm4gY307eD0xO2lmKFwiU0hBMy0yMjRcIj09PVxuYyltPTExNTIsZj0yMjQ7ZWxzZSBpZihcIlNIQTMtMjU2XCI9PT1jKW09MTA4OCxmPTI1NjtlbHNlIGlmKFwiU0hBMy0zODRcIj09PWMpbT04MzIsZj0zODQ7ZWxzZSBpZihcIlNIQTMtNTEyXCI9PT1jKW09NTc2LGY9NTEyO2Vsc2UgaWYoXCJTSEFLRTEyOFwiPT09YyltPTEzNDQsZj0tMSxGPTMxLHo9ITA7ZWxzZSBpZihcIlNIQUtFMjU2XCI9PT1jKW09MTA4OCxmPS0xLEY9MzEsej0hMDtlbHNlIHRocm93IEVycm9yKFwiQ2hvc2VuIFNIQSB2YXJpYW50IGlzIG5vdCBzdXBwb3J0ZWRcIik7dT1mdW5jdGlvbihhLGMsZSxiLGgpe2U9bTt2YXIgaz1GLGYsZz1bXSxuPWU+Pj41LGw9MCxkPWM+Pj41O2ZvcihmPTA7ZjxkJiZjPj1lO2YrPW4pYj1EKGEuc2xpY2UoZixmK24pLGIpLGMtPWU7YT1hLnNsaWNlKGYpO2ZvcihjJT1lO2EubGVuZ3RoPG47KWEucHVzaCgwKTtmPWM+Pj4zO2FbZj4+Ml1ePWs8PGYlNCo4O2Fbbi0xXV49MjE0NzQ4MzY0ODtmb3IoYj1EKGEsYik7MzIqZy5sZW5ndGg8aDspe2E9YltsJVxuNV1bbC81fDBdO2cucHVzaChhLmIpO2lmKDMyKmcubGVuZ3RoPj1oKWJyZWFrO2cucHVzaChhLmEpO2wrPTE7MD09PTY0KmwlZSYmRChudWxsLGIpfXJldHVybiBnfX1lbHNlIHRocm93IEVycm9yKFwiQ2hvc2VuIFNIQSB2YXJpYW50IGlzIG5vdCBzdXBwb3J0ZWRcIik7ZD1NKGEsZyx4KTtsPUEoYyk7dGhpcy5zZXRITUFDS2V5PWZ1bmN0aW9uKGEsYixoKXt2YXIgaztpZighMD09PUkpdGhyb3cgRXJyb3IoXCJITUFDIGtleSBhbHJlYWR5IHNldFwiKTtpZighMD09PXkpdGhyb3cgRXJyb3IoXCJDYW5ub3Qgc2V0IEhNQUMga2V5IGFmdGVyIGNhbGxpbmcgdXBkYXRlXCIpO2lmKCEwPT09eil0aHJvdyBFcnJvcihcIlNIQUtFIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIEhNQUNcIik7Zz0oaHx8e30pLmVuY29kaW5nfHxcIlVURjhcIjtiPU0oYixnLHgpKGEpO2E9Yi5iaW5MZW47Yj1iLnZhbHVlO2s9bT4+PjM7aD1rLzQtMTtpZihrPGEvOCl7Zm9yKGI9dShiLGEsMCxBKGMpLGYpO2IubGVuZ3RoPD1oOyliLnB1c2goMCk7XG5iW2hdJj00Mjk0OTY3MDQwfWVsc2UgaWYoaz5hLzgpe2Zvcig7Yi5sZW5ndGg8PWg7KWIucHVzaCgwKTtiW2hdJj00Mjk0OTY3MDQwfWZvcihhPTA7YTw9aDthKz0xKXZbYV09YlthXV45MDk1MjI0ODYsd1thXT1iW2FdXjE1NDk1NTY4Mjg7bD1xKHYsbCk7ZT1tO0k9ITB9O3RoaXMudXBkYXRlPWZ1bmN0aW9uKGEpe3ZhciBjLGIsayxmPTAsZz1tPj4+NTtjPWQoYSxoLG4pO2E9Yy5iaW5MZW47Yj1jLnZhbHVlO2M9YT4+PjU7Zm9yKGs9MDtrPGM7ays9ZylmK208PWEmJihsPXEoYi5zbGljZShrLGsrZyksbCksZis9bSk7ZSs9ZjtoPWIuc2xpY2UoZj4+PjUpO249YSVtO3k9ITB9O3RoaXMuZ2V0SGFzaD1mdW5jdGlvbihhLGIpe3ZhciBrLGcsZCxtO2lmKCEwPT09SSl0aHJvdyBFcnJvcihcIkNhbm5vdCBjYWxsIGdldEhhc2ggYWZ0ZXIgc2V0dGluZyBITUFDIGtleVwiKTtkPU4oYik7aWYoITA9PT16KXtpZigtMT09PWQuc2hha2VMZW4pdGhyb3cgRXJyb3IoXCJzaGFrZUxlbiBtdXN0IGJlIHNwZWNpZmllZCBpbiBvcHRpb25zXCIpO1xuZj1kLnNoYWtlTGVufXN3aXRjaChhKXtjYXNlIFwiSEVYXCI6az1mdW5jdGlvbihhKXtyZXR1cm4gTyhhLGYseCxkKX07YnJlYWs7Y2FzZSBcIkI2NFwiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIFAoYSxmLHgsZCl9O2JyZWFrO2Nhc2UgXCJCWVRFU1wiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIFEoYSxmLHgpfTticmVhaztjYXNlIFwiQVJSQVlCVUZGRVJcIjp0cnl7Zz1uZXcgQXJyYXlCdWZmZXIoMCl9Y2F0Y2gocCl7dGhyb3cgRXJyb3IoXCJBUlJBWUJVRkZFUiBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgZW52aXJvbm1lbnRcIik7fWs9ZnVuY3Rpb24oYSl7cmV0dXJuIFIoYSxmLHgpfTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiZm9ybWF0IG11c3QgYmUgSEVYLCBCNjQsIEJZVEVTLCBvciBBUlJBWUJVRkZFUlwiKTt9bT11KGguc2xpY2UoKSxuLGUscihsKSxmKTtmb3IoZz0xO2c8dDtnKz0xKSEwPT09eiYmMCE9PWYlMzImJihtW20ubGVuZ3RoLTFdJj0xNjc3NzIxNT4+PjI0LWYlMzIpLG09dShtLGYsXG4wLEEoYyksZik7cmV0dXJuIGsobSl9O3RoaXMuZ2V0SE1BQz1mdW5jdGlvbihhLGIpe3ZhciBrLGcsZCxwO2lmKCExPT09SSl0aHJvdyBFcnJvcihcIkNhbm5vdCBjYWxsIGdldEhNQUMgd2l0aG91dCBmaXJzdCBzZXR0aW5nIEhNQUMga2V5XCIpO2Q9TihiKTtzd2l0Y2goYSl7Y2FzZSBcIkhFWFwiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIE8oYSxmLHgsZCl9O2JyZWFrO2Nhc2UgXCJCNjRcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBQKGEsZix4LGQpfTticmVhaztjYXNlIFwiQllURVNcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBRKGEsZix4KX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2s9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKHYpe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31rPWZ1bmN0aW9uKGEpe3JldHVybiBSKGEsZix4KX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIm91dHB1dEZvcm1hdCBtdXN0IGJlIEhFWCwgQjY0LCBCWVRFUywgb3IgQVJSQVlCVUZGRVJcIik7XG59Zz11KGguc2xpY2UoKSxuLGUscihsKSxmKTtwPXEodyxBKGMpKTtwPXUoZyxmLG0scCxmKTtyZXR1cm4gayhwKX19ZnVuY3Rpb24gYihjLGEpe3RoaXMuYT1jO3RoaXMuYj1hfWZ1bmN0aW9uIE8oYyxhLGIsZSl7dmFyIGg9XCJcIjthLz04O3ZhciBuLGcsZDtkPS0xPT09Yj8zOjA7Zm9yKG49MDtuPGE7bis9MSlnPWNbbj4+PjJdPj4+OCooZCtuJTQqYiksaCs9XCIwMTIzNDU2Nzg5YWJjZGVmXCIuY2hhckF0KGc+Pj40JjE1KStcIjAxMjM0NTY3ODlhYmNkZWZcIi5jaGFyQXQoZyYxNSk7cmV0dXJuIGUub3V0cHV0VXBwZXI/aC50b1VwcGVyQ2FzZSgpOmh9ZnVuY3Rpb24gUChjLGEsYixlKXt2YXIgaD1cIlwiLG49YS84LGcsZCxwLGY7Zj0tMT09PWI/MzowO2ZvcihnPTA7ZzxuO2crPTMpZm9yKGQ9ZysxPG4/Y1tnKzE+Pj4yXTowLHA9ZysyPG4/Y1tnKzI+Pj4yXTowLHA9KGNbZz4+PjJdPj4+OCooZitnJTQqYikmMjU1KTw8MTZ8KGQ+Pj44KihmKyhnKzEpJTQqYikmMjU1KTw8OHxwPj4+OCooZitcbihnKzIpJTQqYikmMjU1LGQ9MDs0PmQ7ZCs9MSk4KmcrNipkPD1hP2grPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiLmNoYXJBdChwPj4+NiooMy1kKSY2Myk6aCs9ZS5iNjRQYWQ7cmV0dXJuIGh9ZnVuY3Rpb24gUShjLGEsYil7dmFyIGU9XCJcIjthLz04O3ZhciBoLGQsZztnPS0xPT09Yj8zOjA7Zm9yKGg9MDtoPGE7aCs9MSlkPWNbaD4+PjJdPj4+OCooZytoJTQqYikmMjU1LGUrPVN0cmluZy5mcm9tQ2hhckNvZGUoZCk7cmV0dXJuIGV9ZnVuY3Rpb24gUihjLGEsYil7YS89ODt2YXIgZSxoPW5ldyBBcnJheUJ1ZmZlcihhKSxkLGc7Zz1uZXcgVWludDhBcnJheShoKTtkPS0xPT09Yj8zOjA7Zm9yKGU9MDtlPGE7ZSs9MSlnW2VdPWNbZT4+PjJdPj4+OCooZCtlJTQqYikmMjU1O3JldHVybiBofWZ1bmN0aW9uIE4oYyl7dmFyIGE9e291dHB1dFVwcGVyOiExLGI2NFBhZDpcIj1cIixzaGFrZUxlbjotMX07Yz1jfHx7fTtcbmEub3V0cHV0VXBwZXI9Yy5vdXRwdXRVcHBlcnx8ITE7ITA9PT1jLmhhc093blByb3BlcnR5KFwiYjY0UGFkXCIpJiYoYS5iNjRQYWQ9Yy5iNjRQYWQpO2lmKCEwPT09Yy5oYXNPd25Qcm9wZXJ0eShcInNoYWtlTGVuXCIpKXtpZigwIT09Yy5zaGFrZUxlbiU4KXRocm93IEVycm9yKFwic2hha2VMZW4gbXVzdCBiZSBhIG11bHRpcGxlIG9mIDhcIik7YS5zaGFrZUxlbj1jLnNoYWtlTGVufWlmKFwiYm9vbGVhblwiIT09dHlwZW9mIGEub3V0cHV0VXBwZXIpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIG91dHB1dFVwcGVyIGZvcm1hdHRpbmcgb3B0aW9uXCIpO2lmKFwic3RyaW5nXCIhPT10eXBlb2YgYS5iNjRQYWQpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIGI2NFBhZCBmb3JtYXR0aW5nIG9wdGlvblwiKTtyZXR1cm4gYX1mdW5jdGlvbiBNKGMsYSxiKXtzd2l0Y2goYSl7Y2FzZSBcIlVURjhcIjpjYXNlIFwiVVRGMTZCRVwiOmNhc2UgXCJVVEYxNkxFXCI6YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcImVuY29kaW5nIG11c3QgYmUgVVRGOCwgVVRGMTZCRSwgb3IgVVRGMTZMRVwiKTtcbn1zd2l0Y2goYyl7Y2FzZSBcIkhFWFwiOmM9ZnVuY3Rpb24oYSxjLGQpe3ZhciBnPWEubGVuZ3RoLGwscCxmLG0scSx1O2lmKDAhPT1nJTIpdGhyb3cgRXJyb3IoXCJTdHJpbmcgb2YgSEVYIHR5cGUgbXVzdCBiZSBpbiBieXRlIGluY3JlbWVudHNcIik7Yz1jfHxbMF07ZD1kfHwwO3E9ZD4+PjM7dT0tMT09PWI/MzowO2ZvcihsPTA7bDxnO2wrPTIpe3A9cGFyc2VJbnQoYS5zdWJzdHIobCwyKSwxNik7aWYoaXNOYU4ocCkpdGhyb3cgRXJyb3IoXCJTdHJpbmcgb2YgSEVYIHR5cGUgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzXCIpO209KGw+Pj4xKStxO2ZvcihmPW0+Pj4yO2MubGVuZ3RoPD1mOyljLnB1c2goMCk7Y1tmXXw9cDw8OCoodSttJTQqYil9cmV0dXJue3ZhbHVlOmMsYmluTGVuOjQqZytkfX07YnJlYWs7Y2FzZSBcIlRFWFRcIjpjPWZ1bmN0aW9uKGMsaCxkKXt2YXIgZyxsLHA9MCxmLG0scSx1LHIsdDtoPWh8fFswXTtkPWR8fDA7cT1kPj4+MztpZihcIlVURjhcIj09PWEpZm9yKHQ9LTE9PT1cbmI/MzowLGY9MDtmPGMubGVuZ3RoO2YrPTEpZm9yKGc9Yy5jaGFyQ29kZUF0KGYpLGw9W10sMTI4Pmc/bC5wdXNoKGcpOjIwNDg+Zz8obC5wdXNoKDE5MnxnPj4+NiksbC5wdXNoKDEyOHxnJjYzKSk6NTUyOTY+Z3x8NTczNDQ8PWc/bC5wdXNoKDIyNHxnPj4+MTIsMTI4fGc+Pj42JjYzLDEyOHxnJjYzKTooZis9MSxnPTY1NTM2KygoZyYxMDIzKTw8MTB8Yy5jaGFyQ29kZUF0KGYpJjEwMjMpLGwucHVzaCgyNDB8Zz4+PjE4LDEyOHxnPj4+MTImNjMsMTI4fGc+Pj42JjYzLDEyOHxnJjYzKSksbT0wO208bC5sZW5ndGg7bSs9MSl7cj1wK3E7Zm9yKHU9cj4+PjI7aC5sZW5ndGg8PXU7KWgucHVzaCgwKTtoW3VdfD1sW21dPDw4Kih0K3IlNCpiKTtwKz0xfWVsc2UgaWYoXCJVVEYxNkJFXCI9PT1hfHxcIlVURjE2TEVcIj09PWEpZm9yKHQ9LTE9PT1iPzI6MCxsPVwiVVRGMTZMRVwiPT09YSYmMSE9PWJ8fFwiVVRGMTZMRVwiIT09YSYmMT09PWIsZj0wO2Y8Yy5sZW5ndGg7Zis9MSl7Zz1jLmNoYXJDb2RlQXQoZik7XG4hMD09PWwmJihtPWcmMjU1LGc9bTw8OHxnPj4+OCk7cj1wK3E7Zm9yKHU9cj4+PjI7aC5sZW5ndGg8PXU7KWgucHVzaCgwKTtoW3VdfD1nPDw4Kih0K3IlNCpiKTtwKz0yfXJldHVybnt2YWx1ZTpoLGJpbkxlbjo4KnArZH19O2JyZWFrO2Nhc2UgXCJCNjRcIjpjPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZz0wLGwscCxmLG0scSx1LHIsdDtpZigtMT09PWEuc2VhcmNoKC9eW2EtekEtWjAtOT0rXFwvXSskLykpdGhyb3cgRXJyb3IoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBiYXNlLTY0IHN0cmluZ1wiKTtwPWEuaW5kZXhPZihcIj1cIik7YT1hLnJlcGxhY2UoL1xcPS9nLFwiXCIpO2lmKC0xIT09cCYmcDxhLmxlbmd0aCl0aHJvdyBFcnJvcihcIkludmFsaWQgJz0nIGZvdW5kIGluIGJhc2UtNjQgc3RyaW5nXCIpO2M9Y3x8WzBdO2Q9ZHx8MDt1PWQ+Pj4zO3Q9LTE9PT1iPzM6MDtmb3IocD0wO3A8YS5sZW5ndGg7cCs9NCl7cT1hLnN1YnN0cihwLDQpO2ZvcihmPW09MDtmPHEubGVuZ3RoO2YrPTEpbD1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIi5pbmRleE9mKHFbZl0pLFxubXw9bDw8MTgtNipmO2ZvcihmPTA7ZjxxLmxlbmd0aC0xO2YrPTEpe3I9Zyt1O2ZvcihsPXI+Pj4yO2MubGVuZ3RoPD1sOyljLnB1c2goMCk7Y1tsXXw9KG0+Pj4xNi04KmYmMjU1KTw8OCoodCtyJTQqYik7Zys9MX19cmV0dXJue3ZhbHVlOmMsYmluTGVuOjgqZytkfX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6Yz1mdW5jdGlvbihhLGMsZCl7dmFyIGcsbCxwLGYsbSxxO2M9Y3x8WzBdO2Q9ZHx8MDtwPWQ+Pj4zO3E9LTE9PT1iPzM6MDtmb3IobD0wO2w8YS5sZW5ndGg7bCs9MSlnPWEuY2hhckNvZGVBdChsKSxtPWwrcCxmPW0+Pj4yLGMubGVuZ3RoPD1mJiZjLnB1c2goMCksY1tmXXw9Zzw8OCoocSttJTQqYik7cmV0dXJue3ZhbHVlOmMsYmluTGVuOjgqYS5sZW5ndGgrZH19O2JyZWFrO2Nhc2UgXCJBUlJBWUJVRkZFUlwiOnRyeXtjPW5ldyBBcnJheUJ1ZmZlcigwKX1jYXRjaChlKXt0aHJvdyBFcnJvcihcIkFSUkFZQlVGRkVSIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTt9Yz1cbmZ1bmN0aW9uKGEsYyxkKXt2YXIgZyxsLHAsZixtLHE7Yz1jfHxbMF07ZD1kfHwwO2w9ZD4+PjM7bT0tMT09PWI/MzowO3E9bmV3IFVpbnQ4QXJyYXkoYSk7Zm9yKGc9MDtnPGEuYnl0ZUxlbmd0aDtnKz0xKWY9ZytsLHA9Zj4+PjIsYy5sZW5ndGg8PXAmJmMucHVzaCgwKSxjW3BdfD1xW2ddPDw4KihtK2YlNCpiKTtyZXR1cm57dmFsdWU6YyxiaW5MZW46OCphLmJ5dGVMZW5ndGgrZH19O2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJmb3JtYXQgbXVzdCBiZSBIRVgsIFRFWFQsIEI2NCwgQllURVMsIG9yIEFSUkFZQlVGRkVSXCIpO31yZXR1cm4gY31mdW5jdGlvbiB5KGMsYSl7cmV0dXJuIGM8PGF8Yz4+PjMyLWF9ZnVuY3Rpb24gUyhjLGEpe3JldHVybiAzMjxhPyhhLT0zMixuZXcgYihjLmI8PGF8Yy5hPj4+MzItYSxjLmE8PGF8Yy5iPj4+MzItYSkpOjAhPT1hP25ldyBiKGMuYTw8YXxjLmI+Pj4zMi1hLGMuYjw8YXxjLmE+Pj4zMi1hKTpjfWZ1bmN0aW9uIHcoYyxhKXtyZXR1cm4gYz4+PlxuYXxjPDwzMi1hfWZ1bmN0aW9uIHQoYyxhKXt2YXIgaz1udWxsLGs9bmV3IGIoYy5hLGMuYik7cmV0dXJuIGs9MzI+PWE/bmV3IGIoay5hPj4+YXxrLmI8PDMyLWEmNDI5NDk2NzI5NSxrLmI+Pj5hfGsuYTw8MzItYSY0Mjk0OTY3Mjk1KTpuZXcgYihrLmI+Pj5hLTMyfGsuYTw8NjQtYSY0Mjk0OTY3Mjk1LGsuYT4+PmEtMzJ8ay5iPDw2NC1hJjQyOTQ5NjcyOTUpfWZ1bmN0aW9uIFQoYyxhKXt2YXIgaz1udWxsO3JldHVybiBrPTMyPj1hP25ldyBiKGMuYT4+PmEsYy5iPj4+YXxjLmE8PDMyLWEmNDI5NDk2NzI5NSk6bmV3IGIoMCxjLmE+Pj5hLTMyKX1mdW5jdGlvbiBhYShjLGEsYil7cmV0dXJuIGMmYV5+YyZifWZ1bmN0aW9uIGJhKGMsYSxrKXtyZXR1cm4gbmV3IGIoYy5hJmEuYV5+Yy5hJmsuYSxjLmImYS5iXn5jLmImay5iKX1mdW5jdGlvbiBVKGMsYSxiKXtyZXR1cm4gYyZhXmMmYl5hJmJ9ZnVuY3Rpb24gY2EoYyxhLGspe3JldHVybiBuZXcgYihjLmEmYS5hXmMuYSZrLmFeYS5hJlxuay5hLGMuYiZhLmJeYy5iJmsuYl5hLmImay5iKX1mdW5jdGlvbiBkYShjKXtyZXR1cm4gdyhjLDIpXncoYywxMyledyhjLDIyKX1mdW5jdGlvbiBlYShjKXt2YXIgYT10KGMsMjgpLGs9dChjLDM0KTtjPXQoYywzOSk7cmV0dXJuIG5ldyBiKGEuYV5rLmFeYy5hLGEuYl5rLmJeYy5iKX1mdW5jdGlvbiBmYShjKXtyZXR1cm4gdyhjLDYpXncoYywxMSledyhjLDI1KX1mdW5jdGlvbiBnYShjKXt2YXIgYT10KGMsMTQpLGs9dChjLDE4KTtjPXQoYyw0MSk7cmV0dXJuIG5ldyBiKGEuYV5rLmFeYy5hLGEuYl5rLmJeYy5iKX1mdW5jdGlvbiBoYShjKXtyZXR1cm4gdyhjLDcpXncoYywxOCleYz4+PjN9ZnVuY3Rpb24gaWEoYyl7dmFyIGE9dChjLDEpLGs9dChjLDgpO2M9VChjLDcpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gamEoYyl7cmV0dXJuIHcoYywxNyledyhjLDE5KV5jPj4+MTB9ZnVuY3Rpb24ga2EoYyl7dmFyIGE9dChjLDE5KSxrPXQoYyw2MSk7XG5jPVQoYyw2KTtyZXR1cm4gbmV3IGIoYS5hXmsuYV5jLmEsYS5iXmsuYl5jLmIpfWZ1bmN0aW9uIEcoYyxhKXt2YXIgYj0oYyY2NTUzNSkrKGEmNjU1MzUpO3JldHVybigoYz4+PjE2KSsoYT4+PjE2KSsoYj4+PjE2KSY2NTUzNSk8PDE2fGImNjU1MzV9ZnVuY3Rpb24gbGEoYyxhLGIsZSl7dmFyIGg9KGMmNjU1MzUpKyhhJjY1NTM1KSsoYiY2NTUzNSkrKGUmNjU1MzUpO3JldHVybigoYz4+PjE2KSsoYT4+PjE2KSsoYj4+PjE2KSsoZT4+PjE2KSsoaD4+PjE2KSY2NTUzNSk8PDE2fGgmNjU1MzV9ZnVuY3Rpb24gSChjLGEsYixlLGgpe3ZhciBkPShjJjY1NTM1KSsoYSY2NTUzNSkrKGImNjU1MzUpKyhlJjY1NTM1KSsoaCY2NTUzNSk7cmV0dXJuKChjPj4+MTYpKyhhPj4+MTYpKyhiPj4+MTYpKyhlPj4+MTYpKyhoPj4+MTYpKyhkPj4+MTYpJjY1NTM1KTw8MTZ8ZCY2NTUzNX1mdW5jdGlvbiBtYShjLGEpe3ZhciBkLGUsaDtkPShjLmImNjU1MzUpKyhhLmImNjU1MzUpO2U9KGMuYj4+PjE2KStcbihhLmI+Pj4xNikrKGQ+Pj4xNik7aD0oZSY2NTUzNSk8PDE2fGQmNjU1MzU7ZD0oYy5hJjY1NTM1KSsoYS5hJjY1NTM1KSsoZT4+PjE2KTtlPShjLmE+Pj4xNikrKGEuYT4+PjE2KSsoZD4+PjE2KTtyZXR1cm4gbmV3IGIoKGUmNjU1MzUpPDwxNnxkJjY1NTM1LGgpfWZ1bmN0aW9uIG5hKGMsYSxkLGUpe3ZhciBoLG4sZztoPShjLmImNjU1MzUpKyhhLmImNjU1MzUpKyhkLmImNjU1MzUpKyhlLmImNjU1MzUpO249KGMuYj4+PjE2KSsoYS5iPj4+MTYpKyhkLmI+Pj4xNikrKGUuYj4+PjE2KSsoaD4+PjE2KTtnPShuJjY1NTM1KTw8MTZ8aCY2NTUzNTtoPShjLmEmNjU1MzUpKyhhLmEmNjU1MzUpKyhkLmEmNjU1MzUpKyhlLmEmNjU1MzUpKyhuPj4+MTYpO249KGMuYT4+PjE2KSsoYS5hPj4+MTYpKyhkLmE+Pj4xNikrKGUuYT4+PjE2KSsoaD4+PjE2KTtyZXR1cm4gbmV3IGIoKG4mNjU1MzUpPDwxNnxoJjY1NTM1LGcpfWZ1bmN0aW9uIG9hKGMsYSxkLGUsaCl7dmFyIG4sZyxsO249KGMuYiZcbjY1NTM1KSsoYS5iJjY1NTM1KSsoZC5iJjY1NTM1KSsoZS5iJjY1NTM1KSsoaC5iJjY1NTM1KTtnPShjLmI+Pj4xNikrKGEuYj4+PjE2KSsoZC5iPj4+MTYpKyhlLmI+Pj4xNikrKGguYj4+PjE2KSsobj4+PjE2KTtsPShnJjY1NTM1KTw8MTZ8biY2NTUzNTtuPShjLmEmNjU1MzUpKyhhLmEmNjU1MzUpKyhkLmEmNjU1MzUpKyhlLmEmNjU1MzUpKyhoLmEmNjU1MzUpKyhnPj4+MTYpO2c9KGMuYT4+PjE2KSsoYS5hPj4+MTYpKyhkLmE+Pj4xNikrKGUuYT4+PjE2KSsoaC5hPj4+MTYpKyhuPj4+MTYpO3JldHVybiBuZXcgYigoZyY2NTUzNSk8PDE2fG4mNjU1MzUsbCl9ZnVuY3Rpb24gQihjLGEpe3JldHVybiBuZXcgYihjLmFeYS5hLGMuYl5hLmIpfWZ1bmN0aW9uIEEoYyl7dmFyIGE9W10sZDtpZihcIlNIQS0xXCI9PT1jKWE9WzE3MzI1ODQxOTMsNDAyMzIzMzQxNywyNTYyMzgzMTAyLDI3MTczMzg3OCwzMjg1Mzc3NTIwXTtlbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBLVwiLDApKXN3aXRjaChhPVxuWzMyMzgzNzEwMzIsOTE0MTUwNjYzLDgxMjcwMjk5OSw0MTQ0OTEyNjk3LDQyOTA3NzU4NTcsMTc1MDYwMzAyNSwxNjk0MDc2ODM5LDMyMDQwNzU0MjhdLGQ9WzE3NzkwMzM3MDMsMzE0NDEzNDI3NywxMDEzOTA0MjQyLDI3NzM0ODA3NjIsMTM1OTg5MzExOSwyNjAwODIyOTI0LDUyODczNDYzNSwxNTQxNDU5MjI1XSxjKXtjYXNlIFwiU0hBLTIyNFwiOmJyZWFrO2Nhc2UgXCJTSEEtMjU2XCI6YT1kO2JyZWFrO2Nhc2UgXCJTSEEtMzg0XCI6YT1bbmV3IGIoMzQxODA3MDM2NSxhWzBdKSxuZXcgYigxNjU0MjcwMjUwLGFbMV0pLG5ldyBiKDI0Mzg1MjkzNzAsYVsyXSksbmV3IGIoMzU1NDYyMzYwLGFbM10pLG5ldyBiKDE3MzE0MDU0MTUsYVs0XSksbmV3IGIoNDEwNDg4ODU4OTUsYVs1XSksbmV3IGIoMzY3NTAwODUyNSxhWzZdKSxuZXcgYigxMjAzMDYyODEzLGFbN10pXTticmVhaztjYXNlIFwiU0hBLTUxMlwiOmE9W25ldyBiKGRbMF0sNDA4OTIzNTcyMCksbmV3IGIoZFsxXSwyMjI3ODczNTk1KSxcbm5ldyBiKGRbMl0sNDI3MTE3NTcyMyksbmV3IGIoZFszXSwxNTk1NzUwMTI5KSxuZXcgYihkWzRdLDI5MTc1NjUxMzcpLG5ldyBiKGRbNV0sNzI1NTExMTk5KSxuZXcgYihkWzZdLDQyMTUzODk1NDcpLG5ldyBiKGRbN10sMzI3MDMzMjA5KV07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIlVua25vd24gU0hBIHZhcmlhbnRcIik7fWVsc2UgaWYoMD09PWMubGFzdEluZGV4T2YoXCJTSEEzLVwiLDApfHwwPT09Yy5sYXN0SW5kZXhPZihcIlNIQUtFXCIsMCkpZm9yKGM9MDs1PmM7Yys9MSlhW2NdPVtuZXcgYigwLDApLG5ldyBiKDAsMCksbmV3IGIoMCwwKSxuZXcgYigwLDApLG5ldyBiKDAsMCldO2Vsc2UgdGhyb3cgRXJyb3IoXCJObyBTSEEgdmFyaWFudHMgc3VwcG9ydGVkXCIpO3JldHVybiBhfWZ1bmN0aW9uIEsoYyxhKXt2YXIgYj1bXSxlLGQsbixnLGwscCxmO2U9YVswXTtkPWFbMV07bj1hWzJdO2c9YVszXTtsPWFbNF07Zm9yKGY9MDs4MD5mO2YrPTEpYltmXT0xNj5mP2NbZl06eShiW2YtXG4zXV5iW2YtOF1eYltmLTE0XV5iW2YtMTZdLDEpLHA9MjA+Zj9IKHkoZSw1KSxkJm5efmQmZyxsLDE1MTg1MDAyNDksYltmXSk6NDA+Zj9IKHkoZSw1KSxkXm5eZyxsLDE4NTk3NzUzOTMsYltmXSk6NjA+Zj9IKHkoZSw1KSxVKGQsbixnKSxsLDI0MDA5NTk3MDgsYltmXSk6SCh5KGUsNSksZF5uXmcsbCwzMzk1NDY5NzgyLGJbZl0pLGw9ZyxnPW4sbj15KGQsMzApLGQ9ZSxlPXA7YVswXT1HKGUsYVswXSk7YVsxXT1HKGQsYVsxXSk7YVsyXT1HKG4sYVsyXSk7YVszXT1HKGcsYVszXSk7YVs0XT1HKGwsYVs0XSk7cmV0dXJuIGF9ZnVuY3Rpb24gWihjLGEsYixlKXt2YXIgZDtmb3IoZD0oYSs2NT4+Pjk8PDQpKzE1O2MubGVuZ3RoPD1kOyljLnB1c2goMCk7Y1thPj4+NV18PTEyODw8MjQtYSUzMjthKz1iO2NbZF09YSY0Mjk0OTY3Mjk1O2NbZC0xXT1hLzQyOTQ5NjcyOTZ8MDthPWMubGVuZ3RoO2ZvcihkPTA7ZDxhO2QrPTE2KWU9SyhjLnNsaWNlKGQsZCsxNiksZSk7cmV0dXJuIGV9ZnVuY3Rpb24gTChjLFxuYSxrKXt2YXIgZSxoLG4sZyxsLHAsZixtLHEsdSxyLHQsdix3LHksQSx6LHgsRixCLEMsRCxFPVtdLEo7aWYoXCJTSEEtMjI0XCI9PT1rfHxcIlNIQS0yNTZcIj09PWspdT02NCx0PTEsRD1OdW1iZXIsdj1HLHc9bGEseT1ILEE9aGEsej1qYSx4PWRhLEY9ZmEsQz1VLEI9YWEsSj1kO2Vsc2UgaWYoXCJTSEEtMzg0XCI9PT1rfHxcIlNIQS01MTJcIj09PWspdT04MCx0PTIsRD1iLHY9bWEsdz1uYSx5PW9hLEE9aWEsej1rYSx4PWVhLEY9Z2EsQz1jYSxCPWJhLEo9VjtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtrPWFbMF07ZT1hWzFdO2g9YVsyXTtuPWFbM107Zz1hWzRdO2w9YVs1XTtwPWFbNl07Zj1hWzddO2ZvcihyPTA7cjx1O3IrPTEpMTY+cj8ocT1yKnQsbT1jLmxlbmd0aDw9cT8wOmNbcV0scT1jLmxlbmd0aDw9cSsxPzA6Y1txKzFdLEVbcl09bmV3IEQobSxxKSk6RVtyXT13KHooRVtyLTJdKSxFW3ItN10sQShFW3ItMTVdKSxFW3ItXG4xNl0pLG09eShmLEYoZyksQihnLGwscCksSltyXSxFW3JdKSxxPXYoeChrKSxDKGssZSxoKSksZj1wLHA9bCxsPWcsZz12KG4sbSksbj1oLGg9ZSxlPWssaz12KG0scSk7YVswXT12KGssYVswXSk7YVsxXT12KGUsYVsxXSk7YVsyXT12KGgsYVsyXSk7YVszXT12KG4sYVszXSk7YVs0XT12KGcsYVs0XSk7YVs1XT12KGwsYVs1XSk7YVs2XT12KHAsYVs2XSk7YVs3XT12KGYsYVs3XSk7cmV0dXJuIGF9ZnVuY3Rpb24gRChjLGEpe3ZhciBkLGUsaCxuLGc9W10sbD1bXTtpZihudWxsIT09Yylmb3IoZT0wO2U8Yy5sZW5ndGg7ZSs9MilhWyhlPj4+MSklNV1bKGU+Pj4xKS81fDBdPUIoYVsoZT4+PjEpJTVdWyhlPj4+MSkvNXwwXSxuZXcgYihjW2UrMV0sY1tlXSkpO2ZvcihkPTA7MjQ+ZDtkKz0xKXtuPUEoXCJTSEEzLVwiKTtmb3IoZT0wOzU+ZTtlKz0xKXtoPWFbZV1bMF07dmFyIHA9YVtlXVsxXSxmPWFbZV1bMl0sbT1hW2VdWzNdLHE9YVtlXVs0XTtnW2VdPW5ldyBiKGguYV5wLmFeZi5hXlxubS5hXnEuYSxoLmJecC5iXmYuYl5tLmJecS5iKX1mb3IoZT0wOzU+ZTtlKz0xKWxbZV09QihnWyhlKzQpJTVdLFMoZ1soZSsxKSU1XSwxKSk7Zm9yKGU9MDs1PmU7ZSs9MSlmb3IoaD0wOzU+aDtoKz0xKWFbZV1baF09QihhW2VdW2hdLGxbZV0pO2ZvcihlPTA7NT5lO2UrPTEpZm9yKGg9MDs1Pmg7aCs9MSluW2hdWygyKmUrMypoKSU1XT1TKGFbZV1baF0sV1tlXVtoXSk7Zm9yKGU9MDs1PmU7ZSs9MSlmb3IoaD0wOzU+aDtoKz0xKWFbZV1baF09QihuW2VdW2hdLG5ldyBiKH5uWyhlKzEpJTVdW2hdLmEmblsoZSsyKSU1XVtoXS5hLH5uWyhlKzEpJTVdW2hdLmImblsoZSsyKSU1XVtoXS5iKSk7YVswXVswXT1CKGFbMF1bMF0sWFtkXSl9cmV0dXJuIGF9dmFyIGQsVixXLFg7ZD1bMTExNjM1MjQwOCwxODk5NDQ3NDQxLDMwNDkzMjM0NzEsMzkyMTAwOTU3Myw5NjE5ODcxNjMsMTUwODk3MDk5MywyNDUzNjM1NzQ4LDI4NzA3NjMyMjEsMzYyNDM4MTA4MCwzMTA1OTg0MDEsNjA3MjI1Mjc4LFxuMTQyNjg4MTk4NywxOTI1MDc4Mzg4LDIxNjIwNzgyMDYsMjYxNDg4ODEwMywzMjQ4MjIyNTgwLDM4MzUzOTA0MDEsNDAyMjIyNDc3NCwyNjQzNDcwNzgsNjA0ODA3NjI4LDc3MDI1NTk4MywxMjQ5MTUwMTIyLDE1NTUwODE2OTIsMTk5NjA2NDk4NiwyNTU0MjIwODgyLDI4MjE4MzQzNDksMjk1Mjk5NjgwOCwzMjEwMzEzNjcxLDMzMzY1NzE4OTEsMzU4NDUyODcxMSwxMTM5MjY5OTMsMzM4MjQxODk1LDY2NjMwNzIwNSw3NzM1Mjk5MTIsMTI5NDc1NzM3MiwxMzk2MTgyMjkxLDE2OTUxODM3MDAsMTk4NjY2MTA1MSwyMTc3MDI2MzUwLDI0NTY5NTYwMzcsMjczMDQ4NTkyMSwyODIwMzAyNDExLDMyNTk3MzA4MDAsMzM0NTc2NDc3MSwzNTE2MDY1ODE3LDM2MDAzNTI4MDQsNDA5NDU3MTkwOSwyNzU0MjMzNDQsNDMwMjI3NzM0LDUwNjk0ODYxNiw2NTkwNjA1NTYsODgzOTk3ODc3LDk1ODEzOTU3MSwxMzIyODIyMjE4LDE1MzcwMDIwNjMsMTc0Nzg3Mzc3OSwxOTU1NTYyMjIyLDIwMjQxMDQ4MTUsXG4yMjI3NzMwNDUyLDIzNjE4NTI0MjQsMjQyODQzNjQ3NCwyNzU2NzM0MTg3LDMyMDQwMzE0NzksMzMyOTMyNTI5OF07Vj1bbmV3IGIoZFswXSwzNjA5NzY3NDU4KSxuZXcgYihkWzFdLDYwMjg5MTcyNSksbmV3IGIoZFsyXSwzOTY0NDg0Mzk5KSxuZXcgYihkWzNdLDIxNzMyOTU1NDgpLG5ldyBiKGRbNF0sNDA4MTYyODQ3MiksbmV3IGIoZFs1XSwzMDUzODM0MjY1KSxuZXcgYihkWzZdLDI5Mzc2NzE1NzkpLG5ldyBiKGRbN10sMzY2NDYwOTU2MCksbmV3IGIoZFs4XSwyNzM0ODgzMzk0KSxuZXcgYihkWzldLDExNjQ5OTY1NDIpLG5ldyBiKGRbMTBdLDEzMjM2MTA3NjQpLG5ldyBiKGRbMTFdLDM1OTAzMDQ5OTQpLG5ldyBiKGRbMTJdLDQwNjgxODIzODMpLG5ldyBiKGRbMTNdLDk5MTMzNjExMyksbmV3IGIoZFsxNF0sNjMzODAzMzE3KSxuZXcgYihkWzE1XSwzNDc5Nzc0ODY4KSxuZXcgYihkWzE2XSwyNjY2NjEzNDU4KSxuZXcgYihkWzE3XSw5NDQ3MTExMzkpLG5ldyBiKGRbMThdLDIzNDEyNjI3NzMpLFxubmV3IGIoZFsxOV0sMjAwNzgwMDkzMyksbmV3IGIoZFsyMF0sMTQ5NTk5MDkwMSksbmV3IGIoZFsyMV0sMTg1NjQzMTIzNSksbmV3IGIoZFsyMl0sMzE3NTIxODEzMiksbmV3IGIoZFsyM10sMjE5ODk1MDgzNyksbmV3IGIoZFsyNF0sMzk5OTcxOTMzOSksbmV3IGIoZFsyNV0sNzY2Nzg0MDE2KSxuZXcgYihkWzI2XSwyNTY2NTk0ODc5KSxuZXcgYihkWzI3XSwzMjAzMzM3OTU2KSxuZXcgYihkWzI4XSwxMDM0NDU3MDI2KSxuZXcgYihkWzI5XSwyNDY2OTQ4OTAxKSxuZXcgYihkWzMwXSwzNzU4MzI2MzgzKSxuZXcgYihkWzMxXSwxNjg3MTc5MzYpLG5ldyBiKGRbMzJdLDExODgxNzk5NjQpLG5ldyBiKGRbMzNdLDE1NDYwNDU3MzQpLG5ldyBiKGRbMzRdLDE1MjI4MDU0ODUpLG5ldyBiKGRbMzVdLDI2NDM4MzM4MjMpLG5ldyBiKGRbMzZdLDIzNDM1MjczOTApLG5ldyBiKGRbMzddLDEwMTQ0Nzc0ODApLG5ldyBiKGRbMzhdLDEyMDY3NTkxNDIpLG5ldyBiKGRbMzldLDM0NDA3NzYyNyksXG5uZXcgYihkWzQwXSwxMjkwODYzNDYwKSxuZXcgYihkWzQxXSwzMTU4NDU0MjczKSxuZXcgYihkWzQyXSwzNTA1OTUyNjU3KSxuZXcgYihkWzQzXSwxMDYyMTcwMDgpLG5ldyBiKGRbNDRdLDM2MDYwMDgzNDQpLG5ldyBiKGRbNDVdLDE0MzI3MjU3NzYpLG5ldyBiKGRbNDZdLDE0NjcwMzE1OTQpLG5ldyBiKGRbNDddLDg1MTE2OTcyMCksbmV3IGIoZFs0OF0sMzEwMDgyMzc1MiksbmV3IGIoZFs0OV0sMTM2MzI1ODE5NSksbmV3IGIoZFs1MF0sMzc1MDY4NTU5MyksbmV3IGIoZFs1MV0sMzc4NTA1MDI4MCksbmV3IGIoZFs1Ml0sMzMxODMwNzQyNyksbmV3IGIoZFs1M10sMzgxMjcyMzQwMyksbmV3IGIoZFs1NF0sMjAwMzAzNDk5NSksbmV3IGIoZFs1NV0sMzYwMjAzNjg5OSksbmV3IGIoZFs1Nl0sMTU3NTk5MDAxMiksbmV3IGIoZFs1N10sMTEyNTU5MjkyOCksbmV3IGIoZFs1OF0sMjcxNjkwNDMwNiksbmV3IGIoZFs1OV0sNDQyNzc2MDQ0KSxuZXcgYihkWzYwXSw1OTM2OTgzNDQpLG5ldyBiKGRbNjFdLFxuMzczMzExMDI0OSksbmV3IGIoZFs2Ml0sMjk5OTM1MTU3MyksbmV3IGIoZFs2M10sMzgxNTkyMDQyNyksbmV3IGIoMzM5MTU2OTYxNCwzOTI4MzgzOTAwKSxuZXcgYigzNTE1MjY3MjcxLDU2NjI4MDcxMSksbmV3IGIoMzk0MDE4NzYwNiwzNDU0MDY5NTM0KSxuZXcgYig0MTE4NjMwMjcxLDQwMDAyMzk5OTIpLG5ldyBiKDExNjQxODQ3NCwxOTE0MTM4NTU0KSxuZXcgYigxNzQyOTI0MjEsMjczMTA1NTI3MCksbmV3IGIoMjg5MzgwMzU2LDMyMDM5OTMwMDYpLG5ldyBiKDQ2MDM5MzI2OSwzMjA2MjAzMTUpLG5ldyBiKDY4NTQ3MTczMyw1ODc0OTY4MzYpLG5ldyBiKDg1MjE0Mjk3MSwxMDg2NzkyODUxKSxuZXcgYigxMDE3MDM2Mjk4LDM2NTU0MzEwMCksbmV3IGIoMTEyNjAwMDU4MCwyNjE4Mjk3Njc2KSxuZXcgYigxMjg4MDMzNDcwLDM0MDk4NTUxNTgpLG5ldyBiKDE1MDE1MDU5NDgsNDIzNDUwOTg2NiksbmV3IGIoMTYwNzE2NzkxNSw5ODcxNjc0NjgpLG5ldyBiKDE4MTY0MDIzMTYsXG4xMjQ2MTg5NTkxKV07WD1bbmV3IGIoMCwxKSxuZXcgYigwLDMyODk4KSxuZXcgYigyMTQ3NDgzNjQ4LDMyOTA2KSxuZXcgYigyMTQ3NDgzNjQ4LDIxNDc1MTY0MTYpLG5ldyBiKDAsMzI5MDcpLG5ldyBiKDAsMjE0NzQ4MzY0OSksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NTQ1KSxuZXcgYigyMTQ3NDgzNjQ4LDMyNzc3KSxuZXcgYigwLDEzOCksbmV3IGIoMCwxMzYpLG5ldyBiKDAsMjE0NzUxNjQyNSksbmV3IGIoMCwyMTQ3NDgzNjU4KSxuZXcgYigwLDIxNDc1MTY1NTUpLG5ldyBiKDIxNDc0ODM2NDgsMTM5KSxuZXcgYigyMTQ3NDgzNjQ4LDMyOTA1KSxuZXcgYigyMTQ3NDgzNjQ4LDMyNzcxKSxuZXcgYigyMTQ3NDgzNjQ4LDMyNzcwKSxuZXcgYigyMTQ3NDgzNjQ4LDEyOCksbmV3IGIoMCwzMjc3OCksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NDgzNjU4KSxuZXcgYigyMTQ3NDgzNjQ4LDIxNDc1MTY1NDUpLG5ldyBiKDIxNDc0ODM2NDgsMzI4OTYpLG5ldyBiKDAsMjE0NzQ4MzY0OSksXG5uZXcgYigyMTQ3NDgzNjQ4LDIxNDc1MTY0MjQpXTtXPVtbMCwzNiwzLDQxLDE4XSxbMSw0NCwxMCw0NSwyXSxbNjIsNiw0MywxNSw2MV0sWzI4LDU1LDI1LDIxLDU2XSxbMjcsMjAsMzksOCwxNF1dO1wiZnVuY3Rpb25cIj09PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIEN9KTpcInVuZGVmaW5lZFwiIT09dHlwZW9mIGV4cG9ydHM/KFwidW5kZWZpbmVkXCIhPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPUMpLGV4cG9ydHM9Qyk6WS5qc1NIQT1DfSkodGhpcyk7XG4iLCJpbXBvcnQganNTSEEgZnJvbSAnanNzaGEnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVVVUlEKCkge1xuICBpZiAod2luZG93LmNyeXB0byAmJiB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIHZhciBidWYgPSBuZXcgVWludDE2QXJyYXkoOCk7XG4gICAgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMoYnVmKTtcbiAgICB2YXIgUzQgPSBmdW5jdGlvbihudW0pIHsgdmFyIHJldCA9IG51bS50b1N0cmluZygxNik7IHdoaWxlKHJldC5sZW5ndGggPCA0KSByZXQgPSAnMCcrcmV0OyByZXR1cm4gcmV0OyB9O1xuICAgIHJldHVybiBTNChidWZbMF0pK1M0KGJ1ZlsxXSkrJy0nK1M0KGJ1ZlsyXSkrJy0nK1M0KGJ1ZlszXSkrJy0nK1M0KGJ1Zls0XSkrJy0nK1M0KGJ1Zls1XSkrUzQoYnVmWzZdKStTNChidWZbN10pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gSGFzaGVzIHRoZSBnaXZlbiB0ZXh0IHRvIGEgVVVJRCBzdHJpbmcgb2YgZm9ybSAneHh4eHh4eHgteXl5eS16enp6LXd3d3ctYWFhYWFhYWFhYWFhJy5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoVG9VVUlEKHRleHQpIHtcbiAgdmFyIHNoYU9iaiA9IG5ldyBqc1NIQSgnU0hBLTI1NicsICdURVhUJyk7XG4gIHNoYU9iai51cGRhdGUodGV4dCk7XG4gIHZhciBoYXNoID0gbmV3IFVpbnQ4QXJyYXkoc2hhT2JqLmdldEhhc2goJ0FSUkFZQlVGRkVSJykpO1xuICBcbiAgdmFyIG4gPSAnJztcbiAgZm9yKHZhciBpID0gMDsgaSA8IGhhc2guYnl0ZUxlbmd0aC8yOyArK2kpIHtcbiAgICB2YXIgcyA9IChoYXNoW2ldIF4gaGFzaFtpKzhdKS50b1N0cmluZygxNik7XG4gICAgaWYgKHMubGVuZ3RoID09IDEpIHMgPSAnMCcgKyBzO1xuICAgIG4gKz0gcztcbiAgfVxuICByZXR1cm4gbi5zbGljZSgwLCA4KSArICctJyArIG4uc2xpY2UoOCwgMTIpICsgJy0nICsgbi5zbGljZSgxMiwgMTYpICsgJy0nICsgbi5zbGljZSgxNiwgMjApICsgJy0nICsgbi5zbGljZSgyMCk7XG59XG4iLCJ2YXIgcmVzdWx0c1NlcnZlclVybCA9ICdodHRwOi8vbG9jYWxob3N0OjMzMzMvJztcblxudmFyIHVwbG9hZFJlc3VsdHNUb1Jlc3VsdHNTZXJ2ZXIgPSB0cnVlO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXN1bHRzU2VydmVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gIH1cblxuICBzdG9yZVN0YXJ0KHJlc3VsdHMpIHtcbiAgICBpZiAoIXVwbG9hZFJlc3VsdHNUb1Jlc3VsdHNTZXJ2ZXIpIHJldHVybjtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oXCJQT1NUXCIsIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3Rfc3RhcnRcIiwgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICBjb25zb2xlLmxvZygnUmVzdWx0c1NlcnZlcjogUmVjb3JkZWQgdGVzdCBzdGFydCB0byAnICsgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9zdGFydFwiKTtcbiAgfVxuXG4gIHN0b3JlU3lzdGVtSW5mbyhyZXN1bHRzKSB7XG4gICAgaWYgKCF1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyKSByZXR1cm47XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV9zeXN0ZW1faW5mb1wiLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpO1xuICAgIGNvbnNvbGUubG9nKCdSZXN1bHRzU2VydmVyOiBVcGxvYWRlZCBzeXN0ZW0gaW5mbyB0byAnICsgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfc3lzdGVtX2luZm9cIik7XG4gIH1cblxuICBzdG9yZVRlc3RSZXN1bHRzKHJlc3VsdHMpIHtcbiAgICBpZiAoIXVwbG9hZFJlc3VsdHNUb1Jlc3VsdHNTZXJ2ZXIpIHJldHVybjtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oXCJQT1NUXCIsIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3RfcmVzdWx0c1wiLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpO1xuICAgIGNvbnNvbGUubG9nKCdSZXN1bHRzU2VydmVyOiBSZWNvcmRlZCB0ZXN0IGZpbmlzaCB0byAnICsgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9yZXN1bHRzXCIpO1xuICB9ICBcbn07XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHN0ciA9PiBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC9bIScoKSpdL2csIHggPT4gYCUke3guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX1gKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB0b2tlbiA9ICclW2EtZjAtOV17Mn0nO1xudmFyIHNpbmdsZU1hdGNoZXIgPSBuZXcgUmVnRXhwKHRva2VuLCAnZ2knKTtcbnZhciBtdWx0aU1hdGNoZXIgPSBuZXcgUmVnRXhwKCcoJyArIHRva2VuICsgJykrJywgJ2dpJyk7XG5cbmZ1bmN0aW9uIGRlY29kZUNvbXBvbmVudHMoY29tcG9uZW50cywgc3BsaXQpIHtcblx0dHJ5IHtcblx0XHQvLyBUcnkgdG8gZGVjb2RlIHRoZSBlbnRpcmUgc3RyaW5nIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb21wb25lbnRzLmpvaW4oJycpKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRG8gbm90aGluZ1xuXHR9XG5cblx0aWYgKGNvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIGNvbXBvbmVudHM7XG5cdH1cblxuXHRzcGxpdCA9IHNwbGl0IHx8IDE7XG5cblx0Ly8gU3BsaXQgdGhlIGFycmF5IGluIDIgcGFydHNcblx0dmFyIGxlZnQgPSBjb21wb25lbnRzLnNsaWNlKDAsIHNwbGl0KTtcblx0dmFyIHJpZ2h0ID0gY29tcG9uZW50cy5zbGljZShzcGxpdCk7XG5cblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuY2FsbChbXSwgZGVjb2RlQ29tcG9uZW50cyhsZWZ0KSwgZGVjb2RlQ29tcG9uZW50cyhyaWdodCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0dmFyIHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlucHV0ID0gZGVjb2RlQ29tcG9uZW50cyh0b2tlbnMsIGkpLmpvaW4oJycpO1xuXG5cdFx0XHR0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KSB7XG5cdC8vIEtlZXAgdHJhY2sgb2YgYWxsIHRoZSByZXBsYWNlbWVudHMgYW5kIHByZWZpbGwgdGhlIG1hcCB3aXRoIHRoZSBgQk9NYFxuXHR2YXIgcmVwbGFjZU1hcCA9IHtcblx0XHQnJUZFJUZGJzogJ1xcdUZGRkRcXHVGRkZEJyxcblx0XHQnJUZGJUZFJzogJ1xcdUZGRkRcXHVGRkZEJ1xuXHR9O1xuXG5cdHZhciBtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0d2hpbGUgKG1hdGNoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIERlY29kZSBhcyBiaWcgY2h1bmtzIGFzIHBvc3NpYmxlXG5cdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVjb2RlKG1hdGNoWzBdKTtcblxuXHRcdFx0aWYgKHJlc3VsdCAhPT0gbWF0Y2hbMF0pIHtcblx0XHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdH1cblxuXHQvLyBBZGQgYCVDMmAgYXQgdGhlIGVuZCBvZiB0aGUgbWFwIHRvIG1ha2Ugc3VyZSBpdCBkb2VzIG5vdCByZXBsYWNlIHRoZSBjb21iaW5hdG9yIGJlZm9yZSBldmVyeXRoaW5nIGVsc2Vcblx0cmVwbGFjZU1hcFsnJUMyJ10gPSAnXFx1RkZGRCc7XG5cblx0dmFyIGVudHJpZXMgPSBPYmplY3Qua2V5cyhyZXBsYWNlTWFwKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBSZXBsYWNlIGFsbCBkZWNvZGVkIGNvbXBvbmVudHNcblx0XHR2YXIga2V5ID0gZW50cmllc1tpXTtcblx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cChrZXksICdnJyksIHJlcGxhY2VNYXBba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVuY29kZWRVUkkpIHtcblx0aWYgKHR5cGVvZiBlbmNvZGVkVVJJICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGBlbmNvZGVkVVJJYCB0byBiZSBvZiB0eXBlIGBzdHJpbmdgLCBnb3QgYCcgKyB0eXBlb2YgZW5jb2RlZFVSSSArICdgJyk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGVuY29kZWRVUkkgPSBlbmNvZGVkVVJJLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuXG5cdFx0Ly8gVHJ5IHRoZSBidWlsdCBpbiBkZWNvZGVyIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRmFsbGJhY2sgdG8gYSBtb3JlIGFkdmFuY2VkIGRlY29kZXJcblx0XHRyZXR1cm4gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc3RyaWN0VXJpRW5jb2RlID0gcmVxdWlyZSgnc3RyaWN0LXVyaS1lbmNvZGUnKTtcbmNvbnN0IGRlY29kZUNvbXBvbmVudCA9IHJlcXVpcmUoJ2RlY29kZS11cmktY29tcG9uZW50Jyk7XG5cbmZ1bmN0aW9uIGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgaW5kZXgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRpbmRleCxcblx0XHRcdFx0XHQnXSdcblx0XHRcdFx0XS5qb2luKCcnKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnWycsXG5cdFx0XHRcdFx0ZW5jb2RlKGluZGV4LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW10nXS5qb2luKCcnKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnW109Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gZW5jb2RlKGtleSwgb3B0aW9ucykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0Jz0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRsZXQgcmVzdWx0O1xuXG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gL1xcWyhcXGQqKVxcXSQvLmV4ZWMoa2V5KTtcblxuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxkKlxcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB7fTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV1bcmVzdWx0WzFdXSA9IHZhbHVlO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gLyhcXFtcXF0pJC8uZXhlYyhrZXkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFt2YWx1ZV07XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5lbmNvZGUpIHtcblx0XHRyZXR1cm4gb3B0aW9ucy5zdHJpY3QgPyBzdHJpY3RVcmlFbmNvZGUodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmRlY29kZSkge1xuXHRcdHJldHVybiBkZWNvZGVDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBrZXlzU29ydGVyKGlucHV0KSB7XG5cdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuXHRcdHJldHVybiBpbnB1dC5zb3J0KCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiBrZXlzU29ydGVyKE9iamVjdC5rZXlzKGlucHV0KSlcblx0XHRcdC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYSkgLSBOdW1iZXIoYikpXG5cdFx0XHQubWFwKGtleSA9PiBpbnB1dFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdChpbnB1dCkge1xuXHRjb25zdCBxdWVyeVN0YXJ0ID0gaW5wdXQuaW5kZXhPZignPycpO1xuXHRpZiAocXVlcnlTdGFydCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZGVjb2RlOiB0cnVlLCBhcnJheUZvcm1hdDogJ25vbmUnfSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKHJldCkuc29ydCgpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqLCBvcHRpb25zKSA9PiB7XG5cdGlmICghb2JqKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9LCBvcHRpb25zKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cdGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuXG5cdGlmIChvcHRpb25zLnNvcnQgIT09IGZhbHNlKSB7XG5cdFx0a2V5cy5zb3J0KG9wdGlvbnMuc29ydCk7XG5cdH1cblxuXHRyZXR1cm4ga2V5cy5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlMiBvZiB2YWx1ZS5zbGljZSgpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZTIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzdWx0LnB1c2goZm9ybWF0dGVyKGtleSwgdmFsdWUyLCByZXN1bHQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpO1xufTtcblxuZXhwb3J0cy5wYXJzZVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRjb25zdCBoYXNoU3RhcnQgPSBpbnB1dC5pbmRleE9mKCcjJyk7XG5cdGlmIChoYXNoU3RhcnQgIT09IC0xKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBoYXNoU3RhcnQpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHR1cmw6IGlucHV0LnNwbGl0KCc/JylbMF0gfHwgJycsXG5cdFx0cXVlcnk6IHBhcnNlKGV4dHJhY3QoaW5wdXQpLCBvcHRpb25zKVxuXHR9O1xufTtcbiIsImZ1bmN0aW9uIGFkZEdFVCh1cmwsIHBhcmFtZXRlcikge1xuICBpZiAodXJsLmluZGV4T2YoJz8nKSAhPSAtMSkgcmV0dXJuIHVybCArICcmJyArIHBhcmFtZXRlcjtcbiAgZWxzZSByZXR1cm4gdXJsICsgJz8nICsgcGFyYW1ldGVyO1xufVxuXG5mdW5jdGlvbiB5eXl5bW1kZGhobW1zcygpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICB2YXIgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1tID0gZGF0ZS5nZXRNb250aCgpIDwgOSA/IFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogKGRhdGUuZ2V0TW9udGgoKSArIDEpOyAvLyBnZXRNb250aCgpIGlzIHplcm8tYmFzZWRcbiAgdmFyIGRkICA9IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyBcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCk7XG4gIHZhciBoaCA9IGRhdGUuZ2V0SG91cnMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldEhvdXJzKCkgOiBkYXRlLmdldEhvdXJzKCk7XG4gIHZhciBtaW4gPSBkYXRlLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldE1pbnV0ZXMoKSA6IGRhdGUuZ2V0TWludXRlcygpO1xuICB2YXIgc2VjID0gZGF0ZS5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRTZWNvbmRzKCkgOiBkYXRlLmdldFNlY29uZHMoKTtcbiAgcmV0dXJuIHl5eXkgKyAnLScgKyBtbSArICctJyArIGRkICsgJyAnICsgaGggKyAnOicgKyBtaW4gKyAnOicgKyBzZWM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRHRVQ6IGFkZEdFVCxcbiAgeXl5eW1tZGRoaG1tc3M6IHl5eXltbWRkaGhtbXNzXG59OyIsImltcG9ydCBqc1NIQSBmcm9tICdqc3NoYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBVaW50MTZBcnJheSg4KTtcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWYpO1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKG51bSkgeyB2YXIgcmV0ID0gbnVtLnRvU3RyaW5nKDE2KTsgd2hpbGUocmV0Lmxlbmd0aCA8IDQpIHJldCA9ICcwJytyZXQ7IHJldHVybiByZXQ7IH07XG4gICAgcmV0dXJuIFM0KGJ1ZlswXSkrUzQoYnVmWzFdKSsnLScrUzQoYnVmWzJdKSsnLScrUzQoYnVmWzNdKSsnLScrUzQoYnVmWzRdKSsnLScrUzQoYnVmWzVdKStTNChidWZbNl0pK1M0KGJ1Zls3XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBIYXNoZXMgdGhlIGdpdmVuIHRleHQgdG8gYSBVVUlEIHN0cmluZyBvZiBmb3JtICd4eHh4eHh4eC15eXl5LXp6enotd3d3dy1hYWFhYWFhYWFhYWEnLlxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hUb1VVSUQodGV4dCkge1xuICB2YXIgc2hhT2JqID0gbmV3IGpzU0hBKCdTSEEtMjU2JywgJ1RFWFQnKTtcbiAgc2hhT2JqLnVwZGF0ZSh0ZXh0KTtcbiAgdmFyIGhhc2ggPSBuZXcgVWludDhBcnJheShzaGFPYmouZ2V0SGFzaCgnQVJSQVlCVUZGRVInKSk7XG4gIFxuICB2YXIgbiA9ICcnO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaC5ieXRlTGVuZ3RoLzI7ICsraSkge1xuICAgIHZhciBzID0gKGhhc2hbaV0gXiBoYXNoW2krOF0pLnRvU3RyaW5nKDE2KTtcbiAgICBpZiAocy5sZW5ndGggPT0gMSkgcyA9ICcwJyArIHM7XG4gICAgbiArPSBzO1xuICB9XG4gIHJldHVybiBuLnNsaWNlKDAsIDgpICsgJy0nICsgbi5zbGljZSg4LCAxMikgKyAnLScgKyBuLnNsaWNlKDEyLCAxNikgKyAnLScgKyBuLnNsaWNlKDE2LCAyMCkgKyAnLScgKyBuLnNsaWNlKDIwKTtcbn1cbiIsImNvbnN0IGFkZEdFVCA9IHJlcXVpcmUoJy4uLy4uL2Zyb250YXBwL3V0aWxzJykuYWRkR0VUO1xuXG5mdW5jdGlvbiBidWlsZFRlc3RVUkwoYmFzZVVSTCwgdGVzdCwgbW9kZSwgb3B0aW9ucywgcHJvZ3Jlc3MpIHtcbiAgdmFyIHVybCA9IGJhc2VVUkwgKyAobW9kZSA9PT0gJ2ludGVyYWN0aXZlJyA/ICdzdGF0aWMvJzogJ3Rlc3RzLycpICsgdGVzdC51cmw7XG5cbiAgaWYgKG1vZGUgIT09ICdpbnRlcmFjdGl2ZScpIHtcbiAgICBpZiAodGVzdC5udW1mcmFtZXMpIHVybCA9IGFkZEdFVCh1cmwsICdudW0tZnJhbWVzPScgKyB0ZXN0Lm51bWZyYW1lcyk7XG4gICAgaWYgKHRlc3Qud2luZG93c2l6ZSkgdXJsID0gYWRkR0VUKHVybCwgJ3dpZHRoPScgKyB0ZXN0LndpbmRvd3NpemUud2lkdGggKyAnJmhlaWdodD0nICsgdGVzdC53aW5kb3dzaXplLmhlaWdodCk7ICBcbiAgICBpZiAob3B0aW9ucy5mYWtlV2ViR0wpIHVybCA9IGFkZEdFVCh1cmwsICdmYWtlLXdlYmdsJyk7XG4gIFxuICAgIGlmIChtb2RlID09PSAncmVjb3JkJykge1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ3JlY29yZGluZycpO1xuICAgIH0gZWxzZSBpZiAodGVzdC5pbnB1dCAmJiBtb2RlID09PSAncmVwbGF5Jykge1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ3JlcGxheScpO1xuICAgICAgaWYgKG9wdGlvbnMuc2hvd0tleXMpIHVybCA9IGFkZEdFVCh1cmwsICdzaG93LWtleXMnKTtcbiAgICAgIGlmIChvcHRpb25zLnNob3dNb3VzZSkgdXJsID0gYWRkR0VUKHVybCwgJ3Nob3ctbW91c2UnKTtcbiAgICB9XG4gIFxuICAgIGlmIChvcHRpb25zLm5vQ2xvc2VPbkZhaWwpIHVybCA9IGFkZEdFVCh1cmwsICduby1jbG9zZS1vbi1mYWlsJyk7XG4gICAgaWYgKHRlc3Quc2tpcFJlZmVyZW5jZUltYWdlVGVzdCkgdXJsID0gYWRkR0VUKHVybCwgJ3NraXAtcmVmZXJlbmNlLWltYWdlLXRlc3QnKTtcbiAgICBpZiAodGVzdC5yZWZlcmVuY2VJbWFnZSkgdXJsID0gYWRkR0VUKHVybCwgJ3JlZmVyZW5jZS1pbWFnZScpO1xuICBcbiAgICBpZiAocHJvZ3Jlc3MpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdvcmRlci10ZXN0PScgKyBwcm9ncmVzcy50ZXN0c1t0ZXN0LmlkXS5jdXJyZW50ICsgJyZ0b3RhbC10ZXN0PScgKyBwcm9ncmVzcy50ZXN0c1t0ZXN0LmlkXS50b3RhbCk7XG4gICAgICB1cmwgPSBhZGRHRVQodXJsLCAnb3JkZXItZ2xvYmFsPScgKyBwcm9ncmVzcy5jdXJyZW50R2xvYmFsICsgJyZ0b3RhbC1nbG9iYWw9JyArIHByb2dyZXNzLnRvdGFsR2xvYmFsKTtcbiAgICB9ICBcbiAgfVxuICByZXR1cm4gdXJsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYnVpbGRUZXN0VVJMOiBidWlsZFRlc3RVUkwgIFxufTtcbiIsImltcG9ydCB7eXl5eW1tZGRoaG1tc3N9IGZyb20gJy4uLy4uL2Zyb250YXBwL3V0aWxzJztcbmltcG9ydCB7Z2VuZXJhdGVVVUlELCBoYXNoVG9VVUlEfSBmcm9tICcuLi8uLi9mcm9udGFwcC9VVUlEJztcbmltcG9ydCB7YnVpbGRUZXN0VVJMfSBmcm9tICcuL2NvbW1vbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXN0c01hbmFnZXJCcm93c2VyKHRlc3RzLCBvcHRpb25zKSB7XG4gIHRoaXMudGVzdHMgPSB0ZXN0cztcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdCA9IHt9O1xuICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSBbXTtcbiAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XG59XG5cblRlc3RzTWFuYWdlckJyb3dzZXIucHJvdG90eXBlID0ge1xuICBydW5GaWx0ZXJlZDogZnVuY3Rpb24oZmlsdGVyRm4sIGdlbmVyYWxPcHRpb25zLCB0ZXN0c09wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSB0ZXN0c09wdGlvbnM7XG4gICAgdGhpcy5zZWxlY3RlZFRlc3RzID0gdGhpcy50ZXN0cy5maWx0ZXIoZmlsdGVyRm4pO1xuICAgIGNvbnN0IG51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IE1hdGgubWluKE1hdGgubWF4KHBhcnNlSW50KGdlbmVyYWxPcHRpb25zLm51bVRpbWVzVG9SdW5FYWNoVGVzdCksIDEpLCAxMDAwKTsgLy8gQ2xhbXBcbiAgICB0aGlzLnByb2dyZXNzID0ge1xuICAgICAgdG90YWxHbG9iYWw6IG51bVRpbWVzVG9SdW5FYWNoVGVzdCAqIHRoaXMuc2VsZWN0ZWRUZXN0cy5sZW5ndGgsXG4gICAgICBjdXJyZW50R2xvYmFsOiAxLFxuICAgICAgdGVzdHM6IHt9XG4gICAgfTtcbiAgICAgIFxuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICBcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5zZWxlY3RlZFRlc3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IodmFyIGogPSAwOyBqIDwgbnVtVGltZXNUb1J1bkVhY2hUZXN0OyBqKyspIHtcbiAgICAgICAgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuLnB1c2godGhpcy5zZWxlY3RlZFRlc3RzW2ldKTtcbiAgICAgICAgdGhpcy5wcm9ncmVzcy50ZXN0c1t0aGlzLnNlbGVjdGVkVGVzdHNbaV0uaWRdID0ge1xuICAgICAgICAgIGN1cnJlbnQ6IDEsXG4gICAgICAgICAgdG90YWw6IG51bVRpbWVzVG9SdW5FYWNoVGVzdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICBcbiAgICB0aGlzLnJ1bm5pbmdUZXN0c0luUHJvZ3Jlc3MgPSB0cnVlO1xuICBcbiAgICBjb25zb2xlLmxvZygnQnJvd3NlciB0ZXN0cycsIHRoaXMudGVzdHNRdWV1ZWRUb1J1bik7XG4gICAgdGhpcy5ydW5OZXh0UXVldWVkVGVzdCgpO1xuICB9LFxuICBydW5OZXh0UXVldWVkVGVzdDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5sZW5ndGggPT0gMCkge1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XG4gICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQhJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciB0ID0gdGhpcy50ZXN0c1F1ZXVlZFRvUnVuWyAwIF07XG4gICAgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuLnNwbGljZSgwLCAxKTtcbiAgICB0aGlzLnJ1blRlc3QodC5pZCwgJ3JlcGxheScsIHRoaXMub3B0aW9ucyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgcnVuVGVzdDogZnVuY3Rpb24oaWQsIG1vZGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGVzdCA9IHRoaXMudGVzdHMuZmluZCh0ID0+IHQuaWQgPT09IGlkKTtcbiAgICBpZiAoIXRlc3QpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1Rlc3Qgbm90IGZvdW5kLCBpZDonLCBpZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdSdW5uaW5nIHRlc3Q6JywgdGVzdC5uYW1lKTtcblxuICAgIGNvbnN0IGJhc2VVUkwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwLyc7XG4gICAgY29uc3QgdXJsID0gYnVpbGRUZXN0VVJMKGJhc2VVUkwsIHRlc3QsIG1vZGUsIG9wdGlvbnMsIHRoaXMucHJvZ3Jlc3MpO1xuICBcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnRlc3QgPSB0ZXN0O1xuICAgIHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3Quc3RhcnRUaW1lID0geXl5eW1tZGRoaG1tc3MoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0Lm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIFxuICAgIGlmICh0aGlzLnByb2dyZXNzKSB7XG4gICAgICB0aGlzLnByb2dyZXNzLnRlc3RzW2lkXS5jdXJyZW50Kys7XG4gICAgICB0aGlzLnByb2dyZXNzLmN1cnJlbnRHbG9iYWwrKztcbiAgICB9XG5cbiAgICB3aW5kb3cub3Blbih1cmwpO1xuICAvKlxuICAgIHZhciB0ZXN0RGF0YSA9IHtcbiAgICAgICdicm93c2VyVVVJRCc6IHRoaXMuYnJvd3NlclVVSUQsXG4gICAgICAnaWQnOiB0ZXN0LmlkLFxuICAgICAgJ25hbWUnOiB0ZXN0Lm5hbWUsXG4gICAgICAnc3RhcnRUaW1lJzogeXl5eW1tZGRoaG1tc3MoKSxcbiAgICAgICdyZXN1bHQnOiAndW5maW5pc2hlZCcsXG4gICAgICAvLydGYWtlV2ViR0wnOiBkYXRhLm9wdGlvbnMuZmFrZVdlYkdMLFxuICAgICAgJ3J1blVVSUQnOiB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQsXG4gICAgICAvLyEhISEhISEhISEgJ3J1bk9yZGluYWwnOiB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0LmlkXSA/ICh0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0LmlkXS5sZW5ndGggKyAxKSA6IDFcbiAgICB9O1xuICBcbiAgICAvL2lmIChkYXRhLm5hdGl2ZVN5c3RlbUluZm8gJiYgZGF0YS5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHRlc3REYXRhLmhhcmR3YXJlVVVJRCA9IGRhdGEubmF0aXZlU3lzdGVtSW5mby5VVUlEO1xuICAgIC8vdGhpcy5yZXN1bHRzU2VydmVyLnN0b3JlU3RhcnQodGVzdERhdGEpO1xuICAqL1xuICB9XG4gIFxuXG59IiwiaW1wb3J0IGJyb3dzZXJGZWF0dXJlcyBmcm9tICdicm93c2VyLWZlYXR1cmVzJztcbmltcG9ydCB3ZWJnbEluZm8gZnJvbSAnd2ViZ2wtaW5mbyc7XG5pbXBvcnQge2dlbmVyYXRlVVVJRCwgaGFzaFRvVVVJRH0gZnJvbSAnLi91dWlkJztcbmltcG9ydCBSZXN1bHRzU2VydmVyIGZyb20gJy4vcmVzdWx0cy1zZXJ2ZXInO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge1Rlc3RzTWFuYWdlckJyb3dzZXJ9IGZyb20gJy4uL21haW4vdGVzdHNtYW5hZ2VyL2Jyb3dzZXInO1xuaW1wb3J0IHt5eXl5bW1kZGhobW1zc30gZnJvbSAnLi91dGlscyc7XG5cblxuY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaCk7XG5cbmNvbnN0IFZFUlNJT04gPSAnMS4wJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdEFwcCB7XG4gIHBhcnNlUGFyYW1ldGVycygpIHtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcbiAgICBpZiAocGFyYW1ldGVyc1snbnVtLXRpbWVzJ10pIHtcbiAgICAgIHRoaXMudnVlQXBwLm9wdGlvbnMuZ2VuZXJhbC5udW1UaW1lc1RvUnVuRWFjaFRlc3QgPSBwYXJzZUludChwYXJhbWV0ZXJzWydudW0tdGltZXMnXSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydmYWtlLXdlYmdsJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzLmZha2VXZWJHTCA9IHRydWU7XG4gICAgfVxuICAgIFxuICAgIGlmIChwYXJhbWV0ZXJzWydzZWxlY3RlZCddKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZCA9IHBhcmFtZXRlcnNbJ3NlbGVjdGVkJ10uc3BsaXQoJywnKTtcbiAgICAgIHRoaXMudnVlQXBwLnRlc3RzLmZvckVhY2godGVzdCA9PiB0ZXN0LnNlbGVjdGVkID0gZmFsc2UpO1xuICAgICAgc2VsZWN0ZWQuZm9yRWFjaChpZCA9PiB7XG4gICAgICAgIHZhciB0ZXN0ID0gdGhpcy52dWVBcHAudGVzdHMuZmluZCh0ZXN0ID0+IHRlc3QuaWQgPT09IGlkKTtcbiAgICAgICAgaWYgKHRlc3QpIHRlc3Quc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgfSlcbiAgICB9XG5cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHZ1ZUFwcCkge1xuICAgIGNvbnNvbGUubG9nKGBUZXN0IEFwcCB2LiR7VkVSU0lPTn1gKTtcblxuICAgIHRoaXMudnVlQXBwID0gdnVlQXBwO1xuICAgIHRoaXMudGVzdHMgPSBbXTtcbiAgICB0aGlzLmlzQ3VycmVudGx5UnVubmluZ1Rlc3QgPSBmYWxzZTtcbiAgICB0aGlzLmJyb3dzZXJVVUlEID0gbnVsbDtcbiAgICB0aGlzLnJlc3VsdHNTZXJ2ZXIgPSBuZXcgUmVzdWx0c1NlcnZlcigpO1xuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuXG4gICAgZmV0Y2goJ3Rlc3RzLmpzb24nKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4geyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KVxuICAgICAgLnRoZW4oanNvbiA9PiB7XG4gICAgICAgIGpzb24uZm9yRWFjaCh0ZXN0ID0+IHtcbiAgICAgICAgICB0ZXN0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGVzdHMgPSB2dWVBcHAudGVzdHMgPSBqc29uO1xuICAgICAgICB0aGlzLnRlc3RzTWFuYWdlciA9IG5ldyBUZXN0c01hbmFnZXJCcm93c2VyKHRoaXMudGVzdHMpO1xuXG4gICAgICAgIHRoaXMucGFyc2VQYXJhbWV0ZXJzKCk7XG4gICAgICAgIHRoaXMuYXV0b1J1bigpO1xuICAgICAgfSlcblxuICAgIHRoaXMuaW5pdFdTU2VydmVyKCk7XG5cbiAgICB0aGlzLndlYmdsSW5mbyA9IHZ1ZUFwcC53ZWJnbEluZm8gPSB3ZWJnbEluZm8oKTtcbiAgICBicm93c2VyRmVhdHVyZXMoZmVhdHVyZXMgPT4ge1xuICAgICAgdGhpcy5icm93c2VySW5mbyA9IHZ1ZUFwcC5icm93c2VySW5mbyA9IGZlYXR1cmVzO1xuICAgICAgdGhpcy5vbkJyb3dzZXJSZXN1bHRzUmVjZWl2ZWQoe30pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdFdTU2VydmVyKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignYmVuY2htYXJrX2ZpbmlzaGVkJywgKHJlc3VsdCkgPT4ge1xuICAgICAgcmVzdWx0Lmpzb24gPSBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDQpO1xuICAgICAgdmFyIG9wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHMpKTtcblxuICAgICAgLy8gVG8gcmVtb3ZlIG9wdGlvbnMgXG4gICAgICBkZWxldGUgb3B0aW9ucy5mYWtlV2ViR0w7XG4gICAgICBkZWxldGUgb3B0aW9ucy5zaG93S2V5cztcbiAgICAgIGRlbGV0ZSBvcHRpb25zLnNob3dNb3VzZTtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLm5vQ2xvc2VPbkZhaWw7XG5cbiAgICAgIHJlc3VsdC5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgdmFyIHRlc3RSZXN1bHRzID0ge1xuICAgICAgICByZXN1bHQ6IHJlc3VsdFxuICAgICAgfTtcbiAgICAgIHRlc3RSZXN1bHRzLmJyb3dzZXJVVUlEID0gdGhpcy5icm93c2VyVVVJRDtcbiAgICAgIHRlc3RSZXN1bHRzLnN0YXJ0VGltZSA9IHRoaXMudGVzdHNNYW5hZ2VyLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnN0YXJ0VGltZTtcbiAgICAgIHRlc3RSZXN1bHRzLmZha2VXZWJHTCA9IHRoaXMudGVzdHNNYW5hZ2VyLmN1cnJlbnRseVJ1bm5pbmdUZXN0Lm9wdGlvbnMuZmFrZVdlYkdMO1xuICAgICAgLy90ZXN0UmVzdWx0cy5pZCA9IHRoaXMudGVzdHNNYW5hZ2VyLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmlkO1xuICAgICAgdGVzdFJlc3VsdHMuZmluaXNoVGltZSA9IHl5eXltbWRkaGhtbXNzKCk7XG4gICAgICB0ZXN0UmVzdWx0cy5uYW1lID0gdGhpcy50ZXN0c01hbmFnZXIuY3VycmVudGx5UnVubmluZ1Rlc3QubmFtZTtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1blVVSUQgPSB0aGlzLnRlc3RzTWFuYWdlci5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlEO1xuICAgICAgLy9pZiAoYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mbyAmJiBicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHRlc3RSZXN1bHRzLmhhcmR3YXJlVVVJRCA9IGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8uVVVJRDtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1bk9yZGluYWwgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0UmVzdWx0cy5pZF0gPyAodGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdFJlc3VsdHMuaWRdLmxlbmd0aCArIDEpIDogMTtcbiAgICAgIHRoaXMucmVzdWx0c1NlcnZlci5zdG9yZVRlc3RSZXN1bHRzKHRlc3RSZXN1bHRzKTtcblxuICAgICAgLy8gQWNjdW11bGF0ZSByZXN1bHRzIGluIGRpY3Rpb25hcnkuXG4gICAgICAvL2lmICh0ZXN0UmVzdWx0cy5yZXN1bHQgIT0gJ0ZBSUwnKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0pIHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Jlc3VsdC50ZXN0X2lkXSA9IFtdO1xuICAgICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0ucHVzaCh0ZXN0UmVzdWx0cyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF2ZXJhZ2VcbiAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNBdmVyYWdlID0gW107XG4gIFxuICAgICAgT2JqZWN0LmtleXModGhpcy52dWVBcHAucmVzdWx0c0J5SWQpLmZvckVhY2godGVzdElEID0+IHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0SURdO1xuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFyIHRlc3RSZXN1bHRzQXZlcmFnZSA9IHt9O1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50ZXN0X2lkID0gYCR7dGVzdElEfSAoJHtyZXN1bHRzLmxlbmd0aH0gc2FtcGxlcylgO1xuICAgICAgICBcbiAgICAgICAgICBmdW5jdGlvbiBnZXQ3MFBlcmNlbnRBdmVyYWdlKGdldEZpZWxkKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXQ3MFBlcmNlbnRBcnJheSgpIHtcbiAgICAgICAgICAgICAgZnVuY3Rpb24gY21wKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RmllbGQoYSkgLSBnZXRGaWVsZChiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPD0gMykgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgIHZhciBmcmFjID0gTWF0aC5yb3VuZCgwLjcgKiByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICAgIHZhciByZXN1bHRzQyA9IHJlc3VsdHMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgIHJlc3VsdHNDLnNvcnQoY21wKTtcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmUgPSByZXN1bHRzLmxlbmd0aCAtIGZyYWM7XG4gICAgICAgICAgICAgIHZhciBudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQgPSBNYXRoLmZsb29yKG51bUVsZW1lbnRzVG9SZW1vdmUvMik7XG4gICAgICAgICAgICAgIHZhciBudW1FbGVtZW50c1RvUmVtb3ZlQmFjayA9IG51bUVsZW1lbnRzVG9SZW1vdmUgLSBudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQ7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzQy5zbGljZShudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQsIHJlc3VsdHNDLmxlbmd0aCAtIG51bUVsZW1lbnRzVG9SZW1vdmVCYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcnIgPSBnZXQ3MFBlcmNlbnRBcnJheSgpO1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHRvdGFsICs9IGdldEZpZWxkKGFycltpXSk7XG4gICAgICAgICAgICByZXR1cm4gdG90YWwgLyBhcnIubGVuZ3RoO1xuICAgICAgICAgIH0gIFxuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50b3RhbFRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LnRvdGFsVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdUlkbGVQZXJjID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5jcHVJZGxlUGVyYzsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdUlkbGVUaW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5jcHVJZGxlVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdVRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdVRpbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5wYWdlTG9hZFRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LnBhZ2VMb2FkVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmF2Z0ZwcyA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuYXZnRnBzOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UudGltZVRvRmlyc3RGcmFtZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQudGltZVRvRmlyc3RGcmFtZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLm51bVN0dXR0ZXJFdmVudHMgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0Lm51bVN0dXR0ZXJFdmVudHM7IH0pO1xuICAgICAgICAgIC8qdG90YWxSZW5kZXJUaW1lICAgICB0b3RhbFRpbWUqL1xuICAgICAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNBdmVyYWdlLnB1c2godGVzdFJlc3VsdHNBdmVyYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgdGhpcy50ZXN0c01hbmFnZXIucnVuTmV4dFF1ZXVlZFRlc3QoKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pOyAgXG4gIH1cblxuICBvbkJyb3dzZXJSZXN1bHRzUmVjZWl2ZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ0Jyb3dzZXIgVVVJRDonLCB0aGlzLmdldEJyb3dzZXJVVUlEKCkpO1xuICAgIHZhciBzeXN0ZW1JbmZvID0ge1xuICAgICAgYnJvd3NlclVVSUQ6IHRoaXMuYnJvd3NlclVVSUQsXG4gICAgICB3ZWJnbEluZm86IHRoaXMud2ViZ2xJbmZvLFxuICAgICAgYnJvd3NlckluZm86IHRoaXMuYnJvd3NlckluZm9cbiAgICB9O1xuXG4gICAgdGhpcy5yZXN1bHRzU2VydmVyLnN0b3JlU3lzdGVtSW5mbyhzeXN0ZW1JbmZvKTtcbiAgfVxuXG4gIHJ1blNlbGVjdGVkVGVzdHMoKSB7XG4gICAgdGhpcy50ZXN0c01hbmFnZXIucnVuRmlsdGVyZWQoXG4gICAgICB4ID0+IHguc2VsZWN0ZWQsIFxuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy5nZW5lcmFsLCBcbiAgICAgIHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHNcbiAgICApO1xuICB9XG5cbiAgZ2V0QnJvd3NlclVVSUQoKSB7XG4gICAgdmFyIGhhcmR3YXJlVVVJRCA9ICcnO1xuICAgIGlmICh0aGlzLm5hdGl2ZVN5c3RlbUluZm8gJiYgdGhpcy5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHtcbiAgICAgIGhhcmR3YXJlVVVJRCA9IHRoaXMubmF0aXZlU3lzdGVtSW5mby5VVUlEO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYXJkd2FyZVVVSUQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnVVVJRCcpO1xuICAgICAgaWYgKCFoYXJkd2FyZVVVSUQpIHtcbiAgICAgICAgaGFyZHdhcmVVVUlEID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdVVUlEJywgaGFyZHdhcmVVVUlEKTtcbiAgICAgIH1cbiAgICB9XG4gIFxuICAgIC8vIFdlIG5vdyBoYXZlIGFsbCB0aGUgaW5mbyB0byBjb21wdXRlIHRoZSBicm93c2VyIFVVSURcbiAgICB2YXIgYnJvd3NlclVVSURTdHJpbmcgPSBoYXJkd2FyZVVVSUQgKyAodGhpcy5icm93c2VySW5mby51c2VyQWdlbnQuYnJvd3NlclZlcnNpb24gfHwgJycpICsgKHRoaXMuYnJvd3NlckluZm8ubmF2aWdhdG9yLmJ1aWxkSUQgfHwgJycpO1xuICAgIHRoaXMuYnJvd3NlclVVSUQgPSBoYXNoVG9VVUlEKGJyb3dzZXJVVUlEU3RyaW5nKTtcblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJVVUlEO1xuICB9XG5cbiAgYXV0b1J1bigpIHtcbiAgICBpZiAoIXRoaXMuaXNDdXJyZW50bHlSdW5uaW5nVGVzdCAmJiBsb2NhdGlvbi5zZWFyY2gudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhdXRvcnVuJykgIT09IC0xKSB7XG4gICAgICB0aGlzLnJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICB9XG4gIH0gXG59XG4iLCJpbXBvcnQgVGVzdEFwcCBmcm9tICcuL2FwcCc7XG5cbnZhciBkYXRhID0ge1xuICB0ZXN0czogW10sXG4gIHNob3dfanNvbjogZmFsc2UsXG4gIGJyb3dzZXJJbmZvOiBudWxsLFxuICB3ZWJnbEluZm86IG51bGwsXG4gIG5hdGl2ZVN5c3RlbUluZm86IHt9LFxuICBvcHRpb25zOiB7XG4gICAgZ2VuZXJhbDoge1xuICAgICAgbnVtVGltZXNUb1J1bkVhY2hUZXN0OiAxLFxuICAgIH0sXG4gICAgdGVzdHM6IHtcbiAgICAgIGZha2VXZWJHTDogZmFsc2UsXG4gICAgICBzaG93S2V5czogZmFsc2UsXG4gICAgICBzaG93TW91c2U6IGZhbHNlLFxuICAgICAgbm9DbG9zZU9uRmFpbDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIHJlc3VsdHM6IFtdLFxuICByZXN1bHRzQXZlcmFnZTogW10sXG4gIHJlc3VsdHNCeUlkOiB7fVxufTtcblxudmFyIHRlc3RBcHAgPSBudWxsO1xuXG53aW5kb3cub25sb2FkID0gKHgpID0+IHtcbiAgdmFyIHZ1ZUFwcCA9IG5ldyBWdWUoe1xuICAgIGVsOiAnI2FwcCcsXG4gICAgZGF0YTogZGF0YSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBwcmV0dHlQcmludCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gcHJldHR5UHJpbnRKc29uLnRvSHRtbCh2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZm9ybWF0TnVtZXJpYyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9GaXhlZCgyKTtcbiAgICAgIH0sXG4gICAgICBydW5UZXN0OiBmdW5jdGlvbih0ZXN0LCBpbnRlcmFjdGl2ZSwgcmVjb3JkaW5nKSB7XG4gICAgICAgIHRlc3RBcHAudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICAgICAgICB2YXIgbW9kZSA9IGludGVyYWN0aXZlID8gJ2ludGVyYWN0aXZlJyA6IChyZWNvcmRpbmcgPyAncmVjb3JkJyA6ICdyZXBsYXknKTtcbiAgICAgICAgdGVzdEFwcC50ZXN0c01hbmFnZXIucnVuVGVzdCh0ZXN0LmlkLCBtb2RlLCBkYXRhLm9wdGlvbnMudGVzdHMpO1xuICAgICAgfSxcbiAgICAgIHJ1blNlbGVjdGVkVGVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXN0QXBwLnJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICAgIH0sXG4gICAgICBnZXRCcm93c2VySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5icm93c2VySW5mbyA/IGRhdGEuYnJvd3NlckluZm8gOiAnQ2hlY2tpbmcgYnJvd3NlciBmZWF0dXJlcy4uLic7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgXG4gIHRlc3RBcHAgPSBuZXcgVGVzdEFwcCh2dWVBcHApO1xuXG59XG4iXSwibmFtZXMiOlsidXNlckFnZW50SW5mbyIsInRoaXMiLCJqc1NIQSIsImRlY29kZSIsImRlY29kZUNvbXBvbmVudCIsImdlbmVyYXRlVVVJRCIsImFkZEdFVCIsInJlcXVpcmUkJDAiLCJidWlsZFRlc3RVUkwiLCJ5eXl5bW1kZGhobW1zcyIsImJyb3dzZXJGZWF0dXJlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQUE7Q0FDQSxTQUFTLHVC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QUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRTtDQUNwZixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVU7Q0FDMWYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM3ZixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0NBQzlnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztFQUNwaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxrRUFBa0UsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDdGYsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFRLENBQUMsR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztFQUNsaEIsT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzZixDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtFQUFrRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDL2pCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0ZixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0NBQ3RmLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDeGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0VBQ3JmLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUM1ZixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0NBQ3BmLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Q0FDL2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RmLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTO0NBQ3JmLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVO0NBQ3ZmLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUMvZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUM7Q0FDcGYsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMvZixVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7Q0FDcGYsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUNyZixJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQStILE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQVcsQ0FBQyxFQUFFQyxjQUFJLENBQUMsQ0FBQzs7O0NDMUN6UyxTQUFTLFlBQVksR0FBRztDQUMvQixFQUFFLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtDQUN0RCxJQUFJLElBQUksR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkMsSUFBSSxJQUFJLEVBQUUsR0FBRyxTQUFTLEdBQUcsRUFBRSxFQUFFLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQzVHLElBQUksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNuSCxHQUFHLE1BQU07Q0FDVCxJQUFJLE9BQU8sc0NBQXNDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtDQUMvRSxNQUFNLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pFLE1BQU0sT0FBTyxDQUFDLENBQUMsUUFBUSxD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RyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUM7RUFDbkM7O0NBRUQsU0FBUyxjQUFjLEdBQUc7R0FDeEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztHQUN0QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7R0FDOUIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNuRixJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3RFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7R0FDeEUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztHQUMvRSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0dBQy9FLE9BQU8sSUFBSSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztFQUN0RTs7Q0FFRCxTQUFjLEdBQUc7R0FDZixN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
