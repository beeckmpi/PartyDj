var tag = document.createElement('script');
tag.src = "//www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;
var youtubeID = jQuery('#selectedVideo').text();
console.log(youtubeID);
var player_back = document.getElementById('player_back');
function onYouTubePlayerAPIReady() {
  if (player_back.classList.contains('show')) {
    var window_width = (window.innerWidth * 0.60);
    var window_height = (window.innerHeight * 0.60);
  } else {
    var window_height = (window.innerHeight * 0.27);
    var window_width = (window.innerWidth * 0.25);
  }
  player = new YT.Player('player', {
    width : window_width,
    height : window_height,
    playerVars : {
      'rel' : 0,
      'autoplay' : 1,
      'disablekb' : 1,
      'controls' : 1,
      'modestbranding' : 1,
      'iv_load_policy' : 3,
      'showinfo' : 0
    },
    videoId : youtubeID,
    events : {
      'onReady' : function(event) {
        event.target.playVideo();
      }
    }
  });
}

function stopVideo(youtubeID) {
  players[youtubeID].stopVideo();
}