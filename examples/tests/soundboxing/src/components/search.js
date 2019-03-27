import { v1 as Client } from 'soundboxing-client/build/lib.web';

AFRAME.registerComponent('search', {
  init: function() {
    var el = this.el;
    this.eventDetail = { results: [] };
    el.addEventListener('change', evt => {
      this.search(evt.detail);
    });
    el.sceneEl.addEventListener('challengeset', evt => {
      el.setAttribute('value', '');
    });
  },

  search: async function(query) {
    var client;
    var response;

    client = new Client();
    response = await client.searchChallenges(query, 12);
    this.eventDetail.results = response.performances;
    this.el.sceneEl.emit('searchresults', this.eventDetail);
  },
});



// WEBPACK FOOTER //
// ./src/components/search.js