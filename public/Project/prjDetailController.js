app.controller('prjDetailController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg', function($scope, $state, $stateParams, $http, $uibM, nDlg, ) {
   var prjId = $stateParams.prjId;

   $http.get("/Prjs/" + prjId)
   .then(function(rsp) {
      console.log("rsp.data.title" + rsp.data.title);
      $scope.title = rsp.data.title;
      $scope.type = rsp.data.type;
      $scope.description = rsp.data.description;
   })
   .then(function() {
      return $http.get("/Prjs/" + prjId + "/Skls/");
   })
   .then(function(sklIds) {
//console.log("sklIds.data[0] " + sklIds.data[0].sklId);
//console.log("sklIds.length " + sklIds.data.length);

      var sklArr = [];

      for(var i = 0; i < sklIds.data.length; i++) {
//console.log("one time in the loop");
//console.log("sklIds.data[i].sklId " + sklIds.data[i].sklId);
         $http.get("/Skls?sklId=" + sklIds.data[i].sklId)
         .then(function(rsp) {
//console.log("skill Name: " + rsp.data[0].name);
            sklArr.push(rsp.data[0].name);
         });
         $scope.skills = sklArr;
      }
   })
   .catch(function(err) {
      nDlg.show($scope, JSON.stringify(err));
   });
}]);

