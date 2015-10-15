angular.module('partyDJ')
.controller('playerController', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
  $scope.playlists = {}; 
  jQuery('select.dropdown').dropdown(); 
  $http({url: '/api/playlists', method: 'get'}).success(function(data, status, headers, config){ 
   $scope.playlists = data.playlists;
  });
  $scope.loadPlaylist = function(name){
    if(name == 'favourites'){
      $http.get('/api/favourites').success(function(data, status, headers, config){
        $scope.playerList = data.favourites;
      });
    } else {
      $http.get('/api/playlists/'+name).success(function(data, status, headers, config){
        $scope.playerList = data.playerLists;
      });
    }
  };
}]);