import jsSHA from 'jssha';

export function generateUUID() {
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

// Hashes the given text to a UUID string of form 'xxxxxxxx-yyyy-zzzz-wwww-aaaaaaaaaaaa'.
export function hashToUUID(text) {
  var shaObj = new jsSHA('SHA-256', 'TEXT');
  shaObj.update(text);
  var hash = new Uint8Array(shaObj.getHash('ARRAYBUFFER'));
  
  var n = '';
  for(var i = 0; i < hash.byteLength/2; ++i) {
    var s = (hash[i] ^ hash[i+8]).toString(16);
    if (s.length == 1) s = '0' + s;
    n += s;
  }
  return n.slice(0, 8) + '-' + n.slice(8, 12) + '-' + n.slice(12, 16) + '-' + n.slice(16, 20) + '-' + n.slice(20);
}
