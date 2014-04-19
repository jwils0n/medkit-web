'use strict';

angular.module('clientApp')
  .factory('Room', function ($resource) {
    return $resource('//192.168.1.148:8080/room/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });