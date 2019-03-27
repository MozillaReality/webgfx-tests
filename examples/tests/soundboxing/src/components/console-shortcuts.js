AFRAME.registerComponent('console-shortcuts', {
  play: function() {
    window.scene = this.el;
    window.state = this.el.systems.state.state;
  },
});



// WEBPACK FOOTER //
// ./src/components/console-shortcuts.js