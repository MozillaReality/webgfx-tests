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

	//----------------------------------------------------------------------
	// Hook canvas.getContext
	//----------------------------------------------------------------------
	var originalGetContext = HTMLCanvasElement.prototype.getContext;
	if (!HTMLCanvasElement.prototype.getContextRaw) {
	    HTMLCanvasElement.prototype.getContextRaw = originalGetContext;
	}

	var enabled = false;

	var CanvasHook = {
	  webglContext: null,
	  enable: function () {
	    if (enabled) {return;}

	    var self = this;
	    HTMLCanvasElement.prototype.getContext = function() {
	      var ctx = originalGetContext.apply(this, arguments);
	      if ((ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
	        self.webglContext = ctx;
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

	CanvasHook.enable();

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
	  numFramesToRender: 100,

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
	      document.body.appendChild(actualImage);
	      actualImage.style.cssText="position:absolute;left:0;right:0;top:0;bottom:0;z-index:99990;width:100%;height:100%;background-color:#999;font-size:100px;display:flex;align-items:center;justify-content:center;font-family:sans-serif";
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
	    var serverUrl = 'http://' + GFXPERFTEST_SERVER_IP + ':8888';

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
	      test_id: TEST_ID,
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

	          //if (TesterConfig.sendLog)
	          TESTER.socket.emit('log', args);

	          return fn.apply(null, args);
	        };
	      }
	    });
	  },
	  init: function () {
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

	    this.socket.emit('benchmark_started', {id: TEST_ID});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vc3JjL2NsaWVudC9jYW52YXNob29rLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUmVhbERhdGUgPSBEYXRlO1xuXG5jbGFzcyBNb2NrRGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLnQgPSB0O1xuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBzdGF0aWMgcmVhbE5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lem9uZU9mZnNldCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHRvVGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXREYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXREYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldEZ1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0U2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VGltZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0WWVhcigpIHsgcmV0dXJuIDA7IH1cblxuICBzdGF0aWMgVVRDKCkgeyByZXR1cm4gMDsgfVxuXG4gIGdldFVUQ0RhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0RheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0hvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuXG4gIHNldERhdGUoKSB7fVxuICBzZXRGdWxsWWVhcigpIHt9XG4gIHNldEhvdXJzKCkge31cbiAgc2V0TWlsbGlzZWNvbmRzKCkge31cbiAgc2V0TWludXRlcygpIHt9XG4gIHNldE1vbnRoKCkge31cbiAgc2V0U2Vjb25kcygpIHt9XG4gIHNldFRpbWUoKSB7fVxuXG4gIHNldFVUQ0RhdGUoKSB7fVxuICBzZXRVVENGdWxsWWVhcigpIHt9XG4gIHNldFVUQ0hvdXJzKCkge31cbiAgc2V0VVRDTWlsbGlzZWNvbmRzKCkge31cbiAgc2V0VVRDTWludXRlcygpIHt9XG4gIHNldFVUQ01vbnRoKCkge31cblxuICBzZXRZZWFyKCkge31cbn1cblxudmFyIHJlYWxQZXJmb3JtYW5jZTtcblxuaWYgKCFwZXJmb3JtYW5jZS5yZWFsTm93KSB7XG4gIHZhciBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc1NhZmFyaSkge1xuICAgIHJlYWxQZXJmb3JtYW5jZSA9IHBlcmZvcm1hbmNlO1xuICAgIHBlcmZvcm1hbmNlID0ge1xuICAgICAgcmVhbE5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH0sXG4gICAgICBub3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtYW5jZS5yZWFsTm93ID0gcGVyZm9ybWFuY2Uubm93O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGltZVNjYWxlOiAxLjAsXG4gIGZha2VkVGltZTogMCxcbiAgZW5hYmxlZDogZmFsc2UsXG4gIG5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcjogZmFsc2UsXG4gIHNldEZha2VkVGltZTogZnVuY3Rpb24oIG5ld0Zha2VkVGltZSApIHtcbiAgICB0aGlzLmZha2VkVGltZSA9IG5ld0Zha2VkVGltZTtcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgRGF0ZSA9IE1vY2tEYXRlO1xuICAgIFxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5uZWVkc0Zha2VNb25vdG9ub3VzbHlJbmNyZWFzaW5nVGltZXIpIHtcbiAgICAgIERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmZha2VkVGltZSAqIDEwMDAuMCAqIHNlbGYudGltZVNjYWxlIC8gNjAuMDsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmZha2VkVGltZSAqIDEwMDAuMCAqIHNlbGYudGltZVNjYWxlIC8gNjAuMDsgfVxuICAgIH1cbiAgXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfTtcbiAgICBcbiAgICBEYXRlID0gUmVhbERhdGU7ICAgIFxuICAgIHBlcmZvcm1hbmNlLm5vdyA9IHJlYWxQZXJmb3JtYW5jZS5ub3c7XG4gICAgXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7ICAgIFxuICB9XG59IiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIb29rIGNhbnZhcy5nZXRDb250ZXh0XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnZhciBvcmlnaW5hbEdldENvbnRleHQgPSBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dDtcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcpIHtcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdyA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbn1cblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICB3ZWJnbENvbnRleHQ6IG51bGwsXG4gIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbmFibGVkKSB7cmV0dXJuO31cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN0eCA9IG9yaWdpbmFsR2V0Q29udGV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChjdHggaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHx8ICh3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAmJiAoY3R4IGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkpKSB7XG4gICAgICAgIHNlbGYud2ViZ2xDb250ZXh0ID0gY3R4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0eDsgICAgXG4gICAgfVxuICAgIGVuYWJsZWQgPSB0cnVlO1xuICB9LFxuXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHtyZXR1cm47fVxuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyZlN0YXRzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5uID0gMDtcbiAgICB0aGlzLm1pbiA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5tYXggPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLnN1bSA9IDA7XG4gICAgdGhpcy5tZWFuID0gMDtcbiAgICB0aGlzLnEgPSAwO1xuICB9XG5cbiAgZ2V0IHZhcmlhbmNlKCkge1xuICAgIHJldHVybiB0aGlzLnEgLyB0aGlzLm47XG4gIH1cblxuICBnZXQgc3RhbmRhcmRfZGV2aWF0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5xIC8gdGhpcy5uKTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtKSkge1xuICAgICAgLy8gU29ycnksIG5vIE5hTnNcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5uKys7XG4gICAgdGhpcy5taW4gPSBNYXRoLm1pbih0aGlzLm1pbiwgbnVtKTtcbiAgICB0aGlzLm1heCA9IE1hdGgubWF4KHRoaXMubWF4LCBudW0pO1xuICAgIHRoaXMuc3VtICs9IG51bTtcbiAgICBjb25zdCBwcmV2TWVhbiA9IHRoaXMubWVhbjtcbiAgICB0aGlzLm1lYW4gPSB0aGlzLm1lYW4gKyAobnVtIC0gdGhpcy5tZWFuKSAvIHRoaXMubjtcbiAgICB0aGlzLnEgPSB0aGlzLnEgKyAobnVtIC0gcHJldk1lYW4pICogKG51bSAtIHRoaXMubWVhbik7XG4gIH1cblxuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG46IHRoaXMubixcbiAgICAgIG1pbjogdGhpcy5taW4sXG4gICAgICBtYXg6IHRoaXMubWF4LFxuICAgICAgc3VtOiB0aGlzLnN1bSxcbiAgICAgIG1lYW46IHRoaXMubWVhbixcbiAgICAgIHZhcmlhbmNlOiB0aGlzLnZhcmlhbmNlLFxuICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YW5kYXJkX2RldmlhdGlvblxuICAgIH07XG4gIH0gIFxufVxuIiwiaW1wb3J0IFN0YXRzIGZyb20gJ2luY3JlbWVudGFsLXN0YXRzLWxpdGUnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRFU1RTVEFUU1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGZpcnN0RnJhbWUgPSB0cnVlO1xuICB2YXIgZmlyc3RGcHMgPSB0cnVlO1xuXG4gIHZhciBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSAwO1xuICB2YXIgcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gIHZhciBsYXN0VXBkYXRlVGltZSA9IG51bGw7XG5cbiAgLy8gVXNlZCB0byBkZXRlY3QgcmVjdXJzaXZlIGVudHJpZXMgdG8gdGhlIG1haW4gbG9vcCwgd2hpY2ggY2FuIGhhcHBlbiBpbiBjZXJ0YWluIGNvbXBsZXggY2FzZXMsIGUuZy4gaWYgbm90IHVzaW5nIHJBRiB0byB0aWNrIHJlbmRlcmluZyB0byB0aGUgY2FudmFzLlxuICB2YXIgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID0gMDtcblxuICByZXR1cm4ge1xuICAgIGdldFN0YXRzU3VtbWFyeTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgT2JqZWN0LmtleXModGhpcy5zdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICByZXN1bHRba2V5XSA9IHtcbiAgICAgICAgICBtaW46IHRoaXMuc3RhdHNba2V5XS5taW4sXG4gICAgICAgICAgbWF4OiB0aGlzLnN0YXRzW2tleV0ubWF4LFxuICAgICAgICAgIGF2ZzogdGhpcy5zdGF0c1trZXldLm1lYW4sXG4gICAgICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgc3RhdHM6IHtcbiAgICAgIGZwczogbmV3IFN0YXRzKCksXG4gICAgICBkdDogbmV3IFN0YXRzKCksXG4gICAgICBjcHU6IG5ldyBTdGF0cygpICAgICAgICBcbiAgICB9LFxuXG4gICAgbnVtRnJhbWVzOiAwLFxuICAgIGxvZzogZmFsc2UsXG4gICAgdG90YWxUaW1lSW5NYWluTG9vcDogMCxcbiAgICB0b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3A6IDAsXG4gICAgZnBzQ291bnRlclVwZGF0ZUludGVydmFsOiAyMDAsIC8vIG1zZWNzXG5cbiAgICBmcmFtZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlcisrO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9PSAxKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKGxhc3RVcGRhdGVUaW1lID09PSBudWxsKSB7XG4gICAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlU3RhdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICAgIHRoaXMubnVtRnJhbWVzKys7XG5cbiAgICAgIGlmICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUgPiB0aGlzLmZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbClcbiAgICAgIHtcbiAgICAgICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzICogMTAwMCAvICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgICB0aGlzLm51bUZyYW1lcyA9IDA7XG4gICAgICAgIGxhc3RVcGRhdGVUaW1lID0gdGltZU5vdztcblxuICAgICAgICBpZiAoZmlyc3RGcHMpXG4gICAgICAgIHtcbiAgICAgICAgICBmaXJzdEZwcyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdHMuZnBzLnVwZGF0ZShmcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxvZykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBmcHMgLSBtaW46ICR7dGhpcy5zdGF0cy5mcHMubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZnBzLm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5mcHMubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZnBzLnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBtcyAgLSBtaW46ICR7dGhpcy5zdGF0cy5kdC5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5kdC5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZHQubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZHQuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYGNwdSAtIG1pbjogJHt0aGlzLnN0YXRzLmNwdS5taW4udG9GaXhlZCgyKX0lIC8gYXZnOiAke3RoaXMuc3RhdHMuY3B1Lm1lYW4udG9GaXhlZCgyKX0lIC8gbWF4OiAke3RoaXMuc3RhdHMuY3B1Lm1heC50b0ZpeGVkKDIpfSUgLSBzdGQ6ICR7dGhpcy5zdGF0cy5jcHUuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9JWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBpbiB0aGUgZW5kIG9mIGVhY2ggbWFpbiBsb29wIGZyYW1lIHRpY2suXG4gICAgZnJhbWVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyLS07XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyICE9IDApIHJldHVybjtcblxuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICB2YXIgY3B1TWFpbkxvb3BEdXJhdGlvbiA9IHRpbWVOb3cgLSBjdXJyZW50RnJhbWVTdGFydFRpbWU7XG4gICAgICB2YXIgZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzID0gdGltZU5vdyAtIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICAgICAgcHJldmlvdXNGcmFtZUVuZFRpbWUgPSB0aW1lTm93O1xuICBcbiAgICAgIGlmIChmaXJzdEZyYW1lKSB7XG4gICAgICAgIGZpcnN0RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRvdGFsVGltZUluTWFpbkxvb3AgKz0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcbiAgICAgIHRoaXMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICs9IGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyAtIGNwdU1haW5Mb29wRHVyYXRpb247XG5cbiAgICAgIHZhciBjcHUgPSBjcHVNYWluTG9vcER1cmF0aW9uICogMTAwIC8gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzO1xuICAgICAgdGhpcy5zdGF0cy5jcHUudXBkYXRlKGNwdSk7XG4gICAgICB0aGlzLnN0YXRzLmR0LnVwZGF0ZShkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMpO1xuICAgIH1cbiAgfVxufTsiLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy8gXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vLyBcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gQWxlYShzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIG1hc2ggPSBNYXNoKCk7XG5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gMjA5MTYzOSAqIG1lLnMwICsgbWUuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgbWUuczAgPSBtZS5zMTtcbiAgICBtZS5zMSA9IG1lLnMyO1xuICAgIHJldHVybiBtZS5zMiA9IHQgLSAobWUuYyA9IHQgfCAwKTtcbiAgfTtcblxuICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gIG1lLmMgPSAxO1xuICBtZS5zMCA9IG1hc2goJyAnKTtcbiAgbWUuczEgPSBtYXNoKCcgJyk7XG4gIG1lLnMyID0gbWFzaCgnICcpO1xuICBtZS5zMCAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczAgPCAwKSB7IG1lLnMwICs9IDE7IH1cbiAgbWUuczEgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMxIDwgMCkgeyBtZS5zMSArPSAxOyB9XG4gIG1lLnMyIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMiA8IDApIHsgbWUuczIgKz0gMTsgfVxuICBtYXNoID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYyA9IGYuYztcbiAgdC5zMCA9IGYuczA7XG4gIHQuczEgPSBmLnMxO1xuICB0LnMyID0gZi5zMjtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgQWxlYShzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IHhnLm5leHQ7XG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgKiAweDEwMDAwMDAwMCkgfCAwOyB9XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBybmcoKSArIChwcm5nKCkgKiAweDIwMDAwMCB8IDApICogMS4xMTAyMjMwMjQ2MjUxNTY1ZS0xNjsgLy8gMl4tNTNcbiAgfTtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmZ1bmN0aW9uIE1hc2goKSB7XG4gIHZhciBuID0gMHhlZmM4MjQ5ZDtcblxuICB2YXIgbWFzaCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9O1xuXG4gIHJldHVybiBtYXNoO1xufVxuXG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMuYWxlYSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yMTI4XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IG1lLnggXiAobWUueCA8PCAxMSk7XG4gICAgbWUueCA9IG1lLnk7XG4gICAgbWUueSA9IG1lLno7XG4gICAgbWUueiA9IG1lLnc7XG4gICAgcmV0dXJuIG1lLncgXj0gKG1lLncgPj4+IDE5KSBeIHQgXiAodCA+Pj4gOCk7XG4gIH07XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3IxMjggPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcndvd1wiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAobWUueCBeIChtZS54ID4+PiAyKSk7XG4gICAgbWUueCA9IG1lLnk7IG1lLnkgPSBtZS56OyBtZS56ID0gbWUudzsgbWUudyA9IG1lLnY7XG4gICAgcmV0dXJuIChtZS5kID0gKG1lLmQgKyAzNjI0MzcgfCAwKSkgK1xuICAgICAgIChtZS52ID0gKG1lLnYgXiAobWUudiA8PCA0KSkgXiAodCBeICh0IDw8IDEpKSkgfCAwO1xuICB9O1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuICBtZS52ID0gMDtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgaWYgKGsgPT0gc3Ryc2VlZC5sZW5ndGgpIHtcbiAgICAgIG1lLmQgPSBtZS54IDw8IDEwIF4gbWUueCA+Pj4gNDtcbiAgICB9XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHQudiA9IGYudjtcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3J3b3cgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcnNoaWZ0N1wiIGFsZ29yaXRobSBieVxuLy8gRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXI6XG4vLyBcIk9uIHRoZSBYb3Jnc2hpZnQgUmFuZG9tIE51bWJlciBHZW5lcmF0b3JzXCJcbi8vIGh0dHA6Ly9zYWx1Yy5lbmdyLnVjb25uLmVkdS9yZWZzL2NyeXB0by9ybmcvcGFubmV0b24wNW9udGhleG9yc2hpZnQucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHZhciBYID0gbWUueCwgaSA9IG1lLmksIHQsIHYsIHc7XG4gICAgdCA9IFhbaV07IHQgXj0gKHQgPj4+IDcpOyB2ID0gdCBeICh0IDw8IDI0KTtcbiAgICB0ID0gWFsoaSArIDEpICYgN107IHYgXj0gdCBeICh0ID4+PiAxMCk7XG4gICAgdCA9IFhbKGkgKyAzKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMyk7XG4gICAgdCA9IFhbKGkgKyA0KSAmIDddOyB2IF49IHQgXiAodCA8PCA3KTtcbiAgICB0ID0gWFsoaSArIDcpICYgN107IHQgPSB0IF4gKHQgPDwgMTMpOyB2IF49IHQgXiAodCA8PCA5KTtcbiAgICBYW2ldID0gdjtcbiAgICBtZS5pID0gKGkgKyAxKSAmIDc7XG4gICAgcmV0dXJuIHY7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciBqLCB3LCBYID0gW107XG5cbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxuICAgICAgdyA9IFhbMF0gPSBzZWVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIHVzaW5nIGEgc3RyaW5nLlxuICAgICAgc2VlZCA9ICcnICsgc2VlZDtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIFhbaiAmIDddID0gKFhbaiAmIDddIDw8IDE1KSBeXG4gICAgICAgICAgICAoc2VlZC5jaGFyQ29kZUF0KGopICsgWFsoaiArIDEpICYgN10gPDwgMTMpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBFbmZvcmNlIGFuIGFycmF5IGxlbmd0aCBvZiA4LCBub3QgYWxsIHplcm9lcy5cbiAgICB3aGlsZSAoWC5sZW5ndGggPCA4KSBYLnB1c2goMCk7XG4gICAgZm9yIChqID0gMDsgaiA8IDggJiYgWFtqXSA9PT0gMDsgKytqKTtcbiAgICBpZiAoaiA9PSA4KSB3ID0gWFs3XSA9IC0xOyBlbHNlIHcgPSBYW2pdO1xuXG4gICAgbWUueCA9IFg7XG4gICAgbWUuaSA9IDA7XG5cbiAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cbiAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcbiAgICAgIG1lLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueC5zbGljZSgpO1xuICB0LmkgPSBmLmk7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS54KSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yc2hpZnQ3ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgUmljaGFyZCBCcmVudCdzIFhvcmdlbnMgeG9yNDA5NiBhbGdvcml0aG0uXG4vL1xuLy8gVGhpcyBmYXN0IG5vbi1jcnlwdG9ncmFwaGljIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIGlzIGRlc2lnbmVkIGZvclxuLy8gdXNlIGluIE1vbnRlLUNhcmxvIGFsZ29yaXRobXMuIEl0IGNvbWJpbmVzIGEgbG9uZy1wZXJpb2QgeG9yc2hpZnRcbi8vIGdlbmVyYXRvciB3aXRoIGEgV2V5bCBnZW5lcmF0b3IsIGFuZCBpdCBwYXNzZXMgYWxsIGNvbW1vbiBiYXR0ZXJpZXNcbi8vIG9mIHN0YXN0aWNpYWwgdGVzdHMgZm9yIHJhbmRvbW5lc3Mgd2hpbGUgY29uc3VtaW5nIG9ubHkgYSBmZXcgbmFub3NlY29uZHNcbi8vIGZvciBlYWNoIHBybmcgZ2VuZXJhdGVkLiAgRm9yIGJhY2tncm91bmQgb24gdGhlIGdlbmVyYXRvciwgc2VlIEJyZW50J3Ncbi8vIHBhcGVyOiBcIlNvbWUgbG9uZy1wZXJpb2QgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzIHVzaW5nIHNoaWZ0cyBhbmQgeG9ycy5cIlxuLy8gaHR0cDovL2FyeGl2Lm9yZy9wZGYvMTAwNC4zMTE1djEucGRmXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHhvcjQwOTYgPSByZXF1aXJlKCd4b3I0MDk2Jyk7XG4vLyByYW5kb20gPSB4b3I0MDk2KDEpOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZWQgd2l0aCBpbnQzMiBvciBzdHJpbmcuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tKCksIDAuMTUyMDQzNjQ1MDUzODU0Nyk7IC8vICgwLCAxKSByYW5nZSwgNTMgYml0cy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20uaW50MzIoKSwgMTgwNjUzNDg5Nyk7ICAgLy8gc2lnbmVkIGludDMyLCAzMiBiaXRzLlxuLy9cbi8vIEZvciBub256ZXJvIG51bWVyaWMga2V5cywgdGhpcyBpbXBlbGVtZW50YXRpb24gcHJvdmlkZXMgYSBzZXF1ZW5jZVxuLy8gaWRlbnRpY2FsIHRvIHRoYXQgYnkgQnJlbnQncyB4b3JnZW5zIDMgaW1wbGVtZW50YWlvbiBpbiBDLiAgVGhpc1xuLy8gaW1wbGVtZW50YXRpb24gYWxzbyBwcm92aWRlcyBmb3IgaW5pdGFsaXppbmcgdGhlIGdlbmVyYXRvciB3aXRoXG4vLyBzdHJpbmcgc2VlZHMsIG9yIGZvciBzYXZpbmcgYW5kIHJlc3RvcmluZyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvci5cbi8vXG4vLyBPbiBDaHJvbWUsIHRoaXMgcHJuZyBiZW5jaG1hcmtzIGFib3V0IDIuMSB0aW1lcyBzbG93ZXIgdGhhblxuLy8gSmF2YXNjcmlwdCdzIGJ1aWx0LWluIE1hdGgucmFuZG9tKCkuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3ID0gbWUudyxcbiAgICAgICAgWCA9IG1lLlgsIGkgPSBtZS5pLCB0LCB2O1xuICAgIC8vIFVwZGF0ZSBXZXlsIGdlbmVyYXRvci5cbiAgICBtZS53ID0gdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwO1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICB2IF49IHYgPDwgMTM7XG4gICAgdCBePSB0IDw8IDE3O1xuICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgdCBePSB0ID4+PiAxMjtcbiAgICAvLyBVcGRhdGUgWG9yIGdlbmVyYXRvciBhcnJheSBzdGF0ZS5cbiAgICB2ID0gWFtpXSA9IHYgXiB0O1xuICAgIG1lLmkgPSBpO1xuICAgIC8vIFJlc3VsdCBpcyB0aGUgY29tYmluYXRpb24uXG4gICAgcmV0dXJuICh2ICsgKHcgXiAodyA+Pj4gMTYpKSkgfCAwO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgdCwgdiwgaSwgaiwgdywgWCA9IFtdLCBsaW1pdCA9IDEyODtcbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gTnVtZXJpYyBzZWVkcyBpbml0aWFsaXplIHYsIHdoaWNoIGlzIHVzZWQgdG8gZ2VuZXJhdGVzIFguXG4gICAgICB2ID0gc2VlZDtcbiAgICAgIHNlZWQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdHJpbmcgc2VlZHMgYXJlIG1peGVkIGludG8gdiBhbmQgWCBvbmUgY2hhcmFjdGVyIGF0IGEgdGltZS5cbiAgICAgIHNlZWQgPSBzZWVkICsgJ1xcMCc7XG4gICAgICB2ID0gMDtcbiAgICAgIGxpbWl0ID0gTWF0aC5tYXgobGltaXQsIHNlZWQubGVuZ3RoKTtcbiAgICB9XG4gICAgLy8gSW5pdGlhbGl6ZSBjaXJjdWxhciBhcnJheSBhbmQgd2V5bCB2YWx1ZS5cbiAgICBmb3IgKGkgPSAwLCBqID0gLTMyOyBqIDwgbGltaXQ7ICsraikge1xuICAgICAgLy8gUHV0IHRoZSB1bmljb2RlIGNoYXJhY3RlcnMgaW50byB0aGUgYXJyYXksIGFuZCBzaHVmZmxlIHRoZW0uXG4gICAgICBpZiAoc2VlZCkgdiBePSBzZWVkLmNoYXJDb2RlQXQoKGogKyAzMikgJSBzZWVkLmxlbmd0aCk7XG4gICAgICAvLyBBZnRlciAzMiBzaHVmZmxlcywgdGFrZSB2IGFzIHRoZSBzdGFydGluZyB3IHZhbHVlLlxuICAgICAgaWYgKGogPT09IDApIHcgPSB2O1xuICAgICAgdiBePSB2IDw8IDEwO1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHYgXj0gdiA8PCA0O1xuICAgICAgdiBePSB2ID4+PiAxMztcbiAgICAgIGlmIChqID49IDApIHtcbiAgICAgICAgdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwOyAgICAgLy8gV2V5bC5cbiAgICAgICAgdCA9IChYW2ogJiAxMjddIF49ICh2ICsgdykpOyAgLy8gQ29tYmluZSB4b3IgYW5kIHdleWwgdG8gaW5pdCBhcnJheS5cbiAgICAgICAgaSA9ICgwID09IHQpID8gaSArIDEgOiAwOyAgICAgLy8gQ291bnQgemVyb2VzLlxuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBoYXZlIGRldGVjdGVkIGFsbCB6ZXJvZXM7IG1ha2UgdGhlIGtleSBub256ZXJvLlxuICAgIGlmIChpID49IDEyOCkge1xuICAgICAgWFsoc2VlZCAmJiBzZWVkLmxlbmd0aCB8fCAwKSAmIDEyN10gPSAtMTtcbiAgICB9XG4gICAgLy8gUnVuIHRoZSBnZW5lcmF0b3IgNTEyIHRpbWVzIHRvIGZ1cnRoZXIgbWl4IHRoZSBzdGF0ZSBiZWZvcmUgdXNpbmcgaXQuXG4gICAgLy8gRmFjdG9yaW5nIHRoaXMgYXMgYSBmdW5jdGlvbiBzbG93cyB0aGUgbWFpbiBnZW5lcmF0b3IsIHNvIGl0IGlzIGp1c3RcbiAgICAvLyB1bnJvbGxlZCBoZXJlLiAgVGhlIHdleWwgZ2VuZXJhdG9yIGlzIG5vdCBhZHZhbmNlZCB3aGlsZSB3YXJtaW5nIHVwLlxuICAgIGkgPSAxMjc7XG4gICAgZm9yIChqID0gNCAqIDEyODsgaiA+IDA7IC0taikge1xuICAgICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgICB2IF49IHYgPDwgMTM7XG4gICAgICB0IF49IHQgPDwgMTc7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdCBePSB0ID4+PiAxMjtcbiAgICAgIFhbaV0gPSB2IF4gdDtcbiAgICB9XG4gICAgLy8gU3RvcmluZyBzdGF0ZSBhcyBvYmplY3QgbWVtYmVycyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBjbG9zdXJlIHZhcmlhYmxlcy5cbiAgICBtZS53ID0gdztcbiAgICBtZS5YID0gWDtcbiAgICBtZS5pID0gaTtcbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LncgPSBmLnc7XG4gIHQuWCA9IGYuWC5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLlgpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3I0MDk2ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdyBvYmplY3Qgb3IgZ2xvYmFsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcIlR5Y2hlLWlcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLlxuLy8gU2VlIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQsIGEgPSBtZS5hO1xuICAgIGIgPSAoYiA8PCAyNSkgXiAoYiA+Pj4gNykgXiBjO1xuICAgIGMgPSAoYyAtIGQpIHwgMDtcbiAgICBkID0gKGQgPDwgMjQpIF4gKGQgPj4+IDgpIF4gYTtcbiAgICBhID0gKGEgLSBiKSB8IDA7XG4gICAgbWUuYiA9IGIgPSAoYiA8PCAyMCkgXiAoYiA+Pj4gMTIpIF4gYztcbiAgICBtZS5jID0gYyA9IChjIC0gZCkgfCAwO1xuICAgIG1lLmQgPSAoZCA8PCAxNikgXiAoYyA+Pj4gMTYpIF4gYTtcbiAgICByZXR1cm4gbWUuYSA9IChhIC0gYikgfCAwO1xuICB9O1xuXG4gIC8qIFRoZSBmb2xsb3dpbmcgaXMgbm9uLWludmVydGVkIHR5Y2hlLCB3aGljaCBoYXMgYmV0dGVyIGludGVybmFsXG4gICAqIGJpdCBkaWZmdXNpb24sIGJ1dCB3aGljaCBpcyBhYm91dCAyNSUgc2xvd2VyIHRoYW4gdHljaGUtaSBpbiBKUy5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhID0gbWUuYSwgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZDtcbiAgICBhID0gKG1lLmEgKyBtZS5iIHwgMCkgPj4+IDA7XG4gICAgZCA9IG1lLmQgXiBhOyBkID0gZCA8PCAxNiBeIGQgPj4+IDE2O1xuICAgIGMgPSBtZS5jICsgZCB8IDA7XG4gICAgYiA9IG1lLmIgXiBjOyBiID0gYiA8PCAxMiBeIGQgPj4+IDIwO1xuICAgIG1lLmEgPSBhID0gYSArIGIgfCAwO1xuICAgIGQgPSBkIF4gYTsgbWUuZCA9IGQgPSBkIDw8IDggXiBkID4+PiAyNDtcbiAgICBtZS5jID0gYyA9IGMgKyBkIHwgMDtcbiAgICBiID0gYiBeIGM7XG4gICAgcmV0dXJuIG1lLmIgPSAoYiA8PCA3IF4gYiA+Pj4gMjUpO1xuICB9XG4gICovXG5cbiAgbWUuYSA9IDA7XG4gIG1lLmIgPSAwO1xuICBtZS5jID0gMjY1NDQzNTc2OSB8IDA7XG4gIG1lLmQgPSAxMzY3MTMwNTUxO1xuXG4gIGlmIChzZWVkID09PSBNYXRoLmZsb29yKHNlZWQpKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLmEgPSAoc2VlZCAvIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgbWUuYiA9IHNlZWQgfCAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgMjA7IGsrKykge1xuICAgIG1lLmIgXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYSA9IGYuYTtcbiAgdC5iID0gZi5iO1xuICB0LmMgPSBmLmM7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnR5Y2hlaSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLypcbkNvcHlyaWdodCAyMDE0IERhdmlkIEJhdS5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG5JTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcblRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG5TT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuKi9cblxuKGZ1bmN0aW9uIChwb29sLCBtYXRoKSB7XG4vL1xuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxuLy9cblxuLy8gRGV0ZWN0IHRoZSBnbG9iYWwgb2JqZWN0LCBldmVuIGlmIG9wZXJhdGluZyBpbiBzdHJpY3QgbW9kZS5cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0Mzg3MDU3LzI2NTI5OFxudmFyIGdsb2JhbCA9ICgwLCBldmFsKSgndGhpcycpLFxuICAgIHdpZHRoID0gMjU2LCAgICAgICAgLy8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxuICAgIGNodW5rcyA9IDYsICAgICAgICAgLy8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxuICAgIGRpZ2l0cyA9IDUyLCAgICAgICAgLy8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxuICAgIHJuZ25hbWUgPSAncmFuZG9tJywgLy8gcm5nbmFtZTogbmFtZSBmb3IgTWF0aC5yYW5kb20gYW5kIE1hdGguc2VlZHJhbmRvbVxuICAgIHN0YXJ0ZGVub20gPSBtYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcbiAgICBzaWduaWZpY2FuY2UgPSBtYXRoLnBvdygyLCBkaWdpdHMpLFxuICAgIG92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMixcbiAgICBtYXNrID0gd2lkdGggLSAxLFxuICAgIG5vZGVjcnlwdG87ICAgICAgICAgLy8gbm9kZS5qcyBjcnlwdG8gbW9kdWxlLCBpbml0aWFsaXplZCBhdCB0aGUgYm90dG9tLlxuXG4vL1xuLy8gc2VlZHJhbmRvbSgpXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cbi8vXG5mdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHZhciBrZXkgPSBbXTtcbiAgb3B0aW9ucyA9IChvcHRpb25zID09IHRydWUpID8geyBlbnRyb3B5OiB0cnVlIH0gOiAob3B0aW9ucyB8fCB7fSk7XG5cbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcbiAgICBvcHRpb25zLmVudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcbiAgICAoc2VlZCA9PSBudWxsKSA/IGF1dG9zZWVkKCkgOiBzZWVkLCAzKSwga2V5KTtcblxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xuXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cbiAgdmFyIHBybmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcbiAgICAgICAgZCA9IHN0YXJ0ZGVub20sICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXG4gICAgfVxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgbWF0aCB1bnRpbFxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXG4gICAgfVxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxuICB9O1xuXG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSB8IDA7IH1cbiAgcHJuZy5xdWljayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIC8gMHgxMDAwMDAwMDA7IH1cbiAgcHJuZy5kb3VibGUgPSBwcm5nO1xuXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcblxuICAvLyBDYWxsaW5nIGNvbnZlbnRpb246IHdoYXQgdG8gcmV0dXJuIGFzIGEgZnVuY3Rpb24gb2YgcHJuZywgc2VlZCwgaXNfbWF0aC5cbiAgcmV0dXJuIChvcHRpb25zLnBhc3MgfHwgY2FsbGJhY2sgfHxcbiAgICAgIGZ1bmN0aW9uKHBybmcsIHNlZWQsIGlzX21hdGhfY2FsbCwgc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgLy8gTG9hZCB0aGUgYXJjNCBzdGF0ZSBmcm9tIHRoZSBnaXZlbiBzdGF0ZSBpZiBpdCBoYXMgYW4gUyBhcnJheS5cbiAgICAgICAgICBpZiAoc3RhdGUuUykgeyBjb3B5KHN0YXRlLCBhcmM0KTsgfVxuICAgICAgICAgIC8vIE9ubHkgcHJvdmlkZSB0aGUgLnN0YXRlIG1ldGhvZCBpZiByZXF1ZXN0ZWQgdmlhIG9wdGlvbnMuc3RhdGUuXG4gICAgICAgICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weShhcmM0LCB7fSk7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGNhbGxlZCBhcyBhIG1ldGhvZCBvZiBNYXRoIChNYXRoLnNlZWRyYW5kb20oKSksIG11dGF0ZVxuICAgICAgICAvLyBNYXRoLnJhbmRvbSBiZWNhdXNlIHRoYXQgaXMgaG93IHNlZWRyYW5kb20uanMgaGFzIHdvcmtlZCBzaW5jZSB2MS4wLlxuICAgICAgICBpZiAoaXNfbWF0aF9jYWxsKSB7IG1hdGhbcm5nbmFtZV0gPSBwcm5nOyByZXR1cm4gc2VlZDsgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQgaXMgYSBuZXdlciBjYWxsaW5nIGNvbnZlbnRpb24sIHNvIHJldHVybiB0aGVcbiAgICAgICAgLy8gcHJuZyBkaXJlY3RseS5cbiAgICAgICAgZWxzZSByZXR1cm4gcHJuZztcbiAgICAgIH0pKFxuICBwcm5nLFxuICBzaG9ydHNlZWQsXG4gICdnbG9iYWwnIGluIG9wdGlvbnMgPyBvcHRpb25zLmdsb2JhbCA6ICh0aGlzID09IG1hdGgpLFxuICBvcHRpb25zLnN0YXRlKTtcbn1cbm1hdGhbJ3NlZWQnICsgcm5nbmFtZV0gPSBzZWVkcmFuZG9tO1xuXG4vL1xuLy8gQVJDNFxuLy9cbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2Zcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxuLy9cbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXG4vL1xuZnVuY3Rpb24gQVJDNChrZXkpIHtcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xuXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cblxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XG4gICAgc1tpXSA9IGkrKztcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XG4gICAgc1tqXSA9IHQ7XG4gIH1cblxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICAvLyBVc2luZyBpbnN0YW5jZSBtZW1iZXJzIGluc3RlYWQgb2YgY2xvc3VyZSBzdGF0ZSBuZWFybHkgZG91YmxlcyBzcGVlZC5cbiAgICB2YXIgdCwgciA9IDAsXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XG4gICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcbiAgICB9XG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xuICAgIHJldHVybiByO1xuICAgIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSwgdGhlIGZ1bmN0aW9uIGNhbGwgYmVsb3cgYXV0b21hdGljYWxseVxuICAgIC8vIGRpc2NhcmRzIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLiAgVGhpcyBpcyBjYWxsZWQgUkM0LWRyb3BbMjU2XS5cbiAgICAvLyBTZWUgaHR0cDovL2dvb2dsZS5jb20vc2VhcmNoP3E9cnNhK2ZsdWhyZXIrcmVzcG9uc2UmYnRuSVxuICB9KSh3aWR0aCk7XG59XG5cbi8vXG4vLyBjb3B5KClcbi8vIENvcGllcyBpbnRlcm5hbCBzdGF0ZSBvZiBBUkM0IHRvIG9yIGZyb20gYSBwbGFpbiBvYmplY3QuXG4vL1xuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC5qID0gZi5qO1xuICB0LlMgPSBmLlMuc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG4vL1xuLy8gZmxhdHRlbigpXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXG4vL1xuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XG4gIHZhciByZXN1bHQgPSBbXSwgdHlwID0gKHR5cGVvZiBvYmopLCBwcm9wO1xuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XG4gICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3N0cmluZycgPyBvYmogOiBvYmogKyAnXFwwJyk7XG59XG5cbi8vXG4vLyBtaXhrZXkoKVxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXG4vL1xuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSkge1xuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XG4gICAga2V5W21hc2sgJiBqXSA9XG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xuICB9XG4gIHJldHVybiB0b3N0cmluZyhrZXkpO1xufVxuXG4vL1xuLy8gYXV0b3NlZWQoKVxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGFuZCBOb2RlIGNyeXB0b1xuLy8gbW9kdWxlIGlmIGF2YWlsYWJsZS5cbi8vXG5mdW5jdGlvbiBhdXRvc2VlZCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgb3V0O1xuICAgIGlmIChub2RlY3J5cHRvICYmIChvdXQgPSBub2RlY3J5cHRvLnJhbmRvbUJ5dGVzKSkge1xuICAgICAgLy8gVGhlIHVzZSBvZiAnb3V0JyB0byByZW1lbWJlciByYW5kb21CeXRlcyBtYWtlcyB0aWdodCBtaW5pZmllZCBjb2RlLlxuICAgICAgb3V0ID0gb3V0KHdpZHRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpO1xuICAgICAgKGdsb2JhbC5jcnlwdG8gfHwgZ2xvYmFsLm1zQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMob3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRvc3RyaW5nKG91dCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgYnJvd3NlciA9IGdsb2JhbC5uYXZpZ2F0b3IsXG4gICAgICAgIHBsdWdpbnMgPSBicm93c2VyICYmIGJyb3dzZXIucGx1Z2lucztcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgZ2xvYmFsLCBwbHVnaW5zLCBnbG9iYWwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XG4gIH1cbn1cblxuLy9cbi8vIHRvc3RyaW5nKClcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xuLy9cbmZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XG59XG5cbi8vXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xuLy8gZnJvbSB0aGUgYnVpbHQtaW4gUk5HIGludG8gdGhlIGVudHJvcHkgcG9vbC4gIEJlY2F1c2Ugd2UgZG9cbi8vIG5vdCB3YW50IHRvIGludGVyZmVyZSB3aXRoIGRldGVybWluaXN0aWMgUFJORyBzdGF0ZSBsYXRlcixcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBtYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXG4vLyBpbml0aWFsaXphdGlvbi5cbi8vXG5taXhrZXkobWF0aC5yYW5kb20oKSwgcG9vbCk7XG5cbi8vXG4vLyBOb2RlanMgYW5kIEFNRCBzdXBwb3J0OiBleHBvcnQgdGhlIGltcGxlbWVudGF0aW9uIGFzIGEgbW9kdWxlIHVzaW5nXG4vLyBlaXRoZXIgY29udmVudGlvbi5cbi8vXG5pZiAoKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gc2VlZHJhbmRvbTtcbiAgLy8gV2hlbiBpbiBub2RlLmpzLCB0cnkgdXNpbmcgY3J5cHRvIHBhY2thZ2UgZm9yIGF1dG9zZWVkaW5nLlxuICB0cnkge1xuICAgIG5vZGVjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbiAgfSBjYXRjaCAoZXgpIHt9XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VlZHJhbmRvbTsgfSk7XG59XG5cbi8vIEVuZCBhbm9ueW1vdXMgc2NvcGUsIGFuZCBwYXNzIGluaXRpYWwgdmFsdWVzLlxufSkoXG4gIFtdLCAgICAgLy8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxuICBNYXRoICAgIC8vIG1hdGg6IHBhY2thZ2UgY29udGFpbmluZyByYW5kb20sIHBvdywgYW5kIHNlZWRyYW5kb21cbik7XG4iLCIvLyBBIGxpYnJhcnkgb2Ygc2VlZGFibGUgUk5HcyBpbXBsZW1lbnRlZCBpbiBKYXZhc2NyaXB0LlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciBzZWVkcmFuZG9tID0gcmVxdWlyZSgnc2VlZHJhbmRvbScpO1xuLy8gdmFyIHJhbmRvbSA9IHNlZWRyYW5kb20oMSk7IC8vIG9yIGFueSBzZWVkLlxuLy8gdmFyIHggPSByYW5kb20oKTsgICAgICAgLy8gMCA8PSB4IDwgMS4gIEV2ZXJ5IGJpdCBpcyByYW5kb20uXG4vLyB2YXIgeCA9IHJhbmRvbS5xdWljaygpOyAvLyAwIDw9IHggPCAxLiAgMzIgYml0cyBvZiByYW5kb21uZXNzLlxuXG4vLyBhbGVhLCBhIDUzLWJpdCBtdWx0aXBseS13aXRoLWNhcnJ5IGdlbmVyYXRvciBieSBKb2hhbm5lcyBCYWFnw7hlLlxuLy8gUGVyaW9kOiB+Ml4xMTZcbi8vIFJlcG9ydGVkIHRvIHBhc3MgYWxsIEJpZ0NydXNoIHRlc3RzLlxudmFyIGFsZWEgPSByZXF1aXJlKCcuL2xpYi9hbGVhJyk7XG5cbi8vIHhvcjEyOCwgYSBwdXJlIHhvci1zaGlmdCBnZW5lcmF0b3IgYnkgR2VvcmdlIE1hcnNhZ2xpYS5cbi8vIFBlcmlvZDogMl4xMjgtMS5cbi8vIFJlcG9ydGVkIHRvIGZhaWw6IE1hdHJpeFJhbmsgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yMTI4ID0gcmVxdWlyZSgnLi9saWIveG9yMTI4Jyk7XG5cbi8vIHhvcndvdywgR2VvcmdlIE1hcnNhZ2xpYSdzIDE2MC1iaXQgeG9yLXNoaWZ0IGNvbWJpbmVkIHBsdXMgd2V5bC5cbi8vIFBlcmlvZDogMl4xOTItMl4zMlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogQ29sbGlzaW9uT3ZlciwgU2ltcFBva2VyLCBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3J3b3cgPSByZXF1aXJlKCcuL2xpYi94b3J3b3cnKTtcblxuLy8geG9yc2hpZnQ3LCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllciwgdGFrZXNcbi8vIGEgZGlmZmVyZW50IGFwcHJvYWNoOiBpdCBhZGRzIHJvYnVzdG5lc3MgYnkgYWxsb3dpbmcgbW9yZSBzaGlmdHNcbi8vIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuICBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yXG4vLyB3aXRoIDI1NiBiaXRzLCB0aGF0IHBhc3NlcyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RtYXRpYyBmYWlsdXJlcy5cbi8vIFBlcmlvZCAyXjI1Ni0xLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3JzaGlmdDcgPSByZXF1aXJlKCcuL2xpYi94b3JzaGlmdDcnKTtcblxuLy8geG9yNDA5NiwgYnkgUmljaGFyZCBCcmVudCwgaXMgYSA0MDk2LWJpdCB4b3Itc2hpZnQgd2l0aCBhXG4vLyB2ZXJ5IGxvbmcgcGVyaW9kIHRoYXQgYWxzbyBhZGRzIGEgV2V5bCBnZW5lcmF0b3IuIEl0IGFsc28gcGFzc2VzXG4vLyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RlbWF0aWMgZmFpbHVyZXMuICBJdHMgbG9uZyBwZXJpb2QgbWF5XG4vLyBiZSB1c2VmdWwgaWYgeW91IGhhdmUgbWFueSBnZW5lcmF0b3JzIGFuZCBuZWVkIHRvIGF2b2lkXG4vLyBjb2xsaXNpb25zLlxuLy8gUGVyaW9kOiAyXjQxMjgtMl4zMi5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yNDA5NiA9IHJlcXVpcmUoJy4vbGliL3hvcjQwOTYnKTtcblxuLy8gVHljaGUtaSwgYnkgU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLCBpcyBhIGJpdC1zaGlmdGluZyByYW5kb21cbi8vIG51bWJlciBnZW5lcmF0b3IgZGVyaXZlZCBmcm9tIENoYUNoYSwgYSBtb2Rlcm4gc3RyZWFtIGNpcGhlci5cbi8vIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG4vLyBQZXJpb2Q6IH4yXjEyN1xuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB0eWNoZWkgPSByZXF1aXJlKCcuL2xpYi90eWNoZWknKTtcblxuLy8gVGhlIG9yaWdpbmFsIEFSQzQtYmFzZWQgcHJuZyBpbmNsdWRlZCBpbiB0aGlzIGxpYnJhcnkuXG4vLyBQZXJpb2Q6IH4yXjE2MDBcbnZhciBzciA9IHJlcXVpcmUoJy4vc2VlZHJhbmRvbScpO1xuXG5zci5hbGVhID0gYWxlYTtcbnNyLnhvcjEyOCA9IHhvcjEyODtcbnNyLnhvcndvdyA9IHhvcndvdztcbnNyLnhvcnNoaWZ0NyA9IHhvcnNoaWZ0NztcbnNyLnhvcjQwOTYgPSB4b3I0MDk2O1xuc3IudHljaGVpID0gdHljaGVpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNyO1xuIiwiaW1wb3J0IEZha2VUaW1lcnMgZnJvbSAnZmFrZS10aW1lcnMnO1xuaW1wb3J0IENhbnZhc0hvb2sgZnJvbSAnLi9jYW52YXNob29rJztcbmltcG9ydCBQZXJmU3RhdHMgZnJvbSAncGVyZm9ybWFuY2Utc3RhdHMnO1xuaW1wb3J0IHNlZWRyYW5kb20gZnJvbSAnc2VlZHJhbmRvbSc7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIHJhbmRvbVNlZWQgPSAxO1xuTWF0aC5yYW5kb20gPSBzZWVkcmFuZG9tKHJhbmRvbVNlZWQpO1xuXG4vLyBUSUNLXG4vLyBIb2xkcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbXNlY3MgdGhhdCB0aGUgcHJldmlvdXNseSByZW5kZXJlZCBmcmFtZSB0b29rLiBVc2VkIHRvIGVzdGltYXRlIHdoZW4gYSBzdHV0dGVyIGV2ZW50IG9jY3VycyAoZmFzdCBmcmFtZSBmb2xsb3dlZCBieSBhIHNsb3cgZnJhbWUpXG52YXIgbGFzdEZyYW1lRHVyYXRpb24gPSAtMTtcblxuLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gdGhlIHByZXZpb3VzIGZyYW1lIGZpbmlzaGVkLlxudmFyIGxhc3RGcmFtZVRpY2sgPSAtMTtcblxudmFyIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgPSAwO1xuXG4vLyBLZWVwcyB0cmFjayBvZiBwZXJmb3JtYW5jZSBzdHV0dGVyIGV2ZW50cy4gQSBzdHV0dGVyIGV2ZW50IG9jY3VycyB3aGVuIHRoZXJlIGlzIGEgaGljY3VwIGluIHN1YnNlcXVlbnQgcGVyLWZyYW1lIHRpbWVzLiAoZmFzdCBmb2xsb3dlZCBieSBzbG93KVxudmFyIG51bVN0dXR0ZXJFdmVudHMgPSAwO1xuXG52YXIgVGVzdGVyQ29uZmlnID0ge1xuICBkb250T3ZlcnJpZGVUaW1lOiBmYWxzZVxufTtcblxuLy8gTWVhc3VyZSBhIFwidGltZSB1bnRpbCBzbW9vdGggZnJhbWUgcmF0ZVwiIHF1YW50aXR5LCBpLmUuIHRoZSB0aW1lIGFmdGVyIHdoaWNoIHdlIGNvbnNpZGVyIHRoZSBzdGFydHVwIEpJVCBhbmQgR0MgZWZmZWN0cyB0byBoYXZlIHNldHRsZWQuXG4vLyBUaGlzIGZpZWxkIHRyYWNrcyBob3cgbWFueSBjb25zZWN1dGl2ZSBmcmFtZXMgaGF2ZSBydW4gc21vb3RobHkuIFRoaXMgdmFyaWFibGUgaXMgc2V0IHRvIC0xIHdoZW4gc21vb3RoIGZyYW1lIHJhdGUgaGFzIGJlZW4gYWNoaWV2ZWQgdG8gZGlzYWJsZSB0cmFja2luZyB0aGlzIGZ1cnRoZXIuXG52YXIgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAwO1xuXG5jb25zdCBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlID0gMTIwOyAvLyBSZXF1aXJlIDEyMCBmcmFtZXMgaS5lLiB+MiBzZWNvbmRzIG9mIGNvbnNlY3V0aXZlIHNtb290aCBzdHV0dGVyIGZyZWUgZnJhbWVzIHRvIGNvbmNsdWRlIHdlIGhhdmUgcmVhY2hlZCBhIHN0YWJsZSBhbmltYXRpb24gcmF0ZS5cblxuQ2FudmFzSG9vay5lbmFibGUoKTtcblxuaWYgKCFUZXN0ZXJDb25maWcuZG9udE92ZXJyaWRlVGltZSlcbntcbiAgRmFrZVRpbWVycy5lbmFibGUoKTtcbn1cblxudmFyIHdlYmdsQ29udGV4dCA9IG51bGw7XG5cblxuXG5cblxuLy8gaWYgKGluamVjdGluZ0lucHV0U3RyZWFtIHx8IHJlY29yZGluZ0lucHV0U3RyZWFtKSB7XG5cbi8vIFRoaXMgaXMgYW4gdW5hdHRlbmRlZCBydW4sIGRvbid0IGFsbG93IHdpbmRvdy5hbGVydCgpcyB0byBpbnRydWRlLlxud2luZG93LmFsZXJ0ID0gZnVuY3Rpb24obXNnKSB7IGNvbnNvbGUuZXJyb3IoJ3dpbmRvdy5hbGVydCgnICsgbXNnICsgJyknKTsgfVxud2luZG93LmNvbmZpcm0gPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmNvbmZpcm0oJyArIG1zZyArICcpJyk7IHJldHVybiB0cnVlOyB9XG5cbmZ1bmN0aW9uIGVtdW5pdHRlc3RSZXBvcnRDdXN0b21CbG9ja0R1cmF0aW9uKCkge1xuICBjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xufVxuXG53aW5kb3cuVEVTVEVSID0ge1xuICAvLyBDdXJyZW50bHkgZXhlY3V0aW5nIGZyYW1lLlxuICByZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI6IDAsXG4gIG51bUZyYW1lc1RvUmVuZGVyOiAxMDAsXG5cbiAgdGljazogZnVuY3Rpb24gKCkge1xuXG4gICAgLS1yZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50O1xuXG4gICAgaWYgKHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPiAwKVxuICAgICAgcmV0dXJuOyAvLyBXZSBhcmUgYmVpbmcgY2FsbGVkIHJlY3Vyc2l2ZWx5LCBzbyBpZ25vcmUgdGhpcyBjYWxsLlxuLyogICAgXG4gIFxuICAgIGlmICghcnVudGltZUluaXRpYWxpemVkKSByZXR1cm47XG4gICAgZW5zdXJlTm9DbGllbnRIYW5kbGVycygpO1xuKi8gIFxuICAgIHZhciB0aW1lTm93ID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG5cbiAgICB2YXIgZnJhbWVEdXJhdGlvbiA9IHRpbWVOb3cgLSBsYXN0RnJhbWVUaWNrO1xuICAgIGxhc3RGcmFtZVRpY2sgPSB0aW1lTm93O1xuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA+IDUgJiYgbGFzdEZyYW1lRHVyYXRpb24gPiAwKSB7XG4gICAgICBpZiAoZnJhbWVEdXJhdGlvbiA+IDIwLjAgJiYgZnJhbWVEdXJhdGlvbiA+IGxhc3RGcmFtZUR1cmF0aW9uICogMS4zNSkge1xuICAgICAgICBudW1TdHV0dGVyRXZlbnRzKys7XG4gICAgICAgIGlmIChudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyAhPSAtMSkgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSB7XG4gICAgICAgICAgbnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMrKztcbiAgICAgICAgICBpZiAobnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgPj0gbnVtRmFzdEZyYW1lc05lZWRlZEZvclNtb290aEZyYW1lUmF0ZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVVbnRpbFNtb290aEZyYW1lcmF0ZScsIHRpbWVOb3cgLSBmaXJzdEZyYW1lVGltZSk7XG4gICAgICAgICAgICBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsYXN0RnJhbWVEdXJhdGlvbiA9IGZyYW1lRHVyYXRpb247XG4vKlxuICAgIGlmIChudW1QcmVsb2FkWEhSc0luRmxpZ2h0ID09IDApIHsgLy8gSW1wb3J0YW50ISBUaGUgZnJhbWUgbnVtYmVyIGFkdmFuY2VzIG9ubHkgZm9yIHRob3NlIGZyYW1lcyB0aGF0IHRoZSBnYW1lIGlzIG5vdCB3YWl0aW5nIGZvciBkYXRhIGZyb20gdGhlIGluaXRpYWwgbmV0d29yayBkb3dubG9hZHMuXG4gICAgICBpZiAobnVtU3RhcnR1cEJsb2NrZXJYSFJzUGVuZGluZyA9PSAwKSArK3RoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyOyAvLyBBY3R1YWwgcmVmdGVzdCBmcmFtZSBjb3VudCBvbmx5IGluY3JlbWVudHMgYWZ0ZXIgZ2FtZSBoYXMgY29uc3VtZWQgYWxsIHRoZSBjcml0aWNhbCBYSFJzIHRoYXQgd2VyZSB0byBiZSBwcmVsb2FkZWQuXG4gICAgICArK2Zha2VkVGltZTsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG4gICAgfVxuKi9cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcisrO1xuICAgIEZha2VUaW1lcnMuZmFrZWRUaW1lKys7IC8vIEJ1dCBnYW1lIHRpbWUgYWR2YW5jZXMgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHByZWxvYWRhYmxlIFhIUnMgYXJlIGZpbmlzaGVkLlxuICBcbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IDEpIHtcbiAgICAgIGZpcnN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgICAgY29uc29sZS5sb2coJ0ZpcnN0IGZyYW1lIHN1Ym1pdHRlZCBhdCAobXMpOicsIGZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgIFRFU1RFUi5kb1JlZmVyZW5jZVRlc3QoKTtcbiAgICB9XG5cbiAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICBwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgfSxcbiAgZG9SZWZlcmVuY2VUZXN0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzID0gQ2FudmFzSG9vay53ZWJnbENvbnRleHQuY2FudmFzO1xuICAgIFxuICAgIC8vIEdyYWIgcmVuZGVyZWQgV2ViR0wgZnJvbnQgYnVmZmVyIGltYWdlIHRvIGEgSlMtc2lkZSBpbWFnZSBvYmplY3QuXG4gICAgdmFyIGFjdHVhbEltYWdlID0gbmV3IEltYWdlKCk7XG5cbiAgICBmdW5jdGlvbiByZWZ0ZXN0ICgpIHtcbiAgICAgIGNvbnN0IGluaXQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFjdHVhbEltYWdlKTtcbiAgICAgIGFjdHVhbEltYWdlLnN0eWxlLmNzc1RleHQ9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7cmlnaHQ6MDt0b3A6MDtib3R0b206MDt6LWluZGV4Ojk5OTkwO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7YmFja2dyb3VuZC1jb2xvcjojOTk5O2ZvbnQtc2l6ZToxMDBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZlwiO1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGluaXQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBhY3R1YWxJbWFnZS5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICAgICAgYWN0dWFsSW1hZ2Uub25sb2FkID0gcmVmdGVzdDtcbiAgICAgIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyArPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBpbml0O1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy9yZWZ0ZXN0KCk7IC8vIGNhbnZhcy50b0RhdGFVUkwoKSBsaWtlbHkgZmFpbGVkLCByZXR1cm4gcmVzdWx0cyBpbW1lZGlhdGVseS5cbiAgICB9XG4gIFxuICB9LFxuXG4gIGluaXRTZXJ2ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VydmVyVXJsID0gJ2h0dHA6Ly8nICsgR0ZYUEVSRlRFU1RfU0VSVkVSX0lQICsgJzo4ODg4JztcblxuICAgIHRoaXMuc29ja2V0ID0gaW8uY29ubmVjdChzZXJ2ZXJVcmwpO1xuICAgIHRoaXMuc3RhdHMgPSBuZXcgUGVyZlN0YXRzKCk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gdGVzdGluZyBzZXJ2ZXInKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9KTtcbiAgICBcbiAgICB0aGlzLnNvY2tldC5vbignY29ubmVjdF9lcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICB9LFxuICBiZW5jaG1hcmtGaW5pc2hlZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aW1lRW5kID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIHZhciB0b3RhbFRpbWUgPSB0aW1lRW5kIC0gcGFnZUluaXRUaW1lOyAvLyBUb3RhbCB0aW1lLCBpbmNsdWRpbmcgZXZlcnl0aGluZy5cblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdUZXN0IGZpbmlzaGVkIScpO1xuICAgIGRpdi5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICBkaXYuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIC8vIGNvbnNvbGUubG9nKCdUaW1lIHNwZW50IGdlbmVyYXRpbmcgcmVmZXJlbmNlIGltYWdlczonLCBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMpO1xuXG4gICAgdmFyIHRvdGFsUmVuZGVyVGltZSA9IHRpbWVFbmQgLSBmaXJzdEZyYW1lVGltZTtcbiAgICB2YXIgY3B1SWRsZSA9IGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKiAxMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICB2YXIgZnBzID0gdGhpcy5udW1GcmFtZXNUb1JlbmRlciAqIDEwMDAuMCAvIHRvdGFsUmVuZGVyVGltZTtcbiAgICBcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHRlc3RfaWQ6IFRFU1RfSUQsXG4gICAgICB2YWx1ZXM6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IGZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgbG9nczogdGhpcy5sb2dzLFxuICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICBudW1TdHV0dGVyRXZlbnRzOiBudW1TdHV0dGVyRXZlbnRzLFxuICAgICAgcmVzdWx0OiAnUEFTUycsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgY3B1VGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVJbk1haW5Mb29wLFxuICAgICAgY3B1SWRsZVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wLFxuICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgcGFnZUxvYWRUaW1lOiBwYWdlTG9hZFRpbWUsXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19maW5pc2gnLCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZygnRmluaXNoZWQhJywgZGF0YSk7XG4gICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICB9LFxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy9pZiAoVGVzdGVyQ29uZmlnLnNlbmRMb2cpXG4gICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbml0U2VydmVyKCk7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdGVyX2luaXQnLCAoKSA9PiB7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZ3MgPSB7XG4gICAgICBlcnJvcnM6IFtdLFxuICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgY2F0Y2hFcnJvcnM6IFtdXG4gICAgfTtcbiAgICB0aGlzLndyYXBFcnJvcnMoKTtcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19zdGFydGVkJywge2lkOiBURVNUX0lEfSk7XG5cbiAgICB0aGlzLnNvY2tldC5vbignbmV4dF9iZW5jaG1hcmsnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoJ2h0dHA6Ly90aHJlZWpzLm9yZycpO1xuICAgICAgY29uc29sZS5sb2coJ25leHRfYmVuY2htYXJrJywgZGF0YSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShkYXRhLnVybCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9IDA7XG4gIH0sXG59O1xuXG52YXIgZmlyc3RGcmFtZVRpbWUgPSBudWxsO1xuXG5URVNURVIuaW5pdCgpO1xuXG5UZXN0ZXJDb25maWcucHJlTWFpbkxvb3AgPSAoKSA9PiB7IFRFU1RFUi5zdGF0cy5mcmFtZVN0YXJ0KCk7IH07XG5UZXN0ZXJDb25maWcucG9zdE1haW5Mb29wID0gKCkgPT4ge1RFU1RFUi5zdGF0cy5mcmFtZUVuZCgpOyB9O1xuXG5pZiAoIVRlc3RlckNvbmZpZy5wcm92aWRlc1JhZkludGVncmF0aW9uKSB7XG4gIGlmICghd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHtcbiAgICB3aW5kb3cucmVhbFJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGNhbGxiYWNrID0+IHtcbiAgICAgIGNvbnN0IGhvb2tlZENhbGxiYWNrID0gcCA9PiB7XG4gICAgICAgIGlmIChUZXN0ZXJDb25maWcucHJlTWFpbkxvb3ApIHsgVGVzdGVyQ29uZmlnLnByZU1haW5Mb29wKCk7IH1cbiAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5yZWZlcmVuY2VUZXN0UHJlVGljaykgeyBUZXN0ZXJDb25maWcucmVmZXJlbmNlVGVzdFByZVRpY2soKTsgfVxuICBcbiAgICAgICAgaWYgKFRFU1RFUi5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPT09IFRFU1RFUi5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgICAgIFRFU1RFUi5iZW5jaG1hcmtGaW5pc2hlZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICBcbiAgICAgICAgY2FsbGJhY2socGVyZm9ybWFuY2Uubm93KCkpO1xuICAgICAgICBURVNURVIudGljaygpO1xuICBcbiAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5yZWZlcmVuY2VUZXN0VGljaykgeyBUZXN0ZXJDb25maWcucmVmZXJlbmNlVGVzdFRpY2soKTsgfVxuICAgICAgICBpZiAoVGVzdGVyQ29uZmlnLnBvc3RNYWluTG9vcCkgeyBUZXN0ZXJDb25maWcucG9zdE1haW5Mb29wKCk7IH1cbiAgXG4gICAgICB9XG4gICAgICByZXR1cm4gd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaG9va2VkQ2FsbGJhY2spO1xuICAgIH1cbiAgfVxufVxuXG5cbi8vIEd1YXJkIGFnYWluc3QgcmVjdXJzaXZlIGNhbGxzIHRvIHJlZmVyZW5jZVRlc3RQcmVUaWNrK3JlZmVyZW5jZVRlc3RUaWNrIGZyb20gbXVsdGlwbGUgckFGcy5cbnZhciByZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50ID0gMDtcblxuLy8gV2FsbGNsb2NrIHRpbWUgZm9yIHdoZW4gd2Ugc3RhcnRlZCBDUFUgZXhlY3V0aW9uIG9mIHRoZSBjdXJyZW50IGZyYW1lLlxudmFyIHJlZmVyZW5jZVRlc3RUMCA9IC0xO1xuXG5mdW5jdGlvbiByZWZlcmVuY2VUZXN0UHJlVGljaygpIHtcbiAgKytyZWZlcmVuY2VUZXN0UHJlVGlja0NhbGxlZENvdW50O1xuICBpZiAocmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA9PSAxKSB7XG4gICAgcmVmZXJlbmNlVGVzdFQwID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuICAgIGlmIChwYWdlTG9hZFRpbWUgPT09IG51bGwpIHBhZ2VMb2FkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHBhZ2VJbml0VGltZTtcblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIGlmIChwcmV2aW91c0V2ZW50SGFuZGxlckV4aXRlZFRpbWUgIT0gLTEpIHtcbiAgICAgIGFjY3VtdWxhdGVkQ3B1SWRsZVRpbWUgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lO1xuICAgICAgcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gLTE7XG4gICAgfVxuICB9XG59XG5UZXN0ZXJDb25maWcucmVmZXJlbmNlVGVzdFByZVRpY2sgPSByZWZlcmVuY2VUZXN0UHJlVGljaztcblxuLy8gSWYgLTEsIHdlIGFyZSBub3QgcnVubmluZyBhbiBldmVudC4gT3RoZXJ3aXNlIHJlcHJlc2VudHMgdGhlIHdhbGxjbG9jayB0aW1lIG9mIHdoZW4gd2UgZXhpdGVkIHRoZSBsYXN0IGV2ZW50IGhhbmRsZXIuXG52YXIgcHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lID0gLTE7XG5cbnZhciBwYWdlSW5pdFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbi8vIFdhbGxjbG9jayB0aW1lIGRlbm90aW5nIHdoZW4gdGhlIHBhZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuXG52YXIgcGFnZUxvYWRUaW1lID0gbnVsbDsiXSwibmFtZXMiOlsiU3RhdHMiLCJ0aGlzIiwiZGVmaW5lIiwicmVxdWlyZSQkMCIsInNyIiwic2VlZHJhbmRvbSIsIlBlcmZTdGF0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Q0FBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUM7O0NBRXRCLE1BQU0sUUFBUSxDQUFDO0NBQ2YsRUFBRSxXQUFX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ckUsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztDQUMzQixRQUFRLGNBQWMsR0FBRyxPQUFPLENBQUM7O0NBRWpDLFFBQVEsSUFBSSxRQUFRO0NBQ3BCLFFBQVE7Q0FDUixVQUFVLFFBQVEsR0FBRyxLQUFLLENBQUM7Q0FDM0IsVUFBVSxPQUFPO0NBQ2pCLFNBQVM7O0NBRVQsUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0NBRW5DLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO0NBQ3RCLFVBQVUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDN00sVUFBVSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFL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QU0sQ0FBQyxJQUFJLEVBQUU7R0FDcEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDOzs7R0FHZCxFQUFFLENBQUMsSUFBSSxHQUFHLFdBQVc7S0FDbkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDUixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztLQUU3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksQ0FBQyxDQUFDOztLQUVoQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztLQUN0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztLQUMzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNiLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZCxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7S0FFZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0tBRVQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7O0dBRUYsU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRTtLQUN0QixJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsR0FBRyxDQUFDO0tBQ3ZDLElBQUksSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTs7T0FFdkIsQ0FBQyxHQUFHLElBQUksQ0FBQztPQUNULElBQUksR0FBRyxJQUFJLENBQUM7TUFDYixNQUFNOztPQUVMLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO09BQ25CLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDTixLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO01BQ3RDOztLQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTs7T0FFbkMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7T0FFdkQsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDbkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDYixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ1osQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7U0FDVixDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQztTQUN6QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFCO01BQ0Y7O0tBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO09BQ1osQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQzFDOzs7O0tBSUQsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNSLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRTtPQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQztPQUN0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztPQUMzQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNiLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO09BQ2IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDZCxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztPQUNkLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ2Q7O0tBRUQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1Y7O0dBRUQsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNoQjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNsQixPQUFPLENB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
