#!/usr/bin/env node
var program = require('commander');
var initHTTPServer = require('./server/http_server');
var initWebSocketServer = require('./server/websockets_server');
const fs = require('fs');
const chalk = require('chalk');
const ADBDevices = require('./devices/adb-devices');
const LocalDevice = require('./devices/local-device');
const TestUtils = require('./testsmanager/device');
const PrettyPrint = require('./prettyprint');
const packageInfo = require('../../package.json');
const path = require('path');
const Summary = require('./summary');

//-----------------------------------------------------------------------------
// START SERVER
//-----------------------------------------------------------------------------
program
  .version(packageInfo.version);

//-----------------------------------------------------------------------------
// SUMMARY
//-----------------------------------------------------------------------------
program
.command('summary [fileList...]')
.description('Generate a summary from JSON results')
.option("-g, --groupby [attribute]", "Group by: test (default), device, browser, file", 'test')
.option("-f, --filter [attributes]", 'List of attributes to show (Comma separated)')
//.option("-v, --verbose", "Show all the information available")
.action((fileList, options) => {
  var results = Summary.mergeResultsFromFiles(fileList);
  var filter = typeof options.filter !== 'undefined' ? options.filter.split(',') : null;
  Summary.printComparisonTable(results, options.groupby, filter);
});

//-----------------------------------------------------------------------------
// LIST TESTS
//-----------------------------------------------------------------------------
program
  .command('list-tests')
  .description('Lists tests')
  .option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
  .option("-v, --verbose", "Show all the information available")
  .action((options) => {
    console.log('Tests list\n----------');
    
    const configfile = options.configfile || 'webgfx-tests.config.json';
    const testsDb = TestUtils.getTestsDb(configfile);
    if (testsDb === false) {
      console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}. Please use ${chalk.yellow('-c <config filename>')}`);
      return;
    }

    if (options.verbose) {
      PrettyPrint.json(testsDb);
    } else {
      testsDb.forEach(test => {
        console.log(`- ${chalk.yellow(test.id)}: ${test.name}`);
      });  
    }
  });

//-----------------------------------------------------------------------------
// LIST DEVICES
//-----------------------------------------------------------------------------
program
  .command('list-devices')
  .description('Lists ADB devices')
  .option("-v, --verbose", "Show all the information available")
  .action((options) => {
    console.log('Device list\n-----------');
    var devices = getDevices(true);
    devices.push(LocalDevice);

    if (options.verbose) {
      PrettyPrint.json(devices);
    } else {
      devices.forEach(device => {
        console.log(`- Device: ${chalk.green(device.name)} (Product: ${chalk.yellow(device.deviceProduct)}) (SN: ${chalk.yellow(device.serial)})`);
      });
    }
  });

function getDevices(adb) {
  var devices;
  if (typeof adb !== 'undefined') {
    if (typeof adb == 'string') {
      devices = ADBDevices.getDevices(adb.split(','));
    } else {
      devices = ADBDevices.getDevices();
    }
  } else {
    devices = [LocalDevice];
  }
  return devices;
}

//-----------------------------------------------------------------------------
// LIST BROWSERS
//-----------------------------------------------------------------------------
program
  .command('list-browsers')
  .description('List browsers')
  .option("-a, --adb [deviceserial]", "Use ADB to connect to an android device")
  .option("-v, --verbose", "Show all the information available")
  .action((options) => {

    var devices = getDevices(options.adb);

    function listBrowserByDevice(device) {
      device.getInstalledBrowsers()
        .then(browsers => {
          if (browsers.length === 0) {
            console.log('No ADB devices found');
          } else {
            console.log(`Browsers on device: ${chalk.yellow(device.name)} (serial: ${chalk.yellow(device.serial)})`);
            console.log('-----------------------------------------------------');
            if (options.verbose) {
              PrettyPrint.json(browsers);
            } else {
              console.log(browsers.map(b => chalk.yellow(b.code)).join('\n'));
            }              
            console.log('-----------------------------------------------------\n');
          }
        })
        .catch(error => console.error(error));  
    }

    devices.forEach(device => {
      listBrowserByDevice(device);
    });
  });

//-----------------------------------------------------------------------------
// START SERVER
//-----------------------------------------------------------------------------
program
  .command('start-server')
  .description('Start tests server')
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
  .option("-v, --verbose", "Show all the information available")
  .action(options => {
    const configfile = options.configfile || 'webgfx-tests.config.json';

    const config = TestUtils.getConfig(configfile);
    if (config === false) {
      console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}`);
    } else {
      initHTTPServer(options.port, config, options.verbose);
      initWebSocketServer(options.wsport, null, options.verbose);
    }
  });

//-----------------------------------------------------------------------------
// RUN TESTS
//-----------------------------------------------------------------------------
program
  .command('run [testIDs]')
  .description('run tests')
  .option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .option("-b, --browser <browser names>", "Which browsers to use (Comma separated)")
  .option("-a, --adb [devices]", "Use android devices through ADB")
  .option("-p, --package <package names>", "Browser packages (apk) to install and execute the tests (Comma separated)")
  .option("-i, --info <extra info>", "Add extra info to be displayed on the browser when running the test (eg: browser codename)")
  .option("-n, --numtimes <number>", "Number of times to run each test")
  .option("-o, --outputfile <file>", "Store test results on a local file")
  .option("-v, --verbose", "Show all the info available")
  .action((testIDs, options) => {
    const configfile = options.configfile || 'webgfx-tests.config.json';

    const config = TestUtils.getConfig(configfile);
    if (config === false) {
      console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}`);
      return;
    }

    var testsToRun;
    if (testIDs && testIDs !== 'all') {
      var testsIDs = testIDs.split(',');
      testsToRun = config.tests.filter(test => testsIDs.indexOf(test.id) !== -1);
    } else {
      testsToRun = config.tests;
    }

    var numOutputTests = 0;

    function onTestsFinish() {
      if (--numRunningDevices === 0) {
        console.log(`\n${chalk.yellow('TESTS FINISHED')}!`);
        if (options.outputfile) {
          console.log(`Writing output file: ${chalk.yellow(options.outputfile)}`);
          fs.appendFile(options.outputfile, ']', (err) => {  
            if (err) throw err;
            process.exit();
          });
        } else {
          process.exit();
        }  
      } else {
        console.log('-- Device finished. Remaining: ', numRunningDevices);
      }
    }

    if (testsToRun.length === 0) {
      console.log('ERROR: Tests not found.');
      return;
    } else {
      console.log('Test to run:', testsToRun.map(t => chalk.green(t.id)).join(', '));
      var devices = getDevices(options.adb);
      if (devices.length === 0) {
        console.log('ERROR: No device found!');
        return;
      }

      initHTTPServer(options.port, config, options.verbose);
      initWebSocketServer(options.wsport, function (data) {
        if (options.outputfile) {
          var testRunData = TestUtils.TestsData.getTestData(data.testUUID);
          data.browser = {
            name: testRunData.browser.name,
            code: testRunData.browser.code,
            versionCode: testRunData.browser.versionCode,
            versionName: testRunData.browser.versionName
          };
          data.device = {
            name: testRunData.device.name,
            deviceProduct: testRunData.device.deviceProduct,
            serial: testRunData.device.serial
          };
          fs.appendFile(options.outputfile, (numOutputTests === 0 ? '' : ',') + JSON.stringify(data, null, 2), (err) => {  
            if (err) throw err;
            numOutputTests++;
          });
        }

        var testRunData = TestUtils.TestsData.getTestData(data.testUUID);
        if (!testRunData) {
          console.log('ERROR: No test data found');
          process.exit();
        }

        var testsManager = testsManagers[testRunData.device.serial];
        testRunData.device.killBrowser(testsManager.getRunningTest().browser).then(() => {
          testsManager.runNextQueuedTest();
        });
      }, options.verbose);
      
      var testsManagers = {};
      var numRunningDevices = devices.length;

      devices.forEach(async device => {
        if (options.package) {
          var browsersData = [
            {
              name: 'Firefox Reality', 
              code: 'fxr', 
              package: 'org.mozilla.vrbrowser'
            },
            {
              name: 'Chrome', 
              code: 'chrome',
              package: 'com.android.chrome'
            },
            {
              name: 'Chrome Canary', 
              code: 'canary',
              package: 'com.chrome.canary'
            },
            {
              name: 'Oculus Browser', 
              code: 'oculus',
              package: 'com.oculus.browser'
            }
          ];
          
          async function asyncForEach(array, callback) {
            for (let index = 0; index < array.length; index++) {
              await callback(array[index], index, array);
            }
          }

          var apks = options.package.split(',');

          await asyncForEach(apks, async apk => {
            var reader = await require('node-apk-parser-promise').load(apk)
            var manifest = await reader.readManifest();
            
            // Get the APK's AndroidManifest.xml object
            var browserData = browsersData.find(browserData => browserData.package === manifest.package);

            if (!browserData) {
              console.log('Unrecognized browser: ', manifest.package);
            } else {
              console.log(`Installing package ${chalk.yellow(apk)} (${chalk.yellow(browserData.name + ' v.' + manifest.versionName + ' - c.' + manifest.versionCode)}) on device: ${chalk.yellow(device.name)} (serial: ${chalk.yellow(device.serial)})`);
              
              if (device.existAPK) {
                await device.removeAPK(browserData.package);
              }
              await device.installAPK(apk);
              var browsers = await device.getInstalledBrowsers();

              var browsersToRun = browsers.filter(b => browserData.package === b.package);

              var browser = browsersToRun[0];

              const apkFilename = path.basename(apk);
              const extraInfo = `(${apkFilename} ${options.info ? options.info : ''})`;

              const versionName = browser.versionName ? 'v.' + browser.versionName : '';
              const versionCode = browser.versionCode ? 'v.' + browser.versionCode : '';

              browser.info = `${browser.name} (${browser.package}) ${versionName} ${versionCode} ${extraInfo}`;

              var testsManager = testsManagers[device.serial] = new TestUtils.TestsManager(device, testsToRun, browsersToRun, {numTimes: options.numtimes || 1});
              await testsManager.runTests();
            }
            reader.close();
          });
          onTestsFinish();
        } else {
          var browsersToRun;
          console.log(`Running on device: ${chalk.yellow(device.name)} (serial: ${chalk.yellow(device.serial)})`);
          var browsers = await device.getInstalledBrowsers();
          browsersToRun = browsers;
          if (options.browser && options.browser !== 'all') {
            var browserOptions = options.browser.split(',');
            browsersToRun = browsers.filter(b => browserOptions.indexOf(b.code) !== -1);
          } 
  
          if (options.outputfile) {
            fs.writeFile(options.outputfile, '[', err => {
              if (err) throw err;
            });
          }

          browsersToRun.forEach(browser => {
            const extraInfo = '';
            const versionName = browser.versionName ? 'v.' + browser.versionName : '';
            const versionCode = browser.versionCode ? 'v.' + browser.versionCode : '';

            browser.info = `${browser.name} ${versionName} ${versionCode} ${extraInfo}`;
          });
  
          console.log(`Browsers to run on device ${chalk.green(device.name)}:`, browsersToRun.map(b => chalk.yellow(b.name)).join(', '));
    
          var testsManager = testsManagers[device.serial] = new TestUtils.TestsManager(device, testsToRun, browsersToRun, {numTimes: options.numtimes || 1}, {});
          await testsManager.runTests();
          onTestsFinish();
        }    
      });
    }
});

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}