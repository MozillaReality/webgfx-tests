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
		const defaults = {
			encode: true,
			strict: true,
			arrayFormat: 'none'
		};

		options = Object.assign(defaults, options);

		if (options.sort === false) {
			options.sort = () => {};
		}

		const formatter = encoderForArrayFormat(options);

		return obj ? Object.keys(obj).sort(options.sort).map(key => {
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
		}).filter(x => x.length > 0).join('&') : '';
	};

	var parseUrl = (input, options) => {
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
	    if (parameters['numtimes']) {
	      this.vueApp.options.general.numTimesToRunEachTest = parseInt(parameters.numtimes);
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
	      if (options.fakeWebGL === false) {
	        delete options.fakeWebGL;
	      }

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
	    if (test.numframes) url = addGET(url, 'numframes=' + test.numframes);
	    if (test.windowsize) url = addGET(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);
	    if (record) {
	      url = addGET(url, 'recording');
	    } else if (test.input) {
	      url = addGET(url, 'replay');
	      if (this.vueApp.options.tests.showKeys) url = addGET(url, 'show-keys');
	      if (this.vueApp.options.tests.showMouse) url = addGET(url, 'show-mouse');
	    }
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
	      numTimesToRunEachTest: 1
	    },
	    tests: {
	      fakeWebGL: false,
	      showKeys: false,
	      showMouse: false
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3VzZXJhZ2VudC1pbmZvL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3ZzeW5jLWVzdGltYXRlL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItZmVhdHVyZXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd2ViZ2wtaW5mby9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9qc3NoYS9zcmMvc2hhLmpzIiwiVVVJRC5qcyIsInJlc3VsdHMtc2VydmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3N0cmljdC11cmktZW5jb2RlL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlY29kZS11cmktY29tcG9uZW50L2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3F1ZXJ5LXN0cmluZy9pbmRleC5qcyIsInV0aWxzLmpzIiwiYXBwLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVHJpbXMgd2hpdGVzcGFjZSBpbiBlYWNoIHN0cmluZyBmcm9tIGFuIGFycmF5IG9mIHN0cmluZ3NcbmZ1bmN0aW9uIHRyaW1TcGFjZXNJbkVhY2hFbGVtZW50KGFycikge1xuICByZXR1cm4gYXJyLm1hcChmdW5jdGlvbih4KSB7IHJldHVybiB4LnRyaW0oKTsgfSk7XG59XG5cbi8vIFJldHVybnMgYSBjb3B5IG9mIHRoZSBnaXZlbiBhcnJheSB3aXRoIGVtcHR5L3VuZGVmaW5lZCBzdHJpbmcgZWxlbWVudHMgcmVtb3ZlZCBpbiBiZXR3ZWVuXG5mdW5jdGlvbiByZW1vdmVFbXB0eUVsZW1lbnRzKGFycikge1xuICByZXR1cm4gYXJyLmZpbHRlcihmdW5jdGlvbih4KSB7IHJldHVybiB4ICYmIHgubGVuZ3RoID4gMDsgfSk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGlzIGVuY2xvc2VkIGluIHBhcmVudGhlc2VzLCBlLmcuIGlzIG9mIGZvcm0gXCIoc29tZXRoaW5nKVwiXG5mdW5jdGlvbiBpc0VuY2xvc2VkSW5QYXJlbnMoc3RyKSB7XG4gIHJldHVybiBzdHJbMF0gPT0gJygnICYmIHN0cltzdHIubGVuZ3RoLTFdID09ICcpJztcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBzdWJzdHJpbmcgaXMgY29udGFpbmVkIGluIHRoZSBzdHJpbmcgKGNhc2Ugc2Vuc2l0aXZlKVxuZnVuY3Rpb24gY29udGFpbnMoc3RyLCBzdWJzdHIpIHtcbiAgcmV0dXJuIHN0ci5pbmRleE9mKHN1YnN0cikgPj0gMDtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBhbnkgb2YgdGhlIGdpdmVuIHN1YnN0cmluZ3MgaW4gdGhlIGxpc3QgaXMgY29udGFpbmVkIGluIHRoZSBmaXJzdCBwYXJhbWV0ZXIgc3RyaW5nIChjYXNlIHNlbnNpdGl2ZSlcbmZ1bmN0aW9uIGNvbnRhaW5zQW55T2Yoc3RyLCBzdWJzdHJMaXN0KSB7XG4gIGZvcih2YXIgaSBpbiBzdWJzdHJMaXN0KSBpZiAoY29udGFpbnMoc3RyLCBzdWJzdHJMaXN0W2ldKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG4vLyBTcGxpdHMgYW4gdXNlciBhZ2VudCBzdHJpbmcgbG9naWNhbGx5IGludG8gYW4gYXJyYXkgb2YgdG9rZW5zLCBlLmcuXG4vLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbi8vIC0+IFsnTW96aWxsYS81LjAnLCAnKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSknLCAnQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbyknLCAnQ2hyb21lLzUxLjAuMjcwNC44MScsICdNb2JpbGUgU2FmYXJpLzUzNy4zNiddXG5mdW5jdGlvbiBzcGxpdFVzZXJBZ2VudChzdHIpIHtcbiAgc3RyID0gc3RyLnRyaW0oKTtcbiAgdmFyIHVhTGlzdCA9IFtdO1xuICB2YXIgdG9rZW5zID0gJyc7XG4gIC8vIFNwbGl0IGJ5IHNwYWNlcywgd2hpbGUga2VlcGluZyB0b3AgbGV2ZWwgcGFyZW50aGVzZXMgaW50YWN0LCBzb1xuICAvLyBcIk1vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMSkgTW9iaWxlIFNhZmFyaS81MzcuMzZcIiBiZWNvbWVzXG4gIC8vIFsnTW96aWxsYS81LjAnLCAnKExpbnV4OyBBbmRyb2lkIDYuMC4xKScsICdNb2JpbGUnLCAnU2FmYXJpLzUzNy4zNiddXG4gIHZhciBwYXJlbnNOZXN0aW5nID0gMDtcbiAgZm9yKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChzdHJbaV0gPT0gJyAnICYmIHBhcmVuc05lc3RpbmcgPT0gMCkge1xuICAgICAgaWYgKHRva2Vucy50cmltKCkubGVuZ3RoICE9IDApIHVhTGlzdC5wdXNoKHRva2Vucy50cmltKCkpO1xuICAgICAgdG9rZW5zID0gJyc7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT0gJygnKSArK3BhcmVuc05lc3Rpbmc7XG4gICAgZWxzZSBpZiAoc3RyW2ldID09ICcpJykgLS1wYXJlbnNOZXN0aW5nO1xuICAgIHRva2VucyA9IHRva2VucyArIHN0cltpXTtcbiAgfVxuICBpZiAodG9rZW5zLnRyaW0oKS5sZW5ndGggPiAwKSB1YUxpc3QucHVzaCh0b2tlbnMudHJpbSgpKTtcblxuICAvLyBXaGF0IGZvbGxvd3MgaXMgYSBudW1iZXIgb2YgaGV1cmlzdGljIGFkYXB0YXRpb25zIHRvIGFjY291bnQgZm9yIFVBIHN0cmluZ3MgbWV0IGluIHRoZSB3aWxkOlxuXG4gIC8vIEZ1c2UgWydhL3ZlcicsICcoc29tZWluZm8pJ10gdG9nZXRoZXIuIEZvciBleGFtcGxlOlxuICAvLyAnTW96aWxsYS81LjAgKExpbnV4OyBBbmRyb2lkIDYuMC4xOyBOZXh1cyA1IEJ1aWxkL01PQjMwTSkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzUxLjAuMjcwNC44MSBNb2JpbGUgU2FmYXJpLzUzNy4zNidcbiAgLy8gLT4gZnVzZSAnQXBwbGVXZWJLaXQvNTM3LjM2JyBhbmQgJyhLSFRNTCwgbGlrZSBHZWNrbyknIHRvZ2V0aGVyXG4gIGZvcih2YXIgaSA9IDE7IGkgPCB1YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgbCA9IHVhTGlzdFtpXTtcbiAgICBpZiAoaXNFbmNsb3NlZEluUGFyZW5zKGwpICYmICFjb250YWlucyhsLCAnOycpICYmIGkgPiAxKSB7XG4gICAgICB1YUxpc3RbaS0xXSA9IHVhTGlzdFtpLTFdICsgJyAnICsgbDtcbiAgICAgIHVhTGlzdFtpXSA9ICcnO1xuICAgIH1cbiAgfVxuICB1YUxpc3QgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHVhTGlzdCk7XG5cbiAgLy8gRnVzZSBbJ2ZvbycsICdiYXIvdmVyJ10gdG9nZXRoZXIsIGlmICdmb28nIGhhcyBvbmx5IGFzY2lpIGNoYXJzLiBGb3IgZXhhbXBsZTpcbiAgLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4gIC8vIC0+IGZ1c2UgWydNb2JpbGUnLCAnU2FmYXJpLzUzNy4zNiddIHRvZ2V0aGVyXG4gIGZvcih2YXIgaSA9IDA7IGkgPCB1YUxpc3QubGVuZ3RoLTE7ICsraSkge1xuICAgIHZhciBsID0gdWFMaXN0W2ldO1xuICAgIHZhciBuZXh0ID0gdWFMaXN0W2krMV07XG4gICAgaWYgKC9eW2EtekEtWl0rJC8udGVzdChsKSAmJiBjb250YWlucyhuZXh0LCAnLycpKSB7XG4gICAgICB1YUxpc3RbaSsxXSA9IGwgKyAnICcgKyBuZXh0O1xuICAgICAgdWFMaXN0W2ldID0gJyc7XG4gICAgfVxuICB9XG4gIHVhTGlzdCA9IHJlbW92ZUVtcHR5RWxlbWVudHModWFMaXN0KTtcbiAgcmV0dXJuIHVhTGlzdDtcbn1cblxuLy8gRmluZHMgdGhlIHNwZWNpYWwgdG9rZW4gaW4gdGhlIHVzZXIgYWdlbnQgdG9rZW4gbGlzdCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBwbGF0Zm9ybSBpbmZvLlxuLy8gVGhpcyBpcyB0aGUgZmlyc3QgZWxlbWVudCBjb250YWluZWQgaW4gcGFyZW50aGVzZXMgdGhhdCBoYXMgc2VtaWNvbG9uIGRlbGltaXRlZCBlbGVtZW50cy5cbi8vIFJldHVybnMgdGhlIHBsYXRmb3JtIGluZm8gYXMgYW4gYXJyYXkgc3BsaXQgYnkgdGhlIHNlbWljb2xvbnMuXG5mdW5jdGlvbiBzcGxpdFBsYXRmb3JtSW5mbyh1YUxpc3QpIHtcbiAgZm9yKHZhciBpID0gMDsgaSA8IHVhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBpdGVtID0gdWFMaXN0W2ldO1xuICAgIGlmIChpc0VuY2xvc2VkSW5QYXJlbnMoaXRlbSkpIHtcbiAgICAgIHJldHVybiByZW1vdmVFbXB0eUVsZW1lbnRzKHRyaW1TcGFjZXNJbkVhY2hFbGVtZW50KGl0ZW0uc3Vic3RyKDEsIGl0ZW0ubGVuZ3RoLTIpLnNwbGl0KCc7JykpKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gRGVkdWNlcyB0aGUgb3BlcmF0aW5nIHN5c3RlbSBmcm9tIHRoZSB1c2VyIGFnZW50IHBsYXRmb3JtIGluZm8gdG9rZW4gbGlzdC5cbmZ1bmN0aW9uIGZpbmRPUyh1YVBsYXRmb3JtSW5mbykge1xuICB2YXIgb3NlcyA9IFsnQW5kcm9pZCcsICdCU0QnLCAnTGludXgnLCAnV2luZG93cycsICdpUGhvbmUgT1MnLCAnTWFjIE9TJywgJ0JTRCcsICdDck9TJywgJ0RhcndpbicsICdEcmFnb25mbHknLCAnRmVkb3JhJywgJ0dlbnRvbycsICdVYnVudHUnLCAnZGViaWFuJywgJ0hQLVVYJywgJ0lSSVgnLCAnU3VuT1MnLCAnTWFjaW50b3NoJywgJ1dpbiA5eCcsICdXaW45OCcsICdXaW45NScsICdXaW5OVCddO1xuICBmb3IodmFyIG9zIGluIG9zZXMpIHtcbiAgICBmb3IodmFyIGkgaW4gdWFQbGF0Zm9ybUluZm8pIHtcbiAgICAgIHZhciBpdGVtID0gdWFQbGF0Zm9ybUluZm9baV07XG4gICAgICBpZiAoY29udGFpbnMoaXRlbSwgb3Nlc1tvc10pKSByZXR1cm4gaXRlbTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICdPdGhlcic7XG59XG5cbi8vIEZpbHRlcnMgdGhlIHByb2R1Y3QgY29tcG9uZW50cyAoaXRlbXMgb2YgZm9ybWF0ICdmb28vdmVyc2lvbicpIGZyb20gdGhlIHVzZXIgYWdlbnQgdG9rZW4gbGlzdC5cbmZ1bmN0aW9uIHBhcnNlUHJvZHVjdENvbXBvbmVudHModWFMaXN0KSB7XG4gIHVhTGlzdCA9IHVhTGlzdC5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4gY29udGFpbnMoeCwgJy8nKSAmJiAhaXNFbmNsb3NlZEluUGFyZW5zKHgpOyB9KTtcbiAgdmFyIHByb2R1Y3RDb21wb25lbnRzID0ge307XG4gIGZvcih2YXIgaSBpbiB1YUxpc3QpIHtcbiAgICB2YXIgeCA9IHVhTGlzdFtpXTtcbiAgICBpZiAoY29udGFpbnMoeCwgJy8nKSkge1xuICAgICAgeCA9IHguc3BsaXQoJy8nKTtcbiAgICAgIGlmICh4Lmxlbmd0aCAhPSAyKSB0aHJvdyB1YUxpc3RbaV07XG4gICAgICBwcm9kdWN0Q29tcG9uZW50c1t4WzBdLnRyaW0oKV0gPSB4WzFdLnRyaW0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvZHVjdENvbXBvbmVudHNbeF0gPSB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcHJvZHVjdENvbXBvbmVudHM7XG59XG5cbi8vIE1hcHMgV2luZG93cyBOVCB2ZXJzaW9uIHRvIGh1bWFuLXJlYWRhYmxlIFdpbmRvd3MgUHJvZHVjdCB2ZXJzaW9uXG5mdW5jdGlvbiB3aW5kb3dzRGlzdHJpYnV0aW9uTmFtZSh3aW5OVFZlcnNpb24pIHtcbiAgdmFyIHZlcnMgPSB7XG4gICAgJzUuMCc6ICcyMDAwJyxcbiAgICAnNS4xJzogJ1hQJyxcbiAgICAnNS4yJzogJ1hQJyxcbiAgICAnNi4wJzogJ1Zpc3RhJyxcbiAgICAnNi4xJzogJzcnLFxuICAgICc2LjInOiAnOCcsXG4gICAgJzYuMyc6ICc4LjEnLFxuICAgICcxMC4wJzogJzEwJ1xuICB9XG4gIGlmICghdmVyc1t3aW5OVFZlcnNpb25dKSByZXR1cm4gJ05UICcgKyB3aW5OVFZlcnNpb247XG4gIHJldHVybiB2ZXJzW3dpbk5UVmVyc2lvbl07XG59XG5cbi8vIFRoZSBmdWxsIGZ1bmN0aW9uIHRvIGRlY29tcG9zZSBhIGdpdmVuIHVzZXIgYWdlbnQgdG8gdGhlIGludGVyZXN0aW5nIGxvZ2ljYWwgaW5mbyBiaXRzLlxuLy8gXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWR1Y2VVc2VyQWdlbnQodXNlckFnZW50KSB7XG4gIHVzZXJBZ2VudCA9IHVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudXNlckFnZW50O1xuICB2YXIgdWEgPSB7XG4gICAgdXNlckFnZW50OiB1c2VyQWdlbnQsXG4gICAgcHJvZHVjdENvbXBvbmVudHM6IHt9LFxuICAgIHBsYXRmb3JtSW5mbzogW11cbiAgfTtcblxuICB0cnkge1xuICAgIHZhciB1YUxpc3QgPSBzcGxpdFVzZXJBZ2VudCh1c2VyQWdlbnQpO1xuICAgIHZhciB1YVBsYXRmb3JtSW5mbyA9IHNwbGl0UGxhdGZvcm1JbmZvKHVhTGlzdCk7XG4gICAgdmFyIHByb2R1Y3RDb21wb25lbnRzID0gcGFyc2VQcm9kdWN0Q29tcG9uZW50cyh1YUxpc3QpO1xuICAgIHVhLnByb2R1Y3RDb21wb25lbnRzID0gcHJvZHVjdENvbXBvbmVudHM7XG4gICAgdWEucGxhdGZvcm1JbmZvID0gdWFQbGF0Zm9ybUluZm87XG4gICAgdmFyIHVhbCA9IHVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgLy8gRGVkdWNlIGFyY2ggYW5kIGJpdG5lc3NcbiAgICB2YXIgYjMyT242NCA9IFsnd293NjQnXTtcbiAgICBpZiAoY29udGFpbnModWFsLCAnd293NjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9ICczMi1vbi02NCc7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIGlmIChjb250YWluc0FueU9mKHVhbCwgWyd4ODZfNjQnLCAnYW1kNjQnLCAnaWE2NCcsICd3aW42NCcsICd4NjQnXSkpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ3BwYzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAnUFBDJztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ3NwYXJjNjQnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICdTUEFSQyc7XG4gICAgfSBlbHNlIGlmIChjb250YWluc0FueU9mKHVhbCwgWydpMzg2JywgJ2k0ODYnLCAnaTU4NicsICdpNjg2JywgJ3g4NiddKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDMyO1xuICAgICAgdWEuYXJjaCA9ICd4ODYnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnYXJtNycpIHx8IGNvbnRhaW5zKHVhbCwgJ2FuZHJvaWQnKSB8fCBjb250YWlucyh1YWwsICdtb2JpbGUnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDMyO1xuICAgICAgdWEuYXJjaCA9ICdBUk0nO1xuICAgIC8vIEhldXJpc3RpYzogQXNzdW1lIGFsbCBPUyBYIGFyZSA2NC1iaXQsIGFsdGhvdWdoIHRoaXMgaXMgbm90IGNlcnRhaW4uIE9uIE9TIFgsIDY0LWJpdCBicm93c2Vyc1xuICAgIC8vIGRvbid0IGFkdmVydGlzZSBiZWluZyA2NC1iaXQuXG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdpbnRlbCBtYWMgb3MnKSkge1xuICAgICAgdWEuYml0bmVzcyA9IDY0O1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSB7XG4gICAgICB1YS5iaXRuZXNzID0gMzI7XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIG9wZXJhdGluZyBzeXN0ZW1cbiAgICB2YXIgb3MgPSBmaW5kT1ModWFQbGF0Zm9ybUluZm8pO1xuICAgIHZhciBtID0gb3MubWF0Y2goJyguKilcXFxccytNYWMgT1MgWFxcXFxzKyguKiknKTtcbiAgICBpZiAobSkge1xuICAgICAgdWEucGxhdGZvcm0gPSAnTWFjJztcbiAgICAgIHVhLmFyY2ggPSBtWzFdO1xuICAgICAgdWEub3MgPSAnTWFjIE9TJztcbiAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMl0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBvcy5tYXRjaCgnQW5kcm9pZFxcXFxzKyguKiknKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ0FuZHJvaWQnO1xuICAgICAgICB1YS5vcyA9ICdBbmRyb2lkJztcbiAgICAgICAgdWEub3NWZXJzaW9uID0gbVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gb3MubWF0Y2goJ1dpbmRvd3MgTlRcXFxccysoLiopJyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdQQyc7XG4gICAgICAgIHVhLm9zID0gJ1dpbmRvd3MnO1xuICAgICAgICB1YS5vc1ZlcnNpb24gPSB3aW5kb3dzRGlzdHJpYnV0aW9uTmFtZShtWzFdKTtcbiAgICAgICAgaWYgKCF1YS5hcmNoKSB1YS5hcmNoID0gJ3g4Nic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgaWYgKGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBob25lJykgfHwgY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUGFkJykgfHwgY29udGFpbnModWFQbGF0Zm9ybUluZm9bMF0sICdpUG9kJykgfHwgY29udGFpbnMob3MsICdpUGhvbmUnKSB8fCBvcy5pbmRleE9mKCdDUFUgT1MnKSA9PSAwKSB7XG4gICAgICAgIG0gPSBvcy5tYXRjaCgnLipPUyAoLiopIGxpa2UgTWFjIE9TIFgnKTtcbiAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICB1YS5wbGF0Zm9ybSA9IHVhUGxhdGZvcm1JbmZvWzBdO1xuICAgICAgICAgIHVhLm9zID0gJ2lPUyc7XG4gICAgICAgICAgdWEub3NWZXJzaW9uID0gbVsxXS5yZXBsYWNlKC9fL2csICcuJyk7XG4gICAgICAgICAgdWEuYml0bmVzcyA9IHBhcnNlSW50KHVhLm9zVmVyc2lvbikgPj0gNyA/IDY0IDogMzI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICBcbiAgICBpZiAoIW0pIHtcbiAgICAgIG0gPSBjb250YWlucyhvcywgJ0JTRCcpIHx8IGNvbnRhaW5zKG9zLCAnTGludXgnKTtcbiAgICAgIGlmIChtKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gJ1BDJztcbiAgICAgICAgdWEub3MgPSBvcy5zcGxpdCgnICcpWzBdO1xuICAgICAgICBpZiAoIXVhLmFyY2gpIHVhLmFyY2ggPSAneDg2JztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICB1YS5vcyA9IG9zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRQcm9kdWN0KHByb2R1Y3RDb21wb25lbnRzLCBwcm9kdWN0KSB7XG4gICAgICBmb3IodmFyIGkgaW4gcHJvZHVjdENvbXBvbmVudHMpIHtcbiAgICAgICAgaWYgKHByb2R1Y3RDb21wb25lbnRzW2ldID09IHByb2R1Y3QpIHJldHVybiBpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8vIERlZHVjZSBodW1hbi1yZWFkYWJsZSBicm93c2VyIHZlbmRvciwgcHJvZHVjdCBhbmQgdmVyc2lvbiBuYW1lc1xuICAgIHZhciBicm93c2VycyA9IFtbJ1NhbXN1bmdCcm93c2VyJywgJ1NhbXN1bmcnXSwgWydFZGdlJywgJ01pY3Jvc29mdCddLCBbJ09QUicsICdPcGVyYSddLCBbJ0Nocm9tZScsICdHb29nbGUnXSwgWydTYWZhcmknLCAnQXBwbGUnXSwgWydGaXJlZm94JywgJ01vemlsbGEnXV07XG4gICAgZm9yKHZhciBpIGluIGJyb3dzZXJzKSB7XG4gICAgICB2YXIgYiA9IGJyb3dzZXJzW2ldWzBdO1xuICAgICAgaWYgKHByb2R1Y3RDb21wb25lbnRzW2JdKSB7XG4gICAgICAgIHVhLmJyb3dzZXJWZW5kb3IgPSBicm93c2Vyc1tpXVsxXTtcbiAgICAgICAgdWEuYnJvd3NlclByb2R1Y3QgPSBicm93c2Vyc1tpXVswXTtcbiAgICAgICAgaWYgKHVhLmJyb3dzZXJQcm9kdWN0ID09ICdPUFInKSB1YS5icm93c2VyUHJvZHVjdCA9ICdPcGVyYSc7XG4gICAgICAgIGlmICh1YS5icm93c2VyUHJvZHVjdCA9PSAnVHJpZGVudCcpIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSBwcm9kdWN0Q29tcG9uZW50c1tiXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIERldGVjdCBJRXNcbiAgICBpZiAoIXVhLmJyb3dzZXJQcm9kdWN0KSB7XG4gICAgICB2YXIgbWF0Y2hJRSA9IHVzZXJBZ2VudC5tYXRjaCgvTVNJRVxccyhbXFxkLl0rKS8pO1xuICAgICAgaWYgKG1hdGNoSUUpIHtcbiAgICAgICAgdWEuYnJvd3NlclZlbmRvciA9ICdNaWNyb3NvZnQnO1xuICAgICAgICB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gbWF0Y2hJRVsxXTtcbiAgICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFQbGF0Zm9ybUluZm8sICdUcmlkZW50LzcuMCcpKSB7XG4gICAgICAgIHVhLmJyb3dzZXJWZW5kb3IgPSAnTWljcm9zb2Z0JztcbiAgICAgICAgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9ICB1c2VyQWdlbnQubWF0Y2goL3J2OihbXFxkLl0rKS8pWzFdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZHVjZSBtb2JpbGUgcGxhdGZvcm0sIGlmIHByZXNlbnRcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdWFQbGF0Zm9ybUluZm8ubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBpdGVtID0gdWFQbGF0Zm9ybUluZm9baV07XG4gICAgICB2YXIgaXRlbWwgPSBpdGVtLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoY29udGFpbnMoaXRlbWwsICduZXh1cycpIHx8IGNvbnRhaW5zKGl0ZW1sLCAnc2Ftc3VuZycpKSB7XG4gICAgICAgIHVhLnBsYXRmb3JtID0gaXRlbTtcbiAgICAgICAgdWEuYXJjaCA9ICdBUk0nO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgZm9ybSBmYWN0b3JcbiAgICBpZiAoY29udGFpbnModWFsLCAndGFibGV0JykgfHwgY29udGFpbnModWFsLCAnaXBhZCcpKSB1YS5mb3JtRmFjdG9yID0gJ1RhYmxldCc7XG4gICAgZWxzZSBpZiAoY29udGFpbnModWFsLCAnbW9iaWxlJykgfHwgY29udGFpbnModWFsLCAnaXBob25lJykgfHwgY29udGFpbnModWFsLCAnaXBvZCcpKSB1YS5mb3JtRmFjdG9yID0gJ01vYmlsZSc7XG4gICAgZWxzZSBpZiAoY29udGFpbnModWFsLCAnc21hcnQgdHYnKSB8fCBjb250YWlucyh1YWwsICdzbWFydC10dicpKSB1YS5mb3JtRmFjdG9yID0gJ1RWJztcbiAgICBlbHNlIHVhLmZvcm1GYWN0b3IgPSAnRGVza3RvcCc7XG4gIH0gY2F0Y2goZSkge1xuICAgIHVhLmludGVybmFsRXJyb3IgPSAnRmFpbGVkIHRvIHBhcnNlIHVzZXIgYWdlbnQgc3RyaW5nOiAnICsgZS50b1N0cmluZygpO1xuICB9XG5cbiAgcmV0dXJuIHVhO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXN0aW1hdGVWU3luY1JhdGUoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSA9PiB7XG4gICAgdmFyIG51bUZyYW1lc1RvUnVuID0gNjA7XG4gICAgdmFyIHQwID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdmFyIGRlbHRhcyA9IFtdO1xuICAgIGZ1bmN0aW9uIHRpY2soKSB7XG4gICAgICB2YXIgdDEgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGRlbHRhcy5wdXNoKHQxLXQwKTtcbiAgICAgIHQwID0gdDE7XG4gICAgICBpZiAoLS1udW1GcmFtZXNUb1J1biA+IDApIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsdGFzLnNvcnQoKTtcbiAgICAgICAgZGVsdGFzID0gZGVsdGFzLnNsaWNlKChkZWx0YXMubGVuZ3RoIC8gMyl8MCwgKCgyICogZGVsdGFzLmxlbmd0aCArIDIpIC8gMyl8MCk7XG4gICAgICAgIHZhciBzdW0gPSAwO1xuICAgICAgICBmb3IodmFyIGkgaW4gZGVsdGFzKSBzdW0gKz0gZGVsdGFzW2ldO1xuICAgICAgICByZXNvbHZlKDEwMDAuMCAvIChzdW0vZGVsdGFzLmxlbmd0aCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IHVzZXJBZ2VudEluZm8gZnJvbSAndXNlcmFnZW50LWluZm8nO1xuaW1wb3J0IGVzdGltYXRlVlN5bmNSYXRlIGZyb20gJ3ZzeW5jLWVzdGltYXRlJztcblxuZnVuY3Rpb24gZW5kaWFubmVzcygpIHtcbiAgdmFyIGhlYXAgPSBuZXcgQXJyYXlCdWZmZXIoMHgxMDAwMCk7XG4gIHZhciBpMzIgPSBuZXcgSW50MzJBcnJheShoZWFwKTtcbiAgdmFyIHUzMiA9IG5ldyBVaW50MzJBcnJheShoZWFwKTtcbiAgdmFyIHUxNiA9IG5ldyBVaW50MTZBcnJheShoZWFwKTtcbiAgdTMyWzY0XSA9IDB4N0ZGRjAxMDA7XG4gIHZhciB0eXBlZEFycmF5RW5kaWFubmVzcztcbiAgaWYgKHUxNlsxMjhdID09PSAweDdGRkYgJiYgdTE2WzEyOV0gPT09IDB4MDEwMCkgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAnYmlnIGVuZGlhbic7XG4gIGVsc2UgaWYgKHUxNlsxMjhdID09PSAweDAxMDAgJiYgdTE2WzEyOV0gPT09IDB4N0ZGRikgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAnbGl0dGxlIGVuZGlhbic7XG4gIGVsc2UgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAndW5rbm93biEgKGEgYnJvd3NlciBidWc/KSAoc2hvcnQgMTogJyArIHUxNlsxMjhdLnRvU3RyaW5nKDE2KSArICcsIHNob3J0IDI6ICcgKyB1MTZbMTI5XS50b1N0cmluZygxNikgKyAnKSc7XG4gIHJldHVybiB0eXBlZEFycmF5RW5kaWFubmVzczsgIFxufVxuXG5mdW5jdGlvbiBwYWRMZW5ndGhMZWZ0KHMsIGxlbiwgY2gpIHtcbiAgaWYgKGNoID09PSB1bmRlZmluZWQpIGNoID0gJyAnO1xuICB3aGlsZShzLmxlbmd0aCA8IGxlbikgcyA9IGNoICsgcztcbiAgcmV0dXJuIHM7XG59XG5cbi8vIFBlcmZvcm1zIHRoZSBicm93c2VyIGZlYXR1cmUgdGVzdC4gSW1tZWRpYXRlbHkgcmV0dXJucyBhIEpTIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXN1bHRzIG9mIGFsbCBzeW5jaHJvbm91c2x5IGNvbXB1dGFibGUgZmllbGRzLCBhbmQgbGF1bmNoZXMgYXN5bmNocm9ub3VzXG4vLyB0YXNrcyB0aGF0IHBlcmZvcm0gdGhlIHJlbWFpbmluZyB0ZXN0cy4gT25jZSB0aGUgYXN5bmMgdGFza3MgaGF2ZSBmaW5pc2hlZCwgdGhlIGdpdmVuIHN1Y2Nlc3NDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQsIHdpdGggdGhlIGZ1bGwgYnJvd3NlciBmZWF0dXJlIHRlc3Rcbi8vIHJlc3VsdHMgb2JqZWN0IGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBicm93c2VyRmVhdHVyZVRlc3Qoc3VjY2Vzc0NhbGxiYWNrKSB7XG4gIHZhciBhcGlzID0ge307XG4gIGZ1bmN0aW9uIHNldEFwaVN1cHBvcnQoYXBpbmFtZSwgY21wKSB7XG4gICAgaWYgKGNtcCkgYXBpc1thcGluYW1lXSA9IHRydWU7XG4gICAgZWxzZSBhcGlzW2FwaW5hbWVdID0gZmFsc2U7XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdNYXRoX2ltdWwnLCB0eXBlb2YgTWF0aC5pbXVsICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ01hdGhfZnJvdW5kJywgdHlwZW9mIE1hdGguZnJvdW5kICE9PSAndW5kZWZpbmVkJyk7ICBcbiAgc2V0QXBpU3VwcG9ydCgnQXJyYXlCdWZmZXJfdHJhbnNmZXInLCB0eXBlb2YgQXJyYXlCdWZmZXIudHJhbnNmZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQXVkaW8nLCB0eXBlb2YgQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0QXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1BvaW50ZXJMb2NrJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tc1JlcXVlc3RQb2ludGVyTG9jayk7XG4gIHNldEFwaVN1cHBvcnQoJ0Z1bGxzY3JlZW5BUEknLCBkb2N1bWVudC5ib2R5LnJlcXVlc3RGdWxsc2NyZWVuIHx8IGRvY3VtZW50LmJvZHkubXNSZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1velJlcXVlc3RGdWxsU2NyZWVuIHx8IGRvY3VtZW50LmJvZHkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pO1xuICB2YXIgaGFzQmxvYkNvbnN0cnVjdG9yID0gZmFsc2U7XG4gIHRyeSB7IG5ldyBCbG9iKCk7IGhhc0Jsb2JDb25zdHJ1Y3RvciA9IHRydWU7IH0gY2F0Y2goZSkgeyB9XG4gIHNldEFwaVN1cHBvcnQoJ0Jsb2InLCBoYXNCbG9iQ29uc3RydWN0b3IpO1xuICBpZiAoIWhhc0Jsb2JDb25zdHJ1Y3Rvcikgc2V0QXBpU3VwcG9ydCgnQmxvYkJ1aWxkZXInLCB0eXBlb2YgQmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBNb3pCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIFdlYktpdEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1NoYXJlZEFycmF5QnVmZmVyJywgdHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ2hhcmR3YXJlQ29uY3VycmVuY3knLCB0eXBlb2YgbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnU0lNRGpzJywgdHlwZW9mIFNJTUQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViV29ya2VycycsIHR5cGVvZiBXb3JrZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQXNzZW1ibHknLCB0eXBlb2YgV2ViQXNzZW1ibHkgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2FtZXBhZEFQSScsIG5hdmlnYXRvci5nZXRHYW1lcGFkcyB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0R2FtZXBhZHMpO1xuICB2YXIgaGFzSW5kZXhlZERCID0gZmFsc2U7XG4gIHRyeSB7IGhhc0luZGV4ZWREQiA9IHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnOyB9IGNhdGNoIChlKSB7fVxuICBzZXRBcGlTdXBwb3J0KCdJbmRleGVkREInLCBoYXNJbmRleGVkREIpO1xuICBzZXRBcGlTdXBwb3J0KCdWaXNpYmlsaXR5QVBJJywgdHlwZW9mIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnLCB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ3BlcmZvcm1hbmNlX25vdycsIHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gJ3VuZGVmaW5lZCcgJiYgcGVyZm9ybWFuY2Uubm93KTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViU29ja2V0cycsIHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViUlRDJywgdHlwZW9mIFJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgbW96UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1zUlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnVmlicmF0aW9uQVBJJywgbmF2aWdhdG9yLnZpYnJhdGUpO1xuICBzZXRBcGlTdXBwb3J0KCdTY3JlZW5PcmllbnRhdGlvbkFQSScsIHdpbmRvdy5zY3JlZW4gJiYgKHdpbmRvdy5zY3JlZW4ub3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi5tb3pPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLndlYmtpdE9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubXNPcmllbnRhdGlvbikpO1xuICBzZXRBcGlTdXBwb3J0KCdHZW9sb2NhdGlvbkFQSScsIG5hdmlnYXRvci5nZW9sb2NhdGlvbik7XG4gIHNldEFwaVN1cHBvcnQoJ0JhdHRlcnlTdGF0dXNBUEknLCBuYXZpZ2F0b3IuZ2V0QmF0dGVyeSk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlZSJywgdHlwZW9mIG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlhSJywgdHlwZW9mIG5hdmlnYXRvci54ciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdPZmZzY3JlZW5DYW52YXMnLCB0eXBlb2YgT2Zmc2NyZWVuQ2FudmFzICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkNvbXBvbmVudHMnLCAncmVnaXN0ZXJFbGVtZW50JyBpbiBkb2N1bWVudCAmJiAnaW1wb3J0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJykgJiYgJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyIHdlYkdMU3VwcG9ydCA9IHt9O1xuICB2YXIgYmVzdEdMQ29udGV4dCA9IG51bGw7IC8vIFRoZSBHTCBjb250ZXh0cyBhcmUgdGVzdGVkIGZyb20gYmVzdCB0byB3b3JzdCAobmV3ZXN0IHRvIG9sZGVzdCksIGFuZCB0aGUgbW9zdCBkZXNpcmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0IGlzIHN0b3JlZCBoZXJlIGZvciBsYXRlciB1c2UuXG4gIGZ1bmN0aW9uIHRlc3RXZWJHTFN1cHBvcnQoY29udGV4dE5hbWUsIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGVycm9yUmVhc29uID0gJyc7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yXCIsIGZ1bmN0aW9uKGUpIHsgZXJyb3JSZWFzb24gPSBlLnN0YXR1c01lc3NhZ2U7IH0sIGZhbHNlKTtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID8geyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiB0cnVlIH0gOiB7fSk7XG4gICAgaWYgKGNvbnRleHQgJiYgIWVycm9yUmVhc29uKSB7XG4gICAgICBpZiAoIWJlc3RHTENvbnRleHQpIGJlc3RHTENvbnRleHQgPSBjb250ZXh0O1xuICAgICAgdmFyIHJlc3VsdHMgPSB7IHN1cHBvcnRlZDogdHJ1ZSwgcGVyZm9ybWFuY2VDYXZlYXQ6ICFmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IH07XG4gICAgICBpZiAoY29udGV4dE5hbWUgPT0gJ2V4cGVyaW1lbnRhbC13ZWJnbCcpIHJlc3VsdHNbJ2V4cGVyaW1lbnRhbC13ZWJnbCddID0gdHJ1ZTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICBlbHNlIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIGVycm9yUmVhc29uOiBlcnJvclJlYXNvbiB9O1xuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wyID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wyJywgZmFsc2UpO1xuICAgIGlmIChzb2Z0d2FyZVdlYkdMMi5zdXBwb3J0ZWQpIHtcbiAgICAgIHNvZnR3YXJlV2ViR0wyLmhhcmR3YXJlRXJyb3JSZWFzb24gPSB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLmVycm9yUmVhc29uOyAvLyBDYXB0dXJlIHRoZSByZWFzb24gd2h5IGhhcmR3YXJlIFdlYkdMIDIgY29udGV4dCBkaWQgbm90IHN1Y2NlZWQuXG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddID0gc29mdHdhcmVXZWJHTDI7XG4gICAgfVxuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgdHJ1ZSk7XG4gIGlmICghd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5zdXBwb3J0ZWQpIHtcbiAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCB0cnVlKTtcbiAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbikpIHtcbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICB9XG4gIH1cblxuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wxID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wnLCBmYWxzZSk7XG4gICAgaWYgKCFzb2Z0d2FyZVdlYkdMMS5zdXBwb3J0ZWQpIHtcbiAgICAgIHZhciBleHBlcmltZW50YWxXZWJHTCA9IHRlc3RXZWJHTFN1cHBvcnQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGZhbHNlKTtcbiAgICAgIGlmIChleHBlcmltZW50YWxXZWJHTC5zdXBwb3J0ZWQgfHwgKGV4cGVyaW1lbnRhbFdlYkdMLmVycm9yUmVhc29uICYmICFzb2Z0d2FyZVdlYkdMMS5lcnJvclJlYXNvbikpIHtcbiAgICAgICAgc29mdHdhcmVXZWJHTDEgPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMS5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAxIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHNvZnR3YXJlV2ViR0wxO1xuICAgIH1cbiAgfVxuXG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMScsIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViR0wyJywgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5zdXBwb3J0ZWQpO1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciByZXN1bHRzID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50SW5mbyhuYXZpZ2F0b3IudXNlckFnZW50KSxcbiAgICBuYXZpZ2F0b3I6IHtcbiAgICAgIGJ1aWxkSUQ6IG5hdmlnYXRvci5idWlsZElELFxuICAgICAgYXBwVmVyc2lvbjogbmF2aWdhdG9yLmFwcFZlcnNpb24sXG4gICAgICBvc2NwdTogbmF2aWdhdG9yLm9zY3B1LFxuICAgICAgcGxhdGZvcm06IG5hdmlnYXRvci5wbGF0Zm9ybSAgXG4gICAgfSxcbiAgICAvLyBkaXNwbGF5UmVmcmVzaFJhdGU6IGRpc3BsYXlSZWZyZXNoUmF0ZSwgLy8gV2lsbCBiZSBhc3luY2hyb25vdXNseSBmaWxsZWQgaW4gb24gZmlyc3QgcnVuLCBkaXJlY3RseSBmaWxsZWQgaW4gbGF0ZXIuXG4gICAgZGlzcGxheToge1xuICAgICAgd2luZG93RGV2aWNlUGl4ZWxSYXRpbzogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBzY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoLFxuICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW4uaGVpZ2h0LFxuICAgICAgcGh5c2ljYWxTY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBwaHlzaWNhbFNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLCAgXG4gICAgfSxcbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSwgLy8gSWYgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoaXMsIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIGJ5IGNvcmUgZXN0aW1hdG9yLlxuICAgIGFwaVN1cHBvcnQ6IGFwaXMsXG4gICAgdHlwZWRBcnJheUVuZGlhbm5lc3M6IGVuZGlhbm5lc3MoKVxuICB9O1xuXG4gIC8vIFNvbWUgZmllbGRzIGV4aXN0IGRvbid0IGFsd2F5cyBleGlzdFxuICB2YXIgb3B0aW9uYWxGaWVsZHMgPSBbJ3ZlbmRvcicsICd2ZW5kb3JTdWInLCAncHJvZHVjdCcsICdwcm9kdWN0U3ViJywgJ2xhbmd1YWdlJywgJ2FwcENvZGVOYW1lJywgJ2FwcE5hbWUnLCAnbWF4VG91Y2hQb2ludHMnLCAncG9pbnRlckVuYWJsZWQnLCAnY3B1Q2xhc3MnXTtcbiAgZm9yKHZhciBpIGluIG9wdGlvbmFsRmllbGRzKSB7XG4gICAgdmFyIGYgPSBvcHRpb25hbEZpZWxkc1tpXTtcbiAgICBpZiAobmF2aWdhdG9yW2ZdKSB7IHJlc3VsdHMubmF2aWdhdG9yW2ZdID0gbmF2aWdhdG9yW2ZdOyB9XG4gIH1cbi8qXG4gIHZhciBudW1Db3Jlc0NoZWNrZWQgPSBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSA+IDA7XG5cbiAgLy8gT24gZmlyc3QgcnVuLCBlc3RpbWF0ZSB0aGUgbnVtYmVyIG9mIGNvcmVzIGlmIG5lZWRlZC5cbiAgaWYgKCFudW1Db3Jlc0NoZWNrZWQpIHtcbiAgICBpZiAobmF2aWdhdG9yLmdldEhhcmR3YXJlQ29uY3VycmVuY3kpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KGZ1bmN0aW9uKGNvcmVzKSB7XG4gICAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IGNvcmVzO1xuICAgICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IGFzeW5jIHRhc2ssIGZpcmUgc3VjY2VzcyBjYWxsYmFjay5cbiAgICAgICAgaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSBpcyBub3Qgc3VwcG9ydGVkLCBhbmQgbm8gY29yZSBlc3RpbWF0b3IgYXZhaWxhYmxlIGVpdGhlci5cbiAgICAgIC8vIFJlcG9ydCBudW1iZXIgb2YgY29yZXMgYXMgMC5cbiAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IDA7XG4gICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuKi9cbiAgZXN0aW1hdGVWU3luY1JhdGUoKS50aGVuKHJlZnJlc2hSYXRlID0+IHtcbiAgICByZXN1bHRzLnJlZnJlc2hSYXRlID0gTWF0aC5yb3VuZChyZWZyZXNoUmF0ZSk7XG4gICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpO1xuICB9KTtcblxuICAvLyBJZiBub25lIG9mIHRoZSBhc3luYyB0YXNrcyB3ZXJlIG5lZWRlZCB0byBiZSBleGVjdXRlZCwgcXVldWUgc3VjY2VzcyBjYWxsYmFjay5cbiAgLy8gaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTsgfSwgMSk7XG5cbiAgLy8gSWYgY2FsbGVyIGlzIG5vdCBpbnRlcmVzdGVkIGluIGFzeW5jaHJvbm91c2x5IGZpbGxhYmxlIGRhdGEsIGFsc28gcmV0dXJuIHRoZSByZXN1bHRzIG9iamVjdCBpbW1lZGlhdGVseSBmb3IgdGhlIHN5bmNocm9ub3VzIGJpdHMuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiZnVuY3Rpb24gZ2V0V2ViR0xJbmZvQnlWZXJzaW9uKHdlYmdsVmVyc2lvbikge1xuICB2YXIgcmVwb3J0ID0ge1xuICAgIHdlYmdsVmVyc2lvbjogd2ViZ2xWZXJzaW9uXG4gIH07XG5cbmlmICgod2ViZ2xWZXJzaW9uID09PSAyICYmICF3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkgfHxcbiAgICAod2ViZ2xWZXJzaW9uID09PSAxICYmICF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0KSkge1xuICAgIC8vIFRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgV2ViR0xcbiAgICByZXBvcnQuY29udGV4dE5hbWUgPSBcIndlYmdsIG5vdCBzdXBwb3J0ZWRcIjtcbiAgICByZXR1cm4gcmVwb3J0O1xufVxuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbnZhciBnbCwgY29udGV4dE5hbWU7XG52YXIgcG9zc2libGVOYW1lcyA9ICh3ZWJnbFZlcnNpb24gPT09IDIpID8gW1wid2ViZ2wyXCIsIFwiZXhwZXJpbWVudGFsLXdlYmdsMlwiXSA6IFtcIndlYmdsXCIsIFwiZXhwZXJpbWVudGFsLXdlYmdsXCJdO1xuZm9yICh2YXIgaT0wO2k8cG9zc2libGVOYW1lcy5sZW5ndGg7aSsrKSB7XG4gIHZhciBuYW1lID0gcG9zc2libGVOYW1lc1tpXTtcbiAgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChuYW1lLCB7IHN0ZW5jaWw6IHRydWUgfSk7XG4gIGlmIChnbCl7XG4gICAgICBjb250ZXh0TmFtZSA9IG5hbWU7XG4gICAgICBicmVhaztcbiAgfVxufVxuY2FudmFzLnJlbW92ZSgpO1xuaWYgKCFnbCkge1xuICAgIHJlcG9ydC5jb250ZXh0TmFtZSA9IFwid2ViZ2wgc3VwcG9ydGVkIGJ1dCBmYWlsZWQgdG8gaW5pdGlhbGl6ZVwiO1xuICAgIHJldHVybiByZXBvcnQ7XG59XG5cbnJldHVybiBPYmplY3QuYXNzaWduKHJlcG9ydCwge1xuICAgIGNvbnRleHROYW1lOiBjb250ZXh0TmFtZSxcbiAgICBnbFZlcnNpb246IGdsLmdldFBhcmFtZXRlcihnbC5WRVJTSU9OKSxcbiAgICB2ZW5kb3I6IGdsLmdldFBhcmFtZXRlcihnbC5WRU5ET1IpLFxuICAgIHJlbmRlcmVyOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuUkVOREVSRVIpLFxuICAgIHVuTWFza2VkVmVuZG9yOiBnZXRVbm1hc2tlZEluZm8oZ2wpLnZlbmRvcixcbiAgICB1bk1hc2tlZFJlbmRlcmVyOiBnZXRVbm1hc2tlZEluZm8oZ2wpLnJlbmRlcmVyLFxuICAgIGFuZ2xlOiBnZXRBbmdsZShnbCksXG4gICAgYW50aWFsaWFzOiAgZ2wuZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKS5hbnRpYWxpYXMgPyBcIkF2YWlsYWJsZVwiIDogXCJOb3QgYXZhaWxhYmxlXCIsXG4gICAgbWFqb3JQZXJmb3JtYW5jZUNhdmVhdDogZ2V0TWFqb3JQZXJmb3JtYW5jZUNhdmVhdChjb250ZXh0TmFtZSksXG4gICAgYml0czoge1xuICAgICAgcmVkQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLlJFRF9CSVRTKSxcbiAgICAgIGdyZWVuQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkdSRUVOX0JJVFMpLFxuICAgICAgYmx1ZUJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5CTFVFX0JJVFMpLFxuICAgICAgYWxwaGFCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuQUxQSEFfQklUUyksXG4gICAgICBkZXB0aEJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5ERVBUSF9CSVRTKSxcbiAgICAgIHN0ZW5jaWxCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuU1RFTkNJTF9CSVRTKSAgXG4gICAgfSxcbiAgICBtYXhpbXVtOiB7XG4gICAgICBtYXhDb2xvckJ1ZmZlcnM6IGdldE1heENvbG9yQnVmZmVycyhnbCksXG4gICAgICBtYXhSZW5kZXJCdWZmZXJTaXplOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1JFTkRFUkJVRkZFUl9TSVpFKSxcbiAgICAgIG1heENvbWJpbmVkVGV4dHVyZUltYWdlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfQ09NQklORURfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgICBtYXhDdWJlTWFwVGV4dHVyZVNpemU6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfQ1VCRV9NQVBfVEVYVFVSRV9TSVpFKSxcbiAgICAgIG1heEZyYWdtZW50VW5pZm9ybVZlY3RvcnM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfRlJBR01FTlRfVU5JRk9STV9WRUNUT1JTKSxcbiAgICAgIG1heFRleHR1cmVJbWFnZVVuaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgICAgbWF4VGV4dHVyZVNpemU6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVEVYVFVSRV9TSVpFKSxcbiAgICAgIG1heFZhcnlpbmdWZWN0b3JzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZBUllJTkdfVkVDVE9SUyksXG4gICAgICBtYXhWZXJ0ZXhBdHRyaWJ1dGVzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKSxcbiAgICAgIG1heFZlcnRleFRleHR1cmVJbWFnZVVuaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9URVhUVVJFX0lNQUdFX1VOSVRTKSxcbiAgICAgIG1heFZlcnRleFVuaWZvcm1WZWN0b3JzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9VTklGT1JNX1ZFQ1RPUlMpLCAgXG4gICAgICBtYXhWaWV3cG9ydERpbWVuc2lvbnM6IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WSUVXUE9SVF9ESU1TKSksXG4gICAgICBtYXhBbmlzb3Ryb3B5OiBnZXRNYXhBbmlzb3Ryb3B5KGdsKSxcbiAgICB9LFxuICAgIGFsaWFzZWRMaW5lV2lkdGhSYW5nZTogZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuQUxJQVNFRF9MSU5FX1dJRFRIX1JBTkdFKSksXG4gICAgYWxpYXNlZFBvaW50U2l6ZVJhbmdlOiBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5BTElBU0VEX1BPSU5UX1NJWkVfUkFOR0UpKSxcbiAgICBzaGFkZXJzOiB7XG4gICAgICB2ZXJ0ZXhTaGFkZXJCZXN0UHJlY2lzaW9uOiBnZXRCZXN0RmxvYXRQcmVjaXNpb24oZ2wuVkVSVEVYX1NIQURFUiwgZ2wpLFxuICAgICAgZnJhZ21lbnRTaGFkZXJCZXN0UHJlY2lzaW9uOiBnZXRCZXN0RmxvYXRQcmVjaXNpb24oZ2wuRlJBR01FTlRfU0hBREVSLCBnbCksXG4gICAgICBmcmFnbWVudFNoYWRlckZsb2F0SW50UHJlY2lzaW9uOiBnZXRGbG9hdEludFByZWNpc2lvbihnbCksXG4gICAgICBzaGFkaW5nTGFuZ3VhZ2VWZXJzaW9uOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuU0hBRElOR19MQU5HVUFHRV9WRVJTSU9OKVxuICAgIH0sXG4gICAgZXh0ZW5zaW9uczogZ2wuZ2V0U3VwcG9ydGVkRXh0ZW5zaW9ucygpXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkZXNjcmliZVJhbmdlKHZhbHVlKSB7XG4gIHJldHVybiBbdmFsdWVbMF0sIHZhbHVlWzFdXTtcbn1cblxuZnVuY3Rpb24gZ2V0VW5tYXNrZWRJbmZvKGdsKSB7XG4gIHZhciB1bk1hc2tlZEluZm8gPSB7XG4gICAgICByZW5kZXJlcjogXCJcIixcbiAgICAgIHZlbmRvcjogXCJcIlxuICB9O1xuICBcbiAgdmFyIGRiZ1JlbmRlckluZm8gPSBnbC5nZXRFeHRlbnNpb24oXCJXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvXCIpO1xuICBpZiAoZGJnUmVuZGVySW5mbyAhPSBudWxsKSB7XG4gICAgICB1bk1hc2tlZEluZm8ucmVuZGVyZXIgPSBnbC5nZXRQYXJhbWV0ZXIoZGJnUmVuZGVySW5mby5VTk1BU0tFRF9SRU5ERVJFUl9XRUJHTCk7XG4gICAgICB1bk1hc2tlZEluZm8udmVuZG9yICAgPSBnbC5nZXRQYXJhbWV0ZXIoZGJnUmVuZGVySW5mby5VTk1BU0tFRF9WRU5ET1JfV0VCR0wpO1xuICB9XG4gIFxuICByZXR1cm4gdW5NYXNrZWRJbmZvO1xufVxuXG5mdW5jdGlvbiBnZXRNYXhDb2xvckJ1ZmZlcnMoZ2wpIHtcbiAgdmFyIG1heENvbG9yQnVmZmVycyA9IDE7XG4gIHZhciBleHQgPSBnbC5nZXRFeHRlbnNpb24oXCJXRUJHTF9kcmF3X2J1ZmZlcnNcIik7XG4gIGlmIChleHQgIT0gbnVsbCkgXG4gICAgICBtYXhDb2xvckJ1ZmZlcnMgPSBnbC5nZXRQYXJhbWV0ZXIoZXh0Lk1BWF9EUkFXX0JVRkZFUlNfV0VCR0wpO1xuICBcbiAgcmV0dXJuIG1heENvbG9yQnVmZmVycztcbn1cblxuZnVuY3Rpb24gZ2V0TWFqb3JQZXJmb3JtYW5jZUNhdmVhdChjb250ZXh0TmFtZSkge1xuICAvLyBEb2VzIGNvbnRleHQgY3JlYXRpb24gZmFpbCB0byBkbyBhIG1ham9yIHBlcmZvcm1hbmNlIGNhdmVhdD9cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSk7XG4gIHZhciBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KGNvbnRleHROYW1lLCB7IGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQgOiB0cnVlIH0pO1xuICBjYW52YXMucmVtb3ZlKCk7XG5cbiAgaWYgKCFnbCkge1xuICAgICAgLy8gT3VyIG9yaWdpbmFsIGNvbnRleHQgY3JlYXRpb24gcGFzc2VkLiAgVGhpcyBkaWQgbm90LlxuICAgICAgcmV0dXJuIFwiWWVzXCI7XG4gIH1cblxuICBpZiAodHlwZW9mIGdsLmdldENvbnRleHRBdHRyaWJ1dGVzKCkuZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgLy8gSWYgZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKSBkb2VzblwidCBpbmNsdWRlIHRoZSBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0XG4gICAgICAvLyBwcm9wZXJ0eSwgYXNzdW1lIHRoZSBicm93c2VyIGRvZXNuXCJ0IGltcGxlbWVudCBpdCB5ZXQuXG4gICAgICByZXR1cm4gXCJOb3QgaW1wbGVtZW50ZWRcIjtcbiAgfVxuICByZXR1cm4gXCJOb1wiO1xufVxuXG5mdW5jdGlvbiBpc1Bvd2VyT2ZUd28obikge1xuICByZXR1cm4gKG4gIT09IDApICYmICgobiAmIChuIC0gMSkpID09PSAwKTtcbn1cblxuZnVuY3Rpb24gZ2V0QW5nbGUoZ2wpIHtcbiAgdmFyIGxpbmVXaWR0aFJhbmdlID0gZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuQUxJQVNFRF9MSU5FX1dJRFRIX1JBTkdFKSk7XG5cbiAgLy8gSGV1cmlzdGljOiBBTkdMRSBpcyBvbmx5IG9uIFdpbmRvd3MsIG5vdCBpbiBJRSwgYW5kIGRvZXMgbm90IGltcGxlbWVudCBsaW5lIHdpZHRoIGdyZWF0ZXIgdGhhbiBvbmUuXG4gIHZhciBhbmdsZSA9ICgobmF2aWdhdG9yLnBsYXRmb3JtID09PSBcIldpbjMyXCIpIHx8IChuYXZpZ2F0b3IucGxhdGZvcm0gPT09IFwiV2luNjRcIikpICYmXG4gICAgICAoZ2wuZ2V0UGFyYW1ldGVyKGdsLlJFTkRFUkVSKSAhPT0gXCJJbnRlcm5ldCBFeHBsb3JlclwiKSAmJlxuICAgICAgKGxpbmVXaWR0aFJhbmdlID09PSBkZXNjcmliZVJhbmdlKFsxLDFdKSk7XG5cbiAgaWYgKGFuZ2xlKSB7XG4gICAgICAvLyBIZXVyaXN0aWM6IEQzRDExIGJhY2tlbmQgZG9lcyBub3QgYXBwZWFyIHRvIHJlc2VydmUgdW5pZm9ybXMgbGlrZSB0aGUgRDNEOSBiYWNrZW5kLCBlLmcuLFxuICAgICAgLy8gRDNEMTEgbWF5IGhhdmUgMTAyNCB1bmlmb3JtcyBwZXIgc3RhZ2UsIGJ1dCBEM0Q5IGhhcyAyNTQgYW5kIDIyMS5cbiAgICAgIC8vXG4gICAgICAvLyBXZSBjb3VsZCBhbHNvIHRlc3QgZm9yIFdFQkdMX2RyYXdfYnVmZmVycywgYnV0IG1hbnkgc3lzdGVtcyBkbyBub3QgaGF2ZSBpdCB5ZXRcbiAgICAgIC8vIGR1ZSB0byBkcml2ZXIgYnVncywgZXRjLlxuICAgICAgaWYgKGlzUG93ZXJPZlR3byhnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9VTklGT1JNX1ZFQ1RPUlMpKSAmJiBpc1Bvd2VyT2ZUd28oZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMpKSkge1xuICAgICAgICAgIHJldHVybiBcIlllcywgRDNEMTFcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiWWVzLCBEM0Q5XCI7XG4gICAgICB9XG4gIH1cblxuICByZXR1cm4gXCJOb1wiO1xufVxuXG5mdW5jdGlvbiBnZXRNYXhBbmlzb3Ryb3B5KGdsKSB7XG4gIHZhciBlID0gZ2wuZ2V0RXh0ZW5zaW9uKFwiRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpXG4gICAgICAgICAgfHwgZ2wuZ2V0RXh0ZW5zaW9uKFwiV0VCS0lUX0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiKVxuICAgICAgICAgIHx8IGdsLmdldEV4dGVuc2lvbihcIk1PWl9FWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNcIik7XG5cbiAgaWYgKGUpIHtcbiAgICAgIHZhciBtYXggPSBnbC5nZXRQYXJhbWV0ZXIoZS5NQVhfVEVYVFVSRV9NQVhfQU5JU09UUk9QWV9FWFQpO1xuICAgICAgLy8gU2VlIENhbmFyeSBidWc6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xMTc0NTBcbiAgICAgIGlmIChtYXggPT09IDApIHtcbiAgICAgICAgICBtYXggPSAyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1heDtcbiAgfVxuICByZXR1cm4gXCJuL2FcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UG93ZXIoZXhwb25lbnQsIHZlcmJvc2UpIHtcbiAgaWYgKHZlcmJvc2UpIHtcbiAgICAgIHJldHVybiBcIlwiICsgTWF0aC5wb3coMiwgZXhwb25lbnQpO1xuICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiMl5cIiArIGV4cG9uZW50ICsgXCJcIjtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihwcmVjaXNpb24sIHZlcmJvc2UpIHtcbiAgdmFyIHZlcmJvc2VQYXJ0ID0gdmVyYm9zZSA/IFwiIGJpdCBtYW50aXNzYVwiIDogXCJcIjtcbiAgcmV0dXJuIFwiWy1cIiArIGZvcm1hdFBvd2VyKHByZWNpc2lvbi5yYW5nZU1pbiwgdmVyYm9zZSkgKyBcIiwgXCIgKyBmb3JtYXRQb3dlcihwcmVjaXNpb24ucmFuZ2VNYXgsIHZlcmJvc2UpICsgXCJdIChcIiArIHByZWNpc2lvbi5wcmVjaXNpb24gKyB2ZXJib3NlUGFydCArIFwiKVwiXG59XG5cbmZ1bmN0aW9uIGdldEJlc3RGbG9hdFByZWNpc2lvbihzaGFkZXJUeXBlLCBnbCkge1xuICB2YXIgaGlnaCA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChzaGFkZXJUeXBlLCBnbC5ISUdIX0ZMT0FUKTtcbiAgdmFyIG1lZGl1bSA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChzaGFkZXJUeXBlLCBnbC5NRURJVU1fRkxPQVQpO1xuICB2YXIgbG93ID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KHNoYWRlclR5cGUsIGdsLkxPV19GTE9BVCk7XG5cbiAgdmFyIGJlc3QgPSBoaWdoO1xuICBpZiAoaGlnaC5wcmVjaXNpb24gPT09IDApIHtcbiAgICAgIGJlc3QgPSBtZWRpdW07XG4gIH1cblxuICByZXR1cm4ge1xuICAgICAgaGlnaCA6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKGhpZ2gsIHRydWUpLFxuICAgICAgbWVkaXVtIDogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24obWVkaXVtLCB0cnVlKSxcbiAgICAgIGxvdzogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24obG93LCB0cnVlKSxcbiAgICAgIGJlc3Q6IGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKGJlc3QsIGZhbHNlKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEZsb2F0SW50UHJlY2lzaW9uKGdsKSB7XG4gIHZhciBoaWdoID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuSElHSF9GTE9BVCk7XG4gIHZhciBzID0gKGhpZ2gucHJlY2lzaW9uICE9PSAwKSA/IFwiaGlnaHAvXCIgOiBcIm1lZGl1bXAvXCI7XG5cbiAgaGlnaCA9IGdsLmdldFNoYWRlclByZWNpc2lvbkZvcm1hdChnbC5GUkFHTUVOVF9TSEFERVIsIGdsLkhJR0hfSU5UKTtcbiAgcyArPSAoaGlnaC5yYW5nZU1heCAhPT0gMCkgPyBcImhpZ2hwXCIgOiBcImxvd3BcIjtcblxuICByZXR1cm4gcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB3ZWJnbDE6IGdldFdlYkdMSW5mb0J5VmVyc2lvbigxKSxcbiAgICB3ZWJnbDI6IGdldFdlYkdMSW5mb0J5VmVyc2lvbigyKVxuICB9XG59XG4iLCIvKlxuIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU0hBIGZhbWlseSBvZiBoYXNoZXMsIGFzXG4gZGVmaW5lZCBpbiBGSVBTIFBVQiAxODAtNCBhbmQgRklQUyBQVUIgMjAyLCBhcyB3ZWxsIGFzIHRoZSBjb3JyZXNwb25kaW5nXG4gSE1BQyBpbXBsZW1lbnRhdGlvbiBhcyBkZWZpbmVkIGluIEZJUFMgUFVCIDE5OGFcblxuIENvcHlyaWdodCBCcmlhbiBUdXJlayAyMDA4LTIwMTdcbiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcbiBTZWUgaHR0cDovL2NhbGlnYXRpby5naXRodWIuY29tL2pzU0hBLyBmb3IgbW9yZSBpbmZvcm1hdGlvblxuXG4gU2V2ZXJhbCBmdW5jdGlvbnMgdGFrZW4gZnJvbSBQYXVsIEpvaG5zdG9uXG4qL1xuJ3VzZSBzdHJpY3QnOyhmdW5jdGlvbihZKXtmdW5jdGlvbiBDKGMsYSxiKXt2YXIgZT0wLGg9W10sbj0wLGcsbCxkLGYsbSxxLHUscixJPSExLHY9W10sdz1bXSx0LHk9ITEsej0hMSx4PS0xO2I9Ynx8e307Zz1iLmVuY29kaW5nfHxcIlVURjhcIjt0PWIubnVtUm91bmRzfHwxO2lmKHQhPT1wYXJzZUludCh0LDEwKXx8MT50KXRocm93IEVycm9yKFwibnVtUm91bmRzIG11c3QgYSBpbnRlZ2VyID49IDFcIik7aWYoXCJTSEEtMVwiPT09YyltPTUxMixxPUssdT1aLGY9MTYwLHI9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc2xpY2UoKX07ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQS1cIiwwKSlpZihxPWZ1bmN0aW9uKGEsYil7cmV0dXJuIEwoYSxiLGMpfSx1PWZ1bmN0aW9uKGEsYixoLGUpe3ZhciBrLGY7aWYoXCJTSEEtMjI0XCI9PT1jfHxcIlNIQS0yNTZcIj09PWMpaz0oYis2NT4+Pjk8PDQpKzE1LGY9MTY7ZWxzZSBpZihcIlNIQS0zODRcIj09PWN8fFwiU0hBLTUxMlwiPT09YylrPShiKzEyOT4+PjEwPDxcbjUpKzMxLGY9MzI7ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IgaW4gU0hBLTIgaW1wbGVtZW50YXRpb25cIik7Zm9yKDthLmxlbmd0aDw9azspYS5wdXNoKDApO2FbYj4+PjVdfD0xMjg8PDI0LWIlMzI7Yj1iK2g7YVtrXT1iJjQyOTQ5NjcyOTU7YVtrLTFdPWIvNDI5NDk2NzI5NnwwO2g9YS5sZW5ndGg7Zm9yKGI9MDtiPGg7Yis9ZillPUwoYS5zbGljZShiLGIrZiksZSxjKTtpZihcIlNIQS0yMjRcIj09PWMpYT1bZVswXSxlWzFdLGVbMl0sZVszXSxlWzRdLGVbNV0sZVs2XV07ZWxzZSBpZihcIlNIQS0yNTZcIj09PWMpYT1lO2Vsc2UgaWYoXCJTSEEtMzg0XCI9PT1jKWE9W2VbMF0uYSxlWzBdLmIsZVsxXS5hLGVbMV0uYixlWzJdLmEsZVsyXS5iLGVbM10uYSxlWzNdLmIsZVs0XS5hLGVbNF0uYixlWzVdLmEsZVs1XS5iXTtlbHNlIGlmKFwiU0hBLTUxMlwiPT09YylhPVtlWzBdLmEsZVswXS5iLGVbMV0uYSxlWzFdLmIsZVsyXS5hLGVbMl0uYixlWzNdLmEsZVszXS5iLGVbNF0uYSxcbmVbNF0uYixlWzVdLmEsZVs1XS5iLGVbNl0uYSxlWzZdLmIsZVs3XS5hLGVbN10uYl07ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IgaW4gU0hBLTIgaW1wbGVtZW50YXRpb25cIik7cmV0dXJuIGF9LHI9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuc2xpY2UoKX0sXCJTSEEtMjI0XCI9PT1jKW09NTEyLGY9MjI0O2Vsc2UgaWYoXCJTSEEtMjU2XCI9PT1jKW09NTEyLGY9MjU2O2Vsc2UgaWYoXCJTSEEtMzg0XCI9PT1jKW09MTAyNCxmPTM4NDtlbHNlIGlmKFwiU0hBLTUxMlwiPT09YyltPTEwMjQsZj01MTI7ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO2Vsc2UgaWYoMD09PWMubGFzdEluZGV4T2YoXCJTSEEzLVwiLDApfHwwPT09Yy5sYXN0SW5kZXhPZihcIlNIQUtFXCIsMCkpe3ZhciBGPTY7cT1EO3I9ZnVuY3Rpb24oYSl7dmFyIGM9W10sZTtmb3IoZT0wOzU+ZTtlKz0xKWNbZV09YVtlXS5zbGljZSgpO3JldHVybiBjfTt4PTE7aWYoXCJTSEEzLTIyNFwiPT09XG5jKW09MTE1MixmPTIyNDtlbHNlIGlmKFwiU0hBMy0yNTZcIj09PWMpbT0xMDg4LGY9MjU2O2Vsc2UgaWYoXCJTSEEzLTM4NFwiPT09YyltPTgzMixmPTM4NDtlbHNlIGlmKFwiU0hBMy01MTJcIj09PWMpbT01NzYsZj01MTI7ZWxzZSBpZihcIlNIQUtFMTI4XCI9PT1jKW09MTM0NCxmPS0xLEY9MzEsej0hMDtlbHNlIGlmKFwiU0hBS0UyNTZcIj09PWMpbT0xMDg4LGY9LTEsRj0zMSx6PSEwO2Vsc2UgdGhyb3cgRXJyb3IoXCJDaG9zZW4gU0hBIHZhcmlhbnQgaXMgbm90IHN1cHBvcnRlZFwiKTt1PWZ1bmN0aW9uKGEsYyxlLGIsaCl7ZT1tO3ZhciBrPUYsZixnPVtdLG49ZT4+PjUsbD0wLGQ9Yz4+PjU7Zm9yKGY9MDtmPGQmJmM+PWU7Zis9biliPUQoYS5zbGljZShmLGYrbiksYiksYy09ZTthPWEuc2xpY2UoZik7Zm9yKGMlPWU7YS5sZW5ndGg8bjspYS5wdXNoKDApO2Y9Yz4+PjM7YVtmPj4yXV49azw8ZiU0Kjg7YVtuLTFdXj0yMTQ3NDgzNjQ4O2ZvcihiPUQoYSxiKTszMipnLmxlbmd0aDxoOyl7YT1iW2wlXG41XVtsLzV8MF07Zy5wdXNoKGEuYik7aWYoMzIqZy5sZW5ndGg+PWgpYnJlYWs7Zy5wdXNoKGEuYSk7bCs9MTswPT09NjQqbCVlJiZEKG51bGwsYil9cmV0dXJuIGd9fWVsc2UgdGhyb3cgRXJyb3IoXCJDaG9zZW4gU0hBIHZhcmlhbnQgaXMgbm90IHN1cHBvcnRlZFwiKTtkPU0oYSxnLHgpO2w9QShjKTt0aGlzLnNldEhNQUNLZXk9ZnVuY3Rpb24oYSxiLGgpe3ZhciBrO2lmKCEwPT09SSl0aHJvdyBFcnJvcihcIkhNQUMga2V5IGFscmVhZHkgc2V0XCIpO2lmKCEwPT09eSl0aHJvdyBFcnJvcihcIkNhbm5vdCBzZXQgSE1BQyBrZXkgYWZ0ZXIgY2FsbGluZyB1cGRhdGVcIik7aWYoITA9PT16KXRocm93IEVycm9yKFwiU0hBS0UgaXMgbm90IHN1cHBvcnRlZCBmb3IgSE1BQ1wiKTtnPShofHx7fSkuZW5jb2Rpbmd8fFwiVVRGOFwiO2I9TShiLGcseCkoYSk7YT1iLmJpbkxlbjtiPWIudmFsdWU7az1tPj4+MztoPWsvNC0xO2lmKGs8YS84KXtmb3IoYj11KGIsYSwwLEEoYyksZik7Yi5sZW5ndGg8PWg7KWIucHVzaCgwKTtcbmJbaF0mPTQyOTQ5NjcwNDB9ZWxzZSBpZihrPmEvOCl7Zm9yKDtiLmxlbmd0aDw9aDspYi5wdXNoKDApO2JbaF0mPTQyOTQ5NjcwNDB9Zm9yKGE9MDthPD1oO2ErPTEpdlthXT1iW2FdXjkwOTUyMjQ4Nix3W2FdPWJbYV1eMTU0OTU1NjgyODtsPXEodixsKTtlPW07ST0hMH07dGhpcy51cGRhdGU9ZnVuY3Rpb24oYSl7dmFyIGMsYixrLGY9MCxnPW0+Pj41O2M9ZChhLGgsbik7YT1jLmJpbkxlbjtiPWMudmFsdWU7Yz1hPj4+NTtmb3Ioaz0wO2s8YztrKz1nKWYrbTw9YSYmKGw9cShiLnNsaWNlKGssaytnKSxsKSxmKz1tKTtlKz1mO2g9Yi5zbGljZShmPj4+NSk7bj1hJW07eT0hMH07dGhpcy5nZXRIYXNoPWZ1bmN0aW9uKGEsYil7dmFyIGssZyxkLG07aWYoITA9PT1JKXRocm93IEVycm9yKFwiQ2Fubm90IGNhbGwgZ2V0SGFzaCBhZnRlciBzZXR0aW5nIEhNQUMga2V5XCIpO2Q9TihiKTtpZighMD09PXope2lmKC0xPT09ZC5zaGFrZUxlbil0aHJvdyBFcnJvcihcInNoYWtlTGVuIG11c3QgYmUgc3BlY2lmaWVkIGluIG9wdGlvbnNcIik7XG5mPWQuc2hha2VMZW59c3dpdGNoKGEpe2Nhc2UgXCJIRVhcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBPKGEsZix4LGQpfTticmVhaztjYXNlIFwiQjY0XCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUChhLGYseCxkKX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUShhLGYseCl9O2JyZWFrO2Nhc2UgXCJBUlJBWUJVRkZFUlwiOnRyeXtnPW5ldyBBcnJheUJ1ZmZlcigwKX1jYXRjaChwKXt0aHJvdyBFcnJvcihcIkFSUkFZQlVGRkVSIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTt9az1mdW5jdGlvbihhKXtyZXR1cm4gUihhLGYseCl9O2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJmb3JtYXQgbXVzdCBiZSBIRVgsIEI2NCwgQllURVMsIG9yIEFSUkFZQlVGRkVSXCIpO31tPXUoaC5zbGljZSgpLG4sZSxyKGwpLGYpO2ZvcihnPTE7Zzx0O2crPTEpITA9PT16JiYwIT09ZiUzMiYmKG1bbS5sZW5ndGgtMV0mPTE2Nzc3MjE1Pj4+MjQtZiUzMiksbT11KG0sZixcbjAsQShjKSxmKTtyZXR1cm4gayhtKX07dGhpcy5nZXRITUFDPWZ1bmN0aW9uKGEsYil7dmFyIGssZyxkLHA7aWYoITE9PT1JKXRocm93IEVycm9yKFwiQ2Fubm90IGNhbGwgZ2V0SE1BQyB3aXRob3V0IGZpcnN0IHNldHRpbmcgSE1BQyBrZXlcIik7ZD1OKGIpO3N3aXRjaChhKXtjYXNlIFwiSEVYXCI6az1mdW5jdGlvbihhKXtyZXR1cm4gTyhhLGYseCxkKX07YnJlYWs7Y2FzZSBcIkI2NFwiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIFAoYSxmLHgsZCl9O2JyZWFrO2Nhc2UgXCJCWVRFU1wiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIFEoYSxmLHgpfTticmVhaztjYXNlIFwiQVJSQVlCVUZGRVJcIjp0cnl7az1uZXcgQXJyYXlCdWZmZXIoMCl9Y2F0Y2godil7dGhyb3cgRXJyb3IoXCJBUlJBWUJVRkZFUiBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgZW52aXJvbm1lbnRcIik7fWs9ZnVuY3Rpb24oYSl7cmV0dXJuIFIoYSxmLHgpfTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwib3V0cHV0Rm9ybWF0IG11c3QgYmUgSEVYLCBCNjQsIEJZVEVTLCBvciBBUlJBWUJVRkZFUlwiKTtcbn1nPXUoaC5zbGljZSgpLG4sZSxyKGwpLGYpO3A9cSh3LEEoYykpO3A9dShnLGYsbSxwLGYpO3JldHVybiBrKHApfX1mdW5jdGlvbiBiKGMsYSl7dGhpcy5hPWM7dGhpcy5iPWF9ZnVuY3Rpb24gTyhjLGEsYixlKXt2YXIgaD1cIlwiO2EvPTg7dmFyIG4sZyxkO2Q9LTE9PT1iPzM6MDtmb3Iobj0wO248YTtuKz0xKWc9Y1tuPj4+Ml0+Pj44KihkK24lNCpiKSxoKz1cIjAxMjM0NTY3ODlhYmNkZWZcIi5jaGFyQXQoZz4+PjQmMTUpK1wiMDEyMzQ1Njc4OWFiY2RlZlwiLmNoYXJBdChnJjE1KTtyZXR1cm4gZS5vdXRwdXRVcHBlcj9oLnRvVXBwZXJDYXNlKCk6aH1mdW5jdGlvbiBQKGMsYSxiLGUpe3ZhciBoPVwiXCIsbj1hLzgsZyxkLHAsZjtmPS0xPT09Yj8zOjA7Zm9yKGc9MDtnPG47Zys9Mylmb3IoZD1nKzE8bj9jW2crMT4+PjJdOjAscD1nKzI8bj9jW2crMj4+PjJdOjAscD0oY1tnPj4+Ml0+Pj44KihmK2clNCpiKSYyNTUpPDwxNnwoZD4+PjgqKGYrKGcrMSklNCpiKSYyNTUpPDw4fHA+Pj44KihmK1xuKGcrMiklNCpiKSYyNTUsZD0wOzQ+ZDtkKz0xKTgqZys2KmQ8PWE/aCs9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCIuY2hhckF0KHA+Pj42KigzLWQpJjYzKTpoKz1lLmI2NFBhZDtyZXR1cm4gaH1mdW5jdGlvbiBRKGMsYSxiKXt2YXIgZT1cIlwiO2EvPTg7dmFyIGgsZCxnO2c9LTE9PT1iPzM6MDtmb3IoaD0wO2g8YTtoKz0xKWQ9Y1toPj4+Ml0+Pj44KihnK2glNCpiKSYyNTUsZSs9U3RyaW5nLmZyb21DaGFyQ29kZShkKTtyZXR1cm4gZX1mdW5jdGlvbiBSKGMsYSxiKXthLz04O3ZhciBlLGg9bmV3IEFycmF5QnVmZmVyKGEpLGQsZztnPW5ldyBVaW50OEFycmF5KGgpO2Q9LTE9PT1iPzM6MDtmb3IoZT0wO2U8YTtlKz0xKWdbZV09Y1tlPj4+Ml0+Pj44KihkK2UlNCpiKSYyNTU7cmV0dXJuIGh9ZnVuY3Rpb24gTihjKXt2YXIgYT17b3V0cHV0VXBwZXI6ITEsYjY0UGFkOlwiPVwiLHNoYWtlTGVuOi0xfTtjPWN8fHt9O1xuYS5vdXRwdXRVcHBlcj1jLm91dHB1dFVwcGVyfHwhMTshMD09PWMuaGFzT3duUHJvcGVydHkoXCJiNjRQYWRcIikmJihhLmI2NFBhZD1jLmI2NFBhZCk7aWYoITA9PT1jLmhhc093blByb3BlcnR5KFwic2hha2VMZW5cIikpe2lmKDAhPT1jLnNoYWtlTGVuJTgpdGhyb3cgRXJyb3IoXCJzaGFrZUxlbiBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgOFwiKTthLnNoYWtlTGVuPWMuc2hha2VMZW59aWYoXCJib29sZWFuXCIhPT10eXBlb2YgYS5vdXRwdXRVcHBlcil0aHJvdyBFcnJvcihcIkludmFsaWQgb3V0cHV0VXBwZXIgZm9ybWF0dGluZyBvcHRpb25cIik7aWYoXCJzdHJpbmdcIiE9PXR5cGVvZiBhLmI2NFBhZCl0aHJvdyBFcnJvcihcIkludmFsaWQgYjY0UGFkIGZvcm1hdHRpbmcgb3B0aW9uXCIpO3JldHVybiBhfWZ1bmN0aW9uIE0oYyxhLGIpe3N3aXRjaChhKXtjYXNlIFwiVVRGOFwiOmNhc2UgXCJVVEYxNkJFXCI6Y2FzZSBcIlVURjE2TEVcIjpicmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiZW5jb2RpbmcgbXVzdCBiZSBVVEY4LCBVVEYxNkJFLCBvciBVVEYxNkxFXCIpO1xufXN3aXRjaChjKXtjYXNlIFwiSEVYXCI6Yz1mdW5jdGlvbihhLGMsZCl7dmFyIGc9YS5sZW5ndGgsbCxwLGYsbSxxLHU7aWYoMCE9PWclMil0aHJvdyBFcnJvcihcIlN0cmluZyBvZiBIRVggdHlwZSBtdXN0IGJlIGluIGJ5dGUgaW5jcmVtZW50c1wiKTtjPWN8fFswXTtkPWR8fDA7cT1kPj4+Mzt1PS0xPT09Yj8zOjA7Zm9yKGw9MDtsPGc7bCs9Mil7cD1wYXJzZUludChhLnN1YnN0cihsLDIpLDE2KTtpZihpc05hTihwKSl0aHJvdyBFcnJvcihcIlN0cmluZyBvZiBIRVggdHlwZSBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnNcIik7bT0obD4+PjEpK3E7Zm9yKGY9bT4+PjI7Yy5sZW5ndGg8PWY7KWMucHVzaCgwKTtjW2ZdfD1wPDw4Kih1K20lNCpiKX1yZXR1cm57dmFsdWU6YyxiaW5MZW46NCpnK2R9fTticmVhaztjYXNlIFwiVEVYVFwiOmM9ZnVuY3Rpb24oYyxoLGQpe3ZhciBnLGwscD0wLGYsbSxxLHUscix0O2g9aHx8WzBdO2Q9ZHx8MDtxPWQ+Pj4zO2lmKFwiVVRGOFwiPT09YSlmb3IodD0tMT09PVxuYj8zOjAsZj0wO2Y8Yy5sZW5ndGg7Zis9MSlmb3IoZz1jLmNoYXJDb2RlQXQoZiksbD1bXSwxMjg+Zz9sLnB1c2goZyk6MjA0OD5nPyhsLnB1c2goMTkyfGc+Pj42KSxsLnB1c2goMTI4fGcmNjMpKTo1NTI5Nj5nfHw1NzM0NDw9Zz9sLnB1c2goMjI0fGc+Pj4xMiwxMjh8Zz4+PjYmNjMsMTI4fGcmNjMpOihmKz0xLGc9NjU1MzYrKChnJjEwMjMpPDwxMHxjLmNoYXJDb2RlQXQoZikmMTAyMyksbC5wdXNoKDI0MHxnPj4+MTgsMTI4fGc+Pj4xMiY2MywxMjh8Zz4+PjYmNjMsMTI4fGcmNjMpKSxtPTA7bTxsLmxlbmd0aDttKz0xKXtyPXArcTtmb3IodT1yPj4+MjtoLmxlbmd0aDw9dTspaC5wdXNoKDApO2hbdV18PWxbbV08PDgqKHQrciU0KmIpO3ArPTF9ZWxzZSBpZihcIlVURjE2QkVcIj09PWF8fFwiVVRGMTZMRVwiPT09YSlmb3IodD0tMT09PWI/MjowLGw9XCJVVEYxNkxFXCI9PT1hJiYxIT09Ynx8XCJVVEYxNkxFXCIhPT1hJiYxPT09YixmPTA7ZjxjLmxlbmd0aDtmKz0xKXtnPWMuY2hhckNvZGVBdChmKTtcbiEwPT09bCYmKG09ZyYyNTUsZz1tPDw4fGc+Pj44KTtyPXArcTtmb3IodT1yPj4+MjtoLmxlbmd0aDw9dTspaC5wdXNoKDApO2hbdV18PWc8PDgqKHQrciU0KmIpO3ArPTJ9cmV0dXJue3ZhbHVlOmgsYmluTGVuOjgqcCtkfX07YnJlYWs7Y2FzZSBcIkI2NFwiOmM9ZnVuY3Rpb24oYSxjLGQpe3ZhciBnPTAsbCxwLGYsbSxxLHUscix0O2lmKC0xPT09YS5zZWFyY2goL15bYS16QS1aMC05PStcXC9dKyQvKSl0aHJvdyBFcnJvcihcIkludmFsaWQgY2hhcmFjdGVyIGluIGJhc2UtNjQgc3RyaW5nXCIpO3A9YS5pbmRleE9mKFwiPVwiKTthPWEucmVwbGFjZSgvXFw9L2csXCJcIik7aWYoLTEhPT1wJiZwPGEubGVuZ3RoKXRocm93IEVycm9yKFwiSW52YWxpZCAnPScgZm91bmQgaW4gYmFzZS02NCBzdHJpbmdcIik7Yz1jfHxbMF07ZD1kfHwwO3U9ZD4+PjM7dD0tMT09PWI/MzowO2ZvcihwPTA7cDxhLmxlbmd0aDtwKz00KXtxPWEuc3Vic3RyKHAsNCk7Zm9yKGY9bT0wO2Y8cS5sZW5ndGg7Zis9MSlsPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiLmluZGV4T2YocVtmXSksXG5tfD1sPDwxOC02KmY7Zm9yKGY9MDtmPHEubGVuZ3RoLTE7Zis9MSl7cj1nK3U7Zm9yKGw9cj4+PjI7Yy5sZW5ndGg8PWw7KWMucHVzaCgwKTtjW2xdfD0obT4+PjE2LTgqZiYyNTUpPDw4Kih0K3IlNCpiKTtnKz0xfX1yZXR1cm57dmFsdWU6YyxiaW5MZW46OCpnK2R9fTticmVhaztjYXNlIFwiQllURVNcIjpjPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZyxsLHAsZixtLHE7Yz1jfHxbMF07ZD1kfHwwO3A9ZD4+PjM7cT0tMT09PWI/MzowO2ZvcihsPTA7bDxhLmxlbmd0aDtsKz0xKWc9YS5jaGFyQ29kZUF0KGwpLG09bCtwLGY9bT4+PjIsYy5sZW5ndGg8PWYmJmMucHVzaCgwKSxjW2ZdfD1nPDw4KihxK20lNCpiKTtyZXR1cm57dmFsdWU6YyxiaW5MZW46OCphLmxlbmd0aCtkfX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2M9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKGUpe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31jPVxuZnVuY3Rpb24oYSxjLGQpe3ZhciBnLGwscCxmLG0scTtjPWN8fFswXTtkPWR8fDA7bD1kPj4+MzttPS0xPT09Yj8zOjA7cT1uZXcgVWludDhBcnJheShhKTtmb3IoZz0wO2c8YS5ieXRlTGVuZ3RoO2crPTEpZj1nK2wscD1mPj4+MixjLmxlbmd0aDw9cCYmYy5wdXNoKDApLGNbcF18PXFbZ108PDgqKG0rZiU0KmIpO3JldHVybnt2YWx1ZTpjLGJpbkxlbjo4KmEuYnl0ZUxlbmd0aCtkfX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcImZvcm1hdCBtdXN0IGJlIEhFWCwgVEVYVCwgQjY0LCBCWVRFUywgb3IgQVJSQVlCVUZGRVJcIik7fXJldHVybiBjfWZ1bmN0aW9uIHkoYyxhKXtyZXR1cm4gYzw8YXxjPj4+MzItYX1mdW5jdGlvbiBTKGMsYSl7cmV0dXJuIDMyPGE/KGEtPTMyLG5ldyBiKGMuYjw8YXxjLmE+Pj4zMi1hLGMuYTw8YXxjLmI+Pj4zMi1hKSk6MCE9PWE/bmV3IGIoYy5hPDxhfGMuYj4+PjMyLWEsYy5iPDxhfGMuYT4+PjMyLWEpOmN9ZnVuY3Rpb24gdyhjLGEpe3JldHVybiBjPj4+XG5hfGM8PDMyLWF9ZnVuY3Rpb24gdChjLGEpe3ZhciBrPW51bGwsaz1uZXcgYihjLmEsYy5iKTtyZXR1cm4gaz0zMj49YT9uZXcgYihrLmE+Pj5hfGsuYjw8MzItYSY0Mjk0OTY3Mjk1LGsuYj4+PmF8ay5hPDwzMi1hJjQyOTQ5NjcyOTUpOm5ldyBiKGsuYj4+PmEtMzJ8ay5hPDw2NC1hJjQyOTQ5NjcyOTUsay5hPj4+YS0zMnxrLmI8PDY0LWEmNDI5NDk2NzI5NSl9ZnVuY3Rpb24gVChjLGEpe3ZhciBrPW51bGw7cmV0dXJuIGs9MzI+PWE/bmV3IGIoYy5hPj4+YSxjLmI+Pj5hfGMuYTw8MzItYSY0Mjk0OTY3Mjk1KTpuZXcgYigwLGMuYT4+PmEtMzIpfWZ1bmN0aW9uIGFhKGMsYSxiKXtyZXR1cm4gYyZhXn5jJmJ9ZnVuY3Rpb24gYmEoYyxhLGspe3JldHVybiBuZXcgYihjLmEmYS5hXn5jLmEmay5hLGMuYiZhLmJefmMuYiZrLmIpfWZ1bmN0aW9uIFUoYyxhLGIpe3JldHVybiBjJmFeYyZiXmEmYn1mdW5jdGlvbiBjYShjLGEsayl7cmV0dXJuIG5ldyBiKGMuYSZhLmFeYy5hJmsuYV5hLmEmXG5rLmEsYy5iJmEuYl5jLmImay5iXmEuYiZrLmIpfWZ1bmN0aW9uIGRhKGMpe3JldHVybiB3KGMsMiledyhjLDEzKV53KGMsMjIpfWZ1bmN0aW9uIGVhKGMpe3ZhciBhPXQoYywyOCksaz10KGMsMzQpO2M9dChjLDM5KTtyZXR1cm4gbmV3IGIoYS5hXmsuYV5jLmEsYS5iXmsuYl5jLmIpfWZ1bmN0aW9uIGZhKGMpe3JldHVybiB3KGMsNiledyhjLDExKV53KGMsMjUpfWZ1bmN0aW9uIGdhKGMpe3ZhciBhPXQoYywxNCksaz10KGMsMTgpO2M9dChjLDQxKTtyZXR1cm4gbmV3IGIoYS5hXmsuYV5jLmEsYS5iXmsuYl5jLmIpfWZ1bmN0aW9uIGhhKGMpe3JldHVybiB3KGMsNyledyhjLDE4KV5jPj4+M31mdW5jdGlvbiBpYShjKXt2YXIgYT10KGMsMSksaz10KGMsOCk7Yz1UKGMsNyk7cmV0dXJuIG5ldyBiKGEuYV5rLmFeYy5hLGEuYl5rLmJeYy5iKX1mdW5jdGlvbiBqYShjKXtyZXR1cm4gdyhjLDE3KV53KGMsMTkpXmM+Pj4xMH1mdW5jdGlvbiBrYShjKXt2YXIgYT10KGMsMTkpLGs9dChjLDYxKTtcbmM9VChjLDYpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gRyhjLGEpe3ZhciBiPShjJjY1NTM1KSsoYSY2NTUzNSk7cmV0dXJuKChjPj4+MTYpKyhhPj4+MTYpKyhiPj4+MTYpJjY1NTM1KTw8MTZ8YiY2NTUzNX1mdW5jdGlvbiBsYShjLGEsYixlKXt2YXIgaD0oYyY2NTUzNSkrKGEmNjU1MzUpKyhiJjY1NTM1KSsoZSY2NTUzNSk7cmV0dXJuKChjPj4+MTYpKyhhPj4+MTYpKyhiPj4+MTYpKyhlPj4+MTYpKyhoPj4+MTYpJjY1NTM1KTw8MTZ8aCY2NTUzNX1mdW5jdGlvbiBIKGMsYSxiLGUsaCl7dmFyIGQ9KGMmNjU1MzUpKyhhJjY1NTM1KSsoYiY2NTUzNSkrKGUmNjU1MzUpKyhoJjY1NTM1KTtyZXR1cm4oKGM+Pj4xNikrKGE+Pj4xNikrKGI+Pj4xNikrKGU+Pj4xNikrKGg+Pj4xNikrKGQ+Pj4xNikmNjU1MzUpPDwxNnxkJjY1NTM1fWZ1bmN0aW9uIG1hKGMsYSl7dmFyIGQsZSxoO2Q9KGMuYiY2NTUzNSkrKGEuYiY2NTUzNSk7ZT0oYy5iPj4+MTYpK1xuKGEuYj4+PjE2KSsoZD4+PjE2KTtoPShlJjY1NTM1KTw8MTZ8ZCY2NTUzNTtkPShjLmEmNjU1MzUpKyhhLmEmNjU1MzUpKyhlPj4+MTYpO2U9KGMuYT4+PjE2KSsoYS5hPj4+MTYpKyhkPj4+MTYpO3JldHVybiBuZXcgYigoZSY2NTUzNSk8PDE2fGQmNjU1MzUsaCl9ZnVuY3Rpb24gbmEoYyxhLGQsZSl7dmFyIGgsbixnO2g9KGMuYiY2NTUzNSkrKGEuYiY2NTUzNSkrKGQuYiY2NTUzNSkrKGUuYiY2NTUzNSk7bj0oYy5iPj4+MTYpKyhhLmI+Pj4xNikrKGQuYj4+PjE2KSsoZS5iPj4+MTYpKyhoPj4+MTYpO2c9KG4mNjU1MzUpPDwxNnxoJjY1NTM1O2g9KGMuYSY2NTUzNSkrKGEuYSY2NTUzNSkrKGQuYSY2NTUzNSkrKGUuYSY2NTUzNSkrKG4+Pj4xNik7bj0oYy5hPj4+MTYpKyhhLmE+Pj4xNikrKGQuYT4+PjE2KSsoZS5hPj4+MTYpKyhoPj4+MTYpO3JldHVybiBuZXcgYigobiY2NTUzNSk8PDE2fGgmNjU1MzUsZyl9ZnVuY3Rpb24gb2EoYyxhLGQsZSxoKXt2YXIgbixnLGw7bj0oYy5iJlxuNjU1MzUpKyhhLmImNjU1MzUpKyhkLmImNjU1MzUpKyhlLmImNjU1MzUpKyhoLmImNjU1MzUpO2c9KGMuYj4+PjE2KSsoYS5iPj4+MTYpKyhkLmI+Pj4xNikrKGUuYj4+PjE2KSsoaC5iPj4+MTYpKyhuPj4+MTYpO2w9KGcmNjU1MzUpPDwxNnxuJjY1NTM1O249KGMuYSY2NTUzNSkrKGEuYSY2NTUzNSkrKGQuYSY2NTUzNSkrKGUuYSY2NTUzNSkrKGguYSY2NTUzNSkrKGc+Pj4xNik7Zz0oYy5hPj4+MTYpKyhhLmE+Pj4xNikrKGQuYT4+PjE2KSsoZS5hPj4+MTYpKyhoLmE+Pj4xNikrKG4+Pj4xNik7cmV0dXJuIG5ldyBiKChnJjY1NTM1KTw8MTZ8biY2NTUzNSxsKX1mdW5jdGlvbiBCKGMsYSl7cmV0dXJuIG5ldyBiKGMuYV5hLmEsYy5iXmEuYil9ZnVuY3Rpb24gQShjKXt2YXIgYT1bXSxkO2lmKFwiU0hBLTFcIj09PWMpYT1bMTczMjU4NDE5Myw0MDIzMjMzNDE3LDI1NjIzODMxMDIsMjcxNzMzODc4LDMyODUzNzc1MjBdO2Vsc2UgaWYoMD09PWMubGFzdEluZGV4T2YoXCJTSEEtXCIsMCkpc3dpdGNoKGE9XG5bMzIzODM3MTAzMiw5MTQxNTA2NjMsODEyNzAyOTk5LDQxNDQ5MTI2OTcsNDI5MDc3NTg1NywxNzUwNjAzMDI1LDE2OTQwNzY4MzksMzIwNDA3NTQyOF0sZD1bMTc3OTAzMzcwMywzMTQ0MTM0Mjc3LDEwMTM5MDQyNDIsMjc3MzQ4MDc2MiwxMzU5ODkzMTE5LDI2MDA4MjI5MjQsNTI4NzM0NjM1LDE1NDE0NTkyMjVdLGMpe2Nhc2UgXCJTSEEtMjI0XCI6YnJlYWs7Y2FzZSBcIlNIQS0yNTZcIjphPWQ7YnJlYWs7Y2FzZSBcIlNIQS0zODRcIjphPVtuZXcgYigzNDE4MDcwMzY1LGFbMF0pLG5ldyBiKDE2NTQyNzAyNTAsYVsxXSksbmV3IGIoMjQzODUyOTM3MCxhWzJdKSxuZXcgYigzNTU0NjIzNjAsYVszXSksbmV3IGIoMTczMTQwNTQxNSxhWzRdKSxuZXcgYig0MTA0ODg4NTg5NSxhWzVdKSxuZXcgYigzNjc1MDA4NTI1LGFbNl0pLG5ldyBiKDEyMDMwNjI4MTMsYVs3XSldO2JyZWFrO2Nhc2UgXCJTSEEtNTEyXCI6YT1bbmV3IGIoZFswXSw0MDg5MjM1NzIwKSxuZXcgYihkWzFdLDIyMjc4NzM1OTUpLFxubmV3IGIoZFsyXSw0MjcxMTc1NzIzKSxuZXcgYihkWzNdLDE1OTU3NTAxMjkpLG5ldyBiKGRbNF0sMjkxNzU2NTEzNyksbmV3IGIoZFs1XSw3MjU1MTExOTkpLG5ldyBiKGRbNl0sNDIxNTM4OTU0NyksbmV3IGIoZFs3XSwzMjcwMzMyMDkpXTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiVW5rbm93biBTSEEgdmFyaWFudFwiKTt9ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQTMtXCIsMCl8fDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBS0VcIiwwKSlmb3IoYz0wOzU+YztjKz0xKWFbY109W25ldyBiKDAsMCksbmV3IGIoMCwwKSxuZXcgYigwLDApLG5ldyBiKDAsMCksbmV3IGIoMCwwKV07ZWxzZSB0aHJvdyBFcnJvcihcIk5vIFNIQSB2YXJpYW50cyBzdXBwb3J0ZWRcIik7cmV0dXJuIGF9ZnVuY3Rpb24gSyhjLGEpe3ZhciBiPVtdLGUsZCxuLGcsbCxwLGY7ZT1hWzBdO2Q9YVsxXTtuPWFbMl07Zz1hWzNdO2w9YVs0XTtmb3IoZj0wOzgwPmY7Zis9MSliW2ZdPTE2PmY/Y1tmXTp5KGJbZi1cbjNdXmJbZi04XV5iW2YtMTRdXmJbZi0xNl0sMSkscD0yMD5mP0goeShlLDUpLGQmbl5+ZCZnLGwsMTUxODUwMDI0OSxiW2ZdKTo0MD5mP0goeShlLDUpLGRebl5nLGwsMTg1OTc3NTM5MyxiW2ZdKTo2MD5mP0goeShlLDUpLFUoZCxuLGcpLGwsMjQwMDk1OTcwOCxiW2ZdKTpIKHkoZSw1KSxkXm5eZyxsLDMzOTU0Njk3ODIsYltmXSksbD1nLGc9bixuPXkoZCwzMCksZD1lLGU9cDthWzBdPUcoZSxhWzBdKTthWzFdPUcoZCxhWzFdKTthWzJdPUcobixhWzJdKTthWzNdPUcoZyxhWzNdKTthWzRdPUcobCxhWzRdKTtyZXR1cm4gYX1mdW5jdGlvbiBaKGMsYSxiLGUpe3ZhciBkO2ZvcihkPShhKzY1Pj4+OTw8NCkrMTU7Yy5sZW5ndGg8PWQ7KWMucHVzaCgwKTtjW2E+Pj41XXw9MTI4PDwyNC1hJTMyO2ErPWI7Y1tkXT1hJjQyOTQ5NjcyOTU7Y1tkLTFdPWEvNDI5NDk2NzI5NnwwO2E9Yy5sZW5ndGg7Zm9yKGQ9MDtkPGE7ZCs9MTYpZT1LKGMuc2xpY2UoZCxkKzE2KSxlKTtyZXR1cm4gZX1mdW5jdGlvbiBMKGMsXG5hLGspe3ZhciBlLGgsbixnLGwscCxmLG0scSx1LHIsdCx2LHcseSxBLHoseCxGLEIsQyxELEU9W10sSjtpZihcIlNIQS0yMjRcIj09PWt8fFwiU0hBLTI1NlwiPT09ayl1PTY0LHQ9MSxEPU51bWJlcix2PUcsdz1sYSx5PUgsQT1oYSx6PWphLHg9ZGEsRj1mYSxDPVUsQj1hYSxKPWQ7ZWxzZSBpZihcIlNIQS0zODRcIj09PWt8fFwiU0hBLTUxMlwiPT09ayl1PTgwLHQ9MixEPWIsdj1tYSx3PW5hLHk9b2EsQT1pYSx6PWthLHg9ZWEsRj1nYSxDPWNhLEI9YmEsSj1WO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbmV4cGVjdGVkIGVycm9yIGluIFNIQS0yIGltcGxlbWVudGF0aW9uXCIpO2s9YVswXTtlPWFbMV07aD1hWzJdO249YVszXTtnPWFbNF07bD1hWzVdO3A9YVs2XTtmPWFbN107Zm9yKHI9MDtyPHU7cis9MSkxNj5yPyhxPXIqdCxtPWMubGVuZ3RoPD1xPzA6Y1txXSxxPWMubGVuZ3RoPD1xKzE/MDpjW3ErMV0sRVtyXT1uZXcgRChtLHEpKTpFW3JdPXcoeihFW3ItMl0pLEVbci03XSxBKEVbci0xNV0pLEVbci1cbjE2XSksbT15KGYsRihnKSxCKGcsbCxwKSxKW3JdLEVbcl0pLHE9dih4KGspLEMoayxlLGgpKSxmPXAscD1sLGw9ZyxnPXYobixtKSxuPWgsaD1lLGU9ayxrPXYobSxxKTthWzBdPXYoayxhWzBdKTthWzFdPXYoZSxhWzFdKTthWzJdPXYoaCxhWzJdKTthWzNdPXYobixhWzNdKTthWzRdPXYoZyxhWzRdKTthWzVdPXYobCxhWzVdKTthWzZdPXYocCxhWzZdKTthWzddPXYoZixhWzddKTtyZXR1cm4gYX1mdW5jdGlvbiBEKGMsYSl7dmFyIGQsZSxoLG4sZz1bXSxsPVtdO2lmKG51bGwhPT1jKWZvcihlPTA7ZTxjLmxlbmd0aDtlKz0yKWFbKGU+Pj4xKSU1XVsoZT4+PjEpLzV8MF09QihhWyhlPj4+MSklNV1bKGU+Pj4xKS81fDBdLG5ldyBiKGNbZSsxXSxjW2VdKSk7Zm9yKGQ9MDsyND5kO2QrPTEpe249QShcIlNIQTMtXCIpO2ZvcihlPTA7NT5lO2UrPTEpe2g9YVtlXVswXTt2YXIgcD1hW2VdWzFdLGY9YVtlXVsyXSxtPWFbZV1bM10scT1hW2VdWzRdO2dbZV09bmV3IGIoaC5hXnAuYV5mLmFeXG5tLmFecS5hLGguYl5wLmJeZi5iXm0uYl5xLmIpfWZvcihlPTA7NT5lO2UrPTEpbFtlXT1CKGdbKGUrNCklNV0sUyhnWyhlKzEpJTVdLDEpKTtmb3IoZT0wOzU+ZTtlKz0xKWZvcihoPTA7NT5oO2grPTEpYVtlXVtoXT1CKGFbZV1baF0sbFtlXSk7Zm9yKGU9MDs1PmU7ZSs9MSlmb3IoaD0wOzU+aDtoKz0xKW5baF1bKDIqZSszKmgpJTVdPVMoYVtlXVtoXSxXW2VdW2hdKTtmb3IoZT0wOzU+ZTtlKz0xKWZvcihoPTA7NT5oO2grPTEpYVtlXVtoXT1CKG5bZV1baF0sbmV3IGIofm5bKGUrMSklNV1baF0uYSZuWyhlKzIpJTVdW2hdLmEsfm5bKGUrMSklNV1baF0uYiZuWyhlKzIpJTVdW2hdLmIpKTthWzBdWzBdPUIoYVswXVswXSxYW2RdKX1yZXR1cm4gYX12YXIgZCxWLFcsWDtkPVsxMTE2MzUyNDA4LDE4OTk0NDc0NDEsMzA0OTMyMzQ3MSwzOTIxMDA5NTczLDk2MTk4NzE2MywxNTA4OTcwOTkzLDI0NTM2MzU3NDgsMjg3MDc2MzIyMSwzNjI0MzgxMDgwLDMxMDU5ODQwMSw2MDcyMjUyNzgsXG4xNDI2ODgxOTg3LDE5MjUwNzgzODgsMjE2MjA3ODIwNiwyNjE0ODg4MTAzLDMyNDgyMjI1ODAsMzgzNTM5MDQwMSw0MDIyMjI0Nzc0LDI2NDM0NzA3OCw2MDQ4MDc2MjgsNzcwMjU1OTgzLDEyNDkxNTAxMjIsMTU1NTA4MTY5MiwxOTk2MDY0OTg2LDI1NTQyMjA4ODIsMjgyMTgzNDM0OSwyOTUyOTk2ODA4LDMyMTAzMTM2NzEsMzMzNjU3MTg5MSwzNTg0NTI4NzExLDExMzkyNjk5MywzMzgyNDE4OTUsNjY2MzA3MjA1LDc3MzUyOTkxMiwxMjk0NzU3MzcyLDEzOTYxODIyOTEsMTY5NTE4MzcwMCwxOTg2NjYxMDUxLDIxNzcwMjYzNTAsMjQ1Njk1NjAzNywyNzMwNDg1OTIxLDI4MjAzMDI0MTEsMzI1OTczMDgwMCwzMzQ1NzY0NzcxLDM1MTYwNjU4MTcsMzYwMDM1MjgwNCw0MDk0NTcxOTA5LDI3NTQyMzM0NCw0MzAyMjc3MzQsNTA2OTQ4NjE2LDY1OTA2MDU1Niw4ODM5OTc4NzcsOTU4MTM5NTcxLDEzMjI4MjIyMTgsMTUzNzAwMjA2MywxNzQ3ODczNzc5LDE5NTU1NjIyMjIsMjAyNDEwNDgxNSxcbjIyMjc3MzA0NTIsMjM2MTg1MjQyNCwyNDI4NDM2NDc0LDI3NTY3MzQxODcsMzIwNDAzMTQ3OSwzMzI5MzI1Mjk4XTtWPVtuZXcgYihkWzBdLDM2MDk3Njc0NTgpLG5ldyBiKGRbMV0sNjAyODkxNzI1KSxuZXcgYihkWzJdLDM5NjQ0ODQzOTkpLG5ldyBiKGRbM10sMjE3MzI5NTU0OCksbmV3IGIoZFs0XSw0MDgxNjI4NDcyKSxuZXcgYihkWzVdLDMwNTM4MzQyNjUpLG5ldyBiKGRbNl0sMjkzNzY3MTU3OSksbmV3IGIoZFs3XSwzNjY0NjA5NTYwKSxuZXcgYihkWzhdLDI3MzQ4ODMzOTQpLG5ldyBiKGRbOV0sMTE2NDk5NjU0MiksbmV3IGIoZFsxMF0sMTMyMzYxMDc2NCksbmV3IGIoZFsxMV0sMzU5MDMwNDk5NCksbmV3IGIoZFsxMl0sNDA2ODE4MjM4MyksbmV3IGIoZFsxM10sOTkxMzM2MTEzKSxuZXcgYihkWzE0XSw2MzM4MDMzMTcpLG5ldyBiKGRbMTVdLDM0Nzk3NzQ4NjgpLG5ldyBiKGRbMTZdLDI2NjY2MTM0NTgpLG5ldyBiKGRbMTddLDk0NDcxMTEzOSksbmV3IGIoZFsxOF0sMjM0MTI2Mjc3MyksXG5uZXcgYihkWzE5XSwyMDA3ODAwOTMzKSxuZXcgYihkWzIwXSwxNDk1OTkwOTAxKSxuZXcgYihkWzIxXSwxODU2NDMxMjM1KSxuZXcgYihkWzIyXSwzMTc1MjE4MTMyKSxuZXcgYihkWzIzXSwyMTk4OTUwODM3KSxuZXcgYihkWzI0XSwzOTk5NzE5MzM5KSxuZXcgYihkWzI1XSw3NjY3ODQwMTYpLG5ldyBiKGRbMjZdLDI1NjY1OTQ4NzkpLG5ldyBiKGRbMjddLDMyMDMzMzc5NTYpLG5ldyBiKGRbMjhdLDEwMzQ0NTcwMjYpLG5ldyBiKGRbMjldLDI0NjY5NDg5MDEpLG5ldyBiKGRbMzBdLDM3NTgzMjYzODMpLG5ldyBiKGRbMzFdLDE2ODcxNzkzNiksbmV3IGIoZFszMl0sMTE4ODE3OTk2NCksbmV3IGIoZFszM10sMTU0NjA0NTczNCksbmV3IGIoZFszNF0sMTUyMjgwNTQ4NSksbmV3IGIoZFszNV0sMjY0MzgzMzgyMyksbmV3IGIoZFszNl0sMjM0MzUyNzM5MCksbmV3IGIoZFszN10sMTAxNDQ3NzQ4MCksbmV3IGIoZFszOF0sMTIwNjc1OTE0MiksbmV3IGIoZFszOV0sMzQ0MDc3NjI3KSxcbm5ldyBiKGRbNDBdLDEyOTA4NjM0NjApLG5ldyBiKGRbNDFdLDMxNTg0NTQyNzMpLG5ldyBiKGRbNDJdLDM1MDU5NTI2NTcpLG5ldyBiKGRbNDNdLDEwNjIxNzAwOCksbmV3IGIoZFs0NF0sMzYwNjAwODM0NCksbmV3IGIoZFs0NV0sMTQzMjcyNTc3NiksbmV3IGIoZFs0Nl0sMTQ2NzAzMTU5NCksbmV3IGIoZFs0N10sODUxMTY5NzIwKSxuZXcgYihkWzQ4XSwzMTAwODIzNzUyKSxuZXcgYihkWzQ5XSwxMzYzMjU4MTk1KSxuZXcgYihkWzUwXSwzNzUwNjg1NTkzKSxuZXcgYihkWzUxXSwzNzg1MDUwMjgwKSxuZXcgYihkWzUyXSwzMzE4MzA3NDI3KSxuZXcgYihkWzUzXSwzODEyNzIzNDAzKSxuZXcgYihkWzU0XSwyMDAzMDM0OTk1KSxuZXcgYihkWzU1XSwzNjAyMDM2ODk5KSxuZXcgYihkWzU2XSwxNTc1OTkwMDEyKSxuZXcgYihkWzU3XSwxMTI1NTkyOTI4KSxuZXcgYihkWzU4XSwyNzE2OTA0MzA2KSxuZXcgYihkWzU5XSw0NDI3NzYwNDQpLG5ldyBiKGRbNjBdLDU5MzY5ODM0NCksbmV3IGIoZFs2MV0sXG4zNzMzMTEwMjQ5KSxuZXcgYihkWzYyXSwyOTk5MzUxNTczKSxuZXcgYihkWzYzXSwzODE1OTIwNDI3KSxuZXcgYigzMzkxNTY5NjE0LDM5MjgzODM5MDApLG5ldyBiKDM1MTUyNjcyNzEsNTY2MjgwNzExKSxuZXcgYigzOTQwMTg3NjA2LDM0NTQwNjk1MzQpLG5ldyBiKDQxMTg2MzAyNzEsNDAwMDIzOTk5MiksbmV3IGIoMTE2NDE4NDc0LDE5MTQxMzg1NTQpLG5ldyBiKDE3NDI5MjQyMSwyNzMxMDU1MjcwKSxuZXcgYigyODkzODAzNTYsMzIwMzk5MzAwNiksbmV3IGIoNDYwMzkzMjY5LDMyMDYyMDMxNSksbmV3IGIoNjg1NDcxNzMzLDU4NzQ5NjgzNiksbmV3IGIoODUyMTQyOTcxLDEwODY3OTI4NTEpLG5ldyBiKDEwMTcwMzYyOTgsMzY1NTQzMTAwKSxuZXcgYigxMTI2MDAwNTgwLDI2MTgyOTc2NzYpLG5ldyBiKDEyODgwMzM0NzAsMzQwOTg1NTE1OCksbmV3IGIoMTUwMTUwNTk0OCw0MjM0NTA5ODY2KSxuZXcgYigxNjA3MTY3OTE1LDk4NzE2NzQ2OCksbmV3IGIoMTgxNjQwMjMxNixcbjEyNDYxODk1OTEpXTtYPVtuZXcgYigwLDEpLG5ldyBiKDAsMzI4OTgpLG5ldyBiKDIxNDc0ODM2NDgsMzI5MDYpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzUxNjQxNiksbmV3IGIoMCwzMjkwNyksbmV3IGIoMCwyMTQ3NDgzNjQ5KSxuZXcgYigyMTQ3NDgzNjQ4LDIxNDc1MTY1NDUpLG5ldyBiKDIxNDc0ODM2NDgsMzI3NzcpLG5ldyBiKDAsMTM4KSxuZXcgYigwLDEzNiksbmV3IGIoMCwyMTQ3NTE2NDI1KSxuZXcgYigwLDIxNDc0ODM2NTgpLG5ldyBiKDAsMjE0NzUxNjU1NSksbmV3IGIoMjE0NzQ4MzY0OCwxMzkpLG5ldyBiKDIxNDc0ODM2NDgsMzI5MDUpLG5ldyBiKDIxNDc0ODM2NDgsMzI3NzEpLG5ldyBiKDIxNDc0ODM2NDgsMzI3NzApLG5ldyBiKDIxNDc0ODM2NDgsMTI4KSxuZXcgYigwLDMyNzc4KSxuZXcgYigyMTQ3NDgzNjQ4LDIxNDc0ODM2NTgpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzUxNjU0NSksbmV3IGIoMjE0NzQ4MzY0OCwzMjg5NiksbmV3IGIoMCwyMTQ3NDgzNjQ5KSxcbm5ldyBiKDIxNDc0ODM2NDgsMjE0NzUxNjQyNCldO1c9W1swLDM2LDMsNDEsMThdLFsxLDQ0LDEwLDQ1LDJdLFs2Miw2LDQzLDE1LDYxXSxbMjgsNTUsMjUsMjEsNTZdLFsyNywyMCwzOSw4LDE0XV07XCJmdW5jdGlvblwiPT09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gQ30pOlwidW5kZWZpbmVkXCIhPT10eXBlb2YgZXhwb3J0cz8oXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9QyksZXhwb3J0cz1DKTpZLmpzU0hBPUN9KSh0aGlzKTtcbiIsImltcG9ydCBqc1NIQSBmcm9tICdqc3NoYSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVVVSUQoKSB7XG4gIGlmICh3aW5kb3cuY3J5cHRvICYmIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBVaW50MTZBcnJheSg4KTtcbiAgICB3aW5kb3cuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhidWYpO1xuICAgIHZhciBTNCA9IGZ1bmN0aW9uKG51bSkgeyB2YXIgcmV0ID0gbnVtLnRvU3RyaW5nKDE2KTsgd2hpbGUocmV0Lmxlbmd0aCA8IDQpIHJldCA9ICcwJytyZXQ7IHJldHVybiByZXQ7IH07XG4gICAgcmV0dXJuIFM0KGJ1ZlswXSkrUzQoYnVmWzFdKSsnLScrUzQoYnVmWzJdKSsnLScrUzQoYnVmWzNdKSsnLScrUzQoYnVmWzRdKSsnLScrUzQoYnVmWzVdKStTNChidWZbNl0pK1M0KGJ1Zls3XSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxufVxuXG4vLyBIYXNoZXMgdGhlIGdpdmVuIHRleHQgdG8gYSBVVUlEIHN0cmluZyBvZiBmb3JtICd4eHh4eHh4eC15eXl5LXp6enotd3d3dy1hYWFhYWFhYWFhYWEnLlxuZXhwb3J0IGZ1bmN0aW9uIGhhc2hUb1VVSUQodGV4dCkge1xuICB2YXIgc2hhT2JqID0gbmV3IGpzU0hBKCdTSEEtMjU2JywgJ1RFWFQnKTtcbiAgc2hhT2JqLnVwZGF0ZSh0ZXh0KTtcbiAgdmFyIGhhc2ggPSBuZXcgVWludDhBcnJheShzaGFPYmouZ2V0SGFzaCgnQVJSQVlCVUZGRVInKSk7XG4gIFxuICB2YXIgbiA9ICcnO1xuICBmb3IodmFyIGkgPSAwOyBpIDwgaGFzaC5ieXRlTGVuZ3RoLzI7ICsraSkge1xuICAgIHZhciBzID0gKGhhc2hbaV0gXiBoYXNoW2krOF0pLnRvU3RyaW5nKDE2KTtcbiAgICBpZiAocy5sZW5ndGggPT0gMSkgcyA9ICcwJyArIHM7XG4gICAgbiArPSBzO1xuICB9XG4gIHJldHVybiBuLnNsaWNlKDAsIDgpICsgJy0nICsgbi5zbGljZSg4LCAxMikgKyAnLScgKyBuLnNsaWNlKDEyLCAxNikgKyAnLScgKyBuLnNsaWNlKDE2LCAyMCkgKyAnLScgKyBuLnNsaWNlKDIwKTtcbn1cbiIsInZhciByZXN1bHRzU2VydmVyVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6MzMzMy8nO1xuXG52YXIgdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlciA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3VsdHNTZXJ2ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgfVxuXG4gIHN0b3JlU3RhcnQocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9zdGFydFwiLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkocmVzdWx0cykpO1xuICAgIGNvbnNvbGUubG9nKCdSZXN1bHRzU2VydmVyOiBSZWNvcmRlZCB0ZXN0IHN0YXJ0IHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3N0YXJ0XCIpO1xuICB9XG5cbiAgc3RvcmVTeXN0ZW1JbmZvKHJlc3VsdHMpIHtcbiAgICBpZiAoIXVwbG9hZFJlc3VsdHNUb1Jlc3VsdHNTZXJ2ZXIpIHJldHVybjtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oXCJQT1NUXCIsIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3N5c3RlbV9pbmZvXCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFVwbG9hZGVkIHN5c3RlbSBpbmZvIHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV9zeXN0ZW1faW5mb1wiKTtcbiAgfVxuXG4gIHN0b3JlVGVzdFJlc3VsdHMocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfdGVzdF9yZXN1bHRzXCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFJlY29yZGVkIHRlc3QgZmluaXNoIHRvICcgKyByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3Jlc3VsdHNcIik7XG4gIH0gIFxufTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRcdCddJ1xuXHRcdFx0XHRdLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCddPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBlbmNvZGUoa2V5LCBvcHRpb25zKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZGVjb2RlOiB0cnVlLCBhcnJheUZvcm1hdDogJ25vbmUnfSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKHJldCkuc29ydCgpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9O1xuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ID09PSBmYWxzZSkge1xuXHRcdG9wdGlvbnMuc29ydCA9ICgpID0+IHt9O1xuXHR9XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdHJldHVybiBvYmogPyBPYmplY3Qua2V5cyhvYmopLnNvcnQob3B0aW9ucy5zb3J0KS5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlMiBvZiB2YWx1ZS5zbGljZSgpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZTIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzdWx0LnB1c2goZm9ybWF0dGVyKGtleSwgdmFsdWUyLCByZXN1bHQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpIDogJyc7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dXJsOiBpbnB1dC5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gYWRkR0VUKHVybCwgcGFyYW1ldGVyKSB7XG4gIGlmICh1cmwuaW5kZXhPZignPycpICE9IC0xKSByZXR1cm4gdXJsICsgJyYnICsgcGFyYW1ldGVyO1xuICBlbHNlIHJldHVybiB1cmwgKyAnPycgKyBwYXJhbWV0ZXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5eXl5bW1kZGhobW1zcygpIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICB2YXIgeXl5eSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1tID0gZGF0ZS5nZXRNb250aCgpIDwgOSA/IFwiMFwiICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpIDogKGRhdGUuZ2V0TW9udGgoKSArIDEpOyAvLyBnZXRNb250aCgpIGlzIHplcm8tYmFzZWRcbiAgdmFyIGRkICA9IGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyBcIjBcIiArIGRhdGUuZ2V0RGF0ZSgpIDogZGF0ZS5nZXREYXRlKCk7XG4gIHZhciBoaCA9IGRhdGUuZ2V0SG91cnMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldEhvdXJzKCkgOiBkYXRlLmdldEhvdXJzKCk7XG4gIHZhciBtaW4gPSBkYXRlLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldE1pbnV0ZXMoKSA6IGRhdGUuZ2V0TWludXRlcygpO1xuICB2YXIgc2VjID0gZGF0ZS5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRTZWNvbmRzKCkgOiBkYXRlLmdldFNlY29uZHMoKTtcbiAgcmV0dXJuIHl5eXkgKyAnLScgKyBtbSArICctJyArIGRkICsgJyAnICsgaGggKyAnOicgKyBtaW4gKyAnOicgKyBzZWM7XG59XG4iLCJpbXBvcnQgYnJvd3NlckZlYXR1cmVzIGZyb20gJ2Jyb3dzZXItZmVhdHVyZXMnO1xuaW1wb3J0IHdlYmdsSW5mbyBmcm9tICd3ZWJnbC1pbmZvJztcbmltcG9ydCB7Z2VuZXJhdGVVVUlELCBoYXNoVG9VVUlEfSBmcm9tICcuL1VVSUQnO1xuaW1wb3J0IFJlc3VsdHNTZXJ2ZXIgZnJvbSAnLi9yZXN1bHRzLXNlcnZlcic7XG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCB7YWRkR0VULCB5eXl5bW1kZGhobW1zc30gZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG5jb25zdCBWRVJTSU9OID0gJzEuMCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlc3RBcHAge1xuICBwYXJzZVBhcmFtZXRlcnMoKSB7XG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgaWYgKHBhcmFtZXRlcnNbJ251bXRpbWVzJ10pIHtcbiAgICAgIHRoaXMudnVlQXBwLm9wdGlvbnMuZ2VuZXJhbC5udW1UaW1lc1RvUnVuRWFjaFRlc3QgPSBwYXJzZUludChwYXJhbWV0ZXJzLm51bXRpbWVzKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHMuZmFrZVdlYkdMID0gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKHBhcmFtZXRlcnNbJ3NlbGVjdGVkJ10pIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkID0gcGFyYW1ldGVyc1snc2VsZWN0ZWQnXS5zcGxpdCgnLCcpO1xuICAgICAgdGhpcy52dWVBcHAudGVzdHMuZm9yRWFjaCh0ZXN0ID0+IHRlc3Quc2VsZWN0ZWQgPSBmYWxzZSk7XG4gICAgICBzZWxlY3RlZC5mb3JFYWNoKGlkID0+IHtcbiAgICAgICAgdmFyIHRlc3QgPSB0aGlzLnZ1ZUFwcC50ZXN0cy5maW5kKHRlc3QgPT4gdGVzdC5pZCA9PT0gaWQpO1xuICAgICAgICBpZiAodGVzdCkgdGVzdC5zZWxlY3RlZCA9IHRydWU7XG4gICAgICB9KVxuICAgIH1cblxuICB9XG5cbiAgY29uc3RydWN0b3IodnVlQXBwKSB7XG4gICAgY29uc29sZS5sb2coYFRlc3QgQXBwIHYuJHtWRVJTSU9OfWApO1xuXG4gICAgdGhpcy52dWVBcHAgPSB2dWVBcHA7XG4gICAgdGhpcy50ZXN0cyA9IFtdO1xuICAgIHRoaXMuaXNDdXJyZW50bHlSdW5uaW5nVGVzdCA9IGZhbHNlO1xuICAgIHRoaXMuYnJvd3NlclVVSUQgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QgPSB7fTtcbiAgICB0aGlzLnJlc3VsdHNTZXJ2ZXIgPSBuZXcgUmVzdWx0c1NlcnZlcigpO1xuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xuXG4gICAgZmV0Y2goJ3Rlc3RzLmpzb24nKVxuICAgICAgLnRoZW4ocmVzcG9uc2UgPT4geyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KVxuICAgICAgLnRoZW4oanNvbiA9PiB7XG4gICAgICAgIGpzb24uZm9yRWFjaCh0ZXN0ID0+IHtcbiAgICAgICAgICB0ZXN0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGVzdHMgPSB2dWVBcHAudGVzdHMgPSBqc29uO1xuXG4gICAgICAgIHRoaXMucGFyc2VQYXJhbWV0ZXJzKCk7XG4gICAgICAgIHRoaXMuYXV0b1J1bigpO1xuICAgICAgfSlcblxuICAgIHRoaXMuaW5pdFdTU2VydmVyKCk7XG5cbiAgICB0aGlzLndlYmdsSW5mbyA9IHZ1ZUFwcC53ZWJnbEluZm8gPSB3ZWJnbEluZm8oKTtcbiAgICBicm93c2VyRmVhdHVyZXMoZmVhdHVyZXMgPT4ge1xuICAgICAgdGhpcy5icm93c2VySW5mbyA9IHZ1ZUFwcC5icm93c2VySW5mbyA9IGZlYXR1cmVzO1xuICAgICAgdGhpcy5vbkJyb3dzZXJSZXN1bHRzUmVjZWl2ZWQoe30pO1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdFdTU2VydmVyKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignYmVuY2htYXJrX2ZpbmlzaGVkJywgKHJlc3VsdCkgPT4ge1xuICAgICAgcmVzdWx0Lmpzb24gPSBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDQpO1xuICAgICAgdmFyIG9wdGlvbnMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMudnVlQXBwLm9wdGlvbnMudGVzdHMpKTtcbiAgICAgIGlmIChvcHRpb25zLmZha2VXZWJHTCA9PT0gZmFsc2UpIHtcbiAgICAgICAgZGVsZXRlIG9wdGlvbnMuZmFrZVdlYkdMO1xuICAgICAgfVxuXG4gICAgICByZXN1bHQub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgIHZhciB0ZXN0UmVzdWx0cyA9IHtcbiAgICAgICAgcmVzdWx0OiByZXN1bHRcbiAgICAgIH07XG4gICAgICB0ZXN0UmVzdWx0cy5icm93c2VyVVVJRCA9IHRoaXMuYnJvd3NlclVVSUQ7XG4gICAgICB0ZXN0UmVzdWx0cy5zdGFydFRpbWUgPSB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnN0YXJ0VGltZTtcbiAgICAgIHRlc3RSZXN1bHRzLmZha2VXZWJHTCA9IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QuZmFrZVdlYkdMO1xuICAgICAgLy90ZXN0UmVzdWx0cy5pZCA9IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QuaWQ7XG4gICAgICB0ZXN0UmVzdWx0cy5maW5pc2hUaW1lID0geXl5eW1tZGRoaG1tc3MoKTtcbiAgICAgIHRlc3RSZXN1bHRzLm5hbWUgPSB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0Lm5hbWU7XG4gICAgICB0ZXN0UmVzdWx0cy5ydW5VVUlEID0gdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlEO1xuICAgICAgLy9pZiAoYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mbyAmJiBicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHRlc3RSZXN1bHRzLmhhcmR3YXJlVVVJRCA9IGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8uVVVJRDtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1bk9yZGluYWwgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0UmVzdWx0cy5pZF0gPyAodGhpcy52dWVBcHAucmVzdWx0c0J5SWRbdGVzdFJlc3VsdHMuaWRdLmxlbmd0aCArIDEpIDogMTtcbiAgICAgIHRoaXMucmVzdWx0c1NlcnZlci5zdG9yZVRlc3RSZXN1bHRzKHRlc3RSZXN1bHRzKTtcblxuICAgICAgLy8gQWNjdW11bGF0ZSByZXN1bHRzIGluIGRpY3Rpb25hcnkuXG4gICAgICAvL2lmICh0ZXN0UmVzdWx0cy5yZXN1bHQgIT0gJ0ZBSUwnKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0pIHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Jlc3VsdC50ZXN0X2lkXSA9IFtdO1xuICAgICAgICB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFtyZXN1bHQudGVzdF9pZF0ucHVzaCh0ZXN0UmVzdWx0cyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF2ZXJhZ2VcbiAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNBdmVyYWdlID0gW107XG4gIFxuICAgICAgT2JqZWN0LmtleXModGhpcy52dWVBcHAucmVzdWx0c0J5SWQpLmZvckVhY2godGVzdElEID0+IHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0SURdO1xuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFyIHRlc3RSZXN1bHRzQXZlcmFnZSA9IHt9O1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50ZXN0X2lkID0gYCR7dGVzdElEfSAoJHtyZXN1bHRzLmxlbmd0aH0gc2FtcGxlcylgO1xuICAgICAgICBcbiAgICAgICAgICBmdW5jdGlvbiBnZXQ3MFBlcmNlbnRBdmVyYWdlKGdldEZpZWxkKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZXQ3MFBlcmNlbnRBcnJheSgpIHtcbiAgICAgICAgICAgICAgZnVuY3Rpb24gY21wKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0RmllbGQoYSkgLSBnZXRGaWVsZChiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPD0gMykgcmV0dXJuIHJlc3VsdHMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgIHZhciBmcmFjID0gTWF0aC5yb3VuZCgwLjcgKiByZXN1bHRzLmxlbmd0aCk7XG4gICAgICAgICAgICAgIHZhciByZXN1bHRzQyA9IHJlc3VsdHMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgIHJlc3VsdHNDLnNvcnQoY21wKTtcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmUgPSByZXN1bHRzLmxlbmd0aCAtIGZyYWM7XG4gICAgICAgICAgICAgIHZhciBudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQgPSBNYXRoLmZsb29yKG51bUVsZW1lbnRzVG9SZW1vdmUvMik7XG4gICAgICAgICAgICAgIHZhciBudW1FbGVtZW50c1RvUmVtb3ZlQmFjayA9IG51bUVsZW1lbnRzVG9SZW1vdmUgLSBudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQ7XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzQy5zbGljZShudW1FbGVtZW50c1RvUmVtb3ZlRnJvbnQsIHJlc3VsdHNDLmxlbmd0aCAtIG51bUVsZW1lbnRzVG9SZW1vdmVCYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcnIgPSBnZXQ3MFBlcmNlbnRBcnJheSgpO1xuICAgICAgICAgICAgdmFyIHRvdGFsID0gMDtcbiAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHRvdGFsICs9IGdldEZpZWxkKGFycltpXSk7XG4gICAgICAgICAgICByZXR1cm4gdG90YWwgLyBhcnIubGVuZ3RoO1xuICAgICAgICAgIH0gIFxuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50b3RhbFRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LnRvdGFsVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdUlkbGVQZXJjID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5jcHVJZGxlUGVyYzsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdUlkbGVUaW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5jcHVJZGxlVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmNwdVRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdVRpbWU7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS5wYWdlTG9hZFRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LnBhZ2VMb2FkVGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLmF2Z0ZwcyA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuYXZnRnBzOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UudGltZVRvRmlyc3RGcmFtZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQudGltZVRvRmlyc3RGcmFtZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLm51bVN0dXR0ZXJFdmVudHMgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0Lm51bVN0dXR0ZXJFdmVudHM7IH0pO1xuICAgICAgICAgIC8qdG90YWxSZW5kZXJUaW1lICAgICB0b3RhbFRpbWUqL1xuICAgICAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNBdmVyYWdlLnB1c2godGVzdFJlc3VsdHNBdmVyYWdlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgXG5cbiAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgLypcbiAgICAgIGlmIChydW5uaW5nVGVzdHNJblByb2dyZXNzKSB7XG4gICAgICAgIHZhciB0ZXN0U3RhcnRlZCA9IHJ1bk5leHRRdWV1ZWRUZXN0KCk7XG4gICAgICAgIGlmICghdGVzdFN0YXJ0ZWQpIHtcbiAgICAgICAgICBpZiAodG9ydHVyZU1vZGUpIHtcbiAgICAgICAgICAgIHRlc3RzUXVldWVkVG9SdW4gPSBnZXRTZWxlY3RlZFRlc3RzKCk7XG4gICAgICAgICAgICBydW5TZWxlY3RlZFRlc3RzKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJ1bm5pbmdUZXN0c0luUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIGN1cnJlbnRseVJ1bm5pbmdUZXN0ID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRseVJ1bm5pbmdUZXN0ID0gbnVsbDtcbiAgICAgIH1cbiAgICAgICovXG4gICAgICB0aGlzLnJ1bk5leHRRdWV1ZWRUZXN0KCk7XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5zb2NrZXQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3RfZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTsgIFxuICB9XG5cbiAgb25Ccm93c2VyUmVzdWx0c1JlY2VpdmVkKCkge1xuICAgIGNvbnNvbGUubG9nKCdCcm93c2VyIFVVSUQ6JywgdGhpcy5nZXRCcm93c2VyVVVJRCgpKTtcbiAgICB2YXIgc3lzdGVtSW5mbyA9IHtcbiAgICAgIGJyb3dzZXJVVUlEOiB0aGlzLmJyb3dzZXJVVUlELFxuICAgICAgd2ViZ2xJbmZvOiB0aGlzLndlYmdsSW5mbyxcbiAgICAgIGJyb3dzZXJJbmZvOiB0aGlzLmJyb3dzZXJJbmZvXG4gICAgfTtcblxuICAgIHRoaXMucmVzdWx0c1NlcnZlci5zdG9yZVN5c3RlbUluZm8oc3lzdGVtSW5mbyk7XG4gIH1cblxuICBydW5TZWxlY3RlZFRlc3RzKCkge1xuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IHRoaXMudGVzdHMuZmlsdGVyKHggPT4geC5zZWxlY3RlZCk7XG4gICAgXG4gICAgLy9pZiAoZGF0YS5udW1UaW1lc1RvUnVuRWFjaFRlc3QgPiAxKSB7XG4gICAgLy8gIGRhdGEubnVtVGltZXNUb1J1bkVhY2hUZXN0ID0gTWF0aC5tYXgoZGF0YS5udW1UaW1lc1RvUnVuRWFjaFRlc3QsIDEwMDApO1xuICAgIGNvbnN0IG51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IHRoaXMudnVlQXBwLm9wdGlvbnMuZ2VuZXJhbC5udW1UaW1lc1RvUnVuRWFjaFRlc3Q7XG4gICAgdGhpcy5wcm9ncmVzcyA9IHtcbiAgICAgIHRvdGFsR2xvYmFsOiBudW1UaW1lc1RvUnVuRWFjaFRlc3QgKiB0aGlzLnRlc3RzUXVldWVkVG9SdW4ubGVuZ3RoLFxuICAgICAgY3VycmVudEdsb2JhbDogMSxcbiAgICAgIHRlc3RzOiB7fVxuICAgIH07XG5cbiAgICB7XG4gICAgICB2YXIgbXVsdGlwbGVzID0gW107XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBudW1UaW1lc1RvUnVuRWFjaFRlc3Q7IGorKykge1xuICAgICAgICAgIG11bHRpcGxlcy5wdXNoKHRoaXMudGVzdHNRdWV1ZWRUb1J1bltpXSk7XG4gICAgICAgICAgdGhpcy5wcm9ncmVzcy50ZXN0c1t0aGlzLnRlc3RzUXVldWVkVG9SdW5baV0uaWRdID0ge1xuICAgICAgICAgICAgY3VycmVudDogMSxcbiAgICAgICAgICAgIHRvdGFsOiBudW1UaW1lc1RvUnVuRWFjaFRlc3RcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IG11bHRpcGxlcztcbiAgICB9XG5cbiAgICB0aGlzLnJ1bm5pbmdUZXN0c0luUHJvZ3Jlc3MgPSB0cnVlO1xuICAgIHRoaXMucnVuTmV4dFF1ZXVlZFRlc3QoKTtcbiAgfVxuICBcbiAgcnVuTmV4dFF1ZXVlZFRlc3QoKSB7ICBcbiAgICBpZiAodGhpcy50ZXN0c1F1ZXVlZFRvUnVuLmxlbmd0aCA9PSAwKSB7XG4gICAgICB0aGlzLnByb2dyZXNzID0gbnVsbDtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHQgPSB0aGlzLnRlc3RzUXVldWVkVG9SdW5bIDAgXTtcbiAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4uc3BsaWNlKDAsIDEpO1xuICAgIHRoaXMucnVuVGVzdCh0LmlkLCBmYWxzZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBnZXRCcm93c2VyVVVJRCgpIHtcbiAgICB2YXIgaGFyZHdhcmVVVUlEID0gJyc7XG4gICAgaWYgKHRoaXMubmF0aXZlU3lzdGVtSW5mbyAmJiB0aGlzLm5hdGl2ZVN5c3RlbUluZm8uVVVJRCkge1xuICAgICAgaGFyZHdhcmVVVUlEID0gdGhpcy5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhcmR3YXJlVVVJRCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdVVUlEJyk7XG4gICAgICBpZiAoIWhhcmR3YXJlVVVJRCkge1xuICAgICAgICBoYXJkd2FyZVVVSUQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1VVSUQnLCBoYXJkd2FyZVVVSUQpO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgLy8gV2Ugbm93IGhhdmUgYWxsIHRoZSBpbmZvIHRvIGNvbXB1dGUgdGhlIGJyb3dzZXIgVVVJRFxuICAgIHZhciBicm93c2VyVVVJRFN0cmluZyA9IGhhcmR3YXJlVVVJRCArICh0aGlzLmJyb3dzZXJJbmZvLnVzZXJBZ2VudC5icm93c2VyVmVyc2lvbiB8fCAnJykgKyAodGhpcy5icm93c2VySW5mby5uYXZpZ2F0b3IuYnVpbGRJRCB8fCAnJyk7XG4gICAgdGhpcy5icm93c2VyVVVJRCA9IGhhc2hUb1VVSUQoYnJvd3NlclVVSURTdHJpbmcpO1xuXG4gICAgcmV0dXJuIHRoaXMuYnJvd3NlclVVSUQ7XG4gIH1cblxuICBydW5UZXN0KGlkLCBpbnRlcmFjdGl2ZSwgcmVjb3JkKSB7XG4gICAgdmFyIHRlc3QgPSB0aGlzLnRlc3RzLmZpbmQodCA9PiB0LmlkID09PSBpZCk7XG4gICAgaWYgKCF0ZXN0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXN0IG5vdCBmb3VuZCwgaWQ6JywgaWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnUnVubmluZyB0ZXN0OicsIHRlc3QubmFtZSk7XG4gIFxuICAgIHZhciBmYWtlV2ViR0wgPSB0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzLmZha2VXZWJHTDtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnRlc3QgPSB0ZXN0O1xuICAgIHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3Quc3RhcnRUaW1lID0geXl5eW1tZGRoaG1tc3MoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmZha2VXZWJHTCA9IGZha2VXZWJHTDtcbiAgICBcbiAgICB2YXIgdXJsID0gKGludGVyYWN0aXZlID8gJ3N0YXRpYy8nOiAndGVzdHMvJykgKyB0ZXN0LnVybDtcbiAgICBpZiAoIWludGVyYWN0aXZlKSB1cmwgPSBhZGRHRVQodXJsLCAncGxheWJhY2snKTtcbiAgICBpZiAoZmFrZVdlYkdMKSB1cmwgPSBhZGRHRVQodXJsLCAnZmFrZS13ZWJnbCcpO1xuICAgIGlmICh0ZXN0Lm51bWZyYW1lcykgdXJsID0gYWRkR0VUKHVybCwgJ251bWZyYW1lcz0nICsgdGVzdC5udW1mcmFtZXMpO1xuICAgIGlmICh0ZXN0LndpbmRvd3NpemUpIHVybCA9IGFkZEdFVCh1cmwsICd3aWR0aD0nICsgdGVzdC53aW5kb3dzaXplLndpZHRoICsgJyZoZWlnaHQ9JyArIHRlc3Qud2luZG93c2l6ZS5oZWlnaHQpO1xuICAgIGlmIChyZWNvcmQpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdyZWNvcmRpbmcnKTtcbiAgICB9IGVsc2UgaWYgKHRlc3QuaW5wdXQpIHtcbiAgICAgIHVybCA9IGFkZEdFVCh1cmwsICdyZXBsYXknKTtcbiAgICAgIGlmICh0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzLnNob3dLZXlzKSB1cmwgPSBhZGRHRVQodXJsLCAnc2hvdy1rZXlzJyk7XG4gICAgICBpZiAodGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cy5zaG93TW91c2UpIHVybCA9IGFkZEdFVCh1cmwsICdzaG93LW1vdXNlJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb2dyZXNzKSB7XG4gICAgICB1cmwgPSBhZGRHRVQodXJsLCAnb3JkZXItdGVzdD0nICsgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0uY3VycmVudCArICcmdG90YWwtdGVzdD0nICsgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0udG90YWwpO1xuICAgICAgdXJsID0gYWRkR0VUKHVybCwgJ29yZGVyLWdsb2JhbD0nICsgdGhpcy5wcm9ncmVzcy5jdXJyZW50R2xvYmFsICsgJyZ0b3RhbC1nbG9iYWw9JyArIHRoaXMucHJvZ3Jlc3MudG90YWxHbG9iYWwpO1xuICAgICAgdGhpcy5wcm9ncmVzcy50ZXN0c1tpZF0uY3VycmVudCsrO1xuICAgICAgdGhpcy5wcm9ncmVzcy5jdXJyZW50R2xvYmFsKys7XG4gICAgfVxuXG4gICAgXG5cbiAgICB3aW5kb3cub3Blbih1cmwpO1xuICBcbiAgICB2YXIgdGVzdERhdGEgPSB7XG4gICAgICAnYnJvd3NlclVVSUQnOiB0aGlzLmJyb3dzZXJVVUlELFxuICAgICAgJ2lkJzogdGVzdC5pZCxcbiAgICAgICduYW1lJzogdGVzdC5uYW1lLFxuICAgICAgJ3N0YXJ0VGltZSc6IHl5eXltbWRkaGhtbXNzKCksXG4gICAgICAncmVzdWx0JzogJ3VuZmluaXNoZWQnLFxuICAgICAgLy8nRmFrZVdlYkdMJzogZGF0YS5vcHRpb25zLmZha2VXZWJHTCxcbiAgICAgICdydW5VVUlEJzogdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5ydW5VVUlELFxuICAgICAgJ3J1bk9yZGluYWwnOiB0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0LmlkXSA/ICh0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0LmlkXS5sZW5ndGggKyAxKSA6IDFcbiAgICB9O1xuICBcbiAgICAvL2lmIChkYXRhLm5hdGl2ZVN5c3RlbUluZm8gJiYgZGF0YS5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQpIHRlc3REYXRhLmhhcmR3YXJlVVVJRCA9IGRhdGEubmF0aXZlU3lzdGVtSW5mby5VVUlEO1xuICAgIC8vdGhpcy5yZXN1bHRzU2VydmVyLnN0b3JlU3RhcnQodGVzdERhdGEpO1xuICB9XG4gIFxuICBhdXRvUnVuKCkge1xuICAgIGlmICghdGhpcy5pc0N1cnJlbnRseVJ1bm5pbmdUZXN0ICYmIGxvY2F0aW9uLnNlYXJjaC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2F1dG9ydW4nKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMucnVuU2VsZWN0ZWRUZXN0cygpO1xuICAgIH1cbiAgfSBcbn1cblxuLypcbiAgLy8gRmV0Y2ggaW5mb3JtYXRpb24gYWJvdXQgbmF0aXZlIHN5c3RlbSBpZiB3ZSBhcmUgcnVubmluZyBhcyBsb2NhbGhvc3QuXG4gIGZ1bmN0aW9uIGZldGNoTmF0aXZlU3lzdGVtSW5mbygpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIG5hdGl2ZVN5c3RlbUluZm8gPSBudWxsO1xuICAgICAgdmFyIHN5c3RlbUluZm8gPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHN5c3RlbUluZm8ub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzeXN0ZW1JbmZvLnJlYWR5U3RhdGUgIT0gNCkgcmV0dXJuO1xuICAgICAgICB2YXIgbmF0aXZlU3lzdGVtSW5mbyA9IEpTT04ucGFyc2Uoc3lzdGVtSW5mby5yZXNwb25zZVRleHQpO1xuICAgICAgICByZXNvbHZlKG5hdGl2ZVN5c3RlbUluZm8pO1xuICAgICAgfVxuICAgICAgc3lzdGVtSW5mby5vcGVuKCdQT1NUJywgJ3N5c3RlbV9pbmZvJywgdHJ1ZSk7XG4gICAgICBzeXN0ZW1JbmZvLnNlbmQoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG52YXIgbmF0aXZlSW5mb1Byb21pc2U7XG5pZiAobG9jYXRpb24uaHJlZi5pbmRleE9mKCdodHRwOi8vbG9jYWxob3N0JykgPT0gMCkge1xuICBuYXRpdmVJbmZvUHJvbWlzZSA9IGZldGNoTmF0aXZlU3lzdGVtSW5mbygpO1xufSBlbHNlIHtcbiAgbmF0aXZlSW5mb1Byb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHsgc2V0VGltZW91dChmdW5jdGlvbigpIHsgcmVzb2x2ZSgpOyB9LCAxKTsgfSk7XG59XG5cblByb21pc2UuYWxsKFticm93c2VySW5mb1Byb21pc2UsIG5hdGl2ZUluZm9Qcm9taXNlXSkudGhlbihmdW5jdGlvbihhbGxSZXN1bHRzKSB7XG4gIHZhciBicm93c2VySW5mbyA9IGFsbFJlc3VsdHNbMF07XG4gIHZhciBuYXRpdmVJbmZvID0gYWxsUmVzdWx0c1sxXTtcbiAgaWYgKG5hdGl2ZUluZm8pIHtcbiAgICBicm93c2VySW5mb1snbmF0aXZlU3lzdGVtSW5mbyddID0gbmF0aXZlSW5mb1snc3lzdGVtJ107XG4gICAgYnJvd3NlckluZm9bJ2Jyb3dzZXJJbmZvJ10gPSBuYXRpdmVJbmZvWydicm93c2VyJ107XG4gIH1cbiAgYnJvd3NlckluZm9bJ2Jyb3dzZXJVVUlEJ10gPSBicm93c2VyVVVJRDtcbiAgb25Ccm93c2VyUmVzdWx0c1JlY2VpdmVkKGJyb3dzZXJJbmZvKTtcbn0sIGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmVycm9yKCdicm93c2VyIGluZm8gdGVzdCBmYWlsZWQhJyk7XG59KTtcbiovXG5cbiIsImltcG9ydCBUZXN0QXBwIGZyb20gJy4vYXBwJztcblxudmFyIGRhdGEgPSB7XG4gIHRlc3RzOiBbXSxcbiAgc2hvd19qc29uOiBmYWxzZSxcbiAgYnJvd3NlckluZm86IG51bGwsXG4gIHdlYmdsSW5mbzogbnVsbCxcbiAgbmF0aXZlU3lzdGVtSW5mbzoge30sXG4gIHNob3dJbmZvOiBmYWxzZSxcbiAgb3B0aW9uczoge1xuICAgIGdlbmVyYWw6IHtcbiAgICAgIG51bVRpbWVzVG9SdW5FYWNoVGVzdDogMVxuICAgIH0sXG4gICAgdGVzdHM6IHtcbiAgICAgIGZha2VXZWJHTDogZmFsc2UsXG4gICAgICBzaG93S2V5czogZmFsc2UsXG4gICAgICBzaG93TW91c2U6IGZhbHNlXG4gICAgfVxuICB9LFxuICByZXN1bHRzOiBbXSxcbiAgcmVzdWx0c0F2ZXJhZ2U6IFtdLFxuICByZXN1bHRzQnlJZDoge31cbn07XG5cbnZhciB0ZXN0QXBwID0gbnVsbDtcblxud2luZG93Lm9ubG9hZCA9ICh4KSA9PiB7XG4gIHZhciB2dWVBcHAgPSBuZXcgVnVlKHtcbiAgICBlbDogJyNhcHAnLFxuICAgIGRhdGE6IGRhdGEsXG4gICAgbWV0aG9kczoge1xuICAgICAgZm9ybWF0TnVtZXJpYyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9GaXhlZCgyKTtcbiAgICAgIH0sXG4gICAgICBydW5UZXN0OiBmdW5jdGlvbih0ZXN0LCBpbnRlcmFjdGl2ZSwgcmVjb3JkaW5nKSB7XG4gICAgICAgIHRlc3RBcHAudGVzdHNRdWV1ZWRUb1J1biA9IFtdO1xuICAgICAgICB0ZXN0QXBwLnJ1blRlc3QodGVzdC5pZCwgaW50ZXJhY3RpdmUsIHJlY29yZGluZyk7XG4gICAgICB9LFxuICAgICAgcnVuU2VsZWN0ZWRUZXN0czogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRlc3RBcHAucnVuU2VsZWN0ZWRUZXN0cygpO1xuICAgICAgfSxcbiAgICAgIGdldEJyb3dzZXJJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBkYXRhLmJyb3dzZXJJbmZvID8gSlNPTi5zdHJpbmdpZnkoZGF0YS5icm93c2VySW5mbywgbnVsbCwgNCkgOiAnQ2hlY2tpbmcgYnJvd3NlciBmZWF0dXJlcy4uLic7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgXG4gIHRlc3RBcHAgPSBuZXcgVGVzdEFwcCh2dWVBcHApO1xuXG59XG4iXSwibmFtZXMiOlsidXNlckFnZW50SW5mbyIsInRoaXMiLCJqc1NIQSIsImRlY29kZSIsImRlY29kZUNvbXBvbmVudCIsImJyb3dzZXJGZWF0dXJlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0NBQUE7Q0FDQSxTQUFTLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtDQUN0QyxFQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ25ELENBQUM7O0NBRUQ7Q0FDQSxTQUFTLG1CQUFtQixDQUFDLEdBQUcsRUFBRTtDQUNsQyxFQUFFLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQy9ELENBQUM7O0NBRUQ7Q0FDQSxTQUFTLGtCQUFrQixDQUFDLEdBQUcsRUFBRTtDQUNqQyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7Q0FDbkQsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUU7Q0FDL0IsRUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2xDLENBQUM7O0NBRUQ7Q0FDQSxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO0NBQ3hDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxVQUFVLEVBQUUsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0NBQ3pFLEVBQUUsT0FBTyxLQUFLLENBQUM7Q0FDZixDQUFDOzs7Q0FHRDtDQUNBO0NBQ0E7Q0FDQSxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7Q0FDN0IsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ25CLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0NBQ2xCLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0NBQ2xCO0NBQ0E7Q0FDQTtDQUNBLEVBQUUsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0NBQ3hCLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDdEMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksYUFBYSxJQUFJLENBQUMsRUFBRTtDQUM3QyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztDQUNoRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEIsS0FBSyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLGFBQWEsQ0FBQztDQUM5QyxTQUFTLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxFQUFFLGFBQWEsQ0FBQztDQUM1QyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdCLEdBQUc7Q0FDSCxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzs7Q0FFM0Q7O0NBRUE7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN6QyxJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QixJQUFJLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Q0FDN0QsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUMxQyxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDckIsS0FBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLE1BQU0sR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7Q0FFdkM7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdEIsSUFBSSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzNCLElBQUksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7Q0FDdEQsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0NBQ25DLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUNyQixLQUFLO0NBQ0wsR0FBRztDQUNILEVBQUUsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3ZDLEVBQUUsT0FBTyxNQUFNLENBQUM7Q0FDaEIsQ0FBQzs7Q0FFRDtDQUNBO0NBQ0E7Q0FDQSxTQUFTLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtDQUNuQyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3pCLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtDQUNsQyxNQUFNLE9BQU8sbUJBQW1CLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BHLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsTUFBTSxDQUFDLGNBQWMsRUFBRTtDQUNoQyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDck8sRUFBRSxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtDQUN0QixJQUFJLElBQUksSUFBSSxDQUFDLElBQUksY0FBYyxFQUFFO0NBQ2pDLE1BQU0sSUFBSSxJQUFJLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25DLE1BQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0NBQ2hELEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxPQUFPLE9BQU8sQ0FBQztDQUNqQixDQUFDOztDQUVEO0NBQ0EsU0FBUyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUU7Q0FDeEMsRUFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQzdGLEVBQUUsSUFBSSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7Q0FDN0IsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLE1BQU0sRUFBRTtDQUN2QixJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QixJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtDQUMxQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZCLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6QyxNQUFNLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNuRCxLQUFLLE1BQU07Q0FDWCxNQUFNLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNsQyxLQUFLO0NBQ0wsR0FBRztDQUNILEVBQUUsT0FBTyxpQkFBaUIsQ0FBQztDQUMzQixDQUFDOztDQUVEO0NBQ0EsU0FBUyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUU7Q0FDL0MsRUFBRSxJQUFJLElBQUksR0FBRztDQUNiLElBQUksS0FBSyxFQUFFLE1BQU07Q0FDakIsSUFBSSxLQUFLLEVBQUUsSUFBSTtDQUNmLElBQUksS0FBSyxFQUFFLElBQUk7Q0FDZixJQUFJLEtBQUssRUFBRSxPQUFPO0NBQ2xCLElBQUksS0FBSyxFQUFFLEdBQUc7Q0FDZCxJQUFJLEtBQUssRUFBRSxHQUFHO0NBQ2QsSUFBSSxLQUFLLEVBQUUsS0FBSztDQUNoQixJQUFJLE1BQU0sRUFBRSxJQUFJO0NBQ2hCLElBQUc7Q0FDSCxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsT0FBTyxLQUFLLEdBQUcsWUFBWSxDQUFDO0NBQ3ZELEVBQUUsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Q0FDNUIsQ0FBQzs7Q0FFRDtDQUNBO0FBQ0EsQ0FBZSxTQUFTLGVBQWUsQ0FBQyxTQUFTLEVBQUU7Q0FDbkQsRUFBRSxTQUFTLEdBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUM7Q0FDL0MsRUFBRSxJQUFJLEVBQUUsR0FBRztDQUNYLElBQUksU0FBUyxFQUFFLFNBQVM7Q0FDeEIsSUFBSSxpQkFBaUIsRUFBRSxFQUFFO0NBQ3pCLElBQUksWUFBWSxFQUFFLEVBQUU7Q0FDcEIsR0FBRyxDQUFDOztDQUVKLEVBQUUsSUFBSTtDQUNOLElBQUksSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzNDLElBQUksSUFBSSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbkQsSUFBSSxJQUFJLGlCQUFpQixHQUFHLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzNELElBQUksRUFBRSxDQUFDLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO0NBQzdDLElBQUksRUFBRSxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUM7Q0FDckMsSUFBSSxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdEMsQ0FHQSxJQUFJLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRTtDQUNoQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO0NBQzlCLE1BQU0sRUFBRSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Q0FDekIsS0FBSyxNQUFNLElBQUksYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQ2hGLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztDQUN6QixLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0NBQ3ZDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztDQUN0QixLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0NBQ3pDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztDQUN4QixLQUFLLE1BQU0sSUFBSSxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDNUUsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RCLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFFO0NBQzdGLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztDQUN0QjtDQUNBO0NBQ0EsS0FBSyxNQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsRUFBRTtDQUM5QyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLE1BQU0sRUFBRSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Q0FDekIsS0FBSyxNQUFNO0NBQ1gsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixLQUFLOztDQUVMO0NBQ0EsSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Q0FDcEMsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7Q0FDakQsSUFBSSxJQUFJLENBQUMsRUFBRTtDQUNYLE1BQU0sRUFBRSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Q0FDMUIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyQixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0NBQ3ZCLE1BQU0sRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM3QyxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3RDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Q0FDYixRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFDO0NBQ2hDLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7Q0FDMUIsUUFBUSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1QixPQUFPO0NBQ1AsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtDQUNaLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztDQUN6QyxNQUFNLElBQUksQ0FBQyxFQUFFO0NBQ2IsUUFBUSxFQUFFLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUMzQixRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDO0NBQzFCLFFBQVEsRUFBRSxDQUFDLFNBQVMsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyRCxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RDLE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7Q0FDdEwsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0NBQ2hELFFBQVEsSUFBSSxDQUFDLEVBQUU7Q0FDZixVQUFVLEVBQUUsQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7Q0FDeEIsVUFBVSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ2pELFVBQVUsRUFBRSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQzdELFNBQVM7Q0FDVCxPQUFPO0NBQ1AsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRTtDQUNaLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUN2RCxNQUFNLElBQUksQ0FBQyxFQUFFO0NBQ2IsUUFBUSxFQUFFLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUMzQixRQUFRLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqQyxRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RDLE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUNqQixLQUFLO0FBQ0wsQUFPQTtDQUNBO0NBQ0EsSUFBSSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztDQUMvSixJQUFJLElBQUksSUFBSSxDQUFDLElBQUksUUFBUSxFQUFFO0NBQzNCLE1BQU0sSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdCLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtDQUNoQyxRQUFRLEVBQUUsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFDLFFBQVEsRUFBRSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0MsUUFBUSxJQUFJLEVBQUUsQ0FBQyxjQUFjLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO0NBQ3BFLFFBQVEsSUFBSSxFQUFFLENBQUMsY0FBYyxJQUFJLFNBQVMsRUFBRSxFQUFFLENBQUMsY0FBYyxHQUFHLG1CQUFtQixDQUFDO0NBQ3BGLFFBQVEsRUFBRSxDQUFDLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqRCxRQUFRLE1BQU07Q0FDZCxPQUFPO0NBQ1AsS0FBSztDQUNMO0NBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRTtDQUM1QixNQUFNLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztDQUN0RCxNQUFNLElBQUksT0FBTyxFQUFFO0NBQ25CLFFBQVEsRUFBRSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7Q0FDdkMsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLG1CQUFtQixDQUFDO0NBQ2hELFFBQVEsRUFBRSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdkMsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsRUFBRTtDQUMxRCxRQUFRLEVBQUUsQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO0NBQ3ZDLFFBQVEsRUFBRSxDQUFDLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztDQUNoRCxRQUFRLEVBQUUsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMvRCxPQUFPO0NBQ1AsS0FBSzs7Q0FFTDtDQUNBLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDbkQsTUFBTSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsTUFBTSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Q0FDckMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRTtDQUNsRSxRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDeEIsUUFBUSxNQUFNO0NBQ2QsT0FBTztDQUNQLEtBQUs7O0NBRUw7Q0FDQSxJQUFJLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0NBQ25GLFNBQVMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztDQUNuSCxTQUFTLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0NBQzFGLFNBQVMsRUFBRSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Q0FDbkMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0NBQ2IsSUFBSSxFQUFFLENBQUMsYUFBYSxHQUFHLHFDQUFxQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztDQUM1RSxHQUFHOztDQUVILEVBQUUsT0FBTyxFQUFFLENBQUM7Q0FDWixDQUFDOztDQzdSYyxTQUFTLGlCQUFpQixHQUFHO0NBQzVDLEVBQUUsT0FBTyxJQUFJLE9BQU8sRUFBRSxPQUFPLElBQUk7Q0FDakMsSUFBSSxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7Q0FDNUIsSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDL0IsSUFBSSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDcEIsSUFBSSxTQUFTLElBQUksR0FBRztDQUNwQixNQUFNLElBQUksRUFBRSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUNqQyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3pCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztDQUNkLE1BQU0sSUFBSSxFQUFFLGNBQWMsR0FBRyxDQUFDLEVBQUU7Q0FDaEMsUUFBUSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNwQyxPQUFPLE1BQU07Q0FDYixRQUFRLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0QixRQUFRLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3RGLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM5QyxRQUFRLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQzlDLE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNoQyxHQUFHLENBQUMsQ0FBQztDQUNMLENBQUM7O0NDbEJELFNBQVMsVUFBVSxHQUFHO0NBQ3RCLEVBQUUsSUFBSSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEMsQ0FDQSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2xDLEVBQUUsSUFBSSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO0NBQ3ZCLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQztDQUMzQixFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFLG9CQUFvQixHQUFHLFlBQVksQ0FBQztDQUN0RixPQUFPLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFLG9CQUFvQixHQUFHLGVBQWUsQ0FBQztDQUM5RixPQUFPLG9CQUFvQixHQUFHLHNDQUFzQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQzNJLEVBQUUsT0FBTyxvQkFBb0IsQ0FBQztDQUM5QixDQUFDO0FBQ0QsQUFNQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBLENBQWUsU0FBUyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUU7Q0FDNUQsRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Q0FDaEIsRUFBRSxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0NBQ3ZDLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNsQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDL0IsR0FBRzs7Q0FFSCxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQy9ELEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbkUsRUFBRSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxXQUFXLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ3JGLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRSxPQUFPLFlBQVksS0FBSyxXQUFXLElBQUksT0FBTyxrQkFBa0IsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM5RyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0NBQ3hMLEVBQUUsYUFBYSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Q0FDdEwsRUFBRSxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztDQUNqQyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHO0NBQzdELEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0NBQzVDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ2pMLEVBQUUsYUFBYSxDQUFDLG1CQUFtQixFQUFFLE9BQU8saUJBQWlCLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDL0UsRUFBRSxhQUFhLENBQUMscUJBQXFCLEVBQUUsT0FBTyxTQUFTLENBQUMsbUJBQW1CLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDN0YsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ3ZELEVBQUUsYUFBYSxDQUFDLFlBQVksRUFBRSxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM3RCxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbkUsRUFBRSxhQUFhLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDcEYsRUFBRSxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7Q0FDM0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtDQUN2RSxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDM0MsRUFBRSxhQUFhLENBQUMsZUFBZSxFQUFFLE9BQU8sUUFBUSxDQUFDLGVBQWUsS0FBSyxXQUFXLElBQUksT0FBTyxRQUFRLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzVILEVBQUUsYUFBYSxDQUFDLHVCQUF1QixFQUFFLE9BQU8scUJBQXFCLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDdkYsRUFBRSxhQUFhLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMxRixFQUFFLGFBQWEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDaEUsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8saUJBQWlCLEtBQUssV0FBVyxJQUFJLE9BQU8sb0JBQW9CLEtBQUssV0FBVyxJQUFJLE9BQU8sdUJBQXVCLEtBQUssV0FBVyxJQUFJLE9BQU8sbUJBQW1CLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbk4sRUFBRSxhQUFhLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUNuRCxFQUFFLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0NBQ3hMLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUN6RCxFQUFFLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDMUQsRUFBRSxhQUFhLENBQUMsYUFBYSxFQUFFLE9BQU8sV0FBVyxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ25FLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLFNBQVMsQ0FBQyxhQUFhLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDekUsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM5RCxFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLGVBQWUsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUMzRSxFQUFFLGFBQWEsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0NBRWpLO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixDQUNBO0NBQ0EsRUFBRSxTQUFTLGdCQUFnQixDQUFDLFdBQVcsRUFBRSw0QkFBNEIsRUFBRTtDQUN2RSxJQUFJLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEQsSUFBSSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Q0FDekIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDaEgsSUFBSSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSw0QkFBNEIsR0FBRyxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQzdILElBQUksSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDakMsQ0FDQSxNQUFNLElBQUksT0FBTyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7Q0FDMUYsTUFBTSxJQUFJLFdBQVcsSUFBSSxvQkFBb0IsRUFBRSxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDcEYsTUFBTSxPQUFPLE9BQU8sQ0FBQztDQUNyQixLQUFLO0NBQ0wsU0FBUyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLENBQUM7Q0FDL0QsR0FBRzs7Q0FFSCxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDNUQsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMzRCxJQUFJLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtDQUNsQyxNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQzlFLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGNBQWMsQ0FBQztDQUM5QyxLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDM0QsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDekUsSUFBSSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsS0FBSyxpQkFBaUIsQ0FBQyxXQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7Q0FDL0csTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7Q0FDakQsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMxRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO0NBQ25DLE1BQU0sSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM1RSxNQUFNLElBQUksaUJBQWlCLENBQUMsU0FBUyxLQUFLLGlCQUFpQixDQUFDLFdBQVcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtDQUN6RyxRQUFRLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztDQUMzQyxPQUFPO0NBQ1AsS0FBSzs7Q0FFTCxJQUFJLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtDQUNsQyxNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQzlFLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGNBQWMsQ0FBQztDQUM5QyxLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzVELEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDNUQ7Q0FDQTtDQUNBOztDQUVBLEVBQUUsSUFBSSxPQUFPLEdBQUc7Q0FDaEIsSUFBSSxTQUFTLEVBQUVBLGVBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0NBQ2pELElBQUksU0FBUyxFQUFFO0NBQ2YsTUFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87Q0FDaEMsTUFBTSxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVU7Q0FDdEMsTUFBTSxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUs7Q0FDNUIsTUFBTSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7Q0FDbEMsS0FBSztDQUNMO0NBQ0EsSUFBSSxPQUFPLEVBQUU7Q0FDYixNQUFNLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDckQsTUFBTSxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUs7Q0FDL0IsTUFBTSxZQUFZLEVBQUUsTUFBTSxDQUFDLE1BQU07Q0FDakMsTUFBTSxtQkFBbUIsRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDakUsTUFBTSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDbkUsS0FBSztDQUNMLElBQUksbUJBQW1CLEVBQUUsU0FBUyxDQUFDLG1CQUFtQjtDQUN0RCxJQUFJLFVBQVUsRUFBRSxJQUFJO0NBQ3BCLElBQUksb0JBQW9CLEVBQUUsVUFBVSxFQUFFO0NBQ3RDLEdBQUcsQ0FBQzs7Q0FFSjtDQUNBLEVBQUUsSUFBSSxjQUFjLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDOUosRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLGNBQWMsRUFBRTtDQUMvQixJQUFJLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM5QixJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtDQUM5RCxHQUFHO0NBQ0g7Q0FDQTs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7O0NBRUE7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJO0NBQzFDLElBQUksT0FBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ2xELElBQUksSUFBSSxlQUFlLEVBQUUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ2xELEdBQUcsQ0FBQyxDQUFDOztDQUVMO0NBQ0E7O0NBRUE7Q0FDQSxFQUFFLE9BQU8sT0FBTyxDQUFDO0NBQ2pCLENBQUM7O0NDeExELFNBQVMscUJBQXFCLENBQUMsWUFBWSxFQUFFO0dBQzNDLElBQUksTUFBTSxHQUFHO0tBQ1gsWUFBWSxFQUFFLFlBQVk7SUFDM0IsQ0FBQzs7Q0FFSixJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0I7TUFDcEQsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFOztLQUV2RCxNQUFNLENBQUMsV0FBVyxHQUFHLHFCQUFxQixDQUFDO0tBQzNDLE9BQU8sTUFBTSxDQUFDO0VBQ2pCOztDQUVELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDOUMsSUFBSSxFQUFFLEVBQUUsV0FBVyxDQUFDO0NBQ3BCLElBQUksYUFBYSxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLENBQUM7Q0FDL0csS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUU7R0FDdkMsSUFBSSxJQUFJLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzVCLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0dBQ2hELElBQUksRUFBRSxDQUFDO09BQ0gsV0FBVyxHQUFHLElBQUksQ0FBQztPQUNuQixNQUFNO0lBQ1Q7RUFDRjtDQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUNoQixJQUFJLENBQUMsRUFBRSxFQUFFO0tBQ0wsTUFBTSxDQUFDLFdBQVcsR0FBRywwQ0FBMEMsQ0FBQztLQUNoRSxPQUFPLE1BQU0sQ0FBQztFQUNqQjs7Q0FFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0tBQ3pCLFdBQVcsRUFBRSxXQUFXO0tBQ3hCLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7S0FDdEMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztLQUNsQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO0tBQ3RDLGNBQWMsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTTtLQUMxQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUTtLQUM5QyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQztLQUNuQixTQUFTLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsU0FBUyxHQUFHLFdBQVcsR0FBRyxlQUFlO0tBQy9FLHNCQUFzQixFQUFFLHlCQUF5QixDQUFDLFdBQVcsQ0FBQztLQUM5RCxJQUFJLEVBQUU7T0FDSixPQUFPLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDO09BQ3JDLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDekMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQztPQUN2QyxTQUFTLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDO09BQ3pDLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDekMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztNQUM5QztLQUNELE9BQU8sRUFBRTtPQUNQLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUM7T0FDdkMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUM7T0FDOUQsNEJBQTRCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZ0NBQWdDLENBQUM7T0FDbEYscUJBQXFCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUM7T0FDcEUseUJBQXlCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsNEJBQTRCLENBQUM7T0FDM0Usb0JBQW9CLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUM7T0FDakUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDO09BQ3BELGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO09BQzFELG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO09BQzNELDBCQUEwQixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO09BQzlFLHVCQUF1QixFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLDBCQUEwQixDQUFDO09BQ3ZFLHFCQUFxQixFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO09BQzNFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7TUFDcEM7S0FDRCxxQkFBcUIsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRixxQkFBcUIsRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQztLQUNsRixPQUFPLEVBQUU7T0FDUCx5QkFBeUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQztPQUN0RSwyQkFBMkIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztPQUMxRSwrQkFBK0IsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7T0FDekQsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUM7TUFDckU7S0FDRCxVQUFVLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixFQUFFO0lBQ3hDLENBQUMsQ0FBQztFQUNKOztDQUVELFNBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtHQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzdCOztDQUVELFNBQVMsZUFBZSxDQUFDLEVBQUUsRUFBRTtHQUMzQixJQUFJLFlBQVksR0FBRztPQUNmLFFBQVEsRUFBRSxFQUFFO09BQ1osTUFBTSxFQUFFLEVBQUU7SUFDYixDQUFDOztHQUVGLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsMkJBQTJCLENBQUMsQ0FBQztHQUNqRSxJQUFJLGFBQWEsSUFBSSxJQUFJLEVBQUU7T0FDdkIsWUFBWSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO09BQy9FLFlBQVksQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNoRjs7R0FFRCxPQUFPLFlBQVksQ0FBQztFQUNyQjs7Q0FFRCxTQUFTLGtCQUFrQixDQUFDLEVBQUUsRUFBRTtHQUM5QixJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7R0FDeEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0dBQ2hELElBQUksR0FBRyxJQUFJLElBQUk7T0FDWCxlQUFlLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQzs7R0FFbEUsT0FBTyxlQUFlLENBQUM7RUFDeEI7O0NBRUQsU0FBUyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUU7O0dBRTlDLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztHQUN6RSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLDRCQUE0QixHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7R0FDakYsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDOztHQUVoQixJQUFJLENBQUMsRUFBRSxFQUFFOztPQUVMLE9BQU8sS0FBSyxDQUFDO0lBQ2hCOztHQUVELElBQUksT0FBTyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyw0QkFBNEIsS0FBSyxXQUFXLEVBQUU7OztPQUcvRSxPQUFPLGlCQUFpQixDQUFDO0lBQzVCO0dBQ0QsT0FBTyxJQUFJLENBQUM7RUFDYjs7Q0FFRCxTQUFTLFlBQVksQ0FBQyxDQUFDLEVBQUU7R0FDdkIsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzNDOztDQUVELFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRTtHQUNwQixJQUFJLGNBQWMsR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOzs7R0FHakYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssT0FBTyxNQUFNLFNBQVMsQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDO1FBQzVFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLG1CQUFtQixDQUFDO1FBQ3JELGNBQWMsS0FBSyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztHQUU5QyxJQUFJLEtBQUssRUFBRTs7Ozs7O09BTVAsSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEVBQUU7V0FDaEksT0FBTyxZQUFZLENBQUM7UUFDdkIsTUFBTTtXQUNILE9BQU8sV0FBVyxDQUFDO1FBQ3RCO0lBQ0o7O0dBRUQsT0FBTyxJQUFJLENBQUM7RUFDYjs7Q0FFRCxTQUFTLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtHQUM1QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDO2NBQzlDLEVBQUUsQ0FBQyxZQUFZLENBQUMsdUNBQXVDLENBQUM7Y0FDeEQsRUFBRSxDQUFDLFlBQVksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDOztHQUVqRSxJQUFJLENBQUMsRUFBRTtPQUNILElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O09BRTVELElBQUksR0FBRyxLQUFLLENBQUMsRUFBRTtXQUNYLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWDtPQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2Q7R0FDRCxPQUFPLEtBQUssQ0FBQztFQUNkOztDQUVELFNBQVMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUU7R0FDdEMsSUFBSSxPQUFPLEVBQUU7T0FDVCxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNyQyxNQUFNO09BQ0gsT0FBTyxJQUFJLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUMvQjtFQUNGOztDQUVELFNBQVMsdUJBQXVCLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRTtHQUNuRCxJQUFJLFdBQVcsR0FBRyxPQUFPLEdBQUcsZUFBZSxHQUFHLEVBQUUsQ0FBQztHQUNqRCxPQUFPLElBQUksR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLEdBQUc7RUFDM0o7O0NBRUQsU0FBUyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFO0dBQzdDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ2xFLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ3RFLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztHQUVoRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7R0FDaEIsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLENBQUMsRUFBRTtPQUN0QixJQUFJLEdBQUcsTUFBTSxDQUFDO0lBQ2pCOztHQUVELE9BQU87T0FDSCxJQUFJLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztPQUMxQyxNQUFNLEdBQUcsdUJBQXVCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztPQUM5QyxHQUFHLEVBQUUsdUJBQXVCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztPQUN2QyxJQUFJLEVBQUUsdUJBQXVCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztJQUM3QztFQUNGOztDQUVELFNBQVMsb0JBQW9CLENBQUMsRUFBRSxFQUFFO0dBQ2hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUMxRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUM7O0dBRXZELElBQUksR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDcEUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQzs7R0FFOUMsT0FBTyxDQUFDLENBQUM7RUFDVjs7Q0FFRCxhQUFjLEdBQUcsV0FBVztHQUMxQixPQUFPO0tBQ0wsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztLQUNoQyxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0lBQ2pDO0VBQ0Y7Ozs7Ozs7OztBQ25ORCxDQVdhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRTtDQUNwZixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVU7Q0FDMWYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM3ZixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0NBQzlnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztFQUNwaEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxrRUFBa0UsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDdGYsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFRLENBQUMsR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztFQUNsaEIsT0FBTyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzZixDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtFQUFrRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDL2pCLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0ZixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0NBQ3RmLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDeGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0VBQ3JmLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JmLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUM1ZixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0NBQ3BmLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Q0FDL2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RmLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNwZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTO0NBQ3JmLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVO0NBQ3ZmLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUMvZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUM7Q0FDcGYsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMvZixVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVU7Q0FDcGYsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQztDQUNyZixJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVB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
