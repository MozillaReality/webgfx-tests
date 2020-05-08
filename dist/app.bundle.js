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
