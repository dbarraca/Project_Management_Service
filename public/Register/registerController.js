app.controller('registerController',
 ['$scope', '$state', '$http', 'notifyDlg', 'login',
 function($scope, $state, $http, nDlg, login) {
   $scope.user = {role: 0};
   $scope.errors = [];

   $scope.registerUser = function() {
      console.log($scope.user);
      $http.post("/Prss", $scope.user)
      .then(function() { 
         return nDlg.show($scope, 
          "Registration succeeded.  Login automatically?", 
          "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         if (btn == "Yes") {
            return login.login($scope.user);
         }
         else {
            $state.go('home');
         }
      })
      .then(function(user) {
         $scope.$parent.user = user;
      })
      .then(function() {
         $state.go('home');
       })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
