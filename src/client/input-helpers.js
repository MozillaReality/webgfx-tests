//import KeystrokeVisualizer from 'keystroke-visualizer';

export default class InputHelpers {
  initKeys() {
  //  KeystrokeVisualizer.enable({unmodifiedKey: false});
  }

  initMouse() {
    this.mouseDiv = document.createElement('div');
    this.mouseDiv.id='mousediv';
    this.mouseClick = document.createElement('div');
    this.mouseClick.id='mouseclick';
    this.mouseClick.style.cssText = `
      border-radius: 50%;
      width: 30px;
      height: 30px;
      background: yellow;
      position: absolute;
      left: 0px;
      top: 0px;
      border: 3px solid black;
      opacity: 0.5;
      visibility: hidden;
    `;

    this.mouseDiv.style.cssText = `
      position: absolute;
      width: 30px;
      height: 30px;
      left: 0px;
      top: 0px;
      background-image: url('../cursor.svg');
      z-index: 9999
    `;
    
    this.canvas.parentNode.appendChild(this.mouseDiv);
    this.canvas.parentNode.appendChild(this.mouseClick);

    this.canvas.addEventListener('mousemove', (evt) => {
      this.mouseDiv.style.left = evt.x + "px";
      this.mouseDiv.style.top = evt.y + "px";

      this.mouseClick.style.left = `${evt.x - 3}px`;
      this.mouseClick.style.top = evt.y + "px";
    });

    this.canvas.addEventListener('mousedown', evt => {
      this.mouseClick.style.visibility = 'visible';
    });
    this.canvas.addEventListener('mouseup', evt => {
      this.mouseClick.style.visibility = 'hidden';
    });

  }

  constructor (canvas, options) {
    this.canvas = canvas;
    if (window.location.href.indexOf('show-keyboard') === -1) {
      this.initKeys();
    }
    if (window.location.href.indexOf('show-mouse') === -1) {
      this.initMouse();
    }
  }
}