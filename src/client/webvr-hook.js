var WebVRHook = {
  original: {
    getVRDisplays: null,
    addEventListener: null
  },
  currentVRDisplay: null,
  auxFrameData: ( typeof window !== 'undefined' && 'VRFrameData' in window ) ? new window.VRFrameData() : null,
  enable: function () {
    if (navigator.getVRDisplays) {
      this.initEventListeners();
      var origetVRDisplays = this.original.getVRDisplays = navigator.getVRDisplays;
      var self = this;
      navigator.getVRDisplays = function() {
        var result = origetVRDisplays.apply(this, arguments);
        return new Promise ((resolve, reject) => {
          result.then(displays => {
            console.log('>>>>>', displays);
            var newDisplays = [];
            displays.forEach(display => {
              newDisplays.push(self.hookVRDisplay(display));
            });
            console.log(newDisplays);
            resolve(newDisplays);
          })
        });
      }
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
    }
  },
  hookVRDisplay: function (display) {
    // Todo modify the VRDisplay if needed for framedata and so on
    return display;
  }
};
export default WebVRHook;