angular.module('partyDJ')
.controller('videosController', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
  $scope.items = []; 
  $rootScope.videos = [];
  $scope.search = function(q) { 
    //var href = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&maxResults=40&type=video&key=AIzaSyBkNjgK3WVUZxWZgnQKkB9Ahsqo0qWgq9U";    
    var href="http://suggestqueries.google.com/complete/search?client=youtube&q="+q+"&jsonp=JSON_CALLBACK&hl=en&ds=yt";
    $http({method: 'JSONP', url: href})
      .success(function(data, status){
          $scope.items = [];
          angular.forEach(data[1], function(value, key){
            $scope.items.push({"title": value[0]});
          });
          jQuery('.ui.search').search({
            source: $scope.items,
            onSelect: function(result, response){
              $scope.searchList(result.title);
            }
          });
      });
  };  
  $scope.searchList = function(q) { 
    $location.path('/');
    var href = "https://www.googleapis.com/youtube/v3/search?part=snippet&q="+q+"&maxResults=40&type=video&key=AIzaSyBkNjgK3WVUZxWZgnQKkB9Ahsqo0qWgq9U";
    $http({url: href, skipAuthorization: true, method: 'GET'})
      .success(function(data, status, headers, config){
        angular.forEach(data.items, function(video){
          if (video.id['videoId'] != undefined){
            video.myId = 'nv_'+video.id['videoId'];
          } else if (video.id['channelId'] != undefined){
            video.myId = 'nv_'+video.id['channelId'];
          } else if (video.id['playlistId'] != undefined){
            video.myId = 'nv_'+video.id['playlistId'];
          }
        });        
        $rootScope.videos = data;
      });
  };    
}])
.factory('resizePlayer', function(){
  var resizePlayer = {};
  resizePlayer.set = function(resize) {
     if (resize==true) {
       if (jQuery("#player_back").hasClass('discrete')){
        jQuery('#player_back').removeClass('discrete').addClass('show');
       } else {
         jQuery('#player_back').removeClass('show').addClass('discrete');
       }   
    } 
    if (jQuery("#player_back").hasClass('discrete')){
      if (window.innerWidth <= 990){
       var window_width = (window.innerWidth*0.38);
       var window_height = (window_width * 0.57);
     } else if (window.innerWidth <= 700){
       var window_width = (window.innerWidth*0.48);
       var window_height = (window_width * 0.57);
     } else if (window.innerWidth <= 500){
       var window_width = (window.innerWidth*0.48);
       var window_height = (window_width * 0.57);
     } else {
        var window_width = (window.innerWidth*0.28);
        var window_height = (window_width * 0.57);
      }
      jQuery('#player, #player_frame').css('height', window_height+'px');
      jQuery('#player_back').height(''); 
      jQuery('#player, #player_frame').css('width', window_width+'px');
      jQuery('#player_back').width(''); 
    } else if (jQuery("#player_back").hasClass('show')) {     
       if (window.innerWidth <= 990){
        var window_width = (window.innerWidth*0.80);
        var window_height = (window_width * 0.57);
      } else if (window.innerWidth <= 700){
        var window_width = (window.innerWidth*0.80);
        var window_height = (window_width * 0.57);
      } else if (window.innerWidth <= 500){
        var window_width = (window.innerWidth*0.80);
        var window_height = (window_width * 0.57);
      } else {
        var window_width = (window.innerWidth*0.60);
        var window_height = (window.innerHeight*0.60);
      }
      jQuery('#player_back #player').css('height', window_height+'px');
      if (window.innerWidth >= 990){
        jQuery('#player_frame').css('height', window_height+'px');
      } else {
        jQuery('#player_frame').css('height', 'auto');
      }
      jQuery('#player_back').height(''); 
      jQuery('#player_back #player').css('width', window_width+'px');
      jQuery('#player_back').width('');  
      jQuery('#player_frame').css('width', 'auto');      
    }
  };
  return resizePlayer;
})
.controller('videosViewController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'resizePlayer', function ($rootScope, $scope, $routeParams, $http, $location, resizePlayer) {
  //$scope.videoId = $routeParams.id;
  $scope.remove = function(){
    console.log('success');
    jQuery('#player_wrapper').css('display', 'none');
    jQuery('#player').remove();
  };
  $scope.resize = function(){
    resizePlayer.set(true);
  };
  jQuery(window).resize(function() {
    resizePlayer.set(false);
  });
  $scope.addToPlaylist = function(){
    jQuery('.ui.modal').modal('show');
    console.log($rootScope.videoId);
  };
  
  $scope.addToFavourites = function(id){
    var href = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+id+"&key=AIzaSyBkNjgK3WVUZxWZgnQKkB9Ahsqo0qWgq9U";
    var video = {};
    $http({url: href, skipAuthorization: true, method: 'GET'}).success(function(data, status, headers, config){   
      $http({url: '/api/favourites/'+id, data: {data: data.items[0]}, method: 'PUT'}).success(function(data, status, headers, config){      
        $rootScope.addFavourite = false;
        $rootScope.removeFavourite = true;
      });     
    });
  };
  $scope.removeFromFavourites = function(id){
    $http.delete('/api/favourites/'+id).success(function(data, status, headers, config){
       $rootScope.addFavourite = true;
       $rootScope.removeFavourite = false;     
    });    
  };
}])
.controller('videosListController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', 'resizePlayer', function ($rootScope, $scope, $routeParams, $http, $location, resizePlayer) {
  $scope.loadVideo = function(id){
    $rootScope.videoId = id;
    $http({url: '/api/favourites/'+id, method: 'GET'}).success(function(data, status, headers, config){    
      if (data.favourites != null){  
        $rootScope.addFavourite = false;
        $rootScope.removeFavourite = true;
      } else {
        $rootScope.addFavourite = true;
        $rootScope.removeFavourite = false;
      }
    });
    jQuery('#selectedVideo').text(id);
    var video_title = jQuery('#nv_'+id+' .video-text .title a').text();
    var author = jQuery('#nv_'+id+' .video-info .author').text();
    var authorId = jQuery('#nv_'+id+' .video-info .authorId').text();
    var description = jQuery('#nv_'+id+' .video-text .description').text();
    $scope.myId = id;
    jQuery('#player').remove();
    jQuery('#playerWrapper').prepend('<div id="player" style="display:inline-block;"></div>');
    $http.get('/videos/view/'+id).success(function(data, status, headers, config){
      resizePlayer.set(false);
      var title = 'PDJ - video';
      jQuery('#player_wrapper').css('display', 'inherit'); 
      jQuery('#player_frame #player').html(data);
      jQuery('#player_frame #video_title').html(video_title);
      jQuery('#player_frame #video_author a').html(author);
      jQuery('#player_frame #video_author a').attr('href', 'https://www.youtube.com/channel/'+authorId);
      jQuery('#player_frame #video_description').html(description);
      onYouTubePlayerAPIReady();       
   });      
  };  
}])
.controller('videosPlaylistsController', ['$rootScope', '$scope', '$routeParams', '$http', '$location', function ($rootScope, $scope, $routeParams, $http, $location) {
  $scope.PlaylistForm = {};
  $scope.AddPlaylist = function(visible){    
    if (visible == "form"){      
      var form = jQuery("#addPlaylist").serialize();
      $http({url: '/api/playlists', data: $scope.PlaylistForm, method: 'POST'}).success(function(data, status, headers, config){ 
        $rootScope.user['playlists'].push($scope.PlaylistForm);
        $rootScope.$digest();
        $scope.PlaylistForm = {};
      });
      visible = false;
    }
    $scope.newPlaylist = visible;
  };    
}]);

 