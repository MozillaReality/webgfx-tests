AFRAME.registerComponent('sky-menu-fade', {
  schema: {
    menuActive: { default: true },
  },

  update: function(oldData) {
    if (!('menuActive' in oldData)) {
      return;
    }
    this.el.object3D.children[0].material.uniforms['color'].value = this.data
      .menuActive
      ? '#666'
      : '#FFF';
  },
});



// WEBPACK FOOTER //
// ./src/components/sky-menu-fade.js