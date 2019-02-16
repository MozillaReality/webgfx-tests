const addGET = require('../../frontapp/utils').addGET;

function buildTestURL(baseURL, test, mode, options, progress) {
  //var url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url;
  var url = '';

  if (mode !== 'interactive') {
    if (test.numframes) url = addGET(url, 'num-frames=' + test.numframes);
    if (test.windowsize) url = addGET(url, 'width=' + test.windowsize.width + '&height=' + test.windowsize.height);  
    if (options.fakeWebGL) url = addGET(url, 'fake-webgl');
  
    if (mode === 'record') {
      url = addGET(url, 'recording');
    } else if (test.input && mode === 'replay') {
      url = addGET(url, 'replay');
      if (options.showKeys) url = addGET(url, 'show-keys');
      if (options.showMouse) url = addGET(url, 'show-mouse');
    }
  
    if (options.noCloseOnFail) url = addGET(url, 'no-close-on-fail');
    if (test.skipReferenceImageTest) url = addGET(url, 'skip-reference-image-test');
    if (test.referenceImage) url = addGET(url, 'reference-image');
  
    if (progress) {
      url = addGET(url, 'order-test=' + progress.tests[test.id].current + '&total-test=' + progress.tests[test.id].total);
      url = addGET(url, 'order-global=' + progress.currentGlobal + '&total-global=' + progress.totalGlobal);
    }

    if (options.infoOverlay) {
      url = addGET(url, 'info-overlay=' + encodeURI(options.infoOverlay));
    }

    url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url + url;
  }
  return url;
}

module.exports = {
  buildTestURL: buildTestURL  
};
