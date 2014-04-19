'use strict';

angular.module('clientApp')
  .controller('UsersCtrl', function ($scope) {
    $scope.add = { role: -1 };
    $scope.sorter = 'login';

    $scope.users = [
      { login: 'jwilson', password: '123', first: 'James', last: 'Wilson', role: 'admin'},
      { login: 'dnetto', password: '123', first: 'Deigo', last: 'Netto', role: 'nurse'},
      { login: 'kgillenwater', password: '123', first: 'Kent', last: 'Gillenwater', role: 'doctor'}
    ];

    $scope.create = function () {
      $scope.users.push($scope.add);
      $scope.add = { userRole: -1 };
    };

    $scope.update = function (user) {
      var data = {
        login: user.login,
        password: user.password,
        first: user.first,
        last: user.last,
        role: user.role
      };

      console.log('update', data);
    };

    $scope.delete = function (user) {
      _.remove($scope.users, { login: user.login });
    };
  });
