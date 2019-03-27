AFRAME.registerComponent('background-hum', {
  schema: {
    gameIsPlaying: { default: false },
  },

  init: function() {
    this.audio = new Audio(
      '/assets/sounds/sirkoto51-atmosphericambianceloop.wav'
    );
    this.audio.loop = true;
    this.audio.volume = 0.3;
  },

  update: function() {
    if (this.data.gameIsPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  },
});



// WEBPACK FOOTER //
// ./src/components/background-hum.js