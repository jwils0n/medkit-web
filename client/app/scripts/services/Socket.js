'use strict';

angular.module('clientApp')
  .factory('Socket', function ($rootScope) {
    var socket = io.connect('http://192.168.1.148:8080');
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