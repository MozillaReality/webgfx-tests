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
	'isRenderbuffer', 'isShader', 'isTexture', 'validateProgram', 'getShaderParameter'];
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
	  enable: function (options) {
	    if (enabled) {return;}

	    var self = this;
	    HTMLCanvasElement.prototype.getContext = function() {
	      var ctx = originalGetContext.apply(this, arguments);
	      if ((ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
	        self.webglContexts.push(ctx);
	        if (options.width && options.height) {
	          this.width = options.width;
	          this.height = options.height;
	          this.style.cssText = 'width: ' + options.width + 'px; height: ' + options.height + 'px';
	        }

	        if (options.fakeWebGL) {
	          ctx = new FakeWebGL(ctx);
	        }
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

	class PerfStats {
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

	//----------------------------------------------------------------------
	// TESTSTATS
	//----------------------------------------------------------------------
	function PerfStats$1 () {

	  var firstFrame = true;
	  var firstFps = true;

	  var currentFrameStartTime = 0;
	  var previousFrameEndTime;
	  var lastUpdateTime = null;

	  // Used to detect recursive entries to the main loop, which can happen in certain complex cases, e.g. if not using rAF to tick rendering to the canvas.
	  var insideMainLoopRecursionCounter = 0;

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
	      fps: new PerfStats(),
	      dt: new PerfStats(),
	      cpu: new PerfStats()        
	    },

	    numFrames: 0,
	    log: false,
	    totalTimeInMainLoop: 0,
	    totalTimeOutsideMainLoop: 0,
	    fpsCounterUpdateInterval: 200, // msecs

	    frameStart: function() {
	      insideMainLoopRecursionCounter++;
	      if (insideMainLoopRecursionCounter == 1) 
	      {
	        if (lastUpdateTime === null) {
	          lastUpdateTime = performance.realNow();
	        }

	        currentFrameStartTime = performance.realNow();
	        this.updateStats();
	      }
	    },

	    updateStats: function() {
	      var timeNow = performance.realNow();

	      this.numFrames++;

	      if (timeNow - lastUpdateTime > this.fpsCounterUpdateInterval)
	      {
	        var fps = this.numFrames * 1000 / (timeNow - lastUpdateTime);
	        this.numFrames = 0;
	        lastUpdateTime = timeNow;

	        if (firstFps)
	        {
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
	      insideMainLoopRecursionCounter--;
	      if (insideMainLoopRecursionCounter != 0) return;

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
	    drawCalls: new PerfStats(),
	    useProgramCalls: new PerfStats(),
	    faces: new PerfStats(),
	    vertices: new PerfStats(),
	    bindTextures: new PerfStats()
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
	  
	  function setupExtensions(context) {
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
	  ready: false,
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

	  preTick: function() {

	    if (GFXTESTS_CONFIG.preMainLoop) {
	      GFXTESTS_CONFIG.preMainLoop();
	    }

	    WebGLStats$1.frameStart();
	    this.stats.frameStart();

	    if (!this.canvas) {
	      if (typeof parameters['no-rendering'] !== 'undefined') {
	        this.ready = true;
	      } else {
	        // We assume the last webgl context being initialized is the one used to rendering
	        // If that's different, the test should have a custom code to return that canvas
	        if (CanvasHook.webglContexts.length > 0) {
	          var context = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1];
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

	    if (this.referenceTestFrameNumber === 0) {
	      if ('autoenter-xr' in parameters) {
	        this.injectAutoEnterXR(this.canvas);
	      }
	    }

	    // referenceTestT0 = performance.realNow();
	    if (this.pageLoadTime === null) this.pageLoadTime = performance.realNow() - pageInitTime;

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    if (this.previousEventHandlerExitedTime != -1) {
	      this.accumulatedCpuIdleTime += performance.realNow() - this.previousEventHandlerExitedTime;
	      this.previousEventHandlerExitedTime = -1;
	    }
	  },

	  postTick: function () {

	    if (!this.ready) {return;}
	    this.stats.frameEnd();

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
	    if (this.inputRecorder) {
	      this.addInputDownloadButton();
	    }

	    this.injectBenchmarkFinishedHTML();

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
	  requestAnimationFrame: function (callback) {
	    const hookedCallback = p => {
	      // Push the callback to the list of currently running RAFs
	      if (this.RAFs.indexOf(callback) === -1) {
	        this.RAFs.push(callback);
	      }

	      // If the current callback is the first on the list, we assume the frame just started
	      if (this.RAFs[0] === callback) {
	        this.preTick();
	      }

	      callback(performance.now());

	      // If reaching the last RAF, execute all the post code
	      if (this.RAFs[ this.RAFs.length - 1 ] === callback) {

	        // @todo Move all this logic to a function to clean up this one
	        this.postTick();

	        if (this.referenceTestFrameNumber === this.numFramesToRender) {
	          this.releaseRAF();
	          this.benchmarkFinished();
	          return;
	        }

	        if (GFXTESTS_CONFIG.postMainLoop) {
	          GFXTESTS_CONFIG.postMainLoop();
	        }
	      }

	      // If the previous RAF is the same as now, just reset the list
	      // in case we have stopped calling some of the previous RAFs
	      if (this.prevRAFReference === callback && (this.RAFs[0] !== callback || this.RAFs.length > 1)) {
	        this.RAFs = [callback];
	      }
	      this.prevRAFReference = callback;
	    };
	    return this.currentRAFContext.realRequestAnimationFrame(hookedCallback);
	  },
	  currentRAFContext: window,
	  releaseRAF: function () {
	    this.currentRAFContext.requestAnimationFrame = () => {};
	    if ('VRDisplay' in window &&
	      this.currentRAFContext instanceof VRDisplay &&
	      this.currentRAFContext.isPresenting) {
	      this.currentRAFContext.exitPresent();
	    }
	  },
	  hookRAF: function (context) {
	    console.log('Hooking', context);
	    if (!context.realRequestAnimationFrame) {
	      context.realRequestAnimationFrame = context.requestAnimationFrame;
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

	    this.stats = new PerfStats$1();

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
	  injectAutoEnterXR: function(canvas) {
	    this.autoEnterXR.requested = true;
	    if (navigator.getVRDisplays) {
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
	        });
	      }, 500); // @fix to make it work on FxR
	    } else if (this.mandatoryAutoEnterXR) {
	      setTimeout(x => {
	        this.processBenchmarkResult(this.generateFailedBenchmarkResult('autoenter-xr failed'));
	      },1000);
	    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jYW52YXMtaG9vay9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbmNyZW1lbnRhbC1zdGF0cy1saXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLXN0YXRzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL2FsZWEuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yMTI4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcndvdy5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3JzaGlmdDcuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yNDA5Ni5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi90eWNoZWkuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9zZWVkcmFuZG9tLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc3BsaXQtb24tZmlyc3QvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lucHV0LWV2ZW50cy1yZWNvcmRlci9zcmMvcmVjb3JkZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZXBsYXllci5qcyIsIi4uL3NyYy9jbGllbnQvZXZlbnQtbGlzdGVuZXJzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2tleXN0cm9rZS12aXN1YWxpemVyL3NyYy9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5wdXQtaGVscGVycy5qcyIsIi4uL3NyYy9jbGllbnQvd2ViYXVkaW8taG9vay5qcyIsIi4uL3NyYy9jbGllbnQvd2VidnItaG9vay5qcyIsIi4uL3NyYy9jbGllbnQvaW1hZ2UtdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcGl4ZWxtYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJnbC1zdGF0cy9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUmVhbERhdGUgPSBEYXRlO1xuXG5jbGFzcyBNb2NrRGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLnQgPSB0O1xuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBzdGF0aWMgcmVhbE5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lem9uZU9mZnNldCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHRvVGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXREYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXREYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldEZ1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0U2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VGltZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0WWVhcigpIHsgcmV0dXJuIDA7IH1cblxuICBzdGF0aWMgVVRDKCkgeyByZXR1cm4gMDsgfVxuXG4gIGdldFVUQ0RhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0RheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0hvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuXG4gIHNldERhdGUoKSB7fVxuICBzZXRGdWxsWWVhcigpIHt9XG4gIHNldEhvdXJzKCkge31cbiAgc2V0TWlsbGlzZWNvbmRzKCkge31cbiAgc2V0TWludXRlcygpIHt9XG4gIHNldE1vbnRoKCkge31cbiAgc2V0U2Vjb25kcygpIHt9XG4gIHNldFRpbWUoKSB7fVxuXG4gIHNldFVUQ0RhdGUoKSB7fVxuICBzZXRVVENGdWxsWWVhcigpIHt9XG4gIHNldFVUQ0hvdXJzKCkge31cbiAgc2V0VVRDTWlsbGlzZWNvbmRzKCkge31cbiAgc2V0VVRDTWludXRlcygpIHt9XG4gIHNldFVUQ01vbnRoKCkge31cblxuICBzZXRZZWFyKCkge31cbn1cblxudmFyIHJlYWxQZXJmb3JtYW5jZTtcblxuaWYgKCFwZXJmb3JtYW5jZS5yZWFsTm93KSB7XG4gIHZhciBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc1NhZmFyaSkge1xuICAgIHJlYWxQZXJmb3JtYW5jZSA9IHBlcmZvcm1hbmNlO1xuICAgIHBlcmZvcm1hbmNlID0ge1xuICAgICAgcmVhbE5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH0sXG4gICAgICBub3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtYW5jZS5yZWFsTm93ID0gcGVyZm9ybWFuY2Uubm93O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGltZVNjYWxlOiAxLjAsXG4gIGZha2VkVGltZTogMCxcbiAgZW5hYmxlZDogZmFsc2UsXG4gIHJlZnJlc2hSYXRlOiA2MCxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMubmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyKSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VsZi5mYWtlZFRpbWUgKiAxMDAwLjAgKiBzZWxmLnRpbWVTY2FsZSAvIHNlbGYucmVmcmVzaFJhdGU7IH1cbiAgICB9XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuXG4gICAgRGF0ZSA9IFJlYWxEYXRlO1xuICAgIHBlcmZvcm1hbmNlLm5vdyA9IHJlYWxQZXJmb3JtYW5jZS5ub3c7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufSIsImNvbnN0IG9yaWdpbmFsID0gWydnZXRQYXJhbWV0ZXInLCAnZ2V0RXh0ZW5zaW9uJywgJ2dldFNoYWRlclByZWNpc2lvbkZvcm1hdCddO1xuY29uc3QgZW1wdHlTdHJpbmcgPSBbJ2dldFNoYWRlckluZm9Mb2cnLCAnZ2V0UHJvZ3JhbUluZm9Mb2cnXTtcbmNvbnN0IHJldHVybjEgPSBbJ2lzQnVmZmVyJywgJ2lzRW5hYmxlZCcsICdpc0ZyYW1lYnVmZmVyJywgJ2lzUHJvZ3JhbScsICdpc1F1ZXJ5JywgJ2lzVmVydGV4QXJyYXknLCAnaXNTYW1wbGVyJywgJ2lzU3luYycsICdpc1RyYW5zZm9ybUZlZWRiYWNrJyxcbidpc1JlbmRlcmJ1ZmZlcicsICdpc1NoYWRlcicsICdpc1RleHR1cmUnLCAndmFsaWRhdGVQcm9ncmFtJywgJ2dldFNoYWRlclBhcmFtZXRlciddO1xuY29uc3QgcmV0dXJuMCA9IFsnaXNDb250ZXh0TG9zdCcsICdmaW5pc2gnLCAnZmx1c2gnLCAnZ2V0RXJyb3InLCAnZW5kVHJhbnNmb3JtRmVlZGJhY2snLCAncGF1c2VUcmFuc2Zvcm1GZWVkYmFjaycsICdyZXN1bWVUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYWN0aXZlVGV4dHVyZScsICdibGVuZEVxdWF0aW9uJywgJ2NsZWFyJywgJ2NsZWFyRGVwdGgnLCAnY2xlYXJTdGVuY2lsJywgJ2NvbXBpbGVTaGFkZXInLCAnY3VsbEZhY2UnLCAnZGVsZXRlQnVmZmVyJyxcbidkZWxldGVGcmFtZWJ1ZmZlcicsICdkZWxldGVQcm9ncmFtJywgJ2RlbGV0ZVJlbmRlcmJ1ZmZlcicsICdkZWxldGVTaGFkZXInLCAnZGVsZXRlVGV4dHVyZScsICdkZXB0aEZ1bmMnLCAnZGVwdGhNYXNrJywgJ2Rpc2FibGUnLCAnZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5JyxcbidlbmFibGUnLCAnZW5hYmxlVmVydGV4QXR0cmliQXJyYXknLCAnZnJvbnRGYWNlJywgJ2dlbmVyYXRlTWlwbWFwJywgJ2xpbmVXaWR0aCcsICdsaW5rUHJvZ3JhbScsICdzdGVuY2lsTWFzaycsICd1c2VQcm9ncmFtJywgJ2RlbGV0ZVF1ZXJ5JywgJ2RlbGV0ZVZlcnRleEFycmF5JyxcbidiaW5kVmVydGV4QXJyYXknLCAnZHJhd0J1ZmZlcnMnLCAncmVhZEJ1ZmZlcicsICdlbmRRdWVyeScsICdkZWxldGVTYW1wbGVyJywgJ2RlbGV0ZVN5bmMnLCAnZGVsZXRlVHJhbnNmb3JtRmVlZGJhY2snLCAnYmVnaW5UcmFuc2Zvcm1GZWVkYmFjaycsXG4nYXR0YWNoU2hhZGVyJywgJ2JpbmRCdWZmZXInLCAnYmluZEZyYW1lYnVmZmVyJywgJ2JpbmRSZW5kZXJidWZmZXInLCAnYmluZFRleHR1cmUnLCAnYmxlbmRFcXVhdGlvblNlcGFyYXRlJywgJ2JsZW5kRnVuYycsICdkZXB0aFJhbmdlJywgJ2RldGFjaFNoYWRlcicsICdoaW50JyxcbidwaXhlbFN0b3JlaScsICdwb2x5Z29uT2Zmc2V0JywgJ3NhbXBsZUNvdmVyYWdlJywgJ3NoYWRlclNvdXJjZScsICdzdGVuY2lsTWFza1NlcGFyYXRlJywgJ3VuaWZvcm0xZicsICd1bmlmb3JtMWZ2JywgJ3VuaWZvcm0xaScsICd1bmlmb3JtMWl2Jyxcbid1bmlmb3JtMmZ2JywgJ3VuaWZvcm0yaXYnLCAndW5pZm9ybTNmdicsICd1bmlmb3JtM2l2JywgJ3VuaWZvcm00ZnYnLCAndW5pZm9ybTRpdicsICd2ZXJ0ZXhBdHRyaWIxZicsICd2ZXJ0ZXhBdHRyaWIxZnYnLCAndmVydGV4QXR0cmliMmZ2JywgJ3ZlcnRleEF0dHJpYjNmdicsXG4ndmVydGV4QXR0cmliNGZ2JywgJ3ZlcnRleEF0dHJpYkRpdmlzb3InLCAnYmVnaW5RdWVyeScsICdpbnZhbGlkYXRlRnJhbWVidWZmZXInLCAndW5pZm9ybTF1aScsICd1bmlmb3JtMXVpdicsICd1bmlmb3JtMnVpdicsICd1bmlmb3JtM3VpdicsICd1bmlmb3JtNHVpdicsXG4ndmVydGV4QXR0cmliSTRpdicsICd2ZXJ0ZXhBdHRyaWJJNHVpdicsICdiaW5kU2FtcGxlcicsICdmZW5jZVN5bmMnLCAnYmluZFRyYW5zZm9ybUZlZWRiYWNrJyxcbidiaW5kQXR0cmliTG9jYXRpb24nLCAnYnVmZmVyRGF0YScsICdidWZmZXJTdWJEYXRhJywgJ2RyYXdBcnJheXMnLCAnc3RlbmNpbEZ1bmMnLCAnc3RlbmNpbE9wJywgJ3RleFBhcmFtZXRlcmYnLCAndGV4UGFyYW1ldGVyaScsICd1bmlmb3JtMmYnLCAndW5pZm9ybTJpJyxcbid1bmlmb3JtTWF0cml4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzZnYnLCAndW5pZm9ybU1hdHJpeDRmdicsICd2ZXJ0ZXhBdHRyaWIyZicsICd1bmlmb3JtMnVpJywgJ3VuaWZvcm1NYXRyaXgyeDNmdicsICd1bmlmb3JtTWF0cml4M3gyZnYnLFxuJ3VuaWZvcm1NYXRyaXgyeDRmdicsICd1bmlmb3JtTWF0cml4NHgyZnYnLCAndW5pZm9ybU1hdHJpeDN4NGZ2JywgJ3VuaWZvcm1NYXRyaXg0eDNmdicsICdjbGVhckJ1ZmZlcml2JywgJ2NsZWFyQnVmZmVydWl2JywgJ2NsZWFyQnVmZmVyZnYnLCAnc2FtcGxlclBhcmFtZXRlcmknLFxuJ3NhbXBsZXJQYXJhbWV0ZXJmJywgJ2NsaWVudFdhaXRTeW5jJywgJ3dhaXRTeW5jJywgJ3RyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ3MnLCAnYmluZEJ1ZmZlckJhc2UnLCAndW5pZm9ybUJsb2NrQmluZGluZycsXG4nYmxlbmRDb2xvcicsICdibGVuZEZ1bmNTZXBhcmF0ZScsICdjbGVhckNvbG9yJywgJ2NvbG9yTWFzaycsICdkcmF3RWxlbWVudHMnLCAnZnJhbWVidWZmZXJSZW5kZXJidWZmZXInLCAncmVuZGVyYnVmZmVyU3RvcmFnZScsICdzY2lzc29yJywgJ3N0ZW5jaWxGdW5jU2VwYXJhdGUnLFxuJ3N0ZW5jaWxPcFNlcGFyYXRlJywgJ3VuaWZvcm0zZicsICd1bmlmb3JtM2knLCAndmVydGV4QXR0cmliM2YnLCAndmlld3BvcnQnLCAnZHJhd0FycmF5c0luc3RhbmNlZCcsICd1bmlmb3JtM3VpJywgJ2NsZWFyQnVmZmVyZmknLFxuJ2ZyYW1lYnVmZmVyVGV4dHVyZTJEJywgJ3VuaWZvcm00ZicsICd1bmlmb3JtNGknLCAndmVydGV4QXR0cmliNGYnLCAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkJywgJ2NvcHlCdWZmZXJTdWJEYXRhJywgJ2ZyYW1lYnVmZmVyVGV4dHVyZUxheWVyJyxcbidyZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUnLCAndGV4U3RvcmFnZTJEJywgJ3VuaWZvcm00dWknLCAndmVydGV4QXR0cmliSTRpJywgJ3ZlcnRleEF0dHJpYkk0dWknLCAndmVydGV4QXR0cmliSVBvaW50ZXInLCAnYmluZEJ1ZmZlclJhbmdlJyxcbid0ZXhJbWFnZTJEJywgJ3ZlcnRleEF0dHJpYlBvaW50ZXInLCAnaW52YWxpZGF0ZVN1YkZyYW1lYnVmZmVyJywgJ3RleFN0b3JhZ2UzRCcsICdkcmF3UmFuZ2VFbGVtZW50cycsXG4nY29tcHJlc3NlZFRleEltYWdlMkQnLCAncmVhZFBpeGVscycsICd0ZXhTdWJJbWFnZTJEJywgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTJEJywgJ2NvcHlUZXhJbWFnZTJEJywgJ2NvcHlUZXhTdWJJbWFnZTJEJywgJ2NvbXByZXNzZWRUZXhJbWFnZTNEJyxcbidjb3B5VGV4U3ViSW1hZ2UzRCcsICdibGl0RnJhbWVidWZmZXInLCAndGV4SW1hZ2UzRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UzRCcsICd0ZXhTdWJJbWFnZTNEJ107XG5jb25zdCBudWxscyA9IFtdO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGYWtlV2ViR0woZ2wpIHtcblx0dGhpcy5nbCA9IGdsO1xuXHRmb3IgKHZhciBrZXkgaW4gZ2wpIHtcblx0XHRpZiAodHlwZW9mIGdsW2tleV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGlmIChvcmlnaW5hbC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV0uYmluZChnbCk7XG5cdFx0XHR9IGVsc2UgaWYgKG51bGxzLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gbnVsbDt9O1xuXHRcdFx0fSBlbHNlIGlmIChyZXR1cm4wLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gMDt9O1xuXHRcdFx0fSBlbHNlIGlmIChyZXR1cm4xLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gMTt9O1xuXHRcdFx0fSBlbHNlIGlmIChlbXB0eVN0cmluZy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuICcnO307XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB0aGlzW2tleV0gPSBmdW5jdGlvbigpe307XG5cdFx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV0uYmluZChnbCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV07XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgRmFrZVdlYkdMIGZyb20gJy4vZmFrZS13ZWJnbCc7XG5cbnZhciBvcmlnaW5hbEdldENvbnRleHQgPSBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dDtcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcpIHtcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdyA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbn1cblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICB3ZWJnbENvbnRleHRzOiBbXSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmIChlbmFibGVkKSB7cmV0dXJuO31cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN0eCA9IG9yaWdpbmFsR2V0Q29udGV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChjdHggaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHx8ICh3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAmJiAoY3R4IGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkpKSB7XG4gICAgICAgIHNlbGYud2ViZ2xDb250ZXh0cy5wdXNoKGN0eCk7XG4gICAgICAgIGlmIChvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICAgICAgICB0aGlzLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6ICcgKyBvcHRpb25zLndpZHRoICsgJ3B4OyBoZWlnaHQ6ICcgKyBvcHRpb25zLmhlaWdodCArICdweCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5mYWtlV2ViR0wpIHtcbiAgICAgICAgICBjdHggPSBuZXcgRmFrZVdlYkdMKGN0eCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjdHg7ICAgIFxuICAgIH1cbiAgICBlbmFibGVkID0gdHJ1ZTsgIFxuICB9LFxuXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHtyZXR1cm47fVxuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyZlN0YXRzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5uID0gMDtcbiAgICB0aGlzLm1pbiA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5tYXggPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLnN1bSA9IDA7XG4gICAgdGhpcy5tZWFuID0gMDtcbiAgICB0aGlzLnEgPSAwO1xuICB9XG5cbiAgZ2V0IHZhcmlhbmNlKCkge1xuICAgIHJldHVybiB0aGlzLnEgLyB0aGlzLm47XG4gIH1cblxuICBnZXQgc3RhbmRhcmRfZGV2aWF0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5xIC8gdGhpcy5uKTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtKSkge1xuICAgICAgLy8gU29ycnksIG5vIE5hTnNcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5uKys7XG4gICAgdGhpcy5taW4gPSBNYXRoLm1pbih0aGlzLm1pbiwgbnVtKTtcbiAgICB0aGlzLm1heCA9IE1hdGgubWF4KHRoaXMubWF4LCBudW0pO1xuICAgIHRoaXMuc3VtICs9IG51bTtcbiAgICBjb25zdCBwcmV2TWVhbiA9IHRoaXMubWVhbjtcbiAgICB0aGlzLm1lYW4gPSB0aGlzLm1lYW4gKyAobnVtIC0gdGhpcy5tZWFuKSAvIHRoaXMubjtcbiAgICB0aGlzLnEgPSB0aGlzLnEgKyAobnVtIC0gcHJldk1lYW4pICogKG51bSAtIHRoaXMubWVhbik7XG4gIH1cblxuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG46IHRoaXMubixcbiAgICAgIG1pbjogdGhpcy5taW4sXG4gICAgICBtYXg6IHRoaXMubWF4LFxuICAgICAgc3VtOiB0aGlzLnN1bSxcbiAgICAgIG1lYW46IHRoaXMubWVhbixcbiAgICAgIHZhcmlhbmNlOiB0aGlzLnZhcmlhbmNlLFxuICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YW5kYXJkX2RldmlhdGlvblxuICAgIH07XG4gIH0gIFxufVxuIiwiaW1wb3J0IFN0YXRzIGZyb20gJ2luY3JlbWVudGFsLXN0YXRzLWxpdGUnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRFU1RTVEFUU1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGZpcnN0RnJhbWUgPSB0cnVlO1xuICB2YXIgZmlyc3RGcHMgPSB0cnVlO1xuXG4gIHZhciBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSAwO1xuICB2YXIgcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gIHZhciBsYXN0VXBkYXRlVGltZSA9IG51bGw7XG5cbiAgLy8gVXNlZCB0byBkZXRlY3QgcmVjdXJzaXZlIGVudHJpZXMgdG8gdGhlIG1haW4gbG9vcCwgd2hpY2ggY2FuIGhhcHBlbiBpbiBjZXJ0YWluIGNvbXBsZXggY2FzZXMsIGUuZy4gaWYgbm90IHVzaW5nIHJBRiB0byB0aWNrIHJlbmRlcmluZyB0byB0aGUgY2FudmFzLlxuICB2YXIgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID0gMDtcblxuICByZXR1cm4ge1xuICAgIGdldFN0YXRzU3VtbWFyeTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgT2JqZWN0LmtleXModGhpcy5zdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICByZXN1bHRba2V5XSA9IHtcbiAgICAgICAgICBtaW46IHRoaXMuc3RhdHNba2V5XS5taW4sXG4gICAgICAgICAgbWF4OiB0aGlzLnN0YXRzW2tleV0ubWF4LFxuICAgICAgICAgIGF2ZzogdGhpcy5zdGF0c1trZXldLm1lYW4sXG4gICAgICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgc3RhdHM6IHtcbiAgICAgIGZwczogbmV3IFN0YXRzKCksXG4gICAgICBkdDogbmV3IFN0YXRzKCksXG4gICAgICBjcHU6IG5ldyBTdGF0cygpICAgICAgICBcbiAgICB9LFxuXG4gICAgbnVtRnJhbWVzOiAwLFxuICAgIGxvZzogZmFsc2UsXG4gICAgdG90YWxUaW1lSW5NYWluTG9vcDogMCxcbiAgICB0b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3A6IDAsXG4gICAgZnBzQ291bnRlclVwZGF0ZUludGVydmFsOiAyMDAsIC8vIG1zZWNzXG5cbiAgICBmcmFtZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlcisrO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9PSAxKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKGxhc3RVcGRhdGVUaW1lID09PSBudWxsKSB7XG4gICAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlU3RhdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICAgIHRoaXMubnVtRnJhbWVzKys7XG5cbiAgICAgIGlmICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUgPiB0aGlzLmZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbClcbiAgICAgIHtcbiAgICAgICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzICogMTAwMCAvICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgICB0aGlzLm51bUZyYW1lcyA9IDA7XG4gICAgICAgIGxhc3RVcGRhdGVUaW1lID0gdGltZU5vdztcblxuICAgICAgICBpZiAoZmlyc3RGcHMpXG4gICAgICAgIHtcbiAgICAgICAgICBmaXJzdEZwcyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdHMuZnBzLnVwZGF0ZShmcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxvZykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBmcHMgLSBtaW46ICR7dGhpcy5zdGF0cy5mcHMubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZnBzLm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5mcHMubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZnBzLnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBtcyAgLSBtaW46ICR7dGhpcy5zdGF0cy5kdC5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5kdC5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZHQubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZHQuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYGNwdSAtIG1pbjogJHt0aGlzLnN0YXRzLmNwdS5taW4udG9GaXhlZCgyKX0lIC8gYXZnOiAke3RoaXMuc3RhdHMuY3B1Lm1lYW4udG9GaXhlZCgyKX0lIC8gbWF4OiAke3RoaXMuc3RhdHMuY3B1Lm1heC50b0ZpeGVkKDIpfSUgLSBzdGQ6ICR7dGhpcy5zdGF0cy5jcHUuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9JWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBpbiB0aGUgZW5kIG9mIGVhY2ggbWFpbiBsb29wIGZyYW1lIHRpY2suXG4gICAgZnJhbWVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyLS07XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyICE9IDApIHJldHVybjtcblxuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICB2YXIgY3B1TWFpbkxvb3BEdXJhdGlvbiA9IHRpbWVOb3cgLSBjdXJyZW50RnJhbWVTdGFydFRpbWU7XG4gICAgICB2YXIgZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzID0gdGltZU5vdyAtIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICAgICAgcHJldmlvdXNGcmFtZUVuZFRpbWUgPSB0aW1lTm93O1xuICBcbiAgICAgIGlmIChmaXJzdEZyYW1lKSB7XG4gICAgICAgIGZpcnN0RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRvdGFsVGltZUluTWFpbkxvb3AgKz0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcbiAgICAgIHRoaXMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICs9IGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyAtIGNwdU1haW5Mb29wRHVyYXRpb247XG5cbiAgICAgIHZhciBjcHUgPSBjcHVNYWluTG9vcER1cmF0aW9uICogMTAwIC8gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzO1xuICAgICAgdGhpcy5zdGF0cy5jcHUudXBkYXRlKGNwdSk7XG4gICAgICB0aGlzLnN0YXRzLmR0LnVwZGF0ZShkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMpO1xuICAgIH1cbiAgfVxufTsiLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy8gXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vLyBcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gQWxlYShzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIG1hc2ggPSBNYXNoKCk7XG5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gMjA5MTYzOSAqIG1lLnMwICsgbWUuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgbWUuczAgPSBtZS5zMTtcbiAgICBtZS5zMSA9IG1lLnMyO1xuICAgIHJldHVybiBtZS5zMiA9IHQgLSAobWUuYyA9IHQgfCAwKTtcbiAgfTtcblxuICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gIG1lLmMgPSAxO1xuICBtZS5zMCA9IG1hc2goJyAnKTtcbiAgbWUuczEgPSBtYXNoKCcgJyk7XG4gIG1lLnMyID0gbWFzaCgnICcpO1xuICBtZS5zMCAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczAgPCAwKSB7IG1lLnMwICs9IDE7IH1cbiAgbWUuczEgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMxIDwgMCkgeyBtZS5zMSArPSAxOyB9XG4gIG1lLnMyIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMiA8IDApIHsgbWUuczIgKz0gMTsgfVxuICBtYXNoID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYyA9IGYuYztcbiAgdC5zMCA9IGYuczA7XG4gIHQuczEgPSBmLnMxO1xuICB0LnMyID0gZi5zMjtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgQWxlYShzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IHhnLm5leHQ7XG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgKiAweDEwMDAwMDAwMCkgfCAwOyB9XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBybmcoKSArIChwcm5nKCkgKiAweDIwMDAwMCB8IDApICogMS4xMTAyMjMwMjQ2MjUxNTY1ZS0xNjsgLy8gMl4tNTNcbiAgfTtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmZ1bmN0aW9uIE1hc2goKSB7XG4gIHZhciBuID0gMHhlZmM4MjQ5ZDtcblxuICB2YXIgbWFzaCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9O1xuXG4gIHJldHVybiBtYXNoO1xufVxuXG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMuYWxlYSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yMTI4XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IG1lLnggXiAobWUueCA8PCAxMSk7XG4gICAgbWUueCA9IG1lLnk7XG4gICAgbWUueSA9IG1lLno7XG4gICAgbWUueiA9IG1lLnc7XG4gICAgcmV0dXJuIG1lLncgXj0gKG1lLncgPj4+IDE5KSBeIHQgXiAodCA+Pj4gOCk7XG4gIH07XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3IxMjggPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcndvd1wiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAobWUueCBeIChtZS54ID4+PiAyKSk7XG4gICAgbWUueCA9IG1lLnk7IG1lLnkgPSBtZS56OyBtZS56ID0gbWUudzsgbWUudyA9IG1lLnY7XG4gICAgcmV0dXJuIChtZS5kID0gKG1lLmQgKyAzNjI0MzcgfCAwKSkgK1xuICAgICAgIChtZS52ID0gKG1lLnYgXiAobWUudiA8PCA0KSkgXiAodCBeICh0IDw8IDEpKSkgfCAwO1xuICB9O1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuICBtZS52ID0gMDtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgaWYgKGsgPT0gc3Ryc2VlZC5sZW5ndGgpIHtcbiAgICAgIG1lLmQgPSBtZS54IDw8IDEwIF4gbWUueCA+Pj4gNDtcbiAgICB9XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHQudiA9IGYudjtcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3J3b3cgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcnNoaWZ0N1wiIGFsZ29yaXRobSBieVxuLy8gRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXI6XG4vLyBcIk9uIHRoZSBYb3Jnc2hpZnQgUmFuZG9tIE51bWJlciBHZW5lcmF0b3JzXCJcbi8vIGh0dHA6Ly9zYWx1Yy5lbmdyLnVjb25uLmVkdS9yZWZzL2NyeXB0by9ybmcvcGFubmV0b24wNW9udGhleG9yc2hpZnQucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHZhciBYID0gbWUueCwgaSA9IG1lLmksIHQsIHYsIHc7XG4gICAgdCA9IFhbaV07IHQgXj0gKHQgPj4+IDcpOyB2ID0gdCBeICh0IDw8IDI0KTtcbiAgICB0ID0gWFsoaSArIDEpICYgN107IHYgXj0gdCBeICh0ID4+PiAxMCk7XG4gICAgdCA9IFhbKGkgKyAzKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMyk7XG4gICAgdCA9IFhbKGkgKyA0KSAmIDddOyB2IF49IHQgXiAodCA8PCA3KTtcbiAgICB0ID0gWFsoaSArIDcpICYgN107IHQgPSB0IF4gKHQgPDwgMTMpOyB2IF49IHQgXiAodCA8PCA5KTtcbiAgICBYW2ldID0gdjtcbiAgICBtZS5pID0gKGkgKyAxKSAmIDc7XG4gICAgcmV0dXJuIHY7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciBqLCB3LCBYID0gW107XG5cbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxuICAgICAgdyA9IFhbMF0gPSBzZWVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIHVzaW5nIGEgc3RyaW5nLlxuICAgICAgc2VlZCA9ICcnICsgc2VlZDtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIFhbaiAmIDddID0gKFhbaiAmIDddIDw8IDE1KSBeXG4gICAgICAgICAgICAoc2VlZC5jaGFyQ29kZUF0KGopICsgWFsoaiArIDEpICYgN10gPDwgMTMpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBFbmZvcmNlIGFuIGFycmF5IGxlbmd0aCBvZiA4LCBub3QgYWxsIHplcm9lcy5cbiAgICB3aGlsZSAoWC5sZW5ndGggPCA4KSBYLnB1c2goMCk7XG4gICAgZm9yIChqID0gMDsgaiA8IDggJiYgWFtqXSA9PT0gMDsgKytqKTtcbiAgICBpZiAoaiA9PSA4KSB3ID0gWFs3XSA9IC0xOyBlbHNlIHcgPSBYW2pdO1xuXG4gICAgbWUueCA9IFg7XG4gICAgbWUuaSA9IDA7XG5cbiAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cbiAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcbiAgICAgIG1lLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueC5zbGljZSgpO1xuICB0LmkgPSBmLmk7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS54KSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yc2hpZnQ3ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgUmljaGFyZCBCcmVudCdzIFhvcmdlbnMgeG9yNDA5NiBhbGdvcml0aG0uXG4vL1xuLy8gVGhpcyBmYXN0IG5vbi1jcnlwdG9ncmFwaGljIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIGlzIGRlc2lnbmVkIGZvclxuLy8gdXNlIGluIE1vbnRlLUNhcmxvIGFsZ29yaXRobXMuIEl0IGNvbWJpbmVzIGEgbG9uZy1wZXJpb2QgeG9yc2hpZnRcbi8vIGdlbmVyYXRvciB3aXRoIGEgV2V5bCBnZW5lcmF0b3IsIGFuZCBpdCBwYXNzZXMgYWxsIGNvbW1vbiBiYXR0ZXJpZXNcbi8vIG9mIHN0YXN0aWNpYWwgdGVzdHMgZm9yIHJhbmRvbW5lc3Mgd2hpbGUgY29uc3VtaW5nIG9ubHkgYSBmZXcgbmFub3NlY29uZHNcbi8vIGZvciBlYWNoIHBybmcgZ2VuZXJhdGVkLiAgRm9yIGJhY2tncm91bmQgb24gdGhlIGdlbmVyYXRvciwgc2VlIEJyZW50J3Ncbi8vIHBhcGVyOiBcIlNvbWUgbG9uZy1wZXJpb2QgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzIHVzaW5nIHNoaWZ0cyBhbmQgeG9ycy5cIlxuLy8gaHR0cDovL2FyeGl2Lm9yZy9wZGYvMTAwNC4zMTE1djEucGRmXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHhvcjQwOTYgPSByZXF1aXJlKCd4b3I0MDk2Jyk7XG4vLyByYW5kb20gPSB4b3I0MDk2KDEpOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZWQgd2l0aCBpbnQzMiBvciBzdHJpbmcuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tKCksIDAuMTUyMDQzNjQ1MDUzODU0Nyk7IC8vICgwLCAxKSByYW5nZSwgNTMgYml0cy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20uaW50MzIoKSwgMTgwNjUzNDg5Nyk7ICAgLy8gc2lnbmVkIGludDMyLCAzMiBiaXRzLlxuLy9cbi8vIEZvciBub256ZXJvIG51bWVyaWMga2V5cywgdGhpcyBpbXBlbGVtZW50YXRpb24gcHJvdmlkZXMgYSBzZXF1ZW5jZVxuLy8gaWRlbnRpY2FsIHRvIHRoYXQgYnkgQnJlbnQncyB4b3JnZW5zIDMgaW1wbGVtZW50YWlvbiBpbiBDLiAgVGhpc1xuLy8gaW1wbGVtZW50YXRpb24gYWxzbyBwcm92aWRlcyBmb3IgaW5pdGFsaXppbmcgdGhlIGdlbmVyYXRvciB3aXRoXG4vLyBzdHJpbmcgc2VlZHMsIG9yIGZvciBzYXZpbmcgYW5kIHJlc3RvcmluZyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvci5cbi8vXG4vLyBPbiBDaHJvbWUsIHRoaXMgcHJuZyBiZW5jaG1hcmtzIGFib3V0IDIuMSB0aW1lcyBzbG93ZXIgdGhhblxuLy8gSmF2YXNjcmlwdCdzIGJ1aWx0LWluIE1hdGgucmFuZG9tKCkuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3ID0gbWUudyxcbiAgICAgICAgWCA9IG1lLlgsIGkgPSBtZS5pLCB0LCB2O1xuICAgIC8vIFVwZGF0ZSBXZXlsIGdlbmVyYXRvci5cbiAgICBtZS53ID0gdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwO1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICB2IF49IHYgPDwgMTM7XG4gICAgdCBePSB0IDw8IDE3O1xuICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgdCBePSB0ID4+PiAxMjtcbiAgICAvLyBVcGRhdGUgWG9yIGdlbmVyYXRvciBhcnJheSBzdGF0ZS5cbiAgICB2ID0gWFtpXSA9IHYgXiB0O1xuICAgIG1lLmkgPSBpO1xuICAgIC8vIFJlc3VsdCBpcyB0aGUgY29tYmluYXRpb24uXG4gICAgcmV0dXJuICh2ICsgKHcgXiAodyA+Pj4gMTYpKSkgfCAwO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgdCwgdiwgaSwgaiwgdywgWCA9IFtdLCBsaW1pdCA9IDEyODtcbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gTnVtZXJpYyBzZWVkcyBpbml0aWFsaXplIHYsIHdoaWNoIGlzIHVzZWQgdG8gZ2VuZXJhdGVzIFguXG4gICAgICB2ID0gc2VlZDtcbiAgICAgIHNlZWQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdHJpbmcgc2VlZHMgYXJlIG1peGVkIGludG8gdiBhbmQgWCBvbmUgY2hhcmFjdGVyIGF0IGEgdGltZS5cbiAgICAgIHNlZWQgPSBzZWVkICsgJ1xcMCc7XG4gICAgICB2ID0gMDtcbiAgICAgIGxpbWl0ID0gTWF0aC5tYXgobGltaXQsIHNlZWQubGVuZ3RoKTtcbiAgICB9XG4gICAgLy8gSW5pdGlhbGl6ZSBjaXJjdWxhciBhcnJheSBhbmQgd2V5bCB2YWx1ZS5cbiAgICBmb3IgKGkgPSAwLCBqID0gLTMyOyBqIDwgbGltaXQ7ICsraikge1xuICAgICAgLy8gUHV0IHRoZSB1bmljb2RlIGNoYXJhY3RlcnMgaW50byB0aGUgYXJyYXksIGFuZCBzaHVmZmxlIHRoZW0uXG4gICAgICBpZiAoc2VlZCkgdiBePSBzZWVkLmNoYXJDb2RlQXQoKGogKyAzMikgJSBzZWVkLmxlbmd0aCk7XG4gICAgICAvLyBBZnRlciAzMiBzaHVmZmxlcywgdGFrZSB2IGFzIHRoZSBzdGFydGluZyB3IHZhbHVlLlxuICAgICAgaWYgKGogPT09IDApIHcgPSB2O1xuICAgICAgdiBePSB2IDw8IDEwO1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHYgXj0gdiA8PCA0O1xuICAgICAgdiBePSB2ID4+PiAxMztcbiAgICAgIGlmIChqID49IDApIHtcbiAgICAgICAgdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwOyAgICAgLy8gV2V5bC5cbiAgICAgICAgdCA9IChYW2ogJiAxMjddIF49ICh2ICsgdykpOyAgLy8gQ29tYmluZSB4b3IgYW5kIHdleWwgdG8gaW5pdCBhcnJheS5cbiAgICAgICAgaSA9ICgwID09IHQpID8gaSArIDEgOiAwOyAgICAgLy8gQ291bnQgemVyb2VzLlxuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBoYXZlIGRldGVjdGVkIGFsbCB6ZXJvZXM7IG1ha2UgdGhlIGtleSBub256ZXJvLlxuICAgIGlmIChpID49IDEyOCkge1xuICAgICAgWFsoc2VlZCAmJiBzZWVkLmxlbmd0aCB8fCAwKSAmIDEyN10gPSAtMTtcbiAgICB9XG4gICAgLy8gUnVuIHRoZSBnZW5lcmF0b3IgNTEyIHRpbWVzIHRvIGZ1cnRoZXIgbWl4IHRoZSBzdGF0ZSBiZWZvcmUgdXNpbmcgaXQuXG4gICAgLy8gRmFjdG9yaW5nIHRoaXMgYXMgYSBmdW5jdGlvbiBzbG93cyB0aGUgbWFpbiBnZW5lcmF0b3IsIHNvIGl0IGlzIGp1c3RcbiAgICAvLyB1bnJvbGxlZCBoZXJlLiAgVGhlIHdleWwgZ2VuZXJhdG9yIGlzIG5vdCBhZHZhbmNlZCB3aGlsZSB3YXJtaW5nIHVwLlxuICAgIGkgPSAxMjc7XG4gICAgZm9yIChqID0gNCAqIDEyODsgaiA+IDA7IC0taikge1xuICAgICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgICB2IF49IHYgPDwgMTM7XG4gICAgICB0IF49IHQgPDwgMTc7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdCBePSB0ID4+PiAxMjtcbiAgICAgIFhbaV0gPSB2IF4gdDtcbiAgICB9XG4gICAgLy8gU3RvcmluZyBzdGF0ZSBhcyBvYmplY3QgbWVtYmVycyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBjbG9zdXJlIHZhcmlhYmxlcy5cbiAgICBtZS53ID0gdztcbiAgICBtZS5YID0gWDtcbiAgICBtZS5pID0gaTtcbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LncgPSBmLnc7XG4gIHQuWCA9IGYuWC5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLlgpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3I0MDk2ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdyBvYmplY3Qgb3IgZ2xvYmFsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcIlR5Y2hlLWlcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLlxuLy8gU2VlIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQsIGEgPSBtZS5hO1xuICAgIGIgPSAoYiA8PCAyNSkgXiAoYiA+Pj4gNykgXiBjO1xuICAgIGMgPSAoYyAtIGQpIHwgMDtcbiAgICBkID0gKGQgPDwgMjQpIF4gKGQgPj4+IDgpIF4gYTtcbiAgICBhID0gKGEgLSBiKSB8IDA7XG4gICAgbWUuYiA9IGIgPSAoYiA8PCAyMCkgXiAoYiA+Pj4gMTIpIF4gYztcbiAgICBtZS5jID0gYyA9IChjIC0gZCkgfCAwO1xuICAgIG1lLmQgPSAoZCA8PCAxNikgXiAoYyA+Pj4gMTYpIF4gYTtcbiAgICByZXR1cm4gbWUuYSA9IChhIC0gYikgfCAwO1xuICB9O1xuXG4gIC8qIFRoZSBmb2xsb3dpbmcgaXMgbm9uLWludmVydGVkIHR5Y2hlLCB3aGljaCBoYXMgYmV0dGVyIGludGVybmFsXG4gICAqIGJpdCBkaWZmdXNpb24sIGJ1dCB3aGljaCBpcyBhYm91dCAyNSUgc2xvd2VyIHRoYW4gdHljaGUtaSBpbiBKUy5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhID0gbWUuYSwgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZDtcbiAgICBhID0gKG1lLmEgKyBtZS5iIHwgMCkgPj4+IDA7XG4gICAgZCA9IG1lLmQgXiBhOyBkID0gZCA8PCAxNiBeIGQgPj4+IDE2O1xuICAgIGMgPSBtZS5jICsgZCB8IDA7XG4gICAgYiA9IG1lLmIgXiBjOyBiID0gYiA8PCAxMiBeIGQgPj4+IDIwO1xuICAgIG1lLmEgPSBhID0gYSArIGIgfCAwO1xuICAgIGQgPSBkIF4gYTsgbWUuZCA9IGQgPSBkIDw8IDggXiBkID4+PiAyNDtcbiAgICBtZS5jID0gYyA9IGMgKyBkIHwgMDtcbiAgICBiID0gYiBeIGM7XG4gICAgcmV0dXJuIG1lLmIgPSAoYiA8PCA3IF4gYiA+Pj4gMjUpO1xuICB9XG4gICovXG5cbiAgbWUuYSA9IDA7XG4gIG1lLmIgPSAwO1xuICBtZS5jID0gMjY1NDQzNTc2OSB8IDA7XG4gIG1lLmQgPSAxMzY3MTMwNTUxO1xuXG4gIGlmIChzZWVkID09PSBNYXRoLmZsb29yKHNlZWQpKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLmEgPSAoc2VlZCAvIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgbWUuYiA9IHNlZWQgfCAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgMjA7IGsrKykge1xuICAgIG1lLmIgXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYSA9IGYuYTtcbiAgdC5iID0gZi5iO1xuICB0LmMgPSBmLmM7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnR5Y2hlaSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLypcbkNvcHlyaWdodCAyMDE0IERhdmlkIEJhdS5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG5JTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcblRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG5TT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuKi9cblxuKGZ1bmN0aW9uIChwb29sLCBtYXRoKSB7XG4vL1xuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxuLy9cblxuLy8gRGV0ZWN0IHRoZSBnbG9iYWwgb2JqZWN0LCBldmVuIGlmIG9wZXJhdGluZyBpbiBzdHJpY3QgbW9kZS5cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0Mzg3MDU3LzI2NTI5OFxudmFyIGdsb2JhbCA9ICgwLCBldmFsKSgndGhpcycpLFxuICAgIHdpZHRoID0gMjU2LCAgICAgICAgLy8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxuICAgIGNodW5rcyA9IDYsICAgICAgICAgLy8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxuICAgIGRpZ2l0cyA9IDUyLCAgICAgICAgLy8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxuICAgIHJuZ25hbWUgPSAncmFuZG9tJywgLy8gcm5nbmFtZTogbmFtZSBmb3IgTWF0aC5yYW5kb20gYW5kIE1hdGguc2VlZHJhbmRvbVxuICAgIHN0YXJ0ZGVub20gPSBtYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcbiAgICBzaWduaWZpY2FuY2UgPSBtYXRoLnBvdygyLCBkaWdpdHMpLFxuICAgIG92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMixcbiAgICBtYXNrID0gd2lkdGggLSAxLFxuICAgIG5vZGVjcnlwdG87ICAgICAgICAgLy8gbm9kZS5qcyBjcnlwdG8gbW9kdWxlLCBpbml0aWFsaXplZCBhdCB0aGUgYm90dG9tLlxuXG4vL1xuLy8gc2VlZHJhbmRvbSgpXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cbi8vXG5mdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHZhciBrZXkgPSBbXTtcbiAgb3B0aW9ucyA9IChvcHRpb25zID09IHRydWUpID8geyBlbnRyb3B5OiB0cnVlIH0gOiAob3B0aW9ucyB8fCB7fSk7XG5cbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcbiAgICBvcHRpb25zLmVudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcbiAgICAoc2VlZCA9PSBudWxsKSA/IGF1dG9zZWVkKCkgOiBzZWVkLCAzKSwga2V5KTtcblxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xuXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cbiAgdmFyIHBybmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcbiAgICAgICAgZCA9IHN0YXJ0ZGVub20sICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXG4gICAgfVxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgbWF0aCB1bnRpbFxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXG4gICAgfVxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxuICB9O1xuXG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSB8IDA7IH1cbiAgcHJuZy5xdWljayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIC8gMHgxMDAwMDAwMDA7IH1cbiAgcHJuZy5kb3VibGUgPSBwcm5nO1xuXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcblxuICAvLyBDYWxsaW5nIGNvbnZlbnRpb246IHdoYXQgdG8gcmV0dXJuIGFzIGEgZnVuY3Rpb24gb2YgcHJuZywgc2VlZCwgaXNfbWF0aC5cbiAgcmV0dXJuIChvcHRpb25zLnBhc3MgfHwgY2FsbGJhY2sgfHxcbiAgICAgIGZ1bmN0aW9uKHBybmcsIHNlZWQsIGlzX21hdGhfY2FsbCwgc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgLy8gTG9hZCB0aGUgYXJjNCBzdGF0ZSBmcm9tIHRoZSBnaXZlbiBzdGF0ZSBpZiBpdCBoYXMgYW4gUyBhcnJheS5cbiAgICAgICAgICBpZiAoc3RhdGUuUykgeyBjb3B5KHN0YXRlLCBhcmM0KTsgfVxuICAgICAgICAgIC8vIE9ubHkgcHJvdmlkZSB0aGUgLnN0YXRlIG1ldGhvZCBpZiByZXF1ZXN0ZWQgdmlhIG9wdGlvbnMuc3RhdGUuXG4gICAgICAgICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weShhcmM0LCB7fSk7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGNhbGxlZCBhcyBhIG1ldGhvZCBvZiBNYXRoIChNYXRoLnNlZWRyYW5kb20oKSksIG11dGF0ZVxuICAgICAgICAvLyBNYXRoLnJhbmRvbSBiZWNhdXNlIHRoYXQgaXMgaG93IHNlZWRyYW5kb20uanMgaGFzIHdvcmtlZCBzaW5jZSB2MS4wLlxuICAgICAgICBpZiAoaXNfbWF0aF9jYWxsKSB7IG1hdGhbcm5nbmFtZV0gPSBwcm5nOyByZXR1cm4gc2VlZDsgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQgaXMgYSBuZXdlciBjYWxsaW5nIGNvbnZlbnRpb24sIHNvIHJldHVybiB0aGVcbiAgICAgICAgLy8gcHJuZyBkaXJlY3RseS5cbiAgICAgICAgZWxzZSByZXR1cm4gcHJuZztcbiAgICAgIH0pKFxuICBwcm5nLFxuICBzaG9ydHNlZWQsXG4gICdnbG9iYWwnIGluIG9wdGlvbnMgPyBvcHRpb25zLmdsb2JhbCA6ICh0aGlzID09IG1hdGgpLFxuICBvcHRpb25zLnN0YXRlKTtcbn1cbm1hdGhbJ3NlZWQnICsgcm5nbmFtZV0gPSBzZWVkcmFuZG9tO1xuXG4vL1xuLy8gQVJDNFxuLy9cbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2Zcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxuLy9cbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXG4vL1xuZnVuY3Rpb24gQVJDNChrZXkpIHtcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xuXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cblxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XG4gICAgc1tpXSA9IGkrKztcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XG4gICAgc1tqXSA9IHQ7XG4gIH1cblxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICAvLyBVc2luZyBpbnN0YW5jZSBtZW1iZXJzIGluc3RlYWQgb2YgY2xvc3VyZSBzdGF0ZSBuZWFybHkgZG91YmxlcyBzcGVlZC5cbiAgICB2YXIgdCwgciA9IDAsXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XG4gICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcbiAgICB9XG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xuICAgIHJldHVybiByO1xuICAgIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSwgdGhlIGZ1bmN0aW9uIGNhbGwgYmVsb3cgYXV0b21hdGljYWxseVxuICAgIC8vIGRpc2NhcmRzIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLiAgVGhpcyBpcyBjYWxsZWQgUkM0LWRyb3BbMjU2XS5cbiAgICAvLyBTZWUgaHR0cDovL2dvb2dsZS5jb20vc2VhcmNoP3E9cnNhK2ZsdWhyZXIrcmVzcG9uc2UmYnRuSVxuICB9KSh3aWR0aCk7XG59XG5cbi8vXG4vLyBjb3B5KClcbi8vIENvcGllcyBpbnRlcm5hbCBzdGF0ZSBvZiBBUkM0IHRvIG9yIGZyb20gYSBwbGFpbiBvYmplY3QuXG4vL1xuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC5qID0gZi5qO1xuICB0LlMgPSBmLlMuc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG4vL1xuLy8gZmxhdHRlbigpXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXG4vL1xuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XG4gIHZhciByZXN1bHQgPSBbXSwgdHlwID0gKHR5cGVvZiBvYmopLCBwcm9wO1xuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XG4gICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3N0cmluZycgPyBvYmogOiBvYmogKyAnXFwwJyk7XG59XG5cbi8vXG4vLyBtaXhrZXkoKVxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXG4vL1xuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSkge1xuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XG4gICAga2V5W21hc2sgJiBqXSA9XG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xuICB9XG4gIHJldHVybiB0b3N0cmluZyhrZXkpO1xufVxuXG4vL1xuLy8gYXV0b3NlZWQoKVxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGFuZCBOb2RlIGNyeXB0b1xuLy8gbW9kdWxlIGlmIGF2YWlsYWJsZS5cbi8vXG5mdW5jdGlvbiBhdXRvc2VlZCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgb3V0O1xuICAgIGlmIChub2RlY3J5cHRvICYmIChvdXQgPSBub2RlY3J5cHRvLnJhbmRvbUJ5dGVzKSkge1xuICAgICAgLy8gVGhlIHVzZSBvZiAnb3V0JyB0byByZW1lbWJlciByYW5kb21CeXRlcyBtYWtlcyB0aWdodCBtaW5pZmllZCBjb2RlLlxuICAgICAgb3V0ID0gb3V0KHdpZHRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpO1xuICAgICAgKGdsb2JhbC5jcnlwdG8gfHwgZ2xvYmFsLm1zQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMob3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRvc3RyaW5nKG91dCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgYnJvd3NlciA9IGdsb2JhbC5uYXZpZ2F0b3IsXG4gICAgICAgIHBsdWdpbnMgPSBicm93c2VyICYmIGJyb3dzZXIucGx1Z2lucztcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgZ2xvYmFsLCBwbHVnaW5zLCBnbG9iYWwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XG4gIH1cbn1cblxuLy9cbi8vIHRvc3RyaW5nKClcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xuLy9cbmZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XG59XG5cbi8vXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xuLy8gZnJvbSB0aGUgYnVpbHQtaW4gUk5HIGludG8gdGhlIGVudHJvcHkgcG9vbC4gIEJlY2F1c2Ugd2UgZG9cbi8vIG5vdCB3YW50IHRvIGludGVyZmVyZSB3aXRoIGRldGVybWluaXN0aWMgUFJORyBzdGF0ZSBsYXRlcixcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBtYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXG4vLyBpbml0aWFsaXphdGlvbi5cbi8vXG5taXhrZXkobWF0aC5yYW5kb20oKSwgcG9vbCk7XG5cbi8vXG4vLyBOb2RlanMgYW5kIEFNRCBzdXBwb3J0OiBleHBvcnQgdGhlIGltcGxlbWVudGF0aW9uIGFzIGEgbW9kdWxlIHVzaW5nXG4vLyBlaXRoZXIgY29udmVudGlvbi5cbi8vXG5pZiAoKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gc2VlZHJhbmRvbTtcbiAgLy8gV2hlbiBpbiBub2RlLmpzLCB0cnkgdXNpbmcgY3J5cHRvIHBhY2thZ2UgZm9yIGF1dG9zZWVkaW5nLlxuICB0cnkge1xuICAgIG5vZGVjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbiAgfSBjYXRjaCAoZXgpIHt9XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VlZHJhbmRvbTsgfSk7XG59XG5cbi8vIEVuZCBhbm9ueW1vdXMgc2NvcGUsIGFuZCBwYXNzIGluaXRpYWwgdmFsdWVzLlxufSkoXG4gIFtdLCAgICAgLy8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxuICBNYXRoICAgIC8vIG1hdGg6IHBhY2thZ2UgY29udGFpbmluZyByYW5kb20sIHBvdywgYW5kIHNlZWRyYW5kb21cbik7XG4iLCIvLyBBIGxpYnJhcnkgb2Ygc2VlZGFibGUgUk5HcyBpbXBsZW1lbnRlZCBpbiBKYXZhc2NyaXB0LlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciBzZWVkcmFuZG9tID0gcmVxdWlyZSgnc2VlZHJhbmRvbScpO1xuLy8gdmFyIHJhbmRvbSA9IHNlZWRyYW5kb20oMSk7IC8vIG9yIGFueSBzZWVkLlxuLy8gdmFyIHggPSByYW5kb20oKTsgICAgICAgLy8gMCA8PSB4IDwgMS4gIEV2ZXJ5IGJpdCBpcyByYW5kb20uXG4vLyB2YXIgeCA9IHJhbmRvbS5xdWljaygpOyAvLyAwIDw9IHggPCAxLiAgMzIgYml0cyBvZiByYW5kb21uZXNzLlxuXG4vLyBhbGVhLCBhIDUzLWJpdCBtdWx0aXBseS13aXRoLWNhcnJ5IGdlbmVyYXRvciBieSBKb2hhbm5lcyBCYWFnw7hlLlxuLy8gUGVyaW9kOiB+Ml4xMTZcbi8vIFJlcG9ydGVkIHRvIHBhc3MgYWxsIEJpZ0NydXNoIHRlc3RzLlxudmFyIGFsZWEgPSByZXF1aXJlKCcuL2xpYi9hbGVhJyk7XG5cbi8vIHhvcjEyOCwgYSBwdXJlIHhvci1zaGlmdCBnZW5lcmF0b3IgYnkgR2VvcmdlIE1hcnNhZ2xpYS5cbi8vIFBlcmlvZDogMl4xMjgtMS5cbi8vIFJlcG9ydGVkIHRvIGZhaWw6IE1hdHJpeFJhbmsgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yMTI4ID0gcmVxdWlyZSgnLi9saWIveG9yMTI4Jyk7XG5cbi8vIHhvcndvdywgR2VvcmdlIE1hcnNhZ2xpYSdzIDE2MC1iaXQgeG9yLXNoaWZ0IGNvbWJpbmVkIHBsdXMgd2V5bC5cbi8vIFBlcmlvZDogMl4xOTItMl4zMlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogQ29sbGlzaW9uT3ZlciwgU2ltcFBva2VyLCBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3J3b3cgPSByZXF1aXJlKCcuL2xpYi94b3J3b3cnKTtcblxuLy8geG9yc2hpZnQ3LCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllciwgdGFrZXNcbi8vIGEgZGlmZmVyZW50IGFwcHJvYWNoOiBpdCBhZGRzIHJvYnVzdG5lc3MgYnkgYWxsb3dpbmcgbW9yZSBzaGlmdHNcbi8vIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuICBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yXG4vLyB3aXRoIDI1NiBiaXRzLCB0aGF0IHBhc3NlcyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RtYXRpYyBmYWlsdXJlcy5cbi8vIFBlcmlvZCAyXjI1Ni0xLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3JzaGlmdDcgPSByZXF1aXJlKCcuL2xpYi94b3JzaGlmdDcnKTtcblxuLy8geG9yNDA5NiwgYnkgUmljaGFyZCBCcmVudCwgaXMgYSA0MDk2LWJpdCB4b3Itc2hpZnQgd2l0aCBhXG4vLyB2ZXJ5IGxvbmcgcGVyaW9kIHRoYXQgYWxzbyBhZGRzIGEgV2V5bCBnZW5lcmF0b3IuIEl0IGFsc28gcGFzc2VzXG4vLyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RlbWF0aWMgZmFpbHVyZXMuICBJdHMgbG9uZyBwZXJpb2QgbWF5XG4vLyBiZSB1c2VmdWwgaWYgeW91IGhhdmUgbWFueSBnZW5lcmF0b3JzIGFuZCBuZWVkIHRvIGF2b2lkXG4vLyBjb2xsaXNpb25zLlxuLy8gUGVyaW9kOiAyXjQxMjgtMl4zMi5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yNDA5NiA9IHJlcXVpcmUoJy4vbGliL3hvcjQwOTYnKTtcblxuLy8gVHljaGUtaSwgYnkgU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLCBpcyBhIGJpdC1zaGlmdGluZyByYW5kb21cbi8vIG51bWJlciBnZW5lcmF0b3IgZGVyaXZlZCBmcm9tIENoYUNoYSwgYSBtb2Rlcm4gc3RyZWFtIGNpcGhlci5cbi8vIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG4vLyBQZXJpb2Q6IH4yXjEyN1xuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB0eWNoZWkgPSByZXF1aXJlKCcuL2xpYi90eWNoZWknKTtcblxuLy8gVGhlIG9yaWdpbmFsIEFSQzQtYmFzZWQgcHJuZyBpbmNsdWRlZCBpbiB0aGlzIGxpYnJhcnkuXG4vLyBQZXJpb2Q6IH4yXjE2MDBcbnZhciBzciA9IHJlcXVpcmUoJy4vc2VlZHJhbmRvbScpO1xuXG5zci5hbGVhID0gYWxlYTtcbnNyLnhvcjEyOCA9IHhvcjEyODtcbnNyLnhvcndvdyA9IHhvcndvdztcbnNyLnhvcnNoaWZ0NyA9IHhvcnNoaWZ0NztcbnNyLnhvcjQwOTYgPSB4b3I0MDk2O1xuc3IudHljaGVpID0gdHljaGVpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNyO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBzdHIgPT4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvWyEnKCkqXS9nLCB4ID0+IGAlJHt4LmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9YCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdG9rZW4gPSAnJVthLWYwLTldezJ9JztcbnZhciBzaW5nbGVNYXRjaGVyID0gbmV3IFJlZ0V4cCh0b2tlbiwgJ2dpJyk7XG52YXIgbXVsdGlNYXRjaGVyID0gbmV3IFJlZ0V4cCgnKCcgKyB0b2tlbiArICcpKycsICdnaScpO1xuXG5mdW5jdGlvbiBkZWNvZGVDb21wb25lbnRzKGNvbXBvbmVudHMsIHNwbGl0KSB7XG5cdHRyeSB7XG5cdFx0Ly8gVHJ5IHRvIGRlY29kZSB0aGUgZW50aXJlIHN0cmluZyBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoY29tcG9uZW50cy5qb2luKCcnKSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIERvIG5vdGhpbmdcblx0fVxuXG5cdGlmIChjb21wb25lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiBjb21wb25lbnRzO1xuXHR9XG5cblx0c3BsaXQgPSBzcGxpdCB8fCAxO1xuXG5cdC8vIFNwbGl0IHRoZSBhcnJheSBpbiAyIHBhcnRzXG5cdHZhciBsZWZ0ID0gY29tcG9uZW50cy5zbGljZSgwLCBzcGxpdCk7XG5cdHZhciByaWdodCA9IGNvbXBvbmVudHMuc2xpY2Uoc3BsaXQpO1xuXG5cdHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmNhbGwoW10sIGRlY29kZUNvbXBvbmVudHMobGVmdCksIGRlY29kZUNvbXBvbmVudHMocmlnaHQpKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChpbnB1dCk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdHZhciB0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblxuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpbnB1dCA9IGRlY29kZUNvbXBvbmVudHModG9rZW5zLCBpKS5qb2luKCcnKTtcblxuXHRcdFx0dG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChpbnB1dCkge1xuXHQvLyBLZWVwIHRyYWNrIG9mIGFsbCB0aGUgcmVwbGFjZW1lbnRzIGFuZCBwcmVmaWxsIHRoZSBtYXAgd2l0aCB0aGUgYEJPTWBcblx0dmFyIHJlcGxhY2VNYXAgPSB7XG5cdFx0JyVGRSVGRic6ICdcXHVGRkZEXFx1RkZGRCcsXG5cdFx0JyVGRiVGRSc6ICdcXHVGRkZEXFx1RkZGRCdcblx0fTtcblxuXHR2YXIgbWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdHdoaWxlIChtYXRjaCkge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBEZWNvZGUgYXMgYmlnIGNodW5rcyBhcyBwb3NzaWJsZVxuXHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbMF0pO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0dmFyIHJlc3VsdCA9IGRlY29kZShtYXRjaFswXSk7XG5cblx0XHRcdGlmIChyZXN1bHQgIT09IG1hdGNoWzBdKSB7XG5cdFx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR9XG5cblx0Ly8gQWRkIGAlQzJgIGF0IHRoZSBlbmQgb2YgdGhlIG1hcCB0byBtYWtlIHN1cmUgaXQgZG9lcyBub3QgcmVwbGFjZSB0aGUgY29tYmluYXRvciBiZWZvcmUgZXZlcnl0aGluZyBlbHNlXG5cdHJlcGxhY2VNYXBbJyVDMiddID0gJ1xcdUZGRkQnO1xuXG5cdHZhciBlbnRyaWVzID0gT2JqZWN0LmtleXMocmVwbGFjZU1hcCk7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Ly8gUmVwbGFjZSBhbGwgZGVjb2RlZCBjb21wb25lbnRzXG5cdFx0dmFyIGtleSA9IGVudHJpZXNbaV07XG5cdFx0aW5wdXQgPSBpbnB1dC5yZXBsYWNlKG5ldyBSZWdFeHAoa2V5LCAnZycpLCByZXBsYWNlTWFwW2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbmNvZGVkVVJJKSB7XG5cdGlmICh0eXBlb2YgZW5jb2RlZFVSSSAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBgZW5jb2RlZFVSSWAgdG8gYmUgb2YgdHlwZSBgc3RyaW5nYCwgZ290IGAnICsgdHlwZW9mIGVuY29kZWRVUkkgKyAnYCcpO1xuXHR9XG5cblx0dHJ5IHtcblx0XHRlbmNvZGVkVVJJID0gZW5jb2RlZFVSSS5yZXBsYWNlKC9cXCsvZywgJyAnKTtcblxuXHRcdC8vIFRyeSB0aGUgYnVpbHQgaW4gZGVjb2RlciBmaXJzdFxuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH0gY2F0Y2ggKGVycikge1xuXHRcdC8vIEZhbGxiYWNrIHRvIGEgbW9yZSBhZHZhbmNlZCBkZWNvZGVyXG5cdFx0cmV0dXJuIGN1c3RvbURlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nLCBzZXBhcmF0b3IpID0+IHtcblx0aWYgKCEodHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHNlcGFyYXRvciA9PT0gJ3N0cmluZycpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgdGhlIGFyZ3VtZW50cyB0byBiZSBvZiB0eXBlIGBzdHJpbmdgJyk7XG5cdH1cblxuXHRpZiAoc2VwYXJhdG9yID09PSAnJykge1xuXHRcdHJldHVybiBbc3RyaW5nXTtcblx0fVxuXG5cdGNvbnN0IHNlcGFyYXRvckluZGV4ID0gc3RyaW5nLmluZGV4T2Yoc2VwYXJhdG9yKTtcblxuXHRpZiAoc2VwYXJhdG9ySW5kZXggPT09IC0xKSB7XG5cdFx0cmV0dXJuIFtzdHJpbmddO1xuXHR9XG5cblx0cmV0dXJuIFtcblx0XHRzdHJpbmcuc2xpY2UoMCwgc2VwYXJhdG9ySW5kZXgpLFxuXHRcdHN0cmluZy5zbGljZShzZXBhcmF0b3JJbmRleCArIHNlcGFyYXRvci5sZW5ndGgpXG5cdF07XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc3RyaWN0VXJpRW5jb2RlID0gcmVxdWlyZSgnc3RyaWN0LXVyaS1lbmNvZGUnKTtcbmNvbnN0IGRlY29kZUNvbXBvbmVudCA9IHJlcXVpcmUoJ2RlY29kZS11cmktY29tcG9uZW50Jyk7XG5jb25zdCBzcGxpdE9uRmlyc3QgPSByZXF1aXJlKCdzcGxpdC1vbi1maXJzdCcpO1xuXG5mdW5jdGlvbiBlbmNvZGVyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gcmVzdWx0Lmxlbmd0aDtcblx0XHRcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgKG9wdGlvbnMuc2tpcE51bGwgJiYgdmFsdWUgPT09IG51bGwpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbJywgaW5kZXgsICddJ10uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHQuLi5yZXN1bHQsXG5cdFx0XHRcdFx0W2VuY29kZShrZXksIG9wdGlvbnMpLCAnWycsIGVuY29kZShpbmRleCwgb3B0aW9ucyksICddPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXG5cdFx0XHRcdF07XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW10nXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW109JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2NvbW1hJzpcblx0XHRjYXNlICdzZXBhcmF0b3InOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHJlc3VsdC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gW1tlbmNvZGUoa2V5LCBvcHRpb25zKSwgJz0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gW1tyZXN1bHQsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4ob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcildO1xuXHRcdFx0fTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgZW5jb2RlKGtleSwgb3B0aW9ucyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJz0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0bGV0IHJlc3VsdDtcblxuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC9cXFsoXFxkKilcXF0kLy5leGVjKGtleSk7XG5cblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcZCpcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0ge307XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldW3Jlc3VsdFsxXV0gPSB2YWx1ZTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gLyhcXFtcXF0pJC8uZXhlYyhrZXkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFt2YWx1ZV07XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnY29tbWEnOlxuXHRcdGNhc2UgJ3NlcGFyYXRvcic6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGlzQXJyYXkgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnNwbGl0KCcnKS5pbmRleE9mKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpID4gLTE7XG5cdFx0XHRcdGNvbnN0IG5ld1ZhbHVlID0gaXNBcnJheSA/IHZhbHVlLnNwbGl0KG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpLm1hcChpdGVtID0+IGRlY29kZShpdGVtLCBvcHRpb25zKSkgOiB2YWx1ZSA9PT0gbnVsbCA/IHZhbHVlIDogZGVjb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IG5ld1ZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlGb3JtYXRTZXBhcmF0b3IodmFsdWUpIHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUubGVuZ3RoICE9PSAxKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXlGb3JtYXRTZXBhcmF0b3IgbXVzdCBiZSBzaW5nbGUgY2hhcmFjdGVyIHN0cmluZycpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5lbmNvZGUpIHtcblx0XHRyZXR1cm4gb3B0aW9ucy5zdHJpY3QgPyBzdHJpY3RVcmlFbmNvZGUodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmRlY29kZSkge1xuXHRcdHJldHVybiBkZWNvZGVDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBrZXlzU29ydGVyKGlucHV0KSB7XG5cdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuXHRcdHJldHVybiBpbnB1dC5zb3J0KCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiBrZXlzU29ydGVyKE9iamVjdC5rZXlzKGlucHV0KSlcblx0XHRcdC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYSkgLSBOdW1iZXIoYikpXG5cdFx0XHQubWFwKGtleSA9PiBpbnB1dFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSGFzaChpbnB1dCkge1xuXHRjb25zdCBoYXNoU3RhcnQgPSBpbnB1dC5pbmRleE9mKCcjJyk7XG5cdGlmIChoYXNoU3RhcnQgIT09IC0xKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBoYXNoU3RhcnQpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBnZXRIYXNoKHVybCkge1xuXHRsZXQgaGFzaCA9ICcnO1xuXHRjb25zdCBoYXNoU3RhcnQgPSB1cmwuaW5kZXhPZignIycpO1xuXHRpZiAoaGFzaFN0YXJ0ICE9PSAtMSkge1xuXHRcdGhhc2ggPSB1cmwuc2xpY2UoaGFzaFN0YXJ0KTtcblx0fVxuXG5cdHJldHVybiBoYXNoO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGlucHV0ID0gcmVtb3ZlSGFzaChpbnB1dCk7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdHJldHVybiBpbnB1dC5zbGljZShxdWVyeVN0YXJ0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVmFsdWUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMucGFyc2VOdW1iZXJzICYmICFOdW1iZXIuaXNOYU4oTnVtYmVyKHZhbHVlKSkgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpICE9PSAnJykpIHtcblx0XHR2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5wYXJzZUJvb2xlYW5zICYmIHZhbHVlICE9PSBudWxsICYmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZScgfHwgdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhbHNlJykpIHtcblx0XHR2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJztcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdGRlY29kZTogdHJ1ZSxcblx0XHRzb3J0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZScsXG5cdFx0YXJyYXlGb3JtYXRTZXBhcmF0b3I6ICcsJyxcblx0XHRwYXJzZU51bWJlcnM6IGZhbHNlLFxuXHRcdHBhcnNlQm9vbGVhbnM6IGZhbHNlXG5cdH0sIG9wdGlvbnMpO1xuXG5cdHZhbGlkYXRlQXJyYXlGb3JtYXRTZXBhcmF0b3Iob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcik7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBzcGxpdE9uRmlyc3Qob3B0aW9ucy5kZWNvZGUgPyBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKSA6IHBhcmFtLCAnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG9wdGlvbnMuYXJyYXlGb3JtYXQgPT09ICdjb21tYScgPyB2YWx1ZSA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJldCkpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XG5cdFx0XHRcdHZhbHVlW2tdID0gcGFyc2VWYWx1ZSh2YWx1ZVtrXSwgb3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldFtrZXldID0gcGFyc2VWYWx1ZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc29ydCA9PT0gZmFsc2UpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0cmV0dXJuIChvcHRpb25zLnNvcnQgPT09IHRydWUgPyBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKSA6IE9iamVjdC5rZXlzKHJldCkuc29ydChvcHRpb25zLnNvcnQpKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iamVjdCwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIW9iamVjdCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZScsXG5cdFx0YXJyYXlGb3JtYXRTZXBhcmF0b3I6ICcsJ1xuXHR9LCBvcHRpb25zKTtcblxuXHR2YWxpZGF0ZUFycmF5Rm9ybWF0U2VwYXJhdG9yKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHRjb25zdCBvYmplY3RDb3B5ID0gT2JqZWN0LmFzc2lnbih7fSwgb2JqZWN0KTtcblx0aWYgKG9wdGlvbnMuc2tpcE51bGwpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmplY3RDb3B5KSkge1xuXHRcdFx0aWYgKG9iamVjdENvcHlba2V5XSA9PT0gdW5kZWZpbmVkIHx8IG9iamVjdENvcHlba2V5XSA9PT0gbnVsbCkge1xuXHRcdFx0XHRkZWxldGUgb2JqZWN0Q29weVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3RDb3B5KTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ICE9PSBmYWxzZSkge1xuXHRcdGtleXMuc29ydChvcHRpb25zLnNvcnQpO1xuXHR9XG5cblx0cmV0dXJuIGtleXMubWFwKGtleSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHRcdFx0LnJlZHVjZShmb3JtYXR0ZXIoa2V5KSwgW10pXG5cdFx0XHRcdC5qb2luKCcmJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpICsgJz0nICsgZW5jb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0fSkuZmlsdGVyKHggPT4geC5sZW5ndGggPiAwKS5qb2luKCcmJyk7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dXJsOiByZW1vdmVIYXNoKGlucHV0KS5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG5cbmV4cG9ydHMuc3RyaW5naWZ5VXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IHVybCA9IHJlbW92ZUhhc2goaW5wdXQudXJsKS5zcGxpdCgnPycpWzBdIHx8ICcnO1xuXHRjb25zdCBxdWVyeUZyb21VcmwgPSBleHBvcnRzLmV4dHJhY3QoaW5wdXQudXJsKTtcblx0Y29uc3QgcGFyc2VkUXVlcnlGcm9tVXJsID0gZXhwb3J0cy5wYXJzZShxdWVyeUZyb21VcmwpO1xuXHRjb25zdCBoYXNoID0gZ2V0SGFzaChpbnB1dC51cmwpO1xuXHRjb25zdCBxdWVyeSA9IE9iamVjdC5hc3NpZ24ocGFyc2VkUXVlcnlGcm9tVXJsLCBpbnB1dC5xdWVyeSk7XG5cdGxldCBxdWVyeVN0cmluZyA9IGV4cG9ydHMuc3RyaW5naWZ5KHF1ZXJ5LCBvcHRpb25zKTtcblx0aWYgKHF1ZXJ5U3RyaW5nKSB7XG5cdFx0cXVlcnlTdHJpbmcgPSBgPyR7cXVlcnlTdHJpbmd9YDtcblx0fVxuXG5cdHJldHVybiBgJHt1cmx9JHtxdWVyeVN0cmluZ30ke2hhc2h9YDtcbn07XG4iLCIvLyBNYXBzIG1vdXNlIGNvb3JkaW5hdGUgZnJvbSBlbGVtZW50IENTUyBwaXhlbHMgdG8gbm9ybWFsaXplZCBbIDAsIDEgXSByYW5nZS5cbmZ1bmN0aW9uIGNvbXB1dGVOb3JtYWxpemVkUG9zKGVsZW1lbnQsIGV2dCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB4ID0gZXZ0LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gIHZhciB5ID0gZXZ0LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgeCAvPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICB5IC89IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gW3gsIHldO1xufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZWNvcmRlciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgfVxuXG4gIGVuYWJsZShmb3JjZVJlc2V0KSB7XG4gICAgdGhpcy5pbml0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIHRoaXMuaW5qZWN0TGlzdGVuZXJzKCk7XG4gIH1cbi8qXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgfVxuKi9cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmZyYW1lTnVtYmVyID0gMDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgYWRkRXZlbnQodHlwZSwgZXZlbnQsIHBhcmFtZXRlcnMpIHtcbiAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50LFxuICAgICAgcGFyYW1ldGVyc1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVRpbWUpIHtcbiAgICAgIGV2ZW50RGF0YS50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLmluaXRUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudERhdGEuZnJhbWVOdW1iZXIgPSB0aGlzLmZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnREYXRhKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm5ld0V2ZW50Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKGV2ZW50RGF0YSk7XG4gICAgfVxuICB9XG4gIFxuICBpbmplY3RMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnZG93bicsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd1cCcsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ21vdmUnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuXG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd3aGVlbCcsIHtcbiAgICAgICAgZGVsdGFYOiBldnQuZGVsdGFYLFxuICAgICAgICBkZWx0YVk6IGV2dC5kZWx0YVksXG4gICAgICAgIGRlbHRhWjogZXZ0LmRlbHRhWixcbiAgICAgICAgZGVsdGFNb2RlOiBldnQuZGVsdGFNb2RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ2Rvd24nLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ3VwJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTsgIFxuICB9XG59IiwiXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NOiB0cnVlLFxuICBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NOiB0cnVlLFxuICBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkczogZmFsc2Vcbn07XG5cblxuZXhwb3J0IGNsYXNzIElucHV0UmVwbGF5ZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCByZWNvcmRpbmcsIHJlZ2lzdGVyZWRFdmVudExpc3RlbmVycywgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnJlY29yZGluZyA9IHJlY29yZGluZztcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnM7IC8vIElmID09PSBudWxsIC0+IERpc3BhdGNoIHRvIERPTVxuICB9XG5cbiAgdGljayAoZnJhbWVOdW1iZXIpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5yZWNvcmRpbmcubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA+IGZyYW1lTnVtYmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5yZWNvcmRpbmcubGVuZ3RoICYmIHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA9PT0gZnJhbWVOdW1iZXIpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlJzoge1xuICAgICAgICAgIGlmIChpbnB1dC5ldmVudCA9PT0gJ3doZWVsJykge1xuICAgICAgICAgICAgdGhpcy5zaW11bGF0ZVdoZWVsRXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zaW11bGF0ZU1vdXNlRXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC50eXBlICsgaW5wdXQuZXZlbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBicmVhaztcbiAgICAgICAgY2FzZSAna2V5Jzoge1xuICAgICAgICAgIHRoaXMuc2ltdWxhdGVLZXlFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgbm90IGltcGxlbWVudGVkIGV2ZW50JywgaW5wdXQudHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgc2ltdWxhdGVXaGVlbEV2ZW50KGVsZW1lbnQsIHBhcmFtZXRlcnMpIHtcbiAgICB2YXIgZSA9IG5ldyBFdmVudCgnbW91c2V3aGVlbCcsIHtidWJibGVzOiB0cnVlfSk7XG5cbiAgICBjb25zdCBldmVudFR5cGUgPSAnbW91c2V3aGVlbCc7XG4gICAgZS5kZWx0YVggPSBwYXJhbWV0ZXJzLmRlbHRhWDtcbiAgICBlLmRlbHRhWSA9IHBhcmFtZXRlcnMuZGVsdGFZO1xuICAgIGUuZGVsdGFaID0gcGFyYW1ldGVycy5kZWx0YVo7XG5cbiAgICBlLndoZWVsRGVsdGFYID0gcGFyYW1ldGVycy5kZWx0YVg7XG4gICAgZS53aGVlbERlbHRhWSA9IHBhcmFtZXRlcnMuZGVsdGFZO1xuICAgIGUud2hlZWxEZWx0YSA9IHBhcmFtZXRlcnMuZGVsdGFZO1xuXG4gICAgZS5kZWx0YU1vZGUgPSBwYXJhbWV0ZXJzLmRlbHRhTW9kZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pIHtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdGhpc18gPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5jb250ZXh0O1xuICAgICAgICB2YXIgdHlwZSA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLnR5cGU7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmZ1bjtcbiAgICAgICAgaWYgKHR5cGUgPT0gZXZlbnRUeXBlKSB7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG5cbiAgc2ltdWxhdGVLZXlFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBEb24ndCB1c2UgdGhlIEtleWJvYXJkRXZlbnQgb2JqZWN0IGJlY2F1c2Ugb2YgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84OTQyNjc4L2tleWJvYXJkZXZlbnQtaW4tY2hyb21lLWtleWNvZGUtaXMtMC8xMjUyMjc1MiMxMjUyMjc1MlxuICAgIC8vIFNlZSBhbHNvIGh0dHA6Ly9vdXRwdXQuanNiaW4uY29tL2F3ZW5hcS8zXG4gICAgLy8gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnS2V5Ym9hcmRFdmVudCcpO1xuICAgIC8vICAgIGlmIChlLmluaXRLZXlFdmVudCkge1xuICAgIC8vICAgICAgZS5pbml0S2V5RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBrZXlDb2RlLCBjaGFyQ29kZSk7XG4gICAgLy8gIH0gZWxzZSB7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCA/IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0KCkgOiBkb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50c1wiKTtcbiAgICBpZiAoZS5pbml0RXZlbnQpIHtcbiAgICAgIGUuaW5pdEV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZS5rZXlDb2RlID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUud2hpY2ggPSBwYXJhbWV0ZXJzLmtleUNvZGU7XG4gICAgZS5jaGFyQ29kZSA9IHBhcmFtZXRlcnMuY2hhckNvZGU7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuICAgIGUua2V5ID0gcGFyYW1ldGVycy5rZXk7XG5cbiAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBFbXNjcmlwdGVuJ3MgaHRtbDUuaCBBUEk6XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaEtleUV2ZW50c1ZpYURPTSkge1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCB0byBicm93c2VyIGZvciByZWFsXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPyBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSkgOiBlbGVtZW50LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGV2ZW50VHlwZTogXCJtb3VzZW1vdmVcIiwgXCJtb3VzZWRvd25cIiBvciBcIm1vdXNldXBcIi5cbiAgLy8geCBhbmQgeTogTm9ybWFsaXplZCBjb29yZGluYXRlIGluIHRoZSByYW5nZSBbMCwxXSB3aGVyZSB0byBpbmplY3QgdGhlIGV2ZW50LlxuICBzaW11bGF0ZU1vdXNlRXZlbnQoZWxlbWVudCwgZXZlbnRUeXBlLCBwYXJhbWV0ZXJzKSB7XG4gICAgLy8gUmVtYXAgZnJvbSBbMCwxXSB0byBjYW52YXMgQ1NTIHBpeGVsIHNpemUuXG4gICAgdmFyIHggPSBwYXJhbWV0ZXJzLng7XG4gICAgdmFyIHkgPSBwYXJhbWV0ZXJzLnk7XG5cbiAgICB4ICo9IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgeSAqPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAvLyBPZmZzZXQgdGhlIGluamVjdGVkIGNvb3JkaW5hdGUgZnJvbSB0b3AtbGVmdCBvZiB0aGUgY2xpZW50IGFyZWEgdG8gdGhlIHRvcC1sZWZ0IG9mIHRoZSBjYW52YXMuXG4gICAgeCA9IE1hdGgucm91bmQocmVjdC5sZWZ0ICsgeCk7XG4gICAgeSA9IE1hdGgucm91bmQocmVjdC50b3AgKyB5KTtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgZS5pbml0TW91c2VFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlID09ICdtb3VzZW1vdmUnID8gMCA6IDEsIHgsIHksIHgsIHksXG4gICAgICAgICAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuYnV0dG9uLCBudWxsKTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pIHtcbiAgICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhdGluZyBET00gZXZlbnRzIGRvZXNuJ3QgYWxsb3cgc3BlY2lmeWluZyBvZmZzZXRYICYgb2Zmc2V0WSBwcm9wZXJseVxuICAgICAgLy8gZm9yIHRoZSBlbGVtZW50LCBidXQgdGhleSBtdXN0IGJlIHRoZSBzYW1lIGFzIGNsaWVudFggJiBjbGllbnRZLiBUaGVyZWZvcmUgd2UgY2FuJ3QgaGF2ZSBhXG4gICAgICAvLyBib3JkZXIgdGhhdCB3b3VsZCBtYWtlIHRoZXNlIGRpZmZlcmVudC5cbiAgICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9IGVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICAgICAgfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT0gZWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgdGhyb3cgXCJFUlJPUiEgQ2FudmFzIG9iamVjdCBtdXN0IGhhdmUgMHB4IGJvcmRlciBmb3IgZGlyZWN0IG1vdXNlIGRpc3BhdGNoIHRvIHdvcmshXCI7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkge1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHMpIHtcbiAgICAgICAgICAgIC8vIElmIG5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzIGlzIHNldCwgdGhlIHBhZ2UgbmVlZHMgYSBmdWxsIHNldCBvZiBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAvLyBzcGVjaWZpZWQgaW4gdGhlIE1vdXNlRXZlbnQgb2JqZWN0LiBIb3dldmVyIG1vc3QgZmllbGRzIG9uIE1vdXNlRXZlbnQgYXJlIHJlYWQtb25seSwgc28gY3JlYXRlXG4gICAgICAgICAgICAvLyBhIG5ldyBjdXN0b20gb2JqZWN0ICh3aXRob3V0IHByb3RvdHlwZSBjaGFpbikgdG8gaG9sZCB0aGUgb3ZlcnJpZGRlbiBwcm9wZXJ0aWVzLlxuICAgICAgICAgICAgdmFyIGV2dCA9IHtcbiAgICAgICAgICAgICAgY3VycmVudFRhcmdldDogdGhpc18sXG4gICAgICAgICAgICAgIHNyY0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBmcm9tRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICAgIHRvRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICAgIGV2ZW50UGhhc2U6IDIsIC8vIEV2ZW50LkFUX1RBUkdFVFxuICAgICAgICAgICAgICBidXR0b25zOiAoZXZlbnRUeXBlID09ICdtb3VzZWRvd24nKSA/IDEgOiAwLFxuICAgICAgICAgICAgICBidXR0b246IGUuYnV0dG9uLFxuICAgICAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgICAgICBidWJibGVzOiBlLmJ1YmJsZXMsXG4gICAgICAgICAgICAgIGNhbmNlbEJ1YmJsZTogZS5jYW5jZWxCdWJibGUsXG4gICAgICAgICAgICAgIGNhbmNlbGFibGU6IGUuY2FuY2VsYWJsZSxcbiAgICAgICAgICAgICAgY2xpZW50WDogZS5jbGllbnRYLFxuICAgICAgICAgICAgICBjbGllbnRZOiBlLmNsaWVudFksXG4gICAgICAgICAgICAgIGN0cmxLZXk6IGUuY3RybEtleSxcbiAgICAgICAgICAgICAgZGVmYXVsdFByZXZlbnRlZDogZS5kZWZhdWx0UHJldmVudGVkLFxuICAgICAgICAgICAgICBkZXRhaWw6IGUuZGV0YWlsLFxuICAgICAgICAgICAgICBpZGVudGlmaWVyOiBlLmlkZW50aWZpZXIsXG4gICAgICAgICAgICAgIGlzVHJ1c3RlZDogZS5pc1RydXN0ZWQsXG4gICAgICAgICAgICAgIGxheWVyWDogZS5sYXllclgsXG4gICAgICAgICAgICAgIGxheWVyWTogZS5sYXllclksXG4gICAgICAgICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgICAgICAgbW92ZW1lbnRYOiBlLm1vdmVtZW50WCxcbiAgICAgICAgICAgICAgbW92ZW1lbnRZOiBlLm1vdmVtZW50WSxcbiAgICAgICAgICAgICAgb2Zmc2V0WDogZS5vZmZzZXRYLFxuICAgICAgICAgICAgICBvZmZzZXRZOiBlLm9mZnNldFksXG4gICAgICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgICAgICBwYWdlWTogZS5wYWdlWSxcbiAgICAgICAgICAgICAgcGF0aDogZS5wYXRoLFxuICAgICAgICAgICAgICByZWxhdGVkVGFyZ2V0OiBlLnJlbGF0ZWRUYXJnZXQsXG4gICAgICAgICAgICAgIHJldHVyblZhbHVlOiBlLnJldHVyblZhbHVlLFxuICAgICAgICAgICAgICBzY3JlZW5YOiBlLnNjcmVlblgsXG4gICAgICAgICAgICAgIHNjcmVlblk6IGUuc2NyZWVuWSxcbiAgICAgICAgICAgICAgc2hpZnRLZXk6IGUuc2hpZnRLZXksXG4gICAgICAgICAgICAgIHNvdXJjZUNhcGFiaWxpdGllczogZS5zb3VyY2VDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgIHRpbWVTdGFtcDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgICAgICAgIHR5cGU6IGUudHlwZSxcbiAgICAgICAgICAgICAgdmlldzogZS52aWV3LFxuICAgICAgICAgICAgICB3aGljaDogZS53aGljaCxcbiAgICAgICAgICAgICAgeDogZS54LFxuICAgICAgICAgICAgICB5OiBlLnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBldnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGUgcmVndWxhciAnZScgb2JqZWN0IGlzIGVub3VnaCAoaXQgZG9lc24ndCBwb3B1bGF0ZSBhbGwgb2YgdGhlIHNhbWUgZmllbGRzIHRoYW4gYSByZWFsIG1vdXNlIGV2ZW50IGRvZXMsIFxuICAgICAgICAgICAgLy8gc28gdGhpcyBtaWdodCBub3Qgd29yayBvbiBzb21lIGRlbW9zKVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIGJyb3dzZXJcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50TGlzdGVuZXJNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIC8vIERvbid0IGNhbGwgYW55IGFwcGxpY2F0aW9uIHBhZ2UgdW5sb2FkIGhhbmRsZXJzIGFzIGEgcmVzcG9uc2UgdG8gd2luZG93IGJlaW5nIGNsb3NlZC5cbiAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpIHtcbiAgICAvLyBUaGlzIGlzIGEgYml0IHRyaWNreSB0byBtYW5hZ2UsIHNpbmNlIHRoZSBwYWdlIGNvdWxkIHJlZ2lzdGVyIHRoZXNlIGhhbmRsZXJzIGF0IGFueSBwb2ludCxcbiAgICAvLyBzbyBrZWVwIHdhdGNoaW5nIGZvciB0aGVtIGFuZCByZW1vdmUgdGhlbSBpZiBhbnkgYXJlIGFkZGVkLiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgIC8vIGluIGEgc2VtaS1wb2xsaW5nIGZhc2hpb24gdG8gZW5zdXJlIHRoZXNlIGFyZSBub3Qgb3ZlcnJpZGRlbi5cbiAgICBpZiAod2luZG93Lm9uYmVmb3JldW5sb2FkKSB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub251bmxvYWQpIHdpbmRvdy5vbnVubG9hZCA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbmJsdXIpIHdpbmRvdy5vbmJsdXIgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25mb2N1cykgd2luZG93Lm9uZm9jdXMgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlaGlkZSkgd2luZG93Lm9ucGFnZWhpZGUgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlc2hvdykgd2luZG93Lm9ucGFnZXNob3cgPSBudWxsO1xuICB9XG5cbiAgdW5sb2FkQWxsRXZlbnRIYW5kbGVycygpIHtcbiAgICBmb3IodmFyIGkgaW4gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbGlzdGVuZXIuY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLnR5cGUsIGxpc3RlbmVyLmZ1biwgbGlzdGVuZXIudXNlQ2FwdHVyZSk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIFxuICAgIC8vIE1ha2Ugc3VyZSBubyBYSFJzIGFyZSBiZWluZyBoZWxkIG9uIHRvIGVpdGhlci5cbiAgICAvL3ByZWxvYWRlZFhIUnMgPSB7fTtcbiAgICAvL251bVByZWxvYWRYSFJzSW5GbGlnaHQgPSAwO1xuICAgIC8vWE1MSHR0cFJlcXVlc3QgPSByZWFsWE1MSHR0cFJlcXVlc3Q7XG4gIFxuICAgIHRoaXMuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuICB9XG5cbiAgLy9pZiAoaW5qZWN0aW5nSW5wdXRTdHJlYW0pXG4gIGVuYWJsZSgpIHtcblxuICAgIC8vIEZpbHRlciB0aGUgcGFnZSBldmVudCBoYW5kbGVycyB0byBvbmx5IHBhc3MgcHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRvIHRoZSBzaXRlIC0gYWxsIHJlYWwgdXNlciBpbnB1dCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgc2luY2Ugd2UgYXJlXG4gICAgLy8gZG9pbmcgYSBwcm9ncmFtbWF0aWMgcnVuLlxuICAgIHZhciBvdmVycmlkZGVuTWVzc2FnZVR5cGVzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnLFxuICAgICAgJ2NsaWNrJywgJ2RibGNsaWNrJywgJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnLFxuICAgICAgJ3BvaW50ZXJsb2NrY2hhbmdlJywgJ3BvaW50ZXJsb2NrZXJyb3InLCAnd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAnd2Via2l0cG9pbnRlcmxvY2tlcnJvcicsICdtb3pwb2ludGVybG9ja2NoYW5nZScsICdtb3pwb2ludGVybG9ja2Vycm9yJywgJ21zcG9pbnRlcmxvY2tjaGFuZ2UnLCAnbXNwb2ludGVybG9ja2Vycm9yJywgJ29wb2ludGVybG9ja2NoYW5nZScsICdvcG9pbnRlcmxvY2tlcnJvcicsXG4gICAgICAnZGV2aWNlbW90aW9uJywgJ2RldmljZW9yaWVudGF0aW9uJyxcbiAgICAgICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnLFxuICAgICAgJ21vdXNld2hlZWwnLCAnd2hlZWwnLCAnV2hlZWxFdmVudCcsICdET01Nb3VzZVNjcm9sbCcsICdjb250ZXh0bWVudScsXG4gICAgICAnYmx1cicsICdmb2N1cycsICd2aXNpYmlsaXR5Y2hhbmdlJywgJ2JlZm9yZXVubG9hZCcsICd1bmxvYWQnLCAnZXJyb3InLFxuICAgICAgJ3BhZ2VoaWRlJywgJ3BhZ2VzaG93JywgJ29yaWVudGF0aW9uY2hhbmdlJywgJ2dhbWVwYWRjb25uZWN0ZWQnLCAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsXG4gICAgICAnZnVsbHNjcmVlbmNoYW5nZScsICdmdWxsc2NyZWVuZXJyb3InLCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsICdtb3pmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ01TRnVsbHNjcmVlbkNoYW5nZScsICdNU0Z1bGxzY3JlZW5FcnJvcicsICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgJ3dlYmtpdGZ1bGxzY3JlZW5lcnJvcicsXG4gICAgICAndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnLFxuICAgICAgJ3dlYmdsY29udGV4dGxvc3QnLCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLFxuICAgICAgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdwb2ludGVyb3V0JywgJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICd0cmFuc2l0aW9uZW5kJ107XG5cbiAgICAvLyBTb21lIGdhbWUgZGVtb3MgcHJvZ3JhbW1hdGljYWxseSBmaXJlIHRoZSByZXNpemUgZXZlbnQuIEZvciBGaXJlZm94IGFuZCBDaHJvbWUsXG4gICAgLy8gd2UgZGV0ZWN0IHRoaXMgdmlhIGV2ZW50LmlzVHJ1c3RlZCBhbmQga25vdyB0byBjb3JyZWN0bHkgcGFzcyBpdCB0aHJvdWdoLCBidXQgdG8gbWFrZSBTYWZhcmkgaGFwcHksXG4gICAgLy8gaXQncyBqdXN0IGVhc2llciB0byBsZXQgcmVzaXplIGNvbWUgdGhyb3VnaCBmb3IgdGhvc2UgZGVtb3MgdGhhdCBuZWVkIGl0LlxuICAgIC8vIGlmICghTW9kdWxlWydwYWdlTmVlZHNSZXNpemVFdmVudCddKSBvdmVycmlkZGVuTWVzc2FnZVR5cGVzLnB1c2goJ3Jlc2l6ZScpO1xuXG4gICAgLy8gSWYgY29udGV4dCBpcyBzcGVjaWZpZWQsIGFkZEV2ZW50TGlzdGVuZXIgaXMgY2FsbGVkIHVzaW5nIHRoYXQgYXMgdGhlICd0aGlzJyBvYmplY3QuIE90aGVyd2lzZSB0aGUgY3VycmVudCB0aGlzIGlzIHVzZWQuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgdmFyIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT09IC0xIHx8IGRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pXG4gICAgICAgICAgICAmJiAodHlwZS5pbmRleE9mKCdrZXknKSA9PT0gLTEgfHwgZGlzcGF0Y2hLZXlFdmVudHNWaWFET00pO1xuICAgICAgICAgIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKSB7IHRyeSB7IGlmIChlLnByb2dyYW1tYXRpYyB8fCAhZS5pc1RydXN0ZWQpIGxpc3RlbmVyKGUpOyB9IGNhdGNoKGUpIHt9IH07XG4gICAgICAgICAgLy8hISEgdmFyIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgICAgICAgIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZ1bjogZmlsdGVyZWRFdmVudExpc3RlbmVyLFxuICAgICAgICAgICAgdXNlQ2FwdHVyZTogdXNlQ2FwdHVyZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8IHRoaXMsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZnVuOiBsaXN0ZW5lcixcbiAgICAgICAgICAgIHVzZUNhcHR1cmU6IHVzZUNhcHR1cmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVhbFJlbW92ZUV2ZW50TGlzdGVuZXIgPSBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgICAvLyBpZiAocmVnaXN0ZXJMaXN0ZW5lclRvRE9NKVxuICAgICAgICAvL3JlYWxSZW1vdmVFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXTtcbiAgICAgICAgICBpZiAoZXZlbnRMaXN0ZW5lci5jb250ZXh0ID09PSB0aGlzICYmIGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gdHlwZSAmJiBldmVudExpc3RlbmVyLmZ1biA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgRXZlbnRUYXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihFdmVudFRhcmdldC5wcm90b3R5cGUsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKlxuICAgICAgdmFyIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gW3dpbmRvdywgZG9jdW1lbnQsIGRvY3VtZW50LmJvZHksIE1vZHVsZVsnY2FudmFzJ11dO1xuICAgICAgLy8gaWYgKE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmNvbmNhdChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSk7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0sIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldKTtcbiAgICAgIH1cbiAgICAgICovXG4gICAgfVxuICB9ICAgIFxufSIsImNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgZm9udFNpemU6IDE2LFxuICBrZXlTdHJva2VEZWxheTogMjAwLCAvLyBUaW1lIGJlZm9yZSB0aGUgbGluZSBicmVha3NcbiAgbGluZ2VyRGVsYXk6IDEwMDAsIC8vIFRpbWUgYmVmb3JlIHRoZSB0ZXh0IGZhZGVzIGF3YXlcbiAgZmFkZUR1cmF0aW9uOiAxMDAwLFxuICBiZXplbENvbG9yOiAnIzAwMCcsXG4gIHRleHRDb2xvcjogJyNmZmYnLFxuICB1bm1vZGlmaWVkS2V5OiB0cnVlLCAvLyBJZiBwcmVzc2luZyBBbHQrZSBzaG93IGUsIGluc3RlYWQgb2Yg4oKsXG4gIHNob3dTeW1ib2w6IHRydWUsIC8vIENvbnZlcnQgQXJyb3dMZWZ0IG9uIC0+XG4gIGFwcGVuZE1vZGlmaWVyczoge01ldGE6IHRydWUsIEFsdDogdHJ1ZSwgU2hpZnQ6IGZhbHNlfSwgLy8gQXBwZW5kIG1vZGlmaWVyIHRvIGtleSBhbGwgdGhlIHRpbWVcbiAgcG9zaXRpb246ICdib3R0b20tbGVmdCcgLy8gYm90dG9tLWxlZnQsIGJvdHRvbS1yaWdodCwgdG9wLWxlZnQsIHRvcC1yaWdodFxufTtcblxuY2xhc3MgS2V5c3Ryb2tlVmlzdWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5zdHlsZSA9IG51bGw7XG4gICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgdGhpcy5rZXlkb3duID0gdGhpcy5rZXlkb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5rZXl1cCA9IHRoaXMua2V5dXAuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNsZWFuVXAoKSB7XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlbW92ZU5vZGUodGhpcy5jb250YWluZXIpO1xuICAgIHJlbW92ZU5vZGUodGhpcy5zdHlsZSk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5zdHlsZSA9IG51bGw7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBpbmplY3RDb21wb25lbnRzKCkgeyAgICBcbiAgICAvLyBBZGQgY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9ICdrZXlzdHJva2VzJztcbiAgICBcbiAgICBjb25zdCBwb3NpdGlvbnMgPSB7XG4gICAgICAnYm90dG9tLWxlZnQnOiAnYm90dG9tOiAwOyBsZWZ0OiAwOycsXG4gICAgICAnYm90dG9tLXJpZ2h0JzogJ2JvdHRvbTogMDsgcmlnaHQ6IDA7JyxcbiAgICAgICd0b3AtbGVmdCc6ICd0b3A6IDA7IGxlZnQ6IDA7JyxcbiAgICAgICd0b3AtcmlnaHQnOiAndG9wOiAwOyByaWdodDogMDsnLFxuICAgIH07XG5cbiAgICBpZiAoIXBvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dKSB7XG4gICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgcG9zaXRpb24gJyR7dGhpcy5vcHRpb25zLnBvc2l0aW9ufScsIHVzaW5nIGRlZmF1bHQgJ2JvdHRvbS1sZWZ0Jy4gVmFsaWQgcG9zaXRpb25zOiBgLCBPYmplY3Qua2V5cyhwb3NpdGlvbnMpKTtcbiAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9ICdib3R0b20tbGVmdCc7XG4gICAgfVxuXG4gICAgLy8gQWRkIGNsYXNzZXNcbiAgICB0aGlzLnN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLnN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgIHVsLmtleXN0cm9rZXMge1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgJHtwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXX1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdWwua2V5c3Ryb2tlcyBsaSB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGlzLm9wdGlvbnMuYmV6ZWxDb2xvcn07XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgICAgY29sb3I6ICR7dGhpcy5vcHRpb25zLnRleHRDb2xvcn07XG4gICAgICAgIHBhZGRpbmc6IDVweCAxMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIGZvbnQtc2l6ZTogJHt0aGlzLm9wdGlvbnMuZm9udFNpemV9cHg7XG4gICAgICAgIGRpc3BsYXk6IHRhYmxlO1xuICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgfWA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlKTtcbiAgfVxuXG4gIGNvbnZlcnRLZXlUb1N5bWJvbChrZXkpIHtcbiAgICBjb25zdCBjb252ZXJzaW9uQ29tbW9uID0ge1xuICAgICAgJ0Fycm93UmlnaHQnOiAn4oaSJyxcbiAgICAgICdBcnJvd0xlZnQnOiAn4oaQJyxcbiAgICAgICdBcnJvd1VwJzogJ+KGkScsXG4gICAgICAnQXJyb3dEb3duJzogJ+KGkycsXG4gICAgICAnICc6ICfikKMnLFxuICAgICAgJ0VudGVyJzogJ+KGqScsXG4gICAgICAnU2hpZnQnOiAn4oenJyxcbiAgICAgICdTaGlmdFJpZ2h0JzogJ+KHpycsXG4gICAgICAnU2hpZnRMZWZ0JzogJ+KHpycsXG4gICAgICAnQ29udHJvbCc6ICfijIMnLFxuICAgICAgJ1RhYic6ICfihrknLFxuICAgICAgJ0NhcHNMb2NrJzogJ+KHqidcbiAgICB9O1xuXG4gICAgY29uc3QgY29udmVyc2lvbk1hYyA9IHtcbiAgICAgICdBbHQnOiAn4oylJyxcbiAgICAgICdBbHRMZWZ0JzogJ+KMpScsXG4gICAgICAnQWx0UmlnaHQnOiAn4oylJyxcbiAgICAgICdEZWxldGUnOiAn4oymJyxcbiAgICAgICdFc2NhcGUnOiAn4o6LJyxcbiAgICAgICdCYWNrc3BhY2UnOiAn4oyrJyxcbiAgICAgICdNZXRhJzogJ+KMmCcsXG4gICAgICAnVGFiJzogJ+KHpScsXG4gICAgICAnUGFnZURvd24nOiAn4oefJyxcbiAgICAgICdQYWdlVXAnOiAn4oeeJyxcbiAgICAgICdIb21lJzogJ+KGlicsXG4gICAgICAnRW5kJzogJ+KGmCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIChuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgPyBjb252ZXJzaW9uTWFjW2tleV0gOiBudWxsICkgfHwgY29udmVyc2lvbkNvbW1vbltrZXldIHx8IGtleTtcbiAgfVxuXG4gIGtleWRvd24oZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHtcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY3VycmVudENodW5rKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIGtleSA9IGUua2V5O1xuICAgIGlmICh0aGlzLm9wdGlvbnMudW5tb2RpZmllZEtleSkge1xuICAgICAgaWYgKGUuY29kZS5pbmRleE9mKCdLZXknKSAhPT0gLTEpIHtcbiAgICAgICAga2V5ID0gZS5jb2RlLnJlcGxhY2UoJ0tleScsICcnKTtcbiAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW9kaWZpZXIgPSAnJztcbiAgICBcbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5NZXRhICYmIGUubWV0YUtleSAmJiBlLmtleSAhPT0gJ01ldGEnKSB7IG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdNZXRhJyk7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5BbHQgJiYgZS5hbHRLZXkgJiYgZS5rZXkgIT09ICdBbHQnKSB7IG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdBbHQnKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLlNoaWZ0ICYmIGUuc2hpZnRLZXkgJiYgZS5rZXkgIT09ICdTaGlmdCcpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ1NoaWZ0Jyk7IH1cbiAgICB0aGlzLmN1cnJlbnRDaHVuay50ZXh0Q29udGVudCArPSBtb2RpZmllciArICh0aGlzLm9wdGlvbnMuc2hvd1N5bWJvbCA/IHRoaXMuY29udmVydEtleVRvU3ltYm9sKGtleSkgOiBrZXkpO1xuICB9XG5cbiAga2V5dXAoZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHJldHVybjtcbiAgICBcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgKGZ1bmN0aW9uKHByZXZpb3VzQ2h1bmspIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcHJldmlvdXNDaHVuay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtwcmV2aW91c0NodW5rLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNDaHVuayl9LCBvcHRpb25zLmZhZGVEdXJhdGlvbik7XG4gICAgICAgIH0sIG9wdGlvbnMubGluZ2VyRGVsYXkpO1xuICAgICAgfSkodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgICAgXG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgfSwgb3B0aW9ucy5rZXlTdHJva2VEZWxheSk7XG4gIH1cblxuICBlbmFibGUob3B0aW9ucykge1xuICAgIHRoaXMuY2xlYW5VcCgpOyAgICBcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zIHx8IHRoaXMub3B0aW9ucyk7XG4gICAgdGhpcy5pbmplY3RDb21wb25lbnRzKCk7ICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuY2xlYW5VcCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBLZXlzdHJva2VWaXN1YWxpemVyKCk7IiwiaW1wb3J0IEtleXN0cm9rZVZpc3VhbGl6ZXIgZnJvbSAna2V5c3Ryb2tlLXZpc3VhbGl6ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dEhlbHBlcnMge1xuICBpbml0S2V5cygpIHtcbiAgICBLZXlzdHJva2VWaXN1YWxpemVyLmVuYWJsZSh7dW5tb2RpZmllZEtleTogZmFsc2V9KTtcbiAgfVxuXG4gIGluaXRNb3VzZSgpIHtcbiAgICB0aGlzLm1vdXNlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5tb3VzZURpdi5pZD0nbW91c2VkaXYnO1xuICAgIHRoaXMubW91c2VDbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VDbGljay5pZD0nbW91c2VjbGljayc7XG4gICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgIGA7XG5cbiAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGxlZnQ6IDBweDtcbiAgICAgIHRvcDogMHB4O1xuICAgICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcvY3Vyc29yLnN2ZycpO1xuICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogLThweCAtNXB4O1xuICAgICAgei1pbmRleDogOTk5OTtcbiAgICBgO1xuICAgIFxuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZURpdik7XG4gICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1vdXNlQ2xpY2spO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS5sZWZ0ID0gZXZ0LnggKyBcInB4XCI7XG4gICAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLnRvcCA9IGV2dC55ICsgXCJweFwiO1xuXG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUubGVmdCA9IGAke2V2dC54IC0gMTJ9cHhgO1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnRvcCA9IGAke2V2dC55IC0gN31weGA7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgfSk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIH0pO1xuXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoY2FudmFzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3cta2V5cycpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0S2V5cygpO1xuICAgIH1cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2hvdy1tb3VzZScpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0TW91c2UoKTtcbiAgICB9XG4gIH1cbn0iLCJ2YXIgQ29udGV4dCA9IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgPyB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IDogd2luZG93LkF1ZGlvQ29udGV4dDtcbnZhciBvcmlEZWNvZGVEYXRhID0gQ29udGV4dC5wcm90b3R5cGUuZGVjb2RlQXVkaW9EYXRhO1xuXG52YXIgV2ViQXVkaW9Ib29rID0ge1xuICBzdGF0czoge1xuICAgIG51bUF1ZGlvQnVmZmVyczogMCxcbiAgICB0b3RhbER1cmF0aW9uOiAwLFxuICAgIHRvdGFsTGVuZ3RoOiAwLFxuICAgIHRvdGFsRGVjb2RlVGltZTogMFxuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uIChmYWtlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIENvbnRleHQucHJvdG90eXBlLmRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByZXYgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBpZiAoZmFrZSkge1xuICAgICAgICB2YXIgcmV0ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxEZWNvZGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHByZXY7XG4gICAgICAgICAgcmVzb2x2ZShuZXcgQXVkaW9CdWZmZXIoe2xlbmd0aDogMSwgc2FtcGxlUmF0ZTogNDQxMDB9KSk7XG4gICAgICAgICAgc2VsZi5zdGF0cy5udW1BdWRpb0J1ZmZlcnMrKztcbiAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsRHVyYXRpb24gKz0gYXVkaW9CdWZmZXIuZHVyYXRpb247XG4gICAgICAgICAgc2VsZi5zdGF0cy50b3RhbExlbmd0aCArPSBhdWRpb0J1ZmZlci5sZW5ndGg7XG4gICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gb3JpRGVjb2RlRGF0YS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB2YXIgcmV0ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHByb21pc2UudGhlbihhdWRpb0J1ZmZlciA9PiB7XG4gICAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsRGVjb2RlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwcmV2O1xuICAgICAgICAgICAgcmVzb2x2ZShhdWRpb0J1ZmZlcik7XG4gICAgICAgICAgICBzZWxmLnN0YXRzLm51bUF1ZGlvQnVmZmVycysrO1xuICAgICAgICAgICAgc2VsZi5zdGF0cy50b3RhbER1cmF0aW9uICs9IGF1ZGlvQnVmZmVyLmR1cmF0aW9uO1xuICAgICAgICAgICAgc2VsZi5zdGF0cy50b3RhbExlbmd0aCArPSBhdWRpb0J1ZmZlci5sZW5ndGg7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG4gIH0sXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBDb250ZXh0LnByb3RvdHlwZS5kZWNvZGVBdWRpb0RhdGEgPSBvcmlEZWNvZGVEYXRhO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBXZWJBdWRpb0hvb2s7IiwidmFyIFdlYlZSSG9vayA9IHtcbiAgb3JpZ2luYWw6IHtcbiAgICBnZXRWUkRpc3BsYXlzOiBudWxsLFxuICAgIGFkZEV2ZW50TGlzdGVuZXI6IG51bGxcbiAgfSxcbiAgY3VycmVudFZSRGlzcGxheTogbnVsbCxcbiAgYXV4RnJhbWVEYXRhOiAoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmICdWUkZyYW1lRGF0YScgaW4gd2luZG93ICkgPyBuZXcgd2luZG93LlZSRnJhbWVEYXRhKCkgOiBudWxsLFxuICBlbmFibGU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGlmIChuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cykge1xuICAgICAgdGhpcy5pbml0RXZlbnRMaXN0ZW5lcnMoKTtcbiAgICAgIHZhciBvcmlnZXRWUkRpc3BsYXlzID0gdGhpcy5vcmlnaW5hbC5nZXRWUkRpc3BsYXlzID0gbmF2aWdhdG9yLmdldFZSRGlzcGxheXM7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gb3JpZ2V0VlJEaXNwbGF5cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICByZXN1bHQudGhlbihkaXNwbGF5cyA9PiB7XG4gICAgICAgICAgICB2YXIgbmV3RGlzcGxheXMgPSBbXTtcbiAgICAgICAgICAgIGRpc3BsYXlzLmZvckVhY2goZGlzcGxheSA9PiB7XG4gICAgICAgICAgICAgIHZhciBuZXdEaXNwbGF5ID0gc2VsZi5ob29rVlJEaXNwbGF5KGRpc3BsYXkpO1xuICAgICAgICAgICAgICBuZXdEaXNwbGF5cy5wdXNoKG5ld0Rpc3BsYXkpO1xuICAgICAgICAgICAgICBjYWxsYmFjayhuZXdEaXNwbGF5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzb2x2ZShuZXdEaXNwbGF5cyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7fSxcbiAgaW5pdEV2ZW50TGlzdGVuZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5vcmlnaW5hbC5hZGRFdmVudExpc3RlbmVyID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGV2ZW50c0ZpbHRlciA9IFsndnJkaXNwbGF5cHJlc2VudGNoYW5nZScsICd2cmRpc3BsYXljb25uZWN0J107XG4gICAgICBpZiAoZXZlbnRzRmlsdGVyLmluZGV4T2YoYXJndW1lbnRzWzBdKSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIG9sZENhbGxiYWNrID0gYXJndW1lbnRzWzFdO1xuICAgICAgICBhcmd1bWVudHNbMV0gPSBldmVudCA9PiB7XG4gICAgICAgICAgc2VsZi5ob29rVlJEaXNwbGF5KGV2ZW50LmRpc3BsYXkpO1xuICAgICAgICAgIG9sZENhbGxiYWNrKGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSBzZWxmLm9yaWdpbmFsLmFkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH0sXG4gIGhvb2tWUkRpc3BsYXk6IGZ1bmN0aW9uIChkaXNwbGF5KSB7XG4gICAgLy8gVG9kbyBtb2RpZnkgdGhlIFZSRGlzcGxheSBpZiBuZWVkZWQgZm9yIGZyYW1lZGF0YSBhbmQgc28gb25cbiAgICByZXR1cm4gZGlzcGxheTtcbiAgICAgIC8qXG4gICAgdmFyIG9sZEdldEZyYW1lRGF0YSA9IGRpc3BsYXkuZ2V0RnJhbWVEYXRhLmJpbmQoZGlzcGxheSk7XG4gICAgZGlzcGxheS5nZXRGcmFtZURhdGEgPSBmdW5jdGlvbihmcmFtZURhdGEpIHtcblxuICAgICAgb2xkR2V0RnJhbWVEYXRhKGZyYW1lRGF0YSk7XG4gIC8qXG4gICAgICB2YXIgbSA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cbiAgICAgIHZhciB4ID0gTWF0aC5zaW4ocGVyZm9ybWFuY2Uubm93KCkvMTAwMCk7XG4gICAgICB2YXIgeSA9IE1hdGguc2luKHBlcmZvcm1hbmNlLm5vdygpLzUwMCktMS4yO1xuXG4gICAgICBtLm1ha2VUcmFuc2xhdGlvbih4LHksLTAuNSk7XG4gICAgICB2YXIgcG9zaXRpb24gPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgdmFyIHNjYWxlID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgIHZhciBxdWF0ID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcbiAgICAgIG0uZGVjb21wb3NlKHBvc2l0aW9uLHF1YXQsc2NhbGUpO1xuXG4gICAgICBmcmFtZURhdGEucG9zZS5wb3NpdGlvblswXSA9IC1wb3NpdGlvbi54O1xuICAgICAgZnJhbWVEYXRhLnBvc2UucG9zaXRpb25bMV0gPSAtcG9zaXRpb24ueTtcbiAgICAgIGZyYW1lRGF0YS5wb3NlLnBvc2l0aW9uWzJdID0gLXBvc2l0aW9uLno7XG5cbiAgICAgIGZvciAodmFyIGk9MDtpPDM7aSsrKSB7XG4gICAgICAgIGZyYW1lRGF0YS5wb3NlLm9yaWVudGF0aW9uW2ldID0gMDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgIGZyYW1lRGF0YS5sZWZ0Vmlld01hdHJpeFtpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICAgIGZyYW1lRGF0YS5yaWdodFZpZXdNYXRyaXhbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgfVxuICAgIC8qXG4gICAgICBmb3IgKHZhciBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgbGVmdFZpZXdNYXRyaXhbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgICBmcmFtZURhdGEucmlnaHRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgIH1cbiAgICAgIC8vIGNhbWVyYS5tYXRyaXhXb3JsZC5kZWNvbXBvc2UoIGNhbWVyYUwucG9zaXRpb24sIGNhbWVyYUwucXVhdGVybmlvbiwgY2FtZXJhTC5zY2FsZSApO1xuICAgIH1cbiAgICAqL1xuICB9XG59O1xuZXhwb3J0IGRlZmF1bHQgV2ViVlJIb29rOyIsImZ1bmN0aW9uIG5lYXJlc3ROZWlnaGJvciAoc3JjLCBkc3QpIHtcbiAgbGV0IHBvcyA9IDBcblxuICBmb3IgKGxldCB5ID0gMDsgeSA8IGRzdC5oZWlnaHQ7IHkrKykge1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgZHN0LndpZHRoOyB4KyspIHtcbiAgICAgIGNvbnN0IHNyY1ggPSBNYXRoLmZsb29yKHggKiBzcmMud2lkdGggLyBkc3Qud2lkdGgpXG4gICAgICBjb25zdCBzcmNZID0gTWF0aC5mbG9vcih5ICogc3JjLmhlaWdodCAvIGRzdC5oZWlnaHQpXG5cbiAgICAgIGxldCBzcmNQb3MgPSAoKHNyY1kgKiBzcmMud2lkdGgpICsgc3JjWCkgKiA0XG5cbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBSXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gR1xuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEJcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBBXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNpemVJbWFnZURhdGEoc3JjSW1hZ2VEYXRhLCBuZXdJbWFnZURhdGEpIHtcbiAgbmVhcmVzdE5laWdoYm9yKHNyY0ltYWdlRGF0YSwgbmV3SW1hZ2VEYXRhKTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gcGl4ZWxtYXRjaDtcblxuZnVuY3Rpb24gcGl4ZWxtYXRjaChpbWcxLCBpbWcyLCBvdXRwdXQsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbnMpIHtcblxuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gICAgdmFyIHRocmVzaG9sZCA9IG9wdGlvbnMudGhyZXNob2xkID09PSB1bmRlZmluZWQgPyAwLjEgOiBvcHRpb25zLnRocmVzaG9sZDtcblxuICAgIC8vIG1heGltdW0gYWNjZXB0YWJsZSBzcXVhcmUgZGlzdGFuY2UgYmV0d2VlbiB0d28gY29sb3JzO1xuICAgIC8vIDM1MjE1IGlzIHRoZSBtYXhpbXVtIHBvc3NpYmxlIHZhbHVlIGZvciB0aGUgWUlRIGRpZmZlcmVuY2UgbWV0cmljXG4gICAgdmFyIG1heERlbHRhID0gMzUyMTUgKiB0aHJlc2hvbGQgKiB0aHJlc2hvbGQsXG4gICAgICAgIGRpZmYgPSAwO1xuXG4gICAgLy8gY29tcGFyZSBlYWNoIHBpeGVsIG9mIG9uZSBpbWFnZSBhZ2FpbnN0IHRoZSBvdGhlciBvbmVcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuXG4gICAgICAgICAgICB2YXIgcG9zID0gKHkgKiB3aWR0aCArIHgpICogNDtcblxuICAgICAgICAgICAgLy8gc3F1YXJlZCBZVVYgZGlzdGFuY2UgYmV0d2VlbiBjb2xvcnMgYXQgdGhpcyBwaXhlbCBwb3NpdGlvblxuICAgICAgICAgICAgdmFyIGRlbHRhID0gY29sb3JEZWx0YShpbWcxLCBpbWcyLCBwb3MsIHBvcyk7XG5cbiAgICAgICAgICAgIC8vIHRoZSBjb2xvciBkaWZmZXJlbmNlIGlzIGFib3ZlIHRoZSB0aHJlc2hvbGRcbiAgICAgICAgICAgIGlmIChkZWx0YSA+IG1heERlbHRhKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgaXQncyBhIHJlYWwgcmVuZGVyaW5nIGRpZmZlcmVuY2Ugb3IganVzdCBhbnRpLWFsaWFzaW5nXG4gICAgICAgICAgICAgICAgaWYgKCFvcHRpb25zLmluY2x1ZGVBQSAmJiAoYW50aWFsaWFzZWQoaW1nMSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgaW1nMikgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW50aWFsaWFzZWQoaW1nMiwgeCwgeSwgd2lkdGgsIGhlaWdodCwgaW1nMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG9uZSBvZiB0aGUgcGl4ZWxzIGlzIGFudGktYWxpYXNpbmc7IGRyYXcgYXMgeWVsbG93IGFuZCBkbyBub3QgY291bnQgYXMgZGlmZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0KSBkcmF3UGl4ZWwob3V0cHV0LCBwb3MsIDI1NSwgMjU1LCAwKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGZvdW5kIHN1YnN0YW50aWFsIGRpZmZlcmVuY2Ugbm90IGNhdXNlZCBieSBhbnRpLWFsaWFzaW5nOyBkcmF3IGl0IGFzIHJlZFxuICAgICAgICAgICAgICAgICAgICBpZiAob3V0cHV0KSBkcmF3UGl4ZWwob3V0cHV0LCBwb3MsIDI1NSwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGRpZmYrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgLy8gcGl4ZWxzIGFyZSBzaW1pbGFyOyBkcmF3IGJhY2tncm91bmQgYXMgZ3JheXNjYWxlIGltYWdlIGJsZW5kZWQgd2l0aCB3aGl0ZVxuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBibGVuZChncmF5UGl4ZWwoaW1nMSwgcG9zKSwgMC4xKTtcbiAgICAgICAgICAgICAgICBkcmF3UGl4ZWwob3V0cHV0LCBwb3MsIHZhbCwgdmFsLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIHRoZSBudW1iZXIgb2YgZGlmZmVyZW50IHBpeGVsc1xuICAgIHJldHVybiBkaWZmO1xufVxuXG4vLyBjaGVjayBpZiBhIHBpeGVsIGlzIGxpa2VseSBhIHBhcnQgb2YgYW50aS1hbGlhc2luZztcbi8vIGJhc2VkIG9uIFwiQW50aS1hbGlhc2VkIFBpeGVsIGFuZCBJbnRlbnNpdHkgU2xvcGUgRGV0ZWN0b3JcIiBwYXBlciBieSBWLiBWeXNuaWF1c2thcywgMjAwOVxuXG5mdW5jdGlvbiBhbnRpYWxpYXNlZChpbWcsIHgxLCB5MSwgd2lkdGgsIGhlaWdodCwgaW1nMikge1xuICAgIHZhciB4MCA9IE1hdGgubWF4KHgxIC0gMSwgMCksXG4gICAgICAgIHkwID0gTWF0aC5tYXgoeTEgLSAxLCAwKSxcbiAgICAgICAgeDIgPSBNYXRoLm1pbih4MSArIDEsIHdpZHRoIC0gMSksXG4gICAgICAgIHkyID0gTWF0aC5taW4oeTEgKyAxLCBoZWlnaHQgLSAxKSxcbiAgICAgICAgcG9zID0gKHkxICogd2lkdGggKyB4MSkgKiA0LFxuICAgICAgICB6ZXJvZXMgPSAwLFxuICAgICAgICBwb3NpdGl2ZXMgPSAwLFxuICAgICAgICBuZWdhdGl2ZXMgPSAwLFxuICAgICAgICBtaW4gPSAwLFxuICAgICAgICBtYXggPSAwLFxuICAgICAgICBtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZO1xuXG4gICAgLy8gZ28gdGhyb3VnaCA4IGFkamFjZW50IHBpeGVsc1xuICAgIGZvciAodmFyIHggPSB4MDsgeCA8PSB4MjsgeCsrKSB7XG4gICAgICAgIGZvciAodmFyIHkgPSB5MDsgeSA8PSB5MjsgeSsrKSB7XG4gICAgICAgICAgICBpZiAoeCA9PT0geDEgJiYgeSA9PT0geTEpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBicmlnaHRuZXNzIGRlbHRhIGJldHdlZW4gdGhlIGNlbnRlciBwaXhlbCBhbmQgYWRqYWNlbnQgb25lXG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBjb2xvckRlbHRhKGltZywgaW1nLCBwb3MsICh5ICogd2lkdGggKyB4KSAqIDQsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBjb3VudCB0aGUgbnVtYmVyIG9mIGVxdWFsLCBkYXJrZXIgYW5kIGJyaWdodGVyIGFkamFjZW50IHBpeGVsc1xuICAgICAgICAgICAgaWYgKGRlbHRhID09PSAwKSB6ZXJvZXMrKztcbiAgICAgICAgICAgIGVsc2UgaWYgKGRlbHRhIDwgMCkgbmVnYXRpdmVzKys7XG4gICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA+IDApIHBvc2l0aXZlcysrO1xuXG4gICAgICAgICAgICAvLyBpZiBmb3VuZCBtb3JlIHRoYW4gMiBlcXVhbCBzaWJsaW5ncywgaXQncyBkZWZpbml0ZWx5IG5vdCBhbnRpLWFsaWFzaW5nXG4gICAgICAgICAgICBpZiAoemVyb2VzID4gMikgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoIWltZzIpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyByZW1lbWJlciB0aGUgZGFya2VzdCBwaXhlbFxuICAgICAgICAgICAgaWYgKGRlbHRhIDwgbWluKSB7XG4gICAgICAgICAgICAgICAgbWluID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgbWluWCA9IHg7XG4gICAgICAgICAgICAgICAgbWluWSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0aGUgYnJpZ2h0ZXN0IHBpeGVsXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiBtYXgpIHtcbiAgICAgICAgICAgICAgICBtYXggPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBtYXhYID0geDtcbiAgICAgICAgICAgICAgICBtYXhZID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghaW1nMikgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBpZiB0aGVyZSBhcmUgbm8gYm90aCBkYXJrZXIgYW5kIGJyaWdodGVyIHBpeGVscyBhbW9uZyBzaWJsaW5ncywgaXQncyBub3QgYW50aS1hbGlhc2luZ1xuICAgIGlmIChuZWdhdGl2ZXMgPT09IDAgfHwgcG9zaXRpdmVzID09PSAwKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBpZiBlaXRoZXIgdGhlIGRhcmtlc3Qgb3IgdGhlIGJyaWdodGVzdCBwaXhlbCBoYXMgbW9yZSB0aGFuIDIgZXF1YWwgc2libGluZ3MgaW4gYm90aCBpbWFnZXNcbiAgICAvLyAoZGVmaW5pdGVseSBub3QgYW50aS1hbGlhc2VkKSwgdGhpcyBwaXhlbCBpcyBhbnRpLWFsaWFzZWRcbiAgICByZXR1cm4gKCFhbnRpYWxpYXNlZChpbWcsIG1pblgsIG1pblksIHdpZHRoLCBoZWlnaHQpICYmICFhbnRpYWxpYXNlZChpbWcyLCBtaW5YLCBtaW5ZLCB3aWR0aCwgaGVpZ2h0KSkgfHxcbiAgICAgICAgICAgKCFhbnRpYWxpYXNlZChpbWcsIG1heFgsIG1heFksIHdpZHRoLCBoZWlnaHQpICYmICFhbnRpYWxpYXNlZChpbWcyLCBtYXhYLCBtYXhZLCB3aWR0aCwgaGVpZ2h0KSk7XG59XG5cbi8vIGNhbGN1bGF0ZSBjb2xvciBkaWZmZXJlbmNlIGFjY29yZGluZyB0byB0aGUgcGFwZXIgXCJNZWFzdXJpbmcgcGVyY2VpdmVkIGNvbG9yIGRpZmZlcmVuY2Vcbi8vIHVzaW5nIFlJUSBOVFNDIHRyYW5zbWlzc2lvbiBjb2xvciBzcGFjZSBpbiBtb2JpbGUgYXBwbGljYXRpb25zXCIgYnkgWS4gS290c2FyZW5rbyBhbmQgRi4gUmFtb3NcblxuZnVuY3Rpb24gY29sb3JEZWx0YShpbWcxLCBpbWcyLCBrLCBtLCB5T25seSkge1xuICAgIHZhciBhMSA9IGltZzFbayArIDNdIC8gMjU1LFxuICAgICAgICBhMiA9IGltZzJbbSArIDNdIC8gMjU1LFxuXG4gICAgICAgIHIxID0gYmxlbmQoaW1nMVtrICsgMF0sIGExKSxcbiAgICAgICAgZzEgPSBibGVuZChpbWcxW2sgKyAxXSwgYTEpLFxuICAgICAgICBiMSA9IGJsZW5kKGltZzFbayArIDJdLCBhMSksXG5cbiAgICAgICAgcjIgPSBibGVuZChpbWcyW20gKyAwXSwgYTIpLFxuICAgICAgICBnMiA9IGJsZW5kKGltZzJbbSArIDFdLCBhMiksXG4gICAgICAgIGIyID0gYmxlbmQoaW1nMlttICsgMl0sIGEyKSxcblxuICAgICAgICB5ID0gcmdiMnkocjEsIGcxLCBiMSkgLSByZ2IyeShyMiwgZzIsIGIyKTtcblxuICAgIGlmICh5T25seSkgcmV0dXJuIHk7IC8vIGJyaWdodG5lc3MgZGlmZmVyZW5jZSBvbmx5XG5cbiAgICB2YXIgaSA9IHJnYjJpKHIxLCBnMSwgYjEpIC0gcmdiMmkocjIsIGcyLCBiMiksXG4gICAgICAgIHEgPSByZ2IycShyMSwgZzEsIGIxKSAtIHJnYjJxKHIyLCBnMiwgYjIpO1xuXG4gICAgcmV0dXJuIDAuNTA1MyAqIHkgKiB5ICsgMC4yOTkgKiBpICogaSArIDAuMTk1NyAqIHEgKiBxO1xufVxuXG5mdW5jdGlvbiByZ2IyeShyLCBnLCBiKSB7IHJldHVybiByICogMC4yOTg4OTUzMSArIGcgKiAwLjU4NjYyMjQ3ICsgYiAqIDAuMTE0NDgyMjM7IH1cbmZ1bmN0aW9uIHJnYjJpKHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjU5NTk3Nzk5IC0gZyAqIDAuMjc0MTc2MTAgLSBiICogMC4zMjE4MDE4OTsgfVxuZnVuY3Rpb24gcmdiMnEociwgZywgYikgeyByZXR1cm4gciAqIDAuMjExNDcwMTcgLSBnICogMC41MjI2MTcxMSArIGIgKiAwLjMxMTE0Njk0OyB9XG5cbi8vIGJsZW5kIHNlbWktdHJhbnNwYXJlbnQgY29sb3Igd2l0aCB3aGl0ZVxuZnVuY3Rpb24gYmxlbmQoYywgYSkge1xuICAgIHJldHVybiAyNTUgKyAoYyAtIDI1NSkgKiBhO1xufVxuXG5mdW5jdGlvbiBkcmF3UGl4ZWwob3V0cHV0LCBwb3MsIHIsIGcsIGIpIHtcbiAgICBvdXRwdXRbcG9zICsgMF0gPSByO1xuICAgIG91dHB1dFtwb3MgKyAxXSA9IGc7XG4gICAgb3V0cHV0W3BvcyArIDJdID0gYjtcbiAgICBvdXRwdXRbcG9zICsgM10gPSAyNTU7XG59XG5cbmZ1bmN0aW9uIGdyYXlQaXhlbChpbWcsIGkpIHtcbiAgICB2YXIgYSA9IGltZ1tpICsgM10gLyAyNTUsXG4gICAgICAgIHIgPSBibGVuZChpbWdbaSArIDBdLCBhKSxcbiAgICAgICAgZyA9IGJsZW5kKGltZ1tpICsgMV0sIGEpLFxuICAgICAgICBiID0gYmxlbmQoaW1nW2kgKyAyXSwgYSk7XG4gICAgcmV0dXJuIHJnYjJ5KHIsIGcsIGIpO1xufVxuIiwiaW1wb3J0IFN0YXRzIGZyb20gJ2luY3JlbWVudGFsLXN0YXRzLWxpdGUnO1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFdlYkdMU3RhdHMgKCkge1xuXG4gIHZhciBkYXRhID0ge1xuICAgIG51bURyYXdDYWxsczogMCxcblxuICAgIG51bURyYXdBcnJheXNDYWxsczowLFxuICAgIG51bURyYXdBcnJheXNJbnN0YW5jZWRDYWxsczowLFxuICAgIG51bURyYXdFbGVtZW50c0NhbGxzOjAsXG4gICAgbnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHM6IDAsXG5cbiAgICBudW1Vc2VQcm9ncmFtQ2FsbHM6MCxcbiAgICBudW1GYWNlczowLFxuICAgIG51bVZlcnRpY2VzOjAsXG4gICAgbnVtUG9pbnRzOjAsXG4gICAgbnVtQmluZFRleHR1cmVzOjBcbiAgfVxuXG4gIHZhciBzdGF0cyA9IHtcbiAgICBkcmF3Q2FsbHM6IG5ldyBTdGF0cygpLFxuICAgIHVzZVByb2dyYW1DYWxsczogbmV3IFN0YXRzKCksXG4gICAgZmFjZXM6IG5ldyBTdGF0cygpLFxuICAgIHZlcnRpY2VzOiBuZXcgU3RhdHMoKSxcbiAgICBiaW5kVGV4dHVyZXM6IG5ldyBTdGF0cygpXG4gIH07XG5cbiAgZnVuY3Rpb24gZnJhbWVFbmQoKSB7XG4gICAgZm9yIChsZXQgc3RhdCBpbiBzdGF0cykge1xuICAgICAgdmFyIGNvdW50ZXJOYW1lID0gJ251bScgKyBzdGF0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RhdC5zbGljZSgxKTtcbiAgICAgIHN0YXRzW3N0YXRdLnVwZGF0ZShkYXRhW2NvdW50ZXJOYW1lXSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gX2ggKCBmLCBjICkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGMuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgICBmLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICB9O1xuICB9XG4gIFxuICBpZiAoJ1dlYkdMMlJlbmRlcmluZ0NvbnRleHQnIGluIHdpbmRvdykge1xuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXNJbnN0YW5jZWQgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5c0luc3RhbmNlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG5cbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHNJbnN0YW5jZWQgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzSW5zdGFuY2VkLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0pO1xuXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cyA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdBcnJheXNDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9ICk7XG4gICAgXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3RWxlbWVudHNDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGRhdGEubnVtRmFjZXMgKz0gYXJndW1lbnRzWyAxIF0gLyAzO1xuICAgICAgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDEgXTtcbiAgICB9ICk7XG4gICAgXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bVVzZVByb2dyYW1DYWxscysrO1xuICAgIH0gKTtcbiAgICBcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1CaW5kVGV4dHVyZXMrKztcbiAgICB9ICk7XG4gIFxuICB9XG5cbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cyA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMsIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bURyYXdBcnJheXNDYWxscysrO1xuICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgfSApO1xuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bURyYXdFbGVtZW50c0NhbGxzKys7XG4gICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICBkYXRhLm51bUZhY2VzICs9IGFyZ3VtZW50c1sgMSBdIC8gMztcbiAgICBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMSBdO1xuICB9ICk7XG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0gPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1Vc2VQcm9ncmFtQ2FsbHMrKztcbiAgfSApO1xuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1CaW5kVGV4dHVyZXMrKztcbiAgfSApO1xuICBcbiAgZnVuY3Rpb24gZnJhbWVTdGFydCAoKSB7XG4gICAgZGF0YS5udW1EcmF3Q2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0FycmF5c0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdBcnJheXNJbnN0YW5jZWRDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3RWxlbWVudHNDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxscyA9IDA7XG4gICAgZGF0YS5udW1Vc2VQcm9ncmFtQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRmFjZXMgPSAwO1xuICAgIGRhdGEubnVtVmVydGljZXMgPSAwO1xuICAgIGRhdGEubnVtUG9pbnRzID0gMDtcbiAgICBkYXRhLm51bUJpbmRUZXh0dXJlcyA9IDA7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KSB7XG4gICAgdmFyIGV4dCA9IGNvbnRleHQuZ2V0RXh0ZW5zaW9uKCdBTkdMRV9pbnN0YW5jZWRfYXJyYXlzJyk7XG4gICAgaWYgKCFleHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdBcnJheXNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcbiAgXG4gICAgZXh0LmRyYXdFbGVtZW50c0luc3RhbmNlZEFOR0xFID0gX2goIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFN1bW1hcnkoKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIE9iamVjdC5rZXlzKHN0YXRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICByZXN1bHRba2V5XSA9IHtcbiAgICAgICAgbWluOiBzdGF0c1trZXldLm1pbixcbiAgICAgICAgbWF4OiBzdGF0c1trZXldLm1heCxcbiAgICAgICAgYXZnOiBzdGF0c1trZXldLm1lYW4sXG4gICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogc3RhdHNba2V5XS5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBcbiAgcmV0dXJuIHtcbiAgICBnZXRDdXJyZW50RGF0YTogKCkgPT4ge3JldHVybiBkYXRhO30sXG4gICAgc2V0dXBFeHRlbnNpb25zOiBzZXR1cEV4dGVuc2lvbnMsXG4gICAgZ2V0U3VtbWFyeTogZ2V0U3VtbWFyeSxcbiAgICBmcmFtZVN0YXJ0OiBmcmFtZVN0YXJ0LFxuICAgIGZyYW1lRW5kOiBmcmFtZUVuZFxuICAgIFxuICAgIC8vZW5hYmxlOiBlbmFibGUsXG4gICAgLy9kaXNhYmxlOiBkaXNhYmxlXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2ViR0xTdGF0cygpOyIsImltcG9ydCBGYWtlVGltZXJzIGZyb20gJ2Zha2UtdGltZXJzJztcbmltcG9ydCBDYW52YXNIb29rIGZyb20gJ2NhbnZhcy1ob29rJztcbmltcG9ydCBQZXJmU3RhdHMgZnJvbSAncGVyZm9ybWFuY2Utc3RhdHMnO1xuaW1wb3J0IHNlZWRyYW5kb20gZnJvbSAnc2VlZHJhbmRvbSc7XG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCB7SW5wdXRSZWNvcmRlciwgSW5wdXRSZXBsYXllcn0gZnJvbSAnaW5wdXQtZXZlbnRzLXJlY29yZGVyJztcbmltcG9ydCBFdmVudExpc3RlbmVyTWFuYWdlciBmcm9tICcuL2V2ZW50LWxpc3RlbmVycyc7XG5pbXBvcnQgSW5wdXRIZWxwZXJzIGZyb20gJy4vaW5wdXQtaGVscGVycyc7XG5pbXBvcnQgV2ViQXVkaW9Ib29rIGZyb20gJy4vd2ViYXVkaW8taG9vayc7XG5pbXBvcnQgV2ViVlJIb29rIGZyb20gJy4vd2VidnItaG9vayc7XG5pbXBvcnQge3Jlc2l6ZUltYWdlRGF0YX0gZnJvbSAnLi9pbWFnZS11dGlscyc7XG5pbXBvcnQgcGl4ZWxtYXRjaCBmcm9tICdwaXhlbG1hdGNoJztcbmltcG9ydCBXZWJHTFN0YXRzIGZyb20gJ3dlYmdsLXN0YXRzJztcblxuY29uc3QgcGFyYW1ldGVycyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaCk7XG5cbmZ1bmN0aW9uIG9uUmVhZHkoY2FsbGJhY2spIHtcbiAgaWYgKFxuICAgIGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwiY29tcGxldGVcIiB8fFxuICAgIChkb2N1bWVudC5yZWFkeVN0YXRlICE9PSBcImxvYWRpbmdcIiAmJiAhZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRvU2Nyb2xsKVxuICApIHtcbiAgICBjYWxsYmFjaygpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGNhbGxiYWNrKTtcbiAgfVxufVxuXG5cbi8vIEhhY2tzIHRvIGZpeCBzb21lIFVuaXR5IGRlbW9zXG5jb25zb2xlLmxvZ0Vycm9yID0gKG1zZykgPT4gY29uc29sZS5lcnJvcihtc2cpO1xuXG53aW5kb3cuVEVTVEVSID0ge1xuICByZWFkeTogZmFsc2UsXG4gIGlucHV0TG9hZGluZzogZmFsc2UsXG5cbiAgLy8gQ3VycmVudGx5IGV4ZWN1dGluZyBmcmFtZS5cbiAgcmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOiAwLFxuICBmaXJzdEZyYW1lVGltZTogbnVsbCxcbiAgLy8gSWYgLTEsIHdlIGFyZSBub3QgcnVubmluZyBhbiBldmVudC4gT3RoZXJ3aXNlIHJlcHJlc2VudHMgdGhlIHdhbGxjbG9jayB0aW1lIG9mIHdoZW4gd2UgZXhpdGVkIHRoZSBsYXN0IGV2ZW50IGhhbmRsZXIuXG4gIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTogLTEsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZGVub3Rpbmcgd2hlbiB0aGUgcGFnZSBoYXMgZmluaXNoZWQgbG9hZGluZy5cbiAgcGFnZUxvYWRUaW1lOiBudWxsLFxuXG4gIC8vIEhvbGRzIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtc2VjcyB0aGF0IHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIGZyYW1lIHRvb2suIFVzZWQgdG8gZXN0aW1hdGUgd2hlbiBhIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIChmYXN0IGZyYW1lIGZvbGxvd2VkIGJ5IGEgc2xvdyBmcmFtZSlcbiAgbGFzdEZyYW1lRHVyYXRpb246IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHRoZSBwcmV2aW91cyBmcmFtZSBmaW5pc2hlZC5cbiAgbGFzdEZyYW1lVGljazogLTEsXG5cbiAgYWNjdW11bGF0ZWRDcHVJZGxlVGltZTogMCxcblxuICAvLyBLZWVwcyB0cmFjayBvZiBwZXJmb3JtYW5jZSBzdHV0dGVyIGV2ZW50cy4gQSBzdHV0dGVyIGV2ZW50IG9jY3VycyB3aGVuIHRoZXJlIGlzIGEgaGljY3VwIGluIHN1YnNlcXVlbnQgcGVyLWZyYW1lIHRpbWVzLiAoZmFzdCBmb2xsb3dlZCBieSBzbG93KVxuICBudW1TdHV0dGVyRXZlbnRzOiAwLFxuXG4gIG51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGU6IDEyMCwgLy8gUmVxdWlyZSAxMjAgZnJhbWVzIGkuZS4gfjIgc2Vjb25kcyBvZiBjb25zZWN1dGl2ZSBzbW9vdGggc3R1dHRlciBmcmVlIGZyYW1lcyB0byBjb25jbHVkZSB3ZSBoYXZlIHJlYWNoZWQgYSBzdGFibGUgYW5pbWF0aW9uIHJhdGVcblxuICAvLyBNZWFzdXJlIGEgXCJ0aW1lIHVudGlsIHNtb290aCBmcmFtZSByYXRlXCIgcXVhbnRpdHksIGkuZS4gdGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd2UgY29uc2lkZXIgdGhlIHN0YXJ0dXAgSklUIGFuZCBHQyBlZmZlY3RzIHRvIGhhdmUgc2V0dGxlZC5cbiAgLy8gVGhpcyBmaWVsZCB0cmFja3MgaG93IG1hbnkgY29uc2VjdXRpdmUgZnJhbWVzIGhhdmUgcnVuIHNtb290aGx5LiBUaGlzIHZhcmlhYmxlIGlzIHNldCB0byAtMSB3aGVuIHNtb290aCBmcmFtZSByYXRlIGhhcyBiZWVuIGFjaGlldmVkIHRvIGRpc2FibGUgdHJhY2tpbmcgdGhpcyBmdXJ0aGVyLlxuICBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lczogMCxcblxuICByYW5kb21TZWVkOiAxLFxuICBtYW5kYXRvcnlBdXRvRW50ZXJYUjogdHlwZW9mIHBhcmFtZXRlcnNbJ21hbmRhdG9yeS1hdXRvZW50ZXIteHInXSAhPT0gJ3VuZGVmaW5lZCcsXG4gIG51bUZyYW1lc1RvUmVuZGVyOiB0eXBlb2YgcGFyYW1ldGVyc1snbnVtLWZyYW1lcyddID09PSAndW5kZWZpbmVkJyA/IDEwMDAgOiBwYXJzZUludChwYXJhbWV0ZXJzWydudW0tZnJhbWVzJ10pLFxuXG4gIC8vIENhbnZhcyB1c2VkIGJ5IHRoZSB0ZXN0IHRvIHJlbmRlclxuICBjYW52YXM6IG51bGwsXG5cbiAgaW5wdXRSZWNvcmRlcjogbnVsbCxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB3ZSBzdGFydGVkIENQVSBleGVjdXRpb24gb2YgdGhlIGN1cnJlbnQgZnJhbWUuXG4gIC8vIHZhciByZWZlcmVuY2VUZXN0VDAgPSAtMTtcblxuICBwcmVUaWNrOiBmdW5jdGlvbigpIHtcblxuICAgIGlmIChHRlhURVNUU19DT05GSUcucHJlTWFpbkxvb3ApIHtcbiAgICAgIEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCgpO1xuICAgIH1cblxuICAgIFdlYkdMU3RhdHMuZnJhbWVTdGFydCgpO1xuICAgIHRoaXMuc3RhdHMuZnJhbWVTdGFydCgpO1xuXG4gICAgaWYgKCF0aGlzLmNhbnZhcykge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWyduby1yZW5kZXJpbmcnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBhc3N1bWUgdGhlIGxhc3Qgd2ViZ2wgY29udGV4dCBiZWluZyBpbml0aWFsaXplZCBpcyB0aGUgb25lIHVzZWQgdG8gcmVuZGVyaW5nXG4gICAgICAgIC8vIElmIHRoYXQncyBkaWZmZXJlbnQsIHRoZSB0ZXN0IHNob3VsZCBoYXZlIGEgY3VzdG9tIGNvZGUgdG8gcmV0dXJuIHRoYXQgY2FudmFzXG4gICAgICAgIGlmIChDYW52YXNIb29rLndlYmdsQ29udGV4dHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciBjb250ZXh0ID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHRzW0NhbnZhc0hvb2sud2ViZ2xDb250ZXh0cy5sZW5ndGggLSAxXTtcbiAgICAgICAgICB0aGlzLmNhbnZhcyA9IGNvbnRleHQuY2FudmFzO1xuXG4gICAgICAgICAgLy8gUHJldmVudCBldmVudHMgbm90IGRlZmluZWQgYXMgZXZlbnQtbGlzdGVuZXJzXG4gICAgICAgICAgdGhpcy5jYW52YXMub25tb3VzZWRvd24gPSB0aGlzLmNhbnZhcy5vbm1vdXNldXAgPSB0aGlzLmNhbnZhcy5vbm1vdXNlbW92ZSA9ICgpID0+IHt9O1xuXG4gICAgICAgICAgLy8gVG8gcHJldmVudCB3aWR0aCAmIGhlaWdodCAxMDAlXG4gICAgICAgICAgZnVuY3Rpb24gYWRkU3R5bGVTdHJpbmcoc3RyKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgICAgICBub2RlLmlubmVySFRNTCA9IHN0cjtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWRkU3R5bGVTdHJpbmcoYC5nZnh0ZXN0cy1jYW52YXMge3dpZHRoOiAke3RoaXMuY2FudmFzV2lkdGh9cHggIWltcG9ydGFudDsgaGVpZ2h0OiAke3RoaXMuY2FudmFzSGVpZ2h0fXB4ICFpbXBvcnRhbnQ7fWApO1xuXG4gICAgICAgICAgLy8gVG8gZml4IEEtRnJhbWVcbiAgICAgICAgICBhZGRTdHlsZVN0cmluZyhgYS1zY2VuZSAuYS1jYW52YXMuZ2Z4dGVzdHMtY2FudmFzIHt3aWR0aDogJHt0aGlzLmNhbnZhc1dpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLmNhbnZhc0hlaWdodH1weCAhaW1wb3J0YW50O31gKTtcblxuICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2dmeHRlc3RzLWNhbnZhcycpO1xuXG4gICAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuXG4gICAgICAgICAgV2ViR0xTdGF0cy5zZXR1cEV4dGVuc2lvbnMoY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlY29yZGluZyddICE9PSAndW5kZWZpbmVkJyAmJiAhdGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIgPSBuZXcgSW5wdXRSZWNvcmRlcih0aGlzLmNhbnZhcyk7XG4gICAgICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIuZW5hYmxlKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZXBsYXknXSAhPT0gJ3VuZGVmaW5lZCcgJiYgR0ZYVEVTVFNfQ09ORklHLmlucHV0ICYmICF0aGlzLmlucHV0TG9hZGluZykge1xuICAgICAgICAgICAgdGhpcy5pbnB1dExvYWRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBmZXRjaCgnL3Rlc3RzLycgKyBHRlhURVNUU19DT05GSUcuaW5wdXQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgICB0aGlzLmlucHV0UmVwbGF5ZXIgPSBuZXcgSW5wdXRSZXBsYXllcih0aGlzLmNhbnZhcywganNvbiwgdGhpcy5ldmVudExpc3RlbmVyLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgICAgICAgICAgIHRoaXMuaW5wdXRIZWxwZXJzID0gbmV3IElucHV0SGVscGVycyh0aGlzLmNhbnZhcyk7XG4gICAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL0BmaXhtZSBlbHNlIGZvciBjYW52YXMgMmQgd2l0aG91dCB3ZWJnbFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMCkge1xuICAgICAgaWYgKCdhdXRvZW50ZXIteHInIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgdGhpcy5pbmplY3RBdXRvRW50ZXJYUih0aGlzLmNhbnZhcyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVmZXJlbmNlVGVzdFQwID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIGlmICh0aGlzLnBhZ2VMb2FkVGltZSA9PT0gbnVsbCkgdGhpcy5wYWdlTG9hZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwYWdlSW5pdFRpbWU7XG5cbiAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICBpZiAodGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgIT0gLTEpIHtcbiAgICAgIHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTtcbiAgICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gLTE7XG4gICAgfVxuICB9LFxuXG4gIHBvc3RUaWNrOiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoIXRoaXMucmVhZHkpIHtyZXR1cm47fVxuICAgIHRoaXMuc3RhdHMuZnJhbWVFbmQoKTtcblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5mcmFtZU51bWJlciA9IHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZXBsYXllci50aWNrKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuXG4gICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICB2YXIgZnJhbWVEdXJhdGlvbiA9IHRpbWVOb3cgLSB0aGlzLmxhc3RGcmFtZVRpY2s7XG4gICAgdGhpcy5sYXN0RnJhbWVUaWNrID0gdGltZU5vdztcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPiA1ICYmIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPiAwKSB7XG4gICAgICAvLyBUaGlzIG11c3QgYmUgZml4ZWQgZGVwZW5kaW5nIG9uIHRoZSB2c3luY1xuICAgICAgaWYgKGZyYW1lRHVyYXRpb24gPiAyMC4wICYmIGZyYW1lRHVyYXRpb24gPiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uICogMS4zNSkge1xuICAgICAgICB0aGlzLm51bVN0dXR0ZXJFdmVudHMrKztcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHtcbiAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzKys7XG4gICAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPj0gdGhpcy5udW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGltZVVudGlsU21vb3RoRnJhbWVyYXRlJywgdGltZU5vdyAtIHRoaXMuZmlyc3RGcmFtZVRpbWUpO1xuICAgICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID0gZnJhbWVEdXJhdGlvbjtcbi8qXG4gICAgaWYgKG51bVByZWxvYWRYSFJzSW5GbGlnaHQgPT0gMCkgeyAvLyBJbXBvcnRhbnQhIFRoZSBmcmFtZSBudW1iZXIgYWR2YW5jZXMgb25seSBmb3IgdGhvc2UgZnJhbWVzIHRoYXQgdGhlIGdhbWUgaXMgbm90IHdhaXRpbmcgZm9yIGRhdGEgZnJvbSB0aGUgaW5pdGlhbCBuZXR3b3JrIGRvd25sb2Fkcy5cbiAgICAgIGlmIChudW1TdGFydHVwQmxvY2tlclhIUnNQZW5kaW5nID09IDApICsrdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7IC8vIEFjdHVhbCByZWZ0ZXN0IGZyYW1lIGNvdW50IG9ubHkgaW5jcmVtZW50cyBhZnRlciBnYW1lIGhhcyBjb25zdW1lZCBhbGwgdGhlIGNyaXRpY2FsIFhIUnMgdGhhdCB3ZXJlIHRvIGJlIHByZWxvYWRlZC5cbiAgICAgICsrZmFrZWRUaW1lOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgICB9XG4qL1xuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKys7XG4gICAgaWYgKHRoaXMuZnJhbWVQcm9ncmVzc0Jhcikge1xuICAgICAgdmFyIHBlcmMgPSBwYXJzZUludCgxMDAgKiB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyYyArIFwiJVwiO1xuICAgIH1cblxuICAgIEZha2VUaW1lcnMuZmFrZWRUaW1lKys7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICB0aGlzLmZpcnN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IGZyYW1lIHN1Ym1pdHRlZCBhdCAobXMpOicsIHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIFdlYkdMU3RhdHMuZnJhbWVFbmQoKTtcbiAgfSxcblxuICBjcmVhdGVEb3dubG9hZEltYWdlTGluazogZnVuY3Rpb24oZGF0YSwgZmlsZW5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUgKyAnLnBuZycpO1xuICAgIGEuc2V0QXR0cmlidXRlKCdocmVmJywgZGF0YSk7XG4gICAgYS5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZGOyBkaXNwbGF5OiBpbmxpbmUtZ3JpZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBtYXJnaW46IDJweDsgZm9udC1zaXplOiAxNHB4Oyc7XG5cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLmlkID0gZmlsZW5hbWU7XG4gICAgaW1nLnNyYyA9IGRhdGE7XG4gICAgYS5hcHBlbmRDaGlsZChpbWcpO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbC5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBkZXNjcmlwdGlvbiB8fCBmaWxlbmFtZTtcblxuICAgIGEuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfaW1hZ2VzJykuYXBwZW5kQ2hpbGQoYSk7XG4gIH0sXG5cbiAgLy8gWEhScyBpbiB0aGUgZXhwZWN0ZWQgcmVuZGVyIG91dHB1dCBpbWFnZSwgYWx3YXlzICdyZWZlcmVuY2UucG5nJyBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHRlc3QuXG4gIGxvYWRSZWZlcmVuY2VJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEdGWFRFU1RTX1JFRkVSRU5DRUlNQUdFX0JBU0VVUkwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIHZhciByZWZlcmVuY2VJbWFnZU5hbWUgPSBwYXJhbWV0ZXJzWydyZWZlcmVuY2UtaW1hZ2UnXSB8fCBHRlhURVNUU19DT05GSUcuaWQ7XG5cbiAgICAgIGltZy5zcmMgPSAnLycgKyBHRlhURVNUU19SRUZFUkVOQ0VJTUFHRV9CQVNFVVJMICsgJy8nICsgcmVmZXJlbmNlSW1hZ2VOYW1lICsgJy5wbmcnO1xuICAgICAgaW1nLm9uYWJvcnQgPSBpbWcub25lcnJvciA9IHJlamVjdDtcblxuICAgICAgLy8gcmVmZXJlbmNlLnBuZyBtaWdodCBjb21lIGZyb20gYSBkaWZmZXJlbnQgZG9tYWluIHRoYW4gdGhlIGNhbnZhcywgc28gZG9uJ3QgbGV0IGl0IHRhaW50IGN0eC5nZXRJbWFnZURhdGEoKS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0NPUlNfZW5hYmxlZF9pbWFnZVxuICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBcbiAgICAgICAgdmFyIGRhdGEgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAncmVmZXJlbmNlLWltYWdlJywgJ1JlZmVyZW5jZSBpbWFnZScpO1xuXG4gICAgICAgIHJlc29sdmUodGhpcy5yZWZlcmVuY2VJbWFnZURhdGEpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWZlcmVuY2VJbWFnZSA9IGltZztcbiAgICB9KTtcbiAgfSxcblxuICBnZXRDdXJyZW50SW1hZ2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgLy8gR3JhYiByZW5kZXJlZCBXZWJHTCBmcm9udCBidWZmZXIgaW1hZ2UgdG8gYSBKUy1zaWRlIGltYWdlIG9iamVjdC5cbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gY2FsbGJhY2s7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBnZW5lcmF0ZSBpbWFnZVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIHJlZnRlc3QgKGV2dCkge1xuICAgICAgICB2YXIgaW1nID0gYWN0dWFsSW1hZ2U7XG4gICAgICAgIHZhciBjYW52YXNDdXJyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY2FudmFzQ3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0N1cnJlbnQud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhc0N1cnJlbnQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgICB2YXIgY3VycmVudEltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICAgICAgc2VsZi5sb2FkUmVmZXJlbmNlSW1hZ2UoKS50aGVuKHJlZkltYWdlRGF0YSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gcmVmSW1hZ2VEYXRhLndpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSByZWZJbWFnZURhdGEuaGVpZ2h0O1xuICAgICAgICAgIHZhciBjYW52YXNEaWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgdmFyIGRpZmZDdHggPSBjYW52YXNEaWZmLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgY2FudmFzRGlmZi53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIGNhbnZhc0RpZmYuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgIHZhciBkaWZmID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgICB2YXIgbmV3SW1hZ2VEYXRhID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgcmVzaXplSW1hZ2VEYXRhKGN1cnJlbnRJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG5cbiAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZWZJbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICB2YXIgYWN0dWFsID0gbmV3SW1hZ2VEYXRhLmRhdGE7XG5cbiAgICAgICAgICB2YXIgdGhyZXNob2xkID0gdHlwZW9mIEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkID09PSAndW5kZWZpbmVkJyA/IDAuMiA6IEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkO1xuICAgICAgICAgIHZhciBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChleHBlY3RlZCwgYWN0dWFsLCBkaWZmLmRhdGEsIHdpZHRoLCBoZWlnaHQsIHt0aHJlc2hvbGQ6IHRocmVzaG9sZH0pO1xuICAgICAgICAgIHZhciBkaWZmUGVyYyA9IG51bURpZmZQaXhlbHMgLyAod2lkdGggKiBoZWlnaHQpICogMTAwO1xuXG4gICAgICAgICAgdmFyIGZhaWwgPSBkaWZmUGVyYyA+IDAuMjsgLy8gZGlmZiBwZXJjIDAgLSAxMDAlXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHtyZXN1bHQ6ICdwYXNzJ307XG5cbiAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2ggKCR7ZGlmZlBlcmMudG9GaXhlZCgyKX0lIGRpZmZlcmVudCBwaXhlbHMpYDtcbiAgICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgICAgZGlmZlBlcmM6IGRpZmZQZXJjLFxuICAgICAgICAgICAgICBudW1EaWZmUGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICAgICAgICBmYWlsUmVhc29uOiAnUmVmZXJlbmNlIGltYWdlIG1pc21hdGNoJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gJ2ZhaWwnO1xuICAgICAgICAgICAgYmVuY2htYXJrRGl2LnF1ZXJ5U2VsZWN0b3IoJ2gxJykuaW5uZXJUZXh0ID0gJ1Rlc3QgZmFpbGVkISc7XG5cbiAgICAgICAgICAgIGRpZmZDdHgucHV0SW1hZ2VEYXRhKGRpZmYsIDAsIDApO1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGNhbnZhc0RpZmYudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgJ2NhbnZhcy1kaWZmJywgJ0RpZmZlcmVuY2UnKTtcbiAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9ICdmYWlsJztcbiAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBmYWlsZWQhJztcblxuICAgICAgICAgIHZhciBkaXZFcnJvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJyk7XG4gICAgICAgICAgZGl2RXJyb3IucXVlcnlTZWxlY3RvcignaDMnKS5pbm5lckhUTUwgPSBgRVJST1I6IEZhaWxlZCB0byBsb2FkIHJlZmVyZW5jZSBpbWFnZWA7XG4gICAgICAgICAgZGl2RXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgcmVzdWx0OiAnZmFpbCcsXG4gICAgICAgICAgICBmYWlsUmVhc29uOiAnRXJyb3IgbG9hZGluZyByZWZlcmVuY2UgaW1hZ2UnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBhY3R1YWxJbWFnZS5zcmMgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IHJlZnRlc3Q7XG4gICAgICAgIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBpbml0O1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGluaXRTZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly8nICsgR0ZYVEVTVFNfQ09ORklHLnNlcnZlcklQICsgJzo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHRlc3Rpbmcgc2VydmVyJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCd0ZXN0X3N0YXJ0ZWQnLCB7aWQ6IEdGWFRFU1RTX0NPTkZJRy5pZCwgdGVzdFVVSUQ6IHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbmV4dF9iZW5jaG1hcmsnLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ25leHRfYmVuY2htYXJrJywgZGF0YSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShkYXRhLnVybCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5wdXREb3dubG9hZEJ1dHRvbjogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gRHVtcCBpbnB1dFxuICAgICAgZnVuY3Rpb24gc2F2ZVN0cmluZyAodGV4dCwgZmlsZW5hbWUsIG1pbWVUeXBlKSB7XG4gICAgICAgIHNhdmVCbG9iKG5ldyBCbG9iKFsgdGV4dCBdLCB7IHR5cGU6IG1pbWVUeXBlIH0pLCBmaWxlbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVCbG9iIChibG9iLCBmaWxlbmFtZSkge1xuICAgICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWUgfHwgJ2lucHV0Lmpzb24nO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIC8vIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTsgYnJlYWtzIEZpcmVmb3guLi5cbiAgICAgIH1cblxuICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLmlucHV0UmVjb3JkZXIuZXZlbnRzLCBudWxsLCAyKTtcblxuICAgICAgLy9jb25zb2xlLmxvZygnSW5wdXQgcmVjb3JkZWQnLCBqc29uKTtcblxuICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuICAgICAgbGluay5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICAgIGxpbmsub25jbGljayA9ICgpID0+IHNhdmVTdHJpbmcoanNvbiwgR0ZYVEVTVFNfQ09ORklHLmlkICsgJy5qc29uJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYERvd25sb2FkIGlucHV0IEpTT05gKSk7IC8vICgke3RoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMubGVuZ3RofSBldmVudHMgcmVjb3JkZWQpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpLmFwcGVuZENoaWxkKGxpbmspO1xuICB9LFxuXG4gIGdlbmVyYXRlRmFpbGVkQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoZmFpbFJlYXNvbikge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXN0X2lkOiBHRlhURVNUU19DT05GSUcuaWQsXG4gICAgICBhdXRvRW50ZXJYUjogdGhpcy5hdXRvRW50ZXJYUixcbiAgICAgIHJldmlzaW9uOiBHRlhURVNUU19DT05GSUcucmV2aXNpb24gfHwgMCxcbiAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgIGZhaWxSZWFzb246IGZhaWxSZWFzb25cbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpbWVFbmQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgdmFyIHRvdGFsVGltZSA9IHRpbWVFbmQgLSBwYWdlSW5pdFRpbWU7IC8vIFRvdGFsIHRpbWUsIGluY2x1ZGluZyBldmVyeXRoaW5nLlxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlID0+IHtcbiAgICAgIHZhciB0b3RhbFJlbmRlclRpbWUgPSB0aW1lRW5kIC0gdGhpcy5maXJzdEZyYW1lVGltZTtcbiAgICAgIHZhciBjcHVJZGxlID0gdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICogMTAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXNUb1JlbmRlciAqIDEwMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcblxuICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgdGVzdF9pZDogR0ZYVEVTVFNfQ09ORklHLmlkLFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIHBlcmY6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICAgICAgd2ViZ2w6IFdlYkdMU3RhdHMuZ2V0U3VtbWFyeSgpXG4gICAgICAgICAgLy8gISEhISBvY3VsdXNfdnJhcGk6IHRoaXMuXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9FbnRlclhSOiB0aGlzLmF1dG9FbnRlclhSLFxuICAgICAgICByZXZpc2lvbjogR0ZYVEVTVFNfQ09ORklHLnJldmlzaW9uIHx8IDAsXG4gICAgICAgIHdlYmF1ZGlvOiBXZWJBdWRpb0hvb2suc3RhdHMsXG4gICAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUsXG4gICAgICAgIGF2Z0ZwczogZnBzLFxuICAgICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBjcHVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZUluTWFpbkxvb3AsXG4gICAgICAgIGF2Z0NwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICAgIGNwdUlkbGVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCxcbiAgICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBwYWdlTG9hZFRpbWU6IHRoaXMucGFnZUxvYWRUaW1lLFxuICAgICAgICByZXN1bHQ6ICdwYXNzJyxcbiAgICAgICAgbG9nczogdGhpcy5sb2dzXG4gICAgICB9O1xuXG4gICAgICAvLyBAdG9kbyBJbmRpY2F0ZSBzb21laG93IHRoYXQgbm8gcmVmZXJlbmNlIHRlc3QgaGFzIGJlZW4gcGVyZm9ybWVkXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3NraXAtcmVmZXJlbmNlLWltYWdlLXRlc3QnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb0ltYWdlUmVmZXJlbmNlQ2hlY2soKS50aGVuKHJlZlJlc3VsdCA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHJlZlJlc3VsdCk7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KS5jYXRjaChyZWZSZXN1bHQgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByZWZSZXN1bHQpO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYmVuY2htYXJrRmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICB0aGlzLmFkZElucHV0RG93bmxvYWRCdXR0b24oKTtcbiAgICB9XG5cbiAgICB0aGlzLmluamVjdEJlbmNobWFya0ZpbmlzaGVkSFRNTCgpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgdmFyIGRlc2NyaXB0aW9uID0gdGhpcy5pbnB1dFJlY29yZGVyID8gJ0Rvd25sb2FkIHJlZmVyZW5jZSBpbWFnZScgOiAnQWN0dWFsIHJlbmRlcic7XG4gICAgICB0aGlzLmNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rKGRhdGEsIEdGWFRFU1RTX0NPTkZJRy5pZCwgZGVzY3JpcHRpb24pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNhbid0IGdlbmVyYXRlIGltYWdlXCIsIGUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVCZW5jaG1hcmtSZXN1bHQoKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0JlbmNobWFya1Jlc3VsdChyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBpbmplY3RCZW5jaG1hcmtGaW5pc2hlZEhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgI3Rlc3RfZmluaXNoZWQge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGRkO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjMDAwO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQucGFzcyB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM5Zjk7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkLmZhaWwge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjk5O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMge1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMgaW1nIHtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDA3MDk1O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZCAuYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgICAgICBjb2xvcjogI0ZGRkZGRjtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCIsIFwiSGVsdmV0aWNhXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYgIWltcG9ydGFudDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBsaW5lLWhlaWdodDogbm9ybWFsO1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIHBhZGRpbmc6IDEwcHggMXB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAzMDBtcyBlYXNlLW91dDtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQgLmJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDc4YTA7XG4gICAgICB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gYDxoMT5UZXN0IGZpbmlzaGVkITwvaDE+YDtcbiAgICBkaXYuaWQgPSAndGVzdF9maW5pc2hlZCc7XG4gICAgZGl2LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblxuICAgIHZhciBkaXZSZWZlcmVuY2VFcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlkID0gJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmNzc1RleHQgPSAndGV4dC1hbGlnbjpjZW50ZXI7IGNvbG9yOiAjZjAwOydcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5pbm5lckhUTUwgPSAnPGgzPjwvaDM+JztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGRpdlJlZmVyZW5jZUVycm9yKTtcbiAgICB2YXIgZGl2SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2SW1nLmlkID0gJ3Rlc3RfaW1hZ2VzJztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5hcHBlbmRDaGlsZChkaXZJbWcpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICB9LFxuICBwcm9jZXNzQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIGlmIChwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXSkge1xuICAgICAgICByZXN1bHQudGVzdFVVSUQgPSBwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3Rlc3RfZmluaXNoJywgcmVzdWx0KTtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gcmVzdWx0LnJlc3VsdDtcbiAgICBpZiAocmVzdWx0LnJlc3VsdCA9PT0gJ3Bhc3MnKSB7XG4gICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBwYXNzZWQhJztcbiAgICB9XG5cbiAgICBiZW5jaG1hcmtEaXYuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCByZXN1bHQpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY2xvc2UgJiYgdHlwZW9mIHBhcmFtZXRlcnNbJ25vLWNsb3NlLW9uLWZhaWwnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIH1cbiAgfSxcblxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5zZW5kTG9nKVxuICAgICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGFkZEluZm9PdmVybGF5OiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snaW5mby1vdmVybGF5J10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdk92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdk92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDk1LCA0MCwgMTM2KTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIHBhZGRpbmc6IDVweGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdk92ZXJsYXkpO1xuICAgICAgZGl2T3ZlcmxheS5pbm5lclRleHQgPSBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXTtcbiAgICB9KVxuICB9LFxuXG4gIGFkZFByb2dyZXNzQmFyOiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIHZhciBkaXZQcm9ncmVzc0JhcnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdlByb2dyZXNzQmFycy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgYm90dG9tOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzOyB3aWR0aDogMjAwcHg7IHBhZGRpbmc6IDVweCA1cHggMHB4IDVweDsnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXZQcm9ncmVzc0JhcnMpO1xuXG4gICAgICB2YXIgb3JkZXJHbG9iYWwgPSBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXTtcbiAgICAgIHZhciB0b3RhbEdsb2JhbCA9IHBhcmFtZXRlcnNbJ3RvdGFsLWdsb2JhbCddO1xuICAgICAgdmFyIHBlcmNHbG9iYWwgPSBNYXRoLnJvdW5kKG9yZGVyR2xvYmFsL3RvdGFsR2xvYmFsICogMTAwKTtcbiAgICAgIHZhciBvcmRlclRlc3QgPSBwYXJhbWV0ZXJzWydvcmRlci10ZXN0J107XG4gICAgICB2YXIgdG90YWxUZXN0ID0gcGFyYW1ldGVyc1sndG90YWwtdGVzdCddO1xuICAgICAgdmFyIHBlcmNUZXN0ID0gTWF0aC5yb3VuZChvcmRlclRlc3QvdG90YWxUZXN0ICogMTAwKTtcblxuICAgICAgZnVuY3Rpb24gYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKHRleHQsIGNvbG9yLCBwZXJjLCBpZCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5zdHlsZS5jc3NUZXh0PSd3aWR0aDogMTAwJTsgaGVpZ2h0OiAyMHB4OyBtYXJnaW4tYm90dG9tOiA1cHg7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQtY29sb3I6ICNmNWY1ZjU7JztcbiAgICAgICAgZGl2UHJvZ3Jlc3NCYXJzLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgdmFyIGRpdlByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkaXZQcm9ncmVzcyk7XG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZGl2UHJvZ3Jlc3Muc3R5bGUuY3NzVGV4dD1gXG4gICAgICAgICAgd2lkdGg6ICR7cGVyY30lO2JhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9IGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBmb250LWZhbWlseTogTW9ub3NwYWNlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzM3YWI3O1xuICAgICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsLjE1KTtgO1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlubmVyVGV4dCA9IHRleHQ7O1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oYCR7b3JkZXJUZXN0fS8ke3RvdGFsVGVzdH0gJHtwZXJjVGVzdH0lYCwgJyM1YmMwZGUnLCBwZXJjVGVzdCk7XG4gICAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlckdsb2JhbH0vJHt0b3RhbEdsb2JhbH0gJHtwZXJjR2xvYmFsfSVgLCAnIzMzN2FiNycsIHBlcmNHbG9iYWwpO1xuICAgICAgfVxuXG4gICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oJycsICcjMzM3YWI3JywgMCwgJ251bWZyYW1lcycpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bWZyYW1lcycpO1xuXG4gICAgfSk7XG4gIH0sXG5cbiAgaG9va01vZGFsczogZnVuY3Rpb24oKSB7XG4gICAgLy8gSG9vayBtb2RhbHM6IFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxuICAgIHdpbmRvdy5hbGVydCA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuYWxlcnQoJyArIG1zZyArICcpJyk7IH1cbiAgICB3aW5kb3cuY29uZmlybSA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuY29uZmlybSgnICsgbXNnICsgJyknKTsgcmV0dXJuIHRydWU7IH1cbiAgfSxcbiAgUkFGczogW10sIC8vIFVzZWQgdG8gc3RvcmUgaW5zdGFuY2VzIG9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGNhbGxiYWNrc1xuICBwcmV2UkFGUmVmZXJlbmNlOiBudWxsLCAvLyBQcmV2aW91cyBjYWxsZWQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaG9va2VkQ2FsbGJhY2sgPSBwID0+IHtcbiAgICAgIC8vIFB1c2ggdGhlIGNhbGxiYWNrIHRvIHRoZSBsaXN0IG9mIGN1cnJlbnRseSBydW5uaW5nIFJBRnNcbiAgICAgIGlmICh0aGlzLlJBRnMuaW5kZXhPZihjYWxsYmFjaykgPT09IC0xKSB7XG4gICAgICAgIHRoaXMuUkFGcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIGN1cnJlbnQgY2FsbGJhY2sgaXMgdGhlIGZpcnN0IG9uIHRoZSBsaXN0LCB3ZSBhc3N1bWUgdGhlIGZyYW1lIGp1c3Qgc3RhcnRlZFxuICAgICAgaWYgKHRoaXMuUkFGc1swXSA9PT0gY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5wcmVUaWNrKCk7XG4gICAgICB9XG5cbiAgICAgIGNhbGxiYWNrKHBlcmZvcm1hbmNlLm5vdygpKTtcblxuICAgICAgLy8gSWYgcmVhY2hpbmcgdGhlIGxhc3QgUkFGLCBleGVjdXRlIGFsbCB0aGUgcG9zdCBjb2RlXG4gICAgICBpZiAodGhpcy5SQUZzWyB0aGlzLlJBRnMubGVuZ3RoIC0gMSBdID09PSBjYWxsYmFjaykge1xuXG4gICAgICAgIC8vIEB0b2RvIE1vdmUgYWxsIHRoaXMgbG9naWMgdG8gYSBmdW5jdGlvbiB0byBjbGVhbiB1cCB0aGlzIG9uZVxuICAgICAgICB0aGlzLnBvc3RUaWNrKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICAgICAgdGhpcy5yZWxlYXNlUkFGKCk7XG4gICAgICAgICAgdGhpcy5iZW5jaG1hcmtGaW5pc2hlZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChHRlhURVNUU19DT05GSUcucG9zdE1haW5Mb29wKSB7XG4gICAgICAgICAgR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBSQUYgaXMgdGhlIHNhbWUgYXMgbm93LCBqdXN0IHJlc2V0IHRoZSBsaXN0XG4gICAgICAvLyBpbiBjYXNlIHdlIGhhdmUgc3RvcHBlZCBjYWxsaW5nIHNvbWUgb2YgdGhlIHByZXZpb3VzIFJBRnNcbiAgICAgIGlmICh0aGlzLnByZXZSQUZSZWZlcmVuY2UgPT09IGNhbGxiYWNrICYmICh0aGlzLlJBRnNbMF0gIT09IGNhbGxiYWNrIHx8IHRoaXMuUkFGcy5sZW5ndGggPiAxKSkge1xuICAgICAgICB0aGlzLlJBRnMgPSBbY2FsbGJhY2tdO1xuICAgICAgfVxuICAgICAgdGhpcy5wcmV2UkFGUmVmZXJlbmNlID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICB9LFxuICBjdXJyZW50UkFGQ29udGV4dDogd2luZG93LFxuICByZWxlYXNlUkFGOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jdXJyZW50UkFGQ29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7fTtcbiAgICBpZiAoJ1ZSRGlzcGxheScgaW4gd2luZG93ICYmXG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0IGluc3RhbmNlb2YgVlJEaXNwbGF5ICYmXG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LmlzUHJlc2VudGluZykge1xuICAgICAgdGhpcy5jdXJyZW50UkFGQ29udGV4dC5leGl0UHJlc2VudCgpO1xuICAgIH1cbiAgfSxcbiAgaG9va1JBRjogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjb25zb2xlLmxvZygnSG9va2luZycsIGNvbnRleHQpO1xuICAgIGlmICghY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICBjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB9XG4gICAgY29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuY3VycmVudFJBRkNvbnRleHQgPSBjb250ZXh0O1xuICB9LFxuICB1bmhvb2tSQUY6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgY29uc29sZS5sb2coJ3VuaG9va2luZycsIGNvbnRleHQsIGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSk7XG4gICAgaWYgKGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgY29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgfVxuICB9LFxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbml0U2VydmVyKCk7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gICAgICB0aGlzLmhvb2tSQUYod2luZG93KTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZFByb2dyZXNzQmFyKCk7XG4gICAgdGhpcy5hZGRJbmZvT3ZlcmxheSgpO1xuXG4gICAgY29uc29sZS5sb2coJ0ZyYW1lcyB0byByZW5kZXI6JywgdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5kb250T3ZlcnJpZGVUaW1lKSB7XG4gICAgICBGYWtlVGltZXJzLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIGlmICghR0ZYVEVTVFNfQ09ORklHLmRvbnRPdmVycmlkZVdlYkF1ZGlvKSB7XG4gICAgICBXZWJBdWRpb0hvb2suZW5hYmxlKHR5cGVvZiBwYXJhbWV0ZXJzWydmYWtlLXdlYmF1ZGlvJ10gIT09ICd1bmRlZmluZWQnKTtcbiAgICB9XG5cbiAgICAvLyBAdG9kbyBVc2UgY29uZmlnXG4gICAgV2ViVlJIb29rLmVuYWJsZSh2cmRpc3BsYXkgPT4ge1xuICAgICAgdGhpcy5ob29rUkFGKHZyZGlzcGxheSk7XG4gICAgfSk7XG4vKlxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd2cmRpc3BsYXlwcmVzZW50Y2hhbmdlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBkaXNwbGF5ID0gZXZ0LmRpc3BsYXk7XG4gICAgICBpZiAoZGlzcGxheS5pc1ByZXNlbnRpbmcpIHtcbiAgICAgICAgdGhpcy51bmhvb2tSQUYod2luZG93KTtcbiAgICAgICAgdGhpcy5ob29rUkFGKGRpc3BsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51bmhvb2tSQUYoZGlzcGxheSk7XG4gICAgICAgIHRoaXMuaG9va1JBRih3aW5kb3cpO1xuICAgICAgfVxuICAgIH0pO1xuKi9cbiAgICBNYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20odGhpcy5yYW5kb21TZWVkKTtcbiAgICBDYW52YXNIb29rLmVuYWJsZShPYmplY3QuYXNzaWduKHtmYWtlV2ViR0w6IHR5cGVvZiBwYXJhbWV0ZXJzWydmYWtlLXdlYmdsJ10gIT09ICd1bmRlZmluZWQnfSwge3dpZHRoOiB0aGlzLmNhbnZhc1dpZHRoLCBoZWlnaHQ6IHRoaXMuY2FudmFzSGVpZ2h0fSkpO1xuICAgIHRoaXMuaG9va01vZGFscygpO1xuXG4gICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMubG9ncyA9IHtcbiAgICAgIGVycm9yczogW10sXG4gICAgICB3YXJuaW5nczogW10sXG4gICAgICBjYXRjaEVycm9yczogW11cbiAgICB9O1xuICAgIC8vIHRoaXMud3JhcEVycm9ycygpO1xuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyID0gbmV3IEV2ZW50TGlzdGVuZXJNYW5hZ2VyKCk7XG5cbiAgICAvL2lmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgfSxcbiAgYXV0b0VudGVyWFI6IHtcbiAgICByZXF1ZXN0ZWQ6IGZhbHNlLFxuICAgIHN1Y2Nlc3NmdWw6IGZhbHNlXG4gIH0sXG4gIGluamVjdEF1dG9FbnRlclhSOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICB0aGlzLmF1dG9FbnRlclhSLnJlcXVlc3RlZCA9IHRydWU7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMoKS50aGVuKGRpc3BsYXlzID0+IHtcbiAgICAgICAgICB2YXIgZGV2aWNlID0gZGlzcGxheXNbMF07XG4gICAgICAgICAgLy9pZiAoZGV2aWNlLmlzUHJlc2VudGluZykgZGV2aWNlLmV4aXRQcmVzZW50KCk7XG4gICAgICAgICAgaWYgKGRldmljZSkge1xuICAgICAgICAgICAgZGV2aWNlLnJlcXVlc3RQcmVzZW50KCBbIHsgc291cmNlOiBjYW52YXMgfSBdIClcbiAgICAgICAgICAgICAgLnRoZW4oeCA9PiB7IGNvbnNvbGUubG9nKCdhdXRvZW50ZXIgWFIgc3VjY2Vzc2Z1bCcpOyB0aGlzLmF1dG9FbnRlclhSLnN1Y2Nlc3NmdWwgPSB0cnVlOyB9KVxuICAgICAgICAgICAgICAuY2F0Y2goeCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dG9lbnRlciBYUiBmYWlsZWQnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYW5kYXRvcnlBdXRvRW50ZXJYUikge1xuICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQmVuY2htYXJrUmVzdWx0KHRoaXMuZ2VuZXJhdGVGYWlsZWRCZW5jaG1hcmtSZXN1bHQoJ2F1dG9lbnRlci14ciBmYWlsZWQnKSk7XG4gICAgICAgICAgICAgICAgICB9LDEwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSwgNTAwKTsgLy8gQGZpeCB0byBtYWtlIGl0IHdvcmsgb24gRnhSXG4gICAgfSBlbHNlIGlmICh0aGlzLm1hbmRhdG9yeUF1dG9FbnRlclhSKSB7XG4gICAgICBzZXRUaW1lb3V0KHggPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NCZW5jaG1hcmtSZXN1bHQodGhpcy5nZW5lcmF0ZUZhaWxlZEJlbmNobWFya1Jlc3VsdCgnYXV0b2VudGVyLXhyIGZhaWxlZCcpKTtcbiAgICAgIH0sMTAwMCk7XG4gICAgfVxuICB9LFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUub3JpZ2luID09PSAnd2ViZ2Z4dGVzdCcpIHJldHVybjtcblxuICAgIGNvbnN0IERFRkFVTFRfV0lEVEggPSA4MDA7XG4gICAgY29uc3QgREVGQVVMVF9IRUlHSFQgPSA2MDA7XG4gICAgdGhpcy5jYW52YXNXaWR0aCA9IERFRkFVTFRfV0lEVEg7XG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSBERUZBVUxUX0hFSUdIVDtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sna2VlcC13aW5kb3ctc2l6ZSddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5jYW52YXNXaWR0aCA9IHR5cGVvZiBwYXJhbWV0ZXJzWyd3aWR0aCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfV0lEVEggOiBwYXJzZUludChwYXJhbWV0ZXJzWyd3aWR0aCddKTtcbiAgICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pO1xuICAgICAgd2luZG93LmlubmVyV2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICB9XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoJ3Jlc2l6ZScsIHRydWUsIHRydWUpO1xuICAgIH1cbiAgICBlLm9yaWdpbiA9ICd3ZWJnZnh0ZXN0JztcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudCA/IHdpbmRvdy5kaXNwYXRjaEV2ZW50KGUpIDogd2luZG93LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICB9XG59O1xuXG5URVNURVIuaW5pdCgpO1xuXG52YXIgcGFnZUluaXRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuIl0sIm5hbWVzIjpbIlN0YXRzIiwidGhpcyIsImRlZmluZSIsInJlcXVpcmUkJDAiLCJzciIsImRlY29kZUNvbXBvbmVudCIsIkRFRkFVTFRfT1BUSU9OUyIsIktleXN0cm9rZVZpc3VhbGl6ZXIiLCJXZWJHTFN0YXRzIiwicGl4ZWxtYXRjaCIsInNlZWRyYW5kb20iLCJQZXJmU3RhdHMiXSwi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QU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFVBQVUsRUFBRTtDQUNyQyxHQUFHLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUNyQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2pDLElBQUksTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDekMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQztDQUN6QyxJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQzNDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdEMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RDLElBQUksTUFBTSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDL0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN2QyxJQUFJLE1BQU07Q0FDVjtDQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDakMsSUFBSTtDQUNKLEdBQUcsTUFBTTtDQUNULEdBQUcs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LENBQUM7O0NBRUo7Q0FDQSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1gsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNwQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3BCLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEIsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QixFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ2hDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtDQUNoQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RCLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDaEMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ2QsQ0FBQzs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1osRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDZCxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUNkLEVBQUUsQ0FBQyxDQUFDLEVB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dEIsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Q0FFOUI7Q0FDQSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsV0FBVztDQUN2QixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2xDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3ZELElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0NBQ3RDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDMUQsR0FBRyxDQUFDOztDQUVKLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDWCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1gsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNYLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDWCxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVYLEVBQUUsSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0NBQzNCO0NBQ0EsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUNoQixHQUFHLE1BQU07Q0FDVDtDQUNBLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQztDQUNwQixHQUFHOztDQUVIO0NBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDaEQsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3RDLElBQUksSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtDQUM3QixNQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDckMsS0FBSztDQUNMLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2QsR0FBRztDQUNILENBQUM7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtDQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWixFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsQ0FBQzs7Q0FFRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0NBQzFCLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDO0NBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSztDQUNoQyxNQUFNLElBQUksR0FBRyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQztDQUNwRSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsV0FBVztDQUMzQixJQUFJLEdBQUc7Q0FDUCxNQUFNLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0NBQ2hDLFVBQVUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxXQUFXO0NBQy9DLFVBQVUsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Q0FDM0MsS0FBSyxRQUFRLE1BQU0sS0FBSyxDQUFDLEVBQUU7Q0FDM0IsSUFBSSxPQUFPLE1BQU0sQ0FBQztDQUNsQixHQUFHLENBQUM7Q0FDSixFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztDQUN2QixFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0NBQ3BCLEVBQUUsSUFBSSxLQUFLLEVBQUU7Q0FDYixJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztDQUNuRCxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFFO0NBQ3BELEdBQUc7Q0FDSCxFQUFFLE9BQU8sSUFBSSxDQUFDO0NBQ2QsQ0FBQzs7Q0FFRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO0NBQzlCLEVBQUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Q0FDeEIsQ0FBQyxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Q0FDakMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RDLENBQUMsTUFBTTtDQUNQLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDckIsQ0FBQzs7Q0FFRCxDQUFDO0NBQ0QsRUFBRUQsY0FBSTtDQUNOLEVBQUUsQUFBK0IsTUFBTTtDQUN2QyxFQUFFLENBQUMsT0FBT0MsU0FBTSxLQUFLLFVBQVUsQUFBVTtDQUN6QyxDQUFDOzs7O0NDbkZEO0NBQ0E7Q0FDQTtDQUNBOztDQUVBLENBQUMsU0FBUyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0NBQ3RCLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDOztDQUVoQjtDQUNBLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBRyxXQUFXO0NBQ3ZCO0NBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUk7Q0FDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztDQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQzdELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNiLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3ZCLElBQUksT0FBTyxDQUFDLENBQUM7Q0FDYixHQUFHLENBQUM7O0NBRUosRUFBRSxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0NBQzFCLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7O0NBRXJCLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0NBQzdCO0NBQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUN0QixLQUFLLE1BQU07Q0FDWDtDQUNBLE1BQU0sSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7Q0FDdkIsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDeEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMs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Q0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7Q0FDcEM7Q0FDQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0NBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNsQjtDQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDYjtDQUNBLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDLEdBQUcsQ0FBQzs7Q0FFSixFQUFFLFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7Q0FDMUIsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDO0NBQzNDLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO0NBQzdCO0NBQ0EsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ2YsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ2xCLEtBQUssTUFBTTtDQUNYO0NBQ0EsTUFBTSxJQUFJLEdBQUcsSUFBSSxH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QUVwQztDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtDQUNuQixFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTTtDQUM1QixNQUFNLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7O0NBRTNEO0NBQ0EsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFOztDQUVwQztDQUNBLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFO0NBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQ2YsR0FBRztDQUNILEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDOUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM1RCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDYixHQUFHOztDQUVIO0NBQ0EsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxLQUFLLEVBQUU7Q0FDMUI7Q0FDQSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0NBQ2hCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDckMsSUFBSSxPQUFPLEtBQUssRUFBRSxFQUFFO0NBQ3BCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2hDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzlFLEtBQUs7Q0FDTCxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsSUFBSSxPQUFPLENBQUMsQ0FBQztDQUNiO0NBQ0E7Q0FDQTtDQUNBLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUNaLENBQUM7O0NBRUQ7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ1osRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNwQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ1gsQ0FBQyxBQUNEO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0NBQzdCLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztDQUM1QyxFQUFFLElBQUksS0FBSyxJQUFJLEdBQUcsSUFBSSxRQUFRLEVBQUU7Q0FDaEMsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUU7Q0FDdEIsTUFBTSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO0NBQ3RFLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsRUFBRSxRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLEdBQUcsSUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUU7Q0FDdkUsQ0FBQzs7Q0FFRDtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtDQUMzQixFQUFFLElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDM0MsRUFBRSxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFO0NBQ2hDLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7Q0FDakIsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUUsR0FBRztDQUNILEVBQUUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsQ0FBQzs7Q0FFRDtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsU0FBUyxRQUFRLEdBQUc7Q0FDcEIsRUFBRSxJQUFJO0NBQ04sSUFBSSxJQUFJLEdBQUcsQ0FBQztDQUNaLElBQUksSUFBSSxVQUFVLEtBQUssR0FBRyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtDQUN0RDtDQUNBLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN2QixLQUFLLE1BQU07Q0FDWCxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNsQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUM5RCxLQUFLO0NBQ0wsSUFBSSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN6QixHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7Q0FDZCxJQUFJLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTO0NBQ2xDLFFBQVEsT0FBTyxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDO0NBQzdDLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3ZFLEdBQUc7Q0FDSCxDQUFDOztDQUVEO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsU0FBUyxRQUFRLENBQUMsQ0FBQyxFQUFFO0NBQ3JCLEVBQUUsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDekMsQ0FBQzs7Q0FFRDtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7O0NBRTVCO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsSUFBSSxBQUErQixNQUFNLENBQUMsT0FBTyxFQUFFO0NBQ25ELEVBQUUsY0FBYyxHQUFHLFVBQVUsQ0FBQztDQUM5QjtDQUNBLEVBQUUsSUFBSTtDQUNOLElBQUksVUFBVSxHQUFHQyxNQUFpQixDQUFDO0NBQ25DLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFO0NBQ2pCLENBQUMsQUFFQTs7Q0FFRDtDQUNBLENBQUM7Q0FDRCxFQUFFLEVBQUU7Q0FDSixFQUFFLElBQUk7Q0FDTixDQUFDOzs7Q0N6UEQ7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQTtDQUNBO0NBQ0E7OztDQUdBO0NBQ0E7Q0FDQTs7O0NBR0E7Q0FDQTtDQUNBOzs7Q0FHQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7OztDQUdBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBOzs7Q0FHQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBOzs7Q0FHQTtDQUNBOzs7QUFHQUMsV0FBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDZkEsV0FBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbkJBLFdBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ25CQSxXQUFFLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUN6QkEsV0FBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDckJBLFdBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztDQUVuQixnQkFBYyxHQUFHQSxVQUFFOztDQzFEbkIsbUJBQWMsR0FBRyxHQUFHLElBQUksa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQ0ExSCxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUM7Q0FDM0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzVDLElBQUksWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztDQUV4RCxTQUFTLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUU7Q0FDN0MsQ0FBQyxJQUFJO0NBQ0w7Q0FDQSxFQUFFLE9BQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2pELEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRTtDQUNmO0NBQ0EsRUFBRTs7Q0FFRixDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Q0FDOUIsRUFBRSxPQUFPLFVBQVUsQ0FBQztDQUNwQixFQUFFOztDQUVGLENBQUMsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7O0NBRXBCO0NBQ0EsQ0FBQyxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUN2QyxDQUFDLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0NBRXJDLENBQUMsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDekYsQ0FBQzs7Q0FFRCxTQUFTLE1BQU0sQ0FBQyxLQUFLLEVBQUU7Q0FDdkIsQ0FBQyxJQUFJO0NBQ0wsRUFBRSxPQUFPLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ25DLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRTtDQUNmLEVBQUUsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7Q0FFMUMsRUFBRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtDQUMxQyxHQUFHLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztDQUVoRCxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0NBQ3ZDLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEtBQUssQ0FBQztDQUNmLEVBQUU7Q0FDRixDQUFDOztDQUVELFNBQVMsd0JBQXdCLENBQUMsS0FBSyxFQUFFO0NBQ3pDO0NBQ0EsQ0FBQyxJQUFJLFVBQVUsR0FBRztDQUNsQixFQUFFLFFBQVEsRUFBRSxjQUFjO0NBQzFCLEVBQUUsUUFBUSxFQUFFLGNBQWM7Q0FDMUIsRUFBRSxDQUFDOztDQUVILENBQUMsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN0QyxDQUFDLE9BQU8sS0FBSyxFQUFFO0NBQ2YsRUFBRSxJQUFJO0NBQ047Q0FDQSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2RCxHQUFHLENBQUMsT0FBTyxHQUFHLEVBQUU7Q0FDaEIsR0FBRyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0NBRWpDLEdBQUcsSUFBSSxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO0NBQzVCLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztDQUNsQyxJQUFJO0NBQ0osR0FBRzs7Q0FFSCxFQUFFLEtBQUssR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ25DLEVBQUU7O0NBRUY7Q0FDQSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7O0NBRTlCLENBQUMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Q0FFdkMsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtDQUMxQztDQUNBLEVBQUUsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3ZCLEVBQUUsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQy9ELEVBQUU7O0NBRUYsQ0FBQyxPQUFPLEtBQUssQ0FBQztDQUNkLENBQUM7O0NBRUQsc0JBQWMsR0FBRyxVQUFVLFVBQVUsRUFBRTtDQUN2QyxDQUFDLElBQUksT0FBTyxVQUFVLEtBQUssUUFBUSxFQUFFO0NBQ3JDLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxREFBcUQsR0FBRyxPQUFPLFVBQVUsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUN2RyxFQUFFOztDQUVGLENBQUMsSUFBSTtDQUNMLEVBQUUsVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztDQUU5QztDQUNBLEVBQUUsT0FBTyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUN4QyxFQUFFLENBQUMsT0FBTyxHQUFHLEVBQUU7Q0FDZjtDQUNBLEVBQUUsT0FBTyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUM5QyxFQUFFO0NBQ0YsQ0FBQzs7Q0MzRkQsZ0JBQWMsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLEtBQUs7Q0FDeEMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxFQUFFO0NBQ3JFLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0NBQ3ZFLEVBQUU7O0NBRUYsQ0FBQyxJQUFJLFNBQVMsS0FBSyxFQUFFLEVBQUU7Q0FDdkIsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbEIsRUFBRTs7Q0FFRixDQUFDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0NBRWxELENBQUMsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDNUIsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbEIsRUFBRTs7Q0FFRixDQUFDLE9BQU87Q0FDUixFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQztDQUNqQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Q0FDakQsRUFBRSxDQUFDO0NBQ0gsQ0FBQzs7O0FDckJELEFBQ3FEOzs7O0NBSXJELFNBQVMscUJBQXFCLENBQUMsT0FBTyxFQUFFO0NBQ3hDLENBQUMsUUFBUSxPQUFPLENBQUMsV0FBVztDQUM1QixFQUFFLEtBQUssT0FBTztDQUNkLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxLQUFLO0NBQ3BDLElBQUksTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztDQUNoQyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsS0FBSyxPQUFPLENBQUMsUUFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsRUFBRTtDQUNyRSxLQUFLLE9BQU8sTUFBTSxDQUFDO0NBQ25CLEtBQUs7O0NBRUwsSUFBSSxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Q0FDeEIsS0FBSyxPQUFPLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDMUUsS0FBSzs7Q0FFTCxJQUFJLE9BQU87Q0FDWCxLQUFLLEdBQUcsTUFBTTtDQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztDQUMvRixLQUFLLENBQUM7Q0FDTixJQUFJLENBQUM7O0NBRUwsRUFBRSxLQUFLLFNBQVM7Q0FDaEIsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUs7Q0FDcEMsSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEVBQUU7Q0FDckUsS0FBSyxPQUFPLE1BQU0sQ0FBQztDQUNuQixLQUFLOztDQUVMLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0NBQ3hCLEtBQUssT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUMvRCxLQUFLOztDQUVMLElBQUksT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3ZGLElBQUksQ0FBQzs7Q0FFTCxFQUFFLEtBQUssT0FBTyxDQUFDO0NBQ2YsRUFBRSxLQUFLLFdBQVc7Q0FDbEIsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUs7Q0FDcEMsSUFBSSxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtDQUNyRSxLQUFLLE9BQU8sTUFBTSxDQUFDO0NBQ25CLEtBQUs7O0NBRUwsSUFBSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0NBQzdCLEtBQUssT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzNFLEtBQUs7O0NBRUwsSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO0NBQ2pGLElBQUksQ0FBQzs7Q0FFTCxFQUFFO0NBQ0YsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUs7Q0FDcEMsSUFBSSxJQUFJLEtBQUssS0FBSyxTQUFTLEtBQUssT0FBTyxDQUFDLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLEVBQUU7Q0FDckUsS0FBSyxPQUFPLE1BQU0sQ0FBQztDQUNuQixLQUFLOztDQUVMLElBQUksSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO0NBQ3hCLEtBQUssT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUM5QyxLQUFLOztDQUVMLElBQUksT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3JGLElBQUksQ0FBQztDQUNMLEVBQUU7Q0FDRixDQUFDOztDQUVELFNBQVMsb0JBQW9CLENBQUMsT0FBTyxFQUFFO0NBQ3ZDLENBQUMsSUFBSSxNQUFNLENBQUM7O0NBRVosQ0FBQyxRQUFRLE9BQU8sQ0FBQyxXQUFXO0NBQzVCLEVBQUUsS0FBSyxPQUFPO0NBQ2QsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEtBQUs7Q0FDdkMsSUFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Q0FFcEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRXRDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtDQUNqQixLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDOUIsS0FBSyxPQUFPO0NBQ1osS0FBSzs7Q0FFTCxJQUFJLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtDQUN4QyxLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDM0IsS0FBSzs7Q0FFTCxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDeEMsSUFBSSxDQUFDOztDQUVMLEVBQUUsS0FBSyxTQUFTO0NBQ2hCLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsV0FBVyxLQUFLO0NBQ3ZDLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRW5DLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtDQUNqQixLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDOUIsS0FBSyxPQUFPO0NBQ1osS0FBSzs7Q0FFTCxJQUFJLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtDQUN4QyxLQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ2hDLEtBQUssT0FBTztDQUNaLEtBQUs7O0NBRUwsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDMUQsSUFBSSxDQUFDOztDQUVMLEVBQUUsS0FBSyxPQUFPLENBQUM7Q0FDZixFQUFFLEtBQUssV0FBVztDQUNsQixHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsS0FBSztDQUN2QyxJQUFJLE1BQU0sT0FBTyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUM1RyxJQUFJLE1BQU0sUUFBUSxHQUFHLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxHQUFHLEtBQUssS0FBSyxJQUFJLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDOUosSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDO0NBQ2hDLElBQUksQ0FBQzs7Q0FFTCxFQUFFO0NBQ0YsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEtBQUs7Q0FDdkMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUU7Q0FDeEMsS0FBSyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0NBQzlCLEtBQUssT0FBTztDQUNaLEtBQUs7O0NBRUwsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDMUQsSUFBSSxDQUFDO0NBQ0wsRUFBRTtDQUNGLENBQUM7O0NBRUQsU0FBUyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUU7Q0FDN0MsQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtDQUN0RCxFQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsc0RBQXNELENBQUMsQ0FBQztDQUM5RSxFQUFFO0NBQ0YsQ0FBQzs7Q0FFRCxTQUFTLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFO0NBQ2hDLENBQUMsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0NBQ3JCLEVBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM3RSxFQUFFOztDQUVGLENBQUMsT0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDOztDQUVELFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7Q0FDaEMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Q0FDckIsRUFBRSxPQUFPQyxrQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ2hDLEVBQUU7O0NBRUYsQ0FBQyxPQUFPLEtBQUssQ0FBQztDQUNkLENBQUM7O0NBRUQsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0NBQzNCLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0NBQzNCLEVBQUUsT0FBTyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDdEIsRUFBRTs7Q0FFRixDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0NBQ2hDLEVBQUUsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDM0IsRUFBRTs7Q0FFRixDQUFDLE9BQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQzs7Q0FFRCxTQUFTLFVBQVUsQ0FBQyxLQUFLLEVBQUU7Q0FDM0IsQ0FBQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3RDLENBQUMsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDdkIsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDcEMsRUFBRTs7Q0FFRixDQUFDLE9BQU8sS0FBSyxDQUFDO0NBQ2QsQ0FBQzs7Q0FFRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUU7Q0FDdEIsQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Q0FDZixDQUFDLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDcEMsQ0FBQyxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUN2QixFQUFFLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzlCLEVBQUU7O0NBRUYsQ0FBQyxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7O0NBRUQsU0FBUyxPQUFPLENBQUMsS0FBSyxFQUFFO0NBQ3hCLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUMzQixDQUFDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkMsQ0FBQyxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUN4QixFQUFFLE9BQU8sRUFBRSxDQUFDO0NBQ1osRUFBRTs7Q0FFRixDQUFDLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsQ0FBQzs7Q0FFRCxTQUFTLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFO0NBQ3BDLENBQUMsSUFBSSxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFO0NBQ2pILEVBQUUsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN4QixFQUFFLE1BQU0sSUFBSSxPQUFPLENBQUMsYUFBYSxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssT0FBTyxDQUFDLEVBQUU7Q0FDNUgsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQztDQUN6QyxFQUFFOztDQUVGLENBQUMsT0FBTyxLQUFLLENBQUM7Q0FDZCxDQUFDOztDQUVELFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7Q0FDL0IsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztDQUN6QixFQUFFLE1BQU0sRUFBRSxJQUFJO0NBQ2QsRUFBRSxJQUFJLEVBQUUsSUFBSTtDQUNaLEVBQUUsV0FBVyxFQUFFLE1BQU07Q0FDckIsRUFBRSxvQkFBb0IsRUFBRSxHQUFHO0NBQzNCLEVBQUUsWUFBWSxFQUFFLEtBQUs7Q0FDckIsRUFBRSxhQUFhLEVBQUUsS0FBSztDQUN0QixFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRWIsQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7Q0FFNUQsQ0FBQyxNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FFakQ7Q0FDQSxDQUFDLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0NBRWpDLENBQUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Q0FDaEMsRUFBRSxPQUFPLEdBQUcsQ0FBQztDQUNiLEVBQUU7O0NBRUYsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRTVDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtDQUNiLEVBQUUsT0FBTyxHQUFHLENBQUM7Q0FDYixFQUFFOztDQUVGLENBQUMsS0FBSyxNQUFNLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0NBQ3ZDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7O0NBRTNGO0NBQ0E7Q0FDQSxFQUFFLEtBQUssR0FBRyxLQUFLLEtBQUssU0FBUyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsV0FBVyxLQUFLLE9BQU8sR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztDQUN4RyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztDQUM5QyxFQUFFOztDQUVGLENBQUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0NBQ3JDLEVBQUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3pCLEVBQUUsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtDQUNuRCxHQUFHLEtBQUssTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtDQUN2QyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQzdDLElBQUk7Q0FDSixHQUFHLE1BQU07Q0FDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQ3pDLEdBQUc7Q0FDSCxFQUFFOztDQUVGLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtDQUM3QixFQUFFLE9BQU8sR0FBRyxDQUFDO0NBQ2IsRUFBRTs7Q0FFRixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLO0NBQ3hILEVBQUUsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3pCLEVBQUUsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtDQUM1RTtDQUNBLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNuQyxHQUFHLE1BQU07Q0FDVCxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7Q0FDdkIsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sTUFBTSxDQUFDO0NBQ2hCLEVBQUUsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekIsQ0FBQzs7Q0FFRCxlQUFlLEdBQUcsT0FBTyxDQUFDO0NBQzFCLGFBQWEsR0FBRyxLQUFLLENBQUM7O0NBRXRCLGlCQUFpQixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sS0FBSztDQUN6QyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Q0FDZCxFQUFFLE9BQU8sRUFBRSxDQUFDO0NBQ1osRUFBRTs7Q0FFRixDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0NBQ3pCLEVBQUUsTUFBTSxFQUFFLElBQUk7Q0FDZCxFQUFFLE1BQU0sRUFBRSxJQUFJO0NBQ2QsRUFBRSxXQUFXLEVBQUUsTUFBTTtDQUNyQixFQUFFLG9CQUFvQixFQUFFLEdBQUc7Q0FDM0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztDQUViLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0NBRTVELENBQUMsTUFBTSxTQUFTLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7O0NBRWxELENBQUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDOUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Q0FDdkIsRUFBRSxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Q0FDN0MsR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRTtDQUNsRSxJQUFJLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQzNCLElBQUk7Q0FDSixHQUFHO0NBQ0gsRUFBRTs7Q0FFRixDQUFDLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0NBRXRDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTtDQUM3QixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzFCLEVBQUU7O0NBRUYsQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJO0NBQ3hCLEVBQUUsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUU1QixFQUFFLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtDQUMzQixHQUFHLE9BQU8sRUFBRSxDQUFDO0NBQ2IsR0FBRzs7Q0FFSCxFQUFFLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtDQUN0QixHQUFHLE9BQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUMvQixHQUFHOztDQUVILEVBQUUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0NBQzVCLEdBQUcsT0FBTyxLQUFLO0NBQ2YsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUMvQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLEdBQUc7O0NBRUgsRUFBRSxPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDN0QsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4QyxDQUFDLENBQUM7O0NBRUYsZ0JBQWdCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxLQUFLO0NBQ3ZDLENBQUMsT0FBTztDQUNSLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTtDQUM1QyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sQ0FBQztDQUN2QyxFQUFFLENBQUM7Q0FDSCxDQUFDLENBQUM7O0NBRUYsb0JBQW9CLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxLQUFLO0NBQzNDLENBQUMsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ3ZELENBQUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakQsQ0FBQyxNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7Q0FDeEQsQ0FBQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pDLENBQUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDOUQsQ0FBQyxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNyRCxDQUFDLElBQUksV0FBVyxFQUFFO0NBQ2xCLEVBQUUsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsRUFBRTs7Q0FFRixDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDdEMsQ0FBQzs7Ozs7Ozs7Q0NuVkQ7Q0FDQSxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Q0FDNUMsRUFBRSxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQztDQUM3QyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztDQUNsQyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztDQUNqQyxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO0NBQzNCLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUM7Q0FDNUIsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2hCLENBQUM7O0FBRUQsQ0FBTyxNQUFNLGFBQWEsQ0FBQztDQUMzQixFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO0NBQ2hDLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDM0IsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDakIsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7Q0FDakMsR0FBRzs7Q0FFSCxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Q0FDckIsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUN0QyxJQUFJLElBQUksVUFBVSxFQUFFO0NBQ3BCLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ25CLEtBQUs7Q0FDTCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUMzQixHQUFHO0NBQ0g7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQSxFQUFFLEtBQUssR0FBRztDQUNWLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7Q0FDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztDQUNyQixHQUFHOztDQUVILEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO0NBQ3BDLElBQUksSUFBSSxTQUFTLEdBQUc7Q0FDcEIsTUFBTSxJQUFJO0NBQ1YsTUFBTSxLQUFLO0NBQ1gsTUFBTSxVQUFVO0NBQ2hCLEtBQUssQ0FBQzs7Q0FFTixJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7Q0FDOUIsTUFBTSxTQUFTLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0NBQ3pELEtBQUssTUFBTTtDQUNYLE1BQU0sU0FBUyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0NBQy9DLEtBQUs7O0NBRUwsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUNoQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtDQUN2QyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7Q0FDL0MsS0FBSztDQUNMLEdBQUc7Q0FDSDtDQUNBLEVBQUUsZUFBZSxHQUFHO0NBQ3BCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJO0NBQ3RELE1BQU0sSUFBSSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN4RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDakYsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJO0NBQ3BELE1BQU0sSUFBSSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN4RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDL0UsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJO0NBQ3RELE1BQU0sSUFBSSxHQUFHLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN4RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0NBRWpGLEtBQUssQ0FBQyxDQUFDO0NBQ1A7Q0FDQSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSTtDQUNsRCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRTtDQUN0QyxRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtDQUMxQixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtDQUMxQixRQUFRLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtDQUMxQixRQUFRLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUztDQUNoQyxPQUFPLENBQUMsQ0FBQztDQUNULEtBQUssQ0FBQyxDQUFDO0NBQ1A7Q0FDQSxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsR0FBRyxJQUFJO0NBQzlDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0NBQ25DLFFBQVEsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO0NBQzVCLFFBQVEsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO0NBQzlCLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0NBQ3BCLE9BQU8sQ0FBQyxDQUFDO0NBQ1QsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUk7Q0FDNUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7Q0FDakMsUUFBUSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87Q0FDNUIsUUFBUSxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7Q0FDOUIsUUFBUSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7Q0FDcEIsT0FBTyxDQUFDLENBQUM7Q0FDVCxLQUFLLENBQUMsQ0FBQztDQUNQLEdBQUc7Q0FDSDs7RUFBQyxEQy9GRCxNQUFNLGVBQWUsR0FBRztDQUN4QixFQUFFLHVCQUF1QixFQUFFLElBQUk7Q0FDL0IsRUFBRSx5QkFBeUIsRUFBRSxJQUFJO0NBQ2pDLEVBQUUsbUNBQW1DLEVBQUUsS0FBSztDQUM1QyxDQUFDLENBQUM7OztBQUdGLENBQU8sTUFBTSxhQUFhLENBQUM7Q0FDM0IsRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxPQUFPLEVBQUU7Q0FDckUsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUMvRCxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0NBQzNCLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7Q0FDL0IsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztDQUMxQixJQUFJLElBQUksQ0FBQyx3QkFBd0IsR0FBRyx3QkFBd0IsQ0FBQztDQUM3RCxHQUFHOztDQUVILEVBQUUsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFO0NBQ3JCLElBQUksSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0NBQ3BELE1BQU0sT0FBTztDQUNiLEtBQUs7O0NBRUwsSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsR0FBRyxXQUFXLEVBQUU7Q0FDckUsTUFBTSxPQUFPO0NBQ2IsS0FBSzs7Q0FFTCxJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFO0NBQ3ZILE1BQU0sTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Q0FDdEQsTUFBTSxRQUFRLEtBQUssQ0FBQyxJQUFJO0NBQ3hCLFFBQVEsS0FBSyxPQUFPLEVBQUU7Q0FDdEIsVUFBVSxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssT0FBTyxFQUFFO0NBQ3ZDLFlBQVksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3BFLFdBQVcsTUFBTTtDQUNqQixZQUFZLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDOUYsV0FBVztDQUNYLFNBQVMsQ0FBQyxNQUFNO0NBQ2hCLFFBQVEsS0FBSyxLQUFLLEVBQUU7Q0FDcEIsVUFBVSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQzFGLFNBQVMsQ0FBQyxNQUFNO0NBQ2hCLFFBQVEsU0FBUztDQUNqQixVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2pFLFNBQVM7Q0FDVCxPQUFPO0NBQ1AsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Q0FDMUIsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFO0NBQzFDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7O0NBRXJELElBQUksTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDO0NBQ25DLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0NBQ2pDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0NBQ2pDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDOztDQUVqQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztDQUN0QyxJQUFJLENBQUMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztDQUN0QyxJQUFJLENBQUMsQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQzs7Q0FFckMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7Q0FDdkMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtDQUNoRyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQ3BFLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUM3RCxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDekQsUUFBUSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQzVELFFBQVEsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFO0NBQy9CLFVBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsU0FBUztDQUNULE9BQU87Q0FDUCxLQUFLO0NBQ0wsU0FBUztDQUNULE1BQU0sT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMvQixLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFO0NBQ25EO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDdkcsSUFBSSxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7Q0FDckIsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDekMsS0FBSzs7Q0FFTCxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztDQUNuQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQztDQUNqQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztDQUNyQyxJQUFJLENBQUMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0NBQzFCLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDOztDQUUzQjtDQUNBLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUU7Q0FDOUYsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUNwRSxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDN0QsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0NBQ3pELFFBQVEsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztDQUM1RCxRQUFRLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN2RCxPQUFPO0NBQ1AsS0FBSyxNQUFNO0NBQ1g7Q0FDQSxNQUFNLE9BQU8sQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDaEcsS0FBSztDQUNMLEdBQUc7O0NBRUg7Q0FDQTtDQUNBLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7Q0FDckQ7Q0FDQSxJQUFJLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7Q0FDekIsSUFBSSxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDOztDQUV6QixJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsV0FBVyxDQUFDO0NBQzdCLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUM7Q0FDOUIsSUFBSSxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7Q0FFL0M7Q0FDQSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDbEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLElBQUksSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztDQUNoRCxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTTtDQUNsRCxvQkFBb0IsU0FBUyxJQUFJLFdBQVcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDaEUsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDOUIsb0JBQW9CLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDN0MsSUFBSSxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs7Q0FFMUIsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtDQUNoRztDQUNBO0NBQ0E7Q0FDQSxNQUFNLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxPQUFPLENBQUMsV0FBVztDQUNwRCxXQUFXLE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtDQUN6RCxRQUFRLE1BQU0sOEVBQThFLENBQUM7Q0FDN0YsT0FBTztDQUNQLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDcEUsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0NBQzdELFFBQVEsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztDQUN6RCxRQUFRLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDNUQsUUFBUSxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7Q0FDL0IsVUFBVSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUU7Q0FDaEU7Q0FDQTtDQUNBO0NBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRztDQUN0QixjQUFjLGFBQWEsRUFBRSxLQUFLO0NBQ2xDLGNBQWMsVUFBVSxFQUFFLEtBQUs7Q0FDL0IsY0FBYyxNQUFNLEVBQUUsS0FBSztDQUMzQixjQUFjLFdBQVcsRUFBRSxLQUFLO0NBQ2hDLGNBQWMsU0FBUyxFQUFFLEtBQUs7Q0FDOUIsY0FBYyxVQUFVLEVBQUUsQ0FBQztDQUMzQixjQUFjLE9BQU8sRUFBRSxDQUFDLFNBQVMsSUFBSSxXQUFXLElBQUksQ0FBQyxHQUFHLENBQUM7Q0FDekQsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Q0FDOUIsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Q0FDOUIsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxZQUFZLEVBQUUsQ0FBQyxDQUFDLFlBQVk7Q0FDMUMsY0FBYyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7Q0FDdEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsZ0JBQWdCO0NBQ2xELGNBQWMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO0NBQzlCLGNBQWMsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFVO0NBQ3RDLGNBQWMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTO0NBQ3BDLGNBQWMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO0NBQzlCLGNBQWMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNO0NBQzlCLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0NBQ2hDLGNBQWMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTO0NBQ3BDLGNBQWMsU0FBUyxFQUFFLENBQUMsQ0FBQyxTQUFTO0NBQ3BDLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0NBQ2hDLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0NBQ2hDLGNBQWMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO0NBQzVCLGNBQWMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO0NBQzVCLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO0NBQzFCLGNBQWMsYUFBYSxFQUFFLENBQUMsQ0FBQyxhQUFhO0NBQzVDLGNBQWMsV0FBVyxFQUFFLENBQUMsQ0FBQyxXQUFXO0NBQ3hDLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0NBQ2hDLGNBQWMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPO0NBQ2hDLGNBQWMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRO0NB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QUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7Q0FFN0MsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3JELE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNuRCxLQUFLLENBQUMsQ0FBQzs7Q0FFUCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSTtDQUNyRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Q0FDbkQsS0FBSyxDQUFDLENBQUM7Q0FDUCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSTtDQUNuRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDbEQsS0FBSyxDQUFDLENBQUM7O0NBRVAsR0FBRzs7Q0FFSCxFQUFFLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7Q0FDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUN6QixJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQzFELE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQ3RCLEtBQUs7Q0FDTCxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENB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QUFTLGVBQWUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQ3BDLEVBQUUsSUFBSSxHQUFHLEdBQUcsRUFBQzs7Q0FFYixFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQ3ZDLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDeEMsTUFBTSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUM7Q0FDeEQsTUFBTSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUM7O0NBRTFELE1BQU0sSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxFQUFDOztDQUVsRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0NBQzFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUM7Q0FDMUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztDQUMxQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0NBQzFDLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsQ0FBQzs7QUFFRCxDQUFPLFNB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QUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtDQUM3QyxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRztDQUM5QixRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7O0NBRTlCLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUNuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztDQUVuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0NBQ25DLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7Q0FFbkMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRWxELElBQUksSUFBSSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRXhCLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0NBQ2pELFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUVsRCxJQUFJLE9BQU8sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDM0QsQ0FBQzs7Q0FFRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTs7Q0FFcEY7Q0FDQSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3JCLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztDQUMvQixDQUFDOztDQUVELFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7Q0FDekMsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4QixJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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
