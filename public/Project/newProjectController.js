app.controller('newProjectController',
 ['$scope', '$state', '$http', 'notifyDlg', 'login',
 function($scope, $state, $http, nDlg, login) {
   $scope.project = {};
   $scope.errors = [];

   $scope.newProj = function() {
      $http.post("/Prjs", $scope.project)
      .then(function() {
         $state.go('prjOverview');
       })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
