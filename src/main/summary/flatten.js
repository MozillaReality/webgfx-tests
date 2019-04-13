module.exports = function flatten(results) {
  return results.map(test => {
    var values = {};
    var statsAttrs = [
      'avgFps', 'numStutterEvents', 'totalRenderTime', 'cpuTime', 'cpuIdleTime', 'cpuIdlePerc', 'pageLoadTime', 'diffPerc', 'numDiffPixels', 'totalTime', 'timeToFirstFrame'
    ];
    statsAttrs.forEach(attr => {
      if (attr in test) {
        values[attr] = test[attr];
      }
    })

    for (let id in test.stats.perf) {
      values[id] = test.stats.perf[id].avg;
    }
    for (let id in test.stats.webgl) {
      values['webgl_' + id] = test.stats.webgl[id].avg;
    }

    for (let id in test.webaudio) {
      values['webaudio_' + id] = test.webaudio[id];
    }

    return {
      values: values,
      info: {
        test: {
          name: test.test_id,
          //testUUID: test.testUUID
        },
        browser: test.browser,
        device: test.device
      }
    };
  });
}
