var resultsServerUrl = window.location.origin + '/';
var uploadResultsToResultsServer = true;

export default class ResultsServer {
  constructor() {
  }

  storeStart(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    var url = `${resultsServerUrl}store_test_start`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log(`ResultsServer: Recorded test start to ${url}`);
  }

  storeSystemInfo(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    var url = `${resultsServerUrl}store_system_info`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log(`ResultsServer: Uploaded system info to ${url}`);
  }

  storeTestResults(results) {
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    var url = `${resultsServerUrl}store_test_results`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log(`ResultsServer: Recorded test finish to ${url}`);
  }
};
