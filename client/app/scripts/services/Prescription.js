'use strict';

angular.module('clientApp')
  .factory('Prescription', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/prescription/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
