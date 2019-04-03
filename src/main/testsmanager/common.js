const addGET = require('../../frontapp/utils').addGET;

function camelCaseToDash (str) {
  return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()
}

function buildTestURL(baseURL, test, mode, options, progress) {
  //var url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url;
  var url = '';

  function getOption(name) {
    if (typeof options[name] !== 'undefined') {
      var value = options[name];
      delete options[name];
      return value;
    }
    return test[name];
  }
  // if verbose console.log(options);

  if (mode !== 'interactive') {
    if (getOption('autoenterXR')) url = addGET(url, 'autoenter-xr=true');
    if (getOption('numFrames')) url = addGET(url, 'num-frames=' + getOption('numFrames'));
    if (getOption('canvasWidth')) url = addGET(url, 'width=' + getOption('canvasWidth'));
    if (getOption('canvasHeight')) url = addGET(url, 'height=' + getOption('canvasHeight'));

    if (getOption('fakeWebGL')) url = addGET(url, 'fake-webgl');

    if (getOption('fakeWebAudio')) url = addGET(url, 'fake-webaudio');

    if (mode === 'record') {
      url = addGET(url, 'recording');
    } else if (test.input && mode === 'replay') {
      url = addGET(url, 'replay');
      if (getOption('showKeys')) url = addGET(url, 'show-keys');
      if (getOption('showMouse')) url = addGET(url, 'show-mouse');
    }

    if (getOption('noCloseOnFail')) url = addGET(url, 'no-close-on-fail');
    if (test.skipReferenceImageTest) url = addGET(url, 'skip-reference-image-test');
    if (test.referenceImage) url = addGET(url, 'reference-image');

    if (progress) {
      url = addGET(url, 'order-test=' + progress.tests[test.id].current + '&total-test=' + progress.tests[test.id].total);
      url = addGET(url, 'order-global=' + progress.currentGlobal + '&total-global=' + progress.totalGlobal);
    }

    if (getOption('infoOverlay')) {
      url = addGET(url, 'info-overlay=' + encodeURI(getOption('infoOverlay')));
    }

    Object.keys(options).forEach(key => {
      var keyConverted = camelCaseToDash(key);
      url = addGET(url, keyConverted + (typeof options[key] === 'undefined' ? '' : '=' + options[key]));
    });
    //@todo Log if verbose
    console.log('Generated URL: ', url);
  }

  url = baseURL + (mode === 'interactive' ? 'static/': 'tests/') + test.url + (test.url.indexOf('?') !== -1 ? '' : '?') + url;
  return url;
}

module.exports = {
  buildTestURL: buildTestURL
};
