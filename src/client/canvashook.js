//----------------------------------------------------------------------
// Hook canvas.getContext
//----------------------------------------------------------------------
var originalGetContext = HTMLCanvasElement.prototype.getContext;
if (!HTMLCanvasElement.prototype.getContextRaw) {
    HTMLCanvasElement.prototype.getContextRaw = originalGetContext;
}

var enabled = false;

export default {
  webglContext: null,
  enable: function () {
    if (enabled) {return;}

    var self = this;
    HTMLCanvasElement.prototype.getContext = function() {
      var ctx = originalGetContext.apply(this, arguments);
      if ((ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
        self.webglContext = ctx;
      }
      return ctx;    
    }
    enabled = true;
  },

  disable: function () {
    if (!enabled) {return;}
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    enabled = false;
  }
};