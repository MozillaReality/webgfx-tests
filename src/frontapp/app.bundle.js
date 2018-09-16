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

	const parameters = queryString.parse(location.search);


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
	//import vsyncEstimate from './vsyncestimate';
	//var displayRefreshRate = -1;
	//vsyncEstimate().then(hz => displayRefreshRate = Math.random(hz));

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
	    {
	      var multiples = [];
	      for(var i = 0; i < this.testsQueuedToRun.length; i++) {
	        for(var j = 0; j < numTimesToRunEachTest; j++) {
	          multiples.push(this.testsQueuedToRun[i]);
	        }
	      }
	      this.testsQueuedToRun = multiples;
	    }
	    this.runningTestsInProgress = true;
	    this.runNextQueuedTest();
	  }
	  
	  runNextQueuedTest() {  
	    if (this.testsQueuedToRun.length == 0) return false;
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

	  runTest(id, interactive) {
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
	    
	/*
	    if (test.length) url = addGET(url, 'numframes=' + test.length);
	    */
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
	      fakeWebGL: false
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
	      runTest: function(test, interactive) {
	        testApp.runTest(test.id, interactive);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmJ1bmRsZS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vbm9kZV9tb2R1bGVzL3VzZXJhZ2VudC1pbmZvL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2Jyb3dzZXItZmVhdHVyZXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvd2ViZ2wtaW5mby9pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9qc3NoYS9zcmMvc2hhLmpzIiwiVVVJRC5qcyIsInJlc3VsdHMtc2VydmVyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3N0cmljdC11cmktZW5jb2RlL2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlY29kZS11cmktY29tcG9uZW50L2luZGV4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3F1ZXJ5LXN0cmluZy9pbmRleC5qcyIsImFwcC5qcyIsImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFRyaW1zIHdoaXRlc3BhY2UgaW4gZWFjaCBzdHJpbmcgZnJvbSBhbiBhcnJheSBvZiBzdHJpbmdzXG5mdW5jdGlvbiB0cmltU3BhY2VzSW5FYWNoRWxlbWVudChhcnIpIHtcbiAgcmV0dXJuIGFyci5tYXAoZnVuY3Rpb24oeCkgeyByZXR1cm4geC50cmltKCk7IH0pO1xufVxuXG4vLyBSZXR1cm5zIGEgY29weSBvZiB0aGUgZ2l2ZW4gYXJyYXkgd2l0aCBlbXB0eS91bmRlZmluZWQgc3RyaW5nIGVsZW1lbnRzIHJlbW92ZWQgaW4gYmV0d2VlblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlFbGVtZW50cyhhcnIpIHtcbiAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24oeCkgeyByZXR1cm4geCAmJiB4Lmxlbmd0aCA+IDA7IH0pO1xufVxuXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBpcyBlbmNsb3NlZCBpbiBwYXJlbnRoZXNlcywgZS5nLiBpcyBvZiBmb3JtIFwiKHNvbWV0aGluZylcIlxuZnVuY3Rpb24gaXNFbmNsb3NlZEluUGFyZW5zKHN0cikge1xuICByZXR1cm4gc3RyWzBdID09ICcoJyAmJiBzdHJbc3RyLmxlbmd0aC0xXSA9PSAnKSc7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3Vic3RyaW5nIGlzIGNvbnRhaW5lZCBpbiB0aGUgc3RyaW5nIChjYXNlIHNlbnNpdGl2ZSlcbmZ1bmN0aW9uIGNvbnRhaW5zKHN0ciwgc3Vic3RyKSB7XG4gIHJldHVybiBzdHIuaW5kZXhPZihzdWJzdHIpID49IDA7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgYW55IG9mIHRoZSBnaXZlbiBzdWJzdHJpbmdzIGluIHRoZSBsaXN0IGlzIGNvbnRhaW5lZCBpbiB0aGUgZmlyc3QgcGFyYW1ldGVyIHN0cmluZyAoY2FzZSBzZW5zaXRpdmUpXG5mdW5jdGlvbiBjb250YWluc0FueU9mKHN0ciwgc3Vic3RyTGlzdCkge1xuICBmb3IodmFyIGkgaW4gc3Vic3RyTGlzdCkgaWYgKGNvbnRhaW5zKHN0ciwgc3Vic3RyTGlzdFtpXSkpIHJldHVybiB0cnVlO1xuICByZXR1cm4gZmFsc2U7XG59XG5cblxuLy8gU3BsaXRzIGFuIHVzZXIgYWdlbnQgc3RyaW5nIGxvZ2ljYWxseSBpbnRvIGFuIGFycmF5IG9mIHRva2VucywgZS5nLlxuLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4vLyAtPiBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pJywgJ0FwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pJywgJ0Nocm9tZS81MS4wLjI3MDQuODEnLCAnTW9iaWxlIFNhZmFyaS81MzcuMzYnXVxuZnVuY3Rpb24gc3BsaXRVc2VyQWdlbnQoc3RyKSB7XG4gIHN0ciA9IHN0ci50cmltKCk7XG4gIHZhciB1YUxpc3QgPSBbXTtcbiAgdmFyIHRva2VucyA9ICcnO1xuICAvLyBTcGxpdCBieSBzcGFjZXMsIHdoaWxlIGtlZXBpbmcgdG9wIGxldmVsIHBhcmVudGhlc2VzIGludGFjdCwgc29cbiAgLy8gXCJNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjEpIE1vYmlsZSBTYWZhcmkvNTM3LjM2XCIgYmVjb21lc1xuICAvLyBbJ01vemlsbGEvNS4wJywgJyhMaW51eDsgQW5kcm9pZCA2LjAuMSknLCAnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXVxuICB2YXIgcGFyZW5zTmVzdGluZyA9IDA7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoc3RyW2ldID09ICcgJyAmJiBwYXJlbnNOZXN0aW5nID09IDApIHtcbiAgICAgIGlmICh0b2tlbnMudHJpbSgpLmxlbmd0aCAhPSAwKSB1YUxpc3QucHVzaCh0b2tlbnMudHJpbSgpKTtcbiAgICAgIHRva2VucyA9ICcnO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09ICcoJykgKytwYXJlbnNOZXN0aW5nO1xuICAgIGVsc2UgaWYgKHN0cltpXSA9PSAnKScpIC0tcGFyZW5zTmVzdGluZztcbiAgICB0b2tlbnMgPSB0b2tlbnMgKyBzdHJbaV07XG4gIH1cbiAgaWYgKHRva2Vucy50cmltKCkubGVuZ3RoID4gMCkgdWFMaXN0LnB1c2godG9rZW5zLnRyaW0oKSk7XG5cbiAgLy8gV2hhdCBmb2xsb3dzIGlzIGEgbnVtYmVyIG9mIGhldXJpc3RpYyBhZGFwdGF0aW9ucyB0byBhY2NvdW50IGZvciBVQSBzdHJpbmdzIG1ldCBpbiB0aGUgd2lsZDpcblxuICAvLyBGdXNlIFsnYS92ZXInLCAnKHNvbWVpbmZvKSddIHRvZ2V0aGVyLiBGb3IgZXhhbXBsZTpcbiAgLy8gJ01vemlsbGEvNS4wIChMaW51eDsgQW5kcm9pZCA2LjAuMTsgTmV4dXMgNSBCdWlsZC9NT0IzME0pIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS81MS4wLjI3MDQuODEgTW9iaWxlIFNhZmFyaS81MzcuMzYnXG4gIC8vIC0+IGZ1c2UgJ0FwcGxlV2ViS2l0LzUzNy4zNicgYW5kICcoS0hUTUwsIGxpa2UgR2Vja28pJyB0b2dldGhlclxuICBmb3IodmFyIGkgPSAxOyBpIDwgdWFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGwgPSB1YUxpc3RbaV07XG4gICAgaWYgKGlzRW5jbG9zZWRJblBhcmVucyhsKSAmJiAhY29udGFpbnMobCwgJzsnKSAmJiBpID4gMSkge1xuICAgICAgdWFMaXN0W2ktMV0gPSB1YUxpc3RbaS0xXSArICcgJyArIGw7XG4gICAgICB1YUxpc3RbaV0gPSAnJztcbiAgICB9XG4gIH1cbiAgdWFMaXN0ID0gcmVtb3ZlRW1wdHlFbGVtZW50cyh1YUxpc3QpO1xuXG4gIC8vIEZ1c2UgWydmb28nLCAnYmFyL3ZlciddIHRvZ2V0aGVyLCBpZiAnZm9vJyBoYXMgb25seSBhc2NpaSBjaGFycy4gRm9yIGV4YW1wbGU6XG4gIC8vICdNb3ppbGxhLzUuMCAoTGludXg7IEFuZHJvaWQgNi4wLjE7IE5leHVzIDUgQnVpbGQvTU9CMzBNKSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvNTEuMC4yNzA0LjgxIE1vYmlsZSBTYWZhcmkvNTM3LjM2J1xuICAvLyAtPiBmdXNlIFsnTW9iaWxlJywgJ1NhZmFyaS81MzcuMzYnXSB0b2dldGhlclxuICBmb3IodmFyIGkgPSAwOyBpIDwgdWFMaXN0Lmxlbmd0aC0xOyArK2kpIHtcbiAgICB2YXIgbCA9IHVhTGlzdFtpXTtcbiAgICB2YXIgbmV4dCA9IHVhTGlzdFtpKzFdO1xuICAgIGlmICgvXlthLXpBLVpdKyQvLnRlc3QobCkgJiYgY29udGFpbnMobmV4dCwgJy8nKSkge1xuICAgICAgdWFMaXN0W2krMV0gPSBsICsgJyAnICsgbmV4dDtcbiAgICAgIHVhTGlzdFtpXSA9ICcnO1xuICAgIH1cbiAgfVxuICB1YUxpc3QgPSByZW1vdmVFbXB0eUVsZW1lbnRzKHVhTGlzdCk7XG4gIHJldHVybiB1YUxpc3Q7XG59XG5cbi8vIEZpbmRzIHRoZSBzcGVjaWFsIHRva2VuIGluIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcGxhdGZvcm0gaW5mby5cbi8vIFRoaXMgaXMgdGhlIGZpcnN0IGVsZW1lbnQgY29udGFpbmVkIGluIHBhcmVudGhlc2VzIHRoYXQgaGFzIHNlbWljb2xvbiBkZWxpbWl0ZWQgZWxlbWVudHMuXG4vLyBSZXR1cm5zIHRoZSBwbGF0Zm9ybSBpbmZvIGFzIGFuIGFycmF5IHNwbGl0IGJ5IHRoZSBzZW1pY29sb25zLlxuZnVuY3Rpb24gc3BsaXRQbGF0Zm9ybUluZm8odWFMaXN0KSB7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCB1YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgaXRlbSA9IHVhTGlzdFtpXTtcbiAgICBpZiAoaXNFbmNsb3NlZEluUGFyZW5zKGl0ZW0pKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlRW1wdHlFbGVtZW50cyh0cmltU3BhY2VzSW5FYWNoRWxlbWVudChpdGVtLnN1YnN0cigxLCBpdGVtLmxlbmd0aC0yKS5zcGxpdCgnOycpKSk7XG4gICAgfVxuICB9XG59XG5cbi8vIERlZHVjZXMgdGhlIG9wZXJhdGluZyBzeXN0ZW0gZnJvbSB0aGUgdXNlciBhZ2VudCBwbGF0Zm9ybSBpbmZvIHRva2VuIGxpc3QuXG5mdW5jdGlvbiBmaW5kT1ModWFQbGF0Zm9ybUluZm8pIHtcbiAgdmFyIG9zZXMgPSBbJ0FuZHJvaWQnLCAnQlNEJywgJ0xpbnV4JywgJ1dpbmRvd3MnLCAnaVBob25lIE9TJywgJ01hYyBPUycsICdCU0QnLCAnQ3JPUycsICdEYXJ3aW4nLCAnRHJhZ29uZmx5JywgJ0ZlZG9yYScsICdHZW50b28nLCAnVWJ1bnR1JywgJ2RlYmlhbicsICdIUC1VWCcsICdJUklYJywgJ1N1bk9TJywgJ01hY2ludG9zaCcsICdXaW4gOXgnLCAnV2luOTgnLCAnV2luOTUnLCAnV2luTlQnXTtcbiAgZm9yKHZhciBvcyBpbiBvc2VzKSB7XG4gICAgZm9yKHZhciBpIGluIHVhUGxhdGZvcm1JbmZvKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW0sIG9zZXNbb3NdKSkgcmV0dXJuIGl0ZW07XG4gICAgfVxuICB9XG4gIHJldHVybiAnT3RoZXInO1xufVxuXG4vLyBGaWx0ZXJzIHRoZSBwcm9kdWN0IGNvbXBvbmVudHMgKGl0ZW1zIG9mIGZvcm1hdCAnZm9vL3ZlcnNpb24nKSBmcm9tIHRoZSB1c2VyIGFnZW50IHRva2VuIGxpc3QuXG5mdW5jdGlvbiBwYXJzZVByb2R1Y3RDb21wb25lbnRzKHVhTGlzdCkge1xuICB1YUxpc3QgPSB1YUxpc3QuZmlsdGVyKGZ1bmN0aW9uKHgpIHsgcmV0dXJuIGNvbnRhaW5zKHgsICcvJykgJiYgIWlzRW5jbG9zZWRJblBhcmVucyh4KTsgfSk7XG4gIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHt9O1xuICBmb3IodmFyIGkgaW4gdWFMaXN0KSB7XG4gICAgdmFyIHggPSB1YUxpc3RbaV07XG4gICAgaWYgKGNvbnRhaW5zKHgsICcvJykpIHtcbiAgICAgIHggPSB4LnNwbGl0KCcvJyk7XG4gICAgICBpZiAoeC5sZW5ndGggIT0gMikgdGhyb3cgdWFMaXN0W2ldO1xuICAgICAgcHJvZHVjdENvbXBvbmVudHNbeFswXS50cmltKCldID0geFsxXS50cmltKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb2R1Y3RDb21wb25lbnRzW3hdID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHByb2R1Y3RDb21wb25lbnRzO1xufVxuXG4vLyBNYXBzIFdpbmRvd3MgTlQgdmVyc2lvbiB0byBodW1hbi1yZWFkYWJsZSBXaW5kb3dzIFByb2R1Y3QgdmVyc2lvblxuZnVuY3Rpb24gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUod2luTlRWZXJzaW9uKSB7XG4gIHZhciB2ZXJzID0ge1xuICAgICc1LjAnOiAnMjAwMCcsXG4gICAgJzUuMSc6ICdYUCcsXG4gICAgJzUuMic6ICdYUCcsXG4gICAgJzYuMCc6ICdWaXN0YScsXG4gICAgJzYuMSc6ICc3JyxcbiAgICAnNi4yJzogJzgnLFxuICAgICc2LjMnOiAnOC4xJyxcbiAgICAnMTAuMCc6ICcxMCdcbiAgfVxuICBpZiAoIXZlcnNbd2luTlRWZXJzaW9uXSkgcmV0dXJuICdOVCAnICsgd2luTlRWZXJzaW9uO1xuICByZXR1cm4gdmVyc1t3aW5OVFZlcnNpb25dO1xufVxuXG4vLyBUaGUgZnVsbCBmdW5jdGlvbiB0byBkZWNvbXBvc2UgYSBnaXZlbiB1c2VyIGFnZW50IHRvIHRoZSBpbnRlcmVzdGluZyBsb2dpY2FsIGluZm8gYml0cy5cbi8vIFxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVkdWNlVXNlckFnZW50KHVzZXJBZ2VudCkge1xuICB1c2VyQWdlbnQgPSB1c2VyQWdlbnQgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgdmFyIHVhID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50LFxuICAgIHByb2R1Y3RDb21wb25lbnRzOiB7fSxcbiAgICBwbGF0Zm9ybUluZm86IFtdXG4gIH07XG5cbiAgdHJ5IHtcbiAgICB2YXIgdWFMaXN0ID0gc3BsaXRVc2VyQWdlbnQodXNlckFnZW50KTtcbiAgICB2YXIgdWFQbGF0Zm9ybUluZm8gPSBzcGxpdFBsYXRmb3JtSW5mbyh1YUxpc3QpO1xuICAgIHZhciBwcm9kdWN0Q29tcG9uZW50cyA9IHBhcnNlUHJvZHVjdENvbXBvbmVudHModWFMaXN0KTtcbiAgICB1YS5wcm9kdWN0Q29tcG9uZW50cyA9IHByb2R1Y3RDb21wb25lbnRzO1xuICAgIHVhLnBsYXRmb3JtSW5mbyA9IHVhUGxhdGZvcm1JbmZvO1xuICAgIHZhciB1YWwgPSB1c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIERlZHVjZSBhcmNoIGFuZCBiaXRuZXNzXG4gICAgdmFyIGIzMk9uNjQgPSBbJ3dvdzY0J107XG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3dvdzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAnMzItb24tNjQnO1xuICAgICAgdWEuYXJjaCA9ICd4ODZfNjQnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsneDg2XzY0JywgJ2FtZDY0JywgJ2lhNjQnLCAnd2luNjQnLCAneDY0J10pKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ3g4Nl82NCc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdwcGM2NCcpKSB7XG4gICAgICB1YS5iaXRuZXNzID0gNjQ7XG4gICAgICB1YS5hcmNoID0gJ1BQQyc7XG4gICAgfSBlbHNlIGlmIChjb250YWlucyh1YWwsICdzcGFyYzY0JykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAnU1BBUkMnO1xuICAgIH0gZWxzZSBpZiAoY29udGFpbnNBbnlPZih1YWwsIFsnaTM4NicsICdpNDg2JywgJ2k1ODYnLCAnaTY4NicsICd4ODYnXSkpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAneDg2JztcbiAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ2FybTcnKSB8fCBjb250YWlucyh1YWwsICdhbmRyb2lkJykgfHwgY29udGFpbnModWFsLCAnbW9iaWxlJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSAzMjtcbiAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAvLyBIZXVyaXN0aWM6IEFzc3VtZSBhbGwgT1MgWCBhcmUgNjQtYml0LCBhbHRob3VnaCB0aGlzIGlzIG5vdCBjZXJ0YWluLiBPbiBPUyBYLCA2NC1iaXQgYnJvd3NlcnNcbiAgICAvLyBkb24ndCBhZHZlcnRpc2UgYmVpbmcgNjQtYml0LlxuICAgIH0gZWxzZSBpZiAoY29udGFpbnModWFsLCAnaW50ZWwgbWFjIG9zJykpIHtcbiAgICAgIHVhLmJpdG5lc3MgPSA2NDtcbiAgICAgIHVhLmFyY2ggPSAneDg2XzY0JztcbiAgICB9IGVsc2Uge1xuICAgICAgdWEuYml0bmVzcyA9IDMyO1xuICAgIH1cblxuICAgIC8vIERlZHVjZSBvcGVyYXRpbmcgc3lzdGVtXG4gICAgdmFyIG9zID0gZmluZE9TKHVhUGxhdGZvcm1JbmZvKTtcbiAgICB2YXIgbSA9IG9zLm1hdGNoKCcoLiopXFxcXHMrTWFjIE9TIFhcXFxccysoLiopJyk7XG4gICAgaWYgKG0pIHtcbiAgICAgIHVhLnBsYXRmb3JtID0gJ01hYyc7XG4gICAgICB1YS5hcmNoID0gbVsxXTtcbiAgICAgIHVhLm9zID0gJ01hYyBPUyc7XG4gICAgICB1YS5vc1ZlcnNpb24gPSBtWzJdLnJlcGxhY2UoL18vZywgJy4nKTtcbiAgICB9XG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gb3MubWF0Y2goJ0FuZHJvaWRcXFxccysoLiopJyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdBbmRyb2lkJztcbiAgICAgICAgdWEub3MgPSAnQW5kcm9pZCc7XG4gICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgbSA9IG9zLm1hdGNoKCdXaW5kb3dzIE5UXFxcXHMrKC4qKScpO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgdWEucGxhdGZvcm0gPSAnUEMnO1xuICAgICAgICB1YS5vcyA9ICdXaW5kb3dzJztcbiAgICAgICAgdWEub3NWZXJzaW9uID0gd2luZG93c0Rpc3RyaWJ1dGlvbk5hbWUobVsxXSk7XG4gICAgICAgIGlmICghdWEuYXJjaCkgdWEuYXJjaCA9ICd4ODYnO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIW0pIHtcbiAgICAgIGlmIChjb250YWlucyh1YVBsYXRmb3JtSW5mb1swXSwgJ2lQaG9uZScpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBhZCcpIHx8IGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvWzBdLCAnaVBvZCcpIHx8IGNvbnRhaW5zKG9zLCAnaVBob25lJykgfHwgb3MuaW5kZXhPZignQ1BVIE9TJykgPT0gMCkge1xuICAgICAgICBtID0gb3MubWF0Y2goJy4qT1MgKC4qKSBsaWtlIE1hYyBPUyBYJyk7XG4gICAgICAgIGlmIChtKSB7XG4gICAgICAgICAgdWEucGxhdGZvcm0gPSB1YVBsYXRmb3JtSW5mb1swXTtcbiAgICAgICAgICB1YS5vcyA9ICdpT1MnO1xuICAgICAgICAgIHVhLm9zVmVyc2lvbiA9IG1bMV0ucmVwbGFjZSgvXy9nLCAnLicpO1xuICAgICAgICAgIHVhLmJpdG5lc3MgPSBwYXJzZUludCh1YS5vc1ZlcnNpb24pID49IDcgPyA2NCA6IDMyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAgXG4gICAgaWYgKCFtKSB7XG4gICAgICBtID0gY29udGFpbnMob3MsICdCU0QnKSB8fCBjb250YWlucyhvcywgJ0xpbnV4Jyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9ICdQQyc7XG4gICAgICAgIHVhLm9zID0gb3Muc3BsaXQoJyAnKVswXTtcbiAgICAgICAgaWYgKCF1YS5hcmNoKSB1YS5hcmNoID0gJ3g4Nic7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbSkge1xuICAgICAgdWEub3MgPSBvcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaW5kUHJvZHVjdChwcm9kdWN0Q29tcG9uZW50cywgcHJvZHVjdCkge1xuICAgICAgZm9yKHZhciBpIGluIHByb2R1Y3RDb21wb25lbnRzKSB7XG4gICAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tpXSA9PSBwcm9kdWN0KSByZXR1cm4gaTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgaHVtYW4tcmVhZGFibGUgYnJvd3NlciB2ZW5kb3IsIHByb2R1Y3QgYW5kIHZlcnNpb24gbmFtZXNcbiAgICB2YXIgYnJvd3NlcnMgPSBbWydTYW1zdW5nQnJvd3NlcicsICdTYW1zdW5nJ10sIFsnRWRnZScsICdNaWNyb3NvZnQnXSwgWydPUFInLCAnT3BlcmEnXSwgWydDaHJvbWUnLCAnR29vZ2xlJ10sIFsnU2FmYXJpJywgJ0FwcGxlJ10sIFsnRmlyZWZveCcsICdNb3ppbGxhJ11dO1xuICAgIGZvcih2YXIgaSBpbiBicm93c2Vycykge1xuICAgICAgdmFyIGIgPSBicm93c2Vyc1tpXVswXTtcbiAgICAgIGlmIChwcm9kdWN0Q29tcG9uZW50c1tiXSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gYnJvd3NlcnNbaV1bMV07XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gYnJvd3NlcnNbaV1bMF07XG4gICAgICAgIGlmICh1YS5icm93c2VyUHJvZHVjdCA9PSAnT1BSJykgdWEuYnJvd3NlclByb2R1Y3QgPSAnT3BlcmEnO1xuICAgICAgICBpZiAodWEuYnJvd3NlclByb2R1Y3QgPT0gJ1RyaWRlbnQnKSB1YS5icm93c2VyUHJvZHVjdCA9ICdJbnRlcm5ldCBFeHBsb3Jlcic7XG4gICAgICAgIHVhLmJyb3dzZXJWZXJzaW9uID0gcHJvZHVjdENvbXBvbmVudHNbYl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBEZXRlY3QgSUVzXG4gICAgaWYgKCF1YS5icm93c2VyUHJvZHVjdCkge1xuICAgICAgdmFyIG1hdGNoSUUgPSB1c2VyQWdlbnQubWF0Y2goL01TSUVcXHMoW1xcZC5dKykvKTtcbiAgICAgIGlmIChtYXRjaElFKSB7XG4gICAgICAgIHVhLmJyb3dzZXJWZW5kb3IgPSAnTWljcm9zb2Z0JztcbiAgICAgICAgdWEuYnJvd3NlclByb2R1Y3QgPSAnSW50ZXJuZXQgRXhwbG9yZXInO1xuICAgICAgICB1YS5icm93c2VyVmVyc2lvbiA9IG1hdGNoSUVbMV07XG4gICAgICB9IGVsc2UgaWYgKGNvbnRhaW5zKHVhUGxhdGZvcm1JbmZvLCAnVHJpZGVudC83LjAnKSkge1xuICAgICAgICB1YS5icm93c2VyVmVuZG9yID0gJ01pY3Jvc29mdCc7XG4gICAgICAgIHVhLmJyb3dzZXJQcm9kdWN0ID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICAgICAgdWEuYnJvd3NlclZlcnNpb24gPSAgdXNlckFnZW50Lm1hdGNoKC9ydjooW1xcZC5dKykvKVsxXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWR1Y2UgbW9iaWxlIHBsYXRmb3JtLCBpZiBwcmVzZW50XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHVhUGxhdGZvcm1JbmZvLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgaXRlbSA9IHVhUGxhdGZvcm1JbmZvW2ldO1xuICAgICAgdmFyIGl0ZW1sID0gaXRlbS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGNvbnRhaW5zKGl0ZW1sLCAnbmV4dXMnKSB8fCBjb250YWlucyhpdGVtbCwgJ3NhbXN1bmcnKSkge1xuICAgICAgICB1YS5wbGF0Zm9ybSA9IGl0ZW07XG4gICAgICAgIHVhLmFyY2ggPSAnQVJNJztcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVkdWNlIGZvcm0gZmFjdG9yXG4gICAgaWYgKGNvbnRhaW5zKHVhbCwgJ3RhYmxldCcpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwYWQnKSkgdWEuZm9ybUZhY3RvciA9ICdUYWJsZXQnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ21vYmlsZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwaG9uZScpIHx8IGNvbnRhaW5zKHVhbCwgJ2lwb2QnKSkgdWEuZm9ybUZhY3RvciA9ICdNb2JpbGUnO1xuICAgIGVsc2UgaWYgKGNvbnRhaW5zKHVhbCwgJ3NtYXJ0IHR2JykgfHwgY29udGFpbnModWFsLCAnc21hcnQtdHYnKSkgdWEuZm9ybUZhY3RvciA9ICdUVic7XG4gICAgZWxzZSB1YS5mb3JtRmFjdG9yID0gJ0Rlc2t0b3AnO1xuICB9IGNhdGNoKGUpIHtcbiAgICB1YS5pbnRlcm5hbEVycm9yID0gJ0ZhaWxlZCB0byBwYXJzZSB1c2VyIGFnZW50IHN0cmluZzogJyArIGUudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHJldHVybiB1YTtcbn1cbiIsImltcG9ydCB1c2VyQWdlbnRJbmZvIGZyb20gJ3VzZXJhZ2VudC1pbmZvJztcblxuZnVuY3Rpb24gZW5kaWFubmVzcygpIHtcbiAgdmFyIGhlYXAgPSBuZXcgQXJyYXlCdWZmZXIoMHgxMDAwMCk7XG4gIHZhciBpMzIgPSBuZXcgSW50MzJBcnJheShoZWFwKTtcbiAgdmFyIHUzMiA9IG5ldyBVaW50MzJBcnJheShoZWFwKTtcbiAgdmFyIHUxNiA9IG5ldyBVaW50MTZBcnJheShoZWFwKTtcbiAgdTMyWzY0XSA9IDB4N0ZGRjAxMDA7XG4gIHZhciB0eXBlZEFycmF5RW5kaWFubmVzcztcbiAgaWYgKHUxNlsxMjhdID09PSAweDdGRkYgJiYgdTE2WzEyOV0gPT09IDB4MDEwMCkgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAnYmlnIGVuZGlhbic7XG4gIGVsc2UgaWYgKHUxNlsxMjhdID09PSAweDAxMDAgJiYgdTE2WzEyOV0gPT09IDB4N0ZGRikgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAnbGl0dGxlIGVuZGlhbic7XG4gIGVsc2UgdHlwZWRBcnJheUVuZGlhbm5lc3MgPSAndW5rbm93biEgKGEgYnJvd3NlciBidWc/KSAoc2hvcnQgMTogJyArIHUxNlsxMjhdLnRvU3RyaW5nKDE2KSArICcsIHNob3J0IDI6ICcgKyB1MTZbMTI5XS50b1N0cmluZygxNikgKyAnKSc7XG4gIHJldHVybiB0eXBlZEFycmF5RW5kaWFubmVzczsgIFxufVxuXG5mdW5jdGlvbiBwYWRMZW5ndGhMZWZ0KHMsIGxlbiwgY2gpIHtcbiAgaWYgKGNoID09PSB1bmRlZmluZWQpIGNoID0gJyAnO1xuICB3aGlsZShzLmxlbmd0aCA8IGxlbikgcyA9IGNoICsgcztcbiAgcmV0dXJuIHM7XG59XG5cbi8vIFBlcmZvcm1zIHRoZSBicm93c2VyIGZlYXR1cmUgdGVzdC4gSW1tZWRpYXRlbHkgcmV0dXJucyBhIEpTIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXN1bHRzIG9mIGFsbCBzeW5jaHJvbm91c2x5IGNvbXB1dGFibGUgZmllbGRzLCBhbmQgbGF1bmNoZXMgYXN5bmNocm9ub3VzXG4vLyB0YXNrcyB0aGF0IHBlcmZvcm0gdGhlIHJlbWFpbmluZyB0ZXN0cy4gT25jZSB0aGUgYXN5bmMgdGFza3MgaGF2ZSBmaW5pc2hlZCwgdGhlIGdpdmVuIHN1Y2Nlc3NDYWxsYmFjayBmdW5jdGlvbiBpcyBjYWxsZWQsIHdpdGggdGhlIGZ1bGwgYnJvd3NlciBmZWF0dXJlIHRlc3Rcbi8vIHJlc3VsdHMgb2JqZWN0IGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXIuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBicm93c2VyRmVhdHVyZVRlc3Qoc3VjY2Vzc0NhbGxiYWNrKSB7XG4gIHZhciBhcGlzID0ge307XG4gIGZ1bmN0aW9uIHNldEFwaVN1cHBvcnQoYXBpbmFtZSwgY21wKSB7XG4gICAgaWYgKGNtcCkgYXBpc1thcGluYW1lXSA9IHRydWU7XG4gICAgZWxzZSBhcGlzW2FwaW5hbWVdID0gZmFsc2U7XG4gIH1cblxuICBzZXRBcGlTdXBwb3J0KCdNYXRoX2ltdWwnLCB0eXBlb2YgTWF0aC5pbXVsICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ01hdGhfZnJvdW5kJywgdHlwZW9mIE1hdGguZnJvdW5kICE9PSAndW5kZWZpbmVkJyk7ICBcbiAgc2V0QXBpU3VwcG9ydCgnQXJyYXlCdWZmZXJfdHJhbnNmZXInLCB0eXBlb2YgQXJyYXlCdWZmZXIudHJhbnNmZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQXVkaW8nLCB0eXBlb2YgQXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2Via2l0QXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1BvaW50ZXJMb2NrJywgZG9jdW1lbnQuYm9keS5yZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tb3pSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS53ZWJraXRSZXF1ZXN0UG9pbnRlckxvY2sgfHwgZG9jdW1lbnQuYm9keS5tc1JlcXVlc3RQb2ludGVyTG9jayk7XG4gIHNldEFwaVN1cHBvcnQoJ0Z1bGxzY3JlZW5BUEknLCBkb2N1bWVudC5ib2R5LnJlcXVlc3RGdWxsc2NyZWVuIHx8IGRvY3VtZW50LmJvZHkubXNSZXF1ZXN0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC5ib2R5Lm1velJlcXVlc3RGdWxsU2NyZWVuIHx8IGRvY3VtZW50LmJvZHkud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pO1xuICB2YXIgaGFzQmxvYkNvbnN0cnVjdG9yID0gZmFsc2U7XG4gIHRyeSB7IG5ldyBCbG9iKCk7IGhhc0Jsb2JDb25zdHJ1Y3RvciA9IHRydWU7IH0gY2F0Y2goZSkgeyB9XG4gIHNldEFwaVN1cHBvcnQoJ0Jsb2InLCBoYXNCbG9iQ29uc3RydWN0b3IpO1xuICBpZiAoIWhhc0Jsb2JDb25zdHJ1Y3Rvcikgc2V0QXBpU3VwcG9ydCgnQmxvYkJ1aWxkZXInLCB0eXBlb2YgQmxvYkJ1aWxkZXIgIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBNb3pCbG9iQnVpbGRlciAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIFdlYktpdEJsb2JCdWlsZGVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1NoYXJlZEFycmF5QnVmZmVyJywgdHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ2hhcmR3YXJlQ29uY3VycmVuY3knLCB0eXBlb2YgbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3kgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnU0lNRGpzJywgdHlwZW9mIFNJTUQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViV29ya2VycycsIHR5cGVvZiBXb3JrZXIgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViQXNzZW1ibHknLCB0eXBlb2YgV2ViQXNzZW1ibHkgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnR2FtZXBhZEFQSScsIG5hdmlnYXRvci5nZXRHYW1lcGFkcyB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0R2FtZXBhZHMpO1xuICB2YXIgaGFzSW5kZXhlZERCID0gZmFsc2U7XG4gIHRyeSB7IGhhc0luZGV4ZWREQiA9IHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnOyB9IGNhdGNoIChlKSB7fVxuICBzZXRBcGlTdXBwb3J0KCdJbmRleGVkREInLCBoYXNJbmRleGVkREIpO1xuICBzZXRBcGlTdXBwb3J0KCdWaXNpYmlsaXR5QVBJJywgdHlwZW9mIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGRvY3VtZW50LmhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnLCB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ3BlcmZvcm1hbmNlX25vdycsIHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gJ3VuZGVmaW5lZCcgJiYgcGVyZm9ybWFuY2Uubm93KTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViU29ja2V0cycsIHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViUlRDJywgdHlwZW9mIFJUQ1BlZXJDb25uZWN0aW9uICE9PSAndW5kZWZpbmVkJyB8fCB0eXBlb2YgbW96UlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbiAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG1zUlRDUGVlckNvbm5lY3Rpb24gIT09ICd1bmRlZmluZWQnKTtcbiAgc2V0QXBpU3VwcG9ydCgnVmlicmF0aW9uQVBJJywgbmF2aWdhdG9yLnZpYnJhdGUpO1xuICBzZXRBcGlTdXBwb3J0KCdTY3JlZW5PcmllbnRhdGlvbkFQSScsIHdpbmRvdy5zY3JlZW4gJiYgKHdpbmRvdy5zY3JlZW4ub3JpZW50YXRpb24gfHwgd2luZG93LnNjcmVlbi5tb3pPcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLndlYmtpdE9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubXNPcmllbnRhdGlvbikpO1xuICBzZXRBcGlTdXBwb3J0KCdHZW9sb2NhdGlvbkFQSScsIG5hdmlnYXRvci5nZW9sb2NhdGlvbik7XG4gIHNldEFwaVN1cHBvcnQoJ0JhdHRlcnlTdGF0dXNBUEknLCBuYXZpZ2F0b3IuZ2V0QmF0dGVyeSk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkFzc2VtYmx5JywgdHlwZW9mIFdlYkFzc2VtYmx5ICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlZSJywgdHlwZW9mIG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYlhSJywgdHlwZW9mIG5hdmlnYXRvci54ciAhPT0gJ3VuZGVmaW5lZCcpO1xuICBzZXRBcGlTdXBwb3J0KCdPZmZzY3JlZW5DYW52YXMnLCB0eXBlb2YgT2Zmc2NyZWVuQ2FudmFzICE9PSAndW5kZWZpbmVkJyk7XG4gIHNldEFwaVN1cHBvcnQoJ1dlYkNvbXBvbmVudHMnLCAncmVnaXN0ZXJFbGVtZW50JyBpbiBkb2N1bWVudCAmJiAnaW1wb3J0JyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJykgJiYgJ2NvbnRlbnQnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJykpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdmFyIHdlYkdMU3VwcG9ydCA9IHt9O1xuICB2YXIgYmVzdEdMQ29udGV4dCA9IG51bGw7IC8vIFRoZSBHTCBjb250ZXh0cyBhcmUgdGVzdGVkIGZyb20gYmVzdCB0byB3b3JzdCAobmV3ZXN0IHRvIG9sZGVzdCksIGFuZCB0aGUgbW9zdCBkZXNpcmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb250ZXh0IGlzIHN0b3JlZCBoZXJlIGZvciBsYXRlciB1c2UuXG4gIGZ1bmN0aW9uIHRlc3RXZWJHTFN1cHBvcnQoY29udGV4dE5hbWUsIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXQpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdmFyIGVycm9yUmVhc29uID0gJyc7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yXCIsIGZ1bmN0aW9uKGUpIHsgZXJyb3JSZWFzb24gPSBlLnN0YXR1c01lc3NhZ2U7IH0sIGZhbHNlKTtcbiAgICB2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KGNvbnRleHROYW1lLCBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID8geyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiB0cnVlIH0gOiB7fSk7XG4gICAgaWYgKGNvbnRleHQgJiYgIWVycm9yUmVhc29uKSB7XG4gICAgICBpZiAoIWJlc3RHTENvbnRleHQpIGJlc3RHTENvbnRleHQgPSBjb250ZXh0O1xuICAgICAgdmFyIHJlc3VsdHMgPSB7IHN1cHBvcnRlZDogdHJ1ZSwgcGVyZm9ybWFuY2VDYXZlYXQ6ICFmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IH07XG4gICAgICBpZiAoY29udGV4dE5hbWUgPT0gJ2V4cGVyaW1lbnRhbC13ZWJnbCcpIHJlc3VsdHNbJ2V4cGVyaW1lbnRhbC13ZWJnbCddID0gdHJ1ZTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgICBlbHNlIHJldHVybiB7IHN1cHBvcnRlZDogZmFsc2UsIGVycm9yUmVhc29uOiBlcnJvclJlYXNvbiB9O1xuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsMicsIHRydWUpO1xuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wyJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wyID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wyJywgZmFsc2UpO1xuICAgIGlmIChzb2Z0d2FyZVdlYkdMMi5zdXBwb3J0ZWQpIHtcbiAgICAgIHNvZnR3YXJlV2ViR0wyLmhhcmR3YXJlRXJyb3JSZWFzb24gPSB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddLmVycm9yUmVhc29uOyAvLyBDYXB0dXJlIHRoZSByZWFzb24gd2h5IGhhcmR3YXJlIFdlYkdMIDIgY29udGV4dCBkaWQgbm90IHN1Y2NlZWQuXG4gICAgICB3ZWJHTFN1cHBvcnRbJ3dlYmdsMiddID0gc29mdHdhcmVXZWJHTDI7XG4gICAgfVxuICB9XG5cbiAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHRlc3RXZWJHTFN1cHBvcnQoJ3dlYmdsJywgdHJ1ZSk7XG4gIGlmICghd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5zdXBwb3J0ZWQpIHtcbiAgICB2YXIgZXhwZXJpbWVudGFsV2ViR0wgPSB0ZXN0V2ViR0xTdXBwb3J0KCdleHBlcmltZW50YWwtd2ViZ2wnLCB0cnVlKTtcbiAgICBpZiAoZXhwZXJpbWVudGFsV2ViR0wuc3VwcG9ydGVkIHx8IChleHBlcmltZW50YWxXZWJHTC5lcnJvclJlYXNvbiAmJiAhd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbikpIHtcbiAgICAgIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10gPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICB9XG4gIH1cblxuICBpZiAoIXdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKSB7XG4gICAgdmFyIHNvZnR3YXJlV2ViR0wxID0gdGVzdFdlYkdMU3VwcG9ydCgnd2ViZ2wnLCBmYWxzZSk7XG4gICAgaWYgKCFzb2Z0d2FyZVdlYkdMMS5zdXBwb3J0ZWQpIHtcbiAgICAgIHZhciBleHBlcmltZW50YWxXZWJHTCA9IHRlc3RXZWJHTFN1cHBvcnQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIGZhbHNlKTtcbiAgICAgIGlmIChleHBlcmltZW50YWxXZWJHTC5zdXBwb3J0ZWQgfHwgKGV4cGVyaW1lbnRhbFdlYkdMLmVycm9yUmVhc29uICYmICFzb2Z0d2FyZVdlYkdMMS5lcnJvclJlYXNvbikpIHtcbiAgICAgICAgc29mdHdhcmVXZWJHTDEgPSBleHBlcmltZW50YWxXZWJHTDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc29mdHdhcmVXZWJHTDEuc3VwcG9ydGVkKSB7XG4gICAgICBzb2Z0d2FyZVdlYkdMMS5oYXJkd2FyZUVycm9yUmVhc29uID0gd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXS5lcnJvclJlYXNvbjsgLy8gQ2FwdHVyZSB0aGUgcmVhc29uIHdoeSBoYXJkd2FyZSBXZWJHTCAxIGNvbnRleHQgZGlkIG5vdCBzdWNjZWVkLlxuICAgICAgd2ViR0xTdXBwb3J0Wyd3ZWJnbDEnXSA9IHNvZnR3YXJlV2ViR0wxO1xuICAgIH1cbiAgfVxuXG4gIHNldEFwaVN1cHBvcnQoJ1dlYkdMMScsIHdlYkdMU3VwcG9ydFsnd2ViZ2wxJ10uc3VwcG9ydGVkKTtcbiAgc2V0QXBpU3VwcG9ydCgnV2ViR0wyJywgd2ViR0xTdXBwb3J0Wyd3ZWJnbDInXS5zdXBwb3J0ZWQpO1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIHZhciByZXN1bHRzID0ge1xuICAgIHVzZXJBZ2VudDogdXNlckFnZW50SW5mbyhuYXZpZ2F0b3IudXNlckFnZW50KSxcbiAgICBuYXZpZ2F0b3I6IHtcbiAgICAgIGJ1aWxkSUQ6IG5hdmlnYXRvci5idWlsZElELFxuICAgICAgYXBwVmVyc2lvbjogbmF2aWdhdG9yLmFwcFZlcnNpb24sXG4gICAgICBvc2NwdTogbmF2aWdhdG9yLm9zY3B1LFxuICAgICAgcGxhdGZvcm06IG5hdmlnYXRvci5wbGF0Zm9ybSAgXG4gICAgfSxcbiAgICAvLyBkaXNwbGF5UmVmcmVzaFJhdGU6IGRpc3BsYXlSZWZyZXNoUmF0ZSwgLy8gV2lsbCBiZSBhc3luY2hyb25vdXNseSBmaWxsZWQgaW4gb24gZmlyc3QgcnVuLCBkaXJlY3RseSBmaWxsZWQgaW4gbGF0ZXIuXG4gICAgZGlzcGxheToge1xuICAgICAgd2luZG93RGV2aWNlUGl4ZWxSYXRpbzogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBzY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoLFxuICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW4uaGVpZ2h0LFxuICAgICAgcGh5c2ljYWxTY3JlZW5XaWR0aDogc2NyZWVuLndpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8sXG4gICAgICBwaHlzaWNhbFNjcmVlbkhlaWdodDogc2NyZWVuLmhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLCAgXG4gICAgfSxcbiAgICBoYXJkd2FyZUNvbmN1cnJlbmN5OiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSwgLy8gSWYgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHRoaXMsIHdpbGwgYmUgYXN5bmNocm9ub3VzbHkgZmlsbGVkIGluIGJ5IGNvcmUgZXN0aW1hdG9yLlxuICAgIGFwaVN1cHBvcnQ6IGFwaXMsXG4gICAgdHlwZWRBcnJheUVuZGlhbm5lc3M6IGVuZGlhbm5lc3MoKVxuICB9O1xuXG4gIC8vIFNvbWUgZmllbGRzIGV4aXN0IGRvbid0IGFsd2F5cyBleGlzdFxuICB2YXIgb3B0aW9uYWxGaWVsZHMgPSBbJ3ZlbmRvcicsICd2ZW5kb3JTdWInLCAncHJvZHVjdCcsICdwcm9kdWN0U3ViJywgJ2xhbmd1YWdlJywgJ2FwcENvZGVOYW1lJywgJ2FwcE5hbWUnLCAnbWF4VG91Y2hQb2ludHMnLCAncG9pbnRlckVuYWJsZWQnLCAnY3B1Q2xhc3MnXTtcbiAgZm9yKHZhciBpIGluIG9wdGlvbmFsRmllbGRzKSB7XG4gICAgdmFyIGYgPSBvcHRpb25hbEZpZWxkc1tpXTtcbiAgICBpZiAobmF2aWdhdG9yW2ZdKSB7IHJlc3VsdHMubmF2aWdhdG9yW2ZdID0gbmF2aWdhdG9yW2ZdOyB9XG4gIH1cbi8qXG4gIGlmIChiZXN0R0xDb250ZXh0KSB7XG4gICAgcmVzdWx0cy5HTF9WRU5ET1IgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlZFTkRPUik7XG4gICAgcmVzdWx0cy5HTF9SRU5ERVJFUiA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuUkVOREVSRVIpO1xuICAgIHJlc3VsdHMuR0xfVkVSU0lPTiA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuVkVSU0lPTik7XG4gICAgcmVzdWx0cy5HTF9TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04gPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihiZXN0R0xDb250ZXh0LlNIQURJTkdfTEFOR1VBR0VfVkVSU0lPTik7XG4gICAgcmVzdWx0cy5HTF9NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKGJlc3RHTENvbnRleHQuTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuXG4gICAgdmFyIFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8gPSBiZXN0R0xDb250ZXh0LmdldEV4dGVuc2lvbignV0VCR0xfZGVidWdfcmVuZGVyZXJfaW5mbycpO1xuICAgIGlmIChXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvKSB7XG4gICAgICByZXN1bHRzLkdMX1VOTUFTS0VEX1ZFTkRPUl9XRUJHTCA9IGJlc3RHTENvbnRleHQuZ2V0UGFyYW1ldGVyKFdFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm8uVU5NQVNLRURfVkVORE9SX1dFQkdMKTtcbiAgICAgIHJlc3VsdHMuR0xfVU5NQVNLRURfUkVOREVSRVJfV0VCR0wgPSBiZXN0R0xDb250ZXh0LmdldFBhcmFtZXRlcihXRUJHTF9kZWJ1Z19yZW5kZXJlcl9pbmZvLlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMKTtcbiAgICB9XG4gICAgcmVzdWx0cy5zdXBwb3J0ZWRXZWJHTEV4dGVuc2lvbnMgPSBiZXN0R0xDb250ZXh0LmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKTtcbiAgfVxuKi9cblxuICAvLyBTcGluIG9mZiB0aGUgYXN5bmNocm9ub3VzIHRhc2tzLlxuXG4gIHZhciBudW1Db3Jlc0NoZWNrZWQgPSBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSA+IDA7XG5cbiAgLy8gT24gZmlyc3QgcnVuLCBlc3RpbWF0ZSB0aGUgbnVtYmVyIG9mIGNvcmVzIGlmIG5lZWRlZC5cbiAgaWYgKCFudW1Db3Jlc0NoZWNrZWQpIHtcbiAgICBpZiAobmF2aWdhdG9yLmdldEhhcmR3YXJlQ29uY3VycmVuY3kpIHtcbiAgICAgIG5hdmlnYXRvci5nZXRIYXJkd2FyZUNvbmN1cnJlbmN5KGZ1bmN0aW9uKGNvcmVzKSB7XG4gICAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IGNvcmVzO1xuICAgICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIElmIHRoaXMgd2FzIHRoZSBsYXN0IGFzeW5jIHRhc2ssIGZpcmUgc3VjY2VzcyBjYWxsYmFjay5cbiAgICAgICAgaWYgKG51bUNvcmVzQ2hlY2tlZCAmJiBzdWNjZXNzQ2FsbGJhY2spIHN1Y2Nlc3NDYWxsYmFjayhyZXN1bHRzKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSBpcyBub3Qgc3VwcG9ydGVkLCBhbmQgbm8gY29yZSBlc3RpbWF0b3IgYXZhaWxhYmxlIGVpdGhlci5cbiAgICAgIC8vIFJlcG9ydCBudW1iZXIgb2YgY29yZXMgYXMgMC5cbiAgICAgIHJlc3VsdHMuaGFyZHdhcmVDb25jdXJyZW5jeSA9IDA7XG4gICAgICBudW1Db3Jlc0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGFzeW5jIHRhc2tzIHdlcmUgbmVlZGVkIHRvIGJlIGV4ZWN1dGVkLCBxdWV1ZSBzdWNjZXNzIGNhbGxiYWNrLlxuICBpZiAobnVtQ29yZXNDaGVja2VkICYmIHN1Y2Nlc3NDYWxsYmFjaykgc2V0VGltZW91dChmdW5jdGlvbigpIHsgc3VjY2Vzc0NhbGxiYWNrKHJlc3VsdHMpOyB9LCAxKTtcblxuICAvLyBJZiBjYWxsZXIgaXMgbm90IGludGVyZXN0ZWQgaW4gYXN5bmNocm9ub3VzbHkgZmlsbGFibGUgZGF0YSwgYWxzbyByZXR1cm4gdGhlIHJlc3VsdHMgb2JqZWN0IGltbWVkaWF0ZWx5IGZvciB0aGUgc3luY2hyb25vdXMgYml0cy5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iLCJmdW5jdGlvbiBnZXRXZWJHTEluZm9CeVZlcnNpb24od2ViZ2xWZXJzaW9uKSB7XG4gIHZhciByZXBvcnQgPSB7XG4gICAgd2ViZ2xWZXJzaW9uOiB3ZWJnbFZlcnNpb25cbiAgfTtcblxuaWYgKCh3ZWJnbFZlcnNpb24gPT09IDIgJiYgIXdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB8fFxuICAgICh3ZWJnbFZlcnNpb24gPT09IDEgJiYgIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQpKSB7XG4gICAgLy8gVGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBXZWJHTFxuICAgIHJlcG9ydC5jb250ZXh0TmFtZSA9IFwid2ViZ2wgbm90IHN1cHBvcnRlZFwiO1xuICAgIHJldHVybiByZXBvcnQ7XG59XG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xudmFyIGdsLCBjb250ZXh0TmFtZTtcbnZhciBwb3NzaWJsZU5hbWVzID0gKHdlYmdsVmVyc2lvbiA9PT0gMikgPyBbXCJ3ZWJnbDJcIiwgXCJleHBlcmltZW50YWwtd2ViZ2wyXCJdIDogW1wid2ViZ2xcIiwgXCJleHBlcmltZW50YWwtd2ViZ2xcIl07XG5mb3IgKHZhciBpPTA7aTxwb3NzaWJsZU5hbWVzLmxlbmd0aDtpKyspIHtcbiAgdmFyIG5hbWUgPSBwb3NzaWJsZU5hbWVzW2ldO1xuICBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWUsIHsgc3RlbmNpbDogdHJ1ZSB9KTtcbiAgaWYgKGdsKXtcbiAgICAgIGNvbnRleHROYW1lID0gbmFtZTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5jYW52YXMucmVtb3ZlKCk7XG5pZiAoIWdsKSB7XG4gICAgcmVwb3J0LmNvbnRleHROYW1lID0gXCJ3ZWJnbCBzdXBwb3J0ZWQgYnV0IGZhaWxlZCB0byBpbml0aWFsaXplXCI7XG4gICAgcmV0dXJuIHJlcG9ydDtcbn1cblxucmV0dXJuIE9iamVjdC5hc3NpZ24ocmVwb3J0LCB7XG4gICAgY29udGV4dE5hbWU6IGNvbnRleHROYW1lLFxuICAgIGdsVmVyc2lvbjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlZFUlNJT04pLFxuICAgIHZlbmRvcjogZ2wuZ2V0UGFyYW1ldGVyKGdsLlZFTkRPUiksXG4gICAgcmVuZGVyZXI6IGdsLmdldFBhcmFtZXRlcihnbC5SRU5ERVJFUiksXG4gICAgdW5NYXNrZWRWZW5kb3I6IGdldFVubWFza2VkSW5mbyhnbCkudmVuZG9yLFxuICAgIHVuTWFza2VkUmVuZGVyZXI6IGdldFVubWFza2VkSW5mbyhnbCkucmVuZGVyZXIsXG4gICAgYW5nbGU6IGdldEFuZ2xlKGdsKSxcbiAgICBhbnRpYWxpYXM6ICBnbC5nZXRDb250ZXh0QXR0cmlidXRlcygpLmFudGlhbGlhcyA/IFwiQXZhaWxhYmxlXCIgOiBcIk5vdCBhdmFpbGFibGVcIixcbiAgICBtYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiBnZXRNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KGNvbnRleHROYW1lKSxcbiAgICBiaXRzOiB7XG4gICAgICByZWRCaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuUkVEX0JJVFMpLFxuICAgICAgZ3JlZW5CaXRzOiBnbC5nZXRQYXJhbWV0ZXIoZ2wuR1JFRU5fQklUUyksXG4gICAgICBibHVlQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkJMVUVfQklUUyksXG4gICAgICBhbHBoYUJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5BTFBIQV9CSVRTKSxcbiAgICAgIGRlcHRoQml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLkRFUFRIX0JJVFMpLFxuICAgICAgc3RlbmNpbEJpdHM6IGdsLmdldFBhcmFtZXRlcihnbC5TVEVOQ0lMX0JJVFMpICBcbiAgICB9LFxuICAgIG1heGltdW06IHtcbiAgICAgIG1heENvbG9yQnVmZmVyczogZ2V0TWF4Q29sb3JCdWZmZXJzKGdsKSxcbiAgICAgIG1heFJlbmRlckJ1ZmZlclNpemU6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfUkVOREVSQlVGRkVSX1NJWkUpLFxuICAgICAgbWF4Q29tYmluZWRUZXh0dXJlSW1hZ2VVbml0czogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9DT01CSU5FRF9URVhUVVJFX0lNQUdFX1VOSVRTKSxcbiAgICAgIG1heEN1YmVNYXBUZXh0dXJlU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9DVUJFX01BUF9URVhUVVJFX1NJWkUpLFxuICAgICAgbWF4RnJhZ21lbnRVbmlmb3JtVmVjdG9yczogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9GUkFHTUVOVF9VTklGT1JNX1ZFQ1RPUlMpLFxuICAgICAgbWF4VGV4dHVyZUltYWdlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyksXG4gICAgICBtYXhUZXh0dXJlU2l6ZTogZ2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9URVhUVVJFX1NJWkUpLFxuICAgICAgbWF4VmFyeWluZ1ZlY3RvcnM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkFSWUlOR19WRUNUT1JTKSxcbiAgICAgIG1heFZlcnRleEF0dHJpYnV0ZXM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX0FUVFJJQlMpLFxuICAgICAgbWF4VmVydGV4VGV4dHVyZUltYWdlVW5pdHM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1RFWFRVUkVfSU1BR0VfVU5JVFMpLFxuICAgICAgbWF4VmVydGV4VW5pZm9ybVZlY3RvcnM6IGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1VOSUZPUk1fVkVDVE9SUyksICBcbiAgICAgIG1heFZpZXdwb3J0RGltZW5zaW9uczogZGVzY3JpYmVSYW5nZShnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZJRVdQT1JUX0RJTVMpKSxcbiAgICAgIG1heEFuaXNvdHJvcHk6IGdldE1heEFuaXNvdHJvcHkoZ2wpLFxuICAgIH0sXG4gICAgYWxpYXNlZExpbmVXaWR0aFJhbmdlOiBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5BTElBU0VEX0xJTkVfV0lEVEhfUkFOR0UpKSxcbiAgICBhbGlhc2VkUG9pbnRTaXplUmFuZ2U6IGRlc2NyaWJlUmFuZ2UoZ2wuZ2V0UGFyYW1ldGVyKGdsLkFMSUFTRURfUE9JTlRfU0laRV9SQU5HRSkpLFxuICAgIHNoYWRlcnM6IHtcbiAgICAgIHZlcnRleFNoYWRlckJlc3RQcmVjaXNpb246IGdldEJlc3RGbG9hdFByZWNpc2lvbihnbC5WRVJURVhfU0hBREVSLCBnbCksXG4gICAgICBmcmFnbWVudFNoYWRlckJlc3RQcmVjaXNpb246IGdldEJlc3RGbG9hdFByZWNpc2lvbihnbC5GUkFHTUVOVF9TSEFERVIsIGdsKSxcbiAgICAgIGZyYWdtZW50U2hhZGVyRmxvYXRJbnRQcmVjaXNpb246IGdldEZsb2F0SW50UHJlY2lzaW9uKGdsKSxcbiAgICAgIHNoYWRpbmdMYW5ndWFnZVZlcnNpb246IGdsLmdldFBhcmFtZXRlcihnbC5TSEFESU5HX0xBTkdVQUdFX1ZFUlNJT04pXG4gICAgfSxcbiAgICBleHRlbnNpb25zOiBnbC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKClcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRlc2NyaWJlUmFuZ2UodmFsdWUpIHtcbiAgcmV0dXJuIFt2YWx1ZVswXSwgdmFsdWVbMV1dO1xufVxuXG5mdW5jdGlvbiBnZXRVbm1hc2tlZEluZm8oZ2wpIHtcbiAgdmFyIHVuTWFza2VkSW5mbyA9IHtcbiAgICAgIHJlbmRlcmVyOiBcIlwiLFxuICAgICAgdmVuZG9yOiBcIlwiXG4gIH07XG4gIFxuICB2YXIgZGJnUmVuZGVySW5mbyA9IGdsLmdldEV4dGVuc2lvbihcIldFQkdMX2RlYnVnX3JlbmRlcmVyX2luZm9cIik7XG4gIGlmIChkYmdSZW5kZXJJbmZvICE9IG51bGwpIHtcbiAgICAgIHVuTWFza2VkSW5mby5yZW5kZXJlciA9IGdsLmdldFBhcmFtZXRlcihkYmdSZW5kZXJJbmZvLlVOTUFTS0VEX1JFTkRFUkVSX1dFQkdMKTtcbiAgICAgIHVuTWFza2VkSW5mby52ZW5kb3IgICA9IGdsLmdldFBhcmFtZXRlcihkYmdSZW5kZXJJbmZvLlVOTUFTS0VEX1ZFTkRPUl9XRUJHTCk7XG4gIH1cbiAgXG4gIHJldHVybiB1bk1hc2tlZEluZm87XG59XG5cbmZ1bmN0aW9uIGdldE1heENvbG9yQnVmZmVycyhnbCkge1xuICB2YXIgbWF4Q29sb3JCdWZmZXJzID0gMTtcbiAgdmFyIGV4dCA9IGdsLmdldEV4dGVuc2lvbihcIldFQkdMX2RyYXdfYnVmZmVyc1wiKTtcbiAgaWYgKGV4dCAhPSBudWxsKSBcbiAgICAgIG1heENvbG9yQnVmZmVycyA9IGdsLmdldFBhcmFtZXRlcihleHQuTUFYX0RSQVdfQlVGRkVSU19XRUJHTCk7XG4gIFxuICByZXR1cm4gbWF4Q29sb3JCdWZmZXJzO1xufVxuXG5mdW5jdGlvbiBnZXRNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0KGNvbnRleHROYW1lKSB7XG4gIC8vIERvZXMgY29udGV4dCBjcmVhdGlvbiBmYWlsIHRvIGRvIGEgbWFqb3IgcGVyZm9ybWFuY2UgY2F2ZWF0P1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpKTtcbiAgdmFyIGdsID0gY2FudmFzLmdldENvbnRleHQoY29udGV4dE5hbWUsIHsgZmFpbElmTWFqb3JQZXJmb3JtYW5jZUNhdmVhdCA6IHRydWUgfSk7XG4gIGNhbnZhcy5yZW1vdmUoKTtcblxuICBpZiAoIWdsKSB7XG4gICAgICAvLyBPdXIgb3JpZ2luYWwgY29udGV4dCBjcmVhdGlvbiBwYXNzZWQuICBUaGlzIGRpZCBub3QuXG4gICAgICByZXR1cm4gXCJZZXNcIjtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZ2wuZ2V0Q29udGV4dEF0dHJpYnV0ZXMoKS5mYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvLyBJZiBnZXRDb250ZXh0QXR0cmlidXRlcygpIGRvZXNuXCJ0IGluY2x1ZGUgdGhlIGZhaWxJZk1ham9yUGVyZm9ybWFuY2VDYXZlYXRcbiAgICAgIC8vIHByb3BlcnR5LCBhc3N1bWUgdGhlIGJyb3dzZXIgZG9lc25cInQgaW1wbGVtZW50IGl0IHlldC5cbiAgICAgIHJldHVybiBcIk5vdCBpbXBsZW1lbnRlZFwiO1xuICB9XG4gIHJldHVybiBcIk5vXCI7XG59XG5cbmZ1bmN0aW9uIGlzUG93ZXJPZlR3byhuKSB7XG4gIHJldHVybiAobiAhPT0gMCkgJiYgKChuICYgKG4gLSAxKSkgPT09IDApO1xufVxuXG5mdW5jdGlvbiBnZXRBbmdsZShnbCkge1xuICB2YXIgbGluZVdpZHRoUmFuZ2UgPSBkZXNjcmliZVJhbmdlKGdsLmdldFBhcmFtZXRlcihnbC5BTElBU0VEX0xJTkVfV0lEVEhfUkFOR0UpKTtcblxuICAvLyBIZXVyaXN0aWM6IEFOR0xFIGlzIG9ubHkgb24gV2luZG93cywgbm90IGluIElFLCBhbmQgZG9lcyBub3QgaW1wbGVtZW50IGxpbmUgd2lkdGggZ3JlYXRlciB0aGFuIG9uZS5cbiAgdmFyIGFuZ2xlID0gKChuYXZpZ2F0b3IucGxhdGZvcm0gPT09IFwiV2luMzJcIikgfHwgKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gXCJXaW42NFwiKSkgJiZcbiAgICAgIChnbC5nZXRQYXJhbWV0ZXIoZ2wuUkVOREVSRVIpICE9PSBcIkludGVybmV0IEV4cGxvcmVyXCIpICYmXG4gICAgICAobGluZVdpZHRoUmFuZ2UgPT09IGRlc2NyaWJlUmFuZ2UoWzEsMV0pKTtcblxuICBpZiAoYW5nbGUpIHtcbiAgICAgIC8vIEhldXJpc3RpYzogRDNEMTEgYmFja2VuZCBkb2VzIG5vdCBhcHBlYXIgdG8gcmVzZXJ2ZSB1bmlmb3JtcyBsaWtlIHRoZSBEM0Q5IGJhY2tlbmQsIGUuZy4sXG4gICAgICAvLyBEM0QxMSBtYXkgaGF2ZSAxMDI0IHVuaWZvcm1zIHBlciBzdGFnZSwgYnV0IEQzRDkgaGFzIDI1NCBhbmQgMjIxLlxuICAgICAgLy9cbiAgICAgIC8vIFdlIGNvdWxkIGFsc28gdGVzdCBmb3IgV0VCR0xfZHJhd19idWZmZXJzLCBidXQgbWFueSBzeXN0ZW1zIGRvIG5vdCBoYXZlIGl0IHlldFxuICAgICAgLy8gZHVlIHRvIGRyaXZlciBidWdzLCBldGMuXG4gICAgICBpZiAoaXNQb3dlck9mVHdvKGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX1VOSUZPUk1fVkVDVE9SUykpICYmIGlzUG93ZXJPZlR3byhnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX0ZSQUdNRU5UX1VOSUZPUk1fVkVDVE9SUykpKSB7XG4gICAgICAgICAgcmV0dXJuIFwiWWVzLCBEM0QxMVwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJZZXMsIEQzRDlcIjtcbiAgICAgIH1cbiAgfVxuXG4gIHJldHVybiBcIk5vXCI7XG59XG5cbmZ1bmN0aW9uIGdldE1heEFuaXNvdHJvcHkoZ2wpIHtcbiAgdmFyIGUgPSBnbC5nZXRFeHRlbnNpb24oXCJFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWNcIilcbiAgICAgICAgICB8fCBnbC5nZXRFeHRlbnNpb24oXCJXRUJLSVRfRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljXCIpXG4gICAgICAgICAgfHwgZ2wuZ2V0RXh0ZW5zaW9uKFwiTU9aX0VYVF90ZXh0dXJlX2ZpbHRlcl9hbmlzb3Ryb3BpY1wiKTtcblxuICBpZiAoZSkge1xuICAgICAgdmFyIG1heCA9IGdsLmdldFBhcmFtZXRlcihlLk1BWF9URVhUVVJFX01BWF9BTklTT1RST1BZX0VYVCk7XG4gICAgICAvLyBTZWUgQ2FuYXJ5IGJ1ZzogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTExNzQ1MFxuICAgICAgaWYgKG1heCA9PT0gMCkge1xuICAgICAgICAgIG1heCA9IDI7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4O1xuICB9XG4gIHJldHVybiBcIm4vYVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRQb3dlcihleHBvbmVudCwgdmVyYm9zZSkge1xuICBpZiAodmVyYm9zZSkge1xuICAgICAgcmV0dXJuIFwiXCIgKyBNYXRoLnBvdygyLCBleHBvbmVudCk7XG4gIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIyXlwiICsgZXhwb25lbnQgKyBcIlwiO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByZWNpc2lvbkRlc2NyaXB0aW9uKHByZWNpc2lvbiwgdmVyYm9zZSkge1xuICB2YXIgdmVyYm9zZVBhcnQgPSB2ZXJib3NlID8gXCIgYml0IG1hbnRpc3NhXCIgOiBcIlwiO1xuICByZXR1cm4gXCJbLVwiICsgZm9ybWF0UG93ZXIocHJlY2lzaW9uLnJhbmdlTWluLCB2ZXJib3NlKSArIFwiLCBcIiArIGZvcm1hdFBvd2VyKHByZWNpc2lvbi5yYW5nZU1heCwgdmVyYm9zZSkgKyBcIl0gKFwiICsgcHJlY2lzaW9uLnByZWNpc2lvbiArIHZlcmJvc2VQYXJ0ICsgXCIpXCJcbn1cblxuZnVuY3Rpb24gZ2V0QmVzdEZsb2F0UHJlY2lzaW9uKHNoYWRlclR5cGUsIGdsKSB7XG4gIHZhciBoaWdoID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KHNoYWRlclR5cGUsIGdsLkhJR0hfRkxPQVQpO1xuICB2YXIgbWVkaXVtID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KHNoYWRlclR5cGUsIGdsLk1FRElVTV9GTE9BVCk7XG4gIHZhciBsb3cgPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoc2hhZGVyVHlwZSwgZ2wuTE9XX0ZMT0FUKTtcblxuICB2YXIgYmVzdCA9IGhpZ2g7XG4gIGlmIChoaWdoLnByZWNpc2lvbiA9PT0gMCkge1xuICAgICAgYmVzdCA9IG1lZGl1bTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgICBoaWdoIDogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24oaGlnaCwgdHJ1ZSksXG4gICAgICBtZWRpdW0gOiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihtZWRpdW0sIHRydWUpLFxuICAgICAgbG93OiBnZXRQcmVjaXNpb25EZXNjcmlwdGlvbihsb3csIHRydWUpLFxuICAgICAgYmVzdDogZ2V0UHJlY2lzaW9uRGVzY3JpcHRpb24oYmVzdCwgZmFsc2UpXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RmxvYXRJbnRQcmVjaXNpb24oZ2wpIHtcbiAgdmFyIGhpZ2ggPSBnbC5nZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQoZ2wuRlJBR01FTlRfU0hBREVSLCBnbC5ISUdIX0ZMT0FUKTtcbiAgdmFyIHMgPSAoaGlnaC5wcmVjaXNpb24gIT09IDApID8gXCJoaWdocC9cIiA6IFwibWVkaXVtcC9cIjtcblxuICBoaWdoID0gZ2wuZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0KGdsLkZSQUdNRU5UX1NIQURFUiwgZ2wuSElHSF9JTlQpO1xuICBzICs9IChoaWdoLnJhbmdlTWF4ICE9PSAwKSA/IFwiaGlnaHBcIiA6IFwibG93cFwiO1xuXG4gIHJldHVybiBzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHdlYmdsMTogZ2V0V2ViR0xJbmZvQnlWZXJzaW9uKDEpLFxuICAgIHdlYmdsMjogZ2V0V2ViR0xJbmZvQnlWZXJzaW9uKDIpXG4gIH1cbn1cbiIsIi8qXG4gQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBTSEEgZmFtaWx5IG9mIGhhc2hlcywgYXNcbiBkZWZpbmVkIGluIEZJUFMgUFVCIDE4MC00IGFuZCBGSVBTIFBVQiAyMDIsIGFzIHdlbGwgYXMgdGhlIGNvcnJlc3BvbmRpbmdcbiBITUFDIGltcGxlbWVudGF0aW9uIGFzIGRlZmluZWQgaW4gRklQUyBQVUIgMTk4YVxuXG4gQ29weXJpZ2h0IEJyaWFuIFR1cmVrIDIwMDgtMjAxN1xuIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuIFNlZSBodHRwOi8vY2FsaWdhdGlvLmdpdGh1Yi5jb20vanNTSEEvIGZvciBtb3JlIGluZm9ybWF0aW9uXG5cbiBTZXZlcmFsIGZ1bmN0aW9ucyB0YWtlbiBmcm9tIFBhdWwgSm9obnN0b25cbiovXG4ndXNlIHN0cmljdCc7KGZ1bmN0aW9uKFkpe2Z1bmN0aW9uIEMoYyxhLGIpe3ZhciBlPTAsaD1bXSxuPTAsZyxsLGQsZixtLHEsdSxyLEk9ITEsdj1bXSx3PVtdLHQseT0hMSx6PSExLHg9LTE7Yj1ifHx7fTtnPWIuZW5jb2Rpbmd8fFwiVVRGOFwiO3Q9Yi5udW1Sb3VuZHN8fDE7aWYodCE9PXBhcnNlSW50KHQsMTApfHwxPnQpdGhyb3cgRXJyb3IoXCJudW1Sb3VuZHMgbXVzdCBhIGludGVnZXIgPj0gMVwiKTtpZihcIlNIQS0xXCI9PT1jKW09NTEyLHE9Syx1PVosZj0xNjAscj1mdW5jdGlvbihhKXtyZXR1cm4gYS5zbGljZSgpfTtlbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBLVwiLDApKWlmKHE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gTChhLGIsYyl9LHU9ZnVuY3Rpb24oYSxiLGgsZSl7dmFyIGssZjtpZihcIlNIQS0yMjRcIj09PWN8fFwiU0hBLTI1NlwiPT09YylrPShiKzY1Pj4+OTw8NCkrMTUsZj0xNjtlbHNlIGlmKFwiU0hBLTM4NFwiPT09Y3x8XCJTSEEtNTEyXCI9PT1jKWs9KGIrMTI5Pj4+MTA8PFxuNSkrMzEsZj0zMjtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtmb3IoO2EubGVuZ3RoPD1rOylhLnB1c2goMCk7YVtiPj4+NV18PTEyODw8MjQtYiUzMjtiPWIraDthW2tdPWImNDI5NDk2NzI5NTthW2stMV09Yi80Mjk0OTY3Mjk2fDA7aD1hLmxlbmd0aDtmb3IoYj0wO2I8aDtiKz1mKWU9TChhLnNsaWNlKGIsYitmKSxlLGMpO2lmKFwiU0hBLTIyNFwiPT09YylhPVtlWzBdLGVbMV0sZVsyXSxlWzNdLGVbNF0sZVs1XSxlWzZdXTtlbHNlIGlmKFwiU0hBLTI1NlwiPT09YylhPWU7ZWxzZSBpZihcIlNIQS0zODRcIj09PWMpYT1bZVswXS5hLGVbMF0uYixlWzFdLmEsZVsxXS5iLGVbMl0uYSxlWzJdLmIsZVszXS5hLGVbM10uYixlWzRdLmEsZVs0XS5iLGVbNV0uYSxlWzVdLmJdO2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1jKWE9W2VbMF0uYSxlWzBdLmIsZVsxXS5hLGVbMV0uYixlWzJdLmEsZVsyXS5iLGVbM10uYSxlWzNdLmIsZVs0XS5hLFxuZVs0XS5iLGVbNV0uYSxlWzVdLmIsZVs2XS5hLGVbNl0uYixlWzddLmEsZVs3XS5iXTtlbHNlIHRocm93IEVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiBTSEEtMiBpbXBsZW1lbnRhdGlvblwiKTtyZXR1cm4gYX0scj1mdW5jdGlvbihhKXtyZXR1cm4gYS5zbGljZSgpfSxcIlNIQS0yMjRcIj09PWMpbT01MTIsZj0yMjQ7ZWxzZSBpZihcIlNIQS0yNTZcIj09PWMpbT01MTIsZj0yNTY7ZWxzZSBpZihcIlNIQS0zODRcIj09PWMpbT0xMDI0LGY9Mzg0O2Vsc2UgaWYoXCJTSEEtNTEyXCI9PT1jKW09MTAyNCxmPTUxMjtlbHNlIHRocm93IEVycm9yKFwiQ2hvc2VuIFNIQSB2YXJpYW50IGlzIG5vdCBzdXBwb3J0ZWRcIik7ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQTMtXCIsMCl8fDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBS0VcIiwwKSl7dmFyIEY9NjtxPUQ7cj1mdW5jdGlvbihhKXt2YXIgYz1bXSxlO2ZvcihlPTA7NT5lO2UrPTEpY1tlXT1hW2VdLnNsaWNlKCk7cmV0dXJuIGN9O3g9MTtpZihcIlNIQTMtMjI0XCI9PT1cbmMpbT0xMTUyLGY9MjI0O2Vsc2UgaWYoXCJTSEEzLTI1NlwiPT09YyltPTEwODgsZj0yNTY7ZWxzZSBpZihcIlNIQTMtMzg0XCI9PT1jKW09ODMyLGY9Mzg0O2Vsc2UgaWYoXCJTSEEzLTUxMlwiPT09YyltPTU3NixmPTUxMjtlbHNlIGlmKFwiU0hBS0UxMjhcIj09PWMpbT0xMzQ0LGY9LTEsRj0zMSx6PSEwO2Vsc2UgaWYoXCJTSEFLRTI1NlwiPT09YyltPTEwODgsZj0tMSxGPTMxLHo9ITA7ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO3U9ZnVuY3Rpb24oYSxjLGUsYixoKXtlPW07dmFyIGs9RixmLGc9W10sbj1lPj4+NSxsPTAsZD1jPj4+NTtmb3IoZj0wO2Y8ZCYmYz49ZTtmKz1uKWI9RChhLnNsaWNlKGYsZituKSxiKSxjLT1lO2E9YS5zbGljZShmKTtmb3IoYyU9ZTthLmxlbmd0aDxuOylhLnB1c2goMCk7Zj1jPj4+MzthW2Y+PjJdXj1rPDxmJTQqODthW24tMV1ePTIxNDc0ODM2NDg7Zm9yKGI9RChhLGIpOzMyKmcubGVuZ3RoPGg7KXthPWJbbCVcbjVdW2wvNXwwXTtnLnB1c2goYS5iKTtpZigzMipnLmxlbmd0aD49aClicmVhaztnLnB1c2goYS5hKTtsKz0xOzA9PT02NCpsJWUmJkQobnVsbCxiKX1yZXR1cm4gZ319ZWxzZSB0aHJvdyBFcnJvcihcIkNob3NlbiBTSEEgdmFyaWFudCBpcyBub3Qgc3VwcG9ydGVkXCIpO2Q9TShhLGcseCk7bD1BKGMpO3RoaXMuc2V0SE1BQ0tleT1mdW5jdGlvbihhLGIsaCl7dmFyIGs7aWYoITA9PT1JKXRocm93IEVycm9yKFwiSE1BQyBrZXkgYWxyZWFkeSBzZXRcIik7aWYoITA9PT15KXRocm93IEVycm9yKFwiQ2Fubm90IHNldCBITUFDIGtleSBhZnRlciBjYWxsaW5nIHVwZGF0ZVwiKTtpZighMD09PXopdGhyb3cgRXJyb3IoXCJTSEFLRSBpcyBub3Qgc3VwcG9ydGVkIGZvciBITUFDXCIpO2c9KGh8fHt9KS5lbmNvZGluZ3x8XCJVVEY4XCI7Yj1NKGIsZyx4KShhKTthPWIuYmluTGVuO2I9Yi52YWx1ZTtrPW0+Pj4zO2g9ay80LTE7aWYoazxhLzgpe2ZvcihiPXUoYixhLDAsQShjKSxmKTtiLmxlbmd0aDw9aDspYi5wdXNoKDApO1xuYltoXSY9NDI5NDk2NzA0MH1lbHNlIGlmKGs+YS84KXtmb3IoO2IubGVuZ3RoPD1oOyliLnB1c2goMCk7YltoXSY9NDI5NDk2NzA0MH1mb3IoYT0wO2E8PWg7YSs9MSl2W2FdPWJbYV1eOTA5NTIyNDg2LHdbYV09YlthXV4xNTQ5NTU2ODI4O2w9cSh2LGwpO2U9bTtJPSEwfTt0aGlzLnVwZGF0ZT1mdW5jdGlvbihhKXt2YXIgYyxiLGssZj0wLGc9bT4+PjU7Yz1kKGEsaCxuKTthPWMuYmluTGVuO2I9Yy52YWx1ZTtjPWE+Pj41O2ZvcihrPTA7azxjO2srPWcpZittPD1hJiYobD1xKGIuc2xpY2UoayxrK2cpLGwpLGYrPW0pO2UrPWY7aD1iLnNsaWNlKGY+Pj41KTtuPWElbTt5PSEwfTt0aGlzLmdldEhhc2g9ZnVuY3Rpb24oYSxiKXt2YXIgayxnLGQsbTtpZighMD09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRIYXNoIGFmdGVyIHNldHRpbmcgSE1BQyBrZXlcIik7ZD1OKGIpO2lmKCEwPT09eil7aWYoLTE9PT1kLnNoYWtlTGVuKXRocm93IEVycm9yKFwic2hha2VMZW4gbXVzdCBiZSBzcGVjaWZpZWQgaW4gb3B0aW9uc1wiKTtcbmY9ZC5zaGFrZUxlbn1zd2l0Y2goYSl7Y2FzZSBcIkhFWFwiOms9ZnVuY3Rpb24oYSl7cmV0dXJuIE8oYSxmLHgsZCl9O2JyZWFrO2Nhc2UgXCJCNjRcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBQKGEsZix4LGQpfTticmVhaztjYXNlIFwiQllURVNcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBRKGEsZix4KX07YnJlYWs7Y2FzZSBcIkFSUkFZQlVGRkVSXCI6dHJ5e2c9bmV3IEFycmF5QnVmZmVyKDApfWNhdGNoKHApe3Rocm93IEVycm9yKFwiQVJSQVlCVUZGRVIgbm90IHN1cHBvcnRlZCBieSB0aGlzIGVudmlyb25tZW50XCIpO31rPWZ1bmN0aW9uKGEpe3JldHVybiBSKGEsZix4KX07YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcImZvcm1hdCBtdXN0IGJlIEhFWCwgQjY0LCBCWVRFUywgb3IgQVJSQVlCVUZGRVJcIik7fW09dShoLnNsaWNlKCksbixlLHIobCksZik7Zm9yKGc9MTtnPHQ7Zys9MSkhMD09PXomJjAhPT1mJTMyJiYobVttLmxlbmd0aC0xXSY9MTY3NzcyMTU+Pj4yNC1mJTMyKSxtPXUobSxmLFxuMCxBKGMpLGYpO3JldHVybiBrKG0pfTt0aGlzLmdldEhNQUM9ZnVuY3Rpb24oYSxiKXt2YXIgayxnLGQscDtpZighMT09PUkpdGhyb3cgRXJyb3IoXCJDYW5ub3QgY2FsbCBnZXRITUFDIHdpdGhvdXQgZmlyc3Qgc2V0dGluZyBITUFDIGtleVwiKTtkPU4oYik7c3dpdGNoKGEpe2Nhc2UgXCJIRVhcIjprPWZ1bmN0aW9uKGEpe3JldHVybiBPKGEsZix4LGQpfTticmVhaztjYXNlIFwiQjY0XCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUChhLGYseCxkKX07YnJlYWs7Y2FzZSBcIkJZVEVTXCI6az1mdW5jdGlvbihhKXtyZXR1cm4gUShhLGYseCl9O2JyZWFrO2Nhc2UgXCJBUlJBWUJVRkZFUlwiOnRyeXtrPW5ldyBBcnJheUJ1ZmZlcigwKX1jYXRjaCh2KXt0aHJvdyBFcnJvcihcIkFSUkFZQlVGRkVSIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBlbnZpcm9ubWVudFwiKTt9az1mdW5jdGlvbihhKXtyZXR1cm4gUihhLGYseCl9O2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJvdXRwdXRGb3JtYXQgbXVzdCBiZSBIRVgsIEI2NCwgQllURVMsIG9yIEFSUkFZQlVGRkVSXCIpO1xufWc9dShoLnNsaWNlKCksbixlLHIobCksZik7cD1xKHcsQShjKSk7cD11KGcsZixtLHAsZik7cmV0dXJuIGsocCl9fWZ1bmN0aW9uIGIoYyxhKXt0aGlzLmE9Yzt0aGlzLmI9YX1mdW5jdGlvbiBPKGMsYSxiLGUpe3ZhciBoPVwiXCI7YS89ODt2YXIgbixnLGQ7ZD0tMT09PWI/MzowO2ZvcihuPTA7bjxhO24rPTEpZz1jW24+Pj4yXT4+PjgqKGQrbiU0KmIpLGgrPVwiMDEyMzQ1Njc4OWFiY2RlZlwiLmNoYXJBdChnPj4+NCYxNSkrXCIwMTIzNDU2Nzg5YWJjZGVmXCIuY2hhckF0KGcmMTUpO3JldHVybiBlLm91dHB1dFVwcGVyP2gudG9VcHBlckNhc2UoKTpofWZ1bmN0aW9uIFAoYyxhLGIsZSl7dmFyIGg9XCJcIixuPWEvOCxnLGQscCxmO2Y9LTE9PT1iPzM6MDtmb3IoZz0wO2c8bjtnKz0zKWZvcihkPWcrMTxuP2NbZysxPj4+Ml06MCxwPWcrMjxuP2NbZysyPj4+Ml06MCxwPShjW2c+Pj4yXT4+PjgqKGYrZyU0KmIpJjI1NSk8PDE2fChkPj4+OCooZisoZysxKSU0KmIpJjI1NSk8PDh8cD4+PjgqKGYrXG4oZysyKSU0KmIpJjI1NSxkPTA7ND5kO2QrPTEpOCpnKzYqZDw9YT9oKz1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIi5jaGFyQXQocD4+PjYqKDMtZCkmNjMpOmgrPWUuYjY0UGFkO3JldHVybiBofWZ1bmN0aW9uIFEoYyxhLGIpe3ZhciBlPVwiXCI7YS89ODt2YXIgaCxkLGc7Zz0tMT09PWI/MzowO2ZvcihoPTA7aDxhO2grPTEpZD1jW2g+Pj4yXT4+PjgqKGcraCU0KmIpJjI1NSxlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGQpO3JldHVybiBlfWZ1bmN0aW9uIFIoYyxhLGIpe2EvPTg7dmFyIGUsaD1uZXcgQXJyYXlCdWZmZXIoYSksZCxnO2c9bmV3IFVpbnQ4QXJyYXkoaCk7ZD0tMT09PWI/MzowO2ZvcihlPTA7ZTxhO2UrPTEpZ1tlXT1jW2U+Pj4yXT4+PjgqKGQrZSU0KmIpJjI1NTtyZXR1cm4gaH1mdW5jdGlvbiBOKGMpe3ZhciBhPXtvdXRwdXRVcHBlcjohMSxiNjRQYWQ6XCI9XCIsc2hha2VMZW46LTF9O2M9Y3x8e307XG5hLm91dHB1dFVwcGVyPWMub3V0cHV0VXBwZXJ8fCExOyEwPT09Yy5oYXNPd25Qcm9wZXJ0eShcImI2NFBhZFwiKSYmKGEuYjY0UGFkPWMuYjY0UGFkKTtpZighMD09PWMuaGFzT3duUHJvcGVydHkoXCJzaGFrZUxlblwiKSl7aWYoMCE9PWMuc2hha2VMZW4lOCl0aHJvdyBFcnJvcihcInNoYWtlTGVuIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA4XCIpO2Euc2hha2VMZW49Yy5zaGFrZUxlbn1pZihcImJvb2xlYW5cIiE9PXR5cGVvZiBhLm91dHB1dFVwcGVyKXRocm93IEVycm9yKFwiSW52YWxpZCBvdXRwdXRVcHBlciBmb3JtYXR0aW5nIG9wdGlvblwiKTtpZihcInN0cmluZ1wiIT09dHlwZW9mIGEuYjY0UGFkKXRocm93IEVycm9yKFwiSW52YWxpZCBiNjRQYWQgZm9ybWF0dGluZyBvcHRpb25cIik7cmV0dXJuIGF9ZnVuY3Rpb24gTShjLGEsYil7c3dpdGNoKGEpe2Nhc2UgXCJVVEY4XCI6Y2FzZSBcIlVURjE2QkVcIjpjYXNlIFwiVVRGMTZMRVwiOmJyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJlbmNvZGluZyBtdXN0IGJlIFVURjgsIFVURjE2QkUsIG9yIFVURjE2TEVcIik7XG59c3dpdGNoKGMpe2Nhc2UgXCJIRVhcIjpjPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZz1hLmxlbmd0aCxsLHAsZixtLHEsdTtpZigwIT09ZyUyKXRocm93IEVycm9yKFwiU3RyaW5nIG9mIEhFWCB0eXBlIG11c3QgYmUgaW4gYnl0ZSBpbmNyZW1lbnRzXCIpO2M9Y3x8WzBdO2Q9ZHx8MDtxPWQ+Pj4zO3U9LTE9PT1iPzM6MDtmb3IobD0wO2w8ZztsKz0yKXtwPXBhcnNlSW50KGEuc3Vic3RyKGwsMiksMTYpO2lmKGlzTmFOKHApKXRocm93IEVycm9yKFwiU3RyaW5nIG9mIEhFWCB0eXBlIGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVyc1wiKTttPShsPj4+MSkrcTtmb3IoZj1tPj4+MjtjLmxlbmd0aDw9ZjspYy5wdXNoKDApO2NbZl18PXA8PDgqKHUrbSU0KmIpfXJldHVybnt2YWx1ZTpjLGJpbkxlbjo0KmcrZH19O2JyZWFrO2Nhc2UgXCJURVhUXCI6Yz1mdW5jdGlvbihjLGgsZCl7dmFyIGcsbCxwPTAsZixtLHEsdSxyLHQ7aD1ofHxbMF07ZD1kfHwwO3E9ZD4+PjM7aWYoXCJVVEY4XCI9PT1hKWZvcih0PS0xPT09XG5iPzM6MCxmPTA7ZjxjLmxlbmd0aDtmKz0xKWZvcihnPWMuY2hhckNvZGVBdChmKSxsPVtdLDEyOD5nP2wucHVzaChnKToyMDQ4Pmc/KGwucHVzaCgxOTJ8Zz4+PjYpLGwucHVzaCgxMjh8ZyY2MykpOjU1Mjk2Pmd8fDU3MzQ0PD1nP2wucHVzaCgyMjR8Zz4+PjEyLDEyOHxnPj4+NiY2MywxMjh8ZyY2Myk6KGYrPTEsZz02NTUzNisoKGcmMTAyMyk8PDEwfGMuY2hhckNvZGVBdChmKSYxMDIzKSxsLnB1c2goMjQwfGc+Pj4xOCwxMjh8Zz4+PjEyJjYzLDEyOHxnPj4+NiY2MywxMjh8ZyY2MykpLG09MDttPGwubGVuZ3RoO20rPTEpe3I9cCtxO2Zvcih1PXI+Pj4yO2gubGVuZ3RoPD11OyloLnB1c2goMCk7aFt1XXw9bFttXTw8OCoodCtyJTQqYik7cCs9MX1lbHNlIGlmKFwiVVRGMTZCRVwiPT09YXx8XCJVVEYxNkxFXCI9PT1hKWZvcih0PS0xPT09Yj8yOjAsbD1cIlVURjE2TEVcIj09PWEmJjEhPT1ifHxcIlVURjE2TEVcIiE9PWEmJjE9PT1iLGY9MDtmPGMubGVuZ3RoO2YrPTEpe2c9Yy5jaGFyQ29kZUF0KGYpO1xuITA9PT1sJiYobT1nJjI1NSxnPW08PDh8Zz4+PjgpO3I9cCtxO2Zvcih1PXI+Pj4yO2gubGVuZ3RoPD11OyloLnB1c2goMCk7aFt1XXw9Zzw8OCoodCtyJTQqYik7cCs9Mn1yZXR1cm57dmFsdWU6aCxiaW5MZW46OCpwK2R9fTticmVhaztjYXNlIFwiQjY0XCI6Yz1mdW5jdGlvbihhLGMsZCl7dmFyIGc9MCxsLHAsZixtLHEsdSxyLHQ7aWYoLTE9PT1hLnNlYXJjaCgvXlthLXpBLVowLTk9K1xcL10rJC8pKXRocm93IEVycm9yKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gYmFzZS02NCBzdHJpbmdcIik7cD1hLmluZGV4T2YoXCI9XCIpO2E9YS5yZXBsYWNlKC9cXD0vZyxcIlwiKTtpZigtMSE9PXAmJnA8YS5sZW5ndGgpdGhyb3cgRXJyb3IoXCJJbnZhbGlkICc9JyBmb3VuZCBpbiBiYXNlLTY0IHN0cmluZ1wiKTtjPWN8fFswXTtkPWR8fDA7dT1kPj4+Mzt0PS0xPT09Yj8zOjA7Zm9yKHA9MDtwPGEubGVuZ3RoO3ArPTQpe3E9YS5zdWJzdHIocCw0KTtmb3IoZj1tPTA7ZjxxLmxlbmd0aDtmKz0xKWw9XCJBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvXCIuaW5kZXhPZihxW2ZdKSxcbm18PWw8PDE4LTYqZjtmb3IoZj0wO2Y8cS5sZW5ndGgtMTtmKz0xKXtyPWcrdTtmb3IobD1yPj4+MjtjLmxlbmd0aDw9bDspYy5wdXNoKDApO2NbbF18PShtPj4+MTYtOCpmJjI1NSk8PDgqKHQrciU0KmIpO2crPTF9fXJldHVybnt2YWx1ZTpjLGJpbkxlbjo4KmcrZH19O2JyZWFrO2Nhc2UgXCJCWVRFU1wiOmM9ZnVuY3Rpb24oYSxjLGQpe3ZhciBnLGwscCxmLG0scTtjPWN8fFswXTtkPWR8fDA7cD1kPj4+MztxPS0xPT09Yj8zOjA7Zm9yKGw9MDtsPGEubGVuZ3RoO2wrPTEpZz1hLmNoYXJDb2RlQXQobCksbT1sK3AsZj1tPj4+MixjLmxlbmd0aDw9ZiYmYy5wdXNoKDApLGNbZl18PWc8PDgqKHErbSU0KmIpO3JldHVybnt2YWx1ZTpjLGJpbkxlbjo4KmEubGVuZ3RoK2R9fTticmVhaztjYXNlIFwiQVJSQVlCVUZGRVJcIjp0cnl7Yz1uZXcgQXJyYXlCdWZmZXIoMCl9Y2F0Y2goZSl7dGhyb3cgRXJyb3IoXCJBUlJBWUJVRkZFUiBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgZW52aXJvbm1lbnRcIik7fWM9XG5mdW5jdGlvbihhLGMsZCl7dmFyIGcsbCxwLGYsbSxxO2M9Y3x8WzBdO2Q9ZHx8MDtsPWQ+Pj4zO209LTE9PT1iPzM6MDtxPW5ldyBVaW50OEFycmF5KGEpO2ZvcihnPTA7ZzxhLmJ5dGVMZW5ndGg7Zys9MSlmPWcrbCxwPWY+Pj4yLGMubGVuZ3RoPD1wJiZjLnB1c2goMCksY1twXXw9cVtnXTw8OCoobStmJTQqYik7cmV0dXJue3ZhbHVlOmMsYmluTGVuOjgqYS5ieXRlTGVuZ3RoK2R9fTticmVhaztkZWZhdWx0OnRocm93IEVycm9yKFwiZm9ybWF0IG11c3QgYmUgSEVYLCBURVhULCBCNjQsIEJZVEVTLCBvciBBUlJBWUJVRkZFUlwiKTt9cmV0dXJuIGN9ZnVuY3Rpb24geShjLGEpe3JldHVybiBjPDxhfGM+Pj4zMi1hfWZ1bmN0aW9uIFMoYyxhKXtyZXR1cm4gMzI8YT8oYS09MzIsbmV3IGIoYy5iPDxhfGMuYT4+PjMyLWEsYy5hPDxhfGMuYj4+PjMyLWEpKTowIT09YT9uZXcgYihjLmE8PGF8Yy5iPj4+MzItYSxjLmI8PGF8Yy5hPj4+MzItYSk6Y31mdW5jdGlvbiB3KGMsYSl7cmV0dXJuIGM+Pj5cbmF8Yzw8MzItYX1mdW5jdGlvbiB0KGMsYSl7dmFyIGs9bnVsbCxrPW5ldyBiKGMuYSxjLmIpO3JldHVybiBrPTMyPj1hP25ldyBiKGsuYT4+PmF8ay5iPDwzMi1hJjQyOTQ5NjcyOTUsay5iPj4+YXxrLmE8PDMyLWEmNDI5NDk2NzI5NSk6bmV3IGIoay5iPj4+YS0zMnxrLmE8PDY0LWEmNDI5NDk2NzI5NSxrLmE+Pj5hLTMyfGsuYjw8NjQtYSY0Mjk0OTY3Mjk1KX1mdW5jdGlvbiBUKGMsYSl7dmFyIGs9bnVsbDtyZXR1cm4gaz0zMj49YT9uZXcgYihjLmE+Pj5hLGMuYj4+PmF8Yy5hPDwzMi1hJjQyOTQ5NjcyOTUpOm5ldyBiKDAsYy5hPj4+YS0zMil9ZnVuY3Rpb24gYWEoYyxhLGIpe3JldHVybiBjJmFefmMmYn1mdW5jdGlvbiBiYShjLGEsayl7cmV0dXJuIG5ldyBiKGMuYSZhLmFefmMuYSZrLmEsYy5iJmEuYl5+Yy5iJmsuYil9ZnVuY3Rpb24gVShjLGEsYil7cmV0dXJuIGMmYV5jJmJeYSZifWZ1bmN0aW9uIGNhKGMsYSxrKXtyZXR1cm4gbmV3IGIoYy5hJmEuYV5jLmEmay5hXmEuYSZcbmsuYSxjLmImYS5iXmMuYiZrLmJeYS5iJmsuYil9ZnVuY3Rpb24gZGEoYyl7cmV0dXJuIHcoYywyKV53KGMsMTMpXncoYywyMil9ZnVuY3Rpb24gZWEoYyl7dmFyIGE9dChjLDI4KSxrPXQoYywzNCk7Yz10KGMsMzkpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gZmEoYyl7cmV0dXJuIHcoYyw2KV53KGMsMTEpXncoYywyNSl9ZnVuY3Rpb24gZ2EoYyl7dmFyIGE9dChjLDE0KSxrPXQoYywxOCk7Yz10KGMsNDEpO3JldHVybiBuZXcgYihhLmFeay5hXmMuYSxhLmJeay5iXmMuYil9ZnVuY3Rpb24gaGEoYyl7cmV0dXJuIHcoYyw3KV53KGMsMTgpXmM+Pj4zfWZ1bmN0aW9uIGlhKGMpe3ZhciBhPXQoYywxKSxrPXQoYyw4KTtjPVQoYyw3KTtyZXR1cm4gbmV3IGIoYS5hXmsuYV5jLmEsYS5iXmsuYl5jLmIpfWZ1bmN0aW9uIGphKGMpe3JldHVybiB3KGMsMTcpXncoYywxOSleYz4+PjEwfWZ1bmN0aW9uIGthKGMpe3ZhciBhPXQoYywxOSksaz10KGMsNjEpO1xuYz1UKGMsNik7cmV0dXJuIG5ldyBiKGEuYV5rLmFeYy5hLGEuYl5rLmJeYy5iKX1mdW5jdGlvbiBHKGMsYSl7dmFyIGI9KGMmNjU1MzUpKyhhJjY1NTM1KTtyZXR1cm4oKGM+Pj4xNikrKGE+Pj4xNikrKGI+Pj4xNikmNjU1MzUpPDwxNnxiJjY1NTM1fWZ1bmN0aW9uIGxhKGMsYSxiLGUpe3ZhciBoPShjJjY1NTM1KSsoYSY2NTUzNSkrKGImNjU1MzUpKyhlJjY1NTM1KTtyZXR1cm4oKGM+Pj4xNikrKGE+Pj4xNikrKGI+Pj4xNikrKGU+Pj4xNikrKGg+Pj4xNikmNjU1MzUpPDwxNnxoJjY1NTM1fWZ1bmN0aW9uIEgoYyxhLGIsZSxoKXt2YXIgZD0oYyY2NTUzNSkrKGEmNjU1MzUpKyhiJjY1NTM1KSsoZSY2NTUzNSkrKGgmNjU1MzUpO3JldHVybigoYz4+PjE2KSsoYT4+PjE2KSsoYj4+PjE2KSsoZT4+PjE2KSsoaD4+PjE2KSsoZD4+PjE2KSY2NTUzNSk8PDE2fGQmNjU1MzV9ZnVuY3Rpb24gbWEoYyxhKXt2YXIgZCxlLGg7ZD0oYy5iJjY1NTM1KSsoYS5iJjY1NTM1KTtlPShjLmI+Pj4xNikrXG4oYS5iPj4+MTYpKyhkPj4+MTYpO2g9KGUmNjU1MzUpPDwxNnxkJjY1NTM1O2Q9KGMuYSY2NTUzNSkrKGEuYSY2NTUzNSkrKGU+Pj4xNik7ZT0oYy5hPj4+MTYpKyhhLmE+Pj4xNikrKGQ+Pj4xNik7cmV0dXJuIG5ldyBiKChlJjY1NTM1KTw8MTZ8ZCY2NTUzNSxoKX1mdW5jdGlvbiBuYShjLGEsZCxlKXt2YXIgaCxuLGc7aD0oYy5iJjY1NTM1KSsoYS5iJjY1NTM1KSsoZC5iJjY1NTM1KSsoZS5iJjY1NTM1KTtuPShjLmI+Pj4xNikrKGEuYj4+PjE2KSsoZC5iPj4+MTYpKyhlLmI+Pj4xNikrKGg+Pj4xNik7Zz0obiY2NTUzNSk8PDE2fGgmNjU1MzU7aD0oYy5hJjY1NTM1KSsoYS5hJjY1NTM1KSsoZC5hJjY1NTM1KSsoZS5hJjY1NTM1KSsobj4+PjE2KTtuPShjLmE+Pj4xNikrKGEuYT4+PjE2KSsoZC5hPj4+MTYpKyhlLmE+Pj4xNikrKGg+Pj4xNik7cmV0dXJuIG5ldyBiKChuJjY1NTM1KTw8MTZ8aCY2NTUzNSxnKX1mdW5jdGlvbiBvYShjLGEsZCxlLGgpe3ZhciBuLGcsbDtuPShjLmImXG42NTUzNSkrKGEuYiY2NTUzNSkrKGQuYiY2NTUzNSkrKGUuYiY2NTUzNSkrKGguYiY2NTUzNSk7Zz0oYy5iPj4+MTYpKyhhLmI+Pj4xNikrKGQuYj4+PjE2KSsoZS5iPj4+MTYpKyhoLmI+Pj4xNikrKG4+Pj4xNik7bD0oZyY2NTUzNSk8PDE2fG4mNjU1MzU7bj0oYy5hJjY1NTM1KSsoYS5hJjY1NTM1KSsoZC5hJjY1NTM1KSsoZS5hJjY1NTM1KSsoaC5hJjY1NTM1KSsoZz4+PjE2KTtnPShjLmE+Pj4xNikrKGEuYT4+PjE2KSsoZC5hPj4+MTYpKyhlLmE+Pj4xNikrKGguYT4+PjE2KSsobj4+PjE2KTtyZXR1cm4gbmV3IGIoKGcmNjU1MzUpPDwxNnxuJjY1NTM1LGwpfWZ1bmN0aW9uIEIoYyxhKXtyZXR1cm4gbmV3IGIoYy5hXmEuYSxjLmJeYS5iKX1mdW5jdGlvbiBBKGMpe3ZhciBhPVtdLGQ7aWYoXCJTSEEtMVwiPT09YylhPVsxNzMyNTg0MTkzLDQwMjMyMzM0MTcsMjU2MjM4MzEwMiwyNzE3MzM4NzgsMzI4NTM3NzUyMF07ZWxzZSBpZigwPT09Yy5sYXN0SW5kZXhPZihcIlNIQS1cIiwwKSlzd2l0Y2goYT1cblszMjM4MzcxMDMyLDkxNDE1MDY2Myw4MTI3MDI5OTksNDE0NDkxMjY5Nyw0MjkwNzc1ODU3LDE3NTA2MDMwMjUsMTY5NDA3NjgzOSwzMjA0MDc1NDI4XSxkPVsxNzc5MDMzNzAzLDMxNDQxMzQyNzcsMTAxMzkwNDI0MiwyNzczNDgwNzYyLDEzNTk4OTMxMTksMjYwMDgyMjkyNCw1Mjg3MzQ2MzUsMTU0MTQ1OTIyNV0sYyl7Y2FzZSBcIlNIQS0yMjRcIjpicmVhaztjYXNlIFwiU0hBLTI1NlwiOmE9ZDticmVhaztjYXNlIFwiU0hBLTM4NFwiOmE9W25ldyBiKDM0MTgwNzAzNjUsYVswXSksbmV3IGIoMTY1NDI3MDI1MCxhWzFdKSxuZXcgYigyNDM4NTI5MzcwLGFbMl0pLG5ldyBiKDM1NTQ2MjM2MCxhWzNdKSxuZXcgYigxNzMxNDA1NDE1LGFbNF0pLG5ldyBiKDQxMDQ4ODg1ODk1LGFbNV0pLG5ldyBiKDM2NzUwMDg1MjUsYVs2XSksbmV3IGIoMTIwMzA2MjgxMyxhWzddKV07YnJlYWs7Y2FzZSBcIlNIQS01MTJcIjphPVtuZXcgYihkWzBdLDQwODkyMzU3MjApLG5ldyBiKGRbMV0sMjIyNzg3MzU5NSksXG5uZXcgYihkWzJdLDQyNzExNzU3MjMpLG5ldyBiKGRbM10sMTU5NTc1MDEyOSksbmV3IGIoZFs0XSwyOTE3NTY1MTM3KSxuZXcgYihkWzVdLDcyNTUxMTE5OSksbmV3IGIoZFs2XSw0MjE1Mzg5NTQ3KSxuZXcgYihkWzddLDMyNzAzMzIwOSldO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJVbmtub3duIFNIQSB2YXJpYW50XCIpO31lbHNlIGlmKDA9PT1jLmxhc3RJbmRleE9mKFwiU0hBMy1cIiwwKXx8MD09PWMubGFzdEluZGV4T2YoXCJTSEFLRVwiLDApKWZvcihjPTA7NT5jO2MrPTEpYVtjXT1bbmV3IGIoMCwwKSxuZXcgYigwLDApLG5ldyBiKDAsMCksbmV3IGIoMCwwKSxuZXcgYigwLDApXTtlbHNlIHRocm93IEVycm9yKFwiTm8gU0hBIHZhcmlhbnRzIHN1cHBvcnRlZFwiKTtyZXR1cm4gYX1mdW5jdGlvbiBLKGMsYSl7dmFyIGI9W10sZSxkLG4sZyxsLHAsZjtlPWFbMF07ZD1hWzFdO249YVsyXTtnPWFbM107bD1hWzRdO2ZvcihmPTA7ODA+ZjtmKz0xKWJbZl09MTY+Zj9jW2ZdOnkoYltmLVxuM11eYltmLThdXmJbZi0xNF1eYltmLTE2XSwxKSxwPTIwPmY/SCh5KGUsNSksZCZuXn5kJmcsbCwxNTE4NTAwMjQ5LGJbZl0pOjQwPmY/SCh5KGUsNSksZF5uXmcsbCwxODU5Nzc1MzkzLGJbZl0pOjYwPmY/SCh5KGUsNSksVShkLG4sZyksbCwyNDAwOTU5NzA4LGJbZl0pOkgoeShlLDUpLGRebl5nLGwsMzM5NTQ2OTc4MixiW2ZdKSxsPWcsZz1uLG49eShkLDMwKSxkPWUsZT1wO2FbMF09RyhlLGFbMF0pO2FbMV09RyhkLGFbMV0pO2FbMl09RyhuLGFbMl0pO2FbM109RyhnLGFbM10pO2FbNF09RyhsLGFbNF0pO3JldHVybiBhfWZ1bmN0aW9uIFooYyxhLGIsZSl7dmFyIGQ7Zm9yKGQ9KGErNjU+Pj45PDw0KSsxNTtjLmxlbmd0aDw9ZDspYy5wdXNoKDApO2NbYT4+PjVdfD0xMjg8PDI0LWElMzI7YSs9YjtjW2RdPWEmNDI5NDk2NzI5NTtjW2QtMV09YS80Mjk0OTY3Mjk2fDA7YT1jLmxlbmd0aDtmb3IoZD0wO2Q8YTtkKz0xNillPUsoYy5zbGljZShkLGQrMTYpLGUpO3JldHVybiBlfWZ1bmN0aW9uIEwoYyxcbmEsayl7dmFyIGUsaCxuLGcsbCxwLGYsbSxxLHUscix0LHYsdyx5LEEseix4LEYsQixDLEQsRT1bXSxKO2lmKFwiU0hBLTIyNFwiPT09a3x8XCJTSEEtMjU2XCI9PT1rKXU9NjQsdD0xLEQ9TnVtYmVyLHY9Ryx3PWxhLHk9SCxBPWhhLHo9amEseD1kYSxGPWZhLEM9VSxCPWFhLEo9ZDtlbHNlIGlmKFwiU0hBLTM4NFwiPT09a3x8XCJTSEEtNTEyXCI9PT1rKXU9ODAsdD0yLEQ9Yix2PW1hLHc9bmEseT1vYSxBPWlhLHo9a2EseD1lYSxGPWdhLEM9Y2EsQj1iYSxKPVY7ZWxzZSB0aHJvdyBFcnJvcihcIlVuZXhwZWN0ZWQgZXJyb3IgaW4gU0hBLTIgaW1wbGVtZW50YXRpb25cIik7az1hWzBdO2U9YVsxXTtoPWFbMl07bj1hWzNdO2c9YVs0XTtsPWFbNV07cD1hWzZdO2Y9YVs3XTtmb3Iocj0wO3I8dTtyKz0xKTE2PnI/KHE9cip0LG09Yy5sZW5ndGg8PXE/MDpjW3FdLHE9Yy5sZW5ndGg8PXErMT8wOmNbcSsxXSxFW3JdPW5ldyBEKG0scSkpOkVbcl09dyh6KEVbci0yXSksRVtyLTddLEEoRVtyLTE1XSksRVtyLVxuMTZdKSxtPXkoZixGKGcpLEIoZyxsLHApLEpbcl0sRVtyXSkscT12KHgoayksQyhrLGUsaCkpLGY9cCxwPWwsbD1nLGc9dihuLG0pLG49aCxoPWUsZT1rLGs9dihtLHEpO2FbMF09dihrLGFbMF0pO2FbMV09dihlLGFbMV0pO2FbMl09dihoLGFbMl0pO2FbM109dihuLGFbM10pO2FbNF09dihnLGFbNF0pO2FbNV09dihsLGFbNV0pO2FbNl09dihwLGFbNl0pO2FbN109dihmLGFbN10pO3JldHVybiBhfWZ1bmN0aW9uIEQoYyxhKXt2YXIgZCxlLGgsbixnPVtdLGw9W107aWYobnVsbCE9PWMpZm9yKGU9MDtlPGMubGVuZ3RoO2UrPTIpYVsoZT4+PjEpJTVdWyhlPj4+MSkvNXwwXT1CKGFbKGU+Pj4xKSU1XVsoZT4+PjEpLzV8MF0sbmV3IGIoY1tlKzFdLGNbZV0pKTtmb3IoZD0wOzI0PmQ7ZCs9MSl7bj1BKFwiU0hBMy1cIik7Zm9yKGU9MDs1PmU7ZSs9MSl7aD1hW2VdWzBdO3ZhciBwPWFbZV1bMV0sZj1hW2VdWzJdLG09YVtlXVszXSxxPWFbZV1bNF07Z1tlXT1uZXcgYihoLmFecC5hXmYuYV5cbm0uYV5xLmEsaC5iXnAuYl5mLmJebS5iXnEuYil9Zm9yKGU9MDs1PmU7ZSs9MSlsW2VdPUIoZ1soZSs0KSU1XSxTKGdbKGUrMSklNV0sMSkpO2ZvcihlPTA7NT5lO2UrPTEpZm9yKGg9MDs1Pmg7aCs9MSlhW2VdW2hdPUIoYVtlXVtoXSxsW2VdKTtmb3IoZT0wOzU+ZTtlKz0xKWZvcihoPTA7NT5oO2grPTEpbltoXVsoMiplKzMqaCklNV09UyhhW2VdW2hdLFdbZV1baF0pO2ZvcihlPTA7NT5lO2UrPTEpZm9yKGg9MDs1Pmg7aCs9MSlhW2VdW2hdPUIobltlXVtoXSxuZXcgYih+blsoZSsxKSU1XVtoXS5hJm5bKGUrMiklNV1baF0uYSx+blsoZSsxKSU1XVtoXS5iJm5bKGUrMiklNV1baF0uYikpO2FbMF1bMF09QihhWzBdWzBdLFhbZF0pfXJldHVybiBhfXZhciBkLFYsVyxYO2Q9WzExMTYzNTI0MDgsMTg5OTQ0NzQ0MSwzMDQ5MzIzNDcxLDM5MjEwMDk1NzMsOTYxOTg3MTYzLDE1MDg5NzA5OTMsMjQ1MzYzNTc0OCwyODcwNzYzMjIxLDM2MjQzODEwODAsMzEwNTk4NDAxLDYwNzIyNTI3OCxcbjE0MjY4ODE5ODcsMTkyNTA3ODM4OCwyMTYyMDc4MjA2LDI2MTQ4ODgxMDMsMzI0ODIyMjU4MCwzODM1MzkwNDAxLDQwMjIyMjQ3NzQsMjY0MzQ3MDc4LDYwNDgwNzYyOCw3NzAyNTU5ODMsMTI0OTE1MDEyMiwxNTU1MDgxNjkyLDE5OTYwNjQ5ODYsMjU1NDIyMDg4MiwyODIxODM0MzQ5LDI5NTI5OTY4MDgsMzIxMDMxMzY3MSwzMzM2NTcxODkxLDM1ODQ1Mjg3MTEsMTEzOTI2OTkzLDMzODI0MTg5NSw2NjYzMDcyMDUsNzczNTI5OTEyLDEyOTQ3NTczNzIsMTM5NjE4MjI5MSwxNjk1MTgzNzAwLDE5ODY2NjEwNTEsMjE3NzAyNjM1MCwyNDU2OTU2MDM3LDI3MzA0ODU5MjEsMjgyMDMwMjQxMSwzMjU5NzMwODAwLDMzNDU3NjQ3NzEsMzUxNjA2NTgxNywzNjAwMzUyODA0LDQwOTQ1NzE5MDksMjc1NDIzMzQ0LDQzMDIyNzczNCw1MDY5NDg2MTYsNjU5MDYwNTU2LDg4Mzk5Nzg3Nyw5NTgxMzk1NzEsMTMyMjgyMjIxOCwxNTM3MDAyMDYzLDE3NDc4NzM3NzksMTk1NTU2MjIyMiwyMDI0MTA0ODE1LFxuMjIyNzczMDQ1MiwyMzYxODUyNDI0LDI0Mjg0MzY0NzQsMjc1NjczNDE4NywzMjA0MDMxNDc5LDMzMjkzMjUyOThdO1Y9W25ldyBiKGRbMF0sMzYwOTc2NzQ1OCksbmV3IGIoZFsxXSw2MDI4OTE3MjUpLG5ldyBiKGRbMl0sMzk2NDQ4NDM5OSksbmV3IGIoZFszXSwyMTczMjk1NTQ4KSxuZXcgYihkWzRdLDQwODE2Mjg0NzIpLG5ldyBiKGRbNV0sMzA1MzgzNDI2NSksbmV3IGIoZFs2XSwyOTM3NjcxNTc5KSxuZXcgYihkWzddLDM2NjQ2MDk1NjApLG5ldyBiKGRbOF0sMjczNDg4MzM5NCksbmV3IGIoZFs5XSwxMTY0OTk2NTQyKSxuZXcgYihkWzEwXSwxMzIzNjEwNzY0KSxuZXcgYihkWzExXSwzNTkwMzA0OTk0KSxuZXcgYihkWzEyXSw0MDY4MTgyMzgzKSxuZXcgYihkWzEzXSw5OTEzMzYxMTMpLG5ldyBiKGRbMTRdLDYzMzgwMzMxNyksbmV3IGIoZFsxNV0sMzQ3OTc3NDg2OCksbmV3IGIoZFsxNl0sMjY2NjYxMzQ1OCksbmV3IGIoZFsxN10sOTQ0NzExMTM5KSxuZXcgYihkWzE4XSwyMzQxMjYyNzczKSxcbm5ldyBiKGRbMTldLDIwMDc4MDA5MzMpLG5ldyBiKGRbMjBdLDE0OTU5OTA5MDEpLG5ldyBiKGRbMjFdLDE4NTY0MzEyMzUpLG5ldyBiKGRbMjJdLDMxNzUyMTgxMzIpLG5ldyBiKGRbMjNdLDIxOTg5NTA4MzcpLG5ldyBiKGRbMjRdLDM5OTk3MTkzMzkpLG5ldyBiKGRbMjVdLDc2Njc4NDAxNiksbmV3IGIoZFsyNl0sMjU2NjU5NDg3OSksbmV3IGIoZFsyN10sMzIwMzMzNzk1NiksbmV3IGIoZFsyOF0sMTAzNDQ1NzAyNiksbmV3IGIoZFsyOV0sMjQ2Njk0ODkwMSksbmV3IGIoZFszMF0sMzc1ODMyNjM4MyksbmV3IGIoZFszMV0sMTY4NzE3OTM2KSxuZXcgYihkWzMyXSwxMTg4MTc5OTY0KSxuZXcgYihkWzMzXSwxNTQ2MDQ1NzM0KSxuZXcgYihkWzM0XSwxNTIyODA1NDg1KSxuZXcgYihkWzM1XSwyNjQzODMzODIzKSxuZXcgYihkWzM2XSwyMzQzNTI3MzkwKSxuZXcgYihkWzM3XSwxMDE0NDc3NDgwKSxuZXcgYihkWzM4XSwxMjA2NzU5MTQyKSxuZXcgYihkWzM5XSwzNDQwNzc2MjcpLFxubmV3IGIoZFs0MF0sMTI5MDg2MzQ2MCksbmV3IGIoZFs0MV0sMzE1ODQ1NDI3MyksbmV3IGIoZFs0Ml0sMzUwNTk1MjY1NyksbmV3IGIoZFs0M10sMTA2MjE3MDA4KSxuZXcgYihkWzQ0XSwzNjA2MDA4MzQ0KSxuZXcgYihkWzQ1XSwxNDMyNzI1Nzc2KSxuZXcgYihkWzQ2XSwxNDY3MDMxNTk0KSxuZXcgYihkWzQ3XSw4NTExNjk3MjApLG5ldyBiKGRbNDhdLDMxMDA4MjM3NTIpLG5ldyBiKGRbNDldLDEzNjMyNTgxOTUpLG5ldyBiKGRbNTBdLDM3NTA2ODU1OTMpLG5ldyBiKGRbNTFdLDM3ODUwNTAyODApLG5ldyBiKGRbNTJdLDMzMTgzMDc0MjcpLG5ldyBiKGRbNTNdLDM4MTI3MjM0MDMpLG5ldyBiKGRbNTRdLDIwMDMwMzQ5OTUpLG5ldyBiKGRbNTVdLDM2MDIwMzY4OTkpLG5ldyBiKGRbNTZdLDE1NzU5OTAwMTIpLG5ldyBiKGRbNTddLDExMjU1OTI5MjgpLG5ldyBiKGRbNThdLDI3MTY5MDQzMDYpLG5ldyBiKGRbNTldLDQ0Mjc3NjA0NCksbmV3IGIoZFs2MF0sNTkzNjk4MzQ0KSxuZXcgYihkWzYxXSxcbjM3MzMxMTAyNDkpLG5ldyBiKGRbNjJdLDI5OTkzNTE1NzMpLG5ldyBiKGRbNjNdLDM4MTU5MjA0MjcpLG5ldyBiKDMzOTE1Njk2MTQsMzkyODM4MzkwMCksbmV3IGIoMzUxNTI2NzI3MSw1NjYyODA3MTEpLG5ldyBiKDM5NDAxODc2MDYsMzQ1NDA2OTUzNCksbmV3IGIoNDExODYzMDI3MSw0MDAwMjM5OTkyKSxuZXcgYigxMTY0MTg0NzQsMTkxNDEzODU1NCksbmV3IGIoMTc0MjkyNDIxLDI3MzEwNTUyNzApLG5ldyBiKDI4OTM4MDM1NiwzMjAzOTkzMDA2KSxuZXcgYig0NjAzOTMyNjksMzIwNjIwMzE1KSxuZXcgYig2ODU0NzE3MzMsNTg3NDk2ODM2KSxuZXcgYig4NTIxNDI5NzEsMTA4Njc5Mjg1MSksbmV3IGIoMTAxNzAzNjI5OCwzNjU1NDMxMDApLG5ldyBiKDExMjYwMDA1ODAsMjYxODI5NzY3NiksbmV3IGIoMTI4ODAzMzQ3MCwzNDA5ODU1MTU4KSxuZXcgYigxNTAxNTA1OTQ4LDQyMzQ1MDk4NjYpLG5ldyBiKDE2MDcxNjc5MTUsOTg3MTY3NDY4KSxuZXcgYigxODE2NDAyMzE2LFxuMTI0NjE4OTU5MSldO1g9W25ldyBiKDAsMSksbmV3IGIoMCwzMjg5OCksbmV3IGIoMjE0NzQ4MzY0OCwzMjkwNiksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NDE2KSxuZXcgYigwLDMyOTA3KSxuZXcgYigwLDIxNDc0ODM2NDkpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzUxNjU0NSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3NyksbmV3IGIoMCwxMzgpLG5ldyBiKDAsMTM2KSxuZXcgYigwLDIxNDc1MTY0MjUpLG5ldyBiKDAsMjE0NzQ4MzY1OCksbmV3IGIoMCwyMTQ3NTE2NTU1KSxuZXcgYigyMTQ3NDgzNjQ4LDEzOSksbmV3IGIoMjE0NzQ4MzY0OCwzMjkwNSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3MSksbmV3IGIoMjE0NzQ4MzY0OCwzMjc3MCksbmV3IGIoMjE0NzQ4MzY0OCwxMjgpLG5ldyBiKDAsMzI3NzgpLG5ldyBiKDIxNDc0ODM2NDgsMjE0NzQ4MzY1OCksbmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NTQ1KSxuZXcgYigyMTQ3NDgzNjQ4LDMyODk2KSxuZXcgYigwLDIxNDc0ODM2NDkpLFxubmV3IGIoMjE0NzQ4MzY0OCwyMTQ3NTE2NDI0KV07Vz1bWzAsMzYsMyw0MSwxOF0sWzEsNDQsMTAsNDUsMl0sWzYyLDYsNDMsMTUsNjFdLFsyOCw1NSwyNSwyMSw1Nl0sWzI3LDIwLDM5LDgsMTRdXTtcImZ1bmN0aW9uXCI9PT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShmdW5jdGlvbigpe3JldHVybiBDfSk6XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBleHBvcnRzPyhcInVuZGVmaW5lZFwiIT09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMmJihtb2R1bGUuZXhwb3J0cz1DKSxleHBvcnRzPUMpOlkuanNTSEE9Q30pKHRoaXMpO1xuIiwiaW1wb3J0IGpzU0hBIGZyb20gJ2pzc2hhJztcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVVVJRCgpIHtcbiAgaWYgKHdpbmRvdy5jcnlwdG8gJiYgd2luZG93LmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcbiAgICB2YXIgYnVmID0gbmV3IFVpbnQxNkFycmF5KDgpO1xuICAgIHdpbmRvdy5jcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ1Zik7XG4gICAgdmFyIFM0ID0gZnVuY3Rpb24obnVtKSB7IHZhciByZXQgPSBudW0udG9TdHJpbmcoMTYpOyB3aGlsZShyZXQubGVuZ3RoIDwgNCkgcmV0ID0gJzAnK3JldDsgcmV0dXJuIHJldDsgfTtcbiAgICByZXR1cm4gUzQoYnVmWzBdKStTNChidWZbMV0pKyctJytTNChidWZbMl0pKyctJytTNChidWZbM10pKyctJytTNChidWZbNF0pKyctJytTNChidWZbNV0pK1M0KGJ1Zls2XSkrUzQoYnVmWzddKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG59XG5cbi8vIEhhc2hlcyB0aGUgZ2l2ZW4gdGV4dCB0byBhIFVVSUQgc3RyaW5nIG9mIGZvcm0gJ3h4eHh4eHh4LXl5eXktenp6ei13d3d3LWFhYWFhYWFhYWFhYScuXG5leHBvcnQgZnVuY3Rpb24gaGFzaFRvVVVJRCh0ZXh0KSB7XG4gIHZhciBzaGFPYmogPSBuZXcganNTSEEoJ1NIQS0yNTYnLCAnVEVYVCcpO1xuICBzaGFPYmoudXBkYXRlKHRleHQpO1xuICB2YXIgaGFzaCA9IG5ldyBVaW50OEFycmF5KHNoYU9iai5nZXRIYXNoKCdBUlJBWUJVRkZFUicpKTtcbiAgXG4gIHZhciBuID0gJyc7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBoYXNoLmJ5dGVMZW5ndGgvMjsgKytpKSB7XG4gICAgdmFyIHMgPSAoaGFzaFtpXSBeIGhhc2hbaSs4XSkudG9TdHJpbmcoMTYpO1xuICAgIGlmIChzLmxlbmd0aCA9PSAxKSBzID0gJzAnICsgcztcbiAgICBuICs9IHM7XG4gIH1cbiAgcmV0dXJuIG4uc2xpY2UoMCwgOCkgKyAnLScgKyBuLnNsaWNlKDgsIDEyKSArICctJyArIG4uc2xpY2UoMTIsIDE2KSArICctJyArIG4uc2xpY2UoMTYsIDIwKSArICctJyArIG4uc2xpY2UoMjApO1xufVxuIiwidmFyIHJlc3VsdHNTZXJ2ZXJVcmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMzMzLyc7XG5cbnZhciB1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzdWx0c1NlcnZlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICB9XG5cbiAgc3RvcmVTdGFydChyZXN1bHRzKSB7XG4gICAgaWYgKCF1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyKSByZXR1cm47XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3N0YXJ0XCIsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShyZXN1bHRzKSk7XG4gICAgY29uc29sZS5sb2coJ1Jlc3VsdHNTZXJ2ZXI6IFJlY29yZGVkIHRlc3Qgc3RhcnQgdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3Rfc3RhcnRcIik7XG4gIH1cblxuICBzdG9yZVN5c3RlbUluZm8ocmVzdWx0cykge1xuICAgIGlmICghdXBsb2FkUmVzdWx0c1RvUmVzdWx0c1NlcnZlcikgcmV0dXJuO1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIlBPU1RcIiwgcmVzdWx0c1NlcnZlclVybCArIFwic3RvcmVfc3lzdGVtX2luZm9cIiwgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICBjb25zb2xlLmxvZygnUmVzdWx0c1NlcnZlcjogVXBsb2FkZWQgc3lzdGVtIGluZm8gdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3N5c3RlbV9pbmZvXCIpO1xuICB9XG5cbiAgc3RvcmVUZXN0UmVzdWx0cyhyZXN1bHRzKSB7XG4gICAgaWYgKCF1cGxvYWRSZXN1bHRzVG9SZXN1bHRzU2VydmVyKSByZXR1cm47XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiUE9TVFwiLCByZXN1bHRzU2VydmVyVXJsICsgXCJzdG9yZV90ZXN0X3Jlc3VsdHNcIiwgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICBjb25zb2xlLmxvZygnUmVzdWx0c1NlcnZlcjogUmVjb3JkZWQgdGVzdCBmaW5pc2ggdG8gJyArIHJlc3VsdHNTZXJ2ZXJVcmwgKyBcInN0b3JlX3Rlc3RfcmVzdWx0c1wiKTtcbiAgfSAgXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBzdHIgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvWyEnKCkqXS9nLCB4ID0+IGAlJHt4LmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9YCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdG9rZW4gPSAnJVthLWYwLTldezJ9JztcbnZhciBzaW5nbGVNYXRjaGVyID0gbmV3IFJlZ0V4cCh0b2tlbiwgJ2dpJyk7XG52YXIgbXVsdGlNYXRjaGVyID0gbmV3IFJlZ0V4cCgnKCcgKyB0b2tlbiArICcpKycsICdnaScpO1xuXG5mdW5jdGlvbiBkZWNvZGVDb21wb25lbnRzKGNvbXBvbmVudHMsIHNwbGl0KSB7XG5cdHRyeSB7XG5cdFx0Ly8gVHJ5IHRvIGRlY29kZSB0aGUgZW50aXJlIHN0cmluZyBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29tcG9uZW50cy5qb2luKCcnKSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIERvIG5vdGhpbmdcblx0fVxuXG5cdGlmIChjb21wb25lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBjb21wb25lbnRzO1xuXHR9XG5cblx0c3BsaXQgPSBzcGxpdCB8fCAxO1xuXG5cdC8vIFNwbGl0IHRoZSBhcnJheSBpbiAyIHBhcnRzXG5cdHZhciBsZWZ0ID0gY29tcG9uZW50cy5zbGljZSgwLCBzcGxpdCk7XG5cdHZhciByaWdodCA9IGNvbXBvbmVudHMuc2xpY2Uoc3BsaXQpO1xuXG5cdHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmNhbGwoW10sIGRlY29kZUNvbXBvbmVudHMobGVmdCksIGRlY29kZUNvbXBvbmVudHMocmlnaHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChpbnB1dCk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdHZhciB0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblxuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpbnB1dCA9IGRlY29kZUNvbXBvbmVudHModG9rZW5zLCBpKS5qb2luKCcnKTtcblxuXHRcdFx0dG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChpbnB1dCkge1xuXHQvLyBLZWVwIHRyYWNrIG9mIGFsbCB0aGUgcmVwbGFjZW1lbnRzIGFuZCBwcmVmaWxsIHRoZSBtYXAgd2l0aCB0aGUgYEJPTWBcblx0dmFyIHJlcGxhY2VNYXAgPSB7XG5cdFx0JyVGRSVGRic6ICdcXHVGRkZEXFx1RkZGRCcsXG5cdFx0JyVGRiVGRSc6ICdcXHVGRkZEXFx1RkZGRCdcblx0fTtcblxuXHR2YXIgbWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdHdoaWxlIChtYXRjaCkge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBEZWNvZGUgYXMgYmlnIGNodW5rcyBhcyBwb3NzaWJsZVxuXHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbMF0pO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dmFyIHJlc3VsdCA9IGRlY29kZShtYXRjaFswXSk7XG5cblx0XHRcdGlmIChyZXN1bHQgIT09IG1hdGNoWzBdKSB7XG5cdFx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR9XG5cblx0Ly8gQWRkIGAlQzJgIGF0IHRoZSBlbmQgb2YgdGhlIG1hcCB0byBtYWtlIHN1cmUgaXQgZG9lcyBub3QgcmVwbGFjZSB0aGUgY29tYmluYXRvciBiZWZvcmUgZXZlcnl0aGluZyBlbHNlXG5cdHJlcGxhY2VNYXBbJyVDMiddID0gJ1xcdUZGRkQnO1xuXG5cdHZhciBlbnRyaWVzID0gT2JqZWN0LmtleXMocmVwbGFjZU1hcCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Ly8gUmVwbGFjZSBhbGwgZGVjb2RlZCBjb21wb25lbnRzXG5cdFx0dmFyIGtleSA9IGVudHJpZXNbaV07XG5cdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKG5ldyBSZWdFeHAoa2V5LCAnZycpLCByZXBsYWNlTWFwW2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbmNvZGVkVVJJKSB7XG5cdGlmICh0eXBlb2YgZW5jb2RlZFVSSSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBgZW5jb2RlZFVSSWAgdG8gYmUgb2YgdHlwZSBgc3RyaW5nYCwgZ290IGAnICsgdHlwZW9mIGVuY29kZWRVUkkgKyAnYCcpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRlbmNvZGVkVVJJID0gZW5jb2RlZFVSSS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcblxuXHRcdC8vIFRyeSB0aGUgYnVpbHQgaW4gZGVjb2RlciBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIEZhbGxiYWNrIHRvIGEgbW9yZSBhZHZhbmNlZCBkZWNvZGVyXG5cdFx0cmV0dXJuIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHN0cmljdFVyaUVuY29kZSA9IHJlcXVpcmUoJ3N0cmljdC11cmktZW5jb2RlJyk7XG5jb25zdCBkZWNvZGVDb21wb25lbnQgPSByZXF1aXJlKCdkZWNvZGUtdXJpLWNvbXBvbmVudCcpO1xuXG5mdW5jdGlvbiBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnWycsXG5cdFx0XHRcdFx0aW5kZXgsXG5cdFx0XHRcdFx0J10nXG5cdFx0XHRcdF0uam9pbignJykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGVuY29kZShpbmRleCwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J109Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdJ10uam9pbignJykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1tdPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9PT0gbnVsbCA/IGVuY29kZShrZXksIG9wdGlvbnMpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCc9Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0bGV0IHJlc3VsdDtcblxuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC9cXFsoXFxkKilcXF0kLy5leGVjKGtleSk7XG5cblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcZCpcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0ge307XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldW3Jlc3VsdFsxXV0gPSB2YWx1ZTtcblx0XHRcdH07XG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC8oXFxbXFxdKSQvLmV4ZWMoa2V5KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbdmFsdWVdO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZW5jb2RlKSB7XG5cdFx0cmV0dXJuIG9wdGlvbnMuc3RyaWN0ID8gc3RyaWN0VXJpRW5jb2RlKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5kZWNvZGUpIHtcblx0XHRyZXR1cm4gZGVjb2RlQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5c1NvcnRlcihpbnB1dCkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcblx0XHRyZXR1cm4gaW5wdXQuc29ydCgpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4ga2V5c1NvcnRlcihPYmplY3Qua2V5cyhpbnB1dCkpXG5cdFx0XHQuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuXHRcdFx0Lm1hcChrZXkgPT4gaW5wdXRba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3QoaW5wdXQpIHtcblx0Y29uc3QgcXVlcnlTdGFydCA9IGlucHV0LmluZGV4T2YoJz8nKTtcblx0aWYgKHF1ZXJ5U3RhcnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cdHJldHVybiBpbnB1dC5zbGljZShxdWVyeVN0YXJ0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtkZWNvZGU6IHRydWUsIGFycmF5Rm9ybWF0OiAnbm9uZSd9LCBvcHRpb25zKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHQvLyBDcmVhdGUgYW4gb2JqZWN0IHdpdGggbm8gcHJvdG90eXBlXG5cdGNvbnN0IHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0aWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0aW5wdXQgPSBpbnB1dC50cmltKCkucmVwbGFjZSgvXls/IyZdLywgJycpO1xuXG5cdGlmICghaW5wdXQpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwYXJhbSBvZiBpbnB1dC5zcGxpdCgnJicpKSB7XG5cdFx0bGV0IFtrZXksIHZhbHVlXSA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG5cblx0XHQvLyBNaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuXHRcdC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcblx0XHR2YWx1ZSA9IHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlKHZhbHVlLCBvcHRpb25zKTtcblxuXHRcdGZvcm1hdHRlcihkZWNvZGUoa2V5LCBvcHRpb25zKSwgdmFsdWUsIHJldCk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMocmV0KS5zb3J0KCkucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gcmV0W2tleV07XG5cdFx0aWYgKEJvb2xlYW4odmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHQvLyBTb3J0IG9iamVjdCBrZXlzLCBub3QgdmFsdWVzXG5cdFx0XHRyZXN1bHRba2V5XSA9IGtleXNTb3J0ZXIodmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRba2V5XSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sIE9iamVjdC5jcmVhdGUobnVsbCkpO1xufVxuXG5leHBvcnRzLmV4dHJhY3QgPSBleHRyYWN0O1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuXG5leHBvcnRzLnN0cmluZ2lmeSA9IChvYmosIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0ZW5jb2RlOiB0cnVlLFxuXHRcdHN0cmljdDogdHJ1ZSxcblx0XHRhcnJheUZvcm1hdDogJ25vbmUnXG5cdH07XG5cblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdGlmIChvcHRpb25zLnNvcnQgPT09IGZhbHNlKSB7XG5cdFx0b3B0aW9ucy5zb3J0ID0gKCkgPT4ge307XG5cdH1cblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0cmV0dXJuIG9iaiA/IE9iamVjdC5rZXlzKG9iaikuc29ydChvcHRpb25zLnNvcnQpLm1hcChrZXkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG5cblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0XHRcdGZvciAoY29uc3QgdmFsdWUyIG9mIHZhbHVlLnNsaWNlKCkpIHtcblx0XHRcdFx0aWYgKHZhbHVlMiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXN1bHQucHVzaChmb3JtYXR0ZXIoa2V5LCB2YWx1ZTIsIHJlc3VsdC5sZW5ndGgpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdC5qb2luKCcmJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpICsgJz0nICsgZW5jb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0fSkuZmlsdGVyKHggPT4geC5sZW5ndGggPiAwKS5qb2luKCcmJykgOiAnJztcbn07XG5cbmV4cG9ydHMucGFyc2VVcmwgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcblx0cmV0dXJuIHtcblx0XHR1cmw6IGlucHV0LnNwbGl0KCc/JylbMF0gfHwgJycsXG5cdFx0cXVlcnk6IHBhcnNlKGV4dHJhY3QoaW5wdXQpLCBvcHRpb25zKVxuXHR9O1xufTtcbiIsImltcG9ydCBicm93c2VyRmVhdHVyZXMgZnJvbSAnYnJvd3Nlci1mZWF0dXJlcyc7XG5pbXBvcnQgd2ViZ2xJbmZvIGZyb20gJ3dlYmdsLWluZm8nO1xuLy9pbXBvcnQge2hhc2hUb1VVSUQsIGdlbmVyYXRlVVVJRH0gZnJvbSAnLi9VVUlEJztcbmltcG9ydCB7Z2VuZXJhdGVVVUlELCBoYXNoVG9VVUlEfSBmcm9tICcuL1VVSUQnO1xuXG5pbXBvcnQgUmVzdWx0c1NlcnZlciBmcm9tICcuL3Jlc3VsdHMtc2VydmVyJztcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnO1xuXG5mdW5jdGlvbiBhZGRHRVQodXJsLCBwYXJhbWV0ZXIpIHtcbiAgaWYgKHVybC5pbmRleE9mKCc/JykgIT0gLTEpIHJldHVybiB1cmwgKyAnJicgKyBwYXJhbWV0ZXI7XG4gIGVsc2UgcmV0dXJuIHVybCArICc/JyArIHBhcmFtZXRlcjtcbn1cblxuY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaCk7XG5cblxuZnVuY3Rpb24geXl5eW1tZGRoaG1tc3MoKSB7XG4gIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgdmFyIHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gIHZhciBtbSA9IGRhdGUuZ2V0TW9udGgoKSA8IDkgPyBcIjBcIiArIChkYXRlLmdldE1vbnRoKCkgKyAxKSA6IChkYXRlLmdldE1vbnRoKCkgKyAxKTsgLy8gZ2V0TW9udGgoKSBpcyB6ZXJvLWJhc2VkXG4gIHZhciBkZCAgPSBkYXRlLmdldERhdGUoKSA8IDEwID8gXCIwXCIgKyBkYXRlLmdldERhdGUoKSA6IGRhdGUuZ2V0RGF0ZSgpO1xuICB2YXIgaGggPSBkYXRlLmdldEhvdXJzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRIb3VycygpIDogZGF0ZS5nZXRIb3VycygpO1xuICB2YXIgbWluID0gZGF0ZS5nZXRNaW51dGVzKCkgPCAxMCA/IFwiMFwiICsgZGF0ZS5nZXRNaW51dGVzKCkgOiBkYXRlLmdldE1pbnV0ZXMoKTtcbiAgdmFyIHNlYyA9IGRhdGUuZ2V0U2Vjb25kcygpIDwgMTAgPyBcIjBcIiArIGRhdGUuZ2V0U2Vjb25kcygpIDogZGF0ZS5nZXRTZWNvbmRzKCk7XG4gIHJldHVybiB5eXl5ICsgJy0nICsgbW0gKyAnLScgKyBkZCArICcgJyArIGhoICsgJzonICsgbWluICsgJzonICsgc2VjO1xufVxuLy9pbXBvcnQgdnN5bmNFc3RpbWF0ZSBmcm9tICcuL3ZzeW5jZXN0aW1hdGUnO1xuLy92YXIgZGlzcGxheVJlZnJlc2hSYXRlID0gLTE7XG4vL3ZzeW5jRXN0aW1hdGUoKS50aGVuKGh6ID0+IGRpc3BsYXlSZWZyZXNoUmF0ZSA9IE1hdGgucmFuZG9tKGh6KSk7XG5cbmNvbnN0IFZFUlNJT04gPSAnMS4wJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGVzdEFwcCB7XG4gIHBhcnNlUGFyYW1ldGVycygpIHtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcbiAgICBpZiAocGFyYW1ldGVyc1snbnVtdGltZXMnXSkge1xuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy5nZW5lcmFsLm51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IHBhcnNlSW50KHBhcmFtZXRlcnMubnVtdGltZXMpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJnbCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cy5mYWtlV2ViR0wgPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICBpZiAocGFyYW1ldGVyc1snc2VsZWN0ZWQnXSkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBwYXJhbWV0ZXJzWydzZWxlY3RlZCddLnNwbGl0KCcsJyk7XG4gICAgICB0aGlzLnZ1ZUFwcC50ZXN0cy5mb3JFYWNoKHRlc3QgPT4gdGVzdC5zZWxlY3RlZCA9IGZhbHNlKTtcbiAgICAgIHNlbGVjdGVkLmZvckVhY2goaWQgPT4ge1xuICAgICAgICB2YXIgdGVzdCA9IHRoaXMudnVlQXBwLnRlc3RzLmZpbmQodGVzdCA9PiB0ZXN0LmlkID09PSBpZCk7XG4gICAgICAgIGlmICh0ZXN0KSB0ZXN0LnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgfVxuXG4gIH1cblxuICBjb25zdHJ1Y3Rvcih2dWVBcHApIHtcbiAgICBjb25zb2xlLmxvZyhgVGVzdCBBcHAgdi4ke1ZFUlNJT059YCk7XG5cbiAgICB0aGlzLnZ1ZUFwcCA9IHZ1ZUFwcDtcbiAgICB0aGlzLnRlc3RzID0gW107XG4gICAgdGhpcy5pc0N1cnJlbnRseVJ1bm5pbmdUZXN0ID0gZmFsc2U7XG4gICAgdGhpcy5icm93c2VyVVVJRCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdCA9IHt9O1xuICAgIHRoaXMucmVzdWx0c1NlcnZlciA9IG5ldyBSZXN1bHRzU2VydmVyKCk7XG4gICAgdGhpcy50ZXN0c1F1ZXVlZFRvUnVuID0gW107XG5cbiAgICBmZXRjaCgndGVzdHMuanNvbicpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAganNvbi5mb3JFYWNoKHRlc3QgPT4ge1xuICAgICAgICAgIHRlc3Quc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXN0cyA9IHZ1ZUFwcC50ZXN0cyA9IGpzb247XG5cbiAgICAgICAgdGhpcy5wYXJzZVBhcmFtZXRlcnMoKTtcbiAgICAgICAgdGhpcy5hdXRvUnVuKCk7XG4gICAgICB9KVxuXG4gICAgdGhpcy5pbml0V1NTZXJ2ZXIoKTtcblxuICAgIHRoaXMud2ViZ2xJbmZvID0gdnVlQXBwLndlYmdsSW5mbyA9IHdlYmdsSW5mbygpO1xuICAgIGJyb3dzZXJGZWF0dXJlcyhmZWF0dXJlcyA9PiB7XG4gICAgICB0aGlzLmJyb3dzZXJJbmZvID0gdnVlQXBwLmJyb3dzZXJJbmZvID0gZmVhdHVyZXM7XG4gICAgICB0aGlzLm9uQnJvd3NlclJlc3VsdHNSZWNlaXZlZCh7fSk7XG4gICAgfSk7XG4gIH1cblxuICBpbml0V1NTZXJ2ZXIoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9ICdodHRwOi8vbG9jYWxob3N0Ojg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG4gIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdiZW5jaG1hcmtfZmluaXNoZWQnLCAocmVzdWx0KSA9PiB7XG4gICAgICByZXN1bHQuanNvbiA9IEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgNCk7XG4gICAgICB2YXIgb3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy52dWVBcHAub3B0aW9ucy50ZXN0cykpO1xuICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMID09PSBmYWxzZSkge1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5mYWtlV2ViR0w7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdC5vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgdmFyIHRlc3RSZXN1bHRzID0ge1xuICAgICAgICByZXN1bHQ6IHJlc3VsdFxuICAgICAgfTtcbiAgICAgIHRlc3RSZXN1bHRzLmJyb3dzZXJVVUlEID0gdGhpcy5icm93c2VyVVVJRDtcbiAgICAgIHRlc3RSZXN1bHRzLnN0YXJ0VGltZSA9IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3Quc3RhcnRUaW1lO1xuICAgICAgdGVzdFJlc3VsdHMuZmFrZVdlYkdMID0gdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5mYWtlV2ViR0w7XG4gICAgICAvL3Rlc3RSZXN1bHRzLmlkID0gdGhpcy5jdXJyZW50bHlSdW5uaW5nVGVzdC5pZDtcbiAgICAgIHRlc3RSZXN1bHRzLmZpbmlzaFRpbWUgPSB5eXl5bW1kZGhobW1zcygpO1xuICAgICAgdGVzdFJlc3VsdHMubmFtZSA9IHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3QubmFtZTtcbiAgICAgIHRlc3RSZXN1bHRzLnJ1blVVSUQgPSB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQ7XG4gICAgICAvL2lmIChicm93c2VySW5mby5uYXRpdmVTeXN0ZW1JbmZvICYmIGJyb3dzZXJJbmZvLm5hdGl2ZVN5c3RlbUluZm8uVVVJRCkgdGVzdFJlc3VsdHMuaGFyZHdhcmVVVUlEID0gYnJvd3NlckluZm8ubmF0aXZlU3lzdGVtSW5mby5VVUlEO1xuICAgICAgdGVzdFJlc3VsdHMucnVuT3JkaW5hbCA9IHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Rlc3RSZXN1bHRzLmlkXSA/ICh0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZFt0ZXN0UmVzdWx0cy5pZF0ubGVuZ3RoICsgMSkgOiAxO1xuICAgICAgdGhpcy5yZXN1bHRzU2VydmVyLnN0b3JlVGVzdFJlc3VsdHModGVzdFJlc3VsdHMpO1xuXG4gICAgICAvLyBBY2N1bXVsYXRlIHJlc3VsdHMgaW4gZGljdGlvbmFyeS5cbiAgICAgIC8vaWYgKHRlc3RSZXN1bHRzLnJlc3VsdCAhPSAnRkFJTCcpIFxuICAgICAge1xuICAgICAgICBpZiAoIXRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Jlc3VsdC50ZXN0X2lkXSkgdGhpcy52dWVBcHAucmVzdWx0c0J5SWRbcmVzdWx0LnRlc3RfaWRdID0gW107XG4gICAgICAgIHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Jlc3VsdC50ZXN0X2lkXS5wdXNoKHRlc3RSZXN1bHRzKTtcbiAgICAgIH1cblxuICAgICAgLy8gQXZlcmFnZVxuICAgICAgdGhpcy52dWVBcHAucmVzdWx0c0F2ZXJhZ2UgPSBbXTtcbiAgXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnZ1ZUFwcC5yZXN1bHRzQnlJZCkuZm9yRWFjaCh0ZXN0SUQgPT4ge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Rlc3RJRF07XG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB2YXIgdGVzdFJlc3VsdHNBdmVyYWdlID0ge307XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnRlc3RfaWQgPSBgJHt0ZXN0SUR9ICgke3Jlc3VsdHMubGVuZ3RofSBzYW1wbGVzKWA7XG4gICAgICAgIFxuICAgICAgICAgIGZ1bmN0aW9uIGdldDcwUGVyY2VudEF2ZXJhZ2UoZ2V0RmllbGQpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldDcwUGVyY2VudEFycmF5KCkge1xuICAgICAgICAgICAgICBmdW5jdGlvbiBjbXAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRGaWVsZChhKSAtIGdldEZpZWxkKGIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA8PSAzKSByZXR1cm4gcmVzdWx0cy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgdmFyIGZyYWMgPSBNYXRoLnJvdW5kKDAuNyAqIHJlc3VsdHMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgdmFyIHJlc3VsdHNDID0gcmVzdWx0cy5zbGljZSgwKTtcbiAgICAgICAgICAgICAgcmVzdWx0c0Muc29ydChjbXApO1xuICAgICAgICAgICAgICB2YXIgbnVtRWxlbWVudHNUb1JlbW92ZSA9IHJlc3VsdHMubGVuZ3RoIC0gZnJhYztcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udCA9IE1hdGguZmxvb3IobnVtRWxlbWVudHNUb1JlbW92ZS8yKTtcbiAgICAgICAgICAgICAgdmFyIG51bUVsZW1lbnRzVG9SZW1vdmVCYWNrID0gbnVtRWxlbWVudHNUb1JlbW92ZSAtIG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udDtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNDLnNsaWNlKG51bUVsZW1lbnRzVG9SZW1vdmVGcm9udCwgcmVzdWx0c0MubGVuZ3RoIC0gbnVtRWxlbWVudHNUb1JlbW92ZUJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFyciA9IGdldDcwUGVyY2VudEFycmF5KCk7XG4gICAgICAgICAgICB2YXIgdG90YWwgPSAwO1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkgdG90YWwgKz0gZ2V0RmllbGQoYXJyW2ldKTtcbiAgICAgICAgICAgIHJldHVybiB0b3RhbCAvIGFyci5sZW5ndGg7XG4gICAgICAgICAgfSAgXG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnRvdGFsVGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQudG90YWxUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1SWRsZVBlcmMgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdUlkbGVQZXJjOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1SWRsZVRpbWUgPSBnZXQ3MFBlcmNlbnRBdmVyYWdlKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAucmVzdWx0LmNwdUlkbGVUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuY3B1VGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQuY3B1VGltZTsgfSk7XG4gICAgICAgICAgdGVzdFJlc3VsdHNBdmVyYWdlLnBhZ2VMb2FkVGltZSA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQucGFnZUxvYWRUaW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UuYXZnRnBzID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC5hdmdGcHM7IH0pO1xuICAgICAgICAgIHRlc3RSZXN1bHRzQXZlcmFnZS50aW1lVG9GaXJzdEZyYW1lID0gZ2V0NzBQZXJjZW50QXZlcmFnZShmdW5jdGlvbihwKSB7IHJldHVybiBwLnJlc3VsdC50aW1lVG9GaXJzdEZyYW1lOyB9KTtcbiAgICAgICAgICB0ZXN0UmVzdWx0c0F2ZXJhZ2UubnVtU3R1dHRlckV2ZW50cyA9IGdldDcwUGVyY2VudEF2ZXJhZ2UoZnVuY3Rpb24ocCkgeyByZXR1cm4gcC5yZXN1bHQubnVtU3R1dHRlckV2ZW50czsgfSk7XG4gICAgICAgICAgLyp0b3RhbFJlbmRlclRpbWUgICAgIHRvdGFsVGltZSovXG4gICAgICAgICAgdGhpcy52dWVBcHAucmVzdWx0c0F2ZXJhZ2UucHVzaCh0ZXN0UmVzdWx0c0F2ZXJhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICBcblxuICAgICAgdGhpcy52dWVBcHAucmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAvKlxuICAgICAgaWYgKHJ1bm5pbmdUZXN0c0luUHJvZ3Jlc3MpIHtcbiAgICAgICAgdmFyIHRlc3RTdGFydGVkID0gcnVuTmV4dFF1ZXVlZFRlc3QoKTtcbiAgICAgICAgaWYgKCF0ZXN0U3RhcnRlZCkge1xuICAgICAgICAgIGlmICh0b3J0dXJlTW9kZSkge1xuICAgICAgICAgICAgdGVzdHNRdWV1ZWRUb1J1biA9IGdldFNlbGVjdGVkVGVzdHMoKTtcbiAgICAgICAgICAgIHJ1blNlbGVjdGVkVGVzdHMoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcnVubmluZ1Rlc3RzSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgY3VycmVudGx5UnVubmluZ1Rlc3QgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudGx5UnVubmluZ1Rlc3QgPSBudWxsO1xuICAgICAgfVxuICAgICAgKi9cbiAgICAgIHRoaXMucnVuTmV4dFF1ZXVlZFRlc3QoKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pOyAgXG4gIH1cblxuICBvbkJyb3dzZXJSZXN1bHRzUmVjZWl2ZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ0Jyb3dzZXIgVVVJRDonLCB0aGlzLmdldEJyb3dzZXJVVUlEKCkpO1xuICAgIHZhciBzeXN0ZW1JbmZvID0ge1xuICAgICAgYnJvd3NlclVVSUQ6IHRoaXMuYnJvd3NlclVVSUQsXG4gICAgICB3ZWJnbEluZm86IHRoaXMud2ViZ2xJbmZvLFxuICAgICAgYnJvd3NlckluZm86IHRoaXMuYnJvd3NlckluZm9cbiAgICB9O1xuXG4gICAgdGhpcy5yZXN1bHRzU2VydmVyLnN0b3JlU3lzdGVtSW5mbyhzeXN0ZW1JbmZvKTtcbiAgfVxuICAgIFxuICBydW5TZWxlY3RlZFRlc3RzKCkge1xuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1biA9IHRoaXMudGVzdHMuZmlsdGVyKHggPT4geC5zZWxlY3RlZCk7XG4gICAgXG4gICAgLy9pZiAoZGF0YS5udW1UaW1lc1RvUnVuRWFjaFRlc3QgPiAxKSB7XG4gICAgLy8gIGRhdGEubnVtVGltZXNUb1J1bkVhY2hUZXN0ID0gTWF0aC5tYXgoZGF0YS5udW1UaW1lc1RvUnVuRWFjaFRlc3QsIDEwMDApO1xuICAgIGNvbnN0IG51bVRpbWVzVG9SdW5FYWNoVGVzdCA9IHRoaXMudnVlQXBwLm9wdGlvbnMuZ2VuZXJhbC5udW1UaW1lc1RvUnVuRWFjaFRlc3Q7XG4gICAge1xuICAgICAgdmFyIG11bHRpcGxlcyA9IFtdO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgbnVtVGltZXNUb1J1bkVhY2hUZXN0OyBqKyspIHtcbiAgICAgICAgICBtdWx0aXBsZXMucHVzaCh0aGlzLnRlc3RzUXVldWVkVG9SdW5baV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLnRlc3RzUXVldWVkVG9SdW4gPSBtdWx0aXBsZXM7XG4gICAgfVxuICAgIHRoaXMucnVubmluZ1Rlc3RzSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgdGhpcy5ydW5OZXh0UXVldWVkVGVzdCgpO1xuICB9XG4gIFxuICBydW5OZXh0UXVldWVkVGVzdCgpIHsgIFxuICAgIGlmICh0aGlzLnRlc3RzUXVldWVkVG9SdW4ubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgICB2YXIgdCA9IHRoaXMudGVzdHNRdWV1ZWRUb1J1blsgMCBdO1xuICAgIHRoaXMudGVzdHNRdWV1ZWRUb1J1bi5zcGxpY2UoMCwgMSk7XG4gICAgdGhpcy5ydW5UZXN0KHQuaWQsIGZhbHNlKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdldEJyb3dzZXJVVUlEKCkge1xuICAgIHZhciBoYXJkd2FyZVVVSUQgPSAnJztcbiAgICBpZiAodGhpcy5uYXRpdmVTeXN0ZW1JbmZvICYmIHRoaXMubmF0aXZlU3lzdGVtSW5mby5VVUlEKSB7XG4gICAgICBoYXJkd2FyZVVVSUQgPSB0aGlzLm5hdGl2ZVN5c3RlbUluZm8uVVVJRDtcbiAgICB9IGVsc2Uge1xuICAgICAgaGFyZHdhcmVVVUlEID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1VVSUQnKTtcbiAgICAgIGlmICghaGFyZHdhcmVVVUlEKSB7XG4gICAgICAgIGhhcmR3YXJlVVVJRCA9IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnVVVJRCcsIGhhcmR3YXJlVVVJRCk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICAvLyBXZSBub3cgaGF2ZSBhbGwgdGhlIGluZm8gdG8gY29tcHV0ZSB0aGUgYnJvd3NlciBVVUlEXG4gICAgdmFyIGJyb3dzZXJVVUlEU3RyaW5nID0gaGFyZHdhcmVVVUlEICsgKHRoaXMuYnJvd3NlckluZm8udXNlckFnZW50LmJyb3dzZXJWZXJzaW9uIHx8ICcnKSArICh0aGlzLmJyb3dzZXJJbmZvLm5hdmlnYXRvci5idWlsZElEIHx8ICcnKTtcbiAgICB0aGlzLmJyb3dzZXJVVUlEID0gaGFzaFRvVVVJRChicm93c2VyVVVJRFN0cmluZyk7XG5cbiAgICByZXR1cm4gdGhpcy5icm93c2VyVVVJRDtcbiAgfVxuXG4gIHJ1blRlc3QoaWQsIGludGVyYWN0aXZlKSB7XG4gICAgdmFyIHRlc3QgPSB0aGlzLnRlc3RzLmZpbmQodCA9PiB0LmlkID09PSBpZCk7XG4gICAgaWYgKCF0ZXN0KSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdUZXN0IG5vdCBmb3VuZCwgaWQ6JywgaWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnUnVubmluZyB0ZXN0OicsIHRlc3QubmFtZSk7XG4gIFxuICAgIHZhciBmYWtlV2ViR0wgPSB0aGlzLnZ1ZUFwcC5vcHRpb25zLnRlc3RzLmZha2VXZWJHTDtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnRlc3QgPSB0ZXN0O1xuICAgIHRoaXMuY3VycmVudGx5UnVubmluZ1Rlc3Quc3RhcnRUaW1lID0geXl5eW1tZGRoaG1tc3MoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQgPSBnZW5lcmF0ZVVVSUQoKTtcbiAgICB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LmZha2VXZWJHTCA9IGZha2VXZWJHTDtcbiAgICBcbiAgICB2YXIgdXJsID0gKGludGVyYWN0aXZlID8gJ3N0YXRpYy8nOiAndGVzdHMvJykgKyB0ZXN0LnVybDtcbiAgICBpZiAoIWludGVyYWN0aXZlKSB1cmwgPSBhZGRHRVQodXJsLCAncGxheWJhY2snKTtcbiAgICBpZiAoZmFrZVdlYkdMKSB1cmwgPSBhZGRHRVQodXJsLCAnZmFrZS13ZWJnbCcpO1xuICAgIFxuLypcbiAgICBpZiAodGVzdC5sZW5ndGgpIHVybCA9IGFkZEdFVCh1cmwsICdudW1mcmFtZXM9JyArIHRlc3QubGVuZ3RoKTtcbiAgICAqL1xuICAgIHdpbmRvdy5vcGVuKHVybCk7XG4gIFxuICAgIHZhciB0ZXN0RGF0YSA9IHtcbiAgICAgICdicm93c2VyVVVJRCc6IHRoaXMuYnJvd3NlclVVSUQsXG4gICAgICAnaWQnOiB0ZXN0LmlkLFxuICAgICAgJ25hbWUnOiB0ZXN0Lm5hbWUsXG4gICAgICAnc3RhcnRUaW1lJzogeXl5eW1tZGRoaG1tc3MoKSxcbiAgICAgICdyZXN1bHQnOiAndW5maW5pc2hlZCcsXG4gICAgICAvLydGYWtlV2ViR0wnOiBkYXRhLm9wdGlvbnMuZmFrZVdlYkdMLFxuICAgICAgJ3J1blVVSUQnOiB0aGlzLmN1cnJlbnRseVJ1bm5pbmdUZXN0LnJ1blVVSUQsXG4gICAgICAncnVuT3JkaW5hbCc6IHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Rlc3QuaWRdID8gKHRoaXMudnVlQXBwLnJlc3VsdHNCeUlkW3Rlc3QuaWRdLmxlbmd0aCArIDEpIDogMVxuICAgIH07XG4gIFxuICAgIC8vaWYgKGRhdGEubmF0aXZlU3lzdGVtSW5mbyAmJiBkYXRhLm5hdGl2ZVN5c3RlbUluZm8uVVVJRCkgdGVzdERhdGEuaGFyZHdhcmVVVUlEID0gZGF0YS5uYXRpdmVTeXN0ZW1JbmZvLlVVSUQ7XG4gICAgLy90aGlzLnJlc3VsdHNTZXJ2ZXIuc3RvcmVTdGFydCh0ZXN0RGF0YSk7XG4gIH1cbiAgXG4gIGF1dG9SdW4oKSB7XG4gICAgaWYgKCF0aGlzLmlzQ3VycmVudGx5UnVubmluZ1Rlc3QgJiYgbG9jYXRpb24uc2VhcmNoLnRvTG93ZXJDYXNlKCkuaW5kZXhPZignYXV0b3J1bicpICE9PSAtMSkge1xuICAgICAgdGhpcy5ydW5TZWxlY3RlZFRlc3RzKCk7XG4gICAgfVxuICB9IFxufVxuXG4vKlxuICAvLyBGZXRjaCBpbmZvcm1hdGlvbiBhYm91dCBuYXRpdmUgc3lzdGVtIGlmIHdlIGFyZSBydW5uaW5nIGFzIGxvY2FsaG9zdC5cbiAgZnVuY3Rpb24gZmV0Y2hOYXRpdmVTeXN0ZW1JbmZvKCkge1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgbmF0aXZlU3lzdGVtSW5mbyA9IG51bGw7XG4gICAgICB2YXIgc3lzdGVtSW5mbyA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgc3lzdGVtSW5mby5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHN5c3RlbUluZm8ucmVhZHlTdGF0ZSAhPSA0KSByZXR1cm47XG4gICAgICAgIHZhciBuYXRpdmVTeXN0ZW1JbmZvID0gSlNPTi5wYXJzZShzeXN0ZW1JbmZvLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIHJlc29sdmUobmF0aXZlU3lzdGVtSW5mbyk7XG4gICAgICB9XG4gICAgICBzeXN0ZW1JbmZvLm9wZW4oJ1BPU1QnLCAnc3lzdGVtX2luZm8nLCB0cnVlKTtcbiAgICAgIHN5c3RlbUluZm8uc2VuZCgpO1xuICAgIH0pO1xuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbnZhciBuYXRpdmVJbmZvUHJvbWlzZTtcbmlmIChsb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2h0dHA6Ly9sb2NhbGhvc3QnKSA9PSAwKSB7XG4gIG5hdGl2ZUluZm9Qcm9taXNlID0gZmV0Y2hOYXRpdmVTeXN0ZW1JbmZvKCk7XG59IGVsc2Uge1xuICBuYXRpdmVJbmZvUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkgeyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyByZXNvbHZlKCk7IH0sIDEpOyB9KTtcbn1cblxuUHJvbWlzZS5hbGwoW2Jyb3dzZXJJbmZvUHJvbWlzZSwgbmF0aXZlSW5mb1Byb21pc2VdKS50aGVuKGZ1bmN0aW9uKGFsbFJlc3VsdHMpIHtcbiAgdmFyIGJyb3dzZXJJbmZvID0gYWxsUmVzdWx0c1swXTtcbiAgdmFyIG5hdGl2ZUluZm8gPSBhbGxSZXN1bHRzWzFdO1xuICBpZiAobmF0aXZlSW5mbykge1xuICAgIGJyb3dzZXJJbmZvWyduYXRpdmVTeXN0ZW1JbmZvJ10gPSBuYXRpdmVJbmZvWydzeXN0ZW0nXTtcbiAgICBicm93c2VySW5mb1snYnJvd3NlckluZm8nXSA9IG5hdGl2ZUluZm9bJ2Jyb3dzZXInXTtcbiAgfVxuICBicm93c2VySW5mb1snYnJvd3NlclVVSUQnXSA9IGJyb3dzZXJVVUlEO1xuICBvbkJyb3dzZXJSZXN1bHRzUmVjZWl2ZWQoYnJvd3NlckluZm8pO1xufSwgZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUuZXJyb3IoJ2Jyb3dzZXIgaW5mbyB0ZXN0IGZhaWxlZCEnKTtcbn0pO1xuKi9cblxuIiwiaW1wb3J0IFRlc3RBcHAgZnJvbSAnLi9hcHAnO1xuXG52YXIgZGF0YSA9IHtcbiAgdGVzdHM6IFtdLFxuICBzaG93X2pzb246IGZhbHNlLFxuICBicm93c2VySW5mbzogbnVsbCxcbiAgd2ViZ2xJbmZvOiBudWxsLFxuICBuYXRpdmVTeXN0ZW1JbmZvOiB7fSxcbiAgc2hvd0luZm86IGZhbHNlLFxuICBvcHRpb25zOiB7XG4gICAgZ2VuZXJhbDoge1xuICAgICAgbnVtVGltZXNUb1J1bkVhY2hUZXN0OiAxXG4gICAgfSxcbiAgICB0ZXN0czoge1xuICAgICAgZmFrZVdlYkdMOiBmYWxzZVxuICAgIH1cbiAgfSxcbiAgcmVzdWx0czogW10sXG4gIHJlc3VsdHNBdmVyYWdlOiBbXSxcbiAgcmVzdWx0c0J5SWQ6IHt9XG59O1xuXG52YXIgdGVzdEFwcCA9IG51bGw7XG5cbndpbmRvdy5vbmxvYWQgPSAoeCkgPT4ge1xuICB2YXIgdnVlQXBwID0gbmV3IFZ1ZSh7XG4gICAgZWw6ICcjYXBwJyxcbiAgICBkYXRhOiBkYXRhLFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIGZvcm1hdE51bWVyaWModmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnRvRml4ZWQoMik7XG4gICAgICB9LFxuICAgICAgcnVuVGVzdDogZnVuY3Rpb24odGVzdCwgaW50ZXJhY3RpdmUpIHtcbiAgICAgICAgdGVzdEFwcC5ydW5UZXN0KHRlc3QuaWQsIGludGVyYWN0aXZlKTtcbiAgICAgIH0sXG4gICAgICBydW5TZWxlY3RlZFRlc3RzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGVzdEFwcC5ydW5TZWxlY3RlZFRlc3RzKCk7XG4gICAgICB9LFxuICAgICAgZ2V0QnJvd3NlckluZm86IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGRhdGEuYnJvd3NlckluZm8gPyBKU09OLnN0cmluZ2lmeShkYXRhLmJyb3dzZXJJbmZvLCBudWxsLCA0KSA6ICdDaGVja2luZyBicm93c2VyIGZlYXR1cmVzLi4uJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBcbiAgdGVzdEFwcCA9IG5ldyBUZXN0QXBwKHZ1ZUFwcCk7XG5cbn1cbiJdLCJuYW1lcyI6WyJ1c2VyQWdlbnRJbmZvIiwidGhpcyIsImpzU0hBIiwiZGVjb2RlIiwiZGVjb2RlQ29tcG9uZW50IiwiYnJvd3NlckZlYXR1cmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Q0FBQTtDQUNBLFNBQVMsdUJBQXVCLENBQUMsR0FBRyxFQUFFO0NBQ3RDLEVBQUUsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDbkQsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsbUJBQW1CLENBQUMsR0FBRyxFQUFFO0NBQ2xDLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDL0QsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsa0JBQWtCLENBQUMsR0FBRyxFQUFFO0NBQ2pDLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztDQUNuRCxDQUFDOztDQUVEO0NBQ0EsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRTtDQUMvQixFQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsQ0FBQzs7Q0FFRDtDQUNBLFNBQVMsYUFBYSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUU7Q0FDeEMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLFVBQVUsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDekUsRUFBRSxPQUFPLEtBQUssQ0FBQztDQUNmLENBQUM7OztDQUdEO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsY0FBYyxDQUFDLEdBQUcsRUFBRTtDQUM3QixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDbkIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEIsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDbEI7Q0FDQTtDQUNBO0NBQ0EsRUFBRSxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7Q0FDeEIsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN0QyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFhLElBQUksQ0FBQyxFQUFFO0NBQzdDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2hFLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQztDQUNsQixLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzlDLFNBQVMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsYUFBYSxDQUFDO0NBQzVDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsR0FBRztDQUNILEVBQUUsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOztDQUUzRDs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RCLElBQUksSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtDQUM3RCxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0NBQzFDLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUNyQixLQUFLO0NBQ0wsR0FBRztDQUNILEVBQUUsTUFBTSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztDQUV2QztDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QixJQUFJLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsSUFBSSxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtDQUN0RCxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7Q0FDbkMsTUFBTSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ3JCLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxNQUFNLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDdkMsRUFBRSxPQUFPLE1BQU0sQ0FBQztDQUNoQixDQUFDOztDQUVEO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsaUJBQWlCLENBQUMsTUFBTSxFQUFFO0NBQ25DLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDekMsSUFBSSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDekIsSUFBSSxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO0NBQ2xDLE1BQU0sT0FBTyxtQkFBbUIsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcEcsS0FBSztDQUNMLEdBQUc7Q0FDSCxDQUFDOztDQUVEO0NBQ0EsU0FBUyxNQUFNLENBQUMsY0FBYyxFQUFFO0NBQ2hDLEVBQUUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNyTyxFQUFFLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO0NBQ3RCLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxjQUFjLEVBQUU7Q0FDakMsTUFBTSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7Q0FDaEQsS0FBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLE9BQU8sT0FBTyxDQUFDO0NBQ2pCLENBQUM7O0NBRUQ7Q0FDQSxTQUFTLHNCQUFzQixDQUFDLE1BQU0sRUFBRTtDQUN4QyxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDN0YsRUFBRSxJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztDQUM3QixFQUFFLElBQUksSUFBSSxDQUFDLElBQUksTUFBTSxFQUFFO0NBQ3ZCLElBQUksSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RCLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0NBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLE1BQU0saUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ25ELEtBQUssTUFBTTtDQUNYLE1BQU0saUJBQWlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ2xDLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxPQUFPLGlCQUFpQixDQUFDO0NBQzNCLENBQUM7O0NBRUQ7Q0FDQSxTQUFTLHVCQUF1QixDQUFDLFlBQVksRUFBRTtDQUMvQyxFQUFFLElBQUksSUFBSSxHQUFHO0NBQ2IsSUFBSSxLQUFLLEVBQUUsTUFBTTtDQUNqQixJQUFJLEtBQUssRUFBRSxJQUFJO0NBQ2YsSUFBSSxLQUFLLEVBQUUsSUFBSTtDQUNmLElBQUksS0FBSyxFQUFFLE9BQU87Q0FDbEIsSUFBSSxLQUFLLEVBQUUsR0FBRztDQUNkLElBQUksS0FBSyxFQUFFLEdBQUc7Q0FDZCxJQUFJLEtBQUssRUFBRSxLQUFLO0NBQ2hCLElBQUksTUFBTSxFQUFFLElBQUk7Q0FDaEIsSUFBRztDQUNILEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEtBQUssR0FBRyxZQUFZLENBQUM7Q0FDdkQsRUFBRSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUM1QixDQUFDOztDQUVEO0NBQ0E7QUFDQSxDQUFlLFNBQVMsZUFBZSxDQUFDLFNBQVMsRUFBRTtDQUNuRCxFQUFFLFNBQVMsR0FBRyxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQztDQUMvQyxFQUFFLElBQUksRUFBRSxHQUFHO0NBQ1gsSUFBSSxTQUFTLEVBQUUsU0FBUztDQUN4QixJQUFJLGlCQUFpQixFQUFFLEVBQUU7Q0FDekIsSUFBSSxZQUFZLEVBQUUsRUFBRTtDQUNwQixHQUFHLENBQUM7O0NBRUosRUFBRSxJQUFJO0NBQ04sSUFBSSxJQUFJLE1BQU0sR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDM0MsSUFBSSxJQUFJLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUNuRCxJQUFJLElBQUksaUJBQWlCLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDM0QsSUFBSSxFQUFFLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7Q0FDN0MsSUFBSSxFQUFFLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQztDQUNyQyxJQUFJLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0QyxDQUdBLElBQUksSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0NBQ2hDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7Q0FDOUIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztDQUN6QixLQUFLLE1BQU0sSUFBSSxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDaEYsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO0NBQ3pCLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUU7Q0FDdkMsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RCLEtBQUssTUFBTSxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUU7Q0FDekMsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0NBQ3hCLEtBQUssTUFBTSxJQUFJLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUM1RSxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLE1BQU0sRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEIsS0FBSyxNQUFNLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUU7Q0FDN0YsTUFBTSxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztDQUN0QixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0NBQ3RCO0NBQ0E7Q0FDQSxLQUFLLE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxFQUFFO0NBQzlDLE1BQU0sRUFBRSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxFQUFFLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztDQUN6QixLQUFLLE1BQU07Q0FDWCxNQUFNLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0NBQ3RCLEtBQUs7O0NBRUw7Q0FDQSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNwQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztDQUNqRCxJQUFJLElBQUksQ0FBQyxFQUFFO0NBQ1gsTUFBTSxFQUFFLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztDQUMxQixNQUFNLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JCLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxRQUFRLENBQUM7Q0FDdkIsTUFBTSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQzdDLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDdEMsTUFBTSxJQUFJLENBQUMsRUFBRTtDQUNiLFFBQVEsRUFBRSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7Q0FDaEMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztDQUMxQixRQUFRLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVCLE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0NBQ3pDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Q0FDYixRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7Q0FDMUIsUUFBUSxFQUFFLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JELFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEMsT0FBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtDQUN0TCxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7Q0FDaEQsUUFBUSxJQUFJLENBQUMsRUFBRTtDQUNmLFVBQVUsRUFBRSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsVUFBVSxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztDQUN4QixVQUFVLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDakQsVUFBVSxFQUFFLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDN0QsU0FBUztDQUNULE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ1osTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZELE1BQU0sSUFBSSxDQUFDLEVBQUU7Q0FDYixRQUFRLEVBQUUsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0NBQzNCLFFBQVEsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7Q0FDdEMsT0FBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDWixNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ2pCLEtBQUs7QUFDTCxBQU9BO0NBQ0E7Q0FDQSxJQUFJLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0NBQy9KLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUU7Q0FDM0IsTUFBTSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0IsTUFBTSxJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFO0NBQ2hDLFFBQVEsRUFBRSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDMUMsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMzQyxRQUFRLElBQUksRUFBRSxDQUFDLGNBQWMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7Q0FDcEUsUUFBUSxJQUFJLEVBQUUsQ0FBQyxjQUFjLElBQUksU0FBUyxFQUFFLEVBQUUsQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7Q0FDcEYsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2pELFFBQVEsTUFBTTtDQUNkLE9BQU87Q0FDUCxLQUFLO0NBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFO0NBQzVCLE1BQU0sSUFBSSxPQUFPLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQ3RELE1BQU0sSUFBSSxPQUFPLEVBQUU7Q0FDbkIsUUFBUSxFQUFFLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztDQUN2QyxRQUFRLEVBQUUsQ0FBQyxjQUFjLEdBQUcsbUJBQW1CLENBQUM7Q0FDaEQsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2QyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxFQUFFO0NBQzFELFFBQVEsRUFBRSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7Q0FDdkMsUUFBUSxFQUFFLENBQUMsY0FBYyxHQUFHLG1CQUFtQixDQUFDO0NBQ2hELFFBQVEsRUFBRSxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQy9ELE9BQU87Q0FDUCxLQUFLOztDQUVMO0NBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUNuRCxNQUFNLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNuQyxNQUFNLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztDQUNyQyxNQUFNLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0NBQ2xFLFFBQVEsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Q0FDM0IsUUFBUSxFQUFFLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztDQUN4QixRQUFRLE1BQU07Q0FDZCxPQUFPO0NBQ1AsS0FBSzs7Q0FFTDtDQUNBLElBQUksSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDbkYsU0FBUyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0NBQ25ILFNBQVMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Q0FDMUYsU0FBUyxFQUFFLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztDQUNuQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7Q0FDYixJQUFJLEVBQUUsQ0FBQyxhQUFhLEdBQUcscUNBQXFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQzVFLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEVBQUUsQ0FBQztDQUNaLENBQUM7O0NDM1JELFNBQVMsVUFBVSxHQUFHO0NBQ3RCLEVBQUUsSUFBSSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEMsQ0FDQSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2xDLEVBQUUsSUFBSSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO0NBQ3ZCLEVBQUUsSUFBSSxvQkFBb0IsQ0FBQztDQUMzQixFQUFFLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFLG9CQUFvQixHQUFHLFlBQVksQ0FBQztDQUN0RixPQUFPLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssTUFBTSxFQUFFLG9CQUFvQixHQUFHLGVBQWUsQ0FBQztDQUM5RixPQUFPLG9CQUFvQixHQUFHLHNDQUFzQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQzNJLEVBQUUsT0FBTyxvQkFBb0IsQ0FBQztDQUM5QixDQUFDO0FBQ0QsQUFNQTtDQUNBO0NBQ0E7Q0FDQTtBQUNBLENBQWUsU0FBUyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUU7Q0FDNUQsRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Q0FDaEIsRUFBRSxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO0NBQ3ZDLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNsQyxTQUFTLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDL0IsR0FBRzs7Q0FFSCxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQy9ELEVBQUUsYUFBYSxDQUFDLGFBQWEsRUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbkUsRUFBRSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsT0FBTyxXQUFXLENBQUMsUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ3JGLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRSxPQUFPLFlBQVksS0FBSyxXQUFXLElBQUksT0FBTyxrQkFBa0IsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM5RyxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0NBQ3hMLEVBQUUsYUFBYSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Q0FDdEwsRUFBRSxJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztDQUNqQyxFQUFFLElBQUksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHO0NBQzdELEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0NBQzVDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLE9BQU8sY0FBYyxLQUFLLFdBQVcsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ2pMLEVBQUUsYUFBYSxDQUFDLG1CQUFtQixFQUFFLE9BQU8saUJBQWlCLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDL0UsRUFBRSxhQUFhLENBQUMscUJBQXFCLEVBQUUsT0FBTyxTQUFTLENBQUMsbUJBQW1CLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDN0YsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8sSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ3ZELEVBQUUsYUFBYSxDQUFDLFlBQVksRUFBRSxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM3RCxFQUFFLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbkUsRUFBRSxhQUFhLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDcEYsRUFBRSxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7Q0FDM0IsRUFBRSxJQUFJLEVBQUUsWUFBWSxHQUFHLE9BQU8sU0FBUyxLQUFLLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtDQUN2RSxFQUFFLGFBQWEsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDM0MsRUFBRSxhQUFhLENBQUMsZUFBZSxFQUFFLE9BQU8sUUFBUSxDQUFDLGVBQWUsS0FBSyxXQUFXLElBQUksT0FBTyxRQUFRLENBQUMsTUFBTSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQzVILEVBQUUsYUFBYSxDQUFDLHVCQUF1QixFQUFFLE9BQU8scUJBQXFCLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDdkYsRUFBRSxhQUFhLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxXQUFXLEtBQUssV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMxRixFQUFFLGFBQWEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDaEUsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLE9BQU8saUJBQWlCLEtBQUssV0FBVyxJQUFJLE9BQU8sb0JBQW9CLEtBQUssV0FBVyxJQUFJLE9BQU8sdUJBQXVCLEtBQUssV0FBVyxJQUFJLE9BQU8sbUJBQW1CLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDbk4sRUFBRSxhQUFhLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUNuRCxFQUFFLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO0NBQ3hMLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUN6RCxFQUFFLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDMUQsRUFBRSxhQUFhLENBQUMsYUFBYSxFQUFFLE9BQU8sV0FBVyxLQUFLLFdBQVcsQ0FBQyxDQUFDO0NBQ25FLEVBQUUsYUFBYSxDQUFDLE9BQU8sRUFBRSxPQUFPLFNBQVMsQ0FBQyxhQUFhLEtBQUssV0FBVyxDQUFDLENBQUM7Q0FDekUsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUM5RCxFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLGVBQWUsS0FBSyxXQUFXLENBQUMsQ0FBQztDQUMzRSxFQUFFLGFBQWEsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0NBRWpLO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxFQUFFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztBQUN4QixDQUNBO0NBQ0EsRUFBRSxTQUFTLGdCQUFnQixDQUFDLFdBQVcsRUFBRSw0QkFBNEIsRUFBRTtDQUN2RSxJQUFJLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDbEQsSUFBSSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Q0FDekIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDaEgsSUFBSSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSw0QkFBNEIsR0FBRyxFQUFFLDRCQUE0QixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQzdILElBQUksSUFBSSxPQUFPLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDakMsQ0FDQSxNQUFNLElBQUksT0FBTyxHQUFHLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7Q0FDMUYsTUFBTSxJQUFJLFdBQVcsSUFBSSxvQkFBb0IsRUFBRSxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDcEYsTUFBTSxPQUFPLE9BQU8sQ0FBQztDQUNyQixLQUFLO0NBQ0wsU0FBUyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLENBQUM7Q0FDL0QsR0FBRzs7Q0FFSCxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDNUQsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMzRCxJQUFJLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtDQUNsQyxNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQzlFLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGNBQWMsQ0FBQztDQUM5QyxLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDM0QsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDekUsSUFBSSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsS0FBSyxpQkFBaUIsQ0FBQyxXQUFXLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7Q0FDL0csTUFBTSxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsaUJBQWlCLENBQUM7Q0FDakQsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUN6QyxJQUFJLElBQUksY0FBYyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMxRCxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO0NBQ25DLE1BQU0sSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM1RSxNQUFNLElBQUksaUJBQWlCLENBQUMsU0FBUyxLQUFLLGlCQUFpQixDQUFDLFdBQVcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRTtDQUN6RyxRQUFRLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztDQUMzQyxPQUFPO0NBQ1AsS0FBSzs7Q0FFTCxJQUFJLElBQUksY0FBYyxDQUFDLFNBQVMsRUFBRTtDQUNsQyxNQUFNLGNBQWMsQ0FBQyxtQkFBbUIsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDO0NBQzlFLE1BQU0sWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGNBQWMsQ0FBQztDQUM5QyxLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLGFBQWEsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzVELEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDNUQ7Q0FDQTtDQUNBOztDQUVBLEVBQUUsSUFBSSxPQUFPLEdBQUc7Q0FDaEIsSUFBSSxTQUFTLEVBQUVBLGVBQWEsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0NBQ2pELElBQUksU0FBUyxFQUFFO0NBQ2YsTUFBTSxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87Q0FDaEMsTUFBTSxVQUFVLEVBQUUsU0FBUyxDQUFDLFVBQVU7Q0FDdEMsTUFBTSxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUs7Q0FDNUIsTUFBTSxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7Q0FDbEMsS0FBSztDQUNMO0NBQ0EsSUFBSSxPQUFPLEVBQUU7Q0FDYixNQUFNLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDckQsTUFBTSxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUs7Q0FDL0IsTUFBTSxZQUFZLEVBQUUsTUFBTSxDQUFDLE1BQU07Q0FDakMsTUFBTSxtQkFBbUIsRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDakUsTUFBTSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7Q0FDbkUsS0FBSztDQUNMLElBQUksbUJBQW1CLEVBQUUsU0FBUyxDQUFDLG1CQUFtQjtDQUN0RCxJQUFJLFVBQVUsRUFBRSxJQUFJO0NBQ3BCLElBQUksb0JBQW9CLEVBQUUsVUFBVSxFQUFFO0NBQ3RDLEdBQUcsQ0FBQzs7Q0FFSjtDQUNBLEVBQUUsSUFBSSxjQUFjLEdBQUcsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDOUosRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLGNBQWMsRUFBRTtDQUMvQixJQUFJLElBQUksQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM5QixJQUFJLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtDQUM5RCxHQUFHO0NBQ0g7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7O0NBRUE7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQTs7Q0FFQSxFQUFFLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7O0NBRTFEO0NBQ0EsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFO0NBQ3hCLElBQUksSUFBSSxTQUFTLENBQUMsc0JBQXNCLEVBQUU7Q0FDMUMsTUFBTSxTQUFTLENBQUMsc0JBQXNCLENBQUMsU0FBUyxLQUFLLEVBQUU7Q0FDdkQsUUFBUSxPQUFPLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDO0NBQzVDLFFBQVEsZUFBZSxHQUFHLElBQUksQ0FBQzs7Q0FFL0I7Q0FDQSxRQUFRLElBQUksZUFBZSxJQUFJLGVBQWUsRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDekUsT0FBTyxDQUFDLENBQUM7Q0FDVCxLQUFLLE1BQU07Q0FDWDtDQUNBO0NBQ0EsTUFBTSxPQUFPLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0NBQ3RDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQzs7Q0FFN0IsTUFBTSxJQUFJLGVBQWUsSUFBSSxlQUFlLEVBQUUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZFLEtBQUs7Q0FDTCxHQUFHOztDQUVIO0NBQ0EsRUFBRSxJQUFJLGVBQWUsSUFBSSxlQUFlLEVBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQUVsRztDQUNBLEVBQUUsT0FBTyxPQUFPLENBQUM7Q0FDakIsQ0FBQzs7Q0N0TUQsU0FBUyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUU7R0FDM0MsSUFBSSxNQUFNLEdBQUc7S0FDWCxZQUFZLEVBQUUsWUFBWTtJQUMzQixDQUFDOztDQUVKLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQjtNQUNwRCxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEVBQUU7O0tBRXZELE1BQU0sQ0FBQyxXQUFXLEdBQUcscUJBQXFCLENBQUM7S0FDM0MsT0FBTyxNQUFNLENBQUM7RUFDakI7O0NBRUQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM5QyxJQUFJLEVBQUUsRUFBRSxXQUFXLENBQUM7Q0FDcEIsSUFBSSxhQUFhLEdBQUcsQ0FBQyxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztDQUMvRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRTtHQUN2QyxJQUFJLElBQUksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDNUIsRUFBRSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7R0FDaEQsSUFBSSxFQUFFLENBQUM7T0FDSCxXQUFXLEdBQUcsSUFBSSxDQUFDO09BQ25CLE1BQU07SUFDVDtFQUNGO0NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2hCLElBQUksQ0FBQyxFQUFFLEVBQUU7S0FDTCxNQUFNLENBQUMsV0FBVyxHQUFHLDBDQUEwQyxDQUFDO0tBQ2hFLE9BQU8sTUFBTSxDQUFDO0VBQ2pCOztDQUVELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7S0FDekIsV0FBVyxFQUFFLFdBQVc7S0FDeEIsU0FBUyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztLQUN0QyxNQUFNLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0tBQ2xDLFFBQVEsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7S0FDdEMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNO0tBQzFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRO0tBQzlDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO0tBQ25CLFNBQVMsR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxTQUFTLEdBQUcsV0FBVyxHQUFHLGVBQWU7S0FDL0Usc0JBQXNCLEVBQUUseUJBQXlCLENBQUMsV0FBVyxDQUFDO0tBQzlELElBQUksRUFBRTtPQUNKLE9BQU8sRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUM7T0FDckMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztPQUN6QyxRQUFRLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDO09BQ3ZDLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUM7T0FDekMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztPQUN6QyxXQUFXLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDO01BQzlDO0tBQ0QsT0FBTyxFQUFFO09BQ1AsZUFBZSxFQUFFLGtCQUFrQixDQUFDLEVBQUUsQ0FBQztPQUN2QyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztPQUM5RCw0QkFBNEIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQztPQUNsRixxQkFBcUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztPQUNwRSx5QkFBeUIsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztPQUMzRSxvQkFBb0IsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQztPQUNqRSxjQUFjLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7T0FDcEQsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUM7T0FDMUQsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUM7T0FDM0QsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQUM7T0FDOUUsdUJBQXVCLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsMEJBQTBCLENBQUM7T0FDdkUscUJBQXFCLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7T0FDM0UsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztNQUNwQztLQUNELHFCQUFxQixFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQ2xGLHFCQUFxQixFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0tBQ2xGLE9BQU8sRUFBRTtPQUNQLHlCQUF5QixFQUFFLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO09BQ3RFLDJCQUEyQixFQUFFLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO09BQzFFLCtCQUErQixFQUFFLG9CQUFvQixDQUFDLEVBQUUsQ0FBQztPQUN6RCxzQkFBc0IsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztNQUNyRTtLQUNELFVBQVUsRUFBRSxFQUFFLENBQUMsc0JBQXNCLEVBQUU7SUFDeEMsQ0FBQyxDQUFDO0VBQ0o7O0NBRUQsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFO0dBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDN0I7O0NBRUQsU0FBUyxlQUFlLENBQUMsRUFBRSxFQUFFO0dBQzNCLElBQUksWUFBWSxHQUFHO09BQ2YsUUFBUSxFQUFFLEVBQUU7T0FDWixNQUFNLEVBQUUsRUFBRTtJQUNiLENBQUM7O0dBRUYsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0dBQ2pFLElBQUksYUFBYSxJQUFJLElBQUksRUFBRTtPQUN2QixZQUFZLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7T0FDL0UsWUFBWSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ2hGOztHQUVELE9BQU8sWUFBWSxDQUFDO0VBQ3JCOztDQUVELFNBQVMsa0JBQWtCLENBQUMsRUFBRSxFQUFFO0dBQzlCLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztHQUN4QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUM7R0FDaEQsSUFBSSxHQUFHLElBQUksSUFBSTtPQUNYLGVBQWUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztHQUVsRSxPQUFPLGVBQWUsQ0FBQztFQUN4Qjs7Q0FFRCxTQUFTLHlCQUF5QixDQUFDLFdBQVcsRUFBRTs7R0FFOUMsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ3pFLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUUsNEJBQTRCLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQztHQUNqRixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7O0dBRWhCLElBQUksQ0FBQyxFQUFFLEVBQUU7O09BRUwsT0FBTyxLQUFLLENBQUM7SUFDaEI7O0dBRUQsSUFBSSxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLDRCQUE0QixLQUFLLFdBQVcsRUFBRTs7O09BRy9FLE9BQU8saUJBQWlCLENBQUM7SUFDNUI7R0FDRCxPQUFPLElBQUksQ0FBQztFQUNiOztDQUVELFNBQVMsWUFBWSxDQUFDLENBQUMsRUFBRTtHQUN2QixPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDM0M7O0NBRUQsU0FBUyxRQUFRLENBQUMsRUFBRSxFQUFFO0dBQ3BCLElBQUksY0FBYyxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7OztHQUdqRixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsS0FBSyxPQUFPLE1BQU0sU0FBUyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUM7UUFDNUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssbUJBQW1CLENBQUM7UUFDckQsY0FBYyxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0dBRTlDLElBQUksS0FBSyxFQUFFOzs7Ozs7T0FNUCxJQUFJLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksWUFBWSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLDRCQUE0QixDQUFDLENBQUMsRUFBRTtXQUNoSSxPQUFPLFlBQVksQ0FBQztRQUN2QixNQUFNO1dBQ0gsT0FBTyxXQUFXLENBQUM7UUFDdEI7SUFDSjs7R0FFRCxPQUFPLElBQUksQ0FBQztFQUNiOztDQUVELFNBQVMsZ0JBQWdCLENBQUMsRUFBRSxFQUFFO0dBQzVCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsZ0NBQWdDLENBQUM7Y0FDOUMsRUFBRSxDQUFDLFlBQVksQ0FBQyx1Q0FBdUMsQ0FBQztjQUN4RCxFQUFFLENBQUMsWUFBWSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7O0dBRWpFLElBQUksQ0FBQyxFQUFFO09BQ0gsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQzs7T0FFNUQsSUFBSSxHQUFHLEtBQUssQ0FBQyxFQUFFO1dBQ1gsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNYO09BQ0QsT0FBTyxHQUFHLENBQUM7SUFDZDtHQUNELE9BQU8sS0FBSyxDQUFDO0VBQ2Q7O0NBRUQsU0FBUyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRTtHQUN0QyxJQUFJLE9BQU8sRUFBRTtPQUNULE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3JDLE1BQU07T0FDSCxPQUFPLElBQUksR0FBRyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQy9CO0VBQ0Y7O0NBRUQsU0FBUyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFO0dBQ25ELElBQUksV0FBVyxHQUFHLE9BQU8sR0FBRyxlQUFlLEdBQUcsRUFBRSxDQUFDO0dBQ2pELE9BQU8sSUFBSSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLElBQUksR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsR0FBRyxXQUFXLEdBQUcsR0FBRztFQUMzSjs7Q0FFRCxTQUFTLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUU7R0FDN0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7R0FDbEUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDdEUsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7O0dBRWhFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztHQUNoQixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO09BQ3RCLElBQUksR0FBRyxNQUFNLENBQUM7SUFDakI7O0dBRUQsT0FBTztPQUNILElBQUksR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO09BQzFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDO09BQzlDLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO09BQ3ZDLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO0lBQzdDO0VBQ0Y7O0NBRUQsU0FBUyxvQkFBb0IsQ0FBQyxFQUFFLEVBQUU7R0FDaEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQzFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsS0FBSyxDQUFDLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQzs7R0FFdkQsSUFBSSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUNwRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDOztHQUU5QyxPQUFPLENBQUMsQ0FBQztFQUNWOztDQUVELGFBQWMsR0FBRyxXQUFXO0dBQzFCLE9BQU87S0FDTCxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0tBQ2hDLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7SUFDakM7RUFDRjs7Ozs7Ozs7O0FDbk5ELENBV2EsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFO0NBQ3BmLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcGYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVTtDQUMxZixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNyZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLENBQUMsRUFBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdmLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7Q0FDOWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO0VBQ3BoQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQ3JmLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLGtFQUFrRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUN0ZixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBQyxHQUFHLFNBQVMsR0FBRyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEtBQUssU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDLE1BQU0sUUFBUSxNQUFNLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0VBQ2xoQixPQUFPLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzNmLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsa0VBQWtFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMvakIsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RmLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDdGYsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUN4ZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUU7RUFDcmYsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcmYsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0NBQzVmLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Q0FDcGYsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLFFBQVEsTUFBTSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztDQUMvZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdGYsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3BmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVM7Q0FDcmYsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVU7Q0FDdmYsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDO0NBQy9mLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztDQUNwZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQy9mLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVTtDQUNwZixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0NBQ3JmLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBK0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBVyxDQUFDLEVBQUVDLGNBQUksQ0FBQyxDQUFDOzs7Q0MxQ3pTLFNBQVMsWUFBWSxHQUFHO0NBQy9CLEVBQUUsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO0NBQ3RELElBQUksSUFBSSxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDakMsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksRUFBRSxHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDNUcsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25ILEdBQUcsTUFBTTtDQUNULElBQUksT0FBTyxzQ0FBc0MsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0NBQy9FLE1BQU0sSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakUsTUFBTSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDNUIsS0FBSyxDQUFDLENBQUM7Q0FDUCxHQUFHO0NBQ0gsQ0FBQzs7Q0FFRDtBQUNBLENBQU8sU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFO0NBQ2pDLEVBQUUsSUFBSSxNQUFNLEdBQUcsSUFBSUMsR0FBSyxDQUFD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
