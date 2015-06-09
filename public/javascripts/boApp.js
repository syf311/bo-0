var app = angular.module('boApp', ['ngResource', 'ngMessages', 'ui.router', 'mgcrea.ngStrap', 'satellizer', 'xeditable'])
	.constant('app.config', {
		facebook: {
			clientId: '1576094639334037',
			scope: ['email', 'user_birthday', 'user_education_history', 'user_location', 'user_work_history']
		},
		linkedin: {
			clientId: '75tn4c45ge2xq5',
			scope: ['r_emailaddress', 'r_basicprofile', 'r_fullprofile']
		}
	})
	.run(function($rootScope, $http, editableOptions) {
		editableOptions.theme = 'bs3'; 
	});

app.config(['$stateProvider', '$urlRouterProvider', '$authProvider', 'app.config',
	function($stateProvider, $urlRouterProvider, $authProvider, config) {

	$stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'partials/home.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'partials/login.html',
      controller: 'AuthCtrl'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'partials/signup.html',
      controller: 'AuthCtrl'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: 'partials/profile.html',
      controller: 'ProfileCtrl',
      resolve: {
        authenticated: function($q, $location, $auth) {
          var deferred = $q.defer();

          if (!$auth.isAuthenticated()) {
            $location.path('/login');
          } else {
            deferred.resolve();
          }

          return deferred.promise;
        }
      }
    });

  $urlRouterProvider.otherwise('/');

  $authProvider.facebook(config.facebook);
	$authProvider.linkedin(config.linkedin);
  //$authProvider.unlinkMethod = 'post';
}]);


app.controller('authController', function($scope, $http, $rootScope, $location, $window){
	$scope.user = {email: '', password: ''};
  $scope.error_message = '';

	$scope.login = function() {
		$http.post('/auth/login', $scope.user).success(function(data) {
			if(data.state == 'success') {
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user;
		    	$location.path('/profile');
		  	} else {
		    	$scope.error_message = data.message;
		  	}
		});
	};

	$scope.signup = function() {
		$http.post('/auth/signup', $scope.user).success(function(data) {
			if(data.state == 'success') {
				$rootScope.authenticated = true;
				$rootScope.current_user = data.user;
		    	$location.path('/profile');
		  	} else {
		    	$scope.error_message = data.message;
		  	}
		});
	};
});

app.factory('profileService', function($resource){
	return $resource('/api/user/:userId/profile');
});

app.controller('profileController', function(profileService, $scope, $rootScope, $location) {
	profileService.get( { userId: $rootScope.current_user._id }, function(data) {
		$scope.profile = data.profile;
		$scope.user = data.user;
	}, function(error) {
		$location.path('/error');
	});

	$scope.updateProfile = function() {
		profileService.save({ userId: $rootScope.current_user._id }, $scope.profile, function(date) {
		}, function(error) {
			$location.path('/error');	
		});
	};
});