var adbtk = require('adb-toolkit');

function ADB() {
  this.devices = [];
  adbtk.getDevices().forEach(device => {
    this.devices.push(device);
    Object.assign(device, {
      getInstalledBrowsers: function(filter) {
        return new Promise(resolve => {
          resolve(this.getBrowsers(filter));
        });
      },
      killBrowser: function(browser) {
        return new Promise(resolve => {    
          this.forceStop(browser.package, resolve);
        });  
      },
      launchBrowser: function(browser, url) {
        return new Promise(resolve => {
          this.launchUrl(url, browser.code);
          resolve();
        });
      }
    });
  });
}

ADB.prototype = {
  getDevice: function(serial) {
    return this.devices.find(s => s.serial === serial);
  },
  getDevices: function(serials) {
    if (serials instanceof Array) {
      return this.devices.filter(s => serials.indexOf(s.serial) !== -1);
    }
    return this.devices;
  }
}

module.exports = new ADB();
