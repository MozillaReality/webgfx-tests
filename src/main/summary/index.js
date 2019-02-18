const flatten = require('./flatten');

var fs = require('fs');
var objectHash = require('object-hash');
var Stats = require('./stats');
var chalk = require('chalk');
const path = require('path');
var pc = require('pretty-columns');

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
  printComparisonTable: printComparisonTable
};

function printComparisonTable(results, groupBy, filter) {
  var testSummary = getSummaryGroupByAttribute(results, groupBy);
  var comparison = getComparison(testSummary, filter);
  var comparisonTable = getComparisonTable(testSummary, comparison);

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

function getComparisonTable(testSummary, comparison) {
  var dataTable = [];
  for (testId in testSummary.tests) {
    dataTable.push([]);
    dataTable.push([chalk.yellow(testId.toUpperCase())]);
    
    var titleRow = ['COUNTER'];
  
    for (hash in testSummary.tests[testId]) {
      // @todo Remove the specifics from package
      var desc = testSummary.hashList[hash].name + ' ' + (testSummary.hashList[hash].package ? testSummary.hashList[hash].package : '');
      titleRow.push(desc);
    }
  
    titleRow = titleRow.concat(['DIF', 'DIF%']);
    titleRow = titleRow.map(title => {return chalk.blueBright(title.toUpperCase())});
  
    dataTable.push(titleRow);
  
    for (name in comparison[testId]) {
  
      var data = [];
      
     var row = [chalk.cyan(name)];
    
     var res = comparison[testId][name];
     
     for (hash in testSummary.tests[testId]) {
       var value = testSummary.tests[testId][hash][name];
       value = typeof value !== 'undefined' ? value.toFixed(2) : '';
       if (res.min == res.max) {
        value = chalk.grey(value);
       } else {
        if (hash === res.minItem) {
          value = chalk.green(value);
        }
        if (hash === res.maxItem) {
         value = chalk.red(value);
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
