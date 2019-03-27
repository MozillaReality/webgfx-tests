const INDICATOR_VERTEX = `
precision highp float;

attribute vec3 translate;
attribute vec3 color;
attribute float angle;

varying vec3 col;
varying vec3 pos;
varying float centerZ;
varying float completeness;

void main()	{
  col = color;
  pos = position;
  completeness = angle;
  centerZ = gl_Position.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position + translate, 1.0);
}
`;

const INDICATOR_FRAGMENT = `
precision highp float;

#define M_PI 3.1415926535897932384626433832795

varying vec3 col;
varying vec3 pos;
varying float centerZ;
varying float completeness;

void main()	{
  float scale = 0.2; // Diameter of the circle

  vec3 zero = vec3(0.0, 0.0, 0.0);

  float d = distance(pos, zero) / scale;

  // Antialiased fadeout on inside of ring
  float outer = 1.0;
  float smoothedOuter = smoothstep(outer, outer - 0.01, d);
  float inner = 0.7;
  float smoothedInner = smoothstep(inner, inner + 0.01, d);
  float alpha = smoothedOuter * smoothedInner;

  // Black ring on outside
  float interp = clamp((d - 0.95) * 100.0, 0.0, 1.0);
  vec3 interpVec = vec3(interp, interp, interp);
  vec3 c = mix(col, zero, interpVec);

  float angle = atan(pos.y, pos.x);
  float pct = clamp(completeness, 0.0, 1.0);
  float s = mod(((angle + M_PI) / (2.0 * M_PI)) + 0.25,  1.0) < (1.0 - pct) ? 0.0 : 1.0;

  float a = alpha * s;

  if (a == 0.0) {
    discard;
  }

  gl_FragColor = vec4(c, a);
}
`;

const LEFT_COLOR = new THREE.Color(0xfcfd3e);
const RIGHT_COLOR = new THREE.Color(0xeb0052);

const IMPACT_Z = 1.2;

AFRAME.registerComponent('punchindicators', {
  schema: {
    num: { type: 'int', default: 3 },
  },

  init: function() {
    this.updateClosestPunches = this.updateClosestPunches.bind(this);
    this.addPunchToPunches = this.addPunchToPunches.bind(this);

    const { num, color } = this.data;

    const translateArray = new Float32Array(num * 3);
    this.translate = new THREE.InstancedBufferAttribute(translateArray, 3, 1);

    const colorsArray = new Float32Array(num * 3);
    this.colors = new THREE.InstancedBufferAttribute(colorsArray, 3, 1);

    const anglesArray = new Float32Array(num);
    this.angles = new THREE.InstancedBufferAttribute(anglesArray, 1, 1);

    this.geometry = new THREE.InstancedBufferGeometry();
    this.geometry.copy(new THREE.CircleBufferGeometry(0.2, 32, 0, Math.PI * 2));
    this.geometry.maxInstancedCount = num;
    this.geometry.addAttribute('translate', this.translate);
    this.geometry.addAttribute('color', this.colors);
    this.geometry.addAttribute('angle', this.angles);

    this.material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: INDICATOR_VERTEX,
      fragmentShader: INDICATOR_FRAGMENT,
    });
    this.material.transparent = true;

    this.mesh = null;
  },

  update: function() {
    this.remove();
    const { num } = this.data;
    if (this.mesh) {
      this.mesh.material = this.material;
      this.mesh.geometry = this.geometry;
      this.mesh.geometry.maxInstancedCount = num;
    } else {
      this.mesh = new THREE.Mesh(this.geometry, this.material);
    }
    this.mesh.frustumCulled = false;
    this.el.setObject3D('indicatormesh', this.mesh);
  },

  remove: function() {
    if (this.mesh) {
      this.mesh = null;
      this.el.removeObject3D('indicatormesh');
    }
  },

  addPunchToPunches: (function() {
    let idx = -1;
    let val = -1;
    let zz = -1;

    return function addPunchToPunches(punch, punches, maxNum) {
      if (punches.length < maxNum) {
        // If we haven't even filled the punches buffer yet, just add it
        punches.push(punch);
      } else {
        // Otherwise, see whether there's something we can replace
        idx = -1;
        zz = -1;
        for (let i = 0; i < punches.length; ++i) {
          zz = punches[i].zz;
          if (punch.zz > zz && (idx === -1 || zz < val)) {
            idx = i;
            val = zz;
          }
        }
        if (idx !== -1) {
          punches[idx] = punch;
        }
      }
    };
  })(),

  updateClosestPunches: (function() {
    let idx = -1;
    let punch = null;

    return function updateClosestPunches(punches) {
      const wp = this.el.sceneEl.systems.windowedpunches;
      const {
        leftPunchesActive,
        rightPunchesActive,
      } = this.el.sceneEl.systems.state.state;
      const maxNum = this.data.num;

      punches.length = 0;

      if (leftPunchesActive) {
        for (let i = 0; i < maxNum; ++i) {
          idx = wp.indexStart.left + i;
          punch = idx < wp.indexEnd.left ? wp.punches.left[idx] : null;
          if (!punch || punch.punched) {
            continue;
          }
          // If it's already past time to hit it, skip
          if (punch.zz > -IMPACT_Z) {
            continue;
          }
          this.addPunchToPunches(punch, punches, maxNum);
        }
      }
      if (rightPunchesActive) {
        for (let i = 0; i < maxNum; ++i) {
          idx = wp.indexStart.right + i;
          punch = idx < wp.indexEnd.right ? wp.punches.right[idx] : null;
          if (!punch || punch.punched) {
            continue;
          }
          // If it's already past time to hit it, skip
          if (punch.zz > -IMPACT_Z) {
            continue;
          }
          this.addPunchToPunches(punch, punches, maxNum);
        }
      }
    };
  })(),

  tick: (function() {
    const punches = [];

    return function tick(t, dt) {
      if (!this.mesh) {
        return;
      }

      this.updateClosestPunches(punches);

      const translate = this.translate;
      const colors = this.colors;
      const angles = this.angles;

      // Set the relevent indicators onscreen
      let num = 0;
      while (num < punches.length) {
        punch = punches[num];
        translate.setXYZ(num, punch.x, punch.y, punch.zz);
        angles.setX(
          num,
          THREE.Math.clamp(
            THREE.Math.mapLinear(-punch.zz, 3.5 + IMPACT_Z, IMPACT_Z, 1, 0),
            0,
            1
          )
        );
        if (punch.isLeft) {
          colors.setXYZ(num, LEFT_COLOR.r, LEFT_COLOR.g, LEFT_COLOR.b);
        } else {
          colors.setXYZ(num, RIGHT_COLOR.r, RIGHT_COLOR.g, RIGHT_COLOR.b);
        }
        ++num;
      }

      // Set the rest offscreen
      const maxNum = this.data.num;
      while (num < maxNum) {
        translate.setXYZ(num, 100000, 100000, 100000);
        angles.setX(num, 0);
        ++num;
      }

      translate.needsUpdate = true;
      colors.needsUpdate = true;
      angles.needsUpdate = true;
    };
  })(),
});



// WEBPACK FOOTER //
// ./src/components/punchindicators.js