'use strict';

angular.module('clientApp')
  .controller('UsersCtrl', function ($scope) {
    $scope.users = [
      { name: 'James', title: 'Bossman'},
      { name: 'Diego', title: 'Bossman'},
      { name: 'Kent', title: 'Bossman'}
    ];

    $scope.create = function () {
      var data = {
        name: $scope.userName,
        title: $scope.userTitle
      };

      console.log('create', data);
    };

    $scope.update = function (user) {
      var data = {
        name: user.name,
        title: user.title
      };

      console.log('update', data);
    };

    $scope.delete = function (user) {

    };
  });
