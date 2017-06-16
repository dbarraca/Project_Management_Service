app.controller('myPrjOverviewController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
 'prjs', function($scope, $state, $stateParams, $http, $uibM, nDlg, prjs) {
   $scope.prjs = prjs;
   var ownerId = $stateParams.ownerId;

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
         return $http.get('/Prjs?user=' + ownerId);
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
         return $http.get('/Prjs?user=' + ownerId);
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
