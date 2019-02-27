const detectBrowsers = require('detect-browsers');
const { spawn } = require('child_process');
var ps = require('ps-node');

module.exports = {
  deviceProduct: 'localdevice',
  serial: '',
  name: 'PC',
  getInstalledBrowsers: function() {
    return new Promise((resolve, reject) => {
      detectBrowsers.getInstalledBrowsers()
      .then(browsers => {
        resolve(browsers.map(
          browser => {
            return {
              name: browser.name,
              code: browser.name.toLowerCase(),
              launchCmd: browser.executablePath,
              versionCode: '',
              versionName: ''
            };
          })
        );
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
          //console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
          ps.kill(pid, 'SIGKILL', function( err ) {
            //console.log('Killed');
            resolve();
          });
        }
        else {
          //console.log( 'No such process found!' );
          resolve();
        }
      });  
    });  
  },
  launchBrowser: function(browser, url, extraParams) {
    return new Promise(resolve => {
      /*
      if (browser.code === 'safari') {
        var cp = opn(url, {app: browser.launchCmd}).then(() => {
          resolve();
        }).catch(err => {
          console.log(err)
        });
      } else 
      */
      var options = [];
      if (browser.code.indexOf('chrome') !== -1) {
        options = [
          '--incognito',
          '--disable-restore-session-state',
          '--no-default-browser-check',
          '--no-first-run'
        //  '--allow-file-access-from-files'
        ];
      } else if (browser.code.indexOf('firefox') !== -1) {
      } else if (browser.code.indexOf('safari') !== -1) {
        // Safari has a bug that a command line 'Safari http://page.com' does not launch that page,
        // but instead launches 'file:///http://page.com'. To remedy this, must use the open -a command
        // to run Safari, but unfortunately this will end up spawning Safari process detached from emrun.
        //if MACOS:
        browser.launchCmd = 'open';
        options = ['-a', 'Safari'];
      }
      //options.push(extraParams);

      options.push(url);
      this.lastOpenProcess = spawn(browser.launchCmd, options);
      resolve(this.lastOpenProcess);
      this.lastOpenProcess.on('close', () => {
        //console.log('Unexpected closed!');
        // @todo
      });
      
      /*
      var cp = opn(url, {app: browser.launchCmd}).then(() => {
        resolve();
      });*/
    });
  }
};