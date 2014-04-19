'use strict';

angular
  .module('clientApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UsersCtrl'
      })
      .when('/medications', {
        templateUrl: 'views/medications.html',
        controller: 'MedicationsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function ($rootScope) {
    $rootScope.$on('$routeChangeSuccess', function(ev, data) {
     if (data.$$route && data.$$route.controller) {
       $rootScope.controller = data.$$route.controller;
     }
    });
  });
