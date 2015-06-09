angular.module('boApp')
  .factory('Account', function($http) {
    return {
      getAccount: function() {
        return $http.get('/secure/account');
      },
      updateAccount: function(profileData) {
        return $http.put('/secure/account', profileData);
      }
    };
  });