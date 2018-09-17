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
	  needsFakeMonotonouslyIncreasingTimer: false,
	  setFakedTime: function( newFakedTime ) {
	    this.fakedTime = newFakedTime;
	  },
	  enable: function () {
	    Date = MockDate;
	    
	    var self = this;
	    if (this.needsFakeMonotonouslyIncreasingTimer) {
	      Date.now = function() { self.fakedTime += self.timeScale; return self.fakedTime; };
	      performance.now = function() { self.fakedTime += self.timeScale; return self.fakedTime; };
	    } else {
	      Date.now = function() { return self.fakedTime * 1000.0 * self.timeScale / 60.0; };
	      performance.now = function() { return self.fakedTime * 1000.0 * self.timeScale / 60.0; };
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
	  webglContext: null,
	  enable: function (options) {
	    if (enabled) {return;}

	    var self = this;
	    HTMLCanvasElement.prototype.getContext = function() {
	      var ctx = originalGetContext.apply(this, arguments);
	      if ((ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
	        self.webglContext = ctx;
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

	//-----------------

	var randomSeed = 1;
	Math.random = seedrandom$1(randomSeed);

	// TICK
	// Holds the amount of time in msecs that the previously rendered frame took. Used to estimate when a stutter event occurs (fast frame followed by a slow frame)
	var lastFrameDuration = -1;

	// Wallclock time for when the previous frame finished.
	var lastFrameTick = -1;

	var accumulatedCpuIdleTime = 0;

	// Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
	var numStutterEvents = 0;

	var TesterConfig = {
	  dontOverrideTime: false
	};

	// Measure a "time until smooth frame rate" quantity, i.e. the time after which we consider the startup JIT and GC effects to have settled.
	// This field tracks how many consecutive frames have run smoothly. This variable is set to -1 when smooth frame rate has been achieved to disable tracking this further.
	var numConsecutiveSmoothFrames = 0;

	const numFastFramesNeededForSmoothFrameRate = 120; // Require 120 frames i.e. ~2 seconds of consecutive smooth stutter free frames to conclude we have reached a stable animation rate.

	const parameters = queryString.parse(location.search);

	CanvasHook.enable({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'});

	{
	  FakeTimers.enable();
	}





	// if (injectingInputStream || recordingInputStream) {

	// This is an unattended run, don't allow window.alert()s to intrude.
	window.alert = function(msg) { console.error('window.alert(' + msg + ')'); };
	window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; };

	window.TESTER = {
	  // Currently executing frame.
	  referenceTestFrameNumber: 0,
	  numFramesToRender: typeof parameters['numframes'] === 'undefined' ? 100 : parseInt(parameters['numframes']),

	  tick: function () {

	    --referenceTestPreTickCalledCount;

	    if (referenceTestPreTickCalledCount > 0)
	      return; // We are being called recursively, so ignore this call.
	/*    
	  
	    if (!runtimeInitialized) return;
	    ensureNoClientHandlers();
	*/  
	    var timeNow = performance.realNow();


	    var frameDuration = timeNow - lastFrameTick;
	    lastFrameTick = timeNow;
	    if (this.referenceTestFrameNumber > 5 && lastFrameDuration > 0) {
	      // This must be fixed depending on the vsync
	      if (frameDuration > 20.0 && frameDuration > lastFrameDuration * 1.35) {
	        numStutterEvents++;
	        if (numConsecutiveSmoothFrames != -1) numConsecutiveSmoothFrames = 0;
	      } else {
	        if (numConsecutiveSmoothFrames != -1) {
	          numConsecutiveSmoothFrames++;
	          if (numConsecutiveSmoothFrames >= numFastFramesNeededForSmoothFrameRate) {
	            console.log('timeUntilSmoothFramerate', timeNow - firstFrameTime);
	            numConsecutiveSmoothFrames = -1;
	          }
	        }
	      }
	    }
	    lastFrameDuration = frameDuration;
	/*
	    if (numPreloadXHRsInFlight == 0) { // Important! The frame number advances only for those frames that the game is not waiting for data from the initial network downloads.
	      if (numStartupBlockerXHRsPending == 0) ++this.referenceTestFrameNumber; // Actual reftest frame count only increments after game has consumed all the critical XHRs that were to be preloaded.
	      ++fakedTime; // But game time advances immediately after the preloadable XHRs are finished.
	    }
	*/
	    this.referenceTestFrameNumber++;
	    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.
	  
	    if (this.referenceTestFrameNumber === 1) {
	      firstFrameTime = performance.realNow();
	      console.log('First frame submitted at (ms):', firstFrameTime - pageInitTime);
	    }

	    if (this.referenceTestFrameNumber === this.numFramesToRender) {
	      TESTER.doReferenceTest();
	    }

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    previousEventHandlerExitedTime = performance.realNow();

	  },
	  doReferenceTest: function() {
	    var canvas = CanvasHook.webglContext.canvas;
	    
	    // Grab rendered WebGL front buffer image to a JS-side image object.
	    var actualImage = new Image();

	    function reftest () {
	      const init = performance.realNow();
	      //document.body.appendChild(actualImage);
	      //actualImage.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:99990;width:100%;height:100%;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
	      TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
	    }

	    try {
	      const init = performance.realNow();
	      actualImage.src = canvas.toDataURL("image/png");
	      actualImage.onload = reftest;
	      TESTER.stats.timeGeneratingReferenceImages += performance.realNow() - init;
	    } catch(e) {
	      //reftest(); // canvas.toDataURL() likely failed, return results immediately.
	    }
	  
	  },

	  initServer: function () {
	    var serverUrl = 'http://' + GFXPERFTEST_CONFIG.serverIP + ':8888';

	    this.socket = io.connect(serverUrl);
	    this.stats = new PerfStats$1();

	    this.socket.on('connect', function(data) {
	      console.log('Connected to testing server');
	    });
	    
	    this.socket.on('error', (error) => {
	      console.log(error);
	    });
	    
	    this.socket.on('connect_error', (error) => {
	      console.log(error);
	    });
	  },
	  benchmarkFinished: function () {
	    var timeEnd = performance.realNow();
	    var totalTime = timeEnd - pageInitTime; // Total time, including everything.

	    var div = document.createElement('div');
	    var text = document.createTextNode('Test finished!');
	    div.appendChild(text);
	    div.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:9999;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
	    document.body.appendChild(div);
	    // console.log('Time spent generating reference images:', TESTER.stats.timeGeneratingReferenceImages);

	    var totalRenderTime = timeEnd - firstFrameTime;
	    var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
	    
	    var data = {
	      test_id: GFXPERFTEST_CONFIG.test_id,
	      values: this.stats.getStatsSummary(),
	      numFrames: this.numFramesToRender,
	      totalTime: totalTime,
	      timeToFirstFrame: firstFrameTime - pageInitTime,
	      logs: this.logs,
	      avgFps: fps,
	      numStutterEvents: numStutterEvents,
	      result: 'PASS',
	      totalTime: totalTime,
	      totalRenderTime: totalRenderTime,
	      cpuTime: this.stats.totalTimeInMainLoop,
	      cpuIdleTime: this.stats.totalTimeOutsideMainLoop,
	      cpuIdlePerc: this.stats.totalTimeOutsideMainLoop * 100 / totalRenderTime,
	      pageLoadTime: pageLoadTime,
	    };

	    this.socket.emit('benchmark_finish', data);
	    console.log('Finished!', data);
	    this.socket.disconnect();
	    if (typeof window !== 'undefined' && window.close) window.close();
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

	          return fn.apply(null, args);
	        };
	      }
	    });
	  },
	  addProgressBar: function() {
	    window.onload = () => {
	      if (typeof parameters['order-global'] === 'undefined') {
	        return;
	      }

	      var divProgressBars = document.createElement('div');
	      divProgressBars.style.cssText = 'position: absolute; bottom: 0; background-color: #333; width: 200px; padding: 10px 10px 0px 10px;';
	      document.body.appendChild(divProgressBars);
	      
	      var orderGlobal = parameters['order-global'];
	      var totalGlobal = parameters['total-global'];
	      var percGlobal = Math.round(orderGlobal/totalGlobal * 100);
	      var orderTest = parameters['order-test'];
	      var totalTest = parameters['total-test'];
	      var percTest = Math.round(orderTest/totalTest * 100);
	      
	      function addProgressBarSection(text, color, perc) {
	        var div = document.createElement('div');
	        div.style.cssText='width: 100%; height: 20px; margin-bottom: 10px; overflow: hidden; background-color: #f5f5f5; border-radius: 4px; -webkit-box-shadow: inset 0 1px 2px rgba(0,0,0,.1); box-shadow: inset 0 1px 2px rgba(0,0,0,.1);';
	        divProgressBars.appendChild(div);
	        
	        var divProgress = document.createElement('div');
	        div.appendChild(divProgress);
	        divProgress.style.cssText=`width: ${perc}%; background-color: ${color} float: left;
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

	      addProgressBarSection(`${orderTest}/${totalTest} ${percTest}%`, '#5bc0de', percTest);
	      addProgressBarSection(`${orderGlobal}/${totalGlobal} ${percGlobal}%`, '#337ab7', percGlobal);
	      return;
	      /*
			<div class="progress" style="width: 100%">
					<div id="progressbar2" class="progress-bar" role="progressbar" style="width: 50%; background-color: #f0ad4e">
						1/100 10%
					</div>
				</div>	
	*/
	      var div = document.createElement('div');
	      var text = document.createTextNode('Test finished!');
	      div.appendChild(text);
	      div.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:9999;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
	      document.body.appendChild(div);
	      // console.log('Time spent generating reference images:', TESTER.stats.timeGeneratingReferenceImages);  
	    };
	  },
	  init: function () {
	    this.addProgressBar();

	    console.log('Frames to render:', this.numFramesToRender);

	    const DEFAULT_WIDTH = 400;
	    const DEFAULT_HEIGHT = 300;

	    if (typeof parameters['keep-window-size'] === 'undefined') {
	      window.innerWidth = typeof parameters['width'] === 'undefined' ? DEFAULT_WIDTH : parseInt(parameters['width']);
	      window.innerHeight = typeof parameters['height'] === 'undefined' ? DEFAULT_HEIGHT : parseInt(parameters['height']);
	    }

	    this.initServer();

	    this.timeStart = performance.realNow();
	    window.addEventListener('tester_init', () => {
	    });

	    this.logs = {
	      errors: [],
	      warnings: [],
	      catchErrors: []
	    };
	    this.wrapErrors();

	    this.socket.emit('benchmark_started', {id: GFXPERFTEST_CONFIG.test_id});

	    this.socket.on('next_benchmark', (data) => {
	            // window.location.replace('http://threejs.org');
	      console.log('next_benchmark', data);
	      window.location.replace(data.url);
	    });

	    this.referenceTestFrameNumber = 0;
	  },
	};

	var firstFrameTime = null;

	TESTER.init();

	TesterConfig.preMainLoop = () => { TESTER.stats.frameStart(); };
	TesterConfig.postMainLoop = () => {TESTER.stats.frameEnd(); };

	{
	  if (!window.realRequestAnimationFrame) {
	    window.realRequestAnimationFrame = window.requestAnimationFrame;
	    window.requestAnimationFrame = callback => {
	      const hookedCallback = p => {
	        if (TesterConfig.preMainLoop) { TesterConfig.preMainLoop(); }
	        if (TesterConfig.referenceTestPreTick) { TesterConfig.referenceTestPreTick(); }
	  
	        if (TESTER.referenceTestFrameNumber === TESTER.numFramesToRender) {
	          TESTER.benchmarkFinished();
	          return;
	        }
	  
	        callback(performance.now());
	        TESTER.tick();
	        if (TesterConfig.postMainLoop) { TesterConfig.postMainLoop(); }
	  
	      };
	      return window.realRequestAnimationFrame(hookedCallback);
	    };
	  }
	}


	// Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
	var referenceTestPreTickCalledCount = 0;

	// Wallclock time for when we started CPU execution of the current frame.
	var referenceTestT0 = -1;

	function referenceTestPreTick() {
	  ++referenceTestPreTickCalledCount;
	  if (referenceTestPreTickCalledCount == 1) {
	    referenceTestT0 = performance.realNow();
	    if (pageLoadTime === null) pageLoadTime = performance.realNow() - pageInitTime;

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    if (previousEventHandlerExitedTime != -1) {
	      accumulatedCpuIdleTime += performance.realNow() - previousEventHandlerExitedTime;
	      previousEventHandlerExitedTime = -1;
	    }
	  }
	}
	TesterConfig.referenceTestPreTick = referenceTestPreTick;

	// If -1, we are not running an event. Otherwise represents the wallclock time of when we exited the last event handler.
	var previousEventHandlerExitedTime = -1;

	var pageInitTime = performance.realNow();

	// Wallclock time denoting when the page has finished loading.
	var pageLoadTime = null;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vLi4vY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uLy4uL2NhbnZhcy1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi9zcmMvY2xpZW50L2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFJlYWxEYXRlID0gRGF0ZTtcblxuY2xhc3MgTW9ja0RhdGUge1xuICBjb25zdHJ1Y3Rvcih0KSB7XG4gICAgdGhpcy50ID0gdDtcbiAgfVxuXG4gIHN0YXRpYyBub3coKSB7XG4gICAgcmV0dXJuIFJlYWxEYXRlLm5vdygpO1xuICB9XG5cbiAgc3RhdGljIHJlYWxOb3coKSB7XG4gICAgcmV0dXJuIFJlYWxEYXRlLm5vdygpO1xuICB9XG5cbiAgZ2V0VGltZXpvbmVPZmZzZXQoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB0b1RpbWVTdHJpbmcoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZ2V0RGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0SG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldE1pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFRpbWUoKSB7IHJldHVybiAwOyB9XG4gIGdldFllYXIoKSB7IHJldHVybiAwOyB9XG5cbiAgc3RhdGljIFVUQygpIHsgcmV0dXJuIDA7IH1cblxuICBnZXRVVENEYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENEYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0Z1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDU2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cblxuICBzZXREYXRlKCkge31cbiAgc2V0RnVsbFllYXIoKSB7fVxuICBzZXRIb3VycygpIHt9XG4gIHNldE1pbGxpc2Vjb25kcygpIHt9XG4gIHNldE1pbnV0ZXMoKSB7fVxuICBzZXRNb250aCgpIHt9XG4gIHNldFNlY29uZHMoKSB7fVxuICBzZXRUaW1lKCkge31cblxuICBzZXRVVENEYXRlKCkge31cbiAgc2V0VVRDRnVsbFllYXIoKSB7fVxuICBzZXRVVENIb3VycygpIHt9XG4gIHNldFVUQ01pbGxpc2Vjb25kcygpIHt9XG4gIHNldFVUQ01pbnV0ZXMoKSB7fVxuICBzZXRVVENNb250aCgpIHt9XG5cbiAgc2V0WWVhcigpIHt9XG59XG5cbnZhciByZWFsUGVyZm9ybWFuY2U7XG5cbmlmICghcGVyZm9ybWFuY2UucmVhbE5vdykge1xuICB2YXIgaXNTYWZhcmkgPSAvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICBpZiAoaXNTYWZhcmkpIHtcbiAgICByZWFsUGVyZm9ybWFuY2UgPSBwZXJmb3JtYW5jZTtcbiAgICBwZXJmb3JtYW5jZSA9IHtcbiAgICAgIHJlYWxOb3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9LFxuICAgICAgbm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfVxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcGVyZm9ybWFuY2UucmVhbE5vdyA9IHBlcmZvcm1hbmNlLm5vdztcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRpbWVTY2FsZTogMS4wLFxuICBmYWtlZFRpbWU6IDAsXG4gIGVuYWJsZWQ6IGZhbHNlLFxuICBuZWVkc0Zha2VNb25vdG9ub3VzbHlJbmNyZWFzaW5nVGltZXI6IGZhbHNlLFxuICBzZXRGYWtlZFRpbWU6IGZ1bmN0aW9uKCBuZXdGYWtlZFRpbWUgKSB7XG4gICAgdGhpcy5mYWtlZFRpbWUgPSBuZXdGYWtlZFRpbWU7XG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIERhdGUgPSBNb2NrRGF0ZTtcbiAgICBcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMubmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyKSB7XG4gICAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfVxuICAgIH0gZWxzZSB7XG4gICAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VsZi5mYWtlZFRpbWUgKiAxMDAwLjAgKiBzZWxmLnRpbWVTY2FsZSAvIDYwLjA7IH1cbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VsZi5mYWtlZFRpbWUgKiAxMDAwLjAgKiBzZWxmLnRpbWVTY2FsZSAvIDYwLjA7IH1cbiAgICB9XG4gIFxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gIH0sXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH07XG4gICAgXG4gICAgRGF0ZSA9IFJlYWxEYXRlOyAgICBcbiAgICBwZXJmb3JtYW5jZS5ub3cgPSByZWFsUGVyZm9ybWFuY2Uubm93O1xuICAgIFxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlOyAgICBcbiAgfVxufSIsImNvbnN0IG9yaWdpbmFsID0gWydnZXRQYXJhbWV0ZXInLCAnZ2V0RXh0ZW5zaW9uJywgJ2dldFNoYWRlclByZWNpc2lvbkZvcm1hdCddO1xuY29uc3QgZW1wdHlTdHJpbmcgPSBbJ2dldFNoYWRlckluZm9Mb2cnLCAnZ2V0UHJvZ3JhbUluZm9Mb2cnXTtcbmNvbnN0IHJldHVybjEgPSBbJ2lzQnVmZmVyJywgJ2lzRW5hYmxlZCcsICdpc0ZyYW1lYnVmZmVyJywgJ2lzUHJvZ3JhbScsICdpc1F1ZXJ5JywgJ2lzVmVydGV4QXJyYXknLCAnaXNTYW1wbGVyJywgJ2lzU3luYycsICdpc1RyYW5zZm9ybUZlZWRiYWNrJyxcbidpc1JlbmRlcmJ1ZmZlcicsICdpc1NoYWRlcicsICdpc1RleHR1cmUnLCAndmFsaWRhdGVQcm9ncmFtJywgJ2dldFNoYWRlclBhcmFtZXRlciddO1xuY29uc3QgcmV0dXJuMCA9IFsnaXNDb250ZXh0TG9zdCcsICdmaW5pc2gnLCAnZmx1c2gnLCAnZ2V0RXJyb3InLCAnZW5kVHJhbnNmb3JtRmVlZGJhY2snLCAncGF1c2VUcmFuc2Zvcm1GZWVkYmFjaycsICdyZXN1bWVUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYWN0aXZlVGV4dHVyZScsICdibGVuZEVxdWF0aW9uJywgJ2NsZWFyJywgJ2NsZWFyRGVwdGgnLCAnY2xlYXJTdGVuY2lsJywgJ2NvbXBpbGVTaGFkZXInLCAnY3VsbEZhY2UnLCAnZGVsZXRlQnVmZmVyJyxcbidkZWxldGVGcmFtZWJ1ZmZlcicsICdkZWxldGVQcm9ncmFtJywgJ2RlbGV0ZVJlbmRlcmJ1ZmZlcicsICdkZWxldGVTaGFkZXInLCAnZGVsZXRlVGV4dHVyZScsICdkZXB0aEZ1bmMnLCAnZGVwdGhNYXNrJywgJ2Rpc2FibGUnLCAnZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5JyxcbidlbmFibGUnLCAnZW5hYmxlVmVydGV4QXR0cmliQXJyYXknLCAnZnJvbnRGYWNlJywgJ2dlbmVyYXRlTWlwbWFwJywgJ2xpbmVXaWR0aCcsICdsaW5rUHJvZ3JhbScsICdzdGVuY2lsTWFzaycsICd1c2VQcm9ncmFtJywgJ2RlbGV0ZVF1ZXJ5JywgJ2RlbGV0ZVZlcnRleEFycmF5JyxcbidiaW5kVmVydGV4QXJyYXknLCAnZHJhd0J1ZmZlcnMnLCAncmVhZEJ1ZmZlcicsICdlbmRRdWVyeScsICdkZWxldGVTYW1wbGVyJywgJ2RlbGV0ZVN5bmMnLCAnZGVsZXRlVHJhbnNmb3JtRmVlZGJhY2snLCAnYmVnaW5UcmFuc2Zvcm1GZWVkYmFjaycsXG4nYXR0YWNoU2hhZGVyJywgJ2JpbmRCdWZmZXInLCAnYmluZEZyYW1lYnVmZmVyJywgJ2JpbmRSZW5kZXJidWZmZXInLCAnYmluZFRleHR1cmUnLCAnYmxlbmRFcXVhdGlvblNlcGFyYXRlJywgJ2JsZW5kRnVuYycsICdkZXB0aFJhbmdlJywgJ2RldGFjaFNoYWRlcicsICdoaW50JyxcbidwaXhlbFN0b3JlaScsICdwb2x5Z29uT2Zmc2V0JywgJ3NhbXBsZUNvdmVyYWdlJywgJ3NoYWRlclNvdXJjZScsICdzdGVuY2lsTWFza1NlcGFyYXRlJywgJ3VuaWZvcm0xZicsICd1bmlmb3JtMWZ2JywgJ3VuaWZvcm0xaScsICd1bmlmb3JtMWl2Jyxcbid1bmlmb3JtMmZ2JywgJ3VuaWZvcm0yaXYnLCAndW5pZm9ybTNmdicsICd1bmlmb3JtM2l2JywgJ3VuaWZvcm00ZnYnLCAndW5pZm9ybTRpdicsICd2ZXJ0ZXhBdHRyaWIxZicsICd2ZXJ0ZXhBdHRyaWIxZnYnLCAndmVydGV4QXR0cmliMmZ2JywgJ3ZlcnRleEF0dHJpYjNmdicsXG4ndmVydGV4QXR0cmliNGZ2JywgJ3ZlcnRleEF0dHJpYkRpdmlzb3InLCAnYmVnaW5RdWVyeScsICdpbnZhbGlkYXRlRnJhbWVidWZmZXInLCAndW5pZm9ybTF1aScsICd1bmlmb3JtMXVpdicsICd1bmlmb3JtMnVpdicsICd1bmlmb3JtM3VpdicsICd1bmlmb3JtNHVpdicsXG4ndmVydGV4QXR0cmliSTRpdicsICd2ZXJ0ZXhBdHRyaWJJNHVpdicsICdiaW5kU2FtcGxlcicsICdmZW5jZVN5bmMnLCAnYmluZFRyYW5zZm9ybUZlZWRiYWNrJyxcbidiaW5kQXR0cmliTG9jYXRpb24nLCAnYnVmZmVyRGF0YScsICdidWZmZXJTdWJEYXRhJywgJ2RyYXdBcnJheXMnLCAnc3RlbmNpbEZ1bmMnLCAnc3RlbmNpbE9wJywgJ3RleFBhcmFtZXRlcmYnLCAndGV4UGFyYW1ldGVyaScsICd1bmlmb3JtMmYnLCAndW5pZm9ybTJpJyxcbid1bmlmb3JtTWF0cml4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzZnYnLCAndW5pZm9ybU1hdHJpeDRmdicsICd2ZXJ0ZXhBdHRyaWIyZicsICd1bmlmb3JtMnVpJywgJ3VuaWZvcm1NYXRyaXgyeDNmdicsICd1bmlmb3JtTWF0cml4M3gyZnYnLFxuJ3VuaWZvcm1NYXRyaXgyeDRmdicsICd1bmlmb3JtTWF0cml4NHgyZnYnLCAndW5pZm9ybU1hdHJpeDN4NGZ2JywgJ3VuaWZvcm1NYXRyaXg0eDNmdicsICdjbGVhckJ1ZmZlcml2JywgJ2NsZWFyQnVmZmVydWl2JywgJ2NsZWFyQnVmZmVyZnYnLCAnc2FtcGxlclBhcmFtZXRlcmknLFxuJ3NhbXBsZXJQYXJhbWV0ZXJmJywgJ2NsaWVudFdhaXRTeW5jJywgJ3dhaXRTeW5jJywgJ3RyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ3MnLCAnYmluZEJ1ZmZlckJhc2UnLCAndW5pZm9ybUJsb2NrQmluZGluZycsXG4nYmxlbmRDb2xvcicsICdibGVuZEZ1bmNTZXBhcmF0ZScsICdjbGVhckNvbG9yJywgJ2NvbG9yTWFzaycsICdkcmF3RWxlbWVudHMnLCAnZnJhbWVidWZmZXJSZW5kZXJidWZmZXInLCAncmVuZGVyYnVmZmVyU3RvcmFnZScsICdzY2lzc29yJywgJ3N0ZW5jaWxGdW5jU2VwYXJhdGUnLFxuJ3N0ZW5jaWxPcFNlcGFyYXRlJywgJ3VuaWZvcm0zZicsICd1bmlmb3JtM2knLCAndmVydGV4QXR0cmliM2YnLCAndmlld3BvcnQnLCAnZHJhd0FycmF5c0luc3RhbmNlZCcsICd1bmlmb3JtM3VpJywgJ2NsZWFyQnVmZmVyZmknLFxuJ2ZyYW1lYnVmZmVyVGV4dHVyZTJEJywgJ3VuaWZvcm00ZicsICd1bmlmb3JtNGknLCAndmVydGV4QXR0cmliNGYnLCAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkJywgJ2NvcHlCdWZmZXJTdWJEYXRhJywgJ2ZyYW1lYnVmZmVyVGV4dHVyZUxheWVyJyxcbidyZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUnLCAndGV4U3RvcmFnZTJEJywgJ3VuaWZvcm00dWknLCAndmVydGV4QXR0cmliSTRpJywgJ3ZlcnRleEF0dHJpYkk0dWknLCAndmVydGV4QXR0cmliSVBvaW50ZXInLCAnYmluZEJ1ZmZlclJhbmdlJyxcbid0ZXhJbWFnZTJEJywgJ3ZlcnRleEF0dHJpYlBvaW50ZXInLCAnaW52YWxpZGF0ZVN1YkZyYW1lYnVmZmVyJywgJ3RleFN0b3JhZ2UzRCcsICdkcmF3UmFuZ2VFbGVtZW50cycsXG4nY29tcHJlc3NlZFRleEltYWdlMkQnLCAncmVhZFBpeGVscycsICd0ZXhTdWJJbWFnZTJEJywgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTJEJywgJ2NvcHlUZXhJbWFnZTJEJywgJ2NvcHlUZXhTdWJJbWFnZTJEJywgJ2NvbXByZXNzZWRUZXhJbWFnZTNEJyxcbidjb3B5VGV4U3ViSW1hZ2UzRCcsICdibGl0RnJhbWVidWZmZXInLCAndGV4SW1hZ2UzRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UzRCcsICd0ZXhTdWJJbWFnZTNEJ107XG5jb25zdCBudWxscyA9IFtdO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBGYWtlV2ViR0woZ2wpIHtcblx0dGhpcy5nbCA9IGdsO1xuXHRmb3IgKHZhciBrZXkgaW4gZ2wpIHtcblx0XHRpZiAodHlwZW9mIGdsW2tleV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGlmIChvcmlnaW5hbC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV0uYmluZChnbCk7XG5cdFx0XHR9IGVsc2UgaWYgKG51bGxzLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gbnVsbDt9O1xuXHRcdFx0fSBlbHNlIGlmIChyZXR1cm4wLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gMDt9O1xuXHRcdFx0fSBlbHNlIGlmIChyZXR1cm4xLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gMTt9O1xuXHRcdFx0fSBlbHNlIGlmIChlbXB0eVN0cmluZy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuICcnO307XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB0aGlzW2tleV0gPSBmdW5jdGlvbigpe307XG5cdFx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV0uYmluZChnbCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXNba2V5XSA9IGdsW2tleV07XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgRmFrZVdlYkdMIGZyb20gJy4vZmFrZS13ZWJnbCc7XG5cbnZhciBvcmlnaW5hbEdldENvbnRleHQgPSBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dDtcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcpIHtcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdyA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbn1cblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICB3ZWJnbENvbnRleHQ6IG51bGwsXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dCA9IGN0eDtcbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7XG4gIH0sXG5cbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghZW5hYmxlZCkge3JldHVybjt9XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBvcmlnaW5hbEdldENvbnRleHQ7XG4gICAgZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmU3RhdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm4gPSAwO1xuICAgIHRoaXMubWluID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLm1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLm1lYW4gPSAwO1xuICAgIHRoaXMucSA9IDA7XG4gIH1cblxuICBnZXQgdmFyaWFuY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucSAvIHRoaXMubjtcbiAgfVxuXG4gIGdldCBzdGFuZGFyZF9kZXZpYXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnEgLyB0aGlzLm4pO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAvLyBTb3JyeSwgbm8gTmFOc1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm4rKztcbiAgICB0aGlzLm1pbiA9IE1hdGgubWluKHRoaXMubWluLCBudW0pO1xuICAgIHRoaXMubWF4ID0gTWF0aC5tYXgodGhpcy5tYXgsIG51bSk7XG4gICAgdGhpcy5zdW0gKz0gbnVtO1xuICAgIGNvbnN0IHByZXZNZWFuID0gdGhpcy5tZWFuO1xuICAgIHRoaXMubWVhbiA9IHRoaXMubWVhbiArIChudW0gLSB0aGlzLm1lYW4pIC8gdGhpcy5uO1xuICAgIHRoaXMucSA9IHRoaXMucSArIChudW0gLSBwcmV2TWVhbikgKiAobnVtIC0gdGhpcy5tZWFuKTtcbiAgfVxuXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbjogdGhpcy5uLFxuICAgICAgbWluOiB0aGlzLm1pbixcbiAgICAgIG1heDogdGhpcy5tYXgsXG4gICAgICBzdW06IHRoaXMuc3VtLFxuICAgICAgbWVhbjogdGhpcy5tZWFuLFxuICAgICAgdmFyaWFuY2U6IHRoaXMudmFyaWFuY2UsXG4gICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgfTtcbiAgfSAgXG59XG4iLCJpbXBvcnQgU3RhdHMgZnJvbSAnaW5jcmVtZW50YWwtc3RhdHMtbGl0ZSc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVEVTVFNUQVRTXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgZmlyc3RGcmFtZSA9IHRydWU7XG4gIHZhciBmaXJzdEZwcyA9IHRydWU7XG5cbiAgdmFyIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IDA7XG4gIHZhciBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgdmFyIGxhc3RVcGRhdGVUaW1lID0gbnVsbDtcblxuICAvLyBVc2VkIHRvIGRldGVjdCByZWN1cnNpdmUgZW50cmllcyB0byB0aGUgbWFpbiBsb29wLCB3aGljaCBjYW4gaGFwcGVuIGluIGNlcnRhaW4gY29tcGxleCBjYXNlcywgZS5nLiBpZiBub3QgdXNpbmcgckFGIHRvIHRpY2sgcmVuZGVyaW5nIHRvIHRoZSBjYW52YXMuXG4gIHZhciBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPSAwO1xuXG4gIHJldHVybiB7XG4gICAgZ2V0U3RhdHNTdW1tYXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnN0YXRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0ge1xuICAgICAgICAgIG1pbjogdGhpcy5zdGF0c1trZXldLm1pbixcbiAgICAgICAgICBtYXg6IHRoaXMuc3RhdHNba2V5XS5tYXgsXG4gICAgICAgICAgYXZnOiB0aGlzLnN0YXRzW2tleV0ubWVhbixcbiAgICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhdHNba2V5XS5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzdGF0czoge1xuICAgICAgZnBzOiBuZXcgU3RhdHMoKSxcbiAgICAgIGR0OiBuZXcgU3RhdHMoKSxcbiAgICAgIGNwdTogbmV3IFN0YXRzKCkgICAgICAgIFxuICAgIH0sXG5cbiAgICBudW1GcmFtZXM6IDAsXG4gICAgbG9nOiBmYWxzZSxcbiAgICB0b3RhbFRpbWVJbk1haW5Mb29wOiAwLFxuICAgIHRvdGFsVGltZU91dHNpZGVNYWluTG9vcDogMCxcbiAgICBmcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWw6IDIwMCwgLy8gbXNlY3NcblxuICAgIGZyYW1lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyKys7XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID09IDEpIFxuICAgICAge1xuICAgICAgICBpZiAobGFzdFVwZGF0ZVRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0cygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVTdGF0czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICAgICAgdGhpcy5udW1GcmFtZXMrKztcblxuICAgICAgaWYgKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSA+IHRoaXMuZnBzQ291bnRlclVwZGF0ZUludGVydmFsKVxuICAgICAge1xuICAgICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXMgKiAxMDAwIC8gKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSk7XG4gICAgICAgIHRoaXMubnVtRnJhbWVzID0gMDtcbiAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSB0aW1lTm93O1xuXG4gICAgICAgIGlmIChmaXJzdEZwcylcbiAgICAgICAge1xuICAgICAgICAgIGZpcnN0RnBzID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0cy5mcHMudXBkYXRlKGZwcyk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGZwcyAtIG1pbjogJHt0aGlzLnN0YXRzLmZwcy5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5mcHMubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmZwcy5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5mcHMuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYG1zICAtIG1pbjogJHt0aGlzLnN0YXRzLmR0Lm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmR0Lm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5kdC5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5kdC5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgY3B1IC0gbWluOiAke3RoaXMuc3RhdHMuY3B1Lm1pbi50b0ZpeGVkKDIpfSUgLyBhdmc6ICR7dGhpcy5zdGF0cy5jcHUubWVhbi50b0ZpeGVkKDIpfSUgLyBtYXg6ICR7dGhpcy5zdGF0cy5jcHUubWF4LnRvRml4ZWQoMil9JSAtIHN0ZDogJHt0aGlzLnN0YXRzLmNwdS5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX0lYCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpOyAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2FsbGVkIGluIHRoZSBlbmQgb2YgZWFjaCBtYWluIGxvb3AgZnJhbWUgdGljay5cbiAgICBmcmFtZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXItLTtcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgIT0gMCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIHZhciBjcHVNYWluTG9vcER1cmF0aW9uID0gdGltZU5vdyAtIGN1cnJlbnRGcmFtZVN0YXJ0VGltZTtcbiAgICAgIHZhciBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgPSB0aW1lTm93IC0gcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gICAgICBwcmV2aW91c0ZyYW1lRW5kVGltZSA9IHRpbWVOb3c7XG4gIFxuICAgICAgaWYgKGZpcnN0RnJhbWUpIHtcbiAgICAgICAgZmlyc3RGcmFtZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG90YWxUaW1lSW5NYWluTG9vcCArPSBjcHVNYWluTG9vcER1cmF0aW9uO1xuICAgICAgdGhpcy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKz0gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzIC0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcblxuICAgICAgdmFyIGNwdSA9IGNwdU1haW5Mb29wRHVyYXRpb24gKiAxMDAgLyBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXM7XG4gICAgICB0aGlzLnN0YXRzLmNwdS51cGRhdGUoY3B1KTtcbiAgICAgIHRoaXMuc3RhdHMuZHQudXBkYXRlKGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyk7XG4gICAgfVxuICB9XG59OyIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vLyBcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vIFxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cblxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBBbGVhKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgbWFzaCA9IE1hc2goKTtcblxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAyMDkxNjM5ICogbWUuczAgKyBtZS5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICBtZS5zMCA9IG1lLnMxO1xuICAgIG1lLnMxID0gbWUuczI7XG4gICAgcmV0dXJuIG1lLnMyID0gdCAtIChtZS5jID0gdCB8IDApO1xuICB9O1xuXG4gIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgbWUuYyA9IDE7XG4gIG1lLnMwID0gbWFzaCgnICcpO1xuICBtZS5zMSA9IG1hc2goJyAnKTtcbiAgbWUuczIgPSBtYXNoKCcgJyk7XG4gIG1lLnMwIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMCA8IDApIHsgbWUuczAgKz0gMTsgfVxuICBtZS5zMSAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczEgPCAwKSB7IG1lLnMxICs9IDE7IH1cbiAgbWUuczIgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMyIDwgMCkgeyBtZS5zMiArPSAxOyB9XG4gIG1hc2ggPSBudWxsO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5jID0gZi5jO1xuICB0LnMwID0gZi5zMDtcbiAgdC5zMSA9IGYuczE7XG4gIHQuczIgPSBmLnMyO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBBbGVhKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0geGcubmV4dDtcbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSAqIDB4MTAwMDAwMDAwKSB8IDA7IH1cbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcHJuZygpICsgKHBybmcoKSAqIDB4MjAwMDAwIHwgMCkgKiAxLjExMDIyMzAyNDYyNTE1NjVlLTE2OyAvLyAyXi01M1xuICB9O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuZnVuY3Rpb24gTWFzaCgpIHtcbiAgdmFyIG4gPSAweGVmYzgyNDlkO1xuXG4gIHZhciBtYXNoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH07XG5cbiAgcmV0dXJuIG1hc2g7XG59XG5cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5hbGVhID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3IxMjhcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gbWUueCBeIChtZS54IDw8IDExKTtcbiAgICBtZS54ID0gbWUueTtcbiAgICBtZS55ID0gbWUuejtcbiAgICBtZS56ID0gbWUudztcbiAgICByZXR1cm4gbWUudyBePSAobWUudyA+Pj4gMTkpIF4gdCBeICh0ID4+PiA4KTtcbiAgfTtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjEyOCA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yd293XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IChtZS54IF4gKG1lLnggPj4+IDIpKTtcbiAgICBtZS54ID0gbWUueTsgbWUueSA9IG1lLno7IG1lLnogPSBtZS53OyBtZS53ID0gbWUudjtcbiAgICByZXR1cm4gKG1lLmQgPSAobWUuZCArIDM2MjQzNyB8IDApKSArXG4gICAgICAgKG1lLnYgPSAobWUudiBeIChtZS52IDw8IDQpKSBeICh0IF4gKHQgPDwgMSkpKSB8IDA7XG4gIH07XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG4gIG1lLnYgPSAwO1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBpZiAoayA9PSBzdHJzZWVkLmxlbmd0aCkge1xuICAgICAgbWUuZCA9IG1lLnggPDwgMTAgXiBtZS54ID4+PiA0O1xuICAgIH1cbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgdC52ID0gZi52O1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcndvdyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yc2hpZnQ3XCIgYWxnb3JpdGhtIGJ5XG4vLyBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjpcbi8vIFwiT24gdGhlIFhvcmdzaGlmdCBSYW5kb20gTnVtYmVyIEdlbmVyYXRvcnNcIlxuLy8gaHR0cDovL3NhbHVjLmVuZ3IudWNvbm4uZWR1L3JlZnMvY3J5cHRvL3JuZy9wYW5uZXRvbjA1b250aGV4b3JzaGlmdC5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdmFyIFggPSBtZS54LCBpID0gbWUuaSwgdCwgdiwgdztcbiAgICB0ID0gWFtpXTsgdCBePSAodCA+Pj4gNyk7IHYgPSB0IF4gKHQgPDwgMjQpO1xuICAgIHQgPSBYWyhpICsgMSkgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDEwKTtcbiAgICB0ID0gWFsoaSArIDMpICYgN107IHYgXj0gdCBeICh0ID4+PiAzKTtcbiAgICB0ID0gWFsoaSArIDQpICYgN107IHYgXj0gdCBeICh0IDw8IDcpO1xuICAgIHQgPSBYWyhpICsgNykgJiA3XTsgdCA9IHQgXiAodCA8PCAxMyk7IHYgXj0gdCBeICh0IDw8IDkpO1xuICAgIFhbaV0gPSB2O1xuICAgIG1lLmkgPSAoaSArIDEpICYgNztcbiAgICByZXR1cm4gdjtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIGosIHcsIFggPSBbXTtcblxuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXG4gICAgICB3ID0gWFswXSA9IHNlZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgdXNpbmcgYSBzdHJpbmcuXG4gICAgICBzZWVkID0gJycgKyBzZWVkO1xuICAgICAgZm9yIChqID0gMDsgaiA8IHNlZWQubGVuZ3RoOyArK2opIHtcbiAgICAgICAgWFtqICYgN10gPSAoWFtqICYgN10gPDwgMTUpIF5cbiAgICAgICAgICAgIChzZWVkLmNoYXJDb2RlQXQoaikgKyBYWyhqICsgMSkgJiA3XSA8PCAxMyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxuICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIFgucHVzaCgwKTtcbiAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opO1xuICAgIGlmIChqID09IDgpIHcgPSBYWzddID0gLTE7IGVsc2UgdyA9IFhbal07XG5cbiAgICBtZS54ID0gWDtcbiAgICBtZS5pID0gMDtcblxuICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxuICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xuICAgICAgbWUubmV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54LnNsaWNlKCk7XG4gIHQuaSA9IGYuaTtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLngpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3JzaGlmdDcgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiBSaWNoYXJkIEJyZW50J3MgWG9yZ2VucyB4b3I0MDk2IGFsZ29yaXRobS5cbi8vXG4vLyBUaGlzIGZhc3Qgbm9uLWNyeXB0b2dyYXBoaWMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaXMgZGVzaWduZWQgZm9yXG4vLyB1c2UgaW4gTW9udGUtQ2FybG8gYWxnb3JpdGhtcy4gSXQgY29tYmluZXMgYSBsb25nLXBlcmlvZCB4b3JzaGlmdFxuLy8gZ2VuZXJhdG9yIHdpdGggYSBXZXlsIGdlbmVyYXRvciwgYW5kIGl0IHBhc3NlcyBhbGwgY29tbW9uIGJhdHRlcmllc1xuLy8gb2Ygc3Rhc3RpY2lhbCB0ZXN0cyBmb3IgcmFuZG9tbmVzcyB3aGlsZSBjb25zdW1pbmcgb25seSBhIGZldyBuYW5vc2Vjb25kc1xuLy8gZm9yIGVhY2ggcHJuZyBnZW5lcmF0ZWQuICBGb3IgYmFja2dyb3VuZCBvbiB0aGUgZ2VuZXJhdG9yLCBzZWUgQnJlbnQnc1xuLy8gcGFwZXI6IFwiU29tZSBsb25nLXBlcmlvZCByYW5kb20gbnVtYmVyIGdlbmVyYXRvcnMgdXNpbmcgc2hpZnRzIGFuZCB4b3JzLlwiXG4vLyBodHRwOi8vYXJ4aXYub3JnL3BkZi8xMDA0LjMxMTV2MS5wZGZcbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgeG9yNDA5NiA9IHJlcXVpcmUoJ3hvcjQwOTYnKTtcbi8vIHJhbmRvbSA9IHhvcjQwOTYoMSk7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VlZCB3aXRoIGludDMyIG9yIHN0cmluZy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20oKSwgMC4xNTIwNDM2NDUwNTM4NTQ3KTsgLy8gKDAsIDEpIHJhbmdlLCA1MyBiaXRzLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbS5pbnQzMigpLCAxODA2NTM0ODk3KTsgICAvLyBzaWduZWQgaW50MzIsIDMyIGJpdHMuXG4vL1xuLy8gRm9yIG5vbnplcm8gbnVtZXJpYyBrZXlzLCB0aGlzIGltcGVsZW1lbnRhdGlvbiBwcm92aWRlcyBhIHNlcXVlbmNlXG4vLyBpZGVudGljYWwgdG8gdGhhdCBieSBCcmVudCdzIHhvcmdlbnMgMyBpbXBsZW1lbnRhaW9uIGluIEMuICBUaGlzXG4vLyBpbXBsZW1lbnRhdGlvbiBhbHNvIHByb3ZpZGVzIGZvciBpbml0YWxpemluZyB0aGUgZ2VuZXJhdG9yIHdpdGhcbi8vIHN0cmluZyBzZWVkcywgb3IgZm9yIHNhdmluZyBhbmQgcmVzdG9yaW5nIHRoZSBzdGF0ZSBvZiB0aGUgZ2VuZXJhdG9yLlxuLy9cbi8vIE9uIENocm9tZSwgdGhpcyBwcm5nIGJlbmNobWFya3MgYWJvdXQgMi4xIHRpbWVzIHNsb3dlciB0aGFuXG4vLyBKYXZhc2NyaXB0J3MgYnVpbHQtaW4gTWF0aC5yYW5kb20oKS5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHcgPSBtZS53LFxuICAgICAgICBYID0gbWUuWCwgaSA9IG1lLmksIHQsIHY7XG4gICAgLy8gVXBkYXRlIFdleWwgZ2VuZXJhdG9yLlxuICAgIG1lLncgPSB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgIHYgXj0gdiA8PCAxMztcbiAgICB0IF49IHQgPDwgMTc7XG4gICAgdiBePSB2ID4+PiAxNTtcbiAgICB0IF49IHQgPj4+IDEyO1xuICAgIC8vIFVwZGF0ZSBYb3IgZ2VuZXJhdG9yIGFycmF5IHN0YXRlLlxuICAgIHYgPSBYW2ldID0gdiBeIHQ7XG4gICAgbWUuaSA9IGk7XG4gICAgLy8gUmVzdWx0IGlzIHRoZSBjb21iaW5hdGlvbi5cbiAgICByZXR1cm4gKHYgKyAodyBeICh3ID4+PiAxNikpKSB8IDA7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciB0LCB2LCBpLCBqLCB3LCBYID0gW10sIGxpbWl0ID0gMTI4O1xuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBOdW1lcmljIHNlZWRzIGluaXRpYWxpemUgdiwgd2hpY2ggaXMgdXNlZCB0byBnZW5lcmF0ZXMgWC5cbiAgICAgIHYgPSBzZWVkO1xuICAgICAgc2VlZCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0cmluZyBzZWVkcyBhcmUgbWl4ZWQgaW50byB2IGFuZCBYIG9uZSBjaGFyYWN0ZXIgYXQgYSB0aW1lLlxuICAgICAgc2VlZCA9IHNlZWQgKyAnXFwwJztcbiAgICAgIHYgPSAwO1xuICAgICAgbGltaXQgPSBNYXRoLm1heChsaW1pdCwgc2VlZC5sZW5ndGgpO1xuICAgIH1cbiAgICAvLyBJbml0aWFsaXplIGNpcmN1bGFyIGFycmF5IGFuZCB3ZXlsIHZhbHVlLlxuICAgIGZvciAoaSA9IDAsIGogPSAtMzI7IGogPCBsaW1pdDsgKytqKSB7XG4gICAgICAvLyBQdXQgdGhlIHVuaWNvZGUgY2hhcmFjdGVycyBpbnRvIHRoZSBhcnJheSwgYW5kIHNodWZmbGUgdGhlbS5cbiAgICAgIGlmIChzZWVkKSB2IF49IHNlZWQuY2hhckNvZGVBdCgoaiArIDMyKSAlIHNlZWQubGVuZ3RoKTtcbiAgICAgIC8vIEFmdGVyIDMyIHNodWZmbGVzLCB0YWtlIHYgYXMgdGhlIHN0YXJ0aW5nIHcgdmFsdWUuXG4gICAgICBpZiAoaiA9PT0gMCkgdyA9IHY7XG4gICAgICB2IF49IHYgPDwgMTA7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdiBePSB2IDw8IDQ7XG4gICAgICB2IF49IHYgPj4+IDEzO1xuICAgICAgaWYgKGogPj0gMCkge1xuICAgICAgICB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7ICAgICAvLyBXZXlsLlxuICAgICAgICB0ID0gKFhbaiAmIDEyN10gXj0gKHYgKyB3KSk7ICAvLyBDb21iaW5lIHhvciBhbmQgd2V5bCB0byBpbml0IGFycmF5LlxuICAgICAgICBpID0gKDAgPT0gdCkgPyBpICsgMSA6IDA7ICAgICAvLyBDb3VudCB6ZXJvZXMuXG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIGhhdmUgZGV0ZWN0ZWQgYWxsIHplcm9lczsgbWFrZSB0aGUga2V5IG5vbnplcm8uXG4gICAgaWYgKGkgPj0gMTI4KSB7XG4gICAgICBYWyhzZWVkICYmIHNlZWQubGVuZ3RoIHx8IDApICYgMTI3XSA9IC0xO1xuICAgIH1cbiAgICAvLyBSdW4gdGhlIGdlbmVyYXRvciA1MTIgdGltZXMgdG8gZnVydGhlciBtaXggdGhlIHN0YXRlIGJlZm9yZSB1c2luZyBpdC5cbiAgICAvLyBGYWN0b3JpbmcgdGhpcyBhcyBhIGZ1bmN0aW9uIHNsb3dzIHRoZSBtYWluIGdlbmVyYXRvciwgc28gaXQgaXMganVzdFxuICAgIC8vIHVucm9sbGVkIGhlcmUuICBUaGUgd2V5bCBnZW5lcmF0b3IgaXMgbm90IGFkdmFuY2VkIHdoaWxlIHdhcm1pbmcgdXAuXG4gICAgaSA9IDEyNztcbiAgICBmb3IgKGogPSA0ICogMTI4OyBqID4gMDsgLS1qKSB7XG4gICAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICAgIHYgXj0gdiA8PCAxMztcbiAgICAgIHQgXj0gdCA8PCAxNztcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB0IF49IHQgPj4+IDEyO1xuICAgICAgWFtpXSA9IHYgXiB0O1xuICAgIH1cbiAgICAvLyBTdG9yaW5nIHN0YXRlIGFzIG9iamVjdCBtZW1iZXJzIGlzIGZhc3RlciB0aGFuIHVzaW5nIGNsb3N1cmUgdmFyaWFibGVzLlxuICAgIG1lLncgPSB3O1xuICAgIG1lLlggPSBYO1xuICAgIG1lLmkgPSBpO1xuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQudyA9IGYudztcbiAgdC5YID0gZi5YLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuWCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjQwOTYgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2luZG93IG9iamVjdCBvciBnbG9iYWxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwiVHljaGUtaVwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8uXG4vLyBTZWUgaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZCwgYSA9IG1lLmE7XG4gICAgYiA9IChiIDw8IDI1KSBeIChiID4+PiA3KSBeIGM7XG4gICAgYyA9IChjIC0gZCkgfCAwO1xuICAgIGQgPSAoZCA8PCAyNCkgXiAoZCA+Pj4gOCkgXiBhO1xuICAgIGEgPSAoYSAtIGIpIHwgMDtcbiAgICBtZS5iID0gYiA9IChiIDw8IDIwKSBeIChiID4+PiAxMikgXiBjO1xuICAgIG1lLmMgPSBjID0gKGMgLSBkKSB8IDA7XG4gICAgbWUuZCA9IChkIDw8IDE2KSBeIChjID4+PiAxNikgXiBhO1xuICAgIHJldHVybiBtZS5hID0gKGEgLSBiKSB8IDA7XG4gIH07XG5cbiAgLyogVGhlIGZvbGxvd2luZyBpcyBub24taW52ZXJ0ZWQgdHljaGUsIHdoaWNoIGhhcyBiZXR0ZXIgaW50ZXJuYWxcbiAgICogYml0IGRpZmZ1c2lvbiwgYnV0IHdoaWNoIGlzIGFib3V0IDI1JSBzbG93ZXIgdGhhbiB0eWNoZS1pIGluIEpTLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEgPSBtZS5hLCBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kO1xuICAgIGEgPSAobWUuYSArIG1lLmIgfCAwKSA+Pj4gMDtcbiAgICBkID0gbWUuZCBeIGE7IGQgPSBkIDw8IDE2IF4gZCA+Pj4gMTY7XG4gICAgYyA9IG1lLmMgKyBkIHwgMDtcbiAgICBiID0gbWUuYiBeIGM7IGIgPSBiIDw8IDEyIF4gZCA+Pj4gMjA7XG4gICAgbWUuYSA9IGEgPSBhICsgYiB8IDA7XG4gICAgZCA9IGQgXiBhOyBtZS5kID0gZCA9IGQgPDwgOCBeIGQgPj4+IDI0O1xuICAgIG1lLmMgPSBjID0gYyArIGQgfCAwO1xuICAgIGIgPSBiIF4gYztcbiAgICByZXR1cm4gbWUuYiA9IChiIDw8IDcgXiBiID4+PiAyNSk7XG4gIH1cbiAgKi9cblxuICBtZS5hID0gMDtcbiAgbWUuYiA9IDA7XG4gIG1lLmMgPSAyNjU0NDM1NzY5IHwgMDtcbiAgbWUuZCA9IDEzNjcxMzA1NTE7XG5cbiAgaWYgKHNlZWQgPT09IE1hdGguZmxvb3Ioc2VlZCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUuYSA9IChzZWVkIC8gMHgxMDAwMDAwMDApIHwgMDtcbiAgICBtZS5iID0gc2VlZCB8IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyAyMDsgaysrKSB7XG4gICAgbWUuYiBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5hID0gZi5hO1xuICB0LmIgPSBmLmI7XG4gIHQuYyA9IGYuYztcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMudHljaGVpID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvKlxuQ29weXJpZ2h0IDIwMTQgRGF2aWQgQmF1LlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbklOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG5DTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcblNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG4oZnVuY3Rpb24gKHBvb2wsIG1hdGgpIHtcbi8vXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXG4vL1xuXG4vLyBEZXRlY3QgdGhlIGdsb2JhbCBvYmplY3QsIGV2ZW4gaWYgb3BlcmF0aW5nIGluIHN0cmljdCBtb2RlLlxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQzODcwNTcvMjY1Mjk4XG52YXIgZ2xvYmFsID0gKDAsIGV2YWwpKCd0aGlzJyksXG4gICAgd2lkdGggPSAyNTYsICAgICAgICAvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XG4gICAgY2h1bmtzID0gNiwgICAgICAgICAvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXG4gICAgZGlnaXRzID0gNTIsICAgICAgICAvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXG4gICAgcm5nbmFtZSA9ICdyYW5kb20nLCAvLyBybmduYW1lOiBuYW1lIGZvciBNYXRoLnJhbmRvbSBhbmQgTWF0aC5zZWVkcmFuZG9tXG4gICAgc3RhcnRkZW5vbSA9IG1hdGgucG93KHdpZHRoLCBjaHVua3MpLFxuICAgIHNpZ25pZmljYW5jZSA9IG1hdGgucG93KDIsIGRpZ2l0cyksXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxuICAgIG1hc2sgPSB3aWR0aCAtIDEsXG4gICAgbm9kZWNyeXB0bzsgICAgICAgICAvLyBub2RlLmpzIGNyeXB0byBtb2R1bGUsIGluaXRpYWxpemVkIGF0IHRoZSBib3R0b20uXG5cbi8vXG4vLyBzZWVkcmFuZG9tKClcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxuLy9cbmZ1bmN0aW9uIHNlZWRyYW5kb20oc2VlZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdmFyIGtleSA9IFtdO1xuICBvcHRpb25zID0gKG9wdGlvbnMgPT0gdHJ1ZSkgPyB7IGVudHJvcHk6IHRydWUgfSA6IChvcHRpb25zIHx8IHt9KTtcblxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxuICAgIG9wdGlvbnMuZW50cm9weSA/IFtzZWVkLCB0b3N0cmluZyhwb29sKV0gOlxuICAgIChzZWVkID09IG51bGwpID8gYXV0b3NlZWQoKSA6IHNlZWQsIDMpLCBrZXkpO1xuXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XG5cbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxuICB2YXIgcHJuZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cbiAgICB9XG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBtYXRoIHVudGlsXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cbiAgICB9XG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXG4gIH07XG5cbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIHwgMDsgfVxuICBwcm5nLnF1aWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgLyAweDEwMDAwMDAwMDsgfVxuICBwcm5nLmRvdWJsZSA9IHBybmc7XG5cbiAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xuXG4gIC8vIENhbGxpbmcgY29udmVudGlvbjogd2hhdCB0byByZXR1cm4gYXMgYSBmdW5jdGlvbiBvZiBwcm5nLCBzZWVkLCBpc19tYXRoLlxuICByZXR1cm4gKG9wdGlvbnMucGFzcyB8fCBjYWxsYmFjayB8fFxuICAgICAgZnVuY3Rpb24ocHJuZywgc2VlZCwgaXNfbWF0aF9jYWxsLCBzdGF0ZSkge1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAvLyBMb2FkIHRoZSBhcmM0IHN0YXRlIGZyb20gdGhlIGdpdmVuIHN0YXRlIGlmIGl0IGhhcyBhbiBTIGFycmF5LlxuICAgICAgICAgIGlmIChzdGF0ZS5TKSB7IGNvcHkoc3RhdGUsIGFyYzQpOyB9XG4gICAgICAgICAgLy8gT25seSBwcm92aWRlIHRoZSAuc3RhdGUgbWV0aG9kIGlmIHJlcXVlc3RlZCB2aWEgb3B0aW9ucy5zdGF0ZS5cbiAgICAgICAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KGFyYzQsIHt9KTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY2FsbGVkIGFzIGEgbWV0aG9kIG9mIE1hdGggKE1hdGguc2VlZHJhbmRvbSgpKSwgbXV0YXRlXG4gICAgICAgIC8vIE1hdGgucmFuZG9tIGJlY2F1c2UgdGhhdCBpcyBob3cgc2VlZHJhbmRvbS5qcyBoYXMgd29ya2VkIHNpbmNlIHYxLjAuXG4gICAgICAgIGlmIChpc19tYXRoX2NhbGwpIHsgbWF0aFtybmduYW1lXSA9IHBybmc7IHJldHVybiBzZWVkOyB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCBpcyBhIG5ld2VyIGNhbGxpbmcgY29udmVudGlvbiwgc28gcmV0dXJuIHRoZVxuICAgICAgICAvLyBwcm5nIGRpcmVjdGx5LlxuICAgICAgICBlbHNlIHJldHVybiBwcm5nO1xuICAgICAgfSkoXG4gIHBybmcsXG4gIHNob3J0c2VlZCxcbiAgJ2dsb2JhbCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuZ2xvYmFsIDogKHRoaXMgPT0gbWF0aCksXG4gIG9wdGlvbnMuc3RhdGUpO1xufVxubWF0aFsnc2VlZCcgKyBybmduYW1lXSA9IHNlZWRyYW5kb207XG5cbi8vXG4vLyBBUkM0XG4vL1xuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXG4vL1xuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cbi8vXG5mdW5jdGlvbiBBUkM0KGtleSkge1xuICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XG5cbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxuXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcbiAgICBzW2ldID0gaSsrO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcbiAgICBzW2pdID0gdDtcbiAgfVxuXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxuICAgIHZhciB0LCByID0gMCxcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcbiAgICB3aGlsZSAoY291bnQtLSkge1xuICAgICAgdCA9IHNbaSA9IG1hc2sgJiAoaSArIDEpXTtcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xuICAgIH1cbiAgICBtZS5pID0gaTsgbWUuaiA9IGo7XG4gICAgcmV0dXJuIHI7XG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5LCB0aGUgZnVuY3Rpb24gY2FsbCBiZWxvdyBhdXRvbWF0aWNhbGx5XG4gICAgLy8gZGlzY2FyZHMgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuICBUaGlzIGlzIGNhbGxlZCBSQzQtZHJvcFsyNTZdLlxuICAgIC8vIFNlZSBodHRwOi8vZ29vZ2xlLmNvbS9zZWFyY2g/cT1yc2ErZmx1aHJlcityZXNwb25zZSZidG5JXG4gIH0pKHdpZHRoKTtcbn1cblxuLy9cbi8vIGNvcHkoKVxuLy8gQ29waWVzIGludGVybmFsIHN0YXRlIG9mIEFSQzQgdG8gb3IgZnJvbSBhIHBsYWluIG9iamVjdC5cbi8vXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LmogPSBmLmo7XG4gIHQuUyA9IGYuUy5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbi8vXG4vLyBmbGF0dGVuKClcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cbi8vXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iaiksIHByb3A7XG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAnc3RyaW5nJyA/IG9iaiA6IG9iaiArICdcXDAnKTtcbn1cblxuLy9cbi8vIG1peGtleSgpXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cbi8vXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XG4gIHZhciBzdHJpbmdzZWVkID0gc2VlZCArICcnLCBzbWVhciwgaiA9IDA7XG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcbiAgICBrZXlbbWFzayAmIGpdID1cbiAgICAgIG1hc2sgJiAoKHNtZWFyIF49IGtleVttYXNrICYgal0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKSk7XG4gIH1cbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XG59XG5cbi8vXG4vLyBhdXRvc2VlZCgpXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gYW5kIE5vZGUgY3J5cHRvXG4vLyBtb2R1bGUgaWYgYXZhaWxhYmxlLlxuLy9cbmZ1bmN0aW9uIGF1dG9zZWVkKCkge1xuICB0cnkge1xuICAgIHZhciBvdXQ7XG4gICAgaWYgKG5vZGVjcnlwdG8gJiYgKG91dCA9IG5vZGVjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XG4gICAgICAvLyBUaGUgdXNlIG9mICdvdXQnIHRvIHJlbWVtYmVyIHJhbmRvbUJ5dGVzIG1ha2VzIHRpZ2h0IG1pbmlmaWVkIGNvZGUuXG4gICAgICBvdXQgPSBvdXQod2lkdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBuZXcgVWludDhBcnJheSh3aWR0aCk7XG4gICAgICAoZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG8pLmdldFJhbmRvbVZhbHVlcyhvdXQpO1xuICAgIH1cbiAgICByZXR1cm4gdG9zdHJpbmcob3V0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciBicm93c2VyID0gZ2xvYmFsLm5hdmlnYXRvcixcbiAgICAgICAgcGx1Z2lucyA9IGJyb3dzZXIgJiYgYnJvd3Nlci5wbHVnaW5zO1xuICAgIHJldHVybiBbK25ldyBEYXRlLCBnbG9iYWwsIHBsdWdpbnMsIGdsb2JhbC5zY3JlZW4sIHRvc3RyaW5nKHBvb2wpXTtcbiAgfVxufVxuXG4vL1xuLy8gdG9zdHJpbmcoKVxuLy8gQ29udmVydHMgYW4gYXJyYXkgb2YgY2hhcmNvZGVzIHRvIGEgc3RyaW5nXG4vL1xuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcbn1cblxuLy9cbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xuLy8gbm90IHdhbnQgdG8gaW50ZXJmZXJlIHdpdGggZGV0ZXJtaW5pc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIG1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcbi8vIGluaXRpYWxpemF0aW9uLlxuLy9cbm1peGtleShtYXRoLnJhbmRvbSgpLCBwb29sKTtcblxuLy9cbi8vIE5vZGVqcyBhbmQgQU1EIHN1cHBvcnQ6IGV4cG9ydCB0aGUgaW1wbGVtZW50YXRpb24gYXMgYSBtb2R1bGUgdXNpbmdcbi8vIGVpdGhlciBjb252ZW50aW9uLlxuLy9cbmlmICgodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBzZWVkcmFuZG9tO1xuICAvLyBXaGVuIGluIG5vZGUuanMsIHRyeSB1c2luZyBjcnlwdG8gcGFja2FnZSBmb3IgYXV0b3NlZWRpbmcuXG4gIHRyeSB7XG4gICAgbm9kZWNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuICB9IGNhdGNoIChleCkge31cbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBzZWVkcmFuZG9tOyB9KTtcbn1cblxuLy8gRW5kIGFub255bW91cyBzY29wZSwgYW5kIHBhc3MgaW5pdGlhbCB2YWx1ZXMuXG59KShcbiAgW10sICAgICAvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XG4gIE1hdGggICAgLy8gbWF0aDogcGFja2FnZSBjb250YWluaW5nIHJhbmRvbSwgcG93LCBhbmQgc2VlZHJhbmRvbVxuKTtcbiIsIi8vIEEgbGlicmFyeSBvZiBzZWVkYWJsZSBSTkdzIGltcGxlbWVudGVkIGluIEphdmFzY3JpcHQuXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHNlZWRyYW5kb20gPSByZXF1aXJlKCdzZWVkcmFuZG9tJyk7XG4vLyB2YXIgcmFuZG9tID0gc2VlZHJhbmRvbSgxKTsgLy8gb3IgYW55IHNlZWQuXG4vLyB2YXIgeCA9IHJhbmRvbSgpOyAgICAgICAvLyAwIDw9IHggPCAxLiAgRXZlcnkgYml0IGlzIHJhbmRvbS5cbi8vIHZhciB4ID0gcmFuZG9tLnF1aWNrKCk7IC8vIDAgPD0geCA8IDEuICAzMiBiaXRzIG9mIHJhbmRvbW5lc3MuXG5cbi8vIGFsZWEsIGEgNTMtYml0IG11bHRpcGx5LXdpdGgtY2FycnkgZ2VuZXJhdG9yIGJ5IEpvaGFubmVzIEJhYWfDuGUuXG4vLyBQZXJpb2Q6IH4yXjExNlxuLy8gUmVwb3J0ZWQgdG8gcGFzcyBhbGwgQmlnQ3J1c2ggdGVzdHMuXG52YXIgYWxlYSA9IHJlcXVpcmUoJy4vbGliL2FsZWEnKTtcblxuLy8geG9yMTI4LCBhIHB1cmUgeG9yLXNoaWZ0IGdlbmVyYXRvciBieSBHZW9yZ2UgTWFyc2FnbGlhLlxuLy8gUGVyaW9kOiAyXjEyOC0xLlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogTWF0cml4UmFuayBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3IxMjggPSByZXF1aXJlKCcuL2xpYi94b3IxMjgnKTtcblxuLy8geG9yd293LCBHZW9yZ2UgTWFyc2FnbGlhJ3MgMTYwLWJpdCB4b3Itc2hpZnQgY29tYmluZWQgcGx1cyB3ZXlsLlxuLy8gUGVyaW9kOiAyXjE5Mi0yXjMyXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBDb2xsaXNpb25PdmVyLCBTaW1wUG9rZXIsIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcndvdyA9IHJlcXVpcmUoJy4vbGliL3hvcndvdycpO1xuXG4vLyB4b3JzaGlmdDcsIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyLCB0YWtlc1xuLy8gYSBkaWZmZXJlbnQgYXBwcm9hY2g6IGl0IGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0c1xuLy8gdGhhbiBNYXJzYWdsaWEncyBvcmlnaW5hbCB0aHJlZS4gIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Jcbi8vIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxuLy8gUGVyaW9kIDJeMjU2LTEuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcnNoaWZ0NyA9IHJlcXVpcmUoJy4vbGliL3hvcnNoaWZ0NycpO1xuXG4vLyB4b3I0MDk2LCBieSBSaWNoYXJkIEJyZW50LCBpcyBhIDQwOTYtYml0IHhvci1zaGlmdCB3aXRoIGFcbi8vIHZlcnkgbG9uZyBwZXJpb2QgdGhhdCBhbHNvIGFkZHMgYSBXZXlsIGdlbmVyYXRvci4gSXQgYWxzbyBwYXNzZXNcbi8vIEJpZ0NydXNoIHdpdGggbm8gc3lzdGVtYXRpYyBmYWlsdXJlcy4gIEl0cyBsb25nIHBlcmlvZCBtYXlcbi8vIGJlIHVzZWZ1bCBpZiB5b3UgaGF2ZSBtYW55IGdlbmVyYXRvcnMgYW5kIG5lZWQgdG8gYXZvaWRcbi8vIGNvbGxpc2lvbnMuXG4vLyBQZXJpb2Q6IDJeNDEyOC0yXjMyLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3I0MDk2ID0gcmVxdWlyZSgnLi9saWIveG9yNDA5NicpO1xuXG4vLyBUeWNoZS1pLCBieSBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8sIGlzIGEgYml0LXNoaWZ0aW5nIHJhbmRvbVxuLy8gbnVtYmVyIGdlbmVyYXRvciBkZXJpdmVkIGZyb20gQ2hhQ2hhLCBhIG1vZGVybiBzdHJlYW0gY2lwaGVyLlxuLy8gaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcbi8vIFBlcmlvZDogfjJeMTI3XG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHR5Y2hlaSA9IHJlcXVpcmUoJy4vbGliL3R5Y2hlaScpO1xuXG4vLyBUaGUgb3JpZ2luYWwgQVJDNC1iYXNlZCBwcm5nIGluY2x1ZGVkIGluIHRoaXMgbGlicmFyeS5cbi8vIFBlcmlvZDogfjJeMTYwMFxudmFyIHNyID0gcmVxdWlyZSgnLi9zZWVkcmFuZG9tJyk7XG5cbnNyLmFsZWEgPSBhbGVhO1xuc3IueG9yMTI4ID0geG9yMTI4O1xuc3IueG9yd293ID0geG9yd293O1xuc3IueG9yc2hpZnQ3ID0geG9yc2hpZnQ3O1xuc3IueG9yNDA5NiA9IHhvcjQwOTY7XG5zci50eWNoZWkgPSB0eWNoZWk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3I7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHN0ciA9PiBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC9bIScoKSpdL2csIHggPT4gYCUke3guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX1gKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB0b2tlbiA9ICclW2EtZjAtOV17Mn0nO1xudmFyIHNpbmdsZU1hdGNoZXIgPSBuZXcgUmVnRXhwKHRva2VuLCAnZ2knKTtcbnZhciBtdWx0aU1hdGNoZXIgPSBuZXcgUmVnRXhwKCcoJyArIHRva2VuICsgJykrJywgJ2dpJyk7XG5cbmZ1bmN0aW9uIGRlY29kZUNvbXBvbmVudHMoY29tcG9uZW50cywgc3BsaXQpIHtcblx0dHJ5IHtcblx0XHQvLyBUcnkgdG8gZGVjb2RlIHRoZSBlbnRpcmUgc3RyaW5nIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb21wb25lbnRzLmpvaW4oJycpKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRG8gbm90aGluZ1xuXHR9XG5cblx0aWYgKGNvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIGNvbXBvbmVudHM7XG5cdH1cblxuXHRzcGxpdCA9IHNwbGl0IHx8IDE7XG5cblx0Ly8gU3BsaXQgdGhlIGFycmF5IGluIDIgcGFydHNcblx0dmFyIGxlZnQgPSBjb21wb25lbnRzLnNsaWNlKDAsIHNwbGl0KTtcblx0dmFyIHJpZ2h0ID0gY29tcG9uZW50cy5zbGljZShzcGxpdCk7XG5cblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuY2FsbChbXSwgZGVjb2RlQ29tcG9uZW50cyhsZWZ0KSwgZGVjb2RlQ29tcG9uZW50cyhyaWdodCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0dmFyIHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlucHV0ID0gZGVjb2RlQ29tcG9uZW50cyh0b2tlbnMsIGkpLmpvaW4oJycpO1xuXG5cdFx0XHR0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KSB7XG5cdC8vIEtlZXAgdHJhY2sgb2YgYWxsIHRoZSByZXBsYWNlbWVudHMgYW5kIHByZWZpbGwgdGhlIG1hcCB3aXRoIHRoZSBgQk9NYFxuXHR2YXIgcmVwbGFjZU1hcCA9IHtcblx0XHQnJUZFJUZGJzogJ1xcdUZGRkRcXHVGRkZEJyxcblx0XHQnJUZGJUZFJzogJ1xcdUZGRkRcXHVGRkZEJ1xuXHR9O1xuXG5cdHZhciBtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0d2hpbGUgKG1hdGNoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIERlY29kZSBhcyBiaWcgY2h1bmtzIGFzIHBvc3NpYmxlXG5cdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVjb2RlKG1hdGNoWzBdKTtcblxuXHRcdFx0aWYgKHJlc3VsdCAhPT0gbWF0Y2hbMF0pIHtcblx0XHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdH1cblxuXHQvLyBBZGQgYCVDMmAgYXQgdGhlIGVuZCBvZiB0aGUgbWFwIHRvIG1ha2Ugc3VyZSBpdCBkb2VzIG5vdCByZXBsYWNlIHRoZSBjb21iaW5hdG9yIGJlZm9yZSBldmVyeXRoaW5nIGVsc2Vcblx0cmVwbGFjZU1hcFsnJUMyJ10gPSAnXFx1RkZGRCc7XG5cblx0dmFyIGVudHJpZXMgPSBPYmplY3Qua2V5cyhyZXBsYWNlTWFwKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBSZXBsYWNlIGFsbCBkZWNvZGVkIGNvbXBvbmVudHNcblx0XHR2YXIga2V5ID0gZW50cmllc1tpXTtcblx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cChrZXksICdnJyksIHJlcGxhY2VNYXBba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVuY29kZWRVUkkpIHtcblx0aWYgKHR5cGVvZiBlbmNvZGVkVVJJICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGBlbmNvZGVkVVJJYCB0byBiZSBvZiB0eXBlIGBzdHJpbmdgLCBnb3QgYCcgKyB0eXBlb2YgZW5jb2RlZFVSSSArICdgJyk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGVuY29kZWRVUkkgPSBlbmNvZGVkVVJJLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuXG5cdFx0Ly8gVHJ5IHRoZSBidWlsdCBpbiBkZWNvZGVyIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRmFsbGJhY2sgdG8gYSBtb3JlIGFkdmFuY2VkIGRlY29kZXJcblx0XHRyZXR1cm4gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3Qgc3RyaWN0VXJpRW5jb2RlID0gcmVxdWlyZSgnc3RyaWN0LXVyaS1lbmNvZGUnKTtcbmNvbnN0IGRlY29kZUNvbXBvbmVudCA9IHJlcXVpcmUoJ2RlY29kZS11cmktY29tcG9uZW50Jyk7XG5cbmZ1bmN0aW9uIGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgaW5kZXgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRpbmRleCxcblx0XHRcdFx0XHQnXSdcblx0XHRcdFx0XS5qb2luKCcnKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnWycsXG5cdFx0XHRcdFx0ZW5jb2RlKGluZGV4LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0Y2FzZSAnYnJhY2tldCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW10nXS5qb2luKCcnKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnW109Jyxcblx0XHRcdFx0XHRlbmNvZGUodmFsdWUsIG9wdGlvbnMpXG5cdFx0XHRcdF0uam9pbignJyk7XG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUpID0+IHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlID09PSBudWxsID8gZW5jb2RlKGtleSwgb3B0aW9ucykgOiBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0Jz0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRsZXQgcmVzdWx0O1xuXG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gL1xcWyhcXGQqKVxcXSQvLmV4ZWMoa2V5KTtcblxuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxkKlxcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB7fTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV1bcmVzdWx0WzFdXSA9IHZhbHVlO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gLyhcXFtcXF0pJC8uZXhlYyhrZXkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFt2YWx1ZV07XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5lbmNvZGUpIHtcblx0XHRyZXR1cm4gb3B0aW9ucy5zdHJpY3QgPyBzdHJpY3RVcmlFbmNvZGUodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmRlY29kZSkge1xuXHRcdHJldHVybiBkZWNvZGVDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBrZXlzU29ydGVyKGlucHV0KSB7XG5cdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuXHRcdHJldHVybiBpbnB1dC5zb3J0KCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiBrZXlzU29ydGVyKE9iamVjdC5rZXlzKGlucHV0KSlcblx0XHRcdC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYSkgLSBOdW1iZXIoYikpXG5cdFx0XHQubWFwKGtleSA9PiBpbnB1dFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxuZnVuY3Rpb24gZXh0cmFjdChpbnB1dCkge1xuXHRjb25zdCBxdWVyeVN0YXJ0ID0gaW5wdXQuaW5kZXhPZignPycpO1xuXHRpZiAocXVlcnlTdGFydCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblx0cmV0dXJuIGlucHV0LnNsaWNlKHF1ZXJ5U3RhcnQgKyAxKTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe2RlY29kZTogdHJ1ZSwgYXJyYXlGb3JtYXQ6ICdub25lJ30sIG9wdGlvbnMpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdC8vIENyZWF0ZSBhbiBvYmplY3Qgd2l0aCBubyBwcm90b3R5cGVcblx0Y29uc3QgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuXHRpZiAodHlwZW9mIGlucHV0ICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRpbnB1dCA9IGlucHV0LnRyaW0oKS5yZXBsYWNlKC9eWz8jJl0vLCAnJyk7XG5cblx0aWYgKCFpbnB1dCkge1xuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmb3IgKGNvbnN0IHBhcmFtIG9mIGlucHV0LnNwbGl0KCcmJykpIHtcblx0XHRsZXQgW2tleSwgdmFsdWVdID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcblxuXHRcdC8vIE1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0Ly8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuXHRcdHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iaiwgb3B0aW9ucykgPT4ge1xuXHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZSdcblx0fTtcblxuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0aWYgKG9wdGlvbnMuc29ydCA9PT0gZmFsc2UpIHtcblx0XHRvcHRpb25zLnNvcnQgPSAoKSA9PiB7fTtcblx0fVxuXG5cdGNvbnN0IGZvcm1hdHRlciA9IGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHRyZXR1cm4gb2JqID8gT2JqZWN0LmtleXMob2JqKS5zb3J0KG9wdGlvbnMuc29ydCkubWFwKGtleSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmpba2V5XTtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBbXTtcblxuXHRcdFx0Zm9yIChjb25zdCB2YWx1ZTIgb2YgdmFsdWUuc2xpY2UoKSkge1xuXHRcdFx0XHRpZiAodmFsdWUyID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJlc3VsdC5wdXNoKGZvcm1hdHRlcihrZXksIHZhbHVlMiwgcmVzdWx0Lmxlbmd0aCkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmpvaW4oJyYnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucykgKyAnPScgKyBlbmNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXHR9KS5maWx0ZXIoeCA9PiB4Lmxlbmd0aCA+IDApLmpvaW4oJyYnKSA6ICcnO1xufTtcblxuZXhwb3J0cy5wYXJzZVVybCA9IChpbnB1dCwgb3B0aW9ucykgPT4ge1xuXHRyZXR1cm4ge1xuXHRcdHVybDogaW5wdXQuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuIiwiaW1wb3J0IEZha2VUaW1lcnMgZnJvbSAnZmFrZS10aW1lcnMnO1xuaW1wb3J0IENhbnZhc0hvb2sgZnJvbSAnY2FudmFzLWhvb2snO1xuaW1wb3J0IFBlcmZTdGF0cyBmcm9tICdwZXJmb3JtYW5jZS1zdGF0cyc7XG5pbXBvcnQgc2VlZHJhbmRvbSBmcm9tICdzZWVkcmFuZG9tJztcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnO1xuLy8tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcmFuZG9tU2VlZCA9IDE7XG5NYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20ocmFuZG9tU2VlZCk7XG5cbi8vIFRJQ0tcbi8vIEhvbGRzIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtc2VjcyB0aGF0IHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIGZyYW1lIHRvb2suIFVzZWQgdG8gZXN0aW1hdGUgd2hlbiBhIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIChmYXN0IGZyYW1lIGZvbGxvd2VkIGJ5IGEgc2xvdyBmcmFtZSlcbnZhciBsYXN0RnJhbWVEdXJhdGlvbiA9IC0xO1xuXG4vLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG52YXIgbGFzdEZyYW1lVGljayA9IC0xO1xuXG52YXIgYWNjdW11bGF0ZWRDcHVJZGxlVGltZSA9IDA7XG5cbi8vIEtlZXBzIHRyYWNrIG9mIHBlcmZvcm1hbmNlIHN0dXR0ZXIgZXZlbnRzLiBBIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIHdoZW4gdGhlcmUgaXMgYSBoaWNjdXAgaW4gc3Vic2VxdWVudCBwZXItZnJhbWUgdGltZXMuIChmYXN0IGZvbGxvd2VkIGJ5IHNsb3cpXG52YXIgbnVtU3R1dHRlckV2ZW50cyA9IDA7XG5cbnZhciBUZXN0ZXJDb25maWcgPSB7XG4gIGRvbnRPdmVycmlkZVRpbWU6IGZhbHNlXG59O1xuXG4vLyBNZWFzdXJlIGEgXCJ0aW1lIHVudGlsIHNtb290aCBmcmFtZSByYXRlXCIgcXVhbnRpdHksIGkuZS4gdGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd2UgY29uc2lkZXIgdGhlIHN0YXJ0dXAgSklUIGFuZCBHQyBlZmZlY3RzIHRvIGhhdmUgc2V0dGxlZC5cbi8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbnZhciBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IDA7XG5cbmNvbnN0IG51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGUgPSAxMjA7IC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlLlxuXG5jb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxuQ2FudmFzSG9vay5lbmFibGUoe2Zha2VXZWJHTDogdHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCd9KTtcblxuaWYgKCFUZXN0ZXJDb25maWcuZG9udE92ZXJyaWRlVGltZSlcbntcbiAgRmFrZVRpbWVycy5lbmFibGUoKTtcbn1cblxudmFyIHdlYmdsQ29udGV4dCA9IG51bGw7XG5cblxuXG5cblxuLy8gaWYgKGluamVjdGluZ0lucHV0U3RyZWFtIHx8IHJlY29yZGluZ0lucHV0U3RyZWFtKSB7XG5cbi8vIFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxud2luZG93LmFsZXJ0ID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5hbGVydCgnICsgbXNnICsgJyknKTsgfVxud2luZG93LmNvbmZpcm0gPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmNvbmZpcm0oJyArIG1zZyArICcpJyk7IHJldHVybiB0cnVlOyB9XG5cbndpbmRvdy5URVNURVIgPSB7XG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgbnVtRnJhbWVzVG9SZW5kZXI6IHR5cGVvZiBwYXJhbWV0ZXJzWydudW1mcmFtZXMnXSA9PT0gJ3VuZGVmaW5lZCcgPyAxMDAgOiBwYXJzZUludChwYXJhbWV0ZXJzWydudW1mcmFtZXMnXSksXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuXG4gICAgLS1yZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50O1xuXG4gICAgaWYgKHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPiAwKVxuICAgICAgcmV0dXJuOyAvLyBXZSBhcmUgYmVpbmcgY2FsbGVkIHJlY3Vyc2l2ZWx5LCBzbyBpZ25vcmUgdGhpcyBjYWxsLlxuLyogICAgXG4gIFxuICAgIGlmICghcnVudGltZUluaXRpYWxpemVkKSByZXR1cm47XG4gICAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuKi8gIFxuICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG5cbiAgICB2YXIgZnJhbWVEdXJhdGlvbiA9IHRpbWVOb3cgLSBsYXN0RnJhbWVUaWNrO1xuICAgIGxhc3RGcmFtZVRpY2sgPSB0aW1lTm93O1xuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA+IDUgJiYgbGFzdEZyYW1lRHVyYXRpb24gPiAwKSB7XG4gICAgICAvLyBUaGlzIG11c3QgYmUgZml4ZWQgZGVwZW5kaW5nIG9uIHRoZSB2c3luY1xuICAgICAgaWYgKGZyYW1lRHVyYXRpb24gPiAyMC4wICYmIGZyYW1lRHVyYXRpb24gPiBsYXN0RnJhbWVEdXJhdGlvbiAqIDEuMzUpIHtcbiAgICAgICAgbnVtU3R1dHRlckV2ZW50cysrO1xuICAgICAgICBpZiAobnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkge1xuICAgICAgICAgIG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzKys7XG4gICAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID49IG51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aW1lVW50aWxTbW9vdGhGcmFtZXJhdGUnLCB0aW1lTm93IC0gZmlyc3RGcmFtZVRpbWUpO1xuICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdEZyYW1lRHVyYXRpb24gPSBmcmFtZUR1cmF0aW9uO1xuLypcbiAgICBpZiAobnVtUHJlbG9hZFhIUnNJbkZsaWdodCA9PSAwKSB7IC8vIEltcG9ydGFudCEgVGhlIGZyYW1lIG51bWJlciBhZHZhbmNlcyBvbmx5IGZvciB0aG9zZSBmcmFtZXMgdGhhdCB0aGUgZ2FtZSBpcyBub3Qgd2FpdGluZyBmb3IgZGF0YSBmcm9tIHRoZSBpbml0aWFsIG5ldHdvcmsgZG93bmxvYWRzLlxuICAgICAgaWYgKG51bVN0YXJ0dXBCbG9ja2VyWEhSc1BlbmRpbmcgPT0gMCkgKyt0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjsgLy8gQWN0dWFsIHJlZnRlc3QgZnJhbWUgY291bnQgb25seSBpbmNyZW1lbnRzIGFmdGVyIGdhbWUgaGFzIGNvbnN1bWVkIGFsbCB0aGUgY3JpdGljYWwgWEhScyB0aGF0IHdlcmUgdG8gYmUgcHJlbG9hZGVkLlxuICAgICAgKytmYWtlZFRpbWU7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICAgIH1cbiovXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIrKztcbiAgICBGYWtlVGltZXJzLmZha2VkVGltZSsrOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICBmaXJzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGaXJzdCBmcmFtZSBzdWJtaXR0ZWQgYXQgKG1zKTonLCBmaXJzdEZyYW1lVGltZSAtIHBhZ2VJbml0VGltZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICBURVNURVIuZG9SZWZlcmVuY2VUZXN0KCk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gIH0sXG4gIGRvUmVmZXJlbmNlVGVzdDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IENhbnZhc0hvb2sud2ViZ2xDb250ZXh0LmNhbnZhcztcbiAgICBcbiAgICAvLyBHcmFiIHJlbmRlcmVkIFdlYkdMIGZyb250IGJ1ZmZlciBpbWFnZSB0byBhIEpTLXNpZGUgaW1hZ2Ugb2JqZWN0LlxuICAgIHZhciBhY3R1YWxJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgZnVuY3Rpb24gcmVmdGVzdCAoKSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdHVhbEltYWdlKTtcbiAgICAgIC8vYWN0dWFsSW1hZ2Uuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICBhY3R1YWxJbWFnZS5vbmxvYWQgPSByZWZ0ZXN0O1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvL3JlZnRlc3QoKTsgLy8gY2FudmFzLnRvRGF0YVVSTCgpIGxpa2VseSBmYWlsZWQsIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgIH1cbiAgXG4gIH0sXG5cbiAgaW5pdFNlcnZlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovLycgKyBHRlhQRVJGVEVTVF9DT05GSUcuc2VydmVySVAgKyAnOjg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG4gIH0sXG4gIGJlbmNobWFya0ZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpbWVFbmQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgdmFyIHRvdGFsVGltZSA9IHRpbWVFbmQgLSBwYWdlSW5pdFRpbWU7IC8vIFRvdGFsIHRpbWUsIGluY2x1ZGluZyBldmVyeXRoaW5nLlxuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1Rlc3QgZmluaXNoZWQhJyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRleHQpO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjA7Ym90dG9tOjA7ei1pbmRleDo5OTk5O2JhY2tncm91bmQtY29sb3I6Izk5OTtmb250LXNpemU6MTAwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWZcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgLy8gY29uc29sZS5sb2coJ1RpbWUgc3BlbnQgZ2VuZXJhdGluZyByZWZlcmVuY2UgaW1hZ2VzOicsIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyk7XG5cbiAgICB2YXIgdG90YWxSZW5kZXJUaW1lID0gdGltZUVuZCAtIGZpcnN0RnJhbWVUaW1lO1xuICAgIHZhciBjcHVJZGxlID0gYWNjdW11bGF0ZWRDcHVJZGxlVGltZSAqIDEwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyICogMTAwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIFxuICAgIHZhciBkYXRhID0ge1xuICAgICAgdGVzdF9pZDogR0ZYUEVSRlRFU1RfQ09ORklHLnRlc3RfaWQsXG4gICAgICB2YWx1ZXM6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IGZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgbG9nczogdGhpcy5sb2dzLFxuICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICBudW1TdHV0dGVyRXZlbnRzOiBudW1TdHV0dGVyRXZlbnRzLFxuICAgICAgcmVzdWx0OiAnUEFTUycsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgY3B1VGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVJbk1haW5Mb29wLFxuICAgICAgY3B1SWRsZVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wLFxuICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgcGFnZUxvYWRUaW1lOiBwYWdlTG9hZFRpbWUsXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19maW5pc2gnLCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZygnRmluaXNoZWQhJywgZGF0YSk7XG4gICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY2xvc2UpIHdpbmRvdy5jbG9zZSgpO1xuICB9LFxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5zZW5kTG9nKVxuICAgICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBhZGRQcm9ncmVzc0JhcjogZnVuY3Rpb24oKSB7XG4gICAgd2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snb3JkZXItZ2xvYmFsJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdlByb2dyZXNzQmFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2UHJvZ3Jlc3NCYXJzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6ICMzMzM7IHdpZHRoOiAyMDBweDsgcGFkZGluZzogMTBweCAxMHB4IDBweCAxMHB4Oyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzQmFycyk7XG4gICAgICBcbiAgICAgIHZhciBvcmRlckdsb2JhbCA9IHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddO1xuICAgICAgdmFyIHRvdGFsR2xvYmFsID0gcGFyYW1ldGVyc1sndG90YWwtZ2xvYmFsJ107XG4gICAgICB2YXIgcGVyY0dsb2JhbCA9IE1hdGgucm91bmQob3JkZXJHbG9iYWwvdG90YWxHbG9iYWwgKiAxMDApO1xuICAgICAgdmFyIG9yZGVyVGVzdCA9IHBhcmFtZXRlcnNbJ29yZGVyLXRlc3QnXTtcbiAgICAgIHZhciB0b3RhbFRlc3QgPSBwYXJhbWV0ZXJzWyd0b3RhbC10ZXN0J107XG4gICAgICB2YXIgcGVyY1Rlc3QgPSBNYXRoLnJvdW5kKG9yZGVyVGVzdC90b3RhbFRlc3QgKiAxMDApO1xuICAgICAgXG4gICAgICBmdW5jdGlvbiBhZGRQcm9ncmVzc0JhclNlY3Rpb24odGV4dCwgY29sb3IsIHBlcmMpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuc3R5bGUuY3NzVGV4dD0nd2lkdGg6IDEwMCU7IGhlaWdodDogMjBweDsgbWFyZ2luLWJvdHRvbTogMTBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsgYm9yZGVyLXJhZGl1czogNHB4OyAtd2Via2l0LWJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDJweCByZ2JhKDAsMCwwLC4xKTsgYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMnB4IHJnYmEoMCwwLDAsLjEpOyc7XG4gICAgICAgIGRpdlByb2dyZXNzQmFycy5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRpdlByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkaXZQcm9ncmVzcyk7XG4gICAgICAgIGRpdlByb2dyZXNzLnN0eWxlLmNzc1RleHQ9YHdpZHRoOiAke3BlcmN9JTsgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn0gZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMzMzdhYjc7XG4gICAgICAgICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIC0xcHggMCByZ2JhKDAsMCwwLC4xNSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgLW8tdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7YDtcbiAgICAgICAgICBkaXZQcm9ncmVzcy5pbm5lclRleHQgPSB0ZXh0OztcbiAgICAgIH1cblxuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyVGVzdH0vJHt0b3RhbFRlc3R9ICR7cGVyY1Rlc3R9JWAsICcjNWJjMGRlJywgcGVyY1Rlc3QpO1xuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyR2xvYmFsfS8ke3RvdGFsR2xvYmFsfSAke3BlcmNHbG9iYWx9JWAsICcjMzM3YWI3JywgcGVyY0dsb2JhbCk7XG4gICAgICByZXR1cm47XG4gICAgICAvKlxuXHRcdDxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiIHN0eWxlPVwid2lkdGg6IDEwMCVcIj5cblx0XHRcdFx0PGRpdiBpZD1cInByb2dyZXNzYmFyMlwiIGNsYXNzPVwicHJvZ3Jlc3MtYmFyXCIgcm9sZT1cInByb2dyZXNzYmFyXCIgc3R5bGU9XCJ3aWR0aDogNTAlOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjBhZDRlXCI+XG5cdFx0XHRcdFx0MS8xMDAgMTAlXG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XHRcbiovXG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUZXN0IGZpbmlzaGVkIScpO1xuICAgICAgZGl2LmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7cmlnaHQ6MDt0b3A6MDtib3R0b206MDt6LWluZGV4Ojk5OTk7YmFja2dyb3VuZC1jb2xvcjojOTk5O2ZvbnQtc2l6ZToxMDBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZlwiO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ1RpbWUgc3BlbnQgZ2VuZXJhdGluZyByZWZlcmVuY2UgaW1hZ2VzOicsIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyk7ICBcbiAgICB9XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFkZFByb2dyZXNzQmFyKCk7XG5cbiAgICBjb25zb2xlLmxvZygnRnJhbWVzIHRvIHJlbmRlcjonLCB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKTtcblxuICAgIGNvbnN0IERFRkFVTFRfV0lEVEggPSA0MDA7XG4gICAgY29uc3QgREVGQVVMVF9IRUlHSFQgPSAzMDA7XG5cbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ2tlZXAtd2luZG93LXNpemUnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5pbm5lcldpZHRoID0gdHlwZW9mIHBhcmFtZXRlcnNbJ3dpZHRoJ10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9XSURUSCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ3dpZHRoJ10pO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pO1xuICAgIH1cblxuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgdGhpcy50aW1lU3RhcnQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3Rlcl9pbml0JywgKCkgPT4ge1xuICAgIH0pO1xuXG4gICAgdGhpcy5sb2dzID0ge1xuICAgICAgZXJyb3JzOiBbXSxcbiAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgIGNhdGNoRXJyb3JzOiBbXVxuICAgIH07XG4gICAgdGhpcy53cmFwRXJyb3JzKCk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdiZW5jaG1hcmtfc3RhcnRlZCcsIHtpZDogR0ZYUEVSRlRFU1RfQ09ORklHLnRlc3RfaWR9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCduZXh0X2JlbmNobWFyaycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgICAvLyB3aW5kb3cubG9jYXRpb24ucmVwbGFjZSgnaHR0cDovL3RocmVlanMub3JnJyk7XG4gICAgICBjb25zb2xlLmxvZygnbmV4dF9iZW5jaG1hcmsnLCBkYXRhKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGRhdGEudXJsKTtcbiAgICB9KTtcblxuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID0gMDtcbiAgfSxcbn07XG5cbnZhciBmaXJzdEZyYW1lVGltZSA9IG51bGw7XG5cblRFU1RFUi5pbml0KCk7XG5cblRlc3RlckNvbmZpZy5wcmVNYWluTG9vcCA9ICgpID0+IHsgVEVTVEVSLnN0YXRzLmZyYW1lU3RhcnQoKTsgfTtcblRlc3RlckNvbmZpZy5wb3N0TWFpbkxvb3AgPSAoKSA9PiB7VEVTVEVSLnN0YXRzLmZyYW1lRW5kKCk7IH07XG5cbmlmICghVGVzdGVyQ29uZmlnLnByb3ZpZGVzUmFmSW50ZWdyYXRpb24pIHtcbiAgaWYgKCF3aW5kb3cucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gY2FsbGJhY2sgPT4ge1xuICAgICAgY29uc3QgaG9va2VkQ2FsbGJhY2sgPSBwID0+IHtcbiAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5wcmVNYWluTG9vcCkgeyBUZXN0ZXJDb25maWcucHJlTWFpbkxvb3AoKTsgfVxuICAgICAgICBpZiAoVGVzdGVyQ29uZmlnLnJlZmVyZW5jZVRlc3RQcmVUaWNrKSB7IFRlc3RlckNvbmZpZy5yZWZlcmVuY2VUZXN0UHJlVGljaygpOyB9XG4gIFxuICAgICAgICBpZiAoVEVTVEVSLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gVEVTVEVSLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICAgICAgVEVTVEVSLmJlbmNobWFya0ZpbmlzaGVkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gIFxuICAgICAgICBjYWxsYmFjayhwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgIFRFU1RFUi50aWNrKCk7XG4gIFxuICAgICAgICBpZiAoVGVzdGVyQ29uZmlnLnJlZmVyZW5jZVRlc3RUaWNrKSB7IFRlc3RlckNvbmZpZy5yZWZlcmVuY2VUZXN0VGljaygpOyB9XG4gICAgICAgIGlmIChUZXN0ZXJDb25maWcucG9zdE1haW5Mb29wKSB7IFRlc3RlckNvbmZpZy5wb3N0TWFpbkxvb3AoKTsgfVxuICBcbiAgICAgIH1cbiAgICAgIHJldHVybiB3aW5kb3cucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZShob29rZWRDYWxsYmFjayk7XG4gICAgfVxuICB9XG59XG5cblxuLy8gR3VhcmQgYWdhaW5zdCByZWN1cnNpdmUgY2FsbHMgdG8gcmVmZXJlbmNlVGVzdFByZVRpY2srcmVmZXJlbmNlVGVzdFRpY2sgZnJvbSBtdWx0aXBsZSByQUZzLlxudmFyIHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPSAwO1xuXG4vLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB3ZSBzdGFydGVkIENQVSBleGVjdXRpb24gb2YgdGhlIGN1cnJlbnQgZnJhbWUuXG52YXIgcmVmZXJlbmNlVGVzdFQwID0gLTE7XG5cbmZ1bmN0aW9uIHJlZmVyZW5jZVRlc3RQcmVUaWNrKCkge1xuICArK3JlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQ7XG4gIGlmIChyZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50ID09IDEpIHtcbiAgICByZWZlcmVuY2VUZXN0VDAgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgaWYgKHBhZ2VMb2FkVGltZSA9PT0gbnVsbCkgcGFnZUxvYWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcGFnZUluaXRUaW1lO1xuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgaWYgKHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSAhPSAtMSkge1xuICAgICAgYWNjdW11bGF0ZWRDcHVJZGxlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU7XG4gICAgICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICB9XG4gIH1cbn1cblRlc3RlckNvbmZpZy5yZWZlcmVuY2VUZXN0UHJlVGljayA9IHJlZmVyZW5jZVRlc3RQcmVUaWNrO1xuXG4vLyBJZiAtMSwgd2UgYXJlIG5vdCBydW5uaW5nIGFuIGV2ZW50LiBPdGhlcndpc2UgcmVwcmVzZW50cyB0aGUgd2FsbGNsb2NrIHRpbWUgb2Ygd2hlbiB3ZSBleGl0ZWQgdGhlIGxhc3QgZXZlbnQgaGFuZGxlci5cbnZhciBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcblxudmFyIHBhZ2VJbml0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuLy8gV2FsbGNsb2NrIHRpbWUgZGVub3Rpbmcgd2hlbiB0aGUgcGFnZSBoYXMgZmluaXNoZWQgbG9hZGluZy5cbnZhciBwYWdlTG9hZFRpbWUgPSBudWxsOyJdLCJuYW1lcyI6WyJTdGF0cyIsInRoaXMiLCJkZWZpbmUiLCJyZXF1aXJlJCQwIiwic3IiLCJkZWNvZGUiLCJkZWNvZGVDb21wb25lbnQiLCJzZWVkcmFuZG9tIiwiUGVyZlN0YXRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztDQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEIsTUFBTSxRQUFRLENBQUM7Q0FDZixFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUU7Q0FDakIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEdBQUcsR0FBRztDQUNmLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sT0FBTyxHQUFHO0NBQ25CLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLGlCQUFpQixHQUFHO0NBQ3RCLElBQUksT0FBTyxDQUFDLENBQUM7Q0FDYixHQUFHOztDQUVILEVBQUUsWUFBWSxHQUFHO0NBQ2pCLElBQUksT0FBTyxFQUFFLENBQUM7Q0FDZCxHQUFHOztDQUVILEVBQUUsT0FBTyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUN6QixFQUFFLE1BQU0sR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDeEIsRUFBRSxXQUFXLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQzdCLEVBQUUsUUFBUSxHQUFHLEVBQUUsT0FBTyxDQUFD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QUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDOzs7R0FHRixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ2xCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLEVBQUUsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BCLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFO0dBQzlCLElBQUksR0FBRyxJQUFJLENBQUM7RUFDYjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztHQUNaLE9BQU8sQ0FB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RyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCO01BQ0Y7O0tBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO09BQ1osQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQzFDOzs7O0tBSUQsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtPQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztPQUN0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztPQUMzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZCxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ2Q7O0tBRUQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1Y7O0dBRUQsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNoQjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFF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
