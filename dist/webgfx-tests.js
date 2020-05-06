(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('crypto')) :
	typeof define === 'function' && define.amd ? define(['crypto'], factory) :
	(factory(global.crypto));
}(this, (function (crypto) { 'use strict';

	crypto = crypto && crypto.hasOwnProperty('default') ? crypto['default'] : crypto;

	const RealDate = Date;

	class MockDate {
	  constructor(t) {
	    this.t = t;
	  }

	  static now() {
	    return RealDate.now();
	  }

	  static realNow() {
	    return RealDate.now();
	  }

	  getTimezoneOffset() {
	    return 0;
	  }

	  toTimeString() {
	    return '';
	  }

	  getDate() { return 0; }
	  getDay() { return 0; }
	  getFullYear() { return 0; }
	  getHours() { return 0; }
	  getMilliseconds() { return 0; }
	  getMonth() { return 0; }
	  getMinutes() { return 0; }
	  getSeconds() { return 0; }
	  getTime() { return 0; }
	  getYear() { return 0; }

	  static UTC() { return 0; }

	  getUTCDate() { return 0; }
	  getUTCDay() { return 0; }
	  getUTCFullYear() { return 0; }
	  getUTCHours() { return 0; }
	  getUTCMilliseconds() { return 0; }
	  getUTCMonth() { return 0; }
	  getUTCMinutes() { return 0; }
	  getUTCSeconds() { return 0; }

	  setDate() {}
	  setFullYear() {}
	  setHours() {}
	  setMilliseconds() {}
	  setMinutes() {}
	  setMonth() {}
	  setSeconds() {}
	  setTime() {}

	  setUTCDate() {}
	  setUTCFullYear() {}
	  setUTCHours() {}
	  setUTCMilliseconds() {}
	  setUTCMinutes() {}
	  setUTCMonth() {}

	  setYear() {}
	}

	var realPerformance;

	if (!performance.realNow) {
	  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	  if (isSafari) {
	    realPerformance = performance;
	    performance = {
	      realNow: function() { return realPerformance.now(); },
	      now: function() { return realPerformance.now(); }
	    };
	  } else {
	    performance.realNow = performance.now;
	  }
	}

	var FakeTimers = {
	  timeScale: 1.0,
	  fakedTime: 0,
	  enabled: false,
	  refreshRate: 60,
	  needsFakeMonotonouslyIncreasingTimer: false,
	  setFakedTime: function( newFakedTime ) {
	    this.fakedTime = newFakedTime;
	  },
	  enable: function () {
	    Date = MockDate;

	    var self = this;
	    if (this.needsFakeMonotonouslyIncreasingTimer) {
	      performance.now = Date.now = function() { self.fakedTime += self.timeScale; return self.fakedTime; };
	    } else {
	      performance.now = Date.now = function() { return self.fakedTime * 1000.0 * self.timeScale / self.refreshRate; };
	    }

	    this.enabled = true;
	  },
	  disable: function () {
	    if (!this.enabled) { return; }
	    Date = RealDate;
	    performance.now = realPerformance.now;

	    this.enabled = false;
	  }
	};

	const original = ['getParameter', 'getExtension', 'getShaderPrecisionFormat'];
	const emptyString = ['getShaderInfoLog', 'getProgramInfoLog'];
	const return1 = ['isBuffer', 'isEnabled', 'isFramebuffer', 'isProgram', 'isQuery', 'isVertexArray', 'isSampler', 'isSync', 'isTransformFeedback',
	'isRenderbuffer', 'isShader', 'isTexture', 'validateProgram', 'getShaderParameter', 'getProgramParameter'];
	const return0 = ['isContextLost', 'finish', 'flush', 'getError', 'endTransformFeedback', 'pauseTransformFeedback', 'resumeTransformFeedback',
	'activeTexture', 'blendEquation', 'clear', 'clearDepth', 'clearStencil', 'compileShader', 'cullFace', 'deleteBuffer',
	'deleteFramebuffer', 'deleteProgram', 'deleteRenderbuffer', 'deleteShader', 'deleteTexture', 'depthFunc', 'depthMask', 'disable', 'disableVertexAttribArray',
	'enable', 'enableVertexAttribArray', 'frontFace', 'generateMipmap', 'lineWidth', 'linkProgram', 'stencilMask', 'useProgram', 'deleteQuery', 'deleteVertexArray',
	'bindVertexArray', 'drawBuffers', 'readBuffer', 'endQuery', 'deleteSampler', 'deleteSync', 'deleteTransformFeedback', 'beginTransformFeedback',
	'attachShader', 'bindBuffer', 'bindFramebuffer', 'bindRenderbuffer', 'bindTexture', 'blendEquationSeparate', 'blendFunc', 'depthRange', 'detachShader', 'hint',
	'pixelStorei', 'polygonOffset', 'sampleCoverage', 'shaderSource', 'stencilMaskSeparate', 'uniform1f', 'uniform1fv', 'uniform1i', 'uniform1iv',
	'uniform2fv', 'uniform2iv', 'uniform3fv', 'uniform3iv', 'uniform4fv', 'uniform4iv', 'vertexAttrib1f', 'vertexAttrib1fv', 'vertexAttrib2fv', 'vertexAttrib3fv',
	'vertexAttrib4fv', 'vertexAttribDivisor', 'beginQuery', 'invalidateFramebuffer', 'uniform1ui', 'uniform1uiv', 'uniform2uiv', 'uniform3uiv', 'uniform4uiv',
	'vertexAttribI4iv', 'vertexAttribI4uiv', 'bindSampler', 'fenceSync', 'bindTransformFeedback',
	'bindAttribLocation', 'bufferData', 'bufferSubData', 'drawArrays', 'stencilFunc', 'stencilOp', 'texParameterf', 'texParameteri', 'uniform2f', 'uniform2i',
	'uniformMatrix2fv', 'uniformMatrix3fv', 'uniformMatrix4fv', 'vertexAttrib2f', 'uniform2ui', 'uniformMatrix2x3fv', 'uniformMatrix3x2fv',
	'uniformMatrix2x4fv', 'uniformMatrix4x2fv', 'uniformMatrix3x4fv', 'uniformMatrix4x3fv', 'clearBufferiv', 'clearBufferuiv', 'clearBufferfv', 'samplerParameteri',
	'samplerParameterf', 'clientWaitSync', 'waitSync', 'transformFeedbackVaryings', 'bindBufferBase', 'uniformBlockBinding',
	'blendColor', 'blendFuncSeparate', 'clearColor', 'colorMask', 'drawElements', 'framebufferRenderbuffer', 'renderbufferStorage', 'scissor', 'stencilFuncSeparate',
	'stencilOpSeparate', 'uniform3f', 'uniform3i', 'vertexAttrib3f', 'viewport', 'drawArraysInstanced', 'uniform3ui', 'clearBufferfi',
	'framebufferTexture2D', 'uniform4f', 'uniform4i', 'vertexAttrib4f', 'drawElementsInstanced', 'copyBufferSubData', 'framebufferTextureLayer',
	'renderbufferStorageMultisample', 'texStorage2D', 'uniform4ui', 'vertexAttribI4i', 'vertexAttribI4ui', 'vertexAttribIPointer', 'bindBufferRange',
	'texImage2D', 'vertexAttribPointer', 'invalidateSubFramebuffer', 'texStorage3D', 'drawRangeElements',
	'compressedTexImage2D', 'readPixels', 'texSubImage2D', 'compressedTexSubImage2D', 'copyTexImage2D', 'copyTexSubImage2D', 'compressedTexImage3D',
	'copyTexSubImage3D', 'blitFramebuffer', 'texImage3D', 'compressedTexSubImage3D', 'texSubImage3D'];
	const nulls = [];

	// gl.INT = 5124
	const customFunctions = {
		getActiveUniform: () => { return {name: "", size: 1, type: 5124}; },
		getActiveAttrib: () => { return {name: "", size: 1, type: 5124}; }
	};


	function FakeWebGL(gl) {
		this.gl = gl;
		for (var key in gl) {
			if (typeof gl[key] === 'function') {
				if (original.indexOf(key) !== -1) {
					this[key] = gl[key].bind(gl);
				} else if (nulls.indexOf(key) !== -1) {
					this[key] = function(){return null;};
				} else if (return0.indexOf(key) !== -1) {
					this[key] = function(){return 0;};
				} else if (return1.indexOf(key) !== -1) {
					this[key] = function(){return 1;};
				} else if (emptyString.indexOf(key) !== -1) {
					this[key] = function(){return '';};
				} else if (typeof customFunctions[key] !== 'undefined') {
					this[key] = customFunctions[key].bind(gl);
				} else {
					// this[key] = function(){};
					this[key] = gl[key].bind(gl);
				}
			} else {
				this[key] = gl[key];
			}
		}
	}

	var originalGetContext = HTMLCanvasElement.prototype.getContext;
	if (!HTMLCanvasElement.prototype.getContextRaw) {
	    HTMLCanvasElement.prototype.getContextRaw = originalGetContext;
	}

	var enabled = false;

	var CanvasHook = {
	  webglContexts: [],
	  canvas2dContexts: [],
	  contexts: [],
	  getNumContexts: function(type) {
	    if (type === "webgl") {
	      return this.webglContexts.length;
	    } else if (type === "2d") {
	      return this.canvas2dContexts.length;
	    }

	    return this.contexts.length;
	  },
	  getContext: function(idx, type) {
	    if (type === "webgl") {
	      return this.webglContexts[idx];
	    } else if (type === "2d") {
	      return this.canvas2dContexts[idx];
	    }

	    return this.contexts[idx];
	  },
	  isWebGLContext: function(ctx) {
	    return (ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext));
	  },
	  enable: function (options) {
	    if (enabled) {return;}

	    var self = this;
	    HTMLCanvasElement.prototype.getContext = function() {
	      var ctx = originalGetContext.apply(this, arguments);
	      if (self.isWebGLContext(ctx)) {
	        self.webglContexts.push(ctx);
	        self.contexts.push(ctx);

	        if (options.fakeWebGL) {
	          ctx = new FakeWebGL(ctx);
	        }
	      } else if ((ctx instanceof CanvasRenderingContext2D)) {
	        self.canvas2dContexts.push(ctx);
	        self.contexts.push(ctx);
	      } else {
	        return ctx;
	      }

	      if (options.width && options.height) {
	        this.width = options.width;
	        this.height = options.height;
	        this.style.cssText = 'width: ' + options.width + 'px; height: ' + options.height + 'px';
	      }
	      return ctx;
	    };
	    enabled = true;
	  },

	  disable: function () {
	    if (!enabled) {return;}
	    HTMLCanvasElement.prototype.getContext = originalGetContext;
	    enabled = false;
	  }
	};

	var originalRequestPresent = navigator.xr.requestSession;

	var enabled$1 = false;

	var WebXRHook = {
	  sessions: [],
	  enable: function (options) {
	    if (enabled$1) {return;}

	    var self = this;
	    navigator.xr.requestSession = function() {
	      var res = originalRequestPresent.apply(this, arguments);
	      res.then(session => {
	        self.sessions.push(session);
	        session.addEventListener('end', event => {
	          if (options.onSessionEnd) {
	            options.onSessionEnd(event.session);
	          }
	        });

	        if (options.onSessionStarted) {
	          options.onSessionStarted(session);
	        }
	      });
	      return res;
	    };
	  },

	  disable: function() {
	    if (!enabled$1) return;
	    navigator.xr.requestSession = originalRequestPresent;
	    enabled$1 = false;
	  }
	};

	function Stats () {
	  this.n = 0;
	  this.min = Number.MAX_VALUE;
	  this.max = -Number.MAX_VALUE;
	  this.sum = 0;
	  this.mean = 0;
	  Object.defineProperty(this, 'q', {
	    enumerable: false,
	    writable: true,
	    value: 0
	  });
	  Object.defineProperty(this, 'variance', {
	    enumerable: true,
	    get: () => { return this.q / this.n }
	  });
	  Object.defineProperty(this, 'standard_deviation', {
	    enumerable: true,
	    get: () => { return Math.sqrt(this.q / this.n) }
	  });
	}

	Stats.prototype.update = function update (value) {
	  var num = parseFloat(value);
	  if (isNaN(num)) {
	    // Sorry, no NaNs
	    return
	  }
	  this.n++;
	  this.min = Math.min(this.min, num);
	  this.max = Math.max(this.max, num);
	  this.sum += num;
	  var prevMean = this.mean;
	  this.mean = this.mean + (num - this.mean) / this.n;
	  this.q = this.q + (num - prevMean) * (num - this.mean);
	};

	Stats.prototype.getAll = function getAll () {
	  if (this.n === 0) {
	    return null
	  }
	  var s = {
	    n: this.n,
	    min: this.min,
	    max: this.max,
	    sum: this.sum,
	    mean: this.mean,
	    variance: this.variance,
	    standard_deviation: this.standard_deviation
	  };
	  return s
	};

	//----------------------------------------------------------------------
	// TESTSTATS
	//----------------------------------------------------------------------
	function PerfStats () {

	  var firstFrame = true;
	  var firstFps = true;

	  var currentFrameStartTime = 0;
	  var previousFrameEndTime;
	  var lastUpdateTime = null;

	  // Used to detect recursive entries to the main loop, which can happen in certain complex cases, e.g. if not using rAF to tick rendering to the canvas.
	  //var insideMainLoopRecursionCounter = 0;
	  var insideFrame = false;

	  return {
	    getStatsSummary: function () {
	      var result = {};
	      Object.keys(this.stats).forEach(key => {
	        result[key] = {
	          min: this.stats[key].min,
	          max: this.stats[key].max,
	          avg: this.stats[key].mean,
	          standard_deviation: this.stats[key].standard_deviation
	        };
	      });

	      return result;
	    },

	    stats: {
	      fps: new Stats(),
	      dt: new Stats(),
	      cpu: new Stats()
	    },

	    numFrames: 0,
	    log: false,
	    totalTimeInMainLoop: 0,
	    totalTimeOutsideMainLoop: 0,
	    fpsCounterUpdateInterval: 200, // msecs

	    frameStart: function() {
	      //insideMainLoopRecursionCounter++;
	      //if (insideMainLoopRecursionCounter == 1)
	      {
	        if (lastUpdateTime === null) {
	          lastUpdateTime = performance.realNow();
	        }

	        currentFrameStartTime = performance.realNow();
	        this.updateStats();
	        insideFrame = true;
	      }
	    },

	    updateStats: function() {
	      var timeNow = performance.realNow();

	      this.numFrames++;

	      if (timeNow - lastUpdateTime > this.fpsCounterUpdateInterval) {
	        var fps = this.numFrames * 1000 / (timeNow - lastUpdateTime);
	        this.numFrames = 0;
	        lastUpdateTime = timeNow;

	        if (firstFps) {
	          firstFps = false;
	          return;
	        }

	        this.stats.fps.update(fps);

	        if (this.log) {
	          console.log(`fps - min: ${this.stats.fps.min.toFixed(2)} / avg: ${this.stats.fps.mean.toFixed(2)} / max: ${this.stats.fps.max.toFixed(2)} - std: ${this.stats.fps.standard_deviation.toFixed(2)}`);
	          console.log(`ms  - min: ${this.stats.dt.min.toFixed(2)} / avg: ${this.stats.dt.mean.toFixed(2)} / max: ${this.stats.dt.max.toFixed(2)} - std: ${this.stats.dt.standard_deviation.toFixed(2)}`);
	          console.log(`cpu - min: ${this.stats.cpu.min.toFixed(2)}% / avg: ${this.stats.cpu.mean.toFixed(2)}% / max: ${this.stats.cpu.max.toFixed(2)}% - std: ${this.stats.cpu.standard_deviation.toFixed(2)}%`);
	          console.log('---------------------------------------------------------');  
	        }
	      }
	    },

	    // Called in the end of each main loop frame tick.
	    frameEnd: function() {
	      //insideMainLoopRecursionCounter--;
	      //if (insideMainLoopRecursionCounter != 0) return;
	      if (!insideFrame) return;

	      insideFrame = false;

	      var timeNow = performance.realNow();
	      var cpuMainLoopDuration = timeNow - currentFrameStartTime;
	      var durationBetweenFrameUpdates = timeNow - previousFrameEndTime;
	      previousFrameEndTime = timeNow;
	  
	      if (firstFrame) {
	        firstFrame = false;
	        return;
	      }

	      this.totalTimeInMainLoop += cpuMainLoopDuration;
	      this.totalTimeOutsideMainLoop += durationBetweenFrameUpdates - cpuMainLoopDuration;

	      var cpu = cpuMainLoopDuration * 100 / durationBetweenFrameUpdates;
	      this.stats.cpu.update(cpu);
	      this.stats.dt.update(durationBetweenFrameUpdates);
	    }
	  }
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var alea = createCommonjsModule(function (module) {
	// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
	// http://baagoe.com/en/RandomMusings/javascript/
	// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
	// Original work is under MIT license -

	// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the "Software"), to deal
	// in the Software without restriction, including without limitation the rights
	// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	// copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	// 
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	// 
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	// THE SOFTWARE.



	(function(global, module, define) {

	function Alea(seed) {
	  var me = this, mash = Mash();

	  me.next = function() {
	    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
	    me.s0 = me.s1;
	    me.s1 = me.s2;
	    return me.s2 = t - (me.c = t | 0);
	  };

	  // Apply the seeding algorithm from Baagoe.
	  me.c = 1;
	  me.s0 = mash(' ');
	  me.s1 = mash(' ');
	  me.s2 = mash(' ');
	  me.s0 -= mash(seed);
	  if (me.s0 < 0) { me.s0 += 1; }
	  me.s1 -= mash(seed);
	  if (me.s1 < 0) { me.s1 += 1; }
	  me.s2 -= mash(seed);
	  if (me.s2 < 0) { me.s2 += 1; }
	  mash = null;
	}

	function copy(f, t) {
	  t.c = f.c;
	  t.s0 = f.s0;
	  t.s1 = f.s1;
	  t.s2 = f.s2;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new Alea(seed),
	      state = opts && opts.state,
	      prng = xg.next;
	  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
	  prng.double = function() {
	    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
	  };
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	function Mash() {
	  var n = 0xefc8249d;

	  var mash = function(data) {
	    data = data.toString();
	    for (var i = 0; i < data.length; i++) {
	      n += data.charCodeAt(i);
	      var h = 0.02519603282416938 * n;
	      n = h >>> 0;
	      h -= n;
	      h *= n;
	      n = h >>> 0;
	      h -= n;
	      n += h * 0x100000000; // 2^32
	    }
	    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
	  };

	  return mash;
	}


	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.alea = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xor128 = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xor128" prng algorithm by
	// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  me.x = 0;
	  me.y = 0;
	  me.z = 0;
	  me.w = 0;

	  // Set up generator function.
	  me.next = function() {
	    var t = me.x ^ (me.x << 11);
	    me.x = me.y;
	    me.y = me.z;
	    me.z = me.w;
	    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
	  };

	  if (seed === (seed | 0)) {
	    // Integer seed.
	    me.x = seed;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 64; k++) {
	    me.x ^= strseed.charCodeAt(k) | 0;
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.x = f.x;
	  t.y = f.y;
	  t.z = f.z;
	  t.w = f.w;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xor128 = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xorwow = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xorwow" prng algorithm by
	// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  // Set up generator function.
	  me.next = function() {
	    var t = (me.x ^ (me.x >>> 2));
	    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
	    return (me.d = (me.d + 362437 | 0)) +
	       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
	  };

	  me.x = 0;
	  me.y = 0;
	  me.z = 0;
	  me.w = 0;
	  me.v = 0;

	  if (seed === (seed | 0)) {
	    // Integer seed.
	    me.x = seed;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 64; k++) {
	    me.x ^= strseed.charCodeAt(k) | 0;
	    if (k == strseed.length) {
	      me.d = me.x << 10 ^ me.x >>> 4;
	    }
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.x = f.x;
	  t.y = f.y;
	  t.z = f.z;
	  t.w = f.w;
	  t.v = f.v;
	  t.d = f.d;
	  return t;
	}

	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xorwow = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xorshift7 = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "xorshift7" algorithm by
	// François Panneton and Pierre L'ecuyer:
	// "On the Xorgshift Random Number Generators"
	// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this;

	  // Set up generator function.
	  me.next = function() {
	    // Update xor generator.
	    var X = me.x, i = me.i, t, v;
	    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
	    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
	    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
	    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
	    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
	    X[i] = v;
	    me.i = (i + 1) & 7;
	    return v;
	  };

	  function init(me, seed) {
	    var j, w, X = [];

	    if (seed === (seed | 0)) {
	      // Seed state array using a 32-bit integer.
	      w = X[0] = seed;
	    } else {
	      // Seed state using a string.
	      seed = '' + seed;
	      for (j = 0; j < seed.length; ++j) {
	        X[j & 7] = (X[j & 7] << 15) ^
	            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
	      }
	    }
	    // Enforce an array length of 8, not all zeroes.
	    while (X.length < 8) X.push(0);
	    for (j = 0; j < 8 && X[j] === 0; ++j);
	    if (j == 8) w = X[7] = -1; else w = X[j];

	    me.x = X;
	    me.i = 0;

	    // Discard an initial 256 values.
	    for (j = 256; j > 0; --j) {
	      me.next();
	    }
	  }

	  init(me, seed);
	}

	function copy(f, t) {
	  t.x = f.x.slice();
	  t.i = f.i;
	  return t;
	}

	function impl(seed, opts) {
	  if (seed == null) seed = +(new Date);
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (state.x) copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xorshift7 = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var xor4096 = createCommonjsModule(function (module) {
	// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
	//
	// This fast non-cryptographic random number generator is designed for
	// use in Monte-Carlo algorithms. It combines a long-period xorshift
	// generator with a Weyl generator, and it passes all common batteries
	// of stasticial tests for randomness while consuming only a few nanoseconds
	// for each prng generated.  For background on the generator, see Brent's
	// paper: "Some long-period random number generators using shifts and xors."
	// http://arxiv.org/pdf/1004.3115v1.pdf
	//
	// Usage:
	//
	// var xor4096 = require('xor4096');
	// random = xor4096(1);                        // Seed with int32 or string.
	// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
	// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
	//
	// For nonzero numeric keys, this impelementation provides a sequence
	// identical to that by Brent's xorgens 3 implementaion in C.  This
	// implementation also provides for initalizing the generator with
	// string seeds, or for saving and restoring the state of the generator.
	//
	// On Chrome, this prng benchmarks about 2.1 times slower than
	// Javascript's built-in Math.random().

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this;

	  // Set up generator function.
	  me.next = function() {
	    var w = me.w,
	        X = me.X, i = me.i, t, v;
	    // Update Weyl generator.
	    me.w = w = (w + 0x61c88647) | 0;
	    // Update xor generator.
	    v = X[(i + 34) & 127];
	    t = X[i = ((i + 1) & 127)];
	    v ^= v << 13;
	    t ^= t << 17;
	    v ^= v >>> 15;
	    t ^= t >>> 12;
	    // Update Xor generator array state.
	    v = X[i] = v ^ t;
	    me.i = i;
	    // Result is the combination.
	    return (v + (w ^ (w >>> 16))) | 0;
	  };

	  function init(me, seed) {
	    var t, v, i, j, w, X = [], limit = 128;
	    if (seed === (seed | 0)) {
	      // Numeric seeds initialize v, which is used to generates X.
	      v = seed;
	      seed = null;
	    } else {
	      // String seeds are mixed into v and X one character at a time.
	      seed = seed + '\0';
	      v = 0;
	      limit = Math.max(limit, seed.length);
	    }
	    // Initialize circular array and weyl value.
	    for (i = 0, j = -32; j < limit; ++j) {
	      // Put the unicode characters into the array, and shuffle them.
	      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
	      // After 32 shuffles, take v as the starting w value.
	      if (j === 0) w = v;
	      v ^= v << 10;
	      v ^= v >>> 15;
	      v ^= v << 4;
	      v ^= v >>> 13;
	      if (j >= 0) {
	        w = (w + 0x61c88647) | 0;     // Weyl.
	        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
	        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
	      }
	    }
	    // We have detected all zeroes; make the key nonzero.
	    if (i >= 128) {
	      X[(seed && seed.length || 0) & 127] = -1;
	    }
	    // Run the generator 512 times to further mix the state before using it.
	    // Factoring this as a function slows the main generator, so it is just
	    // unrolled here.  The weyl generator is not advanced while warming up.
	    i = 127;
	    for (j = 4 * 128; j > 0; --j) {
	      v = X[(i + 34) & 127];
	      t = X[i = ((i + 1) & 127)];
	      v ^= v << 13;
	      t ^= t << 17;
	      v ^= v >>> 15;
	      t ^= t >>> 12;
	      X[i] = v ^ t;
	    }
	    // Storing state as object members is faster than using closure variables.
	    me.w = w;
	    me.X = X;
	    me.i = i;
	  }

	  init(me, seed);
	}

	function copy(f, t) {
	  t.i = f.i;
	  t.w = f.w;
	  t.X = f.X.slice();
	  return t;
	}
	function impl(seed, opts) {
	  if (seed == null) seed = +(new Date);
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (state.X) copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.xor4096 = impl;
	}

	})(
	  commonjsGlobal,                                     // window object or global
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var tychei = createCommonjsModule(function (module) {
	// A Javascript implementaion of the "Tyche-i" prng algorithm by
	// Samuel Neves and Filipe Araujo.
	// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

	(function(global, module, define) {

	function XorGen(seed) {
	  var me = this, strseed = '';

	  // Set up generator function.
	  me.next = function() {
	    var b = me.b, c = me.c, d = me.d, a = me.a;
	    b = (b << 25) ^ (b >>> 7) ^ c;
	    c = (c - d) | 0;
	    d = (d << 24) ^ (d >>> 8) ^ a;
	    a = (a - b) | 0;
	    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
	    me.c = c = (c - d) | 0;
	    me.d = (d << 16) ^ (c >>> 16) ^ a;
	    return me.a = (a - b) | 0;
	  };

	  /* The following is non-inverted tyche, which has better internal
	   * bit diffusion, but which is about 25% slower than tyche-i in JS.
	  me.next = function() {
	    var a = me.a, b = me.b, c = me.c, d = me.d;
	    a = (me.a + me.b | 0) >>> 0;
	    d = me.d ^ a; d = d << 16 ^ d >>> 16;
	    c = me.c + d | 0;
	    b = me.b ^ c; b = b << 12 ^ d >>> 20;
	    me.a = a = a + b | 0;
	    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
	    me.c = c = c + d | 0;
	    b = b ^ c;
	    return me.b = (b << 7 ^ b >>> 25);
	  }
	  */

	  me.a = 0;
	  me.b = 0;
	  me.c = 2654435769 | 0;
	  me.d = 1367130551;

	  if (seed === Math.floor(seed)) {
	    // Integer seed.
	    me.a = (seed / 0x100000000) | 0;
	    me.b = seed | 0;
	  } else {
	    // String seed.
	    strseed += seed;
	  }

	  // Mix in string seed, then discard an initial batch of 64 values.
	  for (var k = 0; k < strseed.length + 20; k++) {
	    me.b ^= strseed.charCodeAt(k) | 0;
	    me.next();
	  }
	}

	function copy(f, t) {
	  t.a = f.a;
	  t.b = f.b;
	  t.c = f.c;
	  t.d = f.d;
	  return t;
	}
	function impl(seed, opts) {
	  var xg = new XorGen(seed),
	      state = opts && opts.state,
	      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
	  prng.double = function() {
	    do {
	      var top = xg.next() >>> 11,
	          bot = (xg.next() >>> 0) / 0x100000000,
	          result = (top + bot) / (1 << 21);
	    } while (result === 0);
	    return result;
	  };
	  prng.int32 = xg.next;
	  prng.quick = prng;
	  if (state) {
	    if (typeof(state) == 'object') copy(state, xg);
	    prng.state = function() { return copy(xg, {}); };
	  }
	  return prng;
	}

	if (module && module.exports) {
	  module.exports = impl;
	} else if (define && define.amd) {
	  define(function() { return impl; });
	} else {
	  this.tychei = impl;
	}

	})(
	  commonjsGlobal,
	  module,    // present in node.js
	  (typeof undefined) == 'function'   // present with an AMD loader
	);
	});

	var seedrandom = createCommonjsModule(function (module) {
	/*
	Copyright 2014 David Bau.

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	*/

	(function (pool, math) {
	//
	// The following constants are related to IEEE 754 limits.
	//

	// Detect the global object, even if operating in strict mode.
	// http://stackoverflow.com/a/14387057/265298
	var global = (0, eval)('this'),
	    width = 256,        // each RC4 output is 0 <= x < 256
	    chunks = 6,         // at least six RC4 outputs for each double
	    digits = 52,        // there are 52 significant digits in a double
	    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
	    startdenom = math.pow(width, chunks),
	    significance = math.pow(2, digits),
	    overflow = significance * 2,
	    mask = width - 1,
	    nodecrypto;         // node.js crypto module, initialized at the bottom.

	//
	// seedrandom()
	// This is the seedrandom function described above.
	//
	function seedrandom(seed, options, callback) {
	  var key = [];
	  options = (options == true) ? { entropy: true } : (options || {});

	  // Flatten the seed string or build one from local entropy if needed.
	  var shortseed = mixkey(flatten(
	    options.entropy ? [seed, tostring(pool)] :
	    (seed == null) ? autoseed() : seed, 3), key);

	  // Use the seed to initialize an ARC4 generator.
	  var arc4 = new ARC4(key);

	  // This function returns a random double in [0, 1) that contains
	  // randomness in every bit of the mantissa of the IEEE 754 value.
	  var prng = function() {
	    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
	        d = startdenom,                 //   and denominator d = 2 ^ 48.
	        x = 0;                          //   and no 'extra last byte'.
	    while (n < significance) {          // Fill up all significant digits by
	      n = (n + x) * width;              //   shifting numerator and
	      d *= width;                       //   denominator and generating a
	      x = arc4.g(1);                    //   new least-significant-byte.
	    }
	    while (n >= overflow) {             // To avoid rounding up, before adding
	      n /= 2;                           //   last byte, shift everything
	      d /= 2;                           //   right using integer math until
	      x >>>= 1;                         //   we have exactly the desired bits.
	    }
	    return (n + x) / d;                 // Form the number within [0, 1).
	  };

	  prng.int32 = function() { return arc4.g(4) | 0; };
	  prng.quick = function() { return arc4.g(4) / 0x100000000; };
	  prng.double = prng;

	  // Mix the randomness into accumulated entropy.
	  mixkey(tostring(arc4.S), pool);

	  // Calling convention: what to return as a function of prng, seed, is_math.
	  return (options.pass || callback ||
	      function(prng, seed, is_math_call, state) {
	        if (state) {
	          // Load the arc4 state from the given state if it has an S array.
	          if (state.S) { copy(state, arc4); }
	          // Only provide the .state method if requested via options.state.
	          prng.state = function() { return copy(arc4, {}); };
	        }

	        // If called as a method of Math (Math.seedrandom()), mutate
	        // Math.random because that is how seedrandom.js has worked since v1.0.
	        if (is_math_call) { math[rngname] = prng; return seed; }

	        // Otherwise, it is a newer calling convention, so return the
	        // prng directly.
	        else return prng;
	      })(
	  prng,
	  shortseed,
	  'global' in options ? options.global : (this == math),
	  options.state);
	}
	math['seed' + rngname] = seedrandom;

	//
	// ARC4
	//
	// An ARC4 implementation.  The constructor takes a key in the form of
	// an array of at most (width) integers that should be 0 <= x < (width).
	//
	// The g(count) method returns a pseudorandom integer that concatenates
	// the next (count) outputs from ARC4.  Its return value is a number x
	// that is in the range 0 <= x < (width ^ count).
	//
	function ARC4(key) {
	  var t, keylen = key.length,
	      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

	  // The empty key [] is treated as [0].
	  if (!keylen) { key = [keylen++]; }

	  // Set up S using the standard key scheduling algorithm.
	  while (i < width) {
	    s[i] = i++;
	  }
	  for (i = 0; i < width; i++) {
	    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
	    s[j] = t;
	  }

	  // The "g" method returns the next (count) outputs as one number.
	  (me.g = function(count) {
	    // Using instance members instead of closure state nearly doubles speed.
	    var t, r = 0,
	        i = me.i, j = me.j, s = me.S;
	    while (count--) {
	      t = s[i = mask & (i + 1)];
	      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
	    }
	    me.i = i; me.j = j;
	    return r;
	    // For robust unpredictability, the function call below automatically
	    // discards an initial batch of values.  This is called RC4-drop[256].
	    // See http://google.com/search?q=rsa+fluhrer+response&btnI
	  })(width);
	}

	//
	// copy()
	// Copies internal state of ARC4 to or from a plain object.
	//
	function copy(f, t) {
	  t.i = f.i;
	  t.j = f.j;
	  t.S = f.S.slice();
	  return t;
	}
	//
	// flatten()
	// Converts an object tree to nested arrays of strings.
	//
	function flatten(obj, depth) {
	  var result = [], typ = (typeof obj), prop;
	  if (depth && typ == 'object') {
	    for (prop in obj) {
	      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
	    }
	  }
	  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
	}

	//
	// mixkey()
	// Mixes a string seed into a key that is an array of integers, and
	// returns a shortened string seed that is equivalent to the result key.
	//
	function mixkey(seed, key) {
	  var stringseed = seed + '', smear, j = 0;
	  while (j < stringseed.length) {
	    key[mask & j] =
	      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
	  }
	  return tostring(key);
	}

	//
	// autoseed()
	// Returns an object for autoseeding, using window.crypto and Node crypto
	// module if available.
	//
	function autoseed() {
	  try {
	    var out;
	    if (nodecrypto && (out = nodecrypto.randomBytes)) {
	      // The use of 'out' to remember randomBytes makes tight minified code.
	      out = out(width);
	    } else {
	      out = new Uint8Array(width);
	      (global.crypto || global.msCrypto).getRandomValues(out);
	    }
	    return tostring(out);
	  } catch (e) {
	    var browser = global.navigator,
	        plugins = browser && browser.plugins;
	    return [+new Date, global, plugins, global.screen, tostring(pool)];
	  }
	}

	//
	// tostring()
	// Converts an array of charcodes to a string
	//
	function tostring(a) {
	  return String.fromCharCode.apply(0, a);
	}

	//
	// When seedrandom.js is loaded, we immediately mix a few bits
	// from the built-in RNG into the entropy pool.  Because we do
	// not want to interfere with deterministic PRNG state later,
	// seedrandom will not call math.random on its own again after
	// initialization.
	//
	mixkey(math.random(), pool);

	//
	// Nodejs and AMD support: export the implementation as a module using
	// either convention.
	//
	if (module.exports) {
	  module.exports = seedrandom;
	  // When in node.js, try using crypto package for autoseeding.
	  try {
	    nodecrypto = crypto;
	  } catch (ex) {}
	}

	// End anonymous scope, and pass initial values.
	})(
	  [],     // pool: entropy pool starts empty
	  Math    // math: package containing random, pow, and seedrandom
	);
	});

	// A library of seedable RNGs implemented in Javascript.
	//
	// Usage:
	//
	// var seedrandom = require('seedrandom');
	// var random = seedrandom(1); // or any seed.
	// var x = random();       // 0 <= x < 1.  Every bit is random.
	// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

	// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
	// Period: ~2^116
	// Reported to pass all BigCrush tests.


	// xor128, a pure xor-shift generator by George Marsaglia.
	// Period: 2^128-1.
	// Reported to fail: MatrixRank and LinearComp.


	// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
	// Period: 2^192-2^32
	// Reported to fail: CollisionOver, SimpPoker, and LinearComp.


	// xorshift7, by François Panneton and Pierre L'ecuyer, takes
	// a different approach: it adds robustness by allowing more shifts
	// than Marsaglia's original three.  It is a 7-shift generator
	// with 256 bits, that passes BigCrush with no systmatic failures.
	// Period 2^256-1.
	// No systematic BigCrush failures reported.


	// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
	// very long period that also adds a Weyl generator. It also passes
	// BigCrush with no systematic failures.  Its long period may
	// be useful if you have many generators and need to avoid
	// collisions.
	// Period: 2^4128-2^32.
	// No systematic BigCrush failures reported.


	// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
	// number generator derived from ChaCha, a modern stream cipher.
	// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
	// Period: ~2^127
	// No systematic BigCrush failures reported.


	// The original ARC4-based prng included in this library.
	// Period: ~2^1600


	seedrandom.alea = alea;
	seedrandom.xor128 = xor128;
	seedrandom.xorwow = xorwow;
	seedrandom.xorshift7 = xorshift7;
	seedrandom.xor4096 = xor4096;
	seedrandom.tychei = tychei;

	var seedrandom$1 = seedrandom;

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




	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return key => (result, value) => {
					const index = result.length;
					if (value === undefined || (options.skipNull && value === null)) {
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
					if (value === undefined || (options.skipNull && value === null)) {
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
					if (value === undefined || (options.skipNull && value === null)) {
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
			value = value === undefined ? null : options.arrayFormat === 'comma' ? value : decode(value, options);
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

		const formatter = encoderForArrayFormat(options);

		const objectCopy = Object.assign({}, object);
		if (options.skipNull) {
			for (const key of Object.keys(objectCopy)) {
				if (objectCopy[key] === undefined || objectCopy[key] === null) {
					delete objectCopy[key];
				}
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

	// Maps mouse coordinate from element CSS pixels to normalized [ 0, 1 ] range.
	function computeNormalizedPos(element, evt) {
	  var rect = element.getBoundingClientRect();
	  var x = evt.clientX - rect.left;
	  var y = evt.clientY - rect.top;
	  x /= element.clientWidth;
	  y /= element.clientHeight;
	  return [x, y];
	}

	class InputRecorder {
	  constructor(element, options) {
	    this.element = element;
	    this.clear();
	    this.options = options || {};
	  }

	  enable(forceReset) {
	    this.initTime = performance.now();
	    if (forceReset) {
	      this.clear();
	    }
	    this.injectListeners();
	  }
	/*
	  disable() {
	    this.removeListeners();
	  }
	*/

	  clear() {
	    this.frameNumber = 0;
	    this.events = [];
	  }

	  addEvent(type, event, parameters) {
	    var eventData = {
	      type,
	      event,
	      parameters
	    };

	    if (this.options.useTime) {
	      eventData.time = performance.now() - this.initTime;
	    } else {
	      eventData.frameNumber = this.frameNumber;
	    }

	    this.events.push(eventData);
	    if (this.options.newEventCallback) {
	      this.options.newEventCallback(eventData);
	    }
	  }
	  
	  injectListeners() {
	    this.element.addEventListener('mousedown', evt => {
	      var pos = computeNormalizedPos(this.element, evt);
	      this.addEvent('mouse', 'down', {x: pos[0], y: pos[1], button: evt.button});
	    });
	  
	    this.element.addEventListener('mouseup', evt => {
	      var pos = computeNormalizedPos(this.element, evt);
	      this.addEvent('mouse', 'up', {x: pos[0], y: pos[1], button: evt.button});
	    });
	  
	    this.element.addEventListener('mousemove', evt => {
	      var pos = computeNormalizedPos(this.element, evt);
	      this.addEvent('mouse', 'move', {x: pos[0], y: pos[1], button: evt.button});

	    });
	  
	    this.element.addEventListener('wheel', evt => {
	      this.addEvent('mouse', 'wheel', {
	        deltaX: evt.deltaX,
	        deltaY: evt.deltaY,
	        deltaZ: evt.deltaZ,
	        deltaMode: evt.deltaMode
	      });
	    });
	  
	    window.addEventListener('keydown', evt => {
	      this.addEvent('key', 'down', {
	        keyCode: evt.keyCode,
	        charCode: evt.charCode,
	        key: evt.key
	      });
	    });
	  
	    window.addEventListener('keyup', evt => {
	      this.addEvent('key', 'up', {
	        keyCode: evt.keyCode,
	        charCode: evt.charCode,
	        key: evt.key
	      });
	    });  
	  }
	}

	const DEFAULT_OPTIONS = {
	  dispatchKeyEventsViaDOM: true,
	  dispatchMouseEventsViaDOM: true,
	  needsCompleteCustomMouseEventFields: false
	};


	class InputReplayer {
	  constructor(element, recording, registeredEventListeners, options) {
	    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
	    this.element = element;
	    this.recording = recording;
	    this.currentIndex = 0;
	    this.registeredEventListeners = registeredEventListeners; // If === null -> Dispatch to DOM
	  }

	  tick (frameNumber) {
	    if (this.currentIndex >= this.recording.length) {
	      return;
	    }

	    if (this.recording[this.currentIndex].frameNumber > frameNumber) {
	      return;
	    }

	    while (this.currentIndex < this.recording.length && this.recording[this.currentIndex].frameNumber === frameNumber) {
	      const input = this.recording[this.currentIndex];
	      switch (input.type) {
	        case 'mouse': {
	          if (input.event === 'wheel') {
	            this.simulateWheelEvent(this.element, input.parameters);
	          } else {
	            this.simulateMouseEvent(this.element, input.type + input.event, input.parameters);
	          }
	        } break;
	        case 'key': {
	          this.simulateKeyEvent(this.element, input.type + input.event, input.parameters);
	        } break;
	        default: {
	          console.log('Still not implemented event', input.type);
	        }
	      }
	      this.currentIndex++;
	    }
	  }

	  simulateWheelEvent(element, parameters) {
	    var e = new Event('mousewheel', {bubbles: true});

	    const eventType = 'mousewheel';
	    e.deltaX = parameters.deltaX;
	    e.deltaY = parameters.deltaY;
	    e.deltaZ = parameters.deltaZ;

	    e.wheelDeltaX = parameters.deltaX;
	    e.wheelDeltaY = parameters.deltaY;
	    e.wheelDelta = parameters.deltaY;

	    e.deltaMode = parameters.deltaMode;
	    if (Array.isArray(this.registeredEventListeners) && this.options.dispatchMouseEventsViaDOM) {
	      for(var i = 0; i < this.registeredEventListeners.length; i++) {
	        var this_ = this.registeredEventListeners[i].context;
	        var type = this.registeredEventListeners[i].type;
	        var listener = this.registeredEventListeners[i].fun;
	        if (type == eventType) {
	          listener.call(this_, e);
	        }
	      }
	    }
	    else {
	      element.dispatchEvent(e);
	    }
	  }

	  simulateKeyEvent(element, eventType, parameters) {
	    // Don't use the KeyboardEvent object because of http://stackoverflow.com/questions/8942678/keyboardevent-in-chrome-keycode-is-0/12522752#12522752
	    // See also http://output.jsbin.com/awenaq/3
	    //    var e = document.createEvent('KeyboardEvent');
	    //    if (e.initKeyEvent) {
	    //      e.initKeyEvent(eventType, true, true, window, false, false, false, false, keyCode, charCode);
	    //  } else {
	    var e = document.createEventObject ? document.createEventObject() : document.createEvent("Events");
	    if (e.initEvent) {
	      e.initEvent(eventType, true, true);
	    }

	    e.keyCode = parameters.keyCode;
	    e.which = parameters.keyCode;
	    e.charCode = parameters.charCode;
	    e.programmatic = true;
	    e.key = parameters.key;

	    // Dispatch directly to Emscripten's html5.h API:
	    if (Array.isArray(this.registeredEventListeners) && this.options.dispatchKeyEventsViaDOM) {
	      for(var i = 0; i < this.registeredEventListeners.length; ++i) {
	        var this_ = this.registeredEventListeners[i].context;
	        var type = this.registeredEventListeners[i].type;
	        var listener = this.registeredEventListeners[i].fun;
	        if (type == eventType) listener.call(this_, e);
	      }
	    } else {
	      // Dispatch to browser for real
	      element.dispatchEvent ? element.dispatchEvent(e) : element.fireEvent("on" + eventType, e);
	    }
	  }

	  // eventType: "mousemove", "mousedown" or "mouseup".
	  // x and y: Normalized coordinate in the range [0,1] where to inject the event.
	  simulateMouseEvent(element, eventType, parameters) {
	    // Remap from [0,1] to canvas CSS pixel size.
	    var x = parameters.x;
	    var y = parameters.y;

	    x *= element.clientWidth;
	    y *= element.clientHeight;
	    var rect = element.getBoundingClientRect();

	    // Offset the injected coordinate from top-left of the client area to the top-left of the canvas.
	    x = Math.round(rect.left + x);
	    y = Math.round(rect.top + y);
	    var e = document.createEvent("MouseEvents");
	    e.initMouseEvent(eventType, true, true, window,
	                    eventType == 'mousemove' ? 0 : 1, x, y, x, y,
	                    0, 0, 0, 0,
	                    parameters.button, null);
	    e.programmatic = true;

	    if (Array.isArray(this.registeredEventListeners) && this.options.dispatchMouseEventsViaDOM) {
	      // Programmatically reating DOM events doesn't allow specifying offsetX & offsetY properly
	      // for the element, but they must be the same as clientX & clientY. Therefore we can't have a
	      // border that would make these different.
	      if (element.clientWidth != element.offsetWidth
	        || element.clientHeight != element.offsetHeight) {
	        throw "ERROR! Canvas object must have 0px border for direct mouse dispatch to work!";
	      }
	      for(var i = 0; i < this.registeredEventListeners.length; i++) {
	        var this_ = this.registeredEventListeners[i].context;
	        var type = this.registeredEventListeners[i].type;
	        var listener = this.registeredEventListeners[i].fun;
	        if (type == eventType) {
	          if (this.options.needsCompleteCustomMouseEventFields) {
	            // If needsCompleteCustomMouseEventFields is set, the page needs a full set of attributes
	            // specified in the MouseEvent object. However most fields on MouseEvent are read-only, so create
	            // a new custom object (without prototype chain) to hold the overridden properties.
	            var evt = {
	              currentTarget: this_,
	              srcElement: this_,
	              target: this_,
	              fromElement: this_,
	              toElement: this_,
	              eventPhase: 2, // Event.AT_TARGET
	              buttons: (eventType == 'mousedown') ? 1 : 0,
	              button: e.button,
	              altKey: e.altKey,
	              bubbles: e.bubbles,
	              cancelBubble: e.cancelBubble,
	              cancelable: e.cancelable,
	              clientX: e.clientX,
	              clientY: e.clientY,
	              ctrlKey: e.ctrlKey,
	              defaultPrevented: e.defaultPrevented,
	              detail: e.detail,
	              identifier: e.identifier,
	              isTrusted: e.isTrusted,
	              layerX: e.layerX,
	              layerY: e.layerY,
	              metaKey: e.metaKey,
	              movementX: e.movementX,
	              movementY: e.movementY,
	              offsetX: e.offsetX,
	              offsetY: e.offsetY,
	              pageX: e.pageX,
	              pageY: e.pageY,
	              path: e.path,
	              relatedTarget: e.relatedTarget,
	              returnValue: e.returnValue,
	              screenX: e.screenX,
	              screenY: e.screenY,
	              shiftKey: e.shiftKey,
	              sourceCapabilities: e.sourceCapabilities,
	              timeStamp: performance.now(),
	              type: e.type,
	              view: e.view,
	              which: e.which,
	              x: e.x,
	              y: e.y
	            };
	            listener.call(this_, evt);
	          } else {
	            // The regular 'e' object is enough (it doesn't populate all of the same fields than a real mouse event does, 
	            // so this might not work on some demos)
	            listener.call(this_, e);
	          }
	        }
	      }
	    } else {
	      // Dispatch directly to browser
	      element.dispatchEvent(e);
	    }
	  }
	}

	class EventListenerManager {
	  constructor() {
	    this.registeredEventListeners = [];
	  }

	  // Don't call any application page unload handlers as a response to window being closed.
	  ensureNoClientHandlers() {
	    // This is a bit tricky to manage, since the page could register these handlers at any point,
	    // so keep watching for them and remove them if any are added. This function is called multiple times
	    // in a semi-polling fashion to ensure these are not overridden.
	    if (window.onbeforeunload) window.onbeforeunload = null;
	    if (window.onunload) window.onunload = null;
	    if (window.onblur) window.onblur = null;
	    if (window.onfocus) window.onfocus = null;
	    if (window.onpagehide) window.onpagehide = null;
	    if (window.onpageshow) window.onpageshow = null;
	  }

	  unloadAllEventHandlers() {
	    for(var i in this.registeredEventListeners) {
	      var listener = this.registeredEventListeners[i];
	      listener.context.removeEventListener(listener.type, listener.fun, listener.useCapture);
	    }
	    this.registeredEventListeners = [];
	  
	    // Make sure no XHRs are being held on to either.
	    //preloadedXHRs = {};
	    //numPreloadXHRsInFlight = 0;
	    //XMLHttpRequest = realXMLHttpRequest;
	  
	    this.ensureNoClientHandlers();
	  }

	  //if (injectingInputStream)
	  enable() {

	    // Filter the page event handlers to only pass programmatically generated events to the site - all real user input needs to be discarded since we are
	    // doing a programmatic run.
	    var overriddenMessageTypes = ['mousedown', 'mouseup', 'mousemove',
	      'click', 'dblclick', 'keydown', 'keypress', 'keyup',
	      'pointerlockchange', 'pointerlockerror', 'webkitpointerlockchange', 'webkitpointerlockerror', 'mozpointerlockchange', 'mozpointerlockerror', 'mspointerlockchange', 'mspointerlockerror', 'opointerlockchange', 'opointerlockerror',
	      'devicemotion', 'deviceorientation',
	      'mouseenter', 'mouseleave',
	      'mousewheel', 'wheel', 'WheelEvent', 'DOMMouseScroll', 'contextmenu',
	      'blur', 'focus', 'visibilitychange', 'beforeunload', 'unload', 'error',
	      'pagehide', 'pageshow', 'orientationchange', 'gamepadconnected', 'gamepaddisconnected',
	      'fullscreenchange', 'fullscreenerror', 'mozfullscreenchange', 'mozfullscreenerror',
	      'MSFullscreenChange', 'MSFullscreenError', 'webkitfullscreenchange', 'webkitfullscreenerror',
	      'touchstart', 'touchmove', 'touchend', 'touchcancel',
	      'webglcontextlost', 'webglcontextrestored',
	      'mouseover', 'mouseout', 'pointerout', 'pointerdown', 'pointermove', 'pointerup', 'transitionend'];

	    // Some game demos programmatically fire the resize event. For Firefox and Chrome,
	    // we detect this via event.isTrusted and know to correctly pass it through, but to make Safari happy,
	    // it's just easier to let resize come through for those demos that need it.
	    // if (!Module['pageNeedsResizeEvent']) overriddenMessageTypes.push('resize');

	    // If context is specified, addEventListener is called using that as the 'this' object. Otherwise the current this is used.
	    var self = this;
	    var dispatchMouseEventsViaDOM = false;
	    var dispatchKeyEventsViaDOM = false;
	    function replaceEventListener(obj, context) {
	      var realAddEventListener = obj.addEventListener;
	      obj.addEventListener = function(type, listener, useCapture) {
	        self.ensureNoClientHandlers();
	        if (overriddenMessageTypes.indexOf(type) != -1) {
	          var registerListenerToDOM =
	               (type.indexOf('mouse') === -1 || dispatchMouseEventsViaDOM)
	            && (type.indexOf('key') === -1 || dispatchKeyEventsViaDOM);
	          var filteredEventListener = function(e) { try { if (e.programmatic || !e.isTrusted) listener(e); } catch(e) {} };
	          //!!! var filteredEventListener = listener;
	          if (registerListenerToDOM) realAddEventListener.call(context || this, type, filteredEventListener, useCapture);
	          self.registeredEventListeners.push({
	            context: context || this,
	            type: type,
	            fun: filteredEventListener,
	            useCapture: useCapture
	          });
	        } else {
	          realAddEventListener.call(context || this, type, listener, useCapture);
	          self.registeredEventListeners.push({
	            context: context || this,
	            type: type,
	            fun: listener,
	            useCapture: useCapture
	          });
	        }
	      };

	      var realRemoveEventListener = obj.removeEventListener;

	      obj.removeEventListener = function(type, listener, useCapture) {
	        // if (registerListenerToDOM)
	        //realRemoveEventListener.call(context || this, type, filteredEventListener, useCapture);
	        for (var i = 0; i < self.registeredEventListeners.length; i++) {
	          var eventListener = self.registeredEventListeners[i];
	          if (eventListener.context === this && eventListener.type === type && eventListener.fun === listener) {
	            self.registeredEventListeners.splice(i, 1);
	          }
	        }
	        
	      };
	    }
	    if (typeof EventTarget !== 'undefined') {
	      replaceEventListener(EventTarget.prototype, null);
	    }
	  }    
	}

	const DEFAULT_OPTIONS$1 = {
	  fontSize: 16,
	  keyStrokeDelay: 200, // Time before the line breaks
	  lingerDelay: 1000, // Time before the text fades away
	  fadeDuration: 1000,
	  bezelColor: '#000',
	  textColor: '#fff',
	  unmodifiedKey: true, // If pressing Alt+e show e, instead of €
	  showSymbol: true, // Convert ArrowLeft on ->
	  appendModifiers: {Meta: true, Alt: true, Shift: false}, // Append modifier to key all the time
	  position: 'bottom-left' // bottom-left, bottom-right, top-left, top-right
	};

	class KeystrokeVisualizer {
	  constructor() {
	    this.initialized = false;
	    this.container = null;
	    this.style = null;
	    this.keyStrokeTimeout = null;
	    this.options = {};
	    this.currentChunk = null;
	    this.keydown = this.keydown.bind(this);
	    this.keyup = this.keyup.bind(this);
	  }

	  cleanUp() {
	    function removeNode(node) {
	      if (node) {
	        node.parentNode.removeChild(node);
	      }
	    }
	    removeNode(this.container);
	    removeNode(this.style);
	    clearTimeout(this.keyStrokeTimeout);
	    this.currentChunk = null;
	    this.container = this.style = null;

	    window.removeEventListener('keydown', this.keydown);
	    window.removeEventListener('keyup', this.keyup);
	  }

	  injectComponents() {    
	    // Add container
	    this.container = document.createElement('ul');
	    document.body.appendChild(this.container);
	    this.container.className = 'keystrokes';
	    
	    const positions = {
	      'bottom-left': 'bottom: 0; left: 0;',
	      'bottom-right': 'bottom: 0; right: 0;',
	      'top-left': 'top: 0; left: 0;',
	      'top-right': 'top: 0; right: 0;',
	    };

	    if (!positions[this.options.position]) {
	      console.warn(`Invalid position '${this.options.position}', using default 'bottom-left'. Valid positions: `, Object.keys(positions));
	      this.options.position = 'bottom-left';
	    }

	    // Add classes
	    this.style = document.createElement('style');
	    this.style.innerHTML = `
      ul.keystrokes {
        padding-left: 10px;
        position: fixed;
        ${positions[this.options.position]}
      }
      
      ul.keystrokes li {
        font-family: Arial;
        background-color: ${this.options.bezelColor};
        opacity: 0.9;
        color: ${this.options.textColor};
        padding: 5px 10px;
        margin-bottom: 5px;
        border-radius: 10px;
        opacity: 1;
        font-size: ${this.options.fontSize}px;
        display: table;
        -webkit-transition: opacity ${this.options.fadeDuration}ms linear;
        transition: opacity ${this.options.fadeDuration}ms linear;
      }`;
	    document.body.appendChild(this.style);
	  }

	  convertKeyToSymbol(key) {
	    const conversionCommon = {
	      'ArrowRight': '→',
	      'ArrowLeft': '←',
	      'ArrowUp': '↑',
	      'ArrowDown': '↓',
	      ' ': '␣',
	      'Enter': '↩',
	      'Shift': '⇧',
	      'ShiftRight': '⇧',
	      'ShiftLeft': '⇧',
	      'Control': '⌃',
	      'Tab': '↹',
	      'CapsLock': '⇪'
	    };

	    const conversionMac = {
	      'Alt': '⌥',
	      'AltLeft': '⌥',
	      'AltRight': '⌥',
	      'Delete': '⌦',
	      'Escape': '⎋',
	      'Backspace': '⌫',
	      'Meta': '⌘',
	      'Tab': '⇥',
	      'PageDown': '⇟',
	      'PageUp': '⇞',
	      'Home': '↖',
	      'End': '↘'
	    };

	    return (navigator.platform === 'MacIntel' ? conversionMac[key] : null ) || conversionCommon[key] || key;
	  }

	  keydown(e) {
	    if (!this.currentChunk) {
	      this.currentChunk = document.createElement('li');
	      this.container.appendChild(this.currentChunk);
	    }
	    
	    var key = e.key;
	    if (this.options.unmodifiedKey) {
	      if (e.code.indexOf('Key') !== -1) {
	        key = e.code.replace('Key', '');
	        if (!e.shiftKey) {
	          key = key.toLowerCase();
	        }
	      }
	    }

	    var modifier = '';
	    
	    if (this.options.appendModifiers.Meta && e.metaKey && e.key !== 'Meta') { modifier += this.convertKeyToSymbol('Meta'); }
	    if (this.options.appendModifiers.Alt && e.altKey && e.key !== 'Alt') { modifier += this.convertKeyToSymbol('Alt'); }
	    if (this.options.appendModifiers.Shift && e.shiftKey && e.key !== 'Shift') { modifier += this.convertKeyToSymbol('Shift'); }
	    this.currentChunk.textContent += modifier + (this.options.showSymbol ? this.convertKeyToSymbol(key) : key);
	  }

	  keyup(e) {
	    if (!this.currentChunk) return;
	    
	    var options = this.options;

	    clearTimeout(this.keyStrokeTimeout);
	    this.keyStrokeTimeout = setTimeout(() => {
	      (function(previousChunk) {
	        setTimeout(() => {
	          previousChunk.style.opacity = 0;
	          setTimeout(() => {previousChunk.parentNode.removeChild(previousChunk);}, options.fadeDuration);
	        }, options.lingerDelay);
	      })(this.currentChunk);
	      
	      this.currentChunk = null;
	    }, options.keyStrokeDelay);
	  }

	  enable(options) {
	    this.cleanUp();    
	    this.options = Object.assign( {}, DEFAULT_OPTIONS$1, options || this.options);
	    this.injectComponents();  
	    window.addEventListener('keydown', this.keydown);
	    window.addEventListener('keyup', this.keyup);
	  }

	  disable() {
	    this.cleanUp();
	  }
	}

	var KeystrokeVisualizer$1 = new KeystrokeVisualizer();

	class InputHelpers {
	  initKeys() {
	    KeystrokeVisualizer$1.enable({unmodifiedKey: false});
	  }

	  initMouse() {
	    this.mouseDiv = document.createElement('div');
	    this.mouseDiv.id='mousediv';
	    this.mouseClick = document.createElement('div');
	    this.mouseClick.id='mouseclick';
	    this.mouseClick.style.cssText = `
      border-radius: 50%;
      width: 30px;
      height: 30px;
      background: #fff;
      position: absolute;
      left: 0px;
      top: 0px;
      border: 3px solid black;
      opacity: 0.5;
      visibility: hidden;
    `;

	    this.mouseDiv.style.cssText = `
      position: absolute;
      width: 30px;
      height: 30px;
      left: 0px;
      top: 0px;
      background-image: url('/cursor.svg');
      background-position: -8px -5px;
      z-index: 9999;
    `;
	    
	    this.canvas.parentNode.appendChild(this.mouseDiv);
	    this.canvas.parentNode.appendChild(this.mouseClick);

	    this.canvas.addEventListener('mousemove', (evt) => {
	      this.mouseDiv.style.left = evt.x + "px";
	      this.mouseDiv.style.top = evt.y + "px";

	      this.mouseClick.style.left = `${evt.x - 12}px`;
	      this.mouseClick.style.top = `${evt.y - 7}px`;
	    });

	    this.canvas.addEventListener('mousedown', evt => {
	      this.mouseClick.style.visibility = 'visible';
	    });
	    this.canvas.addEventListener('mouseup', evt => {
	      this.mouseClick.style.visibility = 'hidden';
	    });

	  }

	  constructor (canvas, options) {
	    this.canvas = canvas;
	    if (window.location.href.indexOf('show-keys') !== -1) {
	      this.initKeys();
	    }
	    if (window.location.href.indexOf('show-mouse') !== -1) {
	      this.initMouse();
	    }
	  }
	}

	var Context = window.webkitAudioContext ? window.webkitAudioContext : window.AudioContext;
	var oriDecodeData = Context.prototype.decodeAudioData;

	var WebAudioHook = {
	  stats: {
	    numAudioBuffers: 0,
	    totalDuration: 0,
	    totalLength: 0,
	    totalDecodeTime: 0
	  },
	  enable: function (fake) {
	    var self = this;
	    Context.prototype.decodeAudioData = function() {
	      var prev = performance.realNow();
	      if (fake) {
	        var ret = new Promise((resolve, reject) => {
	          self.stats.totalDecodeTime += performance.realNow() - prev;
	          resolve(new AudioBuffer({length: 1, sampleRate: 44100}));
	          self.stats.numAudioBuffers++;
	          self.stats.totalDuration += audioBuffer.duration;
	          self.stats.totalLength += audioBuffer.length;
	      });
	      } else {
	        var promise = oriDecodeData.apply(this, arguments);
	        var ret = new Promise((resolve, reject) => {
	          promise.then(audioBuffer => {
	            self.stats.totalDecodeTime += performance.realNow() - prev;
	            resolve(audioBuffer);
	            self.stats.numAudioBuffers++;
	            self.stats.totalDuration += audioBuffer.duration;
	            self.stats.totalLength += audioBuffer.length;
	          });
	        });
	      }
	      return ret;
	    };
	  },
	  disable: function () {
	    Context.prototype.decodeAudioData = oriDecodeData;
	  }
	};

	var WebVRHook = {
	  original: {
	    getVRDisplays: null,
	    addEventListener: null
	  },
	  currentVRDisplay: null,
	  auxFrameData: ( typeof window !== 'undefined' && 'VRFrameData' in window ) ? new window.VRFrameData() : null,
	  enable: function (callback) {
	    if (navigator.getVRDisplays) {
	      this.initEventListeners();
	      var origetVRDisplays = this.original.getVRDisplays = navigator.getVRDisplays;
	      var self = this;
	      navigator.getVRDisplays = function() {
	        var result = origetVRDisplays.apply(this, arguments);
	        return new Promise ((resolve, reject) => {
	          result.then(displays => {
	            var newDisplays = [];
	            displays.forEach(display => {
	              var newDisplay = self.hookVRDisplay(display);
	              newDisplays.push(newDisplay);
	              callback(newDisplay);
	            });
	            resolve(newDisplays);
	          });
	        });
	      };
	    }
	  },
	  disable: function () {},
	  initEventListeners: function () {
	    this.original.addEventListener = window.addEventListener;
	    var self = this;
	    window.addEventListener = function () {
	      var eventsFilter = ['vrdisplaypresentchange', 'vrdisplayconnect'];
	      if (eventsFilter.indexOf(arguments[0]) !== -1) {
	        var oldCallback = arguments[1];
	        arguments[1] = event => {
	          self.hookVRDisplay(event.display);
	          oldCallback(event);
	        };
	      }
	      var result = self.original.addEventListener.apply(this, arguments);
	    };
	  },
	  hookVRDisplay: function (display) {
	    // Todo modify the VRDisplay if needed for framedata and so on
	    return display;
	      /*
	    var oldGetFrameData = display.getFrameData.bind(display);
	    display.getFrameData = function(frameData) {

	      oldGetFrameData(frameData);
	  /*
	      var m = new THREE.Matrix4();

	      var x = Math.sin(performance.now()/1000);
	      var y = Math.sin(performance.now()/500)-1.2;

	      m.makeTranslation(x,y,-0.5);
	      var position = new THREE.Vector3();
	      var scale = new THREE.Vector3();
	      var quat = new THREE.Quaternion();
	      m.decompose(position,quat,scale);

	      frameData.pose.position[0] = -position.x;
	      frameData.pose.position[1] = -position.y;
	      frameData.pose.position[2] = -position.z;

	      for (var i=0;i<3;i++) {
	        frameData.pose.orientation[i] = 0;
	      }

	      for (var i=0;i<16;i++) {
	        frameData.leftViewMatrix[i] = m.elements[i];
	        frameData.rightViewMatrix[i] = m.elements[i];
	      }
	    /*
	      for (var i=0;i<16;i++) {
	        leftViewMatrix[i] = m.elements[i];
	        frameData.rightViewMatrix[i] = m.elements[i];
	      }
	      // camera.matrixWorld.decompose( cameraL.position, cameraL.quaternion, cameraL.scale );
	    }
	    */
	  }
	};

	function nearestNeighbor (src, dst) {
	  let pos = 0;

	  for (let y = 0; y < dst.height; y++) {
	    for (let x = 0; x < dst.width; x++) {
	      const srcX = Math.floor(x * src.width / dst.width);
	      const srcY = Math.floor(y * src.height / dst.height);

	      let srcPos = ((srcY * src.width) + srcX) * 4;

	      dst.data[pos++] = src.data[srcPos++]; // R
	      dst.data[pos++] = src.data[srcPos++]; // G
	      dst.data[pos++] = src.data[srcPos++]; // B
	      dst.data[pos++] = src.data[srcPos++]; // A
	    }
	  }
	}

	function resizeImageData(srcImageData, newImageData) {
	  nearestNeighbor(srcImageData, newImageData);
	}

	var pixelmatch_1 = pixelmatch;

	function pixelmatch(img1, img2, output, width, height, options) {

	    if (!options) options = {};

	    var threshold = options.threshold === undefined ? 0.1 : options.threshold;

	    // maximum acceptable square distance between two colors;
	    // 35215 is the maximum possible value for the YIQ difference metric
	    var maxDelta = 35215 * threshold * threshold,
	        diff = 0;

	    // compare each pixel of one image against the other one
	    for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {

	            var pos = (y * width + x) * 4;

	            // squared YUV distance between colors at this pixel position
	            var delta = colorDelta(img1, img2, pos, pos);

	            // the color difference is above the threshold
	            if (delta > maxDelta) {
	                // check it's a real rendering difference or just anti-aliasing
	                if (!options.includeAA && (antialiased(img1, x, y, width, height, img2) ||
	                                   antialiased(img2, x, y, width, height, img1))) {
	                    // one of the pixels is anti-aliasing; draw as yellow and do not count as difference
	                    if (output) drawPixel(output, pos, 255, 255, 0);

	                } else {
	                    // found substantial difference not caused by anti-aliasing; draw it as red
	                    if (output) drawPixel(output, pos, 255, 0, 0);
	                    diff++;
	                }

	            } else if (output) {
	                // pixels are similar; draw background as grayscale image blended with white
	                var val = blend(grayPixel(img1, pos), 0.1);
	                drawPixel(output, pos, val, val, val);
	            }
	        }
	    }

	    // return the number of different pixels
	    return diff;
	}

	// check if a pixel is likely a part of anti-aliasing;
	// based on "Anti-aliased Pixel and Intensity Slope Detector" paper by V. Vysniauskas, 2009

	function antialiased(img, x1, y1, width, height, img2) {
	    var x0 = Math.max(x1 - 1, 0),
	        y0 = Math.max(y1 - 1, 0),
	        x2 = Math.min(x1 + 1, width - 1),
	        y2 = Math.min(y1 + 1, height - 1),
	        pos = (y1 * width + x1) * 4,
	        zeroes = 0,
	        positives = 0,
	        negatives = 0,
	        min = 0,
	        max = 0,
	        minX, minY, maxX, maxY;

	    // go through 8 adjacent pixels
	    for (var x = x0; x <= x2; x++) {
	        for (var y = y0; y <= y2; y++) {
	            if (x === x1 && y === y1) continue;

	            // brightness delta between the center pixel and adjacent one
	            var delta = colorDelta(img, img, pos, (y * width + x) * 4, true);

	            // count the number of equal, darker and brighter adjacent pixels
	            if (delta === 0) zeroes++;
	            else if (delta < 0) negatives++;
	            else if (delta > 0) positives++;

	            // if found more than 2 equal siblings, it's definitely not anti-aliasing
	            if (zeroes > 2) return false;

	            if (!img2) continue;

	            // remember the darkest pixel
	            if (delta < min) {
	                min = delta;
	                minX = x;
	                minY = y;
	            }
	            // remember the brightest pixel
	            if (delta > max) {
	                max = delta;
	                maxX = x;
	                maxY = y;
	            }
	        }
	    }

	    if (!img2) return true;

	    // if there are no both darker and brighter pixels among siblings, it's not anti-aliasing
	    if (negatives === 0 || positives === 0) return false;

	    // if either the darkest or the brightest pixel has more than 2 equal siblings in both images
	    // (definitely not anti-aliased), this pixel is anti-aliased
	    return (!antialiased(img, minX, minY, width, height) && !antialiased(img2, minX, minY, width, height)) ||
	           (!antialiased(img, maxX, maxY, width, height) && !antialiased(img2, maxX, maxY, width, height));
	}

	// calculate color difference according to the paper "Measuring perceived color difference
	// using YIQ NTSC transmission color space in mobile applications" by Y. Kotsarenko and F. Ramos

	function colorDelta(img1, img2, k, m, yOnly) {
	    var a1 = img1[k + 3] / 255,
	        a2 = img2[m + 3] / 255,

	        r1 = blend(img1[k + 0], a1),
	        g1 = blend(img1[k + 1], a1),
	        b1 = blend(img1[k + 2], a1),

	        r2 = blend(img2[m + 0], a2),
	        g2 = blend(img2[m + 1], a2),
	        b2 = blend(img2[m + 2], a2),

	        y = rgb2y(r1, g1, b1) - rgb2y(r2, g2, b2);

	    if (yOnly) return y; // brightness difference only

	    var i = rgb2i(r1, g1, b1) - rgb2i(r2, g2, b2),
	        q = rgb2q(r1, g1, b1) - rgb2q(r2, g2, b2);

	    return 0.5053 * y * y + 0.299 * i * i + 0.1957 * q * q;
	}

	function rgb2y(r, g, b) { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
	function rgb2i(r, g, b) { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
	function rgb2q(r, g, b) { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

	// blend semi-transparent color with white
	function blend(c, a) {
	    return 255 + (c - 255) * a;
	}

	function drawPixel(output, pos, r, g, b) {
	    output[pos + 0] = r;
	    output[pos + 1] = g;
	    output[pos + 2] = b;
	    output[pos + 3] = 255;
	}

	function grayPixel(img, i) {
	    var a = img[i + 3] / 255,
	        r = blend(img[i + 0], a),
	        g = blend(img[i + 1], a),
	        b = blend(img[i + 2], a);
	    return rgb2y(r, g, b);
	}

	class PerfStats$1 {
	  constructor() {
	    this.n = 0;
	    this.min = Number.MAX_VALUE;
	    this.max = -Number.MAX_VALUE;
	    this.sum = 0;
	    this.mean = 0;
	    this.q = 0;
	  }

	  get variance() {
	    return this.q / this.n;
	  }

	  get standard_deviation() {
	    return Math.sqrt(this.q / this.n);
	  }

	  update(value) {
	    var num = parseFloat(value);
	    if (isNaN(num)) {
	      // Sorry, no NaNs
	      return;
	    }
	    this.n++;
	    this.min = Math.min(this.min, num);
	    this.max = Math.max(this.max, num);
	    this.sum += num;
	    const prevMean = this.mean;
	    this.mean = this.mean + (num - this.mean) / this.n;
	    this.q = this.q + (num - prevMean) * (num - this.mean);
	  }

	  getAll() {
	    return {
	      n: this.n,
	      min: this.min,
	      max: this.max,
	      sum: this.sum,
	      mean: this.mean,
	      variance: this.variance,
	      standard_deviation: this.standard_deviation
	    };
	  }  
	}

	function WebGLStats () {

	  var data = {
	    numDrawCalls: 0,

	    numDrawArraysCalls:0,
	    numDrawArraysInstancedCalls:0,
	    numDrawElementsCalls:0,
	    numDrawElementsInstancedCalls: 0,

	    numUseProgramCalls:0,
	    numFaces:0,
	    numVertices:0,
	    numPoints:0,
	    numBindTextures:0
	  };

	  var stats = {
	    drawCalls: new PerfStats$1(),
	    useProgramCalls: new PerfStats$1(),
	    faces: new PerfStats$1(),
	    vertices: new PerfStats$1(),
	    bindTextures: new PerfStats$1()
	  };

	  function frameEnd() {
	    for (let stat in stats) {
	      var counterName = 'num' + stat.charAt(0).toUpperCase() + stat.slice(1);
	      stats[stat].update(data[counterName]);
	    }
	  }

	  function _h ( f, c ) {
	    return function () {
	        c.apply( this, arguments );
	        f.apply( this, arguments );
	    };
	  }
	  
	  if ('WebGL2RenderingContext' in window) {
	    WebGL2RenderingContext.prototype.drawArraysInstanced = _h( WebGL2RenderingContext.prototype.drawArraysInstanced, function () {
	      data.numDrawArraysInstancedCalls++;
	      data.numDrawCalls++;
	      if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	      else data.numVertices += arguments[ 2 ];
	    });

	    WebGL2RenderingContext.prototype.drawElementsInstanced = _h( WebGL2RenderingContext.prototype.drawElementsInstanced, function () {
	      data.numDrawElementsInstancedCalls++;
	      data.numDrawCalls++;
	      if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	      else data.numVertices += arguments[ 2 ];
	    });

	    WebGL2RenderingContext.prototype.drawArrays = _h( WebGL2RenderingContext.prototype.drawArrays, function () {
	      data.numDrawArraysCalls++;
	      data.numDrawCalls++;
	      if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	      else data.numVertices += arguments[ 2 ];
	    } );
	    
	    WebGL2RenderingContext.prototype.drawElements = _h( WebGL2RenderingContext.prototype.drawElements, function () {
	      data.numDrawElementsCalls++;
	      data.numDrawCalls++;
	      data.numFaces += arguments[ 1 ] / 3;
	      data.numVertices += arguments[ 1 ];
	    } );
	    
	    WebGL2RenderingContext.prototype.useProgram = _h( WebGL2RenderingContext.prototype.useProgram, function () {
	      data.numUseProgramCalls++;
	    } );
	    
	    WebGL2RenderingContext.prototype.bindTexture = _h( WebGL2RenderingContext.prototype.bindTexture, function () {
	      data.numBindTextures++;
	    } );
	  
	  }

	  
	  WebGLRenderingContext.prototype.drawArrays = _h( WebGLRenderingContext.prototype.drawArrays, function () {
	    data.numDrawArraysCalls++;
	    data.numDrawCalls++;
	    if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	    else data.numVertices += arguments[ 2 ];
	  } );
	  
	  WebGLRenderingContext.prototype.drawElements = _h( WebGLRenderingContext.prototype.drawElements, function () {
	    data.numDrawElementsCalls++;
	    data.numDrawCalls++;
	    data.numFaces += arguments[ 1 ] / 3;
	    data.numVertices += arguments[ 1 ];
	  } );
	  
	  WebGLRenderingContext.prototype.useProgram = _h( WebGLRenderingContext.prototype.useProgram, function () {
	    data.numUseProgramCalls++;
	  } );
	  
	  WebGLRenderingContext.prototype.bindTexture = _h( WebGLRenderingContext.prototype.bindTexture, function () {
	    data.numBindTextures++;
	  } );
	  
	  function frameStart () {
	    data.numDrawCalls = 0;
	    data.numDrawArraysCalls = 0;
	    data.numDrawArraysInstancedCalls = 0;
	    data.numDrawElementsCalls = 0;
	    data.numDrawElementsInstancedCalls = 0;
	    data.numUseProgramCalls = 0;
	    data.numFaces = 0;
	    data.numVertices = 0;
	    data.numPoints = 0;
	    data.numBindTextures = 0;
	  }

	  function isWebGLContext(ctx) {
	    return (ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext));
	  }

	  function setupExtensions(context) {
	    if (!isWebGLContext(context)) {
	      console.warn("WEBGL-STATS: Provided context is not WebGL");
	      return;
	    }

	    var ext = context.getExtension('ANGLE_instanced_arrays');
	    if (!ext) {
	      return;
	    }
	    ext.drawArraysInstancedANGLE = _h( ext.drawArraysInstancedANGLE, function () {
	      data.numDrawArraysInstancedCalls++;
	      data.numDrawCalls++;
	      if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	      else data.numVertices += arguments[ 2 ];
	    });
	  
	    ext.drawElementsInstancedANGLE = _h( ext.drawElementsInstancedANGLE, function () {
	      data.numDrawElementsInstancedCalls++;
	      data.numDrawCalls++;
	      if ( arguments[ 0 ] == this.POINTS ) data.numPoints += arguments[ 2 ];
	      else data.numVertices += arguments[ 2 ];
	    });
	  }

	  function getSummary() {
	    var result = {};
	    Object.keys(stats).forEach(key => {
	      result[key] = {
	        min: stats[key].min,
	        max: stats[key].max,
	        avg: stats[key].mean,
	        standard_deviation: stats[key].standard_deviation
	      };
	    });
	    return result;
	  }
	  
	  return {
	    getCurrentData: () => {return data;},
	    setupExtensions: setupExtensions,
	    getSummary: getSummary,
	    frameStart: frameStart,
	    frameEnd: frameEnd
	    
	    //enable: enable,
	    //disable: disable
	  }
	}

	var WebGLStats$1 = WebGLStats();

	const parameters = queryString.parse(location.search);

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
	  XRready: false,
	  ready: false,
	  finished: false,
	  inputLoading: false,

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
	  mandatoryAutoEnterXR: typeof parameters['mandatory-autoenter-xr'] !== 'undefined',
	  numFramesToRender: typeof parameters['num-frames'] === 'undefined' ? 1000 : parseInt(parameters['num-frames']),

	  // Canvas used by the test to render
	  canvas: null,

	  inputRecorder: null,

	  // Wallclock time for when we started CPU execution of the current frame.
	  // var referenceTestT0 = -1;

	  isReady: function() {
	    // console.log(this.ready, this.XRready);
	    return this.ready && this.XRready;
	  },

	  preTick: function() {
	    if (GFXTESTS_CONFIG.preMainLoop) {
	      GFXTESTS_CONFIG.preMainLoop();
	    }

	    console.log('ready', this.ready, 'xrready', this.XRready);
	    if (this.isReady()) {
	      if (!this.started) {
	        this.started = true;
	      }
	      WebGLStats$1.frameStart();
	      // console.log('>> frame-start');
	      this.stats.frameStart();
	    }

	    if (!this.canvas) {
	      if (typeof parameters['no-rendering'] !== 'undefined') {
	        this.ready = true;
	      } else {
	        // We assume the last webgl context being initialized is the one used to rendering
	        // If that's different, the test should have a custom code to return that canvas
	        if (CanvasHook.getNumContexts() > 0) {
	          var context = CanvasHook.getContext(CanvasHook.getNumContexts() - 1);
	          this.canvas = context.canvas;

	          // Prevent events not defined as event-listeners
	          this.canvas.onmousedown = this.canvas.onmouseup = this.canvas.onmousemove = () => {};

	          // To prevent width & height 100%
	          function addStyleString(str) {
	            var node = document.createElement('style');
	            node.innerHTML = str;
	            document.body.appendChild(node);
	          }

	          addStyleString(`.gfxtests-canvas {width: ${this.canvasWidth}px !important; height: ${this.canvasHeight}px !important;}`);

	          // To fix A-Frame
	          addStyleString(`a-scene .a-canvas.gfxtests-canvas {width: ${this.canvasWidth}px !important; height: ${this.canvasHeight}px !important;}`);

	          this.canvas.classList.add('gfxtests-canvas');

	          this.onResize();

	          // CanvasHook
	          WebGLStats$1.setupExtensions(context);

	          if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
	            this.inputRecorder = new InputRecorder(this.canvas);
	            this.inputRecorder.enable();
	          }

	          if (typeof parameters['replay'] !== 'undefined' && GFXTESTS_CONFIG.input && !this.inputLoading) {
	            this.inputLoading = true;
	            fetch('/tests/' + GFXTESTS_CONFIG.input).then(response => {
	              return response.json();
	            })
	            .then(json => {
	              this.inputReplayer = new InputReplayer(this.canvas, json, this.eventListener.registeredEventListeners);
	              this.inputHelpers = new InputHelpers(this.canvas);
	              this.ready = true;
	            });
	          } else {
	            this.ready = true;
	          }
	        }
	        //@fixme else for canvas 2d without webgl
	      }
	    }

	    if (this.referenceTestFrameNumber === 0) ;

	    // referenceTestT0 = performance.realNow();
	    if (this.pageLoadTime === null) this.pageLoadTime = performance.realNow() - pageInitTime;

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    if (this.previousEventHandlerExitedTime != -1) {
	      this.accumulatedCpuIdleTime += performance.realNow() - this.previousEventHandlerExitedTime;
	      this.previousEventHandlerExitedTime = -1;
	    }
	  },

	  postTick: function () {
	    if (!this.ready || !this.XRready) {return;}

	    if (this.started){
	      // console.log('<< frameend');
	      this.stats.frameEnd();
	    }

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

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    this.previousEventHandlerExitedTime = performance.realNow();
	    WebGLStats$1.frameEnd();
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
	      if (typeof GFXTESTS_REFERENCEIMAGE_BASEURL === 'undefined') {
	        reject();
	        return;
	      }

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
	      };
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
	          var numDiffPixels = pixelmatch_1(expected, actual, diff.data, width, height, {threshold: threshold});
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

	    this.socket.emit('test_started', {id: GFXTESTS_CONFIG.id, testUUID: parameters['test-uuid']});

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

	  generateFailedBenchmarkResult: function (failReason) {
	    return {
	      test_id: GFXTESTS_CONFIG.id,
	      autoEnterXR: this.autoEnterXR,
	      revision: GFXTESTS_CONFIG.revision || 0,
	      numFrames: this.numFramesToRender,
	      pageLoadTime: this.pageLoadTime,
	      result: 'fail',
	      failReason: failReason
	    };
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
	          webgl: WebGLStats$1.getSummary()
	          // !!!! oculus_vrapi: this.
	        },
	        autoEnterXR: this.autoEnterXR,
	        revision: GFXTESTS_CONFIG.revision || 0,
	        webaudio: WebAudioHook.stats,
	        numFrames: this.numFramesToRender,
	        totalTime: totalTime,
	        timeToFirstFrame: this.firstFrameTime - pageInitTime,
	        avgFps: fps,
	        numStutterEvents: this.numStutterEvents,
	        totalRenderTime: totalRenderTime,
	        cpuTime: this.stats.totalTimeInMainLoop,
	        avgCpuTime: this.stats.totalTimeInMainLoop / this.numFramesToRender,
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
	    this.injectBenchmarkFinishedHTML();

	    if (this.inputRecorder) {
	      this.addInputDownloadButton();
	    }

	    try {
	      var data = this.canvas.toDataURL("image/png");
	      var description = this.inputRecorder ? 'Download reference image' : 'Actual render';
	      this.createDownloadImageLink(data, GFXTESTS_CONFIG.id, description);
	    } catch(e) {
	      console.error("Can't generate image", e);
	    }

	    if (this.inputRecorder) {
	      document.getElementById('test_finished').style.visibility = 'visible';
	      document.getElementById('reference-images-error').style.display = 'block';
	    } else {
	      this.generateBenchmarkResult().then(result => {
	        this.processBenchmarkResult(result);
	      });
	    }
	  },
	  injectBenchmarkFinishedHTML: function() {
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
	    divReferenceError.style.cssText = 'text-align:center; color: #f00;';
	    divReferenceError.innerHTML = '<h3></h3>';
	    divReferenceError.style.display = 'none';

	    div.appendChild(divReferenceError);
	    var divImg = document.createElement('div');
	    divImg.id = 'test_images';
	    divReferenceError.appendChild(divImg);

	    document.body.appendChild(div);
	  },
	  processBenchmarkResult: function(result) {
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
	        };
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
	    });
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
          box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);`;
	          divProgress.innerText = text;      }

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
	    window.alert = function(msg) { console.error('window.alert(' + msg + ')'); };
	    window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; };
	  },
	  RAFs: [], // Used to store instances of requestAnimationFrame's callbacks
	  prevRAFReference: null, // Previous called requestAnimationFrame callback
	  started: false,
	  requestAnimationFrame: function (callback) {
	    const hookedCallback = (p, frame) => {
	      if (this.finished) {
	        return;
	      }

	      /*
	      if (this.RAFs.length > 1) {
	        console.log('hookedCallback', this.RAFs);
	        console.log(callback);
	      }*/

	      // Push the callback to the list of currently running RAFs
	      if (this.RAFs.indexOf(callback) === -1 &&
	        this.RAFs.findIndex(f => f.toString() === callback.toString()) === -1) {
	        this.RAFs.push(callback);
	      }

	      // If the current callback is the first on the list, we assume the frame just started
	      // The .toString() is needed because of arrow functions
	      if (this.RAFs[0] === callback || this.RAFs[0].toString() === callback.toString()) {
	        console.log("pretick");
	        this.preTick();
	      }

	      if (frame) {
	        /*
	        let inputSources = [];
	        for (let source of frame.session.inputSources) {
	          if (source.gripSpace && source.gamepad) {
	            let sourcePose = frame.getPose(source.gripSpace, refSpace);

	            var transform = new XRRigidTransform(new DOMPoint(0, 1.6, 1, 1),new DOMPoint(0,0,0,1))

	            var newView = {
	              eye: view.eye,
	              projectionMatrix: view.projectionMatrix,
	              transform: transform,
	              originalView: view
	            };
	            newPose.views.push(newView);
	          }
	        }
	*/
	        let oriGetPose = frame.getPose;
	        frame.getPose = function() {
	          var pose = oriGetPose.apply(this, arguments);
	          if (pose) {
	            let amp = 0.5;
	            let freq = 0.0005;
	            let x = Math.sin(performance.now() * freq) * amp;
	            let y = Math.cos(performance.now() * freq) * amp;
	            return {
	              transform: new XRRigidTransform(new DOMPoint(x, 1.6 + y, -1, 1),new DOMPoint(0,0,0,1)),
	              emulatedPosition: false
	            };
	          } else {
	            return pose;
	          }
	        };

	        let oriGetViewerPose = frame.getViewerPose;
	        frame.getViewerPose = function() {
	          var pose = oriGetViewerPose.apply(this, arguments);
	          let newPose = {
	            views: []
	          };

	          var baseLayer = frame.session.renderState.baseLayer;
	          if (!baseLayer.oriGetViewport) {
	            baseLayer.oriGetViewport = baseLayer.getViewport;
	            baseLayer.getViewport = function() {
	              let view = arguments[0].originalView;
	              if (view) {
	                return baseLayer.oriGetViewport.apply(this, [view]);
	              } else {
	                console.log('>>>>>');
	                return baseLayer.oriGetViewport.apply(this, arguments);
	              }
	            };
	          }

	          if ( pose !== null ) {
	            var views = pose.views;
	            for ( var i = 0; i < views.length; i ++ ) {
	              var view = views[ i ];
	              var transform = new XRRigidTransform(new DOMPoint(0, 1.6, 0, 1),new DOMPoint(0,0,0,1));
	              var newView = {
	                eye: view.eye,
	                projectionMatrix: view.projectionMatrix,
	                transform: transform,
	                originalView: view
	              };
	              newPose.views.push(newView);
	            }
	          }
	          return newPose;
	        };
	      }
	      callback(performance.now(), frame);

	      // If reaching the last RAF, execute all the post code
	      // console.log(this.started);
	      //if (this.RAFs[ this.RAFs.length - 1 ] === callback && this.started) {
	      if ( (this.RAFs[ this.RAFs.length - 1 ] === callback ||
	            this.RAFs[ this.RAFs.length - 1 ].toString() === callback.toString()
	        )
	        && this.started) {
	        console.log("posttick", this.referenceTestFrameNumber);
	        // @todo Move all this logic to a function to clean up this one
	        this.postTick();

	        if (this.referenceTestFrameNumber === this.numFramesToRender) {
	          console.info('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FINISHED!');
	          this.releaseRAF();
	          this.finished = true;
	          this.benchmarkFinished();
	          return;
	        }

	        if (GFXTESTS_CONFIG.postMainLoop) {
	          GFXTESTS_CONFIG.postMainLoop();
	        }
	      }

	      // If the previous RAF is the same as now, just reset the list
	      // in case we have stopped calling some of the previous RAFs
	      //if (this.prevRAFReference === callback && (this.RAFs[0] !== callback || this.RAFs.length > 1)) {
	      if ((this.prevRAFReference === callback || this.prevRAFReference && this.prevRAFReference.toString() === callback.toString()) &&
	        (this.RAFs[0] !== callback || this.RAFs[0].toString() !== callback.toString() || this.RAFs.length > 1)) {
	        this.RAFs = [callback];
	      }
	      this.prevRAFReference = callback;
	    };
	    return this.currentRAFContext.realRequestAnimationFrame(hookedCallback);
	  },
	  currentRAFContext: window,
	  releaseRAF: function () {
	    this.RAFcontexts.forEach(context => {
	      context.requestAnimationFrame = () => {};
	    });

	    //this.currentRAFContext.requestAnimationFrame = () => {};
	    if ('VRDisplay' in window &&
	      this.currentRAFContext instanceof VRDisplay &&
	      this.currentRAFContext.isPresenting) {
	      this.currentRAFContext.exitPresent();
	    }
	  },
	  RAFcontexts: [],
	  hookRAF: function (context) {
	    console.log('Hooking', context);
	    if (!context.realRequestAnimationFrame) {
	      context.realRequestAnimationFrame = context.requestAnimationFrame;
	      this.RAFcontexts.push(context);
	    }
	    context.requestAnimationFrame = this.requestAnimationFrame.bind(this);
	    this.currentRAFContext = context;
	  },
	  unhookRAF: function (context) {
	    console.log('unhooking', context, context.realRequestAnimationFrame);
	    if (context.realRequestAnimationFrame) {
	      context.requestAnimationFrame = context.realRequestAnimationFrame;
	    }
	  },
	  init: function () {
	    this.initServer();

	    if (!GFXTESTS_CONFIG.providesRafIntegration) {
	      this.hookRAF(window);
	    }

	    this.addProgressBar();
	    this.addInfoOverlay();

	    console.log('Frames to render:', this.numFramesToRender);

	    if (!GFXTESTS_CONFIG.dontOverrideTime) {
	      FakeTimers.enable();
	    }

	    if (!GFXTESTS_CONFIG.dontOverrideWebAudio) {
	      WebAudioHook.enable(typeof parameters['fake-webaudio'] !== 'undefined');
	    }

	    // @todo Use config
	    WebVRHook.enable(vrdisplay => {
	      this.hookRAF(vrdisplay);
	    });

	    {
	      this.injectAutoEnterXR(this.canvas);
	      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
	        if (!supported) {
	          this.XRready = true;
	        }
	      });

	    }


	/*
	    window.addEventListener('vrdisplaypresentchange', evt => {
	      var display = evt.display;
	      if (display.isPresenting) {
	        this.unhookRAF(window);
	        this.hookRAF(display);
	      } else {
	        this.unhookRAF(display);
	        this.hookRAF(window);
	      }
	    });
	*/
	    Math.random = seedrandom$1(this.randomSeed);
	    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, {width: this.canvasWidth, height: this.canvasHeight}));
	    this.hookModals();

	    this.onResize();
	    window.addEventListener('resize', this.onResize.bind(this));

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
	  autoEnterXR: {
	    requested: false,
	    successful: false
	  },
	  XRsessions: [],
	  injectAutoEnterXR: function(canvas) {
	    this.autoEnterXR.requested = true;

	    let prevRequestSession = navigator.xr.requestSession;
	    WebXRHook.enable({
	      onSessionStarted: session => {
	        if (this.XRsessions.indexOf(session) === -1) {
	          this.XRsessions.push(session);
	          console.log('XRSession started', session);
	          this.XRready = true;
	          this.hookRAF(session);
	          // window.requestAnimationFrame = () => {};
	        }
	      },
	      onSessionEnded: session => {
	        console.log('XRSession ended');
	      }
	    });



	    /*
	    if ('xr' in navigator) {
				navigator.xr.isSessionSupported( 'immersive-vr' ).then(supported => {
	        if (supported) {
						var sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor' ] };
						navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( session => {

	          });
	        } else {
	          this.processBenchmarkResult(this.generateFailedBenchmarkResult('autoenter-xr failed'));
	        }
	      });
	      */
	/*
	      setTimeout(() => {
	        navigator.getVRDisplays().then(displays => {
	          var device = displays[0];
	          //if (device.isPresenting) device.exitPresent();
	          if (device) {
	            device.requestPresent( [ { source: canvas } ] )
	              .then(x => { console.log('autoenter XR successful'); this.autoEnterXR.successful = true; })
	              .catch(x => {
	                console.log('autoenter XR failed');
	                if (this.mandatoryAutoEnterXR) {
	                  setTimeout(x => {
	                    this.processBenchmarkResult(this.generateFailedBenchmarkResult('autoenter-xr failed'));
	                  },1000);
	                }
	              });
	          }
	        })
	      }, 500); // @fix to make it work on FxR
	    } else if (this.mandatoryAutoEnterXR) {
	      setTimeout(x => {
	        this.processBenchmarkResult(this.generateFailedBenchmarkResult('autoenter-xr failed'));
	      },1000);
	    }
	    */
	  },

	  onResize: function (e) {
	    if (e && e.origin === 'webgfxtest') return;

	    const DEFAULT_WIDTH = 800;
	    const DEFAULT_HEIGHT = 600;
	    this.canvasWidth = DEFAULT_WIDTH;
	    this.canvasHeight = DEFAULT_HEIGHT;

	    if (typeof parameters['keep-window-size'] === 'undefined') {
	      this.canvasWidth = typeof parameters['width'] === 'undefined' ? DEFAULT_WIDTH : parseInt(parameters['width']);
	      this.canvasHeight = typeof parameters['height'] === 'undefined' ? DEFAULT_HEIGHT : parseInt(parameters['height']);
	      window.innerWidth = this.canvasWidth;
	      window.innerHeight = this.canvasHeight;
	    }

	    if (this.canvas) {
	      this.canvas.width = this.canvasWidth;
	      this.canvas.height = this.canvasHeight;
	    }

	    var e = document.createEventObject ? document.createEventObject() : document.createEvent("Events");
	    if (e.initEvent) {
	      e.initEvent('resize', true, true);
	    }
	    e.origin = 'webgfxtest';
	    window.dispatchEvent ? window.dispatchEvent(e) : window.fireEvent("on" + eventType, e);
	  }
	};

	TESTER.init();

	var pageInitTime = performance.realNow();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi8uLi9jYW52YXMtaG9vay9mYWtlLXdlYmdsLmpzIiwiLi4vLi4vY2FudmFzLWhvb2svaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2VieHItaG9vay9pbmRleC5qcyIsIi4uLy4uL3BlcmZvcm1hbmNlLXN0YXRzL25vZGVfbW9kdWxlcy9pbmNyZW1lbnRhbC1zdGF0cy1saXRlL2luZGV4LmpzIiwiLi4vLi4vcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zcGxpdC1vbi1maXJzdC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZWNvcmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlcGxheWVyLmpzIiwiLi4vc3JjL2NsaWVudC9ldmVudC1saXN0ZW5lcnMuanMiLCIuLi9ub2RlX21vZHVsZXMva2V5c3Ryb2tlLXZpc3VhbGl6ZXIvc3JjL2luZGV4LmpzIiwiLi4vc3JjL2NsaWVudC9pbnB1dC1oZWxwZXJzLmpzIiwiLi4vc3JjL2NsaWVudC93ZWJhdWRpby1ob29rLmpzIiwiLi4vc3JjL2NsaWVudC93ZWJ2ci1ob29rLmpzIiwiLi4vc3JjL2NsaWVudC9pbWFnZS11dGlscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9waXhlbG1hdGNoL2luZGV4LmpzIiwiLi4vLi4vd2ViZ2wtc3RhdHMvbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi8uLi93ZWJnbC1zdGF0cy9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUmVhbERhdGUgPSBEYXRlO1xuXG5jbGFzcyBNb2NrRGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLnQgPSB0O1xuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBzdGF0aWMgcmVhbE5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lem9uZU9mZnNldCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHRvVGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXREYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXREYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldEZ1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0U2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VGltZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0WWVhcigpIHsgcmV0dXJuIDA7IH1cblxuICBzdGF0aWMgVVRDKCkgeyByZXR1cm4gMDsgfVxuXG4gIGdldFVUQ0RhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0RheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0hvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuXG4gIHNldERhdGUoKSB7fVxuICBzZXRGdWxsWWVhcigpIHt9XG4gIHNldEhvdXJzKCkge31cbiAgc2V0TWlsbGlzZWNvbmRzKCkge31cbiAgc2V0TWludXRlcygpIHt9XG4gIHNldE1vbnRoKCkge31cbiAgc2V0U2Vjb25kcygpIHt9XG4gIHNldFRpbWUoKSB7fVxuXG4gIHNldFVUQ0RhdGUoKSB7fVxuICBzZXRVVENGdWxsWWVhcigpIHt9XG4gIHNldFVUQ0hvdXJzKCkge31cbiAgc2V0VVRDTWlsbGlzZWNvbmRzKCkge31cbiAgc2V0VVRDTWludXRlcygpIHt9XG4gIHNldFVUQ01vbnRoKCkge31cblxuICBzZXRZZWFyKCkge31cbn1cblxudmFyIHJlYWxQZXJmb3JtYW5jZTtcblxuaWYgKCFwZXJmb3JtYW5jZS5yZWFsTm93KSB7XG4gIHZhciBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc1NhZmFyaSkge1xuICAgIHJlYWxQZXJmb3JtYW5jZSA9IHBlcmZvcm1hbmNlO1xuICAgIHBlcmZvcm1hbmNlID0ge1xuICAgICAgcmVhbE5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH0sXG4gICAgICBub3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtYW5jZS5yZWFsTm93ID0gcGVyZm9ybWFuY2Uubm93O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGltZVNjYWxlOiAxLjAsXG4gIGZha2VkVGltZTogMCxcbiAgZW5hYmxlZDogZmFsc2UsXG4gIHJlZnJlc2hSYXRlOiA2MCxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMubmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyKSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VsZi5mYWtlZFRpbWUgKiAxMDAwLjAgKiBzZWxmLnRpbWVTY2FsZSAvIHNlbGYucmVmcmVzaFJhdGU7IH1cbiAgICB9XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuXG4gICAgRGF0ZSA9IFJlYWxEYXRlO1xuICAgIHBlcmZvcm1hbmNlLm5vdyA9IHJlYWxQZXJmb3JtYW5jZS5ub3c7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufSIsImNvbnN0IG9yaWdpbmFsID0gWydnZXRQYXJhbWV0ZXInLCAnZ2V0RXh0ZW5zaW9uJywgJ2dldFNoYWRlclByZWNpc2lvbkZvcm1hdCddO1xuY29uc3QgZW1wdHlTdHJpbmcgPSBbJ2dldFNoYWRlckluZm9Mb2cnLCAnZ2V0UHJvZ3JhbUluZm9Mb2cnXTtcbmNvbnN0IHJldHVybjEgPSBbJ2lzQnVmZmVyJywgJ2lzRW5hYmxlZCcsICdpc0ZyYW1lYnVmZmVyJywgJ2lzUHJvZ3JhbScsICdpc1F1ZXJ5JywgJ2lzVmVydGV4QXJyYXknLCAnaXNTYW1wbGVyJywgJ2lzU3luYycsICdpc1RyYW5zZm9ybUZlZWRiYWNrJyxcbidpc1JlbmRlcmJ1ZmZlcicsICdpc1NoYWRlcicsICdpc1RleHR1cmUnLCAndmFsaWRhdGVQcm9ncmFtJywgJ2dldFNoYWRlclBhcmFtZXRlcicsICdnZXRQcm9ncmFtUGFyYW1ldGVyJ107XG5jb25zdCByZXR1cm4wID0gWydpc0NvbnRleHRMb3N0JywgJ2ZpbmlzaCcsICdmbHVzaCcsICdnZXRFcnJvcicsICdlbmRUcmFuc2Zvcm1GZWVkYmFjaycsICdwYXVzZVRyYW5zZm9ybUZlZWRiYWNrJywgJ3Jlc3VtZVRyYW5zZm9ybUZlZWRiYWNrJyxcbidhY3RpdmVUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb24nLCAnY2xlYXInLCAnY2xlYXJEZXB0aCcsICdjbGVhclN0ZW5jaWwnLCAnY29tcGlsZVNoYWRlcicsICdjdWxsRmFjZScsICdkZWxldGVCdWZmZXInLFxuJ2RlbGV0ZUZyYW1lYnVmZmVyJywgJ2RlbGV0ZVByb2dyYW0nLCAnZGVsZXRlUmVuZGVyYnVmZmVyJywgJ2RlbGV0ZVNoYWRlcicsICdkZWxldGVUZXh0dXJlJywgJ2RlcHRoRnVuYycsICdkZXB0aE1hc2snLCAnZGlzYWJsZScsICdkaXNhYmxlVmVydGV4QXR0cmliQXJyYXknLFxuJ2VuYWJsZScsICdlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheScsICdmcm9udEZhY2UnLCAnZ2VuZXJhdGVNaXBtYXAnLCAnbGluZVdpZHRoJywgJ2xpbmtQcm9ncmFtJywgJ3N0ZW5jaWxNYXNrJywgJ3VzZVByb2dyYW0nLCAnZGVsZXRlUXVlcnknLCAnZGVsZXRlVmVydGV4QXJyYXknLFxuJ2JpbmRWZXJ0ZXhBcnJheScsICdkcmF3QnVmZmVycycsICdyZWFkQnVmZmVyJywgJ2VuZFF1ZXJ5JywgJ2RlbGV0ZVNhbXBsZXInLCAnZGVsZXRlU3luYycsICdkZWxldGVUcmFuc2Zvcm1GZWVkYmFjaycsICdiZWdpblRyYW5zZm9ybUZlZWRiYWNrJyxcbidhdHRhY2hTaGFkZXInLCAnYmluZEJ1ZmZlcicsICdiaW5kRnJhbWVidWZmZXInLCAnYmluZFJlbmRlcmJ1ZmZlcicsICdiaW5kVGV4dHVyZScsICdibGVuZEVxdWF0aW9uU2VwYXJhdGUnLCAnYmxlbmRGdW5jJywgJ2RlcHRoUmFuZ2UnLCAnZGV0YWNoU2hhZGVyJywgJ2hpbnQnLFxuJ3BpeGVsU3RvcmVpJywgJ3BvbHlnb25PZmZzZXQnLCAnc2FtcGxlQ292ZXJhZ2UnLCAnc2hhZGVyU291cmNlJywgJ3N0ZW5jaWxNYXNrU2VwYXJhdGUnLCAndW5pZm9ybTFmJywgJ3VuaWZvcm0xZnYnLCAndW5pZm9ybTFpJywgJ3VuaWZvcm0xaXYnLFxuJ3VuaWZvcm0yZnYnLCAndW5pZm9ybTJpdicsICd1bmlmb3JtM2Z2JywgJ3VuaWZvcm0zaXYnLCAndW5pZm9ybTRmdicsICd1bmlmb3JtNGl2JywgJ3ZlcnRleEF0dHJpYjFmJywgJ3ZlcnRleEF0dHJpYjFmdicsICd2ZXJ0ZXhBdHRyaWIyZnYnLCAndmVydGV4QXR0cmliM2Z2Jyxcbid2ZXJ0ZXhBdHRyaWI0ZnYnLCAndmVydGV4QXR0cmliRGl2aXNvcicsICdiZWdpblF1ZXJ5JywgJ2ludmFsaWRhdGVGcmFtZWJ1ZmZlcicsICd1bmlmb3JtMXVpJywgJ3VuaWZvcm0xdWl2JywgJ3VuaWZvcm0ydWl2JywgJ3VuaWZvcm0zdWl2JywgJ3VuaWZvcm00dWl2Jyxcbid2ZXJ0ZXhBdHRyaWJJNGl2JywgJ3ZlcnRleEF0dHJpYkk0dWl2JywgJ2JpbmRTYW1wbGVyJywgJ2ZlbmNlU3luYycsICdiaW5kVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2JpbmRBdHRyaWJMb2NhdGlvbicsICdidWZmZXJEYXRhJywgJ2J1ZmZlclN1YkRhdGEnLCAnZHJhd0FycmF5cycsICdzdGVuY2lsRnVuYycsICdzdGVuY2lsT3AnLCAndGV4UGFyYW1ldGVyZicsICd0ZXhQYXJhbWV0ZXJpJywgJ3VuaWZvcm0yZicsICd1bmlmb3JtMmknLFxuJ3VuaWZvcm1NYXRyaXgyZnYnLCAndW5pZm9ybU1hdHJpeDNmdicsICd1bmlmb3JtTWF0cml4NGZ2JywgJ3ZlcnRleEF0dHJpYjJmJywgJ3VuaWZvcm0ydWknLCAndW5pZm9ybU1hdHJpeDJ4M2Z2JywgJ3VuaWZvcm1NYXRyaXgzeDJmdicsXG4ndW5pZm9ybU1hdHJpeDJ4NGZ2JywgJ3VuaWZvcm1NYXRyaXg0eDJmdicsICd1bmlmb3JtTWF0cml4M3g0ZnYnLCAndW5pZm9ybU1hdHJpeDR4M2Z2JywgJ2NsZWFyQnVmZmVyaXYnLCAnY2xlYXJCdWZmZXJ1aXYnLCAnY2xlYXJCdWZmZXJmdicsICdzYW1wbGVyUGFyYW1ldGVyaScsXG4nc2FtcGxlclBhcmFtZXRlcmYnLCAnY2xpZW50V2FpdFN5bmMnLCAnd2FpdFN5bmMnLCAndHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5ncycsICdiaW5kQnVmZmVyQmFzZScsICd1bmlmb3JtQmxvY2tCaW5kaW5nJyxcbidibGVuZENvbG9yJywgJ2JsZW5kRnVuY1NlcGFyYXRlJywgJ2NsZWFyQ29sb3InLCAnY29sb3JNYXNrJywgJ2RyYXdFbGVtZW50cycsICdmcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcicsICdyZW5kZXJidWZmZXJTdG9yYWdlJywgJ3NjaXNzb3InLCAnc3RlbmNpbEZ1bmNTZXBhcmF0ZScsXG4nc3RlbmNpbE9wU2VwYXJhdGUnLCAndW5pZm9ybTNmJywgJ3VuaWZvcm0zaScsICd2ZXJ0ZXhBdHRyaWIzZicsICd2aWV3cG9ydCcsICdkcmF3QXJyYXlzSW5zdGFuY2VkJywgJ3VuaWZvcm0zdWknLCAnY2xlYXJCdWZmZXJmaScsXG4nZnJhbWVidWZmZXJUZXh0dXJlMkQnLCAndW5pZm9ybTRmJywgJ3VuaWZvcm00aScsICd2ZXJ0ZXhBdHRyaWI0ZicsICdkcmF3RWxlbWVudHNJbnN0YW5jZWQnLCAnY29weUJ1ZmZlclN1YkRhdGEnLCAnZnJhbWVidWZmZXJUZXh0dXJlTGF5ZXInLFxuJ3JlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZScsICd0ZXhTdG9yYWdlMkQnLCAndW5pZm9ybTR1aScsICd2ZXJ0ZXhBdHRyaWJJNGknLCAndmVydGV4QXR0cmliSTR1aScsICd2ZXJ0ZXhBdHRyaWJJUG9pbnRlcicsICdiaW5kQnVmZmVyUmFuZ2UnLFxuJ3RleEltYWdlMkQnLCAndmVydGV4QXR0cmliUG9pbnRlcicsICdpbnZhbGlkYXRlU3ViRnJhbWVidWZmZXInLCAndGV4U3RvcmFnZTNEJywgJ2RyYXdSYW5nZUVsZW1lbnRzJyxcbidjb21wcmVzc2VkVGV4SW1hZ2UyRCcsICdyZWFkUGl4ZWxzJywgJ3RleFN1YkltYWdlMkQnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlMkQnLCAnY29weVRleEltYWdlMkQnLCAnY29weVRleFN1YkltYWdlMkQnLCAnY29tcHJlc3NlZFRleEltYWdlM0QnLFxuJ2NvcHlUZXhTdWJJbWFnZTNEJywgJ2JsaXRGcmFtZWJ1ZmZlcicsICd0ZXhJbWFnZTNEJywgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTNEJywgJ3RleFN1YkltYWdlM0QnXTtcbmNvbnN0IG51bGxzID0gW107XG5cbi8vIGdsLklOVCA9IDUxMjRcbmNvbnN0IGN1c3RvbUZ1bmN0aW9ucyA9IHtcblx0Z2V0QWN0aXZlVW5pZm9ybTogKCkgPT4geyByZXR1cm4ge25hbWU6IFwiXCIsIHNpemU6IDEsIHR5cGU6IDUxMjR9OyB9LFxuXHRnZXRBY3RpdmVBdHRyaWI6ICgpID0+IHsgcmV0dXJuIHtuYW1lOiBcIlwiLCBzaXplOiAxLCB0eXBlOiA1MTI0fTsgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZha2VXZWJHTChnbCkge1xuXHR0aGlzLmdsID0gZ2w7XG5cdGZvciAodmFyIGtleSBpbiBnbCkge1xuXHRcdGlmICh0eXBlb2YgZ2xba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0aWYgKG9yaWdpbmFsLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZ2xba2V5XS5iaW5kKGdsKTtcblx0XHRcdH0gZWxzZSBpZiAobnVsbHMuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiBudWxsO307XG5cdFx0XHR9IGVsc2UgaWYgKHJldHVybjAuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAwO307XG5cdFx0XHR9IGVsc2UgaWYgKHJldHVybjEuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAxO307XG5cdFx0XHR9IGVsc2UgaWYgKGVtcHR5U3RyaW5nLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gJyc7fTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGN1c3RvbUZ1bmN0aW9uc1trZXldICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBjdXN0b21GdW5jdGlvbnNba2V5XS5iaW5kKGdsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7fTtcblx0XHRcdFx0dGhpc1trZXldID0gZ2xba2V5XS5iaW5kKGdsKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpc1trZXldID0gZ2xba2V5XTtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCBGYWtlV2ViR0wgZnJvbSAnLi9mYWtlLXdlYmdsJztcblxudmFyIG9yaWdpbmFsR2V0Q29udGV4dCA9IEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0O1xuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdykge1xuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xufVxuXG52YXIgZW5hYmxlZCA9IGZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHdlYmdsQ29udGV4dHM6IFtdLFxuICBjYW52YXMyZENvbnRleHRzOiBbXSxcbiAgY29udGV4dHM6IFtdLFxuICBnZXROdW1Db250ZXh0czogZnVuY3Rpb24odHlwZSkge1xuICAgIGlmICh0eXBlID09PSBcIndlYmdsXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLndlYmdsQ29udGV4dHMubGVuZ3RoO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCIyZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYW52YXMyZENvbnRleHRzLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb250ZXh0cy5sZW5ndGg7XG4gIH0sXG4gIGdldENvbnRleHQ6IGZ1bmN0aW9uKGlkeCwgdHlwZSkge1xuICAgIGlmICh0eXBlID09PSBcIndlYmdsXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLndlYmdsQ29udGV4dHNbaWR4XTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiMmRcIikge1xuICAgICAgcmV0dXJuIHRoaXMuY2FudmFzMmRDb250ZXh0c1tpZHhdO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbnRleHRzW2lkeF07XG4gIH0sXG4gIGlzV2ViR0xDb250ZXh0OiBmdW5jdGlvbihjdHgpIHtcbiAgICByZXR1cm4gKGN0eCBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyaW5nQ29udGV4dCkgfHwgKHdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0ICYmIChjdHggaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSk7XG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmIChzZWxmLmlzV2ViR0xDb250ZXh0KGN0eCkpIHtcbiAgICAgICAgc2VsZi53ZWJnbENvbnRleHRzLnB1c2goY3R4KTtcbiAgICAgICAgc2VsZi5jb250ZXh0cy5wdXNoKGN0eCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKChjdHggaW5zdGFuY2VvZiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpKSB7XG4gICAgICAgIHNlbGYuY2FudmFzMmRDb250ZXh0cy5wdXNoKGN0eCk7XG4gICAgICAgIHNlbGYuY29udGV4dHMucHVzaChjdHgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGN0eDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDogJyArIG9wdGlvbnMud2lkdGggKyAncHg7IGhlaWdodDogJyArIG9wdGlvbnMuaGVpZ2h0ICsgJ3B4JztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICAgIGVuYWJsZWQgPSB0cnVlO1xuICB9LFxuXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHtyZXR1cm47fVxuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufTsiLCJ2YXIgb3JpZ2luYWxSZXF1ZXN0UHJlc2VudCA9IG5hdmlnYXRvci54ci5yZXF1ZXN0U2Vzc2lvbjtcblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzZXNzaW9uczogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgbmF2aWdhdG9yLnhyLnJlcXVlc3RTZXNzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVzID0gb3JpZ2luYWxSZXF1ZXN0UHJlc2VudC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmVzLnRoZW4oc2Vzc2lvbiA9PiB7XG4gICAgICAgIHNlbGYuc2Vzc2lvbnMucHVzaChzZXNzaW9uKTtcbiAgICAgICAgc2Vzc2lvbi5hZGRFdmVudExpc3RlbmVyKCdlbmQnLCBldmVudCA9PiB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMub25TZXNzaW9uRW5kKSB7XG4gICAgICAgICAgICBvcHRpb25zLm9uU2Vzc2lvbkVuZChldmVudC5zZXNzaW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm9uU2Vzc2lvblN0YXJ0ZWQpIHtcbiAgICAgICAgICBvcHRpb25zLm9uU2Vzc2lvblN0YXJ0ZWQoc2Vzc2lvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gIH0sXG5cbiAgZGlzYWJsZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG4gICAgbmF2aWdhdG9yLnhyLnJlcXVlc3RTZXNzaW9uID0gb3JpZ2luYWxSZXF1ZXN0UHJlc2VudDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn0iLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU3RhdHMgKCkge1xuICB0aGlzLm4gPSAwXG4gIHRoaXMubWluID0gTnVtYmVyLk1BWF9WQUxVRVxuICB0aGlzLm1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFXG4gIHRoaXMuc3VtID0gMFxuICB0aGlzLm1lYW4gPSAwXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncScsIHtcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogMFxuICB9KVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZhcmlhbmNlJywge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiAoKSA9PiB7IHJldHVybiB0aGlzLnEgLyB0aGlzLm4gfVxuICB9KVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3N0YW5kYXJkX2RldmlhdGlvbicsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogKCkgPT4geyByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubikgfVxuICB9KVxufVxuXG5TdGF0cy5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlICh2YWx1ZSkge1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSlcbiAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAvLyBTb3JyeSwgbm8gTmFOc1xuICAgIHJldHVyblxuICB9XG4gIHRoaXMubisrXG4gIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSlcbiAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKVxuICB0aGlzLnN1bSArPSBudW1cbiAgdmFyIHByZXZNZWFuID0gdGhpcy5tZWFuXG4gIHRoaXMubWVhbiA9IHRoaXMubWVhbiArIChudW0gLSB0aGlzLm1lYW4pIC8gdGhpcy5uXG4gIHRoaXMucSA9IHRoaXMucSArIChudW0gLSBwcmV2TWVhbikgKiAobnVtIC0gdGhpcy5tZWFuKVxufVxuXG5TdGF0cy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24gZ2V0QWxsICgpIHtcbiAgaWYgKHRoaXMubiA9PT0gMCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cbiAgdmFyIHMgPSB7XG4gICAgbjogdGhpcy5uLFxuICAgIG1pbjogdGhpcy5taW4sXG4gICAgbWF4OiB0aGlzLm1heCxcbiAgICBzdW06IHRoaXMuc3VtLFxuICAgIG1lYW46IHRoaXMubWVhbixcbiAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhbmRhcmRfZGV2aWF0aW9uXG4gIH1cbiAgcmV0dXJuIHNcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgLy92YXIgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID0gMDtcbiAgdmFyIGluc2lkZUZyYW1lID0gZmFsc2U7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKVxuICAgIH0sXG5cbiAgICBudW1GcmFtZXM6IDAsXG4gICAgbG9nOiBmYWxzZSxcbiAgICB0b3RhbFRpbWVJbk1haW5Mb29wOiAwLFxuICAgIHRvdGFsVGltZU91dHNpZGVNYWluTG9vcDogMCxcbiAgICBmcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWw6IDIwMCwgLy8gbXNlY3NcblxuICAgIGZyYW1lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy9pbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIC8vaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9PSAxKVxuICAgICAge1xuICAgICAgICBpZiAobGFzdFVwZGF0ZVRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0cygpO1xuICAgICAgICBpbnNpZGVGcmFtZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpIHtcbiAgICAgICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzICogMTAwMCAvICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgICB0aGlzLm51bUZyYW1lcyA9IDA7XG4gICAgICAgIGxhc3RVcGRhdGVUaW1lID0gdGltZU5vdztcblxuICAgICAgICBpZiAoZmlyc3RGcHMpIHtcbiAgICAgICAgICBmaXJzdEZwcyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdHMuZnBzLnVwZGF0ZShmcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxvZykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBmcHMgLSBtaW46ICR7dGhpcy5zdGF0cy5mcHMubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZnBzLm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5mcHMubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZnBzLnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBtcyAgLSBtaW46ICR7dGhpcy5zdGF0cy5kdC5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5kdC5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZHQubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZHQuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYGNwdSAtIG1pbjogJHt0aGlzLnN0YXRzLmNwdS5taW4udG9GaXhlZCgyKX0lIC8gYXZnOiAke3RoaXMuc3RhdHMuY3B1Lm1lYW4udG9GaXhlZCgyKX0lIC8gbWF4OiAke3RoaXMuc3RhdHMuY3B1Lm1heC50b0ZpeGVkKDIpfSUgLSBzdGQ6ICR7dGhpcy5zdGF0cy5jcHUuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9JWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBpbiB0aGUgZW5kIG9mIGVhY2ggbWFpbiBsb29wIGZyYW1lIHRpY2suXG4gICAgZnJhbWVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgLy9pbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXItLTtcbiAgICAgIC8vaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG4gICAgICBpZiAoIWluc2lkZUZyYW1lKSByZXR1cm47XG5cbiAgICAgIGluc2lkZUZyYW1lID0gZmFsc2U7XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZywgc2VwYXJhdG9yKSA9PiB7XG5cdGlmICghKHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnICYmIHR5cGVvZiBzZXBhcmF0b3IgPT09ICdzdHJpbmcnKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIHRoZSBhcmd1bWVudHMgdG8gYmUgb2YgdHlwZSBgc3RyaW5nYCcpO1xuXHR9XG5cblx0aWYgKHNlcGFyYXRvciA9PT0gJycpIHtcblx0XHRyZXR1cm4gW3N0cmluZ107XG5cdH1cblxuXHRjb25zdCBzZXBhcmF0b3JJbmRleCA9IHN0cmluZy5pbmRleE9mKHNlcGFyYXRvcik7XG5cblx0aWYgKHNlcGFyYXRvckluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBbc3RyaW5nXTtcblx0fVxuXG5cdHJldHVybiBbXG5cdFx0c3RyaW5nLnNsaWNlKDAsIHNlcGFyYXRvckluZGV4KSxcblx0XHRzdHJpbmcuc2xpY2Uoc2VwYXJhdG9ySW5kZXggKyBzZXBhcmF0b3IubGVuZ3RoKVxuXHRdO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHN0cmljdFVyaUVuY29kZSA9IHJlcXVpcmUoJ3N0cmljdC11cmktZW5jb2RlJyk7XG5jb25zdCBkZWNvZGVDb21wb25lbnQgPSByZXF1aXJlKCdkZWNvZGUtdXJpLWNvbXBvbmVudCcpO1xuY29uc3Qgc3BsaXRPbkZpcnN0ID0gcmVxdWlyZSgnc3BsaXQtb24tZmlyc3QnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHJlc3VsdC5sZW5ndGg7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnWycsIGluZGV4LCAnXSddLmpvaW4oJycpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0Li4ucmVzdWx0LFxuXHRcdFx0XHRcdFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1snLCBlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLCAnXT0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKVxuXHRcdFx0XHRdO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCAob3B0aW9ucy5za2lwTnVsbCAmJiB2YWx1ZSA9PT0gbnVsbCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdJ10uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdjb21tYSc6XG5cdFx0Y2FzZSAnc2VwYXJhdG9yJzpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtbZW5jb2RlKGtleSwgb3B0aW9ucyksICc9JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFtbcmVzdWx0LCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpXTtcblx0XHRcdH07XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCAob3B0aW9ucy5za2lwTnVsbCAmJiB2YWx1ZSA9PT0gbnVsbCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIGVuY29kZShrZXksIG9wdGlvbnMpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICc9JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC8oXFxbXFxdKSQvLmV4ZWMoa2V5KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbdmFsdWVdO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2NvbW1hJzpcblx0XHRjYXNlICdzZXBhcmF0b3InOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRjb25zdCBpc0FycmF5ID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS5zcGxpdCgnJykuaW5kZXhPZihvcHRpb25zLmFycmF5Rm9ybWF0U2VwYXJhdG9yKSA+IC0xO1xuXHRcdFx0XHRjb25zdCBuZXdWYWx1ZSA9IGlzQXJyYXkgPyB2YWx1ZS5zcGxpdChvcHRpb25zLmFycmF5Rm9ybWF0U2VwYXJhdG9yKS5tYXAoaXRlbSA9PiBkZWNvZGUoaXRlbSwgb3B0aW9ucykpIDogdmFsdWUgPT09IG51bGwgPyB2YWx1ZSA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBuZXdWYWx1ZTtcblx0XHRcdH07XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFycmF5Rm9ybWF0U2VwYXJhdG9yKHZhbHVlKSB7XG5cdGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnIHx8IHZhbHVlLmxlbmd0aCAhPT0gMSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2FycmF5Rm9ybWF0U2VwYXJhdG9yIG11c3QgYmUgc2luZ2xlIGNoYXJhY3RlciBzdHJpbmcnKTtcblx0fVxufVxuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZW5jb2RlKSB7XG5cdFx0cmV0dXJuIG9wdGlvbnMuc3RyaWN0ID8gc3RyaWN0VXJpRW5jb2RlKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5kZWNvZGUpIHtcblx0XHRyZXR1cm4gZGVjb2RlQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5c1NvcnRlcihpbnB1dCkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcblx0XHRyZXR1cm4gaW5wdXQuc29ydCgpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4ga2V5c1NvcnRlcihPYmplY3Qua2V5cyhpbnB1dCkpXG5cdFx0XHQuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuXHRcdFx0Lm1hcChrZXkgPT4gaW5wdXRba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUhhc2goaW5wdXQpIHtcblx0Y29uc3QgaGFzaFN0YXJ0ID0gaW5wdXQuaW5kZXhPZignIycpO1xuXHRpZiAoaGFzaFN0YXJ0ICE9PSAtMSkge1xuXHRcdGlucHV0ID0gaW5wdXQuc2xpY2UoMCwgaGFzaFN0YXJ0KTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxuZnVuY3Rpb24gZ2V0SGFzaCh1cmwpIHtcblx0bGV0IGhhc2ggPSAnJztcblx0Y29uc3QgaGFzaFN0YXJ0ID0gdXJsLmluZGV4T2YoJyMnKTtcblx0aWYgKGhhc2hTdGFydCAhPT0gLTEpIHtcblx0XHRoYXNoID0gdXJsLnNsaWNlKGhhc2hTdGFydCk7XG5cdH1cblxuXHRyZXR1cm4gaGFzaDtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdChpbnB1dCkge1xuXHRpbnB1dCA9IHJlbW92ZUhhc2goaW5wdXQpO1xuXHRjb25zdCBxdWVyeVN0YXJ0ID0gaW5wdXQuaW5kZXhPZignPycpO1xuXHRpZiAocXVlcnlTdGFydCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVZhbHVlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLnBhcnNlTnVtYmVycyAmJiAhTnVtYmVyLmlzTmFOKE51bWJlcih2YWx1ZSkpICYmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSAhPT0gJycpKSB7XG5cdFx0dmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXHR9IGVsc2UgaWYgKG9wdGlvbnMucGFyc2VCb29sZWFucyAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAodmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ3RydWUnIHx8IHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICdmYWxzZScpKSB7XG5cdFx0dmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZSc7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRkZWNvZGU6IHRydWUsXG5cdFx0c29ydDogdHJ1ZSxcblx0XHRhcnJheUZvcm1hdDogJ25vbmUnLFxuXHRcdGFycmF5Rm9ybWF0U2VwYXJhdG9yOiAnLCcsXG5cdFx0cGFyc2VOdW1iZXJzOiBmYWxzZSxcblx0XHRwYXJzZUJvb2xlYW5zOiBmYWxzZVxuXHR9LCBvcHRpb25zKTtcblxuXHR2YWxpZGF0ZUFycmF5Rm9ybWF0U2VwYXJhdG9yKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdC8vIENyZWF0ZSBhbiBvYmplY3Qgd2l0aCBubyBwcm90b3R5cGVcblx0Y29uc3QgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuXHRpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRpbnB1dCA9IGlucHV0LnRyaW0oKS5yZXBsYWNlKC9eWz8jJl0vLCAnJyk7XG5cblx0aWYgKCFpbnB1dCkge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmb3IgKGNvbnN0IHBhcmFtIG9mIGlucHV0LnNwbGl0KCcmJykpIHtcblx0XHRsZXQgW2tleSwgdmFsdWVdID0gc3BsaXRPbkZpcnN0KG9wdGlvbnMuZGVjb2RlID8gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykgOiBwYXJhbSwgJz0nKTtcblxuXHRcdC8vIE1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0Ly8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuXHRcdHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvcHRpb25zLmFycmF5Rm9ybWF0ID09PSAnY29tbWEnID8gdmFsdWUgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXHRcdGZvcm1hdHRlcihkZWNvZGUoa2V5LCBvcHRpb25zKSwgdmFsdWUsIHJldCk7XG5cdH1cblxuXHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhyZXQpKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0Zm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKHZhbHVlKSkge1xuXHRcdFx0XHR2YWx1ZVtrXSA9IHBhcnNlVmFsdWUodmFsdWVba10sIG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXRba2V5XSA9IHBhcnNlVmFsdWUodmFsdWUsIG9wdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChvcHRpb25zLnNvcnQgPT09IGZhbHNlKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHJldHVybiAob3B0aW9ucy5zb3J0ID09PSB0cnVlID8gT2JqZWN0LmtleXMocmV0KS5zb3J0KCkgOiBPYmplY3Qua2V5cyhyZXQpLnNvcnQob3B0aW9ucy5zb3J0KSkucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gcmV0W2tleV07XG5cdFx0aWYgKEJvb2xlYW4odmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHQvLyBTb3J0IG9iamVjdCBrZXlzLCBub3QgdmFsdWVzXG5cdFx0XHRyZXN1bHRba2V5XSA9IGtleXNTb3J0ZXIodmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRba2V5XSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sIE9iamVjdC5jcmVhdGUobnVsbCkpO1xufVxuXG5leHBvcnRzLmV4dHJhY3QgPSBleHRyYWN0O1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuXG5leHBvcnRzLnN0cmluZ2lmeSA9IChvYmplY3QsIG9wdGlvbnMpID0+IHtcblx0aWYgKCFvYmplY3QpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0ZW5jb2RlOiB0cnVlLFxuXHRcdHN0cmljdDogdHJ1ZSxcblx0XHRhcnJheUZvcm1hdDogJ25vbmUnLFxuXHRcdGFycmF5Rm9ybWF0U2VwYXJhdG9yOiAnLCdcblx0fSwgb3B0aW9ucyk7XG5cblx0dmFsaWRhdGVBcnJheUZvcm1hdFNlcGFyYXRvcihvcHRpb25zLmFycmF5Rm9ybWF0U2VwYXJhdG9yKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Y29uc3Qgb2JqZWN0Q29weSA9IE9iamVjdC5hc3NpZ24oe30sIG9iamVjdCk7XG5cdGlmIChvcHRpb25zLnNraXBOdWxsKSB7XG5cdFx0Zm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMob2JqZWN0Q29weSkpIHtcblx0XHRcdGlmIChvYmplY3RDb3B5W2tleV0gPT09IHVuZGVmaW5lZCB8fCBvYmplY3RDb3B5W2tleV0gPT09IG51bGwpIHtcblx0XHRcdFx0ZGVsZXRlIG9iamVjdENvcHlba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0Q29weSk7XG5cblx0aWYgKG9wdGlvbnMuc29ydCAhPT0gZmFsc2UpIHtcblx0XHRrZXlzLnNvcnQob3B0aW9ucy5zb3J0KTtcblx0fVxuXG5cdHJldHVybiBrZXlzLm1hcChrZXkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gb2JqZWN0W2tleV07XG5cblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIHZhbHVlXG5cdFx0XHRcdC5yZWR1Y2UoZm9ybWF0dGVyKGtleSksIFtdKVxuXHRcdFx0XHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpO1xufTtcblxuZXhwb3J0cy5wYXJzZVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHVybDogcmVtb3ZlSGFzaChpbnB1dCkuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuXG5leHBvcnRzLnN0cmluZ2lmeVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRjb25zdCB1cmwgPSByZW1vdmVIYXNoKGlucHV0LnVybCkuc3BsaXQoJz8nKVswXSB8fCAnJztcblx0Y29uc3QgcXVlcnlGcm9tVXJsID0gZXhwb3J0cy5leHRyYWN0KGlucHV0LnVybCk7XG5cdGNvbnN0IHBhcnNlZFF1ZXJ5RnJvbVVybCA9IGV4cG9ydHMucGFyc2UocXVlcnlGcm9tVXJsKTtcblx0Y29uc3QgaGFzaCA9IGdldEhhc2goaW5wdXQudXJsKTtcblx0Y29uc3QgcXVlcnkgPSBPYmplY3QuYXNzaWduKHBhcnNlZFF1ZXJ5RnJvbVVybCwgaW5wdXQucXVlcnkpO1xuXHRsZXQgcXVlcnlTdHJpbmcgPSBleHBvcnRzLnN0cmluZ2lmeShxdWVyeSwgb3B0aW9ucyk7XG5cdGlmIChxdWVyeVN0cmluZykge1xuXHRcdHF1ZXJ5U3RyaW5nID0gYD8ke3F1ZXJ5U3RyaW5nfWA7XG5cdH1cblxuXHRyZXR1cm4gYCR7dXJsfSR7cXVlcnlTdHJpbmd9JHtoYXNofWA7XG59O1xuIiwiLy8gTWFwcyBtb3VzZSBjb29yZGluYXRlIGZyb20gZWxlbWVudCBDU1MgcGl4ZWxzIHRvIG5vcm1hbGl6ZWQgWyAwLCAxIF0gcmFuZ2UuXG5mdW5jdGlvbiBjb21wdXRlTm9ybWFsaXplZFBvcyhlbGVtZW50LCBldnQpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICB2YXIgeSA9IGV2dC5jbGllbnRZIC0gcmVjdC50b3A7XG4gIHggLz0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgeSAvPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgcmV0dXJuIFt4LCB5XTtcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0UmVjb3JkZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fMKge307XG4gIH1cblxuICBlbmFibGUoZm9yY2VSZXNldCkge1xuICAgIHRoaXMuaW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoZm9yY2VSZXNldCkge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICB0aGlzLmluamVjdExpc3RlbmVycygpO1xuICB9XG4vKlxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKCk7XG4gIH1cbiovXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5mcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIGFkZEV2ZW50KHR5cGUsIGV2ZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgIHR5cGUsXG4gICAgICBldmVudCxcbiAgICAgIHBhcmFtZXRlcnNcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VUaW1lKSB7XG4gICAgICBldmVudERhdGEudGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5pbml0VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnREYXRhLmZyYW1lTnVtYmVyID0gdGhpcy5mcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50RGF0YSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9wdGlvbnMubmV3RXZlbnRDYWxsYmFjayhldmVudERhdGEpO1xuICAgIH1cbiAgfVxuICBcbiAgaW5qZWN0TGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ2Rvd24nLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAndXAnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICdtb3ZlJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcblxuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnd2hlZWwnLCB7XG4gICAgICAgIGRlbHRhWDogZXZ0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBldnQuZGVsdGFZLFxuICAgICAgICBkZWx0YVo6IGV2dC5kZWx0YVosXG4gICAgICAgIGRlbHRhTW9kZTogZXZ0LmRlbHRhTW9kZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICdkb3duJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICd1cCcsIHtcbiAgICAgICAga2V5Q29kZTogZXZ0LmtleUNvZGUsXG4gICAgICAgIGNoYXJDb2RlOiBldnQuY2hhckNvZGUsXG4gICAgICAgIGtleTogZXZ0LmtleVxuICAgICAgfSk7XG4gICAgfSk7ICBcbiAgfVxufSIsIlxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgbmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHM6IGZhbHNlXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBJbnB1dFJlcGxheWVyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgcmVjb3JkaW5nLCByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5yZWNvcmRpbmcgPSByZWNvcmRpbmc7XG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzOyAvLyBJZiA9PT0gbnVsbCAtPiBEaXNwYXRjaCB0byBET01cbiAgfVxuXG4gIHRpY2sgKGZyYW1lTnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucmVjb3JkaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPiBmcmFtZU51bWJlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucmVjb3JkaW5nLmxlbmd0aCAmJiB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPT09IGZyYW1lTnVtYmVyKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICAgIHN3aXRjaCAoaW5wdXQudHlwZSkge1xuICAgICAgICBjYXNlICdtb3VzZSc6IHtcbiAgICAgICAgICBpZiAoaW5wdXQuZXZlbnQgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVXaGVlbEV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGNhc2UgJ2tleSc6IHtcbiAgICAgICAgICB0aGlzLnNpbXVsYXRlS2V5RXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC50eXBlICsgaW5wdXQuZXZlbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1N0aWxsIG5vdCBpbXBsZW1lbnRlZCBldmVudCcsIGlucHV0LnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRJbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHNpbXVsYXRlV2hlZWxFdmVudChlbGVtZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGUgPSBuZXcgRXZlbnQoJ21vdXNld2hlZWwnLCB7YnViYmxlczogdHJ1ZX0pO1xuXG4gICAgY29uc3QgZXZlbnRUeXBlID0gJ21vdXNld2hlZWwnO1xuICAgIGUuZGVsdGFYID0gcGFyYW1ldGVycy5kZWx0YVg7XG4gICAgZS5kZWx0YVkgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcbiAgICBlLmRlbHRhWiA9IHBhcmFtZXRlcnMuZGVsdGFaO1xuXG4gICAgZS53aGVlbERlbHRhWCA9IHBhcmFtZXRlcnMuZGVsdGFYO1xuICAgIGUud2hlZWxEZWx0YVkgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcbiAgICBlLndoZWVsRGVsdGEgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcblxuICAgIGUuZGVsdGFNb2RlID0gcGFyYW1ldGVycy5kZWx0YU1vZGU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkge1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH1cbiAgfVxuXG4gIHNpbXVsYXRlS2V5RXZlbnQoZWxlbWVudCwgZXZlbnRUeXBlLCBwYXJhbWV0ZXJzKSB7XG4gICAgLy8gRG9uJ3QgdXNlIHRoZSBLZXlib2FyZEV2ZW50IG9iamVjdCBiZWNhdXNlIG9mIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODk0MjY3OC9rZXlib2FyZGV2ZW50LWluLWNocm9tZS1rZXljb2RlLWlzLTAvMTI1MjI3NTIjMTI1MjI3NTJcbiAgICAvLyBTZWUgYWxzbyBodHRwOi8vb3V0cHV0LmpzYmluLmNvbS9hd2VuYXEvM1xuICAgIC8vICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0tleWJvYXJkRXZlbnQnKTtcbiAgICAvLyAgICBpZiAoZS5pbml0S2V5RXZlbnQpIHtcbiAgICAvLyAgICAgIGUuaW5pdEtleUV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwga2V5Q29kZSwgY2hhckNvZGUpO1xuICAgIC8vICB9IGVsc2Uge1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgaWYgKGUuaW5pdEV2ZW50KSB7XG4gICAgICBlLmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIGUua2V5Q29kZSA9IHBhcmFtZXRlcnMua2V5Q29kZTtcbiAgICBlLndoaWNoID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUuY2hhckNvZGUgPSBwYXJhbWV0ZXJzLmNoYXJDb2RlO1xuICAgIGUucHJvZ3JhbW1hdGljID0gdHJ1ZTtcbiAgICBlLmtleSA9IHBhcmFtZXRlcnMua2V5O1xuXG4gICAgLy8gRGlzcGF0Y2ggZGlyZWN0bHkgdG8gRW1zY3JpcHRlbidzIGh0bWw1LmggQVBJOlxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hLZXlFdmVudHNWaWFET00pIHtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdGhpc18gPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5jb250ZXh0O1xuICAgICAgICB2YXIgdHlwZSA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLnR5cGU7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmZ1bjtcbiAgICAgICAgaWYgKHR5cGUgPT0gZXZlbnRUeXBlKSBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGlzcGF0Y2ggdG8gYnJvd3NlciBmb3IgcmVhbFxuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50ID8gZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpIDogZWxlbWVudC5maXJlRXZlbnQoXCJvblwiICsgZXZlbnRUeXBlLCBlKTtcbiAgICB9XG4gIH1cblxuICAvLyBldmVudFR5cGU6IFwibW91c2Vtb3ZlXCIsIFwibW91c2Vkb3duXCIgb3IgXCJtb3VzZXVwXCIuXG4gIC8vIHggYW5kIHk6IE5vcm1hbGl6ZWQgY29vcmRpbmF0ZSBpbiB0aGUgcmFuZ2UgWzAsMV0gd2hlcmUgdG8gaW5qZWN0IHRoZSBldmVudC5cbiAgc2ltdWxhdGVNb3VzZUV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgcGFyYW1ldGVycykge1xuICAgIC8vIFJlbWFwIGZyb20gWzAsMV0gdG8gY2FudmFzIENTUyBwaXhlbCBzaXplLlxuICAgIHZhciB4ID0gcGFyYW1ldGVycy54O1xuICAgIHZhciB5ID0gcGFyYW1ldGVycy55O1xuXG4gICAgeCAqPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIHkgKj0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gT2Zmc2V0IHRoZSBpbmplY3RlZCBjb29yZGluYXRlIGZyb20gdG9wLWxlZnQgb2YgdGhlIGNsaWVudCBhcmVhIHRvIHRoZSB0b3AtbGVmdCBvZiB0aGUgY2FudmFzLlxuICAgIHggPSBNYXRoLnJvdW5kKHJlY3QubGVmdCArIHgpO1xuICAgIHkgPSBNYXRoLnJvdW5kKHJlY3QudG9wICsgeSk7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRzXCIpO1xuICAgIGUuaW5pdE1vdXNlRXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9PSAnbW91c2Vtb3ZlJyA/IDAgOiAxLCB4LCB5LCB4LCB5LFxuICAgICAgICAgICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLmJ1dHRvbiwgbnVsbCk7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKSB7XG4gICAgICAvLyBQcm9ncmFtbWF0aWNhbGx5IHJlYXRpbmcgRE9NIGV2ZW50cyBkb2Vzbid0IGFsbG93IHNwZWNpZnlpbmcgb2Zmc2V0WCAmIG9mZnNldFkgcHJvcGVybHlcbiAgICAgIC8vIGZvciB0aGUgZWxlbWVudCwgYnV0IHRoZXkgbXVzdCBiZSB0aGUgc2FtZSBhcyBjbGllbnRYICYgY2xpZW50WS4gVGhlcmVmb3JlIHdlIGNhbid0IGhhdmUgYVxuICAgICAgLy8gYm9yZGVyIHRoYXQgd291bGQgbWFrZSB0aGVzZSBkaWZmZXJlbnQuXG4gICAgICBpZiAoZWxlbWVudC5jbGllbnRXaWR0aCAhPSBlbGVtZW50Lm9mZnNldFdpZHRoXG4gICAgICAgIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgIHRocm93IFwiRVJST1IhIENhbnZhcyBvYmplY3QgbXVzdCBoYXZlIDBweCBib3JkZXIgZm9yIGRpcmVjdCBtb3VzZSBkaXNwYXRjaCB0byB3b3JrIVwiO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJZiBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcyBpcyBzZXQsIHRoZSBwYWdlIG5lZWRzIGEgZnVsbCBzZXQgb2YgYXR0cmlidXRlc1xuICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBuZXcgY3VzdG9tIG9iamVjdCAod2l0aG91dCBwcm90b3R5cGUgY2hhaW4pIHRvIGhvbGQgdGhlIG92ZXJyaWRkZW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBldnQgPSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBzcmNFbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0b0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICBldmVudFBoYXNlOiAyLCAvLyBFdmVudC5BVF9UQVJHRVRcbiAgICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgICAgYnV0dG9uOiBlLmJ1dHRvbixcbiAgICAgICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgICBjYW5jZWxCdWJibGU6IGUuY2FuY2VsQnViYmxlLFxuICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBlLmNhbmNlbGFibGUsXG4gICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZLFxuICAgICAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLmRldGFpbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogZS5pZGVudGlmaWVyLFxuICAgICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgICBsYXllclg6IGUubGF5ZXJYLFxuICAgICAgICAgICAgICBsYXllclk6IGUubGF5ZXJZLFxuICAgICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICAgIG1vdmVtZW50WDogZS5tb3ZlbWVudFgsXG4gICAgICAgICAgICAgIG1vdmVtZW50WTogZS5tb3ZlbWVudFksXG4gICAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogZS5vZmZzZXRZLFxuICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICAgIHBhdGg6IGUucGF0aCxcbiAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZS5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgICAgc2NyZWVuWDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICBzY3JlZW5ZOiBlLnNjcmVlblksXG4gICAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgICBzb3VyY2VDYXBhYmlsaXRpZXM6IGUuc291cmNlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICB0aW1lU3RhbXA6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICAgIHZpZXc6IGUudmlldyxcbiAgICAgICAgICAgICAgd2hpY2g6IGUud2hpY2gsXG4gICAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgICAgeTogZS55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHJlZ3VsYXIgJ2UnIG9iamVjdCBpcyBlbm91Z2ggKGl0IGRvZXNuJ3QgcG9wdWxhdGUgYWxsIG9mIHRoZSBzYW1lIGZpZWxkcyB0aGFuIGEgcmVhbCBtb3VzZSBldmVudCBkb2VzLCBcbiAgICAgICAgICAgIC8vIHNvIHRoaXMgbWlnaHQgbm90IHdvcmsgb24gc29tZSBkZW1vcylcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBicm93c2VyXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudExpc3RlbmVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvLyBEb24ndCBjYWxsIGFueSBhcHBsaWNhdGlvbiBwYWdlIHVubG9hZCBoYW5kbGVycyBhcyBhIHJlc3BvbnNlIHRvIHdpbmRvdyBiZWluZyBjbG9zZWQuXG4gIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKSB7XG4gICAgLy8gVGhpcyBpcyBhIGJpdCB0cmlja3kgdG8gbWFuYWdlLCBzaW5jZSB0aGUgcGFnZSBjb3VsZCByZWdpc3RlciB0aGVzZSBoYW5kbGVycyBhdCBhbnkgcG9pbnQsXG4gICAgLy8gc28ga2VlcCB3YXRjaGluZyBmb3IgdGhlbSBhbmQgcmVtb3ZlIHRoZW0gaWYgYW55IGFyZSBhZGRlZC4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAvLyBpbiBhIHNlbWktcG9sbGluZyBmYXNoaW9uIHRvIGVuc3VyZSB0aGVzZSBhcmUgbm90IG92ZXJyaWRkZW4uXG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCkgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9udW5sb2FkKSB3aW5kb3cub251bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25ibHVyKSB3aW5kb3cub25ibHVyID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uZm9jdXMpIHdpbmRvdy5vbmZvY3VzID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZWhpZGUpIHdpbmRvdy5vbnBhZ2VoaWRlID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZXNob3cpIHdpbmRvdy5vbnBhZ2VzaG93ID0gbnVsbDtcbiAgfVxuXG4gIHVubG9hZEFsbEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgZm9yKHZhciBpIGluIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXTtcbiAgICAgIGxpc3RlbmVyLmNvbnRleHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci50eXBlLCBsaXN0ZW5lci5mdW4sIGxpc3RlbmVyLnVzZUNhcHR1cmUpO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICBcbiAgICAvLyBNYWtlIHN1cmUgbm8gWEhScyBhcmUgYmVpbmcgaGVsZCBvbiB0byBlaXRoZXIuXG4gICAgLy9wcmVsb2FkZWRYSFJzID0ge307XG4gICAgLy9udW1QcmVsb2FkWEhSc0luRmxpZ2h0ID0gMDtcbiAgICAvL1hNTEh0dHBSZXF1ZXN0ID0gcmVhbFhNTEh0dHBSZXF1ZXN0O1xuICBcbiAgICB0aGlzLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgfVxuXG4gIC8vaWYgKGluamVjdGluZ0lucHV0U3RyZWFtKVxuICBlbmFibGUoKSB7XG5cbiAgICAvLyBGaWx0ZXIgdGhlIHBhZ2UgZXZlbnQgaGFuZGxlcnMgdG8gb25seSBwYXNzIHByb2dyYW1tYXRpY2FsbHkgZ2VuZXJhdGVkIGV2ZW50cyB0byB0aGUgc2l0ZSAtIGFsbCByZWFsIHVzZXIgaW5wdXQgbmVlZHMgdG8gYmUgZGlzY2FyZGVkIHNpbmNlIHdlIGFyZVxuICAgIC8vIGRvaW5nIGEgcHJvZ3JhbW1hdGljIHJ1bi5cbiAgICB2YXIgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcyA9IFsnbW91c2Vkb3duJywgJ21vdXNldXAnLCAnbW91c2Vtb3ZlJyxcbiAgICAgICdjbGljaycsICdkYmxjbGljaycsICdrZXlkb3duJywgJ2tleXByZXNzJywgJ2tleXVwJyxcbiAgICAgICdwb2ludGVybG9ja2NoYW5nZScsICdwb2ludGVybG9ja2Vycm9yJywgJ3dlYmtpdHBvaW50ZXJsb2NrY2hhbmdlJywgJ3dlYmtpdHBvaW50ZXJsb2NrZXJyb3InLCAnbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAnbW96cG9pbnRlcmxvY2tlcnJvcicsICdtc3BvaW50ZXJsb2NrY2hhbmdlJywgJ21zcG9pbnRlcmxvY2tlcnJvcicsICdvcG9pbnRlcmxvY2tjaGFuZ2UnLCAnb3BvaW50ZXJsb2NrZXJyb3InLFxuICAgICAgJ2RldmljZW1vdGlvbicsICdkZXZpY2VvcmllbnRhdGlvbicsXG4gICAgICAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJyxcbiAgICAgICdtb3VzZXdoZWVsJywgJ3doZWVsJywgJ1doZWVsRXZlbnQnLCAnRE9NTW91c2VTY3JvbGwnLCAnY29udGV4dG1lbnUnLFxuICAgICAgJ2JsdXInLCAnZm9jdXMnLCAndmlzaWJpbGl0eWNoYW5nZScsICdiZWZvcmV1bmxvYWQnLCAndW5sb2FkJywgJ2Vycm9yJyxcbiAgICAgICdwYWdlaGlkZScsICdwYWdlc2hvdycsICdvcmllbnRhdGlvbmNoYW5nZScsICdnYW1lcGFkY29ubmVjdGVkJywgJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLFxuICAgICAgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJywgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCAnbW96ZnVsbHNjcmVlbmVycm9yJyxcbiAgICAgICdNU0Z1bGxzY3JlZW5DaGFuZ2UnLCAnTVNGdWxsc2NyZWVuRXJyb3InLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyxcbiAgICAgICd3ZWJnbGNvbnRleHRsb3N0JywgJ3dlYmdsY29udGV4dHJlc3RvcmVkJyxcbiAgICAgICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAncG9pbnRlcm91dCcsICdwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAndHJhbnNpdGlvbmVuZCddO1xuXG4gICAgLy8gU29tZSBnYW1lIGRlbW9zIHByb2dyYW1tYXRpY2FsbHkgZmlyZSB0aGUgcmVzaXplIGV2ZW50LiBGb3IgRmlyZWZveCBhbmQgQ2hyb21lLFxuICAgIC8vIHdlIGRldGVjdCB0aGlzIHZpYSBldmVudC5pc1RydXN0ZWQgYW5kIGtub3cgdG8gY29ycmVjdGx5IHBhc3MgaXQgdGhyb3VnaCwgYnV0IHRvIG1ha2UgU2FmYXJpIGhhcHB5LFxuICAgIC8vIGl0J3MganVzdCBlYXNpZXIgdG8gbGV0IHJlc2l6ZSBjb21lIHRocm91Z2ggZm9yIHRob3NlIGRlbW9zIHRoYXQgbmVlZCBpdC5cbiAgICAvLyBpZiAoIU1vZHVsZVsncGFnZU5lZWRzUmVzaXplRXZlbnQnXSkgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5wdXNoKCdyZXNpemUnKTtcblxuICAgIC8vIElmIGNvbnRleHQgaXMgc3BlY2lmaWVkLCBhZGRFdmVudExpc3RlbmVyIGlzIGNhbGxlZCB1c2luZyB0aGF0IGFzIHRoZSAndGhpcycgb2JqZWN0LiBPdGhlcndpc2UgdGhlIGN1cnJlbnQgdGhpcyBpcyB1c2VkLlxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSA9IGZhbHNlO1xuICAgIHZhciBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTSA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIHJlcGxhY2VFdmVudExpc3RlbmVyKG9iaiwgY29udGV4dCkge1xuICAgICAgdmFyIHJlYWxBZGRFdmVudExpc3RlbmVyID0gb2JqLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICAgIHNlbGYuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuICAgICAgICBpZiAob3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5pbmRleE9mKHR5cGUpICE9IC0xKSB7XG4gICAgICAgICAgdmFyIHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSA9XG4gICAgICAgICAgICAgICAodHlwZS5pbmRleE9mKCdtb3VzZScpID09PSAtMSB8fCBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKVxuICAgICAgICAgICAgJiYgKHR5cGUuaW5kZXhPZigna2V5JykgPT09IC0xIHx8IGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKTtcbiAgICAgICAgICB2YXIgZmlsdGVyZWRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSkgeyB0cnkgeyBpZiAoZS5wcm9ncmFtbWF0aWMgfHwgIWUuaXNUcnVzdGVkKSBsaXN0ZW5lcihlKTsgfSBjYXRjaChlKSB7fSB9O1xuICAgICAgICAgIC8vISEhIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgICAgICBpZiAocmVnaXN0ZXJMaXN0ZW5lclRvRE9NKSByZWFsQWRkRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcyxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBmdW46IGZpbHRlcmVkRXZlbnRMaXN0ZW5lcixcbiAgICAgICAgICAgIHVzZUNhcHR1cmU6IHVzZUNhcHR1cmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWFsQWRkRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZ1bjogbGlzdGVuZXIsXG4gICAgICAgICAgICB1c2VDYXB0dXJlOiB1c2VDYXB0dXJlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHJlYWxSZW1vdmVFdmVudExpc3RlbmVyID0gb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cbiAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgLy8gaWYgKHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSlcbiAgICAgICAgLy9yZWFsUmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV07XG4gICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXIuY29udGV4dCA9PT0gdGhpcyAmJiBldmVudExpc3RlbmVyLnR5cGUgPT09IHR5cGUgJiYgZXZlbnRMaXN0ZW5lci5mdW4gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIEV2ZW50VGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoRXZlbnRUYXJnZXQucHJvdG90eXBlLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLypcbiAgICAgIHZhciBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IFt3aW5kb3csIGRvY3VtZW50LCBkb2N1bWVudC5ib2R5LCBNb2R1bGVbJ2NhbnZhcyddXTtcbiAgICAgIC8vIGlmIChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSkgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5jb25jYXQoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldLCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSk7XG4gICAgICB9XG4gICAgICAqL1xuICAgIH1cbiAgfSAgICBcbn0iLCJjb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGZvbnRTaXplOiAxNixcbiAga2V5U3Ryb2tlRGVsYXk6IDIwMCwgLy8gVGltZSBiZWZvcmUgdGhlIGxpbmUgYnJlYWtzXG4gIGxpbmdlckRlbGF5OiAxMDAwLCAvLyBUaW1lIGJlZm9yZSB0aGUgdGV4dCBmYWRlcyBhd2F5XG4gIGZhZGVEdXJhdGlvbjogMTAwMCxcbiAgYmV6ZWxDb2xvcjogJyMwMDAnLFxuICB0ZXh0Q29sb3I6ICcjZmZmJyxcbiAgdW5tb2RpZmllZEtleTogdHJ1ZSwgLy8gSWYgcHJlc3NpbmcgQWx0K2Ugc2hvdyBlLCBpbnN0ZWFkIG9mIOKCrFxuICBzaG93U3ltYm9sOiB0cnVlLCAvLyBDb252ZXJ0IEFycm93TGVmdCBvbiAtPlxuICBhcHBlbmRNb2RpZmllcnM6IHtNZXRhOiB0cnVlLCBBbHQ6IHRydWUsIFNoaWZ0OiBmYWxzZX0sIC8vIEFwcGVuZCBtb2RpZmllciB0byBrZXkgYWxsIHRoZSB0aW1lXG4gIHBvc2l0aW9uOiAnYm90dG9tLWxlZnQnIC8vIGJvdHRvbS1sZWZ0LCBib3R0b20tcmlnaHQsIHRvcC1sZWZ0LCB0b3AtcmlnaHRcbn07XG5cbmNsYXNzIEtleXN0cm9rZVZpc3VhbGl6ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuc3R5bGUgPSBudWxsO1xuICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIHRoaXMua2V5ZG93biA9IHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMua2V5dXAgPSB0aGlzLmtleXVwLmJpbmQodGhpcyk7XG4gIH1cblxuICBjbGVhblVwKCkge1xuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVOb2RlKHRoaXMuY29udGFpbmVyKTtcbiAgICByZW1vdmVOb2RlKHRoaXMuc3R5bGUpO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuc3R5bGUgPSBudWxsO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd24pO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuICB9XG5cbiAgaW5qZWN0Q29tcG9uZW50cygpIHsgICAgXG4gICAgLy8gQWRkIGNvbnRhaW5lclxuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSAna2V5c3Ryb2tlcyc7XG4gICAgXG4gICAgY29uc3QgcG9zaXRpb25zID0ge1xuICAgICAgJ2JvdHRvbS1sZWZ0JzogJ2JvdHRvbTogMDsgbGVmdDogMDsnLFxuICAgICAgJ2JvdHRvbS1yaWdodCc6ICdib3R0b206IDA7IHJpZ2h0OiAwOycsXG4gICAgICAndG9wLWxlZnQnOiAndG9wOiAwOyBsZWZ0OiAwOycsXG4gICAgICAndG9wLXJpZ2h0JzogJ3RvcDogMDsgcmlnaHQ6IDA7JyxcbiAgICB9O1xuXG4gICAgaWYgKCFwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXSkge1xuICAgICAgY29uc29sZS53YXJuKGBJbnZhbGlkIHBvc2l0aW9uICcke3RoaXMub3B0aW9ucy5wb3NpdGlvbn0nLCB1c2luZyBkZWZhdWx0ICdib3R0b20tbGVmdCcuIFZhbGlkIHBvc2l0aW9uczogYCwgT2JqZWN0LmtleXMocG9zaXRpb25zKSk7XG4gICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSAnYm90dG9tLWxlZnQnO1xuICAgIH1cblxuICAgIC8vIEFkZCBjbGFzc2VzXG4gICAgdGhpcy5zdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgdGhpcy5zdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgICB1bC5rZXlzdHJva2VzIHtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAxMHB4O1xuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICR7cG9zaXRpb25zW3RoaXMub3B0aW9ucy5wb3NpdGlvbl19XG4gICAgICB9XG4gICAgICBcbiAgICAgIHVsLmtleXN0cm9rZXMgbGkge1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWw7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7dGhpcy5vcHRpb25zLmJlemVsQ29sb3J9O1xuICAgICAgICBvcGFjaXR5OiAwLjk7XG4gICAgICAgIGNvbG9yOiAke3RoaXMub3B0aW9ucy50ZXh0Q29sb3J9O1xuICAgICAgICBwYWRkaW5nOiA1cHggMTBweDtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogNXB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICBmb250LXNpemU6ICR7dGhpcy5vcHRpb25zLmZvbnRTaXplfXB4O1xuICAgICAgICBkaXNwbGF5OiB0YWJsZTtcbiAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5ICR7dGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbn1tcyBsaW5lYXI7XG4gICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgIH1gO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5zdHlsZSk7XG4gIH1cblxuICBjb252ZXJ0S2V5VG9TeW1ib2woa2V5KSB7XG4gICAgY29uc3QgY29udmVyc2lvbkNvbW1vbiA9IHtcbiAgICAgICdBcnJvd1JpZ2h0JzogJ+KGkicsXG4gICAgICAnQXJyb3dMZWZ0JzogJ+KGkCcsXG4gICAgICAnQXJyb3dVcCc6ICfihpEnLFxuICAgICAgJ0Fycm93RG93bic6ICfihpMnLFxuICAgICAgJyAnOiAn4pCjJyxcbiAgICAgICdFbnRlcic6ICfihqknLFxuICAgICAgJ1NoaWZ0JzogJ+KHpycsXG4gICAgICAnU2hpZnRSaWdodCc6ICfih6cnLFxuICAgICAgJ1NoaWZ0TGVmdCc6ICfih6cnLFxuICAgICAgJ0NvbnRyb2wnOiAn4oyDJyxcbiAgICAgICdUYWInOiAn4oa5JyxcbiAgICAgICdDYXBzTG9jayc6ICfih6onXG4gICAgfTtcblxuICAgIGNvbnN0IGNvbnZlcnNpb25NYWMgPSB7XG4gICAgICAnQWx0JzogJ+KMpScsXG4gICAgICAnQWx0TGVmdCc6ICfijKUnLFxuICAgICAgJ0FsdFJpZ2h0JzogJ+KMpScsXG4gICAgICAnRGVsZXRlJzogJ+KMpicsXG4gICAgICAnRXNjYXBlJzogJ+KOiycsXG4gICAgICAnQmFja3NwYWNlJzogJ+KMqycsXG4gICAgICAnTWV0YSc6ICfijJgnLFxuICAgICAgJ1RhYic6ICfih6UnLFxuICAgICAgJ1BhZ2VEb3duJzogJ+KHnycsXG4gICAgICAnUGFnZVVwJzogJ+KHnicsXG4gICAgICAnSG9tZSc6ICfihpYnLFxuICAgICAgJ0VuZCc6ICfihpgnXG4gICAgfTtcblxuICAgIHJldHVybiAobmF2aWdhdG9yLnBsYXRmb3JtID09PSAnTWFjSW50ZWwnID8gY29udmVyc2lvbk1hY1trZXldIDogbnVsbCApIHx8IGNvbnZlcnNpb25Db21tb25ba2V5XSB8fCBrZXk7XG4gIH1cblxuICBrZXlkb3duKGUpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudENodW5rKSB7XG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRDaHVuayk7XG4gICAgfVxuICAgIFxuICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICBpZiAodGhpcy5vcHRpb25zLnVubW9kaWZpZWRLZXkpIHtcbiAgICAgIGlmIChlLmNvZGUuaW5kZXhPZignS2V5JykgIT09IC0xKSB7XG4gICAgICAgIGtleSA9IGUuY29kZS5yZXBsYWNlKCdLZXknLCAnJyk7XG4gICAgICAgIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAgIGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG1vZGlmaWVyID0gJyc7XG4gICAgXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuTWV0YSAmJiBlLm1ldGFLZXkgJiYgZS5rZXkgIT09ICdNZXRhJykgeyBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnTWV0YScpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuQWx0ICYmIGUuYWx0S2V5ICYmIGUua2V5ICE9PSAnQWx0JykgeyBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnQWx0Jyk7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5TaGlmdCAmJiBlLnNoaWZ0S2V5ICYmIGUua2V5ICE9PSAnU2hpZnQnKSB7IG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdTaGlmdCcpOyB9XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsudGV4dENvbnRlbnQgKz0gbW9kaWZpZXIgKyAodGhpcy5vcHRpb25zLnNob3dTeW1ib2wgPyB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbChrZXkpIDoga2V5KTtcbiAgfVxuXG4gIGtleXVwKGUpIHtcbiAgICBpZiAoIXRoaXMuY3VycmVudENodW5rKSByZXR1cm47XG4gICAgXG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5rZXlTdHJva2VUaW1lb3V0KTtcbiAgICB0aGlzLmtleVN0cm9rZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIChmdW5jdGlvbihwcmV2aW91c0NodW5rKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHByZXZpb3VzQ2h1bmsuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7cHJldmlvdXNDaHVuay5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHByZXZpb3VzQ2h1bmspfSwgb3B0aW9ucy5mYWRlRHVyYXRpb24pO1xuICAgICAgICB9LCBvcHRpb25zLmxpbmdlckRlbGF5KTtcbiAgICAgIH0pKHRoaXMuY3VycmVudENodW5rKTtcbiAgICAgIFxuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIH0sIG9wdGlvbnMua2V5U3Ryb2tlRGVsYXkpO1xuICB9XG5cbiAgZW5hYmxlKG9wdGlvbnMpIHtcbiAgICB0aGlzLmNsZWFuVXAoKTsgICAgXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbigge30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICAgIHRoaXMuaW5qZWN0Q29tcG9uZW50cygpOyAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd24pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuICB9XG5cbiAgZGlzYWJsZSgpIHtcbiAgICB0aGlzLmNsZWFuVXAoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgS2V5c3Ryb2tlVmlzdWFsaXplcigpOyIsImltcG9ydCBLZXlzdHJva2VWaXN1YWxpemVyIGZyb20gJ2tleXN0cm9rZS12aXN1YWxpemVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXRIZWxwZXJzIHtcbiAgaW5pdEtleXMoKSB7XG4gICAgS2V5c3Ryb2tlVmlzdWFsaXplci5lbmFibGUoe3VubW9kaWZpZWRLZXk6IGZhbHNlfSk7XG4gIH1cblxuICBpbml0TW91c2UoKSB7XG4gICAgdGhpcy5tb3VzZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VEaXYuaWQ9J21vdXNlZGl2JztcbiAgICB0aGlzLm1vdXNlQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLm1vdXNlQ2xpY2suaWQ9J21vdXNlY2xpY2snO1xuICAgIHRoaXMubW91c2VDbGljay5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgbGVmdDogMHB4O1xuICAgICAgdG9wOiAwcHg7XG4gICAgICBib3JkZXI6IDNweCBzb2xpZCBibGFjaztcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICBgO1xuXG4gICAgdGhpcy5tb3VzZURpdi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnL2N1cnNvci5zdmcnKTtcbiAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IC04cHggLTVweDtcbiAgICAgIHotaW5kZXg6IDk5OTk7XG4gICAgYDtcbiAgICBcbiAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubW91c2VEaXYpO1xuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZUNsaWNrKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldnQpID0+IHtcbiAgICAgIHRoaXMubW91c2VEaXYuc3R5bGUubGVmdCA9IGV2dC54ICsgXCJweFwiO1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS50b3AgPSBldnQueSArIFwicHhcIjtcblxuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmxlZnQgPSBgJHtldnQueCAtIDEyfXB4YDtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS50b3AgPSBgJHtldnQueSAtIDd9cHhgO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIH0pO1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB9KTtcblxuICB9XG5cbiAgY29uc3RydWN0b3IgKGNhbnZhcywgb3B0aW9ucykge1xuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzaG93LWtleXMnKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaW5pdEtleXMoKTtcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3ctbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaW5pdE1vdXNlKCk7XG4gICAgfVxuICB9XG59IiwidmFyIENvbnRleHQgPSB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0ID8gd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCA6IHdpbmRvdy5BdWRpb0NvbnRleHQ7XG52YXIgb3JpRGVjb2RlRGF0YSA9IENvbnRleHQucHJvdG90eXBlLmRlY29kZUF1ZGlvRGF0YTtcblxudmFyIFdlYkF1ZGlvSG9vayA9IHtcbiAgc3RhdHM6IHtcbiAgICBudW1BdWRpb0J1ZmZlcnM6IDAsXG4gICAgdG90YWxEdXJhdGlvbjogMCxcbiAgICB0b3RhbExlbmd0aDogMCxcbiAgICB0b3RhbERlY29kZVRpbWU6IDBcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoZmFrZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBDb250ZXh0LnByb3RvdHlwZS5kZWNvZGVBdWRpb0RhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcmV2ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgaWYgKGZha2UpIHtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsRGVjb2RlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwcmV2O1xuICAgICAgICAgIHJlc29sdmUobmV3IEF1ZGlvQnVmZmVyKHtsZW5ndGg6IDEsIHNhbXBsZVJhdGU6IDQ0MTAwfSkpO1xuICAgICAgICAgIHNlbGYuc3RhdHMubnVtQXVkaW9CdWZmZXJzKys7XG4gICAgICAgICAgc2VsZi5zdGF0cy50b3RhbER1cmF0aW9uICs9IGF1ZGlvQnVmZmVyLmR1cmF0aW9uO1xuICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxMZW5ndGggKz0gYXVkaW9CdWZmZXIubGVuZ3RoO1xuICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG9yaURlY29kZURhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwcm9taXNlLnRoZW4oYXVkaW9CdWZmZXIgPT4ge1xuICAgICAgICAgICAgc2VsZi5zdGF0cy50b3RhbERlY29kZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcHJldjtcbiAgICAgICAgICAgIHJlc29sdmUoYXVkaW9CdWZmZXIpO1xuICAgICAgICAgICAgc2VsZi5zdGF0cy5udW1BdWRpb0J1ZmZlcnMrKztcbiAgICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxEdXJhdGlvbiArPSBhdWRpb0J1ZmZlci5kdXJhdGlvbjtcbiAgICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxMZW5ndGggKz0gYXVkaW9CdWZmZXIubGVuZ3RoO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgQ29udGV4dC5wcm90b3R5cGUuZGVjb2RlQXVkaW9EYXRhID0gb3JpRGVjb2RlRGF0YTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgV2ViQXVkaW9Ib29rOyIsInZhciBXZWJWUkhvb2sgPSB7XG4gIG9yaWdpbmFsOiB7XG4gICAgZ2V0VlJEaXNwbGF5czogbnVsbCxcbiAgICBhZGRFdmVudExpc3RlbmVyOiBudWxsXG4gIH0sXG4gIGN1cnJlbnRWUkRpc3BsYXk6IG51bGwsXG4gIGF1eEZyYW1lRGF0YTogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAnVlJGcmFtZURhdGEnIGluIHdpbmRvdyApID8gbmV3IHdpbmRvdy5WUkZyYW1lRGF0YSgpIDogbnVsbCxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAobmF2aWdhdG9yLmdldFZSRGlzcGxheXMpIHtcbiAgICAgIHRoaXMuaW5pdEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgb3JpZ2V0VlJEaXNwbGF5cyA9IHRoaXMub3JpZ2luYWwuZ2V0VlJEaXNwbGF5cyA9IG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG9yaWdldFZSRGlzcGxheXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzdWx0LnRoZW4oZGlzcGxheXMgPT4ge1xuICAgICAgICAgICAgdmFyIG5ld0Rpc3BsYXlzID0gW107XG4gICAgICAgICAgICBkaXNwbGF5cy5mb3JFYWNoKGRpc3BsYXkgPT4ge1xuICAgICAgICAgICAgICB2YXIgbmV3RGlzcGxheSA9IHNlbGYuaG9va1ZSRGlzcGxheShkaXNwbGF5KTtcbiAgICAgICAgICAgICAgbmV3RGlzcGxheXMucHVzaChuZXdEaXNwbGF5KTtcbiAgICAgICAgICAgICAgY2FsbGJhY2sobmV3RGlzcGxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc29sdmUobmV3RGlzcGxheXMpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge30sXG4gIGluaXRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3JpZ2luYWwuYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBldmVudHNGaWx0ZXIgPSBbJ3ZyZGlzcGxheXByZXNlbnRjaGFuZ2UnLCAndnJkaXNwbGF5Y29ubmVjdCddO1xuICAgICAgaWYgKGV2ZW50c0ZpbHRlci5pbmRleE9mKGFyZ3VtZW50c1swXSkgIT09IC0xKSB7XG4gICAgICAgIHZhciBvbGRDYWxsYmFjayA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgYXJndW1lbnRzWzFdID0gZXZlbnQgPT4ge1xuICAgICAgICAgIHNlbGYuaG9va1ZSRGlzcGxheShldmVudC5kaXNwbGF5KTtcbiAgICAgICAgICBvbGRDYWxsYmFjayhldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gc2VsZi5vcmlnaW5hbC5hZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9LFxuICBob29rVlJEaXNwbGF5OiBmdW5jdGlvbiAoZGlzcGxheSkge1xuICAgIC8vIFRvZG8gbW9kaWZ5IHRoZSBWUkRpc3BsYXkgaWYgbmVlZGVkIGZvciBmcmFtZWRhdGEgYW5kIHNvIG9uXG4gICAgcmV0dXJuIGRpc3BsYXk7XG4gICAgICAvKlxuICAgIHZhciBvbGRHZXRGcmFtZURhdGEgPSBkaXNwbGF5LmdldEZyYW1lRGF0YS5iaW5kKGRpc3BsYXkpO1xuICAgIGRpc3BsYXkuZ2V0RnJhbWVEYXRhID0gZnVuY3Rpb24oZnJhbWVEYXRhKSB7XG5cbiAgICAgIG9sZEdldEZyYW1lRGF0YShmcmFtZURhdGEpO1xuICAvKlxuICAgICAgdmFyIG0gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4gICAgICB2YXIgeCA9IE1hdGguc2luKHBlcmZvcm1hbmNlLm5vdygpLzEwMDApO1xuICAgICAgdmFyIHkgPSBNYXRoLnNpbihwZXJmb3JtYW5jZS5ub3coKS81MDApLTEuMjtcblxuICAgICAgbS5tYWtlVHJhbnNsYXRpb24oeCx5LC0wLjUpO1xuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgIHZhciBzY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICB2YXIgcXVhdCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG4gICAgICBtLmRlY29tcG9zZShwb3NpdGlvbixxdWF0LHNjYWxlKTtcblxuICAgICAgZnJhbWVEYXRhLnBvc2UucG9zaXRpb25bMF0gPSAtcG9zaXRpb24ueDtcbiAgICAgIGZyYW1lRGF0YS5wb3NlLnBvc2l0aW9uWzFdID0gLXBvc2l0aW9uLnk7XG4gICAgICBmcmFtZURhdGEucG9zZS5wb3NpdGlvblsyXSA9IC1wb3NpdGlvbi56O1xuXG4gICAgICBmb3IgKHZhciBpPTA7aTwzO2krKykge1xuICAgICAgICBmcmFtZURhdGEucG9zZS5vcmllbnRhdGlvbltpXSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGk9MDtpPDE2O2krKykge1xuICAgICAgICBmcmFtZURhdGEubGVmdFZpZXdNYXRyaXhbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgICBmcmFtZURhdGEucmlnaHRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgIH1cbiAgICAvKlxuICAgICAgZm9yICh2YXIgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgIGxlZnRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgICAgZnJhbWVEYXRhLnJpZ2h0Vmlld01hdHJpeFtpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICB9XG4gICAgICAvLyBjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFMLnBvc2l0aW9uLCBjYW1lcmFMLnF1YXRlcm5pb24sIGNhbWVyYUwuc2NhbGUgKTtcbiAgICB9XG4gICAgKi9cbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IFdlYlZSSG9vazsiLCJmdW5jdGlvbiBuZWFyZXN0TmVpZ2hib3IgKHNyYywgZHN0KSB7XG4gIGxldCBwb3MgPSAwXG5cbiAgZm9yIChsZXQgeSA9IDA7IHkgPCBkc3QuaGVpZ2h0OyB5KyspIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRzdC53aWR0aDsgeCsrKSB7XG4gICAgICBjb25zdCBzcmNYID0gTWF0aC5mbG9vcih4ICogc3JjLndpZHRoIC8gZHN0LndpZHRoKVxuICAgICAgY29uc3Qgc3JjWSA9IE1hdGguZmxvb3IoeSAqIHNyYy5oZWlnaHQgLyBkc3QuaGVpZ2h0KVxuXG4gICAgICBsZXQgc3JjUG9zID0gKChzcmNZICogc3JjLndpZHRoKSArIHNyY1gpICogNFxuXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gUlxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEdcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBCXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gQVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplSW1hZ2VEYXRhKHNyY0ltYWdlRGF0YSwgbmV3SW1hZ2VEYXRhKSB7XG4gIG5lYXJlc3ROZWlnaGJvcihzcmNJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpeGVsbWF0Y2g7XG5cbmZ1bmN0aW9uIHBpeGVsbWF0Y2goaW1nMSwgaW1nMiwgb3V0cHV0LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gMC4xIDogb3B0aW9ucy50aHJlc2hvbGQ7XG5cbiAgICAvLyBtYXhpbXVtIGFjY2VwdGFibGUgc3F1YXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNvbG9ycztcbiAgICAvLyAzNTIxNSBpcyB0aGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZSBmb3IgdGhlIFlJUSBkaWZmZXJlbmNlIG1ldHJpY1xuICAgIHZhciBtYXhEZWx0YSA9IDM1MjE1ICogdGhyZXNob2xkICogdGhyZXNob2xkLFxuICAgICAgICBkaWZmID0gMDtcblxuICAgIC8vIGNvbXBhcmUgZWFjaCBwaXhlbCBvZiBvbmUgaW1hZ2UgYWdhaW5zdCB0aGUgb3RoZXIgb25lXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcblxuICAgICAgICAgICAgdmFyIHBvcyA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgICAgIC8vIHNxdWFyZWQgWVVWIGRpc3RhbmNlIGJldHdlZW4gY29sb3JzIGF0IHRoaXMgcGl4ZWwgcG9zaXRpb25cbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgcG9zLCBwb3MpO1xuXG4gICAgICAgICAgICAvLyB0aGUgY29sb3IgZGlmZmVyZW5jZSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiBtYXhEZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGl0J3MgYSByZWFsIHJlbmRlcmluZyBkaWZmZXJlbmNlIG9yIGp1c3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlQUEgJiYgKGFudGlhbGlhc2VkKGltZzEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFudGlhbGlhc2VkKGltZzIsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzEpKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmUgb2YgdGhlIHBpeGVscyBpcyBhbnRpLWFsaWFzaW5nOyBkcmF3IGFzIHllbGxvdyBhbmQgZG8gbm90IGNvdW50IGFzIGRpZmZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDI1NSwgMCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3VuZCBzdWJzdGFudGlhbCBkaWZmZXJlbmNlIG5vdCBjYXVzZWQgYnkgYW50aS1hbGlhc2luZzsgZHJhdyBpdCBhcyByZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaWZmKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIC8vIHBpeGVscyBhcmUgc2ltaWxhcjsgZHJhdyBiYWNrZ3JvdW5kIGFzIGdyYXlzY2FsZSBpbWFnZSBibGVuZGVkIHdpdGggd2hpdGVcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gYmxlbmQoZ3JheVBpeGVsKGltZzEsIHBvcyksIDAuMSk7XG4gICAgICAgICAgICAgICAgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCB2YWwsIHZhbCwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVudCBwaXhlbHNcbiAgICByZXR1cm4gZGlmZjtcbn1cblxuLy8gY2hlY2sgaWYgYSBwaXhlbCBpcyBsaWtlbHkgYSBwYXJ0IG9mIGFudGktYWxpYXNpbmc7XG4vLyBiYXNlZCBvbiBcIkFudGktYWxpYXNlZCBQaXhlbCBhbmQgSW50ZW5zaXR5IFNsb3BlIERldGVjdG9yXCIgcGFwZXIgYnkgVi4gVnlzbmlhdXNrYXMsIDIwMDlcblxuZnVuY3Rpb24gYW50aWFsaWFzZWQoaW1nLCB4MSwgeTEsIHdpZHRoLCBoZWlnaHQsIGltZzIpIHtcbiAgICB2YXIgeDAgPSBNYXRoLm1heCh4MSAtIDEsIDApLFxuICAgICAgICB5MCA9IE1hdGgubWF4KHkxIC0gMSwgMCksXG4gICAgICAgIHgyID0gTWF0aC5taW4oeDEgKyAxLCB3aWR0aCAtIDEpLFxuICAgICAgICB5MiA9IE1hdGgubWluKHkxICsgMSwgaGVpZ2h0IC0gMSksXG4gICAgICAgIHBvcyA9ICh5MSAqIHdpZHRoICsgeDEpICogNCxcbiAgICAgICAgemVyb2VzID0gMCxcbiAgICAgICAgcG9zaXRpdmVzID0gMCxcbiAgICAgICAgbmVnYXRpdmVzID0gMCxcbiAgICAgICAgbWluID0gMCxcbiAgICAgICAgbWF4ID0gMCxcbiAgICAgICAgbWluWCwgbWluWSwgbWF4WCwgbWF4WTtcblxuICAgIC8vIGdvIHRocm91Z2ggOCBhZGphY2VudCBwaXhlbHNcbiAgICBmb3IgKHZhciB4ID0geDA7IHggPD0geDI7IHgrKykge1xuICAgICAgICBmb3IgKHZhciB5ID0geTA7IHkgPD0geTI7IHkrKykge1xuICAgICAgICAgICAgaWYgKHggPT09IHgxICYmIHkgPT09IHkxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYnJpZ2h0bmVzcyBkZWx0YSBiZXR3ZWVuIHRoZSBjZW50ZXIgcGl4ZWwgYW5kIGFkamFjZW50IG9uZVxuICAgICAgICAgICAgdmFyIGRlbHRhID0gY29sb3JEZWx0YShpbWcsIGltZywgcG9zLCAoeSAqIHdpZHRoICsgeCkgKiA0LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY291bnQgdGhlIG51bWJlciBvZiBlcXVhbCwgZGFya2VyIGFuZCBicmlnaHRlciBhZGphY2VudCBwaXhlbHNcbiAgICAgICAgICAgIGlmIChkZWx0YSA9PT0gMCkgemVyb2VzKys7XG4gICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA8IDApIG5lZ2F0aXZlcysrO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPiAwKSBwb3NpdGl2ZXMrKztcblxuICAgICAgICAgICAgLy8gaWYgZm91bmQgbW9yZSB0aGFuIDIgZXF1YWwgc2libGluZ3MsIGl0J3MgZGVmaW5pdGVseSBub3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgaWYgKHplcm9lcyA+IDIpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcyKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGRhcmtlc3QgcGl4ZWxcbiAgICAgICAgICAgIGlmIChkZWx0YSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG1pbiA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG1pblggPSB4O1xuICAgICAgICAgICAgICAgIG1pblkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGJyaWdodGVzdCBwaXhlbFxuICAgICAgICAgICAgaWYgKGRlbHRhID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgbWF4WSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWltZzIpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGJvdGggZGFya2VyIGFuZCBicmlnaHRlciBwaXhlbHMgYW1vbmcgc2libGluZ3MsIGl0J3Mgbm90IGFudGktYWxpYXNpbmdcbiAgICBpZiAobmVnYXRpdmVzID09PSAwIHx8IHBvc2l0aXZlcyA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaWYgZWl0aGVyIHRoZSBkYXJrZXN0IG9yIHRoZSBicmlnaHRlc3QgcGl4ZWwgaGFzIG1vcmUgdGhhbiAyIGVxdWFsIHNpYmxpbmdzIGluIGJvdGggaW1hZ2VzXG4gICAgLy8gKGRlZmluaXRlbHkgbm90IGFudGktYWxpYXNlZCksIHRoaXMgcGl4ZWwgaXMgYW50aS1hbGlhc2VkXG4gICAgcmV0dXJuICghYW50aWFsaWFzZWQoaW1nLCBtaW5YLCBtaW5ZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCkpIHx8XG4gICAgICAgICAgICghYW50aWFsaWFzZWQoaW1nLCBtYXhYLCBtYXhZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWF4WCwgbWF4WSwgd2lkdGgsIGhlaWdodCkpO1xufVxuXG4vLyBjYWxjdWxhdGUgY29sb3IgZGlmZmVyZW5jZSBhY2NvcmRpbmcgdG8gdGhlIHBhcGVyIFwiTWVhc3VyaW5nIHBlcmNlaXZlZCBjb2xvciBkaWZmZXJlbmNlXG4vLyB1c2luZyBZSVEgTlRTQyB0cmFuc21pc3Npb24gY29sb3Igc3BhY2UgaW4gbW9iaWxlIGFwcGxpY2F0aW9uc1wiIGJ5IFkuIEtvdHNhcmVua28gYW5kIEYuIFJhbW9zXG5cbmZ1bmN0aW9uIGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgaywgbSwgeU9ubHkpIHtcbiAgICB2YXIgYTEgPSBpbWcxW2sgKyAzXSAvIDI1NSxcbiAgICAgICAgYTIgPSBpbWcyW20gKyAzXSAvIDI1NSxcblxuICAgICAgICByMSA9IGJsZW5kKGltZzFbayArIDBdLCBhMSksXG4gICAgICAgIGcxID0gYmxlbmQoaW1nMVtrICsgMV0sIGExKSxcbiAgICAgICAgYjEgPSBibGVuZChpbWcxW2sgKyAyXSwgYTEpLFxuXG4gICAgICAgIHIyID0gYmxlbmQoaW1nMlttICsgMF0sIGEyKSxcbiAgICAgICAgZzIgPSBibGVuZChpbWcyW20gKyAxXSwgYTIpLFxuICAgICAgICBiMiA9IGJsZW5kKGltZzJbbSArIDJdLCBhMiksXG5cbiAgICAgICAgeSA9IHJnYjJ5KHIxLCBnMSwgYjEpIC0gcmdiMnkocjIsIGcyLCBiMik7XG5cbiAgICBpZiAoeU9ubHkpIHJldHVybiB5OyAvLyBicmlnaHRuZXNzIGRpZmZlcmVuY2Ugb25seVxuXG4gICAgdmFyIGkgPSByZ2IyaShyMSwgZzEsIGIxKSAtIHJnYjJpKHIyLCBnMiwgYjIpLFxuICAgICAgICBxID0gcmdiMnEocjEsIGcxLCBiMSkgLSByZ2IycShyMiwgZzIsIGIyKTtcblxuICAgIHJldHVybiAwLjUwNTMgKiB5ICogeSArIDAuMjk5ICogaSAqIGkgKyAwLjE5NTcgKiBxICogcTtcbn1cblxuZnVuY3Rpb24gcmdiMnkociwgZywgYikgeyByZXR1cm4gciAqIDAuMjk4ODk1MzEgKyBnICogMC41ODY2MjI0NyArIGIgKiAwLjExNDQ4MjIzOyB9XG5mdW5jdGlvbiByZ2IyaShyLCBnLCBiKSB7IHJldHVybiByICogMC41OTU5Nzc5OSAtIGcgKiAwLjI3NDE3NjEwIC0gYiAqIDAuMzIxODAxODk7IH1cbmZ1bmN0aW9uIHJnYjJxKHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjIxMTQ3MDE3IC0gZyAqIDAuNTIyNjE3MTEgKyBiICogMC4zMTExNDY5NDsgfVxuXG4vLyBibGVuZCBzZW1pLXRyYW5zcGFyZW50IGNvbG9yIHdpdGggd2hpdGVcbmZ1bmN0aW9uIGJsZW5kKGMsIGEpIHtcbiAgICByZXR1cm4gMjU1ICsgKGMgLSAyNTUpICogYTtcbn1cblxuZnVuY3Rpb24gZHJhd1BpeGVsKG91dHB1dCwgcG9zLCByLCBnLCBiKSB7XG4gICAgb3V0cHV0W3BvcyArIDBdID0gcjtcbiAgICBvdXRwdXRbcG9zICsgMV0gPSBnO1xuICAgIG91dHB1dFtwb3MgKyAyXSA9IGI7XG4gICAgb3V0cHV0W3BvcyArIDNdID0gMjU1O1xufVxuXG5mdW5jdGlvbiBncmF5UGl4ZWwoaW1nLCBpKSB7XG4gICAgdmFyIGEgPSBpbWdbaSArIDNdIC8gMjU1LFxuICAgICAgICByID0gYmxlbmQoaW1nW2kgKyAwXSwgYSksXG4gICAgICAgIGcgPSBibGVuZChpbWdbaSArIDFdLCBhKSxcbiAgICAgICAgYiA9IGJsZW5kKGltZ1tpICsgMl0sIGEpO1xuICAgIHJldHVybiByZ2IyeShyLCBnLCBiKTtcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmU3RhdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm4gPSAwO1xuICAgIHRoaXMubWluID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLm1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLm1lYW4gPSAwO1xuICAgIHRoaXMucSA9IDA7XG4gIH1cblxuICBnZXQgdmFyaWFuY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucSAvIHRoaXMubjtcbiAgfVxuXG4gIGdldCBzdGFuZGFyZF9kZXZpYXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnEgLyB0aGlzLm4pO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAvLyBTb3JyeSwgbm8gTmFOc1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm4rKztcbiAgICB0aGlzLm1pbiA9IE1hdGgubWluKHRoaXMubWluLCBudW0pO1xuICAgIHRoaXMubWF4ID0gTWF0aC5tYXgodGhpcy5tYXgsIG51bSk7XG4gICAgdGhpcy5zdW0gKz0gbnVtO1xuICAgIGNvbnN0IHByZXZNZWFuID0gdGhpcy5tZWFuO1xuICAgIHRoaXMubWVhbiA9IHRoaXMubWVhbiArIChudW0gLSB0aGlzLm1lYW4pIC8gdGhpcy5uO1xuICAgIHRoaXMucSA9IHRoaXMucSArIChudW0gLSBwcmV2TWVhbikgKiAobnVtIC0gdGhpcy5tZWFuKTtcbiAgfVxuXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbjogdGhpcy5uLFxuICAgICAgbWluOiB0aGlzLm1pbixcbiAgICAgIG1heDogdGhpcy5tYXgsXG4gICAgICBzdW06IHRoaXMuc3VtLFxuICAgICAgbWVhbjogdGhpcy5tZWFuLFxuICAgICAgdmFyaWFuY2U6IHRoaXMudmFyaWFuY2UsXG4gICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgfTtcbiAgfSAgXG59XG4iLCJpbXBvcnQgU3RhdHMgZnJvbSAnaW5jcmVtZW50YWwtc3RhdHMtbGl0ZSc7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gV2ViR0xTdGF0cyAoKSB7XG5cbiAgdmFyIGRhdGEgPSB7XG4gICAgbnVtRHJhd0NhbGxzOiAwLFxuXG4gICAgbnVtRHJhd0FycmF5c0NhbGxzOjAsXG4gICAgbnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzOjAsXG4gICAgbnVtRHJhd0VsZW1lbnRzQ2FsbHM6MCxcbiAgICBudW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxsczogMCxcblxuICAgIG51bVVzZVByb2dyYW1DYWxsczowLFxuICAgIG51bUZhY2VzOjAsXG4gICAgbnVtVmVydGljZXM6MCxcbiAgICBudW1Qb2ludHM6MCxcbiAgICBudW1CaW5kVGV4dHVyZXM6MFxuICB9XG5cbiAgdmFyIHN0YXRzID0ge1xuICAgIGRyYXdDYWxsczogbmV3IFN0YXRzKCksXG4gICAgdXNlUHJvZ3JhbUNhbGxzOiBuZXcgU3RhdHMoKSxcbiAgICBmYWNlczogbmV3IFN0YXRzKCksXG4gICAgdmVydGljZXM6IG5ldyBTdGF0cygpLFxuICAgIGJpbmRUZXh0dXJlczogbmV3IFN0YXRzKClcbiAgfTtcblxuICBmdW5jdGlvbiBmcmFtZUVuZCgpIHtcbiAgICBmb3IgKGxldCBzdGF0IGluIHN0YXRzKSB7XG4gICAgICB2YXIgY291bnRlck5hbWUgPSAnbnVtJyArIHN0YXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0LnNsaWNlKDEpO1xuICAgICAgc3RhdHNbc3RhdF0udXBkYXRlKGRhdGFbY291bnRlck5hbWVdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfaCAoIGYsIGMgKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIGYuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIH07XG4gIH1cbiAgXG4gIGlmICgnV2ViR0wyUmVuZGVyaW5nQ29udGV4dCcgaW4gd2luZG93KSB7XG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5c0luc3RhbmNlZCA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzSW5zdGFuY2VkLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdBcnJheXNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcblxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50c0luc3RhbmNlZCA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHNJbnN0YW5jZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG5cbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0FycmF5c0NhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0gKTtcbiAgICBcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdFbGVtZW50c0NhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgZGF0YS5udW1GYWNlcyArPSBhcmd1bWVudHNbIDEgXSAvIDM7XG4gICAgICBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMSBdO1xuICAgIH0gKTtcbiAgICBcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzKys7XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bUJpbmRUZXh0dXJlcysrO1xuICAgIH0gKTtcbiAgXG4gIH1cblxuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cywgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtRHJhd0FycmF5c0NhbGxzKys7XG4gICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICB9ICk7XG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cywgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMrKztcbiAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgIGRhdGEubnVtRmFjZXMgKz0gYXJndW1lbnRzWyAxIF0gLyAzO1xuICAgIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAxIF07XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0sIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bVVzZVByb2dyYW1DYWxscysrO1xuICB9ICk7XG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUsIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bUJpbmRUZXh0dXJlcysrO1xuICB9ICk7XG4gIFxuICBmdW5jdGlvbiBmcmFtZVN0YXJ0ICgpIHtcbiAgICBkYXRhLm51bURyYXdDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdFbGVtZW50c0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzID0gMDtcbiAgICBkYXRhLm51bVVzZVByb2dyYW1DYWxscyA9IDA7XG4gICAgZGF0YS5udW1GYWNlcyA9IDA7XG4gICAgZGF0YS5udW1WZXJ0aWNlcyA9IDA7XG4gICAgZGF0YS5udW1Qb2ludHMgPSAwO1xuICAgIGRhdGEubnVtQmluZFRleHR1cmVzID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzV2ViR0xDb250ZXh0KGN0eCkge1xuICAgIHJldHVybiAoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KSB7XG4gICAgaWYgKCFpc1dlYkdMQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgY29uc29sZS53YXJuKFwiV0VCR0wtU1RBVFM6IFByb3ZpZGVkIGNvbnRleHQgaXMgbm90IFdlYkdMXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBleHQgPSBjb250ZXh0LmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgIGlmICghZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV4dC5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUgPSBfaCggZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIFxuICAgIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdW1tYXJ5KCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgIG1pbjogc3RhdHNba2V5XS5taW4sXG4gICAgICAgIG1heDogc3RhdHNba2V5XS5tYXgsXG4gICAgICAgIGF2Zzogc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgZ2V0Q3VycmVudERhdGE6ICgpID0+IHtyZXR1cm4gZGF0YTt9LFxuICAgIHNldHVwRXh0ZW5zaW9uczogc2V0dXBFeHRlbnNpb25zLFxuICAgIGdldFN1bW1hcnk6IGdldFN1bW1hcnksXG4gICAgZnJhbWVTdGFydDogZnJhbWVTdGFydCxcbiAgICBmcmFtZUVuZDogZnJhbWVFbmRcbiAgICBcbiAgICAvL2VuYWJsZTogZW5hYmxlLFxuICAgIC8vZGlzYWJsZTogZGlzYWJsZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU3RhdHMoKTsiLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgV2ViWFJIb29rIGZyb20gJ3dlYnhyLWhvb2snO1xuaW1wb3J0IFBlcmZTdGF0cyBmcm9tICdwZXJmb3JtYW5jZS1zdGF0cyc7XG5pbXBvcnQgc2VlZHJhbmRvbSBmcm9tICdzZWVkcmFuZG9tJztcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnO1xuaW1wb3J0IHtJbnB1dFJlY29yZGVyLCBJbnB1dFJlcGxheWVyfSBmcm9tICdpbnB1dC1ldmVudHMtcmVjb3JkZXInO1xuaW1wb3J0IEV2ZW50TGlzdGVuZXJNYW5hZ2VyIGZyb20gJy4vZXZlbnQtbGlzdGVuZXJzJztcbmltcG9ydCBJbnB1dEhlbHBlcnMgZnJvbSAnLi9pbnB1dC1oZWxwZXJzJztcbmltcG9ydCBXZWJBdWRpb0hvb2sgZnJvbSAnLi93ZWJhdWRpby1ob29rJztcbmltcG9ydCBXZWJWUkhvb2sgZnJvbSAnLi93ZWJ2ci1ob29rJztcbmltcG9ydCB7cmVzaXplSW1hZ2VEYXRhfSBmcm9tICcuL2ltYWdlLXV0aWxzJztcbmltcG9ydCBwaXhlbG1hdGNoIGZyb20gJ3BpeGVsbWF0Y2gnO1xuaW1wb3J0IFdlYkdMU3RhdHMgZnJvbSAnd2ViZ2wtc3RhdHMnO1xuXG5jb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxuZnVuY3Rpb24gb25SZWFkeShjYWxsYmFjaykge1xuICBpZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4gICkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgY2FsbGJhY2spO1xuICB9XG59XG5cblxuLy8gSGFja3MgdG8gZml4IHNvbWUgVW5pdHkgZGVtb3NcbmNvbnNvbGUubG9nRXJyb3IgPSAobXNnKSA9PiBjb25zb2xlLmVycm9yKG1zZyk7XG5cbndpbmRvdy5URVNURVIgPSB7XG4gIFhScmVhZHk6IGZhbHNlLFxuICByZWFkeTogZmFsc2UsXG4gIGZpbmlzaGVkOiBmYWxzZSxcbiAgaW5wdXRMb2FkaW5nOiBmYWxzZSxcblxuICAvLyBDdXJyZW50bHkgZXhlY3V0aW5nIGZyYW1lLlxuICByZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI6IDAsXG4gIGZpcnN0RnJhbWVUaW1lOiBudWxsLFxuICAvLyBJZiAtMSwgd2UgYXJlIG5vdCBydW5uaW5nIGFuIGV2ZW50LiBPdGhlcndpc2UgcmVwcmVzZW50cyB0aGUgd2FsbGNsb2NrIHRpbWUgb2Ygd2hlbiB3ZSBleGl0ZWQgdGhlIGxhc3QgZXZlbnQgaGFuZGxlci5cbiAgcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBkZW5vdGluZyB3aGVuIHRoZSBwYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLlxuICBwYWdlTG9hZFRpbWU6IG51bGwsXG5cbiAgLy8gSG9sZHMgdGhlIGFtb3VudCBvZiB0aW1lIGluIG1zZWNzIHRoYXQgdGhlIHByZXZpb3VzbHkgcmVuZGVyZWQgZnJhbWUgdG9vay4gVXNlZCB0byBlc3RpbWF0ZSB3aGVuIGEgc3R1dHRlciBldmVudCBvY2N1cnMgKGZhc3QgZnJhbWUgZm9sbG93ZWQgYnkgYSBzbG93IGZyYW1lKVxuICBsYXN0RnJhbWVEdXJhdGlvbjogLTEsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gdGhlIHByZXZpb3VzIGZyYW1lIGZpbmlzaGVkLlxuICBsYXN0RnJhbWVUaWNrOiAtMSxcblxuICBhY2N1bXVsYXRlZENwdUlkbGVUaW1lOiAwLFxuXG4gIC8vIEtlZXBzIHRyYWNrIG9mIHBlcmZvcm1hbmNlIHN0dXR0ZXIgZXZlbnRzLiBBIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIHdoZW4gdGhlcmUgaXMgYSBoaWNjdXAgaW4gc3Vic2VxdWVudCBwZXItZnJhbWUgdGltZXMuIChmYXN0IGZvbGxvd2VkIGJ5IHNsb3cpXG4gIG51bVN0dXR0ZXJFdmVudHM6IDAsXG5cbiAgbnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZTogMTIwLCAvLyBSZXF1aXJlIDEyMCBmcmFtZXMgaS5lLiB+MiBzZWNvbmRzIG9mIGNvbnNlY3V0aXZlIHNtb290aCBzdHV0dGVyIGZyZWUgZnJhbWVzIHRvIGNvbmNsdWRlIHdlIGhhdmUgcmVhY2hlZCBhIHN0YWJsZSBhbmltYXRpb24gcmF0ZVxuXG4gIC8vIE1lYXN1cmUgYSBcInRpbWUgdW50aWwgc21vb3RoIGZyYW1lIHJhdGVcIiBxdWFudGl0eSwgaS5lLiB0aGUgdGltZSBhZnRlciB3aGljaCB3ZSBjb25zaWRlciB0aGUgc3RhcnR1cCBKSVQgYW5kIEdDIGVmZmVjdHMgdG8gaGF2ZSBzZXR0bGVkLlxuICAvLyBUaGlzIGZpZWxkIHRyYWNrcyBob3cgbWFueSBjb25zZWN1dGl2ZSBmcmFtZXMgaGF2ZSBydW4gc21vb3RobHkuIFRoaXMgdmFyaWFibGUgaXMgc2V0IHRvIC0xIHdoZW4gc21vb3RoIGZyYW1lIHJhdGUgaGFzIGJlZW4gYWNoaWV2ZWQgdG8gZGlzYWJsZSB0cmFja2luZyB0aGlzIGZ1cnRoZXIuXG4gIG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzOiAwLFxuXG4gIHJhbmRvbVNlZWQ6IDEsXG4gIG1hbmRhdG9yeUF1dG9FbnRlclhSOiB0eXBlb2YgcGFyYW1ldGVyc1snbWFuZGF0b3J5LWF1dG9lbnRlci14ciddICE9PSAndW5kZWZpbmVkJyxcbiAgbnVtRnJhbWVzVG9SZW5kZXI6IHR5cGVvZiBwYXJhbWV0ZXJzWydudW0tZnJhbWVzJ10gPT09ICd1bmRlZmluZWQnID8gMTAwMCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ251bS1mcmFtZXMnXSksXG5cbiAgLy8gQ2FudmFzIHVzZWQgYnkgdGhlIHRlc3QgdG8gcmVuZGVyXG4gIGNhbnZhczogbnVsbCxcblxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbiAgLy8gdmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG4gIGlzUmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucmVhZHksIHRoaXMuWFJyZWFkeSk7XG4gICAgcmV0dXJuIHRoaXMucmVhZHkgJiYgdGhpcy5YUnJlYWR5O1xuICB9LFxuXG4gIHByZVRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChHRlhURVNUU19DT05GSUcucHJlTWFpbkxvb3ApIHtcbiAgICAgIEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCgpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdyZWFkeScsIHRoaXMucmVhZHksICd4cnJlYWR5JywgdGhpcy5YUnJlYWR5KTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBXZWJHTFN0YXRzLmZyYW1lU3RhcnQoKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCc+PiBmcmFtZS1zdGFydCcpO1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmNhbnZhcykge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWyduby1yZW5kZXJpbmcnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBhc3N1bWUgdGhlIGxhc3Qgd2ViZ2wgY29udGV4dCBiZWluZyBpbml0aWFsaXplZCBpcyB0aGUgb25lIHVzZWQgdG8gcmVuZGVyaW5nXG4gICAgICAgIC8vIElmIHRoYXQncyBkaWZmZXJlbnQsIHRoZSB0ZXN0IHNob3VsZCBoYXZlIGEgY3VzdG9tIGNvZGUgdG8gcmV0dXJuIHRoYXQgY2FudmFzXG4gICAgICAgIGlmIChDYW52YXNIb29rLmdldE51bUNvbnRleHRzKCkgPiAwKSB7XG4gICAgICAgICAgdmFyIGNvbnRleHQgPSBDYW52YXNIb29rLmdldENvbnRleHQoQ2FudmFzSG9vay5nZXROdW1Db250ZXh0cygpIC0gMSk7XG4gICAgICAgICAgdGhpcy5jYW52YXMgPSBjb250ZXh0LmNhbnZhcztcblxuICAgICAgICAgIC8vIFByZXZlbnQgZXZlbnRzIG5vdCBkZWZpbmVkIGFzIGV2ZW50LWxpc3RlbmVyc1xuICAgICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSAoKSA9PiB7fTtcblxuICAgICAgICAgIC8vIFRvIHByZXZlbnQgd2lkdGggJiBoZWlnaHQgMTAwJVxuICAgICAgICAgIGZ1bmN0aW9uIGFkZFN0eWxlU3RyaW5nKHN0cikge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgbm9kZS5pbm5lckhUTUwgPSBzdHI7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZFN0eWxlU3RyaW5nKGAuZ2Z4dGVzdHMtY2FudmFzIHt3aWR0aDogJHt0aGlzLmNhbnZhc1dpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLmNhbnZhc0hlaWdodH1weCAhaW1wb3J0YW50O31gKTtcblxuICAgICAgICAgIC8vIFRvIGZpeCBBLUZyYW1lXG4gICAgICAgICAgYWRkU3R5bGVTdHJpbmcoYGEtc2NlbmUgLmEtY2FudmFzLmdmeHRlc3RzLWNhbnZhcyB7d2lkdGg6ICR7dGhpcy5jYW52YXNXaWR0aH1weCAhaW1wb3J0YW50OyBoZWlnaHQ6ICR7dGhpcy5jYW52YXNIZWlnaHR9cHggIWltcG9ydGFudDt9YCk7XG5cbiAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdnZnh0ZXN0cy1jYW52YXMnKTtcblxuICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcblxuICAgICAgICAgIC8vIENhbnZhc0hvb2tcbiAgICAgICAgICBXZWJHTFN0YXRzLnNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnICYmICF0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlciA9IG5ldyBJbnB1dFJlY29yZGVyKHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5lbmFibGUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlcGxheSddICE9PSAndW5kZWZpbmVkJyAmJiBHRlhURVNUU19DT05GSUcuaW5wdXQgJiYgIXRoaXMuaW5wdXRMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0TG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICBmZXRjaCgnL3Rlc3RzLycgKyBHRlhURVNUU19DT05GSUcuaW5wdXQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgICB0aGlzLmlucHV0UmVwbGF5ZXIgPSBuZXcgSW5wdXRSZXBsYXllcih0aGlzLmNhbnZhcywganNvbiwgdGhpcy5ldmVudExpc3RlbmVyLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgICAgICAgICAgIHRoaXMuaW5wdXRIZWxwZXJzID0gbmV3IElucHV0SGVscGVycyh0aGlzLmNhbnZhcyk7XG4gICAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL0BmaXhtZSBlbHNlIGZvciBjYW52YXMgMmQgd2l0aG91dCB3ZWJnbFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMCkge1xuICAgICAgLypcbiAgICAgIGlmICgnYXV0b2VudGVyLXhyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgIHRoaXMuaW5qZWN0QXV0b0VudGVyWFIodGhpcy5jYW52YXMpO1xuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG5cbiAgICAvLyByZWZlcmVuY2VUZXN0VDAgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgaWYgKHRoaXMucGFnZUxvYWRUaW1lID09PSBudWxsKSB0aGlzLnBhZ2VMb2FkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHBhZ2VJbml0VGltZTtcblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIGlmICh0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSAhPSAtMSkge1xuICAgICAgdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lO1xuICAgICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICB9XG4gIH0sXG5cbiAgcG9zdFRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMucmVhZHkgfHwgIXRoaXMuWFJyZWFkeSkge3JldHVybjt9XG5cbiAgICBpZiAodGhpcy5zdGFydGVkKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCc8PCBmcmFtZWVuZCcpO1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZUVuZCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5mcmFtZU51bWJlciA9IHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZXBsYXllci50aWNrKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuXG4gICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICB2YXIgZnJhbWVEdXJhdGlvbiA9IHRpbWVOb3cgLSB0aGlzLmxhc3RGcmFtZVRpY2s7XG4gICAgdGhpcy5sYXN0RnJhbWVUaWNrID0gdGltZU5vdztcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPiA1ICYmIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPiAwKSB7XG4gICAgICAvLyBUaGlzIG11c3QgYmUgZml4ZWQgZGVwZW5kaW5nIG9uIHRoZSB2c3luY1xuICAgICAgaWYgKGZyYW1lRHVyYXRpb24gPiAyMC4wICYmIGZyYW1lRHVyYXRpb24gPiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uICogMS4zNSkge1xuICAgICAgICB0aGlzLm51bVN0dXR0ZXJFdmVudHMrKztcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHtcbiAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzKys7XG4gICAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPj0gdGhpcy5udW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGltZVVudGlsU21vb3RoRnJhbWVyYXRlJywgdGltZU5vdyAtIHRoaXMuZmlyc3RGcmFtZVRpbWUpO1xuICAgICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID0gZnJhbWVEdXJhdGlvbjtcbi8qXG4gICAgaWYgKG51bVByZWxvYWRYSFJzSW5GbGlnaHQgPT0gMCkgeyAvLyBJbXBvcnRhbnQhIFRoZSBmcmFtZSBudW1iZXIgYWR2YW5jZXMgb25seSBmb3IgdGhvc2UgZnJhbWVzIHRoYXQgdGhlIGdhbWUgaXMgbm90IHdhaXRpbmcgZm9yIGRhdGEgZnJvbSB0aGUgaW5pdGlhbCBuZXR3b3JrIGRvd25sb2Fkcy5cbiAgICAgIGlmIChudW1TdGFydHVwQmxvY2tlclhIUnNQZW5kaW5nID09IDApICsrdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7IC8vIEFjdHVhbCByZWZ0ZXN0IGZyYW1lIGNvdW50IG9ubHkgaW5jcmVtZW50cyBhZnRlciBnYW1lIGhhcyBjb25zdW1lZCBhbGwgdGhlIGNyaXRpY2FsIFhIUnMgdGhhdCB3ZXJlIHRvIGJlIHByZWxvYWRlZC5cbiAgICAgICsrZmFrZWRUaW1lOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgICB9XG4qL1xuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKys7XG4gICAgaWYgKHRoaXMuZnJhbWVQcm9ncmVzc0Jhcikge1xuICAgICAgdmFyIHBlcmMgPSBwYXJzZUludCgxMDAgKiB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyYyArIFwiJVwiO1xuICAgIH1cblxuICAgIEZha2VUaW1lcnMuZmFrZWRUaW1lKys7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICB0aGlzLmZpcnN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IGZyYW1lIHN1Ym1pdHRlZCBhdCAobXMpOicsIHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIFdlYkdMU3RhdHMuZnJhbWVFbmQoKTtcbiAgfSxcblxuICBjcmVhdGVEb3dubG9hZEltYWdlTGluazogZnVuY3Rpb24oZGF0YSwgZmlsZW5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUgKyAnLnBuZycpO1xuICAgIGEuc2V0QXR0cmlidXRlKCdocmVmJywgZGF0YSk7XG4gICAgYS5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZGOyBkaXNwbGF5OiBpbmxpbmUtZ3JpZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBtYXJnaW46IDJweDsgZm9udC1zaXplOiAxNHB4Oyc7XG5cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLmlkID0gZmlsZW5hbWU7XG4gICAgaW1nLnNyYyA9IGRhdGE7XG4gICAgYS5hcHBlbmRDaGlsZChpbWcpO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbC5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBkZXNjcmlwdGlvbiB8fCBmaWxlbmFtZTtcblxuICAgIGEuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfaW1hZ2VzJykuYXBwZW5kQ2hpbGQoYSk7XG4gIH0sXG5cbiAgLy8gWEhScyBpbiB0aGUgZXhwZWN0ZWQgcmVuZGVyIG91dHB1dCBpbWFnZSwgYWx3YXlzICdyZWZlcmVuY2UucG5nJyBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHRlc3QuXG4gIGxvYWRSZWZlcmVuY2VJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEdGWFRFU1RTX1JFRkVSRU5DRUlNQUdFX0JBU0VVUkwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIHZhciByZWZlcmVuY2VJbWFnZU5hbWUgPSBwYXJhbWV0ZXJzWydyZWZlcmVuY2UtaW1hZ2UnXSB8fCBHRlhURVNUU19DT05GSUcuaWQ7XG5cbiAgICAgIGltZy5zcmMgPSAnLycgKyBHRlhURVNUU19SRUZFUkVOQ0VJTUFHRV9CQVNFVVJMICsgJy8nICsgcmVmZXJlbmNlSW1hZ2VOYW1lICsgJy5wbmcnO1xuICAgICAgaW1nLm9uYWJvcnQgPSBpbWcub25lcnJvciA9IHJlamVjdDtcblxuICAgICAgLy8gcmVmZXJlbmNlLnBuZyBtaWdodCBjb21lIGZyb20gYSBkaWZmZXJlbnQgZG9tYWluIHRoYW4gdGhlIGNhbnZhcywgc28gZG9uJ3QgbGV0IGl0IHRhaW50IGN0eC5nZXRJbWFnZURhdGEoKS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0NPUlNfZW5hYmxlZF9pbWFnZVxuICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBcbiAgICAgICAgdmFyIGRhdGEgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAncmVmZXJlbmNlLWltYWdlJywgJ1JlZmVyZW5jZSBpbWFnZScpO1xuXG4gICAgICAgIHJlc29sdmUodGhpcy5yZWZlcmVuY2VJbWFnZURhdGEpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWZlcmVuY2VJbWFnZSA9IGltZztcbiAgICB9KTtcbiAgfSxcblxuICBnZXRDdXJyZW50SW1hZ2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgLy8gR3JhYiByZW5kZXJlZCBXZWJHTCBmcm9udCBidWZmZXIgaW1hZ2UgdG8gYSBKUy1zaWRlIGltYWdlIG9iamVjdC5cbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gY2FsbGJhY2s7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBnZW5lcmF0ZSBpbWFnZVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIHJlZnRlc3QgKGV2dCkge1xuICAgICAgICB2YXIgaW1nID0gYWN0dWFsSW1hZ2U7XG4gICAgICAgIHZhciBjYW52YXNDdXJyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY2FudmFzQ3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0N1cnJlbnQud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhc0N1cnJlbnQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgICB2YXIgY3VycmVudEltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICAgICAgc2VsZi5sb2FkUmVmZXJlbmNlSW1hZ2UoKS50aGVuKHJlZkltYWdlRGF0YSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gcmVmSW1hZ2VEYXRhLndpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSByZWZJbWFnZURhdGEuaGVpZ2h0O1xuICAgICAgICAgIHZhciBjYW52YXNEaWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgdmFyIGRpZmZDdHggPSBjYW52YXNEaWZmLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgY2FudmFzRGlmZi53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIGNhbnZhc0RpZmYuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgIHZhciBkaWZmID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgICB2YXIgbmV3SW1hZ2VEYXRhID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgcmVzaXplSW1hZ2VEYXRhKGN1cnJlbnRJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG5cbiAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZWZJbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICB2YXIgYWN0dWFsID0gbmV3SW1hZ2VEYXRhLmRhdGE7XG5cbiAgICAgICAgICB2YXIgdGhyZXNob2xkID0gdHlwZW9mIEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkID09PSAndW5kZWZpbmVkJyA/IDAuMiA6IEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkO1xuICAgICAgICAgIHZhciBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChleHBlY3RlZCwgYWN0dWFsLCBkaWZmLmRhdGEsIHdpZHRoLCBoZWlnaHQsIHt0aHJlc2hvbGQ6IHRocmVzaG9sZH0pO1xuICAgICAgICAgIHZhciBkaWZmUGVyYyA9IG51bURpZmZQaXhlbHMgLyAod2lkdGggKiBoZWlnaHQpICogMTAwO1xuXG4gICAgICAgICAgdmFyIGZhaWwgPSBkaWZmUGVyYyA+IDAuMjsgLy8gZGlmZiBwZXJjIDAgLSAxMDAlXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHtyZXN1bHQ6ICdwYXNzJ307XG5cbiAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2ggKCR7ZGlmZlBlcmMudG9GaXhlZCgyKX0lIGRpZmZlcmVudCBwaXhlbHMpYDtcbiAgICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgICAgZGlmZlBlcmM6IGRpZmZQZXJjLFxuICAgICAgICAgICAgICBudW1EaWZmUGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICAgICAgICBmYWlsUmVhc29uOiAnUmVmZXJlbmNlIGltYWdlIG1pc21hdGNoJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gJ2ZhaWwnO1xuICAgICAgICAgICAgYmVuY2htYXJrRGl2LnF1ZXJ5U2VsZWN0b3IoJ2gxJykuaW5uZXJUZXh0ID0gJ1Rlc3QgZmFpbGVkISc7XG5cbiAgICAgICAgICAgIGRpZmZDdHgucHV0SW1hZ2VEYXRhKGRpZmYsIDAsIDApO1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGNhbnZhc0RpZmYudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgJ2NhbnZhcy1kaWZmJywgJ0RpZmZlcmVuY2UnKTtcbiAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9ICdmYWlsJztcbiAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBmYWlsZWQhJztcblxuICAgICAgICAgIHZhciBkaXZFcnJvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJyk7XG4gICAgICAgICAgZGl2RXJyb3IucXVlcnlTZWxlY3RvcignaDMnKS5pbm5lckhUTUwgPSBgRVJST1I6IEZhaWxlZCB0byBsb2FkIHJlZmVyZW5jZSBpbWFnZWA7XG4gICAgICAgICAgZGl2RXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgcmVzdWx0OiAnZmFpbCcsXG4gICAgICAgICAgICBmYWlsUmVhc29uOiAnRXJyb3IgbG9hZGluZyByZWZlcmVuY2UgaW1hZ2UnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBhY3R1YWxJbWFnZS5zcmMgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IHJlZnRlc3Q7XG4gICAgICAgIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBpbml0O1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGluaXRTZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly8nICsgR0ZYVEVTVFNfQ09ORklHLnNlcnZlcklQICsgJzo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHRlc3Rpbmcgc2VydmVyJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCd0ZXN0X3N0YXJ0ZWQnLCB7aWQ6IEdGWFRFU1RTX0NPTkZJRy5pZCwgdGVzdFVVSUQ6IHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbmV4dF9iZW5jaG1hcmsnLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ25leHRfYmVuY2htYXJrJywgZGF0YSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShkYXRhLnVybCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5wdXREb3dubG9hZEJ1dHRvbjogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gRHVtcCBpbnB1dFxuICAgICAgZnVuY3Rpb24gc2F2ZVN0cmluZyAodGV4dCwgZmlsZW5hbWUsIG1pbWVUeXBlKSB7XG4gICAgICAgIHNhdmVCbG9iKG5ldyBCbG9iKFsgdGV4dCBdLCB7IHR5cGU6IG1pbWVUeXBlIH0pLCBmaWxlbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVCbG9iIChibG9iLCBmaWxlbmFtZSkge1xuICAgICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWUgfHwgJ2lucHV0Lmpzb24nO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIC8vIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTsgYnJlYWtzIEZpcmVmb3guLi5cbiAgICAgIH1cblxuICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLmlucHV0UmVjb3JkZXIuZXZlbnRzLCBudWxsLCAyKTtcblxuICAgICAgLy9jb25zb2xlLmxvZygnSW5wdXQgcmVjb3JkZWQnLCBqc29uKTtcblxuICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuICAgICAgbGluay5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICAgIGxpbmsub25jbGljayA9ICgpID0+IHNhdmVTdHJpbmcoanNvbiwgR0ZYVEVTVFNfQ09ORklHLmlkICsgJy5qc29uJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYERvd25sb2FkIGlucHV0IEpTT05gKSk7IC8vICgke3RoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMubGVuZ3RofSBldmVudHMgcmVjb3JkZWQpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpLmFwcGVuZENoaWxkKGxpbmspO1xuICB9LFxuXG4gIGdlbmVyYXRlRmFpbGVkQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoZmFpbFJlYXNvbikge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXN0X2lkOiBHRlhURVNUU19DT05GSUcuaWQsXG4gICAgICBhdXRvRW50ZXJYUjogdGhpcy5hdXRvRW50ZXJYUixcbiAgICAgIHJldmlzaW9uOiBHRlhURVNUU19DT05GSUcucmV2aXNpb24gfHwgMCxcbiAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgIGZhaWxSZWFzb246IGZhaWxSZWFzb25cbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpbWVFbmQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgdmFyIHRvdGFsVGltZSA9IHRpbWVFbmQgLSBwYWdlSW5pdFRpbWU7IC8vIFRvdGFsIHRpbWUsIGluY2x1ZGluZyBldmVyeXRoaW5nLlxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlID0+IHtcbiAgICAgIHZhciB0b3RhbFJlbmRlclRpbWUgPSB0aW1lRW5kIC0gdGhpcy5maXJzdEZyYW1lVGltZTtcbiAgICAgIHZhciBjcHVJZGxlID0gdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICogMTAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXNUb1JlbmRlciAqIDEwMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcblxuICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgdGVzdF9pZDogR0ZYVEVTVFNfQ09ORklHLmlkLFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIHBlcmY6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICAgICAgd2ViZ2w6IFdlYkdMU3RhdHMuZ2V0U3VtbWFyeSgpXG4gICAgICAgICAgLy8gISEhISBvY3VsdXNfdnJhcGk6IHRoaXMuXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9FbnRlclhSOiB0aGlzLmF1dG9FbnRlclhSLFxuICAgICAgICByZXZpc2lvbjogR0ZYVEVTVFNfQ09ORklHLnJldmlzaW9uIHx8IDAsXG4gICAgICAgIHdlYmF1ZGlvOiBXZWJBdWRpb0hvb2suc3RhdHMsXG4gICAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUsXG4gICAgICAgIGF2Z0ZwczogZnBzLFxuICAgICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBjcHVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZUluTWFpbkxvb3AsXG4gICAgICAgIGF2Z0NwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICAgIGNwdUlkbGVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCxcbiAgICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBwYWdlTG9hZFRpbWU6IHRoaXMucGFnZUxvYWRUaW1lLFxuICAgICAgICByZXN1bHQ6ICdwYXNzJyxcbiAgICAgICAgbG9nczogdGhpcy5sb2dzXG4gICAgICB9O1xuXG4gICAgICAvLyBAdG9kbyBJbmRpY2F0ZSBzb21laG93IHRoYXQgbm8gcmVmZXJlbmNlIHRlc3QgaGFzIGJlZW4gcGVyZm9ybWVkXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3NraXAtcmVmZXJlbmNlLWltYWdlLXRlc3QnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb0ltYWdlUmVmZXJlbmNlQ2hlY2soKS50aGVuKHJlZlJlc3VsdCA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHJlZlJlc3VsdCk7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KS5jYXRjaChyZWZSZXN1bHQgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByZWZSZXN1bHQpO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYmVuY2htYXJrRmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluamVjdEJlbmNobWFya0ZpbmlzaGVkSFRNTCgpO1xuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgdGhpcy5hZGRJbnB1dERvd25sb2FkQnV0dG9uKCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgdmFyIGRlc2NyaXB0aW9uID0gdGhpcy5pbnB1dFJlY29yZGVyID8gJ0Rvd25sb2FkIHJlZmVyZW5jZSBpbWFnZScgOiAnQWN0dWFsIHJlbmRlcic7XG4gICAgICB0aGlzLmNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rKGRhdGEsIEdGWFRFU1RTX0NPTkZJRy5pZCwgZGVzY3JpcHRpb24pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNhbid0IGdlbmVyYXRlIGltYWdlXCIsIGUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVCZW5jaG1hcmtSZXN1bHQoKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0JlbmNobWFya1Jlc3VsdChyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBpbmplY3RCZW5jaG1hcmtGaW5pc2hlZEhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgI3Rlc3RfZmluaXNoZWQge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGRkO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjMDAwO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQucGFzcyB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM5Zjk7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkLmZhaWwge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjk5O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMge1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMgaW1nIHtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDA3MDk1O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZCAuYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgICAgICBjb2xvcjogI0ZGRkZGRjtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCIsIFwiSGVsdmV0aWNhXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYgIWltcG9ydGFudDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBsaW5lLWhlaWdodDogbm9ybWFsO1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIHBhZGRpbmc6IDEwcHggMXB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAzMDBtcyBlYXNlLW91dDtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQgLmJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDc4YTA7XG4gICAgICB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gYDxoMT5UZXN0IGZpbmlzaGVkITwvaDE+YDtcbiAgICBkaXYuaWQgPSAndGVzdF9maW5pc2hlZCc7XG4gICAgZGl2LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblxuICAgIHZhciBkaXZSZWZlcmVuY2VFcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlkID0gJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmNzc1RleHQgPSAndGV4dC1hbGlnbjpjZW50ZXI7IGNvbG9yOiAjZjAwOydcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5pbm5lckhUTUwgPSAnPGgzPjwvaDM+JztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGRpdlJlZmVyZW5jZUVycm9yKTtcbiAgICB2YXIgZGl2SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2SW1nLmlkID0gJ3Rlc3RfaW1hZ2VzJztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5hcHBlbmRDaGlsZChkaXZJbWcpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICB9LFxuICBwcm9jZXNzQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIGlmIChwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXSkge1xuICAgICAgICByZXN1bHQudGVzdFVVSUQgPSBwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3Rlc3RfZmluaXNoJywgcmVzdWx0KTtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gcmVzdWx0LnJlc3VsdDtcbiAgICBpZiAocmVzdWx0LnJlc3VsdCA9PT0gJ3Bhc3MnKSB7XG4gICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBwYXNzZWQhJztcbiAgICB9XG5cbiAgICBiZW5jaG1hcmtEaXYuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCByZXN1bHQpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY2xvc2UgJiYgdHlwZW9mIHBhcmFtZXRlcnNbJ25vLWNsb3NlLW9uLWZhaWwnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIH1cbiAgfSxcblxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5zZW5kTG9nKVxuICAgICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGFkZEluZm9PdmVybGF5OiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snaW5mby1vdmVybGF5J10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdk92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdk92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDk1LCA0MCwgMTM2KTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIHBhZGRpbmc6IDVweGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdk92ZXJsYXkpO1xuICAgICAgZGl2T3ZlcmxheS5pbm5lclRleHQgPSBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXTtcbiAgICB9KVxuICB9LFxuXG4gIGFkZFByb2dyZXNzQmFyOiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIHZhciBkaXZQcm9ncmVzc0JhcnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdlByb2dyZXNzQmFycy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgYm90dG9tOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzOyB3aWR0aDogMjAwcHg7IHBhZGRpbmc6IDVweCA1cHggMHB4IDVweDsnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXZQcm9ncmVzc0JhcnMpO1xuXG4gICAgICB2YXIgb3JkZXJHbG9iYWwgPSBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXTtcbiAgICAgIHZhciB0b3RhbEdsb2JhbCA9IHBhcmFtZXRlcnNbJ3RvdGFsLWdsb2JhbCddO1xuICAgICAgdmFyIHBlcmNHbG9iYWwgPSBNYXRoLnJvdW5kKG9yZGVyR2xvYmFsL3RvdGFsR2xvYmFsICogMTAwKTtcbiAgICAgIHZhciBvcmRlclRlc3QgPSBwYXJhbWV0ZXJzWydvcmRlci10ZXN0J107XG4gICAgICB2YXIgdG90YWxUZXN0ID0gcGFyYW1ldGVyc1sndG90YWwtdGVzdCddO1xuICAgICAgdmFyIHBlcmNUZXN0ID0gTWF0aC5yb3VuZChvcmRlclRlc3QvdG90YWxUZXN0ICogMTAwKTtcblxuICAgICAgZnVuY3Rpb24gYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKHRleHQsIGNvbG9yLCBwZXJjLCBpZCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5zdHlsZS5jc3NUZXh0PSd3aWR0aDogMTAwJTsgaGVpZ2h0OiAyMHB4OyBtYXJnaW4tYm90dG9tOiA1cHg7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQtY29sb3I6ICNmNWY1ZjU7JztcbiAgICAgICAgZGl2UHJvZ3Jlc3NCYXJzLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgdmFyIGRpdlByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkaXZQcm9ncmVzcyk7XG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZGl2UHJvZ3Jlc3Muc3R5bGUuY3NzVGV4dD1gXG4gICAgICAgICAgd2lkdGg6ICR7cGVyY30lO2JhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9IGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBmb250LWZhbWlseTogTW9ub3NwYWNlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzM3YWI3O1xuICAgICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsLjE1KTtgO1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlubmVyVGV4dCA9IHRleHQ7O1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oYCR7b3JkZXJUZXN0fS8ke3RvdGFsVGVzdH0gJHtwZXJjVGVzdH0lYCwgJyM1YmMwZGUnLCBwZXJjVGVzdCk7XG4gICAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlckdsb2JhbH0vJHt0b3RhbEdsb2JhbH0gJHtwZXJjR2xvYmFsfSVgLCAnIzMzN2FiNycsIHBlcmNHbG9iYWwpO1xuICAgICAgfVxuXG4gICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oJycsICcjMzM3YWI3JywgMCwgJ251bWZyYW1lcycpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bWZyYW1lcycpO1xuXG4gICAgfSk7XG4gIH0sXG5cbiAgaG9va01vZGFsczogZnVuY3Rpb24oKSB7XG4gICAgLy8gSG9vayBtb2RhbHM6IFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxuICAgIHdpbmRvdy5hbGVydCA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuYWxlcnQoJyArIG1zZyArICcpJyk7IH1cbiAgICB3aW5kb3cuY29uZmlybSA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuY29uZmlybSgnICsgbXNnICsgJyknKTsgcmV0dXJuIHRydWU7IH1cbiAgfSxcbiAgUkFGczogW10sIC8vIFVzZWQgdG8gc3RvcmUgaW5zdGFuY2VzIG9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGNhbGxiYWNrc1xuICBwcmV2UkFGUmVmZXJlbmNlOiBudWxsLCAvLyBQcmV2aW91cyBjYWxsZWQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG4gIHN0YXJ0ZWQ6IGZhbHNlLFxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gKHAsIGZyYW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5maW5pc2hlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICBpZiAodGhpcy5SQUZzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hvb2tlZENhbGxiYWNrJywgdGhpcy5SQUZzKTtcbiAgICAgICAgY29uc29sZS5sb2coY2FsbGJhY2spO1xuICAgICAgfSovXG5cbiAgICAgIC8vIFB1c2ggdGhlIGNhbGxiYWNrIHRvIHRoZSBsaXN0IG9mIGN1cnJlbnRseSBydW5uaW5nIFJBRnNcbiAgICAgIGlmICh0aGlzLlJBRnMuaW5kZXhPZihjYWxsYmFjaykgPT09IC0xICYmXG4gICAgICAgIHRoaXMuUkFGcy5maW5kSW5kZXgoZiA9PiBmLnRvU3RyaW5nKCkgPT09IGNhbGxiYWNrLnRvU3RyaW5nKCkpID09PSAtMSkge1xuICAgICAgICB0aGlzLlJBRnMucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBjdXJyZW50IGNhbGxiYWNrIGlzIHRoZSBmaXJzdCBvbiB0aGUgbGlzdCwgd2UgYXNzdW1lIHRoZSBmcmFtZSBqdXN0IHN0YXJ0ZWRcbiAgICAgIC8vIFRoZSAudG9TdHJpbmcoKSBpcyBuZWVkZWQgYmVjYXVzZSBvZiBhcnJvdyBmdW5jdGlvbnNcbiAgICAgIGlmICh0aGlzLlJBRnNbMF0gPT09IGNhbGxiYWNrIHx8IHRoaXMuUkFGc1swXS50b1N0cmluZygpID09PSBjYWxsYmFjay50b1N0cmluZygpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicHJldGlja1wiKTtcbiAgICAgICAgdGhpcy5wcmVUaWNrKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmcmFtZSkge1xuICAgICAgICAvKlxuICAgICAgICBsZXQgaW5wdXRTb3VyY2VzID0gW107XG4gICAgICAgIGZvciAobGV0IHNvdXJjZSBvZiBmcmFtZS5zZXNzaW9uLmlucHV0U291cmNlcykge1xuICAgICAgICAgIGlmIChzb3VyY2UuZ3JpcFNwYWNlICYmIHNvdXJjZS5nYW1lcGFkKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlUG9zZSA9IGZyYW1lLmdldFBvc2Uoc291cmNlLmdyaXBTcGFjZSwgcmVmU3BhY2UpO1xuXG4gICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gbmV3IFhSUmlnaWRUcmFuc2Zvcm0obmV3IERPTVBvaW50KDAsIDEuNiwgMSwgMSksbmV3IERPTVBvaW50KDAsMCwwLDEpKVxuXG4gICAgICAgICAgICB2YXIgbmV3VmlldyA9IHtcbiAgICAgICAgICAgICAgZXllOiB2aWV3LmV5ZSxcbiAgICAgICAgICAgICAgcHJvamVjdGlvbk1hdHJpeDogdmlldy5wcm9qZWN0aW9uTWF0cml4LFxuICAgICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zZm9ybSxcbiAgICAgICAgICAgICAgb3JpZ2luYWxWaWV3OiB2aWV3XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbmV3UG9zZS52aWV3cy5wdXNoKG5ld1ZpZXcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuKi9cbiAgICAgICAgbGV0IG9yaUdldFBvc2UgPSBmcmFtZS5nZXRQb3NlO1xuICAgICAgICBmcmFtZS5nZXRQb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHBvc2UgPSBvcmlHZXRQb3NlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgaWYgKHBvc2UpIHtcbiAgICAgICAgICAgIGxldCBhbXAgPSAwLjU7XG4gICAgICAgICAgICBsZXQgZnJlcSA9IDAuMDAwNTtcbiAgICAgICAgICAgIGxldCB4ID0gTWF0aC5zaW4ocGVyZm9ybWFuY2Uubm93KCkgKiBmcmVxKSAqIGFtcDtcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5jb3MocGVyZm9ybWFuY2Uubm93KCkgKiBmcmVxKSAqIGFtcDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybTogbmV3IFhSUmlnaWRUcmFuc2Zvcm0obmV3IERPTVBvaW50KHgsIDEuNiArIHksIC0xLCAxKSxuZXcgRE9NUG9pbnQoMCwwLDAsMSkpLFxuICAgICAgICAgICAgICBlbXVsYXRlZFBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHBvc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9yaUdldFZpZXdlclBvc2UgPSBmcmFtZS5nZXRWaWV3ZXJQb3NlO1xuICAgICAgICBmcmFtZS5nZXRWaWV3ZXJQb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHBvc2UgPSBvcmlHZXRWaWV3ZXJQb3NlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgbGV0IG5ld1Bvc2UgPSB7XG4gICAgICAgICAgICB2aWV3czogW11cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgdmFyIGJhc2VMYXllciA9IGZyYW1lLnNlc3Npb24ucmVuZGVyU3RhdGUuYmFzZUxheWVyO1xuICAgICAgICAgIGlmICghYmFzZUxheWVyLm9yaUdldFZpZXdwb3J0KSB7XG4gICAgICAgICAgICBiYXNlTGF5ZXIub3JpR2V0Vmlld3BvcnQgPSBiYXNlTGF5ZXIuZ2V0Vmlld3BvcnQ7XG4gICAgICAgICAgICBiYXNlTGF5ZXIuZ2V0Vmlld3BvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgbGV0IHZpZXcgPSBhcmd1bWVudHNbMF0ub3JpZ2luYWxWaWV3O1xuICAgICAgICAgICAgICBpZiAodmlldykge1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlTGF5ZXIub3JpR2V0Vmlld3BvcnQuYXBwbHkodGhpcywgW3ZpZXddKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnPj4+Pj4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZUxheWVyLm9yaUdldFZpZXdwb3J0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIHBvc2UgIT09IG51bGwgKSB7XG4gICAgICAgICAgICB2YXIgdmlld3MgPSBwb3NlLnZpZXdzO1xuICAgICAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdmlld3MubGVuZ3RoOyBpICsrICkge1xuICAgICAgICAgICAgICB2YXIgdmlldyA9IHZpZXdzWyBpIF07XG4gICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBuZXcgWFJSaWdpZFRyYW5zZm9ybShuZXcgRE9NUG9pbnQoMCwgMS42LCAwLCAxKSxuZXcgRE9NUG9pbnQoMCwwLDAsMSkpXG4gICAgICAgICAgICAgIHZhciBuZXdWaWV3ID0ge1xuICAgICAgICAgICAgICAgIGV5ZTogdmlldy5leWUsXG4gICAgICAgICAgICAgICAgcHJvamVjdGlvbk1hdHJpeDogdmlldy5wcm9qZWN0aW9uTWF0cml4LFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtLFxuICAgICAgICAgICAgICAgIG9yaWdpbmFsVmlldzogdmlld1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBuZXdQb3NlLnZpZXdzLnB1c2gobmV3Vmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXdQb3NlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhwZXJmb3JtYW5jZS5ub3coKSwgZnJhbWUpO1xuXG4gICAgICAvLyBJZiByZWFjaGluZyB0aGUgbGFzdCBSQUYsIGV4ZWN1dGUgYWxsIHRoZSBwb3N0IGNvZGVcbiAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhcnRlZCk7XG4gICAgICAvL2lmICh0aGlzLlJBRnNbIHRoaXMuUkFGcy5sZW5ndGggLSAxIF0gPT09IGNhbGxiYWNrICYmIHRoaXMuc3RhcnRlZCkge1xuICAgICAgaWYgKCAodGhpcy5SQUZzWyB0aGlzLlJBRnMubGVuZ3RoIC0gMSBdID09PSBjYWxsYmFjayB8fFxuICAgICAgICAgICAgdGhpcy5SQUZzWyB0aGlzLlJBRnMubGVuZ3RoIC0gMSBdLnRvU3RyaW5nKCkgPT09IGNhbGxiYWNrLnRvU3RyaW5nKClcbiAgICAgICAgKVxuICAgICAgICAmJiB0aGlzLnN0YXJ0ZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwb3N0dGlja1wiLCB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcik7XG4gICAgICAgIC8vIEB0b2RvIE1vdmUgYWxsIHRoaXMgbG9naWMgdG8gYSBmdW5jdGlvbiB0byBjbGVhbiB1cCB0aGlzIG9uZVxuICAgICAgICB0aGlzLnBvc3RUaWNrKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKCc+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4gRklOSVNIRUQhJylcbiAgICAgICAgICB0aGlzLnJlbGVhc2VSQUYoKTtcbiAgICAgICAgICB0aGlzLmZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmJlbmNobWFya0ZpbmlzaGVkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5wb3N0TWFpbkxvb3ApIHtcbiAgICAgICAgICBHRlhURVNUU19DT05GSUcucG9zdE1haW5Mb29wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIFJBRiBpcyB0aGUgc2FtZSBhcyBub3csIGp1c3QgcmVzZXQgdGhlIGxpc3RcbiAgICAgIC8vIGluIGNhc2Ugd2UgaGF2ZSBzdG9wcGVkIGNhbGxpbmcgc29tZSBvZiB0aGUgcHJldmlvdXMgUkFGc1xuICAgICAgLy9pZiAodGhpcy5wcmV2UkFGUmVmZXJlbmNlID09PSBjYWxsYmFjayAmJiAodGhpcy5SQUZzWzBdICE9PSBjYWxsYmFjayB8fCB0aGlzLlJBRnMubGVuZ3RoID4gMSkpIHtcbiAgICAgIGlmICgodGhpcy5wcmV2UkFGUmVmZXJlbmNlID09PSBjYWxsYmFja8KgfHwgdGhpcy5wcmV2UkFGUmVmZXJlbmNlICYmIHRoaXMucHJldlJBRlJlZmVyZW5jZS50b1N0cmluZygpID09PSBjYWxsYmFjay50b1N0cmluZygpKSAmJlxuICAgICAgICAodGhpcy5SQUZzWzBdICE9PSBjYWxsYmFjayB8fCB0aGlzLlJBRnNbMF0udG9TdHJpbmcoKSAhPT0gY2FsbGJhY2sudG9TdHJpbmcoKSB8fCB0aGlzLlJBRnMubGVuZ3RoID4gMSkpIHtcbiAgICAgICAgdGhpcy5SQUZzID0gW2NhbGxiYWNrXTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHJldlJBRlJlZmVyZW5jZSA9IGNhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UkFGQ29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhvb2tlZENhbGxiYWNrKTtcbiAgfSxcbiAgY3VycmVudFJBRkNvbnRleHQ6IHdpbmRvdyxcbiAgcmVsZWFzZVJBRjogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuUkFGY29udGV4dHMuZm9yRWFjaChjb250ZXh0ID0+IHtcbiAgICAgIGNvbnRleHQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKCkgPT4ge307XG4gICAgfSlcblxuICAgIC8vdGhpcy5jdXJyZW50UkFGQ29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7fTtcbiAgICBpZiAoJ1ZSRGlzcGxheScgaW4gd2luZG93ICYmXG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0IGluc3RhbmNlb2YgVlJEaXNwbGF5ICYmXG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LmlzUHJlc2VudGluZykge1xuICAgICAgdGhpcy5jdXJyZW50UkFGQ29udGV4dC5leGl0UHJlc2VudCgpO1xuICAgIH1cbiAgfSxcbiAgUkFGY29udGV4dHM6IFtdLFxuICBob29rUkFGOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGNvbnNvbGUubG9nKCdIb29raW5nJywgY29udGV4dCk7XG4gICAgaWYgKCFjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNvbnRleHQucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgdGhpcy5SQUZjb250ZXh0cy5wdXNoKGNvbnRleHQpO1xuICAgIH1cbiAgICBjb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jdXJyZW50UkFGQ29udGV4dCA9IGNvbnRleHQ7XG4gIH0sXG4gIHVuaG9va1JBRjogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjb25zb2xlLmxvZygndW5ob29raW5nJywgY29udGV4dCwgY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKTtcbiAgICBpZiAoY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICBjb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB9XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluaXRTZXJ2ZXIoKTtcblxuICAgIGlmICghR0ZYVEVTVFNfQ09ORklHLnByb3ZpZGVzUmFmSW50ZWdyYXRpb24pIHtcbiAgICAgIHRoaXMuaG9va1JBRih3aW5kb3cpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkUHJvZ3Jlc3NCYXIoKTtcbiAgICB0aGlzLmFkZEluZm9PdmVybGF5KCk7XG5cbiAgICBjb25zb2xlLmxvZygnRnJhbWVzIHRvIHJlbmRlcjonLCB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKTtcblxuICAgIGlmICghR0ZYVEVTVFNfQ09ORklHLmRvbnRPdmVycmlkZVRpbWUpIHtcbiAgICAgIEZha2VUaW1lcnMuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFHRlhURVNUU19DT05GSUcuZG9udE92ZXJyaWRlV2ViQXVkaW8pIHtcbiAgICAgIFdlYkF1ZGlvSG9vay5lbmFibGUodHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViYXVkaW8nXSAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIEB0b2RvIFVzZSBjb25maWdcbiAgICBXZWJWUkhvb2suZW5hYmxlKHZyZGlzcGxheSA9PiB7XG4gICAgICB0aGlzLmhvb2tSQUYodnJkaXNwbGF5KTtcbiAgICB9KTtcblxuICAgIGlmICgnYXV0b2VudGVyLXhyJykge1xuICAgICAgdGhpcy5pbmplY3RBdXRvRW50ZXJYUih0aGlzLmNhbnZhcyk7XG4gICAgICBuYXZpZ2F0b3IueHIuaXNTZXNzaW9uU3VwcG9ydGVkKCdpbW1lcnNpdmUtdnInKS50aGVuKChzdXBwb3J0ZWQpID0+IHtcbiAgICAgICAgaWYgKCFzdXBwb3J0ZWQpIHtcbiAgICAgICAgICB0aGlzLlhScmVhZHkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLlhScmVhZHkgPSB0cnVlO1xuICAgIH1cblxuXG4vKlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd2cmRpc3BsYXlwcmVzZW50Y2hhbmdlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBkaXNwbGF5ID0gZXZ0LmRpc3BsYXk7XG4gICAgICBpZiAoZGlzcGxheS5pc1ByZXNlbnRpbmcpIHtcbiAgICAgICAgdGhpcy51bmhvb2tSQUYod2luZG93KTtcbiAgICAgICAgdGhpcy5ob29rUkFGKGRpc3BsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51bmhvb2tSQUYoZGlzcGxheSk7XG4gICAgICAgIHRoaXMuaG9va1JBRih3aW5kb3cpO1xuICAgICAgfVxuICAgIH0pO1xuKi9cbiAgICBNYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20odGhpcy5yYW5kb21TZWVkKTtcbiAgICBDYW52YXNIb29rLmVuYWJsZShPYmplY3QuYXNzaWduKHtmYWtlV2ViR0w6IHR5cGVvZiBwYXJhbWV0ZXJzWydmYWtlLXdlYmdsJ10gIT09ICd1bmRlZmluZWQnfSwge3dpZHRoOiB0aGlzLmNhbnZhc1dpZHRoLCBoZWlnaHQ6IHRoaXMuY2FudmFzSGVpZ2h0fSkpO1xuICAgIHRoaXMuaG9va01vZGFscygpO1xuXG4gICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMubG9ncyA9IHtcbiAgICAgIGVycm9yczogW10sXG4gICAgICB3YXJuaW5nczogW10sXG4gICAgICBjYXRjaEVycm9yczogW11cbiAgICB9O1xuICAgIC8vIHRoaXMud3JhcEVycm9ycygpO1xuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyID0gbmV3IEV2ZW50TGlzdGVuZXJNYW5hZ2VyKCk7XG5cbiAgICAvL2lmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgfSxcbiAgYXV0b0VudGVyWFI6IHtcbiAgICByZXF1ZXN0ZWQ6IGZhbHNlLFxuICAgIHN1Y2Nlc3NmdWw6IGZhbHNlXG4gIH0sXG4gIFhSc2Vzc2lvbnM6IFtdLFxuICBpbmplY3RBdXRvRW50ZXJYUjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgdGhpcy5hdXRvRW50ZXJYUi5yZXF1ZXN0ZWQgPSB0cnVlO1xuXG4gICAgbGV0IHByZXZSZXF1ZXN0U2Vzc2lvbiA9IG5hdmlnYXRvci54ci5yZXF1ZXN0U2Vzc2lvbjtcbiAgICBXZWJYUkhvb2suZW5hYmxlKHtcbiAgICAgIG9uU2Vzc2lvblN0YXJ0ZWQ6IHNlc3Npb24gPT4ge1xuICAgICAgICBpZiAodGhpcy5YUnNlc3Npb25zLmluZGV4T2Yoc2Vzc2lvbikgPT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5YUnNlc3Npb25zLnB1c2goc2Vzc2lvbik7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1hSU2Vzc2lvbiBzdGFydGVkJywgc2Vzc2lvbik7XG4gICAgICAgICAgdGhpcy5YUnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmhvb2tSQUYoc2Vzc2lvbik7XG4gICAgICAgICAgLy8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICgpID0+IHt9O1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25TZXNzaW9uRW5kZWQ6IHNlc3Npb24gPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnWFJTZXNzaW9uIGVuZGVkJyk7XG4gICAgICB9XG4gICAgfSk7XG5cblxuXG4gICAgLypcbiAgICBpZiAoJ3hyJyBpbiBuYXZpZ2F0b3IpIHtcblx0XHRcdG5hdmlnYXRvci54ci5pc1Nlc3Npb25TdXBwb3J0ZWQoICdpbW1lcnNpdmUtdnInICkudGhlbihzdXBwb3J0ZWQgPT4ge1xuICAgICAgICBpZiAoc3VwcG9ydGVkKSB7XG5cdFx0XHRcdFx0dmFyIHNlc3Npb25Jbml0ID0geyBvcHRpb25hbEZlYXR1cmVzOiBbICdsb2NhbC1mbG9vcicsICdib3VuZGVkLWZsb29yJyBdIH07XG5cdFx0XHRcdFx0bmF2aWdhdG9yLnhyLnJlcXVlc3RTZXNzaW9uKCAnaW1tZXJzaXZlLXZyJywgc2Vzc2lvbkluaXQgKS50aGVuKCBzZXNzaW9uID0+IHtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJvY2Vzc0JlbmNobWFya1Jlc3VsdCh0aGlzLmdlbmVyYXRlRmFpbGVkQmVuY2htYXJrUmVzdWx0KCdhdXRvZW50ZXIteHIgZmFpbGVkJykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICovXG4vKlxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzKCkudGhlbihkaXNwbGF5cyA9PiB7XG4gICAgICAgICAgdmFyIGRldmljZSA9IGRpc3BsYXlzWzBdO1xuICAgICAgICAgIC8vaWYgKGRldmljZS5pc1ByZXNlbnRpbmcpIGRldmljZS5leGl0UHJlc2VudCgpO1xuICAgICAgICAgIGlmIChkZXZpY2UpIHtcbiAgICAgICAgICAgIGRldmljZS5yZXF1ZXN0UHJlc2VudCggWyB7IHNvdXJjZTogY2FudmFzIH0gXSApXG4gICAgICAgICAgICAgIC50aGVuKHggPT4geyBjb25zb2xlLmxvZygnYXV0b2VudGVyIFhSIHN1Y2Nlc3NmdWwnKTsgdGhpcy5hdXRvRW50ZXJYUi5zdWNjZXNzZnVsID0gdHJ1ZTsgfSlcbiAgICAgICAgICAgICAgLmNhdGNoKHggPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhdXRvZW50ZXIgWFIgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFuZGF0b3J5QXV0b0VudGVyWFIpIHtcbiAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0JlbmNobWFya1Jlc3VsdCh0aGlzLmdlbmVyYXRlRmFpbGVkQmVuY2htYXJrUmVzdWx0KCdhdXRvZW50ZXIteHIgZmFpbGVkJykpO1xuICAgICAgICAgICAgICAgICAgfSwxMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0sIDUwMCk7IC8vIEBmaXggdG8gbWFrZSBpdCB3b3JrIG9uIEZ4UlxuICAgIH0gZWxzZSBpZiAodGhpcy5tYW5kYXRvcnlBdXRvRW50ZXJYUikge1xuICAgICAgc2V0VGltZW91dCh4ID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzQmVuY2htYXJrUmVzdWx0KHRoaXMuZ2VuZXJhdGVGYWlsZWRCZW5jaG1hcmtSZXN1bHQoJ2F1dG9lbnRlci14ciBmYWlsZWQnKSk7XG4gICAgICB9LDEwMDApO1xuICAgIH1cbiAgICAqL1xuICB9LFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUub3JpZ2luID09PSAnd2ViZ2Z4dGVzdCcpIHJldHVybjtcblxuICAgIGNvbnN0IERFRkFVTFRfV0lEVEggPSA4MDA7XG4gICAgY29uc3QgREVGQVVMVF9IRUlHSFQgPSA2MDA7XG4gICAgdGhpcy5jYW52YXNXaWR0aCA9IERFRkFVTFRfV0lEVEg7XG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSBERUZBVUxUX0hFSUdIVDtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sna2VlcC13aW5kb3ctc2l6ZSddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5jYW52YXNXaWR0aCA9IHR5cGVvZiBwYXJhbWV0ZXJzWyd3aWR0aCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfV0lEVEggOiBwYXJzZUludChwYXJhbWV0ZXJzWyd3aWR0aCddKTtcbiAgICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pO1xuICAgICAgd2luZG93LmlubmVyV2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICB9XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoJ3Jlc2l6ZScsIHRydWUsIHRydWUpO1xuICAgIH1cbiAgICBlLm9yaWdpbiA9ICd3ZWJnZnh0ZXN0JztcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudCA/IHdpbmRvdy5kaXNwYXRjaEV2ZW50KGUpIDogd2luZG93LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICB9XG59O1xuXG5URVNURVIuaW5pdCgpO1xuXG52YXIgcGFnZUluaXRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuIl0sIm5hbWVzIjpbImVuYWJsZWQiLCJ0aGlzIiwiZGVmaW5lIiwicmVxdWlyZSQkMCIsInNyIiwiZGVjb2RlQ29tcG9uZW50IiwiREVGQVVMVF9PUFRJT05TIiwiS2V5c3Ryb2tlVmlzdWFsaXplciIsIlBlcmZTdGF0cyIsIlN0YXRzIiwiV2ViR0xTdGF0cyIsInBpeGVsbWF0Y2giLCJzZWVkcmFuZG9tIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztDQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEIsTUFBTSxRQUFRLENBQUM7Q0FDZixFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUU7Q0FDakIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEdBQUcsR0FBRztDQUNmLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sT0FBTyxHQUFHO0NBQ25CLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLGlCQUFpQixHQUFHO0NBQ3RCLElBQUksT0FBTyxDQUFDLENBQUM7Q0FDYixHQUFHOztDQUVILEVBQUUsWUFBWSxHQUFHO0NBQ2pCLElBQUksT0FBTyxFQUFFLENBQUM7Q0FDZCxHQUFHOztDQUVILEVBQUUsT0FBTyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUN6QixFQUFFLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDeEIs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Qzs7Q0FFL0IsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLFdBQVc7Q0FDdkIsSUFBSSxJQUFJLENBQUMsR0FBRyxPQUFPLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDO0NBQzVELElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ2xCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ2xCLElBQUksT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUN0QyxHQUFHLENBQUM7O0NBRUo7Q0FDQSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1gsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEIsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QixFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ2hDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtDQUNoQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RCLEVBQUUs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LEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzdELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNiLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3ZCLElBQUksT0FBTyxDQUFDLENBQUM7Q0FDYixHQUFHLENBQUM7O0NBRUosRUFBRSxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0NBQzFCLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxF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QUVBLENBQUMsU0FBUyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0NBQ3RCLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLE9BQU8sR0FBRyxFQUFFLENBQUM7O0NBRTlCO0NBQ0EsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLFdBQVc7Q0FDdkIsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNwQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdEMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdB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QUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1RCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDYixHQUFHOztDQUVIO0NBQ0EsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxLQUFLLEVBQUU7Q0FDMUI7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0NBQ2hCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsSUFBSSxPQUFPLEtBQUssRUFBRSxFQUFFO0NBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlFLEtBQUs7Q0FDTCxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsSUFBSSxPQUFPLENBQUMsQ0FBQztDQUNiO0NBQ0E7Q0FDQTtDQUNBLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNaLENBQUM7O0NBRUQ7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxTQUFTLElB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Q0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQztDQUN6RyxZQUFZLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUMzRyxDQUFDOztDQUVEO0NBQ0E7O0NBRUEsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtDQUM3QyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRztDQUM5QixRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7O0NBRTlCLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUNuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztDQUVuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0NBQ25DLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7Q0FFbkMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRWxELElBQUksSUFBSSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRXhCLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0NBQ2pELFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUVsRCxJQUFJLE9BQU8sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDM0QsQ0FBQzs7Q0FFRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFB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
