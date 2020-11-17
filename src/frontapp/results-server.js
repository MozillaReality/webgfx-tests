var resultsServerUrl = location.protocol + '//localhost:3000/';

var uploadResultsToResultsServer = true;

export default class ResultsServer {
  constructor() {
  }

  storeStart(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", resultsServerUrl + "store_test_start", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log('ResultsServer: Recorded test start to ' + resultsServerUrl + "store_test_start");
  }

  storeSystemInfo(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", resultsServerUrl + "store_system_info", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log('ResultsServer: Uploaded system info to ' + resultsServerUrl + "store_system_info");
  }

  storeTestResults(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", resultsServerUrl + "store_test_results", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log('ResultsServer: Recorded test finish to ' + resultsServerUrl + "store_test_results");
  }  
};
