export default function generateUUID() {
  if (window.crypto && window.crypto.getRandomValues) {
    var buf = new Uint16Array(8);
    window.crypto.getRandomValues(buf);
    var S4 = function(num) { var ret = num.toString(16); while(ret.length < 4) ret = '0'+ret; return ret; };
    return S4(buf[0])+S4(buf[1])+'-'+S4(buf[2])+'-'+S4(buf[3])+'-'+S4(buf[4])+'-'+S4(buf[5])+S4(buf[6])+S4(buf[7]);
  } else {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }
}
