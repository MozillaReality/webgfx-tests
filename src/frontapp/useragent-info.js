
// Trims whitespace in each string from an array of strings
function trimSpacesInEachElement(arr) {
  return arr.map(function(x) { return x.trim(); });
}

// Returns a copy of the given array with empty/undefined string elements removed in between
function removeEmptyElements(arr) {
  return arr.filter(function(x) { return x && x.length > 0; });
}

// Returns true if the given string is enclosed in parentheses, e.g. is of form "(something)"
function isEnclosedInParens(str) {
  return str[0] == '(' && str[str.length-1] == ')';
}

// Returns true if the given substring is contained in the string (case sensitive)
function contains(str, substr) {
  return str.indexOf(substr) >= 0;
}

// Returns true if the any of the given substrings in the list is contained in the first parameter string (case sensitive)
function containsAnyOf(str, substrList) {
  for(var i in substrList) if (contains(str, substrList[i])) return true;
  return false;
}


// Splits an user agent string logically into an array of tokens, e.g.
// 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
// -> ['Mozilla/5.0', '(Linux; Android 6.0.1; Nexus 5 Build/MOB30M)', 'AppleWebKit/537.36 (KHTML, like Gecko)', 'Chrome/51.0.2704.81', 'Mobile Safari/537.36']
function splitUserAgent(str) {
  str = str.trim();
  var uaList = [];
  var tokens = '';
  // Split by spaces, while keeping top level parentheses intact, so
  // "Mozilla/5.0 (Linux; Android 6.0.1) Mobile Safari/537.36" becomes
  // ['Mozilla/5.0', '(Linux; Android 6.0.1)', 'Mobile', 'Safari/537.36']
  var parensNesting = 0;
  for(var i = 0; i < str.length; ++i) {
    if (str[i] == ' ' && parensNesting == 0) {
      if (tokens.trim().length != 0) uaList.push(tokens.trim());
      tokens = '';
    } else if (str[i] == '(') ++parensNesting;
    else if (str[i] == ')') --parensNesting;
    tokens = tokens + str[i];
  }
  if (tokens.trim().length > 0) uaList.push(tokens.trim());

  // What follows is a number of heuristic adaptations to account for UA strings met in the wild:

  // Fuse ['a/ver', '(someinfo)'] together. For example:
  // 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
  // -> fuse 'AppleWebKit/537.36' and '(KHTML, like Gecko)' together
  for(var i = 1; i < uaList.length; ++i) {
    var l = uaList[i];
    if (isEnclosedInParens(l) && !contains(l, ';') && i > 1) {
      uaList[i-1] = uaList[i-1] + ' ' + l;
      uaList[i] = '';
    }
  }
  uaList = removeEmptyElements(uaList);

  // Fuse ['foo', 'bar/ver'] together, if 'foo' has only ascii chars. For example:
  // 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MOB30M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.81 Mobile Safari/537.36'
  // -> fuse ['Mobile', 'Safari/537.36'] together
  for(var i = 0; i < uaList.length-1; ++i) {
    var l = uaList[i];
    var next = uaList[i+1];
    if (/^[a-zA-Z]+$/.test(l) && contains(next, '/')) {
      uaList[i+1] = l + ' ' + next;
      uaList[i] = '';
    }
  }
  uaList = removeEmptyElements(uaList);
  return uaList;
}

// Finds the special token in the user agent token list that corresponds to the platform info.
// This is the first element contained in parentheses that has semicolon delimited elements.
// Returns the platform info as an array split by the semicolons.
function splitPlatformInfo(uaList) {
  for(var i = 0; i < uaList.length; ++i) {
    var item = uaList[i];
    if (isEnclosedInParens(item)) {
      return removeEmptyElements(trimSpacesInEachElement(item.substr(1, item.length-2).split(';')));
    }
  }
}

// Deduces the operating system from the user agent platform info token list.
function findOS(uaPlatformInfo) {
  var oses = ['Android', 'BSD', 'Linux', 'Windows', 'iPhone OS', 'Mac OS', 'BSD', 'CrOS', 'Darwin', 'Dragonfly', 'Fedora', 'Gentoo', 'Ubuntu', 'debian', 'HP-UX', 'IRIX', 'SunOS', 'Macintosh', 'Win 9x', 'Win98', 'Win95', 'WinNT'];
  for(var os in oses) {
    for(var i in uaPlatformInfo) {
      var item = uaPlatformInfo[i];
      if (contains(item, oses[os])) return item;
    }
  }
  return 'Other';
}

// Filters the product components (items of format 'foo/version') from the user agent token list.
function parseProductComponents(uaList) {
  uaList = uaList.filter(function(x) { return contains(x, '/') && !isEnclosedInParens(x); });
  var productComponents = {};
  for(var i in uaList) {
    var x = uaList[i];
    if (contains(x, '/')) {
      x = x.split('/');
      if (x.length != 2) throw uaList[i];
      productComponents[x[0].trim()] = x[1].trim();
    } else {
      productComponents[x] = true;
    }
  }
  return productComponents;
}

// Maps Windows NT version to human-readable Windows Product version
function windowsDistributionName(winNTVersion) {
  var vers = {
    '5.0': '2000',
    '5.1': 'XP',
    '5.2': 'XP',
    '6.0': 'Vista',
    '6.1': '7',
    '6.2': '8',
    '6.3': '8.1',
    '10.0': '10'
  }
  if (!vers[winNTVersion]) return 'NT ' + winNTVersion;
  return vers[winNTVersion];
}

// The full function to decompose a given user agent to the interesting logical info bits.
// 
export default function deduceUserAgent(userAgent) {
  userAgent = userAgent || navigator.userAgent;
  var ua = {
    userAgent: userAgent,
    productComponents: {},
    platformInfo: []
  };

  try {
    var uaList = splitUserAgent(userAgent);
    var uaPlatformInfo = splitPlatformInfo(uaList);
    var productComponents = parseProductComponents(uaList);
    ua.productComponents = productComponents;
    ua.platformInfo = uaPlatformInfo;
    var ual = userAgent.toLowerCase();

    // Deduce arch and bitness
    var b32On64 = ['wow64'];
    if (contains(ual, 'wow64')) {
      ua.bitness = '32-on-64';
      ua.arch = 'x86_64';
    } else if (containsAnyOf(ual, ['x86_64', 'amd64', 'ia64', 'win64', 'x64'])) {
      ua.bitness = 64;
      ua.arch = 'x86_64';
    } else if (contains(ual, 'ppc64')) {
      ua.bitness = 64;
      ua.arch = 'PPC';
    } else if (contains(ual, 'sparc64')) {
      ua.bitness = 64;
      ua.arch = 'SPARC';
    } else if (containsAnyOf(ual, ['i386', 'i486', 'i586', 'i686', 'x86'])) {
      ua.bitness = 32;
      ua.arch = 'x86';
    } else if (contains(ual, 'arm7') || contains(ual, 'android') || contains(ual, 'mobile')) {
      ua.bitness = 32;
      ua.arch = 'ARM';
    // Heuristic: Assume all OS X are 64-bit, although this is not certain. On OS X, 64-bit browsers
    // don't advertise being 64-bit.
    } else if (contains(ual, 'intel mac os')) {
      ua.bitness = 64;
      ua.arch = 'x86_64';
    } else {
      ua.bitness = 32;
    }

    // Deduce operating system
    var os = findOS(uaPlatformInfo);
    var m = os.match('(.*)\\s+Mac OS X\\s+(.*)');
    if (m) {
      ua.platform = 'Mac';
      ua.arch = m[1];
      ua.os = 'Mac OS';
      ua.osVersion = m[2].replace(/_/g, '.');
    }
    if (!m) {
      m = os.match('Android\\s+(.*)');
      if (m) {
        ua.platform = 'Android';
        ua.os = 'Android';
        ua.osVersion = m[1];
      }
    }
    if (!m) {
      m = os.match('Windows NT\\s+(.*)');
      if (m) {
        ua.platform = 'PC';
        ua.os = 'Windows';
        ua.osVersion = windowsDistributionName(m[1]);
        if (!ua.arch) ua.arch = 'x86';
      }
    }
    if (!m) {
      if (contains(uaPlatformInfo[0], 'iPhone') || contains(uaPlatformInfo[0], 'iPad') || contains(uaPlatformInfo[0], 'iPod') || contains(os, 'iPhone') || os.indexOf('CPU OS') == 0) {
        m = os.match('.*OS (.*) like Mac OS X');
        if (m) {
          ua.platform = uaPlatformInfo[0];
          ua.os = 'iOS';
          ua.osVersion = m[1].replace(/_/g, '.');
          ua.bitness = parseInt(ua.osVersion) >= 7 ? 64 : 32;
        }
      }
    }  
    if (!m) {
      m = contains(os, 'BSD') || contains(os, 'Linux');
      if (m) {
        ua.platform = 'PC';
        ua.os = os.split(' ')[0];
        if (!ua.arch) ua.arch = 'x86';
      }
    }
    if (!m) {
      ua.os = os;
    }

    function findProduct(productComponents, product) {
      for(var i in productComponents) {
        if (productComponents[i] == product) return i;
      }
      return -1;
    }

    // Deduce human-readable browser vendor, product and version names
    var browsers = [['SamsungBrowser', 'Samsung'], ['Edge', 'Microsoft'], ['OPR', 'Opera'], ['Chrome', 'Google'], ['Safari', 'Apple'], ['Firefox', 'Mozilla']];
    for(var i in browsers) {
      var b = browsers[i][0];
      if (productComponents[b]) {
        ua.browserVendor = browsers[i][1];
        ua.browserProduct = browsers[i][0];
        if (ua.browserProduct == 'OPR') ua.browserProduct = 'Opera';
        if (ua.browserProduct == 'Trident') ua.browserProduct = 'Internet Explorer';
        ua.browserVersion = productComponents[b];
        break;
      }
    }
    // Detect IEs
    if (!ua.browserProduct) {
      var matchIE = userAgent.match(/MSIE\s([\d.]+)/);
      if (matchIE) {
        ua.browserVendor = 'Microsoft';
        ua.browserProduct = 'Internet Explorer';
        ua.browserVersion = matchIE[1];
      } else if (contains(uaPlatformInfo, 'Trident/7.0')) {
        ua.browserVendor = 'Microsoft';
        ua.browserProduct = 'Internet Explorer';
        ua.browserVersion =  userAgent.match(/rv:([\d.]+)/)[1];
      }
    }

    // Deduce mobile platform, if present
    for(var i = 0; i < uaPlatformInfo.length; ++i) {
      var item = uaPlatformInfo[i];
      var iteml = item.toLowerCase();
      if (contains(iteml, 'nexus') || contains(iteml, 'samsung')) {
        ua.platform = item;
        ua.arch = 'ARM';
        break;
      }
    }

    // Deduce form factor
    if (contains(ual, 'tablet') || contains(ual, 'ipad')) ua.formFactor = 'Tablet';
    else if (contains(ual, 'mobile') || contains(ual, 'iphone') || contains(ual, 'ipod')) ua.formFactor = 'Mobile';
    else if (contains(ual, 'smart tv') || contains(ual, 'smart-tv')) ua.formFactor = 'TV';
    else ua.formFactor = 'Desktop';
  } catch(e) {
    ua.internalError = 'Failed to parse user agent string: ' + e.toString();
  }

  return ua;
}
