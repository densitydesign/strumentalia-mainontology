'use strict';

/**
 * @ngdoc function
 * @name mainologyApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mainologyApp
 */
angular.module('mainologyApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
