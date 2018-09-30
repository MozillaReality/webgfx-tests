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
	          this.simulateMouseEvent(this.element, input.type + input.event, input.parameters);
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
	        var this_ = this.registeredEventListeners[i][0];
	        var type = this.registeredEventListeners[i][1];
	        var listener = this.registeredEventListeners[i][2];
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
	      for(var i = 0; i < this.registeredEventListeners.length; ++i) {
	        var this_ = this.registeredEventListeners[i][0];
	        var type = this.registeredEventListeners[i][1];
	        var listener = this.registeredEventListeners[i][2];
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
	    var dispatchMouseEventsViaDOM = false;
	    var dispatchKeyEventsViaDOM = false;
	    function replaceEventListener(obj, context) {
	      var realAddEventListener = obj.addEventListener;
	      obj.addEventListener = function(type, listener, useCapture) {
	        self.ensureNoClientHandlers();
	        if (overriddenMessageTypes.indexOf(type) != -1) {
	          var registerListenerToDOM =
	               (type.indexOf('mouse') == -1 || dispatchMouseEventsViaDOM)
	            && (type.indexOf('key') == -1 || dispatchKeyEventsViaDOM);
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

	//import KeystrokeVisualizer from 'keystroke-visualizer';

	class InputHelpers {
	  initKeys() {
	  //  KeystrokeVisualizer.enable({unmodifiedKey: false});
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
      background: yellow;
      position: absolute;
      left: 0px;
      top: 0px;
      border: 3px solid black;
      opacity: 0.5;
      visibility: hidden;
    `;

	    this.mouseDiv.style.cssText = "position:absolute;width:30px; height:30px; left:0px; top:0px; background-image:url('../cursor.svg');z-index:9999";
	    
	    this.canvas.parentNode.appendChild(this.mouseDiv);
	    this.canvas.parentNode.appendChild(this.mouseClick);

	    this.canvas.addEventListener('mousemove', (evt) => {
	      this.mouseDiv.style.left = evt.x + "px";
	      this.mouseDiv.style.top = evt.y + "px";

	      this.mouseClick.style.left = `${evt.x - 3}px`;
	      this.mouseClick.style.top = evt.y + "px";
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
	    if (window.location.href.indexOf('show-keyboard') === -1) {
	      this.initKeys();
	    }
	    if (window.location.href.indexOf('show-mouse') === -1) {
	      this.initMouse();
	    }
	  }
	}

	const parameters = queryString.parse(location.search);

	window.TESTER = {
	  ready: false,

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

	  numFramesToRender: typeof parameters['numframes'] === 'undefined' ? 100 : parseInt(parameters['numframes']),

	  // Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
	  referenceTestPreTickCalledCount: 0,

	  // Canvas used by the test to render
	  canvas: null,

	  inputRecorder: null,

	  // Wallclock time for when we started CPU execution of the current frame.
	  // var referenceTestT0 = -1;

	  preTick: function() {
	    if (++this.referenceTestPreTickCalledCount == 1) {
	      this.stats.frameStart();

	      if (!this.canvas) {
	        // We assume the last webgl context being initialized is the one used to rendering
	        // If that's different, the test should have a custom code to return that canvas
	        this.canvas = CanvasHook.webglContexts[CanvasHook.webglContexts.length - 1].canvas;
	      }

	      if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
	        this.inputRecorder = new InputRecorder(this.canvas);
	        this.inputRecorder.enable();
	      }
	      
	      if (typeof parameters['replay'] !== 'undefined' && !this.inputReplayer) {
	        if (GFXPERFTESTS_CONFIG.input) {
	          fetch('/tests/' + GFXPERFTESTS_CONFIG.input).then(response => {
	            return response.json();
	          })
	          .then(json => {
	            this.inputReplayer = new InputReplayer(this.canvas, json, this.eventListener.registeredEventListeners);
	            //this.inputReplayer = new InputReplayer(this.canvas, json);
	            //if (parameters.showMouse || parameters.showKeys)
	            this.inputHelpers = new InputHelpers(this.canvas);

	            this.ready = true;
	          });
	        }
	      } else {
	        this.ready = true;
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

	/*    
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
	    FakeTimers.fakedTime++; // But game time advances immediately after the preloadable XHRs are finished.
	  
	    if (this.referenceTestFrameNumber === 1) {
	      this.firstFrameTime = performance.realNow();
	      console.log('First frame submitted at (ms):', this.firstFrameTime - pageInitTime);
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
	    var serverUrl = 'http://' + GFXPERFTESTS_CONFIG.serverIP + ':8888';

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

	    this.socket.emit('benchmark_started', {id: GFXPERFTESTS_CONFIG.id});

	    this.socket.on('next_benchmark', (data) => {
	      console.log('next_benchmark', data);
	      window.location.replace(data.url);
	    });    
	  },
	  
	  benchmarkFinished: function () {

	    var style = document.createElement('style');
	    style.innerHTML = `
      #benchmark_finished {
        align-items: center;
        background-color: #999;
        bottom: 0;
        color: #fff;
        display: flex;
        font-family: sans-serif;
        font-weight: normal;
        font-size: 40px;
        justify-content: center;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: 9999;
        flex-direction: column;
      }
      
      #benchmark_finished .button {
        background-color: #007095;
        border-color: #007095;
        color: #FFFFFF;
        cursor: pointer;
        display: inline-block;
        font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif !important;
        font-size: 16px;
        font-weight: normal;
        line-height: normal;
        padding: 15px 20px 15px 20px;
        text-align: center;
        text-decoration: none;
        transition: background-color 300ms ease-out;
      }

      #benchmark_finished .button:hover {
        background-color: #0078a0;
      }
      `;
	    document.body.appendChild(style);

	    var timeEnd = performance.realNow();
	    var totalTime = timeEnd - pageInitTime; // Total time, including everything.

	    var div = document.createElement('div');
	    div.innerHTML = `
      <h1>Test finished!</h1>
    `;
	    //div.appendChild(text);
	    div.id = 'benchmark_finished';
	    
	    document.body.appendChild(div);

	    if (this.inputRecorder) {
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
	      link.onclick = () => saveString(json, GFXPERFTESTS_CONFIG.id + '.json', 'application/json');
	      link.appendChild(document.createTextNode(`Download input JSON`)); // (${this.inputRecorder.events.length} events recorded)
	      div.appendChild(link);
	    }

	    var totalRenderTime = timeEnd - this.firstFrameTime;
	    var cpuIdle = this.accumulatedCpuIdleTime * 100.0 / totalRenderTime;
	    var fps = this.numFramesToRender * 1000.0 / totalRenderTime;
	    
	    var data = {
	      test_id: GFXPERFTESTS_CONFIG.id,
	      values: this.stats.getStatsSummary(),
	      numFrames: this.numFramesToRender,
	      totalTime: totalTime,
	      timeToFirstFrame: this.firstFrameTime - pageInitTime,
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

	    if (this.socket) {
	      this.socket.emit('benchmark_finish', data);
	      this.socket.disconnect();
	    }

	    console.log('Finished!', data);
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

	          if (GFXPERFTESTS_CONFIG.sendLog)
	            TESTER.socket.emit('log', args);

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

	  hookRAF: function () {
	    if (!window.realRequestAnimationFrame) {
	      window.realRequestAnimationFrame = window.requestAnimationFrame;
	      window.requestAnimationFrame = callback => {
	        const hookedCallback = p => {
	          if (GFXPERFTESTS_CONFIG.preMainLoop) { 
	            GFXPERFTESTS_CONFIG.preMainLoop(); 
	          }
	          this.preTick();
	    
	          if (this.referenceTestFrameNumber === this.numFramesToRender) {
	            this.benchmarkFinished();
	            return;
	          }
	    
	          callback(performance.now());
	          this.tick();
	          this.stats.frameEnd();
	  
	          if (GFXPERFTESTS_CONFIG.postMainLoop) {
	            GFXPERFTESTS_CONFIG.postMainLoop();
	          }
	        };
	        return window.realRequestAnimationFrame(hookedCallback);
	      };
	    }
	  },

	  init: function () {

	    if (!GFXPERFTESTS_CONFIG.providesRafIntegration) {
	      this.hookRAF();
	    }
	    this.addProgressBar();

	    console.log('Frames to render:', this.numFramesToRender);

	    if (!GFXPERFTESTS_CONFIG.dontOverrideTime) {
	      FakeTimers.enable();
	    }

	    Math.random = seedrandom$1(this.randomSeed);

	    this.handleSize();
	    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, this.windowSize));
	    this.hookModals();

	    // this.initServer();

	    this.stats = new PerfStats$1();

	    this.logs = {
	      errors: [],
	      warnings: [],
	      catchErrors: []
	    };
	    this.wrapErrors();

	    this.eventListener = new EventListenerManager();
	    if (typeof parameters['replay'] !== 'undefined') {
	      this.eventListener.enable();
	    }

	    this.referenceTestFrameNumber = 0;
	    this.timeStart = performance.realNow();
	  },

	  handleSize: function() {
	    const DEFAULT_WIDTH = 800;
	    const DEFAULT_HEIGHT = 600;
	    this.windowSize = {};
	    if (typeof parameters['keep-window-size'] === 'undefined') {
	      this.windowSize = {
	        width: typeof parameters['width'] === 'undefined' ? DEFAULT_WIDTH : parseInt(parameters['width']),
	        height: typeof parameters['height'] === 'undefined' ? DEFAULT_HEIGHT : parseInt(parameters['height'])
	      };
	      window.innerWidth = this.windowSize.width;
	      window.innerHeight = this.windowSize.height;
	    }
	  }
	};

	TESTER.init();

	var pageInitTime = performance.realNow();

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vLi4vY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uLy4uL2NhbnZhcy1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlY29yZGVyLmpzIiwiLi4vLi4vaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZXBsYXllci5qcyIsIi4uL3NyYy9jbGllbnQvZXZlbnQtbGlzdGVuZXJzLmpzIiwiLi4vc3JjL2NsaWVudC9pbnB1dC1oZWxwZXJzLmpzIiwiLi4vc3JjL2NsaWVudC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFsRGF0ZSA9IERhdGU7XG5cbmNsYXNzIE1vY2tEYXRlIHtcbiAgY29uc3RydWN0b3IodCkge1xuICAgIHRoaXMudCA9IHQ7XG4gIH1cblxuICBzdGF0aWMgbm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHN0YXRpYyByZWFsTm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldFRpbWV6b25lT2Zmc2V0KCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdG9UaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldERhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldERheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldEhvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRUaW1lKCkgeyByZXR1cm4gMDsgfVxuICBnZXRZZWFyKCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0YXRpYyBVVEMoKSB7IHJldHVybiAwOyB9XG5cbiAgZ2V0VVRDRGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDSG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ1NlY29uZHMoKSB7IHJldHVybiAwOyB9XG5cbiAgc2V0RGF0ZSgpIHt9XG4gIHNldEZ1bGxZZWFyKCkge31cbiAgc2V0SG91cnMoKSB7fVxuICBzZXRNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRNaW51dGVzKCkge31cbiAgc2V0TW9udGgoKSB7fVxuICBzZXRTZWNvbmRzKCkge31cbiAgc2V0VGltZSgpIHt9XG5cbiAgc2V0VVRDRGF0ZSgpIHt9XG4gIHNldFVUQ0Z1bGxZZWFyKCkge31cbiAgc2V0VVRDSG91cnMoKSB7fVxuICBzZXRVVENNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRVVENNaW51dGVzKCkge31cbiAgc2V0VVRDTW9udGgoKSB7fVxuXG4gIHNldFllYXIoKSB7fVxufVxuXG52YXIgcmVhbFBlcmZvcm1hbmNlO1xuXG5pZiAoIXBlcmZvcm1hbmNlLnJlYWxOb3cpIHtcbiAgdmFyIGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzU2FmYXJpKSB7XG4gICAgcmVhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG4gICAgcGVyZm9ybWFuY2UgPSB7XG4gICAgICByZWFsTm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHBlcmZvcm1hbmNlLnJlYWxOb3cgPSBwZXJmb3JtYW5jZS5ub3c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0aW1lU2NhbGU6IDEuMCxcbiAgZmFrZWRUaW1lOiAwLFxuICBlbmFibGVkOiBmYWxzZSxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG4gICAgXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLm5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcikge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgfVxuICBcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuICAgIFxuICAgIERhdGUgPSBSZWFsRGF0ZTsgICAgXG4gICAgcGVyZm9ybWFuY2Uubm93ID0gcmVhbFBlcmZvcm1hbmNlLm5vdztcbiAgICBcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTsgICAgXG4gIH1cbn0iLCJjb25zdCBvcmlnaW5hbCA9IFsnZ2V0UGFyYW1ldGVyJywgJ2dldEV4dGVuc2lvbicsICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnXTtcbmNvbnN0IGVtcHR5U3RyaW5nID0gWydnZXRTaGFkZXJJbmZvTG9nJywgJ2dldFByb2dyYW1JbmZvTG9nJ107XG5jb25zdCByZXR1cm4xID0gWydpc0J1ZmZlcicsICdpc0VuYWJsZWQnLCAnaXNGcmFtZWJ1ZmZlcicsICdpc1Byb2dyYW0nLCAnaXNRdWVyeScsICdpc1ZlcnRleEFycmF5JywgJ2lzU2FtcGxlcicsICdpc1N5bmMnLCAnaXNUcmFuc2Zvcm1GZWVkYmFjaycsXG4naXNSZW5kZXJidWZmZXInLCAnaXNTaGFkZXInLCAnaXNUZXh0dXJlJywgJ3ZhbGlkYXRlUHJvZ3JhbScsICdnZXRTaGFkZXJQYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7ICBcbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFlbmFibGVkKSB7cmV0dXJuO31cbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubiA9IDA7XG4gICAgdGhpcy5taW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMubWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMubWVhbiA9IDA7XG4gICAgdGhpcy5xID0gMDtcbiAgfVxuXG4gIGdldCB2YXJpYW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5xIC8gdGhpcy5uO1xuICB9XG5cbiAgZ2V0IHN0YW5kYXJkX2RldmlhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubik7XG4gIH1cblxuICB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgIC8vIFNvcnJ5LCBubyBOYU5zXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubisrO1xuICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSk7XG4gICAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKTtcbiAgICB0aGlzLnN1bSArPSBudW07XG4gICAgY29uc3QgcHJldk1lYW4gPSB0aGlzLm1lYW47XG4gICAgdGhpcy5tZWFuID0gdGhpcy5tZWFuICsgKG51bSAtIHRoaXMubWVhbikgLyB0aGlzLm47XG4gICAgdGhpcy5xID0gdGhpcy5xICsgKG51bSAtIHByZXZNZWFuKSAqIChudW0gLSB0aGlzLm1lYW4pO1xuICB9XG5cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuOiB0aGlzLm4sXG4gICAgICBtaW46IHRoaXMubWluLFxuICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgIHN1bTogdGhpcy5zdW0sXG4gICAgICBtZWFuOiB0aGlzLm1lYW4sXG4gICAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICB9O1xuICB9ICBcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgdmFyIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9IDA7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKSAgICAgICAgXG4gICAgfSxcblxuICAgIG51bUZyYW1lczogMCxcbiAgICBsb2c6IGZhbHNlLFxuICAgIHRvdGFsVGltZUluTWFpbkxvb3A6IDAsXG4gICAgdG90YWxUaW1lT3V0c2lkZU1haW5Mb29wOiAwLFxuICAgIGZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbDogMjAwLCAvLyBtc2Vjc1xuXG4gICAgZnJhbWVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPT0gMSkgXG4gICAgICB7XG4gICAgICAgIGlmIChsYXN0VXBkYXRlVGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RVcGRhdGVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpXG4gICAgICB7XG4gICAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lcyAqIDEwMDAgLyAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lKTtcbiAgICAgICAgdGhpcy5udW1GcmFtZXMgPSAwO1xuICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVOb3c7XG5cbiAgICAgICAgaWYgKGZpcnN0RnBzKVxuICAgICAgICB7XG4gICAgICAgICAgZmlyc3RGcHMgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRzLmZwcy51cGRhdGUoZnBzKTtcblxuICAgICAgICBpZiAodGhpcy5sb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZnBzIC0gbWluOiAke3RoaXMuc3RhdHMuZnBzLm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmZwcy5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZnBzLm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmZwcy5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgbXMgIC0gbWluOiAke3RoaXMuc3RhdHMuZHQubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZHQubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmR0Lm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmR0LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBjcHUgLSBtaW46ICR7dGhpcy5zdGF0cy5jcHUubWluLnRvRml4ZWQoMil9JSAvIGF2ZzogJHt0aGlzLnN0YXRzLmNwdS5tZWFuLnRvRml4ZWQoMil9JSAvIG1heDogJHt0aGlzLnN0YXRzLmNwdS5tYXgudG9GaXhlZCgyKX0lIC0gc3RkOiAke3RoaXMuc3RhdHMuY3B1LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfSVgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDYWxsZWQgaW4gdGhlIGVuZCBvZiBlYWNoIG1haW4gbG9vcCBmcmFtZSB0aWNrLlxuICAgIGZyYW1lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlci0tO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRcdCddJ1xuXHRcdFx0XHRdLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCddPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBlbmNvZGUoa2V5LCBvcHRpb25zKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZGVjb2RlOiB0cnVlLCBhcnJheUZvcm1hdDogJ25vbmUnfSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKHJldCkuc29ydCgpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9O1xuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ID09PSBmYWxzZSkge1xuXHRcdG9wdGlvbnMuc29ydCA9ICgpID0+IHt9O1xuXHR9XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdHJldHVybiBvYmogPyBPYmplY3Qua2V5cyhvYmopLnNvcnQob3B0aW9ucy5zb3J0KS5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlMiBvZiB2YWx1ZS5zbGljZSgpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZTIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzdWx0LnB1c2goZm9ybWF0dGVyKGtleSwgdmFsdWUyLCByZXN1bHQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpIDogJyc7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dXJsOiBpbnB1dC5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG4iLCIvLyBNYXBzIG1vdXNlIGNvb3JkaW5hdGUgZnJvbSBlbGVtZW50IENTUyBwaXhlbHMgdG8gbm9ybWFsaXplZCBbIDAsIDEgXSByYW5nZS5cbmZ1bmN0aW9uIGNvbXB1dGVOb3JtYWxpemVkUG9zKGVsZW1lbnQsIGV2dCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB4ID0gZXZ0LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gIHZhciB5ID0gZXZ0LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgeCAvPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICB5IC89IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gW3gsIHldO1xufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZWNvcmRlciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgfVxuXG4gIGVuYWJsZShmb3JjZVJlc2V0KSB7XG4gICAgdGhpcy5pbml0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIHRoaXMuaW5qZWN0TGlzdGVuZXJzKCk7XG4gIH1cbi8qXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgfVxuKi9cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmZyYW1lTnVtYmVyID0gMDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgYWRkRXZlbnQodHlwZSwgZXZlbnQsIHBhcmFtZXRlcnMpIHtcbiAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50LFxuICAgICAgcGFyYW1ldGVyc1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVRpbWUpIHtcbiAgICAgIGV2ZW50RGF0YS50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLmluaXRUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudERhdGEuZnJhbWVOdW1iZXIgPSB0aGlzLmZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnREYXRhKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm5ld0V2ZW50Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKGV2ZW50RGF0YSk7XG4gICAgfVxuICB9XG4gIFxuICBpbmplY3RMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnZG93bicsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd1cCcsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ21vdmUnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuXG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd3aGVlbCcsIHtcbiAgICAgICAgZGVsdGFYOiBldnQuZGVsdGFYLFxuICAgICAgICBkZWx0YVk6IGV2dC5kZWx0YVksXG4gICAgICAgIGRlbHRhWjogZXZ0LmRlbHRhWixcbiAgICAgICAgZGVsdGFNb2RlOiBldnQuZGVsdGFNb2RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ2Rvd24nLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ3VwJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTsgIFxuICB9XG59IiwiZnVuY3Rpb24gc2ltdWxhdGVXaGVlbEV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgZGVsdGFYLCBkZWx0YVksIGRlbHRhWiwgZGVsdGFNb2RlKSB7XG4gIHZhciBlID0gbmV3IEV2ZW50KCd3aGVlbCcpO1xuICBlLmRlbHRhWCA9IGRlbHRhWDtcbiAgZS5kZWx0YVkgPSBkZWx0YVk7XG4gIGUuZGVsdGFaID0gZGVsdGFaO1xuICBlLmRlbHRhTW9kZSA9IGRlbHRhTW9kZTtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xufVxuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NOiB0cnVlLFxuICBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NOiB0cnVlLFxuICBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkczogZmFsc2Vcbn07XG5cblxuZXhwb3J0IGNsYXNzIElucHV0UmVwbGF5ZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCByZWNvcmRpbmcsIHJlZ2lzdGVyZWRFdmVudExpc3RlbmVycywgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnJlY29yZGluZyA9IHJlY29yZGluZztcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnM7IC8vIElmID09PSBudWxsIC0+IERpc3BhdGNoIHRvIERPTVxuICB9XG5cbiAgdGljayAoZnJhbWVOdW1iZXIpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5yZWNvcmRpbmcubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA+IGZyYW1lTnVtYmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5yZWNvcmRpbmcubGVuZ3RoICYmIHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA9PT0gZnJhbWVOdW1iZXIpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlJzoge1xuICAgICAgICAgIHRoaXMuc2ltdWxhdGVNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgfSBicmVhaztcbiAgICAgICAgY2FzZSAna2V5Jzoge1xuICAgICAgICAgIHRoaXMuc2ltdWxhdGVLZXlFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgbm90IGltcGxlbWVudGVkIGV2ZW50JywgaW5wdXQudHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgc2ltdWxhdGVLZXlFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBEb24ndCB1c2UgdGhlIEtleWJvYXJkRXZlbnQgb2JqZWN0IGJlY2F1c2Ugb2YgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84OTQyNjc4L2tleWJvYXJkZXZlbnQtaW4tY2hyb21lLWtleWNvZGUtaXMtMC8xMjUyMjc1MiMxMjUyMjc1MlxuICAgIC8vIFNlZSBhbHNvIGh0dHA6Ly9vdXRwdXQuanNiaW4uY29tL2F3ZW5hcS8zXG4gICAgLy8gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnS2V5Ym9hcmRFdmVudCcpO1xuICAgIC8vICAgIGlmIChlLmluaXRLZXlFdmVudCkge1xuICAgIC8vICAgICAgZS5pbml0S2V5RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBrZXlDb2RlLCBjaGFyQ29kZSk7XG4gICAgLy8gIH0gZWxzZSB7XG4gIFxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgICBpZiAoZS5pbml0RXZlbnQpIHtcbiAgICAgICAgZS5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICAgIH1cbiAgXG4gICAgZS5rZXlDb2RlID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUud2hpY2ggPSBwYXJhbWV0ZXJzLmtleUNvZGU7XG4gICAgZS5jaGFyQ29kZSA9IHBhcmFtZXRlcnMuY2hhckNvZGU7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuICAgIGUua2V5ID0gcGFyYW1ldGVycy5rZXk7XG4gIFxuICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIEVtc2NyaXB0ZW4ncyBodG1sNS5oIEFQSTpcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMF07XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzJdO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCB0byBicm93c2VyIGZvciByZWFsXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPyBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSkgOiBlbGVtZW50LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gZXZlbnRUeXBlOiBcIm1vdXNlbW92ZVwiLCBcIm1vdXNlZG93blwiIG9yIFwibW91c2V1cFwiLlxuICAvLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG4gIHNpbXVsYXRlTW91c2VFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBSZW1hcCBmcm9tIFswLDFdIHRvIGNhbnZhcyBDU1MgcGl4ZWwgc2l6ZS5cbiAgICB2YXIgeCA9IHBhcmFtZXRlcnMueDtcbiAgICB2YXIgeSA9IHBhcmFtZXRlcnMueTtcblxuICAgIHggKj0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB5ICo9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBcbiAgICAvLyBPZmZzZXQgdGhlIGluamVjdGVkIGNvb3JkaW5hdGUgZnJvbSB0b3AtbGVmdCBvZiB0aGUgY2xpZW50IGFyZWEgdG8gdGhlIHRvcC1sZWZ0IG9mIHRoZSBjYW52YXMuXG4gICAgeCA9IE1hdGgucm91bmQocmVjdC5sZWZ0ICsgeCk7XG4gICAgeSA9IE1hdGgucm91bmQocmVjdC50b3AgKyB5KTtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgZS5pbml0TW91c2VFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlID09ICdtb3VzZW1vdmUnID8gMCA6IDEsIHgsIHksIHgsIHksXG4gICAgICAgICAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuYnV0dG9uLCBudWxsKTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pIHtcbiAgICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhdGluZyBET00gZXZlbnRzIGRvZXNuJ3QgYWxsb3cgc3BlY2lmeWluZyBvZmZzZXRYICYgb2Zmc2V0WSBwcm9wZXJseVxuICAgICAgLy8gZm9yIHRoZSBlbGVtZW50LCBidXQgdGhleSBtdXN0IGJlIHRoZSBzYW1lIGFzIGNsaWVudFggJiBjbGllbnRZLiBUaGVyZWZvcmUgd2UgY2FuJ3QgaGF2ZSBhXG4gICAgICAvLyBib3JkZXIgdGhhdCB3b3VsZCBtYWtlIHRoZXNlIGRpZmZlcmVudC5cbiAgICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9IGVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICAgICAgfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT0gZWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgdGhyb3cgXCJFUlJPUiEgQ2FudmFzIG9iamVjdCBtdXN0IGhhdmUgMHB4IGJvcmRlciBmb3IgZGlyZWN0IG1vdXNlIGRpc3BhdGNoIHRvIHdvcmshXCI7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMF07XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzJdO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJZiBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcyBpcyBzZXQsIHRoZSBwYWdlIG5lZWRzIGEgZnVsbCBzZXQgb2YgYXR0cmlidXRlc1xuICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBuZXcgY3VzdG9tIG9iamVjdCAod2l0aG91dCBwcm90b3R5cGUgY2hhaW4pIHRvIGhvbGQgdGhlIG92ZXJyaWRkZW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBldnQgPSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBzcmNFbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0b0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICBldmVudFBoYXNlOiAyLCAvLyBFdmVudC5BVF9UQVJHRVRcbiAgICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgICAgYnV0dG9uOiBlLmJ1dHRvbixcbiAgICAgICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgICBjYW5jZWxCdWJibGU6IGUuY2FuY2VsQnViYmxlLFxuICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBlLmNhbmNlbGFibGUsXG4gICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZLFxuICAgICAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLmRldGFpbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogZS5pZGVudGlmaWVyLFxuICAgICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgICBsYXllclg6IGUubGF5ZXJYLFxuICAgICAgICAgICAgICBsYXllclk6IGUubGF5ZXJZLFxuICAgICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICAgIG1vdmVtZW50WDogZS5tb3ZlbWVudFgsXG4gICAgICAgICAgICAgIG1vdmVtZW50WTogZS5tb3ZlbWVudFksXG4gICAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogZS5vZmZzZXRZLFxuICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICAgIHBhdGg6IGUucGF0aCxcbiAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZS5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgICAgc2NyZWVuWDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICBzY3JlZW5ZOiBlLnNjcmVlblksXG4gICAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgICBzb3VyY2VDYXBhYmlsaXRpZXM6IGUuc291cmNlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICB0aW1lU3RhbXA6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICAgIHZpZXc6IGUudmlldyxcbiAgICAgICAgICAgICAgd2hpY2g6IGUud2hpY2gsXG4gICAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgICAgeTogZS55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHJlZ3VsYXIgJ2UnIG9iamVjdCBpcyBlbm91Z2ggKGl0IGRvZXNuJ3QgcG9wdWxhdGUgYWxsIG9mIHRoZSBzYW1lIGZpZWxkcyB0aGFuIGEgcmVhbCBtb3VzZSBldmVudCBkb2VzLCBcbiAgICAgICAgICAgIC8vIHNvIHRoaXMgbWlnaHQgbm90IHdvcmsgb24gc29tZSBkZW1vcylcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBicm93c2VyXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG59XG4iLCJ2YXIgTW9kdWxlID0ge307XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudExpc3RlbmVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvLyBEb24ndCBjYWxsIGFueSBhcHBsaWNhdGlvbiBwYWdlIHVubG9hZCBoYW5kbGVycyBhcyBhIHJlc3BvbnNlIHRvIHdpbmRvdyBiZWluZyBjbG9zZWQuXG4gIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKSB7XG4gICAgLy8gVGhpcyBpcyBhIGJpdCB0cmlja3kgdG8gbWFuYWdlLCBzaW5jZSB0aGUgcGFnZSBjb3VsZCByZWdpc3RlciB0aGVzZSBoYW5kbGVycyBhdCBhbnkgcG9pbnQsXG4gICAgLy8gc28ga2VlcCB3YXRjaGluZyBmb3IgdGhlbSBhbmQgcmVtb3ZlIHRoZW0gaWYgYW55IGFyZSBhZGRlZC4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAvLyBpbiBhIHNlbWktcG9sbGluZyBmYXNoaW9uIHRvIGVuc3VyZSB0aGVzZSBhcmUgbm90IG92ZXJyaWRkZW4uXG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCkgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9udW5sb2FkKSB3aW5kb3cub251bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25ibHVyKSB3aW5kb3cub25ibHVyID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uZm9jdXMpIHdpbmRvdy5vbmZvY3VzID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZWhpZGUpIHdpbmRvdy5vbnBhZ2VoaWRlID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZXNob3cpIHdpbmRvdy5vbnBhZ2VzaG93ID0gbnVsbDtcbiAgfVxuXG4gIHVubG9hZEFsbEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgZm9yKHZhciBpIGluIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICB2YXIgbCA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKGxbMV0sIGxbMl0sIGxbM10pO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICBcbiAgICAvLyBNYWtlIHN1cmUgbm8gWEhScyBhcmUgYmVpbmcgaGVsZCBvbiB0byBlaXRoZXIuXG4gICAgLy9wcmVsb2FkZWRYSFJzID0ge307XG4gICAgLy9udW1QcmVsb2FkWEhSc0luRmxpZ2h0ID0gMDtcbiAgICAvL1hNTEh0dHBSZXF1ZXN0ID0gcmVhbFhNTEh0dHBSZXF1ZXN0O1xuICBcbiAgICB0aGlzLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgfVxuIFxuICAvL2lmIChpbmplY3RpbmdJbnB1dFN0cmVhbSkgXG4gIGVuYWJsZSgpIHtcblxuICAgIC8vIEZpbHRlciB0aGUgcGFnZSBldmVudCBoYW5kbGVycyB0byBvbmx5IHBhc3MgcHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRvIHRoZSBzaXRlIC0gYWxsIHJlYWwgdXNlciBpbnB1dCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgc2luY2Ugd2UgYXJlXG4gICAgLy8gZG9pbmcgYSBwcm9ncmFtbWF0aWMgcnVuLlxuICAgIHZhciBvdmVycmlkZGVuTWVzc2FnZVR5cGVzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnLFxuICAgICAgJ2NsaWNrJywgJ2RibGNsaWNrJywgJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnLFxuICAgICAgJ3BvaW50ZXJsb2NrY2hhbmdlJywgJ3BvaW50ZXJsb2NrZXJyb3InLCAnd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAnd2Via2l0cG9pbnRlcmxvY2tlcnJvcicsICdtb3pwb2ludGVybG9ja2NoYW5nZScsICdtb3pwb2ludGVybG9ja2Vycm9yJywgJ21zcG9pbnRlcmxvY2tjaGFuZ2UnLCAnbXNwb2ludGVybG9ja2Vycm9yJywgJ29wb2ludGVybG9ja2NoYW5nZScsICdvcG9pbnRlcmxvY2tlcnJvcicsXG4gICAgICAnZGV2aWNlbW90aW9uJywgJ2RldmljZW9yaWVudGF0aW9uJyxcbiAgICAgICdtb3VzZXdoZWVsJywgJ3doZWVsJywgJ1doZWVsRXZlbnQnLCAnRE9NTW91c2VTY3JvbGwnLCAnY29udGV4dG1lbnUnLFxuICAgICAgJ2JsdXInLCAnZm9jdXMnLCAndmlzaWJpbGl0eWNoYW5nZScsICdiZWZvcmV1bmxvYWQnLCAndW5sb2FkJywgJ2Vycm9yJyxcbiAgICAgICdwYWdlaGlkZScsICdwYWdlc2hvdycsICdvcmllbnRhdGlvbmNoYW5nZScsICdnYW1lcGFkY29ubmVjdGVkJywgJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLFxuICAgICAgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJywgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCAnbW96ZnVsbHNjcmVlbmVycm9yJyxcbiAgICAgICdNU0Z1bGxzY3JlZW5DaGFuZ2UnLCAnTVNGdWxsc2NyZWVuRXJyb3InLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyxcbiAgICAgICd3ZWJnbGNvbnRleHRsb3N0JywgJ3dlYmdsY29udGV4dHJlc3RvcmVkJyxcbiAgICAgICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAncG9pbnRlcm91dCcsICdwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAndHJhbnNpdGlvbmVuZCddO1xuICBcbiAgICAvLyBTb21lIGdhbWUgZGVtb3MgcHJvZ3JhbW1hdGljYWxseSBmaXJlIHRoZSByZXNpemUgZXZlbnQuIEZvciBGaXJlZm94IGFuZCBDaHJvbWUsIFxuICAgIC8vIHdlIGRldGVjdCB0aGlzIHZpYSBldmVudC5pc1RydXN0ZWQgYW5kIGtub3cgdG8gY29ycmVjdGx5IHBhc3MgaXQgdGhyb3VnaCwgYnV0IHRvIG1ha2UgU2FmYXJpIGhhcHB5LFxuICAgIC8vIGl0J3MganVzdCBlYXNpZXIgdG8gbGV0IHJlc2l6ZSBjb21lIHRocm91Z2ggZm9yIHRob3NlIGRlbW9zIHRoYXQgbmVlZCBpdC5cbiAgICAvLyBpZiAoIU1vZHVsZVsncGFnZU5lZWRzUmVzaXplRXZlbnQnXSkgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5wdXNoKCdyZXNpemUnKTtcbiAgXG4gICAgLy8gSWYgY29udGV4dCBpcyBzcGVjaWZpZWQsIGFkZEV2ZW50TGlzdGVuZXIgaXMgY2FsbGVkIHVzaW5nIHRoYXQgYXMgdGhlICd0aGlzJyBvYmplY3QuIE90aGVyd2lzZSB0aGUgY3VycmVudCB0aGlzIGlzIHVzZWQuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgdmFyIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT0gLTEgfHwgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSlcbiAgICAgICAgICAgICYmICh0eXBlLmluZGV4T2YoJ2tleScpID09IC0xIHx8IGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKTtcbiAgICAgICAgICB2YXIgZmlsdGVyZWRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSkgeyB0cnkgeyBpZiAoZS5wcm9ncmFtbWF0aWMgfHwgIWUuaXNUcnVzdGVkKSBsaXN0ZW5lcihlKTsgfSBjYXRjaChlKSB7fSB9O1xuICAgICAgICAgIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goW2NvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVhbEFkZEV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5wdXNoKFtjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBFdmVudFRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKEV2ZW50VGFyZ2V0LnByb3RvdHlwZSwgbnVsbCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICB2YXIgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBbd2luZG93LCBkb2N1bWVudCwgZG9jdW1lbnQuYm9keSwgTW9kdWxlWydjYW52YXMnXV07XG4gICAgICAvLyBpZiAoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UuY29uY2F0KE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKTtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0pO1xuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG4gIH0gICAgXG59IiwiLy9pbXBvcnQgS2V5c3Ryb2tlVmlzdWFsaXplciBmcm9tICdrZXlzdHJva2UtdmlzdWFsaXplcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0SGVscGVycyB7XG4gIGluaXRLZXlzKCkge1xuICAvLyAgS2V5c3Ryb2tlVmlzdWFsaXplci5lbmFibGUoe3VubW9kaWZpZWRLZXk6IGZhbHNlfSk7XG4gIH1cblxuICBpbml0TW91c2UoKSB7XG4gICAgdGhpcy5tb3VzZURpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VEaXYuaWQ9J21vdXNlZGl2JztcbiAgICB0aGlzLm1vdXNlQ2xpY2sgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLm1vdXNlQ2xpY2suaWQ9J21vdXNlY2xpY2snO1xuICAgIHRoaXMubW91c2VDbGljay5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgYm9yZGVyLXJhZGl1czogNTAlO1xuICAgICAgd2lkdGg6IDMwcHg7XG4gICAgICBoZWlnaHQ6IDMwcHg7XG4gICAgICBiYWNrZ3JvdW5kOiB5ZWxsb3c7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgIGA7XG5cbiAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO3dpZHRoOjMwcHg7IGhlaWdodDozMHB4OyBsZWZ0OjBweDsgdG9wOjBweDsgYmFja2dyb3VuZC1pbWFnZTp1cmwoJy4uL2N1cnNvci5zdmcnKTt6LWluZGV4Ojk5OTlcIjtcbiAgICBcbiAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubW91c2VEaXYpO1xuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZUNsaWNrKTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChldnQpID0+IHtcbiAgICAgIHRoaXMubW91c2VEaXYuc3R5bGUubGVmdCA9IGV2dC54ICsgXCJweFwiO1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS50b3AgPSBldnQueSArIFwicHhcIjtcblxuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmxlZnQgPSBgJHtldnQueCAtIDN9cHhgO1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnRvcCA9IGV2dC55ICsgXCJweFwiO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIH0pO1xuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB9KTtcblxuICB9XG5cbiAgY29uc3RydWN0b3IgKGNhbnZhcywgb3B0aW9ucykge1xuICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzaG93LWtleWJvYXJkJykgPT09IC0xKSB7XG4gICAgICB0aGlzLmluaXRLZXlzKCk7XG4gICAgfVxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzaG93LW1vdXNlJykgPT09IC0xKSB7XG4gICAgICB0aGlzLmluaXRNb3VzZSgpO1xuICAgIH1cbiAgfVxufSIsImltcG9ydCBGYWtlVGltZXJzIGZyb20gJ2Zha2UtdGltZXJzJztcbmltcG9ydCBDYW52YXNIb29rIGZyb20gJ2NhbnZhcy1ob29rJztcbmltcG9ydCBQZXJmU3RhdHMgZnJvbSAncGVyZm9ybWFuY2Utc3RhdHMnO1xuaW1wb3J0IHNlZWRyYW5kb20gZnJvbSAnc2VlZHJhbmRvbSc7XG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCB7SW5wdXRSZWNvcmRlciwgSW5wdXRSZXBsYXllcn0gZnJvbSAnaW5wdXQtZXZlbnRzLXJlY29yZGVyJztcbmltcG9ydCBFdmVudExpc3RlbmVyTWFuYWdlciBmcm9tICcuL2V2ZW50LWxpc3RlbmVycyc7XG5pbXBvcnQgSW5wdXRIZWxwZXJzIGZyb20gJy4vaW5wdXQtaGVscGVycyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG53aW5kb3cuVEVTVEVSID0ge1xuICByZWFkeTogZmFsc2UsXG5cbiAgLy8gQ3VycmVudGx5IGV4ZWN1dGluZyBmcmFtZS5cbiAgcmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOiAwLFxuICBmaXJzdEZyYW1lVGltZTogbnVsbCxcbiAgLy8gSWYgLTEsIHdlIGFyZSBub3QgcnVubmluZyBhbiBldmVudC4gT3RoZXJ3aXNlIHJlcHJlc2VudHMgdGhlIHdhbGxjbG9jayB0aW1lIG9mIHdoZW4gd2UgZXhpdGVkIHRoZSBsYXN0IGV2ZW50IGhhbmRsZXIuXG4gIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTogLTEsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZGVub3Rpbmcgd2hlbiB0aGUgcGFnZSBoYXMgZmluaXNoZWQgbG9hZGluZy5cbiAgcGFnZUxvYWRUaW1lOiBudWxsLFxuXG4gIC8vIEhvbGRzIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtc2VjcyB0aGF0IHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIGZyYW1lIHRvb2suIFVzZWQgdG8gZXN0aW1hdGUgd2hlbiBhIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIChmYXN0IGZyYW1lIGZvbGxvd2VkIGJ5IGEgc2xvdyBmcmFtZSlcbiAgbGFzdEZyYW1lRHVyYXRpb246IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHRoZSBwcmV2aW91cyBmcmFtZSBmaW5pc2hlZC5cbiAgbGFzdEZyYW1lVGljazogLTEsXG5cbiAgYWNjdW11bGF0ZWRDcHVJZGxlVGltZTogMCxcblxuICAvLyBLZWVwcyB0cmFjayBvZiBwZXJmb3JtYW5jZSBzdHV0dGVyIGV2ZW50cy4gQSBzdHV0dGVyIGV2ZW50IG9jY3VycyB3aGVuIHRoZXJlIGlzIGEgaGljY3VwIGluIHN1YnNlcXVlbnQgcGVyLWZyYW1lIHRpbWVzLiAoZmFzdCBmb2xsb3dlZCBieSBzbG93KVxuICBudW1TdHV0dGVyRXZlbnRzOiAwLFxuXG4gIG51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGU6IDEyMCwgLy8gUmVxdWlyZSAxMjAgZnJhbWVzIGkuZS4gfjIgc2Vjb25kcyBvZiBjb25zZWN1dGl2ZSBzbW9vdGggc3R1dHRlciBmcmVlIGZyYW1lcyB0byBjb25jbHVkZSB3ZSBoYXZlIHJlYWNoZWQgYSBzdGFibGUgYW5pbWF0aW9uIHJhdGVcblxuICAvLyBNZWFzdXJlIGEgXCJ0aW1lIHVudGlsIHNtb290aCBmcmFtZSByYXRlXCIgcXVhbnRpdHksIGkuZS4gdGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd2UgY29uc2lkZXIgdGhlIHN0YXJ0dXAgSklUIGFuZCBHQyBlZmZlY3RzIHRvIGhhdmUgc2V0dGxlZC5cbiAgLy8gVGhpcyBmaWVsZCB0cmFja3MgaG93IG1hbnkgY29uc2VjdXRpdmUgZnJhbWVzIGhhdmUgcnVuIHNtb290aGx5LiBUaGlzIHZhcmlhYmxlIGlzIHNldCB0byAtMSB3aGVuIHNtb290aCBmcmFtZSByYXRlIGhhcyBiZWVuIGFjaGlldmVkIHRvIGRpc2FibGUgdHJhY2tpbmcgdGhpcyBmdXJ0aGVyLlxuICBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lczogMCxcblxuICByYW5kb21TZWVkOiAxLFxuXG4gIG51bUZyYW1lc1RvUmVuZGVyOiB0eXBlb2YgcGFyYW1ldGVyc1snbnVtZnJhbWVzJ10gPT09ICd1bmRlZmluZWQnID8gMTAwIDogcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtZnJhbWVzJ10pLFxuXG4gIC8vIEd1YXJkIGFnYWluc3QgcmVjdXJzaXZlIGNhbGxzIHRvIHJlZmVyZW5jZVRlc3RQcmVUaWNrK3JlZmVyZW5jZVRlc3RUaWNrIGZyb20gbXVsdGlwbGUgckFGcy5cbiAgcmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudDogMCxcblxuICAvLyBDYW52YXMgdXNlZCBieSB0aGUgdGVzdCB0byByZW5kZXJcbiAgY2FudmFzOiBudWxsLFxuXG4gIGlucHV0UmVjb3JkZXI6IG51bGwsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gd2Ugc3RhcnRlZCBDUFUgZXhlY3V0aW9uIG9mIHRoZSBjdXJyZW50IGZyYW1lLlxuICAvLyB2YXIgcmVmZXJlbmNlVGVzdFQwID0gLTE7XG5cbiAgcHJlVGljazogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCsrdGhpcy5yZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50ID09IDEpIHtcbiAgICAgIHRoaXMuc3RhdHMuZnJhbWVTdGFydCgpO1xuXG4gICAgICBpZiAoIXRoaXMuY2FudmFzKSB7XG4gICAgICAgIC8vIFdlIGFzc3VtZSB0aGUgbGFzdCB3ZWJnbCBjb250ZXh0IGJlaW5nIGluaXRpYWxpemVkIGlzIHRoZSBvbmUgdXNlZCB0byByZW5kZXJpbmdcbiAgICAgICAgLy8gSWYgdGhhdCdzIGRpZmZlcmVudCwgdGhlIHRlc3Qgc2hvdWxkIGhhdmUgYSBjdXN0b20gY29kZSB0byByZXR1cm4gdGhhdCBjYW52YXNcbiAgICAgICAgdGhpcy5jYW52YXMgPSBDYW52YXNIb29rLndlYmdsQ29udGV4dHNbQ2FudmFzSG9vay53ZWJnbENvbnRleHRzLmxlbmd0aCAtIDFdLmNhbnZhcztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIgPSBuZXcgSW5wdXRSZWNvcmRlcih0aGlzLmNhbnZhcyk7XG4gICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5lbmFibGUoKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZXBsYXknXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZXBsYXllcikge1xuICAgICAgICBpZiAoR0ZYUEVSRlRFU1RTX0NPTkZJRy5pbnB1dCkge1xuICAgICAgICAgIGZldGNoKCcvdGVzdHMvJyArIEdGWFBFUkZURVNUU19DT05GSUcuaW5wdXQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnB1dFJlcGxheWVyID0gbmV3IElucHV0UmVwbGF5ZXIodGhpcy5jYW52YXMsIGpzb24sIHRoaXMuZXZlbnRMaXN0ZW5lci5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpO1xuICAgICAgICAgICAgLy90aGlzLmlucHV0UmVwbGF5ZXIgPSBuZXcgSW5wdXRSZXBsYXllcih0aGlzLmNhbnZhcywganNvbik7XG4gICAgICAgICAgICAvL2lmIChwYXJhbWV0ZXJzLnNob3dNb3VzZSB8fMKgcGFyYW1ldGVycy5zaG93S2V5cylcbiAgICAgICAgICAgIHRoaXMuaW5wdXRIZWxwZXJzID0gbmV3IElucHV0SGVscGVycyh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8vIHJlZmVyZW5jZVRlc3RUMCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGlmICh0aGlzLnBhZ2VMb2FkVGltZSA9PT0gbnVsbCkgdGhpcy5wYWdlTG9hZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwYWdlSW5pdFRpbWU7XG5cbiAgICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgICAgaWYgKHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lICE9IC0xKSB7XG4gICAgICAgIHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuICAgIGlmICgtLXRoaXMucmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA+IDApXG4gICAgICByZXR1cm47IC8vIFdlIGFyZSBiZWluZyBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGlnbm9yZSB0aGlzIGNhbGwuXG5cbiAgICBpZiAoIXRoaXMucmVhZHkpIHtyZXR1cm47fVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgdGhpcy5pbnB1dFJlY29yZGVyLmZyYW1lTnVtYmVyID0gdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZXBsYXllcikge1xuICAgICAgdGhpcy5pbnB1dFJlcGxheWVyLnRpY2sodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIpO1xuICAgIH1cblxuLyogICAgXG4gICAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuKi8gIFxuICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgdmFyIGZyYW1lRHVyYXRpb24gPSB0aW1lTm93IC0gdGhpcy5sYXN0RnJhbWVUaWNrO1xuICAgIHRoaXMubGFzdEZyYW1lVGljayA9IHRpbWVOb3c7XG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID4gNSAmJiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID4gMCkge1xuICAgICAgLy8gVGhpcyBtdXN0IGJlIGZpeGVkIGRlcGVuZGluZyBvbiB0aGUgdnN5bmNcbiAgICAgIGlmIChmcmFtZUR1cmF0aW9uID4gMjAuMCAmJiBmcmFtZUR1cmF0aW9uID4gdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiAqIDEuMzUpIHtcbiAgICAgICAgdGhpcy5udW1TdHV0dGVyRXZlbnRzKys7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB7XG4gICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcysrO1xuICAgICAgICAgIGlmICh0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID49IHRoaXMubnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVVbnRpbFNtb290aEZyYW1lcmF0ZScsIHRpbWVOb3cgLSB0aGlzLmZpcnN0RnJhbWVUaW1lKTtcbiAgICAgICAgICAgIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiA9IGZyYW1lRHVyYXRpb247XG4vKlxuICAgIGlmIChudW1QcmVsb2FkWEhSc0luRmxpZ2h0ID09IDApIHsgLy8gSW1wb3J0YW50ISBUaGUgZnJhbWUgbnVtYmVyIGFkdmFuY2VzIG9ubHkgZm9yIHRob3NlIGZyYW1lcyB0aGF0IHRoZSBnYW1lIGlzIG5vdCB3YWl0aW5nIGZvciBkYXRhIGZyb20gdGhlIGluaXRpYWwgbmV0d29yayBkb3dubG9hZHMuXG4gICAgICBpZiAobnVtU3RhcnR1cEJsb2NrZXJYSFJzUGVuZGluZyA9PSAwKSArK3RoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOyAvLyBBY3R1YWwgcmVmdGVzdCBmcmFtZSBjb3VudCBvbmx5IGluY3JlbWVudHMgYWZ0ZXIgZ2FtZSBoYXMgY29uc3VtZWQgYWxsIHRoZSBjcml0aWNhbCBYSFJzIHRoYXQgd2VyZSB0byBiZSBwcmVsb2FkZWQuXG4gICAgICArK2Zha2VkVGltZTsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG4gICAgfVxuKi9cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcisrO1xuICAgIEZha2VUaW1lcnMuZmFrZWRUaW1lKys7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICBcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IDEpIHtcbiAgICAgIHRoaXMuZmlyc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBjb25zb2xlLmxvZygnRmlyc3QgZnJhbWUgc3VibWl0dGVkIGF0IChtcyk6JywgdGhpcy5maXJzdEZyYW1lVGltZSAtIHBhZ2VJbml0VGltZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICBURVNURVIuZG9JbWFnZVJlZmVyZW5jZUNoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgfSxcblxuICBkb0ltYWdlUmVmZXJlbmNlQ2hlY2s6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSBDYW52YXNIb29rLndlYmdsQ29udGV4dHNbQ2FudmFzSG9vay53ZWJnbENvbnRleHRzLmxlbmd0aCAtIDFdLmNhbnZhcztcblxuICAgIC8vIEdyYWIgcmVuZGVyZWQgV2ViR0wgZnJvbnQgYnVmZmVyIGltYWdlIHRvIGEgSlMtc2lkZSBpbWFnZSBvYmplY3QuXG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICBmdW5jdGlvbiByZWZ0ZXN0ICgpIHtcbiAgICAgIGNvbnN0IGluaXQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAvL2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0dWFsSW1hZ2UpO1xuICAgICAgLy9hY3R1YWxJbWFnZS5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjA7Ym90dG9tOjA7ei1pbmRleDo5OTk5MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO2JhY2tncm91bmQtY29sb3I6Izk5OTtmb250LXNpemU6MTAwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWZcIjtcbiAgICAgIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBpbml0O1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IHJlZnRlc3Q7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIC8vcmVmdGVzdCgpOyAvLyBjYW52YXMudG9EYXRhVVJMKCkgbGlrZWx5IGZhaWxlZCwgcmV0dXJuIHJlc3VsdHMgaW1tZWRpYXRlbHkuXG4gICAgfVxuICB9LFxuXG4gIGluaXRTZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly8nICsgR0ZYUEVSRlRFU1RTX0NPTkZJRy5zZXJ2ZXJJUCArICc6ODg4OCc7XG5cbiAgICB0aGlzLnNvY2tldCA9IGlvLmNvbm5lY3Qoc2VydmVyVXJsKTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCdiZW5jaG1hcmtfc3RhcnRlZCcsIHtpZDogR0ZYUEVSRlRFU1RTX0NPTkZJRy5pZH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ25leHRfYmVuY2htYXJrJywgKGRhdGEpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCduZXh0X2JlbmNobWFyaycsIGRhdGEpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoZGF0YS51cmwpO1xuICAgIH0pOyAgICBcbiAgfSxcbiAgXG4gIGJlbmNobWFya0ZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgICNiZW5jaG1hcmtfZmluaXNoZWQge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjOTk5O1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgZm9udC1zaXplOiA0MHB4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5O1xuICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICAgICAgfVxuICAgICAgXG4gICAgICAjYmVuY2htYXJrX2ZpbmlzaGVkIC5idXR0b24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBib3JkZXItY29sb3I6ICMwMDcwOTU7XG4gICAgICAgIGNvbG9yOiAjRkZGRkZGO1xuICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XG4gICAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgICAgZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhIE5ldWVcIiwgXCJIZWx2ZXRpY2FcIiwgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiAhaW1wb3J0YW50O1xuICAgICAgICBmb250LXNpemU6IDE2cHg7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgIGxpbmUtaGVpZ2h0OiBub3JtYWw7XG4gICAgICAgIHBhZGRpbmc6IDE1cHggMjBweCAxNXB4IDIwcHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLWNvbG9yIDMwMG1zIGVhc2Utb3V0O1xuICAgICAgfVxuXG4gICAgICAjYmVuY2htYXJrX2ZpbmlzaGVkIC5idXR0b246aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3OGEwO1xuICAgICAgfVxuICAgICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgIHZhciB0aW1lRW5kID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIHZhciB0b3RhbFRpbWUgPSB0aW1lRW5kIC0gcGFnZUluaXRUaW1lOyAvLyBUb3RhbCB0aW1lLCBpbmNsdWRpbmcgZXZlcnl0aGluZy5cblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gYFxuICAgICAgPGgxPlRlc3QgZmluaXNoZWQhPC9oMT5cbiAgICBgO1xuICAgIC8vZGl2LmFwcGVuZENoaWxkKHRleHQpO1xuICAgIGRpdi5pZCA9ICdiZW5jaG1hcmtfZmluaXNoZWQnO1xuICAgIFxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIC8vIER1bXAgaW5wdXRcbiAgICAgIGZ1bmN0aW9uIHNhdmVTdHJpbmcgKHRleHQsIGZpbGVuYW1lLCBtaW1lVHlwZSkge1xuICAgICAgICBzYXZlQmxvYihuZXcgQmxvYihbIHRleHQgXSwgeyB0eXBlOiBtaW1lVHlwZSB9KSwgZmlsZW5hbWUpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBzYXZlQmxvYiAoYmxvYiwgZmlsZW5hbWUpIHtcbiAgICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgbGluay5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lIHx8ICdpbnB1dC5qc29uJztcbiAgICAgICAgbGluay5jbGljaygpO1xuICAgICAgICAvLyBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7IGJyZWFrcyBGaXJlZm94Li4uXG4gICAgICB9XG5cbiAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkodGhpcy5pbnB1dFJlY29yZGVyLmV2ZW50cywgbnVsbCwgMik7XG5cbiAgICAgIC8vY29uc29sZS5sb2coJ0lucHV0IHJlY29yZGVkJywganNvbik7XG5cbiAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgIGxpbmsuaHJlZiA9ICcjJztcbiAgICAgIGxpbmsuY2xhc3NOYW1lID0gJ2J1dHRvbic7XG4gICAgICBsaW5rLm9uY2xpY2sgPSAoKSA9PiBzYXZlU3RyaW5nKGpzb24sIEdGWFBFUkZURVNUU19DT05GSUcuaWQgKyAnLmpzb24nLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgbGluay5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShgRG93bmxvYWQgaW5wdXQgSlNPTmApKTsgLy8gKCR7dGhpcy5pbnB1dFJlY29yZGVyLmV2ZW50cy5sZW5ndGh9IGV2ZW50cyByZWNvcmRlZClcbiAgICAgIGRpdi5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICB9XG5cbiAgICB2YXIgdG90YWxSZW5kZXJUaW1lID0gdGltZUVuZCAtIHRoaXMuZmlyc3RGcmFtZVRpbWU7XG4gICAgdmFyIGNwdUlkbGUgPSB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKiAxMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXNUb1JlbmRlciAqIDEwMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICBcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHRlc3RfaWQ6IEdGWFBFUkZURVNUU19DT05GSUcuaWQsXG4gICAgICB2YWx1ZXM6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUsXG4gICAgICBsb2dzOiB0aGlzLmxvZ3MsXG4gICAgICBhdmdGcHM6IGZwcyxcbiAgICAgIG51bVN0dXR0ZXJFdmVudHM6IHRoaXMubnVtU3R1dHRlckV2ZW50cyxcbiAgICAgIHJlc3VsdDogJ1BBU1MnLFxuICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICB0b3RhbFJlbmRlclRpbWU6IHRvdGFsUmVuZGVyVGltZSxcbiAgICAgIGNwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCxcbiAgICAgIGNwdUlkbGVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCxcbiAgICAgIGNwdUlkbGVQZXJjOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCAqIDEwMCAvIHRvdGFsUmVuZGVyVGltZSxcbiAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnNvY2tldCkge1xuICAgICAgdGhpcy5zb2NrZXQuZW1pdCgnYmVuY2htYXJrX2ZpbmlzaCcsIGRhdGEpO1xuICAgICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCBkYXRhKTtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNsb3NlKSB3aW5kb3cuY2xvc2UoKTtcbiAgfSxcblxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKEdGWFBFUkZURVNUU19DT05GSUcuc2VuZExvZylcbiAgICAgICAgICAgIFRFU1RFUi5zb2NrZXQuZW1pdCgnbG9nJywgYXJncyk7XG5cbiAgICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBhZGRQcm9ncmVzc0JhcjogZnVuY3Rpb24oKSB7XG4gICAgd2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snb3JkZXItZ2xvYmFsJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdlByb2dyZXNzQmFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2UHJvZ3Jlc3NCYXJzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6ICMzMzM7IHdpZHRoOiAyMDBweDsgcGFkZGluZzogMTBweCAxMHB4IDBweCAxMHB4Oyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzQmFycyk7XG4gICAgICBcbiAgICAgIHZhciBvcmRlckdsb2JhbCA9IHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddO1xuICAgICAgdmFyIHRvdGFsR2xvYmFsID0gcGFyYW1ldGVyc1sndG90YWwtZ2xvYmFsJ107XG4gICAgICB2YXIgcGVyY0dsb2JhbCA9IE1hdGgucm91bmQob3JkZXJHbG9iYWwvdG90YWxHbG9iYWwgKiAxMDApO1xuICAgICAgdmFyIG9yZGVyVGVzdCA9IHBhcmFtZXRlcnNbJ29yZGVyLXRlc3QnXTtcbiAgICAgIHZhciB0b3RhbFRlc3QgPSBwYXJhbWV0ZXJzWyd0b3RhbC10ZXN0J107XG4gICAgICB2YXIgcGVyY1Rlc3QgPSBNYXRoLnJvdW5kKG9yZGVyVGVzdC90b3RhbFRlc3QgKiAxMDApO1xuICAgICAgXG4gICAgICBmdW5jdGlvbiBhZGRQcm9ncmVzc0JhclNlY3Rpb24odGV4dCwgY29sb3IsIHBlcmMpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuc3R5bGUuY3NzVGV4dD0nd2lkdGg6IDEwMCU7IGhlaWdodDogMjBweDsgbWFyZ2luLWJvdHRvbTogMTBweDsgb3ZlcmZsb3c6IGhpZGRlbjsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsgYm9yZGVyLXJhZGl1czogNHB4OyAtd2Via2l0LWJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDJweCByZ2JhKDAsMCwwLC4xKTsgYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMnB4IHJnYmEoMCwwLDAsLjEpOyc7XG4gICAgICAgIGRpdlByb2dyZXNzQmFycy5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRpdlByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkaXZQcm9ncmVzcyk7XG4gICAgICAgIGRpdlByb2dyZXNzLnN0eWxlLmNzc1RleHQ9YHdpZHRoOiAke3BlcmN9JTsgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn0gZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMzMzdhYjc7XG4gICAgICAgICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIC0xcHggMCByZ2JhKDAsMCwwLC4xNSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgLW8tdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7YDtcbiAgICAgICAgICBkaXZQcm9ncmVzcy5pbm5lclRleHQgPSB0ZXh0OztcbiAgICAgIH1cblxuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyVGVzdH0vJHt0b3RhbFRlc3R9ICR7cGVyY1Rlc3R9JWAsICcjNWJjMGRlJywgcGVyY1Rlc3QpO1xuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyR2xvYmFsfS8ke3RvdGFsR2xvYmFsfSAke3BlcmNHbG9iYWx9JWAsICcjMzM3YWI3JywgcGVyY0dsb2JhbCk7XG4gICAgICByZXR1cm47XG4gICAgICAvKlxuXHRcdDxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiIHN0eWxlPVwid2lkdGg6IDEwMCVcIj5cblx0XHRcdFx0PGRpdiBpZD1cInByb2dyZXNzYmFyMlwiIGNsYXNzPVwicHJvZ3Jlc3MtYmFyXCIgcm9sZT1cInByb2dyZXNzYmFyXCIgc3R5bGU9XCJ3aWR0aDogNTAlOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjBhZDRlXCI+XG5cdFx0XHRcdFx0MS8xMDAgMTAlXG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0PC9kaXY+XHRcbiovXG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUZXN0IGZpbmlzaGVkIScpO1xuICAgICAgZGl2LmFwcGVuZENoaWxkKHRleHQpO1xuICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7cmlnaHQ6MDt0b3A6MDtib3R0b206MDt6LWluZGV4Ojk5OTk7YmFja2dyb3VuZC1jb2xvcjojOTk5O2ZvbnQtc2l6ZToxMDBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZlwiO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgLy8gY29uc29sZS5sb2coJ1RpbWUgc3BlbnQgZ2VuZXJhdGluZyByZWZlcmVuY2UgaW1hZ2VzOicsIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyk7ICBcbiAgICB9XG4gIH0sXG5cbiAgaG9va01vZGFsczogZnVuY3Rpb24oKSB7XG4gICAgLy8gSG9vayBtb2RhbHM6IFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxuICAgIHdpbmRvdy5hbGVydCA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuYWxlcnQoJyArIG1zZyArICcpJyk7IH1cbiAgICB3aW5kb3cuY29uZmlybSA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuY29uZmlybSgnICsgbXNnICsgJyknKTsgcmV0dXJuIHRydWU7IH1cbiAgfSxcblxuICBob29rUkFGOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF3aW5kb3cucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNhbGxiYWNrID0+IHtcbiAgICAgICAgY29uc3QgaG9va2VkQ2FsbGJhY2sgPSBwID0+IHtcbiAgICAgICAgICBpZiAoR0ZYUEVSRlRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCkgeyBcbiAgICAgICAgICAgIEdGWFBFUkZURVNUU19DT05GSUcucHJlTWFpbkxvb3AoKTsgXG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucHJlVGljaygpO1xuICAgIFxuICAgICAgICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gdGhpcy5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5iZW5jaG1hcmtGaW5pc2hlZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICBcbiAgICAgICAgICBjYWxsYmFjayhwZXJmb3JtYW5jZS5ub3coKSk7XG4gICAgICAgICAgdGhpcy50aWNrKCk7XG4gICAgICAgICAgdGhpcy5zdGF0cy5mcmFtZUVuZCgpO1xuICBcbiAgICAgICAgICBpZiAoR0ZYUEVSRlRFU1RTX0NPTkZJRy5wb3N0TWFpbkxvb3ApIHtcbiAgICAgICAgICAgIEdGWFBFUkZURVNUU19DT05GSUcucG9zdE1haW5Mb29wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aW5kb3cucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZShob29rZWRDYWxsYmFjayk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmICghR0ZYUEVSRlRFU1RTX0NPTkZJRy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gICAgICB0aGlzLmhvb2tSQUYoKTtcbiAgICB9XG4gICAgdGhpcy5hZGRQcm9ncmVzc0JhcigpO1xuXG4gICAgY29uc29sZS5sb2coJ0ZyYW1lcyB0byByZW5kZXI6JywgdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG5cbiAgICBpZiAoIUdGWFBFUkZURVNUU19DT05GSUcuZG9udE92ZXJyaWRlVGltZSkge1xuICAgICAgRmFrZVRpbWVycy5lbmFibGUoKTtcbiAgICB9XG5cbiAgICBNYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20odGhpcy5yYW5kb21TZWVkKTtcblxuICAgIHRoaXMuaGFuZGxlU2l6ZSgpO1xuICAgIENhbnZhc0hvb2suZW5hYmxlKE9iamVjdC5hc3NpZ24oe2Zha2VXZWJHTDogdHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCd9LCB0aGlzLndpbmRvd1NpemUpKTtcbiAgICB0aGlzLmhvb2tNb2RhbHMoKTtcblxuICAgIC8vIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMubG9ncyA9IHtcbiAgICAgIGVycm9yczogW10sXG4gICAgICB3YXJuaW5nczogW10sXG4gICAgICBjYXRjaEVycm9yczogW11cbiAgICB9O1xuICAgIHRoaXMud3JhcEVycm9ycygpO1xuXG4gICAgdGhpcy5ldmVudExpc3RlbmVyID0gbmV3IEV2ZW50TGlzdGVuZXJNYW5hZ2VyKCk7XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZXBsYXknXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy50aW1lU3RhcnQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gIH0sXG5cbiAgaGFuZGxlU2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgREVGQVVMVF9XSURUSCA9IDgwMDtcbiAgICBjb25zdCBERUZBVUxUX0hFSUdIVCA9IDYwMDtcbiAgICB0aGlzLndpbmRvd1NpemUgPSB7fTtcbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ2tlZXAtd2luZG93LXNpemUnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93U2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IHR5cGVvZiBwYXJhbWV0ZXJzWyd3aWR0aCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfV0lEVEggOiBwYXJzZUludChwYXJhbWV0ZXJzWyd3aWR0aCddKSxcbiAgICAgICAgaGVpZ2h0OiB0eXBlb2YgcGFyYW1ldGVyc1snaGVpZ2h0J10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9IRUlHSFQgOiBwYXJzZUludChwYXJhbWV0ZXJzWydoZWlnaHQnXSlcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5pbm5lcldpZHRoID0gdGhpcy53aW5kb3dTaXplLndpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdGhpcy53aW5kb3dTaXplLmhlaWdodDtcbiAgICB9XG4gIH1cbn07XG5cblRFU1RFUi5pbml0KCk7XG5cbnZhciBwYWdlSW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4iXSwibmFtZXMiOlsiU3RhdHMiLCJ0aGlzIiwiZGVmaW5lIiwicmVxdWlyZSQkMCIsInNyIiwiZGVjb2RlIiwiZGVjb2RlQ29tcG9uZW50Iiwic2VlZHJhbmRvbSIsIlBlcmZTdGF0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Q0FBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRCLE1BQU0sUUFBUSxDQUFDO0NBQ2YsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFO0NBQ2pCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZixHQUFHOztDQUVILEVBQUUsT0FBTyxHQUFHLEdBQUc7Q0FDZixJQUFJLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQzFCLEdBQUc7O0NBRUgsRUFBRSxPQUFPLE9BQU8sR0FBRztDQUNuQixJQUFJLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQzFCLEdBQUc7O0NBRUgsRUFBRSxpQkFBaUIsR0FBRztDQUN0QixJQUFJLE9BQU8sQ0FBQyxDQUFDO0NBQ2IsR0FBRzs7Q0FFSCxFQUFFLFlBQVksR0FBRztDQUNqQixJQUFJLE9BQU8sRUFBRSxDQUFDO0NBQ2QsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDekIsRUFBRSxNQUFNLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQ3hCLEVBQUUsV0FBVyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUM3QixFQUFFLFFBQVEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDMUIsRUFBRSxlQUFlLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQ2pDLEVBQUUsUUFBUSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUMxQixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDNUIsRUFBRSxVQUFVLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQzVCLEVBQUUsT0FBTyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUN6QixFQUFFLE9BQU8sR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7O0NBRXpCLEVBQUUsT0FBTyxHQUFHLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFOztDQUU1QixFQUFFLFVBQVUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDNUIsRUFBRSxTQUFTLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQzNCLEVBQUUsY0FBYyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUNoQyxFQUFFLFdBQVcsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDN0IsRUFBRSxrQkFBa0IsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7Q0FDcEMsRUFBRSxXQUFXLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFO0NBQzdCLEVBQUUsYUFBYSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRTtDQUMvQixFQUFFLGFBQWEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUU7O0NBRS9CLEVBQUUsT0FBTyxHQUFHLEVBQUU7Q0FDZCxFQUFFLFdBQVcsR0FBRyxFQUFFO0NBQ2xCLEVBQUUsUUFBUSxHQUFHLEVBQUU7Q0FDZixFQUFFLGVBQWUsR0FBRyxFQUFFO0NBQ3RCLEVBQUUsVUFBVSxHQUFHLEVBQUU7Q0FDakIsRUFBRSxRQUFRLEdBQUcsRUFBRTtDQUNmLEVBQUUsVUFBVSxHQUFHLEVBQUU7Q0FDakIsRUFBRSxPQUFPLEdBQUcsRUFBRTs7Q0FFZCxFQUFFLFVBQVUsR0FBRyxFQUFFO0NBQ2pCLEVBQUUsY0FBYyxHQUFHLEVBQUU7Q0FDckIsRUFBRSxXQUFXLEdBQUcsRUFBRTtDQUNsQixFQUFFLGtCQUFrQixHQUFHLEVBQUU7Q0FDekIsRUFBRSxhQUFhLEdBQUcsRUFBRTtDQUNwQixFQUFFLFdBQVcsR0FBRyxFQUFFOztDQUVsQixFQUFFLE9BQU8sR0FBRyxFQUFFO0NBQ2QsQ0FBQzs7Q0FFRCxJQUFJLGVBQWUsQ0FBQzs7Q0FFcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUU7Q0FDMUIsRUFBRSxJQUFJLFFBQVEsR0FBRyxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQzVFLEVBQUUsSUFBSSxRQUFRLEVBQUU7Q0FDaEIsSUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDO0NBQ2xDLElBQUksV0FBVyxHQUFHO0NBQ2xCLE1BQU0sT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0NBQzNELE1BQU0sR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFO0NBQ3ZELEtBQUssQ0FBQztDQUNOLEdBQUcsTUFBTTtDQUNULElBQUksV0FBVyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0NBQzFDLEdBQUc7Q0FDSCxDQUFDOztBQUVELGtCQUFlO0NBQ2YsRUFBRSxTQUFTLEVBQUUsR0FBRztDQUNoQixFQUFFLFNBQVMsRUFBRSxDQUFDO0NBQ2QsRUFBRSxPQUFPLEVBQUUsS0FBSztDQUNoQixFQUFFLG9DQUFvQyxFQUFFLEtBQUs7Q0FDN0MsRUFBRSxZQUFZLEVBQUUsVUFBVSxZQUFZLEdBQUc7Q0FDekMsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztDQUNsQyxHQUFHO0NBQ0gsRUFBRSxNQUFNLEVBQUUsWUFBWTtDQUN0QixJQUFJLElBQUksR0FBRyxRQUFRLENBQUM7Q0FDcEI7Q0FDQSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztDQUNwQixJQUFJLElBQUksSUFBSSxDQUFDLG9DQUFvQyxFQUFFO0NBQ25ELE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUU7Q0FDeEYsTUFBTSxXQUFXLENBQUMsR0FBRyxHQUFHLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRTtDQUMvRixLQUFLLE1BQU07Q0FDWCxNQUFNLElBQUksQ0FBQyxHQUFHLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRTtDQUN2RixNQUFNLFdBQVcsQ0FBQyxHQUFHLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRTtDQUM5RixLQUFLO0NBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0NBQ3hCLEdBQUc7Q0FDSCxFQUFFLE9BQU8sRUFBRSxZQUFZO0NBQ3ZCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsQUFDbEM7Q0FDQSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUM7Q0FDcEIsSUFBSSxXQUFXLENBQUMsR0FBRyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUM7Q0FDMUM7Q0FDQSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0NBQ3pCLEdBQUc7Q0FDSDs7Q0M3R0EsTUFBTSxRQUFRLEdBQUcsQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixDQUFDLENBQUM7Q0FDOUUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0NBQzlELE1BQU0sT0FBTyxHQUFHLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxxQkFBcUI7Q0FDaEosZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0NBQ3BGLE1BQU0sT0FBTyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLHNCQUFzQixFQUFFLHdCQUF3QixFQUFFLHlCQUF5QjtDQUM1SSxlQUFlLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsY0FBYztDQUNwSCxtQkFBbUIsRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSwwQkFBMEI7Q0FDNUosUUFBUSxFQUFFLHlCQUF5QixFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLG1CQUFtQjtDQUMvSixpQkFBaUIsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLHlCQUF5QixFQUFFLHdCQUF3QjtDQUM5SSxjQUFjLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGFBQWEsRUFBRSx1QkFBdUIsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxNQUFNO0NBQzlKLGFBQWEsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLHFCQUFxQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFlBQVk7Q0FDN0ksWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsaUJBQWlCO0NBQzdKLGlCQUFpQixFQUFFLHFCQUFxQixFQUFFLFlBQVksRUFBRSx1QkFBdUIsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsYUFBYTtDQUN6SixrQkFBa0IsRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLHVCQUF1QjtDQUM1RixvQkFBb0IsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFdBQVc7Q0FDekosa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLG9CQUFvQixFQUFFLG9CQUFvQjtDQUN0SSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLG1CQUFtQjtDQUMvSixtQkFBbUIsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsMkJBQTJCLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCO0NBQ3ZILFlBQVksRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSx5QkFBeUIsRUFBRSxxQkFBcUIsRUFBRSxTQUFTLEVBQUUscUJBQXFCO0NBQ2hLLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLHFCQUFxQixFQUFFLFlBQVksRUFBRSxlQUFlO0NBQ2pJLHNCQUFzQixFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUseUJBQXlCO0NBQzNJLGdDQUFnQyxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsc0JBQXNCLEVBQUUsaUJBQWlCO0NBQ2hKLFlBQVksRUFBRSxxQkFBcUIsRUFBRSwwQkFBMEIsRUFBRSxjQUFjLEVBQUUsbUJBQW1CO0NBQ3BHLHNCQUFzQixFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUseUJBQXlCLEVBQUUsZ0JBQWdCLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCO0NBQy9JLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLFlBQVksRUFBRSx5QkFBeUIsRUFBRSxlQUFlLENBQUMsQ0FBQztDQUNsRyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWpCLENBQWUsU0FBUyxTQUFTLENBQUMsRUFBRSxFQUFFO0NBQ3RDLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7Q0FDZCxDQUFDLEtBQUssSUFBSSxHQUFHLElBQUksRUFBRSxFQUFFO0NBQ3JCLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxVQUFVLEVBQUU7Q0FDckMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDckMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNqQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RDLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxJQUFJLE1BQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQy9DLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdkMsSUFBSSxNQUFNO0NBQ1Y7Q0FDQSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2pDLElBQUk7Q0FDSixHQUFHLE1BQU07Q0FDVCxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDdkIsR0FBRztDQUNILEVBQUU7Q0FDRixDQUFDOztDQy9DRCxJQUFJLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7Q0FDaEUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUU7Q0FDaEQsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLGtCQUFrQixDQUFDO0NBQ25FLENBQUM7O0NBRUQsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDOztBQUVwQixrQkFBZTtDQUNmLEVBQUUsYUFBYSxFQUFFLEVBQUU7Q0FDbkIsRUFBRSxNQUFNLEVBQUUsVUFBVSxPQUFPLEVBQUU7Q0FDN0IsSUFBSSxJQUFJLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs7Q0FFMUIsSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDcEIsSUFBSSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFdBQVc7Q0FDeEQsTUFBTSxJQUFJLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQzFELE1BQU0sSUFBSSxDQUFDLEdBQUcsWUFBWSxxQkFBcUIsTUFBTSxNQUFNLENBQUMsc0JBQXNCLEtBQUssR0FBRyxZQUFZLHNCQUFzQixDQUFDLENBQUMsRUFBRTtDQUNoSSxRQUFRLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ3JDLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Q0FDN0MsVUFBVSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7Q0FDckMsVUFBVSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7Q0FDdkMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxjQUFjLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDbEcsU0FBUzs7Q0FFVCxRQUFRLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtDQUMvQixVQUFVLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNuQyxTQUFTO0NBQ1QsT0FBTztDQUNQLE1BQU0sT0FBTyxHQUFHLENBQUM7Q0FDakIsTUFBSztDQUNMLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQztDQUNuQixHQUFHOztDQUVILEVBQUUsT0FBTyxFQUFFLFlBQVk7Q0FDdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDO0NBQzNCLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztDQUNoRSxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7Q0FDcEIsR0FBRztDQUNILENBQUM7O0dBQUMsRkNyQ2EsTUFBTSxTQUFTLENBQUM7Q0FDL0IsRUFBRSxXQUFXLEdBQUc7Q0FDaEIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO0NBQ2hDLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Q0FDakMsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztDQUNqQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0NBQ2xCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZixHQUFHOztDQUVILEVBQUUsSUFBSSxRQUFRLEdBQUc7Q0FDakIsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztDQUMzQixHQUFHOztDQUVILEVBQUUsSUFBSSxrQkFBa0IsR0FBRztDQUMzQixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxHQUFHOztDQUVILEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRTtDQUNoQixJQUFJLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNoQyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0NBQ3BCO0NBQ0EsTUFBTSxPQUFPO0NBQ2IsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ2IsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7Q0FDcEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQy9CLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztDQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMzRCxHQUFHOztDQUVILEVBQUUsTUFBTSxHQUFHO0NBQ1gsSUFBSSxPQUFPO0NBQ1gsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDZixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtDQUNyQixNQUFNLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtDQUM3QixNQUFNLGtCQUFrQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7Q0FDakQsS0FBSyxDQUFDO0NBQ04sR0FBRztDQUNILENBQUM7O0NDNUNEO0NBQ0E7Q0FDQTtBQUNBLENBQWUsb0JBQVEsSUFBSTs7Q0FFM0IsRUFBRSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7Q0FDeEIsRUFBRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRCLEVBQUUsSUFBSSxxQkFBcUIsR0FBRyxDQUFDLENBQUM7Q0FDaEMsRUFBRSxJQUFJLG9CQUFvQixDQUFDO0NBQzNCLEVBQUUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDOztDQUU1QjtDQUNBLEVBQUUsSUFBSSw4QkFBOEIsR0FBRyxDQUFDLENBQUM7O0NBRXpDLEVBQUUsT0FBTztDQUNULElBQUksZUFBZSxFQUFFLFlBQVk7Q0FDakMsTUFBTSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7Q0FDdEIsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJO0NBQzdDLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHO0NBQ3RCLFVBQVUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRztDQUNsQyxVQUFVLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUc7Q0FDbEMsVUFBVSxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJO0NBQ25DLFVBQVUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxrQkFBa0I7Q0FDaEUsU0FBUyxDQUFDO0NBQ1YsT0FBTyxDQUFDLENBQUM7O0NBRVQsTUFBTSxPQUFPLE1BQU0sQ0FBQztDQUNwQixLQUFLOztDQUVMLElBQUksS0FBSyxFQUFFO0NBQ1gsTUFBTSxHQUFHLEVBQUUsSUFBSUEsU0FBSyxFQUFFO0NBQ3RCLE1BQU0sRUFBRSxFQUFFLElBQUlBLFNBQUssRUFBRTtDQUNyQixNQUFNLEdBQUcsRUFBRSxJQUFJQSxTQUFLLEVBQUU7Q0FDdEIsS0FBSzs7Q0FFTCxJQUFJLFNBQVMsRUFBRSxDQUFDO0NBQ2hCLElBQUksR0FBRyxFQUFFLEtBQUs7Q0FDZCxJQUFJLG1CQUFtQixFQUFFLENBQUM7Q0FDMUIsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO0NBQy9CLElBQUksd0JBQXdCLEVBQUUsR0FBRzs7Q0FFakMsSUFBSSxVQUFVLEVBQUUsV0FBVztDQUMzQixNQUFNLDhCQUE4QixFQUFFLENBQUM7Q0FDdkMsTUFBTSxJQUFJLDhCQUE4QixJQUFJLENBQUM7Q0FDN0MsTUFBTTtDQUNOLFFBQVEsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO0NBQ3JDLFVBQVUsY0FBYyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztDQUNqRCxTQUFTOztDQUVULFFBQVEscUJBQXFCLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ3RELFFBQVEsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQzNCLE9BQU87Q0FDUCxLQUFLOztDQUVMLElBQUksV0FBVyxFQUFFLFdBQVc7Q0FDNUIsTUFBTSxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7O0NBRTFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztDQUV2QixNQUFNLElBQUksT0FBTyxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsd0JBQXdCO0NBQ2xFLE1BQU07Q0FDTixRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLE9BQU8sR0FBRyxjQUFjLENBQUMsQ0FBQztDQUNyRSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0NBQzNCLFFBQVEsY0FBYyxHQUFHLE9BQU8sQ0FBQzs7Q0FFakMsUUFBUSxJQUFJLFFBQVE7Q0FDcEIsUUFBUTtDQUNSLFVBQVUsUUFBUSxHQUFHLEtBQUssQ0FBQztDQUMzQixVQUFVLE9BQU87Q0FDakIsU0FBUzs7Q0FFVCxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Q0FFbkMsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7Q0FDdEIsVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUM3TSxVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3pNLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNqTixVQUFVLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQztDQUNuRixTQUFTO0NBQ1QsT0FBTztDQUNQLEtBQUs7O0NBRUw7Q0FDQSxJQUFJLFFBQVEsRUFBRSxXQUFXO0NBQ3pCLE1BQU0sOEJBQThCLEVBQUUsQ0FBQztDQUN2QyxNQUFNLElBQUksOEJBQThCLElBQUksQ0FBQyxFQUFFLE9BQU87O0NBRXRELE1BQU0sSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQzFDLE1BQU0sSUFBSSxtQkFBbUIsR0FBRyxPQUFPLEdBQUcscUJBQXFCLENBQUM7Q0FDaEUsTUFBTSxJQUFJLDJCQUEyQixHQUFHLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQztDQUN2RSxNQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQztDQUNyQztDQUNBLE1BQU0sSUFBSSxVQUFVLEVBQUU7Q0FDdEIsUUFBUSxVQUFVLEdBQUcsS0FBSyxDQUFDO0NBQzNCLFFBQVEsT0FBTztDQUNmLE9BQU87O0NBRVAsTUFBTSxJQUFJLENBQUMsbUJBQW1CLElBQUksbUJBQW1CLENBQUM7Q0FDdEQsTUFBTSxJQUFJLENBQUMsd0JBQXdCLElBQUksMkJBQTJCLEdBQUcsbUJBQW1CLENBQUM7O0NBRXpGLE1BQU0sSUFBSSxHQUFHLEdBQUcsbUJBQW1CLEdBQUcsR0FBRyxHQUFHLDJCQUEyQixDQUFDO0NBQ3hFLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUM7Q0FDeEQsS0FBSztDQUNMLEdBQUc7Q0FDSCxDQUFDOzs7Ozs7Ozs7Q0M1R0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTJCQSxDQUFDLFNBQVMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0NBRWxDLFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRTtHQUNsQixJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDOztHQUU3QixFQUFFLENBQUMsSUFBSSxHQUFHLFdBQVc7S0FDbkIsSUFBSSxDQUFDLEdBQUcsT0FBTyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsQ0FBQztLQUN4RCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDZCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDZCxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25DLENBQUM7OztHQUdGLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1QsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDbEIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsRUFBRSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEIsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUU7R0FDOUIsSUFBSSxHQUFHLElBQUksQ0FBQztFQUNiOztDQUVELFNBQVMsSUFB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QUFLLEVBQUUsQ0FBQztLQUNkLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztLQUVkLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7S0FFVCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7R0FFRixTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFO0tBQ3RCLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxHQUFHLENBQUM7S0FDdkMsSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFOztPQUV2QixDQUFDLEdBQUcsSUFBSSxDQUFDO09BQ1QsSUFBSSxHQUFHLElBQUksQ0FBQztNQUNiLE1BQU07O09BRUwsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7T0FDbkIsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNOLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7TUFDdEM7O0tBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFOztPQUVuQyxJQUFJLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztPQUV2RCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUNuQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2QsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDWixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtTQUNWLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO1NBQ3pCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUI7TUFDRjs7S0FFRCxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUU7T0FDWixDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDMUM7Ozs7S0FJRCxDQUFDLEdBQUcsR0FBRyxDQUFDO0tBQ1IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO09BQzVCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO09BQ3RCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQzNCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDYixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENB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QUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUMzQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDOUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzlCLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkYsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztHQUN0QixFQUFFLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQzs7R0FFbEIsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTs7S0FFN0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFD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
