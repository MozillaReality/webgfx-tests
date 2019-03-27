AFRAME.registerSystem('frames', {
  init: function() {
    this.frames = [];

    this.el.addEventListener('challengeloaded', evt => {
      this.frames = evt.detail.frames;
    });
  },
});



// WEBPACK FOOTER //
// ./src/components/frames.js