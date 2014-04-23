'use strict';

angular.module('clientApp')
  .factory('Patient', function ($resource) {
    return $resource('//medkit-api.blacklitelabs.com/patient/:id', { id:'@id' }, {
      get: { isArray: true },
      update: { method: 'PUT' },
      remove: { method: 'DELETE' }
    });
  });
