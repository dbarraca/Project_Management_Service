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
/*   .then(function(rsp) {
      return [{id:1}, {id:2}];
   })
   .then(function(sklIds) {
      var sklArr = [];
      console.log("sklIds.length" + sklIds.length);
      /*
      for(var i = 0; i < sklIds.length; i++) {
         console.log("sklId: " + sklIds[i].id);
         sklArr.push(sklIds[i].id);
         console.log($http.get("/Skls/", {sklId: sklIds[0].id}).data.name);
      }
      return sklArr;
   })
*/
   .then(function(rsp) {
      return $http.get("/Prjs/" + prjId + "/Skls/");
   })
   .then(function(rsp) {
      console.log("rsp.data[0].sklId " + rsp.data[0].sklId);
      console.log("rsp.data[0].sklId " + rsp.data[1].sklId);
   })
   .catch(function(err) {
      nDlg.show($scope, JSON.stringify(err));
   });
}]);
