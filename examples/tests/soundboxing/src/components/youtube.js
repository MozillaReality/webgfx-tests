var loadingInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');
var ready = false;

initYoutube();

AFRAME.registerComponent('youtube', {
  schema: {
    menuActive: { default: true },
    videoId: { type: 'string' },
  },

  init: function() {
    this.eventData = {};
    this.youtube = null;
    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 100);

    this.newVideo = false;
    this.isPlaying = false;
    this.timestamp = 0;
    this.updatedTime = 0;

    this.el.addEventListener('playbuttonclick', () => {
      this.youtube.playVideo();
    });
  },

  update: function(oldData) {
    if (!this.data.videoId) {
      return;
    }

    if (!ready || !window.YT || !window.YT.Player) {
      this.el.addEventListener('youtubeready', this.update.bind(this));
      return;
    }

    // Update song.
    if (!this.youtube) {
      this.youtube = new YT.Player('youtube', {
        height: '390',
        playerVars: { controls: 0 },
        width: '640',
        videoId: this.data.videoId,
      });
      this.timestamp = 0;
      this.updatedTime = 0;
      this.isPlaying = false;
      this.newVideo = true;
    } else if (oldData.videoId !== this.data.videoId) {
      this.youtube.loadVideoById(this.data.videoId, 0);
      this.timestamp = 0;
      this.updatedTime = 0;
      this.isPlaying = false;
      this.newVideo = true;
    }

    // Menu opened, pause.
    if (!oldData.menuActive && this.data.menuActive) {
      this.youtube.pauseVideo();
      this.isPlaying = false;
    }

    // Menu closed, resume.
    if (oldData.menuActive && !this.data.menuActive) {
      // Already done playing.
      if (this.youtube && this.youtube.getPlayerState() === 0) {
        return;
      }
      this.youtube.playVideo();
      this.isPlaying = true;
    }
  },

  tick: function(t, dt) {
    var playerState;
    var youtube = this.youtube;

    if (!youtube || !youtube.getPlayerState) {
      return;
    }

    playerState = youtube.getPlayerState();
    if (this.lastPlayerState !== 0 && playerState === 0) {
      this.el.emit('youtubefinished');
    }
    if (playerState === 0) {
      return;
    }

    this.isPlaying = this.eventData.isPlaying = playerState === 1;

    if (!loadingInitialChallenge && this.newVideo && playerState === 5) {
      youtube.playVideo();
      this.newVideo = false;
      loadingInitialChallenge = false;
    }

    this.timestamp = this.eventData.timestamp = youtube.getCurrentTime();
    this.updatedTime = this.eventData.updatedTime = t;
    this.el.emit('youtubeupdate', this.eventData);
    this.lastPlayerState = playerState;
  },
});

function initYoutube() {
  var firstScriptTag;
  var player;
  var tag;

  window.onYouTubeIframeAPIReady = () => {
    ready = true;
    AFRAME.scenes[0].emit('youtubeready');
  };

  tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}



// WEBPACK FOOTER //
// ./src/components/youtube.js