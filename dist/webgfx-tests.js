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




	const isNullOrUndefined = value => value === null || value === undefined;

	function encoderForArrayFormat(options) {
		switch (options.arrayFormat) {
			case 'index':
				return key => (result, value) => {
					const index = result.length;

					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
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
					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
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
					if (
						value === undefined ||
						(options.skipNull && value === null) ||
						(options.skipEmptyString && value === '')
					) {
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
			value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
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

		const shouldFilter = key => (
			(options.skipNull && isNullOrUndefined(object[key])) ||
			(options.skipEmptyString && object[key] === '')
		);

		const formatter = encoderForArrayFormat(options);

		const objectCopy = {};

		for (const key of Object.keys(object)) {
			if (!shouldFilter(key)) {
				objectCopy[key] = object[key];
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

	    // console.log('ready', this.ready, 'xrready', this.XRready);
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

	      if (this.RAFs.length > 1) {
	        console.log('hookedCallback', this.RAFs);
	        console.log(callback);
	      }

	      // Push the callback to the list of currently running RAFs
	      if (this.RAFs.indexOf(callback) === -1 &&
	        this.RAFs.findIndex(f => f.toString() === callback.toString()) === -1) {
	        this.RAFs.push(callback);
	      }

	      // If the current callback is the first on the list, we assume the frame just started
	      if (this.RAFs[0] === callback) {
	        // console.log("pretick");
	        this.preTick();
	      }

	      if (frame) {
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
	                return baseLayer.oriGetViewport.apply(this, arguments);
	              }
	            };
	          }

	          if ( pose !== null ) {
	            var views = pose.views;
	            for ( var i = 0; i < views.length; i ++ ) {
	              var view = views[ i ];
	              if (!view.originalView) {
	                var transform = new XRRigidTransform(new DOMPoint(0, 1.6, 0, 1),new DOMPoint(0,0,0,1));
	                var newView = {
	                  eye: view.eye,
	                  projectionMatrix: view.projectionMatrix,
	                  transform: transform,
	                  originalView: view
	                };
	                newPose.views.push(newView);
	              } else {
	                newPose.views.push(view);
	              }
	            }
	          }
	          return newPose;
	        };
	      }
	      callback(performance.now(), frame);

	      // If reaching the last RAF, execute all the post code
	      if (this.RAFs[ this.RAFs.length - 1 ] === callback && this.started) {
	        // console.log("posttick", this.referenceTestFrameNumber);
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
	      if (this.prevRAFReference === callback && (this.RAFs[0] !== callback || this.RAFs.length > 1)) {
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

	    if ('autoenter-xr' in parameters) {
	      this.injectAutoEnterXR(this.canvas);
	      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
	        if (!supported) {
	          this.XRready = true;
	        }
	      });

	    } else {
	      this.XRready = true;
	    }
	/*
	    if (GFXTESTS_CONFIG.injectJS) {
	      function injectJS(url, where, onLoad, onError) {
	        var link = document.createElement('script');
	        link.src = '/tests/' + url;
	        link.charset = 'utf-8';
	        link.setAttribute('fxr-2dcontent-api', 'style');

	        if (onLoad) {
	          link.addEventListener('load', onLoad);
	        }

	        if (onError) {
	          link.addEventListener('error', onError);
	        }

	        if (where === "before") {
	          document.head.appendChild(link);
	        } else {
	          document.body.appendChild(link);
	        }
	      }

	      injectJS(GFXTESTS_CONFIG.injectJS.path, GFXTESTS_CONFIG.injectJS.where, ()=> {
	        console.log("Injected!");
	      },
	      () => {
	        console.error("Error injecting JS!");
	      }
	      );
	    }
	    */

	    /*
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
	*/

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViZ2Z4LXRlc3RzLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvZmFrZS10aW1lcnMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvY2FudmFzLWhvb2svZmFrZS13ZWJnbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jYW52YXMtaG9vay9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy93ZWJ4ci1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zdHJpY3QtdXJpLWVuY29kZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZWNvZGUtdXJpLWNvbXBvbmVudC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9zcGxpdC1vbi1maXJzdC9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9xdWVyeS1zdHJpbmcvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvaW5wdXQtZXZlbnRzLXJlY29yZGVyL3NyYy9yZWNvcmRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9pbnB1dC1ldmVudHMtcmVjb3JkZXIvc3JjL3JlcGxheWVyLmpzIiwiLi4vc3JjL2NsaWVudC9ldmVudC1saXN0ZW5lcnMuanMiLCIuLi9ub2RlX21vZHVsZXMva2V5c3Ryb2tlLXZpc3VhbGl6ZXIvc3JjL2luZGV4LmpzIiwiLi4vc3JjL2NsaWVudC9pbnB1dC1oZWxwZXJzLmpzIiwiLi4vc3JjL2NsaWVudC93ZWJhdWRpby1ob29rLmpzIiwiLi4vc3JjL2NsaWVudC93ZWJ2ci1ob29rLmpzIiwiLi4vc3JjL2NsaWVudC9pbWFnZS11dGlscy5qcyIsIi4uL25vZGVfbW9kdWxlcy9waXhlbG1hdGNoL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3dlYmdsLXN0YXRzL2luZGV4LmpzIiwiLi4vc3JjL2NsaWVudC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBSZWFsRGF0ZSA9IERhdGU7XG5cbmNsYXNzIE1vY2tEYXRlIHtcbiAgY29uc3RydWN0b3IodCkge1xuICAgIHRoaXMudCA9IHQ7XG4gIH1cblxuICBzdGF0aWMgbm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHN0YXRpYyByZWFsTm93KCkge1xuICAgIHJldHVybiBSZWFsRGF0ZS5ub3coKTtcbiAgfVxuXG4gIGdldFRpbWV6b25lT2Zmc2V0KCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdG9UaW1lU3RyaW5nKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIGdldERhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldERheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0RnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldEhvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldE1vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRUaW1lKCkgeyByZXR1cm4gMDsgfVxuICBnZXRZZWFyKCkgeyByZXR1cm4gMDsgfVxuXG4gIHN0YXRpYyBVVEMoKSB7IHJldHVybiAwOyB9XG5cbiAgZ2V0VVRDRGF0ZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRGF5KCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENGdWxsWWVhcigpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDSG91cnMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbGxpc2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDTW9udGgoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01pbnV0ZXMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ1NlY29uZHMoKSB7IHJldHVybiAwOyB9XG5cbiAgc2V0RGF0ZSgpIHt9XG4gIHNldEZ1bGxZZWFyKCkge31cbiAgc2V0SG91cnMoKSB7fVxuICBzZXRNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRNaW51dGVzKCkge31cbiAgc2V0TW9udGgoKSB7fVxuICBzZXRTZWNvbmRzKCkge31cbiAgc2V0VGltZSgpIHt9XG5cbiAgc2V0VVRDRGF0ZSgpIHt9XG4gIHNldFVUQ0Z1bGxZZWFyKCkge31cbiAgc2V0VVRDSG91cnMoKSB7fVxuICBzZXRVVENNaWxsaXNlY29uZHMoKSB7fVxuICBzZXRVVENNaW51dGVzKCkge31cbiAgc2V0VVRDTW9udGgoKSB7fVxuXG4gIHNldFllYXIoKSB7fVxufVxuXG52YXIgcmVhbFBlcmZvcm1hbmNlO1xuXG5pZiAoIXBlcmZvcm1hbmNlLnJlYWxOb3cpIHtcbiAgdmFyIGlzU2FmYXJpID0gL14oKD8hY2hyb21lfGFuZHJvaWQpLikqc2FmYXJpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzU2FmYXJpKSB7XG4gICAgcmVhbFBlcmZvcm1hbmNlID0gcGVyZm9ybWFuY2U7XG4gICAgcGVyZm9ybWFuY2UgPSB7XG4gICAgICByZWFsTm93OiBmdW5jdGlvbigpIHsgcmV0dXJuIHJlYWxQZXJmb3JtYW5jZS5ub3coKTsgfSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHBlcmZvcm1hbmNlLnJlYWxOb3cgPSBwZXJmb3JtYW5jZS5ub3c7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICB0aW1lU2NhbGU6IDEuMCxcbiAgZmFrZWRUaW1lOiAwLFxuICBlbmFibGVkOiBmYWxzZSxcbiAgcmVmcmVzaFJhdGU6IDYwLFxuICBuZWVkc0Zha2VNb25vdG9ub3VzbHlJbmNyZWFzaW5nVGltZXI6IGZhbHNlLFxuICBzZXRGYWtlZFRpbWU6IGZ1bmN0aW9uKCBuZXdGYWtlZFRpbWUgKSB7XG4gICAgdGhpcy5mYWtlZFRpbWUgPSBuZXdGYWtlZFRpbWU7XG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIERhdGUgPSBNb2NrRGF0ZTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5uZWVkc0Zha2VNb25vdG9ub3VzbHlJbmNyZWFzaW5nVGltZXIpIHtcbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmZha2VkVGltZSAqIDEwMDAuMCAqIHNlbGYudGltZVNjYWxlIC8gc2VsZi5yZWZyZXNoUmF0ZTsgfVxuICAgIH1cblxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWU7XG4gIH0sXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgeyByZXR1cm47IH07XG5cbiAgICBEYXRlID0gUmVhbERhdGU7XG4gICAgcGVyZm9ybWFuY2Uubm93ID0gcmVhbFBlcmZvcm1hbmNlLm5vdztcblxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59IiwiY29uc3Qgb3JpZ2luYWwgPSBbJ2dldFBhcmFtZXRlcicsICdnZXRFeHRlbnNpb24nLCAnZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0J107XG5jb25zdCBlbXB0eVN0cmluZyA9IFsnZ2V0U2hhZGVySW5mb0xvZycsICdnZXRQcm9ncmFtSW5mb0xvZyddO1xuY29uc3QgcmV0dXJuMSA9IFsnaXNCdWZmZXInLCAnaXNFbmFibGVkJywgJ2lzRnJhbWVidWZmZXInLCAnaXNQcm9ncmFtJywgJ2lzUXVlcnknLCAnaXNWZXJ0ZXhBcnJheScsICdpc1NhbXBsZXInLCAnaXNTeW5jJywgJ2lzVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2lzUmVuZGVyYnVmZmVyJywgJ2lzU2hhZGVyJywgJ2lzVGV4dHVyZScsICd2YWxpZGF0ZVByb2dyYW0nLCAnZ2V0U2hhZGVyUGFyYW1ldGVyJywgJ2dldFByb2dyYW1QYXJhbWV0ZXInXTtcbmNvbnN0IHJldHVybjAgPSBbJ2lzQ29udGV4dExvc3QnLCAnZmluaXNoJywgJ2ZsdXNoJywgJ2dldEVycm9yJywgJ2VuZFRyYW5zZm9ybUZlZWRiYWNrJywgJ3BhdXNlVHJhbnNmb3JtRmVlZGJhY2snLCAncmVzdW1lVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2FjdGl2ZVRleHR1cmUnLCAnYmxlbmRFcXVhdGlvbicsICdjbGVhcicsICdjbGVhckRlcHRoJywgJ2NsZWFyU3RlbmNpbCcsICdjb21waWxlU2hhZGVyJywgJ2N1bGxGYWNlJywgJ2RlbGV0ZUJ1ZmZlcicsXG4nZGVsZXRlRnJhbWVidWZmZXInLCAnZGVsZXRlUHJvZ3JhbScsICdkZWxldGVSZW5kZXJidWZmZXInLCAnZGVsZXRlU2hhZGVyJywgJ2RlbGV0ZVRleHR1cmUnLCAnZGVwdGhGdW5jJywgJ2RlcHRoTWFzaycsICdkaXNhYmxlJywgJ2Rpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheScsXG4nZW5hYmxlJywgJ2VuYWJsZVZlcnRleEF0dHJpYkFycmF5JywgJ2Zyb250RmFjZScsICdnZW5lcmF0ZU1pcG1hcCcsICdsaW5lV2lkdGgnLCAnbGlua1Byb2dyYW0nLCAnc3RlbmNpbE1hc2snLCAndXNlUHJvZ3JhbScsICdkZWxldGVRdWVyeScsICdkZWxldGVWZXJ0ZXhBcnJheScsXG4nYmluZFZlcnRleEFycmF5JywgJ2RyYXdCdWZmZXJzJywgJ3JlYWRCdWZmZXInLCAnZW5kUXVlcnknLCAnZGVsZXRlU2FtcGxlcicsICdkZWxldGVTeW5jJywgJ2RlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrJywgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snLFxuJ2F0dGFjaFNoYWRlcicsICdiaW5kQnVmZmVyJywgJ2JpbmRGcmFtZWJ1ZmZlcicsICdiaW5kUmVuZGVyYnVmZmVyJywgJ2JpbmRUZXh0dXJlJywgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZScsICdibGVuZEZ1bmMnLCAnZGVwdGhSYW5nZScsICdkZXRhY2hTaGFkZXInLCAnaGludCcsXG4ncGl4ZWxTdG9yZWknLCAncG9seWdvbk9mZnNldCcsICdzYW1wbGVDb3ZlcmFnZScsICdzaGFkZXJTb3VyY2UnLCAnc3RlbmNpbE1hc2tTZXBhcmF0ZScsICd1bmlmb3JtMWYnLCAndW5pZm9ybTFmdicsICd1bmlmb3JtMWknLCAndW5pZm9ybTFpdicsXG4ndW5pZm9ybTJmdicsICd1bmlmb3JtMml2JywgJ3VuaWZvcm0zZnYnLCAndW5pZm9ybTNpdicsICd1bmlmb3JtNGZ2JywgJ3VuaWZvcm00aXYnLCAndmVydGV4QXR0cmliMWYnLCAndmVydGV4QXR0cmliMWZ2JywgJ3ZlcnRleEF0dHJpYjJmdicsICd2ZXJ0ZXhBdHRyaWIzZnYnLFxuJ3ZlcnRleEF0dHJpYjRmdicsICd2ZXJ0ZXhBdHRyaWJEaXZpc29yJywgJ2JlZ2luUXVlcnknLCAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJywgJ3VuaWZvcm0xdWknLCAndW5pZm9ybTF1aXYnLCAndW5pZm9ybTJ1aXYnLCAndW5pZm9ybTN1aXYnLCAndW5pZm9ybTR1aXYnLFxuJ3ZlcnRleEF0dHJpYkk0aXYnLCAndmVydGV4QXR0cmliSTR1aXYnLCAnYmluZFNhbXBsZXInLCAnZmVuY2VTeW5jJywgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjaycsXG4nYmluZEF0dHJpYkxvY2F0aW9uJywgJ2J1ZmZlckRhdGEnLCAnYnVmZmVyU3ViRGF0YScsICdkcmF3QXJyYXlzJywgJ3N0ZW5jaWxGdW5jJywgJ3N0ZW5jaWxPcCcsICd0ZXhQYXJhbWV0ZXJmJywgJ3RleFBhcmFtZXRlcmknLCAndW5pZm9ybTJmJywgJ3VuaWZvcm0yaScsXG4ndW5pZm9ybU1hdHJpeDJmdicsICd1bmlmb3JtTWF0cml4M2Z2JywgJ3VuaWZvcm1NYXRyaXg0ZnYnLCAndmVydGV4QXR0cmliMmYnLCAndW5pZm9ybTJ1aScsICd1bmlmb3JtTWF0cml4MngzZnYnLCAndW5pZm9ybU1hdHJpeDN4MmZ2Jyxcbid1bmlmb3JtTWF0cml4Mng0ZnYnLCAndW5pZm9ybU1hdHJpeDR4MmZ2JywgJ3VuaWZvcm1NYXRyaXgzeDRmdicsICd1bmlmb3JtTWF0cml4NHgzZnYnLCAnY2xlYXJCdWZmZXJpdicsICdjbGVhckJ1ZmZlcnVpdicsICdjbGVhckJ1ZmZlcmZ2JywgJ3NhbXBsZXJQYXJhbWV0ZXJpJyxcbidzYW1wbGVyUGFyYW1ldGVyZicsICdjbGllbnRXYWl0U3luYycsICd3YWl0U3luYycsICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJywgJ2JpbmRCdWZmZXJCYXNlJywgJ3VuaWZvcm1CbG9ja0JpbmRpbmcnLFxuJ2JsZW5kQ29sb3InLCAnYmxlbmRGdW5jU2VwYXJhdGUnLCAnY2xlYXJDb2xvcicsICdjb2xvck1hc2snLCAnZHJhd0VsZW1lbnRzJywgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJywgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnLCAnc2Npc3NvcicsICdzdGVuY2lsRnVuY1NlcGFyYXRlJyxcbidzdGVuY2lsT3BTZXBhcmF0ZScsICd1bmlmb3JtM2YnLCAndW5pZm9ybTNpJywgJ3ZlcnRleEF0dHJpYjNmJywgJ3ZpZXdwb3J0JywgJ2RyYXdBcnJheXNJbnN0YW5jZWQnLCAndW5pZm9ybTN1aScsICdjbGVhckJ1ZmZlcmZpJyxcbidmcmFtZWJ1ZmZlclRleHR1cmUyRCcsICd1bmlmb3JtNGYnLCAndW5pZm9ybTRpJywgJ3ZlcnRleEF0dHJpYjRmJywgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCcsICdjb3B5QnVmZmVyU3ViRGF0YScsICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcicsXG4ncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJywgJ3RleFN0b3JhZ2UyRCcsICd1bmlmb3JtNHVpJywgJ3ZlcnRleEF0dHJpYkk0aScsICd2ZXJ0ZXhBdHRyaWJJNHVpJywgJ3ZlcnRleEF0dHJpYklQb2ludGVyJywgJ2JpbmRCdWZmZXJSYW5nZScsXG4ndGV4SW1hZ2UyRCcsICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJywgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcicsICd0ZXhTdG9yYWdlM0QnLCAnZHJhd1JhbmdlRWxlbWVudHMnLFxuJ2NvbXByZXNzZWRUZXhJbWFnZTJEJywgJ3JlYWRQaXhlbHMnLCAndGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCcsICdjb3B5VGV4SW1hZ2UyRCcsICdjb3B5VGV4U3ViSW1hZ2UyRCcsICdjb21wcmVzc2VkVGV4SW1hZ2UzRCcsXG4nY29weVRleFN1YkltYWdlM0QnLCAnYmxpdEZyYW1lYnVmZmVyJywgJ3RleEltYWdlM0QnLCAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnLCAndGV4U3ViSW1hZ2UzRCddO1xuY29uc3QgbnVsbHMgPSBbXTtcblxuLy8gZ2wuSU5UID0gNTEyNFxuY29uc3QgY3VzdG9tRnVuY3Rpb25zID0ge1xuXHRnZXRBY3RpdmVVbmlmb3JtOiAoKSA9PiB7IHJldHVybiB7bmFtZTogXCJcIiwgc2l6ZTogMSwgdHlwZTogNTEyNH07IH0sXG5cdGdldEFjdGl2ZUF0dHJpYjogKCkgPT4geyByZXR1cm4ge25hbWU6IFwiXCIsIHNpemU6IDEsIHR5cGU6IDUxMjR9OyB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmFrZVdlYkdMKGdsKSB7XG5cdHRoaXMuZ2wgPSBnbDtcblx0Zm9yICh2YXIga2V5IGluIGdsKSB7XG5cdFx0aWYgKHR5cGVvZiBnbFtrZXldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpZiAob3JpZ2luYWwuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIGlmIChudWxscy5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIG51bGw7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMC5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDA7fTtcblx0XHRcdH0gZWxzZSBpZiAocmV0dXJuMS5pbmRleE9mKGtleSkgIT09IC0xKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGZ1bmN0aW9uKCl7cmV0dXJuIDE7fTtcblx0XHRcdH0gZWxzZSBpZiAoZW1wdHlTdHJpbmcuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuXHRcdFx0XHR0aGlzW2tleV0gPSBmdW5jdGlvbigpe3JldHVybiAnJzt9O1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY3VzdG9tRnVuY3Rpb25zW2tleV0gIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRoaXNba2V5XSA9IGN1c3RvbUZ1bmN0aW9uc1trZXldLmJpbmQoZ2wpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gdGhpc1trZXldID0gZnVuY3Rpb24oKXt9O1xuXHRcdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldLmJpbmQoZ2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzW2tleV0gPSBnbFtrZXldO1xuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IEZha2VXZWJHTCBmcm9tICcuL2Zha2Utd2ViZ2wnO1xuXG52YXIgb3JpZ2luYWxHZXRDb250ZXh0ID0gSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQ7XG5pZiAoIUhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0UmF3KSB7XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcgPSBvcmlnaW5hbEdldENvbnRleHQ7XG59XG5cbnZhciBlbmFibGVkID0gZmFsc2U7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgd2ViZ2xDb250ZXh0czogW10sXG4gIGNhbnZhczJkQ29udGV4dHM6IFtdLFxuICBjb250ZXh0czogW10sXG4gIGdldE51bUNvbnRleHRzOiBmdW5jdGlvbih0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid2ViZ2xcIikge1xuICAgICAgcmV0dXJuIHRoaXMud2ViZ2xDb250ZXh0cy5sZW5ndGg7XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIjJkXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbnZhczJkQ29udGV4dHMubGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbnRleHRzLmxlbmd0aDtcbiAgfSxcbiAgZ2V0Q29udGV4dDogZnVuY3Rpb24oaWR4LCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid2ViZ2xcIikge1xuICAgICAgcmV0dXJuIHRoaXMud2ViZ2xDb250ZXh0c1tpZHhdO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCIyZFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYW52YXMyZENvbnRleHRzW2lkeF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29udGV4dHNbaWR4XTtcbiAgfSxcbiAgaXNXZWJHTENvbnRleHQ6IGZ1bmN0aW9uKGN0eCkge1xuICAgIHJldHVybiAoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKTtcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmIChlbmFibGVkKSB7cmV0dXJuO31cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN0eCA9IG9yaWdpbmFsR2V0Q29udGV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKHNlbGYuaXNXZWJHTENvbnRleHQoY3R4KSkge1xuICAgICAgICBzZWxmLndlYmdsQ29udGV4dHMucHVzaChjdHgpO1xuICAgICAgICBzZWxmLmNvbnRleHRzLnB1c2goY3R4KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5mYWtlV2ViR0wpIHtcbiAgICAgICAgICBjdHggPSBuZXcgRmFrZVdlYkdMKGN0eCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoKGN0eCBpbnN0YW5jZW9mIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkpIHtcbiAgICAgICAgc2VsZi5jYW52YXMyZENvbnRleHRzLnB1c2goY3R4KTtcbiAgICAgICAgc2VsZi5jb250ZXh0cy5wdXNoKGN0eCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY3R4O1xuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy53aWR0aCAmJiBvcHRpb25zLmhlaWdodCkge1xuICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICAgICAgdGhpcy5zdHlsZS5jc3NUZXh0ID0gJ3dpZHRoOiAnICsgb3B0aW9ucy53aWR0aCArICdweDsgaGVpZ2h0OiAnICsgb3B0aW9ucy5oZWlnaHQgKyAncHgnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0eDtcbiAgICB9XG4gICAgZW5hYmxlZCA9IHRydWU7XG4gIH0sXG5cbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghZW5hYmxlZCkge3JldHVybjt9XG4gICAgSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHQgPSBvcmlnaW5hbEdldENvbnRleHQ7XG4gICAgZW5hYmxlZCA9IGZhbHNlO1xuICB9XG59OyIsInZhciBvcmlnaW5hbFJlcXVlc3RQcmVzZW50ID0gbmF2aWdhdG9yLnhyLnJlcXVlc3RTZXNzaW9uO1xuXG52YXIgZW5hYmxlZCA9IGZhbHNlO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHNlc3Npb25zOiBbXSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmIChlbmFibGVkKSB7cmV0dXJuO31cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBuYXZpZ2F0b3IueHIucmVxdWVzdFNlc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZXMgPSBvcmlnaW5hbFJlcXVlc3RQcmVzZW50LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXMudGhlbihzZXNzaW9uID0+IHtcbiAgICAgICAgc2VsZi5zZXNzaW9ucy5wdXNoKHNlc3Npb24pO1xuICAgICAgICBzZXNzaW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZCcsIGV2ZW50ID0+IHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5vblNlc3Npb25FbmQpIHtcbiAgICAgICAgICAgIG9wdGlvbnMub25TZXNzaW9uRW5kKGV2ZW50LnNlc3Npb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMub25TZXNzaW9uU3RhcnRlZCkge1xuICAgICAgICAgIG9wdGlvbnMub25TZXNzaW9uU3RhcnRlZChzZXNzaW9uKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cbiAgfSxcblxuICBkaXNhYmxlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcbiAgICBuYXZpZ2F0b3IueHIucmVxdWVzdFNlc3Npb24gPSBvcmlnaW5hbFJlcXVlc3RQcmVzZW50O1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufSIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZXJmU3RhdHMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm4gPSAwO1xuICAgIHRoaXMubWluID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLm1heCA9IC1OdW1iZXIuTUFYX1ZBTFVFO1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLm1lYW4gPSAwO1xuICAgIHRoaXMucSA9IDA7XG4gIH1cblxuICBnZXQgdmFyaWFuY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMucSAvIHRoaXMubjtcbiAgfVxuXG4gIGdldCBzdGFuZGFyZF9kZXZpYXRpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnEgLyB0aGlzLm4pO1xuICB9XG5cbiAgdXBkYXRlKHZhbHVlKSB7XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgIGlmIChpc05hTihudW0pKSB7XG4gICAgICAvLyBTb3JyeSwgbm8gTmFOc1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLm4rKztcbiAgICB0aGlzLm1pbiA9IE1hdGgubWluKHRoaXMubWluLCBudW0pO1xuICAgIHRoaXMubWF4ID0gTWF0aC5tYXgodGhpcy5tYXgsIG51bSk7XG4gICAgdGhpcy5zdW0gKz0gbnVtO1xuICAgIGNvbnN0IHByZXZNZWFuID0gdGhpcy5tZWFuO1xuICAgIHRoaXMubWVhbiA9IHRoaXMubWVhbiArIChudW0gLSB0aGlzLm1lYW4pIC8gdGhpcy5uO1xuICAgIHRoaXMucSA9IHRoaXMucSArIChudW0gLSBwcmV2TWVhbikgKiAobnVtIC0gdGhpcy5tZWFuKTtcbiAgfVxuXG4gIGdldEFsbCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbjogdGhpcy5uLFxuICAgICAgbWluOiB0aGlzLm1pbixcbiAgICAgIG1heDogdGhpcy5tYXgsXG4gICAgICBzdW06IHRoaXMuc3VtLFxuICAgICAgbWVhbjogdGhpcy5tZWFuLFxuICAgICAgdmFyaWFuY2U6IHRoaXMudmFyaWFuY2UsXG4gICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgfTtcbiAgfSAgXG59XG4iLCJpbXBvcnQgU3RhdHMgZnJvbSAnaW5jcmVtZW50YWwtc3RhdHMtbGl0ZSc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gVEVTVFNUQVRTXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgZmlyc3RGcmFtZSA9IHRydWU7XG4gIHZhciBmaXJzdEZwcyA9IHRydWU7XG5cbiAgdmFyIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IDA7XG4gIHZhciBwcmV2aW91c0ZyYW1lRW5kVGltZTtcbiAgdmFyIGxhc3RVcGRhdGVUaW1lID0gbnVsbDtcblxuICAvLyBVc2VkIHRvIGRldGVjdCByZWN1cnNpdmUgZW50cmllcyB0byB0aGUgbWFpbiBsb29wLCB3aGljaCBjYW4gaGFwcGVuIGluIGNlcnRhaW4gY29tcGxleCBjYXNlcywgZS5nLiBpZiBub3QgdXNpbmcgckFGIHRvIHRpY2sgcmVuZGVyaW5nIHRvIHRoZSBjYW52YXMuXG4gIHZhciBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgPSAwO1xuXG4gIHJldHVybiB7XG4gICAgZ2V0U3RhdHNTdW1tYXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnN0YXRzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0ge1xuICAgICAgICAgIG1pbjogdGhpcy5zdGF0c1trZXldLm1pbixcbiAgICAgICAgICBtYXg6IHRoaXMuc3RhdHNba2V5XS5tYXgsXG4gICAgICAgICAgYXZnOiB0aGlzLnN0YXRzW2tleV0ubWVhbixcbiAgICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHRoaXMuc3RhdHNba2V5XS5zdGFuZGFyZF9kZXZpYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG5cbiAgICBzdGF0czoge1xuICAgICAgZnBzOiBuZXcgU3RhdHMoKSxcbiAgICAgIGR0OiBuZXcgU3RhdHMoKSxcbiAgICAgIGNwdTogbmV3IFN0YXRzKCkgICAgICAgIFxuICAgIH0sXG5cbiAgICBudW1GcmFtZXM6IDAsXG4gICAgbG9nOiBmYWxzZSxcbiAgICB0b3RhbFRpbWVJbk1haW5Mb29wOiAwLFxuICAgIHRvdGFsVGltZU91dHNpZGVNYWluTG9vcDogMCxcbiAgICBmcHNDb3VudGVyVXBkYXRlSW50ZXJ2YWw6IDIwMCwgLy8gbXNlY3NcblxuICAgIGZyYW1lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyKys7XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID09IDEpIFxuICAgICAge1xuICAgICAgICBpZiAobGFzdFVwZGF0ZVRpbWUgPT09IG51bGwpIHtcbiAgICAgICAgICBsYXN0VXBkYXRlVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRGcmFtZVN0YXJ0VGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0cygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVTdGF0czogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICAgICAgdGhpcy5udW1GcmFtZXMrKztcblxuICAgICAgaWYgKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSA+IHRoaXMuZnBzQ291bnRlclVwZGF0ZUludGVydmFsKVxuICAgICAge1xuICAgICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXMgKiAxMDAwIC8gKHRpbWVOb3cgLSBsYXN0VXBkYXRlVGltZSk7XG4gICAgICAgIHRoaXMubnVtRnJhbWVzID0gMDtcbiAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSB0aW1lTm93O1xuXG4gICAgICAgIGlmIChmaXJzdEZwcylcbiAgICAgICAge1xuICAgICAgICAgIGZpcnN0RnBzID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0cy5mcHMudXBkYXRlKGZwcyk7XG5cbiAgICAgICAgaWYgKHRoaXMubG9nKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYGZwcyAtIG1pbjogJHt0aGlzLnN0YXRzLmZwcy5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5mcHMubWVhbi50b0ZpeGVkKDIpfSAvIG1heDogJHt0aGlzLnN0YXRzLmZwcy5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5mcHMuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYG1zICAtIG1pbjogJHt0aGlzLnN0YXRzLmR0Lm1pbi50b0ZpeGVkKDIpfSAvIGF2ZzogJHt0aGlzLnN0YXRzLmR0Lm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5kdC5tYXgudG9GaXhlZCgyKX0gLSBzdGQ6ICR7dGhpcy5zdGF0cy5kdC5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX1gKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgY3B1IC0gbWluOiAke3RoaXMuc3RhdHMuY3B1Lm1pbi50b0ZpeGVkKDIpfSUgLyBhdmc6ICR7dGhpcy5zdGF0cy5jcHUubWVhbi50b0ZpeGVkKDIpfSUgLyBtYXg6ICR7dGhpcy5zdGF0cy5jcHUubWF4LnRvRml4ZWQoMil9JSAtIHN0ZDogJHt0aGlzLnN0YXRzLmNwdS5zdGFuZGFyZF9kZXZpYXRpb24udG9GaXhlZCgyKX0lYCk7XG4gICAgICAgICAgY29uc29sZS5sb2coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpOyAgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gQ2FsbGVkIGluIHRoZSBlbmQgb2YgZWFjaCBtYWluIGxvb3AgZnJhbWUgdGljay5cbiAgICBmcmFtZUVuZDogZnVuY3Rpb24oKSB7XG4gICAgICBpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXItLTtcbiAgICAgIGlmIChpbnNpZGVNYWluTG9vcFJlY3Vyc2lvbkNvdW50ZXIgIT0gMCkgcmV0dXJuO1xuXG4gICAgICB2YXIgdGltZU5vdyA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIHZhciBjcHVNYWluTG9vcER1cmF0aW9uID0gdGltZU5vdyAtIGN1cnJlbnRGcmFtZVN0YXJ0VGltZTtcbiAgICAgIHZhciBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMgPSB0aW1lTm93IC0gcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gICAgICBwcmV2aW91c0ZyYW1lRW5kVGltZSA9IHRpbWVOb3c7XG4gIFxuICAgICAgaWYgKGZpcnN0RnJhbWUpIHtcbiAgICAgICAgZmlyc3RGcmFtZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMudG90YWxUaW1lSW5NYWluTG9vcCArPSBjcHVNYWluTG9vcER1cmF0aW9uO1xuICAgICAgdGhpcy50b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3AgKz0gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzIC0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcblxuICAgICAgdmFyIGNwdSA9IGNwdU1haW5Mb29wRHVyYXRpb24gKiAxMDAgLyBkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXM7XG4gICAgICB0aGlzLnN0YXRzLmNwdS51cGRhdGUoY3B1KTtcbiAgICAgIHRoaXMuc3RhdHMuZHQudXBkYXRlKGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyk7XG4gICAgfVxuICB9XG59OyIsIi8vIEEgcG9ydCBvZiBhbiBhbGdvcml0aG0gYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5jb20+LCAyMDEwXG4vLyBodHRwOi8vYmFhZ29lLmNvbS9lbi9SYW5kb21NdXNpbmdzL2phdmFzY3JpcHQvXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbnF1aW5sYW4vYmV0dGVyLXJhbmRvbS1udW1iZXJzLWZvci1qYXZhc2NyaXB0LW1pcnJvclxuLy8gT3JpZ2luYWwgd29yayBpcyB1bmRlciBNSVQgbGljZW5zZSAtXG5cbi8vIENvcHlyaWdodCAoQykgMjAxMCBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLm9yZz5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vLyBcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vIFxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cblxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBBbGVhKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgbWFzaCA9IE1hc2goKTtcblxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAyMDkxNjM5ICogbWUuczAgKyBtZS5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICBtZS5zMCA9IG1lLnMxO1xuICAgIG1lLnMxID0gbWUuczI7XG4gICAgcmV0dXJuIG1lLnMyID0gdCAtIChtZS5jID0gdCB8IDApO1xuICB9O1xuXG4gIC8vIEFwcGx5IHRoZSBzZWVkaW5nIGFsZ29yaXRobSBmcm9tIEJhYWdvZS5cbiAgbWUuYyA9IDE7XG4gIG1lLnMwID0gbWFzaCgnICcpO1xuICBtZS5zMSA9IG1hc2goJyAnKTtcbiAgbWUuczIgPSBtYXNoKCcgJyk7XG4gIG1lLnMwIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMCA8IDApIHsgbWUuczAgKz0gMTsgfVxuICBtZS5zMSAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczEgPCAwKSB7IG1lLnMxICs9IDE7IH1cbiAgbWUuczIgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMyIDwgMCkgeyBtZS5zMiArPSAxOyB9XG4gIG1hc2ggPSBudWxsO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5jID0gZi5jO1xuICB0LnMwID0gZi5zMDtcbiAgdC5zMSA9IGYuczE7XG4gIHQuczIgPSBmLnMyO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBBbGVhKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0geGcubmV4dDtcbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSAqIDB4MTAwMDAwMDAwKSB8IDA7IH1cbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcHJuZygpICsgKHBybmcoKSAqIDB4MjAwMDAwIHwgMCkgKiAxLjExMDIyMzAyNDYyNTE1NjVlLTE2OyAvLyAyXi01M1xuICB9O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuZnVuY3Rpb24gTWFzaCgpIHtcbiAgdmFyIG4gPSAweGVmYzgyNDlkO1xuXG4gIHZhciBtYXNoID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnRvU3RyaW5nKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIHZhciBoID0gMC4wMjUxOTYwMzI4MjQxNjkzOCAqIG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIGggKj0gbjtcbiAgICAgIG4gPSBoID4+PiAwO1xuICAgICAgaCAtPSBuO1xuICAgICAgbiArPSBoICogMHgxMDAwMDAwMDA7IC8vIDJeMzJcbiAgICB9XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH07XG5cbiAgcmV0dXJuIG1hc2g7XG59XG5cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy5hbGVhID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiB0aGUgXCJ4b3IxMjhcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gR2VvcmdlIE1hcnNhZ2xpYS4gIFNlZSBodHRwOi8vd3d3LmpzdGF0c29mdC5vcmcvdjA4L2kxNC9wYXBlclxuXG4oZnVuY3Rpb24oZ2xvYmFsLCBtb2R1bGUsIGRlZmluZSkge1xuXG5mdW5jdGlvbiBYb3JHZW4oc2VlZCkge1xuICB2YXIgbWUgPSB0aGlzLCBzdHJzZWVkID0gJyc7XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gbWUueCBeIChtZS54IDw8IDExKTtcbiAgICBtZS54ID0gbWUueTtcbiAgICBtZS55ID0gbWUuejtcbiAgICBtZS56ID0gbWUudztcbiAgICByZXR1cm4gbWUudyBePSAobWUudyA+Pj4gMTkpIF4gdCBeICh0ID4+PiA4KTtcbiAgfTtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjEyOCA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yd293XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IChtZS54IF4gKG1lLnggPj4+IDIpKTtcbiAgICBtZS54ID0gbWUueTsgbWUueSA9IG1lLno7IG1lLnogPSBtZS53OyBtZS53ID0gbWUudjtcbiAgICByZXR1cm4gKG1lLmQgPSAobWUuZCArIDM2MjQzNyB8IDApKSArXG4gICAgICAgKG1lLnYgPSAobWUudiBeIChtZS52IDw8IDQpKSBeICh0IF4gKHQgPDwgMSkpKSB8IDA7XG4gIH07XG5cbiAgbWUueCA9IDA7XG4gIG1lLnkgPSAwO1xuICBtZS56ID0gMDtcbiAgbWUudyA9IDA7XG4gIG1lLnYgPSAwO1xuXG4gIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLnggPSBzZWVkO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgNjQ7IGsrKykge1xuICAgIG1lLnggXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBpZiAoayA9PSBzdHJzZWVkLmxlbmd0aCkge1xuICAgICAgbWUuZCA9IG1lLnggPDwgMTAgXiBtZS54ID4+PiA0O1xuICAgIH1cbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueDtcbiAgdC55ID0gZi55O1xuICB0LnogPSBmLno7XG4gIHQudyA9IGYudztcbiAgdC52ID0gZi52O1xuICB0LmQgPSBmLmQ7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcndvdyA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yc2hpZnQ3XCIgYWxnb3JpdGhtIGJ5XG4vLyBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllcjpcbi8vIFwiT24gdGhlIFhvcmdzaGlmdCBSYW5kb20gTnVtYmVyIEdlbmVyYXRvcnNcIlxuLy8gaHR0cDovL3NhbHVjLmVuZ3IudWNvbm4uZWR1L3JlZnMvY3J5cHRvL3JuZy9wYW5uZXRvbjA1b250aGV4b3JzaGlmdC5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdmFyIFggPSBtZS54LCBpID0gbWUuaSwgdCwgdiwgdztcbiAgICB0ID0gWFtpXTsgdCBePSAodCA+Pj4gNyk7IHYgPSB0IF4gKHQgPDwgMjQpO1xuICAgIHQgPSBYWyhpICsgMSkgJiA3XTsgdiBePSB0IF4gKHQgPj4+IDEwKTtcbiAgICB0ID0gWFsoaSArIDMpICYgN107IHYgXj0gdCBeICh0ID4+PiAzKTtcbiAgICB0ID0gWFsoaSArIDQpICYgN107IHYgXj0gdCBeICh0IDw8IDcpO1xuICAgIHQgPSBYWyhpICsgNykgJiA3XTsgdCA9IHQgXiAodCA8PCAxMyk7IHYgXj0gdCBeICh0IDw8IDkpO1xuICAgIFhbaV0gPSB2O1xuICAgIG1lLmkgPSAoaSArIDEpICYgNztcbiAgICByZXR1cm4gdjtcbiAgfTtcblxuICBmdW5jdGlvbiBpbml0KG1lLCBzZWVkKSB7XG4gICAgdmFyIGosIHcsIFggPSBbXTtcblxuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIGFycmF5IHVzaW5nIGEgMzItYml0IGludGVnZXIuXG4gICAgICB3ID0gWFswXSA9IHNlZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFNlZWQgc3RhdGUgdXNpbmcgYSBzdHJpbmcuXG4gICAgICBzZWVkID0gJycgKyBzZWVkO1xuICAgICAgZm9yIChqID0gMDsgaiA8IHNlZWQubGVuZ3RoOyArK2opIHtcbiAgICAgICAgWFtqICYgN10gPSAoWFtqICYgN10gPDwgMTUpIF5cbiAgICAgICAgICAgIChzZWVkLmNoYXJDb2RlQXQoaikgKyBYWyhqICsgMSkgJiA3XSA8PCAxMyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEVuZm9yY2UgYW4gYXJyYXkgbGVuZ3RoIG9mIDgsIG5vdCBhbGwgemVyb2VzLlxuICAgIHdoaWxlIChYLmxlbmd0aCA8IDgpIFgucHVzaCgwKTtcbiAgICBmb3IgKGogPSAwOyBqIDwgOCAmJiBYW2pdID09PSAwOyArK2opO1xuICAgIGlmIChqID09IDgpIHcgPSBYWzddID0gLTE7IGVsc2UgdyA9IFhbal07XG5cbiAgICBtZS54ID0gWDtcbiAgICBtZS5pID0gMDtcblxuICAgIC8vIERpc2NhcmQgYW4gaW5pdGlhbCAyNTYgdmFsdWVzLlxuICAgIGZvciAoaiA9IDI1NjsgaiA+IDA7IC0taikge1xuICAgICAgbWUubmV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54LnNsaWNlKCk7XG4gIHQuaSA9IGYuaTtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLngpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3JzaGlmdDcgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG4iLCIvLyBBIEphdmFzY3JpcHQgaW1wbGVtZW50YWlvbiBvZiBSaWNoYXJkIEJyZW50J3MgWG9yZ2VucyB4b3I0MDk2IGFsZ29yaXRobS5cbi8vXG4vLyBUaGlzIGZhc3Qgbm9uLWNyeXB0b2dyYXBoaWMgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IgaXMgZGVzaWduZWQgZm9yXG4vLyB1c2UgaW4gTW9udGUtQ2FybG8gYWxnb3JpdGhtcy4gSXQgY29tYmluZXMgYSBsb25nLXBlcmlvZCB4b3JzaGlmdFxuLy8gZ2VuZXJhdG9yIHdpdGggYSBXZXlsIGdlbmVyYXRvciwgYW5kIGl0IHBhc3NlcyBhbGwgY29tbW9uIGJhdHRlcmllc1xuLy8gb2Ygc3Rhc3RpY2lhbCB0ZXN0cyBmb3IgcmFuZG9tbmVzcyB3aGlsZSBjb25zdW1pbmcgb25seSBhIGZldyBuYW5vc2Vjb25kc1xuLy8gZm9yIGVhY2ggcHJuZyBnZW5lcmF0ZWQuICBGb3IgYmFja2dyb3VuZCBvbiB0aGUgZ2VuZXJhdG9yLCBzZWUgQnJlbnQnc1xuLy8gcGFwZXI6IFwiU29tZSBsb25nLXBlcmlvZCByYW5kb20gbnVtYmVyIGdlbmVyYXRvcnMgdXNpbmcgc2hpZnRzIGFuZCB4b3JzLlwiXG4vLyBodHRwOi8vYXJ4aXYub3JnL3BkZi8xMDA0LjMxMTV2MS5wZGZcbi8vXG4vLyBVc2FnZTpcbi8vXG4vLyB2YXIgeG9yNDA5NiA9IHJlcXVpcmUoJ3hvcjQwOTYnKTtcbi8vIHJhbmRvbSA9IHhvcjQwOTYoMSk7ICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VlZCB3aXRoIGludDMyIG9yIHN0cmluZy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20oKSwgMC4xNTIwNDM2NDUwNTM4NTQ3KTsgLy8gKDAsIDEpIHJhbmdlLCA1MyBiaXRzLlxuLy8gYXNzZXJ0LmVxdWFsKHJhbmRvbS5pbnQzMigpLCAxODA2NTM0ODk3KTsgICAvLyBzaWduZWQgaW50MzIsIDMyIGJpdHMuXG4vL1xuLy8gRm9yIG5vbnplcm8gbnVtZXJpYyBrZXlzLCB0aGlzIGltcGVsZW1lbnRhdGlvbiBwcm92aWRlcyBhIHNlcXVlbmNlXG4vLyBpZGVudGljYWwgdG8gdGhhdCBieSBCcmVudCdzIHhvcmdlbnMgMyBpbXBsZW1lbnRhaW9uIGluIEMuICBUaGlzXG4vLyBpbXBsZW1lbnRhdGlvbiBhbHNvIHByb3ZpZGVzIGZvciBpbml0YWxpemluZyB0aGUgZ2VuZXJhdG9yIHdpdGhcbi8vIHN0cmluZyBzZWVkcywgb3IgZm9yIHNhdmluZyBhbmQgcmVzdG9yaW5nIHRoZSBzdGF0ZSBvZiB0aGUgZ2VuZXJhdG9yLlxuLy9cbi8vIE9uIENocm9tZSwgdGhpcyBwcm5nIGJlbmNobWFya3MgYWJvdXQgMi4xIHRpbWVzIHNsb3dlciB0aGFuXG4vLyBKYXZhc2NyaXB0J3MgYnVpbHQtaW4gTWF0aC5yYW5kb20oKS5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHcgPSBtZS53LFxuICAgICAgICBYID0gbWUuWCwgaSA9IG1lLmksIHQsIHY7XG4gICAgLy8gVXBkYXRlIFdleWwgZ2VuZXJhdG9yLlxuICAgIG1lLncgPSB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7XG4gICAgLy8gVXBkYXRlIHhvciBnZW5lcmF0b3IuXG4gICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgIHQgPSBYW2kgPSAoKGkgKyAxKSAmIDEyNyldO1xuICAgIHYgXj0gdiA8PCAxMztcbiAgICB0IF49IHQgPDwgMTc7XG4gICAgdiBePSB2ID4+PiAxNTtcbiAgICB0IF49IHQgPj4+IDEyO1xuICAgIC8vIFVwZGF0ZSBYb3IgZ2VuZXJhdG9yIGFycmF5IHN0YXRlLlxuICAgIHYgPSBYW2ldID0gdiBeIHQ7XG4gICAgbWUuaSA9IGk7XG4gICAgLy8gUmVzdWx0IGlzIHRoZSBjb21iaW5hdGlvbi5cbiAgICByZXR1cm4gKHYgKyAodyBeICh3ID4+PiAxNikpKSB8IDA7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciB0LCB2LCBpLCBqLCB3LCBYID0gW10sIGxpbWl0ID0gMTI4O1xuICAgIGlmIChzZWVkID09PSAoc2VlZCB8IDApKSB7XG4gICAgICAvLyBOdW1lcmljIHNlZWRzIGluaXRpYWxpemUgdiwgd2hpY2ggaXMgdXNlZCB0byBnZW5lcmF0ZXMgWC5cbiAgICAgIHYgPSBzZWVkO1xuICAgICAgc2VlZCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0cmluZyBzZWVkcyBhcmUgbWl4ZWQgaW50byB2IGFuZCBYIG9uZSBjaGFyYWN0ZXIgYXQgYSB0aW1lLlxuICAgICAgc2VlZCA9IHNlZWQgKyAnXFwwJztcbiAgICAgIHYgPSAwO1xuICAgICAgbGltaXQgPSBNYXRoLm1heChsaW1pdCwgc2VlZC5sZW5ndGgpO1xuICAgIH1cbiAgICAvLyBJbml0aWFsaXplIGNpcmN1bGFyIGFycmF5IGFuZCB3ZXlsIHZhbHVlLlxuICAgIGZvciAoaSA9IDAsIGogPSAtMzI7IGogPCBsaW1pdDsgKytqKSB7XG4gICAgICAvLyBQdXQgdGhlIHVuaWNvZGUgY2hhcmFjdGVycyBpbnRvIHRoZSBhcnJheSwgYW5kIHNodWZmbGUgdGhlbS5cbiAgICAgIGlmIChzZWVkKSB2IF49IHNlZWQuY2hhckNvZGVBdCgoaiArIDMyKSAlIHNlZWQubGVuZ3RoKTtcbiAgICAgIC8vIEFmdGVyIDMyIHNodWZmbGVzLCB0YWtlIHYgYXMgdGhlIHN0YXJ0aW5nIHcgdmFsdWUuXG4gICAgICBpZiAoaiA9PT0gMCkgdyA9IHY7XG4gICAgICB2IF49IHYgPDwgMTA7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdiBePSB2IDw8IDQ7XG4gICAgICB2IF49IHYgPj4+IDEzO1xuICAgICAgaWYgKGogPj0gMCkge1xuICAgICAgICB3ID0gKHcgKyAweDYxYzg4NjQ3KSB8IDA7ICAgICAvLyBXZXlsLlxuICAgICAgICB0ID0gKFhbaiAmIDEyN10gXj0gKHYgKyB3KSk7ICAvLyBDb21iaW5lIHhvciBhbmQgd2V5bCB0byBpbml0IGFycmF5LlxuICAgICAgICBpID0gKDAgPT0gdCkgPyBpICsgMSA6IDA7ICAgICAvLyBDb3VudCB6ZXJvZXMuXG4gICAgICB9XG4gICAgfVxuICAgIC8vIFdlIGhhdmUgZGV0ZWN0ZWQgYWxsIHplcm9lczsgbWFrZSB0aGUga2V5IG5vbnplcm8uXG4gICAgaWYgKGkgPj0gMTI4KSB7XG4gICAgICBYWyhzZWVkICYmIHNlZWQubGVuZ3RoIHx8IDApICYgMTI3XSA9IC0xO1xuICAgIH1cbiAgICAvLyBSdW4gdGhlIGdlbmVyYXRvciA1MTIgdGltZXMgdG8gZnVydGhlciBtaXggdGhlIHN0YXRlIGJlZm9yZSB1c2luZyBpdC5cbiAgICAvLyBGYWN0b3JpbmcgdGhpcyBhcyBhIGZ1bmN0aW9uIHNsb3dzIHRoZSBtYWluIGdlbmVyYXRvciwgc28gaXQgaXMganVzdFxuICAgIC8vIHVucm9sbGVkIGhlcmUuICBUaGUgd2V5bCBnZW5lcmF0b3IgaXMgbm90IGFkdmFuY2VkIHdoaWxlIHdhcm1pbmcgdXAuXG4gICAgaSA9IDEyNztcbiAgICBmb3IgKGogPSA0ICogMTI4OyBqID4gMDsgLS1qKSB7XG4gICAgICB2ID0gWFsoaSArIDM0KSAmIDEyN107XG4gICAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICAgIHYgXj0gdiA8PCAxMztcbiAgICAgIHQgXj0gdCA8PCAxNztcbiAgICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgICB0IF49IHQgPj4+IDEyO1xuICAgICAgWFtpXSA9IHYgXiB0O1xuICAgIH1cbiAgICAvLyBTdG9yaW5nIHN0YXRlIGFzIG9iamVjdCBtZW1iZXJzIGlzIGZhc3RlciB0aGFuIHVzaW5nIGNsb3N1cmUgdmFyaWFibGVzLlxuICAgIG1lLncgPSB3O1xuICAgIG1lLlggPSBYO1xuICAgIG1lLmkgPSBpO1xuICB9XG5cbiAgaW5pdChtZSwgc2VlZCk7XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LmkgPSBmLmk7XG4gIHQudyA9IGYudztcbiAgdC5YID0gZi5YLnNsaWNlKCk7XG4gIHJldHVybiB0O1xufTtcblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIGlmIChzZWVkID09IG51bGwpIHNlZWQgPSArKG5ldyBEYXRlKTtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUuWCkgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnhvcjQwOTYgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2luZG93IG9iamVjdCBvciBnbG9iYWxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwiVHljaGUtaVwiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8uXG4vLyBTZWUgaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZCwgYSA9IG1lLmE7XG4gICAgYiA9IChiIDw8IDI1KSBeIChiID4+PiA3KSBeIGM7XG4gICAgYyA9IChjIC0gZCkgfCAwO1xuICAgIGQgPSAoZCA8PCAyNCkgXiAoZCA+Pj4gOCkgXiBhO1xuICAgIGEgPSAoYSAtIGIpIHwgMDtcbiAgICBtZS5iID0gYiA9IChiIDw8IDIwKSBeIChiID4+PiAxMikgXiBjO1xuICAgIG1lLmMgPSBjID0gKGMgLSBkKSB8IDA7XG4gICAgbWUuZCA9IChkIDw8IDE2KSBeIChjID4+PiAxNikgXiBhO1xuICAgIHJldHVybiBtZS5hID0gKGEgLSBiKSB8IDA7XG4gIH07XG5cbiAgLyogVGhlIGZvbGxvd2luZyBpcyBub24taW52ZXJ0ZWQgdHljaGUsIHdoaWNoIGhhcyBiZXR0ZXIgaW50ZXJuYWxcbiAgICogYml0IGRpZmZ1c2lvbiwgYnV0IHdoaWNoIGlzIGFib3V0IDI1JSBzbG93ZXIgdGhhbiB0eWNoZS1pIGluIEpTLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEgPSBtZS5hLCBiID0gbWUuYiwgYyA9IG1lLmMsIGQgPSBtZS5kO1xuICAgIGEgPSAobWUuYSArIG1lLmIgfCAwKSA+Pj4gMDtcbiAgICBkID0gbWUuZCBeIGE7IGQgPSBkIDw8IDE2IF4gZCA+Pj4gMTY7XG4gICAgYyA9IG1lLmMgKyBkIHwgMDtcbiAgICBiID0gbWUuYiBeIGM7IGIgPSBiIDw8IDEyIF4gZCA+Pj4gMjA7XG4gICAgbWUuYSA9IGEgPSBhICsgYiB8IDA7XG4gICAgZCA9IGQgXiBhOyBtZS5kID0gZCA9IGQgPDwgOCBeIGQgPj4+IDI0O1xuICAgIG1lLmMgPSBjID0gYyArIGQgfCAwO1xuICAgIGIgPSBiIF4gYztcbiAgICByZXR1cm4gbWUuYiA9IChiIDw8IDcgXiBiID4+PiAyNSk7XG4gIH1cbiAgKi9cblxuICBtZS5hID0gMDtcbiAgbWUuYiA9IDA7XG4gIG1lLmMgPSAyNjU0NDM1NzY5IHwgMDtcbiAgbWUuZCA9IDEzNjcxMzA1NTE7XG5cbiAgaWYgKHNlZWQgPT09IE1hdGguZmxvb3Ioc2VlZCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUuYSA9IChzZWVkIC8gMHgxMDAwMDAwMDApIHwgMDtcbiAgICBtZS5iID0gc2VlZCB8IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyAyMDsgaysrKSB7XG4gICAgbWUuYiBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5hID0gZi5hO1xuICB0LmIgPSBmLmI7XG4gIHQuYyA9IGYuYztcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMudHljaGVpID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuXG4iLCIvKlxuQ29weXJpZ2h0IDIwMTQgRGF2aWQgQmF1LlxuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbklOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG5DTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcblNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG4oZnVuY3Rpb24gKHBvb2wsIG1hdGgpIHtcbi8vXG4vLyBUaGUgZm9sbG93aW5nIGNvbnN0YW50cyBhcmUgcmVsYXRlZCB0byBJRUVFIDc1NCBsaW1pdHMuXG4vL1xuXG4vLyBEZXRlY3QgdGhlIGdsb2JhbCBvYmplY3QsIGV2ZW4gaWYgb3BlcmF0aW5nIGluIHN0cmljdCBtb2RlLlxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQzODcwNTcvMjY1Mjk4XG52YXIgZ2xvYmFsID0gKDAsIGV2YWwpKCd0aGlzJyksXG4gICAgd2lkdGggPSAyNTYsICAgICAgICAvLyBlYWNoIFJDNCBvdXRwdXQgaXMgMCA8PSB4IDwgMjU2XG4gICAgY2h1bmtzID0gNiwgICAgICAgICAvLyBhdCBsZWFzdCBzaXggUkM0IG91dHB1dHMgZm9yIGVhY2ggZG91YmxlXG4gICAgZGlnaXRzID0gNTIsICAgICAgICAvLyB0aGVyZSBhcmUgNTIgc2lnbmlmaWNhbnQgZGlnaXRzIGluIGEgZG91YmxlXG4gICAgcm5nbmFtZSA9ICdyYW5kb20nLCAvLyBybmduYW1lOiBuYW1lIGZvciBNYXRoLnJhbmRvbSBhbmQgTWF0aC5zZWVkcmFuZG9tXG4gICAgc3RhcnRkZW5vbSA9IG1hdGgucG93KHdpZHRoLCBjaHVua3MpLFxuICAgIHNpZ25pZmljYW5jZSA9IG1hdGgucG93KDIsIGRpZ2l0cyksXG4gICAgb3ZlcmZsb3cgPSBzaWduaWZpY2FuY2UgKiAyLFxuICAgIG1hc2sgPSB3aWR0aCAtIDEsXG4gICAgbm9kZWNyeXB0bzsgICAgICAgICAvLyBub2RlLmpzIGNyeXB0byBtb2R1bGUsIGluaXRpYWxpemVkIGF0IHRoZSBib3R0b20uXG5cbi8vXG4vLyBzZWVkcmFuZG9tKClcbi8vIFRoaXMgaXMgdGhlIHNlZWRyYW5kb20gZnVuY3Rpb24gZGVzY3JpYmVkIGFib3ZlLlxuLy9cbmZ1bmN0aW9uIHNlZWRyYW5kb20oc2VlZCwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdmFyIGtleSA9IFtdO1xuICBvcHRpb25zID0gKG9wdGlvbnMgPT0gdHJ1ZSkgPyB7IGVudHJvcHk6IHRydWUgfSA6IChvcHRpb25zIHx8IHt9KTtcblxuICAvLyBGbGF0dGVuIHRoZSBzZWVkIHN0cmluZyBvciBidWlsZCBvbmUgZnJvbSBsb2NhbCBlbnRyb3B5IGlmIG5lZWRlZC5cbiAgdmFyIHNob3J0c2VlZCA9IG1peGtleShmbGF0dGVuKFxuICAgIG9wdGlvbnMuZW50cm9weSA/IFtzZWVkLCB0b3N0cmluZyhwb29sKV0gOlxuICAgIChzZWVkID09IG51bGwpID8gYXV0b3NlZWQoKSA6IHNlZWQsIDMpLCBrZXkpO1xuXG4gIC8vIFVzZSB0aGUgc2VlZCB0byBpbml0aWFsaXplIGFuIEFSQzQgZ2VuZXJhdG9yLlxuICB2YXIgYXJjNCA9IG5ldyBBUkM0KGtleSk7XG5cbiAgLy8gVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgcmFuZG9tIGRvdWJsZSBpbiBbMCwgMSkgdGhhdCBjb250YWluc1xuICAvLyByYW5kb21uZXNzIGluIGV2ZXJ5IGJpdCBvZiB0aGUgbWFudGlzc2Egb2YgdGhlIElFRUUgNzU0IHZhbHVlLlxuICB2YXIgcHJuZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gYXJjNC5nKGNodW5rcyksICAgICAgICAgICAgIC8vIFN0YXJ0IHdpdGggYSBudW1lcmF0b3IgbiA8IDIgXiA0OFxuICAgICAgICBkID0gc3RhcnRkZW5vbSwgICAgICAgICAgICAgICAgIC8vICAgYW5kIGRlbm9taW5hdG9yIGQgPSAyIF4gNDguXG4gICAgICAgIHggPSAwOyAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBhbmQgbm8gJ2V4dHJhIGxhc3QgYnl0ZScuXG4gICAgd2hpbGUgKG4gPCBzaWduaWZpY2FuY2UpIHsgICAgICAgICAgLy8gRmlsbCB1cCBhbGwgc2lnbmlmaWNhbnQgZGlnaXRzIGJ5XG4gICAgICBuID0gKG4gKyB4KSAqIHdpZHRoOyAgICAgICAgICAgICAgLy8gICBzaGlmdGluZyBudW1lcmF0b3IgYW5kXG4gICAgICBkICo9IHdpZHRoOyAgICAgICAgICAgICAgICAgICAgICAgLy8gICBkZW5vbWluYXRvciBhbmQgZ2VuZXJhdGluZyBhXG4gICAgICB4ID0gYXJjNC5nKDEpOyAgICAgICAgICAgICAgICAgICAgLy8gICBuZXcgbGVhc3Qtc2lnbmlmaWNhbnQtYnl0ZS5cbiAgICB9XG4gICAgd2hpbGUgKG4gPj0gb3ZlcmZsb3cpIHsgICAgICAgICAgICAgLy8gVG8gYXZvaWQgcm91bmRpbmcgdXAsIGJlZm9yZSBhZGRpbmdcbiAgICAgIG4gLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxhc3QgYnl0ZSwgc2hpZnQgZXZlcnl0aGluZ1xuICAgICAgZCAvPSAyOyAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgcmlnaHQgdXNpbmcgaW50ZWdlciBtYXRoIHVudGlsXG4gICAgICB4ID4+Pj0gMTsgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB3ZSBoYXZlIGV4YWN0bHkgdGhlIGRlc2lyZWQgYml0cy5cbiAgICB9XG4gICAgcmV0dXJuIChuICsgeCkgLyBkOyAgICAgICAgICAgICAgICAgLy8gRm9ybSB0aGUgbnVtYmVyIHdpdGhpbiBbMCwgMSkuXG4gIH07XG5cbiAgcHJuZy5pbnQzMiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIHwgMDsgfVxuICBwcm5nLnF1aWNrID0gZnVuY3Rpb24oKSB7IHJldHVybiBhcmM0LmcoNCkgLyAweDEwMDAwMDAwMDsgfVxuICBwcm5nLmRvdWJsZSA9IHBybmc7XG5cbiAgLy8gTWl4IHRoZSByYW5kb21uZXNzIGludG8gYWNjdW11bGF0ZWQgZW50cm9weS5cbiAgbWl4a2V5KHRvc3RyaW5nKGFyYzQuUyksIHBvb2wpO1xuXG4gIC8vIENhbGxpbmcgY29udmVudGlvbjogd2hhdCB0byByZXR1cm4gYXMgYSBmdW5jdGlvbiBvZiBwcm5nLCBzZWVkLCBpc19tYXRoLlxuICByZXR1cm4gKG9wdGlvbnMucGFzcyB8fCBjYWxsYmFjayB8fFxuICAgICAgZnVuY3Rpb24ocHJuZywgc2VlZCwgaXNfbWF0aF9jYWxsLCBzdGF0ZSkge1xuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAvLyBMb2FkIHRoZSBhcmM0IHN0YXRlIGZyb20gdGhlIGdpdmVuIHN0YXRlIGlmIGl0IGhhcyBhbiBTIGFycmF5LlxuICAgICAgICAgIGlmIChzdGF0ZS5TKSB7IGNvcHkoc3RhdGUsIGFyYzQpOyB9XG4gICAgICAgICAgLy8gT25seSBwcm92aWRlIHRoZSAuc3RhdGUgbWV0aG9kIGlmIHJlcXVlc3RlZCB2aWEgb3B0aW9ucy5zdGF0ZS5cbiAgICAgICAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KGFyYzQsIHt9KTsgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY2FsbGVkIGFzIGEgbWV0aG9kIG9mIE1hdGggKE1hdGguc2VlZHJhbmRvbSgpKSwgbXV0YXRlXG4gICAgICAgIC8vIE1hdGgucmFuZG9tIGJlY2F1c2UgdGhhdCBpcyBob3cgc2VlZHJhbmRvbS5qcyBoYXMgd29ya2VkIHNpbmNlIHYxLjAuXG4gICAgICAgIGlmIChpc19tYXRoX2NhbGwpIHsgbWF0aFtybmduYW1lXSA9IHBybmc7IHJldHVybiBzZWVkOyB9XG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBpdCBpcyBhIG5ld2VyIGNhbGxpbmcgY29udmVudGlvbiwgc28gcmV0dXJuIHRoZVxuICAgICAgICAvLyBwcm5nIGRpcmVjdGx5LlxuICAgICAgICBlbHNlIHJldHVybiBwcm5nO1xuICAgICAgfSkoXG4gIHBybmcsXG4gIHNob3J0c2VlZCxcbiAgJ2dsb2JhbCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuZ2xvYmFsIDogKHRoaXMgPT0gbWF0aCksXG4gIG9wdGlvbnMuc3RhdGUpO1xufVxubWF0aFsnc2VlZCcgKyBybmduYW1lXSA9IHNlZWRyYW5kb207XG5cbi8vXG4vLyBBUkM0XG4vL1xuLy8gQW4gQVJDNCBpbXBsZW1lbnRhdGlvbi4gIFRoZSBjb25zdHJ1Y3RvciB0YWtlcyBhIGtleSBpbiB0aGUgZm9ybSBvZlxuLy8gYW4gYXJyYXkgb2YgYXQgbW9zdCAod2lkdGgpIGludGVnZXJzIHRoYXQgc2hvdWxkIGJlIDAgPD0geCA8ICh3aWR0aCkuXG4vL1xuLy8gVGhlIGcoY291bnQpIG1ldGhvZCByZXR1cm5zIGEgcHNldWRvcmFuZG9tIGludGVnZXIgdGhhdCBjb25jYXRlbmF0ZXNcbi8vIHRoZSBuZXh0IChjb3VudCkgb3V0cHV0cyBmcm9tIEFSQzQuICBJdHMgcmV0dXJuIHZhbHVlIGlzIGEgbnVtYmVyIHhcbi8vIHRoYXQgaXMgaW4gdGhlIHJhbmdlIDAgPD0geCA8ICh3aWR0aCBeIGNvdW50KS5cbi8vXG5mdW5jdGlvbiBBUkM0KGtleSkge1xuICB2YXIgdCwga2V5bGVuID0ga2V5Lmxlbmd0aCxcbiAgICAgIG1lID0gdGhpcywgaSA9IDAsIGogPSBtZS5pID0gbWUuaiA9IDAsIHMgPSBtZS5TID0gW107XG5cbiAgLy8gVGhlIGVtcHR5IGtleSBbXSBpcyB0cmVhdGVkIGFzIFswXS5cbiAgaWYgKCFrZXlsZW4pIHsga2V5ID0gW2tleWxlbisrXTsgfVxuXG4gIC8vIFNldCB1cCBTIHVzaW5nIHRoZSBzdGFuZGFyZCBrZXkgc2NoZWR1bGluZyBhbGdvcml0aG0uXG4gIHdoaWxlIChpIDwgd2lkdGgpIHtcbiAgICBzW2ldID0gaSsrO1xuICB9XG4gIGZvciAoaSA9IDA7IGkgPCB3aWR0aDsgaSsrKSB7XG4gICAgc1tpXSA9IHNbaiA9IG1hc2sgJiAoaiArIGtleVtpICUga2V5bGVuXSArICh0ID0gc1tpXSkpXTtcbiAgICBzW2pdID0gdDtcbiAgfVxuXG4gIC8vIFRoZSBcImdcIiBtZXRob2QgcmV0dXJucyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgYXMgb25lIG51bWJlci5cbiAgKG1lLmcgPSBmdW5jdGlvbihjb3VudCkge1xuICAgIC8vIFVzaW5nIGluc3RhbmNlIG1lbWJlcnMgaW5zdGVhZCBvZiBjbG9zdXJlIHN0YXRlIG5lYXJseSBkb3VibGVzIHNwZWVkLlxuICAgIHZhciB0LCByID0gMCxcbiAgICAgICAgaSA9IG1lLmksIGogPSBtZS5qLCBzID0gbWUuUztcbiAgICB3aGlsZSAoY291bnQtLSkge1xuICAgICAgdCA9IHNbaSA9IG1hc2sgJiAoaSArIDEpXTtcbiAgICAgIHIgPSByICogd2lkdGggKyBzW21hc2sgJiAoKHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyB0KV0pICsgKHNbal0gPSB0KSldO1xuICAgIH1cbiAgICBtZS5pID0gaTsgbWUuaiA9IGo7XG4gICAgcmV0dXJuIHI7XG4gICAgLy8gRm9yIHJvYnVzdCB1bnByZWRpY3RhYmlsaXR5LCB0aGUgZnVuY3Rpb24gY2FsbCBiZWxvdyBhdXRvbWF0aWNhbGx5XG4gICAgLy8gZGlzY2FyZHMgYW4gaW5pdGlhbCBiYXRjaCBvZiB2YWx1ZXMuICBUaGlzIGlzIGNhbGxlZCBSQzQtZHJvcFsyNTZdLlxuICAgIC8vIFNlZSBodHRwOi8vZ29vZ2xlLmNvbS9zZWFyY2g/cT1yc2ErZmx1aHJlcityZXNwb25zZSZidG5JXG4gIH0pKHdpZHRoKTtcbn1cblxuLy9cbi8vIGNvcHkoKVxuLy8gQ29waWVzIGludGVybmFsIHN0YXRlIG9mIEFSQzQgdG8gb3IgZnJvbSBhIHBsYWluIG9iamVjdC5cbi8vXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LmogPSBmLmo7XG4gIHQuUyA9IGYuUy5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbi8vXG4vLyBmbGF0dGVuKClcbi8vIENvbnZlcnRzIGFuIG9iamVjdCB0cmVlIHRvIG5lc3RlZCBhcnJheXMgb2Ygc3RyaW5ncy5cbi8vXG5mdW5jdGlvbiBmbGF0dGVuKG9iaiwgZGVwdGgpIHtcbiAgdmFyIHJlc3VsdCA9IFtdLCB0eXAgPSAodHlwZW9mIG9iaiksIHByb3A7XG4gIGlmIChkZXB0aCAmJiB0eXAgPT0gJ29iamVjdCcpIHtcbiAgICBmb3IgKHByb3AgaW4gb2JqKSB7XG4gICAgICB0cnkgeyByZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSwgZGVwdGggLSAxKSk7IH0gY2F0Y2ggKGUpIHt9XG4gICAgfVxuICB9XG4gIHJldHVybiAocmVzdWx0Lmxlbmd0aCA/IHJlc3VsdCA6IHR5cCA9PSAnc3RyaW5nJyA/IG9iaiA6IG9iaiArICdcXDAnKTtcbn1cblxuLy9cbi8vIG1peGtleSgpXG4vLyBNaXhlcyBhIHN0cmluZyBzZWVkIGludG8gYSBrZXkgdGhhdCBpcyBhbiBhcnJheSBvZiBpbnRlZ2VycywgYW5kXG4vLyByZXR1cm5zIGEgc2hvcnRlbmVkIHN0cmluZyBzZWVkIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgcmVzdWx0IGtleS5cbi8vXG5mdW5jdGlvbiBtaXhrZXkoc2VlZCwga2V5KSB7XG4gIHZhciBzdHJpbmdzZWVkID0gc2VlZCArICcnLCBzbWVhciwgaiA9IDA7XG4gIHdoaWxlIChqIDwgc3RyaW5nc2VlZC5sZW5ndGgpIHtcbiAgICBrZXlbbWFzayAmIGpdID1cbiAgICAgIG1hc2sgJiAoKHNtZWFyIF49IGtleVttYXNrICYgal0gKiAxOSkgKyBzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKSk7XG4gIH1cbiAgcmV0dXJuIHRvc3RyaW5nKGtleSk7XG59XG5cbi8vXG4vLyBhdXRvc2VlZCgpXG4vLyBSZXR1cm5zIGFuIG9iamVjdCBmb3IgYXV0b3NlZWRpbmcsIHVzaW5nIHdpbmRvdy5jcnlwdG8gYW5kIE5vZGUgY3J5cHRvXG4vLyBtb2R1bGUgaWYgYXZhaWxhYmxlLlxuLy9cbmZ1bmN0aW9uIGF1dG9zZWVkKCkge1xuICB0cnkge1xuICAgIHZhciBvdXQ7XG4gICAgaWYgKG5vZGVjcnlwdG8gJiYgKG91dCA9IG5vZGVjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XG4gICAgICAvLyBUaGUgdXNlIG9mICdvdXQnIHRvIHJlbWVtYmVyIHJhbmRvbUJ5dGVzIG1ha2VzIHRpZ2h0IG1pbmlmaWVkIGNvZGUuXG4gICAgICBvdXQgPSBvdXQod2lkdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBuZXcgVWludDhBcnJheSh3aWR0aCk7XG4gICAgICAoZ2xvYmFsLmNyeXB0byB8fCBnbG9iYWwubXNDcnlwdG8pLmdldFJhbmRvbVZhbHVlcyhvdXQpO1xuICAgIH1cbiAgICByZXR1cm4gdG9zdHJpbmcob3V0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciBicm93c2VyID0gZ2xvYmFsLm5hdmlnYXRvcixcbiAgICAgICAgcGx1Z2lucyA9IGJyb3dzZXIgJiYgYnJvd3Nlci5wbHVnaW5zO1xuICAgIHJldHVybiBbK25ldyBEYXRlLCBnbG9iYWwsIHBsdWdpbnMsIGdsb2JhbC5zY3JlZW4sIHRvc3RyaW5nKHBvb2wpXTtcbiAgfVxufVxuXG4vL1xuLy8gdG9zdHJpbmcoKVxuLy8gQ29udmVydHMgYW4gYXJyYXkgb2YgY2hhcmNvZGVzIHRvIGEgc3RyaW5nXG4vL1xuZnVuY3Rpb24gdG9zdHJpbmcoYSkge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseSgwLCBhKTtcbn1cblxuLy9cbi8vIFdoZW4gc2VlZHJhbmRvbS5qcyBpcyBsb2FkZWQsIHdlIGltbWVkaWF0ZWx5IG1peCBhIGZldyBiaXRzXG4vLyBmcm9tIHRoZSBidWlsdC1pbiBSTkcgaW50byB0aGUgZW50cm9weSBwb29sLiAgQmVjYXVzZSB3ZSBkb1xuLy8gbm90IHdhbnQgdG8gaW50ZXJmZXJlIHdpdGggZGV0ZXJtaW5pc3RpYyBQUk5HIHN0YXRlIGxhdGVyLFxuLy8gc2VlZHJhbmRvbSB3aWxsIG5vdCBjYWxsIG1hdGgucmFuZG9tIG9uIGl0cyBvd24gYWdhaW4gYWZ0ZXJcbi8vIGluaXRpYWxpemF0aW9uLlxuLy9cbm1peGtleShtYXRoLnJhbmRvbSgpLCBwb29sKTtcblxuLy9cbi8vIE5vZGVqcyBhbmQgQU1EIHN1cHBvcnQ6IGV4cG9ydCB0aGUgaW1wbGVtZW50YXRpb24gYXMgYSBtb2R1bGUgdXNpbmdcbi8vIGVpdGhlciBjb252ZW50aW9uLlxuLy9cbmlmICgodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBzZWVkcmFuZG9tO1xuICAvLyBXaGVuIGluIG5vZGUuanMsIHRyeSB1c2luZyBjcnlwdG8gcGFja2FnZSBmb3IgYXV0b3NlZWRpbmcuXG4gIHRyeSB7XG4gICAgbm9kZWNyeXB0byA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuICB9IGNhdGNoIChleCkge31cbn0gZWxzZSBpZiAoKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBzZWVkcmFuZG9tOyB9KTtcbn1cblxuLy8gRW5kIGFub255bW91cyBzY29wZSwgYW5kIHBhc3MgaW5pdGlhbCB2YWx1ZXMuXG59KShcbiAgW10sICAgICAvLyBwb29sOiBlbnRyb3B5IHBvb2wgc3RhcnRzIGVtcHR5XG4gIE1hdGggICAgLy8gbWF0aDogcGFja2FnZSBjb250YWluaW5nIHJhbmRvbSwgcG93LCBhbmQgc2VlZHJhbmRvbVxuKTtcbiIsIi8vIEEgbGlicmFyeSBvZiBzZWVkYWJsZSBSTkdzIGltcGxlbWVudGVkIGluIEphdmFzY3JpcHQuXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHNlZWRyYW5kb20gPSByZXF1aXJlKCdzZWVkcmFuZG9tJyk7XG4vLyB2YXIgcmFuZG9tID0gc2VlZHJhbmRvbSgxKTsgLy8gb3IgYW55IHNlZWQuXG4vLyB2YXIgeCA9IHJhbmRvbSgpOyAgICAgICAvLyAwIDw9IHggPCAxLiAgRXZlcnkgYml0IGlzIHJhbmRvbS5cbi8vIHZhciB4ID0gcmFuZG9tLnF1aWNrKCk7IC8vIDAgPD0geCA8IDEuICAzMiBiaXRzIG9mIHJhbmRvbW5lc3MuXG5cbi8vIGFsZWEsIGEgNTMtYml0IG11bHRpcGx5LXdpdGgtY2FycnkgZ2VuZXJhdG9yIGJ5IEpvaGFubmVzIEJhYWfDuGUuXG4vLyBQZXJpb2Q6IH4yXjExNlxuLy8gUmVwb3J0ZWQgdG8gcGFzcyBhbGwgQmlnQ3J1c2ggdGVzdHMuXG52YXIgYWxlYSA9IHJlcXVpcmUoJy4vbGliL2FsZWEnKTtcblxuLy8geG9yMTI4LCBhIHB1cmUgeG9yLXNoaWZ0IGdlbmVyYXRvciBieSBHZW9yZ2UgTWFyc2FnbGlhLlxuLy8gUGVyaW9kOiAyXjEyOC0xLlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogTWF0cml4UmFuayBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3IxMjggPSByZXF1aXJlKCcuL2xpYi94b3IxMjgnKTtcblxuLy8geG9yd293LCBHZW9yZ2UgTWFyc2FnbGlhJ3MgMTYwLWJpdCB4b3Itc2hpZnQgY29tYmluZWQgcGx1cyB3ZXlsLlxuLy8gUGVyaW9kOiAyXjE5Mi0yXjMyXG4vLyBSZXBvcnRlZCB0byBmYWlsOiBDb2xsaXNpb25PdmVyLCBTaW1wUG9rZXIsIGFuZCBMaW5lYXJDb21wLlxudmFyIHhvcndvdyA9IHJlcXVpcmUoJy4vbGliL3hvcndvdycpO1xuXG4vLyB4b3JzaGlmdDcsIGJ5IEZyYW7Dp29pcyBQYW5uZXRvbiBhbmQgUGllcnJlIEwnZWN1eWVyLCB0YWtlc1xuLy8gYSBkaWZmZXJlbnQgYXBwcm9hY2g6IGl0IGFkZHMgcm9idXN0bmVzcyBieSBhbGxvd2luZyBtb3JlIHNoaWZ0c1xuLy8gdGhhbiBNYXJzYWdsaWEncyBvcmlnaW5hbCB0aHJlZS4gIEl0IGlzIGEgNy1zaGlmdCBnZW5lcmF0b3Jcbi8vIHdpdGggMjU2IGJpdHMsIHRoYXQgcGFzc2VzIEJpZ0NydXNoIHdpdGggbm8gc3lzdG1hdGljIGZhaWx1cmVzLlxuLy8gUGVyaW9kIDJeMjU2LTEuXG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHhvcnNoaWZ0NyA9IHJlcXVpcmUoJy4vbGliL3hvcnNoaWZ0NycpO1xuXG4vLyB4b3I0MDk2LCBieSBSaWNoYXJkIEJyZW50LCBpcyBhIDQwOTYtYml0IHhvci1zaGlmdCB3aXRoIGFcbi8vIHZlcnkgbG9uZyBwZXJpb2QgdGhhdCBhbHNvIGFkZHMgYSBXZXlsIGdlbmVyYXRvci4gSXQgYWxzbyBwYXNzZXNcbi8vIEJpZ0NydXNoIHdpdGggbm8gc3lzdGVtYXRpYyBmYWlsdXJlcy4gIEl0cyBsb25nIHBlcmlvZCBtYXlcbi8vIGJlIHVzZWZ1bCBpZiB5b3UgaGF2ZSBtYW55IGdlbmVyYXRvcnMgYW5kIG5lZWQgdG8gYXZvaWRcbi8vIGNvbGxpc2lvbnMuXG4vLyBQZXJpb2Q6IDJeNDEyOC0yXjMyLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3I0MDk2ID0gcmVxdWlyZSgnLi9saWIveG9yNDA5NicpO1xuXG4vLyBUeWNoZS1pLCBieSBTYW11ZWwgTmV2ZXMgYW5kIEZpbGlwZSBBcmF1am8sIGlzIGEgYml0LXNoaWZ0aW5nIHJhbmRvbVxuLy8gbnVtYmVyIGdlbmVyYXRvciBkZXJpdmVkIGZyb20gQ2hhQ2hhLCBhIG1vZGVybiBzdHJlYW0gY2lwaGVyLlxuLy8gaHR0cHM6Ly9lZGVuLmRlaS51Yy5wdC9+c25ldmVzL3B1YnMvMjAxMS1zbmZhMi5wZGZcbi8vIFBlcmlvZDogfjJeMTI3XG4vLyBObyBzeXN0ZW1hdGljIEJpZ0NydXNoIGZhaWx1cmVzIHJlcG9ydGVkLlxudmFyIHR5Y2hlaSA9IHJlcXVpcmUoJy4vbGliL3R5Y2hlaScpO1xuXG4vLyBUaGUgb3JpZ2luYWwgQVJDNC1iYXNlZCBwcm5nIGluY2x1ZGVkIGluIHRoaXMgbGlicmFyeS5cbi8vIFBlcmlvZDogfjJeMTYwMFxudmFyIHNyID0gcmVxdWlyZSgnLi9zZWVkcmFuZG9tJyk7XG5cbnNyLmFsZWEgPSBhbGVhO1xuc3IueG9yMTI4ID0geG9yMTI4O1xuc3IueG9yd293ID0geG9yd293O1xuc3IueG9yc2hpZnQ3ID0geG9yc2hpZnQ3O1xuc3IueG9yNDA5NiA9IHhvcjQwOTY7XG5zci50eWNoZWkgPSB0eWNoZWk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3I7XG4iLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHN0ciA9PiBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC9bIScoKSpdL2csIHggPT4gYCUke3guY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKX1gKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB0b2tlbiA9ICclW2EtZjAtOV17Mn0nO1xudmFyIHNpbmdsZU1hdGNoZXIgPSBuZXcgUmVnRXhwKHRva2VuLCAnZ2knKTtcbnZhciBtdWx0aU1hdGNoZXIgPSBuZXcgUmVnRXhwKCcoJyArIHRva2VuICsgJykrJywgJ2dpJyk7XG5cbmZ1bmN0aW9uIGRlY29kZUNvbXBvbmVudHMoY29tcG9uZW50cywgc3BsaXQpIHtcblx0dHJ5IHtcblx0XHQvLyBUcnkgdG8gZGVjb2RlIHRoZSBlbnRpcmUgc3RyaW5nIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChjb21wb25lbnRzLmpvaW4oJycpKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRG8gbm90aGluZ1xuXHR9XG5cblx0aWYgKGNvbXBvbmVudHMubGVuZ3RoID09PSAxKSB7XG5cdFx0cmV0dXJuIGNvbXBvbmVudHM7XG5cdH1cblxuXHRzcGxpdCA9IHNwbGl0IHx8IDE7XG5cblx0Ly8gU3BsaXQgdGhlIGFycmF5IGluIDIgcGFydHNcblx0dmFyIGxlZnQgPSBjb21wb25lbnRzLnNsaWNlKDAsIHNwbGl0KTtcblx0dmFyIHJpZ2h0ID0gY29tcG9uZW50cy5zbGljZShzcGxpdCk7XG5cblx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuY2FsbChbXSwgZGVjb2RlQ29tcG9uZW50cyhsZWZ0KSwgZGVjb2RlQ29tcG9uZW50cyhyaWdodCkpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGUoaW5wdXQpIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0dmFyIHRva2VucyA9IGlucHV0Lm1hdGNoKHNpbmdsZU1hdGNoZXIpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlucHV0ID0gZGVjb2RlQ29tcG9uZW50cyh0b2tlbnMsIGkpLmpvaW4oJycpO1xuXG5cdFx0XHR0b2tlbnMgPSBpbnB1dC5tYXRjaChzaW5nbGVNYXRjaGVyKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXQ7XG5cdH1cbn1cblxuZnVuY3Rpb24gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGlucHV0KSB7XG5cdC8vIEtlZXAgdHJhY2sgb2YgYWxsIHRoZSByZXBsYWNlbWVudHMgYW5kIHByZWZpbGwgdGhlIG1hcCB3aXRoIHRoZSBgQk9NYFxuXHR2YXIgcmVwbGFjZU1hcCA9IHtcblx0XHQnJUZFJUZGJzogJ1xcdUZGRkRcXHVGRkZEJyxcblx0XHQnJUZGJUZFJzogJ1xcdUZGRkRcXHVGRkZEJ1xuXHR9O1xuXG5cdHZhciBtYXRjaCA9IG11bHRpTWF0Y2hlci5leGVjKGlucHV0KTtcblx0d2hpbGUgKG1hdGNoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIERlY29kZSBhcyBiaWcgY2h1bmtzIGFzIHBvc3NpYmxlXG5cdFx0XHRyZXBsYWNlTWFwW21hdGNoWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChtYXRjaFswXSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVjb2RlKG1hdGNoWzBdKTtcblxuXHRcdFx0aWYgKHJlc3VsdCAhPT0gbWF0Y2hbMF0pIHtcblx0XHRcdFx0cmVwbGFjZU1hcFttYXRjaFswXV0gPSByZXN1bHQ7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWF0Y2ggPSBtdWx0aU1hdGNoZXIuZXhlYyhpbnB1dCk7XG5cdH1cblxuXHQvLyBBZGQgYCVDMmAgYXQgdGhlIGVuZCBvZiB0aGUgbWFwIHRvIG1ha2Ugc3VyZSBpdCBkb2VzIG5vdCByZXBsYWNlIHRoZSBjb21iaW5hdG9yIGJlZm9yZSBldmVyeXRoaW5nIGVsc2Vcblx0cmVwbGFjZU1hcFsnJUMyJ10gPSAnXFx1RkZGRCc7XG5cblx0dmFyIGVudHJpZXMgPSBPYmplY3Qua2V5cyhyZXBsYWNlTWFwKTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBSZXBsYWNlIGFsbCBkZWNvZGVkIGNvbXBvbmVudHNcblx0XHR2YXIga2V5ID0gZW50cmllc1tpXTtcblx0XHRpbnB1dCA9IGlucHV0LnJlcGxhY2UobmV3IFJlZ0V4cChrZXksICdnJyksIHJlcGxhY2VNYXBba2V5XSk7XG5cdH1cblxuXHRyZXR1cm4gaW5wdXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVuY29kZWRVUkkpIHtcblx0aWYgKHR5cGVvZiBlbmNvZGVkVVJJICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGBlbmNvZGVkVVJJYCB0byBiZSBvZiB0eXBlIGBzdHJpbmdgLCBnb3QgYCcgKyB0eXBlb2YgZW5jb2RlZFVSSSArICdgJyk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGVuY29kZWRVUkkgPSBlbmNvZGVkVVJJLnJlcGxhY2UoL1xcKy9nLCAnICcpO1xuXG5cdFx0Ly8gVHJ5IHRoZSBidWlsdCBpbiBkZWNvZGVyIGZpcnN0XG5cdFx0cmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChlbmNvZGVkVVJJKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gRmFsbGJhY2sgdG8gYSBtb3JlIGFkdmFuY2VkIGRlY29kZXJcblx0XHRyZXR1cm4gY3VzdG9tRGVjb2RlVVJJQ29tcG9uZW50KGVuY29kZWRVUkkpO1xuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChzdHJpbmcsIHNlcGFyYXRvcikgPT4ge1xuXHRpZiAoISh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyAmJiB0eXBlb2Ygc2VwYXJhdG9yID09PSAnc3RyaW5nJykpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCB0aGUgYXJndW1lbnRzIHRvIGJlIG9mIHR5cGUgYHN0cmluZ2AnKTtcblx0fVxuXG5cdGlmIChzZXBhcmF0b3IgPT09ICcnKSB7XG5cdFx0cmV0dXJuIFtzdHJpbmddO1xuXHR9XG5cblx0Y29uc3Qgc2VwYXJhdG9ySW5kZXggPSBzdHJpbmcuaW5kZXhPZihzZXBhcmF0b3IpO1xuXG5cdGlmIChzZXBhcmF0b3JJbmRleCA9PT0gLTEpIHtcblx0XHRyZXR1cm4gW3N0cmluZ107XG5cdH1cblxuXHRyZXR1cm4gW1xuXHRcdHN0cmluZy5zbGljZSgwLCBzZXBhcmF0b3JJbmRleCksXG5cdFx0c3RyaW5nLnNsaWNlKHNlcGFyYXRvckluZGV4ICsgc2VwYXJhdG9yLmxlbmd0aClcblx0XTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBzdHJpY3RVcmlFbmNvZGUgPSByZXF1aXJlKCdzdHJpY3QtdXJpLWVuY29kZScpO1xuY29uc3QgZGVjb2RlQ29tcG9uZW50ID0gcmVxdWlyZSgnZGVjb2RlLXVyaS1jb21wb25lbnQnKTtcbmNvbnN0IHNwbGl0T25GaXJzdCA9IHJlcXVpcmUoJ3NwbGl0LW9uLWZpcnN0Jyk7XG5cbmNvbnN0IGlzTnVsbE9yVW5kZWZpbmVkID0gdmFsdWUgPT4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0c3dpdGNoIChvcHRpb25zLmFycmF5Rm9ybWF0KSB7XG5cdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBpbmRleCA9IHJlc3VsdC5sZW5ndGg7XG5cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHZhbHVlID09PSB1bmRlZmluZWQgfHxcblx0XHRcdFx0XHQob3B0aW9ucy5za2lwTnVsbCAmJiB2YWx1ZSA9PT0gbnVsbCkgfHxcblx0XHRcdFx0XHQob3B0aW9ucy5za2lwRW1wdHlTdHJpbmcgJiYgdmFsdWUgPT09ICcnKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1snLCBpbmRleCwgJ10nXS5qb2luKCcnKV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdC4uLnJlc3VsdCxcblx0XHRcdFx0XHRbZW5jb2RlKGtleSwgb3B0aW9ucyksICdbJywgZW5jb2RlKGluZGV4LCBvcHRpb25zKSwgJ109JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJylcblx0XHRcdFx0XTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHZhbHVlID09PSB1bmRlZmluZWQgfHxcblx0XHRcdFx0XHQob3B0aW9ucy5za2lwTnVsbCAmJiB2YWx1ZSA9PT0gbnVsbCkgfHxcblx0XHRcdFx0XHQob3B0aW9ucy5za2lwRW1wdHlTdHJpbmcgJiYgdmFsdWUgPT09ICcnKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdJ10uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJ1tdPScsIGVuY29kZSh2YWx1ZSwgb3B0aW9ucyldLmpvaW4oJycpXTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdjb21tYSc6XG5cdFx0Y2FzZSAnc2VwYXJhdG9yJzpcblx0XHRcdHJldHVybiBrZXkgPT4gKHJlc3VsdCwgdmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFtbZW5jb2RlKGtleSwgb3B0aW9ucyksICc9JywgZW5jb2RlKHZhbHVlLCBvcHRpb25zKV0uam9pbignJyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFtbcmVzdWx0LCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpXTtcblx0XHRcdH07XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIGtleSA9PiAocmVzdWx0LCB2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0dmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBOdWxsICYmIHZhbHVlID09PSBudWxsKSB8fFxuXHRcdFx0XHRcdChvcHRpb25zLnNraXBFbXB0eVN0cmluZyAmJiB2YWx1ZSA9PT0gJycpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRyZXR1cm4gWy4uLnJlc3VsdCwgZW5jb2RlKGtleSwgb3B0aW9ucyldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIFsuLi5yZXN1bHQsIFtlbmNvZGUoa2V5LCBvcHRpb25zKSwgJz0nLCBlbmNvZGUodmFsdWUsIG9wdGlvbnMpXS5qb2luKCcnKV07XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHBhcnNlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpIHtcblx0bGV0IHJlc3VsdDtcblxuXHRzd2l0Y2ggKG9wdGlvbnMuYXJyYXlGb3JtYXQpIHtcblx0XHRjYXNlICdpbmRleCc6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdHJlc3VsdCA9IC9cXFsoXFxkKilcXF0kLy5leGVjKGtleSk7XG5cblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1xcW1xcZCpcXF0kLywgJycpO1xuXG5cdFx0XHRcdGlmICghcmVzdWx0KSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0ge307XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhY2N1bXVsYXRvcltrZXldW3Jlc3VsdFsxXV0gPSB2YWx1ZTtcblx0XHRcdH07XG5cblx0XHRjYXNlICdicmFja2V0Jzpcblx0XHRcdHJldHVybiAoa2V5LCB2YWx1ZSwgYWNjdW11bGF0b3IpID0+IHtcblx0XHRcdFx0cmVzdWx0ID0gLyhcXFtcXF0pJC8uZXhlYyhrZXkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvXFxbXFxdJC8sICcnKTtcblxuXHRcdFx0XHRpZiAoIXJlc3VsdCkge1xuXHRcdFx0XHRcdGFjY3VtdWxhdG9yW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYWNjdW11bGF0b3Jba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFt2YWx1ZV07XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXG5cdFx0Y2FzZSAnY29tbWEnOlxuXHRcdGNhc2UgJ3NlcGFyYXRvcic6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGlzQXJyYXkgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnNwbGl0KCcnKS5pbmRleE9mKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpID4gLTE7XG5cdFx0XHRcdGNvbnN0IG5ld1ZhbHVlID0gaXNBcnJheSA/IHZhbHVlLnNwbGl0KG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpLm1hcChpdGVtID0+IGRlY29kZShpdGVtLCBvcHRpb25zKSkgOiB2YWx1ZSA9PT0gbnVsbCA/IHZhbHVlIDogZGVjb2RlKHZhbHVlLCBvcHRpb25zKTtcblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IG5ld1ZhbHVlO1xuXHRcdFx0fTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKGtleSwgdmFsdWUsIGFjY3VtdWxhdG9yKSA9PiB7XG5cdFx0XHRcdGlmIChhY2N1bXVsYXRvcltrZXldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhY2N1bXVsYXRvcltrZXldID0gdmFsdWU7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YWNjdW11bGF0b3Jba2V5XSA9IFtdLmNvbmNhdChhY2N1bXVsYXRvcltrZXldLCB2YWx1ZSk7XG5cdFx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlQXJyYXlGb3JtYXRTZXBhcmF0b3IodmFsdWUpIHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgdmFsdWUubGVuZ3RoICE9PSAxKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignYXJyYXlGb3JtYXRTZXBhcmF0b3IgbXVzdCBiZSBzaW5nbGUgY2hhcmFjdGVyIHN0cmluZycpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGVuY29kZSh2YWx1ZSwgb3B0aW9ucykge1xuXHRpZiAob3B0aW9ucy5lbmNvZGUpIHtcblx0XHRyZXR1cm4gb3B0aW9ucy5zdHJpY3QgPyBzdHJpY3RVcmlFbmNvZGUodmFsdWUpIDogZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlLCBvcHRpb25zKSB7XG5cdGlmIChvcHRpb25zLmRlY29kZSkge1xuXHRcdHJldHVybiBkZWNvZGVDb21wb25lbnQodmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBrZXlzU29ydGVyKGlucHV0KSB7XG5cdGlmIChBcnJheS5pc0FycmF5KGlucHV0KSkge1xuXHRcdHJldHVybiBpbnB1dC5zb3J0KCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGlucHV0ID09PSAnb2JqZWN0Jykge1xuXHRcdHJldHVybiBrZXlzU29ydGVyKE9iamVjdC5rZXlzKGlucHV0KSlcblx0XHRcdC5zb3J0KChhLCBiKSA9PiBOdW1iZXIoYSkgLSBOdW1iZXIoYikpXG5cdFx0XHQubWFwKGtleSA9PiBpbnB1dFtrZXldKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSGFzaChpbnB1dCkge1xuXHRjb25zdCBoYXNoU3RhcnQgPSBpbnB1dC5pbmRleE9mKCcjJyk7XG5cdGlmIChoYXNoU3RhcnQgIT09IC0xKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBoYXNoU3RhcnQpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufVxuXG5mdW5jdGlvbiBnZXRIYXNoKHVybCkge1xuXHRsZXQgaGFzaCA9ICcnO1xuXHRjb25zdCBoYXNoU3RhcnQgPSB1cmwuaW5kZXhPZignIycpO1xuXHRpZiAoaGFzaFN0YXJ0ICE9PSAtMSkge1xuXHRcdGhhc2ggPSB1cmwuc2xpY2UoaGFzaFN0YXJ0KTtcblx0fVxuXG5cdHJldHVybiBoYXNoO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0KGlucHV0KSB7XG5cdGlucHV0ID0gcmVtb3ZlSGFzaChpbnB1dCk7XG5cdGNvbnN0IHF1ZXJ5U3RhcnQgPSBpbnB1dC5pbmRleE9mKCc/Jyk7XG5cdGlmIChxdWVyeVN0YXJ0ID09PSAtMSkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdHJldHVybiBpbnB1dC5zbGljZShxdWVyeVN0YXJ0ICsgMSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVmFsdWUodmFsdWUsIG9wdGlvbnMpIHtcblx0aWYgKG9wdGlvbnMucGFyc2VOdW1iZXJzICYmICFOdW1iZXIuaXNOYU4oTnVtYmVyKHZhbHVlKSkgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpICE9PSAnJykpIHtcblx0XHR2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdH0gZWxzZSBpZiAob3B0aW9ucy5wYXJzZUJvb2xlYW5zICYmIHZhbHVlICE9PSBudWxsICYmICh2YWx1ZS50b0xvd2VyQ2FzZSgpID09PSAndHJ1ZScgfHwgdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZhbHNlJykpIHtcblx0XHR2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCkgPT09ICd0cnVlJztcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdGRlY29kZTogdHJ1ZSxcblx0XHRzb3J0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZScsXG5cdFx0YXJyYXlGb3JtYXRTZXBhcmF0b3I6ICcsJyxcblx0XHRwYXJzZU51bWJlcnM6IGZhbHNlLFxuXHRcdHBhcnNlQm9vbGVhbnM6IGZhbHNlXG5cdH0sIG9wdGlvbnMpO1xuXG5cdHZhbGlkYXRlQXJyYXlGb3JtYXRTZXBhcmF0b3Iob3B0aW9ucy5hcnJheUZvcm1hdFNlcGFyYXRvcik7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gcGFyc2VyRm9yQXJyYXlGb3JtYXQob3B0aW9ucyk7XG5cblx0Ly8gQ3JlYXRlIGFuIG9iamVjdCB3aXRoIG5vIHByb3RvdHlwZVxuXHRjb25zdCByZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5cdGlmICh0eXBlb2YgaW5wdXQgIT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGlucHV0ID0gaW5wdXQudHJpbSgpLnJlcGxhY2UoL15bPyMmXS8sICcnKTtcblxuXHRpZiAoIWlucHV0KSB7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZvciAoY29uc3QgcGFyYW0gb2YgaW5wdXQuc3BsaXQoJyYnKSkge1xuXHRcdGxldCBba2V5LCB2YWx1ZV0gPSBzcGxpdE9uRmlyc3Qob3B0aW9ucy5kZWNvZGUgPyBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKSA6IHBhcmFtLCAnPScpO1xuXG5cdFx0Ly8gTWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcblx0XHQvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG5cdFx0dmFsdWUgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IFsnY29tbWEnLCAnc2VwYXJhdG9yJ10uaW5jbHVkZXMob3B0aW9ucy5hcnJheUZvcm1hdCkgPyB2YWx1ZSA6IGRlY29kZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0Zm9ybWF0dGVyKGRlY29kZShrZXksIG9wdGlvbnMpLCB2YWx1ZSwgcmV0KTtcblx0fVxuXG5cdGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHJldCkpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHJldFtrZXldO1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGsgb2YgT2JqZWN0LmtleXModmFsdWUpKSB7XG5cdFx0XHRcdHZhbHVlW2tdID0gcGFyc2VWYWx1ZSh2YWx1ZVtrXSwgb3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldFtrZXldID0gcGFyc2VWYWx1ZSh2YWx1ZSwgb3B0aW9ucyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9wdGlvbnMuc29ydCA9PT0gZmFsc2UpIHtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0cmV0dXJuIChvcHRpb25zLnNvcnQgPT09IHRydWUgPyBPYmplY3Qua2V5cyhyZXQpLnNvcnQoKSA6IE9iamVjdC5rZXlzKHJldCkuc29ydChvcHRpb25zLnNvcnQpKS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0Y29uc3QgdmFsdWUgPSByZXRba2V5XTtcblx0XHRpZiAoQm9vbGVhbih2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdC8vIFNvcnQgb2JqZWN0IGtleXMsIG5vdCB2YWx1ZXNcblx0XHRcdHJlc3VsdFtrZXldID0ga2V5c1NvcnRlcih2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdFtrZXldID0gdmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG59XG5cbmV4cG9ydHMuZXh0cmFjdCA9IGV4dHJhY3Q7XG5leHBvcnRzLnBhcnNlID0gcGFyc2U7XG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gKG9iamVjdCwgb3B0aW9ucykgPT4ge1xuXHRpZiAoIW9iamVjdCkge1xuXHRcdHJldHVybiAnJztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRlbmNvZGU6IHRydWUsXG5cdFx0c3RyaWN0OiB0cnVlLFxuXHRcdGFycmF5Rm9ybWF0OiAnbm9uZScsXG5cdFx0YXJyYXlGb3JtYXRTZXBhcmF0b3I6ICcsJ1xuXHR9LCBvcHRpb25zKTtcblxuXHR2YWxpZGF0ZUFycmF5Rm9ybWF0U2VwYXJhdG9yKG9wdGlvbnMuYXJyYXlGb3JtYXRTZXBhcmF0b3IpO1xuXG5cdGNvbnN0IHNob3VsZEZpbHRlciA9IGtleSA9PiAoXG5cdFx0KG9wdGlvbnMuc2tpcE51bGwgJiYgaXNOdWxsT3JVbmRlZmluZWQob2JqZWN0W2tleV0pKSB8fFxuXHRcdChvcHRpb25zLnNraXBFbXB0eVN0cmluZyAmJiBvYmplY3Rba2V5XSA9PT0gJycpXG5cdCk7XG5cblx0Y29uc3QgZm9ybWF0dGVyID0gZW5jb2RlckZvckFycmF5Rm9ybWF0KG9wdGlvbnMpO1xuXG5cdGNvbnN0IG9iamVjdENvcHkgPSB7fTtcblxuXHRmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhvYmplY3QpKSB7XG5cdFx0aWYgKCFzaG91bGRGaWx0ZXIoa2V5KSkge1xuXHRcdFx0b2JqZWN0Q29weVtrZXldID0gb2JqZWN0W2tleV07XG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdENvcHkpO1xuXG5cdGlmIChvcHRpb25zLnNvcnQgIT09IGZhbHNlKSB7XG5cdFx0a2V5cy5zb3J0KG9wdGlvbnMuc29ydCk7XG5cdH1cblxuXHRyZXR1cm4ga2V5cy5tYXAoa2V5ID0+IHtcblx0XHRjb25zdCB2YWx1ZSA9IG9iamVjdFtrZXldO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiAnJztcblx0XHR9XG5cblx0XHRpZiAodmFsdWUgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBlbmNvZGUoa2V5LCBvcHRpb25zKTtcblx0XHR9XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdHJldHVybiB2YWx1ZVxuXHRcdFx0XHQucmVkdWNlKGZvcm1hdHRlcihrZXkpLCBbXSlcblx0XHRcdFx0LmpvaW4oJyYnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZW5jb2RlKGtleSwgb3B0aW9ucykgKyAnPScgKyBlbmNvZGUodmFsdWUsIG9wdGlvbnMpO1xuXHR9KS5maWx0ZXIoeCA9PiB4Lmxlbmd0aCA+IDApLmpvaW4oJyYnKTtcbn07XG5cbmV4cG9ydHMucGFyc2VVcmwgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcblx0cmV0dXJuIHtcblx0XHR1cmw6IHJlbW92ZUhhc2goaW5wdXQpLnNwbGl0KCc/JylbMF0gfHwgJycsXG5cdFx0cXVlcnk6IHBhcnNlKGV4dHJhY3QoaW5wdXQpLCBvcHRpb25zKVxuXHR9O1xufTtcblxuZXhwb3J0cy5zdHJpbmdpZnlVcmwgPSAoaW5wdXQsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgdXJsID0gcmVtb3ZlSGFzaChpbnB1dC51cmwpLnNwbGl0KCc/JylbMF0gfHwgJyc7XG5cdGNvbnN0IHF1ZXJ5RnJvbVVybCA9IGV4cG9ydHMuZXh0cmFjdChpbnB1dC51cmwpO1xuXHRjb25zdCBwYXJzZWRRdWVyeUZyb21VcmwgPSBleHBvcnRzLnBhcnNlKHF1ZXJ5RnJvbVVybCk7XG5cdGNvbnN0IGhhc2ggPSBnZXRIYXNoKGlucHV0LnVybCk7XG5cdGNvbnN0IHF1ZXJ5ID0gT2JqZWN0LmFzc2lnbihwYXJzZWRRdWVyeUZyb21VcmwsIGlucHV0LnF1ZXJ5KTtcblx0bGV0IHF1ZXJ5U3RyaW5nID0gZXhwb3J0cy5zdHJpbmdpZnkocXVlcnksIG9wdGlvbnMpO1xuXHRpZiAocXVlcnlTdHJpbmcpIHtcblx0XHRxdWVyeVN0cmluZyA9IGA/JHtxdWVyeVN0cmluZ31gO1xuXHR9XG5cblx0cmV0dXJuIGAke3VybH0ke3F1ZXJ5U3RyaW5nfSR7aGFzaH1gO1xufTtcbiIsIi8vIE1hcHMgbW91c2UgY29vcmRpbmF0ZSBmcm9tIGVsZW1lbnQgQ1NTIHBpeGVscyB0byBub3JtYWxpemVkIFsgMCwgMSBdIHJhbmdlLlxuZnVuY3Rpb24gY29tcHV0ZU5vcm1hbGl6ZWRQb3MoZWxlbWVudCwgZXZ0KSB7XG4gIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHggPSBldnQuY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgdmFyIHkgPSBldnQuY2xpZW50WSAtIHJlY3QudG9wO1xuICB4IC89IGVsZW1lbnQuY2xpZW50V2lkdGg7XG4gIHkgLz0gZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gIHJldHVybiBbeCwgeV07XG59XG5cbmV4cG9ydCBjbGFzcyBJbnB1dFJlY29yZGVyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHzCoHt9O1xuICB9XG5cbiAgZW5hYmxlKGZvcmNlUmVzZXQpIHtcbiAgICB0aGlzLmluaXRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgaWYgKGZvcmNlUmVzZXQpIHtcbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG4gICAgdGhpcy5pbmplY3RMaXN0ZW5lcnMoKTtcbiAgfVxuLypcbiAgZGlzYWJsZSgpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVycygpO1xuICB9XG4qL1xuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuZnJhbWVOdW1iZXIgPSAwO1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gIH1cblxuICBhZGRFdmVudCh0eXBlLCBldmVudCwgcGFyYW1ldGVycykge1xuICAgIHZhciBldmVudERhdGEgPSB7XG4gICAgICB0eXBlLFxuICAgICAgZXZlbnQsXG4gICAgICBwYXJhbWV0ZXJzXG4gICAgfTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMudXNlVGltZSkge1xuICAgICAgZXZlbnREYXRhLnRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHRoaXMuaW5pdFRpbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50RGF0YS5mcmFtZU51bWJlciA9IHRoaXMuZnJhbWVOdW1iZXI7XG4gICAgfVxuXG4gICAgdGhpcy5ldmVudHMucHVzaChldmVudERhdGEpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMubmV3RXZlbnRDYWxsYmFjaykge1xuICAgICAgdGhpcy5vcHRpb25zLm5ld0V2ZW50Q2FsbGJhY2soZXZlbnREYXRhKTtcbiAgICB9XG4gIH1cbiAgXG4gIGluamVjdExpc3RlbmVycygpIHtcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZXZ0ID0+IHtcbiAgICAgIHZhciBwb3MgPSBjb21wdXRlTm9ybWFsaXplZFBvcyh0aGlzLmVsZW1lbnQsIGV2dCk7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdtb3VzZScsICdkb3duJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcbiAgICB9KTtcbiAgXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBldnQgPT4ge1xuICAgICAgdmFyIHBvcyA9IGNvbXB1dGVOb3JtYWxpemVkUG9zKHRoaXMuZWxlbWVudCwgZXZ0KTtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ3VwJywge3g6IHBvc1swXSwgeTogcG9zWzFdLCBidXR0b246IGV2dC5idXR0b259KTtcbiAgICB9KTtcbiAgXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGV2dCA9PiB7XG4gICAgICB2YXIgcG9zID0gY29tcHV0ZU5vcm1hbGl6ZWRQb3ModGhpcy5lbGVtZW50LCBldnQpO1xuICAgICAgdGhpcy5hZGRFdmVudCgnbW91c2UnLCAnbW92ZScsIHt4OiBwb3NbMF0sIHk6IHBvc1sxXSwgYnV0dG9uOiBldnQuYnV0dG9ufSk7XG5cbiAgICB9KTtcbiAgXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMuYWRkRXZlbnQoJ21vdXNlJywgJ3doZWVsJywge1xuICAgICAgICBkZWx0YVg6IGV2dC5kZWx0YVgsXG4gICAgICAgIGRlbHRhWTogZXZ0LmRlbHRhWSxcbiAgICAgICAgZGVsdGFaOiBldnQuZGVsdGFaLFxuICAgICAgICBkZWx0YU1vZGU6IGV2dC5kZWx0YU1vZGVcbiAgICAgIH0pO1xuICAgIH0pO1xuICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdrZXknLCAnZG93bicsIHtcbiAgICAgICAga2V5Q29kZTogZXZ0LmtleUNvZGUsXG4gICAgICAgIGNoYXJDb2RlOiBldnQuY2hhckNvZGUsXG4gICAgICAgIGtleTogZXZ0LmtleVxuICAgICAgfSk7XG4gICAgfSk7XG4gIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGV2dCA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50KCdrZXknLCAndXAnLCB7XG4gICAgICAgIGtleUNvZGU6IGV2dC5rZXlDb2RlLFxuICAgICAgICBjaGFyQ29kZTogZXZ0LmNoYXJDb2RlLFxuICAgICAgICBrZXk6IGV2dC5rZXlcbiAgICAgIH0pO1xuICAgIH0pOyAgXG4gIH1cbn0iLCJcbmNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgZGlzcGF0Y2hLZXlFdmVudHNWaWFET006IHRydWUsXG4gIGRpc3BhdGNoTW91c2VFdmVudHNWaWFET006IHRydWUsXG4gIG5lZWRzQ29tcGxldGVDdXN0b21Nb3VzZUV2ZW50RmllbGRzOiBmYWxzZVxufTtcblxuXG5leHBvcnQgY2xhc3MgSW5wdXRSZXBsYXllciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHJlY29yZGluZywgcmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zKTtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMucmVjb3JkaW5nID0gcmVjb3JkaW5nO1xuICAgIHRoaXMuY3VycmVudEluZGV4ID0gMDtcbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IHJlZ2lzdGVyZWRFdmVudExpc3RlbmVyczsgLy8gSWYgPT09IG51bGwgLT4gRGlzcGF0Y2ggdG8gRE9NXG4gIH1cblxuICB0aWNrIChmcmFtZU51bWJlcikge1xuICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA+PSB0aGlzLnJlY29yZGluZy5sZW5ndGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdLmZyYW1lTnVtYmVyID4gZnJhbWVOdW1iZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB3aGlsZSAodGhpcy5jdXJyZW50SW5kZXggPCB0aGlzLnJlY29yZGluZy5sZW5ndGggJiYgdGhpcy5yZWNvcmRpbmdbdGhpcy5jdXJyZW50SW5kZXhdLmZyYW1lTnVtYmVyID09PSBmcmFtZU51bWJlcikge1xuICAgICAgY29uc3QgaW5wdXQgPSB0aGlzLnJlY29yZGluZ1t0aGlzLmN1cnJlbnRJbmRleF07XG4gICAgICBzd2l0Y2ggKGlucHV0LnR5cGUpIHtcbiAgICAgICAgY2FzZSAnbW91c2UnOiB7XG4gICAgICAgICAgaWYgKGlucHV0LmV2ZW50ID09PSAnd2hlZWwnKSB7XG4gICAgICAgICAgICB0aGlzLnNpbXVsYXRlV2hlZWxFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnBhcmFtZXRlcnMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNpbXVsYXRlTW91c2VFdmVudCh0aGlzLmVsZW1lbnQsIGlucHV0LnR5cGUgKyBpbnB1dC5ldmVudCwgaW5wdXQucGFyYW1ldGVycyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGJyZWFrO1xuICAgICAgICBjYXNlICdrZXknOiB7XG4gICAgICAgICAgdGhpcy5zaW11bGF0ZUtleUV2ZW50KHRoaXMuZWxlbWVudCwgaW5wdXQudHlwZSArIGlucHV0LmV2ZW50LCBpbnB1dC5wYXJhbWV0ZXJzKTtcbiAgICAgICAgfSBicmVhaztcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdTdGlsbCBub3QgaW1wbGVtZW50ZWQgZXZlbnQnLCBpbnB1dC50eXBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50SW5kZXgrKztcbiAgICB9XG4gIH1cblxuICBzaW11bGF0ZVdoZWVsRXZlbnQoZWxlbWVudCwgcGFyYW1ldGVycykge1xuICAgIHZhciBlID0gbmV3IEV2ZW50KCdtb3VzZXdoZWVsJywge2J1YmJsZXM6IHRydWV9KTtcblxuICAgIGNvbnN0IGV2ZW50VHlwZSA9ICdtb3VzZXdoZWVsJztcbiAgICBlLmRlbHRhWCA9IHBhcmFtZXRlcnMuZGVsdGFYO1xuICAgIGUuZGVsdGFZID0gcGFyYW1ldGVycy5kZWx0YVk7XG4gICAgZS5kZWx0YVogPSBwYXJhbWV0ZXJzLmRlbHRhWjtcblxuICAgIGUud2hlZWxEZWx0YVggPSBwYXJhbWV0ZXJzLmRlbHRhWDtcbiAgICBlLndoZWVsRGVsdGFZID0gcGFyYW1ldGVycy5kZWx0YVk7XG4gICAgZS53aGVlbERlbHRhID0gcGFyYW1ldGVycy5kZWx0YVk7XG5cbiAgICBlLmRlbHRhTW9kZSA9IHBhcmFtZXRlcnMuZGVsdGFNb2RlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSkge1xuICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0aGlzXyA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmNvbnRleHQ7XG4gICAgICAgIHZhciB0eXBlID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0udHlwZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uZnVuO1xuICAgICAgICBpZiAodHlwZSA9PSBldmVudFR5cGUpIHtcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9XG4gIH1cblxuICBzaW11bGF0ZUtleUV2ZW50KGVsZW1lbnQsIGV2ZW50VHlwZSwgcGFyYW1ldGVycykge1xuICAgIC8vIERvbid0IHVzZSB0aGUgS2V5Ym9hcmRFdmVudCBvYmplY3QgYmVjYXVzZSBvZiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg5NDI2Nzgva2V5Ym9hcmRldmVudC1pbi1jaHJvbWUta2V5Y29kZS1pcy0wLzEyNTIyNzUyIzEyNTIyNzUyXG4gICAgLy8gU2VlIGFsc28gaHR0cDovL291dHB1dC5qc2Jpbi5jb20vYXdlbmFxLzNcbiAgICAvLyAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdLZXlib2FyZEV2ZW50Jyk7XG4gICAgLy8gICAgaWYgKGUuaW5pdEtleUV2ZW50KSB7XG4gICAgLy8gICAgICBlLmluaXRLZXlFdmVudChldmVudFR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGtleUNvZGUsIGNoYXJDb2RlKTtcbiAgICAvLyAgfSBlbHNlIHtcbiAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50T2JqZWN0ID8gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QoKSA6IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRzXCIpO1xuICAgIGlmIChlLmluaXRFdmVudCkge1xuICAgICAgZS5pbml0RXZlbnQoZXZlbnRUeXBlLCB0cnVlLCB0cnVlKTtcbiAgICB9XG5cbiAgICBlLmtleUNvZGUgPSBwYXJhbWV0ZXJzLmtleUNvZGU7XG4gICAgZS53aGljaCA9IHBhcmFtZXRlcnMua2V5Q29kZTtcbiAgICBlLmNoYXJDb2RlID0gcGFyYW1ldGVycy5jaGFyQ29kZTtcbiAgICBlLnByb2dyYW1tYXRpYyA9IHRydWU7XG4gICAgZS5rZXkgPSBwYXJhbWV0ZXJzLmtleTtcblxuICAgIC8vIERpc3BhdGNoIGRpcmVjdGx5IHRvIEVtc2NyaXB0ZW4ncyBodG1sNS5oIEFQSTpcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykgJiYgdGhpcy5vcHRpb25zLmRpc3BhdGNoS2V5RXZlbnRzVmlhRE9NKSB7XG4gICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIHRoaXNfID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV0uY29udGV4dDtcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS50eXBlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5mdW47XG4gICAgICAgIGlmICh0eXBlID09IGV2ZW50VHlwZSkgbGlzdGVuZXIuY2FsbCh0aGlzXywgZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERpc3BhdGNoIHRvIGJyb3dzZXIgZm9yIHJlYWxcbiAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudCA/IGVsZW1lbnQuZGlzcGF0Y2hFdmVudChlKSA6IGVsZW1lbnQuZmlyZUV2ZW50KFwib25cIiArIGV2ZW50VHlwZSwgZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZXZlbnRUeXBlOiBcIm1vdXNlbW92ZVwiLCBcIm1vdXNlZG93blwiIG9yIFwibW91c2V1cFwiLlxuICAvLyB4IGFuZCB5OiBOb3JtYWxpemVkIGNvb3JkaW5hdGUgaW4gdGhlIHJhbmdlIFswLDFdIHdoZXJlIHRvIGluamVjdCB0aGUgZXZlbnQuXG4gIHNpbXVsYXRlTW91c2VFdmVudChlbGVtZW50LCBldmVudFR5cGUsIHBhcmFtZXRlcnMpIHtcbiAgICAvLyBSZW1hcCBmcm9tIFswLDFdIHRvIGNhbnZhcyBDU1MgcGl4ZWwgc2l6ZS5cbiAgICB2YXIgeCA9IHBhcmFtZXRlcnMueDtcbiAgICB2YXIgeSA9IHBhcmFtZXRlcnMueTtcblxuICAgIHggKj0gZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB5ICo9IGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIHZhciByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIC8vIE9mZnNldCB0aGUgaW5qZWN0ZWQgY29vcmRpbmF0ZSBmcm9tIHRvcC1sZWZ0IG9mIHRoZSBjbGllbnQgYXJlYSB0byB0aGUgdG9wLWxlZnQgb2YgdGhlIGNhbnZhcy5cbiAgICB4ID0gTWF0aC5yb3VuZChyZWN0LmxlZnQgKyB4KTtcbiAgICB5ID0gTWF0aC5yb3VuZChyZWN0LnRvcCArIHkpO1xuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50c1wiKTtcbiAgICBlLmluaXRNb3VzZUV2ZW50KGV2ZW50VHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LFxuICAgICAgICAgICAgICAgICAgICBldmVudFR5cGUgPT0gJ21vdXNlbW92ZScgPyAwIDogMSwgeCwgeSwgeCwgeSxcbiAgICAgICAgICAgICAgICAgICAgMCwgMCwgMCwgMCxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVycy5idXR0b24sIG51bGwpO1xuICAgIGUucHJvZ3JhbW1hdGljID0gdHJ1ZTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKSAmJiB0aGlzLm9wdGlvbnMuZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSkge1xuICAgICAgLy8gUHJvZ3JhbW1hdGljYWxseSByZWF0aW5nIERPTSBldmVudHMgZG9lc24ndCBhbGxvdyBzcGVjaWZ5aW5nIG9mZnNldFggJiBvZmZzZXRZIHByb3Blcmx5XG4gICAgICAvLyBmb3IgdGhlIGVsZW1lbnQsIGJ1dCB0aGV5IG11c3QgYmUgdGhlIHNhbWUgYXMgY2xpZW50WCAmIGNsaWVudFkuIFRoZXJlZm9yZSB3ZSBjYW4ndCBoYXZlIGFcbiAgICAgIC8vIGJvcmRlciB0aGF0IHdvdWxkIG1ha2UgdGhlc2UgZGlmZmVyZW50LlxuICAgICAgaWYgKGVsZW1lbnQuY2xpZW50V2lkdGggIT0gZWxlbWVudC5vZmZzZXRXaWR0aFxuICAgICAgICB8fCBlbGVtZW50LmNsaWVudEhlaWdodCAhPSBlbGVtZW50Lm9mZnNldEhlaWdodCkge1xuICAgICAgICB0aHJvdyBcIkVSUk9SISBDYW52YXMgb2JqZWN0IG11c3QgaGF2ZSAwcHggYm9yZGVyIGZvciBkaXJlY3QgbW91c2UgZGlzcGF0Y2ggdG8gd29yayFcIjtcbiAgICAgIH1cbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdGhpc18gPSB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVyc1tpXS5jb250ZXh0O1xuICAgICAgICB2YXIgdHlwZSA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLnR5cGU7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldLmZ1bjtcbiAgICAgICAgaWYgKHR5cGUgPT0gZXZlbnRUeXBlKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5uZWVkc0NvbXBsZXRlQ3VzdG9tTW91c2VFdmVudEZpZWxkcykge1xuICAgICAgICAgICAgLy8gSWYgbmVlZHNDb21wbGV0ZUN1c3RvbU1vdXNlRXZlbnRGaWVsZHMgaXMgc2V0LCB0aGUgcGFnZSBuZWVkcyBhIGZ1bGwgc2V0IG9mIGF0dHJpYnV0ZXNcbiAgICAgICAgICAgIC8vIHNwZWNpZmllZCBpbiB0aGUgTW91c2VFdmVudCBvYmplY3QuIEhvd2V2ZXIgbW9zdCBmaWVsZHMgb24gTW91c2VFdmVudCBhcmUgcmVhZC1vbmx5LCBzbyBjcmVhdGVcbiAgICAgICAgICAgIC8vIGEgbmV3IGN1c3RvbSBvYmplY3QgKHdpdGhvdXQgcHJvdG90eXBlIGNoYWluKSB0byBob2xkIHRoZSBvdmVycmlkZGVuIHByb3BlcnRpZXMuXG4gICAgICAgICAgICB2YXIgZXZ0ID0ge1xuICAgICAgICAgICAgICBjdXJyZW50VGFyZ2V0OiB0aGlzXyxcbiAgICAgICAgICAgICAgc3JjRWxlbWVudDogdGhpc18sXG4gICAgICAgICAgICAgIHRhcmdldDogdGhpc18sXG4gICAgICAgICAgICAgIGZyb21FbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgdG9FbGVtZW50OiB0aGlzXyxcbiAgICAgICAgICAgICAgZXZlbnRQaGFzZTogMiwgLy8gRXZlbnQuQVRfVEFSR0VUXG4gICAgICAgICAgICAgIGJ1dHRvbnM6IChldmVudFR5cGUgPT0gJ21vdXNlZG93bicpID8gMSA6IDAsXG4gICAgICAgICAgICAgIGJ1dHRvbjogZS5idXR0b24sXG4gICAgICAgICAgICAgIGFsdEtleTogZS5hbHRLZXksXG4gICAgICAgICAgICAgIGJ1YmJsZXM6IGUuYnViYmxlcyxcbiAgICAgICAgICAgICAgY2FuY2VsQnViYmxlOiBlLmNhbmNlbEJ1YmJsZSxcbiAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZS5jYW5jZWxhYmxlLFxuICAgICAgICAgICAgICBjbGllbnRYOiBlLmNsaWVudFgsXG4gICAgICAgICAgICAgIGNsaWVudFk6IGUuY2xpZW50WSxcbiAgICAgICAgICAgICAgY3RybEtleTogZS5jdHJsS2V5LFxuICAgICAgICAgICAgICBkZWZhdWx0UHJldmVudGVkOiBlLmRlZmF1bHRQcmV2ZW50ZWQsXG4gICAgICAgICAgICAgIGRldGFpbDogZS5kZXRhaWwsXG4gICAgICAgICAgICAgIGlkZW50aWZpZXI6IGUuaWRlbnRpZmllcixcbiAgICAgICAgICAgICAgaXNUcnVzdGVkOiBlLmlzVHJ1c3RlZCxcbiAgICAgICAgICAgICAgbGF5ZXJYOiBlLmxheWVyWCxcbiAgICAgICAgICAgICAgbGF5ZXJZOiBlLmxheWVyWSxcbiAgICAgICAgICAgICAgbWV0YUtleTogZS5tZXRhS2V5LFxuICAgICAgICAgICAgICBtb3ZlbWVudFg6IGUubW92ZW1lbnRYLFxuICAgICAgICAgICAgICBtb3ZlbWVudFk6IGUubW92ZW1lbnRZLFxuICAgICAgICAgICAgICBvZmZzZXRYOiBlLm9mZnNldFgsXG4gICAgICAgICAgICAgIG9mZnNldFk6IGUub2Zmc2V0WSxcbiAgICAgICAgICAgICAgcGFnZVg6IGUucGFnZVgsXG4gICAgICAgICAgICAgIHBhZ2VZOiBlLnBhZ2VZLFxuICAgICAgICAgICAgICBwYXRoOiBlLnBhdGgsXG4gICAgICAgICAgICAgIHJlbGF0ZWRUYXJnZXQ6IGUucmVsYXRlZFRhcmdldCxcbiAgICAgICAgICAgICAgcmV0dXJuVmFsdWU6IGUucmV0dXJuVmFsdWUsXG4gICAgICAgICAgICAgIHNjcmVlblg6IGUuc2NyZWVuWCxcbiAgICAgICAgICAgICAgc2NyZWVuWTogZS5zY3JlZW5ZLFxuICAgICAgICAgICAgICBzaGlmdEtleTogZS5zaGlmdEtleSxcbiAgICAgICAgICAgICAgc291cmNlQ2FwYWJpbGl0aWVzOiBlLnNvdXJjZUNhcGFiaWxpdGllcyxcbiAgICAgICAgICAgICAgdGltZVN0YW1wOiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgICAgICAgdHlwZTogZS50eXBlLFxuICAgICAgICAgICAgICB2aWV3OiBlLnZpZXcsXG4gICAgICAgICAgICAgIHdoaWNoOiBlLndoaWNoLFxuICAgICAgICAgICAgICB4OiBlLngsXG4gICAgICAgICAgICAgIHk6IGUueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodGhpc18sIGV2dCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoZSByZWd1bGFyICdlJyBvYmplY3QgaXMgZW5vdWdoIChpdCBkb2Vzbid0IHBvcHVsYXRlIGFsbCBvZiB0aGUgc2FtZSBmaWVsZHMgdGhhbiBhIHJlYWwgbW91c2UgZXZlbnQgZG9lcywgXG4gICAgICAgICAgICAvLyBzbyB0aGlzIG1pZ2h0IG5vdCB3b3JrIG9uIHNvbWUgZGVtb3MpXG4gICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNfLCBlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGlzcGF0Y2ggZGlyZWN0bHkgdG8gYnJvd3NlclxuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRMaXN0ZW5lck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgLy8gRG9uJ3QgY2FsbCBhbnkgYXBwbGljYXRpb24gcGFnZSB1bmxvYWQgaGFuZGxlcnMgYXMgYSByZXNwb25zZSB0byB3aW5kb3cgYmVpbmcgY2xvc2VkLlxuICBlbnN1cmVOb0NsaWVudEhhbmRsZXJzKCkge1xuICAgIC8vIFRoaXMgaXMgYSBiaXQgdHJpY2t5IHRvIG1hbmFnZSwgc2luY2UgdGhlIHBhZ2UgY291bGQgcmVnaXN0ZXIgdGhlc2UgaGFuZGxlcnMgYXQgYW55IHBvaW50LFxuICAgIC8vIHNvIGtlZXAgd2F0Y2hpbmcgZm9yIHRoZW0gYW5kIHJlbW92ZSB0aGVtIGlmIGFueSBhcmUgYWRkZWQuIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzXG4gICAgLy8gaW4gYSBzZW1pLXBvbGxpbmcgZmFzaGlvbiB0byBlbnN1cmUgdGhlc2UgYXJlIG5vdCBvdmVycmlkZGVuLlxuICAgIGlmICh3aW5kb3cub25iZWZvcmV1bmxvYWQpIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbnVubG9hZCkgd2luZG93Lm9udW5sb2FkID0gbnVsbDtcbiAgICBpZiAod2luZG93Lm9uYmx1cikgd2luZG93Lm9uYmx1ciA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbmZvY3VzKSB3aW5kb3cub25mb2N1cyA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbnBhZ2VoaWRlKSB3aW5kb3cub25wYWdlaGlkZSA9IG51bGw7XG4gICAgaWYgKHdpbmRvdy5vbnBhZ2VzaG93KSB3aW5kb3cub25wYWdlc2hvdyA9IG51bGw7XG4gIH1cblxuICB1bmxvYWRBbGxFdmVudEhhbmRsZXJzKCkge1xuICAgIGZvcih2YXIgaSBpbiB0aGlzLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycykge1xuICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnNbaV07XG4gICAgICBsaXN0ZW5lci5jb250ZXh0LnJlbW92ZUV2ZW50TGlzdGVuZXIobGlzdGVuZXIudHlwZSwgbGlzdGVuZXIuZnVuLCBsaXN0ZW5lci51c2VDYXB0dXJlKTtcbiAgICB9XG4gICAgdGhpcy5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgXG4gICAgLy8gTWFrZSBzdXJlIG5vIFhIUnMgYXJlIGJlaW5nIGhlbGQgb24gdG8gZWl0aGVyLlxuICAgIC8vcHJlbG9hZGVkWEhScyA9IHt9O1xuICAgIC8vbnVtUHJlbG9hZFhIUnNJbkZsaWdodCA9IDA7XG4gICAgLy9YTUxIdHRwUmVxdWVzdCA9IHJlYWxYTUxIdHRwUmVxdWVzdDtcbiAgXG4gICAgdGhpcy5lbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4gIH1cblxuICAvL2lmIChpbmplY3RpbmdJbnB1dFN0cmVhbSlcbiAgZW5hYmxlKCkge1xuXG4gICAgLy8gRmlsdGVyIHRoZSBwYWdlIGV2ZW50IGhhbmRsZXJzIHRvIG9ubHkgcGFzcyBwcm9ncmFtbWF0aWNhbGx5IGdlbmVyYXRlZCBldmVudHMgdG8gdGhlIHNpdGUgLSBhbGwgcmVhbCB1c2VyIGlucHV0IG5lZWRzIHRvIGJlIGRpc2NhcmRlZCBzaW5jZSB3ZSBhcmVcbiAgICAvLyBkb2luZyBhIHByb2dyYW1tYXRpYyBydW4uXG4gICAgdmFyIG92ZXJyaWRkZW5NZXNzYWdlVHlwZXMgPSBbJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlbW92ZScsXG4gICAgICAnY2xpY2snLCAnZGJsY2xpY2snLCAna2V5ZG93bicsICdrZXlwcmVzcycsICdrZXl1cCcsXG4gICAgICAncG9pbnRlcmxvY2tjaGFuZ2UnLCAncG9pbnRlcmxvY2tlcnJvcicsICd3ZWJraXRwb2ludGVybG9ja2NoYW5nZScsICd3ZWJraXRwb2ludGVybG9ja2Vycm9yJywgJ21venBvaW50ZXJsb2NrY2hhbmdlJywgJ21venBvaW50ZXJsb2NrZXJyb3InLCAnbXNwb2ludGVybG9ja2NoYW5nZScsICdtc3BvaW50ZXJsb2NrZXJyb3InLCAnb3BvaW50ZXJsb2NrY2hhbmdlJywgJ29wb2ludGVybG9ja2Vycm9yJyxcbiAgICAgICdkZXZpY2Vtb3Rpb24nLCAnZGV2aWNlb3JpZW50YXRpb24nLFxuICAgICAgJ21vdXNlZW50ZXInLCAnbW91c2VsZWF2ZScsXG4gICAgICAnbW91c2V3aGVlbCcsICd3aGVlbCcsICdXaGVlbEV2ZW50JywgJ0RPTU1vdXNlU2Nyb2xsJywgJ2NvbnRleHRtZW51JyxcbiAgICAgICdibHVyJywgJ2ZvY3VzJywgJ3Zpc2liaWxpdHljaGFuZ2UnLCAnYmVmb3JldW5sb2FkJywgJ3VubG9hZCcsICdlcnJvcicsXG4gICAgICAncGFnZWhpZGUnLCAncGFnZXNob3cnLCAnb3JpZW50YXRpb25jaGFuZ2UnLCAnZ2FtZXBhZGNvbm5lY3RlZCcsICdnYW1lcGFkZGlzY29ubmVjdGVkJyxcbiAgICAgICdmdWxsc2NyZWVuY2hhbmdlJywgJ2Z1bGxzY3JlZW5lcnJvcicsICdtb3pmdWxsc2NyZWVuY2hhbmdlJywgJ21vemZ1bGxzY3JlZW5lcnJvcicsXG4gICAgICAnTVNGdWxsc2NyZWVuQ2hhbmdlJywgJ01TRnVsbHNjcmVlbkVycm9yJywgJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCAnd2Via2l0ZnVsbHNjcmVlbmVycm9yJyxcbiAgICAgICd0b3VjaHN0YXJ0JywgJ3RvdWNobW92ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcsXG4gICAgICAnd2ViZ2xjb250ZXh0bG9zdCcsICd3ZWJnbGNvbnRleHRyZXN0b3JlZCcsXG4gICAgICAnbW91c2VvdmVyJywgJ21vdXNlb3V0JywgJ3BvaW50ZXJvdXQnLCAncG9pbnRlcmRvd24nLCAncG9pbnRlcm1vdmUnLCAncG9pbnRlcnVwJywgJ3RyYW5zaXRpb25lbmQnXTtcblxuICAgIC8vIFNvbWUgZ2FtZSBkZW1vcyBwcm9ncmFtbWF0aWNhbGx5IGZpcmUgdGhlIHJlc2l6ZSBldmVudC4gRm9yIEZpcmVmb3ggYW5kIENocm9tZSxcbiAgICAvLyB3ZSBkZXRlY3QgdGhpcyB2aWEgZXZlbnQuaXNUcnVzdGVkIGFuZCBrbm93IHRvIGNvcnJlY3RseSBwYXNzIGl0IHRocm91Z2gsIGJ1dCB0byBtYWtlIFNhZmFyaSBoYXBweSxcbiAgICAvLyBpdCdzIGp1c3QgZWFzaWVyIHRvIGxldCByZXNpemUgY29tZSB0aHJvdWdoIGZvciB0aG9zZSBkZW1vcyB0aGF0IG5lZWQgaXQuXG4gICAgLy8gaWYgKCFNb2R1bGVbJ3BhZ2VOZWVkc1Jlc2l6ZUV2ZW50J10pIG92ZXJyaWRkZW5NZXNzYWdlVHlwZXMucHVzaCgncmVzaXplJyk7XG5cbiAgICAvLyBJZiBjb250ZXh0IGlzIHNwZWNpZmllZCwgYWRkRXZlbnRMaXN0ZW5lciBpcyBjYWxsZWQgdXNpbmcgdGhhdCBhcyB0aGUgJ3RoaXMnIG9iamVjdC4gT3RoZXJ3aXNlIHRoZSBjdXJyZW50IHRoaXMgaXMgdXNlZC5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGRpc3BhdGNoTW91c2VFdmVudHNWaWFET00gPSBmYWxzZTtcbiAgICB2YXIgZGlzcGF0Y2hLZXlFdmVudHNWaWFET00gPSBmYWxzZTtcbiAgICBmdW5jdGlvbiByZXBsYWNlRXZlbnRMaXN0ZW5lcihvYmosIGNvbnRleHQpIHtcbiAgICAgIHZhciByZWFsQWRkRXZlbnRMaXN0ZW5lciA9IG9iai5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgICAgICBzZWxmLmVuc3VyZU5vQ2xpZW50SGFuZGxlcnMoKTtcbiAgICAgICAgaWYgKG92ZXJyaWRkZW5NZXNzYWdlVHlwZXMuaW5kZXhPZih0eXBlKSAhPSAtMSkge1xuICAgICAgICAgIHZhciByZWdpc3Rlckxpc3RlbmVyVG9ET00gPVxuICAgICAgICAgICAgICAgKHR5cGUuaW5kZXhPZignbW91c2UnKSA9PT0gLTEgfHwgZGlzcGF0Y2hNb3VzZUV2ZW50c1ZpYURPTSlcbiAgICAgICAgICAgICYmICh0eXBlLmluZGV4T2YoJ2tleScpID09PSAtMSB8fCBkaXNwYXRjaEtleUV2ZW50c1ZpYURPTSk7XG4gICAgICAgICAgdmFyIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpIHsgdHJ5IHsgaWYgKGUucHJvZ3JhbW1hdGljIHx8ICFlLmlzVHJ1c3RlZCkgbGlzdGVuZXIoZSk7IH0gY2F0Y2goZSkge30gfTtcbiAgICAgICAgICAvLyEhISB2YXIgZmlsdGVyZWRFdmVudExpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgICAgICAgaWYgKHJlZ2lzdGVyTGlzdGVuZXJUb0RPTSkgcmVhbEFkZEV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMucHVzaCh7XG4gICAgICAgICAgICBjb250ZXh0OiBjb250ZXh0IHx8IHRoaXMsXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgZnVuOiBmaWx0ZXJlZEV2ZW50TGlzdGVuZXIsXG4gICAgICAgICAgICB1c2VDYXB0dXJlOiB1c2VDYXB0dXJlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVhbEFkZEV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBzZWxmLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycy5wdXNoKHtcbiAgICAgICAgICAgIGNvbnRleHQ6IGNvbnRleHQgfHwgdGhpcyxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBmdW46IGxpc3RlbmVyLFxuICAgICAgICAgICAgdXNlQ2FwdHVyZTogdXNlQ2FwdHVyZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciByZWFsUmVtb3ZlRXZlbnRMaXN0ZW5lciA9IG9iai5yZW1vdmVFdmVudExpc3RlbmVyO1xuXG4gICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCB1c2VDYXB0dXJlKSB7XG4gICAgICAgIC8vIGlmIChyZWdpc3Rlckxpc3RlbmVyVG9ET00pXG4gICAgICAgIC8vcmVhbFJlbW92ZUV2ZW50TGlzdGVuZXIuY2FsbChjb250ZXh0IHx8IHRoaXMsIHR5cGUsIGZpbHRlcmVkRXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZXZlbnRMaXN0ZW5lciA9IHNlbGYucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzW2ldO1xuICAgICAgICAgIGlmIChldmVudExpc3RlbmVyLmNvbnRleHQgPT09IHRoaXMgJiYgZXZlbnRMaXN0ZW5lci50eXBlID09PSB0eXBlICYmIGV2ZW50TGlzdGVuZXIuZnVuID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgICAgc2VsZi5yZWdpc3RlcmVkRXZlbnRMaXN0ZW5lcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBFdmVudFRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJlcGxhY2VFdmVudExpc3RlbmVyKEV2ZW50VGFyZ2V0LnByb3RvdHlwZSwgbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICB2YXIgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UgPSBbd2luZG93LCBkb2N1bWVudCwgZG9jdW1lbnQuYm9keSwgTW9kdWxlWydjYW52YXMnXV07XG4gICAgICAvLyBpZiAoTW9kdWxlWydleHRyYURvbUVsZW1lbnRzV2l0aEV2ZW50TGlzdGVuZXJzJ10pIGV2ZW50TGlzdGVuZXJPYmplY3RzVG9SZXBsYWNlID0gZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2UuY29uY2F0KE1vZHVsZVsnZXh0cmFEb21FbGVtZW50c1dpdGhFdmVudExpc3RlbmVycyddKTtcbiAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZS5sZW5ndGg7ICsraSkge1xuICAgICAgICByZXBsYWNlRXZlbnRMaXN0ZW5lcihldmVudExpc3RlbmVyT2JqZWN0c1RvUmVwbGFjZVtpXSwgZXZlbnRMaXN0ZW5lck9iamVjdHNUb1JlcGxhY2VbaV0pO1xuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG4gIH0gICAgXG59IiwiY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBmb250U2l6ZTogMTYsXG4gIGtleVN0cm9rZURlbGF5OiAyMDAsIC8vIFRpbWUgYmVmb3JlIHRoZSBsaW5lIGJyZWFrc1xuICBsaW5nZXJEZWxheTogMTAwMCwgLy8gVGltZSBiZWZvcmUgdGhlIHRleHQgZmFkZXMgYXdheVxuICBmYWRlRHVyYXRpb246IDEwMDAsXG4gIGJlemVsQ29sb3I6ICcjMDAwJyxcbiAgdGV4dENvbG9yOiAnI2ZmZicsXG4gIHVubW9kaWZpZWRLZXk6IHRydWUsIC8vIElmIHByZXNzaW5nIEFsdCtlIHNob3cgZSwgaW5zdGVhZCBvZiDigqxcbiAgc2hvd1N5bWJvbDogdHJ1ZSwgLy8gQ29udmVydCBBcnJvd0xlZnQgb24gLT5cbiAgYXBwZW5kTW9kaWZpZXJzOiB7TWV0YTogdHJ1ZSwgQWx0OiB0cnVlLCBTaGlmdDogZmFsc2V9LCAvLyBBcHBlbmQgbW9kaWZpZXIgdG8ga2V5IGFsbCB0aGUgdGltZVxuICBwb3NpdGlvbjogJ2JvdHRvbS1sZWZ0JyAvLyBib3R0b20tbGVmdCwgYm90dG9tLXJpZ2h0LCB0b3AtbGVmdCwgdG9wLXJpZ2h0XG59O1xuXG5jbGFzcyBLZXlzdHJva2VWaXN1YWxpemVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIHRoaXMuY29udGFpbmVyID0gbnVsbDtcbiAgICB0aGlzLnN0eWxlID0gbnVsbDtcbiAgICB0aGlzLmtleVN0cm9rZVRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMub3B0aW9ucyA9IHt9O1xuICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICB0aGlzLmtleWRvd24gPSB0aGlzLmtleWRvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmtleXVwID0gdGhpcy5rZXl1cC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY2xlYW5VcCgpIHtcbiAgICBmdW5jdGlvbiByZW1vdmVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVtb3ZlTm9kZSh0aGlzLmNvbnRhaW5lcik7XG4gICAgcmVtb3ZlTm9kZSh0aGlzLnN0eWxlKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5rZXlTdHJva2VUaW1lb3V0KTtcbiAgICB0aGlzLmN1cnJlbnRDaHVuayA9IG51bGw7XG4gICAgdGhpcy5jb250YWluZXIgPSB0aGlzLnN0eWxlID0gbnVsbDtcblxuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgfVxuXG4gIGluamVjdENvbXBvbmVudHMoKSB7ICAgIFxuICAgIC8vIEFkZCBjb250YWluZXJcbiAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NOYW1lID0gJ2tleXN0cm9rZXMnO1xuICAgIFxuICAgIGNvbnN0IHBvc2l0aW9ucyA9IHtcbiAgICAgICdib3R0b20tbGVmdCc6ICdib3R0b206IDA7IGxlZnQ6IDA7JyxcbiAgICAgICdib3R0b20tcmlnaHQnOiAnYm90dG9tOiAwOyByaWdodDogMDsnLFxuICAgICAgJ3RvcC1sZWZ0JzogJ3RvcDogMDsgbGVmdDogMDsnLFxuICAgICAgJ3RvcC1yaWdodCc6ICd0b3A6IDA7IHJpZ2h0OiAwOycsXG4gICAgfTtcblxuICAgIGlmICghcG9zaXRpb25zW3RoaXMub3B0aW9ucy5wb3NpdGlvbl0pIHtcbiAgICAgIGNvbnNvbGUud2FybihgSW52YWxpZCBwb3NpdGlvbiAnJHt0aGlzLm9wdGlvbnMucG9zaXRpb259JywgdXNpbmcgZGVmYXVsdCAnYm90dG9tLWxlZnQnLiBWYWxpZCBwb3NpdGlvbnM6IGAsIE9iamVjdC5rZXlzKHBvc2l0aW9ucykpO1xuICAgICAgdGhpcy5vcHRpb25zLnBvc2l0aW9uID0gJ2JvdHRvbS1sZWZ0JztcbiAgICB9XG5cbiAgICAvLyBBZGQgY2xhc3Nlc1xuICAgIHRoaXMuc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgIHRoaXMuc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgdWwua2V5c3Ryb2tlcyB7XG4gICAgICAgIHBhZGRpbmctbGVmdDogMTBweDtcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xuICAgICAgICAke3Bvc2l0aW9uc1t0aGlzLm9wdGlvbnMucG9zaXRpb25dfVxuICAgICAgfVxuICAgICAgXG4gICAgICB1bC5rZXlzdHJva2VzIGxpIHtcbiAgICAgICAgZm9udC1mYW1pbHk6IEFyaWFsO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke3RoaXMub3B0aW9ucy5iZXplbENvbG9yfTtcbiAgICAgICAgb3BhY2l0eTogMC45O1xuICAgICAgICBjb2xvcjogJHt0aGlzLm9wdGlvbnMudGV4dENvbG9yfTtcbiAgICAgICAgcGFkZGluZzogNXB4IDEwcHg7XG4gICAgICAgIG1hcmdpbi1ib3R0b206IDVweDtcbiAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgZm9udC1zaXplOiAke3RoaXMub3B0aW9ucy5mb250U2l6ZX1weDtcbiAgICAgICAgZGlzcGxheTogdGFibGU7XG4gICAgICAgIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAke3RoaXMub3B0aW9ucy5mYWRlRHVyYXRpb259bXMgbGluZWFyO1xuICAgICAgICB0cmFuc2l0aW9uOiBvcGFjaXR5ICR7dGhpcy5vcHRpb25zLmZhZGVEdXJhdGlvbn1tcyBsaW5lYXI7XG4gICAgICB9YDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuc3R5bGUpO1xuICB9XG5cbiAgY29udmVydEtleVRvU3ltYm9sKGtleSkge1xuICAgIGNvbnN0IGNvbnZlcnNpb25Db21tb24gPSB7XG4gICAgICAnQXJyb3dSaWdodCc6ICfihpInLFxuICAgICAgJ0Fycm93TGVmdCc6ICfihpAnLFxuICAgICAgJ0Fycm93VXAnOiAn4oaRJyxcbiAgICAgICdBcnJvd0Rvd24nOiAn4oaTJyxcbiAgICAgICcgJzogJ+KQoycsXG4gICAgICAnRW50ZXInOiAn4oapJyxcbiAgICAgICdTaGlmdCc6ICfih6cnLFxuICAgICAgJ1NoaWZ0UmlnaHQnOiAn4oenJyxcbiAgICAgICdTaGlmdExlZnQnOiAn4oenJyxcbiAgICAgICdDb250cm9sJzogJ+KMgycsXG4gICAgICAnVGFiJzogJ+KGuScsXG4gICAgICAnQ2Fwc0xvY2snOiAn4oeqJ1xuICAgIH07XG5cbiAgICBjb25zdCBjb252ZXJzaW9uTWFjID0ge1xuICAgICAgJ0FsdCc6ICfijKUnLFxuICAgICAgJ0FsdExlZnQnOiAn4oylJyxcbiAgICAgICdBbHRSaWdodCc6ICfijKUnLFxuICAgICAgJ0RlbGV0ZSc6ICfijKYnLFxuICAgICAgJ0VzY2FwZSc6ICfijosnLFxuICAgICAgJ0JhY2tzcGFjZSc6ICfijKsnLFxuICAgICAgJ01ldGEnOiAn4oyYJyxcbiAgICAgICdUYWInOiAn4oelJyxcbiAgICAgICdQYWdlRG93bic6ICfih58nLFxuICAgICAgJ1BhZ2VVcCc6ICfih54nLFxuICAgICAgJ0hvbWUnOiAn4oaWJyxcbiAgICAgICdFbmQnOiAn4oaYJ1xuICAgIH07XG5cbiAgICByZXR1cm4gKG5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyA/IGNvbnZlcnNpb25NYWNba2V5XSA6IG51bGwgKSB8fCBjb252ZXJzaW9uQ29tbW9uW2tleV0gfHwga2V5O1xuICB9XG5cbiAga2V5ZG93bihlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykge1xuICAgICAgdGhpcy5jdXJyZW50Q2h1bmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jdXJyZW50Q2h1bmspO1xuICAgIH1cbiAgICBcbiAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy51bm1vZGlmaWVkS2V5KSB7XG4gICAgICBpZiAoZS5jb2RlLmluZGV4T2YoJ0tleScpICE9PSAtMSkge1xuICAgICAgICBrZXkgPSBlLmNvZGUucmVwbGFjZSgnS2V5JywgJycpO1xuICAgICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBtb2RpZmllciA9ICcnO1xuICAgIFxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLk1ldGEgJiYgZS5tZXRhS2V5ICYmIGUua2V5ICE9PSAnTWV0YScpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ01ldGEnKTsgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXBwZW5kTW9kaWZpZXJzLkFsdCAmJiBlLmFsdEtleSAmJiBlLmtleSAhPT0gJ0FsdCcpIHsgbW9kaWZpZXIgKz0gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woJ0FsdCcpOyB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5hcHBlbmRNb2RpZmllcnMuU2hpZnQgJiYgZS5zaGlmdEtleSAmJiBlLmtleSAhPT0gJ1NoaWZ0JykgeyBtb2RpZmllciArPSB0aGlzLmNvbnZlcnRLZXlUb1N5bWJvbCgnU2hpZnQnKTsgfVxuICAgIHRoaXMuY3VycmVudENodW5rLnRleHRDb250ZW50ICs9IG1vZGlmaWVyICsgKHRoaXMub3B0aW9ucy5zaG93U3ltYm9sID8gdGhpcy5jb252ZXJ0S2V5VG9TeW1ib2woa2V5KSA6IGtleSk7XG4gIH1cblxuICBrZXl1cChlKSB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRDaHVuaykgcmV0dXJuO1xuICAgIFxuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMua2V5U3Ryb2tlVGltZW91dCk7XG4gICAgdGhpcy5rZXlTdHJva2VUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAoZnVuY3Rpb24ocHJldmlvdXNDaHVuaykge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBwcmV2aW91c0NodW5rLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge3ByZXZpb3VzQ2h1bmsucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwcmV2aW91c0NodW5rKX0sIG9wdGlvbnMuZmFkZUR1cmF0aW9uKTtcbiAgICAgICAgfSwgb3B0aW9ucy5saW5nZXJEZWxheSk7XG4gICAgICB9KSh0aGlzLmN1cnJlbnRDaHVuayk7XG4gICAgICBcbiAgICAgIHRoaXMuY3VycmVudENodW5rID0gbnVsbDtcbiAgICB9LCBvcHRpb25zLmtleVN0cm9rZURlbGF5KTtcbiAgfVxuXG4gIGVuYWJsZShvcHRpb25zKSB7XG4gICAgdGhpcy5jbGVhblVwKCk7ICAgIFxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oIHt9LCBERUZBVUxUX09QVElPTlMsIG9wdGlvbnMgfHwgdGhpcy5vcHRpb25zKTtcbiAgICB0aGlzLmluamVjdENvbXBvbmVudHMoKTsgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5rZXlkb3duKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB0aGlzLmtleXVwKTtcbiAgfVxuXG4gIGRpc2FibGUoKSB7XG4gICAgdGhpcy5jbGVhblVwKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEtleXN0cm9rZVZpc3VhbGl6ZXIoKTsiLCJpbXBvcnQgS2V5c3Ryb2tlVmlzdWFsaXplciBmcm9tICdrZXlzdHJva2UtdmlzdWFsaXplcic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0SGVscGVycyB7XG4gIGluaXRLZXlzKCkge1xuICAgIEtleXN0cm9rZVZpc3VhbGl6ZXIuZW5hYmxlKHt1bm1vZGlmaWVkS2V5OiBmYWxzZX0pO1xuICB9XG5cbiAgaW5pdE1vdXNlKCkge1xuICAgIHRoaXMubW91c2VEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLm1vdXNlRGl2LmlkPSdtb3VzZWRpdic7XG4gICAgdGhpcy5tb3VzZUNsaWNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5tb3VzZUNsaWNrLmlkPSdtb3VzZWNsaWNrJztcbiAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgICAgIHdpZHRoOiAzMHB4O1xuICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgYmFja2dyb3VuZDogI2ZmZjtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIGxlZnQ6IDBweDtcbiAgICAgIHRvcDogMHB4O1xuICAgICAgYm9yZGVyOiAzcHggc29saWQgYmxhY2s7XG4gICAgICBvcGFjaXR5OiAwLjU7XG4gICAgICB2aXNpYmlsaXR5OiBoaWRkZW47XG4gICAgYDtcblxuICAgIHRoaXMubW91c2VEaXYuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHdpZHRoOiAzMHB4O1xuICAgICAgaGVpZ2h0OiAzMHB4O1xuICAgICAgbGVmdDogMHB4O1xuICAgICAgdG9wOiAwcHg7XG4gICAgICBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJy9jdXJzb3Iuc3ZnJyk7XG4gICAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAtOHB4IC01cHg7XG4gICAgICB6LWluZGV4OiA5OTk5O1xuICAgIGA7XG4gICAgXG4gICAgdGhpcy5jYW52YXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzLm1vdXNlRGl2KTtcbiAgICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMubW91c2VDbGljayk7XG5cbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICB0aGlzLm1vdXNlRGl2LnN0eWxlLmxlZnQgPSBldnQueCArIFwicHhcIjtcbiAgICAgIHRoaXMubW91c2VEaXYuc3R5bGUudG9wID0gZXZ0LnkgKyBcInB4XCI7XG5cbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS5sZWZ0ID0gYCR7ZXZ0LnggLSAxMn1weGA7XG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUudG9wID0gYCR7ZXZ0LnkgLSA3fXB4YDtcbiAgICB9KTtcblxuICAgIHRoaXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGV2dCA9PiB7XG4gICAgICB0aGlzLm1vdXNlQ2xpY2suc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICB9KTtcbiAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMubW91c2VDbGljay5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgfSk7XG5cbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChjYW52YXMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2hvdy1rZXlzJykgIT09IC0xKSB7XG4gICAgICB0aGlzLmluaXRLZXlzKCk7XG4gICAgfVxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzaG93LW1vdXNlJykgIT09IC0xKSB7XG4gICAgICB0aGlzLmluaXRNb3VzZSgpO1xuICAgIH1cbiAgfVxufSIsInZhciBDb250ZXh0ID0gd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCA/IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgOiB3aW5kb3cuQXVkaW9Db250ZXh0O1xudmFyIG9yaURlY29kZURhdGEgPSBDb250ZXh0LnByb3RvdHlwZS5kZWNvZGVBdWRpb0RhdGE7XG5cbnZhciBXZWJBdWRpb0hvb2sgPSB7XG4gIHN0YXRzOiB7XG4gICAgbnVtQXVkaW9CdWZmZXJzOiAwLFxuICAgIHRvdGFsRHVyYXRpb246IDAsXG4gICAgdG90YWxMZW5ndGg6IDAsXG4gICAgdG90YWxEZWNvZGVUaW1lOiAwXG4gIH0sXG4gIGVuYWJsZTogZnVuY3Rpb24gKGZha2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgQ29udGV4dC5wcm90b3R5cGUuZGVjb2RlQXVkaW9EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcHJldiA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGlmIChmYWtlKSB7XG4gICAgICAgIHZhciByZXQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgc2VsZi5zdGF0cy50b3RhbERlY29kZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcHJldjtcbiAgICAgICAgICByZXNvbHZlKG5ldyBBdWRpb0J1ZmZlcih7bGVuZ3RoOiAxLCBzYW1wbGVSYXRlOiA0NDEwMH0pKTtcbiAgICAgICAgICBzZWxmLnN0YXRzLm51bUF1ZGlvQnVmZmVycysrO1xuICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxEdXJhdGlvbiArPSBhdWRpb0J1ZmZlci5kdXJhdGlvbjtcbiAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsTGVuZ3RoICs9IGF1ZGlvQnVmZmVyLmxlbmd0aDtcbiAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSBvcmlEZWNvZGVEYXRhLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHZhciByZXQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcHJvbWlzZS50aGVuKGF1ZGlvQnVmZmVyID0+IHtcbiAgICAgICAgICAgIHNlbGYuc3RhdHMudG90YWxEZWNvZGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHByZXY7XG4gICAgICAgICAgICByZXNvbHZlKGF1ZGlvQnVmZmVyKTtcbiAgICAgICAgICAgIHNlbGYuc3RhdHMubnVtQXVkaW9CdWZmZXJzKys7XG4gICAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsRHVyYXRpb24gKz0gYXVkaW9CdWZmZXIuZHVyYXRpb247XG4gICAgICAgICAgICBzZWxmLnN0YXRzLnRvdGFsTGVuZ3RoICs9IGF1ZGlvQnVmZmVyLmxlbmd0aDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIENvbnRleHQucHJvdG90eXBlLmRlY29kZUF1ZGlvRGF0YSA9IG9yaURlY29kZURhdGE7XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkF1ZGlvSG9vazsiLCJ2YXIgV2ViVlJIb29rID0ge1xuICBvcmlnaW5hbDoge1xuICAgIGdldFZSRGlzcGxheXM6IG51bGwsXG4gICAgYWRkRXZlbnRMaXN0ZW5lcjogbnVsbFxuICB9LFxuICBjdXJyZW50VlJEaXNwbGF5OiBudWxsLFxuICBhdXhGcmFtZURhdGE6ICggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ1ZSRnJhbWVEYXRhJyBpbiB3aW5kb3cgKSA/IG5ldyB3aW5kb3cuVlJGcmFtZURhdGEoKSA6IG51bGwsXG4gIGVuYWJsZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgaWYgKG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzKSB7XG4gICAgICB0aGlzLmluaXRFdmVudExpc3RlbmVycygpO1xuICAgICAgdmFyIG9yaWdldFZSRGlzcGxheXMgPSB0aGlzLm9yaWdpbmFsLmdldFZSRGlzcGxheXMgPSBuYXZpZ2F0b3IuZ2V0VlJEaXNwbGF5cztcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIG5hdmlnYXRvci5nZXRWUkRpc3BsYXlzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBvcmlnZXRWUkRpc3BsYXlzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHJlc3VsdC50aGVuKGRpc3BsYXlzID0+IHtcbiAgICAgICAgICAgIHZhciBuZXdEaXNwbGF5cyA9IFtdO1xuICAgICAgICAgICAgZGlzcGxheXMuZm9yRWFjaChkaXNwbGF5ID0+IHtcbiAgICAgICAgICAgICAgdmFyIG5ld0Rpc3BsYXkgPSBzZWxmLmhvb2tWUkRpc3BsYXkoZGlzcGxheSk7XG4gICAgICAgICAgICAgIG5ld0Rpc3BsYXlzLnB1c2gobmV3RGlzcGxheSk7XG4gICAgICAgICAgICAgIGNhbGxiYWNrKG5ld0Rpc3BsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNvbHZlKG5ld0Rpc3BsYXlzKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHt9LFxuICBpbml0RXZlbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLm9yaWdpbmFsLmFkZEV2ZW50TGlzdGVuZXIgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZXZlbnRzRmlsdGVyID0gWyd2cmRpc3BsYXlwcmVzZW50Y2hhbmdlJywgJ3ZyZGlzcGxheWNvbm5lY3QnXTtcbiAgICAgIGlmIChldmVudHNGaWx0ZXIuaW5kZXhPZihhcmd1bWVudHNbMF0pICE9PSAtMSkge1xuICAgICAgICB2YXIgb2xkQ2FsbGJhY2sgPSBhcmd1bWVudHNbMV07XG4gICAgICAgIGFyZ3VtZW50c1sxXSA9IGV2ZW50ID0+IHtcbiAgICAgICAgICBzZWxmLmhvb2tWUkRpc3BsYXkoZXZlbnQuZGlzcGxheSk7XG4gICAgICAgICAgb2xkQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdCA9IHNlbGYub3JpZ2luYWwuYWRkRXZlbnRMaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfSxcbiAgaG9va1ZSRGlzcGxheTogZnVuY3Rpb24gKGRpc3BsYXkpIHtcbiAgICAvLyBUb2RvIG1vZGlmeSB0aGUgVlJEaXNwbGF5IGlmIG5lZWRlZCBmb3IgZnJhbWVkYXRhIGFuZCBzbyBvblxuICAgIHJldHVybiBkaXNwbGF5O1xuICAgICAgLypcbiAgICB2YXIgb2xkR2V0RnJhbWVEYXRhID0gZGlzcGxheS5nZXRGcmFtZURhdGEuYmluZChkaXNwbGF5KTtcbiAgICBkaXNwbGF5LmdldEZyYW1lRGF0YSA9IGZ1bmN0aW9uKGZyYW1lRGF0YSkge1xuXG4gICAgICBvbGRHZXRGcmFtZURhdGEoZnJhbWVEYXRhKTtcbiAgLypcbiAgICAgIHZhciBtID0gbmV3IFRIUkVFLk1hdHJpeDQoKTtcblxuICAgICAgdmFyIHggPSBNYXRoLnNpbihwZXJmb3JtYW5jZS5ub3coKS8xMDAwKTtcbiAgICAgIHZhciB5ID0gTWF0aC5zaW4ocGVyZm9ybWFuY2Uubm93KCkvNTAwKS0xLjI7XG5cbiAgICAgIG0ubWFrZVRyYW5zbGF0aW9uKHgseSwtMC41KTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG4gICAgICB2YXIgc2NhbGUgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgdmFyIHF1YXQgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpO1xuICAgICAgbS5kZWNvbXBvc2UocG9zaXRpb24scXVhdCxzY2FsZSk7XG5cbiAgICAgIGZyYW1lRGF0YS5wb3NlLnBvc2l0aW9uWzBdID0gLXBvc2l0aW9uLng7XG4gICAgICBmcmFtZURhdGEucG9zZS5wb3NpdGlvblsxXSA9IC1wb3NpdGlvbi55O1xuICAgICAgZnJhbWVEYXRhLnBvc2UucG9zaXRpb25bMl0gPSAtcG9zaXRpb24uejtcblxuICAgICAgZm9yICh2YXIgaT0wO2k8MztpKyspIHtcbiAgICAgICAgZnJhbWVEYXRhLnBvc2Uub3JpZW50YXRpb25baV0gPSAwO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpPTA7aTwxNjtpKyspIHtcbiAgICAgICAgZnJhbWVEYXRhLmxlZnRWaWV3TWF0cml4W2ldID0gbS5lbGVtZW50c1tpXTtcbiAgICAgICAgZnJhbWVEYXRhLnJpZ2h0Vmlld01hdHJpeFtpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICB9XG4gICAgLypcbiAgICAgIGZvciAodmFyIGk9MDtpPDE2O2krKykge1xuICAgICAgICBsZWZ0Vmlld01hdHJpeFtpXSA9IG0uZWxlbWVudHNbaV07XG4gICAgICAgIGZyYW1lRGF0YS5yaWdodFZpZXdNYXRyaXhbaV0gPSBtLmVsZW1lbnRzW2ldO1xuICAgICAgfVxuICAgICAgLy8gY2FtZXJhLm1hdHJpeFdvcmxkLmRlY29tcG9zZSggY2FtZXJhTC5wb3NpdGlvbiwgY2FtZXJhTC5xdWF0ZXJuaW9uLCBjYW1lcmFMLnNjYWxlICk7XG4gICAgfVxuICAgICovXG4gIH1cbn07XG5leHBvcnQgZGVmYXVsdCBXZWJWUkhvb2s7IiwiZnVuY3Rpb24gbmVhcmVzdE5laWdoYm9yIChzcmMsIGRzdCkge1xuICBsZXQgcG9zID0gMFxuXG4gIGZvciAobGV0IHkgPSAwOyB5IDwgZHN0LmhlaWdodDsgeSsrKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBkc3Qud2lkdGg7IHgrKykge1xuICAgICAgY29uc3Qgc3JjWCA9IE1hdGguZmxvb3IoeCAqIHNyYy53aWR0aCAvIGRzdC53aWR0aClcbiAgICAgIGNvbnN0IHNyY1kgPSBNYXRoLmZsb29yKHkgKiBzcmMuaGVpZ2h0IC8gZHN0LmhlaWdodClcblxuICAgICAgbGV0IHNyY1BvcyA9ICgoc3JjWSAqIHNyYy53aWR0aCkgKyBzcmNYKSAqIDRcblxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIFJcbiAgICAgIGRzdC5kYXRhW3BvcysrXSA9IHNyYy5kYXRhW3NyY1BvcysrXSAvLyBHXG4gICAgICBkc3QuZGF0YVtwb3MrK10gPSBzcmMuZGF0YVtzcmNQb3MrK10gLy8gQlxuICAgICAgZHN0LmRhdGFbcG9zKytdID0gc3JjLmRhdGFbc3JjUG9zKytdIC8vIEFcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZUltYWdlRGF0YShzcmNJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSkge1xuICBuZWFyZXN0TmVpZ2hib3Ioc3JjSW1hZ2VEYXRhLCBuZXdJbWFnZURhdGEpO1xufSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBwaXhlbG1hdGNoO1xuXG5mdW5jdGlvbiBwaXhlbG1hdGNoKGltZzEsIGltZzIsIG91dHB1dCwgd2lkdGgsIGhlaWdodCwgb3B0aW9ucykge1xuXG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgICB2YXIgdGhyZXNob2xkID0gb3B0aW9ucy50aHJlc2hvbGQgPT09IHVuZGVmaW5lZCA/IDAuMSA6IG9wdGlvbnMudGhyZXNob2xkO1xuXG4gICAgLy8gbWF4aW11bSBhY2NlcHRhYmxlIHNxdWFyZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjb2xvcnM7XG4gICAgLy8gMzUyMTUgaXMgdGhlIG1heGltdW0gcG9zc2libGUgdmFsdWUgZm9yIHRoZSBZSVEgZGlmZmVyZW5jZSBtZXRyaWNcbiAgICB2YXIgbWF4RGVsdGEgPSAzNTIxNSAqIHRocmVzaG9sZCAqIHRocmVzaG9sZCxcbiAgICAgICAgZGlmZiA9IDA7XG5cbiAgICAvLyBjb21wYXJlIGVhY2ggcGl4ZWwgb2Ygb25lIGltYWdlIGFnYWluc3QgdGhlIG90aGVyIG9uZVxuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG5cbiAgICAgICAgICAgIHZhciBwb3MgPSAoeSAqIHdpZHRoICsgeCkgKiA0O1xuXG4gICAgICAgICAgICAvLyBzcXVhcmVkIFlVViBkaXN0YW5jZSBiZXR3ZWVuIGNvbG9ycyBhdCB0aGlzIHBpeGVsIHBvc2l0aW9uXG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBjb2xvckRlbHRhKGltZzEsIGltZzIsIHBvcywgcG9zKTtcblxuICAgICAgICAgICAgLy8gdGhlIGNvbG9yIGRpZmZlcmVuY2UgaXMgYWJvdmUgdGhlIHRocmVzaG9sZFxuICAgICAgICAgICAgaWYgKGRlbHRhID4gbWF4RGVsdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpdCdzIGEgcmVhbCByZW5kZXJpbmcgZGlmZmVyZW5jZSBvciBqdXN0IGFudGktYWxpYXNpbmdcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbnMuaW5jbHVkZUFBICYmIChhbnRpYWxpYXNlZChpbWcxLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBpbWcyKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnRpYWxpYXNlZChpbWcyLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCBpbWcxKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb25lIG9mIHRoZSBwaXhlbHMgaXMgYW50aS1hbGlhc2luZzsgZHJhdyBhcyB5ZWxsb3cgYW5kIGRvIG5vdCBjb3VudCBhcyBkaWZmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXQpIGRyYXdQaXhlbChvdXRwdXQsIHBvcywgMjU1LCAyNTUsIDApO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZm91bmQgc3Vic3RhbnRpYWwgZGlmZmVyZW5jZSBub3QgY2F1c2VkIGJ5IGFudGktYWxpYXNpbmc7IGRyYXcgaXQgYXMgcmVkXG4gICAgICAgICAgICAgICAgICAgIGlmIChvdXRwdXQpIGRyYXdQaXhlbChvdXRwdXQsIHBvcywgMjU1LCAwLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZGlmZisrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXRwdXQpIHtcbiAgICAgICAgICAgICAgICAvLyBwaXhlbHMgYXJlIHNpbWlsYXI7IGRyYXcgYmFja2dyb3VuZCBhcyBncmF5c2NhbGUgaW1hZ2UgYmxlbmRlZCB3aXRoIHdoaXRlXG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IGJsZW5kKGdyYXlQaXhlbChpbWcxLCBwb3MpLCAwLjEpO1xuICAgICAgICAgICAgICAgIGRyYXdQaXhlbChvdXRwdXQsIHBvcywgdmFsLCB2YWwsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBkaWZmZXJlbnQgcGl4ZWxzXG4gICAgcmV0dXJuIGRpZmY7XG59XG5cbi8vIGNoZWNrIGlmIGEgcGl4ZWwgaXMgbGlrZWx5IGEgcGFydCBvZiBhbnRpLWFsaWFzaW5nO1xuLy8gYmFzZWQgb24gXCJBbnRpLWFsaWFzZWQgUGl4ZWwgYW5kIEludGVuc2l0eSBTbG9wZSBEZXRlY3RvclwiIHBhcGVyIGJ5IFYuIFZ5c25pYXVza2FzLCAyMDA5XG5cbmZ1bmN0aW9uIGFudGlhbGlhc2VkKGltZywgeDEsIHkxLCB3aWR0aCwgaGVpZ2h0LCBpbWcyKSB7XG4gICAgdmFyIHgwID0gTWF0aC5tYXgoeDEgLSAxLCAwKSxcbiAgICAgICAgeTAgPSBNYXRoLm1heCh5MSAtIDEsIDApLFxuICAgICAgICB4MiA9IE1hdGgubWluKHgxICsgMSwgd2lkdGggLSAxKSxcbiAgICAgICAgeTIgPSBNYXRoLm1pbih5MSArIDEsIGhlaWdodCAtIDEpLFxuICAgICAgICBwb3MgPSAoeTEgKiB3aWR0aCArIHgxKSAqIDQsXG4gICAgICAgIHplcm9lcyA9IDAsXG4gICAgICAgIHBvc2l0aXZlcyA9IDAsXG4gICAgICAgIG5lZ2F0aXZlcyA9IDAsXG4gICAgICAgIG1pbiA9IDAsXG4gICAgICAgIG1heCA9IDAsXG4gICAgICAgIG1pblgsIG1pblksIG1heFgsIG1heFk7XG5cbiAgICAvLyBnbyB0aHJvdWdoIDggYWRqYWNlbnQgcGl4ZWxzXG4gICAgZm9yICh2YXIgeCA9IHgwOyB4IDw9IHgyOyB4KyspIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IHkwOyB5IDw9IHkyOyB5KyspIHtcbiAgICAgICAgICAgIGlmICh4ID09PSB4MSAmJiB5ID09PSB5MSkgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIGJyaWdodG5lc3MgZGVsdGEgYmV0d2VlbiB0aGUgY2VudGVyIHBpeGVsIGFuZCBhZGphY2VudCBvbmVcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IGNvbG9yRGVsdGEoaW1nLCBpbWcsIHBvcywgKHkgKiB3aWR0aCArIHgpICogNCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIGNvdW50IHRoZSBudW1iZXIgb2YgZXF1YWwsIGRhcmtlciBhbmQgYnJpZ2h0ZXIgYWRqYWNlbnQgcGl4ZWxzXG4gICAgICAgICAgICBpZiAoZGVsdGEgPT09IDApIHplcm9lcysrO1xuICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPCAwKSBuZWdhdGl2ZXMrKztcbiAgICAgICAgICAgIGVsc2UgaWYgKGRlbHRhID4gMCkgcG9zaXRpdmVzKys7XG5cbiAgICAgICAgICAgIC8vIGlmIGZvdW5kIG1vcmUgdGhhbiAyIGVxdWFsIHNpYmxpbmdzLCBpdCdzIGRlZmluaXRlbHkgbm90IGFudGktYWxpYXNpbmdcbiAgICAgICAgICAgIGlmICh6ZXJvZXMgPiAyKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmICghaW1nMikgY29udGludWU7XG5cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoZSBkYXJrZXN0IHBpeGVsXG4gICAgICAgICAgICBpZiAoZGVsdGEgPCBtaW4pIHtcbiAgICAgICAgICAgICAgICBtaW4gPSBkZWx0YTtcbiAgICAgICAgICAgICAgICBtaW5YID0geDtcbiAgICAgICAgICAgICAgICBtaW5ZID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoZSBicmlnaHRlc3QgcGl4ZWxcbiAgICAgICAgICAgIGlmIChkZWx0YSA+IG1heCkge1xuICAgICAgICAgICAgICAgIG1heCA9IGRlbHRhO1xuICAgICAgICAgICAgICAgIG1heFggPSB4O1xuICAgICAgICAgICAgICAgIG1heFkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpbWcyKSByZXR1cm4gdHJ1ZTtcblxuICAgIC8vIGlmIHRoZXJlIGFyZSBubyBib3RoIGRhcmtlciBhbmQgYnJpZ2h0ZXIgcGl4ZWxzIGFtb25nIHNpYmxpbmdzLCBpdCdzIG5vdCBhbnRpLWFsaWFzaW5nXG4gICAgaWYgKG5lZ2F0aXZlcyA9PT0gMCB8fCBwb3NpdGl2ZXMgPT09IDApIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGlmIGVpdGhlciB0aGUgZGFya2VzdCBvciB0aGUgYnJpZ2h0ZXN0IHBpeGVsIGhhcyBtb3JlIHRoYW4gMiBlcXVhbCBzaWJsaW5ncyBpbiBib3RoIGltYWdlc1xuICAgIC8vIChkZWZpbml0ZWx5IG5vdCBhbnRpLWFsaWFzZWQpLCB0aGlzIHBpeGVsIGlzIGFudGktYWxpYXNlZFxuICAgIHJldHVybiAoIWFudGlhbGlhc2VkKGltZywgbWluWCwgbWluWSwgd2lkdGgsIGhlaWdodCkgJiYgIWFudGlhbGlhc2VkKGltZzIsIG1pblgsIG1pblksIHdpZHRoLCBoZWlnaHQpKSB8fFxuICAgICAgICAgICAoIWFudGlhbGlhc2VkKGltZywgbWF4WCwgbWF4WSwgd2lkdGgsIGhlaWdodCkgJiYgIWFudGlhbGlhc2VkKGltZzIsIG1heFgsIG1heFksIHdpZHRoLCBoZWlnaHQpKTtcbn1cblxuLy8gY2FsY3VsYXRlIGNvbG9yIGRpZmZlcmVuY2UgYWNjb3JkaW5nIHRvIHRoZSBwYXBlciBcIk1lYXN1cmluZyBwZXJjZWl2ZWQgY29sb3IgZGlmZmVyZW5jZVxuLy8gdXNpbmcgWUlRIE5UU0MgdHJhbnNtaXNzaW9uIGNvbG9yIHNwYWNlIGluIG1vYmlsZSBhcHBsaWNhdGlvbnNcIiBieSBZLiBLb3RzYXJlbmtvIGFuZCBGLiBSYW1vc1xuXG5mdW5jdGlvbiBjb2xvckRlbHRhKGltZzEsIGltZzIsIGssIG0sIHlPbmx5KSB7XG4gICAgdmFyIGExID0gaW1nMVtrICsgM10gLyAyNTUsXG4gICAgICAgIGEyID0gaW1nMlttICsgM10gLyAyNTUsXG5cbiAgICAgICAgcjEgPSBibGVuZChpbWcxW2sgKyAwXSwgYTEpLFxuICAgICAgICBnMSA9IGJsZW5kKGltZzFbayArIDFdLCBhMSksXG4gICAgICAgIGIxID0gYmxlbmQoaW1nMVtrICsgMl0sIGExKSxcblxuICAgICAgICByMiA9IGJsZW5kKGltZzJbbSArIDBdLCBhMiksXG4gICAgICAgIGcyID0gYmxlbmQoaW1nMlttICsgMV0sIGEyKSxcbiAgICAgICAgYjIgPSBibGVuZChpbWcyW20gKyAyXSwgYTIpLFxuXG4gICAgICAgIHkgPSByZ2IyeShyMSwgZzEsIGIxKSAtIHJnYjJ5KHIyLCBnMiwgYjIpO1xuXG4gICAgaWYgKHlPbmx5KSByZXR1cm4geTsgLy8gYnJpZ2h0bmVzcyBkaWZmZXJlbmNlIG9ubHlcblxuICAgIHZhciBpID0gcmdiMmkocjEsIGcxLCBiMSkgLSByZ2IyaShyMiwgZzIsIGIyKSxcbiAgICAgICAgcSA9IHJnYjJxKHIxLCBnMSwgYjEpIC0gcmdiMnEocjIsIGcyLCBiMik7XG5cbiAgICByZXR1cm4gMC41MDUzICogeSAqIHkgKyAwLjI5OSAqIGkgKiBpICsgMC4xOTU3ICogcSAqIHE7XG59XG5cbmZ1bmN0aW9uIHJnYjJ5KHIsIGcsIGIpIHsgcmV0dXJuIHIgKiAwLjI5ODg5NTMxICsgZyAqIDAuNTg2NjIyNDcgKyBiICogMC4xMTQ0ODIyMzsgfVxuZnVuY3Rpb24gcmdiMmkociwgZywgYikgeyByZXR1cm4gciAqIDAuNTk1OTc3OTkgLSBnICogMC4yNzQxNzYxMCAtIGIgKiAwLjMyMTgwMTg5OyB9XG5mdW5jdGlvbiByZ2IycShyLCBnLCBiKSB7IHJldHVybiByICogMC4yMTE0NzAxNyAtIGcgKiAwLjUyMjYxNzExICsgYiAqIDAuMzExMTQ2OTQ7IH1cblxuLy8gYmxlbmQgc2VtaS10cmFuc3BhcmVudCBjb2xvciB3aXRoIHdoaXRlXG5mdW5jdGlvbiBibGVuZChjLCBhKSB7XG4gICAgcmV0dXJuIDI1NSArIChjIC0gMjU1KSAqIGE7XG59XG5cbmZ1bmN0aW9uIGRyYXdQaXhlbChvdXRwdXQsIHBvcywgciwgZywgYikge1xuICAgIG91dHB1dFtwb3MgKyAwXSA9IHI7XG4gICAgb3V0cHV0W3BvcyArIDFdID0gZztcbiAgICBvdXRwdXRbcG9zICsgMl0gPSBiO1xuICAgIG91dHB1dFtwb3MgKyAzXSA9IDI1NTtcbn1cblxuZnVuY3Rpb24gZ3JheVBpeGVsKGltZywgaSkge1xuICAgIHZhciBhID0gaW1nW2kgKyAzXSAvIDI1NSxcbiAgICAgICAgciA9IGJsZW5kKGltZ1tpICsgMF0sIGEpLFxuICAgICAgICBnID0gYmxlbmQoaW1nW2kgKyAxXSwgYSksXG4gICAgICAgIGIgPSBibGVuZChpbWdbaSArIDJdLCBhKTtcbiAgICByZXR1cm4gcmdiMnkociwgZywgYik7XG59XG4iLCJpbXBvcnQgU3RhdHMgZnJvbSAnaW5jcmVtZW50YWwtc3RhdHMtbGl0ZSc7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gV2ViR0xTdGF0cyAoKSB7XG5cbiAgdmFyIGRhdGEgPSB7XG4gICAgbnVtRHJhd0NhbGxzOiAwLFxuXG4gICAgbnVtRHJhd0FycmF5c0NhbGxzOjAsXG4gICAgbnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzOjAsXG4gICAgbnVtRHJhd0VsZW1lbnRzQ2FsbHM6MCxcbiAgICBudW1EcmF3RWxlbWVudHNJbnN0YW5jZWRDYWxsczogMCxcblxuICAgIG51bVVzZVByb2dyYW1DYWxsczowLFxuICAgIG51bUZhY2VzOjAsXG4gICAgbnVtVmVydGljZXM6MCxcbiAgICBudW1Qb2ludHM6MCxcbiAgICBudW1CaW5kVGV4dHVyZXM6MFxuICB9XG5cbiAgdmFyIHN0YXRzID0ge1xuICAgIGRyYXdDYWxsczogbmV3IFN0YXRzKCksXG4gICAgdXNlUHJvZ3JhbUNhbGxzOiBuZXcgU3RhdHMoKSxcbiAgICBmYWNlczogbmV3IFN0YXRzKCksXG4gICAgdmVydGljZXM6IG5ldyBTdGF0cygpLFxuICAgIGJpbmRUZXh0dXJlczogbmV3IFN0YXRzKClcbiAgfTtcblxuICBmdW5jdGlvbiBmcmFtZUVuZCgpIHtcbiAgICBmb3IgKGxldCBzdGF0IGluIHN0YXRzKSB7XG4gICAgICB2YXIgY291bnRlck5hbWUgPSAnbnVtJyArIHN0YXQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0LnNsaWNlKDEpO1xuICAgICAgc3RhdHNbc3RhdF0udXBkYXRlKGRhdGFbY291bnRlck5hbWVdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBfaCAoIGYsIGMgKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gICAgICAgIGYuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgIH07XG4gIH1cbiAgXG4gIGlmICgnV2ViR0wyUmVuZGVyaW5nQ29udGV4dCcgaW4gd2luZG93KSB7XG4gICAgV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5c0luc3RhbmNlZCA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzSW5zdGFuY2VkLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdBcnJheXNJbnN0YW5jZWRDYWxscysrO1xuICAgICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICAgIGlmICggYXJndW1lbnRzWyAwIF0gPT0gdGhpcy5QT0lOVFMgKSBkYXRhLm51bVBvaW50cyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICAgIGVsc2UgZGF0YS5udW1WZXJ0aWNlcyArPSBhcmd1bWVudHNbIDIgXTtcbiAgICB9KTtcblxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50c0luc3RhbmNlZCA9IF9oKCBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHNJbnN0YW5jZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG5cbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdBcnJheXMsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0FycmF5c0NhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgaWYgKCBhcmd1bWVudHNbIDAgXSA9PSB0aGlzLlBPSU5UUyApIGRhdGEubnVtUG9pbnRzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICAgIH0gKTtcbiAgICBcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3RWxlbWVudHMgPSBfaCggV2ViR0wyUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0VsZW1lbnRzLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bURyYXdFbGVtZW50c0NhbGxzKys7XG4gICAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgICAgZGF0YS5udW1GYWNlcyArPSBhcmd1bWVudHNbIDEgXSAvIDM7XG4gICAgICBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMSBdO1xuICAgIH0gKTtcbiAgICBcbiAgICBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS51c2VQcm9ncmFtID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtVXNlUHJvZ3JhbUNhbGxzKys7XG4gICAgfSApO1xuICAgIFxuICAgIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlID0gX2goIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlLCBmdW5jdGlvbiAoKSB7XG4gICAgICBkYXRhLm51bUJpbmRUZXh0dXJlcysrO1xuICAgIH0gKTtcbiAgXG4gIH1cblxuICBcbiAgV2ViR0xSZW5kZXJpbmdDb250ZXh0LnByb3RvdHlwZS5kcmF3QXJyYXlzID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuZHJhd0FycmF5cywgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtRHJhd0FycmF5c0NhbGxzKys7XG4gICAgZGF0YS5udW1EcmF3Q2FsbHMrKztcbiAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgZWxzZSBkYXRhLm51bVZlcnRpY2VzICs9IGFyZ3VtZW50c1sgMiBdO1xuICB9ICk7XG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cyA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmRyYXdFbGVtZW50cywgZnVuY3Rpb24gKCkge1xuICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzQ2FsbHMrKztcbiAgICBkYXRhLm51bURyYXdDYWxscysrO1xuICAgIGRhdGEubnVtRmFjZXMgKz0gYXJndW1lbnRzWyAxIF0gLyAzO1xuICAgIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAxIF07XG4gIH0gKTtcbiAgXG4gIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUudXNlUHJvZ3JhbSA9IF9oKCBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLnVzZVByb2dyYW0sIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bVVzZVByb2dyYW1DYWxscysrO1xuICB9ICk7XG4gIFxuICBXZWJHTFJlbmRlcmluZ0NvbnRleHQucHJvdG90eXBlLmJpbmRUZXh0dXJlID0gX2goIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5wcm90b3R5cGUuYmluZFRleHR1cmUsIGZ1bmN0aW9uICgpIHtcbiAgICBkYXRhLm51bUJpbmRUZXh0dXJlcysrO1xuICB9ICk7XG4gIFxuICBmdW5jdGlvbiBmcmFtZVN0YXJ0ICgpIHtcbiAgICBkYXRhLm51bURyYXdDYWxscyA9IDA7XG4gICAgZGF0YS5udW1EcmF3QXJyYXlzQ2FsbHMgPSAwO1xuICAgIGRhdGEubnVtRHJhd0FycmF5c0luc3RhbmNlZENhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdFbGVtZW50c0NhbGxzID0gMDtcbiAgICBkYXRhLm51bURyYXdFbGVtZW50c0luc3RhbmNlZENhbGxzID0gMDtcbiAgICBkYXRhLm51bVVzZVByb2dyYW1DYWxscyA9IDA7XG4gICAgZGF0YS5udW1GYWNlcyA9IDA7XG4gICAgZGF0YS5udW1WZXJ0aWNlcyA9IDA7XG4gICAgZGF0YS5udW1Qb2ludHMgPSAwO1xuICAgIGRhdGEubnVtQmluZFRleHR1cmVzID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzV2ViR0xDb250ZXh0KGN0eCkge1xuICAgIHJldHVybiAoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KSB7XG4gICAgaWYgKCFpc1dlYkdMQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgY29uc29sZS53YXJuKFwiV0VCR0wtU1RBVFM6IFByb3ZpZGVkIGNvbnRleHQgaXMgbm90IFdlYkdMXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBleHQgPSBjb250ZXh0LmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuICAgIGlmICghZXh0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGV4dC5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUgPSBfaCggZXh0LmRyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSwgZnVuY3Rpb24gKCkge1xuICAgICAgZGF0YS5udW1EcmF3QXJyYXlzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIFxuICAgIGV4dC5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSA9IF9oKCBleHQuZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGRhdGEubnVtRHJhd0VsZW1lbnRzSW5zdGFuY2VkQ2FsbHMrKztcbiAgICAgIGRhdGEubnVtRHJhd0NhbGxzKys7XG4gICAgICBpZiAoIGFyZ3VtZW50c1sgMCBdID09IHRoaXMuUE9JTlRTICkgZGF0YS5udW1Qb2ludHMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgICBlbHNlIGRhdGEubnVtVmVydGljZXMgKz0gYXJndW1lbnRzWyAyIF07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRTdW1tYXJ5KCkge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgcmVzdWx0W2tleV0gPSB7XG4gICAgICAgIG1pbjogc3RhdHNba2V5XS5taW4sXG4gICAgICAgIG1heDogc3RhdHNba2V5XS5tYXgsXG4gICAgICAgIGF2Zzogc3RhdHNba2V5XS5tZWFuLFxuICAgICAgICBzdGFuZGFyZF9kZXZpYXRpb246IHN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgZ2V0Q3VycmVudERhdGE6ICgpID0+IHtyZXR1cm4gZGF0YTt9LFxuICAgIHNldHVwRXh0ZW5zaW9uczogc2V0dXBFeHRlbnNpb25zLFxuICAgIGdldFN1bW1hcnk6IGdldFN1bW1hcnksXG4gICAgZnJhbWVTdGFydDogZnJhbWVTdGFydCxcbiAgICBmcmFtZUVuZDogZnJhbWVFbmRcbiAgICBcbiAgICAvL2VuYWJsZTogZW5hYmxlLFxuICAgIC8vZGlzYWJsZTogZGlzYWJsZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFdlYkdMU3RhdHMoKTsiLCJpbXBvcnQgRmFrZVRpbWVycyBmcm9tICdmYWtlLXRpbWVycyc7XG5pbXBvcnQgQ2FudmFzSG9vayBmcm9tICdjYW52YXMtaG9vayc7XG5pbXBvcnQgV2ViWFJIb29rIGZyb20gJ3dlYnhyLWhvb2snO1xuaW1wb3J0IFBlcmZTdGF0cyBmcm9tICdwZXJmb3JtYW5jZS1zdGF0cyc7XG5pbXBvcnQgc2VlZHJhbmRvbSBmcm9tICdzZWVkcmFuZG9tJztcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnO1xuaW1wb3J0IHtJbnB1dFJlY29yZGVyLCBJbnB1dFJlcGxheWVyfSBmcm9tICdpbnB1dC1ldmVudHMtcmVjb3JkZXInO1xuaW1wb3J0IEV2ZW50TGlzdGVuZXJNYW5hZ2VyIGZyb20gJy4vZXZlbnQtbGlzdGVuZXJzJztcbmltcG9ydCBJbnB1dEhlbHBlcnMgZnJvbSAnLi9pbnB1dC1oZWxwZXJzJztcbmltcG9ydCBXZWJBdWRpb0hvb2sgZnJvbSAnLi93ZWJhdWRpby1ob29rJztcbmltcG9ydCBXZWJWUkhvb2sgZnJvbSAnLi93ZWJ2ci1ob29rJztcbmltcG9ydCB7cmVzaXplSW1hZ2VEYXRhfSBmcm9tICcuL2ltYWdlLXV0aWxzJztcbmltcG9ydCBwaXhlbG1hdGNoIGZyb20gJ3BpeGVsbWF0Y2gnO1xuaW1wb3J0IFdlYkdMU3RhdHMgZnJvbSAnd2ViZ2wtc3RhdHMnO1xuXG5jb25zdCBwYXJhbWV0ZXJzID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKTtcblxuZnVuY3Rpb24gb25SZWFkeShjYWxsYmFjaykge1xuICBpZiAoXG4gICAgZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gXCJjb21wbGV0ZVwiIHx8XG4gICAgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09IFwibG9hZGluZ1wiICYmICFkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGwpXG4gICkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgY2FsbGJhY2spO1xuICB9XG59XG5cblxuLy8gSGFja3MgdG8gZml4IHNvbWUgVW5pdHkgZGVtb3NcbmNvbnNvbGUubG9nRXJyb3IgPSAobXNnKSA9PiBjb25zb2xlLmVycm9yKG1zZyk7XG5cbndpbmRvdy5URVNURVIgPSB7XG4gIFhScmVhZHk6IGZhbHNlLFxuICByZWFkeTogZmFsc2UsXG4gIGZpbmlzaGVkOiBmYWxzZSxcbiAgaW5wdXRMb2FkaW5nOiBmYWxzZSxcblxuICAvLyBDdXJyZW50bHkgZXhlY3V0aW5nIGZyYW1lLlxuICByZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI6IDAsXG4gIGZpcnN0RnJhbWVUaW1lOiBudWxsLFxuICAvLyBJZiAtMSwgd2UgYXJlIG5vdCBydW5uaW5nIGFuIGV2ZW50LiBPdGhlcndpc2UgcmVwcmVzZW50cyB0aGUgd2FsbGNsb2NrIHRpbWUgb2Ygd2hlbiB3ZSBleGl0ZWQgdGhlIGxhc3QgZXZlbnQgaGFuZGxlci5cbiAgcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lOiAtMSxcblxuICAvLyBXYWxsY2xvY2sgdGltZSBkZW5vdGluZyB3aGVuIHRoZSBwYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLlxuICBwYWdlTG9hZFRpbWU6IG51bGwsXG5cbiAgLy8gSG9sZHMgdGhlIGFtb3VudCBvZiB0aW1lIGluIG1zZWNzIHRoYXQgdGhlIHByZXZpb3VzbHkgcmVuZGVyZWQgZnJhbWUgdG9vay4gVXNlZCB0byBlc3RpbWF0ZSB3aGVuIGEgc3R1dHRlciBldmVudCBvY2N1cnMgKGZhc3QgZnJhbWUgZm9sbG93ZWQgYnkgYSBzbG93IGZyYW1lKVxuICBsYXN0RnJhbWVEdXJhdGlvbjogLTEsXG5cbiAgLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gdGhlIHByZXZpb3VzIGZyYW1lIGZpbmlzaGVkLlxuICBsYXN0RnJhbWVUaWNrOiAtMSxcblxuICBhY2N1bXVsYXRlZENwdUlkbGVUaW1lOiAwLFxuXG4gIC8vIEtlZXBzIHRyYWNrIG9mIHBlcmZvcm1hbmNlIHN0dXR0ZXIgZXZlbnRzLiBBIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIHdoZW4gdGhlcmUgaXMgYSBoaWNjdXAgaW4gc3Vic2VxdWVudCBwZXItZnJhbWUgdGltZXMuIChmYXN0IGZvbGxvd2VkIGJ5IHNsb3cpXG4gIG51bVN0dXR0ZXJFdmVudHM6IDAsXG5cbiAgbnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZTogMTIwLCAvLyBSZXF1aXJlIDEyMCBmcmFtZXMgaS5lLiB+MiBzZWNvbmRzIG9mIGNvbnNlY3V0aXZlIHNtb290aCBzdHV0dGVyIGZyZWUgZnJhbWVzIHRvIGNvbmNsdWRlIHdlIGhhdmUgcmVhY2hlZCBhIHN0YWJsZSBhbmltYXRpb24gcmF0ZVxuXG4gIC8vIE1lYXN1cmUgYSBcInRpbWUgdW50aWwgc21vb3RoIGZyYW1lIHJhdGVcIiBxdWFudGl0eSwgaS5lLiB0aGUgdGltZSBhZnRlciB3aGljaCB3ZSBjb25zaWRlciB0aGUgc3RhcnR1cCBKSVQgYW5kIEdDIGVmZmVjdHMgdG8gaGF2ZSBzZXR0bGVkLlxuICAvLyBUaGlzIGZpZWxkIHRyYWNrcyBob3cgbWFueSBjb25zZWN1dGl2ZSBmcmFtZXMgaGF2ZSBydW4gc21vb3RobHkuIFRoaXMgdmFyaWFibGUgaXMgc2V0IHRvIC0xIHdoZW4gc21vb3RoIGZyYW1lIHJhdGUgaGFzIGJlZW4gYWNoaWV2ZWQgdG8gZGlzYWJsZSB0cmFja2luZyB0aGlzIGZ1cnRoZXIuXG4gIG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzOiAwLFxuXG4gIHJhbmRvbVNlZWQ6IDEsXG4gIG1hbmRhdG9yeUF1dG9FbnRlclhSOiB0eXBlb2YgcGFyYW1ldGVyc1snbWFuZGF0b3J5LWF1dG9lbnRlci14ciddICE9PSAndW5kZWZpbmVkJyxcbiAgbnVtRnJhbWVzVG9SZW5kZXI6IHR5cGVvZiBwYXJhbWV0ZXJzWydudW0tZnJhbWVzJ10gPT09ICd1bmRlZmluZWQnID8gMTAwMCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ251bS1mcmFtZXMnXSksXG5cbiAgLy8gQ2FudmFzIHVzZWQgYnkgdGhlIHRlc3QgdG8gcmVuZGVyXG4gIGNhbnZhczogbnVsbCxcblxuICBpbnB1dFJlY29yZGVyOiBudWxsLFxuXG4gIC8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbiAgLy8gdmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG4gIGlzUmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMucmVhZHksIHRoaXMuWFJyZWFkeSk7XG4gICAgcmV0dXJuIHRoaXMucmVhZHkgJiYgdGhpcy5YUnJlYWR5O1xuICB9LFxuXG4gIHByZVRpY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmIChHRlhURVNUU19DT05GSUcucHJlTWFpbkxvb3ApIHtcbiAgICAgIEdGWFRFU1RTX0NPTkZJRy5wcmVNYWluTG9vcCgpO1xuICAgIH1cblxuICAgIC8vIGNvbnNvbGUubG9nKCdyZWFkeScsIHRoaXMucmVhZHksICd4cnJlYWR5JywgdGhpcy5YUnJlYWR5KTtcbiAgICBpZiAodGhpcy5pc1JlYWR5KCkpIHtcbiAgICAgIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBXZWJHTFN0YXRzLmZyYW1lU3RhcnQoKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCc+PiBmcmFtZS1zdGFydCcpO1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZVN0YXJ0KCk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmNhbnZhcykge1xuICAgICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWyduby1yZW5kZXJpbmcnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBhc3N1bWUgdGhlIGxhc3Qgd2ViZ2wgY29udGV4dCBiZWluZyBpbml0aWFsaXplZCBpcyB0aGUgb25lIHVzZWQgdG8gcmVuZGVyaW5nXG4gICAgICAgIC8vIElmIHRoYXQncyBkaWZmZXJlbnQsIHRoZSB0ZXN0IHNob3VsZCBoYXZlIGEgY3VzdG9tIGNvZGUgdG8gcmV0dXJuIHRoYXQgY2FudmFzXG4gICAgICAgIGlmIChDYW52YXNIb29rLmdldE51bUNvbnRleHRzKCkgPiAwKSB7XG4gICAgICAgICAgdmFyIGNvbnRleHQgPSBDYW52YXNIb29rLmdldENvbnRleHQoQ2FudmFzSG9vay5nZXROdW1Db250ZXh0cygpIC0gMSk7XG4gICAgICAgICAgdGhpcy5jYW52YXMgPSBjb250ZXh0LmNhbnZhcztcblxuICAgICAgICAgIC8vIFByZXZlbnQgZXZlbnRzIG5vdCBkZWZpbmVkIGFzIGV2ZW50LWxpc3RlbmVyc1xuICAgICAgICAgIHRoaXMuY2FudmFzLm9ubW91c2Vkb3duID0gdGhpcy5jYW52YXMub25tb3VzZXVwID0gdGhpcy5jYW52YXMub25tb3VzZW1vdmUgPSAoKSA9PiB7fTtcblxuICAgICAgICAgIC8vIFRvIHByZXZlbnQgd2lkdGggJiBoZWlnaHQgMTAwJVxuICAgICAgICAgIGZ1bmN0aW9uIGFkZFN0eWxlU3RyaW5nKHN0cikge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgbm9kZS5pbm5lckhUTUwgPSBzdHI7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGFkZFN0eWxlU3RyaW5nKGAuZ2Z4dGVzdHMtY2FudmFzIHt3aWR0aDogJHt0aGlzLmNhbnZhc1dpZHRofXB4ICFpbXBvcnRhbnQ7IGhlaWdodDogJHt0aGlzLmNhbnZhc0hlaWdodH1weCAhaW1wb3J0YW50O31gKTtcblxuICAgICAgICAgIC8vIFRvIGZpeCBBLUZyYW1lXG4gICAgICAgICAgYWRkU3R5bGVTdHJpbmcoYGEtc2NlbmUgLmEtY2FudmFzLmdmeHRlc3RzLWNhbnZhcyB7d2lkdGg6ICR7dGhpcy5jYW52YXNXaWR0aH1weCAhaW1wb3J0YW50OyBoZWlnaHQ6ICR7dGhpcy5jYW52YXNIZWlnaHR9cHggIWltcG9ydGFudDt9YCk7XG5cbiAgICAgICAgICB0aGlzLmNhbnZhcy5jbGFzc0xpc3QuYWRkKCdnZnh0ZXN0cy1jYW52YXMnKTtcblxuICAgICAgICAgIHRoaXMub25SZXNpemUoKTtcblxuICAgICAgICAgIC8vIENhbnZhc0hvb2tcbiAgICAgICAgICBXZWJHTFN0YXRzLnNldHVwRXh0ZW5zaW9ucyhjb250ZXh0KTtcblxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVjb3JkaW5nJ10gIT09ICd1bmRlZmluZWQnICYmICF0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlciA9IG5ldyBJbnB1dFJlY29yZGVyKHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5lbmFibGUoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlcGxheSddICE9PSAndW5kZWZpbmVkJyAmJiBHRlhURVNUU19DT05GSUcuaW5wdXQgJiYgIXRoaXMuaW5wdXRMb2FkaW5nKSB7XG4gICAgICAgICAgICB0aGlzLmlucHV0TG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgICBmZXRjaCgnL3Rlc3RzLycgKyBHRlhURVNUU19DT05GSUcuaW5wdXQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgICB0aGlzLmlucHV0UmVwbGF5ZXIgPSBuZXcgSW5wdXRSZXBsYXllcih0aGlzLmNhbnZhcywganNvbiwgdGhpcy5ldmVudExpc3RlbmVyLnJlZ2lzdGVyZWRFdmVudExpc3RlbmVycyk7XG4gICAgICAgICAgICAgIHRoaXMuaW5wdXRIZWxwZXJzID0gbmV3IElucHV0SGVscGVycyh0aGlzLmNhbnZhcyk7XG4gICAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVhZHkgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL0BmaXhtZSBlbHNlIGZvciBjYW52YXMgMmQgd2l0aG91dCB3ZWJnbFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMCkge1xuICAgICAgLypcbiAgICAgIGlmICgnYXV0b2VudGVyLXhyJyBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgIHRoaXMuaW5qZWN0QXV0b0VudGVyWFIodGhpcy5jYW52YXMpO1xuICAgICAgfVxuICAgICAgKi9cbiAgICB9XG5cbiAgICAvLyByZWZlcmVuY2VUZXN0VDAgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgaWYgKHRoaXMucGFnZUxvYWRUaW1lID09PSBudWxsKSB0aGlzLnBhZ2VMb2FkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHBhZ2VJbml0VGltZTtcblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIGlmICh0aGlzLnByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSAhPSAtMSkge1xuICAgICAgdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lO1xuICAgICAgdGhpcy5wcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSAtMTtcbiAgICB9XG4gIH0sXG5cbiAgcG9zdFRpY2s6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMucmVhZHkgfHwgIXRoaXMuWFJyZWFkeSkge3JldHVybjt9XG5cbiAgICBpZiAodGhpcy5zdGFydGVkKXtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCc8PCBmcmFtZWVuZCcpO1xuICAgICAgdGhpcy5zdGF0cy5mcmFtZUVuZCgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZWNvcmRlci5mcmFtZU51bWJlciA9IHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVwbGF5ZXIpIHtcbiAgICAgIHRoaXMuaW5wdXRSZXBsYXllci50aWNrKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIuZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuXG4gICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICB2YXIgZnJhbWVEdXJhdGlvbiA9IHRpbWVOb3cgLSB0aGlzLmxhc3RGcmFtZVRpY2s7XG4gICAgdGhpcy5sYXN0RnJhbWVUaWNrID0gdGltZU5vdztcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPiA1ICYmIHRoaXMubGFzdEZyYW1lRHVyYXRpb24gPiAwKSB7XG4gICAgICAvLyBUaGlzIG11c3QgYmUgZml4ZWQgZGVwZW5kaW5nIG9uIHRoZSB2c3luY1xuICAgICAgaWYgKGZyYW1lRHVyYXRpb24gPiAyMC4wICYmIGZyYW1lRHVyYXRpb24gPiB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uICogMS4zNSkge1xuICAgICAgICB0aGlzLm51bVN0dXR0ZXJFdmVudHMrKztcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHtcbiAgICAgICAgICB0aGlzLm51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzKys7XG4gICAgICAgICAgaWYgKHRoaXMubnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPj0gdGhpcy5udW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGltZVVudGlsU21vb3RoRnJhbWVyYXRlJywgdGltZU5vdyAtIHRoaXMuZmlyc3RGcmFtZVRpbWUpO1xuICAgICAgICAgICAgdGhpcy5udW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmxhc3RGcmFtZUR1cmF0aW9uID0gZnJhbWVEdXJhdGlvbjtcbi8qXG4gICAgaWYgKG51bVByZWxvYWRYSFJzSW5GbGlnaHQgPT0gMCkgeyAvLyBJbXBvcnRhbnQhIFRoZSBmcmFtZSBudW1iZXIgYWR2YW5jZXMgb25seSBmb3IgdGhvc2UgZnJhbWVzIHRoYXQgdGhlIGdhbWUgaXMgbm90IHdhaXRpbmcgZm9yIGRhdGEgZnJvbSB0aGUgaW5pdGlhbCBuZXR3b3JrIGRvd25sb2Fkcy5cbiAgICAgIGlmIChudW1TdGFydHVwQmxvY2tlclhIUnNQZW5kaW5nID09IDApICsrdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7IC8vIEFjdHVhbCByZWZ0ZXN0IGZyYW1lIGNvdW50IG9ubHkgaW5jcmVtZW50cyBhZnRlciBnYW1lIGhhcyBjb25zdW1lZCBhbGwgdGhlIGNyaXRpY2FsIFhIUnMgdGhhdCB3ZXJlIHRvIGJlIHByZWxvYWRlZC5cbiAgICAgICsrZmFrZWRUaW1lOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgICB9XG4qL1xuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKys7XG4gICAgaWYgKHRoaXMuZnJhbWVQcm9ncmVzc0Jhcikge1xuICAgICAgdmFyIHBlcmMgPSBwYXJzZUludCgxMDAgKiB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gcGVyYyArIFwiJVwiO1xuICAgIH1cblxuICAgIEZha2VUaW1lcnMuZmFrZWRUaW1lKys7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuXG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSAxKSB7XG4gICAgICB0aGlzLmZpcnN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IGZyYW1lIHN1Ym1pdHRlZCBhdCAobXMpOicsIHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIHRoaXMucHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIFdlYkdMU3RhdHMuZnJhbWVFbmQoKTtcbiAgfSxcblxuICBjcmVhdGVEb3dubG9hZEltYWdlTGluazogZnVuY3Rpb24oZGF0YSwgZmlsZW5hbWUsIGRlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgYS5zZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJywgZmlsZW5hbWUgKyAnLnBuZycpO1xuICAgIGEuc2V0QXR0cmlidXRlKCdocmVmJywgZGF0YSk7XG4gICAgYS5zdHlsZS5jc3NUZXh0ID0gJ2NvbG9yOiAjRkZGOyBkaXNwbGF5OiBpbmxpbmUtZ3JpZDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBtYXJnaW46IDJweDsgZm9udC1zaXplOiAxNHB4Oyc7XG5cbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLmlkID0gZmlsZW5hbWU7XG4gICAgaW1nLnNyYyA9IGRhdGE7XG4gICAgYS5hcHBlbmRDaGlsZChpbWcpO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbC5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICBsYWJlbC5pbm5lckhUTUwgPSBkZXNjcmlwdGlvbiB8fCBmaWxlbmFtZTtcblxuICAgIGEuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfaW1hZ2VzJykuYXBwZW5kQ2hpbGQoYSk7XG4gIH0sXG5cbiAgLy8gWEhScyBpbiB0aGUgZXhwZWN0ZWQgcmVuZGVyIG91dHB1dCBpbWFnZSwgYWx3YXlzICdyZWZlcmVuY2UucG5nJyBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhlIHRlc3QuXG4gIGxvYWRSZWZlcmVuY2VJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlICgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIEdGWFRFU1RTX1JFRkVSRU5DRUlNQUdFX0JBU0VVUkwgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIHZhciByZWZlcmVuY2VJbWFnZU5hbWUgPSBwYXJhbWV0ZXJzWydyZWZlcmVuY2UtaW1hZ2UnXSB8fCBHRlhURVNUU19DT05GSUcuaWQ7XG5cbiAgICAgIGltZy5zcmMgPSAnLycgKyBHRlhURVNUU19SRUZFUkVOQ0VJTUFHRV9CQVNFVVJMICsgJy8nICsgcmVmZXJlbmNlSW1hZ2VOYW1lICsgJy5wbmcnO1xuICAgICAgaW1nLm9uYWJvcnQgPSBpbWcub25lcnJvciA9IHJlamVjdDtcblxuICAgICAgLy8gcmVmZXJlbmNlLnBuZyBtaWdodCBjb21lIGZyb20gYSBkaWZmZXJlbnQgZG9tYWluIHRoYW4gdGhlIGNhbnZhcywgc28gZG9uJ3QgbGV0IGl0IHRhaW50IGN0eC5nZXRJbWFnZURhdGEoKS5cbiAgICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0NPUlNfZW5hYmxlZF9pbWFnZVxuICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgIHRoaXMucmVmZXJlbmNlSW1hZ2VEYXRhID0gY3R4LmdldEltYWdlRGF0YSgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBcbiAgICAgICAgdmFyIGRhdGEgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgdGhpcy5jcmVhdGVEb3dubG9hZEltYWdlTGluayhkYXRhLCAncmVmZXJlbmNlLWltYWdlJywgJ1JlZmVyZW5jZSBpbWFnZScpO1xuXG4gICAgICAgIHJlc29sdmUodGhpcy5yZWZlcmVuY2VJbWFnZURhdGEpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWZlcmVuY2VJbWFnZSA9IGltZztcbiAgICB9KTtcbiAgfSxcblxuICBnZXRDdXJyZW50SW1hZ2U6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgLy8gR3JhYiByZW5kZXJlZCBXZWJHTCBmcm9udCBidWZmZXIgaW1hZ2UgdG8gYSBKUy1zaWRlIGltYWdlIG9iamVjdC5cbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3JjID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gY2FsbGJhY2s7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW4ndCBnZW5lcmF0ZSBpbWFnZVwiKTtcbiAgICB9XG4gIH0sXG5cbiAgZG9JbWFnZVJlZmVyZW5jZUNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UgKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGZ1bmN0aW9uIHJlZnRlc3QgKGV2dCkge1xuICAgICAgICB2YXIgaW1nID0gYWN0dWFsSW1hZ2U7XG4gICAgICAgIHZhciBjYW52YXNDdXJyZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHZhciBjb250ZXh0ID0gY2FudmFzQ3VycmVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGNhbnZhc0N1cnJlbnQud2lkdGggPSBpbWcud2lkdGg7XG4gICAgICAgIGNhbnZhc0N1cnJlbnQuaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICAgICAgICB2YXIgY3VycmVudEltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICAgICAgc2VsZi5sb2FkUmVmZXJlbmNlSW1hZ2UoKS50aGVuKHJlZkltYWdlRGF0YSA9PiB7XG4gICAgICAgICAgdmFyIHdpZHRoID0gcmVmSW1hZ2VEYXRhLndpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSByZWZJbWFnZURhdGEuaGVpZ2h0O1xuICAgICAgICAgIHZhciBjYW52YXNEaWZmID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgdmFyIGRpZmZDdHggPSBjYW52YXNEaWZmLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgY2FudmFzRGlmZi53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIGNhbnZhc0RpZmYuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgIHZhciBkaWZmID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgICAgICB2YXIgbmV3SW1hZ2VEYXRhID0gZGlmZkN0eC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgcmVzaXplSW1hZ2VEYXRhKGN1cnJlbnRJbWFnZURhdGEsIG5ld0ltYWdlRGF0YSk7XG5cbiAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZWZJbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICB2YXIgYWN0dWFsID0gbmV3SW1hZ2VEYXRhLmRhdGE7XG5cbiAgICAgICAgICB2YXIgdGhyZXNob2xkID0gdHlwZW9mIEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkID09PSAndW5kZWZpbmVkJyA/IDAuMiA6IEdGWFRFU1RTX0NPTkZJRy5yZWZlcmVuY2VDb21wYXJlVGhyZXNob2xkO1xuICAgICAgICAgIHZhciBudW1EaWZmUGl4ZWxzID0gcGl4ZWxtYXRjaChleHBlY3RlZCwgYWN0dWFsLCBkaWZmLmRhdGEsIHdpZHRoLCBoZWlnaHQsIHt0aHJlc2hvbGQ6IHRocmVzaG9sZH0pO1xuICAgICAgICAgIHZhciBkaWZmUGVyYyA9IG51bURpZmZQaXhlbHMgLyAod2lkdGggKiBoZWlnaHQpICogMTAwO1xuXG4gICAgICAgICAgdmFyIGZhaWwgPSBkaWZmUGVyYyA+IDAuMjsgLy8gZGlmZiBwZXJjIDAgLSAxMDAlXG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHtyZXN1bHQ6ICdwYXNzJ307XG5cbiAgICAgICAgICBpZiAoZmFpbCkge1xuICAgICAgICAgICAgdmFyIGRpdkVycm9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InKTtcbiAgICAgICAgICAgIGRpdkVycm9yLnF1ZXJ5U2VsZWN0b3IoJ2gzJykuaW5uZXJIVE1MID0gYEVSUk9SOiBSZWZlcmVuY2UgaW1hZ2UgbWlzbWF0Y2ggKCR7ZGlmZlBlcmMudG9GaXhlZCgyKX0lIGRpZmZlcmVudCBwaXhlbHMpYDtcbiAgICAgICAgICAgIGRpdkVycm9yLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgICAgICAgICAgZGlmZlBlcmM6IGRpZmZQZXJjLFxuICAgICAgICAgICAgICBudW1EaWZmUGl4ZWxzOiBudW1EaWZmUGl4ZWxzLFxuICAgICAgICAgICAgICBmYWlsUmVhc29uOiAnUmVmZXJlbmNlIGltYWdlIG1pc21hdGNoJ1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gJ2ZhaWwnO1xuICAgICAgICAgICAgYmVuY2htYXJrRGl2LnF1ZXJ5U2VsZWN0b3IoJ2gxJykuaW5uZXJUZXh0ID0gJ1Rlc3QgZmFpbGVkISc7XG5cbiAgICAgICAgICAgIGRpZmZDdHgucHV0SW1hZ2VEYXRhKGRpZmYsIDAsIDApO1xuXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGNhbnZhc0RpZmYudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlRG93bmxvYWRJbWFnZUxpbmsoZGF0YSwgJ2NhbnZhcy1kaWZmJywgJ0RpZmZlcmVuY2UnKTtcbiAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgdmFyIGJlbmNobWFya0RpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJyk7XG4gICAgICAgICAgYmVuY2htYXJrRGl2LmNsYXNzTmFtZSA9ICdmYWlsJztcbiAgICAgICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBmYWlsZWQhJztcblxuICAgICAgICAgIHZhciBkaXZFcnJvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJyk7XG4gICAgICAgICAgZGl2RXJyb3IucXVlcnlTZWxlY3RvcignaDMnKS5pbm5lckhUTUwgPSBgRVJST1I6IEZhaWxlZCB0byBsb2FkIHJlZmVyZW5jZSBpbWFnZWA7XG4gICAgICAgICAgZGl2RXJyb3Iuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgcmVzdWx0OiAnZmFpbCcsXG4gICAgICAgICAgICBmYWlsUmVhc29uOiAnRXJyb3IgbG9hZGluZyByZWZlcmVuY2UgaW1hZ2UnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBpbml0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgICBhY3R1YWxJbWFnZS5zcmMgPSB0aGlzLmNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICAgIGFjdHVhbEltYWdlLm9ubG9hZCA9IHJlZnRlc3Q7XG4gICAgICAgIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBpbml0O1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGluaXRTZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly8nICsgR0ZYVEVTVFNfQ09ORklHLnNlcnZlcklQICsgJzo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIHRvIHRlc3Rpbmcgc2VydmVyJyk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNvY2tldC5lbWl0KCd0ZXN0X3N0YXJ0ZWQnLCB7aWQ6IEdGWFRFU1RTX0NPTkZJRy5pZCwgdGVzdFVVSUQ6IHBhcmFtZXRlcnNbJ3Rlc3QtdXVpZCddfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbmV4dF9iZW5jaG1hcmsnLCAoZGF0YSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ25leHRfYmVuY2htYXJrJywgZGF0YSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShkYXRhLnVybCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkSW5wdXREb3dubG9hZEJ1dHRvbjogZnVuY3Rpb24gKCkge1xuICAgICAgLy8gRHVtcCBpbnB1dFxuICAgICAgZnVuY3Rpb24gc2F2ZVN0cmluZyAodGV4dCwgZmlsZW5hbWUsIG1pbWVUeXBlKSB7XG4gICAgICAgIHNhdmVCbG9iKG5ldyBCbG9iKFsgdGV4dCBdLCB7IHR5cGU6IG1pbWVUeXBlIH0pLCBmaWxlbmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVCbG9iIChibG9iLCBmaWxlbmFtZSkge1xuICAgICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGluay5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWUgfHwgJ2lucHV0Lmpzb24nO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIC8vIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTsgYnJlYWtzIEZpcmVmb3guLi5cbiAgICAgIH1cblxuICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLmlucHV0UmVjb3JkZXIuZXZlbnRzLCBudWxsLCAyKTtcblxuICAgICAgLy9jb25zb2xlLmxvZygnSW5wdXQgcmVjb3JkZWQnLCBqc29uKTtcblxuICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgbGluay5ocmVmID0gJyMnO1xuICAgICAgbGluay5jbGFzc05hbWUgPSAnYnV0dG9uJztcbiAgICAgIGxpbmsub25jbGljayA9ICgpID0+IHNhdmVTdHJpbmcoanNvbiwgR0ZYVEVTVFNfQ09ORklHLmlkICsgJy5qc29uJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgIGxpbmsuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYERvd25sb2FkIGlucHV0IEpTT05gKSk7IC8vICgke3RoaXMuaW5wdXRSZWNvcmRlci5ldmVudHMubGVuZ3RofSBldmVudHMgcmVjb3JkZWQpXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGVzdF9maW5pc2hlZCcpLmFwcGVuZENoaWxkKGxpbmspO1xuICB9LFxuXG4gIGdlbmVyYXRlRmFpbGVkQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoZmFpbFJlYXNvbikge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXN0X2lkOiBHRlhURVNUU19DT05GSUcuaWQsXG4gICAgICBhdXRvRW50ZXJYUjogdGhpcy5hdXRvRW50ZXJYUixcbiAgICAgIHJldmlzaW9uOiBHRlhURVNUU19DT05GSUcucmV2aXNpb24gfHwgMCxcbiAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgIHBhZ2VMb2FkVGltZTogdGhpcy5wYWdlTG9hZFRpbWUsXG4gICAgICByZXN1bHQ6ICdmYWlsJyxcbiAgICAgIGZhaWxSZWFzb246IGZhaWxSZWFzb25cbiAgICB9O1xuICB9LFxuXG4gIGdlbmVyYXRlQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpbWVFbmQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgdmFyIHRvdGFsVGltZSA9IHRpbWVFbmQgLSBwYWdlSW5pdFRpbWU7IC8vIFRvdGFsIHRpbWUsIGluY2x1ZGluZyBldmVyeXRoaW5nLlxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlID0+IHtcbiAgICAgIHZhciB0b3RhbFJlbmRlclRpbWUgPSB0aW1lRW5kIC0gdGhpcy5maXJzdEZyYW1lVGltZTtcbiAgICAgIHZhciBjcHVJZGxlID0gdGhpcy5hY2N1bXVsYXRlZENwdUlkbGVUaW1lICogMTAwLjAgLyB0b3RhbFJlbmRlclRpbWU7XG4gICAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXNUb1JlbmRlciAqIDEwMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcblxuICAgICAgdmFyIHJlc3VsdCA9IHtcbiAgICAgICAgdGVzdF9pZDogR0ZYVEVTVFNfQ09ORklHLmlkLFxuICAgICAgICBzdGF0czoge1xuICAgICAgICAgIHBlcmY6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICAgICAgd2ViZ2w6IFdlYkdMU3RhdHMuZ2V0U3VtbWFyeSgpXG4gICAgICAgICAgLy8gISEhISBvY3VsdXNfdnJhcGk6IHRoaXMuXG4gICAgICAgIH0sXG4gICAgICAgIGF1dG9FbnRlclhSOiB0aGlzLmF1dG9FbnRlclhSLFxuICAgICAgICByZXZpc2lvbjogR0ZYVEVTVFNfQ09ORklHLnJldmlzaW9uIHx8IDAsXG4gICAgICAgIHdlYmF1ZGlvOiBXZWJBdWRpb0hvb2suc3RhdHMsXG4gICAgICAgIG51bUZyYW1lczogdGhpcy5udW1GcmFtZXNUb1JlbmRlcixcbiAgICAgICAgdG90YWxUaW1lOiB0b3RhbFRpbWUsXG4gICAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IHRoaXMuZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUsXG4gICAgICAgIGF2Z0ZwczogZnBzLFxuICAgICAgICBudW1TdHV0dGVyRXZlbnRzOiB0aGlzLm51bVN0dXR0ZXJFdmVudHMsXG4gICAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBjcHVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZUluTWFpbkxvb3AsXG4gICAgICAgIGF2Z0NwdVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lSW5NYWluTG9vcCAvIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICAgIGNwdUlkbGVUaW1lOiB0aGlzLnN0YXRzLnRvdGFsVGltZU91dHNpZGVNYWluTG9vcCxcbiAgICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgICBwYWdlTG9hZFRpbWU6IHRoaXMucGFnZUxvYWRUaW1lLFxuICAgICAgICByZXN1bHQ6ICdwYXNzJyxcbiAgICAgICAgbG9nczogdGhpcy5sb2dzXG4gICAgICB9O1xuXG4gICAgICAvLyBAdG9kbyBJbmRpY2F0ZSBzb21laG93IHRoYXQgbm8gcmVmZXJlbmNlIHRlc3QgaGFzIGJlZW4gcGVyZm9ybWVkXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3NraXAtcmVmZXJlbmNlLWltYWdlLXRlc3QnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kb0ltYWdlUmVmZXJlbmNlQ2hlY2soKS50aGVuKHJlZlJlc3VsdCA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbihyZXN1bHQsIHJlZlJlc3VsdCk7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9KS5jYXRjaChyZWZSZXN1bHQgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24ocmVzdWx0LCByZWZSZXN1bHQpO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYmVuY2htYXJrRmluaXNoZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmluamVjdEJlbmNobWFya0ZpbmlzaGVkSFRNTCgpO1xuXG4gICAgaWYgKHRoaXMuaW5wdXRSZWNvcmRlcikge1xuICAgICAgdGhpcy5hZGRJbnB1dERvd25sb2FkQnV0dG9uKCk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5jYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgdmFyIGRlc2NyaXB0aW9uID0gdGhpcy5pbnB1dFJlY29yZGVyID8gJ0Rvd25sb2FkIHJlZmVyZW5jZSBpbWFnZScgOiAnQWN0dWFsIHJlbmRlcic7XG4gICAgICB0aGlzLmNyZWF0ZURvd25sb2FkSW1hZ2VMaW5rKGRhdGEsIEdGWFRFU1RTX0NPTkZJRy5pZCwgZGVzY3JpcHRpb24pO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNhbid0IGdlbmVyYXRlIGltYWdlXCIsIGUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmlucHV0UmVjb3JkZXIpIHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZXN0X2ZpbmlzaGVkJykuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWZlcmVuY2UtaW1hZ2VzLWVycm9yJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVCZW5jaG1hcmtSZXN1bHQoKS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0JlbmNobWFya1Jlc3VsdChyZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBpbmplY3RCZW5jaG1hcmtGaW5pc2hlZEhUTUw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGUuaW5uZXJIVE1MID0gYFxuICAgICAgI3Rlc3RfZmluaXNoZWQge1xuICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZGRkO1xuICAgICAgICBib3R0b206IDA7XG4gICAgICAgIGNvbG9yOiAjMDAwO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICAgICAgbGVmdDogMDtcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICByaWdodDogMDtcbiAgICAgICAgdG9wOiAwO1xuICAgICAgICB6LWluZGV4OiA5OTk5OTtcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQucGFzcyB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM5Zjk7XG4gICAgICB9XG5cbiAgICAgICN0ZXN0X2ZpbmlzaGVkLmZhaWwge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjk5O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMge1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAyMHB4O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9pbWFnZXMgaW1nIHtcbiAgICAgICAgd2lkdGg6IDMwMHB4O1xuICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjMDA3MDk1O1xuICAgICAgfVxuXG4gICAgICAjdGVzdF9maW5pc2hlZCAuYnV0dG9uIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzAwNzA5NTtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDA3MDk1O1xuICAgICAgICBtYXJnaW4tYm90dG9tOiAxMHB4O1xuICAgICAgICBjb2xvcjogI0ZGRkZGRjtcbiAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xuICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCIsIFwiSGVsdmV0aWNhXCIsIEhlbHZldGljYSwgQXJpYWwsIHNhbnMtc2VyaWYgIWltcG9ydGFudDtcbiAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICBsaW5lLWhlaWdodDogbm9ybWFsO1xuICAgICAgICB3aWR0aDogMzAwcHg7XG4gICAgICAgIHBhZGRpbmc6IDEwcHggMXB4O1xuICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgICAgICAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAzMDBtcyBlYXNlLW91dDtcbiAgICAgIH1cblxuICAgICAgI3Rlc3RfZmluaXNoZWQgLmJ1dHRvbjpob3ZlciB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDc4YTA7XG4gICAgICB9XG4gICAgYDtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlKTtcblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkaXYuaW5uZXJIVE1MID0gYDxoMT5UZXN0IGZpbmlzaGVkITwvaDE+YDtcbiAgICBkaXYuaWQgPSAndGVzdF9maW5pc2hlZCc7XG4gICAgZGl2LnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcblxuICAgIHZhciBkaXZSZWZlcmVuY2VFcnJvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLmlkID0gJ3JlZmVyZW5jZS1pbWFnZXMtZXJyb3InO1xuICAgIGRpdlJlZmVyZW5jZUVycm9yLnN0eWxlLmNzc1RleHQgPSAndGV4dC1hbGlnbjpjZW50ZXI7IGNvbG9yOiAjZjAwOydcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5pbm5lckhUTUwgPSAnPGgzPjwvaDM+JztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgZGl2LmFwcGVuZENoaWxkKGRpdlJlZmVyZW5jZUVycm9yKTtcbiAgICB2YXIgZGl2SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2SW1nLmlkID0gJ3Rlc3RfaW1hZ2VzJztcbiAgICBkaXZSZWZlcmVuY2VFcnJvci5hcHBlbmRDaGlsZChkaXZJbWcpO1xuXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICB9LFxuICBwcm9jZXNzQmVuY2htYXJrUmVzdWx0OiBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICBpZiAodGhpcy5zb2NrZXQpIHtcbiAgICAgIGlmIChwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXSkge1xuICAgICAgICByZXN1bHQudGVzdFVVSUQgPSBwYXJhbWV0ZXJzWyd0ZXN0LXV1aWQnXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc29ja2V0LmVtaXQoJ3Rlc3RfZmluaXNoJywgcmVzdWx0KTtcbiAgICAgIHRoaXMuc29ja2V0LmRpc2Nvbm5lY3QoKTtcbiAgICB9XG5cbiAgICB2YXIgYmVuY2htYXJrRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rlc3RfZmluaXNoZWQnKTtcbiAgICBiZW5jaG1hcmtEaXYuY2xhc3NOYW1lID0gcmVzdWx0LnJlc3VsdDtcbiAgICBpZiAocmVzdWx0LnJlc3VsdCA9PT0gJ3Bhc3MnKSB7XG4gICAgICBiZW5jaG1hcmtEaXYucXVlcnlTZWxlY3RvcignaDEnKS5pbm5lclRleHQgPSAnVGVzdCBwYXNzZWQhJztcbiAgICB9XG5cbiAgICBiZW5jaG1hcmtEaXYuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcblxuICAgIGNvbnNvbGUubG9nKCdGaW5pc2hlZCEnLCByZXN1bHQpO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY2xvc2UgJiYgdHlwZW9mIHBhcmFtZXRlcnNbJ25vLWNsb3NlLW9uLWZhaWwnXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHdpbmRvdy5jbG9zZSgpO1xuICAgIH1cbiAgfSxcblxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKEdGWFRFU1RTX0NPTkZJRy5zZW5kTG9nKVxuICAgICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIGFkZEluZm9PdmVybGF5OiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1snaW5mby1vdmVybGF5J10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpdk92ZXJsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdk92ZXJsYXkuc3R5bGUuY3NzVGV4dCA9IGBcbiAgICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgICB0b3A6IDA7XG4gICAgICAgIGZvbnQtZmFtaWx5OiBNb25vc3BhY2U7XG4gICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDk1LCA0MCwgMTM2KTtcbiAgICAgICAgd2lkdGg6IDEwMCU7XG4gICAgICAgIHBhZGRpbmc6IDVweGA7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdk92ZXJsYXkpO1xuICAgICAgZGl2T3ZlcmxheS5pbm5lclRleHQgPSBwYXJhbWV0ZXJzWydpbmZvLW92ZXJsYXknXTtcbiAgICB9KVxuICB9LFxuXG4gIGFkZFByb2dyZXNzQmFyOiBmdW5jdGlvbigpIHtcbiAgICBvblJlYWR5KCgpID0+IHtcbiAgICAgIHZhciBkaXZQcm9ncmVzc0JhcnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIGRpdlByb2dyZXNzQmFycy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOiBhYnNvbHV0ZTsgbGVmdDogMDsgYm90dG9tOiAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzOyB3aWR0aDogMjAwcHg7IHBhZGRpbmc6IDVweCA1cHggMHB4IDVweDsnO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXZQcm9ncmVzc0JhcnMpO1xuXG4gICAgICB2YXIgb3JkZXJHbG9iYWwgPSBwYXJhbWV0ZXJzWydvcmRlci1nbG9iYWwnXTtcbiAgICAgIHZhciB0b3RhbEdsb2JhbCA9IHBhcmFtZXRlcnNbJ3RvdGFsLWdsb2JhbCddO1xuICAgICAgdmFyIHBlcmNHbG9iYWwgPSBNYXRoLnJvdW5kKG9yZGVyR2xvYmFsL3RvdGFsR2xvYmFsICogMTAwKTtcbiAgICAgIHZhciBvcmRlclRlc3QgPSBwYXJhbWV0ZXJzWydvcmRlci10ZXN0J107XG4gICAgICB2YXIgdG90YWxUZXN0ID0gcGFyYW1ldGVyc1sndG90YWwtdGVzdCddO1xuICAgICAgdmFyIHBlcmNUZXN0ID0gTWF0aC5yb3VuZChvcmRlclRlc3QvdG90YWxUZXN0ICogMTAwKTtcblxuICAgICAgZnVuY3Rpb24gYWRkUHJvZ3Jlc3NCYXJTZWN0aW9uKHRleHQsIGNvbG9yLCBwZXJjLCBpZCkge1xuICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5zdHlsZS5jc3NUZXh0PSd3aWR0aDogMTAwJTsgaGVpZ2h0OiAyMHB4OyBtYXJnaW4tYm90dG9tOiA1cHg7IG92ZXJmbG93OiBoaWRkZW47IGJhY2tncm91bmQtY29sb3I6ICNmNWY1ZjU7JztcbiAgICAgICAgZGl2UHJvZ3Jlc3NCYXJzLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgdmFyIGRpdlByb2dyZXNzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChkaXZQcm9ncmVzcyk7XG4gICAgICAgIGlmIChpZCkge1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlkID0gaWQ7XG4gICAgICAgIH1cbiAgICAgICAgZGl2UHJvZ3Jlc3Muc3R5bGUuY3NzVGV4dD1gXG4gICAgICAgICAgd2lkdGg6ICR7cGVyY30lO2JhY2tncm91bmQtY29sb3I6ICR7Y29sb3J9IGZsb2F0OiBsZWZ0O1xuICAgICAgICAgIGhlaWdodDogMTAwJTtcbiAgICAgICAgICBmb250LWZhbWlseTogTW9ub3NwYWNlO1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcbiAgICAgICAgICBmb250LXdlaWdodDogbm9ybWFsO1xuICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xuICAgICAgICAgIGNvbG9yOiAjZmZmO1xuICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzM3YWI3O1xuICAgICAgICAgIC13ZWJraXQtYm94LXNoYWRvdzogaW5zZXQgMCAtMXB4IDAgcmdiYSgwLDAsMCwuMTUpO1xuICAgICAgICAgIGJveC1zaGFkb3c6IGluc2V0IDAgLTFweCAwIHJnYmEoMCwwLDAsLjE1KTtgO1xuICAgICAgICAgIGRpdlByb2dyZXNzLmlubmVyVGV4dCA9IHRleHQ7O1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ29yZGVyLWdsb2JhbCddICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oYCR7b3JkZXJUZXN0fS8ke3RvdGFsVGVzdH0gJHtwZXJjVGVzdH0lYCwgJyM1YmMwZGUnLCBwZXJjVGVzdCk7XG4gICAgICAgIGFkZFByb2dyZXNzQmFyU2VjdGlvbihgJHtvcmRlckdsb2JhbH0vJHt0b3RhbEdsb2JhbH0gJHtwZXJjR2xvYmFsfSVgLCAnIzMzN2FiNycsIHBlcmNHbG9iYWwpO1xuICAgICAgfVxuXG4gICAgICBhZGRQcm9ncmVzc0JhclNlY3Rpb24oJycsICcjMzM3YWI3JywgMCwgJ251bWZyYW1lcycpO1xuICAgICAgdGhpcy5mcmFtZVByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ251bWZyYW1lcycpO1xuXG4gICAgfSk7XG4gIH0sXG5cbiAgaG9va01vZGFsczogZnVuY3Rpb24oKSB7XG4gICAgLy8gSG9vayBtb2RhbHM6IFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxuICAgIHdpbmRvdy5hbGVydCA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuYWxlcnQoJyArIG1zZyArICcpJyk7IH1cbiAgICB3aW5kb3cuY29uZmlybSA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuY29uZmlybSgnICsgbXNnICsgJyknKTsgcmV0dXJuIHRydWU7IH1cbiAgfSxcbiAgUkFGczogW10sIC8vIFVzZWQgdG8gc3RvcmUgaW5zdGFuY2VzIG9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSdzIGNhbGxiYWNrc1xuICBwcmV2UkFGUmVmZXJlbmNlOiBudWxsLCAvLyBQcmV2aW91cyBjYWxsZWQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGNhbGxiYWNrXG4gIHN0YXJ0ZWQ6IGZhbHNlLFxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gKHAsIGZyYW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5maW5pc2hlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLlJBRnMubGVuZ3RoID4gMSkge1xuICAgICAgICBjb25zb2xlLmxvZygnaG9va2VkQ2FsbGJhY2snLCB0aGlzLlJBRnMpO1xuICAgICAgICBjb25zb2xlLmxvZyhjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIC8vIFB1c2ggdGhlIGNhbGxiYWNrIHRvIHRoZSBsaXN0IG9mIGN1cnJlbnRseSBydW5uaW5nIFJBRnNcbiAgICAgIGlmICh0aGlzLlJBRnMuaW5kZXhPZihjYWxsYmFjaykgPT09IC0xICYmXG4gICAgICAgIHRoaXMuUkFGcy5maW5kSW5kZXgoZiA9PiBmLnRvU3RyaW5nKCkgPT09IGNhbGxiYWNrLnRvU3RyaW5nKCkpID09PSAtMSkge1xuICAgICAgICB0aGlzLlJBRnMucHVzaChjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBjdXJyZW50IGNhbGxiYWNrIGlzIHRoZSBmaXJzdCBvbiB0aGUgbGlzdCwgd2UgYXNzdW1lIHRoZSBmcmFtZSBqdXN0IHN0YXJ0ZWRcbiAgICAgIGlmICh0aGlzLlJBRnNbMF0gPT09IGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwicHJldGlja1wiKTtcbiAgICAgICAgdGhpcy5wcmVUaWNrKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChmcmFtZSkge1xuICAgICAgICBsZXQgb3JpR2V0UG9zZSA9IGZyYW1lLmdldFBvc2U7XG4gICAgICAgIGZyYW1lLmdldFBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcG9zZSA9IG9yaUdldFBvc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICBpZiAocG9zZSkge1xuICAgICAgICAgICAgbGV0IGFtcCA9IDAuNTtcbiAgICAgICAgICAgIGxldCBmcmVxID0gMC4wMDA1O1xuICAgICAgICAgICAgbGV0IHggPSBNYXRoLnNpbihwZXJmb3JtYW5jZS5ub3coKSAqIGZyZXEpICogYW1wO1xuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmNvcyhwZXJmb3JtYW5jZS5ub3coKSAqIGZyZXEpICogYW1wO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtOiBuZXcgWFJSaWdpZFRyYW5zZm9ybShuZXcgRE9NUG9pbnQoeCwgMS42ICsgeSwgLTEsIDEpLG5ldyBET01Qb2ludCgwLDAsMCwxKSksXG4gICAgICAgICAgICAgIGVtdWxhdGVkUG9zaXRpb246IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcG9zZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb3JpR2V0Vmlld2VyUG9zZSA9IGZyYW1lLmdldFZpZXdlclBvc2U7XG4gICAgICAgIGZyYW1lLmdldFZpZXdlclBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcG9zZSA9IG9yaUdldFZpZXdlclBvc2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICBsZXQgbmV3UG9zZSA9IHtcbiAgICAgICAgICAgIHZpZXdzOiBbXVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgYmFzZUxheWVyID0gZnJhbWUuc2Vzc2lvbi5yZW5kZXJTdGF0ZS5iYXNlTGF5ZXI7XG4gICAgICAgICAgaWYgKCFiYXNlTGF5ZXIub3JpR2V0Vmlld3BvcnQpIHtcbiAgICAgICAgICAgIGJhc2VMYXllci5vcmlHZXRWaWV3cG9ydCA9IGJhc2VMYXllci5nZXRWaWV3cG9ydDtcbiAgICAgICAgICAgIGJhc2VMYXllci5nZXRWaWV3cG9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBsZXQgdmlldyA9IGFyZ3VtZW50c1swXS5vcmlnaW5hbFZpZXc7XG4gICAgICAgICAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2VMYXllci5vcmlHZXRWaWV3cG9ydC5hcHBseSh0aGlzLCBbdmlld10pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlTGF5ZXIub3JpR2V0Vmlld3BvcnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggcG9zZSAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHZhciB2aWV3cyA9IHBvc2Uudmlld3M7XG4gICAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB2aWV3cy5sZW5ndGg7IGkgKysgKSB7XG4gICAgICAgICAgICAgIHZhciB2aWV3ID0gdmlld3NbIGkgXTtcbiAgICAgICAgICAgICAgaWYgKCF2aWV3Lm9yaWdpbmFsVmlldykge1xuICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSBuZXcgWFJSaWdpZFRyYW5zZm9ybShuZXcgRE9NUG9pbnQoMCwgMS42LCAwLCAxKSxuZXcgRE9NUG9pbnQoMCwwLDAsMSkpXG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZpZXcgPSB7XG4gICAgICAgICAgICAgICAgICBleWU6IHZpZXcuZXllLFxuICAgICAgICAgICAgICAgICAgcHJvamVjdGlvbk1hdHJpeDogdmlldy5wcm9qZWN0aW9uTWF0cml4LFxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgICAgICAgICAgICBvcmlnaW5hbFZpZXc6IHZpZXdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG5ld1Bvc2Uudmlld3MucHVzaChuZXdWaWV3KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdQb3NlLnZpZXdzLnB1c2godmlldyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ld1Bvc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrKHBlcmZvcm1hbmNlLm5vdygpLCBmcmFtZSk7XG5cbiAgICAgIC8vIElmIHJlYWNoaW5nIHRoZSBsYXN0IFJBRiwgZXhlY3V0ZSBhbGwgdGhlIHBvc3QgY29kZVxuICAgICAgaWYgKHRoaXMuUkFGc1sgdGhpcy5SQUZzLmxlbmd0aCAtIDEgXSA9PT0gY2FsbGJhY2sgJiYgdGhpcy5zdGFydGVkKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwicG9zdHRpY2tcIiwgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIpO1xuICAgICAgICAvLyBAdG9kbyBNb3ZlIGFsbCB0aGlzIGxvZ2ljIHRvIGEgZnVuY3Rpb24gdG8gY2xlYW4gdXAgdGhpcyBvbmVcbiAgICAgICAgdGhpcy5wb3N0VGljaygpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gdGhpcy5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbygnPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+IEZJTklTSEVEIScpXG4gICAgICAgICAgdGhpcy5yZWxlYXNlUkFGKCk7XG4gICAgICAgICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5iZW5jaG1hcmtGaW5pc2hlZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChHRlhURVNUU19DT05GSUcucG9zdE1haW5Mb29wKSB7XG4gICAgICAgICAgR0ZYVEVTVFNfQ09ORklHLnBvc3RNYWluTG9vcCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBSQUYgaXMgdGhlIHNhbWUgYXMgbm93LCBqdXN0IHJlc2V0IHRoZSBsaXN0XG4gICAgICAvLyBpbiBjYXNlIHdlIGhhdmUgc3RvcHBlZCBjYWxsaW5nIHNvbWUgb2YgdGhlIHByZXZpb3VzIFJBRnNcbiAgICAgIGlmICh0aGlzLnByZXZSQUZSZWZlcmVuY2UgPT09IGNhbGxiYWNrICYmICh0aGlzLlJBRnNbMF0gIT09IGNhbGxiYWNrIHx8IHRoaXMuUkFGcy5sZW5ndGggPiAxKSkge1xuICAgICAgICB0aGlzLlJBRnMgPSBbY2FsbGJhY2tdO1xuICAgICAgfVxuICAgICAgdGhpcy5wcmV2UkFGUmVmZXJlbmNlID0gY2FsbGJhY2s7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICB9LFxuICBjdXJyZW50UkFGQ29udGV4dDogd2luZG93LFxuICByZWxlYXNlUkFGOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5SQUZjb250ZXh0cy5mb3JFYWNoKGNvbnRleHQgPT4ge1xuICAgICAgY29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7fTtcbiAgICB9KVxuXG4gICAgLy90aGlzLmN1cnJlbnRSQUZDb250ZXh0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9ICgpID0+IHt9O1xuICAgIGlmICgnVlJEaXNwbGF5JyBpbiB3aW5kb3cgJiZcbiAgICAgIHRoaXMuY3VycmVudFJBRkNvbnRleHQgaW5zdGFuY2VvZiBWUkRpc3BsYXkgJiZcbiAgICAgIHRoaXMuY3VycmVudFJBRkNvbnRleHQuaXNQcmVzZW50aW5nKSB7XG4gICAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0LmV4aXRQcmVzZW50KCk7XG4gICAgfVxuICB9LFxuICBSQUZjb250ZXh0czogW10sXG4gIGhvb2tSQUY6IGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgY29uc29sZS5sb2coJ0hvb2tpbmcnLCBjb250ZXh0KTtcbiAgICBpZiAoIWNvbnRleHQucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gY29udGV4dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgICB0aGlzLlJBRmNvbnRleHRzLnB1c2goY29udGV4dCk7XG4gICAgfVxuICAgIGNvbnRleHQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gdGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmN1cnJlbnRSQUZDb250ZXh0ID0gY29udGV4dDtcbiAgfSxcbiAgdW5ob29rUkFGOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGNvbnNvbGUubG9nKCd1bmhvb2tpbmcnLCBjb250ZXh0LCBjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpO1xuICAgIGlmIChjb250ZXh0LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgIGNvbnRleHQucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gY29udGV4dC5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIH1cbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgaWYgKCFHRlhURVNUU19DT05GSUcucHJvdmlkZXNSYWZJbnRlZ3JhdGlvbikge1xuICAgICAgdGhpcy5ob29rUkFGKHdpbmRvdyk7XG4gICAgfVxuXG4gICAgdGhpcy5hZGRQcm9ncmVzc0JhcigpO1xuICAgIHRoaXMuYWRkSW5mb092ZXJsYXkoKTtcblxuICAgIGNvbnNvbGUubG9nKCdGcmFtZXMgdG8gcmVuZGVyOicsIHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpO1xuXG4gICAgaWYgKCFHRlhURVNUU19DT05GSUcuZG9udE92ZXJyaWRlVGltZSkge1xuICAgICAgRmFrZVRpbWVycy5lbmFibGUoKTtcbiAgICB9XG5cbiAgICBpZiAoIUdGWFRFU1RTX0NPTkZJRy5kb250T3ZlcnJpZGVXZWJBdWRpbykge1xuICAgICAgV2ViQXVkaW9Ib29rLmVuYWJsZSh0eXBlb2YgcGFyYW1ldGVyc1snZmFrZS13ZWJhdWRpbyddICE9PSAndW5kZWZpbmVkJyk7XG4gICAgfVxuXG4gICAgLy8gQHRvZG8gVXNlIGNvbmZpZ1xuICAgIFdlYlZSSG9vay5lbmFibGUodnJkaXNwbGF5ID0+IHtcbiAgICAgIHRoaXMuaG9va1JBRih2cmRpc3BsYXkpO1xuICAgIH0pO1xuXG4gICAgaWYgKCdhdXRvZW50ZXIteHInIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgIHRoaXMuaW5qZWN0QXV0b0VudGVyWFIodGhpcy5jYW52YXMpO1xuICAgICAgbmF2aWdhdG9yLnhyLmlzU2Vzc2lvblN1cHBvcnRlZCgnaW1tZXJzaXZlLXZyJykudGhlbigoc3VwcG9ydGVkKSA9PiB7XG4gICAgICAgIGlmICghc3VwcG9ydGVkKSB7XG4gICAgICAgICAgdGhpcy5YUnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5YUnJlYWR5ID0gdHJ1ZTtcbiAgICB9XG4vKlxuICAgIGlmIChHRlhURVNUU19DT05GSUcuaW5qZWN0SlMpIHtcbiAgICAgIGZ1bmN0aW9uIGluamVjdEpTKHVybCwgd2hlcmUsIG9uTG9hZCwgb25FcnJvcikge1xuICAgICAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICBsaW5rLnNyYyA9ICcvdGVzdHMvJyArIHVybDtcbiAgICAgICAgbGluay5jaGFyc2V0ID0gJ3V0Zi04JztcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2Z4ci0yZGNvbnRlbnQtYXBpJywgJ3N0eWxlJyk7XG5cbiAgICAgICAgaWYgKG9uTG9hZCkge1xuICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob25FcnJvcikge1xuICAgICAgICAgIGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aGVyZSA9PT0gXCJiZWZvcmVcIikge1xuICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbmplY3RKUyhHRlhURVNUU19DT05GSUcuaW5qZWN0SlMucGF0aCwgR0ZYVEVTVFNfQ09ORklHLmluamVjdEpTLndoZXJlLCAoKT0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJJbmplY3RlZCFcIik7XG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW5qZWN0aW5nIEpTIVwiKTtcbiAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICAgICovXG5cbiAgICAvKlxuICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW1ldGVyc1sncmVwbGF5J10gIT09ICd1bmRlZmluZWQnICYmIEdGWFRFU1RTX0NPTkZJRy5pbnB1dCAmJiAhdGhpcy5pbnB1dExvYWRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGZldGNoKCcvdGVzdHMvJyArIEdGWFRFU1RTX0NPTkZJRy5pbnB1dCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oanNvbiA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuaW5wdXRSZXBsYXllciA9IG5ldyBJbnB1dFJlcGxheWVyKHRoaXMuY2FudmFzLCBqc29uLCB0aGlzLmV2ZW50TGlzdGVuZXIucmVnaXN0ZXJlZEV2ZW50TGlzdGVuZXJzKTtcbiAgICAgICAgICAgICAgdGhpcy5pbnB1dEhlbHBlcnMgPSBuZXcgSW5wdXRIZWxwZXJzKHRoaXMuY2FudmFzKTtcbiAgICAgICAgICAgICAgdGhpcy5yZWFkeSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiovXG5cbi8qXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3ZyZGlzcGxheXByZXNlbnRjaGFuZ2UnLCBldnQgPT4ge1xuICAgICAgdmFyIGRpc3BsYXkgPSBldnQuZGlzcGxheTtcbiAgICAgIGlmIChkaXNwbGF5LmlzUHJlc2VudGluZykge1xuICAgICAgICB0aGlzLnVuaG9va1JBRih3aW5kb3cpO1xuICAgICAgICB0aGlzLmhvb2tSQUYoZGlzcGxheSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVuaG9va1JBRihkaXNwbGF5KTtcbiAgICAgICAgdGhpcy5ob29rUkFGKHdpbmRvdyk7XG4gICAgICB9XG4gICAgfSk7XG4qL1xuICAgIE1hdGgucmFuZG9tID0gc2VlZHJhbmRvbSh0aGlzLnJhbmRvbVNlZWQpO1xuICAgIENhbnZhc0hvb2suZW5hYmxlKE9iamVjdC5hc3NpZ24oe2Zha2VXZWJHTDogdHlwZW9mIHBhcmFtZXRlcnNbJ2Zha2Utd2ViZ2wnXSAhPT0gJ3VuZGVmaW5lZCd9LCB7d2lkdGg6IHRoaXMuY2FudmFzV2lkdGgsIGhlaWdodDogdGhpcy5jYW52YXNIZWlnaHR9KSk7XG4gICAgdGhpcy5ob29rTW9kYWxzKCk7XG5cbiAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMub25SZXNpemUuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLnN0YXRzID0gbmV3IFBlcmZTdGF0cygpO1xuXG4gICAgdGhpcy5sb2dzID0ge1xuICAgICAgZXJyb3JzOiBbXSxcbiAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgIGNhdGNoRXJyb3JzOiBbXVxuICAgIH07XG4gICAgLy8gdGhpcy53cmFwRXJyb3JzKCk7XG5cbiAgICB0aGlzLmV2ZW50TGlzdGVuZXIgPSBuZXcgRXZlbnRMaXN0ZW5lck1hbmFnZXIoKTtcblxuICAgIC8vaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydyZWNvcmRpbmcnXSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIHBhcmFtZXRlcnNbJ3JlY29yZGluZyddID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5ldmVudExpc3RlbmVyLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID0gMDtcblxuICAgIHRoaXMudGltZVN0YXJ0ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICB9LFxuICBhdXRvRW50ZXJYUjoge1xuICAgIHJlcXVlc3RlZDogZmFsc2UsXG4gICAgc3VjY2Vzc2Z1bDogZmFsc2VcbiAgfSxcbiAgWFJzZXNzaW9uczogW10sXG4gIGluamVjdEF1dG9FbnRlclhSOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICB0aGlzLmF1dG9FbnRlclhSLnJlcXVlc3RlZCA9IHRydWU7XG5cbiAgICBsZXQgcHJldlJlcXVlc3RTZXNzaW9uID0gbmF2aWdhdG9yLnhyLnJlcXVlc3RTZXNzaW9uO1xuICAgIFdlYlhSSG9vay5lbmFibGUoe1xuICAgICAgb25TZXNzaW9uU3RhcnRlZDogc2Vzc2lvbiA9PiB7XG4gICAgICAgIGlmICh0aGlzLlhSc2Vzc2lvbnMuaW5kZXhPZihzZXNzaW9uKSA9PT0gLTEpIHtcbiAgICAgICAgICB0aGlzLlhSc2Vzc2lvbnMucHVzaChzZXNzaW9uKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnWFJTZXNzaW9uIHN0YXJ0ZWQnLCBzZXNzaW9uKTtcbiAgICAgICAgICB0aGlzLlhScmVhZHkgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuaG9va1JBRihzZXNzaW9uKTtcbiAgICAgICAgICAvLyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKCkgPT4ge307XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvblNlc3Npb25FbmRlZDogc2Vzc2lvbiA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdYUlNlc3Npb24gZW5kZWQnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuXG5cbiAgICAvKlxuICAgIGlmICgneHInIGluIG5hdmlnYXRvcikge1xuXHRcdFx0bmF2aWdhdG9yLnhyLmlzU2Vzc2lvblN1cHBvcnRlZCggJ2ltbWVyc2l2ZS12cicgKS50aGVuKHN1cHBvcnRlZCA9PiB7XG4gICAgICAgIGlmIChzdXBwb3J0ZWQpIHtcblx0XHRcdFx0XHR2YXIgc2Vzc2lvbkluaXQgPSB7IG9wdGlvbmFsRmVhdHVyZXM6IFsgJ2xvY2FsLWZsb29yJywgJ2JvdW5kZWQtZmxvb3InIF0gfTtcblx0XHRcdFx0XHRuYXZpZ2F0b3IueHIucmVxdWVzdFNlc3Npb24oICdpbW1lcnNpdmUtdnInLCBzZXNzaW9uSW5pdCApLnRoZW4oIHNlc3Npb24gPT4ge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcm9jZXNzQmVuY2htYXJrUmVzdWx0KHRoaXMuZ2VuZXJhdGVGYWlsZWRCZW5jaG1hcmtSZXN1bHQoJ2F1dG9lbnRlci14ciBmYWlsZWQnKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgKi9cbi8qXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmdldFZSRGlzcGxheXMoKS50aGVuKGRpc3BsYXlzID0+IHtcbiAgICAgICAgICB2YXIgZGV2aWNlID0gZGlzcGxheXNbMF07XG4gICAgICAgICAgLy9pZiAoZGV2aWNlLmlzUHJlc2VudGluZykgZGV2aWNlLmV4aXRQcmVzZW50KCk7XG4gICAgICAgICAgaWYgKGRldmljZSkge1xuICAgICAgICAgICAgZGV2aWNlLnJlcXVlc3RQcmVzZW50KCBbIHsgc291cmNlOiBjYW52YXMgfSBdIClcbiAgICAgICAgICAgICAgLnRoZW4oeCA9PiB7IGNvbnNvbGUubG9nKCdhdXRvZW50ZXIgWFIgc3VjY2Vzc2Z1bCcpOyB0aGlzLmF1dG9FbnRlclhSLnN1Y2Nlc3NmdWwgPSB0cnVlOyB9KVxuICAgICAgICAgICAgICAuY2F0Y2goeCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F1dG9lbnRlciBYUiBmYWlsZWQnKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYW5kYXRvcnlBdXRvRW50ZXJYUikge1xuICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCh4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQmVuY2htYXJrUmVzdWx0KHRoaXMuZ2VuZXJhdGVGYWlsZWRCZW5jaG1hcmtSZXN1bHQoJ2F1dG9lbnRlci14ciBmYWlsZWQnKSk7XG4gICAgICAgICAgICAgICAgICB9LDEwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSwgNTAwKTsgLy8gQGZpeCB0byBtYWtlIGl0IHdvcmsgb24gRnhSXG4gICAgfSBlbHNlIGlmICh0aGlzLm1hbmRhdG9yeUF1dG9FbnRlclhSKSB7XG4gICAgICBzZXRUaW1lb3V0KHggPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NCZW5jaG1hcmtSZXN1bHQodGhpcy5nZW5lcmF0ZUZhaWxlZEJlbmNobWFya1Jlc3VsdCgnYXV0b2VudGVyLXhyIGZhaWxlZCcpKTtcbiAgICAgIH0sMTAwMCk7XG4gICAgfVxuICAgICovXG4gIH0sXG5cbiAgb25SZXNpemU6IGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUgJiYgZS5vcmlnaW4gPT09ICd3ZWJnZnh0ZXN0JykgcmV0dXJuO1xuXG4gICAgY29uc3QgREVGQVVMVF9XSURUSCA9IDgwMDtcbiAgICBjb25zdCBERUZBVUxUX0hFSUdIVCA9IDYwMDtcbiAgICB0aGlzLmNhbnZhc1dpZHRoID0gREVGQVVMVF9XSURUSDtcbiAgICB0aGlzLmNhbnZhc0hlaWdodCA9IERFRkFVTFRfSEVJR0hUO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJhbWV0ZXJzWydrZWVwLXdpbmRvdy1zaXplJ10gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmNhbnZhc1dpZHRoID0gdHlwZW9mIHBhcmFtZXRlcnNbJ3dpZHRoJ10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9XSURUSCA6IHBhcnNlSW50KHBhcmFtZXRlcnNbJ3dpZHRoJ10pO1xuICAgICAgdGhpcy5jYW52YXNIZWlnaHQgPSB0eXBlb2YgcGFyYW1ldGVyc1snaGVpZ2h0J10gPT09ICd1bmRlZmluZWQnID8gREVGQVVMVF9IRUlHSFQgOiBwYXJzZUludChwYXJhbWV0ZXJzWydoZWlnaHQnXSk7XG4gICAgICB3aW5kb3cuaW5uZXJXaWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgICB3aW5kb3cuaW5uZXJIZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYW52YXMpIHtcbiAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIH1cblxuICAgIHZhciBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnRPYmplY3QgPyBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpIDogZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudHNcIik7XG4gICAgaWYgKGUuaW5pdEV2ZW50KSB7XG4gICAgICBlLmluaXRFdmVudCgncmVzaXplJywgdHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIGUub3JpZ2luID0gJ3dlYmdmeHRlc3QnO1xuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50ID8gd2luZG93LmRpc3BhdGNoRXZlbnQoZSkgOiB3aW5kb3cuZmlyZUV2ZW50KFwib25cIiArIGV2ZW50VHlwZSwgZSk7XG4gIH1cbn07XG5cblRFU1RFUi5pbml0KCk7XG5cbnZhciBwYWdlSW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4iXSwibmFtZXMiOlsiZW5hYmxlZCIsIlN0YXRzIiwidGhpcyIsImRlZmluZSIsInJlcXVpcmUkJDAiLCJzciIsImRlY29kZUNvbXBvbmVudCIsIkRFRkFVTFRfT1BUSU9OUyIsIktleXN0cm9rZVZpc3VhbGl6ZXIiLCJXZWJHTFN0YXRzIiwicGl4ZWxtYXRjaCIsInNlZWRyYW5kb20iLCJQZXJmU3RhdHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0NBQUEsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDOztDQUV0QixNQUFNLFFBQVEsQ0FBQztDQUNmLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRTtDQUNqQixJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2YsR0FBRzs7Q0FFSCxFQUFFLE9BQU8sR0FBRyxHQUFHO0NBQ2YsSUFBSSxPQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztDQUMxQixHQUFHOztDQUVILEVBQUUsT0FBTyxPQUFPLEdB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QUFFO0NBQ3JCLEVBQUUsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxVQUFVLEVBQUU7Q0FDckMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDckMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNqQyxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDekMsSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtDQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3RDLElBQUksTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Q0FDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUN0QyxJQUFJLE1BQU0sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0NBQy9DLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDdkMsSUFBSSxNQUFNLElBQUksT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxFQUFFO0NBQzNELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FB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LENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Q0FDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0NBQzVDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUMzQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDMUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Q0FDN0QsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2IsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdkIsSUFBSSxPQUFPLENBQUMsQ0FBQztDQUNiLEdBQUcsQ0FBQzs7Q0FFSixFQUFFLFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7Q0FDMUIsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7Q0FFckIsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Q0FDN0I7Q0FDQSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0NBQ3RCLEtBQUssTUFBTTtDQUNYO0NBQ0EsTUFBTSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztDQUN2QixNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN4QyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Q0FDbEMsYUFBYSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Q0FDeEQsT0FBTztDQUNQLEtBQUs7Q0FDTDtDQUNBLElBQUksT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25DLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztDQUU3QyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2IsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7Q0FFYjtDQUNBLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDOUIsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDaEIsS0FBSztDQUNMLEdBQUc7O0NBRUgsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ2pCLENBQUM7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtDQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNwQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNaLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDWCxDQUFDOztDQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7Q0FDMUIsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQztDQUN2QyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQztDQUMzQixNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUs7Q0FDaEMsTUFBTSxJQUFJLEdBQUcsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7Q0FDcEUsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVc7Q0FDM0IsSUFBSSxHQUFHO0NBQ1AsTUFBTSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtDQUNoQyxVQUFVLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksV0FBVztDQUMvQyxVQUFVLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0NBQzNDLEtBQUssUUFBUSxNQUFNLEtBQUssQ0FBQyxFQUFFO0NBQzNCLElBQUksT0FBTyxNQUFNLENBQUM7Q0FDbEIsR0FBRyxDQUFDO0NBQ0osRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7Q0FDdkIsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztDQUNwQixFQUFFLElBQUksS0FBSyxFQUFFO0NBQ2IsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztDQUNqQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFFO0NBQ3BELEdBQUc7Q0FDSCxFQUFFLE9BQU8sSUFBSSxDQUFDO0NBQ2QsQ0FBQzs7Q0FFRCxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFO0NBQzlCLEVBQUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Q0FDeEIsQ0FBQyxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7Q0FDakMsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3RDLENBQUMsTUFBTTtDQUNQLEVBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Q0FDeEIsQ0FBQzs7Q0FFRCxDQUFDO0NBQ0QsRUFBRUQsY0FBSTtDQUNOLEVBQUUsQUFBK0IsTUFBTTtDQUN2QyxFQUFFLENBQUMsT0FBT0MsU0FBTSxLQUFLLFVBQVUsQUFBVTtDQUN6QyxDQUFDOzs7O0NDL0ZEO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTs7Q0FFQSxDQUFDLFNBQVMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUU7O0NBRWxDLFNBQVMsTUFBTSxDQUFDLElBQUksRUFBRTtDQUN0QixFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQzs7Q0FFaEI7Q0FDQSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsV0FBVztDQUN2QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0NBQ2hCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUNqQztDQUNBLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQztDQUNwQztDQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUM7Q0FDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztDQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ2xCO0NBQ0EsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDckIsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNiO0NBQ0EsSUFBSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEMsR0FBRyxDQUFDOztDQUVKLEVBQUUsU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRTtDQUMxQixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxHQUFHLENBQUM7Q0FDM0MsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Q0FDN0I7Q0FDQSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7Q0FDZixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7Q0FDbEIsS0FBSyxNQUFNO0NBQ1g7Q0FDQSxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0NBQ3pCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNaLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUMzQyxLQUFLO0NBQ0w7Q0FDQSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtDQUN6QztDQUNBLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUM3RDtDQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztDQUNwQixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtDQUNsQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDO0NBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDcEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pDLE9BQU87Q0FDUCxLQUFLO0NBQ0w7Q0FDQSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRTtDQUNsQixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztDQUMvQyxLQUFLO0NBQ0w7Q0FDQTtDQUNBO0NBQ0EsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQ1osSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Q0FDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztDQUM1QixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDcEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNuQixLQUFLO0NBQ0w7Q0FDQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2IsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNiLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDYixHQUFHOztDQUVILEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztDQUNqQixDQUFDOztDQUVELFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7Q0FDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3BCLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDWCxDQUFDLEFBQ0Q7Q0FDQSxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0NBQzFCLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUM7Q0FDdkMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7Q0FDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLO0NBQ2hDLE1BQU0sSUFBSSxHQUFHLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDO0NBQ3BFLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXO0NBQzNCLElBQUksR0FBRztDQUNQLE1BQU0sSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7Q0FDaEMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVc7Q0FDL0MsVUFBVSxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztDQUMzQyxLQUFLLFFBQVEsTUFBTSxLQUFLLENBQUMsRUFBRTtDQUMzQixJQUFJLE9BQU8sTUFBTSxDQUFDO0NBQ2xCLEdBQUcsQ0FBQztDQUNKLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0NBQ3ZCLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Q0FDcEIsRUFBRSxJQUFJLEtBQUssRUFBRTtDQUNiLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Q0FDakMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRTtDQUNwRCxHQUFHO0NBQ0gsRUFBRSxPQUFPLElBQUksQ0FBQztDQUNkLENBQUM7O0NBRUQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtDQUM5QixFQUFFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0NBQ3hCLENBQUMsTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO0NBQ2pDLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUN0QyxDQUFDLE1BQU07Q0FDUCxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0NBQ3RCLENBQUM7O0NBRUQsQ0FBQztDQUNELEVBQUVELGNBQUk7Q0FDTixFQUFFLEFBQStCLE1BQU07Q0FDdkMsRUFBRSxDQUFDLE9BQU9DLFNBQU0sS0FBSyxVQUFVLEFBQVU7Q0FDekMsQ0FBQzs7OztDQ2pKRDtDQUNBO0NBQ0E7O0NBRUEsQ0FBQyxTQUFTLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFOztDQUVsQyxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Q0FDdEIsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLEVBQUUsT0FBTyxHQUFHLEVBQUUsQ0FBQzs7Q0FFOUI7Q0FDQSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsV0FBVztDQUN2QixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNwQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3BCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDMUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN0QyxJQUFJLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NB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QUksSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNiLEdBQUc7O0NBRUg7Q0FDQSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxTQUFTLEtBQUssRUFBRTtDQUMxQjtDQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUM7Q0FDaEIsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNyQyxJQUFJLE9BQU8sS0FBSyxFQUFFLEVBQUU7Q0FDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDOUUsS0FBSztDQUNMLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN2QixJQUFJLE9BQU8sQ0FBQyxDQUFDO0NBQ2I7Q0FDQTtDQUNBO0NBQ0EsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ1osQ0FBQzs7Q0FFRDtDQUNBO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7Q0FDcEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0NBQ3BCLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDWCxDQUFDLEFBQ0Q7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7Q0FDN0IsRUFBRSxJQUFJLE1BQU0sR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO0NBQzVDLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRTtDQUNoQyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRTtDQUN0QixNQUFNLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Q0FDdEUsS0FBSztDQUNMLEdBQUc7Q0FDSCxFQUFFLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsR0FBRyxJQUFJLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRTtDQUN2RSxDQUFDOztDQUVEO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQSxTQUFTLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO0NBQzNCLEVBQUUsSUFBSSxVQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMzQyxFQUFFLE9BQU8sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Q0FDaEMsSUFBSSxHQUFHLENBQUMs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QyxJQUFJLENBQUMsS0FBSyxFQUFFO0NBQ2IsRUFBRSxPQUFPLEdBQUcsQ0FBQztDQUNiLEVBQUU7O0NBRUYsQ0FBQyxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Q0FDdkMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQzs7Q0FFM0Y7Q0FDQTtDQUNBLEVBQUUsS0FBSyxHQUFHLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDN0gsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7Q0FDOUMsRUFBRTs7Q0FFRixDQUFDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtDQUNyQyxFQUFFLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN6QixFQUFFLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Q0FDbkQsR0FBRyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Q0FDdkMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUM3QyxJQUFJO0NBQ0osR0FBRyxNQUFNO0NBQ1QsR0FBRyxH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Q0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztDQUNuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDOztDQUVuQyxRQUFRLEVBQUUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7Q0FDbkMsUUFBUSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0NBQ25DLFFBQVEsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQzs7Q0FFbkMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7O0NBRWxELElBQUksSUFBSSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7O0NBRXhCLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0NBQ2pELFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDOztDQUVsRCxJQUFJLE9BQU8sTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMs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
