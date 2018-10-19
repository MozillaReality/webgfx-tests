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
	    this.currentlyRunningTest = {};
	    this.resultsServer = new ResultsServer();
	    this.testsQueuedToRun = [];
	    this.progress = null;

	    fetch('tests.json')
	      .then(response => { return response.json(); })
	      .then(json => {
	        json.forEach(test => {
	          test.selected = true;
	        });
	        this.tests = vueApp.tests = json;

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
	      testResults.startTime = this.currentlyRunningTest.startTime;
	      testResults.fakeWebGL = this.currentlyRunningTest.fakeWebGL;
	      //testResults.id = this.currentlyRunningTest.id;
	      testResults.finishTime = yyyymmddhhmmss();
	      testResults.name = this.currentlyRunningTest.name;
	      testResults.runUUID = this.currentlyRunningTest.runUUID;
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
	      /*
	      if (runningTestsInProgress) {
	        var testStarted = runNextQueuedTest();
	        if (!testStarted) {
	          if (tortureMode) {
	            testsQueuedToRun = getSelectedTests();
	            runSelectedTests();
	          } else {
	            runningTestsInProgress = false;
	            currentlyRunningTest = null;
	          }
	        }
	      } else {
	        currentlyRunningTest = null;
	      }
	      */
	      this.runNextQueuedTest();
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
	    this.testsQueuedToRun = this.tests.filter(x => x.selected);
	    
	    //if (data.numTimesToRunEachTest > 1) {
	    //  data.numTimesToRunEachTest = Math.max(data.numTimesToRunEachTest, 1000);
	    const numTimesToRunEachTest = this.vueApp.options.general.numTimesToRunEachTest;
	    this.progress = {
	      totalGlobal: numTimesToRunEachTest * this.testsQueuedToRun.length,
	      currentGlobal: 1,
	      tests: {}
	    };

	    {
	      var multiples = [];
	      for(var i = 0; i < this.testsQueuedToRun.length; i++) {
	        for(var j = 0; j < numTimesToRunEachTest; j++) {
	          multiples.push(this.testsQueuedToRun[i]);
	          this.progress.tests[this.testsQueuedToRun[i].id] = {
	            current: 1,
	            total: numTimesToRunEachTest
	          };
	        }
	      }
	      this.testsQueuedToRun = multiples;
	    }

	    this.runningTestsInProgress = true;
	    this.runNextQueuedTest();
	  }
	  
	  runNextQueuedTest() {  
	    if (this.testsQueuedToRun.length == 0) {
	      this.progress = null;
	      return false;
	    }
	    var t = this.testsQueuedToRun[ 0 ];
	    this.testsQueuedToRun.splice(0, 1);
	    this.runTest(t.id, false);
	    return true;
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

	  runTest(id, interactive, record) {
	    var test = this.tests.find(t => t.id === id);
	    if (!test) {
	      console.error('Test not found, id:', id);
	      return;
	    }
	    console.log('Running test:', test.name);
	  
	    var fakeWebGL = this.vueApp.options.tests.fakeWebGL;
	    this.currentlyRunningTest.test = test;
	    this.currentlyRunningTest.startTime = yyyymmddhhmmss();
	    this.currentlyRunningTest.runUUID = generateUUID();
	    this.currentlyRunningTest.fakeWebGL = fakeWebGL;
	    
	    var url = (interactive ? 'static/': 'tests/') + test.url;
	    if (!interactive) url = addGET(url, 'playback');
	    if (fakeWebGL) url = addGET(url, 'fake-webgl');
	    if (test.numframes) url = addGET(url, 'num-frames=' + test.numframes);
	    if (test.windowsize) url = addGET(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);
	    if (record) {
	      url = addGET(url, 'recording');
	    } else if (test.input) {
	      url = addGET(url, 'replay');
	      if (this.vueApp.options.tests.showKeys) url = addGET(url, 'show-keys');
	      if (this.vueApp.options.tests.showMouse) url = addGET(url, 'show-mouse');
	    }

	    if (this.vueApp.options.tests.noCloseOnFail) url = addGET(url, 'no-close-on-fail');
	    if (test.skipReferenceImageTest) url = addGET(url, 'skip-reference-image-test');
	    if (test.referenceImage) url = addGET(url, 'reference-image');

	    if (this.progress) {
	      url = addGET(url, 'order-test=' + this.progress.tests[id].current + '&total-test=' + this.progress.tests[id].total);
	      url = addGET(url, 'order-global=' + this.progress.currentGlobal + '&total-global=' + this.progress.totalGlobal);
	      this.progress.tests[id].current++;
	      this.progress.currentGlobal++;
	    }

	    window.open(url);
	  
	    var testData = {
	      'browserUUID': this.browserUUID,
	      'id': test.id,
	      'name': test.name,
	      'startTime': yyyymmddhhmmss(),
	      'result': 'unfinished',
	      //'FakeWebGL': data.options.fakeWebGL,
	      'runUUID': this.currentlyRunningTest.runUUID,
	      'runOrdinal': this.vueApp.resultsById[test.id] ? (this.vueApp.resultsById[test.id].length + 1) : 1
	    };
	  
	    //if (data.nativeSystemInfo && data.nativeSystemInfo.UUID) testData.hardwareUUID = data.nativeSystemInfo.UUID;
	    //this.resultsServer.storeStart(testData);
	  }
	  
	  autoRun() {
	    if (!this.isCurrentlyRunningTest && location.search.toLowerCase().indexOf('autorun') !== -1) {
	      this.runSelectedTests();
	    }
	  } 
	}

	/*
	  // Fetch information about native system if we are running as localhost.
	  function fetchNativeSystemInfo() {
	    var promise = new Promise(function(resolve, reject) {
	      var nativeSystemInfo = null;
	      var systemInfo = new XMLHttpRequest();
	      systemInfo.onreadystatechange = function() {
	        if (systemInfo.readyState != 4) return;
	        var nativeSystemInfo = JSON.parse(systemInfo.responseText);
	        resolve(nativeSystemInfo);
	      }
	      systemInfo.open('POST', 'system_info', true);
	      systemInfo.send();
	    });
	    return promise;
	  }

	var nativeInfoPromise;
	if (location.href.indexOf('http://localhost') == 0) {
	  nativeInfoPromise = fetchNativeSystemInfo();
	} else {
	  nativeInfoPromise = new Promise(function(resolve, reject) { setTimeout(function() { resolve(); }, 1); });
	}

	Promise.all([browserInfoPromise, nativeInfoPromise]).then(function(allResults) {
	  var browserInfo = allResults[0];
	  var nativeInfo = allResults[1];
	  if (nativeInfo) {
	    browserInfo['nativeSystemInfo'] = nativeInfo['system'];
	    browserInfo['browserInfo'] = nativeInfo['browser'];
	  }
	  browserInfo['browserUUID'] = browserUUID;
	  onBrowserResultsReceived(browserInfo);
	}, function() {
	  console.error('browser info test failed!');
	});
	*/

	var data = {
	  tests: [],
	  show_json: false,
	  browserInfo: null,
	  webglInfo: null,
	  nativeSystemInfo: {},
	  showInfo: false,
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
	      formatNumeric(value) {
	        return value.toFixed(2);
	      },
	      runTest: function(test, interactive, recording) {
	        testApp.testsQueuedToRun = [];
	        testApp.runTest(test.id, interactive, recording);
	      },
	      runSelectedTests: function() {
	        testApp.runSelectedTests();
	      },
	      getBrowserInfo: function () {
	        return data.browserInfo ? JSON.stringify(data.browserInfo, null, 4) : 'Checking browser features...';
	      }
	    }
	  });
	  
	  testApp = new TestApp(vueApp);

	};

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3VzZXJhZ2VudC1pbmZvL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3ZzeW5jLWVzdGltYXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItZmVhdHVyZXMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViZ2wtaW5mby9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9qc3NoYS9zcmMvc2hhLmpzIiwiLi4vc3JjL2Zyb250YXBwL1VVSUQuanMiLCIuLi9zcmMvZnJvbnRhcHAvcmVzdWx0cy1zZXJ2ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vc3JjL2Zyb250YXBwL3V0aWxzLmpzIiwiLi4vc3JjL2Zyb250YXBwL2FwcC5qcyIsIi4uL3NyYy9mcm9udGFwcC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUcmltcyB3aGl0ZXNwYWNlIGluIGVhY2ggc3RyaW5nIGZyb20gYW4gYXJyYXkgb2Ygc3RyaW5nc1xuZnVuY3Rpb24gdHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoYXJyKSB7XG4gIHJldHVybiBhcnIubWFwKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHgudHJpbSgpOyB9KTtcbn1cblxuLy8gUmV0dXJucyBhIGNvcHkgb2YgdGhlIGdpdmVuIGFycmF5IHdpdGggZW1wdHkvdW5kZWZpbmVkIHN0cmluZyBlbGVtZW50cyByZW1vdmVkIGluIGJldHdlZW5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RWxlbWVudHMoYXJyKSB7XG4gIHJldHVybiBhcnIuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHggJiYgeC5sZW5ndGggPiAwOyB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdHJpbmcgaXMgZW5jbG9zZWQgaW4gcGFyZW50aGVzZXMsIGUuZy4gaXMgb2YgZm9ybSBcIihzb21ldGhpbmcpXCJcbmZ1bmN0aW9uIGlzRW5jbG9zZWRJblBhcmVucyhzdHIpIHtcbiAgcmV0dXJuIHN0clswXSA9PSAnKCcgJiYgc3RyW3N0ci5sZW5ndGgtMV0gPT0gJyknO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN1YnN0cmluZyBpcyBjb250YWluZWQgaW4gdGhlIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWlucyhzdHIsIHN1YnN0cikge1xuICByZXR1cm4gc3RyLmluZGV4T2Yoc3Vic3RyKSA+PSAwO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGFueSBvZiB0aGUgZ2l2ZW4gc3Vic3RyaW5ncyBpbiB0aGUgbGlzdCBpcyBjb250YWluZWQgaW4gdGhlIGZpcnN0IHBhcmFtZXRlciBzdHJpbmcgKGNhc2Ugc2Vuc2l0aXZlKVxuZnVuY3Rpb24gY29udGFpbnNBbnlPZihzdHIsIHN1YnN0ckxpc3QpIHtcbiAgZm9yKHZhciBpIGluIHN1YnN0ckxpc3QpIGlmIChjb250YWlucyhzdHIsIHN1YnN0ckxpc3RbaV0pKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbi8vIFNwbGl0cyBhbiB1c2VyIGFnZW50IHN0cmluZyBsb2dpY2FsbHkgaW50byBhbiBhcnJheSBvZiB0b2tlbnMsIGUuZy5cbi8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuLy8gLT4gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKScsICdBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKScsICdDaHJvbWUvNTEuMC4yNzA0LjgxJywgJ01vYmlsZSBTYWZhcmkvNTM3LjM2J11cbmZ1bmN0aW9uIHNwbGl0VXNlckFnZW50KHN0cikge1xuICBzdHIgPSBzdHIudHJpbSgpO1xuICB2YXIgdWFMaXN0ID0gW107XG4gIHZhciB0b2tlbnMgPSAnJztcbiAgLy8gU3BsaXQgYnkgc3BhY2VzLCB3aGlsZSBrZWVwaW5nIHRvcCBsZXZlbCBwYXJlbnRoZXNlcyBpbnRhY3QsIHNvXG4gIC8vIFwiTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xKSBNb2JpbGUgU2FmYXJpLzUzNy4zNlwiIGJlY29tZXNcbiAgLy8gWydNb3ppbGxhLzUuMCcsICcoTGludXg7IEFuZHJvaWQgNi4wLjEpJywgJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J11cbiAgdmFyIHBhcmVuc05lc3RpbmcgPSAwO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHN0cltpXSA9PSAnICcgJiYgcGFyZW5zTmVzdGluZyA9PSAwKSB7XG4gICAgICBpZiAodG9rZW5zLnRyaW0oKS5sZW5ndGggIT0gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG4gICAgICB0b2tlbnMgPSAnJztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PSAnKCcpICsrcGFyZW5zTmVzdGluZztcbiAgICBlbHNlIGlmIChzdHJbaV0gPT0gJyknKSAtLXBhcmVuc05lc3Rpbmc7XG4gICAgdG9rZW5zID0gdG9rZW5zICsgc3RyW2ldO1xuICB9XG4gIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCA+IDApIHVhTGlzdC5wdXNoKHRva2Vucy50cmltKCkpO1xuXG4gIC8vIFdoYXQgZm9sbG93cyBpcyBhIG51bWJlciBvZiBoZXVyaXN0aWMgYWRhcHRhdGlvbnMgdG8gYWNjb3VudCBmb3IgVUEgc3RyaW5ncyBtZXQgaW4gdGhlIHdpbGQ6XG5cbiAgLy8gRnVzZSBbJ2EvdmVyJywgJyhzb21laW5mbyknXSB0b2dldGhlci4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlICdBcHBsZVdlYktpdC81MzcuMzYnIGFuZCAnKEtIVE1MLCBsaWtlIEdlY2tvKScgdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMTsgaSA8IHVhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBsID0gdWFMaXN0W2ldO1xuICAgIGlmIChpc0VuY2xvc2VkSW5QYXJlbnMobCkgJiYgIWNvbnRhaW5zKGwsICc7JykgJiYgaSA+IDEpIHtcbiAgICAgIHVhTGlzdFtpLTFdID0gdWFMaXN0W2ktMV0gKyAnICcgKyBsO1xuICAgICAgdWFMaXN0W2ldID0gJyc7XG4gICAgfVxuICB9XG4gIHVhTGlzdCA9IHJlbW92ZUVtcHR5RWxlbWVudHModWFMaXN0KTtcblxuICAvLyBGdXNlIFsnZm9vJywgJ2Jhci92ZXInXSB0b2dldGhlciwgaWYgJ2ZvbycgaGFzIG9ubHkgYXNjaWkgY2hhcnMuIEZvciBleGFtcGxlOlxuICAvLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbiAgLy8gLT4gZnVzZSBbJ01vYmlsZScsICdTYWZhcmkvNTM3LjM2J10gdG9nZXRoZXJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHVhTGlzdC5sZW5ndGgtMTsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgdmFyIG5leHQgPSB1YUxpc3RbaSsxXTtcbiAgICBpZiAoL15bYS16QS1aXSskLy50ZXN0KGwpICYmIGNvbnRhaW5zKG5leHQsICcvJykpIHtcbiAgICAgIHVhTGlzdFtpKzFdID0gbCArICcgJyArIG5leHQ7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuICByZXR1cm4gdWFMaXN0O1xufVxuXG4vLyBGaW5kcyB0aGUgc3BlY2lhbCB0b2tlbiBpbiB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0IHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHBsYXRmb3JtIGluZm8uXG4vLyBUaGlzIGlzIHRoZSBmaXJzdCBlbGVtZW50IGNvbnRhaW5lZCBpbiBwYXJlbnRoZXNlcyB0aGF0IGhhcyBzZW1pY29sb24gZGVsaW1pdGVkIGVsZW1lbnRzLlxuLy8gUmV0dXJucyB0aGUgcGxhdGZvcm0gaW5mbyBhcyBhbiBhcnJheSBzcGxpdCBieSB0aGUgc2VtaWNvbG9ucy5cbmZ1bmN0aW9uIHNwbGl0UGxhdGZvcm1JbmZvKHVhTGlzdCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGl0ZW0gPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhpdGVtKSkge1xuICAgICAgcmV0dXJuIHJlbW92ZUVtcHR5RWxlbWVudHModHJpbVNwYWNlc0luRWFjaEVsZW1lbnQoaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGgtMikuc3BsaXQoJzsnKSkpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBEZWR1Y2VzIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGZyb20gdGhlIHVzZXIgYWdlbnQgcGxhdGZvcm0gaW5mbyB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gZmluZE9TKHVhUGxhdGZvcm1JbmZvKSB7XG4gIHZhciBvc2VzID0gWydBbmRyb2lkJywgJ0JTRCcsICdMaW51eCcsICdXaW5kb3dzJywgJ2lQaG9uZSBPUycsICdNYWMgT1MnLCAnQlNEJywgJ0NyT1MnLCAnRGFyd2luJywgJ0RyYWdvbmZseScsICdGZWRvcmEnLCAnR2VudG9vJywgJ1VidW50dScsICdkZWJpYW4nLCAnSFAtVVgnLCAnSVJJWCcsICdTdW5PUycsICdNYWNpbnRvc2gnLCAnV2luIDl4JywgJ1dpbjk4JywgJ1dpbjk1JywgJ1dpbk5UJ107XG4gIGZvcih2YXIgb3MgaW4gb3Nlcykge1xuICAgIGZvcih2YXIgaSBpbiB1YVBsYXRmb3JtSW5mbykge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtLCBvc2VzW29zXSkpIHJldHVybiBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gJ090aGVyJztcbn1cblxuLy8gRmlsdGVycyB0aGUgcHJvZHVjdCBjb21wb25lbnRzIChpdGVtcyBvZiBmb3JtYXQgJ2Zvby92ZXJzaW9uJykgZnJvbSB0aGUgdXNlciBhZ2VudCB0b2tlbiBsaXN0LlxuZnVuY3Rpb24gcGFyc2VQcm9kdWN0Q29tcG9uZW50cyh1YUxpc3QpIHtcbiAgdWFMaXN0ID0gdWFMaXN0LmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiBjb250YWlucyh4LCAnLycpICYmICFpc0VuY2xvc2VkSW5QYXJlbnMoeCk7IH0pO1xuICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSB7fTtcbiAgZm9yKHZhciBpIGluIHVhTGlzdCkge1xuICAgIHZhciB4ID0gdWFMaXN0W2ldO1xuICAgIGlmIChjb250YWlucyh4LCAnLycpKSB7XG4gICAgICB4ID0geC5zcGxpdCgnLycpO1xuICAgICAgaWYgKHgubGVuZ3RoICE9IDIpIHRocm93IHVhTGlzdFtpXTtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hbMF0udHJpbSgpXSA9IHhbMV0udHJpbSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9kdWN0Q29tcG9uZW50c1t4XSA9IHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcm9kdWN0Q29tcG9uZW50cztcbn1cblxuLy8gTWFwcyBXaW5kb3dzIE5UIHZlcnNpb24gdG8gaHVtYW4tcmVhZGFibGUgV2luZG93cyBQcm9kdWN0IHZlcnNpb25cbmZ1bmN0aW9uIHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKHdpbk5UVmVyc2lvbikge1xuICB2YXIgdmVycyA9IHtcbiAgICAnNS4wJzogJzIwMDAnLFxuICAgICc1LjEnOiAnWFAnLFxuICAgICc1LjInOiAnWFAnLFxuICAgICc2LjAnOiAnVmlzdGEnLFxuICAgICc2LjEnOiAnNycsXG4gICAgJzYuMic6ICc4JyxcbiAgICAnNi4zJzogJzguMScsXG4gICAgJzEwLjAnOiAnMTAnXG4gIH1cbiAgaWYgKCF2ZXJzW3dpbk5UVmVyc2lvbl0pIHJldHVybiAnTlQgJyArIHdpbk5UVmVyc2lvbjtcbiAgcmV0dXJuIHZlcnNbd2luTlRWZXJzaW9uXTtcbn1cblxuLy8gVGhlIGZ1bGwgZnVuY3Rpb24gdG8gZGVjb21wb3NlIGEgZ2l2ZW4gdXNlciBhZ2VudCB0byB0aGUgaW50ZXJlc3RpbmcgbG9naWNhbCBpbmZvIGJpdHMuXG4vLyBcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZHVjZVVzZXJBZ2VudCh1c2VyQWdlbnQpIHtcbiAgdXNlckFnZW50ID0gdXNlckFnZW50IHx8IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gIHZhciB1YSA9IHtcbiAgICB1c2VyQWdlbnQ6IHVzZXJBZ2VudCxcbiAgICBwcm9kdWN0Q29tcG9uZW50czoge30sXG4gICAgcGxhdGZvcm1JbmZvOiBbXVxuICB9O1xuXG4gIHRyeSB7XG4gICAgdmFyIHVhTGlzdCA9IHNwbGl0VXNlckFnZW50KHVzZXJBZ2VudCk7XG4gICAgdmFyIHVhUGxhdGZvcm1JbmZvID0gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KTtcbiAgICB2YXIgcHJvZHVjdENvbXBvbmVudHMgPSBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCk7XG4gICAgdWEucHJvZHVjdENvbXBvbmVudHMgPSBwcm9kdWN0Q29tcG9uZW50cztcbiAgICB1YS5wbGF0Zm9ybUluZm8gPSB1YVBsYXRmb3JtSW5mbztcbiAgICB2YXIgdWFsID0gdXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBEZWR1Y2UgYXJjaCBhbmQgYml0bmVzc1xuICAgIHZhciBiMzJPbjY0ID0gWyd3b3c2NCddO1xuICAgIGlmIChjb250YWlucyh1YWwsICd3b3c2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gJzMyLW9uLTY0JztcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ3g4Nl82NCcsICdhbWQ2NCcsICdpYTY0JywgJ3dpbjY0JywgJ3g2NCddKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAncHBjNjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICdQUEMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnc3BhcmM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1NQQVJDJztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zQW55T2YodWFsLCBbJ2kzODYnLCAnaTQ4NicsICdpNTg2JywgJ2k2ODYnLCAneDg2J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ3g4Nic7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdhcm03JykgfHwgY29udGFpbnModWFsLCAnYW5kcm9pZCcpIHx8IGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgLy8gSGV1cmlzdGljOiBBc3N1bWUgYWxsIE9TIFggYXJlIDY0LWJpdCwgYWx0aG91Z2ggdGhpcyBpcyBub3QgY2VydGFpbi4gT24gT1MgWCwgNjQtYml0IGJyb3dzZXJzXG4gICAgLy8gZG9uJ3QgYWR2ZXJ0aXNlIGJlaW5nIDY0LWJpdC5cbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2ludGVsIG1hYyBvcycpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2Ugb3BlcmF0aW5nIHN5c3RlbVxuICAgIHZhciBvcyA9IGZpbmRPUyh1YVBsYXRmb3JtSW5mbyk7XG4gICAgdmFyIG0gPSBvcy5tYXRjaCgnKC4qKVxcXFxzK01hYyBPUyBYXFxcXHMrKC4qKScpO1xuICAgIGlmIChtKSB7XG4gICAgICB1YS5wbGF0Zm9ybSA9ICdNYWMnO1xuICAgICAgdWEuYXJjaCA9IG1bMV07XG4gICAgICB1YS5vcyA9ICdNYWMgT1MnO1xuICAgICAgdWEub3NWZXJzaW9uID0gbVsyXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdBbmRyb2lkXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zID0gJ0FuZHJvaWQnO1xuICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBvcy5tYXRjaCgnV2luZG93cyBOVFxcXFxzKyguKiknKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ1BDJztcbiAgICAgICAgdWEub3MgPSAnV2luZG93cyc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IHdpbmRvd3NEaXN0cmlidXRpb25OYW1lKG1bMV0pO1xuICAgICAgICBpZiAoIXVhLmFyY2gpIHVhLmFyY2ggPSAneDg2JztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBpZiAoY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUGhvbmUnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQYWQnKSB8fCBjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQb2QnKSB8fCBjb250YWlucyhvcywgJ2lQaG9uZScpIHx8IG9zLmluZGV4T2YoJ0NQVSBPUycpID09IDApIHtcbiAgICAgICAgbSA9IG9zLm1hdGNoKCcuKk9TICguKikgbGlrZSBNYWMgT1MgWCcpO1xuICAgICAgICBpZiAobSkge1xuICAgICAgICAgIHVhLnBsYXRmb3JtID0gdWFQbGF0Zm9ybUluZm9bMF07XG4gICAgICAgICAgdWEub3MgPSAnaU9TJztcbiAgICAgICAgICB1YS5vc1ZlcnNpb24gPSBtWzFdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICAgICAgICB1YS5iaXRuZXNzID0gcGFyc2VJbnQodWEub3NWZXJzaW9uKSA+PSA3ID8gNjQgOiAzMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gIFxuICAgIGlmICghbSkge1xuICAgICAgbSA9IGNvbnRhaW5zKG9zLCAnQlNEJykgfHwgY29udGFpbnMob3MsICdMaW51eCcpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9IG9zLnNwbGl0KCcgJylbMF07XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIHVhLm9zID0gb3M7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZFByb2R1Y3QocHJvZHVjdENvbXBvbmVudHMsIHByb2R1Y3QpIHtcbiAgICAgIGZvcih2YXIgaSBpbiBwcm9kdWN0Q29tcG9uZW50cykge1xuICAgICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbaV0gPT0gcHJvZHVjdCkgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGh1bWFuLXJlYWRhYmxlIGJyb3dzZXIgdmVuZG9yLCBwcm9kdWN0IGFuZCB2ZXJzaW9uIG5hbWVzXG4gICAgdmFyIGJyb3dzZXJzID0gW1snU2Ftc3VuZ0Jyb3dzZXInLCAnU2Ftc3VuZyddLCBbJ0VkZ2UnLCAnTWljcm9zb2Z0J10sIFsnT1BSJywgJ09wZXJhJ10sIFsnQ2hyb21lJywgJ0dvb2dsZSddLCBbJ1NhZmFyaScsICdBcHBsZSddLCBbJ0ZpcmVmb3gnLCAnTW96aWxsYSddXTtcbiAgICBmb3IodmFyIGkgaW4gYnJvd3NlcnMpIHtcbiAgICAgIHZhciBiID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICBpZiAocHJvZHVjdENvbXBvbmVudHNbYl0pIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9IGJyb3dzZXJzW2ldWzFdO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9IGJyb3dzZXJzW2ldWzBdO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ09QUicpIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ09wZXJhJztcbiAgICAgICAgaWYgKHVhLmJyb3dzZXJQcm9kdWN0ID09ICdUcmlkZW50JykgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IHByb2R1Y3RDb21wb25lbnRzW2JdO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRGV0ZWN0IElFc1xuICAgIGlmICghdWEuYnJvd3NlclByb2R1Y3QpIHtcbiAgICAgIHZhciBtYXRjaElFID0gdXNlckFnZW50Lm1hdGNoKC9NU0lFXFxzKFtcXGQuXSspLyk7XG4gICAgICBpZiAobWF0Y2hJRSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSBtYXRjaElFWzFdO1xuICAgICAgfSBlbHNlIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mbywgJ1RyaWRlbnQvNy4wJykpIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9ICdNaWNyb3NvZnQnO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gIHVzZXJBZ2VudC5tYXRjaCgvcnY6KFtcXGQuXSspLylbMV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIG1vYmlsZSBwbGF0Zm9ybSwgaWYgcHJlc2VudFxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB1YVBsYXRmb3JtSW5mby5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIGl0ZW0gPSB1YVBsYXRmb3JtSW5mb1tpXTtcbiAgICAgIHZhciBpdGVtbCA9IGl0ZW0udG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChjb250YWlucyhpdGVtbCwgJ25leHVzJykgfHwgY29udGFpbnMoaXRlbWwsICdzYW1zdW5nJykpIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSBpdGVtO1xuICAgICAgICB1YS5hcmNoID0gJ0FSTSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZHVjZSBmb3JtIGZhY3RvclxuICAgIGlmIChjb250YWlucyh1YWwsICd0YWJsZXQnKSB8fCBjb250YWlucyh1YWwsICdpcGFkJykpIHVhLmZvcm1GYWN0b3IgPSAnVGFibGV0JztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdtb2JpbGUnKSB8fCBjb250YWlucyh1YWwsICdpcGhvbmUnKSB8fCBjb250YWlucyh1YWwsICdpcG9kJykpIHVhLmZvcm1GYWN0b3IgPSAnTW9iaWxlJztcbiAgICBlbHNlIGlmIChjb250YWlucyh1YWwsICdzbWFydCB0dicpIHx8IGNvbnRhaW5zKHVhbCwgJ3NtYXJ0LXR2JykpIHVhLmZvcm1GYWN0b3IgPSAnVFYnO1xuICAgIGVsc2UgdWEuZm9ybUZhY3RvciA9ICdEZXNrdG9wJztcbiAgfSBjYXRjaChlKSB7XG4gICAgdWEuaW50ZXJuYWxFcnJvciA9ICdGYWlsZWQgdG8gcGFyc2UgdXNlciBhZ2VudCBzdHJpbmc6ICcgKyBlLnRvU3RyaW5nKCk7XG4gIH1cblxuICByZXR1cm4gdWE7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBlc3RpbWF0ZVZTeW5jUmF0ZSgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlID0+IHtcbiAgICB2YXIgbnVtRnJhbWVzVG9SdW4gPSA2MDtcbiAgICB2YXIgdDAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB2YXIgZGVsdGFzID0gW107XG4gICAgZnVuY3Rpb24gdGljaygpIHtcbiAgICAgIHZhciB0MSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgZGVsdGFzLnB1c2godDEtdDApO1xuICAgICAgdDAgPSB0MTtcbiAgICAgIGlmICgtLW51bUZyYW1lc1RvUnVuID4gMCkge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWx0YXMuc29ydCgpO1xuICAgICAgICBkZWx0YXMgPSBkZWx0YXMuc2xpY2UoKGRlbHRhcy5sZW5ndGggLyAzKXwwLCAoKDIgKiBkZWx0YXMubGVuZ3RoICsgMikgLyAzKXwwKTtcbiAgICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICAgIGZvcih2YXIgaSBpbiBkZWx0YXMpIHN1bSArPSBkZWx0YXNbaV07XG4gICAgICAgIHJlc29sdmUoMTAwMC4wIC8gKHN1bS9kZWx0YXMubGVuZ3RoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgdXNlckFnZW50SW5mbyBmcm9tICd1c2VyYWdlbnQtaW5mbyc7XG5pbXBvcnQgZXN0aW1hdGVWU3luY1JhdGUgZnJvbSAndnN5bmMtZXN0aW1hdGUnO1xuXG5mdW5jdGlvbiBlbmRpYW5uZXNzKCkge1xuICB2YXIgaGVhcCA9IG5ldyBBcnJheUJ1ZmZlcigweDEwMDAwKTtcbiAgdmFyIGkzMiA9IG5ldyBJbnQzMkFycmF5KGhlYXApO1xuICB2YXIgdTMyID0gbmV3IFVpbnQzMkFycmF5KGhlYXApO1xuICB2YXIgdTE2ID0gbmV3IFVpbnQxNkFycmF5KGhlYXApO1xuICB1MzJbNjRdID0gMHg3RkZGMDEwMDtcbiAgdmFyIHR5cGVkQXJyYXlFbmRpYW5uZXNzO1xuICBpZiAodTE2WzEyOF0gPT09IDB4N0ZGRiAmJiB1MTZbMTI5XSA9PT0gMHgwMTAwKSB0eXBlZEFycmF5RW5kaWFubmVzcyA9ICdiaWcgZW5kaWFuJztcbiAgZWxzZSBpZiAodTE2WzEyOF0gPT09IDB4MDEwMCAmJiB1MTZbMTI5XSA9PT0gMHg3RkZGKSB0eXBlZEFycmF5RW5kaWFubmVzcyA9ICdsaXR0bGUgZW5kaWFuJztcbiAgZWxzZSB0eXBlZEFycmF5RW5kaWFubmVzcyA9ICd1bmtub3duISAoYSBicm93c2VyIGJ1Zz8pIChzaG9ydCAxOiAnICsgdTE2WzEyOF0udG9TdHJpbmcoMTYpICsgJywgc2hvcnQgMjogJyArIHUxNlsxMjldLnRvU3RyaW5nKDE2KSArICcpJztcbiAgcmV0dXJuIHR5cGVkQXJyYXlFbmRpYW5uZXNzOyAgXG59XG5cbmZ1bmN0aW9uIHBhZExlbmd0aExlZnQocywgbGVuLCBjaCkge1xuICBpZiAoY2ggPT09IHVuZGVmaW5lZCkgY2ggPSAnICc7XG4gIHdoaWxlKHMubGVuZ3RoIDwgbGVuKSBzID0gY2ggKyBzO1xuICByZXR1cm4gcztcbn1cblxuLy8gUGVyZm9ybXMgdGhlIGJyb3dzZXIgZmVhdHVyZSB0ZXN0LiBJbW1lZGlhdGVseSByZXR1cm5zIGEgSlMgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHJlc3VsdHMgb2YgYWxsIHN5bmNocm9ub3VzbHkgY29tcHV0YWJsZSBmaWVsZHMsIGFuZCBsYXVuY2hlcyBhc3luY2hyb25vdXNcbi8vIHRhc2tzIHRoYXQgcGVyZm9ybSB0aGUgcmVtYWluaW5nIHRlc3RzLiBPbmNlIHRoZSBhc3luYyB0YXNrcyBoYXZlIGZpbmlzaGVkLCB0aGUgZ2l2ZW4gc3VjY2Vzc0NhbGxiYWNrIGZ1bmN0aW9uIGlzIGNhbGxlZCwgd2l0aCB0aGUgZnVsbCBicm93c2VyIGZlYXR1cmUgdGVzdFxuLy8gcmVzdWx0cyBvYmplY3QgYXMgdGhlIGZpcnN0IHBhcmFtZXRlci5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJyb3dzZXJGZWF0dXJlVGVzdChzdWNjZXNzQ2FsbGJhY2spIHtcbiAgdmFyIGFwaXMgPSB7fTtcbiAgZnVuY3Rpb24gc2V0QXBpU3VwcG9ydChhcGluYW1lLCBjbXApIHtcbiAgICBpZiAoY21wKSBhcGlzW2FwaW5hbWVdID0gdHJ1ZTtcbiAgICBlbHNlIGFwaXNbYXBpbmFtZV0gPSBmYWxzZTtcbiAgfVxuXG4gIHNldEFwaVN1cHBvcnQoJ01hdGhfaW11bCcsIHR5cGVvZiBNYXRoLmltdWwgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnTWF0aF9mcm91bmQnLCB0eXBlb2YgTWF0aC5mcm91bmQgIT09ICd1bmRlZmluZWQnKTsgIFxuICBzZXRBcGlTdXBwb3J0KCdBcnJheUJ1ZmZlcl90cmFuc2ZlcicsIHR5cGVvZiBBcnJheUJ1ZmZlci50cmFuc2ZlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBdWRpbycsIHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnUG9pbnRlckxvY2snLCBkb2N1bWVudC5ib2R5LnJlcXVlc3RQb2ludGVyTG9jayB8fCBkb2N1bWVudC5ib2R5Lm1velJlcXVlc3RQb2ludGVyTG9jayB8fCBkb2N1bWVudC5ib2R5LndlYmtpdFJlcXVlc3RQb2ludGVyTG9jayB8fCBkb2N1bWVudC5ib2R5Lm1zUmVxdWVzdFBvaW50ZXJMb2NrKTtcbiAgc2V0QXBpU3VwcG9ydCgnRnVsbHNjcmVlbkFQSScsIGRvY3VtZW50LmJvZHkucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQuYm9keS5tc1JlcXVlc3RGdWxsc2NyZWVuIHx8IGRvY3VtZW50LmJvZHkubW96UmVxdWVzdEZ1bGxTY3JlZW4gfHwgZG9jdW1lbnQuYm9keS53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbik7XG4gIHZhciBoYXNCbG9iQ29uc3RydWN0b3IgPSBmYWxzZTtcbiAgdHJ5IHsgbmV3IEJsb2IoKTsgaGFzQmxvYkNvbnN0cnVjdG9yID0gdHJ1ZTsgfSBjYXRjaChlKSB7IH1cbiAgc2V0QXBpU3VwcG9ydCgnQmxvYicsIGhhc0Jsb2JDb25zdHJ1Y3Rvcik7XG4gIGlmICghaGFzQmxvYkNvbnN0cnVjdG9yKSBzZXRBcGlTdXBwb3J0KCdCbG9iQnVpbGRlcicsIHR5cGVvZiBCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIE1vekJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgV2ViS2l0QmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnU2hhcmVkQXJyYXlCdWZmZXInLCB0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnaGFyZHdhcmVDb25jdXJyZW5jeScsIHR5cGVvZiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdTSU1EanMnLCB0eXBlb2YgU0lNRCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJXb3JrZXJzJywgdHlwZW9mIFdvcmtlciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJBc3NlbWJseScsIHR5cGVvZiBXZWJBc3NlbWJseSAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdHYW1lcGFkQVBJJywgbmF2aWdhdG9yLmdldEdhbWVwYWRzIHx8IG5hdmlnYXRvci53ZWJraXRHZXRHYW1lcGFkcyk7XG4gIHZhciBoYXNJbmRleGVkREIgPSBmYWxzZTtcbiAgdHJ5IHsgaGFzSW5kZXhlZERCID0gdHlwZW9mIGluZGV4ZWREQiAhPT0gJ3VuZGVmaW5lZCc7IH0gY2F0Y2ggKGUpIHt9XG4gIHNldEFwaVN1cHBvcnQoJ0luZGV4ZWREQicsIGhhc0luZGV4ZWREQik7XG4gIHNldEFwaVN1cHBvcnQoJ1Zpc2liaWxpdHlBUEknLCB0eXBlb2YgZG9jdW1lbnQudmlzaWJpbGl0eVN0YXRlICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgncGVyZm9ybWFuY2Vfbm93JywgdHlwZW9mIHBlcmZvcm1hbmNlICE9PSAndW5kZWZpbmVkJyAmJiBwZXJmb3JtYW5jZS5ub3cpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJTb2NrZXRzJywgdHlwZW9mIFdlYlNvY2tldCAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJSVEMnLCB0eXBlb2YgUlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBtb3pSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHdlYmtpdFJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgbXNSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdWaWJyYXRpb25BUEknLCBuYXZpZ2F0b3IudmlicmF0ZSk7XG4gIHNldEFwaVN1cHBvcnQoJ1NjcmVlbk9yaWVudGF0aW9uQVBJJywgd2luZG93LnNjcmVlbiAmJiAod2luZG93LnNjcmVlbi5vcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1vek9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ud2Via2l0T3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi5tc09yaWVudGF0aW9uKSk7XG4gIHNldEFwaVN1cHBvcnQoJ0dlb2xvY2F0aW9uQVBJJywgbmF2aWdhdG9yLmdlb2xvY2F0aW9uKTtcbiAgc2V0QXBpU3VwcG9ydCgnQmF0dGVyeVN0YXR1c0FQSScsIG5hdmlnYXRvci5nZXRCYXR0ZXJ5KTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQXNzZW1ibHknLCB0eXBlb2YgV2ViQXNzZW1ibHkgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViVlInLCB0eXBlb2YgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViWFInLCB0eXBlb2YgbmF2aWdhdG9yLnhyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ09mZnNjcmVlbkNhbnZhcycsIHR5cGVvZiBPZmZzY3JlZW5DYW52YXMgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQ29tcG9uZW50cycsICdyZWdpc3RlckVsZW1lbnQnIGluIGRvY3VtZW50ICYmICdpbXBvcnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKSAmJiAnY29udGVudCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGVtcGxhdGUnKSk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB2YXIgd2ViR0xTdXBwb3J0ID0ge307XG4gIHZhciBiZXN0R0xDb250ZXh0ID0gbnVsbDsgLy8gVGhlIEdMIGNvbnRleHRzIGFyZSB0ZXN0ZWQgZnJvbSBiZXN0IHRvIHdvcnN0IChuZXdlc3QgdG8gb2xkZXN0KSwgYW5kIHRoZSBtb3N0IGRlc2lyYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnRleHQgaXMgc3RvcmVkIGhlcmUgZm9yIGxhdGVyIHVzZS5cbiAgZnVuY3Rpb24gdGVzdFdlYkdMU3VwcG9ydChjb250ZXh0TmFtZSwgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCkge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgZXJyb3JSZWFzb24gPSAnJztcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIndlYmdsY29udGV4dGNyZWF0aW9uZXJyb3JcIiwgZnVuY3Rpb24oZSkgeyBlcnJvclJlYXNvbiA9IGUuc3RhdHVzTWVzc2FnZTsgfSwgZmFsc2UpO1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoY29udGV4dE5hbWUsIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQgPyB7IGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQ6IHRydWUgfSA6IHt9KTtcbiAgICBpZiAoY29udGV4dCAmJiAhZXJyb3JSZWFzb24pIHtcbiAgICAgIGlmICghYmVzdEdMQ29udGV4dCkgYmVzdEdMQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICB2YXIgcmVzdWx0cyA9IHsgc3VwcG9ydGVkOiB0cnVlLCBwZXJmb3JtYW5jZUNhdmVhdDogIWZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQgfTtcbiAgICAgIGlmIChjb250ZXh0TmFtZSA9PSAnZXhwZXJpbWVudGFsLXdlYmdsJykgcmVzdWx0c1snZXhwZXJpbWVudGFsLXdlYmdsJ10gPSB0cnVlO1xuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfVxuICAgIGVsc2UgcmV0dXJuIHsgc3VwcG9ydGVkOiBmYWxzZSwgZXJyb3JSZWFzb246IGVycm9yUmVhc29uIH07XG4gIH1cblxuICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wyJywgdHJ1ZSk7XG4gIGlmICghd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5zdXBwb3J0ZWQpIHtcbiAgICB2YXIgc29mdHdhcmVXZWJHTDIgPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbDInLCBmYWxzZSk7XG4gICAgaWYgKHNvZnR3YXJlV2ViR0wyLnN1cHBvcnRlZCkge1xuICAgICAgc29mdHdhcmVXZWJHTDIuaGFyZHdhcmVFcnJvclJlYXNvbiA9IHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uZXJyb3JSZWFzb247IC8vIENhcHR1cmUgdGhlIHJlYXNvbiB3aHkgaGFyZHdhcmUgV2ViR0wgMiBjb250ZXh0IGRpZCBub3Qgc3VjY2VlZC5cbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10gPSBzb2Z0d2FyZVdlYkdMMjtcbiAgICB9XG4gIH1cblxuICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wnLCB0cnVlKTtcbiAgaWYgKCF3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLnN1cHBvcnRlZCkge1xuICAgIHZhciBleHBlcmltZW50YWxXZWJHTCA9IHRlc3RXZWJHTFN1cHBvcnQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIHRydWUpO1xuICAgIGlmIChleHBlcmltZW50YWxXZWJHTC5zdXBwb3J0ZWQgfHwgKGV4cGVyaW1lbnRhbFdlYkdMLmVycm9yUmVhc29uICYmICF3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLmVycm9yUmVhc29uKSkge1xuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IGV4cGVyaW1lbnRhbFdlYkdMO1xuICAgIH1cbiAgfVxuXG4gIGlmICghd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5zdXBwb3J0ZWQpIHtcbiAgICB2YXIgc29mdHdhcmVXZWJHTDEgPSB0ZXN0V2ViR0xTdXBwb3J0KCd3ZWJnbCcsIGZhbHNlKTtcbiAgICBpZiAoIXNvZnR3YXJlV2ViR0wxLnN1cHBvcnRlZCkge1xuICAgICAgdmFyIGV4cGVyaW1lbnRhbFdlYkdMID0gdGVzdFdlYkdMU3VwcG9ydCgnZXhwZXJpbWVudGFsLXdlYmdsJywgZmFsc2UpO1xuICAgICAgaWYgKGV4cGVyaW1lbnRhbFdlYkdMLnN1cHBvcnRlZCB8fCAoZXhwZXJpbWVudGFsV2ViR0wuZXJyb3JSZWFzb24gJiYgIXNvZnR3YXJlV2ViR0wxLmVycm9yUmVhc29uKSkge1xuICAgICAgICBzb2Z0d2FyZVdlYkdMMSA9IGV4cGVyaW1lbnRhbFdlYkdMO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzb2Z0d2FyZVdlYkdMMS5zdXBwb3J0ZWQpIHtcbiAgICAgIHNvZnR3YXJlV2ViR0wxLmhhcmR3YXJlRXJyb3JSZWFzb24gPSB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddLmVycm9yUmVhc29uOyAvLyBDYXB0dXJlIHRoZSByZWFzb24gd2h5IGhhcmR3YXJlIFdlYkdMIDEgY29udGV4dCBkaWQgbm90IHN1Y2NlZWQuXG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMSddID0gc29mdHdhcmVXZWJHTDE7XG4gICAgfVxuICB9XG5cbiAgc2V0QXBpU3VwcG9ydCgnV2ViR0wxJywgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5zdXBwb3J0ZWQpO1xuICBzZXRBcGlTdXBwb3J0KCdXZWJHTDInLCB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLnN1cHBvcnRlZCk7XG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgdmFyIHJlc3VsdHMgPSB7XG4gICAgdXNlckFnZW50OiB1c2VyQWdlbnRJbmZvKG5hdmlnYXRvci51c2VyQWdlbnQpLFxuICAgIG5hdmlnYXRvcjoge1xuICAgICAgYnVpbGRJRDogbmF2aWdhdG9yLmJ1aWxkSUQsXG4gICAgICBhcHBWZXJzaW9uOiBuYXZpZ2F0b3IuYXBwVmVyc2lvbixcbiAgICAgIG9zY3B1OiBuYXZpZ2F0b3Iub3NjcHUsXG4gICAgICBwbGF0Zm9ybTogbmF2aWdhdG9yLnBsYXRmb3JtICBcbiAgICB9LFxuICAgIC8vIGRpc3BsYXlSZWZyZXNoUmF0ZTogZGlzcGxheVJlZnJlc2hSYXRlLCAvLyBXaWxsIGJlIGFzeW5jaHJvbm91c2x5IGZpbGxlZCBpbiBvbiBmaXJzdCBydW4sIGRpcmVjdGx5IGZpbGxlZCBpbiBsYXRlci5cbiAgICBkaXNwbGF5OiB7XG4gICAgICB3aW5kb3dEZXZpY2VQaXhlbFJhdGlvOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW4ud2lkdGgsXG4gICAgICBzY3JlZW5IZWlnaHQ6IHNjcmVlbi5oZWlnaHQsXG4gICAgICBwaHlzaWNhbFNjcmVlbldpZHRoOiBzY3JlZW4ud2lkdGggKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbiAgICAgIHBoeXNpY2FsU2NyZWVuSGVpZ2h0OiBzY3JlZW4uaGVpZ2h0ICogd2luZG93LmRldmljZVBpeGVsUmF0aW8sICBcbiAgICB9LFxuICAgIGhhcmR3YXJlQ29uY3VycmVuY3k6IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5LCAvLyBJZiBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdGhpcywgd2lsbCBiZSBhc3luY2hyb25vdXNseSBmaWxsZWQgaW4gYnkgY29yZSBlc3RpbWF0b3IuXG4gICAgYXBpU3VwcG9ydDogYXBpcyxcbiAgICB0eXBlZEFycmF5RW5kaWFubmVzczogZW5kaWFubmVzcygpXG4gIH07XG5cbiAgLy8gU29tZSBmaWVsZHMgZXhpc3QgZG9uJ3QgYWx3YXlzIGV4aXN0XG4gIHZhciBvcHRpb25hbEZpZWxkcyA9IFsndmVuZG9yJywgJ3ZlbmRvclN1YicsICdwcm9kdWN0JywgJ3Byb2R1Y3RTdWInLCAnbGFuZ3VhZ2UnLCAnYXBwQ29kZU5hbWUnLCAnYXBwTmFtZScsICdtYXhUb3VjaFBvaW50cycsICdwb2ludGVyRW5hYmxlZCcsICdjcHVDbGFzcyddO1xuICBmb3IodmFyIGkgaW4gb3B0aW9uYWxGaWVsZHMpIHtcbiAgICB2YXIgZiA9IG9wdGlvbmFsRmllbGRzW2ldO1xuICAgIGlmIChuYXZpZ2F0b3JbZl0pIHsgcmVzdWx0cy5uYXZpZ2F0b3JbZl0gPSBuYXZpZ2F0b3JbZl07IH1cbiAgfVxuLypcbiAgdmFyIG51bUNvcmVzQ2hlY2tlZCA9IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5ID4gMDtcblxuICAvLyBPbiBmaXJzdCBydW4sIGVzdGltYXRlIHRoZSBudW1iZXIgb2YgY29yZXMgaWYgbmVlZGVkLlxuICBpZiAoIW51bUNvcmVzQ2hlY2tlZCkge1xuICAgIGlmIChuYXZpZ2F0b3IuZ2V0SGFyZHdhcmVDb25jdXJyZW5jeSkge1xuICAgICAgbmF2aWdhdG9yLmdldEhhcmR3YXJlQ29uY3VycmVuY3koZnVuY3Rpb24oY29yZXMpIHtcbiAgICAgICAgcmVzdWx0cy5oYXJkd2FyZUNvbmN1cnJlbmN5ID0gY29yZXM7XG4gICAgICAgIG51bUNvcmVzQ2hlY2tlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gSWYgdGhpcyB3YXMgdGhlIGxhc3QgYXN5bmMgdGFzaywgZmlyZSBzdWNjZXNzIGNhbGxiYWNrLlxuICAgICAgICBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IGlzIG5vdCBzdXBwb3J0ZWQsIGFuZCBubyBjb3JlIGVzdGltYXRvciBhdmFpbGFibGUgZWl0aGVyLlxuICAgICAgLy8gUmVwb3J0IG51bWJlciBvZiBjb3JlcyBhcyAwLlxuICAgICAgcmVzdWx0cy5oYXJkd2FyZUNvbmN1cnJlbmN5ID0gMDtcbiAgICAgIG51bUNvcmVzQ2hlY2tlZCA9IHRydWU7XG4gICAgfVxuICB9XG4qL1xuICBlc3RpbWF0ZVZTeW5jUmF0ZSgpLnRoZW4ocmVmcmVzaFJhdGUgPT4ge1xuICAgIHJlc3VsdHMucmVmcmVzaFJhdGUgPSBNYXRoLnJvdW5kKHJlZnJlc2hSYXRlKTtcbiAgICBpZiAoc3VjY2Vzc0NhbGxiYWNrKSBzdWNjZXNzQ2FsbGJhY2socmVzdWx0cyk7XG4gIH0pO1xuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGFzeW5jIHRhc2tzIHdlcmUgbmVlZGVkIHRvIGJlIGV4ZWN1dGVkLCBxdWV1ZSBzdWNjZXNzIGNhbGxiYWNrLlxuICAvLyBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc2V0VGltZW91dChmdW5jdGlvbigpIHsgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpOyB9LCAxKTtcblxuICAvLyBJZiBjYWxsZXIgaXMgbm90IGludGVyZXN0ZWQgaW4gYXN5bmNocm9ub3VzbHkgZmlsbGFibGUgZGF0YSwgYWxzbyByZXR1cm4gdGhlIHJlc3VsdHMgb2JqZWN0IGltbWVkaWF0ZWx5IGZvciB0aGUgc3luY2hyb25vdXMgYml0cy5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iLCJmdW5jdGlvbiBnZXRXZWJHTEluZm9CeVZlcnNpb24od2ViZ2xWZXJzaW9uKSB7XG4gIHZhciByZXBvcnQgPSB7XG4gICAgd2ViZ2xWZXJzaW9uOiB3ZWJnbFZlcnNpb25cbiAgfTtcblxuaWYgKCh3ZWJnbFZlcnNpb24gPT09IDIgJiYgIXdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB8fFxuICAgICh3ZWJnbFZlcnNpb24gPT09IDEgJiYgIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpKSB7XG4gICAgLy8gVGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBXZWJHTFxuICAgIHJlcG9ydC5jb250ZXh0TmFtZSA9IFwid2ViZ2wgbm90IHN1cHBvcnRlZFwiO1xuICAgIHJldHVybiByZXBvcnQ7XG59XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xudmFyIGdsLCBjb250ZXh0TmFtZTtcbnZhciBwb3NzaWJsZU5hbWVzID0gKHdlYmdsVmVyc2lvbiA9PT0gMikgPyBbXCJ3ZWJnbDJcIiwgXCJleHBlcmltZW50YWwtd2ViZ2wyXCJdIDogW1wid2ViZ2xcIiwgXCJleHBlcmltZW50YWwtd2ViZ2xcIl07XG5mb3IgKHZhciBpPTA7aTxwb3NzaWJsZU5hbWVzLmxlbmd0aDtpKyspIHtcbiAgdmFyIG5hbWUgPSBwb3NzaWJsZU5hbWVzW2ldO1xuICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWUsIHsgc3RlbmNpbDogdHJ1ZSB9KTtcbiAgaWYgKGdsKXtcbiAgICAgIGNvbnRleHROYW1lID0gbmFtZTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5jYW52YXMucmVtb3ZlKCk7XG5pZiAoIWdsKSB7XG4gICAgcmVwb3J0LmNvbnRleHROYW1lID0gXCJ3ZWJnbCBzdXBwb3J0ZWQgYnV0IGZhaWxlZCB0byBpbml0aWFsaXplXCI7XG4gICAgcmV0dXJuIHJlcG9ydDtcbn1cblxucmV0dXJuIE9iamVjdC5hc3NpZ24ocmVwb3J0LCB7XG4gICAgY29udGV4dE5hbWU6IGNvbnRleHROYW1lLFxuICAgIGdsVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlZFUlNJT04pLFxuICAgIHZlbmRvcjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlZFTkRPUiksXG4gICAgcmVuZGVyZXI6IGdsLmdldFBhcmFtZXRlcihnbC5SRU5ERVJFUiksXG4gICAgdW5NYXNrZWRWZW5kb3I6IGdldFVubWFza2VkSW5mbyhnbCkudmVuZG9yLFxuICAgIHVuTWFza2VkUmVuZGVyZXI6IGdldFVubWFza2VkSW5mbyhnbCkucmVuZGVyZXIsXG4gICAgYW5nbGU6IGdldEFuZ2xlKGdsKSxcbiAgICBhbnRpYWxpYXM6ICBnbC5nZXRDb250ZXh0QXR0cmlidXRlcygpLmFudGlhbGlhcyA/IFwiQXZhaWxhYmxlXCIgOiBcIk5vdCBhdmFpbGFibGVcIixcbiAgICBtYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiBnZXRNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KGNvbnRleHROYW1lKSxcbiAgICBiaXRzOiB7XG4gICAgICByZWRCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuUkVEX0JJVFMpLFxuICAgICAgZ3JlZW5CaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuR1JFRU5fQklUUyksXG4gICAgICBibHVlQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkJMVUVfQklUUyksXG4gICAgICBhbHBoYUJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5BTFBIQV9CSVRTKSxcbiAgICAgIGRlcHRoQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkRFUFRIX0JJVFMpLFxuICAgICAgc3RlbmNpbEJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5TVEVOQ0lMX0JJVFMpICBcbiAgICB9LFxuICAgIG1heGltdW06IHtcbiAgICAgIG1heENvbG9yQnVmZmVyczogZ2V0TWF4Q29sb3JCdWZmZXJzKGdsKSxcbiAgICAgIG1heFJlbmRlckJ1ZmZlclNpemU6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfUkVOREVSQlVGRkVSX1NJWkUpLFxuICAgICAgbWF4Q29tYmluZWRUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9DT01CSU5FRF9URVhUVVJFX0lNQUdFX1VOSVRTKSxcbiAgICAgIG1heEN1YmVNYXBUZXh0dXJlU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9DVUJFX01BUF9URVhUVVJFX1NJWkUpLFxuICAgICAgbWF4RnJhZ21lbnRVbmlmb3JtVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMpLFxuICAgICAgbWF4VGV4dHVyZUltYWdlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgICBtYXhUZXh0dXJlU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX1NJWkUpLFxuICAgICAgbWF4VmFyeWluZ1ZlY3RvcnM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkFSWUlOR19WRUNUT1JTKSxcbiAgICAgIG1heFZlcnRleEF0dHJpYnV0ZXM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX0FUVFJJQlMpLFxuICAgICAgbWF4VmVydGV4VGV4dHVyZUltYWdlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgICAgbWF4VmVydGV4VW5pZm9ybVZlY3RvcnM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1VOSUZPUk1fVkVDVE9SUyksICBcbiAgICAgIG1heFZpZXdwb3J0RGltZW5zaW9uczogZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZJRVdQT1JUX0RJTVMpKSxcbiAgICAgIG1heEFuaXNvdHJvcHk6IGdldE1heEFuaXNvdHJvcHkoZ2wpLFxuICAgIH0sXG4gICAgYWxpYXNlZExpbmVXaWR0aFJhbmdlOiBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5BTElBU0VEX0xJTkVfV0lEVEhfUkFOR0UpKSxcbiAgICBhbGlhc2VkUG9pbnRTaXplUmFuZ2U6IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfUE9JTlRfU0laRV9SQU5HRSkpLFxuICAgIHNoYWRlcnM6IHtcbiAgICAgIHZlcnRleFNoYWRlckJlc3RQcmVjaXNpb246IGdldEJlc3RGbG9hdFByZWNpc2lvbihnbC5WRVJURVhfU0hBREVSLCBnbCksXG4gICAgICBmcmFnbWVudFNoYWRlckJlc3RQcmVjaXNpb246IGdldEJlc3RGbG9hdFByZWNpc2lvbihnbC5GUkFHTUVOVF9TSEFERVIsIGdsKSxcbiAgICAgIGZyYWdtZW50U2hhZGVyRmxvYXRJbnRQcmVjaXNpb246IGdldEZsb2F0SW50UHJlY2lzaW9uKGdsKSxcbiAgICAgIHNoYWRpbmdMYW5ndWFnZVZlcnNpb246IGdsLmdldFBhcmFtZXRlcihnbC5TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04pXG4gICAgfSxcbiAgICBleHRlbnNpb25zOiBnbC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKClcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlc2NyaWJlUmFuZ2UodmFsdWUpIHtcbiAgcmV0dXJuIFt2YWx1ZVswXSwgdmFsdWVbMV1dO1xufVxuXG5mdW5jdGlvbiBnZXRVbm1hc2tlZEluZm8oZ2wpIHtcbiAgdmFyIHVuTWFza2VkSW5mbyA9IHtcbiAgICAgIHJlbmRlcmVyOiBcIlwiLFxuICAgICAgdmVuZG9yOiBcIlwiXG4gIH07XG4gIFxuICB2YXIgZGJnUmVuZGVySW5mbyA9IGdsLmdldEV4dGVuc2lvbihcIldFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm9cIik7XG4gIGlmIChkYmdSZW5kZXJJbmZvICE9IG51bGwpIHtcbiAgICAgIHVuTWFza2VkSW5mby5yZW5kZXJlciA9IGdsLmdldFBhcmFtZXRlcihkYmdSZW5kZXJJbmZvLlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMKTtcbiAgICAgIHVuTWFza2VkSW5mby52ZW5kb3IgICA9IGdsLmdldFBhcmFtZXRlcihkYmdSZW5kZXJJbmZvLlVOTUFTS0VEX1ZFTkRPUl9XRUJHTCk7XG4gIH1cbiAgXG4gIHJldHVybiB1bk1hc2tlZEluZm87XG59XG5cbmZ1bmN0aW9uIGdldE1heENvbG9yQnVmZmVycyhnbCkge1xuICB2YXIgbWF4Q29sb3JCdWZmZXJzID0gMTtcbiAgdmFyIGV4dCA9IGdsLmdldEV4dGVuc2lvbihcIldFQkdMX2RyYXdfYnVmZmVyc1wiKTtcbiAgaWYgKGV4dCAhPSBudWxsKSBcbiAgICAgIG1heENvbG9yQnVmZmVycyA9IGdsLmdldFBhcmFtZXRlcihleHQuTUFYX0RSQVdfQlVGRkVSU19XRUJHTCk7XG4gIFxuICByZXR1cm4gbWF4Q29sb3JCdWZmZXJzO1xufVxuXG5mdW5jdGlvbiBnZXRNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KGNvbnRleHROYW1lKSB7XG4gIC8vIERvZXMgY29udGV4dCBjcmVhdGlvbiBmYWlsIHRvIGRvIGEgbWFqb3IgcGVyZm9ybWFuY2UgY2F2ZWF0P1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpKTtcbiAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoY29udGV4dE5hbWUsIHsgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA6IHRydWUgfSk7XG4gIGNhbnZhcy5yZW1vdmUoKTtcblxuICBpZiAoIWdsKSB7XG4gICAgICAvLyBPdXIgb3JpZ2luYWwgY29udGV4dCBjcmVhdGlvbiBwYXNzZWQuICBUaGlzIGRpZCBub3QuXG4gICAgICByZXR1cm4gXCJZZXNcIjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZ2wuZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKS5mYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvLyBJZiBnZXRDb250ZXh0QXR0cmlidXRlcygpIGRvZXNuXCJ0IGluY2x1ZGUgdGhlIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXRcbiAgICAgIC8vIHByb3BlcnR5LCBhc3N1bWUgdGhlIGJyb3dzZXIgZG9lc25cInQgaW1wbGVtZW50IGl0IHlldC5cbiAgICAgIHJldHVybiBcIk5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG4gIHJldHVybiBcIk5vXCI7XG59XG5cbmZ1bmN0aW9uIGlzUG93ZXJPZlR3byhuKSB7XG4gIHJldHVybiAobiAhPT0gMCkgJiYgKChuICYgKG4gLSAxKSkgPT09IDApO1xufVxuXG5mdW5jdGlvbiBnZXRBbmdsZShnbCkge1xuICB2YXIgbGluZVdpZHRoUmFuZ2UgPSBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5BTElBU0VEX0xJTkVfV0lEVEhfUkFOR0UpKTtcblxuICAvLyBIZXVyaXN0aWM6IEFOR0xFIGlzIG9ubHkgb24gV2luZG93cywgbm90IGluIElFLCBhbmQgZG9lcyBub3QgaW1wbGVtZW50IGxpbmUgd2lkdGggZ3JlYXRlciB0aGFuIG9uZS5cbiAgdmFyIGFuZ2xlID0gKChuYXZpZ2F0b3IucGxhdGZvcm0gPT09IFwiV2luMzJcIikgfHwgKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gXCJXaW42NFwiKSkgJiZcbiAgICAgIChnbC5nZXRQYXJhbWV0ZXIoZ2wuUkVOREVSRVIpICE9PSBcIkludGVybmV0IEV4cGxvcmVyXCIpICYmXG4gICAgICAobGluZVdpZHRoUmFuZ2UgPT09IGRlc2NyaWJlUmFuZ2UoWzEsMV0pKTtcblxuICBpZiAoYW5nbGUpIHtcbiAgICAgIC8vIEhldXJpc3RpYzogRDNEMTEgYmFja2VuZCBkb2VzIG5vdCBhcHBlYXIgdG8gcmVzZXJ2ZSB1bmlmb3JtcyBsaWtlIHRoZSBEM0Q5IGJhY2tlbmQsIGUuZy4sXG4gICAgICAvLyBEM0QxMSBtYXkgaGF2ZSAxMDI0IHVuaWZvcm1zIHBlciBzdGFnZSwgYnV0IEQzRDkgaGFzIDI1NCBhbmQgMjIxLlxuICAgICAgLy9cbiAgICAgIC8vIFdlIGNvdWxkIGFsc28gdGVzdCBmb3IgV0VCR0xfZHJhd19idWZmZXJzLCBidXQgbWFueSBzeXN0ZW1zIGRvIG5vdCBoYXZlIGl0IHlldFxuICAgICAgLy8gZHVlIHRvIGRyaXZlciBidWdzLCBldGMuXG4gICAgICBpZiAoaXNQb3dlck9mVHdvKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1VOSUZPUk1fVkVDVE9SUykpICYmIGlzUG93ZXJPZlR3byhnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0ZSQUdNRU5UX1VOSUZPUk1fVkVDVE9SUykpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiWWVzLCBEM0QxMVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJZZXMsIEQzRDlcIjtcbiAgICAgIH1cbiAgfVxuXG4gIHJldHVybiBcIk5vXCI7XG59XG5cbmZ1bmN0aW9uIGdldE1heEFuaXNvdHJvcHkoZ2wpIHtcbiAgdmFyIGUgPSBnbC5nZXRFeHRlbnNpb24oXCJFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNcIilcbiAgICAgICAgICB8fCBnbC5nZXRFeHRlbnNpb24oXCJXRUJLSVRfRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpXG4gICAgICAgICAgfHwgZ2wuZ2V0RXh0ZW5zaW9uKFwiTU9aX0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiKTtcblxuICBpZiAoZSkge1xuICAgICAgdmFyIG1heCA9IGdsLmdldFBhcmFtZXRlcihlLk1BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCk7XG4gICAgICAvLyBTZWUgQ2FuYXJ5IGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTExNzQ1MFxuICAgICAgaWYgKG1heCA9PT0gMCkge1xuICAgICAgICAgIG1heCA9IDI7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4O1xuICB9XG4gIHJldHVybiBcIm4vYVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQb3dlcihleHBvbmVudCwgdmVyYm9zZSkge1xuICBpZiAodmVyYm9zZSkge1xuICAgICAgcmV0dXJuIFwiXCIgKyBNYXRoLnBvdygyLCBleHBvbmVudCk7XG4gIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIyXlwiICsgZXhwb25lbnQgKyBcIlwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKHByZWNpc2lvbiwgdmVyYm9zZSkge1xuICB2YXIgdmVyYm9zZVBhcnQgPSB2ZXJib3NlID8gXCIgYml0IG1hbnRpc3NhXCIgOiBcIlwiO1xuICByZXR1cm4gXCJbLVwiICsgZm9ybWF0UG93ZXIocHJlY2lzaW9uLnJhbmdlTWluLCB2ZXJib3NlKSArIFwiLCBcIiArIGZvcm1hdFBvd2VyKHByZWNpc2lvbi5yYW5nZU1heCwgdmVyYm9zZSkgKyBcIl0gKFwiICsgcHJlY2lzaW9uLnByZWNpc2lvbiArIHZlcmJvc2VQYXJ0ICsgXCIpXCJcbn1cblxuZnVuY3Rpb24gZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKHNoYWRlclR5cGUsIGdsKSB7XG4gIHZhciBoaWdoID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KHNoYWRlclR5cGUsIGdsLkhJR0hfRkxPQVQpO1xuICB2YXIgbWVkaXVtID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KHNoYWRlclR5cGUsIGdsLk1FRElVTV9GTE9BVCk7XG4gIHZhciBsb3cgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuTE9XX0ZMT0FUKTtcblxuICB2YXIgYmVzdCA9IGhpZ2g7XG4gIGlmIChoaWdoLnByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgYmVzdCA9IG1lZGl1bTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgICBoaWdoIDogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24oaGlnaCwgdHJ1ZSksXG4gICAgICBtZWRpdW0gOiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihtZWRpdW0sIHRydWUpLFxuICAgICAgbG93OiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihsb3csIHRydWUpLFxuICAgICAgYmVzdDogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24oYmVzdCwgZmFsc2UpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RmxvYXRJbnRQcmVjaXNpb24oZ2wpIHtcbiAgdmFyIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0ZMT0FUKTtcbiAgdmFyIHMgPSAoaGlnaC5wcmVjaXNpb24gIT09IDApID8gXCJoaWdocC9cIiA6IFwibWVkaXVtcC9cIjtcblxuICBoaWdoID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuSElHSF9JTlQpO1xuICBzICs9IChoaWdoLnJhbmdlTWF4ICE9PSAwKSA/IFwiaGlnaHBcIiA6IFwibG93cFwiO1xuXG4gIHJldHVybiBzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdlYmdsMTogZ2V0V2ViR0xJbmZvQnlWZXJzaW9uKDEpLFxuICAgIHdlYmdsMjogZ2V0V2ViR0xJbmZvQnlWZXJzaW9uKDIpXG4gIH1cbn1cbiIsIi8qXG4gQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBTSEEgZmFtaWx5IG9mIGhhc2hlcywgYXNcbiBkZWZpbmVkIGluIEZJUFMgUFVCIDE4MC00IGFuZCBGSVBTIFBVQiAyMDIsIGFzIHdlbGwgYXMgdGhlIGNvcnJlc3BvbmRpbmdcbiBITUFDIGltcGxlbWVudGF0aW9uIGFzIGRlZmluZWQgaW4gRklQUyBQVUIgMTk4YVxuXG4gQ29weXJpZ2h0IEJyaWFuIFR1cmVrIDIwMDgtMjAxN1xuIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuIFNlZSBodHRwOi8vY2FsaWdhdGlvLmdpdGh1Yi5jb20vanNTSEEvIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiBTZXZlcmFsIGZ1bmN0aW9ucyB0YWtlbiBmcm9tIFBhdWwgSm9obnN0b25cbiovXG4ndXNlIHN0cmljdCc7KGZ1bmN0aW9uKFkpe2Z1bmN0aW9uIEMoYyxhLGIpe3ZhciBlPTAsaD1bXSxuPTAsZyxsLGQsZixtLHEsdSxyLEk9ITEsdj1bXSx3PVtdLHQseT0hMSx6PSExLHg9LTE7Yj1ifHx7fTtnPWIuZW5jb2Rpbmd8fFwiVVRGOFwiO3Q9Yi5udW1Sb3VuZHN8fDE7aWYodCE9PXBhcnNlSW50KHQsMTApfHwxPnQpdGhyb3cgRXJyb3IoXCJudW1Sb3VuZHMgbXVzdCBhIGludGVnZXIgPj0gMVwiKTtpZihcIlNIQS0xXCI9PT1jKW09NTEyLHE9Syx1PVosZj0xNjAscj1mdW5jdGlvbihhKXtyZXR1cm4gYS5zbGljZSgpfTtlbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBLVwiLDApKWlmKHE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gTChhLGIsYyl9LHU9ZnVuY3Rpb24oYSxiLGgsZSl7dmFyIGssZjtpZihcIlNIQS0yMjRcIj09PWN8fFwiU0hBLTI1NlwiPT09YylrPShiKzY1Pj4+OTw8NCkrMTUsZj0xNjtlbHNlIGlmKFwiU0hBLTM4NFwiPT09Y3x8XCJTSEEtNTEyXCI9PT1jKWs9KGIrMTI5Pj4+MTA8PFxuNSkrMzEsZj0zMjtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtmb3IoO2EubGVuZ3RoPD1rOylhLnB1c2goMCk7YVtiPj4+NV18PTEyODw8MjQtYiUzMjtiPWIraDthW2tdPWImNDI5NDk2NzI5NTthW2stMV09Yi80Mjk0OTY3Mjk2fDA7aD1hLmxlbmd0aDtmb3IoYj0wO2I8aDtiKz1mKWU9TChhLnNsaWNlKGIsYitmKSxlLGMpO2lmKFwiU0hBLTIyNFwiPT09YylhPVtlWzBdLGVbMV0sZVsyXSxlWzNdLGVbNF0sZVs1XSxlWzZdXTtlbHNlIGlmKFwiU0hBLTI1NlwiPT09YylhPWU7ZWxzZSBpZihcIlNIQS0zODRcIj09PWMpYT1bZVswXS5hLGVbMF0uYixlWzFdLmEsZVsxXS5iLGVbMl0uYSxlWzJdLmIsZVszXS5hLGVbM10uYixlWzRdLmEsZVs0XS5iLGVbNV0uYSxlWzVdLmJdO2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1jKWE9W2VbMF0uYSxlWzBdLmIsZVsxXS5hLGVbMV0uYixlWzJdLmEsZVsyXS5iLGVbM10uYSxlWzNdLmIsZVs0XS5hLFxuZVs0XS5iLGVbNV0uYSxlWzVdLmIsZVs2XS5hLGVbNl0uYixlWzddLmEsZVs3XS5iXTtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtyZXR1cm4gYX0scj1mdW5jdGlvbihhKXtyZXR1cm4gYS5zbGljZSgpfSxcIlNIQS0yMjRcIj09PWMpbT01MTIsZj0yMjQ7ZWxzZSBpZihcIlNIQS0yNTZcIj09PWMpbT01MTIsZj0yNTY7ZWxzZSBpZihcIlNIQS0zODRcIj09PWMpbT0xMDI0LGY9Mzg0O2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1jKW09MTAyNCxmPTUxMjtlbHNlIHRocm93IEVycm9yKFwiQ2hvc2VuIFNIQSB2YXJpYW50IGlzIG5vdCBzdXBwb3J0ZWRcIik7ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQTMtXCIsMCl8fDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBS0VcIiwwKSl7dmFyIEY9NjtxPUQ7cj1mdW5jdGlvbihhKXt2YXIgYz1bXSxlO2ZvcihlPTA7NT5lO2UrPTEpY1tlXT1hW2VdLnNsaWNlKCk7cmV0dXJuIGN9O3g9MTtpZihcIlNIQTMtMjI0XCI9PT1cbmMpbT0xMTUyLGY9MjI0O2Vsc2UgaWYoXCJTSEEzLTI1NlwiPT09YyltPTEwODgsZj0yNTY7ZWxzZSBpZihcIlNIQTMtMzg0XCI9PT1jKW09ODMyLGY9Mzg0O2Vsc2UgaWYoXCJTSEEzLTUxMlwiPT09YyltPTU3NixmPTUxMjtlbHNlIGlmKFwiU0hBS0UxMjhcIj09PWMpbT0xMzQ0LGY9LTEsRj0zMSx6PSEwO2Vsc2UgaWYoXCJTSEFLRTI1NlwiPT09YyltPTEwODgsZj0tMSxGPTMxLHo9ITA7ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO3U9ZnVuY3Rpb24oYSxjLGUsYixoKXtlPW07dmFyIGs9RixmLGc9W10sbj1lPj4+NSxsPTAsZD1jPj4+NTtmb3IoZj0wO2Y8ZCYmYz49ZTtmKz1uKWI9RChhLnNsaWNlKGYsZituKSxiKSxjLT1lO2E9YS5zbGljZShmKTtmb3IoYyU9ZTthLmxlbmd0aDxuOylhLnB1c2goMCk7Zj1jPj4+MzthW2Y+PjJdXj1rPDxmJTQqODthW24tMV1ePTIxNDc0ODM2NDg7Zm9yKGI9RChhLGIpOzMyKmcubGVuZ3RoPGg7KXthPWJbbCVcbjVdW2wvNXwwXTtnLnB1c2goYS5iKTtpZigzMipnLmxlbmd0aD49aClicmVhaztnLnB1c2goYS5hKTtsKz0xOzA9PT02NCpsJWUmJkQobnVsbCxiKX1yZXR1cm4gZ319ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO2Q9TShhLGcseCk7bD1BKGMpO3RoaXMuc2V0SE1BQ0tleT1mdW5jdGlvbihhLGIsaCl7dmFyIGs7aWYoITA9PT1JKXRocm93IEVycm9yKFwiSE1BQyBrZXkgYWxyZWFkeSBzZXRcIik7aWYoITA9PT15KXRocm93IEVycm9yKFwiQ2Fubm90IHNldCBITUFDIGtleSBhZnRlciBjYWxsaW5nIHVwZGF0ZVwiKTtpZighMD09PXopdGhyb3cgRXJyb3IoXCJTSEFLRSBpcyBub3Qgc3VwcG9ydGVkIGZvciBITUFDXCIpO2c9KGh8fHt9KS5lbmNvZGluZ3x8XCJVVEY4XCI7Yj1NKGIsZyx4KShhKTthPWIuYmluTGVuO2I9Yi52YWx1ZTtrPW0+Pj4zO2g9ay80LTE7aWYoazxhLzgpe2ZvcihiPXUoYixhLDAsQShjKSxmKTtiLmxlbmd0aDw9aDspYi5wdXNoKDApO1xuYltoXSY9NDI5NDk2NzA0MH1lbHNlIGlmKGs+YS84KXtmb3IoO2IubGVuZ3RoPD1oOyliLnB1c2goMCk7YltoXSY9NDI5NDk2NzA0MH1mb3IoYT0wO2E8PWg7YSs9MSl2W2FdPWJbYV1eOTA5NTIyNDg2LHdbYV09YlthXV4xNTQ5NTU2ODI4O2w9cSh2LGwpO2U9bTtJPSEwfTt0aGlzLnVwZGF0ZT1mdW5jdGlvbihhKXt2YXIgYyxiLGssZj0wLGc9bT4+PjU7Yz1kKGEsaCxuKTthPWMuYmluTGVuO2I9Yy52YWx1ZTtjPWE+Pj41O2ZvcihrPTA7azxjO2srPWcpZittPD1hJiYobD1xKGIuc2xpY2UoayxrK2cpLGwpLGYrPW0pO2UrPWY7aD1iLnNsaWNlKGY+Pj41KTtuPWElbTt5PSEwfTt0aGlzLmdldEhhc2g9ZnVuY3Rpb24oYSxiKXt2YXIgayxnLGQsbTtpZighMD09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRIYXNoIGFmdGVyIHNldHRpbmcgSE1BQyBrZXlcIik7ZD1OKGIpO2lmKCEwPT09eil7aWYoLTE9PT1kLnNoYWtlTGVuKXRocm93IEVycm9yKFwic2hha2VMZW4gbXVzdCBiZSBzcGVjaWZpZWQgaW4gb3B0aW9uc1wiKTtcbmY9ZC5zaGFrZUxlbn1zd2l0Y2goYSl7Y2FzZSBcIkhFWFwiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIE8oYSxmLHgsZCl9O2JyZWFrO2Nhc2UgXCJCNjRcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBQKGEsZix4LGQpfTticmVhaztjYXNlIFwiQllURVNcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBRKGEsZix4KX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2c9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKHApe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31rPWZ1bmN0aW9uKGEpe3JldHVybiBSKGEsZix4KX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcImZvcm1hdCBtdXN0IGJlIEhFWCwgQjY0LCBCWVRFUywgb3IgQVJSQVlCVUZGRVJcIik7fW09dShoLnNsaWNlKCksbixlLHIobCksZik7Zm9yKGc9MTtnPHQ7Zys9MSkhMD09PXomJjAhPT1mJTMyJiYobVttLmxlbmd0aC0xXSY9MTY3NzcyMTU+Pj4yNC1mJTMyKSxtPXUobSxmLFxuMCxBKGMpLGYpO3JldHVybiBrKG0pfTt0aGlzLmdldEhNQUM9ZnVuY3Rpb24oYSxiKXt2YXIgayxnLGQscDtpZighMT09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRITUFDIHdpdGhvdXQgZmlyc3Qgc2V0dGluZyBITUFDIGtleVwiKTtkPU4oYik7c3dpdGNoKGEpe2Nhc2UgXCJIRVhcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBPKGEsZix4LGQpfTticmVhaztjYXNlIFwiQjY0XCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUChhLGYseCxkKX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUShhLGYseCl9O2JyZWFrO2Nhc2UgXCJBUlJBWUJVRkZFUlwiOnRyeXtrPW5ldyBBcnJheUJ1ZmZlcigwKX1jYXRjaCh2KXt0aHJvdyBFcnJvcihcIkFSUkFZQlVGRkVSIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTt9az1mdW5jdGlvbihhKXtyZXR1cm4gUihhLGYseCl9O2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJvdXRwdXRGb3JtYXQgbXVzdCBiZSBIRVgsIEI2NCwgQllURVMsIG9yIEFSUkFZQlVGRkVSXCIpO1xufWc9dShoLnNsaWNlKCksbixlLHIobCksZik7cD1xKHcsQShjKSk7cD11KGcsZixtLHAsZik7cmV0dXJuIGsocCl9fWZ1bmN0aW9uIGIoYyxhKXt0aGlzLmE9Yzt0aGlzLmI9YX1mdW5jdGlvbiBPKGMsYSxiLGUpe3ZhciBoPVwiXCI7YS89ODt2YXIgbixnLGQ7ZD0tMT09PWI/MzowO2ZvcihuPTA7bjxhO24rPTEpZz1jW24+Pj4yXT4+PjgqKGQrbiU0KmIpLGgrPVwiMDEyMzQ1Njc4OWFiY2RlZlwiLmNoYXJBdChnPj4+NCYxNSkrXCIwMTIzNDU2Nzg5YWJjZGVmXCIuY2hhckF0KGcmMTUpO3JldHVybiBlLm91dHB1dFVwcGVyP2gudG9VcHBlckNhc2UoKTpofWZ1bmN0aW9uIFAoYyxhLGIsZSl7dmFyIGg9XCJcIixuPWEvOCxnLGQscCxmO2Y9LTE9PT1iPzM6MDtmb3IoZz0wO2c8bjtnKz0zKWZvcihkPWcrMTxuP2NbZysxPj4+Ml06MCxwPWcrMjxuP2NbZysyPj4+Ml06MCxwPShjW2c+Pj4yXT4+PjgqKGYrZyU0KmIpJjI1NSk8PDE2fChkPj4+OCooZisoZysxKSU0KmIpJjI1NSk8PDh8cD4+PjgqKGYrXG4oZysyKSU0KmIpJjI1NSxkPTA7ND5kO2QrPTEpOCpnKzYqZDw9YT9oKz1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIi5jaGFyQXQocD4+PjYqKDMtZCkmNjMpOmgrPWUuYjY0UGFkO3JldHVybiBofWZ1bmN0aW9uIFEoYyxhLGIpe3ZhciBlPVwiXCI7YS89ODt2YXIgaCxkLGc7Zz0tMT09PWI/MzowO2ZvcihoPTA7aDxhO2grPTEpZD1jW2g+Pj4yXT4+PjgqKGcraCU0KmIpJjI1NSxlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGQpO3JldHVybiBlfWZ1bmN0aW9uIFIoYyxhLGIpe2EvPTg7dmFyIGUsaD1uZXcgQXJyYXlCdWZmZXIoYSksZCxnO2c9bmV3IFVpbnQ4QXJyYXkoaCk7ZD0tMT09PWI/MzowO2ZvcihlPTA7ZTxhO2UrPTEpZ1tlXT1jW2U+Pj4yXT4+PjgqKGQrZSU0KmIpJjI1NTtyZXR1cm4gaH1mdW5jdGlvbiBOKGMpe3ZhciBhPXtvdXRwdXRVcHBlcjohMSxiNjRQYWQ6XCI9XCIsc2hha2VMZW46LTF9O2M9Y3x8e307XG5hLm91dHB1dFVwcGVyPWMub3V0cHV0VXBwZXJ8fCExOyEwPT09Yy5oYXNPd25Qcm9wZXJ0eShcImI2NFBhZFwiKSYmKGEuYjY0UGFkPWMuYjY0UGFkKTtpZighMD09PWMuaGFzT3duUHJvcGVydHkoXCJzaGFrZUxlblwiKSl7aWYoMCE9PWMuc2hha2VMZW4lOCl0aHJvdyBFcnJvcihcInNoYWtlTGVuIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA4XCIpO2Euc2hha2VMZW49Yy5zaGFrZUxlbn1pZihcImJvb2xlYW5cIiE9PXR5cGVvZiBhLm91dHB1dFVwcGVyKXRocm93IEVycm9yKFwiSW52YWxpZCBvdXRwdXRVcHBlciBmb3JtYXR0aW5nIG9wdGlvblwiKTtpZihcInN0cmluZ1wiIT09dHlwZW9mIGEuYjY0UGFkKXRocm93IEVycm9yKFwiSW52YWxpZCBiNjRQYWQgZm9ybWF0dGluZyBvcHRpb25cIik7cmV0dXJuIGF9ZnVuY3Rpb24gTShjLGEsYil7c3dpdGNoKGEpe2Nhc2UgXCJVVEY4XCI6Y2FzZSBcIlVURjE2QkVcIjpjYXNlIFwiVVRGMTZMRVwiOmJyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJlbmNvZGluZyBtdXN0IGJlIFVURjgsIFVURjE2QkUsIG9yIFVURjE2TEVcIik7XG59c3dpdGNoKGMpe2Nhc2UgXCJIRVhcIjpjPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZz1hLmxlbmd0aCxsLHAsZixtLHEsdTtpZigwIT09ZyUyKXRocm93IEVycm9yKFwiU3RyaW5nIG9mIEhFWCB0eXBlIG11c3QgYmUgaW4gYnl0ZSBpbmNyZW1lbnRzXCIpO2M9Y3x8WzBdO2Q9ZHx8MDtxPWQ+Pj4zO3U9LTE9PT1iPzM6MDtmb3IobD0wO2w8ZztsKz0yKXtwPXBhcnNlSW50KGEuc3Vic3RyKGwsMiksMTYpO2lmKGlzTmFOKHApKXRocm93IEVycm9yKFwiU3RyaW5nIG9mIEhFWCB0eXBlIGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVyc1wiKTttPShsPj4+MSkrcTtmb3IoZj1tPj4+MjtjLmxlbmd0aDw9ZjspYy5wdXNoKDApO2NbZl18PXA8PDgqKHUrbSU0KmIpfXJldHVybnt2YWx1ZTpjLGJpbkxlbjo0KmcrZH19O2JyZWFrO2Nhc2UgXCJURVhUXCI6Yz1mdW5jdGlvbihjLGgsZCl7dmFyIGcsbCxwPTAsZixtLHEsdSxyLHQ7aD1ofHxbMF07ZD1kfHwwO3E9ZD4+PjM7aWYoXCJVVEY4XCI9PT1hKWZvcih0PS0xPT09XG5iPzM6MCxmPTA7ZjxjLmxlbmd0aDtmKz0xKWZvcihnPWMuY2hhckNvZGVBdChmKSxsPVtdLDEyOD5nP2wucHVzaChnKToyMDQ4Pmc/KGwucHVzaCgxOTJ8Zz4+PjYpLGwucHVzaCgxMjh8ZyY2MykpOjU1Mjk2Pmd8fDU3MzQ0PD1nP2wucHVzaCgyMjR8Zz4+PjEyLDEyOHxnPj4+NiY2MywxMjh8ZyY2Myk6KGYrPTEsZz02NTUzNisoKGcmMTAyMyk8PDEwfGMuY2hhckNvZGVBdChmKSYxMDIzKSxsLnB1c2goMjQwfGc+Pj4xOCwxMjh8Zz4+PjEyJjYzLDEyOHxnPj4+NiY2MywxMjh8ZyY2MykpLG09MDttPGwubGVuZ3RoO20rPTEpe3I9cCtxO2Zvcih1PXI+Pj4yO2gubGVuZ3RoPD11OyloLnB1c2goMCk7aFt1XXw9bFttXTw8OCoodCtyJTQqYik7cCs9MX1lbHNlIGlmKFwiVVRGMTZCRVwiPT09YXx8XCJVVEYxNkxFXCI9PT1hKWZvcih0PS0xPT09Yj8yOjAsbD1cIlVURjE2TEVcIj09PWEmJjEhPT1ifHxcIlVURjE2TEVcIiE9PWEmJjE9PT1iLGY9MDtmPGMubGVuZ3RoO2YrPTEpe2c9Yy5jaGFyQ29kZUF0KGYpO1xuITA9PT1sJiYobT1nJjI1NSxnPW08PDh8Zz4+PjgpO3I9cCtxO2Zvcih1PXI+Pj4yO2gubGVuZ3RoPD11OyloLnB1c2goMCk7aFt1XXw9Zzw8OCoodCtyJTQqYik7cCs9Mn1yZXR1cm57dmFsdWU6aCxiaW5MZW46OCpwK2R9fTticmVhaztjYXNlIFwiQjY0XCI6Yz1mdW5jdGlvbihhLGMsZCl7dmFyIGc9MCxsLHAsZixtLHEsdSxyLHQ7aWYoLTE9PT1hLnNlYXJjaCgvXlthLXpBLVowLTk9K1xcL10rJC8pKXRocm93IEVycm9yKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gYmFzZS02NCBzdHJpbmdcIik7cD1hLmluZGV4T2YoXCI9XCIpO2E9YS5yZXBsYWNlKC9cXD0vZyxcIlwiKTtpZigtMSE9PXAmJnA8YS5sZW5ndGgpdGhyb3cgRXJyb3IoXCJJbnZhbGlkICc9JyBmb3VuZCBpbiBiYXNlLTY0IHN0cmluZ1wiKTtjPWN8fFswXTtkPWR8fDA7dT1kPj4+Mzt0PS0xPT09Yj8zOjA7Zm9yKHA9MDtwPGEubGVuZ3RoO3ArPTQpe3E9YS5zdWJzdHIocCw0KTtmb3IoZj1tPTA7ZjxxLmxlbmd0aDtmKz0xKWw9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCIuaW5kZXhPZihxW2ZdKSxcbm18PWw8PDE4LTYqZjtmb3IoZj0wO2Y8cS5sZW5ndGgtMTtmKz0xKXtyPWcrdTtmb3IobD1yPj4+MjtjLmxlbmd0aDw9bDspYy5wdXNoKDApO2NbbF18PShtPj4+MTYtOCpmJjI1NSk8PDgqKHQrciU0KmIpO2crPTF9fXJldHVybnt2YWx1ZTpjLGJpbkxlbjo4KmcrZH19O2JyZWFrO2Nhc2UgXCJCWVRFU1wiOmM9ZnVuY3Rpb24oYSxjLGQpe3ZhciBnLGwscCxmLG0scTtjPWN8fFswXTtkPWR8fDA7cD1kPj4+MztxPS0xPT09Yj8zOjA7Zm9yKGw9MDtsPGEubGVuZ3RoO2wrPTEpZz1hLmNoYXJDb2RlQXQobCksbT1sK3AsZj1tPj4+MixjLmxlbmd0aDw9ZiYmYy5wdXNoKDApLGNbZl18PWc8PDgqKHErbSU0KmIpO3JldHVybnt2YWx1ZTpjLGJpbkxlbjo4KmEubGVuZ3RoK2R9fTticmVhaztjYXNlIFwiQVJSQVlCVUZGRVJcIjp0cnl7Yz1uZXcgQXJyYXlCdWZmZXIoMCl9Y2F0Y2goZSl7dGhyb3cgRXJyb3IoXCJBUlJBWUJVRkZFUiBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgZW52aXJvbm1lbnRcIik7fWM9XG5mdW5jdGlvbihhLGMsZCl7dmFyIGcsbCxwLGYsbSxxO2M9Y3x8WzBdO2Q9ZHx8MDtsPWQ+Pj4zO209LTE9PT1iPzM6MDtxPW5ldyBVaW50OEFycmF5KGEpO2ZvcihnPTA7ZzxhLmJ5dGVMZW5ndGg7Zys9MSlmPWcrbCxwPWY+Pj4yLGMubGVuZ3RoPD1wJiZjLnB1c2goMCksY1twXXw9cVtnXTw8OCoobStmJTQqYik7cmV0dXJue3ZhbHVlOmMsYmluTGVuOjgqYS5ieXRlTGVuZ3RoK2R9fTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiZm9ybWF0IG11c3QgYmUgSEVYLCBURVhULCBCNjQsIEJZVEVTLCBvciBBUlJBWUJVRkZFUlwiKTt9cmV0dXJuIGN9ZnVuY3Rpb24geShjLGEpe3JldHVybiBjPDxhfGM+Pj4zMi1hfWZ1bmN0aW9uIFMoYyxhKXtyZXR1cm4gMzI8YT8oYS09MzIsbmV3IGIoYy5iPDxhfGMuYT4+PjMyLWEsYy5hPDxhfGMuYj4+PjMyLWEpKTowIT09YT9uZXcgYihjLmE8PGF8Yy5iPj4+MzItYSxjLmI8PGF8Yy5hPj4+MzItYSk6Y31mdW5jdGlvbiB3KGMsYSl7cmV0dXJuIGM+Pj5cbmF8Yzw8MzItYX1mdW5jdGlvbiB0KGMsYSl7dmFyIGs9bnVsbCxrPW5ldyBiKGMuYSxjLmIpO3JldHVybiBrPTMyPj1hP25ldyBiKGsuYT4+PmF8ay5iPDwzMi1hJjQyOTQ5NjcyOTUsay5iPj4+YXxrLmE8PDMyLWEmNDI5NDk2NzI5NSk6bmV3IGIoay5iPj4+YS0zMnxrLmE8PDY0LWEmNDI5NDk2NzI5NSxrLmE+Pj5hLTMyfGsuYjw8NjQtYSY0Mjk0OTY3Mjk1KX1mdW5jdGlvbiBUKGMsYSl7dmFyIGs9bnVsbDtyZXR1cm4gaz0zMj49YT9uZXcgYihjLmE+Pj5hLGMuYj4+PmF8Yy5hPDwzMi1hJjQyOTQ5NjcyOTUpOm5ldyBiKDAsYy5hPj4+YS0zMil9ZnVuY3Rpb24gYWEoYyxhLGIpe3JldHVybiBjJmFefmMmYn1mdW5jdGlvbiBiYShjLGEsayl7cmV0dXJuIG5ldyBiKGMuYSZhLmFefmMuYSZrLmEsYy5iJmEuYl5+Yy5iJmsuYil9ZnVuY3Rpb24gVShjLGEsYil7cmV0dXJuIGMmYV5jJmJeYSZifWZ1bmN0aW9uIGNhKGMsYSxrKXtyZXR1cm4gbmV3IGIoYy5hJmEuYV5jLmEmay5hXmEuYSZcbmsuYSxjLmImYS5iXmMuYiZrLmJeYS5iJmsuYil9ZnVuY3Rpb24gZGEoYyl7cmV0dXJuIHcoYywyKV53KGMsMTMpXncoYywyMil9ZnVuY3Rpb24gZWEoYyl7dmFyIGE9dChjLDI4KSxrPXQoYywzNCk7Yz10KGMsMzkpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gZmEoYyl7cmV0dXJuIHcoYyw2KV53KGMsMTEpXncoYywyNSl9ZnVuY3Rpb24gZ2EoYyl7dmFyIGE9dChjLDE0KSxrPXQoYywxOCk7Yz10KGMsNDEpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gaGEoYyl7cmV0dXJuIHcoYyw3KV53KGMsMTgpXmM+Pj4zfWZ1bmN0aW9uIGlhKGMpe3ZhciBhPXQoYywxKSxrPXQoYyw4KTtjPVQoYyw3KTtyZXR1cm4gbmV3IGIoYS5hXmsuYV5jLmEsYS5iXmsuYl5jLmIpfWZ1bmN0aW9uIGphKGMpe3JldHVybiB3KGMsMTcpXncoYywxOSleYz4+PjEwfWZ1bmN0aW9uIGthKGMpe3ZhciBhPXQoYywxOSksaz10KGMsNjEpO1xuYz1UKGMsNik7cmV0dXJuIG5ldyBiKGEuYV5rLmFeYy5hLGEuYl5rLmJeYy5iKX1mdW5jdGlvbiBHKGMsYSl7dmFyIGI9KGMmNjU1MzUpKyhhJjY1NTM1KTtyZXR1cm4oKGM+Pj4xNikrKGE+Pj4xNikrKGI+Pj4xNikmNjU1MzUpPDwxNnxiJjY1NTM1fWZ1bmN0aW9uIGxhKGMsYSxiLGUpe3ZhciBoPShjJjY1NTM1KSsoYSY2NTUzNSkrKGImNjU1MzUpKyhlJjY1NTM1KTtyZXR1cm4oKGM+Pj4xNikrKGE+Pj4xNikrKGI+Pj4xNikrKGU+Pj4xNikrKGg+Pj4xNikmNjU1MzUpPDwxNnxoJjY1NTM1fWZ1bmN0aW9uIEgoYyxhLGIsZSxoKXt2YXIgZD0oYyY2NTUzNSkrKGEmNjU1MzUpKyhiJjY1NTM1KSsoZSY2NTUzNSkrKGgmNjU1MzUpO3JldHVybigoYz4+PjE2KSsoYT4+PjE2KSsoYj4+PjE2KSsoZT4+PjE2KSsoaD4+PjE2KSsoZD4+PjE2KSY2NTUzNSk8PDE2fGQmNjU1MzV9ZnVuY3Rpb24gbWEoYyxhKXt2YXIgZCxlLGg7ZD0oYy5iJjY1NTM1KSsoYS5iJjY1NTM1KTtlPShjLmI+Pj4xNikrXG4oYS5iPj4+MTYpKyhkPj4+MTYpO2g9KGUmNjU1MzUpPDwxNnxkJjY1NTM1O2Q9KGMuYSY2NTUzNSkrKGEuYSY2NTUzNSkrKGU+Pj4xNik7ZT0oYy5hPj4+MTYpKyhhLmE+Pj4xNikrKGQ+Pj4xNik7cmV0dXJuIG5ldyBiKChlJjY1NTM1KTw8MTZ8ZCY2NTUzNSxoKX1mdW5jdGlvbiBuYShjLGEsZCxlKXt2YXIgaCxuLGc7aD0oYy5iJjY1NTM1KSsoYS5iJjY1NTM1KSsoZC5iJjY1NTM1KSsoZS5iJjY1NTM1KTtuPShjLmI+Pj4xNikrKGEuYj4+PjE2KSsoZC5iPj4+MTYpKyhlLmI+Pj4xNikrKGg+Pj4xNik7Zz0obiY2NTUzNSk8PDE2fGgmNjU1MzU7aD0oYy5hJjY1NTM1KSsoYS5hJjY1NTM1KSsoZC5hJjY1NTM1KSsoZS5hJjY1NTM1KSsobj4+PjE2KTtuPShjLmE+Pj4xNikrKGEuYT4+PjE2KSsoZC5hPj4+MTYpKyhlLmE+Pj4xNikrKGg+Pj4xNik7cmV0dXJuIG5ldyBiKChuJjY1NTM1KTw8MTZ8aCY2NTUzNSxnKX1mdW5jdGlvbiBvYShjLGEsZCxlLGgpe3ZhciBuLGcsbDtuPShjLmImXG42NTUzNSkrKGEuYiY2NTUzNSkrKGQuYiY2NTUzNSkrKGUuYiY2NTUzNSkrKGguYiY2NTUzNSk7Zz0oYy5iPj4+MTYpKyhhLmI+Pj4xNikrKGQuYj4+PjE2KSsoZS5iPj4+MTYpKyhoLmI+Pj4xNikrKG4+Pj4xNik7bD0oZyY2NTUzNSk8PDE2fG4mNjU1MzU7bj0oYy5hJjY1NTM1KSsoYS5hJjY1NTM1KSsoZC5hJjY1NTM1KSsoZS5hJjY1NTM1KSsoaC5hJjY1NTM1KSsoZz4+PjE2KTtnPShjLmE+Pj4xNikrKGEuYT4+PjE2KSsoZC5hPj4+MTYpKyhlLmE+Pj4xNikrKGguYT4+PjE2KSsobj4+PjE2KTtyZXR1cm4gbmV3IGIoKGcmNjU1MzUpPDwxNnxuJjY1NTM1LGwpfWZ1bmN0aW9uIEIoYyxhKXtyZXR1cm4gbmV3IGIoYy5hXmEuYSxjLmJeYS5iKX1mdW5jdGlvbiBBKGMpe3ZhciBhPVtdLGQ7aWYoXCJTSEEtMVwiPT09YylhPVsxNzMyNTg0MTkzLDQwMjMyMzM0MTcsMjU2MjM4MzEwMiwyNzE3MzM4NzgsMzI4NTM3NzUyMF07ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQS1cIiwwKSlzd2l0Y2goYT1cblszMjM4MzcxMDMyLDkxNDE1MDY2Myw4MTI3MDI5OTksNDE0NDkxMjY5Nyw0MjkwNzc1ODU3LDE3NTA2MDMwMjUsMTY5NDA3NjgzOSwzMjA0MDc1NDI4XSxkPVsxNzc5MDMzNzAzLDMxNDQxMzQyNzcsMTAxMzkwNDI0MiwyNzczNDgwNzYyLDEzNTk4OTMxMTksMjYwMDgyMjkyNCw1Mjg3MzQ2MzUsMTU0MTQ1OTIyNV0sYyl7Y2FzZSBcIlNIQS0yMjRcIjpicmVhaztjYXNlIFwiU0hBLTI1NlwiOmE9ZDticmVhaztjYXNlIFwiU0hBLTM4NFwiOmE9W25ldyBiKDM0MTgwNzAzNjUsYVswXSksbmV3IGIoMTY1NDI3MDI1MCxhWzFdKSxuZXcgYigyNDM4NTI5MzcwLGFbMl0pLG5ldyBiKDM1NTQ2MjM2MCxhWzNdKSxuZXcgYigxNzMxNDA1NDE1LGFbNF0pLG5ldyBiKDQxMDQ4ODg1ODk1LGFbNV0pLG5ldyBiKDM2NzUwMDg1MjUsYVs2XSksbmV3IGIoMTIwMzA2MjgxMyxhWzddKV07YnJlYWs7Y2FzZSBcIlNIQS01MTJcIjphPVtuZXcgYihkWzBdLDQwODkyMzU3MjApLG5ldyBiKGRbMV0sMjIyNzg3MzU5NSksXG5uZXcgYihkWzJdLDQyNzExNzU3MjMpLG5ldyBiKGRbM10sMTU5NTc1MDEyOSksbmV3IGIoZFs0XSwyOTE3NTY1MTM3KSxuZXcgYihkWzVdLDcyNTUxMTE5OSksbmV3IGIoZFs2XSw0MjE1Mzg5NTQ3KSxuZXcgYihkWzddLDMyNzAzMzIwOSldO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJVbmtub3duIFNIQSB2YXJpYW50XCIpO31lbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBMy1cIiwwKXx8MD09PWMubGFzdEluZGV4T2YoXCJTSEFLRVwiLDApKWZvcihjPTA7NT5jO2MrPTEpYVtjXT1bbmV3IGIoMCwwKSxuZXcgYigwLDApLG5ldyBiKDAsMCksbmV3IGIoMCwwKSxuZXcgYigwLDApXTtlbHNlIHRocm93IEVycm9yKFwiTm8gU0hBIHZhcmlhbnRzIHN1cHBvcnRlZFwiKTtyZXR1cm4gYX1mdW5jdGlvbiBLKGMsYSl7dmFyIGI9W10sZSxkLG4sZyxsLHAsZjtlPWFbMF07ZD1hWzFdO249YVsyXTtnPWFbM107bD1hWzRdO2ZvcihmPTA7ODA+ZjtmKz0xKWJbZl09MTY+Zj9jW2ZdOnkoYltmLVxuM11eYltmLThdXmJbZi0xNF1eYltmLTE2XSwxKSxwPTIwPmY/SCh5KGUsNSksZCZuXn5kJmcsbCwxNTE4NTAwMjQ5LGJbZl0pOjQwPmY/SCh5KGUsNSksZF5uXmcsbCwxODU5Nzc1MzkzLGJbZl0pOjYwPmY/SCh5KGUsNSksVShkLG4sZyksbCwyNDAwOTU5NzA4LGJbZl0pOkgoeShlLDUpLGRebl5nLGwsMzM5NTQ2OTc4MixiW2ZdKSxsPWcsZz1uLG49eShkLDMwKSxkPWUsZT1wO2FbMF09RyhlLGFbMF0pO2FbMV09RyhkLGFbMV0pO2FbMl09RyhuLGFbMl0pO2FbM109RyhnLGFbM10pO2FbNF09RyhsLGFbNF0pO3JldHVybiBhfWZ1bmN0aW9uIFooYyxhLGIsZSl7dmFyIGQ7Zm9yKGQ9KGErNjU+Pj45PDw0KSsxNTtjLmxlbmd0aDw9ZDspYy5wdXNoKDApO2NbYT4+PjVdfD0xMjg8PDI0LWElMzI7YSs9YjtjW2RdPWEmNDI5NDk2NzI5NTtjW2QtMV09YS80Mjk0OTY3Mjk2fDA7YT1jLmxlbmd0aDtmb3IoZD0wO2Q8YTtkKz0xNillPUsoYy5zbGljZShkLGQrMTYpLGUpO3JldHVybiBlfWZ1bmN0aW9uIEwoYyxcbmEsayl7dmFyIGUsaCxuLGcsbCxwLGYsbSxxLHUscix0LHYsdyx5LEEseix4LEYsQixDLEQsRT1bXSxKO2lmKFwiU0hBLTIyNFwiPT09a3x8XCJTSEEtMjU2XCI9PT1rKXU9NjQsdD0xLEQ9TnVtYmVyLHY9Ryx3PWxhLHk9SCxBPWhhLHo9amEseD1kYSxGPWZhLEM9VSxCPWFhLEo9ZDtlbHNlIGlmKFwiU0hBLTM4NFwiPT09a3x8XCJTSEEtNTEyXCI9PT1rKXU9ODAsdD0yLEQ9Yix2PW1hLHc9bmEseT1vYSxBPWlhLHo9a2EseD1lYSxGPWdhLEM9Y2EsQj1iYSxKPVY7ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IgaW4gU0hBLTIgaW1wbGVtZW50YXRpb25cIik7az1hWzBdO2U9YVsxXTtoPWFbMl07bj1hWzNdO2c9YVs0XTtsPWFbNV07cD1hWzZdO2Y9YVs3XTtmb3Iocj0wO3I8dTtyKz0xKTE2PnI/KHE9cip0LG09Yy5sZW5ndGg8PXE/MDpjW3FdLHE9Yy5sZW5ndGg8PXErMT8wOmNbcSsxXSxFW3JdPW5ldyBEKG0scSkpOkVbcl09dyh6KEVbci0yXSksRVtyLTddLEEoRVtyLTE1XSksRVtyLVxuMTZdKSxtPXkoZixGKGcpLEIoZyxsLHApLEpbcl0sRVtyXSkscT12KHgoayksQyhrLGUsaCkpLGY9cCxwPWwsbD1nLGc9dihuLG0pLG49aCxoPWUsZT1rLGs9dihtLHEpO2FbMF09dihrLGFbMF0pO2FbMV09dihlLGFbMV0pO2FbMl09dihoLGFbMl0pO2FbM109dihuLGFbM10pO2FbNF09dihnLGFbNF0pO2FbNV09dihsLGFbNV0pO2FbNl09dihwLGFbNl0pO2FbN109dihmLGFbN10pO3JldHVybiBhfWZ1bmN0aW9uIEQoYyxhKXt2YXIgZCxlLGgsbixnPVtdLGw9W107aWYobnVsbCE9PWMpZm9yKGU9MDtlPGMubGVuZ3RoO2UrPTIpYVsoZT4+PjEpJTVdWyhlPj4+MSkvNXwwXT1CKGFbKGU+Pj4xKSU1XVsoZT4+PjEpLzV8MF0sbmV3IGIoY1tlKzFdLGNbZV0pKTtmb3IoZD0wOzI0PmQ7ZCs9MSl7bj1BKFwiU0hBMy1cIik7Zm9yKGU9MDs1PmU7ZSs9MSl7aD1hW2VdWzBdO3ZhciBwPWFbZV1bMV0sZj1hW2VdWzJdLG09YVtlXVszXSxxPWFbZV1bNF07Z1tlXT1uZXcgYihoLmFecC5hXmYuYV5cbm0uYV5xLmEsaC5iXnAuYl5mLmJebS5iXnEuYil9Zm9yKGU9MDs1PmU7ZSs9MSlsW2VdPUIoZ1soZSs0KSU1XSxTKGdbKGUrMSklNV0sMSkpO2ZvcihlPTA7NT5lO2UrPTEpZm9yKGg9MDs1Pmg7aCs9MSlhW2VdW2hdPUIoYVtlXVtoXSxsW2VdKTtmb3IoZT0wOzU+ZTtlKz0xKWZvcihoPTA7NT5oO2grPTEpbltoXVsoMiplKzMqaCklNV09UyhhW2VdW2hdLFdbZV1baF0pO2ZvcihlPTA7NT5lO2UrPTEpZm9yKGg9MDs1Pmg7aCs9MSlhW2VdW2hdPUIobltlXVtoXSxuZXcgYih+blsoZSsxKSU1XVtoXS5hJm5bKGUrMiklNV1baF0uYSx+blsoZSsxKSU1XVtoXS5iJm5bKGUrMiklNV1baF0uYikpO2FbMF1bMF09QihhWzBdWzBdLFhbZF0pfXJldHVybiBhfXZhciBkLFYsVyxYO2Q9WzExMTYzNTI0MDgsMTg5OTQ0NzQ0MSwzMDQ5MzIzNDcxLDM5MjEwMDk1NzMsOTYxOTg3MTYzLDE1MDg5NzA5OTMsMjQ1MzYzNTc0OCwyODcwNzYzMjIxLDM2MjQzODEwODAsMzEwNTk4NDAxLDYwNzIyNTI3OCxcbjE0MjY4ODE5ODcsMTkyNTA3ODM4OCwyMTYyMDc4MjA2LDI2MTQ4ODgxMDMsMzI0ODIyMjU4MCwzODM1MzkwNDAxLDQwMjIyMjQ3NzQsMjY0MzQ3MDc4LDYwNDgwNzYyOCw3NzAyNTU5ODMsMTI0OTE1MDEyMiwxNTU1MDgxNjkyLDE5OTYwNjQ5ODYsMjU1NDIyMDg4MiwyODIxODM0MzQ5LDI5NTI5OTY4MDgsMzIxMDMxMzY3MSwzMzM2NTcxODkxLDM1ODQ1Mjg3MTEsMTEzOTI2OTkzLDMzODI0MTg5NSw2NjYzMDcyMDUsNzczNTI5OTEyLDEyOTQ3NTczNzIsMTM5NjE4MjI5MSwxNjk1MTgzNzAwLDE5ODY2NjEwNTEsMjE3NzAyNjM1MCwyNDU2OTU2MDM3LDI3MzA0ODU5MjEsMjgyMDMwMjQxMSwzMjU5NzMwODAwLDMzNDU3NjQ3NzEsMzUxNjA2NTgxNywzNjAwMzUyODA0LDQwOTQ1NzE5MDksMjc1NDIzMzQ0LDQzMDIyNzczNCw1MDY5NDg2MTYsNjU5MDYwNTU2LDg4Mzk5Nzg3Nyw5NTgxMzk1NzEsMTMyMjgyMjIxOCwxNTM3MDAyMDYzLDE3NDc4NzM3NzksMTk1NTU2MjIyMiwyMDI0MTA0ODE1LFxuMjIyNzczMDQ1MiwyMzYxODUyNDI0LDI0Mjg0MzY0NzQsMjc1NjczNDE4NywzMjA0MDMxNDc5LDMzMjkzMjUyOThdO1Y9W25ldyBiKGRbMF0sMzYwOTc2NzQ1OCksbmV3IGIoZFsxXSw2MDI4OTE3MjUpLG5ldyBiKGRbMl0sMzk2NDQ4NDM5OSksbmV3IGIoZFszXSwyMTczMjk1NTQ4KSxuZXcgYihkWzRdLDQwODE2Mjg0NzIpLG5ldyBiKGRbNV0sMzA1MzgzNDI2NSksbmV3IGIoZFs2XSwyOTM3NjcxNTc5KSxuZXcgYihkWzddLDM2NjQ2MDk1NjApLG5ldyBiKGRbOF0sMjczNDg4MzM5NCksbmV3IGIoZFs5XSwxMTY0OTk2NTQyKSxuZXcgYihkWzEwXSwxMzIzNjEwNzY0KSxuZXcgYihkWzExXSwzNTkwMzA0OTk0KSxuZXcgYihkWzEyXSw0MDY4MTgyMzgzKSxuZXcgYihkWzEzXSw5OTEzMzYxMTMpLG5ldyBiKGRbMTRdLDYzMzgwMzMxNyksbmV3IGIoZFsxNV0sMzQ3OTc3NDg2OCksbmV3IGIoZFsxNl0sMjY2NjYxMzQ1OCksbmV3IGIoZFsxN10sOTQ0NzExMTM5KSxuZXcgYihkWzE4XSwyMzQxMjYyNzczKSxcbm5ldyBiKGRbMTldLDIwMDc4MDA5MzMpLG5ldyBiKGRbMjBdLDE0OTU5OTA5MDEpLG5ldyBiKGRbMjFdLDE4NTY0MzEyMzUpLG5ldyBiKGRbMjJdLDMxNzUyMTgxMzIpLG5ldyBiKGRbMjNdLDIxOTg5NTA4MzcpLG5ldyBiKGRbMjRdLDM5OTk3MTkzMzkpLG5ldyBiKGRbMjVdLDc2Njc4NDAxNiksbmV3IGIoZFsyNl0sMjU2NjU5NDg3OSksbmV3IGIoZFsyN10sMzIwMzMzNzk1NiksbmV3IGIoZFsyOF0sMTAzNDQ1NzAyNiksbmV3IGIoZFsyOV0sMjQ2Njk0ODkwMSksbmV3IGIoZFszMF0sMzc1ODMyNjM4MyksbmV3IGIoZFszMV0sMTY4NzE3OTM2KSxuZXcgYihkWzMyXSwxMTg4MTc5OTY0KSxuZXcgYihkWzMzXSwxNTQ2MDQ1NzM0KSxuZXcgYihkWzM0XSwxNTIyODA1NDg1KSxuZXcgYihkWzM1XSwyNjQzODMzODIzKSxuZXcgYihkWzM2XSwyMzQzNTI3MzkwKSxuZXcgYihkWzM3XSwxMDE0NDc3NDgwKSxuZXcgYihkWzM4XSwxMjA2NzU5MTQyKSxuZXcgYihkWzM5XSwzNDQwNzc2MjcpLFxubmV3IGIoZFs0MF0sMTI5MDg2MzQ2MCksbmV3IGIoZFs0MV0sMzE1ODQ1NDI3MyksbmV3IGIoZFs0Ml0sMzUwNTk1MjY1NyksbmV3IGIoZFs0M10sMTA2MjE3MDA4KSxuZXcgYihkWzQ0XSwzNjA2MDA4MzQ0KSxuZXcgYihkWzQ1XSwxNDMyNzI1Nzc2KSxuZXcgYihkWzQ2XSwxNDY3MDMxNTk0KSxuZXcgYihkWzQ3XSw4NTExNjk3MjApLG5ldyBiKGRbNDhdLDMxMDA4MjM3NTIpLG5ldyBiKGRbNDldLDEzNjMyNTgxOTUpLG5ldyBiKGRbNTBdLDM3NTA2ODU1OTMpLG5ldyBiKGRbNTFdLDM3ODUwNTAyODApLG5ldyBiKGRbNTJdLDMzMTgzMDc0MjcpLG5ldyBiKGRbNTNdLDM4MTI3MjM0MDMpLG5ldyBiKGRbNTRdLDIwMDMwMzQ5OTUpLG5ldyBiKGRbNTVdLDM2MDIwMzY4OTkpLG5ldyBiKGRbNTZdLDE1NzU5OTAwMTIpLG5ldyBiKGRbNTddLDExMjU1OTI5MjgpLG5ldyBiKGRbNThdLDI3MTY5MDQzMDYpLG5ldyBiKGRbNTldLDQ0Mjc3NjA0NCksbmV3IGIoZFs2MF0sNTkzNjk4MzQ0KSxuZXcgYihkWzYxXSxcbjM3MzMxMTAyNDkpLG5ldyBiKGRbNjJdLDI5OTkzNTE1NzMpLG5ldyBiKGRbNjNdLDM4MTU5MjA0MjcpLG5ldyBiKDMzOTE1Njk2MTQsMzkyODM4MzkwMCksbmV3IGIoMzUxNTI2NzI3MSw1NjYyODA3MTEpLG5ldyBiKDM5NDAxODc2MDYsMzQ1NDA2OTUzNCksbmV3IGIoNDExODYzMDI3MSw0MDAwMjM5OTkyKSxuZXcgYigxMTY0MTg0NzQsMTkxNDEzODU1NCksbmV3IGIoMTc0MjkyNDIxLDI3MzEwNTUyNzApLG5ldyBiKDI4OTM4MDM1NiwzMjAzOTkzMDA2KSxuZXcgYig0NjAzOTMyNjksMzIwNjIwMzE1KSxuZXcgYig2ODU0NzE3MzMsNTg3NDk2ODM2KSxuZXcgYig4NTIxNDI5NzEsMTA4Njc5Mjg1MSksbmV3IGIoMTAxNzAzNjI5OCwzNjU1NDMxMDApLG5ldyBiKDExMjYwMDA1ODAsMjYxODI5NzY3NiksbmV3IGIoMTI4ODAzMzQ3MCwzNDA5ODU1MTU4KSxuZXcgYigxNTAxNTA1OTQ4LDQyMzQ1MDk4NjYpLG5ldyBiKDE2MDcxNjc5MTUsOTg3MTY3NDY4KSxuZXcgYigxODE2NDAyMzE2LFxuMTI0NjE4OTU5MSldO1g9W25ldyBiKDAsMSksbmV3IGIoMCwzMjg5OCksbmV3IGIoMjE0NzQ4MzY0OCwzMjkwNiksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NDE2KSxuZXcgYigwLDMyOTA3KSxuZXcgYigwLDIxNDc0ODM2NDkpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzUxNjU0NSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3NyksbmV3IGIoMCwxMzgpLG5ldyBiKDAsMTM2KSxuZXcgYigwLDIxNDc1MTY0MjUpLG5ldyBiKDAsMjE0NzQ4MzY1OCksbmV3IGIoMCwyMTQ3NTE2NTU1KSxuZXcgYigyMTQ3NDgzNjQ4LDEzOSksbmV3IGIoMjE0NzQ4MzY0OCwzMjkwNSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3MSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3MCksbmV3IGIoMjE0NzQ4MzY0OCwxMjgpLG5ldyBiKDAsMzI3NzgpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzQ4MzY1OCksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NTQ1KSxuZXcgYigyMTQ3NDgzNjQ4LDMyODk2KSxuZXcgYigwLDIxNDc0ODM2NDkpLFxubmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NDI0KV07Vz1bWzAsMzYsMyw0MSwxOF0sWzEsNDQsMTAsNDUsMl0sWzYyLDYsNDMsMTUsNjFdLFsyOCw1NSwyNSwyMSw1Nl0sWzI3LDIwLDM5LDgsMTRdXTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShmdW5jdGlvbigpe3JldHVybiBDfSk6XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBleHBvcnRzPyhcInVuZGVmaW5lZFwiIT09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1DKSxleHBvcnRzPUMpOlkuanNTSEE9Q30pKHRoaXMpO1xuIiwiaW1wb3J0IGpzU0hBIGZyb20gJ2pzc2hhJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgaWYgKHdpbmRvdy5jcnlwdG8gJiYgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICB2YXIgYnVmID0gbmV3IFVpbnQxNkFycmF5KDgpO1xuICAgIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1Zik7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24obnVtKSB7IHZhciByZXQgPSBudW0udG9TdHJpbmcoMTYpOyB3aGlsZShyZXQubGVuZ3RoIDwgNCkgcmV0ID0gJzAnK3JldDsgcmV0dXJuIHJldDsgfTtcbiAgICByZXR1cm4gUzQoYnVmWzBdKStTNChidWZbMV0pKyctJytTNChidWZbMl0pKyctJytTNChidWZbM10pKyctJytTNChidWZbNF0pKyctJytTNChidWZbNV0pK1M0KGJ1Zls2XSkrUzQoYnVmWzddKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59XG5cbi8vIEhhc2hlcyB0aGUgZ2l2ZW4gdGV4dCB0byBhIFVVSUQgc3RyaW5nIG9mIGZvcm0gJ3h4eHh4eHh4LXl5eXktenp6ei13d3d3LWFhYWFhYWFhYWFhYScuXG5leHBvcnQgZnVuY3Rpb24gaGFzaFRvVVVJRCh0ZXh0KSB7XG4gIHZhciBzaGFPYmogPSBuZXcganNTSEEoJ1NIQS0yNTYnLCAnVEVYVCcpO1xuICBzaGFPYmoudXBkYXRlKHRleHQpO1xuICB2YXIgaGFzaCA9IG5ldyBVaW50OEFycmF5KHNoYU9iai5nZXRIYXNoKCdBUlJBWUJVRkZFUicpKTtcbiAgXG4gIHZhciBuID0gJyc7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoLmJ5dGVMZW5ndGgvMjsgKytpKSB7XG4gICAgdmFyIHMgPSAoaGFzaFtpXSBeIGhhc2hbaSs4XSkudG9TdHJpbmcoMTYpO1xuICAgIGlmIChzLmxlbmd0aCA9PSAxKSBzID0gJzAnICsgcztcbiAgICBuICs9IHM7XG4gIH1cbiAgcmV0dXJuIG4uc2xpY2UoMCwgOCkgKyAnLScgKyBuLnNsaWNlKDgsIDEyKSArICctJyArIG4uc2xpY2UoMTIsIDE2KSArICctJyArIG4uc2xpY2UoMTYsIDIwKSArICctJyArIG4uc2xpY2UoMjApO1xufVxuIiwidmFyIHJlc3VsdHNTZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMzMzLyc7XG5cbnZhciB1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzdWx0c1NlcnZlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgc3RvcmVTdGFydChyZXN1bHRzKSB7XG4gICAgaWYgKCF1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyKSByZXR1cm47XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3N0YXJ0XCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFJlY29yZGVkIHRlc3Qgc3RhcnQgdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3Rfc3RhcnRcIik7XG4gIH1cblxuICBzdG9yZVN5c3RlbUluZm8ocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfc3lzdGVtX2luZm9cIiwgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICBjb25zb2xlLmxvZygnUmVzdWx0c1NlcnZlcjogVXBsb2FkZWQgc3lzdGVtIGluZm8gdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3N5c3RlbV9pbmZvXCIpO1xuICB9XG5cbiAgc3RvcmVUZXN0UmVzdWx0cyhyZXN1bHRzKSB7XG4gICAgaWYgKCF1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyKSByZXR1cm47XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3Jlc3VsdHNcIiwgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICBjb25zb2xlLmxvZygnUmVzdWx0c1NlcnZlcjogUmVjb3JkZWQgdGVzdCBmaW5pc2ggdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3RfcmVzdWx0c1wiKTtcbiAgfSAgXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBzdHIgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvWyEnKCkqXS9nLCB4ID0+IGAlJHt4LmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9YCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdG9rZW4gPSAnJVthLWYwLTldezJ9JztcbnZhciBzaW5nbGVNYXRjaGVyID0gbmV3IFJlZ0V4cCh0b2tlbiwgJ2dpJyk7XG52YXIgbXVsdGlNYXRjaGVyID0gbmV3IFJlZ0V4cCgnKCcgKyB0b2tlbiArICcpKycsICdnaScpO1xuXG5mdW5jdGlvbiBkZWNvZGVDb21wb25lbnRzKGNvbXBvbmVudHMsIHNwbGl0KSB7XG5cdHRyeSB7XG5cdFx0Ly8gVHJ5IHRvIGRlY29kZSB0aGUgZW50aXJlIHN0cmluZyBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29tcG9uZW50cy5qb2luKCcnKSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIERvIG5vdGhpbmdcblx0fVxuXG5cdGlmIChjb21wb25lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBjb21wb25lbnRzO1xuXHR9XG5cblx0c3BsaXQgPSBzcGxpdCB8fCAxO1xuXG5cdC8vIFNwbGl0IHRoZSBhcnJheSBpbiAyIHBhcnRzXG5cdHZhciBsZWZ0ID0gY29tcG9uZW50cy5zbGljZSgwLCBzcGxpdCk7XG5cdHZhciByaWdodCA9IGNvbXBvbmVudHMuc2xpY2Uoc3BsaXQpO1xuXG5cdHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmNhbGwoW10sIGRlY29kZUNvbXBvbmVudHMobGVmdCksIGRlY29kZUNvbXBvbmVudHMocmlnaHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChpbnB1dCk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdHZhciB0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblxuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpbnB1dCA9IGRlY29kZUNvbXBvbmVudHModG9rZW5zLCBpKS5qb2luKCcnKTtcblxuXHRcdFx0dG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChpbnB1dCkge1xuXHQvLyBLZWVwIHRyYWNrIG9mIGFsbCB0aGUgcmVwbGFjZW1lbnRzIGFuZCBwcmVmaWxsIHRoZSBtYXAgd2l0aCB0aGUgYEJPTWBcblx0dmFyIHJlcGxhY2VNYXAgPSB7XG5cdFx0JyVGRSVGRic6ICdcXHVGRkZEXFx1RkZGRCcsXG5cdFx0JyVGRiVGRSc6ICdcXHVGRkZEXFx1RkZGRCdcblx0fTtcblxuXHR2YXIgbWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdHdoaWxlIChtYXRjaCkge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBEZWNvZGUgYXMgYmlnIGNodW5rcyBhcyBwb3NzaWJsZVxuXHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbMF0pO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dmFyIHJlc3VsdCA9IGRlY29kZShtYXRjaFswXSk7XG5cblx0XHRcdGlmIChyZXN1bHQgIT09IG1hdGNoWzBdKSB7XG5cdFx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR9XG5cblx0Ly8gQWRkIGAlQzJgIGF0IHRoZSBlbmQgb2YgdGhlIG1hcCB0byBtYWtlIHN1cmUgaXQgZG9lcyBub3QgcmVwbGFjZSB0aGUgY29tYmluYXRvciBiZWZvcmUgZXZlcnl0aGluZyBlbHNlXG5cdHJlcGxhY2VNYXBbJyVDMiddID0gJ1xcdUZGRkQnO1xuXG5cdHZhciBlbnRyaWVzID0gT2JqZWN0LmtleXMocmVwbGFjZU1hcCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Ly8gUmVwbGFjZSBhbGwgZGVjb2RlZCBjb21wb25lbnRzXG5cdFx0dmFyIGtleSA9IGVudHJpZXNbaV07XG5cdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKG5ldyBSZWdFeHAoa2V5LCAnZycpLCByZXBsYWNlTWFwW2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbmNvZGVkVVJJKSB7XG5cdGlmICh0eXBlb2YgZW5jb2RlZFVSSSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBgZW5jb2RlZFVSSWAgdG8gYmUgb2YgdHlwZSBgc3RyaW5nYCwgZ290IGAnICsgdHlwZW9mIGVuY29kZWRVUkkgKyAnYCcpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRlbmNvZGVkVVJJID0gZW5jb2RlZFVSSS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcblxuXHRcdC8vIFRyeSB0aGUgYnVpbHQgaW4gZGVjb2RlciBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIEZhbGxiYWNrIHRvIGEgbW9yZSBhZHZhbmNlZCBkZWNvZGVyXG5cdFx0cmV0dXJuIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHN0cmljdFVyaUVuY29kZSA9IHJlcXVpcmUoJ3N0cmljdC11cmktZW5jb2RlJyk7XG5jb25zdCBkZWNvZGVDb21wb25lbnQgPSByZXF1aXJlKCdkZWNvZGUtdXJpLWNvbXBvbmVudCcpO1xuXG5mdW5jdGlvbiBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnWycsXG5cdFx0XHRcdFx0aW5kZXgsXG5cdFx0XHRcdFx0J10nXG5cdFx0XHRcdF0uam9pbignJykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGVuY29kZShpbmRleCwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J109Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdJ10uam9pbignJykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1tdPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IGVuY29kZShrZXksIG9wdGlvbnMpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCc9Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0bGV0IHJlc3VsdDtcblxuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC9cXFsoXFxkKilcXF0kLy5leGVjKGtleSk7XG5cblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcZCpcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0ge307XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldW3Jlc3VsdFsxXV0gPSB2YWx1ZTtcblx0XHRcdH07XG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC8oXFxbXFxdKSQvLmV4ZWMoa2V5KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbdmFsdWVdO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZW5jb2RlKSB7XG5cdFx0cmV0dXJuIG9wdGlvbnMuc3RyaWN0ID8gc3RyaWN0VXJpRW5jb2RlKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5kZWNvZGUpIHtcblx0XHRyZXR1cm4gZGVjb2RlQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5c1NvcnRlcihpbnB1dCkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcblx0XHRyZXR1cm4gaW5wdXQuc29ydCgpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4ga2V5c1NvcnRlcihPYmplY3Qua2V5cyhpbnB1dCkpXG5cdFx0XHQuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuXHRcdFx0Lm1hcChrZXkgPT4gaW5wdXRba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3QoaW5wdXQpIHtcblx0Y29uc3QgcXVlcnlTdGFydCA9IGlucHV0LmluZGV4T2YoJz8nKTtcblx0aWYgKHF1ZXJ5U3RhcnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnNsaWNlKHF1ZXJ5U3RhcnQgKyAxKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe2RlY29kZTogdHJ1ZSwgYXJyYXlGb3JtYXQ6ICdub25lJ30sIG9wdGlvbnMpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdC8vIENyZWF0ZSBhbiBvYmplY3Qgd2l0aCBubyBwcm90b3R5cGVcblx0Y29uc3QgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuXHRpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRpbnB1dCA9IGlucHV0LnRyaW0oKS5yZXBsYWNlKC9eWz8jJl0vLCAnJyk7XG5cblx0aWYgKCFpbnB1dCkge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmb3IgKGNvbnN0IHBhcmFtIG9mIGlucHV0LnNwbGl0KCcmJykpIHtcblx0XHRsZXQgW2tleSwgdmFsdWVdID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcblxuXHRcdC8vIE1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0Ly8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuXHRcdHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iaiwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIW9iaikge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZSdcblx0fSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqKTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ICE9PSBmYWxzZSkge1xuXHRcdGtleXMuc29ydChvcHRpb25zLnNvcnQpO1xuXHR9XG5cblx0cmV0dXJuIGtleXMubWFwKGtleSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmpba2V5XTtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHRcdFx0Zm9yIChjb25zdCB2YWx1ZTIgb2YgdmFsdWUuc2xpY2UoKSkge1xuXHRcdFx0XHRpZiAodmFsdWUyID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlc3VsdC5wdXNoKGZvcm1hdHRlcihrZXksIHZhbHVlMiwgcmVzdWx0Lmxlbmd0aCkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmpvaW4oJyYnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucykgKyAnPScgKyBlbmNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXHR9KS5maWx0ZXIoeCA9PiB4Lmxlbmd0aCA+IDApLmpvaW4oJyYnKTtcbn07XG5cbmV4cG9ydHMucGFyc2VVcmwgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgaGFzaFN0YXJ0ID0gaW5wdXQuaW5kZXhPZignIycpO1xuXHRpZiAoaGFzaFN0YXJ0ICE9PSAtMSkge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgaGFzaFN0YXJ0KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0dXJsOiBpbnB1dC5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gYWRkR0VUKHVybCwgcGFyYW1ldGVyKSB7XG4gIGlmICh1cmwuaW5kZXhPZignPycpICE9IC0xKSByZXR1cm4gdXJsICsgJyYnICsgcGFyYW1ldGVyO1xuICBlbHNlIHJldHVybiB1cmwgKyAnPycgKyBwYXJhbWV0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5eXl5bW1kZGhobW1zcygpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICB2YXIgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1tID0gZGF0ZS5nZXRNb250aCgpIDwgOSA/IFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogKGRhdGUuZ2V0TW9udGgoKSArIDEpOyAvLyBnZXRNb250aCgpIGlzIHplcm8tYmFzZWRcbiAgdmFyIGRkICA9IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyBcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCk7XG4gIHZhciBoaCA9IGRhdGUuZ2V0SG91cnMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldEhvdXJzKCkgOiBkYXRlLmdldEhvdXJzKCk7XG4gIHZhciBtaW4gPSBkYXRlLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldE1pbnV0ZXMoKSA6IGRhdGUuZ2V0TWludXRlcygpO1xuICB2YXIgc2VjID0gZGF0ZS5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRTZWNvbmRzKCkgOiBkYXRlLmdldFNlY29uZHMoKTtcbiAgcmV0dXJuIHl5eXkgKyAnLScgKyBtbSArICctJyArIGRkICsgJyAnICsgaGggKyAnOicgKyBtaW4gKyAnOicgKyBzZWM7XG59XG4iLCJpbXBvcnQgYnJvd3NlckZlYXR1cmVzIGZyb20gJ2Jyb3dzZXItZmVhdHVyZXMnO1xuaW1wb3J0IHdlYmdsSW5mbyBmcm9tICd3ZWJnbC1pbmZvJztcbmltcG9ydCB7Z2VuZXJhdGVVVUlELCBoYXNoVG9VVUlEfSBmcm9tICcuL1VVSUQnO1xuaW1wb3J0IFJlc3VsdHNTZXJ2ZXIgZnJvbSAnLi9yZXN1bHRzLXNlcnZlcic7XG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCB7YWRkR0VULCB5eXl5bW1kZGhobW1zc30gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG5jb25zdCBWRVJTSU9OID0gJzEuMCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RBcHAge1xuICBwYXJzZVBhcmFtZXRlcnMoKSB7XG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgaWYgKHBhcmFtZXRlcnNbJ251bS10aW1lcyddKSB7XG4gICAgICB0aGlzLnZ1ZUFwcC5vcHRpb25zLmdlbmVyYWwubnVtVGltZXNUb1J1bkVhY2hUZXN0ID0gcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtLXRpbWVzJ10pO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJnbCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cy5mYWtlV2ViR0wgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICBpZiAocGFyYW1ldGVyc1snc2VsZWN0ZWQnXSkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJhbWV0ZXJzWydzZWxlY3RlZCddLnNwbGl0KCcsJyk7XG4gICAgICB0aGlzLnZ1ZUFwcC50ZXN0cy5mb3JFYWNoKHRlc3QgPT4gdGVzdC5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICAgIHNlbGVjdGVkLmZvckVhY2goaWQgPT4ge1xuICAgICAgICB2YXIgdGVzdCA9IHRoaXMudnVlQXBwLnRlc3RzLmZpbmQodGVzdCA9PiB0ZXN0LmlkID09PSBpZCk7XG4gICAgICAgIGlmICh0ZXN0KSB0ZXN0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgfVxuXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2dWVBcHApIHtcbiAgICBjb25zb2xlLmxvZyhgVGVzdCBBcHAgdi4ke1ZFUlNJT059YCk7XG5cbiAgICB0aGlzLnZ1ZUFwcCA9IHZ1ZUFwcDtcbiAgICB0aGlzLnRlc3RzID0gW107XG4gICAgdGhpcy5pc0N1cnJlbnRseVJ1bm5pbmdUZXN0ID0gZmFsc2U7XG4gICAgdGhpcy5icm93c2VyVVVJRCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdCA9IHt9O1xuICAgIHRoaXMucmVzdWx0c1NlcnZlciA9IG5ldyBSZXN1bHRzU2VydmVyKCk7XG4gICAgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuID0gW107XG4gICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XG5cbiAgICBmZXRjaCgndGVzdHMuanNvbicpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAganNvbi5mb3JFYWNoKHRlc3QgPT4ge1xuICAgICAgICAgIHRlc3Quc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXN0cyA9IHZ1ZUFwcC50ZXN0cyA9IGpzb247XG5cbiAgICAgICAgdGhpcy5wYXJzZVBhcmFtZXRlcnMoKTtcbiAgICAgICAgdGhpcy5hdXRvUnVuKCk7XG4gICAgICB9KVxuXG4gICAgdGhpcy5pbml0V1NTZXJ2ZXIoKTtcblxuICAgIHRoaXMud2ViZ2xJbmZvID0gdnVlQXBwLndlYmdsSW5mbyA9IHdlYmdsSW5mbygpO1xuICAgIGJyb3dzZXJGZWF0dXJlcyhmZWF0dXJlcyA9PiB7XG4gICAgICB0aGlzLmJyb3dzZXJJbmZvID0gdnVlQXBwLmJyb3dzZXJJbmZvID0gZmVhdHVyZXM7XG4gICAgICB0aGlzLm9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZCh7fSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0V1NTZXJ2ZXIoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG4gIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdiZW5jaG1hcmtfZmluaXNoZWQnLCAocmVzdWx0KSA9PiB7XG4gICAgICByZXN1bHQuanNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgNCk7XG4gICAgICB2YXIgb3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cykpO1xuXG4gICAgICAvLyBUbyByZW1vdmUgb3B0aW9ucyBcbiAgICAgIGRlbGV0ZSBvcHRpb25zLmZha2VXZWJHTDtcbiAgICAgIGRlbGV0ZSBvcHRpb25zLnNob3dLZXlzO1xuICAgICAgZGVsZXRlIG9wdGlvbnMuc2hvd01vdXNlO1xuICAgICAgZGVsZXRlIG9wdGlvbnMubm9DbG9zZU9uRmFpbDtcblxuICAgICAgcmVzdWx0Lm9wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICB2YXIgdGVzdFJlc3VsdHMgPSB7XG4gICAgICAgIHJlc3VsdDogcmVzdWx0XG4gICAgICB9O1xuICAgICAgdGVzdFJlc3VsdHMuYnJvd3NlclVVSUQgPSB0aGlzLmJyb3dzZXJVVUlEO1xuICAgICAgdGVzdFJlc3VsdHMuc3RhcnRUaW1lID0gdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5zdGFydFRpbWU7XG4gICAgICB0ZXN0UmVzdWx0cy5mYWtlV2ViR0wgPSB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmZha2VXZWJHTDtcbiAgICAgIC8vdGVzdFJlc3VsdHMuaWQgPSB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmlkO1xuICAgICAgdGVzdFJlc3VsdHMuZmluaXNoVGltZSA9IHl5eXltbWRkaGhtbXNzKCk7XG4gICAgICB0ZXN0UmVzdWx0cy5uYW1lID0gdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5uYW1lO1xuICAgICAgdGVzdFJlc3VsdHMucnVuVVVJRCA9IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QucnVuVVVJRDtcbiAgICAgIC8vaWYgKGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8gJiYgYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mby5VVUlEKSB0ZXN0UmVzdWx0cy5oYXJkd2FyZVVVSUQgPSBicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQ7XG4gICAgICB0ZXN0UmVzdWx0cy5ydW5PcmRpbmFsID0gdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdFJlc3VsdHMuaWRdID8gKHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Rlc3RSZXN1bHRzLmlkXS5sZW5ndGggKyAxKSA6IDE7XG4gICAgICB0aGlzLnJlc3VsdHNTZXJ2ZXIuc3RvcmVUZXN0UmVzdWx0cyh0ZXN0UmVzdWx0cyk7XG5cbiAgICAgIC8vIEFjY3VtdWxhdGUgcmVzdWx0cyBpbiBkaWN0aW9uYXJ5LlxuICAgICAgLy9pZiAodGVzdFJlc3VsdHMucmVzdWx0ICE9ICdGQUlMJykgXG4gICAgICB7XG4gICAgICAgIGlmICghdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbcmVzdWx0LnRlc3RfaWRdKSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0gPSBbXTtcbiAgICAgICAgdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbcmVzdWx0LnRlc3RfaWRdLnB1c2godGVzdFJlc3VsdHMpO1xuICAgICAgfVxuXG4gICAgICAvLyBBdmVyYWdlXG4gICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzQXZlcmFnZSA9IFtdO1xuICBcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkKS5mb3JFYWNoKHRlc3RJRCA9PiB7XG4gICAgICAgIHZhciByZXN1bHRzID0gdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdElEXTtcbiAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHZhciB0ZXN0UmVzdWx0c0F2ZXJhZ2UgPSB7fTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UudGVzdF9pZCA9IGAke3Rlc3RJRH0gKCR7cmVzdWx0cy5sZW5ndGh9IHNhbXBsZXMpYDtcbiAgICAgICAgXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0NzBQZXJjZW50QXZlcmFnZShnZXRGaWVsZCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0NzBQZXJjZW50QXJyYXkoKSB7XG4gICAgICAgICAgICAgIGZ1bmN0aW9uIGNtcChhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEZpZWxkKGEpIC0gZ2V0RmllbGQoYik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoIDw9IDMpIHJldHVybiByZXN1bHRzLnNsaWNlKDApO1xuICAgICAgICAgICAgICB2YXIgZnJhYyA9IE1hdGgucm91bmQoMC43ICogcmVzdWx0cy5sZW5ndGgpO1xuICAgICAgICAgICAgICB2YXIgcmVzdWx0c0MgPSByZXN1bHRzLnNsaWNlKDApO1xuICAgICAgICAgICAgICByZXN1bHRzQy5zb3J0KGNtcCk7XG4gICAgICAgICAgICAgIHZhciBudW1FbGVtZW50c1RvUmVtb3ZlID0gcmVzdWx0cy5sZW5ndGggLSBmcmFjO1xuICAgICAgICAgICAgICB2YXIgbnVtRWxlbWVudHNUb1JlbW92ZUZyb250ID0gTWF0aC5mbG9vcihudW1FbGVtZW50c1RvUmVtb3ZlLzIpO1xuICAgICAgICAgICAgICB2YXIgbnVtRWxlbWVudHNUb1JlbW92ZUJhY2sgPSBudW1FbGVtZW50c1RvUmVtb3ZlIC0gbnVtRWxlbWVudHNUb1JlbW92ZUZyb250O1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0c0Muc2xpY2UobnVtRWxlbWVudHNUb1JlbW92ZUZyb250LCByZXN1bHRzQy5sZW5ndGggLSBudW1FbGVtZW50c1RvUmVtb3ZlQmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJyID0gZ2V0NzBQZXJjZW50QXJyYXkoKTtcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IDA7XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB0b3RhbCArPSBnZXRGaWVsZChhcnJbaV0pO1xuICAgICAgICAgICAgcmV0dXJuIHRvdGFsIC8gYXJyLmxlbmd0aDtcbiAgICAgICAgICB9ICBcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UudG90YWxUaW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC50b3RhbFRpbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5jcHVJZGxlUGVyYyA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuY3B1SWRsZVBlcmM7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5jcHVJZGxlVGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuY3B1SWRsZVRpbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5jcHVUaW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5jcHVUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UucGFnZUxvYWRUaW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5wYWdlTG9hZFRpbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5hdmdGcHMgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmF2Z0ZwczsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnRpbWVUb0ZpcnN0RnJhbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LnRpbWVUb0ZpcnN0RnJhbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5udW1TdHV0dGVyRXZlbnRzID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5udW1TdHV0dGVyRXZlbnRzOyB9KTtcbiAgICAgICAgICAvKnRvdGFsUmVuZGVyVGltZSAgICAgdG90YWxUaW1lKi9cbiAgICAgICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzQXZlcmFnZS5wdXNoKHRlc3RSZXN1bHRzQXZlcmFnZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIFxuXG4gICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgIC8qXG4gICAgICBpZiAocnVubmluZ1Rlc3RzSW5Qcm9ncmVzcykge1xuICAgICAgICB2YXIgdGVzdFN0YXJ0ZWQgPSBydW5OZXh0UXVldWVkVGVzdCgpO1xuICAgICAgICBpZiAoIXRlc3RTdGFydGVkKSB7XG4gICAgICAgICAgaWYgKHRvcnR1cmVNb2RlKSB7XG4gICAgICAgICAgICB0ZXN0c1F1ZXVlZFRvUnVuID0gZ2V0U2VsZWN0ZWRUZXN0cygpO1xuICAgICAgICAgICAgcnVuU2VsZWN0ZWRUZXN0cygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBydW5uaW5nVGVzdHNJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICBjdXJyZW50bHlSdW5uaW5nVGVzdCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50bHlSdW5uaW5nVGVzdCA9IG51bGw7XG4gICAgICB9XG4gICAgICAqL1xuICAgICAgdGhpcy5ydW5OZXh0UXVldWVkVGVzdCgpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7ICBcbiAgfVxuXG4gIG9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnQnJvd3NlciBVVUlEOicsIHRoaXMuZ2V0QnJvd3NlclVVSUQoKSk7XG4gICAgdmFyIHN5c3RlbUluZm8gPSB7XG4gICAgICBicm93c2VyVVVJRDogdGhpcy5icm93c2VyVVVJRCxcbiAgICAgIHdlYmdsSW5mbzogdGhpcy53ZWJnbEluZm8sXG4gICAgICBicm93c2VySW5mbzogdGhpcy5icm93c2VySW5mb1xuICAgIH07XG5cbiAgICB0aGlzLnJlc3VsdHNTZXJ2ZXIuc3RvcmVTeXN0ZW1JbmZvKHN5c3RlbUluZm8pO1xuICB9XG5cbiAgcnVuU2VsZWN0ZWRUZXN0cygpIHtcbiAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSB0aGlzLnRlc3RzLmZpbHRlcih4ID0+IHguc2VsZWN0ZWQpO1xuICAgIFxuICAgIC8vaWYgKGRhdGEubnVtVGltZXNUb1J1bkVhY2hUZXN0ID4gMSkge1xuICAgIC8vICBkYXRhLm51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IE1hdGgubWF4KGRhdGEubnVtVGltZXNUb1J1bkVhY2hUZXN0LCAxMDAwKTtcbiAgICBjb25zdCBudW1UaW1lc1RvUnVuRWFjaFRlc3QgPSB0aGlzLnZ1ZUFwcC5vcHRpb25zLmdlbmVyYWwubnVtVGltZXNUb1J1bkVhY2hUZXN0O1xuICAgIHRoaXMucHJvZ3Jlc3MgPSB7XG4gICAgICB0b3RhbEdsb2JhbDogbnVtVGltZXNUb1J1bkVhY2hUZXN0ICogdGhpcy50ZXN0c1F1ZXVlZFRvUnVuLmxlbmd0aCxcbiAgICAgIGN1cnJlbnRHbG9iYWw6IDEsXG4gICAgICB0ZXN0czoge31cbiAgICB9O1xuXG4gICAge1xuICAgICAgdmFyIG11bHRpcGxlcyA9IFtdO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgbnVtVGltZXNUb1J1bkVhY2hUZXN0OyBqKyspIHtcbiAgICAgICAgICBtdWx0aXBsZXMucHVzaCh0aGlzLnRlc3RzUXVldWVkVG9SdW5baV0pO1xuICAgICAgICAgIHRoaXMucHJvZ3Jlc3MudGVzdHNbdGhpcy50ZXN0c1F1ZXVlZFRvUnVuW2ldLmlkXSA9IHtcbiAgICAgICAgICAgIGN1cnJlbnQ6IDEsXG4gICAgICAgICAgICB0b3RhbDogbnVtVGltZXNUb1J1bkVhY2hUZXN0XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSBtdWx0aXBsZXM7XG4gICAgfVxuXG4gICAgdGhpcy5ydW5uaW5nVGVzdHNJblByb2dyZXNzID0gdHJ1ZTtcbiAgICB0aGlzLnJ1bk5leHRRdWV1ZWRUZXN0KCk7XG4gIH1cbiAgXG4gIHJ1bk5leHRRdWV1ZWRUZXN0KCkgeyAgXG4gICAgaWYgKHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5sZW5ndGggPT0gMCkge1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IG51bGw7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciB0ID0gdGhpcy50ZXN0c1F1ZXVlZFRvUnVuWyAwIF07XG4gICAgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuLnNwbGljZSgwLCAxKTtcbiAgICB0aGlzLnJ1blRlc3QodC5pZCwgZmFsc2UpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0QnJvd3NlclVVSUQoKSB7XG4gICAgdmFyIGhhcmR3YXJlVVVJRCA9ICcnO1xuICAgIGlmICh0aGlzLm5hdGl2ZVN5c3RlbUluZm8gJiYgdGhpcy5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHtcbiAgICAgIGhhcmR3YXJlVVVJRCA9IHRoaXMubmF0aXZlU3lzdGVtSW5mby5VVUlEO1xuICAgIH0gZWxzZSB7XG4gICAgICBoYXJkd2FyZVVVSUQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnVVVJRCcpO1xuICAgICAgaWYgKCFoYXJkd2FyZVVVSUQpIHtcbiAgICAgICAgaGFyZHdhcmVVVUlEID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdVVUlEJywgaGFyZHdhcmVVVUlEKTtcbiAgICAgIH1cbiAgICB9XG4gIFxuICAgIC8vIFdlIG5vdyBoYXZlIGFsbCB0aGUgaW5mbyB0byBjb21wdXRlIHRoZSBicm93c2VyIFVVSURcbiAgICB2YXIgYnJvd3NlclVVSURTdHJpbmcgPSBoYXJkd2FyZVVVSUQgKyAodGhpcy5icm93c2VySW5mby51c2VyQWdlbnQuYnJvd3NlclZlcnNpb24gfHwgJycpICsgKHRoaXMuYnJvd3NlckluZm8ubmF2aWdhdG9yLmJ1aWxkSUQgfHwgJycpO1xuICAgIHRoaXMuYnJvd3NlclVVSUQgPSBoYXNoVG9VVUlEKGJyb3dzZXJVVUlEU3RyaW5nKTtcblxuICAgIHJldHVybiB0aGlzLmJyb3dzZXJVVUlEO1xuICB9XG5cbiAgcnVuVGVzdChpZCwgaW50ZXJhY3RpdmUsIHJlY29yZCkge1xuICAgIHZhciB0ZXN0ID0gdGhpcy50ZXN0cy5maW5kKHQgPT4gdC5pZCA9PT0gaWQpO1xuICAgIGlmICghdGVzdCkge1xuICAgICAgY29uc29sZS5lcnJvcignVGVzdCBub3QgZm91bmQsIGlkOicsIGlkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ1J1bm5pbmcgdGVzdDonLCB0ZXN0Lm5hbWUpO1xuICBcbiAgICB2YXIgZmFrZVdlYkdMID0gdGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cy5mYWtlV2ViR0w7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC50ZXN0ID0gdGVzdDtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnN0YXJ0VGltZSA9IHl5eXltbWRkaGhtbXNzKCk7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlEID0gZ2VuZXJhdGVVVUlEKCk7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5mYWtlV2ViR0wgPSBmYWtlV2ViR0w7XG4gICAgXG4gICAgdmFyIHVybCA9IChpbnRlcmFjdGl2ZSA/ICdzdGF0aWMvJzogJ3Rlc3RzLycpICsgdGVzdC51cmw7XG4gICAgaWYgKCFpbnRlcmFjdGl2ZSkgdXJsID0gYWRkR0VUKHVybCwgJ3BsYXliYWNrJyk7XG4gICAgaWYgKGZha2VXZWJHTCkgdXJsID0gYWRkR0VUKHVybCwgJ2Zha2Utd2ViZ2wnKTtcbiAgICBpZiAodGVzdC5udW1mcmFtZXMpIHVybCA9IGFkZEdFVCh1cmwsICdudW0tZnJhbWVzPScgKyB0ZXN0Lm51bWZyYW1lcyk7XG4gICAgaWYgKHRlc3Qud2luZG93c2l6ZSkgdXJsID0gYWRkR0VUKHVybCwgJ3dpZHRoPScgKyB0ZXN0LndpbmRvd3NpemUud2lkdGggKyAnJmhlaWdodD0nICsgdGVzdC53aW5kb3dzaXplLmhlaWdodCk7XG4gICAgaWYgKHJlY29yZCkge1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ3JlY29yZGluZycpO1xuICAgIH0gZWxzZSBpZiAodGVzdC5pbnB1dCkge1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ3JlcGxheScpO1xuICAgICAgaWYgKHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHMuc2hvd0tleXMpIHVybCA9IGFkZEdFVCh1cmwsICdzaG93LWtleXMnKTtcbiAgICAgIGlmICh0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzLnNob3dNb3VzZSkgdXJsID0gYWRkR0VUKHVybCwgJ3Nob3ctbW91c2UnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cy5ub0Nsb3NlT25GYWlsKSB1cmwgPSBhZGRHRVQodXJsLCAnbm8tY2xvc2Utb24tZmFpbCcpO1xuICAgIGlmICh0ZXN0LnNraXBSZWZlcmVuY2VJbWFnZVRlc3QpIHVybCA9IGFkZEdFVCh1cmwsICdza2lwLXJlZmVyZW5jZS1pbWFnZS10ZXN0Jyk7XG4gICAgaWYgKHRlc3QucmVmZXJlbmNlSW1hZ2UpIHVybCA9IGFkZEdFVCh1cmwsICdyZWZlcmVuY2UtaW1hZ2UnKTtcblxuICAgIGlmICh0aGlzLnByb2dyZXNzKSB7XG4gICAgICB1cmwgPSBhZGRHRVQodXJsLCAnb3JkZXItdGVzdD0nICsgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0uY3VycmVudCArICcmdG90YWwtdGVzdD0nICsgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0udG90YWwpO1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ29yZGVyLWdsb2JhbD0nICsgdGhpcy5wcm9ncmVzcy5jdXJyZW50R2xvYmFsICsgJyZ0b3RhbC1nbG9iYWw9JyArIHRoaXMucHJvZ3Jlc3MudG90YWxHbG9iYWwpO1xuICAgICAgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0uY3VycmVudCsrO1xuICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50R2xvYmFsKys7XG4gICAgfVxuXG4gICAgd2luZG93Lm9wZW4odXJsKTtcbiAgXG4gICAgdmFyIHRlc3REYXRhID0ge1xuICAgICAgJ2Jyb3dzZXJVVUlEJzogdGhpcy5icm93c2VyVVVJRCxcbiAgICAgICdpZCc6IHRlc3QuaWQsXG4gICAgICAnbmFtZSc6IHRlc3QubmFtZSxcbiAgICAgICdzdGFydFRpbWUnOiB5eXl5bW1kZGhobW1zcygpLFxuICAgICAgJ3Jlc3VsdCc6ICd1bmZpbmlzaGVkJyxcbiAgICAgIC8vJ0Zha2VXZWJHTCc6IGRhdGEub3B0aW9ucy5mYWtlV2ViR0wsXG4gICAgICAncnVuVVVJRCc6IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QucnVuVVVJRCxcbiAgICAgICdydW5PcmRpbmFsJzogdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdC5pZF0gPyAodGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdC5pZF0ubGVuZ3RoICsgMSkgOiAxXG4gICAgfTtcbiAgXG4gICAgLy9pZiAoZGF0YS5uYXRpdmVTeXN0ZW1JbmZvICYmIGRhdGEubmF0aXZlU3lzdGVtSW5mby5VVUlEKSB0ZXN0RGF0YS5oYXJkd2FyZVVVSUQgPSBkYXRhLm5hdGl2ZVN5c3RlbUluZm8uVVVJRDtcbiAgICAvL3RoaXMucmVzdWx0c1NlcnZlci5zdG9yZVN0YXJ0KHRlc3REYXRhKTtcbiAgfVxuICBcbiAgYXV0b1J1bigpIHtcbiAgICBpZiAoIXRoaXMuaXNDdXJyZW50bHlSdW5uaW5nVGVzdCAmJiBsb2NhdGlvbi5zZWFyY2gudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhdXRvcnVuJykgIT09IC0xKSB7XG4gICAgICB0aGlzLnJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICB9XG4gIH0gXG59XG5cbi8qXG4gIC8vIEZldGNoIGluZm9ybWF0aW9uIGFib3V0IG5hdGl2ZSBzeXN0ZW0gaWYgd2UgYXJlIHJ1bm5pbmcgYXMgbG9jYWxob3N0LlxuICBmdW5jdGlvbiBmZXRjaE5hdGl2ZVN5c3RlbUluZm8oKSB7XG4gICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBuYXRpdmVTeXN0ZW1JbmZvID0gbnVsbDtcbiAgICAgIHZhciBzeXN0ZW1JbmZvID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICBzeXN0ZW1JbmZvLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc3lzdGVtSW5mby5yZWFkeVN0YXRlICE9IDQpIHJldHVybjtcbiAgICAgICAgdmFyIG5hdGl2ZVN5c3RlbUluZm8gPSBKU09OLnBhcnNlKHN5c3RlbUluZm8ucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgcmVzb2x2ZShuYXRpdmVTeXN0ZW1JbmZvKTtcbiAgICAgIH1cbiAgICAgIHN5c3RlbUluZm8ub3BlbignUE9TVCcsICdzeXN0ZW1faW5mbycsIHRydWUpO1xuICAgICAgc3lzdGVtSW5mby5zZW5kKCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxudmFyIG5hdGl2ZUluZm9Qcm9taXNlO1xuaWYgKGxvY2F0aW9uLmhyZWYuaW5kZXhPZignaHR0cDovL2xvY2FsaG9zdCcpID09IDApIHtcbiAgbmF0aXZlSW5mb1Byb21pc2UgPSBmZXRjaE5hdGl2ZVN5c3RlbUluZm8oKTtcbn0gZWxzZSB7XG4gIG5hdGl2ZUluZm9Qcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHJlc29sdmUoKTsgfSwgMSk7IH0pO1xufVxuXG5Qcm9taXNlLmFsbChbYnJvd3NlckluZm9Qcm9taXNlLCBuYXRpdmVJbmZvUHJvbWlzZV0pLnRoZW4oZnVuY3Rpb24oYWxsUmVzdWx0cykge1xuICB2YXIgYnJvd3NlckluZm8gPSBhbGxSZXN1bHRzWzBdO1xuICB2YXIgbmF0aXZlSW5mbyA9IGFsbFJlc3VsdHNbMV07XG4gIGlmIChuYXRpdmVJbmZvKSB7XG4gICAgYnJvd3NlckluZm9bJ25hdGl2ZVN5c3RlbUluZm8nXSA9IG5hdGl2ZUluZm9bJ3N5c3RlbSddO1xuICAgIGJyb3dzZXJJbmZvWydicm93c2VySW5mbyddID0gbmF0aXZlSW5mb1snYnJvd3NlciddO1xuICB9XG4gIGJyb3dzZXJJbmZvWydicm93c2VyVVVJRCddID0gYnJvd3NlclVVSUQ7XG4gIG9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZChicm93c2VySW5mbyk7XG59LCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5lcnJvcignYnJvd3NlciBpbmZvIHRlc3QgZmFpbGVkIScpO1xufSk7XG4qL1xuXG4iLCJpbXBvcnQgVGVzdEFwcCBmcm9tICcuL2FwcCc7XG5cbnZhciBkYXRhID0ge1xuICB0ZXN0czogW10sXG4gIHNob3dfanNvbjogZmFsc2UsXG4gIGJyb3dzZXJJbmZvOiBudWxsLFxuICB3ZWJnbEluZm86IG51bGwsXG4gIG5hdGl2ZVN5c3RlbUluZm86IHt9LFxuICBzaG93SW5mbzogZmFsc2UsXG4gIG9wdGlvbnM6IHtcbiAgICBnZW5lcmFsOiB7XG4gICAgICBudW1UaW1lc1RvUnVuRWFjaFRlc3Q6IDEsXG4gICAgfSxcbiAgICB0ZXN0czoge1xuICAgICAgZmFrZVdlYkdMOiBmYWxzZSxcbiAgICAgIHNob3dLZXlzOiBmYWxzZSxcbiAgICAgIHNob3dNb3VzZTogZmFsc2UsXG4gICAgICBub0Nsb3NlT25GYWlsOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgcmVzdWx0czogW10sXG4gIHJlc3VsdHNBdmVyYWdlOiBbXSxcbiAgcmVzdWx0c0J5SWQ6IHt9XG59O1xuXG52YXIgdGVzdEFwcCA9IG51bGw7XG5cbndpbmRvdy5vbmxvYWQgPSAoeCkgPT4ge1xuICB2YXIgdnVlQXBwID0gbmV3IFZ1ZSh7XG4gICAgZWw6ICcjYXBwJyxcbiAgICBkYXRhOiBkYXRhLFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIGZvcm1hdE51bWVyaWModmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvRml4ZWQoMik7XG4gICAgICB9LFxuICAgICAgcnVuVGVzdDogZnVuY3Rpb24odGVzdCwgaW50ZXJhY3RpdmUsIHJlY29yZGluZykge1xuICAgICAgICB0ZXN0QXBwLnRlc3RzUXVldWVkVG9SdW4gPSBbXTtcbiAgICAgICAgdGVzdEFwcC5ydW5UZXN0KHRlc3QuaWQsIGludGVyYWN0aXZlLCByZWNvcmRpbmcpO1xuICAgICAgfSxcbiAgICAgIHJ1blNlbGVjdGVkVGVzdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0ZXN0QXBwLnJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICAgIH0sXG4gICAgICBnZXRCcm93c2VySW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gZGF0YS5icm93c2VySW5mbyA/IEpTT04uc3RyaW5naWZ5KGRhdGEuYnJvd3NlckluZm8sIG51bGwsIDQpIDogJ0NoZWNraW5nIGJyb3dzZXIgZmVhdHVyZXMuLi4nO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIFxuICB0ZXN0QXBwID0gbmV3IFRlc3RBcHAodnVlQXBwKTtcblxufVxuIl0sIm5hbWVzIjpbInVzZXJBZ2VudEluZm8iLCJ0aGlzIiwianNTSEEiLCJkZWNvZGUiLCJkZWNvZGVDb21wb25lbnQiLCJicm93c2VyRmVhdHVyZXMiXSwibWFw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QUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUU7Q0FDcGYsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVO0NBQzFmLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVUsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztDQUM5Z0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7RUFDcGhCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0VBQWtFLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0NBQ3RmLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUSxDQUFDLEdBQUcsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsS0FBSyxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7RUFDbGhCLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM2YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrRUFBa0UsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQy9qQixDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdGYsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUN0ZixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3hmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtFQUNyZixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyZixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDNWYsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUNwZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0NBQy9mLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0ZixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUztDQUNyZixVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVTtDQUN2ZixVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUM7Q0FDL2YsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDO0NBQ3BmLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDL2YsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVO0NBQ3BmLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Q0FDcmYsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUErSCxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFXLENBQUMsRUFBRUMsY0FBSSxDQUFDLENBQUM7OztDQzFDelMsU0FBUyxZQUFZLEdBQUc7Q0FDL0IsRUFBRSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7Q0FDdEQsSUFBSSxJQUFJLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLElBQUksSUFBSSxFQUFFLEdBQUcsU0FBUyxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUM1RyxJQUFJLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkgsR0FBRyxNQUFNO0NBQ1QsSUFBSSxPQUFPLHNDQUFzQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7Q0FDL0UsTUFBTSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztD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
