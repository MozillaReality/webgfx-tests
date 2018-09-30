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

	function simulateKeyEvent(element, eventType, parameters) {
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

	  //  }

	  // Dispatch directly to Emscripten's html5.h API:
	  /*
	  if (Module['usesEmscriptenHTML5InputAPI'] && typeof JSEvents !== 'undefined' && JSEvents.eventHandlers && JSEvents.eventHandlers.length > 0) {
	    for(var i = 0; i < JSEvents.eventHandlers.length; ++i) {
	      if ((JSEvents.eventHandlers[i].target == element || JSEvents.eventHandlers[i].target == window)
	       && JSEvents.eventHandlers[i].eventTypeString == eventType) {
	         JSEvents.eventHandlers[i].handlerFunc(e);
	      }
	    }
	  } else if (!Module['dispatchKeyEventsViaDOM']) {
	    for(var i = 0; i < registeredEventListeners.length; ++i) {
	      var this_ = registeredEventListeners[i][0];
	      var type = registeredEventListeners[i][1];
	      var listener = registeredEventListeners[i][2];
	      if (type == eventType) listener.call(this_, e);
	    }
	  } else */
	  {
	    // Dispatch to browser for real
	    element.dispatchEvent ? element.dispatchEvent(e) : element.fireEvent("on" + eventType, e);
	  }
	}

	// eventType: "mousemove", "mousedown" or "mouseup".
	// x and y: Normalized coordinate in the range [0,1] where to inject the event.
	function simulateMouseEvent(element, eventType, parameters) {
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
	/*
	  if (eventType === 'mousemove') {
	    mouseDiv.style.left = x + "px";
	    mouseDiv.style.top = y + "px";
	  }
	*/
	  /*
	  if (!Module['dispatchMouseEventsViaDOM']) {
	    // Programmatically reating DOM events doesn't allow specifying offsetX & offsetY properly
	    // for the element, but they must be the same as clientX & clientY. Therefore we can't have a
	    // border that would make these different.
	    if (element.clientWidth != element.offsetWidth
	      || element.clientHeight != element.offsetHeight) {
	      throw "ERROR! Canvas object must have 0px border for direct mouse dispatch to work!";
	    }
	    for(var i = 0; i < registeredEventListeners.length; ++i) {
	      var this_ = registeredEventListeners[i][0];
	      var type = registeredEventListeners[i][1];
	      var listener = registeredEventListeners[i][2];
	      if (type == eventType) {
	        if (Module['needsCompleteCustomMouseEventFields']) {
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
	  } else */
	  {
	    // Dispatch directly to browser
	    element.dispatchEvent(e);
	  }
	}



	// var mouseDiv;
	class InputReplayer {
	  constructor(element, recording) {
	    /*
	    KeystrokeVisualizer.enable({unmodifiedKey: false});
	    mouseDiv = document.createElement('div');
	    mouseDiv.style.cssText="position:absolute;width:30px; height:30px; left:0px; top:0px; background-image:url('../cursor.svg');";
	    mouseDiv.id = 'lolaso';
	    if (window.location.href.indexOf('show-mouse') === -1) {
	      mouseDiv.style.display = 'none';
	    }
	    element.parentNode.appendChild(mouseDiv);
	    */
	    this.element = element;
	    this.recording = recording;
	    this.currentIndex = 0;
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
	          simulateMouseEvent(this.element, input.type + input.event, input.parameters);
	        } break;
	        case 'key': {
	          simulateKeyEvent(this.element, input.type + input.event, input.parameters);
	        } break;
	        default: {
	          console.log('Still not implemented event', input.type);
	        }
	      }
	      this.currentIndex++;
	    }
	  }
	}

	var Module = {};
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
	      var l = this.registeredEventListeners[i];
	      l[0].removeEventListener(l[1], l[2], l[3]);
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
	    return;
	    // Filter the page event handlers to only pass programmatically generated events to the site - all real user input needs to be discarded since we are
	    // doing a programmatic run.
	    var overriddenMessageTypes = ['mousedown', 'mouseup', 'mousemove',
	      'click', 'dblclick', 'keydown', 'keypress', 'keyup',
	      'pointerlockchange', 'pointerlockerror', 'webkitpointerlockchange', 'webkitpointerlockerror', 'mozpointerlockchange', 'mozpointerlockerror', 'mspointerlockchange', 'mspointerlockerror', 'opointerlockchange', 'opointerlockerror',
	      'devicemotion', 'deviceorientation',
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
	    function replaceEventListener(obj, context) {
	      var realAddEventListener = obj.addEventListener;
	      obj.addEventListener = function(type, listener, useCapture) {
	        self.ensureNoClientHandlers();
	        if (overriddenMessageTypes.indexOf(type) != -1) {
	          var registerListenerToDOM =
	               (type.indexOf('mouse') == -1 || Module['dispatchMouseEventsViaDOM'])
	            && (type.indexOf('key') == -1 || Module['dispatchKeyEventsViaDOM']);
	          var filteredEventListener = function(e) { try { if (e.programmatic || !e.isTrusted) listener(e); } catch(e) {} };
	          if (registerListenerToDOM) realAddEventListener.call(context || this, type, filteredEventListener, useCapture);
	          self.registeredEventListeners.push([context || this, type, filteredEventListener, useCapture]);
	        } else {
	          realAddEventListener.call(context || this, type, listener, useCapture);
	          self.registeredEventListeners.push([context || this, type, listener, useCapture]);
	        }
	      };
	    }
	    if (typeof EventTarget !== 'undefined') {
	      replaceEventListener(EventTarget.prototype, null);
	      console.log(this.registeredEventListeners);
	    }
	  }    
	}

	var eventListener = new EventListenerManager();
	eventListener.enable();

	//-----------------
	var ready = false;

	const parameters = queryString.parse(location.search);

	window.TESTER = {
	  // Currently executing frame.
	  referenceTestFrameNumber: 0,
	  numFramesToRender: typeof parameters['numframes'] === 'undefined' ? 100 : parseInt(parameters['numframes']),

	  // Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
	  referenceTestPreTickCalledCount: 0,

	  // Wallclock time for when we started CPU execution of the current frame.
	  // var referenceTestT0 = -1;

	  preTick: function() {
	    if (++this.referenceTestPreTickCalledCount == 1) {

	      this.stats.frameStart(); 
	      var canvas = CanvasHook.webglContexts[CanvasHook.webglContexts.length-1].canvas;
	      if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
	        this.inputRecorder = new InputRecorder(canvas);
	        this.inputRecorder.enable();
	      }
	      if (typeof parameters['replay'] !== 'undefined' && !this.inputReplayer) {
	        if (GFXPERFTEST.input) {
	          fetch('/tests/' + GFXPERFTEST.input).then(response => {
	            return response.json();
	          })
	          .then(json => {
	            this.inputReplayer = new InputReplayer(canvas, json);
	            ready = true;
	          });
	        }
	      } else {
	        ready = true;
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

	    if (!ready) {return;}

	    if (this.inputRecorder) {
	      this.inputRecorder.frameNumber = this.referenceTestFrameNumber;
	    }

	    if (this.inputReplayer) {
	      this.inputReplayer.tick(this.referenceTestFrameNumber);
	    }

	/*    
	  
	    if (!runtimeInitialized) return;
	    ensureNoClientHandlers();
	*/  
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
	            console.log('timeUntilSmoothFramerate', timeNow - firstFrameTime);
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
	    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.
	  
	    if (this.referenceTestFrameNumber === 1) {
	      firstFrameTime = performance.realNow();
	      console.log('First frame submitted at (ms):', firstFrameTime - pageInitTime);
	    }

	    if (this.referenceTestFrameNumber === this.numFramesToRender) {
	      TESTER.doImageReferenceCheck();
	    }

	    // We will assume that after the reftest tick, the application is running idle to wait for next event.
	    this.previousEventHandlerExitedTime = performance.realNow();

	  },
	  doImageReferenceCheck: function() {
	    var canvas = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1].canvas;

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

	    this.socket.on('connect', function(data) {
	      console.log('Connected to testing server');
	    });
	    
	    this.socket.on('error', (error) => {
	      console.log(error);
	    });
	    
	    this.socket.on('connect_error', (error) => {
	      console.log(error);
	    });

	    this.socket.emit('benchmark_started', {id: GFXPERFTEST_CONFIG.test_id});

	    this.socket.on('next_benchmark', (data) => {
	      console.log('next_benchmark', data);
	      window.location.replace(data.url);
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
	    var cpuIdle = this.accumulatedCpuIdleTime * 100.0 / totalRenderTime;
	    var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
	    
	    var data = {
	      test_id: GFXPERFTEST_CONFIG.test_id,
	      values: this.stats.getStatsSummary(),
	      numFrames: this.numFramesToRender,
	      totalTime: totalTime,
	      timeToFirstFrame: firstFrameTime - pageInitTime,
	      logs: this.logs,
	      avgFps: fps,
	      numStutterEvents: this.numStutterEvents,
	      result: 'PASS',
	      totalTime: totalTime,
	      totalRenderTime: totalRenderTime,
	      cpuTime: this.stats.totalTimeInMainLoop,
	      cpuIdleTime: this.stats.totalTimeOutsideMainLoop,
	      cpuIdlePerc: this.stats.totalTimeOutsideMainLoop * 100 / totalRenderTime,
	      pageLoadTime: this.pageLoadTime,
	    };

	    if (this.inputRecorder) {

	      var json = JSON.stringify(this.inputRecorder.events, null, 2);

	      console.log(json);
	      // saveString(json, GFXPERFTEST.id + '.json', 'application/json');
	    }

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
	  hookModals: function() {
	    // Hook modals: This is an unattended run, don't allow window.alert()s to intrude.
	    window.alert = function(msg) { console.error('window.alert(' + msg + ')'); };
	    window.confirm = function(msg) { console.error('window.confirm(' + msg + ')'); return true; };
	  },
	  inputRecorder: null,

	  hookRAF: function () {
	    {
	      if (!window.realRequestAnimationFrame) {
	        window.realRequestAnimationFrame = window.requestAnimationFrame;
	        window.requestAnimationFrame = callback => {
	          const hookedCallback = p => {
	            TESTER.preTick();
	      
	            if (TESTER.referenceTestFrameNumber === TESTER.numFramesToRender) {
	              TESTER.benchmarkFinished();
	              return;
	            }
	      
	            callback(performance.now());
	            TESTER.tick();
	            TESTER.stats.frameEnd();
	      
	          };
	          return window.realRequestAnimationFrame(hookedCallback);
	        };
	      }
	    }    
	  },
	  init: function () {

	    this.hookRAF();
	    this.addProgressBar();

	    console.log('Frames to render:', this.numFramesToRender);

	    {
	      FakeTimers.enable();
	    }

	    // If -1, we are not running an event. Otherwise represents the wallclock time of when we exited the last event handler.
	    this.previousEventHandlerExitedTime = -1;

	    // Wallclock time denoting when the page has finished loading.
	    this.pageLoadTime = null;

	    // Holds the amount of time in msecs that the previously rendered frame took. Used to estimate when a stutter event occurs (fast frame followed by a slow frame)
	    this.lastFrameDuration = -1;

	    // Wallclock time for when the previous frame finished.
	    this.lastFrameTick = -1;

	    this.accumulatedCpuIdleTime = 0;

	    // Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
	    this.numStutterEvents = 0;

	    this.numFastFramesNeededForSmoothFrameRate = 120; // Require 120 frames i.e. ~2 seconds of consecutive smooth stutter free frames to conclude we have reached a stable animation rate.

	    // Measure a "time until smooth frame rate" quantity, i.e. the time after which we consider the startup JIT and GC effects to have settled.
	    // This field tracks how many consecutive frames have run smoothly. This variable is set to -1 when smooth frame rate has been achieved to disable tracking this further.
	    this.numConsecutiveSmoothFrames = 0;

	    var randomSeed = 1;
	    Math.random = seedrandom$1(randomSeed);

	    const DEFAULT_WIDTH = 800;
	    const DEFAULT_HEIGHT = 600;
	    var sizeOptions = {};
	    if (typeof parameters['keep-window-size'] === 'undefined') {
	      sizeOptions = {
	        width: typeof parameters['width'] === 'undefined' ? DEFAULT_WIDTH : parseInt(parameters['width']),
	        height: typeof parameters['height'] === 'undefined' ? DEFAULT_HEIGHT : parseInt(parameters['height'])
	      };
	      window.innerWidth = sizeOptions.width;
	      window.innerHeight = sizeOptions.height;
	    }
	    window.hook = CanvasHook;
	    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, sizeOptions));
	    this.hookModals();

	    if (parameters['noaudio']) ;

	    this.initServer();

	    this.stats = new PerfStats$1();

	    this.timeStart = performance.realNow();
	    window.addEventListener('tester_init', () => {
	    });

	    this.logs = {
	      errors: [],
	      warnings: [],
	      catchErrors: []
	    };
	    this.wrapErrors();

	    this.referenceTestFrameNumber = 0;

	  },
	};

	var firstFrameTime = null;

	TESTER.init();

	var pageInitTime = performance.realNow();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vLi4vY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uLy4uL2NhbnZhcy1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlY29yZGVyLmpzIiwiLi4vLi4vaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZXBsYXllci5qcyIsIi4uL3NyYy9jbGllbnQvZXZlbnQtbGlzdGVuZXJzLmpzIiwiLi4vc3JjL2NsaWVudC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFsRGF0ZSA9IERhdGU7XG5cbmNsYXNzIE1vY2tEYXRlIHtcbiAgY29uc3RydWN0b3IodCkge1xuICAgIHRoaXMudCA9IHQ7XG4gIH1cblxuICBzdGF0aWMgbm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHN0YXRpYyByZWFsTm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldFRpbWV6b25lT2Zmc2V0KCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdG9UaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldERhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldERheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldEhvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRUaW1lKCkgeyByZXR1cm4gMDsgfVxuICBnZXRZZWFyKCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0YXRpYyBVVEMoKSB7IHJldHVybiAwOyB9XG5cbiAgZ2V0VVRDRGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDSG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ1NlY29uZHMoKSB7IHJldHVybiAwOyB9XG5cbiAgc2V0RGF0ZSgpIHt9XG4gIHNldEZ1bGxZZWFyKCkge31cbiAgc2V0SG91cnMoKSB7fVxuICBzZXRNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRNaW51dGVzKCkge31cbiAgc2V0TW9udGgoKSB7fVxuICBzZXRTZWNvbmRzKCkge31cbiAgc2V0VGltZSgpIHt9XG5cbiAgc2V0VVRDRGF0ZSgpIHt9XG4gIHNldFVUQ0Z1bGxZZWFyKCkge31cbiAgc2V0VVRDSG91cnMoKSB7fVxuICBzZXRVVENNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRVVENNaW51dGVzKCkge31cbiAgc2V0VVRDTW9udGgoKSB7fVxuXG4gIHNldFllYXIoKSB7fVxufVxuXG52YXIgcmVhbFBlcmZvcm1hbmNlO1xuXG5pZiAoIXBlcmZvcm1hbmNlLnJlYWxOb3cpIHtcbiAgdmFyIGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzU2FmYXJpKSB7XG4gICAgcmVhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG4gICAgcGVyZm9ybWFuY2UgPSB7XG4gICAgICByZWFsTm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHBlcmZvcm1hbmNlLnJlYWxOb3cgPSBwZXJmb3JtYW5jZS5ub3c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0aW1lU2NhbGU6IDEuMCxcbiAgZmFrZWRUaW1lOiAwLFxuICBlbmFibGVkOiBmYWxzZSxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG4gICAgXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLm5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcikge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgfVxuICBcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuICAgIFxuICAgIERhdGUgPSBSZWFsRGF0ZTsgICAgXG4gICAgcGVyZm9ybWFuY2Uubm93ID0gcmVhbFBlcmZvcm1hbmNlLm5vdztcbiAgICBcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTsgICAgXG4gIH1cbn0iLCJjb25zdCBvcmlnaW5hbCA9IFsnZ2V0UGFyYW1ldGVyJywgJ2dldEV4dGVuc2lvbicsICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnXTtcbmNvbnN0IGVtcHR5U3RyaW5nID0gWydnZXRTaGFkZXJJbmZvTG9nJywgJ2dldFByb2dyYW1JbmZvTG9nJ107XG5jb25zdCByZXR1cm4xID0gWydpc0J1ZmZlcicsICdpc0VuYWJsZWQnLCAnaXNGcmFtZWJ1ZmZlcicsICdpc1Byb2dyYW0nLCAnaXNRdWVyeScsICdpc1ZlcnRleEFycmF5JywgJ2lzU2FtcGxlcicsICdpc1N5bmMnLCAnaXNUcmFuc2Zvcm1GZWVkYmFjaycsXG4naXNSZW5kZXJidWZmZXInLCAnaXNTaGFkZXInLCAnaXNUZXh0dXJlJywgJ3ZhbGlkYXRlUHJvZ3JhbScsICdnZXRTaGFkZXJQYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7ICBcbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFlbmFibGVkKSB7cmV0dXJuO31cbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubiA9IDA7XG4gICAgdGhpcy5taW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMubWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMubWVhbiA9IDA7XG4gICAgdGhpcy5xID0gMDtcbiAgfVxuXG4gIGdldCB2YXJpYW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5xIC8gdGhpcy5uO1xuICB9XG5cbiAgZ2V0IHN0YW5kYXJkX2RldmlhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubik7XG4gIH1cblxuICB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgIC8vIFNvcnJ5LCBubyBOYU5zXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubisrO1xuICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSk7XG4gICAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKTtcbiAgICB0aGlzLnN1bSArPSBudW07XG4gICAgY29uc3QgcHJldk1lYW4gPSB0aGlzLm1lYW47XG4gICAgdGhpcy5tZWFuID0gdGhpcy5tZWFuICsgKG51bSAtIHRoaXMubWVhbikgLyB0aGlzLm47XG4gICAgdGhpcy5xID0gdGhpcy5xICsgKG51bSAtIHByZXZNZWFuKSAqIChudW0gLSB0aGlzLm1lYW4pO1xuICB9XG5cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuOiB0aGlzLm4sXG4gICAgICBtaW46IHRoaXMubWluLFxuICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgIHN1bTogdGhpcy5zdW0sXG4gICAgICBtZWFuOiB0aGlzLm1lYW4sXG4gICAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICB9O1xuICB9ICBcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgdmFyIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9IDA7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKSAgICAgICAgXG4gICAgfSxcblxuICAgIG51bUZyYW1lczogMCxcbiAgICBsb2c6IGZhbHNlLFxuICAgIHRvdGFsVGltZUluTWFpbkxvb3A6IDAsXG4gICAgdG90YWxUaW1lT3V0c2lkZU1haW5Mb29wOiAwLFxuICAgIGZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbDogMjAwLCAvLyBtc2Vjc1xuXG4gICAgZnJhbWVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPT0gMSkgXG4gICAgICB7XG4gICAgICAgIGlmIChsYXN0VXBkYXRlVGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RVcGRhdGVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpXG4gICAgICB7XG4gICAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lcyAqIDEwMDAgLyAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lKTtcbiAgICAgICAgdGhpcy5udW1GcmFtZXMgPSAwO1xuICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVOb3c7XG5cbiAgICAgICAgaWYgKGZpcnN0RnBzKVxuICAgICAgICB7XG4gICAgICAgICAgZmlyc3RGcHMgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRzLmZwcy51cGRhdGUoZnBzKTtcblxuICAgICAgICBpZiAodGhpcy5sb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZnBzIC0gbWluOiAke3RoaXMuc3RhdHMuZnBzLm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmZwcy5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZnBzLm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmZwcy5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgbXMgIC0gbWluOiAke3RoaXMuc3RhdHMuZHQubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZHQubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmR0Lm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmR0LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBjcHUgLSBtaW46ICR7dGhpcy5zdGF0cy5jcHUubWluLnRvRml4ZWQoMil9JSAvIGF2ZzogJHt0aGlzLnN0YXRzLmNwdS5tZWFuLnRvRml4ZWQoMil9JSAvIG1heDogJHt0aGlzLnN0YXRzLmNwdS5tYXgudG9GaXhlZCgyKX0lIC0gc3RkOiAke3RoaXMuc3RhdHMuY3B1LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfSVgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDYWxsZWQgaW4gdGhlIGVuZCBvZiBlYWNoIG1haW4gbG9vcCBmcmFtZSB0aWNrLlxuICAgIGZyYW1lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlci0tO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRcdCddJ1xuXHRcdFx0XHRdLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCddPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBlbmNvZGUoa2V5LCBvcHRpb25zKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZGVjb2RlOiB0cnVlLCBhcnJheUZvcm1hdDogJ25vbmUnfSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKHJldCkuc29ydCgpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9O1xuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ID09PSBmYWxzZSkge1xuXHRcdG9wdGlvbnMuc29ydCA9ICgpID0+IHt9O1xuXHR9XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdHJldHVybiBvYmogPyBPYmplY3Qua2V5cyhvYmopLnNvcnQob3B0aW9ucy5zb3J0KS5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlMiBvZiB2YWx1ZS5zbGljZSgpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZTIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzdWx0LnB1c2goZm9ybWF0dGVyKGtleSwgdmFsdWUyLCByZXN1bHQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpIDogJyc7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dXJsOiBpbnB1dC5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG4iLCIvLyBNYXBzIG1vdXNlIGNvb3JkaW5hdGUgZnJvbSBlbGVtZW50IENTUyBwaXhlbHMgdG8gbm9ybWFsaXplZCBbIDAsIDEgXSByYW5nZS5cbmZ1bmN0aW9uIGNvbXB1dGVOb3JtYWxpemVkUG9zKGVsZW1lbnQsIGV2dCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB4ID0gZXZ0LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gIHZhciB5ID0gZXZ0LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgeCAvPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICB5IC89IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gW3gsIHldO1xufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZWNvcmRlciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgfVxuXG4gIGVuYWJsZShmb3JjZVJlc2V0KSB7XG4gICAgdGhpcy5pbml0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIHRoaXMuaW5qZWN0TGlzdGVuZXJzKCk7XG4gIH1cbi8qXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgfVxuKi9cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmZyYW1lTnVtYmVyID0gMDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgYWRkRXZlbnQodHlwZSwgZXZlbnQsIHBhcmFtZXRlcnMpIHtcbiAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50LFxuICAgICAgcGFyYW1ldGVyc1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVRpbWUpIHtcbiAgICAgIGV2ZW50RGF0YS50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLmluaXRUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudERhdGEuZnJhbWVOdW1iZXIgPSB0aGlzLmZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnREYXRhKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm5ld0V2ZW50Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKGV2ZW50RGF0YSk7XG4gICAgfVxuICB9XG4gIFxuICBpbmplY3RMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnZG93bicsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd1cCcsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ21vdmUnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuXG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd3aGVlbCcsIHtcbiAgICAgICAgZGVsdGFYOiBldnQuZGVsdGFYLFxuICAgICAgICBkZWx0YVk6IGV2dC5kZWx0YVksXG4gICAgICAgIGRlbHRhWjogZXZ0LmRlbHRhWixcbiAgICAgICAgZGVsdGFNb2RlOiBldnQuZGVsdGFNb2RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ2Rvd24nLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ3VwJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTsgIFxuICB9XG59IiwiZnVuY3Rpb24gc2ltdWxhdGVXaGVlbEV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgZGVsdGFYLCBkZWx0YVksIGRlbHRhWiwgZGVsdGFNb2RlKSB7XG4gIHZhciBlID0gbmV3IEV2ZW50KCd3aGVlbCcpO1xuICBlLmRlbHRhWCA9IGRlbHRhWDtcbiAgZS5kZWx0YVkgPSBkZWx0YVk7XG4gIGUuZGVsdGFaID0gZGVsdGFaO1xuICBlLmRlbHRhTW9kZSA9IGRlbHRhTW9kZTtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xufVxuXG5mdW5jdGlvbiBzaW11bGF0ZUtleUV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgcGFyYW1ldGVycykge1xuICAvLyBEb24ndCB1c2UgdGhlIEtleWJvYXJkRXZlbnQgb2JqZWN0IGJlY2F1c2Ugb2YgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84OTQyNjc4L2tleWJvYXJkZXZlbnQtaW4tY2hyb21lLWtleWNvZGUtaXMtMC8xMjUyMjc1MiMxMjUyMjc1MlxuICAvLyBTZWUgYWxzbyBodHRwOi8vb3V0cHV0LmpzYmluLmNvbS9hd2VuYXEvM1xuICAvLyAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdLZXlib2FyZEV2ZW50Jyk7XG4gIC8vICAgIGlmIChlLmluaXRLZXlFdmVudCkge1xuICAvLyAgICAgIGUuaW5pdEtleUV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwga2V5Q29kZSwgY2hhckNvZGUpO1xuICAvLyAgfSBlbHNlIHtcblxuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgZS5rZXlDb2RlID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICBlLndoaWNoID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICBlLmNoYXJDb2RlID0gcGFyYW1ldGVycy5jaGFyQ29kZTtcbiAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuICBlLmtleSA9IHBhcmFtZXRlcnMua2V5O1xuXG4gIC8vICB9XG5cbiAgLy8gRGlzcGF0Y2ggZGlyZWN0bHkgdG8gRW1zY3JpcHRlbidzIGh0bWw1LmggQVBJOlxuICAvKlxuICBpZiAoTW9kdWxlWyd1c2VzRW1zY3JpcHRlbkhUTUw1SW5wdXRBUEknXSAmJiB0eXBlb2YgSlNFdmVudHMgIT09ICd1bmRlZmluZWQnICYmIEpTRXZlbnRzLmV2ZW50SGFuZGxlcnMgJiYgSlNFdmVudHMuZXZlbnRIYW5kbGVycy5sZW5ndGggPiAwKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IEpTRXZlbnRzLmV2ZW50SGFuZGxlcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmICgoSlNFdmVudHMuZXZlbnRIYW5kbGVyc1tpXS50YXJnZXQgPT0gZWxlbWVudCB8fCBKU0V2ZW50cy5ldmVudEhhbmRsZXJzW2ldLnRhcmdldCA9PSB3aW5kb3cpXG4gICAgICAgJiYgSlNFdmVudHMuZXZlbnRIYW5kbGVyc1tpXS5ldmVudFR5cGVTdHJpbmcgPT0gZXZlbnRUeXBlKSB7XG4gICAgICAgICBKU0V2ZW50cy5ldmVudEhhbmRsZXJzW2ldLmhhbmRsZXJGdW5jKGUpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmICghTW9kdWxlWydkaXNwYXRjaEtleUV2ZW50c1ZpYURPTSddKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHRoaXNfID0gcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzBdO1xuICAgICAgdmFyIHR5cGUgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICB2YXIgbGlzdGVuZXIgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMl07XG4gICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgIH1cbiAgfSBlbHNlICovXG4gIHtcbiAgICAvLyBEaXNwYXRjaCB0byBicm93c2VyIGZvciByZWFsXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50ID8gZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpIDogZWxlbWVudC5maXJlRXZlbnQoXCJvblwiICsgZXZlbnRUeXBlLCBlKTtcbiAgfVxufVxuXG4vLyBldmVudFR5cGU6IFwibW91c2Vtb3ZlXCIsIFwibW91c2Vkb3duXCIgb3IgXCJtb3VzZXVwXCIuXG4vLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG5mdW5jdGlvbiBzaW11bGF0ZU1vdXNlRXZlbnQoZWxlbWVudCwgZXZlbnRUeXBlLCBwYXJhbWV0ZXJzKSB7XG4gIC8vIFJlbWFwIGZyb20gWzAsMV0gdG8gY2FudmFzIENTUyBwaXhlbCBzaXplLlxuICB2YXIgeCA9IHBhcmFtZXRlcnMueDtcbiAgdmFyIHkgPSBwYXJhbWV0ZXJzLnk7XG5cbiAgeCAqPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICB5ICo9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIFxuICAvLyBPZmZzZXQgdGhlIGluamVjdGVkIGNvb3JkaW5hdGUgZnJvbSB0b3AtbGVmdCBvZiB0aGUgY2xpZW50IGFyZWEgdG8gdGhlIHRvcC1sZWZ0IG9mIHRoZSBjYW52YXMuXG4gIHggPSBNYXRoLnJvdW5kKHJlY3QubGVmdCArIHgpO1xuICB5ID0gTWF0aC5yb3VuZChyZWN0LnRvcCArIHkpO1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gIGUuaW5pdE1vdXNlRXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csXG4gICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlID09ICdtb3VzZW1vdmUnID8gMCA6IDEsIHgsIHksIHgsIHksXG4gICAgICAgICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzLmJ1dHRvbiwgbnVsbCk7XG4gIGUucHJvZ3JhbW1hdGljID0gdHJ1ZTtcbi8qXG4gIGlmIChldmVudFR5cGUgPT09ICdtb3VzZW1vdmUnKSB7XG4gICAgbW91c2VEaXYuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XG4gICAgbW91c2VEaXYuc3R5bGUudG9wID0geSArIFwicHhcIjtcbiAgfVxuKi9cbiAgLypcbiAgaWYgKCFNb2R1bGVbJ2Rpc3BhdGNoTW91c2VFdmVudHNWaWFET00nXSkge1xuICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhdGluZyBET00gZXZlbnRzIGRvZXNuJ3QgYWxsb3cgc3BlY2lmeWluZyBvZmZzZXRYICYgb2Zmc2V0WSBwcm9wZXJseVxuICAgIC8vIGZvciB0aGUgZWxlbWVudCwgYnV0IHRoZXkgbXVzdCBiZSB0aGUgc2FtZSBhcyBjbGllbnRYICYgY2xpZW50WS4gVGhlcmVmb3JlIHdlIGNhbid0IGhhdmUgYVxuICAgIC8vIGJvcmRlciB0aGF0IHdvdWxkIG1ha2UgdGhlc2UgZGlmZmVyZW50LlxuICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9IGVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICAgIHx8IGVsZW1lbnQuY2xpZW50SGVpZ2h0ICE9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG4gICAgICB0aHJvdyBcIkVSUk9SISBDYW52YXMgb2JqZWN0IG11c3QgaGF2ZSAwcHggYm9yZGVyIGZvciBkaXJlY3QgbW91c2UgZGlzcGF0Y2ggdG8gd29yayFcIjtcbiAgICB9XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHRoaXNfID0gcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzBdO1xuICAgICAgdmFyIHR5cGUgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICB2YXIgbGlzdGVuZXIgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMl07XG4gICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgaWYgKE1vZHVsZVsnbmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHMnXSkge1xuICAgICAgICAgIC8vIElmIG5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzIGlzIHNldCwgdGhlIHBhZ2UgbmVlZHMgYSBmdWxsIHNldCBvZiBhdHRyaWJ1dGVzXG4gICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgIC8vIGEgbmV3IGN1c3RvbSBvYmplY3QgKHdpdGhvdXQgcHJvdG90eXBlIGNoYWluKSB0byBob2xkIHRoZSBvdmVycmlkZGVuIHByb3BlcnRpZXMuXG4gICAgICAgICAgdmFyIGV2dCA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgc3JjRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgdG9FbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgIGV2ZW50UGhhc2U6IDIsIC8vIEV2ZW50LkFUX1RBUkdFVFxuICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgIGJ1dHRvbjogZS5idXR0b24sXG4gICAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgY2FuY2VsQnViYmxlOiBlLmNhbmNlbEJ1YmJsZSxcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IGUuY2FuY2VsYWJsZSxcbiAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgIGNsaWVudFk6IGUuY2xpZW50WSxcbiAgICAgICAgICAgIGN0cmxLZXk6IGUuY3RybEtleSxcbiAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgIGRldGFpbDogZS5kZXRhaWwsXG4gICAgICAgICAgICBpZGVudGlmaWVyOiBlLmlkZW50aWZpZXIsXG4gICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgbGF5ZXJYOiBlLmxheWVyWCxcbiAgICAgICAgICAgIGxheWVyWTogZS5sYXllclksXG4gICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICBtb3ZlbWVudFg6IGUubW92ZW1lbnRYLFxuICAgICAgICAgICAgbW92ZW1lbnRZOiBlLm1vdmVtZW50WSxcbiAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgIG9mZnNldFk6IGUub2Zmc2V0WSxcbiAgICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICBwYXRoOiBlLnBhdGgsXG4gICAgICAgICAgICByZWxhdGVkVGFyZ2V0OiBlLnJlbGF0ZWRUYXJnZXQsXG4gICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgIHNjcmVlblg6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgIHNjcmVlblk6IGUuc2NyZWVuWSxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgc291cmNlQ2FwYWJpbGl0aWVzOiBlLnNvdXJjZUNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgIHRpbWVTdGFtcDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICB2aWV3OiBlLnZpZXcsXG4gICAgICAgICAgICB3aGljaDogZS53aGljaCxcbiAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgIHk6IGUueVxuICAgICAgICAgIH07XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBUaGUgcmVndWxhciAnZScgb2JqZWN0IGlzIGVub3VnaCAoaXQgZG9lc24ndCBwb3B1bGF0ZSBhbGwgb2YgdGhlIHNhbWUgZmllbGRzIHRoYW4gYSByZWFsIG1vdXNlIGV2ZW50IGRvZXMsIFxuICAgICAgICAgIC8vIHNvIHRoaXMgbWlnaHQgbm90IHdvcmsgb24gc29tZSBkZW1vcylcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlICovXG4gIHtcbiAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBicm93c2VyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICB9XG59XG5cblxuXG4vLyB2YXIgbW91c2VEaXY7XG5leHBvcnQgY2xhc3MgSW5wdXRSZXBsYXllciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHJlY29yZGluZykge1xuICAgIC8qXG4gICAgS2V5c3Ryb2tlVmlzdWFsaXplci5lbmFibGUoe3VubW9kaWZpZWRLZXk6IGZhbHNlfSk7XG4gICAgbW91c2VEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBtb3VzZURpdi5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7d2lkdGg6MzBweDsgaGVpZ2h0OjMwcHg7IGxlZnQ6MHB4OyB0b3A6MHB4OyBiYWNrZ3JvdW5kLWltYWdlOnVybCgnLi4vY3Vyc29yLnN2ZycpO1wiO1xuICAgIG1vdXNlRGl2LmlkID0gJ2xvbGFzbyc7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3ctbW91c2UnKSA9PT0gLTEpIHtcbiAgICAgIG1vdXNlRGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuICAgIGVsZW1lbnQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChtb3VzZURpdik7XG4gICAgKi9cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMucmVjb3JkaW5nID0gcmVjb3JkaW5nO1xuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgfVxuXG4gIHRpY2sgKGZyYW1lTnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucmVjb3JkaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPiBmcmFtZU51bWJlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucmVjb3JkaW5nLmxlbmd0aCAmJiB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPT09IGZyYW1lTnVtYmVyKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICAgIHN3aXRjaCAoaW5wdXQudHlwZSkge1xuICAgICAgICBjYXNlICdtb3VzZSc6IHtcbiAgICAgICAgICBzaW11bGF0ZU1vdXNlRXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC50eXBlICsgaW5wdXQuZXZlbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBjYXNlICdrZXknOiB7XG4gICAgICAgICAgc2ltdWxhdGVLZXlFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgbm90IGltcGxlbWVudGVkIGV2ZW50JywgaW5wdXQudHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XG4gICAgfVxuICB9XG59XG4iLCJ2YXIgTW9kdWxlID0ge307XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudExpc3RlbmVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvLyBEb24ndCBjYWxsIGFueSBhcHBsaWNhdGlvbiBwYWdlIHVubG9hZCBoYW5kbGVycyBhcyBhIHJlc3BvbnNlIHRvIHdpbmRvdyBiZWluZyBjbG9zZWQuXG4gIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKSB7XG4gICAgLy8gVGhpcyBpcyBhIGJpdCB0cmlja3kgdG8gbWFuYWdlLCBzaW5jZSB0aGUgcGFnZSBjb3VsZCByZWdpc3RlciB0aGVzZSBoYW5kbGVycyBhdCBhbnkgcG9pbnQsXG4gICAgLy8gc28ga2VlcCB3YXRjaGluZyBmb3IgdGhlbSBhbmQgcmVtb3ZlIHRoZW0gaWYgYW55IGFyZSBhZGRlZC4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAvLyBpbiBhIHNlbWktcG9sbGluZyBmYXNoaW9uIHRvIGVuc3VyZSB0aGVzZSBhcmUgbm90IG92ZXJyaWRkZW4uXG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCkgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9udW5sb2FkKSB3aW5kb3cub251bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25ibHVyKSB3aW5kb3cub25ibHVyID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uZm9jdXMpIHdpbmRvdy5vbmZvY3VzID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZWhpZGUpIHdpbmRvdy5vbnBhZ2VoaWRlID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZXNob3cpIHdpbmRvdy5vbnBhZ2VzaG93ID0gbnVsbDtcbiAgfVxuXG4gIHVubG9hZEFsbEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgZm9yKHZhciBpIGluIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICB2YXIgbCA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKGxbMV0sIGxbMl0sIGxbM10pO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICBcbiAgICAvLyBNYWtlIHN1cmUgbm8gWEhScyBhcmUgYmVpbmcgaGVsZCBvbiB0byBlaXRoZXIuXG4gICAgLy9wcmVsb2FkZWRYSFJzID0ge307XG4gICAgLy9udW1QcmVsb2FkWEhSc0luRmxpZ2h0ID0gMDtcbiAgICAvL1hNTEh0dHBSZXF1ZXN0ID0gcmVhbFhNTEh0dHBSZXF1ZXN0O1xuICBcbiAgICB0aGlzLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgfVxuIFxuICAvL2lmIChpbmplY3RpbmdJbnB1dFN0cmVhbSkgXG4gIGVuYWJsZSgpIHtcbiAgICByZXR1cm47XG4gICAgLy8gRmlsdGVyIHRoZSBwYWdlIGV2ZW50IGhhbmRsZXJzIHRvIG9ubHkgcGFzcyBwcm9ncmFtbWF0aWNhbGx5IGdlbmVyYXRlZCBldmVudHMgdG8gdGhlIHNpdGUgLSBhbGwgcmVhbCB1c2VyIGlucHV0IG5lZWRzIHRvIGJlIGRpc2NhcmRlZCBzaW5jZSB3ZSBhcmVcbiAgICAvLyBkb2luZyBhIHByb2dyYW1tYXRpYyBydW4uXG4gICAgdmFyIG92ZXJyaWRkZW5NZXNzYWdlVHlwZXMgPSBbJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlbW92ZScsXG4gICAgICAnY2xpY2snLCAnZGJsY2xpY2snLCAna2V5ZG93bicsICdrZXlwcmVzcycsICdrZXl1cCcsXG4gICAgICAncG9pbnRlcmxvY2tjaGFuZ2UnLCAncG9pbnRlcmxvY2tlcnJvcicsICd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsICd3ZWJraXRwb2ludGVybG9ja2Vycm9yJywgJ21venBvaW50ZXJsb2NrY2hhbmdlJywgJ21venBvaW50ZXJsb2NrZXJyb3InLCAnbXNwb2ludGVybG9ja2NoYW5nZScsICdtc3BvaW50ZXJsb2NrZXJyb3InLCAnb3BvaW50ZXJsb2NrY2hhbmdlJywgJ29wb2ludGVybG9ja2Vycm9yJyxcbiAgICAgICdkZXZpY2Vtb3Rpb24nLCAnZGV2aWNlb3JpZW50YXRpb24nLFxuICAgICAgJ21vdXNld2hlZWwnLCAnd2hlZWwnLCAnV2hlZWxFdmVudCcsICdET01Nb3VzZVNjcm9sbCcsICdjb250ZXh0bWVudScsXG4gICAgICAnYmx1cicsICdmb2N1cycsICd2aXNpYmlsaXR5Y2hhbmdlJywgJ2JlZm9yZXVubG9hZCcsICd1bmxvYWQnLCAnZXJyb3InLFxuICAgICAgJ3BhZ2VoaWRlJywgJ3BhZ2VzaG93JywgJ29yaWVudGF0aW9uY2hhbmdlJywgJ2dhbWVwYWRjb25uZWN0ZWQnLCAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsXG4gICAgICAnZnVsbHNjcmVlbmNoYW5nZScsICdmdWxsc2NyZWVuZXJyb3InLCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsICdtb3pmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ01TRnVsbHNjcmVlbkNoYW5nZScsICdNU0Z1bGxzY3JlZW5FcnJvcicsICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgJ3dlYmtpdGZ1bGxzY3JlZW5lcnJvcicsXG4gICAgICAndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnLFxuICAgICAgJ3dlYmdsY29udGV4dGxvc3QnLCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLFxuICAgICAgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdwb2ludGVyb3V0JywgJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICd0cmFuc2l0aW9uZW5kJ107XG4gIFxuICAgIC8vIFNvbWUgZ2FtZSBkZW1vcyBwcm9ncmFtbWF0aWNhbGx5IGZpcmUgdGhlIHJlc2l6ZSBldmVudC4gRm9yIEZpcmVmb3ggYW5kIENocm9tZSwgXG4gICAgLy8gd2UgZGV0ZWN0IHRoaXMgdmlhIGV2ZW50LmlzVHJ1c3RlZCBhbmQga25vdyB0byBjb3JyZWN0bHkgcGFzcyBpdCB0aHJvdWdoLCBidXQgdG8gbWFrZSBTYWZhcmkgaGFwcHksXG4gICAgLy8gaXQncyBqdXN0IGVhc2llciB0byBsZXQgcmVzaXplIGNvbWUgdGhyb3VnaCBmb3IgdGhvc2UgZGVtb3MgdGhhdCBuZWVkIGl0LlxuICAgIC8vIGlmICghTW9kdWxlWydwYWdlTmVlZHNSZXNpemVFdmVudCddKSBvdmVycmlkZGVuTWVzc2FnZVR5cGVzLnB1c2goJ3Jlc2l6ZScpO1xuICBcbiAgICAvLyBJZiBjb250ZXh0IGlzIHNwZWNpZmllZCwgYWRkRXZlbnRMaXN0ZW5lciBpcyBjYWxsZWQgdXNpbmcgdGhhdCBhcyB0aGUgJ3RoaXMnIG9iamVjdC4gT3RoZXJ3aXNlIHRoZSBjdXJyZW50IHRoaXMgaXMgdXNlZC5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT0gLTEgfHwgTW9kdWxlWydkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NJ10pXG4gICAgICAgICAgICAmJiAodHlwZS5pbmRleE9mKCdrZXknKSA9PSAtMSB8fCBNb2R1bGVbJ2Rpc3BhdGNoS2V5RXZlbnRzVmlhRE9NJ10pO1xuICAgICAgICAgIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKSB7IHRyeSB7IGlmIChlLnByb2dyYW1tYXRpYyB8fCAhZS5pc1RydXN0ZWQpIGxpc3RlbmVyKGUpOyB9IGNhdGNoKGUpIHt9IH07XG4gICAgICAgICAgaWYgKHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSkgcmVhbEFkZEV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMucHVzaChbY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmVdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWFsQWRkRXZlbnRMaXN0ZW5lci5jYWxsKGNvbnRleHQgfHwgdGhpcywgdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goW2NvbnRleHQgfHwgdGhpcywgdHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIEV2ZW50VGFyZ2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoRXZlbnRUYXJnZXQucHJvdG90eXBlLCBudWxsKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLypcbiAgICAgIHZhciBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IFt3aW5kb3csIGRvY3VtZW50LCBkb2N1bWVudC5ib2R5LCBNb2R1bGVbJ2NhbnZhcyddXTtcbiAgICAgIC8vIGlmIChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSkgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5jb25jYXQoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pO1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldLCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSk7XG4gICAgICB9XG4gICAgICAqL1xuICAgIH1cbiAgfSAgICBcbn0iLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgUGVyZlN0YXRzIGZyb20gJ3BlcmZvcm1hbmNlLXN0YXRzJztcbmltcG9ydCBzZWVkcmFuZG9tIGZyb20gJ3NlZWRyYW5kb20nO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge0lucHV0UmVjb3JkZXIsIElucHV0UmVwbGF5ZXJ9IGZyb20gJ2lucHV0LWV2ZW50cy1yZWNvcmRlcic7XG5pbXBvcnQgRXZlbnRMaXN0ZW5lck1hbmFnZXIgZnJvbSAnLi9ldmVudC1saXN0ZW5lcnMnO1xuXG52YXIgZXZlbnRMaXN0ZW5lciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tLVxudmFyIHJlYWR5ID0gZmFsc2U7XG5cbi8vIFRJQ0tcblxudmFyIFRlc3RlckNvbmZpZyA9IHtcbiAgZG9udE92ZXJyaWRlVGltZTogZmFsc2Vcbn07XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG53aW5kb3cuVEVTVEVSID0ge1xuICAvLyBDdXJyZW50bHkgZXhlY3V0aW5nIGZyYW1lLlxuICByZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI6IDAsXG4gIG51bUZyYW1lc1RvUmVuZGVyOiB0eXBlb2YgcGFyYW1ldGVyc1snbnVtZnJhbWVzJ10gPT09ICd1bmRlZmluZWQnID8gMTAwIDogcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtZnJhbWVzJ10pLFxuXG4gIC8vIEd1YXJkIGFnYWluc3QgcmVjdXJzaXZlIGNhbGxzIHRvIHJlZmVyZW5jZVRlc3RQcmVUaWNrK3JlZmVyZW5jZVRlc3RUaWNrIGZyb20gbXVsdGlwbGUgckFGcy5cbiAgcmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudDogMCxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB3ZSBzdGFydGVkIENQVSBleGVjdXRpb24gb2YgdGhlIGN1cnJlbnQgZnJhbWUuXG4gIC8vIHZhciByZWZlcmVuY2VUZXN0VDAgPSAtMTtcblxuICBwcmVUaWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoKyt0aGlzLnJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPT0gMSkge1xuXG4gICAgICB0aGlzLnN0YXRzLmZyYW1lU3RhcnQoKTsgXG4gICAgICB2YXIgY2FudmFzID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHRzW0NhbnZhc0hvb2sud2ViZ2xDb250ZXh0cy5sZW5ndGgtMV0uY2FudmFzO1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIgPSBuZXcgSW5wdXRSZWNvcmRlcihjYW52YXMpO1xuICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIuZW5hYmxlKCk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlcGxheSddICE9PSAndW5kZWZpbmVkJyAmJiAhdGhpcy5pbnB1dFJlcGxheWVyKSB7XG4gICAgICAgIGlmIChHRlhQRVJGVEVTVC5pbnB1dCkge1xuICAgICAgICAgIGZldGNoKCcvdGVzdHMvJyArIEdGWFBFUkZURVNULmlucHV0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZXBsYXllciA9IG5ldyBJbnB1dFJlcGxheWVyKGNhbnZhcywganNvbik7XG4gICAgICAgICAgICByZWFkeSA9IHRydWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8vIHJlZmVyZW5jZVRlc3RUMCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGlmICh0aGlzLnBhZ2VMb2FkVGltZSA9PT0gbnVsbCkgdGhpcy5wYWdlTG9hZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwYWdlSW5pdFRpbWU7XG5cbiAgICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgICAgaWYgKHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lICE9IC0xKSB7XG4gICAgICAgIHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuICAgIGlmICgtLXRoaXMucmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA+IDApXG4gICAgICByZXR1cm47IC8vIFdlIGFyZSBiZWluZyBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGlnbm9yZSB0aGlzIGNhbGwuXG5cbiAgICBpZiAoIXJlYWR5KSB7cmV0dXJuO31cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5mcmFtZU51bWJlciA9IHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZXBsYXllci50aWNrKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKTtcbiAgICB9XG5cbi8qICAgIFxuICBcbiAgICBpZiAoIXJ1bnRpbWVJbml0aWFsaXplZCkgcmV0dXJuO1xuICAgIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiovICBcbiAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuXG4gICAgdmFyIGZyYW1lRHVyYXRpb24gPSB0aW1lTm93IC0gdGhpcy5sYXN0RnJhbWVUaWNrO1xuICAgIHRoaXMubGFzdEZyYW1lVGljayA9IHRpbWVOb3c7XG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID4gNSAmJiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID4gMCkge1xuICAgICAgLy8gVGhpcyBtdXN0IGJlIGZpeGVkIGRlcGVuZGluZyBvbiB0aGUgdnN5bmNcbiAgICAgIGlmIChmcmFtZUR1cmF0aW9uID4gMjAuMCAmJiBmcmFtZUR1cmF0aW9uID4gdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiAqIDEuMzUpIHtcbiAgICAgICAgdGhpcy5udW1TdHV0dGVyRXZlbnRzKys7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB7XG4gICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcysrO1xuICAgICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID49IHRoaXMubnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVVbnRpbFNtb290aEZyYW1lcmF0ZScsIHRpbWVOb3cgLSBmaXJzdEZyYW1lVGltZSk7XG4gICAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPSBmcmFtZUR1cmF0aW9uO1xuLypcbiAgICBpZiAobnVtUHJlbG9hZFhIUnNJbkZsaWdodCA9PSAwKSB7IC8vIEltcG9ydGFudCEgVGhlIGZyYW1lIG51bWJlciBhZHZhbmNlcyBvbmx5IGZvciB0aG9zZSBmcmFtZXMgdGhhdCB0aGUgZ2FtZSBpcyBub3Qgd2FpdGluZyBmb3IgZGF0YSBmcm9tIHRoZSBpbml0aWFsIG5ldHdvcmsgZG93bmxvYWRzLlxuICAgICAgaWYgKG51bVN0YXJ0dXBCbG9ja2VyWEhSc1BlbmRpbmcgPT0gMCkgKyt0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjsgLy8gQWN0dWFsIHJlZnRlc3QgZnJhbWUgY291bnQgb25seSBpbmNyZW1lbnRzIGFmdGVyIGdhbWUgaGFzIGNvbnN1bWVkIGFsbCB0aGUgY3JpdGljYWwgWEhScyB0aGF0IHdlcmUgdG8gYmUgcHJlbG9hZGVkLlxuICAgICAgKytmYWtlZFRpbWU7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICAgIH1cbiovXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIrKztcbiAgICBGYWtlVGltZXJzLmZha2VkVGltZSsrOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICBmaXJzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGNvbnNvbGUubG9nKCdGaXJzdCBmcmFtZSBzdWJtaXR0ZWQgYXQgKG1zKTonLCBmaXJzdEZyYW1lVGltZSAtIHBhZ2VJbml0VGltZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICBURVNURVIuZG9JbWFnZVJlZmVyZW5jZUNoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgfSxcbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHRzW0NhbnZhc0hvb2sud2ViZ2xDb250ZXh0cy5sZW5ndGggLSAxXS5jYW52YXM7XG5cbiAgICAvLyBHcmFiIHJlbmRlcmVkIFdlYkdMIGZyb250IGJ1ZmZlciBpbWFnZSB0byBhIEpTLXNpZGUgaW1hZ2Ugb2JqZWN0LlxuICAgIHZhciBhY3R1YWxJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgZnVuY3Rpb24gcmVmdGVzdCAoKSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdHVhbEltYWdlKTtcbiAgICAgIC8vYWN0dWFsSW1hZ2Uuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICBhY3R1YWxJbWFnZS5vbmxvYWQgPSByZWZ0ZXN0O1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvL3JlZnRlc3QoKTsgLy8gY2FudmFzLnRvRGF0YVVSTCgpIGxpa2VseSBmYWlsZWQsIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgIH1cbiAgfSxcblxuICBpbml0U2VydmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9ICdodHRwOi8vJyArIEdGWFBFUkZURVNUX0NPTkZJRy5zZXJ2ZXJJUCArICc6ODg4OCc7XG5cbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3Qoc2VydmVyVXJsKTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdiZW5jaG1hcmtfc3RhcnRlZCcsIHtpZDogR0ZYUEVSRlRFU1RfQ09ORklHLnRlc3RfaWR9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCduZXh0X2JlbmNobWFyaycsIChkYXRhKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnbmV4dF9iZW5jaG1hcmsnLCBkYXRhKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGRhdGEudXJsKTtcbiAgICB9KTsgICAgXG4gIH0sXG4gIFxuICBiZW5jaG1hcmtGaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aW1lRW5kID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIHZhciB0b3RhbFRpbWUgPSB0aW1lRW5kIC0gcGFnZUluaXRUaW1lOyAvLyBUb3RhbCB0aW1lLCBpbmNsdWRpbmcgZXZlcnl0aGluZy5cblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUZXN0IGZpbmlzaGVkIScpO1xuICAgIGRpdi5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICBkaXYuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdUaW1lIHNwZW50IGdlbmVyYXRpbmcgcmVmZXJlbmNlIGltYWdlczonLCBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMpO1xuXG4gICAgdmFyIHRvdGFsUmVuZGVyVGltZSA9IHRpbWVFbmQgLSBmaXJzdEZyYW1lVGltZTtcbiAgICB2YXIgY3B1SWRsZSA9IHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSAqIDEwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyICogMTAwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIFxuICAgIHZhciBkYXRhID0ge1xuICAgICAgdGVzdF9pZDogR0ZYUEVSRlRFU1RfQ09ORklHLnRlc3RfaWQsXG4gICAgICB2YWx1ZXM6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IGZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgbG9nczogdGhpcy5sb2dzLFxuICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICByZXN1bHQ6ICdQQVNTJyxcbiAgICAgIHRvdGFsVGltZTogdG90YWxUaW1lLFxuICAgICAgdG90YWxSZW5kZXJUaW1lOiB0b3RhbFJlbmRlclRpbWUsXG4gICAgICBjcHVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZUluTWFpbkxvb3AsXG4gICAgICBjcHVJZGxlVGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AsXG4gICAgICBjcHVJZGxlUGVyYzogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKiAxMDAgLyB0b3RhbFJlbmRlclRpbWUsXG4gICAgICBwYWdlTG9hZFRpbWU6IHRoaXMucGFnZUxvYWRUaW1lLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICAvLyBEdW1wIGlucHV0XG4gICAgICBmdW5jdGlvbiBzYXZlU3RyaW5nICh0ZXh0LCBmaWxlbmFtZSwgbWltZVR5cGUpIHtcbiAgICAgICAgc2F2ZUJsb2IobmV3IEJsb2IoWyB0ZXh0IF0sIHsgdHlwZTogbWltZVR5cGUgfSksIGZpbGVuYW1lKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIGZpbGVuYW1lKSB7XG4gICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZSB8fCAnYXNjZW5lLmh0bWwnO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIC8vIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTsgYnJlYWtzIEZpcmVmb3guLi5cbiAgICAgIH1cblxuICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLmlucHV0UmVjb3JkZXIuZXZlbnRzLCBudWxsLCAyKTtcblxuICAgICAgY29uc29sZS5sb2coanNvbik7XG4gICAgICAvLyBzYXZlU3RyaW5nKGpzb24sIEdGWFBFUkZURVNULmlkICsgJy5qc29uJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdiZW5jaG1hcmtfZmluaXNoJywgZGF0YSk7XG4gICAgY29uc29sZS5sb2coJ0ZpbmlzaGVkIScsIGRhdGEpO1xuICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNsb3NlKSB3aW5kb3cuY2xvc2UoKTtcbiAgfSxcbiAgd3JhcEVycm9yczogZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yID0+IGV2dC5sb2dzLmNhdGNoRXJyb3JzID0ge1xuICAgICAgbWVzc2FnZTogZXZ0LmVycm9yLm1lc3NhZ2UsXG4gICAgICBzdGFjazogZXZ0LmVycm9yLnN0YWNrLFxuICAgICAgbGluZW5vOiBldnQuZXJyb3IubGluZW5vLFxuICAgICAgZmlsZW5hbWU6IGV2dC5lcnJvci5maWxlbmFtZVxuICAgIH0pO1xuXG4gICAgdmFyIHdyYXBGdW5jdGlvbnMgPSBbJ2Vycm9yJywnd2FybmluZycsJ2xvZyddO1xuICAgIHdyYXBGdW5jdGlvbnMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIGZuID0gY29uc29sZVtrZXldLmJpbmQoY29uc29sZSk7XG4gICAgICAgIGNvbnNvbGVba2V5XSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLmVycm9ycy5wdXNoKGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnd2FybmluZycpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncy53YXJuaW5ncy5wdXNoKGFyZ3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChUZXN0ZXJDb25maWcuc2VuZExvZylcbiAgICAgICAgICAgIFRFU1RFUi5zb2NrZXQuZW1pdCgnbG9nJywgYXJncyk7XG5cbiAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgYWRkUHJvZ3Jlc3NCYXI6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBkaXZQcm9ncmVzc0JhcnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdlByb2dyZXNzQmFycy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzOyB3aWR0aDogMjAwcHg7IHBhZGRpbmc6IDEwcHggMTBweCAwcHggMTBweDsnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXZQcm9ncmVzc0JhcnMpO1xuICAgICAgXG4gICAgICB2YXIgb3JkZXJHbG9iYWwgPSBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXTtcbiAgICAgIHZhciB0b3RhbEdsb2JhbCA9IHBhcmFtZXRlcnNbJ3RvdGFsLWdsb2JhbCddO1xuICAgICAgdmFyIHBlcmNHbG9iYWwgPSBNYXRoLnJvdW5kKG9yZGVyR2xvYmFsL3RvdGFsR2xvYmFsICogMTAwKTtcbiAgICAgIHZhciBvcmRlclRlc3QgPSBwYXJhbWV0ZXJzWydvcmRlci10ZXN0J107XG4gICAgICB2YXIgdG90YWxUZXN0ID0gcGFyYW1ldGVyc1sndG90YWwtdGVzdCddO1xuICAgICAgdmFyIHBlcmNUZXN0ID0gTWF0aC5yb3VuZChvcmRlclRlc3QvdG90YWxUZXN0ICogMTAwKTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKHRleHQsIGNvbG9yLCBwZXJjKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDIwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQtY29sb3I6ICNmNWY1ZjU7IGJvcmRlci1yYWRpdXM6IDRweDsgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIDFweCAycHggcmdiYSgwLDAsMCwuMSk7IGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDJweCByZ2JhKDAsMCwwLC4xKTsnO1xuICAgICAgICBkaXZQcm9ncmVzc0JhcnMuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkaXZQcm9ncmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGl2UHJvZ3Jlc3MpO1xuICAgICAgICBkaXZQcm9ncmVzcy5zdHlsZS5jc3NUZXh0PWB3aWR0aDogJHtwZXJjfSU7IGJhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9IGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBmb250LWZhbWlseTogTW9ub3NwYWNlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzM3YWI3O1xuICAgICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsLjE1KTtcbiAgICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO1xuICAgICAgICAgIC1vLXRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO1xuICAgICAgICAgIHRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO2A7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaW5uZXJUZXh0ID0gdGV4dDs7XG4gICAgICB9XG5cbiAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlclRlc3R9LyR7dG90YWxUZXN0fSAke3BlcmNUZXN0fSVgLCAnIzViYzBkZScsIHBlcmNUZXN0KTtcbiAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlckdsb2JhbH0vJHt0b3RhbEdsb2JhbH0gJHtwZXJjR2xvYmFsfSVgLCAnIzMzN2FiNycsIHBlcmNHbG9iYWwpO1xuICAgICAgcmV0dXJuO1xuICAgICAgLypcblx0XHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIiBzdHlsZT1cIndpZHRoOiAxMDAlXCI+XG5cdFx0XHRcdDxkaXYgaWQ9XCJwcm9ncmVzc2JhcjJcIiBjbGFzcz1cInByb2dyZXNzLWJhclwiIHJvbGU9XCJwcm9ncmVzc2JhclwiIHN0eWxlPVwid2lkdGg6IDUwJTsgYmFja2dyb3VuZC1jb2xvcjogI2YwYWQ0ZVwiPlxuXHRcdFx0XHRcdDEvMTAwIDEwJVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2Plx0XG4qL1xuICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnVGVzdCBmaW5pc2hlZCEnKTtcbiAgICAgIGRpdi5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICAgIGRpdi5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjA7Ym90dG9tOjA7ei1pbmRleDo5OTk5O2JhY2tncm91bmQtY29sb3I6Izk5OTtmb250LXNpemU6MTAwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWZcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdUaW1lIHNwZW50IGdlbmVyYXRpbmcgcmVmZXJlbmNlIGltYWdlczonLCBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMpOyAgXG4gICAgfVxuICB9LFxuICBob29rTW9kYWxzOiBmdW5jdGlvbigpIHtcbiAgICAvLyBIb29rIG1vZGFsczogVGhpcyBpcyBhbiB1bmF0dGVuZGVkIHJ1biwgZG9uJ3QgYWxsb3cgd2luZG93LmFsZXJ0KClzIHRvIGludHJ1ZGUuXG4gICAgd2luZG93LmFsZXJ0ID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5hbGVydCgnICsgbXNnICsgJyknKTsgfVxuICAgIHdpbmRvdy5jb25maXJtID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5jb25maXJtKCcgKyBtc2cgKyAnKScpOyByZXR1cm4gdHJ1ZTsgfVxuICB9LFxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIGhvb2tSQUY6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIVRlc3RlckNvbmZpZy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gICAgICBpZiAoIXdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNhbGxiYWNrID0+IHtcbiAgICAgICAgICBjb25zdCBob29rZWRDYWxsYmFjayA9IHAgPT4ge1xuICAgICAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5wcmVNYWluTG9vcCkgeyBUZXN0ZXJDb25maWcucHJlTWFpbkxvb3AoKTsgfVxuICAgICAgICAgICAgVEVTVEVSLnByZVRpY2soKTtcbiAgICAgIFxuICAgICAgICAgICAgaWYgKFRFU1RFUi5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IFRFU1RFUi5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgICAgICAgICBURVNURVIuYmVuY2htYXJrRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgXG4gICAgICAgICAgICBjYWxsYmFjayhwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgICAgICBURVNURVIudGljaygpO1xuICAgICAgICAgICAgVEVTVEVSLnN0YXRzLmZyYW1lRW5kKCk7XG4gICAgXG4gICAgICAgICAgICBpZiAoVGVzdGVyQ29uZmlnLnBvc3RNYWluTG9vcCkgeyBUZXN0ZXJDb25maWcucG9zdE1haW5Mb29wKCk7IH1cbiAgICAgIFxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSAgICBcbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5ob29rUkFGKCk7XG4gICAgdGhpcy5hZGRQcm9ncmVzc0JhcigpO1xuXG4gICAgY29uc29sZS5sb2coJ0ZyYW1lcyB0byByZW5kZXI6JywgdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG5cbiAgICBpZiAoIVRlc3RlckNvbmZpZy5kb250T3ZlcnJpZGVUaW1lKSB7XG4gICAgICBGYWtlVGltZXJzLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIC8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxuICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gLTE7XG5cbiAgICAvLyBXYWxsY2xvY2sgdGltZSBkZW5vdGluZyB3aGVuIHRoZSBwYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLlxuICAgIHRoaXMucGFnZUxvYWRUaW1lID0gbnVsbDtcblxuICAgIC8vIEhvbGRzIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtc2VjcyB0aGF0IHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIGZyYW1lIHRvb2suIFVzZWQgdG8gZXN0aW1hdGUgd2hlbiBhIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIChmYXN0IGZyYW1lIGZvbGxvd2VkIGJ5IGEgc2xvdyBmcmFtZSlcbiAgICB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID0gLTE7XG5cbiAgICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG4gICAgdGhpcy5sYXN0RnJhbWVUaWNrID0gLTE7XG5cbiAgICB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgPSAwO1xuXG4gICAgLy8gS2VlcHMgdHJhY2sgb2YgcGVyZm9ybWFuY2Ugc3R1dHRlciBldmVudHMuIEEgc3R1dHRlciBldmVudCBvY2N1cnMgd2hlbiB0aGVyZSBpcyBhIGhpY2N1cCBpbiBzdWJzZXF1ZW50IHBlci1mcmFtZSB0aW1lcy4gKGZhc3QgZm9sbG93ZWQgYnkgc2xvdylcbiAgICB0aGlzLm51bVN0dXR0ZXJFdmVudHMgPSAwO1xuXG4gICAgdGhpcy5udW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlID0gMTIwOyAvLyBSZXF1aXJlIDEyMCBmcmFtZXMgaS5lLiB+MiBzZWNvbmRzIG9mIGNvbnNlY3V0aXZlIHNtb290aCBzdHV0dGVyIGZyZWUgZnJhbWVzIHRvIGNvbmNsdWRlIHdlIGhhdmUgcmVhY2hlZCBhIHN0YWJsZSBhbmltYXRpb24gcmF0ZS5cblxuICAgIC8vIE1lYXN1cmUgYSBcInRpbWUgdW50aWwgc21vb3RoIGZyYW1lIHJhdGVcIiBxdWFudGl0eSwgaS5lLiB0aGUgdGltZSBhZnRlciB3aGljaCB3ZSBjb25zaWRlciB0aGUgc3RhcnR1cCBKSVQgYW5kIEdDIGVmZmVjdHMgdG8gaGF2ZSBzZXR0bGVkLlxuICAgIC8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbiAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcblxuICAgIHZhciByYW5kb21TZWVkID0gMTtcbiAgICBNYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20ocmFuZG9tU2VlZCk7XG5cbiAgICBjb25zdCBERUZBVUxUX1dJRFRIID0gODAwO1xuICAgIGNvbnN0IERFRkFVTFRfSEVJR0hUID0gNjAwO1xuICAgIHZhciBzaXplT3B0aW9ucyA9IHt9O1xuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sna2VlcC13aW5kb3ctc2l6ZSddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgc2l6ZU9wdGlvbnMgPSB7XG4gICAgICAgIHdpZHRoOiB0eXBlb2YgcGFyYW1ldGVyc1snd2lkdGgnXSA9PT0gJ3VuZGVmaW5lZCcgPyBERUZBVUxUX1dJRFRIIDogcGFyc2VJbnQocGFyYW1ldGVyc1snd2lkdGgnXSksXG4gICAgICAgIGhlaWdodDogdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pXG4gICAgICB9XG4gICAgICB3aW5kb3cuaW5uZXJXaWR0aCA9IHNpemVPcHRpb25zLndpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gc2l6ZU9wdGlvbnMuaGVpZ2h0O1xuICAgIH1cbiAgICB3aW5kb3cuaG9vayA9IENhbnZhc0hvb2s7XG4gICAgQ2FudmFzSG9vay5lbmFibGUoT2JqZWN0LmFzc2lnbih7ZmFrZVdlYkdMOiB0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJnbCddICE9PSAndW5kZWZpbmVkJ30sIHNpemVPcHRpb25zKSk7XG4gICAgdGhpcy5ob29rTW9kYWxzKCk7XG5cbiAgICBpZiAocGFyYW1ldGVyc1snbm9hdWRpbyddKSB7XG4gICAgICAvLyBIb29rIGF1ZGlvIEFQSXNcbiAgICB9XG5cbiAgICB0aGlzLmluaXRTZXJ2ZXIoKTtcblxuICAgIHRoaXMuc3RhdHMgPSBuZXcgUGVyZlN0YXRzKCk7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdGVyX2luaXQnLCAoKSA9PiB7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZ3MgPSB7XG4gICAgICBlcnJvcnM6IFtdLFxuICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgY2F0Y2hFcnJvcnM6IFtdXG4gICAgfTtcbiAgICB0aGlzLndyYXBFcnJvcnMoKTtcblxuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID0gMDtcblxuICB9LFxufTtcblxudmFyIGZpcnN0RnJhbWVUaW1lID0gbnVsbDtcblxuVEVTVEVSLmluaXQoKTtcblxudmFyIHBhZ2VJbml0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiJdLCJuYW1lcyI6WyJTdGF0cyIsInRoaXMiLCJkZWZpbmUiLCJyZXF1aXJlJCQwIiwic3IiLCJkZWNvZGUiLCJkZWNvZGVDb21wb25lbnQiLCJzZWVkcmFuZG9tIiwiUGVyZlN0YXRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztDQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEIsTUFBTSxRQUFRLENBQUM7Q0FDZixFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUU7Q0FDakIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEdBQUcsR0FBRztDQUNmLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sT0FBTyxHQUFHO0NBQ25CLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7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QixTQUFTOztDQUVULFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztDQUVuQyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtDQUN0QixVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzdNLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDek0sVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FB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QUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0dBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQzs7O0dBR2QsRUFBRSxDQUFDLElBQUksR0FBRyxXQUFXOztLQUVuQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUk7S0FDaEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUM1QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0tBQ3hDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDdkMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN0QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDekQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNULEVBQUUsQ0FB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
