window.addEventListener('error', error => evt.logs.catchErrors = {
  message: evt.error.message,
  stack: evt.error.stack,
  lineno: evt.error.lineno,
  filename: evt.error.filename
});

var wrapFunctions = ['error','warning','log'];
wrapFunctions.forEach(key => {
  if (typeof console[key] === 'function') {
    var fn = console[key].bind(console);
    console[key] = (...args) => {
      if (key === 'error') {
        this.logs.errors.push(args);
      } else if (key === 'warning') {
        this.logs.warnings.push(args);
      }

      if (TesterConfig.sendLog) 
      {
        if (TESTER.socket) {
          TESTER.socket.emit('log', args);
        }
      }

      return fn.apply(null, args);
    }
  }
});
