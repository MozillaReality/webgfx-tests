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
const internalIp = require('internal-ip');

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
// GENERATE INDEX
//-----------------------------------------------------------------------------
program
.command('create-page')
.description('Generate an index.html page with the links from the tests')
.option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
.action(options => {
  const configfile = options.configfile || 'webgfx-tests.config.json';
  const testsDb = TestUtils.getTestsDb(configfile);
  if (testsDb === false) {
    console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}. Please use ${chalk.yellow('-c <config filename>')}`);
    return;
  }
  var testRows = '';
  testsDb.forEach(test => {
    testRows += `<tr v-for="test in tests">
      <td>${test.id}</td>
      <td>${test.name}</td>
      <td>${test.engine}</td>
      <td><a href="${test.url}">launch</a></td>
    </tr>`;

  });

  var outputHTML = `
  <table>
    <thead>
      <th>ID</th>
      <th>Name</th>
      <th>Engine</th>
      <th>Launch</th>
    </thead>
    <tbody>${testRows}</tbody>
  </table>`;

  const fs = require('fs');
  fs.writeFile("index.html", outputHTML, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Index file generated: index.html");
  });
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
  .option("-a, --adb [devices]", "Use android devices through ADB")
  .option("-b, --launchbrowser <browser name>", "Which browser to use to launch the front page")
  .option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
  .option("-v, --verbose", "Show all the information available")
  .action(async options => {
    const configfile = options.configfile || 'webgfx-tests.config.json';

    const config = TestUtils.getConfig(configfile);
    if (config === false) {
      console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}`);
    } else {

      initHTTPServer(options.port, config, options.verbose);
      initWebSocketServer(options.wsport, (data, io) => {
        io.emit('test_finished', data);
      }, options.verbose);

      if (options.launchbrowser) {
        var devices = getDevices(options.adb);
        if (devices.length === 0) {
          console.log('ERROR: No device found!');
          return;
        }
        var device = devices[0];

        var browsers = await device.getInstalledBrowsers();
        var browserToRun;
        if (typeof options.launchbrowser !== 'undefined') {
          browserToRun = browsers.find(b => b.code === options.launchbrowser);
        } else {
          browserToRun = browsers[0];
        }

        if (typeof browserToRun === 'undefined') {
          console.log(`ERROR: Browser not found for code: ${options.launchbrowser}`);
        } else {
          var url = `http://${internalIp.v4.sync() || 'localhost'}:${options.port || 3000}`;
          device.launchBrowser(browserToRun, url);
        }
      }
    }
  });

//-----------------------------------------------------------------------------
// RUN TESTS
//-----------------------------------------------------------------------------
program
  .command('run [testIDs...]')
  .description('run tests')
  .option("-a, --adb [devices]", "Use android devices through ADB")
  .option("-b, --browser <browser names>", "Which browsers to use (Comma separated)")
  .option("-c, --configfile <configFile>", "Config file (default webgfx-tests.config.json)")
  .option("-e, --appendfile <file>", "Store test results on a local file appending")
  .option("-h, --localhost", "Use localhost instead of the server ip (if you have enabled adb reverse ports)")
  .option("-i, --info <extra info>", "Add extra info to be displayed on the browser when running the test (eg: browser codename)")
  .option("-k, --package <package names>", "Browser packages (apk) to install and execute the tests (Comma separated)")
  .option("-l, --launchparams <additional parameters>", "Additional parameters to launch the browser")
  .option("-n, --numtimes <number>", "Number of times to run each test")
  .option("-o, --outputfile <file>", "Store test results on a local file")
  .option("-p, --port <port_number>", "HTTP Server Port number (Default 3333)")
  .option("-r, --overrideparams <additional parameters>", "Override parameters on individual execution (eg: \"fake-webgl&width=800&height=600\"")
  .option("-v, --verbose", "Show all the info available")
  .option("-w, --wsport <port_number>", "WebSocket Port number (Default 8888)")
  .action((testsIDs, options) => {
    const configfile = options.configfile || 'webgfx-tests.config.json';

    const config = TestUtils.getConfig(configfile);
    if (config === false) {
      console.log(`${chalk.red('ERROR')}: error loading config file: ${chalk.yellow(configfile)}`);
      return;
    }
    var testsToRun;
    if (testsIDs && testsIDs !== 'all') {
      testsToRun = config.tests.filter(test => {
        return testsIDs.find(selector => {
          return new RegExp("^" + selector.split("*").join(".*") + "$").test(test.id);
        });
      });
    } else {
      testsToRun = config.tests;
    }

    var numOutputTests = 0;
    var outputFile = options.outputfile || options.appendfile;

    function onTestsFinish() {
      if (--numRunningDevices === 0) {
        console.log(`\n${chalk.yellow('TESTS FINISHED')}!`);
        if (outputFile) {
          console.log(`Writing output file: ${chalk.yellow(outputFile)}`);
          fs.appendFile(outputFile, ']', (err) => {
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

      if (outputFile) {
        // If file doesn't exist create it even if --appendfile option is used
        if (options.outputfile || !fs.existsSync(outputFile)) {
          try {
            fs.unlinkSync(outputFile);
          } catch(err) {
            //console.error(err)
          }
          fs.writeFile(outputFile, '[', err => {
            if (err) throw err;
          });
        } else {
          // If appending we should remove the lat ']' and replace it with a ','
          var data = fs.readFileSync(outputFile);
          var json = JSON.parse(data);
          var origin = JSON.stringify(json, null, 2);
          origin = origin.substr(0, origin.length - 1) + ',';
          fs.writeFile(outputFile, origin, err => {
            if (err) throw err;
          });
        }
      }

      initHTTPServer(options.port, config, options.verbose);
      var websockets = initWebSocketServer(options.wsport, {
        testFinished: (data, io) => {
          io.emit('test_finished', data);

          if (outputFile) {
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
            fs.appendFile(outputFile, (numOutputTests === 0 ? '' : ',') + JSON.stringify(data, null, 2), (err) => {
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
          var runningBrowser = testsManager.getRunningTest().browser;

          // If hardware stats
          if (runningBrowser.hardwareStats) {
            var results = runningBrowser.hardwareStats.stop();
            const hardwareStatsName = runningBrowser.hardwareStats.name;
            data.stats[hardwareStatsName] = {};
            for (var name in results) {
              data.stats[hardwareStatsName][name] = {
                min: results[name].min,
                max: results[name].max,
                avg: results[name].mean,
                standard_deviation: results[name].standard_deviation()
              }
            }
          }

          if (options.verbose) {
            PrettyPrint.json(data);
          }

          testRunData.device.killBrowser(runningBrowser).then(() => {
            testsManager.runNextQueuedTest();
          });
        },
        testStarted: (data) => {
          var testRunData = TestUtils.TestsData.getTestData(data.testUUID);
          var testsManager = testsManagers[testRunData.device.serial];
          var runningBrowser = testsManager.getRunningTest().browser;
          if (runningBrowser.hardwareStats) {
            runningBrowser.hardwareStats.enabled = true;
          }
        }
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
              var generalOptions = {
                numTimes: options.numtimes || 1,
                overrideParams: options.overrideparams,
                localhost: options.localhost,
                extraParams: options.launchparams // @todo Rename to browserLaunchExtraParams
              };

              var testsManager = testsManagers[device.serial] = new TestUtils.TestsManager(device, testsToRun, browsersToRun, generalOptions);
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

          browsersToRun.forEach(browser => {
            const extraInfo = '';
            const versionName = browser.versionName ? 'v.' + browser.versionName : '';
            const versionCode = browser.versionCode ? 'v.' + browser.versionCode : '';

            browser.info = `${browser.name} ${versionName} ${versionCode} ${extraInfo}`;
          });

          console.log(`Browsers to run on device ${chalk.green(device.name)}:`, browsersToRun.map(b => chalk.yellow(b.name)).join(', '));

          var generalOptions = {
            numTimes: options.numtimes || 1,
            overrideParams: options.overrideparams,
            extraParams: options.launchparams,
            localhost: options.localhost
          };

          //@todo Print just if verbose
          //console.log(generalOptions);

          var testsManager = testsManagers[device.serial] = new TestUtils.TestsManager(device, testsToRun, browsersToRun, generalOptions, {});
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