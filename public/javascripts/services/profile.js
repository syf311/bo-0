angular.module('boApp')
  .factory('Profile', function($http) {
    return {
      getWork: function() {
        return $http.get('/secure/profile/work');
      },
      updateWork: function(workData) {
        return $http.put('/secure/profile/work', workData);
      }
    };
  });