const detectBrowsers = require('detect-browsers');
const opn = require('opn');
var killProcess = require('kill-process');
const findProcess = require('find-process');
const { spawn } = require('child_process');
var ps = require('ps-node');

module.exports = {
  lastOpenProcess: null,
  getBrowsers: function() {
    return new Promise((resolve, reject) => {
      detectBrowsers.getInstalledBrowsers()
      .then(browsers => {
        resolve(browsers.map(browser => {browser.name = browser.name.toLowerCase(); return browser}));
      })
      .catch( error => reject(error));
    });
  },
  killBrowser: function(browser) {
    return new Promise(resolve => {
      const pid = this.lastOpenProcess.pid;
      ps.lookup({ pid: pid }, function(err, resultList ) {
        if (err) {
          throw new Error( err );
        }
     
        var process = resultList[ 0 ];
        if(process) {
          console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
          ps.kill(pid, 'SIGKILL', function( err ) {
            console.log('Killed');
            resolve();
          });
        }
        else {
          console.log( 'No such process found!' );
        }
      });  
      /*
      findProcess('cmd', browser.executablePath).then(list => {
        console.log('* killing', browser);
        list.forEach(p => killProcess(p.pid));
        resolve();
      });
      */
    });  
  },
  launchBrowser: function(browser, url) {
    return new Promise(resolve => {
      /*
      if (browser.name === 'safari') {
        var cp = opn(url, {app: browser.executablePath}).then(() => {
          resolve();
        }).catch(err => {
          console.log(err)
        });
      } else 
      */
     console.log(browser.executablePath);
     this.lastOpenProcess = spawn(browser.executablePath, 
        [
          '--incognito',
          '--enable-nacl',
          '--enable-pnacl',
          '--disable-restore-session-state',
          '--enable-webgl',
          '--no-default-browser-check',
          '--no-first-run',
          '--allow-file-access-from-files',
          url
        ]);
      resolve();
      
      /*
      var cp = opn(url, {app: browser.executablePath}).then(() => {
        resolve();
      });*/
    });
  }
};