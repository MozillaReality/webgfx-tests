import { v1 as Client } from 'soundboxing-client/build/lib.web';

/**
 * Load featured challenges.
 */
AFRAME.registerComponent('featured-loader', {
  init: async function() {
    var client;
    var response;
    client = new Client();
    response = await client.latestChallenges(true, 6);
    this.el.sceneEl.emit('featuredresults', { results: response.performances });
  },
});



// WEBPACK FOOTER //
// ./src/components/featured-loader.js