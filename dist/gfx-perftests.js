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

	// import io from 'socket.io-client';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Z4LXBlcmZ0ZXN0cy5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL2Zha2UtdGltZXJzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NhbnZhcy1ob29rL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2luY3JlbWVudGFsLXN0YXRzLWxpdGUvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utc3RhdHMvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIvYWxlYS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3IxMjguanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9saWIveG9yd293LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3hvcnNoaWZ0Ny5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL2xpYi94b3I0MDk2LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3NlZWRyYW5kb20vbGliL3R5Y2hlaS5qcyIsIi4uL25vZGVfbW9kdWxlcy9zZWVkcmFuZG9tL3NlZWRyYW5kb20uanMiLCIuLi9ub2RlX21vZHVsZXMvc2VlZHJhbmRvbS9pbmRleC5qcyIsIi4uL3NyYy9jbGllbnQvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUmVhbERhdGUgPSBEYXRlO1xuXG5jbGFzcyBNb2NrRGF0ZSB7XG4gIGNvbnN0cnVjdG9yKHQpIHtcbiAgICB0aGlzLnQgPSB0O1xuICB9XG5cbiAgc3RhdGljIG5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBzdGF0aWMgcmVhbE5vdygpIHtcbiAgICByZXR1cm4gUmVhbERhdGUubm93KCk7XG4gIH1cblxuICBnZXRUaW1lem9uZU9mZnNldCgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHRvVGltZVN0cmluZygpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXREYXRlKCkgeyByZXR1cm4gMDsgfVxuICBnZXREYXkoKSB7IHJldHVybiAwOyB9XG4gIGdldEZ1bGxZZWFyKCkgeyByZXR1cm4gMDsgfVxuICBnZXRIb3VycygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWlsbGlzZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRNb250aCgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0TWludXRlcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0U2Vjb25kcygpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VGltZSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0WWVhcigpIHsgcmV0dXJuIDA7IH1cblxuICBzdGF0aWMgVVRDKCkgeyByZXR1cm4gMDsgfVxuXG4gIGdldFVUQ0RhdGUoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0RheSgpIHsgcmV0dXJuIDA7IH1cbiAgZ2V0VVRDRnVsbFllYXIoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ0hvdXJzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaWxsaXNlY29uZHMoKSB7IHJldHVybiAwOyB9XG4gIGdldFVUQ01vbnRoKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENNaW51dGVzKCkgeyByZXR1cm4gMDsgfVxuICBnZXRVVENTZWNvbmRzKCkgeyByZXR1cm4gMDsgfVxuXG4gIHNldERhdGUoKSB7fVxuICBzZXRGdWxsWWVhcigpIHt9XG4gIHNldEhvdXJzKCkge31cbiAgc2V0TWlsbGlzZWNvbmRzKCkge31cbiAgc2V0TWludXRlcygpIHt9XG4gIHNldE1vbnRoKCkge31cbiAgc2V0U2Vjb25kcygpIHt9XG4gIHNldFRpbWUoKSB7fVxuXG4gIHNldFVUQ0RhdGUoKSB7fVxuICBzZXRVVENGdWxsWWVhcigpIHt9XG4gIHNldFVUQ0hvdXJzKCkge31cbiAgc2V0VVRDTWlsbGlzZWNvbmRzKCkge31cbiAgc2V0VVRDTWludXRlcygpIHt9XG4gIHNldFVUQ01vbnRoKCkge31cblxuICBzZXRZZWFyKCkge31cbn1cblxudmFyIHJlYWxQZXJmb3JtYW5jZTtcblxuaWYgKCFwZXJmb3JtYW5jZS5yZWFsTm93KSB7XG4gIHZhciBpc1NhZmFyaSA9IC9eKCg/IWNocm9tZXxhbmRyb2lkKS4pKnNhZmFyaS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc1NhZmFyaSkge1xuICAgIHJlYWxQZXJmb3JtYW5jZSA9IHBlcmZvcm1hbmNlO1xuICAgIHBlcmZvcm1hbmNlID0ge1xuICAgICAgcmVhbE5vdzogZnVuY3Rpb24oKSB7IHJldHVybiByZWFsUGVyZm9ybWFuY2Uubm93KCk7IH0sXG4gICAgICBub3c6IGZ1bmN0aW9uKCkgeyByZXR1cm4gcmVhbFBlcmZvcm1hbmNlLm5vdygpOyB9XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtYW5jZS5yZWFsTm93ID0gcGVyZm9ybWFuY2Uubm93O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGltZVNjYWxlOiAxLjAsXG4gIGZha2VkVGltZTogMCxcbiAgZW5hYmxlZDogZmFsc2UsXG4gIG5lZWRzRmFrZU1vbm90b25vdXNseUluY3JlYXNpbmdUaW1lcjogZmFsc2UsXG4gIHNldEZha2VkVGltZTogZnVuY3Rpb24oIG5ld0Zha2VkVGltZSApIHtcbiAgICB0aGlzLmZha2VkVGltZSA9IG5ld0Zha2VkVGltZTtcbiAgfSxcbiAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgRGF0ZSA9IE1vY2tEYXRlO1xuICAgIFxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5uZWVkc0Zha2VNb25vdG9ub3VzbHlJbmNyZWFzaW5nVGltZXIpIHtcbiAgICAgIERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHNlbGYuZmFrZWRUaW1lICs9IHNlbGYudGltZVNjYWxlOyByZXR1cm4gc2VsZi5mYWtlZFRpbWU7IH1cbiAgICAgIHBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uKCkgeyBzZWxmLmZha2VkVGltZSArPSBzZWxmLnRpbWVTY2FsZTsgcmV0dXJuIHNlbGYuZmFrZWRUaW1lOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmZha2VkVGltZSAqIDEwMDAuMCAqIHNlbGYudGltZVNjYWxlIC8gNjAuMDsgfVxuICAgICAgcGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBzZWxmLmZha2VkVGltZSAqIDEwMDAuMCAqIHNlbGYudGltZVNjYWxlIC8gNjAuMDsgfVxuICAgIH1cbiAgXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgfSxcbiAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5lbmFibGVkKSB7IHJldHVybjsgfTtcbiAgICBcbiAgICBEYXRlID0gUmVhbERhdGU7ICAgIFxuICAgIHBlcmZvcm1hbmNlLm5vdyA9IHJlYWxQZXJmb3JtYW5jZS5ub3c7XG4gICAgXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2U7ICAgIFxuICB9XG59IiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBIb29rIGNhbnZhcy5nZXRDb250ZXh0XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnZhciBvcmlnaW5hbEdldENvbnRleHQgPSBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dDtcbmlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLmdldENvbnRleHRSYXcpIHtcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dFJhdyA9IG9yaWdpbmFsR2V0Q29udGV4dDtcbn1cblxudmFyIGVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICB3ZWJnbENvbnRleHQ6IG51bGwsXG4gIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbmFibGVkKSB7cmV0dXJuO31cblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBIVE1MQ2FudmFzRWxlbWVudC5wcm90b3R5cGUuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN0eCA9IG9yaWdpbmFsR2V0Q29udGV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChjdHggaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHx8ICh3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAmJiAoY3R4IGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkpKSB7XG4gICAgICAgIHNlbGYud2ViZ2xDb250ZXh0ID0gY3R4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0eDsgICAgXG4gICAgfVxuICAgIGVuYWJsZWQgPSB0cnVlO1xuICB9LFxuXG4gIGRpc2FibGU6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHtyZXR1cm47fVxuICAgIEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZS5nZXRDb250ZXh0ID0gb3JpZ2luYWxHZXRDb250ZXh0O1xuICAgIGVuYWJsZWQgPSBmYWxzZTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGVyZlN0YXRzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5uID0gMDtcbiAgICB0aGlzLm1pbiA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgdGhpcy5tYXggPSAtTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB0aGlzLnN1bSA9IDA7XG4gICAgdGhpcy5tZWFuID0gMDtcbiAgICB0aGlzLnEgPSAwO1xuICB9XG5cbiAgZ2V0IHZhcmlhbmNlKCkge1xuICAgIHJldHVybiB0aGlzLnEgLyB0aGlzLm47XG4gIH1cblxuICBnZXQgc3RhbmRhcmRfZGV2aWF0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodGhpcy5xIC8gdGhpcy5uKTtcbiAgfVxuXG4gIHVwZGF0ZSh2YWx1ZSkge1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtKSkge1xuICAgICAgLy8gU29ycnksIG5vIE5hTnNcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5uKys7XG4gICAgdGhpcy5taW4gPSBNYXRoLm1pbih0aGlzLm1pbiwgbnVtKTtcbiAgICB0aGlzLm1heCA9IE1hdGgubWF4KHRoaXMubWF4LCBudW0pO1xuICAgIHRoaXMuc3VtICs9IG51bTtcbiAgICBjb25zdCBwcmV2TWVhbiA9IHRoaXMubWVhbjtcbiAgICB0aGlzLm1lYW4gPSB0aGlzLm1lYW4gKyAobnVtIC0gdGhpcy5tZWFuKSAvIHRoaXMubjtcbiAgICB0aGlzLnEgPSB0aGlzLnEgKyAobnVtIC0gcHJldk1lYW4pICogKG51bSAtIHRoaXMubWVhbik7XG4gIH1cblxuICBnZXRBbGwoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG46IHRoaXMubixcbiAgICAgIG1pbjogdGhpcy5taW4sXG4gICAgICBtYXg6IHRoaXMubWF4LFxuICAgICAgc3VtOiB0aGlzLnN1bSxcbiAgICAgIG1lYW46IHRoaXMubWVhbixcbiAgICAgIHZhcmlhbmNlOiB0aGlzLnZhcmlhbmNlLFxuICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YW5kYXJkX2RldmlhdGlvblxuICAgIH07XG4gIH0gIFxufVxuIiwiaW1wb3J0IFN0YXRzIGZyb20gJ2luY3JlbWVudGFsLXN0YXRzLWxpdGUnO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFRFU1RTVEFUU1xuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGZpcnN0RnJhbWUgPSB0cnVlO1xuICB2YXIgZmlyc3RGcHMgPSB0cnVlO1xuXG4gIHZhciBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSAwO1xuICB2YXIgcHJldmlvdXNGcmFtZUVuZFRpbWU7XG4gIHZhciBsYXN0VXBkYXRlVGltZSA9IG51bGw7XG5cbiAgLy8gVXNlZCB0byBkZXRlY3QgcmVjdXJzaXZlIGVudHJpZXMgdG8gdGhlIG1haW4gbG9vcCwgd2hpY2ggY2FuIGhhcHBlbiBpbiBjZXJ0YWluIGNvbXBsZXggY2FzZXMsIGUuZy4gaWYgbm90IHVzaW5nIHJBRiB0byB0aWNrIHJlbmRlcmluZyB0byB0aGUgY2FudmFzLlxuICB2YXIgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyID0gMDtcblxuICByZXR1cm4ge1xuICAgIGdldFN0YXRzU3VtbWFyeTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgT2JqZWN0LmtleXModGhpcy5zdGF0cykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICByZXN1bHRba2V5XSA9IHtcbiAgICAgICAgICBtaW46IHRoaXMuc3RhdHNba2V5XS5taW4sXG4gICAgICAgICAgbWF4OiB0aGlzLnN0YXRzW2tleV0ubWF4LFxuICAgICAgICAgIGF2ZzogdGhpcy5zdGF0c1trZXldLm1lYW4sXG4gICAgICAgICAgc3RhbmRhcmRfZGV2aWF0aW9uOiB0aGlzLnN0YXRzW2tleV0uc3RhbmRhcmRfZGV2aWF0aW9uXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgc3RhdHM6IHtcbiAgICAgIGZwczogbmV3IFN0YXRzKCksXG4gICAgICBkdDogbmV3IFN0YXRzKCksXG4gICAgICBjcHU6IG5ldyBTdGF0cygpICAgICAgICBcbiAgICB9LFxuXG4gICAgbnVtRnJhbWVzOiAwLFxuICAgIGxvZzogZmFsc2UsXG4gICAgdG90YWxUaW1lSW5NYWluTG9vcDogMCxcbiAgICB0b3RhbFRpbWVPdXRzaWRlTWFpbkxvb3A6IDAsXG4gICAgZnBzQ291bnRlclVwZGF0ZUludGVydmFsOiAyMDAsIC8vIG1zZWNzXG5cbiAgICBmcmFtZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlcisrO1xuICAgICAgaWYgKGluc2lkZU1haW5Mb29wUmVjdXJzaW9uQ291bnRlciA9PSAxKSBcbiAgICAgIHtcbiAgICAgICAgaWYgKGxhc3RVcGRhdGVUaW1lID09PSBudWxsKSB7XG4gICAgICAgICAgbGFzdFVwZGF0ZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50RnJhbWVTdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHMoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgdXBkYXRlU3RhdHM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cbiAgICAgIHRoaXMubnVtRnJhbWVzKys7XG5cbiAgICAgIGlmICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUgPiB0aGlzLmZwc0NvdW50ZXJVcGRhdGVJbnRlcnZhbClcbiAgICAgIHtcbiAgICAgICAgdmFyIGZwcyA9IHRoaXMubnVtRnJhbWVzICogMTAwMCAvICh0aW1lTm93IC0gbGFzdFVwZGF0ZVRpbWUpO1xuICAgICAgICB0aGlzLm51bUZyYW1lcyA9IDA7XG4gICAgICAgIGxhc3RVcGRhdGVUaW1lID0gdGltZU5vdztcblxuICAgICAgICBpZiAoZmlyc3RGcHMpXG4gICAgICAgIHtcbiAgICAgICAgICBmaXJzdEZwcyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdHMuZnBzLnVwZGF0ZShmcHMpO1xuXG4gICAgICAgIGlmICh0aGlzLmxvZykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBmcHMgLSBtaW46ICR7dGhpcy5zdGF0cy5mcHMubWluLnRvRml4ZWQoMil9IC8gYXZnOiAke3RoaXMuc3RhdHMuZnBzLm1lYW4udG9GaXhlZCgyKX0gLyBtYXg6ICR7dGhpcy5zdGF0cy5mcHMubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZnBzLnN0YW5kYXJkX2RldmlhdGlvbi50b0ZpeGVkKDIpfWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBtcyAgLSBtaW46ICR7dGhpcy5zdGF0cy5kdC5taW4udG9GaXhlZCgyKX0gLyBhdmc6ICR7dGhpcy5zdGF0cy5kdC5tZWFuLnRvRml4ZWQoMil9IC8gbWF4OiAke3RoaXMuc3RhdHMuZHQubWF4LnRvRml4ZWQoMil9IC0gc3RkOiAke3RoaXMuc3RhdHMuZHQuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9YCk7XG4gICAgICAgICAgY29uc29sZS5sb2coYGNwdSAtIG1pbjogJHt0aGlzLnN0YXRzLmNwdS5taW4udG9GaXhlZCgyKX0lIC8gYXZnOiAke3RoaXMuc3RhdHMuY3B1Lm1lYW4udG9GaXhlZCgyKX0lIC8gbWF4OiAke3RoaXMuc3RhdHMuY3B1Lm1heC50b0ZpeGVkKDIpfSUgLSBzdGQ6ICR7dGhpcy5zdGF0cy5jcHUuc3RhbmRhcmRfZGV2aWF0aW9uLnRvRml4ZWQoMil9JWApO1xuICAgICAgICAgIGNvbnNvbGUubG9nKCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKTsgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8vIENhbGxlZCBpbiB0aGUgZW5kIG9mIGVhY2ggbWFpbiBsb29wIGZyYW1lIHRpY2suXG4gICAgZnJhbWVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyLS07XG4gICAgICBpZiAoaW5zaWRlTWFpbkxvb3BSZWN1cnNpb25Db3VudGVyICE9IDApIHJldHVybjtcblxuICAgICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICB2YXIgY3B1TWFpbkxvb3BEdXJhdGlvbiA9IHRpbWVOb3cgLSBjdXJyZW50RnJhbWVTdGFydFRpbWU7XG4gICAgICB2YXIgZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzID0gdGltZU5vdyAtIHByZXZpb3VzRnJhbWVFbmRUaW1lO1xuICAgICAgcHJldmlvdXNGcmFtZUVuZFRpbWUgPSB0aW1lTm93O1xuICBcbiAgICAgIGlmIChmaXJzdEZyYW1lKSB7XG4gICAgICAgIGZpcnN0RnJhbWUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnRvdGFsVGltZUluTWFpbkxvb3AgKz0gY3B1TWFpbkxvb3BEdXJhdGlvbjtcbiAgICAgIHRoaXMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICs9IGR1cmF0aW9uQmV0d2VlbkZyYW1lVXBkYXRlcyAtIGNwdU1haW5Mb29wRHVyYXRpb247XG5cbiAgICAgIHZhciBjcHUgPSBjcHVNYWluTG9vcER1cmF0aW9uICogMTAwIC8gZHVyYXRpb25CZXR3ZWVuRnJhbWVVcGRhdGVzO1xuICAgICAgdGhpcy5zdGF0cy5jcHUudXBkYXRlKGNwdSk7XG4gICAgICB0aGlzLnN0YXRzLmR0LnVwZGF0ZShkdXJhdGlvbkJldHdlZW5GcmFtZVVwZGF0ZXMpO1xuICAgIH1cbiAgfVxufTsiLCIvLyBBIHBvcnQgb2YgYW4gYWxnb3JpdGhtIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2UuY29tPiwgMjAxMFxuLy8gaHR0cDovL2JhYWdvZS5jb20vZW4vUmFuZG9tTXVzaW5ncy9qYXZhc2NyaXB0L1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25xdWlubGFuL2JldHRlci1yYW5kb20tbnVtYmVycy1mb3ItamF2YXNjcmlwdC1taXJyb3Jcbi8vIE9yaWdpbmFsIHdvcmsgaXMgdW5kZXIgTUlUIGxpY2Vuc2UgLVxuXG4vLyBDb3B5cmlnaHQgKEMpIDIwMTAgYnkgSm9oYW5uZXMgQmFhZ8O4ZSA8YmFhZ29lQGJhYWdvZS5vcmc+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy8gXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vLyBcbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5cblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gQWxlYShzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIG1hc2ggPSBNYXNoKCk7XG5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0ID0gMjA5MTYzOSAqIG1lLnMwICsgbWUuYyAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gICAgbWUuczAgPSBtZS5zMTtcbiAgICBtZS5zMSA9IG1lLnMyO1xuICAgIHJldHVybiBtZS5zMiA9IHQgLSAobWUuYyA9IHQgfCAwKTtcbiAgfTtcblxuICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gIG1lLmMgPSAxO1xuICBtZS5zMCA9IG1hc2goJyAnKTtcbiAgbWUuczEgPSBtYXNoKCcgJyk7XG4gIG1lLnMyID0gbWFzaCgnICcpO1xuICBtZS5zMCAtPSBtYXNoKHNlZWQpO1xuICBpZiAobWUuczAgPCAwKSB7IG1lLnMwICs9IDE7IH1cbiAgbWUuczEgLT0gbWFzaChzZWVkKTtcbiAgaWYgKG1lLnMxIDwgMCkgeyBtZS5zMSArPSAxOyB9XG4gIG1lLnMyIC09IG1hc2goc2VlZCk7XG4gIGlmIChtZS5zMiA8IDApIHsgbWUuczIgKz0gMTsgfVxuICBtYXNoID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYyA9IGYuYztcbiAgdC5zMCA9IGYuczA7XG4gIHQuczEgPSBmLnMxO1xuICB0LnMyID0gZi5zMjtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICB2YXIgeGcgPSBuZXcgQWxlYShzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IHhnLm5leHQ7XG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgKiAweDEwMDAwMDAwMCkgfCAwOyB9XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBybmcoKSArIChwcm5nKCkgKiAweDIwMDAwMCB8IDApICogMS4xMTAyMjMwMjQ2MjUxNTY1ZS0xNjsgLy8gMl4tNTNcbiAgfTtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmICh0eXBlb2Yoc3RhdGUpID09ICdvYmplY3QnKSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmZ1bmN0aW9uIE1hc2goKSB7XG4gIHZhciBuID0gMHhlZmM4MjQ5ZDtcblxuICB2YXIgbWFzaCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgbiArPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB2YXIgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHJldHVybiAobiA+Pj4gMCkgKiAyLjMyODMwNjQzNjUzODY5NjNlLTEwOyAvLyAyXi0zMlxuICB9O1xuXG4gIHJldHVybiBtYXNoO1xufVxuXG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMuYWxlYSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgdGhlIFwieG9yMTI4XCIgcHJuZyBhbGdvcml0aG0gYnlcbi8vIEdlb3JnZSBNYXJzYWdsaWEuICBTZWUgaHR0cDovL3d3dy5qc3RhdHNvZnQub3JnL3YwOC9pMTQvcGFwZXJcblxuKGZ1bmN0aW9uKGdsb2JhbCwgbW9kdWxlLCBkZWZpbmUpIHtcblxuZnVuY3Rpb24gWG9yR2VuKHNlZWQpIHtcbiAgdmFyIG1lID0gdGhpcywgc3Ryc2VlZCA9ICcnO1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuXG4gIC8vIFNldCB1cCBnZW5lcmF0b3IgZnVuY3Rpb24uXG4gIG1lLm5leHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdCA9IG1lLnggXiAobWUueCA8PCAxMSk7XG4gICAgbWUueCA9IG1lLnk7XG4gICAgbWUueSA9IG1lLno7XG4gICAgbWUueiA9IG1lLnc7XG4gICAgcmV0dXJuIG1lLncgXj0gKG1lLncgPj4+IDE5KSBeIHQgXiAodCA+Pj4gOCk7XG4gIH07XG5cbiAgaWYgKHNlZWQgPT09IChzZWVkIHwgMCkpIHtcbiAgICAvLyBJbnRlZ2VyIHNlZWQuXG4gICAgbWUueCA9IHNlZWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8gU3RyaW5nIHNlZWQuXG4gICAgc3Ryc2VlZCArPSBzZWVkO1xuICB9XG5cbiAgLy8gTWl4IGluIHN0cmluZyBzZWVkLCB0aGVuIGRpc2NhcmQgYW4gaW5pdGlhbCBiYXRjaCBvZiA2NCB2YWx1ZXMuXG4gIGZvciAodmFyIGsgPSAwOyBrIDwgc3Ryc2VlZC5sZW5ndGggKyA2NDsgaysrKSB7XG4gICAgbWUueCBePSBzdHJzZWVkLmNoYXJDb2RlQXQoaykgfCAwO1xuICAgIG1lLm5leHQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC54ID0gZi54O1xuICB0LnkgPSBmLnk7XG4gIHQueiA9IGYuejtcbiAgdC53ID0gZi53O1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3IxMjggPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcndvd1wiIHBybmcgYWxnb3JpdGhtIGJ5XG4vLyBHZW9yZ2UgTWFyc2FnbGlhLiAgU2VlIGh0dHA6Ly93d3cuanN0YXRzb2Z0Lm9yZy92MDgvaTE0L3BhcGVyXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHQgPSAobWUueCBeIChtZS54ID4+PiAyKSk7XG4gICAgbWUueCA9IG1lLnk7IG1lLnkgPSBtZS56OyBtZS56ID0gbWUudzsgbWUudyA9IG1lLnY7XG4gICAgcmV0dXJuIChtZS5kID0gKG1lLmQgKyAzNjI0MzcgfCAwKSkgK1xuICAgICAgIChtZS52ID0gKG1lLnYgXiAobWUudiA8PCA0KSkgXiAodCBeICh0IDw8IDEpKSkgfCAwO1xuICB9O1xuXG4gIG1lLnggPSAwO1xuICBtZS55ID0gMDtcbiAgbWUueiA9IDA7XG4gIG1lLncgPSAwO1xuICBtZS52ID0gMDtcblxuICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgIC8vIEludGVnZXIgc2VlZC5cbiAgICBtZS54ID0gc2VlZDtcbiAgfSBlbHNlIHtcbiAgICAvLyBTdHJpbmcgc2VlZC5cbiAgICBzdHJzZWVkICs9IHNlZWQ7XG4gIH1cblxuICAvLyBNaXggaW4gc3RyaW5nIHNlZWQsIHRoZW4gZGlzY2FyZCBhbiBpbml0aWFsIGJhdGNoIG9mIDY0IHZhbHVlcy5cbiAgZm9yICh2YXIgayA9IDA7IGsgPCBzdHJzZWVkLmxlbmd0aCArIDY0OyBrKyspIHtcbiAgICBtZS54IF49IHN0cnNlZWQuY2hhckNvZGVBdChrKSB8IDA7XG4gICAgaWYgKGsgPT0gc3Ryc2VlZC5sZW5ndGgpIHtcbiAgICAgIG1lLmQgPSBtZS54IDw8IDEwIF4gbWUueCA+Pj4gNDtcbiAgICB9XG4gICAgbWUubmV4dCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvcHkoZiwgdCkge1xuICB0LnggPSBmLng7XG4gIHQueSA9IGYueTtcbiAgdC56ID0gZi56O1xuICB0LncgPSBmLnc7XG4gIHQudiA9IGYudjtcbiAgdC5kID0gZi5kO1xuICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gaW1wbChzZWVkLCBvcHRzKSB7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHR5cGVvZihzdGF0ZSkgPT0gJ29iamVjdCcpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3J3b3cgPSBpbXBsO1xufVxuXG59KShcbiAgdGhpcyxcbiAgKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZSwgICAgLy8gcHJlc2VudCBpbiBub2RlLmpzXG4gICh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZSAgIC8vIHByZXNlbnQgd2l0aCBhbiBBTUQgbG9hZGVyXG4pO1xuXG5cbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcInhvcnNoaWZ0N1wiIGFsZ29yaXRobSBieVxuLy8gRnJhbsOnb2lzIFBhbm5ldG9uIGFuZCBQaWVycmUgTCdlY3V5ZXI6XG4vLyBcIk9uIHRoZSBYb3Jnc2hpZnQgUmFuZG9tIE51bWJlciBHZW5lcmF0b3JzXCJcbi8vIGh0dHA6Ly9zYWx1Yy5lbmdyLnVjb25uLmVkdS9yZWZzL2NyeXB0by9ybmcvcGFubmV0b24wNW9udGhleG9yc2hpZnQucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHZhciBYID0gbWUueCwgaSA9IG1lLmksIHQsIHYsIHc7XG4gICAgdCA9IFhbaV07IHQgXj0gKHQgPj4+IDcpOyB2ID0gdCBeICh0IDw8IDI0KTtcbiAgICB0ID0gWFsoaSArIDEpICYgN107IHYgXj0gdCBeICh0ID4+PiAxMCk7XG4gICAgdCA9IFhbKGkgKyAzKSAmIDddOyB2IF49IHQgXiAodCA+Pj4gMyk7XG4gICAgdCA9IFhbKGkgKyA0KSAmIDddOyB2IF49IHQgXiAodCA8PCA3KTtcbiAgICB0ID0gWFsoaSArIDcpICYgN107IHQgPSB0IF4gKHQgPDwgMTMpOyB2IF49IHQgXiAodCA8PCA5KTtcbiAgICBYW2ldID0gdjtcbiAgICBtZS5pID0gKGkgKyAxKSAmIDc7XG4gICAgcmV0dXJuIHY7XG4gIH07XG5cbiAgZnVuY3Rpb24gaW5pdChtZSwgc2VlZCkge1xuICAgIHZhciBqLCB3LCBYID0gW107XG5cbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gU2VlZCBzdGF0ZSBhcnJheSB1c2luZyBhIDMyLWJpdCBpbnRlZ2VyLlxuICAgICAgdyA9IFhbMF0gPSBzZWVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTZWVkIHN0YXRlIHVzaW5nIGEgc3RyaW5nLlxuICAgICAgc2VlZCA9ICcnICsgc2VlZDtcbiAgICAgIGZvciAoaiA9IDA7IGogPCBzZWVkLmxlbmd0aDsgKytqKSB7XG4gICAgICAgIFhbaiAmIDddID0gKFhbaiAmIDddIDw8IDE1KSBeXG4gICAgICAgICAgICAoc2VlZC5jaGFyQ29kZUF0KGopICsgWFsoaiArIDEpICYgN10gPDwgMTMpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBFbmZvcmNlIGFuIGFycmF5IGxlbmd0aCBvZiA4LCBub3QgYWxsIHplcm9lcy5cbiAgICB3aGlsZSAoWC5sZW5ndGggPCA4KSBYLnB1c2goMCk7XG4gICAgZm9yIChqID0gMDsgaiA8IDggJiYgWFtqXSA9PT0gMDsgKytqKTtcbiAgICBpZiAoaiA9PSA4KSB3ID0gWFs3XSA9IC0xOyBlbHNlIHcgPSBYW2pdO1xuXG4gICAgbWUueCA9IFg7XG4gICAgbWUuaSA9IDA7XG5cbiAgICAvLyBEaXNjYXJkIGFuIGluaXRpYWwgMjU2IHZhbHVlcy5cbiAgICBmb3IgKGogPSAyNTY7IGogPiAwOyAtLWopIHtcbiAgICAgIG1lLm5leHQoKTtcbiAgICB9XG4gIH1cblxuICBpbml0KG1lLCBzZWVkKTtcbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQueCA9IGYueC5zbGljZSgpO1xuICB0LmkgPSBmLmk7XG4gIHJldHVybiB0O1xufVxuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgaWYgKHNlZWQgPT0gbnVsbCkgc2VlZCA9ICsobmV3IERhdGUpO1xuICB2YXIgeGcgPSBuZXcgWG9yR2VuKHNlZWQpLFxuICAgICAgc3RhdGUgPSBvcHRzICYmIG9wdHMuc3RhdGUsXG4gICAgICBwcm5nID0gZnVuY3Rpb24oKSB7IHJldHVybiAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwOyB9O1xuICBwcm5nLmRvdWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgIGRvIHtcbiAgICAgIHZhciB0b3AgPSB4Zy5uZXh0KCkgPj4+IDExLFxuICAgICAgICAgIGJvdCA9ICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDAsXG4gICAgICAgICAgcmVzdWx0ID0gKHRvcCArIGJvdCkgLyAoMSA8PCAyMSk7XG4gICAgfSB3aGlsZSAocmVzdWx0ID09PSAwKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuICBwcm5nLmludDMyID0geGcubmV4dDtcbiAgcHJuZy5xdWljayA9IHBybmc7XG4gIGlmIChzdGF0ZSkge1xuICAgIGlmIChzdGF0ZS54KSBjb3B5KHN0YXRlLCB4Zyk7XG4gICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weSh4Zywge30pOyB9XG4gIH1cbiAgcmV0dXJuIHBybmc7XG59XG5cbmlmIChtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBpbXBsO1xufSBlbHNlIGlmIChkZWZpbmUgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBpbXBsOyB9KTtcbn0gZWxzZSB7XG4gIHRoaXMueG9yc2hpZnQ3ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcblxuIiwiLy8gQSBKYXZhc2NyaXB0IGltcGxlbWVudGFpb24gb2YgUmljaGFyZCBCcmVudCdzIFhvcmdlbnMgeG9yNDA5NiBhbGdvcml0aG0uXG4vL1xuLy8gVGhpcyBmYXN0IG5vbi1jcnlwdG9ncmFwaGljIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIGlzIGRlc2lnbmVkIGZvclxuLy8gdXNlIGluIE1vbnRlLUNhcmxvIGFsZ29yaXRobXMuIEl0IGNvbWJpbmVzIGEgbG9uZy1wZXJpb2QgeG9yc2hpZnRcbi8vIGdlbmVyYXRvciB3aXRoIGEgV2V5bCBnZW5lcmF0b3IsIGFuZCBpdCBwYXNzZXMgYWxsIGNvbW1vbiBiYXR0ZXJpZXNcbi8vIG9mIHN0YXN0aWNpYWwgdGVzdHMgZm9yIHJhbmRvbW5lc3Mgd2hpbGUgY29uc3VtaW5nIG9ubHkgYSBmZXcgbmFub3NlY29uZHNcbi8vIGZvciBlYWNoIHBybmcgZ2VuZXJhdGVkLiAgRm9yIGJhY2tncm91bmQgb24gdGhlIGdlbmVyYXRvciwgc2VlIEJyZW50J3Ncbi8vIHBhcGVyOiBcIlNvbWUgbG9uZy1wZXJpb2QgcmFuZG9tIG51bWJlciBnZW5lcmF0b3JzIHVzaW5nIHNoaWZ0cyBhbmQgeG9ycy5cIlxuLy8gaHR0cDovL2FyeGl2Lm9yZy9wZGYvMTAwNC4zMTE1djEucGRmXG4vL1xuLy8gVXNhZ2U6XG4vL1xuLy8gdmFyIHhvcjQwOTYgPSByZXF1aXJlKCd4b3I0MDk2Jyk7XG4vLyByYW5kb20gPSB4b3I0MDk2KDEpOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlZWQgd2l0aCBpbnQzMiBvciBzdHJpbmcuXG4vLyBhc3NlcnQuZXF1YWwocmFuZG9tKCksIDAuMTUyMDQzNjQ1MDUzODU0Nyk7IC8vICgwLCAxKSByYW5nZSwgNTMgYml0cy5cbi8vIGFzc2VydC5lcXVhbChyYW5kb20uaW50MzIoKSwgMTgwNjUzNDg5Nyk7ICAgLy8gc2lnbmVkIGludDMyLCAzMiBiaXRzLlxuLy9cbi8vIEZvciBub256ZXJvIG51bWVyaWMga2V5cywgdGhpcyBpbXBlbGVtZW50YXRpb24gcHJvdmlkZXMgYSBzZXF1ZW5jZVxuLy8gaWRlbnRpY2FsIHRvIHRoYXQgYnkgQnJlbnQncyB4b3JnZW5zIDMgaW1wbGVtZW50YWlvbiBpbiBDLiAgVGhpc1xuLy8gaW1wbGVtZW50YXRpb24gYWxzbyBwcm92aWRlcyBmb3IgaW5pdGFsaXppbmcgdGhlIGdlbmVyYXRvciB3aXRoXG4vLyBzdHJpbmcgc2VlZHMsIG9yIGZvciBzYXZpbmcgYW5kIHJlc3RvcmluZyB0aGUgc3RhdGUgb2YgdGhlIGdlbmVyYXRvci5cbi8vXG4vLyBPbiBDaHJvbWUsIHRoaXMgcHJuZyBiZW5jaG1hcmtzIGFib3V0IDIuMSB0aW1lcyBzbG93ZXIgdGhhblxuLy8gSmF2YXNjcmlwdCdzIGJ1aWx0LWluIE1hdGgucmFuZG9tKCkuXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXM7XG5cbiAgLy8gU2V0IHVwIGdlbmVyYXRvciBmdW5jdGlvbi5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB3ID0gbWUudyxcbiAgICAgICAgWCA9IG1lLlgsIGkgPSBtZS5pLCB0LCB2O1xuICAgIC8vIFVwZGF0ZSBXZXlsIGdlbmVyYXRvci5cbiAgICBtZS53ID0gdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwO1xuICAgIC8vIFVwZGF0ZSB4b3IgZ2VuZXJhdG9yLlxuICAgIHYgPSBYWyhpICsgMzQpICYgMTI3XTtcbiAgICB0ID0gWFtpID0gKChpICsgMSkgJiAxMjcpXTtcbiAgICB2IF49IHYgPDwgMTM7XG4gICAgdCBePSB0IDw8IDE3O1xuICAgIHYgXj0gdiA+Pj4gMTU7XG4gICAgdCBePSB0ID4+PiAxMjtcbiAgICAvLyBVcGRhdGUgWG9yIGdlbmVyYXRvciBhcnJheSBzdGF0ZS5cbiAgICB2ID0gWFtpXSA9IHYgXiB0O1xuICAgIG1lLmkgPSBpO1xuICAgIC8vIFJlc3VsdCBpcyB0aGUgY29tYmluYXRpb24uXG4gICAgcmV0dXJuICh2ICsgKHcgXiAodyA+Pj4gMTYpKSkgfCAwO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGluaXQobWUsIHNlZWQpIHtcbiAgICB2YXIgdCwgdiwgaSwgaiwgdywgWCA9IFtdLCBsaW1pdCA9IDEyODtcbiAgICBpZiAoc2VlZCA9PT0gKHNlZWQgfCAwKSkge1xuICAgICAgLy8gTnVtZXJpYyBzZWVkcyBpbml0aWFsaXplIHYsIHdoaWNoIGlzIHVzZWQgdG8gZ2VuZXJhdGVzIFguXG4gICAgICB2ID0gc2VlZDtcbiAgICAgIHNlZWQgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBTdHJpbmcgc2VlZHMgYXJlIG1peGVkIGludG8gdiBhbmQgWCBvbmUgY2hhcmFjdGVyIGF0IGEgdGltZS5cbiAgICAgIHNlZWQgPSBzZWVkICsgJ1xcMCc7XG4gICAgICB2ID0gMDtcbiAgICAgIGxpbWl0ID0gTWF0aC5tYXgobGltaXQsIHNlZWQubGVuZ3RoKTtcbiAgICB9XG4gICAgLy8gSW5pdGlhbGl6ZSBjaXJjdWxhciBhcnJheSBhbmQgd2V5bCB2YWx1ZS5cbiAgICBmb3IgKGkgPSAwLCBqID0gLTMyOyBqIDwgbGltaXQ7ICsraikge1xuICAgICAgLy8gUHV0IHRoZSB1bmljb2RlIGNoYXJhY3RlcnMgaW50byB0aGUgYXJyYXksIGFuZCBzaHVmZmxlIHRoZW0uXG4gICAgICBpZiAoc2VlZCkgdiBePSBzZWVkLmNoYXJDb2RlQXQoKGogKyAzMikgJSBzZWVkLmxlbmd0aCk7XG4gICAgICAvLyBBZnRlciAzMiBzaHVmZmxlcywgdGFrZSB2IGFzIHRoZSBzdGFydGluZyB3IHZhbHVlLlxuICAgICAgaWYgKGogPT09IDApIHcgPSB2O1xuICAgICAgdiBePSB2IDw8IDEwO1xuICAgICAgdiBePSB2ID4+PiAxNTtcbiAgICAgIHYgXj0gdiA8PCA0O1xuICAgICAgdiBePSB2ID4+PiAxMztcbiAgICAgIGlmIChqID49IDApIHtcbiAgICAgICAgdyA9ICh3ICsgMHg2MWM4ODY0NykgfCAwOyAgICAgLy8gV2V5bC5cbiAgICAgICAgdCA9IChYW2ogJiAxMjddIF49ICh2ICsgdykpOyAgLy8gQ29tYmluZSB4b3IgYW5kIHdleWwgdG8gaW5pdCBhcnJheS5cbiAgICAgICAgaSA9ICgwID09IHQpID8gaSArIDEgOiAwOyAgICAgLy8gQ291bnQgemVyb2VzLlxuICAgICAgfVxuICAgIH1cbiAgICAvLyBXZSBoYXZlIGRldGVjdGVkIGFsbCB6ZXJvZXM7IG1ha2UgdGhlIGtleSBub256ZXJvLlxuICAgIGlmIChpID49IDEyOCkge1xuICAgICAgWFsoc2VlZCAmJiBzZWVkLmxlbmd0aCB8fCAwKSAmIDEyN10gPSAtMTtcbiAgICB9XG4gICAgLy8gUnVuIHRoZSBnZW5lcmF0b3IgNTEyIHRpbWVzIHRvIGZ1cnRoZXIgbWl4IHRoZSBzdGF0ZSBiZWZvcmUgdXNpbmcgaXQuXG4gICAgLy8gRmFjdG9yaW5nIHRoaXMgYXMgYSBmdW5jdGlvbiBzbG93cyB0aGUgbWFpbiBnZW5lcmF0b3IsIHNvIGl0IGlzIGp1c3RcbiAgICAvLyB1bnJvbGxlZCBoZXJlLiAgVGhlIHdleWwgZ2VuZXJhdG9yIGlzIG5vdCBhZHZhbmNlZCB3aGlsZSB3YXJtaW5nIHVwLlxuICAgIGkgPSAxMjc7XG4gICAgZm9yIChqID0gNCAqIDEyODsgaiA+IDA7IC0taikge1xuICAgICAgdiA9IFhbKGkgKyAzNCkgJiAxMjddO1xuICAgICAgdCA9IFhbaSA9ICgoaSArIDEpICYgMTI3KV07XG4gICAgICB2IF49IHYgPDwgMTM7XG4gICAgICB0IF49IHQgPDwgMTc7XG4gICAgICB2IF49IHYgPj4+IDE1O1xuICAgICAgdCBePSB0ID4+PiAxMjtcbiAgICAgIFhbaV0gPSB2IF4gdDtcbiAgICB9XG4gICAgLy8gU3RvcmluZyBzdGF0ZSBhcyBvYmplY3QgbWVtYmVycyBpcyBmYXN0ZXIgdGhhbiB1c2luZyBjbG9zdXJlIHZhcmlhYmxlcy5cbiAgICBtZS53ID0gdztcbiAgICBtZS5YID0gWDtcbiAgICBtZS5pID0gaTtcbiAgfVxuXG4gIGluaXQobWUsIHNlZWQpO1xufVxuXG5mdW5jdGlvbiBjb3B5KGYsIHQpIHtcbiAgdC5pID0gZi5pO1xuICB0LncgPSBmLnc7XG4gIHQuWCA9IGYuWC5zbGljZSgpO1xuICByZXR1cm4gdDtcbn07XG5cbmZ1bmN0aW9uIGltcGwoc2VlZCwgb3B0cykge1xuICBpZiAoc2VlZCA9PSBudWxsKSBzZWVkID0gKyhuZXcgRGF0ZSk7XG4gIHZhciB4ZyA9IG5ldyBYb3JHZW4oc2VlZCksXG4gICAgICBzdGF0ZSA9IG9wdHMgJiYgb3B0cy5zdGF0ZSxcbiAgICAgIHBybmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuICh4Zy5uZXh0KCkgPj4+IDApIC8gMHgxMDAwMDAwMDA7IH07XG4gIHBybmcuZG91YmxlID0gZnVuY3Rpb24oKSB7XG4gICAgZG8ge1xuICAgICAgdmFyIHRvcCA9IHhnLm5leHQoKSA+Pj4gMTEsXG4gICAgICAgICAgYm90ID0gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMCxcbiAgICAgICAgICByZXN1bHQgPSAodG9wICsgYm90KSAvICgxIDw8IDIxKTtcbiAgICB9IHdoaWxlIChyZXN1bHQgPT09IDApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG4gIHBybmcuaW50MzIgPSB4Zy5uZXh0O1xuICBwcm5nLnF1aWNrID0gcHJuZztcbiAgaWYgKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlLlgpIGNvcHkoc3RhdGUsIHhnKTtcbiAgICBwcm5nLnN0YXRlID0gZnVuY3Rpb24oKSB7IHJldHVybiBjb3B5KHhnLCB7fSk7IH1cbiAgfVxuICByZXR1cm4gcHJuZztcbn1cblxuaWYgKG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGltcGw7XG59IGVsc2UgaWYgKGRlZmluZSAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGltcGw7IH0pO1xufSBlbHNlIHtcbiAgdGhpcy54b3I0MDk2ID0gaW1wbDtcbn1cblxufSkoXG4gIHRoaXMsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdpbmRvdyBvYmplY3Qgb3IgZ2xvYmFsXG4gICh0eXBlb2YgbW9kdWxlKSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUsICAgIC8vIHByZXNlbnQgaW4gbm9kZS5qc1xuICAodHlwZW9mIGRlZmluZSkgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUgICAvLyBwcmVzZW50IHdpdGggYW4gQU1EIGxvYWRlclxuKTtcbiIsIi8vIEEgSmF2YXNjcmlwdCBpbXBsZW1lbnRhaW9uIG9mIHRoZSBcIlR5Y2hlLWlcIiBwcm5nIGFsZ29yaXRobSBieVxuLy8gU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLlxuLy8gU2VlIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG5cbihmdW5jdGlvbihnbG9iYWwsIG1vZHVsZSwgZGVmaW5lKSB7XG5cbmZ1bmN0aW9uIFhvckdlbihzZWVkKSB7XG4gIHZhciBtZSA9IHRoaXMsIHN0cnNlZWQgPSAnJztcblxuICAvLyBTZXQgdXAgZ2VuZXJhdG9yIGZ1bmN0aW9uLlxuICBtZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIgPSBtZS5iLCBjID0gbWUuYywgZCA9IG1lLmQsIGEgPSBtZS5hO1xuICAgIGIgPSAoYiA8PCAyNSkgXiAoYiA+Pj4gNykgXiBjO1xuICAgIGMgPSAoYyAtIGQpIHwgMDtcbiAgICBkID0gKGQgPDwgMjQpIF4gKGQgPj4+IDgpIF4gYTtcbiAgICBhID0gKGEgLSBiKSB8IDA7XG4gICAgbWUuYiA9IGIgPSAoYiA8PCAyMCkgXiAoYiA+Pj4gMTIpIF4gYztcbiAgICBtZS5jID0gYyA9IChjIC0gZCkgfCAwO1xuICAgIG1lLmQgPSAoZCA8PCAxNikgXiAoYyA+Pj4gMTYpIF4gYTtcbiAgICByZXR1cm4gbWUuYSA9IChhIC0gYikgfCAwO1xuICB9O1xuXG4gIC8qIFRoZSBmb2xsb3dpbmcgaXMgbm9uLWludmVydGVkIHR5Y2hlLCB3aGljaCBoYXMgYmV0dGVyIGludGVybmFsXG4gICAqIGJpdCBkaWZmdXNpb24sIGJ1dCB3aGljaCBpcyBhYm91dCAyNSUgc2xvd2VyIHRoYW4gdHljaGUtaSBpbiBKUy5cbiAgbWUubmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhID0gbWUuYSwgYiA9IG1lLmIsIGMgPSBtZS5jLCBkID0gbWUuZDtcbiAgICBhID0gKG1lLmEgKyBtZS5iIHwgMCkgPj4+IDA7XG4gICAgZCA9IG1lLmQgXiBhOyBkID0gZCA8PCAxNiBeIGQgPj4+IDE2O1xuICAgIGMgPSBtZS5jICsgZCB8IDA7XG4gICAgYiA9IG1lLmIgXiBjOyBiID0gYiA8PCAxMiBeIGQgPj4+IDIwO1xuICAgIG1lLmEgPSBhID0gYSArIGIgfCAwO1xuICAgIGQgPSBkIF4gYTsgbWUuZCA9IGQgPSBkIDw8IDggXiBkID4+PiAyNDtcbiAgICBtZS5jID0gYyA9IGMgKyBkIHwgMDtcbiAgICBiID0gYiBeIGM7XG4gICAgcmV0dXJuIG1lLmIgPSAoYiA8PCA3IF4gYiA+Pj4gMjUpO1xuICB9XG4gICovXG5cbiAgbWUuYSA9IDA7XG4gIG1lLmIgPSAwO1xuICBtZS5jID0gMjY1NDQzNTc2OSB8IDA7XG4gIG1lLmQgPSAxMzY3MTMwNTUxO1xuXG4gIGlmIChzZWVkID09PSBNYXRoLmZsb29yKHNlZWQpKSB7XG4gICAgLy8gSW50ZWdlciBzZWVkLlxuICAgIG1lLmEgPSAoc2VlZCAvIDB4MTAwMDAwMDAwKSB8IDA7XG4gICAgbWUuYiA9IHNlZWQgfCAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFN0cmluZyBzZWVkLlxuICAgIHN0cnNlZWQgKz0gc2VlZDtcbiAgfVxuXG4gIC8vIE1peCBpbiBzdHJpbmcgc2VlZCwgdGhlbiBkaXNjYXJkIGFuIGluaXRpYWwgYmF0Y2ggb2YgNjQgdmFsdWVzLlxuICBmb3IgKHZhciBrID0gMDsgayA8IHN0cnNlZWQubGVuZ3RoICsgMjA7IGsrKykge1xuICAgIG1lLmIgXj0gc3Ryc2VlZC5jaGFyQ29kZUF0KGspIHwgMDtcbiAgICBtZS5uZXh0KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuYSA9IGYuYTtcbiAgdC5iID0gZi5iO1xuICB0LmMgPSBmLmM7XG4gIHQuZCA9IGYuZDtcbiAgcmV0dXJuIHQ7XG59O1xuXG5mdW5jdGlvbiBpbXBsKHNlZWQsIG9wdHMpIHtcbiAgdmFyIHhnID0gbmV3IFhvckdlbihzZWVkKSxcbiAgICAgIHN0YXRlID0gb3B0cyAmJiBvcHRzLnN0YXRlLFxuICAgICAgcHJuZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gKHhnLm5leHQoKSA+Pj4gMCkgLyAweDEwMDAwMDAwMDsgfTtcbiAgcHJuZy5kb3VibGUgPSBmdW5jdGlvbigpIHtcbiAgICBkbyB7XG4gICAgICB2YXIgdG9wID0geGcubmV4dCgpID4+PiAxMSxcbiAgICAgICAgICBib3QgPSAoeGcubmV4dCgpID4+PiAwKSAvIDB4MTAwMDAwMDAwLFxuICAgICAgICAgIHJlc3VsdCA9ICh0b3AgKyBib3QpIC8gKDEgPDwgMjEpO1xuICAgIH0gd2hpbGUgKHJlc3VsdCA9PT0gMCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcHJuZy5pbnQzMiA9IHhnLm5leHQ7XG4gIHBybmcucXVpY2sgPSBwcm5nO1xuICBpZiAoc3RhdGUpIHtcbiAgICBpZiAodHlwZW9mKHN0YXRlKSA9PSAnb2JqZWN0JykgY29weShzdGF0ZSwgeGcpO1xuICAgIHBybmcuc3RhdGUgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGNvcHkoeGcsIHt9KTsgfVxuICB9XG4gIHJldHVybiBwcm5nO1xufVxuXG5pZiAobW9kdWxlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gaW1wbDtcbn0gZWxzZSBpZiAoZGVmaW5lICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gaW1wbDsgfSk7XG59IGVsc2Uge1xuICB0aGlzLnR5Y2hlaSA9IGltcGw7XG59XG5cbn0pKFxuICB0aGlzLFxuICAodHlwZW9mIG1vZHVsZSkgPT0gJ29iamVjdCcgJiYgbW9kdWxlLCAgICAvLyBwcmVzZW50IGluIG5vZGUuanNcbiAgKHR5cGVvZiBkZWZpbmUpID09ICdmdW5jdGlvbicgJiYgZGVmaW5lICAgLy8gcHJlc2VudCB3aXRoIGFuIEFNRCBsb2FkZXJcbik7XG5cblxuIiwiLypcbkNvcHlyaWdodCAyMDE0IERhdmlkIEJhdS5cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nXG5hIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcblwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xud2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG5wZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbnRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmVcbmluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG5NRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG5JTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcblRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG5TT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuKi9cblxuKGZ1bmN0aW9uIChwb29sLCBtYXRoKSB7XG4vL1xuLy8gVGhlIGZvbGxvd2luZyBjb25zdGFudHMgYXJlIHJlbGF0ZWQgdG8gSUVFRSA3NTQgbGltaXRzLlxuLy9cblxuLy8gRGV0ZWN0IHRoZSBnbG9iYWwgb2JqZWN0LCBldmVuIGlmIG9wZXJhdGluZyBpbiBzdHJpY3QgbW9kZS5cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0Mzg3MDU3LzI2NTI5OFxudmFyIGdsb2JhbCA9ICgwLCBldmFsKSgndGhpcycpLFxuICAgIHdpZHRoID0gMjU2LCAgICAgICAgLy8gZWFjaCBSQzQgb3V0cHV0IGlzIDAgPD0geCA8IDI1NlxuICAgIGNodW5rcyA9IDYsICAgICAgICAgLy8gYXQgbGVhc3Qgc2l4IFJDNCBvdXRwdXRzIGZvciBlYWNoIGRvdWJsZVxuICAgIGRpZ2l0cyA9IDUyLCAgICAgICAgLy8gdGhlcmUgYXJlIDUyIHNpZ25pZmljYW50IGRpZ2l0cyBpbiBhIGRvdWJsZVxuICAgIHJuZ25hbWUgPSAncmFuZG9tJywgLy8gcm5nbmFtZTogbmFtZSBmb3IgTWF0aC5yYW5kb20gYW5kIE1hdGguc2VlZHJhbmRvbVxuICAgIHN0YXJ0ZGVub20gPSBtYXRoLnBvdyh3aWR0aCwgY2h1bmtzKSxcbiAgICBzaWduaWZpY2FuY2UgPSBtYXRoLnBvdygyLCBkaWdpdHMpLFxuICAgIG92ZXJmbG93ID0gc2lnbmlmaWNhbmNlICogMixcbiAgICBtYXNrID0gd2lkdGggLSAxLFxuICAgIG5vZGVjcnlwdG87ICAgICAgICAgLy8gbm9kZS5qcyBjcnlwdG8gbW9kdWxlLCBpbml0aWFsaXplZCBhdCB0aGUgYm90dG9tLlxuXG4vL1xuLy8gc2VlZHJhbmRvbSgpXG4vLyBUaGlzIGlzIHRoZSBzZWVkcmFuZG9tIGZ1bmN0aW9uIGRlc2NyaWJlZCBhYm92ZS5cbi8vXG5mdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHZhciBrZXkgPSBbXTtcbiAgb3B0aW9ucyA9IChvcHRpb25zID09IHRydWUpID8geyBlbnRyb3B5OiB0cnVlIH0gOiAob3B0aW9ucyB8fCB7fSk7XG5cbiAgLy8gRmxhdHRlbiB0aGUgc2VlZCBzdHJpbmcgb3IgYnVpbGQgb25lIGZyb20gbG9jYWwgZW50cm9weSBpZiBuZWVkZWQuXG4gIHZhciBzaG9ydHNlZWQgPSBtaXhrZXkoZmxhdHRlbihcbiAgICBvcHRpb25zLmVudHJvcHkgPyBbc2VlZCwgdG9zdHJpbmcocG9vbCldIDpcbiAgICAoc2VlZCA9PSBudWxsKSA/IGF1dG9zZWVkKCkgOiBzZWVkLCAzKSwga2V5KTtcblxuICAvLyBVc2UgdGhlIHNlZWQgdG8gaW5pdGlhbGl6ZSBhbiBBUkM0IGdlbmVyYXRvci5cbiAgdmFyIGFyYzQgPSBuZXcgQVJDNChrZXkpO1xuXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHJhbmRvbSBkb3VibGUgaW4gWzAsIDEpIHRoYXQgY29udGFpbnNcbiAgLy8gcmFuZG9tbmVzcyBpbiBldmVyeSBiaXQgb2YgdGhlIG1hbnRpc3NhIG9mIHRoZSBJRUVFIDc1NCB2YWx1ZS5cbiAgdmFyIHBybmcgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbiA9IGFyYzQuZyhjaHVua3MpLCAgICAgICAgICAgICAvLyBTdGFydCB3aXRoIGEgbnVtZXJhdG9yIG4gPCAyIF4gNDhcbiAgICAgICAgZCA9IHN0YXJ0ZGVub20sICAgICAgICAgICAgICAgICAvLyAgIGFuZCBkZW5vbWluYXRvciBkID0gMiBeIDQ4LlxuICAgICAgICB4ID0gMDsgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgYW5kIG5vICdleHRyYSBsYXN0IGJ5dGUnLlxuICAgIHdoaWxlIChuIDwgc2lnbmlmaWNhbmNlKSB7ICAgICAgICAgIC8vIEZpbGwgdXAgYWxsIHNpZ25pZmljYW50IGRpZ2l0cyBieVxuICAgICAgbiA9IChuICsgeCkgKiB3aWR0aDsgICAgICAgICAgICAgIC8vICAgc2hpZnRpbmcgbnVtZXJhdG9yIGFuZFxuICAgICAgZCAqPSB3aWR0aDsgICAgICAgICAgICAgICAgICAgICAgIC8vICAgZGVub21pbmF0b3IgYW5kIGdlbmVyYXRpbmcgYVxuICAgICAgeCA9IGFyYzQuZygxKTsgICAgICAgICAgICAgICAgICAgIC8vICAgbmV3IGxlYXN0LXNpZ25pZmljYW50LWJ5dGUuXG4gICAgfVxuICAgIHdoaWxlIChuID49IG92ZXJmbG93KSB7ICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHJvdW5kaW5nIHVwLCBiZWZvcmUgYWRkaW5nXG4gICAgICBuIC89IDI7ICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsYXN0IGJ5dGUsIHNoaWZ0IGV2ZXJ5dGhpbmdcbiAgICAgIGQgLz0gMjsgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIHJpZ2h0IHVzaW5nIGludGVnZXIgbWF0aCB1bnRpbFxuICAgICAgeCA+Pj49IDE7ICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgd2UgaGF2ZSBleGFjdGx5IHRoZSBkZXNpcmVkIGJpdHMuXG4gICAgfVxuICAgIHJldHVybiAobiArIHgpIC8gZDsgICAgICAgICAgICAgICAgIC8vIEZvcm0gdGhlIG51bWJlciB3aXRoaW4gWzAsIDEpLlxuICB9O1xuXG4gIHBybmcuaW50MzIgPSBmdW5jdGlvbigpIHsgcmV0dXJuIGFyYzQuZyg0KSB8IDA7IH1cbiAgcHJuZy5xdWljayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJjNC5nKDQpIC8gMHgxMDAwMDAwMDA7IH1cbiAgcHJuZy5kb3VibGUgPSBwcm5nO1xuXG4gIC8vIE1peCB0aGUgcmFuZG9tbmVzcyBpbnRvIGFjY3VtdWxhdGVkIGVudHJvcHkuXG4gIG1peGtleSh0b3N0cmluZyhhcmM0LlMpLCBwb29sKTtcblxuICAvLyBDYWxsaW5nIGNvbnZlbnRpb246IHdoYXQgdG8gcmV0dXJuIGFzIGEgZnVuY3Rpb24gb2YgcHJuZywgc2VlZCwgaXNfbWF0aC5cbiAgcmV0dXJuIChvcHRpb25zLnBhc3MgfHwgY2FsbGJhY2sgfHxcbiAgICAgIGZ1bmN0aW9uKHBybmcsIHNlZWQsIGlzX21hdGhfY2FsbCwgc3RhdGUpIHtcbiAgICAgICAgaWYgKHN0YXRlKSB7XG4gICAgICAgICAgLy8gTG9hZCB0aGUgYXJjNCBzdGF0ZSBmcm9tIHRoZSBnaXZlbiBzdGF0ZSBpZiBpdCBoYXMgYW4gUyBhcnJheS5cbiAgICAgICAgICBpZiAoc3RhdGUuUykgeyBjb3B5KHN0YXRlLCBhcmM0KTsgfVxuICAgICAgICAgIC8vIE9ubHkgcHJvdmlkZSB0aGUgLnN0YXRlIG1ldGhvZCBpZiByZXF1ZXN0ZWQgdmlhIG9wdGlvbnMuc3RhdGUuXG4gICAgICAgICAgcHJuZy5zdGF0ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gY29weShhcmM0LCB7fSk7IH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGNhbGxlZCBhcyBhIG1ldGhvZCBvZiBNYXRoIChNYXRoLnNlZWRyYW5kb20oKSksIG11dGF0ZVxuICAgICAgICAvLyBNYXRoLnJhbmRvbSBiZWNhdXNlIHRoYXQgaXMgaG93IHNlZWRyYW5kb20uanMgaGFzIHdvcmtlZCBzaW5jZSB2MS4wLlxuICAgICAgICBpZiAoaXNfbWF0aF9jYWxsKSB7IG1hdGhbcm5nbmFtZV0gPSBwcm5nOyByZXR1cm4gc2VlZDsgfVxuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaXQgaXMgYSBuZXdlciBjYWxsaW5nIGNvbnZlbnRpb24sIHNvIHJldHVybiB0aGVcbiAgICAgICAgLy8gcHJuZyBkaXJlY3RseS5cbiAgICAgICAgZWxzZSByZXR1cm4gcHJuZztcbiAgICAgIH0pKFxuICBwcm5nLFxuICBzaG9ydHNlZWQsXG4gICdnbG9iYWwnIGluIG9wdGlvbnMgPyBvcHRpb25zLmdsb2JhbCA6ICh0aGlzID09IG1hdGgpLFxuICBvcHRpb25zLnN0YXRlKTtcbn1cbm1hdGhbJ3NlZWQnICsgcm5nbmFtZV0gPSBzZWVkcmFuZG9tO1xuXG4vL1xuLy8gQVJDNFxuLy9cbi8vIEFuIEFSQzQgaW1wbGVtZW50YXRpb24uICBUaGUgY29uc3RydWN0b3IgdGFrZXMgYSBrZXkgaW4gdGhlIGZvcm0gb2Zcbi8vIGFuIGFycmF5IG9mIGF0IG1vc3QgKHdpZHRoKSBpbnRlZ2VycyB0aGF0IHNob3VsZCBiZSAwIDw9IHggPCAod2lkdGgpLlxuLy9cbi8vIFRoZSBnKGNvdW50KSBtZXRob2QgcmV0dXJucyBhIHBzZXVkb3JhbmRvbSBpbnRlZ2VyIHRoYXQgY29uY2F0ZW5hdGVzXG4vLyB0aGUgbmV4dCAoY291bnQpIG91dHB1dHMgZnJvbSBBUkM0LiAgSXRzIHJldHVybiB2YWx1ZSBpcyBhIG51bWJlciB4XG4vLyB0aGF0IGlzIGluIHRoZSByYW5nZSAwIDw9IHggPCAod2lkdGggXiBjb3VudCkuXG4vL1xuZnVuY3Rpb24gQVJDNChrZXkpIHtcbiAgdmFyIHQsIGtleWxlbiA9IGtleS5sZW5ndGgsXG4gICAgICBtZSA9IHRoaXMsIGkgPSAwLCBqID0gbWUuaSA9IG1lLmogPSAwLCBzID0gbWUuUyA9IFtdO1xuXG4gIC8vIFRoZSBlbXB0eSBrZXkgW10gaXMgdHJlYXRlZCBhcyBbMF0uXG4gIGlmICgha2V5bGVuKSB7IGtleSA9IFtrZXlsZW4rK107IH1cblxuICAvLyBTZXQgdXAgUyB1c2luZyB0aGUgc3RhbmRhcmQga2V5IHNjaGVkdWxpbmcgYWxnb3JpdGhtLlxuICB3aGlsZSAoaSA8IHdpZHRoKSB7XG4gICAgc1tpXSA9IGkrKztcbiAgfVxuICBmb3IgKGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgIHNbaV0gPSBzW2ogPSBtYXNrICYgKGogKyBrZXlbaSAlIGtleWxlbl0gKyAodCA9IHNbaV0pKV07XG4gICAgc1tqXSA9IHQ7XG4gIH1cblxuICAvLyBUaGUgXCJnXCIgbWV0aG9kIHJldHVybnMgdGhlIG5leHQgKGNvdW50KSBvdXRwdXRzIGFzIG9uZSBudW1iZXIuXG4gIChtZS5nID0gZnVuY3Rpb24oY291bnQpIHtcbiAgICAvLyBVc2luZyBpbnN0YW5jZSBtZW1iZXJzIGluc3RlYWQgb2YgY2xvc3VyZSBzdGF0ZSBuZWFybHkgZG91YmxlcyBzcGVlZC5cbiAgICB2YXIgdCwgciA9IDAsXG4gICAgICAgIGkgPSBtZS5pLCBqID0gbWUuaiwgcyA9IG1lLlM7XG4gICAgd2hpbGUgKGNvdW50LS0pIHtcbiAgICAgIHQgPSBzW2kgPSBtYXNrICYgKGkgKyAxKV07XG4gICAgICByID0gciAqIHdpZHRoICsgc1ttYXNrICYgKChzW2ldID0gc1tqID0gbWFzayAmIChqICsgdCldKSArIChzW2pdID0gdCkpXTtcbiAgICB9XG4gICAgbWUuaSA9IGk7IG1lLmogPSBqO1xuICAgIHJldHVybiByO1xuICAgIC8vIEZvciByb2J1c3QgdW5wcmVkaWN0YWJpbGl0eSwgdGhlIGZ1bmN0aW9uIGNhbGwgYmVsb3cgYXV0b21hdGljYWxseVxuICAgIC8vIGRpc2NhcmRzIGFuIGluaXRpYWwgYmF0Y2ggb2YgdmFsdWVzLiAgVGhpcyBpcyBjYWxsZWQgUkM0LWRyb3BbMjU2XS5cbiAgICAvLyBTZWUgaHR0cDovL2dvb2dsZS5jb20vc2VhcmNoP3E9cnNhK2ZsdWhyZXIrcmVzcG9uc2UmYnRuSVxuICB9KSh3aWR0aCk7XG59XG5cbi8vXG4vLyBjb3B5KClcbi8vIENvcGllcyBpbnRlcm5hbCBzdGF0ZSBvZiBBUkM0IHRvIG9yIGZyb20gYSBwbGFpbiBvYmplY3QuXG4vL1xuZnVuY3Rpb24gY29weShmLCB0KSB7XG4gIHQuaSA9IGYuaTtcbiAgdC5qID0gZi5qO1xuICB0LlMgPSBmLlMuc2xpY2UoKTtcbiAgcmV0dXJuIHQ7XG59O1xuXG4vL1xuLy8gZmxhdHRlbigpXG4vLyBDb252ZXJ0cyBhbiBvYmplY3QgdHJlZSB0byBuZXN0ZWQgYXJyYXlzIG9mIHN0cmluZ3MuXG4vL1xuZnVuY3Rpb24gZmxhdHRlbihvYmosIGRlcHRoKSB7XG4gIHZhciByZXN1bHQgPSBbXSwgdHlwID0gKHR5cGVvZiBvYmopLCBwcm9wO1xuICBpZiAoZGVwdGggJiYgdHlwID09ICdvYmplY3QnKSB7XG4gICAgZm9yIChwcm9wIGluIG9iaikge1xuICAgICAgdHJ5IHsgcmVzdWx0LnB1c2goZmxhdHRlbihvYmpbcHJvcF0sIGRlcHRoIC0gMSkpOyB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICByZXR1cm4gKHJlc3VsdC5sZW5ndGggPyByZXN1bHQgOiB0eXAgPT0gJ3N0cmluZycgPyBvYmogOiBvYmogKyAnXFwwJyk7XG59XG5cbi8vXG4vLyBtaXhrZXkoKVxuLy8gTWl4ZXMgYSBzdHJpbmcgc2VlZCBpbnRvIGEga2V5IHRoYXQgaXMgYW4gYXJyYXkgb2YgaW50ZWdlcnMsIGFuZFxuLy8gcmV0dXJucyBhIHNob3J0ZW5lZCBzdHJpbmcgc2VlZCB0aGF0IGlzIGVxdWl2YWxlbnQgdG8gdGhlIHJlc3VsdCBrZXkuXG4vL1xuZnVuY3Rpb24gbWl4a2V5KHNlZWQsIGtleSkge1xuICB2YXIgc3RyaW5nc2VlZCA9IHNlZWQgKyAnJywgc21lYXIsIGogPSAwO1xuICB3aGlsZSAoaiA8IHN0cmluZ3NlZWQubGVuZ3RoKSB7XG4gICAga2V5W21hc2sgJiBqXSA9XG4gICAgICBtYXNrICYgKChzbWVhciBePSBrZXlbbWFzayAmIGpdICogMTkpICsgc3RyaW5nc2VlZC5jaGFyQ29kZUF0KGorKykpO1xuICB9XG4gIHJldHVybiB0b3N0cmluZyhrZXkpO1xufVxuXG4vL1xuLy8gYXV0b3NlZWQoKVxuLy8gUmV0dXJucyBhbiBvYmplY3QgZm9yIGF1dG9zZWVkaW5nLCB1c2luZyB3aW5kb3cuY3J5cHRvIGFuZCBOb2RlIGNyeXB0b1xuLy8gbW9kdWxlIGlmIGF2YWlsYWJsZS5cbi8vXG5mdW5jdGlvbiBhdXRvc2VlZCgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgb3V0O1xuICAgIGlmIChub2RlY3J5cHRvICYmIChvdXQgPSBub2RlY3J5cHRvLnJhbmRvbUJ5dGVzKSkge1xuICAgICAgLy8gVGhlIHVzZSBvZiAnb3V0JyB0byByZW1lbWJlciByYW5kb21CeXRlcyBtYWtlcyB0aWdodCBtaW5pZmllZCBjb2RlLlxuICAgICAgb3V0ID0gb3V0KHdpZHRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gbmV3IFVpbnQ4QXJyYXkod2lkdGgpO1xuICAgICAgKGdsb2JhbC5jcnlwdG8gfHwgZ2xvYmFsLm1zQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMob3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRvc3RyaW5nKG91dCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB2YXIgYnJvd3NlciA9IGdsb2JhbC5uYXZpZ2F0b3IsXG4gICAgICAgIHBsdWdpbnMgPSBicm93c2VyICYmIGJyb3dzZXIucGx1Z2lucztcbiAgICByZXR1cm4gWytuZXcgRGF0ZSwgZ2xvYmFsLCBwbHVnaW5zLCBnbG9iYWwuc2NyZWVuLCB0b3N0cmluZyhwb29sKV07XG4gIH1cbn1cblxuLy9cbi8vIHRvc3RyaW5nKClcbi8vIENvbnZlcnRzIGFuIGFycmF5IG9mIGNoYXJjb2RlcyB0byBhIHN0cmluZ1xuLy9cbmZ1bmN0aW9uIHRvc3RyaW5nKGEpIHtcbiAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoMCwgYSk7XG59XG5cbi8vXG4vLyBXaGVuIHNlZWRyYW5kb20uanMgaXMgbG9hZGVkLCB3ZSBpbW1lZGlhdGVseSBtaXggYSBmZXcgYml0c1xuLy8gZnJvbSB0aGUgYnVpbHQtaW4gUk5HIGludG8gdGhlIGVudHJvcHkgcG9vbC4gIEJlY2F1c2Ugd2UgZG9cbi8vIG5vdCB3YW50IHRvIGludGVyZmVyZSB3aXRoIGRldGVybWluaXN0aWMgUFJORyBzdGF0ZSBsYXRlcixcbi8vIHNlZWRyYW5kb20gd2lsbCBub3QgY2FsbCBtYXRoLnJhbmRvbSBvbiBpdHMgb3duIGFnYWluIGFmdGVyXG4vLyBpbml0aWFsaXphdGlvbi5cbi8vXG5taXhrZXkobWF0aC5yYW5kb20oKSwgcG9vbCk7XG5cbi8vXG4vLyBOb2RlanMgYW5kIEFNRCBzdXBwb3J0OiBleHBvcnQgdGhlIGltcGxlbWVudGF0aW9uIGFzIGEgbW9kdWxlIHVzaW5nXG4vLyBlaXRoZXIgY29udmVudGlvbi5cbi8vXG5pZiAoKHR5cGVvZiBtb2R1bGUpID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gc2VlZHJhbmRvbTtcbiAgLy8gV2hlbiBpbiBub2RlLmpzLCB0cnkgdXNpbmcgY3J5cHRvIHBhY2thZ2UgZm9yIGF1dG9zZWVkaW5nLlxuICB0cnkge1xuICAgIG5vZGVjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTtcbiAgfSBjYXRjaCAoZXgpIHt9XG59IGVsc2UgaWYgKCh0eXBlb2YgZGVmaW5lKSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gc2VlZHJhbmRvbTsgfSk7XG59XG5cbi8vIEVuZCBhbm9ueW1vdXMgc2NvcGUsIGFuZCBwYXNzIGluaXRpYWwgdmFsdWVzLlxufSkoXG4gIFtdLCAgICAgLy8gcG9vbDogZW50cm9weSBwb29sIHN0YXJ0cyBlbXB0eVxuICBNYXRoICAgIC8vIG1hdGg6IHBhY2thZ2UgY29udGFpbmluZyByYW5kb20sIHBvdywgYW5kIHNlZWRyYW5kb21cbik7XG4iLCIvLyBBIGxpYnJhcnkgb2Ygc2VlZGFibGUgUk5HcyBpbXBsZW1lbnRlZCBpbiBKYXZhc2NyaXB0LlxuLy9cbi8vIFVzYWdlOlxuLy9cbi8vIHZhciBzZWVkcmFuZG9tID0gcmVxdWlyZSgnc2VlZHJhbmRvbScpO1xuLy8gdmFyIHJhbmRvbSA9IHNlZWRyYW5kb20oMSk7IC8vIG9yIGFueSBzZWVkLlxuLy8gdmFyIHggPSByYW5kb20oKTsgICAgICAgLy8gMCA8PSB4IDwgMS4gIEV2ZXJ5IGJpdCBpcyByYW5kb20uXG4vLyB2YXIgeCA9IHJhbmRvbS5xdWljaygpOyAvLyAwIDw9IHggPCAxLiAgMzIgYml0cyBvZiByYW5kb21uZXNzLlxuXG4vLyBhbGVhLCBhIDUzLWJpdCBtdWx0aXBseS13aXRoLWNhcnJ5IGdlbmVyYXRvciBieSBKb2hhbm5lcyBCYWFnw7hlLlxuLy8gUGVyaW9kOiB+Ml4xMTZcbi8vIFJlcG9ydGVkIHRvIHBhc3MgYWxsIEJpZ0NydXNoIHRlc3RzLlxudmFyIGFsZWEgPSByZXF1aXJlKCcuL2xpYi9hbGVhJyk7XG5cbi8vIHhvcjEyOCwgYSBwdXJlIHhvci1zaGlmdCBnZW5lcmF0b3IgYnkgR2VvcmdlIE1hcnNhZ2xpYS5cbi8vIFBlcmlvZDogMl4xMjgtMS5cbi8vIFJlcG9ydGVkIHRvIGZhaWw6IE1hdHJpeFJhbmsgYW5kIExpbmVhckNvbXAuXG52YXIgeG9yMTI4ID0gcmVxdWlyZSgnLi9saWIveG9yMTI4Jyk7XG5cbi8vIHhvcndvdywgR2VvcmdlIE1hcnNhZ2xpYSdzIDE2MC1iaXQgeG9yLXNoaWZ0IGNvbWJpbmVkIHBsdXMgd2V5bC5cbi8vIFBlcmlvZDogMl4xOTItMl4zMlxuLy8gUmVwb3J0ZWQgdG8gZmFpbDogQ29sbGlzaW9uT3ZlciwgU2ltcFBva2VyLCBhbmQgTGluZWFyQ29tcC5cbnZhciB4b3J3b3cgPSByZXF1aXJlKCcuL2xpYi94b3J3b3cnKTtcblxuLy8geG9yc2hpZnQ3LCBieSBGcmFuw6dvaXMgUGFubmV0b24gYW5kIFBpZXJyZSBMJ2VjdXllciwgdGFrZXNcbi8vIGEgZGlmZmVyZW50IGFwcHJvYWNoOiBpdCBhZGRzIHJvYnVzdG5lc3MgYnkgYWxsb3dpbmcgbW9yZSBzaGlmdHNcbi8vIHRoYW4gTWFyc2FnbGlhJ3Mgb3JpZ2luYWwgdGhyZWUuICBJdCBpcyBhIDctc2hpZnQgZ2VuZXJhdG9yXG4vLyB3aXRoIDI1NiBiaXRzLCB0aGF0IHBhc3NlcyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RtYXRpYyBmYWlsdXJlcy5cbi8vIFBlcmlvZCAyXjI1Ni0xLlxuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB4b3JzaGlmdDcgPSByZXF1aXJlKCcuL2xpYi94b3JzaGlmdDcnKTtcblxuLy8geG9yNDA5NiwgYnkgUmljaGFyZCBCcmVudCwgaXMgYSA0MDk2LWJpdCB4b3Itc2hpZnQgd2l0aCBhXG4vLyB2ZXJ5IGxvbmcgcGVyaW9kIHRoYXQgYWxzbyBhZGRzIGEgV2V5bCBnZW5lcmF0b3IuIEl0IGFsc28gcGFzc2VzXG4vLyBCaWdDcnVzaCB3aXRoIG5vIHN5c3RlbWF0aWMgZmFpbHVyZXMuICBJdHMgbG9uZyBwZXJpb2QgbWF5XG4vLyBiZSB1c2VmdWwgaWYgeW91IGhhdmUgbWFueSBnZW5lcmF0b3JzIGFuZCBuZWVkIHRvIGF2b2lkXG4vLyBjb2xsaXNpb25zLlxuLy8gUGVyaW9kOiAyXjQxMjgtMl4zMi5cbi8vIE5vIHN5c3RlbWF0aWMgQmlnQ3J1c2ggZmFpbHVyZXMgcmVwb3J0ZWQuXG52YXIgeG9yNDA5NiA9IHJlcXVpcmUoJy4vbGliL3hvcjQwOTYnKTtcblxuLy8gVHljaGUtaSwgYnkgU2FtdWVsIE5ldmVzIGFuZCBGaWxpcGUgQXJhdWpvLCBpcyBhIGJpdC1zaGlmdGluZyByYW5kb21cbi8vIG51bWJlciBnZW5lcmF0b3IgZGVyaXZlZCBmcm9tIENoYUNoYSwgYSBtb2Rlcm4gc3RyZWFtIGNpcGhlci5cbi8vIGh0dHBzOi8vZWRlbi5kZWkudWMucHQvfnNuZXZlcy9wdWJzLzIwMTEtc25mYTIucGRmXG4vLyBQZXJpb2Q6IH4yXjEyN1xuLy8gTm8gc3lzdGVtYXRpYyBCaWdDcnVzaCBmYWlsdXJlcyByZXBvcnRlZC5cbnZhciB0eWNoZWkgPSByZXF1aXJlKCcuL2xpYi90eWNoZWknKTtcblxuLy8gVGhlIG9yaWdpbmFsIEFSQzQtYmFzZWQgcHJuZyBpbmNsdWRlZCBpbiB0aGlzIGxpYnJhcnkuXG4vLyBQZXJpb2Q6IH4yXjE2MDBcbnZhciBzciA9IHJlcXVpcmUoJy4vc2VlZHJhbmRvbScpO1xuXG5zci5hbGVhID0gYWxlYTtcbnNyLnhvcjEyOCA9IHhvcjEyODtcbnNyLnhvcndvdyA9IHhvcndvdztcbnNyLnhvcnNoaWZ0NyA9IHhvcnNoaWZ0NztcbnNyLnhvcjQwOTYgPSB4b3I0MDk2O1xuc3IudHljaGVpID0gdHljaGVpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNyO1xuIiwiaW1wb3J0IEZha2VUaW1lcnMgZnJvbSAnZmFrZS10aW1lcnMnO1xuaW1wb3J0IENhbnZhc0hvb2sgZnJvbSAnY2FudmFzLWhvb2snO1xuaW1wb3J0IFBlcmZTdGF0cyBmcm9tICdwZXJmb3JtYW5jZS1zdGF0cyc7XG5pbXBvcnQgc2VlZHJhbmRvbSBmcm9tICdzZWVkcmFuZG9tJztcbi8vIGltcG9ydCBpbyBmcm9tICdzb2NrZXQuaW8tY2xpZW50JztcblxuLy8tLS0tLS0tLS0tLS0tLS0tLVxuXG52YXIgcmFuZG9tU2VlZCA9IDE7XG5NYXRoLnJhbmRvbSA9IHNlZWRyYW5kb20ocmFuZG9tU2VlZCk7XG5cbi8vIFRJQ0tcbi8vIEhvbGRzIHRoZSBhbW91bnQgb2YgdGltZSBpbiBtc2VjcyB0aGF0IHRoZSBwcmV2aW91c2x5IHJlbmRlcmVkIGZyYW1lIHRvb2suIFVzZWQgdG8gZXN0aW1hdGUgd2hlbiBhIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIChmYXN0IGZyYW1lIGZvbGxvd2VkIGJ5IGEgc2xvdyBmcmFtZSlcbnZhciBsYXN0RnJhbWVEdXJhdGlvbiA9IC0xO1xuXG4vLyBXYWxsY2xvY2sgdGltZSBmb3Igd2hlbiB0aGUgcHJldmlvdXMgZnJhbWUgZmluaXNoZWQuXG52YXIgbGFzdEZyYW1lVGljayA9IC0xO1xuXG52YXIgYWNjdW11bGF0ZWRDcHVJZGxlVGltZSA9IDA7XG5cbi8vIEtlZXBzIHRyYWNrIG9mIHBlcmZvcm1hbmNlIHN0dXR0ZXIgZXZlbnRzLiBBIHN0dXR0ZXIgZXZlbnQgb2NjdXJzIHdoZW4gdGhlcmUgaXMgYSBoaWNjdXAgaW4gc3Vic2VxdWVudCBwZXItZnJhbWUgdGltZXMuIChmYXN0IGZvbGxvd2VkIGJ5IHNsb3cpXG52YXIgbnVtU3R1dHRlckV2ZW50cyA9IDA7XG5cbnZhciBUZXN0ZXJDb25maWcgPSB7XG4gIGRvbnRPdmVycmlkZVRpbWU6IGZhbHNlXG59O1xuXG4vLyBNZWFzdXJlIGEgXCJ0aW1lIHVudGlsIHNtb290aCBmcmFtZSByYXRlXCIgcXVhbnRpdHksIGkuZS4gdGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd2UgY29uc2lkZXIgdGhlIHN0YXJ0dXAgSklUIGFuZCBHQyBlZmZlY3RzIHRvIGhhdmUgc2V0dGxlZC5cbi8vIFRoaXMgZmllbGQgdHJhY2tzIGhvdyBtYW55IGNvbnNlY3V0aXZlIGZyYW1lcyBoYXZlIHJ1biBzbW9vdGhseS4gVGhpcyB2YXJpYWJsZSBpcyBzZXQgdG8gLTEgd2hlbiBzbW9vdGggZnJhbWUgcmF0ZSBoYXMgYmVlbiBhY2hpZXZlZCB0byBkaXNhYmxlIHRyYWNraW5nIHRoaXMgZnVydGhlci5cbnZhciBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IDA7XG5cbmNvbnN0IG51bUZhc3RGcmFtZXNOZWVkZWRGb3JTbW9vdGhGcmFtZVJhdGUgPSAxMjA7IC8vIFJlcXVpcmUgMTIwIGZyYW1lcyBpLmUuIH4yIHNlY29uZHMgb2YgY29uc2VjdXRpdmUgc21vb3RoIHN0dXR0ZXIgZnJlZSBmcmFtZXMgdG8gY29uY2x1ZGUgd2UgaGF2ZSByZWFjaGVkIGEgc3RhYmxlIGFuaW1hdGlvbiByYXRlLlxuXG5DYW52YXNIb29rLmVuYWJsZSgpO1xuXG5pZiAoIVRlc3RlckNvbmZpZy5kb250T3ZlcnJpZGVUaW1lKVxue1xuICBGYWtlVGltZXJzLmVuYWJsZSgpO1xufVxuXG52YXIgd2ViZ2xDb250ZXh0ID0gbnVsbDtcblxuXG5cblxuXG4vLyBpZiAoaW5qZWN0aW5nSW5wdXRTdHJlYW0gfHwgcmVjb3JkaW5nSW5wdXRTdHJlYW0pIHtcblxuLy8gVGhpcyBpcyBhbiB1bmF0dGVuZGVkIHJ1biwgZG9uJ3QgYWxsb3cgd2luZG93LmFsZXJ0KClzIHRvIGludHJ1ZGUuXG53aW5kb3cuYWxlcnQgPSBmdW5jdGlvbihtc2cpIHsgY29uc29sZS5lcnJvcignd2luZG93LmFsZXJ0KCcgKyBtc2cgKyAnKScpOyB9XG53aW5kb3cuY29uZmlybSA9IGZ1bmN0aW9uKG1zZykgeyBjb25zb2xlLmVycm9yKCd3aW5kb3cuY29uZmlybSgnICsgbXNnICsgJyknKTsgcmV0dXJuIHRydWU7IH1cblxuZnVuY3Rpb24gZW11bml0dGVzdFJlcG9ydEN1c3RvbUJsb2NrRHVyYXRpb24oKSB7XG4gIGNvbnNvbGUubG9nKGFyZ3VtZW50cyk7XG59XG5cbndpbmRvdy5URVNURVIgPSB7XG4gIC8vIEN1cnJlbnRseSBleGVjdXRpbmcgZnJhbWUuXG4gIHJlZmVyZW5jZVRlc3RGcmFtZU51bWJlcjogMCxcbiAgbnVtRnJhbWVzVG9SZW5kZXI6IDEwMCxcblxuICB0aWNrOiBmdW5jdGlvbiAoKSB7XG5cbiAgICAtLXJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQ7XG5cbiAgICBpZiAocmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA+IDApXG4gICAgICByZXR1cm47IC8vIFdlIGFyZSBiZWluZyBjYWxsZWQgcmVjdXJzaXZlbHksIHNvIGlnbm9yZSB0aGlzIGNhbGwuXG4vKiAgICBcbiAgXG4gICAgaWYgKCFydW50aW1lSW5pdGlhbGl6ZWQpIHJldHVybjtcbiAgICBlbnN1cmVOb0NsaWVudEhhbmRsZXJzKCk7XG4qLyAgXG4gICAgdmFyIHRpbWVOb3cgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG5cblxuICAgIHZhciBmcmFtZUR1cmF0aW9uID0gdGltZU5vdyAtIGxhc3RGcmFtZVRpY2s7XG4gICAgbGFzdEZyYW1lVGljayA9IHRpbWVOb3c7XG4gICAgaWYgKHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID4gNSAmJiBsYXN0RnJhbWVEdXJhdGlvbiA+IDApIHtcbiAgICAgIGlmIChmcmFtZUR1cmF0aW9uID4gMjAuMCAmJiBmcmFtZUR1cmF0aW9uID4gbGFzdEZyYW1lRHVyYXRpb24gKiAxLjM1KSB7XG4gICAgICAgIG51bVN0dXR0ZXJFdmVudHMrKztcbiAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzICE9IC0xKSBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobnVtQ29uc2VjdXRpdmVTbW9vdGhGcmFtZXMgIT0gLTEpIHtcbiAgICAgICAgICBudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcysrO1xuICAgICAgICAgIGlmIChudW1Db25zZWN1dGl2ZVNtb290aEZyYW1lcyA+PSBudW1GYXN0RnJhbWVzTmVlZGVkRm9yU21vb3RoRnJhbWVSYXRlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGltZVVudGlsU21vb3RoRnJhbWVyYXRlJywgdGltZU5vdyAtIGZpcnN0RnJhbWVUaW1lKTtcbiAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU21vb3RoRnJhbWVzID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RGcmFtZUR1cmF0aW9uID0gZnJhbWVEdXJhdGlvbjtcbi8qXG4gICAgaWYgKG51bVByZWxvYWRYSFJzSW5GbGlnaHQgPT0gMCkgeyAvLyBJbXBvcnRhbnQhIFRoZSBmcmFtZSBudW1iZXIgYWR2YW5jZXMgb25seSBmb3IgdGhvc2UgZnJhbWVzIHRoYXQgdGhlIGdhbWUgaXMgbm90IHdhaXRpbmcgZm9yIGRhdGEgZnJvbSB0aGUgaW5pdGlhbCBuZXR3b3JrIGRvd25sb2Fkcy5cbiAgICAgIGlmIChudW1TdGFydHVwQmxvY2tlclhIUnNQZW5kaW5nID09IDApICsrdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXI7IC8vIEFjdHVhbCByZWZ0ZXN0IGZyYW1lIGNvdW50IG9ubHkgaW5jcmVtZW50cyBhZnRlciBnYW1lIGhhcyBjb25zdW1lZCBhbGwgdGhlIGNyaXRpY2FsIFhIUnMgdGhhdCB3ZXJlIHRvIGJlIHByZWxvYWRlZC5cbiAgICAgICsrZmFrZWRUaW1lOyAvLyBCdXQgZ2FtZSB0aW1lIGFkdmFuY2VzIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBwcmVsb2FkYWJsZSBYSFJzIGFyZSBmaW5pc2hlZC5cbiAgICB9XG4qL1xuICAgIHRoaXMucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyKys7XG4gICAgRmFrZVRpbWVycy5mYWtlZFRpbWUrKzsgLy8gQnV0IGdhbWUgdGltZSBhZHZhbmNlcyBpbW1lZGlhdGVseSBhZnRlciB0aGUgcHJlbG9hZGFibGUgWEhScyBhcmUgZmluaXNoZWQuXG4gIFxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gMSkge1xuICAgICAgZmlyc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgICBjb25zb2xlLmxvZygnRmlyc3QgZnJhbWUgc3VibWl0dGVkIGF0IChtcyk6JywgZmlyc3RGcmFtZVRpbWUgLSBwYWdlSW5pdFRpbWUpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlZmVyZW5jZVRlc3RGcmFtZU51bWJlciA9PT0gdGhpcy5udW1GcmFtZXNUb1JlbmRlcikge1xuICAgICAgVEVTVEVSLmRvUmVmZXJlbmNlVGVzdCgpO1xuICAgIH1cblxuICAgIC8vIFdlIHdpbGwgYXNzdW1lIHRoYXQgYWZ0ZXIgdGhlIHJlZnRlc3QgdGljaywgdGhlIGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaWRsZSB0byB3YWl0IGZvciBuZXh0IGV2ZW50LlxuICAgIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcblxuICB9LFxuICBkb1JlZmVyZW5jZVRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSBDYW52YXNIb29rLndlYmdsQ29udGV4dC5jYW52YXM7XG4gICAgXG4gICAgLy8gR3JhYiByZW5kZXJlZCBXZWJHTCBmcm9udCBidWZmZXIgaW1hZ2UgdG8gYSBKUy1zaWRlIGltYWdlIG9iamVjdC5cbiAgICB2YXIgYWN0dWFsSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcblxuICAgIGZ1bmN0aW9uIHJlZnRlc3QgKCkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYWN0dWFsSW1hZ2UpO1xuICAgICAgYWN0dWFsSW1hZ2Uuc3R5bGUuY3NzVGV4dD1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDtyaWdodDowO3RvcDowO2JvdHRvbTowO3otaW5kZXg6OTk5OTA7d2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtiYWNrZ3JvdW5kLWNvbG9yOiM5OTk7Zm9udC1zaXplOjEwMHB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmb250LWZhbWlseTpzYW5zLXNlcmlmXCI7XG4gICAgICBURVNURVIuc3RhdHMudGltZUdlbmVyYXRpbmdSZWZlcmVuY2VJbWFnZXMgKz0gcGVyZm9ybWFuY2UucmVhbE5vdygpIC0gaW5pdDtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW5pdCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICAgIGFjdHVhbEltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gICAgICBhY3R1YWxJbWFnZS5vbmxvYWQgPSByZWZ0ZXN0O1xuICAgICAgVEVTVEVSLnN0YXRzLnRpbWVHZW5lcmF0aW5nUmVmZXJlbmNlSW1hZ2VzICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIGluaXQ7XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICAvL3JlZnRlc3QoKTsgLy8gY2FudmFzLnRvRGF0YVVSTCgpIGxpa2VseSBmYWlsZWQsIHJldHVybiByZXN1bHRzIGltbWVkaWF0ZWx5LlxuICAgIH1cbiAgXG4gIH0sXG5cbiAgaW5pdFNlcnZlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZXJ2ZXJVcmwgPSAnaHR0cDovLycgKyBHRlhQRVJGVEVTVF9DT05GSUcuc2VydmVySVAgKyAnOjg4ODgnO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBpby5jb25uZWN0KHNlcnZlclVybCk7XG4gICAgdGhpcy5zdGF0cyA9IG5ldyBQZXJmU3RhdHMoKTtcblxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB0ZXN0aW5nIHNlcnZlcicpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdlcnJvcicsIChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIH0pO1xuICAgIFxuICAgIHRoaXMuc29ja2V0Lm9uKCdjb25uZWN0X2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfSk7XG4gIH0sXG4gIGJlbmNobWFya0ZpbmlzaGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpbWVFbmQgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCk7XG4gICAgdmFyIHRvdGFsVGltZSA9IHRpbWVFbmQgLSBwYWdlSW5pdFRpbWU7IC8vIFRvdGFsIHRpbWUsIGluY2x1ZGluZyBldmVyeXRoaW5nLlxuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1Rlc3QgZmluaXNoZWQhJyk7XG4gICAgZGl2LmFwcGVuZENoaWxkKHRleHQpO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3JpZ2h0OjA7dG9wOjA7Ym90dG9tOjA7ei1pbmRleDo5OTk5O2JhY2tncm91bmQtY29sb3I6Izk5OTtmb250LXNpemU6MTAwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZvbnQtZmFtaWx5OnNhbnMtc2VyaWZcIjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgLy8gY29uc29sZS5sb2coJ1RpbWUgc3BlbnQgZ2VuZXJhdGluZyByZWZlcmVuY2UgaW1hZ2VzOicsIFRFU1RFUi5zdGF0cy50aW1lR2VuZXJhdGluZ1JlZmVyZW5jZUltYWdlcyk7XG5cbiAgICB2YXIgdG90YWxSZW5kZXJUaW1lID0gdGltZUVuZCAtIGZpcnN0RnJhbWVUaW1lO1xuICAgIHZhciBjcHVJZGxlID0gYWNjdW11bGF0ZWRDcHVJZGxlVGltZSAqIDEwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIHZhciBmcHMgPSB0aGlzLm51bUZyYW1lc1RvUmVuZGVyICogMTAwMC4wIC8gdG90YWxSZW5kZXJUaW1lO1xuICAgIFxuICAgIHZhciBkYXRhID0ge1xuICAgICAgdGVzdF9pZDogR0ZYUEVSRlRFU1RfQ09ORklHLnRlc3RfaWQsXG4gICAgICB2YWx1ZXM6IHRoaXMuc3RhdHMuZ2V0U3RhdHNTdW1tYXJ5KCksXG4gICAgICBudW1GcmFtZXM6IHRoaXMubnVtRnJhbWVzVG9SZW5kZXIsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRpbWVUb0ZpcnN0RnJhbWU6IGZpcnN0RnJhbWVUaW1lIC0gcGFnZUluaXRUaW1lLFxuICAgICAgbG9nczogdGhpcy5sb2dzLFxuICAgICAgYXZnRnBzOiBmcHMsXG4gICAgICBudW1TdHV0dGVyRXZlbnRzOiBudW1TdHV0dGVyRXZlbnRzLFxuICAgICAgcmVzdWx0OiAnUEFTUycsXG4gICAgICB0b3RhbFRpbWU6IHRvdGFsVGltZSxcbiAgICAgIHRvdGFsUmVuZGVyVGltZTogdG90YWxSZW5kZXJUaW1lLFxuICAgICAgY3B1VGltZTogdGhpcy5zdGF0cy50b3RhbFRpbWVJbk1haW5Mb29wLFxuICAgICAgY3B1SWRsZVRpbWU6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wLFxuICAgICAgY3B1SWRsZVBlcmM6IHRoaXMuc3RhdHMudG90YWxUaW1lT3V0c2lkZU1haW5Mb29wICogMTAwIC8gdG90YWxSZW5kZXJUaW1lLFxuICAgICAgcGFnZUxvYWRUaW1lOiBwYWdlTG9hZFRpbWUsXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19maW5pc2gnLCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZygnRmluaXNoZWQhJywgZGF0YSk7XG4gICAgdGhpcy5zb2NrZXQuZGlzY29ubmVjdCgpO1xuICB9LFxuICB3cmFwRXJyb3JzOiBmdW5jdGlvbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IgPT4gZXZ0LmxvZ3MuY2F0Y2hFcnJvcnMgPSB7XG4gICAgICBtZXNzYWdlOiBldnQuZXJyb3IubWVzc2FnZSxcbiAgICAgIHN0YWNrOiBldnQuZXJyb3Iuc3RhY2ssXG4gICAgICBsaW5lbm86IGV2dC5lcnJvci5saW5lbm8sXG4gICAgICBmaWxlbmFtZTogZXZ0LmVycm9yLmZpbGVuYW1lXG4gICAgfSk7XG5cbiAgICB2YXIgd3JhcEZ1bmN0aW9ucyA9IFsnZXJyb3InLCd3YXJuaW5nJywnbG9nJ107XG4gICAgd3JhcEZ1bmN0aW9ucy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGVba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgZm4gPSBjb25zb2xlW2tleV0uYmluZChjb25zb2xlKTtcbiAgICAgICAgY29uc29sZVtrZXldID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBpZiAoa2V5ID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ3MuZXJyb3JzLnB1c2goYXJncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICd3YXJuaW5nJykge1xuICAgICAgICAgICAgdGhpcy5sb2dzLndhcm5pbmdzLnB1c2goYXJncyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5zZW5kTG9nKVxuICAgICAgICAgICAgVEVTVEVSLnNvY2tldC5lbWl0KCdsb2cnLCBhcmdzKTtcblxuICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5pbml0U2VydmVyKCk7XG5cbiAgICB0aGlzLnRpbWVTdGFydCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdGVyX2luaXQnLCAoKSA9PiB7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxvZ3MgPSB7XG4gICAgICBlcnJvcnM6IFtdLFxuICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgY2F0Y2hFcnJvcnM6IFtdXG4gICAgfTtcbiAgICB0aGlzLndyYXBFcnJvcnMoKTtcblxuICAgIHRoaXMuc29ja2V0LmVtaXQoJ2JlbmNobWFya19zdGFydGVkJywge2lkOiBHRlhQRVJGVEVTVF9DT05GSUcudGVzdF9pZH0pO1xuXG4gICAgdGhpcy5zb2NrZXQub24oJ25leHRfYmVuY2htYXJrJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCdodHRwOi8vdGhyZWVqcy5vcmcnKTtcbiAgICAgIGNvbnNvbGUubG9nKCduZXh0X2JlbmNobWFyaycsIGRhdGEpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoZGF0YS51cmwpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5yZWZlcmVuY2VUZXN0RnJhbWVOdW1iZXIgPSAwO1xuICB9LFxufTtcblxudmFyIGZpcnN0RnJhbWVUaW1lID0gbnVsbDtcblxuVEVTVEVSLmluaXQoKTtcblxuVGVzdGVyQ29uZmlnLnByZU1haW5Mb29wID0gKCkgPT4geyBURVNURVIuc3RhdHMuZnJhbWVTdGFydCgpOyB9O1xuVGVzdGVyQ29uZmlnLnBvc3RNYWluTG9vcCA9ICgpID0+IHtURVNURVIuc3RhdHMuZnJhbWVFbmQoKTsgfTtcblxuaWYgKCFUZXN0ZXJDb25maWcucHJvdmlkZXNSYWZJbnRlZ3JhdGlvbikge1xuICBpZiAoIXdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgd2luZG93LnJlYWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjYWxsYmFjayA9PiB7XG4gICAgICBjb25zdCBob29rZWRDYWxsYmFjayA9IHAgPT4ge1xuICAgICAgICBpZiAoVGVzdGVyQ29uZmlnLnByZU1haW5Mb29wKSB7IFRlc3RlckNvbmZpZy5wcmVNYWluTG9vcCgpOyB9XG4gICAgICAgIGlmIChUZXN0ZXJDb25maWcucmVmZXJlbmNlVGVzdFByZVRpY2spIHsgVGVzdGVyQ29uZmlnLnJlZmVyZW5jZVRlc3RQcmVUaWNrKCk7IH1cbiAgXG4gICAgICAgIGlmIChURVNURVIucmVmZXJlbmNlVGVzdEZyYW1lTnVtYmVyID09PSBURVNURVIubnVtRnJhbWVzVG9SZW5kZXIpIHtcbiAgICAgICAgICBURVNURVIuYmVuY2htYXJrRmluaXNoZWQoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgXG4gICAgICAgIGNhbGxiYWNrKHBlcmZvcm1hbmNlLm5vdygpKTtcbiAgICAgICAgVEVTVEVSLnRpY2soKTtcbiAgXG4gICAgICAgIGlmIChUZXN0ZXJDb25maWcucmVmZXJlbmNlVGVzdFRpY2spIHsgVGVzdGVyQ29uZmlnLnJlZmVyZW5jZVRlc3RUaWNrKCk7IH1cbiAgICAgICAgaWYgKFRlc3RlckNvbmZpZy5wb3N0TWFpbkxvb3ApIHsgVGVzdGVyQ29uZmlnLnBvc3RNYWluTG9vcCgpOyB9XG4gIFxuICAgICAgfVxuICAgICAgcmV0dXJuIHdpbmRvdy5yZWFsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhvb2tlZENhbGxiYWNrKTtcbiAgICB9XG4gIH1cbn1cblxuXG4vLyBHdWFyZCBhZ2FpbnN0IHJlY3Vyc2l2ZSBjYWxscyB0byByZWZlcmVuY2VUZXN0UHJlVGljaytyZWZlcmVuY2VUZXN0VGljayBmcm9tIG11bHRpcGxlIHJBRnMuXG52YXIgcmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudCA9IDA7XG5cbi8vIFdhbGxjbG9jayB0aW1lIGZvciB3aGVuIHdlIHN0YXJ0ZWQgQ1BVIGV4ZWN1dGlvbiBvZiB0aGUgY3VycmVudCBmcmFtZS5cbnZhciByZWZlcmVuY2VUZXN0VDAgPSAtMTtcblxuZnVuY3Rpb24gcmVmZXJlbmNlVGVzdFByZVRpY2soKSB7XG4gICsrcmVmZXJlbmNlVGVzdFByZVRpY2tDYWxsZWRDb3VudDtcbiAgaWYgKHJlZmVyZW5jZVRlc3RQcmVUaWNrQ2FsbGVkQ291bnQgPT0gMSkge1xuICAgIHJlZmVyZW5jZVRlc3RUMCA9IHBlcmZvcm1hbmNlLnJlYWxOb3coKTtcbiAgICBpZiAocGFnZUxvYWRUaW1lID09PSBudWxsKSBwYWdlTG9hZFRpbWUgPSBwZXJmb3JtYW5jZS5yZWFsTm93KCkgLSBwYWdlSW5pdFRpbWU7XG5cbiAgICAvLyBXZSB3aWxsIGFzc3VtZSB0aGF0IGFmdGVyIHRoZSByZWZ0ZXN0IHRpY2ssIHRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGlkbGUgdG8gd2FpdCBmb3IgbmV4dCBldmVudC5cbiAgICBpZiAocHJldmlvdXNFdmVudEhhbmRsZXJFeGl0ZWRUaW1lICE9IC0xKSB7XG4gICAgICBhY2N1bXVsYXRlZENwdUlkbGVUaW1lICs9IHBlcmZvcm1hbmNlLnJlYWxOb3coKSAtIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZTtcbiAgICAgIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IC0xO1xuICAgIH1cbiAgfVxufVxuVGVzdGVyQ29uZmlnLnJlZmVyZW5jZVRlc3RQcmVUaWNrID0gcmVmZXJlbmNlVGVzdFByZVRpY2s7XG5cbi8vIElmIC0xLCB3ZSBhcmUgbm90IHJ1bm5pbmcgYW4gZXZlbnQuIE90aGVyd2lzZSByZXByZXNlbnRzIHRoZSB3YWxsY2xvY2sgdGltZSBvZiB3aGVuIHdlIGV4aXRlZCB0aGUgbGFzdCBldmVudCBoYW5kbGVyLlxudmFyIHByZXZpb3VzRXZlbnRIYW5kbGVyRXhpdGVkVGltZSA9IC0xO1xuXG52YXIgcGFnZUluaXRUaW1lID0gcGVyZm9ybWFuY2UucmVhbE5vdygpO1xuXG4vLyBXYWxsY2xvY2sgdGltZSBkZW5vdGluZyB3aGVuIHRoZSBwYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLlxudmFyIHBhZ2VMb2FkVGltZSA9IG51bGw7Il0sIm5hbWVzIjpbIlN0YXRzIiwidGhpcyIsImRlZmluZSIsInJlcXVpcmUkJDAiLCJzciIsInNlZWRyYW5kb20iLCJQZXJmU3Rh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RyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQixFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQixFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNsQixFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixFQUFFLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwQixJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtHQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDO0VBQ2I7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtHQUNsQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7R0FDWixPQUFPLENBQUMsQ0FBQztFQUNWOztDQUVELFNBQVMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7R0FDeEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO09BQ25CLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUs7T0FDMUIsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUM7R0FDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFXLElBQUksQ0FBQyxDQUFDLEdBQUU7R0FDakUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXO0tBQ3ZCLE9BQU8sSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxRQUFRLEdBQUcsQ0FBQyxJQUFJLHNCQUFzQixDQUFDO0lBQ2xFLENBQUM7R0FDRixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUNsQixJQUFJLEtBQUssRUFBRTtLQUNULElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRTtJQUNqRDtHQUNELE9BQU8sSUFBSSxDQUFDO0VBQ2I7O0NBRUQsU0FBUyxJQUFJLEdBQUc7R0FDZCxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUM7O0dBRW5CLElBQUksSUFBSSxHQUFHLFNBQVMsSUFBSSxFQUFFO0tBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7T0FDcEMsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDeEIsSUFBSSxDQUFDLEdBQUcsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO09BQ2hDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ1osQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNQLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDUCxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNaLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDUCxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQztNQUN0QjtLQUNELE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLHNCQUFzQixDQUFDO0lBQzNDLENBQUM7O0dBRUYsT0FBTyxJQUFJLENBQUM7RUFDYjs7O0NBR0QsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtHQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztFQUN2QixNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7R0FDL0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyQyxNQUFNO0dBQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDbEI7O0VBRUE7R0FDQ0MsY0FBSTtHQUNKLEFBQStCLE1BQU07R0FDckMsQ0FBQyxPQUFPQyxTQUFNLEtBQUssVUFBVSxBQUFVO0VBQ3hDLENBQUM7Ozs7Q0MvR0Y7OztDQUdBLENBQUMsU0FBUyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0dBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOztHQUU1QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0dBR1QsRUFBRSxDQUFDLElBQUksR0FBRyxXQUFXO0tBQ25CLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUM1QixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDWixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDWixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDWixPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7O0dBRUYsSUFBSSxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFOztLQUV2QixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNiLE1BQU07O0tBRUwsT0FBTyxJQUFJLElBQUksQ0FBQztJQUNqQjs7O0dBR0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0tBQzVDLEVBQUUsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ1g7RUFDRjs7Q0FFRCxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0dBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLE9BQU8sQ0FBQyxDQUFDO0VBQ1Y7O0NBRUQsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtHQUN4QixJQUFJLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7T0FDckIsS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSztPQUMxQixJQUFJLEdBQUcsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7R0FDbEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXO0tBQ3ZCLEdBQUc7T0FDRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtXQUN0QixHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLFdBQVc7V0FDckMsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7TUFDdEMsUUFBUSxNQUFNLEtBQUssQ0FBQyxFQUFFO0tBQ3ZCLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztHQUNGLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztHQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUNsQixJQUFJLEtBQUssRUFBRTtLQUNULElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztLQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRTtJQUNqRDtHQUNELE9BQU8sSUFBSSxDQUFDO0VBQ2I7O0NBRUQsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtHQUM1QixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztFQUN2QixNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUU7R0FDL0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyQyxNQUFNO0dBQ0wsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDcEI7O0VBRUE7R0FDQ0QsY0FBSTtHQUNKLEFBQStCLE1BQU07R0FDckMsQ0FBQyxPQUFPQyxTQUFNLEtBQUssVUFBVSxBQUFVO0VBQ3hDLENBQUM7Ozs7Q0M5RUY7OztDQUdBLENBQUMsU0FBUyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTs7Q0FFbEMsU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0dBQ3BCLElBQUksRUFBRSxHQUFHLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxDQUFDOzs7R0FHNUIsRUFBRSxDQUFDLElBQUksR0FBRyxXQUFXO0tBQ25CLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNuRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDOUIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQzs7R0FFRixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQ1QsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDVCxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNULEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztHQUVULElBQUksSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRTs7S0FFdkIsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDYixNQUFNOztLQUVMLE9BQU8sSUFBSSxJQUFJLENBQUM7SUFDakI7OztHQUdELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUM1QyxFQUFFLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2xDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7T0FDdkIsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztNQUNoQztLQUNELEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNYO0VBQ0Y7O0NBRUQsU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtHQUNsQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixPQUFPLENBQUMsQ0FBQztFQUNWOztD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
