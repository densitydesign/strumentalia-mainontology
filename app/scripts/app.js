'use strict';

/**
 * @ngdoc overview
 * @name mainologyApp
 * @description
 * # mainologyApp
 *
 * Main module of the application.
 */
angular
  .module('mainologyApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider,$logProvider) {
    $logProvider.debugEnabled(true);
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'AltCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
