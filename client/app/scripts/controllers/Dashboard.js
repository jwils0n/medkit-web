'use strict';

angular.module('clientApp')
  .controller('DashboardCtrl', function ($scope, Socket) {
    $scope.mapWaypoints = [
      { room_id: 1, x: 136, y: 29 },
      { room_id: 2, x: 154, y: 29 },
      { room_id: 3, x: 179, y: 29 },
      { room_id: 4, x: 196, y: 29 },
      { room_id: 5, x: 223, y: 29 },
      { room_id: 6, x: 239, y: 29 },
      { room_id: 7, x: 266, y: 29 },
      { room_id: 8, x: 283, y: 29 },
      { room_id: 9, x: 309, y: 29 },
      { room_id: 10, x: 325, y: 29 },
      { room_id: 11, x: 136, y: 70 },
      { room_id: 12, x: 154, y: 70 },
      { room_id: 13, x: 179, y: 70 },
      { room_id: 14, x: 196, y: 70 },
      { room_id: 15, x: 223, y: 70 },
      { room_id: 15, x: 246, y: 70 },
      { room_id: 15, x: 279, y: 70 },
      { room_id: 15, x: 158, y: 179 },
      { room_id: 15, x: 173, y: 179 },
      { room_id: 15, x: 189, y: 179 },
      { room_id: 15, x: 205, y: 179 },
      { room_id: 15, x: 221, y: 179 },
      { room_id: 15, x: 237, y: 179 },
      { room_id: 15, x: 253, y: 179 },
      { room_id: 15, x: 142, y: 228 },
      { room_id: 15, x: 158, y: 228 },
      { room_id: 15, x: 173, y: 228 },
      { room_id: 15, x: 189, y: 228 },
      { room_id: 15, x: 205, y: 228 },
      { room_id: 15, x: 221, y: 228 },
      { room_id: 15, x: 237, y: 228 },
      { room_id: 15, x: 253, y: 228 },
      { room_id: 15, x: 277, y: 228 },
      { room_id: 15, x: 277, y: 251 },
      { room_id: 15, x: 277, y: 268 },
      { room_id: 15, x: 277, y: 286 },
      { room_id: 15, x: 277, y: 303 },
      { room_id: 15, x: 354, y: 59 },
      { room_id: 15, x: 329, y: 95 },
      { room_id: 15, x: 329, y: 111 },
      { room_id: 15, x: 329, y: 127 },
      { room_id: 15, x: 321, y: 147 },
      { room_id: 15, x: 357, y: 157 },
      { room_id: 15, x: 373, y: 157 },
      { room_id: 15, x: 390, y: 157 },
      { room_id: 15, x: 408, y: 157 },
      { room_id: 15, x: 325, y: 219 },
      { room_id: 15, x: 325, y: 235 },
      { room_id: 15, x: 325, y: 251 },
      { room_id: 15, x: 325, y: 268 },
      { room_id: 15, x: 325, y: 286 },
      { room_id: 15, x: 325, y: 303 },
      { room_id: 15, x: 380, y: 261 },
      { room_id: 15, x: 390, y: 347 },
      { room_id: 15, x: 336, y: 354 },
      { room_id: 15, x: 519, y: 350 },
      { room_id: 15, x: 568, y: 350 },
      { room_id: 15, x: 459, y: 295 },
      { room_id: 15, x: 481, y: 185 },
      { room_id: 15, x: 508, y: 107 },
      { room_id: 15, x: 557, y: 116 },
      { room_id: 15, x: 632, y: 116 },
      { room_id: 15, x: 587, y: 186 },
      { room_id: 15, x: 617, y: 266 },
    ];

    $scope.eventFeed = [];

    Socket.on('event', eventFeedHandler);
    Socket.on('patient', eventFeedHandler);
    Socket.on('dose', eventFeedHandler);

    function eventFeedHandler (data) {
      var formats = {
        patient: function (data) {
          return 'Patient ' + data.first_name + ' ' + data.last_name + ' was ' + data.method;
        },
        dose: function (data) {
          return 'A dose was administered';
        },
        event: function (data) {
          return 'An event was triggered?';
        }
      };

      var methods = {
        POST: 'created',
        PUT: 'updated',
        DELETE: 'removed'
      };

      data.obj.method = methods[data.method];
      $scope.eventFeed.push({
        msg: formats[data.model](data.obj),
        time: moment().format('h:mm a')
      });
    }
  });
