AFRAME.registerComponent('featured-result-list', {
  init: function() {
    var el = this.el;
    el.sceneEl.addEventListener('featuredresults', evt => {
      renderResults(el, evt.detail.results);
    });
  },
});

AFRAME.registerComponent('search-result-list', {
  init: function() {
    var el = this.el;
    el.sceneEl.addEventListener('searchresults', evt => {
      renderResults(el, evt.detail.results);
    });
    el.sceneEl.addEventListener('challengeset', evt => {
      renderResults(el, []);
    });
  },
});

function renderResults(el, results) {
  var author;
  var i;
  var result;
  var name;
  var title;

  for (i = 0; i < 6; i++) {
    result = el.children[i];

    if (!results[i]) {
      result.object3D.visible = false;
      continue;
    }
    result.object3D.visible = true;

    result.setAttribute('data-challenge-id', results[i].id);
    result.setAttribute('data-title', results[i].song_name);

    title = results[i].song_name.split('-');
    if (title.length !== 2) {
      title = results[i].song_name.split(':');
    }

    if (title.length === 2) {
      author = title[0].trim();
      if (author.length > 40) {
        author = author.substring(0, 40) + '...';
      }
      name = title[1];
    } else {
      author = '';
      name = results[i].song_name;
    }

    name = name.trim();
    if (name.length > 30) {
      name = name.substring(0, 30) + '...';
    }

    var minutes = Math.floor(results[i].song_length / 60);
    var seconds = results[i].song_length % 60;

    result.children[1].setAttribute('text', 'value', author);
    result.children[2].setAttribute('text', 'value', name);
    result.children[3].setAttribute('text', 'value', `${minutes}:${seconds}`);
    result.children[4].setAttribute(
      'text',
      'value',
      `${results[i].punch_count}`
    );
    result.children[5].setAttribute(
      'text',
      'value',
      `${results[i].favorite_count}`
    );
  }
}



// WEBPACK FOOTER //
// ./src/components/search-result-list.js