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
			let [key, value] = splitOnFirst(param.replace(/\+/g, ' '), '=');

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

	var keystrokeVisualizer = createCommonjsModule(function (module, exports) {
	(function (global, factory) {
	  module.exports = factory();
	}(commonjsGlobal, (function () {
	  const DEFAULT_OPTIONS = {
	    fontSize: 16,
	    keyStrokeDelay: 200,
	    lingerDelay: 1000,
	    fadeDuration: 1000,
	    bezelColor: '#000',
	    textColor: '#fff',
	    unmodifiedKey: true,
	    showSymbol: true,
	    appendModifiers: {
	      Meta: true,
	      Alt: true,
	      Shift: false
	    },
	    position: 'bottom-left'
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
	          debugger;
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
	      this.container = document.createElement('ul');
	      document.body.appendChild(this.container);
	      this.container.className = 'keystrokes';
	      const positions = {
	        'bottom-left': 'bottom: 0; left: 0;',
	        'bottom-right': 'bottom: 0; right: 0;',
	        'top-left': 'top: 0; left: 0;',
	        'top-right': 'top: 0; right: 0;'
	      };
	      if (!positions[this.options.position]) {
	        console.warn(`Invalid position '${this.options.position}', using default 'bottom-left'. Valid positions: `, Object.keys(positions));
	        this.options.position = 'bottom-left';
	      }
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
	      return (navigator.platform === 'MacIntel' ? conversionMac[key] : null) || conversionCommon[key] || key;
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
	      if (this.options.appendModifiers.Meta && e.metaKey && e.key !== 'Meta') {
	        modifier += this.convertKeyToSymbol('Meta');
	      }
	      if (this.options.appendModifiers.Alt && e.altKey && e.key !== 'Alt') {
	        modifier += this.convertKeyToSymbol('Alt');
	      }
	      if (this.options.appendModifiers.Shift && e.shiftKey && e.key !== 'Shift') {
	        modifier += this.convertKeyToSymbol('Shift');
	      }
	      this.currentChunk.textContent += modifier + (this.options.showSymbol ? this.convertKeyToSymbol(key) : key);
	    }
	    keyup(e) {
	      if (!this.currentChunk) return;
	      var options = this.options;
	      clearTimeout(this.keyStrokeTimeout);
	      this.keyStrokeTimeout = setTimeout(() => {
	        (function (previousChunk) {
	          setTimeout(() => {
	            previousChunk.style.opacity = 0;
	            setTimeout(() => {
	              previousChunk.parentNode.removeChild(previousChunk);
	            }, options.fadeDuration);
	          }, options.lingerDelay);
	        })(this.currentChunk);
	        this.currentChunk = null;
	      }, options.keyStrokeDelay);
	    }
	    enable(options) {
	      this.cleanUp();
	      this.options = Object.assign({}, DEFAULT_OPTIONS, options || this.options);
	      this.injectComponents();
	      window.addEventListener('keydown', this.keydown);
	      window.addEventListener('keyup', this.keyup);
	    }
	    disable() {
	      this.cleanUp();
	    }
	  }
	  var index = new KeystrokeVisualizer();

	  return index;

	})));
	});

	class InputHelpers {
	  initKeys() {
	    keystrokeVisualizer.enable({unmodifiedKey: false});
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
	      }, 2000); // @fix to make it work on FxR
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi8uLi9jYW52YXMtaG9vay9mYWtlLXdlYmdsLmpzIiwiLi4vLi4vY2FudmFzLWhvb2svaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvaW5jcmVtZW50YWwtc3RhdHMtbGl0ZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1zdGF0cy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi9hbGVhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcjEyOC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3J3b3cuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yc2hpZnQ3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcjQwOTYuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvdHljaGVpLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vc2VlZHJhbmRvbS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3N0cmljdC11cmktZW5jb2RlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2RlY29kZS11cmktY29tcG9uZW50L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NwbGl0LW9uLWZpcnN0L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3F1ZXJ5LXN0cmluZy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlY29yZGVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lucHV0LWV2ZW50cy1yZWNvcmRlci9zcmMvcmVwbGF5ZXIuanMiLCIuLi9zcmMvY2xpZW50L2V2ZW50LWxpc3RlbmVycy5qcyIsIi4uL25vZGVfbW9kdWxlcy9rZXlzdHJva2UtdmlzdWFsaXplci9idWlsZC9rZXlzdHJva2UtdmlzdWFsaXplci5qcyIsIi4uL3NyYy9jbGllbnQvaW5wdXQtaGVscGVycy5qcyIsIi4uL3NyYy9jbGllbnQvd2ViYXVkaW8taG9vay5qcyIsIi4uL3NyYy9jbGllbnQvd2VidnItaG9vay5qcyIsIi4uL3NyYy9jbGllbnQvaW1hZ2UtdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvcGl4ZWxtYXRjaC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJnbC1zdGF0cy9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUmVhbERhdGUgPSBEYXRlO1xuXG5jbGFzcyBNb2NrRGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLnQgPSB0O1xuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBzdGF0aWMgcmVhbE5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lem9uZU9mZnNldCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHRvVGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXREYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXREYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldEZ1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0U2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VGltZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0WWVhcigpIHsgcmV0dXJuIDA7IH1cblxuICBzdGF0aWMgVVRDKCkgeyByZXR1cm4gMDsgfVxuXG4gIGdldFVUQ0RhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0RheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0hvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuXG4gIHNldERhdGUoKSB7fVxuICBzZXRGdWxsWWVhcigpIHt9XG4gIHNldEhvdXJzKCkge31cbiAgc2V0TWlsbGlzZWNvbmRzKCkge31cbiAgc2V0TWludXRlcygpIHt9XG4gIHNldE1vbnRoKCkge31cbiAgc2V0U2Vjb25kcygpIHt9XG4gIHNldFRpbWUoKSB7fVxuXG4gIHNldFVUQ0RhdGUoKSB7fVxuICBzZXRVVENGdWxsWWVhcigpIHt9XG4gIHNldFVUQ0hvdXJzKCkge31cbiAgc2V0VVRDTWlsbGlzZWNvbmRzKCkge31cbiAgc2V0VVRDTWludXRlcygpIHt9XG4gIHNldFVUQ01vbnRoKCkge31cblxuICBzZXRZZWFyKCkge31cbn1cblxudmFyIHJlYWxQZXJmb3JtYW5jZTtcblxuaWYgKCFwZXJmb3JtYW5jZS5yZWFsTm93KSB7XG4gIHZhciBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc1NhZmFyaSkge1xuICAgIHJlYWxQZXJmb3JtYW5jZSA9IHBlcmZvcm1hbmNlO1xuICAgIHBlcmZvcm1hbmNlID0ge1xuICAgICAgcmVhbE5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH0sXG4gICAgICBub3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtYW5jZS5yZWFsTm93ID0gcGVyZm9ybWFuY2Uubm93O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGltZVNjYWxlOiAxLjAsXG4gIGZha2VkVGltZTogMCxcbiAgZW5hYmxlZDogZmFsc2UsXG4gIHJlZnJlc2hSYXRlOiA2MCxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMubmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyKSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VsZi5mYWtlZFRpbWUgKiAxMDAwLjAgKiBzZWxmLnRpbWVTY2FsZSAvIHNlbGYucmVmcmVzaFJhdGU7IH1cbiAgICB9XG5cbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuXG4gICAgRGF0ZSA9IFJlYWxEYXRlO1xuICAgIHBlcmZvcm1hbmNlLm5vdyA9IHJlYWxQZXJmb3JtYW5jZS5ub3c7XG5cbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufSIsImNvbnN0IG9yaWdpbmFsID0gWydnZXRQYXJhbWV0ZXInLCAnZ2V0RXh0ZW5zaW9uJywgJ2dldFNoYWRlclByZWNpc2lvbkZvcm1hdCddO1xuY29uc3QgZW1wdHlTdHJpbmcgPSBbJ2dldFNoYWRlckluZm9Mb2cnLCAnZ2V0UHJvZ3JhbUluZm9Mb2cnXTtcbmNvbnN0IHJldHVybjEgPSBbJ2lzQnVmZmVyJywgJ2lzRW5hYmxlZCcsICdpc0ZyYW1lYnVmZmVyJywgJ2lzUHJvZ3JhbScsICdpc1F1ZXJ5JywgJ2lzVmVydGV4QXJyYXknLCAnaXNTYW1wbGVyJywgJ2lzU3luYycsICdpc1RyYW5zZm9ybUZlZWRiYWNrJyxcbidpc1JlbmRlcmJ1ZmZlcicsICdpc1NoYWRlcicsICdpc1RleHR1cmUnLCAndmFsaWRhdGVQcm9ncmFtJywgJ2dldFNoYWRlclBhcmFtZXRlcicsICdnZXRQcm9ncmFtUGFyYW1ldGVyJ107XG5jb25zdCByZXR1cm4wID0gWydpc0NvbnRleHRMb3N0JywgJ2ZpbmlzaCcsICdmbHVzaCcsICdnZXRFcnJvcicsICdlbmRUcmFuc2Zvcm1GZWVkYmFjaycsICdwYXVzZVRyYW5zZm9ybUZlZWRiYWNrJywgJ3Jlc3VtZVRyYW5zZm9ybUZlZWRiYWNrJyxcbidhY3RpdmVUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb24nLCAnY2xlYXInLCAnY2xlYXJEZXB0aCcsICdjbGVhclN0ZW5jaWwnLCAnY29tcGlsZVNoYWRlcicsICdjdWxsRmFjZScsICdkZWxldGVCdWZmZXInLFxuJ2RlbGV0ZUZyYW1lYnVmZmVyJywgJ2RlbGV0ZVByb2dyYW0nLCAnZGVsZXRlUmVuZGVyYnVmZmVyJywgJ2RlbGV0ZVNoYWRlcicsICdkZWxldGVUZXh0dXJlJywgJ2RlcHRoRnVuYycsICdkZXB0aE1hc2snLCAnZGlzYWJsZScsICdkaXNhYmxlVmVydGV4QXR0cmliQXJyYXknLFxuJ2VuYWJsZScsICdlbmFibGVWZXJ0ZXhBdHRyaWJBcnJheScsICdmcm9udEZhY2UnLCAnZ2VuZXJhdGVNaXBtYXAnLCAnbGluZVdpZHRoJywgJ2xpbmtQcm9ncmFtJywgJ3N0ZW5jaWxNYXNrJywgJ3VzZVByb2dyYW0nLCAnZGVsZXRlUXVlcnknLCAnZGVsZXRlVmVydGV4QXJyYXknLFxuJ2JpbmRWZXJ0ZXhBcnJheScsICdkcmF3QnVmZmVycycsICdyZWFkQnVmZmVyJywgJ2VuZFF1ZXJ5JywgJ2RlbGV0ZVNhbXBsZXInLCAnZGVsZXRlU3luYycsICdkZWxldGVUcmFuc2Zvcm1GZWVkYmFjaycsICdiZWdpblRyYW5zZm9ybUZlZWRiYWNrJyxcbidhdHRhY2hTaGFkZXInLCAnYmluZEJ1ZmZlcicsICdiaW5kRnJhbWVidWZmZXInLCAnYmluZFJlbmRlcmJ1ZmZlcicsICdiaW5kVGV4dHVyZScsICdibGVuZEVxdWF0aW9uU2VwYXJhdGUnLCAnYmxlbmRGdW5jJywgJ2RlcHRoUmFuZ2UnLCAnZGV0YWNoU2hhZGVyJywgJ2hpbnQnLFxuJ3BpeGVsU3RvcmVpJywgJ3BvbHlnb25PZmZzZXQnLCAnc2FtcGxlQ292ZXJhZ2UnLCAnc2hhZGVyU291cmNlJywgJ3N0ZW5jaWxNYXNrU2VwYXJhdGUnLCAndW5pZm9ybTFmJywgJ3VuaWZvcm0xZnYnLCAndW5pZm9ybTFpJywgJ3VuaWZvcm0xaXYnLFxuJ3VuaWZvcm0yZnYnLCAndW5pZm9ybTJpdicsICd1bmlmb3JtM2Z2JywgJ3VuaWZvcm0zaXYnLCAndW5pZm9ybTRmdicsICd1bmlmb3JtNGl2JywgJ3ZlcnRleEF0dHJpYjFmJywgJ3ZlcnRleEF0dHJpYjFmdicsICd2ZXJ0ZXhBdHRyaWIyZnYnLCAndmVydGV4QXR0cmliM2Z2Jyxcbid2ZXJ0ZXhBdHRyaWI0ZnYnLCAndmVydGV4QXR0cmliRGl2aXNvcicsICdiZWdpblF1ZXJ5JywgJ2ludmFsaWRhdGVGcmFtZWJ1ZmZlcicsICd1bmlmb3JtMXVpJywgJ3VuaWZvcm0xdWl2JywgJ3VuaWZvcm0ydWl2JywgJ3VuaWZvcm0zdWl2JywgJ3VuaWZvcm00dWl2Jyxcbid2ZXJ0ZXhBdHRyaWJJNGl2JywgJ3ZlcnRleEF0dHJpYkk0dWl2JywgJ2JpbmRTYW1wbGVyJywgJ2ZlbmNlU3luYycsICdiaW5kVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2JpbmRBdHRyaWJMb2NhdGlvbicsICdidWZmZXJEYXRhJywgJ2J1ZmZlclN1YkRhdGEnLCAnZHJhd0FycmF5cycsICdzdGVuY2lsRnVuYycsICdzdGVuY2lsT3AnLCAndGV4UGFyYW1ldGVyZicsICd0ZXhQYXJhbWV0ZXJpJywgJ3VuaWZvcm0yZicsICd1bmlmb3JtMmknLFxuJ3VuaWZvcm1NYXRyaXgyZnYnLCAndW5pZm9ybU1hdHJpeDNmdicsICd1bmlmb3JtTWF0cml4NGZ2JywgJ3ZlcnRleEF0dHJpYjJmJywgJ3VuaWZvcm0ydWknLCAndW5pZm9ybU1hdHJpeDJ4M2Z2JywgJ3VuaWZvcm1NYXRyaXgzeDJmdicsXG4ndW5pZm9ybU1hdHJpeDJ4NGZ2JywgJ3VuaWZvcm1NYXRyaXg0eDJmdicsICd1bmlmb3JtTWF0cml4M3g0ZnYnLCAndW5pZm9ybU1hdHJpeDR4M2Z2JywgJ2NsZWFyQnVmZmVyaXYnLCAnY2xlYXJCdWZmZXJ1aXYnLCAnY2xlYXJCdWZmZXJmdicsICdzYW1wbGVyUGFyYW1ldGVyaScsXG4nc2FtcGxlclBhcmFtZXRlcmYnLCAnY2xpZW50V2FpdFN5bmMnLCAnd2FpdFN5bmMnLCAndHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5ncycsICdiaW5kQnVmZmVyQmFzZScsICd1bmlmb3JtQmxvY2tCaW5kaW5nJyxcbidibGVuZENvbG9yJywgJ2JsZW5kRnVuY1NlcGFyYXRlJywgJ2NsZWFyQ29sb3InLCAnY29sb3JNYXNrJywgJ2RyYXdFbGVtZW50cycsICdmcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcicsICdyZW5kZXJidWZmZXJTdG9yYWdlJywgJ3NjaXNzb3InLCAnc3RlbmNpbEZ1bmNTZXBhcmF0ZScsXG4nc3RlbmNpbE9wU2VwYXJhdGUnLCAndW5pZm9ybTNmJywgJ3VuaWZvcm0zaScsICd2ZXJ0ZXhBdHRyaWIzZicsICd2aWV3cG9ydCcsICdkcmF3QXJyYXlzSW5zdGFuY2VkJywgJ3VuaWZvcm0zdWknLCAnY2xlYXJCdWZmZXJmaScsXG4nZnJhbWVidWZmZXJUZXh0dXJlMkQnLCAndW5pZm9ybTRmJywgJ3VuaWZvcm00aScsICd2ZXJ0ZXhBdHRyaWI0ZicsICdkcmF3RWxlbWVudHNJbnN0YW5jZWQnLCAnY29weUJ1ZmZlclN1YkRhdGEnLCAnZnJhbWVidWZmZXJUZXh0dXJlTGF5ZXInLFxuJ3JlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZScsICd0ZXhTdG9yYWdlMkQnLCAndW5pZm9ybTR1aScsICd2ZXJ0ZXhBdHRyaWJJNGknLCAndmVydGV4QXR0cmliSTR1aScsICd2ZXJ0ZXhBdHRyaWJJUG9pbnRlcicsICdiaW5kQnVmZmVyUmFuZ2UnLFxuJ3RleEltYWdlMkQnLCAndmVydGV4QXR0cmliUG9pbnRlcicsICdpbnZhbGlkYXRlU3ViRnJhbWVidWZmZXInLCAndGV4U3RvcmFnZTNEJywgJ2RyYXdSYW5nZUVsZW1lbnRzJyxcbidjb21wcmVzc2VkVGV4SW1hZ2UyRCcsICdyZWFkUGl4ZWxzJywgJ3RleFN1YkltYWdlMkQnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlMkQnLCAnY29weVRleEltYWdlMkQnLCAnY29weVRleFN1YkltYWdlMkQnLCAnY29tcHJlc3NlZFRleEltYWdlM0QnLFxuJ2NvcHlUZXhTdWJJbWFnZTNEJywgJ2JsaXRGcmFtZWJ1ZmZlcicsICd0ZXhJbWFnZTNEJywgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTNEJywgJ3RleFN1YkltYWdlM0QnXTtcbmNvbnN0IG51bGxzID0gW107XG5cbi8vIGdsLklOVCA9IDUxMjRcbmNvbnN0IGN1c3RvbUZ1bmN0aW9ucyA9IHtcblx0Z2V0QWN0aXZlVW5pZm9ybTogKCkgPT4geyByZXR1cm4ge25hbWU6IFwiXCIsIHNpemU6IDEsIHR5cGU6IDUxMjR9OyB9LFxuXHRnZXRBY3RpdmVBdHRyaWI6ICgpID0+IHsgcmV0dXJuIHtuYW1lOiBcIlwiLCBzaXplOiAxLCB0eXBlOiA1MTI0fTsgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZha2VXZWJHTChnbCkge1xuXHR0aGlzLmdsID0gZ2w7XG5cdGZvciAodmFyIGtleSBpbiBnbCkge1xuXHRcdGlmICh0eXBlb2YgZ2xba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0aWYgKG9yaWdpbmFsLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZ2xba2V5XS5iaW5kKGdsKTtcblx0XHRcdH0gZWxzZSBpZiAobnVsbHMuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiBudWxsO307XG5cdFx0XHR9IGVsc2UgaWYgKHJldHVybjAuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAwO307XG5cdFx0XHR9IGVsc2UgaWYgKHJldHVybjEuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAxO307XG5cdFx0XHR9IGVsc2UgaWYgKGVtcHR5U3RyaW5nLmluZGV4T2Yoa2V5KSAhPT0gLTEpIHtcblx0XHRcdFx0dGhpc1trZXldID0gZnVuY3Rpb24oKXtyZXR1cm4gJyc7fTtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGN1c3RvbUZ1bmN0aW9uc1trZXldICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBjdXN0b21GdW5jdGlvbnNba2V5XS5iaW5kKGdsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7fTtcblx0XHRcdFx0dGhpc1trZXldID0gZ2xba2V5XS5iaW5kKGdsKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpc1trZXldID0gZ2xba2V5XTtcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCBGYWtlV2ViR0wgZnJvbSAnLi9mYWtlLXdlYmdsJztcblxudmFyIG9yaWdpbmFsR2V0Q29udGV4dCA9IEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0O1xuaWYgKCFIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdykge1xuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xufVxuXG52YXIgZW5hYmxlZCA9IGZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHdlYmdsQ29udGV4dHM6IFtdLFxuICBlbmFibGU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgaWYgKGVuYWJsZWQpIHtyZXR1cm47fVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3R4ID0gb3JpZ2luYWxHZXRDb250ZXh0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKGN0eCBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyaW5nQ29udGV4dCkgfHwgKHdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0ICYmIChjdHggaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSkpIHtcbiAgICAgICAgc2VsZi53ZWJnbENvbnRleHRzLnB1c2goY3R4KTtcbiAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggJiYgb3B0aW9ucy5oZWlnaHQpIHtcbiAgICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuICAgICAgICAgIHRoaXMuc3R5bGUuY3NzVGV4dCA9ICd3aWR0aDogJyArIG9wdGlvbnMud2lkdGggKyAncHg7IGhlaWdodDogJyArIG9wdGlvbnMuaGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLmZha2VXZWJHTCkge1xuICAgICAgICAgIGN0eCA9IG5ldyBGYWtlV2ViR0woY3R4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGN0eDsgICAgXG4gICAgfVxuICAgIGVuYWJsZWQgPSB0cnVlOyAgXG4gIH0sXG5cbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghZW5hYmxlZCkge3JldHVybjt9XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBvcmlnaW5hbEdldENvbnRleHQ7XG4gICAgZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmU3RhdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm4gPSAwO1xuICAgIHRoaXMubWluID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLm1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLm1lYW4gPSAwO1xuICAgIHRoaXMucSA9IDA7XG4gIH1cblxuICBnZXQgdmFyaWFuY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucSAvIHRoaXMubjtcbiAgfVxuXG4gIGdldCBzdGFuZGFyZF9kZXZpYXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnEgLyB0aGlzLm4pO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAvLyBTb3JyeSwgbm8gTmFOc1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm4rKztcbiAgICB0aGlzLm1pbiA9IE1hdGgubWluKHRoaXMubWluLCBudW0pO1xuICAgIHRoaXMubWF4ID0gTWF0aC5tYXgodGhpcy5tYXgsIG51bSk7XG4gICAgdGhpcy5zdW0gKz0gbnVtO1xuICAgIGNvbnN0IHByZXZNZWFuID0gdGhpcy5tZWFuO1xuICAgIHRoaXMubWVhbiA9IHRoaXMubWVhbiArIChudW0gLSB0aGlzLm1lYW4pIC8gdGhpcy5uO1xuICAgIHRoaXMucSA9IHRoaXMucSArIChudW0gLSBwcmV2TWVhbikgKiAobnVtIC0gdGhpcy5tZWFuKTtcbiAgfVxuXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbjogdGhpcy5uLFxuICAgICAgbWluOiB0aGlzLm1pbixcbiAgICAgIG1heDogdGhpcy5tYXgsXG4gICAgICBzdW06IHRoaXMuc3VtLFxuICAgICAgbWVhbjogdGhpcy5tZWFuLFxuICAgICAgdmFyaWFuY2U6IHRoaXMudmFyaWFuY2UsXG4gICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgfTtcbiAgfSAgXG59XG4iLCJpbXBvcnQgU3RhdHMgZnJvbSAnaW5jcmVtZW50YWwtc3RhdHMtbGl0ZSc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVEVTVFNUQVRTXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgZmlyc3RGcmFtZSA9IHRydWU7XG4gIHZhciBmaXJzdEZwcyA9IHRydWU7XG5cbiAgdmFyIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IDA7XG4gIHZhciBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgdmFyIGxhc3RVcGRhdGVUaW1lID0gbnVsbDtcblxuICAvLyBVc2VkIHRvIGRldGVjdCByZWN1cnNpdmUgZW50cmllcyB0byB0aGUgbWFpbiBsb29wLCB3aGljaCBjYW4gaGFwcGVuIGluIGNlcnRhaW4gY29tcGxleCBjYXNlcywgZS5nLiBpZiBub3QgdXNpbmcgckFGIHRvIHRpY2sgcmVuZGVyaW5nIHRvIHRoZSBjYW52YXMuXG4gIHZhciBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPSAwO1xuXG4gIHJldHVybiB7XG4gICAgZ2V0U3RhdHNTdW1tYXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnN0YXRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0ge1xuICAgICAgICAgIG1pbjogdGhpcy5zdGF0c1trZXldLm1pbixcbiAgICAgICAgICBtYXg6IHRoaXMuc3RhdHNba2V5XS5tYXgsXG4gICAgICAgICAgYXZnOiB0aGlzLnN0YXRzW2tleV0ubWVhbixcbiAgICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhdHNba2V5XS5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzdGF0czoge1xuICAgICAgZnBzOiBuZXcgU3RhdHMoKSxcbiAgICAgIGR0OiBuZXcgU3RhdHMoKSxcbiAgICAgIGNwdTogbmV3IFN0YXRzKCkgICAgICAgIFxuICAgIH0sXG5cbiAgICBudW1GcmFtZXM6IDAsXG4gICAgbG9nOiBmYWxzZSxcbiAgICB0b3RhbFRpbWVJbk1haW5Mb29wOiAwLFxuICAgIHRvdGFsVGltZU91dHNpZGVNYWluTG9vcDogMCxcbiAgICBmcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWw6IDIwMCwgLy8gbXNlY3NcblxuICAgIGZyYW1lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyKys7XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID09IDEpIFxuICAgICAge1xuICAgICAgICBpZiAobGFzdFVwZGF0ZVRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0cygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVTdGF0czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICAgICAgdGhpcy5udW1GcmFtZXMrKztcblxuICAgICAgaWYgKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSA+IHRoaXMuZnBzQ291bnRlclVwZGF0ZUludGVydmFsKVxuICAgICAge1xuICAgICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXMgKiAxMDAwIC8gKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSk7XG4gICAgICAgIHRoaXMubnVtRnJhbWVzID0gMDtcbiAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSB0aW1lTm93O1xuXG4gICAgICAgIGlmIChmaXJzdEZwcylcbiAgICAgICAge1xuICAgICAgICAgIGZpcnN0RnBzID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0cy5mcHMudXBkYXRlKGZwcyk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGZwcyAtIG1pbjogJHt0aGlzLnN0YXRzLmZwcy5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5mcHMubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmZwcy5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5mcHMuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYG1zICAtIG1pbjogJHt0aGlzLnN0YXRzLmR0Lm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmR0Lm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5kdC5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5kdC5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgY3B1IC0gbWluOiAke3RoaXMuc3RhdHMuY3B1Lm1pbi50b0ZpeGVkKDIpfSUgLyBhdmc6ICR7dGhpcy5zdGF0cy5jcHUubWVhbi50b0ZpeGVkKDIpfSUgLyBtYXg6ICR7dGhpcy5zdGF0cy5jcHUubWF4LnRvRml4ZWQoMil9JSAtIHN0ZDogJHt0aGlzLnN0YXRzLmNwdS5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX0lYCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpOyAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2FsbGVkIGluIHRoZSBlbmQgb2YgZWFjaCBtYWluIGxvb3AgZnJhbWUgdGljay5cbiAgICBmcmFtZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXItLTtcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgIT0gMCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIHZhciBjcHVNYWluTG9vcER1cmF0aW9uID0gdGltZU5vdyAtIGN1cnJlbnRGcmFtZVN0YXJ0VGltZTtcbiAgICAgIHZhciBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgPSB0aW1lTm93IC0gcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gICAgICBwcmV2aW91c0ZyYW1lRW5kVGltZSA9IHRpbWVOb3c7XG4gIFxuICAgICAgaWYgKGZpcnN0RnJhbWUpIHtcbiAgICAgICAgZmlyc3RGcmFtZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG90YWxUaW1lSW5NYWluTG9vcCArPSBjcHVNYWluTG9vcER1cmF0aW9uO1xuICAgICAgdGhpcy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKz0gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzIC0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcblxuICAgICAgdmFyIGNwdSA9IGNwdU1haW5Mb29wRHVyYXRpb24gKiAxMDAgLyBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXM7XG4gICAgICB0aGlzLnN0YXRzLmNwdS51cGRhdGUoY3B1KTtcbiAgICAgIHRoaXMuc3RhdHMuZHQudXBkYXRlKGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyk7XG4gICAgfVxuICB9XG59OyIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vLyBcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vIFxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cblxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBBbGVhKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgbWFzaCA9IE1hc2goKTtcblxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAyMDkxNjM5ICogbWUuczAgKyBtZS5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICBtZS5zMCA9IG1lLnMxO1xuICAgIG1lLnMxID0gbWUuczI7XG4gICAgcmV0dXJuIG1lLnMyID0gdCAtIChtZS5jID0gdCB8IDApO1xuICB9O1xuXG4gIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgbWUuYyA9IDE7XG4gIG1lLnMwID0gbWFzaCgnICcpO1xuICBtZS5zMSA9IG1hc2goJyAnKTtcbiAgbWUuczIgPSBtYXNoKCcgJyk7XG4gIG1lLnMwIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMCA8IDApIHsgbWUuczAgKz0gMTsgfVxuICBtZS5zMSAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczEgPCAwKSB7IG1lLnMxICs9IDE7IH1cbiAgbWUuczIgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMyIDwgMCkgeyBtZS5zMiArPSAxOyB9XG4gIG1hc2ggPSBudWxsO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5jID0gZi5jO1xuICB0LnMwID0gZi5zMDtcbiAgdC5zMSA9IGYuczE7XG4gIHQuczIgPSBmLnMyO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBBbGVhKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0geGcubmV4dDtcbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSAqIDB4MTAwMDAwMDAwKSB8IDA7IH1cbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcHJuZygpICsgKHBybmcoKSAqIDB4MjAwMDAwIHwgMCkgKiAxLjExMDIyMzAyNDYyNTE1NjVlLTE2OyAvLyAyXi01M1xuICB9O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuZnVuY3Rpb24gTWFzaCgpIHtcbiAgdmFyIG4gPSAweGVmYzgyNDlkO1xuXG4gIHZhciBtYXNoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH07XG5cbiAgcmV0dXJuIG1hc2g7XG59XG5cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5hbGVhID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3IxMjhcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gbWUueCBeIChtZS54IDw8IDExKTtcbiAgICBtZS54ID0gbWUueTtcbiAgICBtZS55ID0gbWUuejtcbiAgICBtZS56ID0gbWUudztcbiAgICByZXR1cm4gbWUudyBePSAobWUudyA+Pj4gMTkpIF4gdCBeICh0ID4+PiA4KTtcbiAgfTtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjEyOCA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yd293XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IChtZS54IF4gKG1lLnggPj4+IDIpKTtcbiAgICBtZS54ID0gbWUueTsgbWUueSA9IG1lLno7IG1lLnogPSBtZS53OyBtZS53ID0gbWUudjtcbiAgICByZXR1cm4gKG1lLmQgPSAobWUuZCArIDM2MjQzNyB8IDApKSArXG4gICAgICAgKG1lLnYgPSAobWUudiBeIChtZS52IDw8IDQpKSBeICh0IF4gKHQgPDwgMSkpKSB8IDA7XG4gIH07XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG4gIG1lLnYgPSAwO1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBpZiAoayA9PSBzdHJzZWVkLmxlbmd0aCkge1xuICAgICAgbWUuZCA9IG1lLnggPDwgMTAgXiBtZS54ID4+PiA0O1xuICAgIH1cbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgdC52ID0gZi52O1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcndvdyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yc2hpZnQ3XCIgYWxnb3JpdGhtIGJ5XG4vLyBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjpcbi8vIFwiT24gdGhlIFhvcmdzaGlmdCBSYW5kb20gTnVtYmVyIEdlbmVyYXRvcnNcIlxuLy8gaHR0cDovL3NhbHVjLmVuZ3IudWNvbm4uZWR1L3JlZnMvY3J5cHRvL3JuZy9wYW5uZXRvbjA1b250aGV4b3JzaGlmdC5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdmFyIFggPSBtZS54LCBpID0gbWUuaSwgdCwgdiwgdztcbiAgICB0ID0gWFtpXTsgdCBePSAodCA+Pj4gNyk7IHYgPSB0IF4gKHQgPDwgMjQpO1xuICAgIHQgPSBYWyhpICsgMSkgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDEwKTtcbiAgICB0ID0gWFsoaSArIDMpICYgN107IHYgXj0gdCBeICh0ID4+PiAzKTtcbiAgICB0ID0gWFsoaSArIDQpICYgN107IHYgXj0gdCBeICh0IDw8IDcpO1xuICAgIHQgPSBYWyhpICsgNykgJiA3XTsgdCA9IHQgXiAodCA8PCAxMyk7IHYgXj0gdCBeICh0IDw8IDkpO1xuICAgIFhbaV0gPSB2O1xuICAgIG1lLmkgPSAoaSArIDEpICYgNztcbiAgICByZXR1cm4gdjtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIGosIHcsIFggPSBbXTtcblxuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXG4gICAgICB3ID0gWFswXSA9IHNlZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgdXNpbmcgYSBzdHJpbmcuXG4gICAgICBzZWVkID0gJycgKyBzZWVkO1xuICAgICAgZm9yIChqID0gMDsgaiA8IHNlZWQubGVuZ3RoOyArK2opIHtcbiAgICAgICAgWFtqICYgN10gPSAoWFtqICYgN10gPDwgMTUpIF5cbiAgICAgICAgICAgIChzZWVkLmNoYXJDb2RlQXQoaikgKyBYWyhqICsgMSkgJiA3XSA8PCAxMyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxuICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIFgucHVzaCgwKTtcbiAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opO1xuICAgIGlmIChqID09IDgpIHcgPSBYWzddID0gLTE7IGVsc2UgdyA9IFhbal07XG5cbiAgICBtZS54ID0gWDtcbiAgICBtZS5pID0gMDtcblxuICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxuICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xuICAgICAgbWUubmV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54LnNsaWNlKCk7XG4gIHQuaSA9IGYuaTtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLngpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3JzaGlmdDcgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiBSaWNoYXJkIEJyZW50J3MgWG9yZ2VucyB4b3I0MDk2IGFsZ29yaXRobS5cbi8vXG4vLyBUaGlzIGZhc3Qgbm9uLWNyeXB0b2dyYXBoaWMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaXMgZGVzaWduZWQgZm9yXG4vLyB1c2UgaW4gTW9udGUtQ2FybG8gYWxnb3JpdGhtcy4gSXQgY29tYmluZXMgYSBsb25nLXBlcmlvZCB4b3JzaGlmdFxuLy8gZ2VuZXJhdG9yIHdpdGggYSBXZXlsIGdlbmVyYXRvciwgYW5kIGl0IHBhc3NlcyBhbGwgY29tbW9uIGJhdHRlcmllc1xuLy8gb2Ygc3Rhc3RpY2lhbCB0ZXN0cyBmb3IgcmFuZG9tbmVzcyB3aGlsZSBjb25zdW1pbmcgb25seSBhIGZldyBuYW5vc2Vjb25kc1xuLy8gZm9yIGVhY2ggcHJuZyBnZW5lcmF0ZWQuICBGb3IgYmFja2dyb3VuZCBvbiB0aGUgZ2VuZXJhdG9yLCBzZWUgQnJlbnQnc1xuLy8gcGFwZXI6IFwiU29tZSBsb25nLXBlcmlvZCByYW5kb20gbnVtYmVyIGdlbmVyYXRvcnMgdXNpbmcgc2hpZnRzIGFuZCB4b3JzLlwiXG4vLyBodHRwOi8vYXJ4aXYub3JnL3BkZi8xMDA0LjMxMTV2MS5wZGZcbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgeG9yNDA5NiA9IHJlcXVpcmUoJ3hvcjQwOTYnKTtcbi8vIHJhbmRvbSA9IHhvcjQwOTYoMSk7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VlZCB3aXRoIGludDMyIG9yIHN0cmluZy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20oKSwgMC4xNTIwNDM2NDUwNTM4NTQ3KTsgLy8gKDAsIDEpIHJhbmdlLCA1MyBiaXRzLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbS5pbnQzMigpLCAxODA2NTM0ODk3KTsgICAvLyBzaWduZWQgaW50MzIsIDMyIGJpdHMuXG4vL1xuLy8gRm9yIG5vbnplcm8gbnVtZXJpYyBrZXlzLCB0aGlzIGltcGVsZW1lbnRhdGlvbiBwcm92aWRlcyBhIHNlcXVlbmNlXG4vLyBpZGVudGljYWwgdG8gdGhhdCBieSBCcmVudCdzIHhvcmdlbnMgMyBpbXBsZW1lbnRhaW9uIGluIEMuICBUaGlzXG4vLyBpbXBsZW1lbnRhdGlvbiBhbHNvIHByb3ZpZGVzIGZvciBpbml0YWxpemluZyB0aGUgZ2VuZXJhdG9yIHdpdGhcbi8vIHN0cmluZyBzZWVkcywgb3IgZm9yIHNhdmluZyBhbmQgcmVzdG9yaW5nIHRoZSBzdGF0ZSBvZiB0aGUgZ2VuZXJhdG9yLlxuLy9cbi8vIE9uIENocm9tZSwgdGhpcyBwcm5nIGJlbmNobWFya3MgYWJvdXQgMi4xIHRpbWVzIHNsb3dlciB0aGFuXG4vLyBKYXZhc2NyaXB0J3MgYnVpbHQtaW4gTWF0aC5yYW5kb20oKS5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHcgPSBtZS53LFxuICAgICAgICBYID0gbWUuWCwgaSA9IG1lLmksIHQsIHY7XG4gICAgLy8gVXBkYXRlIFdleWwgZ2VuZXJhdG9yLlxuICAgIG1lLncgPSB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgIHYgXj0gdiA8PCAxMztcbiAgICB0IF49IHQgPDwgMTc7XG4gICAgdiBePSB2ID4+PiAxNTtcbiAgICB0IF49IHQgPj4+IDEyO1xuICAgIC8vIFVwZGF0ZSBYb3IgZ2VuZXJhdG9yIGFycmF5IHN0YXRlLlxuICAgIHYgPSBYW2ldID0gdiBeIHQ7XG4gICAgbWUuaSA9IGk7XG4gICAgLy8gUmVzdWx0IGlzIHRoZSBjb21iaW5hdGlvbi5cbiAgICByZXR1cm4gKHYgKyAodyBeICh3ID4+PiAxNikpKSB8IDA7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciB0LCB2LCBpLCBqLCB3LCBYID0gW10sIGxpbWl0ID0gMTI4O1xuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBOdW1lcmljIHNlZWRzIGluaXRpYWxpemUgdiwgd2hpY2ggaXMgdXNlZCB0byBnZW5lcmF0ZXMgWC5cbiAgICAgIHYgPSBzZWVkO1xuICAgICAgc2VlZCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0cmluZyBzZWVkcyBhcmUgbWl4ZWQgaW50byB2IGFuZCBYIG9uZSBjaGFyYWN0ZXIgYXQgYSB0aW1lLlxuICAgICAgc2VlZCA9IHNlZWQgKyAnXFwwJztcbiAgICAgIHYgPSAwO1xuICAgICAgbGltaXQgPSBNYXRoLm1heChsaW1pdCwgc2VlZC5sZW5ndGgpO1xuICAgIH1cbiAgICAvLyBJbml0aWFsaXplIGNpcmN1bGFyIGFycmF5IGFuZCB3ZXlsIHZhbHVlLlxuICAgIGZvciAoaSA9IDAsIGogPSAtMzI7IGogPCBsaW1pdDsgKytqKSB7XG4gICAgICAvLyBQdXQgdGhlIHVuaWNvZGUgY2hhcmFjdGVycyBpbnRvIHRoZSBhcnJheSwgYW5kIHNodWZmbGUgdGhlbS5cbiAgICAgIGlmIChzZWVkKSB2IF49IHNlZWQuY2hhckNvZGVBdCgoaiArIDMyKSAlIHNlZWQubGVuZ3RoKTtcbiAgICAgIC8vIEFmdGVyIDMyIHNodWZmbGVzLCB0YWtlIHYgYXMgdGhlIHN0YXJ0aW5nIHcgdmFsdWUuXG4gICAgICBpZiAoaiA9PT0gMCkgdyA9IHY7XG4gICAgICB2IF49IHYgPDwgMTA7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdiBePSB2IDw8IDQ7XG4gICAgICB2IF49IHYgPj4+IDEzO1xuICAgICAgaWYgKGogPj0gMCkge1xuICAgICAgICB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7ICAgICAvLyBXZXlsLlxuICAgICAgICB0ID0gKFhbaiAmIDEyN10gXj0gKHYgKyB3KSk7ICAvLyBDb21iaW5lIHhvciBhbmQgd2V5bCB0byBpbml0IGFycmF5LlxuICAgICAgICBpID0gKDAgPT0gdCkgPyBpICsgMSA6IDA7ICAgICAvLyBDb3VudCB6ZXJvZXMuXG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIGhhdmUgZGV0ZWN0ZWQgYWxsIHplcm9lczsgbWFrZSB0aGUga2V5IG5vbnplcm8uXG4gICAgaWYgKGkgPj0gMTI4KSB7XG4gICAgICBYWyhzZWVkICYmIHNlZWQubGVuZ3RoIHx8IDApICYgMTI3XSA9IC0xO1xuICAgIH1cbiAgICAvLyBSdW4gdGhlIGdlbmVyYXRvciA1MTIgdGltZXMgdG8gZnVydGhlciBtaXggdGhlIHN0YXRlIGJlZm9yZSB1c2luZyBpdC5cbiAgICAvLyBGYWN0b3JpbmcgdGhpcyBhcyBhIGZ1bmN0aW9uIHNsb3dzIHRoZSBtYWluIGdlbmVyYXRvciwgc28gaXQgaXMganVzdFxuICAgIC8vIHVucm9sbGVkIGhlcmUuICBUaGUgd2V5bCBnZW5lcmF0b3IgaXMgbm90IGFkdmFuY2VkIHdoaWxlIHdhcm1pbmcgdXAuXG4gICAgaSA9IDEyNztcbiAgICBmb3IgKGogPSA0ICogMTI4OyBqID4gMDsgLS1qKSB7XG4gICAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICAgIHYgXj0gdiA8PCAxMztcbiAgICAgIHQgXj0gdCA8PCAxNztcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB0IF49IHQgPj4+IDEyO1xuICAgICAgWFtpXSA9IHYgXiB0O1xuICAgIH1cbiAgICAvLyBTdG9yaW5nIHN0YXRlIGFzIG9iamVjdCBtZW1iZXJzIGlzIGZhc3RlciB0aGFuIHVzaW5nIGNsb3N1cmUgdmFyaWFibGVzLlxuICAgIG1lLncgPSB3O1xuICAgIG1lLlggPSBYO1xuICAgIG1lLmkgPSBpO1xuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQudyA9IGYudztcbiAgdC5YID0gZi5YLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuWCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjQwOTYgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2luZG93IG9iamVjdCBvciBnbG9iYWxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwiVHljaGUtaVwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8uXG4vLyBTZWUgaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZCwgYSA9IG1lLmE7XG4gICAgYiA9IChiIDw8IDI1KSBeIChiID4+PiA3KSBeIGM7XG4gICAgYyA9IChjIC0gZCkgfCAwO1xuICAgIGQgPSAoZCA8PCAyNCkgXiAoZCA+Pj4gOCkgXiBhO1xuICAgIGEgPSAoYSAtIGIpIHwgMDtcbiAgICBtZS5iID0gYiA9IChiIDw8IDIwKSBeIChiID4+PiAxMikgXiBjO1xuICAgIG1lLmMgPSBjID0gKGMgLSBkKSB8IDA7XG4gICAgbWUuZCA9IChkIDw8IDE2KSBeIChjID4+PiAxNikgXiBhO1xuICAgIHJldHVybiBtZS5hID0gKGEgLSBiKSB8IDA7XG4gIH07XG5cbiAgLyogVGhlIGZvbGxvd2luZyBpcyBub24taW52ZXJ0ZWQgdHljaGUsIHdoaWNoIGhhcyBiZXR0ZXIgaW50ZXJuYWxcbiAgICogYml0IGRpZmZ1c2lvbiwgYnV0IHdoaWNoIGlzIGFib3V0IDI1JSBzbG93ZXIgdGhhbiB0eWNoZS1pIGluIEpTLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEgPSBtZS5hLCBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kO1xuICAgIGEgPSAobWUuYSArIG1lLmIgfCAwKSA+Pj4gMDtcbiAgICBkID0gbWUuZCBeIGE7IGQgPSBkIDw8IDE2IF4gZCA+Pj4gMTY7XG4gICAgYyA9IG1lLmMgKyBkIHwgMDtcbiAgICBiID0gbWUuYiBeIGM7IGIgPSBiIDw8IDEyIF4gZCA+Pj4gMjA7XG4gICAgbWUuYSA9IGEgPSBhICsgYiB8IDA7XG4gICAgZCA9IGQgXiBhOyBtZS5kID0gZCA9IGQgPDwgOCBeIGQgPj4+IDI0O1xuICAgIG1lLmMgPSBjID0gYyArIGQgfCAwO1xuICAgIGIgPSBiIF4gYztcbiAgICByZXR1cm4gbWUuYiA9IChiIDw8IDcgXiBiID4+PiAyNSk7XG4gIH1cbiAgKi9cblxuICBtZS5hID0gMDtcbiAgbWUuYiA9IDA7XG4gIG1lLmMgPSAyNjU0NDM1NzY5IHwgMDtcbiAgbWUuZCA9IDEzNjcxMzA1NTE7XG5cbiAgaWYgKHNlZWQgPT09IE1hdGguZmxvb3Ioc2VlZCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUuYSA9IChzZWVkIC8gMHgxMDAwMDAwMDApIHwgMDtcbiAgICBtZS5iID0gc2VlZCB8IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyAyMDsgaysrKSB7XG4gICAgbWUuYiBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5hID0gZi5hO1xuICB0LmIgPSBmLmI7XG4gIHQuYyA9IGYuYztcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMudHljaGVpID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvKlxuQ29weXJpZ2h0IDIwMTQgRGF2aWQgQmF1LlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbklOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG5DTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcblNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG4oZnVuY3Rpb24gKHBvb2wsIG1hdGgpIHtcbi8vXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXG4vL1xuXG4vLyBEZXRlY3QgdGhlIGdsb2JhbCBvYmplY3QsIGV2ZW4gaWYgb3BlcmF0aW5nIGluIHN0cmljdCBtb2RlLlxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQzODcwNTcvMjY1Mjk4XG52YXIgZ2xvYmFsID0gKDAsIGV2YWwpKCd0aGlzJyksXG4gICAgd2lkdGggPSAyNTYsICAgICAgICAvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XG4gICAgY2h1bmtzID0gNiwgICAgICAgICAvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXG4gICAgZGlnaXRzID0gNTIsICAgICAgICAvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXG4gICAgcm5nbmFtZSA9ICdyYW5kb20nLCAvLyBybmduYW1lOiBuYW1lIGZvciBNYXRoLnJhbmRvbSBhbmQgTWF0aC5zZWVkcmFuZG9tXG4gICAgc3RhcnRkZW5vbSA9IG1hdGgucG93KHdpZHRoLCBjaHVua3MpLFxuICAgIHNpZ25pZmljYW5jZSA9IG1hdGgucG93KDIsIGRpZ2l0cyksXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxuICAgIG1hc2sgPSB3aWR0aCAtIDEsXG4gICAgbm9kZWNyeXB0bzsgICAgICAgICAvLyBub2RlLmpzIGNyeXB0byBtb2R1bGUsIGluaXRpYWxpemVkIGF0IHRoZSBib3R0b20uXG5cbi8vXG4vLyBzZWVkcmFuZG9tKClcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxuLy9cbmZ1bmN0aW9uIHNlZWRyYW5kb20oc2VlZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdmFyIGtleSA9IFtdO1xuICBvcHRpb25zID0gKG9wdGlvbnMgPT0gdHJ1ZSkgPyB7IGVudHJvcHk6IHRydWUgfSA6IChvcHRpb25zIHx8IHt9KTtcblxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxuICAgIG9wdGlvbnMuZW50cm9weSA/IFtzZWVkLCB0b3N0cmluZyhwb29sKV0gOlxuICAgIChzZWVkID09IG51bGwpID8gYXV0b3NlZWQoKSA6IHNlZWQsIDMpLCBrZXkpO1xuXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XG5cbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxuICB2YXIgcHJuZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cbiAgICB9XG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBtYXRoIHVudGlsXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cbiAgICB9XG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXG4gIH07XG5cbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIHwgMDsgfVxuICBwcm5nLnF1aWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgLyAweDEwMDAwMDAwMDsgfVxuICBwcm5nLmRvdWJsZSA9IHBybmc7XG5cbiAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xuXG4gIC8vIENhbGxpbmcgY29udmVudGlvbjogd2hhdCB0byByZXR1cm4gYXMgYSBmdW5jdGlvbiBvZiBwcm5nLCBzZWVkLCBpc19tYXRoLlxuICByZXR1cm4gKG9wdGlvbnMucGFzcyB8fCBjYWxsYmFjayB8fFxuICAgICAgZnVuY3Rpb24ocHJuZywgc2VlZCwgaXNfbWF0aF9jYWxsLCBzdGF0ZSkge1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAvLyBMb2FkIHRoZSBhcmM0IHN0YXRlIGZyb20gdGhlIGdpdmVuIHN0YXRlIGlmIGl0IGhhcyBhbiBTIGFycmF5LlxuICAgICAgICAgIGlmIChzdGF0ZS5TKSB7IGNvcHkoc3RhdGUsIGFyYzQpOyB9XG4gICAgICAgICAgLy8gT25seSBwcm92aWRlIHRoZSAuc3RhdGUgbWV0aG9kIGlmIHJlcXVlc3RlZCB2aWEgb3B0aW9ucy5zdGF0ZS5cbiAgICAgICAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KGFyYzQsIHt9KTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY2FsbGVkIGFzIGEgbWV0aG9kIG9mIE1hdGggKE1hdGguc2VlZHJhbmRvbSgpKSwgbXV0YXRlXG4gICAgICAgIC8vIE1hdGgucmFuZG9tIGJlY2F1c2UgdGhhdCBpcyBob3cgc2VlZHJhbmRvbS5qcyBoYXMgd29ya2VkIHNpbmNlIHYxLjAuXG4gICAgICAgIGlmIChpc19tYXRoX2NhbGwpIHsgbWF0aFtybmduYW1lXSA9IHBybmc7IHJldHVybiBzZWVkOyB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCBpcyBhIG5ld2VyIGNhbGxpbmcgY29udmVudGlvbiwgc28gcmV0dXJuIHRoZVxuICAgICAgICAvLyBwcm5nIGRpcmVjdGx5LlxuICAgICAgICBlbHNlIHJldHVybiBwcm5nO1xuICAgICAgfSkoXG4gIHBybmcsXG4gIHNob3J0c2VlZCxcbiAgJ2dsb2JhbCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuZ2xvYmFsIDogKHRoaXMgPT0gbWF0aCksXG4gIG9wdGlvbnMuc3RhdGUpO1xufVxubWF0aFsnc2VlZCcgKyBybmduYW1lXSA9IHNlZWRyYW5kb207XG5cbi8vXG4vLyBBUkM0XG4vL1xuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXG4vL1xuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cbi8vXG5mdW5jdGlvbiBBUkM0KGtleSkge1xuICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XG5cbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxuXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcbiAgICBzW2ldID0gaSsrO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcbiAgICBzW2pdID0gdDtcbiAgfVxuXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxuICAgIHZhciB0LCByID0gMCxcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcbiAgICB3aGlsZSAoY291bnQtLSkge1xuICAgICAgdCA9IHNbaSA9IG1hc2sgJiAoaSArIDEpXTtcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xuICAgIH1cbiAgICBtZS5pID0gaTsgbWUuaiA9IGo7XG4gICAgcmV0dXJuIHI7XG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5LCB0aGUgZnVuY3Rpb24gY2FsbCBiZWxvdyBhdXRvbWF0aWNhbGx5XG4gICAgLy8gZGlzY2FyZHMgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuICBUaGlzIGlzIGNhbGxlZCBSQzQtZHJvcFsyNTZdLlxuICAgIC8vIFNlZSBodHRwOi8vZ29vZ2xlLmNvbS9zZWFyY2g/cT1yc2ErZmx1aHJlcityZXNwb25zZSZidG5JXG4gIH0pKHdpZHRoKTtcbn1cblxuLy9cbi8vIGNvcHkoKVxuLy8gQ29waWVzIGludGVybmFsIHN0YXRlIG9mIEFSQzQgdG8gb3IgZnJvbSBhIHBsYWluIG9iamVjdC5cbi8vXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LmogPSBmLmo7XG4gIHQuUyA9IGYuUy5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbi8vXG4vLyBmbGF0dGVuKClcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cbi8vXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iaiksIHByb3A7XG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAnc3RyaW5nJyA/IG9iaiA6IG9iaiArICdcXDAnKTtcbn1cblxuLy9cbi8vIG1peGtleSgpXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cbi8vXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XG4gIHZhciBzdHJpbmdzZWVkID0gc2VlZCArICcnLCBzbWVhciwgaiA9IDA7XG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcbiAgICBrZXlbbWFzayAmIGpdID1cbiAgICAgIG1hc2sgJiAoKHNtZWFyIF49IGtleVttYXNrICYgal0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKSk7XG4gIH1cbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XG59XG5cbi8vXG4vLyBhdXRvc2VlZCgpXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gYW5kIE5vZGUgY3J5cHRvXG4vLyBtb2R1bGUgaWYgYXZhaWxhYmxlLlxuLy9cbmZ1bmN0aW9uIGF1dG9zZWVkKCkge1xuICB0cnkge1xuICAgIHZhciBvdXQ7XG4gICAgaWYgKG5vZGVjcnlwdG8gJiYgKG91dCA9IG5vZGVjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XG4gICAgICAvLyBUaGUgdXNlIG9mICdvdXQnIHRvIHJlbWVtYmVyIHJhbmRvbUJ5dGVzIG1ha2VzIHRpZ2h0IG1pbmlmaWVkIGNvZGUuXG4gICAgICBvdXQgPSBvdXQod2lkdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBuZXcgVWludDhBcnJheSh3aWR0aCk7XG4gICAgICAoZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG8pLmdldFJhbmRvbVZhbHVlcyhvdXQpO1xuICAgIH1cbiAgICByZXR1cm4gdG9zdHJpbmcob3V0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciBicm93c2VyID0gZ2xvYmFsLm5hdmlnYXRvcixcbiAgICAgICAgcGx1Z2lucyA9IGJyb3dzZXIgJiYgYnJvd3Nlci5wbHVnaW5zO1xuICAgIHJldHVybiBbK25ldyBEYXRlLCBnbG9iYWwsIHBsdWdpbnMsIGdsb2JhbC5zY3JlZW4sIHRvc3RyaW5nKHBvb2wpXTtcbiAgfVxufVxuXG4vL1xuLy8gdG9zdHJpbmcoKVxuLy8gQ29udmVydHMgYW4gYXJyYXkgb2YgY2hhcmNvZGVzIHRvIGEgc3RyaW5nXG4vL1xuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcbn1cblxuLy9cbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xuLy8gbm90IHdhbnQgdG8gaW50ZXJmZXJlIHdpdGggZGV0ZXJtaW5pc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIG1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcbi8vIGluaXRpYWxpemF0aW9uLlxuLy9cbm1peGtleShtYXRoLnJhbmRvbSgpLCBwb29sKTtcblxuLy9cbi8vIE5vZGVqcyBhbmQgQU1EIHN1cHBvcnQ6IGV4cG9ydCB0aGUgaW1wbGVtZW50YXRpb24gYXMgYSBtb2R1bGUgdXNpbmdcbi8vIGVpdGhlciBjb252ZW50aW9uLlxuLy9cbmlmICgodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBzZWVkcmFuZG9tO1xuICAvLyBXaGVuIGluIG5vZGUuanMsIHRyeSB1c2luZyBjcnlwdG8gcGFja2FnZSBmb3IgYXV0b3NlZWRpbmcuXG4gIHRyeSB7XG4gICAgbm9kZWNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuICB9IGNhdGNoIChleCkge31cbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBzZWVkcmFuZG9tOyB9KTtcbn1cblxuLy8gRW5kIGFub255bW91cyBzY29wZSwgYW5kIHBhc3MgaW5pdGlhbCB2YWx1ZXMuXG59KShcbiAgW10sICAgICAvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XG4gIE1hdGggICAgLy8gbWF0aDogcGFja2FnZSBjb250YWluaW5nIHJhbmRvbSwgcG93LCBhbmQgc2VlZHJhbmRvbVxuKTtcbiIsIi8vIEEgbGlicmFyeSBvZiBzZWVkYWJsZSBSTkdzIGltcGxlbWVudGVkIGluIEphdmFzY3JpcHQuXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHNlZWRyYW5kb20gPSByZXF1aXJlKCdzZWVkcmFuZG9tJyk7XG4vLyB2YXIgcmFuZG9tID0gc2VlZHJhbmRvbSgxKTsgLy8gb3IgYW55IHNlZWQuXG4vLyB2YXIgeCA9IHJhbmRvbSgpOyAgICAgICAvLyAwIDw9IHggPCAxLiAgRXZlcnkgYml0IGlzIHJhbmRvbS5cbi8vIHZhciB4ID0gcmFuZG9tLnF1aWNrKCk7IC8vIDAgPD0geCA8IDEuICAzMiBiaXRzIG9mIHJhbmRvbW5lc3MuXG5cbi8vIGFsZWEsIGEgNTMtYml0IG11bHRpcGx5LXdpdGgtY2FycnkgZ2VuZXJhdG9yIGJ5IEpvaGFubmVzIEJhYWfDuGUuXG4vLyBQZXJpb2Q6IH4yXjExNlxuLy8gUmVwb3J0ZWQgdG8gcGFzcyBhbGwgQmlnQ3J1c2ggdGVzdHMuXG52YXIgYWxlYSA9IHJlcXVpcmUoJy4vbGliL2FsZWEnKTtcblxuLy8geG9yMTI4LCBhIHB1cmUgeG9yLXNoaWZ0IGdlbmVyYXRvciBieSBHZW9yZ2UgTWFyc2FnbGlhLlxuLy8gUGVyaW9kOiAyXjEyOC0xLlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogTWF0cml4UmFuayBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3IxMjggPSByZXF1aXJlKCcuL2xpYi94b3IxMjgnKTtcblxuLy8geG9yd293LCBHZW9yZ2UgTWFyc2FnbGlhJ3MgMTYwLWJpdCB4b3Itc2hpZnQgY29tYmluZWQgcGx1cyB3ZXlsLlxuLy8gUGVyaW9kOiAyXjE5Mi0yXjMyXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBDb2xsaXNpb25PdmVyLCBTaW1wUG9rZXIsIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcndvdyA9IHJlcXVpcmUoJy4vbGliL3hvcndvdycpO1xuXG4vLyB4b3JzaGlmdDcsIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyLCB0YWtlc1xuLy8gYSBkaWZmZXJlbnQgYXBwcm9hY2g6IGl0IGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0c1xuLy8gdGhhbiBNYXJzYWdsaWEncyBvcmlnaW5hbCB0aHJlZS4gIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Jcbi8vIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxuLy8gUGVyaW9kIDJeMjU2LTEuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcnNoaWZ0NyA9IHJlcXVpcmUoJy4vbGliL3hvcnNoaWZ0NycpO1xuXG4vLyB4b3I0MDk2LCBieSBSaWNoYXJkIEJyZW50LCBpcyBhIDQwOTYtYml0IHhvci1zaGlmdCB3aXRoIGFcbi8vIHZlcnkgbG9uZyBwZXJpb2QgdGhhdCBhbHNvIGFkZHMgYSBXZXlsIGdlbmVyYXRvci4gSXQgYWxzbyBwYXNzZXNcbi8vIEJpZ0NydXNoIHdpdGggbm8gc3lzdGVtYXRpYyBmYWlsdXJlcy4gIEl0cyBsb25nIHBlcmlvZCBtYXlcbi8vIGJlIHVzZWZ1bCBpZiB5b3UgaGF2ZSBtYW55IGdlbmVyYXRvcnMgYW5kIG5lZWQgdG8gYXZvaWRcbi8vIGNvbGxpc2lvbnMuXG4vLyBQZXJpb2Q6IDJeNDEyOC0yXjMyLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3I0MDk2ID0gcmVxdWlyZSgnLi9saWIveG9yNDA5NicpO1xuXG4vLyBUeWNoZS1pLCBieSBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8sIGlzIGEgYml0LXNoaWZ0aW5nIHJhbmRvbVxuLy8gbnVtYmVyIGdlbmVyYXRvciBkZXJpdmVkIGZyb20gQ2hhQ2hhLCBhIG1vZGVybiBzdHJlYW0gY2lwaGVyLlxuLy8gaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcbi8vIFBlcmlvZDogfjJeMTI3XG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHR5Y2hlaSA9IHJlcXVpcmUoJy4vbGliL3R5Y2hlaScpO1xuXG4vLyBUaGUgb3JpZ2luYWwgQVJDNC1iYXNlZCBwcm5nIGluY2x1ZGVkIGluIHRoaXMgbGlicmFyeS5cbi8vIFBlcmlvZDogfjJeMTYwMFxudmFyIHNyID0gcmVxdWlyZSgnLi9zZWVkcmFuZG9tJyk7XG5cbnNyLmFsZWEgPSBhbGVhO1xuc3IueG9yMTI4ID0geG9yMTI4O1xuc3IueG9yd293ID0geG9yd293O1xuc3IueG9yc2hpZnQ3ID0geG9yc2hpZnQ3O1xuc3IueG9yNDA5NiA9IHhvcjQwOTY7XG5zci50eWNoZWkgPSB0eWNoZWk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3I7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHN0ciA9PiBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC9bIScoKSpdL2csIHggPT4gYCUke3guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX1gKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB0b2tlbiA9ICclW2EtZjAtOV17Mn0nO1xudmFyIHNpbmdsZU1hdGNoZXIgPSBuZXcgUmVnRXhwKHRva2VuLCAnZ2knKTtcbnZhciBtdWx0aU1hdGNoZXIgPSBuZXcgUmVnRXhwKCcoJyArIHRva2VuICsgJykrJywgJ2dpJyk7XG5cbmZ1bmN0aW9uIGRlY29kZUNvbXBvbmVudHMoY29tcG9uZW50cywgc3BsaXQpIHtcblx0dHJ5IHtcblx0XHQvLyBUcnkgdG8gZGVjb2RlIHRoZSBlbnRpcmUgc3RyaW5nIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb21wb25lbnRzLmpvaW4oJycpKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRG8gbm90aGluZ1xuXHR9XG5cblx0aWYgKGNvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIGNvbXBvbmVudHM7XG5cdH1cblxuXHRzcGxpdCA9IHNwbGl0IHx8IDE7XG5cblx0Ly8gU3BsaXQgdGhlIGFycmF5IGluIDIgcGFydHNcblx0dmFyIGxlZnQgPSBjb21wb25lbnRzLnNsaWNlKDAsIHNwbGl0KTtcblx0dmFyIHJpZ2h0ID0gY29tcG9uZW50cy5zbGljZShzcGxpdCk7XG5cblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuY2FsbChbXSwgZGVjb2RlQ29tcG9uZW50cyhsZWZ0KSwgZGVjb2RlQ29tcG9uZW50cyhyaWdodCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0dmFyIHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlucHV0ID0gZGVjb2RlQ29tcG9uZW50cyh0b2tlbnMsIGkpLmpvaW4oJycpO1xuXG5cdFx0XHR0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KSB7XG5cdC8vIEtlZXAgdHJhY2sgb2YgYWxsIHRoZSByZXBsYWNlbWVudHMgYW5kIHByZWZpbGwgdGhlIG1hcCB3aXRoIHRoZSBgQk9NYFxuXHR2YXIgcmVwbGFjZU1hcCA9IHtcblx0XHQnJUZFJUZGJzogJ1xcdUZGRkRcXHVGRkZEJyxcblx0XHQnJUZGJUZFJzogJ1xcdUZGRkRcXHVGRkZEJ1xuXHR9O1xuXG5cdHZhciBtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0d2hpbGUgKG1hdGNoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIERlY29kZSBhcyBiaWcgY2h1bmtzIGFzIHBvc3NpYmxlXG5cdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVjb2RlKG1hdGNoWzBdKTtcblxuXHRcdFx0aWYgKHJlc3VsdCAhPT0gbWF0Y2hbMF0pIHtcblx0XHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdH1cblxuXHQvLyBBZGQgYCVDMmAgYXQgdGhlIGVuZCBvZiB0aGUgbWFwIHRvIG1ha2Ugc3VyZSBpdCBkb2VzIG5vdCByZXBsYWNlIHRoZSBjb21iaW5hdG9yIGJlZm9yZSBldmVyeXRoaW5nIGVsc2Vcblx0cmVwbGFjZU1hcFsnJUMyJ10gPSAnXFx1RkZGRCc7XG5cblx0dmFyIGVudHJpZXMgPSBPYmplY3Qua2V5cyhyZXBsYWNlTWFwKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBSZXBsYWNlIGFsbCBkZWNvZGVkIGNvbXBvbmVudHNcblx0XHR2YXIga2V5ID0gZW50cmllc1tpXTtcblx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cChrZXksICdnJyksIHJlcGxhY2VNYXBba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVuY29kZWRVUkkpIHtcblx0aWYgKHR5cGVvZiBlbmNvZGVkVVJJICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGBlbmNvZGVkVVJJYCB0byBiZSBvZiB0eXBlIGBzdHJpbmdgLCBnb3QgYCcgKyB0eXBlb2YgZW5jb2RlZFVSSSArICdgJyk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGVuY29kZWRVUkkgPSBlbmNvZGVkVVJJLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuXG5cdFx0Ly8gVHJ5IHRoZSBidWlsdCBpbiBkZWNvZGVyIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRmFsbGJhY2sgdG8gYSBtb3JlIGFkdmFuY2VkIGRlY29kZXJcblx0XHRyZXR1cm4gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcsIHNlcGFyYXRvcikgPT4ge1xuXHRpZiAoISh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygc2VwYXJhdG9yID09PSAnc3RyaW5nJykpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCB0aGUgYXJndW1lbnRzIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AnKTtcblx0fVxuXG5cdGlmIChzZXBhcmF0b3IgPT09ICcnKSB7XG5cdFx0cmV0dXJuIFtzdHJpbmddO1xuXHR9XG5cblx0Y29uc3Qgc2VwYXJhdG9ySW5kZXggPSBzdHJpbmcuaW5kZXhPZihzZXBhcmF0b3IpO1xuXG5cdGlmIChzZXBhcmF0b3JJbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gW3N0cmluZ107XG5cdH1cblxuXHRyZXR1cm4gW1xuXHRcdHN0cmluZy5zbGljZSgwLCBzZXBhcmF0b3JJbmRleCksXG5cdFx0c3RyaW5nLnNsaWNlKHNlcGFyYXRvckluZGV4ICsgc2VwYXJhdG9yLmxlbmd0aClcblx0XTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcbmNvbnN0IHNwbGl0T25GaXJzdCA9IHJlcXVpcmUoJ3NwbGl0LW9uLWZpcnN0Jyk7XG5cbmZ1bmN0aW9uIGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUpID0+IHtcblx0XHRcdFx0Y29uc3QgaW5kZXggPSByZXN1bHQubGVuZ3RoO1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnWycsIGluZGV4LCAnXSddLmpvaW4oJycpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0Li4ucmVzdWx0LFxuXHRcdFx0XHRcdFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1snLCBlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLCAnXT0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKVxuXHRcdFx0XHRdO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW10nXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnW109JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2NvbW1hJzpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUsIGluZGV4KSA9PiB7XG5cdFx0XHRcdGlmICghdmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGluZGV4ID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtbZW5jb2RlKGtleSwgb3B0aW9ucyksICc9JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFtbcmVzdWx0LCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcsJyldO1xuXHRcdFx0fTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4ga2V5ID0+IChyZXN1bHQsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBbLi4ucmVzdWx0LCBlbmNvZGUoa2V5LCBvcHRpb25zKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgW2VuY29kZShrZXksIG9wdGlvbnMpLCAnPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucykge1xuXHRsZXQgcmVzdWx0O1xuXG5cdHN3aXRjaCAob3B0aW9ucy5hcnJheUZvcm1hdCkge1xuXHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gL1xcWyhcXGQqKVxcXSQvLmV4ZWMoa2V5KTtcblxuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxkKlxcXSQvLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFyZXN1bHQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB7fTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFjY3VtdWxhdG9yW2tleV1bcmVzdWx0WzFdXSA9IHZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdjb21tYSc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGlzQXJyYXkgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnNwbGl0KCcnKS5pbmRleE9mKCcsJykgPiAtMTtcblx0XHRcdFx0Y29uc3QgbmV3VmFsdWUgPSBpc0FycmF5ID8gdmFsdWUuc3BsaXQoJywnKSA6IHZhbHVlO1xuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gbmV3VmFsdWU7XG5cdFx0XHR9O1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdHJldHVybiBpbnB1dC5zbGljZShxdWVyeVN0YXJ0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRkZWNvZGU6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9LCBvcHRpb25zKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHQvLyBDcmVhdGUgYW4gb2JqZWN0IHdpdGggbm8gcHJvdG90eXBlXG5cdGNvbnN0IHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0aWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0aW5wdXQgPSBpbnB1dC50cmltKCkucmVwbGFjZSgvXls/IyZdLywgJycpO1xuXG5cdGlmICghaW5wdXQpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwYXJhbSBvZiBpbnB1dC5zcGxpdCgnJicpKSB7XG5cdFx0bGV0IFtrZXksIHZhbHVlXSA9IHNwbGl0T25GaXJzdChwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKSwgJz0nKTtcblxuXHRcdC8vIE1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG5cdFx0Ly8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuXHRcdHZhbHVlID0gdmFsdWUgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iamVjdCwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIW9iamVjdCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZSdcblx0fSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ICE9PSBmYWxzZSkge1xuXHRcdGtleXMuc29ydChvcHRpb25zLnNvcnQpO1xuXHR9XG5cblx0cmV0dXJuIGtleXMubWFwKGtleSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSBvYmplY3Rba2V5XTtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gJyc7XG5cdFx0fVxuXG5cdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRyZXR1cm4gdmFsdWVcblx0XHRcdFx0LnJlZHVjZShmb3JtYXR0ZXIoa2V5KSwgW10pXG5cdFx0XHRcdC5qb2luKCcmJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpICsgJz0nICsgZW5jb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0fSkuZmlsdGVyKHggPT4geC5sZW5ndGggPiAwKS5qb2luKCcmJyk7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGhhc2hTdGFydCA9IGlucHV0LmluZGV4T2YoJyMnKTtcblx0aWYgKGhhc2hTdGFydCAhPT0gLTEpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGhhc2hTdGFydCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHVybDogaW5wdXQuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuIiwiLy8gTWFwcyBtb3VzZSBjb29yZGluYXRlIGZyb20gZWxlbWVudCBDU1MgcGl4ZWxzIHRvIG5vcm1hbGl6ZWQgWyAwLCAxIF0gcmFuZ2UuXG5mdW5jdGlvbiBjb21wdXRlTm9ybWFsaXplZFBvcyhlbGVtZW50LCBldnQpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICB2YXIgeSA9IGV2dC5jbGllbnRZIC0gcmVjdC50b3A7XG4gIHggLz0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgeSAvPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgcmV0dXJuIFt4LCB5XTtcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0UmVjb3JkZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fMKge307XG4gIH1cblxuICBlbmFibGUoZm9yY2VSZXNldCkge1xuICAgIHRoaXMuaW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoZm9yY2VSZXNldCkge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICB0aGlzLmluamVjdExpc3RlbmVycygpO1xuICB9XG4vKlxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKCk7XG4gIH1cbiovXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5mcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIGFkZEV2ZW50KHR5cGUsIGV2ZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgIHR5cGUsXG4gICAgICBldmVudCxcbiAgICAgIHBhcmFtZXRlcnNcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VUaW1lKSB7XG4gICAgICBldmVudERhdGEudGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5pbml0VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnREYXRhLmZyYW1lTnVtYmVyID0gdGhpcy5mcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50RGF0YSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9wdGlvbnMubmV3RXZlbnRDYWxsYmFjayhldmVudERhdGEpO1xuICAgIH1cbiAgfVxuICBcbiAgaW5qZWN0TGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ2Rvd24nLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAndXAnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICdtb3ZlJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcblxuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnd2hlZWwnLCB7XG4gICAgICAgIGRlbHRhWDogZXZ0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBldnQuZGVsdGFZLFxuICAgICAgICBkZWx0YVo6IGV2dC5kZWx0YVosXG4gICAgICAgIGRlbHRhTW9kZTogZXZ0LmRlbHRhTW9kZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICdkb3duJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICd1cCcsIHtcbiAgICAgICAga2V5Q29kZTogZXZ0LmtleUNvZGUsXG4gICAgICAgIGNoYXJDb2RlOiBldnQuY2hhckNvZGUsXG4gICAgICAgIGtleTogZXZ0LmtleVxuICAgICAgfSk7XG4gICAgfSk7ICBcbiAgfVxufSIsIlxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgbmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHM6IGZhbHNlXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBJbnB1dFJlcGxheWVyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgcmVjb3JkaW5nLCByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5yZWNvcmRpbmcgPSByZWNvcmRpbmc7XG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzOyAvLyBJZiA9PT0gbnVsbCAtPiBEaXNwYXRjaCB0byBET01cbiAgfVxuXG4gIHRpY2sgKGZyYW1lTnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucmVjb3JkaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPiBmcmFtZU51bWJlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucmVjb3JkaW5nLmxlbmd0aCAmJiB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPT09IGZyYW1lTnVtYmVyKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICAgIHN3aXRjaCAoaW5wdXQudHlwZSkge1xuICAgICAgICBjYXNlICdtb3VzZSc6IHtcbiAgICAgICAgICBpZiAoaW5wdXQuZXZlbnQgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVXaGVlbEV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGNhc2UgJ2tleSc6IHtcbiAgICAgICAgICB0aGlzLnNpbXVsYXRlS2V5RXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC50eXBlICsgaW5wdXQuZXZlbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1N0aWxsIG5vdCBpbXBsZW1lbnRlZCBldmVudCcsIGlucHV0LnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRJbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHNpbXVsYXRlV2hlZWxFdmVudChlbGVtZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGUgPSBuZXcgRXZlbnQoJ21vdXNld2hlZWwnLCB7YnViYmxlczogdHJ1ZX0pO1xuXG4gICAgY29uc3QgZXZlbnRUeXBlID0gJ21vdXNld2hlZWwnO1xuICAgIGUuZGVsdGFYID0gcGFyYW1ldGVycy5kZWx0YVg7XG4gICAgZS5kZWx0YVkgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcbiAgICBlLmRlbHRhWiA9IHBhcmFtZXRlcnMuZGVsdGFaO1xuXG4gICAgZS53aGVlbERlbHRhWCA9IHBhcmFtZXRlcnMuZGVsdGFYO1xuICAgIGUud2hlZWxEZWx0YVkgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcbiAgICBlLndoZWVsRGVsdGEgPSBwYXJhbWV0ZXJzLmRlbHRhWTtcblxuICAgIGUuZGVsdGFNb2RlID0gcGFyYW1ldGVycy5kZWx0YU1vZGU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkge1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH1cbiAgfVxuXG4gIHNpbXVsYXRlS2V5RXZlbnQoZWxlbWVudCwgZXZlbnRUeXBlLCBwYXJhbWV0ZXJzKSB7XG4gICAgLy8gRG9uJ3QgdXNlIHRoZSBLZXlib2FyZEV2ZW50IG9iamVjdCBiZWNhdXNlIG9mIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODk0MjY3OC9rZXlib2FyZGV2ZW50LWluLWNocm9tZS1rZXljb2RlLWlzLTAvMTI1MjI3NTIjMTI1MjI3NTJcbiAgICAvLyBTZWUgYWxzbyBodHRwOi8vb3V0cHV0LmpzYmluLmNvbS9hd2VuYXEvM1xuICAgIC8vICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0tleWJvYXJkRXZlbnQnKTtcbiAgICAvLyAgICBpZiAoZS5pbml0S2V5RXZlbnQpIHtcbiAgICAvLyAgICAgIGUuaW5pdEtleUV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwga2V5Q29kZSwgY2hhckNvZGUpO1xuICAgIC8vICB9IGVsc2Uge1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgaWYgKGUuaW5pdEV2ZW50KSB7XG4gICAgICBlLmluaXRFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUpO1xuICAgIH1cblxuICAgIGUua2V5Q29kZSA9IHBhcmFtZXRlcnMua2V5Q29kZTtcbiAgICBlLndoaWNoID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUuY2hhckNvZGUgPSBwYXJhbWV0ZXJzLmNoYXJDb2RlO1xuICAgIGUucHJvZ3JhbW1hdGljID0gdHJ1ZTtcbiAgICBlLmtleSA9IHBhcmFtZXRlcnMua2V5O1xuXG4gICAgLy8gRGlzcGF0Y2ggZGlyZWN0bHkgdG8gRW1zY3JpcHRlbidzIGh0bWw1LmggQVBJOlxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hLZXlFdmVudHNWaWFET00pIHtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdGhpc18gPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5jb250ZXh0O1xuICAgICAgICB2YXIgdHlwZSA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLnR5cGU7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmZ1bjtcbiAgICAgICAgaWYgKHR5cGUgPT0gZXZlbnRUeXBlKSBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGlzcGF0Y2ggdG8gYnJvd3NlciBmb3IgcmVhbFxuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50ID8gZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpIDogZWxlbWVudC5maXJlRXZlbnQoXCJvblwiICsgZXZlbnRUeXBlLCBlKTtcbiAgICB9XG4gIH1cblxuICAvLyBldmVudFR5cGU6IFwibW91c2Vtb3ZlXCIsIFwibW91c2Vkb3duXCIgb3IgXCJtb3VzZXVwXCIuXG4gIC8vIHggYW5kIHk6IE5vcm1hbGl6ZWQgY29vcmRpbmF0ZSBpbiB0aGUgcmFuZ2UgWzAsMV0gd2hlcmUgdG8gaW5qZWN0IHRoZSBldmVudC5cbiAgc2ltdWxhdGVNb3VzZUV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgcGFyYW1ldGVycykge1xuICAgIC8vIFJlbWFwIGZyb20gWzAsMV0gdG8gY2FudmFzIENTUyBwaXhlbCBzaXplLlxuICAgIHZhciB4ID0gcGFyYW1ldGVycy54O1xuICAgIHZhciB5ID0gcGFyYW1ldGVycy55O1xuXG4gICAgeCAqPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIHkgKj0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gT2Zmc2V0IHRoZSBpbmplY3RlZCBjb29yZGluYXRlIGZyb20gdG9wLWxlZnQgb2YgdGhlIGNsaWVudCBhcmVhIHRvIHRoZSB0b3AtbGVmdCBvZiB0aGUgY2FudmFzLlxuICAgIHggPSBNYXRoLnJvdW5kKHJlY3QubGVmdCArIHgpO1xuICAgIHkgPSBNYXRoLnJvdW5kKHJlY3QudG9wICsgeSk7XG4gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRzXCIpO1xuICAgIGUuaW5pdE1vdXNlRXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZSA9PSAnbW91c2Vtb3ZlJyA/IDAgOiAxLCB4LCB5LCB4LCB5LFxuICAgICAgICAgICAgICAgICAgICAwLCAwLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLmJ1dHRvbiwgbnVsbCk7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKSB7XG4gICAgICAvLyBQcm9ncmFtbWF0aWNhbGx5IHJlYXRpbmcgRE9NIGV2ZW50cyBkb2Vzbid0IGFsbG93IHNwZWNpZnlpbmcgb2Zmc2V0WCAmIG9mZnNldFkgcHJvcGVybHlcbiAgICAgIC8vIGZvciB0aGUgZWxlbWVudCwgYnV0IHRoZXkgbXVzdCBiZSB0aGUgc2FtZSBhcyBjbGllbnRYICYgY2xpZW50WS4gVGhlcmVmb3JlIHdlIGNhbid0IGhhdmUgYVxuICAgICAgLy8gYm9yZGVyIHRoYXQgd291bGQgbWFrZSB0aGVzZSBkaWZmZXJlbnQuXG4gICAgICBpZiAoZWxlbWVudC5jbGllbnRXaWR0aCAhPSBlbGVtZW50Lm9mZnNldFdpZHRoXG4gICAgICAgIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICAgIHRocm93IFwiRVJST1IhIENhbnZhcyBvYmplY3QgbXVzdCBoYXZlIDBweCBib3JkZXIgZm9yIGRpcmVjdCBtb3VzZSBkaXNwYXRjaCB0byB3b3JrIVwiO1xuICAgICAgfVxuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJZiBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcyBpcyBzZXQsIHRoZSBwYWdlIG5lZWRzIGEgZnVsbCBzZXQgb2YgYXR0cmlidXRlc1xuICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBuZXcgY3VzdG9tIG9iamVjdCAod2l0aG91dCBwcm90b3R5cGUgY2hhaW4pIHRvIGhvbGQgdGhlIG92ZXJyaWRkZW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBldnQgPSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBzcmNFbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0b0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICBldmVudFBoYXNlOiAyLCAvLyBFdmVudC5BVF9UQVJHRVRcbiAgICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgICAgYnV0dG9uOiBlLmJ1dHRvbixcbiAgICAgICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgICBjYW5jZWxCdWJibGU6IGUuY2FuY2VsQnViYmxlLFxuICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBlLmNhbmNlbGFibGUsXG4gICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZLFxuICAgICAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLmRldGFpbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogZS5pZGVudGlmaWVyLFxuICAgICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgICBsYXllclg6IGUubGF5ZXJYLFxuICAgICAgICAgICAgICBsYXllclk6IGUubGF5ZXJZLFxuICAgICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICAgIG1vdmVtZW50WDogZS5tb3ZlbWVudFgsXG4gICAgICAgICAgICAgIG1vdmVtZW50WTogZS5tb3ZlbWVudFksXG4gICAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogZS5vZmZzZXRZLFxuICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICAgIHBhdGg6IGUucGF0aCxcbiAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZS5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgICAgc2NyZWVuWDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICBzY3JlZW5ZOiBlLnNjcmVlblksXG4gICAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgICBzb3VyY2VDYXBhYmlsaXRpZXM6IGUuc291cmNlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICB0aW1lU3RhbXA6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICAgIHZpZXc6IGUudmlldyxcbiAgICAgICAgICAgICAgd2hpY2g6IGUud2hpY2gsXG4gICAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgICAgeTogZS55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHJlZ3VsYXIgJ2UnIG9iamVjdCBpcyBlbm91Z2ggKGl0IGRvZXNuJ3QgcG9wdWxhdGUgYWxsIG9mIHRoZSBzYW1lIGZpZWxkcyB0aGFuIGEgcmVhbCBtb3VzZSBldmVudCBkb2VzLCBcbiAgICAgICAgICAgIC8vIHNvIHRoaXMgbWlnaHQgbm90IHdvcmsgb24gc29tZSBkZW1vcylcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBicm93c2VyXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudExpc3RlbmVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvLyBEb24ndCBjYWxsIGFueSBhcHBsaWNhdGlvbiBwYWdlIHVubG9hZCBoYW5kbGVycyBhcyBhIHJlc3BvbnNlIHRvIHdpbmRvdyBiZWluZyBjbG9zZWQuXG4gIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKSB7XG4gICAgLy8gVGhpcyBpcyBhIGJpdCB0cmlja3kgdG8gbWFuYWdlLCBzaW5jZSB0aGUgcGFnZSBjb3VsZCByZWdpc3RlciB0aGVzZSBoYW5kbGVycyBhdCBhbnkgcG9pbnQsXG4gICAgLy8gc28ga2VlcCB3YXRjaGluZyBmb3IgdGhlbSBhbmQgcmVtb3ZlIHRoZW0gaWYgYW55IGFyZSBhZGRlZC4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAvLyBpbiBhIHNlbWktcG9sbGluZyBmYXNoaW9uIHRvIGVuc3VyZSB0aGVzZSBhcmUgbm90IG92ZXJyaWRkZW4uXG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCkgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9udW5sb2FkKSB3aW5kb3cub251bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25ibHVyKSB3aW5kb3cub25ibHVyID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uZm9jdXMpIHdpbmRvdy5vbmZvY3VzID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZWhpZGUpIHdpbmRvdy5vbnBhZ2VoaWRlID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZXNob3cpIHdpbmRvdy5vbnBhZ2VzaG93ID0gbnVsbDtcbiAgfVxuXG4gIHVubG9hZEFsbEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgZm9yKHZhciBpIGluIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXTtcbiAgICAgIGxpc3RlbmVyLmNvbnRleHQucmVtb3ZlRXZlbnRMaXN0ZW5lcihsaXN0ZW5lci50eXBlLCBsaXN0ZW5lci5mdW4sIGxpc3RlbmVyLnVzZUNhcHR1cmUpO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICBcbiAgICAvLyBNYWtlIHN1cmUgbm8gWEhScyBhcmUgYmVpbmcgaGVsZCBvbiB0byBlaXRoZXIuXG4gICAgLy9wcmVsb2FkZWRYSFJzID0ge307XG4gICAgLy9udW1QcmVsb2FkWEhSc0luRmxpZ2h0ID0gMDtcbiAgICAvL1hNTEh0dHBSZXF1ZXN0ID0gcmVhbFhNTEh0dHBSZXF1ZXN0O1xuICBcbiAgICB0aGlzLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgfVxuXG4gIC8vaWYgKGluamVjdGluZ0lucHV0U3RyZWFtKVxuICBlbmFibGUoKSB7XG5cbiAgICAvLyBGaWx0ZXIgdGhlIHBhZ2UgZXZlbnQgaGFuZGxlcnMgdG8gb25seSBwYXNzIHByb2dyYW1tYXRpY2FsbHkgZ2VuZXJhdGVkIGV2ZW50cyB0byB0aGUgc2l0ZSAtIGFsbCByZWFsIHVzZXIgaW5wdXQgbmVlZHMgdG8gYmUgZGlzY2FyZGVkIHNpbmNlIHdlIGFyZVxuICAgIC8vIGRvaW5nIGEgcHJvZ3JhbW1hdGljIHJ1bi5cbiAgICB2YXIgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcyA9IFsnbW91c2Vkb3duJywgJ21vdXNldXAnLCAnbW91c2Vtb3ZlJyxcbiAgICAgICdjbGljaycsICdkYmxjbGljaycsICdrZXlkb3duJywgJ2tleXByZXNzJywgJ2tleXVwJyxcbiAgICAgICdwb2ludGVybG9ja2NoYW5nZScsICdwb2ludGVybG9ja2Vycm9yJywgJ3dlYmtpdHBvaW50ZXJsb2NrY2hhbmdlJywgJ3dlYmtpdHBvaW50ZXJsb2NrZXJyb3InLCAnbW96cG9pbnRlcmxvY2tjaGFuZ2UnLCAnbW96cG9pbnRlcmxvY2tlcnJvcicsICdtc3BvaW50ZXJsb2NrY2hhbmdlJywgJ21zcG9pbnRlcmxvY2tlcnJvcicsICdvcG9pbnRlcmxvY2tjaGFuZ2UnLCAnb3BvaW50ZXJsb2NrZXJyb3InLFxuICAgICAgJ2RldmljZW1vdGlvbicsICdkZXZpY2VvcmllbnRhdGlvbicsXG4gICAgICAnbW91c2VlbnRlcicsICdtb3VzZWxlYXZlJyxcbiAgICAgICdtb3VzZXdoZWVsJywgJ3doZWVsJywgJ1doZWVsRXZlbnQnLCAnRE9NTW91c2VTY3JvbGwnLCAnY29udGV4dG1lbnUnLFxuICAgICAgJ2JsdXInLCAnZm9jdXMnLCAndmlzaWJpbGl0eWNoYW5nZScsICdiZWZvcmV1bmxvYWQnLCAndW5sb2FkJywgJ2Vycm9yJyxcbiAgICAgICdwYWdlaGlkZScsICdwYWdlc2hvdycsICdvcmllbnRhdGlvbmNoYW5nZScsICdnYW1lcGFkY29ubmVjdGVkJywgJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLFxuICAgICAgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJywgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCAnbW96ZnVsbHNjcmVlbmVycm9yJyxcbiAgICAgICdNU0Z1bGxzY3JlZW5DaGFuZ2UnLCAnTVNGdWxsc2NyZWVuRXJyb3InLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyxcbiAgICAgICd3ZWJnbGNvbnRleHRsb3N0JywgJ3dlYmdsY29udGV4dHJlc3RvcmVkJyxcbiAgICAgICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAncG9pbnRlcm91dCcsICdwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAndHJhbnNpdGlvbmVuZCddO1xuXG4gICAgLy8gU29tZSBnYW1lIGRlbW9zIHByb2dyYW1tYXRpY2FsbHkgZmlyZSB0aGUgcmVzaXplIGV2ZW50LiBGb3IgRmlyZWZveCBhbmQgQ2hyb21lLFxuICAgIC8vIHdlIGRldGVjdCB0aGlzIHZpYSBldmVudC5pc1RydXN0ZWQgYW5kIGtub3cgdG8gY29ycmVjdGx5IHBhc3MgaXQgdGhyb3VnaCwgYnV0IHRvIG1ha2UgU2FmYXJpIGhhcHB5LFxuICAgIC8vIGl0J3MganVzdCBlYXNpZXIgdG8gbGV0IHJlc2l6ZSBjb21lIHRocm91Z2ggZm9yIHRob3NlIGRlbW9zIHRoYXQgbmVlZCBpdC5cbiAgICAvLyBpZiAoIU1vZHVsZVsncGFnZU5lZWRzUmVzaXplRXZlbnQnXSkgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5wdXNoKCdyZXNpemUnKTtcblxuICAgIC8vIElmIGNvbnRleHQgaXMgc3BlY2lmaWVkLCBhZGRFdmVudExpc3RlbmVyIGlzIGNhbGxlZCB1c2luZyB0aGF0IGFzIHRoZSAndGhpcycgb2JqZWN0LiBPdGhlcndpc2UgdGhlIGN1cnJlbnQgdGhpcyBpcyB1c2VkLlxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSA9IGZhbHNlO1xuICAgIHZhciBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTSA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIHJlcGxhY2VFdmVudExpc3RlbmVyKG9iaiwgY29udGV4dCkge1xuICAgICAgdmFyIHJlYWxBZGRFdmVudExpc3RlbmVyID0gb2JqLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICAgIHNlbGYuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuICAgICAgICBpZiAob3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5pbmRleE9mKHR5cGUpICE9IC0xKSB7XG4gICAgICAgICAgdmFyIHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSA9XG4gICAgICAgICAgICAgICAodHlwZS5pbmRleE9mKCdtb3VzZScpID09PSAtMSB8fCBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NKVxuICAgICAgICAgICAgJiYgKHR5cGUuaW5kZXhPZigna2V5JykgPT09IC0xIHx8IGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKTtcbiAgICAgICAgICB2YXIgZmlsdGVyZWRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSkgeyB0cnkgeyBpZiAoZS5wcm9ncmFtbWF0aWMgfHwgIWUuaXNUcnVzdGVkKSBsaXN0ZW5lcihlKTsgfSBjYXRjaChlKSB7fSB9O1xuICAgICAgICAgIC8vISEhIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgICAgICBpZiAocmVnaXN0ZXJMaXN0ZW5lclRvRE9NKSByZWFsQWRkRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcyxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBmdW46IGZpbHRlcmVkRXZlbnRMaXN0ZW5lcixcbiAgICAgICAgICAgIHVzZUNhcHR1cmU6IHVzZUNhcHR1cmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWFsQWRkRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZ1bjogbGlzdGVuZXIsXG4gICAgICAgICAgICB1c2VDYXB0dXJlOiB1c2VDYXB0dXJlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHJlYWxSZW1vdmVFdmVudExpc3RlbmVyID0gb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cbiAgICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgLy8gaWYgKHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSlcbiAgICAgICAgLy9yZWFsUmVtb3ZlRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBldmVudExpc3RlbmVyID0gc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV07XG4gICAgICAgICAgaWYgKGV2ZW50TGlzdGVuZXIuY29udGV4dCA9PT0gdGhpcyAmJiBldmVudExpc3RlbmVyLnR5cGUgPT09IHR5cGUgJiYgZXZlbnRMaXN0ZW5lci5mdW4gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIEV2ZW50VGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoRXZlbnRUYXJnZXQucHJvdG90eXBlLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLypcbiAgICAgIHZhciBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IFt3aW5kb3csIGRvY3VtZW50LCBkb2N1bWVudC5ib2R5LCBNb2R1bGVbJ2NhbnZhcyddXTtcbiAgICAgIC8vIGlmIChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSkgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5jb25jYXQoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldLCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSk7XG4gICAgICB9XG4gICAgICAqL1xuICAgIH1cbiAgfSAgICBcbn0iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChnbG9iYWwuS0VZVklTID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gIGNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBmb250U2l6ZTogMTYsXG4gICAga2V5U3Ryb2tlRGVsYXk6IDIwMCxcbiAgICBsaW5nZXJEZWxheTogMTAwMCxcbiAgICBmYWRlRHVyYXRpb246IDEwMDAsXG4gICAgYmV6ZWxDb2xvcjogJyMwMDAnLFxuICAgIHRleHRDb2xvcjogJyNmZmYnLFxuICAgIHVubW9kaWZpZWRLZXk6IHRydWUsXG4gICAgc2hvd1N5bWJvbDogdHJ1ZSxcbiAgICBhcHBlbmRNb2RpZmllcnM6IHtcbiAgICAgIE1ldGE6IHRydWUsXG4gICAgICBBbHQ6IHRydWUsXG4gICAgICBTaGlmdDogZmFsc2VcbiAgICB9LFxuICAgIHBvc2l0aW9uOiAnYm90dG9tLWxlZnQnXG4gIH07XG4gIGNsYXNzIEtleXN0cm9rZVZpc3VhbGl6ZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xuICAgICAgdGhpcy5zdHlsZSA9IG51bGw7XG4gICAgICB0aGlzLmtleVN0cm9rZVRpbWVvdXQgPSBudWxsO1xuICAgICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd24uYmluZCh0aGlzKTtcbiAgICAgIHRoaXMua2V5dXAgPSB0aGlzLmtleXVwLmJpbmQodGhpcyk7XG4gICAgfVxuICAgIGNsZWFuVXAoKSB7XG4gICAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlbW92ZU5vZGUodGhpcy5jb250YWluZXIpO1xuICAgICAgcmVtb3ZlTm9kZSh0aGlzLnN0eWxlKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnN0eWxlID0gbnVsbDtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuICAgIH1cbiAgICBpbmplY3RDb21wb25lbnRzKCkge1xuICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc05hbWUgPSAna2V5c3Ryb2tlcyc7XG4gICAgICBjb25zdCBwb3NpdGlvbnMgPSB7XG4gICAgICAgICdib3R0b20tbGVmdCc6ICdib3R0b206IDA7IGxlZnQ6IDA7JyxcbiAgICAgICAgJ2JvdHRvbS1yaWdodCc6ICdib3R0b206IDA7IHJpZ2h0OiAwOycsXG4gICAgICAgICd0b3AtbGVmdCc6ICd0b3A6IDA7IGxlZnQ6IDA7JyxcbiAgICAgICAgJ3RvcC1yaWdodCc6ICd0b3A6IDA7IHJpZ2h0OiAwOydcbiAgICAgIH07XG4gICAgICBpZiAoIXBvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgSW52YWxpZCBwb3NpdGlvbiAnJHt0aGlzLm9wdGlvbnMucG9zaXRpb259JywgdXNpbmcgZGVmYXVsdCAnYm90dG9tLWxlZnQnLiBWYWxpZCBwb3NpdGlvbnM6IGAsIE9iamVjdC5rZXlzKHBvc2l0aW9ucykpO1xuICAgICAgICB0aGlzLm9wdGlvbnMucG9zaXRpb24gPSAnYm90dG9tLWxlZnQnO1xuICAgICAgfVxuICAgICAgdGhpcy5zdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICB0aGlzLnN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgIHVsLmtleXN0cm9rZXMge1xuICAgICAgICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcbiAgICAgICAgJHtwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXX1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgdWwua2V5c3Ryb2tlcyBsaSB7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBBcmlhbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHt0aGlzLm9wdGlvbnMuYmV6ZWxDb2xvcn07XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgICAgY29sb3I6ICR7dGhpcy5vcHRpb25zLnRleHRDb2xvcn07XG4gICAgICAgIHBhZGRpbmc6IDVweCAxMHB4O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiA1cHg7XG4gICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgIGZvbnQtc2l6ZTogJHt0aGlzLm9wdGlvbnMuZm9udFNpemV9cHg7XG4gICAgICAgIGRpc3BsYXk6IHRhYmxlO1xuICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgICAgdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgfWA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc3R5bGUpO1xuICAgIH1cbiAgICBjb252ZXJ0S2V5VG9TeW1ib2woa2V5KSB7XG4gICAgICBjb25zdCBjb252ZXJzaW9uQ29tbW9uID0ge1xuICAgICAgICAnQXJyb3dSaWdodCc6ICfihpInLFxuICAgICAgICAnQXJyb3dMZWZ0JzogJ+KGkCcsXG4gICAgICAgICdBcnJvd1VwJzogJ+KGkScsXG4gICAgICAgICdBcnJvd0Rvd24nOiAn4oaTJyxcbiAgICAgICAgJyAnOiAn4pCjJyxcbiAgICAgICAgJ0VudGVyJzogJ+KGqScsXG4gICAgICAgICdTaGlmdCc6ICfih6cnLFxuICAgICAgICAnU2hpZnRSaWdodCc6ICfih6cnLFxuICAgICAgICAnU2hpZnRMZWZ0JzogJ+KHpycsXG4gICAgICAgICdDb250cm9sJzogJ+KMgycsXG4gICAgICAgICdUYWInOiAn4oa5JyxcbiAgICAgICAgJ0NhcHNMb2NrJzogJ+KHqidcbiAgICAgIH07XG4gICAgICBjb25zdCBjb252ZXJzaW9uTWFjID0ge1xuICAgICAgICAnQWx0JzogJ+KMpScsXG4gICAgICAgICdBbHRMZWZ0JzogJ+KMpScsXG4gICAgICAgICdBbHRSaWdodCc6ICfijKUnLFxuICAgICAgICAnRGVsZXRlJzogJ+KMpicsXG4gICAgICAgICdFc2NhcGUnOiAn4o6LJyxcbiAgICAgICAgJ0JhY2tzcGFjZSc6ICfijKsnLFxuICAgICAgICAnTWV0YSc6ICfijJgnLFxuICAgICAgICAnVGFiJzogJ+KHpScsXG4gICAgICAgICdQYWdlRG93bic6ICfih58nLFxuICAgICAgICAnUGFnZVVwJzogJ+KHnicsXG4gICAgICAgICdIb21lJzogJ+KGlicsXG4gICAgICAgICdFbmQnOiAn4oaYJ1xuICAgICAgfTtcbiAgICAgIHJldHVybiAobmF2aWdhdG9yLnBsYXRmb3JtID09PSAnTWFjSW50ZWwnID8gY29udmVyc2lvbk1hY1trZXldIDogbnVsbCkgfHwgY29udmVyc2lvbkNvbW1vbltrZXldIHx8IGtleTtcbiAgICB9XG4gICAga2V5ZG93bihlKSB7XG4gICAgICBpZiAoIXRoaXMuY3VycmVudENodW5rKSB7XG4gICAgICAgIHRoaXMuY3VycmVudENodW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgICAgfVxuICAgICAgdmFyIGtleSA9IGUua2V5O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy51bm1vZGlmaWVkS2V5KSB7XG4gICAgICAgIGlmIChlLmNvZGUuaW5kZXhPZignS2V5JykgIT09IC0xKSB7XG4gICAgICAgICAga2V5ID0gZS5jb2RlLnJlcGxhY2UoJ0tleScsICcnKTtcbiAgICAgICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIG1vZGlmaWVyID0gJyc7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5NZXRhICYmIGUubWV0YUtleSAmJiBlLmtleSAhPT0gJ01ldGEnKSB7XG4gICAgICAgIG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdNZXRhJyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5BbHQgJiYgZS5hbHRLZXkgJiYgZS5rZXkgIT09ICdBbHQnKSB7XG4gICAgICAgIG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdBbHQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLlNoaWZ0ICYmIGUuc2hpZnRLZXkgJiYgZS5rZXkgIT09ICdTaGlmdCcpIHtcbiAgICAgICAgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ1NoaWZ0Jyk7XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRDaHVuay50ZXh0Q29udGVudCArPSBtb2RpZmllciArICh0aGlzLm9wdGlvbnMuc2hvd1N5bWJvbCA/IHRoaXMuY29udmVydEtleVRvU3ltYm9sKGtleSkgOiBrZXkpO1xuICAgIH1cbiAgICBrZXl1cChlKSB7XG4gICAgICBpZiAoIXRoaXMuY3VycmVudENodW5rKSByZXR1cm47XG4gICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmtleVN0cm9rZVRpbWVvdXQpO1xuICAgICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIChmdW5jdGlvbiAocHJldmlvdXNDaHVuaykge1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgcHJldmlvdXNDaHVuay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBwcmV2aW91c0NodW5rLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocHJldmlvdXNDaHVuayk7XG4gICAgICAgICAgICB9LCBvcHRpb25zLmZhZGVEdXJhdGlvbik7XG4gICAgICAgICAgfSwgb3B0aW9ucy5saW5nZXJEZWxheSk7XG4gICAgICAgIH0pKHRoaXMuY3VycmVudENodW5rKTtcbiAgICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgICAgfSwgb3B0aW9ucy5rZXlTdHJva2VEZWxheSk7XG4gICAgfVxuICAgIGVuYWJsZShvcHRpb25zKSB7XG4gICAgICB0aGlzLmNsZWFuVXAoKTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMpO1xuICAgICAgdGhpcy5pbmplY3RDb21wb25lbnRzKCk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgICB9XG4gICAgZGlzYWJsZSgpIHtcbiAgICAgIHRoaXMuY2xlYW5VcCgpO1xuICAgIH1cbiAgfVxuICB2YXIgaW5kZXggPSBuZXcgS2V5c3Ryb2tlVmlzdWFsaXplcigpO1xuXG4gIHJldHVybiBpbmRleDtcblxufSkpKTtcbiIsImltcG9ydCBLZXlzdHJva2VWaXN1YWxpemVyIGZyb20gJ2tleXN0cm9rZS12aXN1YWxpemVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXRIZWxwZXJzIHtcbiAgaW5pdEtleXMoKSB7XG4gICAgS2V5c3Ryb2tlVmlzdWFsaXplci5lbmFibGUoe3VubW9kaWZpZWRLZXk6IGZhbHNlfSk7XG4gIH1cblxuICBpbml0TW91c2UoKSB7XG4gICAgdGhpcy5tb3VzZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VEaXYuaWQ9J21vdXNlZGl2JztcbiAgICB0aGlzLm1vdXNlQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLm1vdXNlQ2xpY2suaWQ9J21vdXNlY2xpY2snO1xuICAgIHRoaXMubW91c2VDbGljay5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiAjZmZmO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgbGVmdDogMHB4O1xuICAgICAgdG9wOiAwcHg7XG4gICAgICBib3JkZXI6IDNweCBzb2xpZCBibGFjaztcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICBgO1xuXG4gICAgdGhpcy5tb3VzZURpdi5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybCgnL2N1cnNvci5zdmcnKTtcbiAgICAgIGJhY2tncm91bmQtcG9zaXRpb246IC04cHggLTVweDtcbiAgICAgIHotaW5kZXg6IDk5OTk7XG4gICAgYDtcbiAgICBcbiAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubW91c2VEaXYpO1xuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZUNsaWNrKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldnQpID0+IHtcbiAgICAgIHRoaXMubW91c2VEaXYuc3R5bGUubGVmdCA9IGV2dC54ICsgXCJweFwiO1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS50b3AgPSBldnQueSArIFwicHhcIjtcblxuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmxlZnQgPSBgJHtldnQueCAtIDEyfXB4YDtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS50b3AgPSBgJHtldnQueSAtIDd9cHhgO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIH0pO1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB9KTtcblxuICB9XG5cbiAgY29uc3RydWN0b3IgKGNhbnZhcywgb3B0aW9ucykge1xuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzaG93LWtleXMnKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaW5pdEtleXMoKTtcbiAgICB9XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3ctbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaW5pdE1vdXNlKCk7XG4gICAgfVxuICB9XG59IiwidmFyIENvbnRleHQgPSB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0ID8gd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCA6IHdpbmRvdy5BdWRpb0NvbnRleHQ7XG52YXIgb3JpRGVjb2RlRGF0YSA9IENvbnRleHQucHJvdG90eXBlLmRlY29kZUF1ZGlvRGF0YTtcblxudmFyIFdlYkF1ZGlvSG9vayA9IHtcbiAgc3RhdHM6IHtcbiAgICBudW1BdWRpb0J1ZmZlcnM6IDAsXG4gICAgdG90YWxEdXJhdGlvbjogMCxcbiAgICB0b3RhbExlbmd0aDogMCxcbiAgICB0b3RhbERlY29kZVRpbWU6IDBcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoZmFrZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBDb250ZXh0LnByb3RvdHlwZS5kZWNvZGVBdWRpb0RhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcmV2ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgaWYgKGZha2UpIHtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsRGVjb2RlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwcmV2O1xuICAgICAgICAgIHJlc29sdmUobmV3IEF1ZGlvQnVmZmVyKHtsZW5ndGg6IDEsIHNhbXBsZVJhdGU6IDQ0MTAwfSkpO1xuICAgICAgICAgIHNlbGYuc3RhdHMubnVtQXVkaW9CdWZmZXJzKys7XG4gICAgICAgICAgc2VsZi5zdGF0cy50b3RhbER1cmF0aW9uICs9IGF1ZGlvQnVmZmVyLmR1cmF0aW9uO1xuICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxMZW5ndGggKz0gYXVkaW9CdWZmZXIubGVuZ3RoO1xuICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcHJvbWlzZSA9IG9yaURlY29kZURhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdmFyIHJldCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwcm9taXNlLnRoZW4oYXVkaW9CdWZmZXIgPT4ge1xuICAgICAgICAgICAgc2VsZi5zdGF0cy50b3RhbERlY29kZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcHJldjtcbiAgICAgICAgICAgIHJlc29sdmUoYXVkaW9CdWZmZXIpO1xuICAgICAgICAgICAgc2VsZi5zdGF0cy5udW1BdWRpb0J1ZmZlcnMrKztcbiAgICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxEdXJhdGlvbiArPSBhdWRpb0J1ZmZlci5kdXJhdGlvbjtcbiAgICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxMZW5ndGggKz0gYXVkaW9CdWZmZXIubGVuZ3RoO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgQ29udGV4dC5wcm90b3R5cGUuZGVjb2RlQXVkaW9EYXRhID0gb3JpRGVjb2RlRGF0YTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgV2ViQXVkaW9Ib29rOyIsInZhciBXZWJWUkhvb2sgPSB7XG4gIG9yaWdpbmFsOiB7XG4gICAgZ2V0VlJEaXNwbGF5czogbnVsbCxcbiAgICBhZGRFdmVudExpc3RlbmVyOiBudWxsXG4gIH0sXG4gIGN1cnJlbnRWUkRpc3BsYXk6IG51bGwsXG4gIGF1eEZyYW1lRGF0YTogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAnVlJGcmFtZURhdGEnIGluIHdpbmRvdyApID8gbmV3IHdpbmRvdy5WUkZyYW1lRGF0YSgpIDogbnVsbCxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAobmF2aWdhdG9yLmdldFZSRGlzcGxheXMpIHtcbiAgICAgIHRoaXMuaW5pdEV2ZW50TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgb3JpZ2V0VlJEaXNwbGF5cyA9IHRoaXMub3JpZ2luYWwuZ2V0VlJEaXNwbGF5cyA9IG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzO1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG9yaWdldFZSRGlzcGxheXMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcmVzdWx0LnRoZW4oZGlzcGxheXMgPT4ge1xuICAgICAgICAgICAgdmFyIG5ld0Rpc3BsYXlzID0gW107XG4gICAgICAgICAgICBkaXNwbGF5cy5mb3JFYWNoKGRpc3BsYXkgPT4ge1xuICAgICAgICAgICAgICB2YXIgbmV3RGlzcGxheSA9IHNlbGYuaG9va1ZSRGlzcGxheShkaXNwbGF5KTtcbiAgICAgICAgICAgICAgbmV3RGlzcGxheXMucHVzaChuZXdEaXNwbGF5KTtcbiAgICAgICAgICAgICAgY2FsbGJhY2sobmV3RGlzcGxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc29sdmUobmV3RGlzcGxheXMpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge30sXG4gIGluaXRFdmVudExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3JpZ2luYWwuYWRkRXZlbnRMaXN0ZW5lciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBldmVudHNGaWx0ZXIgPSBbJ3ZyZGlzcGxheXByZXNlbnRjaGFuZ2UnLCAndnJkaXNwbGF5Y29ubmVjdCddO1xuICAgICAgaWYgKGV2ZW50c0ZpbHRlci5pbmRleE9mKGFyZ3VtZW50c1swXSkgIT09IC0xKSB7XG4gICAgICAgIHZhciBvbGRDYWxsYmFjayA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgYXJndW1lbnRzWzFdID0gZXZlbnQgPT4ge1xuICAgICAgICAgIHNlbGYuaG9va1ZSRGlzcGxheShldmVudC5kaXNwbGF5KTtcbiAgICAgICAgICBvbGRDYWxsYmFjayhldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gc2VsZi5vcmlnaW5hbC5hZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9LFxuICBob29rVlJEaXNwbGF5OiBmdW5jdGlvbiAoZGlzcGxheSkge1xuICAgIC8vIFRvZG8gbW9kaWZ5IHRoZSBWUkRpc3BsYXkgaWYgbmVlZGVkIGZvciBmcmFtZWRhdGEgYW5kIHNvIG9uXG4gICAgcmV0dXJuIGRpc3BsYXk7XG4gICAgICAvKlxuICAgIHZhciBvbGRHZXRGcmFtZURhdGEgPSBkaXNwbGF5LmdldEZyYW1lRGF0YS5iaW5kKGRpc3BsYXkpO1xuICAgIGRpc3BsYXkuZ2V0RnJhbWVEYXRhID0gZnVuY3Rpb24oZnJhbWVEYXRhKSB7XG5cbiAgICAgIG9sZEdldEZyYW1lRGF0YShmcmFtZURhdGEpO1xuICAvKlxuICAgICAgdmFyIG0gPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG4gICAgICB2YXIgeCA9IE1hdGguc2luKHBlcmZvcm1hbmNlLm5vdygpLzEwMDApO1xuICAgICAgdmFyIHkgPSBNYXRoLnNpbihwZXJmb3JtYW5jZS5ub3coKS81MDApLTEuMjtcblxuICAgICAgbS5tYWtlVHJhbnNsYXRpb24oeCx5LC0wLjUpO1xuICAgICAgdmFyIHBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcbiAgICAgIHZhciBzY2FsZSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICB2YXIgcXVhdCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG4gICAgICBtLmRlY29tcG9zZShwb3NpdGlvbixxdWF0LHNjYWxlKTtcblxuICAgICAgZnJhbWVEYXRhLnBvc2UucG9zaXRpb25bMF0gPSAtcG9zaXRpb24ueDtcbiAgICAgIGZyYW1lRGF0YS5wb3NlLnBvc2l0aW9uWzFdID0gLXBvc2l0aW9uLnk7XG4gICAgICBmcmFtZURhdGEucG9zZS5wb3NpdGlvblsyXSA9IC1wb3NpdGlvbi56O1xuXG4gICAgICBmb3IgKHZhciBpPTA7aTwzO2krKykge1xuICAgICAgICBmcmFtZURhdGEucG9zZS5vcmllbnRhdGlvbltpXSA9IDA7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGk9MDtpPDE2O2krKykge1xuICAgICAgICBmcmFtZURhdGEubGVmdFZpZXdNYXRyaXhbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgICBmcmFtZURhdGEucmlnaHRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgIH1cbiAgICAvKlxuICAgICAgZm9yICh2YXIgaT0wO2k8MTY7aSsrKSB7XG4gICAgICAgIGxlZnRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgICAgZnJhbWVEYXRhLnJpZ2h0Vmlld01hdHJpeFtpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICB9XG4gICAgICAvLyBjYW1lcmEubWF0cml4V29ybGQuZGVjb21wb3NlKCBjYW1lcmFMLnBvc2l0aW9uLCBjYW1lcmFMLnF1YXRlcm5pb24sIGNhbWVyYUwuc2NhbGUgKTtcbiAgICB9XG4gICAgKi9cbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IFdlYlZSSG9vazsiLCJmdW5jdGlvbiBuZWFyZXN0TmVpZ2hib3IgKHNyYywgZHN0KSB7XG4gIGxldCBwb3MgPSAwXG5cbiAgZm9yIChsZXQgeSA9IDA7IHkgPCBkc3QuaGVpZ2h0OyB5KyspIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRzdC53aWR0aDsgeCsrKSB7XG4gICAgICBjb25zdCBzcmNYID0gTWF0aC5mbG9vcih4ICogc3JjLndpZHRoIC8gZHN0LndpZHRoKVxuICAgICAgY29uc3Qgc3JjWSA9IE1hdGguZmxvb3IoeSAqIHNyYy5oZWlnaHQgLyBkc3QuaGVpZ2h0KVxuXG4gICAgICBsZXQgc3JjUG9zID0gKChzcmNZICogc3JjLndpZHRoKSArIHNyY1gpICogNFxuXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gUlxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEdcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBCXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gQVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplSW1hZ2VEYXRhKHNyY0ltYWdlRGF0YSwgbmV3SW1hZ2VEYXRhKSB7XG4gIG5lYXJlc3ROZWlnaGJvcihzcmNJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpeGVsbWF0Y2g7XG5cbmZ1bmN0aW9uIHBpeGVsbWF0Y2goaW1nMSwgaW1nMiwgb3V0cHV0LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gMC4xIDogb3B0aW9ucy50aHJlc2hvbGQ7XG5cbiAgICAvLyBtYXhpbXVtIGFjY2VwdGFibGUgc3F1YXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNvbG9ycztcbiAgICAvLyAzNTIxNSBpcyB0aGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZSBmb3IgdGhlIFlJUSBkaWZmZXJlbmNlIG1ldHJpY1xuICAgIHZhciBtYXhEZWx0YSA9IDM1MjE1ICogdGhyZXNob2xkICogdGhyZXNob2xkLFxuICAgICAgICBkaWZmID0gMDtcblxuICAgIC8vIGNvbXBhcmUgZWFjaCBwaXhlbCBvZiBvbmUgaW1hZ2UgYWdhaW5zdCB0aGUgb3RoZXIgb25lXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcblxuICAgICAgICAgICAgdmFyIHBvcyA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgICAgIC8vIHNxdWFyZWQgWVVWIGRpc3RhbmNlIGJldHdlZW4gY29sb3JzIGF0IHRoaXMgcGl4ZWwgcG9zaXRpb25cbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgcG9zLCBwb3MpO1xuXG4gICAgICAgICAgICAvLyB0aGUgY29sb3IgZGlmZmVyZW5jZSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiBtYXhEZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGl0J3MgYSByZWFsIHJlbmRlcmluZyBkaWZmZXJlbmNlIG9yIGp1c3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlQUEgJiYgKGFudGlhbGlhc2VkKGltZzEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFudGlhbGlhc2VkKGltZzIsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzEpKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmUgb2YgdGhlIHBpeGVscyBpcyBhbnRpLWFsaWFzaW5nOyBkcmF3IGFzIHllbGxvdyBhbmQgZG8gbm90IGNvdW50IGFzIGRpZmZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDI1NSwgMCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3VuZCBzdWJzdGFudGlhbCBkaWZmZXJlbmNlIG5vdCBjYXVzZWQgYnkgYW50aS1hbGlhc2luZzsgZHJhdyBpdCBhcyByZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaWZmKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIC8vIHBpeGVscyBhcmUgc2ltaWxhcjsgZHJhdyBiYWNrZ3JvdW5kIGFzIGdyYXlzY2FsZSBpbWFnZSBibGVuZGVkIHdpdGggd2hpdGVcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gYmxlbmQoZ3JheVBpeGVsKGltZzEsIHBvcyksIDAuMSk7XG4gICAgICAgICAgICAgICAgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCB2YWwsIHZhbCwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVudCBwaXhlbHNcbiAgICByZXR1cm4gZGlmZjtcbn1cblxuLy8gY2hlY2sgaWYgYSBwaXhlbCBpcyBsaWtlbHkgYSBwYXJ0IG9mIGFudGktYWxpYXNpbmc7XG4vLyBiYXNlZCBvbiBcIkFudGktYWxpYXNlZCBQaXhlbCBhbmQgSW50ZW5zaXR5IFNsb3BlIERldGVjdG9yXCIgcGFwZXIgYnkgVi4gVnlzbmlhdXNrYXMsIDIwMDlcblxuZnVuY3Rpb24gYW50aWFsaWFzZWQoaW1nLCB4MSwgeTEsIHdpZHRoLCBoZWlnaHQsIGltZzIpIHtcbiAgICB2YXIgeDAgPSBNYXRoLm1heCh4MSAtIDEsIDApLFxuICAgICAgICB5MCA9IE1hdGgubWF4KHkxIC0gMSwgMCksXG4gICAgICAgIHgyID0gTWF0aC5taW4oeDEgKyAxLCB3aWR0aCAtIDEpLFxuICAgICAgICB5MiA9IE1hdGgubWluKHkxICsgMSwgaGVpZ2h0IC0gMSksXG4gICAgICAgIHBvcyA9ICh5MSAqIHdpZHRoICsgeDEpICogNCxcbiAgICAgICAgemVyb2VzID0gMCxcbiAgICAgICAgcG9zaXRpdmVzID0gMCxcbiAgICAgICAgbmVnYXRpdmVzID0gMCxcbiAgICAgICAgbWluID0gMCxcbiAgICAgICAgbWF4ID0gMCxcbiAgICAgICAgbWluWCwgbWluWSwgbWF4WCwgbWF4WTtcblxuICAgIC8vIGdvIHRocm91Z2ggOCBhZGphY2VudCBwaXhlbHNcbiAgICBmb3IgKHZhciB4ID0geDA7IHggPD0geDI7IHgrKykge1xuICAgICAgICBmb3IgKHZhciB5ID0geTA7IHkgPD0geTI7IHkrKykge1xuICAgICAgICAgICAgaWYgKHggPT09IHgxICYmIHkgPT09IHkxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYnJpZ2h0bmVzcyBkZWx0YSBiZXR3ZWVuIHRoZSBjZW50ZXIgcGl4ZWwgYW5kIGFkamFjZW50IG9uZVxuICAgICAgICAgICAgdmFyIGRlbHRhID0gY29sb3JEZWx0YShpbWcsIGltZywgcG9zLCAoeSAqIHdpZHRoICsgeCkgKiA0LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY291bnQgdGhlIG51bWJlciBvZiBlcXVhbCwgZGFya2VyIGFuZCBicmlnaHRlciBhZGphY2VudCBwaXhlbHNcbiAgICAgICAgICAgIGlmIChkZWx0YSA9PT0gMCkgemVyb2VzKys7XG4gICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA8IDApIG5lZ2F0aXZlcysrO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPiAwKSBwb3NpdGl2ZXMrKztcblxuICAgICAgICAgICAgLy8gaWYgZm91bmQgbW9yZSB0aGFuIDIgZXF1YWwgc2libGluZ3MsIGl0J3MgZGVmaW5pdGVseSBub3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgaWYgKHplcm9lcyA+IDIpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcyKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGRhcmtlc3QgcGl4ZWxcbiAgICAgICAgICAgIGlmIChkZWx0YSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG1pbiA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG1pblggPSB4O1xuICAgICAgICAgICAgICAgIG1pblkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGJyaWdodGVzdCBwaXhlbFxuICAgICAgICAgICAgaWYgKGRlbHRhID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgbWF4WSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWltZzIpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGJvdGggZGFya2VyIGFuZCBicmlnaHRlciBwaXhlbHMgYW1vbmcgc2libGluZ3MsIGl0J3Mgbm90IGFudGktYWxpYXNpbmdcbiAgICBpZiAobmVnYXRpdmVzID09PSAwIHx8IHBvc2l0aXZlcyA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaWYgZWl0aGVyIHRoZSBkYXJrZXN0IG9yIHRoZSBicmlnaHRlc3QgcGl4ZWwgaGFzIG1vcmUgdGhhbiAyIGVxdWFsIHNpYmxpbmdzIGluIGJvdGggaW1hZ2VzXG4gICAgLy8gKGRlZmluaXRlbHkgbm90IGFudGktYWxpYXNlZCksIHRoaXMgcGl4ZWwgaXMgYW50aS1hbGlhc2VkXG4gICAgcmV0dXJuICghYW50aWFsaWFzZWQoaW1nLCBtaW5YLCBtaW5ZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCkpIHx8XG4gICAgICAgICAgICghYW50aWFsaWFzZWQoaW1nLCBtYXhYLCBtYXhZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWF4WCwgbWF4WSwgd2lkdGgsIGhlaWdodCkpO1xufVxuXG4vLyBjYWxjdWxhdGUgY29sb3IgZGlmZmVyZW5jZSBhY2NvcmRpbmcgdG8gdGhlIHBhcGVyIFwiTWVhc3VyaW5nIHBlcmNlaXZlZCBjb2xvciBkaWZmZXJlbmNlXG4vLyB1c2luZyBZSVEgTlRTQyB0cmFuc21pc3Npb24gY29sb3Igc3BhY2UgaW4gbW9iaWxlIGFwcGxpY2F0aW9uc1wiIGJ5IFkuIEtvdHNhcmVua28gYW5kIEYuIFJhbW9zXG5cbmZ1bmN0aW9uIGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgaywgbSwgeU9ubHkpIHtcbiAgICB2YXIgYTEgPSBpbWcxW2sgKyAzXSAvIDI1NSxcbiAgICAgICAgYTIgPSBpbWcyW20gKyAzXSAvIDI1NSxcblxuICAgICAgICByMSA9IGJsZW5kKGltZzFbayArIDBdLCBhMSksXG4gICAgICAgIGcxID0gYmxlbmQoaW1nMVtrICsgMV0sIGExKSxcbiAgICAgICAgYjEgPSBibGVuZChpbWcxW2sgKyAyXSwgYTEpLFxuXG4gICAgICAgIHIyID0gYmxlbmQoaW1nMlttICsgMF0sIGEyKSxcbiAgICAgICAgZzIgPSBibGVuZChpbWcyW20gKyAxXSwgYTIpLFxuICAgICAgICBiMiA9IGJsZW5kKGltZzJbbSArIDJdLCBhMiksXG5cbiAgICAgICAgeSA9IHJnYjJ5KHIxLCBnMSwgYjEpIC0gcmdiMnkocjIsIGcyLCBiMik7XG5cbiAgICBpZiAoeU9ubHkpIHJldHVybiB5OyAvLyBicmlnaHRuZXNzIGRpZmZlcmVuY2Ugb25seVxuXG4gICAgdmFyIGkgPSByZ2IyaShyMSwgZzEsIGIxKSAtIHJnYjJpKHIyLCBnMiwgYjIpLFxuICAgICAgICBxID0gcmdiMnEocjEsIGcxLCBiMSkgLSByZ2IycShyMiwgZzIsIGIyKTtcblxuICAgIHJldHVybiAwLjUwNTMgKiB5ICogeSArIDAuMjk5ICogaSAqIGkgKyAwLjE5NTcgKiBxICogcTtcbn1cblxuZnVuY3Rpb24gcmdiMnkociwgZywgYikgeyByZXR1cm4gciAqIDAuMjk4ODk1MzEgKyBnICogMC41ODY2MjI0NyArIGIgKiAwLjExNDQ4MjIzOyB9XG5mdW5jdGlvbiByZ2IyaShyLCBnLCBiKSB7IHJldHVybiByICogMC41OTU5Nzc5OSAtIGcgKiAwLjI3NDE3NjEwIC0gYiAqIDAuMzIxODAxODk7IH1cbmZ1bmN0aW9uIHJnYjJxKHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjIxMTQ3MDE3IC0gZyAqIDAuNTIyNjE3MTEgKyBiICogMC4zMTExNDY5NDsgfVxuXG4vLyBibGVuZCBzZW1pLXRyYW5zcGFyZW50IGNvbG9yIHdpdGggd2hpdGVcbmZ1bmN0aW9uIGJsZW5kKGMsIGEpIHtcbiAgICByZXR1cm4gMjU1ICsgKGMgLSAyNTUpICogYTtcbn1cblxuZnVuY3Rpb24gZHJhd1BpeGVsKG91dHB1dCwgcG9zLCByLCBnLCBiKSB7XG4gICAgb3V0cHV0W3BvcyArIDBdID0gcjtcbiAgICBvdXRwdXRbcG9zICsgMV0gPSBnO1xuICAgIG91dHB1dFtwb3MgKyAyXSA9IGI7XG4gICAgb3V0cHV0W3BvcyArIDNdID0gMjU1O1xufVxuXG5mdW5jdGlvbiBncmF5UGl4ZWwoaW1nLCBpKSB7XG4gICAgdmFyIGEgPSBpbWdbaSArIDNdIC8gMjU1LFxuICAgICAgICByID0gYmxlbmQoaW1nW2kgKyAwXSwgYSksXG4gICAgICAgIGcgPSBibGVuZChpbWdbaSArIDFdLCBhKSxcbiAgICAgICAgYiA9IGJsZW5kKGltZ1tpICsgMl0sIGEpO1xuICAgIHJldHVybiByZ2IyeShyLCBnLCBiKTtcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBXZWJHTFN0YXRzICgpIHtcblxuICB2YXIgZGF0YSA9IHtcbiAgICBudW1EcmF3Q2FsbHM6IDAsXG5cbiAgICBudW1EcmF3QXJyYXlzQ2FsbHM6MCxcbiAgICBudW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHM6MCxcbiAgICBudW1EcmF3RWxlbWVudHNDYWxsczowLFxuICAgIG51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzOiAwLFxuXG4gICAgbnVtVXNlUHJvZ3JhbUNhbGxzOjAsXG4gICAgbnVtRmFjZXM6MCxcbiAgICBudW1WZXJ0aWNlczowLFxuICAgIG51bVBvaW50czowLFxuICAgIG51bUJpbmRUZXh0dXJlczowXG4gIH1cblxuICB2YXIgc3RhdHMgPSB7XG4gICAgZHJhd0NhbGxzOiBuZXcgU3RhdHMoKSxcbiAgICB1c2VQcm9ncmFtQ2FsbHM6IG5ldyBTdGF0cygpLFxuICAgIGZhY2VzOiBuZXcgU3RhdHMoKSxcbiAgICB2ZXJ0aWNlczogbmV3IFN0YXRzKCksXG4gICAgYmluZFRleHR1cmVzOiBuZXcgU3RhdHMoKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGZyYW1lRW5kKCkge1xuICAgIGZvciAobGV0IHN0YXQgaW4gc3RhdHMpIHtcbiAgICAgIHZhciBjb3VudGVyTmFtZSA9ICdudW0nICsgc3RhdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0YXQuc2xpY2UoMSk7XG4gICAgICBzdGF0c1tzdGF0XS51cGRhdGUoZGF0YVtjb3VudGVyTmFtZV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9oICggZiwgYyApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgZi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgfTtcbiAgfVxuICBcbiAgaWYgKCdXZWJHTDJSZW5kZXJpbmdDb250ZXh0JyBpbiB3aW5kb3cpIHtcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXNJbnN0YW5jZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0pO1xuXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50c0luc3RhbmNlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcblxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBkYXRhLm51bUZhY2VzICs9IGFyZ3VtZW50c1sgMSBdIC8gMztcbiAgICAgIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAxIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0gPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1Vc2VQcm9ncmFtQ2FsbHMrKztcbiAgICB9ICk7XG4gICAgXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gICAgfSApO1xuICBcbiAgfVxuXG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3RWxlbWVudHNDYWxscysrO1xuICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgZGF0YS5udW1GYWNlcyArPSBhcmd1bWVudHNbIDEgXSAvIDM7XG4gICAgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDEgXTtcbiAgfSApO1xuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzKys7XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gIH0gKTtcbiAgXG4gIGZ1bmN0aW9uIGZyYW1lU3RhcnQgKCkge1xuICAgIGRhdGEubnVtRHJhd0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdBcnJheXNDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzID0gMDtcbiAgICBkYXRhLm51bUZhY2VzID0gMDtcbiAgICBkYXRhLm51bVZlcnRpY2VzID0gMDtcbiAgICBkYXRhLm51bVBvaW50cyA9IDA7XG4gICAgZGF0YS5udW1CaW5kVGV4dHVyZXMgPSAwO1xuICB9XG4gIFxuICBmdW5jdGlvbiBzZXR1cEV4dGVuc2lvbnMoY29udGV4dCkge1xuICAgIHZhciBleHQgPSBjb250ZXh0LmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgIGlmICghZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV4dC5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUgPSBfaCggZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIFxuICAgIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdW1tYXJ5KCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgIG1pbjogc3RhdHNba2V5XS5taW4sXG4gICAgICAgIG1heDogc3RhdHNba2V5XS5tYXgsXG4gICAgICAgIGF2Zzogc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgZ2V0Q3VycmVudERhdGE6ICgpID0+IHtyZXR1cm4gZGF0YTt9LFxuICAgIHNldHVwRXh0ZW5zaW9uczogc2V0dXBFeHRlbnNpb25zLFxuICAgIGdldFN1bW1hcnk6IGdldFN1bW1hcnksXG4gICAgZnJhbWVTdGFydDogZnJhbWVTdGFydCxcbiAgICBmcmFtZUVuZDogZnJhbWVFbmRcbiAgICBcbiAgICAvL2VuYWJsZTogZW5hYmxlLFxuICAgIC8vZGlzYWJsZTogZGlzYWJsZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU3RhdHMoKTsiLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgUGVyZlN0YXRzIGZyb20gJ3BlcmZvcm1hbmNlLXN0YXRzJztcbmltcG9ydCBzZWVkcmFuZG9tIGZyb20gJ3NlZWRyYW5kb20nO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge0lucHV0UmVjb3JkZXIsIElucHV0UmVwbGF5ZXJ9IGZyb20gJ2lucHV0LWV2ZW50cy1yZWNvcmRlcic7XG5pbXBvcnQgRXZlbnRMaXN0ZW5lck1hbmFnZXIgZnJvbSAnLi9ldmVudC1saXN0ZW5lcnMnO1xuaW1wb3J0IElucHV0SGVscGVycyBmcm9tICcuL2lucHV0LWhlbHBlcnMnO1xuaW1wb3J0IFdlYkF1ZGlvSG9vayBmcm9tICcuL3dlYmF1ZGlvLWhvb2snO1xuaW1wb3J0IFdlYlZSSG9vayBmcm9tICcuL3dlYnZyLWhvb2snO1xuaW1wb3J0IHtyZXNpemVJbWFnZURhdGF9IGZyb20gJy4vaW1hZ2UtdXRpbHMnO1xuaW1wb3J0IHBpeGVsbWF0Y2ggZnJvbSAncGl4ZWxtYXRjaCc7XG5pbXBvcnQgV2ViR0xTdGF0cyBmcm9tICd3ZWJnbC1zdGF0cyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG5mdW5jdGlvbiBvblJlYWR5KGNhbGxiYWNrKSB7XG4gIGlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbiAgKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBjYWxsYmFjayk7XG4gIH1cbn1cblxuXG4vLyBIYWNrcyB0byBmaXggc29tZSBVbml0eSBkZW1vc1xuY29uc29sZS5sb2dFcnJvciA9IChtc2cpID0+IGNvbnNvbGUuZXJyb3IobXNnKTtcblxud2luZG93LlRFU1RFUiA9IHtcbiAgcmVhZHk6IGZhbHNlLFxuICBpbnB1dExvYWRpbmc6IGZhbHNlLFxuXG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgZmlyc3RGcmFtZVRpbWU6IG51bGwsXG4gIC8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxuICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU6IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGRlbm90aW5nIHdoZW4gdGhlIHBhZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuXG4gIHBhZ2VMb2FkVGltZTogbnVsbCxcblxuICAvLyBIb2xkcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbXNlY3MgdGhhdCB0aGUgcHJldmlvdXNseSByZW5kZXJlZCBmcmFtZSB0b29rLiBVc2VkIHRvIGVzdGltYXRlIHdoZW4gYSBzdHV0dGVyIGV2ZW50IG9jY3VycyAoZmFzdCBmcmFtZSBmb2xsb3dlZCBieSBhIHNsb3cgZnJhbWUpXG4gIGxhc3RGcmFtZUR1cmF0aW9uOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG4gIGxhc3RGcmFtZVRpY2s6IC0xLFxuXG4gIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWU6IDAsXG5cbiAgLy8gS2VlcHMgdHJhY2sgb2YgcGVyZm9ybWFuY2Ugc3R1dHRlciBldmVudHMuIEEgc3R1dHRlciBldmVudCBvY2N1cnMgd2hlbiB0aGVyZSBpcyBhIGhpY2N1cCBpbiBzdWJzZXF1ZW50IHBlci1mcmFtZSB0aW1lcy4gKGZhc3QgZm9sbG93ZWQgYnkgc2xvdylcbiAgbnVtU3R1dHRlckV2ZW50czogMCxcblxuICBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlOiAxMjAsIC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlXG5cbiAgLy8gTWVhc3VyZSBhIFwidGltZSB1bnRpbCBzbW9vdGggZnJhbWUgcmF0ZVwiIHF1YW50aXR5LCBpLmUuIHRoZSB0aW1lIGFmdGVyIHdoaWNoIHdlIGNvbnNpZGVyIHRoZSBzdGFydHVwIEpJVCBhbmQgR0MgZWZmZWN0cyB0byBoYXZlIHNldHRsZWQuXG4gIC8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbiAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXM6IDAsXG5cbiAgcmFuZG9tU2VlZDogMSxcbiAgbWFuZGF0b3J5QXV0b0VudGVyWFI6IHR5cGVvZiBwYXJhbWV0ZXJzWydtYW5kYXRvcnktYXV0b2VudGVyLXhyJ10gIT09ICd1bmRlZmluZWQnLFxuICBudW1GcmFtZXNUb1JlbmRlcjogdHlwZW9mIHBhcmFtZXRlcnNbJ251bS1mcmFtZXMnXSA9PT0gJ3VuZGVmaW5lZCcgPyAxMDAwIDogcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtLWZyYW1lcyddKSxcblxuICAvLyBDYW52YXMgdXNlZCBieSB0aGUgdGVzdCB0byByZW5kZXJcbiAgY2FudmFzOiBudWxsLFxuXG4gIGlucHV0UmVjb3JkZXI6IG51bGwsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gd2Ugc3RhcnRlZCBDUFUgZXhlY3V0aW9uIG9mIHRoZSBjdXJyZW50IGZyYW1lLlxuICAvLyB2YXIgcmVmZXJlbmNlVGVzdFQwID0gLTE7XG5cbiAgcHJlVGljazogZnVuY3Rpb24oKSB7XG5cbiAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnByZU1haW5Mb29wKSB7XG4gICAgICBHRlhURVNUU19DT05GSUcucHJlTWFpbkxvb3AoKTtcbiAgICB9XG5cbiAgICBXZWJHTFN0YXRzLmZyYW1lU3RhcnQoKTtcbiAgICB0aGlzLnN0YXRzLmZyYW1lU3RhcnQoKTtcblxuICAgIGlmICghdGhpcy5jYW52YXMpIHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snbm8tcmVuZGVyaW5nJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gV2UgYXNzdW1lIHRoZSBsYXN0IHdlYmdsIGNvbnRleHQgYmVpbmcgaW5pdGlhbGl6ZWQgaXMgdGhlIG9uZSB1c2VkIHRvIHJlbmRlcmluZ1xuICAgICAgICAvLyBJZiB0aGF0J3MgZGlmZmVyZW50LCB0aGUgdGVzdCBzaG91bGQgaGF2ZSBhIGN1c3RvbSBjb2RlIHRvIHJldHVybiB0aGF0IGNhbnZhc1xuICAgICAgICBpZiAoQ2FudmFzSG9vay53ZWJnbENvbnRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IENhbnZhc0hvb2sud2ViZ2xDb250ZXh0c1tDYW52YXNIb29rLndlYmdsQ29udGV4dHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgdGhpcy5jYW52YXMgPSBjb250ZXh0LmNhbnZhcztcblxuICAgICAgICAgIC8vIFByZXZlbnQgZXZlbnRzIG5vdCBkZWZpbmVkIGFzIGV2ZW50LWxpc3RlbmVyc1xuICAgICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSAoKSA9PiB7fTtcblxuICAgICAgICAgIC8vIFRvIHByZXZlbnQgd2lkdGggJiBoZWlnaHQgMTAwJVxuICAgICAgICAgIGZ1bmN0aW9uIGFkZFN0eWxlU3RyaW5nKHN0cikge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgbm9kZS5pbm5lckhUTUwgPSBzdHI7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZFN0eWxlU3RyaW5nKGAuZ2Z4dGVzdHMtY2FudmFzIHt3aWR0aDogJHt0aGlzLmNhbnZhc1dpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLmNhbnZhc0hlaWdodH1weCAhaW1wb3J0YW50O31gKTtcblxuICAgICAgICAgIC8vIFRvIGZpeCBBLUZyYW1lXG4gICAgICAgICAgYWRkU3R5bGVTdHJpbmcoYGEtc2NlbmUgLmEtY2FudmFzLmdmeHRlc3RzLWNhbnZhcyB7d2lkdGg6ICR7dGhpcy5jYW52YXNXaWR0aH1weCAhaW1wb3J0YW50OyBoZWlnaHQ6ICR7dGhpcy5jYW52YXNIZWlnaHR9cHggIWltcG9ydGFudDt9YCk7XG5cbiAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdnZnh0ZXN0cy1jYW52YXMnKTtcblxuICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcblxuICAgICAgICAgIFdlYkdMU3RhdHMuc2V0dXBFeHRlbnNpb25zKGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFJlY29yZGVyID0gbmV3IElucHV0UmVjb3JkZXIodGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dFJlY29yZGVyLmVuYWJsZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVwbGF5J10gIT09ICd1bmRlZmluZWQnICYmIEdGWFRFU1RTX0NPTkZJRy5pbnB1dCAmJiAhdGhpcy5pbnB1dExvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRMb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgICAgICAgZmV0Y2goJy90ZXN0cy8nICsgR0ZYVEVTVFNfQ09ORklHLmlucHV0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5pbnB1dFJlcGxheWVyID0gbmV3IElucHV0UmVwbGF5ZXIodGhpcy5jYW52YXMsIGpzb24sIHRoaXMuZXZlbnRMaXN0ZW5lci5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICB0aGlzLmlucHV0SGVscGVycyA9IG5ldyBJbnB1dEhlbHBlcnModGhpcy5jYW52YXMpO1xuICAgICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9AZml4bWUgZWxzZSBmb3IgY2FudmFzIDJkIHdpdGhvdXQgd2ViZ2xcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IDApIHtcbiAgICAgIGlmICgnYXV0b2VudGVyLXhyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgIHRoaXMuaW5qZWN0QXV0b0VudGVyWFIodGhpcy5jYW52YXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlZmVyZW5jZVRlc3RUMCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICBpZiAodGhpcy5wYWdlTG9hZFRpbWUgPT09IG51bGwpIHRoaXMucGFnZUxvYWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcGFnZUluaXRUaW1lO1xuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgaWYgKHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lICE9IC0xKSB7XG4gICAgICB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU7XG4gICAgICB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IC0xO1xuICAgIH1cbiAgfSxcblxuICBwb3N0VGljazogZnVuY3Rpb24gKCkge1xuXG4gICAgaWYgKCF0aGlzLnJlYWR5KSB7cmV0dXJuO31cbiAgICB0aGlzLnN0YXRzLmZyYW1lRW5kKCk7XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICB0aGlzLmlucHV0UmVjb3JkZXIuZnJhbWVOdW1iZXIgPSB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlcGxheWVyKSB7XG4gICAgICB0aGlzLmlucHV0UmVwbGF5ZXIudGljayh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcik7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcblxuICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgdmFyIGZyYW1lRHVyYXRpb24gPSB0aW1lTm93IC0gdGhpcy5sYXN0RnJhbWVUaWNrO1xuICAgIHRoaXMubGFzdEZyYW1lVGljayA9IHRpbWVOb3c7XG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID4gNSAmJiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID4gMCkge1xuICAgICAgLy8gVGhpcyBtdXN0IGJlIGZpeGVkIGRlcGVuZGluZyBvbiB0aGUgdnN5bmNcbiAgICAgIGlmIChmcmFtZUR1cmF0aW9uID4gMjAuMCAmJiBmcmFtZUR1cmF0aW9uID4gdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiAqIDEuMzUpIHtcbiAgICAgICAgdGhpcy5udW1TdHV0dGVyRXZlbnRzKys7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB7XG4gICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcysrO1xuICAgICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID49IHRoaXMubnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVVbnRpbFNtb290aEZyYW1lcmF0ZScsIHRpbWVOb3cgLSB0aGlzLmZpcnN0RnJhbWVUaW1lKTtcbiAgICAgICAgICAgIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiA9IGZyYW1lRHVyYXRpb247XG4vKlxuICAgIGlmIChudW1QcmVsb2FkWEhSc0luRmxpZ2h0ID09IDApIHsgLy8gSW1wb3J0YW50ISBUaGUgZnJhbWUgbnVtYmVyIGFkdmFuY2VzIG9ubHkgZm9yIHRob3NlIGZyYW1lcyB0aGF0IHRoZSBnYW1lIGlzIG5vdCB3YWl0aW5nIGZvciBkYXRhIGZyb20gdGhlIGluaXRpYWwgbmV0d29yayBkb3dubG9hZHMuXG4gICAgICBpZiAobnVtU3RhcnR1cEJsb2NrZXJYSFJzUGVuZGluZyA9PSAwKSArK3RoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOyAvLyBBY3R1YWwgcmVmdGVzdCBmcmFtZSBjb3VudCBvbmx5IGluY3JlbWVudHMgYWZ0ZXIgZ2FtZSBoYXMgY29uc3VtZWQgYWxsIHRoZSBjcml0aWNhbCBYSFJzIHRoYXQgd2VyZSB0byBiZSBwcmVsb2FkZWQuXG4gICAgICArK2Zha2VkVGltZTsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG4gICAgfVxuKi9cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcisrO1xuICAgIGlmICh0aGlzLmZyYW1lUHJvZ3Jlc3NCYXIpIHtcbiAgICAgIHZhciBwZXJjID0gcGFyc2VJbnQoMTAwICogdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgLyB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKTtcbiAgICAgIHRoaXMuZnJhbWVQcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHBlcmMgKyBcIiVcIjtcbiAgICB9XG5cbiAgICBGYWtlVGltZXJzLmZha2VkVGltZSsrOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMSkge1xuICAgICAgdGhpcy5maXJzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGaXJzdCBmcmFtZSBzdWJtaXR0ZWQgYXQgKG1zKTonLCB0aGlzLmZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICBXZWJHTFN0YXRzLmZyYW1lRW5kKCk7XG4gIH0sXG5cbiAgY3JlYXRlRG93bmxvYWRJbWFnZUxpbms6IGZ1bmN0aW9uKGRhdGEsIGZpbGVuYW1lLCBkZXNjcmlwdGlvbikge1xuICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGEuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lICsgJy5wbmcnKTtcbiAgICBhLnNldEF0dHJpYnV0ZSgnaHJlZicsIGRhdGEpO1xuICAgIGEuc3R5bGUuY3NzVGV4dCA9ICdjb2xvcjogI0ZGRjsgZGlzcGxheTogaW5saW5lLWdyaWQ7IHRleHQtZGVjb3JhdGlvbjogbm9uZTsgbWFyZ2luOiAycHg7IGZvbnQtc2l6ZTogMTRweDsnO1xuXG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5pZCA9IGZpbGVuYW1lO1xuICAgIGltZy5zcmMgPSBkYXRhO1xuICAgIGEuYXBwZW5kQ2hpbGQoaW1nKTtcblxuICAgIHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgbGFiZWwuY2xhc3NOYW1lID0gJ2J1dHRvbic7XG4gICAgbGFiZWwuaW5uZXJIVE1MID0gZGVzY3JpcHRpb24gfHwgZmlsZW5hbWU7XG5cbiAgICBhLmFwcGVuZENoaWxkKGxhYmVsKTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ltYWdlcycpLmFwcGVuZENoaWxkKGEpO1xuICB9LFxuXG4gIC8vIFhIUnMgaW4gdGhlIGV4cGVjdGVkIHJlbmRlciBvdXRwdXQgaW1hZ2UsIGFsd2F5cyAncmVmZXJlbmNlLnBuZycgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoZSB0ZXN0LlxuICBsb2FkUmVmZXJlbmNlSW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBHRlhURVNUU19SRUZFUkVOQ0VJTUFHRV9CQVNFVVJMID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZWplY3QoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICB2YXIgcmVmZXJlbmNlSW1hZ2VOYW1lID0gcGFyYW1ldGVyc1sncmVmZXJlbmNlLWltYWdlJ10gfHwgR0ZYVEVTVFNfQ09ORklHLmlkO1xuXG4gICAgICBpbWcuc3JjID0gJy8nICsgR0ZYVEVTVFNfUkVGRVJFTkNFSU1BR0VfQkFTRVVSTCArICcvJyArIHJlZmVyZW5jZUltYWdlTmFtZSArICcucG5nJztcbiAgICAgIGltZy5vbmFib3J0ID0gaW1nLm9uZXJyb3IgPSByZWplY3Q7XG5cbiAgICAgIC8vIHJlZmVyZW5jZS5wbmcgbWlnaHQgY29tZSBmcm9tIGEgZGlmZmVyZW50IGRvbWFpbiB0aGFuIHRoZSBjYW52YXMsIHNvIGRvbid0IGxldCBpdCB0YWludCBjdHguZ2V0SW1hZ2VEYXRhKCkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9DT1JTX2VuYWJsZWRfaW1hZ2VcbiAgICAgIGltZy5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICB0aGlzLnJlZmVyZW5jZUltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgXG4gICAgICAgIHZhciBkYXRhID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICAgIHRoaXMuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgJ3JlZmVyZW5jZS1pbWFnZScsICdSZWZlcmVuY2UgaW1hZ2UnKTtcblxuICAgICAgICByZXNvbHZlKHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2UgPSBpbWc7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0Q3VycmVudEltYWdlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIC8vIEdyYWIgcmVuZGVyZWQgV2ViR0wgZnJvbnQgYnVmZmVyIGltYWdlIHRvIGEgSlMtc2lkZSBpbWFnZSBvYmplY3QuXG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IGNhbGxiYWNrO1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZ2VuZXJhdGUgaW1hZ2VcIik7XG4gICAgfVxuICB9LFxuXG4gIGRvSW1hZ2VSZWZlcmVuY2VDaGVjazogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmdW5jdGlvbiByZWZ0ZXN0IChldnQpIHtcbiAgICAgICAgdmFyIGltZyA9IGFjdHVhbEltYWdlO1xuICAgICAgICB2YXIgY2FudmFzQ3VycmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB2YXIgY29udGV4dCA9IGNhbnZhc0N1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjYW52YXNDdXJyZW50LndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBjYW52YXNDdXJyZW50LmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG5cbiAgICAgICAgdmFyIGN1cnJlbnRJbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgICAgIHNlbGYubG9hZFJlZmVyZW5jZUltYWdlKCkudGhlbihyZWZJbWFnZURhdGEgPT4ge1xuICAgICAgICAgIHZhciB3aWR0aCA9IHJlZkltYWdlRGF0YS53aWR0aDtcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gcmVmSW1hZ2VEYXRhLmhlaWdodDtcbiAgICAgICAgICB2YXIgY2FudmFzRGlmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIHZhciBkaWZmQ3R4ID0gY2FudmFzRGlmZi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgIGNhbnZhc0RpZmYud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBjYW52YXNEaWZmLmhlaWdodCA9IGhlaWdodDsgIFxuICAgICAgICAgIHZhciBkaWZmID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIG5ld0ltYWdlRGF0YSA9IGRpZmZDdHguY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgIHJlc2l6ZUltYWdlRGF0YShjdXJyZW50SW1hZ2VEYXRhLCBuZXdJbWFnZURhdGEpO1xuXG4gICAgICAgICAgdmFyIGV4cGVjdGVkID0gcmVmSW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgICAgdmFyIGFjdHVhbCA9IG5ld0ltYWdlRGF0YS5kYXRhO1xuICAgICAgICAgIFxuICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSB0eXBlb2YgR0ZYVEVTVFNfQ09ORklHLnJlZmVyZW5jZUNvbXBhcmVUaHJlc2hvbGQgPT09ICd1bmRlZmluZWQnID8gMC4yIDogR0ZYVEVTVFNfQ09ORklHLnJlZmVyZW5jZUNvbXBhcmVUaHJlc2hvbGQ7XG4gICAgICAgICAgdmFyIG51bURpZmZQaXhlbHMgPSBwaXhlbG1hdGNoKGV4cGVjdGVkLCBhY3R1YWwsIGRpZmYuZGF0YSwgd2lkdGgsIGhlaWdodCwge3RocmVzaG9sZDogdGhyZXNob2xkfSk7XG4gICAgICAgICAgdmFyIGRpZmZQZXJjID0gbnVtRGlmZlBpeGVscyAvICh3aWR0aCAqIGhlaWdodCkgKiAxMDA7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGZhaWwgPSBkaWZmUGVyYyA+IDAuMjsgLy8gZGlmZiBwZXJjIDAgLSAxMDAlXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHtyZXN1bHQ6ICdwYXNzJ307XG5cbiAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2ggKCR7ZGlmZlBlcmMudG9GaXhlZCgyKX0lIGRpZmZlcmVudCBwaXhlbHMpYDtcbiAgICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgICAgZGlmZlBlcmM6IGRpZmZQZXJjLFxuICAgICAgICAgICAgICBudW1EaWZmUGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICAgICAgICBmYWlsUmVhc29uOiAnUmVmZXJlbmNlIGltYWdlIG1pc21hdGNoJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgICAgIGJlbmNobWFya0Rpdi5jbGFzc05hbWUgPSAnZmFpbCc7XG4gICAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBmYWlsZWQhJztcblxuICAgICAgICAgICAgZGlmZkN0eC5wdXRJbWFnZURhdGEoZGlmZiwgMCwgMCk7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gY2FudmFzRGlmZi50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgICAgICAgICAgc2VsZi5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAnY2FudmFzLWRpZmYnLCAnRGlmZmVyZW5jZScpO1xuICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gJ2ZhaWwnO1xuICAgICAgICAgIGJlbmNobWFya0Rpdi5xdWVyeVNlbGVjdG9yKCdoMScpLmlubmVyVGV4dCA9ICdUZXN0IGZhaWxlZCEnO1xuXG4gICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICBkaXZFcnJvci5xdWVyeVNlbGVjdG9yKCdoMycpLmlubmVySFRNTCA9IGBFUlJPUjogRmFpbGVkIHRvIGxvYWQgcmVmZXJlbmNlIGltYWdlYDtcbiAgICAgICAgICBkaXZFcnJvci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgIGZhaWxSZWFzb246ICdFcnJvciBsb2FkaW5nIHJlZmVyZW5jZSBpbWFnZSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIGFjdHVhbEltYWdlLnNyYyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gcmVmdGVzdDtcbiAgICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmVqZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgaW5pdFNlcnZlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovLycgKyBHRlhURVNUU19DT05GSUcuc2VydmVySVAgKyAnOjg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgndGVzdF9zdGFydGVkJywge2lkOiBHRlhURVNUU19DT05GSUcuaWR9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCduZXh0X2JlbmNobWFyaycsIChkYXRhKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnbmV4dF9iZW5jaG1hcmsnLCBkYXRhKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGRhdGEudXJsKTtcbiAgICB9KTtcbiAgfSxcblxuICBhZGRJbnB1dERvd25sb2FkQnV0dG9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBEdW1wIGlucHV0XG4gICAgICBmdW5jdGlvbiBzYXZlU3RyaW5nICh0ZXh0LCBmaWxlbmFtZSwgbWltZVR5cGUpIHtcbiAgICAgICAgc2F2ZUJsb2IobmV3IEJsb2IoWyB0ZXh0IF0sIHsgdHlwZTogbWltZVR5cGUgfSksIGZpbGVuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIGZpbGVuYW1lKSB7XG4gICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZSB8fCAnaW5wdXQuanNvbic7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgLy8gVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpOyBicmVha3MgRmlyZWZveC4uLlxuICAgICAgfVxuXG4gICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMsIG51bGwsIDIpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKCdJbnB1dCByZWNvcmRlZCcsIGpzb24pO1xuXG4gICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG4gICAgICBsaW5rLmNsYXNzTmFtZSA9ICdidXR0b24nO1xuICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4gc2F2ZVN0cmluZyhqc29uLCBHRlhURVNUU19DT05GSUcuaWQgKyAnLmpzb24nLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgbGluay5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShgRG93bmxvYWQgaW5wdXQgSlNPTmApKTsgLy8gKCR7dGhpcy5pbnB1dFJlY29yZGVyLmV2ZW50cy5sZW5ndGh9IGV2ZW50cyByZWNvcmRlZClcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJykuYXBwZW5kQ2hpbGQobGluayk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVGYWlsZWRCZW5jaG1hcmtSZXN1bHQ6IGZ1bmN0aW9uIChmYWlsUmVhc29uKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRlc3RfaWQ6IEdGWFRFU1RTX0NPTkZJRy5pZCxcbiAgICAgIGF1dG9FbnRlclhSOiB0aGlzLmF1dG9FbnRlclhSLFxuICAgICAgcmV2aXNpb246IEdGWFRFU1RTX0NPTkZJRy5yZXZpc2lvbiB8fCAwLFxuICAgICAgbnVtRnJhbWVzOiB0aGlzLm51bUZyYW1lc1RvUmVuZGVyLFxuICAgICAgcGFnZUxvYWRUaW1lOiB0aGlzLnBhZ2VMb2FkVGltZSxcbiAgICAgIHJlc3VsdDogJ2ZhaWwnLFxuICAgICAgZmFpbFJlYXNvbjogZmFpbFJlYXNvblxuICAgIH07XG4gIH0sXG5cbiAgZ2VuZXJhdGVCZW5jaG1hcmtSZXN1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGltZUVuZCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB2YXIgdG90YWxUaW1lID0gdGltZUVuZCAtIHBhZ2VJbml0VGltZTsgLy8gVG90YWwgdGltZSwgaW5jbHVkaW5nIGV2ZXJ5dGhpbmcuXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUgPT4ge1xuICAgICAgdmFyIHRvdGFsUmVuZGVyVGltZSA9IHRpbWVFbmQgLSB0aGlzLmZpcnN0RnJhbWVUaW1lO1xuICAgICAgdmFyIGNwdUlkbGUgPSB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKiAxMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyICogMTAwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuXG4gICAgICB2YXIgcmVzdWx0ID0ge1xuICAgICAgICB0ZXN0X2lkOiBHRlhURVNUU19DT05GSUcuaWQsXG4gICAgICAgIHN0YXRzOiB7XG4gICAgICAgICAgcGVyZjogdGhpcy5zdGF0cy5nZXRTdGF0c1N1bW1hcnkoKSxcbiAgICAgICAgICB3ZWJnbDogV2ViR0xTdGF0cy5nZXRTdW1tYXJ5KClcbiAgICAgICAgfSxcbiAgICAgICAgYXV0b0VudGVyWFI6IHRoaXMuYXV0b0VudGVyWFIsXG4gICAgICAgIHJldmlzaW9uOiBHRlhURVNUU19DT05GSUcucmV2aXNpb24gfHwgMCxcbiAgICAgICAgd2ViYXVkaW86IFdlYkF1ZGlvSG9vay5zdGF0cyxcbiAgICAgICAgbnVtRnJhbWVzOiB0aGlzLm51bUZyYW1lc1RvUmVuZGVyLFxuICAgICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgICAgdGltZVRvRmlyc3RGcmFtZTogdGhpcy5maXJzdEZyYW1lVGltZSAtIHBhZ2VJbml0VGltZSxcbiAgICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICAgIG51bVN0dXR0ZXJFdmVudHM6IHRoaXMubnVtU3R1dHRlckV2ZW50cyxcbiAgICAgICAgdG90YWxSZW5kZXJUaW1lOiB0b3RhbFJlbmRlclRpbWUsXG4gICAgICAgIGNwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCxcbiAgICAgICAgYXZnQ3B1VGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVJbk1haW5Mb29wIC8gdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgICAgY3B1SWRsZVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wLFxuICAgICAgICBjcHVJZGxlUGVyYzogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKiAxMDAgLyB0b3RhbFJlbmRlclRpbWUsXG4gICAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgICAgIHJlc3VsdDogJ3Bhc3MnLFxuICAgICAgICBsb2dzOiB0aGlzLmxvZ3NcbiAgICAgIH07XG5cbiAgICAgIC8vIEB0b2RvIEluZGljYXRlIHNvbWVob3cgdGhhdCBubyByZWZlcmVuY2UgdGVzdCBoYXMgYmVlbiBwZXJmb3JtZWRcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snc2tpcC1yZWZlcmVuY2UtaW1hZ2UtdGVzdCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvSW1hZ2VSZWZlcmVuY2VDaGVjaygpLnRoZW4ocmVmUmVzdWx0ID0+IHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgcmVmUmVzdWx0KTtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0pLmNhdGNoKHJlZlJlc3VsdCA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHJlZlJlc3VsdCk7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBiZW5jaG1hcmtGaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuYWRkSW5wdXREb3dubG9hZEJ1dHRvbigpO1xuICAgIH1cblxuICAgIHRoaXMuaW5qZWN0QmVuY2htYXJrRmluaXNoZWRIVE1MKCk7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSB0aGlzLmlucHV0UmVjb3JkZXIgPyAnRG93bmxvYWQgcmVmZXJlbmNlIGltYWdlJyA6ICdBY3R1YWwgcmVuZGVyJztcbiAgICAgIHRoaXMuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgR0ZYVEVTVFNfQ09ORklHLmlkLCBkZXNjcmlwdGlvbik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZ2VuZXJhdGUgaW1hZ2VcIiwgZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZW5lcmF0ZUJlbmNobWFya1Jlc3VsdCgpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzQmVuY2htYXJrUmVzdWx0KHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIGluamVjdEJlbmNobWFya0ZpbmlzaGVkSFRNTDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgICAjdGVzdF9maW5pc2hlZCB7XG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNkZGQ7XG4gICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgY29sb3I6ICMwMDA7XG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBzYW5zLXNlcmlmO1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBmb250LXNpemU6IDIwcHg7XG4gICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgICAgICBsZWZ0OiAwO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHJpZ2h0OiAwO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIHotaW5kZXg6IDk5OTk5O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZC5wYXNzIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzlmOTtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQuZmFpbCB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOTk7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ltYWdlcyB7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDIwcHg7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ltYWdlcyBpbWcge1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICMwMDcwOTU7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkIC5idXR0b24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBib3JkZXItY29sb3I6ICMwMDcwOTU7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDEwcHg7XG4gICAgICAgIGNvbG9yOiAjRkZGRkZGO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhIE5ldWVcIiwgXCJIZWx2ZXRpY2FcIiwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiAhaW1wb3J0YW50O1xuICAgICAgICBmb250LXNpemU6IDE0cHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBub3JtYWw7XG4gICAgICAgIHdpZHRoOiAzMDBweDtcbiAgICAgICAgcGFkZGluZzogMTBweCAxcHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIDMwMG1zIGVhc2Utb3V0O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZCAuYnV0dG9uOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzhhMDtcbiAgICAgIH1cbiAgICBgO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdi5pbm5lckhUTUwgPSBgPGgxPlRlc3QgZmluaXNoZWQhPC9oMT5gO1xuICAgIGRpdi5pZCA9ICd0ZXN0X2ZpbmlzaGVkJztcbiAgICBkaXYuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuXG4gICAgdmFyIGRpdlJlZmVyZW5jZUVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3IuaWQgPSAncmVmZXJlbmNlLWltYWdlcy1lcnJvcic7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3Iuc3R5bGUuY3NzVGV4dCA9ICd0ZXh0LWFsaWduOmNlbnRlcjsgY29sb3I6ICNmMDA7J1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlubmVySFRNTCA9ICc8aDM+PC9oMz4nO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoZGl2UmVmZXJlbmNlRXJyb3IpO1xuICAgIHZhciBkaXZJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXZJbWcuaWQgPSAndGVzdF9pbWFnZXMnO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmFwcGVuZENoaWxkKGRpdkltZyk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gIH0sXG4gIHByb2Nlc3NCZW5jaG1hcmtSZXN1bHQ6IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgaWYgKHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddKSB7XG4gICAgICAgIHJlc3VsdC50ZXN0VVVJRCA9IHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddO1xuICAgICAgfVxuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgndGVzdF9maW5pc2gnLCByZXN1bHQpO1xuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH1cblxuICAgIHZhciBiZW5jaG1hcmtEaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpO1xuICAgIGJlbmNobWFya0Rpdi5jbGFzc05hbWUgPSByZXN1bHQucmVzdWx0O1xuICAgIGlmIChyZXN1bHQucmVzdWx0ID09PSAncGFzcycpIHtcbiAgICAgIGJlbmNobWFya0Rpdi5xdWVyeVNlbGVjdG9yKCdoMScpLmlubmVyVGV4dCA9ICdUZXN0IHBhc3NlZCEnO1xuICAgIH1cblxuICAgIGJlbmNobWFya0Rpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuXG4gICAgY29uc29sZS5sb2coJ0ZpbmlzaGVkIScsIHJlc3VsdCk7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jbG9zZSAmJiB0eXBlb2YgcGFyYW1ldGVyc1snbm8tY2xvc2Utb24tZmFpbCddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgfVxuICB9LFxuXG4gIHdyYXBFcnJvcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiBldnQubG9ncy5jYXRjaEVycm9ycyA9IHtcbiAgICAgIG1lc3NhZ2U6IGV2dC5lcnJvci5tZXNzYWdlLFxuICAgICAgc3RhY2s6IGV2dC5lcnJvci5zdGFjayxcbiAgICAgIGxpbmVubzogZXZ0LmVycm9yLmxpbmVubyxcbiAgICAgIGZpbGVuYW1lOiBldnQuZXJyb3IuZmlsZW5hbWVcbiAgICB9KTtcblxuICAgIHZhciB3cmFwRnVuY3Rpb25zID0gWydlcnJvcicsJ3dhcm5pbmcnLCdsb2cnXTtcbiAgICB3cmFwRnVuY3Rpb25zLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZVtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBmbiA9IGNvbnNvbGVba2V5XS5iaW5kKGNvbnNvbGUpO1xuICAgICAgICBjb25zb2xlW2tleV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGlmIChrZXkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncy5lcnJvcnMucHVzaChhcmdzKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3Mud2FybmluZ3MucHVzaChhcmdzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnNlbmRMb2cpXG4gICAgICAgICAgICBURVNURVIuc29ja2V0LmVtaXQoJ2xvZycsIGFyZ3MpO1xuXG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5mb092ZXJsYXk6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGl2T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2T3ZlcmxheS5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgZm9udC1mYW1pbHk6IE1vbm9zcGFjZTtcbiAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoOTUsIDQwLCAxMzYpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgcGFkZGluZzogNXB4YDtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2T3ZlcmxheSk7XG4gICAgICBkaXZPdmVybGF5LmlubmVyVGV4dCA9IHBhcmFtZXRlcnNbJ2luZm8tb3ZlcmxheSddO1xuICAgIH0pXG4gIH0sXG5cbiAgYWRkUHJvZ3Jlc3NCYXI6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgdmFyIGRpdlByb2dyZXNzQmFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2UHJvZ3Jlc3NCYXJzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6ICMzMzM7IHdpZHRoOiAyMDBweDsgcGFkZGluZzogNXB4IDVweCAwcHggNXB4Oyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzQmFycyk7XG5cbiAgICAgIHZhciBvcmRlckdsb2JhbCA9IHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddO1xuICAgICAgdmFyIHRvdGFsR2xvYmFsID0gcGFyYW1ldGVyc1sndG90YWwtZ2xvYmFsJ107XG4gICAgICB2YXIgcGVyY0dsb2JhbCA9IE1hdGgucm91bmQob3JkZXJHbG9iYWwvdG90YWxHbG9iYWwgKiAxMDApO1xuICAgICAgdmFyIG9yZGVyVGVzdCA9IHBhcmFtZXRlcnNbJ29yZGVyLXRlc3QnXTtcbiAgICAgIHZhciB0b3RhbFRlc3QgPSBwYXJhbWV0ZXJzWyd0b3RhbC10ZXN0J107XG4gICAgICB2YXIgcGVyY1Rlc3QgPSBNYXRoLnJvdW5kKG9yZGVyVGVzdC90b3RhbFRlc3QgKiAxMDApO1xuXG4gICAgICBmdW5jdGlvbiBhZGRQcm9ncmVzc0JhclNlY3Rpb24odGV4dCwgY29sb3IsIHBlcmMsIGlkKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDIwcHg7IG1hcmdpbi1ib3R0b206IDVweDsgb3ZlcmZsb3c6IGhpZGRlbjsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsnO1xuICAgICAgICBkaXZQcm9ncmVzc0JhcnMuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICB2YXIgZGl2UHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzKTtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaWQgPSBpZDtcbiAgICAgICAgfVxuICAgICAgICBkaXZQcm9ncmVzcy5zdHlsZS5jc3NUZXh0PWBcbiAgICAgICAgICB3aWR0aDogJHtwZXJjfSU7YmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn0gZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMzMzdhYjc7XG4gICAgICAgICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIC0xcHggMCByZ2JhKDAsMCwwLC4xNSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO2A7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaW5uZXJUZXh0ID0gdGV4dDs7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snb3JkZXItZ2xvYmFsJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlclRlc3R9LyR7dG90YWxUZXN0fSAke3BlcmNUZXN0fSVgLCAnIzViYzBkZScsIHBlcmNUZXN0KTtcbiAgICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyR2xvYmFsfS8ke3RvdGFsR2xvYmFsfSAke3BlcmNHbG9iYWx9JWAsICcjMzM3YWI3JywgcGVyY0dsb2JhbCk7XG4gICAgICB9XG5cbiAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbignJywgJyMzMzdhYjcnLCAwLCAnbnVtZnJhbWVzJyk7XG4gICAgICB0aGlzLmZyYW1lUHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbnVtZnJhbWVzJyk7XG5cbiAgICB9KTtcbiAgfSxcblxuICBob29rTW9kYWxzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBIb29rIG1vZGFsczogVGhpcyBpcyBhbiB1bmF0dGVuZGVkIHJ1biwgZG9uJ3QgYWxsb3cgd2luZG93LmFsZXJ0KClzIHRvIGludHJ1ZGUuXG4gICAgd2luZG93LmFsZXJ0ID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5hbGVydCgnICsgbXNnICsgJyknKTsgfVxuICAgIHdpbmRvdy5jb25maXJtID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5jb25maXJtKCcgKyBtc2cgKyAnKScpOyByZXR1cm4gdHJ1ZTsgfVxuICB9LFxuICBSQUZzOiBbXSwgLy8gVXNlZCB0byBzdG9yZSBpbnN0YW5jZXMgb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lJ3MgY2FsbGJhY2tzXG4gIHByZXZSQUZSZWZlcmVuY2U6IG51bGwsIC8vIFByZXZpb3VzIGNhbGxlZCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgY2FsbGJhY2tcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBjb25zdCBob29rZWRDYWxsYmFjayA9IHAgPT4ge1xuICAgICAgLy8gUHVzaCB0aGUgY2FsbGJhY2sgdG8gdGhlIGxpc3Qgb2YgY3VycmVudGx5IHJ1bm5pbmcgUkFGc1xuICAgICAgaWYgKHRoaXMuUkFGcy5pbmRleE9mKGNhbGxiYWNrKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5SQUZzLnB1c2goY2FsbGJhY2spO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgY3VycmVudCBjYWxsYmFjayBpcyB0aGUgZmlyc3Qgb24gdGhlIGxpc3QsIHdlIGFzc3VtZSB0aGUgZnJhbWUganVzdCBzdGFydGVkXG4gICAgICBpZiAodGhpcy5SQUZzWzBdID09PSBjYWxsYmFjaykge1xuICAgICAgICB0aGlzLnByZVRpY2soKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xuXG4gICAgICAvLyBJZiByZWFjaGluZyB0aGUgbGFzdCBSQUYsIGV4ZWN1dGUgYWxsIHRoZSBwb3N0IGNvZGVcbiAgICAgIGlmICh0aGlzLlJBRnNbIHRoaXMuUkFGcy5sZW5ndGggLSAxIF0gPT09IGNhbGxiYWNrKSB7XG5cbiAgICAgICAgLy8gQHRvZG8gTW92ZSBhbGwgdGhpcyBsb2dpYyB0byBhIGZ1bmN0aW9uIHRvIGNsZWFuIHVwIHRoaXMgb25lXG4gICAgICAgIHRoaXMucG9zdFRpY2soKTtcblxuICAgICAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgICAgICB0aGlzLnJlbGVhc2VSQUYoKTtcbiAgICAgICAgICB0aGlzLmJlbmNobWFya0ZpbmlzaGVkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5wb3N0TWFpbkxvb3ApIHtcbiAgICAgICAgICBHRlhURVNUU19DT05GSUcucG9zdE1haW5Mb29wKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIFJBRiBpcyB0aGUgc2FtZSBhcyBub3csIGp1c3QgcmVzZXQgdGhlIGxpc3RcbiAgICAgIC8vIGluIGNhc2Ugd2UgaGF2ZSBzdG9wcGVkIGNhbGxpbmcgc29tZSBvZiB0aGUgcHJldmlvdXMgUkFGc1xuICAgICAgaWYgKHRoaXMucHJldlJBRlJlZmVyZW5jZSA9PT0gY2FsbGJhY2sgJiYgKHRoaXMuUkFGc1swXSAhPT0gY2FsbGJhY2sgfHwgdGhpcy5SQUZzLmxlbmd0aCA+IDEpKSB7XG4gICAgICAgIHRoaXMuUkFGcyA9IFtjYWxsYmFja107XG4gICAgICB9XG4gICAgICB0aGlzLnByZXZSQUZSZWZlcmVuY2UgPSBjYWxsYmFjaztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudFJBRkNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZShob29rZWRDYWxsYmFjayk7XG4gIH0sXG4gIGN1cnJlbnRSQUZDb250ZXh0OiB3aW5kb3csXG4gIHJlbGVhc2VSQUY6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICgpID0+IHt9O1xuICAgIGlmICgnVlJEaXNwbGF5JyBpbiB3aW5kb3cgJiZcbiAgICAgIHRoaXMuY3VycmVudFJBRkNvbnRleHQgaW5zdGFuY2VvZiBWUkRpc3BsYXkgJiZcbiAgICAgIHRoaXMuY3VycmVudFJBRkNvbnRleHQuaXNQcmVzZW50aW5nKSB7XG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LmV4aXRQcmVzZW50KCk7XG4gICAgfVxuICB9LFxuICBob29rUkFGOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGNvbnNvbGUubG9nKCdIb29raW5nJywgY29udGV4dCk7XG4gICAgaWYgKCFjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNvbnRleHQucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIH1cbiAgICBjb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jdXJyZW50UkFGQ29udGV4dCA9IGNvbnRleHQ7XG4gIH0sXG4gIHVuaG9va1JBRjogZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBjb25zb2xlLmxvZygndW5ob29raW5nJywgY29udGV4dCwgY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKTtcbiAgICBpZiAoY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICBjb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICB9XG4gIH0sXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluaXRTZXJ2ZXIoKTtcblxuICAgIGlmICghR0ZYVEVTVFNfQ09ORklHLnByb3ZpZGVzUmFmSW50ZWdyYXRpb24pIHtcbiAgICAgIHRoaXMuaG9va1JBRih3aW5kb3cpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkUHJvZ3Jlc3NCYXIoKTtcbiAgICB0aGlzLmFkZEluZm9PdmVybGF5KCk7XG5cbiAgICBjb25zb2xlLmxvZygnRnJhbWVzIHRvIHJlbmRlcjonLCB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKTtcblxuICAgIGlmICghR0ZYVEVTVFNfQ09ORklHLmRvbnRPdmVycmlkZVRpbWUpIHtcbiAgICAgIEZha2VUaW1lcnMuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgaWYgKCFHRlhURVNUU19DT05GSUcuZG9udE92ZXJyaWRlV2ViQXVkaW8pIHtcbiAgICAgIFdlYkF1ZGlvSG9vay5lbmFibGUodHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViYXVkaW8nXSAhPT0gJ3VuZGVmaW5lZCcpO1xuICAgIH1cblxuICAgIC8vIEB0b2RvIFVzZSBjb25maWdcbiAgICBXZWJWUkhvb2suZW5hYmxlKHZyZGlzcGxheSA9PiB7XG4gICAgICB0aGlzLmhvb2tSQUYodnJkaXNwbGF5KTtcbiAgICB9KTtcbi8qXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3ZyZGlzcGxheXByZXNlbnRjaGFuZ2UnLCBldnQgPT4ge1xuICAgICAgdmFyIGRpc3BsYXkgPSBldnQuZGlzcGxheTtcbiAgICAgIGlmIChkaXNwbGF5LmlzUHJlc2VudGluZykge1xuICAgICAgICB0aGlzLnVuaG9va1JBRih3aW5kb3cpO1xuICAgICAgICB0aGlzLmhvb2tSQUYoZGlzcGxheSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuaG9va1JBRihkaXNwbGF5KTtcbiAgICAgICAgdGhpcy5ob29rUkFGKHdpbmRvdyk7XG4gICAgICB9XG4gICAgfSk7XG4qL1xuICAgIE1hdGgucmFuZG9tID0gc2VlZHJhbmRvbSh0aGlzLnJhbmRvbVNlZWQpO1xuICAgIENhbnZhc0hvb2suZW5hYmxlKE9iamVjdC5hc3NpZ24oe2Zha2VXZWJHTDogdHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCd9LCB7d2lkdGg6IHRoaXMuY2FudmFzV2lkdGgsIGhlaWdodDogdGhpcy5jYW52YXNIZWlnaHR9KSk7XG4gICAgdGhpcy5ob29rTW9kYWxzKCk7XG5cbiAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLnN0YXRzID0gbmV3IFBlcmZTdGF0cygpO1xuXG4gICAgdGhpcy5sb2dzID0ge1xuICAgICAgZXJyb3JzOiBbXSxcbiAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgIGNhdGNoRXJyb3JzOiBbXVxuICAgIH07XG4gICAgLy8gdGhpcy53cmFwRXJyb3JzKCk7XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcblxuICAgIC8vaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlY29yZGluZyddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5ldmVudExpc3RlbmVyLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID0gMDtcblxuICAgIHRoaXMudGltZVN0YXJ0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICB9LFxuICBhdXRvRW50ZXJYUjoge1xuICAgIHJlcXVlc3RlZDogZmFsc2UsXG4gICAgc3VjY2Vzc2Z1bDogZmFsc2VcbiAgfSxcbiAgaW5qZWN0QXV0b0VudGVyWFI6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgIHRoaXMuYXV0b0VudGVyWFIucmVxdWVzdGVkID0gdHJ1ZTtcbiAgICBpZiAobmF2aWdhdG9yLmdldFZSRGlzcGxheXMpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cygpLnRoZW4oZGlzcGxheXMgPT4ge1xuICAgICAgICAgIHZhciBkZXZpY2UgPSBkaXNwbGF5c1swXTtcbiAgICAgICAgICAvL2lmIChkZXZpY2UuaXNQcmVzZW50aW5nKSBkZXZpY2UuZXhpdFByZXNlbnQoKTtcbiAgICAgICAgICBpZiAoZGV2aWNlKSB7XG4gICAgICAgICAgICBkZXZpY2UucmVxdWVzdFByZXNlbnQoIFsgeyBzb3VyY2U6IGNhbnZhcyB9IF0gKVxuICAgICAgICAgICAgICAudGhlbih4ID0+IHsgY29uc29sZS5sb2coJ2F1dG9lbnRlciBYUiBzdWNjZXNzZnVsJyk7IHRoaXMuYXV0b0VudGVyWFIuc3VjY2Vzc2Z1bCA9IHRydWU7IH0pXG4gICAgICAgICAgICAgIC5jYXRjaCh4ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXV0b2VudGVyIFhSIGZhaWxlZCcpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hbmRhdG9yeUF1dG9FbnRlclhSKSB7XG4gICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHggPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb2Nlc3NCZW5jaG1hcmtSZXN1bHQodGhpcy5nZW5lcmF0ZUZhaWxlZEJlbmNobWFya1Jlc3VsdCgnYXV0b2VudGVyLXhyIGZhaWxlZCcpKTtcbiAgICAgICAgICAgICAgICAgIH0sMTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LCAyMDAwKTsgLy8gQGZpeCB0byBtYWtlIGl0IHdvcmsgb24gRnhSXG4gICAgfSBlbHNlIGlmICh0aGlzLm1hbmRhdG9yeUF1dG9FbnRlclhSKSB7XG4gICAgICBzZXRUaW1lb3V0KHggPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NCZW5jaG1hcmtSZXN1bHQodGhpcy5nZW5lcmF0ZUZhaWxlZEJlbmNobWFya1Jlc3VsdCgnYXV0b2VudGVyLXhyIGZhaWxlZCcpKTtcbiAgICAgIH0sMTAwMCk7XG4gICAgfVxuICB9LFxuXG4gIG9uUmVzaXplOiBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlICYmIGUub3JpZ2luID09PSAnd2ViZ2Z4dGVzdCcpIHJldHVybjtcblxuICAgIGNvbnN0IERFRkFVTFRfV0lEVEggPSA4MDA7XG4gICAgY29uc3QgREVGQVVMVF9IRUlHSFQgPSA2MDA7XG4gICAgdGhpcy5jYW52YXNXaWR0aCA9IERFRkFVTFRfV0lEVEg7XG4gICAgdGhpcy5jYW52YXNIZWlnaHQgPSBERUZBVUxUX0hFSUdIVDtcblxuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sna2VlcC13aW5kb3ctc2l6ZSddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5jYW52YXNXaWR0aCA9IHR5cGVvZiBwYXJhbWV0ZXJzWyd3aWR0aCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfV0lEVEggOiBwYXJzZUludChwYXJhbWV0ZXJzWyd3aWR0aCddKTtcbiAgICAgIHRoaXMuY2FudmFzSGVpZ2h0ID0gdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pO1xuICAgICAgd2luZG93LmlubmVyV2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICB9XG5cbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoJ3Jlc2l6ZScsIHRydWUsIHRydWUpO1xuICAgIH1cbiAgICBlLm9yaWdpbiA9ICd3ZWJnZnh0ZXN0JztcbiAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudCA/IHdpbmRvdy5kaXNwYXRjaEV2ZW50KGUpIDogd2luZG93LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICB9XG59O1xuXG5URVNURVIuaW5pdCgpO1xuXG52YXIgcGFnZUluaXRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuIl0sIm5hbWVzIjpbIlN0YXRzIiwidGhpcyIsImRlZmluZSIsInJlcXVpcmUkJDAiLCJzciIsImRlY29kZSIsImRlY29kZUNvbXBvbmVudCIsIktleXN0cm9rZVZpc3VhbGl6ZXIiLCJXZWJHTFN0YXRzIiwicGl4ZWxtYXRjaCIsInNlZWRyYW5kb20iLCJQZXJmU3RhdHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0NBQUEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDOztDQUV0QixNQUFNLFFBQVEsQ0FBQztDQUNmLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRTtDQUNqQixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2YsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sR0FBRyxHQUFHO0NBQ2YsSUFBSSxPQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUMxQixHQUFHOztDQUVILEVBQUUsT0FBTyxPQUFPLEdBQUc7Q0FDbkIsSUFBSSxPQUFPLFFBQVEs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LEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxVQUFVLEVBQUU7Q0FDckMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDckMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNqQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RDLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxJQUFJLE1BQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQy9DLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdkMsSUFBSSxNQUFNLElBQUksT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxFQUFFO0NBQzNELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENB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R0FBRyxDQUFDLENBQUM7Q0FDZixHQUFHOztDQUVILEVBQUUsSUFBSSxRQUFRLEdBQUc7Q0FDakIsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMzQixHQUFHOztDQUVILEVBQUUsSUFBSSxrQkFBa0IsR0FBRztDQUMzQixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxHQUFHOztDQUVILEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRTtDQUNoQixJQUFJLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNoQyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0NBQ3BCO0NBQ0EsTUFBTSxPQUFPO0NBQ2IsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ2IsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7Q0FDcEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQy9CLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztDQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FB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LENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7OztHQUdGLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1QsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsSUFBSSxHQUFHLElBQUksQ0FBQztFQUNiOztDQUVELFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7R0FDbEIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1YsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQ1osQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQ1osQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0dBQ1osT0FBTyxDQUFDLENBQUM7RUFDVjs7Q0FFRCxTQUFT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Q0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3pELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkIsT0FBTyxDQUFDLENBQUM7SUFDVixDQUFDOztHQUVGLFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7S0FDdEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7O0tBRWpCLElBQUksSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTs7T0FFdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7TUFDakIsTUFBTTs7T0FFTCxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztPQUNqQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7U0FDaEMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRTtjQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDakQ7TUFDRjs7S0FFRCxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7S0FFekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0tBR1QsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7T0FDeEIsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO01BQ1g7SUFDRjs7R0FFRCxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ2hCOztDQUVELFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7R0FDbEIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLE9BQU8sQ0FBQyxDQUFDO0VBQ1Y7O0NBRUQsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtHQUN4QixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQztHQUNyQyxJQUFJLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7T0FDckIsS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSztPQUMxQixJQUFJLEdBQUcsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7R0FDbEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXO0tBQ3ZCLEdBQUc7T0FDRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtXQUN0QixHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVc7V0FDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7TUFDdEMsUUFBUSxNQUFNLEtBQUssQ0FBQyxFQUFFO0tBQ3ZCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztHQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztHQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUNsQixJQUFJLEtBQUssRUFBRTtLQUNULElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFFO0lBQ2pEO0dBQ0QsT0FBTyxJQUFJLENBQUM7RUFDYjs7Q0FFRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO0dBQzVCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0VBQ3ZCLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRTtHQUMvQixNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3JDLE1BQU07R0FDTCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztFQUN2Qjs7RUFFQTtHQUNDRCxjQUFJO0dBQ0osQUFBK0IsTUFBTTtHQUNyQyxDQUFDLE9BQU9DLFNBQU0sS0FBSyxVQUFVLEFBQVU7RUFDeEMsQ0FBQzs7OztDQy9GRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQSxDQUFDLFNBQVMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0NBRWxDLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRTtHQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7OztHQUdkLEVBQUUsQ0FBQyxJQUFJLEdBQUcsV0FBVztLQUNuQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNSLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7O0tBRTdCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsSUFBSSxDQUFDLENBQUM7O0tBRWhDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ3RCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDYixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNkLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztLQUVkLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7S0FFVCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7R0FFRixTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0tBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxHQUFHLENBQUM7S0FDdkMsSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFOztPQUV2QixDQUFDLEdBQUcsSUFBSSxDQUFDO09BQ1QsSUFBSSxHQUFHLElBQUksQ0FBQztNQUNiLE1BQU07O09BRUwsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7T0FDbkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNOLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7TUFDdEM7O0tBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztPQUVuQyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztPQUV2RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNuQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDWixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtTQUNWLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO1NBQ3pCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUI7TUFDRjs7S0FFRCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUU7T0FDWixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDMUM7Ozs7S0FJRCxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO09BQzVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO09BQ3RCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQzNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDYixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDZDs7S0FFRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVjs7R0FFRCxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ2hCOztDQUVELFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7R0FDbEIsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1YsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ1YsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2xCLE9BQU8sQ0FBQyxDQUFDO0VBQ1Y7Q0FFRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0dBQ3hCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQztPQUNyQixLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLO09BQzFCLElBQUksR0FBRyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQztHQUNsRSxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVc7S0FDdkIsR0FBRztPQUNELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1dBQ3RCLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksV0FBVztXQUNyQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztNQUN0QyxRQUFRLE1BQU0sS0FBSyxDQUFDLEVBQUU7S0FDdkIsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0dBQ0YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0dBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0dBQ2xCLElBQUksS0FBSyxFQUFFO0tBQ1QsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUU7SUFDakQ7R0FDRCxPQUFPLElBQUksQ0FBQztFQUNiOztDQUVELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7R0FDNUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7RUFDdkIsTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0dBQy9CLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDckMsTUFBTTtHQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0VBQ3JCOztFQUVBO0dBQ0NELGNBQUk7R0FDSixBQUErQixNQUFNO0dBQ3JDLENBQUMsT0FBT0MsU0FBTSxLQUFLLFVBQVUsQUFBVTtFQUN4QyxDQUFDOzs7O0NDakpGOzs7O0NBSUEsQ0FBQyxTQUFTLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFOztDQUVsQyxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUU7R0FDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFLE9BQU8sR0FBRyxFQUFFLENBQUM7OztHQUc1QixFQUFFLENBQUMsSUFBSSxHQUFHLFdBQVc7S0FDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMzQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDOUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkYsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztHQUN0QixFQUFFLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQzs7R0FFbEIsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTs7S0FFN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDO0tBQ2hDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNqQixNQUFNOztLQUVMLE9BQU8sSUFBSSxJQUFJLENBQUM7SUFDakI7OztHQUdELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUM1QyxFQUFFLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNYO0VBQ0Y7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtHQUNsQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixPQUFPLENBQUMsQ0FBQztFQUNWO0NBRUQsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtHQUN4QixJQUFJLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7T0FDckIsS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSztPQUMxQixJQUFJLEdBQUcsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7R0FDbEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXO0tBQ3ZCLEdBQUc7T0FDRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtXQUN0QixHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVc7V0FDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7TUFDdEMsUUFBUSxNQUFNLEtBQUssQ0FBQyxFQUFFO0tBQ3ZCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztHQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztHQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUNsQixJQUFJLEtBQUssRUFBRTtLQUNULElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRTtJQUNqRDtHQUNELE9BQU8sSUFBSSxDQUFDO0VBQ2I7O0NBRUQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtHQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztFQUN2QixNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7R0FDL0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyQyxNQUFNO0dBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDcEI7O0VBRUE7R0FDQ0QsY0FBSTtHQUNKLEFBQStCLE1BQU07R0FDckMsQ0FBQyxPQUFPQyxTQUFNLEtBQUssVUFBVSxBQUFVO0VBQ3hDLENBQUM7Ozs7Q0NwR0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXdCQSxDQUFDLFVBQVUsSUFBSSxFQUFFLElBQUksRUFBRTs7Ozs7OztDQU92QixJQUFJLE1BQU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLE1BQU0sQ0FBQztLQUMxQixLQUFLLEdBQUcsR0FBRztLQUNYLE1BQU0sR0FBRyxDQUFDO0tBQ1YsTUFBTSxHQUFHLEVBQUU7S0FDWCxPQUFPLEdBQUcsUUFBUTtLQUNsQixVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0tBQ3BDLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUM7S0FDbEMsUUFBUSxHQUFHLFlBQVksR0FBRyxDQUFDO0tBQzNCLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQztLQUNoQixVQUFVLENBQUM7Ozs7OztDQU1mLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0dBQzNDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztHQUNiLE9BQU8sR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDOzs7R0FHbEUsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU87S0FDNUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7O0dBRy9DLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7O0dBSXpCLElBQUksSUFBSSxHQUFHLFdBQVc7S0FDcEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7U0FDbEIsQ0FBQyxHQUFHLFVBQVU7U0FDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1YsT0FBTyxDQUFDLEdBQUcsWUFBWSxFQUFFO09BQ3ZCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO09BQ3BCLENBQUMsSUFBSSxLQUFLLENBQUM7T0FDWCxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNmO0tBQ0QsT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO09BQ3BCLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDUCxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ1AsQ0FBQyxNQUFNLENBQUMsQ0FBQztNQUNWO0tBQ0QsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCLENBQUM7O0dBRUYsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFFO0dBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRTtHQUMzRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7O0dBR25CLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7R0FHL0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksUUFBUTtPQUM1QixTQUFTLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtTQUN4QyxJQUFJLEtBQUssRUFBRTs7V0FFVCxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7O1dBRW5DLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFFO1VBQ25EOzs7O1NBSUQsSUFBSSxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsRUFBRTs7OztjQUluRCxPQUFPLElBQUksQ0FBQztRQUNsQjtHQUNMLElBQUk7R0FDSixTQUFTO0dBQ1QsUUFBUSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUM7R0FDckQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2hCO0NBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUM7Ozs7Ozs7Ozs7OztDQVlwQyxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUU7R0FDakIsSUFBSSxDQUFDLEVBQUUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNO09BQ3RCLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7OztHQUd6RCxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFOzs7R0FHbEMsT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFO0tBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNaO0dBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7S0FDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWOzs7R0FHRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxLQUFLLEVBQUU7O0tBRXRCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ1IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDakMsT0FBTyxLQUFLLEVBQUUsRUFBRTtPQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDekU7S0FDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ25CLE9BQU8sQ0FBQyxDQUFDOzs7O0lBSVYsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNYOzs7Ozs7Q0FNRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNsQixPQUFPLENBQUMsQ0FBQztFQUNWOzs7OztDQU1ELFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7R0FDM0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxFQUFFLEdBQUcsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztHQUMxQyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksUUFBUSxFQUFFO0tBQzVCLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRTtPQUNoQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO01BQ2pFO0lBQ0Y7R0FDRCxRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLEdBQUcsSUFBSSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUU7RUFDdEU7Ozs7Ozs7Q0FPRCxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0dBQ3pCLElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDekMsT0FBTyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRTtLQUM1QixHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztPQUNYLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RTtHQUNELE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3RCOzs7Ozs7O0NBT0QsU0FBUyxRQUFRLEdBQUc7R0FDbEIsSUFBSTtLQUNGLElBQUksR0FBRyxDQUFDO0tBQ1IsSUFBSSxVQUFVLEtBQUssR0FBRyxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTs7T0FFaEQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUNsQixNQUFNO09BQ0wsR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzVCLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUN6RDtLQUNELE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEVBQUU7S0FDVixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsU0FBUztTQUMxQixPQUFPLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUM7S0FDekMsT0FBTyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BFO0VBQ0Y7Ozs7OztDQU1ELFNBQVMsUUFBUSxDQUFDLENBQUMsRUFBRTtHQUNuQixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN4Qzs7Ozs7Ozs7O0NBU0QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0NBTTVCLElBQUksQUFBK0IsTUFBTSxDQUFDLE9BQU8sRUFBRTtHQUNqRCxjQUFjLEdBQUcsVUFBVSxDQUFDOztHQUU1QixJQUFJO0tBQ0YsVUFBVSxHQUFHQyxNQUFpQixDQUFDO0lBQ2hDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRTtFQUNoQixBQUVBOzs7RUFHQTtHQUNDLEVBQUU7R0FDRixJQUFJO0VBQ0wsQ0FBQzs7O0NDelBGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0RBQyxXQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNmQSxXQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNuQkEsV0FBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbkJBLFdBQUUsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0FBQ3pCQSxXQUFFLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztBQUNyQkEsV0FBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7O0NBRW5CLGdCQUFjLEdBQUdBLFVBQUUsQ0FBQzs7Q0MxRHBCLG1CQUFjLEdBQUcsR0FBRyxJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztDQ0EzSCxJQUFJLEtBQUssR0FBRyxjQUFjLENBQUM7Q0FDM0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzVDLElBQUksWUFBWSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDOztDQUV4RCxTQUFTLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUU7RUFDNUMsSUFBSTs7R0FFSCxPQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUMvQyxDQUFDLE9BQU8sR0FBRyxFQUFFOztHQUViOztFQUVELElBQUksVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7R0FDNUIsT0FBTyxVQUFVLENBQUM7R0FDbEI7O0VBRUQsS0FBSyxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUM7OztFQUduQixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUN0QyxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOztFQUVwQyxPQUFPLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUN4Rjs7Q0FFRCxTQUFTLE1BQU0sQ0FBQyxLQUFLLEVBQUU7RUFDdEIsSUFBSTtHQUNILE9BQU8sa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDakMsQ0FBQyxPQUFPLEdBQUcsRUFBRTtHQUNiLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7O0dBRXhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3ZDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUU3QyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwQzs7R0FFRCxPQUFPLEtBQUssQ0FBQztHQUNiO0VBQ0Q7O0NBRUQsU0FBUyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUU7O0VBRXhDLElBQUksVUFBVSxHQUFHO0dBQ2hCLFFBQVEsRUFBRSxjQUFjO0dBQ3hCLFFBQVEsRUFBRSxjQUFjO0dBQ3hCLENBQUM7O0VBRUYsSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNyQyxPQUFPLEtBQUssRUFBRTtHQUNiLElBQUk7O0lBRUgsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUMsT0FBTyxHQUFHLEVBQUU7SUFDYixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRTlCLElBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtLQUN4QixVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0tBQzlCO0lBQ0Q7O0dBRUQsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDakM7OztFQUdELFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUM7O0VBRTdCLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0VBRXRDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztHQUV4QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDckIsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdEOztFQUVELE9BQU8sS0FBSyxDQUFDO0VBQ2I7O0NBRUQsc0JBQWMsR0FBRyxVQUFVLFVBQVUsRUFBRTtFQUN0QyxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtHQUNuQyxNQUFNLElBQUksU0FBUyxDQUFDLHFEQUFxRCxHQUFHLE9BQU8sVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0dBQ3JHOztFQUVELElBQUk7R0FDSCxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7OztHQUc1QyxPQUFPLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQ3RDLENBQUMsT0FBTyxHQUFHLEVBQUU7O0dBRWIsT0FBTyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM1QztFQUNELENBQUM7O0NDM0ZGLGdCQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxLQUFLO0VBQ3ZDLElBQUksRUFBRSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLEVBQUU7R0FDbkUsTUFBTSxJQUFJLFNBQVMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0dBQ3JFOztFQUVELElBQUksU0FBUyxLQUFLLEVBQUUsRUFBRTtHQUNyQixPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDaEI7O0VBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs7RUFFakQsSUFBSSxjQUFjLEtBQUssQ0FBQyxDQUFDLEVBQUU7R0FDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hCOztFQUVELE9BQU87R0FDTixNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUM7R0FDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztHQUMvQyxDQUFDO0VBQ0YsQ0FBQzs7Q0NoQkYsU0FBUyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUU7RUFDdkMsUUFBUSxPQUFPLENBQUMsV0FBVztHQUMxQixLQUFLLE9BQU87SUFDWCxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEtBQUs7S0FDaEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUM1QixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7TUFDeEIsT0FBTyxNQUFNLENBQUM7TUFDZDs7S0FFRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7TUFDbkIsT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ3JFOztLQUVELE9BQU87TUFDTixHQUFHLE1BQU07TUFDVCxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO01BQzFGLENBQUM7S0FDRixDQUFDOztHQUVILEtBQUssU0FBUztJQUNiLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssS0FBSztLQUNoQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7TUFDeEIsT0FBTyxNQUFNLENBQUM7TUFDZDs7S0FFRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7TUFDbkIsT0FBTyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUMxRDs7S0FFRCxPQUFPLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDbkYsQ0FBQzs7R0FFSCxLQUFLLE9BQU87SUFDWCxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxLQUFLO0tBQ3ZDLElBQUksQ0FBQyxLQUFLLEVBQUU7TUFDWCxPQUFPLE1BQU0sQ0FBQztNQUNkOztLQUVELElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtNQUNoQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7TUFDdEU7O0tBRUQsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNwRCxDQUFDOztHQUVIO0lBQ0MsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxLQUFLO0tBQ2hDLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtNQUN4QixPQUFPLE1BQU0sQ0FBQztNQUNkOztLQUVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtNQUNuQixPQUFPLENBQUMsR0FBRyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO01BQ3pDOztLQUVELE9BQU8sQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNqRixDQUFDO0dBQ0g7RUFDRDs7Q0FFRCxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFBRTtFQUN0QyxJQUFJLE1BQU0sQ0FBQzs7RUFFWCxRQUFRLE9BQU8sQ0FBQyxXQUFXO0dBQzFCLEtBQUssT0FBTztJQUNYLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsS0FBSztLQUNuQyxNQUFNLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7S0FFaEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztLQUVsQyxJQUFJLENBQUMsTUFBTSxFQUFFO01BQ1osV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUN6QixPQUFPO01BQ1A7O0tBRUQsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxFQUFFO01BQ25DLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7TUFDdEI7O0tBRUQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNwQyxDQUFDOztHQUVILEtBQUssU0FBUztJQUNiLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsS0FBSztLQUNuQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3QixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7O0tBRS9CLElBQUksQ0FBQyxNQUFNLEVBQUU7TUFDWixXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ3pCLE9BQU87TUFDUDs7S0FFRCxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDM0IsT0FBTztNQUNQOztLQUVELFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN0RCxDQUFDOztHQUVILEtBQUssT0FBTztJQUNYLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsS0FBSztLQUNuQyxNQUFNLE9BQU8sR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDL0UsTUFBTSxRQUFRLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQ3BELFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7S0FDNUIsQ0FBQzs7R0FFSDtJQUNDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFdBQVcsS0FBSztLQUNuQyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUU7TUFDbkMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUN6QixPQUFPO01BQ1A7O0tBRUQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3RELENBQUM7R0FDSDtFQUNEOztDQUVELFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7RUFDL0IsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO0dBQ25CLE9BQU8sT0FBTyxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDM0U7O0VBRUQsT0FBTyxLQUFLLENBQUM7RUFDYjs7Q0FFRCxTQUFTQyxRQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRTtFQUMvQixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7R0FDbkIsT0FBT0Msa0JBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUM5Qjs7RUFFRCxPQUFPLEtBQUssQ0FBQztFQUNiOztDQUVELFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRTtFQUMxQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7R0FDekIsT0FBTyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDcEI7O0VBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7R0FDOUIsT0FBTyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckMsR0FBRyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUN6Qjs7RUFFRCxPQUFPLEtBQUssQ0FBQztFQUNiOztDQUVELFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRTtFQUN2QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3RDLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFO0dBQ3RCLE9BQU8sRUFBRSxDQUFDO0dBQ1Y7O0VBRUQsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztFQUNuQzs7Q0FFRCxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFO0VBQzlCLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO0dBQ3ZCLE1BQU0sRUFBRSxJQUFJO0dBQ1osV0FBVyxFQUFFLE1BQU07R0FDbkIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7RUFFWixNQUFNLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0VBR2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRWhDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0dBQzlCLE9BQU8sR0FBRyxDQUFDO0dBQ1g7O0VBRUQsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztFQUUzQyxJQUFJLENBQUMsS0FBSyxFQUFFO0dBQ1gsT0FBTyxHQUFHLENBQUM7R0FDWDs7RUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7R0FDckMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7R0FJaEUsS0FBSyxHQUFHLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHRCxRQUFNLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztHQUU1RCxTQUFTLENBQUNBLFFBQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzVDOztFQUVELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxLQUFLO0dBQ3RELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN2QixJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFOztJQUV6RSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLE1BQU07SUFDTixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3BCOztHQUVELE9BQU8sTUFBTSxDQUFDO0dBQ2QsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDeEI7O0NBRUQsYUFBZSxHQUFHLE9BQU8sQ0FBQztDQUMxQixXQUFhLEdBQUcsS0FBSyxDQUFDOztDQUV0QixhQUFpQixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sS0FBSztFQUN4QyxJQUFJLENBQUMsTUFBTSxFQUFFO0dBQ1osT0FBTyxFQUFFLENBQUM7R0FDVjs7RUFFRCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztHQUN2QixNQUFNLEVBQUUsSUFBSTtHQUNaLE1BQU0sRUFBRSxJQUFJO0dBQ1osV0FBVyxFQUFFLE1BQU07R0FDbkIsRUFBRSxPQUFPLENBQUMsQ0FBQzs7RUFFWixNQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUNqRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztFQUVqQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO0dBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3hCOztFQUVELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUk7R0FDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztHQUUxQixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7SUFDeEIsT0FBTyxFQUFFLENBQUM7SUFDVjs7R0FFRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7SUFDbkIsT0FBTyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVCOztHQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN6QixPQUFPLEtBQUs7TUFDVixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztNQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWjs7R0FFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDM0QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkMsQ0FBQzs7Q0FFRixZQUFnQixHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sS0FBSztFQUN0QyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3JDLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFO0dBQ3JCLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztHQUNsQzs7RUFFRCxPQUFPO0dBQ04sR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTtHQUM5QixLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUM7R0FDckMsQ0FBQztFQUNGLENBQUM7Ozs7Ozs7OztDQ25RRjtDQUNBLFNBQVMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtDQUM1QyxFQUFFLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0NBQzdDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQ2xDLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0NBQ2pDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7Q0FDM0IsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQztDQUM1QixFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDaEIsQ0FBQzs7QUFFRCxDQUFPLE1BQU0sYUFBYSxDQUFDO0NBQzNCLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUU7Q0FDaEMsSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztDQUMzQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNqQixJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztDQUNqQyxHQUFHOztDQUVILEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRTtDQUNyQixJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ3RDLElBQUksSUFBSSxVQUFVLEVBQUU7Q0FDcEIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDbkIsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0NBQzNCLEdBQUc7Q0FDSDtDQUNBO0NBQ0E7Q0FDQTtDQUNBOztDQUVBLEVBQUUsS0FBSyxHQUFHO0NBQ1YsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztDQUN6QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0NBQ3JCLEdBQUc7O0NBRUgsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUU7Q0FDcEMsSUFBSSxJQUFJLFNBQVMsR0FBRztDQUNwQixNQUFNLElBQUk7Q0FDVixNQUFNLEtBQUs7Q0FDWCxNQUFNLFVBQVU7Q0FDaEIsS0FBSyxDQUFDOztDQUVOLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRTtDQUM5QixNQUFNLFNBQVMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Q0FDekQsS0FBSyxNQUFNO0NBQ1gsTUFBTSxTQUFTLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7Q0FDL0MsS0FBSzs7Q0FFTCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQ2hDLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFO0NBQ3ZDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztDQUMvQyxLQUFLO0NBQ0wsR0FBRztDQUNIO0NBQ0EsRUFBRSxlQUFlLEdBQUc7Q0FDcEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUk7Q0FDdEQsTUFBTSxJQUFJLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUNqRixLQUFLLENBQUMsQ0FBQztDQUNQO0NBQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUk7Q0FDcEQsTUFBTSxJQUFJLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUMvRSxLQUFLLENBQUMsQ0FBQztDQUNQO0NBQ0EsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUk7Q0FDdEQsTUFBTSxJQUFJLEdBQUcsR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7Q0FFakYsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJO0NBQ2xELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFO0NBQ3RDLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO0NBQzFCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO0NBQzFCLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO0NBQzFCLFFBQVEsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO0NBQ2hDLE9BQU8sQ0FBQyxDQUFDO0NBQ1QsS0FBSyxDQUFDLENBQUM7Q0FDUDtDQUNBLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxHQUFHLElBQUk7Q0FDOUMsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7Q0FDbkMsUUFBUSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87Q0FDNUIsUUFBUSxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVE7Q0FDOUIsUUFBUSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7Q0FDcEIsT0FBTyxDQUFDLENBQUM7Q0FDVCxLQUFLLENBQUMsQ0FBQztDQUNQO0NBQ0EsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSTtDQUM1QyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRTtDQUNqQyxRQUFRLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztDQUM1QixRQUFRLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtDQUM5QixRQUFRLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRztDQUNwQixPQUFPLENBQUMsQ0FBQztDQUNULEtBQUssQ0FBQyxDQUFDO0NBQ1AsR0FBRztDQUNIOztFQUFDLERDL0ZELE1BQU0sZUFBZSxHQUFHO0NBQ3hCLEVBQUUsdUJBQXVCLEVBQUUsSUFBSTtDQUMvQixFQUFFLHlCQUF5QixFQUFFLElBQUk7Q0FDakMsRUFBRSxtQ0FBbUMsRUFBRSxLQUFLO0NBQzVDLENBQUMsQ0FBQzs7O0FBR0YsQ0FBTyxNQUFNLGFBQWEsQ0FBQztDQUMzQixFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLE9BQU8sRUFBRTtDQUNyRSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0NBQy9ELElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Q0FDM0IsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztDQUMvQixJQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0NBQzFCLElBQUksSUFBSSxDQUFDLHdCQUF3QixHQUFHLHdCQUF3QixDQUFDO0NBQzdELEdBQUc7O0NBRUgsRUFBRSxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUU7Q0FDckIsSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Q0FDcEQsTUFBTSxPQUFPO0NBQ2IsS0FBSzs7Q0FFTCxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxHQUFHLFdBQVcsRUFBRTtDQUNyRSxNQUFNLE9BQU87Q0FDYixLQUFLOztDQUVMLElBQUksT0FBTyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7Q0FDdkgsTUFBTSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUN0RCxNQUFNLFFBQVEsS0FBSyxDQUFDLElBQUk7Q0FDeEIsUUFBUSxLQUFLLE9BQU8sRUFBRTtDQUN0QixVQUFVLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxPQUFPLEVBQUU7Q0FDdkMsWUFBWSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDcEUsV0FBVyxNQUFNO0NBQ2pCLFlBQVksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUM5RixXQUFXO0NBQ1gsU0FBUyxDQUFDLE1BQU07Q0FDaEIsUUFBUSxLQUFLLEtBQUssRUFBRTtDQUNwQixVQUFVLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDMUYsU0FBUyxDQUFDLE1BQU07Q0FDaEIsUUFBUSxTQUFTO0NBQ2pCLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDakUsU0FBUztDQUNULE9BQU87Q0FDUCxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztDQUMxQixLQUFLO0NBQ0wsR0FBRzs7Q0FFSCxFQUFFLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUU7Q0FDMUMsSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Q0FFckQsSUFBSSxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUM7Q0FDbkMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7Q0FDakMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7Q0FDakMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7O0NBRWpDLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0NBQ3RDLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0NBQ3RDLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDOztDQUVyQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztDQUN2QyxJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO0NBQ2hHLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDcEUsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0NBQzdELFFBQVEsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztDQUN6RCxRQUFRLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7Q0FDNUQsUUFBUSxJQUFJLElBQUksSUFBSSxTQUFTLEVBQUU7Q0FDL0IsVUFBVSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNsQyxTQUFTO0NBQ1QsT0FBTztDQUNQLEtBQUs7Q0FDTCxTQUFTO0NBQ1QsTUFBTSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQy9CLEtBQUs7Q0FDTCxHQUFHOztDQUVILEVBQUUsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7Q0FDbkQ7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0EsSUFBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsaUJBQWlCLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztDQUN2RyxJQUFJLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRTtDQUNyQixNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN6QyxLQUFLOztDQUVMLElBQUksQ0FBQyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0NBQ25DLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0NBQ2pDLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO0NBQ3JDLElBQUksQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Q0FDMUIsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUM7O0NBRTNCO0NBQ0EsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRTtDQUM5RixNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0NBQ3BFLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztDQUM3RCxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDekQsUUFBUSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0NBQzVELFFBQVEsSUFBSSxJQUFJLElBQUksU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQ3ZELE9BQU87Q0FDUCxLQUFLLE1BQU07Q0FDWDtDQUNBLE1BQU0sT0FBTyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNoRyxLQUFLO0NBQ0wsR0FBRzs7Q0FFSDtDQUNBO0NBQ0EsRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTtDQUNyRDtDQUNBLElBQUksSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztDQUN6QixJQUFJLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0NBRXpCLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUM7Q0FDN0IsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQztDQUM5QixJQUFJLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztDQUUvQztDQUNBLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztDQUNsQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7Q0FDakMsSUFBSSxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0NBQ2hELElBQUksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNO0NBQ2xELG9CQUFvQixTQUFTLElBQUksV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUNoRSxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM5QixvQkFBb0IsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztDQUM3QyxJQUFJLENBQUMsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztDQUUxQixJQUFJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO0NBQ2hHO0NBQ0E7Q0FDQTtDQUNBLE1BQU0sSUFBSSxPQUFPLENBQUMsV0FBVyxJQUFJLE9BQU8sQ0FBQyxXQUFXO0NBQ3BELFdBQVcsT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsWUFBWSxFQUFFO0NBQ3pELFFBQVEsTUFBTSw4RUFBOEUsQ0FBQztDQUM3RixPQUFPO0NBQ1AsTUFBTSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtDQUNwRSxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDN0QsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0NBQ3pELFFBQVEsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztDQUM1RCxRQUFRLElBQUksSUFBSSxJQUFJLFNBQVMsRUFBRTtDQUMvQixVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRTtDQUNoRTtDQUNBO0NBQ0E7Q0FDQSxZQUFZLElBQUksR0FBRyxHQUFHO0NBQ3RCLGNBQWMsYUFBYSxFQUFFLEtBQUs7Q0FDbEMsY0FBYyxVQUFVLEVBQUUsS0FBSztDQUMvQixjQUFjLE1BQU0sRUFBRSxLQUFLO0NBQzNCLGNBQWMsV0FBVyxFQUFFLEtBQUs7Q0FDaEMsY0FBYyxTQUFTLEVBQUUsS0FBSztDQUM5QixjQUFjLFVBQVUsRUFBRSxDQUFDO0NBQzNCLGNBQWMsT0FBTyxFQUFFLENBQUMsU0FBUyxJQUFJLFdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQztDQUN6RCxjQUFjLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtDQUM5QixjQUFjLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTTtDQUM5QixjQUFjLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztDQUNoQyxjQUFjLFlBQVksRUFBRSxDQUFDLENBQUMsWUFBWTtDQUMxQyxjQUFjLFVBQVUsRUFBRSxDQUFDLENBQUMsVUFBVTtDQUN0QyxjQUFjLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztDQUNoQyxjQUFjLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztDQUNoQyxjQUFjLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTztDQUNoQyxjQUFjLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxnQkFBZ0I7Q0FDbEQsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Q0FDOUIsY0FBYyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVU7Q0FDdEMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7Q0FDcEMsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Q0FDOUIsY0FBYyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07Q0FDOUIsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7Q0FDcEMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVM7Q0FDcEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7Q0FDNUIsY0FBYyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7Q0FDNUIsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7Q0FDMUIsY0FBYyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGFBQWE7Q0FDNUMsY0FBYyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Q0FDeEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU87Q0FDaEMsY0FBYyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVE7Q0FDbEMsY0FBYyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsa0JBQWtCO0NBQ3RELGNBQWMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Q0FDMUMsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7Q0FDMUIsY0FBYyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7Q0FDMUIsY0FBYyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7Q0FDNUIsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEIsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEIsYUFBYSxDQUFDO0NBQ2QsWUFBWSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN0QyxXQUFXLE1BQU07Q0FDakI7Q0FDQTtDQUNBLFlBQVksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsV0FBVztDQUNYLFNBQVM7Q0FDVCxPQUFPO0NBQ1AsS0FBSyxNQUFNO0NBQ1g7Q0FDQSxNQUFNLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDL0IsS0FBSztDQUNMLEdBQUc7Q0FDSCxDQUFDOztDQ3pNYyxNQUFNLG9CQUFvQixDQUFDO0NBQzFDLEVBQUUsV0FBVyxHQUFHO0NBQ2hCLElBQUksSUFBSSxDQUFDLHdCQUF3QixHQUFHLEVBQUUsQ0FBQztDQUN2QyxHQUFHOztDQUVIO0NBQ0EsRUFBRSxzQkFBc0IsR0FBRztDQUMzQjtDQUNBO0NBQ0E7Q0FDQSxJQUFJLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztDQUM1RCxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztDQUNoRCxJQUFJLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztDQUM1QyxJQUFJLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztDQUM5QyxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztDQUNwRCxJQUFJLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztDQUNwRCxHQUFHOztDQUVILEVBQUUsc0JBQXNCLEdBQUc7Q0FDM0IsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtDQUNoRCxNQUFNLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0RCxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUM3RixLQUFLO0NBQ0wsSUFBSSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsRUFBRSxDQUFDO0NBQ3ZDO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7Q0FDbEMsR0FBRzs7Q0FFSDtDQUNBLEVBQUUsTUFBTSxHQUFHOztDQUVYO0NBQ0E7Q0FDQSxJQUFJLElBQUksc0JBQXNCLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVc7Q0FDckUsTUFBTSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTztDQUN6RCxNQUFNLG1CQUFtQixFQUFFLGtCQUFrQixFQUFFLHlCQUF5QixFQUFFLHdCQUF3QixFQUFFLHNCQUFzQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUFFLG1CQUFtQjtDQUN6TyxNQUFNLGNBQWMsRUFBRSxtQkFBbUI7Q0FDekMsTUFBTSxZQUFZLEVBQUUsWUFBWTtDQUNoQyxNQUFNLFlBQVksRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLGFBQWE7Q0FDMUUsTUFBTSxNQUFNLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsT0FBTztDQUM1RSxNQUFNLFVBQVUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCO0NBQzVGLE1BQU0sa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CO0NBQ3hGLE1BQU0sb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCO0NBQ2xHLE1BQU0sWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsYUFBYTtDQUMxRCxNQUFNLGtCQUFrQixFQUFFLHNCQUFzQjtDQUNoRCxNQUFNLFdBQVcsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxDQUFDOztDQUV6RztDQUNBO0NBQ0E7Q0FDQTs7Q0FFQTtDQUNBLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ3BCLElBQUksSUFBSSx5QkFBeUIsR0FBRyxLQUFLLENBQUM7Q0FDMUMsSUFBSSxJQUFJLHVCQUF1QixHQUFHLEtBQUssQ0FBQztDQUN4QyxJQUFJLFNBQVMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTtDQUNoRCxNQUFNLElBQUksb0JBQW9CLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFDO0NBQ3RELE1BQU0sR0FBRyxDQUFDLGdCQUFnQixHQUFHLFNBQVMsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7Q0FDbEUsUUFBUSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztDQUN0QyxRQUFRLElBQUksc0JBQXNCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO0NBQ3hELFVBQVUsSUFBSSxxQkFBcUI7Q0FDbkMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUkseUJBQXlCO0NBQ3pFLGdCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLHVCQUF1QixDQUFDLENBQUM7Q0FDdkUsVUFBVSxJQUFJLHFCQUFxQixHQUFHLFNBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQztDQUMzSDtDQUNBLFVBQVUsSUFBSSxxQkFBcUIsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDekgsVUFBVSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDO0NBQzdDLFlBQVksT0FBTyxFQUFFLE9BQU8sSUFBSSxJQUFJO0NBQ3BDLFlBQVksSUFBSSxFQUFFLElBQUk7Q0FDdEIsWUFBWSxHQUFHLEVBQUUscUJBQXFCO0NBQ3RDLFlBQVksVUFBVSxFQUFFLFVBQVU7Q0FDbEMsV0FBVyxDQUFDLENBQUM7Q0FDYixTQUFTLE1BQU07Q0FDZixVQUFVLG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDakYsVUFBVSxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDO0NBQzdDLFlBQVksT0FBTyxFQUFFLE9BQU8sSUFBSSxJQUFJO0NBQ3BDLFlBQVksSUFBSSxFQUFFLElBQUk7Q0FDdEIsWUFBWSxHQUFHLEVBQUUsUUFBUTtDQUN6QixZQUFZLFVBQVUsRUFBRSxVQUFVO0NBQ2xDLFdBQVcsQ0FBQyxDQUFDO0NBQ2IsU0FBUztDQUNULFFBQU87O0NBRVAsTUFBTSxJQUFJLHVCQUF1QixHQUFHLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQzs7Q0FFNUQsTUFBTSxHQUFHLENBQUMsbUJBQW1CLEdBQUcsU0FBUyxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRTtDQUNyRTtDQUNBO0NBQ0EsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtDQUN2RSxVQUFVLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMvRCxVQUFVLElBQUksYUFBYSxDQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7Q0FDL0csWUFBWSxJQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUN2RCxXQUFXO0NBQ1gsU0FBUztDQUNUO0NBQ0EsUUFBTztDQUNQLEtBQUs7Q0FDTCxJQUFJLElBQUksT0FBTyxXQUFXLEtBQUssV0FBVyxFQUFFO0NBQzVDLE1BQU0sb0JBQW9CLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUN4RCxLQUFLLEFBUUE7Q0FDTCxHQUFHO0NBQ0g7O0VBQUM7Q0NuSEQsQ0FBQyxVQUFVLE1BQU0sRUFBRSxPQUFPLEVBQUU7R0FDMUIsQUFBK0QsY0FBYyxHQUFHLE9BQU8sRUFBRSxBQUU5RCxDQUFDO0VBQzdCLENBQUNKLGNBQUksR0FBRyxZQUFZO0dBRW5CLE1BQU0sZUFBZSxHQUFHO0tBQ3RCLFFBQVEsRUFBRSxFQUFFO0tBQ1osY0FBYyxFQUFFLEdBQUc7S0FDbkIsV0FBVyxFQUFFLElBQUk7S0FDakIsWUFBWSxFQUFFLElBQUk7S0FDbEIsVUFBVSxFQUFFLE1BQU07S0FDbEIsU0FBUyxFQUFFLE1BQU07S0FDakIsYUFBYSxFQUFFLElBQUk7S0FDbkIsVUFBVSxFQUFFLElBQUk7S0FDaEIsZUFBZSxFQUFFO09BQ2YsSUFBSSxFQUFFLElBQUk7T0FDVixHQUFHLEVBQUUsSUFBSTtPQUNULEtBQUssRUFBRSxLQUFLO01BQ2I7S0FDRCxRQUFRLEVBQUUsYUFBYTtJQUN4QixDQUFDO0dBQ0YsTUFBTSxtQkFBbUIsQ0FBQztLQUN4QixXQUFXLEdBQUc7T0FDWixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztPQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztPQUN0QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztPQUNsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO09BQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO09BQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUNwQztLQUNELE9BQU8sR0FBRztPQUNSLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRTtTQUN4QixJQUFJLElBQUksRUFBRTtXQUNSLFNBQVM7V0FDVCxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztVQUNuQztRQUNGO09BQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMzQixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3ZCLFlBQVksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztPQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztPQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO09BQ25DLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3BELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQ2pEO0tBQ0QsZ0JBQWdCLEdBQUc7T0FDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7T0FDeEMsTUFBTSxTQUFTLEdBQUc7U0FDaEIsYUFBYSxFQUFFLHFCQUFxQjtTQUNwQyxjQUFjLEVBQUUsc0JBQXNCO1NBQ3RDLFVBQVUsRUFBRSxrQkFBa0I7U0FDOUIsV0FBVyxFQUFFLG1CQUFtQjtRQUNqQyxDQUFDO09BQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1NBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpREFBaUQsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUNwSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyxhQUFhLENBQUM7UUFDdkM7T0FDRCxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQzs7OztRQUl0QixFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7OzswQkFLakIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQzs7ZUFFckMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQzs7Ozs7bUJBS3JCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7O29DQUVQLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7NEJBQ3BDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUM7T0FDakQsQ0FBQyxDQUFDO09BQ0gsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQ3ZDO0tBQ0Qsa0JBQWtCLENBQUMsR0FBRyxFQUFFO09BQ3RCLE1BQU0sZ0JBQWdCLEdBQUc7U0FDdkIsWUFBWSxFQUFFLEdBQUc7U0FDakIsV0FBVyxFQUFFLEdBQUc7U0FDaEIsU0FBUyxFQUFFLEdBQUc7U0FDZCxXQUFXLEVBQUUsR0FBRztTQUNoQixHQUFHLEVBQUUsR0FBRztTQUNSLE9BQU8sRUFBRSxHQUFHO1NBQ1osT0FBTyxFQUFFLEdBQUc7U0FDWixZQUFZLEVBQUUsR0FBRztTQUNqQixXQUFXLEVBQUUsR0FBRztTQUNoQixTQUFTLEVBQUUsR0FBRztTQUNkLEtBQUssRUFBRSxHQUFHO1NBQ1YsVUFBVSxFQUFFLEdBQUc7UUFDaEIsQ0FBQztPQUNGLE1BQU0sYUFBYSxHQUFHO1NBQ3BCLEtBQUssRUFBRSxHQUFHO1NBQ1YsU0FBUyxFQUFFLEdBQUc7U0FDZCxVQUFVLEVBQUUsR0FBRztTQUNmLFFBQVEsRUFBRSxHQUFHO1NBQ2IsUUFBUSxFQUFFLEdBQUc7U0FDYixXQUFXLEVBQUUsR0FBRztTQUNoQixNQUFNLEVBQUUsR0FBRztTQUNYLEtBQUssRUFBRSxHQUFHO1NBQ1YsVUFBVSxFQUFFLEdBQUc7U0FDZixRQUFRLEVBQUUsR0FBRztTQUNiLE1BQU0sRUFBRSxHQUFHO1NBQ1gsS0FBSyxFQUFFLEdBQUc7UUFDWCxDQUFDO09BQ0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUssVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO01BQ3hHO0tBQ0QsT0FBTyxDQUFDLENBQUMsRUFBRTtPQUNULElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO1NBQ3RCLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqRCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0M7T0FDRCxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO09BQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUU7U0FDOUIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtXQUNoQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1dBQ2hDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO2FBQ2YsR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QjtVQUNGO1FBQ0Y7T0FDRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7T0FDbEIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE1BQU0sRUFBRTtTQUN0RSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDO09BQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssRUFBRTtTQUNuRSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDO09BQ0QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sRUFBRTtTQUN6RSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDO09BQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztNQUM1RztLQUNELEtBQUssQ0FBQyxDQUFDLEVBQUU7T0FDUCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxPQUFPO09BQy9CLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDM0IsWUFBWSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQ3BDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsTUFBTTtTQUN2QyxDQUFDLFVBQVUsYUFBYSxFQUFFO1dBQ3hCLFVBQVUsQ0FBQyxNQUFNO2FBQ2YsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2FBQ2hDLFVBQVUsQ0FBQyxNQUFNO2VBQ2YsYUFBYSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7Y0FDckQsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDMUIsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7VUFDekIsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDdEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDMUIsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7TUFDNUI7S0FDRCxNQUFNLENBQUMsT0FBTyxFQUFFO09BQ2QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMzRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztPQUN4QixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNqRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUM5QztLQUNELE9BQU8sR0FBRztPQUNSLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUNoQjtJQUNGO0dBQ0QsSUFBSSxLQUFLLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztHQUV0QyxPQUFPLEtBQUssQ0FBQzs7RUFFZCxFQUFFLEVBQUU7OztDQzVLVSxNQUFNLFlBQVksQ0FBQztDQUNsQyxFQUFFLFFBQVEsR0FBRztDQUNiLElBQUlNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQ3ZELEdBQUc7O0NBRUgsRUFBRSxTQUFTLEdBQUc7Q0FDZCxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNsRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQztDQUNoQyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNwRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztDQUNwQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxDQUFDOzs7Ozs7Ozs7OztJQVdqQyxDQUFDLENBQUM7O0NBRU4sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQzs7Ozs7Ozs7O0lBUy9CLENBQUMsQ0FBQztDQUNOO0NBQ0EsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ3RELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Q0FFeEQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDLEdBQUcsS0FBSztDQUN2RCxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztDQUM5QyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7Q0FFN0MsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3JELE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNuRCxLQUFLLENBQUMsQ0FBQzs7Q0FFUCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSTtDQUNyRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7Q0FDbkQsS0FBSyxDQUFDLENBQUM7Q0FDUCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSTtDQUNuRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7Q0FDbEQsS0FBSyxDQUFDLENBQUM7O0NBRVAsR0FBRzs7Q0FFSCxFQUFFLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7Q0FDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztDQUN6QixJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQzFELE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQ3RCLEtBQUs7Q0FDTCxJQUFJLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQzNELE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0NBQ3ZCLEtBQUs7Q0FDTCxHQUFHO0NBQ0g7O0NDakVBLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztDQUMxRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQzs7Q0FFdEQsSUFBSSxZQUFZLEdBQUc7Q0FDbkIsRUFBRSxLQUFLLEVBQUU7Q0FDVCxJQUFJLGVBQWUsRUFBRSxDQUFDO0NBQ3RCLElBQUksYUFBYSxFQUFFLENBQUM7Q0FDcEIsSUFBSSxXQUFXLEVBQUUsQ0FBQztDQUNsQixJQUFJLGVBQWUsRUFBRSxDQUFDO0NBQ3RCLEdBQUc7Q0FDSCxFQUFFLE1BQU0sRUFBRSxVQUFVLElBQUksRUFBRTtDQUMxQixJQUFJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztDQUNwQixJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFdBQVc7Q0FDbkQsTUFBTSxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDdkMsTUFBTSxJQUFJLElBQUksRUFBRTtDQUNoQixRQUFRLElBQUksR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sS0FBSztDQUNuRCxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7Q0FDckUsVUFBVSxPQUFPLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkUsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0NBQ3ZDLFVBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQztDQUMzRCxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUM7Q0FDdkQsT0FBTyxDQUFDLENBQUM7Q0FDVCxPQUFPLE1BQU07Q0FDYixRQUFRLElBQUksT0FBTyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQzNELFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUFLO0NBQ25ELFVBQVUsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUk7Q0FDdEMsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDO0NBQ3ZFLFlBQVksT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0NBQ2pDLFlBQVksSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztDQUN6QyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUM7Q0FDN0QsWUFBWSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDO0NBQ3pELFdBQVcsQ0FBQyxDQUFDO0NBQ2IsU0FBUyxDQUFDLENBQUM7Q0FDWCxPQUFPO0NBQ1AsTUFBTSxPQUFPLEdBQUcsQ0FBQztDQUNqQixNQUFLO0NBQ0wsR0FBRztDQUNILEVBQUUsT0FBTyxFQUFFLFlBQVk7Q0FDdkIsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxhQUFhLENBQUM7Q0FDdEQsR0FBRztDQUNILENBQUMsQ0FBQzs7Q0N4Q0YsSUFBSSxTQUFTLEdBQUc7Q0FDaEIsRUFBRSxRQUFRLEVBQUU7Q0FDWixJQUFJLGFBQWEsRUFBRSxJQUFJO0NBQ3ZCLElBQUksZ0JBQWdCLEVBQUUsSUFBSTtDQUMxQixHQUFHO0NBQ0gsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJO0NBQ3hCLEVBQUUsWUFBWSxFQUFFLEVBQUUsT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLGFBQWEsSUFBSSxNQUFNLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSTtDQUM5RyxFQUFFLE1BQU0sRUFBRSxVQUFVLFFBQVEsRUFBRTtDQUM5QixJQUFJLElBQUksU0FBUyxDQUFDLGFBQWEsRUFBRTtDQUNqQyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0NBQ2hDLE1BQU0sSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO0NBQ25GLE1BQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ3RCLE1BQU0sU0FBUyxDQUFDLGFBQWEsR0FBRyxXQUFXO0NBQzNDLFFBQVEsSUFBSSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztDQUM3RCxRQUFRLE9BQU8sSUFBSSxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxLQUFLO0NBQ2pELFVBQVUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUk7Q0FDbEMsWUFBWSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7Q0FDakMsWUFBWSxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSTtDQUN4QyxjQUFjLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDM0QsY0FBYyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQzNDLGNBQWMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ25DLGFBQWEsQ0FBQyxDQUFDO0NBQ2YsWUFBWSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDakMsV0FBVyxFQUFDO0NBQ1osU0FBUyxDQUFDLENBQUM7Q0FDWCxRQUFPO0NBQ1AsS0FBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUU7Q0FDekIsRUFBRSxrQkFBa0IsRUFBRSxZQUFZO0NBQ2xDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7Q0FDN0QsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDcEIsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsWUFBWTtDQUMxQyxNQUFNLElBQUksWUFBWSxHQUFHLENBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztDQUN4RSxNQUFNLElBQUksWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUNyRCxRQUFRLElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN2QyxRQUFRLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUk7Q0FDaEMsVUFBVSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUM1QyxVQUFVLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM3QixTQUFTLENBQUM7Q0FDVixPQUFPO0NBQ1AsTUFBTSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDekUsTUFBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLGFBQWEsRUFBRSxVQUFVLE9BQU8sRUFBRTtDQUNwQztDQUNBLElBQUksT0FBTyxPQUFPLENBQUM7Q0FDbkI7Q0FDQTtDQUNBOztDQUVBO0NBQ0E7Q0FDQTs7Q0FFQTtDQUNBOztDQUVBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7O0NBRUE7Q0FDQTtDQUNBOztDQUVBO0NBQ0E7Q0FDQTs7Q0FFQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxHQUFHO0NBQ0gsQ0FBQyxDQUFDOztDQ3JGRixTQUFTLGVBQWUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0NBQ3BDLEVBQUUsSUFBSSxHQUFHLEdBQUcsRUFBQzs7Q0FFYixFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQ3ZDLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDeEMsTUFBTSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEVBQUM7Q0FDeEQsTUFBTSxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUM7O0NBRTFELE1BQU0sSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxFQUFDOztDQUVsRCxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0NBQzFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUM7Q0FDMUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBQztDQUMxQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFDO0NBQzFDLEtBQUs7Q0FDTCxHQUFHO0NBQ0gsQ0FBQzs7QUFFRCxDQUFPLFNBQVMsZUFBZSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUU7Q0FDNUQsRUFBRSxlQUFlLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0NBQzlDOztFQUFDLERDbEJELGdCQUFjLEdBQUcsVUFBVSxDQUFDOztDQUU1QixTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTs7S0FFNUQsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOztLQUUzQixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQzs7OztLQUkxRSxJQUFJLFFBQVEsR0FBRyxLQUFLLEdBQUcsU0FBUyxHQUFHLFNBQVM7U0FDeEMsSUFBSSxHQUFHLENBQUMsQ0FBQzs7O0tBR2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtTQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFOzthQUU1QixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O2FBRzlCLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7O2FBRzdDLElBQUksS0FBSyxHQUFHLFFBQVEsRUFBRTs7aUJBRWxCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQztvQ0FDcEQsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTs7cUJBRTlELElBQUksTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7O2tCQUVuRCxNQUFNOztxQkFFSCxJQUFJLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3FCQUM5QyxJQUFJLEVBQUUsQ0FBQztrQkFDVjs7Y0FFSixNQUFNLElBQUksTUFBTSxFQUFFOztpQkFFZixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztpQkFDM0MsU0FBUyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztjQUN6QztVQUNKO01BQ0o7OztLQUdELE9BQU8sSUFBSSxDQUFDO0VBQ2Y7Ozs7O0NBS0QsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7S0FDbkQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN4QixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN4QixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDaEMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ2pDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUM7U0FDM0IsTUFBTSxHQUFHLENBQUM7U0FDVixTQUFTLEdBQUcsQ0FBQztTQUNiLFNBQVMsR0FBRyxDQUFDO1NBQ2IsR0FBRyxHQUFHLENBQUM7U0FDUCxHQUFHLEdBQUcsQ0FBQztTQUNQLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzs7O0tBRzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7U0FDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTthQUMzQixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTOzs7YUFHbkMsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7YUFHakUsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO2tCQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUM7a0JBQzNCLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQzs7O2FBR2hDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7YUFFN0IsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTOzs7YUFHcEIsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2lCQUNiLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2NBQ1o7O2FBRUQsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2lCQUNiLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2NBQ1o7VUFDSjtNQUNKOztLQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxJQUFJLENBQUM7OztLQUd2QixJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7OztLQUlyRCxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7YUFDN0YsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzFHOzs7OztDQUtELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7S0FDekMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO1NBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7O1NBRXRCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDM0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUMzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztTQUUzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1NBQzNCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDM0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7U0FFM0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztLQUU5QyxJQUFJLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzs7S0FFcEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ3pDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7S0FFOUMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUMxRDs7Q0FFRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTtDQUNwRixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRTs7O0NBR3BGLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7S0FDakIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztFQUM5Qjs7Q0FFRCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0tBQ3JDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3BCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0VBQ3pCOztDQUVELFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUU7S0FDdkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO1NBQ3BCLENBQUMsR0FBRyxLQUFLLENBQUMsR0FB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
