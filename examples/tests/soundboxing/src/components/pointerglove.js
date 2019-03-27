AFRAME.registerComponent('pointerglove', {
  schema: {
    hand: { type: 'string' },
    menuActive: { default: false },
    multiplier: { type: 'int', default: 1 },
    velocityUpdateSpeed: { type: 'float', default: 0.45 },
    activated: { default: false },
  },

  init: function() {
    this.checkPunchCollision = this.checkPunchCollision.bind(this);
    this.updateMeshTransform = this.updateMeshTransform.bind(this);
    this.calculateVelocity = this.calculateVelocity.bind(this);

    const data = this.data;
    const el = this.el;

    this.controllerType = '';
    this.hitStartEventDetail = {};

    this.prevPosition = new THREE.Vector3();
    this.estimatedVelocity = new THREE.Vector3();

    this.rightPointerModel = document.getElementById('rightPointerModel');

    el.addEventListener('controllerconnected', evt => {
      const el = this.el;
      const hand = this.data.hand;
      this.controllerType = evt.detail.name;
      if (!AFRAME.utils.device.isMobile()) {
        return;
      }
      el.sceneEl.emit('activatepointer', { hand });
      el.setAttribute('raycaster', {});
      el.setAttribute('cursor', {
        downEvents: ['triggerdown'],
        upEvents: ['triggerup'],
      });
      el.setAttribute('line', { opacity: 0.75, color: 'pink' });
    });
  },

  update: function() {
    const el = this.el;
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
      this.estimatedVelocity.z = -1; // Set Z to -1 because we sim forward velocity
      this.prevPosition.copy(worldPosition);
    };
  })(),

  updateMeshTransform: (function() {
    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3();
    const worldRot = new THREE.Euler();
    const worldRay = new THREE.Ray();
    const isectPos = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1.2);
    return function(t, dt) {
      const { object3D } = this.el;
      const { hand, menuActive } = this.data;

      object3D.getWorldPosition(worldPos);
      object3D.getWorldRotation(worldRot);

      const pointerObj3D = this.rightPointerModel.object3D;
      if (menuActive) {
        pointerObj3D.position.set(worldPos.x, worldPos.y, worldPos.z);
        pointerObj3D.rotation.copy(worldRot);
      } else {
        object3D.getWorldDirection(worldDir);
        worldDir.negate();
        worldRay.set(worldPos, worldDir);
        if (worldRay.intersectPlane(plane, isectPos)) {
          // Don't let it go outside the bounds of the punch window
          const wp = this.el.sceneEl.systems.windowedpunches;
          const range = wp.ranges[hand];
          pointerObj3D.position.set(
            THREE.Math.clamp(isectPos.x, range.x.min, range.x.max),
            THREE.Math.clamp(isectPos.y, range.y.min, range.y.max),
            isectPos.z
          );
          pointerObj3D.rotation.copy(worldRot);
        } else {
          pointerObj3D.position.set(-99999, -99999, -99999);
        }
      }
    };
  })(),

  checkPunchCollision: (function() {
    const punchWorldPos = new THREE.Vector3();

    return function(t, punch, gloveWorldPos) {
      if (punch.zz < -3 || punch.zz > 2) {
        return;
      }

      const el = this.el;

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

        // Emit event.
        this.hitStartEventDetail.id = punch.id;
        this.hitStartEventDetail.velocity = this.estimatedVelocity;
        el.emit('hitstart', this.hitStartEventDetail);

        return;
      }
    };
  })(),

  tick: (function() {
    //const worldPos = new THREE.Vector3();
    return function(t, dt) {
      const { activated, hand } = this.data;
      if (!activated) {
        return;
      }
      this.updateMeshTransform(t, dt);
      this.calculateVelocity(dt);
      const pointerObj3D = this.rightPointerModel.object3D;
      const wp = this.el.sceneEl.systems.windowedpunches;
      for (i = wp.indexStart[hand]; i < wp.indexEnd[hand]; i++) {
        this.checkPunchCollision(t, wp.punches[hand][i], pointerObj3D.position);
      }
    };
  })(),
});



// WEBPACK FOOTER //
// ./src/components/pointerglove.js