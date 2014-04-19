'use strict';

angular.module('clientApp')
  .directive('waypoint', function (Room) {
    return {
      template: '<span id="{{point._id}}" ng-mouseover="overWaypoint(point)" ng-mouseleave="outWaypoint(point)" class="glyphicon {{point.icon}}" style="top:{{point.y}}px;left:{{point.x}}px"></span>',
      restrict: 'E',
      link: function ($scope, $element) {
        $element.popover({
          content: 'TEST',
          html: true,
          placement: 'top',
          trigger: 'manual'
        });

        $scope.roomTemplate = _.template('id: <%= _id %> </br>  Room: <%= number %> </br> ');
        $scope.occupantTemplate = _.template('Occupant: <%= last_name %>, <%= first_name %> </br> ');
        $scope.departmentTemplate = _.template('Department: <%= department %></br>');
        $scope.pharmacyTemplate = _.template('Filled Prescriptions: <%= prescription_count %></br>');

        $scope.getContent = function(point) {
            var content = $scope.roomTemplate(point);
            if(point.occupant) {
              content = content.concat($scope.occupantTemplate(point.occupant));
            }

            if(point.department) {
              content = content.concat($scope.departmentTemplate(point));

              if(point.department == "pharmacy") {
                 content = content.concat($scope.pharmacyTemplate(point));
              }
            }
            return content;
        };

        $scope.overWaypoint = function (point) {
          $( "#" + point._id).popover({
            content: $scope.getContent(point),
            html: true,
            placement: 'top',
            trigger: 'manual'
          });

          $( "#" + point._id).popover('show');
        };

        $scope.outWaypoint = function (point) {
          $( "#" + point._id).popover('hide');
        };
      }
    };
  });