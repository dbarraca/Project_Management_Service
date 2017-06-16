app.controller('prjDetailController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
  function($scope, $state, $stateParams, $http, $uibM, nDlg) {
   var prjId = $stateParams.prjId;

   $http.get("/Prjs/" + prjId)
   .then(function(rsp) {
      $scope.title = rsp.data.title;
      $scope.type = rsp.data.type;
      $scope.description = rsp.data.description;
      $scope.isOwner = false;
      if (rsp.data.ownerId === $scope.user.id) {
         $scope.isOwner = true;
      }

      return $http.get("/Prjs/" + prjId + "/Usrs");
   })
   .then(function(rsp) {
      $scope.participant = false;
      for (var i = 0; i < rsp.data.length; i++) {
         if (rsp.data[i].usrId === $scope.user.id) {
            $scope.participant = true;
         }
      }
      return $http.get("/Prjs/" + prjId + "/Skls/");
   })
   .then(function(sklIds) {
      var sklArr = [];

      for (var i = 0; i < sklIds.length; i++) {
         $http.get("/Skls?sklId=" + sklIds.data[i].sklId)
         .then(function(rsp) {
            sklArr.push(rsp.data[0].name);
         });
         $scope.skills = sklArr;
      }
   })
   .catch(function(err) {
      console.log(err);
   });


   $scope.addUsrToPrj = function() {

      $http.post("Prjs/" + prjId + "/Usrs/", {email: $scope.user.email})
      .then(function(rsp) {
         $scope.participant = true;
      })
      .catch(function(err) {
         console.log(err);
      });
   };

   $scope.removeUsrFromPrj = function() {

      $http.delete("Prjs/" + prjId + "/Usrs/" + $scope.user.id)
      .then(function(rsp) {
         $scope.participant = false;
      })
      .catch(function(err) {
         console.log(err);
      });
   };

}]);
