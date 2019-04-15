const {spawn} = require('child_process');
const Stats = require('../summary/stats');

module.exports = {
  results: [],
  process: null,
  stats: {},
  name: 'oculus_vrapi',
  enabled: false,
  init: function () {
    var filter = ['FPS', 'Tear', 'Early', 'Stale', 'Mem', 'App'];

    filter.forEach(name => {
      this.stats[name.toLowerCase()] = new Stats();
    });

    spawn('adb', ['logcat', '-c']);
    this.process = spawn('adb', ['logcat', '-s', 'VrApi']);

    var params = {};
    this.process.stdout.on('data', data => {
      var line = data.toString();
      if (line.indexOf('VrApi') === -1 || line.indexOf('FPS') === -1 || line.indexOf('Stale') === -1) {
        // Skip non stats data
        return;
      }
      line = line.substr(line.indexOf('VrApi   :') + 10);
      line = line.split(',');
      line.forEach((param,i) => {
        param = param.split('=');

        var value = param[1];
        if (filter.indexOf(param[0]) === -1) {
          return;
        }
        if (value) {
          value = value.replace('ms', '').replace('MB', '').replace('MHz', '');
          value = isNaN(value) ? value : parseFloat(value);
        } else {
          value = '';
        }
        if (this.enabled) {
          this.stats[param[0].toLowerCase()].update(value);
        }
        params[param[0]] = value;
      });
      //@todo if verbose
      // console.log(this.enabled ? '' : 'Skipped', params);
    });
  },
  stop: function () {
    this.process.kill();
    return this.stats;
  }
}
