var hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');

AFRAME.registerState({
  initialState: {
    screen: hasInitialChallenge ? 'challenge' : 'featured',
    screenHistory: [],
    challenge: {
      id: AFRAME.utils.getUrlParameter('challenge'),
      isLoading: false,
      isLoadingFrames: false,
      isLoadingPunches: false,
      loadingText: ''
    },
    discotube: {
      speedX: -0.05,
      speedY: -0.1
    },
    menuActive: true,
    playButtonText: 'Play',
    maxStreak: 0,
    score: 0,
    scoreText: '',
    streak: 0,
    multiplier: 1,
    velocity: 4,
    youtube: {
      isPlaying: false,
      timestamp: 0,
      updatedTime: 0,
      title: '',
      titleText: '',
      videoId: ''
    },
    inVR: false,
    currentInputMapping: 'default',
    velocity: 4,
    isFeaturedScreen: !hasInitialChallenge,
    isSearchScreen: false,
    isChallengeScreen: hasInitialChallenge,
    featuredPanelShowing: !hasInitialChallenge,
    playButtonShowing: hasInitialChallenge,
    leftGloveActive: false,
    rightGloveActive: false,
    leftPointerActive: false,
    rightPointerActive: false,
    leftPunchesActive: true,
    rightPunchesActive: true,
  },

  handlers: {
    setscreen: function(state, payload) {
      console.log('setscreen: ' + payload.screen);
      if (state.screen === payload.screen) {
        return;
      }
      switch (payload.screen) {
        case 'challenge':
        case 'featured':
        case 'search':
          state.screenHistory.push(state.screen);
          state.screen = payload.screen;
          break;
        default:
          console.log('Unknown screen set: ' + payload.screen);
      }
    },

    popscreen: function(state, payload) {
      var prevScreen = state.screenHistory.pop();
      if (!prevScreen) {
        return;
      }
      state.screen = prevScreen;
      console.log('popscreen: ' + state.screen);
    },

    challengeloaded: function (state, payload) {
      state.challenge.isLoading = false;
      state.isLoadingFrames = false;
      state.isLoadingPunches = false;

      state.youtube.title = payload.title;
      state.youtube.videoId = payload.videoId;
      state.score = 0;
    },

    challengeloadstart: function (state, payload) {
      state.challenge.isLoading = true;
    },

    challengeloadingframes: function (state, payload) {
      state.challenge.isLoadingPunches = false;
      state.challenge.isLoadingFrames = true;
    },

    challengeloadingpunches: function (state, payload) {
      state.challenge.isLoadingPunches = true;
      state.challenge.isLoadingFrames = false;
    },

    challengeset: function (state, payload) {
      state.challenge.id = payload.challengeId;
      state.youtube.title = payload.title;

      state.score = 0;
      state.streak = 0;
      state.maxStreak = 0;
      state.menuActive = false;

      this.setscreen(state, {screen: 'challenge'});
    },

    hitmiss: function (state, payload) {
      state.streak = 0;
    },

    hitstart: function (state, payload) {
      const velocityPart = THREE.Math.clamp(Math.sqrt(payload.velocity.lengthSq()), 0, 3);
      const scoreMultiplier = 128;
      const scaleMultiplier = 1;
      state.score += Math.floor(state.multiplier * velocityPart * scoreMultiplier * scaleMultiplier);
      state.streak++;
      if (state.streak > state.maxStreak) { state.maxStreak = state.streak; }
    },

    playbuttonclick: function (state) {
      state.menuActive = false;
    },

    searchblur: function (state) {
      this.popscreen(state);
    },

    searchfocus: function (state) {
      this.setscreen(state, {screen: 'search'});
    },

    togglemenu: function (state) {
      state.menuActive = !state.menuActive;

      // Set the youtube playing state immediately, even though it'll be set canonically in the youtube component
      if (state.menuActive && state.youtube.isPlaying) {
        state.youtube.isPlaying = false;
      } else if (!state.menuActive && !state.youtube.isPlaying && state.youtube.timestamp > 0) {
        state.youtube.isPlaying = true;
      }
    },

    youtubefinished: function (state) {
      state.menuActive = true;
      state.youtube.isPlaying = false;
    },

    youtubeupdate: function (state, payload) {
      state.youtube.isPlaying = payload.isPlaying;
      state.youtube.timestamp = payload.timestamp;
      state.youtube.updatedTime = payload.updatedTime || 0;
      //state.menuActive = state.youtube.isPlaying;
    },

    activateglove: function (state, payload) {
      switch (payload.hand) {
        case 'left':
          state.leftGloveActive = true;
          break;
        case 'right':
          state.rightGloveActive = true;
          break;
      }
    },

    activatepointer: function (state, payload) {
      switch (payload.hand) {
        case 'left':
          state.leftPointerActive = true;
          break;
        case 'right':
          state.rightPointerActive = true;
          break;
      }
    },

    togglevelocity: function(state, payload) {
      switch (state.velocity) {
        case 2:
          alert('Medium mode activated');
          state.velocity = 4;
          break;
        case 4:
          alert('Fast mode activated');
          state.velocity = 8;
          break;
        case 8:
          alert('Insane mode activated');
          state.velocity = 16;
          break;
        case 16:
          alert('Ultra insane mode activated');
          state.velocity = 32;
          break;
        case 32:
          alert('Slow mode activated');
          state.velocity = 2;
          break;
        default:
          alert('Medium mode activated');
          state.velocity = 4;
          break;
      }
    },

    'enter-vr': function (state, payload) {
      state.inVR = true;
    },

    'exit-vr': function (state, payload) {
      state.inVR = false;
    }
  },

  computeState: function (state) {
    state.playButtonText = state.youtube.timestamp === 0 ? 'Play' : 'Resume';
    state.scoreText = `Streak: ${state.streak} / Max Streak: ${state.maxStreak} / Score: ${state.score}`;
    state.isFeaturedScreen = state.screen === 'featured';
    state.isSearchScreen = state.screen === 'search';
    state.isChallengeScreen = state.screen === 'challenge';

    state.featuredPanelShowing = state.isFeaturedScreen || (state.isChallengeScreen && state.menuActive);
    state.playButtonShowing = state.isChallengeScreen && (state.menuActive || state.youtube.timestamp < 1);

    state.multiplier = getMultiplier(state.streak);

    state.leftPunchesActive = !(!state.leftPointerActive && state.rightPointerActive);
    state.rightPunchesActive = !(!state.rightPointerActive && state.leftPointerActive);

    if (state.youtube.isPlaying) {
      state.discotube.speedX = 0.2;
      state.discotube.speedY = 2;
    }
    else{
      state.discotube.speedX = -0.05;
      state.discotube.speedY = -0.1;
    }

    if (state.challenge.isLoading) {
      if (state.challenge.isLoadingFrames) {
        state.loadingText = 'Loading frames...';
      } else if (state.challenge.isLoadingPunches) {
        state.loadingText = 'Loading punches...';
      } else {
        state.loadingText = 'Loading challenge...';
      }
    } else {
      state.loadingText = '';
    }

    state.currentInputMapping = state.isSearching ? 'search' : 'default';
  }
});

function getMultiplier(streak) {
  for (let i = 0; i < 21; ++i)
  {
    if (streak < (10 * (i + 1)))
    {
      if (i == 0)
      {
          return 1;
      }
      return 2 * i;
    }
  }
  return 40;
}



// WEBPACK FOOTER //
// ./src/state/index.js