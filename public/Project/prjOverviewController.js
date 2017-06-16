app.controller('prjOverviewController',
 ['$scope', '$state', '$http','$uibModal', 'notifyDlg', 'prjs',
 function($scope, $state, $http, $uibM, nDlg, prjs) {
   $scope.prjs = prjs;
   $scope.skillSelections = [];

   $http.get("/Skls")
   .then(function(rsp) {
      $scope.skillSelections = rsp.data;
      $scope.skillSelections.unshift({id: "", name: "All"});
   });

   $scope.filterProjs = function() {
      $http.get('/Prjs?skill=' + $scope.selectedSkill)
      .then(function(rsp) {
         $scope.prjs = rsp.data;
      });
   };

   $scope.delPrj = function(index) {
      var selectedTitle = $scope.prjs[index].title;
      var selectedTitleId = $scope.prjs[index].id;

      nDlg.show($scope, "Delete project " + selectedTitle +
       "?", "Verify", ["Yes", "No"])
      .then(function(btn) {
         if (btn === "Yes") {
            return $http.delete("Prjs/" + selectedTitleId);
         }
         else {
            $state.go('prjOverview');
         }
      })
      .then(function() {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         $scope.prjs = rsp.data;
      });
   };

   $scope.editPrj = function(index) {
      $scope.title = null;
      $scope.dlgTitle = "Edit Project";

      var selectedTitle;

      $uibM.open({
         templateUrl: 'Project/editPrjDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         return $http.put("Prjs/" + $scope.prjs[index].id, {title: newTitle});
      })
      .then(function () {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         $scope.prjs = rsp.data;
      })
      .catch(function(err) {
         if (err && err.data[0].tag == "dupTitle") {
            nDlg.show($scope, "Another project already has title " +
             selectedTitle, "Error");
         }
      });
   };
}]);
