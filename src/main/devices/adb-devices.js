var adbtk = require('adb-toolkit');

function findFriendlyName(deviceProduct) {
  const names = {
    'Pacific': 'Oculus Go',
    'VR_1541F': 'Mirage Solo'
  };

  return names[deviceProduct] || deviceProduct.replace(/_/gi, ' ');
}

function ADB() {
  this.devices = [];
  adbtk.getDevices().forEach(device => {
    device.name = findFriendlyName(device.deviceProduct);
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
          url = url.replace(/\(/gi, '%28');
          url = url.replace(/\)/gi, '%29');
          //url = encodeURI(url);
          url = url.replace(/\&/gi, '\\&');
      
          this.launchUrl(url, browser.code, {silent: false});
          resolve();
        });
      },
      removeAPK: function(packageName) {
        return new Promise(resolve => {
          this.uninstallPackage(packageName, resolve);
        });
      },
      installAPK: function(package) {
        return new Promise(resolve => {
          this.installPackage(package, resolve);
        });
      },
      existAPK: function(packageName) {
        return this.existPackage(packageName);
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
