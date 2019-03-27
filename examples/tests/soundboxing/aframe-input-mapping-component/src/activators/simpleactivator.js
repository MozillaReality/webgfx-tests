function createSimpleActivator(suffix) {
  return function (el, button, onActivate) {
    var eventName = button + suffix;

    el.addEventListener(eventName, onActivate);
    this.removeListeners = function () {
      el.removeEventListener(eventName, onActivate);
    }
  }
}

AFRAME.registerInputActivator('down', createSimpleActivator('down'));
AFRAME.registerInputActivator('up', createSimpleActivator('up'));
AFRAME.registerInputActivator('touchstart', createSimpleActivator('touchstart'));
AFRAME.registerInputActivator('touchend', createSimpleActivator('touchend'));



//////////////////
// WEBPACK FOOTER
// ./~/aframe-input-mapping-component/src/activators/simpleactivator.js
// module id = 146
// module chunks = 0