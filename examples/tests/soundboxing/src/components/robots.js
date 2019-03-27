const InstancedMesh = require('three-instanced-mesh')(THREE);

AFRAME.registerComponent('robots', {
  schema: {
    body: { type: 'model' },
    lefthand: { type: 'model' },
    righthand: { type: 'model' },
  },

  init: function() {
    this.updateMeshPositions = this.updateMeshPositions.bind(this);
    this.models = {
      body: null,
      lefthand: null,
      righthand: null,
    };
    this.meshes = {};
    this.loader = new THREE.GLTFLoader();
    this.positions = [];
    this.rotations = [];

    this.el.addEventListener('challengeloaded', evt => {
      this.prevFrameIdx = 0;
    });
  },

  getRobotPositionsAndRotations: function(self, el) {
    let resp = {
      positions: [],
      rotations: [],
    };
    let i = 1;
    while (true) {
      const robotObj = el.components['robot__' + i];
      if (!robotObj) {
        break;
      }
      resp.positions.push(robotObj.data.placement);
      const rot = robotObj.data.rotation;
      rot.x *= THREE.Math.DEG2RAD;
      rot.y *= THREE.Math.DEG2RAD;
      rot.z *= THREE.Math.DEG2RAD;
      resp.rotations.push(rot);
      ++i;
    }
    return resp;
  },

  updateMeshPositions: (function() {
    const _v3 = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const _q2 = new THREE.Quaternion();
    const _eul = new THREE.Euler();
    let _pos = null;
    let _rot = null;
    let _mesh = null;

    return function updateMeshPositions(self, el, part, offsetPos, offsetRot) {
      for (let key in self.meshes) {
        if (!self.meshes.hasOwnProperty(key)) {
          continue;
        }
        if (!key.startsWith(part)) {
          continue;
        }

        _mesh = self.meshes[key];

        for (let i = 0; i < self.positions.length; ++i) {
          _pos = self.positions[i];

          if (offsetPos) {
            _v3.set(
              _pos.x + offsetPos.x,
              _pos.y + offsetPos.y,
              _pos.z + offsetPos.z
            );
          } else {
            _v3.set(_pos.x, _pos.y, _pos.z);
          }
          _mesh.setPositionAt(i, _v3);
        }
        _mesh.needsUpdate('position');

        for (let i = 0; i < self.rotations.length; ++i) {
          _rot = self.rotations[i];

          _eul.set(_rot.x, _rot.y, _rot.z);
          _q.setFromEuler(_eul);
          if (offsetRot) {
            _eul.set(offsetRot.x, offsetRot.y, offsetRot.z);
            _q2.setFromEuler(_eul);
            _mesh.setQuaternionAt(i, _q2.premultiply(_q));
          } else {
            _mesh.setQuaternionAt(i, _q);
          }

          _mesh.setScaleAt(i, _v3.set(1, 1, 1));
        }
        _mesh.needsUpdate('quaternion');
      }
    };
  })(),

  removePart: function(self, el, part) {
    for (let key in self.meshes) {
      if (!self.meshes.hasOwnProperty(key)) {
        continue;
      }
      if (!key.startsWith(part)) {
        continue;
      }
      el.removeObject3D(key);
      delete self.meshes[key];
    }
  },

  findMeshesInScene: function(scene) {
    if (!scene.children || !scene.children.length) {
      return scene.type === 'Mesh' ? [scene] : null;
    }

    let resp = null;

    for (let i = 0; i < scene.children.length; ++i) {
      let meshes = this.findMeshesInScene(scene.children[i]);
      if (meshes) {
        if (!resp) {
          resp = [];
        }
        for (let j = 0; j < meshes.length; ++j) {
          resp.push(meshes[j]);
        }
      }
    }

    return resp;
  },

  updatePart: function(self, el, part, src) {
    if (!src) {
      return;
    }

    self.removePart(self, el, part);

    self.loader.load(
      src,
      function gltfLoaded(gltfModel) {
        self.models[part] = gltfModel.scene || gltfModel.scenes[0];
        self.models[part].animations = gltfModel.animations;

        const meshes = self.findMeshesInScene(self.models[part]);
        for (let i = 0; i < meshes.length; ++i) {
          const mesh = meshes[i];
          const meshName = part + '__' + mesh.name;
          self.meshes[meshName] = new InstancedMesh(
            mesh.geometry,
            mesh.material,
            self.positions.length,
            false,
            false,
            true
          );
          el.setObject3D(meshName, self.meshes[meshName]);
        }

        self.updateMeshPositions(self, el, part);
      },
      undefined /* onProgress */,
      function gltfFailed(error) {
        const msg =
          error && error.message ? error.message : 'Failed to load glTF model';
        console.log(msg);
      }
    );
  },

  update: function() {
    const self = this;

    const el = self.el;
    const { body, lefthand, righthand } = self.data;

    const { positions, rotations } = self.getRobotPositionsAndRotations(
      self,
      el
    );
    self.positions = positions;
    self.rotations = rotations;

    self.updatePart(self, el, 'body', body);
    self.updatePart(self, el, 'lefthand', lefthand);
    self.updatePart(self, el, 'righthand', righthand);
  },

  tick: function(t, dt) {
    const el = this.el;
    const frames = el.sceneEl.systems.frames.frames;

    const { isPlaying, timestamp, updatedTime } = el.sceneEl.components.youtube;

    const tweenedTime =
      isPlaying && timestamp > 0
        ? timestamp + Math.max((t - updatedTime) / 1000, 0)
        : timestamp;

    let frame = null;
    for (let i = this.prevFrameIdx || 0; i < frames.length; ++i) {
      if (frames[i] && frames[i].Timestamp > tweenedTime) {
        if (i > 0) {
          frame = frames[i - 1];
          this.prevFrameIdx = i - 1;
        }
        break;
      }
    }

    if (this.positions.length === 0) {
      const { positions, rotations } = this.getRobotPositionsAndRotations(
        this,
        el
      );
      this.positions = positions;
      this.rotations = rotations;
    } else {
      if (frame) {
        const pos = this._cachedtickpos || new THREE.Vector3();
        if (!this._cachedtickpos) {
          this._cachedtickpos = pos;
        }
        const rot = this._cachedtickrot || new THREE.Vector3();
        if (!this._cachedtickrot) {
          this._cachedtickrot = rot;
        }
        pos.x = -frame['EyePosX'];
        pos.y = frame['EyePosY'];
        pos.z = -frame['EyePosZ'];
        rot.x = -THREE.Math.DEG2RAD * frame['EyeRotX'];
        rot.y = THREE.Math.DEG2RAD * frame['EyeRotY'];
        rot.z = -THREE.Math.DEG2RAD * frame['EyeRotZ'];
        this.updateMeshPositions(this, el, 'body', pos, rot);
        pos.x = -frame['RightHandPosX'];
        pos.y = frame['RightHandPosY'];
        pos.z = -frame['RightHandPosZ'];
        rot.x = -THREE.Math.DEG2RAD * frame['RightHandRotX'];
        rot.y = THREE.Math.DEG2RAD * frame['RightHandRotY'];
        rot.z = -THREE.Math.DEG2RAD * frame['RightHandRotZ'];
        this.updateMeshPositions(this, el, 'lefthand', pos, rot);
        pos.x = -frame['LeftHandPosX'];
        pos.y = frame['LeftHandPosY'];
        pos.z = -frame['LeftHandPosZ'];
        rot.x = -THREE.Math.DEG2RAD * frame['LeftHandRotX'];
        rot.y = THREE.Math.DEG2RAD * frame['LeftHandRotY'];
        rot.z = -THREE.Math.DEG2RAD * frame['LeftHandRotZ'];
        this.updateMeshPositions(this, el, 'righthand', pos, rot);
      } else {
        //console.log('no frame');
      }
    }
  },
});



// WEBPACK FOOTER //
// ./src/components/robots.js