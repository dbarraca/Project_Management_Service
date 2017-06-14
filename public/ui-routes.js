
app.config(['$stateProvider', '$urlRouterProvider',
   function($stateProvider, $router) {

      //redirect to home if path is not matched
      $router.otherwise("/");

      $stateProvider
      .state('home',  {
         url: '/',
         templateUrl: 'Home/home.template.html',
         controller: 'homeController',
      })
      .state('login', {
         url: '/login',
         templateUrl: 'Login/login.template.html',
         controller: 'loginController',
      })
      .state('register', {
         url: '/register',
         templateUrl: 'Register/register.template.html',
         controller: 'registerController',
      })
      .state('logout', {
         url: '/logout',
         templateUrl: 'Home/home.template.html',
         controller: 'logoutController',
      })

      .state('prjOverview', {
         url: '/prjs',
         templateUrl: 'Project/prjOverview.template.html',
         controller: 'prjOverviewController',
         resolve: {
            prjs: ['$q', '$http', function($q, $http) {
               return $http.get('/Prjs')
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })/*
      .state('myPrjOverview', {
         url: '/myPrjs/:ownerId',
         templateUrl: 'Project/prjOverview.template.html',
         controller: 'myPrjOverviewController',
         resolve: {
            prjs: ['$q', '$http', '$stateParams', 
             function($q, $http, $stateParams) {
               return $http.get('/Prjs?owner=' + $stateParams.ownerId)
               .then(function(response) {
                  return response.data;
               });
            }]
         }
      })*/
      .state('prjDetail', {
         url: '/prjs/:prjId',
         templateUrl: 'Project/prjDetail.template.html',
         controller: 'prjDetailController',
         /*resolve: {
            msgs: ['$q', '$http', '$stateParams',
             function($q, $http, $stateParams) {
               return $http.get('/Prjs/'+ $stateParams.prjId + '/Msgs')
               .then(function(response) {
                  return response.data;
               });
            }]
         }*/
      })
      .state('newProject', {
         url: '/new_project',
         templateUrl: 'Project/newProject.template.html',
         controller: 'newProjectController',
      });

   }]);
