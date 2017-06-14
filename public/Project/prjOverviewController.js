app.controller('prjOverviewController',
 ['$scope', '$state', '$http','$uibModal', 'notifyDlg', 'prjs',
 function($scope, $state, $http, $uibM, nDlg, prjs) {
   $scope.prjs = prjs;
/*
   $scope.userId = 'test';

   $scope.delPrj = function(index) {
      $http.get('/Prjs')
      .then(function(rsp) {
         $scope.dlgTitle = rsp.data[index].title;
      });


      $uibM.open({
         templateUrl: 'Project/delPrjDlg.template.html',
         scope: $scope
      }).result
      .then(function() {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         $http.delete("Prjs/" + rsp.data[index].id)
      })
      .then(function() {
         $state.reload();
      })
      .catch(function(err) {
      });;
   }

   $scope.editPrj = function(index) {
      $scope.dlgTitle = "Edit Project";
      var inputTitle;
      var selectedTitle;

      $uibM.open({
         templateUrl: 'Project/editPrjDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         selectedTitle = newTitle;
         inputTitle = newTitle;
      })
      .then(function() {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         return $http.put("Prjs/" + rsp.data[index].id, {title: inputTitle});
      })
      .then(function() {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         $scope.prjs = rsp.data;
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another project already has title "
             + selectedTitle, "Error");
      });
   };

   $scope.newPrj = function() {
      $scope.title = null;
      $scope.dlgTitle = "New Project";
      var selectedTitle;
      console.log("new project button pressed");

      $uibM.open({
         templateUrl: 'Project/editPrjDlg.template.html',
         scope: $scope
      }).result
      .then(function(newTitle) {
         console.log("type " + newType);
         selectedTitle = newTitle;
         return $http.post("/Prjs", {title: newTitle, type: newType});
      })
      .then(function() {
         return $http.get('/Prjs');
      })
      .then(function(rsp) {
         $scope.prjs = rsp.data;
      })
      .catch(function(err) {
         if (err.data[0].tag == "dupTitle")
            nDlg.show($scope, "Another project already has title "
             + selectedTitle, "Error");
      });
   };*/
}]);
