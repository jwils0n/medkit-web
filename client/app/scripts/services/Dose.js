'use strict';

angular.module('clientApp')
  .factory('Dose', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/dose/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
