export default class ResultsServer {
  constructor() {

  }

  storeStart(data) {
    console.log('Sending start', JSON.parse(JSON.stringify(data)));
  }

  storeSystemInfo() {
    console.log('Sending system info');
  }
};