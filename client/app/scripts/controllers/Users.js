'use strict';

angular.module('clientApp')
  .controller('UsersCtrl', function ($scope, User) {
    var users = User.get({}, function () {
      $scope.users = users;
    });

    $scope.add = { role: -1 };
    $scope.sorter = 'login';

    $scope.create = function () {
      var user = new User($scope.add);
      user.$save();

      $scope.users.push($scope.add);
      $scope.add = { userRole: -1 };
    };

    $scope.update = function (user) {
      User.update({ id: user._id }, {
        username: user.username,
        password: user.password,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      });

      user.editActive = false;
    };

    $scope.delete = function (user) {
      User.remove({ id: user._id });

      _.remove($scope.users, { _id: user._id });
    };
  });
