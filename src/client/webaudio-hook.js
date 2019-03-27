var oriDecodeData = AudioContext.prototype.decodeAudioData;

var WebAudioHook = {
  stats: {
    numAudioBuffers: 0,
    totalDuration: 0,
    totalLength: 0,
    totalDecodeTime: 0
  },
  enable: function (fake) {
    var self = this;
    AudioContext.prototype.decodeAudioData = function() {
      var prev = performance.realNow();
      if (fake) {
        var ret = new Promise((resolve, reject) => {
          self.stats.totalDecodeTime += performance.realNow() - prev;
          resolve(new AudioBuffer({length: 1, sampleRate: 44100}));
          self.stats.numAudioBuffers++;
          self.stats.totalDuration += audioBuffer.duration;
          self.stats.totalLength += audioBuffer.length;
      });
      } else {
        var promise = oriDecodeData.apply(this, arguments);
        var ret = new Promise((resolve, reject) => {
          promise.then(audioBuffer => {
            self.stats.totalDecodeTime += performance.realNow() - prev;
            resolve(audioBuffer);
            self.stats.numAudioBuffers++;
            self.stats.totalDuration += audioBuffer.duration;
            self.stats.totalLength += audioBuffer.length;
          });
        });
      }
      return ret;
    }
  },
  disable: function () {
    AudioContext.prototype.decodeAudioData = oriDecodeData;
  }
};

export default WebAudioHook;