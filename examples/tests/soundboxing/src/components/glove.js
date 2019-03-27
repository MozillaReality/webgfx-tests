const SPE = require('aframe-particle-system-component/lib/SPE.js');

var handData = {
  right: { hand: 'right', model: false },
  left: { hand: 'left', model: false },
};

AFRAME.registerComponent('glove', {
  schema: {
    hand: { type: 'string' },
    menuActive: { default: false },
    velocityUpdateSpeed: { type: 'float', default: 0.45 },
    multiplier: { type: 'int', default: 1 },
    leniencyTime: { type: 'float', default: 0.2 },
    leniencyDist: { type: 'float', default: 0.4 },
    activated: { default: false },
  },

  init: function() {
    this.leniencyCheck = this.leniencyCheck.bind(this);
    this.startPulse = this.startPulse.bind(this);
    this.checkPunchCollision = this.checkPunchCollision.bind(this);
    this.calculateVelocity = this.calculateVelocity.bind(this);

    var data = this.data;
    var el = this.el;

    this.controllerType = '';
    this.hitStartEventDetail = {};

    this.prevPosition = new THREE.Vector3();
    this.estimatedVelocity = new THREE.Vector3();

    el.addEventListener('object3dset', evt => {
      var mesh;
      if (evt.detail.type !== 'mesh') {
        return;
      }
      if (this.controllerType) {
        this.setControllerRotation();
      }
    });

    // Set controllers.
    el.setAttribute('gltf-model', `#${data.hand}glove`);
    el.setAttribute('oculus-touch-controls', handData[data.hand]);
    el.setAttribute('vive-controls', handData[data.hand]);
    el.setAttribute('windows-motion-controls', handData[data.hand]);

    el.addEventListener('controllerconnected', evt => {
      this.controllerType = evt.detail.name;
      if (this.el.getObject3D('mesh')) {
        this.setControllerRotation();
      }
      this.el.sceneEl.emit('activateglove', { hand: data.hand });
      if (data.hand === 'left') {
        return;
      }
      const controllerConfig = this.config[this.controllerType];
      el.setAttribute('raycaster', controllerConfig.raycaster || {});
      el.setAttribute('cursor', controllerConfig.cursor || {});
      el.setAttribute('line', { opacity: 0.75, color: 'pink' });
    });

    this.emitterSettings = {
      type: SPE.distributions.SPHERE,
      position: {
        spread: new THREE.Vector3(0),
        radius: 0.15,
      },
      velocity: {
        value: new THREE.Vector3(0.06, 0.06, 0.06),
        spread: new THREE.Vector3(0.02, 0.02, 0.02),
        distribution: SPE.distributions.SPHERE,
      },
      size: {
        value: [0.001, 0.005],
      },
      opacity: {
        value: [0.92, 0.4, 0],
      },
      color: {
        value: [new THREE.Color('yellow'), new THREE.Color('white')],
      },
      particleCount: 240,
      alive: true,
      // No duration means infinte spawn
      maxAge: {
        value: 0.4,
        spread: 0.1,
      },
    };
    this.emitter = new SPE.Emitter(this.emitterSettings);
    this.particleGroup = new SPE.Group({
      texture: {
        value: THREE.ImageUtils.loadTexture('assets/img/Spark.png'),
      },
      blending: THREE.AdditiveBlending,
      maxParticleCount: 1200,
    });
    this.particleGroup.addEmitter(this.emitter);
    this.particleGroup.mesh.frustumCulled = false;
    this.el.sceneEl.setObject3D(
      `${data.hand}particleGroup`,
      this.particleGroup.mesh
    );
  },

  setControllerRotation: function() {
    var el = this.el;
    mesh = el.getObject3D('mesh');
    if (this.controllerType === 'vive-controls') {
      mesh.rotation.x = THREE.Math.degToRad(90);
      mesh.rotation.y = THREE.Math.degToRad(
        this.data.hand === 'left' ? -90 : 90
      );
      mesh.rotation.z = THREE.Math.degToRad(180);
    } else {
      mesh.rotation.y = THREE.Math.degToRad(180);
    }
  },

  update: function() {
    if (this.data.activated && !this.emitter.alive) {
      this.emitter.enable();
    }
    var el = this.el;
    if (this.data.hand === 'left') {
      return;
    }
    el.setAttribute(
      'raycaster',
      'enabled',
      this.data.menuActive && this.data.activated
    );
    el.setAttribute(
      'raycaster',
      'showLine',
      this.data.menuActive && this.data.activated
    );
  },

  tick: (function() {
    const worldPos = new THREE.Vector3();

    return function(t, dt) {
      let i;
      const { object3D, sceneEl } = this.el;
      const { hand, activated } = this.data;

      if (!activated) {
        return;
      }

      object3D.getWorldPosition(worldPos);

      this.emitter.position.value.copy(worldPos);
      this.emitter.position.value = this.emitter.position.value;
      this.particleGroup.tick(dt / 1000);

      const { isPlaying, timestamp } = sceneEl.components.youtube;
      if (!isPlaying || timestamp < 0.000001) {
        return;
      }

      this.calculateVelocity(dt);

      const wp = sceneEl.systems.windowedpunches;
      for (i = wp.indexStart.right; i < wp.indexEnd.right; i++) {
        this.checkPunchCollision(t, i, 'right', worldPos);
      }
      for (i = wp.indexStart.left; i < wp.indexEnd.left; i++) {
        this.checkPunchCollision(t, i, 'left', worldPos);
      }
    };
  })(),

  leniencyCheck: function(wp, punchHand, punch) {
    const { hand, leniencyTime, leniencyDist } = this.data;
    let punchOK = punchHand === hand;
    if (!punchOK) {
      let foundLeft = false;
      let foundRight = false;
      let foundBoth = false;
      let p = null;
      // Check against right punches
      for (i = wp.indexStart.right; i < wp.indexEnd.right && !foundBoth; i++) {
        p = wp.punches.right[i];
        // Check that the punches are within our time leniency tolerance level
        if (
          p.timestamp > punch.timestamp + leniencyTime ||
          p.timestamp < punch.timestamp - leniencyTime
        ) {
          continue;
        }
        // Check that the punches are within our distance leniency tolerance level
        const distX = Math.abs(p.x - punch.x);
        const distY = Math.abs(p.y - punch.y);
        if (distX > leniencyDist || distY > leniencyDist) {
          continue;
        }
        if (hand === 'left') {
          foundLeft = true;
        } else {
          foundRight = true;
        }
        foundBoth = foundLeft && foundRight;
      }
      // Check against left punches
      for (i = wp.indexStart.left; i < wp.indexEnd.left && !foundBoth; i++) {
        p = wp.punches.left[i];
        // Check that the punches are within our time leniency tolerance level
        if (
          p.timestamp > punch.timestamp + leniencyTime ||
          p.timestamp < punch.timestamp - leniencyTime
        ) {
          continue;
        }
        // Check that the punches are within our distance leniency tolerance level
        const distX = Math.abs(p.x - punch.x);
        const distY = Math.abs(p.y - punch.y);
        if (distX > leniencyDist || distY > leniencyDist) {
          continue;
        }
        if (hand === 'right') {
          foundLeft = true;
        } else {
          foundRight = true;
        }
        foundBoth = foundLeft && foundRight;
      }
      punchOK =
        (punchHand === 'left' && foundLeft) ||
        (punchHand === 'right' && foundRight) ||
        foundBoth;
    }
    return punchOK;
  },

  startPulse: (function() {
    const circuit = { actuator: true, inited: false };
    return function(power, duration) {
      if (!circuit.inited) {
        circuit.actuator = !(
          this.el.components.haptics && this.el.components.haptics.pulse
        );
        circuit.inited = true;
      }
      if (circuit.actuator) {
        return;
      }
      try {
        this.el.components.haptics.pulse(power, duration);
      } catch (e) {
        circuit.actuator = true;
        console.log(
          'Circuit blown for the haptic actuator (probably IE), will not attempt pulse again. Error:' +
            e
        );
      }
    };
  })(),

  checkPunchCollision: (function() {
    const punchWorldPos = new THREE.Vector3();

    return function(t, idx, punchHand, gloveWorldPos) {
      const el = this.el;
      const wp = el.sceneEl.systems.windowedpunches;
      const punch = wp.punches[punchHand][idx];

      if (punch.zz < -3 || punch.zz > 2) {
        return;
      }

      const { hand } = this.data;

      // Calculate.
      punchWorldPos.set(punch.x, punch.y, punch.zz);
      const distance = gloveWorldPos.distanceTo(punchWorldPos);
      const isHitting = distance < 0.3;

      // OK we found a punch
      if (isHitting && !punch.punched) {
        // Update punch.
        punch.punched = true;

        // Create explosion.
        el.sceneEl.components['punch-explosions'].createExplosion(
          t,
          gloveWorldPos,
          punchWorldPos,
          this.estimatedVelocity,
          this.data.multiplier
        );

        const correctHand = hand === punchHand;
        const punchOK = this.leniencyCheck(wp, punchHand, punch);
        this.startPulse(correctHand ? 6 : 12, 100);
        // TODO: if (punchOK && !correctHand), then pulse the correct hand for 6 also

        // Emit event.
        if (punchOK) {
          this.hitStartEventDetail.id = punch.id;
          this.hitStartEventDetail.velocity = this.estimatedVelocity;
          el.emit('hitstart', this.hitStartEventDetail);
        } else {
          el.sceneEl.emit('hitmiss');
          // TODO: Decouple this so we don't have to reach into windowedpunches here
          if (el.sceneEl.systems.state.state.inVR) {
            el.sceneEl.systems.windowedpunches.missSoundPool.play();
          }
        }

        return;
      }
    };
  })(),

  calculateVelocity: (function() {
    const worldPosition = new THREE.Vector3();
    const estimation = new THREE.Vector3();

    return function(dt) {
      this.el.object3D.getWorldPosition(worldPosition);
      estimation
        .copy(worldPosition)
        .sub(this.prevPosition)
        .divideScalar(dt / 1000);
      if (estimation.lengthSq() > 0.000001) {
        this.estimatedVelocity.lerp(estimation, this.data.velocityUpdateSpeed);
      }
      this.prevPosition.copy(worldPosition);
    };
  })(),

  config: {
    'oculus-touch-controls': {
      cursor: {
        downEvents: [
          'triggerdown',
          'gripdown',
          'abuttondown',
          'bbuttondown',
          'xbuttondown',
          'ybuttondown',
        ],
        upEvents: [
          'triggerup',
          'gripup',
          'abuttonup',
          'bbuttonup',
          'xbuttonup',
          'ybuttonup',
        ],
      },
    },

    'vive-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup'],
      },
    },

    'windows-motion-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup'],
      },
    },

    'gearvr-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown'],
        upEvents: ['trackpadup', 'triggerup'],
      },
    },

    'daydream-controls': {
      cursor: {
        downEvents: ['trackpaddown'],
        upEvents: ['trackpadup'],
      },
    },
  },
});



// WEBPACK FOOTER //
// ./src/components/glove.js