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
        $scope.pharmacyTemplate = _.template('Filled Prescriptions: <%= count %></br>');

        $scope.getContent = function(point)
        {
            var content = $scope.roomTemplate(point);
            if(point.occupant)
            {
              content = content.concat($scope.occupantTemplate(point.occupant));
            }

            if(point.department)
            {
              console.log("Has Department");
              content = content.concat($scope.departmentTemplate(point));

              if(point.department == "pharmacy")
              {
                 //content = content.concat($scope.pharmacyTemplate(point.prescription_count));
              }
            }
            return content;
        }

        $scope.overWaypoint = function (point) {
          // Room.get({ id: point.room_id }, function (room) {
          //   console.log(room);
          // });

          /*
              Pardon the nasty JQuery. Still learning Angular, and Just needed to get it
          */

          console.log(point);

          $( "#" + point._id).popover({
            content: $scope.getContent(point),
            html: true,
            placement: 'top',
            trigger: 'manual'
          });

          $( "#" + point._id).popover('show');

          //console.log(point);
          /*console.log($element);
          $element.popover({
            content: 'new content'
          });*/
          

          //$element.popover('show');
        };

        $scope.outWaypoint = function (point) {
          $( "#" + point._id).popover('hide');
        };
      }
    };
  });