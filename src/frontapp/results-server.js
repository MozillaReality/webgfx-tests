var resultsServerUrl = 'http://localhost:3000/';

var uploadResultsToResultsServer = true;

export default class ResultsServer {
  constructor() {
  }

  storeStart(results) {
    console.log('Sending start', JSON.parse(JSON.stringify(results)));
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", resultsServerUrl + "store_test_start", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log('ResultsServer: Recorded test start to ' + resultsServerUrl + "store_test_start");
  }

  storeSystemInfo(results) {
    console.log('Sending system info');
    if (!uploadResultsToResultsServer) return;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", resultsServerUrl + "store_system_info", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(results));
    console.log('ResultsServer: Uploaded system info to ' + resultsServerUrl + "store_system_info");
  }
};


/*
var uploadResultsToResultsServer = (location.search.indexOf('uploadResults') != -1 && location.search.indexOf('noupload') == -1 && document.URL.indexOf(":6931/") != -1);
if (uploadResultsToResultsServer) {
  console.log('ResultsServer: connection enabled, uploading to ' + resultsServerUrl);
} else {
  console.log('ResultsServer: disabled');
}

function resultsServer_StoreTestResults(results) {
  if (!uploadResultsToResultsServer) return;
  var xhr = new XMLHttpRequest();
  xhr.open("POST", resultsServerUrl + "store_test_results", true);
  xhr.send(JSON.stringify(results));
  console.log('ResultsServer: Recorded test finish to ' + resultsServerUrl + "store_test_results");
}
*/