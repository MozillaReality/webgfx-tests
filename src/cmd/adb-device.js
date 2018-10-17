var adbtk = require('adb-toolkit');
/*
var devices = adbtk.getDevices();
console.log('========== DEVICES =========');
console.log(devices);

devices.forEach(device => {
  console.log('---------- DEVICE ----------');
  console.log(adbtk.getDeviceInfo(device.serial));
  console.log(adbtk.getDeviceProps(device.serial));
  console.log(adbtk.getPackages(device.serial));
  console.log(adbtk.getPackageInfo(device.serial, 'com.android.chrome'));
});
*/

function ADB(serial) {
  this.devices = adbtk.getDevices();
  // console.log(devices);
  this.device = this.devices[0];
}

ADB.prototype = {
  getBrowsers: function() {
    return new Promise(resolve => {
      resolve(this.device.getBrowsers());
    });
  },
  killBrowser: function(browser) {
    return new Promise(resolve => {    
      this.device.forceStop(browser.package, resolve);
    });  
  },
  launchBrowser: function(browser, url) {
    return new Promise(resolve => {
      this.device.launchUrl(url, browser.code);
      resolve();
    });
  }
}

module.exports = new ADB();
