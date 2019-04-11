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
            var newDisplays = [];
            displays.forEach(display => {
              newDisplays.push(self.hookVRDisplay(display));
            });
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
export default WebVRHook;