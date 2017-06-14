app.controller('myCnvOverviewController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
 'cnvs', function($scope, $state, $stateParams, $http, $uibM, nDlg, cnvs) {
   $scope.cnvs = cnvs;
   var ownerId = $stateParams.ownerId;

   $scope.delCnv = function(index) {
      $http.get('/Cnvs?owner=' + ownerId)
      .then(function(rsp) {
         $scope.dlgTitle = rsp.data[index].title;
      });

      $uibM.open({
         templateUrl: 'Conversation/delCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $http.delete("Cnvs/" + rsp.data[index].id)
      })
      .then(function() {
         $state.reload();
      })
      .catch(function(err) {
      });
   }

   $scope.editCnv = function(index) {
      $scope.dlgTitle = "Edit Conversation";
      var inputTitle;
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         inputTitle = newTitle;
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         return $http.put("Cnvs/" + $scope.cnvs[index].id,
          {title: inputTitle});
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
         $state.reload();
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
             + selectedTitle, "Error");
      });
   };

   $scope.newCnv = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Conversation";
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Conversation/editCnvDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         return $http.post("Cnvs", {title: newTitle});
      })
      .then(function() {
         return $http.get('/Cnvs');
      })
      .then(function(rsp) {
         $scope.cnvs = rsp.data;
         $state.go('myCnvOverview');
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another conversation already has title "
             + selectedTitle, "Error");
      });
   };
}]);
