'use strict';

angular.module('clientApp')
  .factory('Room', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/room/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
