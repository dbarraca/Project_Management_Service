app.controller('prjDetailController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
  function($scope, $state, $stateParams, $http, $uibM, nDlg) {
   var prjId = $stateParams.prjId;
   //$scope.skills = skls;
   //$scope.description = "dummyDescription in prjDetailController";

   $http.get("/Prjs/" + prjId)
   .then(function(rsp) {
      //console.log("rsp.data.title" + rsp.data.title);
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
   // .then(function(rsp) {
   //    return $http.get("/Prjs/" + prjId + "/Skls/");
   // })
   // .then(function(rsp) {
   //    console.log("rsp.data[0].sklId " + rsp.data[0].sklId);
   //    console.log("rsp.data[0].sklId " + rsp.data[1].sklId);
   // })
   .catch(function(err) {
      //nDlg.show($scope, JSON.stringify(err));
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
