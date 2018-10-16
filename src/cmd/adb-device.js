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
  var devices = adbtk.getDevices();
  // console.log(devices);
  this.device = devices[0];
}

ADB.prototype = {
  getBrowsers: function() {
    return new Promise(resolve => {
      resolve(adbtk.getBrowsers());
    });
  },
  killBrowser: function(browser) {
    return new Promise(resolve => {    
      adbtk.forceStop(browser.package, resolve);
    });  
  },
  launchBrowser: function(browser, url) {
    return new Promise(resolve => {
      adbtk.launchUrl(url, 'fxr');
      resolve();
    });
  }
}

module.exports = new ADB();
