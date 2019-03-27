const SPE = require('aframe-particle-system-component/lib/SPE.js');

AFRAME.registerComponent('dust-particles', {
  schema: {},

  init: function() {
    this.emitterSettings = {
      type: SPE.distributions.BOX,
      position: {
        spread: new THREE.Vector3(10, 10, 10),
        randomise: true,
      },
      velocity: {
        spread: new THREE.Vector3(0.04, 0.04, 0.04),
        randomise: true,
      },
      size: {
        value: 0.075,
        spread: 0.025,
      },
      opacity: {
        value: [0, 0, 0.6, 0.85, 0.6, 0, 0],
      },
      color: {
        value: new THREE.Color('white'),
      },
      particleCount: 1000,
      alive: true,
      maxAge: {
        value: 10,
        spread: 10,
      },
    };
    this.emitter = new SPE.Emitter(this.emitterSettings);
    this.particleGroup = new SPE.Group({
      texture: {
        value: THREE.ImageUtils.loadTexture('assets/img/smokeparticle.png'),
      },
      blending: THREE.AdditiveBlending,
      maxParticleCount: 5000,
    });
    this.particleGroup.addEmitter(this.emitter);
    this.particleGroup.mesh.frustumCulled = false;
    this.el.sceneEl.setObject3D('dustParticles', this.particleGroup.mesh);
    this.emitter.enable();
  },

  tick: function(t, dt) {
    this.particleGroup.tick(dt / 1000);
  },
});



// WEBPACK FOOTER //
// ./src/components/dust-particles.js