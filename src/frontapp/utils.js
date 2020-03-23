function addGET(url, parameter) {
  //if (url.indexOf('?') != -1)
  return url + '&' + parameter;
  //else return url + '?' + parameter;
}

function yyyymmddhhmmss() {
  var date = new Date();
  var yyyy = date.getFullYear();
  var mm = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1); // getMonth() is zero-based
  var dd  = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  var min = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  var sec = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
  return yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + min + ':' + sec;
}

module.exports = {
  addGET: addGET,
  yyyymmddhhmmss: yyyymmddhhmmss
};