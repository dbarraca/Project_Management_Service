app.controller('newProjectController',
 ['$scope', '$state', '$http', 'notifyDlg', 'login',
 function($scope, $state, $http, nDlg, login) {
   $scope.project = {};
   $scope.errors = [];
   $scope.checkedSkills = []

   $http.get("/Skls")
   .then(function(rsp) {
      var sklArr = [];

      for (var i = 0; i < rsp.data.length; i++) {
         sklArr.push(rsp.data[i].name);
      };

      $scope.skills = sklArr;
   });

   $scope.newProj = function() {
      $http.post("/Prjs", $scope.project)
      .then(function() {
         $state.go('prjOverview');
       })
      .catch(function(err) {
         $scope.errors = err.data;
      });

      console.log(Object.keys($scope.checkedSkills).length);

      for (var i = 0; i < Object.keys($scope.checkedSkills).length; i++) {
         $http.post("/Skls", Object.keys($scope.checkedSkills)[i]);
         console.log("added skill" + Object.keys($scope.checkedSkills)[i]);
      };
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
