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
	    this.mouseDiv.style.cssText="position:absolute;width:30px; height:30px; left:0px; top:0px; background-image:url('../cursor.svg');";
	    
	    if (window.location.href.indexOf('show-mouse') === -1) ;
	    this.canvas.parentNode.appendChild(this.mouseDiv);
	    this.canvas.addEventListener('mousemove', (evt) => {
	      this.mouseDiv.style.left = evt.x + "px";
	      this.mouseDiv.style.top = evt.y + "px";
	    });
	  }

	  constructor (canvas, options) {
	    this.canvas = canvas;
	    this.initKeys();
	    this.initMouse();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vLi4vY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uLy4uL2NhbnZhcy1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi8uLi9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlY29yZGVyLmpzIiwiLi4vLi4vaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZXBsYXllci5qcyIsIi4uL3NyYy9jbGllbnQvZXZlbnQtbGlzdGVuZXJzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2tleXN0cm9rZS12aXN1YWxpemVyL2J1aWxkL2tleXN0cm9rZS12aXN1YWxpemVyLmpzIiwiLi4vc3JjL2NsaWVudC9pbnB1dC1oZWxwZXJzLmpzIiwiLi4vc3JjL2NsaWVudC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFsRGF0ZSA9IERhdGU7XG5cbmNsYXNzIE1vY2tEYXRlIHtcbiAgY29uc3RydWN0b3IodCkge1xuICAgIHRoaXMudCA9IHQ7XG4gIH1cblxuICBzdGF0aWMgbm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHN0YXRpYyByZWFsTm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldFRpbWV6b25lT2Zmc2V0KCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdG9UaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldERhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldERheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldEhvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRUaW1lKCkgeyByZXR1cm4gMDsgfVxuICBnZXRZZWFyKCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0YXRpYyBVVEMoKSB7IHJldHVybiAwOyB9XG5cbiAgZ2V0VVRDRGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDSG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ1NlY29uZHMoKSB7IHJldHVybiAwOyB9XG5cbiAgc2V0RGF0ZSgpIHt9XG4gIHNldEZ1bGxZZWFyKCkge31cbiAgc2V0SG91cnMoKSB7fVxuICBzZXRNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRNaW51dGVzKCkge31cbiAgc2V0TW9udGgoKSB7fVxuICBzZXRTZWNvbmRzKCkge31cbiAgc2V0VGltZSgpIHt9XG5cbiAgc2V0VVRDRGF0ZSgpIHt9XG4gIHNldFVUQ0Z1bGxZZWFyKCkge31cbiAgc2V0VVRDSG91cnMoKSB7fVxuICBzZXRVVENNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRVVENNaW51dGVzKCkge31cbiAgc2V0VVRDTW9udGgoKSB7fVxuXG4gIHNldFllYXIoKSB7fVxufVxuXG52YXIgcmVhbFBlcmZvcm1hbmNlO1xuXG5pZiAoIXBlcmZvcm1hbmNlLnJlYWxOb3cpIHtcbiAgdmFyIGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzU2FmYXJpKSB7XG4gICAgcmVhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG4gICAgcGVyZm9ybWFuY2UgPSB7XG4gICAgICByZWFsTm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHBlcmZvcm1hbmNlLnJlYWxOb3cgPSBwZXJmb3JtYW5jZS5ub3c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0aW1lU2NhbGU6IDEuMCxcbiAgZmFrZWRUaW1lOiAwLFxuICBlbmFibGVkOiBmYWxzZSxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG4gICAgXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLm5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcikge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgfVxuICBcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuICAgIFxuICAgIERhdGUgPSBSZWFsRGF0ZTsgICAgXG4gICAgcGVyZm9ybWFuY2Uubm93ID0gcmVhbFBlcmZvcm1hbmNlLm5vdztcbiAgICBcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTsgICAgXG4gIH1cbn0iLCJjb25zdCBvcmlnaW5hbCA9IFsnZ2V0UGFyYW1ldGVyJywgJ2dldEV4dGVuc2lvbicsICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnXTtcbmNvbnN0IGVtcHR5U3RyaW5nID0gWydnZXRTaGFkZXJJbmZvTG9nJywgJ2dldFByb2dyYW1JbmZvTG9nJ107XG5jb25zdCByZXR1cm4xID0gWydpc0J1ZmZlcicsICdpc0VuYWJsZWQnLCAnaXNGcmFtZWJ1ZmZlcicsICdpc1Byb2dyYW0nLCAnaXNRdWVyeScsICdpc1ZlcnRleEFycmF5JywgJ2lzU2FtcGxlcicsICdpc1N5bmMnLCAnaXNUcmFuc2Zvcm1GZWVkYmFjaycsXG4naXNSZW5kZXJidWZmZXInLCAnaXNTaGFkZXInLCAnaXNUZXh0dXJlJywgJ3ZhbGlkYXRlUHJvZ3JhbScsICdnZXRTaGFkZXJQYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7ICBcbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFlbmFibGVkKSB7cmV0dXJuO31cbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubiA9IDA7XG4gICAgdGhpcy5taW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMubWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMubWVhbiA9IDA7XG4gICAgdGhpcy5xID0gMDtcbiAgfVxuXG4gIGdldCB2YXJpYW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5xIC8gdGhpcy5uO1xuICB9XG5cbiAgZ2V0IHN0YW5kYXJkX2RldmlhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubik7XG4gIH1cblxuICB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgIC8vIFNvcnJ5LCBubyBOYU5zXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubisrO1xuICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSk7XG4gICAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKTtcbiAgICB0aGlzLnN1bSArPSBudW07XG4gICAgY29uc3QgcHJldk1lYW4gPSB0aGlzLm1lYW47XG4gICAgdGhpcy5tZWFuID0gdGhpcy5tZWFuICsgKG51bSAtIHRoaXMubWVhbikgLyB0aGlzLm47XG4gICAgdGhpcy5xID0gdGhpcy5xICsgKG51bSAtIHByZXZNZWFuKSAqIChudW0gLSB0aGlzLm1lYW4pO1xuICB9XG5cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuOiB0aGlzLm4sXG4gICAgICBtaW46IHRoaXMubWluLFxuICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgIHN1bTogdGhpcy5zdW0sXG4gICAgICBtZWFuOiB0aGlzLm1lYW4sXG4gICAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICB9O1xuICB9ICBcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgdmFyIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9IDA7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKSAgICAgICAgXG4gICAgfSxcblxuICAgIG51bUZyYW1lczogMCxcbiAgICBsb2c6IGZhbHNlLFxuICAgIHRvdGFsVGltZUluTWFpbkxvb3A6IDAsXG4gICAgdG90YWxUaW1lT3V0c2lkZU1haW5Mb29wOiAwLFxuICAgIGZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbDogMjAwLCAvLyBtc2Vjc1xuXG4gICAgZnJhbWVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPT0gMSkgXG4gICAgICB7XG4gICAgICAgIGlmIChsYXN0VXBkYXRlVGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RVcGRhdGVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpXG4gICAgICB7XG4gICAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lcyAqIDEwMDAgLyAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lKTtcbiAgICAgICAgdGhpcy5udW1GcmFtZXMgPSAwO1xuICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVOb3c7XG5cbiAgICAgICAgaWYgKGZpcnN0RnBzKVxuICAgICAgICB7XG4gICAgICAgICAgZmlyc3RGcHMgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRzLmZwcy51cGRhdGUoZnBzKTtcblxuICAgICAgICBpZiAodGhpcy5sb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZnBzIC0gbWluOiAke3RoaXMuc3RhdHMuZnBzLm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmZwcy5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZnBzLm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmZwcy5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgbXMgIC0gbWluOiAke3RoaXMuc3RhdHMuZHQubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZHQubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmR0Lm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmR0LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBjcHUgLSBtaW46ICR7dGhpcy5zdGF0cy5jcHUubWluLnRvRml4ZWQoMil9JSAvIGF2ZzogJHt0aGlzLnN0YXRzLmNwdS5tZWFuLnRvRml4ZWQoMil9JSAvIG1heDogJHt0aGlzLnN0YXRzLmNwdS5tYXgudG9GaXhlZCgyKX0lIC0gc3RkOiAke3RoaXMuc3RhdHMuY3B1LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfSVgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDYWxsZWQgaW4gdGhlIGVuZCBvZiBlYWNoIG1haW4gbG9vcCBmcmFtZSB0aWNrLlxuICAgIGZyYW1lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlci0tO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRcdCddJ1xuXHRcdFx0XHRdLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCddPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBlbmNvZGUoa2V5LCBvcHRpb25zKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXHRyZXR1cm4gaW5wdXQuc2xpY2UocXVlcnlTdGFydCArIDEpO1xufVxuXG5mdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZGVjb2RlOiB0cnVlLCBhcnJheUZvcm1hdDogJ25vbmUnfSwgb3B0aW9ucyk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cblx0XHRmb3JtYXR0ZXIoZGVjb2RlKGtleSwgb3B0aW9ucyksIHZhbHVlLCByZXQpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdC5rZXlzKHJldCkuc29ydCgpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmIChCb29sZWFuKHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Ly8gU29ydCBvYmplY3Qga2V5cywgbm90IHZhbHVlc1xuXHRcdFx0cmVzdWx0W2tleV0gPSBrZXlzU29ydGVyKHZhbHVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcbn1cblxuZXhwb3J0cy5leHRyYWN0ID0gZXh0cmFjdDtcbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcblxuZXhwb3J0cy5zdHJpbmdpZnkgPSAob2JqLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdGVuY29kZTogdHJ1ZSxcblx0XHRzdHJpY3Q6IHRydWUsXG5cdFx0YXJyYXlGb3JtYXQ6ICdub25lJ1xuXHR9O1xuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRpZiAob3B0aW9ucy5zb3J0ID09PSBmYWxzZSkge1xuXHRcdG9wdGlvbnMuc29ydCA9ICgpID0+IHt9O1xuXHR9XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdHJldHVybiBvYmogPyBPYmplY3Qua2V5cyhvYmopLnNvcnQob3B0aW9ucy5zb3J0KS5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9ialtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdFx0XHRmb3IgKGNvbnN0IHZhbHVlMiBvZiB2YWx1ZS5zbGljZSgpKSB7XG5cdFx0XHRcdGlmICh2YWx1ZTIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmVzdWx0LnB1c2goZm9ybWF0dGVyKGtleSwgdmFsdWUyLCByZXN1bHQubGVuZ3RoKSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQuam9pbignJicpO1xuXHRcdH1cblxuXHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKSArICc9JyArIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdH0pLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMCkuam9pbignJicpIDogJyc7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdHJldHVybiB7XG5cdFx0dXJsOiBpbnB1dC5zcGxpdCgnPycpWzBdIHx8ICcnLFxuXHRcdHF1ZXJ5OiBwYXJzZShleHRyYWN0KGlucHV0KSwgb3B0aW9ucylcblx0fTtcbn07XG4iLCIvLyBNYXBzIG1vdXNlIGNvb3JkaW5hdGUgZnJvbSBlbGVtZW50IENTUyBwaXhlbHMgdG8gbm9ybWFsaXplZCBbIDAsIDEgXSByYW5nZS5cbmZ1bmN0aW9uIGNvbXB1dGVOb3JtYWxpemVkUG9zKGVsZW1lbnQsIGV2dCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciB4ID0gZXZ0LmNsaWVudFggLSByZWN0LmxlZnQ7XG4gIHZhciB5ID0gZXZ0LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgeCAvPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICB5IC89IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICByZXR1cm4gW3gsIHldO1xufVxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZWNvcmRlciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgfVxuXG4gIGVuYWJsZShmb3JjZVJlc2V0KSB7XG4gICAgdGhpcy5pbml0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgfVxuICAgIHRoaXMuaW5qZWN0TGlzdGVuZXJzKCk7XG4gIH1cbi8qXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgfVxuKi9cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmZyYW1lTnVtYmVyID0gMDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG5cbiAgYWRkRXZlbnQodHlwZSwgZXZlbnQsIHBhcmFtZXRlcnMpIHtcbiAgICB2YXIgZXZlbnREYXRhID0ge1xuICAgICAgdHlwZSxcbiAgICAgIGV2ZW50LFxuICAgICAgcGFyYW1ldGVyc1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnVzZVRpbWUpIHtcbiAgICAgIGV2ZW50RGF0YS50aW1lID0gcGVyZm9ybWFuY2Uubm93KCkgLSB0aGlzLmluaXRUaW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudERhdGEuZnJhbWVOdW1iZXIgPSB0aGlzLmZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRzLnB1c2goZXZlbnREYXRhKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLm5ld0V2ZW50Q2FsbGJhY2spIHtcbiAgICAgIHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKGV2ZW50RGF0YSk7XG4gICAgfVxuICB9XG4gIFxuICBpbmplY3RMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnZG93bicsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd1cCcsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ21vdmUnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuXG4gICAgfSk7XG4gIFxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICd3aGVlbCcsIHtcbiAgICAgICAgZGVsdGFYOiBldnQuZGVsdGFYLFxuICAgICAgICBkZWx0YVk6IGV2dC5kZWx0YVksXG4gICAgICAgIGRlbHRhWjogZXZ0LmRlbHRhWixcbiAgICAgICAgZGVsdGFNb2RlOiBldnQuZGVsdGFNb2RlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ2Rvd24nLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pO1xuICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgna2V5JywgJ3VwJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTsgIFxuICB9XG59IiwiZnVuY3Rpb24gc2ltdWxhdGVXaGVlbEV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgZGVsdGFYLCBkZWx0YVksIGRlbHRhWiwgZGVsdGFNb2RlKSB7XG4gIHZhciBlID0gbmV3IEV2ZW50KCd3aGVlbCcpO1xuICBlLmRlbHRhWCA9IGRlbHRhWDtcbiAgZS5kZWx0YVkgPSBkZWx0YVk7XG4gIGUuZGVsdGFaID0gZGVsdGFaO1xuICBlLmRlbHRhTW9kZSA9IGRlbHRhTW9kZTtcbiAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xufVxuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NOiB0cnVlLFxuICBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NOiB0cnVlLFxuICBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkczogZmFsc2Vcbn07XG5cblxuZXhwb3J0IGNsYXNzIElucHV0UmVwbGF5ZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCByZWNvcmRpbmcsIHJlZ2lzdGVyZWRFdmVudExpc3RlbmVycywgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfT1BUSU9OUywgb3B0aW9ucyk7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnJlY29yZGluZyA9IHJlY29yZGluZztcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDA7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnM7IC8vIElmID09PSBudWxsIC0+IERpc3BhdGNoIHRvIERPTVxuICB9XG5cbiAgdGljayAoZnJhbWVOdW1iZXIpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPj0gdGhpcy5yZWNvcmRpbmcubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA+IGZyYW1lTnVtYmVyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudEluZGV4IDwgdGhpcy5yZWNvcmRpbmcubGVuZ3RoICYmIHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XS5mcmFtZU51bWJlciA9PT0gZnJhbWVOdW1iZXIpIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gdGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdO1xuICAgICAgc3dpdGNoIChpbnB1dC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlJzoge1xuICAgICAgICAgIHRoaXMuc2ltdWxhdGVNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgfSBicmVhaztcbiAgICAgICAgY2FzZSAna2V5Jzoge1xuICAgICAgICAgIHRoaXMuc2ltdWxhdGVLZXlFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnU3RpbGwgbm90IGltcGxlbWVudGVkIGV2ZW50JywgaW5wdXQudHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgc2ltdWxhdGVLZXlFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBEb24ndCB1c2UgdGhlIEtleWJvYXJkRXZlbnQgb2JqZWN0IGJlY2F1c2Ugb2YgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84OTQyNjc4L2tleWJvYXJkZXZlbnQtaW4tY2hyb21lLWtleWNvZGUtaXMtMC8xMjUyMjc1MiMxMjUyMjc1MlxuICAgIC8vIFNlZSBhbHNvIGh0dHA6Ly9vdXRwdXQuanNiaW4uY29tL2F3ZW5hcS8zXG4gICAgLy8gICAgdmFyIGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnS2V5Ym9hcmRFdmVudCcpO1xuICAgIC8vICAgIGlmIChlLmluaXRLZXlFdmVudCkge1xuICAgIC8vICAgICAgZS5pbml0S2V5RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBrZXlDb2RlLCBjaGFyQ29kZSk7XG4gICAgLy8gIH0gZWxzZSB7XG4gIFxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgICBpZiAoZS5pbml0RXZlbnQpIHtcbiAgICAgICAgZS5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICAgIH1cbiAgXG4gICAgZS5rZXlDb2RlID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUud2hpY2ggPSBwYXJhbWV0ZXJzLmtleUNvZGU7XG4gICAgZS5jaGFyQ29kZSA9IHBhcmFtZXRlcnMuY2hhckNvZGU7XG4gICAgZS5wcm9ncmFtbWF0aWMgPSB0cnVlO1xuICAgIGUua2V5ID0gcGFyYW1ldGVycy5rZXk7XG4gIFxuICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIEVtc2NyaXB0ZW4ncyBodG1sNS5oIEFQSTpcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMF07XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzJdO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCB0byBicm93c2VyIGZvciByZWFsXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPyBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSkgOiBlbGVtZW50LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gZXZlbnRUeXBlOiBcIm1vdXNlbW92ZVwiLCBcIm1vdXNlZG93blwiIG9yIFwibW91c2V1cFwiLlxuICAvLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG4gIHNpbXVsYXRlTW91c2VFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBSZW1hcCBmcm9tIFswLDFdIHRvIGNhbnZhcyBDU1MgcGl4ZWwgc2l6ZS5cbiAgICB2YXIgeCA9IHBhcmFtZXRlcnMueDtcbiAgICB2YXIgeSA9IHBhcmFtZXRlcnMueTtcblxuICAgIHggKj0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB5ICo9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBcbiAgICAvLyBPZmZzZXQgdGhlIGluamVjdGVkIGNvb3JkaW5hdGUgZnJvbSB0b3AtbGVmdCBvZiB0aGUgY2xpZW50IGFyZWEgdG8gdGhlIHRvcC1sZWZ0IG9mIHRoZSBjYW52YXMuXG4gICAgeCA9IE1hdGgucm91bmQocmVjdC5sZWZ0ICsgeCk7XG4gICAgeSA9IE1hdGgucm91bmQocmVjdC50b3AgKyB5KTtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgZS5pbml0TW91c2VFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlID09ICdtb3VzZW1vdmUnID8gMCA6IDEsIHgsIHksIHgsIHksXG4gICAgICAgICAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuYnV0dG9uLCBudWxsKTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pIHtcbiAgICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhdGluZyBET00gZXZlbnRzIGRvZXNuJ3QgYWxsb3cgc3BlY2lmeWluZyBvZmZzZXRYICYgb2Zmc2V0WSBwcm9wZXJseVxuICAgICAgLy8gZm9yIHRoZSBlbGVtZW50LCBidXQgdGhleSBtdXN0IGJlIHRoZSBzYW1lIGFzIGNsaWVudFggJiBjbGllbnRZLiBUaGVyZWZvcmUgd2UgY2FuJ3QgaGF2ZSBhXG4gICAgICAvLyBib3JkZXIgdGhhdCB3b3VsZCBtYWtlIHRoZXNlIGRpZmZlcmVudC5cbiAgICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9IGVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICAgICAgfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT0gZWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgdGhyb3cgXCJFUlJPUiEgQ2FudmFzIG9iamVjdCBtdXN0IGhhdmUgMHB4IGJvcmRlciBmb3IgZGlyZWN0IG1vdXNlIGRpc3BhdGNoIHRvIHdvcmshXCI7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMF07XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV1bMV07XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldWzJdO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJZiBuZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcyBpcyBzZXQsIHRoZSBwYWdlIG5lZWRzIGEgZnVsbCBzZXQgb2YgYXR0cmlidXRlc1xuICAgICAgICAgICAgLy8gc3BlY2lmaWVkIGluIHRoZSBNb3VzZUV2ZW50IG9iamVjdC4gSG93ZXZlciBtb3N0IGZpZWxkcyBvbiBNb3VzZUV2ZW50IGFyZSByZWFkLW9ubHksIHNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBuZXcgY3VzdG9tIG9iamVjdCAod2l0aG91dCBwcm90b3R5cGUgY2hhaW4pIHRvIGhvbGQgdGhlIG92ZXJyaWRkZW4gcHJvcGVydGllcy5cbiAgICAgICAgICAgIHZhciBldnQgPSB7XG4gICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBzcmNFbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgZnJvbUVsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0b0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICBldmVudFBoYXNlOiAyLCAvLyBFdmVudC5BVF9UQVJHRVRcbiAgICAgICAgICAgICAgYnV0dG9uczogKGV2ZW50VHlwZSA9PSAnbW91c2Vkb3duJykgPyAxIDogMCxcbiAgICAgICAgICAgICAgYnV0dG9uOiBlLmJ1dHRvbixcbiAgICAgICAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgICAgICAgYnViYmxlczogZS5idWJibGVzLFxuICAgICAgICAgICAgICBjYW5jZWxCdWJibGU6IGUuY2FuY2VsQnViYmxlLFxuICAgICAgICAgICAgICBjYW5jZWxhYmxlOiBlLmNhbmNlbGFibGUsXG4gICAgICAgICAgICAgIGNsaWVudFg6IGUuY2xpZW50WCxcbiAgICAgICAgICAgICAgY2xpZW50WTogZS5jbGllbnRZLFxuICAgICAgICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGUuZGVmYXVsdFByZXZlbnRlZCxcbiAgICAgICAgICAgICAgZGV0YWlsOiBlLmRldGFpbCxcbiAgICAgICAgICAgICAgaWRlbnRpZmllcjogZS5pZGVudGlmaWVyLFxuICAgICAgICAgICAgICBpc1RydXN0ZWQ6IGUuaXNUcnVzdGVkLFxuICAgICAgICAgICAgICBsYXllclg6IGUubGF5ZXJYLFxuICAgICAgICAgICAgICBsYXllclk6IGUubGF5ZXJZLFxuICAgICAgICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgICAgICAgIG1vdmVtZW50WDogZS5tb3ZlbWVudFgsXG4gICAgICAgICAgICAgIG1vdmVtZW50WTogZS5tb3ZlbWVudFksXG4gICAgICAgICAgICAgIG9mZnNldFg6IGUub2Zmc2V0WCxcbiAgICAgICAgICAgICAgb2Zmc2V0WTogZS5vZmZzZXRZLFxuICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVksXG4gICAgICAgICAgICAgIHBhdGg6IGUucGF0aCxcbiAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogZS5yZWxhdGVkVGFyZ2V0LFxuICAgICAgICAgICAgICByZXR1cm5WYWx1ZTogZS5yZXR1cm5WYWx1ZSxcbiAgICAgICAgICAgICAgc2NyZWVuWDogZS5zY3JlZW5YLFxuICAgICAgICAgICAgICBzY3JlZW5ZOiBlLnNjcmVlblksXG4gICAgICAgICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICAgICAgICBzb3VyY2VDYXBhYmlsaXRpZXM6IGUuc291cmNlQ2FwYWJpbGl0aWVzLFxuICAgICAgICAgICAgICB0aW1lU3RhbXA6IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICAgICAgICB0eXBlOiBlLnR5cGUsXG4gICAgICAgICAgICAgIHZpZXc6IGUudmlldyxcbiAgICAgICAgICAgICAgd2hpY2g6IGUud2hpY2gsXG4gICAgICAgICAgICAgIHg6IGUueCxcbiAgICAgICAgICAgICAgeTogZS55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZXZ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHJlZ3VsYXIgJ2UnIG9iamVjdCBpcyBlbm91Z2ggKGl0IGRvZXNuJ3QgcG9wdWxhdGUgYWxsIG9mIHRoZSBzYW1lIGZpZWxkcyB0aGFuIGEgcmVhbCBtb3VzZSBldmVudCBkb2VzLCBcbiAgICAgICAgICAgIC8vIHNvIHRoaXMgbWlnaHQgbm90IHdvcmsgb24gc29tZSBkZW1vcylcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBicm93c2VyXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfVxuICB9XG59XG4iLCJ2YXIgTW9kdWxlID0ge307XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudExpc3RlbmVyTWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvLyBEb24ndCBjYWxsIGFueSBhcHBsaWNhdGlvbiBwYWdlIHVubG9hZCBoYW5kbGVycyBhcyBhIHJlc3BvbnNlIHRvIHdpbmRvdyBiZWluZyBjbG9zZWQuXG4gIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKSB7XG4gICAgLy8gVGhpcyBpcyBhIGJpdCB0cmlja3kgdG8gbWFuYWdlLCBzaW5jZSB0aGUgcGFnZSBjb3VsZCByZWdpc3RlciB0aGVzZSBoYW5kbGVycyBhdCBhbnkgcG9pbnQsXG4gICAgLy8gc28ga2VlcCB3YXRjaGluZyBmb3IgdGhlbSBhbmQgcmVtb3ZlIHRoZW0gaWYgYW55IGFyZSBhZGRlZC4gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAvLyBpbiBhIHNlbWktcG9sbGluZyBmYXNoaW9uIHRvIGVuc3VyZSB0aGVzZSBhcmUgbm90IG92ZXJyaWRkZW4uXG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCkgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9udW5sb2FkKSB3aW5kb3cub251bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25ibHVyKSB3aW5kb3cub25ibHVyID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uZm9jdXMpIHdpbmRvdy5vbmZvY3VzID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZWhpZGUpIHdpbmRvdy5vbnBhZ2VoaWRlID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9ucGFnZXNob3cpIHdpbmRvdy5vbnBhZ2VzaG93ID0gbnVsbDtcbiAgfVxuXG4gIHVubG9hZEFsbEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgZm9yKHZhciBpIGluIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSB7XG4gICAgICB2YXIgbCA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbFswXS5yZW1vdmVFdmVudExpc3RlbmVyKGxbMV0sIGxbMl0sIGxbM10pO1xuICAgIH1cbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICBcbiAgICAvLyBNYWtlIHN1cmUgbm8gWEhScyBhcmUgYmVpbmcgaGVsZCBvbiB0byBlaXRoZXIuXG4gICAgLy9wcmVsb2FkZWRYSFJzID0ge307XG4gICAgLy9udW1QcmVsb2FkWEhSc0luRmxpZ2h0ID0gMDtcbiAgICAvL1hNTEh0dHBSZXF1ZXN0ID0gcmVhbFhNTEh0dHBSZXF1ZXN0O1xuICBcbiAgICB0aGlzLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgfVxuIFxuICAvL2lmIChpbmplY3RpbmdJbnB1dFN0cmVhbSkgXG4gIGVuYWJsZSgpIHtcblxuICAgIC8vIEZpbHRlciB0aGUgcGFnZSBldmVudCBoYW5kbGVycyB0byBvbmx5IHBhc3MgcHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRvIHRoZSBzaXRlIC0gYWxsIHJlYWwgdXNlciBpbnB1dCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgc2luY2Ugd2UgYXJlXG4gICAgLy8gZG9pbmcgYSBwcm9ncmFtbWF0aWMgcnVuLlxuICAgIHZhciBvdmVycmlkZGVuTWVzc2FnZVR5cGVzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnLFxuICAgICAgJ2NsaWNrJywgJ2RibGNsaWNrJywgJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnLFxuICAgICAgJ3BvaW50ZXJsb2NrY2hhbmdlJywgJ3BvaW50ZXJsb2NrZXJyb3InLCAnd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAnd2Via2l0cG9pbnRlcmxvY2tlcnJvcicsICdtb3pwb2ludGVybG9ja2NoYW5nZScsICdtb3pwb2ludGVybG9ja2Vycm9yJywgJ21zcG9pbnRlcmxvY2tjaGFuZ2UnLCAnbXNwb2ludGVybG9ja2Vycm9yJywgJ29wb2ludGVybG9ja2NoYW5nZScsICdvcG9pbnRlcmxvY2tlcnJvcicsXG4gICAgICAnZGV2aWNlbW90aW9uJywgJ2RldmljZW9yaWVudGF0aW9uJyxcbiAgICAgICdtb3VzZXdoZWVsJywgJ3doZWVsJywgJ1doZWVsRXZlbnQnLCAnRE9NTW91c2VTY3JvbGwnLCAnY29udGV4dG1lbnUnLFxuICAgICAgJ2JsdXInLCAnZm9jdXMnLCAndmlzaWJpbGl0eWNoYW5nZScsICdiZWZvcmV1bmxvYWQnLCAndW5sb2FkJywgJ2Vycm9yJyxcbiAgICAgICdwYWdlaGlkZScsICdwYWdlc2hvdycsICdvcmllbnRhdGlvbmNoYW5nZScsICdnYW1lcGFkY29ubmVjdGVkJywgJ2dhbWVwYWRkaXNjb25uZWN0ZWQnLFxuICAgICAgJ2Z1bGxzY3JlZW5jaGFuZ2UnLCAnZnVsbHNjcmVlbmVycm9yJywgJ21vemZ1bGxzY3JlZW5jaGFuZ2UnLCAnbW96ZnVsbHNjcmVlbmVycm9yJyxcbiAgICAgICdNU0Z1bGxzY3JlZW5DaGFuZ2UnLCAnTVNGdWxsc2NyZWVuRXJyb3InLCAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsICd3ZWJraXRmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ3RvdWNoc3RhcnQnLCAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyxcbiAgICAgICd3ZWJnbGNvbnRleHRsb3N0JywgJ3dlYmdsY29udGV4dHJlc3RvcmVkJyxcbiAgICAgICdtb3VzZW92ZXInLCAnbW91c2VvdXQnLCAncG9pbnRlcm91dCcsICdwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAndHJhbnNpdGlvbmVuZCddO1xuICBcbiAgICAvLyBTb21lIGdhbWUgZGVtb3MgcHJvZ3JhbW1hdGljYWxseSBmaXJlIHRoZSByZXNpemUgZXZlbnQuIEZvciBGaXJlZm94IGFuZCBDaHJvbWUsIFxuICAgIC8vIHdlIGRldGVjdCB0aGlzIHZpYSBldmVudC5pc1RydXN0ZWQgYW5kIGtub3cgdG8gY29ycmVjdGx5IHBhc3MgaXQgdGhyb3VnaCwgYnV0IHRvIG1ha2UgU2FmYXJpIGhhcHB5LFxuICAgIC8vIGl0J3MganVzdCBlYXNpZXIgdG8gbGV0IHJlc2l6ZSBjb21lIHRocm91Z2ggZm9yIHRob3NlIGRlbW9zIHRoYXQgbmVlZCBpdC5cbiAgICAvLyBpZiAoIU1vZHVsZVsncGFnZU5lZWRzUmVzaXplRXZlbnQnXSkgb3ZlcnJpZGRlbk1lc3NhZ2VUeXBlcy5wdXNoKCdyZXNpemUnKTtcbiAgXG4gICAgLy8gSWYgY29udGV4dCBpcyBzcGVjaWZpZWQsIGFkZEV2ZW50TGlzdGVuZXIgaXMgY2FsbGVkIHVzaW5nIHRoYXQgYXMgdGhlICd0aGlzJyBvYmplY3QuIE90aGVyd2lzZSB0aGUgY3VycmVudCB0aGlzIGlzIHVzZWQuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgdmFyIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT0gLTEgfHwgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSlcbiAgICAgICAgICAgICYmICh0eXBlLmluZGV4T2YoJ2tleScpID09IC0xIHx8IGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKTtcbiAgICAgICAgICB2YXIgZmlsdGVyZWRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZSkgeyB0cnkgeyBpZiAoZS5wcm9ncmFtbWF0aWMgfHwgIWUuaXNUcnVzdGVkKSBsaXN0ZW5lcihlKTsgfSBjYXRjaChlKSB7fSB9O1xuICAgICAgICAgIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goW2NvbnRleHQgfHwgdGhpcywgdHlwZSwgZmlsdGVyZWRFdmVudExpc3RlbmVyLCB1c2VDYXB0dXJlXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVhbEFkZEV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5wdXNoKFtjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBFdmVudFRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKEV2ZW50VGFyZ2V0LnByb3RvdHlwZSwgbnVsbCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICB2YXIgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBbd2luZG93LCBkb2N1bWVudCwgZG9jdW1lbnQuYm9keSwgTW9kdWxlWydjYW52YXMnXV07XG4gICAgICAvLyBpZiAoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UuY29uY2F0KE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKTtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0pO1xuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG4gIH0gICAgXG59IiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLktFWVZJUyA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuICBjb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgZm9udFNpemU6IDE2LFxuICAgIGtleVN0cm9rZURlbGF5OiAyMDAsXG4gICAgbGluZ2VyRGVsYXk6IDEwMDAsXG4gICAgZmFkZUR1cmF0aW9uOiAxMDAwLFxuICAgIGJlemVsQ29sb3I6ICcjMDAwJyxcbiAgICB0ZXh0Q29sb3I6ICcjZmZmJyxcbiAgICB1bm1vZGlmaWVkS2V5OiB0cnVlLFxuICAgIHNob3dTeW1ib2w6IHRydWUsXG4gICAgYXBwZW5kTW9kaWZpZXJzOiB7XG4gICAgICBNZXRhOiB0cnVlLFxuICAgICAgQWx0OiB0cnVlLFxuICAgICAgU2hpZnQ6IGZhbHNlXG4gICAgfSxcbiAgICBwb3NpdGlvbjogJ2JvdHRvbS1sZWZ0J1xuICB9O1xuICBjbGFzcyBLZXlzdHJva2VWaXN1YWxpemVyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICAgIHRoaXMuc3R5bGUgPSBudWxsO1xuICAgICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gbnVsbDtcbiAgICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBudWxsO1xuICAgICAgdGhpcy5rZXlkb3duID0gdGhpcy5rZXlkb3duLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLmtleXVwID0gdGhpcy5rZXl1cC5iaW5kKHRoaXMpO1xuICAgIH1cbiAgICBjbGVhblVwKCkge1xuICAgICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlKSB7XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZW1vdmVOb2RlKHRoaXMuY29udGFpbmVyKTtcbiAgICAgIHJlbW92ZU5vZGUodGhpcy5zdHlsZSk7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5rZXlTdHJva2VUaW1lb3V0KTtcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gdGhpcy5zdHlsZSA9IG51bGw7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMua2V5ZG93bik7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgICB9XG4gICAgaW5qZWN0Q29tcG9uZW50cygpIHtcbiAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gJ2tleXN0cm9rZXMnO1xuICAgICAgY29uc3QgcG9zaXRpb25zID0ge1xuICAgICAgICAnYm90dG9tLWxlZnQnOiAnYm90dG9tOiAwOyBsZWZ0OiAwOycsXG4gICAgICAgICdib3R0b20tcmlnaHQnOiAnYm90dG9tOiAwOyByaWdodDogMDsnLFxuICAgICAgICAndG9wLWxlZnQnOiAndG9wOiAwOyBsZWZ0OiAwOycsXG4gICAgICAgICd0b3AtcmlnaHQnOiAndG9wOiAwOyByaWdodDogMDsnXG4gICAgICB9O1xuICAgICAgaWYgKCFwb3NpdGlvbnNbdGhpcy5vcHRpb25zLnBvc2l0aW9uXSkge1xuICAgICAgICBjb25zb2xlLndhcm4oYEludmFsaWQgcG9zaXRpb24gJyR7dGhpcy5vcHRpb25zLnBvc2l0aW9ufScsIHVzaW5nIGRlZmF1bHQgJ2JvdHRvbS1sZWZ0Jy4gVmFsaWQgcG9zaXRpb25zOiBgLCBPYmplY3Qua2V5cyhwb3NpdGlvbnMpKTtcbiAgICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gJ2JvdHRvbS1sZWZ0JztcbiAgICAgIH1cbiAgICAgIHRoaXMuc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgdGhpcy5zdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgICB1bC5rZXlzdHJva2VzIHtcbiAgICAgICAgcGFkZGluZy1sZWZ0OiAxMHB4O1xuICAgICAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgICAgICR7cG9zaXRpb25zW3RoaXMub3B0aW9ucy5wb3NpdGlvbl19XG4gICAgICB9XG4gICAgICBcbiAgICAgIHVsLmtleXN0cm9rZXMgbGkge1xuICAgICAgICBmb250LWZhbWlseTogQXJpYWw7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7dGhpcy5vcHRpb25zLmJlemVsQ29sb3J9O1xuICAgICAgICBvcGFjaXR5OiAwLjk7XG4gICAgICAgIGNvbG9yOiAke3RoaXMub3B0aW9ucy50ZXh0Q29sb3J9O1xuICAgICAgICBwYWRkaW5nOiA1cHggMTBweDtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogNXB4O1xuICAgICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgICBvcGFjaXR5OiAxO1xuICAgICAgICBmb250LXNpemU6ICR7dGhpcy5vcHRpb25zLmZvbnRTaXplfXB4O1xuICAgICAgICBkaXNwbGF5OiB0YWJsZTtcbiAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBvcGFjaXR5ICR7dGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbn1tcyBsaW5lYXI7XG4gICAgICAgIHRyYW5zaXRpb246IG9wYWNpdHkgJHt0aGlzLm9wdGlvbnMuZmFkZUR1cmF0aW9ufW1zIGxpbmVhcjtcbiAgICAgIH1gO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlKTtcbiAgICB9XG4gICAgY29udmVydEtleVRvU3ltYm9sKGtleSkge1xuICAgICAgY29uc3QgY29udmVyc2lvbkNvbW1vbiA9IHtcbiAgICAgICAgJ0Fycm93UmlnaHQnOiAn4oaSJyxcbiAgICAgICAgJ0Fycm93TGVmdCc6ICfihpAnLFxuICAgICAgICAnQXJyb3dVcCc6ICfihpEnLFxuICAgICAgICAnQXJyb3dEb3duJzogJ+KGkycsXG4gICAgICAgICcgJzogJ+KQoycsXG4gICAgICAgICdFbnRlcic6ICfihqknLFxuICAgICAgICAnU2hpZnQnOiAn4oenJyxcbiAgICAgICAgJ1NoaWZ0UmlnaHQnOiAn4oenJyxcbiAgICAgICAgJ1NoaWZ0TGVmdCc6ICfih6cnLFxuICAgICAgICAnQ29udHJvbCc6ICfijIMnLFxuICAgICAgICAnVGFiJzogJ+KGuScsXG4gICAgICAgICdDYXBzTG9jayc6ICfih6onXG4gICAgICB9O1xuICAgICAgY29uc3QgY29udmVyc2lvbk1hYyA9IHtcbiAgICAgICAgJ0FsdCc6ICfijKUnLFxuICAgICAgICAnQWx0TGVmdCc6ICfijKUnLFxuICAgICAgICAnQWx0UmlnaHQnOiAn4oylJyxcbiAgICAgICAgJ0RlbGV0ZSc6ICfijKYnLFxuICAgICAgICAnRXNjYXBlJzogJ+KOiycsXG4gICAgICAgICdCYWNrc3BhY2UnOiAn4oyrJyxcbiAgICAgICAgJ01ldGEnOiAn4oyYJyxcbiAgICAgICAgJ1RhYic6ICfih6UnLFxuICAgICAgICAnUGFnZURvd24nOiAn4oefJyxcbiAgICAgICAgJ1BhZ2VVcCc6ICfih54nLFxuICAgICAgICAnSG9tZSc6ICfihpYnLFxuICAgICAgICAnRW5kJzogJ+KGmCdcbiAgICAgIH07XG4gICAgICByZXR1cm4gKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyA/IGNvbnZlcnNpb25NYWNba2V5XSA6IG51bGwpIHx8IGNvbnZlcnNpb25Db21tb25ba2V5XSB8fCBrZXk7XG4gICAgfVxuICAgIGtleWRvd24oZSkge1xuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykge1xuICAgICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY3VycmVudENodW5rKTtcbiAgICAgIH1cbiAgICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudW5tb2RpZmllZEtleSkge1xuICAgICAgICBpZiAoZS5jb2RlLmluZGV4T2YoJ0tleScpICE9PSAtMSkge1xuICAgICAgICAgIGtleSA9IGUuY29kZS5yZXBsYWNlKCdLZXknLCAnJyk7XG4gICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBtb2RpZmllciA9ICcnO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuTWV0YSAmJiBlLm1ldGFLZXkgJiYgZS5rZXkgIT09ICdNZXRhJykge1xuICAgICAgICBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnTWV0YScpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuQWx0ICYmIGUuYWx0S2V5ICYmIGUua2V5ICE9PSAnQWx0Jykge1xuICAgICAgICBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnQWx0Jyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFwcGVuZE1vZGlmaWVycy5TaGlmdCAmJiBlLnNoaWZ0S2V5ICYmIGUua2V5ICE9PSAnU2hpZnQnKSB7XG4gICAgICAgIG1vZGlmaWVyICs9IHRoaXMuY29udmVydEtleVRvU3ltYm9sKCdTaGlmdCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsudGV4dENvbnRlbnQgKz0gbW9kaWZpZXIgKyAodGhpcy5vcHRpb25zLnNob3dTeW1ib2wgPyB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbChrZXkpIDoga2V5KTtcbiAgICB9XG4gICAga2V5dXAoZSkge1xuICAgICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykgcmV0dXJuO1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5rZXlTdHJva2VUaW1lb3V0KTtcbiAgICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAoZnVuY3Rpb24gKHByZXZpb3VzQ2h1bmspIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHByZXZpb3VzQ2h1bmsuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgcHJldmlvdXNDaHVuay5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHByZXZpb3VzQ2h1bmspO1xuICAgICAgICAgICAgfSwgb3B0aW9ucy5mYWRlRHVyYXRpb24pO1xuICAgICAgICAgIH0sIG9wdGlvbnMubGluZ2VyRGVsYXkpO1xuICAgICAgICB9KSh0aGlzLmN1cnJlbnRDaHVuayk7XG4gICAgICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICAgIH0sIG9wdGlvbnMua2V5U3Ryb2tlRGVsYXkpO1xuICAgIH1cbiAgICBlbmFibGUob3B0aW9ucykge1xuICAgICAgdGhpcy5jbGVhblVwKCk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zKTtcbiAgICAgIHRoaXMuaW5qZWN0Q29tcG9uZW50cygpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd24pO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gICAgfVxuICAgIGRpc2FibGUoKSB7XG4gICAgICB0aGlzLmNsZWFuVXAoKTtcbiAgICB9XG4gIH1cbiAgdmFyIGluZGV4ID0gbmV3IEtleXN0cm9rZVZpc3VhbGl6ZXIoKTtcblxuICByZXR1cm4gaW5kZXg7XG5cbn0pKSk7XG4iLCJpbXBvcnQgS2V5c3Ryb2tlVmlzdWFsaXplciBmcm9tICdrZXlzdHJva2UtdmlzdWFsaXplcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0SGVscGVycyB7XG4gIGluaXRLZXlzKCkge1xuICAgIEtleXN0cm9rZVZpc3VhbGl6ZXIuZW5hYmxlKHt1bm1vZGlmaWVkS2V5OiBmYWxzZX0pO1xuICB9XG5cbiAgaW5pdE1vdXNlKCkge1xuICAgIHRoaXMubW91c2VEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDozMHB4OyBoZWlnaHQ6MzBweDsgbGVmdDowcHg7IHRvcDowcHg7IGJhY2tncm91bmQtaW1hZ2U6dXJsKCcuLi9jdXJzb3Iuc3ZnJyk7XCI7XG4gICAgXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3ctbW91c2UnKSA9PT0gLTEpIHtcbiAgICAgIC8vIHRoaXMubW91c2VEaXYuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG4gICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1vdXNlRGl2KTtcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmxlZnQgPSBldnQueCArIFwicHhcIjtcbiAgICAgIHRoaXMubW91c2VEaXYuc3R5bGUudG9wID0gZXZ0LnkgKyBcInB4XCI7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvciAoY2FudmFzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgdGhpcy5pbml0S2V5cygpO1xuICAgIHRoaXMuaW5pdE1vdXNlKCk7XG4gIH1cbn0iLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgUGVyZlN0YXRzIGZyb20gJ3BlcmZvcm1hbmNlLXN0YXRzJztcbmltcG9ydCBzZWVkcmFuZG9tIGZyb20gJ3NlZWRyYW5kb20nO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge0lucHV0UmVjb3JkZXIsIElucHV0UmVwbGF5ZXJ9IGZyb20gJ2lucHV0LWV2ZW50cy1yZWNvcmRlcic7XG5pbXBvcnQgRXZlbnRMaXN0ZW5lck1hbmFnZXIgZnJvbSAnLi9ldmVudC1saXN0ZW5lcnMnO1xuaW1wb3J0IElucHV0SGVscGVycyBmcm9tICcuL2lucHV0LWhlbHBlcnMnO1xuXG5jb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxud2luZG93LlRFU1RFUiA9IHtcbiAgcmVhZHk6IGZhbHNlLFxuXG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgZmlyc3RGcmFtZVRpbWU6IG51bGwsXG4gIC8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxuICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU6IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGRlbm90aW5nIHdoZW4gdGhlIHBhZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuXG4gIHBhZ2VMb2FkVGltZTogbnVsbCxcblxuICAvLyBIb2xkcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbXNlY3MgdGhhdCB0aGUgcHJldmlvdXNseSByZW5kZXJlZCBmcmFtZSB0b29rLiBVc2VkIHRvIGVzdGltYXRlIHdoZW4gYSBzdHV0dGVyIGV2ZW50IG9jY3VycyAoZmFzdCBmcmFtZSBmb2xsb3dlZCBieSBhIHNsb3cgZnJhbWUpXG4gIGxhc3RGcmFtZUR1cmF0aW9uOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG4gIGxhc3RGcmFtZVRpY2s6IC0xLFxuXG4gIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWU6IDAsXG5cbiAgLy8gS2VlcHMgdHJhY2sgb2YgcGVyZm9ybWFuY2Ugc3R1dHRlciBldmVudHMuIEEgc3R1dHRlciBldmVudCBvY2N1cnMgd2hlbiB0aGVyZSBpcyBhIGhpY2N1cCBpbiBzdWJzZXF1ZW50IHBlci1mcmFtZSB0aW1lcy4gKGZhc3QgZm9sbG93ZWQgYnkgc2xvdylcbiAgbnVtU3R1dHRlckV2ZW50czogMCxcblxuICBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlOiAxMjAsIC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlXG5cbiAgLy8gTWVhc3VyZSBhIFwidGltZSB1bnRpbCBzbW9vdGggZnJhbWUgcmF0ZVwiIHF1YW50aXR5LCBpLmUuIHRoZSB0aW1lIGFmdGVyIHdoaWNoIHdlIGNvbnNpZGVyIHRoZSBzdGFydHVwIEpJVCBhbmQgR0MgZWZmZWN0cyB0byBoYXZlIHNldHRsZWQuXG4gIC8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbiAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXM6IDAsXG5cbiAgcmFuZG9tU2VlZDogMSxcblxuICBudW1GcmFtZXNUb1JlbmRlcjogdHlwZW9mIHBhcmFtZXRlcnNbJ251bWZyYW1lcyddID09PSAndW5kZWZpbmVkJyA/IDEwMCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ251bWZyYW1lcyddKSxcblxuICAvLyBHdWFyZCBhZ2FpbnN0IHJlY3Vyc2l2ZSBjYWxscyB0byByZWZlcmVuY2VUZXN0UHJlVGljaytyZWZlcmVuY2VUZXN0VGljayBmcm9tIG11bHRpcGxlIHJBRnMuXG4gIHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQ6IDAsXG5cbiAgLy8gQ2FudmFzIHVzZWQgYnkgdGhlIHRlc3QgdG8gcmVuZGVyXG4gIGNhbnZhczogbnVsbCxcblxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbiAgLy8gdmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG4gIHByZVRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmICgrK3RoaXMucmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA9PSAxKSB7XG4gICAgICB0aGlzLnN0YXRzLmZyYW1lU3RhcnQoKTtcblxuICAgICAgaWYgKCF0aGlzLmNhbnZhcykge1xuICAgICAgICAvLyBXZSBhc3N1bWUgdGhlIGxhc3Qgd2ViZ2wgY29udGV4dCBiZWluZyBpbml0aWFsaXplZCBpcyB0aGUgb25lIHVzZWQgdG8gcmVuZGVyaW5nXG4gICAgICAgIC8vIElmIHRoYXQncyBkaWZmZXJlbnQsIHRoZSB0ZXN0IHNob3VsZCBoYXZlIGEgY3VzdG9tIGNvZGUgdG8gcmV0dXJuIHRoYXQgY2FudmFzXG4gICAgICAgIHRoaXMuY2FudmFzID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHRzW0NhbnZhc0hvb2sud2ViZ2xDb250ZXh0cy5sZW5ndGggLSAxXS5jYW52YXM7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnICYmICF0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgICAgdGhpcy5pbnB1dFJlY29yZGVyID0gbmV3IElucHV0UmVjb3JkZXIodGhpcy5jYW52YXMpO1xuICAgICAgICB0aGlzLmlucHV0UmVjb3JkZXIuZW5hYmxlKCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVwbGF5J10gIT09ICd1bmRlZmluZWQnICYmICF0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgICAgaWYgKEdGWFBFUkZURVNUU19DT05GSUcuaW5wdXQpIHtcbiAgICAgICAgICBmZXRjaCgnL3Rlc3RzLycgKyBHRlhQRVJGVEVTVFNfQ09ORklHLmlucHV0KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZXBsYXllciA9IG5ldyBJbnB1dFJlcGxheWVyKHRoaXMuY2FudmFzLCBqc29uLCB0aGlzLmV2ZW50TGlzdGVuZXIucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKTtcbiAgICAgICAgICAgIC8vdGhpcy5pbnB1dFJlcGxheWVyID0gbmV3IElucHV0UmVwbGF5ZXIodGhpcy5jYW52YXMsIGpzb24pO1xuICAgICAgICAgICAgLy9pZiAocGFyYW1ldGVycy5zaG93TW91c2UgfHzCoHBhcmFtZXRlcnMuc2hvd0tleXMpXG4gICAgICAgICAgICB0aGlzLmlucHV0SGVscGVycyA9IG5ldyBJbnB1dEhlbHBlcnModGhpcy5jYW52YXMpO1xuXG4gICAgICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICB9XG4gICAgXG4gICAgICAvLyByZWZlcmVuY2VUZXN0VDAgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBpZiAodGhpcy5wYWdlTG9hZFRpbWUgPT09IG51bGwpIHRoaXMucGFnZUxvYWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcGFnZUluaXRUaW1lO1xuXG4gICAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICAgIGlmICh0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSAhPSAtMSkge1xuICAgICAgICB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU7XG4gICAgICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gLTE7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoLS10aGlzLnJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPiAwKVxuICAgICAgcmV0dXJuOyAvLyBXZSBhcmUgYmVpbmcgY2FsbGVkIHJlY3Vyc2l2ZWx5LCBzbyBpZ25vcmUgdGhpcyBjYWxsLlxuXG4gICAgaWYgKCF0aGlzLnJlYWR5KSB7cmV0dXJuO31cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5mcmFtZU51bWJlciA9IHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZXBsYXllci50aWNrKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKTtcbiAgICB9XG5cbi8qICAgIFxuICAgIGVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiovICBcbiAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICAgIHZhciBmcmFtZUR1cmF0aW9uID0gdGltZU5vdyAtIHRoaXMubGFzdEZyYW1lVGljaztcbiAgICB0aGlzLmxhc3RGcmFtZVRpY2sgPSB0aW1lTm93O1xuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA+IDUgJiYgdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiA+IDApIHtcbiAgICAgIC8vIFRoaXMgbXVzdCBiZSBmaXhlZCBkZXBlbmRpbmcgb24gdGhlIHZzeW5jXG4gICAgICBpZiAoZnJhbWVEdXJhdGlvbiA+IDIwLjAgJiYgZnJhbWVEdXJhdGlvbiA+IHRoaXMubGFzdEZyYW1lRHVyYXRpb24gKiAxLjM1KSB7XG4gICAgICAgIHRoaXMubnVtU3R1dHRlckV2ZW50cysrO1xuICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkge1xuICAgICAgICAgIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMrKztcbiAgICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA+PSB0aGlzLm51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aW1lVW50aWxTbW9vdGhGcmFtZXJhdGUnLCB0aW1lTm93IC0gdGhpcy5maXJzdEZyYW1lVGltZSk7XG4gICAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPSBmcmFtZUR1cmF0aW9uO1xuLypcbiAgICBpZiAobnVtUHJlbG9hZFhIUnNJbkZsaWdodCA9PSAwKSB7IC8vIEltcG9ydGFudCEgVGhlIGZyYW1lIG51bWJlciBhZHZhbmNlcyBvbmx5IGZvciB0aG9zZSBmcmFtZXMgdGhhdCB0aGUgZ2FtZSBpcyBub3Qgd2FpdGluZyBmb3IgZGF0YSBmcm9tIHRoZSBpbml0aWFsIG5ldHdvcmsgZG93bmxvYWRzLlxuICAgICAgaWYgKG51bVN0YXJ0dXBCbG9ja2VyWEhSc1BlbmRpbmcgPT0gMCkgKyt0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjsgLy8gQWN0dWFsIHJlZnRlc3QgZnJhbWUgY291bnQgb25seSBpbmNyZW1lbnRzIGFmdGVyIGdhbWUgaGFzIGNvbnN1bWVkIGFsbCB0aGUgY3JpdGljYWwgWEhScyB0aGF0IHdlcmUgdG8gYmUgcHJlbG9hZGVkLlxuICAgICAgKytmYWtlZFRpbWU7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICAgIH1cbiovXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIrKztcbiAgICBGYWtlVGltZXJzLmZha2VkVGltZSsrOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICB0aGlzLmZpcnN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IGZyYW1lIHN1Ym1pdHRlZCBhdCAobXMpOicsIHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gdGhpcy5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgVEVTVEVSLmRvSW1hZ2VSZWZlcmVuY2VDaGVjaygpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gIH0sXG5cbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHRzW0NhbnZhc0hvb2sud2ViZ2xDb250ZXh0cy5sZW5ndGggLSAxXS5jYW52YXM7XG5cbiAgICAvLyBHcmFiIHJlbmRlcmVkIFdlYkdMIGZyb250IGJ1ZmZlciBpbWFnZSB0byBhIEpTLXNpZGUgaW1hZ2Ugb2JqZWN0LlxuICAgIHZhciBhY3R1YWxJbWFnZSA9IG5ldyBJbWFnZSgpO1xuXG4gICAgZnVuY3Rpb24gcmVmdGVzdCAoKSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgLy9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdHVhbEltYWdlKTtcbiAgICAgIC8vYWN0dWFsSW1hZ2Uuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICBhY3R1YWxJbWFnZS5vbmxvYWQgPSByZWZ0ZXN0O1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvL3JlZnRlc3QoKTsgLy8gY2FudmFzLnRvRGF0YVVSTCgpIGxpa2VseSBmYWlsZWQsIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgIH1cbiAgfSxcblxuICBpbml0U2VydmVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlcnZlclVybCA9ICdodHRwOi8vJyArIEdGWFBFUkZURVNUU19DT05GSUcuc2VydmVySVAgKyAnOjg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgnYmVuY2htYXJrX3N0YXJ0ZWQnLCB7aWQ6IEdGWFBFUkZURVNUU19DT05GSUcuaWR9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCduZXh0X2JlbmNobWFyaycsIChkYXRhKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnbmV4dF9iZW5jaG1hcmsnLCBkYXRhKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGRhdGEudXJsKTtcbiAgICB9KTsgICAgXG4gIH0sXG4gIFxuICBiZW5jaG1hcmtGaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS5pbm5lckhUTUwgPSBgXG4gICAgICAjYmVuY2htYXJrX2ZpbmlzaGVkIHtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzk5OTtcbiAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICBjb2xvcjogI2ZmZjtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgIGZvbnQtc2l6ZTogNDBweDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgei1pbmRleDogOTk5OTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgI2JlbmNobWFya19maW5pc2hlZCAuYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBjb2xvcjogI0ZGRkZGRjtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCIsIFwiSGVsdmV0aWNhXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYgIWltcG9ydGFudDtcbiAgICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBsaW5lLWhlaWdodDogbm9ybWFsO1xuICAgICAgICBwYWRkaW5nOiAxNXB4IDIwcHggMTVweCAyMHB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAzMDBtcyBlYXNlLW91dDtcbiAgICAgIH1cblxuICAgICAgI2JlbmNobWFya19maW5pc2hlZCAuYnV0dG9uOmhvdmVyIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzhhMDtcbiAgICAgIH1cbiAgICAgIGA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICB2YXIgdGltZUVuZCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB2YXIgdG90YWxUaW1lID0gdGltZUVuZCAtIHBhZ2VJbml0VGltZTsgLy8gVG90YWwgdGltZSwgaW5jbHVkaW5nIGV2ZXJ5dGhpbmcuXG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmlubmVySFRNTCA9IGBcbiAgICAgIDxoMT5UZXN0IGZpbmlzaGVkITwvaDE+XG4gICAgYDtcbiAgICAvL2Rpdi5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICBkaXYuaWQgPSAnYmVuY2htYXJrX2ZpbmlzaGVkJztcbiAgICBcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICAvLyBEdW1wIGlucHV0XG4gICAgICBmdW5jdGlvbiBzYXZlU3RyaW5nICh0ZXh0LCBmaWxlbmFtZSwgbWltZVR5cGUpIHtcbiAgICAgICAgc2F2ZUJsb2IobmV3IEJsb2IoWyB0ZXh0IF0sIHsgdHlwZTogbWltZVR5cGUgfSksIGZpbGVuYW1lKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIGZpbGVuYW1lKSB7XG4gICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZSB8fCAnaW5wdXQuanNvbic7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgLy8gVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpOyBicmVha3MgRmlyZWZveC4uLlxuICAgICAgfVxuXG4gICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMsIG51bGwsIDIpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKCdJbnB1dCByZWNvcmRlZCcsIGpzb24pO1xuXG4gICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG4gICAgICBsaW5rLmNsYXNzTmFtZSA9ICdidXR0b24nO1xuICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4gc2F2ZVN0cmluZyhqc29uLCBHRlhQRVJGVEVTVFNfQ09ORklHLmlkICsgJy5qc29uJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYERvd25sb2FkIGlucHV0IEpTT05gKSk7IC8vICgke3RoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMubGVuZ3RofSBldmVudHMgcmVjb3JkZWQpXG4gICAgICBkaXYuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgfVxuXG4gICAgdmFyIHRvdGFsUmVuZGVyVGltZSA9IHRpbWVFbmQgLSB0aGlzLmZpcnN0RnJhbWVUaW1lO1xuICAgIHZhciBjcHVJZGxlID0gdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICogMTAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIgKiAxMDAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gICAgXG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICB0ZXN0X2lkOiBHRlhQRVJGVEVTVFNfQ09ORklHLmlkLFxuICAgICAgdmFsdWVzOiB0aGlzLnN0YXRzLmdldFN0YXRzU3VtbWFyeSgpLFxuICAgICAgbnVtRnJhbWVzOiB0aGlzLm51bUZyYW1lc1RvUmVuZGVyLFxuICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICB0aW1lVG9GaXJzdEZyYW1lOiB0aGlzLmZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgbG9nczogdGhpcy5sb2dzLFxuICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICByZXN1bHQ6ICdQQVNTJyxcbiAgICAgIHRvdGFsVGltZTogdG90YWxUaW1lLFxuICAgICAgdG90YWxSZW5kZXJUaW1lOiB0b3RhbFJlbmRlclRpbWUsXG4gICAgICBjcHVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZUluTWFpbkxvb3AsXG4gICAgICBjcHVJZGxlVGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AsXG4gICAgICBjcHVJZGxlUGVyYzogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKiAxMDAgLyB0b3RhbFJlbmRlclRpbWUsXG4gICAgICBwYWdlTG9hZFRpbWU6IHRoaXMucGFnZUxvYWRUaW1lLFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19maW5pc2gnLCBkYXRhKTtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZygnRmluaXNoZWQhJywgZGF0YSk7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5jbG9zZSkgd2luZG93LmNsb3NlKCk7XG4gIH0sXG5cbiAgd3JhcEVycm9yczogZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yID0+IGV2dC5sb2dzLmNhdGNoRXJyb3JzID0ge1xuICAgICAgbWVzc2FnZTogZXZ0LmVycm9yLm1lc3NhZ2UsXG4gICAgICBzdGFjazogZXZ0LmVycm9yLnN0YWNrLFxuICAgICAgbGluZW5vOiBldnQuZXJyb3IubGluZW5vLFxuICAgICAgZmlsZW5hbWU6IGV2dC5lcnJvci5maWxlbmFtZVxuICAgIH0pO1xuXG4gICAgdmFyIHdyYXBGdW5jdGlvbnMgPSBbJ2Vycm9yJywnd2FybmluZycsJ2xvZyddO1xuICAgIHdyYXBGdW5jdGlvbnMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIGZuID0gY29uc29sZVtrZXldLmJpbmQoY29uc29sZSk7XG4gICAgICAgIGNvbnNvbGVba2V5XSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ2Vycm9yJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLmVycm9ycy5wdXNoKGFyZ3MpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnd2FybmluZycpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncy53YXJuaW5ncy5wdXNoKGFyZ3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChHRlhQRVJGVEVTVFNfQ09ORklHLnNlbmRMb2cpXG4gICAgICAgICAgICBURVNURVIuc29ja2V0LmVtaXQoJ2xvZycsIGFyZ3MpO1xuXG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkUHJvZ3Jlc3NCYXI6IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBkaXZQcm9ncmVzc0JhcnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdlByb2dyZXNzQmFycy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzOyB3aWR0aDogMjAwcHg7IHBhZGRpbmc6IDEwcHggMTBweCAwcHggMTBweDsnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXZQcm9ncmVzc0JhcnMpO1xuICAgICAgXG4gICAgICB2YXIgb3JkZXJHbG9iYWwgPSBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXTtcbiAgICAgIHZhciB0b3RhbEdsb2JhbCA9IHBhcmFtZXRlcnNbJ3RvdGFsLWdsb2JhbCddO1xuICAgICAgdmFyIHBlcmNHbG9iYWwgPSBNYXRoLnJvdW5kKG9yZGVyR2xvYmFsL3RvdGFsR2xvYmFsICogMTAwKTtcbiAgICAgIHZhciBvcmRlclRlc3QgPSBwYXJhbWV0ZXJzWydvcmRlci10ZXN0J107XG4gICAgICB2YXIgdG90YWxUZXN0ID0gcGFyYW1ldGVyc1sndG90YWwtdGVzdCddO1xuICAgICAgdmFyIHBlcmNUZXN0ID0gTWF0aC5yb3VuZChvcmRlclRlc3QvdG90YWxUZXN0ICogMTAwKTtcbiAgICAgIFxuICAgICAgZnVuY3Rpb24gYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKHRleHQsIGNvbG9yLCBwZXJjKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDIwcHg7IG1hcmdpbi1ib3R0b206IDEwcHg7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQtY29sb3I6ICNmNWY1ZjU7IGJvcmRlci1yYWRpdXM6IDRweDsgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIDFweCAycHggcmdiYSgwLDAsMCwuMSk7IGJveC1zaGFkb3c6IGluc2V0IDAgMXB4IDJweCByZ2JhKDAsMCwwLC4xKTsnO1xuICAgICAgICBkaXZQcm9ncmVzc0JhcnMuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkaXZQcm9ncmVzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGl2UHJvZ3Jlc3MpO1xuICAgICAgICBkaXZQcm9ncmVzcy5zdHlsZS5jc3NUZXh0PWB3aWR0aDogJHtwZXJjfSU7IGJhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9IGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBmb250LWZhbWlseTogTW9ub3NwYWNlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzM3YWI3O1xuICAgICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsLjE1KTtcbiAgICAgICAgICAtd2Via2l0LXRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO1xuICAgICAgICAgIC1vLXRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO1xuICAgICAgICAgIHRyYW5zaXRpb246IHdpZHRoIC42cyBlYXNlO2A7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaW5uZXJUZXh0ID0gdGV4dDs7XG4gICAgICB9XG5cbiAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlclRlc3R9LyR7dG90YWxUZXN0fSAke3BlcmNUZXN0fSVgLCAnIzViYzBkZScsIHBlcmNUZXN0KTtcbiAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlckdsb2JhbH0vJHt0b3RhbEdsb2JhbH0gJHtwZXJjR2xvYmFsfSVgLCAnIzMzN2FiNycsIHBlcmNHbG9iYWwpO1xuICAgICAgcmV0dXJuO1xuICAgICAgLypcblx0XHQ8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIiBzdHlsZT1cIndpZHRoOiAxMDAlXCI+XG5cdFx0XHRcdDxkaXYgaWQ9XCJwcm9ncmVzc2JhcjJcIiBjbGFzcz1cInByb2dyZXNzLWJhclwiIHJvbGU9XCJwcm9ncmVzc2JhclwiIHN0eWxlPVwid2lkdGg6IDUwJTsgYmFja2dyb3VuZC1jb2xvcjogI2YwYWQ0ZVwiPlxuXHRcdFx0XHRcdDEvMTAwIDEwJVxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvZGl2Plx0XG4qL1xuICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnVGVzdCBmaW5pc2hlZCEnKTtcbiAgICAgIGRpdi5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICAgIGRpdi5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjA7Ym90dG9tOjA7ei1pbmRleDo5OTk5O2JhY2tncm91bmQtY29sb3I6Izk5OTtmb250LXNpemU6MTAwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWZcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdUaW1lIHNwZW50IGdlbmVyYXRpbmcgcmVmZXJlbmNlIGltYWdlczonLCBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMpOyAgXG4gICAgfVxuICB9LFxuXG4gIGhvb2tNb2RhbHM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEhvb2sgbW9kYWxzOiBUaGlzIGlzIGFuIHVuYXR0ZW5kZWQgcnVuLCBkb24ndCBhbGxvdyB3aW5kb3cuYWxlcnQoKXMgdG8gaW50cnVkZS5cbiAgICB3aW5kb3cuYWxlcnQgPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmFsZXJ0KCcgKyBtc2cgKyAnKScpOyB9XG4gICAgd2luZG93LmNvbmZpcm0gPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmNvbmZpcm0oJyArIG1zZyArICcpJyk7IHJldHVybiB0cnVlOyB9XG4gIH0sXG5cbiAgaG9va1JBRjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjYWxsYmFjayA9PiB7XG4gICAgICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gcCA9PiB7XG4gICAgICAgICAgaWYgKEdGWFBFUkZURVNUU19DT05GSUcucHJlTWFpbkxvb3ApIHsgXG4gICAgICAgICAgICBHRlhQRVJGVEVTVFNfQ09ORklHLnByZU1haW5Mb29wKCk7IFxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByZVRpY2soKTtcbiAgICBcbiAgICAgICAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYmVuY2htYXJrRmluaXNoZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgXG4gICAgICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICAgIHRoaXMudGljaygpO1xuICAgICAgICAgIHRoaXMuc3RhdHMuZnJhbWVFbmQoKTtcbiAgXG4gICAgICAgICAgaWYgKEdGWFBFUkZURVNUU19DT05GSUcucG9zdE1haW5Mb29wKSB7XG4gICAgICAgICAgICBHRlhQRVJGVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoIUdGWFBFUkZURVNUU19DT05GSUcucHJvdmlkZXNSYWZJbnRlZ3JhdGlvbikge1xuICAgICAgdGhpcy5ob29rUkFGKCk7XG4gICAgfVxuICAgIHRoaXMuYWRkUHJvZ3Jlc3NCYXIoKTtcblxuICAgIGNvbnNvbGUubG9nKCdGcmFtZXMgdG8gcmVuZGVyOicsIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpO1xuXG4gICAgaWYgKCFHRlhQRVJGVEVTVFNfQ09ORklHLmRvbnRPdmVycmlkZVRpbWUpIHtcbiAgICAgIEZha2VUaW1lcnMuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgTWF0aC5yYW5kb20gPSBzZWVkcmFuZG9tKHRoaXMucmFuZG9tU2VlZCk7XG5cbiAgICB0aGlzLmhhbmRsZVNpemUoKTtcbiAgICBDYW52YXNIb29rLmVuYWJsZShPYmplY3QuYXNzaWduKHtmYWtlV2ViR0w6IHR5cGVvZiBwYXJhbWV0ZXJzWydmYWtlLXdlYmdsJ10gIT09ICd1bmRlZmluZWQnfSwgdGhpcy53aW5kb3dTaXplKSk7XG4gICAgdGhpcy5ob29rTW9kYWxzKCk7XG5cbiAgICAvLyB0aGlzLmluaXRTZXJ2ZXIoKTtcblxuICAgIHRoaXMuc3RhdHMgPSBuZXcgUGVyZlN0YXRzKCk7XG5cbiAgICB0aGlzLmxvZ3MgPSB7XG4gICAgICBlcnJvcnM6IFtdLFxuICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgY2F0Y2hFcnJvcnM6IFtdXG4gICAgfTtcbiAgICB0aGlzLndyYXBFcnJvcnMoKTtcblxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lciA9IG5ldyBFdmVudExpc3RlbmVyTWFuYWdlcigpO1xuICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVwbGF5J10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmV2ZW50TGlzdGVuZXIuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPSAwO1xuICAgIHRoaXMudGltZVN0YXJ0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICB9LFxuXG4gIGhhbmRsZVNpemU6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IERFRkFVTFRfV0lEVEggPSA4MDA7XG4gICAgY29uc3QgREVGQVVMVF9IRUlHSFQgPSA2MDA7XG4gICAgdGhpcy53aW5kb3dTaXplID0ge307XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydrZWVwLXdpbmRvdy1zaXplJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLndpbmRvd1NpemUgPSB7XG4gICAgICAgIHdpZHRoOiB0eXBlb2YgcGFyYW1ldGVyc1snd2lkdGgnXSA9PT0gJ3VuZGVmaW5lZCcgPyBERUZBVUxUX1dJRFRIIDogcGFyc2VJbnQocGFyYW1ldGVyc1snd2lkdGgnXSksXG4gICAgICAgIGhlaWdodDogdHlwZW9mIHBhcmFtZXRlcnNbJ2hlaWdodCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfSEVJR0hUIDogcGFyc2VJbnQocGFyYW1ldGVyc1snaGVpZ2h0J10pXG4gICAgICB9XG4gICAgICB3aW5kb3cuaW5uZXJXaWR0aCA9IHRoaXMud2luZG93U2l6ZS53aWR0aDtcbiAgICAgIHdpbmRvdy5pbm5lckhlaWdodCA9IHRoaXMud2luZG93U2l6ZS5oZWlnaHQ7XG4gICAgfVxuICB9XG59O1xuXG5URVNURVIuaW5pdCgpO1xuXG52YXIgcGFnZUluaXRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuIl0sIm5hbWVzIjpbIlN0YXRzIiwidGhpcyIsImRlZmluZSIsInJlcXVpcmUkJDAiLCJzciIsImRlY29kZSIsImRlY29kZUNvbXBvbmVudCIsIktleXN0cm9rZVZpc3VhbGl6ZXIiLCJzZWVkcmFuZG9tIiwiUGVyZlN0YXRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztDQUFBLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQzs7Q0FFdEIsTUFBTSxRQUFRLENBQUM7Q0FDZixFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUU7Q0FDakIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNmLEdBQUc7O0NBRUgsRUFBRSxPQUFPLEdBQUcsR0FBRztDQUNmLElBQUksT0FBTyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7Q0FDMUIsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sT0FBTyxHQUFHO0NBQ25CLElB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QyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ2I7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtHQUNsQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixPQUFPLENBQUMsQ0FBQztFQUNWOztDQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7R0FDeEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO09BQ25CLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUs7T0FDMUIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7R0FDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDLEdBQUU7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TUFBTSxFQUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0dBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOzs7R0FHNUIsRUFBRSxDQUFDLElBQUksR0FBRyxXQUFXO0tBQ25CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNuRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDOUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQzs7R0FFRixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztHQUVULElBQUksSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTs7S0FFdkIsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDYixNQUFNOztLQUVM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
