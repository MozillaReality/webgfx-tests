/*
// Extracts the value of a GET parameter foo.html?key=value passed to this URL, or defaultIfMissing if it doesn't exist
// Keys are treated as case insensitive.
function readGetParamValue(getParamName, defaultIfMissing) {
  // Handle foo.html?key=value
  var p = getParamName.toLowerCase();
  var i = location.search.indexOf(p + '=');
  if (i != -1) {
    var value = location.search.substring(i + p.length + 1);
    if (value.indexOf('&') != -1) value = value.substring(0, value.indexOf('&'));
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    if (!isNaN(value)) return parseInt(value);
    else return value;
  }
  // Handle foo.html?key&key2&key3 to mean key=true.
  if (location.search.indexOf(p) != -1) return true;
  return defaultIfMissing;
}
*/

/*

// If true, the page is run in a record mode where user interactively runs the page, and input stream is captured. Use this in
// when authoring new tests to the suite.
var recordingInputStream = readGetParamValue('record');

// If true, we are autoplaybacking a recorded input stream. If false, input is not injected (we are likely running in an interactive examination mode of a test)
var injectingInputStream = readGetParamValue('playback');

// Allow disabling audio altogether on the page to enable profiling what kind of performance/correctness effect it may have on execution.
var disableAudio = readGetParamValue('noaudio');
Module['disableAudio'] = disableAudio;
*/

/*

// In test mode (injectingInputStream == true), we always render this many fixed frames, after which the test is considered finished.
// ?numframes=number GET parameter can override custom test length.
var numFramesToRender = Module['overrideNumFramesToRender'] > 0 ? Module['overrideNumFramesToRender'] : 2000;
numFramesToRender = readGetParamValue('numframes', numFramesToRender);
*/

/*
// Guard against recursive calls to referenceTestPreTick+referenceTestTick from multiple rAFs.
var referenceTestPreTickCalledCount = 0;

// Wallclock time denoting when the page has finished loading.
var pageLoadTime = null;

// Tallies up the amount of CPU time spent in the test.
var accumulatedCpuTime = 0;

// Some tests need to receive a monotonously increasing time counter, but can't pass real wallclock time, which would make the test timing-dependent, so instead
// craft an arbitrary increasing counter.
var fakedTime = 0;

// Tracks when Emscripten runtime has been loaded up. (main() called)
var runtimeInitialized = 0;

// Keeps track of performance stutter events. A stutter event occurs when there is a hiccup in subsequent per-frame times. (fast followed by slow)
var numStutterEvents = 0;

// Measure a "time until smooth frame rate" quantity, i.e. the time after which we consider the startup JIT and GC effects to have settled.
// This field tracks how many consecutive frames have run smoothly. This variable is set to -1 when smooth frame rate has been achieved to disable tracking this further.
var numConsecutiveSmoothFrames = 0;

const numFastFramesNeededForSmoothFrameRate = 120; // Require 120 frames i.e. ~2 seconds of consecutive smooth stutter free frames to conclude we have reached a stable animation rate.

var registeredEventListeners = [];

*/



/*
/////
// Math
////
// Different browsers have different precision with Math functions. Therefore
// reduce precision to lowest common denominator.
function injectMathFunc(f) {
  var rf = 'real_' + f;
  Math[rf] = Math[f];
  switch(Math[f].length) {
    case 1: Math[f] = function(a1) { return Math.ceil(Math[rf](a1) * 10000) / 10000; }; break;
    case 2: Math[f] = function(a1, a2) { return Math.ceil(Math[rf](a1, a2) * 10000) / 10000; }; break;
    default: throw 'Failed to hook into Math!';
  }
}

if (Module['injectMathFunctions'] && (recordingInputStream || injectingInputStream)) {
  var mathFuncs = ['acos', 'acosh', 'asin', 'asinh', 'atan', 'atanh', 'atan2', 'cbrt', 'cos', 'cosh', 'exp', 'expm1', 'log', 'log1p', 'log10', 'log2', 'pow', 'sin', 'sinh', 'sqrt', 'tan', 'tanh'];
  for(var i in mathFuncs) injectMathFunc(mathFuncs[i]);
}
*/

