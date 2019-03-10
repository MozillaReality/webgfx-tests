export default class EventListenerManager {
  constructor() {
    this.registeredEventListeners = [];
  }

  // Don't call any application page unload handlers as a response to window being closed.
  ensureNoClientHandlers() {
    // This is a bit tricky to manage, since the page could register these handlers at any point,
    // so keep watching for them and remove them if any are added. This function is called multiple times
    // in a semi-polling fashion to ensure these are not overridden.
    if (window.onbeforeunload) window.onbeforeunload = null;
    if (window.onunload) window.onunload = null;
    if (window.onblur) window.onblur = null;
    if (window.onfocus) window.onfocus = null;
    if (window.onpagehide) window.onpagehide = null;
    if (window.onpageshow) window.onpageshow = null;
  }

  unloadAllEventHandlers() {
    for(var i in this.registeredEventListeners) {
      var listener = this.registeredEventListeners[i];
      listener.context.removeEventListener(listener.type, listener.fun, listener.useCapture);
    }
    this.registeredEventListeners = [];
  
    // Make sure no XHRs are being held on to either.
    //preloadedXHRs = {};
    //numPreloadXHRsInFlight = 0;
    //XMLHttpRequest = realXMLHttpRequest;
  
    this.ensureNoClientHandlers();
  }

  //if (injectingInputStream)
  enable() {

    // Filter the page event handlers to only pass programmatically generated events to the site - all real user input needs to be discarded since we are
    // doing a programmatic run.
    var overriddenMessageTypes = ['mousedown', 'mouseup', 'mousemove',
      'click', 'dblclick', 'keydown', 'keypress', 'keyup',
      'pointerlockchange', 'pointerlockerror', 'webkitpointerlockchange', 'webkitpointerlockerror', 'mozpointerlockchange', 'mozpointerlockerror', 'mspointerlockchange', 'mspointerlockerror', 'opointerlockchange', 'opointerlockerror',
      'devicemotion', 'deviceorientation',
      'mouseenter', 'mouseleave',
      'mousewheel', 'wheel', 'WheelEvent', 'DOMMouseScroll', 'contextmenu',
      'blur', 'focus', 'visibilitychange', 'beforeunload', 'unload', 'error',
      'pagehide', 'pageshow', 'orientationchange', 'gamepadconnected', 'gamepaddisconnected',
      'fullscreenchange', 'fullscreenerror', 'mozfullscreenchange', 'mozfullscreenerror',
      'MSFullscreenChange', 'MSFullscreenError', 'webkitfullscreenchange', 'webkitfullscreenerror',
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'webglcontextlost', 'webglcontextrestored',
      'mouseover', 'mouseout', 'pointerout', 'pointerdown', 'pointermove', 'pointerup', 'transitionend'];

    // Some game demos programmatically fire the resize event. For Firefox and Chrome,
    // we detect this via event.isTrusted and know to correctly pass it through, but to make Safari happy,
    // it's just easier to let resize come through for those demos that need it.
    // if (!Module['pageNeedsResizeEvent']) overriddenMessageTypes.push('resize');

    // If context is specified, addEventListener is called using that as the 'this' object. Otherwise the current this is used.
    var self = this;
    var dispatchMouseEventsViaDOM = false;
    var dispatchKeyEventsViaDOM = false;
    function replaceEventListener(obj, context) {
      var realAddEventListener = obj.addEventListener;
      obj.addEventListener = function(type, listener, useCapture) {
        self.ensureNoClientHandlers();
        if (overriddenMessageTypes.indexOf(type) != -1) {
          var registerListenerToDOM =
               (type.indexOf('mouse') === -1 || dispatchMouseEventsViaDOM)
            && (type.indexOf('key') === -1 || dispatchKeyEventsViaDOM);
          var filteredEventListener = function(e) { try { if (e.programmatic || !e.isTrusted) listener(e); } catch(e) {} };
          //!!! var filteredEventListener = listener;
          if (registerListenerToDOM) realAddEventListener.call(context || this, type, filteredEventListener, useCapture);
          self.registeredEventListeners.push({
            context: context || this,
            type: type,
            fun: filteredEventListener,
            useCapture: useCapture
          });
        } else {
          realAddEventListener.call(context || this, type, listener, useCapture);
          self.registeredEventListeners.push({
            context: context || this,
            type: type,
            fun: listener,
            useCapture: useCapture
          });
        }
      }

      var realRemoveEventListener = obj.removeEventListener;

      obj.removeEventListener = function(type, listener, useCapture) {
        // if (registerListenerToDOM)
        //realRemoveEventListener.call(context || this, type, filteredEventListener, useCapture);
        for (var i = 0; i < self.registeredEventListeners.length; i++) {
          var eventListener = self.registeredEventListeners[i];
          if (eventListener.context === this && eventListener.type === type && eventListener.fun === listener) {
            self.registeredEventListeners.splice(i, 1);
          }
        }
        
      }
    }
    if (typeof EventTarget !== 'undefined') {
      replaceEventListener(EventTarget.prototype, null);
    } else {
      /*
      var eventListenerObjectsToReplace = [window, document, document.body, Module['canvas']];
      // if (Module['extraDomElementsWithEventListeners']) eventListenerObjectsToReplace = eventListenerObjectsToReplace.concat(Module['extraDomElementsWithEventListeners']);
      for(var i = 0; i < eventListenerObjectsToReplace.length; ++i) {
        replaceEventListener(eventListenerObjectsToReplace[i], eventListenerObjectsToReplace[i]);
      }
      */
    }
  }    
}