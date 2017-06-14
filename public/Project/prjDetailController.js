app.controller('prjDetailController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
 'msgs',function($scope, $state, $stateParams, $http, $uibM, nDlg, msgs) {
   var prjId = $stateParams.prjId;

//   $scope.msgs = msgs;

   $http.get("/Prjs/" + prjId)
   .then(function(rsp) {
      $scope.prjTitle = rsp.data.title;
   });
/*
   $scope.newMsg = function() {
      $http.post("/Prjs/" + prjId +"/Msgs", {content: $scope.newMsgContent})
      .then(function() {
         return $http.get("/Prjs/" + prjId +"/Msgs");
      })
      .then(function(rsp) {
         $scope.msgs = rsp.data;

      })
      .catch(function(err) {
         nDlg.show($scope, JSON.stringify(err));
      });
   };*/
}]);
