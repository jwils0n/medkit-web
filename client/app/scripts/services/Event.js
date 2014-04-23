'use strict';

angular.module('clientApp')
  .factory('Event', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/event/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
