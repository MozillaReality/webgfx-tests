AFRAME.registerInputMappings({
  actions: {
    pauseplay: { label: 'Pause or play' },
    adjustgripstart: { label: 'The user has started to adjust their grip' },
    adjustgripend: { label: 'The user has finished adjusting their grip' },
  },
  mappings: {
    default: {
      'vive-controls': {
        menudown: 'togglemenu',
        systemdown: 'togglemenu',
      },
      'oculus-touch-controls': {
        abuttondown: 'togglemenu',
        bbuttondown: 'togglemenu',
        xbuttondown: 'togglemenu',
        ybuttondown: 'togglemenu',
      },
      'windows-motion-controls': {
        menudown: 'togglemenu',
      },
      'gearvr-controls': {
        trackpaddown: 'togglemenu',
      },
      keyboard: {
        space_up: 'togglemenu',
        p_up: 'togglemenu',
        v_up: 'togglevelocity',
      },
    },
    search: {
      'vive-controls': {},
      'oculus-touch-controls': {},
      'windows-motion-controls': {},
      'gearvr-controls': {},
      keyboard: {},
    },
  },
});



// WEBPACK FOOTER //
// ./src/components/input-mappings.js