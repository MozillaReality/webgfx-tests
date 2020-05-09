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

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var sha = createCommonjsModule(function (module, exports) {
	(function(aa){function C(d,b,a){var h=0,k=[],m=0,g,l,c,f,n,q,u,r,I=!1,v=[],x=[],t,y=!1,z=!1,w=-1;a=a||{};g=a.encoding||"UTF8";t=a.numRounds||1;if(t!==parseInt(t,10)||1>t)throw Error("numRounds must a integer >= 1");if("SHA-1"===d)n=512,q=K,u=ba,f=160,r=function(b){return b.slice()};else if(0===d.lastIndexOf("SHA-",0))if(q=function(b,h){return L(b,h,d)},u=function(b,h,k,a){var e,f;if("SHA-224"===d||"SHA-256"===d)e=(h+65>>>9<<4)+15,f=16;else if("SHA-384"===d||"SHA-512"===d)e=(h+129>>>10<<
	5)+31,f=32;else throw Error("Unexpected error in SHA-2 implementation");for(;b.length<=e;)b.push(0);b[h>>>5]|=128<<24-h%32;h=h+k;b[e]=h&4294967295;b[e-1]=h/4294967296|0;k=b.length;for(h=0;h<k;h+=f)a=L(b.slice(h,h+f),a,d);if("SHA-224"===d)b=[a[0],a[1],a[2],a[3],a[4],a[5],a[6]];else if("SHA-256"===d)b=a;else if("SHA-384"===d)b=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,a[4].b,a[5].a,a[5].b];else if("SHA-512"===d)b=[a[0].a,a[0].b,a[1].a,a[1].b,a[2].a,a[2].b,a[3].a,a[3].b,a[4].a,
	a[4].b,a[5].a,a[5].b,a[6].a,a[6].b,a[7].a,a[7].b];else throw Error("Unexpected error in SHA-2 implementation");return b},r=function(b){return b.slice()},"SHA-224"===d)n=512,f=224;else if("SHA-256"===d)n=512,f=256;else if("SHA-384"===d)n=1024,f=384;else if("SHA-512"===d)n=1024,f=512;else throw Error("Chosen SHA variant is not supported");else if(0===d.lastIndexOf("SHA3-",0)||0===d.lastIndexOf("SHAKE",0)){var F=6;q=D;r=function(b){var d=[],a;for(a=0;5>a;a+=1)d[a]=b[a].slice();return d};w=1;if("SHA3-224"===
	d)n=1152,f=224;else if("SHA3-256"===d)n=1088,f=256;else if("SHA3-384"===d)n=832,f=384;else if("SHA3-512"===d)n=576,f=512;else if("SHAKE128"===d)n=1344,f=-1,F=31,z=!0;else if("SHAKE256"===d)n=1088,f=-1,F=31,z=!0;else throw Error("Chosen SHA variant is not supported");u=function(b,d,a,h,k){a=n;var e=F,f,g=[],m=a>>>5,l=0,c=d>>>5;for(f=0;f<c&&d>=a;f+=m)h=D(b.slice(f,f+m),h),d-=a;b=b.slice(f);for(d%=a;b.length<m;)b.push(0);f=d>>>3;b[f>>2]^=e<<f%4*8;b[m-1]^=2147483648;for(h=D(b,h);32*g.length<k;){b=h[l%
	5][l/5|0];g.push(b.b);if(32*g.length>=k)break;g.push(b.a);l+=1;0===64*l%a&&(D(null,h),l=0);}return g};}else throw Error("Chosen SHA variant is not supported");c=M(b,g,w);l=A(d);this.setHMACKey=function(b,a,k){var e;if(!0===I)throw Error("HMAC key already set");if(!0===y)throw Error("Cannot set HMAC key after calling update");if(!0===z)throw Error("SHAKE is not supported for HMAC");g=(k||{}).encoding||"UTF8";a=M(a,g,w)(b);b=a.binLen;a=a.value;e=n>>>3;k=e/4-1;for(e<b/8&&(a=u(a,b,0,A(d),f));a.length<=
	k;)a.push(0);for(b=0;b<=k;b+=1)v[b]=a[b]^909522486,x[b]=a[b]^1549556828;l=q(v,l);h=n;I=!0;};this.update=function(b){var d,a,e,f=0,g=n>>>5;d=c(b,k,m);b=d.binLen;a=d.value;d=b>>>5;for(e=0;e<d;e+=g)f+n<=b&&(l=q(a.slice(e,e+g),l),f+=n);h+=f;k=a.slice(f>>>5);m=b%n;y=!0;};this.getHash=function(b,a){var e,g,c,n;if(!0===I)throw Error("Cannot call getHash after setting HMAC key");c=N(a);if(!0===z){if(-1===c.shakeLen)throw Error("shakeLen must be specified in options");f=c.shakeLen;}switch(b){case "HEX":e=function(b){return O(b,
	f,w,c)};break;case "B64":e=function(b){return P(b,f,w,c)};break;case "BYTES":e=function(b){return Q(b,f,w)};break;case "ARRAYBUFFER":try{g=new ArrayBuffer(0);}catch(p){throw Error("ARRAYBUFFER not supported by this environment");}e=function(b){return R(b,f,w)};break;case "UINT8ARRAY":try{g=new Uint8Array(0);}catch(p){throw Error("UINT8ARRAY not supported by this environment");}e=function(b){return S(b,f,w)};break;default:throw Error("format must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY");}n=u(k.slice(),
	m,h,r(l),f);for(g=1;g<t;g+=1)!0===z&&0!==f%32&&(n[n.length-1]&=16777215>>>24-f%32),n=u(n,f,0,A(d),f);return e(n)};this.getHMAC=function(b,a){var e,g,c,p;if(!1===I)throw Error("Cannot call getHMAC without first setting HMAC key");c=N(a);switch(b){case "HEX":e=function(b){return O(b,f,w,c)};break;case "B64":e=function(b){return P(b,f,w,c)};break;case "BYTES":e=function(b){return Q(b,f,w)};break;case "ARRAYBUFFER":try{e=new ArrayBuffer(0);}catch(v){throw Error("ARRAYBUFFER not supported by this environment");
	}e=function(b){return R(b,f,w)};break;case "UINT8ARRAY":try{e=new Uint8Array(0);}catch(v){throw Error("UINT8ARRAY not supported by this environment");}e=function(b){return S(b,f,w)};break;default:throw Error("outputFormat must be HEX, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY");}g=u(k.slice(),m,h,r(l),f);p=q(x,A(d));p=u(g,f,n,p,f);return e(p)};}function a(d,b){this.a=d;this.b=b;}function T(d,b,a,h){var k,m,g,l,c;b=b||[0];a=a||0;m=a>>>3;c=-1===h?3:0;for(k=0;k<d.length;k+=1)l=k+m,g=l>>>2,b.length<=g&&b.push(0),
	b[g]|=d[k]<<8*(c+l%4*h);return {value:b,binLen:8*d.length+a}}function O(a,b,e,h){var k="";b/=8;var m,g,c;c=-1===e?3:0;for(m=0;m<b;m+=1)g=a[m>>>2]>>>8*(c+m%4*e),k+="0123456789abcdef".charAt(g>>>4&15)+"0123456789abcdef".charAt(g&15);return h.outputUpper?k.toUpperCase():k}function P(a,b,e,h){var k="",m=b/8,g,c,p,f;f=-1===e?3:0;for(g=0;g<m;g+=3)for(c=g+1<m?a[g+1>>>2]:0,p=g+2<m?a[g+2>>>2]:0,p=(a[g>>>2]>>>8*(f+g%4*e)&255)<<16|(c>>>8*(f+(g+1)%4*e)&255)<<8|p>>>8*(f+(g+2)%4*e)&255,c=0;4>c;c+=1)8*g+6*c<=b?k+=
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(p>>>6*(3-c)&63):k+=h.b64Pad;return k}function Q(a,b,e){var h="";b/=8;var k,c,g;g=-1===e?3:0;for(k=0;k<b;k+=1)c=a[k>>>2]>>>8*(g+k%4*e)&255,h+=String.fromCharCode(c);return h}function R(a,b,e){b/=8;var h,k=new ArrayBuffer(b),c,g;g=new Uint8Array(k);c=-1===e?3:0;for(h=0;h<b;h+=1)g[h]=a[h>>>2]>>>8*(c+h%4*e)&255;return k}function S(a,b,e){b/=8;var h,k=new Uint8Array(b),c;c=-1===e?3:0;for(h=0;h<b;h+=1)k[h]=a[h>>>2]>>>8*(c+h%4*e)&
	255;return k}function N(a){var b={outputUpper:!1,b64Pad:"=",shakeLen:-1};a=a||{};b.outputUpper=a.outputUpper||!1;!0===a.hasOwnProperty("b64Pad")&&(b.b64Pad=a.b64Pad);if(!0===a.hasOwnProperty("shakeLen")){if(0!==a.shakeLen%8)throw Error("shakeLen must be a multiple of 8");b.shakeLen=a.shakeLen;}if("boolean"!==typeof b.outputUpper)throw Error("Invalid outputUpper formatting option");if("string"!==typeof b.b64Pad)throw Error("Invalid b64Pad formatting option");return b}function M(a,b,e){switch(b){case "UTF8":case "UTF16BE":case "UTF16LE":break;
	default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch(a){case "HEX":a=function(b,a,d){var g=b.length,c,p,f,n,q,u;if(0!==g%2)throw Error("String of HEX type must be in byte increments");a=a||[0];d=d||0;q=d>>>3;u=-1===e?3:0;for(c=0;c<g;c+=2){p=parseInt(b.substr(c,2),16);if(isNaN(p))throw Error("String of HEX type contains invalid characters");n=(c>>>1)+q;for(f=n>>>2;a.length<=f;)a.push(0);a[f]|=p<<8*(u+n%4*e);}return {value:a,binLen:4*g+d}};break;case "TEXT":a=function(a,d,c){var g,
	l,p=0,f,n,q,u,r,t;d=d||[0];c=c||0;q=c>>>3;if("UTF8"===b)for(t=-1===e?3:0,f=0;f<a.length;f+=1)for(g=a.charCodeAt(f),l=[],128>g?l.push(g):2048>g?(l.push(192|g>>>6),l.push(128|g&63)):55296>g||57344<=g?l.push(224|g>>>12,128|g>>>6&63,128|g&63):(f+=1,g=65536+((g&1023)<<10|a.charCodeAt(f)&1023),l.push(240|g>>>18,128|g>>>12&63,128|g>>>6&63,128|g&63)),n=0;n<l.length;n+=1){r=p+q;for(u=r>>>2;d.length<=u;)d.push(0);d[u]|=l[n]<<8*(t+r%4*e);p+=1;}else if("UTF16BE"===b||"UTF16LE"===b)for(t=-1===e?2:0,l="UTF16LE"===
	b&&1!==e||"UTF16LE"!==b&&1===e,f=0;f<a.length;f+=1){g=a.charCodeAt(f);!0===l&&(n=g&255,g=n<<8|g>>>8);r=p+q;for(u=r>>>2;d.length<=u;)d.push(0);d[u]|=g<<8*(t+r%4*e);p+=2;}return {value:d,binLen:8*p+c}};break;case "B64":a=function(b,a,d){var c=0,l,p,f,n,q,u,r,t;if(-1===b.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");p=b.indexOf("=");b=b.replace(/\=/g,"");if(-1!==p&&p<b.length)throw Error("Invalid '=' found in base-64 string");a=a||[0];d=d||0;u=d>>>3;t=-1===e?3:0;for(p=
	0;p<b.length;p+=4){q=b.substr(p,4);for(f=n=0;f<q.length;f+=1)l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(q.charAt(f)),n|=l<<18-6*f;for(f=0;f<q.length-1;f+=1){r=c+u;for(l=r>>>2;a.length<=l;)a.push(0);a[l]|=(n>>>16-8*f&255)<<8*(t+r%4*e);c+=1;}}return {value:a,binLen:8*c+d}};break;case "BYTES":a=function(b,a,d){var c,l,p,f,n,q;a=a||[0];d=d||0;p=d>>>3;q=-1===e?3:0;for(l=0;l<b.length;l+=1)c=b.charCodeAt(l),n=l+p,f=n>>>2,a.length<=f&&a.push(0),a[f]|=c<<8*(q+n%4*e);return {value:a,
	binLen:8*b.length+d}};break;case "ARRAYBUFFER":try{a=new ArrayBuffer(0);}catch(h){throw Error("ARRAYBUFFER not supported by this environment");}a=function(b,a,d){return T(new Uint8Array(b),a,d,e)};break;case "UINT8ARRAY":try{a=new Uint8Array(0);}catch(h){throw Error("UINT8ARRAY not supported by this environment");}a=function(b,a,d){return T(b,a,d,e)};break;default:throw Error("format must be HEX, TEXT, B64, BYTES, ARRAYBUFFER, or UINT8ARRAY");}return a}function y(a,b){return a<<b|a>>>32-b}function U(d,
	b){return 32<b?(b-=32,new a(d.b<<b|d.a>>>32-b,d.a<<b|d.b>>>32-b)):0!==b?new a(d.a<<b|d.b>>>32-b,d.b<<b|d.a>>>32-b):d}function x(a,b){return a>>>b|a<<32-b}function t(d,b){var e=null,e=new a(d.a,d.b);return e=32>=b?new a(e.a>>>b|e.b<<32-b&4294967295,e.b>>>b|e.a<<32-b&4294967295):new a(e.b>>>b-32|e.a<<64-b&4294967295,e.a>>>b-32|e.b<<64-b&4294967295)}function V(d,b){var e=null;return e=32>=b?new a(d.a>>>b,d.b>>>b|d.a<<32-b&4294967295):new a(0,d.a>>>b-32)}function ca(a,b,e){return a&b^~a&e}function da(d,
	b,e){return new a(d.a&b.a^~d.a&e.a,d.b&b.b^~d.b&e.b)}function W(a,b,e){return a&b^a&e^b&e}function ea(d,b,e){return new a(d.a&b.a^d.a&e.a^b.a&e.a,d.b&b.b^d.b&e.b^b.b&e.b)}function fa(a){return x(a,2)^x(a,13)^x(a,22)}function ga(d){var b=t(d,28),e=t(d,34);d=t(d,39);return new a(b.a^e.a^d.a,b.b^e.b^d.b)}function ha(a){return x(a,6)^x(a,11)^x(a,25)}function ia(d){var b=t(d,14),e=t(d,18);d=t(d,41);return new a(b.a^e.a^d.a,b.b^e.b^d.b)}function ja(a){return x(a,7)^x(a,18)^a>>>3}function ka(d){var b=t(d,
	1),e=t(d,8);d=V(d,7);return new a(b.a^e.a^d.a,b.b^e.b^d.b)}function la(a){return x(a,17)^x(a,19)^a>>>10}function ma(d){var b=t(d,19),e=t(d,61);d=V(d,6);return new a(b.a^e.a^d.a,b.b^e.b^d.b)}function G(a,b){var e=(a&65535)+(b&65535);return ((a>>>16)+(b>>>16)+(e>>>16)&65535)<<16|e&65535}function na(a,b,e,h){var c=(a&65535)+(b&65535)+(e&65535)+(h&65535);return ((a>>>16)+(b>>>16)+(e>>>16)+(h>>>16)+(c>>>16)&65535)<<16|c&65535}function H(a,b,e,h,c){var m=(a&65535)+(b&65535)+(e&65535)+(h&65535)+(c&65535);
	return ((a>>>16)+(b>>>16)+(e>>>16)+(h>>>16)+(c>>>16)+(m>>>16)&65535)<<16|m&65535}function oa(d,b){var e,h,c;e=(d.b&65535)+(b.b&65535);h=(d.b>>>16)+(b.b>>>16)+(e>>>16);c=(h&65535)<<16|e&65535;e=(d.a&65535)+(b.a&65535)+(h>>>16);h=(d.a>>>16)+(b.a>>>16)+(e>>>16);return new a((h&65535)<<16|e&65535,c)}function pa(d,b,e,h){var c,m,g;c=(d.b&65535)+(b.b&65535)+(e.b&65535)+(h.b&65535);m=(d.b>>>16)+(b.b>>>16)+(e.b>>>16)+(h.b>>>16)+(c>>>16);g=(m&65535)<<16|c&65535;c=(d.a&65535)+(b.a&65535)+(e.a&65535)+(h.a&65535)+
	(m>>>16);m=(d.a>>>16)+(b.a>>>16)+(e.a>>>16)+(h.a>>>16)+(c>>>16);return new a((m&65535)<<16|c&65535,g)}function qa(d,b,e,h,c){var m,g,l;m=(d.b&65535)+(b.b&65535)+(e.b&65535)+(h.b&65535)+(c.b&65535);g=(d.b>>>16)+(b.b>>>16)+(e.b>>>16)+(h.b>>>16)+(c.b>>>16)+(m>>>16);l=(g&65535)<<16|m&65535;m=(d.a&65535)+(b.a&65535)+(e.a&65535)+(h.a&65535)+(c.a&65535)+(g>>>16);g=(d.a>>>16)+(b.a>>>16)+(e.a>>>16)+(h.a>>>16)+(c.a>>>16)+(m>>>16);return new a((g&65535)<<16|m&65535,l)}function B(d,b){return new a(d.a^b.a,d.b^
	b.b)}function A(d){var b=[],e;if("SHA-1"===d)b=[1732584193,4023233417,2562383102,271733878,3285377520];else if(0===d.lastIndexOf("SHA-",0))switch(b=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],e=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225],d){case "SHA-224":break;case "SHA-256":b=e;break;case "SHA-384":b=[new a(3418070365,b[0]),new a(1654270250,b[1]),new a(2438529370,b[2]),new a(355462360,b[3]),new a(1731405415,
	b[4]),new a(41048885895,b[5]),new a(3675008525,b[6]),new a(1203062813,b[7])];break;case "SHA-512":b=[new a(e[0],4089235720),new a(e[1],2227873595),new a(e[2],4271175723),new a(e[3],1595750129),new a(e[4],2917565137),new a(e[5],725511199),new a(e[6],4215389547),new a(e[7],327033209)];break;default:throw Error("Unknown SHA variant");}else if(0===d.lastIndexOf("SHA3-",0)||0===d.lastIndexOf("SHAKE",0))for(d=0;5>d;d+=1)b[d]=[new a(0,0),new a(0,0),new a(0,0),new a(0,0),new a(0,0)];else throw Error("No SHA variants supported");
	return b}function K(a,b){var e=[],h,c,m,g,l,p,f;h=b[0];c=b[1];m=b[2];g=b[3];l=b[4];for(f=0;80>f;f+=1)e[f]=16>f?a[f]:y(e[f-3]^e[f-8]^e[f-14]^e[f-16],1),p=20>f?H(y(h,5),c&m^~c&g,l,1518500249,e[f]):40>f?H(y(h,5),c^m^g,l,1859775393,e[f]):60>f?H(y(h,5),W(c,m,g),l,2400959708,e[f]):H(y(h,5),c^m^g,l,3395469782,e[f]),l=g,g=m,m=y(c,30),c=h,h=p;b[0]=G(h,b[0]);b[1]=G(c,b[1]);b[2]=G(m,b[2]);b[3]=G(g,b[3]);b[4]=G(l,b[4]);return b}function ba(a,b,e,c){var k;for(k=(b+65>>>9<<4)+15;a.length<=k;)a.push(0);a[b>>>5]|=
	128<<24-b%32;b+=e;a[k]=b&4294967295;a[k-1]=b/4294967296|0;b=a.length;for(k=0;k<b;k+=16)c=K(a.slice(k,k+16),c);return c}function L(d,b,e){var h,k,m,g,l,p,f,n,q,u,r,t,v,x,y,A,z,w,F,B,C,D,E=[],J;if("SHA-224"===e||"SHA-256"===e)u=64,t=1,D=Number,v=G,x=na,y=H,A=ja,z=la,w=fa,F=ha,C=W,B=ca,J=c;else if("SHA-384"===e||"SHA-512"===e)u=80,t=2,D=a,v=oa,x=pa,y=qa,A=ka,z=ma,w=ga,F=ia,C=ea,B=da,J=X;else throw Error("Unexpected error in SHA-2 implementation");e=b[0];h=b[1];k=b[2];m=b[3];g=b[4];l=b[5];p=b[6];f=b[7];
	for(r=0;r<u;r+=1)16>r?(q=r*t,n=d.length<=q?0:d[q],q=d.length<=q+1?0:d[q+1],E[r]=new D(n,q)):E[r]=x(z(E[r-2]),E[r-7],A(E[r-15]),E[r-16]),n=y(f,F(g),B(g,l,p),J[r],E[r]),q=v(w(e),C(e,h,k)),f=p,p=l,l=g,g=v(m,n),m=k,k=h,h=e,e=v(n,q);b[0]=v(e,b[0]);b[1]=v(h,b[1]);b[2]=v(k,b[2]);b[3]=v(m,b[3]);b[4]=v(g,b[4]);b[5]=v(l,b[5]);b[6]=v(p,b[6]);b[7]=v(f,b[7]);return b}function D(d,b){var e,c,k,m,g=[],l=[];if(null!==d)for(c=0;c<d.length;c+=2)b[(c>>>1)%5][(c>>>1)/5|0]=B(b[(c>>>1)%5][(c>>>1)/5|0],new a(d[c+1],d[c]));
	for(e=0;24>e;e+=1){m=A("SHA3-");for(c=0;5>c;c+=1){k=b[c][0];var p=b[c][1],f=b[c][2],n=b[c][3],q=b[c][4];g[c]=new a(k.a^p.a^f.a^n.a^q.a,k.b^p.b^f.b^n.b^q.b);}for(c=0;5>c;c+=1)l[c]=B(g[(c+4)%5],U(g[(c+1)%5],1));for(c=0;5>c;c+=1)for(k=0;5>k;k+=1)b[c][k]=B(b[c][k],l[c]);for(c=0;5>c;c+=1)for(k=0;5>k;k+=1)m[k][(2*c+3*k)%5]=U(b[c][k],Y[c][k]);for(c=0;5>c;c+=1)for(k=0;5>k;k+=1)b[c][k]=B(m[c][k],new a(~m[(c+1)%5][k].a&m[(c+2)%5][k].a,~m[(c+1)%5][k].b&m[(c+2)%5][k].b));b[0][0]=B(b[0][0],Z[e]);}return b}var c,
	X,Y,Z;c=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
	4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];X=[new a(c[0],3609767458),new a(c[1],602891725),new a(c[2],3964484399),new a(c[3],2173295548),new a(c[4],4081628472),new a(c[5],3053834265),new a(c[6],2937671579),new a(c[7],3664609560),new a(c[8],2734883394),new a(c[9],1164996542),new a(c[10],1323610764),new a(c[11],3590304994),new a(c[12],4068182383),new a(c[13],
	991336113),new a(c[14],633803317),new a(c[15],3479774868),new a(c[16],2666613458),new a(c[17],944711139),new a(c[18],2341262773),new a(c[19],2007800933),new a(c[20],1495990901),new a(c[21],1856431235),new a(c[22],3175218132),new a(c[23],2198950837),new a(c[24],3999719339),new a(c[25],766784016),new a(c[26],2566594879),new a(c[27],3203337956),new a(c[28],1034457026),new a(c[29],2466948901),new a(c[30],3758326383),new a(c[31],168717936),new a(c[32],1188179964),new a(c[33],1546045734),new a(c[34],1522805485),
	new a(c[35],2643833823),new a(c[36],2343527390),new a(c[37],1014477480),new a(c[38],1206759142),new a(c[39],344077627),new a(c[40],1290863460),new a(c[41],3158454273),new a(c[42],3505952657),new a(c[43],106217008),new a(c[44],3606008344),new a(c[45],1432725776),new a(c[46],1467031594),new a(c[47],851169720),new a(c[48],3100823752),new a(c[49],1363258195),new a(c[50],3750685593),new a(c[51],3785050280),new a(c[52],3318307427),new a(c[53],3812723403),new a(c[54],2003034995),new a(c[55],3602036899),
	new a(c[56],1575990012),new a(c[57],1125592928),new a(c[58],2716904306),new a(c[59],442776044),new a(c[60],593698344),new a(c[61],3733110249),new a(c[62],2999351573),new a(c[63],3815920427),new a(3391569614,3928383900),new a(3515267271,566280711),new a(3940187606,3454069534),new a(4118630271,4000239992),new a(116418474,1914138554),new a(174292421,2731055270),new a(289380356,3203993006),new a(460393269,320620315),new a(685471733,587496836),new a(852142971,1086792851),new a(1017036298,365543100),new a(1126000580,
	2618297676),new a(1288033470,3409855158),new a(1501505948,4234509866),new a(1607167915,987167468),new a(1816402316,1246189591)];Z=[new a(0,1),new a(0,32898),new a(2147483648,32906),new a(2147483648,2147516416),new a(0,32907),new a(0,2147483649),new a(2147483648,2147516545),new a(2147483648,32777),new a(0,138),new a(0,136),new a(0,2147516425),new a(0,2147483658),new a(0,2147516555),new a(2147483648,139),new a(2147483648,32905),new a(2147483648,32771),new a(2147483648,32770),new a(2147483648,128),new a(0,
	32778),new a(2147483648,2147483658),new a(2147483648,2147516545),new a(2147483648,32896),new a(0,2147483649),new a(2147483648,2147516424)];Y=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];(module.exports&&(module.exports=C),exports=C);})(commonjsGlobal);
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

	var splitOnFirst = (string, separator) => {
		if (!(typeof string === 'string' && typeof separator === 'string')) {
			throw new TypeError('Expected the arguments to be of type `string`');
		}

		if (separator === '') {
			return [string];
		}

		const separatorIndex = string.indexOf(separator);

		if (separatorIndex === -1) {
			return [string];
		}

		return [
			string.slice(0, separatorIndex),
			string.slice(separatorIndex + separator.length)
		];
	};

	var queryString = createCommonjsModule(function (module, exports) {




	const isNullOrUndefined = value => value === null || value === undefined;

	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return key => (result, value) => {
					const index = result.length;

					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
						return result;
					}

					if (value === null) {
						return [...result, [encode(key, options), '[', index, ']'].join('')];
					}

					return [
						...result,
						[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
					];
				};

			case 'bracket':
				return key => (result, value) => {
					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
						return result;
					}

					if (value === null) {
						return [...result, [encode(key, options), '[]'].join('')];
					}

					return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
				};

			case 'comma':
			case 'separator':
				return key => (result, value) => {
					if (value === null || value === undefined || value.length === 0) {
						return result;
					}

					if (result.length === 0) {
						return [[encode(key, options), '=', encode(value, options)].join('')];
					}

					return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
				};

			default:
				return key => (result, value) => {
					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
						return result;
					}

					if (value === null) {
						return [...result, encode(key, options)];
					}

					return [...result, [encode(key, options), '=', encode(value, options)].join('')];
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

			case 'comma':
			case 'separator':
				return (key, value, accumulator) => {
					const isArray = typeof value === 'string' && value.split('').indexOf(options.arrayFormatSeparator) > -1;
					const newValue = isArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
					accumulator[key] = newValue;
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

	function validateArrayFormatSeparator(value) {
		if (typeof value !== 'string' || value.length !== 1) {
			throw new TypeError('arrayFormatSeparator must be single character string');
		}
	}

	function encode(value, options) {
		if (options.encode) {
			return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
		}

		return value;
	}

	function decode(value, options) {
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

	function removeHash(input) {
		const hashStart = input.indexOf('#');
		if (hashStart !== -1) {
			input = input.slice(0, hashStart);
		}

		return input;
	}

	function getHash(url) {
		let hash = '';
		const hashStart = url.indexOf('#');
		if (hashStart !== -1) {
			hash = url.slice(hashStart);
		}

		return hash;
	}

	function extract(input) {
		input = removeHash(input);
		const queryStart = input.indexOf('?');
		if (queryStart === -1) {
			return '';
		}

		return input.slice(queryStart + 1);
	}

	function parseValue(value, options) {
		if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
			value = Number(value);
		} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
			value = value.toLowerCase() === 'true';
		}

		return value;
	}

	function parse(input, options) {
		options = Object.assign({
			decode: true,
			sort: true,
			arrayFormat: 'none',
			arrayFormatSeparator: ',',
			parseNumbers: false,
			parseBooleans: false
		}, options);

		validateArrayFormatSeparator(options.arrayFormatSeparator);

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
			let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '=');

			// Missing `=` should be `null`:
			// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
			formatter(decode(key, options), value, ret);
		}

		for (const key of Object.keys(ret)) {
			const value = ret[key];
			if (typeof value === 'object' && value !== null) {
				for (const k of Object.keys(value)) {
					value[k] = parseValue(value[k], options);
				}
			} else {
				ret[key] = parseValue(value, options);
			}
		}

		if (options.sort === false) {
			return ret;
		}

		return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
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

	exports.extract = extract;
	exports.parse = parse;

	exports.stringify = (object, options) => {
		if (!object) {
			return '';
		}

		options = Object.assign({
			encode: true,
			strict: true,
			arrayFormat: 'none',
			arrayFormatSeparator: ','
		}, options);

		validateArrayFormatSeparator(options.arrayFormatSeparator);

		const shouldFilter = key => (
			(options.skipNull && isNullOrUndefined(object[key])) ||
			(options.skipEmptyString && object[key] === '')
		);

		const formatter = encoderForArrayFormat(options);

		const objectCopy = {};

		for (const key of Object.keys(object)) {
			if (!shouldFilter(key)) {
				objectCopy[key] = object[key];
			}
		}

		const keys = Object.keys(objectCopy);

		if (options.sort !== false) {
			keys.sort(options.sort);
		}

		return keys.map(key => {
			const value = object[key];

			if (value === undefined) {
				return '';
			}

			if (value === null) {
				return encode(key, options);
			}

			if (Array.isArray(value)) {
				return value
					.reduce(formatter(key), [])
					.join('&');
			}

			return encode(key, options) + '=' + encode(value, options);
		}).filter(x => x.length > 0).join('&');
	};

	exports.parseUrl = (input, options) => {
		return {
			url: removeHash(input).split('?')[0] || '',
			query: parse(extract(input), options)
		};
	};

	exports.stringifyUrl = (input, options) => {
		const url = removeHash(input.url).split('?')[0] || '';
		const queryFromUrl = exports.extract(input.url);
		const parsedQueryFromUrl = exports.parse(queryFromUrl);
		const hash = getHash(input.url);
		const query = Object.assign(parsedQueryFromUrl, input.query);
		let queryString = exports.stringify(query, options);
		if (queryString) {
			queryString = `?${queryString}`;
		}

		return `${url}${queryString}${hash}`;
	};
	});
	var queryString_1 = queryString.extract;
	var queryString_2 = queryString.parse;
	var queryString_3 = queryString.stringify;
	var queryString_4 = queryString.parseUrl;
	var queryString_5 = queryString.stringifyUrl;

	function addGET(url, parameter) {
	  //if (url.indexOf('?') != -1)
	  return url + '&' + parameter;
	  //else return url + '?' + parameter;
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

	function camelCaseToDash (str) {
	  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
	}

	function buildTestURL(baseURL, test, mode, options, progress) {
	  //var url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url;
	  var url = '';

	  function getOption(name) {
	    if (typeof options[name] !== 'undefined') {
	      var value = options[name];
	      delete options[name];
	      return value;
	    }
	    return test[name];
	  }
	  // if verbose console.log(options);

	  if (mode !== 'interactive') {
	    if (getOption('autoenterXR')) url = addGET$1(url, 'autoenter-xr=true');
	    if (getOption('numFrames')) url = addGET$1(url, 'num-frames=' + getOption('numFrames'));
	    if (getOption('canvasWidth')) url = addGET$1(url, 'width=' + getOption('canvasWidth'));
	    if (getOption('canvasHeight')) url = addGET$1(url, 'height=' + getOption('canvasHeight'));

	    if (getOption('fakeWebGL')) url = addGET$1(url, 'fake-webgl');

	    if (getOption('fakeWebAudio')) url = addGET$1(url, 'fake-webaudio');

	    if (mode === 'record') {
	      url = addGET$1(url, 'recording');
	    } else if (test.input && mode === 'replay') {
	      url = addGET$1(url, 'replay');
	      if (getOption('showKeys')) url = addGET$1(url, 'show-keys');
	      if (getOption('showMouse')) url = addGET$1(url, 'show-mouse');
	    }

	    if (getOption('noCloseOnFail')) url = addGET$1(url, 'no-close-on-fail');
	    if (test.skipReferenceImageTest) url = addGET$1(url, 'skip-reference-image-test');
	    if (test.referenceImage) url = addGET$1(url, 'reference-image');
	    if (test.noRendering) url = addGET$1(url, 'no-rendering');

	    if (progress) {
	      url = addGET$1(url, 'order-test=' + progress.tests[test.id].current + '&total-test=' + progress.tests[test.id].total);
	      url = addGET$1(url, 'order-global=' + progress.currentGlobal + '&total-global=' + progress.totalGlobal);
	    }

	    if (getOption('infoOverlay')) {
	      url = addGET$1(url, 'info-overlay=' + encodeURI(getOption('infoOverlay')));
	    }

	    Object.keys(options).forEach(key => {
	      var keyConverted = camelCaseToDash(key);
	      url = addGET$1(url, keyConverted + (typeof options[key] === 'undefined' ? '' : '=' + options[key]));
	    });
	    //@todo Log if verbose
	    // console.log('Generated URL: ', url);
	  }

	  url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url + (test.url.indexOf('?') !== -1 ? '' : '?') + url;
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
	  run: function(tests, generalOptions, testsOptions) {
	    this.tests = tests;
	    
	    this.options = testsOptions; // ?
	    this.selectedTests = this.tests;
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

	    const baseURL = window.location.origin + '/';
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
	        json = json.filter(test => test.available !== false);
	        /*
	        json.forEach(test => {
	          test.selected = true;
	        });
	        */
	        this.tests = vueApp.tests = vueApp.checkedTests = json;
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
	    //var serverUrl = 'http://localhost:8888';
	    var serverUrl = location.protocol + '//' + location.hostname + ':8888';

	    this.socket = io.connect(serverUrl);
	  
	    this.socket.on('connect', function(data) {
	      console.log('Connected to testing server');
	    });
	    
	    this.socket.on('test_finished', (result) => {
	      result.json = JSON.stringify(result, null, 4);
	      var options = JSON.parse(JSON.stringify(this.vueApp.options.tests));

	      // To remove options 
	      delete options.fakeWebGL;
	      delete options.fakeWebAudio;
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
	      testResults.fakeWebAudio = this.testsManager.currentlyRunningTest.options.fakeWebAudio;
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
	          testResultsAverage.test_id = testID;
	          testResultsAverage.numSamples = results.length;
	        
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
	    console.log(this.vueApp.filteredTests);
	    this.testsManager.run(
	      this.vueApp.selectedTests,
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
	  filter: '',
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
	      fakeWebAudio: false,
	      showKeys: false,
	      showMouse: false,
	      noCloseOnFail: false
	    }
	  },
	  checkedTests: [],
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
	    },
	    computed: {
	      selectedTests () {
	        return this.checkedTests; // @todo Apply filter here too
	      },
	      filteredTests() {
	        var filter = this.filter.toLowerCase();
	        return this.tests.filter(test => {
	          return test.id && test.id.toLowerCase().indexOf(filter) > -1 ||
	          test.engine && test.engine.toLowerCase().indexOf(filter) > -1 ||
	          test.apis && test.apis.join(' ').toLowerCase().indexOf(filter) > -1 ||
	          test.name && test.name.toLowerCase().indexOf(filter) > -1;
	       })
	      }
	    }
	  });

	  testApp = new TestApp(vueApp);

	};

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3VzZXJhZ2VudC1pbmZvL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3ZzeW5jLWVzdGltYXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItZmVhdHVyZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViZ2wtaW5mby9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9qc3NoYS9zcmMvc2hhLmpzIiwiLi4vc3JjL2Zyb250YXBwL3V1aWQuanMiLCIuLi9zcmMvZnJvbnRhcHAvcmVzdWx0cy1zZXJ2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc3BsaXQtb24tZmlyc3QvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vc3JjL2Zyb250YXBwL3V0aWxzLmpzIiwiLi4vc3JjL2Zyb250YXBwL1VVSUQuanMiLCIuLi9zcmMvbWFpbi90ZXN0c21hbmFnZXIvY29tbW9uLmpzIiwiLi4vc3JjL21haW4vdGVzdHNtYW5hZ2VyL2Jyb3dzZXIuanMiLCIuLi9zcmMvZnJvbnRhcHAvYXBwLmpzIiwiLi4vc3JjL2Zyb250YXBwL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRyaW1zIHdoaXRlc3BhY2UgaW4gZWFjaCBzdHJpbmcgZnJvbSBhbiBhcnJheSBvZiBzdHJpbmdzXG5mdW5jdGlvbiB0cmltU3BhY2VzSW5FYWNoRWxlbWVudChhcnIpIHtcbiAgcmV0dXJuIGFyci5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC50cmltKCk7IH0pO1xufVxuXG4vLyBSZXR1cm5zIGEgY29weSBvZiB0aGUgZ2l2ZW4gYXJyYXkgd2l0aCBlbXB0eS91bmRlZmluZWQgc3RyaW5nIGVsZW1lbnRzIHJlbW92ZWQgaW4gYmV0d2VlblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlFbGVtZW50cyhhcnIpIHtcbiAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAmJiB4Lmxlbmd0aCA+IDA7IH0pO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBlbmNsb3NlZCBpbiBwYXJlbnRoZXNlcywgZS5nLiBpcyBvZiBmb3JtIFwiKHNvbWV0aGluZylcIlxuZnVuY3Rpb24gaXNFbmNsb3NlZEluUGFyZW5zKHN0cikge1xuICByZXR1cm4gc3RyWzBdID09ICcoJyAmJiBzdHJbc3RyLmxlbmd0aC0xXSA9PSAnKSc7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3Vic3RyaW5nIGlzIGNvbnRhaW5lZCBpbiB0aGUgc3RyaW5nIChjYXNlIHNlbnNpdGl2ZSlcbmZ1bmN0aW9uIGNvbnRhaW5zKHN0ciwgc3Vic3RyKSB7XG4gIHJldHVybiBzdHIuaW5kZXhPZihzdWJzdHIpID49IDA7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgYW55IG9mIHRoZSBnaXZlbiBzdWJzdHJpbmdzIGluIHRoZSBsaXN0IGlzIGNvbnRhaW5lZCBpbiB0aGUgZmlyc3QgcGFyYW1ldGVyIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWluc0FueU9mKHN0ciwgc3Vic3RyTGlzdCkge1xuICBmb3IodmFyIGkgaW4gc3Vic3RyTGlzdCkgaWYgKGNvbnRhaW5zKHN0ciwgc3Vic3RyTGlzdFtpXSkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLy8gU3BsaXRzIGFuIHVzZXIgYWdlbnQgc3RyaW5nIGxvZ2ljYWxseSBpbnRvIGFuIGFycmF5IG9mIHRva2VucywgZS5nLlxuLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4vLyAtPiBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pJywgJ0FwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pJywgJ0Nocm9tZS81MS4wLjI3MDQuODEnLCAnTW9iaWxlIFNhZmFyaS81MzcuMzYnXVxuZnVuY3Rpb24gc3BsaXRVc2VyQWdlbnQoc3RyKSB7XG4gIHN0ciA9IHN0ci50cmltKCk7XG4gIHZhciB1YUxpc3QgPSBbXTtcbiAgdmFyIHRva2VucyA9ICcnO1xuICAvLyBTcGxpdCBieSBzcGFjZXMsIHdoaWxlIGtlZXBpbmcgdG9wIGxldmVsIHBhcmVudGhlc2VzIGludGFjdCwgc29cbiAgLy8gXCJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjEpIE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIgYmVjb21lc1xuICAvLyBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMSknLCAnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXVxuICB2YXIgcGFyZW5zTmVzdGluZyA9IDA7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoc3RyW2ldID09ICcgJyAmJiBwYXJlbnNOZXN0aW5nID09IDApIHtcbiAgICAgIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCAhPSAwKSB1YUxpc3QucHVzaCh0b2tlbnMudHJpbSgpKTtcbiAgICAgIHRva2VucyA9ICcnO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09ICcoJykgKytwYXJlbnNOZXN0aW5nO1xuICAgIGVsc2UgaWYgKHN0cltpXSA9PSAnKScpIC0tcGFyZW5zTmVzdGluZztcbiAgICB0b2tlbnMgPSB0b2tlbnMgKyBzdHJbaV07XG4gIH1cbiAgaWYgKHRva2Vucy50cmltKCkubGVuZ3RoID4gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG5cbiAgLy8gV2hhdCBmb2xsb3dzIGlzIGEgbnVtYmVyIG9mIGhldXJpc3RpYyBhZGFwdGF0aW9ucyB0byBhY2NvdW50IGZvciBVQSBzdHJpbmdzIG1ldCBpbiB0aGUgd2lsZDpcblxuICAvLyBGdXNlIFsnYS92ZXInLCAnKHNvbWVpbmZvKSddIHRvZ2V0aGVyLiBGb3IgZXhhbXBsZTpcbiAgLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4gIC8vIC0+IGZ1c2UgJ0FwcGxlV2ViS2l0LzUzNy4zNicgYW5kICcoS0hUTUwsIGxpa2UgR2Vja28pJyB0b2dldGhlclxuICBmb3IodmFyIGkgPSAxOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhsKSAmJiAhY29udGFpbnMobCwgJzsnKSAmJiBpID4gMSkge1xuICAgICAgdWFMaXN0W2ktMV0gPSB1YUxpc3RbaS0xXSArICcgJyArIGw7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuXG4gIC8vIEZ1c2UgWydmb28nLCAnYmFyL3ZlciddIHRvZ2V0aGVyLCBpZiAnZm9vJyBoYXMgb25seSBhc2NpaSBjaGFycy4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlIFsnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXSB0b2dldGhlclxuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aC0xOyArK2kpIHtcbiAgICB2YXIgbCA9IHVhTGlzdFtpXTtcbiAgICB2YXIgbmV4dCA9IHVhTGlzdFtpKzFdO1xuICAgIGlmICgvXlthLXpBLVpdKyQvLnRlc3QobCkgJiYgY29udGFpbnMobmV4dCwgJy8nKSkge1xuICAgICAgdWFMaXN0W2krMV0gPSBsICsgJyAnICsgbmV4dDtcbiAgICAgIHVhTGlzdFtpXSA9ICcnO1xuICAgIH1cbiAgfVxuICB1YUxpc3QgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHVhTGlzdCk7XG4gIHJldHVybiB1YUxpc3Q7XG59XG5cbi8vIEZpbmRzIHRoZSBzcGVjaWFsIHRva2VuIGluIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcGxhdGZvcm0gaW5mby5cbi8vIFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgY29udGFpbmVkIGluIHBhcmVudGhlc2VzIHRoYXQgaGFzIHNlbWljb2xvbiBkZWxpbWl0ZWQgZWxlbWVudHMuXG4vLyBSZXR1cm5zIHRoZSBwbGF0Zm9ybSBpbmZvIGFzIGFuIGFycmF5IHNwbGl0IGJ5IHRoZSBzZW1pY29sb25zLlxuZnVuY3Rpb24gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KSB7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCB1YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgaXRlbSA9IHVhTGlzdFtpXTtcbiAgICBpZiAoaXNFbmNsb3NlZEluUGFyZW5zKGl0ZW0pKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlRW1wdHlFbGVtZW50cyh0cmltU3BhY2VzSW5FYWNoRWxlbWVudChpdGVtLnN1YnN0cigxLCBpdGVtLmxlbmd0aC0yKS5zcGxpdCgnOycpKSk7XG4gICAgfVxuICB9XG59XG5cbi8vIERlZHVjZXMgdGhlIG9wZXJhdGluZyBzeXN0ZW0gZnJvbSB0aGUgdXNlciBhZ2VudCBwbGF0Zm9ybSBpbmZvIHRva2VuIGxpc3QuXG5mdW5jdGlvbiBmaW5kT1ModWFQbGF0Zm9ybUluZm8pIHtcbiAgdmFyIG9zZXMgPSBbJ0FuZHJvaWQnLCAnQlNEJywgJ0xpbnV4JywgJ1dpbmRvd3MnLCAnaVBob25lIE9TJywgJ01hYyBPUycsICdCU0QnLCAnQ3JPUycsICdEYXJ3aW4nLCAnRHJhZ29uZmx5JywgJ0ZlZG9yYScsICdHZW50b28nLCAnVWJ1bnR1JywgJ2RlYmlhbicsICdIUC1VWCcsICdJUklYJywgJ1N1bk9TJywgJ01hY2ludG9zaCcsICdXaW4gOXgnLCAnV2luOTgnLCAnV2luOTUnLCAnV2luTlQnXTtcbiAgZm9yKHZhciBvcyBpbiBvc2VzKSB7XG4gICAgZm9yKHZhciBpIGluIHVhUGxhdGZvcm1JbmZvKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW0sIG9zZXNbb3NdKSkgcmV0dXJuIGl0ZW07XG4gICAgfVxuICB9XG4gIHJldHVybiAnT3RoZXInO1xufVxuXG4vLyBGaWx0ZXJzIHRoZSBwcm9kdWN0IGNvbXBvbmVudHMgKGl0ZW1zIG9mIGZvcm1hdCAnZm9vL3ZlcnNpb24nKSBmcm9tIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QuXG5mdW5jdGlvbiBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCkge1xuICB1YUxpc3QgPSB1YUxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGNvbnRhaW5zKHgsICcvJykgJiYgIWlzRW5jbG9zZWRJblBhcmVucyh4KTsgfSk7XG4gIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHt9O1xuICBmb3IodmFyIGkgaW4gdWFMaXN0KSB7XG4gICAgdmFyIHggPSB1YUxpc3RbaV07XG4gICAgaWYgKGNvbnRhaW5zKHgsICcvJykpIHtcbiAgICAgIHggPSB4LnNwbGl0KCcvJyk7XG4gICAgICBpZiAoeC5sZW5ndGggIT0gMikgdGhyb3cgdWFMaXN0W2ldO1xuICAgICAgcHJvZHVjdENvbXBvbmVudHNbeFswXS50cmltKCldID0geFsxXS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hdID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHByb2R1Y3RDb21wb25lbnRzO1xufVxuXG4vLyBNYXBzIFdpbmRvd3MgTlQgdmVyc2lvbiB0byBodW1hbi1yZWFkYWJsZSBXaW5kb3dzIFByb2R1Y3QgdmVyc2lvblxuZnVuY3Rpb24gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUod2luTlRWZXJzaW9uKSB7XG4gIHZhciB2ZXJzID0ge1xuICAgICc1LjAnOiAnMjAwMCcsXG4gICAgJzUuMSc6ICdYUCcsXG4gICAgJzUuMic6ICdYUCcsXG4gICAgJzYuMCc6ICdWaXN0YScsXG4gICAgJzYuMSc6ICc3JyxcbiAgICAnNi4yJzogJzgnLFxuICAgICc2LjMnOiAnOC4xJyxcbiAgICAnMTAuMCc6ICcxMCdcbiAgfVxuICBpZiAoIXZlcnNbd2luTlRWZXJzaW9uXSkgcmV0dXJuICdOVCAnICsgd2luTlRWZXJzaW9uO1xuICByZXR1cm4gdmVyc1t3aW5OVFZlcnNpb25dO1xufVxuXG4vLyBUaGUgZnVsbCBmdW5jdGlvbiB0byBkZWNvbXBvc2UgYSBnaXZlbiB1c2VyIGFnZW50IHRvIHRoZSBpbnRlcmVzdGluZyBsb2dpY2FsIGluZm8gYml0cy5cbi8vIFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVkdWNlVXNlckFnZW50KHVzZXJBZ2VudCkge1xuICB1c2VyQWdlbnQgPSB1c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgdmFyIHVhID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50LFxuICAgIHByb2R1Y3RDb21wb25lbnRzOiB7fSxcbiAgICBwbGF0Zm9ybUluZm86IFtdXG4gIH07XG5cbiAgdHJ5IHtcbiAgICB2YXIgdWFMaXN0ID0gc3BsaXRVc2VyQWdlbnQodXNlckFnZW50KTtcbiAgICB2YXIgdWFQbGF0Zm9ybUluZm8gPSBzcGxpdFBsYXRmb3JtSW5mbyh1YUxpc3QpO1xuICAgIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHBhcnNlUHJvZHVjdENvbXBvbmVudHModWFMaXN0KTtcbiAgICB1YS5wcm9kdWN0Q29tcG9uZW50cyA9IHByb2R1Y3RDb21wb25lbnRzO1xuICAgIHVhLnBsYXRmb3JtSW5mbyA9IHVhUGxhdGZvcm1JbmZvO1xuICAgIHZhciB1YWwgPSB1c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIERlZHVjZSBhcmNoIGFuZCBiaXRuZXNzXG4gICAgdmFyIGIzMk9uNjQgPSBbJ3dvdzY0J107XG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3dvdzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAnMzItb24tNjQnO1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsneDg2XzY0JywgJ2FtZDY0JywgJ2lhNjQnLCAnd2luNjQnLCAneDY0J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdwcGM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1BQQyc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdzcGFyYzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAnU1BBUkMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsnaTM4NicsICdpNDg2JywgJ2k1ODYnLCAnaTY4NicsICd4ODYnXSkpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAneDg2JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2FybTcnKSB8fCBjb250YWlucyh1YWwsICdhbmRyb2lkJykgfHwgY29udGFpbnModWFsLCAnbW9iaWxlJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAvLyBIZXVyaXN0aWM6IEFzc3VtZSBhbGwgT1MgWCBhcmUgNjQtYml0LCBhbHRob3VnaCB0aGlzIGlzIG5vdCBjZXJ0YWluLiBPbiBPUyBYLCA2NC1iaXQgYnJvd3NlcnNcbiAgICAvLyBkb24ndCBhZHZlcnRpc2UgYmVpbmcgNjQtYml0LlxuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnaW50ZWwgbWFjIG9zJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2Uge1xuICAgICAgdWEuYml0bmVzcyA9IDMyO1xuICAgIH1cblxuICAgIC8vIERlZHVjZSBvcGVyYXRpbmcgc3lzdGVtXG4gICAgdmFyIG9zID0gZmluZE9TKHVhUGxhdGZvcm1JbmZvKTtcbiAgICB2YXIgbSA9IG9zLm1hdGNoKCcoLiopXFxcXHMrTWFjIE9TIFhcXFxccysoLiopJyk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHVhLnBsYXRmb3JtID0gJ01hYyc7XG4gICAgICB1YS5hcmNoID0gbVsxXTtcbiAgICAgIHVhLm9zID0gJ01hYyBPUyc7XG4gICAgICB1YS5vc1ZlcnNpb24gPSBtWzJdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gb3MubWF0Y2goJ0FuZHJvaWRcXFxccysoLiopJyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdBbmRyb2lkJztcbiAgICAgICAgdWEub3MgPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdXaW5kb3dzIE5UXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9ICdXaW5kb3dzJztcbiAgICAgICAgdWEub3NWZXJzaW9uID0gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUobVsxXSk7XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQaG9uZScpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBhZCcpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBvZCcpIHx8IGNvbnRhaW5zKG9zLCAnaVBob25lJykgfHwgb3MuaW5kZXhPZignQ1BVIE9TJykgPT0gMCkge1xuICAgICAgICBtID0gb3MubWF0Y2goJy4qT1MgKC4qKSBsaWtlIE1hYyBPUyBYJyk7XG4gICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgdWEucGxhdGZvcm0gPSB1YVBsYXRmb3JtSW5mb1swXTtcbiAgICAgICAgICB1YS5vcyA9ICdpT1MnO1xuICAgICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgICAgICAgIHVhLmJpdG5lc3MgPSBwYXJzZUludCh1YS5vc1ZlcnNpb24pID49IDcgPyA2NCA6IDMyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAgXG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gY29udGFpbnMob3MsICdCU0QnKSB8fCBjb250YWlucyhvcywgJ0xpbnV4Jyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdQQyc7XG4gICAgICAgIHVhLm9zID0gb3Muc3BsaXQoJyAnKVswXTtcbiAgICAgICAgaWYgKCF1YS5hcmNoKSB1YS5hcmNoID0gJ3g4Nic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgdWEub3MgPSBvcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUHJvZHVjdChwcm9kdWN0Q29tcG9uZW50cywgcHJvZHVjdCkge1xuICAgICAgZm9yKHZhciBpIGluIHByb2R1Y3RDb21wb25lbnRzKSB7XG4gICAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tpXSA9PSBwcm9kdWN0KSByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgaHVtYW4tcmVhZGFibGUgYnJvd3NlciB2ZW5kb3IsIHByb2R1Y3QgYW5kIHZlcnNpb24gbmFtZXNcbiAgICB2YXIgYnJvd3NlcnMgPSBbWydTYW1zdW5nQnJvd3NlcicsICdTYW1zdW5nJ10sIFsnRWRnZScsICdNaWNyb3NvZnQnXSwgWydPUFInLCAnT3BlcmEnXSwgWydDaHJvbWUnLCAnR29vZ2xlJ10sIFsnU2FmYXJpJywgJ0FwcGxlJ10sIFsnRmlyZWZveCcsICdNb3ppbGxhJ11dO1xuICAgIGZvcih2YXIgaSBpbiBicm93c2Vycykge1xuICAgICAgdmFyIGIgPSBicm93c2Vyc1tpXVswXTtcbiAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tiXSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gYnJvd3NlcnNbaV1bMV07XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICAgIGlmICh1YS5icm93c2VyUHJvZHVjdCA9PSAnT1BSJykgdWEuYnJvd3NlclByb2R1Y3QgPSAnT3BlcmEnO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ1RyaWRlbnQnKSB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gcHJvZHVjdENvbXBvbmVudHNbYl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBEZXRlY3QgSUVzXG4gICAgaWYgKCF1YS5icm93c2VyUHJvZHVjdCkge1xuICAgICAgdmFyIG1hdGNoSUUgPSB1c2VyQWdlbnQubWF0Y2goL01TSUVcXHMoW1xcZC5dKykvKTtcbiAgICAgIGlmIChtYXRjaElFKSB7XG4gICAgICAgIHVhLmJyb3dzZXJWZW5kb3IgPSAnTWljcm9zb2Z0JztcbiAgICAgICAgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IG1hdGNoSUVbMV07XG4gICAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvLCAnVHJpZGVudC83LjAnKSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSAgdXNlckFnZW50Lm1hdGNoKC9ydjooW1xcZC5dKykvKVsxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgbW9iaWxlIHBsYXRmb3JtLCBpZiBwcmVzZW50XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHVhUGxhdGZvcm1JbmZvLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgdmFyIGl0ZW1sID0gaXRlbS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW1sLCAnbmV4dXMnKSB8fCBjb250YWlucyhpdGVtbCwgJ3NhbXN1bmcnKSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9IGl0ZW07XG4gICAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGZvcm0gZmFjdG9yXG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3RhYmxldCcpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwYWQnKSkgdWEuZm9ybUZhY3RvciA9ICdUYWJsZXQnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwaG9uZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwb2QnKSkgdWEuZm9ybUZhY3RvciA9ICdNb2JpbGUnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ3NtYXJ0IHR2JykgfHwgY29udGFpbnModWFsLCAnc21hcnQtdHYnKSkgdWEuZm9ybUZhY3RvciA9ICdUVic7XG4gICAgZWxzZSB1YS5mb3JtRmFjdG9yID0gJ0Rlc2t0b3AnO1xuICB9IGNhdGNoKGUpIHtcbiAgICB1YS5pbnRlcm5hbEVycm9yID0gJ0ZhaWxlZCB0byBwYXJzZSB1c2VyIGFnZW50IHN0cmluZzogJyArIGUudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHJldHVybiB1YTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVzdGltYXRlVlN5bmNSYXRlKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUgPT4ge1xuICAgIHZhciBudW1GcmFtZXNUb1J1biA9IDYwO1xuICAgIHZhciB0MCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHZhciBkZWx0YXMgPSBbXTtcbiAgICBmdW5jdGlvbiB0aWNrKCkge1xuICAgICAgdmFyIHQxID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBkZWx0YXMucHVzaCh0MS10MCk7XG4gICAgICB0MCA9IHQxO1xuICAgICAgaWYgKC0tbnVtRnJhbWVzVG9SdW4gPiAwKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbHRhcy5zb3J0KCk7XG4gICAgICAgIGRlbHRhcyA9IGRlbHRhcy5zbGljZSgoZGVsdGFzLmxlbmd0aCAvIDMpfDAsICgoMiAqIGRlbHRhcy5sZW5ndGggKyAyKSAvIDMpfDApO1xuICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgZm9yKHZhciBpIGluIGRlbHRhcykgc3VtICs9IGRlbHRhc1tpXTtcbiAgICAgICAgcmVzb2x2ZSgxMDAwLjAgLyAoc3VtL2RlbHRhcy5sZW5ndGgpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICB9KTtcbn1cbiIsImltcG9ydCB1c2VyQWdlbnRJbmZvIGZyb20gJ3VzZXJhZ2VudC1pbmZvJztcbmltcG9ydCBlc3RpbWF0ZVZTeW5jUmF0ZSBmcm9tICd2c3luYy1lc3RpbWF0ZSc7XG5cbmZ1bmN0aW9uIGVuZGlhbm5lc3MoKSB7XG4gIHZhciBoZWFwID0gbmV3IEFycmF5QnVmZmVyKDB4MTAwMDApO1xuICB2YXIgaTMyID0gbmV3IEludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MzIgPSBuZXcgVWludDMyQXJyYXkoaGVhcCk7XG4gIHZhciB1MTYgPSBuZXcgVWludDE2QXJyYXkoaGVhcCk7XG4gIHUzMls2NF0gPSAweDdGRkYwMTAwO1xuICB2YXIgdHlwZWRBcnJheUVuZGlhbm5lc3M7XG4gIGlmICh1MTZbMTI4XSA9PT0gMHg3RkZGICYmIHUxNlsxMjldID09PSAweDAxMDApIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2JpZyBlbmRpYW4nO1xuICBlbHNlIGlmICh1MTZbMTI4XSA9PT0gMHgwMTAwICYmIHUxNlsxMjldID09PSAweDdGRkYpIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ2xpdHRsZSBlbmRpYW4nO1xuICBlbHNlIHR5cGVkQXJyYXlFbmRpYW5uZXNzID0gJ3Vua25vd24hIChhIGJyb3dzZXIgYnVnPykgKHNob3J0IDE6ICcgKyB1MTZbMTI4XS50b1N0cmluZygxNikgKyAnLCBzaG9ydCAyOiAnICsgdTE2WzEyOV0udG9TdHJpbmcoMTYpICsgJyknO1xuICByZXR1cm4gdHlwZWRBcnJheUVuZGlhbm5lc3M7ICBcbn1cblxuZnVuY3Rpb24gcGFkTGVuZ3RoTGVmdChzLCBsZW4sIGNoKSB7XG4gIGlmIChjaCA9PT0gdW5kZWZpbmVkKSBjaCA9ICcgJztcbiAgd2hpbGUocy5sZW5ndGggPCBsZW4pIHMgPSBjaCArIHM7XG4gIHJldHVybiBzO1xufVxuXG4vLyBQZXJmb3JtcyB0aGUgYnJvd3NlciBmZWF0dXJlIHRlc3QuIEltbWVkaWF0ZWx5IHJldHVybnMgYSBKUyBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVzdWx0cyBvZiBhbGwgc3luY2hyb25vdXNseSBjb21wdXRhYmxlIGZpZWxkcywgYW5kIGxhdW5jaGVzIGFzeW5jaHJvbm91c1xuLy8gdGFza3MgdGhhdCBwZXJmb3JtIHRoZSByZW1haW5pbmcgdGVzdHMuIE9uY2UgdGhlIGFzeW5jIHRhc2tzIGhhdmUgZmluaXNoZWQsIHRoZSBnaXZlbiBzdWNjZXNzQ2FsbGJhY2sgZnVuY3Rpb24gaXMgY2FsbGVkLCB3aXRoIHRoZSBmdWxsIGJyb3dzZXIgZmVhdHVyZSB0ZXN0XG4vLyByZXN1bHRzIG9iamVjdCBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYnJvd3NlckZlYXR1cmVUZXN0KHN1Y2Nlc3NDYWxsYmFjaykge1xuICB2YXIgYXBpcyA9IHt9O1xuICBmdW5jdGlvbiBzZXRBcGlTdXBwb3J0KGFwaW5hbWUsIGNtcCkge1xuICAgIGlmIChjbXApIGFwaXNbYXBpbmFtZV0gPSB0cnVlO1xuICAgIGVsc2UgYXBpc1thcGluYW1lXSA9IGZhbHNlO1xuICB9XG5cbiAgc2V0QXBpU3VwcG9ydCgnTWF0aF9pbXVsJywgdHlwZW9mIE1hdGguaW11bCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdNYXRoX2Zyb3VuZCcsIHR5cGVvZiBNYXRoLmZyb3VuZCAhPT0gJ3VuZGVmaW5lZCcpOyAgXG4gIHNldEFwaVN1cHBvcnQoJ0FycmF5QnVmZmVyX3RyYW5zZmVyJywgdHlwZW9mIEFycmF5QnVmZmVyLnRyYW5zZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkF1ZGlvJywgdHlwZW9mIEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdlYmtpdEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdQb2ludGVyTG9jaycsIGRvY3VtZW50LmJvZHkucmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkubW96UmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkud2Via2l0UmVxdWVzdFBvaW50ZXJMb2NrIHx8IGRvY3VtZW50LmJvZHkubXNSZXF1ZXN0UG9pbnRlckxvY2spO1xuICBzZXRBcGlTdXBwb3J0KCdGdWxsc2NyZWVuQVBJJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1zUmVxdWVzdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0RnVsbFNjcmVlbiB8fCBkb2N1bWVudC5ib2R5LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKTtcbiAgdmFyIGhhc0Jsb2JDb25zdHJ1Y3RvciA9IGZhbHNlO1xuICB0cnkgeyBuZXcgQmxvYigpOyBoYXNCbG9iQ29uc3RydWN0b3IgPSB0cnVlOyB9IGNhdGNoKGUpIHsgfVxuICBzZXRBcGlTdXBwb3J0KCdCbG9iJywgaGFzQmxvYkNvbnN0cnVjdG9yKTtcbiAgaWYgKCFoYXNCbG9iQ29uc3RydWN0b3IpIHNldEFwaVN1cHBvcnQoJ0Jsb2JCdWlsZGVyJywgdHlwZW9mIEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgTW96QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBXZWJLaXRCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTaGFyZWRBcnJheUJ1ZmZlcicsIHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdoYXJkd2FyZUNvbmN1cnJlbmN5JywgdHlwZW9mIG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1NJTURqcycsIHR5cGVvZiBTSU1EICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYldvcmtlcnMnLCB0eXBlb2YgV29ya2VyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ0dhbWVwYWRBUEknLCBuYXZpZ2F0b3IuZ2V0R2FtZXBhZHMgfHwgbmF2aWdhdG9yLndlYmtpdEdldEdhbWVwYWRzKTtcbiAgdmFyIGhhc0luZGV4ZWREQiA9IGZhbHNlO1xuICB0cnkgeyBoYXNJbmRleGVkREIgPSB0eXBlb2YgaW5kZXhlZERCICE9PSAndW5kZWZpbmVkJzsgfSBjYXRjaCAoZSkge31cbiAgc2V0QXBpU3VwcG9ydCgnSW5kZXhlZERCJywgaGFzSW5kZXhlZERCKTtcbiAgc2V0QXBpU3VwcG9ydCgnVmlzaWJpbGl0eUFQSScsIHR5cGVvZiBkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgncmVxdWVzdEFuaW1hdGlvbkZyYW1lJywgdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdwZXJmb3JtYW5jZV9ub3cnLCB0eXBlb2YgcGVyZm9ybWFuY2UgIT09ICd1bmRlZmluZWQnICYmIHBlcmZvcm1hbmNlLm5vdyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlNvY2tldHMnLCB0eXBlb2YgV2ViU29ja2V0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlJUQycsIHR5cGVvZiBSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1velJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtc1JUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1ZpYnJhdGlvbkFQSScsIG5hdmlnYXRvci52aWJyYXRlKTtcbiAgc2V0QXBpU3VwcG9ydCgnU2NyZWVuT3JpZW50YXRpb25BUEknLCB3aW5kb3cuc2NyZWVuICYmICh3aW5kb3cuc2NyZWVuLm9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubW96T3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi53ZWJraXRPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1zT3JpZW50YXRpb24pKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2VvbG9jYXRpb25BUEknLCBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pO1xuICBzZXRBcGlTdXBwb3J0KCdCYXR0ZXJ5U3RhdHVzQVBJJywgbmF2aWdhdG9yLmdldEJhdHRlcnkpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBc3NlbWJseScsIHR5cGVvZiBXZWJBc3NlbWJseSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJWUicsIHR5cGVvZiBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJYUicsIHR5cGVvZiBuYXZpZ2F0b3IueHIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnT2Zmc2NyZWVuQ2FudmFzJywgdHlwZW9mIE9mZnNjcmVlbkNhbnZhcyAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJDb21wb25lbnRzJywgJ3JlZ2lzdGVyRWxlbWVudCcgaW4gZG9jdW1lbnQgJiYgJ2ltcG9ydCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpICYmICdjb250ZW50JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZW1wbGF0ZScpKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHZhciB3ZWJHTFN1cHBvcnQgPSB7fTtcbiAgdmFyIGJlc3RHTENvbnRleHQgPSBudWxsOyAvLyBUaGUgR0wgY29udGV4dHMgYXJlIHRlc3RlZCBmcm9tIGJlc3QgdG8gd29yc3QgKG5ld2VzdCB0byBvbGRlc3QpLCBhbmQgdGhlIG1vc3QgZGVzaXJhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29udGV4dCBpcyBzdG9yZWQgaGVyZSBmb3IgbGF0ZXIgdXNlLlxuICBmdW5jdGlvbiB0ZXN0V2ViR0xTdXBwb3J0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBlcnJvclJlYXNvbiA9ICcnO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvclwiLCBmdW5jdGlvbihlKSB7IGVycm9yUmVhc29uID0gZS5zdGF0dXNNZXNzYWdlOyB9LCBmYWxzZSk7XG4gICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChjb250ZXh0TmFtZSwgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA/IHsgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdDogdHJ1ZSB9IDoge30pO1xuICAgIGlmIChjb250ZXh0ICYmICFlcnJvclJlYXNvbikge1xuICAgICAgaWYgKCFiZXN0R0xDb250ZXh0KSBiZXN0R0xDb250ZXh0ID0gY29udGV4dDtcbiAgICAgIHZhciByZXN1bHRzID0geyBzdXBwb3J0ZWQ6IHRydWUsIHBlcmZvcm1hbmNlQ2F2ZWF0OiAhZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCB9O1xuICAgICAgaWYgKGNvbnRleHROYW1lID09ICdleHBlcmltZW50YWwtd2ViZ2wnKSByZXN1bHRzWydleHBlcmltZW50YWwtd2ViZ2wnXSA9IHRydWU7XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG4gICAgZWxzZSByZXR1cm4geyBzdXBwb3J0ZWQ6IGZhbHNlLCBlcnJvclJlYXNvbjogZXJyb3JSZWFzb24gfTtcbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbDInLCB0cnVlKTtcbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMiA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIGZhbHNlKTtcbiAgICBpZiAoc29mdHdhcmVXZWJHTDIuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMi5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAyIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHNvZnR3YXJlV2ViR0wyO1xuICAgIH1cbiAgfVxuXG4gIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbCcsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIGV4cGVyaW1lbnRhbFdlYkdMID0gdGVzdFdlYkdMU3VwcG9ydCgnZXhwZXJpbWVudGFsLXdlYmdsJywgdHJ1ZSk7XG4gICAgaWYgKGV4cGVyaW1lbnRhbFdlYkdMLnN1cHBvcnRlZCB8fCAoZXhwZXJpbWVudGFsV2ViR0wuZXJyb3JSZWFzb24gJiYgIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb24pKSB7XG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgfVxuICB9XG5cbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCkge1xuICAgIHZhciBzb2Z0d2FyZVdlYkdMMSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgZmFsc2UpO1xuICAgIGlmICghc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCBmYWxzZSk7XG4gICAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhc29mdHdhcmVXZWJHTDEuZXJyb3JSZWFzb24pKSB7XG4gICAgICAgIHNvZnR3YXJlV2ViR0wxID0gZXhwZXJpbWVudGFsV2ViR0w7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNvZnR3YXJlV2ViR0wxLnN1cHBvcnRlZCkge1xuICAgICAgc29mdHdhcmVXZWJHTDEuaGFyZHdhcmVFcnJvclJlYXNvbiA9IHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uZXJyb3JSZWFzb247IC8vIENhcHR1cmUgdGhlIHJlYXNvbiB3aHkgaGFyZHdhcmUgV2ViR0wgMSBjb250ZXh0IGRpZCBub3Qgc3VjY2VlZC5cbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBzb2Z0d2FyZVdlYkdMMTtcbiAgICB9XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdXZWJHTDEnLCB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMicsIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKTtcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICB2YXIgcmVzdWx0cyA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudEluZm8obmF2aWdhdG9yLnVzZXJBZ2VudCksXG4gICAgbmF2aWdhdG9yOiB7XG4gICAgICBidWlsZElEOiBuYXZpZ2F0b3IuYnVpbGRJRCxcbiAgICAgIGFwcFZlcnNpb246IG5hdmlnYXRvci5hcHBWZXJzaW9uLFxuICAgICAgb3NjcHU6IG5hdmlnYXRvci5vc2NwdSxcbiAgICAgIHBsYXRmb3JtOiBuYXZpZ2F0b3IucGxhdGZvcm0gIFxuICAgIH0sXG4gICAgLy8gZGlzcGxheVJlZnJlc2hSYXRlOiBkaXNwbGF5UmVmcmVzaFJhdGUsIC8vIFdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIG9uIGZpcnN0IHJ1biwgZGlyZWN0bHkgZmlsbGVkIGluIGxhdGVyLlxuICAgIGRpc3BsYXk6IHtcbiAgICAgIHdpbmRvd0RldmljZVBpeGVsUmF0aW86IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCxcbiAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCxcbiAgICAgIHBoeXNpY2FsU2NyZWVuV2lkdGg6IHNjcmVlbi53aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgcGh5c2ljYWxTY3JlZW5IZWlnaHQ6IHNjcmVlbi5oZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbywgIFxuICAgIH0sXG4gICAgaGFyZHdhcmVDb25jdXJyZW5jeTogbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3ksIC8vIElmIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0aGlzLCB3aWxsIGJlIGFzeW5jaHJvbm91c2x5IGZpbGxlZCBpbiBieSBjb3JlIGVzdGltYXRvci5cbiAgICBhcGlTdXBwb3J0OiBhcGlzLFxuICAgIHR5cGVkQXJyYXlFbmRpYW5uZXNzOiBlbmRpYW5uZXNzKClcbiAgfTtcblxuICAvLyBTb21lIGZpZWxkcyBleGlzdCBkb24ndCBhbHdheXMgZXhpc3RcbiAgdmFyIG9wdGlvbmFsRmllbGRzID0gWyd2ZW5kb3InLCAndmVuZG9yU3ViJywgJ3Byb2R1Y3QnLCAncHJvZHVjdFN1YicsICdsYW5ndWFnZScsICdhcHBDb2RlTmFtZScsICdhcHBOYW1lJywgJ21heFRvdWNoUG9pbnRzJywgJ3BvaW50ZXJFbmFibGVkJywgJ2NwdUNsYXNzJ107XG4gIGZvcih2YXIgaSBpbiBvcHRpb25hbEZpZWxkcykge1xuICAgIHZhciBmID0gb3B0aW9uYWxGaWVsZHNbaV07XG4gICAgaWYgKG5hdmlnYXRvcltmXSkgeyByZXN1bHRzLm5hdmlnYXRvcltmXSA9IG5hdmlnYXRvcltmXTsgfVxuICB9XG4vKlxuICB2YXIgbnVtQ29yZXNDaGVja2VkID0gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgPiAwO1xuXG4gIC8vIE9uIGZpcnN0IHJ1biwgZXN0aW1hdGUgdGhlIG51bWJlciBvZiBjb3JlcyBpZiBuZWVkZWQuXG4gIGlmICghbnVtQ29yZXNDaGVja2VkKSB7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KSB7XG4gICAgICBuYXZpZ2F0b3IuZ2V0SGFyZHdhcmVDb25jdXJyZW5jeShmdW5jdGlvbihjb3Jlcykge1xuICAgICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSBjb3JlcztcbiAgICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGlzIHdhcyB0aGUgbGFzdCBhc3luYyB0YXNrLCBmaXJlIHN1Y2Nlc3MgY2FsbGJhY2suXG4gICAgICAgIGlmIChudW1Db3Jlc0NoZWNrZWQgJiYgc3VjY2Vzc0NhbGxiYWNrKSBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgaXMgbm90IHN1cHBvcnRlZCwgYW5kIG5vIGNvcmUgZXN0aW1hdG9yIGF2YWlsYWJsZSBlaXRoZXIuXG4gICAgICAvLyBSZXBvcnQgbnVtYmVyIG9mIGNvcmVzIGFzIDAuXG4gICAgICByZXN1bHRzLmhhcmR3YXJlQ29uY3VycmVuY3kgPSAwO1xuICAgICAgbnVtQ29yZXNDaGVja2VkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiovXG4gIGVzdGltYXRlVlN5bmNSYXRlKCkudGhlbihyZWZyZXNoUmF0ZSA9PiB7XG4gICAgcmVzdWx0cy5yZWZyZXNoUmF0ZSA9IE1hdGgucm91bmQocmVmcmVzaFJhdGUpO1xuICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgfSk7XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgYXN5bmMgdGFza3Mgd2VyZSBuZWVkZWQgdG8gYmUgZXhlY3V0ZWQsIHF1ZXVlIHN1Y2Nlc3MgY2FsbGJhY2suXG4gIC8vIGlmIChudW1Db3Jlc0NoZWNrZWQgJiYgc3VjY2Vzc0NhbGxiYWNrKSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7IH0sIDEpO1xuXG4gIC8vIElmIGNhbGxlciBpcyBub3QgaW50ZXJlc3RlZCBpbiBhc3luY2hyb25vdXNseSBmaWxsYWJsZSBkYXRhLCBhbHNvIHJldHVybiB0aGUgcmVzdWx0cyBvYmplY3QgaW1tZWRpYXRlbHkgZm9yIHRoZSBzeW5jaHJvbm91cyBiaXRzLlxuICByZXR1cm4gcmVzdWx0cztcbn1cbiIsImZ1bmN0aW9uIGdldFdlYkdMSW5mb0J5VmVyc2lvbih3ZWJnbFZlcnNpb24pIHtcbiAgdmFyIHJlcG9ydCA9IHtcbiAgICB3ZWJnbFZlcnNpb246IHdlYmdsVmVyc2lvblxuICB9O1xuXG5pZiAoKHdlYmdsVmVyc2lvbiA9PT0gMiAmJiAhd2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHx8XG4gICAgKHdlYmdsVmVyc2lvbiA9PT0gMSAmJiAhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCkpIHtcbiAgICAvLyBUaGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IFdlYkdMXG4gICAgcmVwb3J0LmNvbnRleHROYW1lID0gXCJ3ZWJnbCBub3Qgc3VwcG9ydGVkXCI7XG4gICAgcmV0dXJuIHJlcG9ydDtcbn1cblxudmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG52YXIgZ2wsIGNvbnRleHROYW1lO1xudmFyIHBvc3NpYmxlTmFtZXMgPSAod2ViZ2xWZXJzaW9uID09PSAyKSA/IFtcIndlYmdsMlwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbDJcIl0gOiBbXCJ3ZWJnbFwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiXTtcbmZvciAodmFyIGk9MDtpPHBvc3NpYmxlTmFtZXMubGVuZ3RoO2krKykge1xuICB2YXIgbmFtZSA9IHBvc3NpYmxlTmFtZXNbaV07XG4gIGdsID0gY2FudmFzLmdldENvbnRleHQobmFtZSwgeyBzdGVuY2lsOiB0cnVlIH0pO1xuICBpZiAoZ2wpe1xuICAgICAgY29udGV4dE5hbWUgPSBuYW1lO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cbmNhbnZhcy5yZW1vdmUoKTtcbmlmICghZ2wpIHtcbiAgICByZXBvcnQuY29udGV4dE5hbWUgPSBcIndlYmdsIHN1cHBvcnRlZCBidXQgZmFpbGVkIHRvIGluaXRpYWxpemVcIjtcbiAgICByZXR1cm4gcmVwb3J0O1xufVxuXG5yZXR1cm4gT2JqZWN0LmFzc2lnbihyZXBvcnQsIHtcbiAgICBjb250ZXh0TmFtZTogY29udGV4dE5hbWUsXG4gICAgZ2xWZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuVkVSU0lPTiksXG4gICAgdmVuZG9yOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuVkVORE9SKSxcbiAgICByZW5kZXJlcjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlJFTkRFUkVSKSxcbiAgICB1bk1hc2tlZFZlbmRvcjogZ2V0VW5tYXNrZWRJbmZvKGdsKS52ZW5kb3IsXG4gICAgdW5NYXNrZWRSZW5kZXJlcjogZ2V0VW5tYXNrZWRJbmZvKGdsKS5yZW5kZXJlcixcbiAgICBhbmdsZTogZ2V0QW5nbGUoZ2wpLFxuICAgIGFudGlhbGlhczogIGdsLmdldENvbnRleHRBdHRyaWJ1dGVzKCkuYW50aWFsaWFzID8gXCJBdmFpbGFibGVcIiA6IFwiTm90IGF2YWlsYWJsZVwiLFxuICAgIG1ham9yUGVyZm9ybWFuY2VDYXZlYXQ6IGdldE1ham9yUGVyZm9ybWFuY2VDYXZlYXQoY29udGV4dE5hbWUpLFxuICAgIGJpdHM6IHtcbiAgICAgIHJlZEJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5SRURfQklUUyksXG4gICAgICBncmVlbkJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5HUkVFTl9CSVRTKSxcbiAgICAgIGJsdWVCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuQkxVRV9CSVRTKSxcbiAgICAgIGFscGhhQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMUEhBX0JJVFMpLFxuICAgICAgZGVwdGhCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuREVQVEhfQklUUyksXG4gICAgICBzdGVuY2lsQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLlNURU5DSUxfQklUUykgIFxuICAgIH0sXG4gICAgbWF4aW11bToge1xuICAgICAgbWF4Q29sb3JCdWZmZXJzOiBnZXRNYXhDb2xvckJ1ZmZlcnMoZ2wpLFxuICAgICAgbWF4UmVuZGVyQnVmZmVyU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9SRU5ERVJCVUZGRVJfU0laRSksXG4gICAgICBtYXhDb21iaW5lZFRleHR1cmVJbWFnZVVuaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0NPTUJJTkVEX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgICAgbWF4Q3ViZU1hcFRleHR1cmVTaXplOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0NVQkVfTUFQX1RFWFRVUkVfU0laRSksXG4gICAgICBtYXhGcmFnbWVudFVuaWZvcm1WZWN0b3JzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0ZSQUdNRU5UX1VOSUZPUk1fVkVDVE9SUyksXG4gICAgICBtYXhUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTKSxcbiAgICAgIG1heFRleHR1cmVTaXplOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfU0laRSksXG4gICAgICBtYXhWYXJ5aW5nVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WQVJZSU5HX1ZFQ1RPUlMpLFxuICAgICAgbWF4VmVydGV4QXR0cmlidXRlczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfQVRUUklCUyksXG4gICAgICBtYXhWZXJ0ZXhUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgICBtYXhWZXJ0ZXhVbmlmb3JtVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVU5JRk9STV9WRUNUT1JTKSwgIFxuICAgICAgbWF4Vmlld3BvcnREaW1lbnNpb25zOiBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVklFV1BPUlRfRElNUykpLFxuICAgICAgbWF4QW5pc290cm9weTogZ2V0TWF4QW5pc290cm9weShnbCksXG4gICAgfSxcbiAgICBhbGlhc2VkTGluZVdpZHRoUmFuZ2U6IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfTElORV9XSURUSF9SQU5HRSkpLFxuICAgIGFsaWFzZWRQb2ludFNpemVSYW5nZTogZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuQUxJQVNFRF9QT0lOVF9TSVpFX1JBTkdFKSksXG4gICAgc2hhZGVyczoge1xuICAgICAgdmVydGV4U2hhZGVyQmVzdFByZWNpc2lvbjogZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKGdsLlZFUlRFWF9TSEFERVIsIGdsKSxcbiAgICAgIGZyYWdtZW50U2hhZGVyQmVzdFByZWNpc2lvbjogZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wpLFxuICAgICAgZnJhZ21lbnRTaGFkZXJGbG9hdEludFByZWNpc2lvbjogZ2V0RmxvYXRJbnRQcmVjaXNpb24oZ2wpLFxuICAgICAgc2hhZGluZ0xhbmd1YWdlVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlNIQURJTkdfTEFOR1VBR0VfVkVSU0lPTilcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IGdsLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZGVzY3JpYmVSYW5nZSh2YWx1ZSkge1xuICByZXR1cm4gW3ZhbHVlWzBdLCB2YWx1ZVsxXV07XG59XG5cbmZ1bmN0aW9uIGdldFVubWFza2VkSW5mbyhnbCkge1xuICB2YXIgdW5NYXNrZWRJbmZvID0ge1xuICAgICAgcmVuZGVyZXI6IFwiXCIsXG4gICAgICB2ZW5kb3I6IFwiXCJcbiAgfTtcbiAgXG4gIHZhciBkYmdSZW5kZXJJbmZvID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mb1wiKTtcbiAgaWYgKGRiZ1JlbmRlckluZm8gIT0gbnVsbCkge1xuICAgICAgdW5NYXNrZWRJbmZvLnJlbmRlcmVyID0gZ2wuZ2V0UGFyYW1ldGVyKGRiZ1JlbmRlckluZm8uVU5NQVNLRURfUkVOREVSRVJfV0VCR0wpO1xuICAgICAgdW5NYXNrZWRJbmZvLnZlbmRvciAgID0gZ2wuZ2V0UGFyYW1ldGVyKGRiZ1JlbmRlckluZm8uVU5NQVNLRURfVkVORE9SX1dFQkdMKTtcbiAgfVxuICBcbiAgcmV0dXJuIHVuTWFza2VkSW5mbztcbn1cblxuZnVuY3Rpb24gZ2V0TWF4Q29sb3JCdWZmZXJzKGdsKSB7XG4gIHZhciBtYXhDb2xvckJ1ZmZlcnMgPSAxO1xuICB2YXIgZXh0ID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiV0VCR0xfZHJhd19idWZmZXJzXCIpO1xuICBpZiAoZXh0ICE9IG51bGwpIFxuICAgICAgbWF4Q29sb3JCdWZmZXJzID0gZ2wuZ2V0UGFyYW1ldGVyKGV4dC5NQVhfRFJBV19CVUZGRVJTX1dFQkdMKTtcbiAgXG4gIHJldHVybiBtYXhDb2xvckJ1ZmZlcnM7XG59XG5cbmZ1bmN0aW9uIGdldE1ham9yUGVyZm9ybWFuY2VDYXZlYXQoY29udGV4dE5hbWUpIHtcbiAgLy8gRG9lcyBjb250ZXh0IGNyZWF0aW9uIGZhaWwgdG8gZG8gYSBtYWpvciBwZXJmb3JtYW5jZSBjYXZlYXQ/XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIikpO1xuICB2YXIgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChjb250ZXh0TmFtZSwgeyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IDogdHJ1ZSB9KTtcbiAgY2FudmFzLnJlbW92ZSgpO1xuXG4gIGlmICghZ2wpIHtcbiAgICAgIC8vIE91ciBvcmlnaW5hbCBjb250ZXh0IGNyZWF0aW9uIHBhc3NlZC4gIFRoaXMgZGlkIG5vdC5cbiAgICAgIHJldHVybiBcIlllc1wiO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBnbC5nZXRDb250ZXh0QXR0cmlidXRlcygpLmZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIC8vIElmIGdldENvbnRleHRBdHRyaWJ1dGVzKCkgZG9lc25cInQgaW5jbHVkZSB0aGUgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdFxuICAgICAgLy8gcHJvcGVydHksIGFzc3VtZSB0aGUgYnJvd3NlciBkb2VzblwidCBpbXBsZW1lbnQgaXQgeWV0LlxuICAgICAgcmV0dXJuIFwiTm90IGltcGxlbWVudGVkXCI7XG4gIH1cbiAgcmV0dXJuIFwiTm9cIjtcbn1cblxuZnVuY3Rpb24gaXNQb3dlck9mVHdvKG4pIHtcbiAgcmV0dXJuIChuICE9PSAwKSAmJiAoKG4gJiAobiAtIDEpKSA9PT0gMCk7XG59XG5cbmZ1bmN0aW9uIGdldEFuZ2xlKGdsKSB7XG4gIHZhciBsaW5lV2lkdGhSYW5nZSA9IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfTElORV9XSURUSF9SQU5HRSkpO1xuXG4gIC8vIEhldXJpc3RpYzogQU5HTEUgaXMgb25seSBvbiBXaW5kb3dzLCBub3QgaW4gSUUsIGFuZCBkb2VzIG5vdCBpbXBsZW1lbnQgbGluZSB3aWR0aCBncmVhdGVyIHRoYW4gb25lLlxuICB2YXIgYW5nbGUgPSAoKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gXCJXaW4zMlwiKSB8fCAobmF2aWdhdG9yLnBsYXRmb3JtID09PSBcIldpbjY0XCIpKSAmJlxuICAgICAgKGdsLmdldFBhcmFtZXRlcihnbC5SRU5ERVJFUikgIT09IFwiSW50ZXJuZXQgRXhwbG9yZXJcIikgJiZcbiAgICAgIChsaW5lV2lkdGhSYW5nZSA9PT0gZGVzY3JpYmVSYW5nZShbMSwxXSkpO1xuXG4gIGlmIChhbmdsZSkge1xuICAgICAgLy8gSGV1cmlzdGljOiBEM0QxMSBiYWNrZW5kIGRvZXMgbm90IGFwcGVhciB0byByZXNlcnZlIHVuaWZvcm1zIGxpa2UgdGhlIEQzRDkgYmFja2VuZCwgZS5nLixcbiAgICAgIC8vIEQzRDExIG1heSBoYXZlIDEwMjQgdW5pZm9ybXMgcGVyIHN0YWdlLCBidXQgRDNEOSBoYXMgMjU0IGFuZCAyMjEuXG4gICAgICAvL1xuICAgICAgLy8gV2UgY291bGQgYWxzbyB0ZXN0IGZvciBXRUJHTF9kcmF3X2J1ZmZlcnMsIGJ1dCBtYW55IHN5c3RlbXMgZG8gbm90IGhhdmUgaXQgeWV0XG4gICAgICAvLyBkdWUgdG8gZHJpdmVyIGJ1Z3MsIGV0Yy5cbiAgICAgIGlmIChpc1Bvd2VyT2ZUd28oZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfVU5JRk9STV9WRUNUT1JTKSkgJiYgaXNQb3dlck9mVHdvKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfRlJBR01FTlRfVU5JRk9STV9WRUNUT1JTKSkpIHtcbiAgICAgICAgICByZXR1cm4gXCJZZXMsIEQzRDExXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIlllcywgRDNEOVwiO1xuICAgICAgfVxuICB9XG5cbiAgcmV0dXJuIFwiTm9cIjtcbn1cblxuZnVuY3Rpb24gZ2V0TWF4QW5pc290cm9weShnbCkge1xuICB2YXIgZSA9IGdsLmdldEV4dGVuc2lvbihcIkVYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiKVxuICAgICAgICAgIHx8IGdsLmdldEV4dGVuc2lvbihcIldFQktJVF9FWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNcIilcbiAgICAgICAgICB8fCBnbC5nZXRFeHRlbnNpb24oXCJNT1pfRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpO1xuXG4gIGlmIChlKSB7XG4gICAgICB2YXIgbWF4ID0gZ2wuZ2V0UGFyYW1ldGVyKGUuTUFYX1RFWFRVUkVfTUFYX0FOSVNPVFJPUFlfRVhUKTtcbiAgICAgIC8vIFNlZSBDYW5hcnkgYnVnOiBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9MTE3NDUwXG4gICAgICBpZiAobWF4ID09PSAwKSB7XG4gICAgICAgICAgbWF4ID0gMjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXg7XG4gIH1cbiAgcmV0dXJuIFwibi9hXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFBvd2VyKGV4cG9uZW50LCB2ZXJib3NlKSB7XG4gIGlmICh2ZXJib3NlKSB7XG4gICAgICByZXR1cm4gXCJcIiArIE1hdGgucG93KDIsIGV4cG9uZW50KTtcbiAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIjJeXCIgKyBleHBvbmVudCArIFwiXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24ocHJlY2lzaW9uLCB2ZXJib3NlKSB7XG4gIHZhciB2ZXJib3NlUGFydCA9IHZlcmJvc2UgPyBcIiBiaXQgbWFudGlzc2FcIiA6IFwiXCI7XG4gIHJldHVybiBcIlstXCIgKyBmb3JtYXRQb3dlcihwcmVjaXNpb24ucmFuZ2VNaW4sIHZlcmJvc2UpICsgXCIsIFwiICsgZm9ybWF0UG93ZXIocHJlY2lzaW9uLnJhbmdlTWF4LCB2ZXJib3NlKSArIFwiXSAoXCIgKyBwcmVjaXNpb24ucHJlY2lzaW9uICsgdmVyYm9zZVBhcnQgKyBcIilcIlxufVxuXG5mdW5jdGlvbiBnZXRCZXN0RmxvYXRQcmVjaXNpb24oc2hhZGVyVHlwZSwgZ2wpIHtcbiAgdmFyIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuSElHSF9GTE9BVCk7XG4gIHZhciBtZWRpdW0gPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuTUVESVVNX0ZMT0FUKTtcbiAgdmFyIGxvdyA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChzaGFkZXJUeXBlLCBnbC5MT1dfRkxPQVQpO1xuXG4gIHZhciBiZXN0ID0gaGlnaDtcbiAgaWYgKGhpZ2gucHJlY2lzaW9uID09PSAwKSB7XG4gICAgICBiZXN0ID0gbWVkaXVtO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAgIGhpZ2ggOiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihoaWdoLCB0cnVlKSxcbiAgICAgIG1lZGl1bSA6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKG1lZGl1bSwgdHJ1ZSksXG4gICAgICBsb3c6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKGxvdywgdHJ1ZSksXG4gICAgICBiZXN0OiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihiZXN0LCBmYWxzZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRGbG9hdEludFByZWNpc2lvbihnbCkge1xuICB2YXIgaGlnaCA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5GUkFHTUVOVF9TSEFERVIsIGdsLkhJR0hfRkxPQVQpO1xuICB2YXIgcyA9IChoaWdoLnByZWNpc2lvbiAhPT0gMCkgPyBcImhpZ2hwL1wiIDogXCJtZWRpdW1wL1wiO1xuXG4gIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0lOVCk7XG4gIHMgKz0gKGhpZ2gucmFuZ2VNYXggIT09IDApID8gXCJoaWdocFwiIDogXCJsb3dwXCI7XG5cbiAgcmV0dXJuIHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgd2ViZ2wxOiBnZXRXZWJHTEluZm9CeVZlcnNpb24oMSksXG4gICAgd2ViZ2wyOiBnZXRXZWJHTEluZm9CeVZlcnNpb24oMilcbiAgfVxufVxuIiwiLypcbiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNIQSBmYW1pbHkgb2YgaGFzaGVzLCBhc1xuIGRlZmluZWQgaW4gRklQUyBQVUIgMTgwLTQgYW5kIEZJUFMgUFVCIDIwMiwgYXMgd2VsbCBhcyB0aGUgY29ycmVzcG9uZGluZ1xuIEhNQUMgaW1wbGVtZW50YXRpb24gYXMgZGVmaW5lZCBpbiBGSVBTIFBVQiAxOThhXG5cbiBDb3B5cmlnaHQgMjAwOC0yMDIwIEJyaWFuIFR1cmVrLCAxOTk4LTIwMDkgUGF1bCBKb2huc3RvbiAmIENvbnRyaWJ1dG9yc1xuIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuIFNlZSBodHRwOi8vY2FsaWdhdGlvLmdpdGh1Yi5jb20vanNTSEEvIGZvciBtb3JlIGluZm9ybWF0aW9uXG4qL1xuJ3VzZSBzdHJpY3QnOyhmdW5jdGlvbihhYSl7ZnVuY3Rpb24gQyhkLGIsYSl7dmFyIGg9MCxrPVtdLG09MCxnLGwsYyxmLG4scSx1LHIsST0hMSx2PVtdLHg9W10sdCx5PSExLHo9ITEsdz0tMTthPWF8fHt9O2c9YS5lbmNvZGluZ3x8XCJVVEY4XCI7dD1hLm51bVJvdW5kc3x8MTtpZih0IT09cGFyc2VJbnQodCwxMCl8fDE+dCl0aHJvdyBFcnJvcihcIm51bVJvdW5kcyBtdXN0IGEgaW50ZWdlciA+PSAxXCIpO2lmKFwiU0hBLTFcIj09PWQpbj01MTIscT1LLHU9YmEsZj0xNjAscj1mdW5jdGlvbihiKXtyZXR1cm4gYi5zbGljZSgpfTtlbHNlIGlmKDA9PT1kLmxhc3RJbmRleE9mKFwiU0hBLVwiLDApKWlmKHE9ZnVuY3Rpb24oYixoKXtyZXR1cm4gTChiLGgsZCl9LHU9ZnVuY3Rpb24oYixoLGssYSl7dmFyIGUsZjtpZihcIlNIQS0yMjRcIj09PWR8fFwiU0hBLTI1NlwiPT09ZCllPShoKzY1Pj4+OTw8NCkrMTUsZj0xNjtlbHNlIGlmKFwiU0hBLTM4NFwiPT09ZHx8XCJTSEEtNTEyXCI9PT1kKWU9KGgrMTI5Pj4+MTA8PFxuNSkrMzEsZj0zMjtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtmb3IoO2IubGVuZ3RoPD1lOyliLnB1c2goMCk7YltoPj4+NV18PTEyODw8MjQtaCUzMjtoPWgraztiW2VdPWgmNDI5NDk2NzI5NTtiW2UtMV09aC80Mjk0OTY3Mjk2fDA7az1iLmxlbmd0aDtmb3IoaD0wO2g8aztoKz1mKWE9TChiLnNsaWNlKGgsaCtmKSxhLGQpO2lmKFwiU0hBLTIyNFwiPT09ZCliPVthWzBdLGFbMV0sYVsyXSxhWzNdLGFbNF0sYVs1XSxhWzZdXTtlbHNlIGlmKFwiU0hBLTI1NlwiPT09ZCliPWE7ZWxzZSBpZihcIlNIQS0zODRcIj09PWQpYj1bYVswXS5hLGFbMF0uYixhWzFdLmEsYVsxXS5iLGFbMl0uYSxhWzJdLmIsYVszXS5hLGFbM10uYixhWzRdLmEsYVs0XS5iLGFbNV0uYSxhWzVdLmJdO2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1kKWI9W2FbMF0uYSxhWzBdLmIsYVsxXS5hLGFbMV0uYixhWzJdLmEsYVsyXS5iLGFbM10uYSxhWzNdLmIsYVs0XS5hLFxuYVs0XS5iLGFbNV0uYSxhWzVdLmIsYVs2XS5hLGFbNl0uYixhWzddLmEsYVs3XS5iXTtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtyZXR1cm4gYn0scj1mdW5jdGlvbihiKXtyZXR1cm4gYi5zbGljZSgpfSxcIlNIQS0yMjRcIj09PWQpbj01MTIsZj0yMjQ7ZWxzZSBpZihcIlNIQS0yNTZcIj09PWQpbj01MTIsZj0yNTY7ZWxzZSBpZihcIlNIQS0zODRcIj09PWQpbj0xMDI0LGY9Mzg0O2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1kKW49MTAyNCxmPTUxMjtlbHNlIHRocm93IEVycm9yKFwiQ2hvc2VuIFNIQSB2YXJpYW50IGlzIG5vdCBzdXBwb3J0ZWRcIik7ZWxzZSBpZigwPT09ZC5sYXN0SW5kZXhPZihcIlNIQTMtXCIsMCl8fDA9PT1kLmxhc3RJbmRleE9mKFwiU0hBS0VcIiwwKSl7dmFyIEY9NjtxPUQ7cj1mdW5jdGlvbihiKXt2YXIgZD1bXSxhO2ZvcihhPTA7NT5hO2ErPTEpZFthXT1iW2FdLnNsaWNlKCk7cmV0dXJuIGR9O3c9MTtpZihcIlNIQTMtMjI0XCI9PT1cbmQpbj0xMTUyLGY9MjI0O2Vsc2UgaWYoXCJTSEEzLTI1NlwiPT09ZCluPTEwODgsZj0yNTY7ZWxzZSBpZihcIlNIQTMtMzg0XCI9PT1kKW49ODMyLGY9Mzg0O2Vsc2UgaWYoXCJTSEEzLTUxMlwiPT09ZCluPTU3NixmPTUxMjtlbHNlIGlmKFwiU0hBS0UxMjhcIj09PWQpbj0xMzQ0LGY9LTEsRj0zMSx6PSEwO2Vsc2UgaWYoXCJTSEFLRTI1NlwiPT09ZCluPTEwODgsZj0tMSxGPTMxLHo9ITA7ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO3U9ZnVuY3Rpb24oYixkLGEsaCxrKXthPW47dmFyIGU9RixmLGc9W10sbT1hPj4+NSxsPTAsYz1kPj4+NTtmb3IoZj0wO2Y8YyYmZD49YTtmKz1tKWg9RChiLnNsaWNlKGYsZittKSxoKSxkLT1hO2I9Yi5zbGljZShmKTtmb3IoZCU9YTtiLmxlbmd0aDxtOyliLnB1c2goMCk7Zj1kPj4+MztiW2Y+PjJdXj1lPDxmJTQqODtiW20tMV1ePTIxNDc0ODM2NDg7Zm9yKGg9RChiLGgpOzMyKmcubGVuZ3RoPGs7KXtiPWhbbCVcbjVdW2wvNXwwXTtnLnB1c2goYi5iKTtpZigzMipnLmxlbmd0aD49aylicmVhaztnLnB1c2goYi5hKTtsKz0xOzA9PT02NCpsJWEmJihEKG51bGwsaCksbD0wKX1yZXR1cm4gZ319ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO2M9TShiLGcsdyk7bD1BKGQpO3RoaXMuc2V0SE1BQ0tleT1mdW5jdGlvbihiLGEsayl7dmFyIGU7aWYoITA9PT1JKXRocm93IEVycm9yKFwiSE1BQyBrZXkgYWxyZWFkeSBzZXRcIik7aWYoITA9PT15KXRocm93IEVycm9yKFwiQ2Fubm90IHNldCBITUFDIGtleSBhZnRlciBjYWxsaW5nIHVwZGF0ZVwiKTtpZighMD09PXopdGhyb3cgRXJyb3IoXCJTSEFLRSBpcyBub3Qgc3VwcG9ydGVkIGZvciBITUFDXCIpO2c9KGt8fHt9KS5lbmNvZGluZ3x8XCJVVEY4XCI7YT1NKGEsZyx3KShiKTtiPWEuYmluTGVuO2E9YS52YWx1ZTtlPW4+Pj4zO2s9ZS80LTE7Zm9yKGU8Yi84JiYoYT11KGEsYiwwLEEoZCksZikpO2EubGVuZ3RoPD1cbms7KWEucHVzaCgwKTtmb3IoYj0wO2I8PWs7Yis9MSl2W2JdPWFbYl1eOTA5NTIyNDg2LHhbYl09YVtiXV4xNTQ5NTU2ODI4O2w9cSh2LGwpO2g9bjtJPSEwfTt0aGlzLnVwZGF0ZT1mdW5jdGlvbihiKXt2YXIgZCxhLGUsZj0wLGc9bj4+PjU7ZD1jKGIsayxtKTtiPWQuYmluTGVuO2E9ZC52YWx1ZTtkPWI+Pj41O2ZvcihlPTA7ZTxkO2UrPWcpZituPD1iJiYobD1xKGEuc2xpY2UoZSxlK2cpLGwpLGYrPW4pO2grPWY7az1hLnNsaWNlKGY+Pj41KTttPWIlbjt5PSEwfTt0aGlzLmdldEhhc2g9ZnVuY3Rpb24oYixhKXt2YXIgZSxnLGMsbjtpZighMD09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRIYXNoIGFmdGVyIHNldHRpbmcgSE1BQyBrZXlcIik7Yz1OKGEpO2lmKCEwPT09eil7aWYoLTE9PT1jLnNoYWtlTGVuKXRocm93IEVycm9yKFwic2hha2VMZW4gbXVzdCBiZSBzcGVjaWZpZWQgaW4gb3B0aW9uc1wiKTtmPWMuc2hha2VMZW59c3dpdGNoKGIpe2Nhc2UgXCJIRVhcIjplPWZ1bmN0aW9uKGIpe3JldHVybiBPKGIsXG5mLHcsYyl9O2JyZWFrO2Nhc2UgXCJCNjRcIjplPWZ1bmN0aW9uKGIpe3JldHVybiBQKGIsZix3LGMpfTticmVhaztjYXNlIFwiQllURVNcIjplPWZ1bmN0aW9uKGIpe3JldHVybiBRKGIsZix3KX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2c9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKHApe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31lPWZ1bmN0aW9uKGIpe3JldHVybiBSKGIsZix3KX07YnJlYWs7Y2FzZSBcIlVJTlQ4QVJSQVlcIjp0cnl7Zz1uZXcgVWludDhBcnJheSgwKX1jYXRjaChwKXt0aHJvdyBFcnJvcihcIlVJTlQ4QVJSQVkgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31lPWZ1bmN0aW9uKGIpe3JldHVybiBTKGIsZix3KX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcImZvcm1hdCBtdXN0IGJlIEhFWCwgQjY0LCBCWVRFUywgQVJSQVlCVUZGRVIsIG9yIFVJTlQ4QVJSQVlcIik7fW49dShrLnNsaWNlKCksXG5tLGgscihsKSxmKTtmb3IoZz0xO2c8dDtnKz0xKSEwPT09eiYmMCE9PWYlMzImJihuW24ubGVuZ3RoLTFdJj0xNjc3NzIxNT4+PjI0LWYlMzIpLG49dShuLGYsMCxBKGQpLGYpO3JldHVybiBlKG4pfTt0aGlzLmdldEhNQUM9ZnVuY3Rpb24oYixhKXt2YXIgZSxnLGMscDtpZighMT09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRITUFDIHdpdGhvdXQgZmlyc3Qgc2V0dGluZyBITUFDIGtleVwiKTtjPU4oYSk7c3dpdGNoKGIpe2Nhc2UgXCJIRVhcIjplPWZ1bmN0aW9uKGIpe3JldHVybiBPKGIsZix3LGMpfTticmVhaztjYXNlIFwiQjY0XCI6ZT1mdW5jdGlvbihiKXtyZXR1cm4gUChiLGYsdyxjKX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6ZT1mdW5jdGlvbihiKXtyZXR1cm4gUShiLGYsdyl9O2JyZWFrO2Nhc2UgXCJBUlJBWUJVRkZFUlwiOnRyeXtlPW5ldyBBcnJheUJ1ZmZlcigwKX1jYXRjaCh2KXt0aHJvdyBFcnJvcihcIkFSUkFZQlVGRkVSIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTtcbn1lPWZ1bmN0aW9uKGIpe3JldHVybiBSKGIsZix3KX07YnJlYWs7Y2FzZSBcIlVJTlQ4QVJSQVlcIjp0cnl7ZT1uZXcgVWludDhBcnJheSgwKX1jYXRjaCh2KXt0aHJvdyBFcnJvcihcIlVJTlQ4QVJSQVkgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31lPWZ1bmN0aW9uKGIpe3JldHVybiBTKGIsZix3KX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIm91dHB1dEZvcm1hdCBtdXN0IGJlIEhFWCwgQjY0LCBCWVRFUywgQVJSQVlCVUZGRVIsIG9yIFVJTlQ4QVJSQVlcIik7fWc9dShrLnNsaWNlKCksbSxoLHIobCksZik7cD1xKHgsQShkKSk7cD11KGcsZixuLHAsZik7cmV0dXJuIGUocCl9fWZ1bmN0aW9uIGEoZCxiKXt0aGlzLmE9ZDt0aGlzLmI9Yn1mdW5jdGlvbiBUKGQsYixhLGgpe3ZhciBrLG0sZyxsLGM7Yj1ifHxbMF07YT1hfHwwO209YT4+PjM7Yz0tMT09PWg/MzowO2ZvcihrPTA7azxkLmxlbmd0aDtrKz0xKWw9ayttLGc9bD4+PjIsYi5sZW5ndGg8PWcmJmIucHVzaCgwKSxcbmJbZ118PWRba108PDgqKGMrbCU0KmgpO3JldHVybnt2YWx1ZTpiLGJpbkxlbjo4KmQubGVuZ3RoK2F9fWZ1bmN0aW9uIE8oYSxiLGUsaCl7dmFyIGs9XCJcIjtiLz04O3ZhciBtLGcsYztjPS0xPT09ZT8zOjA7Zm9yKG09MDttPGI7bSs9MSlnPWFbbT4+PjJdPj4+OCooYyttJTQqZSksays9XCIwMTIzNDU2Nzg5YWJjZGVmXCIuY2hhckF0KGc+Pj40JjE1KStcIjAxMjM0NTY3ODlhYmNkZWZcIi5jaGFyQXQoZyYxNSk7cmV0dXJuIGgub3V0cHV0VXBwZXI/ay50b1VwcGVyQ2FzZSgpOmt9ZnVuY3Rpb24gUChhLGIsZSxoKXt2YXIgaz1cIlwiLG09Yi84LGcsYyxwLGY7Zj0tMT09PWU/MzowO2ZvcihnPTA7ZzxtO2crPTMpZm9yKGM9ZysxPG0/YVtnKzE+Pj4yXTowLHA9ZysyPG0/YVtnKzI+Pj4yXTowLHA9KGFbZz4+PjJdPj4+OCooZitnJTQqZSkmMjU1KTw8MTZ8KGM+Pj44KihmKyhnKzEpJTQqZSkmMjU1KTw8OHxwPj4+OCooZisoZysyKSU0KmUpJjI1NSxjPTA7ND5jO2MrPTEpOCpnKzYqYzw9Yj9rKz1cblwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiLmNoYXJBdChwPj4+NiooMy1jKSY2Myk6ays9aC5iNjRQYWQ7cmV0dXJuIGt9ZnVuY3Rpb24gUShhLGIsZSl7dmFyIGg9XCJcIjtiLz04O3ZhciBrLGMsZztnPS0xPT09ZT8zOjA7Zm9yKGs9MDtrPGI7ays9MSljPWFbaz4+PjJdPj4+OCooZytrJTQqZSkmMjU1LGgrPVN0cmluZy5mcm9tQ2hhckNvZGUoYyk7cmV0dXJuIGh9ZnVuY3Rpb24gUihhLGIsZSl7Yi89ODt2YXIgaCxrPW5ldyBBcnJheUJ1ZmZlcihiKSxjLGc7Zz1uZXcgVWludDhBcnJheShrKTtjPS0xPT09ZT8zOjA7Zm9yKGg9MDtoPGI7aCs9MSlnW2hdPWFbaD4+PjJdPj4+OCooYytoJTQqZSkmMjU1O3JldHVybiBrfWZ1bmN0aW9uIFMoYSxiLGUpe2IvPTg7dmFyIGgsaz1uZXcgVWludDhBcnJheShiKSxjO2M9LTE9PT1lPzM6MDtmb3IoaD0wO2g8YjtoKz0xKWtbaF09YVtoPj4+Ml0+Pj44KihjK2glNCplKSZcbjI1NTtyZXR1cm4ga31mdW5jdGlvbiBOKGEpe3ZhciBiPXtvdXRwdXRVcHBlcjohMSxiNjRQYWQ6XCI9XCIsc2hha2VMZW46LTF9O2E9YXx8e307Yi5vdXRwdXRVcHBlcj1hLm91dHB1dFVwcGVyfHwhMTshMD09PWEuaGFzT3duUHJvcGVydHkoXCJiNjRQYWRcIikmJihiLmI2NFBhZD1hLmI2NFBhZCk7aWYoITA9PT1hLmhhc093blByb3BlcnR5KFwic2hha2VMZW5cIikpe2lmKDAhPT1hLnNoYWtlTGVuJTgpdGhyb3cgRXJyb3IoXCJzaGFrZUxlbiBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgOFwiKTtiLnNoYWtlTGVuPWEuc2hha2VMZW59aWYoXCJib29sZWFuXCIhPT10eXBlb2YgYi5vdXRwdXRVcHBlcil0aHJvdyBFcnJvcihcIkludmFsaWQgb3V0cHV0VXBwZXIgZm9ybWF0dGluZyBvcHRpb25cIik7aWYoXCJzdHJpbmdcIiE9PXR5cGVvZiBiLmI2NFBhZCl0aHJvdyBFcnJvcihcIkludmFsaWQgYjY0UGFkIGZvcm1hdHRpbmcgb3B0aW9uXCIpO3JldHVybiBifWZ1bmN0aW9uIE0oYSxiLGUpe3N3aXRjaChiKXtjYXNlIFwiVVRGOFwiOmNhc2UgXCJVVEYxNkJFXCI6Y2FzZSBcIlVURjE2TEVcIjpicmVhaztcbmRlZmF1bHQ6dGhyb3cgRXJyb3IoXCJlbmNvZGluZyBtdXN0IGJlIFVURjgsIFVURjE2QkUsIG9yIFVURjE2TEVcIik7fXN3aXRjaChhKXtjYXNlIFwiSEVYXCI6YT1mdW5jdGlvbihiLGEsZCl7dmFyIGc9Yi5sZW5ndGgsYyxwLGYsbixxLHU7aWYoMCE9PWclMil0aHJvdyBFcnJvcihcIlN0cmluZyBvZiBIRVggdHlwZSBtdXN0IGJlIGluIGJ5dGUgaW5jcmVtZW50c1wiKTthPWF8fFswXTtkPWR8fDA7cT1kPj4+Mzt1PS0xPT09ZT8zOjA7Zm9yKGM9MDtjPGc7Yys9Mil7cD1wYXJzZUludChiLnN1YnN0cihjLDIpLDE2KTtpZihpc05hTihwKSl0aHJvdyBFcnJvcihcIlN0cmluZyBvZiBIRVggdHlwZSBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnNcIik7bj0oYz4+PjEpK3E7Zm9yKGY9bj4+PjI7YS5sZW5ndGg8PWY7KWEucHVzaCgwKTthW2ZdfD1wPDw4Kih1K24lNCplKX1yZXR1cm57dmFsdWU6YSxiaW5MZW46NCpnK2R9fTticmVhaztjYXNlIFwiVEVYVFwiOmE9ZnVuY3Rpb24oYSxkLGMpe3ZhciBnLFxubCxwPTAsZixuLHEsdSxyLHQ7ZD1kfHxbMF07Yz1jfHwwO3E9Yz4+PjM7aWYoXCJVVEY4XCI9PT1iKWZvcih0PS0xPT09ZT8zOjAsZj0wO2Y8YS5sZW5ndGg7Zis9MSlmb3IoZz1hLmNoYXJDb2RlQXQoZiksbD1bXSwxMjg+Zz9sLnB1c2goZyk6MjA0OD5nPyhsLnB1c2goMTkyfGc+Pj42KSxsLnB1c2goMTI4fGcmNjMpKTo1NTI5Nj5nfHw1NzM0NDw9Zz9sLnB1c2goMjI0fGc+Pj4xMiwxMjh8Zz4+PjYmNjMsMTI4fGcmNjMpOihmKz0xLGc9NjU1MzYrKChnJjEwMjMpPDwxMHxhLmNoYXJDb2RlQXQoZikmMTAyMyksbC5wdXNoKDI0MHxnPj4+MTgsMTI4fGc+Pj4xMiY2MywxMjh8Zz4+PjYmNjMsMTI4fGcmNjMpKSxuPTA7bjxsLmxlbmd0aDtuKz0xKXtyPXArcTtmb3IodT1yPj4+MjtkLmxlbmd0aDw9dTspZC5wdXNoKDApO2RbdV18PWxbbl08PDgqKHQrciU0KmUpO3ArPTF9ZWxzZSBpZihcIlVURjE2QkVcIj09PWJ8fFwiVVRGMTZMRVwiPT09Yilmb3IodD0tMT09PWU/MjowLGw9XCJVVEYxNkxFXCI9PT1cbmImJjEhPT1lfHxcIlVURjE2TEVcIiE9PWImJjE9PT1lLGY9MDtmPGEubGVuZ3RoO2YrPTEpe2c9YS5jaGFyQ29kZUF0KGYpOyEwPT09bCYmKG49ZyYyNTUsZz1uPDw4fGc+Pj44KTtyPXArcTtmb3IodT1yPj4+MjtkLmxlbmd0aDw9dTspZC5wdXNoKDApO2RbdV18PWc8PDgqKHQrciU0KmUpO3ArPTJ9cmV0dXJue3ZhbHVlOmQsYmluTGVuOjgqcCtjfX07YnJlYWs7Y2FzZSBcIkI2NFwiOmE9ZnVuY3Rpb24oYixhLGQpe3ZhciBjPTAsbCxwLGYsbixxLHUscix0O2lmKC0xPT09Yi5zZWFyY2goL15bYS16QS1aMC05PStcXC9dKyQvKSl0aHJvdyBFcnJvcihcIkludmFsaWQgY2hhcmFjdGVyIGluIGJhc2UtNjQgc3RyaW5nXCIpO3A9Yi5pbmRleE9mKFwiPVwiKTtiPWIucmVwbGFjZSgvXFw9L2csXCJcIik7aWYoLTEhPT1wJiZwPGIubGVuZ3RoKXRocm93IEVycm9yKFwiSW52YWxpZCAnPScgZm91bmQgaW4gYmFzZS02NCBzdHJpbmdcIik7YT1hfHxbMF07ZD1kfHwwO3U9ZD4+PjM7dD0tMT09PWU/MzowO2ZvcihwPVxuMDtwPGIubGVuZ3RoO3ArPTQpe3E9Yi5zdWJzdHIocCw0KTtmb3IoZj1uPTA7ZjxxLmxlbmd0aDtmKz0xKWw9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCIuaW5kZXhPZihxLmNoYXJBdChmKSksbnw9bDw8MTgtNipmO2ZvcihmPTA7ZjxxLmxlbmd0aC0xO2YrPTEpe3I9Yyt1O2ZvcihsPXI+Pj4yO2EubGVuZ3RoPD1sOylhLnB1c2goMCk7YVtsXXw9KG4+Pj4xNi04KmYmMjU1KTw8OCoodCtyJTQqZSk7Yys9MX19cmV0dXJue3ZhbHVlOmEsYmluTGVuOjgqYytkfX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6YT1mdW5jdGlvbihiLGEsZCl7dmFyIGMsbCxwLGYsbixxO2E9YXx8WzBdO2Q9ZHx8MDtwPWQ+Pj4zO3E9LTE9PT1lPzM6MDtmb3IobD0wO2w8Yi5sZW5ndGg7bCs9MSljPWIuY2hhckNvZGVBdChsKSxuPWwrcCxmPW4+Pj4yLGEubGVuZ3RoPD1mJiZhLnB1c2goMCksYVtmXXw9Yzw8OCoocStuJTQqZSk7cmV0dXJue3ZhbHVlOmEsXG5iaW5MZW46OCpiLmxlbmd0aCtkfX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2E9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKGgpe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31hPWZ1bmN0aW9uKGIsYSxkKXtyZXR1cm4gVChuZXcgVWludDhBcnJheShiKSxhLGQsZSl9O2JyZWFrO2Nhc2UgXCJVSU5UOEFSUkFZXCI6dHJ5e2E9bmV3IFVpbnQ4QXJyYXkoMCl9Y2F0Y2goaCl7dGhyb3cgRXJyb3IoXCJVSU5UOEFSUkFZIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTt9YT1mdW5jdGlvbihiLGEsZCl7cmV0dXJuIFQoYixhLGQsZSl9O2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJmb3JtYXQgbXVzdCBiZSBIRVgsIFRFWFQsIEI2NCwgQllURVMsIEFSUkFZQlVGRkVSLCBvciBVSU5UOEFSUkFZXCIpO31yZXR1cm4gYX1mdW5jdGlvbiB5KGEsYil7cmV0dXJuIGE8PGJ8YT4+PjMyLWJ9ZnVuY3Rpb24gVShkLFxuYil7cmV0dXJuIDMyPGI/KGItPTMyLG5ldyBhKGQuYjw8YnxkLmE+Pj4zMi1iLGQuYTw8YnxkLmI+Pj4zMi1iKSk6MCE9PWI/bmV3IGEoZC5hPDxifGQuYj4+PjMyLWIsZC5iPDxifGQuYT4+PjMyLWIpOmR9ZnVuY3Rpb24geChhLGIpe3JldHVybiBhPj4+YnxhPDwzMi1ifWZ1bmN0aW9uIHQoZCxiKXt2YXIgZT1udWxsLGU9bmV3IGEoZC5hLGQuYik7cmV0dXJuIGU9MzI+PWI/bmV3IGEoZS5hPj4+YnxlLmI8PDMyLWImNDI5NDk2NzI5NSxlLmI+Pj5ifGUuYTw8MzItYiY0Mjk0OTY3Mjk1KTpuZXcgYShlLmI+Pj5iLTMyfGUuYTw8NjQtYiY0Mjk0OTY3Mjk1LGUuYT4+PmItMzJ8ZS5iPDw2NC1iJjQyOTQ5NjcyOTUpfWZ1bmN0aW9uIFYoZCxiKXt2YXIgZT1udWxsO3JldHVybiBlPTMyPj1iP25ldyBhKGQuYT4+PmIsZC5iPj4+YnxkLmE8PDMyLWImNDI5NDk2NzI5NSk6bmV3IGEoMCxkLmE+Pj5iLTMyKX1mdW5jdGlvbiBjYShhLGIsZSl7cmV0dXJuIGEmYl5+YSZlfWZ1bmN0aW9uIGRhKGQsXG5iLGUpe3JldHVybiBuZXcgYShkLmEmYi5hXn5kLmEmZS5hLGQuYiZiLmJefmQuYiZlLmIpfWZ1bmN0aW9uIFcoYSxiLGUpe3JldHVybiBhJmJeYSZlXmImZX1mdW5jdGlvbiBlYShkLGIsZSl7cmV0dXJuIG5ldyBhKGQuYSZiLmFeZC5hJmUuYV5iLmEmZS5hLGQuYiZiLmJeZC5iJmUuYl5iLmImZS5iKX1mdW5jdGlvbiBmYShhKXtyZXR1cm4geChhLDIpXngoYSwxMyleeChhLDIyKX1mdW5jdGlvbiBnYShkKXt2YXIgYj10KGQsMjgpLGU9dChkLDM0KTtkPXQoZCwzOSk7cmV0dXJuIG5ldyBhKGIuYV5lLmFeZC5hLGIuYl5lLmJeZC5iKX1mdW5jdGlvbiBoYShhKXtyZXR1cm4geChhLDYpXngoYSwxMSleeChhLDI1KX1mdW5jdGlvbiBpYShkKXt2YXIgYj10KGQsMTQpLGU9dChkLDE4KTtkPXQoZCw0MSk7cmV0dXJuIG5ldyBhKGIuYV5lLmFeZC5hLGIuYl5lLmJeZC5iKX1mdW5jdGlvbiBqYShhKXtyZXR1cm4geChhLDcpXngoYSwxOCleYT4+PjN9ZnVuY3Rpb24ga2EoZCl7dmFyIGI9dChkLFxuMSksZT10KGQsOCk7ZD1WKGQsNyk7cmV0dXJuIG5ldyBhKGIuYV5lLmFeZC5hLGIuYl5lLmJeZC5iKX1mdW5jdGlvbiBsYShhKXtyZXR1cm4geChhLDE3KV54KGEsMTkpXmE+Pj4xMH1mdW5jdGlvbiBtYShkKXt2YXIgYj10KGQsMTkpLGU9dChkLDYxKTtkPVYoZCw2KTtyZXR1cm4gbmV3IGEoYi5hXmUuYV5kLmEsYi5iXmUuYl5kLmIpfWZ1bmN0aW9uIEcoYSxiKXt2YXIgZT0oYSY2NTUzNSkrKGImNjU1MzUpO3JldHVybigoYT4+PjE2KSsoYj4+PjE2KSsoZT4+PjE2KSY2NTUzNSk8PDE2fGUmNjU1MzV9ZnVuY3Rpb24gbmEoYSxiLGUsaCl7dmFyIGM9KGEmNjU1MzUpKyhiJjY1NTM1KSsoZSY2NTUzNSkrKGgmNjU1MzUpO3JldHVybigoYT4+PjE2KSsoYj4+PjE2KSsoZT4+PjE2KSsoaD4+PjE2KSsoYz4+PjE2KSY2NTUzNSk8PDE2fGMmNjU1MzV9ZnVuY3Rpb24gSChhLGIsZSxoLGMpe3ZhciBtPShhJjY1NTM1KSsoYiY2NTUzNSkrKGUmNjU1MzUpKyhoJjY1NTM1KSsoYyY2NTUzNSk7XG5yZXR1cm4oKGE+Pj4xNikrKGI+Pj4xNikrKGU+Pj4xNikrKGg+Pj4xNikrKGM+Pj4xNikrKG0+Pj4xNikmNjU1MzUpPDwxNnxtJjY1NTM1fWZ1bmN0aW9uIG9hKGQsYil7dmFyIGUsaCxjO2U9KGQuYiY2NTUzNSkrKGIuYiY2NTUzNSk7aD0oZC5iPj4+MTYpKyhiLmI+Pj4xNikrKGU+Pj4xNik7Yz0oaCY2NTUzNSk8PDE2fGUmNjU1MzU7ZT0oZC5hJjY1NTM1KSsoYi5hJjY1NTM1KSsoaD4+PjE2KTtoPShkLmE+Pj4xNikrKGIuYT4+PjE2KSsoZT4+PjE2KTtyZXR1cm4gbmV3IGEoKGgmNjU1MzUpPDwxNnxlJjY1NTM1LGMpfWZ1bmN0aW9uIHBhKGQsYixlLGgpe3ZhciBjLG0sZztjPShkLmImNjU1MzUpKyhiLmImNjU1MzUpKyhlLmImNjU1MzUpKyhoLmImNjU1MzUpO209KGQuYj4+PjE2KSsoYi5iPj4+MTYpKyhlLmI+Pj4xNikrKGguYj4+PjE2KSsoYz4+PjE2KTtnPShtJjY1NTM1KTw8MTZ8YyY2NTUzNTtjPShkLmEmNjU1MzUpKyhiLmEmNjU1MzUpKyhlLmEmNjU1MzUpKyhoLmEmNjU1MzUpK1xuKG0+Pj4xNik7bT0oZC5hPj4+MTYpKyhiLmE+Pj4xNikrKGUuYT4+PjE2KSsoaC5hPj4+MTYpKyhjPj4+MTYpO3JldHVybiBuZXcgYSgobSY2NTUzNSk8PDE2fGMmNjU1MzUsZyl9ZnVuY3Rpb24gcWEoZCxiLGUsaCxjKXt2YXIgbSxnLGw7bT0oZC5iJjY1NTM1KSsoYi5iJjY1NTM1KSsoZS5iJjY1NTM1KSsoaC5iJjY1NTM1KSsoYy5iJjY1NTM1KTtnPShkLmI+Pj4xNikrKGIuYj4+PjE2KSsoZS5iPj4+MTYpKyhoLmI+Pj4xNikrKGMuYj4+PjE2KSsobT4+PjE2KTtsPShnJjY1NTM1KTw8MTZ8bSY2NTUzNTttPShkLmEmNjU1MzUpKyhiLmEmNjU1MzUpKyhlLmEmNjU1MzUpKyhoLmEmNjU1MzUpKyhjLmEmNjU1MzUpKyhnPj4+MTYpO2c9KGQuYT4+PjE2KSsoYi5hPj4+MTYpKyhlLmE+Pj4xNikrKGguYT4+PjE2KSsoYy5hPj4+MTYpKyhtPj4+MTYpO3JldHVybiBuZXcgYSgoZyY2NTUzNSk8PDE2fG0mNjU1MzUsbCl9ZnVuY3Rpb24gQihkLGIpe3JldHVybiBuZXcgYShkLmFeYi5hLGQuYl5cbmIuYil9ZnVuY3Rpb24gQShkKXt2YXIgYj1bXSxlO2lmKFwiU0hBLTFcIj09PWQpYj1bMTczMjU4NDE5Myw0MDIzMjMzNDE3LDI1NjIzODMxMDIsMjcxNzMzODc4LDMyODUzNzc1MjBdO2Vsc2UgaWYoMD09PWQubGFzdEluZGV4T2YoXCJTSEEtXCIsMCkpc3dpdGNoKGI9WzMyMzgzNzEwMzIsOTE0MTUwNjYzLDgxMjcwMjk5OSw0MTQ0OTEyNjk3LDQyOTA3NzU4NTcsMTc1MDYwMzAyNSwxNjk0MDc2ODM5LDMyMDQwNzU0MjhdLGU9WzE3NzkwMzM3MDMsMzE0NDEzNDI3NywxMDEzOTA0MjQyLDI3NzM0ODA3NjIsMTM1OTg5MzExOSwyNjAwODIyOTI0LDUyODczNDYzNSwxNTQxNDU5MjI1XSxkKXtjYXNlIFwiU0hBLTIyNFwiOmJyZWFrO2Nhc2UgXCJTSEEtMjU2XCI6Yj1lO2JyZWFrO2Nhc2UgXCJTSEEtMzg0XCI6Yj1bbmV3IGEoMzQxODA3MDM2NSxiWzBdKSxuZXcgYSgxNjU0MjcwMjUwLGJbMV0pLG5ldyBhKDI0Mzg1MjkzNzAsYlsyXSksbmV3IGEoMzU1NDYyMzYwLGJbM10pLG5ldyBhKDE3MzE0MDU0MTUsXG5iWzRdKSxuZXcgYSg0MTA0ODg4NTg5NSxiWzVdKSxuZXcgYSgzNjc1MDA4NTI1LGJbNl0pLG5ldyBhKDEyMDMwNjI4MTMsYls3XSldO2JyZWFrO2Nhc2UgXCJTSEEtNTEyXCI6Yj1bbmV3IGEoZVswXSw0MDg5MjM1NzIwKSxuZXcgYShlWzFdLDIyMjc4NzM1OTUpLG5ldyBhKGVbMl0sNDI3MTE3NTcyMyksbmV3IGEoZVszXSwxNTk1NzUwMTI5KSxuZXcgYShlWzRdLDI5MTc1NjUxMzcpLG5ldyBhKGVbNV0sNzI1NTExMTk5KSxuZXcgYShlWzZdLDQyMTUzODk1NDcpLG5ldyBhKGVbN10sMzI3MDMzMjA5KV07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIlVua25vd24gU0hBIHZhcmlhbnRcIik7fWVsc2UgaWYoMD09PWQubGFzdEluZGV4T2YoXCJTSEEzLVwiLDApfHwwPT09ZC5sYXN0SW5kZXhPZihcIlNIQUtFXCIsMCkpZm9yKGQ9MDs1PmQ7ZCs9MSliW2RdPVtuZXcgYSgwLDApLG5ldyBhKDAsMCksbmV3IGEoMCwwKSxuZXcgYSgwLDApLG5ldyBhKDAsMCldO2Vsc2UgdGhyb3cgRXJyb3IoXCJObyBTSEEgdmFyaWFudHMgc3VwcG9ydGVkXCIpO1xucmV0dXJuIGJ9ZnVuY3Rpb24gSyhhLGIpe3ZhciBlPVtdLGgsYyxtLGcsbCxwLGY7aD1iWzBdO2M9YlsxXTttPWJbMl07Zz1iWzNdO2w9Yls0XTtmb3IoZj0wOzgwPmY7Zis9MSllW2ZdPTE2PmY/YVtmXTp5KGVbZi0zXV5lW2YtOF1eZVtmLTE0XV5lW2YtMTZdLDEpLHA9MjA+Zj9IKHkoaCw1KSxjJm1efmMmZyxsLDE1MTg1MDAyNDksZVtmXSk6NDA+Zj9IKHkoaCw1KSxjXm1eZyxsLDE4NTk3NzUzOTMsZVtmXSk6NjA+Zj9IKHkoaCw1KSxXKGMsbSxnKSxsLDI0MDA5NTk3MDgsZVtmXSk6SCh5KGgsNSksY15tXmcsbCwzMzk1NDY5NzgyLGVbZl0pLGw9ZyxnPW0sbT15KGMsMzApLGM9aCxoPXA7YlswXT1HKGgsYlswXSk7YlsxXT1HKGMsYlsxXSk7YlsyXT1HKG0sYlsyXSk7YlszXT1HKGcsYlszXSk7Yls0XT1HKGwsYls0XSk7cmV0dXJuIGJ9ZnVuY3Rpb24gYmEoYSxiLGUsYyl7dmFyIGs7Zm9yKGs9KGIrNjU+Pj45PDw0KSsxNTthLmxlbmd0aDw9azspYS5wdXNoKDApO2FbYj4+PjVdfD1cbjEyODw8MjQtYiUzMjtiKz1lO2Fba109YiY0Mjk0OTY3Mjk1O2Fbay0xXT1iLzQyOTQ5NjcyOTZ8MDtiPWEubGVuZ3RoO2ZvcihrPTA7azxiO2srPTE2KWM9SyhhLnNsaWNlKGssaysxNiksYyk7cmV0dXJuIGN9ZnVuY3Rpb24gTChkLGIsZSl7dmFyIGgsayxtLGcsbCxwLGYsbixxLHUscix0LHYseCx5LEEseix3LEYsQixDLEQsRT1bXSxKO2lmKFwiU0hBLTIyNFwiPT09ZXx8XCJTSEEtMjU2XCI9PT1lKXU9NjQsdD0xLEQ9TnVtYmVyLHY9Ryx4PW5hLHk9SCxBPWphLHo9bGEsdz1mYSxGPWhhLEM9VyxCPWNhLEo9YztlbHNlIGlmKFwiU0hBLTM4NFwiPT09ZXx8XCJTSEEtNTEyXCI9PT1lKXU9ODAsdD0yLEQ9YSx2PW9hLHg9cGEseT1xYSxBPWthLHo9bWEsdz1nYSxGPWlhLEM9ZWEsQj1kYSxKPVg7ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IgaW4gU0hBLTIgaW1wbGVtZW50YXRpb25cIik7ZT1iWzBdO2g9YlsxXTtrPWJbMl07bT1iWzNdO2c9Yls0XTtsPWJbNV07cD1iWzZdO2Y9Yls3XTtcbmZvcihyPTA7cjx1O3IrPTEpMTY+cj8ocT1yKnQsbj1kLmxlbmd0aDw9cT8wOmRbcV0scT1kLmxlbmd0aDw9cSsxPzA6ZFtxKzFdLEVbcl09bmV3IEQobixxKSk6RVtyXT14KHooRVtyLTJdKSxFW3ItN10sQShFW3ItMTVdKSxFW3ItMTZdKSxuPXkoZixGKGcpLEIoZyxsLHApLEpbcl0sRVtyXSkscT12KHcoZSksQyhlLGgsaykpLGY9cCxwPWwsbD1nLGc9dihtLG4pLG09ayxrPWgsaD1lLGU9dihuLHEpO2JbMF09dihlLGJbMF0pO2JbMV09dihoLGJbMV0pO2JbMl09dihrLGJbMl0pO2JbM109dihtLGJbM10pO2JbNF09dihnLGJbNF0pO2JbNV09dihsLGJbNV0pO2JbNl09dihwLGJbNl0pO2JbN109dihmLGJbN10pO3JldHVybiBifWZ1bmN0aW9uIEQoZCxiKXt2YXIgZSxjLGssbSxnPVtdLGw9W107aWYobnVsbCE9PWQpZm9yKGM9MDtjPGQubGVuZ3RoO2MrPTIpYlsoYz4+PjEpJTVdWyhjPj4+MSkvNXwwXT1CKGJbKGM+Pj4xKSU1XVsoYz4+PjEpLzV8MF0sbmV3IGEoZFtjKzFdLGRbY10pKTtcbmZvcihlPTA7MjQ+ZTtlKz0xKXttPUEoXCJTSEEzLVwiKTtmb3IoYz0wOzU+YztjKz0xKXtrPWJbY11bMF07dmFyIHA9YltjXVsxXSxmPWJbY11bMl0sbj1iW2NdWzNdLHE9YltjXVs0XTtnW2NdPW5ldyBhKGsuYV5wLmFeZi5hXm4uYV5xLmEsay5iXnAuYl5mLmJebi5iXnEuYil9Zm9yKGM9MDs1PmM7Yys9MSlsW2NdPUIoZ1soYys0KSU1XSxVKGdbKGMrMSklNV0sMSkpO2ZvcihjPTA7NT5jO2MrPTEpZm9yKGs9MDs1Pms7ays9MSliW2NdW2tdPUIoYltjXVtrXSxsW2NdKTtmb3IoYz0wOzU+YztjKz0xKWZvcihrPTA7NT5rO2srPTEpbVtrXVsoMipjKzMqayklNV09VShiW2NdW2tdLFlbY11ba10pO2ZvcihjPTA7NT5jO2MrPTEpZm9yKGs9MDs1Pms7ays9MSliW2NdW2tdPUIobVtjXVtrXSxuZXcgYSh+bVsoYysxKSU1XVtrXS5hJm1bKGMrMiklNV1ba10uYSx+bVsoYysxKSU1XVtrXS5iJm1bKGMrMiklNV1ba10uYikpO2JbMF1bMF09QihiWzBdWzBdLFpbZV0pfXJldHVybiBifXZhciBjLFxuWCxZLFo7Yz1bMTExNjM1MjQwOCwxODk5NDQ3NDQxLDMwNDkzMjM0NzEsMzkyMTAwOTU3Myw5NjE5ODcxNjMsMTUwODk3MDk5MywyNDUzNjM1NzQ4LDI4NzA3NjMyMjEsMzYyNDM4MTA4MCwzMTA1OTg0MDEsNjA3MjI1Mjc4LDE0MjY4ODE5ODcsMTkyNTA3ODM4OCwyMTYyMDc4MjA2LDI2MTQ4ODgxMDMsMzI0ODIyMjU4MCwzODM1MzkwNDAxLDQwMjIyMjQ3NzQsMjY0MzQ3MDc4LDYwNDgwNzYyOCw3NzAyNTU5ODMsMTI0OTE1MDEyMiwxNTU1MDgxNjkyLDE5OTYwNjQ5ODYsMjU1NDIyMDg4MiwyODIxODM0MzQ5LDI5NTI5OTY4MDgsMzIxMDMxMzY3MSwzMzM2NTcxODkxLDM1ODQ1Mjg3MTEsMTEzOTI2OTkzLDMzODI0MTg5NSw2NjYzMDcyMDUsNzczNTI5OTEyLDEyOTQ3NTczNzIsMTM5NjE4MjI5MSwxNjk1MTgzNzAwLDE5ODY2NjEwNTEsMjE3NzAyNjM1MCwyNDU2OTU2MDM3LDI3MzA0ODU5MjEsMjgyMDMwMjQxMSwzMjU5NzMwODAwLDMzNDU3NjQ3NzEsMzUxNjA2NTgxNywzNjAwMzUyODA0LFxuNDA5NDU3MTkwOSwyNzU0MjMzNDQsNDMwMjI3NzM0LDUwNjk0ODYxNiw2NTkwNjA1NTYsODgzOTk3ODc3LDk1ODEzOTU3MSwxMzIyODIyMjE4LDE1MzcwMDIwNjMsMTc0Nzg3Mzc3OSwxOTU1NTYyMjIyLDIwMjQxMDQ4MTUsMjIyNzczMDQ1MiwyMzYxODUyNDI0LDI0Mjg0MzY0NzQsMjc1NjczNDE4NywzMjA0MDMxNDc5LDMzMjkzMjUyOThdO1g9W25ldyBhKGNbMF0sMzYwOTc2NzQ1OCksbmV3IGEoY1sxXSw2MDI4OTE3MjUpLG5ldyBhKGNbMl0sMzk2NDQ4NDM5OSksbmV3IGEoY1szXSwyMTczMjk1NTQ4KSxuZXcgYShjWzRdLDQwODE2Mjg0NzIpLG5ldyBhKGNbNV0sMzA1MzgzNDI2NSksbmV3IGEoY1s2XSwyOTM3NjcxNTc5KSxuZXcgYShjWzddLDM2NjQ2MDk1NjApLG5ldyBhKGNbOF0sMjczNDg4MzM5NCksbmV3IGEoY1s5XSwxMTY0OTk2NTQyKSxuZXcgYShjWzEwXSwxMzIzNjEwNzY0KSxuZXcgYShjWzExXSwzNTkwMzA0OTk0KSxuZXcgYShjWzEyXSw0MDY4MTgyMzgzKSxuZXcgYShjWzEzXSxcbjk5MTMzNjExMyksbmV3IGEoY1sxNF0sNjMzODAzMzE3KSxuZXcgYShjWzE1XSwzNDc5Nzc0ODY4KSxuZXcgYShjWzE2XSwyNjY2NjEzNDU4KSxuZXcgYShjWzE3XSw5NDQ3MTExMzkpLG5ldyBhKGNbMThdLDIzNDEyNjI3NzMpLG5ldyBhKGNbMTldLDIwMDc4MDA5MzMpLG5ldyBhKGNbMjBdLDE0OTU5OTA5MDEpLG5ldyBhKGNbMjFdLDE4NTY0MzEyMzUpLG5ldyBhKGNbMjJdLDMxNzUyMTgxMzIpLG5ldyBhKGNbMjNdLDIxOTg5NTA4MzcpLG5ldyBhKGNbMjRdLDM5OTk3MTkzMzkpLG5ldyBhKGNbMjVdLDc2Njc4NDAxNiksbmV3IGEoY1syNl0sMjU2NjU5NDg3OSksbmV3IGEoY1syN10sMzIwMzMzNzk1NiksbmV3IGEoY1syOF0sMTAzNDQ1NzAyNiksbmV3IGEoY1syOV0sMjQ2Njk0ODkwMSksbmV3IGEoY1szMF0sMzc1ODMyNjM4MyksbmV3IGEoY1szMV0sMTY4NzE3OTM2KSxuZXcgYShjWzMyXSwxMTg4MTc5OTY0KSxuZXcgYShjWzMzXSwxNTQ2MDQ1NzM0KSxuZXcgYShjWzM0XSwxNTIyODA1NDg1KSxcbm5ldyBhKGNbMzVdLDI2NDM4MzM4MjMpLG5ldyBhKGNbMzZdLDIzNDM1MjczOTApLG5ldyBhKGNbMzddLDEwMTQ0Nzc0ODApLG5ldyBhKGNbMzhdLDEyMDY3NTkxNDIpLG5ldyBhKGNbMzldLDM0NDA3NzYyNyksbmV3IGEoY1s0MF0sMTI5MDg2MzQ2MCksbmV3IGEoY1s0MV0sMzE1ODQ1NDI3MyksbmV3IGEoY1s0Ml0sMzUwNTk1MjY1NyksbmV3IGEoY1s0M10sMTA2MjE3MDA4KSxuZXcgYShjWzQ0XSwzNjA2MDA4MzQ0KSxuZXcgYShjWzQ1XSwxNDMyNzI1Nzc2KSxuZXcgYShjWzQ2XSwxNDY3MDMxNTk0KSxuZXcgYShjWzQ3XSw4NTExNjk3MjApLG5ldyBhKGNbNDhdLDMxMDA4MjM3NTIpLG5ldyBhKGNbNDldLDEzNjMyNTgxOTUpLG5ldyBhKGNbNTBdLDM3NTA2ODU1OTMpLG5ldyBhKGNbNTFdLDM3ODUwNTAyODApLG5ldyBhKGNbNTJdLDMzMTgzMDc0MjcpLG5ldyBhKGNbNTNdLDM4MTI3MjM0MDMpLG5ldyBhKGNbNTRdLDIwMDMwMzQ5OTUpLG5ldyBhKGNbNTVdLDM2MDIwMzY4OTkpLFxubmV3IGEoY1s1Nl0sMTU3NTk5MDAxMiksbmV3IGEoY1s1N10sMTEyNTU5MjkyOCksbmV3IGEoY1s1OF0sMjcxNjkwNDMwNiksbmV3IGEoY1s1OV0sNDQyNzc2MDQ0KSxuZXcgYShjWzYwXSw1OTM2OTgzNDQpLG5ldyBhKGNbNjFdLDM3MzMxMTAyNDkpLG5ldyBhKGNbNjJdLDI5OTkzNTE1NzMpLG5ldyBhKGNbNjNdLDM4MTU5MjA0MjcpLG5ldyBhKDMzOTE1Njk2MTQsMzkyODM4MzkwMCksbmV3IGEoMzUxNTI2NzI3MSw1NjYyODA3MTEpLG5ldyBhKDM5NDAxODc2MDYsMzQ1NDA2OTUzNCksbmV3IGEoNDExODYzMDI3MSw0MDAwMjM5OTkyKSxuZXcgYSgxMTY0MTg0NzQsMTkxNDEzODU1NCksbmV3IGEoMTc0MjkyNDIxLDI3MzEwNTUyNzApLG5ldyBhKDI4OTM4MDM1NiwzMjAzOTkzMDA2KSxuZXcgYSg0NjAzOTMyNjksMzIwNjIwMzE1KSxuZXcgYSg2ODU0NzE3MzMsNTg3NDk2ODM2KSxuZXcgYSg4NTIxNDI5NzEsMTA4Njc5Mjg1MSksbmV3IGEoMTAxNzAzNjI5OCwzNjU1NDMxMDApLG5ldyBhKDExMjYwMDA1ODAsXG4yNjE4Mjk3Njc2KSxuZXcgYSgxMjg4MDMzNDcwLDM0MDk4NTUxNTgpLG5ldyBhKDE1MDE1MDU5NDgsNDIzNDUwOTg2NiksbmV3IGEoMTYwNzE2NzkxNSw5ODcxNjc0NjgpLG5ldyBhKDE4MTY0MDIzMTYsMTI0NjE4OTU5MSldO1o9W25ldyBhKDAsMSksbmV3IGEoMCwzMjg5OCksbmV3IGEoMjE0NzQ4MzY0OCwzMjkwNiksbmV3IGEoMjE0NzQ4MzY0OCwyMTQ3NTE2NDE2KSxuZXcgYSgwLDMyOTA3KSxuZXcgYSgwLDIxNDc0ODM2NDkpLG5ldyBhKDIxNDc0ODM2NDgsMjE0NzUxNjU0NSksbmV3IGEoMjE0NzQ4MzY0OCwzMjc3NyksbmV3IGEoMCwxMzgpLG5ldyBhKDAsMTM2KSxuZXcgYSgwLDIxNDc1MTY0MjUpLG5ldyBhKDAsMjE0NzQ4MzY1OCksbmV3IGEoMCwyMTQ3NTE2NTU1KSxuZXcgYSgyMTQ3NDgzNjQ4LDEzOSksbmV3IGEoMjE0NzQ4MzY0OCwzMjkwNSksbmV3IGEoMjE0NzQ4MzY0OCwzMjc3MSksbmV3IGEoMjE0NzQ4MzY0OCwzMjc3MCksbmV3IGEoMjE0NzQ4MzY0OCwxMjgpLG5ldyBhKDAsXG4zMjc3OCksbmV3IGEoMjE0NzQ4MzY0OCwyMTQ3NDgzNjU4KSxuZXcgYSgyMTQ3NDgzNjQ4LDIxNDc1MTY1NDUpLG5ldyBhKDIxNDc0ODM2NDgsMzI4OTYpLG5ldyBhKDAsMjE0NzQ4MzY0OSksbmV3IGEoMjE0NzQ4MzY0OCwyMTQ3NTE2NDI0KV07WT1bWzAsMzYsMyw0MSwxOF0sWzEsNDQsMTAsNDUsMl0sWzYyLDYsNDMsMTUsNjFdLFsyOCw1NSwyNSwyMSw1Nl0sWzI3LDIwLDM5LDgsMTRdXTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShmdW5jdGlvbigpe3JldHVybiBDfSk6XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBleHBvcnRzPyhcInVuZGVmaW5lZFwiIT09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1DKSxleHBvcnRzPUMpOmFhLmpzU0hBPUN9KSh0aGlzKTtcbiIsImltcG9ydCBqc1NIQSBmcm9tICdqc3NoYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBVaW50MTZBcnJheSg4KTtcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWYpO1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKG51bSkgeyB2YXIgcmV0ID0gbnVtLnRvU3RyaW5nKDE2KTsgd2hpbGUocmV0Lmxlbmd0aCA8IDQpIHJldCA9ICcwJytyZXQ7IHJldHVybiByZXQ7IH07XG4gICAgcmV0dXJuIFM0KGJ1ZlswXSkrUzQoYnVmWzFdKSsnLScrUzQoYnVmWzJdKSsnLScrUzQoYnVmWzNdKSsnLScrUzQoYnVmWzRdKSsnLScrUzQoYnVmWzVdKStTNChidWZbNl0pK1M0KGJ1Zls3XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBIYXNoZXMgdGhlIGdpdmVuIHRleHQgdG8gYSBVVUlEIHN0cmluZyBvZiBmb3JtICd4eHh4eHh4eC15eXl5LXp6enotd3d3dy1hYWFhYWFhYWFhYWEnLlxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hUb1VVSUQodGV4dCkge1xuICB2YXIgc2hhT2JqID0gbmV3IGpzU0hBKCdTSEEtMjU2JywgJ1RFWFQnKTtcbiAgc2hhT2JqLnVwZGF0ZSh0ZXh0KTtcbiAgdmFyIGhhc2ggPSBuZXcgVWludDhBcnJheShzaGFPYmouZ2V0SGFzaCgnQVJSQVlCVUZGRVInKSk7XG4gIFxuICB2YXIgbiA9ICcnO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaC5ieXRlTGVuZ3RoLzI7ICsraSkge1xuICAgIHZhciBzID0gKGhhc2hbaV0gXiBoYXNoW2krOF0pLnRvU3RyaW5nKDE2KTtcbiAgICBpZiAocy5sZW5ndGggPT0gMSkgcyA9ICcwJyArIHM7XG4gICAgbiArPSBzO1xuICB9XG4gIHJldHVybiBuLnNsaWNlKDAsIDgpICsgJy0nICsgbi5zbGljZSg4LCAxMikgKyAnLScgKyBuLnNsaWNlKDEyLCAxNikgKyAnLScgKyBuLnNsaWNlKDE2LCAyMCkgKyAnLScgKyBuLnNsaWNlKDIwKTtcbn1cbiIsInZhciByZXN1bHRzU2VydmVyVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzMzMy8nO1xuXG52YXIgdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlciA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3VsdHNTZXJ2ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHN0b3JlU3RhcnQocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9zdGFydFwiLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpO1xuICAgIGNvbnNvbGUubG9nKCdSZXN1bHRzU2VydmVyOiBSZWNvcmRlZCB0ZXN0IHN0YXJ0IHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3N0YXJ0XCIpO1xuICB9XG5cbiAgc3RvcmVTeXN0ZW1JbmZvKHJlc3VsdHMpIHtcbiAgICBpZiAoIXVwbG9hZFJlc3VsdHNUb1Jlc3VsdHNTZXJ2ZXIpIHJldHVybjtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oXCJQT1NUXCIsIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3N5c3RlbV9pbmZvXCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFVwbG9hZGVkIHN5c3RlbSBpbmZvIHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV9zeXN0ZW1faW5mb1wiKTtcbiAgfVxuXG4gIHN0b3JlVGVzdFJlc3VsdHMocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9yZXN1bHRzXCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFJlY29yZGVkIHRlc3QgZmluaXNoIHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3Jlc3VsdHNcIik7XG4gIH0gIFxufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZywgc2VwYXJhdG9yKSA9PiB7XG5cdGlmICghKHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBzZXBhcmF0b3IgPT09ICdzdHJpbmcnKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIHRoZSBhcmd1bWVudHMgdG8gYmUgb2YgdHlwZSBgc3RyaW5nYCcpO1xuXHR9XG5cblx0aWYgKHNlcGFyYXRvciA9PT0gJycpIHtcblx0XHRyZXR1cm4gW3N0cmluZ107XG5cdH1cblxuXHRjb25zdCBzZXBhcmF0b3JJbmRleCA9IHN0cmluZy5pbmRleE9mKHNlcGFyYXRvcik7XG5cblx0aWYgKHNlcGFyYXRvckluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBbc3RyaW5nXTtcblx0fVxuXG5cdHJldHVybiBbXG5cdFx0c3RyaW5nLnNsaWNlKDAsIHNlcGFyYXRvckluZGV4KSxcblx0XHRzdHJpbmcuc2xpY2Uoc2VwYXJhdG9ySW5kZXggKyBzZXBhcmF0b3IubGVuZ3RoKVxuXHRdO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHN0cmljdFVyaUVuY29kZSA9IHJlcXVpcmUoJ3N0cmljdC11cmktZW5jb2RlJyk7XG5jb25zdCBkZWNvZGVDb21wb25lbnQgPSByZXF1aXJlKCdkZWNvZGUtdXJpLWNvbXBvbmVudCcpO1xuY29uc3Qgc3BsaXRPbkZpcnN0ID0gcmVxdWlyZSgnc3BsaXQtb24tZmlyc3QnKTtcblxuY29uc3QgaXNOdWxsT3JVbmRlZmluZWQgPSB2YWx1ZSA9PiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0dmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBFbXB0eVN0cmluZyAmJiB2YWx1ZSA9PT0gJycpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnWycsIGluZGV4LCAnXSddLmpvaW4oJycpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0Li4ucmVzdWx0LFxuXHRcdFx0XHRcdFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1snLCBlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLCAnXT0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKVxuXHRcdFx0XHRdO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0dmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBFbXB0eVN0cmluZyAmJiB2YWx1ZSA9PT0gJycpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW10nXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW109JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2NvbW1hJzpcblx0XHRjYXNlICdzZXBhcmF0b3InOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gW1tlbmNvZGUoa2V5LCBvcHRpb25zKSwgJz0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gW1tyZXN1bHQsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4ob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcildO1xuXHRcdFx0fTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHR2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0XHRcdFx0KG9wdGlvbnMuc2tpcE51bGwgJiYgdmFsdWUgPT09IG51bGwpIHx8XG5cdFx0XHRcdFx0KG9wdGlvbnMuc2tpcEVtcHR5U3RyaW5nICYmIHZhbHVlID09PSAnJylcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBlbmNvZGUoa2V5LCBvcHRpb25zKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRsZXQgcmVzdWx0O1xuXG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gL1xcWyhcXGQqKVxcXSQvLmV4ZWMoa2V5KTtcblxuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxkKlxcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB7fTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV1bcmVzdWx0WzFdXSA9IHZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdjb21tYSc6XG5cdFx0Y2FzZSAnc2VwYXJhdG9yJzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0Y29uc3QgaXNBcnJheSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUuc3BsaXQoJycpLmluZGV4T2Yob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcikgPiAtMTtcblx0XHRcdFx0Y29uc3QgbmV3VmFsdWUgPSBpc0FycmF5ID8gdmFsdWUuc3BsaXQob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcikubWFwKGl0ZW0gPT4gZGVjb2RlKGl0ZW0sIG9wdGlvbnMpKSA6IHZhbHVlID09PSBudWxsID8gdmFsdWUgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gbmV3VmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBcnJheUZvcm1hdFNlcGFyYXRvcih2YWx1ZSkge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggIT09IDEpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdhcnJheUZvcm1hdFNlcGFyYXRvciBtdXN0IGJlIHNpbmdsZSBjaGFyYWN0ZXIgc3RyaW5nJyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiByZW1vdmVIYXNoKGlucHV0KSB7XG5cdGNvbnN0IGhhc2hTdGFydCA9IGlucHV0LmluZGV4T2YoJyMnKTtcblx0aWYgKGhhc2hTdGFydCAhPT0gLTEpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGhhc2hTdGFydCk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGdldEhhc2godXJsKSB7XG5cdGxldCBoYXNoID0gJyc7XG5cdGNvbnN0IGhhc2hTdGFydCA9IHVybC5pbmRleE9mKCcjJyk7XG5cdGlmIChoYXNoU3RhcnQgIT09IC0xKSB7XG5cdFx0aGFzaCA9IHVybC5zbGljZShoYXNoU3RhcnQpO1xuXHR9XG5cblx0cmV0dXJuIGhhc2g7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3QoaW5wdXQpIHtcblx0aW5wdXQgPSByZW1vdmVIYXNoKGlucHV0KTtcblx0Y29uc3QgcXVlcnlTdGFydCA9IGlucHV0LmluZGV4T2YoJz8nKTtcblx0aWYgKHF1ZXJ5U3RhcnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnNsaWNlKHF1ZXJ5U3RhcnQgKyAxKTtcbn1cblxuZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5wYXJzZU51bWJlcnMgJiYgIU51bWJlci5pc05hTihOdW1iZXIodmFsdWUpKSAmJiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkgIT09ICcnKSkge1xuXHRcdHZhbHVlID0gTnVtYmVyKHZhbHVlKTtcblx0fSBlbHNlIGlmIChvcHRpb25zLnBhcnNlQm9vbGVhbnMgJiYgdmFsdWUgIT09IG51bGwgJiYgKHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJyB8fCB2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAnZmFsc2UnKSkge1xuXHRcdHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0ZGVjb2RlOiB0cnVlLFxuXHRcdHNvcnQ6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJyxcblx0XHRhcnJheUZvcm1hdFNlcGFyYXRvcjogJywnLFxuXHRcdHBhcnNlTnVtYmVyczogZmFsc2UsXG5cdFx0cGFyc2VCb29sZWFuczogZmFsc2Vcblx0fSwgb3B0aW9ucyk7XG5cblx0dmFsaWRhdGVBcnJheUZvcm1hdFNlcGFyYXRvcihvcHRpb25zLmFycmF5Rm9ybWF0U2VwYXJhdG9yKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHQvLyBDcmVhdGUgYW4gb2JqZWN0IHdpdGggbm8gcHJvdG90eXBlXG5cdGNvbnN0IHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0aWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0aW5wdXQgPSBpbnB1dC50cmltKCkucmVwbGFjZSgvXls/IyZdLywgJycpO1xuXG5cdGlmICghaW5wdXQpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwYXJhbSBvZiBpbnB1dC5zcGxpdCgnJicpKSB7XG5cdFx0bGV0IFtrZXksIHZhbHVlXSA9IHNwbGl0T25GaXJzdChvcHRpb25zLmRlY29kZSA/IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpIDogcGFyYW0sICc9Jyk7XG5cblx0XHQvLyBNaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuXHRcdC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcblx0XHR2YWx1ZSA9IHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogWydjb21tYScsICdzZXBhcmF0b3InXS5pbmNsdWRlcyhvcHRpb25zLmFycmF5Rm9ybWF0KSA/IHZhbHVlIDogZGVjb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMocmV0KSkge1xuXHRcdGNvbnN0IHZhbHVlID0gcmV0W2tleV07XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyh2YWx1ZSkpIHtcblx0XHRcdFx0dmFsdWVba10gPSBwYXJzZVZhbHVlKHZhbHVlW2tdLCBvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0W2tleV0gPSBwYXJzZVZhbHVlKHZhbHVlLCBvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zb3J0ID09PSBmYWxzZSkge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRyZXR1cm4gKG9wdGlvbnMuc29ydCA9PT0gdHJ1ZSA/IE9iamVjdC5rZXlzKHJldCkuc29ydCgpIDogT2JqZWN0LmtleXMocmV0KS5zb3J0KG9wdGlvbnMuc29ydCkpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqZWN0LCBvcHRpb25zKSA9PiB7XG5cdGlmICghb2JqZWN0KSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJyxcblx0XHRhcnJheUZvcm1hdFNlcGFyYXRvcjogJywnXG5cdH0sIG9wdGlvbnMpO1xuXG5cdHZhbGlkYXRlQXJyYXlGb3JtYXRTZXBhcmF0b3Iob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcik7XG5cblx0Y29uc3Qgc2hvdWxkRmlsdGVyID0ga2V5ID0+IChcblx0XHQob3B0aW9ucy5za2lwTnVsbCAmJiBpc051bGxPclVuZGVmaW5lZChvYmplY3Rba2V5XSkpIHx8XG5cdFx0KG9wdGlvbnMuc2tpcEVtcHR5U3RyaW5nICYmIG9iamVjdFtrZXldID09PSAnJylcblx0KTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Y29uc3Qgb2JqZWN0Q29weSA9IHt9O1xuXG5cdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKG9iamVjdCkpIHtcblx0XHRpZiAoIXNob3VsZEZpbHRlcihrZXkpKSB7XG5cdFx0XHRvYmplY3RDb3B5W2tleV0gPSBvYmplY3Rba2V5XTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0Q29weSk7XG5cblx0aWYgKG9wdGlvbnMuc29ydCAhPT0gZmFsc2UpIHtcblx0XHRrZXlzLnNvcnQob3B0aW9ucy5zb3J0KTtcblx0fVxuXG5cdHJldHVybiBrZXlzLm1hcChrZXkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gb2JqZWN0W2tleV07XG5cblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHRcdC5yZWR1Y2UoZm9ybWF0dGVyKGtleSksIFtdKVxuXHRcdFx0XHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpO1xufTtcblxuZXhwb3J0cy5wYXJzZVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHVybDogcmVtb3ZlSGFzaChpbnB1dCkuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuXG5leHBvcnRzLnN0cmluZ2lmeVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRjb25zdCB1cmwgPSByZW1vdmVIYXNoKGlucHV0LnVybCkuc3BsaXQoJz8nKVswXSB8fCAnJztcblx0Y29uc3QgcXVlcnlGcm9tVXJsID0gZXhwb3J0cy5leHRyYWN0KGlucHV0LnVybCk7XG5cdGNvbnN0IHBhcnNlZFF1ZXJ5RnJvbVVybCA9IGV4cG9ydHMucGFyc2UocXVlcnlGcm9tVXJsKTtcblx0Y29uc3QgaGFzaCA9IGdldEhhc2goaW5wdXQudXJsKTtcblx0Y29uc3QgcXVlcnkgPSBPYmplY3QuYXNzaWduKHBhcnNlZFF1ZXJ5RnJvbVVybCwgaW5wdXQucXVlcnkpO1xuXHRsZXQgcXVlcnlTdHJpbmcgPSBleHBvcnRzLnN0cmluZ2lmeShxdWVyeSwgb3B0aW9ucyk7XG5cdGlmIChxdWVyeVN0cmluZykge1xuXHRcdHF1ZXJ5U3RyaW5nID0gYD8ke3F1ZXJ5U3RyaW5nfWA7XG5cdH1cblxuXHRyZXR1cm4gYCR7dXJsfSR7cXVlcnlTdHJpbmd9JHtoYXNofWA7XG59O1xuIiwiZnVuY3Rpb24gYWRkR0VUKHVybCwgcGFyYW1ldGVyKSB7XG4gIC8vaWYgKHVybC5pbmRleE9mKCc/JykgIT0gLTEpXG4gIHJldHVybiB1cmwgKyAnJicgKyBwYXJhbWV0ZXI7XG4gIC8vZWxzZSByZXR1cm4gdXJsICsgJz8nICsgcGFyYW1ldGVyO1xufVxuXG5mdW5jdGlvbiB5eXl5bW1kZGhobW1zcygpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICB2YXIgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1tID0gZGF0ZS5nZXRNb250aCgpIDwgOSA/IFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogKGRhdGUuZ2V0TW9udGgoKSArIDEpOyAvLyBnZXRNb250aCgpIGlzIHplcm8tYmFzZWRcbiAgdmFyIGRkICA9IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyBcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCk7XG4gIHZhciBoaCA9IGRhdGUuZ2V0SG91cnMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldEhvdXJzKCkgOiBkYXRlLmdldEhvdXJzKCk7XG4gIHZhciBtaW4gPSBkYXRlLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldE1pbnV0ZXMoKSA6IGRhdGUuZ2V0TWludXRlcygpO1xuICB2YXIgc2VjID0gZGF0ZS5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRTZWNvbmRzKCkgOiBkYXRlLmdldFNlY29uZHMoKTtcbiAgcmV0dXJuIHl5eXkgKyAnLScgKyBtbSArICctJyArIGRkICsgJyAnICsgaGggKyAnOicgKyBtaW4gKyAnOicgKyBzZWM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRHRVQ6IGFkZEdFVCxcbiAgeXl5eW1tZGRoaG1tc3M6IHl5eXltbWRkaGhtbXNzXG59OyIsImltcG9ydCBqc1NIQSBmcm9tICdqc3NoYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBVaW50MTZBcnJheSg4KTtcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWYpO1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKG51bSkgeyB2YXIgcmV0ID0gbnVtLnRvU3RyaW5nKDE2KTsgd2hpbGUocmV0Lmxlbmd0aCA8IDQpIHJldCA9ICcwJytyZXQ7IHJldHVybiByZXQ7IH07XG4gICAgcmV0dXJuIFM0KGJ1ZlswXSkrUzQoYnVmWzFdKSsnLScrUzQoYnVmWzJdKSsnLScrUzQoYnVmWzNdKSsnLScrUzQoYnVmWzRdKSsnLScrUzQoYnVmWzVdKStTNChidWZbNl0pK1M0KGJ1Zls3XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBIYXNoZXMgdGhlIGdpdmVuIHRleHQgdG8gYSBVVUlEIHN0cmluZyBvZiBmb3JtICd4eHh4eHh4eC15eXl5LXp6enotd3d3dy1hYWFhYWFhYWFhYWEnLlxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hUb1VVSUQodGV4dCkge1xuICB2YXIgc2hhT2JqID0gbmV3IGpzU0hBKCdTSEEtMjU2JywgJ1RFWFQnKTtcbiAgc2hhT2JqLnVwZGF0ZSh0ZXh0KTtcbiAgdmFyIGhhc2ggPSBuZXcgVWludDhBcnJheShzaGFPYmouZ2V0SGFzaCgnQVJSQVlCVUZGRVInKSk7XG4gIFxuICB2YXIgbiA9ICcnO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaC5ieXRlTGVuZ3RoLzI7ICsraSkge1xuICAgIHZhciBzID0gKGhhc2hbaV0gXiBoYXNoW2krOF0pLnRvU3RyaW5nKDE2KTtcbiAgICBpZiAocy5sZW5ndGggPT0gMSkgcyA9ICcwJyArIHM7XG4gICAgbiArPSBzO1xuICB9XG4gIHJldHVybiBuLnNsaWNlKDAsIDgpICsgJy0nICsgbi5zbGljZSg4LCAxMikgKyAnLScgKyBuLnNsaWNlKDEyLCAxNikgKyAnLScgKyBuLnNsaWNlKDE2LCAyMCkgKyAnLScgKyBuLnNsaWNlKDIwKTtcbn1cbiIsImNvbnN0IGFkZEdFVCA9IHJlcXVpcmUoJy4uLy4uL2Zyb250YXBwL3V0aWxzJykuYWRkR0VUO1xuXG5mdW5jdGlvbiBjYW1lbENhc2VUb0Rhc2ggKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16QS1aXSkoPz1bQS1aXSkvZywgJyQxLScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gYnVpbGRUZXN0VVJMKGJhc2VVUkwsIHRlc3QsIG1vZGUsIG9wdGlvbnMsIHByb2dyZXNzKSB7XG4gIC8vdmFyIHVybCA9IGJhc2VVUkwgKyAobW9kZSA9PT0gJ2ludGVyYWN0aXZlJyA/ICdzdGF0aWMvJzogJ3Rlc3RzLycpICsgdGVzdC51cmw7XG4gIHZhciB1cmwgPSAnJztcblxuICBmdW5jdGlvbiBnZXRPcHRpb24obmFtZSkge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9uc1tuYW1lXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbbmFtZV07XG4gICAgICBkZWxldGUgb3B0aW9uc1tuYW1lXTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRlc3RbbmFtZV07XG4gIH1cbiAgLy8gaWYgdmVyYm9zZSBjb25zb2xlLmxvZyhvcHRpb25zKTtcblxuICBpZiAobW9kZSAhPT0gJ2ludGVyYWN0aXZlJykge1xuICAgIGlmIChnZXRPcHRpb24oJ2F1dG9lbnRlclhSJykpIHVybCA9IGFkZEdFVCh1cmwsICdhdXRvZW50ZXIteHI9dHJ1ZScpO1xuICAgIGlmIChnZXRPcHRpb24oJ251bUZyYW1lcycpKSB1cmwgPSBhZGRHRVQodXJsLCAnbnVtLWZyYW1lcz0nICsgZ2V0T3B0aW9uKCdudW1GcmFtZXMnKSk7XG4gICAgaWYgKGdldE9wdGlvbignY2FudmFzV2lkdGgnKSkgdXJsID0gYWRkR0VUKHVybCwgJ3dpZHRoPScgKyBnZXRPcHRpb24oJ2NhbnZhc1dpZHRoJykpO1xuICAgIGlmIChnZXRPcHRpb24oJ2NhbnZhc0hlaWdodCcpKSB1cmwgPSBhZGRHRVQodXJsLCAnaGVpZ2h0PScgKyBnZXRPcHRpb24oJ2NhbnZhc0hlaWdodCcpKTtcblxuICAgIGlmIChnZXRPcHRpb24oJ2Zha2VXZWJHTCcpKSB1cmwgPSBhZGRHRVQodXJsLCAnZmFrZS13ZWJnbCcpO1xuXG4gICAgaWYgKGdldE9wdGlvbignZmFrZVdlYkF1ZGlvJykpIHVybCA9IGFkZEdFVCh1cmwsICdmYWtlLXdlYmF1ZGlvJyk7XG5cbiAgICBpZiAobW9kZSA9PT0gJ3JlY29yZCcpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdyZWNvcmRpbmcnKTtcbiAgICB9IGVsc2UgaWYgKHRlc3QuaW5wdXQgJiYgbW9kZSA9PT0gJ3JlcGxheScpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdyZXBsYXknKTtcbiAgICAgIGlmIChnZXRPcHRpb24oJ3Nob3dLZXlzJykpIHVybCA9IGFkZEdFVCh1cmwsICdzaG93LWtleXMnKTtcbiAgICAgIGlmIChnZXRPcHRpb24oJ3Nob3dNb3VzZScpKSB1cmwgPSBhZGRHRVQodXJsLCAnc2hvdy1tb3VzZScpO1xuICAgIH1cblxuICAgIGlmIChnZXRPcHRpb24oJ25vQ2xvc2VPbkZhaWwnKSkgdXJsID0gYWRkR0VUKHVybCwgJ25vLWNsb3NlLW9uLWZhaWwnKTtcbiAgICBpZiAodGVzdC5za2lwUmVmZXJlbmNlSW1hZ2VUZXN0KSB1cmwgPSBhZGRHRVQodXJsLCAnc2tpcC1yZWZlcmVuY2UtaW1hZ2UtdGVzdCcpO1xuICAgIGlmICh0ZXN0LnJlZmVyZW5jZUltYWdlKSB1cmwgPSBhZGRHRVQodXJsLCAncmVmZXJlbmNlLWltYWdlJyk7XG4gICAgaWYgKHRlc3Qubm9SZW5kZXJpbmcpIHVybCA9IGFkZEdFVCh1cmwsICduby1yZW5kZXJpbmcnKTtcblxuICAgIGlmIChwcm9ncmVzcykge1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ29yZGVyLXRlc3Q9JyArIHByb2dyZXNzLnRlc3RzW3Rlc3QuaWRdLmN1cnJlbnQgKyAnJnRvdGFsLXRlc3Q9JyArIHByb2dyZXNzLnRlc3RzW3Rlc3QuaWRdLnRvdGFsKTtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdvcmRlci1nbG9iYWw9JyArIHByb2dyZXNzLmN1cnJlbnRHbG9iYWwgKyAnJnRvdGFsLWdsb2JhbD0nICsgcHJvZ3Jlc3MudG90YWxHbG9iYWwpO1xuICAgIH1cblxuICAgIGlmIChnZXRPcHRpb24oJ2luZm9PdmVybGF5JykpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdpbmZvLW92ZXJsYXk9JyArIGVuY29kZVVSSShnZXRPcHRpb24oJ2luZm9PdmVybGF5JykpKTtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICB2YXIga2V5Q29udmVydGVkID0gY2FtZWxDYXNlVG9EYXNoKGtleSk7XG4gICAgICB1cmwgPSBhZGRHRVQodXJsLCBrZXlDb252ZXJ0ZWQgKyAodHlwZW9mIG9wdGlvbnNba2V5XSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICc9JyArIG9wdGlvbnNba2V5XSkpO1xuICAgIH0pO1xuICAgIC8vQHRvZG8gTG9nIGlmIHZlcmJvc2VcbiAgICAvLyBjb25zb2xlLmxvZygnR2VuZXJhdGVkIFVSTDogJywgdXJsKTtcbiAgfVxuXG4gIHVybCA9IGJhc2VVUkwgKyAobW9kZSA9PT0gJ2ludGVyYWN0aXZlJyA/ICdzdGF0aWMvJzogJ3Rlc3RzLycpICsgdGVzdC51cmwgKyAodGVzdC51cmwuaW5kZXhPZignPycpICE9PSAtMSA/ICcnIDogJz8nKSArIHVybDtcbiAgcmV0dXJuIHVybDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJ1aWxkVGVzdFVSTDogYnVpbGRUZXN0VVJMXG59O1xuIiwiaW1wb3J0IHt5eXl5bW1kZGhobW1zc30gZnJvbSAnLi4vLi4vZnJvbnRhcHAvdXRpbHMnO1xuaW1wb3J0IHtnZW5lcmF0ZVVVSUQsIGhhc2hUb1VVSUR9IGZyb20gJy4uLy4uL2Zyb250YXBwL1VVSUQnO1xuaW1wb3J0IHtidWlsZFRlc3RVUkx9IGZyb20gJy4vY29tbW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIFRlc3RzTWFuYWdlckJyb3dzZXIodGVzdHMsIG9wdGlvbnMpIHtcbiAgdGhpcy50ZXN0cyA9IHRlc3RzO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0ID0ge307XG4gIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICB0aGlzLnByb2dyZXNzID0gbnVsbDtcbn1cblxuVGVzdHNNYW5hZ2VyQnJvd3Nlci5wcm90b3R5cGUgPSB7XG4gIHJ1bjogZnVuY3Rpb24odGVzdHMsIGdlbmVyYWxPcHRpb25zLCB0ZXN0c09wdGlvbnMpIHtcbiAgICB0aGlzLnRlc3RzID0gdGVzdHM7XG4gICAgXG4gICAgdGhpcy5vcHRpb25zID0gdGVzdHNPcHRpb25zOyAvLyA/XG4gICAgdGhpcy5zZWxlY3RlZFRlc3RzID0gdGhpcy50ZXN0cztcbiAgICBjb25zdCBudW1UaW1lc1RvUnVuRWFjaFRlc3QgPSBNYXRoLm1pbihNYXRoLm1heChwYXJzZUludChnZW5lcmFsT3B0aW9ucy5udW1UaW1lc1RvUnVuRWFjaFRlc3QpLCAxKSwgMTAwMCk7IC8vIENsYW1wXG4gICAgdGhpcy5wcm9ncmVzcyA9IHtcbiAgICAgIHRvdGFsR2xvYmFsOiBudW1UaW1lc1RvUnVuRWFjaFRlc3QgKiB0aGlzLnNlbGVjdGVkVGVzdHMubGVuZ3RoLFxuICAgICAgY3VycmVudEdsb2JhbDogMSxcbiAgICAgIHRlc3RzOiB7fVxuICAgIH07XG4gICAgICBcbiAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSBbXTtcbiAgXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWRUZXN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yKHZhciBqID0gMDsgaiA8IG51bVRpbWVzVG9SdW5FYWNoVGVzdDsgaisrKSB7XG4gICAgICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5wdXNoKHRoaXMuc2VsZWN0ZWRUZXN0c1tpXSk7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3MudGVzdHNbdGhpcy5zZWxlY3RlZFRlc3RzW2ldLmlkXSA9IHtcbiAgICAgICAgICBjdXJyZW50OiAxLFxuICAgICAgICAgIHRvdGFsOiBudW1UaW1lc1RvUnVuRWFjaFRlc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucnVubmluZ1Rlc3RzSW5Qcm9ncmVzcyA9IHRydWU7XG4gIFxuICAgIGNvbnNvbGUubG9nKCdCcm93c2VyIHRlc3RzJywgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuKTtcbiAgICB0aGlzLnJ1bk5leHRRdWV1ZWRUZXN0KCk7XG4gIH0sXG4gIHJ1bk5leHRRdWV1ZWRUZXN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy50ZXN0c1F1ZXVlZFRvUnVuLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aGlzLnByb2dyZXNzID0gbnVsbDtcbiAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHQgPSB0aGlzLnRlc3RzUXVldWVkVG9SdW5bIDAgXTtcbiAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4uc3BsaWNlKDAsIDEpO1xuICAgIHRoaXMucnVuVGVzdCh0LmlkLCAncmVwbGF5JywgdGhpcy5vcHRpb25zKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICBydW5UZXN0OiBmdW5jdGlvbihpZCwgbW9kZSwgb3B0aW9ucykge1xuICAgIHZhciB0ZXN0ID0gdGhpcy50ZXN0cy5maW5kKHQgPT4gdC5pZCA9PT0gaWQpO1xuICAgIGlmICghdGVzdCkge1xuICAgICAgY29uc29sZS5lcnJvcignVGVzdCBub3QgZm91bmQsIGlkOicsIGlkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1J1bm5pbmcgdGVzdDonLCB0ZXN0Lm5hbWUpO1xuXG4gICAgY29uc3QgYmFzZVVSTCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLyc7XG4gICAgY29uc3QgdXJsID0gYnVpbGRUZXN0VVJMKGJhc2VVUkwsIHRlc3QsIG1vZGUsIG9wdGlvbnMsIHRoaXMucHJvZ3Jlc3MpO1xuXG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC50ZXN0ID0gdGVzdDtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnN0YXJ0VGltZSA9IHl5eXltbWRkaGhtbXNzKCk7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlEID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5vcHRpb25zID0gb3B0aW9ucztcbiAgICBcbiAgICBpZiAodGhpcy5wcm9ncmVzcykge1xuICAgICAgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0uY3VycmVudCsrO1xuICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50R2xvYmFsKys7XG4gICAgfVxuXG4gICAgd2luZG93Lm9wZW4odXJsKTtcbiAgIH1cbn0iLCJpbXBvcnQgYnJvd3NlckZlYXR1cmVzIGZyb20gJ2Jyb3dzZXItZmVhdHVyZXMnO1xuaW1wb3J0IHdlYmdsSW5mbyBmcm9tICd3ZWJnbC1pbmZvJztcbmltcG9ydCB7Z2VuZXJhdGVVVUlELCBoYXNoVG9VVUlEfSBmcm9tICcuL3V1aWQnO1xuaW1wb3J0IFJlc3VsdHNTZXJ2ZXIgZnJvbSAnLi9yZXN1bHRzLXNlcnZlcic7XG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCB7VGVzdHNNYW5hZ2VyQnJvd3Nlcn0gZnJvbSAnLi4vbWFpbi90ZXN0c21hbmFnZXIvYnJvd3Nlcic7XG5pbXBvcnQge3l5eXltbWRkaGhtbXNzfSBmcm9tICcuL3V0aWxzJztcblxuXG5jb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxuY29uc3QgVkVSU0lPTiA9ICcxLjAnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXN0QXBwIHtcbiAgcGFyc2VQYXJhbWV0ZXJzKCkge1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuICAgIGlmIChwYXJhbWV0ZXJzWydudW0tdGltZXMnXSkge1xuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy5nZW5lcmFsLm51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IHBhcnNlSW50KHBhcmFtZXRlcnNbJ251bS10aW1lcyddKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHMuZmFrZVdlYkdMID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAocGFyYW1ldGVyc1snc2VsZWN0ZWQnXSkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJhbWV0ZXJzWydzZWxlY3RlZCddLnNwbGl0KCcsJyk7XG4gICAgICB0aGlzLnZ1ZUFwcC50ZXN0cy5mb3JFYWNoKHRlc3QgPT4gdGVzdC5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICAgIHNlbGVjdGVkLmZvckVhY2goaWQgPT4ge1xuICAgICAgICB2YXIgdGVzdCA9IHRoaXMudnVlQXBwLnRlc3RzLmZpbmQodGVzdCA9PiB0ZXN0LmlkID09PSBpZCk7XG4gICAgICAgIGlmICh0ZXN0KSB0ZXN0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgfVxuXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2dWVBcHApIHtcbiAgICBjb25zb2xlLmxvZyhgVGVzdCBBcHAgdi4ke1ZFUlNJT059YCk7XG5cbiAgICB0aGlzLnZ1ZUFwcCA9IHZ1ZUFwcDtcbiAgICB0aGlzLnRlc3RzID0gW107XG4gICAgdGhpcy5pc0N1cnJlbnRseVJ1bm5pbmdUZXN0ID0gZmFsc2U7XG4gICAgdGhpcy5icm93c2VyVVVJRCA9IG51bGw7XG4gICAgdGhpcy5yZXN1bHRzU2VydmVyID0gbmV3IFJlc3VsdHNTZXJ2ZXIoKTtcbiAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSBbXTtcblxuICAgIGZldGNoKCd0ZXN0cy5qc29uJylcbiAgICAgIC50aGVuKHJlc3BvbnNlID0+IHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSlcbiAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICBqc29uID0ganNvbi5maWx0ZXIodGVzdCA9PiB0ZXN0LmF2YWlsYWJsZSAhPT0gZmFsc2UpO1xuICAgICAgICAvKlxuICAgICAgICBqc29uLmZvckVhY2godGVzdCA9PiB7XG4gICAgICAgICAgdGVzdC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICB0aGlzLnRlc3RzID0gdnVlQXBwLnRlc3RzID0gdnVlQXBwLmNoZWNrZWRUZXN0cyA9IGpzb247XG4gICAgICAgIHRoaXMudGVzdHNNYW5hZ2VyID0gbmV3IFRlc3RzTWFuYWdlckJyb3dzZXIodGhpcy50ZXN0cyk7XG5cbiAgICAgICAgdGhpcy5wYXJzZVBhcmFtZXRlcnMoKTtcbiAgICAgICAgdGhpcy5hdXRvUnVuKCk7XG4gICAgICB9KVxuXG4gICAgdGhpcy5pbml0V1NTZXJ2ZXIoKTtcblxuICAgIHRoaXMud2ViZ2xJbmZvID0gdnVlQXBwLndlYmdsSW5mbyA9IHdlYmdsSW5mbygpO1xuICAgIGJyb3dzZXJGZWF0dXJlcyhmZWF0dXJlcyA9PiB7XG4gICAgICB0aGlzLmJyb3dzZXJJbmZvID0gdnVlQXBwLmJyb3dzZXJJbmZvID0gZmVhdHVyZXM7XG4gICAgICB0aGlzLm9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZCh7fSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0V1NTZXJ2ZXIoKSB7XG4gICAgLy92YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODg4OCc7XG4gICAgdmFyIHNlcnZlclVybCA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lICsgJzo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbigndGVzdF9maW5pc2hlZCcsIChyZXN1bHQpID0+IHtcbiAgICAgIHJlc3VsdC5qc29uID0gSlNPTi5zdHJpbmdpZnkocmVzdWx0LCBudWxsLCA0KTtcbiAgICAgIHZhciBvcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzKSk7XG5cbiAgICAgIC8vIFRvIHJlbW92ZSBvcHRpb25zIFxuICAgICAgZGVsZXRlIG9wdGlvbnMuZmFrZVdlYkdMO1xuICAgICAgZGVsZXRlIG9wdGlvbnMuZmFrZVdlYkF1ZGlvO1xuICAgICAgZGVsZXRlIG9wdGlvbnMuc2hvd0tleXM7XG4gICAgICBkZWxldGUgb3B0aW9ucy5zaG93TW91c2U7XG4gICAgICBkZWxldGUgb3B0aW9ucy5ub0Nsb3NlT25GYWlsO1xuXG4gICAgICByZXN1bHQub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgIHZhciB0ZXN0UmVzdWx0cyA9IHtcbiAgICAgICAgcmVzdWx0OiByZXN1bHRcbiAgICAgIH07XG4gICAgICB0ZXN0UmVzdWx0cy5icm93c2VyVVVJRCA9IHRoaXMuYnJvd3NlclVVSUQ7XG4gICAgICB0ZXN0UmVzdWx0cy5zdGFydFRpbWUgPSB0aGlzLnRlc3RzTWFuYWdlci5jdXJyZW50bHlSdW5uaW5nVGVzdC5zdGFydFRpbWU7XG4gICAgICB0ZXN0UmVzdWx0cy5mYWtlV2ViR0wgPSB0aGlzLnRlc3RzTWFuYWdlci5jdXJyZW50bHlSdW5uaW5nVGVzdC5vcHRpb25zLmZha2VXZWJHTDtcbiAgICAgIHRlc3RSZXN1bHRzLmZha2VXZWJBdWRpbyA9IHRoaXMudGVzdHNNYW5hZ2VyLmN1cnJlbnRseVJ1bm5pbmdUZXN0Lm9wdGlvbnMuZmFrZVdlYkF1ZGlvO1xuICAgICAgLy90ZXN0UmVzdWx0cy5pZCA9IHRoaXMudGVzdHNNYW5hZ2VyLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmlkO1xuICAgICAgdGVzdFJlc3VsdHMuZmluaXNoVGltZSA9IHl5eXltbWRkaGhtbXNzKCk7XG4gICAgICB0ZXN0UmVzdWx0cy5uYW1lID0gdGhpcy50ZXN0c01hbmFnZXIuY3VycmVudGx5UnVubmluZ1Rlc3QubmFtZTtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1blVVSUQgPSB0aGlzLnRlc3RzTWFuYWdlci5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlEO1xuICAgICAgLy9pZiAoYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mbyAmJiBicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHRlc3RSZXN1bHRzLmhhcmR3YXJlVVVJRCA9IGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8uVVVJRDtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1bk9yZGluYWwgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0UmVzdWx0cy5pZF0gPyAodGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdFJlc3VsdHMuaWRdLmxlbmd0aCArIDEpIDogMTtcbiAgICAgIHRoaXMucmVzdWx0c1NlcnZlci5zdG9yZVRlc3RSZXN1bHRzKHRlc3RSZXN1bHRzKTtcblxuICAgICAgLy8gQWNjdW11bGF0ZSByZXN1bHRzIGluIGRpY3Rpb25hcnkuXG4gICAgICAvL2lmICh0ZXN0UmVzdWx0cy5yZXN1bHQgIT0gJ0ZBSUwnKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0pIHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Jlc3VsdC50ZXN0X2lkXSA9IFtdO1xuICAgICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0ucHVzaCh0ZXN0UmVzdWx0cyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF2ZXJhZ2VcbiAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNBdmVyYWdlID0gW107XG4gIFxuICAgICAgT2JqZWN0LmtleXModGhpcy52dWVBcHAucmVzdWx0c0J5SWQpLmZvckVhY2godGVzdElEID0+IHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0SURdO1xuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFyIHRlc3RSZXN1bHRzQXZlcmFnZSA9IHt9O1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50ZXN0X2lkID0gdGVzdElEO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5udW1TYW1wbGVzID0gcmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICAgIGZ1bmN0aW9uIGdldDcwUGVyY2VudEF2ZXJhZ2UoZ2V0RmllbGQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldDcwUGVyY2VudEFycmF5KCkge1xuICAgICAgICAgICAgICBmdW5jdGlvbiBjbXAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRGaWVsZChhKSAtIGdldEZpZWxkKGIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA8PSAzKSByZXR1cm4gcmVzdWx0cy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgdmFyIGZyYWMgPSBNYXRoLnJvdW5kKDAuNyAqIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgdmFyIHJlc3VsdHNDID0gcmVzdWx0cy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgcmVzdWx0c0Muc29ydChjbXApO1xuICAgICAgICAgICAgICB2YXIgbnVtRWxlbWVudHNUb1JlbW92ZSA9IHJlc3VsdHMubGVuZ3RoIC0gZnJhYztcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udCA9IE1hdGguZmxvb3IobnVtRWxlbWVudHNUb1JlbW92ZS8yKTtcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmVCYWNrID0gbnVtRWxlbWVudHNUb1JlbW92ZSAtIG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udDtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNDLnNsaWNlKG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udCwgcmVzdWx0c0MubGVuZ3RoIC0gbnVtRWxlbWVudHNUb1JlbW92ZUJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFyciA9IGdldDcwUGVyY2VudEFycmF5KCk7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkgdG90YWwgKz0gZ2V0RmllbGQoYXJyW2ldKTtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCAvIGFyci5sZW5ndGg7XG4gICAgICAgICAgfSAgXG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnRvdGFsVGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQudG90YWxUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1SWRsZVBlcmMgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdUlkbGVQZXJjOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1SWRsZVRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdUlkbGVUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1VGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuY3B1VGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnBhZ2VMb2FkVGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQucGFnZUxvYWRUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuYXZnRnBzID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5hdmdGcHM7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50aW1lVG9GaXJzdEZyYW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC50aW1lVG9GaXJzdEZyYW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UubnVtU3R1dHRlckV2ZW50cyA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQubnVtU3R1dHRlckV2ZW50czsgfSk7XG4gICAgICAgICAgLyp0b3RhbFJlbmRlclRpbWUgICAgIHRvdGFsVGltZSovXG4gICAgICAgICAgdGhpcy52dWVBcHAucmVzdWx0c0F2ZXJhZ2UucHVzaCh0ZXN0UmVzdWx0c0F2ZXJhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy52dWVBcHAucmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICB0aGlzLnRlc3RzTWFuYWdlci5ydW5OZXh0UXVldWVkVGVzdCgpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7ICBcbiAgfVxuXG4gIG9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnQnJvd3NlciBVVUlEOicsIHRoaXMuZ2V0QnJvd3NlclVVSUQoKSk7XG4gICAgdmFyIHN5c3RlbUluZm8gPSB7XG4gICAgICBicm93c2VyVVVJRDogdGhpcy5icm93c2VyVVVJRCxcbiAgICAgIHdlYmdsSW5mbzogdGhpcy53ZWJnbEluZm8sXG4gICAgICBicm93c2VySW5mbzogdGhpcy5icm93c2VySW5mb1xuICAgIH07XG5cbiAgICB0aGlzLnJlc3VsdHNTZXJ2ZXIuc3RvcmVTeXN0ZW1JbmZvKHN5c3RlbUluZm8pO1xuICB9XG5cbiAgcnVuU2VsZWN0ZWRUZXN0cygpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnZ1ZUFwcC5maWx0ZXJlZFRlc3RzKTtcbiAgICB0aGlzLnRlc3RzTWFuYWdlci5ydW4oXG4gICAgICB0aGlzLnZ1ZUFwcC5zZWxlY3RlZFRlc3RzLFxuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy5nZW5lcmFsLFxuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy50ZXN0c1xuICAgICk7XG4gIH1cblxuICBnZXRCcm93c2VyVVVJRCgpIHtcbiAgICB2YXIgaGFyZHdhcmVVVUlEID0gJyc7XG4gICAgaWYgKHRoaXMubmF0aXZlU3lzdGVtSW5mbyAmJiB0aGlzLm5hdGl2ZVN5c3RlbUluZm8uVVVJRCkge1xuICAgICAgaGFyZHdhcmVVVUlEID0gdGhpcy5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhcmR3YXJlVVVJRCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdVVUlEJyk7XG4gICAgICBpZiAoIWhhcmR3YXJlVVVJRCkge1xuICAgICAgICBoYXJkd2FyZVVVSUQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1VVSUQnLCBoYXJkd2FyZVVVSUQpO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgLy8gV2Ugbm93IGhhdmUgYWxsIHRoZSBpbmZvIHRvIGNvbXB1dGUgdGhlIGJyb3dzZXIgVVVJRFxuICAgIHZhciBicm93c2VyVVVJRFN0cmluZyA9IGhhcmR3YXJlVVVJRCArICh0aGlzLmJyb3dzZXJJbmZvLnVzZXJBZ2VudC5icm93c2VyVmVyc2lvbiB8fCAnJykgKyAodGhpcy5icm93c2VySW5mby5uYXZpZ2F0b3IuYnVpbGRJRCB8fCAnJyk7XG4gICAgdGhpcy5icm93c2VyVVVJRCA9IGhhc2hUb1VVSUQoYnJvd3NlclVVSURTdHJpbmcpO1xuXG4gICAgcmV0dXJuIHRoaXMuYnJvd3NlclVVSUQ7XG4gIH1cblxuICBhdXRvUnVuKCkge1xuICAgIGlmICghdGhpcy5pc0N1cnJlbnRseVJ1bm5pbmdUZXN0ICYmIGxvY2F0aW9uLnNlYXJjaC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2F1dG9ydW4nKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucnVuU2VsZWN0ZWRUZXN0cygpO1xuICAgIH1cbiAgfSBcbn1cbiIsImltcG9ydCBUZXN0QXBwIGZyb20gJy4vYXBwJztcblxudmFyIGRhdGEgPSB7XG4gIHRlc3RzOiBbXSxcbiAgZmlsdGVyOiAnJyxcbiAgc2hvd19qc29uOiBmYWxzZSxcbiAgYnJvd3NlckluZm86IG51bGwsXG4gIHdlYmdsSW5mbzogbnVsbCxcbiAgbmF0aXZlU3lzdGVtSW5mbzoge30sXG4gIG9wdGlvbnM6IHtcbiAgICBnZW5lcmFsOiB7XG4gICAgICBudW1UaW1lc1RvUnVuRWFjaFRlc3Q6IDEsXG4gICAgfSxcbiAgICB0ZXN0czoge1xuICAgICAgZmFrZVdlYkdMOiBmYWxzZSxcbiAgICAgIGZha2VXZWJBdWRpbzogZmFsc2UsXG4gICAgICBzaG93S2V5czogZmFsc2UsXG4gICAgICBzaG93TW91c2U6IGZhbHNlLFxuICAgICAgbm9DbG9zZU9uRmFpbDogZmFsc2VcbiAgICB9XG4gIH0sXG4gIGNoZWNrZWRUZXN0czogW10sXG4gIHJlc3VsdHM6IFtdLFxuICByZXN1bHRzQXZlcmFnZTogW10sXG4gIHJlc3VsdHNCeUlkOiB7fVxufTtcblxudmFyIHRlc3RBcHAgPSBudWxsO1xuXG53aW5kb3cub25sb2FkID0gKHgpID0+IHtcbiAgdmFyIHZ1ZUFwcCA9IG5ldyBWdWUoe1xuICAgIGVsOiAnI2FwcCcsXG4gICAgZGF0YTogZGF0YSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBwcmV0dHlQcmludCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gcHJldHR5UHJpbnRKc29uLnRvSHRtbCh2YWx1ZSk7XG4gICAgICB9LFxuICAgICAgZm9ybWF0TnVtZXJpYyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9GaXhlZCgyKTtcbiAgICAgIH0sXG4gICAgICBydW5UZXN0OiBmdW5jdGlvbih0ZXN0LCBpbnRlcmFjdGl2ZSwgcmVjb3JkaW5nKSB7XG4gICAgICAgIHRlc3RBcHAudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICAgICAgICB2YXIgbW9kZSA9IGludGVyYWN0aXZlID8gJ2ludGVyYWN0aXZlJyA6IChyZWNvcmRpbmcgPyAncmVjb3JkJyA6ICdyZXBsYXknKTtcbiAgICAgICAgdGVzdEFwcC50ZXN0c01hbmFnZXIucnVuVGVzdCh0ZXN0LmlkLCBtb2RlLCBkYXRhLm9wdGlvbnMudGVzdHMpO1xuICAgICAgfSxcbiAgICAgIHJ1blNlbGVjdGVkVGVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXN0QXBwLnJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICAgIH0sXG4gICAgICBnZXRCcm93c2VySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5icm93c2VySW5mbyA/IGRhdGEuYnJvd3NlckluZm8gOiAnQ2hlY2tpbmcgYnJvd3NlciBmZWF0dXJlcy4uLic7XG4gICAgICB9XG4gICAgfSxcbiAgICBjb21wdXRlZDoge1xuICAgICAgc2VsZWN0ZWRUZXN0cyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrZWRUZXN0czsgLy8gQHRvZG8gQXBwbHkgZmlsdGVyIGhlcmUgdG9vXG4gICAgICB9LFxuICAgICAgZmlsdGVyZWRUZXN0cygpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RzLmZpbHRlcih0ZXN0ID0+IHtcbiAgICAgICAgICByZXR1cm4gdGVzdC5pZCAmJiB0ZXN0LmlkLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihmaWx0ZXIpID4gLTEgfHxcbiAgICAgICAgICB0ZXN0LmVuZ2luZSAmJiB0ZXN0LmVuZ2luZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoZmlsdGVyKSA+IC0xIHx8XG4gICAgICAgICAgdGVzdC5hcGlzICYmIHRlc3QuYXBpcy5qb2luKCcgJykudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlcikgPiAtMSB8fFxuICAgICAgICAgIHRlc3QubmFtZSAmJiB0ZXN0Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlcikgPiAtMTtcbiAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdGVzdEFwcCA9IG5ldyBUZXN0QXBwKHZ1ZUFwcCk7XG5cbn1cbiJdLCJuYW1lcyI6WyJ1c2VyQWdlbnRJbmZvIiwidGhpcyIsImpzU0hBIiwiZGVjb2RlQ29tcG9uZW50IiwiZ2VuZXJhdGVVVUlEIiwiYWRkR0VUIiwicmVxdWlyZSQkMCIsImJ1aWxkVGVzdFVSTCIsInl5eXltbWRkaGhtbXNzIiwiYnJvd3NlckZlYXR1cmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Q0FBQTtDQUNBLFNBQVMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO0NBQ3RDLEVBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDbkQsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFO0NBQ2xDLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDL0QsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO0NBQ2pDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztDQUNuRCxDQUFDOztDQUVEO0NBQ0EsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTtDQUMvQixFQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUU7Q0FDeEMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDekUsRUFBRSxPQUFPLEtBQUssQ0FBQztDQUNmLENBQUM7OztDQUdEO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRTtDQUM3QixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDbkIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEI7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7Q0FDeEIsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN0QyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFhLElBQUksQ0FBQyxFQUFFO0NBQzdDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2hFLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztDQUNsQixLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzlDLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsR0FBRztDQUNILEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztDQUUzRDs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RCLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtDQUM3RCxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQzFDLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUNyQixLQUFLO0NBQ0wsR0FBRztDQUNILEVBQUUsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztDQUV2QztDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QixJQUFJLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtDQUN0RCxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7Q0FDbkMsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ3JCLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDdkMsRUFBRSxPQUFPLE1BQU0sQ0FBQztDQUNoQixDQUFDOztDQUVEO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsaUJBQWlCLENBQUMsTUFBTSxFQUFFO0NBQ25DLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDekMsSUFBSSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDekIsSUFBSSxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO0NBQ2xDLE1BQU0sT0FBTyxtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcEcsS0FBSztDQUNMLEdBQUc7Q0FDSCxDQUFDOztDQUVEO0NBQ0EsU0FBUyxNQUFNLENBQUMsY0FBYyxFQUFFO0NBQ2hDLEVBQUUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNyTyxFQUFFLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO0NBQ3RCLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxjQUFjLEVBQUU7Q0FDakMsTUFBTSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDaEQsS0FBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLE9BQU8sT0FBTyxDQUFDO0NBQ2pCLENBQUM7O0NBRUQ7Q0FDQSxTQUFTLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtDQUN4QyxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDN0YsRUFBRSxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztDQUM3QixFQUFFLElBQUksSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO0NBQ3ZCLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RCLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0NBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLE1BQU0saUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ25ELEtBQUssTUFBTTtDQUNYLE1BQU0saUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ2xDLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxPQUFPLGlCQUFpQixDQUFDO0NBQzNCLENBQUM7O0NBRUQ7Q0FDQSxTQUFTLHVCQUF1QixDQUFDLFlBQVksRUFBRTtDQUMvQyxFQUFFLElBQUksSUFBSSxHQUFHO0NBQ2IsSUFBSSxLQUFLLEVBQUUsTUFBTTtDQUNqQixJQUFJLEtBQUssRUFBRSxJQUFJO0NBQ2YsSUFBSSxLQUFLLEVBQUUsSUFBSTtDQUNmLElBQUksS0FBSyxFQUFFLE9BQU87Q0FDbEIsSUFBSSxLQUFLLEVBQUUsR0FBRztDQUNkLElBQUksS0FBSyxFQUFFLEdBQUc7Q0FDZCxJQUFJLEtBQUssRUFBRSxLQUFLO0NBQ2hCLElBQUksTUFBTSxFQUFFLElBQUk7Q0FDaEIsSUFBRztDQUNILEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEtBQUssR0FBRyxZQUFZLENBQUM7Q0FDdkQsRUFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUM1QixDQUFDOztDQUVEO0NBQ0E7QUFDQSxDQUFlLFNBQVMsZUFBZSxDQUFDLFNBQVMsRUFBRTtDQUNuRCxFQUFFLFNBQVMsR0FBRyxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQztDQUMvQyxFQUFFLElBQUksRUFBRSxHQUFHO0NBQ1gsSUFBSSxTQUFTLEVBQUUsU0FBUztDQUN4QixJQUFJLGlCQUFpQixFQUFFLEVBQUU7Q0FDekIsSUFBSSxZQUFZLEVBQUUsRUFBRTtDQUNwQixHQUFHLENBQUM7O0NBRUosRUFBRSxJQUFJO0NBQ04sSUFBSSxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDM0MsSUFBSSxJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUNuRCxJQUFJLElBQUksaUJBQWlCLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDM0QsSUFBSSxFQUFFLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7Q0FDN0MsSUFBSSxFQUFFLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQztDQUNyQyxJQUFJLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0QyxDQUdBLElBQUksSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0NBQ2hDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7Q0FDOUIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztDQUN6QixLQUFLLE1BQU0sSUFBSSxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDaEYsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0NBQ3pCLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUU7Q0FDdkMsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RCLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUU7Q0FDekMsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0NBQ3hCLEtBQUssTUFBTSxJQUFJLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUM1RSxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLE1BQU0sRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEIsS0FBSyxNQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUU7Q0FDN0YsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RCO0NBQ0E7Q0FDQSxLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUFFO0NBQzlDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztDQUN6QixLQUFLLE1BQU07Q0FDWCxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLEtBQUs7O0NBRUw7Q0FDQSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNwQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztDQUNqRCxJQUFJLElBQUksQ0FBQyxFQUFFO0NBQ1gsTUFBTSxFQUFFLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztDQUMxQixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JCLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7Q0FDdkIsTUFBTSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQzdDLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDdEMsTUFBTSxJQUFJLENBQUMsRUFBRTtDQUNiLFFBQVEsRUFBRSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7Q0FDaEMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztDQUMxQixRQUFRLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVCLE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0NBQ3pDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Q0FDYixRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7Q0FDMUIsUUFBUSxFQUFFLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JELFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEMsT0FBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtDQUN0TCxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Q0FDaEQsUUFBUSxJQUFJLENBQUMsRUFBRTtDQUNmLFVBQVUsRUFBRSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsVUFBVSxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztDQUN4QixVQUFVLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDakQsVUFBVSxFQUFFLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDN0QsU0FBUztDQUNULE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZELE1BQU0sSUFBSSxDQUFDLEVBQUU7Q0FDYixRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEMsT0FBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ2pCLEtBQUs7QUFDTCxBQU9BO0NBQ0E7Q0FDQSxJQUFJLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0NBQy9KLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7Q0FDM0IsTUFBTSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsTUFBTSxJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFO0NBQ2hDLFFBQVEsRUFBRSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzQyxRQUFRLElBQUksRUFBRSxDQUFDLGNBQWMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7Q0FDcEUsUUFBUSxJQUFJLEVBQUUsQ0FBQyxjQUFjLElBQUksU0FBUyxFQUFFLEVBQUUsQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7Q0FDcEYsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pELFFBQVEsTUFBTTtDQUNkLE9BQU87Q0FDUCxLQUFLO0NBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFO0NBQzVCLE1BQU0sSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQ3RELE1BQU0sSUFBSSxPQUFPLEVBQUU7Q0FDbkIsUUFBUSxFQUFFLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztDQUN2QyxRQUFRLEVBQUUsQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7Q0FDaEQsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2QyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxFQUFFO0NBQzFELFFBQVEsRUFBRSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7Q0FDdkMsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLG1CQUFtQixDQUFDO0NBQ2hELFFBQVEsRUFBRSxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQy9ELE9BQU87Q0FDUCxLQUFLOztDQUVMO0NBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUNuRCxNQUFNLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNuQyxNQUFNLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztDQUNyQyxNQUFNLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0NBQ2xFLFFBQVEsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Q0FDM0IsUUFBUSxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztDQUN4QixRQUFRLE1BQU07Q0FDZCxPQUFPO0NBQ1AsS0FBSzs7Q0FFTDtDQUNBLElBQUksSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDbkYsU0FBUyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0NBQ25ILFNBQVMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Q0FDMUYsU0FBUyxFQUFFLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztDQUNuQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Q0FDYixJQUFJLEVBQUUsQ0FBQyxhQUFhLEdBQUcscUNBQXFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQzVFLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEVBQUUsQ0FBQztDQUNaLENBQUM7O0NDN1JjLFNBQVMsaUJBQWlCLEdBQUc7Q0FDNUMsRUFBRSxPQUFPLElBQUksT0FBTyxFQUFFLE9BQU8sSUFBSTtDQUNqQyxJQUFJLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztDQUM1QixJQUFJLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUMvQixJQUFJLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztDQUNwQixJQUFJLFNBQVMsSUFBSSxHQUFHO0NBQ3BCLE1BQU0sSUFBSSxFQUFFLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2pDLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDekIsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ2QsTUFBTSxJQUFJLEVBQUUsY0FBYyxHQUFHLENBQUMsRUFBRTtDQUNoQyxRQUFRLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3BDLE9BQU8sTUFBTTtDQUNiLFFBQVEsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3RCLFFBQVEsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdEYsUUFBUSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Q0FDcEIsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLE1BQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlDLFFBQVEsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDOUMsT0FBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2hDLEdBQUcsQ0FBQyxDQUFDO0NBQ0wsQ0FBQzs7Q0NsQkQsU0FBUyxVQUFVLEdBQUc7Q0FDdEIsRUFBRSxJQUFJLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0QyxDQUNBLEVBQUUsSUFBSSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsRUFBRSxJQUFJLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNsQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUM7Q0FDdkIsRUFBRSxJQUFJLG9CQUFvQixDQUFDO0NBQzNCLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLEVBQUUsb0JBQW9CLEdBQUcsWUFBWSxDQUFDO0NBQ3RGLE9BQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLEVBQUUsb0JBQW9CLEdBQUcsZUFBZSxDQUFDO0NBQzlGLE9BQU8sb0JBQW9CLEdBQUcsc0NBQXNDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxhQUFhLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDM0ksRUFBRSxPQUFPLG9CQUFvQixDQUFDO0NBQzlCLENBQUM7QUFDRCxBQU1BO0NBQ0E7Q0FDQTtDQUNBO0FBQ0EsQ0FBZSxTQUFTLGtCQUFrQixDQUFDLGVBQWUsRUFBRTtDQUM1RCxFQUFFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztDQUNoQixFQUFFLFNBQVMsYUFBYSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Q0FDdkMsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ2xDLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztDQUMvQixHQUFHOztDQUVILEVBQUUsYUFBYSxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDL0QsRUFBRSxhQUFhLENBQUMsYUFBYSxFQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQztDQUNuRSxFQUFFLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxPQUFPLFdBQVcsQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDckYsRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFFLE9BQU8sWUFBWSxLQUFLLFdBQVcsSUFBSSxPQUFPLGtCQUFrQixLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzlHLEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Q0FDeEwsRUFBRSxhQUFhLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztDQUN0TCxFQUFFLElBQUksa0JBQWtCLEdBQUcsS0FBSyxDQUFDO0NBQ2pDLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUc7Q0FDN0QsRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Q0FDNUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxPQUFPLFdBQVcsS0FBSyxXQUFXLElBQUksT0FBTyxjQUFjLEtBQUssV0FBVyxJQUFJLE9BQU8saUJBQWlCLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDakwsRUFBRSxhQUFhLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxpQkFBaUIsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUMvRSxFQUFFLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxPQUFPLFNBQVMsQ0FBQyxtQkFBbUIsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM3RixFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxJQUFJLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDdkQsRUFBRSxhQUFhLENBQUMsWUFBWSxFQUFFLE9BQU8sTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzdELEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxPQUFPLFdBQVcsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUNuRSxFQUFFLGFBQWEsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztDQUNwRixFQUFFLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztDQUMzQixFQUFFLElBQUksRUFBRSxZQUFZLEdBQUcsT0FBTyxTQUFTLEtBQUssV0FBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO0NBQ3ZFLEVBQUUsYUFBYSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztDQUMzQyxFQUFFLGFBQWEsQ0FBQyxlQUFlLEVBQUUsT0FBTyxRQUFRLENBQUMsZUFBZSxLQUFLLFdBQVcsSUFBSSxPQUFPLFFBQVEsQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDNUgsRUFBRSxhQUFhLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxxQkFBcUIsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUN2RixFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLFdBQVcsS0FBSyxXQUFXLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzFGLEVBQUUsYUFBYSxDQUFDLFlBQVksRUFBRSxPQUFPLFNBQVMsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUNoRSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxpQkFBaUIsS0FBSyxXQUFXLElBQUksT0FBTyxvQkFBb0IsS0FBSyxXQUFXLElBQUksT0FBTyx1QkFBdUIsS0FBSyxXQUFXLElBQUksT0FBTyxtQkFBbUIsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUNuTixFQUFFLGFBQWEsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ25ELEVBQUUsYUFBYSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Q0FDeEwsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ3pELEVBQUUsYUFBYSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUMxRCxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbkUsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sU0FBUyxDQUFDLGFBQWEsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUN6RSxFQUFFLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzlELEVBQUUsYUFBYSxDQUFDLGlCQUFpQixFQUFFLE9BQU8sZUFBZSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzNFLEVBQUUsYUFBYSxDQUFDLGVBQWUsRUFBRSxpQkFBaUIsSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzs7Q0FFaks7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLEVBQUUsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLENBQ0E7Q0FDQSxFQUFFLFNBQVMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLDRCQUE0QixFQUFFO0NBQ3ZFLElBQUksSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUNsRCxJQUFJLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztDQUN6QixJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNoSCxJQUFJLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLDRCQUE0QixHQUFHLEVBQUUsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7Q0FDN0gsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNqQyxDQUNBLE1BQU0sSUFBSSxPQUFPLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztDQUMxRixNQUFNLElBQUksV0FBVyxJQUFJLG9CQUFvQixFQUFFLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNwRixNQUFNLE9BQU8sT0FBTyxDQUFDO0NBQ3JCLEtBQUs7Q0FDTCxTQUFTLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsQ0FBQztDQUMvRCxHQUFHOztDQUVILEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUM1RCxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO0NBQ3pDLElBQUksSUFBSSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzNELElBQUksSUFBSSxjQUFjLENBQUMsU0FBUyxFQUFFO0NBQ2xDLE1BQU0sY0FBYyxDQUFDLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUM7Q0FDOUUsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsY0FBYyxDQUFDO0NBQzlDLEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztDQUMzRCxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO0NBQ3pDLElBQUksSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN6RSxJQUFJLElBQUksaUJBQWlCLENBQUMsU0FBUyxLQUFLLGlCQUFpQixDQUFDLFdBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtDQUMvRyxNQUFNLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztDQUNqRCxLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxFQUFFO0NBQ3pDLElBQUksSUFBSSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzFELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUU7Q0FDbkMsTUFBTSxJQUFJLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzVFLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLEtBQUssaUJBQWlCLENBQUMsV0FBVyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0NBQ3pHLFFBQVEsY0FBYyxHQUFHLGlCQUFpQixDQUFDO0NBQzNDLE9BQU87Q0FDUCxLQUFLOztDQUVMLElBQUksSUFBSSxjQUFjLENBQUMsU0FBUyxFQUFFO0NBQ2xDLE1BQU0sY0FBYyxDQUFDLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUM7Q0FDOUUsTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsY0FBYyxDQUFDO0NBQzlDLEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDNUQsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUM1RDtDQUNBO0NBQ0E7O0NBRUEsRUFBRSxJQUFJLE9BQU8sR0FBRztDQUNoQixJQUFJLFNBQVMsRUFBRUEsZUFBYSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7Q0FDakQsSUFBSSxTQUFTLEVBQUU7Q0FDZixNQUFNLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTztDQUNoQyxNQUFNLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVTtDQUN0QyxNQUFNLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztDQUM1QixNQUFNLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtDQUNsQyxLQUFLO0NBQ0w7Q0FDQSxJQUFJLE9BQU8sRUFBRTtDQUNiLE1BQU0sc0JBQXNCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQjtDQUNyRCxNQUFNLFdBQVcsRUFBRSxNQUFNLENBQUMsS0FBSztDQUMvQixNQUFNLFlBQVksRUFBRSxNQUFNLENBQUMsTUFBTTtDQUNqQyxNQUFNLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFnQjtDQUNqRSxNQUFNLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLGdCQUFnQjtDQUNuRSxLQUFLO0NBQ0wsSUFBSSxtQkFBbUIsRUFBRSxTQUFTLENBQUMsbUJBQW1CO0NBQ3RELElBQUksVUFBVSxFQUFFLElBQUk7Q0FDcEIsSUFBSSxvQkFBb0IsRUFBRSxVQUFVLEVBQUU7Q0FDdEMsR0FBRyxDQUFDOztDQUVKO0NBQ0EsRUFBRSxJQUFJLGNBQWMsR0FBRyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztDQUM5SixFQUFFLElBQUksSUFBSSxDQUFDLElBQUksY0FBYyxFQUFFO0NBQy9CLElBQUksSUFBSSxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlCLElBQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0NBQzlELEdBQUc7Q0FDSDtDQUNBOztDQUVBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxpQkFBaUIsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUk7Q0FDMUMsSUFBSSxPQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDbEQsSUFBSSxJQUFJLGVBQWUsRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDbEQsR0FBRyxDQUFDLENBQUM7O0NBRUw7Q0FDQTs7Q0FFQTtDQUNBLEVBQUUsT0FBTyxPQUFPLENBQUM7Q0FDakIsQ0FBQzs7Q0N4TEQsU0FBUyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7Q0FDN0MsRUFBRSxJQUFJLE1BQU0sR0FBRztDQUNmLElBQUksWUFBWSxFQUFFLFlBQVk7Q0FDOUIsR0FBRyxDQUFDOztDQUVKLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQjtDQUN6RCxLQUFLLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBRTtDQUMzRDtDQUNBLElBQUksTUFBTSxDQUFDLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQztDQUMvQyxJQUFJLE9BQU8sTUFBTSxDQUFDO0NBQ2xCLENBQUM7O0NBRUQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLEVBQUUsRUFBRSxXQUFXLENBQUM7Q0FDcEIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztDQUMvRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRTtDQUN6QyxFQUFFLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM5QixFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2xELEVBQUUsSUFBSSxFQUFFLENBQUM7Q0FDVCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUM7Q0FDekIsTUFBTSxNQUFNO0NBQ1osR0FBRztDQUNILENBQUM7Q0FDRCxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDaEIsSUFBSSxDQUFDLEVBQUUsRUFBRTtDQUNULElBQUksTUFBTSxDQUFDLFdBQVcsR0FBRywwQ0FBMEMsQ0FBQztDQUNwRSxJQUFJLE9BQU8sTUFBTSxDQUFDO0NBQ2xCLENBQUM7O0NBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtDQUM3QixJQUFJLFdBQVcsRUFBRSxXQUFXO0NBQzVCLElBQUksU0FBUyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztDQUMxQyxJQUFJLE1BQU0sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7Q0FDdEMsSUFBSSxRQUFRLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO0NBQzFDLElBQUksY0FBYyxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNO0NBQzlDLElBQUksZ0JBQWdCLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVE7Q0FDbEQsSUFBSSxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztDQUN2QixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLGVBQWU7Q0FDbkYsSUFBSSxzQkFBc0IsRUFBRSx5QkFBeUIsQ0FBQyxXQUFXLENBQUM7Q0FDbEUsSUFBSSxJQUFJLEVBQUU7Q0FDVixNQUFNLE9BQU8sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7Q0FDM0MsTUFBTSxTQUFTLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO0NBQy9DLE1BQU0sUUFBUSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztDQUM3QyxNQUFNLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7Q0FDL0MsTUFBTSxTQUFTLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO0NBQy9DLE1BQU0sV0FBVyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztDQUNuRCxLQUFLO0NBQ0wsSUFBSSxPQUFPLEVBQUU7Q0FDYixNQUFNLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7Q0FDN0MsTUFBTSxtQkFBbUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztDQUNwRSxNQUFNLDRCQUE0QixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGdDQUFnQyxDQUFDO0NBQ3hGLE1BQU0scUJBQXFCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUM7Q0FDMUUsTUFBTSx5QkFBeUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztDQUNqRixNQUFNLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDO0NBQ3ZFLE1BQU0sY0FBYyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO0NBQzFELE1BQU0saUJBQWlCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7Q0FDaEUsTUFBTSxtQkFBbUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztDQUNqRSxNQUFNLDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO0NBQ3BGLE1BQU0sdUJBQXVCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUM7Q0FDN0UsTUFBTSxxQkFBcUIsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztDQUNqRixNQUFNLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7Q0FDekMsS0FBSztDQUNMLElBQUkscUJBQXFCLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLENBQUM7Q0FDdEYsSUFBSSxxQkFBcUIsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQztDQUN0RixJQUFJLE9BQU8sRUFBRTtDQUNiLE1BQU0seUJBQXlCLEVBQUUscUJBQXFCLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUM7Q0FDNUUsTUFBTSwyQkFBMkIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztDQUNoRixNQUFNLCtCQUErQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsQ0FBQztDQUMvRCxNQUFNLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDO0NBQzFFLEtBQUs7Q0FDTCxJQUFJLFVBQVUsRUFBRSxFQUFFLENBQUMsc0JBQXNCLEVBQUU7Q0FDM0MsR0FBRyxDQUFDLENBQUM7Q0FDTCxDQUFDOztDQUVELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtDQUM5QixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDOUIsQ0FBQzs7Q0FFRCxTQUFTLGVBQWUsQ0FBQyxFQUFFLEVBQUU7Q0FDN0IsRUFBRSxJQUFJLFlBQVksR0FBRztDQUNyQixNQUFNLFFBQVEsRUFBRSxFQUFFO0NBQ2xCLE1BQU0sTUFBTSxFQUFFLEVBQUU7Q0FDaEIsR0FBRyxDQUFDO0NBQ0o7Q0FDQSxFQUFFLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsMkJBQTJCLENBQUMsQ0FBQztDQUNuRSxFQUFFLElBQUksYUFBYSxJQUFJLElBQUksRUFBRTtDQUM3QixNQUFNLFlBQVksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FBQztDQUNyRixNQUFNLFlBQVksQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztDQUNuRixHQUFHO0NBQ0g7Q0FDQSxFQUFFLE9BQU8sWUFBWSxDQUFDO0NBQ3RCLENBQUM7O0NBRUQsU0FBUyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUU7Q0FDaEMsRUFBRSxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7Q0FDMUIsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Q0FDbEQsRUFBRSxJQUFJLEdBQUcsSUFBSSxJQUFJO0NBQ2pCLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Q0FDcEU7Q0FDQSxFQUFFLE9BQU8sZUFBZSxDQUFDO0NBQ3pCLENBQUM7O0NBRUQsU0FBUyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUU7Q0FDaEQ7Q0FDQSxFQUFFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztDQUMzRSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUUsNEJBQTRCLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztDQUNuRixFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Q0FFbEIsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO0NBQ1g7Q0FDQSxNQUFNLE9BQU8sS0FBSyxDQUFDO0NBQ25CLEdBQUc7O0NBRUgsRUFBRSxJQUFJLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsNEJBQTRCLEtBQUssV0FBVyxFQUFFO0NBQ3JGO0NBQ0E7Q0FDQSxNQUFNLE9BQU8saUJBQWlCLENBQUM7Q0FDL0IsR0FBRztDQUNILEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDZCxDQUFDOztDQUVELFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRTtDQUN6QixFQUFFLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUM1QyxDQUFDOztDQUVELFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRTtDQUN0QixFQUFFLElBQUksY0FBYyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7O0NBRW5GO0NBQ0EsRUFBRSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsS0FBSyxPQUFPLE1BQU0sU0FBUyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUM7Q0FDbkYsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxtQkFBbUIsQ0FBQztDQUM1RCxPQUFPLGNBQWMsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztDQUVoRCxFQUFFLElBQUksS0FBSyxFQUFFO0NBQ2I7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLE1BQU0sSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEVBQUU7Q0FDMUksVUFBVSxPQUFPLFlBQVksQ0FBQztDQUM5QixPQUFPLE1BQU07Q0FDYixVQUFVLE9BQU8sV0FBVyxDQUFDO0NBQzdCLE9BQU87Q0FDUCxHQUFHOztDQUVILEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDZCxDQUFDOztDQUVELFNBQVMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFO0NBQzlCLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsQ0FBQztDQUMzRCxhQUFhLEVBQUUsQ0FBQyxZQUFZLENBQUMsdUNBQXVDLENBQUM7Q0FDckUsYUFBYSxFQUFFLENBQUMsWUFBWSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7O0NBRW5FLEVBQUUsSUFBSSxDQUFDLEVBQUU7Q0FDVCxNQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUM7Q0FDbEU7Q0FDQSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtDQUNyQixVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUM7Q0FDbEIsT0FBTztDQUNQLE1BQU0sT0FBTyxHQUFHLENBQUM7Q0FDakIsR0FBRztDQUNILEVBQUUsT0FBTyxLQUFLLENBQUM7Q0FDZixDQUFDOztDQUVELFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUU7Q0FDeEMsRUFBRSxJQUFJLE9BQU8sRUFBRTtDQUNmLE1BQU0sT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDeEMsR0FBRyxNQUFNO0NBQ1QsTUFBTSxPQUFPLElBQUksR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFDO0NBQ2xDLEdBQUc7Q0FDSCxDQUFDOztDQUVELFNBQVMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRTtDQUNyRCxFQUFFLElBQUksV0FBVyxHQUFHLE9BQU8sR0FBRyxlQUFlLEdBQUcsRUFBRSxDQUFDO0NBQ25ELEVBQUUsT0FBTyxJQUFJLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxHQUFHLFdBQVcsR0FBRyxHQUFHO0NBQzVKLENBQUM7O0NBRUQsU0FBUyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFO0NBQy9DLEVBQUUsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDcEUsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUN4RSxFQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztDQUVsRSxFQUFFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztDQUNsQixFQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLEVBQUU7Q0FDNUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDO0NBQ3BCLEdBQUc7O0NBRUgsRUFBRSxPQUFPO0NBQ1QsTUFBTSxJQUFJLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztDQUNoRCxNQUFNLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO0NBQ3BELE1BQU0sR0FBRyxFQUFFLHVCQUF1QixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Q0FDN0MsTUFBTSxJQUFJLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztDQUNoRCxHQUFHO0NBQ0gsQ0FBQzs7Q0FFRCxTQUFTLG9CQUFvQixDQUFDLEVBQUUsRUFBRTtDQUNsQyxFQUFFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUM1RSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQzs7Q0FFekQsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3RFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQzs7Q0FFaEQsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNYLENBQUM7O0NBRUQsYUFBYyxHQUFHLFdBQVc7Q0FDNUIsRUFBRSxPQUFPO0NBQ1QsSUFBSSxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0NBQ3BDLElBQUksTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztDQUNwQyxHQUFHO0NBQ0g7Ozs7Ozs7OztBQ25OQSxDQVNhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRTtDQUN0ZixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVU7Q0FDMWYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtDQUNuZixDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3hnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsNERBQTRELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtDQUMvZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7Q0FDOWYsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzNmLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLGtFQUFrRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBQyxHQUFHLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEtBQUssU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDLE1BQU07Q0FDbGlCLFFBQVEsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDdGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7Q0FDcmYsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtFQUFrRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM1ZixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztDQUN4ZixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0NBQ3ZmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3JmLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ3pmLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7Q0FDOWdCLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JmLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDeGYsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3pmLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVTtDQUN4ZixVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQzVmLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUM5ZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7Q0FDcGYsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7Q0FDbmdCLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDM2YsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FB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LENBQUMsZUFBZSxFQUFFO0NBQ3RELElBQUksSUFBSSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDakMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksRUFBRSxHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDNUcsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25ILEdBQUcsTUFBTTtDQUNULElBQUksT0FBTyxzQ0FBc0MsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0NBQy9FLE1BQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxH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
