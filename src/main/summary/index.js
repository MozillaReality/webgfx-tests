const flatten = require('./flatten');

var fs = require('fs');
var objectHash = require('object-hash');
var Stats = require('./stats');
var chalk = require('chalk');
const path = require('path');
var pc = require('pretty-columns');
var HTML = require('./html.js');

function getHash(value) {
  return (typeof value === 'object') ? objectHash(value) : value;
}

function getSummaryGroupByAttribute(results, groupBy) {
  var testSummary = {
    hashList: {},
    tests: {}
  };

  results.forEach(test => {
    var testId = groupBy === 'test' ? 'tests' : test.info.test.name;
    if (!testSummary.tests[testId]) {
      testSummary.tests[testId] = {};
    }

    var testData = testSummary.tests[testId];

    var hash = getHash(test.info[groupBy]);
    if (!testData[hash]) {
      testSummary.hashList[hash] = test.info[groupBy];
      testData[hash] = {};

      for (name in test.values) {
        testData[hash][name] = new Stats();
      }
    }

    var testByHash = testData[hash];
    for (name in test.values) {
      testByHash[name].update(test.values[name]);
    }
  });

  for (testId in testSummary.tests) {
    var test = testSummary.tests[testId];
    for (hash in test) {
      var result = test[hash];
      for (name in result) {
        result[name] = result[name].mean;
      }
    }
  }
  return testSummary;
}

function mergeResultsFromFiles(fileList) {
  var results = [];
  fileList.forEach(filename => {
    var file = flatten(JSON.parse(fs.readFileSync(filename, 'utf8')));
    file.forEach(test => {
      test.info.file = {name: path.basename(filename).replace(/\.[^/.]+$/, '')};
    });
    results = results.concat(file);
  });
  return results;
}

module.exports = {
  mergeResultsFromFiles: mergeResultsFromFiles,
  //getSummaryGroupByAttribute: getSummaryGroupByAttribute,
  //getComparison: getComparison,
  //getComparisonTable: getComparisonTable,
  printComparisonTable: printComparisonTable,
  exportComparisonTableHTML: exportComparisonTableHTML
};

function generateHTML(results, groupBy, filter) {
  var testSummary = getSummaryGroupByAttribute(results, groupBy);
  var comparison = getComparison(testSummary, filter);
  //var table = getComparisonTable(testSummary, comparison, chalk);
  var table = getComparisonTable(testSummary, comparison, HTMLColorizer);

  var html = '';

  var first = false;
  table.forEach((row, i) => {
    if (row.length === 1) {
      if (row[0] !== '') {
        if (html !== '') {
          html += '</table>';
        }

        html += `<div class="table-title">
        <h3>${row}</h3>
        </div>`;
        html += '<table class="table-fill">';
        first = true;
      }
    } else {
      if (first) {
        html += `
        <thead><tr>
          ${row.map((cell, i) => {
            if (i > 0 && i < row.length -2) {
              return `<th class="column-title">${cell}</th>`;
            } else {
              return `<th>${cell}</th>`;
            }
          }
          ).join('')}
        </tr></thead>`;
        first = false;
      } else {
        html += `
          <tr>
            ${row.map(cell => {
              if (typeof cell === 'object') {
                return `<td class="${cell.type}">${cell.text}</td>`;
              } else {
                return `<td>${cell}</td>`;
              }
            }).join('')}
          </tr>`;
      }
    }
  });

  return HTML.exportHTML(html);
}

function exportComparisonTableHTML(results, groupBy, filter, filename) {
  let html = generateHTML(results, groupBy, filter);
  filename = typeof filename === "string" ? filename : "exported.html"; 
  fs.writeFileSync(filename, html);
  console.log(`Summary succesfully written in ${chalk.yellow(filename)}`);
}

function printComparisonTable(results, groupBy, filter) {
  var testSummary = getSummaryGroupByAttribute(results, groupBy);
  var comparison = getComparison(testSummary, filter);
  var comparisonTable = getComparisonTable(testSummary, comparison, CONSOLEColorizer);

  printTable(comparisonTable);
}

function getComparison(testSummary, filter) {
  var comparison = {};
  var attributes = null;

  for (testId in testSummary.tests) {
    var test = testSummary.tests[testId];
    comparison[testId] = {};

    if (!attributes) {
      attributes = [];
      var hash = Object.keys(test)[0];
      for (name in test[hash]) {
        if (!filter || filter.indexOf(name) !== -1) {
          attributes.push(name);
        }
      }
    }

    attributes.forEach(name => {
      var min = Infinity;
      var max = -Infinity;
      var minItem, maxItem, dif = 0, difPerc = '-';

      for (hash in test) {
        var result = test[hash];
        if (result[name] < min) {
          min = result[name];
          minItem = hash;
        }
        if (result[name] >= max) {
          max = result[name];
          maxItem = hash;
        }
      }

      if (min !== Infinity && max !== -Infinity) {
        dif = max-min;
        difPerc = min === 0 ? '0.00%' : (dif / min * 100).toFixed(2) + '%';
      }

      comparison[testId][name] = {
        minItem: minItem,
        maxItem: maxItem,
        min: min,
        max: max,
        dif: dif,
        difPerc: difPerc
      }
    });
  }
  return comparison;
}

const HTMLColorizer = {
  colorize(value, color) {return `<span style="color: ${color}">${value}</span>`;},

  title(value) { return value; },
  blueBright(value) { return this.colorize(value, 'lightblue'); },
  cyan(value) { return {text: value, type: 'attribute'} },
  grey(value) { return this.colorize(value, 'grey'); },

  worst(value) { return {text: value, type: 'worst'}; },
  best(value) { return  {text: value, type: 'best'}; },
}

const CONSOLEColorizer = {
  title(value) { return chalk.yellow(value); },
  blueBright(value) { return chalk.blueBright(value); },
  cyan(value) { return chalk.cyan(value); },
  grey(value) { return chalk.grey(value); },
  worst(value) { return chalk.red(value); },
  best(value) { return chalk.green(value); }
}

function getComparisonTable(testSummary, comparison, colorizer) {
  var dataTable = [];
  for (testId in testSummary.tests) {
    dataTable.push(['']);
    dataTable.push([colorizer.title(testId.toUpperCase())]);

    var titleRow = ['COUNTER'];

    for (hash in testSummary.tests[testId]) {

      // @todo Remove the specifics from package
      var desc = testSummary.hashList[hash].name
        + (testSummary.hashList[hash].package ? ' ' + testSummary.hashList[hash].package : '')
        + (testSummary.hashList[hash].apk ? ' ' + testSummary.hashList[hash].apk : '');

      titleRow.push(desc);
    }

    titleRow = titleRow.concat(['DIF', 'DIF%']);
    titleRow = titleRow.map(title => {return colorizer.blueBright(title.toUpperCase())});

    dataTable.push(titleRow);

    for (name in comparison[testId]) {

      var data = [];

     var row = [colorizer.cyan(name)];

     var res = comparison[testId][name];

     var inverseOrder = ['avgFps', 'fps', 'cpuIdleTime', 'cpuIdlePerc', 'oculus_vrapi_fps', 'oculus_vrapi_early'];
     for (hash in testSummary.tests[testId]) {
       var value = testSummary.tests[testId][hash][name];
       value = typeof value !== 'undefined' ? value.toFixed(2) : '';
       if (res.min == res.max) {
        value = colorizer.grey(value);
       } else {
        if (hash === res.minItem) {
          value = inverseOrder.indexOf(name) === -1 ? colorizer.best(value) : colorizer.worst(value);
        }
        if (hash === res.maxItem) {
          value = inverseOrder.indexOf(name) === -1 ? colorizer.worst(value) : colorizer.best(value);
        }
       }
      row.push(value);
     }

      row.push(
        res.dif === 0 ? '=' : res.dif.toFixed(2)
      );
      row.push(
        res.dif === 0 ? '=' : res.difPerc
      );

      dataTable.push(row);
    }
  }
  return dataTable;
}

function printTable(dataTable) {
  pc(dataTable, {align: 'lrrrrrrrrrrr', 
    columnSeparation: ' | ',
    prefix: '| ',
    suffix: ' |',
    rowSeparation: " |\n| "
    }).output();
  //console.log(chalk.yellow('* the lower the better'));
}
