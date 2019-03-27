AFRAME.registerComponent('switch-input-mapping', {
  schema: {
    mapping: { default: 'default' },
  },
  update: function() {
    AFRAME.currentInputMapping = this.data.mapping;
  },
});



// WEBPACK FOOTER //
// ./src/components/switch-input-mapping.js