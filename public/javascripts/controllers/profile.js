angular.module('boApp')
  .controller('ProfileCtrl', function($scope, $auth, $alert, Account, Profile) {

    /**
     * Get user's profile information.
     */
    $scope.getAccount = function() {
      Account.getAccount()
        .success(function(data) {
          $scope.user = data;
        })
        .error(function(error) {
          $alert({
            content: error.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 5
          });
        });
    };


    /**
     * Update user's profile information.
     */
    $scope.updateAccount = function() {
      Account.updateAccount({
        displayName: $scope.user.local.displayName,
        email: $scope.user.local.email
      }).then(function() {
        $alert({
          content: 'Account has been updated',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 3
        });
      });
    };

    $scope.getWork = function() {
      Profile.getWork()
        .success(function(data) {
          $scope.work = data;
        })
        .error(function(error) {
          $alert({
            content: error.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 5
          });
        });
    };

    $scope.updateWork = function() {
      Profile.updateWork($scope.work).then(function() {
        $alert({
          content: 'Work has been updated',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 3
        });
      });
    };

    /**
     * Link third-party provider.
     */
    $scope.link = function(provider) {
      $auth.link(provider)
        .then(function() {
          $alert({
            content: 'You have successfully linked ' + provider + ' account',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .then(function() {
          $scope.getAccount();
        })
        .catch(function(response) {
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 5
          });
        });
    };

    /**
     * Unlink third-party provider.
     */
    $scope.unlink = function(provider) {
      $auth.unlink(provider)
        .then(function() {
          $alert({
            content: 'You have successfully unlinked ' + provider + ' account',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        })
        .then(function() {
          $scope.getAccount();
        })
        .catch(function(response) {
          $alert({
            content: response.data ? response.data.message : 'Could not unlink ' + provider + ' account',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 5
          });
        });
    };

    $scope.getAccount();
    $scope.getWork();
  });