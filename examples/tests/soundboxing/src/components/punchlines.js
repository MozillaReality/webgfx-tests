const InstancedMesh = require('three-instanced-mesh')(THREE);

const PI_2 = Math.PI * 2;
const LEFT_COLOR = new THREE.Color(0xfcfd3e);
const RIGHT_COLOR = new THREE.Color(0xeb0052);

AFRAME.registerComponent('punchlines', {
  schema: {
    hand: { type: 'string' },
    num: { type: 'int' },
  },

  init: function() {
    this.updateLine = this.updateLine.bind(this);

    this.geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 8);

    this.material = new THREE.MeshBasicMaterial();
    this.material.transparent = true;
    this.material.opacity = 0.8;

    this.mesh = null;
  },

  update: function() {
    this.remove();
    const { hand, num } = this.data;
    const geom = this.geometry;
    const mat = this.material;
    const matColor = hand === 'left' ? LEFT_COLOR : RIGHT_COLOR;
    if (mat.color !== matColor) {
      mat.color = matColor;
    }
    if (this.mesh) {
      this.mesh.material = mat;
      this.mesh.numInstances = num;
      this.mesh.geometry = geom;
      this.mesh.geometry.maxInstancedCount = num;
    } else {
      this.mesh = new InstancedMesh(geom, mat, num, false, false, true);
    }
    this.el.setObject3D('linemesh', this.mesh);
  },

  remove: function() {
    if (this.mesh) {
      this.mesh = null;
      this.el.removeObject3D('linemesh');
    }
  },

  updateLine: (function() {
    const pos = new THREE.Vector3();
    const tmpVec1 = new THREE.Vector3();
    const tmpVec2 = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const rot = new THREE.Quaternion();
    const mat = new THREE.Matrix4();
    const adjust = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(90 * THREE.Math.DEG2RAD, 0, 0)
    );

    return function updateLine(punch, prev, num) {
      const mesh = this.mesh;
      if (punch && prev) {
        mesh.setPositionAt(
          num,
          pos.set(
            (prev.x + punch.x) * 0.5,
            (prev.y + punch.y) * 0.5,
            (prev.zz + punch.zz) * 0.5
          )
        );
        mesh.setQuaternionAt(
          num,
          rot
            .setFromRotationMatrix(
              mat.lookAt(
                pos,
                tmpVec1.set(punch.x, punch.y, punch.zz),
                tmpVec2
                  .set(Math.random(), Math.random(), Math.random())
                  .normalize()
              )
            )
            .multiply(adjust)
        );
        mesh.setScaleAt(
          num,
          scale.set(0.0175, (prev.zz - punch.zz) * 0.95, 0.0175)
        );
      } else {
        mesh.setPositionAt(num, pos.set(100000, 100000, 100000));
        mesh.setQuaternionAt(num, rot.set(0, 0, 0, 0));
        mesh.setScaleAt(num, scale.set(1, 1, 1));
      }
    };
  })(),

  updateMeshPositions: function(hand) {
    const wp = this.el.sceneEl.systems.windowedpunches;
    const start = wp.indexStart[hand];
    const end = wp.indexEnd[hand];
    const punches = wp.punches[hand];

    let prevPunch = null;
    let punch = null;
    let num = 0;
    while (num < this.data.num) {
      this.updateLine(null, null, num);
      ++num;
    }
    num = 0;
    for (let i = start; i < end && num <= this.data.num; ++i) {
      punch = punches[i];
      if (punch.punched) {
        continue;
      }
      if (prevPunch) {
        this.updateLine(punch, prevPunch, num - 1);
      }
      prevPunch = punch;
      ++num;
    }
    this.mesh.needsUpdate('position');
    this.mesh.needsUpdate('quaternion');
    this.mesh.needsUpdate('scale');
  },

  tick: function() {
    if (!this.mesh) {
      return;
    }
    this.updateMeshPositions(this.data.hand);
  },
});



// WEBPACK FOOTER //
// ./src/components/punchlines.js