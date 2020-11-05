const RealRelativeOrientationSensor = typeof RelativeOrientationSensor !== 'undefined'
  ? RelativeOrientationSensor : undefined;

// @TODO: Support record and replay.

class MockRelativeOrientationSensor {
  constructor(options = {}) {
    this._options = options;
    this.quaternion = [0, 0, 0, 1];
    this._matrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  populateMatrix(targetMatrix) {
    for (let i = 0; i < 16; i++) {
      targetMatrix[i] = this._matrix[i];
    }
  }

  start() {
  }

  // Ideally this class shoukd have all mock EventTarget methods and properties
  // but declaring used well ones so far.
  addEventListener(type, callback) {
  }

  removeEventListener(type, callback) {
  }
}

export default {
  enabled: false,
  enable: function () {
    if (this.enabled || !RealRelativeOrientationSensor) {
      return;
    }
    RelativeOrientationSensor = MockRelativeOrientationSensor;
    this.enabled = true;
  },
  disable: function () {
    if (!this.enabled || !RealRelativeOrientationSensor) {
      return;
    }
    RelativeOrientationSensor = RealRelativeOrientationSensor;
    this.enabled = false;
  }
};
