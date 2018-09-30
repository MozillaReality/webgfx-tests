import KeystrokeVisualizer from 'keystroke-visualizer';

export default class InputHelpers {
  initKeys() {
    KeystrokeVisualizer.enable({unmodifiedKey: false});
  }

  initMouse() {
    this.mouseDiv = document.createElement('div');
    this.mouseDiv.style.cssText="position:absolute;width:30px; height:30px; left:0px; top:0px; background-image:url('../cursor.svg');";
    
    if (window.location.href.indexOf('show-mouse') === -1) {
      // this.mouseDiv.style.display = 'none';
    }
    this.canvas.parentNode.appendChild(this.mouseDiv);
    this.canvas.addEventListener('mousemove', (evt) => {
      this.mouseDiv.style.left = evt.x + "px";
      this.mouseDiv.style.top = evt.y + "px";
    });
  }

  constructor (canvas, options) {
    this.canvas = canvas;
    this.initKeys();
    this.initMouse();
  }
}