var dataLoaderRunner = [
  'dataLoader',
  function (dataLoader) {
    return dataLoader();
  }
];
var suggestCallBack; // global var for autocomplete jsonp

angular.module('partyDJ', ['ngRoute', 'satellizer'])
.config(function($authProvider) {
  $authProvider.facebook({
    clientId: '936902556360889'
  });
  $authProvider.google({
    clientId: '814342926626-vsk20an65v2vf6d26gfvpo4dgb00pild.apps.googleusercontent.com'
  });
  $authProvider.live({
    clientId: '000000004015A249'
  });
  $authProvider.twitter({
    url: '/auth/twitter'
  });
})
.run(function($rootScope, $location, $window, $http){
  $rootScope.help = '';
  $rootScope.go = function ( path ) {
    $location.path( path );
  };  
})
.controller("MainController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window) {  
  $http({url: '/api/users/me', method: 'GET'}).success(function(data, status, headers, config){
    $rootScope.user = data.user; 
  });
}])
.controller("LoginController", ['$scope', '$auth', '$rootScope', '$http', '$window', function($scope, $auth, $rootScope, $http, $window){
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider);
  };
}])
.controller("UserController", ['$scope', '$rootScope', '$http', '$window', function($scope, $rootScope, $http, $window){
  $http({url: '/api/users/'+$rootScope.user.id, method: 'GET'}).success(function(data, status, headers, config){
  
  });
}])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/',{templateUrl: 'html/videos/getIndex.html', controller: 'MainController'})
  .when('/videos/view/:id', { templateUrl: '/html/videos/get.html', controller: 'videosViewController' })
  .when('/user/:id', {templateUrl: 'html/user/profile.html', controller: 'UserController', resolve: {data: dataLoaderRunner}})
  .when('/admin/users/', {templateUrl: 'html/admin/users.html', controller: 'AdminController', resolve: {data: dataLoaderRunner}})
  .when('/login', {templateUrl: 'html/login.html', controller: 'LoginController'})
  .when('/player', {templateUrl: 'html/player/getindex.html'})
  .otherwise({redirectTo: '/'});
})
.run(function($rootScope, $location, $window, $http){
  jQuery('.left.sidebar').sidebar('hide');
  jQuery('.sidebar.icon').on('click', function(event){
    $('.left.sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle');  
  });
 })
.service('dataLoader', function ($location, $http) {
  return function () {
    return $http.get( '/api' + $location.path() ).then(function (res) {
      return res.data;
    });
  };
});
