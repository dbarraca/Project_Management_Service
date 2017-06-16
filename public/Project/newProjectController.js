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

      var newPrjId;

      $http.get("/Prjs")
      .then(function(rsp) {
         newPrjId = rsp.data.length;
      });

      for (var i = 0; i < Object.keys($scope.checkedSkills).length; i++) {
         console.log("added skill" + Object.keys($scope.checkedSkills)[i]);
         $http.get("/Skls?name=" + Object.keys($scope.checkedSkills)[i])
         .then(function(rsp) {
            $http.post("Prjs/" + newPrjId +"/Skls", {sklId: rsp.data[0].id});
         });
      };
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
