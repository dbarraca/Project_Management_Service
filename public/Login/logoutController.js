app.controller('logoutController',
 ['$scope', '$state', 'login', 'notifyDlg',
 function($scope, $state, login, notifyDlg) {

   $scope.logout = function() {

      login.logout()
      .then(function() {
         $scope.$parent.user = null;
         $state.go('home');
      });
   };

   $scope.logout();
}]);
