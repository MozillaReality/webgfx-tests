var adbtk = require('adb-toolkit');

function ADB() {
  this.devices = [];
  adbtk.getDevices().forEach(device => {
    this.devices.push(device);
    device.oldGetBrowsers = device.getBrowsers;
    Object.assign(device, {
      getBrowsers: function() {
        return new Promise(resolve => {
          resolve(this.oldGetBrowsers());
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
    return this.devices.filter(s => s.serial === serial);
  },
  getDevices: function(serials) {
    if (serials instanceof Array) {
      return serials.map(serial => this.getDevice(serial));
    }
    return this.devices;
  }
}

module.exports = new ADB();
