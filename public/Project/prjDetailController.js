app.controller('prjDetailController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg', function($scope, $state, $stateParams, $http, $uibM, nDlg, ) {
   var prjId = $stateParams.prjId;
//   $scope.skills = skls;
   //$scope.description = "dummyDescription in prjDetailController";

   $http.get("/Prjs/" + prjId)
   .then(function(rsp) {
      console.log("rsp.data.title" + rsp.data.title);
      $scope.title = rsp.data.title;
      $scope.type = rsp.data.type;
      $scope.description = rsp.data.description;
   })
   .catch(function(err) {
      nDlg.show($scope, JSON.stringify(err));
   });
}]);
