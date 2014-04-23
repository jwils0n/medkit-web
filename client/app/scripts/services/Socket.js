'use strict';

angular.module('clientApp')
  .factory('Socket', function ($rootScope) {
    var socket = io.connect('http://medkit-api.blacklitelabs.com');
    var registeredChannels = [];
    return {
      on: function (eventName, callback) {
        if (_.indexOf(registeredChannels, eventName) !== -1) {
          return;
        }
        registeredChannels.push(eventName);

        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });
