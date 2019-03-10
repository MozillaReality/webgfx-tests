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
		if (!obj) {
			return '';
		}

		options = Object.assign({
			encode: true,
			strict: true,
			arrayFormat: 'none'
		}, options);

		const formatter = encoderForArrayFormat(options);
		const keys = Object.keys(obj);

		if (options.sort !== false) {
			keys.sort(options.sort);
		}

		return keys.map(key => {
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
	    var e = new Event('wheel');
	    const eventType = 'wheel';
	    e.deltaX = parameters.deltaX;
	    e.deltaY = parameters.deltaY;
	    e.deltaZ = parameters.deltaZ;
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
	          // To prevent width & height 100%
	          function addStyleString(str) {
	            var node = document.createElement('style');
	            node.innerHTML = str;
	            document.body.appendChild(node);
	          }

	          addStyleString(`.gfxtests-canvas {width: ${this.windowSize.width}px !important; height: ${this.windowSize.height}px !important;}`);
	          this.canvas.classList.add('gfxtests-canvas');
	          this.canvas.width = this.windowSize.width;
	          this.canvas.height = this.windowSize.height;

	          WebGLStats$1.setupExtensions(context);

	          if (typeof parameters['recording'] !== 'undefined' && !this.inputRecorder) {
	            this.inputRecorder = new InputRecorder(this.canvas);
	            this.inputRecorder.enable();
	          }
	        }
	        //@fixme else for canvas 2d without webgl
	      }

	      if (this.referenceTestFrameNumber === 0) {
	        if ('autoenter-xr' in parameters) {
	          this.injectAutoEnterXR(this.canvas);
	        }
	      }

	      if (typeof parameters['replay'] !== 'undefined' && !this.inputReplayer) {
	        if (GFXTESTS_CONFIG.input) {
	          // @fixme Prevent multiple fetch while waiting
	          fetch('/tests/' + GFXTESTS_CONFIG.input).then(response => {
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

	    this.handleSize();
	    CanvasHook.enable(Object.assign({fakeWebGL: typeof parameters['fake-webgl'] !== 'undefined'}, this.windowSize));
	    this.hookModals();

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
	          device.requestPresent( [ { source: canvas } ] );
	        }), 2000;}); // @fix to make it work on FxR
	    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jYW52YXMtaG9vay9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbmNyZW1lbnRhbC1zdGF0cy1saXRlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLXN0YXRzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL2FsZWEuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yMTI4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcndvdy5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3JzaGlmdDcuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yNDA5Ni5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi90eWNoZWkuanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9zZWVkcmFuZG9tLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc3RyaWN0LXVyaS1lbmNvZGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvZGVjb2RlLXVyaS1jb21wb25lbnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcXVlcnktc3RyaW5nL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2lucHV0LWV2ZW50cy1yZWNvcmRlci9zcmMvcmVjb3JkZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZXBsYXllci5qcyIsIi4uL3NyYy9jbGllbnQvZXZlbnQtbGlzdGVuZXJzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2tleXN0cm9rZS12aXN1YWxpemVyL2J1aWxkL2tleXN0cm9rZS12aXN1YWxpemVyLmpzIiwiLi4vc3JjL2NsaWVudC9pbnB1dC1oZWxwZXJzLmpzIiwiLi4vc3JjL2NsaWVudC9pbWFnZS11dGlscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9waXhlbG1hdGNoL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYmdsLXN0YXRzL2luZGV4LmpzIiwiLi4vc3JjL2NsaWVudC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFsRGF0ZSA9IERhdGU7XG5cbmNsYXNzIE1vY2tEYXRlIHtcbiAgY29uc3RydWN0b3IodCkge1xuICAgIHRoaXMudCA9IHQ7XG4gIH1cblxuICBzdGF0aWMgbm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHN0YXRpYyByZWFsTm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldFRpbWV6b25lT2Zmc2V0KCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdG9UaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldERhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldERheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldEhvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRUaW1lKCkgeyByZXR1cm4gMDsgfVxuICBnZXRZZWFyKCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0YXRpYyBVVEMoKSB7IHJldHVybiAwOyB9XG5cbiAgZ2V0VVRDRGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDSG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ1NlY29uZHMoKSB7IHJldHVybiAwOyB9XG5cbiAgc2V0RGF0ZSgpIHt9XG4gIHNldEZ1bGxZZWFyKCkge31cbiAgc2V0SG91cnMoKSB7fVxuICBzZXRNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRNaW51dGVzKCkge31cbiAgc2V0TW9udGgoKSB7fVxuICBzZXRTZWNvbmRzKCkge31cbiAgc2V0VGltZSgpIHt9XG5cbiAgc2V0VVRDRGF0ZSgpIHt9XG4gIHNldFVUQ0Z1bGxZZWFyKCkge31cbiAgc2V0VVRDSG91cnMoKSB7fVxuICBzZXRVVENNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRVVENNaW51dGVzKCkge31cbiAgc2V0VVRDTW9udGgoKSB7fVxuXG4gIHNldFllYXIoKSB7fVxufVxuXG52YXIgcmVhbFBlcmZvcm1hbmNlO1xuXG5pZiAoIXBlcmZvcm1hbmNlLnJlYWxOb3cpIHtcbiAgdmFyIGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzU2FmYXJpKSB7XG4gICAgcmVhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG4gICAgcGVyZm9ybWFuY2UgPSB7XG4gICAgICByZWFsTm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHBlcmZvcm1hbmNlLnJlYWxOb3cgPSBwZXJmb3JtYW5jZS5ub3c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0aW1lU2NhbGU6IDEuMCxcbiAgZmFrZWRUaW1lOiAwLFxuICBlbmFibGVkOiBmYWxzZSxcbiAgbmVlZHNGYWtlTW9ub3Rvbm91c2x5SW5jcmVhc2luZ1RpbWVyOiBmYWxzZSxcbiAgc2V0RmFrZWRUaW1lOiBmdW5jdGlvbiggbmV3RmFrZWRUaW1lICkge1xuICAgIHRoaXMuZmFrZWRUaW1lID0gbmV3RmFrZWRUaW1lO1xuICB9LFxuICBlbmFibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBEYXRlID0gTW9ja0RhdGU7XG4gICAgXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLm5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcikge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgc2VsZi5mYWtlZFRpbWUgKz0gc2VsZi50aW1lU2NhbGU7IHJldHVybiBzZWxmLmZha2VkVGltZTsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICB9IGVsc2Uge1xuICAgICAgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgICBwZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lICogMTAwMC4wICogc2VsZi50aW1lU2NhbGUgLyA2MC4wOyB9XG4gICAgfVxuICBcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlO1xuICB9LFxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVuYWJsZWQpIHsgcmV0dXJuOyB9O1xuICAgIFxuICAgIERhdGUgPSBSZWFsRGF0ZTsgICAgXG4gICAgcGVyZm9ybWFuY2Uubm93ID0gcmVhbFBlcmZvcm1hbmNlLm5vdztcbiAgICBcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTsgICAgXG4gIH1cbn0iLCJjb25zdCBvcmlnaW5hbCA9IFsnZ2V0UGFyYW1ldGVyJywgJ2dldEV4dGVuc2lvbicsICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnXTtcbmNvbnN0IGVtcHR5U3RyaW5nID0gWydnZXRTaGFkZXJJbmZvTG9nJywgJ2dldFByb2dyYW1JbmZvTG9nJ107XG5jb25zdCByZXR1cm4xID0gWydpc0J1ZmZlcicsICdpc0VuYWJsZWQnLCAnaXNGcmFtZWJ1ZmZlcicsICdpc1Byb2dyYW0nLCAnaXNRdWVyeScsICdpc1ZlcnRleEFycmF5JywgJ2lzU2FtcGxlcicsICdpc1N5bmMnLCAnaXNUcmFuc2Zvcm1GZWVkYmFjaycsXG4naXNSZW5kZXJidWZmZXInLCAnaXNTaGFkZXInLCAnaXNUZXh0dXJlJywgJ3ZhbGlkYXRlUHJvZ3JhbScsICdnZXRTaGFkZXJQYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGVuYWJsZTogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBpZiAoZW5hYmxlZCkge3JldHVybjt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBvcmlnaW5hbEdldENvbnRleHQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuZmFrZVdlYkdMKSB7XG4gICAgICAgICAgY3R4ID0gbmV3IEZha2VXZWJHTChjdHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4OyAgICBcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7ICBcbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFlbmFibGVkKSB7cmV0dXJuO31cbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbiAgICBlbmFibGVkID0gZmFsc2U7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBlcmZTdGF0cyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubiA9IDA7XG4gICAgdGhpcy5taW4gPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMubWF4ID0gLU51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMubWVhbiA9IDA7XG4gICAgdGhpcy5xID0gMDtcbiAgfVxuXG4gIGdldCB2YXJpYW5jZSgpIHtcbiAgICByZXR1cm4gdGhpcy5xIC8gdGhpcy5uO1xuICB9XG5cbiAgZ2V0IHN0YW5kYXJkX2RldmlhdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHRoaXMucSAvIHRoaXMubik7XG4gIH1cblxuICB1cGRhdGUodmFsdWUpIHtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bSkpIHtcbiAgICAgIC8vIFNvcnJ5LCBubyBOYU5zXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMubisrO1xuICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIG51bSk7XG4gICAgdGhpcy5tYXggPSBNYXRoLm1heCh0aGlzLm1heCwgbnVtKTtcbiAgICB0aGlzLnN1bSArPSBudW07XG4gICAgY29uc3QgcHJldk1lYW4gPSB0aGlzLm1lYW47XG4gICAgdGhpcy5tZWFuID0gdGhpcy5tZWFuICsgKG51bSAtIHRoaXMubWVhbikgLyB0aGlzLm47XG4gICAgdGhpcy5xID0gdGhpcy5xICsgKG51bSAtIHByZXZNZWFuKSAqIChudW0gLSB0aGlzLm1lYW4pO1xuICB9XG5cbiAgZ2V0QWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBuOiB0aGlzLm4sXG4gICAgICBtaW46IHRoaXMubWluLFxuICAgICAgbWF4OiB0aGlzLm1heCxcbiAgICAgIHN1bTogdGhpcy5zdW0sXG4gICAgICBtZWFuOiB0aGlzLm1lYW4sXG4gICAgICB2YXJpYW5jZTogdGhpcy52YXJpYW5jZSxcbiAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICB9O1xuICB9ICBcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBURVNUU1RBVFNcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKCkge1xuXG4gIHZhciBmaXJzdEZyYW1lID0gdHJ1ZTtcbiAgdmFyIGZpcnN0RnBzID0gdHJ1ZTtcblxuICB2YXIgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gMDtcbiAgdmFyIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICB2YXIgbGFzdFVwZGF0ZVRpbWUgPSBudWxsO1xuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IHJlY3Vyc2l2ZSBlbnRyaWVzIHRvIHRoZSBtYWluIGxvb3AsIHdoaWNoIGNhbiBoYXBwZW4gaW4gY2VydGFpbiBjb21wbGV4IGNhc2VzLCBlLmcuIGlmIG5vdCB1c2luZyByQUYgdG8gdGljayByZW5kZXJpbmcgdG8gdGhlIGNhbnZhcy5cbiAgdmFyIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9IDA7XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdGF0c1N1bW1hcnk6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuc3RhdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgICAgbWluOiB0aGlzLnN0YXRzW2tleV0ubWluLFxuICAgICAgICAgIG1heDogdGhpcy5zdGF0c1trZXldLm1heCxcbiAgICAgICAgICBhdmc6IHRoaXMuc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICAgIHN0YW5kYXJkX2RldmlhdGlvbjogdGhpcy5zdGF0c1trZXldLnN0YW5kYXJkX2RldmlhdGlvblxuICAgICAgICB9O1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIHN0YXRzOiB7XG4gICAgICBmcHM6IG5ldyBTdGF0cygpLFxuICAgICAgZHQ6IG5ldyBTdGF0cygpLFxuICAgICAgY3B1OiBuZXcgU3RhdHMoKSAgICAgICAgXG4gICAgfSxcblxuICAgIG51bUZyYW1lczogMCxcbiAgICBsb2c6IGZhbHNlLFxuICAgIHRvdGFsVGltZUluTWFpbkxvb3A6IDAsXG4gICAgdG90YWxUaW1lT3V0c2lkZU1haW5Mb29wOiAwLFxuICAgIGZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbDogMjAwLCAvLyBtc2Vjc1xuXG4gICAgZnJhbWVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIrKztcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPT0gMSkgXG4gICAgICB7XG4gICAgICAgIGlmIChsYXN0VXBkYXRlVGltZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGxhc3RVcGRhdGVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudEZyYW1lU3RhcnRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRzKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVN0YXRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuXG4gICAgICBpZiAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lID4gdGhpcy5mcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWwpXG4gICAgICB7XG4gICAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lcyAqIDEwMDAgLyAodGltZU5vdyAtIGxhc3RVcGRhdGVUaW1lKTtcbiAgICAgICAgdGhpcy5udW1GcmFtZXMgPSAwO1xuICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHRpbWVOb3c7XG5cbiAgICAgICAgaWYgKGZpcnN0RnBzKVxuICAgICAgICB7XG4gICAgICAgICAgZmlyc3RGcHMgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRzLmZwcy51cGRhdGUoZnBzKTtcblxuICAgICAgICBpZiAodGhpcy5sb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgZnBzIC0gbWluOiAke3RoaXMuc3RhdHMuZnBzLm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmZwcy5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZnBzLm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmZwcy5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgbXMgIC0gbWluOiAke3RoaXMuc3RhdHMuZHQubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZHQubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmR0Lm1heC50b0ZpeGVkKDIpfSAtIHN0ZDogJHt0aGlzLnN0YXRzLmR0LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBjcHUgLSBtaW46ICR7dGhpcy5zdGF0cy5jcHUubWluLnRvRml4ZWQoMil9JSAvIGF2ZzogJHt0aGlzLnN0YXRzLmNwdS5tZWFuLnRvRml4ZWQoMil9JSAvIG1heDogJHt0aGlzLnN0YXRzLmNwdS5tYXgudG9GaXhlZCgyKX0lIC0gc3RkOiAke3RoaXMuc3RhdHMuY3B1LnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfSVgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyk7ICBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBDYWxsZWQgaW4gdGhlIGVuZCBvZiBlYWNoIG1haW4gbG9vcCBmcmFtZSB0aWNrLlxuICAgIGZyYW1lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlci0tO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciAhPSAwKSByZXR1cm47XG5cbiAgICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgdmFyIGNwdU1haW5Mb29wRHVyYXRpb24gPSB0aW1lTm93IC0gY3VycmVudEZyYW1lU3RhcnRUaW1lO1xuICAgICAgdmFyIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyA9IHRpbWVOb3cgLSBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgICAgIHByZXZpb3VzRnJhbWVFbmRUaW1lID0gdGltZU5vdztcbiAgXG4gICAgICBpZiAoZmlyc3RGcmFtZSkge1xuICAgICAgICBmaXJzdEZyYW1lID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy50b3RhbFRpbWVJbk1haW5Mb29wICs9IGNwdU1haW5Mb29wRHVyYXRpb247XG4gICAgICB0aGlzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCArPSBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgLSBjcHVNYWluTG9vcER1cmF0aW9uO1xuXG4gICAgICB2YXIgY3B1ID0gY3B1TWFpbkxvb3BEdXJhdGlvbiAqIDEwMCAvIGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcztcbiAgICAgIHRoaXMuc3RhdHMuY3B1LnVwZGF0ZShjcHUpO1xuICAgICAgdGhpcy5zdGF0cy5kdC51cGRhdGUoZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzKTtcbiAgICB9XG4gIH1cbn07IiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vIFxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy8gXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIEFsZWEoc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBtYXNoID0gTWFzaCgpO1xuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IDIwOTE2MzkgKiBtZS5zMCArIG1lLmMgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICAgIG1lLnMwID0gbWUuczE7XG4gICAgbWUuczEgPSBtZS5zMjtcbiAgICByZXR1cm4gbWUuczIgPSB0IC0gKG1lLmMgPSB0IHwgMCk7XG4gIH07XG5cbiAgLy8gQXBwbHkgdGhlIHNlZWRpbmcgYWxnb3JpdGhtIGZyb20gQmFhZ29lLlxuICBtZS5jID0gMTtcbiAgbWUuczAgPSBtYXNoKCcgJyk7XG4gIG1lLnMxID0gbWFzaCgnICcpO1xuICBtZS5zMiA9IG1hc2goJyAnKTtcbiAgbWUuczAgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMwIDwgMCkgeyBtZS5zMCArPSAxOyB9XG4gIG1lLnMxIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMSA8IDApIHsgbWUuczEgKz0gMTsgfVxuICBtZS5zMiAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczIgPCAwKSB7IG1lLnMyICs9IDE7IH1cbiAgbWFzaCA9IG51bGw7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmMgPSBmLmM7XG4gIHQuczAgPSBmLnMwO1xuICB0LnMxID0gZi5zMTtcbiAgdC5zMiA9IGYuczI7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IEFsZWEoc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSB4Zy5uZXh0O1xuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpICogMHgxMDAwMDAwMDApIHwgMDsgfVxuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwcm5nKCkgKyAocHJuZygpICogMHgyMDAwMDAgfCAwKSAqIDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7IC8vIDJeLTUzXG4gIH07XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5mdW5jdGlvbiBNYXNoKCkge1xuICB2YXIgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgdmFyIG1hc2ggPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIG4gKz0gZGF0YS5jaGFyQ29kZUF0KGkpO1xuICAgICAgdmFyIGggPSAwLjAyNTE5NjAzMjgyNDE2OTM4ICogbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgaCAqPSBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBuICs9IGggKiAweDEwMDAwMDAwMDsgLy8gMl4zMlxuICAgIH1cbiAgICByZXR1cm4gKG4gPj4+IDApICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgfTtcblxuICByZXR1cm4gbWFzaDtcbn1cblxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLmFsZWEgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcjEyOFwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSBtZS54IF4gKG1lLnggPDwgMTEpO1xuICAgIG1lLnggPSBtZS55O1xuICAgIG1lLnkgPSBtZS56O1xuICAgIG1lLnogPSBtZS53O1xuICAgIHJldHVybiBtZS53IF49IChtZS53ID4+PiAxOSkgXiB0IF4gKHQgPj4+IDgpO1xuICB9O1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yMTI4ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3J3b3dcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gKG1lLnggXiAobWUueCA+Pj4gMikpO1xuICAgIG1lLnggPSBtZS55OyBtZS55ID0gbWUuejsgbWUueiA9IG1lLnc7IG1lLncgPSBtZS52O1xuICAgIHJldHVybiAobWUuZCA9IChtZS5kICsgMzYyNDM3IHwgMCkpICtcbiAgICAgICAobWUudiA9IChtZS52IF4gKG1lLnYgPDwgNCkpIF4gKHQgXiAodCA8PCAxKSkpIHwgMDtcbiAgfTtcblxuICBtZS54ID0gMDtcbiAgbWUueSA9IDA7XG4gIG1lLnogPSAwO1xuICBtZS53ID0gMDtcbiAgbWUudiA9IDA7XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIGlmIChrID09IHN0cnNlZWQubGVuZ3RoKSB7XG4gICAgICBtZS5kID0gbWUueCA8PCAxMCBeIG1lLnggPj4+IDQ7XG4gICAgfVxuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICB0LnYgPSBmLnY7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yd293ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3JzaGlmdDdcIiBhbGdvcml0aG0gYnlcbi8vIEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyOlxuLy8gXCJPbiB0aGUgWG9yZ3NoaWZ0IFJhbmRvbSBOdW1iZXIgR2VuZXJhdG9yc1wiXG4vLyBodHRwOi8vc2FsdWMuZW5nci51Y29ubi5lZHUvcmVmcy9jcnlwdG8vcm5nL3Bhbm5ldG9uMDVvbnRoZXhvcnNoaWZ0LnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2YXIgWCA9IG1lLngsIGkgPSBtZS5pLCB0LCB2LCB3O1xuICAgIHQgPSBYW2ldOyB0IF49ICh0ID4+PiA3KTsgdiA9IHQgXiAodCA8PCAyNCk7XG4gICAgdCA9IFhbKGkgKyAxKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMTApO1xuICAgIHQgPSBYWyhpICsgMykgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDMpO1xuICAgIHQgPSBYWyhpICsgNCkgJiA3XTsgdiBePSB0IF4gKHQgPDwgNyk7XG4gICAgdCA9IFhbKGkgKyA3KSAmIDddOyB0ID0gdCBeICh0IDw8IDEzKTsgdiBePSB0IF4gKHQgPDwgOSk7XG4gICAgWFtpXSA9IHY7XG4gICAgbWUuaSA9IChpICsgMSkgJiA3O1xuICAgIHJldHVybiB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgaiwgdywgWCA9IFtdO1xuXG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgYXJyYXkgdXNpbmcgYSAzMi1iaXQgaW50ZWdlci5cbiAgICAgIHcgPSBYWzBdID0gc2VlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU2VlZCBzdGF0ZSB1c2luZyBhIHN0cmluZy5cbiAgICAgIHNlZWQgPSAnJyArIHNlZWQ7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgc2VlZC5sZW5ndGg7ICsraikge1xuICAgICAgICBYW2ogJiA3XSA9IChYW2ogJiA3XSA8PCAxNSkgXlxuICAgICAgICAgICAgKHNlZWQuY2hhckNvZGVBdChqKSArIFhbKGogKyAxKSAmIDddIDw8IDEzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRW5mb3JjZSBhbiBhcnJheSBsZW5ndGggb2YgOCwgbm90IGFsbCB6ZXJvZXMuXG4gICAgd2hpbGUgKFgubGVuZ3RoIDwgOCkgWC5wdXNoKDApO1xuICAgIGZvciAoaiA9IDA7IGogPCA4ICYmIFhbal0gPT09IDA7ICsraik7XG4gICAgaWYgKGogPT0gOCkgdyA9IFhbN10gPSAtMTsgZWxzZSB3ID0gWFtqXTtcblxuICAgIG1lLnggPSBYO1xuICAgIG1lLmkgPSAwO1xuXG4gICAgLy8gRGlzY2FyZCBhbiBpbml0aWFsIDI1NiB2YWx1ZXMuXG4gICAgZm9yIChqID0gMjU2OyBqID4gMDsgLS1qKSB7XG4gICAgICBtZS5uZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLnguc2xpY2UoKTtcbiAgdC5pID0gZi5pO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUueCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcnNoaWZ0NyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIFJpY2hhcmQgQnJlbnQncyBYb3JnZW5zIHhvcjQwOTYgYWxnb3JpdGhtLlxuLy9cbi8vIFRoaXMgZmFzdCBub24tY3J5cHRvZ3JhcGhpYyByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBpcyBkZXNpZ25lZCBmb3Jcbi8vIHVzZSBpbiBNb250ZS1DYXJsbyBhbGdvcml0aG1zLiBJdCBjb21iaW5lcyBhIGxvbmctcGVyaW9kIHhvcnNoaWZ0XG4vLyBnZW5lcmF0b3Igd2l0aCBhIFdleWwgZ2VuZXJhdG9yLCBhbmQgaXQgcGFzc2VzIGFsbCBjb21tb24gYmF0dGVyaWVzXG4vLyBvZiBzdGFzdGljaWFsIHRlc3RzIGZvciByYW5kb21uZXNzIHdoaWxlIGNvbnN1bWluZyBvbmx5IGEgZmV3IG5hbm9zZWNvbmRzXG4vLyBmb3IgZWFjaCBwcm5nIGdlbmVyYXRlZC4gIEZvciBiYWNrZ3JvdW5kIG9uIHRoZSBnZW5lcmF0b3IsIHNlZSBCcmVudCdzXG4vLyBwYXBlcjogXCJTb21lIGxvbmctcGVyaW9kIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9ycyB1c2luZyBzaGlmdHMgYW5kIHhvcnMuXCJcbi8vIGh0dHA6Ly9hcnhpdi5vcmcvcGRmLzEwMDQuMzExNXYxLnBkZlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciB4b3I0MDk2ID0gcmVxdWlyZSgneG9yNDA5NicpO1xuLy8gcmFuZG9tID0geG9yNDA5NigxKTsgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWVkIHdpdGggaW50MzIgb3Igc3RyaW5nLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbSgpLCAwLjE1MjA0MzY0NTA1Mzg1NDcpOyAvLyAoMCwgMSkgcmFuZ2UsIDUzIGJpdHMuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tLmludDMyKCksIDE4MDY1MzQ4OTcpOyAgIC8vIHNpZ25lZCBpbnQzMiwgMzIgYml0cy5cbi8vXG4vLyBGb3Igbm9uemVybyBudW1lcmljIGtleXMsIHRoaXMgaW1wZWxlbWVudGF0aW9uIHByb3ZpZGVzIGEgc2VxdWVuY2Vcbi8vIGlkZW50aWNhbCB0byB0aGF0IGJ5IEJyZW50J3MgeG9yZ2VucyAzIGltcGxlbWVudGFpb24gaW4gQy4gIFRoaXNcbi8vIGltcGxlbWVudGF0aW9uIGFsc28gcHJvdmlkZXMgZm9yIGluaXRhbGl6aW5nIHRoZSBnZW5lcmF0b3Igd2l0aFxuLy8gc3RyaW5nIHNlZWRzLCBvciBmb3Igc2F2aW5nIGFuZCByZXN0b3JpbmcgdGhlIHN0YXRlIG9mIHRoZSBnZW5lcmF0b3IuXG4vL1xuLy8gT24gQ2hyb21lLCB0aGlzIHBybmcgYmVuY2htYXJrcyBhYm91dCAyLjEgdGltZXMgc2xvd2VyIHRoYW5cbi8vIEphdmFzY3JpcHQncyBidWlsdC1pbiBNYXRoLnJhbmRvbSgpLlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdyA9IG1lLncsXG4gICAgICAgIFggPSBtZS5YLCBpID0gbWUuaSwgdCwgdjtcbiAgICAvLyBVcGRhdGUgV2V5bCBnZW5lcmF0b3IuXG4gICAgbWUudyA9IHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDtcbiAgICAvLyBVcGRhdGUgeG9yIGdlbmVyYXRvci5cbiAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgdiBePSB2IDw8IDEzO1xuICAgIHQgXj0gdCA8PCAxNztcbiAgICB2IF49IHYgPj4+IDE1O1xuICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgLy8gVXBkYXRlIFhvciBnZW5lcmF0b3IgYXJyYXkgc3RhdGUuXG4gICAgdiA9IFhbaV0gPSB2IF4gdDtcbiAgICBtZS5pID0gaTtcbiAgICAvLyBSZXN1bHQgaXMgdGhlIGNvbWJpbmF0aW9uLlxuICAgIHJldHVybiAodiArICh3IF4gKHcgPj4+IDE2KSkpIHwgMDtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIHQsIHYsIGksIGosIHcsIFggPSBbXSwgbGltaXQgPSAxMjg7XG4gICAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAgIC8vIE51bWVyaWMgc2VlZHMgaW5pdGlhbGl6ZSB2LCB3aGljaCBpcyB1c2VkIHRvIGdlbmVyYXRlcyBYLlxuICAgICAgdiA9IHNlZWQ7XG4gICAgICBzZWVkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gU3RyaW5nIHNlZWRzIGFyZSBtaXhlZCBpbnRvIHYgYW5kIFggb25lIGNoYXJhY3RlciBhdCBhIHRpbWUuXG4gICAgICBzZWVkID0gc2VlZCArICdcXDAnO1xuICAgICAgdiA9IDA7XG4gICAgICBsaW1pdCA9IE1hdGgubWF4KGxpbWl0LCBzZWVkLmxlbmd0aCk7XG4gICAgfVxuICAgIC8vIEluaXRpYWxpemUgY2lyY3VsYXIgYXJyYXkgYW5kIHdleWwgdmFsdWUuXG4gICAgZm9yIChpID0gMCwgaiA9IC0zMjsgaiA8IGxpbWl0OyArK2opIHtcbiAgICAgIC8vIFB1dCB0aGUgdW5pY29kZSBjaGFyYWN0ZXJzIGludG8gdGhlIGFycmF5LCBhbmQgc2h1ZmZsZSB0aGVtLlxuICAgICAgaWYgKHNlZWQpIHYgXj0gc2VlZC5jaGFyQ29kZUF0KChqICsgMzIpICUgc2VlZC5sZW5ndGgpO1xuICAgICAgLy8gQWZ0ZXIgMzIgc2h1ZmZsZXMsIHRha2UgdiBhcyB0aGUgc3RhcnRpbmcgdyB2YWx1ZS5cbiAgICAgIGlmIChqID09PSAwKSB3ID0gdjtcbiAgICAgIHYgXj0gdiA8PCAxMDtcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB2IF49IHYgPDwgNDtcbiAgICAgIHYgXj0gdiA+Pj4gMTM7XG4gICAgICBpZiAoaiA+PSAwKSB7XG4gICAgICAgIHcgPSAodyArIDB4NjFjODg2NDcpIHwgMDsgICAgIC8vIFdleWwuXG4gICAgICAgIHQgPSAoWFtqICYgMTI3XSBePSAodiArIHcpKTsgIC8vIENvbWJpbmUgeG9yIGFuZCB3ZXlsIHRvIGluaXQgYXJyYXkuXG4gICAgICAgIGkgPSAoMCA9PSB0KSA/IGkgKyAxIDogMDsgICAgIC8vIENvdW50IHplcm9lcy5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gV2UgaGF2ZSBkZXRlY3RlZCBhbGwgemVyb2VzOyBtYWtlIHRoZSBrZXkgbm9uemVyby5cbiAgICBpZiAoaSA+PSAxMjgpIHtcbiAgICAgIFhbKHNlZWQgJiYgc2VlZC5sZW5ndGggfHwgMCkgJiAxMjddID0gLTE7XG4gICAgfVxuICAgIC8vIFJ1biB0aGUgZ2VuZXJhdG9yIDUxMiB0aW1lcyB0byBmdXJ0aGVyIG1peCB0aGUgc3RhdGUgYmVmb3JlIHVzaW5nIGl0LlxuICAgIC8vIEZhY3RvcmluZyB0aGlzIGFzIGEgZnVuY3Rpb24gc2xvd3MgdGhlIG1haW4gZ2VuZXJhdG9yLCBzbyBpdCBpcyBqdXN0XG4gICAgLy8gdW5yb2xsZWQgaGVyZS4gIFRoZSB3ZXlsIGdlbmVyYXRvciBpcyBub3QgYWR2YW5jZWQgd2hpbGUgd2FybWluZyB1cC5cbiAgICBpID0gMTI3O1xuICAgIGZvciAoaiA9IDQgKiAxMjg7IGogPiAwOyAtLWopIHtcbiAgICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgICAgdiBePSB2IDw8IDEzO1xuICAgICAgdCBePSB0IDw8IDE3O1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHQgXj0gdCA+Pj4gMTI7XG4gICAgICBYW2ldID0gdiBeIHQ7XG4gICAgfVxuICAgIC8vIFN0b3Jpbmcgc3RhdGUgYXMgb2JqZWN0IG1lbWJlcnMgaXMgZmFzdGVyIHRoYW4gdXNpbmcgY2xvc3VyZSB2YXJpYWJsZXMuXG4gICAgbWUudyA9IHc7XG4gICAgbWUuWCA9IFg7XG4gICAgbWUuaSA9IGk7XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC53ID0gZi53O1xuICB0LlggPSBmLlguc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS5YKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yNDA5NiA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aW5kb3cgb2JqZWN0IG9yIGdsb2JhbFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJUeWNoZS1pXCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqby5cbi8vIFNlZSBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kLCBhID0gbWUuYTtcbiAgICBiID0gKGIgPDwgMjUpIF4gKGIgPj4+IDcpIF4gYztcbiAgICBjID0gKGMgLSBkKSB8IDA7XG4gICAgZCA9IChkIDw8IDI0KSBeIChkID4+PiA4KSBeIGE7XG4gICAgYSA9IChhIC0gYikgfCAwO1xuICAgIG1lLmIgPSBiID0gKGIgPDwgMjApIF4gKGIgPj4+IDEyKSBeIGM7XG4gICAgbWUuYyA9IGMgPSAoYyAtIGQpIHwgMDtcbiAgICBtZS5kID0gKGQgPDwgMTYpIF4gKGMgPj4+IDE2KSBeIGE7XG4gICAgcmV0dXJuIG1lLmEgPSAoYSAtIGIpIHwgMDtcbiAgfTtcblxuICAvKiBUaGUgZm9sbG93aW5nIGlzIG5vbi1pbnZlcnRlZCB0eWNoZSwgd2hpY2ggaGFzIGJldHRlciBpbnRlcm5hbFxuICAgKiBiaXQgZGlmZnVzaW9uLCBidXQgd2hpY2ggaXMgYWJvdXQgMjUlIHNsb3dlciB0aGFuIHR5Y2hlLWkgaW4gSlMuXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSA9IG1lLmEsIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQ7XG4gICAgYSA9IChtZS5hICsgbWUuYiB8IDApID4+PiAwO1xuICAgIGQgPSBtZS5kIF4gYTsgZCA9IGQgPDwgMTYgXiBkID4+PiAxNjtcbiAgICBjID0gbWUuYyArIGQgfCAwO1xuICAgIGIgPSBtZS5iIF4gYzsgYiA9IGIgPDwgMTIgXiBkID4+PiAyMDtcbiAgICBtZS5hID0gYSA9IGEgKyBiIHwgMDtcbiAgICBkID0gZCBeIGE7IG1lLmQgPSBkID0gZCA8PCA4IF4gZCA+Pj4gMjQ7XG4gICAgbWUuYyA9IGMgPSBjICsgZCB8IDA7XG4gICAgYiA9IGIgXiBjO1xuICAgIHJldHVybiBtZS5iID0gKGIgPDwgNyBeIGIgPj4+IDI1KTtcbiAgfVxuICAqL1xuXG4gIG1lLmEgPSAwO1xuICBtZS5iID0gMDtcbiAgbWUuYyA9IDI2NTQ0MzU3NjkgfCAwO1xuICBtZS5kID0gMTM2NzEzMDU1MTtcblxuICBpZiAoc2VlZCA9PT0gTWF0aC5mbG9vcihzZWVkKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS5hID0gKHNlZWQgLyAweDEwMDAwMDAwMCkgfCAwO1xuICAgIG1lLmIgPSBzZWVkIHwgMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDIwOyBrKyspIHtcbiAgICBtZS5iIF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmEgPSBmLmE7XG4gIHQuYiA9IGYuYjtcbiAgdC5jID0gZi5jO1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy50eWNoZWkgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8qXG5Db3B5cmlnaHQgMjAxNCBEYXZpZCBCYXUuXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xuYSBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG5cIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbndpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbmRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0b1xucGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG50aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG5pbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbkVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbkNMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG5UT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbiovXG5cbihmdW5jdGlvbiAocG9vbCwgbWF0aCkge1xuLy9cbi8vIFRoZSBmb2xsb3dpbmcgY29uc3RhbnRzIGFyZSByZWxhdGVkIHRvIElFRUUgNzU0IGxpbWl0cy5cbi8vXG5cbi8vIERldGVjdCB0aGUgZ2xvYmFsIG9iamVjdCwgZXZlbiBpZiBvcGVyYXRpbmcgaW4gc3RyaWN0IG1vZGUuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDM4NzA1Ny8yNjUyOThcbnZhciBnbG9iYWwgPSAoMCwgZXZhbCkoJ3RoaXMnKSxcbiAgICB3aWR0aCA9IDI1NiwgICAgICAgIC8vIGVhY2ggUkM0IG91dHB1dCBpcyAwIDw9IHggPCAyNTZcbiAgICBjaHVua3MgPSA2LCAgICAgICAgIC8vIGF0IGxlYXN0IHNpeCBSQzQgb3V0cHV0cyBmb3IgZWFjaCBkb3VibGVcbiAgICBkaWdpdHMgPSA1MiwgICAgICAgIC8vIHRoZXJlIGFyZSA1MiBzaWduaWZpY2FudCBkaWdpdHMgaW4gYSBkb3VibGVcbiAgICBybmduYW1lID0gJ3JhbmRvbScsIC8vIHJuZ25hbWU6IG5hbWUgZm9yIE1hdGgucmFuZG9tIGFuZCBNYXRoLnNlZWRyYW5kb21cbiAgICBzdGFydGRlbm9tID0gbWF0aC5wb3cod2lkdGgsIGNodW5rcyksXG4gICAgc2lnbmlmaWNhbmNlID0gbWF0aC5wb3coMiwgZGlnaXRzKSxcbiAgICBvdmVyZmxvdyA9IHNpZ25pZmljYW5jZSAqIDIsXG4gICAgbWFzayA9IHdpZHRoIC0gMSxcbiAgICBub2RlY3J5cHRvOyAgICAgICAgIC8vIG5vZGUuanMgY3J5cHRvIG1vZHVsZSwgaW5pdGlhbGl6ZWQgYXQgdGhlIGJvdHRvbS5cblxuLy9cbi8vIHNlZWRyYW5kb20oKVxuLy8gVGhpcyBpcyB0aGUgc2VlZHJhbmRvbSBmdW5jdGlvbiBkZXNjcmliZWQgYWJvdmUuXG4vL1xuZnVuY3Rpb24gc2VlZHJhbmRvbShzZWVkLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIga2V5ID0gW107XG4gIG9wdGlvbnMgPSAob3B0aW9ucyA9PSB0cnVlKSA/IHsgZW50cm9weTogdHJ1ZSB9IDogKG9wdGlvbnMgfHwge30pO1xuXG4gIC8vIEZsYXR0ZW4gdGhlIHNlZWQgc3RyaW5nIG9yIGJ1aWxkIG9uZSBmcm9tIGxvY2FsIGVudHJvcHkgaWYgbmVlZGVkLlxuICB2YXIgc2hvcnRzZWVkID0gbWl4a2V5KGZsYXR0ZW4oXG4gICAgb3B0aW9ucy5lbnRyb3B5ID8gW3NlZWQsIHRvc3RyaW5nKHBvb2wpXSA6XG4gICAgKHNlZWQgPT0gbnVsbCkgPyBhdXRvc2VlZCgpIDogc2VlZCwgMyksIGtleSk7XG5cbiAgLy8gVXNlIHRoZSBzZWVkIHRvIGluaXRpYWxpemUgYW4gQVJDNCBnZW5lcmF0b3IuXG4gIHZhciBhcmM0ID0gbmV3IEFSQzQoa2V5KTtcblxuICAvLyBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYSByYW5kb20gZG91YmxlIGluIFswLCAxKSB0aGF0IGNvbnRhaW5zXG4gIC8vIHJhbmRvbW5lc3MgaW4gZXZlcnkgYml0IG9mIHRoZSBtYW50aXNzYSBvZiB0aGUgSUVFRSA3NTQgdmFsdWUuXG4gIHZhciBwcm5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSBhcmM0LmcoY2h1bmtzKSwgICAgICAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG51bWVyYXRvciBuIDwgMiBeIDQ4XG4gICAgICAgIGQgPSBzdGFydGRlbm9tLCAgICAgICAgICAgICAgICAgLy8gICBhbmQgZGVub21pbmF0b3IgZCA9IDIgXiA0OC5cbiAgICAgICAgeCA9IDA7ICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGFuZCBubyAnZXh0cmEgbGFzdCBieXRlJy5cbiAgICB3aGlsZSAobiA8IHNpZ25pZmljYW5jZSkgeyAgICAgICAgICAvLyBGaWxsIHVwIGFsbCBzaWduaWZpY2FudCBkaWdpdHMgYnlcbiAgICAgIG4gPSAobiArIHgpICogd2lkdGg7ICAgICAgICAgICAgICAvLyAgIHNoaWZ0aW5nIG51bWVyYXRvciBhbmRcbiAgICAgIGQgKj0gd2lkdGg7ICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGRlbm9taW5hdG9yIGFuZCBnZW5lcmF0aW5nIGFcbiAgICAgIHggPSBhcmM0LmcoMSk7ICAgICAgICAgICAgICAgICAgICAvLyAgIG5ldyBsZWFzdC1zaWduaWZpY2FudC1ieXRlLlxuICAgIH1cbiAgICB3aGlsZSAobiA+PSBvdmVyZmxvdykgeyAgICAgICAgICAgICAvLyBUbyBhdm9pZCByb3VuZGluZyB1cCwgYmVmb3JlIGFkZGluZ1xuICAgICAgbiAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGFzdCBieXRlLCBzaGlmdCBldmVyeXRoaW5nXG4gICAgICBkIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICByaWdodCB1c2luZyBpbnRlZ2VyIG1hdGggdW50aWxcbiAgICAgIHggPj4+PSAxOyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHdlIGhhdmUgZXhhY3RseSB0aGUgZGVzaXJlZCBiaXRzLlxuICAgIH1cbiAgICByZXR1cm4gKG4gKyB4KSAvIGQ7ICAgICAgICAgICAgICAgICAvLyBGb3JtIHRoZSBudW1iZXIgd2l0aGluIFswLCAxKS5cbiAgfTtcblxuICBwcm5nLmludDMyID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgfCAwOyB9XG4gIHBybmcucXVpY2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSAvIDB4MTAwMDAwMDAwOyB9XG4gIHBybmcuZG91YmxlID0gcHJuZztcblxuICAvLyBNaXggdGhlIHJhbmRvbW5lc3MgaW50byBhY2N1bXVsYXRlZCBlbnRyb3B5LlxuICBtaXhrZXkodG9zdHJpbmcoYXJjNC5TKSwgcG9vbCk7XG5cbiAgLy8gQ2FsbGluZyBjb252ZW50aW9uOiB3aGF0IHRvIHJldHVybiBhcyBhIGZ1bmN0aW9uIG9mIHBybmcsIHNlZWQsIGlzX21hdGguXG4gIHJldHVybiAob3B0aW9ucy5wYXNzIHx8IGNhbGxiYWNrIHx8XG4gICAgICBmdW5jdGlvbihwcm5nLCBzZWVkLCBpc19tYXRoX2NhbGwsIHN0YXRlKSB7XG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIC8vIExvYWQgdGhlIGFyYzQgc3RhdGUgZnJvbSB0aGUgZ2l2ZW4gc3RhdGUgaWYgaXQgaGFzIGFuIFMgYXJyYXkuXG4gICAgICAgICAgaWYgKHN0YXRlLlMpIHsgY29weShzdGF0ZSwgYXJjNCk7IH1cbiAgICAgICAgICAvLyBPbmx5IHByb3ZpZGUgdGhlIC5zdGF0ZSBtZXRob2QgaWYgcmVxdWVzdGVkIHZpYSBvcHRpb25zLnN0YXRlLlxuICAgICAgICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoYXJjNCwge30pOyB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBjYWxsZWQgYXMgYSBtZXRob2Qgb2YgTWF0aCAoTWF0aC5zZWVkcmFuZG9tKCkpLCBtdXRhdGVcbiAgICAgICAgLy8gTWF0aC5yYW5kb20gYmVjYXVzZSB0aGF0IGlzIGhvdyBzZWVkcmFuZG9tLmpzIGhhcyB3b3JrZWQgc2luY2UgdjEuMC5cbiAgICAgICAgaWYgKGlzX21hdGhfY2FsbCkgeyBtYXRoW3JuZ25hbWVdID0gcHJuZzsgcmV0dXJuIHNlZWQ7IH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0IGlzIGEgbmV3ZXIgY2FsbGluZyBjb252ZW50aW9uLCBzbyByZXR1cm4gdGhlXG4gICAgICAgIC8vIHBybmcgZGlyZWN0bHkuXG4gICAgICAgIGVsc2UgcmV0dXJuIHBybmc7XG4gICAgICB9KShcbiAgcHJuZyxcbiAgc2hvcnRzZWVkLFxuICAnZ2xvYmFsJyBpbiBvcHRpb25zID8gb3B0aW9ucy5nbG9iYWwgOiAodGhpcyA9PSBtYXRoKSxcbiAgb3B0aW9ucy5zdGF0ZSk7XG59XG5tYXRoWydzZWVkJyArIHJuZ25hbWVdID0gc2VlZHJhbmRvbTtcblxuLy9cbi8vIEFSQzRcbi8vXG4vLyBBbiBBUkM0IGltcGxlbWVudGF0aW9uLiAgVGhlIGNvbnN0cnVjdG9yIHRha2VzIGEga2V5IGluIHRoZSBmb3JtIG9mXG4vLyBhbiBhcnJheSBvZiBhdCBtb3N0ICh3aWR0aCkgaW50ZWdlcnMgdGhhdCBzaG91bGQgYmUgMCA8PSB4IDwgKHdpZHRoKS5cbi8vXG4vLyBUaGUgZyhjb3VudCkgbWV0aG9kIHJldHVybnMgYSBwc2V1ZG9yYW5kb20gaW50ZWdlciB0aGF0IGNvbmNhdGVuYXRlc1xuLy8gdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGZyb20gQVJDNC4gIEl0cyByZXR1cm4gdmFsdWUgaXMgYSBudW1iZXIgeFxuLy8gdGhhdCBpcyBpbiB0aGUgcmFuZ2UgMCA8PSB4IDwgKHdpZHRoIF4gY291bnQpLlxuLy9cbmZ1bmN0aW9uIEFSQzQoa2V5KSB7XG4gIHZhciB0LCBrZXlsZW4gPSBrZXkubGVuZ3RoLFxuICAgICAgbWUgPSB0aGlzLCBpID0gMCwgaiA9IG1lLmkgPSBtZS5qID0gMCwgcyA9IG1lLlMgPSBbXTtcblxuICAvLyBUaGUgZW1wdHkga2V5IFtdIGlzIHRyZWF0ZWQgYXMgWzBdLlxuICBpZiAoIWtleWxlbikgeyBrZXkgPSBba2V5bGVuKytdOyB9XG5cbiAgLy8gU2V0IHVwIFMgdXNpbmcgdGhlIHN0YW5kYXJkIGtleSBzY2hlZHVsaW5nIGFsZ29yaXRobS5cbiAgd2hpbGUgKGkgPCB3aWR0aCkge1xuICAgIHNbaV0gPSBpKys7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICBzW2ldID0gc1tqID0gbWFzayAmIChqICsga2V5W2kgJSBrZXlsZW5dICsgKHQgPSBzW2ldKSldO1xuICAgIHNbal0gPSB0O1xuICB9XG5cbiAgLy8gVGhlIFwiZ1wiIG1ldGhvZCByZXR1cm5zIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBhcyBvbmUgbnVtYmVyLlxuICAobWUuZyA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgLy8gVXNpbmcgaW5zdGFuY2UgbWVtYmVycyBpbnN0ZWFkIG9mIGNsb3N1cmUgc3RhdGUgbmVhcmx5IGRvdWJsZXMgc3BlZWQuXG4gICAgdmFyIHQsIHIgPSAwLFxuICAgICAgICBpID0gbWUuaSwgaiA9IG1lLmosIHMgPSBtZS5TO1xuICAgIHdoaWxlIChjb3VudC0tKSB7XG4gICAgICB0ID0gc1tpID0gbWFzayAmIChpICsgMSldO1xuICAgICAgciA9IHIgKiB3aWR0aCArIHNbbWFzayAmICgoc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIHQpXSkgKyAoc1tqXSA9IHQpKV07XG4gICAgfVxuICAgIG1lLmkgPSBpOyBtZS5qID0gajtcbiAgICByZXR1cm4gcjtcbiAgICAvLyBGb3Igcm9idXN0IHVucHJlZGljdGFiaWxpdHksIHRoZSBmdW5jdGlvbiBjYWxsIGJlbG93IGF1dG9tYXRpY2FsbHlcbiAgICAvLyBkaXNjYXJkcyBhbiBpbml0aWFsIGJhdGNoIG9mIHZhbHVlcy4gIFRoaXMgaXMgY2FsbGVkIFJDNC1kcm9wWzI1Nl0uXG4gICAgLy8gU2VlIGh0dHA6Ly9nb29nbGUuY29tL3NlYXJjaD9xPXJzYStmbHVocmVyK3Jlc3BvbnNlJmJ0bklcbiAgfSkod2lkdGgpO1xufVxuXG4vL1xuLy8gY29weSgpXG4vLyBDb3BpZXMgaW50ZXJuYWwgc3RhdGUgb2YgQVJDNCB0byBvciBmcm9tIGEgcGxhaW4gb2JqZWN0LlxuLy9cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQuaiA9IGYuajtcbiAgdC5TID0gZi5TLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuLy9cbi8vIGZsYXR0ZW4oKVxuLy8gQ29udmVydHMgYW4gb2JqZWN0IHRyZWUgdG8gbmVzdGVkIGFycmF5cyBvZiBzdHJpbmdzLlxuLy9cbmZ1bmN0aW9uIGZsYXR0ZW4ob2JqLCBkZXB0aCkge1xuICB2YXIgcmVzdWx0ID0gW10sIHR5cCA9ICh0eXBlb2Ygb2JqKSwgcHJvcDtcbiAgaWYgKGRlcHRoICYmIHR5cCA9PSAnb2JqZWN0Jykge1xuICAgIGZvciAocHJvcCBpbiBvYmopIHtcbiAgICAgIHRyeSB7IHJlc3VsdC5wdXNoKGZsYXR0ZW4ob2JqW3Byb3BdLCBkZXB0aCAtIDEpKTsgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gIH1cbiAgcmV0dXJuIChyZXN1bHQubGVuZ3RoID8gcmVzdWx0IDogdHlwID09ICdzdHJpbmcnID8gb2JqIDogb2JqICsgJ1xcMCcpO1xufVxuXG4vL1xuLy8gbWl4a2V5KClcbi8vIE1peGVzIGEgc3RyaW5nIHNlZWQgaW50byBhIGtleSB0aGF0IGlzIGFuIGFycmF5IG9mIGludGVnZXJzLCBhbmRcbi8vIHJldHVybnMgYSBzaG9ydGVuZWQgc3RyaW5nIHNlZWQgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSByZXN1bHQga2V5LlxuLy9cbmZ1bmN0aW9uIG1peGtleShzZWVkLCBrZXkpIHtcbiAgdmFyIHN0cmluZ3NlZWQgPSBzZWVkICsgJycsIHNtZWFyLCBqID0gMDtcbiAgd2hpbGUgKGogPCBzdHJpbmdzZWVkLmxlbmd0aCkge1xuICAgIGtleVttYXNrICYgal0gPVxuICAgICAgbWFzayAmICgoc21lYXIgXj0ga2V5W21hc2sgJiBqXSAqIDE5KSArIHN0cmluZ3NlZWQuY2hhckNvZGVBdChqKyspKTtcbiAgfVxuICByZXR1cm4gdG9zdHJpbmcoa2V5KTtcbn1cblxuLy9cbi8vIGF1dG9zZWVkKClcbi8vIFJldHVybnMgYW4gb2JqZWN0IGZvciBhdXRvc2VlZGluZywgdXNpbmcgd2luZG93LmNyeXB0byBhbmQgTm9kZSBjcnlwdG9cbi8vIG1vZHVsZSBpZiBhdmFpbGFibGUuXG4vL1xuZnVuY3Rpb24gYXV0b3NlZWQoKSB7XG4gIHRyeSB7XG4gICAgdmFyIG91dDtcbiAgICBpZiAobm9kZWNyeXB0byAmJiAob3V0ID0gbm9kZWNyeXB0by5yYW5kb21CeXRlcykpIHtcbiAgICAgIC8vIFRoZSB1c2Ugb2YgJ291dCcgdG8gcmVtZW1iZXIgcmFuZG9tQnl0ZXMgbWFrZXMgdGlnaHQgbWluaWZpZWQgY29kZS5cbiAgICAgIG91dCA9IG91dCh3aWR0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IG5ldyBVaW50OEFycmF5KHdpZHRoKTtcbiAgICAgIChnbG9iYWwuY3J5cHRvIHx8IGdsb2JhbC5tc0NyeXB0bykuZ2V0UmFuZG9tVmFsdWVzKG91dCk7XG4gICAgfVxuICAgIHJldHVybiB0b3N0cmluZyhvdXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIGJyb3dzZXIgPSBnbG9iYWwubmF2aWdhdG9yLFxuICAgICAgICBwbHVnaW5zID0gYnJvd3NlciAmJiBicm93c2VyLnBsdWdpbnM7XG4gICAgcmV0dXJuIFsrbmV3IERhdGUsIGdsb2JhbCwgcGx1Z2lucywgZ2xvYmFsLnNjcmVlbiwgdG9zdHJpbmcocG9vbCldO1xuICB9XG59XG5cbi8vXG4vLyB0b3N0cmluZygpXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBvZiBjaGFyY29kZXMgdG8gYSBzdHJpbmdcbi8vXG5mdW5jdGlvbiB0b3N0cmluZyhhKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsIGEpO1xufVxuXG4vL1xuLy8gV2hlbiBzZWVkcmFuZG9tLmpzIGlzIGxvYWRlZCwgd2UgaW1tZWRpYXRlbHkgbWl4IGEgZmV3IGJpdHNcbi8vIGZyb20gdGhlIGJ1aWx0LWluIFJORyBpbnRvIHRoZSBlbnRyb3B5IHBvb2wuICBCZWNhdXNlIHdlIGRvXG4vLyBub3Qgd2FudCB0byBpbnRlcmZlcmUgd2l0aCBkZXRlcm1pbmlzdGljIFBSTkcgc3RhdGUgbGF0ZXIsXG4vLyBzZWVkcmFuZG9tIHdpbGwgbm90IGNhbGwgbWF0aC5yYW5kb20gb24gaXRzIG93biBhZ2FpbiBhZnRlclxuLy8gaW5pdGlhbGl6YXRpb24uXG4vL1xubWl4a2V5KG1hdGgucmFuZG9tKCksIHBvb2wpO1xuXG4vL1xuLy8gTm9kZWpzIGFuZCBBTUQgc3VwcG9ydDogZXhwb3J0IHRoZSBpbXBsZW1lbnRhdGlvbiBhcyBhIG1vZHVsZSB1c2luZ1xuLy8gZWl0aGVyIGNvbnZlbnRpb24uXG4vL1xuaWYgKCh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHNlZWRyYW5kb207XG4gIC8vIFdoZW4gaW4gbm9kZS5qcywgdHJ5IHVzaW5nIGNyeXB0byBwYWNrYWdlIGZvciBhdXRvc2VlZGluZy5cbiAgdHJ5IHtcbiAgICBub2RlY3J5cHRvID0gcmVxdWlyZSgnY3J5cHRvJyk7XG4gIH0gY2F0Y2ggKGV4KSB7fVxufSBlbHNlIGlmICgodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIHNlZWRyYW5kb207IH0pO1xufVxuXG4vLyBFbmQgYW5vbnltb3VzIHNjb3BlLCBhbmQgcGFzcyBpbml0aWFsIHZhbHVlcy5cbn0pKFxuICBbXSwgICAgIC8vIHBvb2w6IGVudHJvcHkgcG9vbCBzdGFydHMgZW1wdHlcbiAgTWF0aCAgICAvLyBtYXRoOiBwYWNrYWdlIGNvbnRhaW5pbmcgcmFuZG9tLCBwb3csIGFuZCBzZWVkcmFuZG9tXG4pO1xuIiwiLy8gQSBsaWJyYXJ5IG9mIHNlZWRhYmxlIFJOR3MgaW1wbGVtZW50ZWQgaW4gSmF2YXNjcmlwdC5cbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgc2VlZHJhbmRvbSA9IHJlcXVpcmUoJ3NlZWRyYW5kb20nKTtcbi8vIHZhciByYW5kb20gPSBzZWVkcmFuZG9tKDEpOyAvLyBvciBhbnkgc2VlZC5cbi8vIHZhciB4ID0gcmFuZG9tKCk7ICAgICAgIC8vIDAgPD0geCA8IDEuICBFdmVyeSBiaXQgaXMgcmFuZG9tLlxuLy8gdmFyIHggPSByYW5kb20ucXVpY2soKTsgLy8gMCA8PSB4IDwgMS4gIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cblxuLy8gYWxlYSwgYSA1My1iaXQgbXVsdGlwbHktd2l0aC1jYXJyeSBnZW5lcmF0b3IgYnkgSm9oYW5uZXMgQmFhZ8O4ZS5cbi8vIFBlcmlvZDogfjJeMTE2XG4vLyBSZXBvcnRlZCB0byBwYXNzIGFsbCBCaWdDcnVzaCB0ZXN0cy5cbnZhciBhbGVhID0gcmVxdWlyZSgnLi9saWIvYWxlYScpO1xuXG4vLyB4b3IxMjgsIGEgcHVyZSB4b3Itc2hpZnQgZ2VuZXJhdG9yIGJ5IEdlb3JnZSBNYXJzYWdsaWEuXG4vLyBQZXJpb2Q6IDJeMTI4LTEuXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBNYXRyaXhSYW5rIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcjEyOCA9IHJlcXVpcmUoJy4vbGliL3hvcjEyOCcpO1xuXG4vLyB4b3J3b3csIEdlb3JnZSBNYXJzYWdsaWEncyAxNjAtYml0IHhvci1zaGlmdCBjb21iaW5lZCBwbHVzIHdleWwuXG4vLyBQZXJpb2Q6IDJeMTkyLTJeMzJcbi8vIFJlcG9ydGVkIHRvIGZhaWw6IENvbGxpc2lvbk92ZXIsIFNpbXBQb2tlciwgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yd293ID0gcmVxdWlyZSgnLi9saWIveG9yd293Jyk7XG5cbi8vIHhvcnNoaWZ0NywgYnkgRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXIsIHRha2VzXG4vLyBhIGRpZmZlcmVudCBhcHByb2FjaDogaXQgYWRkcyByb2J1c3RuZXNzIGJ5IGFsbG93aW5nIG1vcmUgc2hpZnRzXG4vLyB0aGFuIE1hcnNhZ2xpYSdzIG9yaWdpbmFsIHRocmVlLiAgSXQgaXMgYSA3LXNoaWZ0IGdlbmVyYXRvclxuLy8gd2l0aCAyNTYgYml0cywgdGhhdCBwYXNzZXMgQmlnQ3J1c2ggd2l0aCBubyBzeXN0bWF0aWMgZmFpbHVyZXMuXG4vLyBQZXJpb2QgMl4yNTYtMS5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yc2hpZnQ3ID0gcmVxdWlyZSgnLi9saWIveG9yc2hpZnQ3Jyk7XG5cbi8vIHhvcjQwOTYsIGJ5IFJpY2hhcmQgQnJlbnQsIGlzIGEgNDA5Ni1iaXQgeG9yLXNoaWZ0IHdpdGggYVxuLy8gdmVyeSBsb25nIHBlcmlvZCB0aGF0IGFsc28gYWRkcyBhIFdleWwgZ2VuZXJhdG9yLiBJdCBhbHNvIHBhc3Nlc1xuLy8gQmlnQ3J1c2ggd2l0aCBubyBzeXN0ZW1hdGljIGZhaWx1cmVzLiAgSXRzIGxvbmcgcGVyaW9kIG1heVxuLy8gYmUgdXNlZnVsIGlmIHlvdSBoYXZlIG1hbnkgZ2VuZXJhdG9ycyBhbmQgbmVlZCB0byBhdm9pZFxuLy8gY29sbGlzaW9ucy5cbi8vIFBlcmlvZDogMl40MTI4LTJeMzIuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcjQwOTYgPSByZXF1aXJlKCcuL2xpYi94b3I0MDk2Jyk7XG5cbi8vIFR5Y2hlLWksIGJ5IFNhbXVlbCBOZXZlcyBhbmQgRmlsaXBlIEFyYXVqbywgaXMgYSBiaXQtc2hpZnRpbmcgcmFuZG9tXG4vLyBudW1iZXIgZ2VuZXJhdG9yIGRlcml2ZWQgZnJvbSBDaGFDaGEsIGEgbW9kZXJuIHN0cmVhbSBjaXBoZXIuXG4vLyBodHRwczovL2VkZW4uZGVpLnVjLnB0L35zbmV2ZXMvcHVicy8yMDExLXNuZmEyLnBkZlxuLy8gUGVyaW9kOiB+Ml4xMjdcbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgdHljaGVpID0gcmVxdWlyZSgnLi9saWIvdHljaGVpJyk7XG5cbi8vIFRoZSBvcmlnaW5hbCBBUkM0LWJhc2VkIHBybmcgaW5jbHVkZWQgaW4gdGhpcyBsaWJyYXJ5LlxuLy8gUGVyaW9kOiB+Ml4xNjAwXG52YXIgc3IgPSByZXF1aXJlKCcuL3NlZWRyYW5kb20nKTtcblxuc3IuYWxlYSA9IGFsZWE7XG5zci54b3IxMjggPSB4b3IxMjg7XG5zci54b3J3b3cgPSB4b3J3b3c7XG5zci54b3JzaGlmdDcgPSB4b3JzaGlmdDc7XG5zci54b3I0MDk2ID0geG9yNDA5NjtcbnNyLnR5Y2hlaSA9IHR5Y2hlaTtcblxubW9kdWxlLmV4cG9ydHMgPSBzcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gc3RyID0+IGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoL1shJygpKl0vZywgeCA9PiBgJSR7eC5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpfWApO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHRva2VuID0gJyVbYS1mMC05XXsyfSc7XG52YXIgc2luZ2xlTWF0Y2hlciA9IG5ldyBSZWdFeHAodG9rZW4sICdnaScpO1xudmFyIG11bHRpTWF0Y2hlciA9IG5ldyBSZWdFeHAoJygnICsgdG9rZW4gKyAnKSsnLCAnZ2knKTtcblxuZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50cyhjb21wb25lbnRzLCBzcGxpdCkge1xuXHR0cnkge1xuXHRcdC8vIFRyeSB0byBkZWNvZGUgdGhlIGVudGlyZSBzdHJpbmcgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGNvbXBvbmVudHMuam9pbignJykpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBEbyBub3RoaW5nXG5cdH1cblxuXHRpZiAoY29tcG9uZW50cy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4gY29tcG9uZW50cztcblx0fVxuXG5cdHNwbGl0ID0gc3BsaXQgfHwgMTtcblxuXHQvLyBTcGxpdCB0aGUgYXJyYXkgaW4gMiBwYXJ0c1xuXHR2YXIgbGVmdCA9IGNvbXBvbmVudHMuc2xpY2UoMCwgc3BsaXQpO1xuXHR2YXIgcmlnaHQgPSBjb21wb25lbnRzLnNsaWNlKHNwbGl0KTtcblxuXHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBkZWNvZGVDb21wb25lbnRzKGxlZnQpLCBkZWNvZGVDb21wb25lbnRzKHJpZ2h0KSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHR0cnkge1xuXHRcdHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHR2YXIgdG9rZW5zID0gaW5wdXQubWF0Y2goc2luZ2xlTWF0Y2hlcik7XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aW5wdXQgPSBkZWNvZGVDb21wb25lbnRzKHRva2VucywgaSkuam9pbignJyk7XG5cblx0XHRcdHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dDtcblx0fVxufVxuXG5mdW5jdGlvbiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoaW5wdXQpIHtcblx0Ly8gS2VlcCB0cmFjayBvZiBhbGwgdGhlIHJlcGxhY2VtZW50cyBhbmQgcHJlZmlsbCB0aGUgbWFwIHdpdGggdGhlIGBCT01gXG5cdHZhciByZXBsYWNlTWFwID0ge1xuXHRcdCclRkUlRkYnOiAnXFx1RkZGRFxcdUZGRkQnLFxuXHRcdCclRkYlRkUnOiAnXFx1RkZGRFxcdUZGRkQnXG5cdH07XG5cblx0dmFyIG1hdGNoID0gbXVsdGlNYXRjaGVyLmV4ZWMoaW5wdXQpO1xuXHR3aGlsZSAobWF0Y2gpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gRGVjb2RlIGFzIGJpZyBjaHVua3MgYXMgcG9zc2libGVcblx0XHRcdHJlcGxhY2VNYXBbbWF0Y2hbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzBdKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdHZhciByZXN1bHQgPSBkZWNvZGUobWF0Y2hbMF0pO1xuXG5cdFx0XHRpZiAocmVzdWx0ICE9PSBtYXRjaFswXSkge1xuXHRcdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IHJlc3VsdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0fVxuXG5cdC8vIEFkZCBgJUMyYCBhdCB0aGUgZW5kIG9mIHRoZSBtYXAgdG8gbWFrZSBzdXJlIGl0IGRvZXMgbm90IHJlcGxhY2UgdGhlIGNvbWJpbmF0b3IgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZVxuXHRyZXBsYWNlTWFwWyclQzInXSA9ICdcXHVGRkZEJztcblxuXHR2YXIgZW50cmllcyA9IE9iamVjdC5rZXlzKHJlcGxhY2VNYXApO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFJlcGxhY2UgYWxsIGRlY29kZWQgY29tcG9uZW50c1xuXHRcdHZhciBrZXkgPSBlbnRyaWVzW2ldO1xuXHRcdGlucHV0ID0gaW5wdXQucmVwbGFjZShuZXcgUmVnRXhwKGtleSwgJ2cnKSwgcmVwbGFjZU1hcFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZW5jb2RlZFVSSSkge1xuXHRpZiAodHlwZW9mIGVuY29kZWRVUkkgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYGVuY29kZWRVUklgIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AsIGdvdCBgJyArIHR5cGVvZiBlbmNvZGVkVVJJICsgJ2AnKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0ZW5jb2RlZFVSSSA9IGVuY29kZWRVUkkucmVwbGFjZSgvXFwrL2csICcgJyk7XG5cblx0XHQvLyBUcnkgdGhlIGJ1aWx0IGluIGRlY29kZXIgZmlyc3Rcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBGYWxsYmFjayB0byBhIG1vcmUgYWR2YW5jZWQgZGVjb2RlclxuXHRcdHJldHVybiBjdXN0b21EZWNvZGVVUklDb21wb25lbnQoZW5jb2RlZFVSSSk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbXG5cdFx0XHRcdFx0ZW5jb2RlKGtleSwgb3B0aW9ucyksXG5cdFx0XHRcdFx0J1snLFxuXHRcdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRcdCddJ1xuXHRcdFx0XHRdLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbJyxcblx0XHRcdFx0XHRlbmNvZGUoaW5kZXgsIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCddPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbXSddLmpvaW4oJycpIDogW1xuXHRcdFx0XHRcdGVuY29kZShrZXksIG9wdGlvbnMpLFxuXHRcdFx0XHRcdCdbXT0nLFxuXHRcdFx0XHRcdGVuY29kZSh2YWx1ZSwgb3B0aW9ucylcblx0XHRcdFx0XS5qb2luKCcnKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgPT09IG51bGwgPyBlbmNvZGUoa2V5LCBvcHRpb25zKSA6IFtcblx0XHRcdFx0XHRlbmNvZGUoa2V5LCBvcHRpb25zKSxcblx0XHRcdFx0XHQnPScsXG5cdFx0XHRcdFx0ZW5jb2RlKHZhbHVlLCBvcHRpb25zKVxuXHRcdFx0XHRdLmpvaW4oJycpO1xuXHRcdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKSB7XG5cdGxldCByZXN1bHQ7XG5cblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvXFxbKFxcZCopXFxdJC8uZXhlYyhrZXkpO1xuXG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXGQqXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHt9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XVtyZXN1bHRbMV1dID0gdmFsdWU7XG5cdFx0XHR9O1xuXHRcdGNhc2UgJ2JyYWNrZXQnOlxuXHRcdFx0cmV0dXJuIChrZXksIHZhbHVlLCBhY2N1bXVsYXRvcikgPT4ge1xuXHRcdFx0XHRyZXN1bHQgPSAvKFxcW1xcXSkkLy5leGVjKGtleSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9cXFtcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW3ZhbHVlXTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0aWYgKGFjY3VtdWxhdG9yW2tleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gW10uY29uY2F0KGFjY3VtdWxhdG9yW2tleV0sIHZhbHVlKTtcblx0XHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmVuY29kZSkge1xuXHRcdHJldHVybiBvcHRpb25zLnN0cmljdCA/IHN0cmljdFVyaUVuY29kZSh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMuZGVjb2RlKSB7XG5cdFx0cmV0dXJuIGRlY29kZUNvbXBvbmVudCh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleXNTb3J0ZXIoaW5wdXQpIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XG5cdFx0cmV0dXJuIGlucHV0LnNvcnQoKTtcblx0fVxuXG5cdGlmICh0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnKSB7XG5cdFx0cmV0dXJuIGtleXNTb3J0ZXIoT2JqZWN0LmtleXMoaW5wdXQpKVxuXHRcdFx0LnNvcnQoKGEsIGIpID0+IE51bWJlcihhKSAtIE51bWJlcihiKSlcblx0XHRcdC5tYXAoa2V5ID0+IGlucHV0W2tleV0pO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdHJldHVybiBpbnB1dC5zbGljZShxdWVyeVN0YXJ0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtkZWNvZGU6IHRydWUsIGFycmF5Rm9ybWF0OiAnbm9uZSd9LCBvcHRpb25zKTtcblxuXHRjb25zdCBmb3JtYXR0ZXIgPSBwYXJzZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblxuXHQvLyBDcmVhdGUgYW4gb2JqZWN0IHdpdGggbm8gcHJvdG90eXBlXG5cdGNvbnN0IHJldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cblx0aWYgKHR5cGVvZiBpbnB1dCAhPT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0aW5wdXQgPSBpbnB1dC50cmltKCkucmVwbGFjZSgvXls/IyZdLywgJycpO1xuXG5cdGlmICghaW5wdXQpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zm9yIChjb25zdCBwYXJhbSBvZiBpbnB1dC5zcGxpdCgnJicpKSB7XG5cdFx0bGV0IFtrZXksIHZhbHVlXSA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG5cblx0XHQvLyBNaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuXHRcdC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcblx0XHR2YWx1ZSA9IHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlKHZhbHVlLCBvcHRpb25zKTtcblxuXHRcdGZvcm1hdHRlcihkZWNvZGUoa2V5LCBvcHRpb25zKSwgdmFsdWUsIHJldCk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMocmV0KS5zb3J0KCkucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gcmV0W2tleV07XG5cdFx0aWYgKEJvb2xlYW4odmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHQvLyBTb3J0IG9iamVjdCBrZXlzLCBub3QgdmFsdWVzXG5cdFx0XHRyZXN1bHRba2V5XSA9IGtleXNTb3J0ZXIodmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRba2V5XSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sIE9iamVjdC5jcmVhdGUobnVsbCkpO1xufVxuXG5leHBvcnRzLmV4dHJhY3QgPSBleHRyYWN0O1xuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuXG5leHBvcnRzLnN0cmluZ2lmeSA9IChvYmosIG9wdGlvbnMpID0+IHtcblx0aWYgKCFvYmopIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0ZW5jb2RlOiB0cnVlLFxuXHRcdHN0cmljdDogdHJ1ZSxcblx0XHRhcnJheUZvcm1hdDogJ25vbmUnXG5cdH0sIG9wdGlvbnMpO1xuXG5cdGNvbnN0IGZvcm1hdHRlciA9IGVuY29kZXJGb3JBcnJheUZvcm1hdChvcHRpb25zKTtcblx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG5cblx0aWYgKG9wdGlvbnMuc29ydCAhPT0gZmFsc2UpIHtcblx0XHRrZXlzLnNvcnQob3B0aW9ucy5zb3J0KTtcblx0fVxuXG5cdHJldHVybiBrZXlzLm1hcChrZXkgPT4ge1xuXHRcdGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG5cblx0XHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0XHRcdGZvciAoY29uc3QgdmFsdWUyIG9mIHZhbHVlLnNsaWNlKCkpIHtcblx0XHRcdFx0aWYgKHZhbHVlMiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXN1bHQucHVzaChmb3JtYXR0ZXIoa2V5LCB2YWx1ZTIsIHJlc3VsdC5sZW5ndGgpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdC5qb2luKCcmJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVuY29kZShrZXksIG9wdGlvbnMpICsgJz0nICsgZW5jb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0fSkuZmlsdGVyKHggPT4geC5sZW5ndGggPiAwKS5qb2luKCcmJyk7XG59O1xuXG5leHBvcnRzLnBhcnNlVXJsID0gKGlucHV0LCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IGhhc2hTdGFydCA9IGlucHV0LmluZGV4T2YoJyMnKTtcblx0aWYgKGhhc2hTdGFydCAhPT0gLTEpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGhhc2hTdGFydCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHVybDogaW5wdXQuc3BsaXQoJz8nKVswXSB8fCAnJyxcblx0XHRxdWVyeTogcGFyc2UoZXh0cmFjdChpbnB1dCksIG9wdGlvbnMpXG5cdH07XG59O1xuIiwiLy8gTWFwcyBtb3VzZSBjb29yZGluYXRlIGZyb20gZWxlbWVudCBDU1MgcGl4ZWxzIHRvIG5vcm1hbGl6ZWQgWyAwLCAxIF0gcmFuZ2UuXG5mdW5jdGlvbiBjb21wdXRlTm9ybWFsaXplZFBvcyhlbGVtZW50LCBldnQpIHtcbiAgdmFyIHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICB2YXIgeSA9IGV2dC5jbGllbnRZIC0gcmVjdC50b3A7XG4gIHggLz0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgeSAvPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgcmV0dXJuIFt4LCB5XTtcbn1cblxuZXhwb3J0IGNsYXNzIElucHV0UmVjb3JkZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNsZWFyKCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fMKge307XG4gIH1cblxuICBlbmFibGUoZm9yY2VSZXNldCkge1xuICAgIHRoaXMuaW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBpZiAoZm9yY2VSZXNldCkge1xuICAgICAgdGhpcy5jbGVhcigpO1xuICAgIH1cbiAgICB0aGlzLmluamVjdExpc3RlbmVycygpO1xuICB9XG4vKlxuICBkaXNhYmxlKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXJzKCk7XG4gIH1cbiovXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5mcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuXG4gIGFkZEV2ZW50KHR5cGUsIGV2ZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGV2ZW50RGF0YSA9IHtcbiAgICAgIHR5cGUsXG4gICAgICBldmVudCxcbiAgICAgIHBhcmFtZXRlcnNcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy51c2VUaW1lKSB7XG4gICAgICBldmVudERhdGEudGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5pbml0VGltZTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnREYXRhLmZyYW1lTnVtYmVyID0gdGhpcy5mcmFtZU51bWJlcjtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50cy5wdXNoKGV2ZW50RGF0YSk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5uZXdFdmVudENhbGxiYWNrKSB7XG4gICAgICB0aGlzLm9wdGlvbnMubmV3RXZlbnRDYWxsYmFjayhldmVudERhdGEpO1xuICAgIH1cbiAgfVxuICBcbiAgaW5qZWN0TGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ2Rvd24nLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAndXAnLCB7eDogcG9zWzBdLCB5OiBwb3NbMV0sIGJ1dHRvbjogZXZ0LmJ1dHRvbn0pO1xuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICdtb3ZlJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcblxuICAgIH0pO1xuICBcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBldnQgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnd2hlZWwnLCB7XG4gICAgICAgIGRlbHRhWDogZXZ0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBldnQuZGVsdGFZLFxuICAgICAgICBkZWx0YVo6IGV2dC5kZWx0YVosXG4gICAgICAgIGRlbHRhTW9kZTogZXZ0LmRlbHRhTW9kZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICdkb3duJywge1xuICAgICAgICBrZXlDb2RlOiBldnQua2V5Q29kZSxcbiAgICAgICAgY2hhckNvZGU6IGV2dC5jaGFyQ29kZSxcbiAgICAgICAga2V5OiBldnQua2V5XG4gICAgICB9KTtcbiAgICB9KTtcbiAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ2tleScsICd1cCcsIHtcbiAgICAgICAga2V5Q29kZTogZXZ0LmtleUNvZGUsXG4gICAgICAgIGNoYXJDb2RlOiBldnQuY2hhckNvZGUsXG4gICAgICAgIGtleTogZXZ0LmtleVxuICAgICAgfSk7XG4gICAgfSk7ICBcbiAgfVxufSIsIlxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTTogdHJ1ZSxcbiAgbmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHM6IGZhbHNlXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBJbnB1dFJlcGxheWVyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgcmVjb3JkaW5nLCByZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5yZWNvcmRpbmcgPSByZWNvcmRpbmc7XG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzOyAvLyBJZiA9PT0gbnVsbCAtPiBEaXNwYXRjaCB0byBET01cbiAgfVxuXG4gIHRpY2sgKGZyYW1lTnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudEluZGV4ID49IHRoaXMucmVjb3JkaW5nLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPiBmcmFtZU51bWJlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdoaWxlICh0aGlzLmN1cnJlbnRJbmRleCA8IHRoaXMucmVjb3JkaW5nLmxlbmd0aCAmJiB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF0uZnJhbWVOdW1iZXIgPT09IGZyYW1lTnVtYmVyKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVjb3JkaW5nW3RoaXMuY3VycmVudEluZGV4XTtcbiAgICAgIHN3aXRjaCAoaW5wdXQudHlwZSkge1xuICAgICAgICBjYXNlICdtb3VzZSc6IHtcbiAgICAgICAgICBpZiAoaW5wdXQuZXZlbnQgPT09ICd3aGVlbCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVXaGVlbEV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGVNb3VzZUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gYnJlYWs7XG4gICAgICAgIGNhc2UgJ2tleSc6IHtcbiAgICAgICAgICB0aGlzLnNpbXVsYXRlS2V5RXZlbnQodGhpcy5lbGVtZW50LCBpbnB1dC50eXBlICsgaW5wdXQuZXZlbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ1N0aWxsIG5vdCBpbXBsZW1lbnRlZCBldmVudCcsIGlucHV0LnR5cGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRJbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHNpbXVsYXRlV2hlZWxFdmVudChlbGVtZW50LCBwYXJhbWV0ZXJzKSB7XG4gICAgdmFyIGUgPSBuZXcgRXZlbnQoJ3doZWVsJyk7XG4gICAgY29uc3QgZXZlbnRUeXBlID0gJ3doZWVsJztcbiAgICBlLmRlbHRhWCA9IHBhcmFtZXRlcnMuZGVsdGFYO1xuICAgIGUuZGVsdGFZID0gcGFyYW1ldGVycy5kZWx0YVk7XG4gICAgZS5kZWx0YVogPSBwYXJhbWV0ZXJzLmRlbHRhWjtcbiAgICBlLmRlbHRhTW9kZSA9IHBhcmFtZXRlcnMuZGVsdGFNb2RlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSkge1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH0gIFxuXG4gIHNpbXVsYXRlS2V5RXZlbnQoZWxlbWVudCwgZXZlbnRUeXBlLCBwYXJhbWV0ZXJzKSB7XG4gICAgLy8gRG9uJ3QgdXNlIHRoZSBLZXlib2FyZEV2ZW50IG9iamVjdCBiZWNhdXNlIG9mIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvODk0MjY3OC9rZXlib2FyZGV2ZW50LWluLWNocm9tZS1rZXljb2RlLWlzLTAvMTI1MjI3NTIjMTI1MjI3NTJcbiAgICAvLyBTZWUgYWxzbyBodHRwOi8vb3V0cHV0LmpzYmluLmNvbS9hd2VuYXEvM1xuICAgIC8vICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0tleWJvYXJkRXZlbnQnKTtcbiAgICAvLyAgICBpZiAoZS5pbml0S2V5RXZlbnQpIHtcbiAgICAvLyAgICAgIGUuaW5pdEtleUV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwga2V5Q29kZSwgY2hhckNvZGUpO1xuICAgIC8vICB9IGVsc2Uge1xuICBcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgICAgaWYgKGUuaW5pdEV2ZW50KSB7XG4gICAgICAgIGUuaW5pdEV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gIFxuICAgIGUua2V5Q29kZSA9IHBhcmFtZXRlcnMua2V5Q29kZTtcbiAgICBlLndoaWNoID0gcGFyYW1ldGVycy5rZXlDb2RlO1xuICAgIGUuY2hhckNvZGUgPSBwYXJhbWV0ZXJzLmNoYXJDb2RlO1xuICAgIGUucHJvZ3JhbW1hdGljID0gdHJ1ZTtcbiAgICBlLmtleSA9IHBhcmFtZXRlcnMua2V5O1xuICBcbiAgICAvLyBEaXNwYXRjaCBkaXJlY3RseSB0byBFbXNjcmlwdGVuJ3MgaHRtbDUuaCBBUEk6XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpICYmIHRoaXMub3B0aW9ucy5kaXNwYXRjaEtleUV2ZW50c1ZpYURPTSkge1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIGxpc3RlbmVyLmNhbGwodGhpc18sIGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEaXNwYXRjaCB0byBicm93c2VyIGZvciByZWFsXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQgPyBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZSkgOiBlbGVtZW50LmZpcmVFdmVudChcIm9uXCIgKyBldmVudFR5cGUsIGUpO1xuICAgIH1cbiAgfVxuICBcbiAgLy8gZXZlbnRUeXBlOiBcIm1vdXNlbW92ZVwiLCBcIm1vdXNlZG93blwiIG9yIFwibW91c2V1cFwiLlxuICAvLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG4gIHNpbXVsYXRlTW91c2VFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBSZW1hcCBmcm9tIFswLDFdIHRvIGNhbnZhcyBDU1MgcGl4ZWwgc2l6ZS5cbiAgICB2YXIgeCA9IHBhcmFtZXRlcnMueDtcbiAgICB2YXIgeSA9IHBhcmFtZXRlcnMueTtcblxuICAgIHggKj0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB5ICo9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBcbiAgICAvLyBPZmZzZXQgdGhlIGluamVjdGVkIGNvb3JkaW5hdGUgZnJvbSB0b3AtbGVmdCBvZiB0aGUgY2xpZW50IGFyZWEgdG8gdGhlIHRvcC1sZWZ0IG9mIHRoZSBjYW52YXMuXG4gICAgeCA9IE1hdGgucm91bmQocmVjdC5sZWZ0ICsgeCk7XG4gICAgeSA9IE1hdGgucm91bmQocmVjdC50b3AgKyB5KTtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7XG4gICAgZS5pbml0TW91c2VFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlID09ICdtb3VzZW1vdmUnID8gMCA6IDEsIHgsIHksIHgsIHksXG4gICAgICAgICAgICAgICAgICAgIDAsIDAsIDAsIDAsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuYnV0dG9uLCBudWxsKTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pIHtcbiAgICAgIC8vIFByb2dyYW1tYXRpY2FsbHkgcmVhdGluZyBET00gZXZlbnRzIGRvZXNuJ3QgYWxsb3cgc3BlY2lmeWluZyBvZmZzZXRYICYgb2Zmc2V0WSBwcm9wZXJseVxuICAgICAgLy8gZm9yIHRoZSBlbGVtZW50LCBidXQgdGhleSBtdXN0IGJlIHRoZSBzYW1lIGFzIGNsaWVudFggJiBjbGllbnRZLiBUaGVyZWZvcmUgd2UgY2FuJ3QgaGF2ZSBhXG4gICAgICAvLyBib3JkZXIgdGhhdCB3b3VsZCBtYWtlIHRoZXNlIGRpZmZlcmVudC5cbiAgICAgIGlmIChlbGVtZW50LmNsaWVudFdpZHRoICE9IGVsZW1lbnQub2Zmc2V0V2lkdGhcbiAgICAgICAgfHwgZWxlbWVudC5jbGllbnRIZWlnaHQgIT0gZWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcbiAgICAgICAgdGhyb3cgXCJFUlJPUiEgQ2FudmFzIG9iamVjdCBtdXN0IGhhdmUgMHB4IGJvcmRlciBmb3IgZGlyZWN0IG1vdXNlIGRpc3BhdGNoIHRvIHdvcmshXCI7XG4gICAgICB9XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkge1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMubmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHMpIHtcbiAgICAgICAgICAgIC8vIElmIG5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzIGlzIHNldCwgdGhlIHBhZ2UgbmVlZHMgYSBmdWxsIHNldCBvZiBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAvLyBzcGVjaWZpZWQgaW4gdGhlIE1vdXNlRXZlbnQgb2JqZWN0LiBIb3dldmVyIG1vc3QgZmllbGRzIG9uIE1vdXNlRXZlbnQgYXJlIHJlYWQtb25seSwgc28gY3JlYXRlXG4gICAgICAgICAgICAvLyBhIG5ldyBjdXN0b20gb2JqZWN0ICh3aXRob3V0IHByb3RvdHlwZSBjaGFpbikgdG8gaG9sZCB0aGUgb3ZlcnJpZGRlbiBwcm9wZXJ0aWVzLlxuICAgICAgICAgICAgdmFyIGV2dCA9IHtcbiAgICAgICAgICAgICAgY3VycmVudFRhcmdldDogdGhpc18sXG4gICAgICAgICAgICAgIHNyY0VsZW1lbnQ6IHRoaXNfLFxuICAgICAgICAgICAgICB0YXJnZXQ6IHRoaXNfLFxuICAgICAgICAgICAgICBmcm9tRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICAgIHRvRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICAgIGV2ZW50UGhhc2U6IDIsIC8vIEV2ZW50LkFUX1RBUkdFVFxuICAgICAgICAgICAgICBidXR0b25zOiAoZXZlbnRUeXBlID09ICdtb3VzZWRvd24nKSA/IDEgOiAwLFxuICAgICAgICAgICAgICBidXR0b246IGUuYnV0dG9uLFxuICAgICAgICAgICAgICBhbHRLZXk6IGUuYWx0S2V5LFxuICAgICAgICAgICAgICBidWJibGVzOiBlLmJ1YmJsZXMsXG4gICAgICAgICAgICAgIGNhbmNlbEJ1YmJsZTogZS5jYW5jZWxCdWJibGUsXG4gICAgICAgICAgICAgIGNhbmNlbGFibGU6IGUuY2FuY2VsYWJsZSxcbiAgICAgICAgICAgICAgY2xpZW50WDogZS5jbGllbnRYLFxuICAgICAgICAgICAgICBjbGllbnRZOiBlLmNsaWVudFksXG4gICAgICAgICAgICAgIGN0cmxLZXk6IGUuY3RybEtleSxcbiAgICAgICAgICAgICAgZGVmYXVsdFByZXZlbnRlZDogZS5kZWZhdWx0UHJldmVudGVkLFxuICAgICAgICAgICAgICBkZXRhaWw6IGUuZGV0YWlsLFxuICAgICAgICAgICAgICBpZGVudGlmaWVyOiBlLmlkZW50aWZpZXIsXG4gICAgICAgICAgICAgIGlzVHJ1c3RlZDogZS5pc1RydXN0ZWQsXG4gICAgICAgICAgICAgIGxheWVyWDogZS5sYXllclgsXG4gICAgICAgICAgICAgIGxheWVyWTogZS5sYXllclksXG4gICAgICAgICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgICAgICAgbW92ZW1lbnRYOiBlLm1vdmVtZW50WCxcbiAgICAgICAgICAgICAgbW92ZW1lbnRZOiBlLm1vdmVtZW50WSxcbiAgICAgICAgICAgICAgb2Zmc2V0WDogZS5vZmZzZXRYLFxuICAgICAgICAgICAgICBvZmZzZXRZOiBlLm9mZnNldFksXG4gICAgICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgICAgICBwYWdlWTogZS5wYWdlWSxcbiAgICAgICAgICAgICAgcGF0aDogZS5wYXRoLFxuICAgICAgICAgICAgICByZWxhdGVkVGFyZ2V0OiBlLnJlbGF0ZWRUYXJnZXQsXG4gICAgICAgICAgICAgIHJldHVyblZhbHVlOiBlLnJldHVyblZhbHVlLFxuICAgICAgICAgICAgICBzY3JlZW5YOiBlLnNjcmVlblgsXG4gICAgICAgICAgICAgIHNjcmVlblk6IGUuc2NyZWVuWSxcbiAgICAgICAgICAgICAgc2hpZnRLZXk6IGUuc2hpZnRLZXksXG4gICAgICAgICAgICAgIHNvdXJjZUNhcGFiaWxpdGllczogZS5zb3VyY2VDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICAgIHRpbWVTdGFtcDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgICAgICAgIHR5cGU6IGUudHlwZSxcbiAgICAgICAgICAgICAgdmlldzogZS52aWV3LFxuICAgICAgICAgICAgICB3aGljaDogZS53aGljaCxcbiAgICAgICAgICAgICAgeDogZS54LFxuICAgICAgICAgICAgICB5OiBlLnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBldnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBUaGUgcmVndWxhciAnZScgb2JqZWN0IGlzIGVub3VnaCAoaXQgZG9lc24ndCBwb3B1bGF0ZSBhbGwgb2YgdGhlIHNhbWUgZmllbGRzIHRoYW4gYSByZWFsIG1vdXNlIGV2ZW50IGRvZXMsIFxuICAgICAgICAgICAgLy8gc28gdGhpcyBtaWdodCBub3Qgd29yayBvbiBzb21lIGRlbW9zKVxuICAgICAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzXywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIGJyb3dzZXJcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50TGlzdGVuZXJNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIC8vIERvbid0IGNhbGwgYW55IGFwcGxpY2F0aW9uIHBhZ2UgdW5sb2FkIGhhbmRsZXJzIGFzIGEgcmVzcG9uc2UgdG8gd2luZG93IGJlaW5nIGNsb3NlZC5cbiAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpIHtcbiAgICAvLyBUaGlzIGlzIGEgYml0IHRyaWNreSB0byBtYW5hZ2UsIHNpbmNlIHRoZSBwYWdlIGNvdWxkIHJlZ2lzdGVyIHRoZXNlIGhhbmRsZXJzIGF0IGFueSBwb2ludCxcbiAgICAvLyBzbyBrZWVwIHdhdGNoaW5nIGZvciB0aGVtIGFuZCByZW1vdmUgdGhlbSBpZiBhbnkgYXJlIGFkZGVkLiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lc1xuICAgIC8vIGluIGEgc2VtaS1wb2xsaW5nIGZhc2hpb24gdG8gZW5zdXJlIHRoZXNlIGFyZSBub3Qgb3ZlcnJpZGRlbi5cbiAgICBpZiAod2luZG93Lm9uYmVmb3JldW5sb2FkKSB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub251bmxvYWQpIHdpbmRvdy5vbnVubG9hZCA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbmJsdXIpIHdpbmRvdy5vbmJsdXIgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25mb2N1cykgd2luZG93Lm9uZm9jdXMgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlaGlkZSkgd2luZG93Lm9ucGFnZWhpZGUgPSBudWxsO1xuICAgIGlmICh3aW5kb3cub25wYWdlc2hvdykgd2luZG93Lm9ucGFnZXNob3cgPSBudWxsO1xuICB9XG5cbiAgdW5sb2FkQWxsRXZlbnRIYW5kbGVycygpIHtcbiAgICBmb3IodmFyIGkgaW4gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgbGlzdGVuZXIuY29udGV4dC5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyLnR5cGUsIGxpc3RlbmVyLmZ1biwgbGlzdGVuZXIudXNlQ2FwdHVyZSk7XG4gICAgfVxuICAgIHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzID0gW107XG4gIFxuICAgIC8vIE1ha2Ugc3VyZSBubyBYSFJzIGFyZSBiZWluZyBoZWxkIG9uIHRvIGVpdGhlci5cbiAgICAvL3ByZWxvYWRlZFhIUnMgPSB7fTtcbiAgICAvL251bVByZWxvYWRYSFJzSW5GbGlnaHQgPSAwO1xuICAgIC8vWE1MSHR0cFJlcXVlc3QgPSByZWFsWE1MSHR0cFJlcXVlc3Q7XG4gIFxuICAgIHRoaXMuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuICB9XG5cbiAgLy9pZiAoaW5qZWN0aW5nSW5wdXRTdHJlYW0pXG4gIGVuYWJsZSgpIHtcblxuICAgIC8vIEZpbHRlciB0aGUgcGFnZSBldmVudCBoYW5kbGVycyB0byBvbmx5IHBhc3MgcHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRvIHRoZSBzaXRlIC0gYWxsIHJlYWwgdXNlciBpbnB1dCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgc2luY2Ugd2UgYXJlXG4gICAgLy8gZG9pbmcgYSBwcm9ncmFtbWF0aWMgcnVuLlxuICAgIHZhciBvdmVycmlkZGVuTWVzc2FnZVR5cGVzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW1vdmUnLFxuICAgICAgJ2NsaWNrJywgJ2RibGNsaWNrJywgJ2tleWRvd24nLCAna2V5cHJlc3MnLCAna2V5dXAnLFxuICAgICAgJ3BvaW50ZXJsb2NrY2hhbmdlJywgJ3BvaW50ZXJsb2NrZXJyb3InLCAnd2Via2l0cG9pbnRlcmxvY2tjaGFuZ2UnLCAnd2Via2l0cG9pbnRlcmxvY2tlcnJvcicsICdtb3pwb2ludGVybG9ja2NoYW5nZScsICdtb3pwb2ludGVybG9ja2Vycm9yJywgJ21zcG9pbnRlcmxvY2tjaGFuZ2UnLCAnbXNwb2ludGVybG9ja2Vycm9yJywgJ29wb2ludGVybG9ja2NoYW5nZScsICdvcG9pbnRlcmxvY2tlcnJvcicsXG4gICAgICAnZGV2aWNlbW90aW9uJywgJ2RldmljZW9yaWVudGF0aW9uJyxcbiAgICAgICdtb3VzZWVudGVyJywgJ21vdXNlbGVhdmUnLFxuICAgICAgJ21vdXNld2hlZWwnLCAnd2hlZWwnLCAnV2hlZWxFdmVudCcsICdET01Nb3VzZVNjcm9sbCcsICdjb250ZXh0bWVudScsXG4gICAgICAnYmx1cicsICdmb2N1cycsICd2aXNpYmlsaXR5Y2hhbmdlJywgJ2JlZm9yZXVubG9hZCcsICd1bmxvYWQnLCAnZXJyb3InLFxuICAgICAgJ3BhZ2VoaWRlJywgJ3BhZ2VzaG93JywgJ29yaWVudGF0aW9uY2hhbmdlJywgJ2dhbWVwYWRjb25uZWN0ZWQnLCAnZ2FtZXBhZGRpc2Nvbm5lY3RlZCcsXG4gICAgICAnZnVsbHNjcmVlbmNoYW5nZScsICdmdWxsc2NyZWVuZXJyb3InLCAnbW96ZnVsbHNjcmVlbmNoYW5nZScsICdtb3pmdWxsc2NyZWVuZXJyb3InLFxuICAgICAgJ01TRnVsbHNjcmVlbkNoYW5nZScsICdNU0Z1bGxzY3JlZW5FcnJvcicsICd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgJ3dlYmtpdGZ1bGxzY3JlZW5lcnJvcicsXG4gICAgICAndG91Y2hzdGFydCcsICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnLFxuICAgICAgJ3dlYmdsY29udGV4dGxvc3QnLCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLFxuICAgICAgJ21vdXNlb3ZlcicsICdtb3VzZW91dCcsICdwb2ludGVyb3V0JywgJ3BvaW50ZXJkb3duJywgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICd0cmFuc2l0aW9uZW5kJ107XG5cbiAgICAvLyBTb21lIGdhbWUgZGVtb3MgcHJvZ3JhbW1hdGljYWxseSBmaXJlIHRoZSByZXNpemUgZXZlbnQuIEZvciBGaXJlZm94IGFuZCBDaHJvbWUsXG4gICAgLy8gd2UgZGV0ZWN0IHRoaXMgdmlhIGV2ZW50LmlzVHJ1c3RlZCBhbmQga25vdyB0byBjb3JyZWN0bHkgcGFzcyBpdCB0aHJvdWdoLCBidXQgdG8gbWFrZSBTYWZhcmkgaGFwcHksXG4gICAgLy8gaXQncyBqdXN0IGVhc2llciB0byBsZXQgcmVzaXplIGNvbWUgdGhyb3VnaCBmb3IgdGhvc2UgZGVtb3MgdGhhdCBuZWVkIGl0LlxuICAgIC8vIGlmICghTW9kdWxlWydwYWdlTmVlZHNSZXNpemVFdmVudCddKSBvdmVycmlkZGVuTWVzc2FnZVR5cGVzLnB1c2goJ3Jlc2l6ZScpO1xuXG4gICAgLy8gSWYgY29udGV4dCBpcyBzcGVjaWZpZWQsIGFkZEV2ZW50TGlzdGVuZXIgaXMgY2FsbGVkIHVzaW5nIHRoYXQgYXMgdGhlICd0aGlzJyBvYmplY3QuIE90aGVyd2lzZSB0aGUgY3VycmVudCB0aGlzIGlzIHVzZWQuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXNwYXRjaE1vdXNlRXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgdmFyIGRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gcmVwbGFjZUV2ZW50TGlzdGVuZXIob2JqLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVhbEFkZEV2ZW50TGlzdGVuZXIgPSBvYmouYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpIHtcbiAgICAgICAgc2VsZi5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gICAgICAgIGlmIChvdmVycmlkZGVuTWVzc2FnZVR5cGVzLmluZGV4T2YodHlwZSkgIT0gLTEpIHtcbiAgICAgICAgICB2YXIgcmVnaXN0ZXJMaXN0ZW5lclRvRE9NID1cbiAgICAgICAgICAgICAgICh0eXBlLmluZGV4T2YoJ21vdXNlJykgPT09IC0xIHx8IGRpc3BhdGNoTW91c2VFdmVudHNWaWFET00pXG4gICAgICAgICAgICAmJiAodHlwZS5pbmRleE9mKCdrZXknKSA9PT0gLTEgfHwgZGlzcGF0Y2hLZXlFdmVudHNWaWFET00pO1xuICAgICAgICAgIHZhciBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKSB7IHRyeSB7IGlmIChlLnByb2dyYW1tYXRpYyB8fCAhZS5pc1RydXN0ZWQpIGxpc3RlbmVyKGUpOyB9IGNhdGNoKGUpIHt9IH07XG4gICAgICAgICAgLy8hISEgdmFyIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciA9IGxpc3RlbmVyO1xuICAgICAgICAgIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnB1c2goe1xuICAgICAgICAgICAgY29udGV4dDogY29udGV4dCB8fCB0aGlzLFxuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIGZ1bjogZmlsdGVyZWRFdmVudExpc3RlbmVyLFxuICAgICAgICAgICAgdXNlQ2FwdHVyZTogdXNlQ2FwdHVyZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlYWxBZGRFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8IHRoaXMsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZnVuOiBsaXN0ZW5lcixcbiAgICAgICAgICAgIHVzZUNhcHR1cmU6IHVzZUNhcHR1cmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcmVhbFJlbW92ZUV2ZW50TGlzdGVuZXIgPSBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxuICAgICAgb2JqLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgICAvLyBpZiAocmVnaXN0ZXJMaXN0ZW5lclRvRE9NKVxuICAgICAgICAvL3JlYWxSZW1vdmVFdmVudExpc3RlbmVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCB0eXBlLCBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGV2ZW50TGlzdGVuZXIgPSBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXTtcbiAgICAgICAgICBpZiAoZXZlbnRMaXN0ZW5lci5jb250ZXh0ID09PSB0aGlzICYmIGV2ZW50TGlzdGVuZXIudHlwZSA9PT0gdHlwZSAmJiBldmVudExpc3RlbmVyLmZ1biA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgRXZlbnRUYXJnZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihFdmVudFRhcmdldC5wcm90b3R5cGUsIG51bGwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvKlxuICAgICAgdmFyIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gW3dpbmRvdywgZG9jdW1lbnQsIGRvY3VtZW50LmJvZHksIE1vZHVsZVsnY2FudmFzJ11dO1xuICAgICAgLy8gaWYgKE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKSBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZSA9IGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlLmNvbmNhdChNb2R1bGVbJ2V4dHJhRG9tRWxlbWVudHNXaXRoRXZlbnRMaXN0ZW5lcnMnXSk7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcmVwbGFjZUV2ZW50TGlzdGVuZXIoZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0sIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlW2ldKTtcbiAgICAgIH1cbiAgICAgICovXG4gICAgfVxuICB9ICAgIFxufSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbC5LRVlWSVMgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICAgIGZvbnRTaXplOiAxNixcbiAgICBrZXlTdHJva2VEZWxheTogMjAwLFxuICAgIGxpbmdlckRlbGF5OiAxMDAwLFxuICAgIGZhZGVEdXJhdGlvbjogMTAwMCxcbiAgICBiZXplbENvbG9yOiAnIzAwMCcsXG4gICAgdGV4dENvbG9yOiAnI2ZmZicsXG4gICAgdW5tb2RpZmllZEtleTogdHJ1ZSxcbiAgICBzaG93U3ltYm9sOiB0cnVlLFxuICAgIGFwcGVuZE1vZGlmaWVyczoge1xuICAgICAgTWV0YTogdHJ1ZSxcbiAgICAgIEFsdDogdHJ1ZSxcbiAgICAgIFNoaWZ0OiBmYWxzZVxuICAgIH0sXG4gICAgcG9zaXRpb246ICdib3R0b20tbGVmdCdcbiAgfTtcbiAgY2xhc3MgS2V5c3Ryb2tlVmlzdWFsaXplciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgICB0aGlzLnN0eWxlID0gbnVsbDtcbiAgICAgIHRoaXMua2V5U3Ryb2tlVGltZW91dCA9IG51bGw7XG4gICAgICB0aGlzLm9wdGlvbnMgPSB7fTtcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICAgIHRoaXMua2V5ZG93biA9IHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5rZXl1cCA9IHRoaXMua2V5dXAuYmluZCh0aGlzKTtcbiAgICB9XG4gICAgY2xlYW5VcCgpIHtcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGUobm9kZSkge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVtb3ZlTm9kZSh0aGlzLmNvbnRhaW5lcik7XG4gICAgICByZW1vdmVOb2RlKHRoaXMuc3R5bGUpO1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuc3R5bGUgPSBudWxsO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLmtleWRvd24pO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5rZXl1cCk7XG4gICAgfVxuICAgIGluamVjdENvbXBvbmVudHMoKSB7XG4gICAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcbiAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTmFtZSA9ICdrZXlzdHJva2VzJztcbiAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IHtcbiAgICAgICAgJ2JvdHRvbS1sZWZ0JzogJ2JvdHRvbTogMDsgbGVmdDogMDsnLFxuICAgICAgICAnYm90dG9tLXJpZ2h0JzogJ2JvdHRvbTogMDsgcmlnaHQ6IDA7JyxcbiAgICAgICAgJ3RvcC1sZWZ0JzogJ3RvcDogMDsgbGVmdDogMDsnLFxuICAgICAgICAndG9wLXJpZ2h0JzogJ3RvcDogMDsgcmlnaHQ6IDA7J1xuICAgICAgfTtcbiAgICAgIGlmICghcG9zaXRpb25zW3RoaXMub3B0aW9ucy5wb3NpdGlvbl0pIHtcbiAgICAgICAgY29uc29sZS53YXJuKGBJbnZhbGlkIHBvc2l0aW9uICcke3RoaXMub3B0aW9ucy5wb3NpdGlvbn0nLCB1c2luZyBkZWZhdWx0ICdib3R0b20tbGVmdCcuIFZhbGlkIHBvc2l0aW9uczogYCwgT2JqZWN0LmtleXMocG9zaXRpb25zKSk7XG4gICAgICAgIHRoaXMub3B0aW9ucy5wb3NpdGlvbiA9ICdib3R0b20tbGVmdCc7XG4gICAgICB9XG4gICAgICB0aGlzLnN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgIHRoaXMuc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgdWwua2V5c3Ryb2tlcyB7XG4gICAgICAgIHBhZGRpbmctbGVmdDogMTBweDtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAke3Bvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dfVxuICAgICAgfVxuICAgICAgXG4gICAgICB1bC5rZXlzdHJva2VzIGxpIHtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3RoaXMub3B0aW9ucy5iZXplbENvbG9yfTtcbiAgICAgICAgb3BhY2l0eTogMC45O1xuICAgICAgICBjb2xvcjogJHt0aGlzLm9wdGlvbnMudGV4dENvbG9yfTtcbiAgICAgICAgcGFkZGluZzogNXB4IDEwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgZm9udC1zaXplOiAke3RoaXMub3B0aW9ucy5mb250U2l6ZX1weDtcbiAgICAgICAgZGlzcGxheTogdGFibGU7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5ICR7dGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbn1tcyBsaW5lYXI7XG4gICAgICB9YDtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5zdHlsZSk7XG4gICAgfVxuICAgIGNvbnZlcnRLZXlUb1N5bWJvbChrZXkpIHtcbiAgICAgIGNvbnN0IGNvbnZlcnNpb25Db21tb24gPSB7XG4gICAgICAgICdBcnJvd1JpZ2h0JzogJ+KGkicsXG4gICAgICAgICdBcnJvd0xlZnQnOiAn4oaQJyxcbiAgICAgICAgJ0Fycm93VXAnOiAn4oaRJyxcbiAgICAgICAgJ0Fycm93RG93bic6ICfihpMnLFxuICAgICAgICAnICc6ICfikKMnLFxuICAgICAgICAnRW50ZXInOiAn4oapJyxcbiAgICAgICAgJ1NoaWZ0JzogJ+KHpycsXG4gICAgICAgICdTaGlmdFJpZ2h0JzogJ+KHpycsXG4gICAgICAgICdTaGlmdExlZnQnOiAn4oenJyxcbiAgICAgICAgJ0NvbnRyb2wnOiAn4oyDJyxcbiAgICAgICAgJ1RhYic6ICfihrknLFxuICAgICAgICAnQ2Fwc0xvY2snOiAn4oeqJ1xuICAgICAgfTtcbiAgICAgIGNvbnN0IGNvbnZlcnNpb25NYWMgPSB7XG4gICAgICAgICdBbHQnOiAn4oylJyxcbiAgICAgICAgJ0FsdExlZnQnOiAn4oylJyxcbiAgICAgICAgJ0FsdFJpZ2h0JzogJ+KMpScsXG4gICAgICAgICdEZWxldGUnOiAn4oymJyxcbiAgICAgICAgJ0VzY2FwZSc6ICfijosnLFxuICAgICAgICAnQmFja3NwYWNlJzogJ+KMqycsXG4gICAgICAgICdNZXRhJzogJ+KMmCcsXG4gICAgICAgICdUYWInOiAn4oelJyxcbiAgICAgICAgJ1BhZ2VEb3duJzogJ+KHnycsXG4gICAgICAgICdQYWdlVXAnOiAn4oeeJyxcbiAgICAgICAgJ0hvbWUnOiAn4oaWJyxcbiAgICAgICAgJ0VuZCc6ICfihpgnXG4gICAgICB9O1xuICAgICAgcmV0dXJuIChuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgPyBjb252ZXJzaW9uTWFjW2tleV0gOiBudWxsKSB8fCBjb252ZXJzaW9uQ29tbW9uW2tleV0gfHwga2V5O1xuICAgIH1cbiAgICBrZXlkb3duKGUpIHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHtcbiAgICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmN1cnJlbnRDaHVuayk7XG4gICAgICB9XG4gICAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVubW9kaWZpZWRLZXkpIHtcbiAgICAgICAgaWYgKGUuY29kZS5pbmRleE9mKCdLZXknKSAhPT0gLTEpIHtcbiAgICAgICAgICBrZXkgPSBlLmNvZGUucmVwbGFjZSgnS2V5JywgJycpO1xuICAgICAgICAgIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAgICAga2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2YXIgbW9kaWZpZXIgPSAnJztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLk1ldGEgJiYgZS5tZXRhS2V5ICYmIGUua2V5ICE9PSAnTWV0YScpIHtcbiAgICAgICAgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ01ldGEnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLkFsdCAmJiBlLmFsdEtleSAmJiBlLmtleSAhPT0gJ0FsdCcpIHtcbiAgICAgICAgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ0FsdCcpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuU2hpZnQgJiYgZS5zaGlmdEtleSAmJiBlLmtleSAhPT0gJ1NoaWZ0Jykge1xuICAgICAgICBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnU2hpZnQnKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudENodW5rLnRleHRDb250ZW50ICs9IG1vZGlmaWVyICsgKHRoaXMub3B0aW9ucy5zaG93U3ltYm9sID8gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woa2V5KSA6IGtleSk7XG4gICAgfVxuICAgIGtleXVwKGUpIHtcbiAgICAgIGlmICghdGhpcy5jdXJyZW50Q2h1bmspIHJldHVybjtcbiAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgICB0aGlzLmtleVN0cm9rZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgKGZ1bmN0aW9uIChwcmV2aW91c0NodW5rKSB7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBwcmV2aW91c0NodW5rLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHByZXZpb3VzQ2h1bmsucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c0NodW5rKTtcbiAgICAgICAgICAgIH0sIG9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcbiAgICAgICAgICB9LCBvcHRpb25zLmxpbmdlckRlbGF5KTtcbiAgICAgICAgfSkodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgICAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgICB9LCBvcHRpb25zLmtleVN0cm9rZURlbGF5KTtcbiAgICB9XG4gICAgZW5hYmxlKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuY2xlYW5VcCgpO1xuICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zIHx8IHRoaXMub3B0aW9ucyk7XG4gICAgICB0aGlzLmluamVjdENvbXBvbmVudHMoKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMua2V5dXApO1xuICAgIH1cbiAgICBkaXNhYmxlKCkge1xuICAgICAgdGhpcy5jbGVhblVwKCk7XG4gICAgfVxuICB9XG4gIHZhciBpbmRleCA9IG5ldyBLZXlzdHJva2VWaXN1YWxpemVyKCk7XG5cbiAgcmV0dXJuIGluZGV4O1xuXG59KSkpO1xuIiwiaW1wb3J0IEtleXN0cm9rZVZpc3VhbGl6ZXIgZnJvbSAna2V5c3Ryb2tlLXZpc3VhbGl6ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dEhlbHBlcnMge1xuICBpbml0S2V5cygpIHtcbiAgICBLZXlzdHJva2VWaXN1YWxpemVyLmVuYWJsZSh7dW5tb2RpZmllZEtleTogZmFsc2V9KTtcbiAgfVxuXG4gIGluaXRNb3VzZSgpIHtcbiAgICB0aGlzLm1vdXNlRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5tb3VzZURpdi5pZD0nbW91c2VkaXYnO1xuICAgIHRoaXMubW91c2VDbGljayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMubW91c2VDbGljay5pZD0nbW91c2VjbGljayc7XG4gICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBsZWZ0OiAwcHg7XG4gICAgICB0b3A6IDBweDtcbiAgICAgIGJvcmRlcjogM3B4IHNvbGlkIGJsYWNrO1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICAgIGA7XG5cbiAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmNzc1RleHQgPSBgXG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogMzBweDtcbiAgICAgIGhlaWdodDogMzBweDtcbiAgICAgIGxlZnQ6IDBweDtcbiAgICAgIHRvcDogMHB4O1xuICAgICAgYmFja2dyb3VuZC1pbWFnZTogdXJsKCcvY3Vyc29yLnN2ZycpO1xuICAgICAgYmFja2dyb3VuZC1wb3NpdGlvbjogLThweCAtNXB4O1xuICAgICAgei1pbmRleDogOTk5OTtcbiAgICBgO1xuICAgIFxuICAgIHRoaXMuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGhpcy5tb3VzZURpdik7XG4gICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1vdXNlQ2xpY2spO1xuXG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgdGhpcy5tb3VzZURpdi5zdHlsZS5sZWZ0ID0gZXZ0LnggKyBcInB4XCI7XG4gICAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLnRvcCA9IGV2dC55ICsgXCJweFwiO1xuXG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUubGVmdCA9IGAke2V2dC54IC0gMTJ9cHhgO1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnRvcCA9IGAke2V2dC55IC0gN31weGA7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBldnQgPT4ge1xuICAgICAgdGhpcy5tb3VzZUNsaWNrLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgfSk7XG4gICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIH0pO1xuXG4gIH1cblxuICBjb25zdHJ1Y3RvciAoY2FudmFzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3Nob3cta2V5cycpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0S2V5cygpO1xuICAgIH1cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2hvdy1tb3VzZScpICE9PSAtMSkge1xuICAgICAgdGhpcy5pbml0TW91c2UoKTtcbiAgICB9XG4gIH1cbn0iLCJmdW5jdGlvbiBuZWFyZXN0TmVpZ2hib3IgKHNyYywgZHN0KSB7XG4gIGxldCBwb3MgPSAwXG5cbiAgZm9yIChsZXQgeSA9IDA7IHkgPCBkc3QuaGVpZ2h0OyB5KyspIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGRzdC53aWR0aDsgeCsrKSB7XG4gICAgICBjb25zdCBzcmNYID0gTWF0aC5mbG9vcih4ICogc3JjLndpZHRoIC8gZHN0LndpZHRoKVxuICAgICAgY29uc3Qgc3JjWSA9IE1hdGguZmxvb3IoeSAqIHNyYy5oZWlnaHQgLyBkc3QuaGVpZ2h0KVxuXG4gICAgICBsZXQgc3JjUG9zID0gKChzcmNZICogc3JjLndpZHRoKSArIHNyY1gpICogNFxuXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gUlxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEdcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBCXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gQVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzaXplSW1hZ2VEYXRhKHNyY0ltYWdlRGF0YSwgbmV3SW1hZ2VEYXRhKSB7XG4gIG5lYXJlc3ROZWlnaGJvcihzcmNJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBpeGVsbWF0Y2g7XG5cbmZ1bmN0aW9uIHBpeGVsbWF0Y2goaW1nMSwgaW1nMiwgb3V0cHV0LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKSB7XG5cbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciB0aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCA9PT0gdW5kZWZpbmVkID8gMC4xIDogb3B0aW9ucy50aHJlc2hvbGQ7XG5cbiAgICAvLyBtYXhpbXVtIGFjY2VwdGFibGUgc3F1YXJlIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNvbG9ycztcbiAgICAvLyAzNTIxNSBpcyB0aGUgbWF4aW11bSBwb3NzaWJsZSB2YWx1ZSBmb3IgdGhlIFlJUSBkaWZmZXJlbmNlIG1ldHJpY1xuICAgIHZhciBtYXhEZWx0YSA9IDM1MjE1ICogdGhyZXNob2xkICogdGhyZXNob2xkLFxuICAgICAgICBkaWZmID0gMDtcblxuICAgIC8vIGNvbXBhcmUgZWFjaCBwaXhlbCBvZiBvbmUgaW1hZ2UgYWdhaW5zdCB0aGUgb3RoZXIgb25lXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcblxuICAgICAgICAgICAgdmFyIHBvcyA9ICh5ICogd2lkdGggKyB4KSAqIDQ7XG5cbiAgICAgICAgICAgIC8vIHNxdWFyZWQgWVVWIGRpc3RhbmNlIGJldHdlZW4gY29sb3JzIGF0IHRoaXMgcGl4ZWwgcG9zaXRpb25cbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgcG9zLCBwb3MpO1xuXG4gICAgICAgICAgICAvLyB0aGUgY29sb3IgZGlmZmVyZW5jZSBpcyBhYm92ZSB0aGUgdGhyZXNob2xkXG4gICAgICAgICAgICBpZiAoZGVsdGEgPiBtYXhEZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGl0J3MgYSByZWFsIHJlbmRlcmluZyBkaWZmZXJlbmNlIG9yIGp1c3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5pbmNsdWRlQUEgJiYgKGFudGlhbGlhc2VkKGltZzEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzIpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFudGlhbGlhc2VkKGltZzIsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGltZzEpKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBvbmUgb2YgdGhlIHBpeGVscyBpcyBhbnRpLWFsaWFzaW5nOyBkcmF3IGFzIHllbGxvdyBhbmQgZG8gbm90IGNvdW50IGFzIGRpZmZlcmVuY2VcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDI1NSwgMCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3VuZCBzdWJzdGFudGlhbCBkaWZmZXJlbmNlIG5vdCBjYXVzZWQgYnkgYW50aS1hbGlhc2luZzsgZHJhdyBpdCBhcyByZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dCkgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCAyNTUsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICBkaWZmKys7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG91dHB1dCkge1xuICAgICAgICAgICAgICAgIC8vIHBpeGVscyBhcmUgc2ltaWxhcjsgZHJhdyBiYWNrZ3JvdW5kIGFzIGdyYXlzY2FsZSBpbWFnZSBibGVuZGVkIHdpdGggd2hpdGVcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gYmxlbmQoZ3JheVBpeGVsKGltZzEsIHBvcyksIDAuMSk7XG4gICAgICAgICAgICAgICAgZHJhd1BpeGVsKG91dHB1dCwgcG9zLCB2YWwsIHZhbCwgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVudCBwaXhlbHNcbiAgICByZXR1cm4gZGlmZjtcbn1cblxuLy8gY2hlY2sgaWYgYSBwaXhlbCBpcyBsaWtlbHkgYSBwYXJ0IG9mIGFudGktYWxpYXNpbmc7XG4vLyBiYXNlZCBvbiBcIkFudGktYWxpYXNlZCBQaXhlbCBhbmQgSW50ZW5zaXR5IFNsb3BlIERldGVjdG9yXCIgcGFwZXIgYnkgVi4gVnlzbmlhdXNrYXMsIDIwMDlcblxuZnVuY3Rpb24gYW50aWFsaWFzZWQoaW1nLCB4MSwgeTEsIHdpZHRoLCBoZWlnaHQsIGltZzIpIHtcbiAgICB2YXIgeDAgPSBNYXRoLm1heCh4MSAtIDEsIDApLFxuICAgICAgICB5MCA9IE1hdGgubWF4KHkxIC0gMSwgMCksXG4gICAgICAgIHgyID0gTWF0aC5taW4oeDEgKyAxLCB3aWR0aCAtIDEpLFxuICAgICAgICB5MiA9IE1hdGgubWluKHkxICsgMSwgaGVpZ2h0IC0gMSksXG4gICAgICAgIHBvcyA9ICh5MSAqIHdpZHRoICsgeDEpICogNCxcbiAgICAgICAgemVyb2VzID0gMCxcbiAgICAgICAgcG9zaXRpdmVzID0gMCxcbiAgICAgICAgbmVnYXRpdmVzID0gMCxcbiAgICAgICAgbWluID0gMCxcbiAgICAgICAgbWF4ID0gMCxcbiAgICAgICAgbWluWCwgbWluWSwgbWF4WCwgbWF4WTtcblxuICAgIC8vIGdvIHRocm91Z2ggOCBhZGphY2VudCBwaXhlbHNcbiAgICBmb3IgKHZhciB4ID0geDA7IHggPD0geDI7IHgrKykge1xuICAgICAgICBmb3IgKHZhciB5ID0geTA7IHkgPD0geTI7IHkrKykge1xuICAgICAgICAgICAgaWYgKHggPT09IHgxICYmIHkgPT09IHkxKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gYnJpZ2h0bmVzcyBkZWx0YSBiZXR3ZWVuIHRoZSBjZW50ZXIgcGl4ZWwgYW5kIGFkamFjZW50IG9uZVxuICAgICAgICAgICAgdmFyIGRlbHRhID0gY29sb3JEZWx0YShpbWcsIGltZywgcG9zLCAoeSAqIHdpZHRoICsgeCkgKiA0LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gY291bnQgdGhlIG51bWJlciBvZiBlcXVhbCwgZGFya2VyIGFuZCBicmlnaHRlciBhZGphY2VudCBwaXhlbHNcbiAgICAgICAgICAgIGlmIChkZWx0YSA9PT0gMCkgemVyb2VzKys7XG4gICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA8IDApIG5lZ2F0aXZlcysrO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPiAwKSBwb3NpdGl2ZXMrKztcblxuICAgICAgICAgICAgLy8gaWYgZm91bmQgbW9yZSB0aGFuIDIgZXF1YWwgc2libGluZ3MsIGl0J3MgZGVmaW5pdGVseSBub3QgYW50aS1hbGlhc2luZ1xuICAgICAgICAgICAgaWYgKHplcm9lcyA+IDIpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCFpbWcyKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGRhcmtlc3QgcGl4ZWxcbiAgICAgICAgICAgIGlmIChkZWx0YSA8IG1pbikge1xuICAgICAgICAgICAgICAgIG1pbiA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG1pblggPSB4O1xuICAgICAgICAgICAgICAgIG1pblkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhlIGJyaWdodGVzdCBwaXhlbFxuICAgICAgICAgICAgaWYgKGRlbHRhID4gbWF4KSB7XG4gICAgICAgICAgICAgICAgbWF4ID0gZGVsdGE7XG4gICAgICAgICAgICAgICAgbWF4WCA9IHg7XG4gICAgICAgICAgICAgICAgbWF4WSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWltZzIpIHJldHVybiB0cnVlO1xuXG4gICAgLy8gaWYgdGhlcmUgYXJlIG5vIGJvdGggZGFya2VyIGFuZCBicmlnaHRlciBwaXhlbHMgYW1vbmcgc2libGluZ3MsIGl0J3Mgbm90IGFudGktYWxpYXNpbmdcbiAgICBpZiAobmVnYXRpdmVzID09PSAwIHx8IHBvc2l0aXZlcyA9PT0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gaWYgZWl0aGVyIHRoZSBkYXJrZXN0IG9yIHRoZSBicmlnaHRlc3QgcGl4ZWwgaGFzIG1vcmUgdGhhbiAyIGVxdWFsIHNpYmxpbmdzIGluIGJvdGggaW1hZ2VzXG4gICAgLy8gKGRlZmluaXRlbHkgbm90IGFudGktYWxpYXNlZCksIHRoaXMgcGl4ZWwgaXMgYW50aS1hbGlhc2VkXG4gICAgcmV0dXJuICghYW50aWFsaWFzZWQoaW1nLCBtaW5YLCBtaW5ZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCkpIHx8XG4gICAgICAgICAgICghYW50aWFsaWFzZWQoaW1nLCBtYXhYLCBtYXhZLCB3aWR0aCwgaGVpZ2h0KSAmJiAhYW50aWFsaWFzZWQoaW1nMiwgbWF4WCwgbWF4WSwgd2lkdGgsIGhlaWdodCkpO1xufVxuXG4vLyBjYWxjdWxhdGUgY29sb3IgZGlmZmVyZW5jZSBhY2NvcmRpbmcgdG8gdGhlIHBhcGVyIFwiTWVhc3VyaW5nIHBlcmNlaXZlZCBjb2xvciBkaWZmZXJlbmNlXG4vLyB1c2luZyBZSVEgTlRTQyB0cmFuc21pc3Npb24gY29sb3Igc3BhY2UgaW4gbW9iaWxlIGFwcGxpY2F0aW9uc1wiIGJ5IFkuIEtvdHNhcmVua28gYW5kIEYuIFJhbW9zXG5cbmZ1bmN0aW9uIGNvbG9yRGVsdGEoaW1nMSwgaW1nMiwgaywgbSwgeU9ubHkpIHtcbiAgICB2YXIgYTEgPSBpbWcxW2sgKyAzXSAvIDI1NSxcbiAgICAgICAgYTIgPSBpbWcyW20gKyAzXSAvIDI1NSxcblxuICAgICAgICByMSA9IGJsZW5kKGltZzFbayArIDBdLCBhMSksXG4gICAgICAgIGcxID0gYmxlbmQoaW1nMVtrICsgMV0sIGExKSxcbiAgICAgICAgYjEgPSBibGVuZChpbWcxW2sgKyAyXSwgYTEpLFxuXG4gICAgICAgIHIyID0gYmxlbmQoaW1nMlttICsgMF0sIGEyKSxcbiAgICAgICAgZzIgPSBibGVuZChpbWcyW20gKyAxXSwgYTIpLFxuICAgICAgICBiMiA9IGJsZW5kKGltZzJbbSArIDJdLCBhMiksXG5cbiAgICAgICAgeSA9IHJnYjJ5KHIxLCBnMSwgYjEpIC0gcmdiMnkocjIsIGcyLCBiMik7XG5cbiAgICBpZiAoeU9ubHkpIHJldHVybiB5OyAvLyBicmlnaHRuZXNzIGRpZmZlcmVuY2Ugb25seVxuXG4gICAgdmFyIGkgPSByZ2IyaShyMSwgZzEsIGIxKSAtIHJnYjJpKHIyLCBnMiwgYjIpLFxuICAgICAgICBxID0gcmdiMnEocjEsIGcxLCBiMSkgLSByZ2IycShyMiwgZzIsIGIyKTtcblxuICAgIHJldHVybiAwLjUwNTMgKiB5ICogeSArIDAuMjk5ICogaSAqIGkgKyAwLjE5NTcgKiBxICogcTtcbn1cblxuZnVuY3Rpb24gcmdiMnkociwgZywgYikgeyByZXR1cm4gciAqIDAuMjk4ODk1MzEgKyBnICogMC41ODY2MjI0NyArIGIgKiAwLjExNDQ4MjIzOyB9XG5mdW5jdGlvbiByZ2IyaShyLCBnLCBiKSB7IHJldHVybiByICogMC41OTU5Nzc5OSAtIGcgKiAwLjI3NDE3NjEwIC0gYiAqIDAuMzIxODAxODk7IH1cbmZ1bmN0aW9uIHJnYjJxKHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjIxMTQ3MDE3IC0gZyAqIDAuNTIyNjE3MTEgKyBiICogMC4zMTExNDY5NDsgfVxuXG4vLyBibGVuZCBzZW1pLXRyYW5zcGFyZW50IGNvbG9yIHdpdGggd2hpdGVcbmZ1bmN0aW9uIGJsZW5kKGMsIGEpIHtcbiAgICByZXR1cm4gMjU1ICsgKGMgLSAyNTUpICogYTtcbn1cblxuZnVuY3Rpb24gZHJhd1BpeGVsKG91dHB1dCwgcG9zLCByLCBnLCBiKSB7XG4gICAgb3V0cHV0W3BvcyArIDBdID0gcjtcbiAgICBvdXRwdXRbcG9zICsgMV0gPSBnO1xuICAgIG91dHB1dFtwb3MgKyAyXSA9IGI7XG4gICAgb3V0cHV0W3BvcyArIDNdID0gMjU1O1xufVxuXG5mdW5jdGlvbiBncmF5UGl4ZWwoaW1nLCBpKSB7XG4gICAgdmFyIGEgPSBpbWdbaSArIDNdIC8gMjU1LFxuICAgICAgICByID0gYmxlbmQoaW1nW2kgKyAwXSwgYSksXG4gICAgICAgIGcgPSBibGVuZChpbWdbaSArIDFdLCBhKSxcbiAgICAgICAgYiA9IGJsZW5kKGltZ1tpICsgMl0sIGEpO1xuICAgIHJldHVybiByZ2IyeShyLCBnLCBiKTtcbn1cbiIsImltcG9ydCBTdGF0cyBmcm9tICdpbmNyZW1lbnRhbC1zdGF0cy1saXRlJztcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBXZWJHTFN0YXRzICgpIHtcblxuICB2YXIgZGF0YSA9IHtcbiAgICBudW1EcmF3Q2FsbHM6IDAsXG5cbiAgICBudW1EcmF3QXJyYXlzQ2FsbHM6MCxcbiAgICBudW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHM6MCxcbiAgICBudW1EcmF3RWxlbWVudHNDYWxsczowLFxuICAgIG51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzOiAwLFxuXG4gICAgbnVtVXNlUHJvZ3JhbUNhbGxzOjAsXG4gICAgbnVtRmFjZXM6MCxcbiAgICBudW1WZXJ0aWNlczowLFxuICAgIG51bVBvaW50czowLFxuICAgIG51bUJpbmRUZXh0dXJlczowXG4gIH1cblxuICB2YXIgc3RhdHMgPSB7XG4gICAgZHJhd0NhbGxzOiBuZXcgU3RhdHMoKSxcbiAgICB1c2VQcm9ncmFtQ2FsbHM6IG5ldyBTdGF0cygpLFxuICAgIGZhY2VzOiBuZXcgU3RhdHMoKSxcbiAgICB2ZXJ0aWNlczogbmV3IFN0YXRzKCksXG4gICAgYmluZFRleHR1cmVzOiBuZXcgU3RhdHMoKVxuICB9O1xuXG4gIGZ1bmN0aW9uIGZyYW1lRW5kKCkge1xuICAgIGZvciAobGV0IHN0YXQgaW4gc3RhdHMpIHtcbiAgICAgIHZhciBjb3VudGVyTmFtZSA9ICdudW0nICsgc3RhdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0YXQuc2xpY2UoMSk7XG4gICAgICBzdGF0c1tzdGF0XS51cGRhdGUoZGF0YVtjb3VudGVyTmFtZV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9oICggZiwgYyApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBjLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgICAgZi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgfTtcbiAgfVxuICBcbiAgaWYgKCdXZWJHTDJSZW5kZXJpbmdDb250ZXh0JyBpbiB3aW5kb3cpIHtcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXNJbnN0YW5jZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0pO1xuXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzSW5zdGFuY2VkID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50c0luc3RhbmNlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcblxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cywgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBkYXRhLm51bUZhY2VzICs9IGFyZ3VtZW50c1sgMSBdIC8gMztcbiAgICAgIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAxIF07XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0gPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1Vc2VQcm9ncmFtQ2FsbHMrKztcbiAgICB9ICk7XG4gICAgXG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gICAgfSApO1xuICBcbiAgfVxuXG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMrKztcbiAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgZGF0YS5udW1EcmF3RWxlbWVudHNDYWxscysrO1xuICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgZGF0YS5udW1GYWNlcyArPSBhcmd1bWVudHNbIDEgXSAvIDM7XG4gICAgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDEgXTtcbiAgfSApO1xuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzKys7XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUgPSBfaCggV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5iaW5kVGV4dHVyZSwgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtQmluZFRleHR1cmVzKys7XG4gIH0gKTtcbiAgXG4gIGZ1bmN0aW9uIGZyYW1lU3RhcnQgKCkge1xuICAgIGRhdGEubnVtRHJhd0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdBcnJheXNDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzID0gMDtcbiAgICBkYXRhLm51bUZhY2VzID0gMDtcbiAgICBkYXRhLm51bVZlcnRpY2VzID0gMDtcbiAgICBkYXRhLm51bVBvaW50cyA9IDA7XG4gICAgZGF0YS5udW1CaW5kVGV4dHVyZXMgPSAwO1xuICB9XG4gIFxuICBmdW5jdGlvbiBzZXR1cEV4dGVuc2lvbnMoY29udGV4dCkge1xuICAgIHZhciBleHQgPSBjb250ZXh0LmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgIGlmICghZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV4dC5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUgPSBfaCggZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIFxuICAgIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdW1tYXJ5KCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgIG1pbjogc3RhdHNba2V5XS5taW4sXG4gICAgICAgIG1heDogc3RhdHNba2V5XS5tYXgsXG4gICAgICAgIGF2Zzogc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgZ2V0Q3VycmVudERhdGE6ICgpID0+IHtyZXR1cm4gZGF0YTt9LFxuICAgIHNldHVwRXh0ZW5zaW9uczogc2V0dXBFeHRlbnNpb25zLFxuICAgIGdldFN1bW1hcnk6IGdldFN1bW1hcnksXG4gICAgZnJhbWVTdGFydDogZnJhbWVTdGFydCxcbiAgICBmcmFtZUVuZDogZnJhbWVFbmRcbiAgICBcbiAgICAvL2VuYWJsZTogZW5hYmxlLFxuICAgIC8vZGlzYWJsZTogZGlzYWJsZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU3RhdHMoKTsiLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgUGVyZlN0YXRzIGZyb20gJ3BlcmZvcm1hbmNlLXN0YXRzJztcbmltcG9ydCBzZWVkcmFuZG9tIGZyb20gJ3NlZWRyYW5kb20nO1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQge0lucHV0UmVjb3JkZXIsIElucHV0UmVwbGF5ZXJ9IGZyb20gJ2lucHV0LWV2ZW50cy1yZWNvcmRlcic7XG5pbXBvcnQgRXZlbnRMaXN0ZW5lck1hbmFnZXIgZnJvbSAnLi9ldmVudC1saXN0ZW5lcnMnO1xuaW1wb3J0IElucHV0SGVscGVycyBmcm9tICcuL2lucHV0LWhlbHBlcnMnO1xuaW1wb3J0IHtyZXNpemVJbWFnZURhdGF9IGZyb20gJy4vaW1hZ2UtdXRpbHMnO1xuaW1wb3J0IHBpeGVsbWF0Y2ggZnJvbSAncGl4ZWxtYXRjaCc7XG5pbXBvcnQgV2ViR0xTdGF0cyBmcm9tICd3ZWJnbC1zdGF0cyc7XG5cbmNvbnN0IHBhcmFtZXRlcnMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpO1xuXG5mdW5jdGlvbiBvblJlYWR5KGNhbGxiYWNrKSB7XG4gIGlmIChcbiAgICBkb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImNvbXBsZXRlXCIgfHxcbiAgICAoZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gXCJsb2FkaW5nXCIgJiYgIWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbClcbiAgKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBjYWxsYmFjayk7XG4gIH1cbn1cblxuXG4vLyBIYWNrcyB0byBmaXggc29tZSBVbml0eSBkZW1vc1xuY29uc29sZS5sb2dFcnJvciA9IChtc2cpID0+IGNvbnNvbGUuZXJyb3IobXNnKTtcblxud2luZG93LlRFU1RFUiA9IHtcbiAgcmVhZHk6IGZhbHNlLFxuXG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgZmlyc3RGcmFtZVRpbWU6IG51bGwsXG4gIC8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxuICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWU6IC0xLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGRlbm90aW5nIHdoZW4gdGhlIHBhZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuXG4gIHBhZ2VMb2FkVGltZTogbnVsbCxcblxuICAvLyBIb2xkcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbXNlY3MgdGhhdCB0aGUgcHJldmlvdXNseSByZW5kZXJlZCBmcmFtZSB0b29rLiBVc2VkIHRvIGVzdGltYXRlIHdoZW4gYSBzdHV0dGVyIGV2ZW50IG9jY3VycyAoZmFzdCBmcmFtZSBmb2xsb3dlZCBieSBhIHNsb3cgZnJhbWUpXG4gIGxhc3RGcmFtZUR1cmF0aW9uOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG4gIGxhc3RGcmFtZVRpY2s6IC0xLFxuXG4gIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWU6IDAsXG5cbiAgLy8gS2VlcHMgdHJhY2sgb2YgcGVyZm9ybWFuY2Ugc3R1dHRlciBldmVudHMuIEEgc3R1dHRlciBldmVudCBvY2N1cnMgd2hlbiB0aGVyZSBpcyBhIGhpY2N1cCBpbiBzdWJzZXF1ZW50IHBlci1mcmFtZSB0aW1lcy4gKGZhc3QgZm9sbG93ZWQgYnkgc2xvdylcbiAgbnVtU3R1dHRlckV2ZW50czogMCxcblxuICBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlOiAxMjAsIC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlXG5cbiAgLy8gTWVhc3VyZSBhIFwidGltZSB1bnRpbCBzbW9vdGggZnJhbWUgcmF0ZVwiIHF1YW50aXR5LCBpLmUuIHRoZSB0aW1lIGFmdGVyIHdoaWNoIHdlIGNvbnNpZGVyIHRoZSBzdGFydHVwIEpJVCBhbmQgR0MgZWZmZWN0cyB0byBoYXZlIHNldHRsZWQuXG4gIC8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbiAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXM6IDAsXG5cbiAgcmFuZG9tU2VlZDogMSxcblxuICBudW1GcmFtZXNUb1JlbmRlcjogdHlwZW9mIHBhcmFtZXRlcnNbJ251bS1mcmFtZXMnXSA9PT0gJ3VuZGVmaW5lZCcgPyAxMjAwIDogcGFyc2VJbnQocGFyYW1ldGVyc1snbnVtLWZyYW1lcyddKSxcblxuICAvLyBHdWFyZCBhZ2FpbnN0IHJlY3Vyc2l2ZSBjYWxscyB0byByZWZlcmVuY2VUZXN0UHJlVGljaytyZWZlcmVuY2VUZXN0VGljayBmcm9tIG11bHRpcGxlIHJBRnMuXG4gIHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQ6IDAsXG5cbiAgLy8gQ2FudmFzIHVzZWQgYnkgdGhlIHRlc3QgdG8gcmVuZGVyXG4gIGNhbnZhczogbnVsbCxcblxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbiAgLy8gdmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG4gIHBvc3RUaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgV2ViR0xTdGF0cy5mcmFtZUVuZCgpO1xuICAgIC8vY29uc29sZS5sb2coJz4+JywgSlNPTi5zdHJpbmdpZnkoV2ViR0xTdGF0cy5nZXRDdXJyZW50RGF0YSgpKSk7XG4gIH0sXG5cbiAgcHJlVGljazogZnVuY3Rpb24oKSB7XG4gICAgV2ViR0xTdGF0cy5mcmFtZVN0YXJ0KCk7XG5cbiAgICBpZiAoKyt0aGlzLnJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPT0gMSkge1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZVN0YXJ0KCk7XG5cbiAgICAgIGlmICghdGhpcy5jYW52YXMpIHtcbiAgICAgICAgLy8gV2UgYXNzdW1lIHRoZSBsYXN0IHdlYmdsIGNvbnRleHQgYmVpbmcgaW5pdGlhbGl6ZWQgaXMgdGhlIG9uZSB1c2VkIHRvIHJlbmRlcmluZ1xuICAgICAgICAvLyBJZiB0aGF0J3MgZGlmZmVyZW50LCB0aGUgdGVzdCBzaG91bGQgaGF2ZSBhIGN1c3RvbSBjb2RlIHRvIHJldHVybiB0aGF0IGNhbnZhc1xuICAgICAgICBpZiAoQ2FudmFzSG9vay53ZWJnbENvbnRleHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YXIgY29udGV4dCA9IENhbnZhc0hvb2sud2ViZ2xDb250ZXh0c1tDYW52YXNIb29rLndlYmdsQ29udGV4dHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgdGhpcy5jYW52YXMgPSBjb250ZXh0LmNhbnZhcztcbiAgICAgICAgICAvLyBUbyBwcmV2ZW50IHdpZHRoICYgaGVpZ2h0IDEwMCVcbiAgICAgICAgICBmdW5jdGlvbiBhZGRTdHlsZVN0cmluZyhzdHIpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgICAgIG5vZGUuaW5uZXJIVE1MID0gc3RyO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhZGRTdHlsZVN0cmluZyhgLmdmeHRlc3RzLWNhbnZhcyB7d2lkdGg6ICR7dGhpcy53aW5kb3dTaXplLndpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLndpbmRvd1NpemUuaGVpZ2h0fXB4ICFpbXBvcnRhbnQ7fWApO1xuICAgICAgICAgIHRoaXMuY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2dmeHRlc3RzLWNhbnZhcycpO1xuICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy53aW5kb3dTaXplLndpZHRoO1xuICAgICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMud2luZG93U2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgICBXZWJHTFN0YXRzLnNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnICYmICF0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlciA9IG5ldyBJbnB1dFJlY29yZGVyKHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5lbmFibGUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9AZml4bWUgZWxzZSBmb3IgY2FudmFzIDJkIHdpdGhvdXQgd2ViZ2xcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAwKSB7XG4gICAgICAgIGlmICgnYXV0b2VudGVyLXhyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgdGhpcy5pbmplY3RBdXRvRW50ZXJYUih0aGlzLmNhbnZhcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZXBsYXknXSAhPT0gJ3VuZGVmaW5lZCcgJiYgIXRoaXMuaW5wdXRSZXBsYXllcikge1xuICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLmlucHV0KSB7XG4gICAgICAgICAgLy8gQGZpeG1lIFByZXZlbnQgbXVsdGlwbGUgZmV0Y2ggd2hpbGUgd2FpdGluZ1xuICAgICAgICAgIGZldGNoKCcvdGVzdHMvJyArIEdGWFRFU1RTX0NPTkZJRy5pbnB1dCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oanNvbiA9PiB7XG4gICAgICAgICAgICB0aGlzLmlucHV0UmVwbGF5ZXIgPSBuZXcgSW5wdXRSZXBsYXllcih0aGlzLmNhbnZhcywganNvbiwgdGhpcy5ldmVudExpc3RlbmVyLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgICAgICAgICAvL3RoaXMuaW5wdXRSZXBsYXllciA9IG5ldyBJbnB1dFJlcGxheWVyKHRoaXMuY2FudmFzLCBqc29uKTtcbiAgICAgICAgICAgIC8vaWYgKHBhcmFtZXRlcnMuc2hvd01vdXNlIHx8wqBwYXJhbWV0ZXJzLnNob3dLZXlzKVxuICAgICAgICAgICAgdGhpcy5pbnB1dEhlbHBlcnMgPSBuZXcgSW5wdXRIZWxwZXJzKHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWR5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8vIHJlZmVyZW5jZVRlc3RUMCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGlmICh0aGlzLnBhZ2VMb2FkVGltZSA9PT0gbnVsbCkgdGhpcy5wYWdlTG9hZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwYWdlSW5pdFRpbWU7XG5cbiAgICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgICAgaWYgKHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lICE9IC0xKSB7XG4gICAgICAgIHRoaXMuYWNjdW11bGF0ZWRDcHVJZGxlVGltZSArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSB0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuICAgIGlmICgtLXRoaXMucmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA+IDApXG4gICAgICByZXR1cm47IC8vIFdlIGFyZSBiZWluZyBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGlnbm9yZSB0aGlzIGNhbGwuXG5cbiAgICBpZiAoIXRoaXMucmVhZHkpIHtyZXR1cm47fVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgdGhpcy5pbnB1dFJlY29yZGVyLmZyYW1lTnVtYmVyID0gdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZXBsYXllcikge1xuICAgICAgdGhpcy5pbnB1dFJlcGxheWVyLnRpY2sodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIpO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG5cbiAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICAgIHZhciBmcmFtZUR1cmF0aW9uID0gdGltZU5vdyAtIHRoaXMubGFzdEZyYW1lVGljaztcbiAgICB0aGlzLmxhc3RGcmFtZVRpY2sgPSB0aW1lTm93O1xuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA+IDUgJiYgdGhpcy5sYXN0RnJhbWVEdXJhdGlvbiA+IDApIHtcbiAgICAgIC8vIFRoaXMgbXVzdCBiZSBmaXhlZCBkZXBlbmRpbmcgb24gdGhlIHZzeW5jXG4gICAgICBpZiAoZnJhbWVEdXJhdGlvbiA+IDIwLjAgJiYgZnJhbWVEdXJhdGlvbiA+IHRoaXMubGFzdEZyYW1lRHVyYXRpb24gKiAxLjM1KSB7XG4gICAgICAgIHRoaXMubnVtU3R1dHRlckV2ZW50cysrO1xuICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkge1xuICAgICAgICAgIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMrKztcbiAgICAgICAgICBpZiAodGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA+PSB0aGlzLm51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aW1lVW50aWxTbW9vdGhGcmFtZXJhdGUnLCB0aW1lTm93IC0gdGhpcy5maXJzdEZyYW1lVGltZSk7XG4gICAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPSBmcmFtZUR1cmF0aW9uO1xuLypcbiAgICBpZiAobnVtUHJlbG9hZFhIUnNJbkZsaWdodCA9PSAwKSB7IC8vIEltcG9ydGFudCEgVGhlIGZyYW1lIG51bWJlciBhZHZhbmNlcyBvbmx5IGZvciB0aG9zZSBmcmFtZXMgdGhhdCB0aGUgZ2FtZSBpcyBub3Qgd2FpdGluZyBmb3IgZGF0YSBmcm9tIHRoZSBpbml0aWFsIG5ldHdvcmsgZG93bmxvYWRzLlxuICAgICAgaWYgKG51bVN0YXJ0dXBCbG9ja2VyWEhSc1BlbmRpbmcgPT0gMCkgKyt0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjsgLy8gQWN0dWFsIHJlZnRlc3QgZnJhbWUgY291bnQgb25seSBpbmNyZW1lbnRzIGFmdGVyIGdhbWUgaGFzIGNvbnN1bWVkIGFsbCB0aGUgY3JpdGljYWwgWEhScyB0aGF0IHdlcmUgdG8gYmUgcHJlbG9hZGVkLlxuICAgICAgKytmYWtlZFRpbWU7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICAgIH1cbiovXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIrKztcbiAgICBpZiAodGhpcy5mcmFtZVByb2dyZXNzQmFyKSB7XG4gICAgICB2YXIgcGVyYyA9IHBhcnNlSW50KDEwMCAqIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyIC8gdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG4gICAgICB0aGlzLmZyYW1lUHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBwZXJjICsgXCIlXCI7XG4gICAgfVxuXG4gICAgRmFrZVRpbWVycy5mYWtlZFRpbWUrKzsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG5cbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IDEpIHtcbiAgICAgIHRoaXMuZmlyc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBjb25zb2xlLmxvZygnRmlyc3QgZnJhbWUgc3VibWl0dGVkIGF0IChtcyk6JywgdGhpcy5maXJzdEZyYW1lVGltZSAtIHBhZ2VJbml0VGltZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyKSB7XG4gICAgICAvLyBURVNURVIuZG9JbWFnZVJlZmVyZW5jZUNoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gV2Ugd2lsbCBhc3N1bWUgdGhhdCBhZnRlciB0aGUgcmVmdGVzdCB0aWNrLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZyBpZGxlIHRvIHdhaXQgZm9yIG5leHQgZXZlbnQuXG4gICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgfSxcblxuICBjcmVhdGVEb3dubG9hZEltYWdlTGluazogZnVuY3Rpb24oZGF0YSwgZmlsZW5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUgKyAnLnBuZycpO1xuICAgIGEuc2V0QXR0cmlidXRlKCdocmVmJywgZGF0YSk7XG4gICAgYS5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZGOyBkaXNwbGF5OiBpbmxpbmUtZ3JpZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBtYXJnaW46IDJweDsgZm9udC1zaXplOiAxNHB4Oyc7XG5cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLmlkID0gZmlsZW5hbWU7XG4gICAgaW1nLnNyYyA9IGRhdGE7XG4gICAgYS5hcHBlbmRDaGlsZChpbWcpO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbC5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBkZXNjcmlwdGlvbiB8fCBmaWxlbmFtZTtcblxuICAgIGEuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfaW1hZ2VzJykuYXBwZW5kQ2hpbGQoYSk7XG4gIH0sXG5cbiAgLy8gWEhScyBpbiB0aGUgZXhwZWN0ZWQgcmVuZGVyIG91dHB1dCBpbWFnZSwgYWx3YXlzICdyZWZlcmVuY2UucG5nJyBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHRlc3QuXG4gIGxvYWRSZWZlcmVuY2VJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICB2YXIgcmVmZXJlbmNlSW1hZ2VOYW1lID0gcGFyYW1ldGVyc1sncmVmZXJlbmNlLWltYWdlJ10gfHwgR0ZYVEVTVFNfQ09ORklHLmlkO1xuICAgICAgICBcbiAgICAgIGltZy5zcmMgPSAnLycgKyBHRlhURVNUU19SRUZFUkVOQ0VJTUFHRV9CQVNFVVJMICsgJy8nICsgcmVmZXJlbmNlSW1hZ2VOYW1lICsgJy5wbmcnO1xuICAgICAgaW1nLm9uYWJvcnQgPSBpbWcub25lcnJvciA9IHJlamVjdDtcbiAgICAgIFxuICAgICAgLy8gcmVmZXJlbmNlLnBuZyBtaWdodCBjb21lIGZyb20gYSBkaWZmZXJlbnQgZG9tYWluIHRoYW4gdGhlIGNhbnZhcywgc28gZG9uJ3QgbGV0IGl0IHRhaW50IGN0eC5nZXRJbWFnZURhdGEoKS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0NPUlNfZW5hYmxlZF9pbWFnZVxuICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7IFxuICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICBjYW52YXMud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIFxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBcbiAgICAgICAgdmFyIGRhdGEgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAncmVmZXJlbmNlLWltYWdlJywgJ1JlZmVyZW5jZSBpbWFnZScpO1xuICBcbiAgICAgICAgcmVzb2x2ZSh0aGlzLnJlZmVyZW5jZUltYWdlRGF0YSk7XG4gICAgICB9XG4gICAgICB0aGlzLnJlZmVyZW5jZUltYWdlID0gaW1nOyAgXG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0Q3VycmVudEltYWdlOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIC8vIEdyYWIgcmVuZGVyZWQgV2ViR0wgZnJvbnQgYnVmZmVyIGltYWdlIHRvIGEgSlMtc2lkZSBpbWFnZSBvYmplY3QuXG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IGNhbGxiYWNrO1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZ2VuZXJhdGUgaW1hZ2VcIik7XG4gICAgfVxuICB9LFxuXG4gIGRvSW1hZ2VSZWZlcmVuY2VDaGVjazogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBmdW5jdGlvbiByZWZ0ZXN0IChldnQpIHtcbiAgICAgICAgdmFyIGltZyA9IGFjdHVhbEltYWdlO1xuICAgICAgICB2YXIgY2FudmFzQ3VycmVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB2YXIgY29udGV4dCA9IGNhbnZhc0N1cnJlbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjYW52YXNDdXJyZW50LndpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICBjYW52YXNDdXJyZW50LmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG5cbiAgICAgICAgdmFyIGN1cnJlbnRJbWFnZURhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgICAgIHNlbGYubG9hZFJlZmVyZW5jZUltYWdlKCkudGhlbihyZWZJbWFnZURhdGEgPT4ge1xuICAgICAgICAgIHZhciB3aWR0aCA9IHJlZkltYWdlRGF0YS53aWR0aDtcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gcmVmSW1hZ2VEYXRhLmhlaWdodDtcbiAgICAgICAgICB2YXIgY2FudmFzRGlmZiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIHZhciBkaWZmQ3R4ID0gY2FudmFzRGlmZi5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgIGNhbnZhc0RpZmYud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBjYW52YXNEaWZmLmhlaWdodCA9IGhlaWdodDsgIFxuICAgICAgICAgIHZhciBkaWZmID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIG5ld0ltYWdlRGF0YSA9IGRpZmZDdHguY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgIHJlc2l6ZUltYWdlRGF0YShjdXJyZW50SW1hZ2VEYXRhLCBuZXdJbWFnZURhdGEpO1xuXG4gICAgICAgICAgdmFyIGV4cGVjdGVkID0gcmVmSW1hZ2VEYXRhLmRhdGE7XG4gICAgICAgICAgdmFyIGFjdHVhbCA9IG5ld0ltYWdlRGF0YS5kYXRhO1xuICAgICAgICAgIFxuICAgICAgICAgIHZhciB0aHJlc2hvbGQgPSB0eXBlb2YgR0ZYVEVTVFNfQ09ORklHLnJlZmVyZW5jZUNvbXBhcmVUaHJlc2hvbGQgPT09ICd1bmRlZmluZWQnID8gMC4yIDogR0ZYVEVTVFNfQ09ORklHLnJlZmVyZW5jZUNvbXBhcmVUaHJlc2hvbGQ7XG4gICAgICAgICAgdmFyIG51bURpZmZQaXhlbHMgPSBwaXhlbG1hdGNoKGV4cGVjdGVkLCBhY3R1YWwsIGRpZmYuZGF0YSwgd2lkdGgsIGhlaWdodCwge3RocmVzaG9sZDogdGhyZXNob2xkfSk7XG4gICAgICAgICAgdmFyIGRpZmZQZXJjID0gbnVtRGlmZlBpeGVscyAvICh3aWR0aCAqIGhlaWdodCkgKiAxMDA7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGZhaWwgPSBkaWZmUGVyYyA+IDAuMjsgLy8gZGlmZiBwZXJjIDAgLSAxMDAlXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHtyZXN1bHQ6ICdwYXNzJ307XG5cbiAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2ggKCR7ZGlmZlBlcmMudG9GaXhlZCgyKX0lIGRpZmZlcmVudCBwaXhlbHMpYDtcbiAgICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgICAgZGlmZlBlcmM6IGRpZmZQZXJjLFxuICAgICAgICAgICAgICBudW1EaWZmUGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICAgICAgICBmYWlsUmVhc29uOiAnUmVmZXJlbmNlIGltYWdlIG1pc21hdGNoJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgICAgIGJlbmNobWFya0Rpdi5jbGFzc05hbWUgPSAnZmFpbCc7XG4gICAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBmYWlsZWQhJztcblxuICAgICAgICAgICAgZGlmZkN0eC5wdXRJbWFnZURhdGEoZGlmZiwgMCwgMCk7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0gY2FudmFzRGlmZi50b0RhdGFVUkwoJ2ltYWdlL3BuZycpO1xuICAgICAgICAgICAgc2VsZi5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAnY2FudmFzLWRpZmYnLCAnRGlmZmVyZW5jZScpO1xuICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gJ2ZhaWwnO1xuICAgICAgICAgIGJlbmNobWFya0Rpdi5xdWVyeVNlbGVjdG9yKCdoMScpLmlubmVyVGV4dCA9ICdUZXN0IGZhaWxlZCEnO1xuXG4gICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICBkaXZFcnJvci5xdWVyeVNlbGVjdG9yKCdoMycpLmlubmVySFRNTCA9IGBFUlJPUjogRmFpbGVkIHRvIGxvYWQgcmVmZXJlbmNlIGltYWdlYDtcbiAgICAgICAgICBkaXZFcnJvci5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgIGZhaWxSZWFzb246ICdFcnJvciBsb2FkaW5nIHJlZmVyZW5jZSBpbWFnZSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGluaXQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIGFjdHVhbEltYWdlLnNyYyA9IHRoaXMuY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gcmVmdGVzdDtcbiAgICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmVqZWN0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgaW5pdFNlcnZlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovLycgKyBHRlhURVNUU19DT05GSUcuc2VydmVySVAgKyAnOjg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zb2NrZXQuZW1pdCgndGVzdF9zdGFydGVkJywge2lkOiBHRlhURVNUU19DT05GSUcuaWR9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCduZXh0X2JlbmNobWFyaycsIChkYXRhKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnbmV4dF9iZW5jaG1hcmsnLCBkYXRhKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGRhdGEudXJsKTtcbiAgICB9KTsgICAgXG4gIH0sXG4gIFxuICBhZGRJbnB1dERvd25sb2FkQnV0dG9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBEdW1wIGlucHV0XG4gICAgICBmdW5jdGlvbiBzYXZlU3RyaW5nICh0ZXh0LCBmaWxlbmFtZSwgbWltZVR5cGUpIHtcbiAgICAgICAgc2F2ZUJsb2IobmV3IEJsb2IoWyB0ZXh0IF0sIHsgdHlwZTogbWltZVR5cGUgfSksIGZpbGVuYW1lKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gc2F2ZUJsb2IgKGJsb2IsIGZpbGVuYW1lKSB7XG4gICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZSB8fCAnaW5wdXQuanNvbic7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgLy8gVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpOyBicmVha3MgRmlyZWZveC4uLlxuICAgICAgfVxuXG4gICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMsIG51bGwsIDIpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKCdJbnB1dCByZWNvcmRlZCcsIGpzb24pO1xuXG4gICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICBsaW5rLmhyZWYgPSAnIyc7XG4gICAgICBsaW5rLmNsYXNzTmFtZSA9ICdidXR0b24nO1xuICAgICAgbGluay5vbmNsaWNrID0gKCkgPT4gc2F2ZVN0cmluZyhqc29uLCBHRlhURVNUU19DT05GSUcuaWQgKyAnLmpzb24nLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgbGluay5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShgRG93bmxvYWQgaW5wdXQgSlNPTmApKTsgLy8gKCR7dGhpcy5pbnB1dFJlY29yZGVyLmV2ZW50cy5sZW5ndGh9IGV2ZW50cyByZWNvcmRlZClcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJykuYXBwZW5kQ2hpbGQobGluayk7XG4gIH0sXG5cbiAgZ2VuZXJhdGVCZW5jaG1hcmtSZXN1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGltZUVuZCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB2YXIgdG90YWxUaW1lID0gdGltZUVuZCAtIHBhZ2VJbml0VGltZTsgLy8gVG90YWwgdGltZSwgaW5jbHVkaW5nIGV2ZXJ5dGhpbmcuXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUgPT4ge1xuICAgICAgdmFyIHRvdGFsUmVuZGVyVGltZSA9IHRpbWVFbmQgLSB0aGlzLmZpcnN0RnJhbWVUaW1lO1xuICAgICAgdmFyIGNwdUlkbGUgPSB0aGlzLmFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKiAxMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyICogMTAwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICBcbiAgICAgIHZhciByZXN1bHQgPSB7XG4gICAgICAgIHRlc3RfaWQ6IEdGWFRFU1RTX0NPTkZJRy5pZCxcbiAgICAgICAgc3RhdHM6IHtcbiAgICAgICAgICBwZXJmOiB0aGlzLnN0YXRzLmdldFN0YXRzU3VtbWFyeSgpLFxuICAgICAgICAgIHdlYmdsOiBXZWJHTFN0YXRzLmdldFN1bW1hcnkoKVxuICAgICAgICB9LFxuICAgICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICAgIHRvdGFsVGltZTogdG90YWxUaW1lLFxuICAgICAgICB0aW1lVG9GaXJzdEZyYW1lOiB0aGlzLmZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgICBhdmdGcHM6IGZwcyxcbiAgICAgICAgbnVtU3R1dHRlckV2ZW50czogdGhpcy5udW1TdHV0dGVyRXZlbnRzLFxuICAgICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgICAgdG90YWxSZW5kZXJUaW1lOiB0b3RhbFJlbmRlclRpbWUsXG4gICAgICAgIGNwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCxcbiAgICAgICAgY3B1SWRsZVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wLFxuICAgICAgICBjcHVJZGxlUGVyYzogdGhpcy5zdGF0cy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKiAxMDAgLyB0b3RhbFJlbmRlclRpbWUsXG4gICAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgICAgIHJlc3VsdDogJ3Bhc3MnLFxuICAgICAgICBsb2dzOiB0aGlzLmxvZ3NcbiAgICAgIH07XG5cbiAgICAgIC8vIEB0b2RvIEluZGljYXRlIHNvbWVob3cgdGhhdCBubyByZWZlcmVuY2UgdGVzdCBoYXMgYmVlbiBwZXJmb3JtZWRcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snc2tpcC1yZWZlcmVuY2UtaW1hZ2UtdGVzdCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRvSW1hZ2VSZWZlcmVuY2VDaGVjaygpLnRoZW4ocmVmUmVzdWx0ID0+IHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgcmVmUmVzdWx0KTtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7ICBcbiAgICAgICAgfSkuY2F0Y2gocmVmUmVzdWx0ID0+IHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHJlc3VsdCwgcmVmUmVzdWx0KTtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGJlbmNobWFya0ZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHN0eWxlLmlubmVySFRNTCA9IGBcbiAgICAgICN0ZXN0X2ZpbmlzaGVkIHtcbiAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2RkZDtcbiAgICAgICAgYm90dG9tOiAwO1xuICAgICAgICBjb2xvcjogIzAwMDtcbiAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG4gICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICAgICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgICAgIGxlZnQ6IDA7XG4gICAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgICAgcmlnaHQ6IDA7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgei1pbmRleDogOTk5OTk7XG4gICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gICAgICB9XG4gICAgICBcbiAgICAgICN0ZXN0X2ZpbmlzaGVkLnBhc3Mge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjOWY5O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZC5mYWlsIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5OTtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfaW1hZ2VzIHtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMjBweDtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfaW1hZ2VzIGltZyB7XG4gICAgICAgIHdpZHRoOiAzMDBweDtcbiAgICAgICAgYm9yZGVyOiAxcHggc29saWQgIzAwNzA5NTtcbiAgICAgIH1cblxuICAgICAgLypcbiAgICAgICN0ZXN0X2ltYWdlcyBpbWc6aG92ZXIge1xuICAgICAgICB0b3A6IDBweDsgXG4gICAgICAgIGxlZnQ6IDBweDtcbiAgICAgICAgaGVpZ2h0OiA4MCU7IFxuICAgICAgICB3aWR0aDogODAlOyBcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgfVxuICAgICAgKi9cblxuICAgICAgI3Rlc3RfZmluaXNoZWQgLmJ1dHRvbiB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDcwOTU7XG4gICAgICAgIGJvcmRlci1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogMTBweDtcbiAgICAgICAgY29sb3I6ICNGRkZGRkY7XG4gICAgICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICBmb250LWZhbWlseTogXCJIZWx2ZXRpY2EgTmV1ZVwiLCBcIkhlbHZldGljYVwiLCBIZWx2ZXRpY2EsIEFyaWFsLCBzYW5zLXNlcmlmICFpbXBvcnRhbnQ7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgbGluZS1oZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBwYWRkaW5nOiAxMHB4IDFweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMzAwbXMgZWFzZS1vdXQ7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkIC5idXR0b246aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA3OGEwO1xuICAgICAgfVxuICAgIGA7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzdHlsZSk7XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LmlubmVySFRNTCA9IGA8aDE+VGVzdCBmaW5pc2hlZCE8L2gxPmA7XG4gICAgZGl2LmlkID0gJ3Rlc3RfZmluaXNoZWQnO1xuICAgIGRpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgXG4gICAgdmFyIGRpdlJlZmVyZW5jZUVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3IuaWQgPSAncmVmZXJlbmNlLWltYWdlcy1lcnJvcic7XG4gICAgZGl2UmVmZXJlbmNlRXJyb3Iuc3R5bGUuY3NzVGV4dCA9ICd0ZXh0LWFsaWduOmNlbnRlcjsgY29sb3I6ICNmMDA7J1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlubmVySFRNTCA9ICc8aDM+PC9oMz4nO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBkaXYuYXBwZW5kQ2hpbGQoZGl2UmVmZXJlbmNlRXJyb3IpO1xuICAgIHZhciBkaXZJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXZJbWcuaWQgPSAndGVzdF9pbWFnZXMnO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmFwcGVuZENoaWxkKGRpdkltZyk7XG5cbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICBpZiAodGhpcy5pbnB1dFJlY29yZGVyKSB7XG4gICAgICB0aGlzLmFkZElucHV0RG93bmxvYWRCdXR0b24oKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICB2YXIgZGVzY3JpcHRpb24gPSB0aGlzLmlucHV0UmVjb3JkZXIgPyAnRG93bmxvYWQgcmVmZXJlbmNlIGltYWdlJyA6ICdBY3R1YWwgcmVuZGVyJztcbiAgICAgIHRoaXMuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgR0ZYVEVTVFNfQ09ORklHLmlkLCBkZXNjcmlwdGlvbik7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2FuJ3QgZ2VuZXJhdGUgaW1hZ2VcIik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKS5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5nZW5lcmF0ZUJlbmNobWFya1Jlc3VsdCgpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc29ja2V0KSB7XG4gICAgICAgICAgaWYgKHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddKSB7XG4gICAgICAgICAgICByZXN1bHQudGVzdFVVSUQgPSBwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zb2NrZXQuZW1pdCgndGVzdF9maW5pc2gnLCByZXN1bHQpO1xuICAgICAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgICAgIGlmIChyZXN1bHQucmVzdWx0ID09PSAncGFzcycpIHtcbiAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBwYXNzZWQhJztcbiAgICAgICAgfVxuXG4gICAgICAgIGJlbmNobWFya0Rpdi5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCByZXN1bHQpO1xuICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNsb3NlICYmIHR5cGVvZiBwYXJhbWV0ZXJzWyduby1jbG9zZS1vbi1mYWlsJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgd2luZG93LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pOyAgXG4gICAgfVxuICB9LFxuXG4gIHdyYXBFcnJvcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiBldnQubG9ncy5jYXRjaEVycm9ycyA9IHtcbiAgICAgIG1lc3NhZ2U6IGV2dC5lcnJvci5tZXNzYWdlLFxuICAgICAgc3RhY2s6IGV2dC5lcnJvci5zdGFjayxcbiAgICAgIGxpbmVubzogZXZ0LmVycm9yLmxpbmVubyxcbiAgICAgIGZpbGVuYW1lOiBldnQuZXJyb3IuZmlsZW5hbWVcbiAgICB9KTtcblxuICAgIHZhciB3cmFwRnVuY3Rpb25zID0gWydlcnJvcicsJ3dhcm5pbmcnLCdsb2cnXTtcbiAgICB3cmFwRnVuY3Rpb25zLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZVtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBmbiA9IGNvbnNvbGVba2V5XS5iaW5kKGNvbnNvbGUpO1xuICAgICAgICBjb25zb2xlW2tleV0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGlmIChrZXkgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgIHRoaXMubG9ncy5lcnJvcnMucHVzaChhcmdzKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3dhcm5pbmcnKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3Mud2FybmluZ3MucHVzaChhcmdzKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnNlbmRMb2cpXG4gICAgICAgICAgICBURVNURVIuc29ja2V0LmVtaXQoJ2xvZycsIGFyZ3MpO1xuXG4gICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5mb092ZXJsYXk6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGl2T3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2T3ZlcmxheS5zdHlsZS5jc3NUZXh0ID0gYFxuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIHRvcDogMDtcbiAgICAgICAgZm9udC1mYW1pbHk6IE1vbm9zcGFjZTtcbiAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoOTUsIDQwLCAxMzYpO1xuICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgcGFkZGluZzogNXB4YDtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGl2T3ZlcmxheSk7XG4gICAgICBkaXZPdmVybGF5LmlubmVyVGV4dCA9IHBhcmFtZXRlcnNbJ2luZm8tb3ZlcmxheSddO1xuICAgIH0pXG4gIH0sXG5cbiAgYWRkUHJvZ3Jlc3NCYXI6IGZ1bmN0aW9uKCkge1xuICAgIG9uUmVhZHkoKCkgPT4ge1xuICAgICAgdmFyIGRpdlByb2dyZXNzQmFycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgZGl2UHJvZ3Jlc3NCYXJzLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAwOyBib3R0b206IDA7IGJhY2tncm91bmQtY29sb3I6ICMzMzM7IHdpZHRoOiAyMDBweDsgcGFkZGluZzogNXB4IDVweCAwcHggNXB4Oyc7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzQmFycyk7XG5cbiAgICAgIHZhciBvcmRlckdsb2JhbCA9IHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddO1xuICAgICAgdmFyIHRvdGFsR2xvYmFsID0gcGFyYW1ldGVyc1sndG90YWwtZ2xvYmFsJ107XG4gICAgICB2YXIgcGVyY0dsb2JhbCA9IE1hdGgucm91bmQob3JkZXJHbG9iYWwvdG90YWxHbG9iYWwgKiAxMDApO1xuICAgICAgdmFyIG9yZGVyVGVzdCA9IHBhcmFtZXRlcnNbJ29yZGVyLXRlc3QnXTtcbiAgICAgIHZhciB0b3RhbFRlc3QgPSBwYXJhbWV0ZXJzWyd0b3RhbC10ZXN0J107XG4gICAgICB2YXIgcGVyY1Rlc3QgPSBNYXRoLnJvdW5kKG9yZGVyVGVzdC90b3RhbFRlc3QgKiAxMDApO1xuXG4gICAgICBmdW5jdGlvbiBhZGRQcm9ncmVzc0JhclNlY3Rpb24odGV4dCwgY29sb3IsIHBlcmMsIGlkKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQ9J3dpZHRoOiAxMDAlOyBoZWlnaHQ6IDIwcHg7IG1hcmdpbi1ib3R0b206IDVweDsgb3ZlcmZsb3c6IGhpZGRlbjsgYmFja2dyb3VuZC1jb2xvcjogI2Y1ZjVmNTsnO1xuICAgICAgICBkaXZQcm9ncmVzc0JhcnMuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICB2YXIgZGl2UHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRpdlByb2dyZXNzKTtcbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgZGl2UHJvZ3Jlc3MuaWQgPSBpZDtcbiAgICAgICAgfVxuICAgICAgICBkaXZQcm9ncmVzcy5zdHlsZS5jc3NUZXh0PWBcbiAgICAgICAgICB3aWR0aDogJHtwZXJjfSU7YmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcn0gZmxvYXQ6IGxlZnQ7XG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XG4gICAgICAgICAgY29sb3I6ICNmZmY7XG4gICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMzMzdhYjc7XG4gICAgICAgICAgLXdlYmtpdC1ib3gtc2hhZG93OiBpbnNldCAwIC0xcHggMCByZ2JhKDAsMCwwLC4xNSk7XG4gICAgICAgICAgYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgLW8tdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7XG4gICAgICAgICAgdHJhbnNpdGlvbjogd2lkdGggLjZzIGVhc2U7YDtcbiAgICAgICAgICBkaXZQcm9ncmVzcy5pbm5lclRleHQgPSB0ZXh0OztcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKGAke29yZGVyVGVzdH0vJHt0b3RhbFRlc3R9ICR7cGVyY1Rlc3R9JWAsICcjNWJjMGRlJywgcGVyY1Rlc3QpO1xuICAgICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oYCR7b3JkZXJHbG9iYWx9LyR7dG90YWxHbG9iYWx9ICR7cGVyY0dsb2JhbH0lYCwgJyMzMzdhYjcnLCBwZXJjR2xvYmFsKTtcbiAgICAgIH1cblxuICAgICAgYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKCcnLCAnIzMzN2FiNycsIDAsICdudW1mcmFtZXMnKTtcbiAgICAgIHRoaXMuZnJhbWVQcm9ncmVzc0JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdudW1mcmFtZXMnKTtcblxuICAgIH0pO1xuICB9LFxuXG4gIGhvb2tNb2RhbHM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIEhvb2sgbW9kYWxzOiBUaGlzIGlzIGFuIHVuYXR0ZW5kZWQgcnVuLCBkb24ndCBhbGxvdyB3aW5kb3cuYWxlcnQoKXMgdG8gaW50cnVkZS5cbiAgICB3aW5kb3cuYWxlcnQgPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmFsZXJ0KCcgKyBtc2cgKyAnKScpOyB9XG4gICAgd2luZG93LmNvbmZpcm0gPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmNvbmZpcm0oJyArIG1zZyArICcpJyk7IHJldHVybiB0cnVlOyB9XG4gIH0sXG5cbiAgaG9va1JBRjogZnVuY3Rpb24gKCkge1xuICAgIGlmICghd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjYWxsYmFjayA9PiB7XG4gICAgICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gcCA9PiB7XG4gICAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCkgeyBcbiAgICAgICAgICAgIEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCgpOyBcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wcmVUaWNrKCk7XG4gICAgXG4gICAgICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICAgIHRoaXMudGljaygpO1xuICAgICAgICAgIHRoaXMuc3RhdHMuZnJhbWVFbmQoKTtcblxuICAgICAgICAgIHRoaXMucG9zdFRpY2soKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYmVuY2htYXJrRmluaXNoZWQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCkge1xuICAgICAgICAgICAgR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gICAgICB0aGlzLmhvb2tSQUYoKTtcbiAgICB9XG5cbiAgICB0aGlzLmFkZFByb2dyZXNzQmFyKCk7XG4gICAgdGhpcy5hZGRJbmZvT3ZlcmxheSgpO1xuXG4gICAgY29uc29sZS5sb2coJ0ZyYW1lcyB0byByZW5kZXI6JywgdGhpcy5udW1GcmFtZXNUb1JlbmRlcik7XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5kb250T3ZlcnJpZGVUaW1lKSB7XG4gICAgICBGYWtlVGltZXJzLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIE1hdGgucmFuZG9tID0gc2VlZHJhbmRvbSh0aGlzLnJhbmRvbVNlZWQpO1xuXG4gICAgdGhpcy5oYW5kbGVTaXplKCk7XG4gICAgQ2FudmFzSG9vay5lbmFibGUoT2JqZWN0LmFzc2lnbih7ZmFrZVdlYkdMOiB0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJnbCddICE9PSAndW5kZWZpbmVkJ30sIHRoaXMud2luZG93U2l6ZSkpO1xuICAgIHRoaXMuaG9va01vZGFscygpO1xuXG4gICAgdGhpcy5pbml0U2VydmVyKCk7XG5cbiAgICB0aGlzLnN0YXRzID0gbmV3IFBlcmZTdGF0cygpO1xuXG4gICAgdGhpcy5sb2dzID0ge1xuICAgICAgZXJyb3JzOiBbXSxcbiAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgIGNhdGNoRXJyb3JzOiBbXVxuICAgIH07XG4gICAgLy8gdGhpcy53cmFwRXJyb3JzKCk7XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcbiAgICAvL2lmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lci5lbmFibGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG4gICAgdGhpcy50aW1lU3RhcnQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gIH0sXG5cbiAgaW5qZWN0QXV0b0VudGVyWFI6IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgIGlmIChuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cykge1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzKCkudGhlbihkaXNwbGF5cyA9PiB7XG4gICAgICAgICAgdmFyIGRldmljZSA9IGRpc3BsYXlzWzBdO1xuICAgICAgICAgIC8vaWYgKGRldmljZS5pc1ByZXNlbnRpbmcpIGRldmljZS5leGl0UHJlc2VudCgpO1xuICAgICAgICAgIGRldmljZS5yZXF1ZXN0UHJlc2VudCggWyB7IHNvdXJjZTogY2FudmFzIH0gXSApO1xuICAgICAgICB9KSwgMjAwMH0pOyAvLyBAZml4IHRvIG1ha2UgaXQgd29yayBvbiBGeFJcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlU2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgREVGQVVMVF9XSURUSCA9IDgwMDtcbiAgICBjb25zdCBERUZBVUxUX0hFSUdIVCA9IDYwMDtcbiAgICB0aGlzLndpbmRvd1NpemUgPSB7fTtcbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ2tlZXAtd2luZG93LXNpemUnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMud2luZG93U2l6ZSA9IHtcbiAgICAgICAgd2lkdGg6IHR5cGVvZiBwYXJhbWV0ZXJzWyd3aWR0aCddID09PSAndW5kZWZpbmVkJyA/IERFRkFVTFRfV0lEVEggOiBwYXJzZUludChwYXJhbWV0ZXJzWyd3aWR0aCddKSxcbiAgICAgICAgaGVpZ2h0OiB0eXBlb2YgcGFyYW1ldGVyc1snaGVpZ2h0J10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9IRUlHSFQgOiBwYXJzZUludChwYXJhbWV0ZXJzWydoZWlnaHQnXSlcbiAgICAgIH1cbiAgICAgIHdpbmRvdy5pbm5lcldpZHRoID0gdGhpcy53aW5kb3dTaXplLndpZHRoO1xuICAgICAgd2luZG93LmlubmVySGVpZ2h0ID0gdGhpcy53aW5kb3dTaXplLmhlaWdodDtcbiAgICB9XG4gIH1cbn07XG5cblRFU1RFUi5pbml0KCk7XG5cbnZhciBwYWdlSW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4iXSwibmFtZXMiOlsiU3RhdHMiLCJ0aGlzIiwiZGVmaW5lIiwicmVxdWlyZSQkMCIsInNyIiwiZGVjb2RlIiwiZGVjb2RlQ29tcG9uZW50IiwiS2V5c3Ryb2tlVmlzdWFsaXplciIsIldlYkdMU3RhdHMiLCJwaXhlbG1hdGNoIiwic2VlZHJhbmRvbSIsIlBlcmZTdGF0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Q0FBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRCLE1BQU0sUUFBUSxDQUFDO0NBQ2YsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFO0NBQ2pCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZixHQUFHOztDQUVILEVBQUUsT0FBTyxHQUFHLEdBQUc7Q0FDZixJQUFJLE9BQU8sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQzFCLEdBQUc7O0NBRUgsRUFBRSxPQUFPLE9BQU8sR0FBRztDQUNuQixJQUFJLE9BQU8sUUFBUSxD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RUFBRTtDQUNoQixJQUFJLElBQUksR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNoQyxJQUFJLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0NBQ3BCO0NBQ0EsTUFBTSxPQUFPO0NBQ2IsS0FBSztDQUNMLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ2IsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztDQUN2QyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3ZDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7Q0FDcEIsSUFBSSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0NBQy9CLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztDQUN2RCxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxRQUFRLEtBQUssR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUMzRCxHQUFHOztDQUVILEVBQUUsTUFBTSxHQUFHO0NBQ1gsSUFBSSxPQUFPO0NBQ1gsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Q0FDZixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztDQUNuQixNQUFNLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtDQUNyQixNQUFNLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtD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Q0FLQSxDQUFDLFNBQVMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0NBRWxDLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRTtHQUNwQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7OztHQUdkLEVBQUUsQ0FBQyxJQUFJLEdBQUcsV0FBVzs7S0FFbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFJO0tBQ2hDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDNUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN4QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDdEMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3pELENBQUMsQ0FBQyxDQUFDLENB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Ozs7R0FHbEMsT0FBTyxDQUFDLEdBQUcsS0FBSyxFQUFFO0tBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUNaO0dBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7S0FDMUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWOzs7R0FHRCxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsU0FBUyxLQUFLLEVBQUU7O0tBRXRCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ1IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDakMsT0FBTyxLQUFLLEVBQUUsRUFBRTtPQUNkLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMxQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDekU7S0FDRCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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QUFFLENBQUMsQ0FBQztTQUN4QixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDaEMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ2pDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUM7U0FDM0IsTUFBTSxHQUFHLENBQUM7U0FDVixTQUFTLEdBQUcsQ0FBQztTQUNiLFNBQVMsR0FBRyxDQUFDO1NBQ2IsR0FBRyxHQUFHLENBQUM7U0FDUCxHQUFHLEdBQUcsQ0FBQztTQUNQLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzs7O0tBRzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7U0FDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTthQUMzQixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxTQUFTOzs7YUFHbkMsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDOzs7YUFHakUsSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO2tCQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUM7a0JBQzNCLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQzs7O2FBR2hDLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7YUFFN0IsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTOzs7YUFHcEIsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2lCQUNiLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2NBQ1o7O2FBRUQsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2lCQUNiLEdBQUcsR0FBRyxLQUFLLENBQUM7aUJBQ1osSUFBSSxHQUFHLENBQUMsQ0FBQztpQkFDVCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2NBQ1o7VUFDSjtNQUNKOztLQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxJQUFJLENBQUM7OztLQUd2QixJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRSxPQUFPLEtBQUssQ0FBQzs7OztLQUlyRCxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7YUFDN0YsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQzFHOzs7OztDQUtELFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7S0FDekMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHO1NBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUc7O1NBRXRCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDM0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUMzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztTQUUzQixFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1NBQzNCLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FDM0IsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7U0FFM0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztLQUU5QyxJQUFJLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzs7S0FFcEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBQ3pDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQzs7S0FFOUMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUMxRDs7Q0FFRCxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENB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
