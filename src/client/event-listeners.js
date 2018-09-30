var Module = {};
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
      var l = this.registeredEventListeners[i];
      l[0].removeEventListener(l[1], l[2], l[3]);
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
    return;
    // Filter the page event handlers to only pass programmatically generated events to the site - all real user input needs to be discarded since we are
    // doing a programmatic run.
    var overriddenMessageTypes = ['mousedown', 'mouseup', 'mousemove',
      'click', 'dblclick', 'keydown', 'keypress', 'keyup',
      'pointerlockchange', 'pointerlockerror', 'webkitpointerlockchange', 'webkitpointerlockerror', 'mozpointerlockchange', 'mozpointerlockerror', 'mspointerlockchange', 'mspointerlockerror', 'opointerlockchange', 'opointerlockerror',
      'devicemotion', 'deviceorientation',
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
    function replaceEventListener(obj, context) {
      var realAddEventListener = obj.addEventListener;
      obj.addEventListener = function(type, listener, useCapture) {
        self.ensureNoClientHandlers();
        if (overriddenMessageTypes.indexOf(type) != -1) {
          var registerListenerToDOM =
               (type.indexOf('mouse') == -1 || Module['dispatchMouseEventsViaDOM'])
            && (type.indexOf('key') == -1 || Module['dispatchKeyEventsViaDOM']);
          var filteredEventListener = function(e) { try { if (e.programmatic || !e.isTrusted) listener(e); } catch(e) {} };
          if (registerListenerToDOM) realAddEventListener.call(context || this, type, filteredEventListener, useCapture);
          self.registeredEventListeners.push([context || this, type, filteredEventListener, useCapture]);
        } else {
          realAddEventListener.call(context || this, type, listener, useCapture);
          self.registeredEventListeners.push([context || this, type, listener, useCapture]);
        }
      }
    }
    if (typeof EventTarget !== 'undefined') {
      replaceEventListener(EventTarget.prototype, null);
      console.log(this.registeredEventListeners);
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