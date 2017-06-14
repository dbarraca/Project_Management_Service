
var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);
/*
app.constant("errMap", {
   missingField: 'Field missing from request: ',
   badValue: 'Field has bad value: ',
   notFound: 'Entity not present in DB',
   badLogin: 'Email/password combination invalid',
   dupEmail: 'Email duplicates an existing email',
   noTerms: 'Acceptance of terms is required',
   forbiddenRole: 'Role specified is not permitted.',
   noOldPwd: 'Change of password requires an old password',
   oldPwdMismatch: 'Old password that was provided is incorrect.',
   dupTitle: 'Project title duplicates an existing one',
   dupEnrollment: 'Duplicate enrollment',
   forbiddenField: 'Field in body not allowed.',
   queryFailed: 'Query failed (server problem).'
});
*/

app.filter('tagError', ['errMap', '$rootScope', function(errMap, $rootScope) {
   return function(err) {
      return $rootScope.langs[$rootScope.currLang] + errMap[err.tag] 
       + (err.params && err.params.length ? err.params[0] : "");
   };
}]);

app.directive('prjSummary', [function() {
   return {
      restrict: 'E',
      scope: {
         prj: "=toSummarize",
         user: '@',
      },
      template: '<a  href="#" ui-sref="prjDetail({prjId: {{prj.id}}})">'
       + '{{prj.title}}</a>'
 /*      + '<button type="button" class="btn btn-default pull-right" '
       + 'ng-show="user == prj.ownerId" ng-click="del($index)">'
       + '<span class="glyphicon glyphicon-trash"></span>'
       + '</button>'
       + '<button type="button" class="btn btn-default btn-sm pull-right" '
       + 'ng-show="user == prj.ownerId" ng-click="edit($index)">'
       + '<span class="glyphicon glyphicon-edit"></span></button>'*/
       + '<div>{{prj.type}}</div>'
   };
}]);