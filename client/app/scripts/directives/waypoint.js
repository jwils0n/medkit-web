'use strict';

angular.module('clientApp')
  .directive('waypoint', function (Room) {
    return {
      template: '<span ng-mouseover="overWaypoint(point)" class="glyphicon glyphicon-record" style="top:{{point.y}}px;left:{{point.x}}px"></span>',
      restrict: 'E',
      link: function ($scope, $element) {
        $element.popover({
          content: 'TEST',
          html: true,
          placement: 'top',
          trigger: 'manual'
        });

        $scope.overWaypoint = function (point) {
          // Room.get({ id: point.room_id }, function (room) {
          //   console.log(room);
          // });
          $element.popover({
            content: 'new content'
          });
          

          $element.popover('show');
        };
      }
    };
  });