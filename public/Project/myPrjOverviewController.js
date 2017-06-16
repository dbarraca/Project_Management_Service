app.controller('myPrjOverviewController',
 ['$scope', '$state', '$stateParams', '$http', '$uibModal', 'notifyDlg',
 'prjs', function($scope, $state, $stateParams, $http, $uibM, nDlg, prjs) {
   $scope.prjs = prjs;
   var ownerId = $stateParams.ownerId;

   
}]);
