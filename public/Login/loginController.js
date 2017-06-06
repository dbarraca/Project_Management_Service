app.controller('loginController',
 ['$scope', '$state', 'login', 'notifyDlg',
 function($scope, $state, login, notifyDlg) {

   $scope.login = function() {
      login.login($scope.user)
      .then(function(user) {
         $scope.$parent.user = user;
         
         $state.go('home');
      })
      .catch(function() {
         notifyDlg.show($scope, 
          "That name/password is not in our records", "Error");
      });
   };
}]);
