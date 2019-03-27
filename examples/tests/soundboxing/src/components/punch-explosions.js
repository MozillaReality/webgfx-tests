const SPE = require('aframe-particle-system-component/lib/SPE.js');
const InstancedMesh = require('three-instanced-mesh')(THREE);

AFRAME.registerComponent('punch-explosions', {
  schema: {
    maxNum: { type: 'int', default: 10 },
    rayDuration: { type: 'float', default: 300 },
    distance: { type: 'float', default: 8 },
  },

  init: function() {
    this.createExplosion = this.createExplosion.bind(this);
    this.createExplosionRay = this.createExplosionRay.bind(this);
    this.createStartExplosion = this.createStartExplosion.bind(this);
    this.createEndExplosion = this.createEndExplosion.bind(this);
    this.tickRays = this.tickRays.bind(this);

    this.initStartExplosions();
    this.initRays();
    this.initEndExplosions();

    this.inFlight = {};
  },

  initStartExplosions: function() {
    const { maxNum } = this.data;
    this.startEmitterSettings = {
      position: {
        spread: new THREE.Vector3(0.1, 0.1, 0.1),
      },
      velocity: {
        spread: new THREE.Vector3(5, 3, 1),
      },
      acceleration: {
        value: new THREE.Vector3(0, -9.8, 0),
      },
      size: {
        value: [0.01, 0.04, 0.01, 0.01, 0],
      },
      opacity: {
        value: [0.95, 0.75, 0],
      },
      color: {
        value: [new THREE.Color('white'), new THREE.Color('yellow')],
      },
      particleCount: 100,
      alive: true,
      duration: 0.12,
      maxAge: {
        value: 0.5,
      },
    };
    this.startGroup = new SPE.Group({
      texture: {
        value: THREE.ImageUtils.loadTexture('assets/img/Spark.png'),
      },
      blending: THREE.AdditiveBlending,
      maxParticleCount: 1000,
    });
    this.startGroup.addPool(maxNum, this.startEmitterSettings, false);
    this.startGroup.mesh.frustumCulled = false;
    this.el.setObject3D('startParticleGroup', this.startGroup.mesh);
  },

  initRays: function() {
    this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial();
    this.material.transparent = true;
    this.material.opacity = 0.47;
    this.material.color = new THREE.Color(0xffed00);
  },

  initEndExplosions: function() {
    const { maxNum } = this.data;
    this.sizes = [0, 1, 0.16, 0.128, 0.096, 0.064, 0.032, 0];
    this.endEmitterSettings = {
      type: SPE.distributions.SPHERE,
      position: {
        radius: 0.01,
      },
      velocity: {
        spread: new THREE.Vector3(10, 10, 10),
      },
      size: {
        value: this.sizes.map(size => size * 10),
      },
      color: {
        value: new THREE.Color(0xff7f34),
      },
      particleCount: 400,
      alive: true,
      duration: 1,
      maxAge: {
        value: 1.24,
      },
    };
    this.endGroup = new SPE.Group({
      texture: {
        value: THREE.ImageUtils.loadTexture('assets/img/ParticleBokeh.png'),
      },
      blending: THREE.AdditiveBlending,
      maxParticleCount: 4000,
    });
    this.endGroup.addPool(maxNum, this.endEmitterSettings, false);
    this.endGroup.mesh.frustumCulled = false;
    this.el.setObject3D('endParticleGroup', this.endGroup.mesh);
  },

  update: function() {
    this.remove();
    const { maxNum } = this.data;
    const geom = this.geometry;
    const mat = this.material;
    if (this.mesh) {
      this.mesh.material = mat;
      this.mesh.numInstances = num;
      this.mesh.geometry = geom;
      this.mesh.geometry.maxInstancedCount = maxNum;
    } else {
      this.mesh = new InstancedMesh(geom, mat, maxNum, false, false, true);
    }

    this.el.setObject3D('raymesh', this.mesh);
  },

  remove: function() {
    if (this.mesh) {
      this.mesh = null;
      this.el.removeObject3D('raymesh');
    }
  },

  createExplosion: function(t, glovePos, punchPos, velocity, multiplier) {
    this.createEndExplosion(glovePos, velocity, multiplier);
    this.createStartExplosion(glovePos, punchPos, velocity);
    this.createExplosionRay(t, glovePos, velocity);
  },

  createExplosionRay: function(t, glovePos, velocity) {
    const { rayDuration } = this.data;
    this.inFlight[t] = [
      new THREE.Vector3(glovePos.x, glovePos.y, glovePos.z), // Position
      new THREE.Vector3(velocity.x, velocity.y, velocity.z), // Velocity
    ];
    setTimeout(() => {
      delete this.inFlight[t];
    }, rayDuration);
  },

  createStartExplosion: function(glovePosition, punchPosition, velocity) {
    const emitter = this.startGroup.getFromPool();
    if (emitter === null) {
      console.log('SPE.Group pool ran out for startEmitter.');
      return;
    }

    emitter.position.value.copy(punchPosition);
    emitter.velocity.value
      .copy(velocity)
      .normalize()
      .multiplyScalar(5);
    // Trigger the setter for this property to force an
    // update to the emitter's position and velocity spread attributes.
    emitter.position.value = emitter.position.value;
    emitter.velocity.value = emitter.velocity.value;

    emitter.enable();
    setTimeout(() => {
      // Stop the start emitter
      emitter.disable();
      this.startGroup.releaseIntoPool(emitter);
    }, emitter.duration * 1000);
  },

  createEndExplosion: function(position, velocity, multiplier) {
    const { distance } = this.data;

    const emitter = this.endGroup.getFromPool();
    if (emitter === null) {
      console.log('SPE.Group pool ran out for endEmitter.');
      return;
    }

    // Calculate the multiplier percentage
    let mult = multiplier / 40;

    const changePosition = new THREE.Vector3(
      velocity.x,
      velocity.y,
      velocity.z
    );
    changePosition.normalize().multiplyScalar(distance);

    emitter.position.value.copy(position);
    emitter.position.value.add(changePosition);
    // Trigger the setter for this property to force an
    // update to the emitter's position spread attribute.
    emitter.position.value = emitter.position.value;

    emitter.activeMultiplier = THREE.Math.mapLinear(
      THREE.Math.clamp(velocity.length() * mult, 0, 1),
      0,
      1,
      0.6,
      1
    );
    for (let i = 0; i < emitter.size.value.length; ++i) {
      emitter.size.value[i] =
        this.sizes[i] * THREE.Math.mapLinear(mult, 0, 1, 0.08, 3);
    }
    emitter.size.value = emitter.size.value;

    emitter.enable();
    setTimeout(() => {
      // Stop the end emitter
      emitter.disable();
      this.endGroup.releaseIntoPool(emitter);
    }, emitter.duration * 1000);
  },

  tickRays: (function() {
    const pos = new THREE.Vector3();
    const tmpVec = new THREE.Vector3();
    const scale = new THREE.Vector3(0.02, 0.02, 1);
    const rot = new THREE.Quaternion();
    const mat = new THREE.Matrix4();
    const farPoint = new THREE.Vector3();
    const normalizedVelocity = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);
    return function(t) {
      const mesh = this.mesh;
      const { distance, rayDuration, maxNum } = this.data;
      const halfDuration = rayDuration * 0.5;

      let num = 0;
      for (let prop in this.inFlight) {
        if (!this.inFlight.hasOwnProperty(prop)) {
          continue;
        }

        const ts = parseFloat(prop);
        const elapsed = t - ts;
        const midpoint = ts + halfDuration;
        const [startPosition, velocity] = this.inFlight[prop];
        normalizedVelocity.copy(velocity).normalize();
        farPoint
          .copy(normalizedVelocity)
          .multiplyScalar(distance)
          .add(startPosition);

        // First half (ray growing towards target)
        if (elapsed < halfDuration) {
          tmpVec
            .copy(normalizedVelocity)
            .multiplyScalar(distance * (elapsed / rayDuration) * 1.05);
          pos.copy(startPosition).add(tmpVec);
          rot.setFromRotationMatrix(mat.lookAt(pos, farPoint, upVector));
          scale.z = distance * (elapsed / halfDuration);
        } else {
          // Second half (ray shrinking at destination)
          tmpVec
            .copy(normalizedVelocity)
            .multiplyScalar(distance * (elapsed / rayDuration) * 1.05);
          pos.copy(startPosition).add(tmpVec);
          rot.setFromRotationMatrix(mat.lookAt(pos, startPosition, upVector));
          scale.z = 1 - distance * ((elapsed - halfDuration) / halfDuration);
        }

        mesh.setPositionAt(num, pos);
        mesh.setQuaternionAt(num, rot);
        mesh.setScaleAt(num, scale);

        ++num;
        if (num >= maxNum) {
          break;
        }
      }

      pos.set(100000, 100000, 100000);
      rot.set(0, 0, 0, 0);
      scale.z = 0;
      while (num < maxNum) {
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

  tick: function(t, dt) {
    const tickTime = dt / 1000;
    this.startGroup.tick(tickTime);
    this.endGroup.tick(tickTime);
    this.tickRays(t);
  },
});



// WEBPACK FOOTER //
// ./src/components/punch-explosions.js