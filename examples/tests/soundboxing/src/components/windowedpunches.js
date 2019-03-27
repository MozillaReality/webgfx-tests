const soundPool = require('../lib/soundpool');

const MISS_SOUND = '/assets/sounds/ui_scifi_hightech_error.wav';

AFRAME.registerSystem('windowedpunches', {
  schema: {
    start: { type: 'float', default: -100 },
    end: { type: 'float', default: 2 },
  },

  reset: function() {
    this.punches.all.length = 0;
    this.punches.left.length = 0;
    this.punches.right.length = 0;
    this.indexStart.left = 0;
    this.indexStart.right = 0;
    this.indexEnd.left = 0;
    this.indexEnd.right = 0;
    this.ranges.all.x.min = -1;
    this.ranges.all.x.max = -1;
    this.ranges.all.y.min = -1;
    this.ranges.all.y.max = -1;
    this.ranges.left.x.min = -1;
    this.ranges.left.x.max = -1;
    this.ranges.left.y.min = -1;
    this.ranges.left.y.max = -1;
    this.ranges.right.x.min = -1;
    this.ranges.right.x.max = -1;
    this.ranges.right.y.min = -1;
    this.ranges.right.y.max = -1;
  },

  init: function() {
    this.updateMinMax = this.updateMinMax.bind(this);
    this.advanceWindow = this.advanceWindow.bind(this);

    this.punches = { all: [], left: [], right: [] };
    this.indexStart = { left: 0, right: 0 };
    this.indexEnd = { left: 0, right: 0 };
    this.ranges = { all: {x: {min: -1, max: -1}, y: {min: -1, max: -1}},
                    left: {x: {min: -1, max: -1}, y: {min: -1, max: -1}},
                    right: {x: {min: -1, max: -1}, y: {min: -1, max: -1}} }
    this.reset();

    this.missSoundPool = soundPool(MISS_SOUND, 0.65, 5);

    this.el.addEventListener('challengeloaded', evt => {
      var punch;
      var newPunchData = evt.detail.punches;

      this.reset();

      for (i = 0; i < newPunchData.length; i++) {
        punch = newPunchData[i];
        this.punches.all.push(punch);
        this.updateMinMax(punch, this.ranges.all);
        if (punch.isLeft) {
          this.punches.left.push(punch);
          this.updateMinMax(punch, this.ranges.left);
        } else {
          this.punches.right.push(punch);
          this.updateMinMax(punch, this.ranges.right);
        }
      }
      
      this.el.emit('setpunches');
    });
  },

  advanceWindow: function(hand, tweenedTime) {
    const sceneEl = this.el.sceneEl;
    const velocity = sceneEl.systems.state.state.velocity;
    const { start, end } = this.data;
    const prevIndexStart = this.indexStart[hand];
    const punches = this.punches[hand];

    let i;
    let punch;

    for (i = prevIndexStart; i < punches.length; ++i) {
      punch = punches[i];
      punch.zz = (tweenedTime - punch.timestamp) * velocity;
      if (punch.zz > end) {
        this.indexStart[hand]++;
      }
      if (punch.zz < start) {
        this.indexEnd[hand] = Math.max(i - 1, this.indexStart[hand]);
        break;
      }
    }

    let isHitMiss = false;
    if (this.indexStart[hand] > prevIndexStart) {
      for (i = prevIndexStart; i < this.indexStart[hand] && !isHitMiss; ++i) {
        punch = punches[i];
        if (punch && !punch.punched) {
          isHitMiss = true;
        }
      }
    }
    return isHitMiss;
  },

  updateMinMax: function(punch, range) {
    if (range.x.min === -1 || range.x.min >= punch.x) {
      range.x.min = punch.x;
    }
    if (range.x.max === -1 || range.x.max <= punch.x) {
      range.x.max = punch.x;
    }
    if (range.y.min === -1 || range.y.min >= punch.y) {
      range.y.min = punch.y;
    }
    if (range.y.max === -1 || range.y.max <= punch.y) {
      range.y.max = punch.y;
    }
  },

  tick: function(t, dt) {
    const sceneEl = this.el.sceneEl;
    const { isPlaying, timestamp, updatedTime } = sceneEl.components.youtube;
    const {
      leftPunchesActive,
      rightPunchesActive,
    } = sceneEl.systems.state.state;
    const tweenedTime =
      isPlaying && timestamp > 0
        ? timestamp + Math.max((t - updatedTime) / 1000, 0)
        : timestamp;

    let isHitMiss = false;
    if (rightPunchesActive) {
      isHitMiss |= this.advanceWindow('right', tweenedTime);
    }
    if (leftPunchesActive) {
      isHitMiss |= this.advanceWindow('left', tweenedTime);
    }

    if (isHitMiss) {
      sceneEl.emit('hitmiss');
      if (sceneEl.systems.state.state.inVR) {
        this.missSoundPool.play();
      }
    }
  },
});



// WEBPACK FOOTER //
// ./src/components/windowedpunches.js