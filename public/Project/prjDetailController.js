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
   .then(function(rsp) {
      $scope.skills = [{id:1}, {id:2}];
/*
   .then(function(rsp) {
      return $http.get("/Prjs/" + prjId + "/skls/");
   })
   .then(function(rsp) {
      $scope.skills = rsp;
   })*/
   })
   .catch(function(err) {
      nDlg.show($scope, JSON.stringify(err));
   });
}]);
