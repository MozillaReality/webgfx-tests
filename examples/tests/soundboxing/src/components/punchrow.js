const InstancedMesh = require('three-instanced-mesh')(THREE);

const PI_2 = Math.PI * 2;
const LEFT_COLOR = new THREE.Color(0xfcfd3e);
const RIGHT_COLOR = new THREE.Color(0xeb0052);

AFRAME.registerComponent('punchrow', {
  schema: {
    hand: { type: 'string' },
    maxInstances: { type: 'int', default: 50 },
  },

  init: function() {
    this.updateMeshPositions = this.updateMeshPositions.bind(this);

    this.geometry = new THREE.SphereBufferGeometry(0.1, 9, 9);

    this.material = new THREE.MeshBasicMaterial();
    this.material.transparent = true;
    this.material.opacity = 0.95;

    this.mesh = null;
  },

  update: function() {
    this.remove();
    const { hand, maxInstances } = this.data;
    const geom = this.geometry;
    const mat = this.material;
    const matColor = hand === 'left' ? LEFT_COLOR : RIGHT_COLOR;
    if (mat.color !== matColor) {
      mat.color = matColor;
    }
    if (this.mesh) {
      this.mesh.material = mat;
      this.mesh.numInstances = maxInstances;
      this.mesh.geometry = geom;
      this.mesh.geometry.maxInstancedCount = maxInstances;
    } else {
      this.mesh = new InstancedMesh(
        geom,
        mat,
        maxInstances,
        false,
        false,
        true
      );
    }
    this.el.setObject3D('punchmesh', this.mesh);
  },

  remove: function() {
    if (this.mesh) {
      this.mesh = null;
      this.el.removeObject3D('punchmesh');
    }
  },

  updateMeshPositions: (function() {
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3(1, 1, 1);
    const rot = new THREE.Quaternion();
    const eul = new THREE.Euler();

    return function updateMeshPositions(hand) {
      const wp = this.el.sceneEl.systems.windowedpunches;
      const start = wp.indexStart[hand];
      const end = wp.indexEnd[hand];
      const punches = wp.punches[hand];
      const mesh = this.mesh;

      // Set relevant instances onscreen
      let punch = null;
      let num = 0;
      for (let i = start; i < end && num < mesh.numInstances; ++i) {
        punch = punches[i];
        if (punch.punched) {
          continue;
        }
        mesh.setPositionAt(num, pos.set(punch.x, punch.y, punch.zz));
        mesh.setQuaternionAt(
          num,
          rot.setFromEuler(
            eul.set(
              Math.random() * PI_2,
              Math.random() * PI_2,
              Math.random() * PI_2
            )
          )
        );
        mesh.setScaleAt(num, scale);
        ++num;
      }

      // Set the rest offscreen
      pos.set(100000, 100000, 100000);
      rot.set(0, 0, 0, 0);
      while (num < mesh.numInstances) {
        mesh.setPositionAt(num, pos);
        mesh.setQuaternionAt(num, rot);
        mesh.setScaleAt(num, scale);
        ++num;
      }

      mesh.needsUpdate('position');
      mesh.needsUpdate('quaternion');
      mesh.needsUpdate('scale');
    };
  })(),

  tick: function() {
    if (!this.mesh) {
      return;
    }
    this.updateMeshPositions(this.data.hand);
  },
});



// WEBPACK FOOTER //
// ./src/components/punchrow.js