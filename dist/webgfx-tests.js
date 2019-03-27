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
	      performance.now = Date.now = function() { return self.fakedTime * 1000.0 * self.timeScale / this.refreshRate; };
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

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return key => (result, value) => {
					const index = result.length;
					if (value === undefined) {
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
					if (value === undefined) {
						return result;
					}

					if (value === null) {
						return [...result, [encode(key, options), '[]'].join('')];
					}

					return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
				};

			case 'comma':
				return key => (result, value, index) => {
					if (!value) {
						return result;
					}

					if (index === 0) {
						return [[encode(key, options), '=', encode(value, options)].join('')];
					}

					return [[result, encode(value, options)].join(',')];
				};

			default:
				return key => (result, value) => {
					if (value === undefined) {
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
				return (key, value, accumulator) => {
					const isArray = typeof value === 'string' && value.split('').indexOf(',') > -1;
					const newValue = isArray ? value.split(',') : value;
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
		options = Object.assign({
			decode: true,
			arrayFormat: 'none'
		}, options);

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

	var stringify = (object, options) => {
		if (!object) {
			return '';
		}

		options = Object.assign({
			encode: true,
			strict: true,
			arrayFormat: 'none'
		}, options);

		const formatter = encoderForArrayFormat(options);
		const keys = Object.keys(object);

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
	    this.id = Math.random();
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
	        if (type == eventType) {
	          listener.call(this_, e);
	        }
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

	  numFramesToRender: typeof parameters['num-frames'] === 'undefined' ? 1200 : parseInt(parameters['num-frames']),

	  // Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
	  referenceTestPreTickCalledCount: 0,

	  // Canvas used by the test to render
	  canvas: null,

	  inputRecorder: null,

	  // Wallclock time for when we started CPU execution of the current frame.
	  // var referenceTestT0 = -1;

	  postTick: function () {
	    WebGLStats$1.frameEnd();
	    //console.log('>>', JSON.stringify(WebGLStats.getCurrentData()));
	  },

	  preTick: function() {
	    WebGLStats$1.frameStart();

	    if (++this.referenceTestPreTickCalledCount == 1) {
	      this.stats.frameStart();

	      if (!this.canvas) {
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
	            console.log('replaying');
	            this.inputLoading = true;

	            // @fixme Prevent multiple fetch while waiting
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
	    }
	  },

	  tick: function () {
	    if (--this.referenceTestPreTickCalledCount > 0)
	      return; // We are being called recursively, so ignore this call.

	    if (!this.ready) {return;}

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

	    if (this.referenceTestFrameNumber === this.numFramesToRender) ;

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    this.previousEventHandlerExitedTime = performance.realNow();

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

	    this.socket.emit('test_started', {id: GFXTESTS_CONFIG.id});

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
	        },
	        numFrames: this.numFramesToRender,
	        totalTime: totalTime,
	        timeToFirstFrame: this.firstFrameTime - pageInitTime,
	        avgFps: fps,
	        numStutterEvents: this.numStutterEvents,
	        totalTime: totalTime,
	        totalRenderTime: totalRenderTime,
	        cpuTime: this.stats.totalTimeInMainLoop,
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

      /*
      #test_images img:hover {
        top: 0px; 
        left: 0px;
        height: 80%;
        width: 80%;
        position: fixed;
      }
      */

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

	    if (this.inputRecorder) {
	      this.addInputDownloadButton();
	    }

	    try {
	      var data = this.canvas.toDataURL("image/png");
	      var description = this.inputRecorder ? 'Download reference image' : 'Actual render';
	      this.createDownloadImageLink(data, GFXTESTS_CONFIG.id, description);
	    } catch(e) {
	      console.error("Can't generate image");
	    }

	    if (this.inputRecorder) {
	      document.getElementById('test_finished').style.visibility = 'visible';
	      document.getElementById('reference-images-error').style.display = 'block';
	    } else {
	      this.generateBenchmarkResult().then(result => {
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
	      });  
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
          box-shadow: inset 0 -1px 0 rgba(0,0,0,.15);
          -webkit-transition: width .6s ease;
          -o-transition: width .6s ease;
          transition: width .6s ease;`;
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

	  hookRAF: function () {
	    if (!window.realRequestAnimationFrame) {
	      window.realRequestAnimationFrame = window.requestAnimationFrame;
	      window.requestAnimationFrame = callback => {
	        const hookedCallback = p => {
	          if (GFXTESTS_CONFIG.preMainLoop) { 
	            GFXTESTS_CONFIG.preMainLoop(); 
	          }
	          this.preTick();
	    
	          callback(performance.now());
	          this.tick();
	          this.stats.frameEnd();

	          this.postTick();
	          
	          if (this.referenceTestFrameNumber === this.numFramesToRender) {
	            this.benchmarkFinished();
	            return;
	          }

	          if (GFXTESTS_CONFIG.postMainLoop) {
	            GFXTESTS_CONFIG.postMainLoop();
	          }
	        };
	        return window.realRequestAnimationFrame(hookedCallback);
	      };
	    }
	  },

	  init: function () {

	    if (!GFXTESTS_CONFIG.providesRafIntegration) {
	      this.hookRAF();
	    }

	    this.addProgressBar();
	    this.addInfoOverlay();

	    console.log('Frames to render:', this.numFramesToRender);

	    if (!GFXTESTS_CONFIG.dontOverrideTime) {
	      FakeTimers.enable();
	    }

	    Math.random = seedrandom$1(this.randomSeed);

	    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, {width: this.canvasWidth, height: this.canvasHeight}));
	    this.hookModals();

	    this.onResize();
	    window.addEventListener('resize', this.onResize.bind(this));

	    this.initServer();

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

	  injectAutoEnterXR: function(canvas) {
	    if (navigator.getVRDisplays) {
	      setTimeout(() => {
	        navigator.getVRDisplays().then(displays => {
	          var device = displays[0];
	          //if (device.isPresenting) device.exitPresent();
	          if (device) {
	            device.requestPresent( [ { source: canvas } ] );
	          }
	        }), 2000;}); // @fix to make it work on FxR
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jYW52YXMtaG9vay9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbmNyZW1lbnRhbC1zdGF0cy1saXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLXN0YXRzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL2FsZWEuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yMTI4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcndvdy5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3JzaGlmdDcuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yNDA5Ni5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi90eWNoZWkuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9zZWVkcmFuZG9tLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vLi4vaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZWNvcmRlci5qcyIsIi4uLy4uL2lucHV0LWV2ZW50cy1yZWNvcmRlci9zcmMvcmVwbGF5ZXIuanMiLCIuLi9zcmMvY2xpZW50L2V2ZW50LWxpc3RlbmVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9rZXlzdHJva2UtdmlzdWFsaXplci9zcmMvaW5kZXguanMiLCIuLi9zcmMvY2xpZW50L2lucHV0LWhlbHBlcnMuanMiLCIuLi9zcmMvY2xpZW50L2ltYWdlLXV0aWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3BpeGVsbWF0Y2gvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvd2ViZ2wtc3RhdHMvaW5kZXguanMiLCIuLi9zcmMvY2xpZW50L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFJlYWxEYXRlID0gRGF0ZTtcblxuY2xhc3MgTW9ja0RhdGUge1xuICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgdGhpcy50ID0gdDtcbiAgfVxuXG4gIHN0YXRpYyBub3coKSB7XG4gICAgcmV0dXJuIFJlYWxEYXRlLm5vdygpO1xuICB9XG5cbiAgc3RhdGljIHJlYWxOb3coKSB7XG4gICAgcmV0dXJuIFJlYWxEYXRlLm5vdygpO1xuICB9XG5cbiAgZ2V0VGltZXpvbmVPZmZzZXQoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB0b1RpbWVTdHJpbmcoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZ2V0RGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0SG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldE1pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFRpbWUoKSB7IHJldHVybiAwOyB9XG4gIGdldFllYXIoKSB7IHJldHVybiAwOyB9XG5cbiAgc3RhdGljIFVUQygpIHsgcmV0dXJuIDA7IH1cblxuICBnZXRVVENEYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENEYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0Z1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDU2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cblxuICBzZXREYXRlKCkge31cbiAgc2V0RnVsbFllYXIoKSB7fVxuICBzZXRIb3VycygpIHt9XG4gIHNldE1pbGxpc2Vjb25kcygpIHt9XG4gIHNldE1pbnV0ZXMoKSB7fVxuICBzZXRNb250aCgpIHt9XG4gIHNldFNlY29uZHMoKSB7fVxuICBzZXRUaW1lKCkge31cblxuICBzZXRVVENEYXRlKCkge31cbiAgc2V0VVRDRnVsbFllYXIoKSB7fVxuICBzZXRVVENIb3VycygpIHt9XG4gIHNldFVUQ01pbGxpc2Vjb25kcygpIHt9XG4gIHNldFVUQ01pbnV0ZXMoKSB7fVxuICBzZXRVVENNb250aCgpIHt9XG5cbiAgc2V0WWVhcigpIHt9XG59XG5cbnZhciByZWFsUGVyZm9ybWFuY2U7XG5cbmlmICghcGVyZm9ybWFuY2UucmVhbE5vdykge1xuICB2YXIgaXNTYWZhcmkgPSAvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICBpZiAoaXNTYWZhcmkpIHtcbiAgICByZWFsUGVyZm9ybWFuY2UgPSBwZXJmb3JtYW5jZTtcbiAgICBwZXJmb3JtYW5jZSA9IHtcbiAgICAgIHJlYWxOb3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9LFxuICAgICAgbm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfVxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcGVyZm9ybWFuY2UucmVhbE5vdyA9IHBlcmZvcm1hbmNlLm5vdztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRpbWVTY2FsZTogMS4wLFxuICBmYWtlZFRpbWU6IDAsXG4gIGVuYWJsZWQ6IGZhbHNlLFxuICByZWZyZXNoUmF0ZTogNjAsXG4gIG5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcjogZmFsc2UsXG4gIHNldEZha2VkVGltZTogZnVuY3Rpb24oIG5ld0Zha2VkVGltZSApIHtcbiAgICB0aGlzLmZha2VkVGltZSA9IG5ld0Zha2VkVGltZTtcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgRGF0ZSA9IE1vY2tEYXRlO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLm5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcikge1xuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyB0aGlzLnJlZnJlc2hSYXRlOyB9XG4gICAgfVxuXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfTtcblxuICAgIERhdGUgPSBSZWFsRGF0ZTtcbiAgICBwZXJmb3JtYW5jZS5ub3cgPSByZWFsUGVyZm9ybWFuY2Uubm93O1xuXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7XG4gIH1cbn0iLCJjb25zdCBvcmlnaW5hbCA9IFsnZ2V0UGFyYW1ldGVyJywgJ2dldEV4dGVuc2lvbicsICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnXTtcbmNvbnN0IGVtcHR5U3RyaW5nID0gWydnZXRTaGFkZXJJbmZvTG9nJywgJ2dldFByb2dyYW1JbmZvTG9nJ107XG5jb25zdCByZXR1cm4xID0gWydpc0J1ZmZlcicsICdpc0VuYWJsZWQnLCAnaXNGcmFtZWJ1ZmZlcicsICdpc1Byb2dyYW0nLCAnaXNRdWVyeScsICdpc1ZlcnRleEFycmF5JywgJ2lzU2FtcGxlcicsICdpc1N5bmMnLCAnaXNUcmFuc2Zvcm1GZWVkYmFjaycsXG4naXNSZW5kZXJidWZmZXInLCAnaXNTaGFkZXInLCAnaXNUZXh0dXJlJywgJ3ZhbGlkYXRlUHJvZ3JhbScsICdnZXRTaGFkZXJQYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7ICBcbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFlbmFibGVkKSB7cmV0dXJuO31cbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubiA9IDA7XG4gICAgdGhpcy5taW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMubWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMubWVhbiA9IDA7XG4gICAgdGhpcy5xID0gMDtcbiAgfVxuXG4gIGdldCB2YXJpYW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5xIC8gdGhpcy5uO1xuICB9XG5cbiAgZ2V0IHN0YW5kYXJkX2RldmlhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubik7XG4gIH1cblxuICB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgIC8vIFNvcnJ5LCBubyBOYU5zXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubisrO1xuICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSk7XG4gICAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKTtcbiAgICB0aGlzLnN1bSArPSBudW07XG4gICAgY29uc3QgcHJldk1lYW4gPSB0aGlzLm1lYW47XG4gICAgdGhpcy5tZWFuID0gdGhpcy5tZWFuICsgKG51bSAtIHRoaXMubWVhbikgLyB0aGlzLm47XG4gICAgdGhpcy5xID0gdGhpcy5xICsgKG51bSAtIHByZXZNZWFuKSAqIChudW0gLSB0aGlzLm1lYW4pO1xuICB9XG5cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuOiB0aGlzLm4sXG4gICAgICBtaW46IHRoaXMubWluLFxuICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgIHN1bTogdGhpcy5zdW0sXG4gICAgICBtZWFuOiB0aGlzLm1lYW4sXG4gICAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICB9O1xuICB9ICBcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgdmFyIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9IDA7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKSAgICAgICAgXG4gICAgfSxcblxuICAgIG51bUZyYW1lczogMCxcbiAgICBsb2c6IGZhbHNlLFxuICAgIHRvdGFsVGltZUluTWFpbkxvb3A6IDAsXG4gICAgdG90YWxUaW1lT3V0c2lkZU1haW5Mb29wOiAwLFxuICAgIGZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbDogMjAwLCAvLyBtc2Vjc1xuXG4gICAgZnJhbWVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPT0gMSkgXG4gICAgICB7XG4gICAgICAgIGlmIChsYXN0VXBkYXRlVGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RVcGRhdGVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpXG4gICAgICB7XG4gICAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lcyAqIDEwMDAgLyAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lKTtcbiAgICAgICAgdGhpcy5udW1GcmFtZXMgPSAwO1xuICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVOb3c7XG5cbiAgICAgICAgaWYgKGZpcnN0RnBzKVxuICAgICAgICB7XG4gICAgICAgICAgZmlyc3RGcHMgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRzLmZwcy51cGRhdGUoZnBzKTtcblxuICAgICAgICBpZiAodGhpcy5sb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZnBzIC0gbWluOiAke3RoaXMuc3RhdHMuZnBzLm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmZwcy5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZnBzLm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmZwcy5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgbXMgIC0gbWluOiAke3RoaXMuc3RhdHMuZHQubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZHQubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmR0Lm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmR0LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBjcHUgLSBtaW46ICR7dGhpcy5zdGF0cy5jcHUubWluLnRvRml4ZWQoMil9JSAvIGF2ZzogJHt0aGlzLnN0YXRzLmNwdS5tZWFuLnRvRml4ZWQoMil9JSAvIG1heDogJHt0aGlzLnN0YXRzLmNwdS5tYXgudG9GaXhlZCgyKX0lIC0gc3RkOiAke3RoaXMuc3RhdHMuY3B1LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfSVgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDYWxsZWQgaW4gdGhlIGVuZCBvZiBlYWNoIG1haW4gbG9vcCBmcmFtZSB0aWNrLlxuICAgIGZyYW1lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlci0tO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHJlc3VsdC5sZW5ndGg7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbJywgaW5kZXgsICddJ10uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHQuLi5yZXN1bHQsXG5cdFx0XHRcdFx0W2VuY29kZShrZXksIG9wdGlvbnMpLCAnWycsIGVuY29kZShpbmRleCwgb3B0aW9ucyksICddPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXG5cdFx0XHRcdF07XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXT0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnY29tbWEnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSwgaW5kZXgpID0+IHtcblx0XHRcdFx0aWYgKCF2YWx1ZSkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaW5kZXggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gW1tlbmNvZGUoa2V5LCBvcHRpb25zKSwgJz0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gW1tyZXN1bHQsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJywnKV07XG5cdFx0XHR9O1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIGVuY29kZShrZXksIG9wdGlvbnMpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBbZW5jb2RlKGtleSwgb3B0aW9ucyksICc9JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC8oXFxbXFxdKSQvLmV4ZWMoa2V5KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbdmFsdWVdO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2NvbW1hJzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0Y29uc3QgaXNBcnJheSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUuc3BsaXQoJycpLmluZGV4T2YoJywnKSA+IC0xO1xuXHRcdFx0XHRjb25zdCBuZXdWYWx1ZSA9IGlzQXJyYXkgPyB2YWx1ZS5zcGxpdCgnLCcpIDogdmFsdWU7XG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBuZXdWYWx1ZTtcblx0XHRcdH07XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSBbXS5jb25jYXQoYWNjdW11bGF0b3Jba2V5XSwgdmFsdWUpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZW5jb2RlKSB7XG5cdFx0cmV0dXJuIG9wdGlvbnMuc3RyaWN0ID8gc3RyaWN0VXJpRW5jb2RlKHZhbHVlKSA6IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5kZWNvZGUpIHtcblx0XHRyZXR1cm4gZGVjb2RlQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5c1NvcnRlcihpbnB1dCkge1xuXHRpZiAoQXJyYXkuaXNBcnJheShpbnB1dCkpIHtcblx0XHRyZXR1cm4gaW5wdXQuc29ydCgpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcpIHtcblx0XHRyZXR1cm4ga2V5c1NvcnRlcihPYmplY3Qua2V5cyhpbnB1dCkpXG5cdFx0XHQuc29ydCgoYSwgYikgPT4gTnVtYmVyKGEpIC0gTnVtYmVyKGIpKVxuXHRcdFx0Lm1hcChrZXkgPT4gaW5wdXRba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3QoaW5wdXQpIHtcblx0Y29uc3QgcXVlcnlTdGFydCA9IGlucHV0LmluZGV4T2YoJz8nKTtcblx0aWYgKHF1ZXJ5U3RhcnQgPT09IC0xKSB7XG5cdFx0cmV0dXJuICcnO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0LnNsaWNlKHF1ZXJ5U3RhcnQgKyAxKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdGRlY29kZTogdHJ1ZSxcblx0XHRhcnJheUZvcm1hdDogJ25vbmUnXG5cdH0sIG9wdGlvbnMpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdC8vIENyZWF0ZSBhbiBvYmplY3Qgd2l0aCBubyBwcm90b3R5cGVcblx0Y29uc3QgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuXHRpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRpbnB1dCA9IGlucHV0LnRyaW0oKS5yZXBsYWNlKC9eWz8jJl0vLCAnJyk7XG5cblx0aWYgKCFpbnB1dCkge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmb3IgKGNvbnN0IHBhcmFtIG9mIGlucHV0LnNwbGl0KCcmJykpIHtcblx0XHRsZXQgW2tleSwgdmFsdWVdID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcblxuXHRcdC8vIE1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0Ly8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuXHRcdHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iamVjdCwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIW9iamVjdCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZSdcblx0fSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ICE9PSBmYWxzZSkge1xuXHRcdGtleXMuc29ydChvcHRpb25zLnNvcnQpO1xuXHR9XG5cblx0cmV0dXJuIGtleXMubWFwKGtleSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHRcdFx0LnJlZHVjZShmb3JtYXR0ZXIoa2V5KSwgW10pXG5cdFx0XHRcdC5qb2luKCcmJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpICsgJz0nICsgZW5jb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0fSkuZmlsdGVyKHggPT4geC5sZW5ndGggPiAwKS5qb2luKCcmJyk7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGhhc2hTdGFydCA9IGlucHV0LmluZGV4T2YoJyMnKTtcblx0aWYgKGhhc2hTdGFydCAhPT0gLTEpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGhhc2hTdGFydCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHVybDogaW5wdXQuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuIiwiLy8gTWFwcyBtb3VzZSBjb29yZGluYXRlIGZyb20gZWxlbWVudCBDU1MgcGl4ZWxzIHRvIG5vcm1hbGl6ZWQgWyAwLCAxIF0gcmFuZ2UuXG5mdW5jdGlvbiBjb21wdXRlTm9ybWFsaXplZFBvcyhlbGVtZW50LCBldnQpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICB2YXIgeSA9IGV2dC5jbGllbnRZIC0gcmVjdC50b3A7XG4gIHggLz0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgeSAvPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgcmV0dXJuIFt4LCB5XTtcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0UmVjb3JkZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fMKge307XG4gIH1cblxuICBlbmFibGUoZm9yY2VSZXNldCkge1xuICAgIHRoaXMuaW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoZm9yY2VSZXNldCkge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICB0aGlzLmluamVjdExpc3RlbmVycygpO1xuICB9XG4vKlxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKCk7XG4gIH1cbiovXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5mcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIGFkZEV2ZW50KHR5cGUsIGV2ZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgIHR5cGUsXG4gICAgICBldmVudCxcbiAgICAgIHBhcmFtZXRlcnNcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VUaW1lKSB7XG4gICAgICBldmVudERhdGEudGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5pbml0VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnREYXRhLmZyYW1lTnVtYmVyID0gdGhpcy5mcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50RGF0YSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9wdGlvbnMubmV3RXZlbnRDYWxsYmFjayhldmVudERhdGEpO1xuICAgIH1cbiAgfVxuICBcbiAgaW5qZWN0TGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ2Rvd24nLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAndXAnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICdtb3ZlJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcblxuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnd2hlZWwnLCB7XG4gICAgICAgIGRlbHRhWDogZXZ0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBldnQuZGVsdGFZLFxuICAgICAgICBkZWx0YVo6IGV2dC5kZWx0YVosXG4gICAgICAgIGRlbHRhTW9kZTogZXZ0LmRlbHRhTW9kZVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdrZXknLCAnZG93bicsIHtcbiAgICAgICAga2V5Q29kZTogZXZ0LmtleUNvZGUsXG4gICAgICAgIGNoYXJDb2RlOiBldnQuY2hhckNvZGUsXG4gICAgICAgIGtleTogZXZ0LmtleVxuICAgICAgfSk7XG4gICAgfSk7XG4gIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdrZXknLCAndXAnLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pOyAgXG4gIH1cbn0iLCJcbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgZGlzcGF0Y2hLZXlFdmVudHNWaWFET006IHRydWUsXG4gIGRpc3BhdGNoTW91c2VFdmVudHNWaWFET006IHRydWUsXG4gIG5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzOiBmYWxzZVxufTtcblxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZXBsYXllciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHJlY29yZGluZywgcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5pZCA9IE1hdGgucmFuZG9tKCk7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zKTtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMucmVjb3JkaW5nID0gcmVjb3JkaW5nO1xuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IHJlZ2lzdGVyZWRFdmVudExpc3RlbmVyczsgLy8gSWYgPT09IG51bGwgLT4gRGlzcGF0Y2ggdG8gRE9NXG4gIH1cblxuICB0aWNrIChmcmFtZU51bWJlcikge1xuICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnJlY29yZGluZy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdLmZyYW1lTnVtYmVyID4gZnJhbWVOdW1iZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnJlY29yZGluZy5sZW5ndGggJiYgdGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdLmZyYW1lTnVtYmVyID09PSBmcmFtZU51bWJlcikge1xuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgICBzd2l0Y2ggKGlucHV0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbW91c2UnOiB7XG4gICAgICAgICAgaWYgKGlucHV0LmV2ZW50ID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICB0aGlzLnNpbXVsYXRlV2hlZWxFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNpbXVsYXRlTW91c2VFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBjYXNlICdrZXknOiB7XG4gICAgICAgICAgdGhpcy5zaW11bGF0ZUtleUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgfSBicmVhaztcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdTdGlsbCBub3QgaW1wbGVtZW50ZWQgZXZlbnQnLCBpbnB1dC50eXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcbiAgICB9XG4gIH1cblxuICBzaW11bGF0ZVdoZWVsRXZlbnQoZWxlbWVudCwgcGFyYW1ldGVycykge1xuICAgIHZhciBlID0gbmV3IEV2ZW50KCdtb3VzZXdoZWVsJywge2J1YmJsZXM6IHRydWV9KTtcblxuICAgIGNvbnN0IGV2ZW50VHlwZSA9ICdtb3VzZXdoZWVsJztcbiAgICBlLmRlbHRhWCA9IHBhcmFtZXRlcnMuZGVsdGFYO1xuICAgIGUuZGVsdGFZID0gcGFyYW1ldGVycy5kZWx0YVk7XG4gICAgZS5kZWx0YVogPSBwYXJhbWV0ZXJzLmRlbHRhWjtcblxuICAgIGUud2hlZWxEZWx0YVggPSBwYXJhbWV0ZXJzLmRlbHRhWDtcbiAgICBlLndoZWVsRGVsdGFZID0gcGFyYW1ldGVycy5kZWx0YVk7XG4gICAgZS53aGVlbERlbHRhID0gcGFyYW1ldGVycy5kZWx0YVk7XG5cbiAgICBlLmRlbHRhTW9kZSA9IHBhcmFtZXRlcnMuZGVsdGFNb2RlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSkge1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cblxuICBzaW11bGF0ZUtleUV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgcGFyYW1ldGVycykge1xuICAgIC8vIERvbid0IHVzZSB0aGUgS2V5Ym9hcmRFdmVudCBvYmplY3QgYmVjYXVzZSBvZiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg5NDI2Nzgva2V5Ym9hcmRldmVudC1pbi1jaHJvbWUta2V5Y29kZS1pcy0wLzEyNTIyNzUyIzEyNTIyNzUyXG4gICAgLy8gU2VlIGFsc28gaHR0cDovL291dHB1dC5qc2Jpbi5jb20vYXdlbmFxLzNcbiAgICAvLyAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdLZXlib2FyZEV2ZW50Jyk7XG4gICAgLy8gICAgaWYgKGUuaW5pdEtleUV2ZW50KSB7XG4gICAgLy8gICAgICBlLmluaXRLZXlFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGtleUNvZGUsIGNoYXJDb2RlKTtcbiAgICAvLyAgfSBlbHNlIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBlLmtleUNvZGUgPSBwYXJhbWV0ZXJzLmtleUNvZGU7XG4gICAgZS53aGljaCA9IHBhcmFtZXRlcnMua2V5Q29kZTtcbiAgICBlLmNoYXJDb2RlID0gcGFyYW1ldGVycy5jaGFyQ29kZTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG4gICAgZS5rZXkgPSBwYXJhbWV0ZXJzLmtleTtcblxuICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIEVtc2NyaXB0ZW4ncyBodG1sNS5oIEFQSTpcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkge1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpc3BhdGNoIHRvIGJyb3dzZXIgZm9yIHJlYWxcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudCA/IGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKSA6IGVsZW1lbnQuZmlyZUV2ZW50KFwib25cIiArIGV2ZW50VHlwZSwgZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXZlbnRUeXBlOiBcIm1vdXNlbW92ZVwiLCBcIm1vdXNlZG93blwiIG9yIFwibW91c2V1cFwiLlxuICAvLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG4gIHNpbXVsYXRlTW91c2VFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcblxuICAgIC8vIFJlbWFwIGZyb20gWzAsMV0gdG8gY2FudmFzIENTUyBwaXhlbCBzaXplLlxuICAgIHZhciB4ID0gcGFyYW1ldGVycy54O1xuICAgIHZhciB5ID0gcGFyYW1ldGVycy55O1xuXG4gICAgeCAqPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIHkgKj0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gT2Zmc2V0IHRoZSBpbmplY3RlZCBjb29yZGluYXRlIGZyb20gdG9wLWxlZnQgb2YgdGhlIGNsaWVudCBhcmVhIHRvIHRoZSB0b3AtbGVmdCBvZiB0aGUgY2FudmFzLlxuICAgIHggPSBNYXRoLnJvdW5kKHJlY3QubGVmdCArIHgpO1xuICAgIHkgPSBNYXRoLnJvdW5kKHJlY3QudG9wICsgeSk7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRzXCIpO1xuICAgIGUuaW5pdE1vdXNlRXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9PSAnbW91c2Vtb3ZlJyA/IDAgOiAxLCB4LCB5LCB4LCB5LFxuICAgICAgICAgICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLmJ1dHRvbiwgbnVsbCk7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKSB7XG4gICAgICAvLyBQcm9ncmFtbWF0aWNhbGx5IHJlYXRpbmcgRE9NIGV2ZW50cyBkb2Vzbid0IGFsbG93IHNwZWNpZnlpbmcgb2Zmc2V0WCAmIG9mZnNldFkgcHJvcGVybHlcbiAgICAgIC8vIGZvciB0aGUgZWxlbWVudCwgYnV0IHRoZXkgbXVzdCBiZSB0aGUgc2FtZSBhcyBjbGllbnRYICYgY2xpZW50WS4gVGhlcmVmb3JlIHdlIGNhbid0IGhhdmUgYVxuICAgICAgLy8gYm9yZGVyIHRoYXQgd291bGQgbWFrZSB0aGVzZSBkaWZmZXJlbnQuXG4gICAgICBpZiAoZWxlbWVudC5jbGllbnRXaWR0aCAhPSBlbGVtZW50Lm9mZnNldFdpZHRoXG4gICAgICAgIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgIHRocm93IFwiRVJST1IhIENhbnZhcyBvYmplY3QgbXVzdCBoYXZlIDBweCBib3JkZXIgZm9yIGRpcmVjdCBtb3VzZSBkaXNwYXRjaCB0byB3b3JrIVwiO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJZiBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcyBpcyBzZXQsIHRoZSBwYWdlIG5lZWRzIGEgZnVsbCBzZXQgb2YgYXR0cmlidXRlc1xuICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBuZXcgY3VzdG9tIG9iamVjdCAod2l0aG91dCBwcm90b3R5cGUgY2hhaW4pIHRvIGhvbGQgdGhlIG92ZXJyaWRkZW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBldnQgPSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBzcmNFbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0b0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICBldmVudFBoYXNlOiAyLCAvLyBFdmVudC5BVF9UQVJHRVRcbiAgICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgICAgYnV0dG9uOiBlLmJ1dHRvbixcbiAgICAgICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgICBjYW5jZWxCdWJibGU6IGUuY2FuY2VsQnViYmxlLFxuICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBlLmNhbmNlbGFibGUsXG4gICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZLFxuICAgICAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLmRldGFpbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogZS5pZGVudGlmaWVyLFxuICAgICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgICBsYXllclg6IGUubGF5ZXJYLFxuICAgICAgICAgICAgICBsYXllclk6IGUubGF5ZXJZLFxuICAgICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICAgIG1vdmVtZW50WDogZS5tb3ZlbWVudFgsXG4gICAgICAgICAgICAgIG1vdmVtZW50WTogZS5tb3ZlbWVudFksXG4gICAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogZS5vZmZzZXRZLFxuICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICAgIHBhdGg6IGUucGF0aCxcbiAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZS5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgICAgc2NyZWVuWDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICBzY3JlZW5ZOiBlLnNjcmVlblksXG4gICAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgICBzb3VyY2VDYXBhYmlsaXRpZXM6IGUuc291cmNlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICB0aW1lU3RhbXA6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICAgIHZpZXc6IGUudmlldyxcbiAgICAgICAgICAgICAgd2hpY2g6IGUud2hpY2gsXG4gICAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgICAgeTogZS55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHJlZ3VsYXIgJ2UnIG9iamVjdCBpcyBlbm91Z2ggKGl0IGRvZXNuJ3QgcG9wdWxhdGUgYWxsIG9mIHRoZSBzYW1lIGZpZWxkcyB0aGFuIGEgcmVhbCBtb3VzZSBldmVudCBkb2VzLFxuICAgICAgICAgICAgLy8gc28gdGhpcyBtaWdodCBub3Qgd29yayBvbiBzb21lIGRlbW9zKVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIGJyb3dzZXJcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50TGlzdGVuZXJNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIC8vIERvbid0IGNhbGwgYW55IGFwcGxpY2F0aW9uIHBhZ2UgdW5sb2FkIGhhbmRsZXJzIGFzIGEgcmVzcG9uc2UgdG8gd2luZG93IGJlaW5nIGNsb3NlZC5cbiAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpIHtcbiAgICAvLyBUaGlzIGlzIGEgYml0IHRyaWNreSB0byBtYW5hZ2UsIHNpbmNlIHRoZSBwYWdlIGNvdWxkIHJlZ2lzdGVyIHRoZXNlIGhhbmRsZXJzIGF0IGFueSBwb2ludCxcbiAgICAvLyBzbyBrZWVwIHdhdGNoaW5nIGZvciB0aGVtIGFuZCByZW1vdmUgdGhlbSBpZiBhbnkgYXJlIGFkZGVkLiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgIC8vIGluIGEgc2VtaS1wb2xsaW5nIGZhc2hpb24gdG8gZW5zdXJlIHRoZXNlIGFyZSBub3Qgb3ZlcnJpZGRlbi5cbiAgICBpZiAod2luZG93Lm9uYmVmb3JldW5sb2FkKSB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub251bmxvYWQpIHdpbmRvdy5vbnVubG9hZCA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbmJsdXIpIHdpbmRvdy5vbmJsdXIgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25mb2N1cykgd2luZG93Lm9uZm9jdXMgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlaGlkZSkgd2luZG93Lm9ucGFnZWhpZGUgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlc2hvdykgd2luZG93Lm9ucGFnZXNob3cgPSBudWxsO1xuICB9XG5cbiAgdW5sb2FkQWxsRXZlbnRIYW5kbGVycygpIHtcbiAgICBmb3IodmFyIGkgaW4gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbGlzdGVuZXIuY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLnR5cGUsIGxpc3RlbmVyLmZ1biwgbGlzdGVuZXIudXNlQ2FwdHVyZSk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIFxuICAgIC8vIE1ha2Ugc3VyZSBubyBYSFJzIGFyZSBiZWluZyBoZWxkIG9uIHRvIGVpdGhlci5cbiAgICAvL3ByZWxvYWRlZFhIUnMgPSB7fTtcbiAgICAvL251bVByZWxvYWRYSFJzSW5GbGlnaHQgPSAwO1xuICAgIC8vWE1MSHR0cFJlcXVlc3QgPSByZWFsWE1MSHR0cFJlcXVlc3Q7XG4gIFxuICAgIHRoaXMuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuICB9XG5cbiAgLy9pZiAoaW5qZWN0aW5nSW5wdXRTdHJlYW0pXG4gIGVuYWJsZSgpIHtcblxuICAgIC8vIEZpbHRlciB0aGUgcGFnZSBldmVudCBoYW5kbGVycyB0byBvbmx5IHBhc3MgcHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRvIHRoZSBzaXRlIC0gYWxsIHJlYWwgdXNlciBpbnB1dCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgc2luY2Ugd2UgYXJlXG4gICAgLy8gZG9pbmcgYSBwcm9ncmFtbWF0aWMgcnVuLlxuICAgIHZhciBvdmVycmlkZGVuTWVzc2FnZVR5cGVzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnLFxuICAgICAgJ2NsaWNrJywgJ2RibGNsaWNrJywgJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnLFxuICAgICAgJ3BvaW50ZXJsb2NrY2hhbmdlJywgJ3BvaW50ZXJsb2NrZXJyb3InLCAnd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAnd2Via2l0cG9pbnRlcmxvY2tlcnJvcicsICdtb3pwb2ludGVybG9ja2NoYW5nZScsICdtb3pwb2ludGVybG9ja2Vycm9yJywgJ21zcG9pbnRlcmxvY2tjaGFuZ2UnLCAnbXNwb2ludGVybG9ja2Vycm9yJywgJ29wb2ludGVybG9ja2NoYW5nZScsICdvcG9pbnRlcmxvY2tlcnJvcicsXG4gICAgICAnZGV2aWNlbW90aW9uJywgJ2RldmljZW9yaWVudGF0aW9uJyxcbiAgICAgICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnLFxuICAgICAgJ21vdXNld2hlZWwnLCAnd2hlZWwnLCAnV2hlZWxFdmVudCcsICdET01Nb3VzZVNjcm9sbCcsICdjb250ZXh0bWVudScsXG4gICAgICAnYmx1cicsICdmb2N1cycsICd2aXNpYmlsaXR5Y2hhbmdlJywgJ2JlZm9yZXVubG9hZCcsICd1bmxvYWQnLCAnZXJyb3InLFxuICAgICAgJ3BhZ2VoaWRlJywgJ3BhZ2VzaG93JywgJ29yaWVudGF0aW9uY2hhbmdlJywgJ2dhbWVwYWRjb25uZWN0ZWQnLCAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsXG4gICAgICAnZnVsbHNjcmVlbmNoYW5nZScsICdmdWxsc2NyZWVuZXJyb3InLCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsICdtb3pmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ01TRnVsbHNjcmVlbkNoYW5nZScsICdNU0Z1bGxzY3JlZW5FcnJvcicsICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgJ3dlYmtpdGZ1bGxzY3JlZW5lcnJvcicsXG4gICAgICAndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnLFxuICAgICAgJ3dlYmdsY29udGV4dGxvc3QnLCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLFxuICAgICAgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdwb2ludGVyb3V0JywgJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICd0cmFuc2l0aW9uZW5kJ107XG5cbiAgICAvLyBTb21lIGdhbWUgZGVtb3MgcHJvZ3JhbW1hdGljYWxseSBmaXJlIHRoZSByZXNpemUgZXZlbnQuIEZvciBGaXJlZm94IGFuZCBDaHJvbWUsXG4gICAgLy8gd2UgZGV0ZWN0IHRoaXMgdmlhIGV2ZW50LmlzVHJ1c3RlZCBhbmQga25vdyB0byBjb3JyZWN0bHkgcGFzcyBpdCB0aHJvdWdoLCBidXQgdG8gbWFrZSBTYWZhcmkgaGFwcHksXG4gICAgLy8gaXQncyBqdXN0IGVhc2llciB0byBsZXQgcmVzaXplIGNvbWUgdGhyb3VnaCBmb3IgdGhvc2UgZGVtb3MgdGhhdCBuZWVkIGl0LlxuICAgIC8vIGlmICghTW9kdWxlWydwYWdlTmVlZHNSZXNpemVFdmVudCddKSBvdmVycmlkZGVuTWVzc2FnZVR5cGVzLnB1c2goJ3Jlc2l6ZScpO1xuXG4gICAgLy8gSWYgY29udGV4dCBpcyBzcGVjaWZpZWQsIGFkZEV2ZW50TGlzdGVuZXIgaXMgY2FsbGVkIHVzaW5nIHRoYXQgYXMgdGhlICd0aGlzJyBvYmplY3QuIE90aGVyd2lzZSB0aGUgY3VycmVudCB0aGlzIGlzIHVzZWQuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgdmFyIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT09IC0xIHx8IGRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pXG4gICAgICAgICAgICAmJiAodHlwZS5pbmRleE9mKCdrZXknKSA9PT0gLTEgfHwgZGlzcGF0Y2hLZXlFdmVudHNWaWFET00pO1xuICAgICAgICAgIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKSB7IHRyeSB7IGlmIChlLnByb2dyYW1tYXRpYyB8fCAhZS5pc1RydXN0ZWQpIGxpc3RlbmVyKGUpOyB9IGNhdGNoKGUpIHt9IH07XG4gICAgICAgICAgLy8hISEgdmFyIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgICAgICAgIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZ1bjogZmlsdGVyZWRFdmVudExpc3RlbmVyLFxuICAgICAgICAgICAgdXNlQ2FwdHVyZTogdXNlQ2FwdHVyZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8IHRoaXMsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZnVuOiBsaXN0ZW5lcixcbiAgICAgICAgICAgIHVzZUNhcHR1cmU6IHVzZUNhcHR1cmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVhbFJlbW92ZUV2ZW50TGlzdGVuZXIgPSBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgICAvLyBpZiAocmVnaXN0ZXJMaXN0ZW5lclRvRE9NKVxuICAgICAgICAvL3JlYWxSZW1vdmVFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXTtcbiAgICAgICAgICBpZiAoZXZlbnRMaXN0ZW5lci5jb250ZXh0ID09PSB0aGlzICYmIGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gdHlwZSAmJiBldmVudExpc3RlbmVyLmZ1biA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgRXZlbnRUYXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihFdmVudFRhcmdldC5wcm90b3R5cGUsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKlxuICAgICAgdmFyIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gW3dpbmRvdywgZG9jdW1lbnQsIGRvY3VtZW50LmJvZHksIE1vZHVsZVsnY2FudmFzJ11dO1xuICAgICAgLy8gaWYgKE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmNvbmNhdChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSk7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0sIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldKTtcbiAgICAgIH1cbiAgICAgICovXG4gICAgfVxuICB9ICAgIFxufSIsImNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgZm9udFNpemU6IDE2LFxuICBrZXlTdHJva2VEZWxheTogMjAwLCAvLyBUaW1lIGJlZm9yZSB0aGUgbGluZSBicmVha3NcbiAgbGluZ2VyRGVsYXk6IDEwMDAsIC8vIFRpbWUgYmVmb3JlIHRoZSB0ZXh0IGZhZGVzIGF3YXlcbiAgZmFkZUR1cmF0aW9uOiAxMDAwLFxuICBiZXplbENvbG9yOiAnIzAwMCcsXG4gIHRleHRDb2xvcjogJyNmZmYnLFxuICB1bm1vZGlmaWVkS2V5OiB0cnVlLCAvLyBJZiBwcmVzc2luZyBBbHQrZSBzaG93IGUsIGluc3RlYWQgb2Yg4oKsXG4gIHNob3dTeW1ib2w6IHRydWUsIC8vIENvbnZlcnQgQXJyb3dMZWZ0IG9uIC0+XG4gIGFwcGVuZE1vZGlmaWVyczoge01ldGE6IHRydWUsIEFsdDogdHJ1ZSwgU2hpZnQ6IGZhbHNlfSwgLy8gQXBwZW5kIG1vZGlmaWVyIHRvIGtleSBhbGwgdGhlIHRpbWVcbiAgcG9zaXRpb246ICdib3R0b20tbGVmdCcgLy8gYm90dG9tLWxlZnQsIGJvdHRvbS1yaWdodCwgdG9wLWxlZnQsIHRvcC1yaWdodFxufTtcblxuY2xhc3MgS2V5c3Ryb2tlVmlzdWFsaXplciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgdGhpcy5zdHlsZSA9IG51bGw7XG4gICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgdGhpcy5rZXlkb3duID0gdGhpcy5rZXlkb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5rZXl1cCA9IHRoaXMua2V5dXAuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNsZWFuVXAoKSB7XG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlbW92ZU5vZGUodGhpcy5jb250YWluZXIpO1xuICAgIHJlbW92ZU5vZGUodGhpcy5zdHlsZSk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5zdHlsZSA9IG51bGw7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBpbmplY3RDb21wb25lbnRzKCkgeyAgICBcbiAgICAvLyBBZGQgY29udGFpbmVyXG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9ICdrZXlzdHJva2VzJztcbiAgICBcbiAgICBjb25zdCBwb3NpdGlvbnMgPSB7XG4gICAgICAnYm90dG9tLWxlZnQnOiAnYm90dG9tOiAwOyBsZWZ0OiAwOycsXG4gICAgICAnYm90dG9tLXJpZ2h0JzogJ2JvdHRvbTogMDsgcmlnaHQ6IDA7JyxcbiAgICAgICd0b3AtbGVmdCc6ICd0b3A6IDA7IGxlZnQ6IDA7JyxcbiAgICAgICd0b3AtcmlnaHQnOiAndG9wOiAwOyByaWdodDogMDsnLFxuICAgIH07XG5cbiAgICBpZiAoIXBvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dKSB7XG4gICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgcG9zaXRpb24gJyR7dGhpcy5vcHRpb25zLnBvc2l0aW9ufScsIHVzaW5nIGRlZmF1bHQgJ2JvdHRvbS1sZWZ0Jy4gVmFsaWQgcG9zaXRpb25zOiBgLCBPYmplY3Qua2V5cyhwb3NpdGlvbnMpKTtcbiAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9ICdib3R0b20tbGVmdCc7XG4gICAgfVxuXG4gICAgLy8gQWRkIGNsYXNzZXNcbiAgICB0aGlzLnN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICB0aGlzLnN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgIHVsLmtleXN0cm9rZXMge1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgJHtwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXX1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdWwua2V5c3Ryb2tlcyBsaSB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGlzLm9wdGlvbnMuYmV6ZWxDb2xvcn07XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgICAgY29sb3I6ICR7dGhpcy5vcHRpb25zLnRleHRDb2xvcn07XG4gICAgICAgIHBhZGRpbmc6IDVweCAxMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIGZvbnQtc2l6ZTogJHt0aGlzLm9wdGlvbnMuZm9udFNpemV9cHg7XG4gICAgICAgIGRpc3BsYXk6IHRhYmxlO1xuICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgfWA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlKTtcbiAgfVxuXG4gIGNvbnZlcnRLZXlUb1N5bWJvbChrZXkpIHtcbiAgICBjb25zdCBjb252ZXJzaW9uQ29tbW9uID0ge1xuICAgICAgJ0Fycm93UmlnaHQnOiAn4oaSJyxcbiAgICAgICdBcnJvd0xlZnQnOiAn4oaQJyxcbiAgICAgICdBcnJvd1VwJzogJ+KGkScsXG4gICAgICAnQXJyb3dEb3duJzogJ+KGkycsXG4gICAgICAnICc6ICfikKMnLFxuICAgICAgJ0VudGVyJzogJ+KGqScsXG4gICAgICAnU2hpZnQnOiAn4oenJyxcbiAgICAgICdTaGlmdFJpZ2h0JzogJ+KHpycsXG4gICAgICAnU2hpZnRMZWZ0JzogJ+KHpycsXG4gICAgICAnQ29udHJvbCc6ICfijIMnLFxuICAgICAgJ1RhYic6ICfihrknLFxuICAgICAgJ0NhcHNMb2NrJzogJ+KHqidcbiAgICB9O1xuXG4gICAgY29uc3QgY29udmVyc2lvbk1hYyA9IHtcbiAgICAgICdBbHQnOiAn4oylJyxcbiAgICAgICdBbHRMZWZ0JzogJ+KMpScsXG4gICAgICAnQWx0UmlnaHQnOiAn4oylJyxcbiAgICAgICdEZWxldGUnOiAn4oymJyxcbiAgICAgICdFc2NhcGUnOiAn4o6LJyxcbiAgICAgICdCYWNrc3BhY2UnOiAn4oyrJyxcbiAgICAgICdNZXRhJzogJ+KMmCcsXG4gICAgICAnVGFiJzogJ+KHpScsXG4gICAgICAnUGFnZURvd24nOiAn4oefJyxcbiAgICAgICdQYWdlVXAnOiAn4oeeJyxcbiAgICAgICdIb21lJzogJ+KGlicsXG4gICAgICAnRW5kJzogJ+KGmCdcbiAgICB9O1xuXG4gICAgcmV0dXJuIChuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgPyBjb252ZXJzaW9uTWFjW2tleV0gOiBudWxsICkgfHwgY29udmVyc2lvbkNvbW1vbltrZXldIHx8IGtleTtcbiAgfVxuXG4gIGtleWRvd24oZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHtcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY3VycmVudENodW5rKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIGtleSA9IGUua2V5O1xuICAgIGlmICh0aGlzLm9wdGlvbnMudW5tb2RpZmllZEtleSkge1xuICAgICAgaWYgKGUuY29kZS5pbmRleE9mKCdLZXknKSAhPT0gLTEpIHtcbiAgICAgICAga2V5ID0gZS5jb2RlLnJlcGxhY2UoJ0tleScsICcnKTtcbiAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW9kaWZpZXIgPSAnJztcbiAgICBcbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5NZXRhICYmIGUubWV0YUtleSAmJiBlLmtleSAhPT0gJ01ldGEnKSB7IG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdNZXRhJyk7IH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5BbHQgJiYgZS5hbHRLZXkgJiYgZS5rZXkgIT09ICdBbHQnKSB7IG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdBbHQnKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLlNoaWZ0ICYmIGUuc2hpZnRLZXkgJiYgZS5rZXkgIT09ICdTaGlmdCcpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ1NoaWZ0Jyk7IH1cbiAgICB0aGlzLmN1cnJlbnRDaHVuay50ZXh0Q29udGVudCArPSBtb2RpZmllciArICh0aGlzLm9wdGlvbnMuc2hvd1N5bWJvbCA/IHRoaXMuY29udmVydEtleVRvU3ltYm9sKGtleSkgOiBrZXkpO1xuICB9XG5cbiAga2V5dXAoZSkge1xuICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHJldHVybjtcbiAgICBcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgKGZ1bmN0aW9uKHByZXZpb3VzQ2h1bmspIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgcHJldmlvdXNDaHVuay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtwcmV2aW91c0NodW5rLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNDaHVuayl9LCBvcHRpb25zLmZhZGVEdXJhdGlvbik7XG4gICAgICAgIH0sIG9wdGlvbnMubGluZ2VyRGVsYXkpO1xuICAgICAgfSkodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgICAgXG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgfSwgb3B0aW9ucy5rZXlTdHJva2VEZWxheSk7XG4gIH1cblxuICBlbmFibGUob3B0aW9ucykge1xuICAgIHRoaXMuY2xlYW5VcCgpOyAgICBcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zIHx8IHRoaXMub3B0aW9ucyk7XG4gICAgdGhpcy5pbmplY3RDb21wb25lbnRzKCk7ICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gIH1cblxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMuY2xlYW5VcCgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBLZXlzdHJva2VWaXN1YWxpemVyKCk7IiwiaW1wb3J0IEtleXN0cm9rZVZpc3VhbGl6ZXIgZnJvbSAna2V5c3Ryb2tlLXZpc3VhbGl6ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dEhlbHBlcnMge1xuICBpbml0S2V5cygpIHtcbiAgICBLZXlzdHJva2VWaXN1YWxpemVyLmVuYWJsZSh7dW5tb2RpZmllZEtleTogZmFsc2V9KTtcbiAgfVxuXG4gIGluaXRNb3VzZSgpIHtcbiAgICB0aGlzLm1vdXNlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5tb3VzZURpdi5pZD0nbW91c2VkaXYnO1xuICAgIHRoaXMubW91c2VDbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VDbGljay5pZD0nbW91c2VjbGljayc7XG4gICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgIGA7XG5cbiAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGxlZnQ6IDBweDtcbiAgICAgIHRvcDogMHB4O1xuICAgICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcvY3Vyc29yLnN2ZycpO1xuICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogLThweCAtNXB4O1xuICAgICAgei1pbmRleDogOTk5OTtcbiAgICBgO1xuICAgIFxuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZURpdik7XG4gICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1vdXNlQ2xpY2spO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS5sZWZ0ID0gZXZ0LnggKyBcInB4XCI7XG4gICAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLnRvcCA9IGV2dC55ICsgXCJweFwiO1xuXG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUubGVmdCA9IGAke2V2dC54IC0gMTJ9cHhgO1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnRvcCA9IGAke2V2dC55IC0gN31weGA7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgfSk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIH0pO1xuXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoY2FudmFzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3cta2V5cycpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0S2V5cygpO1xuICAgIH1cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2hvdy1tb3VzZScpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0TW91c2UoKTtcbiAgICB9XG4gIH1cbn0iLCJmdW5jdGlvbiBuZWFyZXN0TmVpZ2hib3IgKHNyYywgZHN0KSB7XG4gIGxldCBwb3MgPSAwXG5cbiAgZm9yIChsZXQgeSA9IDA7IHkgPCBkc3QuaGVpZ2h0OyB5KyspIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRzdC53aWR0aDsgeCsrKSB7XG4gICAgICBjb25zdCBzcmNYID0gTWF0aC5mbG9vcih4ICogc3JjLndpZHRoIC8gZHN0LndpZHRoKVxuICAgICAgY29uc3Qgc3JjWSA9IE1hdGguZmxvb3IoeSAqIHNyYy5oZWlnaHQgLyBkc3QuaGVpZ2h0KVxuXG4gICAgICBsZXQgc3JjUG9zID0gKChzcmNZICogc3JjLndpZHRoKSArIHNyY1gpICogNFxuXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gUlxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEdcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBCXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gQVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplSW1hZ2VEYXRhKHNyY0ltYWdlRGF0YSwgbmV3SW1hZ2VEYXRhKSB7XG4gIG5lYXJlc3ROZWlnaGJvcihzcmNJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpeGVsbWF0Y2g7XG5cbmZ1bmN0aW9uIHBpeGVsbWF0Y2goaW1nMSwgaW1nMiwgb3V0cHV0LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gMC4xIDogb3B0aW9ucy50aHJlc2hvbGQ7XG5cbiAgICAvLyBtYXhpbXVtIGFjY2VwdGFibGUgc3F1YXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNvbG9ycztcbiAgICAvLyAzNTIxNSBpcyB0aGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZSBmb3IgdGhlIFlJUSBkaWZmZXJlbmNlIG1ldHJpY1xuICAgIHZhciBtYXhEZWx0YSA9IDM1MjE1ICogdGhyZXNob2xkICogdGhyZXNob2xkLFxuICAgICAgICBkaWZmID0gMDtcblxuICAgIC8vIGNvbXBhcmUgZWFjaCBwaXhlbCBvZiBvbmUgaW1hZ2UgYWdhaW5zdCB0aGUgb3RoZXIgb25lXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcblxuICAgICAgICAgICAgdmFyIHBvcyA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgICAgIC8vIHNxdWFyZWQgWVVWIGRpc3RhbmNlIGJldHdlZW4gY29sb3JzIGF0IHRoaXMgcGl4ZWwgcG9zaXRpb25cbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgcG9zLCBwb3MpO1xuXG4gICAgICAgICAgICAvLyB0aGUgY29sb3IgZGlmZmVyZW5jZSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiBtYXhEZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGl0J3MgYSByZWFsIHJlbmRlcmluZyBkaWZmZXJlbmNlIG9yIGp1c3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlQUEgJiYgKGFudGlhbGlhc2VkKGltZzEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFudGlhbGlhc2VkKGltZzIsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzEpKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmUgb2YgdGhlIHBpeGVscyBpcyBhbnRpLWFsaWFzaW5nOyBkcmF3IGFzIHllbGxvdyBhbmQgZG8gbm90IGNvdW50IGFzIGRpZmZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDI1NSwgMCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3VuZCBzdWJzdGFudGlhbCBkaWZmZXJlbmNlIG5vdCBjYXVzZWQgYnkgYW50aS1hbGlhc2luZzsgZHJhdyBpdCBhcyByZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaWZmKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIC8vIHBpeGVscyBhcmUgc2ltaWxhcjsgZHJhdyBiYWNrZ3JvdW5kIGFzIGdyYXlzY2FsZSBpbWFnZSBibGVuZGVkIHdpdGggd2hpdGVcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gYmxlbmQoZ3JheVBpeGVsKGltZzEsIHBvcyksIDAuMSk7XG4gICAgICAgICAgICAgICAgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCB2YWwsIHZhbCwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVudCBwaXhlbHNcbiAgICByZXR1cm4gZGlmZjtcbn1cblxuLy8gY2hlY2sgaWYgYSBwaXhlbCBpcyBsaWtlbHkgYSBwYXJ0IG9mIGFudGktYWxpYXNpbmc7XG4vLyBiYXNlZCBvbiBcIkFudGktYWxpYXNlZCBQaXhlbCBhbmQgSW50ZW5zaXR5IFNsb3BlIERldGVjdG9yXCIgcGFwZXIgYnkgVi4gVnlzbmlhdXNrYXMsIDIwMDlcblxuZnVuY3Rpb24gYW50aWFsaWFzZWQoaW1nLCB4MSwgeTEsIHdpZHRoLCBoZWlnaHQsIGltZzIpIHtcbiAgICB2YXIgeDAgPSBNYXRoLm1heCh4MSAtIDEsIDApLFxuICAgICAgICB5MCA9IE1hdGgubWF4KHkxIC0gMSwgMCksXG4gICAgICAgIHgyID0gTWF0aC5taW4oeDEgKyAxLCB3aWR0aCAtIDEpLFxuICAgICAgICB5MiA9IE1hdGgubWluKHkxICsgMSwgaGVpZ2h0IC0gMSksXG4gICAgICAgIHBvcyA9ICh5MSAqIHdpZHRoICsgeDEpICogNCxcbiAgICAgICAgemVyb2VzID0gMCxcbiAgICAgICAgcG9zaXRpdmVzID0gMCxcbiAgICAgICAgbmVnYXRpdmVzID0gMCxcbiAgICAgICAgbWluID0gMCxcbiAgICAgICAgbWF4ID0gMCxcbiAgICAgICAgbWluWCwgbWluWSwgbWF4WCwgbWF4WTtcblxuICAgIC8vIGdvIHRocm91Z2ggOCBhZGphY2VudCBwaXhlbHNcbiAgICBmb3IgKHZhciB4ID0geDA7IHggPD0geDI7IHgrKykge1xuICAgICAgICBmb3IgKHZhciB5ID0geTA7IHkgPD0geTI7IHkrKykge1xuICAgICAgICAgICAgaWYgKHggPT09IHgxICYmIHkgPT09IHkxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYnJpZ2h0bmVzcyBkZWx0YSBiZXR3ZWVuIHRoZSBjZW50ZXIgcGl4ZWwgYW5kIGFkamFjZW50IG9uZVxuICAgICAgICAgICAgdmFyIGRlbHRhID0gY29sb3JEZWx0YShpbWcsIGltZywgcG9zLCAoeSAqIHdpZHRoICsgeCkgKiA0LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY291bnQgdGhlIG51bWJlciBvZiBlcXVhbCwgZGFya2VyIGFuZCBicmlnaHRlciBhZGphY2VudCBwaXhlbHNcbiAgICAgICAgICAgIGlmIChkZWx0YSA9PT0gMCkgemVyb2VzKys7XG4gICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA8IDApIG5lZ2F0aXZlcysrO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPiAwKSBwb3NpdGl2ZXMrKztcblxuICAgICAgICAgICAgLy8gaWYgZm91bmQgbW9yZSB0aGFuIDIgZXF1YWwgc2libGluZ3MsIGl0J3MgZGVmaW5pdGVseSBub3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgaWYgKHplcm9lcyA+IDIpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcyKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGRhcmtlc3QgcGl4ZWxcbiAgICAgICAgICAgIGlmIChkZWx0YSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG1pbiA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG1pblggPSB4O1xuICAgICAgICAgICAgICAgIG1pblkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGJyaWdodGVzdCBwaXhlbFxuICAgICAgICAgICAgaWYgKGRlbHRhID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgbWF4WSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWltZzIpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGJvdGggZGFya2VyIGFuZCBicmlnaHRlciBwaXhlbHMgYW1vbmcgc2libGluZ3MsIGl0J3Mgbm90IGFudGktYWxpYXNpbmdcbiAgICBpZiAobmVnYXRpdmVzID09PSAwIHx8IHBvc2l0aXZlcyA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaWYgZWl0aGVyIHRoZSBkYXJrZXN0IG9yIHRoZSBicmlnaHRlc3QgcGl4ZWwgaGFzIG1vcmUgdGhhbiAyIGVxdWFsIHNpYmxpbmdzIGluIGJvdGggaW1hZ2VzXG4gICAgLy8gKGRlZmluaXRlbHkgbm90IGFudGktYWxpYXNlZCksIHRoaXMgcGl4ZWwgaXMgYW50aS1hbGlhc2VkXG4gICAgcmV0dXJuICghYW50aWFsaWFzZWQoaW1nLCBtaW5YLCBtaW5ZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCkpIHx8XG4gICAgICAgICAgICghYW50aWFsaWFzZWQoaW1nLCBtYXhYLCBtYXhZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWF4WCwgbWF4WSwgd2lkdGgsIGhlaWdodCkpO1xufVxuXG4vLyBjYWxjdWxhdGUgY29sb3IgZGlmZmVyZW5jZSBhY2NvcmRpbmcgdG8gdGhlIHBhcGVyIFwiTWVhc3VyaW5nIHBlcmNlaXZlZCBjb2xvciBkaWZmZXJlbmNlXG4vLyB1c2luZyBZSVEgTlRTQyB0cmFuc21pc3Npb24gY29sb3Igc3BhY2UgaW4gbW9iaWxlIGFwcGxpY2F0aW9uc1wiIGJ5IFkuIEtvdHNhcmVua28gYW5kIEYuIFJhbW9zXG5cbmZ1bmN0aW9uIGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgaywgbSwgeU9ubHkpIHtcbiAgICB2YXIgYTEgPSBpbWcxW2sgKyAzXSAvIDI1NSxcbiAgICAgICAgYTIgPSBpbWcyW20gKyAzXSAvIDI1NSxcblxuICAgICAgICByMSA9IGJsZW5kKGltZzFbayArIDBdLCBhMSksXG4gICAgICAgIGcxID0gYmxlbmQoaW1nMVtrICsgMV0sIGExKSxcbiAgICAgICAgYjEgPSBibGVuZChpbWcxW2sgKyAyXSwgYTEpLFxuXG4gICAgICAgIHIyID0gYmxlbmQoaW1nMlttICsgMF0sIGEyKSxcbiAgICAgICAgZzIgPSBibGVuZChpbWcyW20gKyAxXSwgYTIpLFxuICAgICAgICBiMiA9IGJsZW5kKGltZzJbbSArIDJdLCBhMiksXG5cbiAgICAgICAgeSA9IHJnYjJ5KHIxLCBnMSwgYjEpIC0gcmdiMnkocjIsIGcyLCBiMik7XG5cbiAgICBpZiAoeU9ubHkpIHJldHVybiB5OyAvLyBicmlnaHRuZXNzIGRpZmZlcmVuY2Ugb25seVxuXG4gICAgdmFyIGkgPSByZ2IyaShyMSwgZzEsIGIxKSAtIHJnYjJpKHIyLCBnMiwgYjIpLFxuICAgICAgICBxID0gcmdiMnEocjEsIGcxLCBiMSkgLSByZ2IycShyMiwgZzIsIGIyKTtcblxuICAgIHJldHVybiAwLjUwNTMgKiB5ICogeSArIDAuMjk5ICogaSAqIGkgKyAwLjE5NTcgKiBxICogcTtcbn1cblxuZnVuY3Rpb24gcmdiMnkociwgZywgYikgeyByZXR1cm4gciAqIDAuMjk4ODk1MzEgKyBnICogMC41ODY2MjI0NyArIGIgKiAwLjExNDQ4MjIzOyB9XG5mdW5jdGlvbiByZ2IyaShyLCBnLCBiKSB7IHJldHVybiByICogMC41OTU5Nzc5OSAtIGcgKiAwLjI3NDE3NjEwIC0gYiAqIDAuMzIxODAxODk7IH1cbmZ1bmN0aW9uIHJnYjJxKHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjIxMTQ3MDE3IC0gZyAqIDAuNTIyNjE3MTEgKyBiICogMC4zMTExNDY5NDsgfVxuXG4vLyBibGVuZCBzZW1pLXRyYW5zcGFyZW50IGNvbG9yIHdpdGggd2hpdGVcbmZ1bmN0aW9uIGJsZW5kKGMsIGEpIHtcbiAgICByZXR1cm4gMjU1ICsgKGMgLSAyNTUpICogYTtcbn1cblxuZnVuY3Rpb24gZHJhd1BpeGVsKG91dHB1dCwgcG9zLCByLCBnLCBiKSB7XG4gICAgb3V0cHV0W3BvcyArIDBdID0gcjtcbiAgICBvdXRwdXRbcG9zICsgMV0gPSBnO1xuICAgIG91dHB1dFtwb3MgKyAyXSA9IGI7XG4gICAgb3V0cHV0W3BvcyArIDNdID0gMjU1O1xufVxuXG5mdW5jdGlvbiBncmF5UGl4ZWwoaW1nLCBpKSB7XG4gICAgdmFyIGEgPSBpbWdbaSArIDNdIC8gMjU1LFxuICAgICAgICByID0gYmxlbmQoaW1nW2kgKyAwXSwgYSksXG4gICAgICAgIGcgPSBibGVuZChpbWdbaSArIDFdLCBhKSxcbiAgICAgICAgYiA9IGJsZW5kKGltZ1tpICsgMl0sIGEpO1xuICAgIHJldHVybiByZ2IyeShyLCBnLCBiKTtcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBXZWJHTFN0YXRzICgpIHtcblxuICB2YXIgZGF0YSA9IHtcbiAgICBudW1EcmF3Q2FsbHM6IDAsXG5cbiAgICBudW1EcmF3QXJyYXlzQ2FsbHM6MCxcbiAgICBudW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHM6MCxcbiAgICBudW1EcmF3RWxlbWVudHNDYWxsczowLFxuICAgIG51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzOiAwLFxuXG4gICAgbnVtVXNlUHJvZ3JhbUNhbGxzOjAsXG4gICAgbnVtRmFjZXM6MCxcbiAgICBudW1WZXJ0aWNlczowLFxuICAgIG51bVBvaW50czowLFxuICAgIG51bUJpbmRUZXh0dXJlczowXG4gIH1cblxuICB2YXIgc3RhdHMgPSB7XG4gICAgZHJhd0NhbGxzOiBuZXcgU3RhdHMoKSxcbiAgICB1c2VQcm9ncmFtQ2FsbHM6IG5ldyBTdGF0cygpLFxuICAgIGZhY2VzOiBuZXcgU3RhdHMoKSxcbiAgICB2ZXJ0aWNlczogbmV3IFN0YXRzKCksXG4gICAgYmluZFRleHR1cmVzOiBuZXcgU3RhdHMoKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGZyYW1lRW5kKCkge1xuICAgIGZvciAobGV0IHN0YXQgaW4gc3RhdHMpIHtcbiAgICAgIHZhciBjb3VudGVyTmFtZSA9ICdudW0nICsgc3RhdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0YXQuc2xpY2UoMSk7XG4gICAgICBzdGF0c1tzdGF0XS51cGRhdGUoZGF0YVtjb3VudGVyTmFtZV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9oICggZiwgYyApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgZi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgfTtcbiAgfVxuICBcbiAgaWYgKCdXZWJHTDJSZW5kZXJpbmdDb250ZXh0JyBpbiB3aW5kb3cpIHtcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXNJbnN0YW5jZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0pO1xuXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50c0luc3RhbmNlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcblxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBkYXRhLm51bUZhY2VzICs9IGFyZ3VtZW50c1sgMSBdIC8gMztcbiAgICAgIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAxIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0gPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1Vc2VQcm9ncmFtQ2FsbHMrKztcbiAgICB9ICk7XG4gICAgXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gICAgfSApO1xuICBcbiAgfVxuXG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3RWxlbWVudHNDYWxscysrO1xuICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgZGF0YS5udW1GYWNlcyArPSBhcmd1bWVudHNbIDEgXSAvIDM7XG4gICAgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDEgXTtcbiAgfSApO1xuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzKys7XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gIH0gKTtcbiAgXG4gIGZ1bmN0aW9uIGZyYW1lU3RhcnQgKCkge1xuICAgIGRhdGEubnVtRHJhd0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdBcnJheXNDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzID0gMDtcbiAgICBkYXRhLm51bUZhY2VzID0gMDtcbiAgICBkYXRhLm51bVZlcnRpY2VzID0gMDtcbiAgICBkYXRhLm51bVBvaW50cyA9IDA7XG4gICAgZGF0YS5udW1CaW5kVGV4dHVyZXMgPSAwO1xuICB9XG4gIFxuICBmdW5jdGlvbiBzZXR1cEV4dGVuc2lvbnMoY29udGV4dCkge1xuICAgIHZhciBleHQgPSBjb250ZXh0LmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgIGlmICghZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV4dC5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUgPSBfaCggZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIFxuICAgIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdW1tYXJ5KCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgIG1pbjogc3RhdHNba2V5XS5taW4sXG4gICAgICAgIG1heDogc3RhdHNba2V5XS5tYXgsXG4gICAgICAgIGF2Zzogc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgZ2V0Q3VycmVudERhdGE6ICgpID0+IHtyZXR1cm4gZGF0YTt9LFxuICAgIHNldHVwRXh0ZW5zaW9uczogc2V0dXBFeHRlbnNpb25zLFxuICAgIGdldFN1bW1hcnk6IGdldFN1bW1hcnksXG4gICAgZnJhbWVTdGFydDogZnJhbWVTdGFydCxcbiAgICBmcmFtZUVuZDogZnJhbWVFbmRcbiAgICBcbiAgICAvL2VuYWJsZTogZW5hYmxlLFxuICAgIC8vZGlzYWJsZTogZGlzYWJsZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU3RhdHMoKTsiLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgUGVyZlN0YXRzIGZyb20gJ3BlcmZvcm1hbmNlLXN0YXRzJztcbmltcG9ydCBzZWVkcmFuZG9tIGZyb20gJ3NlZWRyYW5kb20nO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge0lucHV0UmVjb3JkZXIsIElucHV0UmVwbGF5ZXJ9IGZyb20gJ2lucHV0LWV2ZW50cy1yZWNvcmRlcic7XG5pbXBvcnQgRXZlbnRMaXN0ZW5lck1hbmFnZXIgZnJvbSAnLi9ldmVudC1saXN0ZW5lcnMnO1xuaW1wb3J0IElucHV0SGVscGVycyBmcm9tICcuL2lucHV0LWhlbHBlcnMnO1xuaW1wb3J0IHtyZXNpemVJbWFnZURhdGF9IGZyb20gJy4vaW1hZ2UtdXRpbHMnO1xuaW1wb3J0IHBpeGVsbWF0Y2ggZnJvbSAncGl4ZWxtYXRjaCc7XG5pbXBvcnQgV2ViR0xTdGF0cyBmcm9tICd3ZWJnbC1zdGF0cyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG5mdW5jdGlvbiBvblJlYWR5KGNhbGxiYWNrKSB7XG4gIGlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbiAgKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBjYWxsYmFjayk7XG4gIH1cbn1cblxuXG4vLyBIYWNrcyB0byBmaXggc29tZSBVbml0eSBkZW1vc1xuY29uc29sZS5sb2dFcnJvciA9IChtc2cpID0+IGNvbnNvbGUuZXJyb3IobXNnKTtcblxud2luZG93LlRFU1RFUiA9IHtcbiAgcmVhZHk6IGZhbHNlLFxuICBpbnB1dExvYWRpbmc6IGZhbHNlLFxuXG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgZmlyc3RGcmFtZVRpbWU6IG51bGwsXG4gIC8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxuICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU6IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGRlbm90aW5nIHdoZW4gdGhlIHBhZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuXG4gIHBhZ2VMb2FkVGltZTogbnVsbCxcblxuICAvLyBIb2xkcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbXNlY3MgdGhhdCB0aGUgcHJldmlvdXNseSByZW5kZXJlZCBmcmFtZSB0b29rLiBVc2VkIHRvIGVzdGltYXRlIHdoZW4gYSBzdHV0dGVyIGV2ZW50IG9jY3VycyAoZmFzdCBmcmFtZSBmb2xsb3dlZCBieSBhIHNsb3cgZnJhbWUpXG4gIGxhc3RGcmFtZUR1cmF0aW9uOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG4gIGxhc3RGcmFtZVRpY2s6IC0xLFxuXG4gIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWU6IDAsXG5cbiAgLy8gS2VlcHMgdHJhY2sgb2YgcGVyZm9ybWFuY2Ugc3R1dHRlciBldmVudHMuIEEgc3R1dHRlciBldmVudCBvY2N1cnMgd2hlbiB0aGVyZSBpcyBhIGhpY2N1cCBpbiBzdWJzZXF1ZW50IHBlci1mcmFtZSB0aW1lcy4gKGZhc3QgZm9sbG93ZWQgYnkgc2xvdylcbiAgbnVtU3R1dHRlckV2ZW50czogMCxcblxuICBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlOiAxMjAsIC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlXG5cbiAgLy8gTWVhc3VyZSBhIFwidGltZSB1bnRpbCBzbW9vdGggZnJhbWUgcmF0ZVwiIHF1YW50aXR5LCBpLmUuIHRoZSB0aW1lIGFmdGVyIHdoaWNoIHdlIGNvbnNpZGVyIHRoZSBzdGFydHVwIEpJVCBhbmQgR0MgZWZmZWN0cyB0byBoYXZlIHNldHRsZWQuXG4gIC8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbiAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXM6IDAsXG5cbiAgcmFuZG9tU2VlZDogMSxcblxuICBudW1GcmFtZXNUb1JlbmRlcjogdHlwZW9mIHBhcmFtZXRlcnNbJ251bS1mcmFtZXMnXSA9PT0gJ3VuZGVmaW5lZCcgPyAxMjAwIDogcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtLWZyYW1lcyddKSxcblxuICAvLyBHdWFyZCBhZ2FpbnN0IHJlY3Vyc2l2ZSBjYWxscyB0byByZWZlcmVuY2VUZXN0UHJlVGljaytyZWZlcmVuY2VUZXN0VGljayBmcm9tIG11bHRpcGxlIHJBRnMuXG4gIHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQ6IDAsXG5cbiAgLy8gQ2FudmFzIHVzZWQgYnkgdGhlIHRlc3QgdG8gcmVuZGVyXG4gIGNhbnZhczogbnVsbCxcblxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbiAgLy8gdmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG4gIHBvc3RUaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgV2ViR0xTdGF0cy5mcmFtZUVuZCgpO1xuICAgIC8vY29uc29sZS5sb2coJz4+JywgSlNPTi5zdHJpbmdpZnkoV2ViR0xTdGF0cy5nZXRDdXJyZW50RGF0YSgpKSk7XG4gIH0sXG5cbiAgcHJlVGljazogZnVuY3Rpb24oKSB7XG4gICAgV2ViR0xTdGF0cy5mcmFtZVN0YXJ0KCk7XG5cbiAgICBpZiAoKyt0aGlzLnJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPT0gMSkge1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZVN0YXJ0KCk7XG5cbiAgICAgIGlmICghdGhpcy5jYW52YXMpIHtcbiAgICAgICAgLy8gV2UgYXNzdW1lIHRoZSBsYXN0IHdlYmdsIGNvbnRleHQgYmVpbmcgaW5pdGlhbGl6ZWQgaXMgdGhlIG9uZSB1c2VkIHRvIHJlbmRlcmluZ1xuICAgICAgICAvLyBJZiB0aGF0J3MgZGlmZmVyZW50LCB0aGUgdGVzdCBzaG91bGQgaGF2ZSBhIGN1c3RvbSBjb2RlIHRvIHJldHVybiB0aGF0IGNhbnZhc1xuICAgICAgICBpZiAoQ2FudmFzSG9vay53ZWJnbENvbnRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IENhbnZhc0hvb2sud2ViZ2xDb250ZXh0c1tDYW52YXNIb29rLndlYmdsQ29udGV4dHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgdGhpcy5jYW52YXMgPSBjb250ZXh0LmNhbnZhcztcblxuICAgICAgICAgIC8vIFByZXZlbnQgZXZlbnRzIG5vdCBkZWZpbmVkIGFzIGV2ZW50LWxpc3RlbmVyc1xuICAgICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSAoKSA9PiB7fTtcblxuICAgICAgICAgIC8vIFRvIHByZXZlbnQgd2lkdGggJiBoZWlnaHQgMTAwJVxuICAgICAgICAgIGZ1bmN0aW9uIGFkZFN0eWxlU3RyaW5nKHN0cikge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgbm9kZS5pbm5lckhUTUwgPSBzdHI7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZFN0eWxlU3RyaW5nKGAuZ2Z4dGVzdHMtY2FudmFzIHt3aWR0aDogJHt0aGlzLmNhbnZhc1dpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLmNhbnZhc0hlaWdodH1weCAhaW1wb3J0YW50O31gKTtcblxuICAgICAgICAgIC8vIFRvIGZpeCBBLUZyYW1lXG4gICAgICAgICAgYWRkU3R5bGVTdHJpbmcoYGEtc2NlbmUgLmEtY2FudmFzLmdmeHRlc3RzLWNhbnZhcyB7d2lkdGg6ICR7dGhpcy5jYW52YXNXaWR0aH1weCAhaW1wb3J0YW50OyBoZWlnaHQ6ICR7dGhpcy5jYW52YXNIZWlnaHR9cHggIWltcG9ydGFudDt9YCk7XG5cbiAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdnZnh0ZXN0cy1jYW52YXMnKTtcblxuICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcblxuICAgICAgICAgIFdlYkdMU3RhdHMuc2V0dXBFeHRlbnNpb25zKGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFJlY29yZGVyID0gbmV3IElucHV0UmVjb3JkZXIodGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dFJlY29yZGVyLmVuYWJsZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVwbGF5J10gIT09ICd1bmRlZmluZWQnICYmIEdGWFRFU1RTX0NPTkZJRy5pbnB1dCAmJiAhdGhpcy5pbnB1dExvYWRpbmcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXBsYXlpbmcnKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRMb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gQGZpeG1lIFByZXZlbnQgbXVsdGlwbGUgZmV0Y2ggd2hpbGUgd2FpdGluZ1xuICAgICAgICAgICAgZmV0Y2goJy90ZXN0cy8nICsgR0ZYVEVTVFNfQ09ORklHLmlucHV0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5pbnB1dFJlcGxheWVyID0gbmV3IElucHV0UmVwbGF5ZXIodGhpcy5jYW52YXMsIGpzb24sIHRoaXMuZXZlbnRMaXN0ZW5lci5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICB0aGlzLmlucHV0SGVscGVycyA9IG5ldyBJbnB1dEhlbHBlcnModGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9AZml4bWUgZWxzZSBmb3IgY2FudmFzIDJkIHdpdGhvdXQgd2ViZ2xcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAwKSB7XG4gICAgICAgIGlmICgnYXV0b2VudGVyLXhyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgdGhpcy5pbmplY3RBdXRvRW50ZXJYUih0aGlzLmNhbnZhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVmZXJlbmNlVGVzdFQwID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgaWYgKHRoaXMucGFnZUxvYWRUaW1lID09PSBudWxsKSB0aGlzLnBhZ2VMb2FkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHBhZ2VJbml0VGltZTtcblxuICAgICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgICBpZiAodGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgIT0gLTEpIHtcbiAgICAgICAgdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lO1xuICAgICAgICB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IC0xO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICB0aWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKC0tdGhpcy5yZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50ID4gMClcbiAgICAgIHJldHVybjsgLy8gV2UgYXJlIGJlaW5nIGNhbGxlZCByZWN1cnNpdmVseSwgc28gaWdub3JlIHRoaXMgY2FsbC5cblxuICAgIGlmICghdGhpcy5yZWFkeSkge3JldHVybjt9XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICB0aGlzLmlucHV0UmVjb3JkZXIuZnJhbWVOdW1iZXIgPSB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlcGxheWVyKSB7XG4gICAgICB0aGlzLmlucHV0UmVwbGF5ZXIudGljayh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcik7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcblxuICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgdmFyIGZyYW1lRHVyYXRpb24gPSB0aW1lTm93IC0gdGhpcy5sYXN0RnJhbWVUaWNrO1xuICAgIHRoaXMubGFzdEZyYW1lVGljayA9IHRpbWVOb3c7XG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID4gNSAmJiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID4gMCkge1xuICAgICAgLy8gVGhpcyBtdXN0IGJlIGZpeGVkIGRlcGVuZGluZyBvbiB0aGUgdnN5bmNcbiAgICAgIGlmIChmcmFtZUR1cmF0aW9uID4gMjAuMCAmJiBmcmFtZUR1cmF0aW9uID4gdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiAqIDEuMzUpIHtcbiAgICAgICAgdGhpcy5udW1TdHV0dGVyRXZlbnRzKys7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB7XG4gICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcysrO1xuICAgICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID49IHRoaXMubnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVVbnRpbFNtb290aEZyYW1lcmF0ZScsIHRpbWVOb3cgLSB0aGlzLmZpcnN0RnJhbWVUaW1lKTtcbiAgICAgICAgICAgIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiA9IGZyYW1lRHVyYXRpb247XG4vKlxuICAgIGlmIChudW1QcmVsb2FkWEhSc0luRmxpZ2h0ID09IDApIHsgLy8gSW1wb3J0YW50ISBUaGUgZnJhbWUgbnVtYmVyIGFkdmFuY2VzIG9ubHkgZm9yIHRob3NlIGZyYW1lcyB0aGF0IHRoZSBnYW1lIGlzIG5vdCB3YWl0aW5nIGZvciBkYXRhIGZyb20gdGhlIGluaXRpYWwgbmV0d29yayBkb3dubG9hZHMuXG4gICAgICBpZiAobnVtU3RhcnR1cEJsb2NrZXJYSFJzUGVuZGluZyA9PSAwKSArK3RoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOyAvLyBBY3R1YWwgcmVmdGVzdCBmcmFtZSBjb3VudCBvbmx5IGluY3JlbWVudHMgYWZ0ZXIgZ2FtZSBoYXMgY29uc3VtZWQgYWxsIHRoZSBjcml0aWNhbCBYSFJzIHRoYXQgd2VyZSB0byBiZSBwcmVsb2FkZWQuXG4gICAgICArK2Zha2VkVGltZTsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG4gICAgfVxuKi9cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcisrO1xuICAgIGlmICh0aGlzLmZyYW1lUHJvZ3Jlc3NCYXIpIHtcbiAgICAgIHZhciBwZXJjID0gcGFyc2VJbnQoMTAwICogdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgLyB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKTtcbiAgICAgIHRoaXMuZnJhbWVQcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHBlcmMgKyBcIiVcIjtcbiAgICB9XG5cbiAgICBGYWtlVGltZXJzLmZha2VkVGltZSsrOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMSkge1xuICAgICAgdGhpcy5maXJzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGaXJzdCBmcmFtZSBzdWJtaXR0ZWQgYXQgKG1zKTonLCB0aGlzLmZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgIC8vIFRFU1RFUi5kb0ltYWdlUmVmZXJlbmNlQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICB9LFxuXG4gIGNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rOiBmdW5jdGlvbihkYXRhLCBmaWxlbmFtZSwgZGVzY3JpcHRpb24pIHtcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBmaWxlbmFtZSArICcucG5nJyk7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBkYXRhKTtcbiAgICBhLnN0eWxlLmNzc1RleHQgPSAnY29sb3I6ICNGRkY7IGRpc3BsYXk6IGlubGluZS1ncmlkOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IG1hcmdpbjogMnB4OyBmb250LXNpemU6IDE0cHg7JztcblxuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcuaWQgPSBmaWxlbmFtZTtcbiAgICBpbWcuc3JjID0gZGF0YTtcbiAgICBhLmFwcGVuZENoaWxkKGltZyk7XG5cbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGxhYmVsLmNsYXNzTmFtZSA9ICdidXR0b24nO1xuICAgIGxhYmVsLmlubmVySFRNTCA9IGRlc2NyaXB0aW9uIHx8IGZpbGVuYW1lO1xuXG4gICAgYS5hcHBlbmRDaGlsZChsYWJlbCk7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9pbWFnZXMnKS5hcHBlbmRDaGlsZChhKTtcbiAgfSxcblxuICAvLyBYSFJzIGluIHRoZSBleHBlY3RlZCByZW5kZXIgb3V0cHV0IGltYWdlLCBhbHdheXMgJ3JlZmVyZW5jZS5wbmcnIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGUgdGVzdC5cbiAgbG9hZFJlZmVyZW5jZUltYWdlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIHZhciByZWZlcmVuY2VJbWFnZU5hbWUgPSBwYXJhbWV0ZXJzWydyZWZlcmVuY2UtaW1hZ2UnXSB8fCBHRlhURVNUU19DT05GSUcuaWQ7XG4gICAgICAgIFxuICAgICAgaW1nLnNyYyA9ICcvJyArIEdGWFRFU1RTX1JFRkVSRU5DRUlNQUdFX0JBU0VVUkwgKyAnLycgKyByZWZlcmVuY2VJbWFnZU5hbWUgKyAnLnBuZyc7XG4gICAgICBpbWcub25hYm9ydCA9IGltZy5vbmVycm9yID0gcmVqZWN0O1xuICAgICAgXG4gICAgICAvLyByZWZlcmVuY2UucG5nIG1pZ2h0IGNvbWUgZnJvbSBhIGRpZmZlcmVudCBkb21haW4gdGhhbiB0aGUgY2FudmFzLCBzbyBkb24ndCBsZXQgaXQgdGFpbnQgY3R4LmdldEltYWdlRGF0YSgpLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvQ09SU19lbmFibGVkX2ltYWdlXG4gICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJzsgXG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgXG4gICAgICAgIGN0eC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgICAgICAgdGhpcy5yZWZlcmVuY2VJbWFnZURhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIFxuICAgICAgICB2YXIgZGF0YSA9IGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgICAgICB0aGlzLmNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rKGRhdGEsICdyZWZlcmVuY2UtaW1hZ2UnLCAnUmVmZXJlbmNlIGltYWdlJyk7XG4gIFxuICAgICAgICByZXNvbHZlKHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2UgPSBpbWc7ICBcbiAgICB9KTtcbiAgfSxcblxuICBnZXRDdXJyZW50SW1hZ2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgLy8gR3JhYiByZW5kZXJlZCBXZWJHTCBmcm9udCBidWZmZXIgaW1hZ2UgdG8gYSBKUy1zaWRlIGltYWdlIG9iamVjdC5cbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gY2FsbGJhY2s7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBnZW5lcmF0ZSBpbWFnZVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIHJlZnRlc3QgKGV2dCkge1xuICAgICAgICB2YXIgaW1nID0gYWN0dWFsSW1hZ2U7XG4gICAgICAgIHZhciBjYW52YXNDdXJyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY2FudmFzQ3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0N1cnJlbnQud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhc0N1cnJlbnQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgICB2YXIgY3VycmVudEltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICAgICAgc2VsZi5sb2FkUmVmZXJlbmNlSW1hZ2UoKS50aGVuKHJlZkltYWdlRGF0YSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gcmVmSW1hZ2VEYXRhLndpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSByZWZJbWFnZURhdGEuaGVpZ2h0O1xuICAgICAgICAgIHZhciBjYW52YXNEaWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgdmFyIGRpZmZDdHggPSBjYW52YXNEaWZmLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgY2FudmFzRGlmZi53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIGNhbnZhc0RpZmYuaGVpZ2h0ID0gaGVpZ2h0OyAgXG4gICAgICAgICAgdmFyIGRpZmYgPSBkaWZmQ3R4LmNyZWF0ZUltYWdlRGF0YSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgbmV3SW1hZ2VEYXRhID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgcmVzaXplSW1hZ2VEYXRhKGN1cnJlbnRJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG5cbiAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZWZJbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICB2YXIgYWN0dWFsID0gbmV3SW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIHRocmVzaG9sZCA9IHR5cGVvZiBHRlhURVNUU19DT05GSUcucmVmZXJlbmNlQ29tcGFyZVRocmVzaG9sZCA9PT0gJ3VuZGVmaW5lZCcgPyAwLjIgOiBHRlhURVNUU19DT05GSUcucmVmZXJlbmNlQ29tcGFyZVRocmVzaG9sZDtcbiAgICAgICAgICB2YXIgbnVtRGlmZlBpeGVscyA9IHBpeGVsbWF0Y2goZXhwZWN0ZWQsIGFjdHVhbCwgZGlmZi5kYXRhLCB3aWR0aCwgaGVpZ2h0LCB7dGhyZXNob2xkOiB0aHJlc2hvbGR9KTtcbiAgICAgICAgICB2YXIgZGlmZlBlcmMgPSBudW1EaWZmUGl4ZWxzIC8gKHdpZHRoICogaGVpZ2h0KSAqIDEwMDtcbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgZmFpbCA9IGRpZmZQZXJjID4gMC4yOyAvLyBkaWZmIHBlcmMgMCAtIDEwMCVcbiAgICAgICAgICB2YXIgcmVzdWx0ID0ge3Jlc3VsdDogJ3Bhc3MnfTtcblxuICAgICAgICAgIGlmIChmYWlsKSB7XG4gICAgICAgICAgICB2YXIgZGl2RXJyb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVmZXJlbmNlLWltYWdlcy1lcnJvcicpO1xuICAgICAgICAgICAgZGl2RXJyb3IucXVlcnlTZWxlY3RvcignaDMnKS5pbm5lckhUTUwgPSBgRVJST1I6IFJlZmVyZW5jZSBpbWFnZSBtaXNtYXRjaCAoJHtkaWZmUGVyYy50b0ZpeGVkKDIpfSUgZGlmZmVyZW50IHBpeGVscylgO1xuICAgICAgICAgICAgZGl2RXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgIHJlc3VsdDogJ2ZhaWwnLFxuICAgICAgICAgICAgICBkaWZmUGVyYzogZGlmZlBlcmMsXG4gICAgICAgICAgICAgIG51bURpZmZQaXhlbHM6IG51bURpZmZQaXhlbHMsXG4gICAgICAgICAgICAgIGZhaWxSZWFzb246ICdSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2gnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBiZW5jaG1hcmtEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpO1xuICAgICAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9ICdmYWlsJztcbiAgICAgICAgICAgIGJlbmNobWFya0Rpdi5xdWVyeVNlbGVjdG9yKCdoMScpLmlubmVyVGV4dCA9ICdUZXN0IGZhaWxlZCEnO1xuXG4gICAgICAgICAgICBkaWZmQ3R4LnB1dEltYWdlRGF0YShkaWZmLCAwLCAwKTtcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSBjYW52YXNEaWZmLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgICAgICBzZWxmLmNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rKGRhdGEsICdjYW52YXMtZGlmZicsICdEaWZmZXJlbmNlJyk7XG4gICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIHZhciBiZW5jaG1hcmtEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpO1xuICAgICAgICAgIGJlbmNobWFya0Rpdi5jbGFzc05hbWUgPSAnZmFpbCc7XG4gICAgICAgICAgYmVuY2htYXJrRGl2LnF1ZXJ5U2VsZWN0b3IoJ2gxJykuaW5uZXJUZXh0ID0gJ1Rlc3QgZmFpbGVkISc7XG5cbiAgICAgICAgICB2YXIgZGl2RXJyb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVmZXJlbmNlLWltYWdlcy1lcnJvcicpO1xuICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBGYWlsZWQgdG8gbG9hZCByZWZlcmVuY2UgaW1hZ2VgO1xuICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgIHJlc3VsdDogJ2ZhaWwnLFxuICAgICAgICAgICAgZmFpbFJlYXNvbjogJ0Vycm9yIGxvYWRpbmcgcmVmZXJlbmNlIGltYWdlJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgICBhY3R1YWxJbWFnZS5vbmxvYWQgPSByZWZ0ZXN0O1xuICAgICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBpbml0U2VydmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9ICdodHRwOi8vJyArIEdGWFRFU1RTX0NPTkZJRy5zZXJ2ZXJJUCArICc6ODg4OCc7XG5cbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3Qoc2VydmVyVXJsKTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCd0ZXN0X3N0YXJ0ZWQnLCB7aWQ6IEdGWFRFU1RTX0NPTkZJRy5pZH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ25leHRfYmVuY2htYXJrJywgKGRhdGEpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCduZXh0X2JlbmNobWFyaycsIGRhdGEpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoZGF0YS51cmwpO1xuICAgIH0pOyAgICBcbiAgfSxcbiAgXG4gIGFkZElucHV0RG93bmxvYWRCdXR0b246IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIER1bXAgaW5wdXRcbiAgICAgIGZ1bmN0aW9uIHNhdmVTdHJpbmcgKHRleHQsIGZpbGVuYW1lLCBtaW1lVHlwZSkge1xuICAgICAgICBzYXZlQmxvYihuZXcgQmxvYihbIHRleHQgXSwgeyB0eXBlOiBtaW1lVHlwZSB9KSwgZmlsZW5hbWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBzYXZlQmxvYiAoYmxvYiwgZmlsZW5hbWUpIHtcbiAgICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgbGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lIHx8ICdpbnB1dC5qc29uJztcbiAgICAgICAgbGluay5jbGljaygpO1xuICAgICAgICAvLyBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7IGJyZWFrcyBGaXJlZm94Li4uXG4gICAgICB9XG5cbiAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkodGhpcy5pbnB1dFJlY29yZGVyLmV2ZW50cywgbnVsbCwgMik7XG5cbiAgICAgIC8vY29uc29sZS5sb2coJ0lucHV0IHJlY29yZGVkJywganNvbik7XG5cbiAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2J1dHRvbic7XG4gICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiBzYXZlU3RyaW5nKGpzb24sIEdGWFRFU1RTX0NPTkZJRy5pZCArICcuanNvbicsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICBsaW5rLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGBEb3dubG9hZCBpbnB1dCBKU09OYCkpOyAvLyAoJHt0aGlzLmlucHV0UmVjb3JkZXIuZXZlbnRzLmxlbmd0aH0gZXZlbnRzIHJlY29yZGVkKVxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgfSxcblxuICBnZW5lcmF0ZUJlbmNobWFya1Jlc3VsdDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aW1lRW5kID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIHZhciB0b3RhbFRpbWUgPSB0aW1lRW5kIC0gcGFnZUluaXRUaW1lOyAvLyBUb3RhbCB0aW1lLCBpbmNsdWRpbmcgZXZlcnl0aGluZy5cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSAocmVzb2x2ZSA9PiB7XG4gICAgICB2YXIgdG90YWxSZW5kZXJUaW1lID0gdGltZUVuZCAtIHRoaXMuZmlyc3RGcmFtZVRpbWU7XG4gICAgICB2YXIgY3B1SWRsZSA9IHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSAqIDEwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIgKiAxMDAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gIFxuICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgdGVzdF9pZDogR0ZYVEVTVFNfQ09ORklHLmlkLFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIHBlcmY6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICAgICAgd2ViZ2w6IFdlYkdMU3RhdHMuZ2V0U3VtbWFyeSgpXG4gICAgICAgIH0sXG4gICAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUsXG4gICAgICAgIGF2Z0ZwczogZnBzLFxuICAgICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICAgIHRvdGFsVGltZTogdG90YWxUaW1lLFxuICAgICAgICB0b3RhbFJlbmRlclRpbWU6IHRvdGFsUmVuZGVyVGltZSxcbiAgICAgICAgY3B1VGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVJbk1haW5Mb29wLFxuICAgICAgICBjcHVJZGxlVGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AsXG4gICAgICAgIGNwdUlkbGVQZXJjOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCAqIDEwMCAvIHRvdGFsUmVuZGVyVGltZSxcbiAgICAgICAgcGFnZUxvYWRUaW1lOiB0aGlzLnBhZ2VMb2FkVGltZSxcbiAgICAgICAgcmVzdWx0OiAncGFzcycsXG4gICAgICAgIGxvZ3M6IHRoaXMubG9nc1xuICAgICAgfTtcblxuICAgICAgLy8gQHRvZG8gSW5kaWNhdGUgc29tZWhvdyB0aGF0IG5vIHJlZmVyZW5jZSB0ZXN0IGhhcyBiZWVuIHBlcmZvcm1lZFxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydza2lwLXJlZmVyZW5jZS1pbWFnZS10ZXN0J10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZG9JbWFnZVJlZmVyZW5jZUNoZWNrKCkudGhlbihyZWZSZXN1bHQgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByZWZSZXN1bHQpO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTsgIFxuICAgICAgICB9KS5jYXRjaChyZWZSZXN1bHQgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByZWZSZXN1bHQpO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYmVuY2htYXJrRmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgI3Rlc3RfZmluaXNoZWQge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGRkO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjMDAwO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgI3Rlc3RfZmluaXNoZWQucGFzcyB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM5Zjk7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkLmZhaWwge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjk5O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMge1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMgaW1nIHtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDA3MDk1O1xuICAgICAgfVxuXG4gICAgICAvKlxuICAgICAgI3Rlc3RfaW1hZ2VzIGltZzpob3ZlciB7XG4gICAgICAgIHRvcDogMHB4OyBcbiAgICAgICAgbGVmdDogMHB4O1xuICAgICAgICBoZWlnaHQ6IDgwJTtcbiAgICAgICAgd2lkdGg6IDgwJTtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgfVxuICAgICAgKi9cblxuICAgICAgI3Rlc3RfZmluaXNoZWQgLmJ1dHRvbiB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDcwOTU7XG4gICAgICAgIGJvcmRlci1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbiAgICAgICAgY29sb3I6ICNGRkZGRkY7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICBmb250LWZhbWlseTogXCJIZWx2ZXRpY2EgTmV1ZVwiLCBcIkhlbHZldGljYVwiLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmICFpbXBvcnRhbnQ7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBwYWRkaW5nOiAxMHB4IDFweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMzAwbXMgZWFzZS1vdXQ7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkIC5idXR0b246aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3OGEwO1xuICAgICAgfVxuICAgIGA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmlubmVySFRNTCA9IGA8aDE+VGVzdCBmaW5pc2hlZCE8L2gxPmA7XG4gICAgZGl2LmlkID0gJ3Rlc3RfZmluaXNoZWQnO1xuICAgIGRpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgXG4gICAgdmFyIGRpdlJlZmVyZW5jZUVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3IuaWQgPSAncmVmZXJlbmNlLWltYWdlcy1lcnJvcic7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3Iuc3R5bGUuY3NzVGV4dCA9ICd0ZXh0LWFsaWduOmNlbnRlcjsgY29sb3I6ICNmMDA7J1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlubmVySFRNTCA9ICc8aDM+PC9oMz4nO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoZGl2UmVmZXJlbmNlRXJyb3IpO1xuICAgIHZhciBkaXZJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXZJbWcuaWQgPSAndGVzdF9pbWFnZXMnO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmFwcGVuZENoaWxkKGRpdkltZyk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICB0aGlzLmFkZElucHV0RG93bmxvYWRCdXR0b24oKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSB0aGlzLmlucHV0UmVjb3JkZXIgPyAnRG93bmxvYWQgcmVmZXJlbmNlIGltYWdlJyA6ICdBY3R1YWwgcmVuZGVyJztcbiAgICAgIHRoaXMuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgR0ZYVEVTVFNfQ09ORklHLmlkLCBkZXNjcmlwdGlvbik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZ2VuZXJhdGUgaW1hZ2VcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZW5lcmF0ZUJlbmNobWFya1Jlc3VsdCgpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgICAgaWYgKHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddKSB7XG4gICAgICAgICAgICByZXN1bHQudGVzdFVVSUQgPSBwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgndGVzdF9maW5pc2gnLCByZXN1bHQpO1xuICAgICAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIGlmIChyZXN1bHQucmVzdWx0ID09PSAncGFzcycpIHtcbiAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBwYXNzZWQhJztcbiAgICAgICAgfVxuXG4gICAgICAgIGJlbmNobWFya0Rpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCByZXN1bHQpO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNsb3NlICYmIHR5cGVvZiBwYXJhbWV0ZXJzWyduby1jbG9zZS1vbi1mYWlsJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pOyAgXG4gICAgfVxuICB9LFxuXG4gIHdyYXBFcnJvcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiBldnQubG9ncy5jYXRjaEVycm9ycyA9IHtcbiAgICAgIG1lc3NhZ2U6IGV2dC5lcnJvci5tZXNzYWdlLFxuICAgICAgc3RhY2s6IGV2dC5lcnJvci5zdGFjayxcbiAgICAgIGxpbmVubzogZXZ0LmVycm9yLmxpbmVubyxcbiAgICAgIGZpbGVuYW1lOiBldnQuZXJyb3IuZmlsZW5hbWVcbiAgICB9KTtcblxuICAgIHZhciB3cmFwRnVuY3Rpb25zID0gWydlcnJvcicsJ3dhcm5pbmcnLCdsb2cnXTtcbiAgICB3cmFwRnVuY3Rpb25zLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZVtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBmbiA9IGNvbnNvbGVba2V5XS5iaW5kKGNvbnNvbGUpO1xuICAgICAgICBjb25zb2xlW2tleV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGlmIChrZXkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncy5lcnJvcnMucHVzaChhcmdzKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3Mud2FybmluZ3MucHVzaChhcmdzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnNlbmRMb2cpXG4gICAgICAgICAgICBURVNURVIuc29ja2V0LmVtaXQoJ2xvZycsIGFyZ3MpO1xuXG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5mb092ZXJsYXk6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGl2T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2T3ZlcmxheS5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgZm9udC1mYW1pbHk6IE1vbm9zcGFjZTtcbiAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoOTUsIDQwLCAxMzYpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgcGFkZGluZzogNXB4YDtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2T3ZlcmxheSk7XG4gICAgICBkaXZPdmVybGF5LmlubmVyVGV4dCA9IHBhcmFtZXRlcnNbJ2luZm8tb3ZlcmxheSddO1xuICAgIH0pXG4gIH0sXG5cbiAgYWRkUHJvZ3Jlc3NCYXI6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgdmFyIGRpdlByb2dyZXNzQmFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2UHJvZ3Jlc3NCYXJzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6ICMzMzM7IHdpZHRoOiAyMDBweDsgcGFkZGluZzogNXB4IDVweCAwcHggNXB4Oyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzQmFycyk7XG5cbiAgICAgIHZhciBvcmRlckdsb2JhbCA9IHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddO1xuICAgICAgdmFyIHRvdGFsR2xvYmFsID0gcGFyYW1ldGVyc1sndG90YWwtZ2xvYmFsJ107XG4gICAgICB2YXIgcGVyY0dsb2JhbCA9IE1hdGgucm91bmQob3JkZXJHbG9iYWwvdG90YWxHbG9iYWwgKiAxMDApO1xuICAgICAgdmFyIG9yZGVyVGVzdCA9IHBhcmFtZXRlcnNbJ29yZGVyLXRlc3QnXTtcbiAgICAgIHZhciB0b3RhbFRlc3QgPSBwYXJhbWV0ZXJzWyd0b3RhbC10ZXN0J107XG4gICAgICB2YXIgcGVyY1Rlc3QgPSBNYXRoLnJvdW5kKG9yZGVyVGVzdC90b3RhbFRlc3QgKiAxMDApO1xuXG4gICAgICBmdW5jdGlvbiBhZGRQcm9ncmVzc0JhclNlY3Rpb24odGV4dCwgY29sb3IsIHBlcmMsIGlkKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDIwcHg7IG1hcmdpbi1ib3R0b206IDVweDsgb3ZlcmZsb3c6IGhpZGRlbjsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsnO1xuICAgICAgICBkaXZQcm9ncmVzc0JhcnMuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICB2YXIgZGl2UHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzKTtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaWQgPSBpZDtcbiAgICAgICAgfVxuICAgICAgICBkaXZQcm9ncmVzcy5zdHlsZS5jc3NUZXh0PWBcbiAgICAgICAgICB3aWR0aDogJHtwZXJjfSU7YmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn0gZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMzMzdhYjc7XG4gICAgICAgICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIC0xcHggMCByZ2JhKDAsMCwwLC4xNSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgLW8tdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7YDtcbiAgICAgICAgICBkaXZQcm9ncmVzcy5pbm5lclRleHQgPSB0ZXh0OztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyVGVzdH0vJHt0b3RhbFRlc3R9ICR7cGVyY1Rlc3R9JWAsICcjNWJjMGRlJywgcGVyY1Rlc3QpO1xuICAgICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oYCR7b3JkZXJHbG9iYWx9LyR7dG90YWxHbG9iYWx9ICR7cGVyY0dsb2JhbH0lYCwgJyMzMzdhYjcnLCBwZXJjR2xvYmFsKTtcbiAgICAgIH1cblxuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKCcnLCAnIzMzN2FiNycsIDAsICdudW1mcmFtZXMnKTtcbiAgICAgIHRoaXMuZnJhbWVQcm9ncmVzc0JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdudW1mcmFtZXMnKTtcblxuICAgIH0pO1xuICB9LFxuXG4gIGhvb2tNb2RhbHM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEhvb2sgbW9kYWxzOiBUaGlzIGlzIGFuIHVuYXR0ZW5kZWQgcnVuLCBkb24ndCBhbGxvdyB3aW5kb3cuYWxlcnQoKXMgdG8gaW50cnVkZS5cbiAgICB3aW5kb3cuYWxlcnQgPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmFsZXJ0KCcgKyBtc2cgKyAnKScpOyB9XG4gICAgd2luZG93LmNvbmZpcm0gPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmNvbmZpcm0oJyArIG1zZyArICcpJyk7IHJldHVybiB0cnVlOyB9XG4gIH0sXG5cbiAgaG9va1JBRjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjYWxsYmFjayA9PiB7XG4gICAgICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gcCA9PiB7XG4gICAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCkgeyBcbiAgICAgICAgICAgIEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCgpOyBcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcmVUaWNrKCk7XG4gICAgXG4gICAgICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICAgIHRoaXMudGljaygpO1xuICAgICAgICAgIHRoaXMuc3RhdHMuZnJhbWVFbmQoKTtcblxuICAgICAgICAgIHRoaXMucG9zdFRpY2soKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYmVuY2htYXJrRmluaXNoZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCkge1xuICAgICAgICAgICAgR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gICAgICB0aGlzLmhvb2tSQUYoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZFByb2dyZXNzQmFyKCk7XG4gICAgdGhpcy5hZGRJbmZvT3ZlcmxheSgpO1xuXG4gICAgY29uc29sZS5sb2coJ0ZyYW1lcyB0byByZW5kZXI6JywgdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5kb250T3ZlcnJpZGVUaW1lKSB7XG4gICAgICBGYWtlVGltZXJzLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIE1hdGgucmFuZG9tID0gc2VlZHJhbmRvbSh0aGlzLnJhbmRvbVNlZWQpO1xuXG4gICAgQ2FudmFzSG9vay5lbmFibGUoT2JqZWN0LmFzc2lnbih7ZmFrZVdlYkdMOiB0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJnbCddICE9PSAndW5kZWZpbmVkJ30sIHt3aWR0aDogdGhpcy5jYW52YXNXaWR0aCwgaGVpZ2h0OiB0aGlzLmNhbnZhc0hlaWdodH0pKTtcbiAgICB0aGlzLmhvb2tNb2RhbHMoKTtcblxuICAgIHRoaXMub25SZXNpemUoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5vblJlc2l6ZS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMubG9ncyA9IHtcbiAgICAgIGVycm9yczogW10sXG4gICAgICB3YXJuaW5nczogW10sXG4gICAgICBjYXRjaEVycm9yczogW11cbiAgICB9O1xuICAgIC8vIHRoaXMud3JhcEVycm9ycygpO1xuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyID0gbmV3IEV2ZW50TGlzdGVuZXJNYW5hZ2VyKCk7XG5cbiAgICAvL2lmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgfSxcblxuICBpbmplY3RBdXRvRW50ZXJYUjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzKSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMoKS50aGVuKGRpc3BsYXlzID0+IHtcbiAgICAgICAgICB2YXIgZGV2aWNlID0gZGlzcGxheXNbMF07XG4gICAgICAgICAgLy9pZiAoZGV2aWNlLmlzUHJlc2VudGluZykgZGV2aWNlLmV4aXRQcmVzZW50KCk7XG4gICAgICAgICAgaWYgKGRldmljZSkge1xuICAgICAgICAgICAgZGV2aWNlLnJlcXVlc3RQcmVzZW50KCBbIHsgc291cmNlOiBjYW52YXMgfSBdICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KSwgMjAwMH0pOyAvLyBAZml4IHRvIG1ha2UgaXQgd29yayBvbiBGeFJcbiAgICB9XG4gIH0sXG5cbiAgb25SZXNpemU6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUgJiYgZS5vcmlnaW4gPT09ICd3ZWJnZnh0ZXN0JykgcmV0dXJuO1xuXG4gICAgY29uc3QgREVGQVVMVF9XSURUSCA9IDgwMDtcbiAgICBjb25zdCBERUZBVUxUX0hFSUdIVCA9IDYwMDtcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gREVGQVVMVF9XSURUSDtcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9IERFRkFVTFRfSEVJR0hUO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydrZWVwLXdpbmRvdy1zaXplJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmNhbnZhc1dpZHRoID0gdHlwZW9mIHBhcmFtZXRlcnNbJ3dpZHRoJ10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9XSURUSCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ3dpZHRoJ10pO1xuICAgICAgdGhpcy5jYW52YXNIZWlnaHQgPSB0eXBlb2YgcGFyYW1ldGVyc1snaGVpZ2h0J10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9IRUlHSFQgOiBwYXJzZUludChwYXJhbWV0ZXJzWydoZWlnaHQnXSk7XG4gICAgICB3aW5kb3cuaW5uZXJXaWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgICB3aW5kb3cuaW5uZXJIZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYW52YXMpIHtcbiAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIH1cblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgaWYgKGUuaW5pdEV2ZW50KSB7XG4gICAgICBlLmluaXRFdmVudCgncmVzaXplJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIGUub3JpZ2luID0gJ3dlYmdmeHRlc3QnO1xuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50ID8gd2luZG93LmRpc3BhdGNoRXZlbnQoZSkgOiB3aW5kb3cuZmlyZUV2ZW50KFwib25cIiArIGV2ZW50VHlwZSwgZSk7XG4gIH1cbn07XG5cblRFU1RFUi5pbml0KCk7XG5cbnZhciBwYWdlSW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4iXSwibmFtZXMiOlsiU3RhdHMiLCJ0aGlzIiwiZGVmaW5lIiwicmVxdWlyZSQkMCIsInNyIiwiZGVjb2RlIiwiZGVjb2RlQ29tcG9uZW50IiwiREVGQVVMVF9PUFRJT05TIiwiS2V5c3Ryb2tlVmlzdWFsaXplciIsIldlYkdMU3RhdHMiLCJwaXhlbG1hdGNoIiwic2VlZHJhbmRvbSIsIlBlcmZTdGF0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Q0FBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRCLE1BQU0sUUFBUSxDQUFDO0NBQ2YsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFO0NBQ2pCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZixHQUFHOztDQUVILEVBQUUsT0FBTyxHQUFHLEdBQUc7Q0FDZixJQUFJLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQzFCLEdBQUc7O0NBRUgsRUFBRSxPQUFPLE9BQU8sR0FBRztDQUNuQixJQUFJLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQzFCLEdBQUc7O0NBRUgsRUFBRSxpQkFBaUIsR0FBRztDQUN0QixJQUFJLE9BQU8sQ0FBQyxDQUFDO0NBQ2IsR0FBRzs7Q0FFSCxFQUFFLFlBQVksR0FBRztDQUNqQixJQUFJLE9BQU8sRUFBRSxDQUFDO0NBQ2QsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDekIsRUFBRSxNQUFNLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQ3hCLEVBQUUsV0FBVyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUM3QixFQUFFLFFBQVEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDMUIsRUFBRSxlQUFlLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQ2pDLEVBQUUsUUFBUSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUMxQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFD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TUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVqQixDQUFlLFNBQVMsU0FBUyxDQUFDLEVBQUUsRUFBRTtDQUN0QyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ2QsQ0FBQyxLQUFLLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRTtDQUNyQixFQUFFLElBQUksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssVUFBVSxFQUFFO0NBQ3JDLEdBQUcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQ3JDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDakMsSUFBSSxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUN6QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO0NBQ3pDLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxJQUFJLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQzNDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdEMsSUFBSSxNQUFNLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMvQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxF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QyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7R0FHRixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLElBQUksR0FBRyxJQUFJLENBQUM7RUFDYjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLE9BQU8sQ0FBQyxDQUFD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LENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCO01BQ0Y7O0tBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO09BQ1osQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQzFDOzs7O0tBSUQsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtPQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztPQUN0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztPQUMzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZCxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ2Q7O0tBRUQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1Y7O0dBRUQsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNoQjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xC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QUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBQzs7Q0FFMUQsTUFBTSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEVBQUM7O0NBRWxELE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUM7Q0FDMUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztDQUMxQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0NBQzFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUM7Q0FDMUMsS0FBSztDQUNMLEdBQUc7Q0FDSCxDQUFDOztBQUVELENBQU8sU0FBUyxlQUFlLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRTtDQUM1RCxFQUFFLGVBQWUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7Q0FDOUM7O0VBQUMsRENsQkQsZ0JBQWMsR0FBRyxVQUFVLENBQUM7O0NBRTVCLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFOztLQUU1RCxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sR0FBRyxFQUFFLENBQUM7O0tBRTNCLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDOzs7O0tBSTFFLElBQUksUUFBUSxHQUFHLEtBQUssR0FBRyxTQUFTLEdBQUcsU0FBUztTQUN4QyxJQUFJLEdB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RSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDMUc7Ozs7O0NBS0QsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtLQUN6QyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7U0FDdEIsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRzs7U0FFdEIsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUMzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1NBQzNCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7O1NBRTNCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDM0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUMzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztTQUUzQixDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0tBRTlDLElBQUksS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztLQUVwQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7U0FDekMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztLQUU5QyxPQUFPLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQzFEOztDQUVELFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0NBQ3BGLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0NBQ3BGLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUFFOzs7Q0FHcEYsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtLQUNqQixPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0VBQzlCOztDQUVELFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDckMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7RUFDekI7O0NBRUQsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTtLQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7U0FDcEIsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN4QixDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3hCLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUM3QixPQUFPLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3pCOztDQ3pKRCxTQUFTLFVBQVUsSUFBSTs7Q0FFdkIsRUFBRSxJQUFJLElBQUksR0FBRztDQUNiLElBQUksWUFBWSxFQUFFLENBQUM7O0NBRW5CLElBQUksa0JBQWtCLENBQUMsQ0FBQztDQUN4QixJQUFJLDJCQUEyQixDQUFDLENBQUM7Q0FDakMsSUFBSSxvQkFBb0IsQ0FBQyxDQUFDO0NBQzFCLElBQUksNkJBQTZCLEVBQUUsQ0FBQzs7Q0FFcEMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDO0NBQ3hCLElBQUksUUFBUSxDQUFDLENBQUM7Q0FDZCxJQUFJLFdBQVcsQ0FBQyxDQUFDO0NBQ2pCLElBQUksU0FBUyxDQUFDLENBQUM7Q0FDZixJQUFJLGVBQWUsQ0FBQyxDQUFDO0NBQ3JCLElBQUc7O0NBRUgsRUFBRSxJQUFJLEtBQUssR0FBRztDQUNkLElBQUksU0FBUyxFQUFFLElBQUlSLFNBQUssRUFBRTtDQUMxQixJQUFJLGVBQWUsRUFBRSxJQUFJQSxTQUFLLEVBQUU7Q0FDaEMsSUFBSSxLQUFLLEVBQUUsSUFBSUEsU0FBSyxFQUFFO0NBQ3RCLElBQUksUUFBUSxFQUFFLElBQUlBLFNBQUssRUFBRTtDQUN6QixJQUFJLFlBQVksRUFBRSxJQUFJQSxTQUFLLEVBQUU7Q0FDN0IsR0FBRyxDQUFDOztDQUVKLEVBQUUsU0FBUyxRQUFRLEdBQUc7Q0FDdEIsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtDQUM1QixNQUFNLElBQUksV0FBVyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN0UsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0NBQzVDLEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRztDQUN2QixJQUFJLE9BQU8sWUFBWTtDQUN2QixRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO0NBQ25DLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUM7Q0FDbkMsS0FBSyxDQUFDO0NBQ04sR0FBRztDQUNIO0NBQ0EsRUFBRSxJQUFJLHdCQUF3QixJQUFJLE1BQU0sRUFBRTtDQUMxQyxJQUFJLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLFlBQVk7Q0FDakksTUFBTSxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztDQUN6QyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUMxQixNQUFNLEtBQUssU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDNUUsV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM5QyxLQUFLLENBQUMsQ0FBQzs7Q0FFUCxJQUFJLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLFlBQVk7Q0FDckksTUFBTSxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztDQUMzQyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUMxQixNQUFNLEtBQUssU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDNUUsV0FBVyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM5QyxLQUFLLENBQUMsQ0FBQzs7Q0FFUCxJQUFJLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsWUFBWTtDQUMvRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0NBQ2hDLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0NBQzFCLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM1RSxXQUFXLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzlDLEtBQUssRUFBRSxDQUFDO0NBQ1I7Q0FDQSxJQUFJLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsRUFBRSxFQUFFLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsWUFBWTtDQUNuSCxNQUFNLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0NBQ2xDLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0NBQzFCLE1BQU0sSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQzFDLE1BQU0sSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDekMsS0FBSyxFQUFFLENBQUM7Q0FDUjtDQUNBLElBQUksc0JBQXNCLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxZQUFZO0NBQy9HLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Q0FDaEMsS0FBSyxFQUFFLENBQUM7Q0FDUjtDQUNBLElBQUksc0JBQXNCLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxZQUFZO0NBQ2pILE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0NBQzdCLEtBQUssRUFBRSxDQUFDO0NBQ1I7Q0FDQSxHQUFHOztDQUVIO0NBQ0EsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFlBQVk7Q0FDM0csSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztDQUM5QixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUN4QixJQUFJLEtBQUssU0FBUyxFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDMUUsU0FBUyxJQUFJLENBQUMsV0FBVyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM1QyxHQUFHLEVBQUUsQ0FBQztDQUNOO0NBQ0EsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLEVBQUUsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFlBQVk7Q0FDL0csSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztDQUNoQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUN4QixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN4QyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ3ZDLEdBQUcsRUFBRSxDQUFDO0NBQ047Q0FDQSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsWUFBWTtDQUMzRyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0NBQzlCLEdBQUcsRUFBRSxDQUFDO0NBQ047Q0FDQSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsWUFBWTtDQUM3RyxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUMzQixHQUFHLEVBQUUsQ0FBQztDQUNOO0NBQ0EsRUFBRSxTQUFTLFVBQVUsSUFBSTtDQUN6QixJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0NBQzFCLElBQUksSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztDQUNoQyxJQUFJLElBQUksQ0FBQywyQkFBMkIsR0FBRyxDQUFDLENBQUM7Q0FDekMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0NBQ2xDLElBQUksSUFBSSxDQUFDLDZCQUE2QixHQUFHLENBQUMsQ0FBQztDQUMzQyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUM7Q0FDaEMsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztDQUN0QixJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0NBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsSUFBSSxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztDQUM3QixHQUFHO0NBQ0g7Q0FDQSxFQUFFLFNBQVMsZUFBZSxDQUFDLE9BQU8sRUFBRTtDQUNwQyxJQUFJLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQztDQUM3RCxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7Q0FDZCxNQUFNLE9BQU87Q0FDYixLQUFLO0NBQ0wsSUFBSSxHQUFHLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxZQUFZO0NBQ2pGLE1BQU0sSUFBSSxDQUFDLDJCQUEyQixFQUFFLENBQUM7Q0FDekMsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Q0FDMUIsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzVFLFdBQVcsSUFBSSxDQUFDLFdBQVcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDOUMsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksR0FBRyxDQUFDLDBCQUEwQixHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsMEJBQTBCLEVBQUUsWUFBWTtDQUNyRixNQUFNLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0NBQzNDLE1BQU0sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0NBQzFCLE1BQU0sS0FBSyxTQUFTLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM1RSxXQUFXLElBQUksQ0FBQyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQzlDLEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRzs7Q0FFSCxFQUFFLFNBQVMsVUFBVSxHQUFHO0NBQ3hCLElBQUksSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0NBQ3BCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJO0NBQ3RDLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHO0NBQ3BCLFFBQVEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO0NBQzNCLFFBQVEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHO0NBQzNCLFFBQVEsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJO0NBQzVCLFFBQVEsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQjtDQUN6RCxPQUFPLENBQUM7Q0FDUixLQUFLLENBQUMsQ0FBQztDQUNQLElBQUksT0FBTyxNQUFNLENBQUM7Q0FDbEIsR0FBRztDQUNIO0NBQ0EsRUFBRSxPQUFPO0NBQ1QsSUFBSSxjQUFjLEVBQUUsTUFBTSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7Q0FDeEMsSUFBSSxlQUFlLEVBQUUsZUFBZTtDQUNwQyxJQUFJLFVBQVUsRUFBRSxVQUFVO0NBQzFCLElBQUksVUFBVSxFQUFFLFVBQVU7Q0FDMUIsSUFBSSxRQUFRLEVBQUUsUUFBUTtDQUN0QjtDQUNBO0NBQ0E7Q0FDQSxHQUFHO0NBQ0gsQ0FBQzs7QUFFRCxvQkFBZSxVQUFVLEVBQUU7O2lDQUFDLGhDQ3ZKNUIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7O0NBRXRELFNBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRTtDQUMzQixFQUFFO0NBQ0YsSUFBSSxRQUFRLENBQUMsVUFBVSxLQUFLLFVBQVU7Q0FDdEMsS0FBSyxRQUFRLENBQUMsVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDO0NBQzdFLElBQUk7Q0FDSixJQUFJLFFBQVEsRUFBRSxDQUFDO0NBQ2YsR0FBRyxNQUFNO0NBQ1QsSUFBSSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDNUQsR0FBRztDQUNILENBQUM7OztDQUdEO0NBQ0EsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLEdBQUcsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUUvQyxNQUFNLENBQUMsTUFBTSxHQUFHO0NBQ2hCLEVBQUUsS0FBSyxFQUFFLEtBQUs7Q0FDZCxFQUFFLFlBQVksRUFBRSxLQUFLOztDQUVyQjtDQUNBLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQztDQUM3QixFQUFFLGNBQWMsRUFBRSxJQUFJO0NBQ3RCO0NBQ0EsRUFBRSw4QkFBOEIsRUFBRSxDQUFDLENBQUM7O0NBRXBDO0NBQ0EsRUFBRSxZQUFZLEVBQUUsSUFBSTs7Q0FFcEI7Q0FDQSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQzs7Q0FFdkI7Q0FDQSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7O0NBRW5CLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQzs7Q0FFM0I7Q0FDQSxFQUFFLGdCQUFnQixFQUFFLENBQUM7O0NBRXJCLEVBQUUscUNBQXFDLEVBQUUsR0FBRzs7Q0FFNUM7Q0FDQTtDQUNBLEVBQUUsMEJBQTBCLEVBQUUsQ0FBQzs7Q0FFL0IsRUFBRSxVQUFVLEVBQUUsQ0FBQzs7Q0FFZixFQUFFLGlCQUFpQixFQUFFLE9BQU8sVUFBVSxDQUFDLFlBQVksQ0FBQyxLQUFLLFdBQVcsR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7Q0FFaEg7Q0FDQSxFQUFFLCtCQUErQixFQUFFLENBQUM7O0NBRXBDO0NBQ0EsRUFBRSxNQUFNLEVBQUUsSUFBSTs7Q0FFZCxFQUFFLGFBQWEsRUFBRSxJQUFJOztDQUVyQjtDQUNBOztDQUVBLEVBQUUsUUFBUSxFQUFFLFlBQVk7Q0FDeEIsSUFBSVMsWUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQzFCO0NBQ0EsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sRUFBRSxXQUFXO0NBQ3RCLElBQUlBLFlBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7Q0FFNUIsSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDLCtCQUErQixJQUFJLENBQUMsRUFBRTtDQUNyRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7O0NBRTlCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Q0FDeEI7Q0FDQTtDQUNBLFFBQVEsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Q0FDakQsVUFBVSxJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ3RGLFVBQVUsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDOztDQUV2QztDQUNBLFVBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsTUFBTSxFQUFFLENBQUM7O0NBRS9GO0NBQ0EsVUFBVSxTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7Q0FDdkMsWUFBWSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ3ZELFlBQVksSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7Q0FDakMsWUFBWSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUM1QyxXQUFXOztDQUVYLFVBQVUsY0FBYyxDQUFDLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7O0NBRW5JO0NBQ0EsVUFBVSxjQUFjLENBQUMsQ0FBQywwQ0FBMEMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzs7Q0FFcEosVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7Q0FFdkQsVUFBVSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7O0NBRTFCLFVBQVVBLFlBQVUsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7O0NBRTlDLFVBQVUsSUFBSSxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO0NBQ3JGLFlBQVksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDaEUsWUFBWSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ3hDLFdBQVc7O0NBRVgsVUFBVSxJQUFJLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFdBQVcsSUFBSSxlQUFlLENBQUMsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtDQUMxRyxZQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDckMsWUFBWSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzs7Q0FFckM7Q0FDQSxZQUFZLEtBQUssQ0FBQyxTQUFTLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUk7Q0FDdEUsY0FBYyxPQUFPLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNyQyxhQUFhLENBQUM7Q0FDZCxhQUFhLElBQUksQ0FBQyxJQUFJLElBQUk7Q0FDMUIsY0FBYyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQztDQUNySCxjQUFjLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ2hFLGNBQWMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Q0FDaEMsYUFBYSxDQUFDLENBQUM7Q0FDZixXQUFXLE1BQU07Q0FDakIsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztDQUM5QixXQUFXO0NBQ1gsU0FBUztDQUNUO0NBQ0EsT0FBTzs7Q0FFUCxNQUFNLElBQUksSUFBSSxDQUFDLHdCQUF3QixLQUFLLENBQUMsRUFBRTtDQUMvQyxRQUFRLElBQUksY0FBYyxJQUFJLFVBQVUsRUFBRTtDQUMxQyxVQUFVLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDOUMsU0FBUztDQUNULE9BQU87O0NBRVA7Q0FDQSxNQUFNLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsWUFBWSxDQUFDOztDQUUvRjtDQUNBLE1BQU0sSUFBSSxJQUFJLENBQUMsOEJBQThCLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDckQsUUFBUSxJQUFJLENBQUMsc0JBQXNCLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQztDQUNuRyxRQUFRLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNqRCxPQUFPO0NBQ1AsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxJQUFJLEVBQUUsWUFBWTtDQUNwQixJQUFJLElBQUksRUFBRSxJQUFJLENBQUMsK0JBQStCLEdBQUcsQ0FBQztDQUNsRCxNQUFNLE9BQU87O0NBRWIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQzs7Q0FFOUIsSUFBSSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Q0FDNUIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUM7Q0FDckUsS0FBSzs7Q0FFTCxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtDQUM1QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0NBQzdELEtBQUs7O0NBRUwsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0NBRWhELElBQUksSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDOztDQUV4QyxJQUFJLElBQUksYUFBYSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0NBQ3JELElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7Q0FDakMsSUFBSSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsRUFBRTtDQUN6RTtDQUNBLE1BQU0sSUFBSSxhQUFhLEdBQUcsSUFBSSxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxFQUFFO0NBQ2pGLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Q0FDaEMsUUFBUSxJQUFJLElBQUksQ0FBQywwQkFBMEIsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZGLE9BQU8sTUFBTTtDQUNiLFFBQVEsSUFBSSxJQUFJLENBQUMsMEJBQTBCLElBQUksQ0FBQyxDQUFDLEVBQUU7Q0FDbkQsVUFBVSxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztDQUM1QyxVQUFVLElBQUksSUFBSSxDQUFDLDBCQUEwQixJQUFJLElBQUksQ0FBQyxxQ0FBcUMsRUFBRTtDQUM3RixZQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNuRixZQUFZLElBQUksQ0FBQywwQkFBMEIsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNqRCxXQUFXO0NBQ1gsU0FBUztDQUNULE9BQU87Q0FDUCxLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsYUFBYSxDQUFDO0NBQzNDO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Q0FDcEMsSUFBSSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtDQUMvQixNQUFNLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0NBQ3hGLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztDQUNyRCxLQUFLOztDQUVMLElBQUksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDOztDQUUzQixJQUFJLElBQUksSUFBSSxDQUFDLHdCQUF3QixLQUFLLENBQUMsRUFBRTtDQUM3QyxNQUFNLElBQUksQ0FBQyxjQUFjLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2xELE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsRUFBRSxJQUFJLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FBQyxDQUFDO0NBQ3hGLEtBQUs7O0NBRUwsSUFBSSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FFN0Q7O0NBRUw7Q0FDQSxJQUFJLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7O0NBRWhFLEdBQUc7O0NBRUgsRUFBRSx1QkFBdUIsRUFBRSxTQUFTLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFO0NBQ2pFLElBQUksSUFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4QyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztDQUNsRCxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ2pDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcseUZBQXlGLENBQUM7O0NBRWhILElBQUksSUFBSSxHQUFHLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztDQUMxQixJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsUUFBUSxDQUFDO0NBQ3RCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7Q0FDbkIsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUV2QixJQUFJLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDaEQsSUFBSSxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztDQUMvQixJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsV0FBVyxJQUFJLFFBQVEsQ0FBQzs7Q0FFOUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUV6QixJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzFELEdBQUc7O0NBRUg7Q0FDQSxFQUFFLGtCQUFrQixFQUFFLFdBQVc7Q0FDakMsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSztDQUM3QyxNQUFNLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7Q0FDNUIsTUFBTSxJQUFJLGtCQUFrQixHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUM7Q0FDbkY7Q0FDQSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLCtCQUErQixHQUFHLEdBQUcsR0FBRyxrQkFBa0IsR0FBRyxNQUFNLENBQUM7Q0FDMUYsTUFBTSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0NBQ3pDO0NBQ0E7Q0FDQTtDQUNBLE1BQU0sR0FBRyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7Q0FDcEMsTUFBTSxHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU07Q0FDekIsUUFBUSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3RELFFBQVEsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0NBQ2pDLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO0NBQ25DLFFBQVEsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMxQztDQUNBLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN0RjtDQUNBLFFBQVEsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNqRCxRQUFRLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztDQUNqRjtDQUNBLFFBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0NBQ3pDLFFBQU87Q0FDUCxNQUFNLElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDO0NBQ2hDLEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRzs7Q0FFSCxFQUFFLGVBQWUsRUFBRSxTQUFTLFFBQVEsRUFBRTtDQUN0QztDQUNBLElBQUksSUFBSSxXQUFXLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7Q0FFbEMsSUFBSSxJQUFJO0NBQ1IsTUFBTSxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDekMsTUFBTSxXQUFXLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQzNELE1BQU0sV0FBVyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7Q0FDcEMsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7Q0FDakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0NBQ2YsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Q0FDNUMsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxxQkFBcUIsRUFBRSxXQUFXO0NBQ3BDLElBQUksSUFBSSxXQUFXLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztDQUNsQyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQzs7Q0FFcEIsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSztDQUM3QyxNQUFNLFNBQVMsT0FBTyxFQUFFLEdBQUcsRUFBRTtDQUM3QixRQUFRLElBQUksR0FBRyxHQUFHLFdBQVcsQ0FBQztDQUM5QixRQUFRLElBQUksYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDN0QsUUFBUSxJQUFJLE9BQU8sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztDQUVyRCxRQUFRLGFBQWEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztDQUN4QyxRQUFRLGFBQWEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztDQUMxQyxRQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Q0FFckMsUUFBUSxJQUFJLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUNqRjtDQUNBLFFBQVEsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQzNDLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0NBQ25GLFFBQVEsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSTtDQUN2RCxVQUFVLElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7Q0FDekMsVUFBVSxJQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO0NBQzNDLFVBQVUsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUM1RCxVQUFVLElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDcEQsVUFBVSxVQUFVLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztDQUNuQyxVQUFVLFVBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0NBQ3JDLFVBQVUsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDNUQ7Q0FDQSxVQUFVLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ3BFLFVBQVUsZUFBZSxDQUFDLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDOztDQUUxRCxVQUFVLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7Q0FDM0MsVUFBVSxJQUFJLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO0NBQ3pDO0NBQ0EsVUFBVSxJQUFJLFNBQVMsR0FBRyxPQUFPLGVBQWUsQ0FBQyx5QkFBeUIsS0FBSyxXQUFXLEdBQUcsR0FBRyxHQUFHLGVBQWUsQ0FBQyx5QkFBeUIsQ0FBQztDQUM3SSxVQUFVLElBQUksYUFBYSxHQUFHQyxZQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztDQUM3RyxVQUFVLElBQUksUUFBUSxHQUFHLGFBQWEsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQ2hFO0NBQ0EsVUFBVSxJQUFJLElBQUksR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDO0NBQ3BDLFVBQVUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7O0NBRXhDLFVBQVUsSUFBSSxJQUFJLEVBQUU7Q0FDcEIsWUFBWSxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7Q0FDN0UsWUFBWSxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQztDQUNsSSxZQUFZLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUM3QyxZQUFZLE1BQU0sR0FBRztDQUNyQixjQUFjLE1BQU0sRUFBRSxNQUFNO0NBQzVCLGNBQWMsUUFBUSxFQUFFLFFBQVE7Q0FDaEMsY0FBYyxhQUFhLEVBQUUsYUFBYTtDQUMxQyxjQUFjLFVBQVUsRUFBRSwwQkFBMEI7Q0FDcEQsYUFBYSxDQUFDO0NBQ2Q7Q0FDQSxZQUFZLElBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDeEUsWUFBWSxZQUFZLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztDQUM1QyxZQUFZLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQzs7Q0FFeEUsWUFBWSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0NBRTdDLFlBQVksSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUN6RCxZQUFZLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQzVFLFlBQVksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQzNCLFdBQVcsTUFBTTtDQUNqQixZQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUM1QixXQUFXO0NBQ1gsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU07Q0FDdkIsVUFBVSxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0NBQ3RFLFVBQVUsWUFBWSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7Q0FDMUMsVUFBVSxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7O0NBRXRFLFVBQVUsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0NBQzNFLFVBQVUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0NBQzNGLFVBQVUsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDOztDQUUzQyxVQUFVLE1BQU0sQ0FBQztDQUNqQixZQUFZLE1BQU0sRUFBRSxNQUFNO0NBQzFCLFlBQVksVUFBVSxFQUFFLCtCQUErQjtDQUN2RCxXQUFXLENBQUMsQ0FBQztDQUNiLFNBQVMsQ0FBQyxDQUFDO0NBQ1gsT0FBTzs7Q0FFUCxNQUFNLElBQUk7Q0FDVixRQUFRLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUMzQyxRQUFRLFdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDN0QsUUFBUSxXQUFXLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztDQUNyQyxRQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQztDQUNuRixPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Q0FDakIsUUFBUSxNQUFNLEVBQUUsQ0FBQztDQUNqQixPQUFPO0NBQ1AsS0FBSyxDQUFDLENBQUM7Q0FDUCxHQUFHOztDQUVILEVBQUUsVUFBVSxFQUFFLFlBQVk7Q0FDMUIsSUFBSSxJQUFJLFNBQVMsR0FBRyxTQUFTLEdBQUcsZUFBZSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7O0NBRW5FLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztDQUV4QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLElBQUksRUFBRTtDQUM3QyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztDQUNqRCxLQUFLLENBQUMsQ0FBQztDQUNQO0NBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEtBQUs7Q0FDdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3pCLEtBQUssQ0FBQyxDQUFDO0NBQ1A7Q0FDQSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssS0FBSztDQUMvQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDekIsS0FBSyxDQUFDLENBQUM7O0NBRVAsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0NBRS9ELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLEtBQUs7Q0FDL0MsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzFDLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3hDLEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRztDQUNIO0NBQ0EsRUFBRSxzQkFBc0IsRUFBRSxZQUFZO0NBQ3RDO0NBQ0EsTUFBTSxTQUFTLFVBQVUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtDQUNyRCxRQUFRLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDbkUsT0FBTztDQUNQO0NBQ0EsTUFBTSxTQUFTLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0NBQ3pDLFFBQVEsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMvQyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztDQUNwQyxRQUFRLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3hDLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzlDLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksWUFBWSxDQUFDO0NBQ2pELFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3JCO0NBQ0EsT0FBTzs7Q0FFUCxNQUFNLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOztDQUVwRTs7Q0FFQSxNQUFNLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDN0MsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0NBQ3RCLE1BQU0sSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7Q0FDaEMsTUFBTSxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsRUFBRSxHQUFHLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0NBQzlGLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDdkUsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNqRSxHQUFHOztDQUVILEVBQUUsdUJBQXVCLEVBQUUsWUFBWTtDQUN2QyxJQUFJLElBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUN4QyxJQUFJLElBQUksU0FBUyxHQUFHLE9BQU8sR0FBRyxZQUFZLENBQUM7O0NBRTNDLElBQUksT0FBTyxJQUFJLE9BQU8sRUFBRSxPQUFPLElBQUk7Q0FDbkMsTUFBTSxJQUFJLGVBQWUsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztDQUMxRCxNQUFNLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLEdBQUcsZUFBZSxDQUFDO0NBQzFFLE1BQU0sSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sR0FBRyxlQUFlLENBQUM7Q0FDbEU7Q0FDQSxNQUFNLElBQUksTUFBTSxHQUFHO0NBQ25CLFFBQVEsT0FBTyxFQUFFLGVBQWUsQ0FBQyxFQUFFO0NBQ25DLFFBQVEsS0FBSyxFQUFFO0NBQ2YsVUFBVSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Q0FDNUMsVUFBVSxLQUFLLEVBQUVELFlBQVUsQ0FBQyxVQUFVLEVBQUU7Q0FDeEMsU0FBUztDQUNULFFBQVEsU0FBUyxFQUFFLElBQUksQ0FBQyxpQkFBaUI7Q0FDekMsUUFBUSxTQUFTLEVBQUUsU0FBUztDQUM1QixRQUFRLGdCQUFnQixFQUFFLElBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWTtDQUM1RCxRQUFRLE1BQU0sRUFBRSxHQUFHO0NBQ25CLFFBQVEsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtDQUMvQyxRQUFRLFNBQVMsRUFBRSxTQUFTO0NBQzVCLFFBQVEsZUFBZSxFQUFFLGVBQWU7Q0FDeEMsUUFBUSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7Q0FDL0MsUUFBUSxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0I7Q0FDeEQsUUFBUSxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsR0FBRyxHQUFHLEdBQUcsZUFBZTtDQUNoRixRQUFRLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtDQUN2QyxRQUFRLE1BQU0sRUFBRSxNQUFNO0NBQ3RCLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0NBQ3ZCLE9BQU8sQ0FBQzs7Q0FFUjtDQUNBLE1BQU0sSUFBSSxPQUFPLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLFdBQVcsRUFBRTtDQUMxRSxRQUFRLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUN4QixPQUFPLE1BQU07Q0FDYixRQUFRLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUk7Q0FDdkQsVUFBVSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztDQUMzQyxVQUFVLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMxQixTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJO0NBQzlCLFVBQVUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDM0MsVUFBVSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDMUIsU0FBUyxDQUFDLENBQUM7Q0FDWCxPQUFPO0NBQ1AsS0FBSyxDQUFDLENBQUM7Q0FDUCxHQUFHOztDQUVILEVBQUUsaUJBQWlCLEVBQUUsWUFBWTs7Q0FFakMsSUFBSSxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ2hELElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUVuQixDQUFDLENBQUM7Q0FDTixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztDQUVyQyxJQUFJLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDNUMsSUFBSSxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztDQUM5QyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsZUFBZSxDQUFDO0NBQzdCLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0NBQ3BDO0NBQ0EsSUFBSSxJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUQsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsd0JBQXdCLENBQUM7Q0FDcEQsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLGtDQUFpQztDQUN2RSxJQUFJLGlCQUFpQixDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7Q0FDOUMsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7Q0FFN0MsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDdkMsSUFBSSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQy9DLElBQUksTUFBTSxDQUFDLEVBQUUsR0FBRyxhQUFhLENBQUM7Q0FDOUIsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7O0NBRTFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7O0NBRW5DLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0NBQzVCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Q0FDcEMsS0FBSzs7Q0FFTCxJQUFJLElBQUk7Q0FDUixNQUFNLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ3BELE1BQU0sSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRywwQkFBMEIsR0FBRyxlQUFlLENBQUM7Q0FDMUYsTUFBTSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7Q0FDMUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0NBQ2YsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Q0FDNUMsS0FBSzs7Q0FFTCxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtDQUM1QixNQUFNLFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Q0FDNUUsTUFBTSxRQUFRLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDaEYsS0FBSyxNQUFNO0NBQ1gsTUFBTSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJO0NBQ3BELFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0NBQ3pCLFVBQVUsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7Q0FDdkMsWUFBWSxNQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUN0RCxXQUFXO0NBQ1gsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDbEQsVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0NBQ25DLFNBQVM7Q0FDVDtDQUNBLFFBQVEsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNwRSxRQUFRLFlBQVksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztDQUMvQyxRQUFRLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7Q0FDdEMsVUFBVSxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUM7Q0FDdEUsU0FBUzs7Q0FFVCxRQUFRLFlBQVksQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztDQUNsRDtDQUNBLFFBQVEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDekMsUUFBUSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE9BQU8sVUFBVSxDQUFDLGtCQUFrQixDQUFDLEtBQUssV0FBVyxFQUFFO0NBQ3BILFVBQVUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3pCLFNBQVM7Q0FDVCxPQUFPLENBQUMsQ0FBQztDQUNULEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsVUFBVSxFQUFFLFlBQVk7Q0FDMUIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRztDQUNyRSxNQUFNLE9BQU8sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU87Q0FDaEMsTUFBTSxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLO0NBQzVCLE1BQU0sTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtDQUM5QixNQUFNLFFBQVEsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVE7Q0FDbEMsS0FBSyxDQUFDLENBQUM7O0NBRVAsSUFBSSxJQUFJLGFBQWEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDbEQsSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSTtDQUNqQyxNQUFNLElBQUksT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssVUFBVSxFQUFFO0NBQzlDLFFBQVEsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUM1QyxRQUFRLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLO0NBQ3BDLFVBQVUsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO0NBQy9CLFlBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3hDLFdBQVcsTUFBTSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7Q0FDeEMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDMUMsV0FBVzs7Q0FFWCxVQUFVLElBQUksZUFBZSxDQUFDLE9BQU87Q0FDckMsWUFBWSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0NBRTVDLFVBQVUsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN0QyxVQUFTO0NBQ1QsT0FBTztDQUNQLEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRzs7Q0FFSCxFQUFFLGNBQWMsRUFBRSxXQUFXO0NBQzdCLElBQUksT0FBTyxDQUFDLE1BQU07Q0FDbEIsTUFBTSxJQUFJLE9BQU8sVUFBVSxDQUFDLGNBQWMsQ0FBQyxLQUFLLFdBQVcsRUFBRTtDQUM3RCxRQUFRLE9BQU87Q0FDZixPQUFPOztDQUVQLE1BQU0sSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNyRCxNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUM7Ozs7Ozs7Ozs7b0JBVWQsQ0FBQyxDQUFDO0NBQ3RCLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDNUMsTUFBTSxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUN4RCxLQUFLLEVBQUM7Q0FDTixHQUFHOztDQUVILEVBQUUsY0FBYyxFQUFFLFdBQVc7Q0FDN0IsSUFBSSxPQUFPLENBQUMsTUFBTTtDQUNsQixNQUFNLElBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUQsTUFBTSxlQUFlLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyx5R0FBeUcsQ0FBQztDQUNoSixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztDQUVqRCxNQUFNLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNuRCxNQUFNLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNuRCxNQUFNLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUNqRSxNQUFNLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUMvQyxNQUFNLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUMvQyxNQUFNLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQzs7Q0FFM0QsTUFBTSxTQUFTLHFCQUFxQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtDQUM1RCxRQUFRLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDaEQsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyw2RkFBNkYsQ0FBQztDQUN4SCxRQUFRLGVBQWUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7O0NBRXpDLFFBQVEsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUN4RCxRQUFRLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDckMsUUFBUSxJQUFJLEVBQUUsRUFBRTtDQUNoQixVQUFVLFdBQVcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQzlCLFNBQVM7Q0FDVCxRQUFRLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2xCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQzs7Ozs7Ozs7Ozs7OztxQ0FhZixDQUFDLENBQUM7Q0FDdkMsVUFBVSxXQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxBQUN2QyxPQUFPOztDQUVQLE1BQU0sSUFBSSxPQUFPLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxXQUFXLEVBQUU7Q0FDN0QsUUFBUSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Q0FDN0YsUUFBUSxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDckcsT0FBTzs7Q0FFUCxNQUFNLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0NBQzNELE1BQU0sSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7O0NBRW5FLEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRzs7Q0FFSCxFQUFFLFVBQVUsRUFBRSxXQUFXO0NBQ3pCO0NBQ0EsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUU7Q0FDaEYsSUFBSSxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxHQUFFO0NBQ2pHLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEVBQUUsWUFBWTtDQUN2QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLEVBQUU7Q0FDM0MsTUFBTSxNQUFNLENBQUMseUJBQXlCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0NBQ3RFLE1BQU0sTUFBTSxDQUFDLHFCQUFxQixHQUFHLFFBQVEsSUFBSTtDQUNqRCxRQUFRLE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBSTtDQUNwQyxVQUFVLElBQUksZUFBZSxDQUFDLFdBQVcsRUFBRTtDQUMzQyxZQUFZLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztDQUMxQyxXQUFXO0NBQ1gsVUFBVSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDekI7Q0FDQSxVQUFVLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztDQUN0QyxVQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN0QixVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7O0NBRWhDLFVBQVUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQzFCO0NBQ0EsVUFBVSxJQUFJLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Q0FDeEUsWUFBWSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztDQUNyQyxZQUFZLE9BQU87Q0FDbkIsV0FBVzs7Q0FFWCxVQUFVLElBQUksZUFBZSxDQUFDLFlBQVksRUFBRTtDQUM1QyxZQUFZLGVBQWUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUMzQyxXQUFXO0NBQ1gsVUFBUztDQUNULFFBQVEsT0FBTyxNQUFNLENBQUMseUJBQXlCLENBQUMsY0FBYyxDQUFDLENBQUM7Q0FDaEUsUUFBTztDQUNQLEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsSUFBSSxFQUFFLFlBQVk7O0NBRXBCLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRTtDQUNqRCxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNyQixLQUFLOztDQUVMLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0NBQzFCLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztDQUUxQixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0NBRTdELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRTtDQUMzQyxNQUFNLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztDQUMxQixLQUFLOztDQUVMLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBR0UsWUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Q0FFOUMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLEtBQUssV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN6SixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7Q0FFdEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Q0FDcEIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0NBRWhFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDOztDQUV0QixJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSUMsV0FBUyxFQUFFLENBQUM7O0NBRWpDLElBQUksSUFBSSxDQUFDLElBQUksR0FBRztDQUNoQixNQUFNLE1BQU0sRUFBRSxFQUFFO0NBQ2hCLE1BQU0sUUFBUSxFQUFFLEVBQUU7Q0FDbEIsTUFBTSxXQUFXLEVBQUUsRUFBRTtDQUNyQixLQUFLLENBQUM7Q0FDTjs7Q0FFQSxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxvQkFBb0IsRUFBRSxDQUFDOztDQUVwRDtDQUNBLElBQUksSUFBSSxPQUFPLFVBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxXQUFXLEVBQUU7Q0FDeEQsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2xDLEtBQUs7O0NBRUwsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxDQUFDOztDQUV0QyxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQzNDLEdBQUc7O0NBRUgsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLE1BQU0sRUFBRTtDQUN0QyxJQUFJLElBQUksU0FBUyxDQUFDLGFBQWEsRUFBRTtDQUNqQyxNQUFNLFVBQVUsQ0FBQyxNQUFNO0NBQ3ZCLFFBQVEsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUk7Q0FDbkQsVUFBVSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkM7Q0FDQSxVQUFVLElBQUksTUFBTSxFQUFFO0NBQ3RCLFlBQVksTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQztDQUM1RCxXQUFXO0NBQ1gsU0FBUyxDQUFDLEVBQUUsS0FBSSxDQUFDLENBQUMsQ0FBQztDQUNuQixLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTtDQUN6QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssWUFBWSxFQUFFLE9BQU87O0NBRS9DLElBQUksTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0NBQzlCLElBQUksTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0NBQy9CLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUM7Q0FDckMsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQzs7Q0FFdkMsSUFBSSxJQUFJLE9BQU8sVUFBVSxDQUFDLGtCQUFrQixDQUFDLEtBQUssV0FBVyxFQUFFO0NBQy9ELE1BQU0sSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxXQUFXLEdBQUcsYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUNwSCxNQUFNLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssV0FBVyxHQUFHLGNBQWMsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Q0FDeEgsTUFBTSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Q0FDM0MsTUFBTSxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Q0FDN0MsS0FBSzs7Q0FFTCxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtDQUNyQixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Q0FDM0MsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0NBQzdDLEtBQUs7O0NBRUwsSUFBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN2RyxJQUFJLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUNyQixNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN4QyxLQUFLO0NBQ0wsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQztDQUM1QixJQUFJLE1BQU0sQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDM0YsR0FBRztDQUNILENBQUMsQ0FBQzs7Q0FFRixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7O0NBRWQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7OyJ9
