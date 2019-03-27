AFRAME.registerComponent('search-result', {
  init: function() {
    var el = this.el;

    this.eventDetail = {};
    el.addEventListener('click', () => {
      this.eventDetail.challengeId = el.getAttribute('data-challenge-id');
      this.eventDetail.title = el.getAttribute('data-title');
      el.sceneEl.emit('challengeset', this.eventDetail);
    });
  },
});



// WEBPACK FOOTER //
// ./src/components/search-result.js